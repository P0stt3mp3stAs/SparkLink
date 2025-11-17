export default function SparkelIntro() {
  return (
    <div className="
      w-full h-screen flex flex-col sm:flex-row 
      items-center justify-center 
      p-5 md:p-10 lg:p-16
    ">
      {/* RIGHT — 1/4 width ON DESKTOP, TOP on mobile */}
      <div
        className="
          order-1 sm:order-2
          w-full sm:w-1/4
          h-1/6 sm:h-5/6
          rounded-3xl
          text-black
          bg-gradient-to-b from-[#FCE9CE] to-[#FFF5E6]

          px-4 py-4
          sm:px-2 sm:py-6
          md:px-4 md:py-8
          lg:px-6 lg:py-10

          flex flex-row sm:flex-col
          items-center justify-between sm:justify-center
          gap-3 sm:gap-5 md:gap-6 lg:gap-8
        "
      >
        {/* LEFT GROUP (icon + title+mini logo) */}
        <div
          className="
            flex flex-row sm:flex-col
            items-center 
            gap-2 sm:gap-3 md:gap-4 lg:gap-5
          "
        >
          {/* ICON */}
          <img
            src="/ailp.svg"
            alt="Sparkel Icon"
            className="
              w-12 h-12 
              sm:w-24 sm:h-24 
              md:w-32 md:h-32 
              lg:w-40 lg:h-40
            "
          />

          {/* TITLE + MINI LOGO */}
          <div
            className="
              flex flex-row items-center
              gap-1 sm:gap-2 md:gap-3 lg:gap-4
            "
          >
            <span className="
              text-base sm:text-2xl md:text-3xl lg:text-4xl 
              font-semibold
            ">
              Sparkel
            </span>

            <img
              src="/sprklelogo.svg"
              alt="logo"
              className="
                w-4 h-4 
                sm:w-6 sm:h-6 
                md:w-8 md:h-8 
                lg:w-10 lg:h-10
              "
            />
          </div>
        </div>

        {/* PARAGRAPH */}
        <p
          className="
            text-[8px] 
            sm:text-[9px] 
            md:text-xs 
            lg:text-sm
            leading-relaxed
            text-right sm:text-center
            w-1/2 sm:w-full
            sm:mt-6 md:mt-8 lg:mt-10
          "
        >
          Use ai the way it’s supposed to be used<br />
          meet Sparkel your<br />
          AI relationship advisor
        </p>
      </div>

      {/* LEFT — 3/4 width ON DESKTOP, BOTTOM on mobile */}
      <div
        className="
          order-2 sm:order-1
          w-full sm:w-3/4
          h-5/6
          rounded-3xl
          bg-gradient-to-r from-[#FCE9CE] to-[#FFF5E6]

          p-10 md:p-16 lg:p-20

          flex flex-col justify-center
        "
      >
        {/* Right-aligned button */}
        <div className="flex justify-end w-full mb-8 md:mb-10 lg:mb-12">
          <button className="
            bg-yellow-500 rounded-full 
            px-4 py-2 
            md:px-6 md:py-3 
            lg:px-8 lg:py-4
            text-sm md:text-base lg:text-lg
            font-medium
          ">
            introduce yourself
          </button>
        </div>

        {/* White bubble text */}
        <div className="
          bg-white rounded-3xl md:rounded-4xl
          p-3 md:p-10 lg:p-12 
          w-4/5 
          text-xs sm:text-xs md:text-sm lg:text-base
          leading-relaxed text-black shadow-md
        ">
          <p>
            Hi, I&rsquo;m Sparkel ✨.<br /><br />
            I&rsquo;m here to offer gentle guidance on intimacy, relationships, and emotional wellbeing —
            always with respect and safety.
            <br /><br />
            What&rsquo;s on your mind today?
          </p>
        </div>
      </div>
    </div>
  );
}
