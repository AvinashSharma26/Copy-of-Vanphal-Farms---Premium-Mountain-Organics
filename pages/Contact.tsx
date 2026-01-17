
import React, { useState } from 'react';
import { useTickets } from '../context/TicketContext';
import { useAuth } from '../context/AuthContext';
import { FAQSection } from '../components/FAQSection';

const Contact: React.FC = () => {
  const { user } = useAuth();
  const { addTicket } = useTickets();
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    userName: user?.name || '',
    email: user?.email || ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTicket({
      userId: user?.id || 'guest',
      userName: formData.userName,
      email: formData.email,
      subject: formData.subject,
      message: formData.message
    });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setFormData({ subject: '', message: '', userName: user?.name || '', email: user?.email || '' });
  };

  return (
    <div className="pt-32 lg:pt-40 pb-24 bg-[#fcfbf7]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-20 items-start mb-32">
          {/* Info Side */}
          <div className="space-y-16">
            <div>
              <span className="text-[#8b5e3c] text-xs font-bold uppercase tracking-[0.3em] mb-4 block">Get in touch</span>
              <h1 className="text-5xl lg:text-7xl font-bold serif leading-tight mb-8">Reach Out to <br /> the Hills.</h1>
              <p className="text-gray-500 leading-relaxed max-w-md text-lg font-light">
                Whether you have a question about our seasonal harvest, want to discuss bulk orders, or simply want to say hello from the city.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-8">
              <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm transition-transform hover:-translate-y-2">
                <h4 className="font-bold mb-4 serif text-xl text-[#1a2323]">Our Orchard</h4>
                <p className="text-sm text-gray-400 leading-relaxed">Upper Hill Valley Estate,<br />Nainital, Uttarakhand<br />Pin: 263001</p>
              </div>
              <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm transition-transform hover:-translate-y-2">
                <h4 className="font-bold mb-4 serif text-xl text-[#1a2323]">Direct Line</h4>
                <p className="text-sm text-gray-400 leading-relaxed">+91 98765 43210<br />Mon-Sat: 09:00 - 18:00<br />Sun: Mountain Hike Only</p>
              </div>
            </div>

            <div className="p-12 bg-[#4a5d4e] text-white rounded-[4rem] relative overflow-hidden shadow-2xl shadow-[#4a5d4e]/20">
              <div className="relative z-10">
                <h3 className="text-3xl font-bold serif mb-6">Purity Guaranteed</h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  Every jar is inspected by our family. If you're not happy with the quality, we'll replace it at no cost. Your trust is our legacy.
                </p>
              </div>
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/5 rounded-full"></div>
            </div>
          </div>

          {/* Form Side */}
          <div className="bg-white p-12 lg:p-16 rounded-[4rem] shadow-xl border border-gray-50 relative">
            <h2 className="text-3xl font-bold serif mb-10 text-[#1a2323]">Support Ticket System</h2>
            
            {submitted ? (
              <div className="bg-green-50 border border-green-100 p-12 rounded-[3rem] text-center animate-fadeIn">
                <div className="text-5xl mb-6">🏔️</div>
                <h3 className="text-green-800 font-bold text-xl mb-4">Ticket Dispatched!</h3>
                <p className="text-green-600 text-sm leading-relaxed">The mountain winds are carrying your message to us. We'll reply within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="block text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400 ml-2">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.userName}
                      onChange={e => setFormData({...formData, userName: e.target.value})}
                      className="w-full bg-gray-50 px-6 py-5 rounded-2xl border-none focus:ring-2 focus:ring-[#4a5d4e]/20 outline-none transition-all"
                      placeholder="Your Name"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400 ml-2">Email</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-gray-50 px-6 py-5 rounded-2xl border-none focus:ring-2 focus:ring-[#4a5d4e]/20 outline-none transition-all"
                      placeholder="Email Address"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400 ml-2">Subject</label>
                  <input 
                    type="text" 
                    required
                    placeholder="What can we help you with?"
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                    className="w-full bg-gray-50 px-6 py-5 rounded-2xl border-none focus:ring-2 focus:ring-[#4a5d4e]/20 outline-none transition-all"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400 ml-2">Requirement Detail</label>
                  <textarea 
                    required
                    rows={6}
                    placeholder="Tell us about your requirements or issues clearly..."
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    className="w-full bg-gray-50 px-6 py-5 rounded-2xl border-none focus:ring-2 focus:ring-[#4a5d4e]/20 outline-none resize-none transition-all"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#1a2323] text-white py-6 rounded-2xl font-bold hover:bg-[#2d3a3a] shadow-2xl shadow-[#1a2323]/20 transition-all active:scale-95"
                >
                  Submit Support Ticket
                </button>
              </form>
            )}
          </div>
        </div>

        {/* FAQ Section with proper divider */}
        <div className="border-t border-gray-100 pt-10">
          <FAQSection />
        </div>
      </div>
    </div>
  );
};

export default Contact;
