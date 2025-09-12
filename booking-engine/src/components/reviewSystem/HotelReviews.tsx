// src/components/reviewSystem/HotelReviewsSliding.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Star, ChevronDown, Filter } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Review {
  _id: string;
  reservationId: string;
  hotelName: string;
  hotelCode: string;
  userId: string;
  guestEmail: string;
  comment: string;
  rating: number;
  categorizedRating?: string;
  createdAt: string;
  __v: number;
}

interface ReviewData {
  averageRating: number;
  totalReviews: number;
  customerReview: Review[];
}

interface ApiResponse {
  success: boolean;
  data: ReviewData;
}

interface HotelReviewsProps {
  hotelCode: string;
}

const useReviewFilters = (hotelCode: string) => {
  const [rawData, setRawData] = useState<ReviewData | null>(null);
  const [filters, setFilters] = useState({
    rating: "",
    category: "",
    dateRange: null as { startDate: string; endDate: string } | null,
  });
  const [sortBy, setSortBy] = useState<
    "relevant" | "newest" | "oldest" | "highest" | "lowest"
  >("relevant");
  const [loading, setLoading] = useState(true);

  // Fetch all reviews for stats and filtering
  useEffect(() => {
    if (!hotelCode) return;
    setLoading(true);

    const fetchReviews = async () => {
      try {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/review/get?hotelCode=${hotelCode}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch reviews");

        const data: ApiResponse = await res.json();
        if (data.success) setRawData(data.data);
      } catch (error) {
        console.error("[HotelReviews] Fetch failed:", error);
        setRawData({ averageRating: 0, totalReviews: 0, customerReview: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [hotelCode]);

  const filteredReviews = useMemo(() => {
    if (!rawData) return [];

    return rawData.customerReview.filter((review) => {
      // Rating filter (1–5)
      if (filters.rating && review.rating !== Number(filters.rating)) return false;

      // Category filter (Superb, Good, Poor)
      if (filters.category && categorizeRating(review.rating) !== filters.category) return false;

      // Date range filter
      if (filters.dateRange) {
        const createdAt = new Date(review.createdAt).getTime();
        const start = new Date(filters.dateRange.startDate).getTime();
        const end = new Date(filters.dateRange.endDate).getTime();
        if (createdAt < start || createdAt > end) return false;
      }

      return true;
    });
  }, [rawData, filters]);

  const sortedReviews = useMemo(() => {
    const reviews = [...filteredReviews];

    return reviews.sort((a, b) => {
      switch (sortBy) {
        case "relevant":
          if (a.rating !== b.rating) return b.rating - a.rating;
          return b.createdAt.localeCompare(a.createdAt);
        case "newest":
          return b.createdAt.localeCompare(a.createdAt);
        case "oldest":
          return a.createdAt.localeCompare(b.createdAt);
        case "highest":
          return b.rating - a.rating;
        case "lowest":
          return a.rating - b.rating;
        default:
          return 0;
      }
    });
  }, [filteredReviews, sortBy]);

  const stats = useMemo(() => {
    if (!rawData) return { total: 0, superb: 0, good: 0, poor: 0 };
    const counts = { superb: 0, good: 0, poor: 0 };

    rawData.customerReview.forEach((r) => {
      const cat = categorizeRating(r.rating).toLowerCase();
      if (cat in counts) counts[cat as keyof typeof counts]++;
    });

    return { total: rawData.totalReviews, ...counts };
  }, [rawData]);

  const timePeriodStats = useMemo(() => {
    if (!rawData) return { total: 0, marMay: 0, junAug: 0, sepNov: 0, decFeb: 0 };
    const counts = { marMay: 0, junAug: 0, sepNov: 0, decFeb: 0 };

    rawData.customerReview.forEach((r) => {
      const period = getTimePeriod(r.createdAt);
      if (period in counts) counts[period as keyof typeof counts]++;
    });

    return { total: rawData.totalReviews, ...counts };
  }, [rawData]);

  return {
    reviews: sortedReviews,
    stats,
    timePeriodStats,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    loading,
  };
};

// Utility Functions
const categorizeRating = (rating: number): "Poor" | "Good" | "Superb" => {
  if (rating <= 2) return "Poor";
  if (rating <= 3) return "Good"; // Changed from < 4 to <= 3
  return "Superb";
};

const getTimePeriod = (dateString: string): "marMay" | "junAug" | "sepNov" | "decFeb" => {
  const month = new Date(dateString).getMonth(); // 0 = Jan
  if (month >= 2 && month <= 4) return "marMay";    // Mar–May
  if (month >= 5 && month <= 7) return "junAug";    // Jun–Aug
  if (month >= 8 && month <= 10) return "sepNov";   // Sep–Nov
  return "decFeb"; // Dec, Jan, Feb
};

const getDateRangeForPeriod = (period: string): { startDate: string; endDate: string } | null => {
  const year = new Date().getFullYear();
  switch (period) {
    case "mar-may":
      return { startDate: `${year}-03-01`, endDate: `${year}-05-31` };
    case "jun-aug":
      return { startDate: `${year}-06-01`, endDate: `${year}-08-31` };
    case "sep-nov":
      return { startDate: `${year}-09-01`, endDate: `${year}-11-30` };
    case "dec-feb":
      return { startDate: `${year}-12-01`, endDate: `${year + 1}-02-28` };
    default:
      return null;
  }
};

const FilterSelect = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; count?: number }[];
}) => {
  const { t } = useTranslation();
  return (
    <div className="w-full">
      <h5 className="text-sm font-medium text-gray-700 mb-2 truncate">{t(`Reviews.${label}`) || label}</h5>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-10"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.count !== undefined ? `${opt.label} (${opt.count})` : opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
};

const ReviewCard = ({ review }: { review: Review }) => {
  const { t, i18n } = useTranslation();

  return (
    <div key={review._id} className="border-b border-gray-100 pb-4 last:border-b-0">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-tripswift-blue text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
          {review.guestEmail.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2 gap-4">
            <div className="flex-1 min-w-0">
              <h6 className="font-medium text-gray-900 truncate">
                {review.guestEmail.split("@")[0]}
              </h6>
              <p className="text-sm text-gray-500">
                {t("Reviews.reviewedOn", {
                  date: new Date(review.createdAt).toLocaleDateString(i18n.language, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                })}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="flex items-center justify-end gap-1 mb-1">
                <div className="w-6 h-6 bg-tripswift-blue text-white rounded text-xs font-semibold flex items-center justify-center">
                  {review.rating}
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {review.categorizedRating || categorizeRating(review.rating)}
              </div>
            </div>
          </div>

          <p className="text-gray-700 text-sm leading-relaxed break-words">{review.comment}</p>
        </div>
      </div>
    </div>
  );
};

const LoadingState = () => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-blue-200 rounded-lg animate-pulse flex-shrink-0"></div>
          <div className="flex-1 min-w-0">
            <div className="w-16 h-6 bg-blue-200 rounded animate-pulse mb-1"></div>
            <div className="w-24 h-4 bg-blue-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="w-32 h-5 bg-gray-200 rounded animate-pulse"></div>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-b border-gray-100 pb-4">
            <div className="flex justify-between items-start mb-3 gap-4">
              <div className="flex-1 min-w-0">
                <div className="w-24 h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="w-8 h-6 bg-yellow-200 rounded animate-pulse flex-shrink-0"></div>
            </div>
            <div className="space-y-2">
              <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const EmptyState = () => {
  const { t } = useTranslation();
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Star className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("Reviews.noReviews")}</h3>
      <p className="text-gray-600">{t("Reviews.beFirstToReview")}</p>
    </div>
  );
};

const HotelReviewsSliding: React.FC<HotelReviewsProps> = ({ hotelCode }) => {
  const { t } = useTranslation();
  const {
    reviews,
    stats,
    timePeriodStats,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    loading,
  } = useReviewFilters(hotelCode);

  if (loading) return <LoadingState />;
  if (reviews.length === 0) return <EmptyState />;

  // Create options for review scores filter
  const reviewScoreOptions = [
    { value: "", label: t("Reviews.all") || "All", count: stats.total },
  ];

  // Add category options if they exist
  if (stats.superb > 0) {
    reviewScoreOptions.push({
      value: "Superb",
      label: t("Reviews.superb") || "Superb",
      count: stats.superb
    });
  }
  if (stats.good > 0) {
    reviewScoreOptions.push({
      value: "Good",
      label: t("Reviews.good") || "Good",
      count: stats.good
    });
  }
  if (stats.poor > 0) {
    reviewScoreOptions.push({
      value: "Poor",
      label: t("Reviews.poor") || "Poor",
      count: stats.poor
    });
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-600 flex-shrink-0" />
          <h4 className="font-semibold text-gray-900 truncate">
            {t("Reviews.filtersAndSort") || "Filters & Sort"}
          </h4>
        </div>

        <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-4">
          <FilterSelect
            label="reviewScores"
            value={filters.category || filters.rating}
            onChange={(value) => {
              if (["Poor", "Good", "Superb"].includes(value)) {
                setFilters((f) => ({ ...f, category: value, rating: "", dateRange: null }));
              } else {
                setFilters((f) => ({ ...f, rating: value, category: "", dateRange: null }));
              }
            }}
            options={reviewScoreOptions}
          />

          <FilterSelect
            label="timeOfYear"
            value={
              Object.keys({
                "mar-may": timePeriodStats.marMay,
                "jun-aug": timePeriodStats.junAug,
                "sep-nov": timePeriodStats.sepNov,
                "dec-feb": timePeriodStats.decFeb,
              }).find((key) => {
                const range = getDateRangeForPeriod(key);
                return (
                  range &&
                  range.startDate === filters.dateRange?.startDate &&
                  range.endDate === filters.dateRange?.endDate
                );
              }) || ""
            }
            onChange={(value) => {
              setFilters((f) => ({
                ...f,
                dateRange: getDateRangeForPeriod(value),
                rating: "",
                category: "",
              }));
            }}
            options={[
              { value: "", label: t("Reviews.all") || "All", count: timePeriodStats.total },
              ...(timePeriodStats.marMay > 0 ? [{ value: "mar-may", label: t("Reviews.marMay") || "Mar-May", count: timePeriodStats.marMay }] : []),
              ...(timePeriodStats.junAug > 0 ? [{ value: "jun-aug", label: t("Reviews.junAug") || "Jun-Aug", count: timePeriodStats.junAug }] : []),
              ...(timePeriodStats.sepNov > 0 ? [{ value: "sep-nov", label: t("Reviews.sepNov") || "Sep-Nov", count: timePeriodStats.sepNov }] : []),
              ...(timePeriodStats.decFeb > 0 ? [{ value: "dec-feb", label: t("Reviews.decFeb") || "Dec-Feb", count: timePeriodStats.decFeb }] : []),
            ]}
          />

          <FilterSelect
            label="sortReviewsBy"
            value={sortBy}
            onChange={(value) =>
              setSortBy(value as "relevant" | "newest" | "oldest" | "highest" | "lowest")
            }
            options={[
              { value: "relevant", label: t("Reviews.mostRelevant") || "Most relevant" },
              { value: "newest", label: t("Reviews.newestFirst") || "Newest first" },
              { value: "oldest", label: t("Reviews.oldestFirst") || "Oldest first" },
              { value: "highest", label: t("Reviews.highestRated") || "Highest rated" },
              { value: "lowest", label: t("Reviews.lowestRated") || "Lowest rated" },
            ]}
          />
        </div>
      </div>

      {/* Active filters indicator */}
      {(filters.category || filters.rating || filters.dateRange) && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-gray-600 flex-shrink-0">Active filters:</span>
          {filters.category && (
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-1">
              <span className="truncate">{filters.category}</span>
              <button
                onClick={() => setFilters(f => ({ ...f, category: "" }))}
                className="ml-1 hover:text-blue-900 flex-shrink-0"
              >
                ×
              </button>
            </span>
          )}
          {filters.dateRange && (
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-1">
              <span className="truncate">Time filter</span>
              <button
                onClick={() => setFilters(f => ({ ...f, dateRange: null }))}
                className="ml-1 hover:text-blue-900 flex-shrink-0"
              >
                ×
              </button>
            </span>
          )}
          <button
            onClick={() => setFilters({ rating: "", category: "", dateRange: null })}
            className="text-tripswift-blue hover:text-tripswift-blue underline flex-shrink-0"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">
          {t("Reviews.guestReviews", { count: reviews.length }) || `Guest reviews (${reviews.length})`}
        </h4>
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review._id} review={review} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HotelReviewsSliding;