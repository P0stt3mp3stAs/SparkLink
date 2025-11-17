"use client";

type CardProps = {
  activeIndex: number;
};

export default function StackedCards({ activeIndex }: CardProps) {
  const cards = [
    {
      bg: "bg-yellow-400",
      text: "This is the Yellow Card",
    },
    {
      bg: "bg-blue-400",
      text: "This is the Blue Card",
    },
    {
      bg: "bg-green-400",
      text: "This is the Green Card",
    },
    {
      bg: "bg-red-400",
      text: "This is the Red Card",
    },
  ];

  const card = cards[activeIndex];

  return (
    <div
      className={`
        mt-10 w-64 h-40 rounded-3xl text-black flex items-center justify-center
        text-lg font-semibold shadow-lg transition-all duration-300
        ${card.bg}
      `}
    >
      {card.text}
    </div>
  );
}
