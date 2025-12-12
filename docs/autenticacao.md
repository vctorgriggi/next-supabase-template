# Sistema de Autenticação

Este documento explica como funciona o sistema de autenticação no template.

## Visão Geral

O template usa **Supabase Auth** com **Server-Side Authentication** para máxima segurança e compatibilidade com SSR.

### Características

- ✅ Email/Senha (pode adicionar OAuth depois)
- ✅ Confirmação de email
- ✅ Server-Side Rendering (SSR)
- ✅ Cookies httpOnly (seguro)
- ✅ Refresh automático de tokens
- ✅ Proteção de rotas
- ✅ Type-safe

## Fluxo de Autenticação

### 1. Signup (Cadastro)

```
Usuário preenche formulário
        ↓
React Hook Form + Zod validação
        ↓
Server Action (signUp)
        ↓
Supabase Auth cria usuário
        ↓
Trigger SQL cria perfil
        ↓
Email de confirmação enviado
        ↓
Usuário clica no link
        ↓
/auth/confirm valida token
        ↓
Redirect para dashboard
```

**Código:**

```typescript
// lib/supabase/auth.ts
export async function signUp(
  email: string,
  password: string,
): Promise<Result<boolean>> {
  const supabase = await getServerClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return failure(error.message);
  }

  revalidatePath('/', 'layout');
  return success(true);
}
```

### 2. Login

```
Usuário insere credenciais
        ↓
Server Action (signInWithPassword)
        ↓
Supabase Auth valida
        ↓
Cookies são definidos (httpOnly)
        ↓
Redirect para dashboard
```

**Código:**

```typescript
// lib/supabase/auth.ts
export async function signInWithPassword(
  email: string,
  password: string,
): Promise<Result<boolean>> {
  const supabase = await getServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return failure(error.message);
  }

  revalidatePath('/', 'layout');
  return success(true);
}
```

### 3. Logout

```
Usuário clica em "Sign out"
        ↓
Server Action (signOut)
        ↓
Supabase Auth invalida sessão
        ↓
Cookies são limpos
        ↓
Redirect para login
```

**Código:**

```typescript
// lib/supabase/auth.ts
export async function signOut(): Promise<Result<boolean>> {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return failure('No user to sign out');
  }

  const { error } = await supabase.auth.signOut();
  if (error) {
    return failure(error.message);
  }

  revalidatePath('/', 'layout');
  return success(true);
}
```

## Clientes Supabase

### Server Client (`getServerClient`)

**Quando usar:**

- Server Components
- Server Actions
- Route Handlers
- Middleware

**Características:**

- ✅ Acessa cookies do Next.js
- ✅ httpOnly cookies (seguro)
- ✅ Refresh automático

**Código:**

```typescript
// lib/supabase/server.ts
import { cookies } from 'next/headers';

export async function getServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {}
        },
      },
    },
  );
}
```

### Browser Client (`getBrowserClient`)

**Quando usar:**

- Client Components
- Hooks
- Event handlers

**Características:**

- ✅ Singleton (uma instância)
- ✅ Acessa cookies do browser
- ⚠️ Não deve ser usado para operações sensíveis

**Código:**

```typescript
// lib/supabase/client.ts
export function getBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
```

## Proteção de Rotas

### Server-Side (Recomendado)

#### `requireAuth()`

Valida autenticação e redireciona se não autenticado:

```typescript
// app/(private)/dashboard/page.tsx
export default async function DashboardPage() {
  const user = await requireAuth(); // redireciona se não logado

  return <div>Bem-vindo, {user.email}!</div>;
}
```

#### `requireGuest()`

Redireciona usuários autenticados (útil para login/signup):

```typescript
// app/(public)/auth/login/page.tsx
export default async function LoginPage() {
  await requireGuest(); // redireciona se já logado

  return <LoginForm />;
}
```

#### `getCurrentUser()`

Obtém usuário sem redirecionar:

```typescript
// app/page.tsx
export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div>
      {user ? `Olá, ${user.email}!` : 'Faça login'}
    </div>
  );
}
```

### Middleware (Automático)

O middleware refresha tokens automaticamente:

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}
```

**O que faz:**

1. Verifica se token expirou
2. Refresh automático se necessário
3. Atualiza cookies
4. Permite requisição continuar

## Estrutura de Arquivos Auth

```
app/
├── (public)/
│   └── auth/
│       ├── login/
│       │   ├── page.tsx           # Página de login
│       │   └── actions/
│       │       └── auth.ts        # Server Actions (wrapper)
│       └── register/
│           └── page.tsx           # Página de cadastro
│
├── auth/
│   └── confirm/
│       └── route.ts               # Confirmação de email
│
components/
└── auth/
    ├── login-form.tsx             # Form de login
    └── register-form.tsx          # Form de cadastro
