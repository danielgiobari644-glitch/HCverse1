/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ICONS } from './icons.js';
import { timeAgo, ROLE_COLORS, PRAYER_EMOJIS } from './constants.js';
import { BIBLE_BOOKS } from './bible_books.js';

export function renderBible(state) {
  const currentBook = state.bibleBook || "John";
  const currentChapter = state.bibleChapter || 1;
  const verses = state.bibleVerses || [];
  const loading = state.bibleLoading;

  const bookOptions = BIBLE_BOOKS.map(b => `<option value="${b.name}" ${b.name === currentBook ? 'selected' : ''}>${b.name}</option>`).join('');

  // Selected book data
  const bookMeta = BIBLE_BOOKS.find(b => b.name === currentBook) || { chapters: 1 };
  const chapterOptions = Array.from({ length: bookMeta.chapters || 28 }, (_, i) => i + 1)
    .map(ch => `<option value="${ch}" ${ch == currentChapter ? 'selected' : ''}>Ch ${ch}</option>`)
    .join('');

  const versesListHtml = loading ? `
    <div class="col-span-full py-16 text-center space-y-3">
      <div class="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="text-xs text-purple-400 font-semibold font-['JetBrains_Mono'] uppercase tracking-widest animate-pulse">Consulting Scriptures...</p>
    </div>
  ` : verses.map(v => {
    return `
      <div class="py-3 px-4 rounded-xl hover:bg-white/5 transition-colors border-l-2 border-purple-500/5 hover:border-purple-500/30 text-left relative flex items-start gap-4">
        <span class="text-xs font-bold text-purple-400 font-['JetBrains_Mono'] mt-0.5 select-none">${v.id || v.verse}</span>
        <p class="text-sm leading-relaxed text-[#e8e6f0]/95 font-serif select-text">${v.text}</p>
      </div>
    `;
  }).join('');

  return `
    <div class="max-w-3xl mx-auto space-y-6 animate-fade-up">
      <!-- Nav Header Controls -->
      <div class="glass p-4 rounded-2xl border-purple-500/10 flex flex-col sm:flex-row gap-4 justify-between items-center select-none">
        <div class="flex items-center gap-2.5 w-full sm:w-auto">
          <!-- Book trigger -->
          <select id="bible-book-select" class="bg-[#120f26] border border-purple-500/10 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex-grow sm:flex-grow-0 cursor-pointer h-10 ring-none focus:outline-none">
            ${bookOptions}
          </select>
          <!-- Chapter trigger -->
          <select id="bible-chapter-select" class="bg-[#120f26] border border-purple-500/10 text-white font-bold py-2.5 px-4 rounded-xl text-xs cursor-pointer h-10 focus:outline-none">
            ${chapterOptions}
          </select>
        </div>

        <div class="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button id="bible-btn-prev" class="bg-white/5 border border-white/10 hover:bg-white/10 p-2.5 rounded-xl flex items-center justify-center w-10 h-10 btn-press cursor-pointer" title="Previous Chapter">
            ${ICONS['chevron-left']}
          </button>
          <button id="bible-btn-next" class="bg-white/5 border border-white/10 hover:bg-white/10 p-2.5 rounded-xl flex items-center justify-center w-10 h-10 btn-press cursor-pointer" title="Next Chapter">
            ${ICONS['chevron-right']}
          </button>
        </div>
      </div>

      <!-- Scrolled Reading Stage -->
      <div class="glass p-6 sm:p-8 rounded-2xl border-purple-500/10 min-h-[40vh] space-y-2 relative overflow-hidden bg-gradient-to-b from-purple-950/5 to-transparent">
        <div class="text-center pb-5 mb-5 border-b border-purple-500/10 select-none">
          <h2 class="text-2xl font-extrabold text-white font-['Space_Grotesk']">${currentBook} Chapter ${currentChapter}</h2>
          <span class="text-[9px] text-[#9ca3af] font-semibold tracking-widest uppercase font-['JetBrains_Mono'] mt-1 block">King James Version (KJV)</span>
        </div>

        <div class="space-y-1">
          ${versesListHtml || `
            <div class="text-center py-10 text-xs text-[#9ca3af]">Selected Chapter Empty. Please select a valid scripture chapter.</div>
          `}
        </div>
      </div>
    </div>
  `;
}

