export interface CreditCard {
  id: string;
  name: string;
  bank: string;
  annualFee: string;
  interestRate: string;
  cashback?: string;
  features: string[];
  requirements?: string[];
  pros?: string[];
  cons?: string[];
}

export const mockCreditCards: CreditCard[] = [
  {
    id: "1",
    name: "Vietcombank Visa",
    bank: "Vietcombank",
    annualFee: "500.000 VND",
    interestRate: "19.2%",
    cashback: "1%",
    features: ["Miễn phí POS", "Bảo hiểm mua sắm", "Hỗ trợ 24/7"],
  },
  {
    id: "2",
    name: "Techcombank Mastercard",
    bank: "Techcombank",
    annualFee: "800.000 VND",
    interestRate: "20.8%",
    cashback: "1.5%",
    features: ["Tích điểm Rewards", "Miễn phí rút tiền", "Bảo hiểm du lịch"],
  },
  {
    id: "3",
    name: "VPBank JCB Ultimate",
    bank: "VPBank",
    annualFee: "1.200.000 VND",
    interestRate: "23.8%",
    cashback: "2%",
    features: ["Ưu đãi JCB", "Lounge sân bay", "Concierge 24/7"],
  },
  {
    id: "4",
    name: "Sacombank Visa Signature",
    bank: "Sacombank",
    annualFee: "1.500.000 VND",
    interestRate: "21.9%",
  },
  {
    id: "5",
    name: "MB Bank Chip",
    bank: "MB Bank",
    annualFee: "Free",
    interestRate: "18.5%",
  },
  {
    id: "6",
    name: "ACB Visa Classic",
    bank: "Asia Commercial Bank",
    annualFee: "300.000 VND",
    interestRate: "17.6%",
  },
];

export const detailedCardData: Record<string, CreditCard> = {
  "vietcombank-visa": {
    id: "vietcombank-visa",
    name: "Vietcombank Visa Classic",
    bank: "Vietcombank",
    annualFee: "500.000 VND",
    interestRate: "19.2%",
    features: [
      "Miễn phí giao dịch tại POS Việt Nam",
      "Chương trình hoàn tiền đến 1%",
      "Bảo hiểm mua sắm toàn cầu",
      "Hỗ trợ 24/7 tại Việt Nam và quốc tế",
    ],
    requirements: [
      "Thu nhập tối thiểu: 5 triệu VNĐ/tháng",
      "Độ tuổi: 21-60 tuổi",
      "Hộ khẩu hoặc KT3 tại TP.HCM, Hà Nội",
      "Sổ tiết kiệm hoặc giấy tờ chứng minh tài chính",
    ],
    pros: [
      "Mạng lưới ATM rộng khắp",
      "Phí chuyển tiền rẻ",
      "Uy tín hàng đầu Việt Nam",
      "Nhiều chương trình khuyến mãi",
    ],
    cons: [
      "Quy trình xét duyệt chặt chẽ",
      "Yêu cầu chứng minh thu nhập cao",
      "Phí thường niên không miễn phí",
    ],
  },
  "techcombank-mastercard": {
    id: "techcombank-mastercard",
    name: "Techcombank Mastercard",
    bank: "Techcombank",
    annualFee: "800.000 VND",
    interestRate: "20.8%",
    features: [
      "Tích điểm Techcombank Rewards",
      "Miễn phí rút tiền mặt tại ATM Techcombank",
      "Bảo hiểm du lịch quốc tế",
      "Quy đổi điểm dặm bay Vietnam Airlines",
    ],
    requirements: [
      "Thu nhập tối thiểu: 7 triệu VNĐ/tháng",
      "Độ tuổi: 22-65 tuổi",
      "Hợp đồng lao động tối thiểu 1 năm",
      "Không có nợ xấu tại CIC",
    ],
    pros: [
      "Ngân hàng số mạnh mẽ",
      "Tỷ lệ duyệt hồ sơ cao",
      "Nhiều đặc quyền cho khách hàng ưu tiên",
      "Hỗ trợ khách hàng 24/7",
    ],
    cons: [
      "Phí thường niên cao",
      "Yêu cầu tài chính cao",
      "Mạng lưới ATM ít hơn VCB",
    ],
  },
};

export const getCreditCardById = (id: string): CreditCard | undefined => {
  return mockCreditCards.find((card) => card.id === id);
};

export const getDetailedCardInfo = (slug: string): CreditCard => {
  return (
    detailedCardData[slug] || {
      id: "default",
      name: "Thẻ tín dụng",
      bank: "Ngân hàng",
      annualFee: "Liên hệ",
      interestRate: "Liên hệ",
      features: [],
      requirements: [],
      pros: [],
      cons: [],
    }
  );
};
