import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Comparison from "./pages/Comparison";

const App = () => {
  return (
    <Router>
      <Header title="Awaaz-e-Punjab" />
      <main className="p-4 max-w-7xl mx-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard/:districtCode" element={<Dashboard />} />
          <Route path="/comparison" element={<Comparison />} />
        </Routes>
      </main>
    </Router>
  );
};

export default App;
