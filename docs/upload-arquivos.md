# Upload de Arquivos

Este documento explica o sistema de upload de imagens (avatares) do template.

## Visão Geral

Sistema de upload otimizado com:

- **Compressão automática** de imagens
- **Preview em tempo real** com blob URLs
- **Validação** de tipo e tamanho
- **Storage público** no Supabase
- **Cleanup automático** de arquivos antigos

## Como Funciona

```
Selecionar imagem
        ↓
Validar (tipo, tamanho)
        ↓
Comprimir (opcional)
        ↓
Preview (blob URL)
        ↓
Upload → Supabase Storage
        ↓
Server Action confirma
        ↓
Atualiza DB + limpa arquivo antigo
        ↓
UI atualizada
```

## Exemplo de Uso

### Componente Avatar (simplificado)

```typescript
// components/account/avatar.tsx
'use client';

import { useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/client';
import { compressImage } from '@/lib/images/compress';

export default function Avatar({ uid, url, onUpload, compress = false }) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const supabase = getBrowserClient();

  async function handleUpload(file: File) {
    // Validações
    if (!file.type.startsWith('image/')) {
      throw new Error('Apenas imagens são permitidas');
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      throw new Error('Arquivo muito grande (máx 10MB)');
    }

    // Comprimir se necessário
    const uploadFile = compress ? await compressImage(file) : file;

    // Preview
    const preview = URL.createObjectURL(uploadFile);
    setPreviewUrl(preview);

    // Upload
    const ext = uploadFile.name.split('.').pop() || 'jpg';
    const filePath = `${uid}/${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from('avatars')
      .upload(filePath, uploadFile, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    // Cleanup
    URL.revokeObjectURL(preview);
    setPreviewUrl(null);

    return filePath;
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUploading(true);
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      const filePath = await handleUpload(file);
      onUpload(filePath);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div>
      <img src={previewUrl || url || '/default-avatar.png'} alt="Avatar" />

      <label>
        Change
        <input
          type="file"
          accept="image/*"
          onChange={onFileChange}
          disabled={uploading}
          className="sr-only"
        />
      </label>
    </div>
  );
}
```

**Nota:** O projeto usa uma versão mais completa com hook `useProfileAvatar` para resolver URLs, ícones, loading states e melhor acessibilidade. Veja `components/account/avatar.tsx` para a implementação completa.

### Compressão de Imagem

```typescript
// lib/images/compress.ts
import imageCompression from 'browser-image-compression';

export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.2,
    maxWidthOrHeight: 900,
    useWebWorker: true,
  };

  try {
    const compressedBlob = await imageCompression(file, options);

    const ext = (compressedBlob.type.split('/')[1] || 'jpg').replace(
      /[^a-z0-9]/gi,
      '',
    );
    const name = `${crypto.randomUUID()}.${ext}`;

    return new File([compressedBlob], name, {
      type: compressedBlob.type,
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error('Compression failed:', error);
    // Fallback: retorna original com nome único
    const ext = (file.type.split('/')[1] || 'jpg').replace(/[^a-z0-9]/gi, '');
    const name = `${crypto.randomUUID()}.${ext}`;
    return new File([file], name, {
      type: file.type,
      lastModified: Date.now(),
    });
  }
}
```

**Quando usar:**

- Fotos grandes (> 2MB)
- Uploads de câmera de celular
- Não use para logos já otimizados

### Server Action de Confirmação

```typescript
// lib/actions/avatar.ts
'use server';

export async function confirmAvatar(
  filePath: string | null,
  previousPath?: string | null,
): Promise<Result<string | null>> {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return failure('Não autenticado');

  // Atualizar banco
  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: filePath })
    .eq('id', user.id);

  if (error) return failure(error.message);

  // Limpar arquivo antigo
  if (previousPath && previousPath !== filePath) {
    await supabase.storage
      .from('avatars')
      .remove([previousPath])
      .catch(console.warn);
  }

  revalidatePath('/', 'layout');
  return success(filePath);
}
```

### Hook para Resolver URLs

```typescript
// hooks/use-profile-avatar.ts
import { useEffect, useState } from 'react';

