import React from 'react';
import { useTranslation } from 'react-i18next';

const Filters = ({ selectedYear, setSelectedYear, selectedMonth, setSelectedMonth }) => {
  const { t } = useTranslation();

  const years = [
    "2025-2026",
    "2024-2025",
    "2023-2024",
    "2022-2023",
    "2021-2022",
    "2020-2021",
    "2019-2020",
    "2018-2019"
  ];

  const months = [
    { key: "Jan", value: t("months.1") },
    { key: "Feb", value: t("months.2") },
    { key: "Mar", value: t("months.3") },
    { key: "Apr", value: t("months.4") },
    { key: "May", value: t("months.5") },
    { key: "Jun", value: t("months.6") },
    { key: "Jul", value: t("months.7") },
    { key: "Aug", value: t("months.8") },
    { key: "Sep", value: t("months.9") },
    { key: "Oct", value: t("months.10") },
    { key: "Nov", value: t("months.11") },
    { key: "Dec", value: t("months.12") }
  ];

  return (
    <div className="flex gap-4 mb-4">
      <select
        value={selectedYear}
        onChange={(e) => setSelectedYear(e.target.value)}
        className="border p-2 rounded"
      >
        {years.map(year => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>

      <select
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
        className="border p-2 rounded"
      >
        <option value="">{t("filters.month")}</option>
        {months.map(month => (
          <option key={month.key} value={month.key}>{month.value}</option>
        ))}
      </select>
    </div>
  );
};

export default Filters;