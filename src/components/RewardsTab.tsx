'use client';

import React, { useState } from 'react';
import {
  Coins,
  Gift,
  Utensils,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  Copy,
  Clock,
  Tag,
  ArrowRight,
  X,
  ExternalLink,
} from 'lucide-react';
import { Coupon } from '@/types';
import { INITIAL_COUPONS } from '@/lib/coupons';

interface RewardsTabProps {
  userCoins: number;
  onDeductCoins: (amount: number) => boolean;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateToUpload: () => void;
}

export const RewardsTab: React.FC<RewardsTabProps> = ({
  userCoins,
  onDeductCoins,
  onShowToast,
  onNavigateToUpload,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'food' | 'clothing' | 'groceries'>('all');
  const [coupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [redeemedCoupons, setRedeemedCoupons] = useState<Array<Coupon & { redeemedAt: string }>>([]);
  const [activeRedeemedModal, setActiveRedeemedModal] = useState<Coupon | null>(null);

  const filteredCoupons = coupons.filter(
    (c) => selectedCategory === 'all' || c.category === selectedCategory
  );

  const handleRedeem = (coupon: Coupon) => {
    if (userCoins < coupon.coinCost) {
      onShowToast(`Insufficient Civic Coins! You need ${coupon.coinCost} PTS (You have ${userCoins} PTS). Report road potholes to earn more.`, 'error');
      return;
    }

    const success = onDeductCoins(coupon.coinCost);
    if (success) {
      setRedeemedCoupons((prev) => [
        { ...coupon, redeemedAt: 'Just now' },
        ...prev,
      ]);
      setActiveRedeemedModal(coupon);
      onShowToast(`Successfully redeemed ${coupon.title}!`, 'success');
    }
  };

  const copyCouponCode = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      onShowToast(`Coupon code ${code} copied to clipboard!`, 'success');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-20">
      {/* 1. TOP BALANCE & REWARDS HERO BANNER */}
      <div className="bg-gradient-to-br from-[#0B1528] via-[#102244] to-[#004D40] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-xl z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Civic Rewards Marketplace
            </span>
            <span className="text-xs text-slate-300">Vizag Smart Citizen Perks</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold font-headline leading-tight">
            Exchange Civic Coins for Food & Clothing Vouchers
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Every verified pothole and road hazard photo you submit awards +50 Civic Coins. Redeem your balance for instant discounts across popular dining and fashion outlets in Visakhapatnam.
          </p>
        </div>

        {/* Live Coin Balance Pill & Report CTA */}
        <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15 flex flex-col items-center justify-center text-center shrink-0 z-10 min-w-[210px]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
            Your Coin Balance
          </span>
          <div className="flex items-center gap-2 my-1">
            <Coins className="w-7 h-7 text-amber-400 animate-bounce" />
            <span className="text-3xl font-black text-amber-400 font-headline">
              {userCoins}
            </span>
            <span className="text-xs font-bold text-amber-200">PTS</span>
          </div>
          <button
            onClick={onNavigateToUpload}
            className="w-full mt-2 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all shadow-md active:scale-95"
          >
            + Earn More Coins
          </button>
        </div>

        {/* Glow backdrop */}
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. CATEGORY SELECTOR TABS */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-white dark:bg-[#131F37] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
            }`}
          >
            All Rewards ({coupons.length})
          </button>
          <button
            onClick={() => setSelectedCategory('food')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === 'food'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-white dark:bg-[#131F37] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Food & Dining (Swiggy, Zomato)</span>
          </button>
          <button
            onClick={() => setSelectedCategory('clothing')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === 'clothing'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-white dark:bg-[#131F37] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Clothes & Fashion (Trends, Pantaloons)</span>
          </button>
        </div>

        {redeemedCoupons.length > 0 && (
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
            {redeemedCoupons.length} Active in Wallet
          </span>
        )}
      </div>

      {/* 3. COUPONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCoupons.map((coupon) => {
          const canAfford = userCoins >= coupon.coinCost;

          return (
            <div
              key={coupon.id}
              className="bg-white dark:bg-[#131F37] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden group hover:border-amber-500/60"
            >
              <div>
                {/* Brand Banner Header */}
                <div className={`p-4 bg-gradient-to-r ${coupon.bgGradient} text-white flex items-center justify-between`}>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest bg-black/30 px-2 py-0.5 rounded">
                      {coupon.badge}
                    </span>
                    <h3 className="text-base font-extrabold font-headline mt-1">
                      {coupon.brand}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black">{coupon.discount}</span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-4 space-y-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {coupon.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {coupon.description}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Valid for {coupon.expiryDays} days after redemption</span>
                  </div>
                </div>
              </div>

              {/* Footer Redeem Action */}
              <div className="p-4 pt-0">
                <button
                  type="button"
                  onClick={() => handleRedeem(coupon)}
                  disabled={!canAfford}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
                    canAfford
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-95'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Coins className="w-4 h-4 text-amber-900" />
                  <span>
                    {canAfford ? `Redeem for ${coupon.coinCost} Coins` : `Need ${coupon.coinCost} Coins (${coupon.coinCost - userCoins} more)`}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. MY REDEEMED COUPONS WALLET (If any redeemed) */}
      {redeemedCoupons.length > 0 && (
        <div className="bg-white dark:bg-[#131F37] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Gift className="w-4 h-4 text-emerald-500" />
            My Redeemed Coupon Wallet ({redeemedCoupons.length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {redeemedCoupons.map((rc, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 flex items-center justify-between gap-3"
              >
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                    {rc.brand} • {rc.discount}
                  </span>
                  <div className="font-mono text-sm font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                    {rc.code}
                  </div>
                  <span className="text-[10px] text-slate-400">Redeemed {rc.redeemedAt}</span>
                </div>

                <button
                  onClick={() => copyCouponCode(rc.code)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. SUCCESS MODAL ON REDEMPTION */}
      {activeRedeemedModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131F37] w-full max-w-md rounded-3xl p-6 text-center border-2 border-amber-500 shadow-2xl relative animate-slide-down">
            <button
              onClick={() => setActiveRedeemedModal(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-500 mx-auto flex items-center justify-center mb-3 shadow-md">
              <Gift className="w-8 h-8 animate-bounce" />
            </div>

            <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Coupon Unlocked!
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 font-headline mt-1">
              {activeRedeemedModal.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
              Use this code during checkout on {activeRedeemedModal.brand} across Visakhapatnam.
            </p>

            {/* Promo Code Box */}
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl border-2 border-dashed border-amber-500/80 mb-5 flex items-center justify-between">
              <span className="font-mono text-lg font-black text-amber-600 dark:text-amber-400 tracking-wider">
                {activeRedeemedModal.code}
              </span>
              <button
                onClick={() => copyCouponCode(activeRedeemedModal.code)}
                className="px-3 py-1.5 rounded-xl bg-[#0B2545] hover:bg-[#1E3A8A] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </button>
            </div>

            <button
              onClick={() => setActiveRedeemedModal(null)}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md"
            >
              Done & Return to Rewards
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
