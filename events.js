/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ICONS } from './icons.js';

// Helper to get name of month
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const EVENT_TYPE_STYLING = {
  worship: {
    label: "Worship Service",
    badge: "bg-blue-500/15 border-blue-500/30 text-blue-400",
    dot: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"
  },
  bible_study: {
    label: "KJV Bible Study",
    badge: "bg-purple-500/15 border-purple-500/30 text-purple-400",
    dot: "bg-purple-500 shadow-[0_0_8px_rgba(167,139,250,0.6)]"
  },
  prayer: {
    label: "Spiritual Intercession",
    badge: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
    dot: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
  },
  charity: {
    label: "Community Action",
    badge: "bg-amber-500/15 border-amber-500/30 text-amber-400",
    dot: "bg-amber-500 shadow-[0_0_8px_rgba(217,119,6,0.6)]"
  },
  youth_fellowship: {
    label: "Youth Gathering",
    badge: "bg-pink-500/15 border-pink-500/30 text-pink-400",
    dot: "bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.6)]"
  }
};

export function renderEvents(state) {
  const profile = state.userProfile || {};
  const originEvents = state.events || [];

  // 1. Initialize calendar period if not set
  if (state.eventsCurrentYear === undefined || state.eventsCurrentMonth === undefined) {
    const today = new Date();
    state.eventsCurrentYear = today.getFullYear();
    state.eventsCurrentMonth = today.getMonth(); // 0-11
  }

  const curYear = state.eventsCurrentYear;
  const curMonth = state.eventsCurrentMonth;

  // Selected date filter
  const selectedDateFilter = state.selectedEventDate || null; // YYYY-MM-DD
  const activeEventsTab = state.eventsFilterType || 'all'; // 'all' or categories

  // Let's filter original events based on category filter
  let displayEvents = originEvents;
  if (activeEventsTab !== 'all') {
    displayEvents = displayEvents.filter(e => e.type === activeEventsTab);
  }

  // Also filter based on selected date if clicked
  let selectedDateEvents = [];
  if (selectedDateFilter) {
    selectedDateEvents = originEvents.filter(e => e.date === selectedDateFilter);
  }

  // Compile calendar details
  const firstDayIndex = new Date(curYear, curMonth, 1).getDay(); // Day of week (0-6)
  const totalDaysInMonth = new Date(curYear, curMonth + 1, 0).getDate(); // Days count

  // Get date of today
  const isTargetMonthToday = new Date().getFullYear() === curYear && new Date().getMonth() === curMonth;
  const todayDateNum = new Date().getDate();

  // Create grid cells
  const gridCells = [];
  
  // Empty buffer cells for preceding month
  for (let i = 0; i < firstDayIndex; i++) {
    gridCells.push(`<div class="bg-[#120f26]/10 border border-purple-500/5 min-h-[4.5rem] rounded-xl opacity-20 pointer-events-none select-none"></div>`);
  }

  // Actual days inside current month
  for (let dayNum = 1; dayNum <= totalDaysInMonth; dayNum++) {
    const dayStr = String(dayNum).padStart(2, '0');
    const monthStr = String(curMonth + 1).padStart(2, '0');
    const fullDateKey = `${curYear}-${monthStr}-${dayStr}`;

    const isToday = isTargetMonthToday && dayNum === todayDateNum;
    const isSelected = selectedDateFilter === fullDateKey;

    // Filter events occurring on this date
    const dayEvents = originEvents.filter(evt => evt.date === fullDateKey);

    // Render little event dots inside calendar cell
    const dotsHtml = dayEvents.map(evt => {
      const cls = EVENT_TYPE_STYLING[evt.type] || { dot: 'bg-purple-300' };
      return `<span class="w-1.5 h-1.5 rounded-full ${cls.dot}" title="${evt.title}"></span>`;
    }).join("");

    const todayBorder = isToday ? 'border border-[#d97706]/40 bg-[#d97706]/5' : 'border border-purple-500/10 hover:border-purple-500/30';
    const selectedBackground = isSelected ? 'bg-purple-500/30 border-purple-400!' : '';

    gridCells.push(`
      <button data-calendar-day-key="${fullDateKey}" class="min-h-[4.5rem] flex flex-col justify-between p-2 rounded-xl text-left bg-[#100c21]/40 hover:bg-[#1c1638]/50 transition-all select-none btn-press relative cursor-pointer group ${todayBorder} ${selectedBackground}">
        <div class="flex justify-between items-center w-full">
          <span class="text-xs sm:text-sm font-bold font-['Space_Grotesk'] ${isToday ? 'text-amber-400 font-extrabold' : 'text-purple-100 group-hover:text-white'}">${dayNum}</span>
          ${isToday ? `<span class="text-[8px] bg-amber-500/15 border border-amber-500/20 text-amber-400 px-1 py-0.5 rounded-md font-bold font-['JetBrains_Mono']">Tdy</span>` : ""}
        </div>
        <div class="flex flex-wrap gap-1 mt-auto">
          ${dotsHtml}
        </div>
      </button>
    `);
  }

  // Create grid HTML row-by-row
  const gridHtml = gridCells.join('');

  // Tab filter items HTML
  const FILTER_TABS = [
    { key: 'all', label: 'All Services' },
    { key: 'worship', label: '⛪ Worship' },
    { key: 'bible_study', label: '📖 study' },
    { key: 'prayer', label: '🙏 intercession' },
    { key: 'charity', label: '🤝 Outreach' },
    { key: 'youth_fellowship', label: '🌱 Youth' }
  ];

  const filterTabsHtml = FILTER_TABS.map(tab => {
    const isActive = activeEventsTab === tab.key;
    const cls = isActive 
      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold' 
      : 'text-[#9ca3af] hover:text-white border border-transparent hover:bg-white/5';
    return `
      <button data-events-tab-filter="${tab.key}" class="py-1.5 px-3 rounded-xl text-[10px] sm:text-xs leading-none transition-all btn-press cursor-pointer uppercase font-['JetBrains_Mono'] ${cls}">
        ${tab.label}
      </button>
    `;
  }).join('');

  // List upcoming events in chronological order (maximum 10)
  const tomorrowStr = new Date();
  tomorrowStr.setHours(0,0,0,0);
  const tStr = tomorrowStr.toISOString().split('T')[0];

  const sortedUpcoming = [...displayEvents]
    .filter(e => e.date >= tStr)
    .sort((a,b) => a.date.localeCompare(b.date))
    .slice(0, 10);

  const listUpcomingHtml = sortedUpcoming.length > 0 ? sortedUpcoming.map(evt => {
    const isAttending = evt.attendeeIds?.includes(profile.uid);
    const rsvpLabel = isAttending ? '✓ Attending' : 'RSVP';
    const rsvpTitle = isAttending ? 'You are attending this fellowship' : 'RSVP for event';
    const rsvpBtnCls = isAttending 
      ? 'bg-gradient-grace text-white border border-green-500/20 hover:opacity-90 font-bold px-3 py-1.5 rounded-lg text-xs' 
      : 'bg-white/5 hover:bg-white/10 text-white font-bold px-3 py-1.5 rounded-lg text-xs border border-white/10';

    const sty = EVENT_TYPE_STYLING[evt.type] || { label: 'Special Service', badge: 'bg-purple-500/10 text-purple-400 border border-purple-500/20' };

    return `
      <div class="glass p-4 rounded-xl border border-purple-500/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all hover-lift" id="evt-card-${evt.id}">
        <div class="space-y-1 text-left flex-grow">
          <div class="flex flex-wrap items-center gap-2">
            <span class="inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${sty.badge}">
              ${sty.label}
            </span>
            <span class="text-[10px] text-purple-300 font-bold font-['JetBrains_Mono']">
              📅 ${evt.date} @ ${evt.time || '19:00'}
            </span>
          </div>
          <h4 class="text-sm sm:text-base font-extrabold text-white font-['Space_Grotesk'] leading-snug">${evt.title}</h4>
          <p class="text-xs text-[#9ca3af] leading-relaxed max-w-xl">${evt.description || 'Special service centered around scriptural intercession, mutual support, and joint fellowship in King James Bible teachings.'}</p>
          <div class="flex items-center gap-1.5 pt-1 text-[10px] text-[#9ca3af]/80">
            <span>📍 ${evt.location || 'Parish Community Auditorium'}</span>
          </div>
        </div>

        <!-- RSVP Area -->
        <div class="flex sm:flex-col items-end gap-2 justify-between border-t sm:border-t-0 border-purple-500/5 pt-3 sm:pt-0 shrink-0">
          <span class="text-[10px] text-[#9ca3af] font-semibold font-['JetBrains_Mono'] whitespace-nowrap">
            👥 ${evt.attendeeCount || 0} RSVPs
          </span>
          <button data-rsvp-event-id="${evt.id}" class="${rsvpBtnCls} cursor-pointer hover-lift font-bold btn-press" title="${rsvpTitle}">
            ${rsvpLabel}
          </button>
        </div>
      </div>
    `;
  }).join('') : `
    <div class="glass p-8 text-center rounded-xl border border-purple-500/10 space-y-2">
      <span class="text-3xl">📭</span>
      <h3 class="text-xs font-bold text-white uppercase font-['Space_Grotesk']">No Upcoming Services found</h3>
      <p class="text-[11px] text-[#9ca3af]">Adjust tabs/category criteria or check in later for updated parish programs.</p>
    </div>
  `;

  // Selected date indicator
  let selectedDateDetailHtml = '';
  if (selectedDateFilter) {
    const listForSelectedDate = selectedDateEvents.map(evt => {
      const isAttending = evt.attendeeIds?.includes(profile.uid);
      const rsvpClass = isAttending 
        ? 'bg-gradient-grace text-white border border-green-500/20' 
        : 'bg-white/5 hover:bg-white/10 text-white border border-white/10';
      const rsvpLabel = isAttending ? '✓ Attending' : 'RSVP Input';
      return `
        <div class="p-3 bg-purple-950/20 rounded-xl border border-purple-500/5 flex justify-between items-center gap-3">
          <div class="text-left space-y-0.5 min-w-0">
            <span class="text-[8px] font-bold text-amber-400 font-['JetBrains_Mono'] uppercase">${evt.type.toUpperCase()}</span>
            <h5 class="text-xs font-bold text-white truncate">${evt.title}</h5>
            <p class="text-[10px] text-[#9ca3af] truncate">🕒 ${evt.time || '19:00'} @ ${evt.location}</p>
          </div>
          <button data-rsvp-event-id="${evt.id}" class="${rsvpClass} px-2.5 py-1 text-[10px] rounded font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap">
            ${rsvpLabel}
          </button>
        </div>
      `;
    }).join('');

    selectedDateDetailHtml = `
      <div class="glass p-5 rounded-xl border border-purple-500/10 space-y-3 animate-fade-up">
        <div class="flex justify-between items-center border-b border-purple-500/10 pb-2">
          <h4 class="text-xs font-extrabold text-white font-['Space_Grotesk'] uppercase flex items-center gap-1">
            <span>📅</span> Activity for ${selectedDateFilter}
          </h4>
          <button id="btn-clear-date-filter" class="text-[9px] font-bold text-purple-400 hover:text-white uppercase font-['JetBrains_Mono'] btn-press select-none cursor-pointer">
            Show All &times;
          </button>
        </div>
        <div class="space-y-2 max-h-64 overflow-y-auto pr-1">
          ${listForSelectedDate || `<p class="text-[10px] text-[#9ca3af] text-left">No localized events on this date.</p>`}
        </div>
      </div>
    `;
  }

  // Determine if user can administer events (cell_leader, pastor, super_admin)
  const isPrivileged = profile.role === 'cell_leader' || profile.role === 'pastor' || profile.role === 'super_admin';

  return `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-up max-w-6xl mx-auto pb-8 relative overflow-hidden text-animation-smooth">
      <!-- Side view panel containing filters, summaries, and composer -->
      <aside class="lg:col-span-1 space-y-6 flex flex-col select-none">
        
        <!-- Filter Tabs / Card Header -->
        <div class="glass p-4 rounded-2xl border border-purple-500/10 space-y-3">
          <h3 class="text-xs font-bold text-white uppercase tracking-wider font-['Space_Grotesk'] text-left">Category Filter</h3>
          <div class="flex flex-wrap gap-1.5 justify-start">
            ${filterTabsHtml}
          </div>
        </div>

        <!-- Selected date inspector -->
        ${selectedDateDetailHtml}

        <!-- Interactive add event button (for cellular supervisors / clergy) -->
        ${isPrivileged ? `
          <div class="glass p-5 rounded-2xl border border-purple-500/10 text-left space-y-3">
            <div>
              <h4 class="text-xs font-extrabold text-[#f59e0b] uppercase font-['Space_Grotesk']">Parish Stewardship</h4>
              <p class="text-[10px] text-[#9ca3af] mt-0.5 leading-relaxed">As a leader, you can deploy new services, studies, or joint cell workshops to the universal calendar stream.</p>
            </div>
            <button id="btn-trigger-add-event" class="w-full bg-gradient-spiritual border border-purple-400/20 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1 hover-lift btn-press cursor-pointer">
              ${ICONS.plus} Dispatch Parish Event
            </button>
          </div>
        ` : ''}

        <!-- Quick Info Panel -->
        <div class="glass p-5 rounded-2xl border border-purple-500/10 text-left text-[11px] text-[#9ca3af] leading-relaxed hidden lg:block">
          <h4 class="font-bold text-white font-['Space_Grotesk'] mb-1.5 uppercase text-xs">Aesthetic Translation Guides</h4>
          <p class="mb-2">Services highlighted with a dot represent scheduled assemblies of study and prayers.</p>
          <p class="mb-2">Click any day layout square in the month grid tool on the right to drill down and review only details occurring on that date.</p>
          <p>Please remember to submit RSVPs accurately to allow fellowship cells to plan seating and catering properly.</p>
        </div>

      </aside>

      <!-- Calendar and Detailed Feed panel -->
      <main class="lg:col-span-2 space-y-6">
        
        <!-- Desktop Month Grid Panel -->
        <div class="glass p-5 rounded-2xl border border-purple-500/10 space-y-4">
          
          <!-- Month grid actions -->
          <div class="flex justify-between items-center select-none">
            <h3 class="text-base sm:text-lg font-extrabold text-white font-['Space_Grotesk'] flex items-center gap-1">
              <span>🗓️</span> ${MONTH_NAMES[curMonth]} ${curYear}
            </h3>
            <div class="flex gap-2.5">
              <button id="btn-calendar-prev" class="bg-white/5 border border-white/10 hover:bg-white/10 p-2.5 rounded-xl flex items-center justify-center w-9 h-9 btn-press cursor-pointer" title="Previous Month">
                ${ICONS['chevron-left']}
              </button>
              <button id="btn-calendar-next" class="bg-white/5 border border-white/10 hover:bg-white/10 p-2.5 rounded-xl flex items-center justify-center w-9 h-9 btn-press cursor-pointer" title="Next Month">
                ${ICONS['chevron-right']}
              </button>
            </div>
          </div>

          <!-- Week headers -->
          <div class="grid grid-cols-7 gap-1.5 text-center text-[9px] font-bold text-purple-400 uppercase tracking-widest font-['JetBrains_Mono'] border-b border-purple-500/10 pb-2 select-none">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <!-- Main calendar days grid matrix -->
          <div class="grid grid-cols-7 gap-1.5" id="calendar-days-grid">
            ${gridHtml}
          </div>

        </div>

        <!-- Scrollable full listings -->
        <div class="space-y-4">
          <h3 class="text-xs font-bold text-white uppercase tracking-wider font-['Space_Grotesk'] text-left select-none">
            Upcoming Gatherings & Programs
          </h3>
          <div class="space-y-3.5" id="events-full-list">
            ${listUpcomingHtml}
          </div>
        </div>

      </main>

      <!-- DISPATCH EVENT FLOATING OVERLAY MODAL (Privileged only, hidden index) -->
      <div id="add-event-orchestrate-overlay" class="hidden fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div class="max-w-md w-full glass p-6 rounded-2xl border border-purple-500/10 space-y-4 animate-fade-up">
          <div class="flex justify-between items-center border-b border-purple-500/10 pb-2 select-none">
            <h3 class="text-base font-extrabold text-white font-['Space_Grotesk'] flex items-center gap-1">
              <span>⛪</span> Orchestrate Parish Event
            </h3>
            <button id="btn-close-event-orchestration" class="text-purple-400 hover:text-white text-xl p-1 font-bold btn-press cursor-pointer">&times;</button>
          </div>

          <form id="orchestrate-event-form" class="space-y-4 text-left">
            <div>
              <label class="block text-xs font-semibold text-purple-200/80 mb-1 uppercase font-['JetBrains_Mono']">Topic Title</label>
              <input type="text" id="add-evt-title" required class="w-full glass px-4 py-3 rounded-xl border border-purple-500/10 text-white text-xs" placeholder="e.g. Damascus Road Fellowship Hour">
            </div>
            <div>
              <label class="block text-xs font-semibold text-purple-200/80 mb-1 uppercase font-['JetBrains_Mono']">Overview Description</label>
              <textarea id="add-evt-desc" class="w-full glass px-4 py-3 rounded-xl border border-purple-500/10 text-white text-xs h-20" placeholder="Focus of discussion, comfort verses, studying goals..."></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-purple-200/80 mb-1 uppercase font-['JetBrains_Mono']">Service Date</label>
                <input type="date" id="add-evt-date" required class="w-full glass px-4 py-3 rounded-xl border border-purple-500/10 text-white text-xs">
              </div>
              <div>
                <label class="block text-xs font-semibold text-purple-200/80 mb-1 uppercase font-['JetBrains_Mono']">Service Time</label>
                <input type="time" id="add-evt-time" required class="w-full glass px-4 py-3 rounded-xl border border-purple-500/10 text-white text-xs" value="19:00">
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4">
              <div>
                <label class="block text-xs font-semibold text-purple-200/80 mb-1 uppercase font-['JetBrains_Mono']">Assembly Location / Address</label>
                <input type="text" id="add-evt-location" required class="w-full glass px-4 py-3 rounded-xl border border-purple-500/10 text-white text-xs" placeholder="e.g. Room B or Zoom Coordinate">
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-purple-200/80 mb-1 uppercase font-['JetBrains_Mono']">Gathering Category</label>
              <select id="add-evt-type" required class="w-full bg-[#120f26] border border-purple-500/10 text-white px-4 py-3 rounded-xl text-xs cursor-pointer h-11">
                <option value="worship">⛪ Parish Worship Gathering</option>
                <option value="bible_study">📖 Intercess study (KJV)</option>
                <option value="prayer">🙏 Spiritual Communion Intercession</option>
                <option value="charity">🤝 Outreach & Kindness</option>
                <option value="youth_fellowship">🌱 Youth & Kids Study</option>
              </select>
            </div>

            <button type="submit" class="w-full bg-gradient-spiritual text-white font-bold py-3 px-4 rounded-xl shadow-lg border border-purple-400/20 hover-lift btn-press cursor-pointer flex justify-center items-center">
              Publish Fellowship Event
            </button>
          </form>
        </div>
      </div>
    </div>
  `;
}
