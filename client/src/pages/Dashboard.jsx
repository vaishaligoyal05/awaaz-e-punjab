import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import KPIcard from "../components/KPIcard";
import ChartCard from "../components/ChartCard";
import Filters from "../components/Filters";
import AudioSummary from "../components/AudioSummary";
import api from "../services/api";
import { useTranslation } from 'react-i18next';

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

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const { districtCode } = useParams();
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  const normalizeDistrictName = (name) => {
    const upperName = name.trim().toUpperCase();
    return districtMapping[upperName] || name.toLowerCase().replace(/ /g, '_'); };

    const getTranslatedDistrictName = (englishName) => {
    if (!englishName) return '';
    const normalizedName = normalizeDistrictName(englishName);
    return t(`districts.${normalizedName}`);
  };
  
  const financialYears = [
    "2018-2019","2019-2020","2020-2021","2021-2022",
    "2022-2023","2023-2024","2024-2025","2025-2026"
  ];

  useEffect(() => {
    const fetchData = async () => {
      const res = await api.getDistrictRecords(districtCode);
       // Transform the data to include translated district names
        const transformedData = res.data.map(record => ({
          ...record,
          district_name: getTranslatedDistrictName(record.district_name)
        }));
      setRecords(transformedData);
      // Set default year to latest available
      const latestYear = financialYears[financialYears.length - 1];
      setSelectedYear(latestYear);
      setFilteredRecords(res.data.filter(r => r.fin_year === latestYear));
    };
    fetchData();
  }, [districtCode,  i18n.language]);

  useEffect(() => {
    let filtered = records;
    if (selectedYear) filtered = filtered.filter(r => r.fin_year === selectedYear);
    if (selectedMonth) filtered = filtered.filter(r => r.month === selectedMonth);
    setFilteredRecords(filtered);
  }, [selectedYear, selectedMonth, records]);

  if (!records.length) return <div>{t('loading')}</div>;

  const latest = filteredRecords[0] || {};

  // Function to generate plain-language conclusion for a metric
  const getConclusion = (metric) => {
    if (!filteredRecords.length) return t('dashboard.no_data');
    const districtName = latest.district_name;
    
    switch(metric) {
      case "Average_Wage_rate_per_day_per_person":
        return t('dashboard.wage_conclusion', {
          district: districtName,
          amount: latest.Average_Wage_rate_per_day_per_person?.toLocaleString() || 0,
          year: selectedYear
        });
      case "Total_Exp":
        return `The total expenditure for employment in ${latest.district_name} was ₹${latest.Total_Exp?.toLocaleString() || 0} in ${selectedYear}.`;
      case "Average_days_of_employment_provided_per_Household":
        return `Each household received approximately ${latest.Average_days_of_employment_provided_per_Household || 0} days of work on average in ${selectedYear}.`;
      default:
        return "";
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{latest.district_name} {t('dashboard')}</h1>

      <Filters
        records={records}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
      />

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
        <KPIcard title={t('total_households')} value={latest.Total_Households_Worked} />
        <KPIcard title={t('total_individuals')} value={latest.Total_Individuals_Worked} />
        <KPIcard title={t('total_job_cards')} value={latest.Total_No_of_JobCards_issued} />
        <KPIcard title={t('women_persondays')} value={latest.Women_Persondays} />
      </div>

      {/* Charts with conclusions */}
      <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <ChartCard title={t('average_wage_rate')} records={filteredRecords} metric="Average_Wage_rate_per_day_per_person" />
          <p className="mt-2 text-sm text-gray-700">{getConclusion("Average_Wage_rate_per_day_per_person")}</p>
        </div>
        <div>
          <ChartCard title={t('total_expenditure')} records={filteredRecords} metric="Total_Exp" />
          <p className="mt-2 text-sm text-gray-700">{getConclusion("Total_Exp")}</p>
        </div>
        <div>
          <ChartCard title={t('days_per_household')} records={filteredRecords} metric="Average_days_of_employment_provided_per_Household" />
          <p className="mt-2 text-sm text-gray-700">{getConclusion("Average_days_of_employment_provided_per_Household")}</p>
        </div>
      </div>

      {/* Audio Summary */}
      <AudioSummary records={latest} />
    </div>
  );
};

export default Dashboard;
