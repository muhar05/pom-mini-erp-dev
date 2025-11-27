"use client";
import { SessionContext } from "./session-context";

export function SessionProvider({
  value,
  children,
}: {
  value: any;
  children: React.ReactNode;
}) {
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}
