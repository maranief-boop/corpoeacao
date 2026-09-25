// =====================================================================
// Hook do Macrociclo — planejamento de 12 semanas por aluno
// Tabela "macrociclo" (uma linha por aluno, semanas_json = array)
// =====================================================================
import { useCallback, useState } from 'react'
import { supabase } from '../lib/supabase'

const SEMANAS_VAZIAS = Array.from({ length: 12 }, (_, i) => ({
  semana: i + 1,
  foco: '',
  volume: '',
  intensidade: '',
  obs: ''
}))

export function useMacrociclo() {
  const [dados, setDados] = useState(null)
  const [carregando, setCarregando] = useState(false)

  const carregar = useCallback(async (alunoId) => {
    if (!alunoId) {
      setDados(null)
      return null
    }
    setCarregando(true)
    try {
      const { data, error } = await supabase
        .from('macrociclo')
        .select('*')
        .eq('aluno_id', alunoId)
        .maybeSingle()
      if (error) {
        console.warn('[useMacrociclo] Aviso ao carregar macrociclo:', error.message)
        setDados(null)
        return null
      }
      setDados(data || null)
      return data || null
    } catch (err) {
      console.warn('[useMacrociclo] Erro inesperado ao carregar:', err)
      setDados(null)
      return null
    } finally {
      setCarregando(false)
    }
  }, [])

  const salvar = useCallback(async (alunoId, semanas) => {
    if (!alunoId) {
      throw new Error('Identificador do aluno não fornecido.')
    }
    // Higienização e validação defensiva do payload das semanas/microciclos
    const payloadSemanas = Array.isArray(semanas)
      ? semanas.map((s, idx) => ({
          semana: Number(s.semana) || idx + 1,
          foco: String(s.foco || '').trim(),
          volume: String(s.volume || '').trim(),
          intensidade: String(s.intensidade || '').trim(),
          obs: String(s.obs || '').trim()
        }))
      : []

    const agora = new Date().toISOString()
    const payloadUpsert = {
      aluno_id: alunoId,
      semanas_json: payloadSemanas,
      updated_at: agora
    }

    let { data, error } = await supabase
      .from('macrociclo')
      .upsert(payloadUpsert, { onConflict: 'aluno_id' })
      .select()
      .maybeSingle()

    // Se falhar porque a coluna updated_at não existe no schema do cliente
    if (error && (/column .*updated_at.* does not exist/i.test(error.message) || error.code === '42703')) {
      const fallbackPayload = {
        aluno_id: alunoId,
        semanas_json: payloadSemanas
      }
      const retry = await supabase
        .from('macrociclo')
        .upsert(fallbackPayload, { onConflict: 'aluno_id' })
        .select()
        .maybeSingle()
      data = retry.data
      error = retry.error
    }

    if (error) {
      // Mensagens amigáveis para orientar o gestor caso a tabela não exista ou permissão RLS
      if (error.code === '42P01' || /relation .*macrociclo.* does not exist/i.test(error.message)) {
        throw new Error('A tabela "macrociclo" não foi encontrada no banco. Execute o script schema.sql no Supabase.')
      }
      if (error.code === '42501' || /permission denied|policy/i.test(error.message)) {
        throw new Error('Permissão negada ao salvar o planejamento. Verifique as políticas RLS da tabela macrociclo.')
      }
      throw new Error(error.message || 'Erro ao persistir planejamento no banco.')
    }

    const resultadoFinal = data || { aluno_id: alunoId, semanas_json: payloadSemanas }
    setDados(resultadoFinal)
    return resultadoFinal
  }, [])

  return { dados, carregando, carregar, salvar, SEMANAS_VAZIAS }
}
