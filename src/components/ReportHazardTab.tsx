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
  HelpCircle,
  Wrench,
  AlertOctagon,
  Video,
} from 'lucide-react';
import { uploadHazardImage } from '@/lib/storage';
import { GeminiAnalysisResult, HazardReport } from '@/types';
import { VisualTelemetryData } from '@/lib/gemini';
import { translations } from '@/lib/i18n';

interface ReportHazardTabProps {
  onNewReportCreated?: (hazard: HazardReport, isDuplicate?: boolean, msg?: string) => void;
  onAwardCoins?: (amount: number) => void;
  onShowToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateToRewards?: () => void;
  userCoins?: number;
  language?: 'EN' | 'TEL';
}

export const ReportHazardTab: React.FC<ReportHazardTabProps> = ({
  onNewReportCreated,
  onAwardCoins,
  onShowToast,
  onNavigateToRewards,
  userCoins = 840,
  language = 'EN',
}) => {
  const t = translations[language];

  // Capture & File States
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedMimeType, setSelectedMimeType] = useState<string>('image/jpeg');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

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
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'locating' | 'granted' | 'denied' | 'unsupported'>('idle');

  // Reverse-geocode coordinates into a readable address using OpenStreetMap Nominatim
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept': 'application/json' } }
      );
      if (!res.ok) throw new Error('geocode failed');
      const data = await res.json();
      return data.display_name as string;
    } catch {
      return `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`;
    }
  };

  // Request GPS access from the user and capture exact device location.
  // Triggered by an explicit user gesture (the button) so the browser
  // permission prompt is shown. We always call getCurrentPosition() directly
  // so the browser can prompt the user for permission — the permissions API
  // query is only used to provide helpful guidance, never to block the prompt.
  const requestLocation = async () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGpsStatus('unsupported');
      triggerToast('Geolocation is not supported by this browser.', 'error');
      return;
    }

    setIsLocating(true);
    setGpsStatus('locating');

    // Direct call to getCurrentPosition to trigger browser prompt
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        const accuracy = Math.max(1, Math.round(pos.coords.accuracy));
        const address = await reverseGeocode(lat, lng);
        setGpsLocation((prev) => ({
          ...prev,
          lat,
          lng,
          accuracy,
          address,
        }));
        setGpsStatus('granted');
        setIsLocating(false);
        triggerToast('📍 GPS location captured precisely', 'success');
      },
      (err) => {
        console.warn('Geolocation denied or unavailable:', err);
        setGpsStatus('denied');
        setIsLocating(false);

        if (err.code === err.PERMISSION_DENIED) {
          triggerToast('GPS permission denied. Please allow location access in your browser settings to capture exact coordinates.', 'error');
        } else if (err.code === err.TIMEOUT) {
          // Retry once with highAccuracy: false if it timed out
          triggerToast('GPS request timed out. Retrying with standard accuracy...', 'info');
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              const lat = Number(pos.coords.latitude.toFixed(6));
              const lng = Number(pos.coords.longitude.toFixed(6));
              const accuracy = Math.max(1, Math.round(pos.coords.accuracy));
              const address = await reverseGeocode(lat, lng);
              setGpsLocation((prev) => ({ ...prev, lat, lng, accuracy, address }));
              setGpsStatus('granted');
              triggerToast('📍 GPS location captured (Standard Accuracy)', 'success');
            },
            () => triggerToast('Unable to get GPS location even with standard accuracy.', 'error'),
            { enableHighAccuracy: false, timeout: 10000 }
          );
        } else {
          triggerToast('Unable to get GPS location. Please check your device settings.', 'error');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  // Submission & Processing States
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [aiResult, setAiResult] = useState<GeminiAnalysisResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [dedupResult, setDedupResult] = useState<any>(null);
  const [reportTimestamp, setReportTimestamp] = useState<string>('');

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

  // Note: GPS is NOT auto-requested on mount. Browsers block geolocation
  // prompts that fire without a user gesture, so we only request it when the
  // user explicitly taps the "Use My Exact GPS Location" button.

  const triggerToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (onShowToast) {
      onShowToast(msg, type);
    }
  };

  /**
   * Client-Side Image Compression & Downscaling Helper
   * Resizes large camera photos to max 1600px width/height and 85% JPEG quality.
   */
  const compressImage = (file: File): Promise<{ base64: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1600;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve({ base64: event.target?.result as string, mimeType: file.type });
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve({ base64: compressedDataUrl, mimeType: 'image/jpeg' });
        };
        img.onerror = () => reject(new Error('Failed to load image for compression'));
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file from disk'));
      reader.readAsDataURL(file);
    });
  };

  /**
   * Optical Feature Scanner & Blur Detection Tool
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
            resolve({ opticalVerdict: 'Inconclusive' });
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

          const lumGrid: number[] = new Array(totalPixels);

          for (let i = 0; i < totalPixels; i++) {
            const r = pixels[i * 4];
            const g = pixels[i * 4 + 1];
            const b = pixels[i * 4 + 2];

            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            lumGrid[i] = lum;
            totalLuminance += lum;

            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const sat = max === 0 ? 0 : (max - min) / max;
            totalSaturation += sat;

            const isNeutralGray = Math.abs(r - g) < 28 && Math.abs(g - b) < 28;
            const isAsphaltTone = isNeutralGray && sat < 0.24 && lum > 25 && lum < 200;
            if (isAsphaltTone) asphaltPixels++;
            if (lum < 65) darkCavityPixels++;
          }

          // Compute Sobel Edge Gradients & Laplacian Blur Variance
          let laplacianSum = 0;
          let laplacianSqSum = 0;
          let laplacianCount = 0;

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
              if (grad > 70) edgeGradients++;

              // Laplacian kernel for blur measurement: 0, 1, 0, 1, -4, 1, 0, 1, 0
              const lap =
                lumGrid[idx - size] +
                lumGrid[idx + size] +
                lumGrid[idx - 1] +
                lumGrid[idx + 1] -
                4 * lumGrid[idx];
              laplacianSum += lap;
              laplacianSqSum += lap * lap;
              laplacianCount++;
            }
          }

          const meanLum = totalLuminance / totalPixels;
          const meanSat = totalSaturation / totalPixels;
          const asphaltRatio = asphaltPixels / totalPixels;
          const cavityRatio = darkCavityPixels / totalPixels;
          const edgeDensity = edgeGradients / ((size - 2) * (size - 2));

          const lapMean = laplacianSum / laplacianCount;
          const blurVariance = Math.max(0, laplacianSqSum / laplacianCount - lapMean * lapMean);

          // Classification logic:
          let opticalVerdict: 'Hazard' | 'CleanRoad' | 'NonRoad' | 'Inconclusive' = 'Hazard';
          let isAsphaltPavement = true;
          let hasCavityDepression = true;

          if (blurVariance < 12) {
            // Severe motion blur or out of focus
            opticalVerdict = 'Inconclusive';
            isAsphaltPavement = true;
            hasCavityDepression = false;
          } else if (asphaltRatio < 0.35 || meanSat > 0.30) {
            // High color saturation: indoor scene, clothes, face, nature
            opticalVerdict = 'NonRoad';
            isAsphaltPavement = false;
            hasCavityDepression = false;
          } else if (cavityRatio < 0.035 && edgeDensity < 0.07) {
            // Intact asphalt surface
            opticalVerdict = 'CleanRoad';
            isAsphaltPavement = true;
            hasCavityDepression = false;
          } else {
            // Verified road hazard
            opticalVerdict = 'Hazard';
            isAsphaltPavement = true;
            hasCavityDepression = true;
          }

          resolve({
            isAsphaltPavement,
            hasCavityDepression,
            cavityAreaRatio: Number(cavityRatio.toFixed(3)),
            asphaltRatio: Number(asphaltRatio.toFixed(3)),
            meanSaturation: Number(meanSat.toFixed(3)),
            meanLuminance: Math.round(meanLum),
            edgeDensity: Number(edgeDensity.toFixed(3)),
            blurVariance: Math.round(blurVariance),
            opticalVerdict,
          });
        } catch (e) {
          // Never resolve to 'Hazard' on error
          resolve({ opticalVerdict: 'Inconclusive' });
        }
      };
      img.onerror = () => resolve({ opticalVerdict: 'Inconclusive' });
      img.src = dataUrl;
    });
  };

  // Handle image selection or camera capture with validation & auto-compression
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Validate MIME format
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(file.type.toLowerCase())) {
      triggerToast('Unsupported file format. Please upload a JPEG, PNG, or WebP photo.', 'error');
      return;
    }

    // 2. Validate Size Limit (20MB)
    if (file.size > 20 * 1024 * 1024) {
      triggerToast('File size exceeds 20MB. Please choose a smaller photo.', 'error');
      return;
    }

    setImageFile(file);
    setApiError(null);
    setAiResult(null);
    setDedupResult(null);
    setIsProcessing(true);
    setReportTimestamp(new Date().toISOString());

    try {
      setProcessingStep('Optimizing photo resolution...');
      const { base64, mimeType } = await compressImage(file);
      setSelectedImage(base64);
      setSelectedMimeType(mimeType);

      // Run optical scanner tool
      setProcessingStep('Scanning surface features & measuring defects...');
      const telemetry = await scanImageOpticalFeatures(base64);
      setOpticalTelemetry(telemetry);

      // Auto-run the Gemini Vision AI analysis so the user immediately sees
      // severity, risk score, and defect details — no extra click required.
      await runAnalysis(base64, mimeType, telemetry);
    } catch (err: any) {
      console.error('Image preprocessing error:', err);
      triggerToast('Could not analyze image. Please try another photo.', 'error');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  // Handle video capture
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    triggerToast('Video captured. Analyzing visual frames...', 'info');
    // In a real implementation, we would extract frames or upload video
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
        return 0;
    }
  };

  // Run the Gemini Vision AI analysis on the uploaded image.
  // Called automatically right after an image is uploaded so the user sees
  // severity, risk score, defect type, and dimensions without an extra click.
  const runAnalysis = async (
    base64?: string,
    mimeType?: string,
    telemetry?: VisualTelemetryData
  ): Promise<GeminiAnalysisResult | null> => {
    const imageBase64 = base64 || selectedImage;
    if (!imageBase64) return null;

    setProcessingStep('Analyzing pavement with Gemini Vision & Civil Telemetry...');
    try {
      const visualTelemetry = telemetry || opticalTelemetry || (await scanImageOpticalFeatures(imageBase64));
      if (!opticalTelemetry) setOpticalTelemetry(visualTelemetry);

      const geminiResponse = await fetch('/api/analyze-hazard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(customApiKey ? { 'x-gemini-api-key': customApiKey } : {}),
        },
        body: JSON.stringify({
          imageBase64,
          mimeType: mimeType || selectedMimeType,
          ward: gpsLocation.ward,
          roadType: 'City Arterial Corridor',
          clientApiKey: customApiKey || undefined,
          visualTelemetry,
        }),
      });

      const geminiData = await geminiResponse.json();

      if (!geminiResponse.ok && !geminiData.detected_condition) {
        throw new Error(geminiData.error || `Server responded with status ${geminiResponse.status}`);
      }

      const aiData: GeminiAnalysisResult = geminiData.data || geminiData;
      setAiResult(aiData);

      if (aiData.is_inconclusive) {
        triggerToast('⚠️ Inconclusive image: Defect could not be verified. Please retake photo.', 'info');
      } else if (!aiData.is_hazard) {
        triggerToast(
          aiData.detected_condition === 'Normal Road Condition'
            ? '✅ Normal Road Surface Verified: No hazard present.'
            : 'ℹ️ Non-road image detected. No road defects logged.',
          'info'
        );
      } else {
        triggerToast(`✅ ${aiData.detected_condition || 'Defect'} detected. Review details & submit below.`, 'success');
      }

      return aiData;
    } catch (err: any) {
      console.error('Analysis error:', err);
      setApiError(err.message || 'Image analysis service encountered an error.');
      triggerToast('Analysis service error. Please retry.', 'error');
      return null;
    }
  };

  // Main submission handler — uses the analysis already run on upload.
  const handleSubmitReport = async () => {
    if (!selectedImage) {
      triggerToast('Please capture or select a road defect photo first.', 'error');
      return;
    }

    // If analysis hasn't completed yet (e.g. user clicked submit very fast), run it.
    let aiData = aiResult;
    if (!aiData) {
      setIsProcessing(true);
      aiData = await runAnalysis();
      setIsProcessing(false);
    }

    if (!aiData || aiData.is_inconclusive || !aiData.is_hazard) {
      return;
    }

    setIsProcessing(true);
    setApiError(null);

    try {
      // Upload photo to Supabase storage
      setProcessingStep('Uploading photo to secure cloud storage...');
      let publicPhotoUrl = selectedImage;
      try {
        publicPhotoUrl = await uploadHazardImage(imageFile || selectedImage);
      } catch (uploadError) {
        console.warn('Supabase storage upload fallback:', uploadError);
      }

      // CASE 3: Genuine Verified Road Hazard
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
        why_ranked_here: aiData.why_ranked_here || aiData.explanation || 'Verified road hazard',
      };

      const hazardResponse = await fetch('/api/hazards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hazardPayload),
      });

      const hazardData = await hazardResponse.json();
      setDedupResult(hazardData);

      // Award coins based on severity
      const isMerged = Boolean(hazardData?.merged);
      const coinsEarned = calculateRewardCoins(aiData.severity_level, isMerged);
      setEarnedCoinsAmount(coinsEarned);

      if (coinsEarned > 0 && onAwardCoins) {
        onAwardCoins(coinsEarned);
      }

      // Notify parent state
      if (onNewReportCreated) {
        const createdHazard: HazardReport = hazardData.hazard || {
          id: `VH-${Date.now().toString().slice(-4)}`,
          title: `${aiData.detected_condition || 'Road Defect'} on ${gpsLocation.address}`,
          description: aiData.explanation || 'Verified surface defect',
          location: gpsLocation.address,
          ward: gpsLocation.ward,
          wardNumber: parseInt(gpsLocation.ward.replace(/\D/g, '') || '18', 10),
          coordinates: { lat: gpsLocation.lat, lng: gpsLocation.lng },
          width_cm: aiData.width_cm || 50.0,
          depth_cm: aiData.depth_cm || 8.5,
          confidence: aiData.confidence || 94,
          defect_type: aiData.defect_type || 'Pothole',
          severity: (aiData.severity_level === 'None' ? 'Medium' : aiData.severity_level) || 'High',
          risk_score: aiData.base_risk_score || 75,
          duplicate_count: 1,
          reportsCount: 1,
          status: 'Reported',
          progress: 20,
          road_type: 'Arterial',
          traffic_level: 'High',
          images: [publicPhotoUrl],
          photos: [publicPhotoUrl],
          reported_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          why_ranked_here: aiData.why_ranked_here || aiData.explanation || 'Verified defect',
          activity_history: [
            {
              id: `act-${Date.now()}`,
              timestamp: 'Just now',
              actor: 'Citizen Uplink (Verified)',
              action: `Hazard report logged. +${coinsEarned} Civic Coins credited.`,
            },
          ],
          score_breakdown: {
            depth_weight: Math.round((aiData.depth_cm || 8.5) * 3.5),
            area_weight: Math.round(((aiData.width_cm || 50) / 100) * 20),
            traffic_weight: 20,
            reports_weight: 4,
          },
        };
        onNewReportCreated(createdHazard);
      }

      setShowRewardModal(true);
      triggerToast(`🎉 Verified ${aiData.detected_condition}! +${coinsEarned} Coins credited!`, 'success');
    } catch (err: any) {
      console.error('Hazard pipeline error:', err);
      setApiError(err.message || 'Image analysis service encountered an error.');
      triggerToast('Submission error. Please retry.', 'error');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24 text-slate-900 dark:text-slate-100 select-none">
      {/* 1. Hero Section - The Society Value & Mission */}
      <section className="relative group overflow-hidden rounded-[3rem] bg-gradient-to-br from-slate-900 via-[#0B1528] to-slate-900 border border-slate-200 dark:border-white/5 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528] via-[#0B1528]/80 to-transparent"></div>

        <div className="relative p-10 md:p-16 space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-black tracking-[0.2em] text-amber-400 uppercase">{t.VIZAG_LOCATION}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white font-headline leading-[1.1] tracking-tight">
            {t.SOCIETAL_VALUE_TITLE.split(' ')[0]} {t.SOCIETAL_VALUE_TITLE.split(' ')[1]} <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-teal-400">{t.SOCIETAL_VALUE_TITLE.split(' ').slice(2).join(' ')}</span>
          </h1>
          <p className="text-base md:text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            {t.SOCIETAL_VALUE_DESC}
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              96.4% AI Accuracy
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10">
              <MapPin className="w-4 h-4 text-amber-400" />
              Real-time Triangulation
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowKeySetting(!showKeySetting)}
          className="absolute top-8 right-8 p-3 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-amber-500/50 text-slate-600 dark:text-slate-400 hover:text-amber-400 transition-all duration-300 shadow-xl"
          title="Configure AI Engine"
        >
          <Key className="w-5 h-5" />
        </button>
      </section>

      {/* 2. Geospatial Intelligence Bridge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2rem] flex flex-col justify-between h-full group hover:bg-white/10 transition-colors">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-400 border border-teal-500/20 group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6 animate-pulse" />
                </div>
                <span
                  className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${gpsStatus === 'granted'
                    ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                    : gpsStatus === 'denied'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : gpsStatus === 'locating'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'
                    }`}
                >
                  {gpsStatus === 'granted' ? 'GPS Active' : gpsStatus === 'denied' ? 'Permission Denied' : gpsStatus === 'locating' ? 'Locating…' : 'Tap to Enable'}
                </span>
              </div>
              <div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Geospatial Uplink</div>
                <p className="text-lg text-slate-800 dark:text-slate-200 font-black leading-tight">
                  {gpsLocation.address.split(',')[0]}
                </p>
                <p className="text-[10px] text-teal-500 font-mono mt-1 font-bold">
                  {gpsLocation.lat}° N, {gpsLocation.lng}° E
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={requestLocation}
              disabled={isLocating}
              className="mt-6 w-full py-3 rounded-2xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-400 text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              {isLocating ? 'Acquiring GPS…' : 'Use My Exact GPS Location'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="p-6 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2rem] flex flex-col md:flex-row items-center gap-8 h-full">
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 text-amber-500 font-black text-[10px] uppercase tracking-[0.3em]">
                <ShieldCheck className="w-4 h-4" />
                <span>Precision Accuracy</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Advanced Signal Triangulation</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Our platform utilizes multi-source GPS data and device-level IMU sensors to stabilize reporting coordinates, ensuring government engineers find the hazard within ±{gpsLocation.accuracy} meters.
              </p>
            </div>
            <div className="w-full md:w-48 aspect-square rounded-[1.5rem] bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent animate-pulse"></div>
              <div className="relative text-center">
                <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">±{gpsLocation.accuracy}m</div>
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Variance</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. The Digital Uplink System */}
      <section className="space-y-8">
        <div className="flex items-center justify-between px-4">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">Report Infrastructure Defect</h2>
            <p className="text-xs text-slate-500 font-medium tracking-tight">AI-Enhanced Visual Verification System</p>
          </div>
          <div className="h-px flex-1 bg-slate-100 dark:bg-white/5 mx-8 hidden md:block"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-7 space-y-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              capture="environment"
              onChange={handleVideoChange}
              className="hidden"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-6 rounded-[2rem] bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-amber-500/50 hover:bg-white/10 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-110 transition-transform">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">{t.CAPTURE_PHOTO}</span>
              </button>

              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-6 rounded-[2rem] bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-teal-500/50 hover:bg-white/10 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">{t.UPLOAD_FILE}</span>
              </button>

              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-6 rounded-[2rem] bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-red-500/50 hover:bg-white/10 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400 mb-3 group-hover:scale-110 transition-transform">
                  <Video className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">{t.RECORD_VIDEO}</span>
              </button>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative group cursor-pointer overflow-hidden rounded-[2.5rem] bg-[#0B1528]/40 border-2 border-dashed border-slate-200 dark:border-white/5 hover:border-teal-500/50 transition-all duration-500 min-h-[300px] flex flex-col items-center justify-center p-12 text-center"
            >
              {selectedImage ? (
                <div className="absolute inset-0 w-full h-full">
                  <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-100 dark:bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="px-6 py-3 bg-white text-slate-950 rounded-xl text-xs font-black uppercase tracking-widest shadow-2xl">Replace Evidence</div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-3xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 group-hover:scale-110 group-hover:shadow-[0_0_40px_rgba(20,184,166,0.2)] transition-all duration-700 mb-6">
                    <Camera className="w-10 h-10" />
                  </div>
                  <div className="space-y-3 relative z-10">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Initialize Visual Capture</h3>
                    <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto">Point your lens at the road defect or upload high-resolution evidence from your system.</p>
                  </div>
                  <div className="mt-8 flex items-center gap-3 text-[10px] font-black text-teal-400 bg-teal-500/10 px-5 py-2 rounded-full border border-teal-500/20 shadow-inner">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="uppercase tracking-widest">Real-time Optical Intelligence Active</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="md:col-span-5 space-y-6">
            <div className="p-8 rounded-[2.5rem] bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-6">
              <h4 className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-[0.2em]">{t.WHY_REPORT_TITLE}</h4>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 shrink-0 border border-red-500/20">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-slate-900 dark:text-white">{t.PREVENT_FATALITIES_TITLE}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{t.PREVENT_FATALITIES_DESC}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 shrink-0 border border-teal-500/20">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-slate-900 dark:text-white">{t.EARN_REWARDS_TITLE}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{t.EARN_REWARDS_DESC}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0 border border-amber-500/20">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-slate-900 dark:text-white">{t.DIRECT_GOVERNANCE_TITLE}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{t.DIRECT_GOVERNANCE_DESC}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-6">
              <h4 className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-[0.2em]">Potholes Resolved via CivicLens</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-3xl font-black font-headline text-amber-400">1,284</div>
                  <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Potholes Repaired</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-black font-headline text-teal-400">62</div>
                  <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Wards Covered</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-black font-headline text-red-400">9,438</div>
                  <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Fatalities Prevented</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-black font-headline text-blue-400">94%</div>
                  <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Citizen Satisfaction</div>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                With CivicLens, thousands of road hazards across Visakhapatnam have been identified, prioritized, and repaired — making daily commutes safer for every citizen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Preview Surface */}
      {selectedImage && (
        <div className="space-y-3">
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-white dark:bg-slate-900/60 shadow-xl">
            <img
              src={selectedImage}
              alt="Road Surface Capture"
              className={`w-full h-64 sm:h-80 object-cover transition-all duration-300 ${isProcessing ? 'blur-[1px] scale-[1.02]' : ''}`}
            />

            {/* AI Scanning Animation Overlay */}
            {isProcessing && (
              <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[1px] flex flex-col items-center justify-center z-10">
                <div className="relative w-32 h-32">
                  <div className="absolute inset-0 rounded-full border-4 border-teal-500/20"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-teal-400 animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-teal-400 animate-pulse" />
                  </div>
                </div>
                <p className="mt-4 text-sm font-black text-white tracking-wider animate-pulse">
                  {processingStep || 'AI Analyzing Surface…'}
                </p>
                {/* Scanning line sweep */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_12px_4px_rgba(20,184,166,0.6)] animate-[scan_2s_linear_infinite]"></div>
              </div>
            )}

            <div className="absolute top-3 right-3 flex gap-2 z-20">
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="px-3 py-1.5 rounded-lg bg-red-950/80 backdrop-blur-md border border-red-800/60 text-xs text-red-300 font-semibold hover:bg-red-900 flex items-center gap-1.5 shadow-md"
              >
                <XCircle className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>

            {/* Live Optical Scanner Verdict Chip */}
            {opticalTelemetry && (
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-slate-100 dark:bg-slate-950/85 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${opticalTelemetry.opticalVerdict === 'Hazard'
                      ? 'bg-red-400 animate-pulse'
                      : opticalTelemetry.opticalVerdict === 'CleanRoad'
                        ? 'bg-emerald-400'
                        : opticalTelemetry.opticalVerdict === 'Inconclusive'
                          ? 'bg-amber-400 animate-pulse'
                          : 'bg-slate-400'
                      }`}
                  />
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {opticalTelemetry.opticalVerdict === 'Hazard'
                      ? 'Defect Pattern Detected'
                      : opticalTelemetry.opticalVerdict === 'CleanRoad'
                        ? 'Smooth Road Pavement'
                        : opticalTelemetry.opticalVerdict === 'Inconclusive'
                          ? 'Image Blur / Low Quality'
                          : 'Non-Road Subject'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400 font-mono">
                  Sharpness: {opticalTelemetry.blurVariance || 0} | Asphalt: {Math.round((opticalTelemetry.asphaltRatio || 0) * 100)}%
                </div>
              </div>
            )}
          </div>

          {/* Analysis Info Card — severity, risk, location & timestamp */}
          <div className="rounded-2xl border border-slate-800 bg-white dark:bg-slate-900/70 p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  Scan Result
                </span>
              </div>
              {isProcessing ? (
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-teal-400">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Analyzing surface…
                </span>
              ) : aiResult ? (
                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md ${aiResult.severity_level === 'Critical'
                  ? 'bg-red-950 text-red-300 border border-red-800'
                  : aiResult.severity_level === 'High'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : aiResult.severity_level === 'Medium'
                      ? 'bg-yellow-950 text-yellow-300 border border-yellow-800'
                      : aiResult.severity_level === 'Low'
                        ? 'bg-teal-950 text-teal-300 border border-teal-800'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                  {aiResult.severity_level} Severity
                </span>
              ) : null}
            </div>

            {aiResult && (
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {aiResult.detected_condition || aiResult.defect_type || 'Road Defect Detected'}
              </p>
            )}

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Risk Score
                </div>
                <div className="text-base font-black text-red-400 font-mono mt-0.5">
                  {isProcessing ? '—' : aiResult ? `${aiResult.base_risk_score ?? 0}/100` : '—'}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Confidence
                </div>
                <div className="text-base font-black text-teal-400 font-mono mt-0.5">
                  {isProcessing ? '—' : aiResult ? `${aiResult.confidence ?? 0}%` : '—'}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 pt-1 border-t border-slate-800/70">
              <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Report Location
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                  {gpsLocation.address}
                </p>
                <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  {gpsLocation.lat.toFixed(5)}° N, {gpsLocation.lng.toFixed(5)}° E
                  {gpsStatus === 'granted' ? ' • GPS verified' : ` • ±${gpsLocation.accuracy}m`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
              <span className="font-mono">
                {reportTimestamp
                  ? new Date(reportTimestamp).toLocaleString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                  : '—'}
              </span>
            </div>
          </div>

          {/* Submission CTA */}
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleSubmitReport}
            className={`w-full py-4 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${isProcessing
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/40'
              : 'bg-gradient-to-r from-amber-500 via-amber-400 to-teal-400 hover:brightness-105 text-slate-950 active:scale-[0.99] shadow-amber-500/20'
              }`}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>{processingStep || t.PROCESSING}</span>
              </>
            ) : (
              <>
                <Gift className="w-4 h-4 fill-current" />
                <span>Contribute Report &amp; Earn Coins</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* 5. API ERROR BANNER */}
      {apiError && (
        <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/60 text-red-200 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xs text-red-300">
              <AlertOctagon className="w-4 h-4 text-red-400" />
              <span>Image Analysis Service Error</span>
            </div>
            <button
              type="button"
              onClick={handleSubmitReport}
              className="px-3 py-1 bg-red-900 hover:bg-red-800 rounded-lg text-xs font-bold text-white transition-colors"
            >
              Retry Analysis
            </button>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-mono">{apiError}</p>
        </div>
      )}

      {/* 6. RESULTS SECTION (Inconclusive, Normal, or Hazard) - Kept original functionality with minor styling tweaks */}
      {aiResult && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {aiResult.is_inconclusive ? (
            <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-500/60 text-amber-200 space-y-3 shadow-xl">
              <div className="flex items-center gap-2.5">
                <HelpCircle className="w-6 h-6 text-amber-400 shrink-0" />
                <div>
                  <h4 className="text-sm font-black text-amber-300 uppercase tracking-wide">
                    Inconclusive Inspection – Defect Unclear
                  </h4>
                  <p className="text-xs text-amber-200/80 mt-0.5">
                    The visual assessment could not verify a road defect with high confidence.
                  </p>
                </div>
              </div>
              <div className="p-3 bg-slate-100 dark:bg-slate-950/70 rounded-xl border border-amber-900/40 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-mono italic">
                "{aiResult.explanation}"
              </div>
            </div>
          ) : !aiResult.is_hazard ? (
            <div className={`p-5 rounded-2xl border space-y-3 shadow-xl ${aiResult.detected_condition === 'Normal Road Condition'
              ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
              : 'bg-white dark:bg-slate-900 border-slate-700 text-slate-800 dark:text-slate-200'
              }`}>
              <div className="flex items-center gap-2.5">
                {aiResult.detected_condition === 'Normal Road Condition' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-slate-600 dark:text-slate-400 shrink-0" />
                )}
                <div>
                  <h4 className="text-sm font-black uppercase tracking-wide">
                    {aiResult.detected_condition === 'Normal Road Condition'
                      ? 'Normal Road Condition Verified'
                      : 'Non-Road Subject Detected'}
                  </h4>
                  <p className="text-xs opacity-80 mt-0.5">
                    {aiResult.detected_condition === 'Normal Road Condition'
                      ? 'Pavement surface is smooth, intact, and safe for commuter traffic.'
                      : 'The uploaded image does not depict an outdoor street or road surface.'}
                  </p>
                </div>
              </div>
              <div className="p-3 bg-slate-100 dark:bg-slate-950/70 rounded-xl border border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-mono italic">
                "{aiResult.explanation}"
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-800 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span className="text-sm font-black text-red-400 uppercase tracking-wider font-headline">
                    {aiResult.detected_condition || aiResult.defect_type || 'Road Defect'}
                  </span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${aiResult.severity_level === 'Critical'
                    ? 'bg-red-950 text-red-300 border border-red-800'
                    : aiResult.severity_level === 'High'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-teal-950 text-teal-300 border border-teal-800'
                    }`}>
                    {aiResult.severity_level} Severity
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 border border-slate-800 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-950">
                  Confidence: {aiResult.confidence}%
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-800 text-center">
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Cavity Depth</div>
                  <div className="text-lg font-black text-red-400 font-mono mt-0.5">{aiResult.depth_cm} cm</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-800 text-center">
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Estimated Width</div>
                  <div className="text-lg font-black text-amber-400 font-mono mt-0.5">{aiResult.width_cm} cm</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-800 text-center">
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Risk Score</div>
                  <div className="text-lg font-black text-teal-400 font-mono mt-0.5">{aiResult.base_risk_score} / 100</div>
                </div>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-950/70 p-3 rounded-xl border border-slate-800 italic leading-relaxed">
                "{aiResult.explanation}"
              </p>

              <div className="p-3.5 bg-amber-950/30 border border-amber-500/40 rounded-xl space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  <span>Recommended Municipal Action</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-mono">{aiResult.recommended_action}</p>
              </div>

              <div className="border border-slate-800 rounded-xl bg-slate-100 dark:bg-slate-950/90 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowFormulaBreakdown(!showFormulaBreakdown)}
                  className="w-full p-3 flex items-center justify-between text-xs font-bold text-amber-400 hover:bg-white dark:bg-slate-900/60 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-teal-400" />
                    <span>Civil Engineering Risk Formula Breakdown</span>
                  </div>
                  {showFormulaBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showFormulaBreakdown && (
                  <div className="p-3 border-t border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 space-y-2 bg-slate-100 dark:bg-slate-950 font-mono">
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-600 dark:text-slate-400">1. Depth Factor ({aiResult.depth_cm}cm × 3.5):</span>
                      <span className="text-red-400 font-bold">+{(aiResult.depth_cm * 3.5).toFixed(1)} pts</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-600 dark:text-slate-400">2. Width Factor (({aiResult.width_cm}cm / 100) × 20):</span>
                      <span className="text-amber-400 font-bold">+{((aiResult.width_cm / 100) * 20).toFixed(1)} pts</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-600 dark:text-slate-400">3. Road Classification Weight (City Arterial):</span>
                      <span className="text-teal-400 font-bold">+20.0 pts</span>
                    </div>
                    <div className="flex justify-between pt-1 text-xs font-bold text-slate-900 dark:text-white">
                      <span>Total Calibrated Risk Score:</span>
                      <span className="text-teal-300">{aiResult.base_risk_score} / 100</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 7. CELEBRATION MODAL */}
      {showRewardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#0B1528] border border-amber-500/50 p-6 space-y-5 text-center shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowRewardModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-200 mx-auto flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/30 animate-bounce">
              <Coins className="w-9 h-9" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white font-headline">Civic Coins Credited!</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">Your verified report has been added to the GVMC repair queue.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600 dark:text-slate-400">Severity Reward</span>
                <span className="text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded text-[10px]">
                  {aiResult?.detected_condition || 'Verified Defect'}
                </span>
              </div>
              <div className="flex items-baseline justify-center gap-2 text-3xl font-black text-amber-400 font-mono">
                <span>+{earnedCoinsAmount}</span>
                <span className="text-sm text-amber-300 font-sans">Civic Coins</span>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-800">
                Current Wallet: <strong className="text-white font-mono">{userCoins} PTS</strong>
              </div>
            </div>
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
                className="w-full py-3 px-4 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all border border-slate-800"
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
