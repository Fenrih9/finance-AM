# 🔐 Ações de Segurança Necessárias (MANUAL)

> [!CAUTION]
> **ATENÇÃO:** As seguintes ações NÃO podem ser automatizadas e requerem sua intervenção manual IMEDIATA.

---

## ✅ Checklist de Segurança

### 🔴 CRÍTICO - Executar IMEDIATAMENTE

- [ ] **1. Verificar se `.env` foi versionado no Git**
- [ ] **2. Limpar `.env` do histórico do Git (se necessário)**
- [ ] **3. Rotacionar credenciais Firebase**
- [ ] **4. Fazer deploy das novas regras Firestore**
- [ ] **5. Configurar restrições de API Key**

### 🟠 IMPORTANTE - Executar em 1 semana

- [ ] **6. Configurar Firebase App Check**
- [ ] **7. Configurar tempo de expiração de tokens**
- [ ] **8. Testar regras de segurança no simulador**

---

## 1️⃣ Verificar se `.env` foi versionado no Git

### Verificação

Execute no terminal:

```bash
git log --all --full-history -- .env
```

**Se o comando retornar commits:**
- ⚠️ O arquivo `.env` FOI versionado e está no histórico do Git
- ✅ Prossiga para o passo 2

**Se o comando não retornar nada:**
- ✅ O arquivo `.env` NUNCA foi versionado
- ✅ Pule para o passo 3

---

## 2️⃣ Limpar `.env` do Histórico do Git

> [!WARNING]
> **ATENÇÃO:** Esta operação reescreve o histórico do Git. Se o repositório já foi compartilhado (GitHub, GitLab, etc.), você precisará fazer `force push`.

### Opção A: Usando BFG Repo-Cleaner (Recomendado)

1. **Baixar BFG:**
   ```bash
   # Download: https://rtyley.github.io/bfg-repo-cleaner/
   ```

2. **Executar limpeza:**
   ```bash
   java -jar bfg.jar --delete-files .env
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   ```

### Opção B: Usando git filter-branch

