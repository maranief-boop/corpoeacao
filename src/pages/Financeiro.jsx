// =====================================================================
// Módulo Financeiro e Cobrança — foco em zerar a inadimplência
// - Receita efetiva (Hoje / Semana / Mês / Ano) via data_ultimo_pagamento
// - Fila de pagantes com valor, data da baixa e forma de pagamento
// - Conciliação bidirecional de pagamentos (Aguardando Confirmação)
// - Registro manual de pagamentos com data e forma obrigatórias
// - Cobrança rápida via WhatsApp (mensagem personalizada)
// - Sincronização em tempo real com o Portal do Aluno
// =====================================================================
import { useMemo, useState } from 'react'
import {
  MessageCircle,
  Pencil,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Banknote,
  Users,
  TrendingUp,
  Clock,
  ExternalLink,
  XCircle,
  Plus,
  Loader2
} from 'lucide-react'
import { useAlunos } from '../hooks/useAlunos'
import { usePagamentos } from '../hooks/usePagamentos'
import { useApp } from '../context/AppContext'
import { useToast } from '../components/Toast'
import { Modal } from '../components/Modal'
import { StatusBadge } from '../components/StatusBadge'
import FormAluno from '../components/FormAluno'
import { Paginacao } from '../components/Paginacao'
import { Card, EstadoVazio, Spinner, Select } from '../components/ui'
import {
  formatarMoeda,
  formatarData,
  formatarDataHora,
  diasDesde,
  iniciais,
  dataParaInput
} from '../utils/format'
import { abrirWhatsApp, mensagemCobranca } from '../utils/whatsapp'

const ITENS_POR_PAGINA = 20

const FORMAS_PAGAMENTO = [
  'Pix',
  'Cartão de Crédito',
  'Cartão de Débito',
  'Dinheiro',
  'Boleto',
  'Transferência',
  'Outro'
]

const FILTROS = [
  { chave: 'todos', rotulo: 'Todos' },
  { chave: 'aguardando', rotulo: 'Aguardando Confirmação' },
  { chave: 'em_dia', rotulo: 'Em dia' },
  { chave: 'vencendo', rotulo: 'Vencendo' },
  { chave: 'inadimplente', rotulo: 'Inadimplente' },
  { chave: 'pagantes', rotulo: 'Pagantes' }
]

