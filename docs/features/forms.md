# Formulários

Validação e submissão type-safe com React Hook Form + Zod.

---

## 🎯 Stack de Formulários

- **React Hook Form** - Gerenciamento de estado e validação
- **Zod** - Schemas de validação type-safe
- **Server Actions** - Submissão segura pro servidor

---

## 🔄 Fluxo Completo

```
1. Usuário preenche form
        ↓
2. React Hook Form valida (client)
        ↓
3. Se válido, chama onSubmit()
        ↓
4. Server Action executa
        ↓
5. Valida de novo (server)
        ↓
6. Autentica usuário
        ↓
7. Atualiza banco de dados
        ↓
8. Retorna Result<T>
        ↓
9. Client exibe sucesso/erro
        ↓
10. TanStack Query refetch
        ↓
11. UI atualiza! ✅
```

---

## 📝 Exemplo Completo: Account Form

### 1. Schema Zod

```typescript
// lib/validators/account.ts
import { z } from 'zod';

export const accountSchema = z.object({
  full_name: z.string().min(2, 'Nome muito curto').max(100, 'Nome muito longo'),
  username: z
    .string()
    .min(3, 'Username muito curto')
    .max(30, 'Username muito longo')
    .regex(/^[a-zA-Z0-9_]+$/, 'Use apenas letras, números e _'),
  website: z
    .string()
    .url('URL inválida')
    .optional()
    .transform((val) => val || null), // Empty string → null
});

// Type inferido automaticamente
export type AccountFormValues = z.infer<typeof accountSchema>;
```

**Benefícios:**

- ✅ Type safety automático
- ✅ Mensagens de erro customizadas
- ✅ Transformações (empty → null)
- ✅ Validação client E server

---

### 2. Server Action

```typescript
// lib/actions/profile.ts
'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/supabase/auth';
import { updateProfileDB } from '@/lib/supabase/profile.server';
import { success, failure } from '@/lib/types/result';
import { accountSchema } from '@/lib/validators/account';

export async function updateProfile(data: unknown): Promise<Result<boolean>> {
  // 1. Validação (SEMPRE valide no servidor!)
  const parsed = accountSchema.safeParse(data);
  if (!parsed.success) {
    console.warn('[updateProfile] Validation failed:', parsed.error.issues);
    return failure('Dados inválidos');
  }

  // 2. Autenticação
  const user = await getCurrentUser();
  if (!user) {
    return failure('Não autenticado');
  }

  // 3. Atualização
  const result = await updateProfileDB(user.id, parsed.data);
  if (!result.success) {
    console.error('[updateProfile] Update failed:', result.error);
    return failure('Erro ao atualizar perfil');
  }

  // 4. Revalidação
  revalidatePath('/', 'layout');
  return success(true);
}
```

**Por que validar duas vezes?**

- **Client:** Feedback imediato pro usuário
- **Server:** Segurança (nunca confie no client!)

---

### 3. Componente Form

> **Nota:** Exemplo simplificado para fins didáticos. O código real em `components/account/account-form.tsx` inclui também a mutation do avatar e componentes UI customizados.

