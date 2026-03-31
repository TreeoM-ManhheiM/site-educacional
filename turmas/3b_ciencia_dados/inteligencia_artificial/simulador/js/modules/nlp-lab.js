// ==========================================
// js/modules/nlp-lab.js - Processamento de Linguagem Natural
// ==========================================

export function initNLP(mountPoint) {
    // 1. Injeta o HTML do Laboratório de NLP
    mountPoint.innerHTML = `
        <div class="card" style="margin-bottom: 20px;">
            <h1>Semanas 15-17: Processamento de Linguagem Natural (NLP)</h1>
            <p>Computadores não entendem letras, apenas números. Digite uma frase abaixo para ver como a IA realiza a <strong>Tokenização</strong> (transforma palavras em IDs), analisa o <strong>Sentimento</strong> e faz o <strong>Reconhecimento de Entidades (NER)</strong>.</p>
        </div>

        <div class="card" style="margin-bottom: 20px;">
            <h3>✍️ Entrada de Texto</h3>
            <textarea id="nlp-input" rows="3" style="width: 100%; padding: 15px; border-radius: 8px; background: var(--bg-input); border: 1px solid var(--border); color: var(--text-primary); font-size: 1.1rem; resize: vertical;" placeholder="Digite uma frase aqui... Ex: O João viajou para o Brasil e adorou as praias incríveis!"></textarea>
        </div>

        <div style="display: flex; gap: 20px; flex-wrap: wrap;">
            
            <div class="card" style="flex: 2; min-width: 300px;">
                <h3>🧮 1. Tokenização (Vetorização)</h3>
                <p style="font-size: 0.85rem; color: var(--text-muted);">Como a rede neural enxerga sua frase (Array de Inteiros):</p>
                
                <div id="tokens-container" style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 15px; padding: 15px; background: rgba(0,0,0,0.2); border-radius: 8px; min-height: 80px; align-items: center;">
                    <span style="color: var(--text-muted);">Aguardando texto...</span>
                </div>
                
                <div style="margin-top: 15px; font-family: monospace; background: #000; padding: 10px; border-radius: 6px; color: var(--success);">
                    Tensor 1D: <span id="tensor-output">[ ]</span>
                </div>
            </div>

            <div style="flex: 1; min-width: 300px; display: flex; flex-direction: column; gap: 20px;">
                
                <div class="card" style="flex: 1;">
                    <h3>🎭 2. Análise de Sentimento</h3>
                    <div style="display: flex; align-items: center; gap: 15px; margin-top: 15px;">
                        <div id="sentiment-emoji" style="font-size: 3rem;">😐</div>
                        <div>
                            <div id="sentiment-label" style="font-weight: bold; font-size: 1.2rem;">Neutro</div>
                            <div id="sentiment-score" style="color: var(--text-muted); font-size: 0.9rem;">Score: 0.00</div>
                        </div>
                    </div>
                </div>

                <div class="card" style="flex: 1;">
                    <h3>🔍 3. Entidades (NER - Sem. 17)</h3>
                    <ul id="ner-list" style="margin-top: 10px; padding-left: 20px; color: var(--text-muted);">
                        <li>Nenhuma entidade detectada.</li>
                    </ul>
                </div>

            </div>
        </div>
    `;

    // 2. Mapeamento de Eventos
    const inputEl = document.getElementById('nlp-input');
    
    // Atualiza em tempo real enquanto o usuário digita
    inputEl.addEventListener('input', () => {
        processNLP(inputEl.value);
    });

    // Exemplo inicial opcional
    // inputEl.value = "O Marcos adorou visitar o Japão no ano de 2024, foi uma viagem fantástica!";
    // processNLP(inputEl.value);
}

