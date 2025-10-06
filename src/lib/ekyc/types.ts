/**
 * Định nghĩa các loại giấy tờ tùy thân dựa trên ID.
 * - id = -1 : Chứng minh thư
 * - id = 5 : Hộ chiếu
 * - id = 7 : Chứng minh thư quân đội
 * - id = 6 : Bằng lái xe
 * - id = 9 : Căn cước công dân gắn chip
 */
export enum DocumentType {
  /**
   * Chứng minh thư nhân dân (CMND)
   */
  CMND = -1,
  /**
   * Hộ chiếu (Passport)
   */
  HoChieu = 5,
  /**
   * Bằng lái xe (Driver's License)
   */
  BangLaiXe = 6,
  /**
   * Chứng minh thư quân đội (Military ID)
   */
  CMNDQuanDoi = 7,
  /**
   * Căn cước công dân gắn chip (Chip-based Citizen ID)
   */
  CCCD = 9,
}

/**
 * Định nghĩa cấu trúc cho dữ liệu trả về từ API kiểm tra liveness
 * cho cả mặt trước (liveness_card_front) và mặt sau (liveness_card_back).
 */
export interface LivenessCardResponse {
  /**
   * Thông tin mã lỗi hoặc mã thành công.
   * Ví dụ: "IDG-00000000"
   */
  message?: string;

  /**
   * Một chuỗi JSON chứa thông tin chi tiết kết quả kiểm tra.
   * Bạn cần phải dùng JSON.parse() để chuyển chuỗi này thành một đối tượng JavaScript.
   */
  object: string;

  /**
   * Kết quả kiểm tra giấy tờ có bị dán ảnh đè lên hay không.
   * - `true`: Có dấu hiệu dán ảnh.
   * - `false`: Không có dấu hiệu dán ảnh.
   */
  face_swapping: boolean;

  /**
   * Kết quả kiểm tra giấy tờ có bị chụp lại từ một màn hình khác hay không.
   * - `true`: Có dấu hiệu bị chụp lại.
   * - `false`: Không có dấu hiệu bị chụp lại.
   */
  fake_liveness: boolean;

  /**
   * Trạng thái tổng quát của việc kiểm tra.
   * Chỉ nhận một trong hai giá trị: 'success' hoặc 'failure'.
   */
  liveness: "success" | "failure";

  /**
   * Thông điệp mô tả kết quả kiểm tra.
   * Ví dụ: "Giấy tờ thật" hoặc "Không phải giấy tờ thật".
   */
  liveness_msg: string;
}

/**
 * Định nghĩa loại giấy tờ mặt trước dựa trên type_id.
 * 0: CMT cũ | 1: CMT mới/CCCD | 2: Hộ chiếu | 3: CMT QĐ | 4: Bằng lái xe
 */
export enum OcrFrontCardType {
  OldIdCard = 0, // CMT cũ
  NewIdCardOrCccd = 1, // CMT mới/CCCD
  Passport = 2, // Hộ chiếu
  MilitaryIdCard = 3, // CMT QĐ
  DriverLicense = 4, // Bằng lái xe
}

/**
 * Định nghĩa loại giấy tờ mặt sau dựa trên back_type_id.
 * 0: CMT cũ | 1: CMT mới/CCCD
 */
export enum OcrBackCardType {
  OldIdCard = 0, // CMT cũ
  NewIdCardOrCccd = 1, // CMT mới/CCCD
}

/**
 * Cấu trúc chi tiết của một đơn vị hành chính trong `post_code`.
 */
export type PostCodeDetail = [string, string, number];

/**
 * Định nghĩa cấu trúc cho một mục trong trường `post_code`.
 */
export interface PostCodeInfo {
  city: PostCodeDetail;
  district: PostCodeDetail;
  ward: PostCodeDetail;
  type: "hometown" | "address";
}

/**
 * Định nghĩa cấu trúc cho dữ liệu JSON trong trường `tampering`.
 */
