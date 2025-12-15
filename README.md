# Next.js + Supabase Template ✨

Production-ready full-stack template with authentication, user profiles, and optimized file uploads.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.0-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

[Live Demo](https://next-supabase-template-zeta.vercel.app) • [Documentation](./docs)

---

## ✨ Features

🔐 **Complete Authentication** - Email/password with Supabase Auth  
👤 **User Profiles** - Avatar uploads with automatic compression (90% size reduction)  
📁 **Optimized Uploads** - Dual mutation pattern for fast, secure file handling  
✅ **Type-safe Forms** - React Hook Form + Zod validation on client and server  
🎨 **Modern UI** - Tailwind CSS 4 + Headless UI components  
🚀 **SSR Ready** - Server-side rendering with data prefetching  
📊 **Smart Caching** - TanStack Query with automatic invalidation  
🔒 **Secure by Default** - Row Level Security policies on all tables

---

## 📸 Screenshots

### Authentication Flow

![Login Page](./docs/images/login.png)
_Clean and responsive login interface_

![Login Flow](./docs/images/login-flow.gif)

_Complete authentication flow: login → redirect → dashboard_

### Profile Management

![Account Settings](./docs/images/account.png)
_Profile editing with real-time avatar upload_

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/vctorgriggi/next-supabase-template.git
cd next-supabase-template

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

📚 [Complete setup guide](./docs/quick-start.md)

---

## 🏗️ Project Structure

```
app/
├── (public)/
│   └── auth/                  # Login, register pages
└── (private)/
    └── (dashboard)/           # Protected routes
        ├── account/           # Profile settings
        └── dashboard/         # Main dashboard

components/
├── ui/                        # Base UI components
├── auth/                      # Authentication forms
└── account/                   # Profile management

lib/
├── actions/                   # Server Actions
├── supabase/                  # Supabase clients & helpers
│   ├── auth.ts               # getCurrentUser(), requireAuth()
│   ├── profile.ts            # Generic DB functions
│   └── profile.server.ts     # Server-only wrappers
├── validators/                # Zod schemas
└── types/                     # TypeScript types

hooks/                         # Custom React hooks
```

📖 [Complete structure guide](./docs/structure.md)

---

## 🛠️ Tech Stack

**Framework** → [Next.js 16](https://nextjs.org/) (App Router)  
**Backend** → [Supabase](https://supabase.com/) (Auth, Database, Storage)  
**Styling** → [Tailwind CSS 4](https://tailwindcss.com/)  
**Forms** → [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)  
**State** → [TanStack Query](https://tanstack.com/query)  
**UI** → [Headless UI](https://headlessui.com/) + [Heroicons](https://heroicons.com/)  
**Language** → [TypeScript](https://www.typescriptlang.org/)

---

## 📚 Documentation

### Getting Started

- [Quick Start](./docs/quick-start.md) - Setup in 5 minutes
- [Supabase Setup](./docs/supabase-setup.md) - Database, RLS, Storage configuration

### Core Concepts

- [Architecture](./docs/concepts.md#architecture) - Client/server separation
- [Result<T> Pattern](./docs/concepts.md#result-pattern) - Type-safe error handling
- [Server Actions](./docs/concepts.md#server-actions) - Secure mutations
- [SSR + Prefetch](./docs/concepts.md#ssr-prefetch) - Pre-loaded data

### Features

- [Authentication](./docs/features/authentication.md) - Login, register, protected routes
- [User Profile](./docs/features/profile.md) - Profile management with avatar uploads
- [Forms](./docs/features/forms.md) - Validation and submission patterns

### Reference

- [Project Structure](./docs/structure.md) - Folders, layers, naming conventions

---

## 🎯 Key Patterns

### Result<T> Pattern

Type-safe error handling without try-catch hell:

```typescript
import { success, failure } from '@/lib/types/result';

const result = await updateProfile(data);

if (result.success) {
  console.log(result.data); // ✅ TypeScript knows data exists
} else {
  console.error(result.error); // ✅ TypeScript knows error exists
}
```

### Server Actions

End-to-end type safety with secure mutations:

```typescript
'use server';

import { getCurrentUser } from '@/lib/supabase/auth';
import { updateProfileDB } from '@/lib/supabase/profile.server';
import { success, failure } from '@/lib/types/result';

export async function updateProfile(data: unknown): Promise<Result<boolean>> {
  // 1. Validate
  const parsed = schema.safeParse(data);
  if (!parsed.success) return failure('Invalid data');

  // 2. Authenticate
  const user = await getCurrentUser();
  if (!user) return failure('Not authenticated');

  // 3. Update (delegates to profile.server.ts)
  const result = await updateProfileDB(user.id, parsed.data);
  if (!result.success) return failure(result.error);

  // 4. Revalidate cache
  revalidatePath('/', 'layout');
  return success(true);
}
```

### Dual Mutation (File Uploads)

Fast client-side uploads with secure server-side confirmation:

```typescript
// 1. Client: Compress and upload directly to Supabase Storage
const compressed = await compressImage(file);
await client.storage.from('avatars').upload(filePath, compressed);

// 2. Server: Confirm, update database, cleanup old files
await confirmAvatar(filePath, previousPath);
```

Result: **90% smaller files**, no timeouts, automatic cleanup.

[Learn more about patterns](./docs/concepts.md)

---

## 📜 Scripts

```bash
# Development
npm run dev

# Production build
npm run build

# Run production server
npm run start

# Linting
npm run lint
```

---

## 🚀 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vctorgriggi/next-supabase-template)

1. Click the button above
2. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy!

### Other Platforms

This template works with any platform that supports Next.js:

- **Railway** - Auto-deploy from GitHub
- **Netlify** - Drag & drop or Git integration
- **Self-hosted** - Docker or Node.js server

---

## 🔒 Security

- ✅ **Row Level Security (RLS)** - All tables protected with policies
- ✅ **Server-side validation** - Zod schemas validate all inputs
- ✅ **CSRF protection** - Built into Next.js Server Actions
- ✅ **Secure file uploads** - RLS policies on Storage bucket
- ✅ **Automatic session refresh** - Handled by middleware

---

## 🤝 Contributing

Contributions are welcome! Please read the [contributing guide](./CONTRIBUTING.md) and [structure guide](./docs/structure.md) to understand the architecture before submitting PRs.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

This template builds upon:

- [Next.js](https://nextjs.org/) by Vercel
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- Inspired by the [official Supabase + Next.js tutorial](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)

Special thanks to the open source community for the amazing tools and libraries.

---

**[Report Bug](https://github.com/vctorgriggi/next-supabase-template/issues)** • **[Request Feature](https://github.com/vctorgriggi/next-supabase-template/discussions)**

Made with ❤️ by [vctorgriggi](https://github.com/vctorgriggi)
