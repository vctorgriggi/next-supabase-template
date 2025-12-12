# Arquitetura do Projeto

Este documento explica a estrutura e os padrões arquiteturais usados no template.

## Visão Geral

O projeto segue os princípios de **Clean Architecture** e **Separation of Concerns**, com foco em:

- ✅ Type safety (TypeScript)
- ✅ Separação server/client
- ✅ Error handling consistente
- ✅ Código reutilizável
- ✅ Testabilidade

## Estrutura de Diretórios

```
next-supabase-template/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Rotas públicas
│   │   └── auth/
│   │       ├── login/           # Página de login
│   │       └── register/        # Página de registro
│   ├── (private)/                # Rotas protegidas
│   │   ├── (dashboard)/         # Grupo de rotas do dashboard
│   │   │   ├── layout.tsx       # Layout com sidebar
│   │   │   └── page.tsx         # Dashboard home
│   │   └── account/             # Página de perfil
│   │       ├── page.tsx
│   │       ├── account-form.tsx
│   │       └── avatar.tsx
│   ├── auth/
│   │   └── confirm/             # Confirmação de email
│   │       └── route.ts
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   └── globals.css              # Estilos globais
│
├── components/                   # Componentes React
│   ├── ui/                      # Componentes base
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── auth/                    # Componentes de autenticação
│   │   └── login-form.tsx
│   ├── dashboard/               # Componentes do dashboard
│   │   └── sidebar-with-header.tsx
│   └── providers/               # Context providers
│       └── QueryProvider.tsx
│
├── hooks/                        # Custom hooks
│   ├── use-profile.ts           # Hook para buscar perfil
│   └── use-profile-avatar.ts    # Hook para resolver URL do avatar
│
├── lib/                          # Código compartilhado
│   ├── actions/                 # Server Actions
│   │   ├── avatar.ts            # Ações de avatar
│   │   └── profile.ts           # Ações de perfil
│   │
│   ├── supabase/                # Supabase
│   │   ├── client.ts            # Browser client
│   │   ├── server.ts            # Server client
│   │   ├── proxy.ts             # Middleware helper
│   │   ├── auth.ts              # Auth helpers
│   │   ├── profile.ts           # Profile (client)
│   │   ├── profile.server.ts    # Profile (server)
│   │   └── types.ts             # Tipos Supabase
│   │
│   ├── types/                   # Tipos TypeScript
│   │   └── result.ts            # Result<T> type
│   │
│   ├── validators/              # Validação Zod
│   │   ├── account.ts
│   │   └── auth.ts
│   │
│   ├── images/                  # Utilitários de imagem
│   │   └── compress.ts
│   │
│   ├── ui/                      # Helpers de UI
│   │   └── notifications.ts
│   │
│   └── utils.ts                 # Funções utilitárias
│
├── constants/                    # Constantes
│   └── app-routes.ts            # Rotas da aplicação
│
├── public/                       # Assets estáticos
│
├── docs/                         # Documentação
│
├── .env.example                  # Exemplo de env vars
├── .env.local                    # Variáveis locais (git ignored)
├── middleware.ts                 # Next.js middleware
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

## Padrões Arquiteturais

### 1. Separação Server/Client

O projeto mantém clara separação entre código server e client:

#### **Server-only (`lib/supabase/server.ts`)**

```typescript
import { cookies } from 'next/headers'; // ❌ Não funciona no client

export async function getServerClient() {
  const cookieStore = await cookies();
  return createServerClient(/* ... */);
}
```

#### **Client-only (`lib/supabase/client.ts`)**

```typescript
export function getBrowserClient() {
  return createBrowserClient(/* ... */);
}
```

#### **Híbrido (`lib/supabase/profile.ts` e `profile.server.ts`)**

Funções duplicadas para cada contexto:

- `profile.ts` - Recebe client como parâmetro (client-safe)
- `profile.server.ts` - Usa `getServerClient()` internamente (server-only)

### 2. Result<T> Pattern

Todas operações assíncronas retornam `Result<T>` para error handling consistente:

```typescript
// lib/types/result.ts
export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export function success<T>(data: T): Result<T> {
  return { success: true, data };
}

export function failure<T>(error: string): Result<T> {
  return { success: false, error };
}
```

**Uso:**

```typescript
// Server Action
export async function updateProfile(
  updates: ProfileUpdate,
): Promise<Result<boolean>> {
  // ... validação
  if (error) return failure(error.message);
  return success(true);
}

// No componente
const result = await updateProfile(data);
if (!result.success) {
  notifyError(result.error);
  return;
}
notifySuccess('Perfil atualizado!');
```

### 3. Server Actions

Mutações usam Next.js Server Actions ao invés de API routes:

**Vantagens:**

- ✅ Type-safe end-to-end
- ✅ Menos boilerplate
- ✅ Validação no servidor
- ✅ Revalidação automática

**Exemplo:**

```typescript
// lib/actions/profile.ts
'use server';

