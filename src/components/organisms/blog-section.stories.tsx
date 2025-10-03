import type { Meta, StoryObj } from "@storybook/react";
import { BlogSection } from "./blog-section";

const meta: Meta<typeof BlogSection> = {
  title: "Organisms/BlogSection",
  component: BlogSection,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "BlogSection component for displaying blog posts and news articles with various layouts and filtering options.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "grid", "featured", "list", "carousel"],
      description: "Visual variant of the section",
    },
    layout: {
      control: "select",
      options: ["3-column", "2-column", "mixed", "masonry"],
      description: "Layout configuration",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size of the section",
    },
    background: {
      control: "select",
      options: ["none", "muted", "gradient"],
      description: "Background style",
    },
    showCategories: {
      control: "boolean",
      description: "Show category filter buttons",
    },
    showViewAll: {
      control: "boolean",
      description: "Show view all button",
    },
    showHeader: {
      control: "boolean",
      description: "Show section header",
    },
  },
};

export default meta;
type Story = StoryObj<typeof BlogSection>;

// Sample blog posts data
const samplePosts = [
  {
    id: "1",
    title: "Hướng dẫn vay tiền online an toàn và hiệu quả",
    excerpt:
      "Trong thời đại số hóa, việc vay tiền online đã trở nên phổ biến và tiện lợi. Tuy nhiên, không phải ai cũng biết cách vay tiền online một cách an toàn và hiệu quả nhất.",
    image: "/api/placeholder/600/400",
    author: {
      name: "Nguyễn Văn A",
      avatar: "/api/placeholder/40/40",
      role: "Chuyên gia tài chính",
    },
    publishedAt: "2024-01-15",
    readTime: 5,
    category: "Hướng dẫn",
    tags: ["Vay online", "Tài chính", "An toàn"],
    views: 1234,
    comments: 23,
    featured: true,
    href: "/blog/huong-dan-vay-tien-online",
  },
  {
    id: "2",
    title: "So sánh lãi suất vay của các ngân hàng tháng 12/2024",
    excerpt:
      "Phân tích chi tiết lãi suất vay tiêu dùng tại các ngân hàng lớn và đưa ra lời khuyên cho người vay.",
    image: "/api/placeholder/600/400",
    author: {
      name: "Trần Thị B",
      avatar: "/api/placeholder/40/40",
      role: "Phân tích viên",
    },
    publishedAt: "2024-01-12",
    readTime: 8,
    category: "Phân tích",
    tags: ["Lãi suất", "Ngân hàng", "So sánh"],
    views: 987,
    comments: 15,
    href: "/blog/so-sanh-lai-suat",
  },
  {
    id: "3",
    title: "Xu hướng Fintech Việt Nam 2024: Cơ hội và thách thức",
    excerpt:
      "Những xu hướng công nghệ tài chính nổi bật sẽ định hình thị trường Việt Nam trong năm 2024.",
    image: "/api/placeholder/600/400",
    author: {
      name: "Lê Văn C",
      avatar: "/api/placeholder/40/40",
      role: "CEO",
    },
    publishedAt: "2024-01-10",
    readTime: 12,
    category: "Xu hướng",
    tags: ["Fintech", "Công nghệ", "2024"],
    views: 2156,
    comments: 42,
    href: "/blog/xu-huong-fintech-2024",
  },
  {
    id: "4",
    title: "Mẹo quản lý tài chính cá nhân hiệu quả",
    excerpt:
      "Những bí quyết đơn giản nhưng hiệu quả để quản lý tài chính cá nhân tốt hơn.",
    image: "/api/placeholder/600/400",
    author: {
      name: "Phạm Thị D",
      avatar: "/api/placeholder/40/40",
      role: "Tư vấn viên",
    },
    publishedAt: "2024-01-08",
    readTime: 6,
    category: "Tips",
    tags: ["Quản lý tài chính", "Tiết kiệm"],
    views: 756,
    comments: 18,
    href: "/blog/meo-quan-ly-tai-chinh",
  },
  {
    id: "5",
    title: "Quy định mới về cho vay tiêu dùng có hiệu lực từ 2024",
    excerpt:
      "Tổng hợp những thay đổi quan trọng trong quy định về cho vay tiêu dùng.",
    image: "/api/placeholder/600/400",
    author: {
      name: "Luật sư E",
      avatar: "/api/placeholder/40/40",
      role: "Chuyên gia pháp lý",
    },
    publishedAt: "2024-01-05",
    readTime: 10,
    category: "Quy định",
    tags: ["Pháp luật", "Quy định", "Cho vay"],
    views: 1543,
    comments: 31,
    href: "/blog/quy-dinh-moi-cho-vay",
  },
  {
    id: "6",
    title: "Làm thế nào để cải thiện điểm tín dụng cá nhân?",
    excerpt:
      "Hướng dẫn chi tiết các bước cải thiện điểm tín dụng để dễ dàng vay vốn hơn.",
    image: "/api/placeholder/600/400",
    author: {
      name: "Nguyễn Văn F",
      avatar: "/api/placeholder/40/40",
      role: "Chuyên gia tín dụng",
    },
    publishedAt: "2024-01-03",
    readTime: 7,
    category: "Hướng dẫn",
    tags: ["Tín dụng", "Cải thiện", "Vay vốn"],
    views: 892,
    comments: 25,
    href: "/blog/cai-thien-diem-tin-dung",
  },
];

