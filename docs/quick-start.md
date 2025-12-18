# Guia Rápido

Este guia mostra como **rodar o template localmente** e verificar se tudo está funcionando.
Ele cobre o caminho feliz de setup, sem entrar em detalhes arquiteturais.

Se você quiser entender _como_ e _por que_ o template funciona dessa forma,
consulte a documentação de conceitos após a instalação.

> ⏱️ Tempo estimado: ~5 a 10 minutos, assumindo familiaridade com Next.js e Supabase.

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter:

- **Node.js 18+** — [Baixe aqui](https://nodejs.org/)
- **npm** ou **yarn** — Vem com Node.js
- **Conta no Supabase** — [Crie grátis](https://supabase.com/)
- **Git** — [Instale aqui](https://git-scm.com/)

---

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/vctorgriggi/next-supabase-template.git
cd next-supabase-template
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env.local
```

Abra `.env.local` e adicione suas credenciais do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

**Onde encontrar essas informações:**

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto (ou crie um novo)
3. Vá em **Settings** → **API**
4. Copie **Project URL** e **anon/public key**

### 4. Configure o banco de dados

Execute os scripts SQL no Supabase:

```bash
# Acesse o SQL Editor no Supabase Dashboard
# Cole e execute os scripts de: docs/supabase-setup.md
```

📖 [Guia completo de configuração do Supabase](./supabase-setup.md)

### 5. Rode o servidor de desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) 🎉

---

## ✅ Verificando a Instalação

### Teste 1: Página inicial carrega

- Acesse `http://localhost:3000`
- Você deve ver a landing page

### Teste 2: Login funciona

1. Clique em "Login"
2. Se não tiver conta, clique em "Register"
3. Crie uma conta com email/senha
4. Se a confirmação de email estiver habilitada no Supabase:
   - Verifique sua caixa de email
   - Clique no link de confirmação
5. Faça login
6. Você deve ser redirecionado para `/dashboard`

### Teste 3: Upload de avatar funciona

1. Vá em `/account`
2. Clique em "Change" no avatar
3. Escolha uma imagem
4. Veja o preview aparecer instantaneamente
5. Clique em "Save" para confirmar a alteração do avatar

Se tudo funcionou: **✅ Instalação completa!**

---

## 🗂️ Estrutura de Pastas (Visão Rápida)

> Visão simplificada da estrutura do projeto. A organização completa está documentada em `docs/structure.md`.

```bash
next-supabase-template/
├── app/                  # Rotas do Next.js (App Router)
│   ├── (public)/         # Páginas públicas (login, home)
│   └── (private)/        # Páginas protegidas (dashboard, account)
│
├── components/           # Componentes React
│   ├── ui/               # Componentes base reutilizáveis
│   └── features/         # Componentes por domínio (auth, profile, etc.)
│
├── lib/                  # Lógica do domínio e infraestrutura
│   ├── supabase/         # Clientes e acesso ao banco
│   ├── validators/       # Schemas Zod
│   └── types/            # Tipos compartilhados
│
├── hooks/                # Custom React hooks
└── docs/                 # Documentação

```

📖 [Estrutura completa explicada](./structure.md)

---

## 🎯 Próximos Passos

Agora que está tudo funcionando:

### 1. Entenda os conceitos (20 min)

Leia sobre os padrões usados no template:

- [Conceitos principais](./concepts.md)
- [Estrutura do projeto](./structure.md)

### 2. Explore os recursos (30 min)

Veja como cada funcionalidade está implementada:

- [Autenticação](./features/authentication.md) — Como login/registro funcionam
- [Perfil de usuário](./features/profile.md) — Sistema de perfil e avatar
- [Formulários](./features/forms.md) — Validação e submissão

### 3. Customize (você decide!)

Agora é com você:

- Adicione novos campos ao perfil
- Crie novas páginas protegidas
- Adicione novas tabelas no banco
- Customize o design com Tailwind

---

## 🐛 Problemas Comuns

### Erro: "Invalid Supabase URL"

**Causa:** Variáveis de ambiente não configuradas

**Solução:**

1. Verifique se `.env.local` existe
2. Confira se as URLs estão corretas
3. Reinicie o servidor (`npm run dev`)

### Erro: "relation 'profiles' does not exist"

**Causa:** Scripts SQL não foram executados

**Solução:**

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Execute os scripts de [supabase-setup.md](./supabase-setup.md)

### Upload de imagem não funciona

**Causa:** Storage bucket não configurado

**Solução:**

1. Acesse **Storage** no Supabase Dashboard
2. Crie um bucket chamado `avatars`
3. Configure como **público**
4. Adicione as RLS policies de [supabase-setup.md](./supabase-setup.md)

### Página em branco após login

**Causa:** Middleware ou auth não configurado corretamente

**Solução:**

1. Verifique se o usuário foi criado no Supabase (Authentication → Users)
2. Confira se o trigger `handle_new_user()` criou um perfil (Table Editor → profiles)
3. Limpe os cookies do navegador e tente novamente

---

## 📚 Documentação Completa

- [← Voltar ao índice](./README.md)
- [Configuração do Supabase →](./supabase-setup.md)

---

Alguma dúvida? [Abra uma issue](https://github.com/vctorgriggi/next-supabase-template/issues) ou [inicie uma discussão](https://github.com/vctorgriggi/next-supabase-template/discussions)!
