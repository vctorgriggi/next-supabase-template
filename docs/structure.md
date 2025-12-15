# Estrutura do Projeto

Entenda como o código está organizado e as convenções usadas.

---

## 📁 Visão Geral

```
next-supabase-template/
├── app/                      # Next.js App Router
├── components/               # React components
├── hooks/                    # Custom React hooks
├── lib/                      # Lógica principal
├── constants/                # Constantes da aplicação
├── public/                   # Assets estáticos
└── docs/                     # Documentação
```

---

## 🗂️ Estrutura Detalhada

### `app/` - Rotas do Next.js

```
app/
├── (public)/                 # Rotas públicas (sem auth)
│   ├── page.tsx             # Landing page (/)
│   └── auth/
│       ├── login/
│       │   ├── page.tsx     # Página de login
│       │   └── actions/
│       │       └── auth.ts  # Server Actions (login, register, logout)
│       ├── register/
│       │   └── page.tsx     # Página de registro
│       └── confirm/
│           └── route.ts     # Confirmação de email
│
├── (private)/                # Rotas protegidas (requer auth)
│   └── (dashboard)/
│       ├── layout.tsx       # Layout com prefetch
│       ├── dashboard/
│       │   └── page.tsx     # Dashboard principal
│       └── account/
│           └── page.tsx     # Configurações de perfil
│
├── error/
│   └── page.tsx             # Página de erro
├── layout.tsx               # Root layout (providers, fonts)
└── globals.css              # Estilos globais
```

**Convenções:**

- `(public)` e `(private)` - Route groups (não afetam URL)
- `(dashboard)` - Layout compartilhado entre dashboard e account
- Arquivos `page.tsx` - Definem rotas
- Arquivos `layout.tsx` - Layouts compartilhados

---

### `components/` - Componentes React

```
components/
├── ui/                       # Componentes base
│   ├── button.tsx           # Button (variants: primary, secondary, error)
│   ├── input.tsx            # Input com label e erro
│   └── notifications-provider.tsx  # Toast notifications (Sonner)
│
├── auth/                     # Autenticação
│   ├── login-form/
│   │   └── index.tsx        # Form de login (RHF + Zod)
│   └── register-form/
│       └── index.tsx        # Form de registro (RHF + Zod)
│
├── account/                  # Perfil
│   ├── account-form.tsx     # Form de edição de perfil
│   └── avatar.tsx           # Upload de avatar
│
├── dashboard/
│   └── sidebar-with-header.tsx  # Sidebar + header
│
└── providers/
    └── query-provider.tsx   # TanStack Query provider
```

**Convenções:**

- **1 componente = 1 arquivo** (exceto componentes muito pequenos)
- **index.tsx** - Apenas em pastas de componentes complexos
- **kebab-case** - Nomes de arquivos (`login-form.tsx`, `account-form.tsx`)

---

### `lib/` - Lógica Principal

A pasta `lib/` contém **toda a lógica de negócio** separada por responsabilidade.

```
lib/
├── actions/                  # Server Actions
│   ├── profile.ts           # updateProfile()
│   └── avatar.ts            # confirmAvatar()
│
├── supabase/                 # Supabase clients e helpers
│   ├── client.ts            # getBrowserClient() (client-side)
│   ├── server.ts            # getServerClient() (server-side)
│   ├── proxy.ts             # updateSession() (middleware)
│   ├── auth.ts              # getCurrentUser(), requireAuth(), etc
│   ├── profile.ts           # fetchProfileWithClient(), updateProfileWithClient()
│   ├── profile.server.ts    # fetchProfile(), updateProfileDB(), prefetchProfile()
│   └── types.ts             # Tipos gerados do Supabase
│
├── validators/               # Schemas Zod
│   ├── auth.ts              # loginSchema, registerSchema
│   └── account.ts           # accountSchema
│
├── types/                    # TypeScript types
│   └── result.ts            # Result<T>, success(), failure()
│
├── images/                   # Processamento de imagens
│   └── compress.ts          # compressImage()
│
├── ui/                       # UI helpers
│   └── notifications.ts     # notifySuccess(), notifyError()
│
└── utils.ts                  # Funções utilitárias (cn, etc)
```

---

### 🔄 Camadas (3-Layer Architecture)

O template usa **3 camadas** para separar responsabilidades:

```
┌─────────────────────────────────────────────┐
│  Server Actions (lib/actions/)              │
│  - Valida com Zod                           │
│  - Autentica usuário                        │
│  - Delega para camada server                │
│  - Revalida cache                           │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  Server Wrappers (lib/supabase/*.server.ts) │
│  - Cria server client                       │
│  - Delega para camada genérica              │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  Generic Functions (lib/supabase/*.ts)      │
│  - Lógica pura de banco de dados            │
│  - Recebe client como parâmetro             │
│  - Reutilizável (server/client)             │
└─────────────────────────────────────────────┘
```

#### Exemplo: Atualizar Perfil

**Camada 1: Server Action**

```typescript
// lib/actions/profile.ts
'use server';

export async function updateProfile(data: unknown): Promise<Result<boolean>> {
  // Valida
  const parsed = accountSchema.safeParse(data);
  if (!parsed.success) return failure('Dados inválidos');

  // Autentica
  const user = await getCurrentUser();
  if (!user) return failure('Não autenticado');

  // Delega para camada 2
  const result = await updateProfileDB(user.id, parsed.data);
  if (!result.success) return failure(result.error);

  // Revalida
  revalidatePath('/', 'layout');
  return success(true);
}
```

