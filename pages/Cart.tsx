
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ICONS } from '../constants';

const Cart: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckoutClick = () => {
    if (!user) {
      // Prompt user to log in before proceeding
      navigate('/login', { state: { from: '/checkout' } });
    } else {
      navigate('/checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="pt-48 pb-24 text-center">
        <div className="max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 text-gray-200 border border-gray-100">
            <ICONS.Cart />
          </div>
          <h1 className="text-5xl font-bold serif mb-6">Basket is Empty</h1>
          <p className="text-gray-400 mb-12 leading-relaxed">Our mountain orchards are full of fruit. Start exploring our organic collection to find your favorite.</p>
          <Link 
            to="/shop" 
            className="inline-block bg-[#1a2323] text-white px-12 py-5 rounded-[2rem] font-bold hover:shadow-2xl transition-all uppercase tracking-widest text-[11px]"
          >
            Explore the Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-24 bg-[#fcfbf7] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h1 className="text-5xl font-bold serif">Shopping Basket</h1>
              <p className="text-gray-400 text-sm mt-2 font-light">Prepare your handcrafted treasures for dispatch.</p>
            </div>
            <Link to="/shop" className="text-[10px] font-bold uppercase tracking-widest text-[#4a5d4e] border-b-2 border-[#4a5d4e]/10 hover:border-[#4a5d4e] pb-1 transition-all">Keep Browsing</Link>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-20">
          <div className="lg:col-span-2 space-y-10">
            {cartItems.map((item) => (
              <div key={item.id} className="group flex flex-col sm:flex-row gap-8 pb-10 border-b border-gray-100 animate-fadeIn">
                <div className="w-full sm:w-40 aspect-square rounded-[2.5rem] overflow-hidden bg-white shrink-0 shadow-sm group-hover:shadow-xl transition-all duration-700 border border-gray-50">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                </div>
                <div className="flex-grow flex flex-col justify-between pt-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold mb-2 serif group-hover:text-[#4a5d4e] transition-colors">{item.name}</h3>
                      <div className="flex items-center gap-3">
                        {/* Fix: 'category' does not exist on type 'CartItem'. Accessing the first element of 'categories' array. */}
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest bg-gray-50 px-3 py-1 rounded-full">{item.categories?.[0] || 'Artisanal'}</span>
                        <span className="text-[10px] text-[#8b5e3c] font-bold uppercase tracking-widest">₹{item.price} per unit</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-200 hover:text-red-400 transition-all p-2 hover:bg-red-50 rounded-xl"
                      title="Remove from Basket"
                    >
                      <ICONS.Close />
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center mt-8">
                    <div className="flex items-center border border-gray-100 rounded-2xl bg-white p-1">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-50 rounded-xl transition-all"
                      >-</button>
                      <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-50 rounded-xl transition-all"
                      >+</button>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] uppercase font-bold text-gray-300 tracking-widest mb-1">Item Total</p>
                       <span className="font-bold text-2xl serif text-[#4a5d4e]">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-gray-50 sticky top-32">
              <h2 className="text-2xl font-bold serif mb-10 text-[#2d3a3a]">Order Summary</h2>
              <div className="space-y-6 mb-10">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-medium">Subtotal</span>
                  <span className="font-bold">₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-medium">Mountain Shipping</span>
                  <span className="text-green-500 font-bold uppercase text-[10px] tracking-widest">FREE</span>
                </div>
                <div className="border-t border-gray-50 pt-8 flex justify-between items-end">
                  <div>
                     <p className="text-[10px] uppercase font-bold text-gray-300 tracking-widest mb-1">Grand Total</p>
                     <span className="font-bold text-4xl serif text-[#4a5d4e]">₹{cartTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={handleCheckoutClick}
                className="w-full bg-[#1a2323] text-white py-6 rounded-[2rem] font-bold hover:shadow-2xl hover:-translate-y-1 transition-all uppercase tracking-widest text-[11px] mb-6"
              >
                Proceed to Checkout
              </button>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-[9px] text-gray-400 uppercase tracking-widest font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                  Eco-friendly Packaging
                </div>
                <div className="flex items-center gap-3 text-[9px] text-gray-400 uppercase tracking-widest font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                  Secured Transaction
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
