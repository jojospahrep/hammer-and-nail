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
      isDeleting ? 35 : 80
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
      { threshold: 0.5 }
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
    }, 60);
    const timeout2 = setTimeout(() => {
      const interval2 = setInterval(() => {
        if (idx2 <= target2.length) {
          setTypedStat2(target2.slice(0, idx2));
          idx2++;
        } else {
          clearInterval(interval2);
        }
      }, 60);
    }, 250);
    return () => {
      clearInterval(interval1);
      clearTimeout(timeout2);
    };
  }, [statsTriggered]);

  const handlePortalClick = (type: 'contractor' | 'supplier', path: string) => {
    setExpandingCard(type);
    setTimeout(() => {
      onNavigate(path);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="Hammer&Nail Logo"
              className="w-8 h-8"
              style={{
                filter:
                  'brightness(0) saturate(100%) invert(16%) sepia(79%) saturate(2466%) hue-rotate(213deg) brightness(93%) contrast(96%)',
              }}
            />
            <div className="text-2xl font-bold" style={{ color: '#143688' }}>
              Hammer&Nail
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={onOpenEngineConfig}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50/70 text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer"
              style={{ color: '#143688' }}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Gemini 4 Argon Active</span>
            </button>
            <button
              onClick={() => {
                document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="font-semibold text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
            >
              Pricing
            </button>
            {user ? (
              <UserMenuDropdown user={user} onLogout={onLogout} />
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onOpenAuthModal('login')}
                  className="px-6 py-2 rounded-lg font-semibold border-2 hover:bg-gray-50 transition-colors cursor-pointer"
                  style={{ color: '#143688', borderColor: '#143688' }}
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuthModal('signup')}
                  className="px-6 py-2 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity cursor-pointer"
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
            animation: 'expandCircle 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
          }}
        />
      )}

      <div className="pt-20">
        <div className="bg-white py-12 px-6">
          <div className="w-full max-w-6xl mx-auto">
            <div className="text-center mb-12 pt-16">
              <div className="flex items-center justify-center gap-3 mb-4">
                <img
                  src={`${import.meta.env.BASE_URL}logo.png`}
                  alt="Hammer&Nail Logo"
                  className="w-16 h-16 md:w-20 md:h-20"
                  style={{
                    filter:
                      'brightness(0) saturate(100%) invert(16%) sepia(79%) saturate(2466%) hue-rotate(213deg) brightness(93%) contrast(96%)',
                  }}
                />
                <h1
                  className="text-6xl md:text-7xl tracking-tight font-bold"
                  style={{ color: '#143688' }}
                >
                  Hammer&Nail
                </h1>
              </div>
              <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
                The <span className="gradient-text font-semibold">intelligent</span> construction
                procurement platform connecting contractors and suppliers
              </p>
              <div className="mt-6 h-16 flex items-center justify-center">
                <p
                  className="text-2xl md:text-4xl font-semibold font-mono"
                  style={{ color: '#143688' }}
                >
                  {typedText}
                  <span className="animate-pulse">|</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="animated-gradient py-16 px-6 pb-32">
          <div className="w-full max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div
                onClick={() => handlePortalClick('contractor', '/contractor')}
                className="group relative bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-[#143688] transition-all duration-300 cursor-pointer hover:shadow-xl"
              >
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div
                      className="w-16 h-16 rounded-xl mb-6 flex items-center justify-center text-white text-2xl font-bold"
                      style={{ backgroundColor: '#143688' }}
                    >
                      C
                    </div>
                    <h2 className="text-3xl mb-4" style={{ color: '#143688' }}>
                      Contractor Portal
                    </h2>
                    <p className="text-gray-600 text-lg mb-8">
                      Upload your Bill of Quantities and let our Hammer Agent find the best
                      suppliers, analyze quotes, and optimize your procurement costs with Gemini 4
                      Argon verification loops.
                    </p>
                  </div>
                  <div
                    className="flex items-center text-lg group-hover:translate-x-2 transition-transform duration-300"
                    style={{ color: '#143688' }}
                  >
                    <span className="font-semibold">Enter as Contractor</span>
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </div>
                </div>
              </div>

              <div
                onClick={() => handlePortalClick('supplier', '/supplier')}
                className="group relative bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-[#143688] transition-all duration-300 cursor-pointer hover:shadow-xl"
              >
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div
                      className="w-16 h-16 rounded-xl mb-6 flex items-center justify-center text-white text-2xl font-bold"
                      style={{ backgroundColor: '#143688' }}
                    >
                      S
                    </div>
                    <h2 className="text-3xl mb-4" style={{ color: '#143688' }}>
                      Supplier Portal
                    </h2>
                    <p className="text-gray-600 text-lg mb-8">
                      Upload your product catalog and let our Nail Agent analyze market trends,
                      connect you with contractors, and optimize your pricing strategy.
                    </p>
                  </div>
                  <div
                    className="flex items-center text-lg group-hover:translate-x-2 transition-transform duration-300"
                    style={{ color: '#143688' }}
                  >
                    <span className="font-semibold">Enter as Supplier</span>
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <p className="text-white/90 text-sm">
                Powered by Dual-AI Agent Architecture (Hammer & Nail) • Gemini 4 Argon Frontier Engine
              </p>
            </div>

            <div
              ref={statsRef}
              className="mt-16 grid md:grid-cols-2 gap-12 max-w-4xl mx-auto"
            >
              <div className="text-center">
                <h3 className="text-4xl md:text-5xl font-bold text-white mb-2 font-mono min-h-[60px] flex items-center justify-center">
                  {typedStat1}
                  {typedStat1.length > 0 && typedStat1.length < 16 && (
                    <span className="animate-pulse">|</span>
                  )}
                </h3>
                <p className="text-white/80 text-lg">Average client revenue increase</p>
              </div>
              <div className="text-center">
                <h3 className="text-4xl md:text-5xl font-bold text-white mb-2 font-mono min-h-[60px] flex items-center justify-center">
                  {typedStat2}
                  {typedStat2.length > 0 && typedStat2.length < 25 && (
                    <span className="animate-pulse">|</span>
                  )}
                </h3>
                <p className="text-white/80 text-lg">Faster procurement & quoting process</p>
              </div>
            </div>
          </div>
        </div>

        <div id="pricing-section" className="bg-white py-20 px-6">
          <div className="w-full max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2
                className="text-4xl md:text-5xl font-bold mb-4"
                style={{ color: '#143688' }}
              >
                Simple, Transparent Pricing
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Choose the plan that fits your business needs
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-[#143688] transition-all duration-300 hover:shadow-xl">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2" style={{ color: '#143688' }}>
                    Contractor Plan
                  </h3>
                  <p className="text-gray-600">For construction contractors of all sizes</p>
                </div>
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold" style={{ color: '#143688' }}>
                      £149
                    </span>
                    <span className="text-gray-600">/month</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  {[
                    'Unlimited BOQ uploads and analysis',
                    'AI-powered supplier matching with Hammer Agent',
                    'Real-time price comparisons and cost optimization',
                    'Access to verified supplier network',
                    'Automated quote requests and tracking',
                    'Priority customer support',
                  ].map((feat) => (
                    <li key={feat} className="flex items-start gap-3">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0"
                        style={{ backgroundColor: '#143688' }}
                      >
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span className="text-gray-700">{feat}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handlePortalClick('contractor', '/contractor')}
                  className="w-full py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                  style={{ backgroundColor: '#143688' }}
                >
                  Start Free Trial in Contractor Portal
                </button>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-[#143688] transition-all duration-300 hover:shadow-xl">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2" style={{ color: '#143688' }}>
                    Supplier Plan
                  </h3>
                  <p className="text-gray-600">For building material suppliers and distributors</p>
                </div>
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold" style={{ color: '#143688' }}>
                      £99
                    </span>
                    <span className="text-gray-600">/month</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  {[
                    'Unlimited catalog uploads and management',
                    'AI-powered market analysis with Nail Agent',
                    'Automated matching with contractor opportunities',
                    'Dynamic pricing recommendations',
                    'Demand forecasting and inventory insights',
                    'Priority customer support',
                  ].map((feat) => (
                    <li key={feat} className="flex items-start gap-3">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0"
                        style={{ backgroundColor: '#143688' }}
                      >
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span className="text-gray-700">{feat}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handlePortalClick('supplier', '/supplier')}
                  className="w-full py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                  style={{ backgroundColor: '#143688' }}
                >
                  Start Free Trial in Supplier Portal
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Supplier Not Found</h2>
          <button
            onClick={() => onNavigate('/contractor')}
            className="px-6 py-2.5 rounded-lg text-white font-semibold cursor-pointer"
            style={{ backgroundColor: '#143688' }}
          >
            Back to Contractor Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-80 bg-gray-900">
        <img
          src={supplier.image}
          alt={supplier.name}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <button
          onClick={() => onNavigate('/contractor')}
          className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/95 hover:bg-white rounded-lg shadow-lg transition-all cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: '#143688' }} />
          <span className="font-semibold" style={{ color: '#143688' }}>
            Back to Contractor Portal
          </span>
        </button>
        <div className="absolute bottom-8 left-0 right-0 max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{supplier.name}</h1>
              <div className="flex items-center gap-4 text-white/90">
                <div className="flex items-center gap-1">
                  <MapPin className="w-5 h-5" />
                  <span>{supplier.distance} miles away</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{supplier.rating}</span>
                  <span className="text-white/70">({supplier.reviews} reviews)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#143688' }}>
                Company Overview
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6">{supplier.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <Building2 className="w-8 h-8 mx-auto mb-2" style={{ color: '#143688' }} />
                  <div className="text-2xl font-bold text-gray-900">{supplier.yearsInBusiness}</div>
                  <div className="text-xs text-gray-600">Years in Business</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <Star className="w-8 h-8 mx-auto mb-2" style={{ color: '#143688' }} />
                  <div className="text-2xl font-bold text-gray-900">{supplier.rating}/5.0</div>
                  <div className="text-xs text-gray-600">Customer Rating</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <Clock className="w-8 h-8 mx-auto mb-2" style={{ color: '#143688' }} />
                  <div className="text-lg font-bold text-gray-900">{supplier.deliveryTime}</div>
                  <div className="text-xs text-gray-600">Delivery Time</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <TrendingDown className="w-8 h-8 mx-auto mb-2" style={{ color: '#143688' }} />
                  <div className="text-lg font-bold text-gray-900">{supplier.minimumOrder}</div>
                  <div className="text-xs text-gray-600">Minimum Order</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#143688' }}>
                Current Pricing
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Material</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Unit</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Availability
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplier.pricing.map((row, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900 font-medium">{row.material}</td>
                        <td className="py-3 px-4 font-bold" style={{ color: '#143688' }}>
                          {row.price}
                        </td>
                        <td className="py-3 px-4 text-gray-600">{row.unit}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
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

            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#143688' }}>
                Recent Projects
              </h2>
              <div className="space-y-4">
                {supplier.recentProjects.map((proj, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{proj.name}</h4>
                      <span className="font-bold" style={{ color: '#143688' }}>
                        {proj.value}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{proj.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h3 className="text-xl font-bold mb-4" style={{ color: '#143688' }}>
                Quick Information
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    Materials Supplied
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {supplier.materials.map((mat, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {mat}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    Certifications
                  </h4>
                  <div className="space-y-2">
                    {supplier.certifications.map((cert, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <Award className="w-4 h-4 text-green-600" />
                        <span>{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Payment Terms
                  </h4>
                  <p className="text-sm text-gray-700">{supplier.paymentTerms}</p>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Coverage Area
                  </h4>
                  <p className="text-sm text-gray-700">{supplier.coverage}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h3 className="text-xl font-bold mb-4" style={{ color: '#143688' }}>
                Contact Information
              </h3>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{supplier.contact.address}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{supplier.contact.phone}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{supplier.contact.email}</p>
                </div>
              </div>
              <button
                onClick={() => onRequestQuoteForSupplier(supplier.name)}
                className="w-full py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                style={{ backgroundColor: '#143688' }}
              >
                Request Autonomous Quote via Gemini 4 Argon
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
