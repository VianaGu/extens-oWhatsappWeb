let nomeAtual = "João";

chrome.storage.local.get(["nomePersonalizado"], result => {
  if (result.nomePersonalizado) nomeAtual = result.nomePersonalizado;
  criarPainel();
  monitorarConversa();
});

function criarPainel() {
  if (document.getElementById("painel-nome")) return;

  const painel = document.createElement("div");
  painel.id = "painel-nome";
  painel.style.position = "fixed";
  painel.style.bottom = "130px";
  painel.style.right = "15px";
  painel.style.background = "white";
  painel.style.padding = "8px";
  painel.style.border = "1px solid #ccc";
  painel.style.zIndex = 9999;
  painel.style.width = "200px";
  painel.style.fontFamily = "Arial, sans-serif";
  painel.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
  painel.style.borderRadius = "4px";
  painel.style.transition = "all 0.3s ease";

  painel.innerHTML = `
    <div id="painel-conteudo">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <label style="font-size: 12px; font-weight: bold; margin: 0;">Prefixo (nome):</label>
        <button id="btn-minimizar" title="Minimizar/Restaurar" style="
          background: transparent; border: none; cursor: pointer; font-weight: bold; font-size: 14px; line-height: 1;
          padding: 0 5px; color: #333;
        ">−</button>
      </div>
      <input type="text" id="input-nome" value="${nomeAtual}" placeholder="Digite um nome" style="
        width: 100%; box-sizing: border-box; padding: 5px; font-size: 13px; border: 1px solid #ccc; border-radius: 3px;
      "/>
      <button id="btn-salvar" style="
        margin-top: 6px; width: 100%; padding: 6px; font-size: 13px; cursor: pointer; background-color: #4CAF50; color: white; border: none; border-radius: 3px;
      ">Salvar</button>
    </div>
    <button id="btn-bolinha" title="Restaurar painel" style="
      display: none;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 1px solid #4CAF50;
      background-color: #4CAF50;
      color: white;
      font-weight: bold;
      cursor: pointer;
      user-select: none;
      outline: none;
      padding: 0;
      line-height: 30px;
      text-align: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    ">+</button>
  `;

  document.body.appendChild(painel);

  const inputNome = document.getElementById("input-nome");
  const btnSalvar = document.getElementById("btn-salvar");
  const btnMinimizar = document.getElementById("btn-minimizar");
  const btnBolinha = document.getElementById("btn-bolinha");
  const painelConteudo = document.getElementById("painel-conteudo");

  inputNome.focus();

  btnSalvar.addEventListener("click", () => {
    salvarNome(inputNome.value);
  });

  inputNome.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      salvarNome(inputNome.value);
      minimizarPainel();
      setTimeout(() => inserirPrefixoNoInput(), 100);
    }
  });

  btnMinimizar.addEventListener("click", () => {
    minimizarPainel();
  });

  btnBolinha.addEventListener("click", () => {
    painelConteudo.style.display = "block";
    painel.style.width = "200px";
    painel.style.height = "auto";
    painel.style.padding = "8px";
    painel.style.borderRadius = "4px";
    btnBolinha.style.display = "none";
    inputNome.focus();
  });

  // Inicia minimizado
  painelConteudo.style.display = "none";
  painel.style.width = "40px";
  painel.style.height = "40px";
  painel.style.padding = "0";
  painel.style.borderRadius = "50%";
  btnBolinha.style.display = "block";
}

function salvarNome(novoNome) {
  nomeAtual = novoNome.trim();
  chrome.storage.local.set({ nomePersonalizado: nomeAtual });

  const btnSalvar = document.getElementById("btn-salvar");
  if (btnSalvar) {
    btnSalvar.textContent = "Salvo!";
    setTimeout(() => (btnSalvar.textContent = "Salvar"), 1000);
  }
}

function minimizarPainel() {
  const painelConteudo = document.getElementById("painel-conteudo");
  const painel = document.getElementById("painel-nome");
  const btnBolinha = document.getElementById("btn-bolinha");

  if (painelConteudo && painel && btnBolinha) {
    painelConteudo.style.display = "none";
    painel.style.width = "40px";
    painel.style.height = "40px";
    painel.style.padding = "0";
    painel.style.borderRadius = "50%";
    btnBolinha.style.display = "block";
  }
}

function restaurarPainel() {
  const painel = document.getElementById("painel-nome");
  const painelConteudo = document.getElementById("painel-conteudo");
  const btnBolinha = document.getElementById("btn-bolinha");
  const inputNome = document.getElementById("input-nome");

  if (painel && painelConteudo && btnBolinha) {
    painelConteudo.style.display = "block";
    painel.style.width = "200px";
    painel.style.height = "auto";
    painel.style.padding = "8px";
    painel.style.borderRadius = "4px";
    btnBolinha.style.display = "none";
    inputNome?.focus();
    inputNome?.select();
  }
}

function monitorarConversa() {
  let ultimaConversa = null;

  const observer = new MutationObserver(() => {
    const chatTitle = document.querySelector('header span[title]');
    if (!chatTitle) return;

    const conversaAtual = chatTitle.getAttribute('title');
    if (conversaAtual !== ultimaConversa) {
      ultimaConversa = conversaAtual;
      setTimeout(() => monitorarInput(), 500);
      limparCampoSeNaoEstaNaConversa();
      // restaurarPainel(); ← Linha removida para não reabrir o painel automaticamente
    }
  });

  observer.observe(document.body, { subtree: true, childList: true });
}

function monitorarInput() {
  const inputBox = document.querySelector('[contenteditable="true"][data-tab="10"]');
  if (!inputBox) return;

  inputBox.onkeydown = null;

  inputBox.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      const texto = inputBox.innerText.trim();
      const prefixo = `*${nomeAtual}:* `;

      e.preventDefault();

      inputBox.innerText = "";
      inputBox.focus();
      document.execCommand("selectAll", false, null);
      document.execCommand("insertText", false, prefixo + texto);

      posicionarCursor(inputBox, (prefixo + texto).length);
    }
  });
}

function inserirPrefixoNoInput() {
  const inputBox = document.querySelector('[contenteditable="true"][data-tab="10"]');
  if (!inputBox) return;
  const prefixo = `*${nomeAtual}:* `;
  inputBox.focus();
  document.execCommand("selectAll", false, null);
  document.execCommand("insertText", false, prefixo);
  posicionarCursor(inputBox, prefixo.length);
}

function limparCampoSeNaoEstaNaConversa() {
  const inputBox = document.querySelector('[contenteditable="true"][data-tab="10"]');
  if (!inputBox) return;

  const chatTitle = document.querySelector('header span[title]');
  if (!chatTitle) {
    inputBox.innerText = "";
    return;
  }
}

function posicionarCursor(element, pos) {
  const selection = window.getSelection();
  const range = document.createRange();

  if (!element.firstChild) return;

  const textNode = element.firstChild;
  const length = textNode.length || 0;
  const position = Math.min(pos, length);

  range.setStart(textNode, position);
  range.collapse(true);

  selection.removeAllRanges();
  selection.addRange(range);
}
document.addEventListener("keydown", e => {
  const isCtrlDown = e.ctrlKey || e.metaKey; // Suporta Mac também (cmd)
  const isArrowDown = e.key === "ArrowDown";

  if (isCtrlDown && isArrowDown) {
    e.preventDefault();
    restaurarPainel();
  }
});
