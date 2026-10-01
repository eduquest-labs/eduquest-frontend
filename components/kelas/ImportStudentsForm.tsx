"use client";

import { useRef, useState } from "react";
import { isAxiosError } from "axios";
import { Download, Upload } from "lucide-react";

import { Alert, Button, Table } from "@heroui/react";

import { useDownloadImportTemplate, useImportStudents } from "@/hooks/mutations";
import { importStudentsSchema } from "@/lib/validations";
import type { ImportStudentsResult } from "@/types";

export interface ImportStudentsFormProps {
  classId: number;
}

export function ImportStudentsForm({ classId }: ImportStudentsFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [formAlert, setFormAlert] = useState<string | null>(null);
  const [result, setResult] = useState<ImportStudentsResult | null>(null);
  const importStudents = useImportStudents(classId);
  const downloadTemplate = useDownloadImportTemplate();

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    setFileError(null);
    setResult(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormAlert(null);
    setResult(null);

    const parsed = importStudentsSchema.safeParse({ file });
    if (!parsed.success) {
      setFileError(parsed.error.flatten().fieldErrors.file?.[0] ?? "File tidak valid");
      return;
    }
    setFileError(null);

    try {
      const importResult = await importStudents.mutateAsync(parsed.data.file);
      setResult(importResult);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 422) {
        setFileError(error.response.data?.errors?.file?.[0] ?? "File tidak valid");
        return;
      }
      setFormAlert("Gagal mengimpor siswa. Silakan coba lagi.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {formAlert ? (
          <Alert status="danger">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>{formAlert}</Alert.Description>
            </Alert.Content>
          </Alert>
        ) : null}

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <label className="text-sm font-medium text-muted">
              File CSV/Excel Siswa
            </label>
            <button
              type="button"
              onClick={() => downloadTemplate.mutate()}
              disabled={downloadTemplate.isPending}
              className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-brand-700 hover:underline disabled:cursor-not-allowed disabled:opacity-60 dark:text-brand-300"
            >
              <Download size={13} />
              {downloadTemplate.isPending ? "Menyiapkan..." : "Unduh template"}
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface px-3.5 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-background dark:border-border dark:bg-surface-secondary dark:text-ink-200 dark:hover:bg-white/10">
              <Upload size={15} />
              Pilih File
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="sr-only"
                disabled={importStudents.isPending}
              />
            </label>
            <span className="min-w-0 truncate text-sm text-muted">
              {file ? file.name : "Belum ada file dipilih"}
            </span>
          </div>
          <p className="text-xs text-ink-400 dark:text-muted">
            Format: CSV/XLSX/XLS, kolom <code>name</code>, <code>nisn</code> (10 digit), dan{" "}
            <code>jenis_kelamin</code> (L/P), maksimal 5 MB.
          </p>
          {fileError ? <p className="text-sm text-danger">{fileError}</p> : null}
        </div>

        <Button
          type="submit"
          isPending={importStudents.isPending}
          isDisabled={importStudents.isPending || !file}
          fullWidth
          className="bg-primary text-primary-foreground hover:bg-primary-hover data-[pressed=true]:bg-primary-pressed"
        >
          {({ isPending }) => (isPending ? "Mengimpor..." : "Impor Siswa")}
        </Button>
      </form>

      {result ? (
        <div className="flex flex-col gap-3">
          <Alert status={result.failures.length > 0 ? "warning" : "success"}>
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>
                {result.imported} siswa berhasil diimpor
                {result.failures.length > 0
                  ? `, ${result.failures.length} baris gagal.`
                  : "."}
              </Alert.Description>
            </Alert.Content>
          </Alert>

          {result.failures.length > 0 ? (
            <Table>
              <Table.ScrollContainer>
                <Table.Content aria-label="Baris gagal impor" className="min-w-100">
                  <Table.Header>
                    <Table.Column isRowHeader>Baris</Table.Column>
                    <Table.Column>Kesalahan</Table.Column>
                  </Table.Header>
                  <Table.Body>
                    {result.failures.map((failure) => (
                      <Table.Row key={failure.row}>
                        <Table.Cell>{failure.row}</Table.Cell>
                        <Table.Cell>{failure.errors.join(", ")}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Content>
              </Table.ScrollContainer>
            </Table>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
