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

interface AboutTabProps {
  onClearAppData?: () => void;
}

export const AboutTab: React.FC<AboutTabProps> = ({ onClearAppData }) => {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-5 pb-20 select-none">
      {/* 1. CIVICLENS PLATFORM BANNER */}
      <div className="bg-[#0B1528] text-white p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-md">
            CL
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-wide font-headline text-amber-400">
              CIVICLENS GVMC
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Visakhapatnam, Andhra Pradesh, India
            </p>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-400">
          <Flag className="w-5 h-5" />
        </div>
      </div>

      {/* 2. THE GROUND REALITY (Exact text from screenshot) */}
      <div className="bg-[#0B1528] p-5 rounded-2xl border border-slate-800 shadow-md space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4" />
          <span>THE GROUND REALITY</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          GVMC ward engineers currently waste countless hours sorting duplicate complaints submitted across fragmented citizen portals (Toll-Free 1800-4250-0009, WhatsApp, Smart Vizag App). Meanwhile, riders face lethal surface hazards daily without actionable repair queues.
        </p>
      </div>

      {/* 3. THREE HERO STATISTIC BARS (Exact match to screenshot) */}
      <div className="space-y-3">
        {/* Metric 1: 9,438 Fatalities */}
        <div className="bg-[#0B1528] p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black font-headline text-[#FF6B6B] tracking-tight">
              9,438
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-200">
              Pothole-related road fatalities in India (2020-2024)
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              Source: MoRTH & PTI Official Records
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-950/50 border border-red-800/40 text-[#FF6B6B] flex items-center justify-center shrink-0">
            <User className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: 44%+ Two-Wheeler Riders */}
        <div className="bg-[#0B1528] p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black font-headline text-amber-400 tracking-tight">
              44%+
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-200">
              Fatalities are two-wheeler riders
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              Delivery gig riders bear maximum surface hazard risk
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-950/50 border border-amber-800/40 text-amber-400 flex items-center justify-center shrink-0">
            <Bike className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: ₹3,50,000 SaaS Model */}
        <div className="bg-[#0B1528] p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black font-headline text-emerald-400 tracking-tight">
              ₹3,50,000
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-200">
              6-Month Pilot SaaS Model
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              Full coverage across 100 km GVMC arterial road network
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-950/50 border border-emerald-800/40 text-emerald-400 flex items-center justify-center shrink-0">
            <PiggyBank className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 4. PLATFORM OPERATIONAL METRICS (Exact match to screenshot) */}
      <div className="bg-[#0B1528] p-5 rounded-2xl border border-slate-800 shadow-md space-y-3">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 block">
          PLATFORM OPERATIONAL METRICS
        </span>

        <div className="grid grid-cols-3 gap-3 text-center pt-2">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-xl sm:text-2xl font-black text-amber-400 font-headline block">
              8.9 : 1
            </span>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
              DEDUPLICATION
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-xl sm:text-2xl font-black text-teal-400 font-headline block">
              96.4%
            </span>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
              ACCURACY
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-xl sm:text-2xl font-black text-amber-400 font-headline block">
              142
            </span>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
              ACTIVE SCOUTS
            </span>
          </div>
        </div>
      </div>

      {/* 5. FOOTER STORAGE STATE & CLEAR APP DATA BUTTON (Exact match to screenshot) */}
      <div className="flex items-center justify-between bg-[#0B1528] p-4 rounded-2xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-400 font-medium">
          <Database className="w-4 h-4 text-teal-400" />
          <span>Storage State: <strong>Synced Local</strong></span>
        </div>

        {onClearAppData && (
          <button
            onClick={onClearAppData}
            className="px-3.5 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-800/60 text-red-300 text-xs font-black transition-all active:scale-95 uppercase tracking-wider flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>CLEAR APP DATA</span>
          </button>
        )}
      </div>
    </div>
  );
};
