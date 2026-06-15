# Tchilla Admin — Instruções para Claude

## Regra principal

**Antes de qualquer tarefa**, leia os três documentos abaixo na íntegra. Eles são a fonte de verdade do projeto — arquitetura, rotas, componentes, design e regras de UX estão todos definidos ali. Não suponha nada sem consultar primeiro.

| Documento | O que contém |
|---|---|
| `docs/MIGRATION_NEXTJS.md` | Arquitetura completa: rotas, autenticação, stores Zustand, Server Actions, tipos TypeScript, integração Firebase, fluxos de negócio |
| `docs/Tchilla Admin Design System (download).html` | Tokens de design, paleta de cores, tipografia, espaçamentos, sombras, componentes visuais |
| `docs/Tchilla Admin Regras UI-UX (download).html` | Regras de UI/UX, padrões de interação, comportamentos esperados, acessibilidade |

## Stack

- Next.js 15 App Router, TypeScript strict, Tailwind CSS v3
- Zustand (client), Server Actions (mutations), `serverFetch` (dados no servidor)
- Firebase Firestore (notificações real-time), Firebase Messaging (push)
- TanStack Table v8, Radix UI, Sonner, Recharts, Framer Motion
- Gerenciador de pacotes: **yarn** (nunca npm)

## Convenções obrigatórias

- Autenticação via cookie HttpOnly `tchilla_token` — nunca localStorage
- `ActionResult<T>` como retorno de todas as Server Actions
- Erros em português via `ERROR_MESSAGES` e `ApiException`
- Componentes globais em `src/components/global/`, feature-specific em `src/components/<feature>/`
- CSS via variáveis CSS (`var(--blue)`, `var(--navy)`, etc.) — não valores hard-coded
- Sons mapeados via `SOUNDS` em `src/constants/app.constants.ts`
- Datas com `date-fns` + locale `ptBR`
- Rotas centralizadas em `src/constants/routes.ts` via objeto `ROUTES`
