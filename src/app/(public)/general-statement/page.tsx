// app/general-statement/page.tsx
import GeneralStatementClient from "@/page-components/GeneralStatement";
import client from "../../../../tina/__generated__/client";

export default async function GeneralStatementPage() {
  const res = await client.queries.generalStatement({
    relativePath: "generalstatement.json",
  });

  return <GeneralStatementClient {...res} />;
}
