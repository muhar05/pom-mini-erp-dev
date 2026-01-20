import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function QuotationDetailSkeleton() {
  return (
    <div className="w-full mx-auto py-4 space-y-6 animate-pulse">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded mb-2" />
          <div className="flex items-center gap-2 mt-2">
            <div className="h-6 w-24 bg-gray-200 rounded" />
            <div className="h-6 w-16 bg-gray-200 rounded" />
            <div className="h-6 w-16 bg-gray-200 rounded" />
            <div className="h-6 w-8 bg-gray-200 rounded" />
          </div>
          <div className="h-4 w-32 bg-gray-200 rounded mt-2" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Customer Information Skeleton */}
        <div className="space-y-6">
          <Card className="dark:bg-gray-800 border dark:border-gray-700 h-full">
            <CardHeader className="pb-4 border-b dark:border-gray-700">
              <CardTitle className="h-6 w-40 bg-gray-200 rounded" />
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-3">
                {[...Array(7)].map((_, i) => (
                  <div key={i}>
                    <div className="h-4 w-24 bg-gray-200 rounded mb-1" />
                    <div className="h-6 w-full bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle: BOQ Table & Pricing Summary Skeleton */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="h-6 w-40 bg-gray-200 rounded" />
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="h-8 w-full bg-gray-200 rounded mb-2" />
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-6 w-full bg-gray-200 rounded mb-2"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="h-6 w-40 bg-gray-200 rounded" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-6 w-full bg-gray-200 rounded mb-2" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
