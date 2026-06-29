import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { CheckCircle2, ArrowRight, Package } from 'lucide-react';

const OrderConfirmationScreen: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-emerald-50 max-w-lg w-full text-center border border-emerald-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-emerald-50 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-emerald-50 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </div>
          
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Order Confirmed!</h1>
          
          <p className="text-gray-500 mb-8 max-w-sm font-medium">
            Thank you for your purchase. Your order has been placed successfully. 
            We've sent a confirmation email to you.
          </p>

          <div className="bg-gray-50 p-6 rounded-2xl w-full mb-8 border border-gray-100">
            <div className="flex items-center gap-3 text-gray-700 mb-2 justify-center">
              <Package className="w-5 h-5 text-emerald-600" />
              <span className="font-bold">Order ID</span>
            </div>
            <p className="text-xl font-bold text-gray-900 font-mono">{orderId}</p>
          </div>

          <button 
            onClick={() => navigate('/shop')}
            className="w-full bg-emerald-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
          >
            Continue Shopping <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationScreen;
