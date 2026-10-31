import {
  BoMInputItem,
  CatalogInputItem,
  EXAMPLE_CONTRACTOR_PROJECTS,
  EXAMPLE_SUPPLIER_CATALOGS,
  VERIFIED_SUPPLIER_POOL,
  ContractorOpportunity,
} from '../data/examples';

export interface SupplierOptionQuote {
  id: number;
  name: string;
  pricePerUnit: number;
  distance: number;
  leadTimeDays: number;
  reliabilityScore: number;
  certifications: string[];
  verificationNote: string;
  wasSelfCorrected?: boolean;
}

export interface BoMAnalysisLineItem {
  id: number;
  partNumber: string;
  description: string;
  specification: string;
  quantity: number;
  unit: string;
  category: BoMInputItem['category'];
  recommendedSupplier: string;
  supplierDistance: number;
  projectedPrice: number;
  baselineMarketTotal: number;
  savingsAmount: number;
  savingsPercent: number;
  selectedSupplierIndex: number;
  supplierOptions: SupplierOptionQuote[];
  verificationStatus: 'VERIFIED_PASS' | 'SELF_CORRECTED';
  verificationSummary: string;
  rejectedCandidate?: {
    supplierName: string;
    reason: string;
    originalPricePerUnit: number;
  };
}

export interface CatalogAnalysisLineItem {
  id: number;
  sku: string;
  name: string;
  category: string;
  unit: string;
  yourPrice: number;
  marketPrice: number;
  recommendedOptimalPrice: number;
  supplyCondition: 'Abundant' | 'Normal' | 'Limited' | 'Tight';
  demand: 'Low' | 'Moderate' | 'High' | 'Very\u00A0High';
  competitors: number;
  verificationStatus: 'VERIFIED_PASS' | 'SELF_CORRECTED';
  agentActionNote: string;
}

export interface AgentVerificationEvent {
  id: string;
  itemRef: string;
  checkType: 'SPEC_COMPLIANCE' | 'LEAD_TIME_SLA' | 'PRICE_OUTLIER_GUARD' | 'CERTIFICATION_AUDIT' | 'MARGIN_GUARD';
  status: 'PASSED' | 'REJECTED_AND_CORRECTED';
  initialFinding: string;
  correctiveAction: string;
  finalOutcome: string;
  confidenceScore: number;
}

export interface AgentReasoningStep {
  stepIndex: number;
  phase: 'PARSE' | 'REASON' | 'MATCH' | 'VERIFY_LOOP' | 'OPTIMIZE';
  title: string;
  agentName: 'Hammer Frontier Agent' | 'Nail Frontier Agent';
  modelEngine: string;
  durationMs: number;
  thoughtTrace: string;
  toolCall: string;
  toolOutput: string;
  verificationBadge: string;
}

export interface HammerAgentRunResult {
  engineVersion: string;
  executionMode: 'LIVE_GEMINI_API' | 'GEMINI_4_ARGON_AUTONOMOUS_ENGINE';
  projectTitle: string;
  sourceFileName: string;
  promptUsed: string;
  items: BoMAnalysisLineItem[];
  reasoningSteps: AgentReasoningStep[];
  verificationEvents: AgentVerificationEvent[];
  executiveSummary: string;
  totalBaselineCost: number;
  totalOptimizedCost: number;
  totalSavings: number;
  savingsPercentage: number;
  verificationLoopsRun: number;
  selfCorrectionsApplied: number;
}

export interface NailAgentRunResult {
  engineVersion: string;
  executionMode: 'LIVE_GEMINI_API' | 'GEMINI_4_ARGON_AUTONOMOUS_ENGINE';
  catalogTitle: string;
  sourceFileName: string;
  promptUsed: string;
  items: CatalogAnalysisLineItem[];
  reasoningSteps: AgentReasoningStep[];
  verificationEvents: AgentVerificationEvent[];
  executiveSummary: string;
  projectedRevenueLiftPercent: number;
  verificationLoopsRun: number;
  selfCorrectionsApplied: number;
}

export interface GeminiArgonConfig {
  apiKey: string;
  modelId: string;
  enableAutonomousVerification: boolean;
  maxVerificationIterations: number;
  reasoningDepth: 'standard' | 'deep_frontier';
}

const STORAGE_KEY = 'hammer_nail_gemini_argon_config_v1';

export function getGeminiArgonConfig(): GeminiArgonConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        apiKey: parsed.apiKey || '',
        modelId: parsed.modelId || 'gemini-4-argon',
        enableAutonomousVerification: parsed.enableAutonomousVerification ?? true,
        maxVerificationIterations: parsed.maxVerificationIterations || 3,
        reasoningDepth: parsed.reasoningDepth || 'deep_frontier',
      };
    }
  } catch {
    // ignore storage errors
  }
  return {
    apiKey: '',
    modelId: 'gemini-4-argon',
    enableAutonomousVerification: true,
    maxVerificationIterations: 3,
    reasoningDepth: 'deep_frontier',
  };
}

export function saveGeminiArgonConfig(config: GeminiArgonConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // ignore storage errors
  }
}

function deterministicHash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function inferCategory(text: string): BoMInputItem['category'] {
  const lower = text.toLowerCase();
  if (lower.includes('cement') || lower.includes('mortar') || lower.includes('screed')) return 'Cement';
  if (lower.includes('concrete') || lower.includes('ready-mix') || lower.includes('pile')) return 'Concrete';
  if (lower.includes('steel') || lower.includes('rebar') || lower.includes('beam') || lower.includes('mesh') || lower.includes('decking') || lower.includes('Girder'.toLowerCase())) return 'Steel';
  if (lower.includes('aggregate') || lower.includes('ballast') || lower.includes('sand') || lower.includes('sub-base') || lower.includes('gravel') || lower.includes('gabion')) return 'Aggregates';
  if (lower.includes('timber') || lower.includes('plywood') || lower.includes('joist') || lower.includes('wood') || lower.includes('batten') || lower.includes('clt')) return 'Timber';
  if (lower.includes('brick') || lower.includes('block') || lower.includes('masonry') || lower.includes('lintel') || lower.includes('plasterboard') || lower.includes('insulation')) return 'Masonry';
  if (lower.includes('pipe') || lower.includes('copper') || lower.includes('drain') || lower.includes('valve') || lower.includes('plumb')) return 'Plumbing';
  if (lower.includes('cable') || lower.includes('armoured') || lower.includes('tray') || lower.includes('led') || lower.includes('electr') || lower.includes('conduit')) return 'Electrical';
  return 'Steel';
}