// 3. Lógica principal do Simulador NLP
function processNLP(text) {
    const tokensContainer = document.getElementById('tokens-container');
    const tensorOutput = document.getElementById('tensor-output');
    const nerList = document.getElementById('ner-list');
    
    if (text.trim() === '') {
        tokensContainer.innerHTML = '<span style="color: var(--text-muted);">Aguardando texto...</span>';
        tensorOutput.innerText = '[ ]';
        updateSentiment(0);
        nerList.innerHTML = '<li>Nenhuma entidade detectada.</li>';
        return;
    }

    // A. Tokenização Limpa (Remove pontuação e divide por espaços)
    // Regex para pegar palavras e números
    const rawTokens = text.match(/\b\w+\b/g) || []; 
    
    tokensContainer.innerHTML = '';
    let tensorArray = [];

    rawTokens.forEach(word => {
        // Gera um "ID único" fictício consistente para a palavra usando uma função hash simples
        const tokenId = Math.abs(hashCode(word.toLowerCase())) % 10000;
        tensorArray.push(tokenId);

        // Cria o elemento visual do Token
        const tokenDiv = document.createElement('div');
        tokenDiv.style.cssText = `
            background: var(--bg-panel); 
            border: 1px solid var(--accent); 
            border-radius: 6px; 
            padding: 5px 10px; 
            text-align: center;
            display: inline-block;
        `;
        tokenDiv.innerHTML = `
            <div style="font-weight: bold; color: var(--text-primary);">${word}</div>
            <div style="font-size: 0.75rem; color: var(--accent);">${tokenId}</div>
        `;
        tokensContainer.appendChild(tokenDiv);
    });

    tensorOutput.innerText = '[ ' + tensorArray.join(', ') + ' ]';

    // B. Análise de Sentimentos Simples (Baseada em Dicionário)
    const sentimentScore = calculateSentiment(rawTokens);
    updateSentiment(sentimentScore);

    // C. Reconhecimento de Entidades (NER Fictício base em regras simples)
    extractEntities(rawTokens, text, nerList);
}

// ==========================================
// Funções Auxiliares de NLP Simulado
// ==========================================

// Função Hash para transformar palavra em Número (Simulando um Vocabulário ID)
function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Converte para 32bit int
    }
    return hash;
}

// Dicionário básico para simular a Análise de Sentimento (RNN)
const dictPositive = ['bom', 'ótimo', 'excelente', 'fantástico', 'incrível', 'feliz', 'adorei', 'adorou', 'gostei', 'amo', 'legal', 'maravilhoso'];
const dictNegative = ['ruim', 'péssimo', 'horrível', 'triste', 'odiei', 'odeio', 'chato', 'mal', 'feio', 'terrível', 'decepção'];

function calculateSentiment(tokens) {
    let score = 0;
    tokens.forEach(token => {
        const word = token.toLowerCase();
        if (dictPositive.includes(word)) score += 1;
        if (dictNegative.includes(word)) score -= 1;
    });
    
    // Normaliza para parecer uma probabilidade de rede neural (entre -1 e 1)
    if (score > 0) return Math.min(score * 0.4, 0.99);
    if (score < 0) return Math.max(score * 0.4, -0.99);
    return 0;
}

function updateSentiment(score) {
    const emoji = document.getElementById('sentiment-emoji');
    const label = document.getElementById('sentiment-label');
    const scoreText = document.getElementById('sentiment-score');

    scoreText.innerText = `Score: ${score.toFixed(2)}`;

    if (score > 0.3) {
        emoji.innerText = '😃';
        label.innerText = 'Positivo';
        label.style.color = 'var(--success)';
    } else if (score < -0.3) {
        emoji.innerText = '😠';
        label.innerText = 'Negativo';
        label.style.color = '#ef4444'; // Vermelho
    } else {
        emoji.innerText = '😐';
        label.innerText = 'Neutro';
        label.style.color = 'var(--text-muted)';
    }
}

// Simulador de NER (Named Entity Recognition) - Encontra Nomes Próprios e Números
function extractEntities(tokens, originalText, ulElement) {
    ulElement.innerHTML = '';
    let found = false;

    // Regra 1: Capturar Números (Anos, valores, etc)
    const numbers = originalText.match(/\b\d+\b/g);
    if (numbers) {
        numbers.forEach(num => {
            found = true;
            ulElement.innerHTML += `<li><strong style="color: #f59e0b;">[NÚMERO]</strong> ${num}</li>`;
        });
    }

    // Regra 2: Capturar Palavras que começam com Maiúscula (exceto a primeira palavra da frase)
    // Isso é uma heurística super simples para simular um modelo de Entidades (Pessoas/Locais)
    const words = originalText.split(' ');
    for (let i = 1; i < words.length; i++) {
        let word = words[i].replace(/[^\w\s\u00C0-\u00FF]/g, ""); // Limpa pontuação
        if (word.length > 1 && word[0] === word[0].toUpperCase() && word !== word.toUpperCase()) {
            found = true;
            ulElement.innerHTML += `<li><strong style="color: #3b82f6;">[PESSOA/LOCAL]</strong> ${word}</li>`;
        }
    }

    if (!found) {
        ulElement.innerHTML = '<li>Nenhuma entidade detectada.</li>';
    }
}