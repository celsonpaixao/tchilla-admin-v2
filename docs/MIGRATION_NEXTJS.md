# Tchilla Admin — Documento de Migração para Next.js

> **Objetivo:** Recriar o Tchilla Admin com Next.js, mantendo todos os fluxos, consumos de API, funcionalidades e lógica de negócio existentes. O design visual será definido separadamente; este documento cobre arquitetura, configurações, rotas, modelos, API, autenticação e tratamento de erros.

---

## 1. Visão Geral do App

**Tchilla Admin** é um painel administrativo interno para a equipe Tchilla. Somente supervisores e administradores autenticados têm acesso.

**Domínios:**
- Produção: `admin.tchilla.com`
- Homologação: `admin.hmg.tchilla.com`

**Backend:** API REST .NET em `https://api.hmg.tchilla.com/` (homologação) / `https://api.tchilla.com/` (produção)

**Autenticação:** JWT via `Bearer Token` — na versão Next.js será armazenado em **cookies HttpOnly** (não localStorage).

**Notificações em tempo real:** Firebase Firestore (listener `onSnapshot`)

---

## 2. Stack Atual (Vite + React) — Referência

| Camada | Tecnologia |
|---|---|
| Framework | React 19 + Vite |
| Roteamento | React Router DOM v7 |
| Estado global | Zustand |
| HTTP | Axios |
| UI Base | Radix UI + Tailwind CSS 3 + shadcn/ui |
| Ícones | Lucide React + HugeIcons |
| Formulários | React Hook Form (implícito) |
| Animações | Framer Motion |
| Calendário | React Big Calendar |
| Tabelas | TanStack Table |
| Notificações | Firebase Firestore |
| Push (service worker) | Firebase Messaging (VAPID) |
| Sons | Howler / use-sound |
| Mapas | Google Maps API |
| Gráficos | Recharts + MUI X Charts |
| Toast | Sonner |
| Máscaras | React Number Format |
| Datas | date-fns + dayjs |

---

## 3. Arquitetura Ideal — Next.js App Router

```
tchilla-admin-next/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx                  # Página de login pública
│   ├── (dashboard)/                       # Grupo de rotas protegidas
│   │   ├── layout.tsx                     # Layout com Sidebar + Header
│   │   ├── page.tsx                       # Redirect para /reservas/relatorio
│   │   ├── reservas/
│   │   │   ├── relatorio/page.tsx         # ReservaDashboard
│   │   │   ├── listagem/page.tsx          # AgendamentoPage
│   │   │   └── historico/page.tsx         # ReservaHistorico
│   │   ├── gestao/
│   │   │   ├── categorias/page.tsx        # CategoryPage
│   │   │   ├── supervisores/page.tsx      # SupervisoresPage
│   │   │   └── campanhas/page.tsx         # CampahasPage
│   │   ├── usuarios/
│   │   │   ├── clientes/page.tsx          # ClientsPage
│   │   │   ├── parceiros/page.tsx         # AgenciasPage
│   │   │   └── relatorio/page.tsx         # UserDashBoard
│   │   ├── financeiro/
│   │   │   └── pagamentos/page.tsx        # PaymentsPage
│   │   └── configuracoes/page.tsx         # ConfiguracoesPage
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts             # Server Action: faz login e seta cookie
│   │   │   └── logout/route.ts            # Server Action: limpa cookie
│   │   └── proxy/[...path]/route.ts       # Proxy opcional para a API .NET
│   ├── layout.tsx                         # Root layout
│   ├── not-found.tsx
│   └── error.tsx
├── src/
│   ├── actions/                           # Server Actions Next.js
│   │   ├── auth.actions.ts
│   │   ├── reserva.actions.ts
│   │   └── ...
│   ├── components/
│   │   ├── global/                        # Componentes reutilizáveis
│   │   │   ├── AppSidebar.tsx
│   │   │   ├── GlobalButton.tsx
│   │   │   ├── GlobalInput.tsx
│   │   │   ├── GlobalTable.tsx
│   │   │   ├── GlobalModal.tsx
│   │   │   ├── GlobalDrawer.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── Typography.tsx
│   │   │   └── ...
│   │   ├── ui/                            # shadcn/ui components
│   │   ├── agendamentos/
│   │   ├── categorias/
│   │   ├── parceiros/
│   │   ├── clientes/
│   │   ├── pagamentos/
│   │   ├── supervisores/
│   │   ├── notificacoes/
│   │   └── dashboard/
│   ├── hooks/                             # Client hooks
│   │   ├── useAgendamento.ts
│   │   ├── useClients.ts
│   │   ├── useCategories.ts
│   │   ├── useAgencias.ts
│   │   ├── useSupervisores.ts
│   │   ├── usePayments.ts
│   │   ├── useDashboard.ts
│   │   ├── useNotifications.ts
│   │   ├── useErrorHandler.ts
│   │   └── useSettings.ts
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts                  # Axios client (client-side)
│   │   │   └── server.ts                  # Fetch para server components
│   │   ├── auth/
│   │   │   ├── cookies.ts                 # Leitura/escrita de cookies
│   │   │   └── session.ts                 # Verificação de sessão
│   │   ├── firebase.ts
│   │   └── utils.ts
│   ├── stores/                            # Zustand stores (apenas client state)
│   │   ├── authStore.ts
│   │   ├── userStore.ts
│   │   ├── notificationStore.ts
│   │   ├── snackbarStore.ts
│   │   ├── agendamentoStore.ts
│   │   ├── pagamentoStore.ts
│   │   └── settingsStore.ts
│   ├── types/                             # Todas as interfaces/tipos
│   │   ├── user.types.ts
│   │   ├── reserva.types.ts
│   │   ├── payment.types.ts
│   │   ├── category.types.ts
│   │   ├── agencia.types.ts
│   │   ├── supervisor.types.ts
│   │   ├── client.types.ts
│   │   ├── metrics.types.ts
│   │   ├── notification.types.ts
│   │   └── common.types.ts
│   ├── constants/
│   │   ├── routes.ts                      # Mapa de rotas do app
│   │   └── app.constants.ts
│   └── middleware.ts                      # Proteção de rotas via cookie
├── public/
│   ├── sounds/                            # boot_down, error, info, message, etc.
│   └── assets/
├── .env.local                             # Variáveis locais
├── .env.production                        # Variáveis de produção
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. Rotas do App (Mapeamento Atual → Next.js)

| Rota Atual (React Router) | Rota Next.js (App Router) | Componente Página | Protegida |
|---|---|---|---|
| `/` | `/` | Redirect → `/reservas/relatorio` | Sim |
| `/auth` | `/login` | `app/(auth)/login/page.tsx` | Não |
| `/dashboard` | `/dashboard` | `app/(dashboard)/dashboard/page.tsx` | Sim |
| `/reservas/list` | `/reservas/listagem` | `app/(dashboard)/reservas/listagem/page.tsx` | Sim |
| `/reservas/dashboard` | `/reservas/relatorio` | `app/(dashboard)/reservas/relatorio/page.tsx` | Sim |
| `/reservas/history` | `/reservas/historico` | `app/(dashboard)/reservas/historico/page.tsx` | Sim |
| `/gestao/categorias` | `/gestao/categorias` | `app/(dashboard)/gestao/categorias/page.tsx` | Sim |
| `/gestao/supervisores` | `/gestao/supervisores` | `app/(dashboard)/gestao/supervisores/page.tsx` | Sim |
| `/gestao/campanhas` | `/gestao/campanhas` | `app/(dashboard)/gestao/campanhas/page.tsx` | Sim |
| `/usuarios/clientes` | `/usuarios/clientes` | `app/(dashboard)/usuarios/clientes/page.tsx` | Sim |
| `/usuarios/parceiros` | `/usuarios/parceiros` | `app/(dashboard)/usuarios/parceiros/page.tsx` | Sim |
| `/usuarios/relatorio` | `/usuarios/relatorio` | `app/(dashboard)/usuarios/relatorio/page.tsx` | Sim |
| `/financeiro/pagamentos` | `/financeiro/pagamentos` | `app/(dashboard)/financeiro/pagamentos/page.tsx` | Sim |
| `/configuracoes` | `/configuracoes` | `app/(dashboard)/configuracoes/page.tsx` | Sim |

**Rotas planejadas mas não implementadas:**
- `/financeiro/transfer` — Transferências
- `/financeiro/historico` — Histórico financeiro
- `/financeiro/relatorio` — Relatório financeiro
- `/usuarios/prestadores` — Prestadores (endpoint existe no backend)

---

## 5. Todos os Endpoints da API .NET

### Prefixo base: `https://api.hmg.tchilla.com` (HMG) / `https://api.tchilla.com` (PROD)

