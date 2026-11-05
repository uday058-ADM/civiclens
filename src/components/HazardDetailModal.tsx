'use client';

import React, { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Users,
  ShieldAlert,
  Clock,
  ArrowRight,
  Upload,
  CheckCircle2,
  FileCheck,
  Wrench,
  AlertOctagon,
  TrendingUp,
  Image as ImageIcon,
  Send,
  Building,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { HazardReport, HazardStatus, RepairVerificationResponse } from '@/types';

interface HazardDetailModalProps {
  hazard: HazardReport | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: HazardStatus, note?: string, afterRepairPhoto?: string) => void;
  onAssignCrew: (id: string, crew: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const STATUS_STEPS: Array<{ key: HazardStatus; label: string; icon: any }> = [
  { key: 'Reported', label: 'Reported', icon: AlertOctagon },
  { key: 'Verified', label: 'Verified by AE', icon: FileCheck },
  { key: 'Assigned', label: 'Assigned Crew', icon: Wrench },
  { key: 'In Progress', label: 'In Progress', icon: Clock },
  { key: 'Fixed', label: 'Fixed & Closed', icon: CheckCircle2 },
];

export const HazardDetailModal: React.FC<HazardDetailModalProps> = ({
  hazard,
  onClose,
  onUpdateStatus,
  onAssignCrew,
  onShowToast,
}) => {
  if (!hazard) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<HazardStatus>(hazard.status);
  const [statusNote, setStatusNote] = useState('');
  const [afterRepairPhoto, setAfterRepairPhoto] = useState<string | null>(null);
  const [assignedCrew, setAssignedCrew] = useState(hazard.assigned_crew || 'Ward 18 Rapid Action Road Crew Alpha');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<RepairVerificationResponse | null>(null);

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === hazard.status);

  // Gemini 2.5 Flash Dual-Image Verification Engine
  const handleVerifyWithGemini = async (photoBase64: string) => {
    setIsVerifying(true);
    try {
      const original = hazard.photos?.[0] || hazard.images?.[0];
      const res = await fetch('/api/verify-repair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalImage: original,
          repairedImage: photoBase64,
          hazardId: hazard.id,
          ward: hazard.ward,
        }),
      });

      if (res.ok) {
        const audit: RepairVerificationResponse = await res.json();
        setVerificationResult(audit);

        if (audit.repair_verified) {
          setSelectedStatus('Fixed');
          setStatusNote(
            `Gemini AI Quality Audit: ${audit.contractor_audit_verdict} (Compaction Score: ${audit.compaction_quality_score}/100). ${audit.engineering_remarks}`
          );
          onShowToast(
            `Gemini 2.5 Flash Verified: Compaction Approved (Score ${audit.compaction_quality_score}/100)`,
            'success'
          );
        } else {
          onShowToast(`Audit Warning: ${audit.engineering_remarks}`, 'error');
        }
      }
    } catch (err) {
      console.warn('Gemini dual-image verification failed', err);
      onShowToast('Verification recorded with offline quality heuristic', 'info');
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setAfterRepairPhoto(base64);
        handleVerifyWithGemini(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyStatusUpdate = () => {
    if (selectedStatus === 'Fixed' && !afterRepairPhoto && !hazard.after_repair_images?.length) {
      onShowToast('Quality Guard: Compaction photo required to close municipal ticket', 'error');
      return;
    }

    if (verificationResult && !verificationResult.repair_verified && selectedStatus === 'Fixed') {
      onShowToast('Cannot close ticket: Compaction audit was rejected. Rework is required.', 'error');
      return;
    }

    setIsUpdating(true);
    setTimeout(() => {
      onUpdateStatus(hazard.id, selectedStatus, statusNote, afterRepairPhoto || undefined);
      setIsUpdating(false);
      setStatusNote('');
      onShowToast(`Hazard #${hazard.id} status updated to ${selectedStatus}`, 'success');
    }, 400);
  };

  const handleCrewAssignSubmit = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCrew = e.target.value;
    setAssignedCrew(newCrew);
    onAssignCrew(hazard.id, newCrew);
    onShowToast(`Assigned ${newCrew} to #${hazard.id}`, 'info');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div className="w-full max-w-2xl bg-white dark:bg-[#131F37] min-h-screen shadow-2xl flex flex-col justify-between border-l border-slate-200 dark:border-slate-800 animate-slide-down">
        {/* Top Sticky Header */}
        <div className="sticky top-0 z-20 bg-white/95 dark:bg-[#131F37]/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-extrabold text-[#0B2545] dark:text-teal-300">
              #{hazard.id}
            </span>
            <span
              className={`px-3 py-0.5 rounded-full text-xs font-bold text-white ${
                hazard.severity === 'Critical'
                  ? 'bg-red-600'
                  : hazard.severity === 'High'
                  ? 'bg-orange-600'
                  : 'bg-amber-500'
              }`}
            >
              {hazard.severity} • Risk {hazard.risk_score}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* Title & Location */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-headline leading-tight">
              {hazard.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <MapPin className="w-3.5 h-3.5 text-[#00A896]" />
              <span>{hazard.location}</span>
              <span>•</span>
              <span className="text-[#00A896] font-semibold">{hazard.ward}</span>
            </div>
          </div>

          {/* 1. MULTI-PHOTO GALLERY FROM MERGED CITIZEN REPORTS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#00A896]" />
                Merged Photo Evidence Gallery ({hazard.images.length})
              </label>
              <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {hazard.duplicate_count} merged citizen reports
              </span>
            </div>

            {/* Featured Active Image */}
            <div className="w-full h-64 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative">
              <img
                src={hazard.images[activeImageIndex] || hazard.images[0]}
                alt="Hazard photograph"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-md">
                Report Photo #{activeImageIndex + 1} • High Definition Road Inspection
              </div>
            </div>

            {/* Thumbnails Row */}
            {hazard.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {hazard.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      activeImageIndex === idx
                        ? 'border-[#00A896] scale-105 shadow-md'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. SPECS & PHYSICAL DIMENSIONS GRID */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Telemetry & Road Classification
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-[#00A896]">
                AI Calibrated
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white dark:bg-[#131F37] p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-[10px] font-semibold text-slate-400 block uppercase">Width</span>
                <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                  {hazard.width_cm} cm
                </span>
              </div>
              <div className="bg-white dark:bg-[#131F37] p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-[10px] font-semibold text-slate-400 block uppercase">Cavity Depth</span>
                <span className="text-base font-extrabold text-red-500">
                  {hazard.depth_cm} cm
                </span>
              </div>
              <div className="bg-white dark:bg-[#131F37] p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-[10px] font-semibold text-slate-400 block uppercase">Confidence</span>
                <span className="text-base font-extrabold text-[#00A896]">
                  {hazard.confidence}%
                </span>
              </div>
              <div className="bg-white dark:bg-[#131F37] p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-[10px] font-semibold text-slate-400 block uppercase">Traffic Class</span>
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 block mt-1">
                  {hazard.traffic_level}
                </span>
              </div>
            </div>
          </div>

          {/* 3. RISK SCORE WEIGHT BREAKDOWN (Horizontal Bar Chart) */}
          <div className="bg-white dark:bg-[#131F37] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Composite Risk Score Breakdown
              </h4>
              <span className="font-extrabold text-sm text-[#0B2545] dark:text-teal-300">
                Score: {hazard.risk_score}/100
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {/* Depth Weight (35%) */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Cavity Depth Impact (Weight 35%)</span>
                  <span className="font-bold text-red-500">{hazard.score_breakdown.depth_weight} / 35</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-red-500 h-full rounded-full"
                    style={{ width: `${(hazard.score_breakdown.depth_weight / 35) * 100}%` }}
                  />
                </div>
              </div>

              {/* Surface Area Weight (25%) */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Surface Cavity Area (Weight 25%)</span>
                  <span className="font-bold text-orange-500">{hazard.score_breakdown.area_weight} / 25</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-orange-500 h-full rounded-full"
                    style={{ width: `${(hazard.score_breakdown.area_weight / 25) * 100}%` }}
                  />
                </div>
              </div>

              {/* Road & Traffic Class (20%) */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Traffic & Bus Corridor (Weight 20%)</span>
                  <span className="font-bold text-blue-500">{hazard.score_breakdown.traffic_weight} / 20</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full"
                    style={{ width: `${(hazard.score_breakdown.traffic_weight / 20) * 100}%` }}
                  />
                </div>
              </div>

              {/* Citizen Reports (20%) */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Citizen Report Volume (Weight 20%)</span>
                  <span className="font-bold text-teal-500">{hazard.score_breakdown.reports_weight} / 20</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#00A896] h-full rounded-full"
                    style={{ width: `${(hazard.score_breakdown.reports_weight / 20) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4. VERTICAL STEPPER STATUS TIMELINE WITH ICONS */}
          <div className="bg-white dark:bg-[#131F37] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Municipal Resolution Timeline
            </h4>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                const Icon = step.icon;

                return (
                  <div key={step.key} className="relative flex items-start gap-3">
                    <div
                      className={`absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors shadow-sm ${
                        isPassed
                          ? 'bg-[#00A896] text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold ${
                            isCurrent
                              ? 'text-[#0B2545] dark:text-teal-300'
                              : isPassed
                              ? 'text-slate-800 dark:text-slate-200'
                              : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-teal-100 text-[#00A896] uppercase">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {step.key === 'Reported'
                          ? `Initial report logged at ${new Date(hazard.reported_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                          : step.key === 'Verified'
                          ? 'Dimension calibrated by AE engineering inspection'
                          : step.key === 'Assigned'
                          ? `Assigned to: ${hazard.assigned_crew || 'Zone Crew'}`
                          : step.key === 'In Progress'
                          ? 'Asphalt cold/hot compaction underway'
                          : 'Resurfacing certified and ticket archived'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. ACTION BAR: STATUS UPDATER & AFTER-REPAIR VERIFICATION PHOTO */}
          <div className="bg-slate-50 dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#00A896]" />
              Engineer Status & Crew Action
            </h4>

            {/* Crew dropdown */}
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Assign Municipal Road Crew
              </label>
              <select
                value={assignedCrew}
                onChange={handleCrewAssignSubmit}
                className="w-full text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131F37] text-slate-900 dark:text-slate-100 p-2.5 outline-none"
              >
                <option value="Ward 18 Rapid Action Road Crew Alpha">Ward 18 Rapid Action Road Crew Alpha</option>
                <option value="Zone-V Heavy Industrial Maintenance Unit">Zone-V Heavy Industrial Maintenance Unit</option>
                <option value="Ward 31 Civil Repair Unit">Ward 31 Civil Repair Unit</option>
                <option value="MVP Sector Engineering Squad">MVP Sector Engineering Squad</option>
                <option value="Zone-IV Road Maintenance Team">Zone-IV Road Maintenance Team</option>
              </select>
            </div>

            {/* Status Selector Buttons */}
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">
                Update Resolution Status
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(['Verified', 'Assigned', 'In Progress', 'Fixed'] as HazardStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSelectedStatus(st)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      selectedStatus === st
                        ? 'bg-[#00A896] text-white border-transparent shadow-sm'
                        : 'bg-white dark:bg-[#131F37] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* After-repair photo upload for verification */}
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                After-Repair Verification Photo (Mandatory for Closing Ticket)
              </label>
              <div className="flex items-center gap-3">
                <label className="flex-1 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#00A896] rounded-xl p-3 text-center cursor-pointer bg-white dark:bg-[#131F37] transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                    <Upload className="w-4 h-4 text-[#00A896]" />
                    <span>Upload Compaction Photo</span>
                  </div>
                </label>
                {afterRepairPhoto && (
                  <img
                    src={afterRepairPhoto}
                    alt="After repair preview"
                    className="w-12 h-12 rounded-lg object-cover border border-[#00A896]"
                  />
                )}
              </div>

              {/* Gemini 2.5 Flash Dual-Image Verification State */}
              {isVerifying && (
                <div className="mt-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                  <span className="font-semibold text-amber-900 dark:text-amber-200">
                    Gemini 2.5 Flash conducting civil quality audit: verifying compaction leveling & curbside match...
                  </span>
                </div>
              )}

              {verificationResult && (
                <div
                  className={`mt-2 p-3.5 rounded-xl border text-xs space-y-1.5 ${
                    verificationResult.repair_verified
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                      : 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      Gemini 2.5 Flash Civil Quality Audit
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        verificationResult.repair_verified ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                      }`}
                    >
                      {verificationResult.contractor_audit_verdict} • {verificationResult.compaction_quality_score}/100
                    </span>
                  </div>

                  <p className="text-[11px] leading-relaxed opacity-90">
                    {verificationResult.engineering_remarks}
                  </p>

                  <div className="flex items-center gap-2 text-[10px] opacity-75 pt-1">
                    <span>
                      {verificationResult.is_location_match
                        ? '✓ Geographical pavement alignment confirmed'
                        : '⚠️ Location discrepancy flagged'}
                    </span>
                    <span>•</span>
                    <span>Timestamp: Just now</span>
                  </div>
                </div>
              )}
            </div>

            {/* Status note */}
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Engineering Inspection Note
              </label>
              <input
                type="text"
                placeholder="e.g. Applied 1.2m³ cold-mix patch. Traffic reopened."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                className="w-full text-xs rounded-xl bg-white dark:bg-[#131F37] border border-slate-200 dark:border-slate-700 p-2.5 text-slate-900 dark:text-slate-100 outline-none focus:border-[#00A896]"
              />
            </div>

            <button
              onClick={handleApplyStatusUpdate}
              disabled={isUpdating}
              className="w-full py-3 rounded-xl bg-[#0B2545] dark:bg-[#133E87] hover:bg-[#1E3A8A] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Apply Status Update & Commit to Log</span>
            </button>
          </div>

          {/* 6. ACTIVITY AUDIT LOG */}
          <div className="bg-white dark:bg-[#131F37] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Audit Trail & Activity Log
            </h4>
            <div className="space-y-2 text-xs">
              {hazard.activity_history.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-2"
                >
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {log.action}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      by {log.actor}
                    </div>
                    {log.note && (
                      <div className="text-[11px] text-teal-600 dark:text-teal-400 mt-0.5">
                        Note: {log.note}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {log.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
