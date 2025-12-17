export const MAX_COVERAGE_LIMIT = 2000000000; // 2 tỷ VND as reference

export const COVERAGE_PERIODS = {
  monthly: "1 tháng",
  quarterly: "3 tháng",
  "semi-annually": "6 tháng",
  annually: "1 năm",
  custom: "Tùy chỉnh",
} as const;

export const SERVICE_INFO = {
  roadsideAssistance: {
    name: "Cứu hộ 24/7",
    description: "Kéo xe, thay lốp, sửa chữa tại chỗ",
  },
  medicalHotline: {
    name: "Tổng đài y tế",
    description: "Tư vấn sức khỏe 24/7",
  },
  legalSupport: {
    name: "Hỗ trợ pháp lý",
    description: "Tư vấn pháp lý miễn phí",
  },
  homeVisit: {
    name: "Khám tại nhà",
    description: "Bác sĩ đến tận nhà",
  },
  worldwideCoverage: {
    name: "Bảo vệ toàn cầu",
    description: "Áp dụng trên toàn thế giới",
  },
} as const;

export const PAYMENT_METHODS = {
  cash: {
    name: "Tiền mặt",
    icon: "💵",
    description: "Thanh toán trực tiếp",
  },
  bank_transfer: {
    name: "Chuyển khoản",
    icon: "🏦",
    description: "Qua ngân hàng",
  },
  credit_card: {
    name: "Thẻ tín dụng",
    icon: "💳",
    description: "Visa/Mastercard",
  },
  mobile_banking: {
    name: "Ngân hàng số",
    icon: "📱",
    description: "App ngân hàng",
  },
  ewallet: {
    name: "Ví điện tử",
    icon: "👛",
    description: "Momo, ZaloPay...",
  },
} as const;

export const CLAIM_METHODS = {
  online: {
    icon: "🌐",
    name: "Online",
    description: "Trực tuyến 24/7",
  },
  phone: {
    icon: "📞",
    name: "Điện thoại",
    description: "Gọi tổng đài",
  },
  branch: {
    icon: "🏢",
    name: "Văn phòng",
    description: "Tại văn phòng",
  },
  mobile_app: {
    icon: "📱",
    name: "Ứng dụng",
    description: "Qua app di động",
  },
} as const;

export const VEHICLE_TYPES = {
  car: "Ô tô",
  motorcycle: "Xe máy",
  scooter: "Xe ga",
  three_wheeler: "Xe ba bánh",
  truck: "Xe tải",
  bus: "Xe buýt",
} as const;

export const COLOR_CLASSES = {
  blue: "bg-blue-100 text-blue-700",
  red: "bg-red-100 text-red-700",
  orange: "bg-orange-100 text-orange-700",
  green: "bg-green-100 text-green-700",
  purple: "bg-purple-100 text-purple-700",
  pink: "bg-pink-100 text-pink-700",
  yellow: "bg-yellow-100 text-yellow-700",
  indigo: "bg-indigo-100 text-indigo-700",
  cyan: "bg-cyan-100 text-cyan-700",
  teal: "bg-teal-100 text-teal-700",
  gray: "bg-gray-100 text-gray-700",
} as const;

export const PROGRESS_COLORS = {
  blue: "bg-blue-500",
  red: "bg-red-500",
  orange: "bg-orange-500",
  green: "bg-green-500",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
  yellow: "bg-yellow-500",
  indigo: "bg-indigo-500",
  cyan: "bg-cyan-500",
  teal: "bg-teal-500",
  gray: "bg-gray-500",
} as const;