### 5.1 Auth
| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| `POST` | `/api/Auth/login` | Login com email+senha+role | Não |
| `POST` | `/api/Auth/verify-account` | Envia OTP para email | Não |
| `POST` | `/api/Auth/validate-account` | Valida OTP | Não |
| `PUT` | `/api/Auth/logout` | Logout | Sim |
| `POST` | `/api/Auth/register/agencia` | Registro de agência | Não |
| `POST` | `/api/Auth/register/prestador` | Registro de prestador | Não |
| `POST` | `/api/Auth/register/supervisor` | Registro de supervisor | Sim |

**Corpo do login:**
```json
{
  "emailOrUsername": "celson@tchilla.com",
  "password": "senha123",
  "role": "supervisor"
}
```
**Resposta do login:**
```json
{
  "isSuccess": true,
  "message": "...",
  "errorMessage": "",
  "data": "<JWT_TOKEN>"
}
```

### 5.2 Usuário
| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| `GET` | `/api/Usuario/getInfoByToken` | Dados do usuário logado | Sim |
| `GET` | `/api/Usuario/getAll` | Lista todos os clientes | Sim |
| `GET` | `/api/Usuario/getAll/novos` | Novos clientes | Sim |
| `GET` | `/api/Usuario/getOne/:id` | Detalhes de um cliente | Sim |
| `DELETE` | `/api/Usuario/deletar/:id` | Deletar cliente | Sim |

### 5.3 Reservas
| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| `GET` | `/api/Reserva/getAll/supervisor` | Todas as reservas | Sim |
| `GET` | `/api/Reserva/getAll/Pendente/status` | Reservas pendentes | Sim |
| `GET` | `/api/Reserva/get/:id` | Reserva por ID | Sim |
| `PUT` | `/api/Reserva/AtualizarStatus` | Atualizar status da reserva | Sim |
| `GET` | `/api/Reserva/metricas` | Métricas de reservas (dashboard) | Sim |

**Status codes de reserva:**
- `1` → Confirmado
- `2` → Cancelado
- `3` → Concluído

**Corpo AtualizarStatus:**
```json
{ "id": 123, "status": 1 }
```

### 5.4 Pagamentos
| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| `POST` | `/api/Payment/getAll` | Todos os pagamentos | Sim |
| `GET` | `/api/Payment/getAll/Pendente/status` | Pagamentos pendentes | Sim |
| `PUT` | `/api/Payment/validar/:id` | Validar pagamento | Sim |

