# Configuração do Supabase

Configure o banco de dados, autenticação e storage do Supabase.

---

## 📋 Pré-requisitos

- Conta no Supabase (gratuita)
- Projeto criado no [Supabase Dashboard](https://supabase.com/dashboard)

---

## 🗄️ Tabelas

### 1. Profiles

A tabela `profiles` armazena dados dos usuários.

```sql
-- Criar tabela profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  name text,
  bio text,
  website text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table profiles enable row level security;
```

---

## 🔒 RLS Policies (Row Level Security)

### Profiles

```sql
-- SELECT: Usuários podem ver qualquer perfil
create policy "Profiles são públicos para leitura"
  on profiles for select
  using (true);

-- INSERT: Usuários podem criar apenas o próprio perfil
create policy "Usuários podem criar próprio perfil"
  on profiles for insert
  with check ((select auth.uid()) = id);

-- UPDATE: Usuários podem atualizar apenas o próprio perfil
create policy "Usuários podem atualizar próprio perfil"
  on profiles for update
  using ((select auth.uid()) = id);
```

---

## 🔄 Triggers

### Auto-criar perfil ao registrar

Quando um usuário se registra, criamos automaticamente um perfil:

```sql
-- Função que cria o perfil
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

-- Trigger que executa após criar usuário
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

**Como funciona:**

1. Usuário se registra com `signUp({ email, password, options: { data: { full_name: 'João' } } })`
2. Supabase cria usuário na tabela `auth.users`
3. Trigger `on_auth_user_created` dispara
4. Função `handle_new_user()` cria perfil em `profiles`
5. Dados de `raw_user_meta_data` vão pro perfil

---

## 📁 Storage

### 1. Criar Bucket

No Supabase Dashboard:

1. Vá em **Storage**
2. Clique em **New bucket**
3. Nome: `avatars`
4. **Public bucket:** ✅ Marque como público
5. Clique em **Create bucket**

### 2. RLS Policies do Storage

```sql
-- INSERT: Usuários podem fazer upload apenas na própria pasta
create policy "Usuários podem fazer upload de avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

-- UPDATE: Usuários podem atualizar apenas próprios arquivos
create policy "Usuários podem atualizar próprio avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

-- DELETE: Usuários podem deletar apenas próprios arquivos
create policy "Usuários podem deletar próprio avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

-- SELECT: Avatares são públicos (qualquer um pode ver)
create policy "Avatares são públicos"
  on storage.objects for select
  using (bucket_id = 'avatars');
```

**Como funciona:**

```
Path do arquivo: avatars/abc-123-def/foto.jpg
                          └───────┘
                              │
                  Deve ser igual a auth.uid()
```

**Proteção:**

- ✅ User `abc-123` só faz upload em `avatars/abc-123/`
- ❌ User `abc-123` NÃO pode fazer upload em `avatars/xyz-456/`
- ✅ Todo mundo pode VER avatares (público)
- ❌ Só owner pode DELETAR

---

## ⚙️ Configuração de Autenticação

### 1. Habilitar Email Auth

No Supabase Dashboard:

1. Vá em **Authentication** → **Providers**
2. Habilite **Email**
3. Configure:
   - **Enable email confirmations:** Opcional (recomendado em produção)
   - **Secure email change:** ✅ Habilitado
   - **Secure password change:** ✅ Habilitado

### 2. Configurar Site URL

Em **Authentication** → **URL Configuration**:

- **Site URL:** `http://localhost:3000` (desenvolvimento)
- **Redirect URLs:**
  - `http://localhost:3000/**`
  - `https://seu-dominio.com/**` (produção)

### 3. Email Templates (Opcional)

Personalize os emails em **Authentication** → **Email Templates**:

- Confirmation email
- Magic link
- Change email
- Reset password

---

## 🔑 Variáveis de Ambiente

Copie suas credenciais do Supabase:

1. Vá em **Settings** → **API**
2. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Adicione no `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

---

## ✅ Verificando a Configuração

### Teste 1: Tabelas criadas

1. Vá em **Table Editor**
2. Verifique se existe: `profiles`

### Teste 2: RLS ativo

1. Clique na tabela `profiles`
2. Veja se aparece 🔒 ao lado do nome
3. Se sim, RLS está ativo! ✅

### Teste 3: Storage configurado

1. Vá em **Storage**
2. Verifique se bucket `avatars` existe
3. Clique nele e veja se aparece "Public" ✅

### Teste 4: Auth funcionando

1. Rode `npm run dev`
2. Vá em `/auth/register`
3. Crie uma conta
4. Verifique em **Authentication** → **Users** se o usuário foi criado
5. Verifique em **Table Editor** → **profiles** se o perfil foi criado automaticamente

Se tudo deu certo: **✅ Supabase configurado!**

---

## 🐛 Problemas Comuns

### "relation 'profiles' does not exist"

**Causa:** Tabela não foi criada

**Solução:**

1. Vá em **SQL Editor** no Supabase Dashboard
2. Execute o SQL de criação da tabela `profiles`

### Upload de imagem falha

**Causa:** Bucket não existe ou RLS policies não configuradas

**Solução:**

1. Verifique se bucket `avatars` existe
2. Verifique se é público
3. Execute as RLS policies do Storage

### Perfil não é criado ao registrar

**Causa:** Trigger não foi criado

**Solução:**

1. Execute o SQL da função `handle_new_user()`
2. Execute o SQL do trigger `on_auth_user_created`
3. Teste criando um novo usuário

### "Invalid API key"

**Causa:** Variáveis de ambiente erradas

**Solução:**

1. Verifique se `.env.local` existe
2. Confirme que as chaves estão corretas
3. Reinicie o servidor (`npm run dev`)

---

## 📚 SQL Completo (Copy/Paste)

Copie e cole tudo de uma vez no **SQL Editor**:

```sql
-- ============================================
-- TABELAS
-- ============================================

create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  name text,
  bio text,
  website text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table profiles enable row level security;

-- ============================================
-- RLS POLICIES - PROFILES
-- ============================================

create policy "Profiles são públicos para leitura"
  on profiles for select
  using (true);

create policy "Usuários podem criar próprio perfil"
  on profiles for insert
  with check ((select auth.uid()) = id);

create policy "Usuários podem atualizar próprio perfil"
  on profiles for update
  using ((select auth.uid()) = id);

-- ============================================
-- TRIGGERS
-- ============================================

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- RLS POLICIES - STORAGE
-- ============================================

create policy "Usuários podem fazer upload de avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

create policy "Usuários podem atualizar próprio avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

create policy "Usuários podem deletar próprio avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

create policy "Avatares são públicos"
  on storage.objects for select
  using (bucket_id = 'avatars');
```

**Não esqueça:**

1. Criar bucket `avatars` manualmente no Storage
2. Marcar como público ✅

---

## 🎯 Próximos Passos

Supabase configurado! Agora:

- [Autenticação](./features/authentication.md) - Como o sistema de auth funciona
- [Perfil](./features/profile.md) - Sistema de perfil e avatar
- [← Voltar ao índice](./README.md)
