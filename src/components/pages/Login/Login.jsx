import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";

import "./Login.css";
import { AppLayout } from "../../index";
import Botao from "../../atomos/Botao/Botao";
import InputTexto from "../../atomos/InputTexto/Inputexto";
import Stack from "../../atomos/Stack/Stack";
import Alerta from "../../moleculas/Alerta/Alerta";
import Logo from "../../moleculas/Logo/Logo";
import { CAMINHOS } from "../../../rotas/caminhos";
import {
  validarCadastro,
  validarLogin,
  validarRecuperacaoSenha,
  validarRedefinicaoSenha,
} from "../../utils/validarFormulario";
import { useAuth } from "../../../hooks";
import {
  redefinirSenha,
  solicitarRecuperacaoSenha,
} from "../../../services/authService";

const Input = InputTexto;

const FORMULARIO_VAZIO = {
  nome: "",
  email: "",
  codigo: "",
  senha: "",
  confirmarSenha: "",
};

const TITULOS = {
  entrar: "Entrar",
  cadastrar: "Criar conta",
  recuperar: "Recuperar senha",
  redefinir: "Redefinir senha",
};

const TEXTOS_BOTAO = {
  entrar: "Entrar",
  cadastrar: "Cadastrar",
  recuperar: "Enviar código",
  redefinir: "Redefinir senha",
};

const VALIDACOES = {
  entrar: validarLogin,
  cadastrar: validarCadastro,
  recuperar: validarRecuperacaoSenha,
  redefinir: validarRedefinicaoSenha,
};

const MENSAGEM_CODIGO_ENVIADO =
  "Se o e-mail estiver cadastrado, você receberá um código de 6 dígitos em instantes. Confira também a caixa de spam.";

