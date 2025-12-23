import { finzoneTheme } from "@/configs/themes";
import { TenantConfig } from "./types";

export const finzoneConfig: TenantConfig = {
  id: "finzone",
  name: "Fin Zone",
  domain: "finzone.vn",
  theme: finzoneTheme,
  i18nNamespace: "tenants.finzone",

  branding: {
    logoUrl: "/images/logo.png",
  },

  products: {
    loan: {
      minAmount: 1_000_000, // 1 million VND
      maxAmount: 100_000_000, // 100 million VND
      minTerm: 3, // 3 months
      maxTerm: 24, // 24 months
      minRate: 0.8, // 0.8% per month
      maxRate: 2.17, // 2.17% per month
      approvalTime: 30, // 30 seconds
    },
    creditCard: {
      enabled: true,
    },
    insurance: {
      enabled: true,
    },
  },

  stats: {
    partnersCount: 16,
    connectionsCount: 100_000,
    registrationsCount: 10_000,
    successfulLoansCount: 1_000,
  },

  features: {
    enableBlog: true,
    socialMedia: {
      instagram: "https://www.instagram.com/finzone.vietnam",
      facebook: "https://www.facebook.com/finzonevietnam/",
      tiktok: "https://www.tiktok.com/@finzone.vn",
      youtube: "https://www.youtube.com/channel/UCekh_IetVHbSzmUwuyh16Gw",
    },
  },

  legal: {
    companyName: "Công ty Cổ phần Công nghệ Data Nest",
    businessLicense: "0108201417",
    socialLicense: "26/GP-BTTTT",
    addresses: [
      {
        type: "headquarters",
        city: "Hà Nội",
        address: "Tầng 7, HITC Building, 239 Xuân Thuỷ, Q. Cầu Giấy",
      },
      {
        type: "branch",
        city: "Hồ Chí Minh",
        address: "Tòa nhà Viettel, 285 Cách Mạng Tháng 8, Quận 10",
      },
    ],
    disclaimer:
      "Fin Zone không phải đơn vị cung cấp cho vay và không phát hành các khoản vay. Dịch vụ của Fin Zone giúp đánh giá các đối tác vay uy tín với các sản phẩm tài chính đa dạng, thời gian trả nợ linh hoạt từ 91 đến 180 ngày, với lãi suất APR tối thiểu là 0% và tối đa là 20%. Fin Zone không tính phí sử dụng dịch vụ. Chi phí cuối cùng mà người vay phải trả phụ thuộc vào từng khoản vay. Người dùng sẽ nhận được thông tin đầy đủ và chính xác về APR, cũng như tất cả các khoản phí trước khi ký hợp đồng vay.",
  },
};
