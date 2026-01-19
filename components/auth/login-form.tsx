"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useLoading } from "@/contexts/LoadingContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Loader2, Key, Eye, EyeOff } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { SignInResponse } from "next-auth/react"; // Tambahkan import ini

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().optional(),
  mode: z.enum(["otp", "password"]),
});

const LoginForm = () => {
  const [isPending, startTransition] = useTransition();
  const { loading, setLoading } = useLoading();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [loginMode, setLoginMode] = useState<"otp" | "password">("otp");
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      mode: "otp",
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setLoading(true);
    setIsSubmitting(true);

    try {
      if (values.mode === "otp") {
        const res = await fetch("/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: values.email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to send OTP");
        toast.success("OTP sent to your email!");
        router.push(
          `/auth/verify-otp?email=${encodeURIComponent(values.email)}`,
        );
      } else {
        // Login dengan password pakai next-auth
        const res = (await signIn("credentials", {
          email: values.email,
          password: values.password,
          mode: "password",
          redirect: true,
          callbackUrl: "/dashboard",
        })) as SignInResponse | undefined; // Tambahkan tipe di sini

        if (res?.error) {
          toast.error(res.error || "Login failed");
        } else {
          toast.success("Login successful!");
          router.push("/"); // redirect ke dashboard
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        ref={formRef}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5"
      >
        {/* Toggle metode login */}
        <div className="flex w-full mb-4">
          <Button
            type="button"
            variant={loginMode === "otp" ? "default" : "outline"}
            className={`w-1/2 rounded-r-none text-black dark:text-white ${
              loginMode === "otp" ? "shadow-md" : ""
            }`}
            onClick={() => {
              setLoginMode("otp");
              form.setValue("mode", "otp");
            }}
            disabled={loading}
          >
            OTP
          </Button>
          <Button
            type="button"
            variant={loginMode === "password" ? "default" : "outline"}
            className={`w-1/2 rounded-l-none text-black dark:text-white ${
              loginMode === "password" ? "shadow-md" : ""
            }`}
            onClick={() => {
              setLoginMode("password");
              form.setValue("mode", "password");
            }}
            disabled={loading}
          >
            Password
          </Button>
        </div>

        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute start-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-700 dark:text-neutral-200" />
                  <Input
                    {...field}
                    type="email"
                    placeholder="Email"
                    name="email"
                    className="ps-13 pe-12 h-14 rounded-xl bg-neutral-100 dark:bg-slate-800 border border-neutral-300 dark:border-slate-700 focus:border-primary dark:focus:border-primary focus-visible:border-primary shadow-none! ring-0!"
                    disabled={loading}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password Field (hanya jika mode password) */}
        {loginMode === "password" && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Key className="absolute start-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-700 dark:text-neutral-200" />
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      name="password"
                      className="ps-13 pe-12 h-14 rounded-xl bg-neutral-100 dark:bg-slate-800 border border-neutral-300 dark:border-slate-700 focus:border-primary dark:focus:border-primary focus-visible:border-primary shadow-none! ring-0!"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute end-5 top-1/2 transform -translate-y-1/2 text-neutral-700 dark:text-neutral-200"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full rounded-lg h-[52px] text-sm mt-2"
          disabled={loading || isPending}
        >
          {isSubmitting || isPending ? (
            <>
              <Loader2 className="animate-spin h-4.5 w-4.5 mr-2" />
              {loginMode === "otp" ? "Sending OTP..." : "Logging in..."}
            </>
          ) : loginMode === "otp" ? (
            "Send OTP"
          ) : (
            "Login"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default LoginForm;
