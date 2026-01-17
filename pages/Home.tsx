
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ICONS } from '../constants';
import { FAQSection } from '../components/FAQSection';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

const Home: React.FC = () => {
  const { products, offers, categories: allRegistered } = useData();
  const [showOffer, setShowOffer] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [qvQuantity, setQvQuantity] = useState(1);
  const activeOffer = offers.find(o => o.isActive);
  const sliderRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();

  const categories = useMemo(() => ['All', ...allRegistered], [allRegistered]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const dismissed = sessionStorage.getItem('vanphal_offer_dismissed');
      if (!dismissed && activeOffer) {
        setShowOffer(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [activeOffer]);

  const closeOffer = () => {
    setShowOffer(false);
    sessionStorage.setItem('vanphal_offer_dismissed', 'true');
  };

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => (p.categories || []).includes(activeCategory));

  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const { scrollLeft, clientWidth } = sliderRef.current;
      const scrollAmount = clientWidth * 0.8; // Scroll 80% of view for smooth overlap
      const scrollTo = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      sliderRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const handleQuickViewAdd = () => {
    if (quickViewProduct) {
      addToCart(quickViewProduct, qvQuantity);
      setQuickViewProduct(null);
      setQvQuantity(1);
    }
  };

  return (
    <div className="overflow-hidden bg-[#fcfbf7]">
      {/* Redesigned Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Layers */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2000" 
            alt="Mountain Backdrop" 
            className="w-full h-full object-cover brightness-[0.95] scale-105 animate-slowZoom"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#fcfbf7] via-[#fcfbf7]/60 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto w-full px-6 lg:px-12 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div className="pt-20 lg:pt-0">
            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/80 backdrop-blur-md shadow-2xl shadow-black/5 text-[#4a5d4e] text-[10px] uppercase font-bold tracking-[0.3em] mb-8 border border-white animate-fadeInUp">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              The 2024 Himalayan Harvest
            </div>
            
            <h1 className="text-7xl md:text-9xl font-bold mb-8 leading-[0.9] serif tracking-tight animate-fadeInUp delay-100">
              Nature’s <br />
              <span className="italic font-light text-[#8b5e3c] block mt-2">Purest Gift.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600/90 mb-12 max-w-lg font-light leading-relaxed animate-fadeInUp delay-200">
              Small-batch preserves, handcrafted at 7,500ft using heritage copper-kettle methods. No chemicals, just mountain sun and mountain air.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 animate-fadeInUp delay-300">
              <Link to="/shop" className="group bg-[#1a2323] text-white px-14 py-6 rounded-[2.5rem] font-bold hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:-translate-y-1 transition-all flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-[11px]">
                Shop the Batch
                <ICONS.ArrowRight />
              </Link>
              <Link to="/story" className="bg-white/50 backdrop-blur-md text-gray-800 border border-gray-200 px-14 py-6 rounded-[2.5rem] font-bold hover:bg-white transition-all text-center uppercase tracking-[0.2em] text-[11px]">
                Our Story
              </Link>
            </div>

            <div className="mt-20 grid grid-cols-3 gap-8 animate-fadeInUp delay-400 opacity-60">
              <div>
                <p className="text-2xl font-bold serif text-[#4a5d4e]">100%</p>
                <p className="text-[9px] uppercase font-bold tracking-widest text-gray-400">Organic</p>
              </div>
              <div>
                <p className="text-2xl font-bold serif text-[#4a5d4e]">7.5k</p>
                <p className="text-[9px] uppercase font-bold tracking-widest text-gray-400">Altitude</p>
              </div>
              <div>
                <p className="text-2xl font-bold serif text-[#4a5d4e]">0</p>
                <p className="text-[9px] uppercase font-bold tracking-widest text-gray-400">Chemicals</p>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative z-10 animate-float">
               <div className="aspect-[4/5] rounded-[5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.15)] border-[12px] border-white/40 backdrop-blur-sm">
                  <img src="https://images.unsplash.com/photo-1511497584788-8767fe771d85?auto=format&fit=crop&q=80&w=1200" alt="Mountain View" className="w-full h-full object-cover" />
               </div>
               
               {products.length > 0 && (
                 <div className="absolute -bottom-16 -right-16 bg-white/95 backdrop-blur-2xl p-8 rounded-[4rem] shadow-[0_30px_60px_rgba(0,0,0,0.1)] border border-white/50 max-w-[320px] animate-slideLeft">
                    <div className="relative group cursor-pointer mb-6" onClick={() => setQuickViewProduct(products[0])}>
                      <div className="aspect-square rounded-[3rem] overflow-hidden shadow-inner">
                        <img src={products[0].image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={products[0].name} />
                      </div>
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[3rem]">
                        <span className="bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-xl">Details</span>
                      </div>
                    </div>
                    <div className="px-2">
                      <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8b5e3c] mb-2">Featured Selection</p>
                      <h4 className="font-bold serif text-3xl mb-4 text-[#2d3a3a] leading-tight">{products[0].name}</h4>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-3xl serif text-[#4a5d4e]">₹{products[0].price}</span>
                        <Link to={`/product/${products[0].id}`} className="bg-[#4a5d4e] text-white p-4 rounded-[1.5rem] hover:scale-110 transition-transform shadow-xl"><ICONS.ArrowRight /></Link>
                      </div>
                    </div>
                 </div>
               )}
            </div>
            {/* Decorative Elements */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#8b5e3c]/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 -right-20 w-60 h-60 bg-[#4a5d4e]/5 rounded-full blur-3xl animate-pulse delay-700"></div>
          </div>
        </div>
      </section>

      <section className="py-40 bg-white rounded-t-[6rem] relative z-20 -mt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row justify-between items-end mb-24 gap-8">
            <div className="max-w-xl">
              <span className="text-[#8b5e3c] text-xs font-bold uppercase tracking-[0.4em] mb-6 block">The Seasonal Edit</span>
              <h2 className="text-5xl md:text-7xl font-bold serif leading-[1.1]">Direct From <br /> The Village Orchards</h2>
            </div>
            <Link to="/shop" className="group text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-3 hover:text-[#4a5d4e] transition-colors pb-2 border-b-2 border-[#4a5d4e]/10">View Complete Harvest <ICONS.ArrowRight /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
            {products.slice(0, 3).map((product) => (
              <div key={product.id} className="group relative">
                <div className="relative aspect-[4/5] rounded-[3.5rem] overflow-hidden bg-gray-50 mb-8 border border-gray-50 transition-all hover:shadow-2xl">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none group-hover:pointer-events-auto">
                    <button onClick={() => setQuickViewProduct(product)} className="bg-white/90 backdrop-blur-md text-[#1a2323] px-8 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#1a2323] hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 shadow-xl">Quick View</button>
                  </div>
                </div>
                <Link to={`/product/${product.id}`} className="block">
                  <h3 className="text-3xl font-bold serif mb-3 group-hover:text-[#4a5d4e] transition-colors">{product.name}</h3>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold serif">₹{product.price}</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold serif mb-10 text-[#2d3a3a]">Explore Our Preserves</h2>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${activeCategory === cat ? 'bg-[#4a5d4e] text-white border-[#4a5d4e] shadow-lg shadow-[#4a5d4e]/20' : 'bg-white text-gray-400 border-gray-100 hover:border-[#4a5d4e]/20'}`}>{cat}</button>
              ))}
            </div>
          </div>
          <div className="relative group/slider-container">
            {/* Left Scroll Button */}
            <button 
              onClick={() => scrollSlider('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-10 w-14 h-14 bg-white rounded-full shadow-2xl flex items-center justify-center text-[#4a5d4e] opacity-0 group-hover/slider-container:opacity-100 group-hover/slider-container:translate-x-4 transition-all duration-500 hover:bg-[#4a5d4e] hover:text-white border border-gray-100"
              aria-label="Scroll Left"
            >
              <ICONS.ArrowLeft />
            </button>

            <div ref={sliderRef} className="flex gap-8 overflow-x-auto scroll-hide snap-x snap-mandatory pb-10 px-4" style={{ scrollBehavior: 'smooth' }}>
              {filteredProducts.map(product => (
                <div key={product.id} className="min-w-[280px] md:min-w-[380px] snap-center bg-white p-6 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group/item">
                  <div className="relative aspect-square rounded-[2.5rem] overflow-hidden mb-6 bg-gray-50 group">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={(e) => { e.preventDefault(); setQuickViewProduct(product); }} className="bg-white/95 backdrop-blur-md text-[#1a2323] px-6 py-3 rounded-2xl font-bold text-[9px] uppercase tracking-widest hover:bg-[#1a2323] hover:text-white transition-all transform translate-y-2 group-hover:translate-y-0">Quick View</button>
                    </div>
                  </div>
                  <h4 className="text-xl font-bold serif mb-2">{product.name}</h4>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-[#4a5d4e]">₹{product.price}</span>
                    <Link to={`/product/${product.id}`} className="text-[#8b5e3c] text-[10px] font-bold uppercase tracking-widest hover:underline">Details</Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Scroll Button */}
            <button 
              onClick={() => scrollSlider('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-10 w-14 h-14 bg-white rounded-full shadow-2xl flex items-center justify-center text-[#4a5d4e] opacity-0 group-hover/slider-container:opacity-100 group-hover/slider-container:-translate-x-4 transition-all duration-500 hover:bg-[#4a5d4e] hover:text-white border border-gray-100"
              aria-label="Scroll Right"
            >
              <ICONS.ArrowRight />
            </button>
          </div>
        </div>
      </section>

      <FAQSection />

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-4xl rounded-[4rem] overflow-hidden shadow-2xl relative flex flex-col md:flex-row animate-slideUp">
            <button onClick={() => setQuickViewProduct(null)} className="absolute top-8 right-8 z-10 p-2 bg-white/50 backdrop-blur-md rounded-full text-gray-500 hover:text-black transition-colors"><ICONS.Close /></button>
            <div className="md:w-1/2 aspect-square md:aspect-auto">
              <img src={quickViewProduct.image} className="w-full h-full object-cover" alt={quickViewProduct.name} />
            </div>
            <div className="md:w-1/2 p-10 lg:p-16 flex flex-col justify-center">
              <span className="text-[#8b5e3c] text-[10px] uppercase font-bold tracking-[0.4em] mb-4 block">Quick Preview</span>
              <h3 className="text-4xl font-bold serif mb-4 leading-tight">{quickViewProduct.name}</h3>
              <p className="text-2xl font-bold serif text-[#4a5d4e] mb-6">₹{quickViewProduct.price}</p>
              <p className="text-gray-500 mb-10 text-sm font-light leading-relaxed line-clamp-3">{quickViewProduct.description}</p>
              
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-gray-50 rounded-2xl overflow-hidden p-1">
                    <button onClick={() => setQvQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-black font-bold">-</button>
                    <span className="w-10 text-center font-bold">{qvQuantity}</span>
                    <button onClick={() => setQvQuantity(q => q + 1)} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-black font-bold">+</button>
                  </div>
                  <button onClick={handleQuickViewAdd} disabled={quickViewProduct.stock === 0} className="flex-grow bg-[#1a2323] text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:shadow-2xl transition-all disabled:opacity-50">
                    {quickViewProduct.stock === 0 ? 'Out of Stock' : 'Add to Basket'}
                  </button>
                </div>
                <Link to={`/product/${quickViewProduct.id}`} onClick={() => setQuickViewProduct(null)} className="text-center text-[10px] uppercase font-bold tracking-widest text-gray-400 hover:text-[#4a5d4e] transition-colors">View Full Product Story</Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {showOffer && activeOffer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-3xl rounded-[4rem] overflow-hidden shadow-2xl relative flex flex-col md:flex-row animate-slideUp">
            <div className="md:w-1/2 relative h-64 md:h-auto"><img src={activeOffer.bannerImage} className="w-full h-full object-cover" /></div>
            <div className="md:w-1/2 p-12 flex flex-col justify-center">
              <button onClick={closeOffer} className="absolute top-8 right-8 text-gray-400 hover:text-black transition-colors"><ICONS.Close /></button>
              <h3 className="text-4xl font-bold serif mb-6 leading-tight">{activeOffer.title}</h3>
              <p className="text-gray-500 mb-10 leading-relaxed text-sm">{activeOffer.description}</p>
              <div className="bg-gray-50 border border-dashed border-gray-200 p-6 rounded-2xl mb-8 flex justify-between items-center">
                <div><p className="text-xl font-bold text-[#4a5d4e] tracking-widest font-mono">{activeOffer.code}</p></div>
                <div className="text-3xl font-bold serif text-[#8b5e3c]">-{activeOffer.discount}%</div>
              </div>
              <Link to="/shop" onClick={closeOffer} className="w-full bg-[#1a2323] text-white py-5 rounded-2xl font-bold text-center uppercase tracking-widest text-[11px] shadow-xl hover:shadow-2xl transition-all">Claim Offer</Link>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        
        @keyframes slowZoom { from { transform: scale(1); } to { transform: scale(1.1); } }
        .animate-slowZoom { animation: slowZoom 30s ease-out forwards; }

        @keyframes fadeInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeInUp { animation: fadeInUp 1s cubic-bezier(0.23, 1, 0.32, 1) forwards; opacity: 0; }
        
        @keyframes slideLeft { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
        .animate-slideLeft { animation: slideLeft 1.2s cubic-bezier(0.23, 1, 0.32, 1) forwards; opacity: 0; }

        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
        .delay-700 { animation-delay: 700ms; }

        .animate-slideRight { animation: slideRight 1s ease-out; }
        @keyframes slideRight { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
        
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        
        .animate-slideUp { animation: slideUp 0.5s ease-out; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        
        .scroll-hide::-webkit-scrollbar { display: none; }
        .scroll-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Home;
