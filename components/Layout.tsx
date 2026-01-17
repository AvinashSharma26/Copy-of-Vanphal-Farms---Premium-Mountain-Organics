
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ICONS, PRODUCTS } from '../constants';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const { cartItems } = useCart();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "Search Organic Products...",
    "Try 'Green Apple Jam'...",
    "Looking for 'Apricot Preserves'?",
    "Find 'Spiced Chutneys'...",
    "Pure 'Mountain Berry' Jams..."
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % suggestions.length);
    }, 4000);
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Our Story', path: '/story' },
    { name: 'Contact Us', path: '/contact' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchFocused(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const searchResults = searchQuery.trim() 
    ? PRODUCTS.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  const headerClasses = isScrolled 
    ? 'bg-white/80 backdrop-blur-xl shadow-md py-2.5' 
    : 'bg-white/20 backdrop-blur-md py-4 border-b border-black/5';

  const textClasses = 'text-[#2d3a3a]'; 
  const inputBg = isScrolled ? 'bg-gray-100' : 'bg-black/5';

  return (
    <div className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <header className={`${headerClasses} transition-all duration-500`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between gap-8">
          <Link to="/" className={`text-xl font-bold serif shrink-0 tracking-tight ${textClasses}`}>
            Vanphal Farms
          </Link>
          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                className={`text-[10px] uppercase tracking-[0.2em] font-bold hover:text-[#4a5d4e] transition-all relative group ${
                  location.pathname === link.path ? 'text-[#4a5d4e]' : textClasses
                }`}
              >
                {link.name}
                <span className={`absolute -bottom-2 left-0 w-0 h-0.5 bg-[#4a5d4e] transition-all duration-300 group-hover:w-full ${location.pathname === link.path ? 'w-full' : ''}`}></span>
              </Link>
            ))}
          </nav>
          <div ref={searchRef} className="hidden md:flex flex-grow max-w-sm relative">
            <form onSubmit={handleSearch} className="w-full relative">
              <input 
                type="text"
                placeholder={suggestions[placeholderIndex]}
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full border-none rounded-xl py-2 px-5 text-xs outline-none transition-all duration-300 ${inputBg} text-gray-800 placeholder-gray-500`}
              />
              <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                <ICONS.Search />
              </button>
            </form>
            {isSearchFocused && searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fadeIn text-gray-800">
                <div className="p-3">
                  <p className="px-3 py-2 text-[9px] uppercase font-bold text-gray-400 tracking-widest">Related Products</p>
                  {searchResults.length > 0 ? (
                    searchResults.map((product) => (
                      <Link 
                        key={product.id} 
                        to={`/product/${product.id}`}
                        onClick={() => setIsSearchFocused(false)}
                        className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-xl transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                          <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                        </div>
                        <div>
                          <p className="text-xs font-bold group-hover:text-[#4a5d4e]">{product.name}</p>
                          <p className="text-[10px] text-gray-400">₹{product.price}</p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-400 text-xs italic">No matches found.</div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-6">
            <Link to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login'} className={`transition-opacity hover:opacity-60 ${textClasses}`}>
              <ICONS.User />
            </Link>
            <Link to="/cart" className={`relative transition-opacity hover:opacity-60 ${textClasses}`}>
              <ICONS.Cart />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#8b5e3c] text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>
            {user && (
              <button onClick={handleLogout} className={`transition-opacity hover:opacity-60 ${textClasses}`}>
                <ICONS.Logout />
              </button>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};

const Footer: React.FC = () => (
  <footer className="bg-[#1a2323] text-white pt-20 pb-10">
    <div className="max-w-7xl mx-auto px-6 lg:px-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        <div className="space-y-6">
          <h3 className="text-xl font-bold serif">Vanphal Farms</h3>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            Bringing the authentic, unadulterated taste of Himalayan orchards to modern homes. Pure, organic, and rooted in tradition.
          </p>
          <div className="flex gap-3">
            <a href="#" className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-sm hover:bg-white hover:text-black transition-all cursor-pointer">
              <ICONS.Instagram />
            </a>
            <a href="#" className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-sm hover:bg-white hover:text-black transition-all cursor-pointer">
              <ICONS.Facebook />
            </a>
            <a href="#" className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-sm hover:bg-white hover:text-black transition-all cursor-pointer">
              <ICONS.Twitter />
            </a>
          </div>
        </div>
        <div>
          <h4 className="font-bold text-[10px] uppercase tracking-[0.2em] mb-6 text-white/40">The Collection</h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li><Link to="/shop" className="hover:text-white transition-colors">Artisanal Jams</Link></li>
            <li><Link to="/shop" className="hover:text-white transition-colors">Fruit Preserves</Link></li>
            <li><Link to="/shop" className="hover:text-white transition-colors">Seasonal Chutneys</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-[10px] uppercase tracking-[0.2em] mb-6 text-white/40">Information</h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li><Link to="/story" className="hover:text-white transition-colors">Our Story</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            <li><Link to="/shipping-policy" className="hover:text-white transition-colors">Shipping & Refund</Link></li>
            <li><Link to="/terms-conditions" className="hover:text-white transition-colors">Terms of Service</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-[10px] uppercase tracking-[0.2em] mb-6 text-white/40">Dispatch List</h4>
          <p className="text-xs text-gray-400 mb-5">Join for seasonal updates from the hills.</p>
          <form className="relative" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Your email address" 
              className="w-full bg-white/5 border border-white/10 px-4 py-3 text-xs rounded-xl focus:outline-none focus:border-white/40 transition-colors"
            />
            <button className="absolute right-1.5 top-1.5 bottom-1.5 bg-white text-black px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors">
              Join
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
        <p>&copy; 2026 Vanphal Farms. All Rights Reserved.</p>
        <div className="flex gap-8">
          <span>Himachal, India</span>
          <span>Crafted in the Wilderness</span>
        </div>
      </div>
    </div>
  </footer>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col selection:bg-[#4a5d4e] selection:text-white">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};
