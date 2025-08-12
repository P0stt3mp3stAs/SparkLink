// Send.tsx
import StackedButtons from '@/components/StackedButtons';

type SendProps = {
  input: string;
  setInput: (value: string) => void;

  onSend: () => void;
  onSendOnce: () => void;
  onSendLater: () => void;
  onSendBomb: () => void;

  onAudio: () => void;
  onMedia: () => void;
  onLocation: () => void;
  onGift: () => void;
};

export default function Send({
  input,
  setInput,
  onSend,
  onSendOnce,
  onSendLater,
  onSendBomb,
  onAudio,
  onMedia,
  onLocation,
  onGift,
}: SendProps) {
  const leftButtons = [
    { bgClass: 'bg-gray-700', content: <img src="/audio.svg" alt="Audio" className="w-5 h-5" />, onClick: onAudio },
    { bgClass: 'bg-gray-300', content: <img src="/media.svg" alt="Media" className="w-5 h-5" />, onClick: onMedia },
    { bgClass: 'bg-green-400', content: <img src="/location.svg" alt="Location" className="w-7 h-7" />, onClick: onLocation },
    { bgClass: 'bg-pink-500', content: <img src="/gift.svg" alt="Gift" className="w-7 h-7" />, onClick: onGift },
  ];

  const rightButtons = [
    { bgClass: 'bg-green-500', content: <img src="/send.svg" alt="Send" className="w-5 h-5" />, onClick: onSend },
    { bgClass: 'bg-yellow-300', content: <img src="/once.svg" alt="Once" className="w-5 h-5" />, onClick: onSendOnce },
    { bgClass: 'bg-blue-400', content: <img src="/later.svg" alt="Later" className="w-5 h-5" />, onClick: onSendLater },
    { bgClass: 'bg-red-500', content: <img src="/bomb.svg" alt="Bomb" className="w-5 h-5" />, onClick: onSendBomb },
  ];

  return (
    <div
      className="fixed bottom-20 left-0 right-0 mx-auto max-w-screen-xl
        grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4"
      style={{ height: 56 }}
    >
      <div className="flex justify-start">
        <StackedButtons buttons={leftButtons} size={48} />
      </div>

      <input
        type="text"
        placeholder="Type here..."
        className="w-full rounded-full border border-green-500 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSend();
        }}
      />

      <div className="flex justify-end">
        <StackedButtons buttons={rightButtons} size={48} />
      </div>
    </div>
  );
}
