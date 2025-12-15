# Contribuindo

Obrigado por considerar contribuir com o Next.js + Supabase Template! 🎉

---

## 🎯 Como Contribuir

### 1. Reportar Bugs

Encontrou um bug? [Abra uma issue](https://github.com/vctorgriggi/next-supabase-template/issues) com:

- **Título claro**: "Bug: Avatar não atualiza após upload"
- **Descrição**: O que aconteceu vs o que deveria acontecer
- **Passos para reproduzir**: Lista numerada
- **Ambiente**: Node version, browser, OS
- **Screenshots**: Se aplicável

**Exemplo:**

```markdown
## Bug: Avatar não atualiza após upload

**O que aconteceu:**
Após fazer upload do avatar, a imagem não aparece na sidebar.

**Passos:**

1. Ir em /account
2. Clicar em "Change" no avatar
3. Selecionar imagem
4. Ver preview aparecer
5. Sidebar não atualiza

**Ambiente:**

- Node: 20.10.0
- Browser: Chrome 120
- OS: macOS 14
```

---

### 2. Sugerir Features

Tem uma ideia? [Abra uma discussion](https://github.com/vctorgriggi/next-supabase-template/discussions) com:

- **Problema que resolve**: Por que isso é útil?
- **Solução proposta**: Como funcionaria?
- **Alternativas**: Outras abordagens consideradas?

---

### 3. Contribuir com Código

#### Antes de começar:

1. **Leia a documentação**: Especialmente [Estrutura do Projeto](./docs/structure.md)
2. **Verifique issues existentes**: Pode ser que alguém já esteja trabalhando nisso
3. **Discuta primeiro**: Para features grandes, abra uma discussion antes

#### Processo:

1. **Fork** o repositório
2. **Clone** seu fork:

```bash
   git clone https://github.com/seu-usuario/next-supabase-template.git
```

3. **Crie uma branch**:

```bash
   git checkout -b feature/nome-da-feature
   # ou
   git checkout -b fix/nome-do-bug
```

4. **Faça suas alterações**
5. **Teste localmente**:

```bash
   npm run dev
   npm run build
   npm run lint
```

6. **Commit** com mensagem clara:

```bash
   git commit -m "feat: adiciona validação de username único"
   # ou
   git commit -m "fix: corrige upload de avatar em Safari"
```

7. **Push** para seu fork:

```bash
   git push origin feature/nome-da-feature
```

8. **Abra um Pull Request**

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

### Imports

A ordem dos imports é organizada automaticamente pelo ESLint (`eslint-plugin-simple-import-sort`).

### TypeScript

```typescript
// ✅ Sempre use tipos
function updateProfile(data: unknown): Promise<Result<boolean>> {}

// ✅ Prefira inferência quando possível
const schema = z.object({ name: z.string() });
type FormData = z.infer<typeof schema>; // ← Inferido

// ❌ Evite any
function doSomething(data: any) {} // ← Não faça isso
```

### Server Actions

Sempre siga o padrão de 4 etapas:

```typescript
'use server';

export async function myAction(data: unknown): Promise<Result<T>> {
  // 1. Validação
  const parsed = schema.safeParse(data);
  if (!parsed.success) return failure('Inválido');

  // 2. Autenticação
  const user = await getCurrentUser();
  if (!user) return failure('Não autenticado');

  // 3. Operação (delega para camada de dados)
  const result = await doSomethingDB(user.id, parsed.data);
  if (!result.success) return failure(result.error);

  // 4. Revalidação
  revalidatePath('/', 'layout');
  return success(true);
}
```

### Validação

```typescript
// ✅ Sempre valide no client E no server
// Client: feedback imediato
const form = useForm({
  resolver: zodResolver(schema),
});

// Server: segurança
const parsed = schema.safeParse(data);
if (!parsed.success) return failure('Inválido');
```

---

## 🧪 Testes

Atualmente não temos testes automatizados, mas você deve:

1. **Testar manualmente** todas as alterações
2. **Verificar em diferentes browsers**: Chrome, Firefox, Safari
3. **Testar com dados inválidos**: Forms vazios, tipos errados, etc
4. **Verificar responsividade**: Mobile, tablet, desktop

**Checklist antes do PR:**

- [ ] Testado localmente (`npm run dev`)
- [ ] Build funciona (`npm run build`)
- [ ] Sem erros de lint (`npm run lint`)
- [ ] Testado em Chrome
- [ ] Testado com dados inválidos
- [ ] Documentação atualizada (se necessário)

---

## 📚 Documentação

Se sua alteração afeta a documentação:

1. **Atualize os arquivos relevantes** em `/docs`
2. **Mantenha consistência** com o estilo existente
3. **Adicione exemplos práticos** quando possível
4. **Use português** para o conteúdo (termos técnicos em inglês são ok)

---

## 🎨 Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Features
git commit -m "feat: adiciona validação de email único"

# Fixes
git commit -m "fix: corrige erro de upload no Safari"

# Docs
git commit -m "docs: atualiza guia de instalação"

# Refactor
git commit -m "refactor: simplifica lógica de autenticação"

# Style
git commit -m "style: formata código com prettier"

# Chore
git commit -m "chore: atualiza dependências"
```

---

## 🔄 Pull Requests

### Título

Use o mesmo padrão dos commits:

```
feat: adiciona validação de username único
fix: corrige upload de avatar em Safari
docs: atualiza guia de estrutura do projeto
```

### Descrição

Inclua:

1. **O que mudou**: Resumo das alterações
2. **Por que**: Motivação e contexto
3. **Como testar**: Passos para verificar
4. **Screenshots**: Se aplicável (principalmente UI)

**Template:**

```markdown
## O que mudou

Adiciona validação para garantir que usernames sejam únicos.

## Por que

Atualmente, múltiplos usuários podem ter o mesmo username, causando confusão.

## Como testar

1. Criar usuário com username "joao"
2. Tentar criar outro com username "joao"
3. Deve mostrar erro "Username já existe"

## Screenshots

[imagem do erro]
```

---

## 🚫 O que NÃO fazer

- ❌ Commits com muitas mudanças não relacionadas
- ❌ Alterar estilo de código sem motivo funcional
- ❌ Adicionar dependências desnecessárias
- ❌ Ignorar padrões existentes do projeto
- ❌ Fazer breaking changes sem discussão prévia

---

## ✅ Checklist Final

Antes de abrir o PR, confirme:

- [ ] Segui os padrões de código do projeto
- [ ] Testei localmente
- [ ] Build funciona sem erros
- [ ] Lint passa sem warnings
- [ ] Commits seguem Conventional Commits
- [ ] PR tem título e descrição claros
- [ ] Documentação atualizada (se necessário)
- [ ] Respondi a todos os comentários de review

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

**Obrigado por contribuir!** 🎉
