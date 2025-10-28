export default function Features() {
  const features = [
    {
      title: "Duyệt vay nhanh chóng cần CCCD",
      description:
        "Với công nghệ AI tiên tiến, bạn có thể tìm kiếm và duyệt khoản vay nhanh chóng để đăng ký trong vòng vài phút.",
      image: "/man-with-documents.jpg",
    },
    {
      title: "So sánh & tìm kiếm thẻ tín dụng để đăng",
      description:
        "Chúng tôi hợp tác với các Ngân hàng và Tổ chức tín dụng uy tín trên thị trường để cung cấp sản phẩm thẻ tín dụng với nhiều lựa chọn phù hợp.",
      image: "/man-with-credit-cards.jpg",
    },
    {
      title: "Ưu đãi, chính sách sản phẩm hấp dẫn",
      description:
        "Fin Zone liên kết cùng với các Ngân hàng & Tổ chức để đưa ra các sản phẩm tài chính có chính sách lãi suất đặc biệt, cùng rất nhiều ưu đãi hấp dẫn.",
      image: "/woman-excited.jpg",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
            >
              {/* Feature image */}
              <div className="h-48 bg-teal-100 overflow-hidden">
                <img
                  src={feature.image || "/placeholder.svg"}
                  alt={feature.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Feature content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-teal-600 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
