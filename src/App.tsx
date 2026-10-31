import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Search,
  TrendingDown,
  MapPin,
  ChevronLeft,
  ChevronRight,
  X,
  Phone,
  Mail,
  Check,
  UserPlus,
  ExternalLink,
  TrendingUp,
  Users,
  DollarSign,
  Minus,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Send,
} from 'lucide-react';
import {
  FEATURED_SUPPLIERS,
  EXAMPLE_CONTRACTOR_PROJECTS,
  EXAMPLE_SUPPLIER_CATALOGS,
  CONTRACTOR_OPPORTUNITIES,
  SupplierSummary,
  ContractorOpportunity,
} from './data/examples';
import {
  runHammerFrontierAgent,
  runNailFrontierAgent,
  parseUploadedBoMFile,
  parseUploadedCatalogFile,
  synthesizeBoMFromPrompt,
  synthesizeCatalogFromPrompt,
  generateAutonomousRfqPackage,
  generateSupplierTenderBid,
  HammerAgentRunResult,
  NailAgentRunResult,
} from './services/geminiArgonAgent';
import {
  FrontierAgentTracePanel,
  GeminiArgonConfigModal,
  AutonomousRfqModal,
  SupplierTenderBidModal,
} from './components/FrontierAgentTracePanel';
import {
  AuthUser,
  LoginModal,
  PortalSwitcherHeader,
  SearchAndUploadBar,
  QuickExamplePill,
} from './components/PortalShared';
import { LandingPage, SupplierProfilePage } from './components/LandingAndProfilePages';

const HAMMER_STEPS = [
  'Document Parsing',
  'Semantic Analysis',
  'Supplier Matching',
  'Cost Optimization',
];

const NAIL_STEPS = [
  'Catalog Parsing',
  'Market Analysis',
  'Demand Forecasting',
  'Pricing Optimization',
];

const NEURAL_NODES = [
  { x: 15, y: 25, layer: 1 },
  { x: 15, y: 50, layer: 1 },
  { x: 15, y: 75, layer: 1 },
  { x: 38, y: 20, layer: 2 },
  { x: 38, y: 40, layer: 2 },
  { x: 38, y: 60, layer: 2 },
  { x: 38, y: 80, layer: 2 },
  { x: 62, y: 25, layer: 3 },
  { x: 62, y: 50, layer: 3 },
  { x: 62, y: 75, layer: 3 },
  { x: 85, y: 35, layer: 4 },
  { x: 85, y: 65, layer: 4 },
];

const NEURAL_EDGES = [
  { from: 0, to: 3 },
  { from: 0, to: 4 },
  { from: 1, to: 4 },
  { from: 1, to: 5 },
  { from: 2, to: 5 },
  { from: 2, to: 6 },
  { from: 3, to: 7 },
  { from: 4, to: 7 },
  { from: 4, to: 8 },
  { from: 5, to: 8 },
  { from: 5, to: 9 },
  { from: 6, to: 9 },
  { from: 7, to: 10 },
  { from: 8, to: 10 },
  { from: 8, to: 11 },
  { from: 9, to: 11 },
];

const BASE_PREFIX = window.location.pathname.startsWith('/hammer-and-nail')
  ? '/hammer-and-nail'
  : '';

function getNormalizedRoute(): string {
  const raw = window.location.pathname || '/';
  if (BASE_PREFIX && raw.startsWith(BASE_PREFIX)) {
    const stripped = raw.slice(BASE_PREFIX.length);
    return stripped.startsWith('/') ? stripped : `/${stripped}`;
  }
  return raw;
}

