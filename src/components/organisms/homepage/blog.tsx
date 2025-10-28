"use client";

import React from "react";
import Link from "next/link";
import { BlogConfig } from "@/configs/homepage-config";

interface BlogProps {
  config?: BlogConfig;
  company?: string;
}

export default function Blog({ config, company }: BlogProps) {
  // Default config if none provided
  const defaultConfig: BlogConfig = {
    id: "blog",
    title: "Blog",
    subtitle: "Cập nhật những tin tức hữu ích từ Fin Zone",
    posts: [
      {
        id: "post-1",
        title: "4 bước đăng ký ngay khoản vay trên Fin Zone",
        description:
          "Fin Zone mang đến giải pháp vay nhanh chóng, tiền lợi ngay trên điện thoại của bạn. Chi vào vài thao tác đơn...",
        image: "/texas-map-illustration.jpg",
        imageAlt: "Loan registration guide",
        href: "/blog/4-buoc-dang-ky-khoan-vay",
      },
      {
        id: "post-2",
        title: "4 bước đơn giản số hữu thế tín dụng ưu đãi",
        description:
          "Khám phá Finzone.vn – nền tảng chính số bảo gồm chức năng tìm kiếm và so sánh thẻ tín dụng ưu việt. Chi và...",
        image: "/smart-home-illustration.jpg",
        imageAlt: "Credit card benefits",
        href: "/blog/the-tin-dung-uu-dai",
      },
      {
        id: "post-3",
        title: "4 lý do bị từ chối đăng ký vay trên Fin Zone",
        description:
          "Gặp trở ngại khi đăng ký vay trên Fin Zone? Dùng lo lắng, hãy tham khảo bài viết này để giải quyết ngay. Chúng...",
        image: "/map-location-illustration.jpg",
        imageAlt: "Loan rejection reasons",
        href: "/blog/ly-do-bi-tu-choi-vay",
      },
    ],
    viewAllText: "Xem tất cả →",
    viewAllHref: "/blog",
    background: {
      className: "bg-white",
    },
  };

  const blogConfig = config || defaultConfig;

  const useDynamicTheme = !config?.background?.className;

  const getBlogGridClass = () => {
    const postCount = blogConfig.posts.length;
    if (postCount === 1) return "grid grid-cols-1";
    if (postCount === 2) return "grid md:grid-cols-2 gap-8";
    if (postCount >= 3) return "grid md:grid-cols-3 gap-8";
    return "grid gap-8";
  };

  return (
    <section
      className={`py-16 md:py-24 ${useDynamicTheme ? "bg-background" : blogConfig.background.className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2
              className={`text-3xl md:text-4xl font-bold mb-2 ${useDynamicTheme ? "text-foreground" : "text-gray-900"}`}
            >
              {blogConfig.title}
            </h2>
            {blogConfig.subtitle && (
              <p
                className={`${useDynamicTheme ? "text-muted-foreground" : "text-gray-600"}`}
              >
                {blogConfig.subtitle}
              </p>
            )}
          </div>
          {blogConfig.viewAllHref ? (
            <Link
              href={blogConfig.viewAllHref}
              className={`font-semibold transition ${useDynamicTheme ? "text-primary hover:text-primary/80" : "text-teal-600 hover:text-teal-700"}`}
            >
              {blogConfig.viewAllText}
            </Link>
          ) : (
            <span
              className={`font-semibold ${useDynamicTheme ? "text-primary" : "text-teal-600"}`}
            >
              {blogConfig.viewAllText}
            </span>
          )}
        </div>

        {/* Blog grid */}
        <div className={getBlogGridClass()}>
          {blogConfig.posts.map((post) => (
            <article
              key={post.id}
              className={`rounded-lg overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer ${useDynamicTheme ? "bg-card border" : "bg-white"}`}
            >
              {post.href ? (
                <Link href={post.href} target={post.target}>
                  <div>
                    {/* Blog image */}
                    <div
                      className={`h-48 overflow-hidden ${useDynamicTheme ? "bg-muted" : "bg-gray-200"}`}
                    >
                      <img
                        src={post.image || "/placeholder.svg"}
                        alt={post.imageAlt || post.title}
                        className="w-full h-full object-cover hover:scale-105 transition"
                      />
                    </div>

                    {/* Blog content */}
                    <div className="p-6">
                      <h3
                        className={`text-lg font-bold mb-3 line-clamp-2 ${useDynamicTheme ? "text-primary" : "text-teal-600"}`}
                      >
                        {post.title}
                      </h3>
                      <p
                        className={`text-sm leading-relaxed line-clamp-3 ${useDynamicTheme ? "text-muted-foreground" : "text-gray-600"}`}
                      >
                        {post.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ) : (
                <div>
                  {/* Blog image */}
                  <div
                    className={`h-48 overflow-hidden ${useDynamicTheme ? "bg-muted" : "bg-gray-200"}`}
                  >
                    <img
                      src={post.image || "/placeholder.svg"}
                      alt={post.imageAlt || post.title}
                      className="w-full h-full object-cover hover:scale-105 transition"
                    />
                  </div>

                  {/* Blog content */}
                  <div className="p-6">
                    <h3
                      className={`text-lg font-bold mb-3 line-clamp-2 ${useDynamicTheme ? "text-primary" : "text-teal-600"}`}
                    >
                      {post.title}
                    </h3>
                    <p
                      className={`text-sm leading-relaxed line-clamp-3 ${useDynamicTheme ? "text-muted-foreground" : "text-gray-600"}`}
                    >
                      {post.description}
                    </p>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
