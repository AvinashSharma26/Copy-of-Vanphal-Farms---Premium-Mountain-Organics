
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
        <div className="flex flex-col lg:flex-row justify-between items-center mb-16 gap-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-[#4a5d4e] transition-all group">
            <ICONS.ArrowLeft /> Return to Collection
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-24 mb-32">
          <div className="space-y-8">
            <div className="aspect-[4/5] rounded-[4rem] overflow-hidden bg-white shadow-2xl border border-gray-100">
              <img src={activeImage} alt={product.name} className="w-full h-full object-cover animate-fadeIn" />
            </div>
            {allImages.length > 1 && (
              <div className="grid grid-cols-6 gap-3">
                {allImages.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(img)} className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${activeImage === img ? 'border-[#4a5d4e] shadow-xl' : 'border-transparent opacity-60'}`}>
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col pt-10">
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#8b5e3c] bg-[#8b5e3c]/5 px-4 py-1.5 rounded-full border border-[#8b5e3c]/10">Batch #{product.id}</span>
              <span className={`text-[10px] uppercase font-bold tracking-widest px-4 py-1.5 rounded-full border ${product.status === 'in-stock' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>{product.status === 'in-stock' ? `In Stock (${product.stock} Units)` : 'Sold Out'}</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100">{product.weight}</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold serif mb-6 leading-tight text-[#2d3a3a]">{product.name}</h1>
            <div className="flex flex-wrap gap-2 mb-8">
                {(product.categories || []).map(cat => (
                  <span key={cat} className="text-[10px] uppercase font-bold tracking-[0.2em] bg-gray-100 text-gray-500 px-3 py-1 rounded-full">{cat}</span>
                ))}
            </div>
            <div className="flex items-center gap-6 mb-12">
              <span className="text-5xl font-bold serif text-[#4a5d4e]">₹{product.price}</span>
            </div>
            <div className="space-y-6 mb-12">
               <h4 className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#8b5e3c]">Product Description</h4>
               <p className="text-xl text-gray-500 font-light leading-[1.8]">{product.description}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-16">
              <div className="flex items-center bg-gray-50 rounded-2xl overflow-hidden p-1">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-black font-bold">-</button>
                <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-black font-bold">+</button>
              </div>
              <button onClick={() => { addToCart(product, quantity); navigate('/cart'); }} disabled={product.status === 'out-of-stock'} className="w-full sm:flex-grow bg-[#1a2323] text-white py-5 px-10 rounded-2xl font-bold uppercase tracking-widest text-[11px] hover:shadow-2xl transition-all disabled:opacity-50">Place in Basket</button>
            </div>
            
            <div className="grid grid-cols-2 gap-8 py-10 border-t border-gray-100">
               <div className="space-y-2">
                  <h5 className="text-[10px] uppercase font-bold tracking-widest text-gray-300">Net Weight</h5>
                  <p className="font-bold text-lg serif">{product.weight}</p>
               </div>
               <div className="space-y-2">
                  <h5 className="text-[10px] uppercase font-bold tracking-widest text-gray-300">Stock Status</h5>
                  <p className={`font-bold text-lg serif ${product.status === 'in-stock' ? 'text-green-600' : 'text-red-500'}`}>{product.status === 'in-stock' ? 'Currently Available' : 'Sold Out'}</p>
               </div>
            </div>
          </div>
        </div>

        {isLoadingRecipes ? (
          <div className="py-20 text-center text-gray-400 animate-pulse uppercase tracking-[0.3em] text-[10px] font-bold">Querying AI for Culinary Ideas...</div>
        ) : recipes.length > 0 && (
          <section className="mb-32">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div>
                <span className="text-[#8b5e3c] text-xs font-bold uppercase tracking-[0.3em] mb-4 block">Kitchen Companion</span>
                <h2 className="text-4xl md:text-5xl font-bold serif">Creative Serving Ideas</h2>
              </div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Powered by Gemini AI</p>
            </div>
            <div className="grid md:grid-cols-3 gap-12">
              {recipes.map((recipe, i) => (
                <div key={i} className="bg-white p-10 rounded-[3rem] border border-gray-100 hover:shadow-2xl transition-all">
                  <h4 className="text-2xl font-bold serif mb-6 text-[#2d3a3a]">{recipe.title}</h4>
                  <p className="text-sm text-gray-500 mb-8 font-light leading-relaxed">{recipe.description}</p>
                  <ul className="space-y-4 mb-8">
                    {recipe.steps.map((step: string, j: number) => (
                      <li key={j} className="flex gap-4 text-xs text-gray-400 leading-relaxed italic">
                        <span className="text-[#8b5e3c] font-bold">{j + 1}.</span> {step}
                      </li>
                    ))}
                  </ul>
                  {recipe.pairingSuggestion && (
                    <div className="pt-6 border-t border-gray-50">
                      <p className="text-[9px] uppercase font-bold text-[#4a5d4e] tracking-widest mb-2">Perfect Pairing</p>
                      <p className="text-xs font-bold">{recipe.pairingSuggestion}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {relatedProducts.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold serif mb-12">Pairs Well With</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
              {relatedProducts.map(p => (
                <Link key={p.id} to={`/product/${p.id}`} className="group">
                  <div className="aspect-square rounded-[3rem] overflow-hidden bg-white mb-6 border border-gray-50 shadow-sm group-hover:shadow-xl transition-all duration-700">
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
