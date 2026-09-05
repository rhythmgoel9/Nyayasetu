import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Search, Sparkles, AlertTriangle, FileSearch,
  Users, Shield, Building2, Scale, Share2, Bell, Mic, Lock,
  ClipboardList, CheckCircle, UserPlus, Send, Eye, ChevronRight,
  ChevronLeft, Play, Globe, Zap, TrendingUp, MapPin, BarChart3,
  MessageSquare, Phone, Award, ArrowUpRight, MousePointerClick, Cpu, FileText
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import IndiaMap from '../components/shared/IndiaMap';

/* ─── Animated Counter Hook ─── */
function useCounter(end, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(!startOnView);
  const ref = useRef(null);

  useEffect(() => {
    if (!startOnView) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [startOnView]);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [started, end, duration]);

  return { count, ref };
}

/* ─── Scroll Reveal Hook ─── */
function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ─── Typing Effect Component ─── */
function TypingText({ texts, speed = 80, pause = 2000 }) {
  const [currentText, setCurrentText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = texts[textIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setCurrentText(current.substring(0, charIndex + 1));
        if (charIndex + 1 === current.length) {
          setTimeout(() => setIsDeleting(true), pause);
        } else {
          setCharIndex(c => c + 1);
        }
      } else {
        setCurrentText(current.substring(0, charIndex - 1));
        if (charIndex - 1 === 0) {
          setIsDeleting(false);
          setTextIndex((textIndex + 1) % texts.length);
          setCharIndex(0);
        } else {
          setCharIndex(c => c - 1);
        }
      }
    }, isDeleting ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, textIndex, texts, speed, pause]);

  return (
    <span className="text-fuchsia-700 font-medium">
      {currentText}
      <span className="animate-pulse text-fuchsia-500 ml-0.5">|</span>
    </span>
  );
}

import HeroCarousel from '../components/shared/HeroCarousel';

