import { useMemo } from "react";
import { useProvinces } from "@/hooks/locations";
import type { ISelectBoxOption } from "@/components/ui/select-group";

/**
 * Hook to provide all dynamic form options for loan application form
 * Combines API data with static options
 */
export function useFormOptions() {
  const { data: provinces, isLoading: isLoadingProvinces } = useProvinces();

  // Transform provinces to select options
  const locationOptions = useMemo<ISelectBoxOption[]>(() => {
    if (!provinces) return [];
    return provinces.map((province) => ({
      label: province.name,
      value: province.id,
    }));
  }, [provinces]);

  // Static options (these don't change frequently)
  const genderOptions = useMemo<ISelectBoxOption[]>(
    () => [
      { label: "Nam", value: "male" },
      { label: "Nữ", value: "female" },
      { label: "Khác", value: "other" },
    ],
    [],
  );

  const incomeOptions = useMemo<ISelectBoxOption[]>(
    () => [
      { label: "Dưới 5 triệu", value: "<5m" },
      { label: "5 - 10 triệu", value: "5-10m" },
      { label: "10 - 20 triệu", value: "10-20m" },
      { label: "Trên 20 triệu", value: ">20m" },
    ],
    [],
  );

  const careerStatusOptions = useMemo<ISelectBoxOption[]>(
    () => [
      { label: "Nhân viên văn phòng", value: "officer" },
      { label: "Kinh doanh tự do", value: "freelancer" },
      { label: "Công nhân", value: "worker" },
      { label: "Khác", value: "other" },
    ],
    [],
  );

  const incomeTypeOptions = useMemo<ISelectBoxOption[]>(
    () => [
      { label: "Chuyển khoản", value: "transfer" },
      { label: "Tiền mặt", value: "cash" },
    ],
    [],
  );

  const havingLoanOptions = useMemo<ISelectBoxOption[]>(
    () => [
      { label: "Có", value: "yes" },
      { label: "Không", value: "no" },
    ],
    [],
  );

  const creditStatusOptions = useMemo<ISelectBoxOption[]>(
    () => [
      { label: "Tốt", value: "good" },
      { label: "Bình thường", value: "normal" },
      { label: "Nợ xấu", value: "bad" },
    ],
    [],
  );

  return {
    locationOptions,
    genderOptions,
    incomeOptions,
    careerStatusOptions,
    incomeTypeOptions,
    havingLoanOptions,
    creditStatusOptions,
    isLoading: isLoadingProvinces,
  };
}
