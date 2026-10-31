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
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-md w-full p-8 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2" style={{ color: '#143688' }}>
            {isLogin ? 'Welcome Back' : 'Get Started'}
          </h2>
          <p className="text-gray-600">
            {isLogin ? 'Sign in to access your account' : 'Create your account to begin'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUserType('contractor')}
                    className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                      userType === 'contractor'
                        ? 'border-[#143688] bg-blue-50 text-[#143688]'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    Contractor
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType('supplier')}
                    className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                      userType === 'supplier'
                        ? 'border-[#143688] bg-blue-50 text-[#143688]'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    Supplier
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
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
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <span className="font-semibold" style={{ color: '#143688' }}>
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
        className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 hover:bg-gray-50 transition-colors"
        style={{ borderColor: '#143688' }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold"
          style={{ backgroundColor: '#143688' }}
        >
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-sm font-semibold text-gray-900">{user.name}</div>
          <div className="text-xs text-gray-500 capitalize">{user.userType}</div>
        </div>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-200">
            <div className="text-sm font-semibold text-gray-900">{user.name}</div>
            <div className="text-xs text-gray-500">{user.email}</div>
            <div
              className="text-xs font-medium mt-1 capitalize"
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
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
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
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>

          <div className="relative inline-flex rounded-lg border-2 border-gray-200 p-1 bg-gray-100">
            <div
              className="absolute top-1 bottom-1 rounded-md transition-all duration-300 ease-in-out"
              style={{
                backgroundColor: '#143688',
                width: 'calc(50% - 4px)',
                left: activePortal === 'contractor' ? '4px' : 'calc(50% + 0px)',
              }}
            />
            <button
              onClick={() => onNavigate('/contractor')}
              className={`relative z-10 px-6 py-2 rounded-md text-sm font-semibold transition-colors duration-300 cursor-pointer ${
                activePortal === 'contractor' ? 'text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Contractor
            </button>
            <button
              onClick={() => onNavigate('/supplier')}
              className={`relative z-10 px-6 py-2 rounded-md text-sm font-semibold transition-colors duration-300 cursor-pointer ${
                activePortal === 'supplier' ? 'text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Supplier
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenEngineConfig}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-blue-200 bg-blue-50/70 text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer"
              style={{ color: '#143688' }}
              title="Configure Gemini 4 Argon Frontier Agent Engine"
            >
              <Cpu className="w-4 h-4" />
              <span>Gemini 4 Argon</span>
            </button>

            {user ? (
              <UserMenuDropdown user={user} onLogout={onLogout} />
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                style={{ backgroundColor: '#143688' }}
              >
                <User className="w-4 h-4" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
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
      // If user clicks Send with empty input, run the first example BoM/Catalog immediately so it never dead-ends!
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

  return (
    <div className="w-full max-w-4xl mx-auto">
      {attachedFile && (
        <div className="mb-3 flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <FileSpreadsheet className="w-4 h-4 text-blue-600" />
          <span className="text-blue-900 flex-1 font-medium">{attachedFile.name}</span>
          <span className="text-blue-600 text-xs">
            {(attachedFile.size / 1024).toFixed(1)} KB
          </span>
          <button
            onClick={() => {
              setAttachedFile(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            className="text-blue-600 hover:text-blue-800 ml-2 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      <div className="relative flex items-center bg-white border-2 border-gray-300 rounded-xl shadow-lg hover:border-gray-400 transition-colors focus-within:border-[#143688] focus-within:ring-2 focus-within:ring-[#143688]/20">
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
          className="flex items-center justify-center px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors rounded-l-xl border-r border-gray-200"
          title="Attach Bill of Quantities or Catalog (.csv, .xlsx, .json)"
        >
          <Paperclip className="w-5 h-5 text-gray-500 hover:text-[#143688] transition-colors" />
        </label>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 px-4 py-3.5 text-base outline-none bg-transparent text-gray-900 placeholder-gray-400"
        />
        <button
          onClick={triggerSubmit}
          className="px-5 py-3.5 m-1 rounded-lg text-white font-medium transition-all bg-[#143688] hover:bg-[#143688]/90 cursor-pointer shadow-md hover:shadow-lg"
          title="Run Gemini 4 Argon Frontier Agent"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      <p className="mt-2 text-xs text-gray-500 text-center">
        Upload your Bill of Quantities (Excel, CSV, JSON) or type a natural-language request, or click an example project below to run Gemini 4 Argon immediately
      </p>

      {/* Embedded Example Construction Projects / BoMs & Supplier Catalogs Pills */}
      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/90 p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: '#143688' }}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>{exampleSectionLabel}</span>
          </div>
          <span className="text-[11px] text-slate-500">
            Click any example to load its BoM/Catalog & trigger Gemini 4 Argon multi-step verification
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {examplePills.map((pill) => {
            const isSelected = activeExampleId === pill.id;
            return (
              <div
                key={pill.id}
                className={`group flex flex-col justify-between rounded-lg border p-2.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#143688] bg-blue-50/90 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-[#143688]/60 hover:bg-blue-50/30'
                }`}
                onClick={() => {
                  setInputValue(pill.defaultPrompt);
                  setAttachedFile(null);
                  onSelectExamplePill(pill);
                }}
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className="text-xs font-bold truncate"
                      style={{ color: '#143688' }}
                    >
                      {pill.shortLabel}
                    </span>
                    <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                      {pill.itemCount} items
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-600 line-clamp-1">
                    {pill.title}
                  </p>
                </div>

                <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5">
                  <span className="text-[10px] font-semibold text-emerald-700">
                    ▶ Run Frontier Agent
                  </span>
                  <a
                    href={pill.csvUrl}
                    download={pill.fileName}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-0.5 text-[10px] font-medium text-slate-500 hover:text-[#143688]"
                    title={`Download ${pill.fileName}`}
                  >
                    <Download className="w-3 h-3" />
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
