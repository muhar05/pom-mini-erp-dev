import { getCompanyByIdAction } from "@/app/actions/companies";
import CompanyDetail from "../_components/company-detail";
import { serializeDecimal } from "@/utils/formatDecimal";

export default async function CompanyDetailPage(props: {
  params: { id: string };
}) {
  const { params } = props;
  const companyRaw = await getCompanyByIdAction(Number(params.id));
  const company = JSON.parse(JSON.stringify(serializeDecimal(companyRaw)));
  return <CompanyDetail company={company} />;
}
