
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTickets } from '../context/TicketContext';
import { ICONS } from '../constants';
import { Order, User, Ticket } from '../types';

const UserDashboard: React.FC = () => {
  const { user, logout, updateProfile } = useAuth();
  const { tickets, addTicket, addReply, markAsRead } = useTickets();
  const [activeTab, setActiveTab] = useState<'orders' | 'tickets' | 'profile'>('orders');
  
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileForm, setProfileForm] = useState<Partial<User>>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    zip: user?.zip || '',
    avatar: user?.avatar || ''
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        zip: user.zip || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  useEffect(() => {
    const saved = localStorage.getItem('vanphal_admin_orders');
    if (saved && user) {
      const all = JSON.parse(saved);
      setMyOrders(all.filter((o: Order) => o.userId === user.id));
    }
  }, [user, activeTab]);

  const [ticketForm, setTicketForm] = useState({ subject: '', message: '', orderId: '' });
  const [showTicketForm, setShowTicketForm] = useState(false);

  const myTickets = tickets.filter(t => t.userId === user?.id);
  const hasUnreadTicket = myTickets.some(t => t.unreadUser);

  const handleRaiseTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    addTicket({
      userId: user.id,
      userName: user.name,
      email: user.email,
      subject: ticketForm.subject,
      message: ticketForm.message,
      orderId: ticketForm.orderId
    });
    setTicketForm({ subject: '', message: '', orderId: '' });
    setShowTicketForm(false);
    alert("Ticket raised successfully. We will respond soon! 🏔️");
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim() || !user) return;
    addReply(selectedTicket.id, {
      authorId: user.id,
      authorName: user.name,
      authorRole: 'user',
      message: replyText
    });
    setReplyText('');
  };

  const openTicketConversation = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    markAsRead(ticket.id, 'user');
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setProfileForm(prev => ({ ...prev, avatar: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteAvatar = () => {
    if(window.confirm("Remove profile photo?")) {
      setProfileForm(prev => ({ ...prev, avatar: '' }));
    }
  };

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(profileForm);
    alert("Your profile has been successfully saved! 🏔️");
  };

  if (!user) {
    return <div className="pt-40 text-center serif italic text-2xl">Please sign in to view your dashboard.</div>;
  }

  return (
    <div className="pt-32 lg:pt-40 pb-24 bg-[#fcfbf7] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          
          <aside className="w-full lg:w-72 space-y-12 shrink-0">
            <div className="space-y-6">
              <div className="relative group w-28 h-28 mx-auto lg:mx-0">
                <div className="w-full h-full bg-[#4a5d4e] rounded-full overflow-hidden flex items-center justify-center text-white text-3xl font-bold shadow-2xl border-4 border-white transition-all group-hover:scale-[1.03]">
                  {profileForm.avatar ? (
                    <img src={profileForm.avatar} className="w-full h-full object-cover" alt="Profile" />
                  ) : (
                    user.name[0]
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 bg-[#8b5e3c] text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform border-2 border-white"
                  title="Update Photo"
                >
                  <ICONS.Edit />
                </button>
              </div>
              <div className="text-center lg:text-left">
                <h1 className="text-3xl font-bold serif">{user.name}</h1>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{user.email}</p>
              </div>
            </div>

            <nav className="space-y-3">
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full text-left px-6 py-4 rounded-2xl transition-all border flex items-center gap-4 ${
                  activeTab === 'orders' ? 'bg-[#4a5d4e] text-white border-[#4a5d4e] font-bold shadow-xl' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'
                }`}
              >
                <span className="text-xl">📦</span>
                <span className="text-xs uppercase tracking-widest">Order History</span>
              </button>
              
              <button
                onClick={() => setActiveTab('tickets')}
                className={`w-full text-left px-6 py-4 rounded-2xl transition-all border flex items-center justify-between gap-4 ${
                  activeTab === 'tickets' ? 'bg-[#4a5d4e] text-white border-[#4a5d4e] font-bold shadow-xl' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-xl">🎫</span>
                  <span className="text-xs uppercase tracking-widest">Support Tickets</span>
                </div>
                {hasUnreadTicket && <span className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.6)]"></span>}
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-6 py-4 rounded-2xl transition-all border flex items-center gap-4 ${
                  activeTab === 'profile' ? 'bg-[#4a5d4e] text-white border-[#4a5d4e] font-bold shadow-xl' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'
                }`}
              >
                <span className="text-xl">⚙️</span>
                <span className="text-xs uppercase tracking-widest">Account Settings</span>
              </button>

              <button onClick={logout} className="w-full text-left px-6 py-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold text-xs uppercase tracking-widest mt-10">
                🚪 Sign Out
              </button>
            </nav>
          </aside>

          <main className="flex-grow w-full">
            {activeTab === 'orders' && (
              <div className="space-y-10 animate-fadeIn">
                <div className="flex justify-between items-end">
                  <h2 className="text-4xl font-bold serif">Purchase History</h2>
                  <p className="text-sm font-bold text-[#4a5d4e]">{myOrders.length} Orders</p>
                </div>
                {myOrders.length > 0 ? (
                  <div className="grid gap-8">
                    {myOrders.map(order => (
                      <div key={order.id} className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-gray-50 pb-8">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-300">Order ID: #{order.id}</span>
                                <span className="px-2 py-0.5 bg-gray-50 rounded text-[8px] font-bold text-gray-400 uppercase tracking-widest">{order.channel || 'DTC'}</span>
                            </div>
                            <p className="text-sm font-bold">Placed on {order.date}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-6 mb-8">
                          {order.items.map(item => (
                            <div key={item.id} className="flex gap-4 items-center">
                              <img src={item.image} className="w-12 h-12 rounded-xl object-cover" alt="" />
                              <div className="flex-grow">
                                <p className="font-bold text-sm">{item.name}</p>
                                <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                              </div>
                              <p className="font-bold text-sm">₹{item.price * item.quantity}</p>
                            </div>
                          ))}
                        </div>

                        <div className="bg-[#fcfbf7] p-8 rounded-[2.5rem] border border-gray-50">
                           <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                             <div className="space-y-4 w-full md:w-auto">
                                <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8b5e3c]">Logistics & Tracking</p>
                                {order.trackingId ? (
                                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    <div className="bg-white px-5 py-3 rounded-2xl border border-dashed border-gray-200 flex items-center gap-3">
                                       <div>
                                         <p className="text-[9px] uppercase text-gray-300 font-bold mb-0.5">Tracking ID</p>
                                         <p className="text-sm font-mono font-bold text-[#2d3a3a]">{order.trackingId}</p>
                                       </div>
                                       <button 
                                         onClick={() => handleCopy(order.trackingId)} 
                                         className={`p-2 rounded-lg transition-all ${copiedId === order.trackingId ? 'bg-green-500 text-white' : 'bg-gray-50 text-gray-400 hover:text-[#4a5d4e]'}`}
                                       >
                                         {copiedId === order.trackingId ? '✓' : <ICONS.Copy />}
                                       </button>
                                    </div>
                                    {order.trackingUrl && (
                                      <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="bg-[#4a5d4e] text-white px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:shadow-xl transition-all">
                                        Track Live 🏔️
                                      </a>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-gray-400 italic text-sm">Harvest confirmed. Preparing dispatch...</p>
                                )}
                             </div>
                             <div className="text-right">
                               <p className="text-[10px] uppercase font-bold text-gray-300 tracking-widest mb-1">Total</p>
                               <p className="text-3xl font-bold serif text-[#4a5d4e]">₹{order.total}</p>
                             </div>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-gray-100">
                    <p className="serif italic text-2xl text-gray-300">No mountain treasures found yet.</p>
                    <Link to="/shop" className="text-[#4a5d4e] font-bold underline mt-4 inline-block">Explore the Shop</Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tickets' && (
              <div className="space-y-10 animate-fadeIn">
                <div className="flex justify-between items-end">
                  <h2 className="text-4xl font-bold serif">Support Tickets</h2>
                  <button onClick={() => setShowTicketForm(true)} className="bg-[#4a5d4e] text-white px-8 py-3 rounded-2xl text-xs font-bold shadow-lg hover:shadow-[#4a5d4e]/30 transition-all">
                    + Raise Ticket
                  </button>
                </div>

                <div className="grid gap-6">
                  {myTickets.length > 0 ? myTickets.map(ticket => (
                    <div 
                      key={ticket.id} 
                      onClick={() => openTicketConversation(ticket)}
                      className={`bg-white p-8 rounded-[2.5rem] border transition-all cursor-pointer hover:shadow-lg ${ticket.unreadUser ? 'border-orange-200 bg-orange-50/10' : 'border-gray-100'}`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${ticket.status === 'open' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                              {ticket.status}
                            </span>
                            {ticket.unreadUser && <span className="bg-orange-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter animate-pulse">Admin Replied</span>}
                          </div>
                          <h3 className="text-xl font-bold serif mt-3">{ticket.subject}</h3>
                        </div>
                        <span className="text-[10px] font-bold text-gray-300">#{ticket.id}</span>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2 italic">"{ticket.message}"</p>
                      <div className="mt-4 flex justify-between items-center border-t border-gray-50 pt-4">
                        <p className="text-[10px] text-gray-300 uppercase tracking-widest font-bold">{ticket.date}</p>
                        <span className="text-[#4a5d4e] text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">View Conversation <ICONS.ArrowRight /></span>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-20 bg-white rounded-[2.5rem] border border-gray-100">
                      <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">No active support tickets.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="animate-fadeIn space-y-10">
                <h2 className="text-4xl font-bold serif">Identity & Address</h2>
                <div className="bg-white p-12 rounded-[3rem] border border-gray-100 shadow-sm">
                  <div className="mb-12 flex flex-col sm:flex-row items-center gap-10 bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100/50">
                    <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-xl overflow-hidden flex items-center justify-center relative group">
                       {profileForm.avatar ? (
                         <img src={profileForm.avatar} className="w-full h-full object-cover" alt="Profile" />
                       ) : (
                         <span className="text-5xl text-gray-100">{user.name[0]}</span>
                       )}
                       <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button onClick={() => fileInputRef.current?.click()} className="text-white text-xs font-bold uppercase tracking-widest">Update</button>
                       </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-4">
                         <button 
                           onClick={() => fileInputRef.current?.click()}
                           className="bg-[#4a5d4e] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg hover:bg-[#3a4d3e] transition-all"
                         >
                           Change Harvest Photo
                         </button>
                         {profileForm.avatar && (
                           <button 
                             onClick={handleDeleteAvatar}
                             className="text-red-400 font-bold text-xs uppercase tracking-widest px-4 hover:bg-red-50 rounded-xl transition-all"
                           >
                             Remove Photo
                           </button>
                         )}
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Recommended: 400x400 PNG/JPG</p>
                      <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
                    </div>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-10">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-gray-300 tracking-widest ml-1">Full Name</label>
                        <input value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-1 focus:ring-[#4a5d4e] outline-none" placeholder="Enter full name" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-gray-300 tracking-widest ml-1">Email Address</label>
                        <input value={profileForm.email} readOnly className="w-full bg-gray-100 border-none rounded-2xl p-4 text-sm text-gray-400 cursor-not-allowed" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-gray-300 tracking-widest ml-1">Contact Phone</label>
                        <input value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-1 focus:ring-[#4a5d4e] outline-none" placeholder="+91 XXXXX XXXXX" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-gray-300 tracking-widest ml-1">ZIP / PIN Code</label>
                        <input value={profileForm.zip} onChange={e => setProfileForm({...profileForm, zip: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-1 focus:ring-[#4a5d4e] outline-none" placeholder="263001" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-gray-300 tracking-widest ml-1">Detailed Shipping Address</label>
                      <textarea rows={3} value={profileForm.address} onChange={e => setProfileForm({...profileForm, address: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-1 focus:ring-[#4a5d4e] outline-none resize-none" placeholder="House no, Street, Landmark..." />
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-gray-300 tracking-widest ml-1">City</label>
                        <input value={profileForm.city} onChange={e => setProfileForm({...profileForm, city: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-1 focus:ring-[#4a5d4e] outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-gray-300 tracking-widest ml-1">State</label>
                        <input value={profileForm.state} onChange={e => setProfileForm({...profileForm, state: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-1 focus:ring-[#4a5d4e] outline-none" />
                      </div>
                    </div>
                    <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                      <button type="submit" className="bg-[#4a5d4e] text-white px-10 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:shadow-xl transition-all">Save Changes</button>
                      <p className="text-[9px] text-gray-300 uppercase tracking-widest font-bold">Secure Identity Service</p>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 backdrop-blur-xl bg-[#1a2323]/40">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl h-[80vh] flex flex-col overflow-hidden animate-slideUp">
             <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-[#fcfbf7]">
                <div>
                   <span className="text-[9px] font-bold uppercase tracking-widest text-[#8b5e3c]">Conversation #{selectedTicket.id}</span>
                   <h3 className="text-2xl font-bold serif">{selectedTicket.subject}</h3>
                </div>
                <button onClick={() => setSelectedTicket(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ICONS.Close /></button>
             </div>
             
             <div className="flex-grow overflow-y-auto p-8 space-y-8 bg-[#fcfbf7]">
                <div className="flex gap-4">
                   <div className="w-10 h-10 rounded-full bg-[#4a5d4e] flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-lg">{selectedTicket.userName[0]}</div>
                   <div className="bg-white p-6 rounded-3xl rounded-tl-none shadow-sm border border-gray-100 max-w-[85%]">
                      <p className="text-sm leading-relaxed text-gray-700">{selectedTicket.message}</p>
                      <p className="text-[9px] text-gray-400 mt-4 font-bold uppercase">{selectedTicket.date}</p>
                   </div>
                </div>

                {selectedTicket.replies.map(reply => (
                   <div key={reply.id} className={`flex gap-4 ${reply.authorRole === 'user' ? '' : 'flex-row-reverse'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-lg ${reply.authorRole === 'user' ? 'bg-[#4a5d4e]' : 'bg-[#8b5e3c]'}`}>
                        {reply.authorName[0]}
                      </div>
                      <div className={`p-6 rounded-3xl shadow-sm border border-gray-100 max-w-[85%] ${reply.authorRole === 'user' ? 'bg-white rounded-tl-none' : 'bg-white/60 border-dashed border-[#8b5e3c]/20 rounded-tr-none'}`}>
                        <p className={`text-sm leading-relaxed ${reply.authorRole === 'user' ? 'text-gray-700' : 'text-[#8b5e3c] font-medium'}`}>{reply.message}</p>
                        <p className="text-[9px] text-gray-400 mt-4 font-bold uppercase">{reply.date}</p>
                      </div>
                   </div>
                ))}
             </div>

             <div className="p-8 bg-white border-t border-gray-50">
                <form onSubmit={handleSendReply} className="flex gap-4">
                   <input 
                     value={replyText}
                     onChange={e => setReplyText(e.target.value)}
                     className="flex-grow bg-gray-50 rounded-2xl px-6 py-4 text-sm outline-none border border-transparent focus:border-[#4a5d4e] transition-all"
                     placeholder="Reply to Vanphal support..."
                   />
                   <button type="submit" disabled={!replyText.trim()} className="bg-[#4a5d4e] text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg disabled:opacity-50">Send</button>
                </form>
             </div>
          </div>
        </div>
      )}

      {showTicketForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 backdrop-blur-xl bg-[#1a2323]/40">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-10 animate-slideUp">
            <div className="flex justify-between items-start mb-8">
               <h3 className="text-3xl font-bold serif">Raise Ticket</h3>
               <button onClick={() => setShowTicketForm(false)} className="text-gray-300 hover:text-gray-600"><ICONS.Close /></button>
            </div>
            <form onSubmit={handleRaiseTicket} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Subject</label>
                <input required value={ticketForm.subject} onChange={e => setTicketForm({...ticketForm, subject: e.target.value})} className="w-full bg-gray-50 rounded-2xl p-4 text-sm outline-none" placeholder="e.g. Order #123 issue" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Message</label>
                <textarea required rows={4} value={ticketForm.message} onChange={e => setTicketForm({...ticketForm, message: e.target.value})} className="w-full bg-gray-50 rounded-2xl p-4 text-sm outline-none resize-none" placeholder="Details..." />
              </div>
              <button type="submit" className="w-full bg-[#4a5d4e] text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px]">Submit</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
