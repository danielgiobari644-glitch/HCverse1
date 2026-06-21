/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Gracefully handle and suppress benign websocket issues in the dev environment
window.addEventListener('unhandledrejection', event => {
  const reason = event.reason;
  if (reason) {
    const reasonStr = String(reason).toLowerCase();
    const reasonMsgStr = reason.message ? String(reason.message).toLowerCase() : '';
    if (
      reasonStr.includes('websocket') || 
      reasonMsgStr.includes('websocket') ||
      reasonStr.includes('closed without opened') ||
      reasonMsgStr.includes('closed without opened') ||
      reasonStr.includes('vite') ||
      reasonMsgStr.includes('vite')
    ) {
      event.preventDefault(); // Suppress to prevent annoying development crash overlays
      console.debug('Muted benign development WebSocket rejection:', reason);
    }
  }
});

window.addEventListener('error', event => {
  if (event.message) {
    const msgStr = String(event.message).toLowerCase();
    if (
      msgStr.includes('websocket') ||
      msgStr.includes('closed without opened') ||
      msgStr.includes('vite')
    ) {
      event.preventDefault(); // Suppress the benign websocket error
      console.debug('Muted benign development error:', event.message);
    }
  }
});

import { auth, db, handleFirestoreError, OperationType } from './firebase.js';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  addDoc, 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  where, 
  increment, 
  arrayUnion, 
  arrayRemove, 
  deleteDoc, 
  limit
} from 'firebase/firestore';

import { 
  renderAppShell, 
  renderHome, 
  renderProfile, 
  renderNotifications 
} from './home.js';
import { 
  renderLanding, 
  renderLogin, 
  renderSignup, 
  renderForgotPassword, 
  renderOnboarding 
} from './auth.js';
import { 
  renderCells, 
  renderCellPage, 
  renderChat, 
  renderResources 
} from './community.js';
import { 
  renderBible, 
  renderDevotionals, 
  renderQuiz, 
  renderPrayerRoom 
} from './spirituality.js';
import { 
  renderPostFeed, 
  renderPostEditor 
} from './feed.js';
import { 
  renderAdmin, 
  renderAiAssistant 
} from './admin.js';
import { renderDownloads } from './downloads.js';
import { 
  renderEvents 
} from './events.js';
import {
  renderLiveRoom,
  registerStateRef,
  triggerFloatingReaction,
  renderLiveMessageItem
} from './live_rooms.js';

import { SCRIPTURES, QUIZ_QUESTIONS, SUPER_ADMIN_EMAIL } from './constants.js';
import { fetchChapterText } from './bible_books.js';
import { ICONS } from './icons.js';

// Import index styles through HTML link, no JS import needed to avoid bundler conflicts


// --------------------------------------------------------------------------
// STATE SYSTEM
// --------------------------------------------------------------------------
let activeWebcamStream = null;

function stopActiveWebcamStream() {
  if (activeWebcamStream) {
    activeWebcamStream.getTracks().forEach(track => {
      try {
        track.stop();
      } catch (e) {
        console.warn(e);
      }
    });
    activeWebcamStream = null;
  }
}

const state = {
  user: null,
  userProfile: null,
  authLoading: true,
  currentView: 'landing',
  previousView: 'landing',
  
  // Scriptural indices
  scriptureIndex: 0,
  
  // Auth Form parameters
  authError: null,
  authSubmitting: false,
  forgotSuccess: false,
  onboardingCellAction: 'none',
  
  // Database containers (Real-time synced)
  posts: [],
  messages: [],
  prayers: [],
  events: [],
  cells: [],
  resources: [],
  devotionals: [],
  notifications: [],
  users: [],
  qaLibrary: [],
  downloadLinks: [],
  
  // Localized filters
  cellsSearchQuery: '',
  cellPageTab: 'overview',
  resourcesQuery: '',
  resourcesType: 'all',
  prayersCategory: 'all',
  selectedCellId: null,
  selectedDevotionalId: null,
  adminTab: 'users',
  
  // Theme Controls
  appTheme: 'purple',
  darkMode: true,
  sidebarCollapsed: false,
  
  // Quiz Module
  quizActive: false,
  quizQuestions: [],
  quizQuestionsList: [],
  quizQuestionIndex: 0,
  quizScore: 0,
  quizTimer: 15,
  quizIntervalId: null,
  
  // AI assistant chat history
  aiMessages: [],
  unreadCount: 0
};

// Subscriptions storage
const activeSubscriptions = {};

// --------------------------------------------------------------------------
// THEME & SWATCH APPLY UTILITY
// --------------------------------------------------------------------------
const THEME_CONFIGS = {
  purple: { primary: '#7c3aed', primaryLight: '#c4b5fd' },
  blue: { primary: '#2563eb', primaryLight: '#93c5fd' },
  green: { primary: '#16a34a', primaryLight: '#86efac' },
  rose: { primary: '#db2777', primaryLight: '#fbcfe8' },
  amber: { primary: '#d97706', primaryLight: '#fde68a' },
  indigo: { primary: '#4f46e5', primaryLight: '#c7d2fe' }
};

function applyDynamicTheme(themeName, isDark) {
  const root = document.documentElement;
  const config = THEME_CONFIGS[themeName] || THEME_CONFIGS.purple;
  
  if (isDark) {
    root.classList.add('dark');
    root.style.setProperty('--background', '#080714');
    root.style.setProperty('--foreground', '#FFFFFF');
    root.style.setProperty('--card', '#0d0b1f');
    root.style.setProperty('--primary', config.primaryLight || '#A78BFA');
    root.style.setProperty('--primary-foreground', '#080714');
    root.style.setProperty('--border', 'rgba(167, 139, 250, 0.08)');
    root.style.setProperty('--ring', config.primaryLight || '#A78BFA');
    root.style.setProperty('--spiritual', config.primaryLight || '#A78BFA');
    root.style.setProperty('--glass', 'rgba(13, 11, 31, 0.65)');
    root.style.setProperty('--glass-strong', 'rgba(17, 14, 41, 0.88)');
    root.style.setProperty('--sidebar', '#0b0918');
  } else {
    root.classList.remove('dark');
    root.style.setProperty('--background', '#FCFCFD');
    root.style.setProperty('--foreground', '#09090B');
    root.style.setProperty('--card', 'rgba(255, 255, 255, 0.82)');
    root.style.setProperty('--primary', config.primary || '#7C3AED');
    root.style.setProperty('--primary-foreground', '#FCFCFD');
    root.style.setProperty('--border', 'rgba(167, 139, 250, 0.1)');
    root.style.setProperty('--ring', config.primary || '#7C3AED');
    root.style.setProperty('--spiritual', config.primary || '#7C3AED');
    root.style.setProperty('--glass', 'rgba(255, 255, 255, 0.7)');
    root.style.setProperty('--glass-strong', 'rgba(255, 255, 255, 0.9)');
    root.style.setProperty('--sidebar', '#FCFCFD');
  }
}

// --------------------------------------------------------------------------
// BIBLE TEXT CHANGER UTILITY
// --------------------------------------------------------------------------
async function syncBibleText() {
  state.bibleLoading = true;
  updateUI();
  try {
    const verses = await fetchChapterText(state.bibleBook || "John", state.bibleChapter || 1);
    state.bibleVerses = verses;
  } catch (err) {
    console.error("Scriptures sync error:", err);
  } finally {
    state.bibleLoading = false;
    updateUI();
  }
}

// --------------------------------------------------------------------------
// STATE TRANSITIONS & NAVIGATION
// --------------------------------------------------------------------------
export function gotoView(view, args = {}) {
  // Clear modal hooks or countdowns when switching views
  if (view !== 'quiz') {
    stopQuizTimer();
  }

  // Handle departing Live Chambers view to kill camera feeds
  if (state.currentView === 'live-room' && view !== 'live-room') {
    stopActiveWebcamStream();
    if (activeSubscriptions.liveChats) {
      activeSubscriptions.liveChats();
      delete activeSubscriptions.liveChats;
    }
    if (activeSubscriptions.liveReactions) {
      activeSubscriptions.liveReactions();
      delete activeSubscriptions.liveReactions;
    }
  }

  state.previousView = state.currentView;
  state.currentView = view;
  
  // Map additional args to state
  Object.assign(state, args);

  // Auto trigger live room sync
  if (view === 'live-room') {
    subscribeLiveRoom(state.liveRoomTab || 'discussion');
  }

  // Trigger special sync triggers
  if (view === 'bible' && (!state.bibleVerses || state.bibleVerses.length === 0)) {
    syncBibleText();
  }

  // Auto clean notifications unread upon entering notifications view
  if (view === 'notifications') {
    clearNotificationCount();
  }

  updateUI();
}

async function clearNotificationCount() {
  state.unreadCount = 0;
  // Mark all unread notifications in Firestore as read
  const unreads = state.notifications.filter(n => !n.read);
  for (const n of unreads) {
    try {
      await updateDoc(doc(db, 'notifications', n.id), { read: true });
    } catch (err) {
      console.warn("Notification read clear error:", err);
    }
  }
}

// --------------------------------------------------------------------------
// BIBLE QUIZ STATE MECHANICS
// --------------------------------------------------------------------------
function stopQuizTimer() {
  if (state.quizIntervalId) {
    clearInterval(state.quizIntervalId);
    state.quizIntervalId = null;
  }
}

