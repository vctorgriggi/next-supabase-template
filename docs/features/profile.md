# Perfil de Usuário

Sistema completo de gerenciamento de perfil com upload de avatar.

---

## 🎯 Como Funciona

O sistema de perfil permite que usuários:

- ✅ Visualizem seu perfil
- ✅ Editem nome completo, username, website
- ✅ Façam upload de avatar (com compressão automática)
- ✅ Removam avatar

---

## 🗄️ Estrutura de Dados

### Tabela profiles

```sql
create table profiles (
  id uuid primary key,              -- Mesmo ID do auth.users
  full_name text,                   -- Nome completo
  username text,                    -- Username/apelido
  website text,                     -- Site pessoal
  avatar_url text,                  -- Path do avatar no Storage
  created_at timestamp,             -- Data de criação
  updated_at timestamp              -- Última atualização
);
```

**Exemplo:**

```json
{
  "id": "abc-123-def",
  "full_name": "João Silva",
  "username": "joaosilva",
  "website": "https://joao.dev",
  "avatar_url": "abc-123-def/1234567890.jpg",
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-20T14:30:00Z"
}
```

### Types TypeScript

```typescript
// lib/supabase/types.ts
export interface Profile {
  full_name: string;
  username: string;
  website: string | null;
  avatar_url: string | null;
}

export interface ProfileUpdate {
  full_name?: string;
  username?: string;
  website?: string | null;
  avatar_url?: string | null;
}
```

---

## 🔄 Arquitetura (3 Camadas)

### Camada 1: Server Action

Valida, autentica e delega:

```typescript
// lib/actions/profile.ts
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
    console.warn('[updateProfile] Validation failed:', parsed.error.issues);
    return failure('Dados inválidos');
  }

  // 2. Autenticação
  const user = await getCurrentUser();
  if (!user) {
    return failure('Não autenticado');
  }

  // 3. Atualização (delega para camada 2)
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

---

### Camada 2: Server Wrapper

Cria client e delega:

```typescript
// lib/supabase/profile.server.ts
import { getServerClient } from './server';
import { updateProfileWithClient } from './profile';

export async function updateProfileDB(
  userId: string,
  updates: ProfileUpdate,
): Promise<Result<boolean>> {
  const client = await getServerClient();

  // Delega para camada 3
  return updateProfileWithClient(client, userId, updates);
}
```

---

### Camada 3: Generic Function

Lógica pura de DB (reutilizável):

```typescript
// lib/supabase/profile.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import { success, failure } from '@/lib/types/result';
import type { ProfileUpdate } from './types';

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

  if (error) {
    console.error('[updateProfileWithClient] DB error:', error);
    return failure(error.message);
  }

  return success(true);
}
```

**Por que 3 camadas?**

✅ **DRY** - Lógica de DB em 1 lugar  
✅ **Reutilizável** - Camada 3 funciona com qualquer client  
✅ **Testável** - Cada camada independente  
✅ **Separação clara** - Cada uma tem sua responsabilidade

---

## 📤 Upload de Avatar

### Por que duas etapas?

**❌ Problema: Upload tradicional**

```typescript
// Tentar fazer tudo de uma vez
async function uploadAvatar(file: File) {
  'use server';

  // ❌ Problemas:
  // 1. File vira base64 (muito pesado)
  // 2. Timeout em arquivos grandes
  // 3. Sem feedback de progresso
}
```

**✅ Solução: Dual Mutation**

```
1. Client faz upload → Supabase Storage (rápido!)
2. Server confirma → Atualiza banco (seguro!)
```

---

### Etapa 1: Upload (Client)

> **Nota:** Exemplo simplificado. O código real em `components/account/avatar.tsx` inclui validação de arquivo, preview com cleanup, estados de loading e tratamento de erros mais robusto.

```typescript
// components/account/avatar.tsx (simplificado)
'use client';

import { useState } from 'react';
import { compressImage } from '@/lib/images/compress';
import { getBrowserClient } from '@/lib/supabase/client';

