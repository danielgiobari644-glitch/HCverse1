/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ICONS } from './icons.js';
import { getGreeting, timeAgo, ROLE_COLORS, SCRIPTURES } from './constants.js';

export function renderAppShell(state, contentHtml) {
  const profile = state.userProfile || {};
  const unreadCount = state.unreadCount || 0;
  const badgeHtml = unreadCount > 0 ? `<span class="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-extrabold text-[9px] w-4.5 h-4.5 flex items-center justify-center rounded-full border border-[#07070B] animate-pulse">${unreadCount}</span>` : '';

  // active state variables
  const activeColor = state.darkMode ? 'text-primary' : 'text-purple-600';

  // Navigation menu configurations
  const NAV_ITEMS = [
    { view: 'home', label: 'Home Feed', icon: ICONS.home },
    { view: 'cells', label: 'Cell Groups', icon: ICONS.users },
    { view: 'chat', label: 'Community Chat', icon: ICONS['message-circle'] },
    { view: 'live-room', label: 'Live Chambers', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-video w-5 h-5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>` },
    { view: 'bible', label: 'Bible Study', icon: ICONS['book-open'] },
    { view: 'devotionals', label: 'Devotionals', icon: ICONS.edit },
    { view: 'quiz', label: 'Bible Quiz', icon: ICONS.brain },
    { view: 'events', label: 'Events Calendar', icon: ICONS.calendar },
    { view: 'resources', label: 'Resources', icon: ICONS['folder-open'] },
    { view: 'downloads', label: 'Install App (PWA & APK)', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download w-5 h-5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>` },
  ];

  if (profile.role === 'super_admin') {
    NAV_ITEMS.push({ view: 'admin', label: 'Super Admin', icon: ICONS.shield });
  }

  const sidebarLinks = NAV_ITEMS.map(item => {
    const isActive = state.currentView === item.view || (item.view === 'cells' && state.currentView === 'cell-page');
    const activeClass = isActive 
      ? 'bg-[#171726]/80 text-primary border-l-2 border-[#A78BFA] shadow-[0_0_12px_rgba(167,139,250,0.12)] font-bold' 
      : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.02] border-l-2 border-transparent font-medium';
    
    return `
      <button data-goto-view="${item.view}" class="w-full flex items-center transition-all duration-300 btn-press text-left cursor-pointer rounded-2xl ${state.sidebarCollapsed ? 'justify-center p-3' : 'gap-3.5 px-4.5 py-3'} mb-1.5 ${activeClass}" title="${item.label}">
        <span class="w-5 h-5 flex-shrink-0 flex items-center justify-center">${item.icon}</span>
        ${state.sidebarCollapsed ? '' : `<span class="text-xs tracking-wide font-sans">${item.label}</span>`}
      </button>
    `;
  }).join('');

  // Mobile navigation links
  const mobileNavs = [
    { view: 'home', icon: ICONS.home, label: 'Home' },
    { view: 'cells', icon: ICONS.users, label: 'Cells' },
    { view: 'chat', icon: ICONS['message-circle'], label: 'Chat' },
    { view: 'bible', icon: ICONS['book-open'], label: 'Study' },
  ];
  const mobileLinks = mobileNavs.map(item => {
    const isActive = state.currentView === item.view || (item.view === 'cells' && state.currentView === 'cell-page');
    const activeClass = isActive ? 'text-primary font-bold scale-105' : 'text-muted-foreground hover:text-foreground font-medium';
    return `
      <button data-goto-view="${item.view}" class="flex flex-col items-center justify-center space-y-0.5 text-[10px] py-1 pointer-events-auto btn-press cursor-pointer ${activeClass}">
        <span class="w-5 h-5 block">${item.icon}</span>
        <span>${item.label}</span>
      </button>
    `;
  }).join('');

  return `
    <div class="flex h-screen bg-background text-foreground overflow-hidden font-sans transition-colors duration-300">
      <!-- FLOATING DESKTOP SIDEBAR -->
      <aside id="desktop-sidebar" class="hidden lg:flex flex-col ${state.sidebarCollapsed ? 'w-20' : 'w-64'} bg-card/60 backdrop-blur-xl border border-border/80 h-[calc(100vh-2rem)] my-4 ml-4 rounded-3xl relative z-30 transition-all duration-300 ease-in-out shadow-[0_12px_40px_rgba(0,0,0,0.3)] shrink-0">
        <!-- Sidebar Brand with Toggle -->
        <div class="p-5 border-b border-border/40 flex items-center justify-between">
          <div class="flex items-center gap-3 min-w-0">
            <span class="text-2xl text-purple-400 animate-breathe flex-shrink-0">✝</span>
            ${state.sidebarCollapsed ? '' : `<span class="text-base font-extrabold font-['Space_Grotesk'] bg-gradient-to-r from-purple-400 via-purple-300 to-indigo-350 bg-clip-text text-transparent tracking-tight">HCVerse</span>`}
          </div>
          <button id="btn-toggle-sidebar" class="text-muted-foreground hover:text-foreground p-1.5 rounded-xl transition-colors shrink-0 hover:bg-foreground/5 cursor-pointer" title="Toggle Sidebar">
            ${state.sidebarCollapsed ? `
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            ` : `
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            `}
          </button>
        </div>

        <nav class="flex-grow py-5 px-3 overflow-y-auto">
          ${sidebarLinks}
        </nav>

        <div class="p-4 border-t border-border/40 flex items-center ${state.sidebarCollapsed ? 'justify-center' : 'gap-3'}">
          <span class="w-9 h-9 border border-purple-500/10 rounded-full flex items-center justify-center text-sm font-extrabold bg-gradient-to-tr from-purple-500/10 to-indigo-500/10 text-purple-300">
            ${profile.displayName ? profile.displayName[0].toUpperCase() : 'U'}
          </span>
          ${state.sidebarCollapsed ? '' : `
            <div class="min-w-0 flex-grow text-left">
              <p class="text-xs font-bold text-foreground truncate font-sans">${profile.displayName || 'Believer'}</p>
              <p class="text-[9px] text-[#A78BFA] truncate uppercase tracking-widest font-mono font-medium">${profile.role || 'Member'}</p>
            </div>
          `}
          <button id="btn-sidebar-signout" title="Sign Out" class="text-muted-foreground hover:text-foreground hover:bg-foreground/5 p-2 rounded-xl transition-all btn-press cursor-pointer">
            ${ICONS['log-out']}
          </button>
        </div>
      </aside>

      <!-- MAIN CONTAINER -->
      <div class="flex-grow flex flex-col h-full overflow-hidden relative">
        <!-- TOP NAVIGATION BAR -->
        <header class="h-16 border-b border-border/60 flex items-center justify-between px-6 lg:px-8 relative z-20 transition-all duration-300 bg-transparent">
          <div class="flex items-center gap-2 lg:gap-0">
            <!-- Mobile Sidebar Trigger -->
            <button id="mobile-menu-trigger" class="lg:hidden text-muted-foreground hover:text-foreground p-1.5 hover:bg-foreground/5 rounded-xl mr-2 btn-press cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </button>
            <h1 class="text-base font-bold font-[#Space_Grotesk] text-foreground tracking-tight uppercase tracking-wider font-['Space_Grotesk']">
              ${getViewTitle(state.currentView)}
            </h1>
          </div>

          <div class="flex items-center gap-3.5">
            <!-- AI Companion button -->
            <button id="topbar-btn-ai" class="flex items-center gap-1.5 bg-[#A78BFA]/10 border border-[#A78BFA]/20 text-[#C4B5FD] text-xs font-semibold py-1.5 px-3.5 rounded-xl hover:bg-[#A78BFA]/15 hover-lift btn-press cursor-pointer transition-all">
              <span class="w-3.5 h-3.5 flex items-center justify-center text-[#C4B5FD]">${ICONS.sparkles}</span>
              <span class="hidden sm:inline font-sans">Spiritual Companion</span>
            </button>

            <!-- Notifications -->
            <button id="topbar-btn-notifications" class="relative text-muted-foreground hover:text-foreground p-2 hover:bg-foreground/5 rounded-xl transition-all btn-press cursor-pointer">
              ${ICONS.bell}
              ${badgeHtml}
            </button>

            <!-- Dark/Light Theme -->
            <button id="topbar-btn-theme" class="text-muted-foreground hover:text-foreground p-2 hover:bg-foreground/5 rounded-xl transition-all btn-press cursor-pointer">
              ${state.darkMode ? ICONS.sun : ICONS.moon}
            </button>

            <!-- Profile dropdown trigger -->
            <div class="relative inline-block text-left">
              <button id="topbar-profile-trigger" class="w-8 h-8 rounded-full border border-purple-500/10 bg-gradient-to-tr from-purple-500/10 to-indigo-500/10 flex items-center justify-center text-xs font-bold text-purple-300 btn-press cursor-pointer">
                ${profile.displayName ? profile.displayName[0].toUpperCase() : 'U'}
              </button>
              
              <!-- Dropdown Panel -->
              <div id="topbar-profile-menu" class="hidden absolute right-0 mt-3 w-48 rounded-2xl shadow-2xl bg-card border border-border/80 overflow-hidden ring-1 ring-black/5 z-50">
                <button data-goto-view="profile" class="dropdown-item w-full flex items-center gap-2.5 px-4 py-3 text-xs font-semibold text-foreground/80 hover:text-foreground hover:bg-foreground/10 text-left cursor-pointer transition-all">
                  ${ICONS.user} Profile Settings
                </button>
                <div class="border-t border-border"></div>
                <button id="topbar-btn-signout" class="dropdown-item w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-red-400 hover:bg-red-500/10 text-left cursor-pointer transition-all">
                  ${ICONS['log-out']} Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        <!-- VIEWS WRAPPER STAGE -->
        <main class="flex-grow overflow-y-auto px-6 py-8 sm:px-8 lg:px-12 relative z-10 select-text bg-background transition-colors duration-300">
          <div class="max-w-7xl mx-auto w-full">
            ${contentHtml}
          </div>
        </main>

        <!-- MOBILE NAV BAR (Visible only on mobile) -->
        <nav class="lg:hidden h-16 bg-sidebar border-t border-border grid grid-cols-4 px-2 relative z-20">
          ${mobileLinks}
        </nav>
      </div>

      <!-- MOBILE SIDE MENU DRAWER (Hidden by default) -->
      <div id="mobile-sidebar-drawer" class="hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden flex transition-all duration-300">
        <div class="w-64 bg-sidebar max-w-xs h-full flex flex-col justify-between border-r border-border animate-slide-in-right">
          <div>
            <div class="p-6 border-b border-border flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="text-2xl text-purple-400">✝</span>
                <span class="text-xl font-bold font-['Space_Grotesk'] text-foreground">HCVerse</span>
              </div>
              <button id="mobile-menu-close" class="text-muted-foreground hover:text-foreground p-1.5 rounded-xl text-xs font-bold btn-press cursor-pointer border border-border bg-foreground/5">&times; Close</button>
            </div>
            <nav class="py-4 space-y-1 overflow-y-auto">
              ${sidebarLinks}
            </nav>
          </div>
          <div class="p-4 border-t border-border flex items-center gap-3">
            <span class="w-9 h-9 border border-purple-500/10 rounded-full flex items-center justify-center text-sm font-extrabold bg-gradient-to-tr from-purple-500/10 to-indigo-500/10 text-purple-300">
              ${profile.displayName ? profile.displayName[0].toUpperCase() : 'U'}
            </span>
            <div class="min-w-0 flex-grow text-left">
              <p class="text-sm font-bold text-foreground truncate">${profile.displayName || 'Believer'}</p>
              <p class="text-[10px] text-purple-450 truncate uppercase font-['JetBrains_Mono']">${profile.role || 'Member'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function getViewTitle(view) {
  switch (view) {
    case 'home': return 'Home & Testimony Feed';
    case 'cells': return 'Fellowship Cell Groups';
    case 'cell-page': return 'Our Cell Fellowship';
    case 'chat': return 'Unified Fellowship Chat';
    case 'bible': return 'Holy Bible Reader';
    case 'profile': return 'My Spiritual Profile';
    case 'admin': return 'Super Admin Dashboard';
    case 'devotionals': return 'Daily Devotionals Board';
    case 'quiz': return 'Bible Wisdom Quiz';
    case 'events': return 'Upcoming Events & Services';
    case 'ai-assistant': return 'HCVerse AI Spiritual Explorer';
    case 'notifications': return 'My Notification Feed';
    case 'resources': return 'Resource Library';
    case 'downloads': return 'Install App (PWA & APK)';
    case 'prayer-room': return 'Intercession Prayer Room';
    case 'live-room': return 'Divine Live Chambers';
    default: return 'HCVerse Portal';
  }
}

export function renderHome(state) {
  const profile = state.userProfile || {};
  const greeting = getGreeting();
  const scripture = SCRIPTURES[state.scriptureIndex || 0];

  // Spotify-style Devotional Card
  const todayDevo = (state.devotionals || []).find(d => !d.cellId);
  const devotionalHtml = todayDevo ? `
    <div class="bg-[#11111A] border border-white/[0.04] rounded-3xl p-6 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-full group">
      <!-- Ambient Backlight Cover Art -->
      <div class="absolute -right-16 -top-16 w-36 h-36 rounded-full bg-gradient-to-br from-primary/20 via-[#C4B5FD]/10 to-transparent blur-2xl group-hover:scale-110 transition-transform duration-500"></div>
      
      <div class="space-y-4 relative z-10">
        <div class="flex items-center justify-between">
          <span class="bg-[#A78BFA]/10 border border-[#A78BFA]/20 text-[#C4B5FD] text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-lg">5 MIN READ</span>
          <span class="text-[10px] text-muted-foreground font-mono font-medium">✨ Series: Grace</span>
        </div>
        
        <div class="space-y-2">
          <h3 class="text-lg font-bold text-foreground font-sans tracking-tight group-hover:text-primary transition-colors leading-snug">${todayDevo.title}</h3>
          <p class="text-xs font-semibold text-primary font-mono">${todayDevo.scriptureRef}</p>
          <p class="text-[11px] text-muted-foreground line-clamp-3 leading-relaxed font-serif">${todayDevo.content}</p>
        </div>

        <!-- Devotional Progress stats -->
        <div class="space-y-1.5 pt-2">
          <div class="flex justify-between text-[10px] font-mono font-semibold text-muted-foreground">
            <span>Progress Status</span>
            <span class="text-primary">75%</span>
          </div>
          <div class="w-full bg-[#171726] h-1.5 rounded-full overflow-hidden">
            <div class="bg-primary h-full rounded-full transition-all duration-500" style="width: 75%"></div>
          </div>
        </div>
      </div>

      <button data-goto-view="devotionals" class="w-full text-center bg-primary/10 border border-primary/20 text-[#C4B5FD] hover:bg-primary/20 py-2.5 rounded-xl text-xs font-bold hover:scale-[1.01] transition-all cursor-pointer mt-5 z-10">
        Continue Study
      </button>
    </div>
  ` : `
    <div class="bg-[#11111A] border border-white/[0.03] p-8 rounded-3xl flex flex-col items-center justify-center text-center h-full space-y-2 py-12">
      <span class="text-3xl animate-breathe">📖</span>
      <h3 class="text-xs font-bold text-foreground uppercase tracking-widest font-mono">Loading sanctuary guides</h3>
      <p class="text-[11px] text-muted-foreground">Preparing study archives for today...</p>
    </div>
  `;

  // Filter and display maximum 2 events for optimal spacing
  const currentEvents = (state.events || []).filter(e => {
    return e.date >= new Date().toISOString().split('T')[0];
  }).slice(0, 2);

  const eventsListHtml = currentEvents.length > 0 ? currentEvents.map(evt => {
    const isAttending = evt.attendeeIds?.includes(profile.uid);
    const btnLabel = isAttending ? '✓ Going' : 'RSVP Invite';
    const btnClass = isAttending 
      ? 'bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] font-bold px-3 py-1.5 rounded-xl text-xs transition-all' 
      : 'bg-[#A78BFA]/10 border border-[#A78BFA]/15 text-[#C4B5FD] hover:bg-[#A78BFA]/15 font-bold px-3 py-1.5 rounded-xl text-xs transition-all hover-lift';

    return `
      <div class="bg-[#11111A] p-5 rounded-2xl border border-white/[0.03] flex flex-col justify-between hover:scale-[1.01] transition-all duration-300">
        <div class="space-y-2.5">
          <div class="flex items-center justify-between">
            <span class="text-[8.5px] font-bold text-[#A78BFA]/80 uppercase tracking-widest font-mono">${evt.type.replace('_', ' ')}</span>
            <span class="text-[9px] text-muted-foreground font-mono">${evt.date}</span>
          </div>
          <h4 class="text-xs sm:text-sm font-bold text-foreground tracking-tight line-clamp-1">${evt.title}</h4>
          <p class="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed h-8">${evt.description || 'Parish gathering for prayer and intercession.'}</p>
          <p class="text-[10px] text-muted-foreground/75 font-medium flex items-center gap-1">📍 ${evt.location}</p>
        </div>
        <div class="flex items-center justify-between border-t border-white/[0.03] mt-4 pt-3">
          <span class="text-[10px] text-muted-foreground/80 font-mono font-medium">${evt.attendeeCount || 0} attending</span>
          <button data-rsvp-event-id="${evt.id}" class="${btnClass} cursor-pointer btn-press">${btnLabel}</button>
        </div>
      </div>
    `;
  }).join('') : `
    <div class="col-span-1 sm:col-span-2 bg-[#11111A] border border-white/[0.03] p-8 rounded-3xl flex flex-col items-center justify-center text-center space-y-2">
      <span class="text-3xl">📅</span>
      <h3 class="text-xs font-bold text-foreground uppercase tracking-widest">Calendar Peaceful</h3>
      <p class="text-[11px] text-muted-foreground">No upcoming gatherings scheduled for today.</p>
    </div>
  `;

  return `
    <div class="space-y-8 animate-fade-up">
      <!-- PERSONAL SANCTUARY HEADER HERO -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-4 border-b border-border/40 select-none">
        <div class="space-y-1 text-left">
          <div class="flex items-center gap-2">
            <span class="inline-block bg-primary/10 text-primary text-[9px] font-mono tracking-widest uppercase px-2.5 py-0.5 rounded-full border border-primary/10">DIGITAL SANCTUARY 3.0</span>
            <span class="text-xs text-muted-foreground/60 font-mono">● Active Connected</span>
          </div>
          <h2 class="text-2xl sm:text-3.5xl font-extrabold text-foreground tracking-tight font-sans leading-tight">
            ${greeting.text}, ${profile.displayName || 'Believer'} ${greeting.emoji}
          </h2>
          <div class="flex items-center gap-4 text-xs font-medium text-muted-foreground pt-0.5">
            <div id="home-weather-widget" class="flex items-center gap-1.5 text-muted-foreground/80">
              <span>☀️</span>
              <span class="font-sans">72°F Calm & Sunset Breeze</span>
            </div>
            <span class="text-muted-foreground/30">•</span>
            <p id="time-indicator" class="font-mono text-xs text-primary font-bold">
              UTC Live: ${new Date().toISOString().substring(11,16)}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- Study Streak Widget -->
          <div class="bg-[#11111A] border border-white/[0.04] py-2 px-4 rounded-2xl flex items-center gap-3">
            <span class="text-orange-400 w-5 h-5 flex-shrink-0 animate-glow-pulse flex items-center justify-center">${ICONS.flame}</span>
            <div class="text-left">
              <span class="block text-[8px] text-[#A78BFA] font-bold uppercase tracking-widest font-mono">Grace Streak</span>
              <span id="streak-counter-banner" class="text-xs font-bold text-foreground font-sans">${profile.devotionStreak || 0} Days</span>
            </div>
          </div>

          <button data-goto-view="prayer-room" class="bg-primary text-[#07070B] hover:opacity-90 transition-all font-bold py-3 px-5 rounded-2xl text-xs flex items-center gap-2 shadow-[0_4px_24px_rgba(167,139,250,0.25)] hover:scale-[1.01] btn-press cursor-pointer">
            <span>🙏 Join Prayer Room</span>
          </button>
        </div>
      </div>

      <!-- BOUTIQUE DAILY SCRIPTURE EXPERIENCE -->
      <div class="p-8 sm:p-10 rounded-3xl bg-[#11111A] border border-white/[0.04] flex flex-col justify-center items-center text-center space-y-4 relative overflow-hidden group select-text">
        <!-- Abstract moving beams background graphic inside scripture card -->
        <div class="absolute inset-0 bg-gradient-to-br from-[#A78BFA]/[0.01] via-transparent to-transparent opacity-40"></div>
        <span class="absolute right-4 top-3 text-white/[0.015] group-hover:text-primary/[0.03] transition-colors text-9xl pointer-events-none select-none font-extrabold font-serif">✝</span>
        
        <div class="space-y-3 relative z-10 max-w-3xl">
          <blockquote class="text-base sm:text-xl font-medium text-foreground tracking-wide leading-relaxed font-serif animate-fade-up">
            "${scripture.text}"
          </blockquote>
          <cite class="text-[9px] text-[#A78BFA] font-extrabold uppercase tracking-widest block font-mono">
            — ${scripture.ref}
          </cite>
        </div>
      </div>

      <!-- INTERACTIVE PREMIUM WIDGET GRID -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 select-none">
        
        <!-- DAILY PRAYER GOALS WITH PROGRESS CIRCLE -->
        <div class="bg-[#11111A] border border-white/[0.03] p-5 rounded-3xl space-y-3 flex flex-col justify-between">
          <div class="text-left">
            <span class="text-[8px] font-mono text-primary font-bold uppercase tracking-widest block">Mindfulness Target</span>
            <h4 class="text-xs font-bold text-foreground">Daily Prayer Circle</h4>
          </div>
          <div class="flex items-center justify-center py-2 h-20">
            <!-- Custom Circular Progress Ring SVG -->
            <div class="relative w-16 h-16 flex items-center justify-center">
              <svg class="absolute transform -rotate-90 w-full h-full" viewBox="0 0 36 36">
                <path class="text-white/[0.02]" stroke="currentColor" stroke-width="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path class="text-primary" stroke="currentColor" stroke-dasharray="80, 100" stroke-width="3" stroke-linecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <span class="text-xs font-mono font-bold text-foreground">80%</span>
            </div>
          </div>
          <div class="text-center">
            <p class="text-[10px] text-muted-foreground leading-snug">4 of 5 intercessions complete for today</p>
          </div>
        </div>

        <!-- SCRIPTURE MEMORY CHALLENGE -->
        <div class="bg-[#11111A] border border-white/[0.03] p-5 rounded-3xl space-y-3 flex flex-col justify-between">
          <div class="text-left">
            <span class="text-[8px] font-mono text-[#F59E0B] font-bold uppercase tracking-widest block">WISDOM CHALLENGE</span>
            <h4 class="text-xs font-bold text-foreground">Scripture Memory</h4>
          </div>
          <div class="space-y-1.5 py-2">
            <p class="text-[11px] text-muted-foreground font-serif leading-snug">"The Lord is my shepherd..."</p>
            <div class="flex gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
              <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
              <span class="w-1.5 h-1.5 rounded-full bg-primary/20"></span>
              <span class="w-1.5 h-1.5 rounded-full bg-primary/20"></span>
            </div>
          </div>
          <button data-goto-view="quiz" class="w-full text-center bg-white/[0.02] border border-white/[0.04] text-xs text-foreground font-semibold py-1.5 rounded-xl hover:bg-white/[0.04] transition-all cursor-pointer">
            Train Memory
          </button>
        </div>

        <!-- FAITH MILESTONES TIMELINE -->
        <div class="bg-[#11111A] border border-white/[0.03] p-5 rounded-3xl space-y-3 col-span-1 md:col-span-2 flex flex-col justify-between text-left">
          <div>
            <span class="text-[8px] font-mono text-[#22C55E] font-bold uppercase tracking-widest block">PERSONAL TIMELINE</span>
            <h4 class="text-xs font-bold text-foreground">Spiritual Journey Milestones</h4>
          </div>
          <div class="space-y-2 py-1 flex-grow flex flex-col justify-center">
            <div class="flex gap-3 items-center text-xs">
              <span class="w-2 h-2 rounded-full bg-[#22C55E] ring-4 ring-[#22C55E]/10 flex-shrink-0"></span>
              <div class="min-w-0">
                <span class="block text-[10px] text-muted-foreground font-mono">JUNE 8</span>
                <p class="text-[11px] text-foreground font-sans truncate">Added 7th consecutive active study day</p>
              </div>
            </div>
            <div class="flex gap-3 items-center text-xs">
              <span class="w-2 h-2 rounded-full bg-primary ring-4 ring-primary/10 flex-shrink-0"></span>
              <div class="min-w-0">
                <span class="block text-[10px] text-muted-foreground font-mono">JUNE 5</span>
                <p class="text-[11px] text-foreground font-sans truncate">Subscribed to cell fellowship core group</p>
              </div>
            </div>
          </div>
          <div class="text-[9px] text-muted-foreground italic font-mono">✓ Journey saved in cloud sync</div>
        </div>

      </div>

      <!-- MAIN FEATURE CORES: SPOTIFY DEVOTIONAL & CALENDAR -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Devotional element -->
        <div class="lg:col-span-1">
          ${devotionalHtml}
        </div>
        
        <!-- Live Calendar gathers board -->
        <div class="lg:col-span-2 space-y-4 text-left">
          <div class="flex items-center justify-between select-none">
            <h3 class="text-xs font-bold text-[#A78BFA] uppercase tracking-widest font-mono">Sanctuary Calendar</h3>
            <button data-goto-view="events" class="text-xs text-muted-foreground hover:text-foreground font-bold transition-all flex items-center gap-1 cursor-pointer">Explore Schedule &rarr;</button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5.5">
            ${eventsListHtml}
          </div>
        </div>
      </div>

      <!-- COMMUNITY WORKSPACE TIMELINE FEED -->
      <div class="space-y-5 pt-4">
        <div class="flex items-center justify-between select-none">
          <div class="text-left space-y-1">
            <h3 class="text-base sm:text-lg font-bold text-foreground font-sans tracking-tight">Community Witness & Testimonies</h3>
            <p class="text-xs text-muted-foreground leading-relaxed">Encouragements, prayers, and insights shared by parish members.</p>
          </div>
          <button data-goto-view="post-editor" class="bg-primary hover:bg-[#C4B5FD] border border-primary/20 text-[#07070B] py-2.5 px-4 rounded-xl text-xs font-semibold hover-lift btn-press flex items-center gap-1.5 cursor-pointer transition-all">
            ${ICONS.plus} Share Witness
          </button>
        </div>
        
        <!-- Thread / Twitter Post Timeline Box -->
        <div id="quick-posts-timeline-box" class="space-y-5 max-w-3xl mx-auto">
          <div class="bg-[#11111A] border border-white/[0.03] p-16 text-center rounded-3xl space-y-3 select-none">
            <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p class="text-[10px] text-[#A78BFA]/70 font-semibold uppercase tracking-widest font-mono animate-pulse">Reconnecting testament pipelines...</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderProfile(state) {
  const profile = state.userProfile || {};
  const isSuperAdmin = profile.role === 'super_admin';

  return `
    <div class="max-w-xl mx-auto space-y-8 animate-fade-up">
      <div class="glass p-8 rounded-3xl border border-purple-500/10 text-center relative overflow-hidden bg-gradient-to-b from-purple-500/[0.02] to-transparent">
        <!-- Avatar profile logo -->
        <div class="w-20 h-20 rounded-full border-2 border-purple-500/30 bg-gradient-to-tr from-purple-500/10 to-indigo-500/10 flex items-center justify-center text-3xl font-extrabold text-purple-600 dark:text-purple-300 mx-auto relative z-10 animate-breathe">
          ${profile.displayName ? profile.displayName[0].toUpperCase() : 'U'}
        </div>
        <h2 class="text-2xl font-bold text-foreground font-['Space_Grotesk'] mt-4">${profile.displayName || 'Believer'}</h2>
        <!-- Role ribbon -->
        <div class="inline-block mt-2 font-['JetBrains_Mono']">
          <span class="${ROLE_COLORS[profile.role] || ROLE_COLORS.member}">${profile.role.replace('_', ' ').toUpperCase()}</span>
        </div>
        <p class="text-xs text-purple-600 dark:text-purple-400 font-semibold font-['JetBrains_Mono'] mt-1">${profile.email}</p>
        <p class="text-xs text-muted-foreground max-w-md mx-auto mt-3 italic leading-relaxed font-serif">"${profile.bio || 'I have been crucified with Christ, and it is no longer I who live, but Christ lives in me...'}"</p>
      </div>

      <!-- Settings Cards -->
      <div class="glass p-8 rounded-3xl border border-purple-500/10 space-y-6">
        <h3 class="text-base font-bold text-foreground font-['Space_Grotesk'] border-b border-border pb-3 uppercase tracking-wider">Profile Settings Matrix</h3>
        
        <form id="profile-edit-settings-form" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-widest font-['JetBrains_Mono']">Full Display Name</label>
              <input type="text" id="profile-name" required value="${profile.displayName || ''}" class="w-full glass px-4 py-3 rounded-xl border border-purple-500/10 text-foreground bg-transparent focus:outline-none focus:border-purple-500/40 text-sm">
            </div>
            <div>
              <label class="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-widest font-['JetBrains_Mono']">Contact Phone</label>
              <input type="text" id="profile-phone" value="${profile.phone || ''}" class="w-full glass px-4 py-3 rounded-xl border border-purple-500/10 text-foreground bg-transparent focus:outline-none focus:border-purple-500/40 text-sm" placeholder="+123456789">
            </div>
          </div>

          <div>
            <label class="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-widest font-['JetBrains_Mono']">Witness Bio</label>
            <textarea id="profile-bio" class="w-full glass px-4 py-3 rounded-xl border border-purple-500/10 text-foreground bg-transparent focus:outline-none focus:border-purple-500/40 text-sm h-24 placeholder-muted-foreground/40" placeholder="Your current spiritual journey confession...">${profile.bio || ''}</textarea>
          </div>

          <div>
            <label class="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-widest font-['JetBrains_Mono']">Current City / Parish</label>
            <input type="text" id="profile-location" value="${profile.location || ''}" class="w-full glass px-4 py-3 rounded-xl border border-purple-500/10 text-foreground bg-transparent focus:outline-none focus:border-purple-500/40 text-sm" placeholder="e.g. Rome, Italy">
          </div>

          <!-- Boolean parameters togglers -->
          <div class="space-y-4 pt-4 border-t border-border">
            <div class="flex items-center justify-between">
              <div class="text-left">
                <span class="block text-xs font-bold text-foreground">Toggle App Theme (Dark Mode)</span>
                <span class="block text-[10px] text-muted-foreground">Switch off high contrast screen mode in low light settings</span>
              </div>
              <input type="checkbox" id="profile-dark-mode" ${state.darkMode ? 'checked' : ''} class="w-4 h-4 rounded accent-purple-500 border border-purple-500/20 cursor-pointer">
            </div>
            <div class="flex items-center justify-between border-t border-border/60 pt-4">
              <div class="text-left">
                <span class="block text-xs font-bold text-foreground">Browser Push Notifications</span>
                <span class="block text-[10px] text-muted-foreground">Receive instant desktop alerts for prayer bulletins and group chats</span>
              </div>
              <input type="checkbox" id="profile-notifs" ${profile.settings?.notifications ? 'checked' : ''} class="w-4 h-4 rounded accent-purple-500 border border-purple-500/20 cursor-pointer">
            </div>
          </div>

          <button type="submit" class="w-full bg-gradient-spiritual text-white font-extrabold py-3.5 px-4 rounded-xl border border-purple-400/20 hover-lift btn-press cursor-pointer flex justify-center items-center mt-4">
            Update Profile Settings
          </button>
        </form>
      </div>
    </div>
  `;
}

