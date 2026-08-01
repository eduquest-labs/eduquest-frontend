"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Alert, Button, FieldError, Form, Input, Label, Skeleton, TextField, toast } from "@heroui/react";

import { authKeys, useMe } from "@/hooks/queries";
import { resendEmailVerification, updateStudentProfile } from "@/services/modules";

export function StudentProfilePage() {
  const me = useMe();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [emailOverride, setEmailOverride] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => { if (searchParams.get("email_verified") === "1") { void queryClient.invalidateQueries({ queryKey: authKeys.me }); toast.success("Email berhasil diverifikasi."); } }, [queryClient, searchParams]);

  if (me.isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48 rounded-lg" /><Skeleton className="h-64 w-full rounded-2xl" /></div>;
  if (!me.data) return <Alert status="danger"><Alert.Indicator /><Alert.Content><Alert.Description>Profil gagal dimuat.</Alert.Description></Alert.Content></Alert>;

  const email = emailOverride ?? me.data.email ?? "";

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalized)) { setEmailError("Format email tidak valid."); return; }
    setIsSaving(true);
    try {
      const updated = await updateStudentProfile(normalized);
      queryClient.setQueryData(authKeys.me, updated);
      setEmailOverride(updated.email);
      toast.success("Email diperbarui. Cek inbox untuk verifikasi.");
      setEmailError(null);
    } catch {
      setEmailError("Email tidak dapat digunakan atau gagal disimpan.");
    } finally { setIsSaving(false); }
  }

  return (
    <section className="mx-auto w-full max-w-2xl space-y-5">
      <div><h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Profil</h1><p className="mt-1 text-sm text-slate-500">Kelola email untuk login. Nama dan NISN berasal dari data sekolah.</p></div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-6">
        <dl className="grid gap-4 border-b border-slate-100 pb-5 dark:border-white/10 sm:grid-cols-2"><div><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Nama</dt><dd className="mt-1 font-medium">{me.data.name}</dd></div><div><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">NISN</dt><dd className="mt-1 font-mono font-medium">{me.data.nisn}</dd></div></dl>
        <Form onSubmit={save} validationBehavior="aria" className="mt-5 flex flex-col gap-4">
          <TextField name="email" type="email" value={email} onChange={setEmailOverride} isInvalid={Boolean(emailError)} isDisabled={isSaving}><Label>Email</Label><Input fullWidth autoComplete="email" />{emailError ? <FieldError>{emailError}</FieldError> : null}</TextField>
          <Alert status={me.data.emailVerified ? "success" : "warning"}><Alert.Indicator /><Alert.Content><Alert.Description>{me.data.emailVerified ? "Email sudah terverifikasi dan dapat digunakan untuk login." : "Email belum terverifikasi. Untuk sementara, login menggunakan NISN."}</Alert.Description></Alert.Content></Alert>
          <div className="flex flex-col gap-3 sm:flex-row"><Button type="submit" isPending={isSaving} isDisabled={isSaving} className="bg-teal-600 text-white">Simpan email</Button>{!me.data.emailVerified ? <Button type="button" variant="secondary" isPending={isResending} onPress={async () => { setIsResending(true); try { await resendEmailVerification(); toast.success("Jika email belum terverifikasi, tautan baru akan dikirim."); } catch { toast.danger("Tautan verifikasi belum dapat dikirim."); } finally { setIsResending(false); } }}>Kirim ulang verifikasi</Button> : null}</div>
        </Form>
      </div>
    </section>
  );
}
