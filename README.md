# 💪 Academia Corpo e Ação — PWA de Gestão

Aplicativo **PWA mobile-first** da Academia Corpo e Ação (R. Rui Barbosa, 603 — Centro,
Mirandópolis-SP). Inclui painel do gestor, **portal do aluno**, **site institucional** e
gestão de **Alunos, Financeiro com cobrança via WhatsApp, Fichas de Treino e Check-ins**,
com identidade visual embutida (logo `logo.png` + paleta esmeralda) e tema **claro/escuro nativo**.

## 🚀 Como rodar

```bash
npm install
npm run dev
```

Abra `http://localhost:5173`. Para produção:

```bash
npm run build
npm run preview
```

## 🧱 Stack

- React 18 + Vite 5
- Tailwind CSS 3 (dark mode por classe, paleta `primary` dinâmica)
- Supabase JS (CRUD real: `alunos`, `treinos`, `checkins`, `configuracoes`)
- React Router (HashRouter — compatível com hospedagem estática/offline)
- Lucide React (ícones) · PWA (manifest + service worker)

## 🗂️ Estrutura

```
src/
├── lib/supabase.js          # Cliente Supabase
├── utils/                   # formatação, cores, WhatsApp, métricas
├── hooks/                   # useAlunos, useTreinos, useCheckins...
├── context/AppContext.jsx   # white-label + tema
├── components/              # Layout, Toast, Modal, UI, StatusBadge...
└── pages/                   # Dashboard, Alunos, Financeiro, Treinos, Check-ins,
                             # CRM, Site Institucional, Portal do Aluno, Configurações
```

## ☁️ Configurando o Supabase (passo a passo)

O banco ainda **não está conectado** — o aplicativo roda com identidade da marca embutida.
Quando o novo projeto da Academia Corpo e Ação estiver pronto:

1. Acesse [supabase.com](https://supabase.com) e crie um **novo projeto**.
2. No painel do projeto, abra **SQL Editor** e execute o conteúdo de
   [`supabase/schema.sql`](supabase/schema.sql). Isso cria todas as tabelas
   (`alunos`, `treinos`, `checkins`, `pagamentos`, `leads`, `configuracoes`...) e já
   grava a linha de configuração `id = 1` com o nome **Academia Corpo e Ação** e a logo.
3. Copie o arquivo `.env.example` para `.env` (na raiz do projeto) e preencha:
   - `VITE_SUPABASE_URL` → **Project Settings > API > Project URL**
     (ex.: `https://xxxxxxxx.supabase.co`)
   - `VITE_SUPABASE_ANON_KEY` → **Project Settings > API > Project API keys > anon public**
4. Salve e reinicie o servidor de desenvolvimento (`npm run dev`).
5. Para usar uma **logo hospedada** (em vez da embutida), suba o `logo.png` em
   **Storage** (bucket `logos`, público) e informe a URL pública em **Configurações > Logotipo**.
6. Para deixar o app instalável, os ícones em `public/` já cobrem o básico; gere PNGs
   de 192px e 512px a partir do logo se quiser máxima compatibilidade.

> ⚠️ **Segurança**: este projeto usa a chave **anon** com RLS desativado (tabelas criadas
> via SQL). Para produção, ative **Supabase Auth** e políticas de RLS no schema.

## 💬 Cobrança via WhatsApp

No módulo Financeiro, o botão verde gera o link `wa.me` com mensagem personalizada
(nome do aluno, valor, data de vencimento e nome da academia).