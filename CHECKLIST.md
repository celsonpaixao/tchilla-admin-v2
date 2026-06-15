# Tchilla Admin — Checklist Completo de Construção

> Next.js 15 · App Router · TypeScript · Tailwind CSS · shadcn/ui  
> Design System: `docs/Tchilla Admin Design System.html`  
> Regras UI/UX: `docs/Tchilla Admin Regras UI-UX.html`

---

## FASE 1 — Configuração do Projeto

### 1.1 Inicialização
- [ ] `npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*" --no-turbopack`
- [ ] Verificar estrutura gerada (`app/`, `src/`, `public/`)
- [ ] Instalar todas as dependências (ver seção Dependências abaixo)
- [ ] Inicializar shadcn/ui: `npx shadcn@latest init`

### 1.2 Dependências Completas
```bash
# Core
npm install axios zustand

# UI / Design
npm install class-variance-authority clsx tailwind-merge tailwindcss-animate
npm install @radix-ui/react-alert-dialog @radix-ui/react-avatar @radix-ui/react-checkbox
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label
npm install @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slot
npm install @radix-ui/react-tooltip @radix-ui/react-popover @radix-ui/react-switch
npm install @radix-ui/react-tabs @radix-ui/react-scroll-area

# Ícones
npm install lucide-react @hugeicons/react @hugeicons/core-free-icons

# Firebase
npm install firebase

# Animações / UI
npm install framer-motion sonner next-themes

# Tabelas / Calendário / Gráficos
npm install @tanstack/react-table react-big-calendar recharts

# Datas
npm install date-fns dayjs

# Mapas
npm install @react-google-maps/api @vis.gl/react-google-maps

# Áudio
npm install howler use-sound

# Formulários / Máscaras
npm install react-number-format react-select use-debounce react-hook-form

# Cookies
npm install cookies-next

# Types
npm install -D @types/howler @types/react-big-calendar
```

### 1.3 Arquivos de Configuração
- [ ] `next.config.ts` — images, rewrites, security headers
- [ ] `tailwind.config.ts` — design tokens, cores, fontes, plugins
- [ ] `tsconfig.json` — paths `@/*` → `./src/*`
- [ ] `components.json` — shadcn/ui config com RSC, tsx, css variables
- [ ] `.env.local` — todas as variáveis de ambiente (API, Firebase, Maps, Cookie)
- [ ] `.env.production` — variáveis de produção
- [ ] `public/firebase-messaging-sw.js` — service worker Firebase Messaging
- [ ] `public/sounds/` — copiar todos os sons (boot_down, error, info, message, notification, popup, reminder, success, warning)
- [ ] `public/assets/` — copiar logos e assets

---

## FASE 2 — Design Tokens & Estilos Globais

### 2.1 CSS Tokens (app/globals.css)

