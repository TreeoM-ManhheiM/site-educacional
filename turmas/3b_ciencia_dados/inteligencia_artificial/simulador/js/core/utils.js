// ==========================================
// js/core/utils.js - Funções Utilitárias Compartilhadas
// ==========================================

/**
 * Normaliza um array de números para o intervalo [0, 1] (Min-Max Scaler).
 * Essencial para preparar os dados antes do treino de qualquer IA.
 * * @param {Array<number>} data - Array de números originais
 * @returns {Array<number>} Array com os valores normalizados
 */
export function normalizeData(data) {
    if (!data || data.length === 0) return [];
    const max = Math.max(...data);
    const min = Math.min(...data);
    
    // Evitar divisão por zero se todos os valores forem iguais
    if (max === min) return data.map(() => 0.5); 
    
    return data.map(val => (val - min) / (max - min));
}

/**
 * Desenha uma representação visual de uma Rede Neural num Canvas.
 * Pode ser importado no mlp-lab.js para ilustrar a arquitetura (Semanas 1 a 4).
 * * @param {HTMLCanvasElement} canvas - O elemento <canvas> onde será desenhada
 * @param {Array<number>} layers - Array com o número de neurónios por camada. Ex: [2, 4, 1] (Entrada 2, Oculta 4, Saída 1)
 */
export function drawNeuralNetwork(canvas, layers) {
    if (!canvas || !layers || layers.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Limpar o canvas
    ctx.clearRect(0, 0, width, height);
    
    const layerSpacing = width / (layers.length + 1);
    const maxNeurons = Math.max(...layers);
    const neuronRadius = Math.min(15, (height / maxNeurons) * 0.4);
    
    // Guardar as coordenadas dos neurónios para desenhar as ligações (pesos)
    const neuronPositions = [];
    
    // 1. Calcular posições e desenhar os nós (neurónios)
    layers.forEach((numNeurons, layerIndex) => {
        const x = layerSpacing * (layerIndex + 1);
        const ySpacing = height / (numNeurons + 1);
        const currentLayerPositions = [];
        
        for (let i = 0; i < numNeurons; i++) {
            const y = ySpacing * (i + 1);
            currentLayerPositions.push({ x, y });
            
            // Desenhar o círculo do neurónio
            ctx.beginPath();
            ctx.arc(x, y, neuronRadius, 0, Math.PI * 2);
            ctx.fillStyle = layerIndex === 0 ? '#3b82f6' : (layerIndex === layers.length - 1 ? '#10b981' : '#f59e0b');
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#1e293b';
            ctx.stroke();
        }
        neuronPositions.push(currentLayerPositions);
    });
    
    // 2. Desenhar as linhas (sinapses/pesos) a ligar as camadas
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)'; // Linha subtil
    
    for (let l = 0; l < neuronPositions.length - 1; l++) {
        const currentLayer = neuronPositions[l];
        const nextLayer = neuronPositions[l + 1];
        
        currentLayer.forEach(neuronA => {
            nextLayer.forEach(neuronB => {
                ctx.beginPath();
                ctx.moveTo(neuronA.x, neuronA.y);
                ctx.lineTo(neuronB.x, neuronB.y);
                ctx.stroke();
            });
        });
    }
}

/**
 * Função para baralhar (Shuffle) os dados. 
 * Muito utilizado antes do treino (Semanas 5 e 6) para evitar que a rede decore a ordem.
 * * @param {Array} array - O array a ser baralhado
 * @returns {Array} Um novo array baralhado
 */
export function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}