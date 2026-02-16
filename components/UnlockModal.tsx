import React, { useState, useEffect } from 'react';
import { Lock, X, ArrowRight, ShieldAlert } from 'lucide-react';

interface UnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlock: () => void;
  title?: string;
}

export const UnlockModal: React.FC<UnlockModalProps> = ({ isOpen, onClose, onUnlock, title = "Security Verification" }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [animateShake, setAnimateShake] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCode('');
      setError(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check against the hardcoded admin secret
    if (code === 'sahikisdev99@#') {
      onUnlock();
      onClose();
    } else {
      setError(true);
      setAnimateShake(true);
      setTimeout(() => setAnimateShake(false), 500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 overflow-hidden transform transition-all ${animateShake ? 'animate-shake' : 'scale-100'}`}>
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500 mt-2">
            This section is protected. Please enter the unique admin code to continue.
          </p>
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
              Admin Code
            </label>
            <input
              type="password"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError(false);
              }}
              autoFocus
              className={`block w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                error 
                  ? 'border-red-300 bg-red-50 text-red-900 focus:ring-2 focus:ring-red-200' 
                  : 'border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
              }`}
              placeholder="Enter access code"
            />
            {error && (
              <div className="flex items-center gap-1.5 text-red-600 text-xs mt-2 font-medium ml-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Incorrect code. Please try again.</span>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!code}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Unlock <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
};