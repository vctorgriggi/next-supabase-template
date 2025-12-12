# Contribuindo para Next.js + Supabase Template

Obrigado por considerar contribuir para este projeto! 🎉

## Como Contribuir

### Reportando Bugs

Se você encontrar um bug, por favor abra uma [issue](https://github.com/vctorgriggi/next-supabase-template/issues) incluindo:

- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado vs atual
- Screenshots (se aplicável)
- Versões (Node, npm, navegador)

### Sugerindo Melhorias

Sugestões de novas features ou melhorias são bem-vindas! Abra uma issue descrevendo:

- O problema que a feature resolve
- Como você imagina que funcionaria
- Exemplos de uso (se possível)

### Pull Requests

1. **Fork** o repositório
2. **Clone** seu fork localmente
3. **Crie uma branch** para sua feature/fix: `git checkout -b minha-feature`
4. **Faça suas alterações** seguindo os padrões do projeto
5. **Teste** suas mudanças
6. **Commit** suas alterações: `git commit -m "feat: adiciona nova feature"`
7. **Push** para sua branch: `git push origin minha-feature`
8. Abra um **Pull Request**

## Padrões de Código

### Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - Nova feature
- `fix:` - Correção de bug
- `docs:` - Mudanças na documentação
- `style:` - Formatação, sem mudança de código
- `refactor:` - Refatoração de código
- `test:` - Adição/modificação de testes
- `chore:` - Tarefas de manutenção

Exemplos:

```
feat: adiciona validação de email no signup
fix: corrige erro no upload de avatar
docs: atualiza guia de instalação
```

### TypeScript

- Use tipos explícitos quando necessário
- Evite `any`
- Prefira interfaces para objetos
- Use tipos Result<T> para error handling

### Formatação

O projeto usa Prettier e ESLint. Rode antes de commitar:

```bash
npm run format  # Formata o código
npm run lint    # Verifica erros
```

### Estrutura de Arquivos

Mantenha a estrutura organizada:

```
lib/
├── actions/      # Server Actions
├── supabase/     # Clientes e helpers Supabase
├── validators/   # Schemas Zod
└── types/        # Tipos TypeScript
```

›

### Nomenclatura

Siga estas convenções para manter o código consistente:

#### Arquivos

- **Componentes, providers, hooks**: `kebab-case.tsx` / `kebab-case.ts`

```
  ✅ login-form.tsx
  ✅ query-provider.tsx
  ✅ use-profile.ts
```

- **Pages e layouts**: Padrão Next.js

```
  ✅ page.tsx
  ✅ layout.tsx
  ✅ route.ts
```

- **Utilitários e libs**: `kebab-case.ts`

```
  ✅ app-routes.ts
  ✅ auth.ts
  ✅ compress.ts
```

#### Código

- **Componentes React**: `PascalCase`

```typescript
  ✅ export default function LoginForm() { }
  ✅ export function QueryProvider() { }
```

- **Funções**: `camelCase`

```typescript
  ✅ function getCurrentUser() { }
  ✅ async function handleSubmit() { }
```

- **Constantes**: `UPPER_SNAKE_CASE`

```typescript
  ✅ export const APP_ROUTES = { }
  ✅ const MAX_FILE_SIZE = 10 * 1024 * 1024;
```

- **Tipos e Interfaces**: `PascalCase`

```typescript
  ✅ interface Profile { }
  ✅ type Result<T> = { }
```

#### Exemplos práticos

```
components/
├── auth/
│   ├── login-form.tsx           # arquivo: kebab-case
│   └── register-form.tsx        # componente: PascalCase (dentro)
├── providers/
│   ├── query-provider.tsx       # arquivo: kebab-case
│   └── notifications-provider.tsx
└── ui/
    ├── button.tsx
    └── input.tsx

constants/
└── app-routes.ts                # UPPER_SNAKE_CASE (dentro)

hooks/
├── use-profile.ts               # arquivo: kebab-case
└── use-profile-avatar.ts        # função: camelCase (dentro)

lib/
├── supabase/
│   ├── auth.ts                  # funções: camelCase
│   └── client.ts
└── types/
    └── result.ts                # tipo: PascalCase (Result<T>)
```

## Processo de Review

1. Todos os PRs passam por review
2. CI deve passar (lint, type-check)
3. Ao menos 1 aprovação necessária
4. Merge após aprovação

## Código de Conduta

- Seja respeitoso e inclusivo
- Aceite críticas construtivas
- Foque no que é melhor para a comunidade
- Mostre empatia com outros membros

## Dúvidas?

Abra uma [discussion](https://github.com/vctorgriggi/next-supabase-template/discussions) ou envie uma issue!

---

Obrigado pela contribuição! 🚀
