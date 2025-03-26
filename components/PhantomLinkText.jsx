import Link from "next/link";
import React from "react";
import FuzzyText from "./FuzzyText";

const PhantomLinkText = () => {
  return (
    <div className="flex justify-center items-center">
      <p
        className="
        text-blue-300 font-phantom dark:text-blue-300 opacity-80 hover:opacity-100 hover:text-cyan-400 transition-all duration-300 tracking-wide shadow-md hover:shadow-cyan-500/50 cursor-pointer
      "
      >
        <Link href="/com">
          <FuzzyText>Phantom Link</FuzzyText>
        </Link>
      </p>
    </div>
  );
};

export default PhantomLinkText;