export interface TamperingInfo {
  is_legal: "yes" | "no";
  warning: string[];
}

/**
 * Định nghĩa cấu trúc cho dữ liệu trả về từ API OCR.
 */
export interface OcrResponse {
  /**
   * Thông báo kết quả bóc tách thông tin.
   * Ví dụ: "OK: thành công"
   */
  msg: string;

  /**
   * (Không rõ mục đích từ tài liệu, có thể là object chứa thông tin)
   */
  card_type: string;

  /**
   * Số CMND/CCCD/Hộ chiếu.
   * Ví dụ: "001060007959, 142987432"
   */
  id: string;

  /**
   * Tỉ lệ confidence của từng ký tự trong số ID.
   * Được biểu diễn dưới dạng chuỗi các số float.
   */
  id_probs: string;

  /**
   * Họ và tên.
   * Ví dụ: "NGUYỄN MẠNH ĐỨC"
   */
  name: string;
  name_prob: number;

  /**
   * Ngày tháng năm sinh.
   * Ví dụ: "02/01/1960"
   */
  birth_day: string;
  birth_day_prob: number;

  /**
   * Quốc tịch.
   * Ví dụ: "Việt Nam"
   */
  nationality: string;

  /**
   * Dân tộc.
   * Ví dụ: "Kinh"
   */
  nation: string;

  /**
   * Giới tính.
   */
  gender: string;

  /**
   * Ngày hết hạn.
   * Ví dụ: "02/01/2020"
   */
  valid_date: string;

  /**
   * Nguyên quán.
   * Ví dụ: "Dương Quảng, Gia Lâm, Hà Nội"
   */
  origin_location: string;
  origin_location_prob: number;

  /**
   * Nơi thường trú.
   * Ví dụ: "24A, Dương Quảng, Gia Lâm, Hà Nội"
   */
  recent_location: string;
  recent_location_prob: number;

  /**
   * Ngày cấp.
   * Ví dụ: "02/01/1980"
   */
  issue_date: string;
  issue_date_prob: number;

  /**
   * Nơi cấp.
   * Ví dụ: "Hà Nội"
   */
  issue_place: string;
  issue_place_prob: number;
  issue_date_probs?: number[];
  /**
   * Loại giấy tờ mặt trước.
   */
  type_id: OcrFrontCardType;

  /**
   * Loại giấy tờ mặt sau.
   */
  back_type_id: OcrBackCardType;

  /**
   * Danh sách các mã cảnh báo.
   * Ví dụ: ["anh_dau_vao_mat_goc", "anh_dau_vao_mo_nhoe"]
   */
  warning: string[];

  /**
   * Danh sách các thông điệp cảnh báo tương ứng.
   * Ví dụ: ["Giấy tờ bị mất góc", "Giấy tờ bị mờ/nhoè"]
   */
  warning_msg: string[];

  /**
   * Cảnh báo ngày hết hạn mặt trước.
   */
  expire_warning: string;

  /**
   * Cảnh báo ngày hết hạn mặt sau.
   */
  back_expire_warning: string;

  /**
   * Thông tin bóc tách từ địa chỉ (dạng list các OrderedMap).
   * Bạn sẽ cần xử lý đặc biệt cho kiểu dữ liệu này.
   */
  post_code: PostCodeInfo[];

  /**
   * Chứa thông tin về tính hợp lệ của giấy tờ.
   */
  tampering: TamperingInfo;

  /**
   * Key kiểm tra tính hợp lệ của số ID.
   */
  is_legal: string;

  /**
   * Tỉ lệ confidence ID giả.
   */
  id_fake_prob: number;

  /**
   * Cảnh báo ID giả.
   * Ví dụ: "yes"
   */
  id_fake_warning: string;

  /**
   * Thông báo kiểm tra mặt sau.
   * Ví dụ: "OK Key check mặt sau giấy tờ"
   */
  msg_back: string;

  /**
   * Quốc hiệu.
   * Ví dụ: "CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM"
   */
  nation_policy: string;

