/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ICONS } from './icons.js';
import { SCRIPTURES } from './constants.js';

export function renderLanding(state) {
  // Rotate scripture text every few seconds (tick logic handled in main.js)
  const scripture = SCRIPTURES[state.scriptureIndex || 0];

  return `
    <div class="min-h-screen dark-tech-grid flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <!-- Animated Background Ambient Light Orbs -->
      <div class="absolute top-1/4 left-1/4 -translate-y-1/2 w-80 h-80 rounded-full-soft bg-purple-600/10 blur-[100px] animate-orb1 pointer-events-none select-none"></div>
      <div class="absolute bottom-1/4 right-1/4 translate-y-1/2 w-96 h-96 rounded-full-soft bg-indigo-600/10 blur-[120px] animate-orb2 pointer-events-none select-none"></div>

      <!-- Landing Page Content container -->
      <div class="max-w-5xl mx-auto w-full text-center space-y-12 relative z-10 my-auto animate-fade-up">
        
        <!-- Logo Icon Block -->
        <div class="inline-flex flex-col items-center">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 shadow-[0_0_25px_rgba(124,58,237,0.15)] animate-breathe text-purple-300">
            <span class="text-3xl font-serif">✝</span>
          </div>
          <span class="text-[9px] font-bold tracking-[0.3em] text-purple-400/60 uppercase font-mono mt-3 select-none">Divine Fellowship Portal</span>
        </div>

        <div class="space-y-4">
          <h1 class="text-6xl sm:text-8xl font-black tracking-tighter font-['Space_Grotesk'] bg-gradient-to-r from-purple-300 via-violet-100 to-indigo-300 bg-clip-text text-transparent leading-none drop-shadow-sm">
            HCVerse
          </h1>
          <p class="text-base sm:text-lg text-purple-200/50 max-w-xl mx-auto font-sans font-medium tracking-wide">
            Where Faith Meets Community. Digital Fellowship for Believers.
          </p>
        </div>

        <!-- Rotating scripture card with smooth transition wrap -->
        <div class="glass p-7 rounded-2xl max-w-2xl mx-auto border-purple-500/15 relative bg-[#0c0a21]/50 shadow-[0_4px_30px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all duration-500 hover:border-purple-500/35">
          <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-950/80 border border-purple-400/20 px-3 py-0.5 rounded-full text-[9px] text-purple-300 uppercase tracking-widest font-mono">
            RHEMA OF THE SECOND
          </div>
          <p id="landing-scripture-text" class="text-base sm:text-lg font-medium italic text-purple-100/90 leading-relaxed font-sans text-animation-smooth">
            "${scripture.text}"
          </p>
          <p id="landing-scripture-ref" class="text-xs text-purple-400 font-extrabold uppercase tracking-widest mt-4 font-mono">
            — ${scripture.ref}
          </p>
        </div>

        <!-- CTA Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4.5 justify-center items-center max-w-sm mx-auto">
          <button id="btn-goto-signup" class="w-full glow-btn-primary text-white font-extrabold tracking-wide py-3.5 px-8 rounded-xl text-xs md:text-sm shadow-xl cursor-pointer">
            Get Started (Sign Up)
          </button>
          <button id="btn-goto-login" class="w-full glow-btn-secondary text-purple-200 font-extrabold tracking-wide py-3.5 px-8 rounded-xl text-xs md:text-sm cursor-pointer">
            Sign In
          </button>
        </div>

        <!-- Distinct Web3 Feature Bento-styled layout -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-16 text-left">
          <div class="neo-glow-card p-6 rounded-2xl hover-lift card-glow bg-[#0b081c]/70 flex flex-col justify-between h-48">
            <div>
              <span class="text-purple-400 inline-flex items-center justify-center mb-4 p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl">${ICONS.users}</span>
              <h3 class="text-white font-extrabold text-sm md:text-base font-['Space_Grotesk']">Digital Fellowship</h3>
              <p class="text-xs text-[#9ca3af]/90 font-medium mt-2 leading-relaxed h-[68px] overflow-hidden">Join home cell groups, participate in chat rooms, and share daily testimonies with believers worldwide.</p>
            </div>
          </div>
          <div class="neo-glow-card p-6 rounded-2xl hover-lift card-glow bg-[#0b081c]/70 flex flex-col justify-between h-48">
            <div>
              <span class="text-blue-400 inline-flex items-center justify-center mb-4 p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl">${ICONS['book-open']}</span>
              <h3 class="text-white font-extrabold text-sm md:text-base font-['Space_Grotesk']">Bible Study</h3>
              <p class="text-xs text-[#9ca3af]/90 font-medium mt-2 leading-relaxed h-[68px] overflow-hidden">Access the built-in Bible reader, complete daily devotionals, and test your knowledge with interactive quizzes.</p>
            </div>
          </div>
          <div class="neo-glow-card p-6 rounded-2xl hover-lift card-glow bg-[#0b081c]/70 flex flex-col justify-between h-48">
            <div>
              <span class="text-pink-400 inline-flex items-center justify-center mb-4 p-2.5 bg-pink-500/10 border border-pink-500/20 rounded-xl">${ICONS.heart}</span>
              <h3 class="text-white font-extrabold text-sm md:text-base font-['Space_Grotesk']">Prayer Room</h3>
              <p class="text-xs text-[#9ca3af]/90 font-medium mt-2 leading-relaxed h-[68px] overflow-hidden">Submit prayer concerns, join intercessors in prayer, and view up-to-the-minute prayer requests.</p>
            </div>
          </div>
          <div class="neo-glow-card p-6 rounded-2xl hover-lift card-glow bg-[#0b081c]/70 flex flex-col justify-between h-48">
            <div>
              <span class="text-amber-400 inline-flex items-center justify-center mb-4 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">${ICONS.calendar}</span>
              <h3 class="text-white font-extrabold text-sm md:text-base font-['Space_Grotesk']">Community Events</h3>
              <p class="text-xs text-[#9ca3af]/90 font-medium mt-2 leading-relaxed h-[68px] overflow-hidden">Stay updated and RSVP to cell prayer sessions, outreaches, conferences, and Sunday worship services.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer block -->
      <div class="text-center relative z-10 text-xs text-purple-400/40 select-none font-semibold uppercase tracking-widest font-mono mt-8">
        <p>Built with love for the body of Christ ✝️</p>
      </div>
    </div>
  `;
}

