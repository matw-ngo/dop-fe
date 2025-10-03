import type { Meta, StoryObj } from "@storybook/react";
import { BlogPostCard } from "./blog-post-card";

const meta: Meta<typeof BlogPostCard> = {
  title: "Molecules/BlogPostCard",
  component: BlogPostCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "BlogPostCard component for displaying blog posts, news articles, and content previews with rich metadata and interactive elements.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "horizontal", "compact", "featured", "minimal"],
      description: "Layout variant of the card",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size of the component",
    },
    showAuthor: {
      control: "boolean",
      description: "Show author information",
    },
    showMeta: {
      control: "boolean",
      description: "Show metadata (date, read time, views, comments)",
    },
    showActions: {
      control: "boolean",
      description: "Show action buttons (share, bookmark)",
    },
    showExcerpt: {
      control: "boolean",
      description: "Show post excerpt",
    },
    imageAspectRatio: {
      control: "select",
      options: ["square", "video", "portrait"],
      description: "Aspect ratio for images",
    },
  },
};

export default meta;
type Story = StoryObj<typeof BlogPostCard>;

// Sample data
const sampleAuthor = {
  name: "Nguyễn Văn A",
  avatar: "/api/placeholder/40/40",
  role: "Chuyên gia tài chính",
};

const samplePost = {
  title: "Hướng dẫn vay tiền online an toàn và hiệu quả",
  excerpt:
    "Trong thời đại số hóa, việc vay tiền online đã trở nên phổ biến và tiện lợi. Tuy nhiên, không phải ai cũng biết cách vay tiền online một cách an toàn và hiệu quả nhất.",
  image: "/api/placeholder/600/400",
  author: sampleAuthor,
  publishedAt: "2024-01-15",
  readTime: 5,
  category: "Hướng dẫn",
  tags: ["Vay online", "Tài chính", "An toàn", "Hiệu quả"],
  views: 1234,
  comments: 23,
};

export const Default: Story = {
  args: {
    ...samplePost,
    onClick: () => alert("Post clicked!"),
  },
};

export const Horizontal: Story = {
  args: {
    ...samplePost,
    variant: "horizontal",
    onClick: () => alert("Post clicked!"),
  },
};

export const Compact: Story = {
  args: {
    ...samplePost,
    title: "Tips vay vốn kinh doanh cho SME",
    excerpt: "Những lưu ý quan trọng khi vay vốn kinh doanh.",
    variant: "compact",
    size: "sm",
    onClick: () => alert("Post clicked!"),
  },
};

export const Featured: Story = {
  args: {
    ...samplePost,
    title: "Xu hướng cho vay P2P tại Việt Nam 2024",
    excerpt:
      "Phân tích chi tiết về thị trường cho vay ngang hàng (P2P) tại Việt Nam, những cơ hội và thách thức trong năm 2024. Các chuyên gia dự đoán sự phát triển mạnh mẽ của mô hình này.",
    variant: "featured",
    size: "lg",
    showActions: true,
    onClick: () => alert("Featured post clicked!"),
  },
};

export const Minimal: Story = {
  args: {
    ...samplePost,
    variant: "minimal",
    showMeta: true,
    onClick: () => alert("Minimal post clicked!"),
  },
};

export const WithoutImage: Story = {
  args: {
    ...samplePost,
    image: undefined,
    title: "Phân tích lãi suất vay tiêu dùng quý 4/2024",
    excerpt:
      "Báo cáo chi tiết về biến động lãi suất vay tiêu dùng trong quý 4 năm 2024, so sánh giữa các ngân hàng và định hướng cho năm 2025.",
    onClick: () => alert("Post without image clicked!"),
  },
};

export const WithoutAuthor: Story = {
  args: {
    ...samplePost,
    showAuthor: false,
    title: "Thông báo: Cập nhật chính sách lãi suất mới",
    category: "Thông báo",
    onClick: () => alert("Post clicked!"),
  },
};

