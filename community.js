/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ICONS } from './icons.js';
import { timeAgo, ROLE_COLORS, getGreeting, COMMUNITY_EMOJIS } from './constants.js';

export function renderCells(state) {
  const profile = state.userProfile || {};
  const list = state.cells || [];
  const searchQuery = state.cellsSearchQuery || '';

  // Filter list
  const filtered = list.filter(item => {
    if (item.suspended && profile.role !== 'super_admin') return false;
    const matchVal = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(matchVal) ||
      (item.description && item.description.toLowerCase().includes(matchVal)) ||
      (item.location?.city && item.location.city.toLowerCase().includes(matchVal)) ||
      (item.tags && item.tags.some(t => t.toLowerCase().includes(matchVal)))
    );
  });

  const cellsCards = filtered.map(item => {
    const isMember = item.memberIds?.includes(profile.uid);
    const isLeader = item.leaderId === profile.uid;
    const isSuperAdmin = profile.role === 'super_admin';

    let joinBtnHtml = '';
    if (isMember) {
      joinBtnHtml = `<button data-goto-cell-page="${item.id}" class="bg-[#1c1836] border border-purple-500/20 text-purple-400 font-bold px-4 py-2 rounded-xl text-xs hover:bg-[#251f4c] hover-lift btn-press cursor-pointer">Open Page</button>`;
    } else {
      joinBtnHtml = `<button data-join-cell-id="${item.id}" class="bg-gradient-spiritual text-white font-bold px-4 py-2 rounded-xl text-xs hover-lift btn-press cursor-pointer">Join Cell</button>`;
    }

    const suspendedLabel = item.suspended ? `<span class="bg-red-500/20 text-red-400 text-[10px] font-bold uppercase py-0.5 px-2 rounded-full border border-red-500/20">Suspended</span>` : '';
    const leaderText = item.leaderName ? `Leader: <span class="text-white font-semibold">${item.leaderName}</span>` : 'Leader: <span class="text-white/40 font-semibold">Vacant</span>';

    return `
      <div class="glass p-5 rounded-2xl border-purple-500/10 flex flex-col justify-between hover-lift">
        <div class="space-y-3">
          <div class="flex justify-between items-start">
            <span class="text-xs font-semibold text-purple-400 uppercase tracking-widest font-['JetBrains_Mono']">${item.location?.city || "Worldwide"}</span>
            <div class="flex items-center gap-1.5">${suspendedLabel}</div>
          </div>
          <h4 class="text-lg font-bold text-white font-['Space_Grotesk'] line-clamp-1">${item.name}</h4>
          <p class="text-xs text-[#9ca3af] line-clamp-3 leading-relaxed min-h-[3.3rem]">${item.description || 'Join our cell fellowship for prayer study, accountability, and spiritual growth in KJV scriptures.'}</p>
          
          <div class="text-[11px] text-[#9ca3af] space-y-1 pt-2 border-t border-purple-500/5">
            <p>📅 ${item.meetingSchedule?.day || 'Tuesdays'} at ${item.meetingSchedule?.time || '19:00'}</p>
            <p>⛪ ${leaderText}</p>
          </div>
        </div>
        <div class="flex items-center justify-between border-t border-purple-500/5 mt-4 pt-4">
          <span class="text-xs text-purple-300/80 font-bold font-['JetBrains_Mono']">${item.memberCount || 0} Members</span>
          <div class="flex gap-2">
            ${joinBtnHtml}
            ${isSuperAdmin ? `<button data-delete-cell-id="${item.id}" class="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-xl btn-press cursor-pointer" title="Delete Cell">${ICONS.trash}</button>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="space-y-6 animate-fade-up">
      <!-- Top banner actions -->
      <div class="flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
        <!-- Search bar -->
        <div class="relative max-w-md w-full">
          <span class="absolute left-3.5 top-3 text-[#9ca3af] w-5 h-5 flex items-center justify-center">${ICONS.search}</span>
          <input type="text" id="cells-search-input" value="${searchQuery}" class="w-full glass pl-10 pr-4 py-2.5 rounded-xl border-purple-500/10 text-white placeholder-purple-300/30 focus:outline-none focus:border-purple-500/40 text-sm" placeholder="Search by name, city or tags...">
        </div>
        
        <button id="btn-show-create-cell-overlay" class="bg-gradient-spiritual text-white font-extrabold py-2.5 px-5 rounded-xl border border-purple-400/20 hover-lift btn-press cursor-pointer flex items-center gap-1">
          ${ICONS.plus} New Fellowship Cell
        </button>
      </div>

      <!-- Cells list layout -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${filtered.length > 0 ? cellsCards : `
          <div class="col-span-1 md:col-span-3 glass p-12 text-center rounded-2xl border-purple-500/10 space-y-2">
            <span class="text-4xl">⛪</span>
            <h3 class="text-sm font-bold text-white uppercase">No Cells Discovered</h3>
            <p class="text-xs text-[#9ca3af]">Adjust search keyword filters or request supervisors to setup an initial fellowship cell.</p>
          </div>
        `}
      </div>

      <!-- CREATE CELL FLYOVER MODAL (Hidden by default) -->
      <div id="create-cell-overlay" class="hidden fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
        <div class="max-w-md w-full glass p-6 rounded-2xl border-purple-500/10 space-y-4 animate-fade-up">
          <div class="flex justify-between items-center border-b border-purple-500/10 pb-2">
            <h3 class="text-lg font-bold text-white font-['Space_Grotesk']">Start A Fellowship Cell</h3>
            <button id="btn-close-create-cell" class="text-purple-400 hover:text-white p-1 text-xl font-bold btn-press cursor-pointer">&times;</button>
          </div>

          <form id="create-cell-form" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-purple-200/80 mb-1 uppercase font-['JetBrains_Mono']">Cell Group Name</label>
              <input type="text" id="add-cell-name" required class="w-full glass px-4 py-3 rounded-xl border-purple-500/10 text-white placeholder-purple-300/30 focus:outline-none focus:border-purple-500/40 text-sm" placeholder="e.g. Damascus Road Cell">
            </div>
            <div>
              <label class="block text-xs font-semibold text-purple-200/80 mb-1 uppercase font-['JetBrains_Mono']">Mission / Overview</label>
              <textarea id="add-cell-desc" class="w-full glass px-4 py-3 rounded-xl border-purple-500/10 text-white placeholder-purple-300/30 focus:outline-none focus:border-purple-500/40 text-sm h-20" placeholder="A brief study agenda or heart statement..."></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-purple-200/80 mb-1 uppercase font-['JetBrains_Mono']">City / Geographic hub</label>
                <input type="text" id="add-cell-city" required class="w-full glass px-4 py-3 rounded-xl border-purple-500/10 text-white placeholder-purple-300/30 focus:outline-none focus:border-purple-500/40 text-sm" placeholder="e.g. Madrid, ES">
              </div>
              <div>
                <label class="block text-xs font-semibold text-purple-200/80 mb-1 uppercase font-['JetBrains_Mono']">State / Province</label>
                <input type="text" id="add-cell-state" class="w-full glass px-4 py-3 rounded-xl border-purple-500/10 text-white placeholder-purple-300/30 focus:outline-none focus:border-purple-500/40 text-sm" placeholder="e.g. Madrid">
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-purple-200/80 mb-1 uppercase font-['JetBrains_Mono']">Meeting Day</label>
                <input type="text" id="add-cell-day" required class="w-full glass px-4 py-3 rounded-xl border-purple-500/10 text-white focus:outline-none focus:border-purple-500/40 text-sm" placeholder="e.g. Tuesday">
              </div>
              <div>
                <label class="block text-xs font-semibold text-purple-200/80 mb-1 uppercase font-['JetBrains_Mono']">Meeting Time</label>
                <input type="text" id="add-cell-time" required class="w-full glass px-4 py-3 rounded-xl border-purple-500/10 text-white focus:outline-none focus:border-purple-500/40 text-sm" placeholder="e.g. 19:30">
              </div>
            </div>

            <button type="submit" class="w-full bg-gradient-spiritual text-white font-bold py-3 px-4 rounded-xl shadow-lg border border-purple-400/20 hover-lift btn-press cursor-pointer flex justify-center items-center">
              Build Cell Group
            </button>
          </form>
        </div>
      </div>
    </div>
  `;
}

export function renderCellPage(state) {
  const profile = state.userProfile || {};
  const cells = state.cells || [];
  const selectedId = state.selectedCellId;
  const item = cells.find(c => c.id === selectedId);

  if (!item) {
    return `
      <div class="text-center p-12 space-y-4">
        <p class="text-sm text-[#9ca3af]">Selected cell group does not exist.</p>
        <button data-goto-view="cells" class="bg-gradient-spiritual text-white py-2 px-6 rounded-xl text-xs font-bold hover-lift btn-press cursor-pointer">Back to Cells Roster</button>
      </div>
    `;
  }

  const isLeader = item.leaderId === profile.uid || (item.coLeaderIds && item.coLeaderIds.includes(profile.uid)) || profile.role === 'super_admin';
  const activeTab = state.cellPageTab || 'overview';

  // Suspended Banner
  const suspendedBannerHtml = item.suspended ? `
    <div class="p-3 bg-red-500/15 border border-red-500/30 text-red-500 rounded-xl text-xs font-bold flex items-center justify-center gap-2 mb-4 animate-glow-pulse">
      🚨 Administratively Suspended Cell Group. Only administrators can manipulate.
    </div>
  ` : '';

  // Tabs structure
  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'members', label: `Roster (${item.memberIds?.length || 0})` },
    { key: 'events', label: 'Cell Events' },
    { key: 'settings', label: 'Dashboard Control' }
  ];

  const tabButtons = tabs.map(t => {
    // Hide settings tab for non-leaders
    if (t.key === 'settings' && !isLeader) return '';

    const isActive = activeTab === t.key;
    const activeClass = isActive 
      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
      : 'text-[#9ca3af] hover:text-white border border-transparent';
    return `
      <button data-cell-tab-key="${t.key}" class="py-2 px-4 rounded-xl text-xs font-semibold btn-press cursor-pointer ${activeClass}">
        ${t.label}
      </button>
    `;
  }).join('');

  // Tab Contents compilation
  let innerViewHtml = '';

  if (activeTab === 'overview') {
    innerViewHtml = `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Main details -->
        <div class="md:col-span-2 space-y-4 text-left">
          <div class="glass p-5 rounded-xl border-purple-500/10 space-y-3">
            <h4 class="text-lg font-bold text-white font-['Space_Grotesk']"> Fellowship Mission</h4>
            <p class="text-xs text-[#9ca3af] leading-relaxed break-words">${item.description || 'Welcome to Damascus study circles, where believers unpack Scripture transcripts weekly.'}</p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="glass p-4 rounded-xl border-purple-500/10 text-left">
              <span class="block text-[10px] uppercase font-bold text-purple-400 font-['JetBrains_Mono']">Weekly Gathering</span>
              <span class="block text-sm font-bold text-white mt-1">${item.meetingSchedule?.day || 'Tuesday'}s</span>
              <span class="block text-xs text-[#9ca3af]">${item.meetingSchedule?.time || '19:00'} UTC</span>
            </div>
            <div class="glass p-4 rounded-xl border-purple-500/10 text-left">
              <span class="block text-[10px] uppercase font-bold text-purple-400 font-['JetBrains_Mono']">Coordinates</span>
              <span class="block text-sm font-bold text-white mt-1 h-5 overflow-hidden text-ellipsis">${item.location?.city || 'Global'}</span>
              <span class="block text-xs text-[#9ca3af] h-4 overflow-hidden text-ellipsis">${item.location?.state || 'Worldwide'}</span>
            </div>
          </div>
        </div>

        <!-- Sidebar coordinator status card -->
        <div class="space-y-4">
          <div class="glass p-5 rounded-xl border-purple-500/10 text-center space-y-2.5">
            <div class="w-14 h-14 border border-purple-500/20 bg-gradient-to-tr from-purple-500/10 to-indigo-500/10 rounded-full flex items-center justify-center mx-auto text-xl font-bold text-purple-300">
              ${item.leaderName ? item.leaderName[0].toUpperCase() : 'V'}
            </div>
            <div>
              <span class="block text-[9px] uppercase font-bold text-purple-400 tracking-wider font-['JetBrains_Mono']">Assigned Leader</span>
              <h4 class="text-sm font-bold text-white mt-0.5">${item.leaderName || 'Vacant Coord'}</h4>
              <p class="text-[10px] text-[#9ca3af] mt-1">📧 ${item.contactEmail || 'No public email specified'}</p>

              ${item.coLeaderIds && item.coLeaderIds.length > 0 ? `
                <div class="mt-3.5 pt-3 border-t border-purple-500/10 text-left">
                  <span class="block text-[8px] uppercase font-bold text-purple-400/60 font-['JetBrains_Mono'] mb-1.5">Co-Leaders</span>
                  <div class="space-y-1.5">
                    ${(state.users || [])
                      .filter(u => item.coLeaderIds.includes(u.uid))
                      .map(u => `
                        <div class="flex items-center gap-2 text-xs">
                          <span class="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse shrink-0"></span>
                          <span class="font-semibold text-white truncate max-w-[120px] inline-block">${u.displayName}</span>
                          <span class="text-[9px] text-purple-300/[0.4] font-mono select-all truncate max-w-[80px]">${u.email}</span>
                        </div>
                      `).join('')}
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
          <button data-leave-cell-id="${item.id}" class="w-full py-2.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 hover-lift btn-press cursor-pointer text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 h-10">
            Leave Cell groups
          </button>
        </div>
      </div>
    `;
  } else if (activeTab === 'members') {
    // Pull full client list belonging to this cell
    const cellUsers = (state.users || []).filter(u => u.cellId === item.id);
    const membersListHtml = cellUsers.map(member => {
      const isSelf = member.uid === profile.uid ? ' (You)' : '';
      return `
        <div class="glass p-4 rounded-xl border-purple-500/10 flex items-center justify-between hover-lift">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 border border-purple-500/15 bg-gradient-to-tr from-purple-500/10 to-indigo-500/10 rounded-full flex items-center justify-center font-bold text-purple-300">
              ${member.displayName ? member.displayName[0].toUpperCase() : 'U'}
            </div>
            <div class="text-left">
              <h4 class="text-sm font-bold text-white">${member.displayName || 'Believer'}${isSelf}</h4>
              <span class="text-[9px] text-[#9ca3af] block">${member.email}</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="${ROLE_COLORS[member.role] || ROLE_COLORS.member}">${member.role.replace('_', ' ').toUpperCase()}</span>
          </div>
        </div>
      `;
    }).join('');

    innerViewHtml = `
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        ${membersListHtml || `
          <div class="col-span-1 md:col-span-3 glass p-8 text-center rounded-xl border-purple-500/10 flex flex-col items-center justify-center">
            <span class="text-3xl">👥</span>
            <p class="text-xs text-[#9ca3af] mt-1">Gathering cell cohort members list...</p>
          </div>
        `}
      </div>
    `;
  } else if (activeTab === 'events') {
    // Filter events
    const cellEvents = (state.events || []).filter(e => e.cellId === item.id);
    const eventsHtml = cellEvents.map(evt => {
      return `
        <div class="glass p-4 rounded-xl border-purple-500/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover-lift">
          <div class="text-left space-y-1">
            <span class="text-[9px] text-purple-400 font-bold uppercase tracking-widest font-['JetBrains_Mono']">${evt.date} @ ${evt.time}</span>
            <h4 class="text-sm font-extrabold text-white font-['Space_Grotesk']">${evt.title}</h4>
            <p class="text-xs text-[#9ca3af]">${evt.description || 'Community gathering intercessory meeting.'}</p>
            <p class="text-[10px] text-purple-300/60">📍 ${evt.location}</p>
          </div>
          <div class="flex items-center gap-3 self-end sm:self-center">
            <span class="text-xs text-[#9ca3af]/80 font-semibold">${evt.attendeeCount || 0} Attending</span>
            <button data-rsvp-event-id="${evt.id}" class="bg-purple-500/10 border border-purple-500/20 text-purple-400 px-3 py-1 text-xs font-bold rounded-lg hover:bg-purple-500/20 btn-press cursor-pointer">
              RSVP
            </button>
          </div>
        </div>
      `;
    }).join('');

    innerViewHtml = `
      <div class="space-y-4">
        ${isLeader ? `
          <!-- New Cell Event creation form -->
          <div class="glass p-5 rounded-xl border-purple-500/10 text-left space-y-4">
            <h4 class="text-sm font-bold text-white uppercase tracking-wider font-['Space_Grotesk']">Add New Cell Gathering</h4>
            <form id="cell-add-event-form" class="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div>
                <label class="block text-[10px] font-semibold text-purple-200/80 mb-1 uppercase font-['JetBrains_Mono']">Gathering Title</label>
                <input type="text" id="cell-event-title" required class="w-full glass px-3 py-2 rounded-xl border border-purple-500/10 text-white text-xs" placeholder="e.g. Damascus Fellowship Study">
              </div>
              <div>
                <label class="block text-[10px] font-semibold text-purple-200/80 mb-1 uppercase font-['JetBrains_Mono']">Date / time</label>
                <input type="date" id="cell-event-date" required class="w-full glass px-3 py-2 rounded-xl border border-purple-500/10 text-white text-xs">
              </div>
              <button type="submit" class="bg-gradient-spiritual text-white py-2 rounded-xl text-xs font-bold hover:bg-purple-500 shadow btn-press cursor-pointer">Create Event</button>
            </form>
          </div>
        ` : ''}

        <div class="space-y-3">
          ${eventsHtml || `
            <div class="glass p-8 text-center rounded-xl border-purple-500/10 space-y-2">
              <span class="text-3xl">🗓️</span>
              <h4 class="text-xs font-bold text-white uppercase">Calendar empty</h4>
              <p class="text-xs text-[#9ca3af]">No localized cell fellowship events listed currently.</p>
            </div>
          `}
        </div>
      </div>
    `;
  } else if (activeTab === 'settings' && isLeader) {
    const cellUsers = (state.users || []).filter(u => u.cellId === item.id);
    const otherMembers = cellUsers.filter(u => u.uid !== item.leaderId && !(item.coLeaderIds || []).includes(u.uid));

    innerViewHtml = `
      <div class="space-y-6">
        <div class="glass p-5 rounded-xl border-purple-500/10 space-y-4 text-left">
          <h4 class="text-md font-bold text-white font-['Space_Grotesk'] border-b border-purple-500/10 pb-2">Administrative Actions</h4>
          <form id="cell-edit-settings-form" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-purple-200/80 mb-1 uppercase font-['JetBrains_Mono']">Meeting Schedule Day</label>
                <input type="text" id="edit-cell-day" value="${item.meetingSchedule?.day || 'Tuesday'}" required class="w-full glass px-4 py-3 rounded-xl border-purple-500/10 text-white text-xs">
              </div>
              <div>
                <label class="block text-xs font-semibold text-purple-200/80 mb-1 uppercase font-['JetBrains_Mono']">Meeting Schedule Time</label>
                <input type="text" id="edit-cell-time" value="${item.meetingSchedule?.time || '19:00'}" required class="w-full glass px-4 py-3 rounded-xl border-purple-500/10 text-white text-xs">
              </div>
            </div>
            <div>
              <label class="block text-xs font-semibold text-purple-200/80 mb-1 uppercase font-['JetBrains_Mono']">Geographic Details</label>
              <input type="text" id="edit-cell-city" value="${item.location?.city || 'Worldwide'}" required class="w-full glass px-4 py-3 rounded-xl border-purple-500/10 text-white text-xs">
            </div>
            <button type="submit" class="w-full bg-gradient-spiritual text-white py-3 rounded-xl text-xs font-bold hover-lift btn-press cursor-pointer">Save Cell Coordinates</button>
          </form>
        </div>

        <div class="glass p-5 rounded-xl border-purple-500/10 space-y-4 text-left">
          <h4 class="text-md font-bold text-white font-['Space_Grotesk'] border-b border-purple-500/10 pb-2">Appoint Additional Cell Leader</h4>
          <p class="text-xs text-[#9ca3af]">Promote an active cell member to be an authorized co-leader with administrative editing access over this cell.</p>
          
          ${otherMembers.length > 0 ? `
            <form id="cell-add-leader-form" class="space-y-3">
              <div>
                <label class="block text-xs font-bold text-purple-400 mb-1 uppercase font-['JetBrains_Mono']">// SELECT CANDIDATE RECORD</label>
                <select id="add-leader-uid" required class="w-full bg-[#110e21] text-white px-4 py-3.5 rounded-xl border border-purple-500/10 text-xs cursor-pointer focus:outline-none">
                  <option value="">-- Choose Member --</option>
                  ${otherMembers.map(u => `<option value="${u.uid}">${u.displayName || 'Believer'} (${u.email})</option>`).join('')}
                </select>
              </div>
              <button type="submit" class="w-full bg-gradient-spiritual text-white py-3 rounded-xl text-xs font-bold hover-lift btn-press cursor-pointer">
                Promote to Co-Leader
              </button>
            </form>
          ` : `
            <p class="text-xs text-purple-300/40 italic">No eligible standard roster members in this cell available for promotion.</p>
          `}

          <div class="relative flex py-2 items-center">
            <div class="flex-grow border-t border-purple-500/10"></div>
            <span class="flex-shrink mx-4 text-purple-200/20 text-[9px] uppercase font-['JetBrains_Mono'] tracking-wider">Or Promoted by Email</span>
            <div class="flex-grow border-t border-purple-500/10"></div>
          </div>

          <form id="cell-add-leader-by-email-form" class="space-y-3">
            <div>
              <label class="block text-xs font-bold text-purple-400 mb-1 uppercase font-['JetBrains_Mono']">// GLOBAL EMAIL ALIGNMENT</label>
              <div class="flex gap-2.5">
                <input type="email" id="add-leader-email" required placeholder="parishioner@hcverse.or" class="flex-grow bg-[#110e21] px-4.5 py-3 rounded-xl border border-purple-500/10 text-white text-xs focus:outline-none focus:border-purple-500/40">
                <button type="submit" class="bg-[#1c183b] hover:bg-[#231e4d] border border-purple-500/15 text-purple-300 px-5 rounded-xl text-xs font-extrabold btn-press cursor-pointer transition-all shrink-0">Promote</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  return `
    <div class="space-y-6 animate-fade-up">
      <!-- Back button and head cover -->
      <div class="text-left space-y-3">
        <button id="btn-back-to-cells" class="inline-flex items-center text-xs text-purple-400 hover:text-purple-300 font-bold btn-press cursor-pointer">
          ${ICONS['chevron-left']} Back to Cells
        </button>
        <div class="glass p-6 rounded-2xl border-purple-500/10 relative overflow-hidden bg-gradient-to-br from-purple-950/20 to-[#0e0a1c]/20">
          <div class="relative z-10 flex flex-col md:flex-row justify-between md:items-end gap-4">
            <div>
              <span class="inline-flex bg-purple-500/15 text-purple-400 text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border border-purple-500/20 mb-2">Cell Circle</span>
              <h2 class="text-3xl font-extrabold text-white font-['Space_Grotesk']">${item.name}</h2>
              <p class="text-xs text-purple-400 font-semibold mt-1 font-['JetBrains_Mono']">Oversight Pastor: ${item.pastorName || 'Parish Pastor'}</p>
            </div>
          </div>
        </div>
      </div>

      ${suspendedBannerHtml}

      <!-- Tabs Buttons strip -->
      <div class="flex flex-wrap items-center gap-2 border-b border-purple-500/10 pb-4">
        ${tabButtons}
      </div>

      <!-- Live Switchboard Content -->
      <div class="mt-4">
        ${innerViewHtml}
      </div>
    </div>
  `;
}

export function renderChat(state) {
  const profile = state.userProfile || {};
  const list = state.messages || [];

  const bubblesHtml = list.map((msg, idx) => {
    const isSelf = msg.senderId === profile.uid;
    const isConsecutive = idx > 0 && list[idx - 1].senderId === msg.senderId;

    const alignment = isSelf ? 'justify-end' : 'justify-start';
    const balloonBg = isSelf 
      ? 'bg-gradient-spiritual text-white rounded-tr-none' 
      : 'glass text-purple-100 rounded-tl-none border-purple-500/10';

    const avatarHtml = isSelf || isConsecutive ? '' : `
      <div class="w-8 h-8 rounded-full border border-purple-500/15 bg-gradient-to-tr from-purple-500/10 to-indigo-500/10 flex items-center justify-center font-bold text-purple-300 text-xs self-start">
        ${msg.senderName ? msg.senderName[0].toUpperCase() : 'U'}
      </div>
    `;

    const senderHeader = isSelf || isConsecutive ? '' : `
      <div class="flex items-center gap-2 mb-0.5 ml-1 select-none">
        <span class="text-xs font-extrabold text-[#e8e6f0]/90">${msg.senderName || 'Anonymous'}</span>
        <span class="text-[8px] text-[#9ca3af]/60 font-medium font-['JetBrains_Mono']">${timeAgo(msg.createdAt)}</span>
      </div>
    `;

    return `
      <div class="flex gap-2.5 ${alignment} ${isConsecutive ? 'mt-1' : 'mt-4'} items-start">
        ${!isSelf ? avatarHtml : ''}
        <div class="max-w-[70%] select-text">
          ${!isSelf ? senderHeader : ''}
          <div class="px-4 py-2.5 rounded-2xl text-xs max-w-full break-words shadow-sm text-left relative ${balloonBg}">
            <p class="leading-relaxed font-sans">${msg.content}</p>
          </div>
        </div>
        ${isSelf && !isConsecutive ? `
          <div class="w-8 h-8 rounded-full border border-purple-500/15 bg-gradient-to-tr from-purple-500/10 to-indigo-500/10 flex items-center justify-center font-bold text-purple-400 text-xs self-start select-none">
            ${msg.senderName ? msg.senderName[0].toUpperCase() : 'U'}
          </div>
        ` : isSelf ? '<div class="w-8"></div>' : ''}
      </div>
    `;
  }).join('');

  // Emojis list
  const emojiChips = COMMUNITY_EMOJIS.map(em => `
    <button data-chat-emoji="${em}" class="text-lg hover:scale-110 active:scale-95 transition-transform p-1.5 focus:outline-none cursor-pointer select-none">${em}</button>
  `).join('');

  return `
    <div class="h-[calc(screen-12rem)] max-w-3xl mx-auto flex flex-col justify-between glass rounded-2xl border-purple-500/10 overflow-hidden relative">
      <!-- Title banner -->
      <div class="px-5 py-3 h-14 bg-[#141024]/40 border-b border-purple-500/10 flex justify-between items-center select-none">
        <div class="text-left flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
          <div>
            <h4 class="text-xs font-extrabold text-white uppercase tracking-wider font-['Space_Grotesk']">Global Sanctuary Thread</h4>
            <p id="chat-member-tally" class="text-[9px] text-purple-400 font-semibold font-['JetBrains_Mono']">Listening to onSnapshot updates...</p>
          </div>
        </div>
        <button id="btn-toggle-emoji-board" class="text-purple-400 hover:text-white p-1 rounded transition-colors text-xs font-bold leading-none btn-press flex items-center gap-1 cursor-pointer">
          😊 <span class="hidden sm:inline">Emojis</span>
        </button>
      </div>

      <!-- Scrolling chat bubbles -->
      <div id="chat-messages-stage" class="flex-grow overflow-y-auto p-5 scroll-smooth flex flex-col">
        ${bubblesHtml || `
          <div class="my-auto text-center space-y-2 select-none">
            <span class="text-4xl">🕊️</span>
            <h3 class="text-sm font-bold text-white uppercase">Sanctuary Silent</h3>
            <p class="text-xs text-[#9ca3af]">Enter a word of peace or testify to start discussion.</p>
          </div>
        `}
      </div>

      <!-- Floating Emoji tray board -->
      <div id="chat-emoji-board" class="hidden absolute left-0 right-0 bottom-16 glass bg-[#120f26]/95 border-t border-purple-500/15 p-3 flex flex-wrap justify-between items-center gap-1.5 z-30 animate-fade-up">
        ${emojiChips}
      </div>

      <!-- TextInput bar -->
      <form id="chat-send-form" class="h-16 border-t border-purple-500/10 px-4 flex items-center gap-3 bg-[#0a0814]/20 select-none">
        <input type="text" id="chat-text-input" required class="flex-grow glass px-4 py-2.5 rounded-xl border-purple-500/10 text-white placeholder-purple-300/30 focus:outline-none focus:border-purple-500/40 text-xs h-10 select-text" placeholder="Share a word, verse reference, or prayer...">
        <button type="submit" class="bg-gradient-spiritual border border-purple-400/12 hover-lift btn-press text-white font-bold p-2.5 rounded-xl flex items-center justify-center w-10 h-10 min-w-10 cursor-pointer">
          <span class="w-4 h-4">${ICONS.send}</span>
        </button>
      </form>
    </div>
  `;
}

export function renderResources(state) {
  const profile = state.userProfile || {};
  const list = state.resources || [];
  const query = state.resourcesQuery || '';
  const filterType = state.resourcesType || 'all';

  const isLeader = profile.role === 'cell_leader' || profile.role === 'pastor' || profile.role === 'super_admin';

  // Filter list
  const filtered = list.filter(item => {
    const typeMatches = filterType === 'all' || item.type === filterType;
    const val = query.toLowerCase();
    const textMatches = (
      item.title.toLowerCase().includes(val) ||
      item.description.toLowerCase().includes(val)
    );
    return typeMatches && textMatches;
  });

  const cardsHtml = filtered.map(item => {
    const isOwner = item.uploadedBy === profile.uid || profile.role === 'super_admin';

    // icon type selector
    const iconsMap = {
      document: '📄',
      image: '🖼️',
      video: '🎥',
      link: '🔗'
    };
    const ic = iconsMap[item.type] || '📄';

    return `
      <div class="glass p-5 rounded-xl border-purple-500/10 hover-lift flex flex-col justify-between">
        <div class="text-left space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-xs p-1.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg text-xs leading-none font-bold">${ic} ${item.type.toUpperCase()}</span>
            <span class="text-[9px] text-[#9ca3af]/60 font-semibold font-['JetBrains_Mono']">${timeAgo(item.createdAt)}</span>
          </div>
          <h4 class="text-sm font-extrabold text-white font-['Space_Grotesk'] line-clamp-1">${item.title}</h4>
          <p class="text-xs text-[#9ca3af] line-clamp-3 leading-relaxed h-12">${item.description || 'Instructional transcript uploaded for study groups.'}</p>
          <span class="block text-[10px] text-purple-400/80 font-bold font-['JetBrains_Mono']">Uploaded by: ${item.uploadedByName || 'Supervisor'}</span>
        </div>
        <div class="flex items-center justify-between border-t border-purple-500/5 mt-4 pt-4">
          <a href="${item.url}" target="_blank" class="bg-gradient-spiritual text-white py-1.5 px-4 rounded-lg text-xs font-bold hover-lift btn-press cursor-pointer flex items-center gap-1.5">
            Open File ${ICONS['chevron-right']}
          </a>
          ${isOwner ? `
            <button data-delete-resource-id="${item.id}" class="text-red-500 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg btn-press cursor-pointer" title="Delete Resource">
              ${ICONS.trash}
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="space-y-6 animate-fade-up">
      <!-- Search & actions strip -->
      <div class="flex flex-col sm:flex-row justify-between gap-4">
        <div class="relative max-w-sm w-full">
          <span class="absolute left-3.5 top-3 text-[#9ca3af] w-5 h-5 flex items-center justify-center">${ICONS.search}</span>
          <input type="text" id="resources-search-input" value="${query}" class="w-full glass pl-10 pr-4 py-2 rounded-xl border-purple-500/10 text-white placeholder-purple-300/30 text-xs h-10" placeholder="Search resources directory...">
        </div>
        ${isLeader ? `
          <button id="btn-show-add-resource" class="bg-[#121021] border border-purple-500/15 py-1 px-4 text-xs font-bold text-white rounded-xl hover:bg-[#1a1733] btn-press flex items-center gap-1.5 h-10 cursor-pointer">
            ${ICONS.plus} New Share Resource
          </button>
        ` : ''}
      </div>

      <!-- Type filters row -->
      <div class="flex flex-wrap items-center gap-1.5 border-b border-purple-500/10 pb-4 select-none">
        ${['all', 'document', 'image', 'video', 'link'].map(type => {
          const isActive = filterType === type;
          const bg = isActive ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold' : 'text-[#9ca3af] hover:text-white border border-transparent';
          return `<button data-resource-type-filter="${type}" class="py-1.5 px-3 rounded-lg text-xs leading-none btn-press cursor-pointer uppercase tracking-widest font-['JetBrains_Mono'] ${bg}">${type}</button>`;
        }).join('')}
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        ${filtered.length > 0 ? cardsHtml : `
          <div class="col-span-1 md:col-span-3 glass p-12 text-center rounded-2xl border-purple-500/10 space-y-2">
            <span class="text-4xl">📚</span>
            <h3 class="text-sm font-bold text-white uppercase">Storage Shelves Empty</h3>
            <p class="text-xs text-[#9ca3af]">Adjust filters or wait for group moderators to upload teachings.</p>
          </div>
        `}
      </div>

      <!-- ADD RESOURCE DIALOG MODAL (Hidden by default) -->
      <div id="add-resource-overlay" class="hidden fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
        <div class="max-w-md w-full glass p-6 rounded-2xl border-purple-500/10 space-y-4 animate-fade-up">
          <div class="flex justify-between items-center border-b border-purple-500/10 pb-2">
            <h3 class="text-lg font-bold text-white font-['Space_Grotesk']">Upload Share Resource</h3>
            <button id="btn-close-resource" class="text-purple-400 hover:text-white text-xl font-bold btn-press cursor-pointer">&times;</button>
          </div>

          <form id="add-resource-form" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-purple-200/80 mb-1 uppercase font-['JetBrains_Mono']">Resource Name</label>
              <input type="text" id="add-res-title" required class="w-full glass px-4 py-3 rounded-xl border border-purple-500/10 text-white text-xs" placeholder="e.g. Damascus Cell Outline Study">
            </div>
            <div>
              <label class="block text-xs font-semibold text-purple-200/80 mb-1 uppercase font-['JetBrains_Mono']">Detailed Description</label>
              <textarea id="add-res-desc" class="w-full glass px-4 py-3 rounded-xl border border-purple-500/10 text-white text-xs h-20" placeholder="A brief outline of teaching elements..."></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-purple-200/80 mb-1 uppercase font-['JetBrains_Mono']">MediaType</label>
                <select id="add-res-type" required class="w-full bg-[#120e23] border border-purple-500/10 text-white px-4 py-3 rounded-xl text-xs cursor-pointer h-11">
                  <option value="document">📄 Document File</option>
                  <option value="link">🔗 Outbound Link</option>
                  <option value="image">🖼️ Visual Illustration</option>
                  <option value="video">🎥 Stream Video Link</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-purple-200/80 mb-1 uppercase font-['JetBrains_Mono']">Destinations URL</label>
                <input type="url" id="add-res-url" required class="w-full glass px-4 py-3 rounded-xl border border-purple-500/10 text-white text-xs" placeholder="https://example.com/file">
              </div>
            </div>

            <button type="submit" class="w-full bg-gradient-spiritual text-white font-bold py-3 px-4 rounded-xl shadow-lg border border-purple-400/20 hover-lift btn-press cursor-pointer flex justify-center items-center">
              Publish Resource File
            </button>
          </form>
        </div>
      </div>
    </div>
  `;
}
