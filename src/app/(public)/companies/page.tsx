import { getPublicCompanyDirectory } from "@/actions/public/growth";
import { PublicCompanyDirectory } from "@/components/public/PublicCompanyDirectory";

export const metadata = {
  title: "Company Directory | ReplaceMe",
};

export const dynamic = "force-dynamic";

export default async function PublicCompaniesPage() {
  const companies = await getPublicCompanyDirectory();
  return <PublicCompanyDirectory companies={companies} />;
}
