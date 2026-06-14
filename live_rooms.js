/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ICONS } from './icons.js';
import { timeAgo } from './constants.js';

/**
 * Renders the Live Chambers View
 * Easy to understand phrasing, with live camera stream preview, live synced chat, and floating emojis
 */
export function renderLiveRoom(state) {
  const profile = state.userProfile || {};
  const currentTab = state.liveRoomTab || 'discussion'; // 'discussion' or 'prayer'
  const chatMessages = state.liveChats || [];
  const emojis = state.liveEmojis || { amen: 0, love: 0, fire: 0, praise: 0, hallelujah: 0, speak: 0 };

  const tabClassActive = 'bg-primary text-[#0d0a27] font-extrabold shadow-[0_0_15px_rgba(167,139,250,0.3)] scale-[1.02]';
  const tabClassInactive = 'bg-white/5 text-purple-200/70 hover:bg-white/10 hover:text-white border border-purple-500/10';

  const roomTitle = currentTab === 'discussion' 
    ? '💡 Core Faith Discussion Chamber' 
    : '🙏 Live Intercession Altar';
  const roomSubtitle = currentTab === 'discussion'
    ? 'Talk together and ask real-time questions about Holy Scriptures, Bible facts, and life matters.'
    : 'Lift your voice, stand in alignment, and enter intercessors circle in a shared prayer stream.';

  const chatPlaceholder = currentTab === 'discussion'
    ? 'Ask a question or share a Bible fact...'
    : 'Write a quick prayer or say Amen...';

  const messagesHtml = chatMessages.map(renderLiveMessageItem).join('');

  return `
    <div class="h-[calc(100vh-6rem)] flex flex-col lg:flex-row gap-6 p-1 sm:p-2 overflow-hidden animate-fade-up">
      <!-- LEFT BROADCAST STREAM PANEL -->
      <div class="flex-grow flex flex-col justify-between bg-[#0e0a26]/40 rounded-3xl border border-purple-500/10 overflow-hidden relative p-5 space-y-4">
        
        <!-- Header status controller -->
        <div class="flex flex-col sm:flex-row gap-4 justify-between sm:items-center relative z-10 border-b border-purple-500/10 pb-4 select-none">
          <div class="text-left">
            <h2 class="text-lg font-extrabold font-['Space_Grotesk'] text-white tracking-tight flex items-center gap-2">
              <span class="inline-block w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
              ${roomTitle}
            </h2>
            <p class="text-xs text-purple-200/60 max-w-md">${roomSubtitle}</p>
          </div>
          
          <div class="flex items-center gap-2">
            <button id="live-tab-discussion-btn" class="px-4 py-2 text-xs rounded-xl transition-all cursor-pointer ${currentTab === 'discussion' ? tabClassActive : tabClassInactive}">
              💡 Discussion Room
            </button>
            <button id="live-tab-prayer-btn" class="px-4 py-2 text-xs rounded-xl transition-all cursor-pointer ${currentTab === 'prayer' ? tabClassActive : tabClassInactive}">
              🙏 Prayer Altar
            </button>
          </div>
        </div>

        <!-- Video stream player section -->
        <div class="flex-grow relative rounded-2xl overflow-hidden bg-black/80 border border-purple-500/5 shadow-2xl flex items-center justify-center group h-64 md:h-auto select-none" id="stream-broadcast-player">
          
          <!-- Webcam local video player element -->
          <video id="live-camera-element" autoplay playsinline muted class="w-full h-full object-cover rounded-2xl absolute inset-0 hidden border border-purple-400/25"></video>
          
          <!-- Animated audio pulse placeholder when webcam is not active -->
          <div id="live-stream-placeholder" class="text-center p-6 space-y-5 transition-opacity max-w-sm absolute z-10 duration-500">
            <div class="inline-flex items-center justify-center p-5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 animate-breathe">
              <span class="text-4xl select-none">${currentTab === 'discussion' ? '🎓' : '🕊️'}</span>
            </div>
            <div>
              <h3 class="text-sm font-bold text-white uppercase tracking-wider">Stream Stage Connected</h3>
              <p class="text-xs text-purple-200/50 mt-1">
                You are listening in live! Click below to start broadcasting your own webcam / camera directly.
              </p>
            </div>
            
            <!-- simulated audience indicators -->
            <div class="flex justify-center -space-x-1.5 pt-2">
              <span class="w-6 h-6 rounded-full border border-[#0d0a27] bg-purple-600 flex items-center justify-center text-[8px] font-bold text-white">M</span>
              <span class="w-6 h-6 rounded-full border border-[#0d0a27] bg-indigo-600 flex items-center justify-center text-[8px] font-bold text-white">S</span>
              <span class="w-6 h-6 rounded-full border border-[#0d0a27] bg-pink-500 flex items-center justify-center text-[8px] font-bold text-white">A</span>
              <span class="w-6 h-6 rounded-full border border-[#0d0a27] bg-amber-500 flex items-center justify-center text-[8px] font-bold text-white">+11</span>
            </div>
          </div>

          <!-- Dynamic reactive floating graphics boundary -->
          <div id="floating-emojis-container" class="absolute inset-0 pointer-events-none z-20 overflow-hidden"></div>

          <!-- Broadcast overlay elements -->
          <div class="absolute top-4 left-4 bg-red-600 text-white font-extrabold px-3 py-1 rounded-full text-[9px] uppercase tracking-widest flex items-center gap-1.5 shadow-lg select-none z-30 animate-pulse">
            <span class="w-1.5 h-1.5 rounded-full bg-white"></span> LIVE
          </div>

          <div class="absolute top-4 right-4 bg-black/60 border border-purple-500/20 text-purple-300 font-extrabold px-3 py-1 rounded-full text-[10px] flex items-center gap-1 shadow-lg select-none z-30 font-mono">
            👥 <span id="stream-active-count">14 Listening</span>
          </div>

          <!-- Interactive video options controller bar -->
          <div class="absolute bottom-4 left-4 right-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 flex flex-wrap gap-3 items-center justify-between rounded-xl z-30 pointer-events-auto select-none opacity-90 group-hover:opacity-100 transition-opacity">
            <div class="flex items-center gap-2">
              <button id="btn-toggle-camera" class="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all shadow-lg active:scale-95 cursor-pointer">
                📹 <span id="camera-btn-text">Turn On My Camera</span>
              </button>
            </div>

            <!-- Emojis reaction buttons board inside stream overlay -->
            <div class="flex items-center gap-1.5 flex-wrap">
              <button data-reaction-action="amen" class="bg-black/40 hover:bg-white/10 text-white border border-white/10 hover:border-purple-400/30 py-1.5 px-2.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95">
                🙏 <span id="reaction-badge-amen" class="text-[9px] font-bold text-purple-300">${emojis.amen || 0}</span>
              </button>
              <button data-reaction-action="love" class="bg-black/40 hover:bg-white/10 text-white border border-white/10 hover:border-purple-400/30 py-1.5 px-2.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95">
                💖 <span id="reaction-badge-love" class="text-[9px] font-bold text-purple-300">${emojis.love || 0}</span>
              </button>
              <button data-reaction-action="fire" class="bg-black/40 hover:bg-white/10 text-white border border-white/10 hover:border-purple-400/30 py-1.5 px-2.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95">
                🔥 <span id="reaction-badge-fire" class="text-[9px] font-bold text-purple-300">${emojis.fire || 0}</span>
              </button>
              <button data-reaction-action="praise" class="bg-black/40 hover:bg-white/10 text-white border border-white/10 hover:border-purple-400/30 py-1.5 px-2.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95">
                ✨ <span id="reaction-badge-praise" class="text-[9px] font-bold text-purple-300">${emojis.praise || 0}</span>
              </button>
              <button data-reaction-action="hallelujah" class="bg-black/40 hover:bg-white/10 text-white border border-white/10 hover:border-purple-400/30 py-1.5 px-2.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95">
                🙌 <span id="reaction-badge-hallelujah" class="text-[9px] font-bold text-purple-300">${emojis.hallelujah || 0}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Easy learning Bible Facts & Devotional Guideline block -->
        <div class="bg-[#120f26]/30 border border-purple-500/5 p-4 rounded-2xl flex items-start gap-3 select-none text-left">
          <span class="text-lg flex-shrink-0">🍀</span>
          <div class="text-xs space-y-1">
            <h4 class="font-extrabold text-purple-300">Simple Room Guidelines</h4>
            <p class="text-[#cfcce8]/80 leading-relaxed font-sans font-medium">
              Everyone is welcome here to learn, ask straightforward questions, or lift their hearts in prayer. Be kind, share simple testmonies, and tap reactions to encourage whoever is leading the stream.
            </p>
          </div>
        </div>
      </div>

      <!-- RIGHT REAL-TIME CHAT PANEL -->
      <div class="w-full lg:w-96 flex flex-col bg-[#0d091e]/80 rounded-3xl border border-purple-500/10 h-full relative" id="live-chat-panel">
        
        <!-- Chat header details -->
        <div class="p-4 border-b border-purple-500/10 text-left select-none flex justify-between items-center">
          <div>
            <h3 class="text-sm font-extrabold text-white">Live Room Conversation</h3>
            <span class="text-[10px] text-purple-400/80 font-mono font-bold uppercase tracking-wider">🟢 REAL-TIME SYNCHRONIZED</span>
          </div>
          <span class="bg-purple-500/10 text-[#C4B5FD] text-[10px] border border-purple-400/20 font-extrabold py-1 px-2 rounded-lg font-mono tracking-widest select-none uppercase shadow-md">
            ${currentTab}
          </span>
        </div>

        <!-- Messages stream container -->
        <div id="live-chat-messages" class="flex-grow overflow-y-auto p-4 space-y-3.5 flex flex-col min-h-[14rem]">
          ${messagesHtml || `
            <div class="my-auto text-center py-12 space-y-2 select-none">
              <span class="text-3xl animate-float">💬</span>
              <p class="text-xs text-[#9ca3af] font-medium max-w-[15rem] mx-auto leading-relaxed">
                Quiet in the discussion chat. Send a message to seed the conversation!
              </p>
            </div>
          `}
        </div>

        <!-- Messages keyboard submit bar -->
        <div class="p-4 border-t border-purple-500/10">
          <form id="live-chat-form" class="flex gap-2.5 items-center">
            <input type="text" id="live-chat-input" required max="200" placeholder="${chatPlaceholder}" class="flex-grow bg-[#0c0919] border border-purple-500/15 rounded-xl px-4 py-3 text-white text-xs placeholder-purple-300/30 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-550 h-11">
            <button type="submit" class="bg-gradient-spiritual hover:opacity-90 transition-all font-bold p-3 rounded-xl shadow-lg border border-purple-400/20 text-white w-11 h-11 flex items-center justify-center cursor-pointer btn-press">
              ${ICONS.send}
            </button>
          </form>
        </div>
      </div>
    </div>
  `;
}

