import { describe, expect, it } from "vitest";

import { formatarTelefone } from "../utils/formatarTelefone";

describe("formatarTelefone", () => {
  it("formata celular e fixo", () => {
    expect(formatarTelefone("48999998888")).toBe("(48) 99999-8888");
    expect(formatarTelefone("4833334444")).toBe("(48) 3333-4444");
  });

  it("formata enquanto o usuário digita", () => {
    expect(formatarTelefone("")).toBe("");
    expect(formatarTelefone("4")).toBe("(4");
    expect(formatarTelefone("48")).toBe("(48)");
    expect(formatarTelefone("48999")).toBe("(48) 999");
  });

  it("ignora caracteres que não são números e limita a 11 dígitos", () => {
    expect(formatarTelefone("(48) 99999-88889999")).toBe("(48) 99999-8888");
  });
});