function startQuizTimer() {
  stopQuizTimer();
  state.quizTimer = 15;
  state.quizIntervalId = setInterval(() => {
    state.quizTimer--;
    if (state.quizTimer <= 0) {
      handleQuizAnswer(-1); // Automatically Incorrect when timer exhausts
    } else {
      const timerBar = document.getElementById('quiz-timer-bar');
      const timerText = document.getElementById('quiz-countdown-timer-text');
      if (timerBar && timerText) {
        const widthPct = Math.round((state.quizTimer / 15) * 100);
        timerBar.style.width = `${widthPct}%`;
        timerText.textContent = `${state.quizTimer}s`;
        if (state.quizTimer <= 5) {
          timerBar.classList.remove('bg-gradient-spiritual');
          timerBar.classList.add('bg-red-500');
        }
      }
    }
  }, 1000);
}

function startQuizRound() {
  // Take 10 questions randomly from localized custom database list, fallback to compiled list
  const source = (state.quizQuestionsList && state.quizQuestionsList.length > 0) ? state.quizQuestionsList : QUIZ_QUESTIONS;
  const shuffled = [...source].sort(() => 0.5 - Math.random()).slice(0, 10);
  state.quizQuestions = shuffled;
  state.quizQuestionIndex = 0;
  state.quizActive = true;
  state.quizScore = 0;
  
  startQuizTimer();
  updateUI();
}

async function handleQuizAnswer(idx) {
  stopQuizTimer();
  const currentQ = state.quizQuestions[state.quizQuestionIndex];
  
  if (idx === currentQ.correctAnswer) {
    state.quizScore++;
  }

  // Advance question indices
  state.quizQuestionIndex++;
  
  if (state.quizQuestionIndex < state.quizQuestions.length) {
    startQuizTimer();
  } else {
    // Game completed - Save top score to Firestore profile
    stopQuizTimer();
    state.quizActive = true;
    if (state.quizScore > (state.userProfile?.quizScore || 0)) {
      try {
        await updateDoc(doc(db, 'users', state.user.uid), {
          quizScore: state.quizScore
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${state.user.uid}`);
      }
    }
  }
  updateUI();
}

// --------------------------------------------------------------------------
// CORE REAL-TIME BROADCAST SYNC LISTENERS
// --------------------------------------------------------------------------
function unsubscribeAll() {
  Object.keys(activeSubscriptions).forEach(key => {
    if (activeSubscriptions[key]) {
      activeSubscriptions[key]();
      delete activeSubscriptions[key];
    }
  });
}

function subscribeLiveRoom(roomId) {
  // 1. Live Chat Subscription Updates
  if (activeSubscriptions.liveChats) {
    try { activeSubscriptions.liveChats(); } catch (e) {}
    delete activeSubscriptions.liveChats;
  }
  activeSubscriptions.liveChats = onSnapshot(
    query(
      collection(db, 'live_room_chats'),
      where('roomId', '==', roomId),
      orderBy('createdAt', 'asc'),
      limit(80)
    ),
    snap => {
      state.liveChats = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const chatFeedEl = document.getElementById('live-chat-messages');
      if (chatFeedEl) {
        chatFeedEl.innerHTML = state.liveChats.map(renderLiveMessageItem).join('');
        chatFeedEl.scrollTop = chatFeedEl.scrollHeight;
      }
    },
    err => console.error("Live room chat subscription issue:", err)
  );

  // 2. Live Reactions / Floating Emojis Count Listener
  if (activeSubscriptions.liveReactions) {
    try { activeSubscriptions.liveReactions(); } catch (e) {}
    delete activeSubscriptions.liveReactions;
  }
  activeSubscriptions.liveReactions = onSnapshot(
    doc(db, 'live_reactions', roomId),
    snap => {
      if (snap.exists()) {
        const data = snap.data();
        const prev = state.liveEmojis || {};
        state.liveEmojis = data;
        
        // Trigger floating movement mechanics if reaction counts increased
        const emojiMap = { amen: '🙏', love: '💖', fire: '🔥', praise: '✨', hallelujah: '🙌' };
        Object.keys(emojiMap).forEach(key => {
          if (data[key] > (prev[key] || 0)) {
            const diff = data[key] - (prev[key] || 0);
            for (let i = 0; i < Math.min(diff, 3); i++) {
              triggerFloatingReaction(emojiMap[key]);
            }
          }
        });

        // Sync local badge labels
        Object.keys(emojiMap).forEach(key => {
          const badgeElement = document.getElementById(`reaction-badge-${key}`);
          if (badgeElement) {
            badgeElement.textContent = data[key] || 0;
          }
        });
      } else {
        // Automatically default doc if missing
        setDoc(doc(db, 'live_reactions', roomId), {
          amen: 0, love: 0, fire: 0, praise: 0, hallelujah: 0, speak: 0
        }).catch(err => console.warn(err));
      }
    }
  );
}

function initializeRealTimeSyncs(user) {
  unsubscribeAll();

  // 1. User Profile Sync Listener
  activeSubscriptions.userProfile = onSnapshot(doc(db, 'users', user.uid), snap => {
    if (snap.exists()) {
      state.userProfile = snap.data();
      state.darkMode = state.userProfile?.darkMode !== false;
      state.appTheme = state.userProfile?.appTheme || 'purple';
      applyDynamicTheme(state.appTheme, state.darkMode);
      
      // If user profile is empty or standard onboarding steps incomplete, redirect to Onboarding
      if (!state.userProfile.displayName && state.currentView !== 'onboarding') {
        gotoView('onboarding');
      } else if (state.currentView === 'landing' || state.currentView === 'login' || state.currentView === 'signup') {
        gotoView('home');
      }
    } else {
      // Setup Initial draft Profile schema
      const isSuper = user.email === SUPER_ADMIN_EMAIL;
      const initialProfile = {
        uid: user.uid,
        displayName: user.displayName || '',
        email: user.email,
        role: isSuper ? 'super_admin' : 'member',
        cellId: '',
        bio: '',
        location: '',
        phone: '',
        devotionStreak: 1,
        quizScore: 0,
        createdAt: new Date().toISOString()
      };
      
      setDoc(doc(db, 'users', user.uid), initialProfile)
        .then(() => {
          state.userProfile = initialProfile;
          gotoView('onboarding');
        })
        .catch(err => handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`));
    }
    updateUI();
  }, err => handleFirestoreError(err, OperationType.GET, `users/${user.uid}`));

  // 2. Main Posts Sync Listener
  activeSubscriptions.posts = onSnapshot(
    query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(40)),
    snap => {
      state.posts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const container = document.getElementById('quick-posts-timeline-box');
      if (container) {
        container.innerHTML = renderPostFeed(state);
        attachTimelineViewListeners();
      }
    },
    err => handleFirestoreError(err, OperationType.LIST, 'posts')
  );

  // 3. Messages Live Feed
  activeSubscriptions.messages = onSnapshot(
    query(collection(db, 'messages'), orderBy('createdAt', 'asc'), limit(80)),
    snap => {
      state.messages = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const chatArea = document.getElementById('chat-messages-stage');
      const tally = document.getElementById('chat-member-tally');
      if (chatArea) {
        chatArea.innerHTML = renderChat(state);
        tally.textContent = `Active stream sync (${state.messages.length} messages listed)`;
        chatArea.scrollTop = chatArea.scrollHeight;
        attachChatViewListeners();
      }
    },
    err => handleFirestoreError(err, OperationType.LIST, 'messages')
  );

  // 4. Global Prayers
  activeSubscriptions.prayers = onSnapshot(
    query(collection(db, 'prayers'), orderBy('createdAt', 'desc'), limit(50)),
    snap => {
      state.prayers = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      updateUI();
    },
    err => handleFirestoreError(err, OperationType.LIST, 'prayers')
  );

  // 5. Parish Events
  activeSubscriptions.events = onSnapshot(
    query(collection(db, 'events'), orderBy('date', 'asc')),
    snap => {
      state.events = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      updateUI();
    },
    err => handleFirestoreError(err, OperationType.LIST, 'events')
  );

  // 6. Cell Groups
  activeSubscriptions.cells = onSnapshot(
    query(collection(db, 'cells'), orderBy('name', 'asc')),
    snap => {
      state.cells = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      updateUI();
    },
    err => handleFirestoreError(err, OperationType.LIST, 'cells')
  );

  // 7. Share Resources
  activeSubscriptions.resources = onSnapshot(
    query(collection(db, 'resources'), orderBy('createdAt', 'desc')),
    snap => {
      state.resources = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      updateUI();
    },
    err => handleFirestoreError(err, OperationType.LIST, 'resources')
  );

  // 8. Daily Devotionals
  activeSubscriptions.devotionals = onSnapshot(
    query(collection(db, 'devotionals'), orderBy('createdAt', 'desc')),
    snap => {
      state.devotionals = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      updateUI();
    },
    err => handleFirestoreError(err, OperationType.LIST, 'devotionals')
  );

  // 9. Personal Push Notifications inbox
  activeSubscriptions.notifications = onSnapshot(
    query(collection(db, 'notifications'), where('userId', '==', user.uid), orderBy('createdAt', 'desc')),
    snap => {
      state.notifications = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      state.unreadCount = state.notifications.filter(n => !n.read).length;
      updateUI();
    },
    err => handleFirestoreError(err, OperationType.LIST, 'notifications')
  );

  // 10. QAs response rules
  activeSubscriptions.qaLibrary = onSnapshot(
    collection(db, 'qaLibrary'),
    snap => {
      state.qaLibrary = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    err => handleFirestoreError(err, OperationType.LIST, 'qaLibrary')
  );

  // 11. Complete profile directories roster (Visible/active for administrative oversight)
  activeSubscriptions.users = onSnapshot(
    collection(db, 'users'),
    snap => {
      state.users = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      updateUI();
    },
    err => handleFirestoreError(err, OperationType.LIST, 'users')
  );

  // 12. App Configuration default live theme
  activeSubscriptions.globalTheme = onSnapshot(doc(db, 'appConfig', 'theme'), snap => {
    if (snap.exists()) {
      const config = snap.data();
      if (config.appTheme && config.appTheme !== state.appTheme) {
        state.appTheme = config.appTheme;
        applyDynamicTheme(state.appTheme, state.darkMode);
        updateUI();
      }
    }
  });

  // 13. Dynamic quiz questions
  activeSubscriptions.quiz_questions = onSnapshot(
    collection(db, 'quiz_questions'),
    snap => {
      if (snap.empty) {
        state.quizQuestionsList = [...QUIZ_QUESTIONS];
      } else {
        state.quizQuestionsList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
      updateUI();
    },
    err => handleFirestoreError(err, OperationType.LIST, 'quiz_questions')
  );

  // 14. Dynamic download links
  activeSubscriptions.download_links = onSnapshot(
    collection(db, 'download_links'),
    snap => {
      state.downloadLinks = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      updateUI();
    },
    err => handleFirestoreError(err, OperationType.LIST, 'download_links')
  );
}

// --------------------------------------------------------------------------
// SPIRITUAL COMPANION AI QUERY WRAPPER (REAL GEMINI BACKEND QUERY)
// --------------------------------------------------------------------------
async function askSpiritualCompanion(promptText) {
  // Push User message
  state.aiMessages.push({ role: 'user', content: promptText });
  updateUI();

  // Scroll to bottom
  setTimeout(() => {
    const stg = document.getElementById('ai-conversation-stage');
    if (stg) stg.scrollTop = stg.scrollHeight;
  }, 100);

  // Custom QA Rule direct keyword matching rules loop
  const matchedRule = state.qaLibrary.find(rule => {
    const keys = (rule.keywords || '').split(',').map(k => k.trim().toLowerCase());
    return keys.some(k => k.length > 0 && promptText.toLowerCase().includes(k));
  });

  if (matchedRule) {
    state.aiCompanionTyping = true;
    updateUI();
    
    // Deliver Custom paired response instantly with a short natural typing delay
    setTimeout(() => {
      state.aiCompanionTyping = false;
      state.aiMessages.push({ role: 'assistant', content: matchedRule.answer });
      updateUI();
      const stg = document.getElementById('ai-conversation-stage');
      if (stg) stg.scrollTop = stg.scrollHeight;
    }, 1200);
    return;
  }

  // Query real server-side Gemini endpoint
  state.aiCompanionTyping = true;
  updateUI();

  try {
    const contextHistory = state.aiMessages.slice(-8); // send last 8 messages for context

    const response = await fetch('./api/companion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: promptText,
        history: contextHistory,
        userName: state.userProfile?.displayName || 'Believer'
      })
    });

    if (!response.ok) {
      let errorDetail = '';
      try {
        const errJson = await response.json();
        errorDetail = errJson.message || errJson.error || '';
      } catch (e) {}
      throw new Error(errorDetail || response.statusText);
    }

    const data = await response.json();
    state.aiCompanionTyping = false;
    state.aiMessages.push({ role: 'assistant', content: data.text });
    updateUI();

  } catch (err) {
    console.warn("AI Companion real endpoint failed, using scripture fallback. Error:", err);
    state.aiCompanionTyping = false;

    const isApiKeyMissing = err.message && (
      err.message.includes('API_KEY') || 
      err.message.includes('apiKey') || 
      err.message.includes('key is required') ||
      err.message.includes('required')
    );

    // Fallback comforting spiritual AI agent prompts
    let scriptReply = '';
    if (isApiKeyMissing) {
      scriptReply = `✨ *I am here to walk with you in faith.* \n\nTo activate my full AI spiritual companion capabilities, simply add your **GEMINI_API_KEY** under the **Settings > Secrets** panel in the AI Studio editor. It will be securely connected instantly.\n\nIn the meantime, let us share in this comforting word:\n\n`;
    } else {
      scriptReply = `I am walking with you in faith. May this comforting word strengthen your soul:\n\n`;
    }
    
    if (promptText.toLowerCase().includes('anxious') || promptText.toLowerCase().includes('fear') || promptText.toLowerCase().includes('worry')) {
      scriptReply += `📖 *Philippians 4:6-7* - Be anxious for nothing, but in everything by prayer and supplication, with thanksgiving, let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.`;
    } else if (promptText.toLowerCase().includes('strength') || promptText.toLowerCase().includes('weak') || promptText.toLowerCase().includes('tired')) {
      scriptReply += `📖 *Isaiah 40:29* - He giveth power to the faint; and to them that have no might he increaseth strength. Wait upon Him and raise wings like eagles.`;
    } else if (promptText.toLowerCase().includes('healing') || promptText.toLowerCase().includes('sick') || promptText.toLowerCase().includes('pain')) {
      scriptReply += `📖 *James 5:15* - And the prayer of faith shall save the sick, and the Lord shall raise him up; and if he have committed sins, they shall be forgiven him.`;
    } else {
      // Pick random SCRIPTURE
      const rand = SCRIPTURES[Math.floor(Math.random() * SCRIPTURES.length)];
      scriptReply += `📖 *${rand.ref}* - ${rand.text}`;
    }

    state.aiMessages.push({ role: 'assistant', content: scriptReply });
    updateUI();
  } finally {
    const stg = document.getElementById('ai-conversation-stage');
    if (stg) stg.scrollTop = stg.scrollHeight;
  }
}

