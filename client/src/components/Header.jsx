import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const Header = ({ title }) => {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "pa" : "en";
    i18n.changeLanguage(newLang);
    localStorage.setItem("lang", newLang);
  };

  // Load saved language on refresh
  useEffect(() => {
    const savedLang = localStorage.getItem("lang");
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  const handleTitleClick = () => {
    navigate("/");
  };

  return (
    <header className="flex justify-between items-center p-4 bg-green-600 text-white shadow-md">
      <h1
        onClick={handleTitleClick}
        className={`text-xl font-bold cursor-pointer hover:underline ${
          i18n.language === "pa" ? "font-punjabi" : ""
        }`}
      >
        {i18n.language === "pa" ? t("app_name_pa") : t("app_name_en")}
      </h1>

      <button
        onClick={toggleLanguage}
        className="bg-white text-green-600 px-3 py-1 rounded shadow hover:bg-gray-100 transition"
      >
        {i18n.language === "en" ? "ਪੰਜਾਬੀ" : "EN"}
      </button>
    </header>
  );
};

export default Header;
