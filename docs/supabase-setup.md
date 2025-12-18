# Configuração do Supabase

Este guia descreve **como configurar o Supabase para funcionar corretamente com este template**.
Os exemplos SQL e comentários técnicos estão em inglês, enquanto as explicações permanecem em português.

---

## 📋 Pré-requisitos

- Conta no Supabase
- Projeto criado no Supabase Dashboard

---

## 🗄️ Database Schema

### Profiles table

A tabela `profiles` armazena dados públicos do usuário e é a **fonte de verdade** para o perfil.

```sql
-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;
```

**Observações:**

- `id` referencia diretamente `auth.users.id`
- `username` é único e validado no banco
- `avatar_url` armazena apenas o path no Storage

---

## 🔒 Row Level Security (RLS)

### Profiles policies

```sql
-- Allow public read access
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

-- Allow users to insert their own profile
create policy "Users can insert their own profile." on profiles
  for insert with check ((select auth.uid()) = id);

-- Allow users to update their own profile
create policy "Users can update own profile." on profiles
  for update using ((select auth.uid()) = id);
```

Essas políticas garantem que:

- qualquer pessoa pode **ver** perfis
- apenas o dono pode **criar ou editar** o próprio perfil

---

## 🔄 Triggers

### Auto-create profile on signup

Quando um usuário se registra, um perfil é criado automaticamente.

```sql
create function public.handle_new_user()
returns trigger
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

> ℹ️ Nota sobre `avatar_url`
>
> A documentação oficial do Supabase inclui o campo `avatar_url` no trigger de criação do perfil,
> utilizando dados de `raw_user_meta_data`.
>
> Neste template, o avatar faz parte de um **fluxo explícito de edição de perfil**, com preview,
> compressão no client e confirmação manual no momento do save.
>
> Por esse motivo, o campo `avatar_url` **não é inicializado no signup**.
> Isso evita estados intermediários inconsistentes e mantém o controle do fluxo no nível da aplicação.

---

## 📁 Storage

### Avatar bucket

Crie manualmente um bucket chamado `avatars` no Supabase Dashboard.

- Bucket name: `avatars`
- Public bucket: ✅ habilitado

### Storage policies

```sql
-- Allow users to upload files only to their own folder
create policy "Users can upload their own avatars"
on storage.objects
for insert
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own files
create policy "Users can update their own avatars"
on storage.objects
for update
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own files
create policy "Users can delete their own avatars"
on storage.objects
for delete
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access to avatars
create policy "Avatars are publicly readable"
on storage.objects
for select
using (bucket_id = 'avatars');
```

**Formato esperado do path:**

```
avatars/<user-id>/<filename>
```

Uploads são feitos diretamente no Storage, mas **só se tornam definitivos após salvar o perfil**.

---

## ⚙️ Authentication Settings

No Supabase Dashboard:

### Providers

- Authentication → Providers
- Enable **Email**
- Email confirmation: opcional (recomendado em produção)

### Server-side email confirmation (recommended)

Este template inclui uma rota de confirmação server-side (/auth/confirm) para suportar
fluxos de autenticação compatíveis com SSR e App Router.

Para garantir que o email de confirmação utilize essa rota, atualize o template
Confirm signup no Supabase Dashboard:

```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
```

### URL Configuration

- Site URL: `http://localhost:3000`
- Redirect URLs:
  - `http://localhost:3000/**`
  - `https://seu-dominio.com/**`

---

## 🔑 Environment Variables

Copie as credenciais em **Settings → API**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

---

## ✅ Verificação

1. **Profiles table**
   - Table Editor → `profiles`

2. **RLS**
   - Cadeado 🔒 visível na tabela

3. **Storage**
   - Bucket `avatars` criado e público

4. **Trigger**
   - Criar usuário → perfil criado automaticamente

Se tudo isso estiver ok, o Supabase está pronto para uso.

## 📚 Próximos passos

- [Autenticação](./features/authentication.md)
- [Perfil de usuário](./features/profile.md)
- [← Voltar ao índice](./README.md)

---

## 📘 Referências Oficiais

Algumas partes desta configuração foram baseadas nas práticas recomendadas e exemplos da documentação oficial do Supabase. Para mais detalhes, consulte:

- **Next.js + Supabase tutorial**  
  https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs

- **Row Level Security (RLS) guide**  
  https://supabase.com/docs/guides/auth/row-level-security

- **Managing user data with triggers**  
  https://supabase.com/docs/guides/auth/managing-user-data#using-triggers

- **Storage policies examples**  
  https://supabase.com/docs/guides/storage#policy-examples

Esses guias oficiais ajudam a entender o “porquê” por trás das decisões de arquitetura adotadas neste template.
