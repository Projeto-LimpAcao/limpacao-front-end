import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Login from "../components/pages/Login/Login";
import Perfil from "../components/pages/Perfil/Perfil";
import Reportes from "../components/pages/Reportes/Reportes";
import Trabalhos from "../components/pages/Trabalhos/Trabalhos";
import { useAuth } from "../hooks";

function RotaPrivada({ children }) {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function Rotas() {
  return (
    <Routes>
      <Route path="/" element={<Trabalhos />} />
      <Route path="/login" element={<Login />} />
      <Route path="/trabalhos" element={<Trabalhos />} />
      <Route path="/reportes" element={<Reportes />} />

      <Route
        path="/meus-reportes"
        element={
          <RotaPrivada>
            <Reportes somenteMeus />
          </RotaPrivada>
        }
      />
      <Route
        path="/perfil"
        element={
          <RotaPrivada>
            <Perfil />
          </RotaPrivada>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
