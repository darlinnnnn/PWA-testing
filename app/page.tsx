'use client'

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Plus, TrendingUp, TrendingDown, DollarSign, Wallet, PiggyBank, CreditCard, X, Calendar, Tag, 
  ArrowLeft, Menu, MoreVertical, Edit, Trash2, Gift, Utensils, Car, ShoppingBag, FileText, 
  Music, Heart, BookOpen, Settings, Target, ChevronDown, ChevronUp, Check
} from 'lucide-react';

interface Transaction {
  id: number;
  created_at: string;
  nomor_flo: string;
  deskripsi: string;
  kategori: string;
}

interface Category {
  id: number;
  nama: string;
  tipe: 'pemasukan' | 'pengeluaran';
  icon: string;
  warna: string;
}

interface Budget {
  id: number;
  bulan: number;
  tahun: number;
  jumlah: number;
  kategori_id: number;
  kategori?: Category;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const iconMap: { [key: string]: any } = {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  Gift,
  Utensils,
  Car,
  ShoppingBag,
  FileText,
  Music,
  Heart,
  BookOpen
};

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState({
    nomor_flo: '',
    deskripsi: '',
    kategori: ''
  });
  const [categoryFormData, setCategoryFormData] = useState({
    nama: '',
    tipe: 'pengeluaran' as 'pemasukan' | 'pengeluaran',
    icon: 'DollarSign',
    warna: '#6B7280'
  });
  const [budgetFormData, setBudgetFormData] = useState({
    jumlah: '',
    kategori_id: ''
  });

  // Calculate totals
  const totalPemasukan = transactions
    .filter(t => t.kategori.toLowerCase().includes('pemasukan'))
    .reduce((sum, t) => {
      const amount = parseFloat(t.nomor_flo.replace(/[^\d.-]/g, '')) || 0;
      return sum + amount;
    }, 0);

  const totalPengeluaran = transactions
    .filter(t => t.kategori.toLowerCase().includes('pengeluaran'))
    .reduce((sum, t) => {
      const amount = parseFloat(t.nomor_flo.replace(/[^\d.-]/g, '')) || 0;
      return sum + amount;
    }, 0);

  const balance = totalPemasukan - totalPengeluaran;

