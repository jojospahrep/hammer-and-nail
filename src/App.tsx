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
  Package,
  TrendingUp,
  Users,
  DollarSign,
  Minus,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Send,
  Play,
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
    }, 65);

    const stepTimer = setInterval(() => {
      setHammerStepIdx((prev) => (prev < HAMMER_STEPS.length - 1 ? prev + 1 : prev));
    }, 420);

    const result = await runHammerFrontierAgent(params);

    setTimeout(() => {
      clearInterval(progressTimer);
      clearInterval(stepTimer);
      setHammerProgress(100);
      setHammerStepIdx(HAMMER_STEPS.length - 1);
      setHammerResult(result);
      setHammerProcessing(false);
    }, 1750);
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
    }, 65);

    const stepTimer = setInterval(() => {
      setNailStepIdx((prev) => (prev < NAIL_STEPS.length - 1 ? prev + 1 : prev));
    }, 420);

    const result = await runNailFrontierAgent(params);

    setTimeout(() => {
      clearInterval(progressTimer);
      clearInterval(stepTimer);
      setNailProgress(100);
      setNailStepIdx(NAIL_STEPS.length - 1);
      setNailResult(result);
      setNailProcessing(false);
    }, 1750);
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
        projectTitle: matchedProj ? matchedProj.title : `Custom Procurement Query: "${text.slice(0, 48)}"`,
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
        catalogTitle: matchedCat ? matchedCat.title : `Custom Inventory Query: "${text.slice(0, 48)}"`,
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

  // Route matching
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

  if (route === '/supplier') {
    return (
      <div className="min-h-screen bg-gray-50">
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

        <div className="text-white py-12" style={{ backgroundColor: '#143688' }}>
          <div className="max-w-7xl mx-auto px-6">
            <h1 className="text-4xl mb-2">Supplier Portal</h1>
            <p className="text-blue-100 text-lg">
              Upload your product catalog and let Nail Agent optimize your market positioning
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 -mt-6">
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-200">
            <div className="mb-6">
              <div className="text-center mb-8">
                <h2
                  className="text-3xl md:text-4xl font-bold tracking-tight mb-2"
                  style={{ color: '#143688' }}
                >
                  QUIT THE MANUAL QUOTING GRIND.
                </h2>
                <p className="text-xl md:text-2xl font-semibold text-gray-700">
                  TURN YOUR INVENTORY INTO AN AUTONOMOUS SALES FORCE WITH{' '}
                  <span className="gradient-text font-bold">NAIL AI.</span>
                </p>
              </div>
              <SearchAndUploadBar
                placeholder="Find the best contractors."
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
                className="mt-8 rounded-xl p-8 text-white"
                style={{ backgroundColor: '#143688' }}
              >
                <div className="max-w-2xl mx-auto">
                  <h3 className="text-2xl mb-6 text-center">
                    Nail Agent Processing (Gemini 4 Argon)
                  </h3>
                  <div className="mb-8">
                    <div className="flex justify-between mb-3">
                      {NAIL_STEPS.map((step, idx) => (
                        <div
                          key={step}
                          className={`text-sm ${
                            idx <= nailStepIdx ? 'text-white font-semibold' : 'text-blue-300'
                          }`}
                        >
                          {step}
                        </div>
                      ))}
                    </div>
                    <div className="w-full bg-blue-900 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-white h-full transition-all duration-300 rounded-full"
                        style={{ width: `${nailProgress}%` }}
                      />
                    </div>
                  </div>
                  <div className="relative h-64 bg-blue-900/40 rounded-lg p-6">
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
                            stroke={active ? '#ffffff' : '#1e40af'}
                            strokeWidth={active ? '0.5' : '0.3'}
                            opacity={active ? '0.8' : '0.3'}
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
                  <p className="text-center text-blue-100 mt-4 text-sm">
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

                <div className="mt-8">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-2xl" style={{ color: '#143688' }}>
                        Catalog Analysis & Market Intelligence
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Active Catalog: <strong className="text-gray-800">{nailResult.catalogTitle}</strong> ({nailResult.sourceFileName})
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleApplyOptimalCatalogPrices}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                        style={{ backgroundColor: '#143688' }}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Apply All Gemini 4 Argon Optimal Prices
                      </button>
                      <div className="text-sm text-gray-600">
                        Total Products:{' '}
                        <span className="font-semibold">{nailResult.items.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full">
                      <thead
                        className="text-white"
                        style={{ backgroundColor: '#143688' }}
                      >
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold">SKU</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">
                            Product Name
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Unit</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold">
                            Your Price per Unit
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-semibold">
                            Current Market Price per Unit
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-semibold">
                            Supply Condition
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-semibold">Demand</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold">
                            Competitors
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {nailResult.items.map((item, idx) => {
                          const diff = item.yourPrice - item.marketPrice;
                          const diffPct = ((diff / item.marketPrice) * 100).toFixed(1);
                          return (
                            <tr
                              key={item.id}
                              className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                            >
                              <td className="px-4 py-3.5 text-sm font-mono text-gray-900">
                                <div>{item.sku}</div>
                                <span
                                  className={`mt-1 inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                                    item.verificationStatus === 'SELF_CORRECTED'
                                      ? 'bg-amber-100 text-amber-900'
                                      : 'bg-emerald-50 text-emerald-700'
                                  }`}
                                  title={item.agentActionNote}
                                >
                                  {item.verificationStatus === 'SELF_CORRECTED'
                                    ? `Optimal: £${item.recommendedOptimalPrice.toFixed(2)}`
                                    : 'Verified'}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 text-sm text-gray-900">
                                <div className="font-medium">{item.name}</div>
                                <div className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                                  {item.agentActionNote}
                                </div>
                              </td>
                              <td className="px-4 py-3.5 text-sm text-gray-600">
                                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                                  {item.category}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 text-sm text-gray-600">{item.unit}</td>
                              <td className="px-4 py-3.5 text-sm text-right font-semibold text-gray-900">
                                £{item.yourPrice.toFixed(2)}
                              </td>
                              <td className="px-4 py-3.5 text-sm text-right">
                                <div className="flex flex-col items-end">
                                  <span className="font-semibold" style={{ color: '#143688' }}>
                                    £{item.marketPrice.toFixed(2)}
                                  </span>
                                  <span
                                    className={`text-xs flex items-center gap-0.5 ${
                                      diff > 0
                                        ? 'text-red-600'
                                        : diff < 0
                                        ? 'text-green-600'
                                        : 'text-gray-500'
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
                              <td className="px-4 py-3.5 text-sm text-center">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-xs font-medium inline-block ${
                                    item.supplyCondition === 'Abundant'
                                      ? 'bg-green-100 text-green-700'
                                      : item.supplyCondition === 'Normal'
                                      ? 'bg-blue-100 text-blue-700'
                                      : item.supplyCondition === 'Limited'
                                      ? 'bg-orange-100 text-orange-700'
                                      : 'bg-red-100 text-red-700'
                                  }`}
                                >
                                  {item.supplyCondition}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 text-sm text-center">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${
                                    item.demand.includes('Very')
                                      ? 'bg-purple-100 text-purple-700'
                                      : item.demand === 'High'
                                      ? 'bg-green-100 text-green-700'
                                      : item.demand === 'Moderate'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-gray-100 text-gray-700'
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
                              <td className="px-4 py-3.5 text-sm text-center font-medium text-gray-700">
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

          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 mb-12">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h3 className="text-xl" style={{ color: '#143688' }}>
                Recent Contractor Opportunities
              </h3>
              <span className="text-xs text-gray-500">
                Click any contractor tender to generate an autonomous Gemini 4 Argon bid package
              </span>
            </div>
            <div className="space-y-4">
              {CONTRACTOR_OPPORTUNITIES.map((opp) => (
                <div
                  key={opp.id}
                  onClick={() => setSelectedOpportunity(opp)}
                  className="border border-gray-200 rounded-lg p-4 hover:border-[#143688] hover:bg-blue-50/20 transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{opp.title}</h4>
                      <p className="text-sm text-gray-600">{opp.materialsSummary}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      {opp.matchPercent}% Match
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                    <div className="flex items-center gap-4">
                      <span>Est. Value: {opp.value}</span>
                      <span>•</span>
                      <span>{opp.distanceMiles} miles away</span>
                      <span>•</span>
                      <span>{opp.deadline}</span>
                    </div>
                    <span
                      className="font-semibold inline-flex items-center gap-1"
                      style={{ color: '#143688' }}
                    >
                      Generate Autonomous Bid →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
              <div
                className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center text-white"
                style={{ backgroundColor: '#143688' }}
              >
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl mb-2" style={{ color: '#143688' }}>
                Market Insights
              </h3>
              <p className="text-gray-600 text-sm">
                Real-time demand forecasting and pricing trends across construction sectors
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
              <div
                className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center text-white"
                style={{ backgroundColor: '#143688' }}
              >
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl mb-2" style={{ color: '#143688' }}>
                Contractor Network
              </h3>
              <p className="text-gray-600 text-sm">
                Automatic matching with active projects seeking your materials
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
              <div
                className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center text-white"
                style={{ backgroundColor: '#143688' }}
              >
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-xl mb-2" style={{ color: '#143688' }}>
                Smart Pricing
              </h3>
              <p className="text-gray-600 text-sm">
                AI-powered recommendations to stay competitive while maximizing margins
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

  if (route === '/contractor') {
    return (
      <div className="min-h-screen bg-gray-50">
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

        <div className="text-white py-12" style={{ backgroundColor: '#143688' }}>
          <div className="max-w-7xl mx-auto px-6">
            <h1 className="text-4xl mb-2">Contractor Portal</h1>
            <p className="text-blue-100 text-lg">
              Upload your Bill of Quantities and let Hammer Agent find the best suppliers for your
              project
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 -mt-6">
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-200">
            <div className="mb-6">
              <div className="text-center mb-8">
                <h2
                  className="text-3xl md:text-4xl font-bold tracking-tight mb-2"
                  style={{ color: '#143688' }}
                >
                  STOP OVERPAYING FOR MATERIALS.
                </h2>
                <p className="text-xl md:text-2xl font-semibold text-gray-700">
                  LEVEL UP YOUR MARGINS WITH{' '}
                  <span className="gradient-text font-bold">HAMMER AI.</span>
                </p>
              </div>
              <SearchAndUploadBar
                placeholder="Find the best suppliers at hand."
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
                className="mt-8 rounded-xl p-8 text-white"
                style={{ backgroundColor: '#143688' }}
              >
                <div className="max-w-2xl mx-auto">
                  <h3 className="text-2xl mb-6 text-center">
                    Hammer Agent Processing (Gemini 4 Argon)
                  </h3>
                  <div className="mb-8">
                    <div className="flex justify-between mb-3">
                      {HAMMER_STEPS.map((step, idx) => (
                        <div
                          key={step}
                          className={`text-sm ${
                            idx <= hammerStepIdx ? 'text-white font-semibold' : 'text-blue-300'
                          }`}
                        >
                          {step}
                        </div>
                      ))}
                    </div>
                    <div className="w-full bg-blue-900 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-white h-full transition-all duration-300 rounded-full"
                        style={{ width: `${hammerProgress}%` }}
                      />
                    </div>
                  </div>
                  <div className="relative h-64 bg-blue-900/40 rounded-lg p-6">
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
                            stroke={active ? '#ffffff' : '#1e40af'}
                            strokeWidth={active ? '0.5' : '0.3'}
                            opacity={active ? '0.8' : '0.3'}
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
                  <p className="text-center text-blue-100 mt-4 text-sm">
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

                <div className="mt-8">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-2xl" style={{ color: '#143688' }}>
                        Bill of Quantities Analysis Results
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Project: <strong className="text-gray-800">{hammerResult.projectTitle}</strong> ({hammerResult.sourceFileName})
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
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                        style={{ backgroundColor: '#143688' }}
                      >
                        <Send className="w-3.5 h-3.5" />
                        Dispatch Verified RFQs
                      </button>
                      <div className="text-sm text-gray-600">
                        Total Estimated Cost:{' '}
                        <span className="text-xl font-bold" style={{ color: '#143688' }}>
                          £{hammerResult.totalOptimizedCost.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full table-fixed">
                      <thead
                        className="text-white"
                        style={{ backgroundColor: '#143688' }}
                      >
                        <tr>
                          <th className="w-[13%] px-4 py-3 text-left text-sm font-semibold">
                            Part Number
                          </th>
                          <th className="w-[27%] px-4 py-3 text-left text-sm font-semibold">
                            Description
                          </th>
                          <th className="w-[10%] px-4 py-3 text-right text-sm font-semibold">
                            Quantity
                          </th>
                          <th className="w-[9%] px-4 py-3 text-left text-sm font-semibold">
                            Unit
                          </th>
                          <th className="w-[26%] px-4 py-3 text-left text-sm font-semibold">
                            Recommended Supplier
                          </th>
                          <th className="w-[15%] px-4 py-3 text-right text-sm font-semibold">
                            Projected Price
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {hammerResult.items.map((item, idx) => {
                          const isRowExpanded = Boolean(expandedBoMRows[item.id]);
                          const optionsToShow = isRowExpanded
                            ? item.supplierOptions
                            : item.supplierOptions.slice(0, 3);
                          return (
                            <tr
                              key={item.id}
                              className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                            >
                              <td className="px-4 py-3.5 text-sm font-mono text-gray-900 align-top">
                                <div>{item.partNumber}</div>
                                <span
                                  className={`mt-1 inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                                    item.verificationStatus === 'SELF_CORRECTED'
                                      ? 'bg-amber-100 text-amber-900'
                                      : 'bg-emerald-50 text-emerald-700'
                                  }`}
                                  title={item.verificationSummary}
                                >
                                  {item.verificationStatus === 'SELF_CORRECTED' ? (
                                    <>
                                      <AlertTriangle className="w-2.5 h-2.5" />
                                      Self-Corrected
                                    </>
                                  ) : (
                                    <>
                                      <ShieldCheck className="w-2.5 h-2.5" />
                                      Verified
                                    </>
                                  )}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 text-sm text-gray-900 align-top">
                                <div className="font-medium">{item.description}</div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                  Spec: {item.specification}
                                </div>
                                {item.rejectedCandidate && (
                                  <div className="mt-1.5 rounded bg-amber-50 border border-amber-200 p-1.5 text-[11px] text-amber-900">
                                    <strong>Critic Loop Rejected:</strong>{' '}
                                    {item.rejectedCandidate.supplierName} (£
                                    {item.rejectedCandidate.originalPricePerUnit}/{item.unit}) —{' '}
                                    {item.rejectedCandidate.reason}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3.5 text-sm text-right text-gray-900 font-medium align-top">
                                {item.quantity.toLocaleString()}
                              </td>
                              <td className="px-4 py-3.5 text-sm text-gray-600 align-top">
                                {item.unit}
                              </td>
                              <td className="px-4 py-3.5 text-sm align-top">
                                <div className="border border-gray-300 rounded-md overflow-hidden bg-white">
                                  {optionsToShow.map((opt, optIdx) => {
                                    const isSelected = optIdx === item.selectedSupplierIndex;
                                    return (
                                      <div
                                        key={`${opt.id}-${optIdx}`}
                                        onClick={() =>
                                          handleSelectSupplierOptionForBoMItem(item.id, optIdx)
                                        }
                                        className={`px-3 py-1.5 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                                          isSelected
                                            ? 'text-white font-semibold'
                                            : 'text-gray-700 hover:bg-gray-50'
                                        } ${optIdx > 0 ? 'border-t border-gray-200' : ''}`}
                                        style={
                                          isSelected ? { backgroundColor: '#143688' } : undefined
                                        }
                                        title={`Click to select ${opt.name} (${opt.verificationNote})`}
                                      >
                                        <span className="truncate pr-1">
                                          {opt.name} ({opt.distance}mi)
                                        </span>
                                        <span
                                          className={`ml-2 font-mono shrink-0 ${
                                            isSelected ? 'text-white' : 'text-gray-600'
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
                                      className="w-full px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 cursor-pointer border-t border-gray-200 text-center font-medium transition-colors"
                                    >
                                      {isRowExpanded
                                        ? 'Show Top 3 Suppliers'
                                        : `More... (+${item.supplierOptions.length - 3} Verified Depots)`}
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3.5 text-sm text-right align-top">
                                <div className="font-semibold" style={{ color: '#143688' }}>
                                  £{item.projectedPrice.toLocaleString()}
                                </div>
                                {item.savingsAmount > 0 && (
                                  <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
                                    Save £{item.savingsAmount.toLocaleString()} ({item.savingsPercent}%)
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setRfqModalSupplier(item.recommendedSupplier)}
                                  className="mt-1.5 text-[11px] font-semibold underline hover:opacity-80 cursor-pointer"
                                  style={{ color: '#143688' }}
                                >
                                  Request Quote
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-3 text-right font-semibold text-gray-900"
                          >
                            Total Items: {hammerResult.items.length} (Market Baseline: £
                            {hammerResult.totalBaselineCost.toLocaleString()})
                          </td>
                          <td
                            className="px-4 py-3 text-right font-bold text-lg"
                            style={{ color: '#143688' }}
                          >
                            <div>Best Case Total</div>
                            <div>£{hammerResult.totalOptimizedCost.toLocaleString()}</div>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 mb-12 border border-gray-200">
            <h3 className="text-2xl mb-6" style={{ color: '#143688' }}>
              Featured Past Suppliers
            </h3>
            <div className="relative">
              <button
                onClick={() =>
                  setCarouselIdx(
                    (prev) => (prev - 1 + FEATURED_SUPPLIERS.length) % FEATURED_SUPPLIERS.length
                  )
                }
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all cursor-pointer"
                style={{ color: '#143688' }}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div className="grid md:grid-cols-3 gap-6">
                {visibleSuppliers.map((sup) => (
                  <div
                    key={sup.id}
                    onClick={() => setSelectedSupplierModal(sup)}
                    className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-[#143688]"
                  >
                    <div className="h-48 overflow-hidden bg-gray-100">
                      <img
                        src={sup.image}
                        alt={sup.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-5">
                      <h4
                        className="font-semibold text-lg mb-2"
                        style={{ color: '#143688' }}
                      >
                        {sup.name}
                      </h4>
                      <div className="flex items-center text-sm text-gray-600 mb-3">
                        <MapPin className="w-4 h-4 mr-1" style={{ color: '#143688' }} />
                        <span>{sup.distance} miles away</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Materials Supplied:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {sup.materials.map((mat, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 bg-blue-50 text-xs rounded-full font-medium"
                              style={{ color: '#143688' }}
                            >
                              {mat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() =>
                  setCarouselIdx((prev) => (prev + 1) % FEATURED_SUPPLIERS.length)
                }
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all cursor-pointer"
                style={{ color: '#143688' }}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          {selectedSupplierModal && (
            <div
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedSupplierModal(null)}
            >
              <div
                className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative h-64 overflow-hidden bg-gray-100">
                  <img
                    src={selectedSupplierModal.image}
                    alt={selectedSupplierModal.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setSelectedSupplierModal(null)}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-bold mb-2" style={{ color: '#143688' }}>
                        {selectedSupplierModal.name}
                      </h2>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-1.5" style={{ color: '#143688' }} />
                        <span>{selectedSupplierModal.distance} miles away</span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleConnectSupplier(selectedSupplierModal.id)}
                      className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 cursor-pointer ${
                        connectedSuppliers.includes(selectedSupplierModal.id)
                          ? 'bg-green-50 text-green-700 border-2 border-green-500'
                          : 'text-white hover:opacity-90'
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
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      Materials Supplied
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedSupplierModal.materials.map((mat, idx) => (
                        <span
                          key={idx}
                          className="px-3.5 py-1.5 bg-blue-50 text-sm rounded-full font-medium"
                          style={{ color: '#143688' }}
                        >
                          {mat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      Contact Information
                    </h3>
                    <div className="flex items-start text-sm text-gray-600">
                      <MapPin
                        className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0"
                        style={{ color: '#143688' }}
                      />
                      <span>{selectedSupplierModal.address}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone
                        className="w-4 h-4 mr-2 flex-shrink-0"
                        style={{ color: '#143688' }}
                      />
                      <span>{selectedSupplierModal.phone}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail
                        className="w-4 h-4 mr-2 flex-shrink-0"
                        style={{ color: '#143688' }}
                      />
                      <span>{selectedSupplierModal.email}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        const name = selectedSupplierModal.name;
                        setSelectedSupplierModal(null);
                        setRfqModalSupplier(name);
                      }}
                      className="flex-1 px-6 py-3 rounded-lg font-medium border-2 transition-colors hover:bg-gray-50 cursor-pointer"
                      style={{ borderColor: '#143688', color: '#143688' }}
                    >
                      Request Quote
                    </button>
                    <button
                      onClick={() => {
                        const id = selectedSupplierModal.id;
                        setSelectedSupplierModal(null);
                        navigate(`/supplier/${id}`);
                      }}
                      className="flex-1 px-6 py-3 rounded-lg font-medium text-white transition-opacity hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer"
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

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
              <div
                className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center text-white"
                style={{ backgroundColor: '#143688' }}
              >
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-xl mb-2" style={{ color: '#143688' }}>
                Smart Matching
              </h3>
              <p className="text-gray-600 text-sm">
                AI-powered semantic matching connects your requirements with the most relevant
                suppliers
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
              <div
                className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center text-white"
                style={{ backgroundColor: '#143688' }}
              >
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-xl mb-2" style={{ color: '#143688' }}>
                Real-Time Quotes
              </h3>
              <p className="text-gray-600 text-sm">
                Automatic quote generation and comparison across multiple verified suppliers
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
              <div
                className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center text-white"
                style={{ backgroundColor: '#143688' }}
              >
                <TrendingDown className="w-6 h-6" />
              </div>
              <h3 className="text-xl mb-2" style={{ color: '#143688' }}>
                Cost Analytics
              </h3>
              <p className="text-gray-600 text-sm">
                Detailed breakdown and optimization recommendations to reduce procurement costs
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
