import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import Dashboard from "./components/Dashboard/Dashboard";
import Assets from "./components/Assets/Assets";
import AssetDetails from "./components/Assets/AssetDetails";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AddAsset from "./components/Assets/AddAsset";
import EditAsset from "./components/Assets/EditAsset";
import SendToService from "./components/Service/SendToService";
import UnderService from "./components/Service/ServiceList";
import LocationsManager from "./components/Locations/LocationsManager";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Protected */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/assets"
          element={
            <ProtectedRoute>
              <Assets />
            </ProtectedRoute>
          }
        />

        <Route
          path="/assets/:id"
          element={
            <ProtectedRoute>
              <AssetDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add"
          element={
            <ProtectedRoute>
              <AddAsset />
            </ProtectedRoute>
          }
        />

        {/* EDIT ASSET */}
        <Route
          path="/assets/:id/edit"
          element={
            <ProtectedRoute>
              <EditAsset />
            </ProtectedRoute>
          }
        />

        {/* Send Service */}
        <Route
          path="/service/send/:id"
          element={
            <ProtectedRoute>
              <SendToService />
            </ProtectedRoute>
          }
        />
        {/* List of Asset send for Service */}
        <Route
          path="/services"
          element={
            <ProtectedRoute>
              <UnderService />
            </ProtectedRoute>
          }
        />
        <Route
          path="/locations"
          element={
            <ProtectedRoute>
              <LocationsManager />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