### 5.5 Categorias
| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| `GET` | `/api/Categoria/getAll` | Todas as categorias | Sim |
| `POST` | `/api/Categoria/create` | Criar categoria (FormData: Nome, Descricao, Foto) | Sim |
| `PUT` | `/api/Categoria/update?id=&Nome=&Descricao=` | Atualizar categoria | Sim |
| `DELETE` | `/api/Categoria/Delete/:id` | Deletar categoria | Sim |

### 5.6 Subcategorias
| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| `GET` | `/api/SubCategoria/getAll/:categoryId` | Subcategorias por categoria | Sim |
| `GET` | `/api/SubCategoria/getAll/servicos` | Subcategorias tipo serviço | Não |
| `GET` | `/api/SubCategoria/getAll/espacos` | Subcategorias tipo espaço | Não |
| `POST` | `/api/SubCategoria/create` | Criar subcategoria (FormData) | Sim |
| `PUT` | `/api/SubCategoria/update` | Atualizar subcategoria (FormData) | Sim |
| `DELETE` | `/api/SubCategoria/Delete?id=` | Deletar subcategoria | Sim |

### 5.7 Agências (Parceiros)
| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| `GET` | `/api/Agencia/getAll` | Todas as agências | Sim |
| `PUT` | `/api/Agencia/update/:id` | Atualizar agência | Sim |
| `DELETE` | `/api/Agencia/delete/:id` | Deletar agência | Sim |

### 5.8 Prestadores
| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| `GET` | `/api/Prestador/getAll` | Todos os prestadores | Sim |
| `PUT` | `/api/Prestador/aprovar?id=` | Aprovar prestador | Sim |
| `PUT` | `/api/Prestador/update/:id` | Atualizar prestador | Sim |
| `DELETE` | `/api/Prestador/delete/:id` | Deletar prestador | Sim |

### 5.9 Supervisores
| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| `GET` | `/api/Supervisor/getAll` | Todos os supervisores | Sim |
| `PUT` | `/api/Supervisor/tornarAdmin?id=` | Promover a admin | Sim |

### 5.10 Métricas
| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| `GET` | `/api/Metricas/geral` | Métricas gerais de agendamentos | Sim |
| `GET` | `/api/Metricas/usuarios?mes=&ano=` | Métricas de usuários por mês/ano | Sim |
| `GET` | `/api/Metricas/usuarios-vs-parceiros/por-mes?ano=` | Gráfico usuários vs parceiros | Sim |

### 5.11 Endereços
| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| `GET` | `/api/Endereco/getAll` | Todos os endereços | Não |
| `GET` | `/api/Endereco/get/:id` | Endereço por ID | Sim |
| `POST` | `/api/Endereco/create` | Criar endereço | Sim |
| `PUT` | `/api/Endereco/update?enderecoId=` | Atualizar endereço | Sim |
| `DELETE` | `/api/Endereco/delete/:id` | Deletar endereço | Sim |

### 5.12 Províncias
| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| `GET` | `/api/Provincia/getAll/:paisId` | Províncias por país | Não |

### 5.13 Configurações / Enums
| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| `GET` | `/api/Enum/enums` | Enums do app (TipoEvento, Status, etc.) | Não |

### 5.14 Notificações / Campanhas
| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| `POST` | `/api/Notificacao/push/notificar/user` | Enviar push para usuário específico | Sim |

---

## 6. Modelos de Dados (Types)

### 6.1 Auth / Usuário

```typescript
// Resposta padrão da API
interface ApiResponse<T = any> {
  isSuccess: boolean;
  message: string;
  errorMessage: string;
  data: T;
}

// Login
interface LoginRequest {
  emailOrUsername: string;
  password: string;
  role: "supervisor" | "Parceiro";
}

// Usuário logado (retorno de /api/Usuario/getInfoByToken)
interface UsuarioInterface {
  id: number;
  nome: string;
  telefone: string;
  email: string;
  foto: string | null;
  tipo: "Supervisor" | "Agencia" | "Prestador" | "Visitante" | string;
  dataCriacao: string;
  dataAtualizacao?: string;
  dataRemocao: string | null;
  verificado: boolean;
}

// Tipos de usuário
enum UserType {
  AGENCIA = "Agencia",
  PRESTADOR = "Prestador",
  SUPERVISOR = "Supervisor",
  VISITANTE = "Visitante",
}
```

### 6.2 Reservas

```typescript
interface ReservaInterface {
  id: number;
  dataInicio: string;          // ISO date
  dataFim: string;             // ISO date
  precoTotal: number;
  pago: boolean;
  status: "Pendente" | "Confirmado" | "Cancelado" | "Concluido";
  tipoEvento: string;
  local: string;
  imagem: string | null;
  capacidade: number;
  cliente: {
    id: number;
    nome: string;
    email: string;
    telefone: string;
    tipo: string;
    foto: string;
    dataCriacao: string;
  };
  responsaveis: Array<{
    id: number;
    nome: string;
    foto: string;
    tipo: string;
    avaliacao: number;
    quantidadeAvaliacoes: number;
  }>;
  servicos: Array<{ id: number; nome: string }>;
}
```

### 6.3 Pagamentos

```typescript
interface PagamentoInterface {
  id: number;
  reservaId: number;
  url: string;                 // URL do comprovativo
  estado: "Pendente" | "Confirmado" | "Cancelado" | "Concluido";
  criadoEm: string;
  atualizadoEm?: string | null;
  codigoEkwanza?: string | null;
  referencia?: string | null;
  dataExpiracao?: string | null;
  valor: number;
  metodoPagamento: string;
}
```

