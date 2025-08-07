class PainelPrefixo {
  constructor() {
    this.nomeAtual = "João";
    this.extensaoAtiva = true;
    this.ultimaConversa = null;

    chrome.storage.local.get(["nomePersonalizado"], result => {
      if (result.nomePersonalizado) this.nomeAtual = result.nomePersonalizado;
      this.criarPainel();
      this.monitorarConversa();
    });

    document.addEventListener("keydown", e => {
      const isCtrlDown = e.ctrlKey || e.metaKey;
      if (isCtrlDown && e.key === "ArrowDown") {
        e.preventDefault();
        this.restaurarPainel();
      }
    });
  }

  criarPainel() {
    if (document.getElementById("painel-nome")) return;

    const painel = document.createElement("div");
    painel.id = "painel-nome";
    Object.assign(painel.style, {
      position: "fixed",
      bottom: "130px",
      right: "15px",
      background: "white",
      padding: "8px",
      border: "1px solid #ccc",
      zIndex: 9999,
      width: "200px",
      fontFamily: "Arial, sans-serif",
      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      borderRadius: "4px",
      transition: "all 0.3s ease"
    });

    painel.innerHTML = `
      <div id="painel-conteudo">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <label style="font-size: 12px; font-weight: bold; margin: 0;">Prefixo (nome):</label>
          <button id="btn-minimizar" title="Minimizar/Restaurar" style="
            background: transparent; border: none; cursor: pointer; font-weight: bold; font-size: 14px;
            padding: 0 5px; color: #333;">−</button>
        </div>
        <input type="text" id="input-nome" value="${this.nomeAtual}" placeholder="Digite um nome" style="
          width: 100%; box-sizing: border-box; padding: 5px; font-size: 13px; border: 1px solid #ccc; border-radius: 3px;
        "/>
        <button id="btn-salvar" style="
          margin-top: 6px; width: 100%; padding: 6px; font-size: 13px; cursor: pointer; background-color: #4CAF50; color: white; border: none; border-radius: 3px;
        ">Salvar</button>
        <button id="btn-toggle-extensao" style="
          margin-top: 6px; width: 100%; padding: 6px; font-size: 13px; cursor: pointer; background-color: #f44336; color: white; border: none; border-radius: 3px;
        ">Desligar Extensão</button>
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
        padding: 0;
        line-height: 30px;
        text-align: center;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      ">+</button>
    `;

    document.body.appendChild(painel);

    this.inputNome = document.getElementById("input-nome");
    this.btnSalvar = document.getElementById("btn-salvar");
    this.btnMinimizar = document.getElementById("btn-minimizar");
    this.btnBolinha = document.getElementById("btn-bolinha");
    this.btnToggleExtensao = document.getElementById("btn-toggle-extensao");
    this.painelConteudo = document.getElementById("painel-conteudo");

    this.inputNome.focus();

    this.btnSalvar.addEventListener("click", () => this.salvarNome(this.inputNome.value));
    this.inputNome.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.salvarNome(this.inputNome.value);
        this.minimizarPainel();
        setTimeout(() => this.inserirPrefixoNoInput(), 100);
      }
    });

    this.btnMinimizar.addEventListener("click", () => this.minimizarPainel());
    this.btnBolinha.addEventListener("click", () => this.restaurarPainel());
    this.btnToggleExtensao.addEventListener("click", () => this.toggleExtensao());

    // Inicia minimizado
    this.minimizarPainel();
  }

  salvarNome(nome) {
    this.nomeAtual = nome.trim();
    chrome.storage.local.set({ nomePersonalizado: this.nomeAtual });

    if (this.btnSalvar) {
      this.btnSalvar.textContent = "Salvo!";
      setTimeout(() => (this.btnSalvar.textContent = "Salvar"), 1000);
    }
  }

  minimizarPainel() {
    this.painelConteudo.style.display = "none";
    const painel = document.getElementById("painel-nome");
    Object.assign(painel.style, {
      width: "40px",
      height: "40px",
      padding: "0",
      borderRadius: "50%"
    });
    this.btnBolinha.style.display = "block";
  }

  restaurarPainel() {
    const painel = document.getElementById("painel-nome");
    this.painelConteudo.style.display = "block";
    Object.assign(painel.style, {
      width: "200px",
      height: "auto",
      padding: "8px",
      borderRadius: "4px"
    });
    this.btnBolinha.style.display = "none";
    this.inputNome.focus();
    this.inputNome.select();
  }

  toggleExtensao() {
    this.extensaoAtiva = !this.extensaoAtiva;
    this.btnToggleExtensao.textContent = this.extensaoAtiva ? "Desligar Extensão" : "Ativar Extensão";
    this.btnToggleExtensao.style.backgroundColor = this.extensaoAtiva ? "#f44336" : "#2196F3";
  }

  monitorarConversa() {
    const observer = new MutationObserver(() => {
      if (!this.extensaoAtiva) return;

      const chatTitle = document.querySelector('header span[title]');
      if (!chatTitle) return;

      const conversaAtual = chatTitle.getAttribute('title');
      if (conversaAtual !== this.ultimaConversa) {
        this.ultimaConversa = conversaAtual;
        setTimeout(() => this.monitorarInput(), 500);
        this.limparCampoSeNaoEstaNaConversa();
      }
    });

    observer.observe(document.body, { subtree: true, childList: true });
  }

  monitorarInput() {
    if (!this.extensaoAtiva) return;

    const inputBox = document.querySelector('[contenteditable="true"][data-tab="10"]');
    if (!inputBox) return;

    inputBox.onkeydown = null;

    inputBox.addEventListener("keydown", e => {
      if (!this.extensaoAtiva) return;

      if (e.key === "Enter" && !e.shiftKey) {
        const texto = inputBox.innerText.trim();
        const prefixo = `*${this.nomeAtual}:* `;

        e.preventDefault();

        inputBox.innerText = "";
        inputBox.focus();
        document.execCommand("selectAll", false, null);
        document.execCommand("insertText", false, prefixo + texto);

        this.posicionarCursor(inputBox, (prefixo + texto).length);
      }
    });
  }

  inserirPrefixoNoInput() {
    if (!this.extensaoAtiva) return;

    const inputBox = document.querySelector('[contenteditable="true"][data-tab="10"]');
    if (!inputBox) return;

    const prefixo = `*${this.nomeAtual}:* `;
    inputBox.focus();
    document.execCommand("selectAll", false, null);
    document.execCommand("insertText", false, prefixo);
    this.posicionarCursor(inputBox, prefixo.length);
  }

  limparCampoSeNaoEstaNaConversa() {
    if (!this.extensaoAtiva) return;

    const inputBox = document.querySelector('[contenteditable="true"][data-tab="10"]');
    if (!inputBox) return;

    const chatTitle = document.querySelector('header span[title]');
    if (!chatTitle) {
      inputBox.innerText = "";
    }
  }

  posicionarCursor(element, pos) {
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
}

// Inicializa tudo
new PainelPrefixo();
