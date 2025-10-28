"use client";
import React, { useEffect, useReducer, useState } from "react";
import Link from "next/link";
import cls from "@app/helpers/classnames";
import style from "./NavBar.module.scss";

import { usePathname, useRouter } from "next/navigation";
import {
  AboutSvg,
  Logo,
  ProductSvg,
  FinancialKnowledgeSvg,
  HelpSvg,
} from "../svg/home";
import Modal from "../Modal/modal";
import { EventType, eventTracking } from "@app/helpers/user-tracking";
import { FINZONE_BLOG_BASE_PATH } from "@app/configs/constants";

const NavBar = () => {
  const router = useRouter();
  const pathName = usePathname();
  const [isMobileNavbar, toggleMobileNavbar] = useReducer(
    (state) => !state,
    false,
  );
  const [showDetail, setShowDetail] = useState(
    Array.from({ length: 2 }, (_) => false),
  );

  useEffect(() => {
    if (isMobileNavbar) {
      toggleMobileNavbar();
      setShowDetail([false, false]); // reset show detail
    }
  }, [pathName]);
  const isShowNavMenu = React.useMemo(() => {
    return !["/thong-tin-vay/", "/tim-kiem-vay/", "/ket-qua-vay/"].includes(
      pathName,
    );
  }, [pathName]);

  const handleShowDetail = (event, fieldIndex) => {
    showDetail[fieldIndex] = !showDetail[fieldIndex];
    setShowDetail([...showDetail]);
  };

  const handleCloseMenuBar = () => {
    toggleMobileNavbar();
    setShowDetail([false, false]); // reset show detail
  };

  return (
    <div
      className={cls("mx-auto", style.navbar, {
        [style.navbar_selected]: isMobileNavbar,
      })}
    >
      <nav className="border-gray-200">
        <div
          className={cls(
            "relative mx-auto flex flex-wrap items-center justify-center",
            style.container,
          )}
        >
          <a href="/" className={cls("flex", style.logo)}>
            <Logo currentColor={isMobileNavbar ? "white" : "#017848"} />
          </a>
          <button
            data-collapse-toggle="mobile-menu"
            type="button"
            className="md:hidden ml-3 text-gray-400 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-lg inline-flex items-center justify-center"
            aria-controls="mobile-menu-2"
            aria-expanded="false"
            onClick={() => handleCloseMenuBar()}
          >
            <span className="sr-only">Open main menu</span>
            {!isMobileNavbar && (
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {isMobileNavbar && (
              <svg
                className=" w-6 h-6"
                fill="white"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
          <div
            className={cls(
              "hidden md:block w-full md:w-auto",
              style.desktop_menu,
              {
                "is-hidden": !isShowNavMenu,
              },
            )}
            id="desktop-menu"
          >
            <ul className="flex-col md:flex-row flex md:space-x-8 md:mt-0">
              <li className={cls("has-dropdown", style.nav)}>
                <button className={style.nav_item}>
                  Về Fin Zone
                  <i className="fas fa-caret-down ml-1" />
                </button>
                <div className={cls("dropdownmenu", style.dropdown_menu)}>
                  <ul className="py-1" aria-labelledby="dropdownLargeButton">
                    <li>
                      <Link
                        onClick={() => {
                          eventTracking(
                            EventType.top_navigation_click_about_us,
                            { path: "/gioi-thieu" },
                          );
                        }}
                        href="/gioi-thieu"
                        className={style.dropdown_item}
                      >
                        Giới thiệu
                      </Link>
                    </li>
                    <li>
                      <Link
                        onClick={() => {
                          eventTracking(
                            EventType.top_navigation_click_contact_us,
                            { path: "/lien-he" },
                          );
                        }}
                        href="/lien-he"
                        className={style.dropdown_item}
                      >
                        Liên hệ
                      </Link>
                    </li>
                  </ul>
                </div>
              </li>
              <li className={cls("has-dropdown", style.nav)}>
                <button className={style.nav_item}>
                  Sản phẩm
                  <i className="fas fa-caret-down ml-1" />
                </button>
                <div className={cls("dropdownmenu", style.dropdown_menu)}>
                  <ul className="py-1" aria-labelledby="dropdownLargeButton">
                    <li>
                      <Link
                        href="/vay-tieu-dung"
                        className={style.dropdown_item}
                        onClick={() => {
                          eventTracking(
                            EventType.top_navigation_click_product_lending,
                            { path: "/vay-tieu-dung" },
                          );
                        }}
                      >
                        Vay tiêu dùng
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/the-tin-dung"
                        className={style.dropdown_item}
                        onClick={() => {
                          eventTracking(
                            EventType.top_navigation_click_product_credit_card,
                            { path: "/the-tin-dung" },
                          );
                        }}
                      >
                        Thẻ tín dụng
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/bao-hiem"
                        className={style.dropdown_item}
                        onClick={() => {
                          eventTracking(
                            EventType.top_navigation_click_product_insurance,
                            { path: "/bao-hiem" },
                          );
                        }}
                      >
                        Bảo hiểm
                      </Link>
                    </li>
                  </ul>
                </div>
              </li>
              {/* <li className={style.nav}>
                <button
                  className={style.nav_item}
                  onClick={() => {
                    router.push("/blog");
                    eventTracking(
                      EventType.top_navigation_click_financial_knowledge,
                      { path: "/blog" }
                    );
                  }}
                >
                  Kiến thức tài chính
                </button>
              </li> */}
              <li className={cls("has-dropdown", style.nav)}>
                <button className={style.nav_item}>
                  Công cụ
                  <i className="fas fa-caret-down ml-1" />
                </button>
                <div className={cls("dropdownmenu", style.dropdown_menu)}>
                  <ul className="py-1" aria-labelledby="dropdownLargeButton">
                    <li>
                      <Link
                        href="/cong-cu/tinh-toan-khoan-vay"
                        className={style.dropdown_item}
                      >
                        Tính toán khoản vay
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/cong-cu/tinh-lai-tien-gui"
                        className={style.dropdown_item}
                      >
                        Tính lãi tiền gửi
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/cong-cu/tinh-luong-gross-net"
                        className={style.dropdown_item}
                      >
                        Tính lương Gross - Net
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/cong-cu/tinh-luong-net-gross"
                        className={style.dropdown_item}
                      >
                        Tính lương Net - Gross
                      </Link>
                    </li>
                  </ul>
                </div>
              </li>
              <li className={style.nav}>
                <button
                  className={style.nav_item}
                  onClick={() => {
                    router.push("/lien-he");
                    eventTracking(
                      EventType.top_navigation_click_financial_knowledge,
                      { path: "/lien-he" },
                    );
                  }}
                >
                  Hỗ trợ
                </button>
              </li>
              <li className={style.nav}>
                <button
                  className={style.nav_item}
                  onClick={() => {
                    router.push(FINZONE_BLOG_BASE_PATH);
                    eventTracking(
                      EventType.top_navigation_click_financial_knowledge,
                      { path: FINZONE_BLOG_BASE_PATH },
                    );
                  }}
                >
                  Blog
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div
          className={cls("w-full md:w-auto", style.mobile_menu, {
            "is-hidden": !isMobileNavbar,
          })}
          id="mobile-menu"
        >
          <ul>
            <li className="has-dropdown">
              <div
                className={cls(style.nav_level_1, {
                  [style.active]: showDetail[0],
                })}
                onClick={(e) => handleShowDetail(e, 0)}
                title={showDetail[0] ? "Thu gọn" : "Mở rộng"}
              >
                <div className={style.icon}>
                  <AboutSvg width="100%" height="100%" />
                </div>
                <div className={style.content}>Về Fin Zone</div>
                <div>
                  {showDetail[0]
                    ? <i className="fas fa-caret-up" />
                    : <i className="fas fa-caret-down" />}
                </div>
              </div>
              {showDetail[0] && (
                <div className="dropdownmenu-mobile">
                  <ul className="py-1" aria-labelledby="dropdownLargeButton">
                    <li className={style.nav_level_2}>
                      <Link
                        onClick={() => {
                          eventTracking(
                            EventType.top_navigation_click_about_us,
                            { path: "/gioi-thieu" },
                          );
                        }}
                        href="/gioi-thieu"
                      >
                        Giới thiệu
                      </Link>
                    </li>
                    <li className={style.nav_level_2}>
                      <Link
                        href="/lien-he"
                        onClick={() => {
                          eventTracking(
                            EventType.top_navigation_click_contact_us,
                            { path: "/lien-he" },
                          );
                        }}
                      >
                        Liên hệ
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </li>
            <li className="has-dropdown">
              <div
                className={cls(style.nav_level_1, {
                  [style.active]: showDetail[1],
                })}
                onClick={(e) => handleShowDetail(e, 1)}
                title={showDetail[1] ? "Thu gọn" : "Mở rộng"}
              >
                <div className={style.icon}>
                  <ProductSvg width="100%" height="100%" />
                </div>
                <div className={style.content}>Sản phẩm</div>
                <div>
                  {showDetail[1]
                    ? <i className="fas fa-caret-up" />
                    : <i className="fas fa-caret-down" />}
                </div>
              </div>
              {showDetail[1] && (
                <div className="dropdownmenu-mobile ">
                  <ul className="py-1" aria-labelledby="dropdownLargeButton">
                    <li className={style.nav_level_2}>
                      <Link
                        onClick={() => {
                          eventTracking(
                            EventType.top_navigation_click_product_lending,
                            { path: "/vay-tieu-dung" },
                          );
                        }}
                        href="/vay-tieu-dung"
                      >
                        Vay tiêu dùng
                      </Link>
                    </li>
                    <li className={style.nav_level_2}>
                      <Link
                        href="/the-tin-dung"
                        onClick={() => {
                          eventTracking(
                            EventType.top_navigation_click_product_credit_card,
                            { path: "/the-tin-dung" },
                          );
                        }}
                      >
                        Thẻ tín dụng
                      </Link>
                    </li>
                    <li className={style.nav_level_2}>
                      <Link
                        href="/bao-hiem"
                        onClick={() => {
                          eventTracking(
                            EventType.top_navigation_click_product_insurance,
                            { path: "/bao-hiem" },
                          );
                        }}
                      >
                        Bảo hiểm
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </li>
            <li className="has-dropdown">
              <div
                className={cls(style.nav_level_1, {
                  [style.active]: showDetail[2],
                })}
                onClick={(e) => handleShowDetail(e, 2)}
                title={showDetail[2] ? "Thu gọn" : "Mở rộng"}
              >
                <div className={style.icon}>
                  <FinancialKnowledgeSvg width="100%" height="100%" />
                </div>
                <div className={style.content}>Công cụ</div>
                <div>
                  {showDetail[2]
                    ? <i className="fas fa-caret-up" />
                    : <i className="fas fa-caret-down" />}
                </div>
              </div>
              {showDetail[2] && (
                <div className="dropdownmenu-mobile ">
                  <ul className="py-1" aria-labelledby="dropdownLargeButton">
                    <li className={style.nav_level_2}>
                      <Link href="/cong-cu/tinh-toan-khoan-vay">
                        Tính toán khoản vay
                      </Link>
                    </li>
                    <li className={style.nav_level_2}>
                      <Link href="/cong-cu/tinh-lai-tien-gui">
                        Tính lãi tiền gửi
                      </Link>
                    </li>
                    <li className={style.nav_level_2}>
                      <Link href="/cong-cu/tinh-luong-gross-net">
                        Tính lương Gross - Net
                      </Link>
                    </li>
                    <li className={style.nav_level_2}>
                      <Link href="/cong-cu/tinh-luong-net-gross">
                        Tính lương Net - Gross
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </li>
            <li>
              <div className={style.nav_level_1}>
                <div className={style.icon}>
                  <FinancialKnowledgeSvg width="100%" height="100%" />
                </div>
                <div className={style.content}>
                  <Link
                    onClick={() => {
                      eventTracking(
                        EventType.top_navigation_click_financial_knowledge,
                        { path: "/blog" },
                      );
                    }}
                    href={FINZONE_BLOG_BASE_PATH}
                    target="_blank"
                  >
                    Blog
                  </Link>
                </div>
              </div>
            </li>
            <li>
              <div className={style.nav_level_1}>
                <div className={style.icon}>
                  <HelpSvg width="100%" height="100%" />
                </div>
                <div className={style.content}>
                  <Link
                    onClick={() => {
                      eventTracking(
                        EventType.top_navigation_click_financial_knowledge,
                        { path: "/lien-he" },
                      );
                    }}
                    href="/lien-he"
                  >
                    Hỗ trợ
                  </Link>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default NavBar;
