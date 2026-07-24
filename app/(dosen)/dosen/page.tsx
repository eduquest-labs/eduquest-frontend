import { auth } from "@/auth";
import {
  DashboardMotionProvider,
  DashboardPageHeader,
  DashboardQuickLinks,
  DosenDashboard,
} from "@/components/dashboard";

export default async function DosenPage() {
  const session = await auth();

  return (
    <DashboardMotionProvider>
      <div className="flex min-w-0 flex-col gap-8 overflow-x-hidden p-4 sm:p-8">
        <DashboardPageHeader lecturerName={session?.user.name} />
        <DosenDashboard />
        <DashboardQuickLinks />
      </div>
    </DashboardMotionProvider>
  );
}
