// ==========================================
// js/modules/genai-lab.js - Módulo de IA Generativa
// ==========================================

export function initGenAI(mountPoint) {
    // 1. Injeta o HTML do Playground de GenAI
    mountPoint.innerHTML = `
        <div class="card" style="margin-bottom: 20px;">
            <h1>Semanas 18-28: IA Generativa & RAG</h1>
            <p>Este é o seu <strong>Playground de Engenharia de Prompt</strong>. Ajuste o comportamento da IA usando o Prompt de Sistema, altere a "Criatividade" (Temperature) e adicione documentos externos para testar o conceito de RAG (Geração Aumentada por Recuperação).</p>
        </div>

        <div class="genai-layout" style="display: flex; gap: 20px; height: 600px;">
            
            <div class="card" style="flex: 1; display: flex; flex-direction: column; gap: 15px; overflow-y: auto;">
                <h3>⚙️ Parâmetros do Modelo</h3>
                
                <div class="control-group">
                    <label><strong>System Prompt (Semana 20):</strong></label>
                    <p style="font-size: 0.8rem; color: var(--text-muted); margin: 5px 0;">Define a persona e as regras da IA.</p>
                    <textarea id="sys-prompt" rows="4" style="width: 100%; resize: vertical;">Você é um assistente sarcástico e direto ao ponto. Responda em poucas palavras.</textarea>
                </div>

                <div class="control-group">
                    <label><strong>Contexto RAG (Semana 22):</strong></label>
                    <p style="font-size: 0.8rem; color: var(--text-muted); margin: 5px 0;">Cole um texto aqui para a IA usar como base de conhecimento (Simulação).</p>
                    <textarea id="rag-context" rows="4" style="width: 100%; resize: vertical;" placeholder="Ex: O faturamento da empresa XPTO em 2025 foi de R$ 2 milhões..."></textarea>
                </div>

                <div class="control-group">
                    <label><strong>Temperature: <span id="temp-val">0.7</span></strong></label>
                    <p style="font-size: 0.8rem; color: var(--text-muted); margin: 5px 0;">0 = Focado/Preciso | 1 = Criativo/Aleatório</p>
                    <input type="range" id="temperature" min="0" max="1" step="0.1" value="0.7" style="width: 100%;">
                </div>
            </div>

            <div class="card" style="flex: 2; display: flex; flex-direction: column; padding: 0;">
                <div style="padding: 15px; border-bottom: 1px solid var(--border); background: rgba(0,0,0,0.2); border-radius: 12px 12px 0 0;">
                    <h3 style="margin: 0;">💬 Chat Interativo</h3>
                </div>
                
                <div id="chat-history" style="flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px;">
                    <div class="msg ai-msg" style="background: var(--bg-main); padding: 12px 16px; border-radius: 0 12px 12px 12px; align-self: flex-start; max-width: 80%; border: 1px solid var(--border);">
                        Olá! Configure meus parâmetros ao lado e envie uma mensagem.
                    </div>
                </div>

                <div style="padding: 15px; border-top: 1px solid var(--border); display: flex; gap: 10px;">
                    <input type="text" id="user-input" placeholder="Digite sua mensagem (User Prompt)..." style="flex: 1; padding: 12px; border-radius: 8px;">
                    <button id="btn-send" class="btn-main" style="padding: 0 20px;">Enviar</button>
                </div>
            </div>
        </div>
    `;

    // 2. Elementos da Interface
    const tempSlider = document.getElementById('temperature');
    const tempVal = document.getElementById('temp-val');
    const btnSend = document.getElementById('btn-send');
    const userInput = document.getElementById('user-input');
    const chatHistory = document.getElementById('chat-history');

    // Atualiza o valor numérico da Temperature na tela
    tempSlider.addEventListener('input', (e) => {
        tempVal.innerText = e.target.value;
    });

    // Enviar mensagem com Enter
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });

    // Enviar mensagem com o botão
    btnSend.addEventListener('click', handleSend);

    // 3. Lógica principal do Simulador de IA Generativa
    function handleSend() {
        const text = userInput.value.trim();
        if (!text) return;

        // Pega as configurações atuais
        const sysPrompt = document.getElementById('sys-prompt').value;
        const ragContext = document.getElementById('rag-context').value;
        const temperature = parseFloat(tempSlider.value);

        // Adiciona mensagem do usuário no chat
        addMessage(text, 'user');
        userInput.value = '';

        // Mostra "Digitando..."
        const typingId = addMessage('...', 'ai', true);

        // Simula o tempo de processamento de uma API (LLM)
        setTimeout(() => {
            document.getElementById(typingId).remove(); // Remove o "Digitando"
            
            // Gera uma resposta simulada baseada nas configurações
            const response = simulateLLMResponse(text, sysPrompt, ragContext, temperature);
            addMessage(response, 'ai');
        }, 1500); // 1.5 segundos de delay
    }

    // Função auxiliar para desenhar balões de mensagem
    function addMessage(text, sender, isTyping = false) {
        const msgDiv = document.createElement('div');
        const id = 'msg-' + Date.now();
        msgDiv.id = id;
        
        // Estilo condicional para Usuário ou IA
        if (sender === 'user') {
            msgDiv.style.cssText = `background: var(--accent); color: white; padding: 12px 16px; border-radius: 12px 12px 0 12px; align-self: flex-end; max-width: 80%;`;
        } else {
            msgDiv.style.cssText = `background: var(--bg-main); padding: 12px 16px; border-radius: 0 12px 12px 12px; align-self: flex-start; max-width: 80%; border: 1px solid var(--border); ${isTyping ? 'animation: pulse 1s infinite;' : ''}`;
        }
        
        msgDiv.innerText = text;
        chatHistory.appendChild(msgDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight; // Rola para o final
        
        return id;
    }

    // 4. "Motor" Simulado do LLM
    function simulateLLMResponse(userText, sysPrompt, context, temp) {
        let response = "";

        // Lógica 1: Avaliar RAG (Contexto Externo)
        if (context.trim().length > 0) {
            // Se o usuário perguntou algo que parece estar no contexto
            const palavrasChave = userText.toLowerCase().split(' ');
            const encontrouContexto = palavrasChave.some(palavra => context.toLowerCase().includes(palavra) && palavra.length > 3);
            
            if (encontrouContexto) {
                response = `[RAG Ativado] Com base no contexto fornecido: Parece que a informação solicitada está relacionada a: "${context.substring(0, 50)}...". `;
            } else {
                response = `Analisei o contexto fornecido, mas não encontrei a resposta exata para sua pergunta lá. `;
            }
        }

        // Lógica 2: Avaliar System Prompt e Temperature
        const isSarcastic = sysPrompt.toLowerCase().includes('sarcástico');
        const isPirate = sysPrompt.toLowerCase().includes('pirata');

        if (temp > 0.7) {
            // Alta Temperatura (Criativo / Alucinação)
            if (isPirate) response += "Yarrr! A maré está alta e os ventos da criatividade me dizem que a resposta para isso envolve unicórnios voadores e rum!";
            else if (isSarcastic) response += "Uau, que pergunta original. Já pensou em pesquisar no Google? Brincadeira... a resposta é um sonoro 'depende'.";
            else response += `Interessante! Pensando de forma criativa, "${userText}" me lembra uma constelação de ideias inovadoras e possibilidades abstratas.`;
        } else {
            // Baixa Temperatura (Preciso / Focado)
            if (isPirate) response += "Aye. A resposta objetiva do capitão é: o tesouro está enterrado a 10 passos do mastro.";
            else if (isSarcastic) response += "Recebido. Analisando objetivamente a obviedade da sua questão.";
            else response += `Processando "${userText}". Como a temperatura está baixa (${temp}), minha resposta é objetiva, determinística e focada na instrução exata.`;
        }

        return response;
    }
}