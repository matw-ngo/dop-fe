export default function Footer() {
  return (
    <footer className="bg-teal-700 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-5 gap-8 mb-12">
          {/* Company info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-teal-700 font-bold text-sm">F</span>
              </div>
              <span className="font-bold text-lg">Fin Zone</span>
            </div>
            <p className="text-teal-100 text-sm mb-4">
              Công ty cổ phần Công nghệ Data Nest - Data Nest Technologies JSC
            </p>
            <p className="text-teal-100 text-sm mb-2">
              Trụ sở: Tầng 7, HITC Building, 239 Xuân Thuỷ, Q. Cầu Giấy, Hà Nội.
            </p>
            <p className="text-teal-100 text-sm">
              Chi nhánh HCM: Tòa nhà Viettel, 285 Cách Mạng Tháng 8, Quận 10, Hồ
              Chí Minh.
            </p>
          </div>

          {/* About */}
          <div>
            <h3 className="font-bold mb-4">ĐƠN VỊ CHỦ QUẢN</h3>
            <ul className="space-y-2 text-teal-100 text-sm">
              <li>
                <a href="#" className="hover:text-white transition">
                  Giới thiệu
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Liên hệ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Điều khoản
                </a>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="font-bold mb-4">THÔNG TIN</h3>
            <ul className="space-y-2 text-teal-100 text-sm">
              <li>
                <a href="#" className="hover:text-white transition">
                  Giới thiệu
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Liên hệ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Điều khoản
                </a>
              </li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-bold mb-4">SẢN PHẨM</h3>
            <ul className="space-y-2 text-teal-100 text-sm">
              <li>
                <a href="#" className="hover:text-white transition">
                  Vay tiêu dùng
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Thẻ tín dụng
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Bảo hiểm
                </a>
              </li>
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h3 className="font-bold mb-4">CÔNG CỤ</h3>
            <ul className="space-y-2 text-teal-100 text-sm">
              <li>
                <a href="#" className="hover:text-white transition">
                  Tính toán khoản vay
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Tính lãi tiền gửi
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Tính lương Gross - Net
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Tính lương Net - Gross
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Social media */}
        <div className="flex justify-end gap-4 mb-8 pb-8 border-t border-teal-600">
          <a
            href="#"
            className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center hover:bg-teal-500 transition"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>
          <a
            href="#"
            className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center hover:bg-teal-500 transition"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7" />
            </svg>
          </a>
          <a
            href="#"
            className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center hover:bg-teal-500 transition"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <rect
                x="2"
                y="2"
                width="20"
                height="20"
                rx="5"
                ry="5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
            </svg>
          </a>
          <a
            href="#"
            className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center hover:bg-teal-500 transition"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </a>
        </div>

        {/* Bottom text */}
        <div className="text-teal-100 text-xs space-y-2">
          <p>
            Fin Zone không phải đơn vị cung cấp vay và không phát hành các khoản
            vay. Dịch vụ của Fin Zone giúp đánh giá các đối tác vay uy tín với
            các sản phẩm tài chính da dạng, thời gian trả nợ linh hoạt từ 91 đến
            180 ngày, với lãi suất APR tối thiểu là 0% với đa lựa chọn. Fin Zone
            không tính phí sử dụng dịch vụ. Chi phí cuối cùng của người vay được
            tính toán khoản vay. Người dùng được thông tin đầy đủ và chính xác
            về APR, cũng như tất cả các khoản phí trước khi ký hợp đồng vay.
          </p>
          <p>
            Giấy chứng nhận Đăng ký Kinh doanh số 0108201417 cấp bởi Sở Kế hoạch
            và Đầu tư TP Hà Nội ngày 27/03/2018
          </p>
          <p>
            Giấy phép Thiết lập Mạng Xã Hội trên mạng số 26/GP-BTTT cấp bởi Bộ
            Thông Tin và Truyền Thông ngày 06/02/2024
          </p>
          <p>Copyright © 2023 Fin Zone, All rights reserved</p>
        </div>
      </div>
    </footer>
  );
}
