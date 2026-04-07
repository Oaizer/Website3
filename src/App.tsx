import React from "react";
import { Routes, Route } from "react-router-dom";
import { Portfolio } from "./pages/Portfolio";
import { TerminalWall } from "./pages/TerminalWall";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Portfolio />} />
      <Route path="/mark" element={<TerminalWall />} />
    </Routes>
  );
}
