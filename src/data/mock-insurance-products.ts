export interface InsuranceProduct {
  id: string;
  name: string;
  provider: string;
  category: string;
  coverage: string;
  premium: string;
  features?: string[];
}

export interface InsuranceCategory {
  id: string;
  name: string;
  nameKey: string;
  icon: string;
}

export const insuranceCategories: InsuranceCategory[] = [
  {
    id: "health",
    name: "Bảo hiểm sức khỏe",
    nameKey: "sức khỏe",
    icon: "Heart",
  },
  {
    id: "life",
    name: "Bảo hiểm nhân thọ",
    nameKey: "nhân thọ",
    icon: "Shield",
  },
  { id: "car", name: "Bảo hiểm xe", nameKey: "xe", icon: "Car" },
  { id: "home", name: "Bảo hiểm nhà", nameKey: "nhà", icon: "Home" },
  { id: "travel", name: "Bảo hiểm du lịch", nameKey: "du lịch", icon: "Plane" },
];

export const mockInsuranceProducts: Record<string, InsuranceProduct[]> = {
  health: [
    {
      id: "health-1",
      name: "Bảo hiểm sức khỏe FWD",
      provider: "FWD",
      category: "health",
      coverage: "Tổng thể",
      premium: "2.500.000 VND/năm",
    },
    {
      id: "health-2",
      name: "Bảo hiểm bệnh hiểm nghiêm trọng Bảo Việt",
      provider: "Bảo Việt",
      category: "health",
      coverage: "Nghiêm trọng",
      premium: "4.000.000 VND/năm",
    },
    {
      id: "health-3",
      name: "Bảo hiểm sức khỏe MIC",
      provider: "Generali Vietnam",
      category: "health",
      coverage: "Tổng thể",
      premium: "3.200.000 VND/năm",
    },
  ],
  life: [
    {
      id: "life-1",
      name: "Bảo hiểm nhân thọ Dai-ichi Life",
      provider: "Dai-ichi",
      category: "life",
      coverage: "Trọn đời",
      premium: "1.500.000 VND/năm",
    },
    {
      id: "life-2",
      name: "Bảo hiểm nhân thọ Manulife",
      provider: "Manulife",
      category: "life",
      coverage: "Trọn đời",
      premium: "1.800.000 VND/năm",
    },
    {
      id: "life-3",
      name: "Bảo hiểm nhân thọ Prudential",
      provider: "Prudential",
      category: "life",
      coverage: "Trọn đời",
      premium: "2.000.000 VND/năm",
    },
  ],
  car: [
    {
      id: "car-1",
      name: "Bảo hiểm vật chất xe ô tô BIC",
      provider: "BIC",
      category: "car",
      coverage: "Tổng hợp",
      premium: "2.500.000 VND/năm",
    },
    {
      id: "car-2",
      name: "Bảo hiểm xe cơ động Pjico",
      provider: "Pjico",
      category: "car",
      coverage: "Tổng hợp",
      premium: "3.000.000 VND/năm",
    },
    {
      id: "car-3",
      name: "Bảo hiểm xe VNI",
      provider: "VNI",
      category: "car",
      coverage: "Bắt buộc + Tự nguyện",
      premium: "3.500.000 VND/năm",
    },
  ],
  home: [
    {
      id: "home-1",
      name: "Bảo hiểm nhà tư nhiên PVI",
      provider: "PVI",
      category: "home",
      coverage: "Thiên tai",
      premium: "1.200.000 VND/năm",
    },
    {
      id: "home-2",
      name: "Bảo hiểm nhà Bảo Việt",
      provider: "Bảo Việt",
      category: "home",
      coverage: "Thiên tai + Cháy nổ",
      premium: "1.500.000 VND/năm",
    },
    {
      id: "home-3",
      name: "Bảo hiểm tài sản Generali",
      provider: "Generali",
      category: "home",
      coverage: "Tổng hợp",
      premium: "2.000.000 VND/năm",
    },
  ],
};

export const getInsuranceProductsByCategory = (
  category: string,
): InsuranceProduct[] => {
  return mockInsuranceProducts[category] || [];
};

export const getAllInsuranceProducts = (): InsuranceProduct[] => {
  return Object.values(mockInsuranceProducts).flat();
};

export const getCategoryName = (category: string): string => {
  const cat = insuranceCategories.find((c) => c.id === category);
  return cat ? cat.nameKey : category;
};

export const getCategoryById = (id: string): InsuranceCategory | undefined => {
  return insuranceCategories.find((cat) => cat.id === id);
};
