
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTickets } from '../context/TicketContext';
import { useData } from '../context/DataContext';
import { ICONS } from '../constants';
import { Product, Order, Offer, User, Ticket, SiteSettings } from '../types';

const AdminDashboard: React.FC = () => {
  const { isAdmin, allUsers, deleteUser, toggleBlockUser } = useAuth();
  const { tickets, closeTicket, addReply, markAsRead } = useTickets();
  const { 
    products, offers, categories: allCategories, settings,
    addProduct, updateProduct, deleteProduct,
    addCategory, updateCategory, deleteCategory,
    addOffer, updateOffer, deleteOffer, toggleOffer, updateSettings
  } = useData();
  
  const [activeTab, setActiveTab] = useState<'analytics' | 'inventory' | 'orders' | 'tickets' | 'customers' | 'offers' | 'settings'>('analytics');
  
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('vanphal_admin_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [isEditing, setIsEditing] = useState<Product | null>(null);
  const [isEditingOffer, setIsEditingOffer] = useState<Offer | null>(null);
  const [isEditingOrder, setIsEditingOrder] = useState<Order | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState('');
  
  const [mainImageBase64, setMainImageBase64] = useState<string>('');
  const [galleryImagesBase64, setGalleryImagesBase64] = useState<string[]>([]);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  
  // Settings tab local state
  const [tempHeroImages, setTempHeroImages] = useState<string[]>(settings.heroImages);

  const hasUnreadTickets = tickets.some(t => t.unreadAdmin);

  useEffect(() => {
    localStorage.setItem('vanphal_admin_orders', JSON.stringify(orders));
  }, [orders]);

  const stats = useMemo(() => {
    const validOrders = orders || [];
    const totalRevenue = validOrders.reduce((acc, curr) => acc + (curr.status !== 'cancelled' ? curr.total : 0), 0);
    const totalOrders = validOrders.length;
    const returnedOrders = validOrders.filter(o => o.status === 'cancelled').length;
    const avgOrderValue = totalOrders > 0 ? (totalRevenue / (totalOrders - returnedOrders || 1)) : 0;
    const returnRate = totalOrders > 0 ? (returnedOrders / totalOrders) * 100 : 0;

    const monthlyData: Record<string, number> = {};
    validOrders.forEach(o => {
      const dateStr = o.date ? String(o.date) : '01 Jan 2000';
      const parts = dateStr.split(' ');
      const month = parts.length > 1 ? parts[1] : 'Recent';
      monthlyData[month] = (monthlyData[month] || 0) + o.total;
    });

    return { totalRevenue, totalOrders, returnedOrders, avgOrderValue, returnRate, monthlyData };
  }, [orders]);

  if (!isAdmin) {
    return <div className="pt-40 text-center serif italic text-2xl">Access Denied. Staff only.</div>;
  }

  const processImageFile = (file: File, maxWidth: number = 800): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleMainImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessingImage(true);
      try {
        const base64 = await processImageFile(file);
        setMainImageBase64(base64);
      } catch (err) {
        console.error("Image processing failed:", err);
      } finally {
        setIsProcessingImage(false);
      }
    }
  };

  const handleSaveProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const stockCount = Number(formData.get('stock'));
    const selectedCats = allCategories.filter(cat => formData.get(`cat-${cat}`) === 'on');
    const productData: Product = {
      id: (formData.get('sku') as string) || isEditing?.id || `VP-${Math.floor(Math.random() * 900) + 100}`,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: Number(formData.get('price')),
      weight: (formData.get('weight') as string) || '450g',
      discountPercentage: Number(formData.get('discount')),
      image: mainImageBase64 || isEditing?.image || '',
      images: galleryImagesBase64,
      categories: selectedCats.length > 0 ? selectedCats : (isEditing?.categories || []),
      stock: stockCount,
      status: stockCount > 0 ? 'in-stock' : 'out-of-stock',
      ingredients: (formData.get('ingredients') as string || '').split(',').map(s => s.trim()).filter(s => s !== ''),
      nutrition: isEditing?.nutrition || { calories: '45 kcal', fat: '0g', sugar: '11g', protein: '0g' },
      tags: isEditing?.tags || ['Artisanal'],
    };
    if (isEditing) updateProduct(isEditing.id, productData);
    else addProduct(productData);
    setShowProductModal(false);
    setIsEditing(null);
    setMainImageBase64('');
    setGalleryImagesBase64([]);
  };

  const handleDuplicateProduct = (p: Product) => {
    const newId = `${p.id}-COPY-${Math.floor(Math.random() * 999)}`;
    const duplicatedProduct: Product = { ...p, id: newId, name: `${p.name} (Copy)` };
    addProduct(duplicatedProduct);
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessingImage(true);
      try {
        const base64 = await processImageFile(file, 2000);
        setTempHeroImages(prev => [...prev, base64]);
      } catch (err) {
        console.error("Hero upload failed", err);
      } finally {
        setIsProcessingImage(false);
      }
    }
  };

  const saveSettings = () => {
    if (tempHeroImages.length === 0) {
      alert("Please provide at least one hero background image.");
      return;
    }
    updateSettings({ heroImages: tempHeroImages });
    alert("Home settings saved successfully! 🏔️");
  };

  return (
    <div className="pt-24 pb-24 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-8">
          <div>
            <h1 className="text-5xl font-bold serif mb-3 text-[#2d3a3a]">Admin Control</h1>
            <p className="text-gray-400 font-medium uppercase tracking-[0.2em] text-[10px]">Vanphal Marketplace Logistics</p>
          </div>
          <div className="flex flex-wrap bg-white/50 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-gray-100 scroll-hide overflow-x-auto w-full lg:w-auto">
            {[
              { id: 'analytics', label: 'Analytics' },
              { id: 'inventory', label: 'Inventory' },
              { id: 'orders', label: 'Orders' },
              { id: 'tickets', label: 'Tickets', alert: hasUnreadTickets },
              { id: 'customers', label: 'Customers' },
              { id: 'offers', label: 'Offers' },
              { id: 'settings', label: 'Home Settings' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === tab.id ? 'bg-[#4a5d4e] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {tab.label}
                {tab.alert && <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-fadeIn">
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
              <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-4">Total Earnings</p>
              <h3 className="text-4xl font-bold serif text-[#4a5d4e]">₹{stats.totalRevenue.toLocaleString()}</h3>
            </div>
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
              <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-4">Orders Placed</p>
              <h3 className="text-4xl font-bold serif text-[#2d3a3a]">{stats.totalOrders}</h3>
            </div>
            {/* Additional stats... */}
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden animate-fadeIn">
            <div className="p-10 flex justify-between items-center border-b border-gray-50">
               <h2 className="text-2xl font-bold serif">Batch Catalog ({products.length})</h2>
               <button onClick={() => { setIsEditing(null); setMainImageBase64(''); setShowProductModal(true); }} className="bg-[#4a5d4e] text-white px-8 py-3 rounded-2xl text-[10px] font-bold uppercase shadow-lg">+ New Batch</button>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                      <th className="px-10 py-5">Product ID</th>
                      <th className="px-10 py-5">Details</th>
                      <th className="px-10 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} className="border-b border-gray-50">
                        <td className="px-10 py-6 text-xs font-mono font-bold">{p.id}</td>
                        <td className="px-10 py-6">
                           <div className="flex items-center gap-4">
                              <img src={p.image} className="w-12 h-12 rounded-xl object-cover" alt="" />
                              <div><p className="font-bold text-sm">{p.name}</p><p className="text-xs text-[#4a5d4e]">₹{p.price}</p></div>
                           </div>
                        </td>
                        <td className="px-10 py-6 text-right">
                           <div className="flex justify-end gap-2">
                             <button onClick={() => handleDuplicateProduct(p)} className="p-2 text-purple-500"><ICONS.Copy /></button>
                             <button onClick={() => { setIsEditing(p); setMainImageBase64(p.image); setShowProductModal(true); }} className="p-2 text-blue-500"><ICONS.Edit /></button>
                             <button onClick={() => { if(window.confirm('Delete?')) deleteProduct(p.id); }} className="p-2 text-red-500"><ICONS.Trash /></button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-[4rem] p-12 shadow-xl border border-gray-100 animate-fadeIn">
            <div className="mb-10">
               <h2 className="text-3xl font-bold serif mb-2">Home Page Control</h2>
               <p className="text-gray-400 text-sm">Manage hero backgrounds. Multiple images will activate an automatic slider.</p>
            </div>
            <div className="space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {tempHeroImages.map((img, i) => (
                   <div key={i} className="relative aspect-video rounded-3xl overflow-hidden border border-gray-100 shadow-sm group">
                      <img src={img} className="w-full h-full object-cover" alt="" />
                      <button 
                        onClick={() => setTempHeroImages(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ICONS.Close />
                      </button>
                   </div>
                 ))}
                 <label className="aspect-video rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                    <span className="text-3xl mb-2">+</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Add Hero Background</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleHeroImageUpload} />
                 </label>
               </div>
               <div className="pt-8 border-t border-gray-50 flex justify-end">
                  <button onClick={saveSettings} className="bg-[#4a5d4e] text-white px-10 py-4 rounded-2xl font-bold uppercase tracking-widest text-[11px] shadow-xl hover:-translate-y-1 transition-all">Save Changes</button>
               </div>
            </div>
          </div>
        )}

        {/* Existing logic for other tabs... */}
      </div>

      {showProductModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 backdrop-blur-xl bg-[#1a2323]/40 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-slideUp my-8">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-[#fcfbf7]">
              <h3 className="text-2xl font-bold serif">{isEditing ? 'Edit Batch' : 'New Harvest Entry'}</h3>
              <button onClick={() => setShowProductModal(false)}><ICONS.Close /></button>
            </div>
            <form onSubmit={handleSaveProduct} className="p-10 space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <input name="sku" defaultValue={isEditing?.id} placeholder="SKU ID" className="w-full bg-gray-50 rounded-xl p-4 text-sm outline-none" />
                <input name="name" defaultValue={isEditing?.name} required placeholder="Display Name" className="w-full bg-gray-50 rounded-xl p-4 text-sm outline-none" />
              </div>
              <textarea name="description" defaultValue={isEditing?.description} rows={3} placeholder="Description" className="w-full bg-gray-50 rounded-xl p-5 text-sm outline-none resize-none" />
              <div className="grid md:grid-cols-3 gap-6">
                <input type="number" name="price" defaultValue={isEditing?.price} required placeholder="Price (₹)" className="w-full bg-gray-50 rounded-xl p-4 text-sm outline-none" />
                <input type="number" name="stock" defaultValue={isEditing?.stock} required placeholder="Stock" className="w-full bg-gray-50 rounded-xl p-4 text-sm outline-none" />
                <input name="weight" defaultValue={isEditing?.weight} placeholder="Weight (e.g. 450g)" className="w-full bg-gray-50 rounded-xl p-4 text-sm outline-none" />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 mb-2 block">Primary Image</label>
                <div className="border-2 border-dashed border-gray-100 rounded-3xl p-8 flex items-center justify-center relative bg-gray-50/30">
                  {mainImageBase64 ? <img src={mainImageBase64} className="h-40 object-contain" /> : 'Click to Upload'}
                  <input type="file" accept="image/*" onChange={handleMainImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>
              <button type="submit" className="w-full bg-[#1a2323] text-white py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-[11px]">Save Product</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
