
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const from = location.state?.from || '/';

  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        const success = await register(name, email, password);
        if (success) {
          navigate(from, { replace: true });
        } else {
          setError('Registration failed. This email might already be in use.');
        }
      } else {
        const success = await login(email, password);
        if (success) {
          navigate(from, { replace: true });
        } else {
          setError('Incorrect credentials. Please verify your email and key.');
        }
      }
    } catch (err) {
      setError('An error occurred during authentication. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden pt-20">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2000" 
          alt="" 
          className="w-full h-full object-cover brightness-[0.4]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>
      </div>

      <div className="relative z-10 bg-white/95 backdrop-blur-3xl p-8 md:p-14 rounded-[3.5rem] shadow-2xl max-w-lg w-full border border-white/40 animate-slideUp">
        <div className="text-center mb-10">
          <span className="text-[#8b5e3c] text-[10px] uppercase font-bold tracking-[0.4em] mb-4 block">
            Identity Service
          </span>
          <h1 className="text-4xl md:text-5xl font-bold serif mb-4 text-[#2d3a3a]">
            {isRegistering ? 'Mountain Pass' : 'Nature Calling'}
          </h1>
          <p className="text-gray-400 text-sm font-light leading-relaxed">
            {isRegistering 
              ? 'Join our heritage community and experience pure mountain artisanal flavors.' 
              : 'Sign in to access your curated selection and finalize your harvest.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold rounded-2xl text-center uppercase tracking-widest">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegistering && (
            <div className="space-y-1.5">
              <label className="block text-[9px] uppercase font-bold tracking-widest text-gray-400 ml-4">Full Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#4a5d4e] focus:ring-4 focus:ring-[#4a5d4e]/5 outline-none transition-all text-sm"
                placeholder="Your Name"
              />
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="block text-[9px] uppercase font-bold tracking-widest text-gray-400 ml-4">Email ID</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#4a5d4e] focus:ring-4 focus:ring-[#4a5d4e]/5 outline-none transition-all text-sm"
              placeholder="example@gmail.com"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-[9px] uppercase font-bold tracking-widest text-gray-400 ml-4">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#4a5d4e] focus:ring-4 focus:ring-[#4a5d4e]/5 outline-none transition-all text-sm"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#1a2323] text-white py-5 rounded-2xl font-bold hover:shadow-2xl transition-all active:scale-95 disabled:opacity-50 uppercase tracking-[0.2em] text-[10px] mt-4"
          >
            {loading ? 'Validating...' : (isRegistering ? 'Register & Continue' : 'Secure Entry')}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-sm text-gray-400 mb-8">
            {isRegistering ? 'Already part of the heritage?' : "New to our village?"}{' '}
            <button 
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
              className="text-[#4a5d4e] font-bold hover:underline ml-1"
            >
              {isRegistering ? 'Sign In Instead' : 'Create Account'}
            </button>
          </p>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
            <div className="relative flex justify-center text-[8px] uppercase tracking-[0.4em] text-gray-300 font-bold">
              <span className="bg-white px-4">Demo Credentials</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-gray-50 p-4 rounded-2xl text-left border border-gray-100">
                <p className="text-[8px] font-bold text-gray-400 uppercase mb-1">Customer Demo</p>
                <p className="text-[10px] font-bold text-[#4a5d4e]">user@gmail.com</p>
                <p className="text-[10px] font-bold text-gray-400">user@123</p>
             </div>
             <div className="bg-gray-50 p-4 rounded-2xl text-left border border-gray-100">
                <p className="text-[8px] font-bold text-gray-400 uppercase mb-1">Admin Demo</p>
                <p className="text-[10px] font-bold text-[#8b5e3c]">bittusha411@gmail.com</p>
                <p className="text-[10px] font-bold text-gray-400">admin@123</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
