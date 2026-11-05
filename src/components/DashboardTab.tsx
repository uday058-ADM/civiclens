'use client';

import React from 'react';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Layers,
  Sparkles,
  BarChart2,
  PieChart,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { HazardReport } from '@/types';

interface DashboardTabProps {
  hazards: HazardReport[];
  onSelectHazard?: (hazard: HazardReport) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  hazards,
  onSelectHazard,
}) => {
  const totalHazards = hazards.length + 143;
  const criticalOpen = hazards.filter((h) => h.severity === 'Critical' && h.status !== 'Fixed').length + 11;
  const fixedThisWeek = 48;
  const avgRepairTime = '4.2 hrs';
  const duplicatesMerged = hazards.reduce((sum, h) => sum + (h.duplicate_count - 1), 0) + 58;

  const wardDensity = [
    { ward: 'Gajuwaka Heavy Corridor', count: 38, critical: 12 },
    { ward: 'Dwaraka Nagar RTC Hub', count: 31, critical: 8 },
    { ward: 'MVP Colony Sectors', count: 28, critical: 6 },
    { ward: 'Siripuram Circle', count: 19, critical: 4 },
    { ward: 'Madhurawada IT SEZ', count: 14, critical: 2 },
  ];

  const trendDays = [
    { day: 'Thu', reports: 18, fixed: 12 },
    { day: 'Fri', reports: 24, fixed: 16 },
    { day: 'Sat', reports: 32, fixed: 20 },
    { day: 'Sun', reports: 28, fixed: 14 },
    { day: 'Mon', reports: 36, fixed: 24 },
    { day: 'Tue', reports: 42, fixed: 30 },
    { day: 'Today', reports: 38, fixed: 28 },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-20 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0B1528] text-white p-5 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold font-headline text-amber-400">
              Municipal Road Health Analytics
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Sample / Projected Data
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time urban infrastructure monitoring • Greater Visakhapatnam Municipal Corporation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-300">
            Telemetry Synced (100% Wards)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-[#0B1528] p-4 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Hazards</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-headline">
              {totalHazards}
            </span>
            <span className="text-[11px] font-bold text-emerald-400 flex items-center">
              +14% <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Logged across all 7 zones</span>
        </div>

        <div className="bg-[#0B1528] p-4 rounded-2xl border border-red-900/40 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-red-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Critical Open</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-red-400 font-headline">
              {criticalOpen}
            </span>
            <span className="text-[10px] font-semibold text-red-400">Immediate cordon</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">&gt;8.0cm depth on bus routes</span>
        </div>

        <div className="bg-[#0B1528] p-4 rounded-2xl border border-emerald-900/40 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Fixed This Week</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-400 font-headline">
              {fixedThisWeek}
            </span>
            <span className="text-[11px] font-bold text-emerald-400">+9 vs last wk</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Resurfaced & closed</span>
        </div>

        <div className="bg-[#0B1528] p-4 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg Triage Time</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-headline">
              {avgRepairTime}
            </span>
            <span className="text-[11px] font-bold text-teal-400">-1.8h speed</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">From capture to crew</span>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-[#0B1528] p-4 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Duplicates Merged</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-purple-400 font-headline">
              {duplicatesMerged}
            </span>
            <span className="text-[10px] font-semibold text-purple-400">15m radius</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Redundant tickets saved</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4 bg-[#0B1528] p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <PieChart className="w-4 h-4 text-amber-400" />
              Risk Distribution
            </h3>
            <span className="text-[11px] text-slate-400">Current active</span>
          </div>

          <div className="flex items-center justify-center my-3 relative">
            <svg width="180" height="180" viewBox="0 0 180 180" className="transform -rotate-90">
              <circle cx="90" cy="90" r="70" stroke="#1E293B" strokeWidth="22" fill="transparent" />
              <circle cx="90" cy="90" r="70" stroke="#10b981" strokeWidth="22" strokeDasharray="440" strokeDashoffset="154" fill="transparent" />
              <circle cx="90" cy="90" r="70" stroke="#f59e0b" strokeWidth="22" strokeDasharray="440" strokeDashoffset="316" fill="transparent" />
              <circle cx="90" cy="90" r="70" stroke="#f97316" strokeWidth="22" strokeDasharray="440" strokeDashoffset="343" fill="transparent" />
              <circle cx="90" cy="90" r="70" stroke="#ef4444" strokeWidth="22" strokeDasharray="440" strokeDashoffset="374" fill="transparent" />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-extrabold text-white font-headline leading-none">
                {totalHazards}
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
                Total Sites
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
              <span className="text-slate-300">Critical (15%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500 shrink-0" />
              <span className="text-slate-300">High (22%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
              <span className="text-slate-300">Medium (28%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-slate-300">Low (35%)</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 bg-[#0B1528] p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-amber-400" />
                Hazard Density by Visakhapatnam Ward
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Vulnerability scores based on commercial heavy traffic and coastal rainfall impact
              </p>
            </div>
            <span className="text-xs font-bold text-amber-400">Top 5 Sectors</span>
          </div>

          <div className="space-y-4 my-2">
            {wardDensity.map((w) => (
              <div key={w.ward}>
                <div className="flex justify-between items-center text-xs font-semibold mb-1">
                  <span className="text-slate-200">{w.ward}</span>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-red-400 font-bold">{w.critical} Critical</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">{w.count} Total</span>
                  </div>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden flex">
                  <div className="bg-red-500 h-full" style={{ width: `${(w.critical / w.count) * 100}%` }} />
                  <div className="bg-amber-500 h-full" style={{ width: `${100 - (w.critical / w.count) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Red segment: Immediate two-wheeler hazards</span>
            <span>Amber segment: Maintenance priority</span>
          </div>
        </div>
      </div>
    </div>
  );
};