**Paleta extraída do Design System:**
```css
:root {
  /* Marca */
  --blue: #14AAE9;
  --blue-50: #E8F7FE; --blue-100: #C2EBFB; --blue-200: #8FD9F7;
  --blue-600: #0E8FCB; --blue-700: #0A6F9E; --blue-800: #0A567A;
  --pink: #FF4D8D;
  --navy: #0E2A42;

  /* Cinzas quentes */
  --gray-25: #FBFAF9; --gray-50: #F6F5F3; --gray-100: #EFEDEA;
  --gray-150: #E9E6E2; --gray-200: #E2DFDA; --gray-300: #D2CEC8;
  --gray-400: #ABA69E; --gray-500: #827D75; --gray-600: #615C55;
  --gray-700: #47433D; --gray-800: #2F2C27; --gray-900: #1C1A17;

  /* Semânticos */
  --bg: var(--gray-50);
  --surface: #FFFFFF;
  --surface-2: var(--gray-25);
  --surface-3: var(--gray-100);
  --border: var(--gray-200);
  --text: var(--gray-900);
  --text-2: var(--gray-600);
  --text-3: var(--gray-500);

  /* Ação */
  --primary: var(--blue);
  --primary-hover: #0F97D0;
  --primary-press: #0E8FCB;

  /* Status */
  --success: #1F8A5B; --success-bg: #E7F6EE; --success-fg: #136B45; --success-bd: #BFE6CF;
  --warning: #B45309; --warning-bg: #FEF3C7; --warning-fg: #92400E; --warning-bd: #FCD34D;
  --danger: #DC2626; --danger-bg: #FEE2E2; --danger-fg: #991B1B; --danger-bd: #FCA5A5;
  --info: var(--blue); --info-bg: var(--blue-50); --info-fg: var(--blue-700); --info-bd: var(--blue-100);

  /* Raio */
  --radius-base: 8px;
  --r-xs: 3px; --r-sm: 5px; --r-md: 8px;
  --r-lg: 12px; --r-xl: 18px; --r-full: 999px;

  /* Sombras */
  --shadow-xs: 0 1px 2px rgba(14,42,66,.06);
  --shadow-sm: 0 1px 3px rgba(14,42,66,.08), 0 1px 2px rgba(14,42,66,.05);
  --shadow-md: 0 4px 12px -2px rgba(14,42,66,.12), 0 2px 6px -2px rgba(14,42,66,.07);
  --shadow-lg: 0 16px 40px -12px rgba(14,42,66,.22), 0 6px 14px -8px rgba(14,42,66,.12);

  /* Sidebar */
  --sidebar-bg: #0E2A42;
  --sidebar-width: 240px;
  --topbar-height: 60px;
}
```

### 2.2 Tailwind Config
- [ ] Extender paleta com tokens acima
- [ ] Configurar fonte Inter (Google Fonts)
- [ ] Adicionar `tailwindcss-animate`
- [ ] Configurar `content` paths para `src/**`

---

## FASE 3 — Camada de Tipos (src/types/)

- [ ] `common.types.ts` — `ApiResponse<T>`, `ActionResult<T>`, `ApiException`, `ApiErrorType`, `ERROR_MESSAGES`
- [ ] `user.types.ts` — `UsuarioInterface`, `LoginRequest`, `UserType`
- [ ] `reserva.types.ts` — `ReservaInterface`, `ReservaStatus`
- [ ] `payment.types.ts` — `PagamentoInterface`
- [ ] `category.types.ts` — `CategoryData`, `SubCategoryData`
- [ ] `agencia.types.ts` — `AgenciaData`, `AgenciaCreateRequest`
- [ ] `supervisor.types.ts` — `SupervisorResponse`, `CreateSupervisorRequest`
- [ ] `client.types.ts` — `ClientesData`
- [ ] `metrics.types.ts` — `DashboardMetrics`, `AgendamentoMetrics`, `UserMetrics`, `UserChartData`
- [ ] `notification.types.ts` — `FirebaseNotification`
- [ ] `settings.types.ts` — `SettingsAppEnum`
- [ ] `endereco.types.ts` — `EnderecoResponse`, `Provincia`
- [ ] `campanha.types.ts` — `CampanhaRequest`

---

## FASE 4 — Constantes (src/constants/)

- [ ] `routes.ts` — mapa de todas as rotas do app
- [ ] `app.constants.ts` — nomes de cookies, chaves, limites

---

## FASE 5 — Camada Lib (src/lib/)

### 5.1 Auth
- [ ] `lib/auth/cookies.ts` — `getToken()`, `setToken()`, `clearToken()`
- [ ] `lib/auth/session.ts` — `getSession()`, validação de sessão server-side

### 5.2 API
- [ ] `lib/api/server.ts` — `serverFetch<T>()` com token do cookie, tratamento 401
- [ ] `lib/api/client.ts` — Axios instance (client-side, para route handlers proxy)

### 5.3 Utilitários
- [ ] `lib/firebase.ts` — initializeApp, Firestore, Messaging
- [ ] `lib/utils.ts` — `cn()`, formatadores (data, moeda AOA, telefone), helpers

---

## FASE 6 — Zustand Stores (src/stores/)

