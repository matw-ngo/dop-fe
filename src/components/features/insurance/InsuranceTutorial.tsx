"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  BookOpen,
  FileText,
  Calculator,
  Shield,
  Car,
  Heart,
  Home,
  Plane,
  GraduationCap,
  ChevronRight,
  Clock,
  User
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Tutorial categories with icons
const tutorialCategories = [
  {
    id: "basics",
    titleKey: "tutorials.categories.basics.title",
    descriptionKey: "tutorials.categories.basics.description",
    icon: BookOpen,
    color: "bg-blue-500",
    count: 8
  },
  {
    id: "vehicle",
    titleKey: "tutorials.categories.vehicle.title",
    descriptionKey: "tutorials.categories.vehicle.description",
    icon: Car,
    color: "bg-green-500",
    count: 12
  },
  {
    id: "health",
    titleKey: "tutorials.categories.health.title",
    descriptionKey: "tutorials.categories.health.description",
    icon: Heart,
    color: "bg-red-500",
    count: 6
  },
  {
    id: "property",
    titleKey: "tutorials.categories.property.title",
    descriptionKey: "tutorials.categories.property.description",
    icon: Home,
    color: "bg-purple-500",
    count: 5
  },
  {
    id: "travel",
    titleKey: "tutorials.categories.travel.title",
    descriptionKey: "tutorials.categories.travel.description",
    icon: Plane,
    color: "bg-indigo-500",
    count: 4
  },
  {
    id: "life",
    titleKey: "tutorials.categories.life.title",
    descriptionKey: "tutorials.categories.life.description",
    icon: GraduationCap,
    color: "bg-yellow-500",
    count: 7
  }
];

// Mock tutorial data
const tutorials = [
  {
    id: "insurance-basics",
    categoryId: "basics",
    titleKey: "tutorials.articles.basics.title",
    descriptionKey: "tutorials.articles.basics.description",
    readTime: 5,
    difficulty: "beginner",
    authorKey: "tutorials.articles.basics.author",
    publishedAt: "2024-01-15",
    image: "/images/tutorials/insurance-basics.jpg",
    featured: true
  },
  {
    id: "compulsory-insurance-vietnam",
    categoryId: "vehicle",
    titleKey: "tutorials.articles.compulsory.title",
    descriptionKey: "tutorials.articles.compulsory.description",
    readTime: 8,
    difficulty: "intermediate",
    authorKey: "tutorials.articles.compulsory.author",
    publishedAt: "2024-01-20",
    image: "/images/tutorials/compulsory-insurance.jpg",
    featured: true
  },
  {
    id: "calculate-vehicle-insurance",
    categoryId: "vehicle",
    titleKey: "tutorials.articles.calculation.title",
    descriptionKey: "tutorials.articles.calculation.description",
    readTime: 10,
    difficulty: "intermediate",
    authorKey: "tutorials.articles.calculation.author",
    publishedAt: "2024-01-25",
    image: "/images/tutorials/calculation-guide.jpg",
    featured: false
  },
  {
    id: "claims-process-guide",
    categoryId: "basics",
    titleKey: "tutorials.articles.claims.title",
    descriptionKey: "tutorials.articles.claims.description",
    readTime: 7,
    difficulty: "beginner",
    authorKey: "tutorials.articles.claims.author",
    publishedAt: "2024-01-18",
    image: "/images/tutorials/claims-process.jpg",
    featured: false
  },
  {
    id: "health-insurance-guide",
    categoryId: "health",
    titleKey: "tutorials.articles.health.title",
    descriptionKey: "tutorials.articles.health.description",
    readTime: 12,
    difficulty: "advanced",
    authorKey: "tutorials.articles.health.author",
    publishedAt: "2024-01-22",
    image: "/images/tutorials/health-insurance.jpg",
    featured: false
  },
  {
    id: "property-insurance-basics",
    categoryId: "property",
    titleKey: "tutorials.articles.property.title",
    descriptionKey: "tutorials.articles.property.description",
    readTime: 9,
    difficulty: "intermediate",
    authorKey: "tutorials.articles.property.author",
    publishedAt: "2024-01-28",
    image: "/images/tutorials/property-insurance.jpg",
    featured: false
  }
];

const difficultyColors = {
  beginner: "bg-green-100 text-green-800",
  intermediate: "bg-yellow-100 text-yellow-800",
  advanced: "bg-red-100 text-red-800"
};

interface InsuranceTutorialProps {
  locale: string;
}

