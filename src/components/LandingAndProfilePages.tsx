import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Star,
  Award,
  Clock,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  Building2,
  TrendingDown,
  Cpu,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { AuthUser, UserMenuDropdown } from './PortalShared';
import { SUPPLIER_PROFILES } from '../data/examples';

const HERO_TAGLINES = [
  'Empowering Contractors to Procure Smarter.',
  'Helping Suppliers Sell Faster.',
  'Bridging the Gap in Construction Supply.',
];

interface LandingPageProps {
  onNavigate: (path: string) => void;
  user: AuthUser | null;
  onOpenAuthModal: (mode: 'login' | 'signup') => void;
  onLogout: () => void;
  onOpenEngineConfig: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  user,
  onOpenAuthModal,
  onLogout,
  onOpenEngineConfig,
}) => {
  const [expandingCard, setExpandingCard] = useState<'contractor' | 'supplier' | null>(null);
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typedStat1, setTypedStat1] = useState('');
  const [typedStat2, setTypedStat2] = useState('');
  const [statsTriggered, setStatsTriggered] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentPhrase = HERO_TAGLINES[taglineIndex];
    const timer = setTimeout(
      () => {
        if (!isDeleting) {
          if (typedText.length < currentPhrase.length) {
            setTypedText(currentPhrase.slice(0, typedText.length + 1));
          } else {
            setTimeout(() => setIsDeleting(true), 2000);
          }
        } else if (typedText.length > 0) {
          setTypedText(currentPhrase.slice(0, typedText.length - 1));
        } else {
          setIsDeleting(false);
          setTaglineIndex((prev) => (prev + 1) % HERO_TAGLINES.length);
        }
      },
      isDeleting ? 35 : 75
    );
    return () => clearTimeout(timer);
  }, [typedText, isDeleting, taglineIndex]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !statsTriggered) {
            setStatsTriggered(true);
          }
        });
      },
      { threshold: 0.35 }
    );
    if (statsRef.current) {
      observer.observe(statsRef.current);
    }
    return () => {
      if (statsRef.current) observer.unobserve(statsRef.current);
    };
  }, [statsTriggered]);

  useEffect(() => {
    if (!statsTriggered) return;
    const target1 = '3x Profit Growth';
    const target2 = '2x Operational Efficiency';
    let idx1 = 0;
    let idx2 = 0;
    const interval1 = setInterval(() => {
      if (idx1 <= target1.length) {
        setTypedStat1(target1.slice(0, idx1));
        idx1++;
      } else {
        clearInterval(interval1);
      }
    }, 55);
    const timeout2 = setTimeout(() => {
      const interval2 = setInterval(() => {
        if (idx2 <= target2.length) {
          setTypedStat2(target2.slice(0, idx2));
          idx2++;
        } else {
          clearInterval(interval2);
        }
      }, 55);
    }, 200);
    return () => {
      clearInterval(interval1);
      clearTimeout(timeout2);
    };
  }, [statsTriggered]);

  const handlePortalClick = (type: 'contractor' | 'supplier', path: string) => {
    setExpandingCard(type);
    setTimeout(() => {
      onNavigate(path);
    }, 550);
  };

  return (
    <div className="min-h-screen bg-white relative overflow-x-hidden">
      {/* Top Fixed Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-slate-200 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <img
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="Hammer&Nail Logo"
              className="w-8 h-8 object-contain"
              style={{
                filter:
                  'brightness(0) saturate(100%) invert(16%) sepia(79%) saturate(2466%) hue-rotate(213deg) brightness(93%) contrast(96%)',
              }}
            />
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: '#143688' }}>
              Hammer&Nail
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <button
              onClick={onOpenEngineConfig}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/80 text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer"
              style={{ color: '#143688' }}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Gemini 4 Argon Active</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>
            <button
              onClick={() => {
                document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Pricing
            </button>
            {user ? (
              <UserMenuDropdown user={user} onLogout={onLogout} />
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => onOpenAuthModal('login')}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border-2 hover:bg-slate-50 transition-colors cursor-pointer"
                  style={{ color: '#143688', borderColor: '#143688' }}
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuthModal('signup')}
                  className="px-4 py-2 rounded-xl text-white text-xs sm:text-sm font-semibold hover:opacity-95 transition-opacity cursor-pointer shadow-xs"
                  style={{ backgroundColor: '#143688' }}
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {expandingCard && (
        <div
          className="fixed inset-0 z-50 pointer-events-none"
          style={{
            backgroundColor: '#143688',
            animation: 'expandCircle 0.55s cubic-bezier(0.4, 0, 0.2, 1) forwards',
          }}
        />
      )}

      {/* Hero Section */}
      <div className="pt-16">
        <div className="bg-white pt-16 pb-14 px-4 sm:px-6">
          <div className="w-full max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-xs font-bold mb-6" style={{ color: '#143688' }}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dual-AI Construction Procurement • Powered by Gemini 4 Argon</span>
            </div>

            <div className="flex items-center justify-center gap-3.5 mb-5">
              <img
                src={`${import.meta.env.BASE_URL}logo.png`}
                alt="Hammer&Nail Logo"
                className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain shrink-0"
                style={{
                  filter:
                    'brightness(0) saturate(100%) invert(16%) sepia(79%) saturate(2466%) hue-rotate(213deg) brightness(93%) contrast(96%)',
                }}
              />
              <h1
                className="text-5xl sm:text-6xl md:text-7xl tracking-tight font-extrabold"
                style={{ color: '#143688' }}
              >
                Hammer&Nail
              </h1>
            </div>

            <p className="text-lg sm:text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              The <span className="gradient-text font-bold">intelligent</span> construction
              procurement platform connecting contractors and suppliers
            </p>

            {/* Typewriter Container with Generous Min-Height (Zero Clipping) */}
            <div className="mt-7 min-h-[4.25rem] flex items-center justify-center px-2">
              <p
                className="text-xl sm:text-2xl md:text-3xl font-bold font-mono leading-snug"
                style={{ color: '#143688' }}
              >
                {typedText}
                <span className="animate-pulse ml-0.5">|</span>
              </p>
            </div>
          </div>
        </div>

        {/* Animated Gradient Portal Selection Section */}
        <div className="animated-gradient py-16 sm:py-20 px-4 sm:px-6 pb-24">
          <div className="w-full max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
              {/* Contractor Portal Card */}
              <div
                onClick={() => handlePortalClick('contractor', '/contractor')}
                className="group relative bg-white border-2 border-white/80 rounded-2xl p-8 hover:border-sky-300 transition-all duration-300 cursor-pointer shadow-xl hover:shadow-2xl hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold shadow-md"
                      style={{ backgroundColor: '#143688' }}
                    >
                      C
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-[#143688]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Hammer AI Agent
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: '#143688' }}>
                    Contractor Portal
                  </h2>
                  <p className="text-slate-600 text-base leading-relaxed mb-8">
                    Upload your Bill of Quantities and let our Hammer Agent find the best verified
                    suppliers, audit BS EN / UKCA / CARES compliance with self-correction loops, and
                    optimize your procurement margins.
                  </p>
                </div>
                <div
                  className="flex items-center justify-between pt-4 border-t border-slate-100 text-base font-bold group-hover:translate-x-1 transition-transform duration-200"
                  style={{ color: '#143688' }}
                >
                  <span>Enter as Contractor</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>

              {/* Supplier Portal Card */}
              <div
                onClick={() => handlePortalClick('supplier', '/supplier')}
                className="group relative bg-white border-2 border-white/80 rounded-2xl p-8 hover:border-sky-300 transition-all duration-300 cursor-pointer shadow-xl hover:shadow-2xl hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold shadow-md"
                      style={{ backgroundColor: '#143688' }}
                    >
                      S
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-[#143688]">
                      <Sparkles className="w-3.5 h-3.5" />
                      Nail AI Agent
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: '#143688' }}>
                    Supplier Portal
                  </h2>
                  <p className="text-slate-600 text-base leading-relaxed mb-8">
                    Upload your product catalog and let our Nail Agent benchmark regional market
                    rates, enforce gross-margin guardrails, and autonomously bid on matching
                    contractor tenders.
                  </p>
                </div>
                <div
                  className="flex items-center justify-between pt-4 border-t border-slate-100 text-base font-bold group-hover:translate-x-1 transition-transform duration-200"
                  style={{ color: '#143688' }}
                >
                  <span>Enter as Supplier</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="text-center mt-10">
              <p className="text-blue-100 text-xs sm:text-sm font-medium">
                Powered by Dual-AI Agent Architecture (Hammer & Nail) • Gemini 4 Argon Frontier Engine
              </p>
            </div>

            {/* Frosted Glass Stats Section */}
            <div
              ref={statsRef}
              className="mt-12 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto"
            >
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6 sm:p-8 text-center">
                <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 font-mono min-h-[48px] flex items-center justify-center">
                  {typedStat1 || '3x Profit Growth'}
                </h3>
                <p className="text-blue-100 text-sm sm:text-base font-medium">
                  Average client revenue & margin increase
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6 sm:p-8 text-center">
                <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 font-mono min-h-[48px] flex items-center justify-center">
                  {typedStat2 || '2x Operational Efficiency'}
                </h3>
                <p className="text-blue-100 text-sm sm:text-base font-medium">
                  Faster procurement & autonomous quoting velocity
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div id="pricing-section" className="bg-slate-50 py-20 px-4 sm:px-6 border-t border-slate-200">
          <div className="w-full max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3"
                style={{ color: '#143688' }}
              >
                Simple, Transparent Pricing
              </h2>
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
                Choose the autonomous agent plan tailored to your construction role
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-8 hover:border-[#143688] transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col justify-between">
                <div>
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-1" style={{ color: '#143688' }}>
                      Contractor Plan
                    </h3>
                    <p className="text-sm text-slate-500">
                      For civil, commercial, and residential construction contractors
                    </p>
                  </div>
                  <div className="mb-6 pb-6 border-b border-slate-100">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-extrabold" style={{ color: '#143688' }}>
                        £149
                      </span>
                      <span className="text-slate-500 font-medium">/month</span>
                    </div>
                  </div>
                  <ul className="space-y-3.5 mb-8">
                    {[
                      'Unlimited BOQ uploads and natural-language analysis',
                      'AI-powered supplier matching with Hammer Frontier Agent',
                      'Autonomous UKCA / BS EN / CARES compliance verification loops',
                      'Real-time price comparisons and Pareto cost optimization',
                      'One-click automated RFQ dispatch and tracking',
                      'Priority commercial support',
                    ].map((feat) => (
                      <li key={feat} className="flex items-start gap-3 text-sm text-slate-700">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center mt-0.5 shrink-0"
                          style={{ backgroundColor: '#143688' }}
                        >
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => handlePortalClick('contractor', '/contractor')}
                  className="w-full py-3.5 rounded-xl text-white text-sm font-bold hover:opacity-95 transition-opacity cursor-pointer shadow-sm"
                  style={{ backgroundColor: '#143688' }}
                >
                  Launch Contractor Portal
                </button>
              </div>

              <div className="bg-white border-2 border-slate-200 rounded-2xl p-8 hover:border-[#143688] transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col justify-between">
                <div>
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-1" style={{ color: '#143688' }}>
                      Supplier Plan
                    </h3>
                    <p className="text-sm text-slate-500">
                      For builders merchants, steel mills, and material distributors
                    </p>
                  </div>
                  <div className="mb-6 pb-6 border-b border-slate-100">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-extrabold" style={{ color: '#143688' }}>
                        £99
                      </span>
                      <span className="text-slate-500 font-medium">/month</span>
                    </div>
                  </div>
                  <ul className="space-y-3.5 mb-8">
                    {[
                      'Unlimited wholesale catalog uploads and SKU management',
                      'AI-powered market telemetry with Nail Frontier Agent',
                      'Automated matching with active regional contractor tenders',
                      'Dynamic pricing calibration with 22% gross-margin floor guardrails',
                      'Demand forecasting and inventory velocity insights',
                      'Priority commercial support',
                    ].map((feat) => (
                      <li key={feat} className="flex items-start gap-3 text-sm text-slate-700">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center mt-0.5 shrink-0"
                          style={{ backgroundColor: '#143688' }}
                        >
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => handlePortalClick('supplier', '/supplier')}
                  className="w-full py-3.5 rounded-xl text-white text-sm font-bold hover:opacity-95 transition-opacity cursor-pointer shadow-sm"
                  style={{ backgroundColor: '#143688' }}
                >
                  Launch Supplier Portal
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SupplierProfilePageProps {
  supplierId: number;
  onNavigate: (path: string) => void;
  onRequestQuoteForSupplier: (supplierName: string) => void;
}

export const SupplierProfilePage: React.FC<SupplierProfilePageProps> = ({
  supplierId,
  onNavigate,
  onRequestQuoteForSupplier,
}) => {
  const supplier = SUPPLIER_PROFILES[supplierId];

  if (!supplier) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-2xl shadow-md border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Supplier Not Found</h2>
          <button
            onClick={() => onNavigate('/contractor')}
            className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold cursor-pointer"
            style={{ backgroundColor: '#143688' }}
          >
            Back to Contractor Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="relative h-80 bg-slate-900 overflow-hidden">
        <img
          src={supplier.image}
          alt={supplier.name}
          className="w-full h-full object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-transparent" />
        <button
          onClick={() => onNavigate('/contractor')}
          className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/95 hover:bg-white rounded-xl shadow-lg transition-all cursor-pointer text-sm font-semibold"
          style={{ color: '#143688' }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Contractor Portal</span>
        </button>
        <div className="absolute bottom-8 left-0 right-0 max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-3 py-0.5 text-xs font-semibold text-emerald-200 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified UK Depot
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-2">
                {supplier.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-sky-300" />
                  <span>{supplier.distance} miles away</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold">{supplier.rating}</span>
                  <span className="text-white/75">({supplier.reviews} verified reviews)</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => onRequestQuoteForSupplier(supplier.name)}
              className="px-5 py-2.5 rounded-xl bg-white text-[#143688] font-bold text-sm shadow-lg hover:bg-blue-50 transition-colors cursor-pointer"
            >
              Request Autonomous Quote →
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-3" style={{ color: '#143688' }}>
                Company Overview
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
                {supplier.description}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-center">
                  <Building2 className="w-6 h-6 mx-auto mb-1.5" style={{ color: '#143688' }} />
                  <div className="text-xl font-extrabold text-slate-900">
                    {supplier.yearsInBusiness}
                  </div>
                  <div className="text-xs text-slate-500">Years in Business</div>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-center">
                  <Star className="w-6 h-6 mx-auto mb-1.5" style={{ color: '#143688' }} />
                  <div className="text-xl font-extrabold text-slate-900">{supplier.rating}/5.0</div>
                  <div className="text-xs text-slate-500">Customer Rating</div>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-center">
                  <Clock className="w-6 h-6 mx-auto mb-1.5" style={{ color: '#143688' }} />
                  <div className="text-base font-extrabold text-slate-900">
                    {supplier.deliveryTime}
                  </div>
                  <div className="text-xs text-slate-500">Delivery SLA</div>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-center">
                  <TrendingDown className="w-6 h-6 mx-auto mb-1.5" style={{ color: '#143688' }} />
                  <div className="text-base font-extrabold text-slate-900">
                    {supplier.minimumOrder}
                  </div>
                  <div className="text-xs text-slate-500">Minimum Order</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-5" style={{ color: '#143688' }}>
                Current Verified Trade Pricing
              </h2>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                        Material
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                        Price
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                        Unit
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                        Availability
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {supplier.pricing.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="py-3.5 px-4 text-sm text-slate-900 font-semibold">
                          {row.material}
                        </td>
                        <td className="py-3.5 px-4 text-sm font-bold font-mono" style={{ color: '#143688' }}>
                          {row.price}
                        </td>
                        <td className="py-3.5 px-4 text-sm text-slate-600">{row.unit}</td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
                            <CheckCircle2 className="w-3 h-3" />
                            {row.availability}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-5" style={{ color: '#143688' }}>
                Recent Completed Supply Contracts
              </h2>
              <div className="space-y-3">
                {supplier.recentProjects.map((proj, idx) => (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">{proj.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{proj.date}</p>
                    </div>
                    <span className="font-bold font-mono text-base" style={{ color: '#143688' }}>
                      {proj.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
              <h3 className="text-lg font-bold mb-4" style={{ color: '#143688' }}>
                Depot Specifications
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Materials Supplied
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {supplier.materials.map((mat, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-50 text-[#143688] border border-blue-200/60 rounded-full text-xs font-semibold"
                      >
                        {mat}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="border-t border-slate-100 pt-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Quality & Compliance Certifications
                  </h4>
                  <div className="space-y-2">
                    {supplier.certifications.map((cert, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 font-medium">
                        <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-slate-100 pt-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Payment Terms
                  </h4>
                  <p className="text-sm text-slate-700 font-medium">{supplier.paymentTerms}</p>
                </div>
                <div className="border-t border-slate-100 pt-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Coverage Area
                  </h4>
                  <p className="text-sm text-slate-700 font-medium">{supplier.coverage}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
              <h3 className="text-lg font-bold mb-4" style={{ color: '#143688' }}>
                Commercial Desk Contact
              </h3>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <p className="text-xs sm:text-sm text-slate-700">{supplier.contact.address}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <p className="text-xs sm:text-sm text-slate-700">{supplier.contact.phone}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <p className="text-xs sm:text-sm text-slate-700">{supplier.contact.email}</p>
                </div>
              </div>
              <button
                onClick={() => onRequestQuoteForSupplier(supplier.name)}
                className="w-full py-3 rounded-xl text-white text-sm font-bold hover:opacity-95 transition-opacity cursor-pointer shadow-sm"
                style={{ backgroundColor: '#143688' }}
              >
                Dispatch Autonomous RFQ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
