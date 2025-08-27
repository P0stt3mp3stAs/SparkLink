import { useState } from 'react';

export function usePaymentManagement() {
  const [hasPaid, setHasPaid] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [swipeLimit, setSwipeLimit] = useState({ count: 0, resetTime: 0 });
  const [showSwipeLimitModal, setShowSwipeLimitModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const getTimeUntilReset = () => {
    const timeLeft = swipeLimit.resetTime - Date.now();
    const minutes = Math.floor(timeLeft / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return {
    hasPaid,
    setHasPaid,
    showPaymentModal,
    setShowPaymentModal,
    isProcessing,
    setIsProcessing,
    paymentSuccess,
    setPaymentSuccess,
    swipeLimit,
    setSwipeLimit,
    showSwipeLimitModal,
    setShowSwipeLimitModal,
    paymentForm,
    setPaymentForm,
    formErrors,
    setFormErrors,
    getTimeUntilReset
  };
}