```typescript
// components/account/account-form.tsx (simplificado)
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { accountSchema, type AccountFormValues } from '@/lib/validators/account';
import { updateProfile } from '@/lib/actions/profile';
import { notifySuccess, notifyError } from '@/lib/ui/notifications';
import type { Profile } from '@/lib/supabase/types';

interface Props {
  profile: Profile;
}

export function AccountForm({ profile }: Props) {
  const queryClient = useQueryClient();

  // React Hook Form
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      full_name: profile.full_name || '',
      username: profile.username || '',
      website: profile.website || '',
    },
  });

  // TanStack Query Mutation
  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        notifySuccess('Perfil atualizado com sucesso!');
      } else {
        notifyError(result.error);
      }
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      notifyError('Erro inesperado');
    },
  });

  function onSubmit(data: AccountFormValues) {
    mutation.mutate(data);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Full Name */}
      <div>
        <label htmlFor="full_name">Nome completo</label>
        <input
          id="full_name"
          type="text"
          {...form.register('full_name')}
          disabled={mutation.isPending}
        />
        {form.formState.errors.full_name && (
          <span className="text-red-500">
            {form.formState.errors.full_name.message}
          </span>
        )}
      </div>

      {/* Username */}
      <div>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          {...form.register('username')}
          disabled={mutation.isPending}
        />
        {form.formState.errors.username && (
          <span className="text-red-500">
            {form.formState.errors.username.message}
          </span>
        )}
      </div>

      {/* Website */}
      <div>
        <label htmlFor="website">Website</label>
        <input
          id="website"
          type="url"
          {...form.register('website')}
          placeholder="https://exemplo.com"
          disabled={mutation.isPending}
        />
        {form.formState.errors.website && (
          <span className="text-red-500">
            {form.formState.errors.website.message}
          </span>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={mutation.isPending || !form.formState.isDirty}
      >
        {mutation.isPending ? 'Salvando...' : 'Salvar alterações'}
      </button>
    </form>
  );
}
```

---

## 🎨 Componentes Reutilizáveis

> **Nota:** Exemplo genérico. Veja `components/ui/input.tsx` para a implementação real do projeto.

### Input com Label e Erro

