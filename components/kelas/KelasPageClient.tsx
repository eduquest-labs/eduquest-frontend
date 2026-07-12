"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Modal } from "@heroui/react";

import { ClassList } from "@/components/kelas/ClassList";
import { CreateClassForm } from "@/components/kelas/CreateClassForm";

export function KelasPageClient() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Kelas Saya</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Buat kelas, bagikan kodenya, dan impor daftar siswa.
          </p>
        </div>

        <Modal>
          <Modal.Trigger className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-teal-700">
            <Plus size={16} />
            Buat Kelas Baru
          </Modal.Trigger>
          <Modal.Backdrop>
            <Modal.Container>
              <Modal.Dialog className="sm:max-w-105">
                {({ close }) => (
                  <>
                    <Modal.CloseTrigger />
                    <Modal.Header>
                      <Modal.Heading className="text-base font-semibold">
                        Buat Kelas Baru
                      </Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                      <CreateClassForm
                        onCreated={(newClass) => {
                          close();
                          router.push(`/dosen/kelas/${newClass.id}`);
                        }}
                      />
                    </Modal.Body>
                  </>
                )}
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
      </div>

      <ClassList />
    </div>
  );
}
