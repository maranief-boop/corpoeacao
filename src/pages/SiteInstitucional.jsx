// =====================================================================
// Site Institucional (port para React do index.html do módulo Site/CRM)
// O formulário de captura de leads agora grava no SUPABASE (tabela
// "leads") — mesma instância do sistema — em vez do Firestore.
// =====================================================================
import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Dumbbell,
  Flame,
  Users,
  GraduationCap,
  Snowflake,
  Settings,
  HeartPulse,
  Star,
  MapPin,
  Phone,
  Calculator,
  CheckCircle2,
  ArrowDown,
  Menu,
  X,
  MessageCircle,
  Instagram,
  Facebook,
  Youtube,
  Clapperboard,
  CalendarDays,
  Clock,
  Loader2,
  ExternalLink
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useLeads } from '../hooks/useLeads'
import { useToast } from '../components/Toast'
import { useApp } from '../context/AppContext'
import { abrirWhatsApp } from '../utils/whatsapp'
import { dataParaInput } from '../utils/format'
import fundoAcademia from '../assets/fundo.png'
import logoAcademia from '../assets/logo.png'

const HORARIOS = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']

const NAV = [
  { id: 'modalidades', rotulo: 'Modalidades' },
  { id: 'estrutura', rotulo: 'Estrutura' },
  { id: 'depoimentos', rotulo: 'Avaliações' },
  { id: 'calculadora', rotulo: 'IMC' }
]

function rolarPara(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

function GoogleIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z" />
      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
    </svg>
  )
}