export function Avatar({ userId, currentAvatar, onUpload }) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(file: File) {
    setUploading(true);

    try {
      // 1. Comprime (90% de redução!)
      const compressed = await compressImage(file);

      // 2. Gera nome único
      const ext = file.name.split('.').pop() || 'jpg';
      const filePath = `${userId}/${Date.now()}.${ext}`;

      // 3. Upload DIRETO pro Supabase Storage
      const client = getBrowserClient();
      const { error } = await client.storage
        .from('avatars')
        .upload(filePath, compressed);

      if (error) throw error;

      // 4. Avisa que terminou
      onUpload(filePath);

    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  }

  return (
    <input
      type="file"
      accept="image/*"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) handleUpload(file);
      }}
      disabled={uploading}
    />
  );
}
```

**O que acontece:**

1. Usuário escolhe arquivo
2. Comprime (3MB → 200KB!)
3. **Upload direto pro Supabase** (não passa pelo Next.js)
4. Chama `onUpload(filePath)` quando terminar

**Neste momento:**

- ✅ Arquivo JÁ ESTÁ no Storage
- ❌ Banco ainda NÃO SABE
- ⚠️ Se fechar página agora, arquivo fica órfão

---

### Etapa 2: Confirmar (Server)

```typescript
// lib/actions/avatar.ts
'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/supabase/auth';
import { getServerClient } from '@/lib/supabase/server';
import { updateProfileDB } from '@/lib/supabase/profile.server';
import { success, failure } from '@/lib/types/result';

export async function confirmAvatar(
  filePath: string | null,
  previousPath?: string | null,
): Promise<Result<string | null>> {
  try {
    // 1. Autenticação
    const user = await getCurrentUser();
    if (!user) {
      return failure('Não autenticado');
    }

    // 2. Atualiza banco (delega pra updateProfileDB)
    const result = await updateProfileDB(user.id, {
      avatar_url: filePath,
    });

    if (!result.success) {
      return failure(result.error);
    }

    // 3. Deleta foto antiga
    if (previousPath && previousPath !== filePath) {
      const supabase = await getServerClient();
      await supabase.storage
        .from('avatars')
        .remove([previousPath])
        .catch((e) => console.warn('Failed to remove old avatar:', e));
    }

    // 4. Revalida cache
    revalidatePath('/', 'layout');
    return success(filePath);
  } catch (err) {
    console.error('[confirmAvatar] Error:', err);
    return failure('Erro no servidor');
  }
}
```

**O que acontece:**

1. Verifica autenticação
2. **Atualiza banco** (profile.avatar_url)
3. **Deleta arquivo antigo** do Storage
4. Revalida cache → UI atualiza automaticamente!

**Agora sim:**

- ✅ Arquivo no Storage
- ✅ Banco sabe onde está
- ✅ Foto antiga deletada
- ✅ Tudo sincronizado!

---

### Compressão

```typescript
// lib/images/compress.ts
import imageCompression from 'browser-image-compression';

export async function compressImage(file: File): Promise<File> {
  return await imageCompression(file, {
    maxSizeMB: 0.2, // 200KB max
    maxWidthOrHeight: 900, // 900px max
    useWebWorker: true, // Não trava a UI
  });
}
```

**Resultado real:**

```
Antes:  3.2 MB (4000x3000px)
Depois: 180 KB (900x675px)
Redução: 94% menor! 🎉
Upload: 10-20x mais rápido
```

---

### Integração com Form

> **Nota:** Exemplo simplificado. O código real em `components/account/account-form.tsx` inclui também gerenciamento de estado do avatar pendente, múltiplas mutations, e integração completa com React Hook Form.

```typescript
// components/account/account-form.tsx (simplificado)
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { confirmAvatar } from '@/lib/actions/avatar';
import { updateProfile } from '@/lib/actions/profile';

