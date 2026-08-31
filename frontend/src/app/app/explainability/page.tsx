import { PageBody } from "@/components/page-shell";
import { ExplainabilityView } from "@/components/explainability-view";

export default function ExplainabilityPage() {
  return (
    <PageBody className="relative isolate max-w-[1480px] overflow-hidden pb-14 pt-0 sm:px-5 lg:px-7">
      <ExplainabilityView />
    </PageBody>
  );
}