### 6.4 Categorias

```typescript
interface CategoryData {
  id: number;
  nome: string;
  descricao: string;
  foto: string;                // URL da imagem
  subcategorias?: SubCategoryData[];
}

interface SubCategoryData {
  id: number;
  nome: string;
  descricao: string;
  tipo: number;                // 1=Serviço, 2=Espaço (verificar com backend)
  foto: string;
  categoriaId: number;
}
```

### 6.5 Agências (Parceiros)

```typescript
interface AgenciaData {
  id: number;
  nif: string | null;
  descricao: string | null;
  nomeComercial: string | null;
  tipo: string;
  aprovado: boolean;
  usuario: {
    id: number;
    nome: string;
    email: string;
    foto?: string;
    telefone: string;
    dataCriacao: string;
    tipo: string;
    verificado: boolean;
  };
  endereco?: {
    nome: string;
    complemento: string;
    bairro: string;
    numero: string;
    rua: string;
    cidade: string;
    pais: string;
    provincia: string;
    cep: string;
    latitude: number;
    longitude: number;
  } | null;
}

// Registro de agência (POST /api/Auth/register/agencia)
interface AgenciaCreateRequest {
  nif: string;
  descricao: string;
  usuarioDto: {
    nome: string;
    email: string;
    telefone: string;
    senha: string;
  };
  enderecoDto: {
    nome: string;
    complemento: string;
    bairro: string;
    numero: string;
    rua: string;
    cidade: string;
    pais: string;
    provincia: string;
    cep: string;
    latitude: number;
    longitude: number;
  };
}
```

### 6.6 Prestadores

```typescript
interface PrestadorData {
  id: number;
  nif: string;
  descricao: string;
  tipo: string;
  aprovado: boolean;
  usuario: {
    id: number;
    nome: string;
    telefone: string;
    email: string;
    foto?: string;
    dataCriacao: string;
  };
  enderecoDto: {
    numero: string;
    rua: string;
    cidade: string;
    provinciaId: number;
    cep: string;
    latitude: number;
    longitude: number;
    principal: boolean;
  };
}
```

### 6.7 Supervisores

```typescript
interface SupervisorResponse {
  id: number;
  username: string;
  telefone: string;
  admin: boolean;
}

interface CreateSupervisorRequest {
  username: string;
  telefone: string;
  senha: string;
}
```

### 6.8 Clientes

```typescript
interface ClientesData {
  id: number;
  nome: string;
  foto: string | null;
  email: string;
  telefone: string;
  dataCriacao: string;
  verificado: boolean;
}
```

### 6.9 Métricas

```typescript
// Métricas gerais de reservas
interface DashboardMetrics {
  totalReserva: number;
  receitaMensal: number;
  reservaConcluidas: number;
  reservaCancelados: number;
}

// Métricas gerais de agendamentos (página Reservas/Relatório)
interface AgendamentoMetrics {
  numeroClientes: number;
  numeroParceiros: number;
  totalReservas: number;
  reservasConcluidas: number;
  reservasCanceladas: number;
  reservasSupervisor: number;
  receitaTotal: number;
}

// Métricas de usuários por mês
interface UserMetrics {
  totalUsuarios: number;
  totalClientes: number;
  totalParceiros: number;
  ano: number;
  mes: number;
}

// Dados do gráfico usuários vs parceiros
interface UserChartData {
  ano: number;
  dados: Array<{
    mes: number;
    totalUsuarios: number;
    totalClientes: number;
    totalParceiros: number;
  }>;
}
```

### 6.10 Notificações (Firebase Firestore)

```typescript
// Documento Firestore: collection "notificacoes"
interface FirebaseNotification {
  id: string;
  criadoEm: FirebaseTimestamp;
  data: {
    reservaId: string;
    imagem: string;
    lida: boolean;
    mensagem: string;
    tipo: string;
    titulo: string;
    userId: number;
  };
}

// Query: where("data.userId", "==", userId), orderBy("criadoEm", "desc")
// Update para marcar como lida: updateDoc → "data.lida": true
```

### 6.11 Enums / Configurações

```typescript
// GET /api/Enum/enums
interface SettingsAppEnum {
  name: string;
  values: string[];
}
// Ex: { name: "TipoEvento", values: ["Aniversário", "Casamento", ...] }
// Ex: { name: "StatusReserva", values: ["Pendente", "Confirmado", ...] }
```

### 6.12 Endereços

```typescript
interface EnderecoResponse {
  id: number;
  nome: string;
  complemento: string;
  bairro: string;
  numero: string;
  cep: string;
  rua: string;
  cidade: string;
  pais: string;
  provincia: string;
  latitude: number;
  longitude: number;
}

interface Provincia {
  id: number;
  nome: string;
}
```

### 6.13 Campanhas

```typescript
// POST /api/Notificacao/push/notificar/user
interface CampanhaRequest {
  userId: number;
  titulo: string;
  mensagem: string;
  tipo: "Geral";
}
```

---

## 7. Fluxo de Autenticação

### 7.1 Fluxo Atual (React + localStorage)
1. Usuário preenche email + senha
2. POST `/api/Auth/login` com `role: "supervisor"`
3. Resposta retorna `data: "<JWT_TOKEN>"`
4. Token armazenado em `localStorage` (chave em base64)
5. Zustand `authStore` lê o localStorage na inicialização
6. `ProtectedRoute` verifica `localStorage` e redireciona se ausente
7. Todas as requisições passam o token via `Authorization: Bearer <token>`
8. Em caso de 401: limpa token + redireciona para `/auth`

### 7.2 Fluxo Novo (Next.js + Cookies HttpOnly)

