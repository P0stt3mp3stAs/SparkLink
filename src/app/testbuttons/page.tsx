import StackedButtons from '@/components/StackedButtons';

export default function Send() {
  // your original buttons
  const buttons = [
    {
      bgClass: 'bg-green-500',
      content: <img src="/send.svg" alt="Send" className="w-5 h-5" />,
    },
    {
      bgClass: 'bg-yellow-300',
      content: <img src="/once.svg" alt="Once" className="w-5 h-5" />,
    },
    {
      bgClass: 'bg-blue-400',
      content: <img src="/later.svg" alt="Later" className="w-5 h-5" />,
    },
    {
      bgClass: 'bg-red-500',
      content: <img src="/bomb.svg" alt="Bomb" className="w-5 h-5 pt-0.5" />,
    },
  ];

  const newButtons = [
    {
      bgClass: 'bg-gray-700',
      content: <img src="/audio.svg" alt="Audio" className="w-5 h-5"/>,
    },
    {
      bgClass: 'bg-gray-300',
      content: <img src="/media.svg" alt="Media" className="w-5 h-5 pb-0.5"/>,
    },
    {
      bgClass: 'bg-green-400',
      content: <img src="/location.svg" alt="Location" className="w-7 h-7"/>,
    },
    {
      bgClass: 'bg-pink-500',
      content: <img src="/gift.svg" alt="Gift" className="w-7 h-7"/>,
    },
  ];

  return (
    <div className="h-screen w-screen">
      {/* Fixed bottom container with grid */}
      <div
        className="fixed bottom-20 left-0 right-0 mx-auto max-w-screen-xl
                   grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4"
        style={{ height: 56 }} // height to fit buttons + input nicely
      >
        {/* Left buttons (small width) */}
        <div className="flex justify-start">
          <StackedButtons buttons={newButtons} size={48} />
        </div>

        {/* Center input (takes full available width) */}
        <div className="w-full">
          <input
            type="text"
            placeholder="Type here..."
            className="w-full rounded-full border border-green-600 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Right buttons (small width) */}
        <div className="flex justify-end">
          <StackedButtons buttons={buttons} size={48} />
        </div>
      </div>
    </div>
  );
}
