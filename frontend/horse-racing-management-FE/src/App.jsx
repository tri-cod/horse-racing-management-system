import { Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "./layouts/AdminLayout";
import UserManagement from "./pages/UserManagement";
import RaceManagement from "./pages/RaceManagement";
import HorseManagement from "./pages/HorseManagement";
import BettingManagement from "./pages/BettingManagement";
function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/users" />}
      />

      <Route element={<AdminLayout />}>
        <Route
          path="/users"
          element={<UserManagement />}
        />

        <Route
          path="/races"
          element={<RaceManagement />}
        />

        <Route
          path="/horses"
          element={<HorseManagement />}
        />
        <Route path="/betting" element={<BettingManagement />} />
      </Route>
    </Routes>
  );
}

export default App;