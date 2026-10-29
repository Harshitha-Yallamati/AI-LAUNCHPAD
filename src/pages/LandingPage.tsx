import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Cpu, Clock, Users, Zap, ChevronDown, ChevronUp, CheckCircle, ArrowRight,
  BookOpen, Target, Code, Sparkles, Shield,
} from 'lucide-react';
import { useStore } from '../lib/store';
import { registrationSchema } from '../lib/validation';
import { normalizeEmail, AcquisitionChannel } from '../types';
import { showToast } from '../components/ui';
import { isSupabaseConfigured, registerWorkshop, validateReferralCode } from '../lib/supabase';

const FAQ_ITEMS = [
  {
    q: 'Who is this workshop for?',
    a: 'This workshop is designed for final-year engineering students in India who are curious about AI and want hands-on experience building their first AI project.',
  },
  {
    q: 'Do I need prior AI/ML experience?',
    a: 'No! This is a beginner-friendly workshop. Basic programming knowledge is helpful but not required.',
  },
  {
    q: 'What will I build?',
    a: 'You\'ll build a working AI project from scratch during the 60-minute guided session, learning core concepts along the way.',
  },
  {
    q: 'Is it really free?',
    a: 'Yes, the workshop is completely free. No hidden charges, no credit card required.',
  },
  {
    q: 'Will I get a recording?',
    a: 'Details about recordings and materials will be shared with registered participants before the workshop.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addRegistration, setActiveReferralCode, activeReferralCode, getAmbassadorByCode, settings, isDemoMode } = useStore();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    college: '',
    branch: '',
    graduationYear: 2025,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Capture referral code from URL (first-touch attribution)
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref && !activeReferralCode) {
      if (!isDemoMode && isSupabaseConfigured) {
        void validateReferralCode(ref).then((isActive) => {
          if (isActive) setActiveReferralCode(ref);
        });
      } else {
        const ambassador = getAmbassadorByCode(ref);
        if (ambassador && ambassador.isActive) setActiveReferralCode(ref);
      }
    }
  }, [searchParams, activeReferralCode, getAmbassadorByCode, setActiveReferralCode, isDemoMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = registrationSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    // Determine acquisition channel
    let channel: AcquisitionChannel = 'Direct Outreach';
    const utmSource = searchParams.get('utm_source');
    const utmMedium = searchParams.get('utm_medium');

    if (activeReferralCode) {
      channel = 'Student Ambassadors';
    } else if (utmSource || utmMedium) {
      if (utmMedium === 'community' || utmSource?.includes('community')) {
        channel = 'College Communities';
      } else {
        channel = 'Direct Outreach';
      }
    }

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800));

    const registrationInput = {
      fullName: form.fullName,
      email: normalizeEmail(form.email),
      college: form.college,
      branch: form.branch,
      graduationYear: form.graduationYear,
      acquisitionChannel: channel,
      referralCode: activeReferralCode,
      attributionSource: activeReferralCode ? `ambassador:${activeReferralCode}` : channel.toLowerCase().replace(/\s/g, '_'),
      utmSource: utmSource,
      utmMedium: utmMedium,
      utmCampaign: searchParams.get('utm_campaign'),
    };

    const regResult = !isDemoMode && isSupabaseConfigured
      ? await registerWorkshop(registrationInput).then((result) => {
          if (result.success) sessionStorage.setItem('ai-launchpad-last-registration', JSON.stringify({ fullName: form.fullName, email: normalizeEmail(form.email) }));
          return result;
        })
      : addRegistration(registrationInput);

    setLoading(false);

    if (regResult.success) {
      showToast('success', 'Registration successful! Welcome aboard.');
      navigate('/registration-success');
    } else {
      setErrors({ email: regResult.error ?? 'Registration failed. Please try again.' });
      showToast('error', regResult.error ?? 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Nav Bar */}
      <nav className="border-b border-border bg-bg-sidebar/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center">
              <Cpu className="w-3.5 h-3.5 text-accent-cyan" />
            </div>
            <span className="text-sm font-bold">AI LAUNCHPAD</span>
          </div>
          <a href="#register" className="btn-primary text-xs">Register Now →</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-accent-cyan/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-accent-teal/5 rounded-full blur-3xl" />

        <div className="max-w-6xl mx-auto px-4 py-20 lg:py-28 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="badge-cyan mb-6 text-[10px] inline-flex">FREE ONLINE WORKSHOP</div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-text-primary leading-tight mb-6">
              Your First AI Project{' '}
              <span className="text-gradient-cyan">Starts Here.</span>
            </h1>
            <p className="text-base md:text-lg text-text-secondary max-w-xl mx-auto mb-8 leading-relaxed">
              Explore AI by building your first project in a guided, beginner-friendly online workshop.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Clock className="w-4 h-4 text-accent-cyan" />
                60 Minutes
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Users className="w-4 h-4 text-accent-cyan" />
                Beginner Friendly
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Zap className="w-4 h-4 text-accent-cyan" />
                Hands-on
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Shield className="w-4 h-4 text-accent-cyan" />
                Free
              </div>
            </div>
            <a href="#register" className="btn-primary text-sm px-8 py-3 inline-flex items-center gap-2">
              Register for Free <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* What You'll Learn */}
      <section className="py-16 border-t border-border">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-xl font-bold text-center mb-2">What You'll Explore</h2>
          <p className="text-sm text-text-secondary text-center mb-10 max-w-md mx-auto">
            A guided, hands-on introduction to building with AI
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: BookOpen, title: 'AI Fundamentals', desc: 'Understand core AI concepts and how they apply to real projects.' },
              { icon: Code, title: 'Build & Experiment', desc: 'Write code and build a working AI project step by step.' },
              { icon: Sparkles, title: 'Practical Skills', desc: 'Learn techniques you can apply to your own ideas and coursework.' },
            ].map((item, i) => (
              <div key={i} className="card group hover:border-accent-cyan/30 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center mb-3 group-hover:shadow-glow-sm transition-shadow">
                  <item.icon className="w-5 h-5 text-accent-cyan" />
                </div>
                <h3 className="text-sm font-semibold mb-1">{item.title}</h3>
                <p className="text-xs text-text-secondary leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Should Attend */}
      <section className="py-16 bg-bg-card/50 border-t border-border">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-xl font-bold text-center mb-2">Who Is This For?</h2>
          <p className="text-sm text-text-secondary text-center mb-8">
            Designed specifically for engineering students ready to explore AI
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl mx-auto">
            {[
              'Final-year engineering students',
              'Students curious about AI/ML',
              'Beginners with basic programming',
              'Anyone wanting hands-on AI experience',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 card text-xs">
                <Target className="w-4 h-4 text-accent-teal flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workshop Details */}
      <section className="py-16 border-t border-border">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="card">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent-cyan" />
                Workshop Details
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-border/50">
                  <span className="text-text-secondary">Duration</span>
                  <span className="font-medium">60 Minutes</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/50">
                  <span className="text-text-secondary">Mode</span>
                  <span className="font-medium">Online (Live)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/50">
                  <span className="text-text-secondary">Date</span>
                  <span className="font-mono text-accent-cyan">{settings.workshopDate || 'TBA'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/50">
                  <span className="text-text-secondary">Time</span>
                  <span className="font-mono text-accent-cyan">{settings.workshopTime || 'TBA'} IST</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-text-secondary">Cost</span>
                  <span className="font-bold text-status-success">FREE</span>
                </div>
              </div>
            </div>
            <div className="card">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent-teal" />
                Prerequisites
              </h3>
              <ul className="space-y-2 text-xs text-text-secondary">
                {[
                  'A laptop or computer with internet access',
                  'Basic understanding of any programming language',
                  'Curiosity and willingness to experiment',
                  'No prior AI/ML knowledge required',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-status-success mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section id="register" className="py-16 bg-bg-card/50 border-t border-border">
        <div className="max-w-lg mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold mb-2">Register for the Workshop</h2>
            <p className="text-sm text-text-secondary">
              Secure your spot — it's free and takes 30 seconds.
            </p>
            {activeReferralCode && (
              <div className="badge-teal mt-3 text-[10px]">
                Referred by ambassador: {activeReferralCode}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="card space-y-4">
            {/* Full Name */}
            <div>
              <label className="section-label text-[10px] block mb-1.5">Full Name</label>
              <input
                type="text"
                className={`input-field ${errors.fullName ? 'border-status-danger' : ''}`}
                placeholder="e.g. Rohan Sharma"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
              {errors.fullName && <p className="text-[10px] text-status-danger mt-1">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="section-label text-[10px] block mb-1.5">Email Address</label>
              <input
                type="email"
                className={`input-field ${errors.email ? 'border-status-danger' : ''}`}
                placeholder="e.g. rohan.sharma@college.ac.in"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              {errors.email && <p className="text-[10px] text-status-danger mt-1">{errors.email}</p>}
            </div>

            {/* College */}
            <div>
              <label className="section-label text-[10px] block mb-1.5">College Name</label>
              <input
                type="text"
                className={`input-field ${errors.college ? 'border-status-danger' : ''}`}
                placeholder="e.g. VIT Vellore"
                value={form.college}
                onChange={(e) => setForm({ ...form, college: e.target.value })}
              />
              {errors.college && <p className="text-[10px] text-status-danger mt-1">{errors.college}</p>}
            </div>

            {/* Branch */}
            <div>
              <label className="section-label text-[10px] block mb-1.5">Engineering Branch</label>
              <input
                type="text"
                className={`input-field ${errors.branch ? 'border-status-danger' : ''}`}
                placeholder="e.g. Computer Science & Eng"
                value={form.branch}
                onChange={(e) => setForm({ ...form, branch: e.target.value })}
              />
              {errors.branch && <p className="text-[10px] text-status-danger mt-1">{errors.branch}</p>}
            </div>

            {/* Graduation Year */}
            <div>
              <label className="section-label text-[10px] block mb-1.5">Graduation Year</label>
              <select
                className={`select-field ${errors.graduationYear ? 'border-status-danger' : ''}`}
                value={form.graduationYear}
                onChange={(e) => setForm({ ...form, graduationYear: parseInt(e.target.value) })}
              >
                {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              {errors.graduationYear && (
                <p className="text-[10px] text-status-danger mt-1">{errors.graduationYear}</p>
              )}
            </div>

            {/* Privacy */}
            <p className="text-[9px] text-text-secondary leading-relaxed">
              By registering, you consent to receive workshop-related communications. Your information is stored securely and will not be shared with third parties.
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-bg-primary/30 border-t-bg-primary rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>Register for Free <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 border-t border-border">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="card cursor-pointer" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">{item.q}</h3>
                  {openFaq === i ? (
                    <ChevronUp className="w-4 h-4 text-text-secondary" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-text-secondary" />
                  )}
                </div>
                {openFaq === i && (
                  <p className="text-xs text-text-secondary mt-3 leading-relaxed animate-fade-in">{item.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-bg-sidebar">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Cpu className="w-4 h-4 text-accent-cyan" />
            <span className="text-sm font-bold">AI Project Launchpad</span>
          </div>
          <p className="text-[10px] text-text-secondary font-mono">
            Growth Engine // NxtWave Growth Intern Challenge
          </p>
        </div>
      </footer>
    </div>
  );
}
