import CompaniesClient from "./_components/companies-client";
import { getAllCompaniesAction } from "@/app/actions/companies";
import { serializeDecimal } from "@/utils/formatDecimal";

export default async function CompanyPage() {
  const data = await getAllCompaniesAction();
  const companies = JSON.parse(JSON.stringify(data.map(serializeDecimal)));
  console.log("SERIALIZED COMPANIES", JSON.stringify(companies)); // Ini akan error jika masih ada fungsi
  return <CompaniesClient companies={companies} />;
}
