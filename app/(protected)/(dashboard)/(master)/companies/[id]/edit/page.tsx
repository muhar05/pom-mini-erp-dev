import { getCompanyByIdAction } from "@/app/actions/companies";
import CompanyForm from "../../_components/company-form";
import { serializeDecimal } from "@/utils/formatDecimal";

export default async function EditCompanyPage({
  params,
}: {
  params: { id: string };
}) {
  const companyRaw = await getCompanyByIdAction(Number(params.id));
  const company = JSON.parse(JSON.stringify(serializeDecimal(companyRaw)));
  return <CompanyForm company={company} mode="edit" />;
}
