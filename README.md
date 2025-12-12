# Next.js + Supabase Template ✨

Um template completo e pronto para produção que combina Next.js 16 com Supabase. Inclui autenticação server-side, upload otimizado de imagens, formulários type-safe com validação,e uma arquitetura escalável com separação clara entre cliente e servidor.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.0-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

[Demo](https://next-supabase-template.vercel.app) • [Documentação](docs/inicio.md) • [Reportar Bug](https://github.com/vctorgriggi/next-supabase-template/issues)

![Demo do Template](public/demo-auth-flow.gif)

---

## ✨ Funcionalidades

🔐 **Autenticação Completa** — Sistema de auth com email/senha, confirmação e refresh automático  
👤 **Perfis de Usuário** — Gerenciamento de perfil com upload de avatar e validação  
📁 **Storage Otimizado** — Upload com compressão automática e preview em tempo real  
📝 **Formulários Inteligentes** — React Hook Form + Zod com validação client e server  
🔄 **Cache Eficiente** — TanStack Query com SSR e invalidação automática  
🛡️ **Type-Safe** — TypeScript em todo o projeto com tipos inferidos  
🚀 **Server Actions** — Mutações seguras sem API routes  
🎯 **Error Handling** — Padrão Result<T> para tratamento consistente  
🎨 **UI Moderna** — Tailwind CSS 4 + Headless UI components  
📱 **Responsivo** — Design mobile-first e otimizado

![Dashboard Interface](public/screenshot-dashboard.png)

---

## 🚀 Início Rápido

```bash
# Clone o repositório
git clone https://github.com/vctorgriggi/next-supabase-template.git
cd next-supabase-template

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais do Supabase

# Configure o banco de dados (veja docs/configuracao-supabase.md)
# Execute os scripts SQL no Supabase SQL Editor

# Rode o projeto
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) 🎉

> **📖 Guia detalhado:** [Documentação de início](docs/inicio.md)

---

## 📚 Documentação

**🎯 Essencial**

- [Começando](docs/inicio.md)
- [Arquitetura](docs/arquitetura.md)
- [Configuração Supabase](docs/configuracao-supabase.md)

**🔧 Funcionalidades**

- [Autenticação](docs/autenticacao.md)
- [Formulários](docs/formularios.md)
- [Upload de Arquivos](docs/upload-arquivos.md)

---

## 🏗️ Estrutura do Projeto

```
├── app/                      # Next.js App Router
│   ├── (public)/            # Rotas públicas (login, register)
│   └── (private)/           # Rotas protegidas (dashboard, account)
├── components/              # Componentes React
│   ├── ui/                  # Componentes UI reutilizáveis
│   ├── auth/                # Componentes relacionados a auth
│   └── dashboard/           # Componentes do dashboard
├── hooks/                   # Custom React hooks
├── lib/                     # Funções utilitárias
│   ├── actions/             # Server Actions
│   ├── supabase/            # Clientes Supabase e helpers
│   ├── validators/          # Schemas Zod
│   └── types/               # Tipos TypeScript
└── public/                  # Assets estáticos
```

---

## 🛠️ Stack

**Framework** → [Next.js 16](https://nextjs.org/) (App Router)  
**Backend** → [Supabase](https://supabase.com/) (Auth • Database • Storage)  
**Styling** → [Tailwind CSS 4](https://tailwindcss.com/)  
**UI Components** → [Headless UI](https://headlessui.com/)  
**Forms** → [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)  
**State** → [TanStack Query](https://tanstack.com/query)  
**Language** → [TypeScript](https://www.typescriptlang.org/)

---

## 📝 Padrões de Código

### Error Handling com Result<T>

```typescript
type Result<T> = { success: true; data: T } | { success: false; error: string };

// Uso
const result = await updateProfile(data);
if (!result.success) {
  notifyError(result.error);
  return;
}
```

### Server Actions Type-Safe

```typescript
'use server';

export async function updateProfile(
  updates: ProfileUpdate,
): Promise<Result<boolean>> {
  const user = await requireAuth();
  // ... lógica no servidor
}
```

### Proteção de Rotas

```typescript
// Server Component
const user = await requireAuth(); // redireciona se não logado
const user = await getCurrentUser(); // retorna null
```

---

## 🚀 Deploy

[![Deploy com Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vctorgriggi/next-supabase-template)

---

## 🙏 Créditos

Baseado no [tutorial oficial do Supabase](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs) com melhorias significativas:

✅ Separação server/client  
✅ Server Actions + Result<T>  
✅ Custom hooks reutilizáveis  
✅ RLS policies otimizadas  
✅ Storage público com CDN  
✅ Compressão de imagens  
✅ Validação Zod completa

---

**[Issues](https://github.com/vctorgriggi/next-supabase-template/issues)** • **[Discussions](https://github.com/vctorgriggi/next-supabase-template/discussions)** • **[License](LICENSE)**

Feito com ❤️ por [vctorgriggi](https://github.com/vctorgriggi)