│
lib/
├── supabase/
│   ├── auth.ts                    # Auth helpers centralizados
│   ├── server.ts                  # Server client
│   └── client.ts                  # Browser client
│
└── validators/
    └── auth.ts                    # Validação Zod
```

## Exemplo Completo: Login

### 1. Validador Zod

```typescript
// lib/validators/auth.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export type LoginValues = z.infer<typeof loginSchema>;
```

### 2. Server Action (Wrapper)

```typescript
// app/(public)/auth/login/actions/auth.ts
'use server';

import { redirect } from 'next/navigation';
import { signInWithPassword } from '@/lib/supabase/auth';
import { APP_ROUTES } from '@/constants/app-routes';

export async function login(formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');

  if (!email || !password) {
    return { error: 'Email e senha são obrigatórios' };
  }

  const result = await signInWithPassword(
    email.toString(),
    password.toString(),
  );

  if (!result.success) {
    return { error: result.error };
  }

  redirect(APP_ROUTES.PRIVATE.DASHBOARD);
}
```

### 3. Form Component

```typescript
// components/auth/login-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { login } from '@/app/(public)/auth/login/actions/auth';
import { loginSchema, type LoginValues } from '@/lib/validators/auth';

export default function LoginForm() {
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginValues) => {
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);

    const result = await login(formData);

    if (result?.error) {
      notifyError(result.error);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <InputWithLabel
        label="Email"
        type="email"
        error={form.formState.errors.email?.message}
        {...form.register('email')}
      />

      <InputWithLabel
        label="Senha"
        type="password"
        error={form.formState.errors.password?.message}
        {...form.register('password')}
      />

      <Button type="submit">Entrar</Button>
    </form>
  );
}
```

### 4. Page Component

```typescript
// app/(public)/auth/login/page.tsx
import { requireGuest } from '@/lib/supabase/auth';
import LoginForm from '@/components/auth/login-form';

export default async function LoginPage() {
  await requireGuest(); // redireciona se já logado

  return (
    <div>
      <h1>Login</h1>
      <LoginForm />
    </div>
  );
}
```

## Segurança

### Boas Práticas Implementadas

✅ **httpOnly Cookies**

- Cookies não acessíveis via JavaScript
- Protege contra XSS

✅ **Server-Side Validation**

- Validação sempre no servidor
- Cliente pode ser manipulado

✅ **RLS (Row Level Security)**

- Políticas no banco de dados
- Camada extra de segurança

✅ **CSRF Protection**

- Next.js Server Actions têm proteção built-in

✅ **Rate Limiting**

- Supabase tem rate limiting automático
- Protege contra ataques de força bruta

### O que NÃO fazer

❌ **Armazenar tokens no localStorage**

```typescript
// ❌ NUNCA faça isso!
localStorage.setItem('token', token);
```

❌ **Validar auth apenas no client**

```typescript
// ❌ Client pode ser manipulado
if (user) {
  return <Dashboard />;
}
```

❌ **Expor service_role key**

```typescript
// ❌ NUNCA use service_role no client!
const supabase = createClient(url, SERVICE_ROLE_KEY);
```

✅ **Sempre valide no servidor**

```typescript
// ✅ Correto
const user = await requireAuth();
```

## Adicionando OAuth (Opcional)

Para adicionar login social (Google, GitHub, etc):

### 1. Habilitar Provider

1. Vá em **Authentication** → **Providers**
2. Habilite o provider desejado (ex: Google)
3. Configure as credenciais OAuth

### 2. Adicionar Botão no Form

```typescript
'use client';

export default function LoginForm() {
  async function handleGoogleLogin() {
    const supabase = getBrowserClient();

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <>
      {/* Form email/senha */}

      <Button onClick={handleGoogleLogin}>
        Continuar com Google
      </Button>
    </>
  );
}
```

### 3. Criar Callback Route

```typescript
// app/auth/callback/route.ts
import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await getServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL('/dashboard', request.url));
}
```

## Troubleshooting

### "User not found" ao fazer login

**Causa:** Email não confirmado

**Solução:**

1. Cheque email de confirmação
2. Ou desabilite confirmação em dev: **Authentication** → **Email** → desmarque "Enable email confirmations"

### Cookies não sendo salvos

**Causa:** Configuração incorreta de domínio

**Solução:** Certifique-se de que `.env.local` está correto e o servidor foi reiniciado

### Token expira muito rápido

**Causa:** Middleware não está refreshando

**Solução:** Verifique se `middleware.ts` está na raiz do projeto

### "Failed to fetch" ao chamar Server Action

**Causa:** Server Action não tem `'use server'`

**Solução:** Adicione `'use server'` no topo do arquivo

## Próximos Passos

- [Formulários](./formularios.md) - Padrões de forms
- [Upload de Arquivos](./upload-arquivos.md) - Sistema de avatares
- [Configuração Supabase](./configuracao-supabase.md) - Setup do banco

---

Sistema de autenticação seguro e pronto para produção.
