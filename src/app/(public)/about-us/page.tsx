// app/about/page.tsx
import AboutClient from "@/page-components/Aboutus";
import client from "../../../../tina/__generated__/client";

export default async function AboutPage() {
  const res = await client.queries.aboutUs({
    relativePath: "about-us.json", // match your file
  });

  return <AboutClient {...res} />;
}
