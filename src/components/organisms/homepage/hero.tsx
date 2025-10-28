export default function Hero() {
  return (
    <section className="bg-gradient-to-b from-teal-50 to-white py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Decorative icons */}
          <div className="flex justify-center gap-4 mb-8">
            <div className="text-4xl">📋</div>
            <div className="text-4xl">💰</div>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 text-balance">
            Dễ dàng lựa chọn sản phẩm tài chính cùng Fin Zone
          </h1>

          {/* Subheading */}
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8 text-balance">
            Fin Zone cung cấp thông tin, so sánh và đánh giá{" "}
            <span className="font-bold text-gray-900">
              ĐA DẠNG CÁC LỰA CHỌN
            </span>{" "}
            về khoản vay tin chấp, thẻ tin dụng và bảo hiểm của{" "}
            <span className="font-bold text-gray-900">MUÔN VÀN UU ĐÃI</span>{" "}
            giúp bạn tiếp cận các dịch vụ tài chính một cách nhanh chóng và dễ
            dàng.
          </p>
        </div>
      </div>
    </section>
  );
}
