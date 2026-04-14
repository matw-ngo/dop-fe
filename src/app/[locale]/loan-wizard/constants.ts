export const ValidationConfig = {
  MAXIMUM_AGE: 60,
  MINIMUM_AGE: 18,
  MINIMUM_INCOME: 1000000,
};

export const FULL_NAME_REGEX = /^\p{L}+ [ \p{L}]*\p{L}$/u;

export const VN_PROVINCES = [
  { label: "Hà Nội", value: "ha_noi" },
  { label: "TP Hồ Chí Minh", value: "tphcm" },
  { label: "An Giang", value: "an_giang" },
  { label: "Bắc Giang", value: "bac_giang" },
  { label: "Bắc Kạn", value: "bac_kan" },
  { label: "Bạc Liêu", value: "bac_lieu" },
  { label: "Bắc Ninh", value: "bac_ninh" },
  { label: "Bà Rịa - Vũng Tàu", value: "ba_ria_vung_tau" },
  { label: "Bến Tre", value: "ben_tre" },
  { label: "Bình Định", value: "binh_dinh" },
  { label: "Bình Dương", value: "binh_duong" },
  { label: "Bình Phước", value: "binh_phuoc" },
  { label: "Bình Thuận", value: "binh_thuan" },
  { label: "Cà Mau", value: "ca_mau" },
  { label: "Cần Thơ", value: "can_tho" },
  { label: "Cao Bằng", value: "cao_bang" },
  { label: "Đắk Lắk", value: "dak_lak" },
  { label: "Đắk Nông", value: "dak_nong" },
  { label: "Đà Nẵng", value: "da_nang" },
  { label: "Điện Biên", value: "dien_bien" },
  { label: "Đồng Nai", value: "dong_nai" },
  { label: "Đồng Tháp", value: "dong_thap" },
  { label: "Gia Lai", value: "gia_lai" },
  { label: "Hà Giang", value: "ha_giang" },
  { label: "Hải Dương", value: "hai_duong" },
  { label: "Hải Phòng", value: "hai_phong" },
  { label: "Hà Nam", value: "ha_nam" },
  { label: "Hà Tĩnh", value: "ha_tinh" },
  { label: "Hậu Giang", value: "hau_giang" },
  { label: "Hoà Bình", value: "hoa_binh" },
  { label: "Hưng Yên", value: "hung_yen" },
  { label: "Khánh Hòa", value: "khanh_hoa" },
  { label: "Kiên Giang", value: "kien_giang" },
  { label: "Kon Tum", value: "kon_tum" },
  { label: "Lai Châu", value: "lai_chau" },
  { label: "Lâm Đồng", value: "lam_dong" },
  { label: "Lạng Sơn", value: "lang_son" },
  { label: "Lào Cai", value: "lao_cai" },
  { label: "Long An", value: "long_an" },
  { label: "Nam Định", value: "nam_dinh" },
  { label: "Nghệ An", value: "nghe_an" },
  { label: "Ninh Bình", value: "ninh_binh" },
  { label: "Ninh Thuận", value: "ninh_thuan" },
  { label: "Phú Thọ", value: "phu_tho" },
  { label: "Phú Yên", value: "phu_yen" },
  { label: "Quảng Bình", value: "quang_binh" },
  { label: "Quảng Nam", value: "quang_nam" },
  { label: "Quảng Ngãi", value: "quang_ngai" },
  { label: "Quảng Ninh", value: "quang_ninh" },
  { label: "Quảng Trị", value: "quang_tri" },
  { label: "Sóc Trăng", value: "soc_trang" },
  { label: "Sơn La", value: "son_la" },
  { label: "Tây Ninh", value: "tay_ninh" },
  { label: "Thái Bình", value: "thai_binh" },
  { label: "Thái Nguyên", value: "thai_nguyen" },
  { label: "Thanh Hóa", value: "thanh_hoa" },
  { label: "Thừa Thiên Huế", value: "thua_thien_hue" },
  { label: "Tiền Giang", value: "tien_giang" },
  { label: "Trà Vinh", value: "tra_vinh" },
  { label: "Tuyên Quang", value: "tuyen_quang" },
  { label: "Vĩnh Long", value: "vinh_long" },
  { label: "Vĩnh Phúc", value: "vinh_phuc" },
  { label: "Yên Bái", value: "yen_bai" },
];

export const EMPLOYMENT_STATUSES = [
  { label: "Có việc làm", value: "employed" },
  { label: "Kinh doanh/Lao động tự do", value: "self_employed" },
  { label: "Không có việc làm", value: "unemployed" },
  { label: "Nội trợ", value: "housewife" },
  { label: "Nghỉ hưu", value: "retired" },
];

export const EMPLOYMENT_TYPE = [
  { label: "Công nghệ Thông tin/Viễn thông", value: "IT" },
  { label: "Dịch vụ/Nhà hàng/Kinh doanh/Tiếp thị", value: "services" },
  {
    label: "Dịch vụ cầm đồ/Thu hồi nợ/Thẩm định tín dụng",
    value: "credit_service",
  },
  { label: "Báo chí (Phóng viên/biên tập viên...)", value: "journalism" },
  { label: "Giáo dục/Nghiên cứu", value: "academic" },
  { label: "Toà án/Kiểm sát/Thi hành án dân sự", value: "judicial" },
  { label: "Nông lâm ngư nghiệp", value: "agriculture" },
  { label: "Chế tạo/Sản xuất/Xây dựng/Vận tải", value: "engineering" },
  { label: "Chính phủ/Dịch vụ công cộng", value: "public_sector" },
  { label: "Khác", value: "other" },
];

export const INCOME_AMOUNT = [
  { label: "Dưới 3 triệu đồng", value: "1000000" },
  { label: "Từ 3 - 7 triệu đồng", value: "3000000" },
  { label: "Từ 7 - 10 triệu đồng", value: "7000000" },
  { label: "Trên 10 triệu đồng", value: "10000000" },
];

export const CREDIT_STATUSES = [
  { label: "Không có khoản vay nào", value: "0" },
  { label: "1 khoản vay", value: "1" },
  { label: "2 khoản vay", value: "2" },
  { label: "3 khoản vay", value: "3" },
  { label: "Trên 3 khoản vay", value: "4" },
];

export const CREDIT_HISTORY = [
  { label: "Chưa từng có nợ xấu hoặc nợ chậm trả nhóm 2", value: "0" },
  { label: "Đang có nợ xấu hoặc nợ chậm trả nhóm 2", value: "1" },
  { label: "Từng có nợ xấu trong vòng 3 năm gần đây", value: "2" },
];

export const VEHICLE_REGISTRATION_OPTIONS = [
  { label: "Có", value: "cavet" },
  { label: "Không", value: "none" },
];

export const GENDER_OPTIONS = [
  { label: "Nam", value: "male" },
  { label: "Nữ", value: "female" },
];

export const MARITAL_STATUS = [
  { label: "Độc thân", value: "single" },
  { label: "Đã kết hôn", value: "married" },
];
