'use client';

import React from 'react';
import {
  Sun,
  Moon,
  Coins,
  MapPin,
  Radio,
  User,
  ShieldCheck,
  Bell,
  CheckCircle2,
  Globe,
  Sparkles,
} from 'lucide-react';
import { UserRole } from '@/types';
import { translations } from '@/lib/i18n';

interface HeaderProps {
  role: UserRole;
  onRoleChange: (newRole: UserRole) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  userCoins: number;
  language: 'EN' | 'TEL';
  onToggleLanguage: () => void;
  onTriggerAlertTest: () => void;
  onOpenRewards: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  role,
  onRoleChange,
  darkMode,
  onToggleDarkMode,
  userCoins,
  language,
  onToggleLanguage,
  onTriggerAlertTest,
  onOpenRewards,
}) => {
  const t = translations[language];

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0B1528]/80 backdrop-blur-xl text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/5 shadow-2xl select-none transition-colors duration-300">
      <div className="px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Telemetry */}
        <div className="flex items-center gap-6 min-w-0">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-tr from-amber-500 to-teal-400 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center border border-slate-200 dark:border-white/10">
                <span className="text-amber-400 font-black text-2xl tracking-tighter">▲</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 font-headline uppercase leading-none">
                {t.CIVICLENS_PLATFORM}
              </span>
              <span className="text-[9px] font-bold tracking-[0.3em] text-amber-500/80 uppercase mt-1">
                {t.VIZAG_LOCATION}
              </span>
            </div>
          </div>

          {/* Telemetry readout with refined styling */}
          <div className="hidden xl:flex items-center gap-3 text-[10px] text-slate-500 font-mono pl-6 border-l border-slate-200 dark:border-white/5">
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md">
              <MapPin className="w-3 h-3 text-amber-500/70" />
              <span className="text-slate-700 dark:text-slate-300">17.7211° N, 83.3155° E</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-slate-700 dark:text-slate-300 uppercase font-bold tracking-wider">{t.LIVE_REC}</span>
            </div>
          </div>
        </div>

        {/* Right side: Points, Language, Profile, Sync */}
        <div className="flex items-center gap-4">
          {/* Civic Coins Pill with premium styling */}
          <button
            onClick={onOpenRewards}
            className="group relative flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
            <Coins className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span className="font-bold text-sm tracking-tight text-slate-700 dark:text-slate-200">{userCoins} <span className="text-[10px] text-slate-500 ml-0.5">{t.POINTS}</span></span>
          </button>

          {/* Role Switcher with premium glassmorphism */}
          <div className="hidden lg:flex items-center bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10 shadow-inner">
            <button
              onClick={() => onRoleChange('citizen')}
              className={`px-4 py-1.5 rounded-lg text-[11px] font-bold tracking-wider transition-all duration-300 uppercase ${role === 'citizen'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
            >
              {t.CITIZEN}
            </button>
            <button
              onClick={() => onRoleChange('engineer')}
              className={`px-4 py-1.5 rounded-lg text-[11px] font-bold tracking-wider transition-all duration-300 uppercase ${role === 'engineer'
                  ? 'bg-teal-500 text-white shadow-[0_0_20px_rgba(20,184,166,0.3)]'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
            >
              {t.WARD_AE}
            </button>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-white/10 mx-1 hidden sm:block"></div>

          {/* Tool Buttons with refined styling */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleLanguage}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-500 hover:text-teal-400 transition-all"
              title="Change Language"
            >
              <Globe className="w-4 h-4" />
            </button>

            <button
              onClick={onTriggerAlertTest}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-500 hover:text-amber-400 transition-all"
            >
              <Bell className="w-4 h-4" />
            </button>

            <button
              onClick={onToggleDarkMode}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-500 hover:text-amber-400 transition-all"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Sync Ready indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-500 tracking-[0.1em] uppercase">{t.SYNC_READY}</span>
          </div>

          {/* User Profile Avatar with glow */}
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-0.5 bg-gradient-to-tr from-amber-500 to-teal-400 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
            <div className="relative w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-white/10 overflow-hidden shadow-xl">
              <User className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