**Camada 2: Server Wrapper**

```typescript
// lib/supabase/profile.server.ts
export async function updateProfileDB(
  userId: string,
  updates: ProfileUpdate,
): Promise<Result<boolean>> {
  const client = await getServerClient();

  // Delega para camada 3
  return updateProfileWithClient(client, userId, updates);
}
```

**Camada 3: Generic Function**

```typescript
// lib/supabase/profile.ts
export async function updateProfileWithClient(
  client: SupabaseClient,
  userId: string,
  updates: ProfileUpdate,
): Promise<Result<boolean>> {
  const { error } = await client.from('profiles').upsert({
    id: userId,
    ...updates,
    updated_at: new Date().toISOString(),
  });

  if (error) return failure(error.message);
  return success(true);
}
```

**Por que 3 camadas?**

✅ **DRY** - Lógica de DB em 1 lugar só  
✅ **Reutilizável** - Camada 3 funciona com qualquer client  
✅ **Testável** - Cada camada pode ser testada independentemente  
✅ **Separação clara** - Cada camada tem uma responsabilidade

---

### `hooks/` - Custom Hooks

```
hooks/
├── use-profile.ts            # useProfile() - fetch profile com TanStack Query
└── use-profile-avatar.ts     # useProfileAvatar() - resolve avatar URL
```

**Convenções:**

- **kebab-case** - Nomes de arquivos (`use-profile.ts`)
- **use prefix** - Sempre começam com `use`
- **1 hook = 1 arquivo**

---

### `constants/` - Constantes

```
constants/
└── app-routes.ts             # APP_ROUTES (URLs da aplicação)
```

**Exemplo:**

```typescript
export const APP_ROUTES = {
  PUBLIC: {
    HOME: '/',
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
  PRIVATE: {
    DASHBOARD: '/dashboard',
    ACCOUNT: '/account',
  },
  AUTH: {
    LOGIN: '/auth/login',
    CONFIRM: '/auth/confirm',
  },
};
```

---

## 📝 Convenções de Nomenclatura

### Arquivos

| Tipo            | Padrão                | Exemplo                              |
| --------------- | --------------------- | ------------------------------------ |
| **Componentes** | kebab-case            | `login-form.tsx`, `account-form.tsx` |
| **Hooks**       | kebab-case com `use-` | `use-profile.ts`                     |
| **Actions**     | kebab-case            | `profile.ts`                         |
| **Utils**       | kebab-case            | `compress.ts`                        |
| **Types**       | kebab-case            | `result.ts`                          |

### Código

```typescript
// ✅ Componentes: PascalCase (função, mas arquivo é kebab-case)
// Arquivo: login-form.tsx
export function LoginForm() {}

// ✅ Funções: camelCase
export async function getCurrentUser() {}

// ✅ Hooks: camelCase com use
export function useProfile() {}

// ✅ Constantes: UPPER_CASE
export const APP_ROUTES = {};

// ✅ Types: PascalCase
export type Result<T> = {};

// ✅ Interfaces: PascalCase
export interface ProfileUpdate {}
```

---

## 🎯 Imports

Use **absolute imports** com `@/`:

```typescript
// ✅ Absolute imports (recomendado)
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/use-profile';
import { updateProfile } from '@/lib/actions/profile';

// ❌ Relative imports (evite)
import { Button } from '../../components/ui/button';
import { useProfile } from '../../hooks/use-profile';
```

**Nota:** A ordem dos imports é organizada automaticamente pelo ESLint (`eslint-plugin-simple-import-sort`).

---

## 📂 Organização de Arquivos

### Arquivos especiais

- **`.server.ts`** - Roda apenas no servidor (não é bundled pro client)
- **`.client.ts`** - Explicitamente client-side (opcional, para clareza)
- **`page.tsx`** - Define uma rota no Next.js
- **`layout.tsx`** - Layout compartilhado
- **`route.ts`** - API route ou handler
- **`actions/`** - Sempre contém Server Actions com `'use server'`

### Quando criar pastas?

**✅ Crie pasta quando:**

- Componente tem subcomponentes
- Componente tem múltiplos arquivos (styles, tests, etc)
- Grupo de arquivos relacionados

**❌ Não crie pasta quando:**

- É apenas 1 arquivo
- Componente é simples

**Exemplo:**

```
// ✅ Componente complexo (pasta)
components/
└── login-form/
    ├── index.tsx
    ├── use-login.ts
    └── schema.ts

// ✅ Componente simples (arquivo único)
components/
└── button.tsx
```

---

## 🔄 Fluxo de Dados

### Client → Server

```
Component
    ↓
Server Action (lib/actions/)
    ↓
Server Wrapper (lib/supabase/*.server.ts)
    ↓
Generic Function (lib/supabase/*.ts)
    ↓
Supabase
```

### Server → Client

```
Server Component
    ↓
prefetchProfile() (lib/supabase/*.server.ts)
    ↓
fetchProfile() (lib/supabase/*.server.ts)
    ↓
fetchProfileWithClient() (lib/supabase/*.ts)
    ↓
Supabase
    ↓
dehydrate(queryClient)
    ↓
Client recebe dados hidratados
    ↓
useProfile() já tem dados em cache
```

---

## 🎯 Próximos Passos

Agora que você entende a estrutura:

- [Configuração do Supabase](./supabase-setup.md) - Configure o backend
- [Autenticação](./features/authentication.md) - Como auth funciona
- [Perfil](./features/profile.md) - Sistema de perfil

---

[← Voltar ao índice](./README.md)
