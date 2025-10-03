"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { BlogPostCard } from "@/components/molecules/blog-post-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, TrendingUp } from "lucide-react";

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image?: string;
  author?: {
    name: string;
    avatar?: string;
    role?: string;
  };
  publishedAt: string | Date;
  readTime?: string | number;
  category?: string;
  tags?: string[];
  views?: number;
  comments?: number;
  featured?: boolean;
  href?: string;
}

export interface BlogSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  posts: BlogPost[];
  variant?: "default" | "grid" | "featured" | "list" | "carousel";
  layout?: "3-column" | "2-column" | "mixed" | "masonry";
  size?: "sm" | "md" | "lg";
  className?: string;
  headerClassName?: string;
  postsClassName?: string;
  showHeader?: boolean;
  showViewAll?: boolean;
  viewAllText?: string;
  viewAllHref?: string;
  onViewAllClick?: () => void;
  onPostClick?: (post: BlogPost) => void;
  onCategoryClick?: (category: string) => void;
  onTagClick?: (tag: string) => void;
  maxPosts?: number;
  showCategories?: boolean;
  categories?: string[];
  activeCategory?: string;
  onCategoryFilter?: (category: string) => void;
  background?: "none" | "muted" | "gradient";
  spacing?: "tight" | "normal" | "loose";
}