```
[Cliente]                     [Next.js Server]              [API .NET]
   |                               |                            |
   |-- POST /api/auth/login -----> |                            |
   |   { email, senha }            |-- POST /api/Auth/login --> |
   |                               |   { emailOrUsername, ... } |
   |                               |<-- { data: "JWT_TOKEN" } --|
   |                               |                            |
   |                               |-- Set-Cookie: token=JWT    |
   |                               |   HttpOnly, Secure,        |
   |                               |   SameSite=Strict          |
   |<-- 200 OK --------------------|                            |
   |                               |                            |
   |-- GET /reservas/listagem ---> |                            |
   |   Cookie: token=JWT (auto)    |                            |
   |                               |-- GET /api/Reserva/... --> |
   |                               |   Authorization: Bearer JWT|
   |<-- HTML (SSR) ----------------|                            |
```

**Vantagens:**
- Sem XSS (token inacessível ao JavaScript)
- Sem CSRF se usar `SameSite=Strict`
- Middleware Next.js pode proteger rotas server-side

### 7.3 Middleware de Proteção (Next.js)

```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/login"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("tchilla_token")?.value;
  const isPublic = PUBLIC_ROUTES.some(r => request.nextUrl.pathname.startsWith(r));

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/reservas/relatorio", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
```

### 7.4 Utilitário de Cookies

```typescript
// src/lib/auth/cookies.ts
import { cookies } from "next/headers";

const COOKIE_NAME = "tchilla_token";

export async function getToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

export async function setToken(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    path: "/",
  });
}

export async function clearToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
```

---

## 8. Camada HTTP — Cliente API

### 8.1 Client-side (Axios para componentes cliente)

```typescript
// src/lib/api/client.ts
import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 100_000,
});

// Token vem do cookie via document.cookie não é acessível (HttpOnly)
// O token precisa ser passado via contexto ou via Server Action
// Para chamadas client-side: usar route handlers do Next.js como proxy
```

### 8.2 Server-side (fetch nativo para Server Components / Server Actions)

```typescript
// src/lib/api/server.ts
import { getToken } from "@/lib/auth/cookies";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

async function serverFetch<T>(
  path: string,
  method: HttpMethod = "GET",
  body?: unknown,
  params?: Record<string, string>
): Promise<T> {
  const token = await getToken();
  const baseURL = process.env.API_URL; // server-only

  let url = `${baseURL}${path}`;
  if (params) {
    url += "?" + new URLSearchParams(params).toString();
  }

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store", // dados sempre frescos para admin
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiException(
      data.message || data.error || "Erro desconhecido",
      res.status
    );
  }

  return res.json();
}
```

### 8.3 Erros — ApiException

```typescript
// src/types/common.types.ts
export enum ApiErrorType {
  NETWORK = "NETWORK_ERROR",
  TIMEOUT = "TIMEOUT_ERROR",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  VALIDATION = "VALIDATION_ERROR",
  SERVER = "SERVER_ERROR",
  UNKNOWN = "UNKNOWN_ERROR",
}

export class ApiException extends Error {
  status: number;
  type: ApiErrorType;
  details?: Record<string, unknown>;

  constructor(message: string, status: number, type?: ApiErrorType, details?: Record<string, unknown>) {
    super(message);
    this.name = "ApiException";
    this.status = status;
    this.type = type ?? statusToType(status);
    this.details = details;
  }
}

function statusToType(status: number): ApiErrorType {
  const map: Record<number, ApiErrorType> = {
    400: ApiErrorType.VALIDATION,
    401: ApiErrorType.UNAUTHORIZED,
    403: ApiErrorType.FORBIDDEN,
    404: ApiErrorType.NOT_FOUND,
    408: ApiErrorType.TIMEOUT,
    500: ApiErrorType.SERVER,
  };
  return map[status] ?? ApiErrorType.UNKNOWN;
}
```

---

## 9. Tratamento de Erros — Estratégia Ideal

### 9.1 Erros de API

```typescript
// Para Server Actions: retornar resultado tipado
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: number };

// Exemplo de Server Action com tratamento correto
export async function fetchReservas(): Promise<ActionResult<ReservaInterface[]>> {
  try {
    const data = await serverFetch<ApiResponse<ReservaInterface[]>>(
      "/api/Reserva/getAll/supervisor"
    );
    return { success: true, data: data.data };
  } catch (error) {
    if (error instanceof ApiException) {
      if (error.status === 401) {
        // Redirecionar para login
        redirect("/login");
      }
      return { success: false, error: error.message, code: error.status };
    }
    return { success: false, error: "Erro inesperado" };
  }
}
```

### 9.2 Mapa de Mensagens de Erro

```typescript
export const ERROR_MESSAGES: Record<ApiErrorType, string> = {
  [ApiErrorType.NETWORK]: "Falha na conexão. Verifique sua internet.",
  [ApiErrorType.TIMEOUT]: "A requisição demorou muito para responder.",
  [ApiErrorType.UNAUTHORIZED]: "Sessão expirada. Faça login novamente.",
  [ApiErrorType.FORBIDDEN]: "Você não tem permissão para acessar este recurso.",
  [ApiErrorType.NOT_FOUND]: "O recurso solicitado não foi encontrado.",
  [ApiErrorType.VALIDATION]: "Os dados enviados contêm erros.",
  [ApiErrorType.SERVER]: "Erro no servidor. Tente novamente mais tarde.",
  [ApiErrorType.UNKNOWN]: "Ocorreu um erro inesperado.",
};
```

### 9.3 Error Boundary Global

