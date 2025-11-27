import FlowDetailWrapper from "./wrapper";

// Generate static params for static export
export async function generateStaticParams() {
  // For static export with dynamic routes in route groups,
  // we need to return all combinations of params
  const locales = ["vi", "en"];
  const flowIds = ["1", "2", "3"];

  const params = [];
  for (const locale of locales) {
    for (const flowId of flowIds) {
      params.push({ locale, flowId });
    }
  }

  return params;
}

export default async function FlowDetailPage({
  params,
}: {
  params: Promise<{ flowId: string }>;
}) {
  const { flowId } = await params;
  return <FlowDetailWrapper flowId={flowId} />;
}