// --------------------------------------------------------------------------
// CENTRAL RENDERING CONTROLLER & EVENTS DISPATCHER
// --------------------------------------------------------------------------
function updateUI() {
  const root = document.getElementById('root');
  if (!root) return;

  // 1. Unauthenticated views
  if (!state.user) {
    if (state.currentView === 'landing') {
      root.innerHTML = renderLanding(state);
      attachLandingListeners();
    } else if (state.currentView === 'login') {
      root.innerHTML = renderLogin(state);
      attachAuthViewListeners();
    } else if (state.currentView === 'signup') {
      root.innerHTML = renderSignup(state);
      attachAuthViewListeners();
    } else if (state.currentView === 'forgot') {
      root.innerHTML = renderForgotPassword(state);
      attachAuthViewListeners();
    } else {
      // Fallback
      root.innerHTML = renderLanding(state);
      attachLandingListeners();
    }
    return;
  }

  // 2. Onboarding Flow
  if (state.currentView === 'onboarding') {
    root.innerHTML = renderOnboarding(state);
    attachOnboardingViewListeners();
    return;
  }

  // 3. Authenticated views wrapped inside AppShell frame
  let contentHtml = '';
  switch (state.currentView) {
    case 'home':
      contentHtml = renderHome(state);
      break;
    case 'cells':
      contentHtml = renderCells(state);
      break;
    case 'cell-page':
      contentHtml = renderCellPage(state);
      break;
    case 'chat':
      contentHtml = renderChat(state);
      break;
    case 'bible':
      contentHtml = renderBible(state);
      break;
    case 'profile':
      contentHtml = renderProfile(state);
      break;
    case 'admin':
      contentHtml = renderAdmin(state);
      break;
    case 'devotionals':
      contentHtml = renderDevotionals(state);
      break;
    case 'quiz':
      contentHtml = renderQuiz(state);
      break;
    case 'events':
      contentHtml = renderEvents(state); // We can render events list inside spirituality views or simple schedules
      break;
    case 'ai-assistant':
      contentHtml = renderAiAssistant(state);
      break;
    case 'notifications':
      contentHtml = renderNotifications(state);
      break;
    case 'resources':
      contentHtml = renderResources(state);
      break;
    case 'downloads':
      contentHtml = renderDownloads(state);
      break;
    case 'prayer-room':
      contentHtml = renderPrayerRoom(state);
      break;
    case 'live-room':
      contentHtml = renderLiveRoom(state);
      break;
    case 'post-editor':
      contentHtml = renderPostEditor(state);
      break;
    default:
      contentHtml = renderHome(state);
  }

  root.innerHTML = renderAppShell(state, contentHtml);

  // Run Timeline feeds update on load
  if (state.currentView === 'home') {
    const postFeedBox = document.getElementById('quick-posts-timeline-box');
    if (postFeedBox) {
      postFeedBox.innerHTML = renderPostFeed(state);
      attachTimelineViewListeners();
    }
  }

  // Auto Scroll Chat Room message threads
  if (state.currentView === 'chat') {
    const chatArea = document.getElementById('chat-messages-stage');
    if (chatArea) chatArea.scrollTop = chatArea.scrollHeight;
  }

  // Auto Scroll AI Chat Room
  if (state.currentView === 'ai-assistant') {
    const aiStg = document.getElementById('ai-conversation-stage');
    if (aiStg) aiStg.scrollTop = aiStg.scrollHeight;
  }

  // Inject structural listener groups
  attachAppShellListeners();
  attachViewSpecificListeners();
}

// --------------------------------------------------------------------------
// EVENT BINDINGS
// --------------------------------------------------------------------------

// Friendly Auth error parser for easy understanding
function getFriendlyAuthError(err) {
  const msg = (err.message || String(err)).toLowerCase();
  if (msg.includes('user-not-found') || msg.includes('invalid-credential') || msg.includes('wrong-password')) {
    return "The email or password didn't match our records. Please verify spelling and try again.";
  }
  if (msg.includes('email-already-in-use')) {
    return "This email is already registered here. Please select 'Log In' instead.";
  }
  if (msg.includes('popup-blocked')) {
    return "Your browser's pop-up blocker stopped the Google Sign-In window. Please allow pop-ups for this site or use standard email log-in.";
  }
  if (msg.includes('invalid-email')) {
    return "Please enter a valid, correctly styled email address.";
  }
  if (msg.includes('network-request-failed')) {
    return "Network connection issue. Please check your internet connection.";
  }
  return err.message ? err.message.replace('Firebase:', '') : String(err);
}

