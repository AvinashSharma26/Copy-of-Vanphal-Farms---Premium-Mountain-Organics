
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useCart } from '../context/CartContext';
import { ICONS } from '../constants';
import { generateRecipeSuggestions } from '../services/geminiService';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products } = useData();
  const product = products.find(p => p.id === id);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
  const [activeImage, setActiveImage] = useState(product?.image || '');

  useEffect(() => {
    if (product) {
      window.scrollTo(0, 0);
      setActiveImage(product.image);
      fetchRecipes();
    }
  }, [id, product]);

  const fetchRecipes = async () => {
    if (!product) return;
    setIsLoadingRecipes(true);
    const data = await generateRecipeSuggestions(product.name);
    if (data) setRecipes(data);
    setIsLoadingRecipes(false);
  };

  if (!product) {
    return (
      <div className="pt-40 text-center py-40 bg-[#fcfbf7] min-h-screen">
        <h2 className="text-3xl serif mb-6">Batch not found.</h2>
        <Link to="/shop" className="bg-[#4a5d4e] text-white px-10 py-4 rounded-xl font-bold">Back to Store</Link>
      </div>
    );
  }

  const allImages = [product.image, ...(product.images || [])].filter((v, i, a) => a.indexOf(v) === i).slice(0, 6);
  const relatedProducts = products.filter(p => 
    p.id !== product.id && 
    (p.categories || []).some(cat => (product.categories || []).includes(cat))
  ).slice(0, 3);

  return (
    <div className="pt-32 lg:pt-44 pb-24 bg-[#fcfbf7]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="mb-12">
          <button onClick={() => navigate(-1)} className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-[#4a5d4e] transition-all group">
            <ICONS.ArrowLeft /> Return to Collection
          </button>
        </div>

        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 mb-32">
          <div className="space-y-8">
            <div className="aspect-[4/5] rounded-[3.5rem] overflow-hidden bg-white shadow-2xl border border-gray-100 group relative">
              <img src={activeImage} alt={product.name} className="w-full h-full object-cover animate-fadeIn transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute top-8 left-8">
                <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3">
                   <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                   <span className="text-[10px] font-bold uppercase tracking-widest text-[#2d3a3a]">Fresh From 2024 Harvest</span>
                </div>
              </div>
            </div>
            {allImages.length > 1 && (
              <div className="grid grid-cols-6 gap-3">
                {allImages.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(img)} className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${activeImage === img ? 'border-[#4a5d4e] shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col pt-4">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="text-[9px] uppercase font-bold tracking-widest text-[#8b5e3c] bg-[#8b5e3c]/5 px-4 py-1.5 rounded-full border border-[#8b5e3c]/10">Artisanal Batch #{product.id}</span>
              <span className={`text-[9px] uppercase font-bold tracking-widest px-4 py-1.5 rounded-full border ${product.status === 'in-stock' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>{product.status === 'in-stock' ? 'Available' : 'Sold Out'}</span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-gray-500 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100">{product.weight} Net</span>
            </div>
            
            <h1 className="text-4xl lg:text-7xl font-bold serif mb-4 leading-tight text-[#2d3a3a]">{product.name}</h1>
            
            <div className="flex items-center gap-6 mb-8">
              <span className="text-4xl lg:text-5xl font-bold serif text-[#4a5d4e]">₹{product.price}</span>
              {product.discountPercentage && (
                <span className="text-lg text-gray-400 line-through">₹{Math.round(product.price * 100 / (100 - product.discountPercentage))}</span>
              )}
            </div>

            <div className="space-y-6 mb-10">
               <h4 className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#8b5e3c]">Sensory Profile</h4>
               <p className="text-xl text-gray-500 font-light leading-relaxed">{product.description}</p>
            </div>

            {/* Tasting Profile Section */}
            <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm mb-10 space-y-6">
              <h4 className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Flavor Complexity</h4>
              <div className="space-y-4">
                 <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase text-gray-500">
                       <span>Natural Sweetness</span>
                       <span>85%</span>
                    </div>
                    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                       <div className="h-full bg-[#8b5e3c]" style={{ width: '85%' }}></div>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase text-gray-500">
                       <span>Tart Acidity</span>
                       <span>45%</span>
                    </div>
                    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                       <div className="h-full bg-[#4a5d4e]" style={{ width: '45%' }}></div>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase text-gray-500">
                       <span>Fruit Texture</span>
                       <span>Chunk-Rich</span>
                    </div>
                    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                       <div className="h-full bg-[#2d3a3a]" style={{ width: '70%' }}></div>
                    </div>
                 </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 mb-12">
              <div className="flex items-center bg-white border border-gray-100 rounded-2xl overflow-hidden p-1 shadow-sm">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-black font-bold transition-colors">-</button>
                <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-black font-bold transition-colors">+</button>
              </div>
              <button 
                onClick={() => { addToCart(product, quantity); navigate('/cart'); }} 
                disabled={product.status === 'out-of-stock'} 
                className="w-full sm:flex-grow bg-[#1a2323] text-white py-5 px-10 rounded-2xl font-bold uppercase tracking-widest text-[11px] hover:shadow-2xl transition-all disabled:opacity-50"
              >
                {product.status === 'out-of-stock' ? 'Temporarily Unavailable' : 'Place in Basket'}
              </button>
            </div>

            <div className="border-t border-gray-100 pt-10 grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Purity Specs</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-xs font-bold text-gray-600"><span className="text-[#4a5d4e]">✓</span> 100% Organic Origin</li>
                  <li className="flex items-center gap-2 text-xs font-bold text-gray-600"><span className="text-[#4a5d4e]">✓</span> Zero Preservatives</li>
                  <li className="flex items-center gap-2 text-xs font-bold text-gray-600"><span className="text-[#4a5d4e]">✓</span> Small-Batch Cured</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Shelf Life</h4>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                   <p className="text-xs font-bold text-gray-600">12 Months (Unopened)</p>
                   <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">Refrigerate after opening</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* New Content Section: Micro-Batch Transparency */}
        <section className="mb-32 py-20 px-10 bg-[#1a2323] rounded-[4rem] text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 grid lg:grid-cols-2 gap-20 items-center">
             <div>
                <span className="text-[#8b5e3c] text-xs font-bold uppercase tracking-[0.4em] mb-6 block">Traceability Log</span>
                <h2 className="text-4xl lg:text-5xl font-bold serif mb-8 leading-tight">Batch Transparency</h2>
                <div className="space-y-8">
                   <div className="flex gap-6 items-center">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-xl">🏔️</div>
                      <div>
                         <p className="text-[10px] uppercase font-bold text-white/40">Orchard Location</p>
                         <p className="text-lg font-bold">Mukteshwar Valley, 7200ft</p>
                      </div>
                   </div>
                   <div className="flex gap-6 items-center">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-xl">👩‍🌾</div>
                      <div>
                         <p className="text-[10px] uppercase font-bold text-white/40">Lead Orchardist</p>
                         <p className="text-lg font-bold">Savitri Devi & Family</p>
                      </div>
                   </div>
                   <div className="flex gap-6 items-center">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-xl">🪵</div>
                      <div>
                         <p className="text-[10px] uppercase font-bold text-white/40">Curing Method</p>
                         <p className="text-lg font-bold">8-Hour Slow Copper Simmer</p>
                      </div>
                   </div>
                </div>
             </div>
             <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10">
                <h4 className="text-xl font-bold serif mb-6">Pantry Usage Tips</h4>
                <ul className="space-y-6">
                   <li className="flex gap-4">
                      <span className="text-[#8b5e3c] font-bold">01.</span>
                      <p className="text-sm text-white/70 leading-relaxed">Always use a <span className="text-white font-bold">dry wooden spoon</span> to prevent moisture contamination in our preservative-free batch.</p>
                   </li>
                   <li className="flex gap-4">
                      <span className="text-[#8b5e3c] font-bold">02.</span>
                      <p className="text-sm text-white/70 leading-relaxed">Best enjoyed within <span className="text-white font-bold">90 days of opening</span> for peak enzymatic freshness.</p>
                   </li>
                   <li className="flex gap-4">
                      <span className="text-[#8b5e3c] font-bold">03.</span>
                      <p className="text-sm text-white/70 leading-relaxed">Store away from direct sunlight in a cool, shaded corner of your kitchen or pantry.</p>
                   </li>
                </ul>
             </div>
          </div>
        </section>

        {/* Mountain to Jar Timeline */}
        <section className="mb-32">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <span className="text-[#8b5e3c] text-xs font-bold uppercase tracking-[0.4em] mb-4 block">The Vanphal Heritage</span>
            <h2 className="text-4xl lg:text-6xl font-bold serif mb-8">Harvest Timeline</h2>
            <p className="text-lg text-gray-500 font-light leading-relaxed">Every jar follows the rhythm of the mountain seasons, from the first frost to the final seal.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { time: 'Week 1', title: 'Sun Ripening', desc: 'Fruits are left on the branch until they reach natural sugar peak under the high-altitude sun.' },
              { time: 'Week 2', title: 'Hand Picking', desc: 'Each fruit is inspected and hand-picked at dawn to preserve the morning dew coolness.' },
              { time: 'Day 15', title: 'Copper Curing', desc: 'Slow-cooked in open copper vessels over wood-fired pits for that signature smoky finish.' },
              { time: 'Day 16', title: 'Glacial Sealing', desc: 'Vacuum-sealed using thermal techniques to lock in freshness without chemical additives.' }
            ].map((step, i) => (
              <div key={i} className="relative group">
                <div className="p-10 bg-white rounded-[3rem] border border-gray-100 hover:shadow-xl transition-all h-full">
                  <span className="text-[#8b5e3c] text-[10px] font-bold uppercase tracking-[0.2em] block mb-4">{step.time}</span>
                  <h4 className="text-xl font-bold serif mb-3">{step.title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>
                </div>
                {i < 3 && <div className="hidden lg:block absolute top-1/2 -right-4 translate-y-[-50%] text-2xl text-gray-100">→</div>}
              </div>
            ))}
          </div>
        </section>

        {/* AI Recipe Section */}
        {isLoadingRecipes ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-4 border-[#4a5d4e]/20 border-t-[#4a5d4e] rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 animate-pulse uppercase tracking-[0.3em] text-[10px] font-bold">Consulting our Hill-Chef AI...</p>
          </div>
        ) : recipes.length > 0 && (
          <section className="mb-32">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div>
                <span className="text-[#8b5e3c] text-xs font-bold uppercase tracking-[0.3em] mb-4 block">Kitchen Companion</span>
                <h2 className="text-4xl md:text-5xl font-bold serif">Culinary Suggestions</h2>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 px-5 py-2 rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Powered by Gemini AI</p>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-10">
              {recipes.map((recipe, i) => (
                <div key={i} className="group bg-white p-10 rounded-[3.5rem] border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                  <div className="mb-8 flex justify-between items-start">
                    <h4 className="text-2xl font-bold serif text-[#2d3a3a] leading-tight group-hover:text-[#4a5d4e] transition-colors">{recipe.title}</h4>
                    <span className="text-3xl opacity-20">🥣</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-8 font-light leading-relaxed">{recipe.description}</p>
                  <ul className="space-y-5 mb-8">
                    {recipe.steps.map((step: string, j: number) => (
                      <li key={j} className="flex gap-4 text-[11px] text-gray-500 leading-relaxed">
                        <span className="text-[#8b5e3c] font-bold shrink-0">{j + 1}.</span> {step}
                      </li>
                    ))}
                  </ul>
                  {recipe.pairingSuggestion && (
                    <div className="pt-8 border-t border-gray-100">
                      <p className="text-[9px] uppercase font-bold text-[#4a5d4e] tracking-[0.2em] mb-3">Chef's Pairing</p>
                      <p className="text-xs font-bold text-[#2d3a3a] leading-relaxed">{recipe.pairingSuggestion}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Sustainable Heritage Section */}
        <section className="mb-32 grid lg:grid-cols-2 gap-20 items-center">
          <div className="aspect-[16/10] rounded-[4rem] overflow-hidden shadow-2xl relative">
             <img src="https://images.unsplash.com/photo-1511497584788-8767fe771d85?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover" alt="Mountain Orchard" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
             <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end text-white">
                <div>
                   <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Sustainable Impact</p>
                   <h4 className="text-2xl serif font-bold">Rooted in Earth</h4>
                </div>
                <div className="text-xs font-bold bg-[#8b5e3c] px-4 py-2 rounded-full">ECO-SEALED</div>
             </div>
          </div>
          <div className="space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold serif leading-tight">Our Promise of Purity</h2>
            <p className="text-gray-500 font-light leading-relaxed text-lg">
              We promise to never compromise on the purity of our preserves. Every batch is tasted by our family, ensuring that the fruit integrity is maintained from the moment it leaves the tree to the moment it arrives at your table.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 pt-4">
               <div>
                  <p className="text-3xl font-bold serif text-[#4a5d4e]">0%</p>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Pesticides</p>
               </div>
               <div>
                  <p className="text-3xl font-bold serif text-[#4a5d4e]">100%</p>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Handcrafted</p>
               </div>
               <div>
                  <p className="text-3xl font-bold serif text-[#4a5d4e]">50+</p>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Local Jobs</p>
               </div>
            </div>
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section>
            <div className="flex justify-between items-end mb-12">
               <h2 className="text-3xl font-bold serif">You might also enjoy</h2>
               <Link to="/shop" className="text-[10px] font-bold uppercase tracking-widest text-[#4a5d4e] hover:underline">View Store</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
              {relatedProducts.map(p => (
                <Link key={p.id} to={`/product/${p.id}`} className="group">
                  <div className="aspect-square rounded-[2.5rem] overflow-hidden bg-white mb-6 border border-gray-50 shadow-sm group-hover:shadow-xl transition-all duration-700">
                    <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                  </div>
                  <h4 className="text-xl font-bold serif mb-2 group-hover:text-[#4a5d4e] transition-colors">{p.name}</h4>
                  <span className="text-sm font-bold text-[#4a5d4e]">₹{p.price}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
