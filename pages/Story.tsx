
import React from 'react';

const Story: React.FC = () => {
  return (
    <div className="pt-32 lg:pt-40 pb-24 bg-[#fcfbf7]">
      {/* Hero Section */}
      <section className="relative h-[75vh] flex items-center justify-center bg-[#1a2323] rounded-[3.5rem] mx-6 lg:mx-12 overflow-hidden mb-32 shadow-2xl">
        <img 
          src="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=2000" 
          alt="Himalayas" 
          className="absolute inset-0 w-full h-full object-cover opacity-50 scale-110"
        />
        <div className="relative text-center text-white px-6 max-w-4xl animate-fadeIn">
          <span className="text-[10px] uppercase font-bold tracking-[0.5em] mb-6 block text-white/50">Himalayan Heritage | Est. 2021</span>
          <h1 className="text-5xl md:text-8xl font-bold serif mb-8 leading-tight">Preserving the <br /> Mountain Soul</h1>
          <p className="text-lg md:text-2xl font-light italic text-white/80 max-w-2xl mx-auto leading-relaxed">
            Where the air is thin, the water is pure, and every fruit tells a story of the soil.
          </p>
        </div>
      </section>

      {/* Main Narrative */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 space-y-40">
        {/* Foundation Section */}
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-10">
            <div className="space-y-4">
              <span className="text-[#8b5e3c] text-xs font-bold uppercase tracking-[0.3em] block">The Beginning</span>
              <h2 className="text-4xl md:text-6xl font-bold serif leading-tight">Harvested at <br /> 7,500 Feet.</h2>
            </div>
            <p className="text-gray-600 leading-[1.8] font-light text-xl">
              Vanphal, which translates to <span className="italic font-normal">"Fruit of the Wilderness,"</span> was born in a small terrace orchard in Nainital. We noticed that while the world moved towards mass production, the rich, tart flavors of mountain green apples and the velvety sweetness of sun-ripened apricots were being lost to cold storage.
            </p>
            <div className="p-10 bg-[#f3f4f0] rounded-[3rem] border border-gray-100 relative group overflow-hidden">
               <p className="relative z-10 text-[#4a5d4e] font-bold text-lg leading-relaxed">
                "Our vision was to create a bridge between the hardworking hill communities and the modern health-conscious family."
               </p>
               <div className="absolute -bottom-10 -right-10 text-9xl opacity-5 group-hover:rotate-12 transition-transform">🍏</div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl relative rotate-3 hover:rotate-0 transition-transform duration-700">
              <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800" alt="Local Farmer" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-8 -left-8 bg-white p-8 rounded-3xl shadow-xl border border-gray-50 max-w-xs">
               <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-2">Our impact</p>
               <p className="text-sm font-bold text-[#4a5d4e]">Working directly with 50+ families across the Kumaon region.</p>
            </div>
          </div>
        </div>

        {/* Data & Impact Section */}
        <div className="bg-[#1a2323] rounded-[4rem] p-16 lg:p-24 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 grid md:grid-cols-3 gap-20 text-center">
            <div className="space-y-6">
              <span className="text-6xl lg:text-8xl font-bold serif text-[#8b5e3c]">50+</span>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/40 font-bold mb-4">Orchard Partners</p>
                <p className="text-sm text-white/70 leading-relaxed">Providing stable income and fair-trade premiums to local hill farmers.</p>
              </div>
            </div>
            <div className="space-y-6">
              <span className="text-6xl lg:text-8xl font-bold serif text-[#8b5e3c]">100%</span>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/40 font-bold mb-4">Natural Origin</p>
                <p className="text-sm text-white/70 leading-relaxed">Zero artificial preservatives, colors, or liquid glucose. Nature's pure recipe.</p>
              </div>
            </div>
            <div className="space-y-6">
              <span className="text-6xl lg:text-8xl font-bold serif text-[#8b5e3c]">0</span>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/40 font-bold mb-4">Compromise</p>
                <p className="text-sm text-white/70 leading-relaxed">Slow-cooked in small batches over wood-fired pits for that smoky mountain essence.</p>
              </div>
            </div>
          </div>
        </div>

        {/* The Vanphal Way - Process Section */}
        <div className="space-y-24">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <span className="text-[#8b5e3c] text-xs font-bold uppercase tracking-[0.3em] block">The Method</span>
            <h2 className="text-4xl md:text-5xl font-bold serif leading-tight">Capturing the Essence of Himalayan Harvest.</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Frost & Sun Harvest', desc: 'Fruits are picked only after they have experienced the first mountain frost, which naturally concentrates their sugars.' },
              { step: '02', title: 'Glacial Cleansing', desc: 'Washed in pure mountain spring water before processing to maintain the highest hygiene and purity.' },
              { step: '03', title: 'Small Batch Cooking', desc: 'No more than 8kg per batch. This allows us to monitor texture and flavor with chef-like precision.' },
              { step: '04', title: 'Sustainable Sealing', desc: 'Sealed in glass jars while hot to create a vacuum naturally, removing the need for chemical preservatives.' }
            ].map((item, i) => (
              <div key={i} className="group p-10 bg-white rounded-[2.5rem] border border-gray-100 hover:border-[#4a5d4e]/20 transition-all hover:shadow-2xl hover:shadow-[#4a5d4e]/10">
                <span className="text-4xl font-bold serif text-gray-100 group-hover:text-[#8b5e3c] transition-colors mb-6 block">{item.step}</span>
                <h4 className="font-bold text-xl mb-4">{item.title}</h4>
                <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sustainability & Future */}
        <div className="grid lg:grid-cols-12 gap-20 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1 relative">
             <div className="aspect-square rounded-[4rem] overflow-hidden border-[16px] border-white shadow-2xl rotate-[-3deg]">
               <img src="https://images.unsplash.com/photo-1511497584788-8767fe771d85?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover" />
             </div>
             <div className="absolute top-10 -right-10 w-32 h-32 bg-[#4a5d4e] rounded-full flex items-center justify-center text-white text-3xl shadow-xl animate-pulse">🌍</div>
          </div>
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-10">
            <h3 className="text-4xl font-bold serif leading-tight text-[#1a2323]">Giving Back to <br /> the Earth.</h3>
            <p className="text-gray-600 leading-[1.8] text-lg font-light">
              We believe we are guests on this mountain land. That is why 5% of all our proceeds go directly into a community fund for building better irrigation systems and solar-drying facilities for the village elders who lack modern support. 
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-[#4a5d4e]/10 rounded-2xl flex items-center justify-center text-[#4a5d4e]">♻️</div>
                <h5 className="font-bold text-sm">Glass Packaging Only</h5>
                <p className="text-xs text-gray-400">Zero plastic in our final product delivery.</p>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 bg-[#4a5d4e]/10 rounded-2xl flex items-center justify-center text-[#4a5d4e]">🏔️</div>
                <h5 className="font-bold text-sm">Empowering Local</h5>
                <p className="text-xs text-gray-400">100% of our staff are local hill community members.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="mt-40 py-32 bg-[#1a2323] text-center px-6 rounded-[5rem] mx-6 lg:mx-12 shadow-2xl">
        <div className="max-w-3xl mx-auto">
          <div className="text-5xl lg:text-6xl text-white/10 mb-10 font-serif">"</div>
          <p className="text-3xl md:text-5xl serif italic text-white mb-12 leading-tight">
            Our promise is to never let a machine touch the soul of our preserves.
          </p>
          <div className="flex flex-col items-center">
            <h5 className="font-bold text-xl text-white">The Vanphal Family</h5>
            <span className="text-[10px] uppercase tracking-[0.5em] text-[#8b5e3c] font-bold mt-4">Kumaon Hills, Nainital</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Story;