- [ ] `authStore.ts` — `isAuthenticated`, `setAuthenticated` (SEM localStorage)
- [ ] `userStore.ts` — `currentUser`, `setCurrentUser`, `clearUser`, `isSupervisor()`
- [ ] `notificationStore.ts` — lista de notificações Firebase, contagem não lidas
- [ ] `snackbarStore.ts` — fila de toasts (integrado com Sonner)
- [ ] `agendamentoStore.ts` — lista de reservas, filtros, view mode (card/calendar/table)
- [ ] `pagamentoStore.ts` — lista de pagamentos, filtros
- [ ] `settingsStore.ts` — enums da API (`TipoEvento`, `StatusReserva`, etc.)

---

## FASE 7 — Middleware (src/middleware.ts)

- [ ] Verificar cookie `tchilla_token`
- [ ] Redirecionar `/` → `/reservas/relatorio`
- [ ] Redirecionar não-autenticados para `/login`
- [ ] Redirecionar autenticados que acessam `/login` para `/reservas/relatorio`
- [ ] Configurar `matcher` para excluir `api`, `_next`, `public`

---

## FASE 8 — API Route Handlers (app/api/)

- [ ] `app/api/auth/login/route.ts` — recebe credenciais, chama API .NET, seta cookie HttpOnly
- [ ] `app/api/auth/logout/route.ts` — limpa cookie + chama PUT /api/Auth/logout
- [ ] `app/api/proxy/[...path]/route.ts` — proxy opcional para chamadas client-side

---

## FASE 9 — Server Actions (src/actions/)

- [ ] `auth.actions.ts` — `loginAction()`, `logoutAction()`, `getUserInfoAction()`
- [ ] `reserva.actions.ts` — `fetchReservas()`, `fetchReservasPendentes()`, `atualizarStatusReserva()`, `fetchMetricasReservas()`
- [ ] `payment.actions.ts` — `fetchPagamentos()`, `fetchPagamentosPendentes()`, `validarPagamento()`
- [ ] `categoria.actions.ts` — `fetchCategorias()`, `criarCategoria()`, `atualizarCategoria()`, `deletarCategoria()`
- [ ] `subcategoria.actions.ts` — `fetchSubcategorias()`, `criarSubcategoria()`, `atualizarSubcategoria()`, `deletarSubcategoria()`
- [ ] `agencia.actions.ts` — `fetchAgencias()`, `criarAgencia()`, `atualizarAgencia()`, `deletarAgencia()`
- [ ] `prestador.actions.ts` — `fetchPrestadores()`, `aprovarPrestador()`, `atualizarPrestador()`, `deletarPrestador()`
- [ ] `supervisor.actions.ts` — `fetchSupervisores()`, `criarSupervisor()`, `tornarAdmin()`
- [ ] `cliente.actions.ts` — `fetchClientes()`, `fetchNovosClientes()`, `fetchClienteById()`, `deletarCliente()`
- [ ] `metricas.actions.ts` — `fetchMetricasGerais()`, `fetchMetricasUsuarios()`, `fetchUserVsParceiros()`
- [ ] `campanha.actions.ts` — `enviarCampanha()`
- [ ] `enum.actions.ts` — `fetchEnums()`

---

## FASE 10 — Componentes Globais (src/components/global/)

### 10.1 Primitivos de Formulário
- [ ] `GlobalButton.tsx` — variantes: primary, secondary, outline, ghost, danger; tamanhos: sm, md, lg; estado loading
- [ ] `GlobalInput.tsx` — label, error, helper, password toggle, ícone prefixo/sufixo
- [ ] `GlobalTextarea.tsx` — label, contador de caracteres, error
- [ ] `GlobalPhoneNumberInput.tsx` — máscara de telefone angolano (+244)
- [ ] `GlobalDropdown.tsx` — wrapper do Select do Radix
- [ ] `UploadImagemPreview.tsx` — drag & drop, preview, validação de tamanho/tipo

### 10.2 Overlays
- [ ] `GlobalModal.tsx` — Dialog Radix com animação Framer Motion, tamanhos variáveis
- [ ] `GlobalDrawer.tsx` — Sheet Radix, slide da direita
- [ ] `FullScreenDialog.tsx` — Dialog em tela cheia para mapas/galeria

