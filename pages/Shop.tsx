
import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useCart } from '../context/CartContext';
import { ICONS } from '../constants';
import { Product } from '../types';

const Shop: React.FC = () => {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const { products, categories: allRegistered } = useData();
  const { addToCart } = useCart();
  
  const [searchQuery, setSearchQuery] = useState(q);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Featured');
  const [priceRange, setPriceRange] = useState(1000);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [qvQuantity, setQvQuantity] = useState(1);

  useEffect(() => {
    setSearchQuery(q);
  }, [q]);

  const categories = useMemo(() => ['All', ...allRegistered], [allRegistered]);

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || (p.categories || []).includes(selectedCategory);
      const matchesPrice = p.price <= priceRange;
      return matchesSearch && matchesCategory && matchesPrice;
    });

    if (sortBy === 'Price: Low to High') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'Price: High to Low') result.sort((a, b) => b.price - a.price);
    if (sortBy === 'Name: A-Z') result.sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [searchQuery, selectedCategory, sortBy, priceRange, products]);

  const handleQuickViewAdd = () => {
    if (quickViewProduct) {
      addToCart(quickViewProduct, qvQuantity);
      setQuickViewProduct(null);
      setQvQuantity(1);
    }
  };

  return (
    <div className="pt-32 lg:pt-44 pb-24 bg-[#fcfbf7] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          <aside className="w-full lg:w-72 shrink-0 space-y-12">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold serif">Store</h1>
              <p className="text-xs text-[#8b5e3c] uppercase tracking-[0.2em] font-bold">Nature's Own Preserves</p>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Categories</h4>
              <div className="flex flex-wrap lg:flex-col gap-3">
                {categories.map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)} className={`text-xs text-left px-5 py-3 rounded-xl transition-all border ${selectedCategory === cat ? 'bg-[#4a5d4e] text-white border-[#4a5d4e] font-bold shadow-lg shadow-[#4a5d4e]/10' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-6 p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Price Range</h4>
              <input type="range" min="0" max="1000" step="50" value={priceRange} onChange={(e) => setPriceRange(Number(e.target.value))} className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#4a5d4e]" />
              <div className="flex justify-between items-center font-bold text-xs text-gray-400 uppercase">
                <span>₹0</span>
                <span className="text-[#4a5d4e] font-bold">Max: ₹{priceRange}</span>
              </div>
            </div>
          </aside>

          <main className="flex-grow w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 bg-white/50 p-6 rounded-[2.5rem] border border-gray-100 backdrop-blur-sm">
              <span className="text-sm font-bold text-[#2d3a3a]">{filteredProducts.length} <span className="font-normal text-gray-400 ml-1">Items Found</span></span>
              <div className="flex items-center gap-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Sort</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent text-xs font-bold px-4 py-2 rounded-xl outline-none cursor-pointer">
                  <option>Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Name: A-Z</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">
              {filteredProducts.map((product) => (
                <div key={product.id} className={`group block ${product.status === 'out-of-stock' ? 'opacity-75' : ''}`}>
                  <div className="relative aspect-[4/5] overflow-hidden bg-white mb-6 rounded-[3rem] border border-gray-50 transition-all duration-700 hover:shadow-2xl hover:-translate-y-2">
                    <img src={product.image} alt={product.name} className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 ${product.status === 'out-of-stock' ? 'grayscale' : ''}`} />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none group-hover:pointer-events-auto">
                      <button onClick={() => setQuickViewProduct(product)} className="bg-white/95 backdrop-blur-md text-[#1a2323] px-6 py-3 rounded-2xl font-bold text-[9px] uppercase tracking-widest hover:bg-[#1a2323] hover:text-white transition-all transform translate-y-2 group-hover:translate-y-0 shadow-xl">Quick View</button>
                    </div>
                    {product.discountPercentage && <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[#8b5e3c] text-[10px] font-bold uppercase tracking-widest shadow-lg">{product.discountPercentage}% OFF</div>}
                  </div>
                  <Link to={`/product/${product.id}`} className="px-4 block">
                    <h3 className="text-xl font-bold serif mb-1 group-hover:text-[#4a5d4e] transition-colors">{product.name}</h3>
                    <div className="flex flex-wrap gap-1 mb-3">
                       {(product.categories || []).map(cat => (
                         <span key={cat} className="text-[8px] text-gray-400 uppercase tracking-widest font-bold bg-gray-50 px-2 py-0.5 rounded">{cat}</span>
                       ))}
                    </div>
                    <span className="text-xl font-bold text-[#4a5d4e]">₹{product.price}</span>
                  </Link>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>

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
                  <button onClick={handleQuickViewAdd} disabled={quickViewProduct.status === 'out-of-stock'} className="flex-grow bg-[#1a2323] text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:shadow-2xl transition-all disabled:opacity-50">
                    Add to Basket
                  </button>
                </div>
                <Link to={`/product/${quickViewProduct.id}`} onClick={() => setQuickViewProduct(null)} className="text-center text-[10px] uppercase font-bold tracking-widest text-gray-400 hover:text-[#4a5d4e] transition-colors">View Full Product Story</Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
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

export default Shop;
