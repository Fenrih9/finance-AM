import React, { useState } from 'react';
import { Screen } from '../types';
import { BarChart, Bar, ResponsiveContainer, Cell, PieChart, Pie, Tooltip } from 'recharts';
import { useData } from '../DataContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AnalyticsProps {
  onBack: () => void;
}

export const AnalyticsScreen: React.FC<AnalyticsProps> = ({ onBack }) => {
  const { income, expense, transactions, deleteTransaction } = useData();
  const [timeFilter, setTimeFilter] = useState<'6months' | 'year'>('6months');

  // --- Processamento de Dados para Fluxo de Caixa (Dinâmico) ---
  const processCashFlow = () => {
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const today = new Date();
    const currentMonthIndex = today.getMonth();

    // Inicializa estrutura para os 12 meses (Jan-Dez)
    const monthlyStats = monthNames.map(name => ({ name, income: 0, expense: 0 }));

    // Agrega valores das transações
    transactions.forEach(t => {
      const d = new Date(t.date);
      const mIndex = d.getMonth();
      // Simples verificação de ano (ignora anos passados para simplificar a demo, ou assume ano corrente)
      if (t.type === 'income') {
        monthlyStats[mIndex].income += t.amount;
      } else {
        monthlyStats[mIndex].expense += t.amount;
      }
    });

    if (timeFilter === 'year') {
      // Retorna todos os meses de Jan a Dez
      return monthlyStats;
    } else {
      // Pega os últimos 6 meses terminando no mês atual (Rolling Window)
      const last6MonthsData = [];
      for (let i = 5; i >= 0; i--) {
        let index = currentMonthIndex - i;
        // Lógica circular para pegar meses do ano anterior se necessário (ex: Jan volta para Dez)
        if (index < 0) index += 12;
        last6MonthsData.push(monthlyStats[index]);
      }
      return last6MonthsData;
    }
  };

  const cashFlowData = processCashFlow();

  // --- Processamento de Dados por Categoria ---
  const processCategories = () => {
    const categoryMap: Record<string, number> = {};

    // Filtra apenas despesas e soma por categoria
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const catName = t.category || 'Geral';
        categoryMap[catName] = (categoryMap[catName] || 0) + t.amount;
      });

    const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#1d4ed8', '#8b5cf6', '#ec4899', '#6366f1'];

    let data = Object.keys(categoryMap).map((cat, index) => ({
      name: cat,
      value: categoryMap[cat],
      color: COLORS[index % COLORS.length]
    }));

    // Ordena por valor decrescente
    data.sort((a, b) => b.value - a.value);

    if (data.length === 0) {
      return [{ name: 'Sem dados', value: 100, color: '#e2e8f0' }];
    }
    return data;
  };

  const categoryData = processCategories();

  const formatMoney = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteTransaction(id);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.text('Relatório Financeiro', 14, 22);

    // Period
    doc.setFontSize(10);
    doc.text(`Período: ${timeFilter === '6months' ? 'Últimos 6 Meses' : 'Ano Atual'}`, 14, 30);
    doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 14, 35);

    // Summary
    doc.setFillColor(240, 240, 240);
    doc.rect(14, 40, 180, 25, 'F');
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Resumo do Período', 19, 50);

    doc.setFontSize(10);
    doc.text(`Receitas: ${formatMoney(income)}`, 19, 58);
    doc.text(`Despesas: ${formatMoney(expense)}`, 80, 58);
    doc.text(`Balanço: ${formatMoney(income - expense)}`, 140, 58);

    // Transactions Table
    const tableData = transactions.map(t => [
      new Date(t.date).toLocaleDateString('pt-BR'),
      t.description,
      t.category || 'Geral',
      t.type === 'income' ? 'Receita' : 'Despesa',
      formatMoney(t.amount)
    ]);

    autoTable(doc, {
      head: [['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor']],
      body: tableData,
      startY: 75,
      theme: 'grid',
      headStyles: { fillColor: [25, 127, 230] }, // Primary blue color
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 25 },
        4: { halign: 'right' }
      }
    });

    doc.save('relatorio-financeiro.pdf');
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto w-full pb-20">
      <div className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5 px-4 py-3 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center justify-center p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined text-gray-900 dark:text-white">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Análises</h1>
        <button onClick={handleExportPDF} className="flex items-center justify-center p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined text-petrol">download</span>
        </button>
      </div>

      <main className="flex-1 flex flex-col gap-6 p-4 pb-24 overflow-x-hidden">
        {/* Filters */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 px-1">
          <button
            onClick={() => setTimeFilter('6months')}
            className={`flex h-10 shrink-0 items-center justify-center rounded-full px-6 transition-all active:scale-95 ${timeFilter === '6months' ? 'bg-petrol shadow-lg shadow-petrol/20' : 'bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/5 hover:border-petrol/50'}`}
          >
            <p className={`text-sm font-bold leading-normal ${timeFilter === '6months' ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>Últimos 6 Meses</p>
          </button>
          <button
            onClick={() => setTimeFilter('year')}
            className={`flex h-10 shrink-0 items-center justify-center rounded-full px-6 transition-all active:scale-95 ${timeFilter === 'year' ? 'bg-petrol shadow-lg shadow-petrol/20' : 'bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/5 hover:border-petrol/50'}`}
          >
            <p className={`text-sm font-bold leading-normal ${timeFilter === 'year' ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>Ano</p>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-3xl bg-white dark:bg-surface-dark p-5 shadow-soft border border-gray-100 dark:border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full -mr-4 -mt-4 group-hover:bg-primary/10 transition-colors"></div>
            <div className="flex items-center gap-2 mb-3 relative z-10">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-lg">trending_up</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Receitas</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white relative z-10">{formatMoney(income)}</p>
          </div>
          <div className="rounded-3xl bg-white dark:bg-surface-dark p-5 shadow-soft border border-gray-100 dark:border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-secondary/5 rounded-bl-full -mr-4 -mt-4 group-hover:bg-secondary/10 transition-colors"></div>
            <div className="flex items-center gap-2 mb-3 relative z-10">
              <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-lg">trending_down</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Despesas</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white relative z-10">{formatMoney(expense)}</p>
          </div>
        </div>

        {/* Cash Flow Chart */}
        <div className="rounded-3xl bg-white dark:bg-surface-dark p-6 shadow-soft border border-gray-100 dark:border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Fluxo de Caixa</h3>
          </div>
          {/* ADDED min-w-0 */}
          <div className="h-56 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowData} barSize={12} barGap={4}>
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ fontSize: '12px' }}
                  formatter={(value: number) => [formatMoney(value), '']}
                />
                <Bar dataKey="income" name="Receita" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                <Bar dataKey="expense" name="Despesa" stackId="b" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex justify-between px-2 mt-2">
              {cashFlowData.map((d, i) => (
                <span key={i} className="text-[10px] font-semibold text-gray-400 w-full text-center">{d.name}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Expenses by Category */}
        <div className="rounded-3xl bg-white dark:bg-surface-dark p-6 shadow-soft border border-gray-100 dark:border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Gastos por Categoria</h3>
          </div>

          <div className="flex flex-col items-center">
            {/* ADDED min-w-0 to prevent 0 width error */}
            <div className="relative w-64 h-64 mb-6 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatMoney(value)}
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-sm font-medium text-gray-400">Total Gasto</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatMoney(expense)}
                </span>
              </div>
            </div>

            {/* Legend for Categories */}
            <div className="flex flex-wrap justify-center gap-3 w-full">
              {categoryData.slice(0, 4).map((cat, idx) => (
                cat.name !== 'Sem dados' && (
                  <div key={idx} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{cat.name}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>

        {/* Detailed History */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Histórico Detalhado</h3>
          </div>
          <div className="flex flex-col gap-3">
            {transactions.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-sm">Nenhum registro encontrado.</div>
            ) : (
              transactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 shadow-sm group">
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-2xl ${t.type === 'expense' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'}`}>
                      <span className="material-symbols-outlined">{t.type === 'expense' ? 'shopping_cart' : 'work'}</span>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{t.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className={`text-sm font-bold ${t.type === 'expense' ? 'text-secondary' : 'text-primary'}`}>
                      {t.type === 'expense' ? '-' : '+'} {formatMoney(t.amount)}
                    </p>
                    <button
                      onClick={(e) => handleDelete(e, t.id)}
                      className="flex items-center justify-center p-2 rounded-full text-slate-400 hover:bg-danger/10 hover:text-danger transition-colors z-10"
                      title="Apagar lançamento"
                    >
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Signature */}
        <div className="w-full py-4 text-center opacity-70">
          <p className="text-[10px] text-slate-400 dark:text-slate-600 font-medium">Fenrih MetaDev - Versão 2.7</p>
        </div>
      </main>
    </div>
  );
};