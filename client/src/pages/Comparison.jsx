import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DistrictCard from "../components/DistrictCard";
import Filters from "../components/Filters";
import api from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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

const Comparison = () => {
  const { t } = useTranslation();

  const [records, setRecords] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCharts, setShowCharts] = useState(false);

  const financialYears = [
    "2018-2019","2019-2020","2020-2021","2021-2022",
    "2022-2023","2023-2024","2024-2025","2025-2026"
  ];

  // Normalize & translate district names
  const translateDistrict = (name) => {
    if (!name) return "";
    const upperName = name.trim().toUpperCase();
    const key = districtMapping[upperName] || name.toLowerCase().replace(/ /g, '_');
    const translated = t(`districts.${key}`);
    return translated !== `districts.${key}` ? translated : name;
  };

  // Fetch all Punjab data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.getAllPunjab();
        const translatedRecords = res.data.map(d => ({
          ...d,
          district_name: translateDistrict(d.district_name)
        }));
        setRecords(translatedRecords);
        setSelectedYear(financialYears[financialYears.length - 1]);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    fetchData();
  }, [t]);

  // Filter districts for display
  const filteredDistricts = records
    .filter(r => r.district_name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(r => !selectedYear || r.fin_year === selectedYear)
    .reduce((acc, r) => {
      if (!acc.some(d => d.district_code === r.district_code)) acc.push(r);
      return acc;
    }, []);

  // Toggle selection
  const toggleDistrict = (districtCode) => {
    setSelectedDistricts(prev =>
      prev.includes(districtCode)
        ? prev.filter(d => d !== districtCode)
        : [...prev, districtCode]
    );
  };

  // Aggregate selected district records
  const selectedRecords = selectedDistricts.map(code => {
    const districtRecords = records.filter(r =>
      r.district_code === code &&
      (!selectedYear || r.fin_year === selectedYear) &&
      (!selectedMonth || r.month === selectedMonth)
    );

    if (!districtRecords.length) {
      return {
        district_code: code,
        district_name: records.find(r => r.district_code === code)?.district_name || code,
        Average_Wage_rate_per_day_per_person: 0,
        Total_Exp: 0,
        Total_Households_Worked: 0,
        Total_Individuals_Worked: 0,
        Total_Jobcards_Issued: 0
      };
    }

    const aggregated = districtRecords.reduce((acc, r) => {
      acc.Total_Exp += Number(r.Total_Exp || 0);
      acc.Total_Households_Worked += Number(r.Total_Households_Worked || 0);
      acc.Total_Individuals_Worked += Number(r.Total_Individuals_Worked || 0);
      acc.Total_Jobcards_Issued += Number(r.Total_Jobcards_Issued || 0);
      acc.Average_Wage_rate_per_day_per_person += Number(r.Average_Wage_rate_per_day_per_person || 0);
      return acc;
    }, {
      district_code: code,
      district_name: translateDistrict(districtRecords[0].district_name),
      Total_Exp: 0,
      Total_Households_Worked: 0,
      Total_Individuals_Worked: 0,
      Total_Jobcards_Issued: 0,
      Average_Wage_rate_per_day_per_person: 0
    });

    aggregated.Average_Wage_rate_per_day_per_person /= districtRecords.length;
    return aggregated;
  });

  const handleDone = () => {
    if (selectedDistricts.length === 0) {
      alert(t("comparison.alert_select_district"));
      return;
    }
    setShowCharts(true);
  };

  const handleReset = () => {
    setSelectedDistricts([]);
    setShowCharts(false);
  };

  const metrics = [
    { key: "Average_Wage_rate_per_day_per_person", label: t("comparison.metrics.avg_wage") },
    { key: "Total_Exp", label: t("comparison.metrics.total_exp") },
    { key: "Total_Households_Worked", label: t("comparison.metrics.households") },
    { key: "Total_Individuals_Worked", label: t("comparison.metrics.individuals") },
    { key: "Total_Jobcards_Issued", label: t("comparison.metrics.jobcards") },
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{t("comparison.title")}</h1>

      <Filters
        records={records}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
      />

      {!showCharts && (
        <>
          <div className="flex items-center justify-between mb-3">
            <input
              type="text"
              placeholder={t("comparison.search_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-2/3"
            />
            <p className="text-sm text-gray-500">
              {selectedDistricts.length} {t("comparison.selected_count")}
            </p>
          </div>

          <p className="text-gray-600 mb-2">
            {t("comparison.instructions")}
          </p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            {filteredDistricts.map(d => (
              <div
                key={d.district_code}
                onDoubleClick={() => toggleDistrict(d.district_code)}
                className={`cursor-pointer border-2 rounded-lg transition-all ${
                  selectedDistricts.includes(d.district_code)
                    ? "border-blue-500 bg-blue-500"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <DistrictCard district={d} />
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleDone}
              className="bg-green-500 text-white px-5 py-2 rounded hover:bg-green-600"
            >
              {t("comparison.done")}
            </button>
            <button
              onClick={handleReset}
              className="bg-gray-300 px-5 py-2 rounded hover:bg-gray-400"
            >
              {t("comparison.reset")}
            </button>
          </div>
        </>
      )}

      {showCharts && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{t("comparison.results")}</h2>
            <button
              onClick={handleReset}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              {t("comparison.back")}
            </button>
          </div>

          {metrics.map(({ key, label }) => {
            const data = selectedRecords.map(r => ({
              district: r.district_name,
              value: Number(r[key]) || 0,
            }));

            return (
              <div key={key} className="mb-8">
                <h3 className="text-lg font-bold mb-2">{label}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="district" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="green" name={label} />
                  </BarChart>
                </ResponsiveContainer>

                <div className="mt-2 text-sm text-gray-700 space-y-1">
                  {selectedRecords.map(r => (
                    <div key={r.district_code}>
                      <strong>{r.district_name}:</strong>{" "}
                      {key === "Average_Wage_rate_per_day_per_person" &&
                        t("comparison.conclusion.avg_wage", { value: r[key]?.toLocaleString() || 0 })}
                      {key === "Total_Exp" &&
                        t("comparison.conclusion.total_exp", { value: r[key]?.toLocaleString() || 0 })}
                      {key === "Total_Households_Worked" &&
                        t("comparison.conclusion.households", { value: r[key]?.toLocaleString() || 0 })}
                      {key === "Total_Individuals_Worked" &&
                        t("comparison.conclusion.individuals", { value: r[key]?.toLocaleString() || 0 })}
                      {key === "Total_Jobcards_Issued" &&
                        t("comparison.conclusion.jobcards", { value: r[key]?.toLocaleString() || 0 })}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Comparison;
