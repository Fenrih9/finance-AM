import React, { useState, useRef } from 'react';
import { Screen } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useTheme } from '../ThemeContext';
import { useData } from '../DataContext';

interface ProfileProps {
  onBack: () => void;
}

const WALLPAPERS = [
  { id: 'abstract', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop', name: 'Abstract Blue' },
  { id: 'nebula', url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1000&auto=format&fit=crop', name: 'Dark Nebula' },
  { id: 'city', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1000&auto=format&fit=crop', name: 'City Lights' },
  { id: 'minimal', url: 'https://images.unsplash.com/photo-1550684847-75bdda21cc95?q=80&w=1000&auto=format&fit=crop', name: 'Geometry' },
  { id: 'nature', url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=1000&auto=format&fit=crop', name: 'Nature' },
];

export const ProfileScreen: React.FC<ProfileProps> = ({ onBack }) => {
  const { wallpaper, setWallpaper, isPrivacyMode, togglePrivacyMode, theme, toggleTheme } = useTheme();
  const { user, income, logout, categories, addCategory, deleteCategory } = useData();
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<'income' | 'expense'>('expense');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Empty contribution data since mocks are removed
  const contributionData = [
    { name: 'Empty', value: 100, color: theme === 'light' ? '#ffbbca' : '#e2e8f0' }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setWallpaper(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto w-full pb-20 font-lexend relative">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-4 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
        <button onClick={onBack} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-white">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-semibold tracking-tight">Meu Perfil</h1>
        <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-white">
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col gap-6 px-4 pb-24">
        {/* Profile Info */}
        <section className="flex flex-col items-center pt-2">
          <div className="relative group">
            {user.avatar ? (
              <div
                className="w-28 h-28 rounded-full bg-cover bg-center border-4 border-surface-light dark:border-surface-dark shadow-lg"
                style={{ backgroundImage: `url('${user.avatar}')` }}
              />
            ) : (
              <div className={`w-28 h-28 rounded-full border-4 border-surface-light dark:border-surface-dark shadow-lg flex items-center justify-center ${theme === 'light' ? 'bg-highlight/20' : 'bg-slate-200 dark:bg-slate-700'}`}>
                <span className={`material-symbols-outlined text-4xl ${theme === 'light' ? 'text-highlight' : 'text-slate-400'}`}>person</span>
              </div>
            )}
            <button
              onClick={() => setEditModalOpen(true)}
              className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors border-4 border-background-light dark:border-background-dark z-10"
            >
              <span className="material-symbols-outlined text-[18px] leading-none">edit</span>
            </button>
          </div>
          <div className="mt-4 text-center">
            <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'dark:text-white'}`}>{user.name}</h2>
            <p className={`text-sm mt-1 ${theme === 'light' ? 'text-highlight font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
              {user.email}
            </p>
          </div>
        </section>

        {/* Contribution Card */}
        <section className="w-full">
          <div className={`rounded-2xl p-5 shadow-sm backdrop-blur-sm transition-colors ${theme === 'light' ? 'bg-white border border-highlight/20' : 'bg-surface-light dark:bg-surface-dark bg-opacity-90 dark:bg-opacity-90'}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-base font-semibold ${theme === 'light' ? 'text-slate-800' : 'text-slate-800 dark:text-slate-100'}`}>
                Contribuição
              </h3>
              <button
                onClick={togglePrivacyMode}
                className={`${theme === 'light' ? 'text-highlight' : 'text-slate-400'} hover:text-primary transition-colors`}
              >
                <span className="material-symbols-outlined">
                  {isPrivacyMode ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-8">
              {/* Chart */}
              {/* Added flex-shrink-0 to prevent collapse */}
              <div className="relative w-32 h-32 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={contributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={64}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                      stroke="none"
                    >
                      {contributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs text-slate-400">Total</span>
                  <span className={`text-sm font-bold ${theme === 'light' ? 'text-slate-800' : 'text-slate-800 dark:text-white'}`}>
                    {isPrivacyMode ? '•••••' : `R$ ${income.toLocaleString('pt-BR')}`}
                  </span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex-1 w-full flex flex-col gap-4">
                <div className={`text-sm text-center ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
                  Sem dados suficientes para exibir gráfico de contribuição.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Settings Groups */}
        <section className="flex flex-col gap-3">
          <h4 className={`px-2 text-xs font-semibold uppercase tracking-wider ${theme === 'light' ? 'text-highlight' : 'text-slate-500 dark:text-slate-400'}`}>Configurações</h4>
          <div className="bg-surface-light dark:bg-surface-dark rounded-2xl overflow-hidden shadow-sm bg-opacity-90 dark:bg-opacity-90 backdrop-blur-sm">

            {/* Theme Toggle Row */}
            <div className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group border-b border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${theme === 'light' ? 'bg-highlight/20 text-highlight' : 'bg-yellow-500/10 text-yellow-500'}`}>
                  <span className="material-symbols-outlined">{theme === 'dark' ? 'dark_mode' : 'light_mode'}</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-800 dark:text-white">Modo Escuro</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Alternar aparência</p>
                </div>
              </div>

              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${theme === 'dark' ? 'bg-primary' : 'bg-slate-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group border-b border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-800 dark:text-white">Dados Pessoais</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Nome, email, telefone</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400">chevron_right</span>
            </button>



            <button
              onClick={() => setCategoryModalOpen(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group border-b border-slate-100 dark:border-slate-700/50"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                  <span className="material-symbols-outlined">category</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-800 dark:text-white">Categorias</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Gerenciar categorias</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400">chevron_right</span>
            </button>

            <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group border-b border-slate-100 dark:border-slate-700/50 last:border-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all">
                  <span className="material-symbols-outlined">lock</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-800 dark:text-white">Segurança</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Senha, FaceID</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400">chevron_right</span>
            </button>

            <button
              onClick={async () => {
                try {
                  await logout();
                  // Navigation is handled by auth state change usually, or we can force it if needed
                } catch (error) {
                  console.error("Logout failed", error);
                }
              }}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group border-b border-slate-100 dark:border-slate-700/50 last:border-0"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all">
                  <span className="material-symbols-outlined">logout</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-800 dark:text-white">Sair</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Encerrar sessão</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400">chevron_right</span>
            </button>
          </div>
        </section>

        <div className="w-full py-2 text-center opacity-70">
          <p className="text-[10px] text-slate-400 dark:text-slate-600 font-medium">Fenrih MetaDev - Versão 2.7</p>
        </div>
      </main>

      {/* Edit Modal */}
      {
        isEditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-white dark:bg-[#1a2632] rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-5 duration-300 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Personalizar</h2>
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Foto de Perfil</h3>
                <div className="flex gap-4">
                  <button className="flex-1 bg-primary text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-primary/30 active:scale-95 transition-transform flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">upload</span>
                    Alterar Foto
                  </button>
                  <button className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 hover:text-danger hover:bg-danger/10 transition-colors">
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Papel de Parede</h3>
                  {wallpaper && (
                    <button onClick={() => setWallpaper(null)} className="text-xs text-danger font-bold hover:underline">
                      Remover
                    </button>
                  )}
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />

                <div className="grid grid-cols-3 gap-2">
                  {/* Upload Button */}
                  <button
                    onClick={triggerFileUpload}
                    className="aspect-[3/4] rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center gap-1 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
                  >
                    <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 group-hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">add_photo_alternate</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Galeria</span>
                  </button>

                  {WALLPAPERS.map((wp) => (
                    <button
                      key={wp.id}
                      onClick={() => setWallpaper(wp.url)}
                      className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${wallpaper === wp.url ? 'border-primary ring-2 ring-primary/30 scale-95' : 'border-transparent hover:scale-105'
                        }`}
                    >
                      <img src={wp.url} alt={wp.name} className="w-full h-full object-cover" />
                      {wallpaper === wp.url && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="bg-white rounded-full p-0.5">
                            <span className="material-symbols-outlined text-primary text-sm font-bold">check</span>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      }
      {/* Category Modal */}
      {
        isCategoryModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-white dark:bg-[#1a2632] rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-5 duration-300 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Gerenciar Categorias</h2>
                <button onClick={() => setCategoryModalOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <span className="material-symbols-outlined text-slate-500">close</span>
                </button>
              </div>

              {/* Add New */}
              <div className="flex flex-col gap-3 mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                <h3 className="text-xs font-bold uppercase text-slate-400">Nova Categoria</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNewCategoryType('expense')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${newCategoryType === 'expense' ? 'bg-red-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}
                  >
                    Despesa
                  </button>
                  <button
                    onClick={() => setNewCategoryType('income')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${newCategoryType === 'income' ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}
                  >
                    Receita
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                    placeholder="Nome da categoria"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                  <button
                    onClick={() => {
                      if (newCategoryName.trim()) {
                        addCategory({ name: newCategoryName, type: newCategoryType });
                        setNewCategoryName('');
                      }
                    }}
                    className="bg-primary text-white p-2 rounded-lg flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-xl">add</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-1">
                <h3 className="text-xs font-bold uppercase text-slate-400 mb-2">Suas Categorias</h3>
                <div className="flex flex-col gap-2">
                  {categories.length === 0 ? (
                    <div className="text-center text-slate-400 text-sm py-4">Nenhuma categoria cadastrada.</div>
                  ) : (
                    categories.map(cat => (
                      <div key={cat.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-700/50">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-8 rounded-full ${cat.type === 'expense' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{cat.name}</span>
                        </div>
                        <button
                          onClick={() => deleteCategory(cat.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};