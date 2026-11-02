// Runtime validation coverage for: profile updates.
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./api", () => ({
  requisicaoApi: vi.fn(),
}));

import { requisicaoApi } from "./api";
import { atualizarPerfil } from "./perfilService";

describe("atualizarPerfil", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends the authenticated profile update and returns the saved profile", async () => {
    const perfil = { nome: "Ana", email: "ana@example.com" };
    requisicaoApi.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(perfil),
    });

    await expect(
      atualizarPerfil({ nome: "Ana", senhaAtual: "", novaSenha: "" }),
    ).resolves.toEqual(perfil);
    expect(requisicaoApi).toHaveBeenCalledWith("usuarios/me/perfil", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: "Ana", senhaAtual: "", novaSenha: "" }),
    });
  });

  it("shows the backend validation error when the update is rejected", async () => {
    requisicaoApi.mockResolvedValue({
      ok: false,
      status: 400,
      json: vi.fn().mockResolvedValue({ detail: "Nome inválido." }),
    });

    await expect(atualizarPerfil({ nome: "" })).rejects.toThrow(
      "Nome inválido.",
    );
  });

  it("rejects malformed profile responses", async () => {
    requisicaoApi.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ nome: "Ana" }),
    });

    await expect(atualizarPerfil({ nome: "Ana" })).rejects.toThrow(
      "O servidor retornou dados de perfil inválidos.",
    );
  });
});