export function renderLogin(state) {
  const errorMsg = state.authError ? `<div class="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm mb-4">${state.authError}</div>` : '';
  const loadingClass = state.authSubmitting ? 'opacity-50 pointer-events-none' : '';

  return `
    <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div class="max-w-md w-full glass p-8 rounded-2xl border-purple-500/10 shadow-2xl space-y-6 animate-fade-up ${loadingClass}">
        <div class="text-center space-y-2">
          <button id="auth-back-to-landing" class="inline-flex items-center text-xs text-purple-400 hover:text-purple-300 font-medium btn-press cursor-pointer">
            ${ICONS['chevron-left']} Back to Home
          </button>
          <h2 class="text-3xl font-extrabold text-white tracking-tight font-['Space_Grotesk']">Welcome Back</h2>
          <p class="text-xs text-purple-300/60">Enter your credentials to access HCVerse fellowship</p>
        </div>

        ${errorMsg}

        <!-- Tabs -->
        <div class="grid grid-cols-2 bg-purple-950/20 p-1 rounded-xl border border-purple-500/10 text-sm">
          <button class="py-2.5 rounded-lg text-white font-semibold bg-purple-500/30 shadow-sm cursor-default">Sign In</button>
          <button id="auth-tab-signup" class="py-2.5 rounded-lg text-[#9ca3af] hover:text-white font-semibold btn-press cursor-pointer">Sign Up</button>
        </div>

        <!-- Form -->
        <form id="login-form" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-purple-200/80 mb-1.5 uppercase font-['JetBrains_Mono']">Email Address</label>
            <input type="email" id="login-email" required class="w-full glass px-4 py-3 rounded-xl border-purple-500/10 text-white placeholder-purple-300/30 focus:outline-none focus:border-purple-500/40 text-sm" placeholder="email@example.com">
          </div>
          <div>
            <div class="flex justify-between items-center mb-1.5">
              <label class="block text-xs font-semibold text-purple-200/80 uppercase font-['JetBrains_Mono']">Password</label>
              <button type="button" id="btn-forgot-password" class="text-xs text-purple-400 hover:text-purple-300 btn-press cursor-pointer">Forgot?</button>
            </div>
            <input type="password" id="login-password" required class="w-full glass px-4 py-3 rounded-xl border-purple-500/10 text-white placeholder-purple-300/30 focus:outline-none focus:border-purple-500/40 text-sm" placeholder="••••••••">
          </div>

          <button type="submit" class="w-full bg-gradient-spiritual text-white font-bold py-3 px-4 rounded-xl shadow-lg border border-purple-400/20 hover-lift btn-press cursor-pointer flex justify-center items-center">
            ${state.authSubmitting ? '<span class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>' : 'Sign In'}
          </button>
        </form>

        <div class="relative flex py-2 items-center">
          <div class="flex-grow border-t border-purple-500/10"></div>
          <span class="flex-shrink mx-4 text-[#9ca3af] text-xs uppercase font-['JetBrains_Mono']">Or Continue with</span>
          <div class="flex-grow border-t border-purple-500/10"></div>
        </div>

        <button id="btn-google-auth" class="w-full bg-white/5 border border-white/10 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 hover-lift btn-press cursor-pointer">
          <svg class="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
          Google
        </button>
      </div>
    </div>
  `;
}

