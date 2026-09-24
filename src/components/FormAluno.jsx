// =====================================================================
// Formulário de cadastro/edição de aluno (usado em Alunos e Financeiro)
// =====================================================================
import { useState, useRef } from 'react'
import { Button, Input, Label, Select } from './ui'
import { paraInputDate, iniciais } from '../utils/format'
import { Eye, EyeOff, Camera, Trash2, Loader2 } from 'lucide-react'
import { uploadArquivoStorage } from '../lib/storage'
import { useToast } from './Toast'

const ALUNO_VAZIO = {
  nome: '',
  telefone: '',
  cpf: '',
  email: '',
  foto_url: '',
  data_nascimento: '',
  plano_contratado: '',
  pin: '',
  plano_valor: '',
  data_vencimento: '',
  status_pagamento: 'em_dia'
}

export default function FormAluno({ inicial = null, salvando, onSalvar, onCancelar }) {
  const { toast } = useToast()
  const inputFotoRef = useRef(null)
  const [enviandoFoto, setEnviandoFoto] = useState(false)
  const [mostrarUrlManual, setMostrarUrlManual] = useState(false)

  const [form, setForm] = useState(
    inicial
      ? {
          ...ALUNO_VAZIO,
          ...inicial,
          plano_valor: inicial.plano_valor != null ? String(inicial.plano_valor) : '',
          data_vencimento: paraInputDate(inicial.data_vencimento),
          data_nascimento: paraInputDate(inicial.data_nascimento),
          pin: inicial.pin || '',
          foto_url: inicial.foto_url || ''
        }
      : ALUNO_VAZIO
  )
  const [erros, setErros] = useState({})
  const [mostrarPin, setMostrarPin] = useState(false)

  const set = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }))

  const handleFotoSelecionada = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast('Selecione um arquivo de imagem válido (JPG, PNG, etc).', 'aviso')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast('A foto deve ter no máximo 5MB.', 'aviso')
      return
    }

    setEnviandoFoto(true)
    try {
      const url = await uploadArquivoStorage(file, {
        bucket: 'avatars',
        pasta: 'alunos',
        maxSize: 5 * 1024 * 1024
      })
      set('foto_url', url)
      toast('Foto enviada com sucesso!')
    } catch (err) {
      toast(err.message || 'Erro ao enviar foto.', 'erro')
    } finally {
      setEnviandoFoto(false)
      if (inputFotoRef.current) inputFotoRef.current.value = ''
    }
  }

  const validar = () => {
    const e = {}
    if (!form.nome.trim()) e.nome = 'Informe o nome do aluno'
    if (form.plano_valor === '' || Number(form.plano_valor) < 0)
      e.plano_valor = 'Valor inválido'
    if (form.pin && form.pin.length < 4)
      e.pin = 'O PIN deve ter pelo menos 4 dígitos'
    setErros(e)
    return Object.keys(e).length === 0
  }

  const enviar = (ev) => {
    ev.preventDefault()
    if (!validar()) return
    onSalvar({
      nome: (form.nome || '').trim(),
      telefone: (form.telefone || '').trim(),
      cpf: (form.cpf || '').trim(),
      email: (form.email || '').trim(),
      foto_url: (form.foto_url || '').trim(),
      data_nascimento: form.data_nascimento || null,
      plano_contratado: (form.plano_contratado || '').trim(),
      pin: (form.pin || '').trim() || null,
      plano_valor: Number(form.plano_valor || 0),
      data_vencimento: form.data_vencimento || null,
      status_pagamento: form.status_pagamento
    })
  }

  const campoErro = (nome) =>
    erros[nome] ? (
      <p className="mt-1 text-xs font-medium text-red-600">{erros[nome]}</p>
    ) : null

  return (
    <form onSubmit={enviar} className="space-y-4">
      <div>
        <Label>Nome completo *</Label>
        <Input
          value={form.nome}
          onChange={(e) => set('nome', e.target.value)}
          placeholder="Ex.: João da Silva"
          autoFocus
        />
        {campoErro('nome')}
      </div>

      <div>
        <Label>Email</Label>
        <Input
          type="email"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          placeholder="joao@email.com"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Telefone / WhatsApp</Label>
          <Input
            value={form.telefone}
            onChange={(e) => set('telefone', e.target.value)}
            placeholder="(11) 99999-9999"
            inputMode="tel"
          />
        </div>
        <div>
          <Label>CPF (acesso do aluno)</Label>
          <Input
            value={form.cpf}
            onChange={(e) => set('cpf', e.target.value)}
            placeholder="123.456.789-00"
            inputMode="numeric"
          />
        </div>
      </div>

      <div>
        <Label>Data de Nascimento</Label>
        <Input
          type="date"
          value={form.data_nascimento}
          onChange={(e) => set('data_nascimento', e.target.value)}
        />
      </div>

      {/* Foto de Perfil */}
      <div>
        <Label>Foto de Perfil</Label>
        <div className="mt-1.5 flex flex-wrap items-center gap-4 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="relative shrink-0">
            {form.foto_url ? (
              <img
                src={form.foto_url}
                alt={form.nome || 'Foto'}
                className="h-16 w-16 rounded-full object-cover border-2 border-primary-500 shadow-sm"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-200 text-base font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700">
                {form.nome ? iniciais(form.nome) : <Camera className="h-6 w-6 text-zinc-400" />}
              </div>
            )}
            {enviandoFoto && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 text-white">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={inputFotoRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFotoSelecionada}
              />
              <Button
                type="button"
                variante="secundario"
                onClick={() => inputFotoRef.current?.click()}
                disabled={enviandoFoto}
                className="text-xs"
              >
                {enviandoFoto ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Enviando foto...
                  </>
                ) : (
                  <>
                    <Camera className="mr-1.5 h-3.5 w-3.5" />
                    {form.foto_url ? 'Alterar foto' : 'Enviar foto'}
                  </>
                )}
              </Button>

              {form.foto_url && (
                <button
                  type="button"
                  onClick={() => set('foto_url', '')}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50 transition"
                  title="Remover foto"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remover
                </button>
              )}

              <button
                type="button"
                onClick={() => setMostrarUrlManual(!mostrarUrlManual)}
                className="ml-auto text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 underline"
              >
                {mostrarUrlManual ? 'Ocultar link direto' : 'Inserir link da imagem'}
              </button>
            </div>

            <p className="text-[11px] text-zinc-400">
              Formatos aceitos: JPG, PNG, WEBP (máx. 5MB).
            </p>

            {mostrarUrlManual && (
              <Input
                value={form.foto_url}
                onChange={(e) => set('foto_url', e.target.value)}
                placeholder="https://exemplo.com/foto.jpg"
                className="text-xs mt-1"
              />
            )}
          </div>
        </div>
      </div>

      <div>
        <Label>PIN de Acesso (Portal do Aluno)</Label>
        <div className="relative">
          <Input
            type={mostrarPin ? 'text' : 'password'}
            value={form.pin}
            onChange={(e) => set('pin', e.target.value.replace(/\D/g, '').slice(0, 8))}
            placeholder="Mínimo 4 dígitos (opcional)"
            inputMode="numeric"
            maxLength={8}
            className="pr-9"
          />
          <button
            type="button"
            onClick={() => setMostrarPin(!mostrarPin)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-zinc-600 dark:hover:text-zinc-300"
            tabIndex={-1}
          >
            {mostrarPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className="mt-1 text-xs text-zinc-400">
          O aluno usará este PIN para acessar o Portal. Se deixar em branco, o acesso será direto.
        </p>
        {campoErro('pin')}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Plano Contratado</Label>
          <Input
            value={form.plano_contratado}
            onChange={(e) => set('plano_contratado', e.target.value)}
            placeholder="Ex.: Mensal, Trimestral, VIP"
          />
        </div>
        <div>
          <Label>Valor da mensalidade (R$)</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={form.plano_valor}
            onChange={(e) => set('plano_valor', e.target.value)}
            placeholder="0,00"
          />
          {campoErro('plano_valor')}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Data de vencimento</Label>
          <Input
            type="date"
            value={form.data_vencimento}
            onChange={(e) => set('data_vencimento', e.target.value)}
          />
        </div>
        <div>
          <Label>Status de pagamento</Label>
          <Select
            value={form.status_pagamento}
            onChange={(e) => set('status_pagamento', e.target.value)}
          >
            <option value="em_dia">Em dia</option>
            <option value="vencendo">Vencendo</option>
            <option value="inadimplente">Inadimplente</option>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variante="secundario" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit" carregando={salvando}>
          {inicial ? 'Salvar alterações' : 'Cadastrar aluno'}
        </Button>
      </div>
    </form>
  )
}