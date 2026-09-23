// =====================================================================
// Site Institucional (port para React do index.html do módulo Site/CRM)
// O formulário de captura de leads agora grava no SUPABASE (tabela
// "leads") — mesma instância do sistema — em vez do Firestore.
// =====================================================================
import { useState, useEffect, useCallback } from 'react'
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
  Loader2
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
  { id: 'depoimentos', rotulo: 'Depoimentos' },
  { id: 'calculadora', rotulo: 'IMC' }
]

function rolarPara(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

function Estrelas() {
  return (
    <div className="mb-3 flex gap-1 text-yellow-400">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className="h-4 w-4 fill-current" />
      ))}
    </div>
  )
}

export default function SiteInstitucional() {
  const { criar } = useLeads()
  const { toast } = useToast()
  const { config } = useApp()
  const nomeAcademia = config.nome_academia || 'Academia Corpo e Ação'
  const corPrimaria = config.cor_primaria || '#DC2626'
  const corSecundaria = config.cor_secundaria || '#2563EB'

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

  return (
    <div className="bg-[#0f0f0f] font-sans text-white">
      {/* ---------- Header ---------- */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-zinc-800/80 bg-[#0a0a0a]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 text-lg font-extrabold tracking-tight transition-opacity hover:opacity-90"
          >
            <img
              src={config.logo_url || logoAcademia}
              alt={nomeAcademia}
              className="h-10 w-auto max-h-12 max-w-[150px] object-contain drop-shadow-md"
            />
            <span className="text-white drop-shadow-sm">{nomeAcademia}</span>
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
        className="relative flex min-h-screen items-center overflow-hidden pt-16"
        style={{ background: `url(${config.fundo_portal_url || fundoAcademia}) center center / cover no-repeat` }}
      >
        {/* Camada de sobreposição densa sobre a foto da academia */}
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
        
        {/* Luzes dinâmicas de fundo com as cores da marca */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div
            className="absolute left-10 top-20 h-72 w-72 rounded-full blur-[140px]"
            style={{ backgroundColor: corPrimaria }}
          />
          <div
            className="absolute bottom-20 right-10 h-96 w-96 rounded-full blur-[160px]"
            style={{ backgroundColor: corSecundaria }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span
              style={{
                backgroundColor: `${corSecundaria}25`,
                borderColor: `${corSecundaria}50`,
                color: '#ffffff'
              }}
              className="mb-6 inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold shadow-sm"
            >
              <MapPin className="h-3.5 w-3.5" style={{ color: corSecundaria }} /> Mirandópolis-SP
            </span>
            <h1 className="mb-6 text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl drop-shadow-md">
              Transforme seu corpo e sua saúde
              <br />
              <span
                style={{
                  backgroundImage: `linear-gradient(to right, ${corPrimaria}, ${corSecundaria})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
                className="bg-clip-text text-transparent font-black"
              >
                no coração de Mirandópolis
              </span>
            </h1>
            <p className="mb-8 max-w-2xl text-lg font-medium leading-relaxed text-zinc-200 drop-shadow-md sm:text-xl">
              Metodologia comprovada para resultados reais. Equipamentos modernos,
              ambiente climatizado e profissionais qualificados prontos para te
              acompanhar do início ao fim.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                onClick={abrirLead}
                style={{ backgroundColor: corPrimaria }}
                className="inline-flex items-center justify-center gap-3 rounded-xl px-8 py-4 text-lg font-extrabold text-white shadow-xl transition-all duration-300 hover:brightness-110 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
              >
                <MessageCircle className="h-5 w-5" /> Agende sua Aula Experimental
              </button>
              <button
                onClick={() => rolarPara('modalidades')}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/60 px-8 py-4 text-lg font-semibold text-zinc-200 backdrop-blur-sm transition-all duration-300 hover:border-zinc-500 hover:text-white hover:bg-zinc-800/80 active:scale-[0.98]"
              >
                Ver Modalidades <ArrowDown className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-12 flex flex-wrap gap-6 text-sm text-zinc-300 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" style={{ color: corSecundaria }} /> Seg a
                Sex · 07h às 20h
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" style={{ color: corSecundaria }} /> Aula
                experimental gratuita
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" style={{ color: corSecundaria }} /> Ambiente
                climatizado
              </span>
            </div>
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
                className="group rounded-2xl border border-zinc-800 bg-[#1a1a1a] p-8 text-center shadow-xl hover:scale-[1.02] hover:border-zinc-700 transition-all duration-300"
              >
                <div
                  style={{
                    backgroundColor: `${corPrimaria}18`,
                    color: corPrimaria
                  }}
                  className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full ring-1 ring-inset ring-white/10 transition-transform duration-300 group-hover:scale-110"
                >
                  <m.icone className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-white">{m.titulo}</h3>
                <p className="mb-5 text-sm leading-relaxed text-zinc-400">{m.texto}</p>
                <ul className="space-y-1.5 text-xs text-zinc-400">
                  {m.itens.map((i) => (
                    <li key={i} className="flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: corSecundaria }} />
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
                className="group rounded-xl border border-zinc-800 bg-[#1a1a1a] p-6 text-center shadow-lg transition-all duration-300 hover:scale-[1.03] hover:border-zinc-700"
              >
                <e.icone
                  className="mx-auto mb-3 h-8 w-8 transition-transform duration-300 group-hover:scale-110"
                  style={{ color: corSecundaria }}
                />
                <h3 className="mb-1 text-sm font-bold text-white">{e.titulo}</h3>
                <p className="text-xs text-zinc-400">{e.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Depoimentos ---------- */}
      <section id="depoimentos" className="bg-[#0f0f0f] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <span
              style={{ color: corSecundaria }}
              className="text-xs font-bold uppercase tracking-widest"
            >
              Depoimentos
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
              Quem treina aqui recomenda
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                texto:
                  '"Melhor academia de Mirandópolis! Em 3 meses já vi resultados incríveis. Os professores são muito atenciosos."',
                iniciais: 'CL',
                nome: 'Carlos Lima',
                periodo: 'Aluno há 8 meses'
              },
              {
                texto:
                  '"As aulas de Jump e Spinning são demais! Ambiente climatizado e equipamentos novos fazem toda diferença."',
                iniciais: 'AM',
                nome: 'Ana Martins',
                periodo: 'Aluna há 1 ano'
              },
              {
                texto:
                  '"Treino há 5 anos e nunca vi acompanhamento tão personalizado. O HIIT mudou meu condicionamento físico!"',
                iniciais: 'RF',
                nome: 'Rafael Fernandes',
                periodo: 'Aluno há 2 anos'
              }
            ].map((d) => (
              <div
                key={d.nome}
                className="rounded-2xl border border-zinc-800 bg-[#1a1a1a] p-6 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-zinc-700"
              >
                <Estrelas />
                <p className="mb-4 text-sm leading-relaxed text-zinc-300">{d.texto}</p>
                <div className="flex items-center gap-3">
                  <div
                    style={{
                      backgroundColor: `${corSecundaria}25`,
                      color: corSecundaria
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-black ring-1 ring-inset ring-white/10"
                  >
                    {d.iniciais}
                  </div>
                  <div>
                    <strong className="text-sm text-white">{d.nome}</strong>
                    <span className="block text-xs text-zinc-400">{d.periodo}</span>
                  </div>
                </div>
              </div>
            ))}
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
              className="w-full rounded-xl py-3.5 text-lg font-extrabold text-white shadow-lg transition hover:brightness-110 active:scale-98"
            >
              <Calculator className="mr-2 inline h-5 w-5" /> Calcular IMC
            </button>
            {resultadoImc && (
              <div className="mt-6">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-center">
                  <p className="text-sm text-zinc-400">Seu IMC é</p>
                  <p className="mt-1 text-4xl font-black text-white">
                    {resultadoImc.imc}
                  </p>
                  <p className="mt-1 font-bold" style={{ color: corSecundaria }}>
                    {resultadoImc.classificacao}
                  </p>
                  <p className="mt-3 text-sm text-zinc-300">
                    {resultadoImc.recomendacao}
                  </p>
                </div>
                <button
                  onClick={abrirLead}
                  style={{ backgroundColor: corPrimaria }}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-lg font-extrabold text-white shadow-lg transition hover:brightness-110 active:scale-98"
                >
                  <MessageCircle className="h-5 w-5" /> Quero minha Aula Experimental
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
              <div className="mt-5 flex gap-3">
                {[
                  {
                    icone: Instagram,
                    rotulo: 'Instagram',
                    link: config.instagram
                      ? config.instagram.startsWith('http')
                        ? config.instagram
                        : `https://instagram.com/${config.instagram.replace('@', '')}`
                      : '#'
                  },
                  { icone: Facebook, rotulo: 'Facebook', link: '#' },
                  { icone: Youtube, rotulo: 'YouTube', link: '#' },
                  { icone: Clapperboard, rotulo: 'TikTok', link: '#' }
                ].map((s) => (
                  <a
                    key={s.rotulo}
                    href={s.link}
                    target={s.link !== '#' ? '_blank' : undefined}
                    rel="noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 transition hover:bg-zinc-700 hover:text-white"
                    aria-label={s.rotulo}
                  >
                    <s.icone className="h-4 w-4" />
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
                {config.endereco || 'R. Rui Barbosa, 603, Centro, Mirandópolis - SP'}
              </address>
              <p className="mt-3 text-sm text-zinc-400">
                <Phone className="mr-1.5 inline h-3.5 w-3.5" style={{ color: corSecundaria }} />{' '}
                {config.whatsapp || '(18) 98109-3334'}
              </p>
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

      {/* ---------- WhatsApp float pulsante ---------- */}
      <div className="fixed bottom-24 right-4 z-40 md:bottom-6">
        <span className="absolute -inset-1 animate-ping rounded-full bg-green-500 opacity-60 pointer-events-none" />
        <button
          onClick={abrirLead}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-2xl shadow-green-500/50 transition-transform duration-300 hover:scale-110 active:scale-95 animate-pulse"
          aria-label="Fale conosco pelo WhatsApp"
        >
          <MessageCircle className="h-7 w-7" />
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
