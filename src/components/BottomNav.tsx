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
} from 'lucide-react';

export type TabKey = 'upload' | 'queue' | 'rewards' | 'map' | 'dispatch' | 'about';

interface BottomNavProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  queueCount?: number;
  userCoins?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  queueCount = 9,
  userCoins = 840,
}) => {
  const tabs = [
    { key: 'upload' as TabKey, label: 'Report', icon: Camera, highlight: true },
    { key: 'queue' as TabKey, label: 'Cluster', icon: ListOrdered, badge: queueCount },
    { key: 'rewards' as TabKey, label: 'Rewards', icon: Gift, coinBadge: `${userCoins}` },
    { key: 'map' as TabKey, label: 'Map', icon: MapPin },
    { key: 'dispatch' as TabKey, label: 'Dispatch', icon: Truck },
    { key: 'about' as TabKey, label: 'Stats', icon: BarChart3 },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0B1528]/95 backdrop-blur-xl border-t border-slate-800 z-40 px-2 flex items-center justify-around shadow-2xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;

        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex flex-col items-center justify-center flex-1 h-full relative transition-all ${
              isActive
                ? 'text-amber-400 font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.highlight ? (
              <div
                className={`w-11 h-11 -mt-5 rounded-full flex items-center justify-center shadow-xl transition-transform border-2 border-slate-900 ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 scale-110 shadow-amber-500/30'
                    : 'bg-amber-500 text-slate-950'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
            ) : (
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[10px] font-bold px-1.5 rounded-full">
                    {tab.badge}
                  </span>
                )}
                {tab.coinBadge && (
                  <span className="absolute -top-1.5 -right-3 bg-amber-500 text-slate-950 text-[9px] font-black px-1 rounded-full">
                    PTS
                  </span>
                )}
              </div>
            )}
            <span className="text-[10px] font-semibold tracking-tight mt-1">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
