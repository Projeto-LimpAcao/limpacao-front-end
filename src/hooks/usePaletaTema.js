import { useCallback, useEffect, useSyncExternalStore } from "react";
import * as preferenciasService from "../services/preferenciasService";

export const PALETAS_TEMA = [
  {
    id: "verde",
    nome: "Verde",
    cores: ["#15803d", "#16a34a", "#0f766e"],
  },
  {
    id: "azul",
    nome: "Azul",
    cores: ["#1d4ed8", "#2563eb", "#0e7490"],
  },
  {
    id: "roxo",
    nome: "Roxo",
    cores: ["#6d28d9", "#7c3aed", "#a21caf"],
  },
  {
    id: "laranja",
    nome: "Laranja",
    cores: ["#fb923c", "#ea580c", "#d97706"],
  },
  {
    id: "preto",
    nome: "Preto",
    cores: ["#525252", "#262626", "#09090b"],
  },
  {
    id: "rosa",
    nome: "Rosa",
    cores: ["#be123c", "#e11d48", "#be185d"],
  },
];

const PALETAS_VALIDAS = new Set(PALETAS_TEMA.map(({ id }) => id));
const CHAVE_PALETA_LOCAL = "limpacao-paleta";
const CHAVE_MODO_LOCAL = "limpacao-modo";
const EMAIL_VISITANTE = "__visitante__";
const assinantes = new Set();
const carregamentos = new Map();
let emailAtivo = null;
let emailCarregado = null;
let estado = {
  paleta: "verde",
  modoEscuro: false,
  carregando: false,
  salvando: false,
  erro: "",
};

function assinar(listener) {
  assinantes.add(listener);
  return () => assinantes.delete(listener);
}

function obterEstado() {
  return estado;
}

function atualizarEstado(novasPropriedades) {
  estado = { ...estado, ...novasPropriedades };
  aplicarEstadoVisual();
  assinantes.forEach((listener) => listener());
}

function aplicarEstadoVisual() {
  if (typeof document === "undefined") return;
  const raiz = document.documentElement;

  if (estado.paleta === "verde") {
    raiz.removeAttribute("data-paleta");
  } else {
    raiz.setAttribute("data-paleta", estado.paleta);
  }

  if (estado.modoEscuro) {
    raiz.setAttribute("data-tema", "escuro");
  } else {
    raiz.removeAttribute("data-tema");
  }
}

function normalizarPreferencias(preferencias) {
  return {
    paleta: PALETAS_VALIDAS.has(preferencias?.paleta)
      ? preferencias.paleta
      : "verde",
    modoEscuro: Boolean(preferencias?.modoEscuro),
  };
}

function chavePreferenciaLocal(chave, email) {
  return `${chave}:${encodeURIComponent(email.trim().toLowerCase())}`;
}

async function migrarPreferenciasLocais(email, preferenciasServidor) {
  const chavePaleta = chavePreferenciaLocal(CHAVE_PALETA_LOCAL, email);
  const chaveModo = chavePreferenciaLocal(CHAVE_MODO_LOCAL, email);
  const paletaLocal = localStorage.getItem(chavePaleta);
  const modoLocal = localStorage.getItem(chaveModo);
  const servidorNoPadrao =
    preferenciasServidor.paleta === "verde" &&
    preferenciasServidor.modoEscuro === false;

  if (
    servidorNoPadrao &&
    (paletaLocal !== null || modoLocal !== null)
  ) {
    const legado = {
      paleta: PALETAS_VALIDAS.has(paletaLocal) ? paletaLocal : "verde",
      modoEscuro: modoLocal === "escuro",
    };
    const migradas = await preferenciasService.salvarPreferencias(legado);
    localStorage.removeItem(chavePaleta);
    localStorage.removeItem(chaveModo);
    return normalizarPreferencias(migradas);
  }

  localStorage.removeItem(chavePaleta);
  localStorage.removeItem(chaveModo);
  return preferenciasServidor;
}