export function AccountForm({ profile }) {
  const queryClient = useQueryClient();

  // Avatar - salva sozinho!
  const avatarMutation = useMutation({
    mutationFn: ({ filePath, previousPath }) =>
      confirmAvatar(filePath, previousPath),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        notifySuccess('Avatar atualizado!');
      } else {
        notifyError(result.error);
      }
    },
  });

  // Perfil - precisa clicar "Salvar"
  const profileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        notifySuccess('Perfil atualizado!');
      } else {
        notifyError(result.error);
      }
    },
  });

  return (
    <div>
      {/* Avatar - independente */}
      <Avatar
        userId={profile.id}
        currentAvatar={profile.avatar_url}
        onUpload={(filePath) => {
          // Confirma IMEDIATAMENTE
          avatarMutation.mutate({
            filePath,
            previousPath: profile.avatar_url,
          });
        }}
      />

      {/* Perfil - espera submit */}
      <form onSubmit={form.handleSubmit((data) => profileMutation.mutate(data))}>
        <input {...form.register('full_name')} placeholder="Nome completo" />
        <input {...form.register('username')} placeholder="Username" />
        <input {...form.register('website')} placeholder="Website" />
        <button type="submit">Salvar</button>
      </form>
    </div>
  );
}
```

**Fluxos separados:**

1. **Avatar** → Upload → `confirmAvatar()` → ✅ Salvo automaticamente!
2. **Perfil** → Edita → Clica "Salvar" → `updateProfile()` → ✅ Salvo!

---

## 🎨 Custom Hooks

### useProfile()

> **Nota:** Hook real disponível em `hooks/use-profile.ts`. Pode incluir lógica adicional dependendo da implementação.

Busca perfil do usuário com TanStack Query:

```typescript
// hooks/use-profile.ts
import { useQuery } from '@tanstack/react-query';
import { getBrowserClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/supabase/types';

export function useProfile() {
  const client = getBrowserClient();

  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const {
        data: { user },
      } = await client.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
```

**Uso:**

```typescript
function ProfileDisplay() {
  const { data: profile, isLoading } = useProfile();

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div>
      <h1>{profile?.full_name}</h1>
      <p>@{profile?.username}</p>
      <a href={profile?.website}>{profile?.website}</a>
    </div>
  );
}
```

---

### useProfileAvatar()

> **Nota:** Hook real disponível em `hooks/use-profile-avatar.ts`.

Resolve URL do avatar:

```typescript
// hooks/use-profile-avatar.ts
import { getBrowserClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/supabase/types';

export function useProfileAvatar(profile?: Profile) {
  if (!profile?.avatar_url) return null;

  // Já é URL completa?
  if (profile.avatar_url.startsWith('http')) {
    return profile.avatar_url;
  }

  // Blob local (preview)?
  if (profile.avatar_url.startsWith('blob:')) {
    return profile.avatar_url;
  }

  // Path do Storage → gera public URL
  const client = getBrowserClient();
  const { data } = client.storage
    .from('avatars')
    .getPublicUrl(profile.avatar_url);

  return data.publicUrl;
}
```

**Uso:**

```typescript
function Avatar({ profile }) {
  const avatarUrl = useProfileAvatar(profile);

  return (
    <img
      src={avatarUrl || '/placeholder.png'}
      alt={profile.full_name}
    />
  );
}
```

---

## 🔑 Validadores (Zod)

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

export type AccountFormValues = z.infer<typeof accountSchema>;
```

---

## 🔄 Fluxo Completo: Atualizar Perfil

```
1. Usuário edita full_name/username/website
        ↓
2. Clica "Salvar"
        ↓
3. React Hook Form valida (Zod)
        ↓
4. onSubmit() chama updateProfile() Server Action
        ↓
5. Server valida de novo (segurança)
        ↓
6. Autentica usuário
        ↓
7. Delega para updateProfileDB()
        ↓
8. updateProfileDB() chama updateProfileWithClient()
        ↓
9. Supabase atualiza profiles
        ↓
10. revalidatePath() limpa cache
        ↓
11. invalidateQueries() refetch dados
        ↓
12. UI atualiza automaticamente! ✅
```

---

## 🔄 Fluxo Completo: Upload Avatar

```
1. Usuário escolhe foto
        ↓
2. compressImage() (3MB → 200KB)
        ↓
3. Preview instantâneo (blob URL)
        ↓
4. Upload DIRETO pro Supabase Storage
        ↓
5. onUpload(filePath) dispara
        ↓
6. confirmAvatar() Server Action roda
        ↓
7. Autentica usuário
        ↓
8. updateProfileDB({ avatar_url: filePath })
        ↓
9. Deleta foto antiga do Storage
        ↓
10. revalidatePath() + invalidateQueries()
        ↓
11. Avatar atualiza em TODO o app! ✅
```

---

## 🐛 Troubleshooting

### Upload não funciona

**Causa:** Bucket ou RLS não configurado

**Solução:**

1. Verifique se bucket `avatars` existe
2. Confirme que é público
3. Execute RLS policies do Storage

### Avatar não aparece

**Causa:** URL incorreta

**Solução:**

```typescript
// Use o hook
const avatarUrl = useProfileAvatar(profile);

// Ou getPublicUrl()
const { data } = client.storage
  .from('avatars')
  .getPublicUrl(profile.avatar_url);
```

### Perfil não atualiza

**Causa:** Cache não invalidado

**Solução:**

```typescript
// Sempre invalide após mutation
queryClient.invalidateQueries({ queryKey: ['profile'] });
```

### "Payload too large"

**Causa:** Arquivo muito grande

**Solução:**

```typescript
// Sempre comprima antes!
const compressed = await compressImage(file);
```

---

## 🎯 Próximos Passos

- [Formulários](./forms.md) - React Hook Form + Zod em detalhes
- [Autenticação](./authentication.md) - Sistema de auth
- [← Voltar ao índice](../README.md)
