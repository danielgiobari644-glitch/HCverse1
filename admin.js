/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ICONS } from './icons.js';
import { ROLE_COLORS, timeAgo, QUIZ_QUESTIONS } from './constants.js';

export function renderAdmin(state) {
  const users = state.users || [];
  const cells = state.cells || [];
  const currentTab = state.adminTab || 'users';

  // Sub-tabs configuration
  const SUB_TABS = [
    { key: 'users', label: 'Believers Roster' },
    { key: 'cells', label: 'Cell Groups Oversight' },
    { key: 'theme', label: 'Synod Theme Manager' },
    { key: 'quiz_builder', label: 'Bible Quiz Builder' },
    { key: 'downloads_manager', label: 'Download Links Manager' }
  ];

  const adminNavHtml = SUB_TABS.map(tab => {
    const isActive = currentTab === tab.key;
    const activeClass = isActive 
      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
      : 'text-[#9ca3af] hover:text-white border border-transparent';
    return `
      <button data-admin-tab-key="${tab.key}" class="py-2 px-4 rounded-xl text-xs font-semibold btn-press cursor-pointer ${activeClass}">
        ${tab.label}
      </button>
    `;
  }).join('');

  let innerContentHtml = '';

  if (currentTab === 'users') {
    const userRows = users.map(usr => {
      // Role choices options
      const selectorOptions = [
        { key: 'member', label: 'Member' },
        { key: 'cell_leader', label: 'Cell Coordinator' },
        { key: 'pastor', label: 'Pastor' },
        { key: 'super_admin', label: 'Super Admin' }
      ].map(opt => `<option value="${opt.key}" ${usr.role === opt.key ? 'selected' : ''}>${opt.label}</option>`).join('');

      const cellsOptions = (cells || [])
        .map(c => `<option value="${c.id}" ${usr.cellId === c.id ? 'selected' : ''}>${c.name}</option>`)
        .join('');

      const isSelf = usr.email === SUPER_ADMIN_EMAIL;
      const deleteButtonHtml = isSelf 
        ? `<span class="text-[10px] text-purple-400/30 font-semibold italic select-none">Protected</span>`
        : `<button data-delete-user-id="${usr.uid}" class="text-[10px] font-extrabold px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg btn-press cursor-pointer transition-all">Delete</button>`;

      return `
        <tr class="border-b border-purple-500/5 hover:bg-white/5 transition-colors text-xs text-left">
          <td class="py-3 px-4 font-bold text-white select-all">${usr.displayName || 'Believer'}</td>
          <td class="py-3 px-4 text-[#9ca3af] select-all">${usr.email}</td>
          <td class="py-3 px-4">
            <select data-role-user-id="${usr.uid}" class="bg-[#120f26] border border-purple-500/10 text-white rounded px-2 py-1 text-xs select-none">
              ${selectorOptions}
            </select>
          </td>
          <td class="py-3 px-4">
            <select data-cell-user-id="${usr.uid}" class="bg-[#120f26] border border-purple-500/10 text-white rounded px-2 py-1 text-xs select-none">
               <option value="">Unaffiliated</option>
              ${cellsOptions}
            </select>
          </td>
          <td class="py-3 px-4">
            <span class="text-[9px] text-[#9ca3af] font-['JetBrains_Mono']">${usr.devotionStreak || 0}d</span>
          </td>
          <td class="py-3 px-4">
            ${deleteButtonHtml}
          </td>
        </tr>
      `;
    }).join('');

    innerContentHtml = `
      <!-- Provision New Believer Form -->
      <div class="glass p-5 rounded-xl border border-purple-500/10 mb-6 max-w-2xl text-left animate-fade-in">
        <h4 class="text-xs font-bold text-white uppercase tracking-widest font-mono mb-4 flex items-center gap-1.5">
          👤 Provision New Believer
        </h4>
        <form id="admin-create-user-form" class="space-y-4 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] uppercase font-bold text-purple-400 mb-1.5 font-mono tracking-wider">Display Name</label>
              <input type="text" id="admin-user-name" required placeholder="e.g. John Bunyan" class="w-full bg-[#0d091e] border border-purple-500/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500/40">
            </div>
            <div>
              <label class="block text-[10px] uppercase font-bold text-purple-400 mb-1.5 font-mono tracking-wider">Email Address</label>
              <input type="email" id="admin-user-email" required placeholder="believer@hcverse.org" class="w-full bg-[#0d091e] border border-purple-500/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500/40">
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] uppercase font-bold text-purple-400 mb-1.5 font-mono tracking-wider">Elected Role</label>
              <select id="admin-user-role" class="w-full bg-[#0d091e] border border-purple-500/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500/40">
                <option value="member">Member</option>
                <option value="cell_leader">Cell Coordinator</option>
                <option value="pastor">Pastor</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] uppercase font-bold text-purple-400 mb-1.5 font-mono tracking-wider">Cell Affinity Group</label>
              <select id="admin-user-cell" class="w-full bg-[#0d091e] border border-purple-500/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500/40">
                <option value="">Unaffiliated</option>
                ${(cells || []).map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
              </select>
            </div>
          </div>
          <button type="submit" class="bg-gradient-spiritual text-white font-extrabold py-2.5 px-6 rounded-xl shadow-lg border border-purple-400/20 hover-lift btn-press cursor-pointer">
            Publish Believer Record
          </button>
        </form>
      </div>

      <div class="glass p-5 rounded-xl border border-purple-500/10 overflow-hidden text-left">
        <h3 class="text-sm font-bold text-white uppercase tracking-wider font-['Space_Grotesk'] mb-3">Community Congregation roster</h3>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="border-b border-purple-500/10 text-[10px] uppercase font-bold text-purple-400 font-['JetBrains_Mono'] text-left">
                <th class="py-2.5 px-4 font-extrabold">Name</th>
                <th class="py-2.5 px-4 font-extrabold">Email Address</th>
                <th class="py-2.5 px-4 font-extrabold">Elected Role</th>
                <th class="py-2.5 px-4 font-extrabold">Cell Assigned</th>
                <th class="py-2.5 px-4 font-extrabold">Streak</th>
                <th class="py-2.5 px-4 font-extrabold">Oversight</th>
              </tr>
            </thead>
            <tbody>
              ${userRows || '<tr><td colspan="6" class="py-8 text-center text-[#9ca3af]">No believers catalogued.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add New Member Profile Form -->
      <div class="glass p-6 rounded-2xl border border-purple-500/10 text-left mt-6 relative overflow-hidden bg-gradient-to-br from-[#120e2e]/25 to-transparent">
        <h3 class="text-xs font-bold text-[#A78BFA] uppercase tracking-wider font-['JetBrains_Mono'] mb-3.5">// INITIALIZE NEW BELIEVER CONGREGANT</h3>
        <form id="admin-create-user-form" class="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label class="block text-[10px] font-semibold text-purple-200/80 mb-1 uppercase font-['JetBrains_Mono']">Full Name</label>
            <input type="text" id="admin-new-user-name" required placeholder="John Mark" class="w-full bg-[#110e21] px-3.5 py-2.5 rounded-xl border border-purple-500/10 text-white text-xs">
          </div>
          <div>
            <label class="block text-[10px] font-semibold text-purple-200/80 mb-1 uppercase font-['JetBrains_Mono']">Email Address</label>
            <input type="email" id="admin-new-user-email" required placeholder="john@hcverse.org" class="w-full bg-[#110e21] px-3.5 py-2.5 rounded-xl border border-purple-500/10 text-white text-xs">
          </div>
          <div>
            <label class="block text-[10px] font-semibold text-purple-200/80 mb-1 uppercase font-['JetBrains_Mono']">Primary Role</label>
            <select id="admin-new-user-role" class="w-full bg-[#110e21] text-white px-3.5 py-2.5 rounded-xl border border-purple-500/10 text-xs cursor-pointer focus:outline-none">
              <option value="member" selected>Member</option>
              <option value="cell_leader">Cell Coordinator</option>
              <option value="pastor">Pastor</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          <button type="submit" class="w-full bg-gradient-spiritual text-white py-2.5 rounded-xl text-xs font-bold hover:shadow hover-lift btn-press cursor-pointer transition-all">
            Create Congregant
          </button>
        </form>
      </div>
    `;
  } else if (currentTab === 'cells') {
    const cellRows = cells.map(cell => {
      const isSuspended = cell.suspended;
      const statusLabel = isSuspended 
        ? `<span class="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold py-0.5 px-2 rounded-full">Suspended</span>` 
        : `<span class="bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold py-0.5 px-2 rounded-full">Healthy Active</span>`;

      return `
        <tr class="border-b border-purple-500/5 hover:bg-white/5 transition-colors text-xs text-left">
          <td class="py-3 px-4 font-extrabold text-white">${cell.name}</td>
          <td class="py-3 px-4 text-[#9ca3af]">${cell.location?.city || "Worldwide"}</td>
          <td class="py-3 px-4 truncate max-w-sm">${cell.description || 'N/A'}</td>
          <td class="py-3 px-4">${statusLabel}</td>
          <td class="py-3 px-4">
            <button data-suspend-cell-id="${cell.id}" data-suspend-action="${isSuspended ? 'reactivate' : 'suspend'}" class="text-xs font-bold px-2.5 py-1 ${isSuspended ? 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'} rounded-lg btn-press cursor-pointer">
              ${isSuspended ? 'Reactivate' : 'Suspend'}
            </button>
          </td>
        </tr>
      `;
    }).join('');

    innerContentHtml = `
      <div class="glass p-5 rounded-xl border border-purple-500/10 overflow-hidden text-left">
        <h3 class="text-sm font-bold text-white uppercase tracking-wider font-['Space_Grotesk'] mb-3">Parish Home Cells Inventory</h3>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="border-b border-purple-500/10 text-[10px] uppercase font-bold text-purple-400 font-['JetBrains_Mono'] text-left">
                <th class="py-2.5 px-4">Name</th>
                <th class="py-2.5 px-4">City</th>
                <th class="py-2.5 px-4">Overview</th>
                <th class="py-2.5 px-4">Administrative Status</th>
                <th class="py-2.5 px-4">Toggle</th>
              </tr>
            </thead>
            <tbody>
              ${cellRows || '<tr><td colspan="5" class="py-8 text-center text-[#9ca3af]">No cells active.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } else if (currentTab === 'theme') {
    const swatches = [
      { key: 'purple', label: 'Spiritual Royal Purple', color: '#7c3aed', gradient: 'bg-gradient-spiritual' },
      { key: 'blue', label: 'Eucharistic Ocean Blue', color: '#3b82f6', gradient: 'bg-gradient-worship' },
      { key: 'green', label: 'Resurrection Eden Green', color: '#10b981', gradient: 'bg-gradient-grace' },
      { key: 'rose', label: 'Charity Sacred Rose', color: '#ec4899', gradient: 'bg-gradient-faith' },
      { key: 'amber', label: 'Sovereign Tabernacle Amber', color: '#d97706', gradient: 'bg-gradient-gold' },
      { key: 'indigo', label: 'Pentecostal Flame Indigo', color: '#6366f1', gradient: 'bg-gradient-divine' }
    ];

    const padsHtml = swatches.map(sw => {
      const isActive = state.appTheme === sw.key;
      const ring = isActive ? 'ring-4 ring-purple-500 scale-105 border-white' : 'border-purple-500/10 hover:scale-102';

      return `
        <button data-brand-theme-swatch="${sw.key}" class="glass p-5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer h-36 ${ring} btn-press">
          <div class="flex justify-between items-start">
            <span class="block w-6 h-6 rounded-lg ${sw.gradient}"></span>
            ${isActive ? '<span class="text-xs bg-purple-500/20 text-purple-300 font-bold px-1.5 py-0.5 rounded border border-purple-500/30">Active Default</span>' : ''}
          </div>
          <div>
            <h4 class="text-sm font-extrabold text-white font-['Space_Grotesk']">${sw.label}</h4>
            <span class="text-[9px] text-purple-400 font-bold uppercase tracking-widest font-['JetBrains_Mono']">Synod Color: ${sw.color}</span>
          </div>
        </button>
      `;
    }).join('');

    innerContentHtml = `
      <div class="space-y-4 text-left">
        <div class="glass p-5 rounded-xl border border-purple-500/10">
          <h3 class="text-base font-bold text-white font-['Space_Grotesk'] mb-1">Live Congregation Theme Synchronizer</h3>
          <p class="text-xs text-[#9ca3af]">Select an active Synod color preset. Changing this swatch configuration updates the entire visual landscape in real-time across every active believer's connected browser sessions instantaneously!</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          ${padsHtml}
        </div>
      </div>
    `;
  } else if (currentTab === 'quiz_builder') {
    const list = state.quizQuestionsList || [];
    
    const questionRows = list.map((q, qIdx) => {
      const correctText = q.options && q.options[q.correctAnswer] !== undefined ? q.options[q.correctAnswer] : 'None';
      const optionsStr = q.options ? q.options.join(', ') : '';
      return `
        <tr class="border-b border-purple-500/5 hover:bg-white/5 transition-colors text-xs text-left">
          <td class="py-3.5 px-4 font-bold text-white select-text">${qIdx + 1}. ${q.question}</td>
          <td class="py-3.5 px-4 text-[#9ca3af]">${optionsStr}</td>
          <td class="py-3.5 px-4 text-[#A78BFA] font-semibold">${correctText}</td>
          <td class="py-3.5 px-4 select-none text-right">
            ${q.id ? `
              <button data-delete-quiz-question-id="${q.id}" class="text-xs font-bold px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg btn-press cursor-pointer">
                Delete
              </button>
            ` : `<span class="text-[10px] text-muted-foreground italic">(Default)</span>`}
          </td>
        </tr>
      `;
    }).join('');

    innerContentHtml = `
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        <!-- New Question Form -->
        <div class="glass p-5 rounded-xl border border-purple-500/10 h-fit space-y-4">
          <h3 class="text-xs font-bold text-white uppercase tracking-widest font-mono">Create Quiz Question</h3>
          <form id="admin-create-quiz-form" class="space-y-4 text-xs text-left">
            <div>
              <label class="block text-[10px] uppercase font-bold text-purple-400 mb-1.5 font-mono tracking-wider">Question Description</label>
              <textarea id="quiz-add-question" required class="w-full bg-[#11111A] border border-purple-500/10 text-white rounded-xl px-4 py-3 h-20 focus:outline-none focus:border-purple-500/40 font-sans" placeholder="e.g. Who built the ark?"></textarea>
            </div>
            <div>
              <label class="block text-[10px] uppercase font-bold text-purple-400 mb-1 font-mono tracking-wider">Option A</label>
              <input type="text" id="quiz-add-opt0" required class="w-full bg-[#11111A] border border-purple-500/10 text-white rounded-xl px-3.5 py-2 focus:outline-none focus:border-purple-500/40">
            </div>
            <div>
              <label class="block text-[10px] uppercase font-bold text-purple-400 mb-1 font-mono tracking-wider">Option B</label>
              <input type="text" id="quiz-add-opt1" required class="w-full bg-[#11111A] border border-purple-500/10 text-white rounded-xl px-3.5 py-2 focus:outline-none focus:border-purple-500/40">
            </div>
            <div>
              <label class="block text-[10px] uppercase font-bold text-purple-400 mb-1 font-mono tracking-wider">Option C</label>
              <input type="text" id="quiz-add-opt2" required class="w-full bg-[#11111A] border border-purple-500/10 text-white rounded-xl px-3.5 py-2 focus:outline-none focus:border-purple-500/40">
            </div>
            <div>
              <label class="block text-[10px] uppercase font-bold text-purple-400 mb-1 font-mono tracking-wider">Option D</label>
              <input type="text" id="quiz-add-opt3" required class="w-full bg-[#11111A] border border-purple-500/10 text-white rounded-xl px-3.5 py-2 focus:outline-none focus:border-purple-500/40">
            </div>
            <div>
              <label class="block text-[10px] uppercase font-bold text-purple-400 mb-1 font-mono tracking-wider">Which index is correct?</label>
              <select id="quiz-add-correct" class="w-full bg-[#11111A] border border-purple-500/10 text-white rounded-xl px-3.5 py-2 focus:outline-none focus:border-purple-500/35">
                <option value="0">Option A is correct</option>
                <option value="1">Option B is correct</option>
                <option value="2">Option C is correct</option>
                <option value="3">Option D is correct</option>
              </select>
            </div>
            <button type="submit" class="w-full bg-gradient-spiritual text-white font-extrabold py-3 px-4 rounded-xl shadow-lg border border-purple-400/20 hover-lift btn-press cursor-pointer">
              Deploy Quiz Question
            </button>
          </form>
        </div>

        <!-- Question List display -->
        <div class="glass p-5 rounded-xl border border-purple-500/10 lg:col-span-2 overflow-hidden space-y-4 flex flex-col justify-between">
          <div class="space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 class="text-xs font-bold text-white uppercase tracking-widest font-mono">Active Quiz Bank</h3>
                <p class="text-[10px] text-purple-300/60 font-medium">Configure interactive wisdom challenge questions for the parish congregation.</p>
              </div>
              <button id="btn-reset-quiz-defaults" class="text-[10px] px-3.5 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-xl btn-press font-semibold cursor-pointer flex items-center gap-1">
                🔄 Clear & Seed Default Set
              </button>
            </div>
            <div class="overflow-x-auto max-h-[520px]">
              <table class="w-full border-collapse">
                <thead>
                  <tr class="border-b border-purple-500/10 text-[10px] uppercase font-bold text-purple-400 font-mono tracking-wider">
                    <th class="py-2.5 px-4 text-left">Question</th>
                    <th class="py-2.5 px-4 text-left">Options</th>
                    <th class="py-2.5 px-4 text-left">Correct Answer</th>
                    <th class="py-2 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${questionRows || `<tr><td colspan="4" class="py-12 text-center text-[#9ca3af] font-sans">No custom quiz questions found. Click 'Clear & Seed Default Set' to start.</td></tr>`}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
  } else if (currentTab === 'downloads_manager') {
    const list = state.downloadLinks || [];

    const linkRows = list.map((dl, dlIdx) => {
      return `
        <tr class="border-b border-purple-500/5 hover:bg-white/5 transition-colors text-xs text-left">
          <td class="py-3 px-4 font-bold text-white max-w-xs truncate select-text">${dl.title}</td>
          <td class="py-3 px-4 text-purple-400 max-w-xs truncate select-all">${dl.url}</td>
          <td class="py-3 px-4 text-muted-foreground">${dl.category || 'Direct File'}</td>
          <td class="py-3 px-4 text-[#9ca3af]">${dl.subtext || 'N/A'}</td>
          <td class="py-3 px-4 text-right">
            <button data-delete-download-id="${dl.id}" class="text-[10px] font-bold px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg btn-press cursor-pointer">
              Delete
            </button>
          </td>
        </tr>
      `;
    }).join('');

    innerContentHtml = `
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        <!-- New Download Link Creator Form -->
        <div class="glass p-5 rounded-xl border border-purple-500/10 h-fit space-y-4">
          <h3 class="text-xs font-bold text-white uppercase tracking-widest font-mono">Create Download Link</h3>
          <form id="admin-create-download-form" class="space-y-4 text-xs text-left">
            <div>
              <label class="block text-[10px] uppercase font-bold text-purple-400 mb-1.5 font-mono tracking-wider">Installer Title</label>
              <input type="text" id="dl-add-title" required class="w-full bg-[#11111A] border border-purple-500/10 text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-purple-500/40" placeholder="e.g. HCVerse Native Windows v1.2">
            </div>
            <div>
              <label class="block text-[10px] uppercase font-bold text-purple-400 mb-1.5 font-mono tracking-wider">Direct Download Link / URL</label>
              <input type="text" id="dl-add-url" required class="w-full bg-[#11111A] border border-purple-500/10 text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-purple-500/40" placeholder="e.g. /api/download/hcverse-app.apk or https://..">
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[10px] uppercase font-bold text-purple-400 mb-1.5 font-mono tracking-wider">Category</label>
                <input type="text" id="dl-add-category" required class="w-full bg-[#11111A] border border-purple-500/10 text-white rounded-xl px-3.5 py-2.5 focus:outline-none" placeholder="e.g. Android APK">
              </div>
              <div>
                <label class="block text-[10px] uppercase font-bold text-purple-400 mb-1.5 font-mono tracking-wider">Size / Subtext</label>
                <input type="text" id="dl-add-subtext" required class="w-full bg-[#11111A] border border-purple-500/10 text-white rounded-xl px-3.5 py-2.5 focus:outline-none" placeholder="e.g. Size: 1.2 MB">
              </div>
            </div>
            <div>
              <label class="block text-[10px] uppercase font-bold text-purple-400 mb-1.5 font-mono tracking-wider">Tag Badge (Optional)</label>
              <input type="text" id="dl-add-tag" class="w-full bg-[#11111A] border border-purple-500/10 text-white rounded-xl px-3.5 py-2.5 focus:outline-none" placeholder="e.g. Recommended, New, Beta">
            </div>
            <div>
              <label class="block text-[10px] uppercase font-bold text-purple-400 mb-1.5 font-mono tracking-wider">Detailed Description</label>
              <textarea id="dl-add-description" required class="w-full bg-[#11111A] border border-purple-500/10 text-white rounded-xl px-4 py-3 h-20 focus:outline-none focus:border-purple-500/40 font-sans" placeholder="Detailed installation instructions or summary of components..."></textarea>
            </div>
            <button type="submit" class="w-full bg-gradient-spiritual text-white font-extrabold py-3 px-4 rounded-xl shadow-lg border border-purple-400/20 hover-lift btn-press cursor-pointer">
              Deploy Download Link
            </button>
          </form>
        </div>

        <!-- Deployed links management -->
        <div class="glass p-5 rounded-xl border border-purple-500/10 lg:col-span-2 overflow-hidden space-y-4 text-left">
          <div>
            <h3 class="text-xs font-bold text-white uppercase tracking-widest font-mono">Custom Download Registry</h3>
            <p class="text-[10px] text-purple-300/60 font-medium">Configure download resources that members will see immediately. These links are engineered to launch immediate download upon user click.</p>
          </div>
          <div class="overflow-x-auto max-h-[520px]">
            <table class="w-full border-collapse">
              <thead>
                <tr class="border-b border-purple-500/10 text-[10px] uppercase font-bold text-purple-400 font-mono tracking-wider">
                  <th class="py-2.5 px-4 text-left">Title</th>
                  <th class="py-2.5 px-4 text-left">Download URL</th>
                  <th class="py-2.5 px-4 text-left">Category</th>
                  <th class="py-2.5 px-4 text-left">Size</th>
                  <th class="py-2.5 px-4 text-right">Oversight</th>
                </tr>
              </thead>
              <tbody>
                ${linkRows || `<tr><td colspan="5" class="py-12 text-center text-[#9ca3af] font-sans">No custom download links configured. Utilizing system defaults on the congregant download page.</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div class="space-y-6 animate-fade-up">
      <!-- Sub headers -->
      <div class="flex flex-wrap items-center gap-1.5 border-b border-purple-500/10 pb-4 select-none">
        ${adminNavHtml}
      </div>

      <!-- Tab content display -->
      <div>
        ${innerContentHtml}
      </div>
    </div>
  `;
}

export function renderAiAssistant(state) {
  const list = state.aiMessages || [];
  const profile = state.userProfile || {};
  const isSuperAdmin = profile.role === 'super_admin';

  const balloonsHtml = list.map(msg => {
    const isBot = msg.role === 'assistant';
    const balloonBg = isBot 
      ? 'bg-[#171726] text-foreground/95 border border-[#A78BFA]/15 rounded-tl-none font-sans' 
      : 'bg-[#11111A] text-foreground border border-white/[0.03] rounded-tr-none self-end font-sans';

    const header = isBot 
      ? `<span class="text-[9px] font-bold text-[#A78BFA] tracking-wider uppercase font-mono mb-1.5 select-none flex items-center gap-1">✨ HCVerse AI Spiritual Assistant</span>` 
      : `<span class="text-[9px] font-bold text-muted-foreground tracking-wider uppercase font-mono mb-1.5 select-none text-right block">Me (${profile.displayName || 'Believer'})</span>`;

    return `
      <div class="flex flex-col max-w-[85%] ${isBot ? 'self-start' : 'self-end'} mt-4 animate-fade-up">
        ${header}
        <div class="px-5 py-4 rounded-3xl text-xs sm:text-sm shadow-sm text-left leading-relaxed font-sans select-text break-words transition-all ${balloonBg}">
          <p>${msg.content}</p>
        </div>
      </div>
    `;
  }).join('');

  // Prompts chip suggestions
  const CHIPS = [
    "I feel anxious today. Find comfort scriptures",
    "Explain the Greek translation context in Romans 8",
    "Help me draft a study calendar for Proverbs wisdom",
    "Unpack John 1:1 word meanings in KJV"
  ];
  const chipsHtml = CHIPS.map(ch => `
    <button data-ai-prompt-chip="${ch}" class="bg-[#11111A]/80 border border-white/[0.04] text-muted-foreground hover:text-foreground px-4 py-2.5 rounded-2xl text-xs font-semibold btn-press cursor-pointer text-left leading-snug truncate whitespace-nowrap scrollbar-hide max-w-full block hover:scale-[1.01] transition-all">${ch}</button>
  `).join('');

  return `
    <div class="h-[calc(100vh-10rem)] max-w-4xl mx-auto flex flex-col justify-between bg-card border border-border/80 rounded-3xl overflow-hidden relative select-none">
      <!-- UI Header with sanctuary theme -->
      <div class="px-6 py-4 border-b border-border/40 flex justify-between items-center bg-[#11111A]/40 backdrop-blur-xl">
        <div class="text-left flex items-center gap-2.5">
          <span class="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
          <div>
            <h4 class="text-xs font-bold text-primary uppercase tracking-widest font-mono flex items-center gap-1">
              <span>${ICONS.sparkles}</span> Spiritual Companion
            </h4>
            <p class="text-[9px] text-muted-foreground font-mono">Theology & KJV Translation Explorer</p>
          </div>
        </div>
        ${isSuperAdmin ? `
          <button id="btn-show-qa-composer" class="text-xs text-primary hover:text-[#C4B5FD] font-bold btn-press flex items-center gap-1.5 cursor-pointer">
            🔧 <span class="hidden sm:inline">Configure rules</span>
          </button>
        ` : ''}
      </div>

      <!-- Scrolling conversation Stage -->
      <div id="ai-conversation-stage" class="flex-grow overflow-y-auto p-6 scroll-smooth flex flex-col select-text bg-background">
        ${balloonsHtml ? `
          ${balloonsHtml}
          ${state.aiCompanionTyping ? `
            <div class="flex flex-col max-w-[85%] self-start mt-4 animate-fade-up">
              <span class="text-[9px] font-bold text-[#A78BFA] tracking-wider uppercase font-mono mb-1.5 select-none flex items-center gap-1">✨ HCVerse AI Spiritual Assistant</span>
              <div class="px-5 py-3 rounded-3xl bg-[#171726] border border-[#A78BFA]/15 rounded-tl-none self-start flex items-center gap-1.5 min-w-[3.5rem] justify-center">
                <span class="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                <span class="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" style="animation-delay: 0.15s"></span>
                <span class="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" style="animation-delay: 0.3s"></span>
              </div>
            </div>
          ` : ''}
        ` : (state.aiCompanionTyping ? `
          <div class="flex flex-col max-w-[85%] self-start mt-4 animate-fade-up">
            <span class="text-[9px] font-bold text-[#A78BFA] tracking-wider uppercase font-mono mb-1.5 select-none flex items-center gap-1">✨ HCVerse AI Spiritual Assistant</span>
            <div class="px-5 py-3 rounded-3xl bg-[#171726] border border-[#A78BFA]/15 rounded-tl-none self-start flex items-center gap-1.5 min-w-[3.5rem] justify-center">
              <span class="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
              <span class="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" style="animation-delay: 0.15s"></span>
              <span class="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" style="animation-delay: 0.3s"></span>
            </div>
          </div>
        ` : `
          <div class="my-auto text-center space-y-4 max-w-sm mx-auto select-none animate-fade-up">
            <span class="text-5xl inline-block animate-float text-[#A78BFA]">${ICONS.sparkles}</span>
            <div class="space-y-1.5">
              <h3 class="text-sm font-bold text-foreground uppercase tracking-widest font-mono">Faith Companion Awake</h3>
              <p class="text-xs text-muted-foreground leading-relaxed font-sans">Ask anything. This assistant explores scriptures, explains high-faith translations, and plans study tracks.</p>
            </div>
          </div>
        `)}
      </div>

      <!-- Instruction Chips Tray -->
      <div class="px-5 py-3 bg-[#11111A]/60 flex gap-2 overflow-x-auto scrollbar-hide border-t border-border/40 select-none">
        ${chipsHtml}
      </div>

      <!-- Text Inputs bar -->
      <form id="ai-chat-send-form" class="h-16 border-t border-border/45 px-5 flex items-center gap-3 bg-[#11111A]/20 select-none">
        <input type="text" id="ai-chat-text-input" required class="flex-grow bg-[#11111A] px-4.5 py-3 rounded-2xl border border-white/[0.04] text-foreground placeholder-muted-foreground/50 text-xs sm:text-sm h-11 select-text" placeholder="Explore theological translation queries or ask for comfort verses...">
        <button type="submit" class="bg-primary hover:opacity-90 transition-all text-[#07070B] font-extrabold p-3 rounded-2xl flex items-center justify-center w-11 h-11 min-w-11 cursor-pointer">
          <span class="w-4.5 h-4.5 flex items-center justify-center">${ICONS.send}</span>
        </button>
      </form>

      <!-- CUSTOM Q&A COMPOSER MODAL (Admin trigger, hidden by default) -->
      <div id="qa-composer-overlay" class="hidden fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div class="max-w-md w-full bg-[#11111A] p-6 rounded-3xl border border-white/[0.05] space-y-4 animate-fade-up">
          <div class="flex justify-between items-center border-b border-border-43 pb-2">
            <h3 class="text-base font-bold text-foreground font-sans">Configure AI Response Rules</h3>
            <button id="btn-close-composer" class="text-muted-foreground hover:text-foreground text-xl font-bold btn-press cursor-pointer">&times;</button>
          </div>

          <form id="create-qa-form" class="space-y-4 text-left">
            <div>
              <label class="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-widest font-mono">Trigger Phrase / Keywords</label>
              <input type="text" id="qa-keywords" required class="w-full bg-[#171726]/40 px-4 py-3 rounded-2xl border border-white/[0.04] text-foreground text-xs" placeholder="e.g. anxiety, fear, help">
            </div>
            <div>
              <label class="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-widest font-mono">Pre-paired Answer Text</label>
              <textarea id="qa-answer" required class="w-full bg-[#171726]/40 px-4 py-3 rounded-2xl border border-white/[0.04] text-foreground text-xs h-32" placeholder="Write a gorgeous, comforting scriptural response block..."></textarea>
            </div>

            <button type="submit" class="w-full bg-primary text-[#07070B] font-bold py-3 px-4 rounded-2xl hover:opacity-95 transition-all cursor-pointer flex justify-center items-center">
              Deploy Response Rule
            </button>
          </form>
        </div>
      </div>
    </div>
  `;
}
