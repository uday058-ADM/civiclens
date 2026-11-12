import React, { useState } from 'react';
import { User, ShieldCheck, ArrowRight, Sparkles, Building2, Eye, EyeOff, MapPin, Phone, Mail } from 'lucide-react';

interface LoginPageProps {
  onLogin: (role: 'citizen' | 'engineer') => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [role, setRole] = useState<'citizen' | 'engineer'>('citizen');
  const [isRegistering, setIsRegistering] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(role);
  };

  return (
    <div className="min-h-screen bg-[#070D19] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/5 blur-[120px] -mr-64 -mt-64"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-500/5 blur-[120px] -ml-64 -mb-64"></div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="w-full max-w-2xl relative z-10 flex flex-col md:flex-row items-stretch gap-0 bg-[#0B1528]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden">

        {/* Left Side: Branding & Value Prop */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-slate-900 to-[#0B1528] border-r border-white/5 w-5/12">
          <div className="space-y-6">
            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center border border-white/10 shadow-xl">
              <span className="text-amber-400 font-black text-2xl tracking-tighter">▲</span>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-white tracking-[0.1em] uppercase font-headline">CIVICLENS</h1>
              <p className="text-[10px] font-bold tracking-[0.2em] text-amber-500 uppercase">Bridge to Governance</p>
            </div>
            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 shrink-0 mt-1">
                  <Sparkles className="w-3 h-3" />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">Report road hazards directly to municipal triage units with AI-verified precision.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0 mt-1">
                  <Building2 className="w-3 h-3" />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">Empower your community by creating actionable repair queues for city engineers.</p>
              </div>
            </div>
          </div>

          <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest pt-10">
            © 2024 CivicLens Smart Infrastructure
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 p-8 sm:p-10 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-black text-white uppercase tracking-wider">
              {isRegistering ? 'Create Account' : 'Portal Access'}
            </h2>
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-[10px] font-black text-amber-500 hover:text-amber-400 uppercase tracking-widest transition-colors"
            >
              {isRegistering ? 'Already have one?' : 'New Scout? Join us'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Switcher */}
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 mb-6">
              <button
                type="button"
                onClick={() => setRole('citizen')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${role === 'citizen'
                    ? 'bg-white text-slate-950 shadow-lg'
                    : 'text-slate-500 hover:text-slate-300'
                  }`}
              >
                <User className="w-3.5 h-3.5" />
                Citizen Portal
              </button>
              <button
                type="button"
                onClick={() => setRole('engineer')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${role === 'engineer'
                    ? 'bg-teal-500 text-white shadow-lg'
                    : 'text-slate-500 hover:text-slate-300'
                  }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Gov Officer
              </button>
            </div>

            <div className="space-y-3">
              {isRegistering && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="FULL NAME"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-200 outline-none focus:border-amber-500/50 transition-colors uppercase font-bold tracking-tight"
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="EMAIL ADDRESS"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-200 outline-none focus:border-amber-500/50 transition-colors uppercase font-bold tracking-tight"
                />
              </div>

              {isRegistering && (
                <>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="RESIDENTIAL ADDRESS / WARD"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-200 outline-none focus:border-amber-500/50 transition-colors uppercase font-bold tracking-tight"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="tel"
                      required
                      placeholder="CONTACT NUMBER"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-200 outline-none focus:border-amber-500/50 transition-colors uppercase font-bold tracking-tight"
                    />
                  </div>
                </>
              )}

              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-slate-500 font-black">∗</div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="PASSWORD"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-xs text-slate-200 outline-none focus:border-amber-500/50 transition-colors uppercase font-bold tracking-tight"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-4 mt-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-2xl ${role === 'citizen'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 hover:brightness-110 active:scale-[0.98]'
                  : 'bg-gradient-to-r from-teal-600 to-teal-500 text-white hover:brightness-110 active:scale-[0.98]'
                }`}
            >
              <span>{isRegistering ? 'Initialize Scout Uplink' : 'Establish Connection'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
