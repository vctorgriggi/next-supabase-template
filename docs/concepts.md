# Conceitos

Entenda os padrões e a arquitetura do template.

---

## 🏗️ Arquitetura

O template separa claramente **client** e **server**, com type safety de ponta a ponta.

### Diagrama

```
┌─────────────────────────────────────────┐
│           CLIENT (Navegador)            │
├─────────────────────────────────────────┤
│                                         │
│  React Components                       │
│         ↓                               │
│  TanStack Query ←→ Server Actions       │
│         ↓                               │
│  Custom Hooks                           │
│                                         │
└─────────────────────────────────────────┘
              ↓ HTTP
┌─────────────────────────────────────────┐
│          SERVER (Next.js)               │
├─────────────────────────────────────────┤
│                                         │
│  Server Components                      │
│         ↓                               │
│  Server Actions ←→ Supabase             │
│         ↓              ↓                │
│  Validators       Database + Storage    │
│                                         │
└─────────────────────────────────────────┘
```

### Separação de Responsabilidades

**Client:**

- Renderiza UI
- Valida formulários (feedback imediato)
- Faz uploads direto pro Supabase Storage
- Gerencia cache com TanStack Query

**Server:**

- Autentica usuários
- Valida dados (segurança)
- Atualiza banco de dados
- Revalida cache

**Supabase:**

- Armazena dados (PostgreSQL)
- Gerencia autenticação (JWT)
- Hospeda arquivos (Storage)
- Protege com RLS (Row Level Security)

---

## 🎯 Result<T> Pattern

Tratamento de erros type-safe sem try-catch hell.

### O que é?

Um padrão simples que retorna **sucesso** ou **erro**:

```typescript
type Result<T> = { success: true; data: T } | { success: false; error: string };
```

### Como usar?

```typescript
import { success, failure } from '@/lib/types/result';

// Função retorna Result<T>
async function updateProfile(data: ProfileData): Promise<Result<boolean>> {
  if (!isValid(data)) {
    return failure('Dados inválidos');
  }

  await db.update(data);
  return success(true);
}

// Uso
const result = await updateProfile(data);

if (result.success) {
  console.log('Sucesso!', result.data); // TypeScript sabe que .data existe
} else {
  console.error('Erro:', result.error); // TypeScript sabe que .error existe
}
```

### Por que usar?

**❌ Sem Result<T>:**

```typescript
try {
  const user = await updateUser(data);
  // user pode ser undefined?
  // erro foi logado? lançado? retornado?
} catch (error) {
  // error é unknown
  // precisa de type guards
  console.error(error);
}
```

**✅ Com Result<T>:**

```typescript
const result = await updateUser(data);

if (result.success) {
  // TypeScript garante que result.data existe
  const user = result.data;
} else {
  // TypeScript garante que result.error existe
  const message = result.error;
}
```

### Helpers

Sempre use os helpers para criar resultados:

```typescript
import { success, failure } from '@/lib/types/result';

// ✅ Com helpers (recomendado)
return success(profile);
return failure('Não autenticado');

// ❌ Manual (não faça)
return { success: true, data: profile };
return { success: false, error: 'Não autenticado' };
```

**Vantagens:**

- Type safety automático
- Menos código
- Consistência garantida
- Fácil de refatorar

---

## 🚀 Server Actions

Mutations type-safe do client pro server sem API routes.

### O que são?

Funções que rodam **no servidor** mas podem ser chamadas **do client**:

```typescript
'use server'; // ← Marca como Server Action

export async function updateProfile(data: unknown): Promise<Result<boolean>> {
  // Este código roda no SERVIDOR
  const user = await getCurrentUser();
  await db.update(user.id, data);
  return success(true);
}
```

### Como funcionam?

```
Client Component
      ↓
   Chama updateProfile(data)
      ↓
   Next.js faz POST /action
      ↓
   Servidor executa a função
      ↓
   Retorna Result<T>
      ↓
   Client recebe resposta
```

### Estrutura padrão

Toda Server Action segue este padrão:

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/supabase/auth';
import { updateProfileDB } from '@/lib/supabase/profile.server';
import { success, failure } from '@/lib/types/result';
import { accountSchema } from '@/lib/validators/account';

export async function updateProfile(data: unknown): Promise<Result<boolean>> {
  // 1. Validação
  const parsed = accountSchema.safeParse(data);
  if (!parsed.success) {
    return failure('Dados inválidos');
  }

  // 2. Autenticação
  const user = await getCurrentUser();
  if (!user) {
    return failure('Não autenticado');
  }

  // 3. Atualização (delega para camada de dados)
  const result = await updateProfileDB(user.id, parsed.data);
  if (!result.success) {
    return failure(result.error);
  }

  // 4. Revalidação de cache
  revalidatePath('/', 'layout');
  return success(true);
}
```

**4 etapas sempre:**

1. **Validação** — Zod garante que dados são válidos
2. **Autenticação** — Verifica quem está chamando
3. **Atualização** — Delega para camada de dados
4. **Revalidação** — Atualiza cache do Next.js

### Por que Server Actions?

**❌ Alternativa tradicional (API Route):**

```typescript
// app/api/profile/route.ts
export async function POST(request: Request) {
  const body = await request.json();
  // Precisa validar, autenticar, etc
  // Sem type safety entre client e server
}

