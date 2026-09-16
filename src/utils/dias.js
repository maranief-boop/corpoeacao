// =====================================================================
// Utilitários compartilhados — normalização de dias da semana
// Extraído de Checkins.jsx e PortalAluno.tsx para evitar duplicação.
// =====================================================================

// Mapeia nomes de dias (com/sem acento, abreviados) para índice JS (0=Dom)
const DIAS_NORMA = {
  dom: 0, domingo: 0,
  seg: 1, segunda: 1,
  ter: 2, 'terça': 2, terca: 2,
  qua: 3, quarta: 3,
  qui: 4, quinta: 4,
  sex: 5, sexta: 5,
  sab: 6, 'sábado': 6, sabado: 6
}

export const ORDEM_DIAS = [1, 2, 3, 4, 5, 6, 0]
export const ROTULOS_DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

// Normaliza uma string removendo acentos, convertendo para minúsculas
export function normalizar(s) {
  return (s || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

// Converte uma string "Segunda, Quarta, Sexta" em índices [1, 3, 5]
export function parseDiasSemana(valor) {
  if (!valor) return []
  return valor
    .split(',')
    .map((p) => normalizar(p))
    .map((t) => {
      if (!t) return -1
      for (const k of Object.keys(DIAS_NORMA)) {
        if (t === k || t.startsWith(k)) return DIAS_NORMA[k]
      }
      return -1
    })
    .filter((d) => d >= 0)
}

// Valida se um valor é um CPF válido (formato básico)
export function validarCPF(cpf) {
  const digitos = (cpf || '').replace(/\D/g, '')
  if (digitos.length !== 11) return false
  // Rejeita CPFs com todos os dígitos iguais
  if (/^(\d)\1{10}$/.test(digitos)) return false
  // Validação dos dígitos verificadores
  let soma = 0
  for (let i = 0; i < 9; i++) soma += parseInt(digitos[i]) * (10 - i)
  let resto = (soma * 10) % 11
  if (resto === 10) resto = 0
  if (resto !== parseInt(digitos[9])) return false
  soma = 0
  for (let i = 0; i < 10; i++) soma += parseInt(digitos[i]) * (11 - i)
  resto = (soma * 10) % 11
  if (resto === 10) resto = 0
  return resto === parseInt(digitos[10])
}

// Valida se um telefone brasileiro tem tamanho adequado
export function validarTelefone(telefone) {
  const digitos = (telefone || '').replace(/\D/g, '')
  return digitos.length >= 10 && digitos.length <= 11
}

// Formata CPF para exibição: 123.456.789-00
export function formatarCPF(cpf) {
  const d = (cpf || '').replace(/\D/g, '')
  if (d.length !== 11) return cpf || ''
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

// Formata telefone para exibição: (11) 99999-9999
export function formatarTelefone(tel) {
  const d = (tel || '').replace(/\D/g, '')
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return tel || ''
}