// 1. Landing View Interactions
function attachLandingListeners() {
  document.getElementById('btn-goto-signup')?.addEventListener('click', () => gotoView('signup'));
  document.getElementById('btn-goto-login')?.addEventListener('click', () => gotoView('login'));
}

// 2. Auth View Form Submissions
function attachAuthViewListeners() {
  document.getElementById('auth-back-to-landing')?.addEventListener('click', () => gotoView('landing'));
  document.getElementById('auth-back-to-landing-2')?.addEventListener('click', () => gotoView('landing'));
  document.getElementById('auth-tab-signup')?.addEventListener('click', () => gotoView('signup'));
  document.getElementById('auth-tab-login')?.addEventListener('click', () => gotoView('login'));
  document.getElementById('forgot-back-to-login')?.addEventListener('click', () => gotoView('login'));
  document.getElementById('btn-forgot-password')?.addEventListener('click', () => gotoView('forgot'));

  // Email Sign In submitting
  document.getElementById('login-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    state.authSubmitting = true;
    state.authError = null;
    updateUI();
    const mail = document.getElementById('login-email').value;
    const lock = document.getElementById('login-password').value;
    try {
      await signInWithEmailAndPassword(auth, mail, lock);
    } catch (err) {
      state.authError = getFriendlyAuthError(err);
    } finally {
      state.authSubmitting = false;
      updateUI();
    }
  });

  // Register Account
  document.getElementById('signup-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    state.authSubmitting = true;
    state.authError = null;
    updateUI();
    const name = document.getElementById('signup-name').value;
    const mail = document.getElementById('signup-email').value;
    const lock = document.getElementById('signup-password').value;
    try {
      const res = await createUserWithEmailAndPassword(auth, mail, lock);
      // Save profile name
      await setDoc(doc(db, 'users', res.user.uid), {
        uid: res.user.uid,
        displayName: name,
        email: mail,
        role: mail === SUPER_ADMIN_EMAIL ? 'super_admin' : 'member',
        cellId: '',
        bio: '',
        location: '',
        phone: '',
        devotionStreak: 1,
        quizScore: 0,
        createdAt: new Date().toISOString()
       });
    } catch (err) {
      state.authError = getFriendlyAuthError(err);
    } finally {
      state.authSubmitting = false;
      updateUI();
    }
  });

  // Google Authentication popup
  const handleGoogleSignIn = async () => {
    state.authSubmitting = true;
    state.authError = null;
    updateUI();
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Google Auth popup failure:", err);
      state.authError = getFriendlyAuthError(err);
    } finally {
      state.authSubmitting = false;
      updateUI();
    }
  };

  document.getElementById('btn-google-auth')?.addEventListener('click', handleGoogleSignIn);
  document.getElementById('btn-google-auth-signup')?.addEventListener('click', handleGoogleSignIn);

  // Recovery link
  document.getElementById('forgot-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    state.authSubmitting = true;
    state.authError = null;
    state.forgotSuccess = false;
    updateUI();
    const mail = document.getElementById('forgot-email').value;
    try {
      await sendPasswordResetEmail(auth, mail);
      state.forgotSuccess = true;
    } catch (err) {
      state.authError = getFriendlyAuthError(err);
    } finally {
      state.authSubmitting = false;
      updateUI();
    }
  });
}

// 3. Profiles Setup Wizard Wizardry
function attachOnboardingViewListeners() {
  // Tabs click handlers
  document.getElementById('onboard-cell-tab-none')?.addEventListener('click', () => {
    state.onboardingCellAction = 'none';
    state.authError = null;
    updateUI();
  });
  document.getElementById('onboard-cell-tab-join')?.addEventListener('click', () => {
    state.onboardingCellAction = 'join';
    state.authError = null;
    updateUI();
  });
  document.getElementById('onboard-cell-tab-create')?.addEventListener('click', () => {
    state.onboardingCellAction = 'create';
    state.authError = null;
    updateUI();
  });

  document.getElementById('onboarding-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    state.authSubmitting = true;
    updateUI();

    const name = document.getElementById('onboard-name').value;
    const bio = document.getElementById('onboard-bio').value;
    const city = document.getElementById('onboard-location').value;

    try {
      let finalCellId = '';
      const action = state.onboardingCellAction || 'none';

      if (action === 'join') {
        finalCellId = document.getElementById('onboard-cell')?.value || '';
      } else if (action === 'create') {
        const cellName = document.getElementById('onboard-new-cell-name')?.value?.trim();
        const cellDesc = document.getElementById('onboard-new-cell-desc')?.value?.trim() || 'A new fellowship cell.';
        const cellCity = document.getElementById('onboard-new-cell-city')?.value?.trim() || city || 'Worldwide';
        const cellState = document.getElementById('onboard-new-cell-state')?.value?.trim() || '';
        const cellDay = document.getElementById('onboard-new-cell-day')?.value || 'Friday';
        const cellTime = document.getElementById('onboard-new-cell-time')?.value || '18:30';

        if (!cellName) {
          throw new Error("Please specify a name for your new fellowship cell.");
        }

        const newCellSchema = {
          name: cellName,
          description: cellDesc,
          tags: ['Damascus', 'Fellowship'],
          leaderId: state.user.uid,
          leaderName: name || state.userProfile?.displayName || 'Cell leader',
          pastorName: 'Synod Overseer',
          contactEmail: state.user.email,
          suspended: false,
          meetingSchedule: { day: cellDay, time: cellTime },
          location: { city: cellCity, state: cellState },
          memberCount: 1,
          memberIds: [state.user.uid]
        };

        const res = await addDoc(collection(db, 'cells'), newCellSchema);
        finalCellId = res.id;
      }

      const finalRole = (action === 'create')
        ? (state.userProfile?.role === 'super_admin' ? 'super_admin' : 'cell_leader')
        : (state.userProfile?.role || 'member');

      await updateDoc(doc(db, 'users', state.user.uid), {
        displayName: name,
        bio,
        location: city,
        cellId: finalCellId,
        role: finalRole
      });

      // Update local rosters if cellId has been updated and action is 'join'
      if (finalCellId && action === 'join') {
        await updateDoc(doc(db, 'cells', finalCellId), {
          memberIds: arrayUnion(state.user.uid),
          memberCount: increment(1)
        });
      }

      // Reset onboarding action
      state.onboardingCellAction = 'none';
      state.authError = null;

      gotoView('home');
    } catch (err) {
      state.authError = err.message || String(err);
      updateUI();
    } finally {
      state.authSubmitting = false;
      updateUI();
    }
  });
}

// 4. AppShell Navigation links
function attachAppShellListeners() {
  // Navigation links
  document.querySelectorAll('[data-goto-view]').forEach(btn => {
    btn.addEventListener('click', e => {
      const dest = btn.getAttribute('data-goto-view');
      gotoView(dest);
      // Close drawer if open
      document.getElementById('mobile-sidebar-drawer')?.classList.add('hidden');
    });
  });

  // Sign out buttons
  document.getElementById('btn-sidebar-signout')?.addEventListener('click', () => signOut(auth));
  document.getElementById('topbar-btn-signout')?.addEventListener('click', () => signOut(auth));

  // Toggle desktop sidebar expand / collapse
  document.getElementById('btn-toggle-sidebar')?.addEventListener('click', () => {
    state.sidebarCollapsed = !state.sidebarCollapsed;
    updateUI();
  });

  // Toggle profile panel
  const trigger = document.getElementById('topbar-profile-trigger');
  const menu = document.getElementById('topbar-profile-menu');
  if (trigger && menu) {
    trigger.addEventListener('click', e => {
      e.stopPropagation();
      menu.classList.toggle('hidden');
    });
    document.addEventListener('click', () => menu.classList.add('hidden'));
  }

  // Theme changing
  document.getElementById('topbar-btn-theme')?.addEventListener('click', async () => {
    state.darkMode = !state.darkMode;
    applyDynamicTheme(state.appTheme, state.darkMode);
    updateUI();
    // Update Profile preference
    try {
      await updateDoc(doc(db, 'users', state.user.uid), { darkMode: state.darkMode });
    } catch (err) {
      console.warn("Theme persistence profile safeguard failed:", err);
    }
  });

  // AI assistant link
  document.getElementById('topbar-btn-ai')?.addEventListener('click', () => gotoView('ai-assistant'));
  document.getElementById('topbar-btn-notifications')?.addEventListener('click', () => gotoView('notifications'));

  // Mobile drawer trigger
  document.getElementById('mobile-menu-trigger')?.addEventListener('click', () => {
    document.getElementById('mobile-sidebar-drawer')?.classList.remove('hidden');
  });
  document.getElementById('mobile-menu-close')?.addEventListener('click', () => {
    document.getElementById('mobile-sidebar-drawer')?.classList.add('hidden');
  });
}

