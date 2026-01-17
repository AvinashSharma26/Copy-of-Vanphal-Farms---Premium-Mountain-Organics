
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Offer, SiteSettings } from '../types';
import { PRODUCTS as INITIAL_PRODUCTS, OFFERS as INITIAL_OFFERS } from '../constants';

const DEFAULT_CATEGORIES = ['Jams', 'Preserves', 'Chutneys', 'Seasonal', 'Organic'];
const DEFAULT_SETTINGS: SiteSettings = {
  heroImages: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2000']
};

interface DataContextType {
  products: Product[];
  offers: Offer[];
  categories: string[];
  settings: SiteSettings;
  addProduct: (p: Product) => void;
  updateProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  addCategory: (name: string) => void;
  updateCategory: (oldName: string, newName: string) => void;
  deleteCategory: (name: string) => void;
  addOffer: (o: Offer) => void;
  updateOffer: (o: Offer) => void;
  deleteOffer: (id: string) => void;
  toggleOffer: (id: string) => void;
  updateSettings: (s: SiteSettings) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('vanphal_admin_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [offers, setOffers] = useState<Offer[]>(() => {
    const saved = localStorage.getItem('vanphal_admin_offers');
    return saved ? JSON.parse(saved) : INITIAL_OFFERS;
  });

  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('vanphal_admin_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [settings, setSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem('vanphal_site_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('vanphal_admin_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('vanphal_admin_offers', JSON.stringify(offers));
  }, [offers]);

  useEffect(() => {
    localStorage.setItem('vanphal_admin_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('vanphal_site_settings', JSON.stringify(settings));
  }, [settings]);

  const addProduct = (p: Product) => setProducts(prev => [p, ...prev]);
  const updateProduct = (p: Product) => setProducts(prev => prev.map(item => item.id === p.id ? p : item));
  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addCategory = (name: string) => {
    const trimmed = name.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories(prev => [...prev, trimmed]);
    }
  };

  const updateCategory = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || oldName === trimmed) return;
    setCategories(prev => prev.map(c => c === oldName ? trimmed : c));
    setProducts(prev => prev.map(p => {
      if (p.categories?.includes(oldName)) {
        return {
          ...p,
          categories: p.categories.map(c => c === oldName ? trimmed : c)
        };
      }
      return p;
    }));
  };

  const deleteCategory = (name: string) => {
    setCategories(prev => prev.filter(c => c !== name));
    setProducts(prev => prev.map(p => ({
      ...p,
      categories: p.categories?.filter(c => c !== name) || []
    })));
  };

  const addOffer = (o: Offer) => setOffers(prev => [o, ...prev]);
  const updateOffer = (o: Offer) => setOffers(prev => prev.map(item => item.id === o.id ? o : item));
  const deleteOffer = (id: string) => {
    setOffers(prev => prev.filter(o => o.id !== id));
  };
  const toggleOffer = (id: string) => setOffers(prev => prev.map(o => o.id === id ? { ...o, isActive: !o.isActive } : o));

  const updateSettings = (s: SiteSettings) => setSettings(s);

  return (
    <DataContext.Provider value={{ 
      products, offers, categories, settings,
      addProduct, updateProduct, deleteProduct,
      addCategory, updateCategory, deleteCategory,
      addOffer, updateOffer, deleteOffer, toggleOffer,
      updateSettings
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