export default function Financeiro() {
  const { config } = useApp()
  const { alunos, carregando: carregandoAlunos, erro: erroAlunos, atualizar, carregar: recarregarAlunos } = useAlunos()
  const {
    pagamentos,
    pendentes,
    carregando: carregandoPagamentos,
    erro: erroPagamentos,
    carregar: recarregarPagamentos,
    registrarPagamentoManual,
    confirmarPagamento,
    recusarPagamento
  } = usePagamentos()
  const { toast } = useToast()

  const [filtro, setFiltro] = useState('todos')
  const [modalAberto, setModalAberto] = useState(false)
  const [alunoEditando, setAlunoEditando] = useState(null)

  // Estado do Modal de Registro Manual de Pagamento (Cenário A)
  const [modalBaixaAberto, setModalBaixaAberto] = useState(false)
  const [alunoSelecionadoId, setAlunoSelecionadoId] = useState('')
  const [formaManual, setFormaManual] = useState('Pix')
  const [dataPagamentoManual, setDataPagamentoManual] = useState(dataParaInput(new Date()))
  const [valorManual, setValorManual] = useState('')
  const [competenciaManual, setCompetenciaManual] = useState(dataParaInput(new Date()).slice(0, 7))
  const [salvandoBaixa, setSalvandoBaixa] = useState(false)

  // Loading individual em botões de conciliação (Cenário B)
  const [processandoPagamentoId, setProcessandoPagamentoId] = useState(null)

  // ----- Receita (regra unificada com Dashboard) -----
  const receita = useMemo(() => {
    const somar = () =>
      alunos
        .filter((a) => a.status_pagamento !== 'inadimplente')
        .reduce((s, a) => s + (Number(a.plano_valor) || 0), 0)
    return {
      hoje: somar(),
      semana: somar(),
      mes: somar(),
      ano: somar()
    }
  }, [alunos])

  // ----- Resumo por status (pipeline) -----
  const resumo = useMemo(() => {
    const pagantes = alunos.filter((a) => a.status_pagamento === 'em_dia')
    const vencendo = alunos.filter((a) => a.status_pagamento === 'vencendo')
    const inadimplentes = alunos.filter((a) => a.status_pagamento === 'inadimplente')
    const somar = (lista) => lista.reduce((s, a) => s + (Number(a.plano_valor) || 0), 0)
    const totalReceber = somar(alunos.filter((a) => a.status_pagamento !== 'inadimplente'))
    return {
      pagantes,
      vencendo,
      inadimplentes,
      totalReceber,
      inadimplencia: somar(inadimplentes)
    }
  }, [alunos])

  const contagem = (chave) => {
    if (chave === 'todos') return alunos.length
    if (chave === 'aguardando') return pendentes.length
    if (chave === 'pagantes') return alunos.filter((a) => a.data_ultimo_pagamento).length
    return alunos.filter((a) => a.status_pagamento === chave).length
  }

  const filtrados = useMemo(() => {
    if (filtro === 'todos') return alunos
    if (filtro === 'aguardando') {
      const idsPendentes = new Set(pendentes.map((p) => p.aluno_id))
      return alunos.filter((a) => idsPendentes.has(a.id) || a.status_pagamento === 'aguardando_confirmacao')
    }
    if (filtro === 'pagantes') {
      return alunos
        .filter((a) => a.data_ultimo_pagamento)
        .sort((a, b) => String(b.data_ultimo_pagamento).localeCompare(String(a.data_ultimo_pagamento)))
    }
    return alunos.filter((a) => a.status_pagamento === filtro)
  }, [alunos, filtro, pendentes])

  // Paginação
  const [pagina, setPagina] = useState(1)
  const totalPaginas = Math.ceil(filtrados.length / ITENS_POR_PAGINA)
  const inicio = (pagina - 1) * ITENS_POR_PAGINA
  const filtradosPaginados = filtrados.slice(inicio, inicio + ITENS_POR_PAGINA)

  // ----- Abrir Modal de Baixa Manual -----
  const abrirModalBaixa = (aluno = null) => {
    if (aluno) {
      setAlunoSelecionadoId(aluno.id)
      setValorManual(aluno.plano_valor ? String(aluno.plano_valor) : '')
      setFormaManual(aluno.forma_pagamento || 'Pix')
    } else {
      setAlunoSelecionadoId(alunos[0]?.id || '')
      setValorManual(alunos[0]?.plano_valor ? String(alunos[0].plano_valor) : '')
      setFormaManual('Pix')
    }
    setDataPagamentoManual(dataParaInput(new Date()))
    setCompetenciaManual(dataParaInput(new Date()).slice(0, 7))
    setModalBaixaAberto(true)
  }

  // Quando o gestor muda o aluno selecionado no modal
  const aoMudarAlunoModal = (alunoId) => {
    setAlunoSelecionadoId(alunoId)
    const achado = alunos.find((a) => a.id === alunoId)
    if (achado) {
      setValorManual(achado.plano_valor ? String(achado.plano_valor) : '')
      if (achado.forma_pagamento) setFormaManual(achado.forma_pagamento)
    }
  }

  // ----- Salvar Baixa Manual (Cenário A) -----
  const handleSalvarBaixaManual = async (e) => {
    e.preventDefault()
    if (!alunoSelecionadoId) {
      toast('Selecione um aluno.', 'erro')
      return
    }
    if (!formaManual) {
      toast('Selecione a forma de pagamento.', 'erro')
      return
    }
    if (!dataPagamentoManual) {
      toast('Informe a data do pagamento.', 'erro')
      return
    }

    setSalvandoBaixa(true)
    try {
      const alunoAlvo = alunos.find((a) => a.id === alunoSelecionadoId)
      await registrarPagamentoManual({
        alunoId: alunoSelecionadoId,
        valor: Number(valorManual) || Number(alunoAlvo?.plano_valor) || 0,
        competencia: competenciaManual,
        forma: formaManual,
        dataPagamento: dataPagamentoManual,
        dataVencimento: alunoAlvo?.data_vencimento,
        confirmadoPor: config.nome_academia || 'Gestor'
      })

      await recarregarAlunos()
      toast(`Pagamento de ${alunoAlvo?.nome || 'Aluno'} registrado e regularizado com sucesso!`)
      setModalBaixaAberto(false)
    } catch (err) {
      toast(err.message || 'Erro ao registrar pagamento manual.', 'erro')
    } finally {
      setSalvandoBaixa(false)
    }
  }

  // ----- Confirmar Pagamento do Aluno (Cenário B) -----
  const handleConfirmarPagamento = async (pagamento) => {
    setProcessandoPagamentoId(pagamento.id)
    try {
      const nomeAluno = pagamento.aluno?.nome || alunos.find((a) => a.id === pagamento.aluno_id)?.nome || 'Aluno'
      await confirmarPagamento({
        pagamentoId: pagamento.id,
        alunoId: pagamento.aluno_id,
        forma: pagamento.forma_pagamento || pagamento.forma,
        dataPagamento: pagamento.data_pagamento,
        confirmadoPor: config.nome_academia || 'Gestor'
      })

      await recarregarAlunos()
      toast(`Pagamento de ${nomeAluno} confirmado e regularizado!`)
    } catch (err) {
      toast(err.message || 'Erro ao confirmar pagamento.', 'erro')
    } finally {
      setProcessandoPagamentoId(null)
    }
  }

  // ----- Recusar / Contestar Pagamento (Cenário B) -----
  const handleRecusarPagamento = async (pagamento) => {
    const nomeAluno = pagamento.aluno?.nome || alunos.find((a) => a.id === pagamento.aluno_id)?.nome || 'Aluno'
    if (!window.confirm(`Deseja recusar/contestar o pagamento informado por ${nomeAluno}? O status do aluno ficará pendente de regularização.`)) {
      return
    }

    setProcessandoPagamentoId(pagamento.id)
    try {
      await recusarPagamento({
        pagamentoId: pagamento.id,
        alunoId: pagamento.aluno_id
      })

      await recarregarAlunos()
      toast(`Pagamento de ${nomeAluno} foi contestado/recusado.`, 'aviso')
    } catch (err) {
      toast(err.message || 'Erro ao recusar pagamento.', 'erro')
    } finally {
      setProcessandoPagamentoId(null)
    }
  }

  // ----- Cobrar via WhatsApp -----
  const cobrar = (aluno) => {
    const ok = abrirWhatsApp(
      aluno.telefone,
      mensagemCobranca({
        nome: aluno.nome,
        academia: config.nome_academia,
        valor: formatarMoeda(aluno.plano_valor),
        vencimento: formatarData(aluno.data_vencimento)
      })
    )
    if (!ok) toast('Cadastre o WhatsApp do aluno para cobrar.', 'erro')
  }

  // ----- Atualizar status no select da tabela -----
  const atualizarStatus = async (aluno, novoStatus) => {
    if (aluno.status_pagamento === novoStatus) return

    // Se estiver marcando como "em_dia", abre o modal com a forma obrigatória
    if (novoStatus === 'em_dia') {
      abrirModalBaixa(aluno)
      return
    }

    try {
      await atualizar(aluno.id, { status_pagamento: novoStatus })
      toast(
        `Status de ${aluno.nome} atualizado para "${
          novoStatus === 'vencendo' ? 'Vencendo' : 'Inadimplente'
        }".`
      )
    } catch (e) {
      toast(e.message || 'Erro ao atualizar status.', 'erro')
    }
  }

  const atualizarForma = async (aluno, forma) => {
    try {
      await atualizar(aluno.id, { forma_pagamento: forma })
      toast(`Forma de pagamento de ${aluno.nome} atualizada para ${forma}.`)
    } catch (e) {
      toast(e.message || 'Erro ao salvar forma de pagamento.', 'erro')
    }
  }

  const salvarEdicao = async (payload) => {
    try {
      await atualizar(alunoEditando.id, payload)
      toast('Dados financeiros atualizados.')
      setModalAberto(false)
    } catch (e) {
      toast(e.message || 'Erro ao atualizar.', 'erro')
    }
  }

  const CARDS_RECEITA = [
    { rotulo: 'Recebido hoje', valor: receita.hoje, cor: 'from-emerald-500 to-emerald-600' },
    { rotulo: 'Recebido na semana', valor: receita.semana, cor: 'from-teal-500 to-teal-600' },
    { rotulo: 'Recebido no mês', valor: receita.mes, cor: 'from-sky-500 to-sky-600' },
    { rotulo: 'Recebido no ano', valor: receita.ano, cor: 'from-indigo-500 to-indigo-600' }
  ]

  const erroGeral = erroAlunos || erroPagamentos
  const carregando = carregandoAlunos || carregandoPagamentos

  return (
    <div className="space-y-6">
      {/* Topo com Título e Ação de Registrar Pagamento */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Financeiro e Controle de Pagamentos
          </h1>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            Gestão de faturas, conciliação em tempo real e controle de inadimplência.
          </p>
        </div>

        <button
          onClick={() => abrirModalBaixa()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-primary-600/30 transition hover:bg-primary-500 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Registrar Pagamento Manual
        </button>
      </div>

      {/* ---------- Aviso de falha na busca ---------- */}
      {erroGeral && (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          <p className="font-semibold">Não foi possível carregar os dados financeiros.</p>
          <p className="mt-1">{erroGeral}</p>
        </div>
      )}

      {/* =================================================================== */}
      {/* CENÁRIO B: CONCILIAÇÃO — PAGAMENTOS AGUARDANDO CONFIRMAÇÃO DO GESTOR */}
      {/* =================================================================== */}
      {pendentes.length > 0 && (
        <div className="overflow-hidden rounded-2xl border-2 border-amber-400/80 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5 shadow-lg dark:border-amber-500/50 dark:bg-amber-950/20">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 ring-1 ring-inset ring-amber-500/40 dark:text-amber-300">
                <Clock className="h-5 w-5 animate-pulse" />
              </span>
              <div>
                <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                  Conciliação: Pagamentos Aguardando Confirmação
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Alunos que informaram transferência, Pix ou pagamento no portal e aguardam sua aprovação.
                </p>
              </div>
            </div>
            <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-black text-white shadow-sm">
              {pendentes.length} {pendentes.length === 1 ? 'pendência' : 'pendências'}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pendentes.map((p) => {
              const alunoInfo = p.aluno || alunos.find((a) => a.id === p.aluno_id)
              const isProcessing = processandoPagamentoId === p.id
              const nome = alunoInfo?.nome || 'Aluno'
              const valor = p.valor || alunoInfo?.plano_valor || 0
              const forma = p.forma_pagamento || p.forma || 'Pix'

              return (
                <div
                  key={p.id}
                  className="flex flex-col justify-between rounded-xl border border-amber-300/60 bg-white p-4 shadow-sm dark:border-amber-800/60 dark:bg-zinc-900"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {alunoInfo?.foto_url ? (
                          <img
                            src={alunoInfo.foto_url}
                            alt={nome}
                            className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-amber-400"
                          />
                        ) : (
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                            {iniciais(nome)}
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100">
                            {nome}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {alunoInfo?.telefone || 'Sem telefone'}
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 text-sm font-black text-emerald-600 dark:text-emerald-400">
                        {formatarMoeda(valor)}
                      </span>
                    </div>

                    <div className="rounded-lg bg-zinc-50 p-2.5 text-xs text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-300 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Forma informada:</span>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">{forma}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Competência:</span>
                        <span className="font-semibold">{p.competencia || 'Atual'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Informado em:</span>
                        <span>{formatarDataHora(p.created_at || p.data_pagamento)}</span>
                      </div>
                      {p.comprovante_url && (
                        <div className="pt-1">
                          <a
                            href={p.comprovante_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-primary-600 hover:underline dark:text-primary-400"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Ver comprovante anexado
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      onClick={() => handleConfirmarPagamento(p)}
                      disabled={isProcessing}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-500 active:scale-95 disabled:opacity-50"
                      title="Confirmar recebimento e regularizar aluno"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                      Confirmar Pagamento
                    </button>

                    <button
                      onClick={() => handleRecusarPagamento(p)}
                      disabled={isProcessing}
                      className="inline-flex items-center justify-center gap-1 rounded-lg border border-red-300 px-2.5 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30 disabled:opacity-50"
                      title="Recusar ou contestar comprovante"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Recusar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ---------- Receita efetiva ---------- */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Receita recebida
        </p>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {CARDS_RECEITA.map((c) => (
            <div
              key={c.rotulo}
              className={`rounded-2xl bg-gradient-to-br ${c.cor} p-4 text-white shadow-card`}
            >
              <TrendingUp className="h-5 w-5 opacity-80" />
              <p className="mt-2 truncate text-xl font-extrabold">{formatarMoeda(c.valor)}</p>
              <p className="text-xs font-medium opacity-90">{c.rotulo}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ---------- Situação (pipeline) ---------- */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl bg-emerald-500 p-4 text-white shadow-card">
          <CheckCircle2 className="h-5 w-5 opacity-80" />
          <p className="mt-2 text-2xl font-extrabold">{resumo.pagantes.length}</p>
          <p className="text-xs font-medium opacity-90">Em dia</p>
        </div>
        <div className="rounded-2xl bg-amber-500 p-4 text-white shadow-card">
          <Wallet className="h-5 w-5 opacity-80" />
          <p className="mt-2 text-2xl font-extrabold">{resumo.vencendo.length}</p>
          <p className="text-xs font-medium opacity-90">Vencendo</p>
        </div>
        <div className="rounded-2xl bg-red-500 p-4 text-white shadow-card">
          <AlertTriangle className="h-5 w-5 opacity-80" />
          <p className="mt-2 text-2xl font-extrabold">{resumo.inadimplentes.length}</p>
          <p className="text-xs font-medium opacity-90">Inadimplentes</p>
        </div>
        <div className="rounded-2xl bg-zinc-900 p-4 text-white shadow-card dark:bg-zinc-800">
          <Banknote className="h-5 w-5 opacity-80" />
          <p className="mt-2 truncate text-xl font-extrabold">{formatarMoeda(resumo.totalReceber)}</p>
          <p className="text-xs font-medium opacity-90">Total a receber</p>
        </div>
      </div>

      {/* ---------- Filtros ---------- */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTROS.map((f) => {
          const ativo = filtro === f.chave
          const count = contagem(f.chave)
          return (
            <button
              key={f.chave}
              onClick={() => {
                setFiltro(f.chave)
                setPagina(1)
              }}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                ativo
                  ? 'bg-primary-600 text-white shadow'
                  : 'bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700 dark:hover:bg-zinc-700'
              }`}
            >
              {f.rotulo}
              <span className={ativo ? 'ml-1 opacity-80' : 'ml-1 text-zinc-400'}>
                ({count})
              </span>
            </button>
          )
        })}
      </div>

      {/* ---------- Lista de Alunos e Faturas ---------- */}
      {carregando ? (
        <Spinner />
      ) : filtrados.length === 0 ? (
        <Card>
          <EstadoVazio
            icone={Users}
            titulo="Nenhum aluno neste filtro"
            descricao="Cadastre alunos ou altere o filtro de status."
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {filtradosPaginados.map((aluno) => {
              const statusNaoEmDia = aluno.status_pagamento !== 'em_dia'
              const atraso = statusNaoEmDia && aluno.data_vencimento ? diasDesde(aluno.data_vencimento) : null
              const vencido = atraso !== null && atraso > 0
              const temPendente = pendentes.some((p) => p.aluno_id === aluno.id)

              return (
                <li
                  key={aluno.id}
                  className="flex flex-col gap-3 px-4 py-3.5 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-bold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-200">
                      {iniciais(aluno.nome)}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
                          {aluno.nome}
                        </p>
                        {temPendente && (
                          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-600 ring-1 ring-amber-500/30 dark:text-amber-400">
                            Aguardando confirmação
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {formatarMoeda(aluno.plano_valor)}
                        <span className="mx-1">·</span>
                        Vence {formatarData(aluno.data_vencimento)}
                        {vencido && (
                          <span className="ml-1 font-semibold text-red-500">
                            ({atraso} dia(s) de atraso)
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                        Última baixa:{' '}
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                          {formatarData(aluno.data_ultimo_pagamento) || 'sem registro'}
                        </span>
                        {aluno.forma_pagamento && (
                          <span className="ml-2 font-medium text-primary-600 dark:text-primary-400">
                            ({aluno.forma_pagamento})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={aluno.status_pagamento} />

                    {/* Botão de Registro Manual de Baixa (Cenário A) */}
                    <button
                      onClick={() => abrirModalBaixa(aluno)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-500 active:scale-95"
                      title="Registrar pagamento manual com forma e data"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Dar Baixa
                    </button>

                    <Select
                      value={aluno.forma_pagamento || ''}
                      onChange={(e) => atualizarForma(aluno, e.target.value)}
                      className="w-36 px-2 py-1.5 text-xs"
                      title="Forma de pagamento padrão"
                    >
                      <option value="">Forma de pag.</option>
                      {FORMAS_PAGAMENTO.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </Select>

                    <Select
                      value={aluno.status_pagamento}
                      onChange={(e) => atualizarStatus(aluno, e.target.value)}
                      className="w-32 px-2 py-1.5 text-xs"
                      title="Alterar status"
                    >
                      <option value="em_dia">Em dia</option>
                      <option value="vencendo">Vencendo</option>
                      <option value="inadimplente">Inadimplente</option>
                    </Select>

                    <button
                      onClick={() => cobrar(aluno)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-600"
                      title="Cobrar via WhatsApp"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Cobrar
                    </button>

                    <button
                      onClick={() => {
                        setAlunoEditando(aluno)
                        setModalAberto(true)
                      }}
                      className="rounded-xl p-2 text-zinc-500 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                      title="Editar dados financeiros"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>

          {totalPaginas > 1 && (
            <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
              <Paginacao
                paginaAtual={pagina}
                totalPaginas={totalPaginas}
                onMudarPagina={setPagina}
              />
            </div>
          )}
        </Card>
      )}

      {/* =================================================================== */}
      {/* CENÁRIO A: MODAL DE REGISTRO MANUAL DE PAGAMENTO (GESTOR)          */}
      {/* =================================================================== */}
      <Modal
        aberto={modalBaixaAberto}
        titulo="Registrar Pagamento Manual"
        onFechar={() => setModalBaixaAberto(false)}
      >
        <form onSubmit={handleSalvarBaixaManual} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-700 dark:text-zinc-300">
              Aluno <span className="text-red-500">*</span>
            </label>
            <select
              value={alunoSelecionadoId}
              onChange={(e) => aoMudarAlunoModal(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-primary-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              required
            >
              <option value="">Selecione o aluno</option>
              {alunos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome} — {formatarMoeda(a.plano_valor)} ({a.status_pagamento})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-700 dark:text-zinc-300">
                Forma de Pagamento <span className="text-red-500">*</span>
              </label>
              <select
                value={formaManual}
                onChange={(e) => setFormaManual(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-primary-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                required
              >
                {FORMAS_PAGAMENTO.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-700 dark:text-zinc-300">
                Data do Pagamento <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dataPagamentoManual}
                onChange={(e) => setDataPagamentoManual(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-primary-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-700 dark:text-zinc-300">
                Valor Recebido (R$) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={valorManual}
                onChange={(e) => setValorManual(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-primary-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-700 dark:text-zinc-300">
                Competência (Mês/Ano)
              </label>
              <input
                type="month"
                value={competenciaManual}
                onChange={(e) => setCompetenciaManual(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-primary-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="rounded-xl bg-zinc-100 p-3 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            <p className="font-semibold text-zinc-800 dark:text-zinc-200">
              Integridade do fluxo de caixa:
            </p>
            Ao salvar, o pagamento é registrado imediatamente no histórico do aluno com o status "Pago", a data da baixa e a forma utilizada. O Portal do Aluno será sincronizado em tempo real.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalBaixaAberto(false)}
              disabled={salvandoBaixa}
              className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvandoBaixa}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow transition hover:bg-emerald-500 active:scale-95 disabled:opacity-50"
            >
              {salvandoBaixa ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Confirmar e Dar Baixa
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Edição Geral do Aluno */}
      <Modal
        aberto={modalAberto}
        titulo="Dados financeiros do Aluno"
        onFechar={() => setModalAberto(false)}
      >
        <FormAluno
          inicial={alunoEditando}
          onSalvar={salvarEdicao}
          onCancelar={() => setModalAberto(false)}
          salvando={false}
        />
      </Modal>
    </div>
  )
}
