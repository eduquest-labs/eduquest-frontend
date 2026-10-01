import { useQuery } from "@tanstack/react-query";
import { getBankMaterial, listBankFolders, listBankMaterials } from "@/services/modules";
import type { BankListParams } from "@/types";
export const bankKeys = { all: ["activity-bank"] as const, folders: ["activity-bank", "folders"] as const, list: (params: BankListParams) => ["activity-bank", "list", params] as const, detail: (id: number) => ["activity-bank", "detail", id] as const };
export function useBankFolders() { return useQuery({ queryKey: bankKeys.folders, queryFn: listBankFolders }); }
export function useBankMaterials(params: BankListParams) { return useQuery({ queryKey: bankKeys.list(params), queryFn: () => listBankMaterials(params) }); }
export function useBankMaterial(id: number | null) { return useQuery({ queryKey: bankKeys.detail(id ?? 0), queryFn: () => getBankMaterial(id!), enabled: id !== null }); }
