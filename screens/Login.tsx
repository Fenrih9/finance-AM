import React, { useState } from 'react';
import { Screen } from '../types';
import { useData } from '../DataContext';
import { useTheme } from '../ThemeContext';

interface LoginProps {
  onNavigate: (screen: Screen) => void;
}

export const LoginScreen: React.FC<LoginProps> = ({ onNavigate }) => {
  const { login } = useData();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saveInfo, setSaveInfo] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (email && password) {
      try {
        await login(email, password);
      } catch (err: any) {
        setError(err.message || 'Erro ao fazer login');
      }
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

      {/* Left Side - Brand & Aesthetic (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900 text-white p-12 flex-col justify-between">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-indigo-500/20 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-purple-500/20 blur-[120px]" />
          <div className="absolute top-[40%] left-[40%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 blur-[100px]" />
        </div>

        {/* Brand Content */}
        <div className="relative z-10 animate-in fade-in slide-in-from-top duration-700">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-indigo-500/20 shadow-lg">
              <span className="material-symbols-outlined text-white text-xl">account_balance_wallet</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Finanças Nosso</span>
          </div>
        </div>

        <div className="relative z-10 max-w-lg mb-12 animate-in fade-in slide-in-from-bottom duration-1000 delay-200">
          <h1 className="text-5xl font-extrabold tracking-tight mb-6 leading-tight">
            Gerencie suas finanças com <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">inteligência</span>.
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            Acompanhe gastos, defina metas e conquiste sua liberdade financeira em uma plataforma simples e poderosa.
          </p>
        </div>

        <div className="relative z-10 text-sm text-slate-500 animate-in fade-in duration-1000 delay-500">
          © {new Date().getFullYear()} Finanças Nosso. Todos os direitos reservados.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 relative">
        <div className="w-full max-w-[400px] space-y-8 animate-in fade-in zoom-in-95 duration-500">

          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
              <span className="material-symbols-outlined text-white text-2xl">account_balance_wallet</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Bem-vindo de volta</h2>
          </div>

          <div className="hidden lg:block">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">Bem-vindo</h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">Entre com suas credenciais para acessar.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <span className="material-symbols-outlined">mail</span>
                </div>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  className="block w-full rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 py-3.5 pl-10 text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all shadow-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Senha</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <span className="material-symbols-outlined">lock</span>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="block w-full rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 py-3.5 pl-10 pr-10 text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all shadow-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-indigo-500 transition-colors"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer group select-none">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={saveInfo}
                  onChange={(e) => setSaveInfo(e.target.checked)}
                />
                <div className="flex items-center justify-center w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded-[6px] transition-all peer-checked:bg-indigo-500 peer-checked:border-indigo-500 text-white">
                  {saveInfo && <span className="material-symbols-outlined text-[14px] font-bold">check</span>}
                </div>
                <span className="ml-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                  Lembrar de mim
                </span>
              </label>
              <button type="button" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">Esqueceu a senha?</button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full relative group overflow-hidden rounded-2xl bg-slate-900 dark:bg-white py-4 text-sm font-bold text-white dark:text-slate-900 shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 dark:hover:shadow-white/20 transition-all active:scale-[0.98]"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shine" />
              Entrar
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-slate-50 dark:bg-slate-950 px-4 text-slate-500">ou</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Não tem uma conta?{' '}
              <button
                onClick={() => onNavigate(Screen.REGISTER)}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline transition-all"
              >
                Cadastre-se gratuitamente
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};