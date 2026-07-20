"use client";

import {
  Alert,
  Avatar,
  Button,
  Label,
  ListBox,
  Select,
  Skeleton,
  Table,
} from "@heroui/react";

import type {
  LeaderboardData,
  StudentClassPoints,
} from "@/types";

type LeaderboardTableProps = {
  classes: StudentClassPoints[];
  data: LeaderboardData | undefined;
  selectedClassId: number;
  selectedTopicId: number | null;
  isLoading: boolean;
  isError: boolean;
  onClassChange: (classId: number) => void;
  onTopicChange: (topicId: number | null) => void;
  onRetry: () => void;
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function LeaderboardTable({
  classes,
  data,
  selectedClassId,
  selectedTopicId,
  isLoading,
  isError,
  onClassChange,
  onTopicChange,
  onRetry,
}: LeaderboardTableProps) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Leaderboard
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Peringkat diperbarui otomatis setiap 15 detik.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Select
            aria-label="Pilih kelas leaderboard"
            className="w-full sm:w-48"
            value={selectedClassId}
            variant="secondary"
            onChange={(key) => {
              if (key !== null) onClassChange(Number(key));
            }}
          >
            <Label>Kelas</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {classes.map((classItem) => (
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
          <Select
            aria-label="Filter topik leaderboard"
            className="w-full sm:w-48"
            value={selectedTopicId ?? "all"}
            variant="secondary"
            onChange={(key) =>
              onTopicChange(key === null || key === "all" ? null : Number(key))
            }
          >
            <Label>Topik</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="all" textValue="Semua topik">
                  Semua topik
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                {(data?.topics ?? []).map((topic) => (
                  <ListBox.Item
                    key={topic.id}
                    id={topic.id}
                    textValue={topic.name}
                  >
                    {topic.name}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
      </div>

      <div className="mt-4">
        {isError ? (
          <Alert status="danger">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>
                Leaderboard gagal dimuat.
              </Alert.Description>
            </Alert.Content>
            <Button size="sm" variant="secondary" onPress={onRetry}>
              Coba lagi
            </Button>
          </Alert>
        ) : (
          <Table variant="secondary">
            <Table.ScrollContainer>
              <Table.Content
                aria-label="Peringkat siswa dalam kelas"
                className="min-w-lg"
              >
                <Table.Header>
                  <Table.Column className="w-20">Peringkat</Table.Column>
                  <Table.Column isRowHeader>Siswa</Table.Column>
                  <Table.Column className="text-end">
                    {selectedTopicId === null ? "Poin kelas" : "Skor topik"}
                  </Table.Column>
                </Table.Header>
                <Table.Body>
                  {isLoading
                    ? [1, 2, 3].map((row) => (
                        <Table.Row key={`skeleton-${row}`}>
                          <Table.Cell>
                            <Skeleton className="h-5 w-8 rounded" />
                          </Table.Cell>
                          <Table.Cell>
                            <div className="flex items-center gap-3">
                              <Skeleton className="size-8 rounded-full" />
                              <Skeleton className="h-4 w-32 rounded" />
                            </div>
                          </Table.Cell>
                          <Table.Cell>
                            <Skeleton className="ml-auto h-5 w-16 rounded" />
                          </Table.Cell>
                        </Table.Row>
                      ))
                    : data?.entries.map((entry) => (
                        <Table.Row key={entry.classStudentId}>
                          <Table.Cell className="font-semibold">
                            #{entry.rank}
                          </Table.Cell>
                          <Table.Cell>
                            <div className="flex items-center gap-3">
                              <Avatar size="sm" variant="soft">
                                <Avatar.Fallback>
                                  {initials(entry.studentName)}
                                </Avatar.Fallback>
                              </Avatar>
                              <span className="font-medium">
                                {entry.studentName}
                              </span>
                            </div>
                          </Table.Cell>
                          <Table.Cell className="text-end font-semibold">
                            {entry.score.toLocaleString("id-ID")}
                          </Table.Cell>
                        </Table.Row>
                      ))}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        )}
        {!isLoading && !isError && data?.entries.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            Belum ada siswa pada kelas ini.
          </p>
        ) : null}
      </div>
    </section>
  );
}
