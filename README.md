# 🧩 Painel de Prefixo para WhatsApp Web

Este projeto é uma extensão do Chrome que adiciona um painel flutuante no WhatsApp Web, permitindo definir um nome personalizado (prefixo). Esse nome será automaticamente adicionado no início de cada mensagem enviada. É útil para roleplays, interações com múltiplas identidades ou grupos de suporte.

---

## 📌 Funcionalidades

- ✅ Painel flutuante com campo de entrada para definir um prefixo (nome).
- ✅ Armazenamento local do nome com `chrome.storage.local`.
- ✅ Painel minimizável/restaurável com botão circular.
- ✅ Prefixo é automaticamente inserido ao enviar mensagens.
- ✅ Detecta mudanças de conversa no WhatsApp Web.
- ✅ Auto foco e restauração ao alternar de conversa.

---

## 🖼️ Exemplo de uso

Se o nome configurado for **João** e você digitar:

Olá, tudo bem?

A mensagem enviada será:

João: Olá, tudo bem?

---

## 🛠️ Instalação

1. Baixe ou clone este repositório.
2. Acesse `chrome://extensions/` no navegador Chrome.
3. Ative o **Modo do desenvolvedor** no canto superior direito.
4. Clique em **"Carregar sem compactação"**.
5. Selecione a pasta com os arquivos da extensão.
6. Acesse o [WhatsApp Web](https://web.whatsapp.com) e veja o painel no canto inferior direito.

---

## 📁 Estrutura do Código

### 🔹 `criarPainel()`

- Cria o painel flutuante com input de nome e botão de salvar.
- O painel pode ser minimizado para um botão circular “+”.

### 🔹 `salvarNome(novoNome)`

- Salva o nome personalizado usando `chrome.storage.local`.

### 🔹 `monitorarConversa()`

- Observa mudanças de conversa no WhatsApp Web com `MutationObserver`.

### 🔹 `monitorarInput()`

- Substitui o comportamento do `Enter`.
- Insere automaticamente o prefixo definido antes do texto da mensagem.

### 🔹 `inserirPrefixoNoInput()`

- Usado para preencher o campo com o prefixo ao restaurar a conversa ou painel.

---

## 💾 Armazenamento

Usa a API `chrome.storage.local` para armazenar o nome do usuário localmente no navegador, garantindo persistência entre sessões.

---

## 🎨 Estilo do Painel

O painel possui:

- Largura de 200px quando expandido.
- Design limpo e funcional com fontes e botões bem definidos.
- Botão circular de "+", fixado no canto inferior direito ao minimizar.

---

## 🚀 Como funciona

1. Ao carregar o WhatsApp Web, o script verifica o nome salvo no armazenamento.
2. Exibe o painel para o usuário digitar um nome personalizado.
3. Monitora o campo de entrada de mensagem e insere automaticamente o prefixo ao pressionar `Enter`.
4. Detecta mudanças de conversa e restaura o estado do painel e prefixo.

---

## ⚙️ Permissões necessárias

O `manifest.json` da extensão deve conter permissões mínimas como:

```json
{
  "permissions": ["storage", "scripting", "activeTab"],
  "host_permissions": ["https://web.whatsapp.com/"]
}