```typescript
// app/error.tsx — captura erros de renderização
"use client";

export default function GlobalError({ error, reset }: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Algo deu errado</h2>
      <button onClick={reset}>Tentar novamente</button>
    </div>
  );
}
```

### 9.4 Notificações de Erro (Toast)

Usar **Sonner** (mesma lib do app atual), integrado com Zustand `snackbarStore` para estados client-side.

---

## 10. Estado Global — Zustand Stores (Next.js)

> No Next.js com App Router, os stores Zustand devem ser usados **apenas em Client Components** (`"use client"`). Server Components não podem acessar estado global do cliente.

### 10.1 Auth Store (adaptado para cookies)

```typescript
// src/stores/authStore.ts
"use client";
import { create } from "zustand";

interface AuthStore {
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
}

// SEM localStorage — o token está no cookie HttpOnly
// O estado "isAuthenticated" é derivado da presença do cookie (verificado no middleware)
export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  setAuthenticated: (value) => set({ isAuthenticated: value }),
}));
```

### 10.2 User Store

```typescript
// src/stores/userStore.ts — mantém dados do usuário logado em memória
import { create } from "zustand";
import type { UsuarioInterface } from "@/types/user.types";

interface UserStore {
  currentUser: UsuarioInterface | null;
  setCurrentUser: (user: UsuarioInterface) => void;
  clearUser: () => void;
  isSupervisor: () => boolean;
}

export const useUserStore = create<UserStore>((set, get) => ({
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  clearUser: () => set({ currentUser: null }),
  isSupervisor: () => {
    const tipo = get().currentUser?.tipo?.toLowerCase();
    return tipo === "supervisor";
  },
}));
```

### 10.3 Notification Store, Snackbar Store, Agendamento Store, Pagamento Store

Mantém a mesma lógica atual, apenas removendo referências a `localStorage` e `window.*`.

---

## 11. Firebase — Notificações em Tempo Real

### 11.1 Configuração

```typescript
// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);

// messaging só funciona no browser
export const getFirebaseMessaging = async () => {
  if (await isSupported()) {
    return getMessaging(app);
  }
  return null;
};
```

### 11.2 Hook de Notificações (Client Component)

A lógica do `useNotifications` permanece idêntica ao atual. O listener `onSnapshot` escuta a collection `notificacoes` filtrando por `data.userId`.

**Importante para Next.js:** O hook deve estar em um componente marcado com `"use client"` e montado no layout da área autenticada.

---

## 12. PendingNotificationStore — Adaptação para Cookies

No app atual, o `PendingNotificationStore` usa `localStorage` para rastrear IDs já notificados (evitar notificações duplas de reservas/pagamentos pendentes).

**Solução no Next.js:** Usar `sessionStorage` ou `IndexedDB` (via `idb-keyval`) para este controle, já que são dados transitórios de sessão do browser e não precisam sobreviver ao fechamento do browser. Alternativamente, manter um Set em memória dentro do Zustand store.

---

## 13. Configuração de Variáveis de Ambiente

### 13.1 `.env.local` (desenvolvimento)

```bash
# API
NEXT_PUBLIC_API_URL=https://api.hmg.tchilla.com
API_URL=https://api.hmg.tchilla.com   # server-only (sem NEXT_PUBLIC_)

# Firebase (todas NEXT_PUBLIC pois são usadas no cliente)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDheF9baAGJE8BBNKaCRoFs537nxLjvIsw
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tchilla-hmg.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://tchilla-hmg-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tchilla-hmg
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tchilla-hmg.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=879571708226
NEXT_PUBLIC_FIREBASE_APP_ID=1:879571708226:web:6a4c958392e7a202dec0db
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-DC6QG3HC2N
NEXT_PUBLIC_VAPID_KEY=BInGMsN7eX8vC-mTRhKBxX025SPLI3HScdCSY7GS-N1isWEOoSsLhLf_z4bvHplOOjPYeguy_a6s1ISyi1T5hlk

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBT4Ua9089gMzCe1MQ2C-eV_xHOwLPEWJA

# Cookie
COOKIE_NAME=tchilla_token
COOKIE_SECRET=<gerar-string-aleatoria-forte-para-producao>
```

### 13.2 `.env.production`

```bash
# API Produção
NEXT_PUBLIC_API_URL=https://api.tchilla.com
API_URL=https://api.tchilla.com

# Firebase Produção (configs do projeto Firebase de prod)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tchilla-prod
# ... demais configs de produção

# Domínio
NEXT_PUBLIC_APP_URL=https://admin.tchilla.com
```

### 13.3 Regra Fundamental

- **`NEXT_PUBLIC_*`** → acessível no browser (bundle do cliente)
- **Sem prefixo** → apenas server-side (Node.js). Usar para `API_URL`, `COOKIE_SECRET`, credentials sensíveis

---

## 14. Configuração das Libs

### 14.1 `next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permitir imagens externas (avatares, fotos dos usuários)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.tchilla.com",
      },
      {
        protocol: "https",
        hostname: "api.hmg.tchilla.com",
      },
    ],
  },

  // Rewrite para evitar CORS em dev (opcional)
  async rewrites() {
    return process.env.NODE_ENV === "development"
      ? [
          {
            source: "/api-proxy/:path*",
            destination: `${process.env.API_URL}/:path*`,
          },
        ]
      : [];
  },

  // Headers de segurança
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
```

### 14.2 `tailwind.config.ts`

Migrar as mesmas configurações de cores customizadas do app atual:
- `primary`: escala azul `#1c2b3f` (950) como cor principal
- `gray`: escala warm gray
- `table.th_text_color`: `#8897AE` / `th_text_bg`: `#F9FAFB`
- Plugins: `tailwindcss-animate`
- Fonte: Inter