/**
 * Standard live message bullet drawing
 */
export function renderLiveMessageItem(msg) {
  const isMe = msg.userId === (stateRefCurrent()?.user?.uid);
  const userInit = msg.userName ? msg.userName[0].toUpperCase() : 'U';
  
  return `
    <div class="flex items-start gap-2.5 text-left animate-fade-in">
      <div class="w-7 h-7 flex-shrink-0 border border-purple-500/10 bg-gradient-to-tr from-purple-500/15 to-indigo-500/15 rounded-full flex items-center justify-center text-[10px] font-extrabold text-purple-300 select-none shadow">
        ${userInit}
      </div>
      <div class="flex-grow min-w-0">
        <div class="flex items-baseline gap-1.5 select-none">
          <span class="text-[11px] font-bold text-white truncate">${msg.userName || 'Believer'}</span>
          <span class="text-[8px] text-[#9ca3af]/50 font-semibold font-mono">${timeAgo(msg.createdAt)}</span>
        </div>
        <p class="text-xs text-[#d3cbdc]/90 font-medium leading-relaxed font-sans bg-purple-500/[0.02] border border-purple-400/[0.02] rounded-lg p-2 mt-0.5 break-words">
          ${msg.content}
        </p>
      </div>
    </div>
  `;
}

/**
 * Get the current state locally (fallback query)
 */
let stateGetterRef = null;
export function registerStateRef(stRef) {
  stateGetterRef = stRef;
}
function stateRefCurrent() {
  return stateGetterRef ? stateGetterRef() : null;
}

/**
 * Dynamically launches moving floating emojis inside stream broadcast canvas
 */
export function triggerFloatingReaction(emoji) {
  const stg = document.getElementById('floating-emojis-container');
  if (!stg) return;

  const reaction = document.createElement('span');
  reaction.textContent = emoji || '🙏';
  reaction.className = 'absolute bottom-2 text-2xl animate-spin-float pointer-events-none select-none select-none z-20';
  
  // Random horizontal position inside the panel
  const randX = Math.random() * 80 + 10; // between 10% and 90%
  reaction.style.left = `${randX}%`;
  
  // Random font size variation
  const randScale = Math.random() * 0.5 + 0.8;
  reaction.style.transform = `scale(${randScale})`;

  // Add the element
  stg.appendChild(reaction);

  // Auto clean up after animation ends (3000ms)
  setTimeout(() => {
    if (reaction.parentNode === stg) {
      stg.removeChild(reaction);
    }
  }, 2800);
}
