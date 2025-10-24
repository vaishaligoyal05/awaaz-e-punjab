import { useState, useEffect } from 'react';

const districtMapping = {
  "AMRITSAR": { code: "2601", punjabi: "ਅੰਮ੍ਰਿਤਸਰ" },
  "BARNALA": { code: "2602", punjabi: "ਬਰਨਾਲਾ" },
  "BATHINDA": { code: "2603", punjabi: "ਬਠਿੰਡਾ" },
  "LUDHIANA": { code: "2604", punjabi: "ਲੁਧਿਆਣਾ" },
  "MANSA": { code: "2605", punjabi: "ਮਾਨਸਾ" },
  "MOGA": { code: "2606", punjabi: "ਮੋਗਾ" },
  "FARIDKOT": { code: "2607", punjabi: "ਫਰੀਦਕੋਟ" },
  "MUKATSAR": { code: "2608", punjabi: "ਸ੍ਰੀ ਮੁਕਤਸਰ ਸਾਹਿਬ" },
  "FEROZEPUR": { code: "2609", punjabi: "ਫਿਰੋਜ਼ਪੁਰ" },
  "FAZILKA": { code: "2610", punjabi: "ਫਾਜ਼ਿਲਕਾ" },
  "FATHEGARH SAHIB": { code: "2611", punjabi: "ਫਤਿਹਗੜ੍ਹ ਸਾਹਿਬ" },
  "JALANDHAR": { code: "2612", punjabi: "ਜਲੰਧਰ" },
  "KAPURTHALA": { code: "2613", punjabi: "ਕਪੂਰਥਲਾ" },
  "GURDASPUR": { code: "2614", punjabi: "ਗੁਰਦਾਸਪੁਰ" },
  "PATHANKOT": { code: "2615", punjabi: "ਪਠਾਨਕੋਟ" },
  "HOSHIARPUR": { code: "2616", punjabi: "ਹੁਸ਼ਿਆਰਪੁਰ" },
  "PATIALA": { code: "2617", punjabi: "ਪਟਿਆਲਾ" },
  "RUPNAGAR": { code: "2618", punjabi: "ਰੂਪਨਗਰ" },
  "MOHALI": { code: "2619", punjabi: "ਮੋਹਾਲੀ" },
  "SANGRUR": { code: "2620", punjabi: "ਸੰਗਰੂਰ" },
  "NAWANSHAHR": { code: "2621", punjabi: "ਸ਼ਹੀਦ ਭਗਤ ਸਿੰਘ ਨਗਰ" },
  "TARN TARAN": { code: "2622", punjabi: "ਤਰਨ ਤਾਰਨ" },
  "MALERKOTLA": { code: "2623", punjabi: "ਮਲੇਰਕੋਟਲਾ" }
};

const useGeoLocation = (records) => {
  const [district, setDistrict] = useState(null);
  const [error, setError] = useState(null);

  const findMatchingDistrict = (geoDistrict, records) => {
    // Get the district info from mapping
    const districtInfo = districtMapping[geoDistrict];
    
    if (!districtInfo) {
      console.log("No mapping found for:", geoDistrict);
      return null;
    }

    console.log("Looking for district:", {
      detected: geoDistrict,
      code: districtInfo.code,
      punjabi: districtInfo.punjabi
    });

    // Find the record in the data
    return records.find(record => {
      // Match by district code
      if (record.district_code === districtInfo.code) {
        console.log("Matched by district code:", record.district_code);
        return true;
      }

      // Match by Punjabi name
      if (record.district_name === districtInfo.punjabi) {
        console.log("Matched by Punjabi name:", record.district_name);
        return true;
      }

      // Match by English name
      if (record.district_name.toUpperCase().includes(geoDistrict)) {
        console.log("Matched by English name:", record.district_name);
        return true;
      }

      return false;
    });
  };

  useEffect(() => {
    if (!navigator.geolocation || !records || records.length === 0) {
      setError("Geolocation is not supported or no records available");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();

          let geoDistrict =
            data.address.county ||
            data.address.city_district ||
            data.address.city ||
            "";

          geoDistrict = geoDistrict.split(" ")[0].split("(")[0].trim().toUpperCase();
          console.log("Detected district:", geoDistrict);

          const matched = findMatchingDistrict(geoDistrict, records);

          if (matched) {
            console.log("Matched district:", matched);
            setDistrict(matched);
            setError(null);
          } else {
            console.log("No match found for district:", geoDistrict);
            console.log("Available districts:", records.map(r => r.district_name));
            setDistrict(null);
            setError("District not found in Punjab data");
          }
        } catch (err) {
          console.warn("Location fetch failed", err);
          setDistrict(null);
          setError("Failed to fetch location");
        }
      },
      (err) => {
        console.warn("Geolocation error:", err);
        setDistrict(null);
        setError("Permission denied or location unavailable");
      }
    );
  }, [records]);

  return { district, error };
};

export default useGeoLocation;