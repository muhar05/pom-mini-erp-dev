"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import id from "@/locales/id.json";
import en from "@/locales/en.json";

type Translations = typeof id;
type Language = "id" | "en";

interface I18nContextType {
    locale: Language;
    setLocale: (lang: Language) => void;
    t: (key: string) => string;
}

const translations: Record<Language, any> = { id, en };

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState<Language>("id");
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const savedLocale = localStorage.getItem("locale") as Language;
        if (savedLocale && (savedLocale === "id" || savedLocale === "en")) {
            setLocaleState(savedLocale);
        }
    }, []);

    const setLocale = useCallback((lang: Language) => {
        setLocaleState(lang);
        localStorage.setItem("locale", lang);
    }, []);

    const t = useCallback((keyPath: string): string => {
        const keys = keyPath.split(".");
        let current = translations[locale];

        for (const key of keys) {
            if (!current || typeof current !== 'object' || current[key] === undefined) {
                // Fallback to ID if key not found in current locale
                let fallback = translations["id"];
                for (const fKey of keys) {
                    if (!fallback || typeof fallback !== 'object' || fallback[fKey] === undefined) return keyPath;
                    fallback = fallback[fKey];
                }
                return typeof fallback === "string" ? fallback : keyPath;
            }
            current = current[key];
        }

        return typeof current === "string" ? current : keyPath;
    }, [locale]);

    const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

    // Prevent hydration mismatch by only rendering children after mount
    // OR we can render with default 'id' and then update, but children must handle it
    // Given the complexity of the dashboard, let's just render normally 
    // but be aware of hydration warnings.

    return (
        <I18nContext.Provider value={value}>
            {children}
        </I18nContext.Provider>
    );
}


export function useI18n() {
    const context = useContext(I18nContext);
    if (context === undefined) {
        throw new Error("useI18n must be used within an I18nProvider");
    }
    return context;
}
