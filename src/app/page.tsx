'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { BottomNav, TabKey } from '@/components/BottomNav';
import { Sidebar } from '@/components/Sidebar';
import { ToastContainer, ToastMessage } from '@/components/Toast';
import { ReportHazardTab } from '@/components/ReportHazardTab';
import { RewardsTab } from '@/components/RewardsTab';
import { LiveQueueTab } from '@/components/LiveQueueTab';
import { MapTab } from '@/components/MapTab';
import { DispatchTab } from '@/components/DispatchTab';
import { AboutTab } from '@/components/AboutTab';
import { HazardDetailModal } from '@/components/HazardDetailModal';
import { HazardReport, HazardStatus, UserRole } from '@/types';
import { initialHazards } from '@/lib/db';
import { getOfflineReports, registerAutoSync } from '@/lib/offlineQueue';

export default function CivicLensHome() {
  const [hazards, setHazards] = useState<HazardReport[]>(initialHazards);
  const [activeTab, setActiveTab] = useState<TabKey>('about'); // Default to About & Stats matching screenshot or user preference
  const [role, setRole] = useState<UserRole>('citizen');
  const [darkMode, setDarkMode] = useState<boolean>(true); // Match high-tech dark theme in screenshot
  const [userCoins, setUserCoins] = useState<number>(840); // 840 PTS matching screenshot
  const [language, setLanguage] = useState<'EN' | 'TEL'>('EN');
  const [selectedHazard, setSelectedHazard] = useState<HazardReport | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Apply dark class on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleToggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const handleToggleLanguage = () => {
    setLanguage((prev) => {
      const next = prev === 'EN' ? 'TEL' : 'EN';
      showToast(next === 'TEL' ? 'భాష తెలుగులోకి మార్చబడింది' : 'Language switched to English', 'info');
      return next;
    });
  };

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchHazards = useCallback(async () => {
    try {
      const res = await fetch('/api/hazards');
      if (res.ok) {
        const data = await res.json();
        if (data.hazards && data.hazards.length > 0) {
          setHazards(data.hazards);
        }
      }
    } catch (err) {
      console.warn('Using offline initial hazard dataset', err);
    }
  }, []);

  useEffect(() => {
    fetchHazards();
  }, [fetchHazards]);

  // Handle auto-sync
  useEffect(() => {
    const cleanup = registerAutoSync((count) => {
      showToast(`Connection restored: ${count} offline reports synchronized!`, 'success');
      fetchHazards();
    });
    return () => cleanup();
  }, [showToast, fetchHazards]);

  // Initialize userCoins from localStorage if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCoins = localStorage.getItem('civiclens_user_coins');
      if (savedCoins) {
        const parsed = parseInt(savedCoins, 10);
        if (!isNaN(parsed)) setUserCoins(parsed);
      }
    }
  }, []);

  // Award coins when a citizen reports a hazard (based on severity)
  const handleAwardCoins = (amount: number) => {
    setUserCoins((prev) => {
      const next = prev + amount;
      if (typeof window !== 'undefined') {
        localStorage.setItem('civiclens_user_coins', next.toString());
      }
      return next;
    });
  };

  // Deduct coins when redeeming a food or clothes coupon
  const handleDeductCoins = (amount: number): boolean => {
    if (userCoins < amount) return false;
    setUserCoins((prev) => {
      const next = prev - amount;
      if (typeof window !== 'undefined') {
        localStorage.setItem('civiclens_user_coins', next.toString());
      }
      return next;
    });
    return true;
  };

  // Batch execute dispatch orders (Actionable repair work execution)
  const handleBatchDispatch = async (ids: string[], crew: string) => {
    setHazards((prev) =>
      prev.map((h) =>
        ids.includes(h.id)
          ? {
              ...h,
              status: 'Assigned',
              assigned_crew: crew,
              activity_history: [
                {
                  id: `act-${Date.now()}-${h.id}`,
                  timestamp: 'Just now',
                  actor: 'Ward Engineer Dispatch Control',
                  action: `Municipal Work Order dispatched to ${crew}`,
                },
                ...h.activity_history,
              ],
            }
          : h
      )
    );

    ids.forEach(async (id) => {
      try {
        await fetch(`/api/hazards/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'Assigned',
            assigned_crew: crew,
            activityNote: `Municipal Work Order dispatched to ${crew}`,
            actor: 'Ward Engineer Dispatch Control',
          }),
        });
      } catch (e) {
        console.error(e);
      }
    });

    showToast(`Work order executed: ${ids.length} road hazards assigned to ${crew}!`, 'success');
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'citizen') {
      setActiveTab('upload');
      showToast('Switched to Citizen Mode (Report Hazard & Earn Coins)', 'info');
    } else {
      setActiveTab('queue');
      showToast('Switched to Ward Engineer Mode (Cluster Feed & Triage)', 'info');
    }
  };

  const handleNewReportCreated = (hazard: HazardReport, isDuplicate: boolean = false, msg: string = '') => {
    setHazards((prev) => {
      const exists = prev.findIndex((h) => h.id === hazard.id);
      if (exists >= 0) {
        const updated = [...prev];
        updated[exists] = hazard;
        return updated.sort((a, b) => b.risk_score - a.risk_score);
      }
      return [hazard, ...prev].sort((a, b) => b.risk_score - a.risk_score);
    });
  };

  const handleUpdateStatus = async (
    id: string,
    status: HazardStatus,
    note?: string,
    afterRepairPhoto?: string
  ) => {
    try {
      const res = await fetch(`/api/hazards/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          activityNote: note,
          after_repair_images: afterRepairPhoto ? [afterRepairPhoto] : undefined,
          actor: role === 'citizen' ? 'Citizen Reporter' : 'AE K. Rao (Ward 18)',
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setHazards((prev) => prev.map((h) => (h.id === id ? updated : h)));
        if (selectedHazard?.id === id) {
          setSelectedHazard(updated);
        }
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleAssignCrew = async (id: string, crew: string) => {
    try {
      const res = await fetch(`/api/hazards/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assigned_crew: crew,
          status: 'Assigned',
          activityNote: `Dispatched to ${crew}`,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setHazards((prev) => prev.map((h) => (h.id === id ? updated : h)));
        if (selectedHazard?.id === id) {
          setSelectedHazard(updated);
        }
      }
    } catch (err) {
      console.error('Failed to assign crew', err);
    }
  };

  // Clear App Data (Exact feature from screenshot)
  const handleClearAppData = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      setHazards([...initialHazards]);
      setUserCoins(840);
      showToast('Local application storage and telemetry cache cleared', 'info');
    }
  };

  // Alert Test simulator (Live telemetry influx)
  const handleTriggerAlertTest = () => {
    const target = hazards[0] || initialHazards[0];
    const previousScore = target.risk_score;
    const newScore = Math.min(99, target.risk_score + 3);

    const updatedTarget: HazardReport = {
      ...target,
      previous_risk_score: previousScore,
      risk_score: newScore,
      priority_delta: 'up',
      priority_delta_value: newScore - previousScore,
      duplicate_count: target.duplicate_count + 1,
      why_ranked_here: `${target.depth_cm}cm depth + heavy traffic + ${target.duplicate_count + 1} citizen reports (Simulated Real-time Alert)`,
      activity_history: [
        {
          id: `act-${Date.now()}`,
          timestamp: 'Just now',
          actor: 'Citizen Live Uplink',
          action: `Automated proximity update: Risk escalated ${previousScore} → ${newScore}`,
        },
        ...target.activity_history,
      ],
    };

    setHazards((prev) =>
      prev.map((h) => (h.id === target.id ? updatedTarget : h)).sort((a, b) => b.risk_score - a.risk_score)
    );

    showToast(`Alert: Incident #${target.id} escalated to Score ${newScore}! Moved up in cluster queue.`, 'info');
  };

  const queueCount = hazards.filter((h) => h.status !== 'Fixed').length;

  return (
    <div className="min-h-screen flex flex-col bg-[#070D19] dark:bg-[#070D19] text-slate-100 transition-colors">
      {/* Top Header */}
      <Header
        role={role}
        onRoleChange={handleRoleChange}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        userCoins={userCoins}
        language={language}
        onToggleLanguage={handleToggleLanguage}
        onTriggerAlertTest={handleTriggerAlertTest}
        onOpenRewards={() => setActiveTab('rewards')}
      />

      <div className="flex-1 flex w-full">
        {/* Desktop Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          queueCount={queueCount}
          userCoins={userCoins}
        />

        {/* Main Viewport */}
        <main className="flex-1 lg:pl-72 w-full p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {activeTab === 'upload' && (
            <ReportHazardTab
              onNewReportCreated={handleNewReportCreated}
              onAwardCoins={handleAwardCoins}
              onShowToast={showToast}
              onNavigateToRewards={() => setActiveTab('rewards')}
              userCoins={userCoins}
            />
          )}

          {activeTab === 'queue' && (
            <LiveQueueTab
              hazards={hazards}
              onSelectHazard={(h) => setSelectedHazard(h)}
              onRefresh={fetchHazards}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'rewards' && (
            <RewardsTab
              userCoins={userCoins}
              onDeductCoins={handleDeductCoins}
              onShowToast={showToast}
              onNavigateToUpload={() => setActiveTab('upload')}
            />
          )}

          {activeTab === 'map' && (
            <MapTab
              hazards={hazards}
              onSelectHazard={(h) => setSelectedHazard(h)}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'dispatch' && (
            <DispatchTab
              hazards={hazards}
              onSelectHazard={(h) => setSelectedHazard(h)}
              onShowToast={showToast}
              onUpdateStatus={handleUpdateStatus}
              onBatchDispatch={handleBatchDispatch}
            />
          )}

          {activeTab === 'about' && (
            <AboutTab onClearAppData={handleClearAppData} />
          )}
        </main>
      </div>

      {/* Hazard Detail Modal */}
      <HazardDetailModal
        hazard={selectedHazard}
        onClose={() => setSelectedHazard(null)}
        onUpdateStatus={handleUpdateStatus}
        onAssignCrew={handleAssignCrew}
        onShowToast={showToast}
      />

      {/* Mobile Fixed Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        queueCount={queueCount}
        userCoins={userCoins}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
