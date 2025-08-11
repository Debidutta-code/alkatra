import { useTranslation } from "react-i18next";
import Signup from "../../../public/assets/referral/signup.png";
import Reward from "../../../public/assets/referral/gift.png";
import Share from "../../../public/assets/referral/share.png";
import arrow from "../../../public/assets/referral/right-arrow.gif";

export default function ReferralHowItWorks() {
  const { t } = useTranslation();

  const steps = [
    {
      img: Share,
      title: t("Referral.step1Title"),
      description: t("Referral.step1Desc"),
    },
    {
      img: Signup,
      title: t("Referral.step2Title"),
      description: t("Referral.step2Desc"),
    },
    {
      img: Reward,
      title: t("Referral.step3Title"),
      description: t("Referral.step3Desc"),
    },
  ];

  return (
    <div className="space-y-8 bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 max-w-6xl mx-auto">
      {/* Title */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold text-gray-800">
          {t("Referral.howItWorks")}
        </h2>
        <p className="text-gray-600 text-base max-w-lg mx-auto leading-relaxed">
          {t("Referral.howItWorksSubTitle")}
        </p>
      </div>

      {/* Steps */}
      <div className="relative flex flex-col lg:flex-row items-stretch justify-between gap-6 mt-8 px-4">
        {/* Connector Line (Desktop Only) */}
        {/* <div className="hidden lg:flex absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 z-0"></div> */}

        {steps.map((step, index) => (
          <div
            key={step.title}
            className="flex-1 relative z-10 flex flex-col items-center text-center group"
          >
            {/* Step Icon with Glow */}
            <div className="relative mb-5">
              <div className="absolute inset-0 bg-tripswift-blue/20 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative w-16 h-16 bg-tripswift-blue text-white rounded-full flex items-center justify-center shadow-md border-4 border-white group-hover:shadow-xl transition-all duration-300">
                <img
                  src={step.img.src}
                  alt={step.title}
                  className="w-8 h-8 object-contain filter brightness-0 invert"
                />
              </div>
              {/* Step Number Badge */}
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white text-tripswift-blue font-bold text-xs px-3 py-1.5 rounded-3xl shadow-sm border border-tripswift-blue/30 min-w-[80px]">
                {t("Referral.stepLabel", { number: index + 1 })}
              </div>
            </div>

            {/* Step Content */}
            <h3 className="font-semibold text-gray-800 text-lg mb-2">
              {step.title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              {step.description}
            </p>

            {/* Arrow (between steps) - Desktop Only */}
            {index < steps.length - 1 && (
              <div className="hidden lg:flex absolute right-0 top-1/2 transform -translate-y-1/2 w-12 h-12 -mr-6 z-20">
                <img
                  src={arrow.src}
                  alt="Next step"
                  className="w-full h-full object-contain animate-pulse"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}