import { useTranslation } from "react-i18next";
import Signup from "../../../public/assets/referral/signup.png";
import Reward from "../../../public/assets/referral/gift.png";
import Share from "../../../public/assets/referral/share.png";
import arrow from "../../../public/assets/referral/right-arrow.gif";

export default function ReferralHowItWorks() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 bg-white rounded-xl p-6 w-full items-center flex flex-col justify-center">
      <h2 className="text-lg font-semibold text-center text-gray-800 md:text-xl">
        {t("Referral.howItWorks")}
      </h2>
      <h2 className="text-sm font-light text-center text-gray-600 md:text-base">
        {t("Referral.howItWorksSubTitle")}
      </h2>

      <div className="flex flex-col sm:flex-row items-stretch justify-between gap-0 px-4 p-5 w-full">
        {[
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
        ].map((step, index, array) => (
          <div
            key={step.title}
            className="flex-1 flex items-center justify-center min-w-0"
          >
            <div className="flex items-center justify-center w-full">
              <div className="flex flex-col items-center text-center p-4 w-full">
                <div className="relative mb-4 group">
                  <div className="absolute inset-0 bg-blue-100 rounded-full blur-md opacity-60 group-hover:opacity-80 transition-opacity"></div>
                  <div className="relative bg-blue-100 text-blue-500 rounded-full h-20 w-20 flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
                    <img
                      src={step.img.src}
                      alt={step.title}
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-tripswift-blue text-white text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap">
                    {t("Referral.stepLabel", { number: index + 1 })}
                  </div>
                </div>
                <h3 className="font-medium text-gray-800 text-base">
                  {step.title}
                </h3>
                <p className="text-gray-500 text-sm mt-1 leading-tight">
                  {step.description}
                </p>
              </div>
              {index < array.length - 1 && (
                <div className="hidden sm:flex items-center justify-center w-12 h-12 shrink-0">
                  <img
                    src={arrow.src}
                    alt="arrow"
                    className="w-full h-full object-contain text-tripswift-blue"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
