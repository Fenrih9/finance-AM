# Configuração de Segurança do Firestore (RLS)

## ✅ Arquivo de Regras Criado

O arquivo `firestore.rules` foi criado com regras de segurança equivalentes ao RLS (Row Level Security) do Supabase.

## 🔒 Proteções Implementadas

### Coleção: `transactions`
- ✅ Usuários só podem **ler** suas próprias transações
- ✅ Usuários só podem **criar** transações associadas ao seu próprio `userId`
- ✅ Usuários só podem **atualizar** suas próprias transações
- ✅ Usuários só podem **deletar** suas próprias transações

### Coleção: `categories`
- ✅ Usuários só podem **ler** suas próprias categorias
- ✅ Usuários só podem **criar** categorias associadas ao seu próprio `userId`
- ✅ Usuários só podem **atualizar** suas próprias categorias
- ✅ Usuários só podem **deletar** suas próprias categorias

### Proteção Geral
- ❌ Todas as outras coleções são **bloqueadas por padrão**
- ❌ Usuários não autenticados **não têm acesso** a nenhum dado

## 📋 Como Aplicar as Regras no Firebase Console

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

**❌ Deve NEGAR:**
- Usuário não autenticado tentando ler qualquer documento
- Usuário autenticado (uid: `user123`) tentando ler `/transactions/doc1` onde `userId == user456`
- Usuário tentando criar transação com `userId` diferente do seu próprio uid

## ⚠️ Importante

Após aplicar as regras:
- **Todos os dados existentes** continuarão no banco
- **Apenas o acesso** será restrito conforme as regras
- **Usuários não autenticados** não poderão acessar nenhum dado
- **Cada usuário** só verá seus próprios dados

## 🔍 Verificação

Após aplicar as regras, teste sua aplicação:
1. Faça login com um usuário
2. Verifique se as transações são carregadas corretamente
3. Tente criar uma nova transação
4. Tente deletar uma transação existente
5. Faça logout e verifique se não há acesso aos dados

Se houver algum erro, verifique o console do navegador e os logs do Firebase Console.
