// app/context/session-context.tsx
"use client";
import { createContext, useContext } from "react";

export const SessionContext = createContext<any>(null);
export const useSession = () => useContext(SessionContext);