### 14.3 `components.json` (shadcn/ui)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### 14.4 `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## 15. Dependências Recomendadas (package.json)

```json
{
  "dependencies": {
    "next": "^15.x",
    "react": "^19.x",
    "react-dom": "^19.x",
    "typescript": "^5.x",

    "axios": "^1.x",
    "zustand": "^5.x",

    "tailwindcss": "^3.x",
    "tailwindcss-animate": "^1.x",
    "class-variance-authority": "^0.x",
    "clsx": "^2.x",
    "tailwind-merge": "^3.x",

    "@radix-ui/react-alert-dialog": "^1.x",
    "@radix-ui/react-avatar": "^1.x",
    "@radix-ui/react-checkbox": "^1.x",
    "@radix-ui/react-dialog": "^1.x",
    "@radix-ui/react-dropdown-menu": "^2.x",
    "@radix-ui/react-label": "^2.x",
    "@radix-ui/react-select": "^2.x",
    "@radix-ui/react-separator": "^1.x",
    "@radix-ui/react-slot": "^1.x",
    "@radix-ui/react-tooltip": "^1.x",

    "lucide-react": "^0.x",
    "@hugeicons/react": "^1.x",
    "@hugeicons/core-free-icons": "^1.x",

    "firebase": "^12.x",

    "framer-motion": "^12.x",
    "sonner": "^2.x",
    "next-themes": "^0.x",

    "@tanstack/react-table": "^8.x",
    "react-big-calendar": "^1.x",
    "recharts": "^2.x",

    "date-fns": "^4.x",
    "dayjs": "^1.x",

    "@react-google-maps/api": "^2.x",

    "howler": "^2.x",
    "use-sound": "^5.x",

    "react-number-format": "^5.x",
    "react-select": "^5.x",
    "use-debounce": "^10.x",

    "cookies-next": "^5.x"
  }
}
```

**Nova dependência chave:** `cookies-next` — helper para leitura/escrita de cookies no Next.js tanto client quanto server side.

---

## 16. Fluxos Funcionais Completos

### 16.1 Login
1. Usuário acessa `/login`
2. Preenche email + senha
3. Submit → Server Action `loginAction(formData)`
4. Server Action chama `POST /api/Auth/login`
5. Se sucesso: `setToken(token)` via cookie HttpOnly + redirect `/reservas/relatorio`
6. Se erro: retorna mensagem de erro para exibir no toast

### 16.2 Carregamento de Dados do Usuário
1. Qualquer Server Component no layout autenticado chama `getToken()` → chama `GET /api/Usuario/getInfoByToken`
2. Passa os dados via props para Client Components
3. Client Component popula o `userStore` com `setCurrentUser()`

### 16.3 Reservas — Fluxo Completo
1. Listagem: `GET /api/Reserva/getAll/supervisor`
2. Pendentes (dashboard): `GET /api/Reserva/getAll/Pendente/status`
3. Aceitar: `PUT /api/Reserva/AtualizarStatus` `{ id, status: 1 }`
4. Cancelar: `PUT /api/Reserva/AtualizarStatus` `{ id, status: 2 }`
5. Concluir: `PUT /api/Reserva/AtualizarStatus` `{ id, status: 3 }`
6. Atualização otimista: estado local atualizado imediatamente
7. Views disponíveis: cartões, calendário, tabela

### 16.4 Pagamentos — Fluxo Completo
1. `POST /api/Payment/getAll` → lista todos
2. Pendentes: `GET /api/Payment/getAll/Pendente/status`
3. Validar comprovativo: `PUT /api/Payment/validar/:id`
4. Após validar: refetch automático da lista

### 16.5 Categorias — Fluxo Completo
1. `GET /api/Categoria/getAll` → lista categorias
2. Para cada categoria: `GET /api/SubCategoria/getAll/:categoriaId` (paralelo com Promise.all)
3. Criar: `POST /api/Categoria/create` (FormData: Nome, Descricao, Foto)
4. Atualizar: `PUT /api/Categoria/update?id=&Nome=&Descricao=` (FormData)
5. Deletar: `DELETE /api/Categoria/Delete/:id`

### 16.6 Agências — Fluxo Completo
1. `GET /api/Agencia/getAll` → lista agências
2. Criar: `POST /api/Auth/register/agencia` → após criar, envia OTP: `POST /api/Auth/verify-account`
3. Atualizar: `PUT /api/Agencia/update/:id`
4. Deletar: `DELETE /api/Agencia/delete/:id`

### 16.7 Supervisores — Fluxo Completo
1. `GET /api/Supervisor/getAll` → lista supervisores
2. Criar: `POST /api/Auth/register/supervisor`
3. Se criado com `admin: true`: após criar, busca o novo supervisor e `PUT /api/Supervisor/tornarAdmin?id=`

### 16.8 Notificações Firebase — Fluxo
1. Após login, obtém `userId` do usuário logado
2. Inicia listener Firestore: `collection("notificacoes")` → `where("data.userId", "==", userId)` → `orderBy("criadoEm", "desc")`
3. Novas notificações chegam em tempo real
4. Marcar como lida: `updateDoc` → `"data.lida": true`
5. Sons customizados para cada tipo de notificação (arquivos em `/public/sounds/`)

### 16.9 Campanhas Push
1. Listagem de clientes: `GET /api/Usuario/getAll`
2. Selecionar cliente destino
3. Preencher título + mensagem
4. `POST /api/Notificacao/push/notificar/user` `{ userId, titulo, mensagem, tipo: "Geral" }`

