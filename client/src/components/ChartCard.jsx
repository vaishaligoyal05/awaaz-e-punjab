import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const ChartCard = ({ title, records, metric }) => {
  const data = records
    .map((r) => ({
      month: `${r.month}-${r.fin_year}`,
      value: Number(r[metric]) || 0,
    }))
    .reverse(); // show oldest → newest

  return (
    <div className="bg-white rounded-lg shadow-md p-4 transition transform hover:scale-[1.01]">
      <h3 className="font-semibold text-lg mb-3">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value) => value.toLocaleString()} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#10B981"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartCard;
