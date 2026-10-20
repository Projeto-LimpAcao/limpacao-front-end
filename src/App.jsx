import { useMemo, useState } from 'react'
import './App.css'
import AppBar from './components/Organisms/AppBar/AppBar'
import PainelEstatisticas from './components/Organisms/PainelEstatisticas/PainelEstatisticas'
import PainelFiltros from './components/Organisms/PainelFiltros/PainelFiltros'
import CardReporte from './components/Organisms/CardReporte/CardReporte'
import EstadoVazio from './components/Organisms/EstadoVazio/EstadoVazio'
import Footer from './components/Organisms/Footer/Footer'
import { MENU } from './config/projeto'

const reportesBase = [
  {
    id: 1,
    titulo: 'Lixo acumulado na praia da Armação',
    urgencia: 'alta',
    status: 'in-progress',
    localizacao: 'Praia da Armação, Florianópolis',
    descricao:
      'Acumulou sacos plásticos e restos de construção ao longo da calçada. A área fica próxima ao acesso do calçadão e precisa de limpeza urgente.',
    autor: 'Maria Souza',
    data: '2026-09-18T08:30:00',
    multirao: true,
    participantes: 12,
    ajudantes: 5,
    mensagens: [
      { id: 1, autor: 'João', data: '2026-09-18T09:00:00', texto: 'Posso levar um carro para transportar o material.' },
      { id: 2, autor: 'Ana', data: '2026-09-18T09:25:00', texto: 'Tenho luvas e sacos grandes para ajudar.' },
    ],
    souDono: true,
    minhaParticipacao: { ajudando: true, participando: false },
    imagem: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 2,
    titulo: 'Buraco na rua do bairro São Pedro',
    urgencia: 'media',
    status: 'pending',
    localizacao: 'Rua das Flores, São Pedro',
    descricao:
      'A calçada está com um buraco grande perto da esquina e representa risco para pedestres e bicicletas.',
    autor: 'Pedro Lima',
    data: '2026-09-20T12:10:00',
    multirao: false,
    participantes: 0,
    ajudantes: 3,
    mensagens: [
      { id: 1, autor: 'Pedro Lima', data: '2026-09-20T12:10:00', texto: 'Precisamos de atenção da prefeitura.' },
    ],
    souDono: false,
    minhaParticipacao: { ajudando: false, participando: false },
    imagem: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 3,
    titulo: 'Vazamento de água no corredor central',
    urgencia: 'alta',
    status: 'resolved',
    localizacao: 'Corredor Central, Centro',
    descricao:
      'O vazamento foi contido e o problema já foi encaminhado para a equipe responsável.',
    autor: 'Fernanda Reis',
    data: '2026-09-15T15:00:00',
    multirao: true,
    participantes: 8,
    ajudantes: 6,
    mensagens: [
      { id: 1, autor: 'Fernanda', data: '2026-09-15T15:10:00', texto: 'Foi resolvido após as intervenções.' },
    ],
    souDono: false,
    minhaParticipacao: { ajudando: true, participando: true },
    imagem: '',
  },
]

function App() {
  const [drawerAberto, setDrawerAberto] = useState(false)
  const [filtros, setFiltros] = useState({
    busca: '',
    urgencia: 'todas',
    status: 'todos',
    ordenacao: 'recente',
  })

  const reportesFiltrados = useMemo(() => {
    const busca = filtros.busca.trim().toLowerCase()

    let lista = [...reportesBase]

    if (busca) {
      lista = lista.filter(
        (reporte) =>
          reporte.titulo.toLowerCase().includes(busca) ||
          reporte.localizacao.toLowerCase().includes(busca),
      )
    }

    if (filtros.urgencia !== 'todas') {
      lista = lista.filter((reporte) => reporte.urgencia === filtros.urgencia)
    }

    if (filtros.status !== 'todos') {
      lista = lista.filter((reporte) => reporte.status === filtros.status)
    }

    if (filtros.ordenacao === 'antigo') {
      lista.sort((a, b) => new Date(a.data) - new Date(b.data))
    } else if (filtros.ordenacao === 'urgencia') {
      lista.sort((a, b) => {
        const ordem = { alta: 3, media: 2, baixa: 1 }
        return ordem[b.urgencia] - ordem[a.urgencia]
      })
    } else {
      lista.sort((a, b) => new Date(b.data) - new Date(a.data))
    }

    return lista
  }, [filtros])

  const estatisticas = {
    total: reportesBase.length,
    resolvidos: reportesBase.filter((reporte) => reporte.status === 'resolved').length,
    emAndamento: reportesBase.filter((reporte) => reporte.status === 'in-progress').length,
    meus: reportesBase.filter((reporte) => reporte.souDono).length,
    taxaResolucao: Math.round(
      (reportesBase.filter((reporte) => reporte.status === 'resolved').length /
        reportesBase.length) *
        100,
    ),
  }

  const alterarFiltro = (campo, valor) => {
    setFiltros((atual) => ({ ...atual, [campo]: valor }))
  }

  return (
    <div className='app-demo'>
      <AppBar
        menu={MENU}
        usuario={{ nome: 'Gabriela' }}
        estaLogado
        estaEscuro={false}
        drawerAberto={drawerAberto}
        mostrarBotaoTema={true}
        caminhoHome='/'
        onAbrirMenu={() => setDrawerAberto(true)}
        onFecharMenu={() => setDrawerAberto(false)}
        onAlternarTema={() => {}}
        onSair={() => {}}
        onNovoReporte={() => {}}
      />

      <main className='app-demo__conteudo'>
        <PainelEstatisticas
          estatisticas={estatisticas}
          filtroAtivo='todos'
          onFiltrar={(valor) => alterarFiltro('status', valor)}
          onVerMeus={() => {}}
        />

        <section className='app-demo__filtros'>
          <PainelFiltros
            filtros={filtros}
            onAlterar={alterarFiltro}
            mostrarStatus
          />
        </section>

        <section className='app-demo__lista'>
          {reportesFiltrados.length > 0 ? (
            reportesFiltrados.map((reporte) => (
              <CardReporte
                key={reporte.id}
                reporte={reporte}
                onAbrirChat={() => {}}
                onAjudar={() => {}}
                onParticipar={() => {}}
                onEditar={() => {}}
                onExcluir={() => {}}
                onMudarStatus={() => {}}
                imagemAberta={false}
                onAbrirImagem={() => {}}
                onFecharImagem={() => {}}
              />
            ))
          ) : (
            <EstadoVazio
              titulo='Nenhum reporte encontrado'
              descricao='Ajuste os filtros para visualizar outros itens da comunidade.'
              rotuloAcao='Limpar filtros'
              onAcao={() => setFiltros({ busca: '', urgencia: 'todas', status: 'todos', ordenacao: 'recente' })}
            />
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default App