export const SmallSize: Story = {
  args: {
    ...samplePost,
    size: "sm",
    title: "Tips quản lý tài chính cá nhân",
    excerpt: "Những mẹo hay giúp bạn quản lý tài chính hiệu quả.",
    variant: "compact",
    onClick: () => alert("Small post clicked!"),
  },
};

export const LargeSize: Story = {
  args: {
    ...samplePost,
    size: "lg",
    title: "Nghiên cứu: Tác động của AI đến ngành tài chính Việt Nam",
    excerpt:
      "Một nghiên cứu toàn diện về cách trí tuệ nhân tạo đang thay đổi bộ mặt ngành tài chính tại Việt Nam. Từ việc tự động hóa quy trình đến cải thiện trải nghiệm khách hàng, AI đang mở ra những cơ hội mới.",
    variant: "featured",
    showActions: true,
    onClick: () => alert("Large post clicked!"),
  },
};

export const WithManyTags: Story = {
  args: {
    ...samplePost,
    tags: [
      "Vay online",
      "Tài chính",
      "An toàn",
      "Hiệu quả",
      "Digital",
      "Fintech",
      "Banking",
      "Technology",
    ],
    onClick: () => alert("Post clicked!"),
  },
};

export const RecentPost: Story = {
  args: {
    ...samplePost,
    title: "Cập nhật mới nhất về quy định vay tiền 2024",
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    category: "Tin tức",
    onClick: () => alert("Recent post clicked!"),
  },
};

// Real-world examples
export const BlogGrid: Story = {
  name: "Blog Grid Layout",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <BlogPostCard
        title="Hướng dẫn vay tiền online an toàn"
        excerpt="Những điều cần biết khi vay tiền online để tránh rủi ro và lựa chọn đúng nền tảng uy tín."
        image="/api/placeholder/600/400"
        author={sampleAuthor}
        publishedAt="2024-01-15"
        readTime={5}
        category="Hướng dẫn"
        tags={["Vay online", "An toàn"]}
        views={1234}
        comments={23}
        onClick={() => alert("Post 1 clicked!")}
      />

      <BlogPostCard
        title="So sánh lãi suất vay của các ngân hàng"
        excerpt="Phân tích chi tiết lãi suất vay tiêu dùng tại các ngân hàng lớn trong tháng 12/2024."
        image="/api/placeholder/600/400"
        author={{
          name: "Trần Thị B",
          avatar: "/api/placeholder/40/40",
          role: "Phân tích viên",
        }}
        publishedAt="2024-01-12"
        readTime={8}
        category="Phân tích"
        tags={["Lãi suất", "Ngân hàng"]}
        views={987}
        comments={15}
        onClick={() => alert("Post 2 clicked!")}
      />

      <BlogPostCard
        title="Xu hướng Fintech 2024"
        excerpt="Những xu hướng công nghệ tài chính nổi bật sẽ định hình thị trường trong năm 2024."
        image="/api/placeholder/600/400"
        author={{
          name: "Lê Văn C",
          avatar: "/api/placeholder/40/40",
          role: "CEO",
        }}
        publishedAt="2024-01-10"
        readTime={12}
        category="Xu hướng"
        tags={["Fintech", "Công nghệ", "2024"]}
        views={2156}
        comments={42}
        onClick={() => alert("Post 3 clicked!")}
      />
    </div>
  ),
};