export function useProfileAvatar(avatarUrl: string | null, supabase) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!avatarUrl) {
      setUrl(null);
      setLoading(false);
      return;
    }

    // Já é URL completa
    if (avatarUrl.startsWith('http') || avatarUrl.startsWith('blob:')) {
      setUrl(avatarUrl);
      setLoading(false);
      return;
    }

    // Resolver via Supabase
    const { data } = supabase.storage.from('avatars').getPublicUrl(avatarUrl);

    setUrl(data.publicUrl);
    setLoading(false);
  }, [avatarUrl, supabase]);

  return { url, loading };
}
```

## Configuração no Supabase

### Bucket Público

```sql
-- Criar bucket público
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);
```

**Por que público:**

- URLs diretas sem signed URLs
- Cache no CDN
- Melhor performance
- Avatares são públicos por natureza

### Políticas de Storage

```sql
-- Leitura pública
create policy "Public avatars are accessible to everyone"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Upload autenticado
create policy "Authenticated users can upload avatars"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (select auth.uid()) is not null
  );

-- Update/Delete apenas da própria pasta
create policy "Users can update their own avatars"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );
```

**Segurança:** Cada usuário só pode modificar arquivos em sua pasta (`user-id/arquivo.jpg`)

## Uso no Form

```typescript
export default function AccountForm({ user, initialProfile }) {
  const mutation = useMutation({
    mutationFn: async ({ filePath, previousPath }) => {
      const result = await confirmAvatar(filePath, previousPath);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

  async function handleAvatarUpload(filePath: string | null) {
    try {
      await mutation.mutateAsync({
        filePath,
        previousPath: initialProfile?.avatar_url,
      });

      form.setValue('avatar_url', filePath);
      queryClient.invalidateQueries(['profile']);
      notifySuccess('Avatar atualizado!');
    } catch (err) {
      notifyError(err.message);
    }
  }

  return (
    <form>
      <Avatar
        uid={user?.id}
        url={form.watch('avatar_url')}
        compress
        onUpload={handleAvatarUpload}
      />
    </form>
  );
}
```

## Validações

```typescript
// Tipo de arquivo
if (!file.type.startsWith('image/')) {
  throw new Error('Apenas imagens');
}

// Tamanho (10MB)
const MAX_SIZE = 10 * 1024 * 1024;
if (file.size > MAX_SIZE) {
  throw new Error('Máximo 10MB');
}

// Autenticação
if (!uid) {
  throw new Error('Não autenticado');
}
```

## Otimizações

### Compressão Opcional

```typescript
<Avatar compress={true} /> // Ativa compressão
```

### Preview Instantâneo

```typescript
const preview = URL.createObjectURL(file);
setPreviewUrl(preview);

// Sempre fazer cleanup
URL.revokeObjectURL(preview);
```

### Cache Control

```typescript
await supabase.storage.from('avatars').upload(path, file, {
  cacheControl: '3600', // 1 hora
});
```

## Troubleshooting

### Upload falha silenciosamente

**Causa:** Políticas de storage incorretas

**Solução:** Verifique as policies no Supabase

### "Client not initialized"

**Causa:** Variáveis de ambiente não configuradas

**Solução:** Confira `NEXT_PUBLIC_SUPABASE_URL` no `.env.local`

### Preview não aparece

**Causa:** Blob URL não foi criado

**Solução:** Certifique-se de criar o blob URL antes de usar

### Arquivo antigo não é deletado

**Causa:** RLS policy de DELETE não permite

**Solução:** Verifique a policy baseada em pasta

### Imagem muito grande após upload

**Causa:** Compressão desabilitada

**Solução:** Ative `compress={true}` no componente Avatar

## Próximos Passos

- [Formulários](./formularios.md) - Padrões de forms
- [Autenticação](./autenticacao.md) - Sistema de auth
- [Configuração Supabase](./configuracao-supabase.md) - Storage setup

---

Sistema de upload otimizado e seguro.
