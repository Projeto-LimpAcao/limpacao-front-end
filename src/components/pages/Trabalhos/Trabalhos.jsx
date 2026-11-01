import { Link, useNavigate } from "react-router-dom";
import { Recycle, GraduationCap, Waves, HandHeart } from "lucide-react";

import "./Trabalhos.css";
import { AppLayout, Container, Section, Grid, Botao, Card } from "../../index";
import { useAuth } from "../../../hooks";
import { CAMINHOS } from "../../../rotas/caminhos";

/* Projetos exibidos na página. Trocar aqui muda a página inteira. */
const PROJETOS = [
  {
    icone: <Waves size={22} />,
    titulo: "Mutirão Praia Limpa",
    descricao:
      "Reunimos voluntários para limpar praias e fazer a coleta seletiva dos resíduos encontrados na faixa de areia.",
  },
  {
    icone: <GraduationCap size={22} />,
    titulo: "Educação Ambiental",
    descricao:
      "Ações educativas em escolas e comunidades sobre descarte correto, compostagem e consumo consciente.",
  },
  {
    icone: <Recycle size={22} />,
    titulo: "Reciclagem Comunitária",
    descricao:
      "Parcerias com cooperativas locais para dar destino certo a tudo que é coletado nos mutirões.",
  },
];

const PASSOS = [
  {
    numero: "1",
    titulo: "Você encontra um problema",
    texto: "Lixo acumulado, entulho, descarte irregular — em qualquer canto da cidade.",
  },
  {
    numero: "2",
    titulo: "Registra o reporte",
    texto: "Com foto, localização e o nível de urgência. Leva menos de um minuto.",
  },
  {
    numero: "3",
    titulo: "A comunidade se mobiliza",
    texto: "Outras pessoas oferecem ajuda, entram no mutirão e conversam pelo chat.",
  },
  {
    numero: "4",
    titulo: "O problema é resolvido",
    texto: "O status vira 'Concluído' e todo mundo vê o resultado no painel.",
  },
];

/**
 * Página institucional (pública — não precisa estar logado).
 * É a única rota aberta além do login.
 */
export default function Trabalhos() {
  const { estaLogado } = useAuth();
  const navegar = useNavigate();

  const destinoPrincipal = estaLogado ? CAMINHOS.home : CAMINHOS.login;

  return (
    <AppLayout>
      <Container>
        {/* ---------- Destaque ---------- */}
        <section className="trabalhos__destaque">
          <div className="trabalhos__texto">
            <h1 className="trabalhos__titulo">
              Juntos por uma Florianópolis mais limpa
            </h1>

            <p className="trabalhos__chamada">
              Conheça os projetos e ações que fazemos para recolher resíduos,
              conscientizar a população e revitalizar nossas praias e áreas
              verdes.
            </p>

            <div className="trabalhos__botoes">
              <Link to={destinoPrincipal}>
                <Botao tamanho="grande" icone={<HandHeart size={18} />}>
                  {estaLogado ? "Ver reportes" : "Participar"}
                </Botao>
              </Link>

              <a href="#como-funciona">
                <Botao tamanho="grande" variante="secundario">
                  Como funciona
                </Botao>
              </a>
            </div>
          </div>

          <div className="trabalhos__foto">
            <img
              src="/imagens/O-lixo-que-produzimos.jpg"
              alt="Resíduos acumulados em área pública"
              loading="lazy"
            />
          </div>
        </section>

        {/* ---------- Projetos ---------- */}
        <Section
          titulo="Nossos projetos"
          descricao="Frentes de trabalho que mantemos com voluntários e parceiros locais."
        >
          <Grid colunas={3} minimo="260px">
            {PROJETOS.map((projeto) => (
              <article key={projeto.titulo} className="trabalhos__projeto">
                <span className="trabalhos__projeto-icone">{projeto.icone}</span>
                <h3 className="trabalhos__projeto-titulo">{projeto.titulo}</h3>
                <p className="trabalhos__projeto-texto">{projeto.descricao}</p>
              </article>
            ))}
          </Grid>
        </Section>

        {/* ---------- Como funciona ---------- */}
        <Section
          id="como-funciona"
          titulo="Como funciona"
          descricao="Do problema encontrado até a solução, em quatro passos."
        >
          <Grid colunas={4} minimo="220px">
            {PASSOS.map((passo) => (
              <div key={passo.numero} className="trabalhos__passo">
                <span className="trabalhos__passo-numero">{passo.numero}</span>
                <h3 className="trabalhos__passo-titulo">{passo.titulo}</h3>
                <p className="trabalhos__passo-texto">{passo.texto}</p>
              </div>
            ))}
          </Grid>
        </Section>

        {/* ---------- Chamada final ---------- */}
        <Section>
          <Card
            titulo="Quer ajudar?"
            descricao="Crie sua conta, reporte o que encontrar pela cidade e acompanhe o que a comunidade está resolvendo."
            acaoLabel={estaLogado ? "Ir para os reportes" : "Criar conta"}
            onAcaoClick={() => navegar(destinoPrincipal)}
          />
        </Section>
      </Container>
    </AppLayout>
  );
}