export function renderDevotionals(state) {
  const profile = state.userProfile || {};
  const list = state.devotionals || [];
  const selectedId = state.selectedDevotionalId;
  const isPastor = profile.role === 'pastor' || profile.role === 'super_admin';

  const activeDevo = list.find(d => d.id === selectedId) || list.find(d => !d.cellId) || list[0];

  const sidebarRowsHtml = list.map(dev => {
    const isSelected = activeDevo && dev.id === activeDevo.id;
    const selectedClass = isSelected ? 'bg-purple-500/20 border-l-2 border-purple-500 text-purple-200' : 'hover:bg-white/5 border-l-2 border-transparent text-[#9ca3af]';
    return `
      <button data-select-devo-id="${dev.id}" class="w-full text-left py-3 px-4 border-b border-purple-500/5 flex flex-col gap-1 transition-all duration-150 btn-press cursor-pointer ${selectedClass}">
        <h4 class="text-xs font-bold truncate text-white leading-snug">${dev.title}</h4>
        <span class="text-[9px] font-semibold font-['JetBrains_Mono'] opacity-75">${dev.scriptureRef}</span>
      </button>
    `;
  }).join('');

  let readerHtml = '';
  if (activeDevo) {
    const isCreator = activeDevo.uploadedBy === profile.uid || profile.role === 'super_admin';
    readerHtml = `
      <div class="space-y-5 text-left animate-fade-up">
        <div class="space-y-2 border-b border-purple-500/10 pb-4">
          <div class="flex items-center gap-1.5 justify-between">
            <span class="text-[9px] font-bold text-purple-400 tracking-widest uppercase font-['JetBrains_Mono']">Daily Word</span>
            ${isCreator ? `<button data-delete-devo-id="${activeDevo.id}" class="text-red-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-xl text-xs btn-press cursor-pointer" title="Delete Devotional">${ICONS.trash}</button>` : ''}
          </div>
          <h2 class="text-2xl font-extrabold text-white font-['Space_Grotesk']">${activeDevo.title}</h2>
          <p class="text-xs text-purple-300 font-semibold font-['JetBrains_Mono']">📍 ${activeDevo.scriptureRef}</p>
        </div>
        <article class="text-sm text-[#e8e6f0]/95 leading-relaxed font-serif whitespace-pre-line select-text">
          ${activeDevo.content}
        </article>
        <div class="border-t border-purple-500/5 text-xs text-purple-400 select-none font-bold pt-4 font-['JetBrains_Mono']">
          Author: ${activeDevo.author || "HCVerse Parish Council"}
        </div>
      </div>
    `;
  } else {
    readerHtml = `
      <div class="text-center py-16 space-y-2 select-none">
        <span class="text-4xl">📖</span>
        <h3 class="text-sm font-bold text-white uppercase">Study Desk Cleared</h3>
        <p class="text-xs text-[#9ca3af]">No active devotional materials are available currently.</p>
      </div>
    `;
  }

  return `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-up h-[calc(screen-12rem)] relative overflow-hidden">
      <!-- Sidebar lists -->
      <aside class="md:col-span-1 glass border-purple-500/10 rounded-2xl p-4 flex flex-col h-full overflow-hidden select-none">
        <div class="flex items-center justify-between border-b border-purple-500/10 pb-3 mb-3">
          <h3 class="text-xs font-bold text-white uppercase tracking-wider font-['Space_Grotesk']">Archived Devotions</h3>
          ${isPastor ? `<button id="btn-show-add-devo" class="p-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs rounded-xl border border-purple-500/20 font-bold btn-press flex items-center justify-center cursor-pointer" title="Add Devotional">${ICONS.plus} Post</button>` : ''}
        </div>
        <div class="flex-grow overflow-y-auto space-y-0.5 max-h-[50vh] md:max-h-full">
          ${sidebarRowsHtml || '<p class="text-xs text-[#9ca3af] py-10 text-center">No devotionals written.</p>'}
        </div>
      </aside>

      <!-- Main reading pane -->
      <div class="md:col-span-2 glass border-purple-500/10 rounded-2xl p-6 sm:p-8 overflow-y-auto h-full relative">
        ${readerHtml}
      </div>

      <!-- ADD DEVOTIONAL MODAL (Pastor trigger, hidden by default) -->
      <div id="add-devo-overlay" class="hidden fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 select-none">
        <div class="max-w-md w-full glass p-6 rounded-2xl border-purple-500/10 space-y-4 animate-fade-up">
          <div class="flex justify-between items-center border-b border-purple-500/10 pb-2">
            <h3 class="text-lg font-bold text-white font-['Space_Grotesk']">Dispatch Daily Devotional</h3>
            <button id="btn-close-devo" class="text-purple-400 hover:text-white text-xl font-bold btn-press cursor-pointer">&times;</button>
          </div>

          <form id="add-devo-form" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-purple-200/80 mb-1 uppercase font-['JetBrains_Mono']">Topic Title</label>
              <input type="text" id="add-devo-title" required class="w-full glass px-4 py-3 rounded-xl border border-purple-500/10 text-white text-xs" placeholder="e.g. Walking in Grace">
            </div>
            <div>
              <label class="block text-xs font-semibold text-purple-200/80 mb-1 uppercase font-['JetBrains_Mono']">Scripture Index Reference</label>
              <input type="text" id="add-devo-ref" required class="w-full glass px-4 py-3 rounded-xl border border-purple-500/10 text-white text-xs" placeholder="e.g. John 15:5">
            </div>
            <div>
              <label class="block text-xs font-semibold text-purple-200/80 mb-1 uppercase font-['JetBrains_Mono']">Theological Content study text</label>
              <textarea id="add-devo-content" required class="w-full glass px-4 py-3 rounded-xl border border-purple-500/10 text-white text-xs h-36" placeholder="Break down the translation coordinates..."></textarea>
            </div>

            <button type="submit" class="w-full bg-gradient-spiritual text-white font-bold py-3 px-4 rounded-xl shadow-lg border border-purple-400/20 hover-lift btn-press cursor-pointer flex justify-center items-center">
              Dispatch Today's Word
            </button>
          </form>
        </div>
      </div>
    </div>
  `;
}

