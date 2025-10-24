import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DistrictCard from "../components/DistrictCard";
import Filters from "../components/Filters";
import api from "../services/api";
import useGeoLocation from "../hooks/useGeoLocation";

const districtMapping = {
  "AMRITSAR": "amritsar",
  "BARNALA": "barnala",
  "BHATINDA": "bathinda",
  "FARIDKOT": "faridkot",
  "FATEHGARH SAHIB": "fatehgarh_sahib",
  "FAZILKA": "fazilka",
  "FEROZEPUR": "ferozepur",
  "GURDASPUR": "gurdaspur",
  "HOSHIARPUR": "hoshiarpur",
  "JALANDHAR": "jalandhar",
  "KAPURTHALA": "kapurthala",
  "LUDHIANA": "ludhiana",
  "MANSA": "mansa",
  "MOGA": "moga",
  "SAS NAGAR MOHALI": "mohali",
  "MOHALI": "mohali",
  "MUKATSAR": "muktsar",
  "PATHANKOT": "pathankot",
  "PATIALA": "patiala",
  "ROPAR": "rupnagar",
  "RUPNAGAR": "rupnagar",
  "SANGRUR": "sangrur",
  "NAWANSHAHR": "shahid_bhagat_singh_nagar",
  "SHAHID BHAGAT SINGH NAGAR": "shahid_bhagat_singh_nagar",
  "TARN TARAN": "tarn_taran",
  "MALERKOTLA": "malerkotla"
};

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [districts, setDistricts] = useState([]);
  const [showPrompt, setShowPrompt] = useState(false);
  
  const normalizeDistrictName = (name) => {
    const upperName = name.trim().toUpperCase();
    return districtMapping[upperName] || name.toLowerCase().replace(/ /g, '_');
  };

  // Fetch latest Punjab data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.getLatestPunjab();
        const dataInPunjabi = res.data.map(d => ({
          ...d,
          district_name: t(`districts.${normalizeDistrictName(d.district_name)}`)
        }));
        setDistricts(dataInPunjabi);
      } catch (err) {
        console.error("Failed to fetch districts:", err);
      }
    };
    fetchData();
  }, [t]);

  // Auto-detect district
  const { district: autoDistrict, error: geoError } = useGeoLocation(districts);

  useEffect(() => {
    if (autoDistrict) setShowPrompt(true);
  }, [autoDistrict]);

  const handleYes = () => {
    if (autoDistrict) navigate(`/dashboard/${autoDistrict.district_code}`);
  };
  
  const handleNo = () => setShowPrompt(false);

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{t("select_district")}</h1>
        <p className="text-gray-600">
          {t("latest_data_info", { year: "2025-2026" })}
        </p>
      </div>

      {geoError && <p className="text-red-500 mb-4">{geoError}</p>}

      {showPrompt && autoDistrict && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
          <p className="mb-2">
            {t("home.find_district")}: <strong>{autoDistrict.district_name}</strong>. {t("dashboard")}?
          </p>
          <div className="flex gap-2 mt-2">
            <button
              className="bg-green-500 text-white px-4 py-2 rounded"
              onClick={handleYes}
            >
              {t("yes")}
            </button>
            <button
              className="bg-gray-300 px-4 py-2 rounded"
              onClick={handleNo}
            >
              {t("no")}
            </button>
          </div>
        </div>
      )}

      {/* Compare Districts Button */}
      <div className="flex justify-center mt-6 mb-6">
        <button
          onClick={() => navigate("/comparison")}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:scale-105 transition-all duration-200"
        >
          🔍 {t("comparison.compare_btn")}
        </button>
      </div>

      {/* District Grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        {districts.length > 0 ? (
          districts.map(d => (
            <DistrictCard
              key={d.district_code}
              district={d}
              onClick={() => navigate(`/dashboard/${d.district_code}`)}
            />
          ))
        ) : (
          <p className="text-center col-span-full text-gray-500">{t("loading")}</p>
        )}
      </div>
    </div>
  );
};

export default Home;