export function renderSignup(state) {
  const errorMsg = state.authError ? `<div class="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm mb-4">${state.authError}</div>` : '';
  const loadingClass = state.authSubmitting ? 'opacity-50 pointer-events-none' : '';

  return `
    <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div class="max-w-md w-full glass p-8 rounded-2xl border-purple-500/10 shadow-2xl space-y-6 animate-fade-up ${loadingClass}">
        <div class="text-center space-y-2">
          <button id="auth-back-to-landing-2" class="inline-flex items-center text-xs text-purple-400 hover:text-purple-300 font-medium btn-press cursor-pointer">
            ${ICONS['chevron-left']} Back to Home
          </button>
          <h2 class="text-3xl font-extrabold text-white tracking-tight font-['Space_Grotesk']">Create Account</h2>
          <p class="text-xs text-purple-300/60">Join standard cells & spiritual community</p>
        </div>

        ${errorMsg}

        <!-- Tabs -->
        <div class="grid grid-cols-2 bg-purple-950/20 p-1 rounded-xl border border-purple-500/10 text-sm">
          <button id="auth-tab-login" class="py-2.5 rounded-lg text-[#9ca3af] hover:text-white font-semibold btn-press cursor-pointer">Sign In</button>
          <button class="py-2.5 rounded-lg text-white font-semibold bg-purple-500/30 shadow-sm cursor-default">Sign Up</button>
        </div>

        <!-- Form -->
        <form id="signup-form" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-purple-200/80 mb-1.5 uppercase font-['JetBrains_Mono']">Display Name</label>
            <input type="text" id="signup-name" required class="w-full glass px-4 py-3 rounded-xl border-purple-500/10 text-white placeholder-purple-300/30 focus:outline-none focus:border-purple-500/40 text-sm" placeholder="John Doe">
          </div>
          <div>
            <label class="block text-xs font-semibold text-purple-200/80 mb-1.5 uppercase font-['JetBrains_Mono']">Email Address</label>
            <input type="email" id="signup-email" required class="w-full glass px-4 py-3 rounded-xl border-purple-500/10 text-white placeholder-purple-300/30 focus:outline-none focus:border-purple-500/40 text-sm" placeholder="email@example.com">
          </div>
          <div>
            <label class="block text-xs font-semibold text-purple-200/80 mb-1.5 uppercase font-['JetBrains_Mono']">Password</label>
            <input type="password" id="signup-password" required class="w-full glass px-4 py-3 rounded-xl border-purple-500/10 text-white placeholder-purple-300/30 focus:outline-none focus:border-purple-500/40 text-sm" placeholder="••••••••">
          </div>

          <button type="submit" class="w-full bg-gradient-spiritual text-white font-bold py-3 px-4 rounded-xl shadow-lg border border-purple-400/20 hover-lift btn-press cursor-pointer flex justify-center items-center">
            ${state.authSubmitting ? '<span class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>' : 'Register Now'}
          </button>
        </form>

        <div class="relative flex py-2 items-center">
          <div class="flex-grow border-t border-purple-500/10"></div>
          <span class="flex-shrink mx-4 text-[#9ca3af] text-xs uppercase font-['JetBrains_Mono']">Or Continue with</span>
          <div class="flex-grow border-t border-purple-500/10"></div>
        </div>

        <button id="btn-google-auth-signup" class="w-full bg-white/5 border border-white/10 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 hover-lift btn-press cursor-pointer">
          <svg class="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
          Google
        </button>
      </div>
    </div>
  `;
}

