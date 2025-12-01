"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import ThemeLogo from "@/components/shared/theme-logo"; // pastikan path sesuai
import { signIn } from "next-auth/react";

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "OTP invalid");
      toast.success("Login success!");
      const result = await signIn("credentials", {
        email,
        password: otp,
        redirect: true,
        callbackUrl: "/dashboard",
      });
    } catch (err: any) {
      toast.error(err.message || "OTP invalid");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24 bg-white dark:bg-slate-800 p-8 rounded-xl shadow">
      <div className="flex flex-col items-center mb-6">
        <ThemeLogo />
        <h2 className="text-2xl font-bold mb-1">Verifikasi OTP</h2>
        <p className="text-sm text-neutral-500 mb-2 text-center">
          Masukkan kode OTP yang dikirim ke email{" "}
          <span className="font-medium">{email}</span>
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          className="h-14 rounded-xl bg-neutral-100 dark:bg-slate-800 border border-neutral-300 dark:border-slate-700 focus:border-primary dark:focus:border-primary focus-visible:border-primary shadow-none! ring-0! text-lg text-center tracking-widest"
          maxLength={6}
        />
        <Button
          type="submit"
          className="w-full rounded-lg h-[52px] text-sm mt-2"
          disabled={loading}
        >
          {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
          Verify OTP
        </Button>
      </form>
    </div>
  );
}