  // Get current month and year
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Calculate budget progress
  const currentMonthBudget = budgets.filter(b => b.bulan === currentMonth && b.tahun === currentYear);
  const totalBudget = currentMonthBudget.reduce((sum, b) => sum + b.jumlah, 0);
  const budgetProgress = totalPengeluaran > 0 ? Math.min((totalPengeluaran / totalBudget) * 100, 100) : 0;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchTransactions(),
        fetchCategories(),
        fetchBudgets()
      ]);
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('transaksi')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setTransactions(data || []);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('kategori')
      .select('*')
      .order('nama');

    if (error) throw error;
    setCategories(data || []);
  };

  const fetchBudgets = async () => {
    const { data, error } = await supabase
      .from('budget')
      .select(`
        *,
        kategori:kategori_id(id, nama, tipe, icon, warna)
      `)
      .eq('bulan', currentMonth)
      .eq('tahun', currentYear);

    if (error) throw error;
    setBudgets(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nomor_flo.trim() || !formData.deskripsi.trim() || !formData.kategori.trim()) return;

    try {
      // Parse the formatted number back to numeric string
      const numericAmount = parseIndonesianNumber(formData.nomor_flo);
      
      // Validate that we have a valid number
      if (!numericAmount || isNaN(Number(numericAmount))) {
        alert('Please enter a valid amount');
        return;
      }
      
      const { error } = await supabase
        .from('transaksi')
        .insert([{
          ...formData,
          nomor_flo: numericAmount
        }]);

      if (error) throw error;

      setFormData({ nomor_flo: '', deskripsi: '', kategori: '' });
      setShowForm(false);
      await fetchTransactions();

      // Show success notification
      if ('serviceWorker' in navigator && 'Notification' in window && Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification('Transaction Added', {
            body: `New transaction "${numericAmount}" has been added successfully!`,
            icon: '/icon-192x192.svg',
            badge: '/icon-192x192.svg',
            tag: 'transaction-added',
            requireInteraction: false
          });
        });
      }
    } catch (error) {
      console.error('❌ Error adding transaction:', error);
      alert('Error adding transaction');
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormData.nama.trim()) return;

    try {
      const { error } = await supabase
        .from('kategori')
        .insert([categoryFormData]);

      if (error) throw error;

      setCategoryFormData({ nama: '', tipe: 'pengeluaran', icon: 'DollarSign', warna: '#6B7280' });
      setShowCategoryForm(false);
      await fetchCategories();
    } catch (error) {
      console.error('❌ Error adding category:', error);
      alert('Error adding category');
    }
  };

  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetFormData.jumlah || !budgetFormData.kategori_id) return;

    try {
      // Parse the formatted number back to numeric string
      const numericAmount = parseIndonesianNumber(budgetFormData.jumlah);
      
      // Validate that we have a valid number
      if (!numericAmount || isNaN(Number(numericAmount))) {
        alert('Please enter a valid budget amount');
        return;
      }

      const { error } = await supabase
        .from('budget')
        .insert([{
          bulan: currentMonth,
          tahun: currentYear,
          jumlah: Number(numericAmount),
          kategori_id: parseInt(budgetFormData.kategori_id)
        }]);

      if (error) throw error;

      setBudgetFormData({ jumlah: '', kategori_id: '' });
      setShowBudgetForm(false);
      await fetchBudgets();
    } catch (error) {
      console.error('❌ Error adding budget:', error);
      alert('Error adding budget');
    }
  };

  const handleUpdateTransaction = async (transaction: Transaction) => {
    try {
      const { error } = await supabase
        .from('transaksi')
        .update({ kategori: transaction.kategori })
        .eq('id', transaction.id);

      if (error) throw error;

      setEditingTransaction(null);
      await fetchTransactions();
    } catch (error) {
      console.error('❌ Error updating transaction:', error);
      alert('Error updating transaction');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format number to Indonesian format (2.000)
  const formatToIndonesianNumber = (value: string) => {
    // Remove all non-digit characters
    const numericValue = value.replace(/\D/g, '');
    
    if (numericValue === '') return '';
    
    // Format with dots manually for large numbers
    let formatted = '';
    for (let i = numericValue.length - 1, j = 0; i >= 0; i--, j++) {
      if (j > 0 && j % 3 === 0) {
        formatted = '.' + formatted;
      }
      formatted = numericValue[i] + formatted;
    }
    
    return formatted;
  };

  // Parse Indonesian formatted number back to numeric string
  const parseIndonesianNumber = (value: string) => {
    return value.replace(/\./g, '');
  };

  const getKategoriIcon = (kategori: string) => {
    if (kategori.toLowerCase().includes('pemasukan')) {
      return <TrendingUp className="h-5 w-5 text-green-400" />;
    } else if (kategori.toLowerCase().includes('pengeluaran')) {
      return <TrendingDown className="h-5 w-5 text-red-400" />;
    }
    return <DollarSign className="h-5 w-5 text-blue-400" />;
  };

  const getKategoriColor = (kategori: string) => {
    if (kategori.toLowerCase().includes('pemasukan')) {
      return 'text-green-400 bg-green-900/20 border-green-800/30';
    } else if (kategori.toLowerCase().includes('pengeluaran')) {
      return 'text-red-400 bg-red-900/20 border-red-800/30';
    }
    return 'text-blue-400 bg-blue-900/20 border-blue-800/30';
  };

  const getTransactionIcon = (kategori: string) => {
    if (kategori.toLowerCase().includes('pemasukan')) {
      return <TrendingUp className="h-6 w-6 text-green-400" />;
    } else if (kategori.toLowerCase().includes('pengeluaran')) {
      return <TrendingDown className="h-6 w-6 text-red-400" />;
    }
    return <DollarSign className="h-6 w-6 text-blue-400" />;
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = iconMap[iconName] || DollarSign;
    return <IconComponent className="h-5 w-5" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-1/3 mb-6"></div>
            <div className="h-32 bg-gray-800 rounded-lg mb-6"></div>
            <div className="space-y-3">
              <div className="h-16 bg-gray-800 rounded-lg"></div>
              <div className="h-16 bg-gray-800 rounded-lg"></div>
              <div className="h-16 bg-gray-800 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-400 mb-2">Error Loading Data</h2>
            <p className="text-red-300 mb-4">{error}</p>
            <button
              onClick={fetchData}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors">
                <ArrowLeft className="h-5 w-5 text-gray-300" />
              </button>
              <h1 className="text-lg font-semibold text-white">Money Tracker</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setShowBudgetForm(true)}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                title="Add Budget"
              >
                <Target className="h-5 w-5 text-gray-300" />
              </button>
              <button 
                onClick={() => setShowCategoryForm(true)}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                title="Add Category"
              >
                <Settings className="h-5 w-5 text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        {/* Fixed Balance Card */}
        <div className="px-4 py-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Balance</p>
                <p className={`text-3xl font-bold ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(balance)}
                </p>
              </div>
              <div className="p-3 bg-gray-700/50 rounded-full">
                <Wallet className="h-8 w-8 text-gray-300" />
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Income</span>
                <span>Expenses</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${totalPemasukan > 0 ? (totalPemasukan / (totalPemasukan + totalPengeluaran)) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Income & Expenses */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-900/20 border border-green-800/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Income</p>
                    <p className="text-green-400 text-lg font-bold">
                      {formatCurrency(totalPemasukan)}
                    </p>
                  </div>
                  <div className="p-2 bg-green-900/30 rounded-full">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Expenses</p>
                    <p className="text-red-400 text-lg font-bold">
                      {formatCurrency(totalPengeluaran)}
                    </p>
                  </div>
                  <div className="p-2 bg-red-900/30 rounded-full">
                    <TrendingDown className="h-5 w-5 text-red-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Budget Progress */}
            {totalBudget > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-700/50">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Budget Progress</span>
                  <span>{formatCurrency(totalBudget)}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      budgetProgress > 90 ? 'bg-red-500' : budgetProgress > 75 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${budgetProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {formatCurrency(totalPengeluaran)} / {formatCurrency(totalBudget)} ({budgetProgress.toFixed(1)}%)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Transactions */}
        <div className="px-4 pb-20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
            <button className="text-gray-400 hover:text-white">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 text-center border border-gray-700/50">
              <div className="p-4 bg-gray-700/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Wallet className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-400 text-sm">No transactions yet</p>
              <p className="text-gray-500 text-xs mt-1">Add your first transaction</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {transactions.map((transaction) => {
                const amount = parseFloat(transaction.nomor_flo.replace(/[^\d.-]/g, '')) || 0;
                const isIncome = transaction.kategori.toLowerCase().includes('pemasukan');

                return (
                  <div key={transaction.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${isIncome ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                          {getTransactionIcon(transaction.kategori)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-white">{transaction.deskripsi}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-400">
                              {new Date(transaction.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short'
                              })}
                            </span>
                            {editingTransaction?.id === transaction.id ? (
                              <select
                                value={editingTransaction.kategori}
                                onChange={(e) => setEditingTransaction({
                                  ...editingTransaction,
                                  kategori: e.target.value
                                })}
                                className="text-xs bg-gray-700/50 border border-gray-600 rounded px-2 py-1 text-white"
                              >
                                {categories.map(cat => (
                                  <option key={cat.id} value={cat.nama}>
                                    {cat.nama}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getKategoriColor(transaction.kategori)}`}>
                                <Tag className="h-3 w-3 mr-1" />
                                {transaction.kategori}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <p className={`font-bold ${isIncome ? 'text-green-400' : 'text-red-400'}`}>
                            {isIncome ? '+' : '-'}{formatCurrency(amount)}
                          </p>
                        </div>
                        {editingTransaction?.id === transaction.id ? (
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleUpdateTransaction(editingTransaction)}
                              className="p-1 bg-green-600 rounded hover:bg-green-700"
                            >
                              <Check className="h-3 w-3 text-white" />
                            </button>
                            <button
                              onClick={() => setEditingTransaction(null)}
                              className="p-1 bg-gray-600 rounded hover:bg-gray-700"
                            >
                              <X className="h-3 w-3 text-white" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingTransaction(transaction)}
                            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 z-50"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Transaction Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center z-50">
          <div className="bg-gray-800 rounded-t-2xl w-full max-w-md p-6 pb-8 border-t border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Add Transaction</h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-gray-700/50 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="nomor_flo" className="block text-sm font-medium text-gray-300 mb-2">
                  Amount (IDR)
                </label>
                <input
                  type="number"
                  id="nomor_flo"
                  value={formData.nomor_flo}
                  onChange={(e) => setFormData({ ...formData, nomor_flo: formatToIndonesianNumber(e.target.value) })}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div>
                <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  id="deskripsi"
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  placeholder="Enter description"
                  required
                />
              </div>

              <div>
                <label htmlFor="kategori" className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  id="kategori"
                  value={formData.kategori}
                  onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.nama}>
                      {cat.nama}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Transaction
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal Form */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center z-50">
          <div className="bg-gray-800 rounded-t-2xl w-full max-w-md p-6 pb-8 border-t border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Add Category</h2>
              <button
                onClick={() => setShowCategoryForm(false)}
                className="p-2 hover:bg-gray-700/50 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label htmlFor="nama" className="block text-sm font-medium text-gray-300 mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  id="nama"
                  value={categoryFormData.nama}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, nama: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  placeholder="Enter category name"
                  required
                />
              </div>

              <div>
                <label htmlFor="tipe" className="block text-sm font-medium text-gray-300 mb-2">
                  Type
                </label>
                <select
                  id="tipe"
                  value={categoryFormData.tipe}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, tipe: e.target.value as 'pemasukan' | 'pengeluaran' })}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  required
                >
                  <option value="pemasukan">Income</option>
                  <option value="pengeluaran">Expense</option>
                </select>
              </div>

              <div>
                <label htmlFor="icon" className="block text-sm font-medium text-gray-300 mb-2">
                  Icon
                </label>
                <select
                  id="icon"
                  value={categoryFormData.icon}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, icon: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  required
                >
                  <option value="DollarSign">Dollar Sign</option>
                  <option value="TrendingUp">Trending Up</option>
                  <option value="TrendingDown">Trending Down</option>
                  <option value="Gift">Gift</option>
                  <option value="Utensils">Utensils</option>
                  <option value="Car">Car</option>
                  <option value="ShoppingBag">Shopping Bag</option>
                  <option value="FileText">File Text</option>
                  <option value="Music">Music</option>
                  <option value="Heart">Heart</option>
                  <option value="BookOpen">Book Open</option>
                </select>
              </div>

              <div>
                <label htmlFor="warna" className="block text-sm font-medium text-gray-300 mb-2">
                  Color
                </label>
                <input
                  type="color"
                  id="warna"
                  value={categoryFormData.warna}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, warna: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Category
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Budget Modal Form */}
      {showBudgetForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center z-50">
          <div className="bg-gray-800 rounded-t-2xl w-full max-w-md p-6 pb-8 border-t border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Add Budget</h2>
              <button
                onClick={() => setShowBudgetForm(false)}
                className="p-2 hover:bg-gray-700/50 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleBudgetSubmit} className="space-y-4">
              <div>
                <label htmlFor="jumlah" className="block text-sm font-medium text-gray-300 mb-2">
                  Budget Amount (IDR)
                </label>
                <input
                  type="number"
                  id="jumlah"
                  value={budgetFormData.jumlah}
                  onChange={(e) => setBudgetFormData({ ...budgetFormData, jumlah: formatToIndonesianNumber(e.target.value) })}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  placeholder="Enter budget amount"
                  required
                />
              </div>

              <div>
                <label htmlFor="kategori_id" className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  id="kategori_id"
                  value={budgetFormData.kategori_id}
                  onChange={(e) => setBudgetFormData({ ...budgetFormData, kategori_id: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  required
                >
                  <option value="">Select category</option>
                  {categories.filter(cat => cat.tipe === 'pengeluaran').map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nama}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center"
              >
                <Target className="h-5 w-5 mr-2" />
                Add Budget
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 