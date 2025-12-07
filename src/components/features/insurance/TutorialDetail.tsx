"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Share2,
  Bookmark,
  Clock,
  User,
  Calendar,
  Tag,
  ChevronRight,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  ThumbsUp,
  CheckCircle,
  AlertCircle,
  FileText,
  Calculator,
  Calculator as CalculatorIcon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
// TODO: Import tutorials from proper source
const tutorials: any[] = [];

interface TutorialDetailProps {
  tutorial: any;
  content: any;
  locale: string;
}

export default function TutorialDetail({
  tutorial,
  content,
  locale,
}: TutorialDetailProps) {
  const t = useTranslations("features.insurance.main");
  const params = useParams();
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const title = t(tutorial.titleKey);

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };

    if (platform in shareUrls) {
      window.open(
        shareUrls[platform as keyof typeof shareUrls],
        "_blank",
        "width=600,height=400",
      );
    } else if (platform === "copy") {
      try {
        await navigator.clipboard.writeText(url);
        toast.success(t("tutorial.share.copied"));
      } catch (err) {
        toast.error(t("tutorial.share.copyFailed"));
      }
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(
      isBookmarked
        ? t("tutorial.bookmark.removed")
        : t("tutorial.bookmark.added"),
    );
  };

  const relatedTutorials = tutorials.filter((t: any) =>
    content.relatedArticles?.includes(t.id),
  );

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("tutorial.back")}
              </Button>
              <nav className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                <Link href="/insurance" className="hover:text-gray-700">
                  {t("nav.insurance")}
                </Link>
                <ChevronRight className="h-4 w-4" />
                <Link
                  href="/insurance/tutorials"
                  className="hover:text-gray-700"
                >
                  {t("tutorials.title")}
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-gray-900">{t(tutorial.titleKey)}</span>
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
                className={isBookmarked ? "text-blue-600" : ""}
              >
                <Bookmark
                  className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`}
                />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleShare("copy")}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Article Header */}
        <article className="mb-8">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="secondary">
                {t(`tutorials.categories.${tutorial.categoryId}.title`)}
              </Badge>
              <Badge className="bg-green-100 text-green-800">
                {t(`tutorials.difficulty.${tutorial.difficulty}`)}
              </Badge>
              {tutorial.featured && (
                <Badge className="bg-yellow-100 text-yellow-800">
                  {t("tutorials.featured")}
                </Badge>
              )}
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t(tutorial.titleKey)}
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              {t(tutorial.descriptionKey)}
            </p>
          </div>

          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 border-t border-b py-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{t(tutorial.authorKey)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(tutorial.publishedAt).toLocaleDateString(locale)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                {tutorial.readTime} {t("tutorials.minutesRead")}
              </span>
            </div>
          </div>

          {/* Share buttons */}
          <div className="mt-6 flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {t("tutorial.share.label")}:
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare("facebook")}
              className="text-blue-600 hover:text-blue-700"
            >
              <Facebook className="h-4 w-4 mr-2" />
              Facebook
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare("twitter")}
              className="text-sky-600 hover:text-sky-700"
            >
              <Twitter className="h-4 w-4 mr-2" />
              Twitter
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare("linkedin")}
              className="text-blue-700 hover:text-blue-800"
            >
              <Linkedin className="h-4 w-4 mr-2" />
              LinkedIn
            </Button>
          </div>
        </article>

        {/* Table of Contents */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">
              {t("tutorial.tableOfContents")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <nav className="space-y-2">
              {content.sections.map((section: any, index: number) => (
                <a
                  key={index}
                  href={`#section-${index}`}
                  className="block text-sm text-gray-600 hover:text-blue-600 py-1"
                >
                  {index + 1}. {t(section.titleKey)}
                </a>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Article Content */}
        <article className="prose prose-lg max-w-none mb-12">
          {content.sections.map((section: any, index: number) => (
            <section
              key={index}
              id={`section-${index}`}
              className="mb-8 scroll-mt-24"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t(section.titleKey)}
              </h2>

              {section.type === "text" && (
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {t(section.contentKey)}
                </p>
              )}

              {section.type === "list" && (
                <div className="space-y-3">
                  <p className="text-gray-700">{t(section.contentKey)}</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    {section.items.map((itemKey: string, itemIndex: number) => (
                      <li key={itemIndex} className="text-gray-700">
                        {t(itemKey)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {section.type === "steps" && (
                <div className="space-y-4">
                  <p className="text-gray-700">{t(section.contentKey)}</p>
                  <ol className="space-y-4">
                    {section.steps.map((stepKey: string, stepIndex: number) => (
                      <li key={stepIndex} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                          {stepIndex + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-700">{t(stepKey)}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {section.type === "formula" && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <pre className="text-gray-700 font-mono whitespace-pre-wrap">
                    {t(section.contentKey)}
                  </pre>
                </div>
              )}

              {section.type === "tips" && (
                <div className="space-y-3">
                  {t(section.contentKey)
                    .split("\n")
                    .map(
                      (tip: string, tipIndex: number) =>
                        tip.trim() && (
                          <div
                            key={tipIndex}
                            className="flex gap-3 bg-blue-50 p-4 rounded-lg"
                          >
                            <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <p className="text-gray-700">{tip}</p>
                          </div>
                        ),
                    )}
                </div>
              )}
            </section>
          ))}
        </article>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <Link href="/insurance/calculator">
            <Button className="w-full h-auto p-4 justify-start">
              <Calculator className="h-5 w-5 mr-3 flex-shrink-0" />
              <div className="text-left">
                <div className="font-medium">
                  {t("tutorial.actions.calculate")}
                </div>
                <div className="text-sm opacity-90">
                  {t("tutorial.actions.calculateDesc")}
                </div>
              </div>
            </Button>
          </Link>
          <Link href="/insurance">
            <Button
              variant="outline"
              className="w-full h-auto p-4 justify-start"
            >
              <FileText className="h-5 w-5 mr-3 flex-shrink-0" />
              <div className="text-left">
                <div className="font-medium">
                  {t("tutorial.actions.browse")}
                </div>
                <div className="text-sm text-gray-600">
                  {t("tutorial.actions.browseDesc")}
                </div>
              </div>
            </Button>
          </Link>
        </div>

        {/* Related Articles */}
        {relatedTutorials.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t("tutorial.relatedArticles")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedTutorials.map((relatedTutorial: any) => (
                <Link
                  key={relatedTutorial.id}
                  href={`/insurance/tutorials/${relatedTutorial.id}`}
                  className="group"
                >
                  <Card className="group-hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {t(relatedTutorial.titleKey)}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                            {t(relatedTutorial.descriptionKey)}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {relatedTutorial.readTime}{" "}
                              {t("tutorials.minutesRead")}
                            </div>
                            <Badge
                              className={
                                relatedTutorial.difficulty === "beginner"
                                  ? "bg-green-100 text-green-800"
                                  : relatedTutorial.difficulty ===
                                      "intermediate"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }
                            >
                              {t(
                                `tutorials.difficulty.${relatedTutorial.difficulty}`,
                              )}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Feedback Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {t("tutorial.feedback.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => toast.success(t("tutorial.feedback.thanks"))}
              >
                <ThumbsUp className="h-4 w-4" />
                {t("tutorial.feedback.helpful")}
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => toast.success(t("tutorial.feedback.thanks"))}
              >
                <MessageCircle className="h-4 w-4" />
                {t("tutorial.feedback.comment")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