### 10.3 Tabelas
- [ ] `GlobalTable.tsx` — TanStack Table, paginação, busca global, ordenação
- [ ] `GlobalTableV2.tsx` — versão com filtros laterais
- [ ] `GlobalTableV3.tsx` — versão compacta sem paginação

### 10.4 Feedback & Status
- [ ] `StatusBadge.tsx` — Pendente (âmbar), Confirmado (azul), Cancelado (vermelho), Concluído (verde)
- [ ] `PagamentoBadge.tsx` — badges específicos de pagamento
- [ ] `GlobalSnackbar.tsx` — Toaster do Sonner configurado com design tokens
- [ ] `GlobalLoading.tsx` — spinner full-page
- [ ] `GlobalModalLoading.tsx` — loading overlay em modal
- [ ] `StepProgressBar.tsx` — barra de progresso em etapas

### 10.5 Identidade & Navegação
- [ ] `AppSidebar.tsx` — nav completa, logo, grupos, user menu, logout
- [ ] `GlobalAvatar.tsx` — imagem circular com fallback iniciais
- [ ] `GlobalUserAvatarName.tsx` — avatar + nome + tipo
- [ ] `GlobalHelloUser.tsx` — saudação personalizada por hora
- [ ] `GlobalBackButton.tsx` — botão voltar com ícone
- [ ] `GlobalBorderButton.tsx` — botão com borda colorida
- [ ] `TableTags.tsx` — chips/tags para células de tabela
- [ ] `Typography.tsx` — h1-h6, body, caption, mono com variantes

### 10.6 Mapas
- [ ] `GoogleMapSelector.tsx` — seletor de coordenadas com marcador arrastável

---

## FASE 11 — Layout do Dashboard (app/(dashboard)/)

- [ ] `layout.tsx` — `AppSidebar` + área de conteúdo + `GlobalSnackbar` + `ThemeProvider`
- [ ] `page.tsx` — redirect para `/reservas/relatorio`
- [ ] Carregar `currentUser` do servidor e popular `userStore` via Provider
- [ ] Inicializar Firebase listener de notificações
- [ ] Carregar enums via `fetchEnums()` e popular `settingsStore`

---

## FASE 12 — Página de Login (app/(auth)/login/)

- [ ] `layout.tsx` — layout público sem sidebar
- [ ] `page.tsx` — formulário de login
  - Logo Tchilla centralizado
  - Input email + password (com toggle)
  - Botão "Entrar" com estado de loading
  - Mensagem de erro inline
  - Server Action `loginAction` + redirect
  - Design: fundo `--navy` com card branco, sombra `--shadow-lg`
  - Animação de entrada com Framer Motion

---

## FASE 13 — Página Reservas/Relatório (`/reservas/relatorio`)

**Componente:** `ReservaDashboard`

- [ ] KPI Cards (4): Total Reservas, Receita Mensal, Concluídas, Canceladas
  - Ícones via HugeIcons, delta % vs. mês anterior
  - Skeleton loading
- [ ] Tabela de reservas pendentes com ações rápidas (Aceitar / Cancelar / Ver detalhes)
- [ ] Drawer de detalhes da reserva com mapa (local), cliente, responsáveis, serviços
- [ ] Botões de status com confirmação via Modal
- [ ] Atualização otimista de estado
- [ ] Toast de sucesso/erro após ação
- [ ] Hook: `useDashboard` (client-side refetch a cada 60s)

---

## FASE 14 — Página Reservas/Listagem (`/reservas/listagem`)

**Componente:** `AgendamentoPage`

- [ ] Toggle de views: Cartões | Calendário | Tabela
- [ ] View Cartões: grid de `ReservaCard` com status badge, cliente, data, valor
- [ ] View Calendário: `react-big-calendar` integrado, eventos por status
- [ ] View Tabela: `GlobalTable` com colunas configuráveis, busca, paginação
- [ ] Filtros: status, data início/fim, tipo de evento
- [ ] Drawer de detalhes ao clicar em qualquer view
- [ ] Ações: Aceitar / Cancelar / Concluir com modal de confirmação
- [ ] Hook: `useAgendamento`

