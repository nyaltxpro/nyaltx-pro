// app/legal-advice/page.tsx
import LegalAdviceClient from "@/page-components/LegalAdvice";
import client from "../../../../tina/__generated__/client";

export default async function LegalAdvicePage() {
  // Fetch the legal advice page content via Tina CMS
  const res = await client.queries.legalAdvice({
    relativePath: "legaladvice.json", // Make sure your file matches this path
  });

  return <LegalAdviceClient {...res} />;
}