export default function Login() {
  const [modo, setModo] = useState("entrar");
  const [formulario, setFormulario] = useState(FORMULARIO_VAZIO);

  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  const { usuario, entrar, cadastrar } = useAuth();
  const navegar = useNavigate();
  const local = useLocation();

  const destino = local.state?.de ?? CAMINHOS.home;
  const cadastrando = modo === "cadastrar";
  const recuperando = modo === "recuperar" || modo === "redefinir";
  const exibeSenha = modo !== "recuperar";
  const exibeConfirmarSenha = modo === "cadastrar" || modo === "redefinir";

  if (usuario) {
    return <Navigate to={destino} replace />;
  }

  const alterar = (campo) => (evento) => {
    setFormulario((atual) => ({ ...atual, [campo]: evento.target.value }));
    setErros((atual) => ({ ...atual, [campo]: "" }));
  };

  const alterarCodigo = (evento) => {
    const codigo = evento.target.value.replace(/\D/g, "").slice(0, 6);
    setFormulario((atual) => ({ ...atual, codigo }));
    setErros((atual) => ({ ...atual, codigo: "" }));
  };

  const irParaModo = (novoModo, { manterEmail = false, mensagem = "" } = {}) => {
    setModo(novoModo);
    setFormulario((atual) => ({
      ...FORMULARIO_VAZIO,
      email: manterEmail ? atual.email : "",
    }));
    setErros({});
    setErroGeral("");
    setSucesso(mensagem);
    setMostrarSenha(false);
    setMostrarConfirmarSenha(false);
  };

  const trocarModo = () => {
    if (recuperando) {
      irParaModo("entrar", { manterEmail: true });
      return;
    }

    irParaModo(cadastrando ? "entrar" : "cadastrar");
  };

  const validar = () => {
    const novos = VALIDACOES[modo](formulario);

    setErros(novos);
    return Object.keys(novos).length === 0;
  };

  const reenviarCodigo = async () => {
    setErroGeral("");
    setSucesso("");
    setEnviando(true);

    try {
      await solicitarRecuperacaoSenha(formulario.email);
      setSucesso(MENSAGEM_CODIGO_ENVIADO);
    } catch (problema) {
      setErroGeral(problema.message);
    } finally {
      setEnviando(false);
    }
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    setErroGeral("");
    setSucesso("");

    if (!validar()) return;

    setEnviando(true);

    try {
      if (modo === "recuperar") {
        await solicitarRecuperacaoSenha(formulario.email);
        irParaModo("redefinir", {
          manterEmail: true,
          mensagem: MENSAGEM_CODIGO_ENVIADO,
        });
        return;
      }

      if (modo === "redefinir") {
        await redefinirSenha(
          formulario.email,
          formulario.codigo,
          formulario.senha,
        );
        irParaModo("entrar", {
          manterEmail: true,
          mensagem: "Senha redefinida com sucesso! Entre com sua nova senha.",
        });
        return;
      }

      if (cadastrando) {
        await cadastrar(
          formulario.nome.trim(),
          formulario.email,
          formulario.senha,
        );
      } else {
        await entrar(formulario.email, formulario.senha);
      }
      navegar(destino, {
        replace: true,
        state: local.state?.estadoDestino,
      });
    } catch (problema) {
      setErroGeral(problema.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AppLayout>
      <div className="login">
        <div className="login__shell">
        <aside className="login__painel" aria-label="Resumo do projeto">
          <div className="login__painel-topo">
            <span className="login__escudo login__escudo--painel">
              <ShieldCheck size={30} />
            </span>
            <Logo tamanho="grande" centralizado />
          </div>

          <div className="login__apresentacao">
            <p className="login__eyebrow">Plataforma comunitária</p>
            <h1 className="login__titulo-principal">
              Conecte sua comunidade às soluções urbanas
            </h1>
            <p className="login__descricao">
              Acompanhe reportes, indicadores e ações de limpeza para manter a
              sua comunidade mais limpa, saudável e colaborativa.
            </p>
          </div>

          <ul className="login__lista">
            <li>Reportes em tempo real</li>
            <li>Indicadores por bairro</li>
            <li>Comunidade mais engajada</li>
          </ul>
        </aside>

        <div className="login__caixa">
          <header className="login__cabecalho">
            <span className="login__escudo login__escudo--mini">
              <ShieldCheck size={26} />
            </span>

            <p className="login__chamada">Acesse sua área do projeto</p>
          </header>

          <Alerta tipo="erro" onFechar={() => setErroGeral("")}>
            {erroGeral}
          </Alerta>

          <Alerta tipo="sucesso" onFechar={() => setSucesso("")}>
            {sucesso}
          </Alerta>

          <form onSubmit={enviar} noValidate>
            <Stack gap={16}>
              <h2 className="login__titulo">{TITULOS[modo]}</h2>

              {modo === "recuperar" && (
                <p className="login__instrucao">
                  Informe o e-mail da sua conta e enviaremos um código para
                  redefinir sua senha.
                </p>
              )}

              {modo === "redefinir" && (
                <p className="login__instrucao">
                  Digite o código enviado para <strong>{formulario.email}</strong>{" "}
                  e escolha uma nova senha.
                </p>
              )}

              {cadastrando && (
                <Input
                  label="Nome"
                  obrigatorio
                  placeholder="Seu nome completo"
                  value={formulario.nome}
                  onChange={alterar("nome")}
                  erro={Boolean(erros.nome)}
                  mensagemErro={erros.nome}
                />
              )}

              {modo !== "redefinir" && (
                <Input
                  label="E-mail"
                  type="email"
                  obrigatorio
                  placeholder="voce@exemplo.com"
                  value={formulario.email}
                  onChange={alterar("email")}
                  autoComplete="email"
                  erro={Boolean(erros.email)}
                  mensagemErro={erros.email}
                />
              )}

              {modo === "redefinir" && (
                <Input
                  label="Código de verificação"
                  obrigatorio
                  placeholder="000000"
                  value={formulario.codigo}
                  onChange={alterarCodigo}
                  autoComplete="one-time-code"
                  erro={Boolean(erros.codigo)}
                  mensagemErro={erros.codigo}
                />
              )}

              {exibeSenha && (
                <div className="login__campo-senha">
                  <label className="input-label">
                    {modo === "redefinir" ? "Nova senha" : "Senha"}
                    <span className="input-obrigatorio">*</span>
                  </label>

                  <div className="login__campo-input">
                    <input
                      type={mostrarSenha ? "text" : "password"}
                      className={`input input--medio ${erros.senha ? "input--erro" : ""}`}
                      placeholder="Pelo menos 6 caracteres"
                      value={formulario.senha}
                      onChange={alterar("senha")}
                      autoComplete={
                        modo === "entrar" ? "current-password" : "new-password"
                      }
                      aria-invalid={Boolean(erros.senha) || undefined}
                    />

                    <button
                      type="button"
                      className="login__botao-olho"
                      onClick={() => setMostrarSenha((atual) => !atual)}
                      aria-label={
                        mostrarSenha ? "Ocultar senha" : "Mostrar senha"
                      }
                    >
                      {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {erros.senha && (
                    <span className="input-mensagem-erro">{erros.senha}</span>
                  )}

                  {modo === "entrar" && (
                    <button
                      type="button"
                      className="login__esqueci"
                      onClick={() =>
                        irParaModo("recuperar", { manterEmail: true })
                      }
                    >
                      Esqueci minha senha
                    </button>
                  )}
                </div>
              )}

              {exibeConfirmarSenha && (
                <div className="login__campo-senha">
                  <label className="input-label">
                    {modo === "redefinir"
                      ? "Confirmar nova senha"
                      : "Confirmar senha"}
                    <span className="input-obrigatorio">*</span>
                  </label>

                  <div className="login__campo-input">
                    <input
                      type={mostrarConfirmarSenha ? "text" : "password"}
                      className={`input input--medio ${erros.confirmarSenha ? "input--erro" : ""}`}
                      placeholder="Repita a senha"
                      value={formulario.confirmarSenha}
                      onChange={alterar("confirmarSenha")}
                      autoComplete="new-password"
                      aria-invalid={Boolean(erros.confirmarSenha) || undefined}
                    />

                    <button
                      type="button"
                      className="login__botao-olho"
                      onClick={() =>
                        setMostrarConfirmarSenha((atual) => !atual)
                      }
                      aria-label={
                        mostrarConfirmarSenha
                          ? "Ocultar senha"
                          : "Mostrar senha"
                      }
                    >
                      {mostrarConfirmarSenha ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  {erros.confirmarSenha && (
                    <span className="input-mensagem-erro">
                      {erros.confirmarSenha}
                    </span>
                  )}
                </div>
              )}

              <Botao
                type="submit"
                tamanho="grande"
                larguraTotal
                desabilitado={enviando}
              >
                {enviando ? "Aguarde..." : TEXTOS_BOTAO[modo]}
              </Botao>

              {modo === "redefinir" && (
                <button
                  type="button"
                  className="login__trocar"
                  onClick={reenviarCodigo}
                  disabled={enviando}
                >
                  Não recebeu? Reenviar código
                </button>
              )}

              <button
                type="button"
                className="login__trocar"
                onClick={trocarModo}
              >
                {recuperando
                  ? "Voltar para o login"
                  : cadastrando
                    ? "Já tem conta? Entrar"
                    : "Não tem conta? Cadastre-se"}
              </button>
            </Stack>
          </form>
        </div>
        </div>

        <p className="login__rodape">
          Juntos por comunidades mais limpas e sustentáveis 🌱
        </p>
      </div>
    </AppLayout>
  );
}
