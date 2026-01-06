# Configuração de Segurança do Firestore (RLS)

> [!IMPORTANT]
> **ATUALIZADO:** As regras de segurança foram completamente reescritas com validação abrangente e proteção contra ataques.

## ✅ Arquivo de Regras Atualizado

O arquivo `firestore.rules` foi atualizado com regras de segurança avançadas equivalentes ao RLS (Row Level Security) do Supabase, incluindo **validação de dados** e **proteção contra injeção**.

## 🔒 Proteções Implementadas

### Coleção: `transactions`
- ✅ Usuários só podem **ler** suas próprias transações
- ✅ Usuários só podem **criar** transações associadas ao seu próprio `userId`
- ✅ **Validação de dados:**
  - `amount`: deve ser número positivo < 1 bilhão
  - `type`: deve ser 'income' ou 'expense'
  - `description`: 1-500 caracteres
  - `category`: obrigatória
  - `date`: deve ser timestamp válido
  - **Campos extras são rejeitados** (prevenção de injeção)
- ✅ Usuários só podem **atualizar** suas próprias transações
- ✅ Usuários só podem **deletar** suas próprias transações
- ✅ **userId não pode ser alterado** em updates

### Coleção: `categories`
- ✅ Usuários só podem **ler** suas próprias categorias
- ✅ Usuários só podem **criar** categorias associadas ao seu próprio `userId`
- ✅ **Validação de dados:**
  - `name`: 1-50 caracteres
  - `type`: deve ser 'income' ou 'expense'
  - **Campos extras são permitidos** (color, icon) mas validados
- ✅ Usuários só podem **atualizar** suas próprias categorias
- ✅ Usuários só podem **deletar** suas próprias categorias
- ✅ **userId não pode ser alterado** em updates

### Proteção Geral
- ❌ Todas as outras coleções são **bloqueadas por padrão**
- ❌ Usuários não autenticados **não têm acesso** a nenhum dado
- ✅ **Proteção contra IDOR** (Insecure Direct Object Reference)
- ✅ **Proteção contra injeção de campos** maliciosos
- ✅ **Validação de tipos** de dados

## 📋 Como Aplicar as Regras no Firebase Console

> [!CAUTION]
> **AÇÃO NECESSÁRIA:** Você DEVE fazer deploy das novas regras manualmente. Consulte `SECURITY_ACTIONS_REQUIRED.md` para instruções detalhadas.

### Opção 1: Via Firebase Console (Interface Web)

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto: **finance-9**
3. No menu lateral, clique em **Firestore Database**
4. Clique na aba **Regras** (Rules)
5. Copie o conteúdo do arquivo `firestore.rules`
6. Cole no editor de regras
7. Clique em **Publicar** (Publish)

### Opção 2: Via Firebase CLI (Linha de Comando)

Se você tem o Firebase CLI instalado, pode fazer o deploy das regras automaticamente:

```bash
# Instalar Firebase CLI (se ainda não tiver)
npm install -g firebase-tools

# Fazer login no Firebase
firebase login

# Inicializar o projeto (se ainda não foi feito)
firebase init firestore

# Fazer deploy apenas das regras
firebase deploy --only firestore:rules
```

## 🧪 Como Testar as Regras

No Firebase Console, você pode usar o **Simulador de Regras**:

1. Na aba **Regras**, clique em **Simulador de Regras**
2. Configure o tipo de operação (get, list, create, update, delete)
3. Defina o caminho (ex: `/transactions/test123`)
4. Configure a autenticação simulada
5. Clique em **Executar**

### Exemplos de Testes:

**✅ Deve PERMITIR:**
- Usuário autenticado (uid: `user123`) lendo `/transactions/doc1` onde `userId == user123`
- Usuário autenticado criando transação com `userId` igual ao seu próprio uid
- Criação com dados válidos: `amount: 100, type: 'expense', description: 'Test'`

**❌ Deve NEGAR:**
- Usuário não autenticado tentando ler qualquer documento
- Usuário autenticado (uid: `user123`) tentando ler `/transactions/doc1` onde `userId == user456`
- Usuário tentando criar transação com `userId` diferente do seu próprio uid
- Criação com `amount` negativo ou zero
- Criação com `type` inválido (ex: 'hacked')
- Criação com campos extras maliciosos
- Update tentando alterar `userId`

## 🛡️ Proteções Adicionais Implementadas

### Client-Side (Código TypeScript)

Além das regras Firestore, foram implementadas proteções no código:

1. **Validação de entrada** (`security-utils.ts`):
   - Validação de transações antes de enviar ao Firestore
   - Validação de categorias
   - Validação de senha forte
   - Sanitização de entrada de usuário

2. **Tratamento de erros seguro**:
   - Mensagens genéricas para usuários
   - Sem exposição de detalhes técnicos
   - Logs apenas em desenvolvimento

3. **Limpeza de estado**:
   - Dados sensíveis são limpos no logout
   - Proteção contra vazamento de dados

## ⚠️ Importante

Após aplicar as regras:
- **Todos os dados existentes** continuarão no banco
- **Apenas o acesso** será restrito conforme as regras
- **Usuários não autenticados** não poderão acessar nenhum dado
- **Cada usuário** só verá seus próprios dados
- **Dados inválidos** serão rejeitados automaticamente

## 🔍 Verificação

Após aplicar as regras, teste sua aplicação:
1. Faça login com um usuário
2. Verifique se as transações são carregadas corretamente
3. Tente criar uma nova transação
4. Tente criar transação com dados inválidos (deve falhar)
5. Tente deletar uma transação existente
6. Faça logout e verifique se não há acesso aos dados

Se houver algum erro, verifique:
- Console do navegador (F12)
- Logs do Firebase Console
- Arquivo `SECURITY_ACTIONS_REQUIRED.md` para troubleshooting

## 📚 Documentação Adicional

- **Análise de Segurança:** Veja `security_analysis.md` para lista completa de vulnerabilidades
- **Ações Manuais:** Veja `SECURITY_ACTIONS_REQUIRED.md` para passos críticos
- **Utilitários de Segurança:** Veja `security-utils.ts` para funções de validação

---

**Última atualização:** 06/01/2026  
**Versão:** 2.0 (Regras avançadas com validação)

