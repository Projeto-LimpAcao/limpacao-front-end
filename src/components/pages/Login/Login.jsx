import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";

import "./Login.css";
import Botao from "../../atomos/Botao/Botao";
import InputTexto from "../../atomos/InputTexto/Inputexto";
import Stack from "../../atomos/Stack/Stack";
import Alerta from "../../moleculas/Alerta/Alerta";
import Logo from "../../moleculas/Logo/Logo";
import { CAMINHOS } from "../../../rotas/caminhos";
import { validarCadastro, validarLogin } from "../../utils/validarFormulario";
import { useAuth } from "../../../hooks";

const Input = InputTexto;

const FORMULARIO_VAZIO = {
  nome: "",
  email: "",
  senha: "",
  confirmarSenha: "",
};

export default function Login() {
  const [cadastrando, setCadastrando] = useState(false);
  const [formulario, setFormulario] = useState(FORMULARIO_VAZIO);

  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  const { usuario, entrar, cadastrar } = useAuth();
  const navegar = useNavigate();
  const local = useLocation();

  const destino = local.state?.de ?? CAMINHOS.home;

  if (usuario) {
    return <Navigate to={destino} replace />;
  }

  const alterar = (campo) => (evento) => {
    setFormulario((atual) => ({ ...atual, [campo]: evento.target.value }));
    setErros((atual) => ({ ...atual, [campo]: "" }));
  };

  const trocarModo = () => {
    setCadastrando(!cadastrando);
    setFormulario(FORMULARIO_VAZIO);
    setErros({});
    setErroGeral("");
  };

  const validar = () => {
    const novos = cadastrando
      ? validarCadastro(formulario)
      : validarLogin(formulario);

    setErros(novos);
    return Object.keys(novos).length === 0;
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    setErroGeral("");

    if (!validar()) return;

    setEnviando(true);

    try {
      if (cadastrando) {
        await cadastrar(
          formulario.nome.trim(),
          formulario.email,
          formulario.senha,
        );
      } else {
        await entrar(formulario.email, formulario.senha);
      }
      navegar(destino, { replace: true });
    } catch (problema) {
      setErroGeral(problema.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
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
              cidade mais segura, saudável e colaborativa.
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

          <form onSubmit={enviar} noValidate>
            <Stack gap={16}>
              <h2 className="login__titulo">
                {cadastrando ? "Criar conta" : "Entrar"}
              </h2>

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

              <Input
                label="E-mail"
                type="email"
                obrigatorio
                placeholder="voce@exemplo.com"
                value={formulario.email}
                onChange={alterar("email")}
                erro={Boolean(erros.email)}
                mensagemErro={erros.email}
              />

              <div className="login__campo-senha">
                <label className="input-label">
                  Senha
                  <span className="input-obrigatorio">*</span>
                </label>

                <div className="login__campo-input">
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    className={`input input--medio ${erros.senha ? "input--erro" : ""}`}
                    placeholder="Pelo menos 6 caracteres"
                    value={formulario.senha}
                    onChange={alterar("senha")}
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
              </div>

              {cadastrando && (
                <div className="login__campo-senha">
                  <label className="input-label">
                    Confirmar senha
                    <span className="input-obrigatorio">*</span>
                  </label>

                  <div className="login__campo-input">
                    <input
                      type={mostrarConfirmarSenha ? "text" : "password"}
                      className={`input input--medio ${erros.confirmarSenha ? "input--erro" : ""}`}
                      placeholder="Repita a senha"
                      value={formulario.confirmarSenha}
                      onChange={alterar("confirmarSenha")}
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
                {enviando ? "Aguarde..." : cadastrando ? "Cadastrar" : "Entrar"}
              </Botao>

              <button
                type="button"
                className="login__trocar"
                onClick={trocarModo}
              >
                {cadastrando
                  ? "Já tem conta? Entrar"
                  : "Não tem conta? Cadastre-se"}
              </button>
            </Stack>
          </form>
        </div>
      </div>

      <p className="login__rodape">
        Juntos por uma cidade mais limpa e sustentável 🌱
      </p>
    </div>
  );
}
