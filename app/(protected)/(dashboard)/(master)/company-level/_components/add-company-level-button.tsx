"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AddCompanyLevelButton() {
  return (
    <Link href="/company-level/new" passHref>
      <Button variant="default" className="mb-2">
        Add Company Level
      </Button>
    </Link>
  );
}