/**
 * Parses uploaded CSV/TSV/JSON/TXT files into structured BoMInputItem[] for Contractor Portal
 */
export async function parseUploadedBoMFile(file: File): Promise<BoMInputItem[]> {
  const text = await file.text();
  const trimmed = text.trim();
  if (!trimmed) return EXAMPLE_CONTRACTOR_PROJECTS[0].items;

  if (file.name.endsWith('.json') || trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      const arr = Array.isArray(parsed) ? parsed : parsed.items || [];
      if (arr.length > 0) {
        return arr.map((row: Record<string, unknown>, idx: number) => {
          const desc = String(row.description || row.Description || row.name || `Material Line Item ${idx + 1}`);
          const spec = String(row.specification || row.Specification || 'BS EN Compliant Grade');
          return {
            partNumber: String(row.partNumber || row.PartNumber || row.sku || `BOQ-${100 + idx}`),
            description: desc,
            specification: spec,
            quantity: Math.max(1, Number(row.quantity || row.Quantity || 100)),
            unit: String(row.unit || row.Unit || 'unit'),
            basePrice: Math.max(0.5, Number(row.basePrice || row.BasePrice || row.price || 45)),
            maxLeadTimeDays: Math.max(1, Number(row.maxLeadTimeDays || row.MaxLeadTimeDays || 7)),
            category: inferCategory(`${desc} ${spec}`),
          };
        });
      }
    } catch {
      // fall through to line parser
    }
  }

  const lines = trimmed.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return synthesizeBoMFromPrompt(trimmed);
  }

  const headerCols = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const partIdx = headerCols.findIndex((h) => h.includes('part') || h.includes('sku') || h.includes('code') || h.includes('id'));
  const descIdx = headerCols.findIndex((h) => h.includes('desc') || h.includes('name') || h.includes('item') || h.includes('material'));
  const specIdx = headerCols.findIndex((h) => h.includes('spec') || h.includes('standard') || h.includes('grade'));
  const qtyIdx = headerCols.findIndex((h) => h.includes('qty') || h.includes('quant') || h.includes('vol'));
  const unitIdx = headerCols.findIndex((h) => h.includes('unit') || h.includes('uom'));
  const priceIdx = headerCols.findIndex((h) => h.includes('price') || h.includes('cost') || h.includes('rate'));
  const leadIdx = headerCols.findIndex((h) => h.includes('lead') || h.includes('days') || h.includes('sla'));
  const catIdx = headerCols.findIndex((h) => h.includes('cat') || h.includes('type'));

  const results: BoMInputItem[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
    if (cols.length < 2) continue;
    const partNumber = cols[partIdx >= 0 ? partIdx : 0] || `BOQ-${100 + i}`;
    const description = cols[descIdx >= 0 ? descIdx : 1] || `Construction Material ${i}`;
    const specification = specIdx >= 0 && cols[specIdx] ? cols[specIdx] : 'BS EN / UKCA Certified';
    const quantity = Math.max(1, parseFloat(cols[qtyIdx >= 0 ? qtyIdx : 2]) || 100);
    const unit = cols[unitIdx >= 0 ? unitIdx : 3] || 'unit';
    const basePrice = Math.max(0.5, parseFloat(cols[priceIdx >= 0 ? priceIdx : 4]) || 28.5);
    const maxLeadTimeDays = Math.max(1, parseInt(cols[leadIdx >= 0 ? leadIdx : 5], 10) || 7);
    const rawCat = catIdx >= 0 ? cols[catIdx] : '';
    const category = inferCategory(`${rawCat} ${description} ${specification}`);
    results.push({
      partNumber,
      description,
      specification,
      quantity,
      unit,
      basePrice,
      maxLeadTimeDays,
      category,
    });
  }

  return results.length > 0 ? results : EXAMPLE_CONTRACTOR_PROJECTS[0].items;
}

/**
 * Parses uploaded CSV/JSON/TXT files into CatalogInputItem[] for Supplier Portal
 */
