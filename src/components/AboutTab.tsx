'use client';

import React from 'react';
import {
  AlertTriangle,
  Flag,
  User,
  Bike,
  PiggyBank,
  Database,
  Trash2,
  Building2,
  CheckCircle2,
  Phone,
  Sparkles,
  Layers,
} from 'lucide-react';
import { translations } from '@/lib/i18n';

interface AboutTabProps {
  onClearAppData?: () => void;
  language?: 'EN' | 'TEL';
}

export const AboutTab: React.FC<AboutTabProps> = ({ onClearAppData, language = 'EN' }) => {
  const t = translations[language];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12 pb-24 select-none font-sans text-slate-900 dark:text-white">
      {/* 1. HERO SECTION - MISSION & BRAND (Simple, no box) */}
      <section className="flex flex-col md:flex-row items-center gap-8 py-6">
        <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black flex items-center justify-center text-3xl shrink-0">
          CL
        </div>
        <div className="space-y-3 text-center md:text-left">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight font-headline text-slate-900 dark:text-white uppercase">
            {t.CIVICLENS_PLATFORM}
          </h2>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <span className="px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] text-amber-500 uppercase">
              {t.VIZAG_LOCATION}
            </span>
            <span className="px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] text-teal-400 uppercase">
              Digital Governance Bridge
            </span>
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITION - CITIZEN EMPOWERMENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-12 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-amber-400 font-black text-[11px] uppercase tracking-[0.4em]">
              <AlertTriangle className="w-4 h-4" />
              <span>{t.THE_MISSION}</span>
            </div>
            <h3 className="text-4xl font-black text-slate-900 dark:text-white leading-tight">
              Transforming Civic <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-teal-400">Responsibility</span> Into Action.
            </h3>
            <p className="text-lg text-slate-400 leading-relaxed font-medium">
              {t.MISSION_TEXT}
            </p>
            <p className="text-base text-slate-500 leading-relaxed font-medium">
              {t.CITIZEN_USEFULNESS_DESC}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-8 rounded-[2rem] bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-4 hover:bg-white/10 transition-all duration-500 group">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-black text-slate-900 dark:text-white">Direct Impact</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">Your reports go directly to ward engineers, bypassing bureaucratic delays.</p>
            </div>
            <div className="p-8 rounded-[2rem] bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-4 hover:bg-white/10 transition-all duration-500 group">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-black text-slate-900 dark:text-white">XP Rewards</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">Earn Civic XP for every verified report and redeem them for community coupons.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. HERO STATISTICS (Matching 1st Photo Style) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">Global Impact Metrics</h4>
          <div className="h-px flex-1 bg-slate-100 dark:bg-white/5 mx-8"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-red-800 rounded-[2.5rem] blur opacity-10 group-hover:opacity-25 transition duration-500"></div>
            <div className="relative p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex flex-col justify-between h-full space-y-10">
              <div className="text-6xl font-black font-headline text-red-500 tracking-tighter">9,438</div>
              <div className="space-y-2">
                <div className="text-base font-bold text-slate-200 leading-snug">{t.FATALITIES_TITLE}</div>
                <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{t.FATALITIES_SOURCE}</div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-amber-800 rounded-[2.5rem] blur opacity-10 group-hover:opacity-25 transition duration-500"></div>
            <div className="relative p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex flex-col justify-between h-full space-y-10">
              <div className="text-6xl font-black font-headline text-amber-500 tracking-tighter">96.4%</div>
              <div className="space-y-2">
                <div className="text-base font-bold text-slate-200 leading-snug">{t.ACCURACY}</div>
                <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">AI Verification Engine</div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-teal-800 rounded-[2.5rem] blur opacity-10 group-hover:opacity-25 transition duration-500"></div>
            <div className="relative p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex flex-col justify-between h-full space-y-10">
              <div className="text-6xl font-black font-headline text-teal-400 tracking-tighter">8.9:1</div>
              <div className="space-y-2">
                <div className="text-base font-bold text-slate-200 leading-snug">{t.DEDUPLICATION}</div>
                <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Signal Noise Reduction</div>
              </div>
            </div>
          </div>
        </div>

        {/* Two-Wheeler Fatality & Pilot Economics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative group overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-amber-950/40 to-slate-900 border border-amber-800/40 p-8 flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="text-5xl font-black text-amber-400 font-headline leading-none">44%+</div>
              <div className="text-lg font-bold text-white">Fatalities are two-wheeler riders</div>
              <div className="text-sm text-slate-400 font-medium">Delivery gig riders bear maximum surface hazard risk</div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-110 transition-transform">
              <Bike className="w-7 h-7" />
            </div>
          </div>

          <div className="relative group overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-teal-950/40 to-slate-900 border border-teal-800/40 p-8 flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="text-5xl font-black text-teal-400 font-headline leading-none">₹3,50,000</div>
              <div className="text-lg font-bold text-white">6-Month Pilot SaaS Model</div>
              <div className="text-sm text-slate-400 font-medium">Full coverage across 100 km GVMC arterial road network</div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-teal-950/60 border border-teal-800/60 flex items-center justify-center text-teal-400 shrink-0 group-hover:scale-110 transition-transform">
              <PiggyBank className="w-7 h-7" />
            </div>
          </div>
        </div>
      </section>

      {/* 5. CITIZEN IMPACT & COMMUNITY VALUE */}
      <section className="relative overflow-hidden rounded-[3rem] bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-10 md:p-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 relative rounded-[2rem] overflow-hidden group">
            <img
              src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=800"
              alt="Community Empowerment"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent"></div>
          </div>
          <div className="order-1 md:order-2 space-y-6">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">{t.CITIZEN_USEFULNESS_TITLE}</h3>
            <p className="text-slate-400 leading-relaxed font-medium">
              CivicLens is built on the principle that local knowledge is the most powerful tool for urban development. When a citizen reports a hazard, they are acting as the eyes and ears of the city, enabling government officials to respond with surgical precision.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 border border-teal-500/30">
                  <Layers className="w-4 h-4" />
                </div>
                <p className="text-sm font-bold text-slate-300">Transparent Progress Tracking</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 border border-amber-500/30">
                  <Bike className="w-4 h-4" />
                </div>
                <p className="text-sm font-bold text-slate-300">Safer Commutes for Everyone</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/30">
                  <Building2 className="w-4 h-4" />
                </div>
                <p className="text-sm font-bold text-slate-300">Stronger Government Accountability</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PLATFORM CONTROL & DATA SAFETY */}
      <section className="flex flex-col sm:flex-row items-center justify-between p-10 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[1.5rem] bg-teal-500/10 flex items-center justify-center text-teal-400 border border-teal-500/20 shadow-2xl">
            <Database className="w-8 h-8" />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">{t.STORAGE_STATE}</div>
            <div className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest">{t.SYNCED_LOCAL}</div>
          </div>
        </div>

        {onClearAppData && (
          <button
            onClick={onClearAppData}
            className="group relative px-10 py-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 text-[11px] font-black transition-all active:scale-95 uppercase tracking-[0.3em] flex items-center gap-4 overflow-hidden"
          >
            <Trash2 className="w-5 h-5" />
            <span>{t.CLEAR_APP_DATA}</span>
          </button>
        )}
      </section>
    </div>
  );
};
