import React, { useState } from 'react';
import { Sparkles, Key, Check, AlertCircle, X, ExternalLink, Loader2, Eye, EyeOff, ShieldCheck, Trash2 } from 'lucide-react';

const AiKeyModalContent = ({ onClose, onKeySaved }) => {
  const [apiKey, setApiKey] = useState(() => {
    return (typeof localStorage !== 'undefined' && localStorage.getItem('budgettrip_gemini_key')) || '';
  });
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // { success: boolean, message: string }

  const handleSaveAndTest = async () => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      setTestResult({ success: false, message: 'Please enter a valid Gemini API key.' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/estimate-expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': trimmed,
        },
        body: JSON.stringify({
          isTestPing: true,
          apiKey: trimmed,
        }),
      });

      const json = await res.json();
      if (json.success) {
        localStorage.setItem('budgettrip_gemini_key', trimmed);
        setTestResult({
          success: true,
          message: 'Connected to Google Gemini 2.0 Flash successfully!',
        });
        window.dispatchEvent(new Event('budgettrip_key_updated'));
        if (onKeySaved) onKeySaved(trimmed);
      } else {
        setTestResult({
          success: false,
          message: json.error || 'Authentication failed. Please verify your API key.',
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: `Connection test error: ${err.message}`,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleClearKey = () => {
    localStorage.removeItem('budgettrip_gemini_key');
    setApiKey('');
    setTestResult({
      success: true,
      message: 'Key removed. BudgetTrip will use transparent calibrated benchmarks.',
    });
    window.dispatchEvent(new Event('budgettrip_key_updated'));
    if (onKeySaved) onKeySaved('');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-settings-title"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-elevated border border-slate-200/80 relative space-y-5 animate-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center space-x-3 pr-8">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h3 id="ai-settings-title" className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              AI Configuration & API Key
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Personalize travel calculations with Google Gemini 2.0 Flash
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-600 leading-relaxed space-y-1">
          <p className="font-semibold text-slate-800 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-secondary" />
            <span>Zero Server Exposure Required</span>
          </p>
          <p>
            You can enter your Google Gemini API key here to enable live LLM personalizations.
            If left empty, BudgetTrip operates in <strong>calibrated benchmark mode</strong> automatically.
          </p>
        </div>

        {/* Key Input */}
        <div className="space-y-1.5">
          <label htmlFor="gemini-key-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Google Gemini API Key
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Key className="w-4 h-4" />
            </div>
            <input
              id="gemini-key-input"
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary font-mono"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              aria-label={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>Free keys available at Google AI Studio</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary hover:text-primary font-semibold flex items-center gap-1 inline-flex underline"
            >
              <span>Get Free Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Test Feedback Feedback Toast */}
        {testResult && (
          <div
            role="status"
            className={`p-3 rounded-xl border text-xs flex items-start gap-2 animate-in fade-in duration-150 ${
              testResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {testResult.success ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <span className="font-medium">{testResult.message}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
          {apiKey ? (
            <button
              type="button"
              onClick={handleClearKey}
              className="px-3.5 py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Key</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAndTest}
              disabled={testing || !apiKey.trim()}
              className="px-5 py-2 bg-primary hover:bg-primary-light active:scale-95 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              {testing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <span>Save & Connect</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AiKeyModal = ({ isOpen, onClose, onKeySaved }) => {
  if (!isOpen) return null;
  return <AiKeyModalContent onClose={onClose} onKeySaved={onKeySaved} />;
};

export default AiKeyModal;
