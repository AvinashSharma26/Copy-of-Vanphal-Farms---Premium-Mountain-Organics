
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ICONS } from '../constants';
import { FAQSection } from '../components/FAQSection';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

const Home: React.FC = () => {
  const { products, offers, categories: allRegistered, settings } = useData();
  const [showOffer, setShowOffer] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [qvQuantity, setQvQuantity] = useState(1);
  const [currentHeroIdx, setCurrentHeroIdx] = useState(0);
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

  useEffect(() => {
    if (settings.heroImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentHeroIdx((prev) => (prev + 1) % settings.heroImages.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [settings.heroImages]);

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
      const scrollAmount = clientWidth * 0.8;
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
      {/* Optimized Compact Hero Section */}
      <section className="relative min-h-[60vh] lg:min-h-[75vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {settings.heroImages.map((img, idx) => (
            <img 
              key={idx}
              src={img} 
              alt={`Hero ${idx}`} 
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                idx === currentHeroIdx ? 'opacity-100' : 'opacity-0'
              } brightness-[0.92] scale-105 animate-slowZoom`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-[#fcfbf7] via-[#fcfbf7]/50 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto w-full px-6 lg:px-12 relative z-10 grid lg:grid-cols-2 gap-4 lg:gap-12 items-center">
          <div className="pt-20 pb-6 lg:pt-0 lg:pb-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md shadow-md text-[#4a5d4e] text-[7px] sm:text-[8px] uppercase font-bold tracking-[0.2em] mb-4 border border-white animate-fadeInUp">
              <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></span>
              2024 Himalayan Harvest
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-5 leading-[1.0] serif tracking-tight animate-fadeInUp delay-100">
              Nature’s <br />
              <span className="italic font-light text-[#8b5e3c] block mt-0.5">Purest Gift.</span>
            </h1>
            
            <p className="text-sm sm:text-base text-gray-600/90 mb-6 sm:mb-8 max-w-sm font-light leading-relaxed animate-fadeInUp delay-200">
              Small-batch preserves, handcrafted at 7,500ft. No chemicals, just mountain sun and air.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 animate-fadeInUp delay-300">
              <Link to="/shop" className="group bg-[#1a2323] text-white px-7 sm:px-9 py-2.5 sm:py-3.5 rounded-[1.5rem] font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2.5 uppercase tracking-[0.12em] text-[8px] sm:text-[9px]">
                Shop Batch
                <ICONS.ArrowRight />
              </Link>
              <Link to="/story" className="bg-white/50 backdrop-blur-md text-gray-800 border border-gray-200 px-7 sm:px-9 py-2.5 sm:py-3.5 rounded-[1.5rem] font-bold hover:bg-white transition-all text-center uppercase tracking-[0.12em] text-[8px] sm:text-[9px]">
                Our Story
              </Link>
            </div>

            <div className="mt-8 sm:mt-10 lg:mt-12 grid grid-cols-3 gap-4 sm:gap-6 animate-fadeInUp delay-400 opacity-60">
              <div>
                <p className="text-base sm:text-lg font-bold serif text-[#4a5d4e]">100%</p>
                <p className="text-[6px] sm:text-[7px] uppercase font-bold tracking-widest text-gray-400">Organic</p>
              </div>
              <div>
                <p className="text-base sm:text-lg font-bold serif text-[#4a5d4e]">7.5k</p>
                <p className="text-[6px] sm:text-[7px] uppercase font-bold tracking-widest text-gray-400">Altitude</p>
              </div>
              <div>
                <p className="text-base sm:text-lg font-bold serif text-[#4a5d4e]">0</p>
                <p className="text-[6px] sm:text-[7px] uppercase font-bold tracking-widest text-gray-400">Chemicals</p>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative z-10 animate-float">
               <div className="aspect-[4/5] max-w-[320px] ml-auto rounded-[2.5rem] overflow-hidden shadow-xl border-[6px] border-white/40 backdrop-blur-sm">
                  <img src="https://images.unsplash.com/photo-1511497584788-8767fe771d85?auto=format&fit=crop&q=80&w=1200" alt="Mountain View" className="w-full h-full object-cover" />
               </div>
            </div>
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#8b5e3c]/5 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-12 -right-12 w-36 h-36 bg-[#4a5d4e]/5 rounded-full blur-2xl animate-pulse delay-700"></div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section - Tightened */}
      <section className="py-12 sm:py-16 lg:py-20 bg-[#1a2323] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="space-y-6">
               <div>
                  <span className="text-[#8b5e3c] text-[9px] font-bold uppercase tracking-[0.25em] mb-2 block">Purpose & Legacy</span>
                  <h2 className="text-3xl lg:text-4xl font-bold serif text-white leading-tight">Rooted in <br /> Authenticity.</h2>
               </div>
               <div className="space-y-6">
                  <div className="flex gap-5 group">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#8b5e3c] transition-all duration-500">
                      <span className="text-lg">🌱</span>
                    </div>
                    <div>
                      <h4 className="text-base font-bold serif text-white mb-1">Brand Mission</h4>
                      <p className="text-xs text-white/60 leading-relaxed font-light">Wild-harvested mountain products rooted in authenticity and sustainability.</p>
                    </div>
                  </div>
                  <div className="flex gap-5 group">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#4a5d4e] transition-all duration-500">
                      <span className="text-lg">🏔️</span>
                    </div>
                    <div>
                      <h4 className="text-base font-bold serif text-white mb-1">Brand Vision</h4>
                      <p className="text-xs text-white/60 leading-relaxed font-light">To become India’s most trusted brand for pure, ethical mountain-origin food.</p>
                    </div>
                  </div>
               </div>
            </div>
            <div className="relative">
              <div className="aspect-video lg:aspect-[4/3] max-w-sm mx-auto rounded-[2rem] overflow-hidden border-[8px] border-white/5">
                <img src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover" alt="Himachal Landscape" />
              </div>
              <div className="absolute -bottom-4 -left-4 sm:-left-6 bg-white p-4 sm:p-6 rounded-[1.5rem] shadow-lg max-w-[180px]">
                 <p className="text-[8px] uppercase font-bold text-[#8b5e3c] tracking-widest mb-1">Our Promise</p>
                 <p className="text-[11px] font-bold text-[#2d3a3a] leading-tight">Heritage crafting from Himachal.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collection Section - Tightened */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white rounded-t-[2.5rem] sm:rounded-t-[3rem] relative z-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row justify-between items-end mb-8 sm:mb-10 gap-4">
            <div className="max-w-md w-full">
              <span className="text-[#8b5e3c] text-[9px] font-bold uppercase tracking-[0.25em] mb-2 block">The Seasonal Edit</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold serif leading-[1.1]">The Village Harvest</h2>
            </div>
            <Link to="/shop" className="group text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 hover:text-[#4a5d4e] transition-colors pb-1 border-b-2 border-[#4a5d4e]/10">View Harvest <ICONS.ArrowRight /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
            {products.slice(0, 3).map((product) => (
              <div key={product.id} className="group relative">
                <div className="relative aspect-[4/5] rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden bg-gray-50 mb-3 sm:mb-4 border border-gray-50 transition-all hover:shadow-lg">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" />
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none group-hover:pointer-events-auto">
                    <button onClick={() => setQuickViewProduct(product)} className="bg-white/90 backdrop-blur-md text-[#1a2323] px-4 sm:px-5 py-2 rounded-xl font-bold text-[7px] sm:text-[8px] uppercase tracking-widest hover:bg-[#1a2323] hover:text-white transition-all transform translate-y-2 group-hover:translate-y-0 shadow-md">Quick View</button>
                  </div>
                </div>
                <Link to={`/product/${product.id}`} className="block px-1">
                  <h3 className="text-base sm:text-lg font-bold serif mb-0.5 group-hover:text-[#4a5d4e] transition-colors">{product.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-bold serif text-[#4a5d4e]">₹{product.price}</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore Section - Tightened */}
      <section className="py-12 sm:py-16 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold serif mb-4 sm:mb-6 text-[#2d3a3a]">Explore Our Preserves</h2>
            <div className="flex flex-wrap justify-center gap-2 mb-4 sm:mb-8">
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-[7px] sm:text-[8px] font-bold uppercase tracking-widest border transition-all ${activeCategory === cat ? 'bg-[#4a5d4e] text-white border-[#4a5d4e] shadow-sm' : 'bg-white text-gray-400 border-gray-100 hover:border-[#4a5d4e]/10'}`}>{cat}</button>
              ))}
            </div>
          </div>
          <div className="relative group/slider-container">
            <button 
              onClick={() => scrollSlider('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-full shadow-md flex items-center justify-center text-[#4a5d4e] lg:opacity-0 lg:group-hover/slider-container:opacity-100 lg:group-hover/slider-container:translate-x-2 transition-all duration-500 border border-gray-100"
              aria-label="Scroll Left"
            >
              <ICONS.ArrowLeft />
            </button>
            <div ref={sliderRef} className="flex gap-4 sm:gap-5 overflow-x-auto scroll-hide snap-x snap-mandatory pb-6 px-1" style={{ scrollBehavior: 'smooth' }}>
              {filteredProducts.map(product => (
                <div key={product.id} className="min-w-[200px] sm:min-w-[280px] snap-center bg-white p-3 sm:p-4 rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group/item">
                  <div className="relative aspect-square rounded-[1.2rem] sm:rounded-[1.5rem] overflow-hidden mb-3 bg-gray-50 group">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110" />
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={(e) => { e.preventDefault(); setQuickViewProduct(product); }} className="bg-white/95 backdrop-blur-md text-[#1a2323] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-[6px] sm:text-[7px] uppercase tracking-widest hover:bg-[#1a2323] hover:text-white transition-all transform translate-y-1 group-hover:translate-y-0">Quick View</button>
                    </div>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold serif mb-0.5">{product.name}</h4>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm font-bold text-[#4a5d4e]">₹{product.price}</span>
                    <Link to={`/product/${product.id}`} className="text-[#8b5e3c] text-[7px] sm:text-[8px] font-bold uppercase tracking-widest hover:underline">Details</Link>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => scrollSlider('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-full shadow-md flex items-center justify-center text-[#4a5d4e] lg:opacity-0 lg:group-hover/slider-container:opacity-100 lg:group-hover/slider-container:-translate-x-2 transition-all duration-500 border border-gray-100"
              aria-label="Scroll Right"
            >
              <ICONS.ArrowRight />
            </button>
          </div>
        </div>
      </section>

      <FAQSection />

      {/* Quick View Modal - Even Tighter */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-[2rem] overflow-hidden shadow-2xl relative flex flex-col md:flex-row animate-slideUp max-h-[80vh] overflow-y-auto sm:overflow-visible">
            <button onClick={() => setQuickViewProduct(null)} className="absolute top-4 right-4 z-10 p-1.5 bg-white/50 backdrop-blur-md rounded-full text-gray-500 hover:text-black transition-colors"><ICONS.Close /></button>
            <div className="md:w-5/12 aspect-square md:aspect-auto">
              <img src={quickViewProduct.image} className="w-full h-full object-cover" alt={quickViewProduct.name} />
            </div>
            <div className="md:w-7/12 p-6 sm:p-8 flex flex-col justify-center">
              <span className="text-[#8b5e3c] text-[7px] sm:text-[8px] uppercase font-bold tracking-[0.3em] mb-1.5 sm:mb-2 block">Quick Preview</span>
              <h3 className="text-xl sm:text-2xl font-bold serif mb-1.5 sm:mb-2 leading-tight">{quickViewProduct.name}</h3>
              <p className="text-base sm:text-lg font-bold serif text-[#4a5d4e] mb-2 sm:mb-3">₹{quickViewProduct.price}</p>
              <p className="text-gray-500 mb-4 sm:mb-6 text-[11px] leading-relaxed line-clamp-3">{quickViewProduct.description}</p>
              
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-gray-50 rounded-lg overflow-hidden p-0.5">
                    <button onClick={() => setQvQuantity(q => Math.max(1, q - 1))} className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-gray-400 hover:text-black font-bold">-</button>
                    <span className="w-6 sm:w-8 text-center font-bold text-[11px] sm:text-xs">{qvQuantity}</span>
                    <button onClick={() => setQvQuantity(q => q + 1)} className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-gray-400 hover:text-black font-bold">+</button>
                  </div>
                  <button onClick={handleQuickViewAdd} disabled={quickViewProduct.stock === 0} className="flex-grow bg-[#1a2323] text-white py-2 sm:py-3 rounded-lg font-bold uppercase tracking-widest text-[7px] sm:text-[8px] hover:shadow-lg transition-all disabled:opacity-50">
                    {quickViewProduct.stock === 0 ? 'Out of Stock' : 'Add to Basket'}
                  </button>
                </div>
                <Link to={`/product/${quickViewProduct.id}`} onClick={() => setQuickViewProduct(null)} className="text-center text-[7px] uppercase font-bold tracking-widest text-gray-400 hover:text-[#4a5d4e] transition-colors">Full Story</Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {showOffer && activeOffer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-xl rounded-[2rem] overflow-hidden shadow-2xl relative flex flex-col md:flex-row animate-slideUp">
            <div className="md:w-5/12 relative h-32 sm:h-40 md:h-auto"><img src={activeOffer.bannerImage} className="w-full h-full object-cover" /></div>
            <div className="md:w-7/12 p-6 sm:p-8 flex flex-col justify-center">
              <button onClick={closeOffer} className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"><ICONS.Close /></button>
              <h3 className="text-xl sm:text-2xl font-bold serif mb-2 leading-tight">{activeOffer.title}</h3>
              <p className="text-gray-500 mb-4 leading-relaxed text-[11px]">{activeOffer.description}</p>
              <div className="bg-gray-50 border border-dashed border-gray-200 p-3 rounded-lg mb-5 flex justify-between items-center">
                <div><p className="text-sm font-bold text-[#4a5d4e] tracking-widest font-mono">{activeOffer.code}</p></div>
                <div className="text-xl font-bold serif text-[#8b5e3c]">-{activeOffer.discount}%</div>
              </div>
              <Link to="/shop" onClick={closeOffer} className="w-full bg-[#1a2323] text-white py-3 rounded-lg font-bold text-center uppercase tracking-widest text-[8px] sm:text-[9px] shadow-md hover:shadow-lg transition-all">Claim Offer</Link>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        @keyframes slowZoom { from { transform: scale(1); } to { transform: scale(1.05); } }
        .animate-slowZoom { animation: slowZoom 30s ease-out forwards; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeInUp { animation: fadeInUp 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards; opacity: 0; }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-slideUp { animation: slideUp 0.5s ease-out; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .scroll-hide::-webkit-scrollbar { display: none; }
        .scroll-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Home;
