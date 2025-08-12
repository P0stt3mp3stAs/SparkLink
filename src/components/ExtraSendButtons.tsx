// src/components/ExtraSendButtons.tsx
'use client';

import StackedButtons from '@/components/StackedButtons';

type ExtraSendButtonsProps = {
  onSendOnce: () => void;
  onSendLater: () => void;
  onSendBomb: () => void;
  onAudio: () => void;
  onMedia: () => void;
  onLocation: () => void;
  onGift: () => void;
};

export default function ExtraSendButtons({
  onSendOnce,
  onSendLater,
  onSendBomb,
  onAudio,
  onMedia,
  onLocation,
  onGift,
}: ExtraSendButtonsProps) {
  const leftButtons = [
    { bgClass: 'bg-gray-700', content: <img src="/audio.svg" alt="Audio" className="w-5 h-5" />, onClick: onAudio },
    { bgClass: 'bg-gray-300', content: <img src="/media.svg" alt="Media" className="w-5 h-5" />, onClick: onMedia },
    { bgClass: 'bg-green-400', content: <img src="/location.svg" alt="Location" className="w-7 h-7" />, onClick: onLocation },
    { bgClass: 'bg-pink-500', content: <img src="/gift.svg" alt="Gift" className="w-7 h-7" />, onClick: onGift },
  ];

  const rightButtons = [
    { bgClass: 'bg-yellow-300', content: <img src="/once.svg" alt="Once" className="w-5 h-5" />, onClick: onSendOnce },
    { bgClass: 'bg-blue-400', content: <img src="/later.svg" alt="Later" className="w-5 h-5" />, onClick: onSendLater },
    { bgClass: 'bg-red-500', content: <img src="/bomb.svg" alt="Bomb" className="w-5 h-5" />, onClick: onSendBomb },
  ];

  return (
    <>
      <div className="flex justify-start">
        <StackedButtons buttons={leftButtons} size={48} />
      </div>
      <div className="flex justify-end">
        <StackedButtons buttons={rightButtons} size={48} />
      </div>
    </>
  );
}