---

## FASE 15 — Gestão/Categorias (`/gestao/categorias`)

**Componente:** `CategoryPage`

- [ ] Lista de categorias em cards com foto, nome, descrição, subcategorias count
- [ ] Modal Criar Categoria (FormData: Nome, Descrição, Foto com `UploadImagemPreview`)
- [ ] Modal Editar Categoria
- [ ] Modal Confirmar Exclusão
- [ ] Accordion para expandir subcategorias de cada categoria
- [ ] Modal Criar/Editar Subcategoria (FormData: Nome, Descrição, Tipo, Foto, CategoriaId)
- [ ] Loading por categoria ao carregar subcategorias em paralelo
- [ ] Hook: `useCategories`

---

## FASE 16 — Gestão/Supervisores (`/gestao/supervisores`)

**Componente:** `SupervisoresPage`

- [ ] Tabela de supervisores: username, telefone, tipo (Admin/Supervisor)
- [ ] Modal Criar Supervisor: username, telefone, senha
- [ ] Checkbox "Tornar admin imediatamente" → `PUT /api/Supervisor/tornarAdmin`
- [ ] Badge Admin vs. Supervisor
- [ ] Hook: `useSupervisores`

---

## FASE 17 — Usuários/Clientes (`/usuarios/clientes`)

**Componente:** `ClientsPage`

- [ ] `GlobalTable` com colunas: Avatar+Nome, Email, Telefone, Verificado, Data Cadastro, Ações
- [ ] Badge de verificação (✓ / ✗)
- [ ] Drawer de detalhes do cliente
- [ ] Modal confirmar exclusão + `DELETE /api/Usuario/deletar/:id`
- [ ] Tabs: Todos / Novos (chamadas separadas)
- [ ] Hook: `useClients`

---

## FASE 18 — Usuários/Parceiros (`/usuarios/parceiros`)

**Componente:** `AgenciasPage`

- [ ] Tabela de parceiros: NIF, Nome Comercial, Email, Telefone, Aprovado, Endereço
- [ ] Modal Criar Parceiro (formulário multi-step: dados pessoais → endereço)
  - Step 1: NIF, Descrição, Nome, Email, Telefone, Senha
  - Step 2: Endereço com `GoogleMapSelector` e select de Província
  - `StepProgressBar` indicando progresso
  - Após criar: `POST /api/Auth/verify-account` (enviar OTP)
- [ ] Modal Editar Parceiro: `PUT /api/Agencia/update/:id`
- [ ] Modal Confirmar Exclusão
- [ ] Indicador de Aprovação com badge
- [ ] Hook: `useAgencias`

---

## FASE 19 — Usuários/Relatório (`/usuarios/relatorio`)

**Componente:** `UserDashBoard`

- [ ] KPI Cards: Total Usuários, Total Clientes, Total Parceiros (do mês atual)
- [ ] Seletor de Mês/Ano para métricas
- [ ] Gráfico de linhas: Usuários vs. Parceiros por mês (Recharts `LineChart`)
  - Dados de `GET /api/Metricas/usuarios-vs-parceiros/por-mes?ano=`
- [ ] Gráfico de barras: comparativo por mês
- [ ] Skeleton loading nos cards e gráficos
- [ ] Hook: `useDashboard` com parâmetros de mês/ano

---

## FASE 20 — Financeiro/Pagamentos (`/financeiro/pagamentos`)

**Componente:** `PaymentsPage`

- [ ] Tabs: Todos / Pendentes
- [ ] Tabela com: ID, Reserva ID, Método, Valor (AOA), Estado badge, Data, Referência, Ações
- [ ] Visualizar comprovativo: abrir `url` em modal ou nova aba
- [ ] Botão "Validar" para pagamentos pendentes → `PUT /api/Payment/validar/:id`
- [ ] Modal de confirmação antes de validar
- [ ] Refetch automático após validar
- [ ] Hook: `usePayments`

