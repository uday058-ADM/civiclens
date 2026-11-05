'use client';

import React from 'react';
import {
  Camera,
  ListOrdered,
  MapPin,
  Gift,
  Truck,
  BarChart3,
  Coins,
  ShieldCheck,
  Building2,
  Flag,
} from 'lucide-react';
import { TabKey } from './BottomNav';

interface SidebarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  queueCount?: number;
  userCoins?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  queueCount = 9,
  userCoins = 840,
}) => {
  const navItems = [
    { key: 'upload' as TabKey, label: 'Report Hazard', icon: Camera, badge: '+50 Coins', badgeColor: 'bg-amber-500 text-slate-950 font-black' },
    { key: 'queue' as TabKey, label: 'Cluster Feed', icon: ListOrdered, badge: queueCount, badgeColor: 'bg-red-500 text-white' },
    { key: 'rewards' as TabKey, label: 'Rewards & Coupons', icon: Gift, badge: `${userCoins} PTS`, badgeColor: 'bg-emerald-600 text-white' },
    { key: 'map' as TabKey, label: 'Vizag Traffic Map', icon: MapPin },
    { key: 'dispatch' as TabKey, label: 'Dispatch Orders', icon: Truck },
    { key: 'about' as TabKey, label: 'About & Stats', icon: BarChart3 },
  ];

  return (
    <aside className="hidden lg:flex fixed left-0 top-16 bottom-0 w-72 bg-[#0B1528] text-white border-r border-slate-800 z-30 flex-col justify-between py-5 px-4 shadow-xl select-none">
      <div className="flex flex-col gap-5">
        {/* Node Active Status matching screenshot */}
        <div className="flex items-center justify-between px-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
              Vizag Mesh Live
            </span>
          </div>
          <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-md">
            Zone 4
          </span>
        </div>

        {/* Navigation List */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;

            return (
              <button
                key={item.key}
                onClick={() => onTabChange(item.key)}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all group ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* CivicLens Platform Footer Block */}
      <div className="pt-4 border-t border-slate-800 flex flex-col gap-2.5">
        <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs">
              CL
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-amber-400">CivicLens GVMC</span>
              <span className="text-[10px] text-slate-400">Visakhapatnam, AP</span>
            </div>
          </div>
          <Flag className="w-4 h-4 text-amber-400" />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span>GVMC Smart City Triage</span>
          <span className="text-teal-400 font-bold">96.4% Acc</span>
        </div>
      </div>
    </aside>
  );
};
