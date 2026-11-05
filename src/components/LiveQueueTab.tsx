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
import { HazardReport } from '@/types';

export interface LiveQueueTabProps {
  hazards?: HazardReport[];
  onSelectHazard?: (hazard: any) => void;
  onRefresh?: () => void;
  onShowToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const LiveQueueTab: React.FC<LiveQueueTabProps> = ({
  hazards: parentHazards,
  onSelectHazard,
  onRefresh,
  onShowToast,
}) => {
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

    const matchesWard = selectedWard === 'All' || ward.toLowerCase().includes(selectedWard.toLowerCase());
    const matchesSeverity = selectedSeverity === 'All' || severity === selectedSeverity;
    const matchesSearch =
      address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      defect.toLowerCase().includes(searchQuery.toLowerCase());

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
              Live Cluster Feed & Triage
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time PostGIS proximity deduplication & dynamic risk escalation queue.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
            Synced: {lastUpdated}
          </span>
          <button
            onClick={fetchLiveQueue}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500 text-slate-300 hover:text-amber-400 transition-colors"
            title="Refresh Feed"
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
            placeholder="Search location, ward, ID..."
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
          <option value="All">All Wards (GVMC Mesh)</option>
          <option value="Ward 18">Ward 18 (RK Beach & Pandurangapuram)</option>
          <option value="Ward 31">Ward 31 (Dwaraka Nagar Commercial)</option>
          <option value="Ward 22">Ward 22 (MVP Colony Sectors 1-9)</option>
          <option value="Ward 65">Ward 65 (Gajuwaka Industrial Hub)</option>
        </select>

        <select
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value)}
          className="bg-[#0B1528] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-amber-500"
        >
          <option value="All">All Severities</option>
          <option value="Critical">Critical (Risk &gt; 85)</option>
          <option value="High">High (Risk 70-85)</option>
          <option value="Medium">Medium (Risk 45-70)</option>
          <option value="Low">Low (Risk &lt; 45)</option>
        </select>
      </div>

      {/* 3. Incident List Feed */}
      {filteredHazards.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#0B1528] border border-slate-800 text-center text-slate-500 text-xs">
          No hazards matching current filters.
        </div>
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence>
            {filteredHazards.map((hazard) => {
              const address = hazard.location || hazard.address || '';
              const severity = hazard.severity || hazard.severity_level || 'High';
              const riskScore = hazard.risk_score || hazard.composite_risk || hazard.base_risk_score || 75;
              const reportsCount = hazard.duplicate_count || hazard.reports_count || 1;
              const photo =
                hazard.photo_url ||
                (hazard.photos && hazard.photos[0]) ||
                (hazard.images && hazard.images[0]);

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
                        {severity}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">{hazard.ward}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-teal-400 bg-teal-950/60 border border-teal-800/60 px-2 py-0.5 rounded">
                        <Users className="w-3 h-3" />
                        <span>{reportsCount} Reports</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">
                          Risk
                        </span>
                        <span className="text-sm font-black text-amber-400 font-mono">
                          {riskScore}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {photo ? (
                      <img
                        src={photo}
                        alt="Hazard Thumbnail"
                        className="w-14 h-14 rounded-xl object-cover border border-slate-800 shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-600 shrink-0">
                        <Layers className="w-6 h-6" />
                      </div>
                    )}

                    <div className="space-y-1 min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate group-hover:text-amber-400 transition-colors">
                        {address}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                        <span>W: {hazard.width_cm || 50}cm</span>
                        <span>•</span>
                        <span>D: {hazard.depth_cm || 8}cm</span>
                        <span>•</span>
                        <span className="capitalize">{hazard.defect_type || 'Pothole'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                    <p className="text-slate-400 italic truncate max-w-[70%]">
                      "{hazard.why_ranked_here || 'Hazard on active commuter corridor'}"
                    </p>
                    <span className="text-teal-400 font-semibold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {hazard.status || 'Reported'}
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
