"use client";

import React from "react";
import Image from "next/image";

export default function Banner() {
  return (
    <div className="relative w-[70%]">
      {/* Banner background */}
      <Image
        src="/banner.jpg" // place banner.jpg inside public/
        alt="Banner"
        width={1600}
        height={200}
        className="w-full h-auto rounded-lg"
        priority
      />
    </div>
  );
}
