"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="font-bold text-lg text-gray-900">Fin Zone</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#"
              className="text-gray-700 hover:text-teal-600 transition"
            >
              Về Fin Zone
            </Link>
            <Link
              href="#"
              className="text-gray-700 hover:text-teal-600 transition"
            >
              Sản phẩm
            </Link>
            <Link
              href="#"
              className="text-gray-700 hover:text-teal-600 transition"
            >
              Công cụ
            </Link>
            <Link
              href="#"
              className="text-gray-700 hover:text-teal-600 transition"
            >
              Hỗ trợ
            </Link>
            <Link
              href="#"
              className="text-gray-700 hover:text-teal-600 transition"
            >
              Blog
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden p-2">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
