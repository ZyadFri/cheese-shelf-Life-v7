import { api } from "@/lib/api";
import { PageBody } from "@/components/page-shell";
import { ExplainabilityView } from "@/components/explainability-view";

export default async function ExplainabilityPage() {
  const [{ models }, schema] = await Promise.all([api.models(), api.schema()]);

  return (
    <PageBody className="relative isolate max-w-[1480px] overflow-hidden pb-14 pt-0 sm:px-5 lg:px-7">
      <ExplainabilityView models={models} featureCount={schema.all_feature_columns.length} />
    </PageBody>
  );
}