  /**
   * Tiêu ngữ.
   * Ví dụ: "Độc lập - Tự do - Hạnh phúc"
   */
  nation_slogan: string;

  /**
   * These fields are undefined in the documentation, but could find in the example response
   */
  citizen_id?: string;
  citizen_id_prob?: number;

  corner_warning?: string;
  back_corner_warning?: string;
}

/**
 * Định nghĩa cấu trúc cho dữ liệu trả về từ API `liveness_face`.
 * API này kiểm tra ảnh khuôn mặt truyền vào có phải là người thật hay không.
 */
export interface LivenessFaceResponse {
  /**
   * Thông tin mã lỗi hoặc mã thành công.
   * Ví dụ: "IDG-00000000"
   */
  message: string;

  /**
   * Một chuỗi JSON chứa thông tin chi tiết kết quả của API kiểm tra mặt thật.
   * Cần được parse để sử dụng.
   */
  object: string;

  /**
   * Trạng thái kiểm tra liveness.
   */
  liveness: "success" | "failure";

  /**
   * Thông điệp mô tả kết quả liveness.
   * Ví dụ: "Người thật" hoặc "Không phải người thật".
   */
  liveness_msg: string;

  /**
   * Trạng thái mắt có mở hay không.
   */
  is_eye_open: "yes" | "no";

  /**
   * These fields are undefined in the documentation, but could find in the example response
   */
  blur_face?: "yes" | "no";
}

/**
 * Định nghĩa cấu trúc cho dữ liệu trả về từ API `masked`.
 * API này kiểm tra ảnh khuôn mặt truyền vào có bị che hay không.
 */
export interface MaskedFaceResponse {
  /**
   * Thông tin mã lỗi hoặc mã thành công.
   * Ví dụ: "IDG-00000000"
   */
  message: string;

  /**
   * Một chuỗi JSON chứa thông tin chi tiết kết quả của API kiểm tra che mặt.
   * Cần được parse để sử dụng.
   */
  object: string;

  /**
   * Trạng thái khuôn mặt có bị che hay không.
   */
  masked: "yes" | "no";
}

/**
 * Định nghĩa cấu trúc cho dữ liệu trả về từ API `compare`.
 * API này so sánh khuôn mặt trên giấy tờ với khuôn mặt chân dung.
 */
export interface CompareFaceResponse {
  /**
   * Một chuỗi JSON chứa thông tin chi tiết kết quả của API so sánh khuôn mặt.
   * Cần được parse để sử dụng.
   */
  object?: string;

  /**
   * Kết quả so sánh khuôn mặt dưới dạng văn bản mô tả.
   * Ví dụ: "Khuôn mặt khớp 99,7%" hoặc "Khuôn mặt không khớp".
   */
  result: string;

  /**
   * Key thể hiện kết quả so sánh.
   */
  msg: "MATCH" | "NOMATCH";

  /**
   * Tỉ lệ khớp khuôn mặt, được biểu diễn dưới dạng chuỗi.
   * Cần được chuyển đổi sang kiểu số nếu muốn tính toán.
   */
  prob: string | number;

  /**
   * Thông tin phiên bản của server xử lý.
   */
  server_version?: string;

  /**
   * Thông tin mã lỗi hoặc mã thành công.
   * Ví dụ: "IDG-00000000"
   */
  message?: string;

  /**
   * These fields are undefined in the documentation, but could find in the example response
   */
  multiple_faces: boolean;
}

export interface HashImgResponse {
  img_front: string;
  img_back: string;
  img_face: string;
}

export interface EkycResponse {
  type_document: DocumentType;
  liveness_card_front: LivenessCardResponse;
  liveness_card_back: LivenessCardResponse;
  ocr: OcrResponse;
  liveness_face: LivenessFaceResponse;
  masked: MaskedFaceResponse;
  hash_img: HashImgResponse;
  compare: CompareFaceResponse;
}
