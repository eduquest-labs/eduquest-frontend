export default function OfflinePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
      <h1 className="text-xl font-semibold">Tidak ada koneksi internet</h1>
      <p className="text-sm text-(--foreground)/70">
        Periksa koneksi kamu lalu coba lagi. Progress yang sudah disimpan di server tidak hilang.
      </p>
    </main>
  );
}
