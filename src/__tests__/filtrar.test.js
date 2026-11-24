import { describe, expect, it } from "vitest";

import { filtrarReportes } from "../utils/filtrar";

const reportes = [
  { id: 1, titulo: "Lixo na praça", localizacao: "Centro", urgencia: "alta", status: "PENDENTE", data: "2026-11-01" },
  { id: 2, titulo: "Entulho", localizacao: "Trindade", urgencia: "baixa", status: "RESOLVIDO", data: "2026-11-10" },
  { id: 3, titulo: "Garrafas na praia", localizacao: "Centro", urgencia: "media", status: "PENDENTE", data: "2026-11-05" },
];

describe("filtrarReportes", () => {
  it("ordena do mais recente para o mais antigo por padrão", () => {
    expect(filtrarReportes(reportes).map((r) => r.id)).toEqual([2, 3, 1]);
  });

  it("busca por título ou localização sem diferenciar maiúsculas", () => {
    expect(filtrarReportes(reportes, { busca: "centro" }).map((r) => r.id)).toEqual([3, 1]);
    expect(filtrarReportes(reportes, { busca: "ENTULHO" }).map((r) => r.id)).toEqual([2]);
  });

  it("filtra por urgência e status", () => {
    expect(filtrarReportes(reportes, { urgencia: "alta" }).map((r) => r.id)).toEqual([1]);
    expect(filtrarReportes(reportes, { status: "PENDENTE", ordenacao: "antigo" }).map((r) => r.id)).toEqual([1, 3]);
  });

  it("não quebra com lista vazia ou nula", () => {
    expect(filtrarReportes(null)).toEqual([]);
    expect(filtrarReportes([])).toEqual([]);
  });
});