export function renderQuiz(state) {
  const profile = state.userProfile || {};
  const activePlay = state.quizActive;
  const questions = state.quizQuestions || [];
  const qIdx = state.quizQuestionIndex || 0;
  const score = state.quizScore || 0;
  const timer = state.quizTimer || 15;

  let panelHtml = '';

  if (!activePlay) {
    panelHtml = `
      <div class="text-center py-10 space-y-5 select-none animate-fade-up">
        <span class="text-5xl inline-block animate-float">🏆</span>
        <div class="space-y-1">
          <h2 class="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk']">Bible Wisdom Challenge</h2>
          <p class="text-xs text-purple-300/60 max-w-sm mx-auto">10 random theological question sets. Each question grants exactly 15 seconds to solve.</p>
        </div>

        <div class="inline-flex glass border-purple-500/15 py-2 px-5 rounded-2xl items-center gap-3">
          <div class="text-left">
            <span class="block text-[8px] text-purple-400 font-extrabold uppercase font-['JetBrains_Mono']">My Highest Score</span>
            <span id="quiz-high-score" class="text-base font-extrabold text-[#f59e0b]">${profile.quizScore || 0} / 10 Correct</span>
          </div>
        </div>

        <div>
          <button id="btn-quiz-start" class="bg-gradient-spiritual text-white font-extrabold py-3.5 px-10 rounded-xl shadow-lg border border-purple-400/20 hover-lift btn-press cursor-pointer">
            Begin Wisdom Study
          </button>
        </div>
      </div>
    `;
  } else if (qIdx >= questions.length) {
    // Game completed summary
    const pct = Math.round((score / questions.length) * 100);
    let title = 'Believer';
    if (pct >= 85) title = 'Elder Scholar 🎓';
    else if (pct >= 60) title = 'Deacon 📖';
    else title = 'Disciple 🌱';

    panelHtml = `
      <div class="text-center py-8 space-y-6 select-none animate-fade-up">
        <span class="text-5xl inline-block">🎉</span>
        <div class="space-y-1">
          <span class="inline-block bg-[#f59e0b]/10 text-[#f59e0b] text-[10px] font-bold uppercase py-0.5 px-2 rounded-full border border-[#f59e0b]/20 font-['JetBrains_Mono']">${title}</span>
          <h3 class="text-2xl font-extrabold text-white font-['Space_Grotesk']">Wisdom Scoreboard</h3>
          <p class="text-xs text-purple-400 font-bold font-['JetBrains_Mono']">Completed with ${score} of ${questions.length} correct</p>
        </div>

        <div class="max-w-xs mx-auto glass p-5 rounded-xl border border-purple-500/10 space-y-2.5">
          <div class="flex justify-between text-xs">
            <span class="text-[#9ca3af]">Accuracy Tally</span>
            <span class="text-white font-semibold font-['JetBrains_Mono']">${pct}%</span>
          </div>
          <div class="w-full bg-[#120e23] h-2 rounded-lg overflow-hidden border border-purple-500/5">
            <div class="bg-gradient-spiritual h-full transition-all duration-300" style="width: ${pct}%"></div>
          </div>
        </div>

        <div class="flex gap-4 justify-center">
          <button id="btn-quiz-retry" class="bg-gradient-spiritual text-white font-bold py-2.5 px-6 rounded-xl border border-purple-400/20 hover-lift btn-press cursor-pointer">Re-challenge</button>
          <button data-goto-view="home" class="bg-white/5 border border-white/10 hover:bg-white/10 py-2.5 px-6 rounded-xl text-xs font-bold btn-press cursor-pointer">Home Hub</button>
        </div>
      </div>
    `;
  } else {
    // Render questioning screen
    const qObj = questions[qIdx];
    const optionBtns = qObj.options.map((opt, oIdx) => {
      return `
        <button data-quiz-option-idx="${oIdx}" class="w-full text-left bg-[#100c21] border border-purple-500/10 hover:border-purple-500/35 hover:bg-[#1a1433] px-5 py-3.5 rounded-2xl text-xs md:text-sm font-semibold text-purple-100 transition-all btn-press text-left cursor-pointer flex justify-between items-center group">
          <span>${opt}</span>
          <span class="opacity-0 group-hover:opacity-100 transition-opacity text-purple-400">&rarr;</span>
        </button>
      `;
    }).join('');

    // Timer layout bar
    const widthPct = Math.round((timer / 15) * 100);
    const timerColor = timer <= 5 ? 'bg-red-500' : 'bg-gradient-spiritual';

    panelHtml = `
      <div class="space-y-6 text-left animate-fade-up select-none">
        <div class="flex justify-between items-center border-b border-purple-500/10 pb-2 border-dashed">
          <span class="text-xs font-bold text-purple-400 font-['JetBrains_Mono']">Question ${qIdx + 1} of ${questions.length}</span>
          <div class="flex items-center gap-1.5 font-['JetBrains_Mono'] text-xs font-bold text-[#f59e0b]">
            ⏱️ <span id="quiz-countdown-timer-text">${timer}s</span>
          </div>
        </div>

        <div class="space-y-2">
          <!-- Time running tracker -->
          <div class="w-full bg-[#100c21] h-1.5 rounded-full overflow-hidden border border-purple-500/5">
            <div id="quiz-timer-bar" class="h-full transition-all duration-1000 ${timerColor}" style="width: ${widthPct}%"></div>
          </div>
          <p class="text-base sm:text-lg font-bold text-white leading-relaxed font-sans">${qObj.question}</p>
        </div>

        <div class="space-y-3 pt-2">
          ${optionBtns}
        </div>
      </div>
    `;
  }

  return `
    <div class="max-w-xl mx-auto glass p-6 sm:p-8 rounded-2xl border-purple-500/10 min-h-[40vh] flex flex-col justify-center relative">
      ${panelHtml}
    </div>
  `;
}

