import Homepage from "@/app/pages/homepage";
import { getHomepageConfig } from "@/configs/homepage-config";

// In a real app, the company could be determined from the domain, user session, or locale.
// For now, we'll use the default.
const company = "finzone";

export default function Home() {
  const homepageConfig = getHomepageConfig(company);

  return <Homepage config={homepageConfig} />;
}
