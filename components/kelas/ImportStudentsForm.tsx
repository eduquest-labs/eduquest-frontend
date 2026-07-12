"use client";

import { useRef, useState } from "react";
import { isAxiosError } from "axios";
import { Download, Upload } from "lucide-react";

import { Alert, Button, Table } from "@heroui/react";

import { useImportStudents } from "@/hooks/mutations";
import { importStudentsSchema } from "@/lib/validations";
import type { ImportStudentsResult } from "@/types";

export interface ImportStudentsFormProps {
  classId: number;
}

const TEMPLATE_CSV_CONTENT = "name,nis\nBudi Santoso,1001\nSiti Aminah,1002\n";

function downloadTemplateCsv() {
  const blob = new Blob([TEMPLATE_CSV_CONTENT], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "template-import-siswa.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export function ImportStudentsForm({ classId }: ImportStudentsFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [formAlert, setFormAlert] = useState<string | null>(null);
  const [result, setResult] = useState<ImportStudentsResult | null>(null);
  const importStudents = useImportStudents(classId);

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
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              File CSV/Excel Siswa
            </label>
            <button
              type="button"
              onClick={downloadTemplateCsv}
              className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-teal-700 hover:underline dark:text-teal-300"
            >
              <Download size={13} />
              Unduh template
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10">
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
            <span className="min-w-0 truncate text-sm text-slate-500 dark:text-slate-400">
              {file ? file.name : "Belum ada file dipilih"}
            </span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Format: CSV/XLSX/XLS, kolom <code>name</code> dan <code>nis</code>, maksimal 5 MB.
          </p>
          {fileError ? <p className="text-sm text-danger">{fileError}</p> : null}
        </div>

        <Button
          type="submit"
          isPending={importStudents.isPending}
          isDisabled={importStudents.isPending || !file}
          fullWidth
          className="bg-teal-600 text-white hover:bg-teal-700 data-[pressed=true]:bg-teal-800"
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
