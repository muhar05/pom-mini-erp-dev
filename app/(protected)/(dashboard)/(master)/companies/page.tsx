import CompaniesClient from "./_components/companies-client";
import { getAllCompaniesAction } from "@/app/actions/companies";
import { serializeDecimal } from "@/utils/formatDecimal";

export default async function CompanyPage() {
  const data = await getAllCompaniesAction();
  const companies = JSON.parse(JSON.stringify(data.map(serializeDecimal)));
  return <CompaniesClient companies={companies} />;
}