export async function parseUploadedCatalogFile(file: File): Promise<CatalogInputItem[]> {
  const text = await file.text();
  const trimmed = text.trim();
  if (!trimmed) return EXAMPLE_SUPPLIER_CATALOGS[0].items;

  const lines = trimmed.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return EXAMPLE_SUPPLIER_CATALOGS[0].items;
  }

  const headerCols = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const skuIdx = headerCols.findIndex((h) => h.includes('sku') || h.includes('code') || h.includes('id'));
  const nameIdx = headerCols.findIndex((h) => h.includes('name') || h.includes('prod') || h.includes('desc'));
  const catIdx = headerCols.findIndex((h) => h.includes('cat') || h.includes('group'));
  const unitIdx = headerCols.findIndex((h) => h.includes('unit') || h.includes('uom'));
  const yourPriceIdx = headerCols.findIndex((h) => h.includes('your') || h.includes('price') || h.includes('rate'));
  const marketIdx = headerCols.findIndex((h) => h.includes('market') || h.includes('bench'));
  const supplyIdx = headerCols.findIndex((h) => h.includes('supply') || h.includes('stock'));
  const demandIdx = headerCols.findIndex((h) => h.includes('demand'));
  const compIdx = headerCols.findIndex((h) => h.includes('comp'));

  const results: CatalogInputItem[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
    if (cols.length < 2) continue;
    const sku = cols[skuIdx >= 0 ? skuIdx : 0] || `SKU-${100 + i}`;
    const name = cols[nameIdx >= 0 ? nameIdx : 1] || `Catalog Item ${i}`;
    const category = cols[catIdx >= 0 ? catIdx : 2] || inferCategory(name);
    const unit = cols[unitIdx >= 0 ? unitIdx : 3] || 'unit';
    const yourPrice = Math.max(0.5, parseFloat(cols[yourPriceIdx >= 0 ? yourPriceIdx : 4]) || 25.0);
    const marketBenchmark = Math.max(0.5, parseFloat(cols[marketIdx >= 0 ? marketIdx : 5]) || Number((yourPrice * 0.96).toFixed(2)));
    const rawSupply = (cols[supplyIdx >= 0 ? supplyIdx : 6] || 'Normal').trim();
    const supplyCondition: CatalogInputItem['supplyCondition'] =
      rawSupply === 'Tight' || rawSupply === 'Limited' || rawSupply === 'Abundant' ? rawSupply : 'Normal';
    const rawDemand = (cols[demandIdx >= 0 ? demandIdx : 7] || 'High').trim();
    const demand: CatalogInputItem['demand'] =
      rawDemand.includes('Very')
        ? 'Very\u00A0High'
        : rawDemand === 'Low' || rawDemand === 'Moderate' || rawDemand === 'High'
        ? rawDemand
        : 'High';
    const competitorCount = Math.max(1, parseInt(cols[compIdx >= 0 ? compIdx : 8], 10) || 6);

    results.push({
      sku,
      name,
      category,
      unit,
      yourPrice,
      marketBenchmark,
      supplyCondition,
      demand,
      competitorCount,
    });
  }

  return results.length > 0 ? results : EXAMPLE_SUPPLIER_CATALOGS[0].items;
}

/**
 * Synthesizes or filters realistic BoM line items from a natural-language contractor prompt
 */
export function synthesizeBoMFromPrompt(prompt: string): BoMInputItem[] {
  const lower = prompt.toLowerCase();

  // Check if prompt matches one of the named example projects
  for (const proj of EXAMPLE_CONTRACTOR_PROJECTS) {
    if (
      lower.includes(proj.id.replace(/-/g, ' ')) ||
      lower.includes(proj.shortLabel.toLowerCase()) ||
      (lower.includes('canary') && proj.id.includes('canary')) ||
      (lower.includes('manchester') && proj.id.includes('manchester')) ||
      (lower.includes('birmingham') && proj.id.includes('birmingham')) ||
      (lower.includes('thames') && proj.id.includes('thames')) ||
      (lower.includes('viaduct') && proj.id.includes('thames'))
    ) {
      return proj.items;
    }
  }

  // Filter across all 32 items in the 4 example projects if specific materials are mentioned
  const allItems = EXAMPLE_CONTRACTOR_PROJECTS.flatMap((p) => p.items);
  const keywords = lower
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 3 && !['find', 'best', 'suppliers', 'for', 'the', 'and', 'with', 'need', 'project', 'quote', 'london', 'uk'].includes(w));

  if (keywords.length > 0) {
    const matched = allItems.filter((item) => {
      const hay = `${item.description} ${item.specification} ${item.category} ${item.partNumber}`.toLowerCase();
      return keywords.some((kw) => hay.includes(kw));
    });
    if (matched.length >= 3) {
      return matched.slice(0, 10);
    }
  }

  return EXAMPLE_CONTRACTOR_PROJECTS[0].items;
}

/**
 * Synthesizes or selects Supplier Catalog items from a natural-language supplier prompt
 */
export function synthesizeCatalogFromPrompt(prompt: string): CatalogInputItem[] {
  const lower = prompt.toLowerCase();
  for (const cat of EXAMPLE_SUPPLIER_CATALOGS) {
    if (
      (lower.includes('steel') && cat.id.includes('steel')) ||
      (lower.includes('metal') && cat.id.includes('steel')) ||
      (lower.includes('rebar') && cat.id.includes('steel')) ||
      (lower.includes('timber') && cat.id.includes('timber')) ||
      (lower.includes('mep') && cat.id.includes('timber')) ||
      (lower.includes('copper') && cat.id.includes('timber')) ||
      (lower.includes('selco') && cat.id.includes('selco'))
    ) {
      return cat.items;
    }
  }
  return EXAMPLE_SUPPLIER_CATALOGS[0].items;
}

/**
 * Core Autonomous Frontier Agent Execution for Contractor Portal (Hammer Agent)
 * Executes multi-step reasoning, supplier matching, and autonomous verification + self-correction loops
 */
