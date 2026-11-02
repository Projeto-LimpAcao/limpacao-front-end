import { describe, expect, it } from "vitest";
import {
  calcularEstatisticas,
  calcularTaxaResolucao,
} from "./useRelatorios";
import { filtrarReportes } from "../utils/filtrar";

describe("calcularTaxaResolucao", () => {
  it("calculates the resolved percentage for the supplied user's reports", () => {
    const reportesDoUsuario = [
      { status: "resolved" },
      { status: "pending" },
      { status: "resolved" },
    ];

    expect(calcularTaxaResolucao(reportesDoUsuario)).toBe(67);
  });

  it("returns zero when there are no reports", () => {
    expect(calcularTaxaResolucao([])).toBe(0);
  });

  it("calculates the community rate separately from the user's rate", () => {
    const todosReportes = [
      { status: "resolved", souDono: true },
      { status: "pending", souDono: true },
      { status: "pending", souDono: false },
      { status: "pending", souDono: false },
      { status: "pending", souDono: false },
      { status: "pending", souDono: false },
    ];
    const reportesDoUsuario = todosReportes.filter((reporte) => reporte.souDono);

    expect(calcularTaxaResolucao(reportesDoUsuario)).toBe(50);
    expect(calcularTaxaResolucao(todosReportes)).toBe(17);
  });

  it("scopes status card totals to the user's reports on the My Reports page", () => {
    const reportes = [
      { souDono: true, status: "resolved" },
      { souDono: true, status: "in-progress" },
      { souDono: false, status: "resolved" },
      { souDono: false, status: "pending" },
    ];

    expect(calcularEstatisticas(reportes, true, true)).toMatchObject({
      total: 2,
      resolvidos: 1,
      emAndamento: 1,
      meus: 2,
      taxaResolucao: 50,
      taxaResolucaoGeral: 50,
      taxaIndividual: true,
    });

    expect(
      filtrarReportes(
        reportes.filter((reporte) => reporte.souDono),
        { status: "resolved" },
      ),
    ).toEqual([reportes[0]]);
  });
});