export default function InsuranceTutorial({ locale }: InsuranceTutorialProps) {
  const t = useTranslations("insurance");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  // Filter tutorials based on search and filters
  const filteredTutorials = tutorials.filter((tutorial) => {
    const title = t(tutorial.titleKey).toLowerCase();
    const description = t(tutorial.descriptionKey).toLowerCase();
    const matchesSearch = title.includes(searchQuery.toLowerCase()) ||
                         description.includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === "all" || tutorial.categoryId === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "all" || tutorial.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Get featured tutorials
  const featuredTutorials = tutorials.filter(tutorial => tutorial.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t("tutorials.title")}
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl">
            {t("tutorials.description")}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/insurance/calculator">
            <Button variant="outline" className="w-full h-auto p-4 justify-start">
              <Calculator className="h-5 w-5 mr-3 flex-shrink-0" />
              <div className="text-left">
                <div className="font-medium">{t("tutorials.quickActions.calculator")}</div>
                <div className="text-sm text-gray-500">{t("tutorials.quickActions.calculatorDesc")}</div>
              </div>
            </Button>
          </Link>
          <Link href="/insurance/fee-tables">
            <Button variant="outline" className="w-full h-auto p-4 justify-start">
              <FileText className="h-5 w-5 mr-3 flex-shrink-0" />
              <div className="text-left">
                <div className="font-medium">{t("tutorials.quickActions.feeTables")}</div>
                <div className="text-sm text-gray-500">{t("tutorials.quickActions.feeTablesDesc")}</div>
              </div>
            </Button>
          </Link>
          <Link href="/insurance/regulations">
            <Button variant="outline" className="w-full h-auto p-4 justify-start">
              <Shield className="h-5 w-5 mr-3 flex-shrink-0" />
              <div className="text-left">
                <div className="font-medium">{t("tutorials.quickActions.regulations")}</div>
                <div className="text-sm text-gray-500">{t("tutorials.quickActions.regulationsDesc")}</div>
              </div>
            </Button>
          </Link>
        </div>
      </div>

      {/* Featured Tutorials */}
      {featuredTutorials.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t("tutorials.featured")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredTutorials.slice(0, 4).map((tutorial) => (
              <Card key={tutorial.id} className="group hover:shadow-lg transition-shadow cursor-pointer">
                <Link href={`/insurance/tutorials/${tutorial.id}`}>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors line-clamp-2">
                          {t(tutorial.titleKey)}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {t(tutorial.descriptionKey)}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {tutorial.readTime} {t("tutorials.minutesRead")}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {t(tutorial.authorKey)}
                        </div>
                      </div>
                      <Badge className={difficultyColors[tutorial.difficulty as keyof typeof difficultyColors]}>
                        {t(`tutorials.difficulty.${tutorial.difficulty}`)}
                      </Badge>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {t("tutorials.categories.title")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tutorialCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.id}
                href={`/insurance/tutorials?category=${category.id}`}
                className="group"
              >
                <Card className="group-hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 ${category.color} rounded-lg text-white`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {t(category.titleKey)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {t(category.descriptionKey)}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {category.count} {t("tutorials.articles")}
                          </span>
                          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder={t("tutorials.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder={t("tutorials.filterByCategory")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("tutorials.allCategories")}</SelectItem>
              {tutorialCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {t(category.titleKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder={t("tutorials.filterByDifficulty")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("tutorials.allDifficulties")}</SelectItem>
              <SelectItem value="beginner">{t("tutorials.difficulty.beginner")}</SelectItem>
              <SelectItem value="intermediate">{t("tutorials.difficulty.intermediate")}</SelectItem>
              <SelectItem value="advanced">{t("tutorials.difficulty.advanced")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {t("tutorials.resultsCount", { count: filteredTutorials.length })}
          </p>
        </div>

        {/* Tutorial Grid */}
        {filteredTutorials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTutorials.map((tutorial) => (
              <Card key={tutorial.id} className="group hover:shadow-lg transition-shadow">
                <Link href={`/insurance/tutorials/${tutorial.id}`}>
                  <div className="aspect-video bg-gray-200 rounded-t-lg flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-gray-400" />
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={difficultyColors[tutorial.difficulty as keyof typeof difficultyColors]}>
                        {t(`tutorials.difficulty.${tutorial.difficulty}`)}
                      </Badge>
                      {tutorial.featured && (
                        <Badge variant="secondary">{t("tutorials.featured")}</Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg group-hover:text-blue-600 transition-colors line-clamp-2">
                      {t(tutorial.titleKey)}
                    </CardTitle>
                    <CardDescription className="line-clamp-3">
                      {t(tutorial.descriptionKey)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {tutorial.readTime} {t("tutorials.minutesRead")}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {t(tutorial.authorKey)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("tutorials.noResults")}
            </h3>
            <p className="text-gray-600">
              {t("tutorials.noResultsDesc")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}