```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### Opção C: Usando git filter-repo (Mais Rápido)

```bash
# Instalar: pip install git-filter-repo
git filter-repo --path .env --invert-paths
```

### Force Push (Se necessário)

```bash
# ATENÇÃO: Isso sobrescreverá o histórico remoto
git push origin --force --all
git push origin --force --tags
```

---

## 3️⃣ Rotacionar Credenciais Firebase

> [!CAUTION]
> **CRÍTICO:** As credenciais atuais podem estar expostas. Você DEVE rotacioná-las.

### Passos:

1. **Acessar Firebase Console:**
   - URL: https://console.firebase.google.com/
   - Projeto: `finance-9`

2. **Criar novo projeto Firebase (Recomendado):**
   - Clique em "Adicionar projeto"
   - Nome: `finance-nosso-secure` (ou similar)
   - Copie as novas credenciais

3. **OU Rotacionar API Key (Menos seguro):**
   - Vá em: Configurações do Projeto > Geral
   - Role até "Seus apps"
   - Clique em "Configuração do SDK"
   - Clique em "Regenerar chave de API"

4. **Atualizar `.env` com novas credenciais:**
   ```env
   VITE_FIREBASE_API_KEY=NOVA_CHAVE_AQUI
   VITE_FIREBASE_AUTH_DOMAIN=novo-projeto.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=novo-projeto-id
   VITE_FIREBASE_STORAGE_BUCKET=novo-projeto.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=novo-sender-id
   VITE_FIREBASE_APP_ID=novo-app-id
   ```

5. **Verificar que `.env` está no `.gitignore`:**
   ```bash
   git check-ignore .env
   # Deve retornar: .env
   ```

6. **NUNCA fazer commit do `.env`:**
   ```bash
   git status
   # .env NÃO deve aparecer na lista de arquivos modificados
   ```

---

## 4️⃣ Deploy das Novas Regras Firestore

> [!IMPORTANT]
> As novas regras de segurança implementam RLS (Row Level Security) e validação de dados.

### Opção A: Via Firebase Console (Mais Fácil)

1. **Acessar Firebase Console:**
   - URL: https://console.firebase.google.com/
   - Projeto: `finance-9` (ou novo projeto)

2. **Navegar para Firestore:**
   - Menu lateral: **Firestore Database**
   - Aba: **Regras** (Rules)

3. **Copiar novas regras:**
   - Abra o arquivo: `firestore.rules`
   - Copie TODO o conteúdo

4. **Colar no editor:**
   - Cole no editor de regras do Firebase Console
   - Clique em **Publicar** (Publish)

5. **Aguardar confirmação:**
   - Deve aparecer: "Regras publicadas com sucesso"

### Opção B: Via Firebase CLI (Recomendado para produção)

1. **Instalar Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Fazer login:**
   ```bash
   firebase login
   ```

3. **Inicializar projeto (se necessário):**
   ```bash
   firebase init firestore
   # Selecione o projeto correto
   # Use o arquivo firestore.rules existente
   ```

4. **Deploy apenas das regras:**
   ```bash
   firebase deploy --only firestore:rules
   ```

5. **Verificar deploy:**
   ```bash
   firebase firestore:rules:get
   ```

---

## 5️⃣ Configurar Restrições de API Key

> [!WARNING]
> Sem restrições, qualquer pessoa pode usar sua API Key para acessar o Firebase.

### Passos:

1. **Acessar Google Cloud Console:**
   - URL: https://console.cloud.google.com/
   - Selecione o projeto Firebase

2. **Navegar para APIs & Services > Credentials:**
   - Menu: APIs & Services > Credentials

3. **Localizar API Key:**
   - Procure pela chave que começa com `AIzaSy...`

4. **Configurar restrições:**
   - Clique na API Key
   - Em "Application restrictions":
     - Selecione: **HTTP referrers (web sites)**
     - Adicione seus domínios:
       ```
       localhost:5173/*
       localhost:3000/*
       seu-dominio.com/*
       *.seu-dominio.com/*
       ```

5. **Configurar restrições de API:**
   - Em "API restrictions":
     - Selecione: **Restrict key**
     - Marque apenas:
       - Identity Toolkit API
       - Cloud Firestore API
       - Firebase Authentication API

6. **Salvar:**
   - Clique em **Save**

---

## 6️⃣ Configurar Firebase App Check

> [!IMPORTANT]
> App Check protege contra abuso e requisições não autorizadas.

### Passos:

1. **Acessar Firebase Console:**
   - URL: https://console.firebase.google.com/
   - Projeto: `finance-9`

2. **Ativar App Check:**
   - Menu lateral: **App Check**
   - Clique em **Get started**

3. **Configurar para Web:**
   - Selecione seu app web
   - Provider: **reCAPTCHA Enterprise** ou **reCAPTCHA v3**
   - Clique em **Register**

4. **Copiar código de integração:**
   - Firebase fornecerá código para adicionar ao app
   - Adicione ao `firebaseConfig.ts`:

   ```typescript
   import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
   
   const appCheck = initializeAppCheck(app, {
     provider: new ReCaptchaV3Provider('SEU_RECAPTCHA_SITE_KEY'),
     isTokenAutoRefreshEnabled: true
   });
   ```

5. **Ativar enforcement:**
   - Em App Check, ative para:
     - Firestore
     - Authentication

---

## 7️⃣ Configurar Tempo de Expiração de Tokens

### Passos:

1. **Acessar Firebase Console:**
   - URL: https://console.firebase.google.com/
   - Projeto: `finance-9`

2. **Configurar Authentication:**
   - Menu: **Authentication** > **Settings**
   - Aba: **User session**

3. **Configurar expiração:**
   - Session timeout: **1 hour** (recomendado)
   - Refresh token expiration: **30 days**

4. **Salvar alterações**

---

## 8️⃣ Testar Regras de Segurança

### No Firebase Console:

1. **Acessar Simulador:**
   - Firestore Database > Regras > **Simulador de Regras**

2. **Teste 1: Leitura autorizada**
   ```
   Tipo: get
   Caminho: /transactions/test123
   Autenticação: Autenticado (uid: user123)
   Dados simulados: { userId: "user123" }
   
   ✅ Resultado esperado: PERMITIDO
   ```

3. **Teste 2: Leitura não autorizada (IDOR)**
   ```
   Tipo: get
   Caminho: /transactions/test456
   Autenticação: Autenticado (uid: user123)
   Dados simulados: { userId: "user456" }
   
   ❌ Resultado esperado: NEGADO
   ```

4. **Teste 3: Criação com validação**
   ```
   Tipo: create
   Caminho: /transactions/newDoc
   Autenticação: Autenticado (uid: user123)
   Dados: {
     userId: "user123",
     amount: 100,
     type: "expense",
     description: "Test",
     category: "Food",
     date: timestamp
   }
   
   ✅ Resultado esperado: PERMITIDO
   ```

5. **Teste 4: Criação com dados inválidos**
   ```
   Tipo: create
   Caminho: /transactions/newDoc
   Autenticação: Autenticado (uid: user123)
   Dados: {
     userId: "user123",
     amount: -100,  // ❌ Valor negativo
     type: "expense"
   }
   
   ❌ Resultado esperado: NEGADO
   ```

---

## 📊 Verificação Final

Após completar todas as etapas, verifique:

### Checklist de Verificação:

- [ ] `.env` está no `.gitignore`
- [ ] `.env` não aparece em `git status`
- [ ] Credenciais Firebase foram rotacionadas
- [ ] Novas regras Firestore foram publicadas
- [ ] API Key tem restrições configuradas
- [ ] App Check está ativo (opcional mas recomendado)
- [ ] Tokens têm tempo de expiração configurado
- [ ] Testes de segurança passaram no simulador

### Teste na Aplicação:

1. **Teste de Login:**
   - Faça login com usuário válido
   - Verifique que dados são carregados

2. **Teste de Isolamento:**
   - Crie uma transação
   - Verifique que apenas você pode vê-la

3. **Teste de Validação:**
   - Tente criar transação com valor negativo
   - Deve ser rejeitada

4. **Teste de Senha:**
   - Tente criar conta com senha fraca
   - Deve ser rejeitada

---

## 🆘 Problemas Comuns

### "Permission denied" após deploy de regras

**Solução:**
- Verifique que o usuário está autenticado
- Verifique que `userId` está correto nos documentos
- Limpe cache do navegador

### API Key ainda funciona após rotação

**Solução:**
- Aguarde 5-10 minutos para propagação
- Limpe cache do navegador
- Verifique que atualizou `.env` corretamente

### App Check bloqueando requisições legítimas

**Solução:**
- Verifique que o reCAPTCHA site key está correto
- Desative enforcement temporariamente para debug
- Verifique console do navegador para erros

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique logs do Firebase Console
2. Verifique console do navegador (F12)
3. Revise o arquivo `security_analysis.md` para detalhes técnicos
4. Consulte documentação oficial: https://firebase.google.com/docs/security

---

**Última atualização:** 06/01/2026  
**Versão:** 1.0
