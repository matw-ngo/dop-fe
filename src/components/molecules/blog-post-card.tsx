"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  User,
  Eye,
  MessageCircle,
  Share2,
  BookmarkPlus,
} from "lucide-react";
import Image from "next/image";

export interface BlogPostCardProps {
  id?: string;
  title: string;
  excerpt: string;
  content?: string;
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
  variant?: "default" | "horizontal" | "compact" | "featured" | "minimal";
  size?: "sm" | "md" | "lg";
  className?: string;
  imageClassName?: string;
  onClick?: () => void;
  onAuthorClick?: () => void;
  onCategoryClick?: (category: string) => void;
  onTagClick?: (tag: string) => void;
  showAuthor?: boolean;
  showMeta?: boolean;
  showActions?: boolean;
  showExcerpt?: boolean;
  truncateTitle?: number;
  truncateExcerpt?: number;
  imageAspectRatio?: "square" | "video" | "portrait";
}

// Utility function to format date
const formatDate = (date: string | Date): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
};

// Utility function to format relative time
const formatRelativeTime = (date: string | Date): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - d.getTime()) / (1000 * 60 * 60),
  );

  if (diffInHours < 1) return "Vừa xong";
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} ngày trước`;
  return formatDate(d);
};

// Utility function to truncate text
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
};

export function BlogPostCard({
  id,
  title,
  excerpt,
  image,
  author,
  publishedAt,
  readTime,
  category,
  tags = [],
  views,
  comments,
  variant = "default",
  size = "md",
  className,
  imageClassName,
  onClick,
  onAuthorClick,
  onCategoryClick,
  onTagClick,
  showAuthor = true,
  showMeta = true,
  showActions = false,
  showExcerpt = true,
  truncateTitle,
  truncateExcerpt,
  imageAspectRatio = "video",
}: BlogPostCardProps) {
  const isClickable = !!onClick;

  const variantStyles = {
    default: {
      container: "h-full flex flex-col",
      imageContainer: "relative overflow-hidden rounded-t-lg",
      content: "flex-1 flex flex-col",
      header: "space-y-2",
      footer: "mt-auto pt-4",
    },
    horizontal: {
      container: "flex flex-row h-full",
      imageContainer:
        "relative overflow-hidden rounded-l-lg w-1/3 flex-shrink-0",
      content: "flex-1 flex flex-col p-4",
      header: "space-y-2",
      footer: "mt-auto pt-3",
    },
    compact: {
      container: "h-full flex flex-col",
      imageContainer: "relative overflow-hidden rounded-t-lg",
      content: "flex-1 p-3",
      header: "space-y-1",
      footer: "mt-2",
    },
    featured: {
      container: "h-full flex flex-col",
      imageContainer: "relative overflow-hidden rounded-t-lg",
      content: "flex-1 flex flex-col p-6",
      header: "space-y-3",
      footer: "mt-auto pt-4",
    },
    minimal: {
      container: "space-y-2",
      imageContainer: "",
      content: "space-y-2",
      header: "space-y-1",
      footer: "",
    },
  };

  const sizeStyles = {
    sm: {
      container: "max-w-sm",
      image: "h-32",
      title: "text-sm font-semibold line-clamp-2",
      excerpt: "text-xs text-muted-foreground line-clamp-2",
      meta: "text-xs",
      tag: "text-xs px-2 py-0.5",
    },
    md: {
      container: "max-w-md",
      image: "h-48",
      title: "text-base font-semibold line-clamp-2",
      excerpt: "text-sm text-muted-foreground line-clamp-3",
      meta: "text-xs",
      tag: "text-xs px-2 py-1",
    },
    lg: {
      container: "max-w-lg",
      image: "h-64",
      title: "text-lg font-bold line-clamp-2",
      excerpt: "text-base text-muted-foreground line-clamp-4",
      meta: "text-sm",
      tag: "text-sm px-3 py-1",
    },
  };

  const aspectRatioStyles = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
  };

  const styles = variantStyles[variant];
  const sizes = sizeStyles[size];

  const displayTitle = truncateTitle
    ? truncateText(title, truncateTitle)
    : title;
  const displayExcerpt = truncateExcerpt
    ? truncateText(excerpt, truncateExcerpt)
    : excerpt;

  const renderImage = () => {
    if (!image) return null;

    return (
      <div
        className={cn(
          styles.imageContainer,
          sizes.image,
          aspectRatioStyles[imageAspectRatio],
          variant !== "minimal" && "mb-0",
          imageClassName,
        )}
      >
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Category Badge */}
        {category && (
          <Badge
            className="absolute top-2 left-2 cursor-pointer"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onCategoryClick?.(category);
            }}
          >
            {category}
          </Badge>
        )}

        {/* Read Time */}
        {readTime && (
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            <Clock className="inline w-3 h-3 mr-1" />
            {typeof readTime === "number" ? `${readTime} phút` : readTime}
          </div>
        )}
      </div>
    );
  };

  const renderAuthor = () => {
    if (!showAuthor || !author) return null;

    return (
      <div
        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          onAuthorClick?.();
        }}
      >
        <Avatar className="w-6 h-6">
          <AvatarImage src={author.avatar} alt={author.name} />
          <AvatarFallback className="text-xs">
            {author.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className={cn("font-medium", sizes.meta)}>{author.name}</span>
          {author.role && (
            <span className="text-xs text-muted-foreground">{author.role}</span>
          )}
        </div>
      </div>
    );
  };

  const renderMeta = () => {
    if (!showMeta) return null;

    return (
      <div
        className={cn(
          "flex items-center gap-4 text-muted-foreground",
          sizes.meta,
        )}
      >
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{formatRelativeTime(publishedAt)}</span>
        </div>

        {readTime && (
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>
              {typeof readTime === "number" ? `${readTime} phút` : readTime}
            </span>
          </div>
        )}

        {views && (
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{views.toLocaleString()}</span>
          </div>
        )}

        {comments && (
          <div className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            <span>{comments}</span>
          </div>
        )}
      </div>
    );
  };

  const renderTags = () => {
    if (!tags.length) return null;

    return (
      <div className="flex flex-wrap gap-1">
        {tags.slice(0, 3).map((tag, index) => (
          <Badge
            key={index}
            variant="outline"
            className={cn(
              "cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors",
              sizes.tag,
            )}
            onClick={(e) => {
              e.stopPropagation();
              onTagClick?.(tag);
            }}
          >
            {tag}
          </Badge>
        ))}
        {tags.length > 3 && (
          <Badge variant="outline" className={sizes.tag}>
            +{tags.length - 3}
          </Badge>
        )}
      </div>
    );
  };

  const renderActions = () => {
    if (!showActions) return null;

    return (
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" className="h-8 px-2">
          <Share2 className="w-3 h-3 mr-1" />
          Chia sẻ
        </Button>
        <Button size="sm" variant="ghost" className="h-8 px-2">
          <BookmarkPlus className="w-3 h-3 mr-1" />
          Lưu
        </Button>
      </div>
    );
  };

  const cardContent = (
    <>
      {variant !== "minimal" && renderImage()}

      <CardContent
        className={cn(
          styles.content,
          variant === "horizontal" && "border-0 p-0",
          variant === "minimal" && "p-0",
        )}
      >
        <div className={styles.header}>
          {/* Category for minimal variant */}
          {variant === "minimal" && category && (
            <Badge
              variant="secondary"
              className={cn("w-fit cursor-pointer", sizes.tag)}
              onClick={(e) => {
                e.stopPropagation();
                onCategoryClick?.(category);
              }}
            >
              {category}
            </Badge>
          )}

          {/* Title */}
          <CardTitle className={sizes.title}>{displayTitle}</CardTitle>

          {/* Excerpt */}
          {showExcerpt && excerpt && (
            <CardDescription className={sizes.excerpt}>
              {displayExcerpt}
            </CardDescription>
          )}

          {/* Tags */}
          {tags.length > 0 && <div className="mt-2">{renderTags()}</div>}
        </div>

        <div className={styles.footer}>
          {/* Author & Meta */}
          <div className="flex items-center justify-between gap-3">
            {renderAuthor()}
            <div className="flex-1">{renderMeta()}</div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="mt-3 pt-3 border-t">{renderActions()}</div>
          )}
        </div>
      </CardContent>
    </>
  );

  if (variant === "minimal") {
    return (
      <div
        className={cn(
          "group cursor-pointer",
          styles.container,
          sizes.container,
          className,
        )}
        onClick={onClick}
      >
        <div className={styles.content}>{cardContent}</div>
      </div>
    );
  }

  return (
    <div className={cn("group", sizes.container, className)}>
      <Card
        className={cn(
          styles.container,
          "transition-all duration-200 hover:shadow-lg",
          isClickable && "cursor-pointer hover:-translate-y-1",
          "h-full",
        )}
        onClick={onClick}
      >
        {cardContent}
      </Card>
    </div>
  );
}
