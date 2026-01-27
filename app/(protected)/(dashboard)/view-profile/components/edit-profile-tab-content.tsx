'use client';

import React, { useEffect, useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import { useSession } from '@/contexts/session-context';
import { updateProfileNameAction } from '@/app/actions/profile';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const EditProfileTabContent = () => {
    const session = useSession();
    const user = session?.user;

    const [name, setName] = useState(user?.name || "");
    const [isLoading, setIsLoading] = useState(false);

    // Sync state with session user name when loaded
    useEffect(() => {
        if (user?.name) {
            setName(user.name);
        }
    }, [user]);

    const isChanged = name.trim() !== user?.name && name.trim().length >= 2;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isChanged) return;

        setIsLoading(true);
        try {
            const result = await updateProfileNameAction(name);
            if (result.success) {
                toast.success(result.success);
            } else if (result.error) {
                toast.error(result.error);
            }
        } catch (error) {
            console.error("Save profile error:", error);
            toast.error("Terjadi kesalahan yang tidak terduga");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="mb-8">
                <h6 className="text-lg font-bold text-neutral-800 dark:text-neutral-100 mb-1">Informasi Akun</h6>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Kelola informasi dasar profil Anda.</p>
            </div>

            <form onSubmit={handleSave} className="max-w-xl">
                <div className="space-y-6">
                    {/* Email Field - Read Only */}
                    <div>
                        <Label htmlFor="email" className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">
                            Alamat Email
                        </Label>
                        <Input
                            value={user?.email || ""}
                            type="email"
                            id="email"
                            disabled
                            className="bg-neutral-50 dark:bg-slate-800/50 cursor-not-allowed opacity-80 border-neutral-200 dark:border-neutral-700"
                        />
                        <p className="text-[11px] text-neutral-400 mt-1.5 ml-1 italic">Email digunakan untuk login dan tidak dapat diubah.</p>
                    </div>

                    {/* Name Field */}
                    <div>
                        <Label htmlFor="name" className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">
                            Nama Lengkap <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            type="text"
                            id="name"
                            placeholder="Masukkan Nama Lengkap"
                            required
                            className="h-[48px] border-neutral-300 dark:border-neutral-700 focus:border-primary dark:focus:border-primary"
                        />
                        {name.trim().length > 0 && name.trim().length < 2 && (
                            <p className="text-[11px] text-red-500 mt-1.5 ml-1 font-medium">Nama minimal harus terdiri dari 2 karakter.</p>
                        )}
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-neutral-100 dark:border-neutral-800">
                    <Button
                        type="submit"
                        disabled={!isChanged || isLoading}
                        className="h-[48px] px-10 rounded-lg min-w-[160px] font-bold shadow-lg shadow-primary/10 transition-all hover:translate-y-[-1px] active:translate-y-[0px]"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Menyimpan...
                            </>
                        ) : 'Simpan Perubahan'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default EditProfileTabContent;
