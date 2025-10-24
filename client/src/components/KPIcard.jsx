import React from "react";

const colors = {
  green: "bg-green-500 text-white",
  yellow: "bg-yellow-400 text-black",
  red: "bg-red-500 text-white",
};

const KPIcard = ({ title, value, color = "green" }) => {
  return (
    <div
      className={`p-4 rounded shadow-md ${colors[color]} flex flex-col items-center justify-center transition transform hover:scale-105`}
    >
      <h2 className="text-lg font-semibold text-center">{title}</h2>
      <p className="text-2xl font-bold mt-2 text-center">
        {value !== undefined && value !== null ? value.toLocaleString() : "-"}
      </p>
    </div>
  );
};

export default KPIcard;
