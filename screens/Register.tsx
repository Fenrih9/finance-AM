import React, { useState, useMemo } from 'react';
import { Screen } from '../types';
import { useData } from '../DataContext';
import { useTheme } from '../ThemeContext';
import { validatePassword } from '../security-utils';

interface RegisterProps {
  onNavigate: (screen: Screen) => void;
}

export const RegisterScreen: React.FC<RegisterProps> = ({ onNavigate }) => {
  const { register } = useData();
  const { theme } = useTheme();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saveInfo, setSaveInfo] = useState(false);
  const [error, setError] = useState('');

  // Password strength validation
  const passwordValidation = useMemo(() => {
    if (!password) return null;
    return validatePassword(password);
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (name && email && password) {
      // Validate password strength
      if (passwordValidation && !passwordValidation.isValid) {
        setError(passwordValidation.errors[0]);
        return;
      }

      try {
        await register(name, email, password);
      } catch (err: any) {
        setError(err.message || 'Erro ao criar conta');
      }
    }
  };

  return (
    <div className="flex flex-col h-full items-center justify-center p-6 max-w-md mx-auto w-full animate-in fade-in slide-in-from-right-10 duration-500">

      <div className="w-full mb-6">
        <button
          onClick={() => onNavigate(Screen.LOGIN)}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Voltar
        </button>
      </div>

      <div className="w-full mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Crie sua conta</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Comece a controlar seus gastos hoje.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full space-y-4">

        {/* Name */}
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Nome Completo</label>
          <div className="flex items-center rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700/50 p-3 shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
            <span className="material-symbols-outlined text-slate-400 mr-2">person</span>
            <input
              type="text"
              placeholder="Seu nome"
              className="w-full bg-transparent border-none p-0 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Email</label>
          <div className="flex items-center rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700/50 p-3 shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
            <span className="material-symbols-outlined text-slate-400 mr-2">mail</span>
            <input
              type="email"
              placeholder="seu@email.com"
              className="w-full bg-transparent border-none p-0 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Senha</label>
          <div className="flex items-center rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700/50 p-3 shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
            <span className="material-symbols-outlined text-slate-400 mr-2">lock</span>
            <input
              type="password"
              placeholder="Crie uma senha forte"
              className="w-full bg-transparent border-none p-0 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Password Strength Indicator */}
          {password && passwordValidation && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Força da senha:</span>
                <span className={`text-xs font-bold ${passwordValidation.strength === 'very-strong' ? 'text-green-600' :
                    passwordValidation.strength === 'strong' ? 'text-blue-600' :
                      passwordValidation.strength === 'medium' ? 'text-yellow-600' :
                        'text-red-600'
                  }`}>
                  {passwordValidation.strength === 'very-strong' ? 'Muito Forte' :
                    passwordValidation.strength === 'strong' ? 'Forte' :
                      passwordValidation.strength === 'medium' ? 'Média' :
                        'Fraca'}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${passwordValidation.strength === 'very-strong' ? 'bg-green-600' :
                      passwordValidation.strength === 'strong' ? 'bg-blue-600' :
                        passwordValidation.strength === 'medium' ? 'bg-yellow-600' :
                          'bg-red-600'
                    }`}
                  style={{ width: `${passwordValidation.score}%` }}
                />
              </div>
              {!passwordValidation.isValid && (
                <p className="text-xs text-red-600 mt-1">{passwordValidation.errors[0]}</p>
              )}
            </div>
          )}
        </div>

        {/* Checkbox Save Info */}
        <div className="flex items-center py-2">
          <label className="flex items-center cursor-pointer group">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={saveInfo}
                onChange={(e) => setSaveInfo(e.target.checked)}
              />
              <div className={`size-5 rounded-md border-2 ${saveInfo ? 'bg-primary border-primary' : 'border-slate-300 dark:border-slate-600'} transition-all flex items-center justify-center`}>
                {saveInfo && <span className="material-symbols-outlined text-white text-sm font-bold">check</span>}
              </div>
            </div>
            <span className="ml-3 text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
              Salvar minhas informações
            </span>
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <button
          type="submit"
          className={`w-full rounded-xl py-4 font-bold text-white shadow-lg transition-all active:scale-[0.98] ${theme === 'light' ? 'bg-highlight shadow-highlight/25 hover:bg-highlight/90' : 'bg-primary shadow-primary/25 hover:bg-primary/90'}`}
        >
          Cadastrar
        </button>
      </form>
    </div>
  );
};