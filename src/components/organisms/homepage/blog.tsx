export default function Blog() {
  const posts = [
    {
      title: "4 bước đăng ký ngay khoản vay trên Fin Zone",
      description:
        "Fin Zone mang đến giải pháp vay nhanh chóng, tiền lợi ngay trên điện thoại của bạn. Chi vào vài thao tác đơn...",
      image: "/texas-map-illustration.jpg",
    },
    {
      title: "4 bước đơn giản số hữu thế tín dụng ưu đãi",
      description:
        "Khám phá Finzone.vn – nền tảng chính số bảo gồm chức năng tìm kiếm và so sánh thẻ tín dụng ưu việt. Chi và...",
      image: "/smart-home-illustration.jpg",
    },
    {
      title: "4 lý do bị từ chối đăng ký vay trên Fin Zone",
      description:
        "Gặp trở ngại khi đăng ký vay trên Fin Zone? Dùng lo lắng, hãy tham khảo bài viết này để giải quyết ngay. Chúng...",
      image: "/map-location-illustration.jpg",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Blog
            </h2>
            <p className="text-gray-600">
              Cập nhật những tin tức hữu ích từ Fin Zone
            </p>
          </div>
          <a
            href="#"
            className="text-teal-600 font-semibold hover:text-teal-700 transition"
          >
            Xem tất cả →
          </a>
        </div>

        {/* Blog grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <article
              key={index}
              className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
            >
              {/* Blog image */}
              <div className="h-48 bg-gray-200 overflow-hidden">
                <img
                  src={post.image || "/placeholder.svg"}
                  alt={post.title}
                  className="w-full h-full object-cover hover:scale-105 transition"
                />
              </div>

              {/* Blog content */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-teal-600 mb-3 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                  {post.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
