import React, { useState } from 'react';
import { Lock, User as UserIcon, ArrowRight, ShieldCheck } from 'lucide-react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  users: User[];
}

export const Login: React.FC<LoginProps> = ({ onLogin, users }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
      
      let isValid = false;
      if (user) {
         const uName = user.username.toLowerCase();
         if (uName === 'sahik' && password === 'sahik123') isValid = true;
         else if (uName === 'putimach' && password === 'putimach123') isValid = true;
         else if (uName !== 'sahik' && uName !== 'putimach' && password === '123456') isValid = true;
      }

      if (isValid && user) {
        onLogin(user);
      } else {
        setError(true);
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0f172a]">
      {/* Dynamic Aurora Background */}
      <div className="absolute top-0 left-0 w-full h-full">
         <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/20 blur-[100px] animate-pulse"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-600/20 blur-[100px] animate-pulse delay-1000"></div>
         <div className="absolute top-[40%] left-[40%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 blur-[120px] animate-pulse delay-500"></div>
      </div>

      <div className="glass-panel p-10 rounded-3xl shadow-2xl w-full max-w-sm relative z-10 border-white/10 bg-white/10 backdrop-blur-2xl">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30 transform rotate-3 ring-1 ring-white/20">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Putimach Admin</h1>
          <p className="text-blue-200 text-sm mt-2 font-medium">Secure Access Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-blue-200/80 uppercase tracking-wider ml-1">Username</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-blue-300/50 group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(false); }}
                className="block w-full pl-10 pr-4 py-3.5 border border-white/10 rounded-xl leading-5 bg-white/5 placeholder-white/20 focus:outline-none focus:bg-white/10 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all sm:text-sm text-white"
                placeholder="Enter your username"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-blue-200/80 uppercase tracking-wider ml-1">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-blue-300/50 group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                className={`block w-full pl-10 pr-4 py-3.5 border rounded-xl leading-5 bg-white/5 placeholder-white/20 focus:outline-none focus:bg-white/10 focus:ring-2 focus:ring-blue-500/50 transition-all sm:text-sm text-white ${error ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-blue-500/50'}`}
                placeholder="••••••••"
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 text-red-300 text-xs mt-3 ml-1 px-3 py-1.5 bg-red-500/10 rounded-lg border border-red-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                <span>Invalid credentials provided.</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-4 px-4 border border-white/10 rounded-xl shadow-lg shadow-blue-900/40 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {loading ? 'Authenticating...' : (
              <>
                Sign In
                <ArrowRight className="ml-2 w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};