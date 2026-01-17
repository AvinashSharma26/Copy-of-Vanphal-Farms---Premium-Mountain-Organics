
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Order, Offer, OfferApplied } from '../types';
import { COUNTRIES, ICONS } from '../constants';

const Checkout: React.FC = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'address' | 'payment'>('address');
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'nb' | 'wallet'>('upi');
  const [couponCode, setCouponCode] = useState('');
  const [appliedOffer, setAppliedOffer] = useState<OfferApplied | null>(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    zip: '',
    state: 'Uttarakhand',
    country: 'India'
  });

  // Redirect if accessed directly without login or with empty cart
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/checkout' }, replace: true });
    } else if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [user, cartItems, navigate]);

  const handleNextToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.address || !formData.phone || !formData.city || !formData.email || !formData.zip) {
      alert("Please ensure all shipping details are provided.");
      return;
    }
    setPaymentStep('payment');
    window.scrollTo(0, 0);
  };

  const applyCoupon = () => {
    const savedOffersRaw = localStorage.getItem('vanphal_admin_offers');
    const allOffers: Offer[] = savedOffersRaw ? JSON.parse(savedOffersRaw) : [];
    
    const found = allOffers.find(o => o.code === couponCode.toUpperCase() && o.isActive);
    
    if (found) {
      // Calculate actual discount
      let discountAmount = 0;
      if (found.productId) {
        // Product specific discount
        const targetedItems = cartItems.filter(item => item.id === found.productId);
        if (targetedItems.length > 0) {
            const targetedTotal = targetedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            discountAmount = Math.round((targetedTotal * found.discount) / 100);
        } else {
            alert(`This coupon only applies to a specific product not currently in your basket.`);
            return;
        }
      } else {
        // Global discount
        discountAmount = Math.round((cartTotal * found.discount) / 100);
      }

      setAppliedOffer({ ...found, discountCalculated: discountAmount });
    } else {
      alert("Invalid or expired coupon code.");
      setAppliedOffer(null);
    }
  };

  const finalTotal = cartTotal - (appliedOffer?.discountCalculated || 0);

  const finalizePayment = () => {
    if (!user) return;
    setLoading(true);
    
    // Simulate payment delay
    setTimeout(() => {
      const orderId = `ORD-${Math.floor(Math.random() * 90000) + 10000}`;
      const newOrder: Order = {
        id: orderId,
        userId: user.id,
        userName: user.name,
        email: formData.email,
        items: [...cartItems],
        subtotal: cartTotal,
        discountAmount: appliedOffer?.discountCalculated || 0,
        total: finalTotal,
        status: 'pending',
        channel: 'DTC',
        trackingId: '',
        trackingUrl: '',
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
        address: formData.address,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        zip: formData.zip,
        phone: formData.phone
      };

      const savedOrders = JSON.parse(localStorage.getItem('vanphal_admin_orders') || '[]');
      localStorage.setItem('vanphal_admin_orders', JSON.stringify([newOrder, ...savedOrders]));

      setLoading(false);
      clearCart();
      navigate('/success', { state: { orderId } });
    }, 2500);
  };

  if (!user || cartItems.length === 0) return null;

  return (
    <div className="pt-32 lg:pt-44 pb-32 bg-[#fcfbf7] min-h-screen">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-12">
          <h1 className="text-5xl font-bold serif mb-3">Complete Purchase</h1>
          <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-300">
            <span className={paymentStep === 'address' ? 'text-[#4a5d4e]' : 'text-green-500'}>01 Delivery Info</span>
            <span className="w-8 h-px bg-gray-100"></span>
            <span className={paymentStep === 'payment' ? 'text-[#4a5d4e]' : ''}>02 Secured Payment</span>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-8">
            <button 
              onClick={() => paymentStep === 'payment' ? setPaymentStep('address') : navigate('/cart')}
              className="mb-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
            >
              <ICONS.ArrowLeft /> Go Back
            </button>

            {paymentStep === 'address' ? (
              <form onSubmit={handleNextToPayment} className="bg-white p-12 rounded-[4rem] shadow-sm border border-gray-100 space-y-10">
                <h2 className="text-3xl font-bold serif">Shipping Details</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-2">Full Name</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-5 text-sm outline-none focus:ring-1 focus:ring-[#4a5d4e]" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-2">Email ID</label>
                    <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-5 text-sm outline-none focus:ring-1 focus:ring-[#4a5d4e]" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                   <div className="space-y-3">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-2">Contact Phone</label>
                    <input type="tel" required placeholder="+91" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-5 text-sm outline-none focus:ring-1 focus:ring-[#4a5d4e]" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-2">Country</label>
                    <select value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-5 text-sm outline-none focus:ring-1 focus:ring-[#4a5d4e]">
                        {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-2">Detailed Address</label>
                  <textarea required rows={3} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-5 text-sm resize-none outline-none focus:ring-1 focus:ring-[#4a5d4e]" placeholder="Street name, landmark, house number..."></textarea>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-2">City</label>
                    <input type="text" required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-5 text-sm outline-none focus:ring-1 focus:ring-[#4a5d4e]" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-2">State</label>
                    <input type="text" required value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-5 text-sm outline-none focus:ring-1 focus:ring-[#4a5d4e]" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-2">PIN / ZIP</label>
                    <input type="text" required value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-5 text-sm outline-none focus:ring-1 focus:ring-[#4a5d4e]" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-[#1a2323] text-white py-6 rounded-2xl font-bold hover:shadow-2xl transition-all uppercase tracking-widest text-[11px]">
                  Confirm Address & Continue
                </button>
              </form>
            ) : (
              <div className="bg-white rounded-[4rem] shadow-2xl border border-gray-50 overflow-hidden animate-slideUp">
                <div className="bg-[#1a2323] p-10 text-white flex justify-between items-center border-b border-white/5">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-[#1a2323] text-2xl font-bold shadow-2xl">V</div>
                    <div>
                      <h3 className="font-bold text-2xl serif">Vanphal Farms</h3>
                      <p className="text-[10px] uppercase text-white/40 tracking-[0.3em]">Checkout Terminal</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/40 uppercase font-bold tracking-widest mb-1">Payable Now</p>
                    <p className="text-3xl font-bold serif text-[#8b5e3c]">₹{finalTotal}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-12 min-h-[500px]">
                  <div className="md:col-span-4 bg-gray-50/50 p-8 space-y-3 border-r border-gray-50">
                    {['upi', 'card', 'nb', 'wallet'].map(m => (
                      <button 
                        key={m}
                        onClick={() => setSelectedMethod(m as any)}
                        className={`w-full flex items-center gap-5 px-6 py-5 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all text-left ${selectedMethod === m ? 'bg-white shadow-xl text-[#4a5d4e]' : 'text-gray-400 hover:bg-white/50'}`}
                      >
                        {m.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  <div className="md:col-span-8 p-12 flex flex-col justify-center">
                    <div className="max-w-sm mx-auto w-full">
                       <p className="text-center text-gray-400 text-sm mb-12 italic leading-relaxed">
                         Secured payment processing. You are paying for handcrafted Himalayan preserves.
                       </p>
                      <button 
                        onClick={finalizePayment}
                        disabled={loading}
                        className="w-full bg-[#1a2323] text-white py-6 rounded-2xl font-bold hover:shadow-2xl transition-all active:scale-95 disabled:opacity-50"
                      >
                        {loading ? 'Validating Transaction...' : `Pay ₹${finalTotal}`}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-4 space-y-10">
            <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold serif mb-10">Order Detail</h3>
              <div className="space-y-6 mb-10 max-h-[40vh] overflow-y-auto scroll-hide">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <p className="font-bold text-[#2d3a3a]">{item.name} (x{item.quantity})</p>
                    <span className="font-bold serif">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Coupon Section */}
              <div className="border-t border-gray-100 pt-8 mb-8">
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-3">Voucher Redemption</p>
                  <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={couponCode} 
                        onChange={e => setCouponCode(e.target.value)} 
                        placeholder="SPRING25"
                        className="flex-grow bg-gray-50 rounded-xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-[#4a5d4e]"
                      />
                      <button 
                        onClick={applyCoupon}
                        className="bg-[#4a5d4e] text-white px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#3a4d3e]"
                      >
                        Apply
                      </button>
                  </div>
              </div>

              <div className="border-t border-gray-100 pt-10 space-y-4">
                <div className="flex justify-between text-gray-400 text-xs font-bold uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>₹{cartTotal}</span>
                </div>
                {appliedOffer && (
                    <div className="flex justify-between text-orange-600 text-xs font-bold uppercase tracking-widest">
                        <span>Voucher ({appliedOffer.code})</span>
                        <span>-₹{appliedOffer.discountCalculated}</span>
                    </div>
                )}
                <div className="flex justify-between text-green-500 text-xs font-bold uppercase tracking-widest">
                  <span>Himalayan Logistics</span>
                  <span>FREE</span>
                </div>
                <div className="flex justify-between font-bold text-3xl pt-6 text-[#4a5d4e] serif">
                  <span>Total</span>
                  <span>₹{finalTotal}</span>
                </div>
              </div>
            </div>
            
            <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
               <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-2">Delivery Note</p>
               <p className="text-xs text-gray-500 leading-relaxed italic">Your order will be shipped within 48 hours of harvest confirmation.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
