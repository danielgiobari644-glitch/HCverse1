/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ICONS } from './icons.js';
import { timeAgo, ROLE_COLORS, COMMUNITY_EMOJIS } from './constants.js';

export function renderPostFeed(state) {
  const profile = state.userProfile || {};
  const list = state.posts || [];

  return list.map(post => {
    const isPinned = post.pinnedBy;
    const isTestimony = post.type === 'testimony';
    const isAnnouncement = post.type === 'announcement';

    let cardBorder = 'border-white/[0.03]';
    let typeTag = '';
    
    if (isAnnouncement) {
      cardBorder = 'border-amber-500/15 bg-gradient-to-r from-amber-500/[0.015] to-transparent';
      typeTag = `<span class="bg-amber-500/10 border border-amber-500/20 text-amber-500 dark:text-amber-400 text-[8px] font-extrabold uppercase py-0.5 px-2 rounded-full select-none animate-pulse">📢 Parish Announcement</span>`;
    } else if (isTestimony) {
      cardBorder = 'border-[#22C55E]/15 bg-gradient-to-r from-[#22C55E]/[0.01] to-transparent';
      typeTag = `<span class="bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-[8px] font-extrabold uppercase py-0.5 px-2 rounded-full select-none">🕊️ Testimony</span>`;
    }

    // Checking pin status
    const pinBtn = isPinned 
      ? `<span class="inline-flex items-center text-amber-400 text-[10px] font-bold gap-1 select-none">${ICONS.pin} Pinned</span>` 
      : '';

    // Compilation of emojis reactions
    const reactKeys = ['Amen', 'Love', 'Victory'];
    const reactSymbols = { Amen: '🙏', Love: '❤️', Victory: '👏' };
    const reactionButtons = reactKeys.map(key => {
      const readers = post.reactions?.[key] || [];
      const hasClicked = readers.includes(profile.uid);
      const clickedClass = hasClicked 
        ? 'bg-[#A78BFA]/15 text-[#C4B5FD] border border-[#A78BFA]/30' 
        : 'hover:bg-foreground/5 border border-white/[0.02] text-muted-foreground';

      return `
        <button data-react-post-id="${post.id}" data-react-emoji-key="${key}" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-xl btn-press cursor-pointer transition-all ${clickedClass}">
          <span>${reactSymbols[key]}</span>
          <span class="text-[10px] font-mono leading-none">${readers.length}</span>
        </button>
      `;
    }).join('');

    const isAuthor = post.authorId === profile.uid || profile.role === 'super_admin';
    const leaderClass = ROLE_COLORS[post.authorRole] || ROLE_COLORS.member;

    return `
      <div class="bg-card border ${cardBorder} p-6 rounded-3xl flex flex-col justify-between hover:scale-[1.01] hover:shadow-xl transition-all duration-300 text-left relative overflow-hidden group">
        <div class="space-y-4">
          <!-- Card Header details -->
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3 select-none">
              <div class="w-10 h-10 border border-purple-500/10 bg-gradient-to-tr from-[#171726]/40 to-card/20 rounded-full flex items-center justify-center font-extrabold text-primary shadow-sm text-sm">
                ${post.authorName ? post.authorName[0].toUpperCase() : 'U'}
              </div>
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <h4 class="text-xs sm:text-sm font-bold text-foreground leading-tight">${post.authorName || 'Believer'}</h4>
                  <span class="text-[8px] px-2 py-0.5 rounded-full font-bold bg-[#A78BFA]/10 text-primary border border-primary/15 font-mono uppercase tracking-wider">${post.authorRole ? post.authorRole.replace('_', ' ') : 'MEMBER'}</span>
                </div>
                <span class="text-[9px] text-muted-foreground/60 font-semibold block mt-0.5 font-mono">${timeAgo(post.createdAt)}</span>
              </div>
            </div>
            
            <div class="flex items-center gap-2 select-none">
              ${pinBtn}
              ${typeTag}
              ${isAuthor ? `
                <button data-delete-post-id="${post.id}" class="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 rounded-xl btn-press cursor-pointer" title="Delete Witness Posting">
                  ${ICONS.trash}
                </button>
              ` : ''}
            </div>
          </div>
 
          <!-- Body contents -->
          <div class="text-xs sm:text-sm text-foreground/90 leading-relaxed break-words font-sans selection:bg-[#A78BFA]/30 py-1">
            <p>${post.content}</p>
          </div>
        </div>

        <!-- Reactions strip -->
        <div class="flex items-center gap-2 mt-4 pt-3.5 border-t border-border/30 select-none">
          ${reactionButtons}
        </div>
      </div>
    `;
  }).join('');
}

export function renderPostEditor(state) {
  const profile = state.userProfile || {};
  const isLeader = profile.role === 'cell_leader' || profile.role === 'pastor' || profile.role === 'super_admin';

  return `
    <div class="max-w-xl mx-auto space-y-6 animate-fade-up select-none">
      <div class="flex items-center justify-between border-b border-purple-500/10 pb-2">
        <button id="btn-back-to-home" class="inline-flex items-center text-xs text-purple-400 hover:text-purple-300 font-bold btn-press cursor-pointer">
          ${ICONS['chevron-left']} Back to Home Feed
        </button>
        <span class="text-xs font-semibold uppercase tracking-wider text-purple-400 font-['JetBrains_Mono']">Witness Writer</span>
      </div>

      <div class="glass p-6 rounded-2xl border border-purple-500/10 space-y-4">
        <h3 class="text-lg font-bold text-white font-['Space_Grotesk'] text-left">Share Your Testimony</h3>

        <form id="write-post-form" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-purple-200/80 mb-1 rounded-sm uppercase font-['JetBrains_Mono'] text-left">Select Testimony Type</label>
            <select id="editor-post-type" required class="w-full bg-[#120f26] border border-purple-500/10 text-white px-4 py-3 rounded-xl text-xs sm:text-sm cursor-pointer h-11 focus:outline-none">
              <option value="testimony">🕊️ Faith testimony and praise</option>
              <option value="witness">📝 General update / reflection</option>
              ${isLeader ? `<option value="announcement">📢 Parish community announcement</option>` : ''}
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-purple-200/80 mb-1 rounded-sm uppercase font-['JetBrains_Mono'] text-left">Your Testimony Letter</label>
            <textarea id="editor-post-content" required class="w-full glass px-4 py-3 rounded-xl border border-purple-500/10 text-white text-xs sm:text-sm h-36 placeholder-purple-300/30 focus:outline-none focus:border-purple-500/40" placeholder="Describe your testimony here, share a praise report, or reference the scripture study transcript..."></textarea>
          </div>

          <button type="submit" class="w-full bg-gradient-spiritual text-white font-extrabold py-3.5 px-4 rounded-xl border border-purple-400/20 hover-lift btn-press cursor-pointer flex justify-center items-center">
            Dispatch to Community Dashboard
          </button>
        </form>
      </div>
    </div>
  `;
}