function EstrelasGoogle({ tamanho = 'h-4 w-4' }) {
  return (
    <div className="flex gap-1 text-amber-400">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${tamanho} fill-amber-400`} />
      ))}
    </div>
  )
}

function ElfsightGoogleReviews({ widgetId }) {
  useEffect(() => {
    const scriptId = 'elfsight-platform-script'
    let script = document.getElementById(scriptId)

    if (!script) {
      script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://elfsightcdn.com/platform.js'
      script.async = true
      document.body.appendChild(script)
    } else {
      // Se o script já está no documento (navegação SPA), aciona re-inicialização
      try {
        if (window.eapps && typeof window.eapps.init === 'function') {
          window.eapps.init()
        }
      } catch (err) {
        // silencioso
      }
    }
  }, [widgetId])

  // Extrai o ID limpo (suporta o ID direto ou extrai da classe elfsight-app-...)
  const idLimpo =
    (widgetId || '980e151f-0c72-4906-be89-6763986af7eb')
      .toString()
      .match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i)?.[0] ||
    '980e151f-0c72-4906-be89-6763986af7eb'

  return (
    <div className="w-full min-h-[160px] flex justify-center">
      <div
        key={idLimpo}
        className={`elfsight-app-${idLimpo}`}
        data-elfsight-app-lazy
      />
    </div>
  )
}

export default function SiteInstitucional() {
  const { criar } = useLeads()
  const { toast } = useToast()
  const { config } = useApp()
  const nomeAcademia = config.nome_academia || 'Academia Corpo & Ação Feminina'
  const corPrimaria = config.cor_primaria || '#DC2626'
  const corSecundaria = config.cor_secundaria || '#2563EB'
  const googleReviewUrl =
    config.google_review_url ||
    'https://search.google.com/local/writereview?placeid=ChIJYa6MwVUnl5QRk0jTuflOcsA'
  const googleWidgetCode = config.google_widget_code || ''

  const [menuAberto, setMenuAberto] = useState(false)
  const [modalLead, setModalLead] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [data, setData] = useState('')
  const [horario, setHorario] = useState('')

  const [altura, setAltura] = useState(175)
  const [peso, setPeso] = useState(80)
  const [idade, setIdade] = useState(30)
  const [resultadoImc, setResultadoImc] = useState(null)

  // Horários ocupados na data selecionada
  const [horariosOcupados, setHorariosOcupados] = useState([])
  const [carregandoHorarios, setCarregandoHorarios] = useState(false)

  const hoje = dataParaInput(new Date())

  // Busca horários já agendados quando a data muda
  const carregarHorariosOcupados = useCallback(async (dataSelecionada) => {
    if (!dataSelecionada) {
      setHorariosOcupados([])
      return
    }
    setCarregandoHorarios(true)
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('horario_preferido')
        .eq('data_preferida', dataSelecionada)
        .not('horario_preferido', 'is', null)
      if (!error && data) {
        setHorariosOcupados(data.map((l) => l.horario_preferido).filter(Boolean))
      }
    } catch {
      // ignora erro
    } finally {
      setCarregandoHorarios(false)
    }
  }, [])

  useEffect(() => {
    carregarHorariosOcupados(data)
  }, [data, carregarHorariosOcupados])

  const abrirLead = () => {
    setMenuAberto(false)
    setModalLead(true)
  }

  const enviarLead = async (evento) => {
    evento.preventDefault()
    if (!nome.trim()) return toast('Informe seu nome', 'aviso')
    if (!telefone.trim()) return toast('Informe seu WhatsApp', 'aviso')
    if (data && horario && horariosOcupados.includes(horario)) {
      return toast('Este horário já está ocupado. Escolha outro.', 'aviso')
    }
    setSalvando(true)
    const r = await criar({
      nome,
      telefone,
      origem: 'Site Institucional',
      stage: data ? 'agendamento' : 'novo',
      data_preferida: data || null,
      horario_preferido: horario || null
    })
    setSalvando(false)
    if (r.erro) return toast(`Erro ao salvar lead: ${r.erro}`, 'erro')
    toast(data ? 'Aula experimental agendada!' : 'Recebemos seus dados!')
    setModalLead(false)
    setNome('')
    setTelefone('')
    setData('')
    setHorario('')
    abrirWhatsApp(
      telefone,
      `Olá! Vim pelo site do ${nomeAcademia} e quero agendar minha aula experimental${data ? ` para ${data.split('-').reverse().join('/')}${horario ? ` às ${horario}` : ''}` : ''}. 💪`
    )
  }

  const calcularImc = () => {
    const h = altura / 100
    const imc = peso / (h * h)
    let classificacao = ''
    let recomendacao = ''
    if (imc < 18.5) {
      classificacao = 'Abaixo do peso'
      recomendacao = 'Ideal para ganho de massa muscular. Nossos treinos de força e a orientação nutricional podem ajudar!'
    } else if (imc < 25) {
      classificacao = 'Peso normal'
      recomendacao = 'Perfeito! Continue mantendo o ritmo com treinos equilibrados de força e condicionamento.'
    } else if (imc < 30) {
      classificacao = 'Sobrepeso'
      recomendacao = 'O HIIT e a musculação são excelentes para acelerar a queima de gordura. Vem treinar com a gente!'
    } else {
      classificacao = 'Obesidade'
      recomendacao = 'Comece com acompanhamento personalizado. Nossos profissionais vão montar um plano sob medida para você.'
    }
    setResultadoImc({ imc: imc.toFixed(1), classificacao, recomendacao })
  }

  const obterEstiloStatusImc = (classificacao) => {
    switch (classificacao) {
      case 'Abaixo do peso':
        return {
          background: 'linear-gradient(135deg, #0284c7, #0369a1)',
          label: 'Abaixo do Peso'
        }
      case 'Peso normal':
        return {
          background: 'linear-gradient(135deg, #10b981, #059669)',
          label: 'Peso Ideal / Normal'
        }
      case 'Sobrepeso':
        return {
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          label: 'Sobrepeso'
        }
      case 'Obesidade':
      default:
        return {
          background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
          label: 'Obesidade'
        }
    }
  }

  return (
    <div className="bg-[#0f0f0f] font-sans text-white overflow-x-hidden min-h-screen">
      {/* ---------- Header ---------- */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-zinc-800/80 bg-[#0a0a0a]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 text-lg font-extrabold tracking-tight transition-opacity hover:opacity-90 bg-transparent border-0 p-0 outline-none"
          >
            <img
              src={config.logo_url || logoAcademia}
              alt={nomeAcademia}
              className="h-10 sm:h-11 w-auto max-h-12 max-w-[160px] object-contain drop-shadow-md bg-transparent border-0 ring-0"
            />
            <span className="text-white drop-shadow-sm font-extrabold tracking-tight">{nomeAcademia}</span>
          </button>

          <nav className="hidden items-center gap-6 text-sm md:flex">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => rolarPara(n.id)}
                className="text-zinc-300 font-medium transition-colors hover:text-white"
              >
                {n.rotulo}
              </button>
            ))}
            <button
              onClick={abrirLead}
              style={{ backgroundColor: corPrimaria }}
              className="rounded-xl px-5 py-2.5 text-sm font-extrabold text-white shadow-lg transition-all duration-300 hover:brightness-110 active:scale-95"
            >
              Agende sua Aula
            </button>
          </nav>

          <button
            onClick={() => setMenuAberto((v) => !v)}
            className="text-gray-300 md:hidden"
            aria-label="Abrir menu"
          >
            {menuAberto ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {menuAberto && (
          <div className="flex flex-col gap-3 border-t border-zinc-800 bg-[#111] px-4 py-4 text-sm md:hidden">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  setMenuAberto(false)
                  rolarPara(n.id)
                }}
                className="py-1 text-left text-zinc-300 font-medium hover:text-white"
              >
                {n.rotulo}
              </button>
            ))}
            <button
              onClick={abrirLead}
              style={{ backgroundColor: corPrimaria }}
              className="mt-1 rounded-xl py-3 font-extrabold text-white transition hover:brightness-110 active:scale-95"
            >
              Agende sua Aula Experimental
            </button>
          </div>
        )}
      </header>

      {/* ---------- Hero ---------- */}
      <section
        id="hero"
        className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20 pb-16"
        style={{ background: `url(${config.fundo_portal_url || fundoAcademia}) center center / cover no-repeat` }}
      >
        {/* Overlay escuro balanceado para garantir legibilidade impecável do texto sem ocultar a identidade da academia */}
        <div className="absolute inset-0 bg-black/75 md:bg-black/70 backdrop-brightness-90" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/50 to-[#0f0f0f]" />
        
        {/* Luzes dinâmicas sutis de fundo com as cores da marca */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div
            className="absolute left-1/2 -top-20 -translate-x-1/2 h-80 w-80 rounded-full blur-[150px]"
            style={{ backgroundColor: corPrimaria }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <span
            style={{
              backgroundColor: 'rgba(220, 38, 38, 0.15)',
              borderColor: 'rgba(220, 38, 38, 0.45)',
              color: '#ffffff'
            }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs sm:text-sm font-bold shadow-md tracking-wide"
          >
            <MapPin className="h-4 w-4 text-red-500" /> Mirandópolis - SP
          </span>

          <h1 className="mb-6 text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.15] text-white tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
            Transforme seu corpo e sua saúde
            <span className="block mt-2 font-black text-red-600 drop-shadow-[0_2px_12px_rgba(220,38,38,0.35)]">
              no coração de Mirandópolis
            </span>
          </h1>

          <p className="mb-10 max-w-2xl text-base sm:text-lg lg:text-xl font-medium leading-relaxed text-zinc-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            Metodologia comprovada para resultados reais. Equipamentos modernos,
            ambiente climatizado e profissionais qualificados prontos para te
            acompanhar do início ao fim.
          </p>

          <div className="flex w-full flex-col sm:flex-row items-center justify-center gap-4 max-w-md sm:max-w-none">
            <button
              onClick={abrirLead}
              style={{ backgroundColor: corPrimaria }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-xl px-8 py-4 text-base sm:text-lg font-extrabold text-white shadow-xl shadow-red-950/60 transition-all duration-300 hover:brightness-110 hover:shadow-[0_8px_25px_rgba(220,38,38,0.45)] hover:scale-[1.02] active:scale-[0.98] min-h-[48px]"
            >
              <MessageCircle className="h-5 w-5 text-white" /> Agende sua Aula Experimental
            </button>
            <button
              onClick={() => rolarPara('modalidades')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-transparent px-8 py-4 text-base sm:text-lg font-bold text-white backdrop-blur-sm transition-all duration-300 hover:border-white hover:bg-white/10 active:scale-[0.98] min-h-[48px]"
            >
              Ver Modalidades <ArrowDown className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-zinc-300 font-medium">
            <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm">
              <CheckCircle2 className="h-4 w-4 text-red-500" /> Seg a Sex · 07h às 20h
            </span>
            <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm">
              <CheckCircle2 className="h-4 w-4 text-red-500" /> Aula experimental gratuita
            </span>
            <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm">
              <CheckCircle2 className="h-4 w-4 text-red-500" /> Ambiente climatizado
            </span>
          </div>
        </div>
      </section>

      {/* ---------- Modalidades ---------- */}
      <section id="modalidades" className="bg-[#0f0f0f] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <span
              style={{ color: corSecundaria }}
              className="text-xs font-bold uppercase tracking-widest"
            >
              Nossas Modalidades
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
              Escolha o treino ideal para você
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-zinc-400 font-medium">
              Do clássico ao moderno, temos a modalidade certa para seu objetivo.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icone: Dumbbell,
                titulo: 'Musculação e Hipertrofia',
                texto:
                  'Equipamentos modernos e acompanhamento profissional para ganho de massa muscular, definição e força.',
                itens: ['Anilhas olímpicas', 'Máquinas articuladas', 'Treino personalizado']
              },
              {
                icone: Flame,
                titulo: 'Treinamento HIIT',
                texto:
                  'Queima de gordura rápida com treinos intervalados de alta intensidade. Resultados visíveis em poucas semanas.',
                itens: ['Queima calórica acelerada', 'Treinos de 30 min', 'Metabolismo elevado']
              },
              {
                icone: Users,
                titulo: 'Aulas Coletivas',
                texto:
                  'Jump, Spinning, Ginástica Localizada e muito mais. Energia coletiva que motiva e transforma.',
                itens: ['Jump', 'Spinning', 'Localizada + Alongamento']
              }
            ].map((m) => (
              <div
                key={m.titulo}
                className="group card-glow-hover rounded-2xl border border-zinc-800 bg-[#1a1a1a] p-8 text-center shadow-xl cursor-default"
              >
                <div
                  className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-600/25 to-red-950/60 border border-red-500/50 text-red-500 shadow-md group-hover:from-red-600 group-hover:to-red-700 group-hover:text-white group-hover:border-red-400 group-hover:shadow-[0_0_20px_rgba(229,9,20,0.5)] transition-all duration-300"
                >
                  <m.icone className="h-8 w-8 transition-transform duration-300 group-hover:scale-110" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-white transition-colors duration-300 group-hover:text-red-400">{m.titulo}</h3>
                <p className="mb-5 text-sm leading-relaxed text-zinc-300">{m.texto}</p>
                <ul className="space-y-2 text-xs text-zinc-400">
                  {m.itens.map((i) => (
                    <li key={i} className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-red-500" />
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Estrutura ---------- */}
      <section id="estrutura" className="bg-[#0a0a0a] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <span
              style={{ color: corSecundaria }}
              className="text-xs font-bold uppercase tracking-widest"
            >
              Nossa Estrutura
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
              Diferenciais que fazem a diferença
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { icone: GraduationCap, titulo: 'Prof. Qualificados', texto: 'Educação física especializada e acompanhamento individual' },
              { icone: Snowflake, titulo: 'Ambiente Climatizado', texto: 'Conforto térmico em todos os ambientes da academia' },
              { icone: Settings, titulo: 'Equipamentos de Ponta', texto: 'Máquinas modernas e manutenção preventiva constante' },
              { icone: HeartPulse, titulo: 'Acompanhamento Personalizado', texto: 'Plano de treino sob medida para seu objetivo' }
            ].map((e) => (
              <div
                key={e.titulo}
                className="group card-glow-hover rounded-xl border border-zinc-800 bg-[#161616] p-6 text-center shadow-lg cursor-default"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-600/10 border border-red-500/20 text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                  <e.icone className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                </div>
                <h3 className="mb-1.5 text-sm font-bold text-white transition-colors duration-300 group-hover:text-red-400">{e.titulo}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{e.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Depoimentos / Avaliações Google Meu Negócio ---------- */}
      <section id="depoimentos" className="bg-[#0c0c0d] py-20 relative overflow-hidden">
        {/* Glow sutil de fundo com as cores da marca */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 h-72 w-96 rounded-full blur-[140px] opacity-10 pointer-events-none"
          style={{ backgroundColor: corPrimaria }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <span
              style={{
                backgroundColor: `${corSecundaria}20`,
                borderColor: `${corSecundaria}40`,
                color: '#ffffff'
              }}
              className="inline-flex items-center gap-2 rounded-full border px-4 py-1 text-xs font-bold uppercase tracking-widest shadow-sm"
            >
              <GoogleIcon className="h-3.5 w-3.5" />
              Google Meu Negócio · Avaliações Oficiais
            </span>
            <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">
              Quem treina aqui recomenda
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-zinc-400 font-medium">
              Avaliações reais e verificadas de quem vive a transformação no dia a dia da {nomeAcademia}.
            </p>
          </div>

          {/* Container elegante com largura máxima para o Widget Oficial Elfsight */}
          <div className="mx-auto max-w-6xl px-4 py-8 rounded-3xl border border-zinc-800/80 bg-[#141416]/90 shadow-2xl backdrop-blur-sm card-glow-hover">
            <ElfsightGoogleReviews widgetId={googleWidgetCode || '980e151f-0c72-4906-be89-6763986af7eb'} />
          </div>

          {/* Botão de apoio direto abaixo do widget */}
          <div className="mt-8 text-center">
            <a
              href={googleReviewUrl}
              target="_blank"
              rel="noreferrer"
              style={{ backgroundColor: corPrimaria }}
              className="inline-flex items-center justify-center gap-2.5 rounded-xl px-7 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-red-950/40 transition-all duration-300 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
            >
              <GoogleIcon className="h-4 w-4 bg-white rounded-full p-0.5" />
              Deixar uma avaliação no Google
              <ExternalLink className="h-4 w-4" />
            </a>
            <p className="mt-2.5 text-xs text-zinc-500">
              Sua avaliação ajuda a fortalecer a comunidade da {nomeAcademia} no centro de Mirandópolis.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- Calculadora de IMC ---------- */}
      <section id="calculadora" className="bg-[#0a0a0a] py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <span
              style={{ color: corSecundaria }}
              className="text-xs font-bold uppercase tracking-widest"
            >
              Ferramenta Interativa
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
              Calculadora de IMC
            </h2>
            <p className="mt-3 text-zinc-400">
              Descubra seu Índice de Massa Corporal e receba uma recomendação de treino.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-[#161616] p-8 shadow-xl sm:p-10">
            <div className="mb-6 grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-400">
                  Altura (cm)
                </label>
                <input
                  type="number"
                  value={altura}
                  min={100}
                  max={250}
                  onChange={(e) => setAltura(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none transition focus:border-zinc-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-400">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  value={peso}
                  min={30}
                  max={250}
                  onChange={(e) => setPeso(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none transition focus:border-zinc-500"
                />
              </div>
            </div>
            <div className="mb-8">
              <label className="mb-2 block text-sm font-medium text-zinc-400">
                Idade: <span className="font-bold text-white">{idade}</span> anos
              </label>
              <input
                type="range"
                min={12}
                max={80}
                value={idade}
                onChange={(e) => setIdade(Number(e.target.value))}
                style={{ accentColor: corPrimaria }}
                className="w-full"
              />
            </div>
            <button
              onClick={calcularImc}
              style={{ backgroundColor: corPrimaria }}
              className="w-full min-h-[48px] rounded-xl py-3.5 text-base sm:text-lg font-extrabold text-white shadow-xl shadow-red-950/40 transition-all duration-300 hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Calculator className="h-5 w-5" /> Calcular IMC
            </button>
            {resultadoImc && (
              <div className="mt-8 transition-all duration-300 animate-fadeIn">
                <div className="rounded-2xl border border-zinc-800 bg-[#121214] p-6 text-center shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 opacity-60" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Seu Índice de Massa Corporal</p>
                  <p className="mt-2 text-5xl font-black text-white tracking-tight">
                    {resultadoImc.imc}
                  </p>
                  
                  {/* Badge de status com gradiente moderno */}
                  <div className="mt-4 flex justify-center">
                    <span
                      style={{ background: obterEstiloStatusImc(resultadoImc.classificacao).background }}
                      className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-extrabold text-white shadow-lg tracking-wide uppercase"
                    >
                      {obterEstiloStatusImc(resultadoImc.classificacao).label}
                    </span>
                  </div>

                  <p className="mt-4 text-sm sm:text-base text-zinc-300 max-w-lg mx-auto leading-relaxed">
                    {resultadoImc.recomendacao}
                  </p>
                </div>
                <button
                  onClick={abrirLead}
                  style={{ backgroundColor: corPrimaria }}
                  className="mt-4 flex w-full min-h-[48px] items-center justify-center gap-2.5 rounded-xl py-4 text-base sm:text-lg font-extrabold text-white shadow-xl shadow-red-950/50 transition-all duration-300 hover:brightness-110 active:scale-[0.98]"
                >
                  <MessageCircle className="h-5 w-5" /> Quero minha Aula Experimental Gratuita
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---------- Mapa ---------- */}
      <section className="bg-[#0f0f0f] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <span
              style={{ color: corSecundaria }}
              className="text-xs font-bold uppercase tracking-widest"
            >
              Onde Estamos
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
              Venha nos conhecer
            </h2>
          </div>
          <div className="overflow-hidden rounded-2xl border border-zinc-800 shadow-xl">
            <iframe
              title="Mapa - Academia Corpo e Ação, Mirandópolis SP"
              src="https://maps.google.com/maps?q=R.%20Rui%20Barbosa%2C%20603%20-%20Centro%2C%20Mirand%C3%B3polis%20-%20SP%2C%2016800-000&t=&z=17&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="380"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-zinc-800 bg-[#0a0a0a] pb-8 pt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 grid gap-10 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-3 text-lg font-extrabold tracking-tight">
                <img
                  src={config.logo_url || logoAcademia}
                  alt={nomeAcademia}
                  className="h-10 w-auto max-h-12 max-w-[150px] object-contain drop-shadow-md"
                />
                <span className="text-white drop-shadow-sm">{nomeAcademia}</span>
              </div>
              <p className="text-sm leading-relaxed text-zinc-400">
                Sua academia de referência. Transformando vidas através do movimento.
              </p>
              <div className="mt-5 flex items-center gap-3">
                {[
                  {
                    icone: Instagram,
                    rotulo: 'Instagram',
                    link: config.instagram
                      ? config.instagram.startsWith('http')
                        ? config.instagram
                        : `https://instagram.com/${config.instagram.replace('@', '')}`
                      : '#',
                    style: {
                      background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)'
                    },
                    classes: 'shadow-sm shadow-pink-900/30 text-white'
                  },
                  {
                    icone: Facebook,
                    rotulo: 'Facebook',
                    link: '#',
                    style: { backgroundColor: '#1877F2' },
                    classes: 'shadow-sm shadow-blue-900/30 text-white'
                  },
                  {
                    icone: Youtube,
                    rotulo: 'YouTube',
                    link: '#',
                    style: { backgroundColor: '#FF0000' },
                    classes: 'shadow-sm shadow-red-900/30 text-white'
                  },
                  {
                    icone: Clapperboard,
                    rotulo: 'TikTok',
                    link: '#',
                    style: { backgroundColor: '#000000' },
                    classes: 'border border-[#00F2FE]/50 shadow-[0_0_8px_rgba(254,44,85,0.4)] text-[#00F2FE]'
                  }
                ].map((s) => (
                  <a
                    key={s.rotulo}
                    href={s.link}
                    target={s.link !== '#' ? '_blank' : undefined}
                    rel="noreferrer"
                    style={s.style}
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:scale-105 active:scale-95 hover:brightness-110 ${s.classes}`}
                    aria-label={s.rotulo}
                  >
                    <s.icone className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="mb-4 font-bold text-white">Modalidades</h4>
              <ul className="space-y-2.5 text-sm text-zinc-400">
                {['Musculação', 'HIIT', 'Jump', 'Spinning', 'Localizada'].map((m) => (
                  <li key={m}>
                    <button
                      onClick={() => rolarPara('modalidades')}
                      className="transition-colors hover:text-white"
                    >
                      {m}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-bold text-white">Horários</h4>
              <ul className="space-y-2.5 text-sm text-zinc-400">
                <li>
                  <Clock className="mr-1.5 inline h-3.5 w-3.5" style={{ color: corSecundaria }} />
                  <span className="text-zinc-300">Seg a Sex:</span> 07h - 20h
                </li>
                <li>
                  <Clock className="mr-1.5 inline h-3.5 w-3.5" style={{ color: corSecundaria }} />
                  <span className="text-zinc-300">Sábado:</span> Fechado
                </li>
                <li>
                  <Clock className="mr-1.5 inline h-3.5 w-3.5" style={{ color: corSecundaria }} />
                  <span className="text-zinc-300">Domingo:</span> Fechado
                </li>
                <li className="pt-2 text-xs text-zinc-500">
                  * Feriados com horário especial
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-bold text-white">Endereço</h4>
              <address className="text-sm leading-relaxed text-zinc-400 not-italic">
                <MapPin className="mr-1.5 inline h-3.5 w-3.5" style={{ color: corSecundaria }} />
                {config.endereco || 'R. Rui Barbosa, 603 - Centro, Mirandópolis - SP'}
              </address>
              <p className="mt-3 text-sm text-zinc-400">
                <Phone className="mr-1.5 inline h-3.5 w-3.5" style={{ color: corSecundaria }} />{' '}
                {config.whatsapp || '(18) 98109-3334'}
              </p>
              <div className="mt-4 pt-3 border-t border-zinc-800/80">
                <a
                  href={googleReviewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition"
                >
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  Deixe sua avaliação no Google
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-zinc-800 pt-6 text-center text-xs text-zinc-500">
            <p>
              © {new Date().getFullYear()} {nomeAcademia}. Todos os direitos
              reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* ---------- WhatsApp float oficial (#25D366) ---------- */}
      <div className="fixed bottom-24 right-4 z-40 md:bottom-6">
        <span
          className="absolute -inset-1 animate-ping rounded-full opacity-60 pointer-events-none bg-[#25D366]"
        />
        <button
          onClick={abrirLead}
          style={{
            backgroundColor: '#25D366',
            boxShadow: '0 4px 14px rgba(37, 211, 102, 0.4)'
          }}
          className="relative flex h-14 w-14 items-center justify-center rounded-full text-white transition-all duration-300 hover:scale-110 hover:brightness-105 active:scale-95 shadow-lg"
          aria-label="Fale conosco pelo WhatsApp"
        >
          <MessageCircle className="h-7 w-7 text-white fill-white/20" />
        </button>
      </div>

      {/* ---------- Modal de lead ---------- */}
      {modalLead && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => !salvando && setModalLead(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-[#111] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CalendarDays className="h-5 w-5" style={{ color: corSecundaria }} />
                Agende sua Aula Experimental
              </h3>
              <button
                onClick={() => setModalLead(false)}
                disabled={salvando}
                className="text-zinc-400 transition hover:text-white"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={enviarLead} className="space-y-4 px-6 py-5">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Seu nome completo
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-850 px-4 py-2.5 text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-500"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                  WhatsApp com DDD
                </label>
                <input
                  type="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-850 px-4 py-2.5 text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-500"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Data preferida (opcional)
                </label>
                <input
                  type="date"
                  value={data}
                  min={hoje}
                  onChange={(e) => setData(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-850 px-4 py-2.5 text-white outline-none transition [color-scheme:dark] focus:border-zinc-500"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Melhor horário (opcional)
                </label>
                {carregandoHorarios && (
                  <p className="mb-2 text-xs text-zinc-500">Verificando horários...</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {HORARIOS.map((h) => {
                    const ocupado = horariosOcupados.includes(h)
                    const selecionado = horario === h
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={() => !ocupado && setHorario(ocupado ? horario : h)}
                        disabled={ocupado}
                        style={selecionado ? { backgroundColor: corPrimaria, borderColor: corPrimaria } : {}}
                        className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                          ocupado
                            ? 'cursor-not-allowed border-red-800/40 bg-red-900/20 text-red-500/40 line-through'
                            : selecionado
                              ? 'text-white shadow-md'
                              : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
                        }`}
                        title={ocupado ? 'Este horário já está agendado' : h}
                      >
                        {h}
                        {ocupado && ' ✕'}
                      </button>
                    )
                  })}
                </div>
                {horariosOcupados.length > 0 && (
                  <p className="mt-2 text-[10px] text-red-400">
                    ✕ = horário já ocupado ({horariosOcupados.length} agendado(s))
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={salvando}
                style={{ backgroundColor: corPrimaria }}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 font-bold text-white shadow-lg transition hover:brightness-110 disabled:opacity-60"
              >
                {salvando ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <MessageCircle className="h-5 w-5" />
                )}
                Confirmar pelo WhatsApp
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
