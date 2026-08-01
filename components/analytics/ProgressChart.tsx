"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Label,
  ListBox,
  Select,
  Skeleton,
} from "@heroui/react";
import type { EChartsCoreOption } from "echarts/core";
import { TrendingUp } from "lucide-react";

import { useClassStudents, useProgressChart } from "@/hooks/queries";
import type { ClassComparison } from "@/types";

import { EChart } from "./EChart";

type ProgressChartProps = {
  classes: Array<Pick<ClassComparison, "classId" | "className">>;
};

const WIB_DATE_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jakarta",
});

const MINIMUM_CHART_WIDTH = 640;
const WIDTH_PER_POINT = 96;

export function ProgressChart({ classes }: ProgressChartProps) {
  const [selectedClassId, setSelectedClassId] = useState(classes[0].classId);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null
  );
  const students = useClassStudents(selectedClassId);
  const progress = useProgressChart(
    selectedClassId,
    selectedStudentId ?? undefined
  );
  const points = useMemo(
    () => progress.data?.points ?? [],
    [progress.data?.points]
  );
  const mode =
    progress.data?.mode ??
    (selectedStudentId === null ? "class" : "student");
  const option = useMemo<EChartsCoreOption>(() => {
    const categories = points.map(
      (point) =>
        `${WIB_DATE_FORMATTER.format(new Date(point.finishedAt))}\n${point.challengeTitle}`
    );
    const maximumScore = Math.max(1, ...points.map((point) => point.score));

    return {
      animationDuration: 400,
      aria: {
        enabled: true,
        description:
          mode === "class"
            ? "Grafik garis rata-rata skor mentah terbaru setiap siswa per challenge."
            : "Grafik garis seluruh skor mentah final siswa secara kronologis.",
      },
      grid: {
        left: 20,
        right: 28,
        top: 24,
        bottom: 72,
      },
      tooltip: {
        trigger: "axis",
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: categories,
        axisTick: { show: false },
        axisLabel: {
          color: "#64748b",
          width: 88,
          overflow: "truncate",
          lineHeight: 18,
        },
      },
      yAxis: {
        type: "value",
        min: 0,
        max: Math.ceil(maximumScore * 1.1),
        splitLine: { lineStyle: { color: "#e2e8f0" } },
        axisLabel: { color: "#64748b" },
      },
      series: [
        {
          name:
            mode === "class"
              ? "Rata-rata skor mentah"
              : "Skor mentah siswa",
          type: "line",
          smooth: 0.2,
          showSymbol: true,
          symbol: "circle",
          symbolSize: 8,
          connectNulls: false,
          lineStyle: {
            color: "#0f766e",
            width: 3,
          },
          itemStyle: {
            color: "#0f766e",
            borderColor: "#ffffff",
            borderWidth: 2,
          },
          areaStyle: {
            color: "rgba(20, 184, 166, 0.14)",
          },
          data: points.map((point) => point.score),
        },
      ],
    };
  }, [mode, points]);
  const chartWidth = Math.max(
    MINIMUM_CHART_WIDTH,
    points.length * WIDTH_PER_POINT
  );

  return (
    <section aria-label="Progres belajar dari waktu ke waktu">
      <Card className="min-w-0 items-stretch overflow-hidden">
        <Card.Header>
          <div className="flex w-full min-w-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <TrendingUp
                  aria-hidden="true"
                  className="shrink-0 text-teal-700 dark:text-teal-300"
                  size={20}
                />
                <Card.Title>Progres dari Waktu ke Waktu</Card.Title>
              </div>
              <Card.Description>
                Skor mentah final; bobot maksimum setiap challenge dapat
                berbeda.
              </Card.Description>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto">
              <Select
                aria-label="Pilih kelas progres belajar"
                className="w-full lg:w-56"
                value={selectedClassId}
                variant="secondary"
                onChange={(key) => {
                  if (key !== null) {
                    setSelectedClassId(Number(key));
                    setSelectedStudentId(null);
                  }
                }}
              >
                <Label>Kelas/sekolah</Label>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {classes.map((classItem) => (
                      <ListBox.Item
                        key={classItem.classId}
                        id={classItem.classId}
                        textValue={classItem.className}
                      >
                        {classItem.className}
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>

              {students.isLoading ? (
                <Skeleton
                  aria-label="Memuat pilihan siswa"
                  className="h-14 w-full rounded-xl lg:w-64"
                />
              ) : (
                <Select
                  aria-label="Pilih mode progres siswa"
                  className="w-full lg:w-64"
                  isDisabled={students.isError}
                  value={selectedStudentId ?? "class"}
                  variant="secondary"
                  onChange={(key) =>
                    setSelectedStudentId(
                      key === null || key === "class" ? null : Number(key)
                    )
                  }
                >
                  <Label>Tampilan</Label>
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      <ListBox.Item
                        id="class"
                        textValue="Rata-rata kelas"
                      >
                        Rata-rata kelas
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                      {(students.data ?? []).map((student) => (
                        <ListBox.Item
                          key={student.studentId}
                          id={student.studentId}
                          textValue={student.name}
                        >
                          {student.name}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              )}
            </div>
          </div>
        </Card.Header>

        <Card.Content className="min-w-0">
          {students.isError ? (
            <Alert status="warning">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description>
                  Daftar siswa gagal dimuat. Rata-rata kelas tetap tersedia.
                </Alert.Description>
              </Alert.Content>
              <Button
                size="sm"
                variant="secondary"
                onPress={() => students.refetch()}
              >
                Muat siswa
              </Button>
            </Alert>
          ) : null}

          {progress.isLoading ? (
            <Skeleton
              aria-label="Memuat grafik progres belajar"
              className="h-80 w-full rounded-xl"
            />
          ) : null}

          {progress.isError ? (
            <Alert status="danger">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description>
                  Grafik progres gagal dimuat.
                </Alert.Description>
              </Alert.Content>
              <Button
                size="sm"
                variant="secondary"
                onPress={() => progress.refetch()}
              >
                Coba lagi
              </Button>
            </Alert>
          ) : null}

          {!progress.isLoading &&
          !progress.isError &&
          points.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 px-4 text-center dark:border-white/10">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Belum ada skor final untuk pilihan ini.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Attempt dengan esai pending belum dihitung.
              </p>
            </div>
          ) : null}

          {!progress.isLoading &&
          !progress.isError &&
          points.length > 0 ? (
            <div
              data-testid="progress-chart-scroller"
              className="max-w-full overflow-x-auto overscroll-x-contain"
            >
              <div
                data-testid="progress-chart-canvas"
                style={{ minWidth: "100%", width: chartWidth }}
              >
                <EChart
                  ariaLabel={
                    mode === "class"
                      ? "Progres rata-rata skor mentah kelas dari waktu ke waktu"
                      : "Progres skor mentah siswa dari waktu ke waktu"
                  }
                  height={320}
                  option={option}
                />
              </div>
            </div>
          ) : null}
        </Card.Content>
      </Card>
    </section>
  );
}
