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
  FileSpreadsheet,
  Download,
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
    <div
      className="mt-6 rounded-xl border bg-slate-50/90 p-5 shadow-sm transition-all"
      style={{ borderColor: 'rgba(20, 54, 136, 0.22)' }}
    >
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg text-white shadow-sm"
            style={{ backgroundColor: '#143688' }}
          >
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold tracking-tight" style={{ color: '#143688' }}>
                {agentName} Frontier Agent • Powered by {engineVersion}
              </span>
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                style={{ backgroundColor: '#143688' }}
              >
                <Sparkles className="h-3 w-3" />
                {executionMode === 'LIVE_GEMINI_API' ? 'Live Gemini API Connected' : 'Autonomous Frontier Engine Active'}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                <ShieldCheck className="h-3.5 w-3.5" />
                {verificationEvents.length} Verification Checks ({selfCorrectionsApplied} Self-Corrected)
              </span>
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-900">
                {savingsBadgeText}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-600">{executiveSummary}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenEngineConfig}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Key className="h-3.5 w-3.5" style={{ color: '#143688' }} />
            Gemini 4 Argon API
          </button>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#143688' }}
          >
            {expanded ? (
              <>
                Hide Reasoning & Verification Loop
                <ChevronUp className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                Inspect Reasoning & Verification Loop ({reasoningSteps.length} Steps)
                <ChevronDown className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Multi-Step Reasoning & Verification Loop Trace */}
      {expanded && (
        <div className="mt-4 border-t border-slate-200 pt-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('steps')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeTab === 'steps'
                    ? 'text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
                style={activeTab === 'steps' ? { backgroundColor: '#143688' } : undefined}
              >
                Multi-Step Autonomous Reasoning Trace ({reasoningSteps.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('verification')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeTab === 'verification'
                    ? 'text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
                style={activeTab === 'verification' ? { backgroundColor: '#143688' } : undefined}
              >
                Verification & Self-Correction Loop Log ({verificationEvents.length})
              </button>
            </div>
            <span className="text-xs text-slate-500">
              Engine: <strong className="text-slate-700">gemini-4-argon</strong> • Critic Loop: <strong className="text-emerald-700">ENABLED</strong>
            </span>
          </div>

          {activeTab === 'steps' ? (
            <div className="space-y-2.5">
              {reasoningSteps.map((step) => (
                <div
                  key={step.stepIndex}
                  className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: '#143688' }}
                      >
                        {step.stepIndex}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{step.title}</span>
                      <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-600">
                        {step.durationMs}ms
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        step.phase === 'VERIFY_LOOP'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-emerald-100 text-emerald-800'
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
                  <p className="mt-1.5 text-xs text-slate-700 leading-relaxed">{step.thoughtTrace}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 rounded bg-slate-900 px-3 py-1.5 font-mono text-[11px] text-slate-200">
                    <Terminal className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    <span className="text-blue-300">{step.toolCall}</span>
                    <span className="text-slate-400">→</span>
                    <span className="text-emerald-300">{step.toolOutput}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {verificationEvents.map((ev) => (
                <div
                  key={ev.id}
                  className={`rounded-lg border p-3.5 ${
                    ev.status === 'REJECTED_AND_CORRECTED'
                      ? 'border-amber-300 bg-amber-50/60'
                      : 'border-emerald-200 bg-white'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {ev.status === 'REJECTED_AND_CORRECTED' ? (
                        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      )}
                      <span className="text-xs font-bold text-slate-900">{ev.itemRef}</span>
                      <span className="rounded bg-slate-200/70 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-700">
                        {ev.checkType}
                      </span>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        ev.status === 'REJECTED_AND_CORRECTED'
                          ? 'bg-amber-200 text-amber-900'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {ev.status === 'REJECTED_AND_CORRECTED'
                        ? 'SELF-CORRECTED BY CRITIC LOOP'
                        : 'VERIFIED PASS'}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-1 gap-1.5 text-xs md:grid-cols-3">
                    <div className="rounded bg-white/80 p-2 border border-slate-200/80">
                      <span className="block text-[10px] font-semibold uppercase text-slate-400">
                        1. Critic Audit Finding
                      </span>
                      <span className="text-slate-700">{ev.initialFinding}</span>
                    </div>
                    <div className="rounded bg-white/80 p-2 border border-slate-200/80">
                      <span className="block text-[10px] font-semibold uppercase text-slate-400">
                        2. Autonomous Action
                      </span>
                      <span className="text-slate-700">{ev.correctiveAction}</span>
                    </div>
                    <div className="rounded bg-white/80 p-2 border border-slate-200/80">
                      <span className="block text-[10px] font-semibold uppercase text-slate-400">
                        3. Verified Outcome ({Math.round(ev.confidenceScore * 100)}% Conf)
                      </span>
                      <span className="font-semibold text-emerald-800">{ev.finalOutcome}</span>
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white"
              style={{ backgroundColor: '#143688' }}
            >
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Gemini 4 Argon — Frontier Agent Engine
              </h3>
              <p className="text-xs text-slate-500">
                Configure LLM API credentials & autonomous verification loop parameters
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-700">
              Active Engine Model ID
            </label>
            <select
              value={config.modelId}
              onChange={(e) => setConfig({ ...config, modelId: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none"
            >
              <option value="gemini-4-argon">gemini-4-argon (Frontier Multi-Step Reasoning + Critic Loop)</option>
              <option value="gemini-2.5-pro">gemini-2.5-pro (Google Gemini Pro API Bridge)</option>
              <option value="gemini-2.5-flash">gemini-2.5-flash (Low-Latency Agentic Bridge)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-700">
              Gemini API Key (Optional — Works Out-of-the-Box Without Key)
            </label>
            <input
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              placeholder="AIzaSy... (Leave blank to use built-in Gemini 4 Argon Autonomous Engine)"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-500">
              When provided, Hammer & Nail agents call the live Gemini API endpoint in addition to running the deterministic BOQ/Catalog verification loop.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-200 p-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={config.enableAutonomousVerification}
                  onChange={(e) =>
                    setConfig({ ...config, enableAutonomousVerification: e.target.checked })
                  }
                  className="rounded"
                />
                Autonomous Verification Loop
              </label>
              <p className="mt-1 text-[11px] text-slate-500">
                Automatically rejects uncertified steel/concrete quotes and self-corrects supplier selection.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 p-3">
              <label className="block text-xs font-semibold text-slate-800">
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
                className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
              />
            </div>
          </div>

          {savedBanner && (
            <div className="rounded-lg bg-emerald-50 p-2.5 text-center text-xs font-semibold text-emerald-800">
              ✓ Gemini 4 Argon Engine Configuration Saved
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <span
              className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold text-white mb-1"
              style={{ backgroundColor: '#143688' }}
            >
              Gemini 4 Argon • Autonomous RFQ Dispatch
            </span>
            <h3 className="text-xl font-bold text-slate-900">
              Request Verified Quote — {supplierName}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
              <div className="text-xs text-slate-500">RFQ Reference</div>
              <div className="font-mono text-sm font-bold text-slate-900">{rfqData.rfqReference}</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
              <div className="text-xs text-slate-500">Allocated Package Value</div>
              <div className="text-sm font-bold" style={{ color: '#143688' }}>
                £{rfqData.totalValue.toLocaleString()} (ex. VAT)
              </div>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
              <div className="text-xs text-slate-500">Target SLA Window</div>
              <div className="text-sm font-semibold text-emerald-700">
                {rfqData.targetDeliveryWindow}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-3 text-xs text-blue-950">
            <strong className="font-semibold">Gemini 4 Argon Negotiation Strategy:</strong>{' '}
            {rfqData.negotiationStrategy}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Autonomous RFQ Payload (Editable before dispatch)
            </label>
            <textarea
              rows={9}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-3 font-mono text-xs text-slate-800 focus:outline-none"
            />
          </div>

          {dispatched ? (
            <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-center">
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
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => setDispatched(true)}
                className="inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <span
              className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold text-white mb-1"
              style={{ backgroundColor: '#143688' }}
            >
              Nail Frontier Agent • Autonomous Tender Bid Generator
            </span>
            <h3 className="text-xl font-bold text-slate-900">
              {opportunityTitle} — {contractorName}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
              <div className="text-xs text-slate-500">Tender Package Value</div>
              <div className="text-base font-bold" style={{ color: '#143688' }}>
                {bidData.bidTotalFormatted}
              </div>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
              <div className="text-xs text-slate-500">Win Probability</div>
              <div className="text-base font-bold text-emerald-700">{bidData.winProbability}%</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
              <div className="text-xs text-slate-500">Verified Gross Margin</div>
              <div className="text-base font-bold text-slate-900">{bidData.grossMarginPercent}%</div>
            </div>
          </div>

          <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-950">
            <strong className="font-semibold">Gemini 4 Argon Verification Pass:</strong>{' '}
            {bidData.verificationSummary}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Autonomous Bid Schedule & SLA Commitment
            </label>
            <textarea
              rows={9}
              value={proposalText}
              onChange={(e) => setProposalText(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-3 font-mono text-xs text-slate-800 focus:outline-none"
            />
          </div>

          {submitted ? (
            <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-center">
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
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setSubmitted(true)}
                className="inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
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