export function App() {
  const [route, setRoute] = useState<string>(() => getNormalizedRoute());
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [engineConfigOpen, setEngineConfigOpen] = useState(false);

  // Contractor Portal State
  const [activeProjectId, setActiveProjectId] = useState<string>(EXAMPLE_CONTRACTOR_PROJECTS[0].id);
  const [hammerProcessing, setHammerProcessing] = useState(false);
  const [hammerProgress, setHammerProgress] = useState(100);
  const [hammerStepIdx, setHammerStepIdx] = useState(3);
  const [hammerResult, setHammerResult] = useState<HammerAgentRunResult | null>(null);
  const [expandedBoMRows, setExpandedBoMRows] = useState<Record<number, boolean>>({});
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [selectedSupplierModal, setSelectedSupplierModal] = useState<SupplierSummary | null>(null);
  const [connectedSuppliers, setConnectedSuppliers] = useState<number[]>([]);
  const [rfqModalSupplier, setRfqModalSupplier] = useState<string | null>(null);

  // Supplier Portal State
  const [activeCatalogId, setActiveCatalogId] = useState<string>(EXAMPLE_SUPPLIER_CATALOGS[0].id);
  const [nailProcessing, setNailProcessing] = useState(false);
  const [nailProgress, setNailProgress] = useState(100);
  const [nailStepIdx, setNailStepIdx] = useState(3);
  const [nailResult, setNailResult] = useState<NailAgentRunResult | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<ContractorOpportunity | null>(null);

  // Sync browser history
  useEffect(() => {
    const onPopState = () => setRoute(getNormalizedRoute());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (newPath: string) => {
    const targetUrl = BASE_PREFIX
      ? `${BASE_PREFIX}${newPath === '/' ? '/' : newPath}`
      : newPath;
    window.history.pushState({}, '', targetUrl);
    setRoute(newPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Pre-load initial Gemini 4 Argon results so the portals are immediately rich and functional
  useEffect(() => {
    const defaultProj = EXAMPLE_CONTRACTOR_PROJECTS[0];
    runHammerFrontierAgent({
      prompt: defaultProj.defaultPrompt,
      projectTitle: defaultProj.title,
      fileName: defaultProj.fileName,
      inputItems: defaultProj.items,
    }).then((res) => setHammerResult(res));

    const defaultCat = EXAMPLE_SUPPLIER_CATALOGS[0];
    runNailFrontierAgent({
      prompt: defaultCat.defaultPrompt,
      catalogTitle: defaultCat.title,
      fileName: defaultCat.fileName,
      inputItems: defaultCat.items,
    }).then((res) => setNailResult(res));
  }, []);

  const triggerHammerAnimationAndRun = async (params: {
    prompt: string;
    projectTitle: string;
    fileName: string;
    inputItems: typeof EXAMPLE_CONTRACTOR_PROJECTS[0]['items'];
  }) => {
    setHammerProcessing(true);
    setHammerProgress(0);
    setHammerStepIdx(0);
    setExpandedBoMRows({});

    const progressTimer = setInterval(() => {
      setHammerProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + 4;
      });
    }, 60);

    const stepTimer = setInterval(() => {
      setHammerStepIdx((prev) => (prev < HAMMER_STEPS.length - 1 ? prev + 1 : prev));
    }, 390);

    const result = await runHammerFrontierAgent(params);

    setTimeout(() => {
      clearInterval(progressTimer);
      clearInterval(stepTimer);
      setHammerProgress(100);
      setHammerStepIdx(HAMMER_STEPS.length - 1);
      setHammerResult(result);
      setHammerProcessing(false);
    }, 1650);
  };

  const triggerNailAnimationAndRun = async (params: {
    prompt: string;
    catalogTitle: string;
    fileName: string;
    inputItems: typeof EXAMPLE_SUPPLIER_CATALOGS[0]['items'];
  }) => {
    setNailProcessing(true);
    setNailProgress(0);
    setNailStepIdx(0);

    const progressTimer = setInterval(() => {
      setNailProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + 4;
      });
    }, 60);

    const stepTimer = setInterval(() => {
      setNailStepIdx((prev) => (prev < NAIL_STEPS.length - 1 ? prev + 1 : prev));
    }, 390);

    const result = await runNailFrontierAgent(params);

    setTimeout(() => {
      clearInterval(progressTimer);
      clearInterval(stepTimer);
      setNailProgress(100);
      setNailStepIdx(NAIL_STEPS.length - 1);
      setNailResult(result);
      setNailProcessing(false);
    }, 1650);
  };

  const handleContractorSearchOrUpload = async (text: string, file: File | null) => {
    if (file) {
      const parsedItems = await parseUploadedBoMFile(file);
      setActiveProjectId('custom-upload');
      await triggerHammerAnimationAndRun({
        prompt: text || `Uploaded BoM file: ${file.name}`,
        projectTitle: file.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' '),
        fileName: file.name,
        inputItems: parsedItems,
      });
    } else {
      const synthesized = synthesizeBoMFromPrompt(text);
      const matchedProj = EXAMPLE_CONTRACTOR_PROJECTS.find((p) => p.items === synthesized);
      setActiveProjectId(matchedProj ? matchedProj.id : 'custom-prompt');
      await triggerHammerAnimationAndRun({
        prompt: text,
        projectTitle: matchedProj
          ? matchedProj.title
          : `Custom Procurement Query: "${text.slice(0, 48)}"`,
        fileName: matchedProj ? matchedProj.fileName : 'Prompt_Synthesized_BoM.csv',
        inputItems: synthesized,
      });
    }
  };

  const handleSupplierSearchOrUpload = async (text: string, file: File | null) => {
    if (file) {
      const parsedItems = await parseUploadedCatalogFile(file);
      setActiveCatalogId('custom-upload');
      await triggerNailAnimationAndRun({
        prompt: text || `Uploaded Catalog file: ${file.name}`,
        catalogTitle: file.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' '),
        fileName: file.name,
        inputItems: parsedItems,
      });
    } else {
      const synthesized = synthesizeCatalogFromPrompt(text);
      const matchedCat = EXAMPLE_SUPPLIER_CATALOGS.find((c) => c.items === synthesized);
      setActiveCatalogId(matchedCat ? matchedCat.id : 'custom-prompt');
      await triggerNailAnimationAndRun({
        prompt: text,
        catalogTitle: matchedCat
          ? matchedCat.title
          : `Custom Inventory Query: "${text.slice(0, 48)}"`,
        fileName: matchedCat ? matchedCat.fileName : 'Prompt_Synthesized_Catalog.csv',
        inputItems: synthesized,
      });
    }
  };

  const handleSelectSupplierOptionForBoMItem = (itemId: number, optionIndex: number) => {
    if (!hammerResult) return;
    const updatedItems = hammerResult.items.map((item) => {
      if (item.id !== itemId) return item;
      const chosen = item.supplierOptions[optionIndex] || item.supplierOptions[0];
      const newProjectedPrice = Math.round(chosen.pricePerUnit * item.quantity);
      const newSavingsAmount = Math.max(0, item.baselineMarketTotal - newProjectedPrice);
      const newSavingsPercent =
        item.baselineMarketTotal > 0
          ? Number(((newSavingsAmount / item.baselineMarketTotal) * 100).toFixed(1))
          : 0;
      return {
        ...item,
        selectedSupplierIndex: optionIndex,
        recommendedSupplier: chosen.name,
        supplierDistance: chosen.distance,
        projectedPrice: newProjectedPrice,
        savingsAmount: newSavingsAmount,
        savingsPercent: newSavingsPercent,
      };
    });
    const totalOptimizedCost = updatedItems.reduce((s, i) => s + i.projectedPrice, 0);
    const totalSavings = Math.max(0, hammerResult.totalBaselineCost - totalOptimizedCost);
    const savingsPercentage =
      hammerResult.totalBaselineCost > 0
        ? Number(((totalSavings / hammerResult.totalBaselineCost) * 100).toFixed(1))
        : 0;
    setHammerResult({
      ...hammerResult,
      items: updatedItems,
      totalOptimizedCost,
      totalSavings,
      savingsPercentage,
    });
  };

  const handleApplyOptimalCatalogPrices = () => {
    if (!nailResult) return;
    const updated = nailResult.items.map((item) => ({
      ...item,
      yourPrice: item.recommendedOptimalPrice,
      verificationStatus: 'VERIFIED_PASS' as const,
      agentActionNote: `Applied Gemini 4 Argon optimal price (£${item.recommendedOptimalPrice.toFixed(2)}/${item.unit}). Verified >22% gross margin floor.`,
    }));
    setNailResult({
      ...nailResult,
      items: updated,
    });
  };

  const contractorExamplePills: QuickExamplePill[] = EXAMPLE_CONTRACTOR_PROJECTS.map((proj) => ({
    id: proj.id,
    shortLabel: proj.shortLabel,
    title: proj.title,
    fileName: proj.fileName,
    csvUrl: proj.csvUrl,
    defaultPrompt: proj.defaultPrompt,
    itemCount: proj.items.length,
  }));

  const supplierExamplePills: QuickExamplePill[] = EXAMPLE_SUPPLIER_CATALOGS.map((cat) => ({
    id: cat.id,
    shortLabel: cat.shortLabel,
    title: cat.title,
    fileName: cat.fileName,
    csvUrl: cat.csvUrl,
    defaultPrompt: cat.defaultPrompt,
    itemCount: cat.items.length,
  }));

  const handleAuthenticated = (newUser: AuthUser) => {
    setUser(newUser);
    try {
      localStorage.setItem('user', JSON.stringify(newUser));
    } catch {
      // ignore
    }
  };

  const handleLogout = () => {
    setUser(null);
    try {
      localStorage.removeItem('user');
    } catch {
      // ignore
    }
  };

  const toggleConnectSupplier = (id: number) => {
    setConnectedSuppliers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const visibleSuppliers = [
    FEATURED_SUPPLIERS[carouselIdx % FEATURED_SUPPLIERS.length],
    FEATURED_SUPPLIERS[(carouselIdx + 1) % FEATURED_SUPPLIERS.length],
    FEATURED_SUPPLIERS[(carouselIdx + 2) % FEATURED_SUPPLIERS.length],
  ];

  // Route: Supplier Full Profile
  if (route.startsWith('/supplier/')) {
    const idPart = Number(route.split('/supplier/')[1]);
    return (
      <>
        <SupplierProfilePage
          supplierId={idPart}
          onNavigate={navigate}
          onRequestQuoteForSupplier={(supplierName) => setRfqModalSupplier(supplierName)}
        />
        <AutonomousRfqModal
          isOpen={Boolean(rfqModalSupplier)}
          onClose={() => setRfqModalSupplier(null)}
          supplierName={rfqModalSupplier || ''}
          rfqData={
            rfqModalSupplier && hammerResult
              ? generateAutonomousRfqPackage({
                  supplierName: rfqModalSupplier,
                  projectTitle: hammerResult.projectTitle,
                  items: hammerResult.items,
                })
              : null
          }
        />
      </>
    );
  }

  // Route: Supplier Portal
  if (route === '/supplier') {
    return (
      <div className="min-h-screen bg-slate-50 pb-16">
        <PortalSwitcherHeader
          activePortal="supplier"
          onNavigate={navigate}
          user={user}
          onOpenLogin={() => {
            setAuthModalMode('login');
            setAuthModalOpen(true);
          }}
          onLogout={handleLogout}
          onOpenEngineConfig={() => setEngineConfigOpen(true)}
        />

        {/* Hero Banner */}
        <div
          className="text-white pt-10 pb-16 px-4 sm:px-6"
          style={{
            background: 'linear-gradient(135deg, #0b1f52 0%, #143688 55%, #1e40af 100%)',
          }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/25 px-3 py-1 text-xs font-semibold text-blue-100 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-sky-300" />
              <span>Nail Frontier Agent • Powered by Gemini 4 Argon</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
              Supplier Portal
            </h1>
            <p className="text-blue-100 text-base sm:text-lg max-w-2xl">
              Upload your product catalog and let Nail Agent benchmark regional rates, verify margin guardrails, and match active contractor tenders.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 space-y-8">
          {/* Main Workspace Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-slate-200/90">
            <div className="mb-6">
              <div className="text-center mb-7">
                <h2
                  className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-2"
                  style={{ color: '#143688' }}
                >
                  QUIT THE MANUAL QUOTING GRIND.
                </h2>
                <p className="text-base sm:text-xl font-semibold text-slate-600">
                  TURN YOUR INVENTORY INTO AN AUTONOMOUS SALES FORCE WITH{' '}
                  <span className="gradient-text font-extrabold">NAIL AI.</span>
                </p>
              </div>
              <SearchAndUploadBar
                placeholder="Find the best contractors or filter your inventory catalog..."
                examplePills={supplierExamplePills}
                activeExampleId={activeCatalogId}
                exampleSectionLabel="Example Supplier Catalogs (Instant Gemini 4 Argon Run)"
                onRunAgentWithTextOrFile={handleSupplierSearchOrUpload}
                onSelectExamplePill={(pill) => {
                  const found = EXAMPLE_SUPPLIER_CATALOGS.find((c) => c.id === pill.id);
                  if (found) {
                    setActiveCatalogId(found.id);
                    triggerNailAnimationAndRun({
                      prompt: found.defaultPrompt,
                      catalogTitle: found.title,
                      fileName: found.fileName,
                      inputItems: found.items,
                    });
                  }
                }}
              />
            </div>

            {nailProcessing && (
              <div
                className="mt-8 rounded-2xl p-6 sm:p-8 text-white shadow-inner"
                style={{
                  background: 'linear-gradient(135deg, #0b1f52 0%, #143688 60%, #1e40af 100%)',
                }}
              >
                <div className="max-w-2xl mx-auto">
                  <h3 className="text-xl sm:text-2xl font-bold mb-6 text-center">
                    Nail Agent Processing (Gemini 4 Argon)
                  </h3>
                  <div className="mb-8">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-center">
                      {NAIL_STEPS.map((step, idx) => (
                        <div
                          key={step}
                          className={`text-xs sm:text-sm py-1 px-2 rounded-lg ${
                            idx <= nailStepIdx
                              ? 'bg-white/15 text-white font-bold'
                              : 'text-blue-300'
                          }`}
                        >
                          {step}
                        </div>
                      ))}
                    </div>
                    <div className="w-full bg-blue-950/80 rounded-full h-3 overflow-hidden p-0.5">
                      <div
                        className="bg-white h-full transition-all duration-300 rounded-full"
                        style={{ width: `${nailProgress}%` }}
                      />
                    </div>
                  </div>
                  <div className="relative h-56 sm:h-64 bg-blue-950/40 border border-white/15 rounded-xl p-6">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      {NEURAL_EDGES.map((edge, idx) => {
                        const from = NEURAL_NODES[edge.from];
                        const to = NEURAL_NODES[edge.to];
                        const active = (nailProgress / 100) * NEURAL_EDGES.length > idx;
                        return (
                          <line
                            key={idx}
                            x1={from.x}
                            y1={from.y}
                            x2={to.x}
                            y2={to.y}
                            stroke={active ? '#ffffff' : '#3b82f6'}
                            strokeWidth={active ? '0.6' : '0.3'}
                            opacity={active ? '0.85' : '0.3'}
                            className="transition-all duration-300"
                          />
                        );
                      })}
                      {NEURAL_NODES.map((node, idx) => {
                        const active = node.layer <= nailStepIdx + 1;
                        return (
                          <g key={idx}>
                            <circle
                              cx={node.x}
                              cy={node.y}
                              r={active ? '3' : '2'}
                              fill={active ? '#ffffff' : '#60a5fa'}
                              className="transition-all duration-300"
                            />
                            {active && (
                              <circle
                                cx={node.x}
                                cy={node.y}
                                r="5"
                                fill="none"
                                stroke="#ffffff"
                                strokeWidth="0.5"
                                opacity="0.5"
                                className="animate-ping"
                              />
                            )}
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                  <p className="text-center text-blue-100 mt-4 text-xs sm:text-sm">
                    Gemini 4 Argon is analyzing market conditions, running margin-floor verification
                    loops, and matching with active contractor tenders...
                  </p>
                </div>
              </div>
            )}

            {!nailProcessing && nailResult && (
              <div className="mt-8">
                <FrontierAgentTracePanel
                  agentName="Nail"
                  engineVersion={nailResult.engineVersion}
                  executionMode={nailResult.executionMode}
                  executiveSummary={nailResult.executiveSummary}
                  reasoningSteps={nailResult.reasoningSteps}
                  verificationEvents={nailResult.verificationEvents}
                  selfCorrectionsApplied={nailResult.selfCorrectionsApplied}
                  savingsBadgeText={`+${nailResult.projectedRevenueLiftPercent}% Projected Revenue Lift`}
                  onOpenEngineConfig={() => setEngineConfigOpen(true)}
                />

                {/* Catalog Analysis Table Section */}
                <div className="mt-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold" style={{ color: '#143688' }}>
                        Catalog Analysis & Market Intelligence
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Active Catalog:{' '}
                        <strong className="text-slate-800">{nailResult.catalogTitle}</strong> (
                        <span className="font-mono">{nailResult.sourceFileName}</span>)
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={handleApplyOptimalCatalogPrices}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white hover:opacity-95 transition-opacity cursor-pointer shadow-xs"
                        style={{ backgroundColor: '#143688' }}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Apply All Gemini 4 Argon Optimal Prices
                      </button>
                      <div className="px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
                        Total Products:{' '}
                        <span className="font-bold text-slate-900">{nailResult.items.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs">
                    <table className="w-full min-w-[960px]">
                      <thead
                        className="text-white"
                        style={{ backgroundColor: '#143688' }}
                      >
                        <tr>
                          <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider">
                            SKU & Status
                          </th>
                          <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider">
                            Product Name & AI Telemetry
                          </th>
                          <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider">
                            Unit
                          </th>
                          <th className="px-4 py-3.5 text-right text-xs font-bold uppercase tracking-wider">
                            Your Price
                          </th>
                          <th className="px-4 py-3.5 text-right text-xs font-bold uppercase tracking-wider">
                            Market Benchmark
                          </th>
                          <th className="px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider">
                            Supply
                          </th>
                          <th className="px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider">
                            Demand
                          </th>
                          <th className="px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider">
                            Competitors
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {nailResult.items.map((item, idx) => {
                          const diff = item.yourPrice - item.marketPrice;
                          const diffPct = ((diff / item.marketPrice) * 100).toFixed(1);
                          return (
                            <tr
                              key={item.id}
                              className={`${
                                idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
                              } hover:bg-blue-50/30 transition-colors`}
                            >
                              <td className="px-4 py-4 text-xs font-mono text-slate-900 align-top whitespace-nowrap">
                                <div className="font-bold">{item.sku}</div>
                                <span
                                  className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-sans text-[10px] font-bold ${
                                    item.verificationStatus === 'SELF_CORRECTED'
                                      ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  }`}
                                >
                                  {item.verificationStatus === 'SELF_CORRECTED'
                                    ? `Optimal: £${item.recommendedOptimalPrice.toFixed(2)}`
                                    : 'Verified Band'}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-sm text-slate-900 align-top max-w-xs">
                                <div className="font-semibold text-slate-900">{item.name}</div>
                                <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                                  {item.agentActionNote}
                                </div>
                              </td>
                              <td className="px-4 py-4 text-xs align-top whitespace-nowrap">
                                <span className="px-2.5 py-1 bg-blue-50 text-[#143688] border border-blue-200/60 rounded-full font-semibold">
                                  {item.category}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-xs font-medium text-slate-600 align-top whitespace-nowrap">
                                {item.unit}
                              </td>
                              <td className="px-4 py-4 text-sm text-right font-bold font-mono text-slate-900 align-top whitespace-nowrap">
                                £{item.yourPrice.toFixed(2)}
                              </td>
                              <td className="px-4 py-4 text-sm text-right align-top whitespace-nowrap">
                                <div className="flex flex-col items-end">
                                  <span
                                    className="font-bold font-mono"
                                    style={{ color: '#143688' }}
                                  >
                                    £{item.marketPrice.toFixed(2)}
                                  </span>
                                  <span
                                    className={`text-[11px] font-semibold mt-0.5 ${
                                      diff > 0
                                        ? 'text-red-600'
                                        : diff < 0
                                        ? 'text-emerald-600'
                                        : 'text-slate-500'
                                    }`}
                                  >
                                    {diff > 0 ? (
                                      <>+{diffPct}% above</>
                                    ) : diff < 0 ? (
                                      <>{diffPct}% below</>
                                    ) : (
                                      <>At market</>
                                    )}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-center align-top whitespace-nowrap">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-block ${
                                    item.supplyCondition === 'Abundant'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : item.supplyCondition === 'Normal'
                                      ? 'bg-blue-100 text-blue-800'
                                      : item.supplyCondition === 'Limited'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {item.supplyCondition}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-center align-top whitespace-nowrap">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${
                                    item.demand.includes('Very')
                                      ? 'bg-purple-100 text-purple-800'
                                      : item.demand === 'High'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : item.demand === 'Moderate'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {item.demand.includes('Very') || item.demand === 'High' ? (
                                    <TrendingUp className="w-3 h-3" />
                                  ) : item.demand === 'Moderate' ? (
                                    <Minus className="w-3 h-3" />
                                  ) : (
                                    <TrendingDown className="w-3 h-3" />
                                  )}
                                  {item.demand}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-sm text-center font-bold text-slate-700 align-top whitespace-nowrap">
                                {item.competitors}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recent Contractor Opportunities Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold" style={{ color: '#143688' }}>
                  Recent Contractor Opportunities
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Click any live contractor tender below to synthesize an autonomous Gemini 4 Argon bid package
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800 self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                3 Live Tenders Matched
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {CONTRACTOR_OPPORTUNITIES.map((opp) => (
                <div
                  key={opp.id}
                  onClick={() => setSelectedOpportunity(opp)}
                  className="group border border-slate-200 rounded-xl p-5 hover:border-[#143688] hover:bg-blue-50/20 hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h4 className="font-bold text-base text-slate-900 group-hover:text-[#143688] transition-colors">
                        {opp.title}
                      </h4>
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                        {opp.matchPercent}% Catalog Match
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        • {opp.contractorName} ({opp.location})
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600">{opp.materialsSummary}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="font-semibold text-slate-800">
                        Est. Package Value: <strong style={{ color: '#143688' }}>{opp.value}</strong>
                      </span>
                      <span>•</span>
                      <span>{opp.distanceMiles} miles away</span>
                      <span>•</span>
                      <span className="text-amber-700 font-medium">{opp.deadline}</span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <span
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs group-hover:opacity-95 transition-opacity"
                      style={{ backgroundColor: '#143688' }}
                    >
                      <Send className="w-3.5 h-3.5" />
                      Generate Autonomous Bid
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3 Feature Highlight Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
              <div
                className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center text-white shadow-xs"
                style={{ backgroundColor: '#143688' }}
              >
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-1.5" style={{ color: '#143688' }}>
                Market Insights
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Real-time demand forecasting and regional clearing price telemetry across UK construction sectors.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
              <div
                className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center text-white shadow-xs"
                style={{ backgroundColor: '#143688' }}
              >
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-1.5" style={{ color: '#143688' }}>
                Contractor Network
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Automatic SKU-level matching with active commercial and civil tenders seeking your inventory.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
              <div
                className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center text-white shadow-xs"
                style={{ backgroundColor: '#143688' }}
              >
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-1.5" style={{ color: '#143688' }}>
                Smart Pricing
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Gemini 4 Argon margin-guard recommendations that maximize win probability without eroding gross margin.
              </p>
            </div>
          </div>
        </div>

        <LoginModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialMode={authModalMode}
          onAuthenticated={handleAuthenticated}
        />

        <GeminiArgonConfigModal
          isOpen={engineConfigOpen}
          onClose={() => setEngineConfigOpen(false)}
          onSaved={() => {
            if (nailResult) {
              const cat =
                EXAMPLE_SUPPLIER_CATALOGS.find((c) => c.id === activeCatalogId) ||
                EXAMPLE_SUPPLIER_CATALOGS[0];
              triggerNailAnimationAndRun({
                prompt: nailResult.promptUsed,
                catalogTitle: cat.title,
                fileName: cat.fileName,
                inputItems: cat.items,
              });
            }
          }}
        />

        <SupplierTenderBidModal
          isOpen={Boolean(selectedOpportunity)}
          onClose={() => setSelectedOpportunity(null)}
          opportunityTitle={selectedOpportunity?.title || ''}
          contractorName={selectedOpportunity?.contractorName || ''}
          bidData={
            selectedOpportunity && nailResult
              ? generateSupplierTenderBid({
                  opportunity: selectedOpportunity,
                  catalogItems: nailResult.items,
                })
              : null
          }
        />
      </div>
    );
  }

  // Route: Contractor Portal
  if (route === '/contractor') {
    return (
      <div className="min-h-screen bg-slate-50 pb-16">
        <PortalSwitcherHeader
          activePortal="contractor"
          onNavigate={navigate}
          user={user}
          onOpenLogin={() => {
            setAuthModalMode('login');
            setAuthModalOpen(true);
          }}
          onLogout={handleLogout}
          onOpenEngineConfig={() => setEngineConfigOpen(true)}
        />

        {/* Hero Banner */}
        <div
          className="text-white pt-10 pb-16 px-4 sm:px-6"
          style={{
            background: 'linear-gradient(135deg, #0b1f52 0%, #143688 55%, #1e40af 100%)',
          }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/25 px-3 py-1 text-xs font-semibold text-blue-100 mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Hammer Frontier Agent • Powered by Gemini 4 Argon</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
              Contractor Portal
            </h1>
            <p className="text-blue-100 text-base sm:text-lg max-w-2xl">
              Upload your Bill of Quantities and let Hammer Agent match verified suppliers, enforce UKCA/BS EN compliance, and cut material costs.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 space-y-8">
          {/* Main Workspace Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-slate-200/90">
            <div className="mb-6">
              <div className="text-center mb-7">
                <h2
                  className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-2"
                  style={{ color: '#143688' }}
                >
                  STOP OVERPAYING FOR MATERIALS.
                </h2>
                <p className="text-base sm:text-xl font-semibold text-slate-600">
                  LEVEL UP YOUR MARGINS WITH{' '}
                  <span className="gradient-text font-extrabold">HAMMER AI.</span>
                </p>
              </div>
              <SearchAndUploadBar
                placeholder="Find the best suppliers at hand (e.g., C35/45 concrete, B500B rebar, S355 steel)..."
                examplePills={contractorExamplePills}
                activeExampleId={activeProjectId}
                exampleSectionLabel="Example Construction Projects & BoMs (Instant Gemini 4 Argon Run)"
                onRunAgentWithTextOrFile={handleContractorSearchOrUpload}
                onSelectExamplePill={(pill) => {
                  const found = EXAMPLE_CONTRACTOR_PROJECTS.find((p) => p.id === pill.id);
                  if (found) {
                    setActiveProjectId(found.id);
                    triggerHammerAnimationAndRun({
                      prompt: found.defaultPrompt,
                      projectTitle: found.title,
                      fileName: found.fileName,
                      inputItems: found.items,
                    });
                  }
                }}
              />
            </div>

            {hammerProcessing && (
              <div
                className="mt-8 rounded-2xl p-6 sm:p-8 text-white shadow-inner"
                style={{
                  background: 'linear-gradient(135deg, #0b1f52 0%, #143688 60%, #1e40af 100%)',
                }}
              >
                <div className="max-w-2xl mx-auto">
                  <h3 className="text-xl sm:text-2xl font-bold mb-6 text-center">
                    Hammer Agent Processing (Gemini 4 Argon)
                  </h3>
                  <div className="mb-8">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-center">
                      {HAMMER_STEPS.map((step, idx) => (
                        <div
                          key={step}
                          className={`text-xs sm:text-sm py-1 px-2 rounded-lg ${
                            idx <= hammerStepIdx
                              ? 'bg-white/15 text-white font-bold'
                              : 'text-blue-300'
                          }`}
                        >
                          {step}
                        </div>
                      ))}
                    </div>
                    <div className="w-full bg-blue-950/80 rounded-full h-3 overflow-hidden p-0.5">
                      <div
                        className="bg-white h-full transition-all duration-300 rounded-full"
                        style={{ width: `${hammerProgress}%` }}
                      />
                    </div>
                  </div>
                  <div className="relative h-56 sm:h-64 bg-blue-950/40 border border-white/15 rounded-xl p-6">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      {NEURAL_EDGES.map((edge, idx) => {
                        const from = NEURAL_NODES[edge.from];
                        const to = NEURAL_NODES[edge.to];
                        const active = (hammerProgress / 100) * NEURAL_EDGES.length > idx;
                        return (
                          <line
                            key={idx}
                            x1={from.x}
                            y1={from.y}
                            x2={to.x}
                            y2={to.y}
                            stroke={active ? '#ffffff' : '#3b82f6'}
                            strokeWidth={active ? '0.6' : '0.3'}
                            opacity={active ? '0.85' : '0.3'}
                            className="transition-all duration-300"
                          />
                        );
                      })}
                      {NEURAL_NODES.map((node, idx) => {
                        const active = node.layer <= hammerStepIdx + 1;
                        return (
                          <g key={idx}>
                            <circle
                              cx={node.x}
                              cy={node.y}
                              r={active ? '3' : '2'}
                              fill={active ? '#ffffff' : '#60a5fa'}
                              className="transition-all duration-300"
                            />
                            {active && (
                              <circle
                                cx={node.x}
                                cy={node.y}
                                r="5"
                                fill="none"
                                stroke="#ffffff"
                                strokeWidth="0.5"
                                opacity="0.5"
                                className="animate-ping"
                              />
                            )}
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                  <p className="text-center text-blue-100 mt-4 text-xs sm:text-sm">
                    Gemini 4 Argon is parsing your BOQ, verifying UKCA/BS EN/CARES compliance,
                    running self-correction critic loops, and optimizing supplier allocation...
                  </p>
                </div>
              </div>
            )}

            {!hammerProcessing && hammerResult && (
              <div className="mt-8">
                <FrontierAgentTracePanel
                  agentName="Hammer"
                  engineVersion={hammerResult.engineVersion}
                  executionMode={hammerResult.executionMode}
                  executiveSummary={hammerResult.executiveSummary}
                  reasoningSteps={hammerResult.reasoningSteps}
                  verificationEvents={hammerResult.verificationEvents}
                  selfCorrectionsApplied={hammerResult.selfCorrectionsApplied}
                  savingsBadgeText={`Saved £${hammerResult.totalSavings.toLocaleString()} (${hammerResult.savingsPercentage}%)`}
                  onOpenEngineConfig={() => setEngineConfigOpen(true)}
                />

                {/* BOQ Analysis Table Section */}
                <div className="mt-8">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold" style={{ color: '#143688' }}>
                        Bill of Quantities Analysis Results
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Project:{' '}
                        <strong className="text-slate-800">{hammerResult.projectTitle}</strong> (
                        <span className="font-mono">{hammerResult.sourceFileName}</span>)
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setRfqModalSupplier(
                            hammerResult.items[0]?.recommendedSupplier || 'Selco Builders Warehouse'
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white hover:opacity-95 transition-opacity cursor-pointer shadow-xs"
                        style={{ backgroundColor: '#143688' }}
                      >
                        <Send className="w-3.5 h-3.5" />
                        Dispatch Verified RFQs
                      </button>
                      <div className="px-4 py-2 rounded-xl bg-blue-50 border border-blue-200/80 text-xs sm:text-sm text-slate-700 flex items-center gap-2">
                        <span className="font-medium">Best Case Total:</span>
                        <span className="text-base sm:text-lg font-extrabold font-mono" style={{ color: '#143688' }}>
                          £{hammerResult.totalOptimizedCost.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Clean, Non-Clipping Responsive Table */}
                  <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs">
                    <table className="w-full min-w-[960px]">
                      <thead
                        className="text-white"
                        style={{ backgroundColor: '#143688' }}
                      >
                        <tr>
                          <th className="w-[140px] px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider">
                            Part Number
                          </th>
                          <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider">
                            Description & Specification
                          </th>
                          <th className="w-[120px] px-4 py-3.5 text-right text-xs font-bold uppercase tracking-wider">
                            Qty & Unit
                          </th>
                          <th className="w-[310px] px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider">
                            Recommended Suppliers (Click to Switch)
                          </th>
                          <th className="w-[165px] px-4 py-3.5 text-right text-xs font-bold uppercase tracking-wider">
                            Projected Price
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {hammerResult.items.map((item, idx) => {
                          const isRowExpanded = Boolean(expandedBoMRows[item.id]);
                          const optionsToShow = isRowExpanded
                            ? item.supplierOptions
                            : item.supplierOptions.slice(0, 3);
                          return (
                            <tr
                              key={item.id}
                              className={`${
                                idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
                              } hover:bg-blue-50/20 transition-colors`}
                            >
                              <td className="px-4 py-4 text-xs font-mono text-slate-900 align-top whitespace-nowrap">
                                <div className="font-bold">{item.partNumber}</div>
                                <span
                                  className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-sans text-[10px] font-bold ${
                                    item.verificationStatus === 'SELF_CORRECTED'
                                      ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  }`}
                                  title={item.verificationSummary}
                                >
                                  {item.verificationStatus === 'SELF_CORRECTED' ? (
                                    <>
                                      <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                                      Self-Corrected
                                    </>
                                  ) : (
                                    <>
                                      <ShieldCheck className="w-2.5 h-2.5 shrink-0" />
                                      Verified Pass
                                    </>
                                  )}
                                </span>
                              </td>

                              <td className="px-4 py-4 text-sm text-slate-900 align-top">
                                <div className="font-bold text-slate-900">{item.description}</div>
                                <div className="inline-block mt-1 rounded-md bg-slate-100 border border-slate-200/80 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                                  Spec: {item.specification}
                                </div>
                                {item.rejectedCandidate && (
                                  <div className="mt-2 rounded-lg bg-amber-50/90 border border-amber-200/90 p-2 text-[11px] text-amber-950 leading-relaxed">
                                    <strong className="font-bold">Critic Loop Rejected:</strong>{' '}
                                    {item.rejectedCandidate.supplierName} (£
                                    {item.rejectedCandidate.originalPricePerUnit}/{item.unit}) —{' '}
                                    {item.rejectedCandidate.reason}
                                  </div>
                                )}
                              </td>

                              <td className="px-4 py-4 text-right align-top whitespace-nowrap">
                                <div className="text-sm font-bold font-mono text-slate-900">
                                  {item.quantity.toLocaleString()}
                                </div>
                                <span className="inline-block mt-0.5 text-xs font-medium text-slate-500">
                                  {item.unit}
                                </span>
                              </td>

                              <td className="px-4 py-4 text-sm align-top">
                                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                                  {optionsToShow.map((opt, optIdx) => {
                                    const isSelected = optIdx === item.selectedSupplierIndex;
                                    return (
                                      <div
                                        key={`${opt.id}-${optIdx}`}
                                        onClick={() =>
                                          handleSelectSupplierOptionForBoMItem(item.id, optIdx)
                                        }
                                        className={`px-3 py-2 text-xs flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                                          isSelected
                                            ? 'text-white font-semibold'
                                            : 'text-slate-700 hover:bg-slate-50'
                                        } ${optIdx > 0 ? 'border-t border-slate-100' : ''}`}
                                        style={
                                          isSelected ? { backgroundColor: '#143688' } : undefined
                                        }
                                        title={`Click to select ${opt.name} (${opt.verificationNote})`}
                                      >
                                        <span className="truncate font-medium">
                                          {opt.name}{' '}
                                          <span
                                            className={
                                              isSelected ? 'text-blue-200' : 'text-slate-400'
                                            }
                                          >
                                            ({opt.distance}mi)
                                          </span>
                                        </span>
                                        <span
                                          className={`font-mono shrink-0 ${
                                            isSelected
                                              ? 'text-white font-bold'
                                              : 'text-slate-700 font-semibold'
                                          }`}
                                        >
                                          £{opt.pricePerUnit.toFixed(2)}/{item.unit}
                                        </span>
                                      </div>
                                    );
                                  })}
                                  {item.supplierOptions.length > 3 && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setExpandedBoMRows((prev) => ({
                                          ...prev,
                                          [item.id]: !prev[item.id],
                                        }))
                                      }
                                      className="w-full px-3 py-1.5 text-[11px] text-[#143688] bg-slate-50 hover:bg-blue-50/60 cursor-pointer border-t border-slate-200 text-center font-bold transition-colors"
                                    >
                                      {isRowExpanded
                                        ? 'Show Top 3 Suppliers ↑'
                                        : `Compare +${item.supplierOptions.length - 3} More Depots ↓`}
                                    </button>
                                  )}
                                </div>
                              </td>

                              <td className="px-4 py-4 text-right align-top whitespace-nowrap">
                                <div
                                  className="text-base font-extrabold font-mono"
                                  style={{ color: '#143688' }}
                                >
                                  £{item.projectedPrice.toLocaleString()}
                                </div>
                                {item.savingsAmount > 0 && (
                                  <div className="inline-block mt-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] text-emerald-800 font-bold">
                                    Save £{item.savingsAmount.toLocaleString()} ({item.savingsPercent}%)
                                  </div>
                                )}
                                <div className="mt-2">
                                  <button
                                    type="button"
                                    onClick={() => setRfqModalSupplier(item.recommendedSupplier)}
                                    className="inline-flex items-center gap-1 text-[11px] font-bold hover:underline cursor-pointer"
                                    style={{ color: '#143688' }}
                                  >
                                    <span>Request Quote →</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-slate-100/90 border-t-2 border-slate-200">
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-4 text-right text-xs sm:text-sm font-semibold text-slate-600"
                          >
                            <span>Total Line Items: </span>
                            <strong className="text-slate-900">{hammerResult.items.length}</strong>
                            <span className="mx-2">•</span>
                            <span>Market Baseline: </span>
                            <strong className="text-slate-900 font-mono">
                              £{hammerResult.totalBaselineCost.toLocaleString()}
                            </strong>
                            <span className="mx-2">•</span>
                            <span className="text-emerald-700 font-bold">
                              Verified Savings: £{hammerResult.totalSavings.toLocaleString()} (
                              {hammerResult.savingsPercentage}%)
                            </span>
                          </td>
                          <td
                            className="px-4 py-4 text-right"
                            style={{ color: '#143688' }}
                          >
                            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                              Best Case Total
                            </div>
                            <div className="text-xl font-extrabold font-mono">
                              £{hammerResult.totalOptimizedCost.toLocaleString()}
                            </div>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Featured Past Suppliers Carousel (Clean Header Controls & Zero Edge Clipping) */}
          <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-slate-200">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold" style={{ color: '#143688' }}>
                  Featured Verified Suppliers
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Click any depot card to inspect trade rates, certifications, or dispatch an autonomous RFQ
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() =>
                    setCarouselIdx(
                      (prev) => (prev - 1 + FEATURED_SUPPLIERS.length) % FEATURED_SUPPLIERS.length
                    )
                  }
                  className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center hover:bg-blue-50 hover:border-[#143688] transition-all cursor-pointer"
                  style={{ color: '#143688' }}
                  title="Previous suppliers"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() =>
                    setCarouselIdx((prev) => (prev + 1) % FEATURED_SUPPLIERS.length)
                  }
                  className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center hover:bg-blue-50 hover:border-[#143688] transition-all cursor-pointer"
                  style={{ color: '#143688' }}
                  title="Next suppliers"
                >
                  <ChevronRight className="w-6 h-5" />
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {visibleSuppliers.map((sup) => (
                <div
                  key={sup.id}
                  onClick={() => setSelectedSupplierModal(sup)}
                  className="group border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-[#143688] flex flex-col justify-between bg-white"
                >
                  <div>
                    <div className="relative h-48 overflow-hidden bg-slate-100">
                      <img
                        src={sup.image}
                        alt={sup.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 rounded-full bg-slate-900/75 backdrop-blur-xs px-2.5 py-1 text-[11px] font-semibold text-white flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-sky-300" />
                        <span>{sup.distance} mi</span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h4
                        className="font-bold text-lg mb-1 group-hover:underline"
                        style={{ color: '#143688' }}
                      >
                        {sup.name}
                      </h4>
                      <p className="text-xs text-slate-500 mb-3 truncate">{sup.address}</p>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                          Materials Supplied
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {sup.materials.map((mat, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-0.5 bg-blue-50 border border-blue-200/60 text-xs rounded-full font-semibold"
                              style={{ color: '#143688' }}
                            >
                              {mat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-bold" style={{ color: '#143688' }}>
                    <span>Inspect Depot & Request Quote</span>
                    <span>→</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Supplier Quick Modal */}
          {selectedSupplierModal && (
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedSupplierModal(null)}
            >
              <div
                className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative h-60 overflow-hidden bg-slate-900">
                  <img
                    src={selectedSupplierModal.image}
                    alt={selectedSupplierModal.name}
                    className="w-full h-full object-cover opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
                  <button
                    onClick={() => setSelectedSupplierModal(null)}
                    className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/95 shadow-lg flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5 text-slate-700" />
                  </button>
                </div>
                <div className="p-6 sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold mb-1" style={{ color: '#143688' }}>
                        {selectedSupplierModal.name}
                      </h2>
                      <div className="flex items-center text-sm text-slate-600">
                        <MapPin className="w-4 h-4 mr-1.5" style={{ color: '#143688' }} />
                        <span>{selectedSupplierModal.distance} miles away</span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleConnectSupplier(selectedSupplierModal.id)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        connectedSuppliers.includes(selectedSupplierModal.id)
                          ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-500'
                          : 'text-white hover:opacity-95 shadow-xs'
                      }`}
                      style={
                        !connectedSuppliers.includes(selectedSupplierModal.id)
                          ? { backgroundColor: '#143688' }
                          : undefined
                      }
                    >
                      {connectedSuppliers.includes(selectedSupplierModal.id) ? (
                        <>
                          <Check className="w-4 h-4" />
                          Connected
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          Connect
                        </>
                      )}
                    </button>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                      Materials Supplied
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedSupplierModal.materials.map((mat, idx) => (
                        <span
                          key={idx}
                          className="px-3.5 py-1 bg-blue-50 border border-blue-200/60 text-xs sm:text-sm rounded-full font-semibold"
                          style={{ color: '#143688' }}
                        >
                          {mat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2.5 mb-6 p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Contact Information
                    </h3>
                    <div className="flex items-start text-xs sm:text-sm text-slate-700">
                      <MapPin
                        className="w-4 h-4 mr-2.5 mt-0.5 shrink-0"
                        style={{ color: '#143688' }}
                      />
                      <span>{selectedSupplierModal.address}</span>
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-slate-700">
                      <Phone
                        className="w-4 h-4 mr-2.5 shrink-0"
                        style={{ color: '#143688' }}
                      />
                      <span>{selectedSupplierModal.phone}</span>
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-slate-700">
                      <Mail
                        className="w-4 h-4 mr-2.5 shrink-0"
                        style={{ color: '#143688' }}
                      />
                      <span>{selectedSupplierModal.email}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => {
                        const name = selectedSupplierModal.name;
                        setSelectedSupplierModal(null);
                        setRfqModalSupplier(name);
                      }}
                      className="flex-1 px-5 py-3 rounded-xl text-sm font-bold border-2 transition-colors hover:bg-slate-50 cursor-pointer"
                      style={{ borderColor: '#143688', color: '#143688' }}
                    >
                      Request Autonomous Quote
                    </button>
                    <button
                      onClick={() => {
                        const id = selectedSupplierModal.id;
                        setSelectedSupplierModal(null);
                        navigate(`/supplier/${id}`);
                      }}
                      className="flex-1 px-5 py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-95 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      style={{ backgroundColor: '#143688' }}
                    >
                      <span>View Full Profile</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3 Feature Highlight Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
              <div
                className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center text-white shadow-xs"
                style={{ backgroundColor: '#143688' }}
              >
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-1.5" style={{ color: '#143688' }}>
                Smart Matching
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                AI-powered semantic matching connects your engineering specifications with verified UK depots.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
              <div
                className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center text-white shadow-xs"
                style={{ backgroundColor: '#143688' }}
              >
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-1.5" style={{ color: '#143688' }}>
                Real-Time Quotes
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Automatic quote generation, compliance verification, and landed-cost comparison across multiple suppliers.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
              <div
                className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center text-white shadow-xs"
                style={{ backgroundColor: '#143688' }}
              >
                <TrendingDown className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-1.5" style={{ color: '#143688' }}>
                Cost Analytics
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Detailed line-item breakdown and Pareto optimization recommendations to maximize project margins.
              </p>
            </div>
          </div>
        </div>

        <LoginModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialMode={authModalMode}
          onAuthenticated={handleAuthenticated}
        />

        <GeminiArgonConfigModal
          isOpen={engineConfigOpen}
          onClose={() => setEngineConfigOpen(false)}
          onSaved={() => {
            if (hammerResult) {
              const proj =
                EXAMPLE_CONTRACTOR_PROJECTS.find((p) => p.id === activeProjectId) ||
                EXAMPLE_CONTRACTOR_PROJECTS[0];
              triggerHammerAnimationAndRun({
                prompt: hammerResult.promptUsed,
                projectTitle: proj.title,
                fileName: proj.fileName,
                inputItems: proj.items,
              });
            }
          }}
        />

        <AutonomousRfqModal
          isOpen={Boolean(rfqModalSupplier)}
          onClose={() => setRfqModalSupplier(null)}
          supplierName={rfqModalSupplier || ''}
          rfqData={
            rfqModalSupplier && hammerResult
              ? generateAutonomousRfqPackage({
                  supplierName: rfqModalSupplier,
                  projectTitle: hammerResult.projectTitle,
                  items: hammerResult.items,
                })
              : null
          }
        />
      </div>
    );
  }

  return (
    <>
      <LandingPage
        onNavigate={navigate}
        user={user}
        onOpenAuthModal={(mode) => {
          setAuthModalMode(mode);
          setAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        onOpenEngineConfig={() => setEngineConfigOpen(true)}
      />
      <LoginModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        onAuthenticated={handleAuthenticated}
      />
      <GeminiArgonConfigModal
        isOpen={engineConfigOpen}
        onClose={() => setEngineConfigOpen(false)}
        onSaved={() => {}}
      />
    </>
  );
}