```typescript
// components/ui/input.tsx (exemplo simplificado)
import { forwardRef } from 'react';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <label htmlFor={props.id} className="block text-sm font-medium">
          {label}
        </label>
        <input
          ref={ref}
          className={`w-full rounded border px-3 py-2 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          {...props}
        />
        {error && (
          <span className="text-sm text-red-500">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

**Uso:**

```typescript
<Input
  label="Nome completo"
  {...form.register('full_name')}
  error={form.formState.errors.full_name?.message}
/>
```

---

## 🔑 Padrões Comuns

### 1. Campos opcionais

```typescript
const schema = z.object({
  bio: z
    .string()
    .max(160)
    .optional()
    .transform((val) => val || null), // Empty → null
});
```

### 2. Email único

```typescript
const schema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .refine(async (email) => {
      // Verifica se já existe
      const exists = await checkEmailExists(email);
      return !exists;
    }, 'Email já cadastrado'),
});
```

### 3. Senha com confirmação

```typescript
const schema = z
  .object({
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    password_confirm: z.string(),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'As senhas não coincidem',
    path: ['password_confirm'],
  });
```

### 4. Data futura

```typescript
const schema = z.object({
  birth_date: z.string().refine((date) => new Date(date) < new Date(), {
    message: 'Data deve estar no passado',
  }),
});
```

---

## 🎯 Estados do Form

### isSubmitting

```typescript
<button disabled={form.formState.isSubmitting}>
  {form.formState.isSubmitting ? 'Salvando...' : 'Salvar'}
</button>
```

### isDirty

Detecta se houve mudanças:

```typescript
<button disabled={!form.formState.isDirty}>
  Salvar alterações
</button>
```

### isValid

Verifica se form é válido:

```typescript
<button disabled={!form.formState.isValid}>
  Continuar
</button>
```

### errors

Exibe erros de validação:

```typescript
{form.formState.errors.email && (
  <span>{form.formState.errors.email.message}</span>
)}
```

---

## 🔄 Integração com TanStack Query

### Mutation básica

```typescript
const mutation = useMutation({
  mutationFn: updateProfile,
  onSuccess: (result) => {
    if (result.success) {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      notifySuccess('Salvo!');
    } else {
      notifyError(result.error);
    }
  },
});
```

### Mutation com optimistic update

> **Nota:** Padrão avançado. Implemente apenas se necessário para sua aplicação.

```typescript
const mutation = useMutation({
  mutationFn: updateProfile,
  onMutate: async (newData) => {
    // Cancela queries em andamento
    await queryClient.cancelQueries({ queryKey: ['profile'] });

    // Snapshot do valor anterior
    const previous = queryClient.getQueryData(['profile']);

    // Atualiza otimisticamente
    queryClient.setQueryData(['profile'], (old) => ({
      ...old,
      ...newData,
    }));

    return { previous };
  },
  onError: (err, newData, context) => {
    // Rollback em caso de erro
    queryClient.setQueryData(['profile'], context?.previous);
    notifyError('Erro ao salvar');
  },
  onSuccess: (result) => {
    if (result.success) {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      notifySuccess('Salvo!');
    }
  },
});
```

---

## 🎨 Notificações

```typescript
// lib/ui/notifications.ts
import { toast } from 'sonner';

export function notifySuccess(message: string) {
  toast.success(message);
}

export function notifyError(message: string) {
  toast.error(message);
}

export function notifyInfo(message: string) {
  toast.info(message);
}
```

**Uso:**

```typescript
import { notifySuccess, notifyError } from '@/lib/ui/notifications';

if (result.success) {
  notifySuccess('Perfil atualizado!');
} else {
  notifyError(result.error);
}
```

---

## 🐛 Troubleshooting

### Validação não funciona

**Causa:** Resolver não configurado

**Solução:**

```typescript
const form = useForm({
  resolver: zodResolver(schema), // ← Não esqueça!
});
```

### Erros não aparecem

**Causa:** Nome do campo diferente no schema

**Solução:**

```typescript
// Schema
const schema = z.object({
  full_name: z.string(), // ← full_name
});

// Form
<input {...form.register('full_name')} /> // ← Mesmo nome!
```

### Submit não dispara

**Causa:** Button sem type="submit"

**Solução:**

```typescript
<button type="submit">Salvar</button> // ← type="submit"
```

### Form não limpa após submit

**Solução:**

```typescript
const mutation = useMutation({
  mutationFn: updateProfile,
  onSuccess: () => {
    form.reset(); // ← Limpa o form
  },
});
```

---

## 🎯 Exemplo: Login Form

> **Nota:** Código real disponível em `components/auth/login-form/index.tsx`.

```typescript
// components/auth/login-form/index.tsx (simplificado)
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormValues } from '@/lib/validators/auth';
import { login } from '@/app/(public)/auth/login/actions/auth';
import { notifyError } from '@/lib/ui/notifications';
import { Input } from '@/components/ui/input';

export function LoginForm() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginFormValues) {
    const result = await login(data);

    if (!result.success) {
      notifyError(result.error);
    }
    // Se sucesso, Server Action redireciona automaticamente
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Email"
        type="email"
        {...form.register('email')}
        error={form.formState.errors.email?.message}
        disabled={form.formState.isSubmitting}
      />

      <Input
        label="Senha"
        type="password"
        {...form.register('password')}
        error={form.formState.errors.password?.message}
        disabled={form.formState.isSubmitting}
      />

      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="w-full rounded bg-blue-600 px-4 py-2 text-white"
      >
        {form.formState.isSubmitting ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
}
```

---

## 🎯 Checklist de Boas Práticas

### ✅ Sempre

- [ ] Use Zod schemas
- [ ] Valide no client E no server
- [ ] Use `zodResolver` no React Hook Form
- [ ] Retorne `Result<T>` dos Server Actions
- [ ] Invalide queries após mutations
- [ ] Desabilite botões durante submissão
- [ ] Exiba erros de validação
- [ ] Use tipos inferidos (`z.infer`)

### ❌ Nunca

- [ ] Confie apenas em validação client
- [ ] Retorne dados sensíveis em erros
- [ ] Esqueça de `revalidatePath()`
- [ ] Deixe botões habilitados durante submissão
- [ ] Use `any` nos tipos

---

## 🎯 Próximos Passos

- [Autenticação](./authentication.md) - Sistema de auth completo
- [Perfil](./profile.md) - Gerenciamento de perfil
- [← Voltar ao índice](../README.md)
