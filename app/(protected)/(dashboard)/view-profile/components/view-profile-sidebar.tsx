'use client';

import { useSession } from "@/contexts/session-context";
import { User, Mail, Shield } from 'lucide-react';

/**
 * Sidebar component for the profile page.
 * Displays user avatar (initials), name, email, and role dynamically from session.
 */
const ViewProfileSidebar = () => {
    const session = useSession();
    const user = session?.user;

    return (
        <div className="user-grid-card relative border border-slate-200 dark:border-slate-600 rounded-2xl overflow-hidden bg-white dark:bg-[#273142] h-full shadow-sm">
            {/* Cover Banner */}
            <div className="h-32 bg-gradient-to-r from-primary to-blue-600 w-full" />

            <div className="pb-6 px-6 -mt-16">
                {/* Header Profile */}
                <div className="text-center border-b border-slate-100 dark:border-slate-700 pb-8 mb-6">
                    <div className="relative inline-block">
                        <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 bg-neutral-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden mx-auto shadow-md">
                            <span className="text-4xl font-black text-primary uppercase">
                                {user?.name?.charAt(0) || 'U'}
                            </span>
                        </div>
                    </div>
                    <h6 className="mb-1 mt-4 text-xl font-bold text-neutral-800 dark:text-neutral-100">{user?.name || 'User'}</h6>
                    <p className="text-neutral-500 dark:text-neutral-300 text-sm font-medium">{user?.email || 'N/A'}</p>
                    <div className="mt-3 inline-flex items-center px-4 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                        {user?.role_name || 'Staff'}
                    </div>
                </div>

                {/* Details List */}
                <div className="px-2">
                    <h6 className="text-[10px] font-black uppercase tracking-[0.1em] text-neutral-400 mb-5">Detail Akun</h6>
                    <ul className="space-y-5">
                        <li className="flex items-start gap-4">
                            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                <User className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className="block text-[10px] uppercase font-bold text-neutral-400 tracking-tight">Nama Lengkap</span>
                                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 block truncate">{user?.name || '-'}</span>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                <Mail className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className="block text-[10px] uppercase font-bold text-neutral-400 tracking-tight">Email Utama</span>
                                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 block truncate">{user?.email || '-'}</span>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                <Shield className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className="block text-[10px] uppercase font-bold text-neutral-400 tracking-tight">Role Akses</span>
                                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 block truncate">{user?.role_name || '-'}</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ViewProfileSidebar;