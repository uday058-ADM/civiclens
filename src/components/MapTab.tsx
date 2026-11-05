'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Activity,
  ArrowRight,
  X,
  AlertTriangle,
  Ruler,
  Users,
} from 'lucide-react';
import { HazardReport } from '@/types';

interface MapTabProps {
  hazards: HazardReport[];
  onSelectHazard: (hazard: HazardReport) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const MapTab: React.FC<MapTabProps> = ({
  hazards,
  onSelectHazard,
  onShowToast,
}) => {
  const [selectedPin, setSelectedPin] = useState<HazardReport | null>(hazards[0] || null);
  const [trafficDensityActive, setTrafficDensityActive] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedWardFilter, setSelectedWardFilter] = useState('all');

  const handleLocateMe = () => {
    onShowToast('GPS locked: 17.7211° N, 83.3155° E (Siripuram Junction)', 'success');
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 2));
    onShowToast('Zoom: Street Grid Resolution', 'info');
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
    onShowToast('Zoom: Metropolitan Zone View', 'info');
  };

  const handleReset = () => {
    setZoomLevel(1);
    setSelectedWardFilter('all');
    setSelectedPin(hazards[0] || null);
    onShowToast('Viewport reset to Central Visakhapatnam', 'info');
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4 pb-20 select-none">
      {/* Top Map Controller Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#131F37] p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Ward Quick Jump */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 hidden sm:inline">
            Ward Focus:
          </span>
          <select
            value={selectedWardFilter}
            onChange={(e) => {
              setSelectedWardFilter(e.target.value);
              const found = hazards.find((h) =>
                e.target.value === 'all' ? true : h.ward.includes(e.target.value)
              );
              if (found) setSelectedPin(found);
              onShowToast(`Map centered on: ${e.target.options[e.target.selectedIndex].text}`, 'info');
            }}
            className="text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-slate-100 outline-none"
          >
            <option value="all">All GVMC Zones (Central & South)</option>
            <option value="Ward 18">Ward 18: RK Beach & Submarine Museum</option>
            <option value="Ward 31">Ward 31: Dwaraka Nagar Complex</option>
            <option value="Ward 65">Ward 65: Gajuwaka Heavy Route</option>
            <option value="Ward 22">Ward 22: MVP Colony Sectors</option>
            <option value="Ward 19">Ward 19: Siripuram & AU Campus</option>
            <option value="Ward 44">Ward 44: Madhurawada IT SEZ</option>
            <option value="Ward 09">Ward 09: Kailasagiri Foothills</option>
          </select>
        </div>

        {/* Traffic Density Toggle (converted from heatmap, bus routes removed) */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setTrafficDensityActive(!trafficDensityActive);
              onShowToast(
                trafficDensityActive ? 'Traffic Density overlay hidden' : 'Real-time Traffic Density layer displayed',
                'info'
              );
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              trafficDensityActive
                ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Traffic Density: {trafficDensityActive ? 'ON' : 'OFF'}</span>
          </button>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

          {/* Viewport controls */}
          <button
            onClick={handleLocateMe}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-amber-500 transition-colors"
            title="Center on My Location"
          >
            <Navigation className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Map Viewport */}
      <div className="relative w-full h-[560px] sm:h-[620px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-[#0F1C31] shadow-inner">
        <div
          className="absolute inset-0 transition-transform duration-300 origin-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bayOfBengal" x1="0%" x2="100%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#0B1A30" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#003B46" stopOpacity="0.6" />
              </linearGradient>
              <pattern id="urbanGridPattern" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#2A3D5D" strokeOpacity="0.3" strokeWidth="0.8" />
              </pattern>
            </defs>

            {/* Urban Block Grids */}
            <rect x="0" y="0" width="850" height="800" fill="url(#urbanGridPattern)" />

            {/* Bay of Bengal Seaboard */}
            <path
              d="M 850 0 C 820 180 870 320 940 450 C 990 560 970 700 990 800 L 1200 800 L 1200 0 Z"
              fill="url(#bayOfBengal)"
            />
            <path
              d="M 850 0 C 820 180 870 320 940 450 C 990 560 970 700 990 800"
              fill="none"
              stroke="#00A896"
              strokeDasharray="8 4"
              strokeOpacity="0.8"
              strokeWidth="2.5"
            />

            {/* Traffic Density Overlays (High Congestion = Red / Amber Glow along Corridors) */}
            {trafficDensityActive && (
              <g>
                {/* NH16 Industrial Heavy Congestion */}
                <path d="M 120 780 L 380 520 L 610 320" fill="none" stroke="#EF4444" strokeWidth="12" strokeOpacity="0.45" filter="blur(4px)" />
                <path d="M 120 780 L 380 520 L 610 320" fill="none" stroke="#EF4444" strokeWidth="4" />

                {/* RK Beach Road Moderate Congestion */}
                <path d="M 825 0 C 795 190 845 330 920 460" fill="none" stroke="#F59E0B" strokeWidth="10" strokeOpacity="0.45" filter="blur(4px)" />
                <path d="M 825 0 C 795 190 845 330 920 460" fill="none" stroke="#F59E0B" strokeWidth="3.5" />

                {/* Dwaraka Nagar RTC Commercial Dense Area */}
                <circle cx="480" cy="380" r="60" fill="#EF4444" fillOpacity="0.25" filter="blur(16px)" />
                {/* Siripuram Circle Moderate Flow */}
                <circle cx="650" cy="310" r="45" fill="#10B981" fillOpacity="0.25" filter="blur(14px)" />
              </g>
            )}

            {/* Road Networks */}
            <path d="M 520 220 L 780 340 L 920 370" fill="none" stroke="#475569" strokeWidth="4" />
            <path d="M 640 180 L 880 260" fill="none" stroke="#475569" strokeWidth="3" />

            {/* Landmark text labels */}
            <text x="890" y="440" fill="#38BDF8" fontSize="13" fontWeight="bold" fontFamily="sans-serif">
              RK Beach Road (INS Kursura)
            </text>
            <text x="680" y="240" fill="#E2E8F0" fontSize="13" fontWeight="bold" fontFamily="sans-serif">
              MVP Colony
            </text>
            <text x="440" y="360" fill="#E2E8F0" fontSize="13" fontWeight="bold" fontFamily="sans-serif">
              Dwaraka Nagar RTC
            </text>
            <text x="210" y="600" fill="#E2E8F0" fontSize="13" fontWeight="bold" fontFamily="sans-serif">
              Gajuwaka Industrial Hub
            </text>
            <text x="980" y="620" fill="#00A896" fontSize="16" fontWeight="bold" fontFamily="sans-serif" letterSpacing="4">
              BAY OF BENGAL
            </text>
          </svg>

          {/* CLUSTERS */}
          <div
            className="absolute left-[38%] top-[48%] -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 hover:scale-110 transition-transform"
            onClick={() => onShowToast('Cluster: Dwaraka Nagar Bus Complex (18 incidents queued)', 'info')}
          >
            <div className="relative flex items-center justify-center">
              <span className="absolute -inset-2 rounded-full bg-amber-400 opacity-40 animate-ping" />
              <div className="w-12 h-12 rounded-full bg-[#0B2545] text-white flex flex-col items-center justify-center shadow-xl border-2 border-amber-400">
                <span className="text-sm font-extrabold text-amber-300 leading-none">18</span>
                <span className="text-[8px] uppercase tracking-tighter text-slate-300">Dwaraka</span>
              </div>
            </div>
          </div>

          <div
            className="absolute left-[20%] top-[72%] -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 hover:scale-110 transition-transform"
            onClick={() => onShowToast('Cluster: Gajuwaka Industrial Corridor (12 incidents)', 'info')}
          >
            <div className="w-11 h-11 rounded-full bg-slate-900 text-white flex flex-col items-center justify-center shadow-xl border-2 border-red-500">
              <span className="text-xs font-extrabold text-red-400 leading-none">12</span>
              <span className="text-[8px] uppercase tracking-tighter text-slate-300">Gajuwaka</span>
            </div>
          </div>

          <div
            className="absolute left-[66%] top-[28%] -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 hover:scale-110 transition-transform"
            onClick={() => onShowToast('Cluster: MVP Colony Sectors (7 incidents)', 'info')}
          >
            <div className="w-10 h-10 rounded-full bg-[#006B5F] text-white flex flex-col items-center justify-center shadow-lg border-2 border-teal-200">
              <span className="text-xs font-bold leading-none">7</span>
              <span className="text-[8px] uppercase tracking-tighter">MVP</span>
            </div>
          </div>

          {/* INDIVIDUAL HAZARD PINS */}
          {hazards.map((h, i) => {
            let leftPct = 50;
            let topPct = 50;

            if (h.id === 'VH-4092') { leftPct = 76; topPct = 47; }
            else if (h.id === 'VH-4105') { leftPct = 26; topPct = 68; }
            else if (h.id === 'VH-3901') { leftPct = 44; topPct = 44; }
            else if (h.id === 'VH-4188') { leftPct = 68; topPct = 32; }
            else if (h.id === 'VH-3802') { leftPct = 54; topPct = 39; }
            else if (h.id === 'VH-3620') { leftPct = 71; topPct = 18; }
            else if (h.id === 'VH-4211') { leftPct = 60; topPct = 12; }
            else if (h.id === 'VH-3940') { leftPct = 16; topPct = 78; }
            else { leftPct = 48 + (i * 4) % 30; topPct = 30 + (i * 6) % 40; }

            const isSelected = selectedPin?.id === h.id;
            const isCritical = h.severity === 'Critical';
            const isHigh = h.severity === 'High';
            const isMedium = h.severity === 'Medium';

            const pinColor = isCritical
              ? 'bg-red-600 text-white'
              : isHigh
              ? 'bg-orange-600 text-white'
              : isMedium
              ? 'bg-amber-500 text-white'
              : 'bg-emerald-600 text-white';

            return (
              <div
                key={h.id}
                onClick={() => setSelectedPin(h)}
                className="absolute z-20 cursor-pointer -translate-x-1/2 -translate-y-1/2 transition-transform duration-200"
                style={{ left: `${leftPct}%`, top: `${topPct}%` }}
              >
                <div className="relative flex items-center justify-center group">
                  {isCritical && (
                    <span className="w-10 h-10 rounded-full bg-red-500/30 animate-ping absolute" />
                  )}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xl border-2 border-white transition-all ${
                      isSelected ? 'scale-125 ring-4 ring-amber-400' : 'group-hover:scale-115'
                    } ${pinColor}`}
                  >
                    <span>{h.risk_score}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 z-30 bg-[#0B1528]/95 backdrop-blur-md p-3 rounded-xl border border-slate-700 shadow-xl text-xs text-white max-w-[210px]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-[11px] uppercase tracking-wider text-amber-400">
              Risk Legend
            </span>
            <span className="text-[10px] text-slate-400">GVMC v2.4</span>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px] font-medium text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0" />
              <span>Critical (&gt;85)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-600 shrink-0" />
              <span>High (70-84)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              <span>Medium (45-69)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
              <span>Low (&lt;45)</span>
            </div>
          </div>
          {trafficDensityActive && (
            <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-amber-300 flex items-center gap-1">
              <Activity className="w-3 h-3" />
              <span>Red routes: High traffic density</span>
            </div>
          )}
        </div>

        {/* Bottom-Sheet Preview Drawer */}
        {selectedPin && (
          <div className="absolute bottom-3 right-3 left-3 sm:left-auto sm:w-96 z-30 bg-[#0B1528] text-white rounded-2xl border border-slate-700 shadow-2xl p-4 animate-slide-down">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase text-white ${
                    selectedPin.severity === 'Critical'
                      ? 'bg-red-600'
                      : selectedPin.severity === 'High'
                      ? 'bg-orange-600'
                      : 'bg-amber-500'
                  }`}
                >
                  {selectedPin.severity} • Score {selectedPin.risk_score}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {selectedPin.duplicate_count} reports merged
                </span>
              </div>
              <button
                onClick={() => setSelectedPin(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-3 mb-3">
              <img
                src={selectedPin.images[0] || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'}
                alt={selectedPin.title}
                className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-700"
              />
              <div className="flex flex-col justify-between min-w-0">
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    #{selectedPin.id}
                  </span>
                  <h4 className="font-bold text-xs sm:text-sm text-white truncate">
                    {selectedPin.location}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {selectedPin.ward}
                  </p>
                </div>

                <div className="text-[11px] font-semibold text-slate-300">
                  {selectedPin.width_cm}cm W × <span className="text-red-400 font-bold">{selectedPin.depth_cm}cm D</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectHazard(selectedPin)}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
            >
              <span>View Full Inspection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