export const FeaturedAndSidebar: Story = {
  name: "Featured + Sidebar Layout",
  render: () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Featured Post */}
      <div className="lg:col-span-2">
        <BlogPostCard
          title="Phân tích sâu: Thị trường cho vay P2P Việt Nam 2024"
          excerpt="Nghiên cứu toàn diện về thị trường cho vay ngang hàng tại Việt Nam, từ quy mô, tăng trưởng đến những thách thức và cơ hội trong năm 2024. Bao gồm so sánh với các thị trường khu vực và dự báo xu hướng phát triển."
          image="/api/placeholder/800/500"
          author={sampleAuthor}
          publishedAt="2024-01-15"
          readTime={15}
          category="Nghiên cứu"
          tags={["P2P", "Fintech", "Thị trường", "Phân tích"]}
          views={5432}
          comments={89}
          variant="featured"
          size="lg"
          showActions={true}
          onClick={() => alert("Featured post clicked!")}
        />
      </div>

      {/* Sidebar Posts */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">Bài viết khác</h3>

        <BlogPostCard
          title="Tips tiết kiệm tiền hiệu quả"
          excerpt="Những cách tiết kiệm tiền đơn giản nhưng hiệu quả."
          author={{ name: "Admin", avatar: "/api/placeholder/40/40" }}
          publishedAt="2024-01-14"
          readTime={3}
          category="Tips"
          variant="minimal"
          onClick={() => alert("Sidebar post 1 clicked!")}
        />

        <BlogPostCard
          title="Cách tính lãi suất vay trả góp"
          excerpt="Hướng dẫn chi tiết cách tính lãi suất."
          author={{ name: "Expert", avatar: "/api/placeholder/40/40" }}
          publishedAt="2024-01-13"
          readTime={5}
          category="Hướng dẫn"
          variant="minimal"
          onClick={() => alert("Sidebar post 2 clicked!")}
        />

        <BlogPostCard
          title="Quy định mới về vay tiêu dùng"
          excerpt="Những thay đổi trong quy định mới nhất."
          author={{ name: "Legal", avatar: "/api/placeholder/40/40" }}
          publishedAt="2024-01-12"
          readTime={7}
          category="Quy định"
          variant="minimal"
          onClick={() => alert("Sidebar post 3 clicked!")}
        />
      </div>
    </div>
  ),
};

export const HorizontalList: Story = {
  name: "Horizontal List Layout",
  render: () => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Tin tức mới nhất</h3>

      <div className="space-y-4">
        <BlogPostCard
          title="Ngân hàng Nhà nước điều chỉnh lãi suất cơ bản"
          excerpt="NHNN vừa công bố quyết định điều chỉnh lãi suất cơ bản xuống 0.25%, tạo điều kiện thuận lợi cho các hoạt động tín dụng."
          image="/api/placeholder/400/300"
          author={sampleAuthor}
          publishedAt="2024-01-15"
          readTime={6}
          category="Tin tức"
          tags={["NHNN", "Lãi suất"]}
          views={3456}
          comments={67}
          variant="horizontal"
          onClick={() => alert("News 1 clicked!")}
        />

        <BlogPostCard
          title="Fintech Việt Nam thu hút 500 triệu USD đầu tư"
          excerpt="Các startup fintech Việt Nam đã thu hút được tổng cộng 500 triệu USD vốn đầu tư trong năm 2024, tăng 25% so với năm trước."
          image="/api/placeholder/400/300"
          author={{
            name: "Báo chí",
            avatar: "/api/placeholder/40/40",
            role: "Phóng viên",
          }}
          publishedAt="2024-01-14"
          readTime={4}
          category="Đầu tư"
          tags={["Fintech", "Đầu tư", "Startup"]}
          views={2891}
          comments={34}
          variant="horizontal"
          onClick={() => alert("News 2 clicked!")}
        />

        <BlogPostCard
          title="Ra mắt sản phẩm vay không thế chấp mới"
          excerpt="Sản phẩm vay tiêu dùng không thế chấp với lãi suất ưu đãi từ 8.5%/năm, thủ tục đơn giản và giải ngân nhanh chóng."
          image="/api/placeholder/400/300"
          author={{
            name: "Marketing",
            avatar: "/api/placeholder/40/40",
            role: "Content Manager",
          }}
          publishedAt="2024-01-13"
          readTime={3}
          category="Sản phẩm"
          tags={["Vay tiêu dùng", "Không thế chấp"]}
          views={1567}
          comments={12}
          variant="horizontal"
          onClick={() => alert("News 3 clicked!")}
        />
      </div>
    </div>
  ),
};
