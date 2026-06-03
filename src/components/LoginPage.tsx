import React, { useState } from 'react';
import { Lock, Key, ArrowLeft, RefreshCw, KeyRound, UserCheck } from 'lucide-react';

interface LoginPageProps {
  onLogin: (username: string, passwordPlain: string) => Promise<boolean>;
  onBackToLanding: () => void;
}

export default function LoginPage({ onLogin, onBackToLanding }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      const isSuccess = await onLogin(username, password);
      if (!isSuccess) {
        setErrorMessage('Pengguna atau kata sandi tidak cocok. Sila semak semula.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyambung ke server. Sila cuba seketika lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Accents */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-600 rounded-full blur-[160px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500 rounded-full blur-[160px] opacity-15 pointer-events-none"></div>

      {/* Login Container Card */}
      <div className="w-full max-w-md bg-slate-900/60 border border-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl relative z-10 animate-fade-in">
        
        {/* Back Button */}
        <button 
          onClick={onBackToLanding} 
          className="absolute top-6 left-6 inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white font-semibold transition-all cursor-pointer hover:-translate-x-1 duration-250"
        >
          <ArrowLeft size={14} /> Beranda Utama
        </button>

        {/* Brand Icon & Heading */}
        <div className="text-center mt-6 mb-8">
          <div className="w-14 h-14 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto text-indigo-400 shadow-xl shadow-indigo-600/10 mb-4">
            <UserCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight uppercase">Portal Operator</h2>
          <p className="text-xs text-indigo-300 font-semibold mt-1 uppercase tracking-wider">SMP Bina Bangsa Indonesia</p>
        </div>

        {/* Error message slot */}
        {errorMessage && (
          <div className="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1.5 animate-pulse shadow-[0_0_8px_#ef4444]"></span>
            <span className="text-xs font-semibold text-red-300 leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* LoginForm */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Username Pengenal</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Lock size={14} />
              </span>
              <input 
                type="text" 
                required
                disabled={loading}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="cth: operator"
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-sm outline-none text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Kata Laluan</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <KeyRound size={14} />
              </span>
              <input 
                type="password" 
                required
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-sm outline-none text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 font-bold rounded-xl text-xs uppercase tracking-wider mt-6 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 duration-150 cursor-pointer text-white"
          >
            {loading ? (
              <>
                <RefreshCw size={14} className="animate-spin" /> Sedang Mengesahkan...
              </>
            ) : (
              'Masuk Ke Panel'
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-white/5 pt-4 text-center">
          <p className="text-[10px] text-slate-500 font-medium tracking-wide">
            Gunakan akun bawaan <code className="bg-slate-950 px-1 py-0.5 rounded text-indigo-400 font-bold">operator</code> (pass: operator123)
          </p>
        </div>

      </div>
    </div>
  );
}
