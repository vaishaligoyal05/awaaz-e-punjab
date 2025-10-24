import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import pa from "./locales/pa.json";

const savedLang = localStorage.getItem("lang") || "pa"; // default Punjabi

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    pa: { translation: pa },
  },
  lng: savedLang, // default language (Punjabi)
  fallbackLng: "pa",
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

// Watch for language changes and store preference
i18n.on("languageChanged", (lng) => {
  localStorage.setItem("lang", lng);
});

export default i18n;
