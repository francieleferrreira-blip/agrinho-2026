document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. COMPONENTE ACCORDION (SEÇÕES EXPANSÍVEIS INTERATIVAS)
       ========================================================================== */
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const item = this.parentElement;
            const panel = this.nextElementSibling;
            const isExpanded = this.getAttribute('aria-expanded') === 'true';

            // Fecha outros itens (Comportamento Clássico Single-Open)
            document.querySelectorAll('.accordion-item').forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('ativo');
                    const otherHeader = otherItem.querySelector('.accordion-header');
                    const otherPanel = otherItem.querySelector('.accordion-panel');
                    otherHeader.setAttribute('aria-expanded', 'false');
                    otherPanel.style.maxHeight = null;
                    otherPanel.setAttribute('hidden', 'true');
                }
            });

            // Alterna o estado do item atual
            if (!isExpanded) {
                item.classList.add('ativo');
                this.setAttribute('aria-expanded', 'true');
                panel.removeAttribute('hidden');
                panel.style.maxHeight = panel.scrollHeight + "px";
            } else {
                item.classList.remove('ativo');
                this.setAttribute('aria-expanded', 'false');
                panel.style.maxHeight = null;
                // Aguarda a transição terminar para ocultar do leitor de tela
                setTimeout(() => {
                    if (this.getAttribute('aria-expanded') === 'false') {
                        panel.setAttribute('hidden', 'true');
                    }
                }, 300);
            }
        });
    });

    /* ==========================================================================
       2. CONTROLE DO MENU FLUTUANTE DE ACESSIBILIDADE
       ========================================================================== */
    const containerAcessibilidade = document.querySelector('.acessibilidade-container');
    const toggleAcessibilidade = document.getElementById('toggleAcessibilidade');
    const menuAcessibilidade = document.getElementById('menuAcessibilidade');

    toggleAcessibilidade.addEventListener('click', () => {
        const aberto = containerAcessibilidade.classList.toggle('aberto');
        toggleAcessibilidade.setAttribute('aria-expanded', aberto);
        menuAcessibilidade.setAttribute('aria-hidden', !aberto);
    });

    // Redimensionamento de Fontes
    let multiplicadorFonte = 1.0;
    const elementoRaiz = document.documentElement;

    document.getElementById('btnAumentarFonte').addEventListener('click', () => {
        if (multiplicadorFonte < 1.4) {
            multiplicadorFonte += 0.1;
            elementoRaiz.style.fontSize = `${multiplicadorFonte * 16}px`;
        }
    });

    document.getElementById('btnDiminuirFonte').addEventListener('click', () => {
        if (multiplicadorFonte > 0.8) {
            multiplicadorFonte -= 0.1;
            elementoRaiz.style.fontSize = `${multiplicadorFonte * 16}px`;
        }
    });

    // Alternador de Modo Escuro / Claro
    document.getElementById('btnToggleContraste').addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });

    /* ==========================================================================
       3. ENGINE DE LEITURA POR VOZ (SPEECH SYNTHESIS API)
       ========================================================================== */
    const btnIniciarLeitura = document.getElementById('btnIniciarLeitura');
    const btnPararLeitura = document.getElementById('btnPararLeitura');
    let sotaqueBr = null;

    // Carrega vozes de maneira assíncrona
    function carregarVozes() {
        const vozes = window.speechSynthesis.getVoices();
        sotaqueBr = vozes.find(voz => voz.lang === 'pt-BR' || voz.lang.includes('pt'));
    }
    carregarVozes();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = carregarVozes;
    }

    btnIniciarLeitura.addEventListener('click', () => {
        // Interrompe qualquer leitura anterior ativa
        window.speechSynthesis.cancel();

        // Seleciona exclusivamente o conteúdo principal de leitura textual
        const mainTextContent = document.getElementById('main-text');
        
        // Clona o conteúdo para limpar elementos dinâmicos não amigáveis à leitura
        const clone = mainTextContent.cloneNode(true);
        // Remove áreas de controle de comentários para evitar ruído
        const secaoComentarios = clone.querySelector('.secao-comentarios');
        if (secaoComentarios) secaoComentarios.remove();

        const textoParaLer = clone.innerText;

        if (!textoParaLer.trim()) return;

        const utterance = new SpeechSynthesisUtterance(textoParaLer);
        if (sotaqueBr) {
            utterance.voice = sotaqueBr;
        }
        utterance.lang = 'pt-BR';
        utterance.rate = 1.0; // Velocidade ideal

        utterance.onstart = () => {
            btnIniciarLeitura.disabled = true;
            btnPararLeitura.disabled = false;
            btnIniciarLeitura.innerText = "🗣️ Lendo...";
        };

        utterance.onend = () => {
            btnIniciarLeitura.disabled = false;
            btnPararLeitura.disabled = true;
            btnIniciarLeitura.innerText = "🔊 Ouvir";
        };

        utterance.onerror = () => {
            btnIniciarLeitura.disabled = false;
            btnPararLeitura.disabled = true;
            btnIniciarLeitura.innerText = "🔊 Ouvir";
        };

        window.speechSynthesis.speak(utterance);
    });

    btnPararLeitura.addEventListener('click', () => {
        window.speechSynthesis.cancel();
        btnIniciarLeitura.disabled = false;
        btnPararLeitura.disabled = true;
        btnIniciarLeitura.innerText = "🔊 Ouvir";
    });

    /* ==========================================================================
       4. FORMULÁRIO DE INSCRIÇÃO DO SEMINÁRIO (FEEDBACK)
       ========================================================================== */
    const formSeminario = document.getElementById('formSeminario');
    const feedbackForm = document.getElementById('feedbackFormulario');

    formSeminario.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nome = document.getElementById('inputNome').value;
        
        feedbackForm.style.display = 'block';
        feedbackForm.innerText = `Inscrição realizada com sucesso, ${nome}! O link exclusivo do seminário foi enviado para seu e-mail.`;
        
        formSeminario.reset();

        // Ocultar feedback após 6 segundos
        setTimeout(() => {
            feedbackForm.style.display = 'none';
        }, 6000);
    });

    /* ==========================================================================
       5. ÁREA DE COMENTÁRIOS E INTERAÇÃO
       ========================================================================== */
    const formComentario = document.getElementById('formComentario');
    const txtComentario = document.getElementById('txtComentario');
    const listaComentarios = document.getElementById('listaComentarios');

    formComentario.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const texto = txtComentario.value.trim();
        if(!texto) return;

        const novoComentario = document.createElement('div');
        novoComentario.classList.add('comentario-item');
        
        // Adiciona timestamp simulado para visual moderno
        const dataAtual = new Date().toLocaleDateString('pt-BR');
        
        novoComentario.innerHTML = `
            <div class="comentario-meta">Leitor Anônimo • ${dataAtual}</div>
            <div class="comentario-texto">${texto}</div>
        `;

        listaComentarios.prepend(novoComentario);
        txtComentario.value = '';
    });
});




























