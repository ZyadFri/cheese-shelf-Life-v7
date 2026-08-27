import { api } from "@/lib/api";
import { ProjectGuideChat } from "@/components/project-guide-chat";

export default async function ProjectGuidePage() {
  const [manifest, { models }] = await Promise.all([api.manifest(), api.models()]);

  return (
    <ProjectGuideChat
      context={{
        totalRows: manifest.n_total,
        syntheticRows: manifest.n_synthetic,
        paperDerivedRows: manifest.n_real_paper_derived,
        contexts: manifest.n_contexts_total,
        modelLabels: models.map((model) => model.label),
      }}
    />
  );
}
