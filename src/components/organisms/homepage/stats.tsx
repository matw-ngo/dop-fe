export default function Stats() {
  const stats = [
    {
      icon: "🏛️",
      number: "16+",
      label: "đối tác",
      description: "Ngân hàng & Công ty tài chính uy tín",
    },
    {
      icon: "👥",
      number: "3.000.000+",
      label: "khách hàng",
      description: "Khách hàng được kết nối",
    },
    {
      icon: "📋",
      number: "2.000.000+",
      label: "đơn",
      description: "Khách hàng đăng ký tư vấn",
    },
    {
      icon: "📥",
      number: "150.000+",
      label: "khoản vay",
      description: "Khoản vay giới thiệu thành công",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-6 rounded-lg bg-gray-50">
              <div className="text-4xl mb-4">{stat.icon}</div>
              <div className="text-3xl font-bold text-teal-600 mb-2">
                {stat.number}
              </div>
              <div className="text-sm font-semibold text-gray-900 mb-2">
                {stat.label}
              </div>
              <p className="text-sm text-gray-600">{stat.description}</p>
            </div>
          ))}
        </div>

        {/* Community section */}
        <div className="bg-teal-600 rounded-2xl p-8 md:p-12 text-white">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Nhận ngay thông tin mới nhất về khoản vay của bạn
              </h2>
              <p className="text-teal-100 mb-8">
                Fin Zone cập nhật những thông tin mới nhất về khoản vay, bảo
                hiểm, thẻ tin dụng, chương trình và nhiều thông tin khác về sản
                phẩm tài chính
              </p>
              <button className="bg-white text-teal-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                Tham gia cộng đồng Fin Zone
              </button>
            </div>

            {/* Profile circles */}
            <div className="relative h-64 md:h-80">
              {/* Profile 1 - top right */}
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white overflow-hidden border-4 border-teal-400 shadow-lg">
                <img
                  src="/smiling-woman.png"
                  alt="Community member"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Social icon - Facebook */}
              <div className="absolute top-8 right-32 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>

              {/* Profile 2 - bottom left */}
              <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full bg-white overflow-hidden border-4 border-teal-400 shadow-lg">
                <img
                  src="/man-professional.jpg"
                  alt="Community member"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Social icon - Twitter */}
              <div className="absolute bottom-8 left-32 w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center text-white shadow-lg">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7" />
                </svg>
              </div>

              {/* Profile 3 - bottom right */}
              <div className="absolute bottom-4 right-8 w-32 h-32 rounded-full bg-white overflow-hidden border-4 border-teal-400 shadow-lg">
                <img
                  src="/man-casual.jpg"
                  alt="Community member"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Social icon - Instagram */}
              <div className="absolute bottom-16 right-0 w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white shadow-lg">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
