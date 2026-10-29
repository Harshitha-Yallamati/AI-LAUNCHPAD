import { useStore } from '../lib/store';
import { Copy, Check, MessageCircle, Cpu, ArrowRight, Share2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function RegistrationSuccess() {
  const { registrations, activeReferralCode } = useStore();
  const [copied, setCopied] = useState(false);

  const productionRegistration = (() => {
    try {
      return JSON.parse(sessionStorage.getItem('ai-launchpad-last-registration') ?? 'null') as { fullName: string; email: string } | null;
    } catch {
      return null;
    }
  })();

  // The most recent registration is the user's
  const latestReg = productionRegistration ?? registrations[0];
  const baseUrl = window.location.origin;
  const referralLink = activeReferralCode ? `${baseUrl}/?ref=${activeReferralCode}` : baseUrl;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `🚀 I just registered for "Build Your First AI Project in 60 Minutes" — a free online workshop! Join me: ${referralLink}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="max-w-md w-full animate-slide-up">
        {/* Success Card */}
        <div className="card text-center mb-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-status-success/10 border-2 border-status-success/40 flex items-center justify-center">
            <Check className="w-8 h-8 text-status-success" />
          </div>
          <h1 className="text-xl font-bold text-text-primary mb-2">You're In! 🎉</h1>
          <p className="text-sm text-text-secondary mb-4">
            Registration confirmed{latestReg ? ` for ${latestReg.fullName}` : ''}.
            We'll send workshop details to your email.
          </p>

          {/* Workshop Summary */}
          <div className="bg-bg-elevated rounded-md p-3 text-left mb-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary">Workshop</span>
              <span className="font-medium">Build Your First AI Project</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary">Duration</span>
              <span className="font-medium">60 Minutes</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary">Cost</span>
              <span className="text-status-success font-bold">FREE</span>
            </div>
            {latestReg && (
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">Registered Email</span>
                <span className="font-mono text-accent-cyan text-[10px]">{latestReg.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Share Card */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Share2 className="w-4 h-4 text-accent-cyan" />
            <h2 className="text-sm font-semibold">Share with Friends</h2>
          </div>
          <p className="text-xs text-text-secondary mb-4">
            Know someone who'd be interested? Share the workshop link below.
          </p>

          {/* Referral Link */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1 bg-bg-elevated border border-border rounded-md px-3 py-2 text-[11px] font-mono text-accent-cyan truncate">
              {referralLink}
            </div>
            <button onClick={handleCopy} className="btn-secondary flex items-center gap-1.5 text-xs flex-shrink-0">
              {copied ? <Check className="w-3 h-3 text-status-success" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* WhatsApp Share */}
          <button
            onClick={handleWhatsApp}
            className="w-full bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] rounded-md py-2.5 text-xs font-medium flex items-center justify-center gap-2 hover:bg-[#25D366]/20 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Share via WhatsApp
          </button>

          {activeReferralCode && (
            <p className="text-[9px] text-text-secondary mt-3 text-center font-mono">
              REFERRAL ATTRIBUTION: {activeReferralCode} // FIRST-TOUCH
            </p>
          )}
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link to="/" className="text-xs text-text-secondary hover:text-accent-cyan transition-colors inline-flex items-center gap-1">
            <Cpu className="w-3 h-3" /> Back to AI Launchpad
          </Link>
        </div>
      </div>
    </div>
  );
}
