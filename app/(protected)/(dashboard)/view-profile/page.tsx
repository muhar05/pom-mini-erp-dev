import ChangePasswordTabContent from "@/app/(protected)/(dashboard)/view-profile/components/change-password-tab-content";
import EditProfileTabContent from "@/app/(protected)/(dashboard)/view-profile/components/edit-profile-tab-content";
import ViewProfileSidebar from "@/app/(protected)/(dashboard)/view-profile/components/view-profile-sidebar";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Metadata } from "next";
import { User, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: "Profile | POM MINI ERP",
  description: "Kelola informasi profil dan keamanan akun Anda.",
};

/**
 * Main Profile Page.
 * Organized into two main sections: Account Information and Account Security.
 */
const ViewProfile = () => {
  return (
    <div className="flex flex-col gap-6">
      <DashboardBreadcrumb title="User Profile" text="Profile" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Sidebar (Live Data) */}
        <div className="col-span-12 lg:col-span-4">
          <ViewProfileSidebar />
        </div>

        {/* Profile Tabs Content */}
        <div className="col-span-12 lg:col-span-8">
          <Card className="border-none shadow-sm h-full">
            <CardContent className="p-0">
              <Tabs defaultValue="editProfile" className="w-full">
                <TabsList className="w-full justify-start rounded-none border-b border-neutral-100 dark:border-neutral-800 bg-transparent h-auto p-0">
                  <TabsTrigger
                    value="editProfile"
                    className="flex items-center gap-2 py-4 px-6 font-bold text-sm text-neutral-500 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent transition-all"
                  >
                    <User className="w-4 h-4" />
                    Informasi Akun
                  </TabsTrigger>
                  <TabsTrigger
                    value="changePassword"
                    className="flex items-center gap-2 py-4 px-6 font-bold text-sm text-neutral-500 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent transition-all"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Keamanan Akun
                  </TabsTrigger>
                </TabsList>

                <div className="p-2">
                  <TabsContent value="editProfile" className="mt-0 outline-none">
                    <EditProfileTabContent />
                  </TabsContent>
                  <TabsContent value="changePassword" className="mt-0 outline-none">
                    <ChangePasswordTabContent />
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;
