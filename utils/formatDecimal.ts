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
  if (obj === null || obj === undefined) return obj;
  if (isDecimal(obj)) {
    // Jika ada toNumber, pakai itu. Jika tidak, konversi manual.
    if (typeof obj.toNumber === "function") return obj.toNumber();
    // Fallback: konversi manual dari struktur Decimal Prisma
    // (hanya untuk kasus d=[angka], e=eksponen, s=sign)
    try {
      // Prisma Decimal: { s: 1, e: 6, d: [7500000] } => 7500000
      // Prisma Decimal: { s: 1, e: 7, d: [1,2500000] } => 12500000
      const digits = Array.isArray(obj.d) ? Number(obj.d.join("")) : 0;
      const value =
        obj.s * digits * Math.pow(10, obj.e - String(digits).length);
      return value;
    } catch {
      return null;
    }
  }
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) return obj.map(serializeDecimal);
  if (typeof obj === "object") {
    const result: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = serializeDecimal(obj[key]);
      }
    }
    return result;
  }
  return obj;
}
