import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Star,
  StarHalf,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Filter,
  ChevronDown,
  User,
} from "lucide-react";
import { DetailedCreditCardInfo } from "@/types/credit-card";

interface ReviewsTabProps {
  card: DetailedCreditCardInfo;
}

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  helpful: number;
  notHelpful: number;
  verified: boolean;
  usageDuration: string;
  pros: string[];
  cons: string[];
}

export const ReviewsTab: React.FC<ReviewsTabProps> = ({ card }) => {
  const t = useTranslations("pages.creditCard");
  const [sortBy, setSortBy] = useState<"recent" | "helpful" | "rating">(
    "recent",
  );
  const [filterBy, setFilterBy] = useState<"all" | 5 | 4 | 3 | 2 | 1>("all");

  // Mock reviews data - in real app, this would come from API
  const mockReviews: Review[] = [
    {
      id: "1",
      author: "Nguyễn Văn A",
      rating: 5,
      date: "2024-01-15",
      title: "Tuyệt vời",
      content:
        "Thẻ rất tốt, nhiều ưu đãi, điểm thưởng hấp dẫn. Dịch vụ khách hàng chuyên nghiệp.",
      helpful: 23,
      notHelpful: 2,
      verified: true,
      usageDuration: "1 năm",
      pros: ["Ưu đãi đa dạng", "Tích điểm nhanh", "Dịch vụ tốt"],
      cons: ["Phí thường niên hơi cao"],
    },
    {
      id: "2",
      author: "Trần Thị B",
      rating: 4,
      date: "2024-01-10",
      title: "Khá tốt",
      content:
        "Thẻ dùng ổn, ứng dụng tiện lợi. Chỉ có điểm chưa hài lòng là phí chuyển đổi ngoại tệ.",
      helpful: 15,
      notHelpful: 3,
      verified: true,
      usageDuration: "6 tháng",
      pros: ["App dễ dùng", "Phí hợp lý", "Nhiều tiện ích"],
      cons: ["Phí ngoại tệ cao", "Giới hạn tín dụng thấp"],
    },
    {
      id: "3",
      author: "Lê Văn C",
      rating: 3,
      date: "2024-01-05",
      title: "Bình thường",
      content:
        "Thẻ dùng được nhưng không có gì đặc biệt. Chương trình điểm thưởng không hấp dẫn lắm.",
      helpful: 8,
      notHelpful: 5,
      verified: false,
      usageDuration: "3 tháng",
      pros: ["Duyệt nhanh"],
      cons: ["Ít ưu đãi", "Điểm thưởng thấp"],
    },
  ];

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: Math.floor(Math.random() * mockReviews.length) + 1,
    percentage: 0,
  }));

  const totalReviews = ratingDistribution.reduce((sum, r) => sum + r.count, 0);
  ratingDistribution.forEach((r) => {
    r.percentage = totalReviews > 0 ? (r.count / totalReviews) * 100 : 0;
  });

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
    const sizeClass = {
      sm: "w-3 h-3",
      md: "w-4 h-4",
      lg: "w-5 h-5",
    }[size];

    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          if (star <= rating) {
            return (
              <Star
                key={star}
                className={`${sizeClass} fill-yellow-400 text-yellow-400`}
              />
            );
          } else if (star - 0.5 <= rating) {
            return (
              <StarHalf
                key={star}
                className={`${sizeClass} fill-yellow-400 text-yellow-400`}
              />
            );
          } else {
            return <Star key={star} className={`${sizeClass} text-gray-300`} />;
          }
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            {t("reviews.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">{card.rating}</div>
              {renderStars(card.rating, "lg")}
              <p className="text-muted-foreground mt-2">
                {card.reviewCount} {t("reviews.totalReviews")}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingDistribution.map((r) => (
                <div key={r.rating} className="flex items-center gap-3">
                  <span className="text-sm w-3">{r.rating}</span>
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <Progress value={r.percentage} className="flex-1" />
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {r.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Sort */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <span className="text-sm">{t("reviews.filterBy")}</span>
          <div className="flex gap-1">
            {[5, 4, 3, 2, 1].map((rating) => (
              <Button
                key={rating}
                variant={filterBy === rating ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setFilterBy(filterBy === rating ? "all" : rating)
                }
                className="min-w-[40px]"
              >
                {rating}★
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm">{t("reviews.sortBy")}</span>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            {t(`reviews.sortOptions.${sortBy}`)}
            <ChevronDown className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {mockReviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarFallback>
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{review.author}</h4>
                        {review.verified && (
                          <Badge variant="secondary" className="text-xs">
                            {t("reviews.verified")}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        {renderStars(review.rating, "sm")}
                        <span>{review.date}</span>
                        <span>•</span>
                        <span>{review.usageDuration}</span>
                      </div>
                    </div>
                  </div>

                  {/* Review Title */}
                  <h5 className="font-medium mb-2">{review.title}</h5>

                  {/* Review Content */}
                  <p className="text-sm text-muted-foreground mb-4">
                    {review.content}
                  </p>

                  {/* Pros and Cons */}
                  {(review.pros.length > 0 || review.cons.length > 0) && (
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      {review.pros.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-green-700 mb-2">
                            {t("reviews.pros")}:
                          </p>
                          <ul className="text-sm space-y-1">
                            {review.pros.map((pro, index) => (
                              <li
                                key={index}
                                className="flex items-center gap-1"
                              >
                                <span className="w-1 h-1 bg-green-600 rounded-full" />
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {review.cons.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-red-700 mb-2">
                            {t("reviews.cons")}:
                          </p>
                          <ul className="text-sm space-y-1">
                            {review.cons.map((con, index) => (
                              <li
                                key={index}
                                className="flex items-center gap-1"
                              >
                                <span className="w-1 h-1 bg-red-600 rounded-full" />
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Helpful Actions */}
                  <div className="flex items-center gap-4 pt-3 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      {t("reviews.helpful")} ({review.helpful})
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <ThumbsDown className="w-3 h-3" />
                      {t("reviews.notHelpful")} ({review.notHelpful})
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3" />
                      {t("reviews.reply")}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline">{t("reviews.loadMore")}</Button>
      </div>

      {/* Write Review CTA */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 text-center">
          <h3 className="font-semibold mb-2">
            {t("reviews.writeReview.title")}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t("reviews.writeReview.description")}
          </p>
          <Button>{t("reviews.writeReview.button")}</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewsTab;
