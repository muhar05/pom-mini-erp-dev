"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/contexts/i18n-context";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Simple flags or just text
const FlagID = () => <span className="mr-2">🇮🇩</span>;
const FlagEN = () => <span className="mr-2">🇺🇸</span>;

const LanguageSelect = () => {
  const { locale, setLocale } = useI18n();

  return (
    <Select value={locale} onValueChange={(val) => setLocale(val as "id" | "en")}>
      <SelectTrigger
        className={cn(
          "focus-visible:ring-0 border-0 bg-gray-200/75 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 !h-10 dark:text-white cursor-pointer data-[state=open]:bg-gray-300 dark:data-[state=open]:bg-slate-600 sm:max-w-[unset] max-w-[80px] px-3 data-[placeholder]:text-neutral-800"
        )}
      >
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="id" className="cursor-pointer">
            <div className="flex items-center">
              <FlagID />
              <span>ID</span>
            </div>
          </SelectItem>
          <SelectItem value="en" className="cursor-pointer">
            <div className="flex items-center">
              <FlagEN />
              <span>EN</span>
            </div>
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default LanguageSelect;
