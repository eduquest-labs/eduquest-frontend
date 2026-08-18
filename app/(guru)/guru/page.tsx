import { auth } from "@/auth";
import {
  DashboardMotionProvider,
  DashboardPageHeader,
  DashboardQuickLinks,
  GuruDashboard,
} from "@/components/dashboard";

export default async function GuruPage() {
  const session = await auth();

  return (
    <DashboardMotionProvider>
      <div className="flex min-w-0 flex-col gap-8 overflow-x-hidden p-4 sm:p-8">
        <DashboardPageHeader lecturerName={session?.user.name} />
        <GuruDashboard />
        <DashboardQuickLinks />
      </div>
    </DashboardMotionProvider>
  );
}
