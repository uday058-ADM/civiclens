'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Gift,
  Coins,
  RefreshCw,
  Info,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sliders,
  Calculator,
  Key,
  Eye,
  XCircle,
} from 'lucide-react';
import { uploadHazardImage } from '@/lib/storage';
import { GeminiAnalysisResult, HazardReport } from '@/types';
import { VisualTelemetryData } from '@/lib/gemini';

interface ReportHazardTabProps {
  onNewReportCreated?: (hazard: HazardReport, isDuplicate?: boolean, msg?: string) => void;
  onAwardCoins?: (amount: number) => void;
  onShowToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateToRewards?: () => void;
  userCoins?: number;
}

// Sample presets for testing accurate hazard detection & non-hazard rejection
const TEST_PRESETS = [
  {
    id: 'crater',
    label: 'Beach Rd Crater',
    type: 'Critical Pothole',
    color: 'border-red-500/80 bg-red-950/30 text-red-300',
    dataUrl:
      'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80#Crater_Sample',
    optical: {
      isAsphaltPavement: true,
      hasCavityDepression: true,
      cavityAreaRatio: 0.38,
      asphaltRatio: 0.85,
      meanSaturation: 0.12,
      meanLuminance: 78,
      edgeDensity: 0.32,
      opticalVerdict: 'Hazard' as const,
    },
    location: {
      address: 'RK Beach Road, opposite INS Kursura Submarine Museum',
      ward: 'Ward 18 RK Beach',
      lat: 17.7142,
      lng: 83.3328,
    },
  },
  {
    id: 'dwaraka',
    label: 'Dwaraka Nagar',
    type: 'High Cavity',
    color: 'border-amber-500/80 bg-amber-950/30 text-amber-300',
    dataUrl:
      'https://images.unsplash.com/photo-1584463699039-44081c74187e?w=800&auto=format&fit=crop&q=80#Dwaraka_Cavity_Sample',
    optical: {
      isAsphaltPavement: true,
      hasCavityDepression: true,
      cavityAreaRatio: 0.22,
      asphaltRatio: 0.82,
      meanSaturation: 0.14,
      meanLuminance: 92,
      edgeDensity: 0.25,
      opticalVerdict: 'Hazard' as const,
    },
    location: {
      address: '2nd Lane, Dwaraka Nagar, opposite RTC Complex Gate 2',
      ward: 'Ward 31 Dwaraka Nagar',
      lat: 17.7274,
      lng: 83.3082,
    },
  },
  {
    id: 'clean_highway',
    label: 'Clean Highway',
    type: 'Clean Road (Non-Hazard)',
    color: 'border-emerald-500/80 bg-emerald-950/30 text-emerald-300',
    dataUrl:
      'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=80#Clean_Highway_Sample',
    optical: {
      isAsphaltPavement: true,
      hasCavityDepression: false,
      cavityAreaRatio: 0.01,
      asphaltRatio: 0.94,
      meanSaturation: 0.10,
      meanLuminance: 120,
      edgeDensity: 0.03,
      opticalVerdict: 'CleanRoad' as const,
    },
    location: {
      address: 'NH16 Rushikonda IT SEZ Coastal Expressway',
      ward: 'Ward 4 IT Corridor',
      lat: 17.7834,
      lng: 83.3765,
    },
  },
  {
    id: 'indoor_room',
    label: 'Indoor / Document',
    type: 'Non-Road (Non-Hazard)',
    color: 'border-slate-500/80 bg-slate-800/40 text-slate-300',
    dataUrl:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80#Indoor_Room_Sample',
    optical: {
      isAsphaltPavement: false,
      hasCavityDepression: false,
      cavityAreaRatio: 0.0,
      asphaltRatio: 0.12,
      meanSaturation: 0.42,
      meanLuminance: 165,
      edgeDensity: 0.08,
      opticalVerdict: 'NonRoad' as const,
    },
    location: {
      address: 'GVMC Headquarters, Tenneti Bhavan, Asilmetta',
      ward: 'Ward 24 GVMC Central',
      lat: 17.7225,
      lng: 83.3051,
    },
  },
];

