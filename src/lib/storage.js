// =====================================================================
// Helper de Upload para o Supabase Storage
// Tenta upload no bucket especificado ('branding' por padrão, com fallback
// para 'assets'). Retorna a URL pública do arquivo enviado.
// =====================================================================
import { supabase, isSupabaseConfigured } from './supabase'

/**
 * Faz upload de um arquivo para o Supabase Storage e retorna a URL pública gerada.
 * @param {File} file - Objeto File selecionado no input
 * @param {Object} options - Opções adicionais
 * @param {string} [options.bucket='branding'] - Bucket preferencial
 * @param {string} [options.pasta='branding'] - Subpasta dentro do bucket
 * @returns {Promise<string>} URL pública da imagem
 */
export async function uploadArquivoStorage(file, options = {}) {
  const { bucket = 'branding', pasta = 'branding' } = options

  if (!isSupabaseConfigured) {
    throw new Error(
      'O Supabase não está configurado com credenciais válidas. Insira a URL da imagem manualmente.'
    )
  }

  if (!file) {
    throw new Error('Nenhum arquivo selecionado para upload.')
  }

  // Validação básica de tamanho (ex: max 10MB)
  const MAX_SIZE = 10 * 1024 * 1024
  if (file.size > MAX_SIZE) {
    throw new Error('O arquivo excede o tamanho máximo permitido de 10MB.')
  }

  // Gera nome único seguro
  const extensao = file.name.split('.').pop()?.toLowerCase() || 'png'
  const nomeLimpo = file.name
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 30)
  const caminho = `${pasta}/${Date.now()}_${nomeLimpo}.${extensao}`

  // Lista de buckets para tentar (bucket solicitado primeiro, depois 'assets')
  const bucketsTentativa = [bucket, 'assets'].filter(
    (b, idx, arr) => arr.indexOf(b) === idx
  )

  let ultimoErro = null

  for (const b of bucketsTentativa) {
    try {
      const { data, error } = await supabase.storage.from(b).upload(caminho, file, {
        cacheControl: '31536000',
        upsert: true
      })

      if (error) {
        ultimoErro = error
        continue
      }

      // Upload realizado com sucesso! Obtém a URL pública
      const { data: publicUrlData } = supabase.storage.from(b).getPublicUrl(caminho)
      if (publicUrlData?.publicUrl) {
        return publicUrlData.publicUrl
      }
    } catch (err) {
      ultimoErro = err
    }
  }

  // Se falhou em todas as tentativas
  console.warn('[Supabase Storage] Falha ao enviar para os buckets:', ultimoErro)
  const mensagemErro =
    ultimoErro?.message?.includes('not found') || ultimoErro?.message?.includes('Bucket')
      ? `Bucket "${bucket}" não encontrado no Supabase Storage. Crie o bucket com acesso público no painel do Supabase ou insira a URL manualmente.`
      : ultimoErro?.message || 'Erro ao enviar imagem para o Supabase Storage. Verifique se o bucket é público ou use uma URL externa.'

  throw new Error(mensagemErro)
}