---

## FASE 21 — Gestão/Campanhas (`/gestao/campanhas`)

**Componente:** `CampanhasPage`

- [ ] Buscar e listar clientes: `GET /api/Usuario/getAll`
- [ ] Campo de busca para filtrar cliente destino
- [ ] Form: Título (max 60 chars), Mensagem (max 200 chars), contadores
- [ ] Preview do push notification
- [ ] Botão "Enviar" → `POST /api/Notificacao/push/notificar/user`
- [ ] Toast de sucesso/erro

---

## FASE 22 — Configurações (`/configuracoes`)

**Componente:** `ConfiguracoesPage`

- [ ] Exibir dados do usuário logado (foto, nome, email, tipo)
- [ ] Mostrar enums carregados (`settingsStore`)
- [ ] Seção de informações do app (versão, ambiente)
- [ ] Botão de Logout com confirmação

---

## FASE 23 — Notificações Firebase

- [ ] Hook `useNotifications` em Client Component no layout do dashboard
  - `onSnapshot` em `collection("notificacoes")` filtrado por `userId`
  - `orderBy("criadoEm", "desc")`
  - Sons por tipo: `message.mp3`, `notification.mp3`, etc. via `use-sound`
  - Set em memória Zustand para evitar notificações duplicadas
- [ ] `NotificationPanel.tsx` — popover com lista de notificações, marcar como lida
- [ ] Badge de contador no sino do topbar
- [ ] `updateDoc` para marcar `data.lida: true`
- [ ] `public/firebase-messaging-sw.js` para push em background

---

## FASE 24 — Client Hooks (src/hooks/)

- [ ] `useAgendamento.ts` — fetch + mutações de reservas
- [ ] `useClients.ts` — fetch + deletar clientes
- [ ] `useCategories.ts` — CRUD categorias + subcategorias
- [ ] `useAgencias.ts` — CRUD agências
- [ ] `useSupervisores.ts` — fetch + criar + promover
- [ ] `usePayments.ts` — fetch + validar pagamentos
- [ ] `useDashboard.ts` — métricas + polling
- [ ] `useNotifications.ts` — Firebase listener
- [ ] `useErrorHandler.ts` — tratamento centralizado de erros da API
- [ ] `useSettings.ts` — carregar e acessar enums do `settingsStore`

---

## FASE 25 — Qualidade & Finalização

### Acessibilidade (WCAG AA)
- [ ] Contraste mínimo 4.5:1 em todo texto
- [ ] Focus rings visíveis em todos os elementos interativos
- [ ] Skip link "Ir para o conteúdo" no topo
- [ ] Hierarquia semântica de headings (h1 → h2 → h3)
- [ ] aria-labels em botões de ícone
- [ ] Tabelas com `<caption>` e headers `scope`

### Performance
- [ ] `next/image` em todas as imagens externas
- [ ] Skeleton screens em todos os estados de loading
- [ ] `cache: "no-store"` nas Server Actions (dados admin sempre frescos)
- [ ] Lazy load de `react-big-calendar` e `@react-google-maps/api`
- [ ] `prefers-reduced-motion` nas animações Framer Motion

### Responsividade (Breakpoints)
- [ ] Mobile: sidebar como drawer deslizante (sm: <768px)
- [ ] Tablet: sidebar recolhida (md: 768-1024px)
- [ ] Desktop: sidebar fixa expandida (lg: >1024px)
- [ ] Tabelas com scroll horizontal em mobile
- [ ] Cards em grid responsivo (1 col mobile → 2 tablet → 4 desktop)

### Segurança
- [ ] Token nunca exposto em JS (HttpOnly cookie)
- [ ] Headers CSP configurados no `next.config.ts`
- [ ] `SameSite=Strict` no cookie
- [ ] Inputs sanitizados antes de enviar para a API
- [ ] Verificar roles (Supervisor/Admin) antes de ações críticas