export const ReportHazardTab: React.FC<ReportHazardTabProps> = ({
  onNewReportCreated,
  onAwardCoins,
  onShowToast,
  onNavigateToRewards,
  userCoins = 840,
}) => {
  // Capture & File States
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Optical Telemetry from Canvas Scanner
  const [opticalTelemetry, setOpticalTelemetry] = useState<VisualTelemetryData | null>(null);

  // Location Telemetry
  const [gpsLocation, setGpsLocation] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
    address: string;
    ward: string;
  }>({
    lat: 17.7142,
    lng: 83.3328,
    accuracy: 3.2,
    address: 'Beach Road, opposite INS Kursura Submarine Museum',
    ward: 'Ward 18 RK Beach',
  });
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Submission & Processing States
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [aiResult, setAiResult] = useState<GeminiAnalysisResult | null>(null);
  const [dedupResult, setDedupResult] = useState<any>(null);

  // Gamified Coin Reward Modal
  const [showRewardModal, setShowRewardModal] = useState<boolean>(false);
  const [earnedCoinsAmount, setEarnedCoinsAmount] = useState<number>(50);

  // Settings: Custom Gemini API Key & Formula Breakdown Toggle
  const [customApiKey, setCustomApiKey] = useState<string>('');
  const [showKeySetting, setShowKeySetting] = useState<boolean>(false);
  const [showFormulaBreakdown, setShowFormulaBreakdown] = useState<boolean>(false);

  // Load custom Gemini API key from localStorage if saved
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('civiclens_gemini_key');
      if (savedKey) setCustomApiKey(savedKey);
    }
  }, []);

  // Fetch real-time device GPS coordinates
  useEffect(() => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsLocation((prev) => ({
            ...prev,
            lat: Number(pos.coords.latitude.toFixed(6)),
            lng: Number(pos.coords.longitude.toFixed(6)),
            accuracy: Math.round(pos.coords.accuracy),
          }));
          setIsLocating(false);
        },
        (err) => {
          console.warn('Geolocation warning, using Vizag default baseline:', err);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
    }
  }, []);

  const triggerToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (onShowToast) {
      onShowToast(msg, type);
    }
  };

  /**
   * High-Precision Client-Side HTML5 Canvas Optical Scanner Tool
   * Analyzes pixel color saturation, asphalt grayness, and dark cavity shadow depression.
   */
  const scanImageOpticalFeatures = (dataUrl: string): Promise<VisualTelemetryData> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve({ opticalVerdict: 'Hazard' });
            return;
          }

          const size = 128;
          canvas.width = size;
          canvas.height = size;
          ctx.drawImage(img, 0, 0, size, size);

          const imgData = ctx.getImageData(0, 0, size, size);
          const pixels = imgData.data;
          const totalPixels = size * size;

          let totalLuminance = 0;
          let totalSaturation = 0;
          let asphaltPixels = 0;
          let darkCavityPixels = 0;
          let edgeGradients = 0;

          // Luminance buffer for edge detection
          const lumGrid: number[] = new Array(totalPixels);

          for (let i = 0; i < totalPixels; i++) {
            const r = pixels[i * 4];
            const g = pixels[i * 4 + 1];
            const b = pixels[i * 4 + 2];

            // 1. Luminance (Rec. 601)
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            lumGrid[i] = lum;
            totalLuminance += lum;

            // 2. Color Saturation (HSV model)
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const sat = max === 0 ? 0 : (max - min) / max;
            totalSaturation += sat;

            // 3. Asphalt criteria: low saturation (< 0.22) + neutral color balance
            const isNeutralGray = Math.abs(r - g) < 28 && Math.abs(g - b) < 28;
            const isAsphaltTone = isNeutralGray && sat < 0.24 && lum > 25 && lum < 200;
            if (isAsphaltTone) {
              asphaltPixels++;
            }

            // 4. Dark cavity pocket: deep shadow within asphalt
            if (lum < 65) {
              darkCavityPixels++;
            }
          }

          // 5. Compute Sobel Edge Density to detect jagged asphalt fracture edges
          for (let y = 1; y < size - 1; y++) {
            for (let x = 1; x < size - 1; x++) {
              const idx = y * size + x;
              const gx =
                -lumGrid[idx - size - 1] +
                lumGrid[idx - size + 1] -
                2 * lumGrid[idx - 1] +
                2 * lumGrid[idx + 1] -
                lumGrid[idx + size - 1] +
                lumGrid[idx + size + 1];
              const gy =
                -lumGrid[idx - size - 1] -
                2 * lumGrid[idx - size] -
                lumGrid[idx - size + 1] +
                lumGrid[idx + size - 1] +
                2 * lumGrid[idx + size] +
                lumGrid[idx + size + 1];
              const grad = Math.sqrt(gx * gx + gy * gy);
              if (grad > 70) {
                edgeGradients++;
              }
            }
          }

          const meanLum = totalLuminance / totalPixels;
          const meanSat = totalSaturation / totalPixels;
          const asphaltRatio = asphaltPixels / totalPixels;
          const cavityRatio = darkCavityPixels / totalPixels;
          const edgeDensity = edgeGradients / ((size - 2) * (size - 2));

          // Strict civil discrimination:
          let opticalVerdict: 'Hazard' | 'CleanRoad' | 'NonRoad' = 'Hazard';
          let isAsphaltPavement = true;
          let hasCavityDepression = true;

          // If color saturation is high (faces, indoor furniture, nature, cars, documents)
          if (asphaltRatio < 0.38 || meanSat > 0.28) {
            opticalVerdict = 'NonRoad';
            isAsphaltPavement = false;
            hasCavityDepression = false;
          } else if (cavityRatio < 0.035 && edgeDensity < 0.07) {
            // Asphalt is clean with no depression pocket
            opticalVerdict = 'CleanRoad';
            isAsphaltPavement = true;
            hasCavityDepression = false;
          } else {
            // True road cavity
            opticalVerdict = 'Hazard';
            isAsphaltPavement = true;
            hasCavityDepression = true;
          }

          const telemetry: VisualTelemetryData = {
            isAsphaltPavement,
            hasCavityDepression,
            cavityAreaRatio: Number(cavityRatio.toFixed(3)),
            asphaltRatio: Number(asphaltRatio.toFixed(3)),
            meanSaturation: Number(meanSat.toFixed(3)),
            meanLuminance: Math.round(meanLum),
            edgeDensity: Number(edgeDensity.toFixed(3)),
            opticalVerdict,
          };

          resolve(telemetry);
        } catch (e) {
          resolve({ opticalVerdict: 'Hazard' });
        }
      };
      img.onerror = () => resolve({ opticalVerdict: 'Hazard' });
      img.src = dataUrl;
    });
  };

  // Handle image selection or camera capture
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setSelectedImage(base64);
        setAiResult(null);
        setDedupResult(null);

        // Run optical scanner tool immediately
        const telemetry = await scanImageOpticalFeatures(base64);
        setOpticalTelemetry(telemetry);
      };
      reader.readAsDataURL(file);
    }
  };

  // Select test preset
  const handleSelectPreset = async (preset: (typeof TEST_PRESETS)[0]) => {
    setSelectedImage(preset.dataUrl);
    setImageFile(null);
    setAiResult(null);
    setDedupResult(null);
    setOpticalTelemetry(preset.optical);
    setGpsLocation((prev) => ({
      ...prev,
      address: preset.location.address,
      ward: preset.location.ward,
      lat: preset.location.lat,
      lng: preset.location.lng,
    }));
    triggerToast(`Selected test preset: ${preset.label} (${preset.type})`, 'info');
  };

  // Save custom Gemini API key
  const handleSaveApiKey = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('civiclens_gemini_key', customApiKey.trim());
      triggerToast('Google Gemini API Key saved to local session', 'success');
      setShowKeySetting(false);
    }
  };

  // Calculate severity-based reward coins
  const calculateRewardCoins = (severity?: string, merged = false): number => {
    if (merged) return 25;
    switch (severity) {
      case 'Critical':
        return 100;
      case 'High':
        return 75;
      case 'Medium':
        return 50;
      case 'Low':
        return 25;
      default:
        return 50;
    }
  };

  // Main submission handler: Optical Analysis -> Gemini AI -> Proximity Deduplication -> Coins Award
  const handleSubmitReport = async () => {
    if (!selectedImage && !imageFile) {
      triggerToast('Please capture or select a road defect photo first.', 'error');
      return;
    }

    setIsProcessing(true);
    setProcessingStep('Executing optical surface inspection...');

    try {
      // 1. Scan optical telemetry if not already done
      let telemetry = opticalTelemetry;
      if (!telemetry) {
        telemetry = await scanImageOpticalFeatures(selectedImage!);
        setOpticalTelemetry(telemetry);
      }

      // 2. Upload photo to Supabase storage bucket
      setProcessingStep('Uploading photo to secure cloud storage...');
      let publicPhotoUrl = selectedImage!;
      try {
        publicPhotoUrl = await uploadHazardImage(imageFile || selectedImage!);
      } catch (uploadError) {
        console.warn('Supabase storage upload fallback:', uploadError);
      }

      // 3. Call Gemini Vision API + Optical Inspection
      setProcessingStep('Analyzing cavity dimensions with Gemini 2.5 Flash...');
      const geminiResponse = await fetch('/api/analyze-hazard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(customApiKey ? { 'x-gemini-api-key': customApiKey } : {}),
        },
        body: JSON.stringify({
          imageBase64: selectedImage,
          ward: gpsLocation.ward,
          roadType: 'City Arterial Corridor',
          clientApiKey: customApiKey || undefined,
          visualTelemetry: telemetry,
        }),
      });

      const geminiData = await geminiResponse.json();
      const aiData: GeminiAnalysisResult = geminiData.data || geminiData;
      setAiResult(aiData);

      // NON-HAZARD DISCRIMINATION GUARD:
      // If the image is not a hazard, strictly block ticket creation and do NOT award coins!
      if (aiData.is_hazard === false) {
        triggerToast(
          `⚠️ Rejected: ${aiData.why_ranked_here || 'No road surface cavity detected.'}`,
          'error'
        );
        setIsProcessing(false);
        setProcessingStep('');
        return;
      }

      // 4. Dispatch to 15-meter PostGIS deduplication API
      setProcessingStep('Verifying 15-meter proximity deduplication in Supabase...');
      const hazardPayload = {
        lat: gpsLocation.lat,
        lng: gpsLocation.lng,
        address: gpsLocation.address,
        ward: gpsLocation.ward,
        width_cm: aiData.width_cm || 45.0,
        depth_cm: aiData.depth_cm || 8.5,
        defect_type: aiData.defect_type || 'Pothole',
        base_risk_score: aiData.base_risk_score || 75,
        photo_url: publicPhotoUrl,
        why_ranked_here: aiData.why_ranked_here || 'Hazard detected on active commuter lane',
      };

      const hazardResponse = await fetch('/api/hazards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hazardPayload),
      });

      const hazardData = await hazardResponse.json();
      setDedupResult(hazardData);

      // 5. Award coins based on severity
      const isMerged = Boolean(hazardData?.merged);
      const coinsEarned = calculateRewardCoins(aiData.severity_level, isMerged);
      setEarnedCoinsAmount(coinsEarned);

      if (onAwardCoins) {
        onAwardCoins(coinsEarned);
      }

      // 6. Notify parent state about new hazard
      if (onNewReportCreated) {
        const createdHazard: HazardReport = hazardData.hazard || {
          id: `VH-${Date.now().toString().slice(-4)}`,
          defect_type: aiData.defect_type || 'Pothole',
          severity: aiData.severity_level || 'High',
          depth_cm: aiData.depth_cm || 8.5,
          width_cm: aiData.width_cm || 50.0,
          location: gpsLocation.address,
          ward: gpsLocation.ward,
          coordinates: { lat: gpsLocation.lat, lng: gpsLocation.lng },
          status: 'Reported',
          risk_score: aiData.base_risk_score || 80,
          duplicate_count: 1,
          reports_count: 1,
          confidence_score: aiData.confidence || 94,
          created_at: new Date().toISOString(),
          photo_url: publicPhotoUrl,
          why_ranked_here: aiData.why_ranked_here || 'Accurate road defect verified',
          activity_history: [
            {
              id: `act-${Date.now()}`,
              timestamp: 'Just now',
              actor: 'Citizen Uplink (Verified)',
              action: `Hazard report logged. +${coinsEarned} Civic Coins credited.`,
            },
          ],
        };
        onNewReportCreated(createdHazard);
      }

      // 7. Pop up the gamified coin reward celebration modal!
      setShowRewardModal(true);

      if (isMerged) {
        triggerToast(
          `Merged with existing ticket #${hazardData.hazard?.id}! Reports: ${hazardData.hazard?.reports_count}. +${coinsEarned} Coins credited.`,
          'info'
        );
      } else {
        triggerToast(`🎉 Verified road defect! +${coinsEarned} Civic Coins credited!`, 'success');
      }
    } catch (err: any) {
      console.error('Hazard pipeline error:', err);
      triggerToast('Submission error. Please check network and retry.', 'error');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-24 text-slate-100 select-none">
      {/* 1. Header Banner & Safety Protocol */}
      <div className="p-4 sm:p-5 bg-[#0B1528] border border-slate-800 rounded-2xl flex items-start justify-between gap-4 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
            <h2 className="text-base sm:text-lg font-black text-amber-400 font-headline uppercase tracking-wide">
              Report Road Hazard
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Autonomous optical scanning & Gemini 2.5 Flash dimensional risk calibration for GVMC.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowKeySetting(!showKeySetting)}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500 text-slate-400 hover:text-amber-400 transition-colors shrink-0 text-xs flex items-center gap-1.5"
          title="Configure Google Gemini API Key"
        >
          <Key className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Gemini Key</span>
        </button>
      </div>

      {/* Optional Gemini API Key Collapsible */}
      {showKeySetting && (
        <div className="p-4 bg-slate-900/90 border border-amber-500/40 rounded-2xl space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <Key className="w-4 h-4" />
              <span>Google Gemini 2.5 Flash API Key (Optional)</span>
            </div>
            <span className="text-[11px] text-slate-500">Stored in browser localStorage</span>
          </div>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="AIzaSy..."
              value={customApiKey}
              onChange={(e) => setCustomApiKey(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 outline-none focus:border-amber-500"
            />
            <button
              type="button"
              onClick={handleSaveApiKey}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
            >
              Save Key
            </button>
          </div>
        </div>
      )}

      {/* 2. Interactive Testing Tool: Presets for Testing Accuracy */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-teal-400" />
            <span>Inspection Presets (Test Accuracy & Non-Hazard Discrimination)</span>
          </span>
          <span className="text-[11px] text-slate-500">1-click test scenarios</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TEST_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className={`p-2.5 rounded-xl border text-left transition-all ${preset.color} hover:brightness-110 active:scale-95`}
            >
              <div className="text-xs font-black truncate">{preset.label}</div>
              <div className="text-[10px] opacity-80 truncate">{preset.type}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Live GPS Telemetry */}
      <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <MapPin className="w-4 h-4 text-teal-400 shrink-0 animate-pulse" />
          <span className="text-slate-300 font-medium truncate">
            {gpsLocation.address} ({gpsLocation.ward})
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-800/40 shrink-0">
          <span>±{gpsLocation.accuracy}m</span>
          {isLocating && <RefreshCw className="w-3 h-3 animate-spin text-teal-400" />}
        </div>
      </div>

      {/* 4. Camera Capture & Upload Surface */}
      <div className="space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        {!selectedImage ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-800 hover:border-teal-500/50 bg-slate-900/40 rounded-2xl p-8 sm:p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all group"
          >
            <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-105 transition-transform shadow-lg shadow-teal-950">
              <Camera className="w-8 h-8" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-bold text-slate-200">Capture Road Defect Photo</p>
              <p className="text-xs text-slate-500">
                Point camera at asphalt defect or choose an image from storage
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-950/60 px-3 py-1 rounded-full border border-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Real-time optical texture & cavity discrimination active</span>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60 shadow-xl">
              <img
                src={selectedImage}
                alt="Road Surface Capture"
                className="w-full h-64 sm:h-72 object-cover"
              />
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-700 text-xs text-slate-300 font-semibold hover:bg-slate-900 flex items-center gap-1.5 shadow-md"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retake Photo
                </button>
              </div>

              {/* Live Optical Scanner Verdict Chip */}
              {opticalTelemetry && (
                <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      opticalTelemetry.opticalVerdict === 'Hazard'
                        ? 'bg-red-400 animate-ping'
                        : opticalTelemetry.opticalVerdict === 'CleanRoad'
                        ? 'bg-emerald-400'
                        : 'bg-slate-400'
                    }`}
                  />
                  <span className="font-bold text-slate-200">
                    {opticalTelemetry.opticalVerdict === 'Hazard'
                      ? 'Cavity Shadow Detected'
                      : opticalTelemetry.opticalVerdict === 'CleanRoad'
                      ? 'Smooth Asphalt Surface'
                      : 'Non-Road Image Detected'}
                  </span>
                  <span className="text-[10px] text-slate-400 border-l border-slate-800 pl-2">
                    Sat: {opticalTelemetry.meanSaturation} | Asphalt: {Math.round((opticalTelemetry.asphaltRatio || 0) * 100)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 5. Submission CTA */}
      <button
        type="button"
        disabled={!selectedImage || isProcessing}
        onClick={handleSubmitReport}
        className={`w-full py-4 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
          !selectedImage || isProcessing
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/40'
            : 'bg-gradient-to-r from-amber-500 via-amber-400 to-teal-400 hover:brightness-105 text-slate-950 active:scale-[0.99] shadow-amber-500/20'
        }`}
      >
        {isProcessing ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
            <span>{processingStep || 'Processing Optical Telemetry...'}</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Analyze & Calculate Civil Risk Score</span>
          </>
        )}
      </button>

      {/* 6. NON-HAZARD WARNING BANNER (Accurate Rejection) */}
      {aiResult && !aiResult.is_hazard && (
        <div className="p-5 rounded-2xl bg-red-950/40 border border-red-500/60 text-red-200 space-y-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <XCircle className="w-6 h-6 text-red-400 shrink-0" />
            <div>
              <h4 className="text-sm font-black text-red-300 uppercase tracking-wide">
                No Road Surface Hazard Detected
              </h4>
              <p className="text-xs text-red-300/80 mt-0.5">
                The optical analysis engine evaluated this image as a non-hazard.
              </p>
            </div>
          </div>

          <div className="p-3 bg-red-950/60 rounded-xl border border-red-900/50 text-xs text-slate-300 leading-relaxed font-mono">
            "{aiResult.why_ranked_here}"
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Municipal work-order queues require an active structural cavity on outdoor asphalt. Zero coins are credited for non-hazards.
            </span>
          </div>
        </div>
      )}

      {/* 7. VERIFIED HAZARD RESULT CARD */}
      {aiResult && aiResult.is_hazard && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="text-sm font-black text-red-400 uppercase tracking-wider font-headline">
                {aiResult.defect_type || 'Pothole Defect'}
              </span>
              <span
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                  aiResult.severity_level === 'Critical'
                    ? 'bg-red-950 text-red-300 border border-red-800'
                    : aiResult.severity_level === 'High'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-teal-950 text-teal-300 border border-teal-800'
                }`}
              >
                {aiResult.severity_level} Severity
              </span>
            </div>

            <span className="text-[11px] font-mono text-slate-400 border border-slate-800 px-2.5 py-1 rounded-full bg-slate-950">
              Confidence: {aiResult.confidence}%
            </span>
          </div>

          {/* Three Metric Readout Cards */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-[11px] font-semibold text-slate-400">Cavity Depth</div>
              <div className="text-lg font-black text-red-400 font-mono mt-0.5">
                {aiResult.depth_cm} cm
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-[11px] font-semibold text-slate-400">Cavity Width</div>
              <div className="text-lg font-black text-amber-400 font-mono mt-0.5">
                {aiResult.width_cm} cm
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-[11px] font-semibold text-slate-400">Risk Score</div>
              <div className="text-lg font-black text-teal-400 font-mono mt-0.5">
                {aiResult.base_risk_score} / 100
              </div>
            </div>
          </div>

          {/* Civil Justification */}
          <p className="text-xs text-slate-300 bg-slate-950/70 p-3 rounded-xl border border-slate-800 italic leading-relaxed">
            "{aiResult.why_ranked_here}"
          </p>

          {/* Transparent Civil Engineering Risk Calculation Breakdown Tool */}
          <div className="border border-slate-800 rounded-xl bg-slate-950/90 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowFormulaBreakdown(!showFormulaBreakdown)}
              className="w-full p-3 flex items-center justify-between text-xs font-bold text-amber-400 hover:bg-slate-900/60 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-teal-400" />
                <span>Civil Engineering Risk Formula Breakdown</span>
              </div>
              {showFormulaBreakdown ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showFormulaBreakdown && (
              <div className="p-3 border-t border-slate-800 text-[11px] text-slate-300 space-y-2 bg-slate-950 font-mono">
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">1. Depth Impact ({aiResult.depth_cm}cm × 3.5):</span>
                  <span className="text-red-400 font-bold">
                    +{(aiResult.depth_cm * 3.5).toFixed(1)} pts
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">2. Width Impact (({aiResult.width_cm}cm / 100) × 20):</span>
                  <span className="text-amber-400 font-bold">
                    +{((aiResult.width_cm / 100) * 20).toFixed(1)} pts
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">3. Road Classification Weight (Arterial Corridor):</span>
                  <span className="text-teal-400 font-bold">+20.0 pts</span>
                </div>
                <div className="flex justify-between pt-1 text-xs font-bold text-white">
                  <span>Total Calibrated Risk Score:</span>
                  <span className="text-teal-300">{aiResult.base_risk_score} / 100</span>
                </div>
              </div>
            )}
          </div>

          {/* Deduplication Notice */}
          {dedupResult?.merged && (
            <div className="p-3 bg-blue-950/40 border border-blue-800/60 rounded-xl text-xs text-blue-300 flex items-center justify-between">
              <span>Merged with existing active hazard (#{dedupResult.hazard?.id})</span>
              <span className="font-bold text-blue-200">
                {dedupResult.hazard?.reports_count} reports total
              </span>
            </div>
          )}
        </div>
      )}

      {/* 8. CELEBRATION MODAL: Coins Credited to User Rewards & Credits */}
      {showRewardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#0B1528] border border-amber-500/50 p-6 space-y-5 text-center shadow-2xl relative">
            {/* Animated Coin Badge */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-200 mx-auto flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/30 animate-bounce">
              <Coins className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-white font-headline">
                Civic Coins Credited!
              </h3>
              <p className="text-xs text-slate-400">
                Your verified report has been added to the GVMC repair queue.
              </p>
            </div>

            {/* Credited Points Card */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-400">Severity Reward</span>
                <span className="text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded text-[10px]">
                  Verified Defect
                </span>
              </div>
              <div className="flex items-baseline justify-center gap-2 text-3xl font-black text-amber-400 font-mono">
                <span>+{earnedCoinsAmount}</span>
                <span className="text-sm text-amber-300 font-sans">Civic Coins</span>
              </div>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                Current Wallet: <strong className="text-white font-mono">{userCoins} PTS</strong>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowRewardModal(false);
                  if (onNavigateToRewards) onNavigateToRewards();
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-black transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
              >
                <Gift className="w-4 h-4 fill-current" />
                <span>Redeem for Food & Fuel Coupons</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowRewardModal(false);
                  setSelectedImage(null);
                  setImageFile(null);
                  setAiResult(null);
                  setOpticalTelemetry(null);
                }}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-all border border-slate-800"
              >
                Report Another Hazard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportHazardTab;
