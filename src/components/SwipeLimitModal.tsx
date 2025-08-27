'use client';

import { X, Crown } from 'lucide-react';

interface SwipeLimitModalProps {
  showSwipeLimitModal: boolean;
  setShowSwipeLimitModal: (show: boolean) => void;
  setShowPaymentModal: (show: boolean) => void;
  getTimeUntilReset: () => string;
}

export default function SwipeLimitModal({
  showSwipeLimitModal,
  setShowSwipeLimitModal,
  setShowPaymentModal,
  getTimeUntilReset
}: SwipeLimitModalProps) {
  if (!showSwipeLimitModal) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 border-2 border-red-500/50 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-red-400">⏰ Swipe Limit Reached</h3>
          <button 
            onClick={() => setShowSwipeLimitModal(false)}
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="mb-6">
          <div className="bg-red-500/20 p-4 rounded-xl mb-6 text-center">
            <p className="text-red-200 text-lg font-semibold">
              You've used all 5 free swipes!
            </p>
          </div>
          
          <p className="text-gray-300 text-center mb-6">
            Next swipes available in: 
            <span className="text-yellow-400 font-bold ml-2">{getTimeUntilReset()}</span>
          </p>
          
          <div className="bg-gradient-to-r from-red-500 to-orange-500 p-4 rounded-xl mb-4">
            <p className="text-white text-center font-bold text-lg">
              🚀 Upgrade for Unlimited Swipes!
            </p>
          </div>
        </div>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              setShowSwipeLimitModal(false);
              setShowPaymentModal(true);
            }}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold py-4 rounded-xl transition-all transform hover:scale-105 flex items-center justify-center gap-3 text-lg"
          >
            <Crown size={22} />
            Get Unlimited - $4.99
          </button>
          <button
            onClick={() => setShowSwipeLimitModal(false)}
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Wait for Free Swipes
          </button>
        </div>
      </div>
    </div>
  );
}