### 16.10 Enums / Configurações
1. Na inicialização do app (layout raiz): `GET /api/Enum/enums`
2. Dados armazenados no Zustand `settingsStore`
3. Enums usados em selects de TipoEvento, StatusReserva, etc.

---

## 17. Sidebar — Estrutura de Navegação

```
Reservas
  ├── Relatório       → /reservas/relatorio
  └── Listagem        → /reservas/listagem
  (Histórico — comentado, não implementado)

Gestão
  ├── Categoria       → /gestao/categorias
  ├── Supervisor      → /gestao/supervisores
  (Campanhas — comentado, não implementado)

Usuários
  ├── Clientes        → /usuarios/clientes
  ├── Parceiros       → /usuarios/parceiros
  └── Relatório       → /usuarios/relatorio

Finanças
  └── Pagamentos      → /financeiro/pagamentos
  (Transferências, Histórico, Relatório — comentados)

Footer:
  - Menu do usuário (nome, foto, logout)
  - © Ano Tchilla
```

---

## 18. Componentes Globais Existentes (Recriar)

| Componente | Descrição |
|---|---|
| `GlobalButton` | Botão com variantes (primary, secondary, outline, ghost) |
| `GlobalInput` | Input estilizado com label e suporte a password |
| `GlobalTextarea` | Textarea estilizado |
| `GlobalModal` | Modal com backdrop |
| `GlobalDrawer` | Drawer lateral (Sheet do Radix) |
| `GlobalTable` / `V2` / `V3` | Tabelas com paginação e busca |
| `GlobalSnackbar` | Toast/Snackbar global (usa Sonner) |
| `GlobalLoading` / `GlobalModalLoading` | Estados de loading |
| `GlobalAvatar` | Avatar circular com fallback |
| `GlobalUserAvatarName` | Avatar + nome do usuário |
| `StatusBadge` | Badge colorido por status da reserva/pagamento |
| `PagamentoBadge` | Badge específico para status de pagamento |
| `Typography` | Componente de tipografia com variantes |
| `StepProgressBar` | Barra de progresso em passos |
| `TableTags` | Tags/chips para tabelas |
| `UploadImagemPreview` | Upload de imagem com preview |
| `GlobalHelloUser` | Saudação personalizada ao usuário |
| `GlobalPhoneNumberInput` | Input de telefone com máscara |
| `GlobalDropdown` | Dropdown customizado |
| `GlobalBackButton` | Botão de voltar |
| `GlobalBorderButton` | Botão com borda |
| `GoogleMapSelector` | Seletor de localização no Google Maps |
| `FullScreenDialog` | Dialog em tela cheia |

---

## 19. Assets e Sons

**Sounds** (em `/public/sounds/`):
- `boot_down.mp3` — som de saída/logout
- `error.mp3` — erros
- `info.mp3` — informações
- `message.mp3` — mensagens
- `notification.mp3` — notificações gerais
- `popup.mp3` — popups
- `reminder.mp3` — lembretes
- `success.mp3` — ações bem-sucedidas
- `warning.mp3` — avisos

**Imagens** (em `/public/assets/`):
- `vectores/logotipo.svg` — logotipo
- `vectores/logotipo_white3x.svg` — logotipo branco
- `vectores/logo3x.png` — logo PNG
- `gifs/notification_ilustration.gif` — ilustração de notificações
- `/public/appIcon04.svg` — ícone principal (usado no login e sidebar)

---

## 20. Pontos de Atenção na Migração

1. **`localStorage` → Cookies**: Toda persistência de token e session deve migrar para cookies HttpOnly via Next.js API routes ou Server Actions.

2. **`PendingNotificationStore`**: Usa `localStorage` para rastrear IDs já notificados — migrar para `sessionStorage` ou Zustand puro (memória da sessão).

3. **`NavigationHooks`**: Usa `useNavigate` do React Router — substituir por `useRouter` do Next.js.

4. **`SettingsService.nofificationUser`**: Usa `Notification` API do browser — funciona igual, mas apenas em Client Components.

5. **Firebase Messaging (Push Notifications)**: O service worker do Firebase (`firebase-messaging-sw.js`) precisa estar em `/public/` no Next.js.

6. **FormData para uploads**: Categorias e subcategorias usam FormData — compatível com Server Actions do Next.js nativamente.

7. **Google Maps API**: Funciona no browser — deve estar em Client Components com `"use client"`.

8. **`react-big-calendar`**: Requer `"use client"` no Next.js.

9. **`framer-motion`**: Requer `"use client"` no Next.js.

10. **Zustand stores**: Todos devem estar em Client Components. Para hidratar dados iniciais (SSR), usar pattern de `initialData` via props.

11. **`next-themes`**: Provider de tema deve ser client component no layout.

12. **CORS**: A API .NET precisa aceitar o domínio `admin.tchilla.com` e `admin.hmg.tchilla.com`. Em dev, usar proxy via `next.config.ts` rewrites.

13. **Variáveis de ambiente**: Renomear de `VITE_*` para `NEXT_PUBLIC_*` (já está correto no `.env` atual que já usa `NEXT_PUBLIC_`).

---

## 21. Configuração de Deploy

### 21.1 Vercel (recomendado)

```json
// vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

Domínios a configurar na Vercel:
- `admin.tchilla.com` → projeto produção
- `admin.hmg.tchilla.com` → projeto homologação (ou preview branch)

### 21.2 Variáveis de Ambiente na Vercel
Todas as variáveis do `.env.production` devem ser cadastradas no painel da Vercel em **Settings → Environment Variables**, separadas por environment (Production / Preview / Development).