function carregarPreferencias(email) {
  if (!email) {
    if (emailAtivo !== EMAIL_VISITANTE) {
      emailAtivo = EMAIL_VISITANTE;
      emailCarregado = null;
    }
    if (emailCarregado === EMAIL_VISITANTE) return Promise.resolve();

    const preferencias = normalizarPreferencias({
      paleta: localStorage.getItem(
        chavePreferenciaLocal(CHAVE_PALETA_LOCAL, EMAIL_VISITANTE),
      ),
      modoEscuro:
        localStorage.getItem(
          chavePreferenciaLocal(CHAVE_MODO_LOCAL, EMAIL_VISITANTE),
        ) === "escuro",
    });
    emailCarregado = EMAIL_VISITANTE;
    atualizarEstado({
      ...preferencias,
      carregando: false,
      salvando: false,
      erro: "",
    });
    return Promise.resolve();
  }

  if (emailAtivo !== email) {
    emailAtivo = email;
    emailCarregado = null;
  }
  if (emailCarregado === email) return Promise.resolve();
  if (carregamentos.has(email)) return carregamentos.get(email);

  atualizarEstado({ carregando: true, erro: "" });
  const carregamento = preferenciasService
    .buscarPreferencias()
    .then((preferencias) =>
      migrarPreferenciasLocais(email, normalizarPreferencias(preferencias)),
    )
    .then((preferencias) => {
      if (emailAtivo !== email) return;
      emailCarregado = email;
      atualizarEstado({
        ...normalizarPreferencias(preferencias),
        carregando: false,
        erro: "",
      });
    })
    .catch((problema) => {
      if (emailAtivo === email) {
        atualizarEstado({ carregando: false, erro: problema.message });
      }
    })
    .finally(() => carregamentos.delete(email));

  carregamentos.set(email, carregamento);
  return carregamento;
}

async function persistirPreferencias(email, preferencias) {
  const normalizadas = normalizarPreferencias(preferencias);
  if (normalizadas.paleta !== preferencias.paleta) {
    atualizarEstado({ erro: "A paleta selecionada não é válida." });
    return false;
  }

  if (!email) {
    try {
      localStorage.setItem(
        chavePreferenciaLocal(CHAVE_PALETA_LOCAL, EMAIL_VISITANTE),
        normalizadas.paleta,
      );
      localStorage.setItem(
        chavePreferenciaLocal(CHAVE_MODO_LOCAL, EMAIL_VISITANTE),
        normalizadas.modoEscuro ? "escuro" : "claro",
      );
      emailAtivo = EMAIL_VISITANTE;
      emailCarregado = EMAIL_VISITANTE;
      atualizarEstado({
        ...normalizadas,
        carregando: false,
        salvando: false,
        erro: "",
      });
      return true;
    } catch (problema) {
      atualizarEstado({
        salvando: false,
        erro: `Não foi possível salvar as preferências neste navegador: ${problema.message}`,
      });
      return false;
    }
  }

  atualizarEstado({ salvando: true, erro: "" });
  try {
    const salvas = await preferenciasService.salvarPreferencias(normalizadas);
    if (emailAtivo === email) {
      emailCarregado = email;
      atualizarEstado({
        ...normalizarPreferencias(salvas),
        salvando: false,
        erro: "",
      });
    }
    return true;
  } catch (problema) {
    if (emailAtivo === email) {
      atualizarEstado({ salvando: false, erro: problema.message });
    }
    return false;
  }
}

export function usePaletaTema(email) {
  const snapshot = useSyncExternalStore(assinar, obterEstado, obterEstado);

  useEffect(() => {
    void carregarPreferencias(email);
  }, [email]);

  const selecionarPaleta = useCallback(
    (paleta) =>
      persistirPreferencias(email, {
        paleta,
        modoEscuro: estado.modoEscuro,
      }),
    [email],
  );

  const definirModoEscuro = useCallback(
    (modoEscuro) =>
      persistirPreferencias(email, {
        paleta: estado.paleta,
        modoEscuro: Boolean(modoEscuro),
      }),
    [email],
  );

  return {
    ...snapshot,
    selecionarPaleta,
    definirModoEscuro,
  };
}
