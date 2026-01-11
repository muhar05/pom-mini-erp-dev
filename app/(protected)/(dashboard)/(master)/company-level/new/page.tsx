import { Suspense } from "react";
import NewCompanyLevelClient from "../_components/new-company-level-client";

export default function NewCompanyLevelPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewCompanyLevelClient />
    </Suspense>
  );
}
