import { auth } from "@/auth";

export default async function SiswaPage() {
  const session = await auth();

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <p className="text-lg">Selamat datang, {session?.user.name}.</p>
    </div>
  );
}
