import React, { useState } from "react";
import {
  Search,
  ChevronDown,
  Mail,
  CreditCard,
  Calendar,
  Shield,
  User,
  HelpCircle,
  Clock,
  Headphones,
  Percent
} from "lucide-react";
import { Trans, useTranslation } from "react-i18next";

interface FAQItem {
  id: string;
  questionKey: string;
  answerKey: string;
  category: string;
}

interface HelpCategory {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
  bgColor: string;
}

const HelpCenterTab: React.FC = () => {
  const { t } = useTranslation();
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories: HelpCategory[] = [
    {
      id: "booking",
      title: t("Help.categories.booking.title", "Booking"),
      description: t("Help.categories.booking.description", "Reservations, changes, cancellations"),
      icon: Calendar,
      color: "text-tripswift-blue",
      bgColor: "bg-blue-50"
    },
    {
      id: "payment",
      title: t("Help.categories.payment.title", "Payment"),
      description: t("Help.categories.payment.description", "Payments, refunds, receipts"),
      icon: CreditCard,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      id: "security",
      title: t("Help.categories.security.title", "Security"),
      description: t("Help.categories.security.description", "Account and payment safety"),
      icon: Shield,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      id: "account",
      title: t("Help.categories.account.title", "Account"),
      description: t("Help.categories.account.description", "Login, profile, settings"),
      icon: User,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      id: "promotions",
      title: t("Help.categories.promotions.title", "Promotions"),
      description: t("Help.categories.promotions.description", "Discounts, coupons, offers"),
      icon: Percent,
      color: "text-pink-600",
      bgColor: "bg-pink-50"
    }
  ];

  const faqs: FAQItem[] = [
    {
      id: "1",
      questionKey: "Help.faq.howToPayQuestion",
      answerKey: "Help.faq.howToPayAnswer",
      category: "payment"
    },
    {
      id: "2",
      questionKey: "Help.faq.cancelReservationQuestion",
      answerKey: "Help.faq.cancelReservationAnswer",
      category: "booking"
    },
    {
      id: "3",
      questionKey: "Help.faq.paymentSecurityQuestion",
      answerKey: "Help.faq.paymentSecurityAnswer",
      category: "security"
    },
    {
      id: "4",
      questionKey: "Help.faq.internationalCardsQuestion",
      answerKey: "Help.faq.internationalCardsAnswer",
      category: "payment"
    },
    {
      id: "5",
      questionKey: "Help.faq.receiptQuestion",
      answerKey: "Help.faq.receiptAnswer",
      category: "booking"
    },
    {
      id: "6",
      questionKey: "Help.faq.accountRequiredQuestion",
      answerKey: "Help.faq.accountRequiredAnswer",
      category: "account"
    },
    {
      id: "7",
      questionKey: "Help.faq.contactSupportQuestion",
      answerKey: "Help.faq.contactSupportAnswer",
      category: "account"
    },
    {
      id: "8",
      questionKey: "Help.faq.additionalChargesQuestion",
      answerKey: "Help.faq.additionalChargesAnswer",
      category: "payment"
    },
    {
      id: "9",
      questionKey: "Help.faq.discountCouponQuestion",
      answerKey: "Help.faq.discountCouponAnswer",
      category: "promotions"
    }
  ];

  const popularFaqs = faqs.slice(0, 6);

  const toggleFaq = (id: string) => {
    setOpenFaqId(prev => (prev === id ? null : id));
  };

  const filteredFaqs = faqs.filter(faq => {
    const question = t(faq.questionKey, { defaultValue: "" }).toLowerCase();
    const answer = t(faq.answerKey, { defaultValue: "" }).toLowerCase();
    const matchesSearch =
      searchQuery === "" ||
      question.includes(searchQuery.toLowerCase()) ||
      answer.includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === null || faq.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.icon || HelpCircle;
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.color || "text-gray-600";
  };

  // ✉️ Handle Email Click - Open in Gmail
  const handleEmailClick = () => {
    const subject = encodeURIComponent(t("Help.emailSubject", "Support Request"));
    const body = encodeURIComponent(
      t(
        "Help.emailBody",
        "Hi, I need help with...\n\nMy account email:\nBooking reference (if applicable):"
      )
    );
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=business.alhajz@gmail.com&su=${subject}&body=${body}`;
    window.open(gmailUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-8 px-4 sm:px-6">
      {/* Hero Section */}
      <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 py-4 sm:py-6 rounded-2xl">
        <div className="max-w-2xl mx-auto">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
            <HelpCircle className="h-6 w-6 text-tripswift-blue" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
            {t("Help.helpCenter", "Help Center")}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            {t("Help.helpCenterDesc", "Find answers to common questions or contact support.")}
          </p>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t("Help.searchPlaceholder", "Search for help...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tripswift-blue focus:border-transparent bg-white shadow-sm text-sm"
              aria-label={t("Help.searchAriaLabel", "Search help articles")}
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {t("Help.allCategories", "All Categories")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map(category => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(isSelected ? null : category.id)}
                className={`p-3 rounded-xl border-2 transition-all duration-200 text-left flex items-center space-x-3 ${isSelected
                    ? "border-tripswift-blue bg-blue-50 shadow-sm"
                    : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50"
                  }`}
              >
                <div
                  className={`ml-2 w-8 h-8 rounded-md ${category.bgColor} ${category.color} flex items-center justify-center flex-shrink-0`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <h3 className="font-medium text-sm text-gray-900 truncate">
                    {category.title}
                  </h3>
                  <p className="text-xs text-gray-500 truncate leading-tight">
                    {category.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* FAQs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {searchQuery || selectedCategory
              ? t("Help.searchResults", "Search Results")
              : t("Help.popularTopics", "Popular Topics")}
          </h2>
          {(searchQuery || selectedCategory) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory(null);
              }}
              className="text-sm text-tripswift-blue hover:text-tripswift-blue font-medium transition-colors"
            >
              {t("Help.clearFilters", "Clear filters")}
            </button>
          )}
        </div>

        <div className="space-y-2">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2 font-medium">
                {t("Help.noResults", "No results found")}
              </p>
              <p className="text-sm text-gray-400">
                Try adjusting your search terms or browse categories
              </p>
            </div>
          ) : (
            (searchQuery || selectedCategory ? filteredFaqs : popularFaqs).map(faq => {
              const isOpen = openFaqId === faq.id;
              const CategoryIcon = getCategoryIcon(faq.category);
              const categoryColor = getCategoryColor(faq.category);

              return (
                <div
                  key={faq.id}
                  className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-sm transition-all duration-200"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between group"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center space-x-3 flex-1 pr-4">
                      <div
                        className={`ml-2 w-8 h-8 rounded-lg bg-gray-50 ${categoryColor} flex items-center justify-center flex-shrink-0 group-hover:bg-gray-100 transition-colors`}
                      >
                        <CategoryIcon className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-gray-900 text-left">
                        {t(faq.questionKey, { defaultValue: faq.questionKey })}
                      </span>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-gray-400 transition-transform flex-shrink-0 group-hover:text-gray-600 ${isOpen ? "transform rotate-180" : ""
                        }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-4 bg-gray-50/50 border-t border-gray-100">
                      <div className="pt-4">
                        <div className="prose prose-sm max-w-none text-gray-700">
                          {t(faq.answerKey, { defaultValue: faq.answerKey })
                            .split("\n\n")
                            .map((paragraph, index) => (
                              <p key={index} className="mb-3 last:mb-0 leading-relaxed">
                                {paragraph}
                              </p>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Support Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
        <div className="text-center mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Headphones className="h-5 w-5 text-tripswift-blue" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            {t("Help.stillNeedHelp", "Still need help?")}
          </h2>
          <p className="text-sm text-gray-600">
            {t("Help.contactDesc", "Our support team is here to help you 24/7.")}
          </p>
        </div>

        {/* Email Support Card - Small, Centered, Clickable */}
        <div className="flex justify-center">
          <button
            onClick={handleEmailClick}
            className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 mx-auto max-w-md w-full text-left hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-300 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="ml-2 w-8 h-8 rounded-md bg-white flex items-center justify-center flex-shrink-0">
                  <Mail className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 text-sm mb-1">
                    {t("Help.email", "Email Support")}
                  </h3>
                  <p className="text-xs text-gray-600 mb-1 leading-tight">
                    {t("Help.emailResponseTime", "We'll respond within 4 hours")}
                  </p>
                  <div className="flex items-center text-xs text-gray-500 font-medium">
                    <Clock className="h-3 w-3 text-gray-400 mr-1" />
                    <span>{t("Help.responseTime", "< 4 hours")}</span>
                  </div>
                </div>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full self-start mt-2"></div>
            </div>
          </button>
        </div>
        {/* Footer */}
        <div className="text-center text-xs text-gray-500 leading-tight">
          {t(
            "Help.contactFooterNoPhone",
            "For immediate help, please use email support."
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpCenterTab;