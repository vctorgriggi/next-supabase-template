# Formulários

Este documento explica o padrão de formulários usado no template.

## Visão Geral

O template usa uma stack moderna e type-safe para formulários:

- **React Hook Form** - Gerenciamento de estado com performance
- **Zod** - Validação de schema type-safe
- **Server Actions** - Mutações no servidor sem API routes
- **TanStack Query** - Cache e invalidação automática

## Como Funciona

```
Usuário preenche form
        ↓
Validação Zod (client)
        ↓
Server Action
        ↓
Validação + Auth (server)
        ↓
Mutação no Supabase
        ↓
Result<T> → UI atualizada
```

## Exemplo Básico

### 1. Schema de Validação

```typescript
// lib/validators/account.ts
import { z } from 'zod';

export const accountSchema = z.object({
  full_name: z.string().min(1, 'Nome é obrigatório'),
  username: z.string().min(3, 'Mínimo 3 caracteres'),
  website: z.preprocess(
    (val) => (val === '' ? null : val),
    z.union([z.string().url('URL inválida'), z.null()]),
  ),
});

export type AccountValues = z.infer<typeof accountSchema>;
```

**Nota:** Use `preprocess` para normalizar strings vazias em `null`.

### 2. Server Action

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

  if (!user) return failure('Não autenticado');

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id);

  if (error) return failure(error.message);

  revalidatePath('/', 'layout');
  return success(true);
}
```

**Estrutura padrão:**

1. Validar autenticação
2. Fazer mutação
3. Revalidar cache
4. Retornar `Result<T>`

### 3. Componente do Form

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';

export default function AccountForm({ user, initialProfile }) {
  const form = useForm<AccountValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: initialProfile,
  });

  const mutation = useMutation({
    mutationFn: async (values: AccountValues) => {
      const result = await updateProfile(values);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

  async function onSubmit(values: AccountValues) {
    try {
      await mutation.mutateAsync(values);
      notifySuccess('Salvo!');
      form.reset(values);
    } catch (error) {
      notifyError(error.message);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <InputWithLabel
        label="Nome"
        error={form.formState.errors.full_name?.message}
        {...form.register('full_name')}
      />

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Salvando...' : 'Salvar'}
      </Button>
    </form>
  );
}
```

## Componente de Input

```typescript
// components/ui/input.tsx (versão simplificada)
import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
}

const InputWithLabel = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, ...props }, ref) => (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        ref={ref}
        className={error ? 'border-red-500' : 'border-gray-300'}
        {...props}
      />
      {error && <p className="text-red-600">{error}</p>}
    </div>
  ),
);

export default InputWithLabel;
```

**Nota:** O projeto usa uma versão mais robusta com CVA (variantes type-safe), ícones de erro, dark mode e ARIA completo. Veja `components/ui/input.tsx` para a implementação completa.

## Validações Comuns

```typescript
// Email
email: z.string().email('Email inválido');

// Senha com requisitos
password: z.string()
  .min(6, 'Mínimo 6 caracteres')
  .regex(/[A-Z]/, 'Precisa de maiúscula')
  .regex(/[0-9]/, 'Precisa de número');

// URL opcional
website: z.preprocess(
  (val) => (val === '' ? null : val),
  z.union([z.string().url(), z.null()]),
);

// Username
username: z.string()
  .min(3, 'Mínimo 3 caracteres')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Apenas letras, números, _ e -');

// Confirmação de senha
z.object({
  password: z.string().min(6),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
});
```

## Boas Práticas

### Validação Client + Server

**Client:** Feedback instantâneo com `resolver: zodResolver(schema)`

**Server:** Segurança com validação adicional

```typescript
if (!updates.username) return failure('Invalid');
```

### Loading States

```typescript
<Button disabled={mutation.isPending}>
  {mutation.isPending ? 'Salvando...' : 'Salvar'}
</Button>
```

### Reset Após Sucesso

```typescript
await mutation.mutateAsync(values);
form.reset(values); // Marca como pristine
queryClient.invalidateQueries(['profile']);
```

### Error Handling

```typescript
try {
  await mutation.mutateAsync(values);
  notifySuccess('Salvo!');
} catch (error) {
  notifyError(error.message);
}
```

## Notificações

```typescript
// lib/ui/notifications.ts
import { toast } from 'sonner';

export const notifySuccess = (msg: string) => toast.success(msg);
export const notifyError = (msg: string) => toast.error(msg);
```

## Troubleshooting

### Validação não funciona

**Causa:** Resolver do Zod não configurado

**Solução:** Certifique-se de usar `resolver: zodResolver(schema)`

### Form não reseta

**Causa:** Valores não atualizados após submit

**Solução:** Use `form.reset(newValues)` após sucesso

### Erro "Cannot read property 'message'"

**Causa:** Campo não registrado

**Solução:** Registre o campo com `{...form.register('campo')}`

### Valores não aparecem

**Causa:** defaultValues definido antes dos dados carregarem

**Solução:** Use `useEffect` para resetar quando dados chegarem:

```typescript
useEffect(() => {
  if (data) form.reset(data);
}, [data]);
```

## Próximos Passos

- [Upload de Arquivos](./upload-arquivos.md) - Sistema de avatar
- [Autenticação](./autenticacao.md) - Forms de login/signup
- [Arquitetura](./arquitetura.md) - Padrões do projeto

---

Formulários type-safe e performáticos!
