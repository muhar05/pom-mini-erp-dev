"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

/**
 * Action to update user's full name.
 * Restricted to the logged-in user only.
 */
export async function updateProfileNameAction(name: string) {
    console.log("=== updateProfileNameAction called ===");
    console.log("Input name:", name);

    const session = await auth();
    console.log("Session user ID:", session?.user?.id);

    if (!session?.user?.id) {
        console.log("ERROR: Unauthorized - no session");
        return { error: "Unauthorized" };
    }

    const userId = Number(session.user.id);
    console.log("Parsed userId:", userId);

    if (!name || name.trim().length < 2) {
        console.log("ERROR: Name validation failed");
        return { error: "Name must be at least 2 characters" };
    }

    try {
        const user = await prisma.users.findUnique({
            where: { id: userId },
            select: { name: true },
        });

        console.log("Current user in DB:", user);

        if (!user) {
            console.log("ERROR: User not found in database");
            return { error: "User not found" };
        }

        const updatedName = name.trim();
        console.log("Updating name to:", updatedName);

        const updateResult = await prisma.users.update({
            where: { id: userId },
            data: { name: updatedName },
        });

        console.log("Update result:", updateResult);

        // Audit log
        await prisma.user_logs.create({
            data: {
                user_id: userId,
                activity: "UPDATE_PROFILE_NAME",
                old_data: JSON.stringify({ name: user.name }),
                new_data: JSON.stringify({ name: updatedName }),
            },
        });

        console.log("Audit log created successfully");
        revalidatePath("/view-profile");
        console.log("Path revalidated");

        return { success: "Name updated successfully" };
    } catch (error) {
        console.error("Update profile name error:", error);
        return { error: "Failed to update name" };
    }
}

/**
 * Action to change user's password.
 * Verifies old password and hashes the new one.
 */
export async function changePasswordAction(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    const userId = Number(session.user.id);
    const oldPassword = formData.get("old_password") as string;
    const newPassword = formData.get("new_password") as string;
    const confirmPassword = formData.get("confirm_password") as string;

    if (!oldPassword || !newPassword || !confirmPassword) {
        return { error: "All fields are required" };
    }

    if (newPassword.length < 8) {
        return { error: "New password must be at least 8 characters" };
    }

    if (newPassword !== confirmPassword) {
        return { error: "Passwords do not match" };
    }

    if (newPassword === oldPassword) {
        return { error: "New password cannot be the same as old password" };
    }

    try {
        const user = await prisma.users.findUnique({
            where: { id: userId },
            select: { password_hash: true },
        });

        if (!user) {
            return { error: "User not found" };
        }

        // Verify old password
        // Support both hashed and plain text (legacy) for transition
        let isMatch = false;
        try {
            isMatch = await bcrypt.compare(oldPassword, user.password_hash);
        } catch (e) {
            // If compare fails (e.g. invalid hash), check plain text
            isMatch = oldPassword === user.password_hash;
        }

        if (!isMatch) {
            return { error: "Incorrect old password" };
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        await prisma.users.update({
            where: { id: userId },
            data: { password_hash: hashedNewPassword },
        });

        // Audit log
        await prisma.user_logs.create({
            data: {
                user_id: userId,
                activity: "CHANGE_PASSWORD",
            },
        });

        return { success: "Password changed successfully" };
    } catch (error) {
        console.error("Change password error:", error);
        return { error: "Failed to change password" };
    }
}
