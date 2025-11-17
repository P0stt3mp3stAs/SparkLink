'use client';

import { CreditCard, X, Check, Lock } from 'lucide-react';
import { useAuth } from 'react-oidc-context';

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
  setShowSwipeLimitModal: (show: boolean) => void;
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
    if (!validateForm()) return;

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);

      setTimeout(() => {
        setHasPaid(true);

        if (auth.user?.profile?.sub) {
          const userId = auth.user.profile.sub;
          const paidUsers = JSON.parse(localStorage.getItem('paidUsers') || '{}');
          paidUsers[userId] = true;
          localStorage.setItem('paidUsers', JSON.stringify(paidUsers));
        }

        localStorage.setItem('hasPaidForPremium', 'true');
        setShowPaymentModal(false);
        setPaymentSuccess(false);
        setPaymentForm({ cardNumber: '', expiryDate: '', cvv: '', name: '' });
      }, 1500);
    }, 2000);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const match = v.match(/\d{4,16}/g)?.[0] || '';
    const parts = [];
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const handleInputChange = (field: keyof PaymentFormData, value: string) => {
    let formattedValue = value;

    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value).slice(0, 19);
    } else if (field === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5);
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setPaymentForm({ ...paymentForm, [field]: formattedValue });

    if (formErrors[field]) {
      const updatedErrors = { ...formErrors };
      delete updatedErrors[field];
      setFormErrors(updatedErrors);
    }
  };

  if (!showPaymentModal) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 -translate-y-8">
      <div className="bg-[#FCE9CE] rounded-3xl p-3 max-w-xs w-full sm:max-w-sm sm:p-4 shadow-xl scale-[0.88] sm:scale-100">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[10px] sm:text-xs font-bold bg-black/70 px-2 py-1 rounded-full text-yellow-400">✨ Unlock Premium</h3>
          <button
            onClick={() => {
              setShowPaymentModal(false);
              setFormErrors({});
            }}
            className="text-black hover:text-white p-1 rounded-full hover:bg-black transition-colors"
            disabled={isProcessing}
          >
            <X size={16} />
          </button>
        </div>

        {paymentSuccess ? (
          <div className="text-center py-5">
            <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check size={24} className="text-black" />
            </div>
            <h4 className="text-lg font-bold text-green-400 mb-1">Payment Successful!</h4>
            <p className="text-black text-sm">You now have unlimited swipes and filters. 🎉</p>
          </div>
        ) : isProcessing ? (
          <div className="text-center py-5">
            <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-yellow-500 mx-auto mb-3"></div>
            <h4 className="text-base font-bold text-yellow-400 mb-1">Processing Payment</h4>
            <p className="text-black text-[11px]">Please wait while we secure your transaction...</p>
          </div>
        ) : (
          <>
            <div className="mb-3">
              <div className="bg-[#FFF5E6] p-1 rounded-lg mb-1">
                <h4 className="text-black font-bold text-sm text-center">
                  💎 Premium Membership - $4.99/month
                </h4>
              </div>

              <div className="space-y-1 mb-3 text-black">
                <div className="flex items-center bg-[#FFF5E6] p-2 rounded-lg text-[10px]">
                  <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center mr-2">
                    <Check size={8} className="text-black" />
                  </div>
                  <span>Unlimited right swipes</span>
                </div>
                <div className="flex items-center bg-[#FFF5E6] p-2 rounded-lg text-[10px]">
                  <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center mr-2">
                    <Check size={8} className="text-black" />
                  </div>
                  <span>Advanced filters</span>
                </div>
              </div>

              <div className="bg-[#FFF5E6] p-2 text-black rounded-2xl mb-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm">💳 Payment Details</h4>
                  <div className="flex items-center gap-1 bg-black/40 px-2 py-[1px] rounded-full">
                    <Lock className="w-3 h-3 text-green-400" />
                    <span className="text-[8px] text-green-400">Secure</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block mb-1 text-[11px]">Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={paymentForm.cardNumber}
                      onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                      className="w-full border-2 border-[#FCE9CE] rounded-full px-3 py-1.5 text-black placeholder-black focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block mb-1 text-[11px]">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={paymentForm.expiryDate}
                        onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                        className="w-full border-2 border-[#FCE9CE] rounded-full px-3 py-1.5 text-black placeholder-black focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-[11px]">CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        value={paymentForm.cvv}
                        onChange={(e) => handleInputChange('cvv', e.target.value)}
                        className="w-full border-2 border-[#FCE9CE] rounded-full px-3 py-1.5 text-black placeholder-black focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1 text-[11px]">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={paymentForm.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full border-2 border-[#FCE9CE] rounded-full px-3 py-1.5 text-black placeholder-black focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handlePayment}
                className="bg-[#FFD700] hover:bg-yellow-400 text-black font-bold py-1.5 rounded-full transition-all hover:scale-[1.03] flex items-center justify-center gap-2 text-sm shadow-md"
              >
                <CreditCard size={16} />
                Pay $4.99 Now
              </button>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setFormErrors({});
                }}
                className="bg-[#2A5073] hover:bg-[#244665] text-white font-medium py-1 rounded-full transition-colors text-[10px] w-1/3 mx-auto"
              >
                Maybe Later
              </button>
            </div>

            <div className="mt-1 text-center">
              <div className="flex items-center justify-center gap-1 text-black text-[7px]">
                <Lock className="w-2.5 h-2.5" />
                <span>This is a demo - no real payment will be processed</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
