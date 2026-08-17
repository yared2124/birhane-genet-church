"use client";

import { KpiCards } from "@/components/modules/dashboard/KpiCards";
import { RevenueChart } from "@/components/modules/dashboard/RevenueChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-lg border border-gold-200/30 bg-gradient-to-r from-gold-500/10 via-gold-400/5 to-transparent p-6 dark:border-gold-800/30">
        <h1 className="text-2xl font-bold text-gold-700 dark:text-gold-300">
          እንኳን ደህና መጡ, {user?.fullName || "ወደ ስርዓቱ"}
        </h1>
        <p className="text-sm text-muted-foreground">
          የቤተክርስቲያኒቱ አሁን ያለው ሁኔታ አጠቃላይ እይታ
        </p>
      </div>

      {/* KPI Cards */}
      <KpiCards />

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <RevenueChart />
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No recent activity to display.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
