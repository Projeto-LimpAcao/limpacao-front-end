import React from 'react'
import { Route, Routes } from 'react-router-dom';

export default function Rotas() {
 return (
    <Routes>
      <Route path="*" element={<h1>Página não encontrada</h1>} />
    </Routes>
  );
}
