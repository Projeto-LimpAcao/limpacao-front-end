import "./Selecao.css";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

const DISTANCIA_LISTA = 6;
const MARGEM_TELA = 8;

export default function Select({
  label,
  id,
  name,
  value,
  onChange,
  opcoes = [],
  placeholder = "Selecione...",
  desabilitado = false,
  erro = false,
  mensagemErro = "",
  tamanho = "medio",
  obrigatorio = false,
}) {
  const idGerado = useId();
  const selectId = id ?? idGerado;
  const listaId = `${selectId}-lista`;

  const [aberto, setAberto] = useState(false);
  const [indiceAtivo, setIndiceAtivo] = useState(-1);
  const [posicao, setPosicao] = useState(null);

  const botaoRef = useRef(null);
  const listaRef = useRef(null);

  const indiceSelecionado = opcoes.findIndex(
    (opcao) => String(opcao.valor) === String(value ?? ""),
  );
  const selecionada = opcoes[indiceSelecionado];

  const calcularPosicao = useCallback(() => {
    const botao = botaoRef.current;
    const lista = listaRef.current;
    if (!botao || !lista) return;

    const caixa = botao.getBoundingClientRect();
    const largura = Math.max(caixa.width, lista.offsetWidth);
    const altura = lista.offsetHeight;

    const espacoAbaixo = window.innerHeight - caixa.bottom - MARGEM_TELA;
    const abrirParaCima = espacoAbaixo < altura && caixa.top > espacoAbaixo;

    let esquerda = caixa.left;
    if (esquerda + largura > window.innerWidth - MARGEM_TELA) {
      esquerda = Math.max(MARGEM_TELA, caixa.right - largura);
    }

    setPosicao({
      left: esquerda,
      minWidth: caixa.width,
      top: abrirParaCima
        ? Math.max(MARGEM_TELA, caixa.top - altura - DISTANCIA_LISTA)
        : caixa.bottom + DISTANCIA_LISTA,
    });
  }, []);

  const abrir = () => {
    if (desabilitado) return;
    setIndiceAtivo(indiceSelecionado >= 0 ? indiceSelecionado : 0);
    setPosicao(null);
    setAberto(true);
  };

  const fechar = useCallback((devolverFoco = false) => {
    setAberto(false);
    if (devolverFoco) botaoRef.current?.focus();
  }, []);

  const escolher = (opcao) => {
    if (String(opcao.valor) !== String(value ?? "")) {
      onChange?.({ target: { name, value: opcao.valor } });
    }
    fechar(true);
  };

  useLayoutEffect(() => {
    if (aberto) calcularPosicao();
  }, [aberto, calcularPosicao]);

  useEffect(() => {
    if (!aberto) return undefined;

    const clicarFora = (evento) => {
      if (
        !botaoRef.current?.contains(evento.target) &&
        !listaRef.current?.contains(evento.target)
      ) {
        fechar();
      }
    };

    document.addEventListener("pointerdown", clicarFora);
    window.addEventListener("resize", calcularPosicao);
    window.addEventListener("scroll", calcularPosicao, true);

    return () => {
      document.removeEventListener("pointerdown", clicarFora);
      window.removeEventListener("resize", calcularPosicao);
      window.removeEventListener("scroll", calcularPosicao, true);
    };
  }, [aberto, calcularPosicao, fechar]);

  useEffect(() => {
    if (!aberto || indiceAtivo < 0) return;
    listaRef.current
      ?.querySelector(`[data-indice="${indiceAtivo}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [aberto, indiceAtivo]);

  const aoPressionarTecla = (evento) => {
    if (desabilitado) return;

    if (!aberto) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(evento.key)) {
        evento.preventDefault();
        abrir();
      }
      return;
    }

    switch (evento.key) {
      case "ArrowDown":
        evento.preventDefault();
        setIndiceAtivo((atual) => Math.min(atual + 1, opcoes.length - 1));
        break;
      case "ArrowUp":
        evento.preventDefault();
        setIndiceAtivo((atual) => Math.max(atual - 1, 0));
        break;
      case "Home":
        evento.preventDefault();
        setIndiceAtivo(0);
        break;
      case "End":
        evento.preventDefault();
        setIndiceAtivo(opcoes.length - 1);
        break;
      case "Enter":
      case " ":
        evento.preventDefault();
        if (opcoes[indiceAtivo]) escolher(opcoes[indiceAtivo]);
        break;
      case "Escape":
        evento.preventDefault();
        evento.stopPropagation();
        fechar(true);
        break;
      case "Tab":
        fechar();
        break;
      default:
        break;
    }
  };

  const estilos = ["select", `select--${tamanho}`];
  if (erro) estilos.push("select--erro");
  if (aberto) estilos.push("select--aberto");
  if (!selecionada) estilos.push("select--vazio");

  return (
    <div className="select-container">
      {label && (
        <label htmlFor={selectId} className="select-label">
          {label}
          {obrigatorio && <span className="select-obrigatorio">*</span>}
        </label>
      )}

      <button
        ref={botaoRef}
        type="button"
        id={selectId}
        name={name}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={aberto}
        aria-controls={listaId}
        aria-invalid={erro || undefined}
        aria-activedescendant={
          aberto && indiceAtivo >= 0 ? `${listaId}-${indiceAtivo}` : undefined
        }
        disabled={desabilitado}
        className={estilos.join(" ")}
        onClick={() => (aberto ? fechar() : abrir())}
        onKeyDown={aoPressionarTecla}
      >
        <span className="select__valor">
          {selecionada ? selecionada.label : placeholder || " "}
        </span>
        <ChevronDown size={18} className="select__seta" aria-hidden="true" />
      </button>

      {aberto &&
        createPortal(
          <ul
            ref={listaRef}
            id={listaId}
            role="listbox"
            aria-labelledby={selectId}
            className="select-lista"
            style={
              posicao
                ? { top: posicao.top, left: posicao.left, minWidth: posicao.minWidth }
                : { visibility: "hidden" }
            }
          >
            {opcoes.map((opcao, indice) => {
              const marcada = indice === indiceSelecionado;
              const classes = ["select-opcao"];
              if (marcada) classes.push("select-opcao--selecionada");
              if (indice === indiceAtivo) classes.push("select-opcao--ativa");

              return (
                <li
                  key={opcao.valor}
                  id={`${listaId}-${indice}`}
                  data-indice={indice}
                  role="option"
                  aria-selected={marcada}
                  className={classes.join(" ")}
                  onPointerEnter={() => setIndiceAtivo(indice)}
                  onClick={() => escolher(opcao)}
                >
                  <span>{opcao.label}</span>
                  {marcada && <Check size={16} aria-hidden="true" />}
                </li>
              );
            })}
          </ul>,
          document.body,
        )}

      {erro && mensagemErro && (
        <span className="select-mensagem-erro">{mensagemErro}</span>
      )}
    </div>
  );
}
