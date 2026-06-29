import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShopItem, User } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowLeft, CreditCard, Banknote, ShieldCheck, Loader2 } from 'lucide-react';

interface CheckoutScreenProps {
  items: ShopItem[];
  currentUser: User | null;
}

const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ items, currentUser }) => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const item = items.find(i => i.id === itemId);
  
  const [quantity, setQuantity] = useState(1);
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  
  const [address, setAddress] = useState({
    fullName: currentUser?.name || '',
    phone: currentUser?.phone || '',
    addressLine1: '',
    city: '',
    state: '',
    postalCode: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE'>('ONLINE');

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Item not found</h2>
        <button onClick={() => navigate('/shop')} className="text-emerald-600 font-bold hover:underline">
          Return to Shop
        </button>
      </div>
    );
  }

  const totalAmount = item.price * quantity;

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.fullName || !address.phone || !address.addressLine1 || !address.city || !address.postalCode) {
      alert('Please fill all required address fields.');
      return;
    }
    setStep(2);
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const orderPayload = {
        userId: currentUser?.id || 'guest',
        items: [{
          shopItemId: item.id,
          name: item.name,
          quantity,
          price: item.price,
          image: item.image
        }],
        shippingAddress: address
      };

      if (paymentMethod === 'COD') {
        const response = await fetch('/api/shop/confirm-cod', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload)
        });
        const data = await response.json();
        
        if (data.success) {
          navigate(`/order-confirmation/${data.orderId}`);
        } else {
          alert('Failed to place order: ' + data.error);
        }
      } else {
        // ONLINE Payment via Razorpay
        const response = await fetch('/api/shop/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload)
        });
        const data = await response.json();
        
        if (data.success) {
          const options = {
            key: "rzp_test_dummy", // Normally passed from backend or env
            amount: data.order.amount,
            currency: "INR",
            name: "Rescue Paw Shop",
            description: "Order Payment",
            order_id: data.order.id,
            handler: function (response: any) {
              // Usually we verify signature on backend, but here we can just assume success 
              // and let webhook handle DB update, then we just redirect.
              navigate(`/order-confirmation/${data.orderId}`);
            },
            prefill: {
              name: address.fullName,
              contact: address.phone,
            },
            theme: {
              color: "#059669"
            }
          };
          
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        } else {
          alert('Failed to initiate checkout: ' + data.error);
        }
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("An error occurred during checkout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 md:pb-0">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => step === 2 ? setStep(1) : navigate('/shop')}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Checkout</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          {step === 1 ? (
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Shipping Details</h2>
              <form onSubmit={handleNextStep} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                    <input required type="text" value={address.fullName} onChange={e => setAddress({...address, fullName: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                    <input required type="text" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Address Line 1</label>
                  <input required type="text" value={address.addressLine1} onChange={e => setAddress({...address, addressLine1: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium" />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-bold text-gray-700 mb-1">City</label>
                    <input required type="text" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">State</label>
                    <input required type="text" value={address.state} onChange={e => setAddress({...address, state: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">PIN Code</label>
                    <input required type="text" value={address.postalCode} onChange={e => setAddress({...address, postalCode: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium" />
                  </div>
                </div>

                <div className="pt-6">
                  <button type="submit" className="w-full bg-emerald-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">
                    Continue to Payment
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Method</h2>
              
              <div className="space-y-4">
                <label className={`flex items-center p-5 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'ONLINE' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 hover:border-gray-200'}`}>
                  <input type="radio" name="payment" value="ONLINE" checked={paymentMethod === 'ONLINE'} onChange={() => setPaymentMethod('ONLINE')} className="hidden" />
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 ${paymentMethod === 'ONLINE' ? 'border-emerald-600' : 'border-gray-300'}`}>
                    {paymentMethod === 'ONLINE' && <div className="w-3 h-3 bg-emerald-600 rounded-full" />}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <CreditCard className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Pay Online (Razorpay)</h4>
                      <p className="text-sm text-gray-500">Credit/Debit Card, UPI, Netbanking</p>
                    </div>
                  </div>
                </label>

                <label className={`flex items-center p-5 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 hover:border-gray-200'}`}>
                  <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="hidden" />
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 ${paymentMethod === 'COD' ? 'border-emerald-600' : 'border-gray-300'}`}>
                    {paymentMethod === 'COD' && <div className="w-3 h-3 bg-emerald-600 rounded-full" />}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Banknote className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Cash on Delivery</h4>
                      <p className="text-sm text-gray-500">Pay when your order arrives</p>
                    </div>
                  </div>
                </label>
              </div>

              <div className="pt-8">
                <button 
                  onClick={handleCheckout} 
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white font-bold text-lg py-4 rounded-xl hover:bg-black transition-colors shadow-lg disabled:opacity-70"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ShieldCheck className="w-6 h-6" />}
                  {loading ? 'Processing...' : `Place Order (₹${totalAmount})`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:w-96">
          <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-6">Order Summary</h3>
            
            <div className="flex gap-4 mb-6 pb-6 border-b border-gray-200">
              <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl shadow-sm" />
              <div className="flex-1">
                <h4 className="font-bold text-sm text-gray-900 line-clamp-2">{item.name}</h4>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-emerald-600 font-extrabold">₹{item.price}</span>
                  <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-gray-200">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-gray-500 hover:text-gray-900 w-6 h-6 flex items-center justify-center font-bold">-</button>
                    <span className="text-sm font-bold w-4 text-center">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="text-gray-500 hover:text-gray-900 w-6 h-6 flex items-center justify-center font-bold">+</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm font-medium text-gray-500">
                <span>Subtotal</span>
                <span>₹{totalAmount}</span>
              </div>
              <div className="flex justify-between text-sm font-medium text-gray-500">
                <span>Shipping</span>
                <span className="text-emerald-600">Free</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <span className="font-bold text-gray-900 text-lg">Total</span>
              <span className="font-extrabold text-2xl text-emerald-600">₹{totalAmount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutScreen;
