import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { api } from "@/lib/api";
import { PageBody } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { ClassificationForm } from "@/components/classification-form";

export default async function ClassificationRunPage() {
  const health = await api.classificationHealth();

  if (!health.available) {
    return (
      <PageBody>
        <Card className="surface">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="type-title text-foreground">Classifier artifacts not found</p>
            <p className="max-w-md text-xs text-muted-foreground">
              Run <code className="font-mono">python train_classifier.py</code> to build the classification artifacts, then reload this page.
            </p>
          </CardContent>
        </Card>
      </PageBody>
    );
  }

  const [{ models, best_model, class_definitions }, schema, matrixLookup, ingredientLookup] = await Promise.all([
    api.classificationModels(),
    api.classificationSchema(),
    api.matrixLookup(),
    api.ingredientLookup(),
  ]);

  return (
    <PageBody>
      <div className="mb-6">
        <Link href="/app/classification" className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="size-3.5" /> Back to classification overview
        </Link>
        <h1 className="type-h1 text-foreground">Classify a formulation</h1>
        <p className="type-body mt-2 max-w-[60ch] text-muted-foreground">
          Predicts a Low / Medium / High efficacy tier -- no control input needed.
        </p>
      </div>

      <ClassificationForm
        schema={schema}
        matrixLookup={matrixLookup}
        ingredientLookup={ingredientLookup}
        modelOptions={models.map((m) => m.id)}
        bestModel={best_model}
        classDefinitions={class_definitions}
      />
    </PageBody>
  );
}
