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
  return (
    <header className="sticky top-0 z-40 bg-[#0B1528] text-white border-b border-slate-800 shadow-lg select-none">
      <div className="px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand Logo & Telemetry */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-black text-lg">▲</span>
            <span className="font-extrabold text-base sm:text-lg tracking-wider text-amber-400 font-headline uppercase">
              CIVICLENS
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-extrabold tracking-widest px-1.5 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-800/60 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              LIVE REC
            </span>
          </div>

          {/* Telemetry readout matching screenshot */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 font-mono pl-2 border-l border-slate-800">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>17.7211° N, 83.3155° E Siripuram</span>
          </div>
        </div>

        {/* Right side: Points, Language, Profile, Sync */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Civic Coins Pill (Click to open rewards) */}
          <button
            onClick={onOpenRewards}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-black transition-all hover:scale-105 shadow-sm active:scale-95"
            title="Redeem Coins for Food & Clothing Coupons"
          >
            <Coins className="w-4 h-4 text-amber-400 animate-bounce" />
            <span className="font-headline tracking-wide">{userCoins} PTS</span>
          </button>

          {/* Role Switcher Pill */}
          <div className="hidden md:flex items-center bg-slate-900 p-1 rounded-full border border-slate-700 text-xs font-semibold">
            <button
              onClick={() => onRoleChange('citizen')}
              className={`px-3 py-1 rounded-full transition-all ${
                role === 'citizen'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Citizen
            </button>
            <button
              onClick={() => onRoleChange('engineer')}
              className={`px-3 py-1 rounded-full transition-all ${
                role === 'engineer'
                  ? 'bg-[#1E3A8A] text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Ward AE
            </button>
          </div>

          {/* Language Toggle (EN | తెల) */}
          <button
            onClick={onToggleLanguage}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition-colors flex items-center gap-1"
            title="Switch Language (English / Telugu)"
          >
            <Globe className="w-3.5 h-3.5 text-teal-400" />
            <span>{language === 'EN' ? 'EN | తెల' : 'తెల | EN'}</span>
          </button>

          {/* Alert Test simulator */}
          <button
            onClick={onTriggerAlertTest}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-amber-400 border border-slate-700 transition-colors"
            title="Simulate Real-Time Pothole Alert Influx"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Toggle Light / Dark Mode"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>

          {/* Sync Ready indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-teal-400 bg-teal-950/50 px-2 py-1 rounded-md border border-teal-800/50">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span>SYNC READY</span>
          </div>

          {/* User Profile Avatar */}
          <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs shadow-md">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
};
