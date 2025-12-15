# Autenticação

Sistema completo de autenticação com Supabase.

---

## 🔐 Como Funciona

```
Usuário registra/faz login
        ↓
Supabase Auth (gera JWT)
        ↓
Middleware atualiza session
        ↓
Rotas protegidas verificam auth
        ↓
RLS policies protegem dados
```

---

## 🎯 Helpers de Autenticação

### getCurrentUser()

Retorna o usuário autenticado ou `null`:

```typescript
// lib/supabase/auth.ts
import { getServerClient } from './server';

export async function getCurrentUser() {
  const client = await getServerClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();

  if (error || !user) return null;
  return user;
}
```

**Uso:**

```typescript
const user = await getCurrentUser();

if (!user) {
  return failure('Não autenticado');
}

// user existe aqui
console.log(user.id, user.email);
```

---

### requireAuth()

Redireciona para login se não estiver autenticado:

```typescript
// lib/supabase/auth.ts
import { redirect } from 'next/navigation';
import { APP_ROUTES } from '@/constants/app-routes';

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.AUTH.LOGIN);
  }

  return user;
}
```

**Uso em layouts:**

```typescript
// app/(private)/(dashboard)/layout.tsx
export default async function DashboardLayout({ children }) {
  const user = await requireAuth(); // Redireciona se não autenticado

  return <div>{children}</div>;
}
```

---

### requireGuest()

Redireciona para dashboard se JÁ estiver autenticado:

```typescript
// lib/supabase/auth.ts
export async function requireGuest() {
  const user = await getCurrentUser();

  if (user) {
    redirect(APP_ROUTES.PRIVATE.DASHBOARD);
  }
}
```

**Uso:**

```typescript
// app/(public)/auth/login/page.tsx
export default async function LoginPage() {
  await requireGuest(); // Redireciona se já logado

  return <LoginForm />;
}
```

---

## 📝 Server Actions

### login()

```typescript
// app/(public)/auth/login/actions/auth.ts
'use server';

import { redirect } from 'next/navigation';
import { getServerClient } from '@/lib/supabase/server';
import { failure } from '@/lib/types/result';
import { loginSchema } from '@/lib/validators/auth';
import { APP_ROUTES } from '@/constants/app-routes';

export async function login(data: unknown) {
  // 1. Validação
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    console.error('[login] Validation failed:', parsed.error.issues);
    return failure('Dados inválidos');
  }

  // 2. Autenticação
  const client = await getServerClient();
  const { error } = await client.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    console.error('[login] Auth failed:', error);
    return failure('Email ou senha incorretos');
  }

  // 3. Redirect (sucesso)
  redirect(APP_ROUTES.PRIVATE.DASHBOARD);
}
```

---

### register()

```typescript
// app/(public)/auth/login/actions/auth.ts
'use server';

export async function register(data: unknown) {
  // 1. Validação
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    console.error('[register] Validation failed:', parsed.error.issues);
    return failure('Dados inválidos');
  }

  // 2. Registro
  const client = await getServerClient();
  const { error } = await client.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    console.error('[register] Signup failed:', error);
    return failure(error.message);
  }

  // 3. Redirect (sucesso)
  redirect(APP_ROUTES.PRIVATE.DASHBOARD);
}
```

**Perfil criado automaticamente:**

O trigger `handle_new_user()` cria o perfil automaticamente na tabela `profiles` quando um novo usuário se registra.

---

### logout()

```typescript
// app/(public)/auth/login/actions/auth.ts
'use server';

export async function logout() {
  const client = await getServerClient();
  const { error } = await client.auth.signOut();

  if (error) {
    console.error('[logout] Failed:', error);
  }

  redirect(APP_ROUTES.AUTH.LOGIN);
}
```

---

## 🎨 Componentes de UI

### LoginForm

> **Nota:** Exemplo simplificado. O código real em `components/auth/login-form/index.tsx` pode incluir componentes UI customizados e estados adicionais.

```typescript
// components/auth/login-form/index.tsx (simplificado)
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginValues } from '@/lib/validators/auth';
import { login } from '@/app/(public)/auth/login/actions/auth';
import { notifyError } from '@/lib/ui/notifications';

export function LoginForm() {
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginValues) {
    const result = await login(data);

    if (!result.success) {
      notifyError(result.error);
    }
    // Se sucesso, Server Action redireciona automaticamente
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input
        {...form.register('email')}
        type="email"
        placeholder="Email"
      />
      {form.formState.errors.email && (
        <span>{form.formState.errors.email.message}</span>
      )}

      <input
        {...form.register('password')}
        type="password"
        placeholder="Senha"
      />
      {form.formState.errors.password && (
        <span>{form.formState.errors.password.message}</span>
      )}

      <button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
}
```

---

### RegisterForm

> **Nota:** Código real disponível em `components/auth/register-form/index.tsx`.

Similar ao `LoginForm`, mas usa `registerSchema` e `register()`.

---

## 🔄 Middleware

Atualiza a session em toda requisição:

```typescript
// proxy.ts
import { updateSession } from '@/lib/supabase/proxy';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

**O que faz:**

```typescript
// lib/supabase/proxy.ts
export async function updateSession(request: NextRequest) {
  const client = await getServerClient();

  // Refresh token se necessário
  await client.auth.getUser();

  const response = NextResponse.next({ request });

  // Atualiza cookies
  // ...

  return response;
}
```

**Benefícios:**

- ✅ Tokens sempre válidos
- ✅ Session refresh automático
- ✅ Funciona em todas as páginas

---

## 📧 Confirmação de Email

Se habilitado no Supabase, usuários recebem email com link:

```
https://seu-app.com/auth/confirm?token_hash=xxx&type=signup
```

### Handler

```typescript
// app/auth/confirm/route.ts
import { type EmailOtpType } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;

  if (token_hash && type) {
    const client = await getServerClient();
    const { error } = await client.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Erro na confirmação
  return NextResponse.redirect(new URL('/error', request.url));
}
```

---

## 🔑 Validadores (Zod)

### loginSchema

```typescript
// lib/validators/auth.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export type LoginValues = z.infer<typeof loginSchema>;
```

### registerSchema

```typescript
// register schema is currently the same as login schema
export const registerSchema = loginSchema.extend({});

export type RegisterValues = LoginValues;
```

---

## 🔒 Rotas Protegidas

### Layout privado

Todas as rotas em `app/(private)/` exigem autenticação:

```typescript
// app/(private)/(dashboard)/layout.tsx
import { requireAuth } from '@/lib/supabase/auth';
import { QueryClient, dehydrate } from '@tanstack/react-query';
import { prefetchProfile } from '@/lib/supabase/profile.server';

export default async function DashboardLayout({ children }) {
  // Redireciona se não autenticado
  const user = await requireAuth();

  // Prefetch de dados
  const queryClient = new QueryClient();
  await prefetchProfile(queryClient, user.id);

  return (
    <QueryProvider dehydratedState={dehydrate(queryClient)}>
      <SidebarWithHeader user={user}>
        {children}
      </SidebarWithHeader>
    </QueryProvider>
  );
}
```

**O que acontece:**

1. `requireAuth()` verifica auth
2. Se não autenticado → redirect para `/auth/login`
3. Se autenticado → prefetch de dados
4. Children renderizam com dados prontos

---

## 🛡️ Segurança

### CSRF Protection

Server Actions têm proteção nativa do Next.js contra CSRF.

### Password Requirements

Configure no Supabase Dashboard:

1. **Authentication** → **Providers** → **Email**
2. Configure:
   - Minimum password length
   - Require uppercase
   - Require numbers
   - Require special characters

### Rate Limiting

Supabase tem rate limiting automático:

- **30 login attempts / hora** por IP
- **4 signup attempts / hora** por IP

### Session Management

**Token expiration:**

- Access token: 1 hora
- Refresh token: 30 dias

**Logout em todos dispositivos:**

```typescript
export async function logoutAllDevices() {
  const client = await getServerClient();

  // Invalida TODAS as sessions
  const { error } = await client.auth.signOut({ scope: 'global' });

  if (error) {
    return failure(error.message);
  }

  redirect(APP_ROUTES.AUTH.LOGIN);
}
```

---

## 🔄 Fluxo Completo: Login

```
1. Usuário preenche form
        ↓
2. React Hook Form valida (Zod)
        ↓
3. onSubmit() chama login() Server Action
        ↓
4. Server valida de novo (segurança)
        ↓
5. Supabase Auth verifica credenciais
        ↓
6. Se válido: cria session (JWT)
        ↓
7. Middleware atualiza cookies
        ↓
8. Redirect para /dashboard
        ↓
9. Layout verifica auth (requireAuth)
        ↓
10. Prefetch de dados
        ↓
11. Dashboard renderiza com dados
```

---

## 🔄 Fluxo Completo: Registro

```
1. Usuário preenche form (email + password)
        ↓
2. React Hook Form valida (Zod)
        ↓
3. onSubmit() chama register() Server Action
        ↓
4. Server valida de novo
        ↓
5. Supabase Auth cria usuário
        ↓
6. Trigger handle_new_user() dispara
        ↓
7. Perfil criado automaticamente (valores null)
        ↓
8. Session criada (JWT)
        ↓
9. Redirect para /dashboard
        ↓
10. Usuário logado! ✅
```

---

## 🐛 Troubleshooting

### "Invalid login credentials"

**Causa:** Email ou senha incorretos

**Solução:**

- Verifique se digitou corretamente
- Confirme que usuário existe em **Authentication** → **Users**
- Tente resetar senha

### Email de confirmação não chega

**Causa:** Confirmação habilitada mas email não configurado

**Solução:**

1. Vá em **Authentication** → **Email Templates**
2. Configure SMTP ou use provedor padrão
3. Ou desabilite confirmação em desenvolvimento

### Redirect loop infinito

**Causa:** Middleware ou requireAuth com problema

**Solução:**

- Verifique matcher do middleware
- Confirme que rotas públicas não têm `requireAuth()`
- Limpe cookies do navegador

### "User already registered"

**Causa:** Email já existe

**Solução:**

- Use outro email
- Ou faça login com a conta existente

---

## 🎯 Próximos Passos

- [Perfil de Usuário](./profile.md) - Sistema de perfil e avatar
- [Formulários](./forms.md) - React Hook Form + Zod
- [← Voltar ao índice](../README.md)
