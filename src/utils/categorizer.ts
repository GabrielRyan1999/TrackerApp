import type { Category } from '../types/budget';

export const DEFAULT_CATEGORIES: Category[] = [
  // --- NEEDS (50%) ---
  {
    id: 'housing',
    name: 'Housing (Rent / KPR)',
    bucket: 'needs',
    icon: '🏠',
    color: '#2563eb',
    keywords: ['kos', 'kost', 'kontrakan', 'sewa', 'cicilan rumah', 'kpr', 'iuran', 'ipl', 'rent', 'housing'],
    isDefault: true,
  },
  {
    id: 'groceries',
    name: 'Groceries (Daily Needs)',
    bucket: 'needs',
    icon: '🛒',
    color: '#0284c7',
    keywords: ['indomaret', 'alfamart', 'superindo', 'hypermart', 'pasar', 'sayur', 'belanja bulanan', 'sembako', 'groceries', 'mart'],
    isDefault: true,
  },
  {
    id: 'utilities',
    name: 'Utilities & Bills',
    bucket: 'needs',
    icon: '⚡',
    color: '#4f46e5',
    keywords: ['pln', 'listrik', 'token', 'pdam', 'air', 'indihome', 'wifi', 'telkomsel', 'xl', 'pulsa', 'paket data', 'gas', 'biznet', 'utilities', 'internet'],
    isDefault: true,
  },
  {
    id: 'transport',
    name: 'Transportation',
    bucket: 'needs',
    icon: '🚗',
    color: '#0891b2',
    keywords: ['bensin', 'pertamax', 'pertalite', 'tol', 'parkir', 'krl', 'mrt', 'transjakarta', 'gojek', 'grab', 'bluebird', 'servis motor', 'fuel', 'taxi'],
    isDefault: true,
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Medical',
    bucket: 'needs',
    icon: '💊',
    color: '#0d9488',
    keywords: ['apotek', 'kimia farma', 'dokter', 'rs', 'klinik', 'bpjs', 'obat', 'halodoc', 'hospital', 'pharmacy'],
    isDefault: true,
  },
  {
    id: 'insurance',
    name: 'Insurance & Min Debt',
    bucket: 'needs',
    icon: '🛡️',
    color: '#7c3aed',
    keywords: ['asuransi', 'premi', 'cicilan minimum', 'kartu kredit minimum', 'insurance'],
    isDefault: true,
  },
  {
    id: 'education',
    name: 'Education & Books',
    bucket: 'needs',
    icon: '🎓',
    color: '#1d4ed8',
    keywords: ['spp', 'kuliah', 'kursus', 'buku', 'udemy', 'coursera', 'school', 'tuition'],
    isDefault: true,
  },

  // --- WANTS (30%) ---
  {
    id: 'dining',
    name: 'Dining Out & Cafes',
    bucket: 'wants',
    icon: '🍔',
    color: '#db2777',
    keywords: ['gofood', 'grabfood', 'shopeefood', 'kfc', 'mcd', 'starbucks', 'kopi', 'restoran', 'warung', 'cafe', 'coffee', 'janji jiwa', 'mie gacoan', 'dining'],
    isDefault: true,
  },
  {
    id: 'shopping',
    name: 'Shopping & Fashion',
    bucket: 'wants',
    icon: '🛍️',
    color: '#e11d48',
    keywords: ['tokopedia', 'shopee', 'lazada', 'zalora', 'uniqlo', 'h&m', 'baju', 'sepatu', 'shopping', 'clothes'],
    isDefault: true,
  },
  {
    id: 'entertainment',
    name: 'Entertainment & Subs',
    bucket: 'wants',
    icon: '🎬',
    color: '#c026d3',
    keywords: ['netflix', 'spotify', 'disney', 'youtube premium', 'bioskop', 'cgv', 'xxi', 'game', 'steam', 'cinema'],
    isDefault: true,
  },
  {
    id: 'hobbies',
    name: 'Hobbies & Fitness',
    bucket: 'wants',
    icon: '🏋️',
    color: '#9333ea',
    keywords: ['gym', 'olahraga', 'alat musik', 'fotografi', 'fitness', 'workout'],
    isDefault: true,
  },
  {
    id: 'travel',
    name: 'Travel & Vacations',
    bucket: 'wants',
    icon: '✈️',
    color: '#be123c',
    keywords: ['traveloka', 'tiket.com', 'pesawat', 'hotel', 'agoda', 'kereta', 'liburan', 'flight', 'trip'],
    isDefault: true,
  },

  // --- SAVINGS (20%) ---
  {
    id: 'savings',
    name: 'Emergency Fund & Savings',
    bucket: 'savings',
    icon: '💰',
    color: '#059669',
    keywords: ['tabungan', 'deposito', 'dana darurat', 'transfer tabungan', 'seabank', 'jago', 'savings'],
    isDefault: true,
  },
  {
    id: 'investments',
    name: 'Investments (Stocks / Gold)',
    bucket: 'savings',
    icon: '📈',
    color: '#047857',
    keywords: ['reksadana', 'saham', 'bibit', 'bareksa', 'ajaib', 'emas', 'antam', 'crypto', 'pluang', 'stockbit', 'invest', 'stocks'],
    isDefault: true,
  },
  {
    id: 'extra_debt',
    name: 'Extra Debt Repayment',
    bucket: 'savings',
    icon: '💳',
    color: '#065f46',
    keywords: ['bayar utang', 'pelunasan', 'cicilan tambahan', 'debt payoff'],
    isDefault: true,
  },
];

export function categorize(
  description: string,
  categories: Category[],
  merchantMemory: Record<string, string> = {}
): string | null {
  const text = (description || '').toLowerCase().trim();
  if (!text) return null;

  if (merchantMemory[text]) {
    return merchantMemory[text];
  }

  for (const [merchant, catId] of Object.entries(merchantMemory)) {
    if (text.includes(merchant.toLowerCase())) {
      return catId;
    }
  }

  for (const cat of categories) {
    if (cat.keywords && cat.keywords.some((k) => text.includes(k.toLowerCase()))) {
      return cat.id;
    }
  }

  return null;
}
