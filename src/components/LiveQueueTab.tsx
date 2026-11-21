'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Clock,
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Layers,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { HazardReport, UserRole } from '@/types';
import { TranslationKey, translations } from '@/lib/i18n';

const sampleClusterPhotoById: Record<string, string> = {
  'VH-4092': '/cluster-pothole-1.jpg',
  'VH-4105': '/cluster-pothole-2.jpg',
  'VH-3901': '/cluster-pothole-3.jpg',
  'VH-4188': '/cluster-pothole-4.jpg',
  'VH-3802': '/cluster-pothole-5.jpg',
};

const sampleClusterLocationKeyById: Record<string, TranslationKey> = {
  'VH-4092': 'CLUSTER_LOCATION_4092',
  'VH-4105': 'CLUSTER_LOCATION_4105',
  'VH-3901': 'CLUSTER_LOCATION_3901',
  'VH-4188': 'CLUSTER_LOCATION_4188',
  'VH-3802': 'CLUSTER_LOCATION_3802',
};

export interface LiveQueueTabProps {
  hazards?: HazardReport[];
  language?: 'EN' | 'TEL';
  onSelectHazard?: (hazard: any) => void;
  onRefresh?: () => void;
  onShowToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  role?: UserRole;
}

export const LiveQueueTab: React.FC<LiveQueueTabProps> = ({
  hazards: parentHazards,
  language = 'EN',
  onSelectHazard,
  onRefresh,
  onShowToast,
}) => {
  const t = translations[language];
  const [dbHazards, setDbHazards] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedWard, setSelectedWard] = useState<string>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string>('Just now');

  // Fetch hazards sorted by composite risk
  const fetchLiveQueue = async () => {
    setLoading(true);
    try {
      if (onRefresh) onRefresh();
      const { data, error } = await supabase
        .from('hazards')
        .select('*')
        .neq('status', 'Fixed')
        .order('composite_risk', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        setDbHazards(data);
      }
      setLastUpdated(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    } catch (err) {
      console.warn('Queue using memory state or offline cache:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveQueue();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('hazards-queue-feed')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hazards' },
        (payload) => {
          console.log('Realtime DB update received:', payload);
          fetchLiveQueue();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Use parent hazards if available, otherwise dbHazards
  const rawList = parentHazards && parentHazards.length > 0 ? parentHazards : dbHazards;

  // Filter pipeline
  const filteredHazards = rawList.filter((h) => {
    const address = h.location || h.address || '';
    const ward = h.ward || '';
    const severity = h.severity || h.severity_level || 'High';
    const defect = h.defect_type || 'Pothole';
    const locationKey = sampleClusterLocationKeyById[String(h.id)];
    const searchableAddress = language === 'TEL' && locationKey ? t[locationKey] : address;
    const searchableDefect = defect === 'Pothole'
      ? t.DEFECT_POTHOLE
      : defect === 'Pavement Fracture'
        ? t.DEFECT_PAVEMENT_FRACTURE
        : defect === 'Sunken Manhole'
          ? t.DEFECT_SUNKEN_MANHOLE
          : defect;

    const matchesWard = selectedWard === 'All' || ward.toLowerCase().includes(selectedWard.toLowerCase());
    const matchesSeverity = selectedSeverity === 'All' || severity === selectedSeverity;
    const matchesSearch =
      searchableAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      searchableDefect.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesWard && matchesSeverity && matchesSearch;
  });

  const getSeverityBadge = (level: string) => {
    switch (level) {
      case 'Critical':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'High':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Medium':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4 pb-24 text-slate-100 select-none">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0B1528] p-4 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
            <h2 className="text-base sm:text-lg font-black text-amber-400 font-headline uppercase tracking-wide">
              {t.LIVE_CLUSTER_FEED}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.LIVE_CLUSTER_DESC}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
            {t.SYNCED}: {lastUpdated === 'Just now' ? t.JUST_NOW : lastUpdated}
          </span>
          <button
            onClick={fetchLiveQueue}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500 text-slate-300 hover:text-amber-400 transition-colors"
            title={t.REFRESH_FEED}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Search & Ward Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <div className="relative sm:col-span-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder={t.SEARCH_LOCATION}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0B1528] border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-200 outline-none focus:border-amber-500"
          />
        </div>

        <select
          value={selectedWard}
          onChange={(e) => setSelectedWard(e.target.value)}
          className="bg-[#0B1528] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-amber-500"
        >
          <option value="All">{t.ALL_WARDS}</option>
          <option value="Ward 18">{t.WARD_18}</option>
          <option value="Ward 31">{t.WARD_31}</option>
          <option value="Ward 22">{t.WARD_22}</option>
          <option value="Ward 65">{t.WARD_65}</option>
        </select>

        <select
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value)}
          className="bg-[#0B1528] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-amber-500"
        >
          <option value="All">{t.ALL_SEVERITIES}</option>
          <option value="Critical">{t.CRITICAL_FILTER}</option>
          <option value="High">{t.HIGH_FILTER}</option>
          <option value="Medium">{t.MEDIUM_FILTER}</option>
          <option value="Low">{t.LOW_FILTER}</option>
        </select>
      </div>

      {/* 3. Incident List Feed */}
      {filteredHazards.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#0B1528] border border-slate-800 text-center text-slate-500 text-xs">
          {t.NO_MATCHING_HAZARDS}
        </div>
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence>
            {filteredHazards.map((hazard) => {
              const address = hazard.location || hazard.address || '';
              const severity = hazard.severity || hazard.severity_level || 'High';
              const riskScore = hazard.risk_score || hazard.composite_risk || hazard.base_risk_score || 75;
              const reportsCount = hazard.duplicate_count || hazard.reports_count || 1;
              const photo = sampleClusterPhotoById[String(hazard.id)] ||
                hazard.photo_url ||
                (hazard.photos && hazard.photos[0]) ||
                (hazard.images && hazard.images[0]);
              const locationKey = sampleClusterLocationKeyById[String(hazard.id)];
              const translatedAddress = language === 'TEL' && locationKey ? t[locationKey] : address;
              const translatedSeverity = severity === 'Critical'
                ? t.SEVERITY_CRITICAL
                : severity === 'High'
                  ? t.SEVERITY_HIGH
                  : severity === 'Medium'
                    ? t.SEVERITY_MEDIUM
                    : t.SEVERITY_LOW;
              const wardNumber = Number(String(hazard.ward || '').match(/\d+/)?.[0]);
              const translatedWard = wardNumber === 18 ? t.WARD_18
                : wardNumber === 31 ? t.WARD_31
                  : wardNumber === 22 ? t.WARD_22
                    : wardNumber === 65 ? t.WARD_65
                      : wardNumber === 19 ? t.WARD_19
                      : hazard.ward;
              const translatedDefect = hazard.defect_type === 'Pothole'
                ? t.DEFECT_POTHOLE
                : hazard.defect_type === 'Pavement Fracture'
                  ? t.DEFECT_PAVEMENT_FRACTURE
                  : hazard.defect_type === 'Sunken Manhole'
                    ? t.DEFECT_SUNKEN_MANHOLE
                    : hazard.defect_type || t.DEFECT_POTHOLE;
              const translatedStatus = hazard.status === 'In Progress'
                ? t.STATUS_IN_PROGRESS
                : hazard.status === 'Verified'
                  ? t.STATUS_VERIFIED
                  : hazard.status === 'Assigned'
                    ? t.STATUS_ASSIGNED
                    : hazard.status === 'Fixed'
                      ? t.STATUS_FIXED
                      : t.STATUS_REPORTED;
              const trafficLevel = String(hazard.traffic_level || 'High').toUpperCase();
              const trafficKey = trafficLevel === 'EXTREME'
                ? 'TRAFFIC_EXTREME'
                : trafficLevel === 'MODERATE'
                  ? 'TRAFFIC_MODERATE'
                  : trafficLevel === 'LOW'
                    ? 'TRAFFIC_LOW'
                    : 'TRAFFIC_HIGH';
              const translatedReason = `${hazard.depth_cm || 8} cm ${t.JUSTIFICATION_DEPTH} + ${t[trafficKey]} + ${reportsCount} ${t.CITIZEN_REPORTS}`;

              return (
                <motion.div
                  key={hazard.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => onSelectHazard && onSelectHazard(hazard)}
                  className="p-4 rounded-xl bg-[#0B1528] border border-slate-800 hover:border-amber-500/60 transition-all cursor-pointer space-y-2.5 shadow-sm group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400">
                        #{hazard.id}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${getSeverityBadge(
                          severity
                        )}`}
                      >
                        {translatedSeverity}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">{translatedWard}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-teal-400 bg-teal-950/60 border border-teal-800/60 px-2 py-0.5 rounded">
                        <Users className="w-3 h-3" />
                        <span>{reportsCount} {t.REPORTS}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">
                          {t.RISK}
                        </span>
                        <span className={`text-sm font-black font-mono ${severity === 'Critical' ? 'text-red-500' :
                            severity === 'High' ? 'text-orange-500' :
                              'text-amber-400'
                          }`}>
                          {riskScore}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {photo ? (
                      <img
                        src={photo}
                        alt={t.DEFECT_POTHOLE}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-800 shrink-0"
                        onError={(event) => {
                          event.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-600 shrink-0">
                        <Layers className="w-6 h-6" />
                      </div>
                    )}

                    <div className="space-y-1 min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate group-hover:text-amber-400 transition-colors">
                        {translatedAddress}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                        <span>{t.WIDTH}: {hazard.width_cm || 50}cm</span>
                        <span>•</span>
                        <span>{t.DEPTH}: {hazard.depth_cm || 8}cm</span>
                        <span>•</span>
                        <span className="capitalize">{translatedDefect}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                    <p className="text-slate-400 italic truncate max-w-[70%]">
                      "{language === 'TEL' ? translatedReason : hazard.why_ranked_here || 'Hazard on active commuter corridor'}"
                    </p>
                    <span className="text-teal-400 font-semibold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {translatedStatus}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default LiveQueueTab;
