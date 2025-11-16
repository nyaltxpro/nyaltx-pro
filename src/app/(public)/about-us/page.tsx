// app/about/page.tsx
import AboutClient from "@/page-components/Aboutus";
import type { Metadata } from "next";
import client from "../../../../tina/__generated__/client";

export const metadata: Metadata = {
  title: "About NYALTX – The Project Visibility Platform",
  description:
    "Learn who we are and how NYALTX.pro helps Web3 projects share their story, showcase their work, and reach a wider audience.",
  openGraph: {
    title: "About NYALTX – The Project Visibility Platform",
    description:
      "Learn who we are and how NYALTX.pro helps Web3 projects share their story, showcase their work, and reach a wider audience.",
    type: "website",
  },
};

export default async function AboutPage() {
  const res = await client.queries.aboutUs({
    relativePath: "aboutus.json", // match your file
  });

  return <AboutClient {...res} />;
}
