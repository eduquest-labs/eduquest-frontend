import { Card, Chip } from "@heroui/react";

import type { ClassComparison } from "@/types";

type ClassComparisonDetailsProps = {
  comparisons: ClassComparison[];
};

const NUMBER_FORMATTER = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 2,
});

function formatScore(score: number | null): string {
  return score === null ? "—" : NUMBER_FORMATTER.format(score);
}

export function ClassComparisonDetails({
  comparisons,
}: ClassComparisonDetailsProps) {
  return (
    <section aria-labelledby="comparison-details-title">
      <div className="mb-3">
        <h2
          id="comparison-details-title"
          className="text-lg font-semibold text-slate-900 dark:text-white"
        >
          Detail per kelas/sekolah
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Angka distribusi tidak memuat identitas atau skor individual siswa.
        </p>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
        {comparisons.map((comparison) => {
          const pendingCount =
            comparison.lockedAttemptCount - comparison.scoredAttemptCount;

          return (
            <Card
              key={comparison.classId}
              className="min-w-0 items-stretch"
            >
              <Card.Header className="flex-row items-start justify-between gap-3">
                <div className="min-w-0">
                  <Card.Title className="wrap-break-word">
                    {comparison.className}
                  </Card.Title>
                  <Card.Description>
                    {NUMBER_FORMATTER.format(comparison.studentCount)} siswa
                  </Card.Description>
                </div>
                {pendingCount > 0 ? (
                  <Chip color="warning" size="sm" variant="soft">
                    {NUMBER_FORMATTER.format(pendingCount)} pending
                  </Chip>
                ) : (
                  <Chip color="success" size="sm" variant="soft">
                    Final
                  </Chip>
                )}
              </Card.Header>
              <Card.Content>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
                  <div>
                    <dt className="text-xs text-slate-500">Attempt locked</dt>
                    <dd className="mt-1 font-semibold text-slate-900 dark:text-white">
                      {NUMBER_FORMATTER.format(
                        comparison.lockedAttemptCount
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Skor final</dt>
                    <dd className="mt-1 font-semibold text-slate-900 dark:text-white">
                      {NUMBER_FORMATTER.format(
                        comparison.scoredAttemptCount
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Rata-rata</dt>
                    <dd className="mt-1 font-semibold text-slate-900 dark:text-white">
                      {formatScore(comparison.averageScore)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Minimum</dt>
                    <dd className="mt-1 font-semibold text-slate-900 dark:text-white">
                      {formatScore(comparison.minimumScore)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Median</dt>
                    <dd className="mt-1 font-semibold text-slate-900 dark:text-white">
                      {formatScore(comparison.medianScore)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Maksimum</dt>
                    <dd className="mt-1 font-semibold text-slate-900 dark:text-white">
                      {formatScore(comparison.maximumScore)}
                    </dd>
                  </div>
                </dl>
              </Card.Content>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