export function renderForgotPassword(state) {
  const errorMsg = state.authError ? `<div class="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm mb-4">${state.authError}</div>` : '';
  const successMsg = state.forgotSuccess ? `<div class="p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-sm mb-4">A password reset window was dispatched to your email inbox.</div>` : '';

  return `
    <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div class="max-w-md w-full glass p-8 rounded-2xl border-purple-500/10 shadow-2xl space-y-6 animate-fade-up">
        <div class="text-center space-y-2">
          <button id="forgot-back-to-login" class="inline-flex items-center text-xs text-purple-400 hover:text-purple-300 font-medium btn-press cursor-pointer">
            ${ICONS['chevron-left']} Back to Sign In
          </button>
          <h2 class="text-3xl font-extrabold text-white tracking-tight font-['Space_Grotesk']">Reset Password</h2>
          <p class="text-xs text-purple-300/60">Dispatches reset guidelines securely to your email address</p>
        </div>

        ${errorMsg}
        ${successMsg}

        <form id="forgot-form" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-purple-200/80 mb-1.5 uppercase font-['JetBrains_Mono']">Registered Email</label>
            <input type="email" id="forgot-email" required class="w-full glass px-4 py-3 rounded-xl border-purple-500/10 text-white placeholder-purple-300/30 focus:outline-none focus:border-purple-500/40 text-sm" placeholder="email@example.com">
          </div>

          <button type="submit" class="w-full bg-gradient-spiritual text-white font-bold py-3 px-4 rounded-xl shadow-lg border border-purple-400/20 hover-lift btn-press cursor-pointer flex justify-center items-center">
            ${state.authSubmitting ? '<span class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>' : 'Send Recovery Link'}
          </button>
        </form>
      </div>
    </div>
  `;
}