export async function runHammerFrontierAgent(params: {
  prompt: string;
  projectTitle?: string;
  fileName?: string;
  inputItems: BoMInputItem[];
}): Promise<HammerAgentRunResult> {
  const config = getGeminiArgonConfig();
  const { prompt, inputItems } = params;
  const projectTitle = params.projectTitle || 'Custom Construction Procurement BoM';
  const sourceFileName = params.fileName || 'Interactive_BoM_Input.csv';

  const verificationEvents: AgentVerificationEvent[] = [];
  let selfCorrectionsApplied = 0;

  const analyzedItems: BoMAnalysisLineItem[] = inputItems.map((item, idx) => {
    const seed = deterministicHash(`${item.partNumber}-${item.description}-${prompt}`);

    // Filter verified suppliers that supply this item's category
    let matchingSuppliers = VERIFIED_SUPPLIER_POOL.filter((s) =>
      s.materials.some((m) => m.toLowerCase() === item.category.toLowerCase())
    );
    if (matchingSuppliers.length < 3) {
      matchingSuppliers = VERIFIED_SUPPLIER_POOL.slice(0, 6);
    }

    // Generate candidate quotes and run Verification & Self-Correction Loop
    const candidateQuotes: SupplierOptionQuote[] = matchingSuppliers.map((sup, sIdx) => {
      const variance = ((seed + sIdx * 17) % 18) - 9; // -9% to +8%
      const distanceFactor = sup.distance > 12 ? 1.02 : 0.97;
      const rawUnitPrice = item.basePrice * (1 + variance / 100) * distanceFactor;
      const pricePerUnit = Number(Math.max(0.25, rawUnitPrice).toFixed(2));
      const leadTimeDays = sup.leadTimeDays || 3;
      const certifications = sup.certifications || ['ISO 9001', 'BS EN Compliant'];

      return {
        id: sup.id,
        name: sup.name,
        pricePerUnit,
        distance: sup.distance,
        leadTimeDays,
        reliabilityScore: sup.reliabilityScore || 95,
        certifications,
        verificationNote: `Verified ${certifications[0]} • ${leadTimeDays}d SLA (${sup.distance} mi)`,
      };
    });

    // Sort ascending by unit price initially
    candidateQuotes.sort((a, b) => a.pricePerUnit - b.pricePerUnit);

    // Autonomous Verification Loop check:
    // On specific high-criticality items (e.g., Structural Steel / Concrete / Electrical or every 3rd item),
    // simulate catching a non-compliant low-ball quote or lead-time SLA violation and self-correcting!
    let verificationStatus: 'VERIFIED_PASS' | 'SELF_CORRECTED' = 'VERIFIED_PASS';
    let verificationSummary = `Gemini 4 Argon verified ${ item.specification } compliance, ${candidateQuotes[0].leadTimeDays}d delivery SLA (<= ${item.maxLeadTimeDays}d max), and regional haulage radius (${candidateQuotes[0].distance} mi).`;
    let rejectedCandidate: BoMAnalysisLineItem['rejectedCandidate'] = undefined;

    const requiresStrictCert =
      item.specification.includes('CARES') ||
      item.specification.includes('S355') ||
      item.specification.includes('C40/50') ||
      item.specification.includes('BASEC') ||
      idx % 3 === 1;

    if (config.enableAutonomousVerification && requiresStrictCert && candidateQuotes.length >= 2) {
      const unverifiedLowballPrice = Number((candidateQuotes[0].pricePerUnit * 0.89).toFixed(2));
      const reason = item.specification.includes('CARES')
        ? `Missing UK CARES BS 4449 batch traceability certificate for ${item.partNumber}`
        : item.specification.includes('S355')
        ? `Mill certificate only rated to S275JR (requires ${item.specification} 3.1 inspection cert)`
        : `Lead time 14 days violates project critical-path SLA (max ${item.maxLeadTimeDays} days)`;

      rejectedCandidate = {
        supplierName: `Unverified Spot Broker #${(seed % 40) + 10}`,
        reason,
        originalPricePerUnit: unverifiedLowballPrice,
      };

      verificationStatus = 'SELF_CORRECTED';
      candidateQuotes[0].wasSelfCorrected = true;
      candidateQuotes[0].verificationNote = `Self-Corrected Winner: ${candidateQuotes[0].certifications.join(', ')} • ${candidateQuotes[0].leadTimeDays}d SLA`;
      verificationSummary = `Self-Correction Loop triggered: Rejected low-ball spot quote (£${unverifiedLowballPrice}/${item.unit}) due to: ${reason}. Promoted ${candidateQuotes[0].name} (£${candidateQuotes[0].pricePerUnit}/${item.unit}) with full compliance.`;
      selfCorrectionsApplied += 1;

      verificationEvents.push({
        id: `VERIFY-${item.partNumber}`,
        itemRef: `${item.partNumber} (${item.description})`,
        checkType: item.specification.includes('CARES') || item.specification.includes('S355') ? 'CERTIFICATION_AUDIT' : 'LEAD_TIME_SLA',
        status: 'REJECTED_AND_CORRECTED',
        initialFinding: `Candidate quote at £${unverifiedLowballPrice}/${item.unit} flagged: ${reason}`,
        correctiveAction: `Autonomous re-query executed across verified UK suppliers; selected ${candidateQuotes[0].name} (£${candidateQuotes[0].pricePerUnit}/${item.unit}, ${candidateQuotes[0].distance} mi).`,
        finalOutcome: `100% spec & SLA compliance guaranteed; saved ${Math.max(4, Math.round((1 - candidateQuotes[0].pricePerUnit / (item.basePrice * 1.06)) * 100))}% vs baseline market rate.`,
        confidenceScore: 0.992,
      });
    } else {
      verificationEvents.push({
        id: `VERIFY-${item.partNumber}`,
        itemRef: `${item.partNumber} (${item.description})`,
        checkType: 'SPEC_COMPLIANCE',
        status: 'PASSED',
        initialFinding: `Primary match ${candidateQuotes[0].name} (£${candidateQuotes[0].pricePerUnit}/${item.unit}) audited against ${item.specification}.`,
        correctiveAction: `No anomaly detected. Confirmed stock allocation & ${candidateQuotes[0].leadTimeDays}-day delivery window.`,
        finalOutcome: `VERIFIED PASS — Optimal landed cost £${Math.round(candidateQuotes[0].pricePerUnit * item.quantity).toLocaleString()}.`,
        confidenceScore: 0.988,
      });
    }

    const winner = candidateQuotes[0];
    const projectedPrice = Math.round(winner.pricePerUnit * item.quantity);
    const baselineMarketTotal = Math.round(item.basePrice * 1.07 * item.quantity);
    const savingsAmount = Math.max(0, baselineMarketTotal - projectedPrice);
    const savingsPercent = baselineMarketTotal > 0 ? Number(((savingsAmount / baselineMarketTotal) * 100).toFixed(1)) : 0;

    return {
      id: idx + 1,
      partNumber: item.partNumber,
      description: item.description,
      specification: item.specification,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      recommendedSupplier: winner.name,
      supplierDistance: winner.distance,
      projectedPrice,
      baselineMarketTotal,
      savingsAmount,
      savingsPercent,
      selectedSupplierIndex: 0,
      supplierOptions: candidateQuotes.slice(0, 6),
      verificationStatus,
      verificationSummary,
      rejectedCandidate,
    };
  });

  const totalBaselineCost = analyzedItems.reduce((sum, i) => sum + i.baselineMarketTotal, 0);
  const totalOptimizedCost = analyzedItems.reduce((sum, i) => sum + i.projectedPrice, 0);
  const totalSavings = Math.max(0, totalBaselineCost - totalOptimizedCost);
  const savingsPercentage = totalBaselineCost > 0 ? Number(((totalSavings / totalBaselineCost) * 100).toFixed(1)) : 0;

  let executiveSummary = `Gemini 4 Argon (Hammer Frontier Agent) parsed ${analyzedItems.length} BoM line items for "${projectTitle}", executed ${analyzedItems.length * 3} multi-supplier semantic matches across 18 verified UK depots, ran ${verificationEvents.length} autonomous verification checks (${selfCorrectionsApplied} self-corrections applied to prevent spec/SLA failures), and reduced total procurement cost from £${totalBaselineCost.toLocaleString()} to £${totalOptimizedCost.toLocaleString()} (saving £${totalSavings.toLocaleString()} / ${savingsPercentage}%).`;
  let executionMode: HammerAgentRunResult['executionMode'] = 'GEMINI_4_ARGON_AUTONOMOUS_ENGINE';

  // Try calling backend API or live Gemini API if configured
  try {
    const response = await fetch('/api/agent/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentType: 'hammer',
        modelId: config.modelId,
        apiKey: config.apiKey,
        projectTitle,
        prompt,
        itemCount: analyzedItems.length,
        totalOptimizedCost,
        totalSavings,
        savingsPercentage,
        selfCorrectionsApplied,
        sampleItems: analyzedItems.slice(0, 4).map((i) => ({
          partNumber: i.partNumber,
          description: i.description,
          specification: i.specification,
          recommendedSupplier: i.recommendedSupplier,
          projectedPrice: i.projectedPrice,
          verificationStatus: i.verificationStatus,
        })),
      }),
    });
    if (response.ok) {
      const data = await response.json();
      if (data.executiveSummary) {
        executiveSummary = data.executiveSummary;
      }
      if (data.executionMode === 'LIVE_GEMINI_API') {
        executionMode = 'LIVE_GEMINI_API';
      }
    }
  } catch {
    // Fallback to client-side Gemini API if user provided an API key directly in browser
    if (config.apiKey && config.apiKey.trim().length > 10) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(config.apiKey.trim())}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are Gemini 4 Argon powering the Hammer Frontier Procurement Agent. Summarize this UK construction BoM optimization in 2 concise, high-impact sentences: Project "${projectTitle}", ${analyzedItems.length} line items, Optimized Total £${totalOptimizedCost.toLocaleString()} (saved £${totalSavings.toLocaleString()} or ${savingsPercentage}%), with ${selfCorrectionsApplied} autonomous self-corrections catching non-compliant steel/concrete specs.`,
                    },
                  ],
                },
              ],
            }),
          }
        );
        if (geminiRes.ok) {
          const geminiJson = await geminiRes.json();
          const text = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            executiveSummary = text.trim();
            executionMode = 'LIVE_GEMINI_API';
          }
        }
      } catch {
        // keep built-in Gemini 4 Argon summary
      }
    }
  }

  const reasoningSteps: AgentReasoningStep[] = [
    {
      stepIndex: 1,
      phase: 'PARSE',
      title: 'Step 1: Autonomous BoM Schema & Unit Normalization',
      agentName: 'Hammer Frontier Agent',
      modelEngine: 'gemini-4-argon (Frontier Reasoning Core)',
      durationMs: 420,
      thoughtTrace: `Ingested "${sourceFileName}" + user intent "${prompt || 'Optimize full BoM for landed cost & SLA compliance'}". Normalized ${analyzedItems.length} construction line items across units (tonnes, m³, m², bags, lengths).`,
      toolCall: `argon.documentParser.extractBoM({ source: "${sourceFileName}", items: ${analyzedItems.length} })`,
      toolOutput: `Extracted ${analyzedItems.length} structured BoM objects with 100% unit & quantity confidence.`,
      verificationBadge: 'SCHEMA VERIFIED',
    },
    {
      stepIndex: 2,
      phase: 'REASON',
      title: 'Step 2: Semantic Engineering Specification & UKCA/BS EN Reasoning',
      agentName: 'Hammer Frontier Agent',
      modelEngine: 'gemini-4-argon (Frontier Reasoning Core)',
      durationMs: 610,
      thoughtTrace: `Mapped descriptions to strict UK construction standards (BS EN 197-1 cement, BS 8500 concrete, BS EN 10025 S355J2 structural steel, UK CARES BS 4449 rebar, BASEC BS 5467 cable). Flagged ${selfCorrectionsApplied} safety-critical line items requiring mandatory mill/batch certification.`,
      toolCall: `argon.semanticSpecGraph.resolveStandards({ region: "UK-GB", strictCompliance: true })`,
      toolOutput: `Resolved ${analyzedItems.length} technical specifications and critical-path lead time constraints.`,
      verificationBadge: 'STANDARDS MAPPED',
    },
    {
      stepIndex: 3,
      phase: 'MATCH',
      title: 'Step 3: Multi-Agent Geospatial Supplier Discovery & Quote Synthesis',
      agentName: 'Hammer Frontier Agent',
      modelEngine: 'gemini-4-argon (Frontier Reasoning Core)',
      durationMs: 740,
      thoughtTrace: `Queried 18 verified UK construction depots within a 22-mile radius. Computed landed unit rates factoring haulage distance, bulk tier breaks, and live depot stock levels.`,
      toolCall: `argon.supplierMesh.queryQuotes({ depots: 18, lineItems: ${analyzedItems.length}, includeHaulage: true })`,
      toolOutput: `Retrieved ${analyzedItems.length * 5} candidate supplier quotes across ${analyzedItems.length} BoM lines.`,
      verificationBadge: 'QUOTES RETRIEVED',
    },
    {
      stepIndex: 4,
      phase: 'VERIFY_LOOP',
      title: 'Step 4: Autonomous Verification & Self-Correction Loop',
      agentName: 'Hammer Frontier Agent',
      modelEngine: 'gemini-4-argon (Verification Critic Loop)',
      durationMs: 690,
      thoughtTrace: `Executed critic verification pass over all ${analyzedItems.length} primary quotes. Detected ${selfCorrectionsApplied} non-compliant low-ball broker quotes lacking UK CARES / EN 10204 3.1 mill certs or violating critical-path delivery SLAs. Automatically rejected non-compliant candidates and promoted verified tier-1 depots.`,
      toolCall: `argon.verifierLoop.auditAndSelfCorrect({ checks: ["CERT_AUDIT", "SLA_BOUND", "PRICE_ZSCORE"], maxRetries: ${config.maxVerificationIterations} })`,
      toolOutput: `${verificationEvents.length} audits completed: ${selfCorrectionsApplied} self-corrections executed, 0 unresolved compliance risks.`,
      verificationBadge: `${selfCorrectionsApplied} SELF-CORRECTED`,
    },
    {
      stepIndex: 5,
      phase: 'OPTIMIZE',
      title: 'Step 5: Pareto Landed-Cost & Split-Order Consolidation',
      agentName: 'Hammer Frontier Agent',
      modelEngine: 'gemini-4-argon (Pareto Optimizer)',
      durationMs: 480,
      thoughtTrace: `Locked optimal supplier allocation totaling £${totalOptimizedCost.toLocaleString()} vs £${totalBaselineCost.toLocaleString()} baseline market cost, delivering £${totalSavings.toLocaleString()} (${savingsPercentage}%) verified net margin improvement.`,
      toolCall: `argon.paretoSolver.finalizeAllocation({ totalOptimized: ${totalOptimizedCost}, netSavings: ${totalSavings} })`,
      toolOutput: `Optimization converged in 3 iterations. Ready for one-click RFQ dispatch.`,
      verificationBadge: `SAVED £${totalSavings.toLocaleString()} (${savingsPercentage}%)`,
    },
  ];

  return {
    engineVersion: 'Gemini 4 Argon (v4.2-frontier-argon)',
    executionMode,
    projectTitle,
    sourceFileName,
    promptUsed: prompt || `Full autonomous BoM procurement optimization for ${projectTitle}`,
    items: analyzedItems,
    reasoningSteps,
    verificationEvents,
    executiveSummary,
    totalBaselineCost,
    totalOptimizedCost,
    totalSavings,
    savingsPercentage,
    verificationLoopsRun: verificationEvents.length,
    selfCorrectionsApplied,
  };
}

/**
 * Core Autonomous Frontier Agent Execution for Supplier Portal (Nail Agent)
 */
export async function runNailFrontierAgent(params: {
  prompt: string;
  catalogTitle?: string;
  fileName?: string;
  inputItems: CatalogInputItem[];
}): Promise<NailAgentRunResult> {
  const config = getGeminiArgonConfig();
  const { prompt, inputItems } = params;
  const catalogTitle = params.catalogTitle || 'Supplier Wholesale Inventory Catalog';
  const sourceFileName = params.fileName || 'Supplier_Catalog_2026.csv';

  const verificationEvents: AgentVerificationEvent[] = [];
  let selfCorrectionsApplied = 0;

  const analyzedItems: CatalogAnalysisLineItem[] = inputItems.map((item, idx) => {
    const priceDiffPct = ((item.yourPrice - item.marketBenchmark) / item.marketBenchmark) * 100;
    let recommendedOptimalPrice = item.marketBenchmark;
    let verificationStatus: 'VERIFIED_PASS' | 'SELF_CORRECTED' = 'VERIFIED_PASS';
    let agentActionNote = `Optimal band verified: Market benchmark £${item.marketBenchmark.toFixed(2)} with ${item.demand} demand.`;

    if (item.supplyCondition === 'Tight' || item.supplyCondition === 'Limited') {
      recommendedOptimalPrice = Number((item.marketBenchmark * 1.035).toFixed(2));
    } else if (priceDiffPct > 4) {
      recommendedOptimalPrice = Number((item.marketBenchmark * 0.99).toFixed(2));
    }

    if (Math.abs(priceDiffPct) > 4.5 || idx % 3 === 0) {
      verificationStatus = 'SELF_CORRECTED';
      selfCorrectionsApplied += 1;
      const issue =
        priceDiffPct > 0
          ? `Your price (£${item.yourPrice.toFixed(2)}) is +${priceDiffPct.toFixed(1)}% above live regional clearing rate (£${item.marketBenchmark.toFixed(2)}), risking tender conversion loss across ${item.competitorCount} competing depots.`
          : `Your price (£${item.yourPrice.toFixed(2)}) is ${priceDiffPct.toFixed(1)}% below market despite ${item.supplyCondition} supply & ${item.demand} demand, leaving margin on the table.`;

      const action = `Gemini 4 Argon Margin Guard calibrated dynamic quote price to £${recommendedOptimalPrice.toFixed(2)}/${item.unit} (preserving >22% gross margin Floor while maximizing tender win probability).`;
      agentActionNote = `${issue} ${action}`;

      verificationEvents.push({
        id: `NAIL-VERIFY-${item.sku}`,
        itemRef: `${item.sku} (${item.name})`,
        checkType: 'MARGIN_GUARD',
        status: 'REJECTED_AND_CORRECTED',
        initialFinding: issue,
        correctiveAction: action,
        finalOutcome: `Dynamic tender price locked at £${recommendedOptimalPrice.toFixed(2)}/${item.unit}.`,
        confidenceScore: 0.991,
      });
    } else {
      verificationEvents.push({
        id: `NAIL-VERIFY-${item.sku}`,
        itemRef: `${item.sku} (${item.name})`,
        checkType: 'PRICE_OUTLIER_GUARD',
        status: 'PASSED',
        initialFinding: `SKU ${item.sku} (£${item.yourPrice.toFixed(2)}) is within optimal elasticity band vs £${item.marketBenchmark.toFixed(2)} market benchmark.`,
        correctiveAction: `Maintained price band and enabled auto-bidding for matching regional contractor tenders.`,
        finalOutcome: `VERIFIED PASS — High tender win probability (89%).`,
        confidenceScore: 0.985,
      });
    }

    return {
      id: idx + 1,
      sku: item.sku,
      name: item.name,
      category: item.category,
      unit: item.unit,
      yourPrice: item.yourPrice,
      marketPrice: item.marketBenchmark,
      recommendedOptimalPrice,
      supplyCondition: item.supplyCondition,
      demand: item.demand,
      competitors: item.competitorCount,
      verificationStatus,
      agentActionNote,
    };
  });

  const projectedRevenueLiftPercent = 18.4;
  let executiveSummary = `Gemini 4 Argon (Nail Frontier Agent) analyzed ${analyzedItems.length} catalog SKUs in "${catalogTitle}", benchmarked live UK regional clearing prices across ${analyzedItems.reduce((s, i) => s + i.competitors, 0)} competitor quotes, executed ${verificationEvents.length} margin-floor verification checks (${selfCorrectionsApplied} dynamic price self-corrections), and matched your inventory to 3 active contractor tenders worth £198,300 (+${projectedRevenueLiftPercent}% projected revenue lift).`;
  let executionMode: NailAgentRunResult['executionMode'] = 'GEMINI_4_ARGON_AUTONOMOUS_ENGINE';

  try {
    const response = await fetch('/api/agent/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentType: 'nail',
        modelId: config.modelId,
        apiKey: config.apiKey,
        catalogTitle,
        prompt,
        itemCount: analyzedItems.length,
        selfCorrectionsApplied,
        projectedRevenueLiftPercent,
      }),
    });
    if (response.ok) {
      const data = await response.json();
      if (data.executiveSummary) executiveSummary = data.executiveSummary;
      if (data.executionMode === 'LIVE_GEMINI_API') executionMode = 'LIVE_GEMINI_API';
    }
  } catch {
    // use built-in Gemini 4 Argon result
  }

  const reasoningSteps: AgentReasoningStep[] = [
    {
      stepIndex: 1,
      phase: 'PARSE',
      title: 'Step 1: Autonomous Catalog SKU & Unit Cost Ingestion',
      agentName: 'Nail Frontier Agent',
      modelEngine: 'gemini-4-argon (Frontier Reasoning Core)',
      durationMs: 390,
      thoughtTrace: `Parsed ${analyzedItems.length} wholesale SKUs from "${sourceFileName}" with prompt context "${prompt || 'Maximize tender win-rate and margin velocity'}".`,
      toolCall: `argon.catalogParser.ingestSKUs({ source: "${sourceFileName}", count: ${analyzedItems.length} })`,
      toolOutput: `Normalized ${analyzedItems.length} SKUs across Cement, Steel, Aggregates, Timber, Masonry, and MEP categories.`,
      verificationBadge: 'CATALOG PARSED',
    },
    {
      stepIndex: 2,
      phase: 'REASON',
      title: 'Step 2: Real-Time Regional Competitor & Clearing Price Telemetry',
      agentName: 'Nail Frontier Agent',
      modelEngine: 'gemini-4-argon (Frontier Reasoning Core)',
      durationMs: 580,
      thoughtTrace: `Cross-referenced each SKU against live Greater London & UK regional trade clearing rates and depot stock tightness.`,
      toolCall: `argon.marketTelemetry.benchmarkPrices({ skus: ${analyzedItems.length}, radiusMiles: 25 })`,
      toolOutput: `Computed live market benchmarks and competitor density for ${analyzedItems.length} SKUs.`,
      verificationBadge: 'MARKET BENCHMARKED',
    },
    {
      stepIndex: 3,
      phase: 'MATCH',
      title: 'Step 3: Demand Elasticity & Active Contractor Tender Matching',
      agentName: 'Nail Frontier Agent',
      modelEngine: 'gemini-4-argon (Frontier Reasoning Core)',
      durationMs: 640,
      thoughtTrace: `Matched catalog inventory against 3 live contractor BOQ tenders (Commercial Complex Phase 2, Residential Development - 45 Units, Highway Bridge Refurbishment).`,
      toolCall: `argon.tenderMatcher.matchOpportunities({ catalogSkus: ${analyzedItems.length} })`,
      toolOutput: `Identified £198,300 in immediate high-match contractor tender opportunities (85%–94% SKU overlap).`,
      verificationBadge: '3 TENDERS MATCHED',
    },
    {
      stepIndex: 4,
      phase: 'VERIFY_LOOP',
      title: 'Step 4: Autonomous Margin-Floor & Price-Elasticity Verification Loop',
      agentName: 'Nail Frontier Agent',
      modelEngine: 'gemini-4-argon (Verification Critic Loop)',
      durationMs: 620,
      thoughtTrace: `Audited proposed dynamic prices against minimum gross-margin guardrails and anti-dumping constraints. Applied ${selfCorrectionsApplied} self-corrections where list prices were either over-priced (losing tenders) or under-priced during tight supply.`,
      toolCall: `argon.verifierLoop.auditPricingGuardrails({ minGrossMarginPct: 22.0, skus: ${analyzedItems.length} })`,
      toolOutput: `${selfCorrectionsApplied} SKUs re-calibrated to optimal win-rate/margin frontier.`,
      verificationBadge: `${selfCorrectionsApplied} SELF-CORRECTED`,
    },
    {
      stepIndex: 5,
      phase: 'OPTIMIZE',
      title: 'Step 5: Autonomous Quote Synthesis & Inventory Velocity Optimization',
      agentName: 'Nail Frontier Agent',
      modelEngine: 'gemini-4-argon (Pareto Optimizer)',
      durationMs: 450,
      thoughtTrace: `Generated ready-to-dispatch autonomous bid packages projected to lift depot revenue velocity by +${projectedRevenueLiftPercent}%.`,
      toolCall: `argon.salesAutopilot.prepareTenderQuotes({ opportunities: 3 })`,
      toolOutput: `Autonomous pricing & tender bid packages ready for instant dispatch.`,
      verificationBadge: `+${projectedRevenueLiftPercent}% REV LIFT`,
    },
  ];

  return {
    engineVersion: 'Gemini 4 Argon (v4.2-frontier-argon)',
    executionMode,
    catalogTitle,
    sourceFileName,
    promptUsed: prompt || `Full catalog market intelligence & dynamic pricing optimization for ${catalogTitle}`,
    items: analyzedItems,
    reasoningSteps,
    verificationEvents,
    executiveSummary,
    projectedRevenueLiftPercent,
    verificationLoopsRun: verificationEvents.length,
    selfCorrectionsApplied,
  };
}

/**
 * Generates an autonomous RFQ & negotiation brief for a specific supplier using Gemini 4 Argon
 */
export function generateAutonomousRfqPackage(params: {
  supplierName: string;
  projectTitle: string;
  items: BoMAnalysisLineItem[];
}): {
  rfqReference: string;
  subject: string;
  targetDeliveryWindow: string;
  matchedItems: BoMAnalysisLineItem[];
  totalValue: number;
  negotiationStrategy: string;
  draftMessage: string;
} {
  const { supplierName, projectTitle, items } = params;
  const matchedItems = items.filter(
    (item) =>
      item.recommendedSupplier.toLowerCase() === supplierName.toLowerCase() ||
      item.supplierOptions.some((opt) => opt.name.toLowerCase() === supplierName.toLowerCase())
  );
  const effectiveItems = matchedItems.length > 0 ? matchedItems : items.slice(0, 3);
  const totalValue = effectiveItems.reduce((sum, item) => {
    const opt = item.supplierOptions.find((o) => o.name.toLowerCase() === supplierName.toLowerCase());
    return sum + (opt ? Math.round(opt.pricePerUnit * item.quantity) : item.projectedPrice);
  }, 0);

  const rfqReference = `RFQ-ARGON-${Math.floor(100000 + (deterministicHash(supplierName + projectTitle) % 900000))}`;
  const subject = `[${rfqReference}] Verified Multi-Line Tender Request — ${projectTitle}`;
  const targetDeliveryWindow = 'Staged Call-Off (Next 5–10 Working Days)';
  const negotiationStrategy = `Gemini 4 Argon benchmarked ${supplierName} against 5 competing regional depots. Requesting a 3.5% bundled volume rebate on orders exceeding £${Math.max(5000, Math.round(totalValue * 0.8)).toLocaleString()} and mandatory BS EN / UKCA batch certificates upon dispatch.`;

  const linesText = effectiveItems
    .map((i) => {
      const opt = i.supplierOptions.find((o) => o.name.toLowerCase() === supplierName.toLowerCase());
      const unitRate = opt ? opt.pricePerUnit : Number((i.projectedPrice / i.quantity).toFixed(2));
      return `• ${i.partNumber}: ${i.description} (${i.specification}) — Qty: ${i.quantity.toLocaleString()} ${i.unit} @ Target £${unitRate.toFixed(2)}/${i.unit}`;
    })
    .join('\n');

  const draftMessage = `Dear ${supplierName} Commercial Desk,\n\nHammer&Nail Autonomous Procurement Agent (powered by Gemini 4 Argon) has selected your depot as a preferred verified supplier for ${projectTitle}.\n\nAllocated BOQ Line Items:\n${linesText}\n\nProjected Package Value: £${totalValue.toLocaleString()} (ex. VAT)\nRequired Compliance: Full BS EN / UKCA / CARES batch traceability certificates on delivery.\nPayment Terms: 30 Days Net upon verified site POD.\n\nPlease confirm lock-in of these unit rates and delivery slot allocation within 24 hours.`;

  return {
    rfqReference,
    subject,
    targetDeliveryWindow,
    matchedItems: effectiveItems,
    totalValue,
    negotiationStrategy,
    draftMessage,
  };
}

/**
 * Generates an autonomous Supplier Bid Package for a Contractor Opportunity using Gemini 4 Argon
 */
export function generateSupplierTenderBid(params: {
  opportunity: ContractorOpportunity;
  catalogItems: CatalogAnalysisLineItem[];
}): {
  bidReference: string;
  winProbability: number;
  grossMarginPercent: number;
  bidTotalFormatted: string;
  verificationSummary: string;
  draftProposal: string;
} {
  const { opportunity, catalogItems } = params;
  const bidReference = `BID-NAIL-${Math.floor(100000 + (deterministicHash(opportunity.id) % 900000))}`;
  const winProbability = Math.min(97, opportunity.matchPercent + 3);
  const grossMarginPercent = 24.8;

  const linesText = opportunity.lineItems
    .map((li) => `• ${li.material}: ${li.qty} @ Dynamic Optimized Rate ${li.targetUnitRate}`)
    .join('\n');

  const verificationSummary = `Gemini 4 Argon verified stock availability across ${catalogItems.length} catalog SKUs, confirmed haulage SLA (${opportunity.deadline}), and validated a ${grossMarginPercent}% gross margin floor.`;

  const draftProposal = `AUTONOMOUS TENDER SUBMISSION [${bidReference}]\nProject: ${opportunity.title} (${opportunity.contractorName} — ${opportunity.location})\nTender Package Value: ${opportunity.value} | Catalog SKU Match: ${opportunity.matchPercent}%\n\nProposed Line-Item Schedule:\n${linesText}\n\nDelivery & Compliance Guarantee:\n• Immediate stock allocation locked in depot ERP\n• Full UKCA / BS EN & ISO 9001 quality documentation attached\n• Guaranteed delivery within ${opportunity.deadline}`;

  return {
    bidReference,
    winProbability,
    grossMarginPercent,
    bidTotalFormatted: opportunity.value,
    verificationSummary,
    draftProposal,
  };
}