// 5. Views specific click event listeners
function attachViewSpecificListeners() {
  switch (state.currentView) {
    case 'home':
      // Quick menu buttons
      document.querySelectorAll('[data-rsvp-event-id]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-rsvp-event-id');
          const btnText = btn.textContent.trim().toLowerCase();
          const isAttending = btnText.includes('attending') || btnText.includes('going');
          
          try {
            await updateDoc(doc(db, 'events', id), {
              attendeeIds: isAttending ? arrayRemove(state.user.uid) : arrayUnion(state.user.uid),
              attendeeCount: increment(isAttending ? -1 : 1)
            });
          } catch (err) {
            handleFirestoreError(err, OperationType.UPDATE, `events/${id}`);
          }
        });
      });
      break;

    case 'cells':
      // Search
      document.getElementById('cells-search-input')?.addEventListener('input', e => {
        state.cellsSearchQuery = e.target.value;
      });

      // Show/Close flyover creating overlay mod
      document.getElementById('btn-show-create-cell-overlay')?.addEventListener('click', () => {
        document.getElementById('create-cell-overlay')?.classList.remove('hidden');
      });
      document.getElementById('btn-close-create-cell')?.addEventListener('click', () => {
        document.getElementById('create-cell-overlay')?.classList.add('hidden');
      });

      // Submit new cell group details
      document.getElementById('create-cell-form')?.addEventListener('submit', async e => {
        e.preventDefault();
        const name = document.getElementById('add-cell-name').value;
        const desc = document.getElementById('add-cell-desc').value;
        const city = document.getElementById('add-cell-city').value;
        const prov = document.getElementById('add-cell-state').value;
        const day = document.getElementById('add-cell-day').value;
        const time = document.getElementById('add-cell-time').value;

        const newCellSchema = {
          name,
          description: desc,
          tags: ['Damascus', 'Greek context'],
          leaderId: state.user.uid,
          leaderName: state.userProfile?.displayName || 'Cell leader',
          pastorName: 'Synod Overseer',
          contactEmail: state.user.email,
          suspended: false,
          meetingSchedule: { day, time },
          location: { city, state: prov },
          memberCount: 1,
          memberIds: [state.user.uid]
        };

        try {
          const res = await addDoc(collection(db, 'cells'), newCellSchema);
          // Auto add the creator's user profile pointer
          await updateDoc(doc(db, 'users', state.user.uid), {
            cellId: res.id,
            role: state.userProfile?.role === 'member' ? 'cell_leader' : state.userProfile?.role
          });
          document.getElementById('create-cell-overlay')?.classList.add('hidden');
          gotoView('cells');
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, 'cells');
        }
      });

      // Double-click opening layout page
      document.querySelectorAll('[data-goto-cell-page]').forEach(btn => {
        btn.addEventListener('click', () => {
          gotoView('cell-page', { selectedCellId: btn.getAttribute('data-goto-cell-page'), cellPageTab: 'overview' });
        });
      });

      // Joining Cell Groups
      document.querySelectorAll('[data-join-cell-id]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-join-cell-id');
          try {
            await updateDoc(doc(db, 'cells', id), {
              memberIds: arrayUnion(state.user.uid),
              memberCount: increment(1)
            });
            await updateDoc(doc(db, 'users', state.user.uid), {
              cellId: id
            });
            gotoView('cell-page', { selectedCellId: id, cellPageTab: 'overview' });
          } catch (err) {
            handleFirestoreError(err, OperationType.UPDATE, `cells/${id}`);
          }
        });
      });
      break;

    case 'cell-page':
      document.getElementById('btn-back-to-cells')?.addEventListener('click', () => gotoView('cells'));
      
      // Select cell tabs
      document.querySelectorAll('[data-cell-tab-key]').forEach(btn => {
        btn.addEventListener('click', () => {
          state.cellPageTab = btn.getAttribute('data-cell-tab-key');
          updateUI();
        });
      });

      // Leaving Cell
      document.querySelectorAll('[data-leave-cell-id]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-leave-cell-id');
          try {
            await updateDoc(doc(db, 'cells', id), {
              memberIds: arrayRemove(state.user.uid),
              memberCount: increment(-1)
            });
            await updateDoc(doc(db, 'users', state.user.uid), {
              cellId: ''
            });
            gotoView('cells');
          } catch (err) {
            handleFirestoreError(err, OperationType.UPDATE, `cells/${id}`);
          }
        });
      });

      // Save localized settings
      document.getElementById('cell-edit-settings-form')?.addEventListener('submit', async e => {
        e.preventDefault();
        const d = document.getElementById('edit-cell-day').value;
        const t = document.getElementById('edit-cell-time').value;
        const c = document.getElementById('edit-cell-city').value;

        try {
          await updateDoc(doc(db, 'cells', state.selectedCellId), {
            meetingSchedule: { day: d, time: t },
            location: { city: c }
          });
          gotoView('cell-page', { selectedCellId: state.selectedCellId, cellPageTab: 'overview' });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `cells/${state.selectedCellId}`);
        }
      });

      // Promoted leader by dropdown select:
      document.getElementById('cell-add-leader-form')?.addEventListener('submit', async e => {
        e.preventDefault();
        const cid = document.getElementById('add-leader-uid').value;
        if (!cid) return;

        try {
          await updateDoc(doc(db, 'users', cid), {
            role: 'cell_leader',
            cellId: state.selectedCellId
          });
          await updateDoc(doc(db, 'cells', state.selectedCellId), {
            coLeaderIds: arrayUnion(cid)
          });
          gotoView('cell-page', { selectedCellId: state.selectedCellId, cellPageTab: 'overview' });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `cells/${state.selectedCellId}`);
        }
      });

      // Promote by email text search:
      document.getElementById('cell-add-leader-by-email-form')?.addEventListener('submit', async e => {
        e.preventDefault();
        const emailInput = document.getElementById('add-leader-email').value.trim().toLowerCase();
        if (!emailInput) return;

        const targetUser = (state.users || []).find(u => u.email && u.email.toLowerCase() === emailInput);
        if (!targetUser) {
          console.warn('No believer profile found with that email.');
          return;
        }

        try {
          await updateDoc(doc(db, 'users', targetUser.uid), {
            role: 'cell_leader',
            cellId: state.selectedCellId
          });
          await updateDoc(doc(db, 'cells', state.selectedCellId), {
            coLeaderIds: arrayUnion(targetUser.uid)
          });
          gotoView('cell-page', { selectedCellId: state.selectedCellId, cellPageTab: 'overview' });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `cells/${state.selectedCellId}`);
        }
      });

      // Local event scheduling form inside cells
      document.getElementById('cell-add-event-form')?.addEventListener('submit', async e => {
        e.preventDefault();
        const ttl = document.getElementById('cell-event-title').value;
        const dt = document.getElementById('cell-event-date').value;

        const cellEventSchema = {
          title: ttl,
          description: 'Weekly interactive home fellowship bible study transcript discussion.',
          date: dt,
          time: '19:00',
          location: 'Address specified by Cell Leaders panel',
          type: 'bible_study',
          cellId: state.selectedCellId,
          attendeeCount: 1,
          attendeeIds: [state.user.uid]
        };

        try {
          await addDoc(collection(db, 'events'), cellEventSchema);
          updateUI();
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, 'events');
        }
      });

      // Appoint Additional Cell Leader form submit
      document.getElementById('cell-add-leader-form')?.addEventListener('submit', async e => {
        e.preventDefault();
        const promoUid = document.getElementById('add-leader-uid').value;
        if (!promoUid) return;
        try {
          await updateDoc(doc(db, 'cells', state.selectedCellId), {
            coLeaderIds: arrayUnion(promoUid)
          });
          await updateDoc(doc(db, 'users', promoUid), {
            role: 'cell_leader'
          });
          state.cellPageTab = 'settings';
          updateUI();
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `cells/${state.selectedCellId}`);
        }
      });

      // Appoint Additional Cell Leader by email form submit
      document.getElementById('cell-add-leader-by-email-form')?.addEventListener('submit', async e => {
        e.preventDefault();
        const emailVal = document.getElementById('add-leader-email').value.trim().toLowerCase();
        if (!emailVal) return;
        const foundUser = (state.users || []).find(u => u.email?.toLowerCase() === emailVal);
        if (!foundUser) {
          alert(`No registered parishioner found with the email "${emailVal}".`);
          return;
        }
        try {
          await updateDoc(doc(db, 'cells', state.selectedCellId), {
            coLeaderIds: arrayUnion(foundUser.uid)
          });
          await updateDoc(doc(db, 'users', foundUser.uid), {
            role: 'cell_leader',
            cellId: state.selectedCellId
          });
          document.getElementById('cell-add-leader-by-email-form').reset();
          state.cellPageTab = 'settings';
          updateUI();
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `cells/${state.selectedCellId}`);
        }
      });
      break;

    case 'bible':
      // Book dropdown toggle
      document.getElementById('bible-book-select')?.addEventListener('change', e => {
        state.bibleBook = e.target.value;
        state.bibleChapter = 1;
        syncBibleText();
      });

      // Chapter dropdown toggle
      document.getElementById('bible-chapter-select')?.addEventListener('change', e => {
        state.bibleChapter = parseInt(e.target.value);
        syncBibleText();
      });

      // Previous Chapter button
      document.getElementById('bible-btn-prev')?.addEventListener('click', () => {
        if (state.bibleChapter > 1) {
          state.bibleChapter--;
          syncBibleText();
        }
      });

      // Next Chapter button
      document.getElementById('bible-btn-next')?.addEventListener('click', () => {
        const bookMeta = BIBLE_BOOKS.find(b => b.name === state.bibleBook) || { chapters: 50 };
        if (state.bibleChapter < bookMeta.chapters) {
          state.bibleChapter++;
          syncBibleText();
        }
      });
      break;

    case 'profile':
      document.getElementById('profile-edit-settings-form')?.addEventListener('submit', async e => {
        e.preventDefault();
        const nm = document.getElementById('profile-name').value;
        const bio = document.getElementById('profile-bio').value;
        const city = document.getElementById('profile-location').value;
        const phone = document.getElementById('profile-phone').value;
        const dark = document.getElementById('profile-dark-mode').checked;

        state.darkMode = dark;
        applyDynamicTheme(state.appTheme, state.darkMode);

        try {
          await updateDoc(doc(db, 'users', state.user.uid), {
            displayName: nm,
            bio,
            location: city,
            phone,
            darkMode: dark
          });
          updateUI();
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `users/${state.user.uid}`);
        }
      });
      break;

    case 'devotionals':
      // Open / Close add devotional overlay
      document.getElementById('btn-show-add-devo')?.addEventListener('click', () => {
        document.getElementById('add-devo-overlay')?.classList.remove('hidden');
      });
      document.getElementById('btn-close-devo')?.addEventListener('click', () => {
        document.getElementById('add-devo-overlay')?.classList.add('hidden');
      });

      // Click side archives rows
      document.querySelectorAll('[data-select-devo-id]').forEach(btn => {
        btn.addEventListener('click', () => {
          state.selectedDevotionalId = btn.getAttribute('data-select-devo-id');
          updateUI();
        });
      });

      // Publish Devotional Creator Panel Action
      document.getElementById('add-devo-form')?.addEventListener('submit', async e => {
        e.preventDefault();
        const ttl = document.getElementById('add-devo-title').value;
        const ref = document.getElementById('add-devo-ref').value;
        const content = document.getElementById('add-devo-content').value;

        const newDevo = {
          title: ttl,
          scriptureRef: ref,
          content,
          author: state.userProfile?.displayName || 'Pastor',
          uploadedBy: state.user.uid,
          createdAt: new Date().toISOString()
        };

        try {
          await addDoc(collection(db, 'devotionals'), newDevo);
          document.getElementById('add-devo-overlay')?.classList.add('hidden');
          // Dispatch personal streak count increment
          await updateDoc(doc(db, 'users', state.user.uid), {
            devotionStreak: increment(1)
          });
          gotoView('devotionals');
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, 'devotionals');
        }
      });

      // Delete Devotional file
      document.querySelectorAll('[data-delete-devo-id]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-delete-devo-id');
          try {
            await deleteDoc(doc(db, 'devotionals', id));
            state.selectedDevotionalId = null;
            updateUI();
          } catch (err) {
            handleFirestoreError(err, OperationType.DELETE, `devotionals/${id}`);
          }
        });
      });
      break;

    case 'quiz':
      // Trigger Game
      document.getElementById('btn-quiz-start')?.addEventListener('click', () => {
        startQuizRound();
      });
      document.getElementById('btn-quiz-retry')?.addEventListener('click', () => {
        startQuizRound();
      });

      // Select Answer Buttons
      document.querySelectorAll('[data-quiz-option-idx]').forEach(btn => {
        btn.addEventListener('click', () => {
          const oIdx = parseInt(btn.getAttribute('data-quiz-option-idx'));
          handleQuizAnswer(oIdx);
        });
      });
      break;

    case 'prayer-room':
      // Filter Category Click
      document.querySelectorAll('[data-prayer-cat-filter]').forEach(btn => {
        btn.addEventListener('click', () => {
          state.prayersCategory = btn.getAttribute('data-prayer-cat-filter');
          updateUI();
        });
      });

      // Flyout overlays toggles
      document.getElementById('btn-show-add-prayer')?.addEventListener('click', () => {
        document.getElementById('add-prayer-overlay')?.classList.remove('hidden');
      });
      document.getElementById('btn-close-prayer')?.addEventListener('click', () => {
        document.getElementById('add-prayer-overlay')?.classList.add('hidden');
      });

      // Share prayer form dispatches
      document.getElementById('add-prayer-form')?.addEventListener('submit', async e => {
        e.preventDefault();
        const cat = document.getElementById('add-prayer-cat').value;
        const content = document.getElementById('add-prayer-content').value;
        const urgent = document.getElementById('add-prayer-urgent').checked;

        const newPrayer = {
          content,
          category: cat,
          urgency: urgent ? 'urgent' : 'standard',
          userId: state.user.uid,
          userName: state.userProfile?.displayName || 'Believer',
          prayerCount: 1,
          prayedBy: [state.user.uid],
          createdAt: new Date().toISOString()
        };

        try {
          await addDoc(collection(db, 'prayers'), newPrayer);
          document.getElementById('add-prayer-overlay')?.classList.add('hidden');
          updateUI();
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, 'prayers');
        }
      });

      // Interceding supports Pray Action toggles
      document.querySelectorAll('[data-react-prayer-id]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-react-prayer-id');
          const isPrayed = btn.textContent.trim().toLowerCase().includes('prayed');
          
          try {
            await updateDoc(doc(db, 'prayers', id), {
              prayedBy: isPrayed ? arrayRemove(state.user.uid) : arrayUnion(state.user.uid),
              prayerCount: increment(isPrayed ? -1 : 1)
            });
          } catch (err) {
            handleFirestoreError(err, OperationType.UPDATE, `prayers/${id}`);
          }
        });
      });
      break;

    case 'events':
      // 1. Month Navigation
      document.getElementById('btn-calendar-prev')?.addEventListener('click', () => {
        if (state.eventsCurrentMonth === 0) {
          state.eventsCurrentMonth = 11;
          state.eventsCurrentYear -= 1;
        } else {
          state.eventsCurrentMonth -= 1;
        }
        updateUI();
      });

      document.getElementById('btn-calendar-next')?.addEventListener('click', () => {
        if (state.eventsCurrentMonth === 11) {
          state.eventsCurrentMonth = 0;
          state.eventsCurrentYear += 1;
        } else {
          state.eventsCurrentMonth += 1;
        }
        updateUI();
      });

      // 2. Click Day Cell Filter Date
      document.querySelectorAll('[data-calendar-day-key]').forEach(cell => {
        cell.addEventListener('click', () => {
          const clickedDateStr = cell.getAttribute('data-calendar-day-key');
          if (state.selectedEventDate === clickedDateStr) {
            state.selectedEventDate = null; // Toggle off if selected same
          } else {
            state.selectedEventDate = clickedDateStr;
          }
          updateUI();
        });
      });

      // 3. Clear Date Filter Click
      document.getElementById('btn-clear-date-filter')?.addEventListener('click', () => {
        state.selectedEventDate = null;
        updateUI();
      });

      // 4. Tab filter clicks
      document.querySelectorAll('[data-events-tab-filter]').forEach(btn => {
        btn.addEventListener('click', () => {
          state.eventsFilterType = btn.getAttribute('data-events-tab-filter');
          updateUI();
        });
      });

      // 5. RSVPs Toggles inside calendar View
      document.querySelectorAll('[data-rsvp-event-id]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-rsvp-event-id');
          const btnText = btn.textContent.trim().toLowerCase();
          const isAttending = btnText.includes('attending') || btnText.includes('going');
          
          try {
            await updateDoc(doc(db, 'events', id), {
              attendeeIds: isAttending ? arrayRemove(state.user.uid) : arrayUnion(state.user.uid),
              attendeeCount: increment(isAttending ? -1 : 1)
            });
          } catch (err) {
            handleFirestoreError(err, OperationType.UPDATE, `events/${id}`);
          }
        });
      });

      // 6. Modal Open / Close Events orchestration
      document.getElementById('btn-trigger-add-event')?.addEventListener('click', () => {
        document.getElementById('add-event-orchestrate-overlay')?.classList.remove('hidden');
      });
      document.getElementById('btn-close-event-orchestration')?.addEventListener('click', () => {
        document.getElementById('add-event-orchestrate-overlay')?.classList.add('hidden');
      });

      // 7. Dynamic Form Orchestrate Event Submit
      document.getElementById('orchestrate-event-form')?.addEventListener('submit', async e => {
        e.preventDefault();
        const title = document.getElementById('add-evt-title').value;
        const description = document.getElementById('add-evt-desc').value;
        const date = document.getElementById('add-evt-date').value;
        const time = document.getElementById('add-evt-time').value;
        const location = document.getElementById('add-evt-location').value;
        const type = document.getElementById('add-evt-type').value;

        const cellEventSchema = {
          title,
          description,
          date,
          time,
          location,
          type,
          attendeeCount: 1,
          attendeeIds: [state.user.uid],
          uploadedBy: state.user.uid,
          authorName: state.userProfile?.displayName || 'Believer'
        };

        try {
          await addDoc(collection(db, 'events'), cellEventSchema);
          document.getElementById('add-event-orchestrate-overlay')?.classList.add('hidden');
          // Clear form fields
          document.getElementById('orchestrate-event-form').reset();
          updateUI();
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, 'events');
        }
      });
      break;

    case 'post-editor':
      document.getElementById('btn-back-to-home')?.addEventListener('click', () => gotoView('home'));
      
      // Dispatch testimony
      document.getElementById('write-post-form')?.addEventListener('submit', async e => {
        e.preventDefault();
        const type = document.getElementById('editor-post-type').value;
        const content = document.getElementById('editor-post-content').value;

        const newWitness = {
          content,
          type,
          authorId: state.user.uid,
          authorName: state.userProfile?.displayName || 'Believer',
          authorRole: state.userProfile?.role || 'member',
          reactions: { Amen: [], Love: [], Victory: [] },
          createdAt: new Date().toISOString()
        };

        try {
          await addDoc(collection(db, 'posts'), newWitness);
          gotoView('home');
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, 'posts');
        }
      });
      break;

    case 'resources':
      // Open modal add share
      document.getElementById('btn-show-add-resource')?.addEventListener('click', () => {
        document.getElementById('add-resource-overlay')?.classList.remove('hidden');
      });
      document.getElementById('btn-close-resource')?.addEventListener('click', () => {
        document.getElementById('add-resource-overlay')?.classList.add('hidden');
      });

      // Submit new Resources
      document.getElementById('add-resource-form')?.addEventListener('submit', async e => {
        e.preventDefault();
        const title = document.getElementById('add-res-title').value;
        const desc = document.getElementById('add-res-desc').value;
        const type = document.getElementById('add-res-type').value;
        const url = document.getElementById('add-res-url').value;

        const newRes = {
          title,
          description: desc,
          type,
          url,
          uploadedBy: state.user.uid,
          uploadedByName: state.userProfile?.displayName || 'Supervisor',
          createdAt: new Date().toISOString()
        };

        try {
          await addDoc(collection(db, 'resources'), newRes);
          document.getElementById('add-resource-overlay')?.classList.add('hidden');
          updateUI();
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, 'resources');
        }
      });

      // Delete file entry
      document.querySelectorAll('[data-delete-resource-id]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-delete-resource-id');
          try {
            await deleteDoc(doc(db, 'resources', id));
            updateUI();
          } catch (err) {
            handleFirestoreError(err, OperationType.DELETE, `resources/${id}`);
          }
        });
      });

      // Search keyword typing
      document.getElementById('resources-search-input')?.addEventListener('input', e => {
        state.resourcesQuery = e.target.value;
      });

      // Click type buttons selectors
      document.querySelectorAll('[data-resource-type-filter]').forEach(btn => {
        btn.addEventListener('click', () => {
          state.resourcesType = btn.getAttribute('data-resource-type-filter');
          updateUI();
        });
      });
      break;

    case 'admin':
      // sub tab toggle clicks
      document.querySelectorAll('[data-admin-tab-key]').forEach(btn => {
        btn.addEventListener('click', () => {
          state.adminTab = btn.getAttribute('data-admin-tab-key');
          updateUI();
        });
      });

      // User role elect selector
      document.querySelectorAll('[data-role-user-id]').forEach(sel => {
        sel.addEventListener('change', async e => {
          const id = sel.getAttribute('data-role-user-id');
          const value = e.target.value;
          try {
            await updateDoc(doc(db, 'users', id), { role: value });
          } catch (err) {
            handleFirestoreError(err, OperationType.UPDATE, `users/${id}`);
          }
        });
      });

      // Assign user localized home cell selector
      document.querySelectorAll('[data-cell-user-id]').forEach(sel => {
        sel.addEventListener('change', async e => {
          const id = sel.getAttribute('data-cell-user-id');
          const value = e.target.value;
          try {
            await updateDoc(doc(db, 'users', id), { cellId: value });
          } catch (err) {
            handleFirestoreError(err, OperationType.UPDATE, `users/${id}`);
          }
        });
      });

      // Suspend / Reactivate Cell group administrative action
      document.querySelectorAll('[data-suspend-cell-id]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-suspend-cell-id');
          const action = btn.getAttribute('data-suspend-action');
          try {
            await updateDoc(doc(db, 'cells', id), {
              suspended: action === 'suspend'
            });
          } catch (err) {
            handleFirestoreError(err, OperationType.UPDATE, `cells/${id}`);
          }
        });
      });

      // Delete User record action
      document.querySelectorAll('[data-delete-user-id]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-delete-user-id');
          if (confirm("Are you sure you would like to delete this user's profile database entry? This action is irreversible.")) {
            try {
              await deleteDoc(doc(db, 'users', id));
              updateUI();
            } catch (err) {
              handleFirestoreError(err, OperationType.DELETE, `users/${id}`);
            }
          }
        });
      });

      // Super Admin create developer user
      document.getElementById('admin-create-user-form')?.addEventListener('submit', async e => {
        e.preventDefault();
        const name = (document.getElementById('admin-user-name') || document.getElementById('admin-new-user-name')).value.trim();
        const email = (document.getElementById('admin-user-email') || document.getElementById('admin-new-user-email')).value.trim();
        const role = (document.getElementById('admin-user-role') || document.getElementById('admin-new-user-role')).value;
        const cellId = document.getElementById('admin-user-cell')?.value || '';
        const generatedUid = 'usr_' + Math.random().toString(36).substring(2, 11);

        try {
          await setDoc(doc(db, 'users', generatedUid), {
            uid: generatedUid,
            displayName: name,
            email: email,
            role: role,
            cellId: cellId,
            bio: 'Registered by administrator.',
            location: 'Global',
            phone: '',
            devotionStreak: 1,
            quizScore: 0,
            createdAt: new Date().toISOString()
          });

          // Reset Form values
          const nameEl = document.getElementById('admin-user-name') || document.getElementById('admin-new-user-name');
          const emailEl = document.getElementById('admin-user-email') || document.getElementById('admin-new-user-email');
          const roleEl = document.getElementById('admin-user-role') || document.getElementById('admin-new-user-role');
          if (nameEl) nameEl.value = '';
          if (emailEl) emailEl.value = '';
          if (roleEl) roleEl.value = 'member';
          const cellEl = document.getElementById('admin-user-cell');
          if (cellEl) cellEl.value = '';

          updateUI();
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `users/${generatedUid}`);
        }
      });

      // Brand Theme Swatch Change Action trigger
      document.querySelectorAll('[data-brand-theme-swatch]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const themeName = btn.getAttribute('data-brand-theme-swatch');
          state.appTheme = themeName;
          applyDynamicTheme(themeName, state.darkMode);
          updateUI();
          
          // Publish Live Congregation Synchronizer default doc configuration in Firestore!
          try {
            await setDoc(doc(db, 'appConfig', 'theme'), { appTheme: themeName });
            
            // Also save to Admin profile preferences sync
            await updateDoc(doc(db, 'users', state.user.uid), { appTheme: themeName });
          } catch (err) {
            console.warn("Theme synchronization persistence block failed:", err);
          }
        });
      });

      // Create Custom Quiz Question SUBMIT
      document.getElementById('admin-create-quiz-form')?.addEventListener('submit', async e => {
        e.preventDefault();
        const question = document.getElementById('quiz-add-question').value.trim();
        const opt0 = document.getElementById('quiz-add-opt0').value.trim();
        const opt1 = document.getElementById('quiz-add-opt1').value.trim();
        const opt2 = document.getElementById('quiz-add-opt2').value.trim();
        const opt3 = document.getElementById('quiz-add-opt3').value.trim();
        const correctVal = parseInt(document.getElementById('quiz-add-correct').value);

        const newQuestion = {
          question,
          options: [opt0, opt1, opt2, opt3].filter(o => o !== ''),
          correctAnswer: correctVal,
          createdAt: new Date().toISOString()
        };

        try {
          await addDoc(collection(db, 'quiz_questions'), newQuestion);
          document.getElementById('admin-create-quiz-form').reset();
          updateUI();
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, 'quiz_questions');
        }
      });

      // Click Delete Question Buttons
      document.querySelectorAll('[data-delete-quiz-question-id]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-delete-quiz-question-id');
          try {
            await deleteDoc(doc(db, 'quiz_questions', id));
            updateUI();
          } catch (err) {
            handleFirestoreError(err, OperationType.DELETE, `quiz_questions/${id}`);
          }
        });
      });

      // Clear & Reset defaults button
      document.getElementById('btn-reset-quiz-defaults')?.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to clear and re-seed all quiz questions with the 10 default ones?')) return;
        
        // Delete all custom questions in quiz_questions
        for (const q of (state.quizQuestionsList || [])) {
          if (q.id) {
            try {
              await deleteDoc(doc(db, 'quiz_questions', q.id));
            } catch (err) {
              console.warn(err);
            }
          }
        }

        // Add default set to Firestore database
        for (const q of QUIZ_QUESTIONS) {
          try {
            await addDoc(collection(db, 'quiz_questions'), q);
          } catch (err) {
            console.warn(err);
          }
        }
        updateUI();
      });

      // Downloads manager creators & submission actions inside admin tab
      document.getElementById('admin-create-download-form')?.addEventListener('submit', async e => {
        e.preventDefault();
        const title = document.getElementById('dl-add-title').value.trim();
        const url = document.getElementById('dl-add-url').value.trim();
        const category = document.getElementById('dl-add-category').value.trim();
        const subtext = document.getElementById('dl-add-subtext').value.trim();
        const tag = document.getElementById('dl-add-tag').value.trim() || '';
        const description = document.getElementById('dl-add-description').value.trim();

        try {
          await addDoc(collection(db, 'download_links'), {
            title, url, category, subtext, tag, description,
            createdAt: new Date().toISOString()
          });
          document.getElementById('admin-create-download-form').reset();
          updateUI();
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, 'download_links');
        }
      });

      // Handle delete action on custom downloads inside admin downloads_manager tab
      document.querySelectorAll('[data-delete-download-id]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-delete-download-id');
          if (!confirm('Are you sure you want to remove this download link?')) return;
          try {
            await deleteDoc(doc(db, 'download_links', id));
            updateUI();
          } catch (err) {
            handleFirestoreError(err, OperationType.DELETE, `download_links/${id}`);
          }
        });
      });
      break;

    case 'downloads':
      // Quick jump to Admin panel downloads manager tab
      document.getElementById('btn-quick-goto-admin-downloads')?.addEventListener('click', () => {
        state.adminTab = 'downloads_manager';
        gotoView('admin');
      });

      // Unified immediate automatic direct file download triggered upon click
      document.querySelectorAll('[data-trigger-download-url]').forEach(btn => {
        btn.addEventListener('click', () => {
          const url = btn.getAttribute('data-trigger-download-url');
          const title = btn.getAttribute('data-trigger-download-filename') || 'hcverse-installer';
          
          // Trigger immediate download action
          const a = document.createElement('a');
          a.href = url;
          // Attempt to map exact filename
          const parts = url.split('/');
          const lastPart = parts[parts.length - 1];
          if (lastPart && lastPart.includes('.')) {
            a.download = lastPart;
          } else {
            a.download = title.replace(/\s+/g, '_').toLowerCase();
          }
          a.target = '_blank';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        });
      });

      // Handle delete action on custom downloads inside general downloads views
      document.querySelectorAll('[data-delete-download-id]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-delete-download-id');
          if (!confirm('Are you sure you want to remove this download link?')) return;
          try {
            await deleteDoc(doc(db, 'download_links', id));
            updateUI();
          } catch (err) {
            handleFirestoreError(err, OperationType.DELETE, `download_links/${id}`);
          }
        });
      });
      break;

    case 'ai-assistant':
      // suggestions click presets
      document.querySelectorAll('[data-ai-prompt-chip]').forEach(btn => {
        btn.addEventListener('click', () => {
          const val = btn.getAttribute('data-ai-prompt-chip');
          askSpiritualCompanion(val);
        });
      });

      // Trigger show compositor overlay mod
      document.getElementById('btn-show-qa-composer')?.addEventListener('click', () => {
        document.getElementById('qa-composer-overlay')?.classList.remove('hidden');
      });
      document.getElementById('btn-close-composer')?.addEventListener('click', () => {
        document.getElementById('qa-composer-overlay')?.classList.add('hidden');
      });

      // Admin Add Rule composer
      document.getElementById('create-qa-form')?.addEventListener('submit', async e => {
        e.preventDefault();
        const keywords = document.getElementById('qa-keywords').value;
        const answer = document.getElementById('qa-answer').value;

        try {
          await addDoc(collection(db, 'qaLibrary'), { keywords, answer });
          document.getElementById('qa-composer-overlay')?.classList.add('hidden');
          updateUI();
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, 'qaLibrary');
        }
      });

      // Message submit form
      document.getElementById('ai-chat-send-form')?.addEventListener('submit', e => {
        e.preventDefault();
        const inp = document.getElementById('ai-chat-text-input');
        const text = inp.value.trim();
        if (text) {
          askSpiritualCompanion(text);
          inp.value = '';
        }
      });
      break;

    case 'notifications':
      document.getElementById('btn-clear-all-notifs')?.addEventListener('click', async () => {
        for (const n of state.notifications) {
          try {
            await deleteDoc(doc(db, 'notifications', n.id));
          } catch (err) {
            console.warn("Notification clear fail:", err);
          }
        }
      });

      // Clicking navigation targets in alerts
      document.querySelectorAll('[data-notif-link-view]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const view = btn.getAttribute('data-notif-link-view');
          const docId = btn.getAttribute('data-notif-doc-id');
          try {
            await updateDoc(doc(db, 'notifications', docId), { read: true });
          } catch (err) {
            console.warn(err);
          }
          gotoView(view);
        });
      });
      break;

    case 'chat':
      attachChatViewListeners();
      break;

    case 'live-room':
      // Switch between rooms/tabs
      document.getElementById('live-tab-discussion-btn')?.addEventListener('click', () => {
        state.liveRoomTab = 'discussion';
        subscribeLiveRoom('discussion');
        updateUI();
      });
      document.getElementById('live-tab-prayer-btn')?.addEventListener('click', () => {
        state.liveRoomTab = 'prayer';
        subscribeLiveRoom('prayer');
        updateUI();
      });

      // Send live room message
      document.getElementById('live-chat-form')?.addEventListener('submit', async e => {
        e.preventDefault();
        const input = document.getElementById('live-chat-input');
        const content = input?.value?.trim();
        if (!content) return;

        const newMsg = {
          roomId: state.liveRoomTab || 'discussion',
          content,
          userId: state.user.uid,
          userName: state.userProfile?.displayName || 'Believer',
          createdAt: new Date().toISOString()
        };

        try {
          await addDoc(collection(db, 'live_room_chats'), newMsg);
          if (input) input.value = '';
        } catch (err) {
          console.error("Live message dispatch fail:", err);
        }
      });

      // Submit quick reactions
      document.querySelectorAll('[data-reaction-action]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const action = btn.getAttribute('data-reaction-action');
          const docRef = doc(db, 'live_reactions', state.liveRoomTab || 'discussion');
          try {
            await updateDoc(docRef, {
              [action]: increment(1)
            });
          } catch (err) {
            // Build the dynamic record if missing
            const initObj = { amen: 0, love: 0, fire: 0, praise: 0, hallelujah: 0, speak: 0 };
            initObj[action] = 1;
            await setDoc(docRef, initObj);
          }
        });
      });

      // Toggle local broadcast camera
      document.getElementById('btn-toggle-camera')?.addEventListener('click', async () => {
        const videoEl = document.getElementById('live-camera-element');
        const placeholderEl = document.getElementById('live-stream-placeholder');
        const lbl = document.getElementById('camera-btn-text');

        if (activeWebcamStream) {
          // Shutdown the active webcam stream tracks
          stopActiveWebcamStream();
          if (videoEl) {
            videoEl.srcObject = null;
            videoEl.classList.add('hidden');
          }
          if (placeholderEl) placeholderEl.classList.remove('opacity-0');
          if (lbl) lbl.textContent = 'Turn On My Camera';
        } else {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: { width: 640, height: 480, facingMode: 'user' },
              audio: false // prevent auditory echo loop in the preview iframe
            });
            activeWebcamStream = stream;
            if (videoEl) {
              videoEl.srcObject = stream;
              videoEl.classList.remove('hidden');
            }
            if (placeholderEl) placeholderEl.classList.add('opacity-0');
            if (lbl) lbl.textContent = 'Turn Off My Camera';
          } catch (error) {
            console.warn("Camera streaming is restricted or denied:", error);
            // Non-blocking polite user guidance
            const errorBanner = document.createElement('div');
            errorBanner.className = "absolute top-16 left-4 right-4 bg-black/90 border border-purple-500 text-purple-300 text-xs py-2.5 px-3 rounded-xl shadow-2xl z-50 text-center animate-fade-in select-text";
            errorBanner.innerHTML = `
              <strong>Permissions Required:</strong> To stream your camera, please allow device access in your browser settings.
            `;
            const player = document.getElementById('stream-broadcast-player');
            player?.appendChild(errorBanner);
            setTimeout(() => errorBanner.remove(), 4500);
          }
        }
      });
      break;
  }
}

