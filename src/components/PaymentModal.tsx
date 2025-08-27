'use client';

import { CreditCard, X, Check, Lock } from 'lucide-react';
import { useAuth } from 'react-oidc-context'; // ADD THIS IMPORT

interface PaymentFormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  name: string;
}

interface PaymentModalProps {
  showPaymentModal: boolean;
  setShowPaymentModal: (show: boolean) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  paymentSuccess: boolean;
  setPaymentSuccess: (success: boolean) => void;
  setHasPaid: (paid: boolean) => void;
  paymentForm: PaymentFormData;
  setPaymentForm: (form: PaymentFormData) => void;
  formErrors: Partial<PaymentFormData>;
  setFormErrors: (errors: Partial<PaymentFormData>) => void;
  setShowSwipeLimitModal: (show: boolean) => void; // ADD THIS LINE
}

export default function PaymentModal({
  showPaymentModal,
  setShowPaymentModal,
  isProcessing,
  setIsProcessing,
  paymentSuccess,
  setPaymentSuccess,
  setHasPaid,
  paymentForm,
  setPaymentForm,
  formErrors,
  setFormErrors,
  setShowSwipeLimitModal // ADD THIS LINE
}: PaymentModalProps) {
  const auth = useAuth();

  const validateForm = () => {
    const errors: Partial<PaymentFormData> = {};
    
    if (!paymentForm.cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
      errors.cardNumber = 'Please enter a valid 16-digit card number';
    }
    
    if (!paymentForm.expiryDate.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) {
      errors.expiryDate = 'Please use MM/YY format';
    }
    
    if (!paymentForm.cvv.match(/^\d{3,4}$/)) {
      errors.cvv = 'Please enter a valid CVV';
    }
    
    if (paymentForm.name.trim().length < 2) {
      errors.name = 'Please enter your name as it appears on card';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePayment = () => {
  if (!validateForm()) {
    return;
  }

  setIsProcessing(true);
  
  setTimeout(() => {
    setIsProcessing(false);
    setPaymentSuccess(true);
    
    setTimeout(() => {
      setHasPaid(true);
      
      // Store payment with USER ID (so it's user-specific)
      if (auth.user?.profile?.sub) {
        const userId = auth.user.profile.sub;
        const paidUsers = JSON.parse(localStorage.getItem('paidUsers') || '{}');
        paidUsers[userId] = true;
        localStorage.setItem('paidUsers', JSON.stringify(paidUsers));
      }
      
      localStorage.setItem('hasPaidForPremium', 'true');
      setShowPaymentModal(false);
      // REMOVE THIS LINE: setShowSwipeLimitModal(false);
      setPaymentSuccess(false);
      setPaymentForm({ cardNumber: '', expiryDate: '', cvv: '', name: '' });
    }, 1500);
  }, 2000);
};

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches ? matches[0] : '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    return parts.length ? parts.join(' ') : value;
  };

  const handleInputChange = (field: keyof PaymentFormData, value: string) => {
    let formattedValue = value;
    
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value).slice(0, 19);
    } else if (field === 'expiryDate') {
      formattedValue = value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '$1/$2')
        .slice(0, 5);
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }
    
    // Create new form object with updated field
    const updatedForm = { ...paymentForm, [field]: formattedValue };
    setPaymentForm(updatedForm);
    
    if (formErrors[field]) {
      // Create new errors object without the current field error
      const updatedErrors = { ...formErrors };
      delete updatedErrors[field];
      setFormErrors(updatedErrors);
    }
  };

  if (!showPaymentModal) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-3 mb-1">
      <div className="bg-gray-800/90 backdrop-blur-md rounded-xl p-4 max-w-sm w-full mx-3 border border-yellow-500/50 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-yellow-400">✨ Unlock Premium</h3>
          <button 
            onClick={() => {
              setShowPaymentModal(false);
              setFormErrors({});
            }}
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors"
            disabled={isProcessing}
          >
            <X size={20} />
          </button>
        </div>

        {paymentSuccess ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={28} className="text-white" />
            </div>
            <h4 className="text-xl font-bold text-green-400 mb-2">Payment Successful!</h4>
            <p className="text-gray-200 text-base">You now have unlimited swipes and filters. 🎉</p>
          </div>
        ) : isProcessing ? (
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <h4 className="text-lg font-bold text-yellow-400 mb-2">Processing Payment</h4>
            <p className="text-gray-300 text-sm">Please wait while we secure your transaction...</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-lg mb-4">
                <h4 className="text-white font-bold text-base text-center">
                  💎 Premium Membership - $4.99/month
                </h4>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center bg-gray-700 p-2 rounded-lg text-sm">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-2">
                    <Check size={12} className="text-white" />
                  </div>
                  <span className="text-gray-200">Unlimited right swipes</span>
                </div>
                <div className="flex items-center bg-gray-700 p-2 rounded-lg text-sm">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-2">
                    <Check size={12} className="text-white" />
                  </div>
                  <span className="text-gray-200">Advanced filters</span>
                </div>
              </div>

              <div className="bg-gray-900 p-4 rounded-lg mb-3 border border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-200 text-base">💳 Payment Details</h4>
                  <div className="flex items-center gap-1 bg-green-900/30 px-2 py-0.5 rounded-full">
                    <Lock className="w-3 h-3 text-green-400" />
                    <span className="text-[10px] text-green-400">Secure</span>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <label className="block text-gray-300 mb-1">Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={paymentForm.cardNumber}
                      onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 transition-colors text-sm"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-300 mb-1">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={paymentForm.expiryDate}
                        onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-1">CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        value={paymentForm.cvv}
                        onChange={(e) => handleInputChange('cvv', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={paymentForm.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <button
                onClick={handlePayment}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold py-3 rounded-lg transition-all hover:scale-105 flex items-center justify-center gap-2 text-base shadow-md"
              >
                <CreditCard size={18} />
                Pay $4.99 Now
              </button>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setFormErrors({});
                }}
                className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 rounded-lg transition-colors text-sm"
              >
                Maybe Later
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <div className="flex items-center justify-center gap-1 text-gray-400 text-xs">
                <Lock className="w-3 h-3" />
                <span>This is a demo - no real payment will be processed</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}