export function renderNotifications(state) {
  const list = state.notifications || [];

  const notifsHtml = list.length > 0 ? list.map(item => {
    const readBox = item.read ? '' : '<span class="w-2.5 h-2.5 rounded-full bg-purple-500 float-right mt-1.5" title="Unread"></span>';
    const linkBtn = item.link ? `<button data-notif-link-view="${item.link}" data-notif-doc-id="${item.id}" class="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-500 font-bold mt-2 hover-lift inline-flex items-center gap-1 cursor-pointer">Go to Section &rarr;</button>` : '';
    
    return `
      <div class="glass p-4 rounded-xl border border-purple-500/10 flex gap-3 justify-between hover-lift ${item.read ? 'opacity-70' : 'border-purple-500/20 bg-purple-500/5'}">
        <div class="text-left min-w-0 flex-grow">
          <div class="flex justify-between items-start">
            <h4 class="text-sm font-bold text-foreground font-['Space_Grotesk']">${item.title}</h4>
            <span class="text-[9px] text-muted-foreground/60 font-medium font-['JetBrains_Mono']">${timeAgo(item.createdAt)}</span>
          </div>
          <p class="text-xs text-muted-foreground mt-1 leading-relaxed break-words">${item.message}</p>
          ${linkBtn}
        </div>
        ${readBox}
      </div>
    `;
  }).join('') : `
    <div class="glass p-12 text-center rounded-2xl border border-purple-500/10 space-y-2">
      <span class="text-4xl">🕊️</span>
      <h3 class="text-sm font-bold text-foreground uppercase tracking-wider">Peaceful Silence</h3>
      <p class="text-xs text-muted-foreground">You do not have any new notification alerts at this time.</p>
    </div>
  `;

  return `
    <div class="max-w-xl mx-auto space-y-4 animate-fade-up">
      <div class="flex items-center justify-between border-b border-border pb-2 mb-4 select-none">
        <h3 class="text-base font-bold text-foreground uppercase tracking-wider font-['Space_Grotesk']">My Notifications Feed</h3>
        ${list.length > 0 ? `<button id="btn-clear-all-notifs" class="text-xs text-red-500 hover:text-red-400 font-bold btn-press cursor-pointer">Clear All</button>` : ''}
      </div>
      <div class="space-y-3">
        ${notifsHtml}
      </div>
    </div>
  `;
}
