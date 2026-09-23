// =====================================================================
// ErrorBoundary — Captura erros na árvore de componentes React
// Exibe o componente exato causador da falha e a pilha de erros (stack)
// =====================================================================
import React, { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      componentName: null,
      copiado: false
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Extrai o nome do componente no topo da pilha de componentes do React
    const stack = errorInfo?.componentStack || ''
    const match = stack.match(/in\s+([A-Za-z0-9_]+)/)
    const componentName = match ? match[1] : (this.props.nome || 'Componente')

    console.error('🚨 [ErrorBoundary] Erro capturado no componente:', {
      componente: componentName,
      erro: error?.message || error,
      stack: error?.stack,
      componentStack: stack
    })

    this.setState({
      errorInfo,
      componentName
    })
  }

  resetarErro = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      componentName: null,
      copiado: false
    })
  }

  copiarDetalhes = () => {
    const texto = [
      `Componente: ${this.state.componentName || 'Desconhecido'}`,
      `Erro: ${this.state.error?.toString() || 'Erro desconhecido'}`,
      '',
      '--- Component Stack ---',
      this.state.errorInfo?.componentStack || '(sem pilha de componentes)',
      '',
      '--- Error Stack ---',
      this.state.error?.stack || '(sem stack)'
    ].join('\n')

    navigator.clipboard?.writeText(texto).then(() => {
      this.setState({ copiado: true })
      setTimeout(() => this.setState({ copiado: false }), 2500)
    }).catch(() => {})
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetarErro)
      }

      const { error, errorInfo, componentName, copiado } = this.state

      return (
        <div className="flex min-h-[50vh] w-full items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-red-200 bg-white p-6 shadow-xl dark:border-red-900/60 dark:bg-zinc-900">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <span className="inline-block rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700 dark:bg-red-950 dark:text-red-300">
                  Falha de Renderização
                </span>
                <h2 className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Erro no componente: <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-red-600 dark:bg-zinc-800 dark:text-red-400">&lt;{componentName} /&gt;</code>
                </h2>
                <p className="mt-1 text-sm font-semibold text-red-600 dark:text-red-400 break-words">
                  {error?.message || String(error)}
                </p>
              </div>
            </div>

            {/* Pilha de componentes do React */}
            {errorInfo?.componentStack && (
              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Hierarquia do Componente (Component Stack):
                </p>
                <pre className="mt-1.5 max-h-36 overflow-auto rounded-xl bg-zinc-950 p-3 text-xs text-zinc-300 font-mono">
                  {errorInfo.componentStack.trim()}
                </pre>
              </div>
            )}

            {/* Stack trace completo */}
            {error?.stack && (
              <div className="mt-3">
                <details className="text-xs text-zinc-500 dark:text-zinc-400">
                  <summary className="cursor-pointer font-semibold hover:text-zinc-700 dark:hover:text-zinc-200">
                    Ver stack trace técnico
                  </summary>
                  <pre className="mt-1.5 max-h-40 overflow-auto rounded-xl bg-zinc-950 p-3 text-[11px] text-zinc-400 font-mono">
                    {error.stack}
                  </pre>
                </details>
              </div>
            )}

            {/* Ações */}
            <div className="mt-6 flex flex-wrap gap-2.5 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={this.resetarErro}
                className="rounded-xl bg-primary-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-700"
              >
                Tentar novamente
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                Recarregar página
              </button>
              <button
                type="button"
                onClick={this.copiarDetalhes}
                className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                {copiado ? '✓ Copiado!' : 'Copiar detalhes do erro'}
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
