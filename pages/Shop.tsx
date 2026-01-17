
import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ICONS } from '../constants';

const Shop: React.FC = () => {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const { products, categories: allRegistered } = useData();
  
  const [searchQuery, setSearchQuery] = useState(q);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Featured');
  const [priceRange, setPriceRange] = useState(1000);

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
                <Link key={product.id} to={`/product/${product.id}`} className={`group block ${product.status === 'out-of-stock' ? 'opacity-75' : ''}`}>
                  <div className="relative aspect-[4/5] overflow-hidden bg-white mb-6 rounded-[3rem] border border-gray-50 transition-all duration-700 hover:shadow-2xl hover:-translate-y-2">
                    <img src={product.image} alt={product.name} className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 ${product.status === 'out-of-stock' ? 'grayscale' : ''}`} />
                    {product.discountPercentage && <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[#8b5e3c] text-[10px] font-bold uppercase tracking-widest shadow-lg">{product.discountPercentage}% OFF</div>}
                  </div>
                  <div className="px-4">
                    <h3 className="text-xl font-bold serif mb-1 group-hover:text-[#4a5d4e] transition-colors">{product.name}</h3>
                    <div className="flex flex-wrap gap-1 mb-3">
                       {(product.categories || []).map(cat => (
                         <span key={cat} className="text-[8px] text-gray-400 uppercase tracking-widest font-bold bg-gray-50 px-2 py-0.5 rounded">{cat}</span>
                       ))}
                    </div>
                    <span className="text-xl font-bold text-[#4a5d4e]">₹{product.price}</span>
                  </div>
                </Link>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Shop;
