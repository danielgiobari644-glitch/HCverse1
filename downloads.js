/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ICONS } from './icons.js';

export function renderDownloads(state) {
  const profile = state.userProfile || {};
  const isSuperAdmin = profile.role === 'super_admin';
  const customLinks = state.downloadLinks || [];

  // Default active download options supplied by default
  const defaultDownloads = [
    {
      id: 'default-apk',
      title: 'HCVerse Native Android App (.APK)',
      category: 'Android App',
      url: './api/download/hcverse-app.apk',
      subtext: 'Size: 1.0 MB • Official Direct Release',
      description: 'Download the lightweight Android installer to study on the go. Offers zero-flicker native shell, full-screen offline mode, and automatic startup.',
      tag: 'Recommended for Mobile',
      iconUrl: `<svg class="w-7 h-7 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`
    },
    {
      id: 'default-zip',
      title: 'KJV Offline Scripture Reference Archive (.ZIP)',
      category: 'Study Bundle',
      url: './api/download/offline-study-guide.zip',
      subtext: 'Size: 840 KB • Fully Offline Bible Archive',
      description: 'An offline archival package containing clean JSON versions of Genesis, KJV John, and popular concordance worksheets. Perfect for offline parsing.',
      tag: 'Study Resource',
      iconUrl: `<svg class="w-7 h-7 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="11" y2="17"/></svg>`
    }
  ];

  // Merge custom links added by the Super Admin in Firestore
  const allLinksToShow = [...customLinks, ...defaultDownloads];

  const cardsHtml = allLinksToShow.map(dl => {
    // Determine the icon based on file type/category
    let icon = dl.iconUrl; 
    if (!icon) {
      if (dl.category?.toLowerCase().includes('android') || dl.category?.toLowerCase().includes('apk')) {
        icon = `<svg class="w-7 h-7 text-green-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 9h16v11a2 2 0 01-2 2H6a2 2 0 01-2-2V9zm3-3V4a2 2 0 012-2h6a2 2 0 012 2v2M9 14h6m-3-3v6"/></svg>`;
      } else if (dl.category?.toLowerCase().includes('zip') || dl.category?.toLowerCase().includes('archive')) {
        icon = `<svg class="w-7 h-7 text-yellow-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>`;
      } else if (dl.category?.toLowerCase().includes('ios') || dl.category?.toLowerCase().includes('apple')) {
        icon = `<svg class="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"/></svg>`;
      } else {
        icon = `<svg class="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>`;
      }
    }

    return `
      <div class="glass p-6 rounded-3xl border border-purple-500/10 hover:border-purple-500/35 hover:scale-[1.02] hover:shadow-[0_20px_45px_rgba(167,139,250,0.06)] transition-all duration-300 flex flex-col justify-between text-left relative overflow-hidden group">
        <!-- Accent Glow -->
        <div class="absolute -right-12 -top-12 w-28 h-28 rounded-full bg-purple-500/5 blur-xl group-hover:bg-purple-500/10 transition-colors"></div>

        <div class="space-y-4 relative z-10">
          <div class="flex items-center justify-between">
            <span class="bg-purple-500/10 text-primary border border-purple-500/25 px-2.5 py-1 rounded-xl text-[9px] font-bold font-mono uppercase tracking-widest">${dl.category || 'Direct File'}</span>
            ${dl.tag ? `<span class="bg-[#10b981]/10 text-[#34d399] border border-[#10b981]/20 px-2 py-0.5 rounded-lg text-[9px] font-bold">${dl.tag}</span>` : ''}
          </div>

          <div class="flex items-start gap-4">
            <div class="p-3 bg-purple-500/5 rounded-2xl border border-purple-500/10 flex-shrink-0">
              ${icon}
            </div>
            <div class="space-y-1 min-w-0">
              <h3 class="text-sm font-bold text-white truncate font-sans tracking-tight group-hover:text-primary transition-colors">${dl.title}</h3>
              <p class="text-[10px] text-purple-400 font-mono font-semibold">${dl.subtext}</p>
            </div>
          </div>

          <p class="text-xs text-muted-foreground leading-relaxed font-sans h-16 overflow-y-auto scrollbar-hide select-text">
            ${dl.description || 'No overview offered.'}
          </p>
        </div>

        <div class="pt-5 border-t border-purple-500/5 flex items-center gap-3 relative z-10">
          <button data-trigger-download-url="${dl.url}" data-trigger-download-filename="${dl.title}" class="flex-grow bg-gradient-spiritual hover:opacity-95 text-white py-3 px-4.5 rounded-2xl text-xs font-bold shadow-lg shadow-purple-500/10 btn-press cursor-pointer flex justify-center items-center gap-1.5 transition-all text-center">
            📥 Download Now
          </button>
          
          ${isSuperAdmin && !dl.id.startsWith('default-') ? `
            <button data-delete-download-id="${dl.id}" class="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 rounded-2xl btn-press cursor-pointer flex items-center justify-center font-bold" title="Delete Download Product">
              &times;
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="space-y-8 animate-fade-in text-left">
      <!-- Introductory block -->
      <div class="glass p-7 rounded-3xl border border-purple-500/10 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <!-- Ambient lighting background -->
        <div class="absolute -left-20 -top-20 w-52 h-52 rounded-full bg-purple-600/10 blur-3xl pointer-events-none"></div>

        <div class="space-y-2 max-w-2xl text-left relative z-10">
          <h2 class="text-lg font-bold text-white font-['Space_Grotesk'] tracking-tight flex items-center gap-2">
            <span>📲</span> HCVerse Offline Installation & Downloads
          </h2>
          <p class="text-xs text-muted-foreground leading-relaxed">
            For maximum accessibility during your fellowship devotion cycles, we offer immediate direct downloads of our platform components. When clicked, these installers initiate immediate local system delivery so you are connected to cell coordinates even without direct networks.
          </p>
        </div>

        ${isSuperAdmin ? `
          <button id="btn-quick-goto-admin-downloads" class="px-5 py-3 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 text-primary border border-purple-500/25 text-xs font-bold btn-press cursor-pointer flex items-center gap-1.5 transition-all self-start md:self-auto shrink-0 relative z-10">
            🔧 Manage Links (Super Admin)
          </button>
        ` : ''}
      </div>

      <!-- Progressive Web App Setup block -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="glass p-6 rounded-3xl border border-purple-500/10 md:col-span-2 relative overflow-hidden flex flex-col justify-between space-y-6">
          <div class="space-y-3">
            <div class="flex items-center gap-2 select-none">
              <span class="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
              <span class="text-[10px] font-bold text-purple-300 font-mono uppercase tracking-widest">Active Installation Engine</span>
            </div>
            <h3 class="text-sm font-bold text-white font-['Space_Grotesk'] tracking-tight">Direct Interactive PWA Installer</h3>
            <p class="text-xs text-muted-foreground leading-relaxed">
              Run HCVerse as a completely standalone companion utility directly on your desktop or android screen utilizing standard browser Progressive Web App framework. No app store login required.
            </p>
          </div>

          <div class="flex flex-wrap gap-3 select-none">
            <button id="pwa-trigger-direct-install" class="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-3 px-5 rounded-2xl shadow-lg hover-lift btn-press cursor-pointer flex items-center gap-2 transition-all">
              🌐 Install Web App On This Device
            </button>
          </div>
        </div>

        <div class="glass p-6 rounded-3xl border border-purple-500/10 flex flex-col justify-between space-y-4">
          <h4 class="text-[10px] text-[#A78BFA] font-bold font-mono uppercase tracking-wider">// PLATFORM COMPATIBILITY</h4>
          <div class="space-y-2 py-1">
            <div class="flex justify-between items-center text-xs">
              <span class="text-muted-foreground">Android OS</span>
              <span class="text-[#34d399] font-medium font-mono text-[10px] bg-green-500/10 px-1.5 py-0.5 rounded">Native / APK</span>
            </div>
            <div class="flex justify-between items-center text-xs">
              <span class="text-muted-foreground">Apple iOS</span>
              <span class="text-[#38bdf8] font-medium font-mono text-[10px] bg-blue-500/10 px-1.5 py-0.5 rounded">Safari Safari shell</span>
            </div>
            <div class="flex justify-between items-center text-xs">
              <span class="text-muted-foreground">Windows / Linux</span>
              <span class="text-[#f472b6] font-medium font-mono text-[10px] bg-pink-500/10 px-1.5 py-0.5 rounded">Edge / Chrome Shell</span>
            </div>
          </div>
          <div class="text-[10px] text-muted-foreground font-serif leading-relaxed bg-[#11111A]/60 p-3 rounded-xl border border-white/[0.02]">
            * Immediate download launches file saving prompts instantly.
          </div>
        </div>
      </div>

      <!-- Main downloadable catalog -->
      <div class="space-y-4 text-left">
        <h3 class="text-sm font-bold text-white uppercase tracking-wider font-['Space_Grotesk']">// Launchable Packages & Direct Installers</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          ${cardsHtml}
        </div>
      </div>
    </div>
  `;
}