export function BlogSection({
  title = "Tin tức & Bài viết",
  subtitle,
  description = "Cập nhật thông tin mới nhất về tài chính và các chương trình ưu đãi",
  posts,
  variant = "default",
  layout = "3-column",
  size = "md",
  className,
  headerClassName,
  postsClassName,
  showHeader = true,
  showViewAll = true,
  viewAllText = "Xem tất cả bài viết",
  viewAllHref = "/blog",
  onViewAllClick,
  onPostClick,
  onCategoryClick,
  onTagClick,
  maxPosts,
  showCategories = false,
  categories = [],
  activeCategory = "all",
  onCategoryFilter,
  background = "none",
  spacing = "normal",
}: BlogSectionProps) {
  const [filteredPosts, setFilteredPosts] = React.useState(posts);

  // Filter posts by category
  React.useEffect(() => {
    if (activeCategory === "all") {
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(
        posts.filter((post) => post.category === activeCategory),
      );
    }
  }, [posts, activeCategory]);

  // Limit posts if maxPosts is specified
  const displayPosts = maxPosts
    ? filteredPosts.slice(0, maxPosts)
    : filteredPosts;

  const variantStyles = {
    default: {
      container: "py-16",
      header: "text-center space-y-4 mb-12",
      postsContainer: "grid gap-6",
    },
    grid: {
      container: "py-12",
      header: "text-center space-y-3 mb-10",
      postsContainer: "grid gap-4",
    },
    featured: {
      container: "py-16",
      header: "text-center space-y-4 mb-12",
      postsContainer: "space-y-8",
    },
    list: {
      container: "py-12",
      header: "space-y-3 mb-8",
      postsContainer: "space-y-4",
    },
    carousel: {
      container: "py-16",
      header: "text-center space-y-4 mb-12",
      postsContainer: "flex gap-6 overflow-x-auto pb-4",
    },
  };

  const layoutStyles = {
    "2-column": "grid-cols-1 lg:grid-cols-2",
    "3-column": "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    mixed: "", // Special handling
    masonry: "columns-1 md:columns-2 lg:columns-3 gap-6",
  };

  const sizeStyles = {
    sm: {
      title: "text-2xl font-bold",
      subtitle: "text-sm font-medium text-primary",
      description: "text-sm text-muted-foreground",
      container: "max-w-4xl",
      cardSize: "sm" as const,
    },
    md: {
      title: "text-3xl font-bold",
      subtitle: "text-base font-medium text-primary",
      description: "text-base text-muted-foreground",
      container: "max-w-6xl",
      cardSize: "md" as const,
    },
    lg: {
      title: "text-4xl font-bold",
      subtitle: "text-lg font-medium text-primary",
      description: "text-lg text-muted-foreground",
      container: "max-w-7xl",
      cardSize: "lg" as const,
    },
  };

  const backgroundStyles = {
    none: "",
    muted: "bg-muted/50",
    gradient: "bg-gradient-to-br from-primary/5 via-background to-secondary/5",
  };

  const spacingStyles = {
    tight: "gap-4",
    normal: "gap-6",
    loose: "gap-8",
  };

  const styles = variantStyles[variant];
  const sizes = sizeStyles[size];
  const bgStyle = backgroundStyles[background];

  const handleCategoryClick = (category: string) => {
    onCategoryFilter?.(category);
  };

  const handlePostClick = (post: BlogPost) => {
    if (post.href) {
      window.open(post.href, "_self");
    }
    onPostClick?.(post);
  };

  const renderCategories = () => {
    if (!showCategories || !categories.length) return null;

    const allCategories = ["all", ...categories];

    return (
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {allCategories.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryClick(category)}
            className="h-8"
          >
            {category === "all" ? "Tất cả" : category}
          </Button>
        ))}
      </div>
    );
  };

  const renderHeader = () => {
    if (!showHeader) return null;

    return (
      <div className={cn(styles.header, headerClassName)}>
        {subtitle && (
          <div className="flex items-center justify-center gap-2">
            <Badge variant="secondary" className={sizes.subtitle}>
              {subtitle}
            </Badge>
          </div>
        )}

        <h2 className={sizes.title}>{title}</h2>

        {description && (
          <p className={cn("max-w-3xl mx-auto", sizes.description)}>
            {description}
          </p>
        )}

        {renderCategories()}
      </div>
    );
  };

  const renderFeaturedLayout = () => {
    if (variant !== "featured" || displayPosts.length === 0) return null;

    const featuredPost = displayPosts[0];
    const otherPosts = displayPosts.slice(1, 4);

    return (
      <div className="space-y-8">
        {/* Featured Post */}
        <BlogPostCard
          {...featuredPost}
          variant="featured"
          size={sizes.cardSize}
          onClick={() => handlePostClick(featuredPost)}
          onCategoryClick={onCategoryClick}
          onTagClick={onTagClick}
          showActions={true}
        />

        {/* Other Posts */}
        {otherPosts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {otherPosts.map((post) => (
              <BlogPostCard
                key={post.id}
                {...post}
                variant="compact"
                size="sm"
                onClick={() => handlePostClick(post)}
                onCategoryClick={onCategoryClick}
                onTagClick={onTagClick}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderMixedLayout = () => {
    if (layout !== "mixed" || displayPosts.length === 0) return null;

    const mainPost = displayPosts[0];
    const sidePosts = displayPosts.slice(1, 4);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Post */}
        <div className="lg:col-span-2">
          <BlogPostCard
            {...mainPost}
            variant="default"
            size={sizes.cardSize}
            onClick={() => handlePostClick(mainPost)}
            onCategoryClick={onCategoryClick}
            onTagClick={onTagClick}
            showActions={true}
          />
        </div>

        {/* Side Posts */}
        {sidePosts.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Bài viết khác</h3>
            {sidePosts.map((post) => (
              <BlogPostCard
                key={post.id}
                {...post}
                variant="minimal"
                size="sm"
                onClick={() => handlePostClick(post)}
                onCategoryClick={onCategoryClick}
                onTagClick={onTagClick}
                showExcerpt={false}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderDefaultPosts = () => {
    if (variant === "featured") {
      return renderFeaturedLayout();
    }

    if (layout === "mixed") {
      return renderMixedLayout();
    }

    const containerClasses = cn(
      styles.postsContainer,
      variant !== "carousel" && variant !== "list" && layoutStyles[layout],
      spacingStyles[spacing],
      layout === "masonry" && "break-inside-avoid",
      postsClassName,
    );

    if (variant === "carousel") {
      return (
        <div className={containerClasses}>
          {displayPosts.map((post) => (
            <div key={post.id} className="min-w-[300px] flex-shrink-0">
              <BlogPostCard
                {...post}
                variant="default"
                size={sizes.cardSize}
                onClick={() => handlePostClick(post)}
                onCategoryClick={onCategoryClick}
                onTagClick={onTagClick}
              />
            </div>
          ))}
        </div>
      );
    }

    if (variant === "list") {
      return (
        <div className={containerClasses}>
          {displayPosts.map((post) => (
            <BlogPostCard
              key={post.id}
              {...post}
              variant="horizontal"
              size={sizes.cardSize}
              onClick={() => handlePostClick(post)}
              onCategoryClick={onCategoryClick}
              onTagClick={onTagClick}
            />
          ))}
        </div>
      );
    }

    return (
      <div className={containerClasses}>
        {displayPosts.map((post, index) => (
          <div
            key={post.id}
            className={layout === "masonry" ? "break-inside-avoid mb-6" : ""}
          >
            <BlogPostCard
              {...post}
              variant="default"
              size={sizes.cardSize}
              onClick={() => handlePostClick(post)}
              onCategoryClick={onCategoryClick}
              onTagClick={onTagClick}
              highlight={post.featured}
            />
          </div>
        ))}
      </div>
    );
  };

  const renderViewAll = () => {
    if (!showViewAll) return null;

    return (
      <div className="text-center mt-12">
        <Button
          variant="outline"
          size="lg"
          onClick={onViewAllClick}
          asChild={!!viewAllHref}
        >
          {viewAllHref ? (
            <a href={viewAllHref}>
              {viewAllText}
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
          ) : (
            <>
              {viewAllText}
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    );
  };

  return (
    <section className={cn(bgStyle, className)}>
      <div
        className={cn(
          "container mx-auto px-4",
          styles.container,
          sizes.container,
        )}
      >
        {renderHeader()}
        {renderDefaultPosts()}
        {renderViewAll()}
      </div>
    </section>
  );
}