export function renderPrayerRoom(state) {
  const profile = state.userProfile || {};
  const list = state.prayers || [];
  const selectedCat = state.prayersCategory || 'all';

  // Categories map
  const CATEGORIES = [
    { key: 'all', label: 'All Needs' },
    { key: 'health', label: '❤️ Health' },
    { key: 'family', label: '🏡 Family' },
    { key: 'work', label: '💼 Work' },
    { key: 'spiritual', label: '⚡ Spiritual' },
    { key: 'gratitude', label: '🙌 Gratitude' }
  ];

  const catButtons = CATEGORIES.map(cat => {
    const isActive = selectedCat === cat.key;
    const activeClass = isActive 
      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold' 
      : 'text-[#9ca3af] hover:text-white border border-transparent';
    return `
      <button data-prayer-cat-filter="${cat.key}" class="py-1.5 px-3 rounded-xl text-xs leading-none btn-press cursor-pointer uppercase font-['JetBrains_Mono'] ${activeClass}">
        ${cat.label}
      </button>
    `;
  }).join('');

  // Filtering lists
  const filtered = list.filter(p => {
    if (selectedCat === 'all') return true;
    return p.category === selectedCat;
  });

  const cardsHtml = filtered.map(item => {
    const isPrayed = item.prayedBy?.includes(profile.uid);
    const hasFlame = item.urgency === 'urgent';
    const flameTag = hasFlame ? `<span class="bg-red-500/20 border border-red-500/20 text-red-400 text-[9px] font-extrabold uppercase py-0.5 px-1.5 rounded-full animate-glow-pulse select-none">🔥 Urgent</span>` : '';

    const btnClass = isPrayed 
      ? 'bg-purple-500/20 border border-purple-500/30 text-purple-300 font-extrabold px-3.5 py-1.5 rounded-lg text-[10px] flex items-center gap-1.5 btn-press' 
      : 'bg-gradient-spiritual text-white font-extrabold px-3.5 py-1.5 rounded-lg text-[10px] flex items-center gap-1.5 hover-lift btn-press';

    return `
      <div class="glass p-5 rounded-xl border-purple-500/10 flex flex-col justify-between hover-lift">
        <div class="text-left space-y-2.5">
          <div class="flex justify-between items-center select-none">
            <div class="flex items-center gap-1.5">
              <span class="bg-[#120e23] border border-purple-500/5 text-purple-400/80 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md font-['JetBrains_Mono']">${item.category}</span>
              ${flameTag}
            </div>
            <span class="text-[9px] text-[#9ca3af]/60 font-semibold font-['JetBrains_Mono']">${timeAgo(item.createdAt)}</span>
          </div>
          <p class="text-xs text-[#e8e6f0]/90 leading-relaxed break-words font-sans min-h-[3rem] line-clamp-3">"${item.content}"</p>
          <div class="flex items-center gap-2 border-t border-purple-500/5 pt-2.5 select-none">
            <div class="w-6 h-6 border border-purple-500/10 bg-gradient-to-tr from-purple-500/5 to-indigo-500/5 rounded-full flex items-center justify-center text-[10px] font-bold text-purple-300">
              ${item.userName ? item.userName[0].toUpperCase() : 'U'}
            </div>
            <span class="text-[10px] text-[#9ca3af] font-semibold truncate">Request: ${item.userName || 'Believer'}</span>
          </div>
        </div>

        <div class="flex items-center justify-between border-t border-purple-500/5 mt-4 pt-4 select-none">
          <span class="text-[10px] text-purple-300/80 font-bold font-['JetBrains_Mono']">${item.prayerCount || 0} Intercessors</span>
          <button data-react-prayer-id="${item.id}" class="${btnClass} cursor-pointer">
            🙏 ${isPrayed ? 'Prayed' : 'I Prayed'}
          </button>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="space-y-6 animate-fade-up">
      <!-- Actions headers -->
      <div class="flex flex-col sm:flex-row gap-4 justify-between sm:items-center select-none">
        <div class="flex flex-wrap items-center gap-1.5">
          ${catButtons}
        </div>
        <button id="btn-show-add-prayer" class="bg-gradient-spiritual border border-purple-400/10 py-2.5 px-5 rounded-xl text-xs font-extrabold text-white hover-lift btn-press cursor-pointer flex items-center gap-1.5">
          ${ICONS.plus} Share Prayer Need
        </button>
      </div>

      <!-- Prayer needs timeline -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${filtered.length > 0 ? cardsHtml : `
          <div class="col-span-1 md:col-span-3 glass p-12 text-center rounded-2xl border-purple-500/10 space-y-2">
            <span class="text-4xl animate-float">🕊️</span>
            <h3 class="text-sm font-bold text-white uppercase">Altar quiet</h3>
            <p class="text-xs text-[#9ca3af]">No prayer needs shared under this filter. Be the first to lift a voice.</p>
          </div>
        `}
      </div>

      <!-- ADD PRAYER DIALOG BOX (Hidden by default) -->
      <div id="add-prayer-overlay" class="hidden fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
        <div class="max-w-md w-full glass p-6 rounded-2xl border-purple-500/10 space-y-4 animate-fade-up select-none">
          <div class="flex justify-between items-center border-b border-purple-500/10 pb-2">
            <h3 class="text-lg font-bold text-white font-['Space_Grotesk']">Share Prayer Request</h3>
            <button id="btn-close-prayer" class="text-purple-400 hover:text-white text-xl font-bold btn-press cursor-pointer">&times;</button>
          </div>

          <form id="add-prayer-form" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-purple-200/80 mb-1 uppercase font-['JetBrains_Mono']">Prayer Needs Category</label>
              <select id="add-prayer-cat" required class="w-full bg-[#120f26] border border-purple-500/10 text-white px-4 py-3 rounded-xl text-xs cursor-pointer h-11">
                <option value="health">❤️ Health need</option>
                <option value="family">🏡 Family and Home</option>
                <option value="work">💼 Career and Work</option>
                <option value="spiritual">⚡ Spiritual growth</option>
                <option value="guidance">🛡️ Wisdom / Guidance</option>
                <option value="gratitude">🙌 Praise and Thanks</option>
                <option value="other">🕊️ Other and general</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-purple-200/80 mb-1 uppercase font-['JetBrains_Mono']">Detailed Petition / Concern</label>
              <textarea id="add-prayer-content" required class="w-full glass px-4 py-3 rounded-xl border border-purple-500/10 text-white text-xs h-28" placeholder="Lift up your concerns. Share details so the parish can stand with you..."></textarea>
            </div>
            <div class="flex items-center justify-between bg-purple-950/20 py-2.5 px-4 rounded-xl border border-purple-500/5">
              <div>
                <span class="block text-xs font-bold text-white">Flames Urgency Flag</span>
                <span class="block text-[10px] text-[#9ca3af]">Mark as extremely urgent. Will flaring a warning badge alert online intercessors</span>
              </div>
              <input type="checkbox" id="add-prayer-urgent" class="w-5 h-5 rounded accent-purple-500 border border-purple-500/20 cursor-pointer">
            </div>

            <button type="submit" class="w-full bg-gradient-spiritual text-white font-bold py-3 px-4 rounded-xl shadow-lg border border-purple-400/20 hover-lift btn-press cursor-pointer flex justify-center items-center">
              Submit to Sanctuary Altar
            </button>
          </form>
        </div>
      </div>
    </div>
  `;
}
