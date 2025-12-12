# Começando

Este guia vai te ajudar a configurar o projeto do zero.

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm** ou **yarn** - Vem com Node.js
- **Git** - [Download](https://git-scm.com/)
- **Conta Supabase** - [Criar conta](https://supabase.com)

## Instalação Passo a Passo

### 1. Clone o Repositório

```bash
git clone https://github.com/vctorgriggi/next-supabase-template.git
cd next-supabase-template
```

### 2. Instale as Dependências

```bash
npm install
```

Isso instalará todas as dependências listadas no `package.json`:

- Next.js 16
- React 19
- Supabase (SSR + JS)
- TanStack Query
- React Hook Form + Zod
- Tailwind CSS 4
- E mais...

### 3. Configure o Supabase

#### 3.1 Crie um Projeto

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Escolha sua organização
4. Preencha:
   - Nome do projeto
   - Senha do banco
   - Região (escolha a mais próxima)
5. Aguarde a criação (~2 minutos)

#### 3.2 Obtenha as Credenciais

1. Vá em **Settings** → **API**
2. Copie:
   - **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`)
   - **Publishable Key** (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)

#### 3.3 Configure as Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```bash
cp .env.example .env.local
```

Edite `.env.local` e adicione suas credenciais:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sua-chave-publishable
```

### 4. Configure o Banco de Dados

Execute os scripts SQL no Supabase:

1. Abra o **SQL Editor** no dashboard do Supabase
2. Copie todo o conteúdo de [`configuracao-supabase.md`](./configuracao-supabase.md)
3. Cole no editor e clique em **Run**

Isso criará:

- ✅ Tabela `profiles`
- ✅ Políticas RLS (Row Level Security)
- ✅ Trigger para criar perfil automaticamente
- ✅ Bucket de storage `avatars`
- ✅ Políticas de storage

### 5. (Opcional) Configure Templates de Email

Para que o fluxo de confirmação de email funcione corretamente:

1. Vá em **Authentication** → **Email Templates**
2. Selecione **Confirm signup**
3. Mude a URL de confirmação para:
   ```
   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
   ```

### 6. Rode o Projeto

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador! 🎉

## Próximos Passos

### Testando a Aplicação

1. **Crie uma conta:**
   - Acesse `/auth/login`
   - Clique em "Sign up"
   - Cadastre-se com email e senha

2. **Confirme o email:**
   - Cheque seu inbox
   - Clique no link de confirmação
   - Você será redirecionado para o dashboard

3. **Atualize seu perfil:**
   - Acesse `/account`
   - Preencha seu nome, username, website
   - Faça upload de uma foto de perfil

### Explorando o Código

Comece explorando:

- [`app/(private)/(dashboard)/layout.tsx`](<../app/(private)/(dashboard)/layout.tsx>) - Layout protegido
- [`lib/supabase/`](../lib/supabase/) - Clientes e helpers Supabase
- [`lib/actions/`](../lib/actions/) - Server Actions
- [`components/account/`](../components/account/) - Componentes de perfil

### Leia a Documentação

- [Arquitetura](./arquitetura.md) - Entenda a estrutura do projeto
- [Autenticação](./autenticacao.md) - Como funciona o sistema de auth
- [Formulários](./formularios.md) - Padrões de forms e validação
- [Upload de Arquivos](./upload-arquivos.md) - Sistema de upload

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Rodar build local
npm start

# Linting
npm run lint

# Formatação
npm run format
```

## Troubleshooting

### Erro: "Environment variable not set"

**Solução:** Certifique-se de que o arquivo `.env.local` existe e contém as variáveis corretas.

### Erro: "Failed to fetch profile"

**Possíveis causas:**

1. Políticas RLS não configuradas
2. Trigger de criação de perfil não executado
3. Usuário não autenticado

**Solução:** Rode novamente os scripts SQL de configuração.

### Erro de CORS

**Solução:**

1. Vá em **Settings** → **API**
2. Em "API Settings", adicione `http://localhost:3000` aos "Allowed origins"

### Upload de imagem falha

**Solução:**

1. Verifique se o bucket `avatars` foi criado
2. Confirme que as políticas de storage foram aplicadas
3. Certifique-se de que o bucket está marcado como "public"

## Próximos Passos

- [Arquitetura](./arquitetura.md) - Entenda a estrutura do projeto
- [Autenticação](./autenticacao.md) - Como funciona o sistema de auth
- [Formulários](./formularios.md) - Padrões de forms e validação
- [Upload de Arquivos](./upload-arquivos.md) - Sistema de upload

## Precisa de Ajuda?

- 📖 [Documentação completa](./README.md)
- 🐛 [Reportar um bug](https://github.com/vctorgriggi/next-supabase-template/issues)
- 💬 [Fazer uma pergunta](https://github.com/vctorgriggi/next-supabase-template/discussions)

---

Pronto para começar!