### Error Handling
- [ ] `app/error.tsx` — Error Boundary global
- [ ] `app/not-found.tsx` — 404 personalizado
- [ ] Loading skeletons em todos os `loading.tsx`
- [ ] Retry automático em erros de rede
- [ ] Redirect para `/login` em qualquer 401

---

## FASE 26 — Deploy

- [ ] Configurar variáveis de ambiente na Vercel (Production e Preview)
- [ ] Configurar domínios: `admin.tchilla.com` (prod) e `admin.hmg.tchilla.com` (hmg)
- [ ] Verificar CORS na API .NET (allowOrigins incluindo domínios admin)
- [ ] Testar fluxo completo em homologação antes de subir produção
- [ ] Configurar `vercel.json` se necessário

---

## Mapa de Rotas Completo

| Rota Next.js | Componente | Status |
|---|---|---|
| `/login` | LoginPage | ⬜ Pendente |
| `/` | → redirect `/reservas/relatorio` | ⬜ Pendente |
| `/reservas/relatorio` | ReservaDashboard | ⬜ Pendente |
| `/reservas/listagem` | AgendamentoPage | ⬜ Pendente |
| `/gestao/categorias` | CategoryPage | ⬜ Pendente |
| `/gestao/supervisores` | SupervisoresPage | ⬜ Pendente |
| `/gestao/campanhas` | CampanhasPage | ⬜ Pendente |
| `/usuarios/clientes` | ClientsPage | ⬜ Pendente |
| `/usuarios/parceiros` | AgenciasPage | ⬜ Pendente |
| `/usuarios/relatorio` | UserDashBoard | ⬜ Pendente |
| `/financeiro/pagamentos` | PaymentsPage | ⬜ Pendente |
| `/configuracoes` | ConfiguracoesPage | ⬜ Pendente |

---

## Design System — Referência Rápida

### Cores Principais
| Token | Valor | Uso |
|---|---|---|
| `--blue` | `#14AAE9` | Primary, CTAs, links |
| `--navy` | `#0E2A42` | Sidebar background |
| `--pink` | `#FF4D8D` | Accent, destaques |
| `--gray-50` | `#F6F5F3` | Background geral |
| `--surface` | `#FFFFFF` | Cards e modais |
| `--success` | `#1F8A5B` | Status Concluído |
| `--danger` | `#DC2626` | Status Cancelado, erros |
| `--warning` | `#B45309` | Status Pendente |

### Status de Reserva → Cor
| Status | Cor | Badge bg | Badge text |
|---|---|---|---|
| Pendente | Âmbar | `#FEF3C7` | `#92400E` |
| Confirmado | Azul | `#E8F7FE` | `#0A6F9E` |
| Cancelado | Vermelho | `#FEE2E2` | `#991B1B` |
| Concluído | Verde | `#E7F6EE` | `#136B45` |

### Tipografia
- Fonte: **Inter** (Google Fonts)
- Body: 14px / line-height 1.5
- H1: 24px bold, H2: 20px semibold, H3: 16px semibold
- Caption: 12px / text-3 color

### Raios de Borda
- Botões: `r-md` (8px)
- Cards: `r-lg` (12px)
- Modais: `r-xl` (18px)
- Badges/Chips: `r-full` (999px)
- Inputs: `r-md` (8px)

### Sombras
- Cards: `shadow-sm`
- Modais/Popovers: `shadow-md`
- Dropdowns: `shadow-lg`

---

## Checklist de Entrega UI (pré-merge)

- [ ] Nenhum emoji usado como ícone (usar Lucide/HugeIcons SVG)
- [ ] `cursor-pointer` em todos os elementos clicáveis
- [ ] Hover states com transição `150-300ms`
- [ ] Focus ring visível em todos os interativos
- [ ] Contraste 4.5:1 verificado
- [ ] `prefers-reduced-motion` respeitado
- [ ] Responsivo em 375px, 768px, 1024px, 1440px
- [ ] Sem scroll horizontal em mobile
- [ ] Skeletons em todos os loading states
- [ ] Mensagens de erro próximas ao contexto do problema
- [ ] Botões desabilitados durante operações async
- [ ] Toast de feedback em todas as ações mutantes
