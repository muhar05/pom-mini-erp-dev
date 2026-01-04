export function isDecimal(value: any) {
  // Deteksi instance Decimal dan juga plain object hasil Prisma
  return (
    value &&
    typeof value === "object" &&
    ((typeof value.toNumber === "function" &&
      typeof value.toString === "function") ||
      // Fallback: deteksi struktur khas Decimal Prisma
      (Object.keys(value).length === 3 &&
        "s" in value &&
        "e" in value &&
        "d" in value))
  );
}

export function serializeDecimal(obj: any): any {
  if (obj == null) return obj;
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(serializeDecimal);

  // Handle Date objects
  if (obj instanceof Date) {
    return obj; // Jangan serialize Date object
  }

  const result: any = {};
  for (const key in obj) {
    const value = obj[key];
    if (value instanceof Date) {
      result[key] = value; // Pertahankan Date object
    } else if (isDecimal(value)) {
      result[key] =
        typeof value.toNumber === "function"
          ? value.toNumber()
          : parseFloat(value.toString());
    } else if (typeof value === "object" && value !== null) {
      result[key] = serializeDecimal(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}
