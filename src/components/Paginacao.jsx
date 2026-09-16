// =====================================================================
// Componente de Paginação reutilizável
// =====================================================================
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function Paginacao({ paginaAtual, totalPaginas, onMudarPagina }) {
  if (totalPaginas <= 1) return null

  const paginas = []
  const inicio = Math.max(1, paginaAtual - 2)
  const fim = Math.min(totalPaginas, paginaAtual + 2)

  // Primeira página
  if (inicio > 1) {
    paginas.push(1)
    if (inicio > 2) paginas.push('...')
  }

  // Páginas centrais
  for (let i = inicio; i <= fim; i++) {
    paginas.push(i)
  }

  // Última página
  if (fim < totalPaginas) {
    if (fim < totalPaginas - 1) paginas.push('...')
    paginas.push(totalPaginas)
  }

  return (
    <div className="flex items-center justify-center gap-1 pt-4">
      <button
        onClick={() => onMudarPagina(paginaAtual - 1)}
        disabled={paginaAtual <= 1}
        className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {paginas.map((pagina, i) =>
        pagina === '...' ? (
          <span key={`dots-${i}`} className="px-2 text-sm text-zinc-400">
            ...
          </span>
        ) : (
          <button
            key={pagina}
            onClick={() => onMudarPagina(pagina)}
            className={`min-w-[36px] rounded-lg px-2 py-1.5 text-sm font-semibold transition ${
              pagina === paginaAtual
                ? 'bg-primary-600 text-white shadow'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
            }`}
          >
            {pagina}
          </button>
        )
      )}

      <button
        onClick={() => onMudarPagina(paginaAtual + 1)}
        disabled={paginaAtual >= totalPaginas}
        className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

// Hook de paginação client-side
export function usePaginacao(itens, itensPorPagina = 20) {
  const [pagina, setPagina] = useState(1)
  const totalPaginas = Math.ceil(itens.length / itensPorPagina)
  const inicio = (pagina - 1) * itensPorPagina
  const itensPaginados = itens.slice(inicio, inicio + itensPorPagina)

  return { itensPaginados, pagina, totalPaginas, setPagina }
}

// Nota: importar useState do React quando usar o hook
import { useState } from 'react'