// Attach listeners to timeline post feed entries post-render
function attachTimelineViewListeners() {
  document.querySelectorAll('[data-react-post-id]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const pId = btn.getAttribute('data-react-post-id');
      const eKey = btn.getAttribute('data-react-emoji-key');
      const activePost = state.posts.find(p => p.id === pId);
      if (!activePost) return;

      const reactionList = activePost.reactions?.[eKey] || [];
      const hasReacted = reactionList.includes(state.user.uid);

      // Perform update
      const keyPath = `reactions.${eKey}`;
      try {
        await updateDoc(doc(db, 'posts', pId), {
          [keyPath]: hasReacted ? arrayRemove(state.user.uid) : arrayUnion(state.user.uid)
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `posts/${pId}`);
      }
    });
  });

  // Delete Testimony Click listener
  document.querySelectorAll('[data-delete-post-id]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-delete-post-id');
      try {
        await deleteDoc(doc(db, 'posts', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `posts/${id}`);
      }
    });
  });
}

// Attach listeners to unified chat elements
function attachChatViewListeners() {
  document.getElementById('btn-toggle-emoji-board')?.addEventListener('click', () => {
    document.getElementById('chat-emoji-board')?.classList.toggle('hidden');
  });

  // Clicking an emoji choice inside chat board
  document.querySelectorAll('[data-chat-emoji]').forEach(btn => {
    btn.addEventListener('click', () => {
      const em = btn.getAttribute('data-chat-emoji');
      const input = document.getElementById('chat-text-input');
      if (input) {
        input.value += em;
        input.focus();
      }
      document.getElementById('chat-emoji-board')?.classList.add('hidden');
    });
  });

  // Sending message
  document.getElementById('chat-send-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const input = document.getElementById('chat-text-input');
    const txt = input.value.trim();
    if (!txt) return;

    const newMsgSchema = {
      content: txt,
      senderId: state.user.uid,
      senderName: state.userProfile?.displayName || 'Believer',
      senderRole: state.userProfile?.role || 'member',
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'messages'), newMsgSchema);
      input.value = '';
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'messages');
    }
  });
}

