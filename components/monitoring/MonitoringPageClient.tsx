"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  Chip,
  Label,
  ListBox,
  Select,
  Skeleton,
} from "@heroui/react";
import { Radio, RefreshCw } from "lucide-react";

import { useClasses, useMonitoring } from "@/hooks/queries";
import { formatTimeID } from "@/lib/utils";

import { MonitoringFeed } from "./MonitoringFeed";

const WIB_TIME_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZone: "Asia/Jakarta",
});

export function MonitoringPageClient() {
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const classes = useClasses();
  const monitoring = useMonitoring(selectedClassId);
  const selectedClassName =
    classes.data?.find((classItem) => classItem.id === selectedClassId)?.name ??
    "Semua kelas";
  const isRefreshing = monitoring.isFetching && !monitoring.isLoading;
  const lastUpdated =
    monitoring.dataUpdatedAt > 0
      ? formatTimeID(WIB_TIME_FORMATTER, new Date(monitoring.dataUpdatedAt))
      : null;

  return (
    <div className="flex min-w-0 flex-col gap-6 overflow-x-hidden p-4 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Monitoring Live
            </h1>
            <Chip color="success" size="sm" variant="soft">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-current"
              />
              Live
            </Chip>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Pantau siswa yang sedang mengerjakan atau baru mengumpulkan
            challenge. Feed diperbarui otomatis setiap 5 detik.
          </p>
        </div>

        {classes.isLoading ? (
          <Skeleton
            aria-label="Memuat filter kelas monitoring"
            className="h-14 w-full rounded-xl sm:w-56"
          />
        ) : (
          <Select
            aria-label="Filter monitoring berdasarkan kelas"
            className="w-full sm:w-56"
            isDisabled={classes.isError}
            value={selectedClassId ?? "all"}
            variant="secondary"
            onChange={(key) =>
              setSelectedClassId(
                key === null || key === "all" ? null : Number(key)
              )
            }
          >
            <Label>Kelas/sekolah</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="all" textValue="Semua kelas">
                  Semua kelas
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                {(classes.data ?? []).map((classItem) => (
                  <ListBox.Item
                    key={classItem.id}
                    id={classItem.id}
                    textValue={classItem.name}
                  >
                    {classItem.name}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        )}
      </div>

      <div
        aria-live="polite"
        className="flex min-h-7 flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500"
      >
        <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300">
          <Radio aria-hidden="true" size={13} className="shrink-0 text-teal-600" />
          <span className="truncate">Menampilkan {selectedClassName}</span>
        </span>
        {isRefreshing ? (
          <span className="inline-flex items-center gap-1.5">
            <RefreshCw aria-hidden="true" size={13} className="animate-spin" />
            Memperbarui feed…
          </span>
        ) : lastUpdated ? (
          <span>Terakhir diperbarui {lastUpdated} WIB</span>
        ) : null}
      </div>

      {classes.isError ? (
        <Alert status="warning">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>
              Daftar kelas gagal dimuat. Feed seluruh kelas tetap tersedia.
            </Alert.Description>
          </Alert.Content>
          <Button
            size="sm"
            variant="secondary"
            onPress={() => classes.refetch()}
          >
            Coba lagi
          </Button>
        </Alert>
      ) : null}

      {monitoring.isError ? (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>
              Feed monitoring gagal diperbarui.
            </Alert.Description>
          </Alert.Content>
          <Button
            size="sm"
            variant="secondary"
            onPress={() => monitoring.refetch()}
          >
            Coba lagi
          </Button>
        </Alert>
      ) : null}

      <MonitoringFeed
        activities={monitoring.data ?? []}
        isLoading={monitoring.isLoading}
        isError={monitoring.isError && monitoring.data === undefined}
      />
    </div>
  );
}
