
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTickets } from '../context/TicketContext';
import { useData } from '../context/DataContext';
import { ICONS } from '../constants';
import { Product, Order, Offer, User, Ticket } from '../types';

const AdminDashboard: React.FC = () => {
  const { isAdmin, allUsers, deleteUser, toggleBlockUser } = useAuth();
  const { tickets, closeTicket, addReply, markAsRead } = useTickets();
  const { 
    products, offers, categories: allCategories, 
    addProduct, updateProduct, deleteProduct,
    addCategory, updateCategory, deleteCategory,
    addOffer, updateOffer, deleteOffer, toggleOffer 
  } = useData();
  
  const [activeTab, setActiveTab] = useState<'analytics' | 'inventory' | 'orders' | 'tickets' | 'customers' | 'offers'>('analytics');
  
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
  
  // Category management local state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryValue, setEditCategoryValue] = useState('');

  const hasUnreadTickets = tickets.some(t => t.unreadAdmin);

  useEffect(() => {
    localStorage.setItem('vanphal_admin_orders', JSON.stringify(orders));
  }, [orders]);

  // Robust Analytics Computation with Error Handling for the 'split' error
  const stats = useMemo(() => {
    const validOrders = orders || [];
    const totalRevenue = validOrders.reduce((acc, curr) => acc + (curr.status !== 'cancelled' ? curr.total : 0), 0);
    const totalOrders = validOrders.length;
    const returnedOrders = validOrders.filter(o => o.status === 'cancelled').length;
    const avgOrderValue = totalOrders > 0 ? (totalRevenue / (totalOrders - returnedOrders || 1)) : 0;
    const returnRate = totalOrders > 0 ? (returnedOrders / totalOrders) * 100 : 0;

    const monthlyData: Record<string, number> = {};
    validOrders.forEach(o => {
      // Robust date handling to prevent .split() on null
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

  const handleGalleryImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const currentGalleryCount = galleryImagesBase64.length;
      const allowedCount = 5 - currentGalleryCount;
      const filesToProcess = files.slice(0, allowedCount);
      
      if (filesToProcess.length === 0) {
        alert("Maximum of 6 total images reached.");
        return;
      }

      setIsProcessingImage(true);
      try {
        const base64s = await Promise.all(filesToProcess.map(f => processImageFile(f)));
        setGalleryImagesBase64(prev => [...prev, ...base64s]);
      } catch (err) {
        console.error("Gallery processing failed:", err);
      } finally {
        setIsProcessingImage(false);
      }
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImagesBase64(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const stockCount = Number(formData.get('stock'));
    const selectedCats = allCategories.filter(cat => formData.get(`cat-${cat}`) === 'on');

    const rawIngredients = formData.get('ingredients');
    const ingredientsString = rawIngredients ? String(rawIngredients) : '';

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
      ingredients: ingredientsString.split(',').map(s => s.trim()).filter(s => s !== ''),
      nutrition: isEditing?.nutrition || { calories: '45 kcal', fat: '0g', sugar: '11g', protein: '0g' },
      tags: isEditing?.tags || ['Artisanal'],
    };

    if (isEditing) {
      updateProduct(productData);
    } else {
      addProduct(productData);
    }
    
    setShowProductModal(false);
    setIsEditing(null);
    setMainImageBase64('');
    setGalleryImagesBase64([]);
  };

  const handleSaveOffer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const offerData: Offer = {
      id: isEditingOffer?.id || `OFFER-${Math.floor(Math.random() * 9000) + 1000}`,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      code: (formData.get('code') as string).toUpperCase(),
      discount: Number(formData.get('discount')),
      isActive: isEditingOffer ? isEditingOffer.isActive : true,
      bannerImage: isEditingOffer?.bannerImage || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200',
      productId: formData.get('productId') as string || undefined
    };

    if (isEditingOffer) {
      updateOffer(offerData);
    } else {
      addOffer(offerData);
    }
    setShowOfferModal(false);
    setIsEditingOffer(null);
  };

  const handleSaveOrder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isEditingOrder) return;
    const formData = new FormData(e.currentTarget);
    const updatedOrder: Order = {
      ...isEditingOrder,
      trackingId: formData.get('trackingId') as string,
      trackingUrl: formData.get('trackingUrl') as string,
      status: formData.get('status') as any,
    };
    setOrders(prev => prev.map(o => o.id === isEditingOrder.id ? updatedOrder : o));
    setShowOrderModal(false);
    setIsEditingOrder(null);
  };

  const handleReplyTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;
    addReply(selectedTicket.id, {
      authorId: 'admin-1',
      authorName: 'Admin',
      authorRole: 'admin',
      message: replyText
    });
    setReplyText('');
  };

  // Category Actions
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      addCategory(newCategoryName);
      setNewCategoryName('');
    }
  };

  const handleStartEditCategory = (cat: string) => {
    setEditingCategory(cat);
    setEditCategoryValue(cat);
  };

  const handleUpdateCategory = () => {
    if (editingCategory && editCategoryValue.trim()) {
      updateCategory(editingCategory, editCategoryValue);
      setEditingCategory(null);
      setEditCategoryValue('');
    }
  };

  const handleDeleteCategory = (cat: string) => {
    if (window.confirm(`Delete category "${cat}"? This will remove it from all associated products.`)) {
      deleteCategory(cat);
    }
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
              { id: 'offers', label: 'Offers' }
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
          <div className="space-y-12 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-4">Total Earnings</p>
                <h3 className="text-4xl font-bold serif text-[#4a5d4e]">₹{stats.totalRevenue.toLocaleString()}</h3>
                <p className="text-[10px] text-green-500 font-bold uppercase mt-4">Growth Positive</p>
              </div>
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-4">Orders Placed</p>
                <h3 className="text-4xl font-bold serif text-[#2d3a3a]">{stats.totalOrders}</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-4">Lifetime Count</p>
              </div>
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-4">Cancelled / Returns</p>
                <h3 className="text-4xl font-bold serif text-red-400">{stats.returnedOrders}</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-4">{stats.returnRate.toFixed(1)}% Rate</p>
              </div>
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-4">Avg. Order Value</p>
                <h3 className="text-4xl font-bold serif text-[#2d3a3a]">₹{stats.avgOrderValue.toFixed(0)}</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-4">Per Customer</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8 bg-white p-12 rounded-[4rem] shadow-sm border border-gray-100">
                <h3 className="text-2xl font-bold serif mb-10">Monthly Revenue Growth</h3>
                <div className="h-64 flex items-end justify-between gap-4 px-4 border-b border-gray-100">
                  {Object.entries(stats.monthlyData).map(([month, val]) => (
                    <div key={month} className="flex-1 flex flex-col items-center group relative">
                      <div 
                        className="w-full bg-[#4a5d4e] rounded-t-xl transition-all duration-700 hover:bg-[#8b5e3c]" 
                        style={{ height: `${(val / (stats.totalRevenue || 1)) * 100}%`, minHeight: '15px' }}
                      >
                         <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">₹{val}</div>
                      </div>
                      <p className="mt-4 text-[9px] uppercase font-bold text-gray-400 tracking-tighter truncate w-full text-center">{month}</p>
                    </div>
                  ))}
                  {Object.keys(stats.monthlyData).length === 0 && (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 italic">No historical data found.</div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-4 bg-[#1a2323] p-12 rounded-[4rem] text-white">
                <h3 className="text-2xl font-bold serif mb-8">Status Logistics</h3>
                <div className="space-y-6">
                  {['pending', 'shipped', 'delivered', 'cancelled'].map(status => {
                    const count = orders.filter(o => o.status === status).length;
                    const percent = orders.length > 0 ? (count / orders.length) * 100 : 0;
                    return (
                      <div key={status} className="space-y-2">
                        <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-white/50">
                          <span>{status}</span>
                          <span>{count}</span>
                        </div>
                        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-[#8b5e3c] transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden animate-fadeIn">
            <div className="p-10 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-50 gap-6">
               <h2 className="text-2xl font-bold serif">Batch Catalog ({products.length})</h2>
               <div className="flex gap-4">
                  <button onClick={() => setShowCategoryModal(true)} className="bg-white border border-gray-200 text-[#4a5d4e] px-6 py-3 rounded-2xl text-[10px] font-bold uppercase hover:bg-gray-50 transition-all">Categories</button>
                  <button onClick={() => { setIsEditing(null); setMainImageBase64(''); setGalleryImagesBase64([]); setShowProductModal(true); }} className="bg-[#4a5d4e] text-white px-8 py-3 rounded-2xl text-[10px] font-bold uppercase shadow-lg">+ New Batch</button>
               </div>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                      <th className="px-10 py-5">Product ID</th>
                      <th className="px-10 py-5">Details</th>
                      <th className="px-10 py-5">Stock</th>
                      <th className="px-10 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-10 py-6 text-xs font-mono font-bold text-gray-400">{p.id}</td>
                        <td className="px-10 py-6">
                           <div className="flex items-center gap-4">
                              <img src={p.image} className="w-12 h-12 rounded-xl object-cover" alt="" />
                              <div>
                                <p className="font-bold text-sm">{p.name}</p>
                                <p className="text-xs text-[#4a5d4e] font-bold">₹{p.price} | {p.weight}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-10 py-6">
                           <span className={`text-[10px] font-bold uppercase ${p.stock < 10 ? 'text-orange-500' : 'text-gray-400'}`}>{p.stock} Units</span>
                        </td>
                        <td className="px-10 py-6 text-right">
                           <div className="flex justify-end gap-2">
                             <button onClick={() => { setIsEditing(p); setMainImageBase64(p.image); setGalleryImagesBase64(p.images || []); setShowProductModal(true); }} className="p-2 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-100"><ICONS.Edit /></button>
                             <button onClick={() => { if(window.confirm(`Delete "${p.name}"?`)) deleteProduct(p.id); }} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"><ICONS.Trash /></button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden animate-fadeIn">
            <div className="p-10 border-b border-gray-50">
               <h2 className="text-2xl font-bold serif">Order Logistics</h2>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                      <th className="px-10 py-5">Order ID</th>
                      <th className="px-10 py-5">Customer</th>
                      <th className="px-10 py-5">Total</th>
                      <th className="px-10 py-5">Status</th>
                      <th className="px-10 py-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id} className="border-b border-gray-50">
                        <td className="px-10 py-6 text-xs font-mono font-bold">#{o.id}</td>
                        <td className="px-10 py-6">
                           <p className="font-bold text-sm">{o.userName}</p>
                           <p className="text-[10px] text-gray-400">{o.email}</p>
                        </td>
                        <td className="px-10 py-6 font-bold">₹{o.total}</td>
                        <td className="px-10 py-6">
                           <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${o.status === 'delivered' ? 'bg-green-100 text-green-600' : (o.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600')}`}>
                             {o.status}
                           </span>
                        </td>
                        <td className="px-10 py-6 text-right">
                           <button onClick={() => { setIsEditingOrder(o); setShowOrderModal(true); }} className="text-[#4a5d4e] font-bold text-[10px] uppercase tracking-widest hover:underline">Manage</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden animate-fadeIn">
            <div className="p-10 border-b border-gray-50">
               <h2 className="text-2xl font-bold serif">Heritage Community ({allUsers.length})</h2>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                      <th className="px-10 py-5">User</th>
                      <th className="px-10 py-5">Contact</th>
                      <th className="px-10 py-5">Status</th>
                      <th className="px-10 py-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map(u => (
                      <tr key={u.id} className="border-b border-gray-50">
                        <td className="px-10 py-6">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-[#4a5d4e] flex items-center justify-center text-white font-bold text-sm uppercase">{u.avatar ? <img src={u.avatar} className="w-full h-full object-cover rounded-full" /> : u.name[0]}</div>
                              <p className="font-bold text-sm">{u.name}</p>
                           </div>
                        </td>
                        <td className="px-10 py-6">
                           <p className="text-sm font-medium">{u.email}</p>
                           <p className="text-xs text-gray-400">{u.phone || 'No Phone'}</p>
                        </td>
                        <td className="px-10 py-6">
                           <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${u.isBlocked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                             {u.isBlocked ? 'Blocked' : 'Active'}
                           </span>
                        </td>
                        <td className="px-10 py-6 text-right">
                           <div className="flex justify-end gap-2">
                             <button onClick={() => toggleBlockUser(u.id)} className={`p-2 rounded-lg ${u.isBlocked ? 'bg-orange-50 text-orange-500' : 'bg-green-50 text-green-500'}`} title={u.isBlocked ? 'Unblock' : 'Block'}><ICONS.Shield /></button>
                             <button onClick={() => { if(window.confirm(`Remove user "${u.name}"?`)) deleteUser(u.id); }} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"><ICONS.Trash /></button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {activeTab === 'offers' && (
          <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden animate-fadeIn">
            <div className="p-10 border-b border-gray-50 flex justify-between items-center">
               <h2 className="text-2xl font-bold serif">Promotions & Vouchers</h2>
               <button onClick={() => { setIsEditingOffer(null); setShowOfferModal(true); }} className="bg-[#4a5d4e] text-white px-8 py-3 rounded-2xl text-[10px] font-bold uppercase shadow-lg">+ New Offer</button>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                      <th className="px-10 py-5">Offer Details</th>
                      <th className="px-10 py-5">Voucher Code</th>
                      <th className="px-10 py-5">Discount</th>
                      <th className="px-10 py-5">Status</th>
                      <th className="px-10 py-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offers.map(o => (
                      <tr key={o.id} className="border-b border-gray-50">
                        <td className="px-10 py-6">
                           <p className="font-bold text-sm">{o.title}</p>
                           <p className="text-xs text-gray-400 line-clamp-1">{o.description}</p>
                        </td>
                        <td className="px-10 py-6">
                           <span className="bg-gray-100 px-3 py-1 rounded font-mono font-bold text-xs uppercase tracking-widest">{o.code}</span>
                        </td>
                        <td className="px-10 py-6 font-bold text-[#8b5e3c]">{o.discount}%</td>
                        <td className="px-10 py-6">
                           <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${o.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                             {o.isActive ? 'Active' : 'Expired'}
                           </span>
                        </td>
                        <td className="px-10 py-6 text-right">
                           <div className="flex justify-end gap-2">
                             <button onClick={() => toggleOffer(o.id)} className={`p-2 rounded-lg ${o.isActive ? 'bg-orange-50 text-orange-500' : 'bg-green-50 text-green-500'}`} title={o.isActive ? 'Deactivate' : 'Activate'}>●</button>
                             <button onClick={() => { setIsEditingOffer(o); setShowOfferModal(true); }} className="p-2 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-100"><ICONS.Edit /></button>
                             <button onClick={() => { if(window.confirm(`Delete offer "${o.title}"?`)) deleteOffer(o.id); }} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"><ICONS.Trash /></button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {activeTab === 'tickets' && (
          <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden animate-fadeIn">
            <div className="p-10 border-b border-gray-50">
               <h2 className="text-2xl font-bold serif">Support Tickets</h2>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                      <th className="px-10 py-5">Ticket ID</th>
                      <th className="px-10 py-5">Subject</th>
                      <th className="px-10 py-5">User</th>
                      <th className="px-10 py-5">Status</th>
                      <th className="px-10 py-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map(t => (
                      <tr key={t.id} className={`border-b border-gray-50 ${t.unreadAdmin ? 'bg-orange-50/20' : ''}`}>
                        <td className="px-10 py-6 text-xs font-mono font-bold">#{t.id}</td>
                        <td className="px-10 py-6">
                           <p className="font-bold text-sm flex items-center gap-2">
                             {t.subject}
                             {t.unreadAdmin && <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>}
                           </p>
                           <p className="text-xs text-gray-400 truncate max-w-xs">{t.message}</p>
                        </td>
                        <td className="px-10 py-6">
                           <p className="text-sm font-medium">{t.userName}</p>
                           <p className="text-[10px] text-gray-400 uppercase font-bold">{t.email}</p>
                        </td>
                        <td className="px-10 py-6">
                           <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${t.status === 'open' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                             {t.status}
                           </span>
                        </td>
                        <td className="px-10 py-6 text-right">
                           <button onClick={() => { setSelectedTicket(t); markAsRead(t.id, 'admin'); }} className="text-[#4a5d4e] font-bold text-[10px] uppercase tracking-widest hover:underline">View Case</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}
      </div>

      {/* Re-usable Modals */}
      {showProductModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 backdrop-blur-xl bg-[#1a2323]/40 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-slideUp my-8">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-[#fcfbf7]">
              <div>
                <h3 className="text-2xl font-bold serif">{isEditing ? `Edit Batch: ${isEditing.name}` : 'New Harvest Entry'}</h3>
                <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mt-1">Product Inventory Management</p>
              </div>
              <button onClick={() => setShowProductModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ICONS.Close /></button>
            </div>
            
            <form key={isEditing?.id || 'new-product'} onSubmit={handleSaveProduct} className="p-10 space-y-10">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[11px] uppercase font-bold text-[#4a5d4e] tracking-widest ml-1">Product SKU / ID</label>
                  <p className="text-[9px] text-gray-400 ml-1 mb-1 italic">Unique identification code (e.g., VP-101)</p>
                  <input name="sku" defaultValue={isEditing?.id} placeholder="e.g. VP-101" className="w-full bg-gray-50 rounded-2xl p-4 text-sm outline-none border border-transparent focus:border-[#4a5d4e] transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] uppercase font-bold text-[#4a5d4e] tracking-widest ml-1">Product Display Name</label>
                  <p className="text-[9px] text-gray-400 ml-1 mb-1 italic">Publicly visible title for this batch</p>
                  <input name="name" defaultValue={isEditing?.name} required placeholder="e.g. Mountain Green Apple Jam" className="w-full bg-gray-50 rounded-2xl p-4 text-sm outline-none border border-transparent focus:border-[#4a5d4e] transition-all" />
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] uppercase font-bold text-[#4a5d4e] tracking-widest ml-1">Price (₹)</label>
                  <p className="text-[9px] text-gray-400 ml-1 mb-1 italic">Selling price in INR</p>
                  <input type="number" name="price" defaultValue={isEditing?.price} required className="w-full bg-gray-50 rounded-2xl p-4 text-sm outline-none border border-transparent focus:border-[#4a5d4e] transition-all" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] uppercase font-bold text-[#4a5d4e] tracking-widest ml-1">Discount %</label>
                  <p className="text-[9px] text-gray-400 ml-1 mb-1 italic">Optional markdown percentage</p>
                  <input type="number" name="discount" defaultValue={isEditing?.discountPercentage || 0} className="w-full bg-gray-50 rounded-2xl p-4 text-sm outline-none border border-transparent focus:border-[#4a5d4e] transition-all" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] uppercase font-bold text-[#4a5d4e] tracking-widest ml-1">Inventory Stock</label>
                  <p className="text-[9px] text-gray-400 ml-1 mb-1 italic">Available units for dispatch</p>
                  <input type="number" name="stock" defaultValue={isEditing?.stock || 0} required className="w-full bg-gray-50 rounded-2xl p-4 text-sm outline-none border border-transparent focus:border-[#4a5d4e] transition-all" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] uppercase font-bold text-[#4a5d4e] tracking-widest ml-1">Net Weight</label>
                  <p className="text-[9px] text-gray-400 ml-1 mb-1 italic">e.g., 450g or 1kg</p>
                  <input name="weight" defaultValue={isEditing?.weight} placeholder="e.g. 450g" className="w-full bg-gray-50 rounded-2xl p-4 text-sm outline-none border border-transparent focus:border-[#4a5d4e] transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] uppercase font-bold text-[#4a5d4e] tracking-widest ml-1">Detailed Description</label>
                <p className="text-[9px] text-gray-400 ml-1 mb-1 italic">Elaborate on the taste, texture, and mountain origins</p>
                <textarea name="description" defaultValue={isEditing?.description} rows={3} placeholder="Describe the harvest..." className="w-full bg-gray-50 rounded-2xl p-5 text-sm outline-none border border-transparent focus:border-[#4a5d4e] transition-all resize-none" />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] uppercase font-bold text-[#4a5d4e] tracking-widest ml-1">Ingredients List</label>
                <p className="text-[9px] text-gray-400 ml-1 mb-1 italic">Comma-separated list (e.g. Organic Apples, Cane Sugar, Pectin)</p>
                <input name="ingredients" defaultValue={isEditing?.ingredients?.join(', ')} placeholder="List ingredients separated by commas..." className="w-full bg-gray-50 rounded-2xl p-4 text-sm outline-none border border-transparent focus:border-[#4a5d4e] transition-all" />
              </div>
              
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] uppercase font-bold text-[#4a5d4e] tracking-widest ml-1">Primary Hero Image</label>
                    <p className="text-[9px] text-gray-400 ml-1 mb-1 italic">The main image displayed in shop and home sections</p>
                  </div>
                  <div className="border-2 border-dashed border-gray-100 rounded-[2.5rem] p-8 text-center relative min-h-[220px] flex items-center justify-center bg-gray-50/30 group hover:bg-gray-50 transition-all">
                     {mainImageBase64 ? (
                       <img src={mainImageBase64} className="h-40 w-full object-contain rounded-2xl" alt="Preview" />
                     ) : isEditing?.image ? (
                       <div className="relative">
                         <img src={isEditing.image} className="h-40 w-full object-contain rounded-2xl opacity-60" alt="Current" />
                         <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold uppercase text-gray-400">Current Image</span>
                       </div>
                     ) : (
                       <div className="space-y-2">
                         <p className="text-xl">📸</p>
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Click or Drag to Upload</p>
                       </div>
                     )}
                     <input type="file" accept="image/*" onChange={handleMainImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] uppercase font-bold text-[#4a5d4e] tracking-widest ml-1">Product Gallery</label>
                    <p className="text-[9px] text-gray-400 ml-1 mb-1 italic">Upload up to 5 additional lifestyle or detail shots (Total 6 images)</p>
                  </div>
                  <div className="border-2 border-dashed border-gray-100 rounded-[2.5rem] p-8 text-center relative min-h-[220px] bg-gray-50/30 group hover:bg-gray-50 transition-all">
                     <div className="flex flex-wrap gap-3 items-center justify-center h-full">
                        {galleryImagesBase64.map((img, i) => (
                          <div key={i} className="relative group/img">
                            <img src={img} className="w-16 h-16 object-cover rounded-xl shadow-md" alt={`Gallery ${i}`} />
                            <button type="button" onClick={() => removeGalleryImage(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover/img:opacity-100 transition-all transform scale-90">
                              <ICONS.Close />
                            </button>
                          </div>
                        ))}
                        {galleryImagesBase64.length < 5 && (
                          <div className="relative w-16 h-16 rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-gray-300">
                             <span className="text-xl">+</span>
                             <input type="file" multiple accept="image/*" onChange={handleGalleryImagesChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                          </div>
                        )}
                        {galleryImagesBase64.length === 0 && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <p className="text-xl">🖼️</p>
                            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Additional Views</p>
                          </div>
                        )}
                     </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                 <div>
                    <label className="text-[11px] uppercase font-bold text-[#4a5d4e] tracking-widest ml-1">Categories</label>
                    <p className="text-[9px] text-gray-400 ml-1 mb-1 italic">Select all collection labels that apply</p>
                 </div>
                 <div className="flex flex-wrap gap-6 p-6 bg-[#fcfbf7] rounded-3xl border border-gray-100">
                    {allCategories.map(cat => (
                      <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center">
                          <input type="checkbox" name={`cat-${cat}`} defaultChecked={isEditing?.categories?.includes(cat)} className="w-5 h-5 rounded border-gray-200 text-[#4a5d4e] focus:ring-[#4a5d4e] transition-all cursor-pointer" />
                        </div>
                        <span className="text-xs font-bold text-gray-500 group-hover:text-[#4a5d4e] transition-colors">{cat}</span>
                      </label>
                    ))}
                 </div>
              </div>

              <div className="pt-8 border-t border-gray-100">
                <button type="submit" disabled={isProcessingImage} className="w-full bg-[#1a2323] text-white py-6 rounded-3xl font-bold uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-[#1a2323]/20 hover:-translate-y-1 transition-all disabled:opacity-50">
                  {isProcessingImage ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                      Optimizing Harvest Data...
                    </span>
                  ) : (isEditing ? 'Save Product Changes' : 'Finalize Batch Update')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showOfferModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 backdrop-blur-xl bg-[#1a2323]/40">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-10 animate-slideUp">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold serif">{isEditingOffer ? 'Edit Promotion' : 'New Promotion'}</h3>
                <button onClick={() => setShowOfferModal(false)}><ICONS.Close /></button>
             </div>
             <form onSubmit={handleSaveOffer} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Title</label>
                   <input name="title" required defaultValue={isEditingOffer?.title} placeholder="Seasonal Sale" className="w-full bg-gray-50 rounded-xl p-4 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Code</label>
                      <input name="code" required defaultValue={isEditingOffer?.code} placeholder="MOUNTAIN25" className="w-full bg-gray-50 rounded-xl p-4 text-sm uppercase" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Discount %</label>
                      <input type="number" name="discount" required defaultValue={isEditingOffer?.discount} placeholder="25" className="w-full bg-gray-50 rounded-xl p-4 text-sm" />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Product SKU (Optional)</label>
                   <input name="productId" defaultValue={isEditingOffer?.productId} placeholder="VP-101" className="w-full bg-gray-50 rounded-xl p-4 text-sm" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Description</label>
                   <textarea name="description" required defaultValue={isEditingOffer?.description} rows={2} className="w-full bg-gray-50 rounded-xl p-4 text-sm outline-none resize-none" />
                </div>
                <button type="submit" className="w-full bg-[#1a2323] text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-[10px]">Save Promotion</button>
             </form>
          </div>
        </div>
      )}

      {showCategoryModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 backdrop-blur-xl bg-[#1a2323]/40">
           <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl h-[70vh] flex flex-col overflow-hidden animate-slideUp">
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-[#fcfbf7]">
                <div>
                  <h3 className="text-2xl font-bold serif">Category Management</h3>
                  <p className="text-[9px] uppercase font-bold tracking-widest text-gray-400 mt-1">Organize your Harvest Collection</p>
                </div>
                <button onClick={() => setShowCategoryModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><ICONS.Close /></button>
              </div>

              <div className="p-8 bg-white border-b border-gray-50">
                <form onSubmit={handleAddCategory} className="flex gap-3">
                  <input 
                    type="text" 
                    value={newCategoryName} 
                    onChange={e => setNewCategoryName(e.target.value)} 
                    placeholder="e.g. Rare Berries"
                    className="flex-grow bg-gray-50 rounded-2xl px-6 py-4 text-sm outline-none border border-transparent focus:border-[#4a5d4e] transition-all"
                  />
                  <button type="submit" className="bg-[#4a5d4e] text-white px-8 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-lg">+ Add</button>
                </form>
              </div>

              <div className="flex-grow overflow-y-auto p-8 space-y-4 bg-gray-50/20">
                {allCategories.map(cat => (
                  <div key={cat} className="bg-white p-5 rounded-[2rem] border border-gray-100 flex items-center justify-between group shadow-sm">
                    {editingCategory === cat ? (
                      <div className="flex-grow flex gap-3">
                        <input 
                          autoFocus
                          value={editCategoryValue} 
                          onChange={e => setEditCategoryValue(e.target.value)} 
                          className="flex-grow bg-gray-50 rounded-xl px-4 py-2 text-sm outline-none border border-[#4a5d4e]"
                        />
                        <button onClick={handleUpdateCategory} className="text-green-600 font-bold text-[10px] uppercase">Save</button>
                        <button onClick={() => setEditingCategory(null)} className="text-gray-400 font-bold text-[10px] uppercase">Cancel</button>
                      </div>
                    ) : (
                      <>
                        <span className="font-bold text-sm text-[#2d3a3a]">{cat}</span>
                        <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleStartEditCategory(cat)} className="text-blue-500 font-bold text-[10px] uppercase tracking-widest hover:underline">Edit</button>
                          <button onClick={() => handleDeleteCategory(cat)} className="text-red-500 font-bold text-[10px] uppercase tracking-widest hover:underline">Delete</button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-6 bg-[#fcfbf7] border-t border-gray-50 text-center">
                <p className="text-[9px] text-gray-300 uppercase tracking-widest font-bold">Modifying a category affects all associated products.</p>
              </div>
           </div>
        </div>
      )}

      {/* Ticket Conversation Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 backdrop-blur-xl bg-[#1a2323]/40">
           <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl h-[80vh] flex flex-col overflow-hidden animate-slideUp">
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-[#fcfbf7]">
                 <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#8b5e3c]">Case #{selectedTicket.id}</span>
                    <h3 className="text-2xl font-bold serif">{selectedTicket.subject}</h3>
                 </div>
                 <button onClick={() => setSelectedTicket(null)}><ICONS.Close /></button>
              </div>
              <div className="flex-grow overflow-y-auto p-8 space-y-6 bg-[#fcfbf7]">
                 <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold shrink-0">{selectedTicket.userName[0]}</div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 max-w-[85%] text-sm">{selectedTicket.message}</div>
                 </div>
                 {selectedTicket.replies.map((reply, idx) => (
                    <div key={idx} className={`flex gap-4 ${reply.authorRole === 'admin' ? 'flex-row-reverse' : ''}`}>
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm ${reply.authorRole === 'admin' ? 'bg-[#8b5e3c]' : 'bg-[#4a5d4e]'}`}>{reply.authorName[0]}</div>
                       <div className={`p-5 rounded-2xl shadow-sm border border-gray-100 max-w-[85%] text-sm ${reply.authorRole === 'admin' ? 'bg-[#8b5e3c]/5' : 'bg-white'}`}>{reply.message}</div>
                    </div>
                 ))}
              </div>
              <div className="p-8 border-t border-gray-50 bg-white">
                 <form onSubmit={handleReplyTicket} className="flex gap-4">
                    <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Type admin response..." className="flex-grow bg-gray-50 rounded-xl px-6 py-4 text-sm outline-none border border-transparent focus:border-[#4a5d4e]" />
                    <button type="submit" disabled={!replyText.trim()} className="bg-[#4a5d4e] text-white px-8 py-4 rounded-xl font-bold text-xs uppercase shadow-lg disabled:opacity-50">Reply</button>
                 </form>
                 <div className="mt-4 flex justify-between">
                    <button onClick={() => { closeTicket(selectedTicket.id); setSelectedTicket(null); }} className="text-red-500 text-[10px] font-bold uppercase tracking-widest hover:underline">Close This Ticket</button>
                    <span className="text-gray-300 text-[9px] font-bold uppercase">Heritage Support Line</span>
                 </div>
              </div>
           </div>
        </div>
      )}

      {showOrderModal && isEditingOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 backdrop-blur-xl bg-[#1a2323]/40">
           <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-10 animate-slideUp">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-2xl font-bold serif">Order #{isEditingOrder.id}</h3>
                 <button onClick={() => setShowOrderModal(false)}><ICONS.Close /></button>
              </div>
              <form onSubmit={handleSaveOrder} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Order Status</label>
                    <select name="status" defaultValue={isEditingOrder.status} className="w-full bg-gray-50 rounded-xl p-4 text-sm outline-none">
                       <option value="pending">Pending</option>
                       <option value="shipped">Shipped</option>
                       <option value="delivered">Delivered</option>
                       <option value="cancelled">Cancelled</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Tracking ID</label>
                    <input name="trackingId" defaultValue={isEditingOrder.trackingId} className="w-full bg-gray-50 rounded-xl p-4 text-sm" placeholder="e.g. TRK12345" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Tracking URL</label>
                    <input name="trackingUrl" defaultValue={isEditingOrder.trackingUrl} className="w-full bg-gray-50 rounded-xl p-4 text-sm" placeholder="https://tracking-site.com/..." />
                 </div>
                 <button type="submit" className="w-full bg-[#1a2323] text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg">Save Fulfillment Details</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
