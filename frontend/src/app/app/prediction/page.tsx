import { api } from "@/lib/api";
import { PageBody } from "@/components/page-shell";
import { PredictionV6StoreProvider } from "@/components/prediction-v6-store";
import { PredictionV6Flow } from "@/components/prediction-v6-flow";

export default async function PredictionPage() {
  const { catalog } = await api.cheeseCatalog();

  return (
    <PageBody className="relative isolate max-w-[1480px] overflow-hidden px-4 pb-24 pt-0 sm:px-5 lg:px-7">
      <PredictionV6StoreProvider>
        <PredictionV6Flow catalog={catalog} />
      </PredictionV6StoreProvider>
    </PageBody>
  );
}