/* ─── Main Landing ─── */
export default function Landing() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('citizens');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [activeFeature, setActiveFeature] = useState(0);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const searchRef = useRef(null);

  // Scroll reveal for sections
  const heroReveal = useScrollReveal(0.1);
  const cardsReveal = useScrollReveal();
  const rolesReveal = useScrollReveal();
  const featuresReveal = useScrollReveal();
  const statsReveal = useScrollReveal();
  const howReveal = useScrollReveal();
  const servicesReveal = useScrollReveal();
  const mapReveal = useScrollReveal();
  const ctaReveal = useScrollReveal();

  // Animated counters
  const cases = useCounter(74523, 2500);
  const users = useCounter(12, 2000);
  const resolution = useCounter(68, 2000);
  const agencies = useCounter(847, 2000);

  // Search suggestions
  const allSuggestions = [
    {
      q: 'How do I file an FIR online?',
      a: 'Register or login as a citizen, then click on "File FIR" in your dashboard to securely log an e-FIR.',
      link: '/citizen/log-fir'
    },
    {
      q: 'How to track my case status?',
      a: 'Enter your Case ID or FIR Number in the "Track Case" section of your dashboard for real-time updates.',
      link: '/citizen/view-firs'
    },
    {
      q: 'How to report a cyber crime?',
      a: 'Use the dedicated National Cyber Crime Reporting portal or file an e-FIR directly here on Nyaya Setu.',
      link: '/citizen/log-fir'
    },
    {
      q: 'How can I download a copy of my FIR?',
      a: 'Go to your dashboard, view your tracked cases, and click the download icon next to the registered FIR.',
      link: '/citizen/view-firs'
    },
    {
      q: 'Are my details safe when filing a complaint?',
      a: 'Yes. All data is encrypted with AES-256 and stored securely. You can also file complaints anonymously.',
      link: '/citizen/log-fir'
    },
    {
      q: 'How to find the nearest police station?',
      a: 'Allow location access or search your PIN code in the "Find Station" directory to locate nearby jurisdictions.',
      link: '/'
    },
    {
      q: 'How to check my court hearing date?',
      a: 'Link your case to e-Courts in the dashboard to receive automated SMS and portal notifications for hearings.',
      link: '/citizen'
    }
  ];

  const suggestions = allSuggestions.filter(s => 
    searchQuery ? (s.q.toLowerCase().includes(searchQuery.toLowerCase()) || s.a.toLowerCase().includes(searchQuery.toLowerCase())) : true
  );

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Auto-rotate features
  useEffect(() => {
    const timer = setInterval(() => setActiveFeature(f => (f + 1) % 6), 4000);
    return () => clearInterval(timer);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => setTestimonialIdx(i => (i + 1) % testimonials.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const typingTexts = [
    'File an FIR online',
    'Track your case in real-time',
    'Report cyber crime',
    'Access court documents',
    'Find nearest police station',
  ];

  const roles = [
    { key: 'citizen', icon: Users, color: 'from-saffron/10 to-saffron/5', iconBg: 'from-saffron to-saffron-700', link: '/register/citizen', stat: '10M+', statLabel: 'Citizens' },
    { key: 'police', icon: Shield, color: 'from-navy/10 to-navy/5', iconBg: 'from-navy to-navy-700', link: '/register/officer', stat: '50K+', statLabel: 'Officers' },
    { key: 'agency', icon: Building2, color: 'from-forest/10 to-forest/5', iconBg: 'from-forest to-forest-700', link: '/register/officer', stat: '120+', statLabel: 'Agencies' },
    { key: 'court', icon: Scale, color: 'from-[#7c3aed]/10 to-[#7c3aed]/5', iconBg: 'from-[#7c3aed] to-[#6d28d9]', link: '/register/officer', stat: '680+', statLabel: 'Courts' },
  ];

  const features = [
    { icon: ClipboardList, titleKey: 'feature.tracking', descKey: 'feature.trackingDesc', color: 'text-navy', bg: 'bg-navy/5', img: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=250&fit=crop' },
    { icon: Share2, titleKey: 'feature.sharing', descKey: 'feature.sharingDesc', color: 'text-forest', bg: 'bg-forest/5', img: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=250&fit=crop' },
    { icon: Bell, titleKey: 'feature.alerts', descKey: 'feature.alertsDesc', color: 'text-saffron', bg: 'bg-saffron/5', img: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=250&fit=crop' },
    { icon: Mic, titleKey: 'feature.voice', descKey: 'feature.voiceDesc', color: 'text-[#7c3aed]', bg: 'bg-[#7c3aed]/5', img: 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=400&h=250&fit=crop' },
    { icon: Lock, titleKey: 'feature.vault', descKey: 'feature.vaultDesc', color: 'text-alert', bg: 'bg-alert/5', img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=250&fit=crop' },
    { icon: Eye, titleKey: 'feature.audit', descKey: 'feature.auditDesc', color: 'text-navy-700', bg: 'bg-navy-700/5', img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=250&fit=crop' },
  ];

  const steps = [
    { icon: UserPlus, num: '01', titleKey: 'howItWorks.step1', descKey: 'howItWorks.step1Desc', color: 'from-saffron to-saffron-700' },
    { icon: Send, num: '02', titleKey: 'howItWorks.step2', descKey: 'howItWorks.step2Desc', color: 'from-navy to-navy-700' },
    { icon: Lock, num: '03', titleKey: 'howItWorks.step3', descKey: 'howItWorks.step3Desc', color: 'from-forest to-forest-700' },
    { icon: CheckCircle, num: '04', titleKey: 'howItWorks.step4', descKey: 'howItWorks.step4Desc', color: 'from-[#7c3aed] to-[#6d28d9]' },
  ];

  const citizenServices = [
    { title: 'File FIR Online', desc: 'Register complaints from anywhere', icon: ClipboardList, img: 'https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=300&h=200&fit=crop', link: '/citizen/log-fir' },
    { title: 'Track Case Status', desc: 'Real-time updates on your case', icon: Search, img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300&h=200&fit=crop', link: '/citizen/view-firs' },
    { title: 'Court Hearings', desc: 'Check hearing dates & orders', icon: Scale, img: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=300&h=200&fit=crop', link: '/court/proceedings' },
    { title: 'Evidence Upload', desc: 'Secure encrypted evidence vault', icon: Lock, img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=300&h=200&fit=crop', link: '/citizen/log-fir' },
    { title: 'Legal Aid', desc: 'Find free legal assistance near you', icon: Users, img: 'https://images.unsplash.com/photo-1521791055366-0d553872125f?w=300&h=200&fit=crop', link: '#' },
  ];

  const officerServices = [
    { title: 'Smart Case Search', desc: 'AI-powered criminal database', icon: Search, img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop', link: '/officer/search' },
    { title: 'Cross-Agency Share', desc: 'Secure inter-department data', icon: Share2, img: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=300&h=200&fit=crop', link: '/officer/sharing' },
    { title: 'Evidence Vault', desc: 'Encrypted digital evidence chain', icon: Shield, img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=300&h=200&fit=crop', link: '/officer/upload' },
    { title: 'Department Chat', desc: 'Secure internal communication', icon: MessageSquare, img: 'https://images.unsplash.com/photo-1552581234-26160f608093?w=300&h=200&fit=crop', link: '/officer/chat' },
    { title: 'Audit Logs', desc: 'Complete activity transparency', icon: Eye, img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop', link: '/officer/audit' },
  ];

  const testimonials = [
    { name: 'Anita Sharma', role: 'Citizen, Delhi', text: 'Filed my FIR online in 10 minutes. The voice input feature in Hindi made it incredibly easy. Got real-time updates on my phone.', avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964ac31?w=80&h=80&fit=crop&crop=face' },
    { name: 'Inspector Rajesh Kumar', role: 'Delhi Police', text: 'Cross-agency data sharing has reduced case resolution time by 40%. The encrypted evidence vault gives us complete chain-of-custody confidence.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face' },
    { name: 'Justice Meera Desai', role: 'Delhi High Court', text: 'Having all case documents digitally available with complete audit trails has significantly improved court efficiency and transparency.', avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&crop=face' },
  ];

  const tickerItems = [
    '🔒 End-to-end encrypted platform',
    '📱 10M+ citizens registered',
    '⚡ Average FIR filing: 8 minutes',
    '🏛️ 680+ courts connected',
    '📊 68% case resolution rate',
    '🌐 Available in 22 languages',
    '🔍 AI-powered case matching',
    '📋 847 agencies integrated',
  ];

  const activeServices = activeTab === 'citizens' ? citizenServices : officerServices;

  return (
    <div className="min-h-screen bg-cream overflow-hidden">
      
      {/* ═══════════ HERO CAROUSEL MOVED BELOW HERO SECTION ═══════════ */}

      {/* ═══════════ HERO SECTION — Neon Glassmorphic LED ═══════════ */}
      <section ref={heroReveal.ref} className="relative min-h-[92vh] flex items-center overflow-hidden bg-gradient-to-br from-fuchsia-100 via-pink-100 to-violet-100">
        {/* Animated LED Glows */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />
          
          {/* LED Orbs with strong glows */}
          <div className="absolute w-[800px] h-[800px] bg-fuchsia-600/30 rounded-full blur-[120px] top-[-20%] left-[-10%] animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute w-[600px] h-[600px] bg-purple-600/30 rounded-full blur-[100px] bottom-[-10%] right-[-5%]" style={{ animation: 'pulse 6s infinite alternate' }} />
          <div className="absolute w-[400px] h-[400px] bg-pink-500/20 rounded-full blur-[80px] top-[30%] right-[20%]" style={{ animation: 'pulse 5s infinite alternate-reverse' }} />
          <div className="absolute w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[100px] bottom-[20%] left-[15%]" style={{ animation: 'pulse 7s infinite alternate' }} />

          {/* LED Grid Lines */}
          <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255, 0, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 0, 255, 0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

          {/* Floating Neon particles */}
          <div className="absolute top-[20%] left-[10%] w-2 h-2 rounded-full bg-fuchsia-400 shadow-[0_0_15px_rgba(232,121,249,1)] float-slow" />
          <div className="absolute top-[30%] right-[15%] w-3 h-3 rounded-full bg-purple-400 shadow-[0_0_20px_rgba(192,132,252,1)] float-medium" />
          <div className="absolute bottom-[25%] left-[20%] w-1.5 h-1.5 rounded-full bg-pink-400 shadow-[0_0_10px_rgba(244,114,182,1)] float-fast" />
          <div className="absolute top-[60%] right-[10%] w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,1)] float-slow" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left content */}
            <div className={`${heroReveal.visible ? 'fade-in-up' : 'opacity-0'}`}>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-md bg-white/40 border border-white/60 mb-6 text-xs font-medium text-fuchsia-800 shadow-sm">
                <div className="flex gap-0 w-8 h-1 rounded-full overflow-hidden">
                  <div className="flex-1 bg-fuchsia-400 shadow-[0_0_10px_#d946ef]" />
                  <div className="flex-1 bg-purple-400 shadow-[0_0_10px_#a855f7]" />
                  <div className="flex-1 bg-pink-400 shadow-[0_0_10px_#ec4899]" />
                </div>
                Government of India Digital Initiative
                <Sparkles className="w-3 h-3 text-pink-500" />
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-charcoal leading-[1.1] tracking-tight mb-4 drop-shadow-sm animate-popup">
                <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-pink-500">न्याय</span>{' '}
                <span>सेतु</span>
                <br />
                <span className="text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold animate-text-gradient bg-gradient-to-r from-purple-700 via-fuchsia-700 to-pink-600 bg-clip-text text-transparent inline-block pb-1">
                  {t('hero.title')}
                </span>
              </h1>

              <p className="text-base sm:text-lg text-charcoal-muted leading-relaxed mb-3 max-w-lg font-medium">
                {t('hero.subtitle')}
              </p>

              {/* Typing effect */}
              <p className="text-sm mb-8 h-6 font-medium">
                <span className="text-charcoal-muted">Try: </span>
                <TypingText texts={typingTexts} />
              </p>

              {/* Search Bar with interactive suggestions */}
              <div ref={searchRef} className="relative mb-8 max-w-xl">
                <div className="relative">
                  <div className="backdrop-blur-xl bg-white/60 border border-white/60 flex items-center px-2 py-1 !rounded-2xl shadow-lg ring-1 ring-black/5">
                    <div className="pl-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-fuchsia-600" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); setSelectedAnswer(null); }}
                      onFocus={() => setShowSuggestions(true)}
                      placeholder={t('hero.search')}
                      className="flex-1 py-3.5 px-3 text-sm text-charcoal placeholder-charcoal-muted/70 bg-transparent outline-none font-medium"
                      aria-label="Search for services"
                    />
                    <button className="m-1 px-5 py-3 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2 shadow-[0_0_20px_rgba(192,132,252,0.4)] hover:shadow-[0_0_25px_rgba(217,70,239,0.6)]">
                      <Search className="w-4 h-4" />
                      <span className="hidden sm:inline">{t('hero.searchBtn')}</span>
                    </button>
                  </div>

                  {/* Interactive suggestions dropdown */}
                  {showSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-2 backdrop-blur-xl bg-white/95 border border-purple-200 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto">
                      <div className="p-2">
                        <p className="px-3 py-2 text-[10px] font-bold text-fuchsia-600 uppercase tracking-wider bg-fuchsia-50/50 rounded-t-xl mb-1">Frequently Asked Questions</p>
                        {suggestions.length > 0 ? suggestions.slice(0, 5).map((s, i) => (
                          <div
                            key={i}
                            className="w-full flex flex-col gap-1.5 px-3 py-3 border-b border-fuchsia-100 last:border-0 hover:bg-fuchsia-50 transition-colors text-left group cursor-pointer rounded-xl"
                            onClick={() => { setSearchQuery(s.q); setShowSuggestions(false); setSelectedAnswer(s); }}
                          >
                            <div className="flex items-start gap-3">
                              <Search className="w-4 h-4 text-fuchsia-400 group-hover:text-fuchsia-600 transition-colors flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <span className="text-sm text-charcoal group-hover:text-fuchsia-900 transition-colors font-bold block">{s.q}</span>
                                <span className="text-xs text-charcoal-muted group-hover:text-charcoal transition-colors leading-relaxed block mt-1 line-clamp-1">{s.a}</span>
                              </div>
                              <ArrowRight className="w-4 h-4 text-transparent group-hover:text-fuchsia-500 flex-shrink-0 transition-all opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0" />
                            </div>
                          </div>
                        )) : (
                          <p className="px-3 py-6 text-sm font-medium text-charcoal-muted text-center">No matching questions found.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary Answer Box */}
              {selectedAnswer && (
                <div className="mb-8 max-w-xl bg-white/95 backdrop-blur-md border border-fuchsia-200 rounded-2xl p-5 shadow-lg animate-scale-in z-40 relative">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-fuchsia-100 border border-fuchsia-200 flex items-center justify-center flex-shrink-0 shadow-inner">
                      <Sparkles className="w-5 h-5 text-fuchsia-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-fuchsia-900 mb-2">{selectedAnswer.q}</h4>
                      <p className="text-sm text-charcoal leading-relaxed font-medium">{selectedAnswer.a}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick action pills */}
              <div className="flex flex-wrap gap-2">
                {['File FIR', 'Track Case', 'Report Cyber Crime', 'Find Station'].map((label, index) => (
                  <button key={label} className={`px-4 py-2 rounded-full text-xs font-semibold backdrop-blur-md bg-white/40 border border-white/60 text-fuchsia-800 hover:text-fuchsia-900 hover:bg-white/60 hover:border-fuchsia-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:scale-105 animate-popup`} style={{ animationDelay: `${index * 0.15 + 0.3}s` }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right — Dashboard preview / hero image */}
            <div className={`hidden lg:block ${heroReveal.visible ? 'fade-in-up fade-in-up-delay-2' : 'opacity-0'}`}>
              <div className="relative">
                {/* Floating glass cards showing platform previews */}
                <div className="relative w-full aspect-square max-w-md mx-auto">
                  {/* Main dashboard card */}
                  <div className="absolute inset-4 backdrop-blur-xl bg-white/30 border border-white/50 !rounded-3xl overflow-hidden shadow-2xl group animate-float-rotate">
                    <img
                      src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&h=600&fit=crop"
                      alt="Justice system illustration"
                      className="w-full h-full object-cover opacity-90 mix-blend-overlay group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-fuchsia-900/80 via-purple-900/20 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-300/30 to-purple-300/30 mix-blend-overlay" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-white text-sm font-semibold drop-shadow-md">Digital Justice for Every Citizen</p>
                      <p className="text-fuchsia-100 text-xs font-medium">Secure · Transparent · Accessible</p>
                    </div>
                  </div>

                  {/* Floating stat cards */}
                  <div className="absolute -top-2 -right-2 backdrop-blur-xl bg-white/70 border border-white/60 !rounded-2xl p-3 shadow-lg float-slow z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-fuchsia-100 flex items-center justify-center border border-fuchsia-200">
                        <CheckCircle className="w-4 h-4 text-fuchsia-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-charcoal">68%</p>
                        <p className="text-[9px] text-charcoal-muted font-medium">Resolution Rate</p>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -bottom-2 -left-2 backdrop-blur-xl bg-white/70 border border-white/60 !rounded-2xl p-3 shadow-lg float-medium z-10" style={{ animationDelay: '1s' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center border border-pink-200">
                        <Zap className="w-4 h-4 text-pink-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-charcoal">8 min</p>
                        <p className="text-[9px] text-charcoal-muted font-medium">Avg FIR Time</p>
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-[40%] -left-6 backdrop-blur-xl bg-white/70 border border-white/60 !rounded-2xl p-3 shadow-lg float-fast z-10" style={{ animationDelay: '2s' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center border border-purple-200">
                        <Shield className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-charcoal">AES-256</p>
                        <p className="text-[9px] text-charcoal-muted font-medium">Encryption</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ HERO CAROUSEL (UIDAI STYLE) ═══════════ */}
      <HeroCarousel />

      {/* ═══════════ LIVE TICKER ═══════════ */}
      <div className="bg-navy py-2.5 overflow-hidden">
        <div className="flex ticker-scroll" style={{ width: 'max-content' }}>
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="text-xs text-white/80 font-medium whitespace-nowrap mx-6">{item}</span>
          ))}
        </div>
      </div>

      {/* ═══════════ TWO-CARD SPLIT (ACSC-style with glass) ═══════════ */}
      <section ref={cardsReveal.ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10" id="citizens">
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${cardsReveal.visible ? 'fade-in-up' : 'opacity-0'}`}>
          {/* Emergency Card */}
          <Link
            to="/citizen/log-fir"
            className="group relative overflow-hidden rounded-3xl glass-card border-l-4 border-l-alert p-7 sm:p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-alert/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-start justify-between mb-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-alert to-alert-600 flex items-center justify-center shadow-lg shadow-alert/20 group-hover:scale-110 transition-transform duration-300">
                  <AlertTriangle className="w-7 h-7 text-white" />
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-alert/10 text-alert text-xs font-bold shimmer">
                  {t('action.emergency')}
                </span>
              </div>
              <h2 className="text-xl font-bold text-charcoal mb-2 group-hover:text-alert transition-colors">{t('action.fileFIR')}</h2>
              <p className="text-sm text-charcoal-muted leading-relaxed mb-6">{t('action.fileFIRDesc')}</p>
              <div className="flex items-center gap-2 text-alert font-semibold text-sm group-hover:gap-3 transition-all">
                <span>File Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Track Card */}
          <Link
            to="/citizen/view-firs"
            className="group relative overflow-hidden rounded-3xl glass-card border-l-4 border-l-navy p-7 sm:p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-navy/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-start justify-between mb-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-navy to-navy-700 flex items-center justify-center shadow-lg shadow-navy/20 group-hover:scale-110 transition-transform duration-300">
                  <FileSearch className="w-7 h-7 text-white" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-charcoal mb-2 group-hover:text-navy transition-colors">{t('action.trackCase')}</h2>
              <p className="text-sm text-charcoal-muted leading-relaxed mb-6">{t('action.trackCaseDesc')}</p>
              {/* Interactive case ID input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter Case ID / Tracking No."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-navy/10 bg-white/80 text-sm placeholder-charcoal-muted/50 outline-none focus:border-navy/30 focus:ring-2 focus:ring-navy/10 transition-all"
                  onClick={(e) => e.preventDefault()}
                />
                <button className="px-4 py-2.5 rounded-xl bg-navy text-white text-sm font-medium hover:bg-navy-700 transition-colors">
                  Track
                </button>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ═══════════ ANIMATED STATS ═══════════ */}
      <section ref={statsReveal.ref} className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${statsReveal.visible ? 'fade-in-up' : 'opacity-0'}`}>
            {[
              { ref: cases.ref, value: cases.count.toLocaleString(), suffix: '+', label: 'Cases Tracked', icon: BarChart3, color: 'text-navy', iconBg: 'bg-navy/10' },
              { ref: users.ref, value: users.count, suffix: 'M+', label: 'Citizens Registered', icon: Users, color: 'text-saffron', iconBg: 'bg-saffron/10' },
              { ref: resolution.ref, value: resolution.count, suffix: '%', label: 'Resolution Rate', icon: TrendingUp, color: 'text-forest', iconBg: 'bg-forest/10' },
              { ref: agencies.ref, value: agencies.count, suffix: '+', label: 'Agencies Connected', icon: Building2, color: 'text-[#7c3aed]', iconBg: 'bg-[#7c3aed]/10' },
            ].map(({ ref, value, suffix, label, icon: Icon, color, iconBg }, i) => (
              <div key={label} ref={ref} className="glass-card p-5 sm:p-6 text-center group cursor-default" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <p className={`text-3xl sm:text-4xl font-bold ${color} stat-glow`}>
                  {value}{suffix}
                </p>
                <p className="text-xs text-charcoal-muted mt-1 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ ROLE SELECTION (Aadhaar pill-icon) ═══════════ */}
      <section ref={rolesReveal.ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" id="roles">
        <div className={`text-center mb-10 ${rolesReveal.visible ? 'fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-charcoal mb-3">{t('roles.title')}</h2>
          <p className="text-charcoal-muted">{t('roles.subtitle')}</p>
        </div>
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto ${rolesReveal.visible ? 'fade-in-up fade-in-up-delay-1' : 'opacity-0'}`}>
          {roles.map(({ key, icon: Icon, color, iconBg, link, stat, statLabel }, i) => (
            <Link
              key={key}
              to={link}
              className="group glass-card p-6 text-center cursor-pointer"
              aria-label={t(`roles.${key}`)}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${iconBg} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-sm font-bold text-charcoal mb-1">{t(`roles.${key}`)}</h3>
              <p className="text-xs text-charcoal-muted leading-relaxed mb-3">{t(`roles.${key}Desc`)}</p>
              <div className="pt-3 border-t border-navy/5">
                <p className="text-lg font-bold text-navy">{stat}</p>
                <p className="text-[10px] text-charcoal-muted">{statLabel}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════ SERVICES TAB SECTION (Diia-style Citizens/Officers toggle) ═══════════ */}
      <section ref={servicesReveal.ref} className="py-16 bg-white" id="services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-8 ${servicesReveal.visible ? 'fade-in-up' : 'opacity-0'}`}>
            <h2 className="text-3xl sm:text-4xl font-bold text-charcoal mb-3">Explore Our Services</h2>
            <p className="text-charcoal-muted mb-6">Discover what Nyaya Setu can do for you</p>

            {/* Tab Toggle */}
            <div className="inline-flex items-center p-1 rounded-2xl bg-cream border border-navy/10">
              <button
                onClick={() => setActiveTab('citizens')}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === 'citizens'
                    ? 'bg-navy text-white shadow-md shadow-navy/20'
                    : 'text-charcoal-muted hover:text-charcoal'
                }`}
              >
                <Users className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                For Citizens
              </button>
              <button
                onClick={() => setActiveTab('officers')}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === 'officers'
                    ? 'bg-navy text-white shadow-md shadow-navy/20'
                    : 'text-charcoal-muted hover:text-charcoal'
                }`}
              >
                <Shield className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                For Officers
              </button>
            </div>
          </div>

          {/* Horizontal scrolling service cards */}
          <div className={`${servicesReveal.visible ? 'fade-in-up fade-in-up-delay-2' : 'opacity-0'}`}>
            <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
              {activeServices.map(({ title, desc, icon: Icon, img, link }, i) => (
                <Link
                  key={`${activeTab}-${i}`}
                  to={link}
                  className="min-w-[280px] sm:min-w-[300px] snap-start group"
                >
                  <div className="glass-card overflow-hidden">
                    <div className="img-zoom h-40">
                      <img src={img} alt={title} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-4 h-4 text-navy" />
                        <h3 className="text-sm font-bold text-charcoal group-hover:text-navy transition-colors">{title}</h3>
                      </div>
                      <p className="text-xs text-charcoal-muted leading-relaxed mb-3">{desc}</p>
                      <div className="flex items-center gap-1 text-xs font-semibold text-navy group-hover:gap-2 transition-all">
                        Explore <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES — Interactive cards with preview ═══════════ */}
      <section ref={featuresReveal.ref} className="py-16 lg:py-20" id="officers">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-12 ${featuresReveal.visible ? 'fade-in-up' : 'opacity-0'}`}>
            <h2 className="text-3xl sm:text-4xl font-bold text-charcoal mb-3">{t('features.title')}</h2>
            <p className="text-charcoal-muted">{t('features.subtitle')}</p>
          </div>

          <div className={`grid grid-cols-1 lg:grid-cols-5 gap-6 ${featuresReveal.visible ? 'fade-in-up fade-in-up-delay-1' : 'opacity-0'}`}>
            {/* Feature list (clickable) */}
            <div className="lg:col-span-2 space-y-2">
              {features.map(({ icon: Icon, titleKey, color, bg }, i) => (
                <button
                  key={titleKey}
                  onClick={() => setActiveFeature(i)}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all duration-300 ${
                    activeFeature === i
                      ? 'glass-card !bg-white shadow-lg scale-[1.02]'
                      : 'hover:bg-white/50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl ${activeFeature === i ? bg : 'bg-gray-100'} flex items-center justify-center transition-colors flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${activeFeature === i ? color : 'text-charcoal-muted'} transition-colors`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${activeFeature === i ? 'text-charcoal' : 'text-charcoal-muted'} transition-colors`}>
                      {t(titleKey)}
                    </p>
                  </div>
                  {activeFeature === i && (
                    <ChevronRight className="w-4 h-4 text-navy flex-shrink-0" />
                  )}
                  {/* Progress indicator */}
                  {activeFeature === i && (
                    <div className="absolute bottom-0 left-0 h-0.5 bg-navy rounded-full" style={{ width: '100%', animation: 'shimmer 4s linear' }} />
                  )}
                </button>
              ))}
            </div>

            {/* Feature preview */}
            <div className="lg:col-span-3">
              <div className="glass-card overflow-hidden" key={activeFeature}>
                <div className="img-zoom h-52 sm:h-64">
                  <img
                    src={features[activeFeature].img}
                    alt={t(features[activeFeature].titleKey)}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    {(() => { const Icon = features[activeFeature].icon; return (
                      <div className={`w-10 h-10 rounded-xl ${features[activeFeature].bg} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${features[activeFeature].color}`} />
                      </div>
                    ); })()}
                    <h3 className="text-lg font-bold text-charcoal">{t(features[activeFeature].titleKey)}</h3>
                  </div>
                  <p className="text-sm text-charcoal-muted leading-relaxed">{t(features[activeFeature].descKey)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section ref={howReveal.ref} className="py-16 lg:py-20 bg-white" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-12 ${howReveal.visible ? 'fade-in-up' : 'opacity-0'}`}>
            <h2 className="text-3xl sm:text-4xl font-bold text-charcoal mb-3">{t('howItWorks.title')}</h2>
            <p className="text-charcoal-muted">{t('howItWorks.subtitle')}</p>
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ${howReveal.visible ? 'fade-in-up fade-in-up-delay-1' : 'opacity-0'}`}>
            {steps.map(({ icon: Icon, num, titleKey, descKey, color }, index) => (
              <div key={titleKey} className="relative group">
                {/* Connector */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-navy/20 to-transparent" />
                )}
                <div className="glass-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      {num}
                    </div>
                    <Icon className="w-5 h-5 text-charcoal-muted" />
                  </div>
                  <h3 className="text-base font-bold text-charcoal mb-2">{t(titleKey)}</h3>
                  <p className="text-sm text-charcoal-muted leading-relaxed">{t(descKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS CAROUSEL ═══════════ */}
      <section className="py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-charcoal mb-3">Voices of Change</h2>
            <p className="text-charcoal-muted">What our users say about Nyaya Setu</p>
          </div>

          <div className="relative">
            <div className="glass-card p-8 sm:p-10 text-center">
              <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-5 ring-4 ring-saffron/20">
                <img
                  src={testimonials[testimonialIdx].avatar}
                  alt={testimonials[testimonialIdx].name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <p className="text-base sm:text-lg text-charcoal leading-relaxed mb-5 font-serif italic max-w-2xl mx-auto">
                "{testimonials[testimonialIdx].text}"
              </p>
              <p className="text-sm font-bold text-charcoal">{testimonials[testimonialIdx].name}</p>
              <p className="text-xs text-charcoal-muted">{testimonials[testimonialIdx].role}</p>

              {/* Dots */}
              <div className="flex items-center justify-center gap-2 mt-6">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTestimonialIdx(i)}
                    className={`rounded-full transition-all duration-300 ${
                      i === testimonialIdx ? 'w-8 h-2 bg-navy' : 'w-2 h-2 bg-navy/20 hover:bg-navy/40'
                    }`}
                    aria-label={`Testimonial ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Nav arrows */}
            <button
              onClick={() => setTestimonialIdx((testimonialIdx - 1 + testimonials.length) % testimonials.length)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/80 transition-colors hidden sm:flex"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5 text-charcoal" />
            </button>
            <button
              onClick={() => setTestimonialIdx((testimonialIdx + 1) % testimonials.length)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/80 transition-colors hidden sm:flex"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5 text-charcoal" />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════ CRIME HOTSPOT MAP ═══════════ */}
      <section ref={mapReveal.ref} className="py-16 lg:py-20 bg-white" id="crime-map">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-12 ${mapReveal.visible ? 'fade-in-up' : 'opacity-0'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-alert/5 border border-alert/10 text-xs font-semibold text-alert mb-4">
              <MapPin className="w-3.5 h-3.5" />
              Live Data · Updated Daily
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-charcoal mb-3">Crime Hotspot Intelligence</h2>
            <p className="text-charcoal-muted max-w-2xl mx-auto">
              Interactive map of major crime areas across India. Click on any hotspot to view detailed crime statistics and trends.
            </p>
          </div>

          <div className={`${mapReveal.visible ? 'fade-in-up fade-in-up-delay-2' : 'opacity-0'}`}>
            <IndiaMap />
          </div>
        </div>
      </section>

      {/* ═══════════ ABOUT SECTION (Light Orange Theme) ═══════════ */}
      <section id="about" className="py-20 bg-orange-50 border-t border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-navy mb-4">About NyayaSetu</h2>
            <div className="w-20 h-1 bg-orange-400 mx-auto rounded-full mb-6"></div>
            <p className="text-lg text-slate-700 max-w-4xl mx-auto leading-relaxed font-medium">
              NyayaSetu is a secure, integrated case and evidence management platform designed to unify the pillars of India's justice system. By connecting Police (CCTNS), Forensics (e-Forensics), Prosecution (e-Prosecution), and Courts (e-Courts), we eliminate data silos, accelerate investigations, and ensure a transparent, tamper-proof chain of custody for digital evidence.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600">
                <Shield className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-navy text-lg mb-2">Secure & Immutable</h3>
              <p className="text-slate-600 text-sm">Blockchain-backed audit trails and cryptographic signatures ensure that case data and evidence cannot be tampered with.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600">
                <Share2 className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-navy text-lg mb-2">Inter-Agency Sync</h3>
              <p className="text-slate-600 text-sm">Real-time data sharing across authorized departments drastically reduces delays and manual paperwork.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-navy text-lg mb-2">Citizen Centric</h3>
              <p className="text-slate-600 text-sm">Empowering citizens with transparent case tracking, online FIR filing, and easy access to court proceedings.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ HELP SECTION (Light Green Theme) ═══════════ */}
      <section id="help" className="py-20 bg-green-50 border-t border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-navy mb-4">Help & Support</h2>
            <div className="w-20 h-1 bg-green-500 mx-auto rounded-full mb-6"></div>
            <p className="text-lg text-slate-700 max-w-3xl mx-auto font-medium">
              Need assistance? We are here to help you navigate the portal and access justice services efficiently.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-green-100 flex items-start gap-4">
                <div className="bg-green-100 p-3 rounded-lg text-green-700 mt-1">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-navy mb-1">How do I register an account?</h4>
                  <p className="text-sm text-slate-600">Citizens can register using Aadhaar verification. Officers require official department credentials (e-Pramaan) for secure access.</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-green-100 flex items-start gap-4">
                <div className="bg-green-100 p-3 rounded-lg text-green-700 mt-1">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-navy mb-1">How do I file an e-FIR?</h4>
                  <p className="text-sm text-slate-600">Navigate to the Citizen Services section, verify your identity, and fill out the digital complaint form. You will receive an immediate acknowledgment receipt.</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-green-100 flex items-start gap-4">
                <div className="bg-green-100 p-3 rounded-lg text-green-700 mt-1">
                  <Search className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-navy mb-1">Can I track my case status?</h4>
                  <p className="text-sm text-slate-600">Yes, you can track real-time updates of your registered FIRs and Court Hearings directly from your Citizen Dashboard.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl p-8 border border-green-200 shadow-xl relative overflow-hidden flex flex-col justify-center text-center items-center">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-green-600"></div>
              <MessageSquare className="w-16 h-16 text-green-600 mb-6" />
              <h3 className="text-2xl font-bold text-navy mb-4">Contact Support</h3>
              <p className="text-slate-600 mb-8 max-w-md">Our dedicated support team is available 24/7 to assist citizens and officers with technical issues.</p>
              
              <div className="space-y-4 w-full max-w-xs">
                <a href="tel:112" className="flex items-center justify-center gap-3 w-full py-3 bg-red-50 text-red-700 rounded-xl font-bold hover:bg-red-100 transition-colors border border-red-200">
                  <span>Emergency: Dial 112</span>
                </a>
                <a href="tel:1930" className="flex items-center justify-center gap-3 w-full py-3 bg-navy text-white rounded-xl font-bold hover:bg-navy-700 transition-colors shadow-md">
                  <span>Cyber Crime: Dial 1930</span>
                </a>
                <button className="flex items-center justify-center gap-3 w-full py-3 bg-green-50 text-green-700 rounded-xl font-bold hover:bg-green-100 transition-colors border border-green-200">
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat with Nyaya Bot</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ CTA SECTION ═══════════ */}
      <section ref={ctaReveal.ref} className="py-16 lg:py-20" id="courts">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`relative overflow-hidden rounded-3xl p-1 ${ctaReveal.visible ? 'fade-in-up' : 'opacity-0'}`}>
            {/* Gradient border */}
            <div className="absolute inset-0 bg-gradient-to-r from-saffron via-navy to-forest rounded-3xl" />
            <div className="relative rounded-[1.35rem] bg-gradient-to-br from-navy-950 via-navy to-navy-800 text-white p-8 sm:p-14 text-center overflow-hidden">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-72 h-72 bg-saffron/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-56 h-56 bg-forest/10 rounded-full blur-3xl" />
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)',
                  backgroundSize: '40px 40px'
                }} />
              </div>
              <div className="relative">
                <div className="flex gap-0 w-16 h-1 rounded-full overflow-hidden mx-auto mb-6">
                  <div className="flex-1 bg-saffron" />
                  <div className="flex-1 bg-white" />
                  <div className="flex-1 bg-forest" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Ready to Access <span className="font-serif italic text-saffron-300">Digital Justice</span>?
                </h2>
                <p className="text-white/60 mb-8 max-w-xl mx-auto">
                  Join millions of citizens, officers, and courts on India's unified justice delivery platform.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/register/citizen" className="pill-btn bg-white text-navy hover:bg-cream font-semibold shadow-lg px-8 py-3.5 group">
                    <UserPlus className="w-5 h-5" />
                    Register as Citizen
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                  <Link to="/login" className="pill-btn border-2 border-white/20 text-white hover:bg-white/10 font-semibold px-8 py-3.5">
                    Login to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