export async function updateProfile(
  updates: ProfileUpdate,
): Promise<Result<boolean>> {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return failure('Not authenticated');

  // ... lógica

  revalidatePath('/', 'layout');
  return success(true);
}
```

### 4. Custom Hooks

Lógica reutilizável encapsulada em hooks:

```typescript
// hooks/use-profile.ts
export function useProfile(userId: string | undefined) {
  const supabaseClient = useMemo(() => getBrowserClient(), []);

  const query = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => fetchProfileWithClient(supabaseClient, userId),
    enabled: !!userId,
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    error: query.error,
    supabaseClient,
  };
}
```

### 5. Form Handling

Padrão consistente para todos os formulários:

1. **Validação com Zod**
2. **React Hook Form** para controle
3. **Server Actions** para submit
4. **Mutations** com TanStack Query

```typescript
// Validator
export const accountSchema = z.object({
  full_name: z.string().min(1),
  username: z.string().min(3),
  // ...
});

// Form
const form = useForm<AccountValues>({
  resolver: zodResolver(accountSchema),
  defaultValues: initialProfile,
});

const mutation = useMutation({
  mutationFn: (values) => updateProfile(values),
});

async function onSubmit(values: AccountValues) {
  const result = await mutation.mutateAsync(values);
  if (!result.success) {
    notifyError(result.error);
    return;
  }
  notifySuccess('Salvo!');
}
```

## Fluxo de Dados

### 1. Server-Side Rendering (SSR)

```
User Request
    ↓
Server Component
    ↓
getServerClient() ← cookies
    ↓
Fetch data from Supabase
    ↓
Prefetch with TanStack Query
    ↓
HydrationBoundary
    ↓
HTML + hydrated state → Client
```

### 2. Client-Side Mutations

```
User Action (submit form)
    ↓
Client Component
    ↓
Server Action
    ↓
getServerClient() ← cookies
    ↓
Validate + Mutate in Supabase
    ↓
revalidatePath()
    ↓
Return Result<T>
    ↓
Update UI + Show notification
```

### 3. File Upload

```
User selects file
    ↓
Compress image (optional)
    ↓
Upload to Supabase Storage (client)
    ↓
Get file path
    ↓
Server Action (confirm upload)
    ↓
Update database with file path
    ↓
Invalidate React Query cache
    ↓
UI updates with new avatar
```

## Autenticação

### Fluxo de Auth

```
1. Login → Server Action
             ↓
2. Supabase Auth (server)
             ↓
3. Set cookies (httpOnly)
             ↓
4. Redirect to dashboard
             ↓
5. Middleware refreshes token
             ↓
6. Server Component reads cookies
             ↓
7. requireAuth() validates user
```

### Proteção de Rotas

**Server-side:**

```typescript
// Em qualquer Server Component/Action
const user = await requireAuth(); // redireciona se não autenticado
```

**Middleware:**

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  return await updateSession(request); // refresh token
}
```

## Performance

### Estratégias de Otimização

1. **Prefetching**
   - Dados prefetchados no servidor
   - Hydrated no client com `HydrationBoundary`

2. **React Query**
   - Cache inteligente
   - Revalidação automática
   - Stale-while-revalidate

3. **Server Components**
   - Zero JavaScript no client (quando possível)
   - Fetch no servidor (mais rápido)

4. **Image Optimization**
   - Compressão antes do upload
   - Lazy loading nativo
   - WebP quando suportado

5. **Code Splitting**
   - Dinamic imports quando necessário
   - Route-based splitting automático

## Segurança

### Row Level Security (RLS)

Todas as tabelas têm RLS habilitado:

```sql
-- Apenas o dono pode ler/escrever
create policy "Users can update own profile"
  on profiles for update
  using ((select auth.uid()) = id);
```

### Server Actions

Validação **sempre** no servidor:

```typescript
export async function updateProfile(updates: ProfileUpdate) {
  const { user } = await supabase.auth.getUser(); // ✅ valida auth
  if (!user) return failure('Not authenticated');

  // ✅ valida dados
  if (!updates.username || updates.username.length < 3) {
    return failure('Username muito curto');
  }

  // ✅ só então faz a mutação
}
```

### CSRF Protection

Next.js Server Actions têm proteção CSRF built-in.

## Próximos Passos

- [Autenticação](./autenticacao.md) - Detalhes do sistema de auth
- [Formulários](./formularios.md) - Padrões de forms
- [Upload de Arquivos](./upload-arquivos.md) - Sistema de avatares
- [Configuração Supabase](./configuracao-supabase.md) - Setup do banco

---

Esta arquitetura foi desenhada para ser **escalável**, **manutenível** e **type-safe**.
