# Contribuindo

Obrigado por considerar contribuir com o Next.js + Supabase Template 🎉

Este projeto prioriza **clareza, pragmatismo e previsibilidade**. Logo, consistência importa mais do que seguir padrões genéricos.

## 🎯 Como Contribuir

### 1. Reportar Bugs

Encontrou um bug? [Abra uma issue](https://github.com/vctorgriggi/next-supabase-template/issues) com:

- **Título claro**: "Bug: Avatar não atualiza após upload"
- **Descrição**: O que aconteceu vs o que deveria acontecer
- **Passos para reproduzir**: Lista numerada
- **Ambiente**: Node version, browser, OS
- **Screenshots**: Se aplicável

---

### 2. Sugerir Features

Para novas ideias, [abra uma discussion](https://github.com/vctorgriggi/next-supabase-template/discussions) com:

- **Problema que resolve**
- **Solução proposta**
- **Alternativas consideradas**

Features maiores devem ser discutidas **antes** de qualquer implementação.

---

### 3. Contribuir com Código

#### Antes de começar

1. Leia a documentação: Especialmente [Estrutura do Projeto](./docs/structure.md)
2. Verifique issues e discussions existentes
3. Para mudanças maiores, discuta primeiro

#### Processo

1. Fork o repositório
2. Clone o fork
3. Crie uma branch
4. Faça suas alterações
5. Teste localmente (`dev`, `build`, `lint`)
6. Commit com Conventional Commits
7. Push e abra um Pull Request

---

## 📝 Padrões de Código

### Convenções de Nomenclatura

```typescript
// ✅ Arquivos
components / account - form.tsx; // kebab-case
hooks / use - profile.ts; // kebab-case
lib / actions / profile.ts; // kebab-case

// ✅ Código
export function AccountForm() {} // PascalCase (componentes)
export function useProfile() {} // camelCase (hooks)
export async function updateProfile() {} // camelCase (funções)
export const APP_ROUTES = {}; // UPPER_CASE (constantes)
```

---

## ⚙️ Server Actions

A maioria das Server Actions segue um padrão previsível **quando aplicável**:

1. Validação
2. Autorização
3. Operação
4. Revalidação ou redirecionamento

Nem todas as actions precisam de todas as etapas.

---

## 🔐 Autenticação

Use os helpers existentes (`getCurrentUser`, `requireAuth`, `requireGuest`).

---

## ❗ Tratamento de Erros

- Mensagens genéricas em fluxos sensíveis
- Logs detalhados apenas no server

---

## 🧠 Result<T>

Use quando a action retorna dados.
Actions que redirecionam não precisam retornar `Result`.

---

## 🧪 try/catch

Use apenas quando necessário para proteger UX.

---

## 🎨 Commits

Use **Conventional Commits**.

---

## 🤝 Código de Conduta

- Seja respeitoso e profissional
- Aceite feedback construtivo
- Foque no código, não na pessoa
- Ajude outros contribuidores

---

## 💬 Dúvidas?

- 📖 Leia a [documentação completa](./docs/README.md)
- 💡 Abra uma [discussion](https://github.com/vctorgriggi/next-supabase-template/discussions)
- 🐛 Reporte [bugs](https://github.com/vctorgriggi/next-supabase-template/issues)

---

Obrigado por contribuir 🚀
