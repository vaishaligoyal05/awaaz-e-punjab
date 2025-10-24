import React from "react";
import { useTranslation } from "react-i18next";

const DistrictCard = ({ district, onClick }) => {
  const { t, i18n } = useTranslation();

  // Helper function to get district name based on language
  const getDistrictName = () => {
    const isEnglish = i18n.language === 'en';
    if (!isEnglish) {
      return district.district_name; // Keep Punjabi name as is
    }

    // For English, find the English equivalent from districts mapping
    const districtKey = Object.entries(t('districts', { returnObjects: true }))
      .find(([_key, value]) => value === district.district_name)?.[0];

    return districtKey ? t(`districts.${districtKey}`) : district.district_name;
  };

  return (
    <div
      onClick={onClick}
      className="cursor-pointer p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition transform hover:-translate-y-1"
    >
      <h3 className="font-semibold text-lg mb-2">{getDistrictName()}</h3>
      <p className="text-sm">
        {t("total_households")}: <span className="font-bold">{district.Total_Households_Worked?.toLocaleString() || 0}</span>
      </p>
      <p className="text-sm">
        {t("total_individuals")}: <span className="font-bold">{district.Total_Individuals_Worked?.toLocaleString() || 0}</span>
      </p>
    </div>
  );
};

export default DistrictCard;