const categories = ["Hướng dẫn", "Phân tích", "Xu hướng", "Tips", "Quy định"];

export const Default: Story = {
  args: {
    posts: samplePosts.slice(0, 3),
    onPostClick: (post) => console.log("Post clicked:", post.title),
    onCategoryClick: (category) => console.log("Category clicked:", category),
    onTagClick: (tag) => console.log("Tag clicked:", tag),
  },
};

export const Grid: Story = {
  args: {
    variant: "grid",
    posts: samplePosts.slice(0, 6),
    title: "Bài viết mới nhất",
    description: "Cập nhật những thông tin hữu ích về tài chính và đầu tư",
    onPostClick: (post) => console.log("Post clicked:", post.title),
  },
};

export const Featured: Story = {
  args: {
    variant: "featured",
    posts: samplePosts.slice(0, 4),
    title: "Tin tức nổi bật",
    subtitle: "Được đọc nhiều nhất",
    description:
      "Những bài viết được quan tâm và chia sẻ nhiều nhất trong tuần qua",
    onPostClick: (post) => console.log("Featured post clicked:", post.title),
  },
};

export const List: Story = {
  args: {
    variant: "list",
    posts: samplePosts,
    title: "Tất cả bài viết",
    description: "Danh sách đầy đủ các bài viết theo thời gian",
    showViewAll: false,
    onPostClick: (post) => console.log("List post clicked:", post.title),
  },
};

export const TwoColumn: Story = {
  args: {
    layout: "2-column",
    posts: samplePosts.slice(0, 4),
    title: "Kiến thức tài chính",
    description: "Nâng cao hiểu biết về tài chính cá nhân",
    onPostClick: (post) => console.log("Post clicked:", post.title),
  },
};

export const Mixed: Story = {
  args: {
    layout: "mixed",
    posts: samplePosts.slice(0, 4),
    title: "Blog & Tin tức",
    subtitle: "Cập nhật mới nhất",
    description: "Tin tức nổi bật và các bài viết chuyên sâu về tài chính",
    onPostClick: (post) => console.log("Mixed post clicked:", post.title),
  },
};

export const WithCategories: Story = {
  args: {
    posts: samplePosts,
    title: "Danh mục bài viết",
    showCategories: true,
    categories,
    activeCategory: "all",
    maxPosts: 6,
    onCategoryFilter: (category) =>
      console.log("Filter by category:", category),
    onPostClick: (post) => console.log("Post clicked:", post.title),
  },
};

export const Carousel: Story = {
  args: {
    variant: "carousel",
    posts: samplePosts,
    title: "Bài viết đáng chú ý",
    description: "Cuộn ngang để xem tất cả bài viết",
    onPostClick: (post) => console.log("Carousel post clicked:", post.title),
  },
};

export const WithBackground: Story = {
  args: {
    background: "gradient",
    posts: samplePosts.slice(0, 3),
    title: "Kiến thức từ chuyên gia",
    subtitle: "Blog series",
    description:
      "Những bài viết chuyên sâu từ đội ngũ chuyên gia tài chính hàng đầu",
    variant: "grid",
  },
};

export const Compact: Story = {
  args: {
    size: "sm",
    posts: samplePosts.slice(0, 3),
    title: "Tin tức",
    variant: "grid",
    spacing: "tight",
    showViewAll: false,
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    posts: samplePosts.slice(0, 3),
    title: "Trung tâm kiến thức tài chính",
    subtitle: "Knowledge Hub",
    description:
      "Nơi chia sẻ những kiến thức chuyên sâu, phân tích thị trường và xu hướng tài chính mới nhất từ đội ngũ chuyên gia hàng đầu",
    variant: "featured",
    background: "muted",
    spacing: "loose",
  },
};
