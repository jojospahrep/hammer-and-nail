import React, { useState } from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Cpu,
  RefreshCw,
  AlertTriangle,
  Terminal,
  Key,
  X,
  Send,
} from 'lucide-react';
import {
  AgentReasoningStep,
  AgentVerificationEvent,
  GeminiArgonConfig,
  getGeminiArgonConfig,
  saveGeminiArgonConfig,
} from '../services/geminiArgonAgent';

interface FrontierAgentTracePanelProps {
  agentName: 'Hammer' | 'Nail';
  engineVersion: string;
  executionMode: 'LIVE_GEMINI_API' | 'GEMINI_4_ARGON_AUTONOMOUS_ENGINE';
  executiveSummary: string;
  reasoningSteps: AgentReasoningStep[];
  verificationEvents: AgentVerificationEvent[];
  selfCorrectionsApplied: number;
  savingsBadgeText: string;
  onOpenEngineConfig: () => void;
}

export const FrontierAgentTracePanel: React.FC<FrontierAgentTracePanelProps> = ({
  agentName,
  engineVersion,
  executionMode,
  executiveSummary,
  reasoningSteps,
  verificationEvents,
  selfCorrectionsApplied,
  savingsBadgeText,
  onOpenEngineConfig,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'steps' | 'verification'>('steps');

  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Top Executive Header Bar */}
      <div
        className="px-5 py-4 text-white"
        style={{
          background: 'linear-gradient(135deg, #0f2866 0%, #143688 60%, #1e40af 100%)',
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs border border-white/20 flex items-center justify-center shrink-0 mt-0.5">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm sm:text-base font-bold tracking-tight text-white">
                  {agentName} Frontier Agent • {engineVersion}
                </h4>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 border border-white/25 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                  <Sparkles className="w-3 h-3 text-sky-300" />
                  {executionMode === 'LIVE_GEMINI_API'
                    ? 'Live Gemini API Connected'
                    : 'Autonomous Frontier Engine'}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 border border-emerald-300/30 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-100">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  {verificationEvents.length} Audits ({selfCorrectionsApplied} Self-Corrected)
                </span>
                <span className="inline-flex items-center rounded-full bg-amber-400/20 border border-amber-300/30 px-2.5 py-0.5 text-[11px] font-bold text-amber-100">
                  {savingsBadgeText}
                </span>
              </div>
              <p className="mt-1.5 text-xs sm:text-sm text-blue-100 leading-relaxed">
                {executiveSummary}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenEngineConfig}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 text-sky-200" />
              <span>API Key & Engine</span>
            </button>
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-[#143688] hover:bg-blue-50 transition-colors cursor-pointer shadow-xs"
            >
              {expanded ? (
                <>
                  <span>Hide Agent Trace</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>Inspect Agent Trace ({reasoningSteps.length} Steps)</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Multi-Step Reasoning & Verification Loop Body */}
      {expanded && (
        <div className="p-5 bg-slate-50/70">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('steps')}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'steps'
                    ? 'bg-[#143688] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Multi-Step Autonomous Reasoning ({reasoningSteps.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('verification')}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'verification'
                    ? 'bg-[#143688] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Verification & Critic Loop Audit ({verificationEvents.length})
              </button>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span>
                Model: <strong className="font-mono text-slate-700">gemini-4-argon</strong>
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Critic Self-Correction Active
              </span>
            </div>
          </div>

          {activeTab === 'steps' ? (
            <div className="space-y-3">
              {reasoningSteps.map((step) => (
                <div
                  key={step.stepIndex}
                  className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold text-white shrink-0"
                        style={{ backgroundColor: '#143688' }}
                      >
                        {step.stepIndex}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        {step.title}
                      </span>
                      <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-600 shrink-0">
                        {step.durationMs}ms
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold shrink-0 ${
                        step.phase === 'VERIFY_LOOP'
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {step.phase === 'VERIFY_LOOP' ? (
                        <RefreshCw className="h-3 w-3" />
                      ) : (
                        <CheckCircle2 className="h-3 w-3" />
                      )}
                      {step.verificationBadge}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    {step.thoughtTrace}
                  </p>

                  <div className="mt-2.5 rounded-lg bg-slate-900 px-3.5 py-2 font-mono text-[11px] text-slate-200 overflow-x-auto">
                    <div className="flex items-start sm:items-center gap-2 flex-col sm:flex-row">
                      <div className="flex items-center gap-1.5 text-sky-300 shrink-0">
                        <Terminal className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                        <span className="break-all">{step.toolCall}</span>
                      </div>
                      <span className="hidden sm:inline text-slate-500">→</span>
                      <span className="text-emerald-300 break-words">{step.toolOutput}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {verificationEvents.map((ev) => (
                <div
                  key={ev.id}
                  className={`rounded-xl border p-4 ${
                    ev.status === 'REJECTED_AND_CORRECTED'
                      ? 'border-amber-300 bg-amber-50/50'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      {ev.status === 'REJECTED_AND_CORRECTED' ? (
                        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      )}
                      <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {ev.itemRef}
                      </span>
                      <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-700 shrink-0">
                        {ev.checkType}
                      </span>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold shrink-0 ${
                        ev.status === 'REJECTED_AND_CORRECTED'
                          ? 'bg-amber-200/80 text-amber-950'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {ev.status === 'REJECTED_AND_CORRECTED'
                        ? 'SELF-CORRECTED BY CRITIC LOOP'
                        : 'VERIFIED PASS'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                    <div className="rounded-lg bg-white p-3 border border-slate-200/80">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        1. Critic Audit Finding
                      </span>
                      <span className="text-slate-700 leading-relaxed">{ev.initialFinding}</span>
                    </div>
                    <div className="rounded-lg bg-white p-3 border border-slate-200/80">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        2. Autonomous Action
                      </span>
                      <span className="text-slate-700 leading-relaxed">{ev.correctiveAction}</span>
                    </div>
                    <div className="rounded-lg bg-white p-3 border border-slate-200/80">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        3. Verified Outcome ({Math.round(ev.confidenceScore * 100)}% Conf)
                      </span>
                      <span className="font-semibold text-emerald-800 leading-relaxed">
                        {ev.finalOutcome}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface GeminiArgonConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (config: GeminiArgonConfig) => void;
}

export const GeminiArgonConfigModal: React.FC<GeminiArgonConfigModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [config, setConfig] = useState<GeminiArgonConfig>(() => getGeminiArgonConfig());
  const [savedBanner, setSavedBanner] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveGeminiArgonConfig(config);
    onSaved(config);
    setSavedBanner(true);
    setTimeout(() => {
      setSavedBanner(false);
      onClose();
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-xs"
              style={{ backgroundColor: '#143688' }}
            >
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Gemini 4 Argon — Frontier Engine Settings
              </h3>
              <p className="text-xs text-slate-500">
                Configure LLM API key & autonomous verification loop parameters
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Active Engine Model ID
            </label>
            <select
              value={config.modelId}
              onChange={(e) => setConfig({ ...config, modelId: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#143688]"
            >
              <option value="gemini-4-argon">
                gemini-4-argon (Frontier Multi-Step Reasoning + Critic Loop)
              </option>
              <option value="gemini-2.5-pro">gemini-2.5-pro (Google Gemini Pro API Bridge)</option>
              <option value="gemini-2.5-flash">
                gemini-2.5-flash (Low-Latency Agentic Bridge)
              </option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Gemini API Key (Optional — Built-in Engine Works Out-of-the-Box)
            </label>
            <input
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              placeholder="AIzaSy... (Leave blank for built-in Gemini 4 Argon Engine)"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#143688]"
            />
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
              When provided, Hammer & Nail agents invoke the live Gemini API endpoint alongside the deterministic UKCA/BS EN verification loop.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enableAutonomousVerification}
                  onChange={(e) =>
                    setConfig({ ...config, enableAutonomousVerification: e.target.checked })
                  }
                  className="rounded text-[#143688]"
                />
                Autonomous Verification Loop
              </label>
              <p className="mt-1.5 text-[11px] text-slate-500 leading-relaxed">
                Automatically rejects uncertified steel/concrete quotes and self-corrects supplier selection.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Max Self-Correction Passes
              </label>
              <input
                type="number"
                min={1}
                max={5}
                value={config.maxVerificationIterations}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    maxVerificationIterations: Math.max(1, Math.min(5, Number(e.target.value))),
                  })
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold"
              />
            </div>
          </div>

          {savedBanner && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-center text-xs font-bold text-emerald-800">
              ✓ Gemini 4 Argon Engine Configuration Saved
            </div>
          )}

          <div className="flex justify-end gap-2.5 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl px-5 py-2 text-xs sm:text-sm font-semibold text-white hover:opacity-95 cursor-pointer shadow-sm"
              style={{ backgroundColor: '#143688' }}
            >
              Save Engine Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface AutonomousRfqModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierName: string;
  rfqData: {
    rfqReference: string;
    subject: string;
    targetDeliveryWindow: string;
    totalValue: number;
    negotiationStrategy: string;
    draftMessage: string;
  } | null;
}

export const AutonomousRfqModal: React.FC<AutonomousRfqModalProps> = ({
  isOpen,
  onClose,
  supplierName,
  rfqData,
}) => {
  const [dispatched, setDispatched] = useState(false);
  const [messageText, setMessageText] = useState('');

  React.useEffect(() => {
    if (rfqData) {
      setMessageText(rfqData.draftMessage);
      setDispatched(false);
    }
  }, [rfqData]);

  if (!isOpen || !rfqData) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white mb-1.5"
              style={{ backgroundColor: '#143688' }}
            >
              <Sparkles className="w-3 h-3" />
              Gemini 4 Argon • Autonomous RFQ Dispatch
            </span>
            <h3 className="text-xl font-bold text-slate-900">
              Request Verified Quote — {supplierName}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
              <div className="text-[11px] font-semibold uppercase text-slate-400">RFQ Reference</div>
              <div className="font-mono text-sm font-bold text-slate-900 mt-0.5">
                {rfqData.rfqReference}
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
              <div className="text-[11px] font-semibold uppercase text-slate-400">
                Package Value
              </div>
              <div className="text-sm font-bold mt-0.5" style={{ color: '#143688' }}>
                £{rfqData.totalValue.toLocaleString()} (ex. VAT)
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
              <div className="text-[11px] font-semibold uppercase text-slate-400">
                Target SLA Window
              </div>
              <div className="text-xs font-bold text-emerald-700 mt-1">
                {rfqData.targetDeliveryWindow}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-950 leading-relaxed">
            <strong className="font-bold">Gemini 4 Argon Negotiation Strategy:</strong>{' '}
            {rfqData.negotiationStrategy}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Autonomous RFQ Payload (Editable before dispatch)
            </label>
            <textarea
              rows={9}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-3.5 font-mono text-xs text-slate-800 focus:outline-none focus:border-[#143688]"
            />
          </div>

          {dispatched ? (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-sm font-bold text-emerald-900">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                Autonomous RFQ {rfqData.rfqReference} Dispatched to {supplierName}!
              </div>
              <p className="mt-1 text-xs text-emerald-700">
                Hammer Agent is monitoring the supplier desk response and will verify incoming mill/batch certificates automatically.
              </p>
            </div>
          ) : (
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => setDispatched(true)}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:opacity-95 cursor-pointer shadow-sm"
                style={{ backgroundColor: '#143688' }}
              >
                <Send className="h-4 w-4" />
                Dispatch Verified RFQ Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface SupplierTenderBidModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunityTitle: string;
  contractorName: string;
  bidData: {
    bidReference: string;
    winProbability: number;
    grossMarginPercent: number;
    bidTotalFormatted: string;
    verificationSummary: string;
    draftProposal: string;
  } | null;
}

export const SupplierTenderBidModal: React.FC<SupplierTenderBidModalProps> = ({
  isOpen,
  onClose,
  opportunityTitle,
  contractorName,
  bidData,
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [proposalText, setProposalText] = useState('');

  React.useEffect(() => {
    if (bidData) {
      setProposalText(bidData.draftProposal);
      setSubmitted(false);
    }
  }, [bidData]);

  if (!isOpen || !bidData) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white mb-1.5"
              style={{ backgroundColor: '#143688' }}
            >
              <Sparkles className="w-3 h-3" />
              Nail Frontier Agent • Autonomous Tender Bid Generator
            </span>
            <h3 className="text-xl font-bold text-slate-900">
              {opportunityTitle} — {contractorName}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
              <div className="text-[11px] font-semibold uppercase text-slate-400">
                Tender Package Value
              </div>
              <div className="text-base font-bold mt-0.5" style={{ color: '#143688' }}>
                {bidData.bidTotalFormatted}
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
              <div className="text-[11px] font-semibold uppercase text-slate-400">
                Win Probability
              </div>
              <div className="text-base font-bold text-emerald-700 mt-0.5">
                {bidData.winProbability}%
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
              <div className="text-[11px] font-semibold uppercase text-slate-400">
                Verified Gross Margin
              </div>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                {bidData.grossMarginPercent}%
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-950 leading-relaxed">
            <strong className="font-bold">Gemini 4 Argon Verification Pass:</strong>{' '}
            {bidData.verificationSummary}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Autonomous Bid Schedule & SLA Commitment
            </label>
            <textarea
              rows={9}
              value={proposalText}
              onChange={(e) => setProposalText(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-3.5 font-mono text-xs text-slate-800 focus:outline-none focus:border-[#143688]"
            />
          </div>

          {submitted ? (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-sm font-bold text-emerald-900">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                Autonomous Bid {bidData.bidReference} Submitted to {contractorName}!
              </div>
              <p className="mt-1 text-xs text-emerald-700">
                Nail Agent has locked inventory reservations and will autonomously negotiate call-off schedules within your 22% margin guardrail.
              </p>
            </div>
          ) : (
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setSubmitted(true)}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:opacity-95 cursor-pointer shadow-sm"
                style={{ backgroundColor: '#143688' }}
              >
                <Send className="h-4 w-4" />
                Dispatch Autonomous Bid Package
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