// Client
const response = await fetch('/api/profile', {
  method: 'POST',
  body: JSON.stringify(data),
});
const result = await response.json(); // any
```

**✅ Com Server Actions:**

```typescript
// lib/actions/profile.ts
export async function updateProfile(data: ProfileData) {
  // ...
}

// Client
const result = await updateProfile(data); // Type-safe!
```

**Vantagens:**

- ✅ Type safety automático
- ✅ Sem necessidade de API routes
- ✅ CSRF protection built-in
- ✅ Progressivo (funciona com e sem JS)

---

## 📊 SSR + Prefetch

Dados carregados **no servidor** antes da página renderizar.

### O que é?

Em vez de:

```
1. Página carrega (vazia)
2. Client faz fetch
3. Dados chegam
4. Página re-renderiza
```

Fazemos:

```
1. Servidor busca dados
2. Página carrega (com dados)
3. Client já tem tudo
```

### Como funciona?

```typescript
// app/(private)/(dashboard)/layout.tsx (SERVER)
import { QueryClient, dehydrate } from '@tanstack/react-query';
import { prefetchProfile } from '@/lib/supabase/profile.server';
import { requireAuth } from '@/lib/supabase/auth';

export default async function DashboardLayout({ children }) {
  // 1. Autentica no servidor
  const user = await requireAuth();

  // 2. Busca dados no servidor
  const queryClient = new QueryClient();
  await prefetchProfile(queryClient, user.id);

  // 3. Hidrata no cliente
  return (
    <QueryProvider dehydratedState={dehydrate(queryClient)}>
      {children}
    </QueryProvider>
  );
}
```

```typescript
// lib/supabase/profile.server.ts
export async function prefetchProfile(
  queryClient: QueryClient,
  userId: string,
) {
  await queryClient.prefetchQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const result = await fetchProfile(userId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    staleTime: 1000 * 60 * 5, // Cache por 5 minutos
  });
}
```

```typescript
// components/profile-display.tsx (CLIENT)
'use client';

import { useProfile } from '@/hooks/use-profile';

export function ProfileDisplay() {
  const { data: profile } = useProfile();

  // Primeira renderização JÁ TEM OS DADOS!
  return <div>{profile?.name}</div>;
}
```

### Benefícios

✅ **Zero loading states** — Dados já estão lá  
✅ **SEO friendly** — HTML já vem com conteúdo  
✅ **Melhor UX** — Sem layout shift  
✅ **Performance** — Menos waterfalls

### Fluxo completo

```
Request chega
      ↓
Middleware atualiza session
      ↓
Server Component executa
      ↓
requireAuth() verifica usuário
      ↓
prefetchProfile() busca dados
      ↓
dehydrate() serializa cache
      ↓
HTML gerado com dados
      ↓
Client recebe e hidrata
      ↓
useProfile() já tem dados em cache
```

---

## 🔄 Fluxo Completo: Atualizar Perfil

Vamos ver como tudo se conecta em um exemplo real:

### 1. Client renderiza form

```typescript
// components/account-form.tsx
'use client';

export function AccountForm({ profile }) {
  const { mutate } = useMutation({
    mutationFn: updateProfile,  // ← Server Action
  });

  return (
    <form onSubmit={form.handleSubmit((data) => mutate(data))}>
      <input {...form.register('name')} />
      <button type="submit">Salvar</button>
    </form>
  );
}
```

### 2. Usuário submete

```
User clica "Salvar"
      ↓
React Hook Form valida (Zod)
      ↓
Se válido, chama mutate(data)
      ↓
TanStack Query chama updateProfile(data)
```

### 3. Server Action executa

```typescript
// lib/actions/profile.ts
'use server';

export async function updateProfile(data: unknown) {
  // Valida no servidor (segurança)
  const parsed = accountSchema.safeParse(data);

  // Autentica
  const user = await getCurrentUser();

  // Atualiza (delega)
  const result = await updateProfileDB(user.id, parsed.data);

  // Revalida cache
  revalidatePath('/', 'layout');
  return success(true);
}
```

### 4. Client recebe resposta

```typescript
// components/account-form.tsx
const { mutate } = useMutation({
  mutationFn: updateProfile,
  onSuccess: (result) => {
    if (result.success) {
      queryClient.invalidateQueries(['profile']);
      notifySuccess('Perfil atualizado!');
    } else {
      notifyError(result.error);
    }
  },
});
```

### 5. UI atualiza

```
invalidateQueries(['profile'])
      ↓
TanStack Query refetch
      ↓
useProfile() retorna novos dados
      ↓
Components re-renderizam
      ↓
UI atualizada! ✅
```

---

## 🎯 Próximos Passos

Agora que você entende os conceitos:

- [Estrutura do Projeto](./structure.md) — Veja como está organizado
- [Autenticação](./features/authentication.md) — Implemente auth
- [Perfil](./features/profile.md) — Sistema de perfil completo

---

[← Voltar ao índice](./README.md)
