// =====================================================================
// Formulário de cadastro/edição de aluno (usado em Alunos e Financeiro)
// =====================================================================
import { useState } from 'react'
import { Button, Input, Label, Select } from './ui'
import { paraInputDate } from '../utils/format'
import { Eye, EyeOff } from 'lucide-react'

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
  const [form, setForm] = useState(
    inicial
      ? {
          ...ALUNO_VAZIO,
          ...inicial,
          plano_valor: inicial.plano_valor != null ? String(inicial.plano_valor) : '',
          data_vencimento: paraInputDate(inicial.data_vencimento),
          data_nascimento: paraInputDate(inicial.data_nascimento),
          pin: inicial.pin || ''
        }
      : ALUNO_VAZIO
  )
  const [erros, setErros] = useState({})
  const [mostrarPin, setMostrarPin] = useState(false)

  const set = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }))

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
      nome: form.nome.trim(),
      telefone: form.telefone.trim(),
      cpf: form.cpf.trim(),
      email: form.email.trim(),
      foto_url: form.foto_url.trim(),
      data_nascimento: form.data_nascimento || null,
      plano_contratado: form.plano_contratado.trim(),
      pin: form.pin.trim() || null,
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Data de Nascimento</Label>
          <Input
            type="date"
            value={form.data_nascimento}
            onChange={(e) => set('data_nascimento', e.target.value)}
          />
        </div>
        <div>
          <Label>Foto URL</Label>
          <Input
            value={form.foto_url}
            onChange={(e) => set('foto_url', e.target.value)}
            placeholder="https://..."
          />
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