// --------------------------------------------------------------------------
// RECURRING BACKGROUND SLIDESHOWS
// --------------------------------------------------------------------------
setInterval(() => {
  state.scriptureIndex = (state.scriptureIndex + 1) % SCRIPTURES.length;
  const slideText = document.getElementById('landing-scripture-text');
  const slideRef = document.getElementById('landing-scripture-ref');
  if (slideText && slideRef) {
    slideText.style.opacity = '0';
    slideRef.style.opacity = '0';
    setTimeout(() => {
      slideText.textContent = `"${SCRIPTURES[state.scriptureIndex].text}"`;
      slideRef.textContent = `— ${SCRIPTURES[state.scriptureIndex].ref}`;
      slideText.style.opacity = '1';
      slideRef.style.opacity = '1';
    }, 400);
  }
}, 5000);

// --------------------------------------------------------------------------
// REAL BOOTSTRAPPING SENSOR GATE
// --------------------------------------------------------------------------
registerStateRef(() => state);

onAuthStateChanged(auth, user => {
  state.authLoading = false;
  state.user = user;
  
  if (user) {
    initializeRealTimeSyncs(user);
  } else {
    // Return to Landing / Clear out subscriptions safely
    unsubscribeAll();
    state.userProfile = null;
    gotoView('landing');
  }
});


