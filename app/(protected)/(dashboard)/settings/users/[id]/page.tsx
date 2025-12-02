import React from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { getUserById } from "@/app/actions/user-actions";
import { notFound } from "next/navigation";

interface UserDetailPageProps {
  params: {
    id: string;
  };
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  try {
    const user = await getUserById(parseInt(params.id));

    if (!user) {
      notFound();
    }

    return (
      <>
        <DashboardBreadcrumb
          title="User Details"
          text="View detailed user information"
        />

        {/* Header with Back Button and Actions */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/settings/users">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Users
            </Button>
          </Link>

          <div className="flex gap-2">
            <Link href={`/settings/users/${user.id}/edit`}>
              <Button className="gap-2 bg-green-600 hover:bg-green-700">
                <Edit className="w-4 h-4" />
                Edit User
              </Button>
            </Link>
            <Button variant="destructive" className="gap-2">
              <Trash2 className="w-4 h-4" />
              Delete User
            </Button>
          </div>
        </div>

        {/* User Information Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl">{user.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Full Name
                      </label>
                      <p className="text-base">{user.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Email Address
                      </label>
                      <p className="text-base">{user.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Role
                      </label>
                      <div>
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary"
                        >
                          {user.roles?.role_name || "No Role"}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        User ID
                      </label>
                      <p className="text-base">#{user.id}</p>
                    </div>
                  </div>
                </div>

                {/* Account Status */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Account Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Account Created
                      </label>
                      <p className="text-base">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Login Method
                      </label>
                      <p className="text-base">
                        <Badge variant="outline">OTP via Email</Badge>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Log Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {user.user_logs && user.user_logs.length > 0 ? (
                  <div className="space-y-3">
                    {user.user_logs.map((log, index) => (
                      <div
                        key={index}
                        className="border-l-2 border-primary/20 pl-4 pb-3"
                      >
                        <p className="text-sm font-medium">{log.activity}</p>
                        <p className="text-xs text-muted-foreground">
                          {log.created_at
                            ? new Date(log.created_at).toLocaleDateString()
                            : "-"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {log.endpoint} - {log.method}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No recent activity found.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  } catch (error) {
    notFound();
  }
}