export function renderOnboarding(state) {
  const cellsOptions = (state.cells || [])
    .filter(c => !c.suspended)
    .map(c => `<option value="${c.id}">${c.name} (${c.location?.city || "Worldwide"})</option>`)
    .join('');

  const cellAction = state.onboardingCellAction || 'none';

  return `
    <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div class="max-w-md w-full glass p-8 rounded-2xl border-purple-500/10 shadow-2xl space-y-6 animate-fade-up">
        <div class="text-center space-y-2">
          <span class="text-xs font-semibold uppercase tracking-wider text-purple-400 font-['JetBrains_Mono']">Step 1 of 1</span>
          <h2 class="text-3xl font-extrabold text-white tracking-tight font-['Space_Grotesk']">Soul Profile</h2>
          <p class="text-xs text-purple-300/60">Establish your profile coordinates and join or create a fellowship Cell</p>
        </div>

        ${state.authError ? `<div class="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm mb-2">${state.authError}</div>` : ''}

        <form id="onboarding-form" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-purple-200/80 mb-1.5 uppercase font-['JetBrains_Mono']">Display Name</label>
            <input type="text" id="onboard-name" required value="${state.user?.displayName || ''}" class="w-full glass px-4 py-3 rounded-xl border-purple-500/10 text-white placeholder-purple-300/30 focus:outline-none focus:border-purple-500/40 text-sm">
          </div>

          <div>
            <label class="block text-xs font-semibold text-purple-200/80 mb-1.5 uppercase font-['JetBrains_Mono']">Bio / Testimony snippet</label>
            <textarea id="onboard-bio" class="w-full glass px-4 py-3 rounded-xl border-purple-500/10 text-white placeholder-purple-300/30 focus:outline-none focus:border-purple-500/40 text-sm h-16" placeholder="A brief confession of your faith..."></textarea>
          </div>

          <div>
            <label class="block text-xs font-semibold text-purple-200/80 mb-1.5 uppercase font-['JetBrains_Mono']">City / Geographic Region</label>
            <input type="text" id="onboard-location" class="w-full glass px-4 py-3 rounded-xl border-purple-500/10 text-white placeholder-purple-300/30 focus:outline-none focus:border-purple-500/40 text-sm" placeholder="e.g. London, UK">
          </div>

          <!-- Fellowship Cell Actions Tab -->
          <div class="space-y-2">
            <label class="block text-xs font-semibold text-purple-200/80 uppercase font-['JetBrains_Mono']">Fellowship Cell Connection</label>
            <div class="grid grid-cols-3 bg-purple-950/20 p-1 rounded-xl border border-purple-500/10 text-xs">
              <button type="button" id="onboard-cell-tab-none" class="py-2 rounded-lg text-center font-semibold cursor-pointer transition-colors ${cellAction === 'none' ? 'text-white bg-purple-500/30' : 'text-[#9ca3af] hover:text-white'}">None</button>
              <button type="button" id="onboard-cell-tab-join" class="py-2 rounded-lg text-center font-semibold cursor-pointer transition-colors ${cellAction === 'join' ? 'text-white bg-purple-500/30' : 'text-[#9ca3af] hover:text-white'}">Join Cell</button>
              <button type="button" id="onboard-cell-tab-create" class="py-2 rounded-lg text-center font-semibold cursor-pointer transition-colors ${cellAction === 'create' ? 'text-white bg-purple-500/30' : 'text-[#9ca3af] hover:text-white'}">Create Cell</button>
            </div>
          </div>

          <!-- Join Existing Cell Section -->
          <div id="onboard-join-section" class="${cellAction === 'join' ? '' : 'hidden'} animate-fade-up">
            <label class="block text-xs font-semibold text-purple-200/80 mb-1.5 uppercase font-['JetBrains_Mono']">Select Cell to Join</label>
            <select id="onboard-cell" class="w-full bg-[#141024] cursor-pointer text-white px-4 py-3 rounded-xl border border-purple-500/10 focus:outline-none focus:border-purple-500/40 text-sm">
              <option value="">Stay unaffiliated (Join later)</option>
              ${cellsOptions}
            </select>
          </div>

          <!-- Create New Cell Section -->
          <div id="onboard-create-section" class="${cellAction === 'create' ? '' : 'hidden'} space-y-3 p-4 rounded-xl border border-purple-500/10 bg-purple-500/5 animate-fade-up">
            <div class="text-xs text-purple-300/80 font-semibold uppercase tracking-wider mb-2 font-['JetBrains_Mono']">New Fellowship Cell Configuration</div>
            
            <div>
              <label class="block text-xs font-semibold text-purple-200/80 mb-1" for="onboard-new-cell-name">Cell Name</label>
              <input type="text" id="onboard-new-cell-name" class="w-full glass px-3 py-2 rounded-lg border-purple-500/10 text-white placeholder-purple-300/30 focus:outline-none focus:border-purple-500/40 text-sm" placeholder="e.g. Damascus Fellowship">
            </div>
            
            <div>
              <label class="block text-xs font-semibold text-purple-200/80 mb-1" for="onboard-new-cell-desc">Cell Focus / Biography</label>
              <textarea id="onboard-new-cell-desc" class="w-full glass px-3 py-2 rounded-lg border-purple-500/10 text-white placeholder-purple-300/30 focus:outline-none focus:border-purple-500/40 text-sm h-14" placeholder="e.g. A community focused on continuous prayer..."></textarea>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-purple-200/80 mb-1">City / Location</label>
                <input type="text" id="onboard-new-cell-city" class="w-full glass px-3 py-2 rounded-lg border-purple-500/10 text-white placeholder-purple-300/30 focus:outline-none focus:border-purple-500/40 text-sm" placeholder="e.g. Damascus">
              </div>
              <div>
                <label class="block text-xs font-semibold text-purple-200/80 mb-1">Region / Country</label>
                <input type="text" id="onboard-new-cell-state" class="w-full glass px-3 py-2 rounded-lg border-purple-500/10 text-white placeholder-purple-300/30 focus:outline-none focus:border-purple-500/40 text-sm" placeholder="e.g. Syria">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-purple-200/80 mb-1">Weekly Meeting day</label>
                <select id="onboard-new-cell-day" class="w-full bg-[#141024] cursor-pointer text-white px-3 py-2 rounded-lg border border-purple-500/10 focus:outline-none focus:border-purple-500/40 text-sm">
                  <option value="Wednesday">Wednesday</option>
                  <option value="Friday" selected>Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Thursday">Thursday</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-purple-200/80 mb-1">Meeting time</label>
                <input type="text" id="onboard-new-cell-time" class="w-full glass px-3 py-2 rounded-lg border-purple-500/10 text-white placeholder-purple-300/30 focus:outline-none focus:border-purple-500/40 text-sm" placeholder="e.g. 18:00" value="18:30">
              </div>
            </div>
          </div>

          <button type="submit" class="w-full bg-gradient-spiritual text-white font-bold py-3 px-4 rounded-xl shadow-lg border border-purple-400/20 hover-lift btn-press cursor-pointer flex justify-center items-center font-['Space_Grotesk']">
            ${state.authSubmitting ? '<span class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>' : 'Complete Setup & Enter Fellowship'}
          </button>
        </form>
      </div>
    </div>
  `;
}
