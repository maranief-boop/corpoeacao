// =====================================================================
// Hook usePagamentos — Controle de Faturas e Conciliação Bidirecional
// Sincroniza pagamentos entre Painel do Gestor e Portal do Aluno
// =====================================================================
import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { dataParaInput } from '../utils/format'

export function usePagamentos() {
  const [pagamentos, setPagamentos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro(null)
    try {
      // Tenta carregar com join de alunos
      let { data, error } = await supabase
        .from('pagamentos')
        .select('*, aluno:alunos(id, nome, foto_url, telefone, plano_valor, status_pagamento)')
        .order('created_at', { ascending: false })
        .limit(100)

      // Fallback: se join falhar, carrega direto de pagamentos
      if (error) {
        const { data: d2, error: e2 } = await supabase
          .from('pagamentos')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100)

        if (e2) throw e2
        data = d2
      }

      setPagamentos(data || [])
    } catch (e) {
      console.warn('Erro ao carregar pagamentos:', e)
      setErro(e.message || 'Erro ao carregar pagamentos')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregar()

    // Configura canal realtime para refletir pagamentos em tempo real
    const canal = supabase
      .channel('schema-pagamentos-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pagamentos' },
        () => {
          carregar()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(canal)
    }
  }, [carregar])

  // Pagamentos aguardando confirmação do gestor
  const pendentes = useMemo(() => {
    return pagamentos.filter((p) => p.status === 'aguardando_confirmacao')
  }, [pagamentos])

  // Cenário A: Gestor registra o pagamento manualmente
  const registrarPagamentoManual = useCallback(
    async ({
      alunoId,
      valor,
      competencia,
      forma,
      dataPagamento,
      dataVencimento,
      confirmadoPor = 'Gestor'
    }) => {
      if (!alunoId) throw new Error('Selecione o aluno.')
      if (!forma) throw new Error('Selecione a forma de pagamento.')

      const dataIso = dataPagamento
        ? new Date(dataPagamento + 'T12:00:00Z').toISOString()
        : new Date().toISOString()
      const dataFormatada = dataPagamento || dataParaInput(new Date())
      const comp = competencia || dataFormatada.slice(0, 7)

      // 1. Inserir fatura com status 'pago'
      const payloadPagamento = {
        aluno_id: alunoId,
        competencia: comp,
        valor: Number(valor) || 0,
        status: 'pago',
        forma: forma.toLowerCase(),
        forma_pagamento: forma,
        data_pagamento: dataIso,
        data_vencimento: dataVencimento || null,
        confirmado_por: confirmadoPor
      }

      const { data: pagamentoCriado, error: erroPagamento } = await supabase
        .from('pagamentos')
        .insert(payloadPagamento)
        .select()
        .single()

      if (erroPagamento) {
        throw new Error(erroPagamento.message || 'Erro ao registrar pagamento na tabela.')
      }

      // 2. Atualizar cadastro do aluno para regularizado ('em_dia')
      const { error: erroAluno } = await supabase
        .from('alunos')
        .update({
          status_pagamento: 'em_dia',
          data_ultimo_pagamento: dataFormatada,
          forma_pagamento: forma
        })
        .eq('id', alunoId)

      if (erroAluno) {
        console.warn('Aviso: Aluno não pôde ser atualizado:', erroAluno.message)
      }

      await carregar()
      return pagamentoCriado
    },
    [carregar]
  )

  // Cenário B: Gestor confirma pagamento informado pelo aluno
  const confirmarPagamento = useCallback(
    async ({ pagamentoId, alunoId, forma, dataPagamento, confirmadoPor = 'Gestor' }) => {
      if (!pagamentoId) throw new Error('ID do pagamento não informado.')

      const dataIso = dataPagamento
        ? new Date(dataPagamento).toISOString()
        : new Date().toISOString()
      const dataFormatada = (dataPagamento || dataParaInput(new Date())).slice(0, 10)

      // 1. Atualiza o status da fatura para consolidado 'pago' e grava auditoria
      const { data: pagAtualizado, error: erroPag } = await supabase
        .from('pagamentos')
        .update({
          status: 'pago',
          data_pagamento: dataIso,
          confirmado_por: confirmadoPor
        })
        .eq('id', pagamentoId)
        .select()
        .single()

      if (erroPag) throw new Error(erroPag.message || 'Erro ao confirmar pagamento.')

      // 2. Regulariza o aluno
      if (alunoId) {
        const payloadAluno = {
          status_pagamento: 'em_dia',
          data_ultimo_pagamento: dataFormatada
        }
        if (forma) payloadAluno.forma_pagamento = forma

        await supabase
          .from('alunos')
          .update(payloadAluno)
          .eq('id', alunoId)
      }

      await carregar()
      return pagAtualizado
    },
    [carregar]
  )

  // Cenário B: Gestor recusa/contesta o pagamento informado
  const recusarPagamento = useCallback(
    async ({ pagamentoId, alunoId }) => {
      if (!pagamentoId) throw new Error('ID do pagamento não informado.')

      // 1. Atualiza status do pagamento para 'cancelado'
      const { data: pagAtualizado, error: erroPag } = await supabase
        .from('pagamentos')
        .update({
          status: 'cancelado'
        })
        .eq('id', pagamentoId)
        .select()
        .single()

      if (erroPag) throw new Error(erroPag.message || 'Erro ao recusar pagamento.')

      // 2. Mantém ou define aluno como inadimplente
      if (alunoId) {
        await supabase
          .from('alunos')
          .update({
            status_pagamento: 'inadimplente'
          })
          .eq('id', alunoId)
      }

      await carregar()
      return pagAtualizado
    },
    [carregar]
  )

  return {
    pagamentos,
    pendentes,
    carregando,
    erro,
    carregar,
    registrarPagamentoManual,
    confirmarPagamento,
    recusarPagamento
  }
}
