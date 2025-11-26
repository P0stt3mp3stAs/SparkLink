// Send.tsx
import Image from "next/image";
import StackedButtons from "@/components/StackedButtons";

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
    {
      bgClass: "bg-gray-700",
      content: (
        <Image src="/audio.svg" alt="Audio" width={20} height={20} />
      ),
      onClick: onAudio,
    },
    {
      bgClass: "bg-gray-300",
      content: (
        <Image src="/media.svg" alt="Media" width={20} height={20} />
      ),
      onClick: onMedia,
    },
    {
      bgClass: "bg-green-400",
      content: (
        <Image src="/location.svg" alt="Location" width={28} height={28} />
      ),
      onClick: onLocation,
    },
    {
      bgClass: "bg-pink-500",
      content: (
        <Image src="/gift.svg" alt="Gift" width={28} height={28} />
      ),
      onClick: onGift,
    },
  ];

  const rightButtons = [
    {
      bgClass: "bg-green-500",
      content: (
        <Image src="/send.svg" alt="Send" width={20} height={20} />
      ),
      onClick: onSend,
    },
    {
      bgClass: "bg-yellow-300",
      content: (
        <Image src="/once.svg" alt="Once" width={20} height={20} />
      ),
      onClick: onSendOnce,
    },
    {
      bgClass: "bg-blue-400",
      content: (
        <Image src="/later.svg" alt="Later" width={20} height={20} />
      ),
      onClick: onSendLater,
    },
    {
      bgClass: "bg-red-500",
      content: (
        <Image src="/bomb.svg" alt="Bomb" width={20} height={20} />
      ),
      onClick: onSendBomb,
    },
  ];

  return (
    <div
      className="fixed bottom-2 sm:bottom-20 left-0 right-0 mx-auto max-w-screen-xl
        grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4"
      style={{ height: 56 }}
    >
      <div className="flex justify-start">
        <StackedButtons buttons={leftButtons} size={48} />
      </div>

      <input
        type="text"
        placeholder="Type here..."
        className="w-full rounded-full border-4 text-black border-[#FCE9CE] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSend();
        }}
      />

      <div className="flex justify-end">
        <StackedButtons buttons={rightButtons} size={48} />
      </div>
    </div>
  );
}
