
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTickets } from '../context/TicketContext';
import { useData } from '../context/DataContext';
import { ICONS } from '../constants';
import { Product, Order, Offer, User, Ticket } from '../types';

const AdminDashboard: React.FC = () => {
  const { isAdmin, allUsers, deleteUser, toggleBlockUser, user: adminUser } = useAuth();
  const { tickets, closeTicket, addReply, markAsRead } = useTickets();
  const { 
    products, offers, categories: allCategories, 
    addProduct, updateProduct, deleteProduct,
    addCategory, deleteCategory,
    addOffer, updateOffer, deleteOffer, toggleOffer 
  } = useData();
  
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'tickets' | 'customers' | 'offers' | 'analytics'>('inventory');
  
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
  const [newCategoryName, setNewCategoryName] = useState('');

  const hasUnreadTickets = tickets.some(t => t.unreadAdmin);

  useEffect(() => {
    localStorage.setItem('vanphal_admin_orders', JSON.stringify(orders));
  }, [orders]);

  // Analytics Computation
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((acc, curr) => acc + (curr.status !== 'cancelled' ? curr.total : 0), 0);
    const totalOrders = orders.length;
    const returnedOrders = orders.filter(o => o.status === 'cancelled').length;
    const avgOrderValue = totalOrders > 0 ? (totalRevenue / (totalOrders - returnedOrders || 1)) : 0;
    const returnRate = totalOrders > 0 ? (returnedOrders / totalOrders) * 100 : 0;

    // Grouping for "Chart" (Mocking monthly grouping based on date strings)
    const monthlyData: Record<string, number> = {};
    orders.forEach(o => {
      const month = o.date.split(' ')[1] || 'Unknown'; // Expecting "12 October 2024"
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

    const productData: Product = {
      id: (formData.get('sku') as string) || isEditing?.id || `VP-${Math.floor(Math.random() * 900) + 100}`,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: Number(formData.get('price')),
      weight: formData.get('weight') as string,
      discountPercentage: Number(formData.get('discount')),
      image: mainImageBase64 || isEditing?.image || '',
      images: galleryImagesBase64,
      categories: selectedCats.length > 0 ? selectedCats : (isEditing?.categories || []),
      stock: stockCount,
      status: formData.get('status') as 'in-stock' | 'out-of-stock',
      ingredients: (formData.get('ingredients') as string).split(',').map(s => s.trim()).filter(s => s !== ''),
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
      bannerImage: isEditingOffer?.bannerImage || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200'
    };

    if (isEditingOffer) {
      updateOffer(offerData);
    } else {
      addOffer(offerData);
    }
    setShowOfferModal(false);
    setIsEditingOffer(null);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    addCategory(newCategoryName.trim());
    setNewCategoryName('');
  };

  const handleDeleteCategoryAction = (cat: string) => {
    if (window.confirm(`Are you sure you want to delete the category "${cat}"? Products using this category will no longer list it.`)) {
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
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-4">Total Revenue</p>
                <h3 className="text-4xl font-bold serif text-[#4a5d4e]">₹{stats.totalRevenue.toLocaleString()}</h3>
                <div className="mt-4 flex items-center gap-2 text-[10px] text-green-500 font-bold uppercase tracking-tighter">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Live Earnings
                </div>
              </div>
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-4">Orders Placed</p>
                <h3 className="text-4xl font-bold serif text-[#2d3a3a]">{stats.totalOrders}</h3>
                <p className="text-[10px] text-gray-400 mt-4 uppercase tracking-widest font-bold">Volume Tracked</p>
              </div>
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-4">Return Rate</p>
                <h3 className="text-4xl font-bold serif text-[#8b5e3c]">{stats.returnRate.toFixed(1)}%</h3>
                <p className="text-[10px] text-gray-400 mt-4 uppercase tracking-widest font-bold">{stats.returnedOrders} Returns Found</p>
              </div>
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-4">Avg. Order Value</p>
                <h3 className="text-4xl font-bold serif text-[#2d3a3a]">₹{stats.avgOrderValue.toFixed(0)}</h3>
                <p className="text-[10px] text-gray-400 mt-4 uppercase tracking-widest font-bold">Basket Performance</p>
              </div>
            </div>

            {/* Performance Charts Section */}
            <div className="grid lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8 bg-white p-12 rounded-[4rem] shadow-sm border border-gray-100">
                <div className="flex justify-between items-end mb-12">
                   <div>
                     <h3 className="text-2xl font-bold serif">Revenue Trends</h3>
                     <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Monthly Growth Performance</p>
                   </div>
                   <div className="bg-gray-50 px-4 py-2 rounded-xl text-[10px] font-bold text-[#4a5d4e]">FY 2024-25</div>
                </div>
                
                {/* Custom Bar Chart */}
                <div className="h-64 flex items-end justify-between gap-4 px-4 border-b border-gray-50">
                   {Object.keys(stats.monthlyData).length > 0 ? Object.entries(stats.monthlyData).map(([month, val]) => (
                     <div key={month} className="flex-1 flex flex-col items-center group relative">
                        <div 
                          className="w-full bg-[#4a5d4e] rounded-t-xl transition-all duration-700 hover:bg-[#8b5e3c]" 
                          style={{ height: `${(val / (stats.totalRevenue || 1)) * 100}%`, minHeight: '10px' }}
                        >
                           <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">₹{val}</div>
                        </div>
                        <p className="mt-4 text-[9px] uppercase font-bold text-gray-400 tracking-tighter truncate w-full text-center">{month}</p>
                     </div>
                   )) : (
                     <div className="w-full h-full flex items-center justify-center text-gray-300 italic text-sm">Awaiting more order data for visual trends...</div>
                   )}
                </div>
              </div>

              <div className="lg:col-span-4 bg-[#1a2323] p-12 rounded-[4rem] text-white shadow-2xl">
                 <h3 className="text-2xl font-bold serif mb-8">Order Status</h3>
                 <div className="space-y-6">
                    {['pending', 'shipped', 'delivered', 'cancelled'].map(status => {
                       const count = orders.filter(o => o.status === status).length;
                       const percent = orders.length > 0 ? (count / orders.length) * 100 : 0;
                       return (
                         <div key={status} className="space-y-2">
                            <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest">
                               <span className={status === 'cancelled' ? 'text-red-400' : 'text-white/60'}>{status}</span>
                               <span>{count}</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                               <div 
                                 className={`h-full transition-all duration-1000 ${status === 'cancelled' ? 'bg-red-500' : 'bg-[#8b5e3c]'}`} 
                                 style={{ width: `${percent}%` }}
                               ></div>
                            </div>
                         </div>
                       )
                    })}
                 </div>
                 <div className="mt-16 pt-8 border-t border-white/10">
                    <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest mb-4">Health Metric</p>
                    <p className="text-sm leading-relaxed text-white/70">Overall mountain farm operation is performing <span className="text-green-400 font-bold">Stable</span> with a steady growth in seasonal jams.</p>
                 </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden animate-fadeIn">
            <div className="p-10 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-50 gap-6">
               <div>
                  <h2 className="text-2xl font-bold serif">Batch Catalog</h2>
                  <p className="text-sm text-gray-400">Total {products.length} products found in mountain inventory.</p>
               </div>
               <div className="flex gap-4">
                  <button onClick={() => setShowCategoryModal(true)} className="bg-white border border-gray-200 text-[#4a5d4e] px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all">Manage Categories</button>
                  <button onClick={() => { setIsEditing(null); setMainImageBase64(''); setGalleryImagesBase64([]); setShowProductModal(true); }} className="bg-[#4a5d4e] text-white px-8 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-lg hover:shadow-[#4a5d4e]/30 transition-all">+ New Batch</button>
               </div>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                      <th className="px-10 py-5">Product ID</th>
                      <th className="px-10 py-5">Details</th>
                      <th className="px-10 py-5">Categories</th>
                      <th className="px-10 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
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
                           <div className="flex flex-wrap gap-1">
                             {p.categories.map(cat => (
                               <span key={cat} className="px-2 py-0.5 bg-gray-100 text-[8px] font-bold uppercase tracking-tighter text-gray-500 rounded">{cat}</span>
                             ))}
                           </div>
                        </td>
                        <td className="px-10 py-6 text-right">
                           <div className="flex justify-end gap-2">
                             <button onClick={() => { 
                               setIsEditing(p); 
                               setMainImageBase64(p.image); 
                               setGalleryImagesBase64(p.images || []); 
                               setShowProductModal(true); 
                             }} className="p-2 bg-blue-50 text-blue-500 rounded-lg transition-all hover:bg-blue-100" title="Edit Batch"><ICONS.Edit /></button>
                             <button onClick={() => { if(window.confirm(`Permanently delete "${p.name}"?`)) deleteProduct(p.id); }} className="p-2 bg-red-50 text-red-500 rounded-lg transition-all hover:bg-red-100" title="Delete Product"><ICONS.Trash /></button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {/* Remaining tabs (Orders, Customers, etc.) and Modals remain untouched */}
        {/* ... existing code ... */}
        {activeTab === 'orders' && (
           <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden animate-fadeIn">
             <div className="p-10 border-b border-gray-50">
                <h2 className="text-2xl font-bold serif">Order Logistics</h2>
                <p className="text-sm text-gray-400">Fulfill mountain harvest requests.</p>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                      <th className="px-10 py-5">Order ID</th>
                      <th className="px-10 py-5">Customer</th>
                      <th className="px-10 py-5">Items</th>
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
                        <td className="px-10 py-6 text-xs">{o.items.length} Units</td>
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
      </div>

      {/* Product, Offer, Category Modals same as before */}
      {/* ... Existing Modals logic ... */}
      
      {showProductModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 backdrop-blur-xl bg-[#1a2323]/40 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden animate-slideUp my-8">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-2xl font-bold serif">{isEditing ? `Edit Batch: ${isEditing.name}` : 'New Harvest Entry'}</h3>
              <button onClick={() => setShowProductModal(false)}><ICONS.Close /></button>
            </div>
            <form key={isEditing?.id || 'new-product'} onSubmit={handleSaveProduct} className="p-10 space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                   <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">SKU / ID</label>
                   <input name="sku" defaultValue={isEditing?.id} placeholder="VP-101" className="w-full bg-gray-50 rounded-xl p-4 text-sm" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Product Name</label>
                   <input name="name" defaultValue={isEditing?.name} required placeholder="Product Name" className="w-full bg-gray-50 rounded-xl p-4 text-sm" />
                </div>
              </div>
              <div className="grid md:grid-cols-4 gap-8">
                <div className="space-y-2">
                   <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Price (₹)</label>
                   <input type="number" name="price" defaultValue={isEditing?.price} required className="w-full bg-gray-50 rounded-xl p-4 text-sm" placeholder="499" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Discount (%)</label>
                   <input type="number" name="discount" defaultValue={isEditing?.discountPercentage || 0} className="w-full bg-gray-50 rounded-xl p-4 text-sm" placeholder="15" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Stock Units</label>
                   <input type="number" name="stock" defaultValue={isEditing?.stock || 0} required className="w-full bg-gray-50 rounded-xl p-4 text-sm" placeholder="50" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Weight</label>
                   <input name="weight" defaultValue={isEditing?.weight} placeholder="450g" className="w-full bg-gray-50 rounded-xl p-4 text-sm" />
                </div>
              </div>
              <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400">Assign Categories</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-6 rounded-2xl">
                    {allCategories.map(cat => (
                      <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" name={`cat-${cat}`} defaultChecked={isEditing?.categories?.includes(cat)} className="w-4 h-4 rounded text-[#4a5d4e]" />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-[#4a5d4e] transition-colors">{cat}</span>
                      </label>
                    ))}
                  </div>
              </div>
              <textarea name="description" defaultValue={isEditing?.description} rows={3} placeholder="Full description..." className="w-full bg-gray-50 rounded-xl p-4 text-sm resize-none" />
              <div className="grid md:grid-cols-2 gap-8">
                <div className="border-2 border-dashed rounded-3xl p-6 text-center relative min-h-[160px] flex items-center justify-center">
                   {mainImageBase64 ? <img src={mainImageBase64} className="h-32 w-32 object-cover mx-auto rounded-xl" /> : isEditing?.image ? <img src={isEditing.image} className="h-32 w-32 object-cover mx-auto rounded-xl opacity-60" /> : <p className="text-xs font-bold text-gray-400">Select Main Image</p>}
                   <input type="file" accept="image/*" onChange={handleMainImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <div className="border-2 border-dashed rounded-3xl p-6 text-center relative min-h-[160px] flex flex-wrap gap-2 items-center justify-center">
                   {galleryImagesBase64.map((img, i) => (
                     <div key={i} className="relative group/img"><img src={img} className="w-12 h-12 object-cover rounded-lg" /><button type="button" onClick={() => removeGalleryImage(i)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/img:opacity-100"><ICONS.Close /></button></div>
                   ))}
                   {galleryImagesBase64.length < 5 && <input type="file" multiple accept="image/*" onChange={handleGalleryImagesChange} className="absolute inset-0 opacity-0 cursor-pointer" />}
                </div>
              </div>
              <button type="submit" disabled={isProcessingImage} className="w-full bg-[#4a5d4e] text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-[11px] shadow-lg">
                {isProcessingImage ? 'Processing Graphics...' : (isEditing ? 'Save Product Changes' : 'Finalize Product Update')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
