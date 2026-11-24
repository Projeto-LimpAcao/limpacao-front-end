import { describe, expect, it } from "vitest";

import { classificarTempo, impactoDoComponente, resumoGeral } from "../utils/saude";

describe("saude", () => {
  it("resume o status geral do health check", () => {
    expect(resumoGeral("UP").titulo).toBe("Tudo funcionando normalmente");
    expect(resumoGeral("DEGRADED").titulo).toBe("Funcionando, mas com algum problema");
    expect(resumoGeral("DOWN").titulo).toBe("Sistema com falha");
    expect(resumoGeral("SEM_RESPOSTA").titulo).toBe("O servidor não está respondendo");
  });

  it("explica o impacto de cada componente", () => {
    expect(impactoDoComponente("db", "DOWN")).toMatch(/não consegue ler nem salvar/);
    expect(impactoDoComponente("componenteDesconhecido", "UP")).toBe("Funcionando normalmente.");
  });

  it("classifica o tempo de resposta", () => {
    expect(classificarTempo(100)).toBe("Rápido");
    expect(classificarTempo(300)).toBe("Normal");
    expect(classificarTempo(900)).toBe("Lento");
  });
});
