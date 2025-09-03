"use client";

import React from "react";
import Image from "next/image";

export default function Banner() {
  return (
    <div className="relative w-[98%] md:w-[70%] py-3">
      {/* Banner background */}
      <Image
        src="/banner.jpg" // place banner.jpg inside public/
        alt="Banner"
        width={1600}
        height={200}
        className="w-full h-[100px] md:h-[140px]  object-cover"
        priority
      />
    </div>
  );
}
