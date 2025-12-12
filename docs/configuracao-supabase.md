# Configuração do Supabase

Este guia te ajudará a configurar seu projeto Supabase para funcionar com o template.

## 1. Criar Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Preencha os dados:
   - **Name**: `next-supabase-app` (ou outro nome)
   - **Database Password**: Senha forte (guarde bem!)
   - **Region**: Escolha a região mais próxima de você
   - **Pricing Plan**: Free (ou pago se preferir)
5. Clique em "Create new project"
6. Aguarde ~2 minutos para o projeto ser criado

## 2. Obter Credenciais da API

1. No dashboard, vá em **Settings** → **API**
2. Você verá duas seções importantes:

### Project URL

```
https://seu-projeto-id.supabase.co
```

Copie e adicione em `.env.local` como `NEXT_PUBLIC_SUPABASE_URL`

### API Keys

Na seção **Project API keys**, copie a **publishable key (anon)**:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Adicione em `.env.local` como `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

> ⚠️ **Importante:** Nunca compartilhe a `service_role` key publicamente!

## 3. Executar Migrations SQL

Vá em **SQL Editor** no dashboard e execute o seguinte SQL:

### 3.1 Criar Tabela de Perfis

```sql
-- Criar tabela de perfis
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,

  constraint username_length check (char_length(username) >= 3)
);
```

### 3.2 Habilitar Row Level Security (RLS)

```sql
-- Habilitar RLS na tabela profiles
alter table profiles enable row level security;
```

### 3.3 Criar Políticas RLS

```sql
-- Política: Perfis são visíveis por todos
create policy "Public profiles are viewable by everyone"
  on profiles
  for select
  using (true);

-- Política: Usuários podem inserir seu próprio perfil
create policy "Users can insert their own profile"
  on profiles
  for insert
  with check ((select auth.uid()) = id);

-- Política: Usuários podem atualizar seu próprio perfil
create policy "Users can update their own profile"
  on profiles
  for update
  using ((select auth.uid()) = id);

-- Política: Usuários podem deletar seu próprio perfil
create policy "Users can delete their own profile"
  on profiles
  for delete
  using ((select auth.uid()) = id);
```

### 3.4 Criar Função e Trigger para Novo Usuário

```sql
-- Função para criar perfil automaticamente ao criar usuário
create or replace function public.handle_new_user()
returns trigger
set search_path = ''
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

-- Trigger que executa a função ao criar novo usuário
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();
```

### 3.5 Criar Bucket de Storage

```sql
-- Criar bucket 'avatars' (público)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
```

### 3.6 Criar Políticas de Storage

```sql
-- Política: Avatares públicos são acessíveis por todos
create policy "Public avatars are accessible to everyone"
  on storage.objects
  for select
  using (bucket_id = 'avatars');

-- Política: Usuários autenticados podem fazer upload
create policy "Authenticated users can upload avatars"
  on storage.objects
  for insert
  with check (
    bucket_id = 'avatars'
    and (select auth.uid()) is not null
  );

-- Política: Usuários podem atualizar seus próprios avatares
create policy "Users can update their own avatars"
  on storage.objects
  for update
  using (
    bucket_id = 'avatars'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

-- Política: Usuários podem deletar seus próprios avatares
create policy "Users can delete their own avatars"
  on storage.objects
  for delete
  using (
    bucket_id = 'avatars'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );
```

## 4. Configurar Templates de Email

Para que o fluxo de confirmação funcione com Server-Side Auth:

1. Vá em **Authentication** → **Email Templates**
2. Selecione **Confirm signup**
3. Mude a URL de confirmação para:

```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
```

4. Salve as alterações

### Outros Templates (Opcional)

Você pode customizar outros templates da mesma forma:

- **Magic Link** - Login sem senha
- **Change Email Address** - Mudança de email
- **Reset Password** - Recuperação de senha

## 5. Configurar Autenticação

1. Vá em **Authentication** → **Providers**
2. Habilite **Email** (já vem habilitado por padrão)
3. Configure conforme necessário:

### Opções de Email

- **Enable Email Confirmations**: ✅ Ativado
  - Envia email de confirmação no signup
- **Secure Email Change**: ✅ Ativado
  - Requer confirmação para mudar email

### Configurações Avançadas

1. Vá em **Authentication** → **URL Configuration**
2. Configure:

**Development:**

```
Site URL: http://localhost:3000
Redirect URLs: http://localhost:3000/**
```

**Production:**

```
Site URL: https://seu-dominio.com
Redirect URLs: https://seu-dominio.com/**
```

## 6. Verificar Configuração

### Checklist

- [ ] Tabela `profiles` criada
- [ ] RLS habilitado na tabela `profiles`
- [ ] Políticas RLS criadas (4 políticas)
- [ ] Trigger `on_auth_user_created` criado
- [ ] Bucket `avatars` criado e público
- [ ] Políticas de storage criadas (4 políticas)
- [ ] Template de email de confirmação atualizado
- [ ] URLs de redirect configuradas

### Testar

1. Rode `npm run dev`
2. Acesse `http://localhost:3000/auth/login`
3. Clique em "Sign up"
4. Crie uma conta
5. Verifique:
   - Email de confirmação recebido
   - Após confirmar, perfil criado automaticamente
   - Pode fazer login

## Diferenças da Documentação Original

Este template **melhora** a configuração padrão do Supabase:

### ✅ Bucket Público

**Original:**

```sql
-- Bucket privado por padrão
insert into storage.buckets (id, name) values ('avatars', 'avatars');
```

**Nossa versão:**

```sql
-- Bucket público (avatares são públicos)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);
```

**Vantagens:**

- URLs públicas diretas
- Não precisa gerar signed URLs
- Melhor performance (cache no CDN)

### ✅ Políticas RLS Melhoradas

**Original:**

```sql
-- Apenas 3 políticas básicas
```

**Nossa versão:**

```sql
-- 4 políticas (incluindo DELETE)
-- Validação de pasta no storage (segurança)
```

### ✅ Políticas de Storage Baseadas em Pasta

```sql
-- Valida que usuário só pode modificar sua própria pasta
(select auth.uid())::text = (storage.foldername(name))[1]
```

Isso significa:

- Usuário `123` só acessa `avatars/123/arquivo.jpg`
- Usuário `456` não pode acessar arquivos de `123`

## Troubleshooting

### Erro: "new row violates row-level security policy"

**Causa:** Políticas RLS não configuradas corretamente

**Solução:**

1. Verifique se RLS está habilitado
2. Execute novamente os scripts de políticas
3. Teste com `auth.uid()` no SQL Editor:
   ```sql
   select auth.uid(); -- deve retornar seu ID quando logado
   ```

### Erro: "relation 'profiles' does not exist"

**Causa:** Tabela não foi criada

**Solução:** Execute novamente o script 3.1

### Erro: "Storage object not found"

**Causa:** Bucket não criado ou políticas de storage incorretas

**Solução:**

1. Verifique se bucket existe: **Storage** → **Buckets**
2. Execute novamente scripts 3.5 e 3.6

### Email de confirmação não chega

**Possíveis causas:**

1. Template de email não configurado
2. Email na caixa de spam
3. Provider de email com rate limit

**Solução:**

1. Cheque a pasta de spam
2. Para desenvolvimento, desabilite "Email Confirmations" em **Authentication** → **Providers** → **Email**

## Recursos Adicionais

- [Documentação Supabase - Auth](https://supabase.com/docs/guides/auth)
- [Documentação Supabase - RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Documentação Supabase - Storage](https://supabase.com/docs/guides/storage)

---

Pronto! Seu Supabase está configurado e pronto para usar!
