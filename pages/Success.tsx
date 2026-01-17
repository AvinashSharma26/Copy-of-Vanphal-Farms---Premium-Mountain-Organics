
import React from 'react';
import { Link } from 'react-router-dom';

const Success: React.FC = () => {
  return (
    <div className="pt-40 pb-24 text-center px-4">
      <div className="max-w-md mx-auto">
        <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl shadow-sm">
          ✓
        </div>
        <h1 className="text-4xl font-bold serif mb-4">Harvest Confirmed!</h1>
        <p className="text-gray-500 mb-10 leading-relaxed">
          Thank you for choosing Vanphal Farms. Your order has been received and our mountain team is already preparing your fresh preserves. You'll receive a confirmation email shortly.
        </p>
        <div className="flex flex-col gap-4">
          <Link to="/" className="bg-[#4a5d4e] text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all">
            Back to Home
          </Link>
          <Link to="/shop" className="text-[#4a5d4e] font-bold text-sm uppercase tracking-widest">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Success;
