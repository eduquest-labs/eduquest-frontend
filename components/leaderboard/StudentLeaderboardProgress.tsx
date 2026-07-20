"use client";

import { useState } from "react";

import { Alert, Skeleton } from "@heroui/react";

import {
  useLeaderboard,
  useMyPoints,
  useProgress,
} from "@/hooks/queries";

import { LeaderboardTable } from "./LeaderboardTable";
import { ProgressTracker } from "./ProgressTracker";

export function StudentLeaderboardProgress() {
  const points = useMyPoints();
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const selectedClass =
    points.data?.classes.find((item) => item.id === selectedClassId) ??
    points.data?.classes[0] ??
    null;
  const classId = selectedClass?.id ?? 0;
  const classStudentId = selectedClass?.classStudentId ?? 0;
  const leaderboard = useLeaderboard(
    classId,
    selectedTopicId,
    selectedClass !== null
  );
  const progress = useProgress(
    classId,
    classStudentId,
    selectedTopicId,
    selectedClass !== null
  );

  if (points.isLoading) {
    return (
      <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]">
        <Skeleton className="h-96 rounded-2xl" />
        <Skeleton className="h-52 rounded-2xl" />
      </section>
    );
  }

  if (points.isError || !points.data) {
    return (
      <Alert status="danger">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Description>
            Daftar kelas untuk leaderboard gagal dimuat.
          </Alert.Description>
        </Alert.Content>
      </Alert>
    );
  }

  if (selectedClass === null) {
    return (
      <Alert status="warning">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Description>
            Anda belum terdaftar pada kelas mana pun.
          </Alert.Description>
        </Alert.Content>
      </Alert>
    );
  }

  return (
    <section className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]">
      <LeaderboardTable
        classes={points.data.classes}
        data={leaderboard.data}
        isError={leaderboard.isError}
        isLoading={leaderboard.isLoading}
        selectedClassId={selectedClass.id}
        selectedTopicId={selectedTopicId}
        onClassChange={(classId) => {
          setSelectedClassId(classId);
          setSelectedTopicId(null);
        }}
        onRetry={() => leaderboard.refetch()}
        onTopicChange={setSelectedTopicId}
      />
      <ProgressTracker
        data={progress.data}
        isError={progress.isError}
        isLoading={progress.isLoading}
        onRetry={() => progress.refetch()}
      />
    </section>
  );
}
