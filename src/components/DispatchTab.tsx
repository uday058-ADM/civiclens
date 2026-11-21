'use client';

import React, { useState } from 'react';
import {
  FileText,
  Printer,
  CheckSquare,
  Square,
  Truck,
  Zap,
  CheckCircle2,
  Clock,
  MapPin,
  X,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Wrench,
  Hammer,
  Play,
  RotateCcw,
} from 'lucide-react';
import { HazardReport, HazardStatus, RouteOptimizationResponse, OptimizedWaypoint } from '@/types';
import { exportWorkOrderPDF } from '@/lib/pdfExport';

interface DispatchTabProps {
  hazards: HazardReport[];
  onSelectHazard?: (hazard: HazardReport) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onUpdateStatus?: (id: string, status: HazardStatus, note?: string) => void;
  onBatchDispatch?: (ids: string[], crew: string) => void;
  language?: 'EN' | 'TEL';
}

export const DispatchTab: React.FC<DispatchTabProps> = ({
  hazards,
  onSelectHazard,
  onShowToast,
  onUpdateStatus,
  onBatchDispatch,
  language = 'EN',
}) => {
  const isTe = language === 'TEL';
  const actionableHazards = hazards.filter((h) => h.status !== 'Fixed');

  const [selectedIds, setSelectedIds] = useState<string[]>(
    actionableHazards.slice(0, 4).map((h) => h.id)
  );
  const [selectedCrew, setSelectedCrew] = useState('Ward 18 Rapid Action Road Crew Alpha');
  const [showExecutionModal, setShowExecutionModal] = useState(false);
  const [activeWorkOrderId, setActiveWorkOrderId] = useState('GVMC-WO-2026-0842');
  const [routeOptimization, setRouteOptimization] = useState<RouteOptimizationResponse | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Per-site in-progress states inside the work order
  const [siteWorkStatus, setSiteWorkStatus] = useState<Record<string, string>>({});

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === actionableHazards.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(actionableHazards.map((h) => h.id));
    }
  };

  const selectedHazards = actionableHazards.filter((h) => selectedIds.includes(h.id));

  const totalAsphaltM3 = selectedHazards
    .reduce((sum, h) => sum + (h.estimated_asphalt_m3 || 0.6), 0)
    .toFixed(2);

  // Execute Work Order & Deploy Crew with Google Maps Routes Optimizer
  const handleExecuteDispatch = async () => {
    if (selectedHazards.length === 0) {
      onShowToast(
        isTe
          ? 'దయచేసి మరమ్మతు సిబ్బందిని మోహరించడానికి కనీసం ఒక రోడ్డు సమస్యను ఎంచుకోండి'
          : 'Please select at least one hazard site to deploy a repair crew',
        'error'
      );
      return;
    }

    const woId = `GVMC-WO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setActiveWorkOrderId(woId);
    setIsOptimizing(true);

    // Initialize per-site status to In Progress
    const initialStatus: Record<string, 'Dispatched' | 'In Progress' | 'Fixed'> = {};
    selectedIds.forEach((id) => {
      initialStatus[id] = 'Dispatched';
    });
    setSiteWorkStatus(initialStatus);

    if (onBatchDispatch) {
      onBatchDispatch(selectedIds, selectedCrew);
    }

    try {
      const res = await fetch('/api/optimize-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hazards: selectedHazards.map((h) => ({
            id: h.id,
            lat: h.coordinates.lat,
            lng: h.coordinates.lng,
            locationName: h.location,
            priorityScore: h.risk_score,
            estimated_asphalt_m3: h.estimated_asphalt_m3,
          })),
        }),
      });

      if (res.ok) {
        const routeData: RouteOptimizationResponse = await res.json();
        setRouteOptimization(routeData);
      }
    } catch (e) {
      console.warn('Google Maps Routes API request error, using standard sequence', e);
    } finally {
      setIsOptimizing(false);
    }

    setShowExecutionModal(true);
    onShowToast(
      isTe
        ? `🚀 వర్క్ ఆర్డర్ ${woId} జారీ చేయబడింది! తారు కాంపాక్షన్ సిబ్బంది మోహరించబడ్డారు.`
        : `🚀 Work Order ${woId} executed! Road crew deployed with asphalt batch.`,
      'success'
    );
  };

  const handleStartSiteWork = (id: string) => {
    setSiteWorkStatus((prev) => ({ ...prev, [id]: 'In Progress' }));
    if (onUpdateStatus) {
      onUpdateStatus(id, 'In Progress', `Excavation & tack coat initiated under Work Order ${activeWorkOrderId}`);
    }
    onShowToast(
      isTe ? `సమస్య #${id}: తారు కాంపాక్షన్ పని ప్రారంభమైంది 🚧` : `Hazard #${id} status: Compaction In Progress 🚧`,
      'info'
    );
  };

  const handleMarkSiteFixed = (id: string) => {
    setSiteWorkStatus((prev) => ({ ...prev, [id]: 'Fixed' }));
    if (onUpdateStatus) {
      onUpdateStatus(id, 'Fixed', `Asphalt compaction completed and verified under Work Order ${activeWorkOrderId}`);
      onShowToast(
        isTe ? `సమస్య #${id}: పరిష్కరించబడి ధృవీకరించబడింది! ✅` : `Hazard #${id} marked as Fixed & Verified! ✅`,
        'success'
      );
    }
  };

  const handleMarkAllFixed = () => {
    selectedIds.forEach((id) => {
      if (onUpdateStatus) {
        onUpdateStatus(id, 'Fixed', `Batch compaction completed under Work Order ${activeWorkOrderId}`);
      }
    });
    setSiteWorkStatus((prev) => {
      const next = { ...prev };
      selectedIds.forEach((id) => (next[id] = 'Fixed'));
      return next;
    });
    onShowToast(
      isTe
        ? `అన్ని ${selectedIds.length} రోడ్డు సమస్యలు పరిష్కరించబడి మూసివేయబడ్డాయి!`
        : `All ${selectedIds.length} hazards repaired, compacted & closed!`,
      'success'
    );
    setShowExecutionModal(false);
  };

  const handleExportPDF = () => {
    if (selectedHazards.length === 0) {
      onShowToast(
        isTe ? 'పీడీఎఫ్ ఎగుమతి చేయడానికి కనీసం ఒక సమస్యను ఎంచుకోండి' : 'Please select at least one hazard to export a PDF manifest',
        'error'
      );
      return;
    }
    exportWorkOrderPDF(selectedHazards, selectedCrew);
    onShowToast(
      isTe
        ? `${selectedHazards.length} స్థలాల కోసం జివిఎంసి వర్క్ ఆర్డర్ పీడీఎఫ్ డౌన్‌లోడ్ అయింది`
        : `Exported GVMC Work Order PDF for ${selectedHazards.length} sites`,
      'success'
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5 pb-20 select-none">
      {/* 1. DISPATCH CONTROLLER HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B1528] text-white p-5 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <h2 className="text-lg font-bold font-headline flex items-center gap-2 text-amber-400">
            <Truck className="w-5 h-5" />
            <span>
              {isTe
                ? 'మునిసిపల్ వర్క్ ఆర్డర్ నిర్వహణ & రోడ్డు మరమ్మతులు'
                : 'Municipal Work-Order Execution & Road Repair'}
            </span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            {isTe
              ? 'తారు కాంపాక్షన్ యూనిట్లను మోహరించండి, రోడ్డు మరమ్మతులను ట్రాక్ చేయండి మరియు జీవీఎంసీ వార్డుల్లో పనులను ధృవీకరించండి.'
              : 'Deploy asphalt compaction units, track active road repairs, and verify completion across GVMC wards.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Actionable Dispatch & Execution Button */}
          <button
            onClick={handleExecuteDispatch}
            disabled={selectedHazards.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-black transition-all shadow-md active:scale-95 disabled:opacity-40"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>
              {isTe
                ? `సిబ్బందిని మోహరించండి & ప్రారంభించండి (${selectedIds.length})`
                : `Deploy Crew & Execute (${selectedIds.length})`}
            </span>
          </button>

          {/* Secondary PDF Manifest */}
          <button
            onClick={handleExportPDF}
            disabled={selectedHazards.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-all disabled:opacity-40"
            title="Download Physical Manifest for Truck Driver"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">{isTe ? 'పీడీఎఫ్ ఎగుమతి' : 'Export PDF'}</span>
          </button>
        </div>
      </div>

      {/* 2. BATCH CONFIGURATION BAR */}
      <div className="bg-[#0B1528] p-4 rounded-2xl border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white"
          >
            {selectedIds.length === actionableHazards.length && actionableHazards.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-amber-400" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>
              {isTe
                ? `అన్నీ ఎంచుకోండి (${actionableHazards.length})`
                : `Select All (${actionableHazards.length})`}
            </span>
          </button>

          <span className="text-slate-700">|</span>

          <span className="text-xs font-semibold text-slate-300">
            {isTe ? 'ఎంచుకున్నవి: ' : 'Selected: '}
            <strong className="text-amber-400">{selectedIds.length}</strong>{' '}
            {isTe ? 'స్థలాలు' : 'Sites'}
          </span>

          <span className="text-slate-700 hidden sm:inline">|</span>

          <span className="text-xs font-semibold text-slate-300 hidden sm:inline">
            {isTe ? 'అవసరమైన తారు: ' : 'Required Asphalt: '}
            <strong className="text-red-400">{totalAsphaltM3} m³</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
            {isTe ? 'సిబ్బంది కేటాయింపు:' : 'Assign Crew:'}
          </span>
          <select
            value={selectedCrew}
            onChange={(e) => setSelectedCrew(e.target.value)}
            className="text-xs font-medium rounded-xl border border-slate-700 bg-slate-900 text-slate-100 p-2 outline-none focus:border-amber-500"
          >
            <option value="Ward 18 Rapid Action Road Crew Alpha">
              {isTe ? 'వార్డ్ 18 ర్యాపిడ్ యాక్షన్ రోడ్డు సిబ్బంది ఆల్ఫా' : 'Ward 18 Rapid Action Road Crew Alpha'}
            </option>
            <option value="Zone-V Heavy Industrial Maintenance Unit">
              {isTe ? 'జోన్-5 పారిశ్రామిక ప్రాంత నిర్వహణ విభాగం' : 'Zone-V Heavy Industrial Maintenance Unit'}
            </option>
            <option value="Ward 31 Civil Repair Unit">
              {isTe ? 'వార్డ్ 31 సివిల్ మరమ్మతు యూనిట్' : 'Ward 31 Civil Repair Unit'}
            </option>
            <option value="MVP Sector Engineering Squad">
              {isTe ? 'ఎంవీపీ సెక్టార్ ఇంజనీరింగ్ స్క్వాడ్' : 'MVP Sector Engineering Squad'}
            </option>
            <option value="Zone-IV Maintenance Team">
              {isTe ? 'జోన్-4 రోడ్డు నిర్వహణ బృందం' : 'Zone-IV Maintenance Team'}
            </option>
          </select>
        </div>
      </div>

      {/* 3. ROAD SITES DISPATCH LIST */}
      <div className="space-y-2.5">
        {actionableHazards.length === 0 ? (
          <div className="bg-[#0B1528] p-8 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <span>
              {isTe
                ? 'ఈ జోన్‌లోని అన్ని రోడ్డు సమస్యలు పరిష్కరించబడి ధృవీకరించబడ్డాయి!'
                : 'All road hazards in this zone are currently fixed and verified!'}
            </span>
          </div>
        ) : (
          actionableHazards.map((hazard) => {
            const isSelected = selectedIds.includes(hazard.id);
            const isCritical = hazard.severity === 'Critical';
            const currentSiteStatus = siteWorkStatus[hazard.id] || hazard.status;
            const isAssigned =
              currentSiteStatus === 'Assigned' ||
              currentSiteStatus === 'Dispatched' ||
              currentSiteStatus === 'In Progress';

            return (
              <div
                key={hazard.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-amber-950/20 border-amber-500/80 shadow-md'
                    : 'bg-[#0B1528] border-slate-800'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => toggleSelect(hazard.id)}
                    className="mt-1 text-slate-400 hover:text-amber-400 transition-colors"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-amber-400" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-500" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="font-mono text-xs font-bold text-amber-400">
                        #{hazard.id}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase text-white ${
                          isCritical ? 'bg-red-600' : 'bg-orange-500'
                        }`}
                      >
                        {hazard.severity} • {hazard.risk_score}
                      </span>
                      <span className="text-[11px] text-slate-400 font-semibold">
                        {hazard.ward}
                      </span>

                      {/* Real Work Status Pill */}
                      {currentSiteStatus === 'In Progress' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 border border-amber-700 text-amber-300 flex items-center gap-1 animate-pulse">
                          <Hammer className="w-3 h-3 text-amber-400" />
                          <span>{isTe ? 'మరమ్మతు పని జరుగుతోంది' : 'Compaction In Progress'}</span>
                        </span>
                      ) : isAssigned ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950/70 border border-blue-800/60 text-blue-300 flex items-center gap-1">
                          <Truck className="w-3 h-3 text-blue-400" />
                          <span>
                            {isTe ? 'మోహరించిన సిబ్బంది:' : 'Crew Deployed:'}{' '}
                            {hazard.assigned_crew || selectedCrew}
                          </span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 border border-slate-700 text-slate-400">
                          {isTe ? 'వర్క్ ఆర్డర్‌కు సిద్ధంగా ఉంది' : 'Ready for Work Order'}
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                      {hazard.location}
                    </h4>

                    <div className="text-[11px] text-slate-400 mt-0.5">
                      <strong className="text-slate-300">
                        {isTe ? 'ప్రాధాన్యత కారణం:' : 'Priority Reason:'}
                      </strong>{' '}
                      {hazard.why_ranked_here}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      {isTe ? 'తారు పరిమాణం' : 'Asphalt Volume'}
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-amber-400">
                      {(hazard.estimated_asphalt_m3 || 0.6).toFixed(2)} m³
                    </span>
                  </div>

                  {/* Meaningful Work Execution Action */}
                  {currentSiteStatus === 'In Progress' ? (
                    <button
                      onClick={() => handleMarkSiteFixed(hazard.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isTe ? 'పూర్తయింది & ధృవీకరించండి' : 'Complete & Sign Off'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartSiteWork(hazard.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all flex items-center gap-1"
                      title="Start Road Repair Work"
                    >
                      <Wrench className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isTe ? 'పని ప్రారంభించండి' : 'Start Work'}</span>
                    </button>
                  )}

                  {onSelectHazard && (
                    <button
                      onClick={() => onSelectHazard(hazard)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                      title="View Details"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. ACTIVE WORK ORDER EXECUTION & COMPACTION TRACKER */}
      {showExecutionModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-[#0F1E36] text-white rounded-3xl shadow-2xl border-2 border-amber-500 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in">
            {/* Header */}
            <div className="p-5 bg-[#0B1528] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black font-headline text-white">
                      {isTe ? `మునిసిపల్ వర్క్ ఆర్డర్: ${activeWorkOrderId}` : `Municipal Work Order: ${activeWorkOrderId}`}
                    </h3>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-950 border border-emerald-700 text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{isTe ? 'సిబ్బంది మోహరించబడ్డారు' : 'Crew Deployed'}</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {isTe
                      ? 'జీవీఎంసీ వార్డ్ ఇంజనీరింగ్ భౌతిక రోడ్డు మరమ్మతు నిర్వహణ కన్సోల్'
                      : 'GVMC Ward Engineering Physical Road Repair Execution Console'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowExecutionModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Operational Telemetry Banner */}
            <div className="p-5 grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-900/80 border-b border-slate-800 text-xs">
              <div className="p-3 rounded-xl bg-[#0B1528] border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                  {isTe ? 'కేటాయించిన సిబ్బంది' : 'Assigned Road Crew'}
                </span>
                <span className="font-bold text-amber-400 block truncate">
                  {selectedCrew}
                </span>
                <span className="text-[11px] text-slate-400">Compactor Unit AP-31-TR-9041</span>
              </div>

              <div className="p-3 rounded-xl bg-[#0B1528] border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                  {isTe ? 'ప్రయాణ మార్గం' : 'Driving Route'}
                </span>
                <span className="font-bold text-teal-400 block">
                  {routeOptimization?.totalDistanceKm
                    ? `${routeOptimization.totalDistanceKm} km Circuit`
                    : '14.2 km Circuit'}
                </span>
                <span className="text-[11px] text-slate-400">Google Routes v2 Optimized</span>
              </div>

              <div className="p-3 rounded-xl bg-[#0B1528] border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                  {isTe ? 'హాట్ మిక్స్ తారు పరిమాణం' : 'Hot Mix Asphalt Batch'}
                </span>
                <span className="font-bold text-emerald-400 text-sm block">
                  {totalAsphaltM3} m³ (Loaded @ 160°C)
                </span>
                <span className="text-[11px] text-slate-400">Depot: Asilmetta HQ</span>
              </div>

              <div className="p-3 rounded-xl bg-[#0B1528] border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                  {isTe ? 'సామగ్రి తనిఖీ జాబితా' : 'Equipment Checklist'}
                </span>
                <span className="font-bold text-blue-300 block">
                  3-Ton Roller + Tack Sprayer
                </span>
                <span className="text-[11px] text-slate-400">Barricades Deployed</span>
              </div>
            </div>

            {/* Step-by-Step Road Work Execution Checklist */}
            <div className="p-5 overflow-y-auto flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                  {isTe
                    ? `మరమ్మతు చేయవలసిన స్థలాలు (${selectedHazards.length})`
                    : `Work-Order Sites (${selectedHazards.length} Sites to Repair)`}
                </span>
                <span className="text-[11px] text-teal-400 font-bold bg-teal-950/60 border border-teal-800/60 px-2 py-0.5 rounded">
                  Depot: Asilmetta (Round-Trip)
                </span>
              </div>

              {(routeOptimization?.orderedHazards || selectedHazards).map((item: any, idx: number) => {
                const hazard = selectedHazards.find((h) => h.id === item.id) || item;
                const status = siteWorkStatus[item.id] || 'Dispatched';
                const isFixed = status === 'Fixed' || hazard.status === 'Fixed';

                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-xs">
                        {isTe ? `స్టాప్ ${idx + 1}` : `Stop ${idx + 1}`}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-amber-400 font-bold">#{item.id}</span>
                          <span className="text-slate-300 font-semibold truncate">{hazard.location}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {hazard.ward || 'Ward 18'} • {hazard.width_cm || 60} × {hazard.depth_cm || 12} cm •{' '}
                          {(hazard.estimated_asphalt_m3 || item.asphalt_m3 || 0.6).toFixed(2)} m³ asphalt
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isFixed ? (
                        <span className="px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isTe ? 'పరిష్కరించబడింది' : 'Repaired & Closed'}</span>
                        </span>
                      ) : status === 'In Progress' ? (
                        <button
                          onClick={() => handleMarkSiteFixed(item.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isTe ? 'పూర్తయింది & ఆమోదించండి' : 'Complete & Sign Off'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartSiteWork(item.id)}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                        >
                          <Hammer className="w-3.5 h-3.5" />
                          <span>{isTe ? 'కాంపాక్షన్ ప్రారంభించండి' : 'Start Compaction'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer with Batch Completion */}
            <div className="p-4 bg-[#0B1528] border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white px-3 py-2 rounded-xl border border-slate-700 bg-slate-900"
              >
                <Printer className="w-4 h-4 text-slate-400" />
                <span>{isTe ? 'పీడీఎఫ్ మానిఫెస్ట్ ఎగుమతి' : 'Export PDF Manifest'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowExecutionModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  {isTe ? 'మూసివేయండి' : 'Close Window'}
                </button>
                <button
                  onClick={handleMarkAllFixed}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-black shadow-md flex items-center gap-1.5 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isTe
                      ? `అన్ని ${selectedIds.length} సమస్యలు పూర్తయినట్లు గుర్తించండి`
                      : `Mark All ${selectedIds.length} Sites Fixed`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
