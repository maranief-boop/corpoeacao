// =====================================================================
// Configurações — Identidade Visual White-Label Completa
// - Logotipo, Fundo do Portal do Aluno e Favicon (Upload Supabase + URL)
// - Cores Primária e Secundária, Estilo de Cards (Sólido vs Glassmorphism)
// - Contato (WhatsApp, Instagram, Endereço Físico)
// - Pré-visualização em tempo real interativa e responsiva
// =====================================================================
import { useState, useRef } from 'react'
import {
  Building2,
  Image as ImageIcon,
  Palette,
  Save,
  Rocket,
  Upload,
  Phone,
  Instagram,
  MapPin,
  Sparkles,
  Layers,
  Check,
  Copy,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Smartphone,
  Eye,
  Star,
  Globe
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useToast } from '../components/Toast'
import { Button, Card, Input, Label } from '../components/ui'
import { uploadArquivoStorage } from '../lib/storage'
import fundoPadrao from '../assets/fundo.png'

// Componente para campo de URL com botão integrado de Upload para o Supabase Storage
function CampoUploadImagem({
  rotulo,
  icone: Icone,
  descricao,
  valorUrl,
  onChangeUrl,
  placeholder,
  pastaStorage = 'branding',
  tipoPreview = 'logo',
  toast
}) {
  const [fazendoUpload, setFazendoUpload] = useState(false)
  const inputRef = useRef(null)

  const aoSelecionarArquivo = async (ev) => {
    const file = ev.target.files?.[0]
    if (!file) return

    setFazendoUpload(true)
    try {
      const urlPublica = await uploadArquivoStorage(file, {
        bucket: 'branding',
        pasta: pastaStorage
      })
      onChangeUrl(urlPublica)
      toast('Upload concluído com sucesso!')
    } catch (err) {
      toast(
        err.message ||
          'Falha no upload. Você pode manter ou digitar a URL da imagem manualmente.',
        'aviso'
      )
    } finally {
      setFazendoUpload(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-1.5 mb-0">
          <Icone className="h-3.5 w-3.5 text-primary-500" /> {rotulo}
        </Label>
        {valorUrl && (
          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <Check className="h-3 w-3" /> Imagem vinculada
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {/* Input de URL manual */}
        <div className="relative flex-1">
          <Input
            value={valorUrl}
            onChange={(e) => onChangeUrl(e.target.value)}
            placeholder={placeholder}
            inputMode="url"
            className="pr-8"
          />
          {valorUrl && (
            <button
              type="button"
              onClick={() => onChangeUrl('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              title="Limpar campo"
            >
              ✕
            </button>
          )}
        </div>

        {/* Botão de Upload para Supabase Storage */}
        <div className="shrink-0">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
            onChange={aoSelecionarArquivo}
            className="hidden"
          />
          <Button
            type="button"
            variante="secundario"
            disabled={fazendoUpload}
            onClick={() => inputRef.current?.click()}
            className="w-full sm:w-auto text-xs"
          >
            {fazendoUpload ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary-500" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="h-3.5 w-3.5" />
                Upload Arquivo
              </>
            )}
          </Button>
        </div>
      </div>

      {descricao && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{descricao}</p>
      )}

      {/* Miniatura do preview */}
      {valorUrl && (
        <div className="mt-2 flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-800 dark:bg-zinc-900/60">
          <div
            className={`overflow-hidden rounded-lg border border-zinc-300 bg-zinc-800/10 dark:border-zinc-700 ${
              tipoPreview === 'fundo'
                ? 'h-14 w-28'
                : tipoPreview === 'favicon'
                  ? 'h-9 w-9'
                  : 'h-11 w-11'
            }`}
          >
            <img
              src={valorUrl}
              alt="Preview"
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-mono text-zinc-500 dark:text-zinc-400">
              {valorUrl}
            </p>
            <a
              href={valorUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-600 hover:underline dark:text-primary-400"
            >
              Abrir imagem em nova aba <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Configuracoes() {
  const { config, atualizarConfig } = useApp()
  const { toast } = useToast()

  const [form, setForm] = useState({
    nome_academia: config.nome_academia || 'Academia Corpo & Ação Feminina',
    logo_url: config.logo_url || '',
    fundo_portal_url: config.fundo_portal_url || '',
    favicon_url: config.favicon_url || '',
    cor_primaria: config.cor_primaria || '#DC2626',
    cor_secundaria: config.cor_secundaria || '#2563EB',
    cor_card: config.cor_card || 'rgba(24, 24, 27, 0.94)',
    card_bg_style: config.card_bg_style || 'solid',
    whatsapp: config.whatsapp || '(18) 98109-3334',
    instagram: config.instagram || '@academia.corpoeacao',
    endereco: config.endereco || 'R. Rui Barbosa, 603 - Centro, Mirandópolis - SP',
    google_place_id: config.google_place_id || 'ChIJYa6MwVUnl5QRk0jTuflOcsA',
    google_review_url: config.google_review_url || 'https://search.google.com/local/writereview?placeid=ChIJYa6MwVUnl5QRk0jTuflOcsA',
    google_widget_code: config.google_widget_code || '980e151f-0c72-4906-be89-6763986af7eb'
  })

  const [salvando, setSalvando] = useState(false)
  const [copiadoSql, setCopiadoSql] = useState(false)
  const [abaAtiva, setAbaAtiva] = useState('visual') // 'visual' | 'google' | 'contato' | 'banco'

  const set = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }))

  const salvar = async (ev) => {
    ev.preventDefault()
    if (!form.nome_academia.trim()) {
      toast('Informe o nome da academia.', 'aviso')
      return
    }

    setSalvando(true)
    try {
      await atualizarConfig({
        nome_academia: form.nome_academia.trim(),
        logo_url: form.logo_url.trim(),
        fundo_portal_url: form.fundo_portal_url.trim(),
        favicon_url: form.favicon_url.trim(),
        cor_primaria: form.cor_primaria,
        cor_secundaria: form.cor_secundaria,
        cor_card: form.cor_card,
        card_bg_style: form.card_bg_style,
        whatsapp: form.whatsapp.trim(),
        instagram: form.instagram.trim(),
        endereco: form.endereco.trim(),
        google_place_id: form.google_place_id.trim(),
        google_review_url: form.google_review_url.trim(),
        google_widget_code: form.google_widget_code
      })
      toast('Configurações salvas e aplicadas em tempo real!')
    } catch (e) {
      toast(e.message || 'Erro ao salvar configurações.', 'erro')
    } finally {
      setSalvando(false)
    }
  }

  const comandoSql = `-- Execute no SQL Editor do Supabase se ainda não rodou a migração:
ALTER TABLE public.configuracoes 
  ADD COLUMN IF NOT EXISTS cor_primaria text DEFAULT '#DC2626',
  ADD COLUMN IF NOT EXISTS cor_secundaria text DEFAULT '#2563EB',
  ADD COLUMN IF NOT EXISTS cor_card text DEFAULT 'rgba(24, 24, 27, 0.94)',
  ADD COLUMN IF NOT EXISTS card_bg_style text DEFAULT 'solid',
  ADD COLUMN IF NOT EXISTS fundo_portal_url text,
  ADD COLUMN IF NOT EXISTS favicon_url text,
  ADD COLUMN IF NOT EXISTS whatsapp text DEFAULT '(18) 98109-3334',
  ADD COLUMN IF NOT EXISTS instagram text DEFAULT '@academia.corpoeacao',
  ADD COLUMN IF NOT EXISTS endereco text DEFAULT 'R. Rui Barbosa, 603 - Centro, Mirandópolis - SP',
  ADD COLUMN IF NOT EXISTS google_place_id text DEFAULT 'ChIJYa6MwVUnl5QRk0jTuflOcsA',
  ADD COLUMN IF NOT EXISTS google_review_url text DEFAULT 'https://search.google.com/local/writereview?placeid=ChIJYa6MwVUnl5QRk0jTuflOcsA',
  ADD COLUMN IF NOT EXISTS google_widget_code text DEFAULT '980e151f-0c72-4906-be89-6763986af7eb';

-- Storage: garante o bucket 'branding' público
INSERT INTO storage.buckets (id, name, public)
VALUES ('branding', 'branding', true)
ON CONFLICT (id) DO NOTHING;`

  const copiarSql = () => {
    navigator.clipboard.writeText(comandoSql)
    setCopiadoSql(true)
    toast('Comando SQL copiado para a área de transferência!')
    setTimeout(() => setCopiadoSql(false), 2500)
  }

  // Visualização do estilo de card
  const estiloCardPreview =
    form.card_bg_style === 'glass'
      ? {
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(16px)',
          borderColor: 'rgba(255, 255, 255, 0.15)'
        }
      : {
          backgroundColor: form.cor_card || 'rgba(24, 24, 27, 0.94)',
          borderColor: 'rgba(63, 63, 70, 0.6)'
        }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* ---------- Cabeçalho da Página ---------- */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary-500" />
            Configurações White-Label
          </h1>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            Personalize a marca, paleta de cores, imagens e canais de contato da academia.
          </p>
        </div>

        {/* Alternador de abas rápidas */}
        <div className="flex flex-wrap rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800 self-start sm:self-auto gap-1">
          <button
            type="button"
            onClick={() => setAbaAtiva('visual')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              abaAtiva === 'visual'
                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            Marca & Cores
          </button>
          <button
            type="button"
            onClick={() => setAbaAtiva('google')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              abaAtiva === 'google'
                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            Google & Avaliações
          </button>
          <button
            type="button"
            onClick={() => setAbaAtiva('contato')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              abaAtiva === 'contato'
                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            Contato & Redes
          </button>
          <button
            type="button"
            onClick={() => setAbaAtiva('banco')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              abaAtiva === 'banco'
                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            Banco & SQL
          </button>
        </div>
      </div>

      {/* ---------- Pré-visualização Interativa em Tempo Real ---------- */}
      <Card className="overflow-hidden border border-zinc-200 shadow-xl dark:border-zinc-800">
        <div className="border-b border-zinc-200 bg-zinc-50/80 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/80 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Eye className="h-4 w-4 text-primary-500" /> Pré-visualização em Tempo Real
          </span>
          <span className="text-[11px] font-normal normal-case text-zinc-400">
            Atualiza dinamicamente conforme você digita
          </span>
        </div>

        {/* Topo simulado com Cor Primária */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-white transition-colors duration-300"
          style={{ backgroundColor: form.cor_primaria }}
        >
          <div className="flex items-center gap-3">
            {form.logo_url ? (
              <img
                src={form.logo_url}
                alt="Logo"
                className="h-12 w-12 rounded-xl bg-white/20 object-cover ring-2 ring-white/40 shadow-md"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/25 text-2xl font-black ring-2 ring-white/40 shadow-md">
                {(form.nome_academia || 'A')[0].toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-xl font-black tracking-tight drop-shadow-sm">
                {form.nome_academia || 'Nome da Academia'}
              </p>
              <p className="text-xs opacity-90 font-medium">
                Portal do Aluno & Site Oficial
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="rounded-full px-3 py-1 text-xs font-bold text-white shadow-sm ring-1 ring-white/30"
              style={{ backgroundColor: form.cor_secundaria }}
            >
              Badge Destaque
            </span>
          </div>
        </div>

        {/* Simulação do Portal do Aluno com Imagem de Fundo e Card */}
        <div className="relative overflow-hidden p-6 bg-zinc-950 min-h-[220px] flex items-center justify-center">
          {/* Fundo simulado */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 blur-[2px]"
            style={{
              backgroundImage: `url(${form.fundo_portal_url || fundoPadrao})`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60" />

          {/* Card Simulado do Aluno */}
          <div
            className="relative z-10 w-full max-w-sm rounded-3xl border p-5 shadow-2xl transition-all duration-300"
            style={estiloCardPreview}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Card do Aluno ({form.card_bg_style === 'glass' ? 'Glassmorphism' : 'Escuro Sólido'})
              </span>
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: form.cor_secundaria }}
                title="Status / Destaque"
              />
            </div>
            <p className="text-2xl font-black text-white">Treino de Hoje: Peito & Bíceps</p>
            <p className="text-xs font-medium text-zinc-400 mt-1">
              4 exercícios · descanso 60s
            </p>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-xl py-2.5 text-xs font-black text-white shadow-lg transition-transform active:scale-95"
                style={{ backgroundColor: form.cor_primaria }}
              >
                Iniciar Treino
              </button>
              <button
                type="button"
                className="rounded-xl px-3 py-2.5 text-xs font-bold text-white border border-white/20 transition-all hover:bg-white/10"
                style={{ backgroundColor: form.cor_secundaria }}
              >
                Detalhes
              </button>
            </div>
          </div>
        </div>

        {/* Faixa de canais de contato e endereço simulado */}
        <div className="border-t border-zinc-200 bg-zinc-50 px-5 py-3 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 font-medium">
              <Phone className="h-3.5 w-3.5 text-emerald-500" /> {form.whatsapp || '(Não informado)'}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Instagram className="h-3.5 w-3.5 text-pink-500" /> {form.instagram || '(Não informado)'}
            </span>
          </div>
          <span className="flex items-center gap-1.5 truncate font-medium text-zinc-500">
            <MapPin className="h-3.5 w-3.5 text-primary-500 shrink-0" /> {form.endereco || '(Não informado)'}
          </span>
        </div>
      </Card>

      {/* ---------- Formulário Principal ---------- */}
      <form onSubmit={salvar} className="space-y-6">
        {/* ABA: MARCA & CORES */}
        {abaAtiva === 'visual' && (
          <div className="space-y-6">
            {/* Bloco 1: Identidade Básica e Nome */}
            <Card className="p-6 space-y-5">
              <div className="border-b border-zinc-200 pb-3 dark:border-zinc-800">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary-500" /> Identidade da Empresa
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Nome principal exibido nos cabeçalhos, títulos e recibos.
                </p>
              </div>

              <div>
                <Label>Nome da Academia</Label>
                <Input
                  value={form.nome_academia}
                  onChange={(e) => set('nome_academia', e.target.value)}
                  placeholder="Ex.: Academia Corpo e Ação"
                  required
                />
              </div>
            </Card>

            {/* Bloco 2: Uploads de Mídia (Supabase Storage) */}
            <Card className="p-6 space-y-6">
              <div className="border-b border-zinc-200 pb-3 dark:border-zinc-800">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-primary-500" /> Imagens e Logotipos (Supabase Storage)
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Envie seus arquivos diretamente para o Supabase ou cole uma URL externa.
                </p>
              </div>

              {/* Logotipo */}
              <CampoUploadImagem
                rotulo="Logotipo Principal"
                icone={ImageIcon}
                descricao="Exibido na barra superior do sistema, login e cabeçalho do portal."
                valorUrl={form.logo_url}
                onChangeUrl={(url) => set('logo_url', url)}
                placeholder="https://.../logo.png ou selecione um arquivo"
                pastaStorage="logos"
                tipoPreview="logo"
                toast={toast}
              />

              <div className="border-t border-zinc-100 pt-5 dark:border-zinc-800/80">
                {/* Imagem de Fundo do Portal do Aluno */}
                <CampoUploadImagem
                  rotulo="Imagem de Fundo do Portal do Aluno"
                  icone={Smartphone}
                  descricao="Foto de alta qualidade do ambiente da academia que ficará no plano de fundo do Portal do Aluno."
                  valorUrl={form.fundo_portal_url}
                  onChangeUrl={(url) => set('fundo_portal_url', url)}
                  placeholder="https://.../foto-ambiente.jpg ou selecione um arquivo"
                  pastaStorage="fundos"
                  tipoPreview="fundo"
                  toast={toast}
                />
              </div>

              <div className="border-t border-zinc-100 pt-5 dark:border-zinc-800/80">
                {/* Favicon / Ícone do App */}
                <CampoUploadImagem
                  rotulo="Ícone do App / Favicon (PWA)"
                  icone={Sparkles}
                  descricao="Ícone quadrado (32x32 até 512x512) exibido na aba do navegador e no ícone do app instalado no celular."
                  valorUrl={form.favicon_url}
                  onChangeUrl={(url) => set('favicon_url', url)}
                  placeholder="https://.../favicon.png ou selecione um arquivo"
                  pastaStorage="favicons"
                  tipoPreview="favicon"
                  toast={toast}
                />
              </div>
            </Card>

            {/* Bloco 3: Cores e Estilo dos Cards */}
            <Card className="p-6 space-y-6">
              <div className="border-b border-zinc-200 pb-3 dark:border-zinc-800">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Palette className="h-4 w-4 text-primary-500" /> Paleta de Cores e Estilização
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Defina a harmonia visual aplicada em botões, ícones e cartões.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {/* Cor Primária */}
                <div>
                  <Label className="flex items-center gap-1.5">
                    <Palette className="h-3.5 w-3.5 text-primary-500" /> Cor Primária
                  </Label>
                  <p className="text-xs text-zinc-500 mb-2">
                    Botões principais, barras e destaques do sistema.
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={form.cor_primaria}
                      onChange={(e) => set('cor_primaria', e.target.value)}
                      className="h-10 w-14 cursor-pointer rounded-lg border border-zinc-300 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-800"
                    />
                    <Input
                      value={form.cor_primaria}
                      onChange={(e) => set('cor_primaria', e.target.value)}
                      className="font-mono uppercase"
                    />
                  </div>
                </div>

                {/* Cor Secundária */}
                <div>
                  <Label className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-500" /> Cor Secundária / Acento
                  </Label>
                  <p className="text-xs text-zinc-500 mb-2">
                    Badges de status, botões secundários e contornos.
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={form.cor_secundaria}
                      onChange={(e) => set('cor_secundaria', e.target.value)}
                      className="h-10 w-14 cursor-pointer rounded-lg border border-zinc-300 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-800"
                    />
                    <Input
                      value={form.cor_secundaria}
                      onChange={(e) => set('cor_secundaria', e.target.value)}
                      className="font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Estilo dos Cards do Portal do Aluno */}
              <div className="border-t border-zinc-100 pt-5 dark:border-zinc-800">
                <Label className="flex items-center gap-1.5 mb-2">
                  <Layers className="h-3.5 w-3.5 text-primary-500" /> Estilo Visual dos Cards do Aluno
                </Label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => set('card_bg_style', 'solid')}
                    className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
                      form.card_bg_style === 'solid'
                        ? 'border-primary-500 bg-primary-50/40 ring-2 ring-primary-500/20 dark:border-primary-500 dark:bg-primary-950/20'
                        : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-primary-500">
                      {form.card_bg_style === 'solid' && (
                        <div className="h-2 w-2 rounded-full bg-primary-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        Escuro Sólido (Recomendado)
                      </p>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        Fundo escuro profundo (#18181b / 94% opacidade) que garante leitura e nitidez absolutas dos textos brancos contra a foto de fundo.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => set('card_bg_style', 'glass')}
                    className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
                      form.card_bg_style === 'glass'
                        ? 'border-primary-500 bg-primary-50/40 ring-2 ring-primary-500/20 dark:border-primary-500 dark:bg-primary-950/20'
                        : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-primary-500">
                      {form.card_bg_style === 'glass' && (
                        <div className="h-2 w-2 rounded-full bg-primary-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        Glassmorphism Vitrificado
                      </p>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        Fundo semitransparente com forte desfoque ('backdrop-blur-xl') e borda refinada translúcida, exibindo a foto ao fundo com efeito vidro.
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ABA: INTEGRAÇÃO GOOGLE & AVALIAÇÕES */}
        {abaAtiva === 'google' && (
          <div className="space-y-6">
            <Card className="p-6 space-y-6">
              <div className="border-b border-zinc-200 pb-3 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    Integração Google & Avaliações (Google Meu Negócio)
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Conecte a ficha oficial do Google para captar avaliações 5 estrelas das alunas no Site e no Portal do Aluno.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 ring-1 ring-emerald-500/20">
                    <Check className="h-3 w-3" /> Verificado no Google
                  </span>
                </div>
              </div>

              {/* Place ID e Link Direto */}
              <div className="space-y-5">
                <div>
                  <Label className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-primary-500" /> Google Place ID
                  </Label>
                  <Input
                    value={form.google_place_id}
                    onChange={(e) => set('google_place_id', e.target.value)}
                    placeholder="Ex.: ChIJYa6MwVUnl5QRk0jTuflOcsA"
                    className="font-mono text-xs"
                  />
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Identificador único do estabelecimento no Google Maps / Meu Negócio (Place ID padrão: <span className="font-mono text-zinc-700 dark:text-zinc-300">ChIJYa6MwVUnl5QRk0jTuflOcsA</span>).
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label className="flex items-center gap-1.5 mb-0">
                      <ExternalLink className="h-3.5 w-3.5 text-primary-500" /> Link de Avaliação Direta (Google Review URL)
                    </Label>
                    {form.google_review_url && (
                      <a
                        href={form.google_review_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-600 hover:underline dark:text-primary-400"
                      >
                        Testar link direto <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                  <Input
                    value={form.google_review_url}
                    onChange={(e) => set('google_review_url', e.target.value)}
                    placeholder="https://search.google.com/local/writereview?placeid=..."
                    inputMode="url"
                  />
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Link oficial que abre a tela de 5 estrelas e depoimento do Google em 1 clique para a aluna.
                  </p>
                </div>

                <div className="border-t border-zinc-100 pt-5 dark:border-zinc-800">
                  <div className="flex items-center justify-between mb-1">
                    <Label className="flex items-center gap-1.5 mb-0">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Código do Widget de Avaliações / Widget ID (Elfsight)
                    </Label>
                    <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                      ID Oficial: 980e151f-0c72-4906-be89-6763986af7eb
                    </span>
                  </div>
                  <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Informe o ID do widget da Elfsight (<code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-primary-600 dark:bg-zinc-800 dark:text-primary-400">980e151f-0c72-4906-be89-6763986af7eb</code>) ou cole o código embed completo gerado na plataforma Elfsight. O sistema renderiza o widget oficial de Avaliações do Google no Site Institucional.
                  </p>
                  <textarea
                    rows={4}
                    value={form.google_widget_code}
                    onChange={(e) => set('google_widget_code', e.target.value)}
                    placeholder="980e151f-0c72-4906-be89-6763986af7eb ou cole o script embed da Elfsight"
                    className="w-full rounded-xl border border-zinc-300 bg-white p-3 font-mono text-xs text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                  />
                </div>
              </div>
            </Card>

            {/* Destaque Informativo dos Benefícios */}
            <div className="rounded-2xl border border-blue-200/70 bg-blue-50/50 p-5 dark:border-blue-900/50 dark:bg-blue-950/20">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Star className="h-5 w-5 fill-current" />
                </div>
                <div className="space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
                  <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    Como funciona nos canais da academia?
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-zinc-600 dark:text-zinc-400">
                    <li>
                      <strong className="text-zinc-800 dark:text-zinc-200">Site Institucional:</strong> exibe a seção de Depoimentos com nota 5.0, selo oficial do Google e o botão para novas alunas e visitantes avaliarem diretamente.
                    </li>
                    <li>
                      <strong className="text-zinc-800 dark:text-zinc-200">Portal do Aluno:</strong> exibe um card convidativo com estrelas douradas para estimular alunas ativas a deixarem feedbacks 5 estrelas no Google, com opção de dispensa resiliente.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA: CONTATO & REDES SOCIAIS */}
        {abaAtiva === 'contato' && (
          <Card className="p-6 space-y-6">
            <div className="border-b border-zinc-200 pb-3 dark:border-zinc-800">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary-500" /> Canais de Atendimento e Redes Sociais
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Essas informações aparecem no rodapé do Portal do Aluno e no Site Institucional.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-emerald-500" /> WhatsApp / Telefone
                </Label>
                <Input
                  value={form.whatsapp}
                  onChange={(e) => set('whatsapp', e.target.value)}
                  placeholder="Ex.: (18) 98109-3334"
                  inputMode="tel"
                />
                <p className="mt-1 text-xs text-zinc-400">
                  Utilizado para botão de atendimento direto no portal e site.
                </p>
              </div>

              <div>
                <Label className="flex items-center gap-1.5">
                  <Instagram className="h-3.5 w-3.5 text-pink-500" /> Perfil do Instagram
                </Label>
                <Input
                  value={form.instagram}
                  onChange={(e) => set('instagram', e.target.value)}
                  placeholder="Ex.: @academia.corpoeacao"
                />
                <p className="mt-1 text-xs text-zinc-400">
                  Nome do perfil ou link completo do Instagram.
                </p>
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary-500" /> Endereço Físico Completo
              </Label>
              <Input
                value={form.endereco}
                onChange={(e) => set('endereco', e.target.value)}
                placeholder="Ex.: R. Rui Barbosa, 603, Centro, Mirandópolis - SP"
              />
              <p className="mt-1 text-xs text-zinc-400">
                Endereço exibido no rodapé para localização dos alunos.
              </p>
            </div>
          </Card>
        )}

        {/* ABA: BANCO & SQL */}
        {abaAtiva === 'banco' && (
          <Card className="p-6 space-y-5">
            <div className="border-b border-zinc-200 pb-3 dark:border-zinc-800">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Rocket className="h-4 w-4 text-primary-500" /> Sincronização do Banco de Dados Supabase
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Se as novas colunas ainda não existirem no Supabase, execute o comando abaixo no SQL Editor.
              </p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800 dark:text-amber-200 space-y-1">
                  <p className="font-bold">O aplicativo salva as configurações mesmo se o SQL ainda não foi executado.</p>
                  <p>
                    O sistema utiliza salvamento defensivo no navegador (cache) e tenta gravar no Supabase. Para sincronizar entre todos os gestores e dispositivos permanentemente, execute o script SQL a seguir.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <pre className="overflow-x-auto rounded-2xl bg-zinc-950 p-4 text-xs font-mono text-zinc-200 leading-relaxed border border-zinc-800">
                {comandoSql}
              </pre>
              <Button
                type="button"
                variante="secundario"
                onClick={copiarSql}
                className="absolute right-3 top-3 text-xs"
              >
                {copiadoSql ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copiar SQL
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* Botão de Salvar Fixo / Final */}
        <div className="flex items-center justify-between border-t border-zinc-200 pt-5 dark:border-zinc-800">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            As alterações são refletidas instantaneamente em toda a aplicação.
          </p>
          <Button type="submit" carregando={salvando} tamanho="lg">
            <Save className="h-4 w-4" />
            Salvar Configurações
          </Button>
        </div>
      </form>
    </div>
  )
}