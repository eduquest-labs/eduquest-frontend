"use client";

import { Alert, Button, Card, Skeleton } from "@heroui/react";
import { BarChart3, Info, School } from "lucide-react";

import { useClassComparison } from "@/hooks/queries";

import { AverageScoreChart } from "./AverageScoreChart";
import { ClassComparisonDetails } from "./ClassComparisonDetails";
import { ScoreDistributionChart } from "./ScoreDistributionChart";

function AnalyticsSkeleton() {
  return (
    <div aria-label="Memuat perbandingan kelas" className="grid gap-4 lg:grid-cols-2">
      {[1, 2].map((item) => (
        <Card key={item} className="items-stretch">
          <Card.Header>
            <div className="flex w-full flex-col gap-2">
              <Skeleton className="h-5 w-44 rounded" />
              <Skeleton className="h-4 w-64 max-w-full rounded" />
            </div>
          </Card.Header>
          <Card.Content>
            <Skeleton className="h-72 w-full rounded-xl" />
          </Card.Content>
        </Card>
      ))}
    </div>
  );
}

export function AnalyticsPageClient() {
  const comparison = useClassComparison();
  const comparisons = comparison.data ?? [];
  const hasFinalScores = comparisons.some(
    (item) => item.scoredAttemptCount > 0
  );

  return (
    <div className="flex min-w-0 flex-col gap-6 overflow-x-hidden p-4 sm:p-8">
      <header>
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-400/10 dark:text-teal-300">
            <BarChart3 aria-hidden="true" size={20} />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Analitik antar kelas
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Snapshot perbandingan hasil seluruh kelas/sekolah yang Anda
              kelola.
            </p>
          </div>
        </div>
      </header>

      <Alert status="accent">
        <Alert.Indicator>
          <Info aria-hidden="true" size={18} />
        </Alert.Indicator>
        <Alert.Content>
          <Alert.Description>
            Perbandingan menggunakan skor mentah. Interpretasikan hasil bersama
            bobot maksimum challenge masing-masing; attempt dengan esai pending
            belum masuk statistik skor final.
          </Alert.Description>
        </Alert.Content>
      </Alert>

      {comparison.isError ? (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>
              Perbandingan kelas gagal dimuat.
            </Alert.Description>
          </Alert.Content>
          <Button
            size="sm"
            variant="secondary"
            onPress={() => comparison.refetch()}
          >
            Coba lagi
          </Button>
        </Alert>
      ) : null}

      {comparison.isLoading ? <AnalyticsSkeleton /> : null}

      {!comparison.isLoading &&
      !comparison.isError &&
      comparisons.length === 0 ? (
        <Card className="items-center py-12 text-center">
          <School aria-hidden="true" className="text-slate-400" size={28} />
          <Card.Title>Belum ada kelas</Card.Title>
          <Card.Description>
            Buat kelas/sekolah terlebih dahulu agar perbandingan dapat
            ditampilkan.
          </Card.Description>
        </Card>
      ) : null}

      {!comparison.isLoading &&
      !comparison.isError &&
      comparisons.length > 0 ? (
        <>
          {hasFinalScores ? (
            <section
              aria-label="Visualisasi perbandingan kelas"
              className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2"
            >
              <AverageScoreChart comparisons={comparisons} />
              <ScoreDistributionChart comparisons={comparisons} />
            </section>
          ) : (
            <Alert status="warning">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description>
                  Belum ada skor final. Attempt terkunci yang masih menunggu
                  penilaian esai tetap terlihat pada detail kelas.
                </Alert.Description>
              </Alert.Content>
            </Alert>
          )}

          <ClassComparisonDetails comparisons={comparisons} />
        </>
      ) : null}
    </div>
  );
}
