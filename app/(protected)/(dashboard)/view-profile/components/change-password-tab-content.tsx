"use client"

import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { changePasswordAction } from '@/app/actions/profile';
import toast from 'react-hot-toast';

const ChangePasswordTabContent = () => {
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Handle password change submission.
     * Prevents default, sends data to server action, and handles response.
     */
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        setIsLoading(true);
        try {
            const result = await changePasswordAction(formData);
            if (result.success) {
                toast.success(result.success);
                // Clear the form fields after successful change
                (e.target as HTMLFormElement).reset();
            } else if (result.error) {
                toast.error(result.error);
            }
        } catch (error) {
            console.error("Change password error:", error);
            toast.error("Terjadi kesalahan sistem saat mengubah password");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="p-6">
            <div className="mb-8">
                <h6 className="text-lg font-bold text-neutral-800 dark:text-neutral-100 mb-1 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    Keamanan Akun
                </h6>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Gunakan password yang kuat untuk menjaga keamanan akun Anda.</p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
                {/* Old Password Field */}
                <div>
                    <Label htmlFor="old_password" title="Password Lama" className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">
                        Password Lama <span className="text-red-600">*</span>
                    </Label>
                    <div className="relative">
                        <Input
                            id="old_password"
                            name="old_password"
                            type={showOldPassword ? "text" : "password"}
                            placeholder="Masukkan Password Lama"
                            required
                            className="ps-5 pe-12 h-[48px] rounded-lg border border-neutral-300 dark:border-slate-700"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setShowOldPassword(!showOldPassword)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 !p-0 hover:bg-transparent"
                        >
                            {showOldPassword ? <EyeOff className="w-4 h-4 text-neutral-400" /> : <Eye className="w-4 h-4 text-neutral-400" />}
                        </Button>
                    </div>
                </div>

                {/* New Password Field */}
                <div>
                    <Label htmlFor="new_password" title="Password Baru" className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">
                        Password Baru <span className="text-red-600">*</span>
                    </Label>
                    <div className="relative">
                        <Input
                            id="new_password"
                            name="new_password"
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Masukkan Password Baru"
                            required
                            minLength={8}
                            className="ps-5 pe-12 h-[48px] rounded-lg border border-neutral-300 dark:border-slate-700"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 !p-0 hover:bg-transparent"
                        >
                            {showNewPassword ? <EyeOff className="w-4 h-4 text-neutral-400" /> : <Eye className="w-4 h-4 text-neutral-400" />}
                        </Button>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1.5 ml-1">Password baru minimal harus terdiri dari 8 karakter.</p>
                </div>

                {/* Confirm Password Field */}
                <div>
                    <Label htmlFor="confirm_password" title="Konfirmasi Password" className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">
                        Konfirmasi Password Baru <span className="text-red-600">*</span>
                    </Label>
                    <div className="relative">
                        <Input
                            id="confirm_password"
                            name="confirm_password"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Ulangi Password Baru"
                            required
                            className="ps-5 pe-12 h-[48px] rounded-lg border border-neutral-300 dark:border-slate-700"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 !p-0 hover:bg-transparent"
                        >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4 text-neutral-400" /> : <Eye className="w-4 h-4 text-neutral-400" />}
                        </Button>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-neutral-100 dark:border-neutral-800">
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="h-[48px] px-10 rounded-lg min-w-[170px] font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/10 transition-all hover:translate-y-[-1px] active:translate-y-[0px]"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Memproses...
                            </>
                        ) : 'Update Password'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ChangePasswordTabContent;
