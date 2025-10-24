import React from "react";
import { useSpeechSynthesis } from "react-speech-kit";

const AudioSummary = ({ records }) => {
  const { speak, cancel } = useSpeechSynthesis();

  if (!records) return null;

  const handleSpeak = () => {
    const summary = `
      District ${records.district_name}.
      Total households worked: ${records.Total_Households_Worked}.
      Total individuals worked: ${records.Total_Individuals_Worked}.
      Total job cards issued: ${records.Total_No_of_JobCards_issued}.
      Women persondays: ${records.Women_Persondays}.
    `;
    speak({ text: summary });
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleSpeak}
        className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition"
      >
        Listen Summary
      </button>
      <button
        onClick={cancel}
        className="ml-2 bg-gray-300 text-black px-4 py-2 rounded shadow hover:bg-gray-400 transition"
      >
        Stop
      </button>
    </div>
  );
};

export default AudioSummary;
