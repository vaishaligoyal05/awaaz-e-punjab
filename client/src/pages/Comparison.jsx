import React, { useEffect, useState } from "react";
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

const Comparison = () => {
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

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.getLatestPunjab();
        setRecords(res.data);
        // Default selected year = latest
        setSelectedYear(financialYears[financialYears.length - 1]);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    fetchData();
  }, []);

  // Filter by time
  const filteredByTime = records.filter(
    (r) =>
      (!selectedYear || r.fin_year === selectedYear) &&
      (!selectedMonth || r.month === selectedMonth)
  );

  // Filter by search
  const filteredDistricts = filteredByTime.filter((r) =>
    r.district_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle selection
  const toggleDistrict = (districtCode) => {
    setSelectedDistricts((prev) =>
      prev.includes(districtCode)
        ? prev.filter((d) => d !== districtCode)
        : [...prev, districtCode]
    );
  };

  // Filter for selected
  const selectedRecords = records.filter((r) =>
    selectedDistricts.includes(r.district_code)
  );

  // Handle done
  const handleDone = () => {
    if (selectedDistricts.length === 0) {
      alert("Please select at least one district to compare!");
      return;
    }
    setShowCharts(true);
  };

  // Handle reset
  const handleReset = () => {
    setSelectedDistricts([]);
    setShowCharts(false);
  };

  // Metrics to show
  const metrics = [
    { key: "Average_Wage_rate_per_day_per_person", label: "Average Wage Rate per Day per Person" },
    { key: "Total_Exp", label: "Total Expenditure" },
    { key: "Total_Households_Worked", label: "Total Households Worked" },
    { key: "Total_Individuals_Worked", label: "Total Individuals Worked" },
    { key: "Total_Jobcards_Issued", label: "Total Job Cards Issued" },
  ];

  // Generate simple conclusion for each metric
  const getConclusion = (key) => {
    if (!selectedRecords.length) return "No data available.";
    switch (key) {
      case "Average_Wage_rate_per_day_per_person":
        return selectedRecords.map(r => `${r.district_name}: ₹${r[key]?.toLocaleString() || 0} per day`).join("; ");
      case "Total_Exp":
        return selectedRecords.map(r => `${r.district_name}: ₹${r[key]?.toLocaleString() || 0}`).join("; ");
      case "Total_Households_Worked":
        return selectedRecords.map(r => `${r.district_name}: ${r[key]?.toLocaleString() || 0} households`).join("; ");
      case "Total_Individuals_Worked":
        return selectedRecords.map(r => `${r.district_name}: ${r[key]?.toLocaleString() || 0} individuals`).join("; ");
      case "Total_Jobcards_Issued":
        return selectedRecords.map(r => `${r.district_name}: ${r[key]?.toLocaleString() || 0} job cards`).join("; ");
      default:
        return "";
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Compare Districts</h1>

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
              placeholder="Search district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-2/3"
            />
            <p className="text-sm text-gray-500">
              {selectedDistricts.length} district(s) selected
            </p>
          </div>

          <p className="text-gray-600 mb-2">
            Double-click a district to <strong>select/unselect</strong>.
          </p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            {filteredDistricts.map((d) => (
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
              Done
            </button>
            <button
              onClick={handleReset}
              className="bg-gray-300 px-5 py-2 rounded hover:bg-gray-400"
            >
              Reset
            </button>
          </div>
        </>
      )}

      {showCharts && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Comparison Results</h2>
            <button
              onClick={handleReset}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Back to Selection
            </button>
          </div>

          {metrics.map(({ key, label }) => {
            const data = selectedRecords.map((r) => ({
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
                {/* Plain-language conclusion */}
<div className="mt-2  text-sm text-gray-700 space-y-1">
  {selectedRecords.map((r) => (
    <div key={r.district_code}>
      <strong>{r.district_name}:</strong>{" "}
      {key === "Average_Wage_rate_per_day_per_person" && `₹${r[key]?.toLocaleString() || 0} per day`}
      {key === "Total_Exp" && `₹${r[key]?.toLocaleString() || 0} total expenditure`}
      {key === "Total_Households_Worked" && `${r[key]?.toLocaleString() || 0} households worked`}
      {key === "Total_Individuals_Worked" && `${r[key]?.toLocaleString() || 0} individuals worked`}
      {key === "Total_Jobcards_Issued" && `${r[key]?.toLocaleString() || 0} job cards issued`}
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
