import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  LogOut,
  X,
  ArrowLeft,
  Paperclip,
  Send,
  FileSpreadsheet,
  Cpu,
  Download,
  Sparkles,
  Play,
} from 'lucide-react';

export interface AuthUser {
  name: string;
  email: string;
  userType: 'contractor' | 'supplier';
}

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  onAuthenticated: (user: AuthUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onAuthenticated,
}) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'contractor' | 'supplier'>('contractor');
  const [error, setError] = useState('');

  useEffect(() => {
    setIsLogin(initialMode === 'login');
    setError('');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password || (!isLogin && !name)) {
      setError('Please fill in all fields');
      return;
    }
    const finalName = isLogin ? email.split('@')[0] : name;
    onAuthenticated({
      name: finalName,
      email,
      userType,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl border border-slate-100 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-[#143688] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Hammer&Nail Account
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            {isLogin ? 'Welcome Back' : 'Create Your Account'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {isLogin
              ? 'Sign in to access autonomous procurement & quoting'
              : 'Get started with Gemini 4 Argon Frontier Agents'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#143688] focus:ring-2 focus:ring-[#143688]/15"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Account Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUserType('contractor')}
                    className={`py-2.5 px-4 rounded-xl border-2 text-sm font-semibold transition-all cursor-pointer ${
                      userType === 'contractor'
                        ? 'border-[#143688] bg-blue-50/80 text-[#143688]'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    Contractor
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType('supplier')}
                    className={`py-2.5 px-4 rounded-xl border-2 text-sm font-semibold transition-all cursor-pointer ${
                      userType === 'supplier'
                        ? 'border-[#143688] bg-blue-50/80 text-[#143688]'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    Supplier
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Work Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#143688] focus:ring-2 focus:ring-[#143688]/15"
              placeholder="you@company.co.uk"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#143688] focus:ring-2 focus:ring-[#143688]/15"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl text-white text-sm font-semibold hover:opacity-95 transition-all shadow-md cursor-pointer"
            style={{ backgroundColor: '#143688' }}
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <span className="font-bold underline" style={{ color: '#143688' }}>
              {isLogin ? 'Sign Up' : 'Sign In'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const UserMenuDropdown: React.FC<{
  user: AuthUser;
  onLogout: () => void;
}> = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: '#143688' }}
        >
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-xs font-bold text-slate-900 leading-tight">{user.name}</div>
          <div className="text-[10px] text-slate-500 capitalize leading-tight">{user.userType}</div>
        </div>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
          <div className="px-4 py-2.5 border-b border-slate-100">
            <div className="text-xs font-bold text-slate-900">{user.name}</div>
            <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
            <div
              className="text-[11px] font-semibold mt-1 capitalize"
              style={{ color: '#143688' }}
            >
              {user.userType} Account
            </div>
          </div>
          <button
            onClick={() => {
              onLogout();
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export const PortalSwitcherHeader: React.FC<{
  activePortal: 'contractor' | 'supplier';
  onNavigate: (path: string) => void;
  user: AuthUser | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenEngineConfig: () => void;
}> = ({ activePortal, onNavigate, user, onOpenLogin, onLogout, onOpenEngineConfig }) => {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Back to Home */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span className="truncate">Back to Home</span>
          </button>
        </div>

        {/* Center: Equal-Width Pill Switcher (No Clipping) */}
        <div className="relative grid grid-cols-2 rounded-xl border border-slate-200 p-1 bg-slate-100 shadow-inner shrink-0">
          <div
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg transition-all duration-300 ease-out shadow-xs"
            style={{
              backgroundColor: '#143688',
              left: activePortal === 'contractor' ? '4px' : 'calc(50%)',
            }}
          />
          <button
            onClick={() => onNavigate('/contractor')}
            className={`relative z-10 w-28 sm:w-32 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-center transition-colors duration-200 cursor-pointer ${
              activePortal === 'contractor' ? 'text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Contractor
          </button>
          <button
            onClick={() => onNavigate('/supplier')}
            className={`relative z-10 w-28 sm:w-32 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-center transition-colors duration-200 cursor-pointer ${
              activePortal === 'supplier' ? 'text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Supplier
          </button>
        </div>

        {/* Right: Gemini 4 Argon Config & User Auth */}
        <div className="flex items-center justify-end gap-2.5 flex-1">
          <button
            onClick={onOpenEngineConfig}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/80 text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer shrink-0"
            style={{ color: '#143688' }}
            title="Configure Gemini 4 Argon Frontier Agent Engine"
          >
            <Cpu className="w-3.5 h-3.5 shrink-0" />
            <span>Gemini 4 Argon</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          {user ? (
            <UserMenuDropdown user={user} onLogout={onLogout} />
          ) : (
            <button
              onClick={onOpenLogin}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs sm:text-sm font-semibold hover:opacity-95 transition-opacity cursor-pointer shadow-xs shrink-0"
              style={{ backgroundColor: '#143688' }}
            >
              <User className="w-4 h-4" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export interface QuickExamplePill {
  id: string;
  shortLabel: string;
  title: string;
  fileName: string;
  csvUrl: string;
  defaultPrompt: string;
  itemCount: number;
}

interface SearchAndUploadBarProps {
  placeholder: string;
  examplePills: QuickExamplePill[];
  activeExampleId: string | null;
  onRunAgentWithTextOrFile: (text: string, file: File | null) => void;
  onSelectExamplePill: (pill: QuickExamplePill) => void;
  exampleSectionLabel: string;
}

export const SearchAndUploadBar: React.FC<SearchAndUploadBarProps> = ({
  placeholder,
  examplePills,
  activeExampleId,
  onRunAgentWithTextOrFile,
  onSelectExamplePill,
  exampleSectionLabel,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  const triggerSubmit = () => {
    if (inputValue.trim() || attachedFile) {
      onRunAgentWithTextOrFile(inputValue, attachedFile);
    } else if (examplePills.length > 0) {
      onSelectExamplePill(examplePills[0]);
      setInputValue(examplePills[0].defaultPrompt);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      triggerSubmit();
    }
  };

  const gridColsClass =
    examplePills.length === 3
      ? 'grid-cols-1 md:grid-cols-3'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  return (
    <div className="w-full max-w-5xl mx-auto">
      {attachedFile && (
        <div className="mb-3 flex items-center gap-2.5 px-4 py-2.5 bg-blue-50/90 border border-blue-200 rounded-xl text-xs sm:text-sm shadow-2xs">
          <FileSpreadsheet className="w-4 h-4 text-[#143688] shrink-0" />
          <span className="text-slate-900 font-semibold truncate flex-1">{attachedFile.name}</span>
          <span className="text-slate-500 text-xs shrink-0">
            {(attachedFile.size / 1024).toFixed(1)} KB
          </span>
          <button
            onClick={() => {
              setAttachedFile(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            className="text-slate-400 hover:text-red-600 ml-1 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Search & Upload Bar */}
      <div className="relative flex items-center bg-white border-2 border-slate-200 rounded-2xl shadow-md hover:border-slate-300 transition-all focus-within:border-[#143688] focus-within:ring-4 focus-within:ring-[#143688]/10">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept=".xlsx,.xls,.csv,.pdf,.doc,.docx,.json,.txt"
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="flex items-center gap-2 px-4 py-3.5 cursor-pointer hover:bg-slate-50 transition-colors rounded-l-2xl border-r border-slate-200 text-slate-600 hover:text-[#143688] shrink-0"
          title="Attach Bill of Quantities or Catalog (.csv, .xlsx, .json)"
        >
          <Paperclip className="w-5 h-5" />
          <span className="hidden sm:inline text-xs font-semibold">Attach CSV/BoM</span>
        </label>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 min-w-0 px-4 py-3.5 text-sm sm:text-base outline-none bg-transparent text-slate-900 placeholder-slate-400"
        />
        <button
          onClick={triggerSubmit}
          className="inline-flex items-center gap-2 px-5 py-3 m-1.5 rounded-xl text-white text-sm font-semibold transition-all bg-[#143688] hover:bg-[#0f2866] cursor-pointer shadow-sm shrink-0"
          title="Run Gemini 4 Argon Frontier Agent"
        >
          <span className="hidden sm:inline">Run Agent</span>
          <Send className="w-4 h-4" />
        </button>
      </div>

      <p className="mt-2.5 text-xs text-slate-500 text-center">
        Upload a Bill of Quantities / Catalog file (`.csv`, `.xlsx`, `.json`), enter a natural-language specification prompt, or select a pre-loaded project below:
      </p>

      {/* Pre-Loaded Example Projects / Catalogs Grid */}
      <div className="mt-5 rounded-2xl border border-slate-200/90 bg-slate-50/80 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
            style={{ color: '#143688' }}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>{exampleSectionLabel}</span>
          </div>
          <span className="text-[11px] font-medium text-slate-500">
            Click any card to run multi-step reasoning & verification loops
          </span>
        </div>

        <div className={`grid ${gridColsClass} gap-3`}>
          {examplePills.map((pill) => {
            const isSelected = activeExampleId === pill.id;
            return (
              <div
                key={pill.id}
                onClick={() => {
                  setInputValue(pill.defaultPrompt);
                  setAttachedFile(null);
                  onSelectExamplePill(pill);
                }}
                className={`group flex flex-col justify-between rounded-xl border p-3.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#143688] bg-blue-50/70 shadow-sm ring-1 ring-[#143688]/20'
                    : 'border-slate-200/90 bg-white hover:border-[#143688]/50 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className="text-xs font-bold leading-snug"
                      style={{ color: '#143688' }}
                    >
                      {pill.shortLabel}
                    </span>
                    <span className="shrink-0 rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                      {pill.itemCount} items
                    </span>
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-600 leading-relaxed line-clamp-2 min-h-[2.1rem]">
                    {pill.title}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                      isSelected ? 'text-[#143688]' : 'text-emerald-700 group-hover:text-[#143688]'
                    }`}
                  >
                    <Play className="w-3 h-3 fill-current" />
                    {isSelected ? 'Active Dataset' : 'Run Agent'}
                  </span>
                  <a
                    href={pill.csvUrl}
                    download={pill.fileName}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-200 hover:text-[#143688] transition-colors"
                    title={`Download ${pill.fileName}`}
                  >
                    <Download className="w-2.5 h-2.5" />
                    CSV
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
