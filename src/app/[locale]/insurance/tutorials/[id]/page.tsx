import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import InsuranceTutorialDetail from "@/components/features/insurance/TutorialDetail";
import { tutorials } from "@/components/features/insurance/InsuranceTutorial";

// Tutorial content data
const tutorialContent: Record<string, any> = {
  "insurance-basics": {
    sections: [
      {
        titleKey: "tutorials.articles.basics.sections.what.title",
        contentKey: "tutorials.articles.basics.sections.what.content",
        type: "text",
      },
      {
        titleKey: "tutorials.articles.basics.sections.types.title",
        contentKey: "tutorials.articles.basics.sections.types.content",
        type: "list",
        items: [
          "tutorials.articles.basics.sections.types.items.compulsory",
          "tutorials.articles.basics.sections.types.items.voluntary",
        ],
      },
      {
        titleKey: "tutorials.articles.basics.sections.benefits.title",
        contentKey: "tutorials.articles.basics.sections.benefits.content",
        type: "text",
      },
      {
        titleKey: "tutorials.articles.basics.sections.choose.title",
        contentKey: "tutorials.articles.basics.sections.choose.content",
        type: "text",
      },
    ],
    relatedArticles: ["compulsory-insurance-vietnam", "claims-process-guide"],
  },
  "compulsory-insurance-vietnam": {
    sections: [
      {
        titleKey: "tutorials.articles.compulsory.sections.overview.title",
        contentKey: "tutorials.articles.compulsory.sections.overview.content",
        type: "text",
      },
      {
        titleKey: "tutorials.articles.compulsory.sections.types.title",
        contentKey: "tutorials.articles.compulsory.sections.types.content",
        type: "text",
      },
      {
        titleKey: "tutorials.articles.compulsory.sections.vehicle.title",
        contentKey: "tutorials.articles.compulsory.sections.vehicle.content",
        type: "text",
      },
      {
        titleKey: "tutorials.articles.compulsory.sections.requirements.title",
        contentKey:
          "tutorials.articles.compulsory.sections.requirements.content",
        type: "list",
        items: [
          "tutorials.articles.compulsory.sections.requirements.items.registration",
          "tutorials.articles.compulsory.sections.requirements.items.inspection",
          "tutorials.articles.compulsory.sections.requirements.items.documents",
        ],
      },
      {
        titleKey: "tutorials.articles.compulsory.sections.penalties.title",
        contentKey: "tutorials.articles.compulsory.sections.penalties.content",
        type: "text",
      },
    ],
    relatedArticles: ["calculate-vehicle-insurance", "insurance-basics"],
  },
  "calculate-vehicle-insurance": {
    sections: [
      {
        titleKey: "tutorials.articles.calculation.sections.factors.title",
        contentKey: "tutorials.articles.calculation.sections.factors.content",
        type: "list",
        items: [
          "tutorials.articles.calculation.sections.factors.items.vehicleType",
          "tutorials.articles.calculation.sections.factors.items.capacity",
          "tutorials.articles.calculation.sections.factors.items.purpose",
          "tutorials.articles.calculation.sections.factors.items.seats",
        ],
      },
      {
        titleKey: "tutorials.articles.calculation.sections.formula.title",
        contentKey: "tutorials.articles.calculation.sections.formula.content",
        type: "formula",
      },
      {
        titleKey: "tutorials.articles.calculation.sections.examples.title",
        contentKey: "tutorials.articles.calculation.sections.examples.content",
        type: "text",
      },
      {
        titleKey: "tutorials.articles.calculation.sections.tools.title",
        contentKey: "tutorials.articles.calculation.sections.tools.content",
        type: "text",
      },
    ],
    relatedArticles: ["compulsory-insurance-vietnam", "fee-tables"],
  },
  "claims-process-guide": {
    sections: [
      {
        titleKey: "tutorials.articles.claims.sections.when.title",
        contentKey: "tutorials.articles.claims.sections.when.content",
        type: "text",
      },
      {
        titleKey: "tutorials.articles.claims.sections.steps.title",
        contentKey: "tutorials.articles.claims.sections.steps.content",
        type: "steps",
        steps: [
          "tutorials.articles.claims.sections.steps.items.report",
          "tutorials.articles.claims.sections.steps.items.documents",
          "tutorials.articles.claims.sections.steps.items.assessment",
          "tutorials.articles.claims.sections.steps.items.approval",
          "tutorials.articles.claims.sections.steps.items.payment",
        ],
      },
      {
        titleKey: "tutorials.articles.claims.sections.documents.title",
        contentKey: "tutorials.articles.claims.sections.documents.content",
        type: "list",
        items: [
          "tutorials.articles.claims.sections.documents.items.claimForm",
          "tutorials.articles.claims.sections.documents.items.policy",
          "tutorials.articles.claims.sections.documents.items.idCard",
          "tutorials.articles.claims.sections.documents.items.evidence",
          "tutorials.articles.claims.sections.documents.items.policeReport",
        ],
      },
      {
        titleKey: "tutorials.articles.claims.sections.timeline.title",
        contentKey: "tutorials.articles.claims.sections.timeline.content",
        type: "text",
      },
      {
        titleKey: "tutorials.articles.claims.sections.tips.title",
        contentKey: "tutorials.articles.claims.sections.tips.content",
        type: "tips",
      },
    ],
    relatedArticles: ["insurance-basics", "compulsory-insurance-vietnam"],
  },
  "health-insurance-guide": {
    sections: [
      {
        titleKey: "tutorials.articles.health.sections.overview.title",
        contentKey: "tutorials.articles.health.sections.overview.content",
        type: "text",
      },
      {
        titleKey: "tutorials.articles.health.sections.coverage.title",
        contentKey: "tutorials.articles.health.sections.coverage.content",
        type: "list",
        items: [
          "tutorials.articles.health.sections.coverage.items.inpatient",
          "tutorials.articles.health.sections.coverage.items.outpatient",
          "tutorials.articles.health.sections.coverage.items.emergency",
          "tutorials.articles.health.sections.coverage.items.dental",
          "tutorials.articles.health.sections.coverage.items.maternity",
        ],
      },
      {
        titleKey: "tutorials.articles.health.sections.exclusions.title",
        contentKey: "tutorials.articles.health.sections.exclusions.content",
        type: "list",
        items: [
          "tutorials.articles.health.sections.exclusions.items.preExisting",
          "tutorials.articles.health.sections.exclusions.items.cosmetic",
          "tutorials.articles.health.sections.exclusions.items.experimental",
        ],
      },
      {
        titleKey: "tutorials.articles.health.sections.choose.title",
        contentKey: "tutorials.articles.health.sections.choose.content",
        type: "text",
      },
    ],
    relatedArticles: ["insurance-basics"],
  },
  "property-insurance-basics": {
    sections: [
      {
        titleKey: "tutorials.articles.property.sections.what.title",
        contentKey: "tutorials.articles.property.sections.what.content",
        type: "text",
      },
      {
        titleKey: "tutorials.articles.property.sections.coverage.title",
        contentKey: "tutorials.articles.property.sections.coverage.content",
        type: "list",
        items: [
          "tutorials.articles.property.sections.coverage.items.fire",
          "tutorials.articles.property.sections.coverage.items.natural",
          "tutorials.articles.property.sections.coverage.items.theft",
          "tutorials.articles.property.sections.coverage.items.water",
        ],
      },
      {
        titleKey: "tutorials.articles.property.sections.factors.title",
        contentKey: "tutorials.articles.property.sections.factors.content",
        type: "text",
      },
    ],
    relatedArticles: ["insurance-basics"],
  },
};

interface TutorialPageProps {
  params: {
    locale: string;
    id: string;
  };
}

export async function generateMetadata({
  params: { locale, id },
}: TutorialPageProps) {
  const t = await getTranslations({ locale, namespace: "insurance" });
  const tutorial = tutorials.find((t) => t.id === id);

  if (!tutorial) {
    return {
      title: "Tutorial Not Found",
    };
  }

  return {
    title: t(tutorial.titleKey),
    description: t(tutorial.descriptionKey),
  };
}

export default async function TutorialPage({
  params: { locale, id },
}: TutorialPageProps) {
  const tutorial = tutorials.find((t) => t.id === id);

  if (!tutorial) {
    notFound();
  }

  const content = tutorialContent[id];

  return (
    <InsuranceTutorialDetail
      tutorial={tutorial}
      content={content}
      locale={locale}
    />
  );
}
