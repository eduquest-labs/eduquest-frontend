"use client";

import Link from "next/link";
import { Alert, Button, Card, Skeleton } from "@heroui/react";
import { BarChart3, School, Users } from "lucide-react";

import { useSuperadminSchools } from "@/hooks/queries";

const NUMBER_FORMATTER = new Intl.NumberFormat("id-ID");

type StatCardProps = {
  label: string;
  value: number | undefined;
  isLoading: boolean;
  icon: typeof School;
};

function StatCard({ label, value, isLoading, icon: Icon }: StatCardProps) {
  return (
    <Card className="items-stretch">
      <Card.Content className="flex-row items-center gap-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-400/10 dark:text-teal-300">
          <Icon aria-hidden="true" size={20} />
        </span>
        <div className="min-w-0">
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          {isLoading ? (
            <Skeleton className="mt-1 h-7 w-16 rounded" />
          ) : (
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">
              {NUMBER_FORMATTER.format(value ?? 0)}
            </p>
          )}
        </div>
      </Card.Content>
    </Card>
  );
}

const QUICK_LINKS = [
  {
    href: "/superadmin/schools",
    label: "Kelola Sekolah",
    description: "Tambah, ubah, atau hapus sekolah yang dapat dipilih guru.",
    icon: School,
  },
  {
    href: "/superadmin/guru",
    label: "Kelola Guru",
    description: "Lihat, ubah, nonaktifkan, atau aktifkan kembali akun guru.",
    icon: Users,
  },
  {
    href: "/superadmin/analytics",
    label: "Analitik Sekolah",
    description: "Bandingkan rata-rata dan distribusi skor mentah antar sekolah.",
    icon: BarChart3,
  },
];

export function SuperadminDashboardPageClient() {
  const schools = useSuperadminSchools();
  const data = schools.data ?? [];
  const totalSchools = data.length;
  const totalGuru = data.reduce((sum, school) => sum + school.guruCount, 0);
  const totalStudents = data.reduce((sum, school) => sum + school.studentCount, 0);

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Dashboard Superadmin
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Ringkasan sekolah, guru, dan siswa dalam riset EduQuest.
        </p>
      </div>

      {schools.isError ? (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>Ringkasan gagal dimuat.</Alert.Description>
          </Alert.Content>
          <Button size="sm" variant="secondary" onPress={() => schools.refetch()}>
            Coba lagi
          </Button>
        </Alert>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={School}
          isLoading={schools.isLoading}
          label="Total Sekolah"
          value={totalSchools}
        />
        <StatCard
          icon={Users}
          isLoading={schools.isLoading}
          label="Total Guru"
          value={totalGuru}
        />
        <StatCard
          icon={Users}
          isLoading={schools.isLoading}
          label="Total Siswa"
          value={totalStudents}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {QUICK_LINKS.map(({ href, label, description, icon: Icon }) => (
          <Link key={href} href={href}>
            <Card className="h-full items-stretch transition-colors hover:border-teal-300 dark:hover:border-teal-600">
              <Card.Header className="flex-row items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-400/10 dark:text-teal-300">
                  <Icon aria-hidden="true" size={18} />
                </span>
                <Card.Title>{label}</Card.Title>
              </Card.Header>
              <Card.Content>
                <Card.Description>{description}</Card.Description>
              </Card.Content>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
