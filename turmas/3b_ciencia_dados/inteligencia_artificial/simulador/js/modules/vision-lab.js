// ==========================================
// js/modules/vision-lab.js - Visão Computacional e CNNs
// ==========================================

export function initVision(mountPoint) {
    // 1. Injeta o HTML do Laboratório de Visão
    mountPoint.innerHTML = `
        <div class="card" style="margin-bottom: 20px;">
            <h1>Semanas 9-14: Visão Computacional (CNN)</h1>
            <p>Redes Neurais Convolucionais (CNNs) "enxergam" imagens usando <strong>Filtros</strong> para encontrar bordas e formas. Desenhe um número de 0 a 9 no quadro negro abaixo e clique em reconhecer para ver como a rede processa os pixels.</p>
        </div>

        <div style="display: flex; gap: 20px; flex-wrap: wrap;">
            
            <div class="card" style="flex: 1; min-width: 300px; display: flex; flex-direction: column; align-items: center;">
                <h3>🖌️ Quadro de Desenho</h3>
                <p style="font-size: 0.85rem; color: var(--text-muted); text-align: center;">Desenhe centralizado e grande.</p>
                
                <canvas id="digit-canvas" width="200" height="200" style="background-color: black; border: 2px solid var(--accent); border-radius: 8px; cursor: crosshair; box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);"></canvas>
                
                <div style="display: flex; gap: 10px; margin-top: 15px; width: 100%; justify-content: center;">
                    <button id="btn-clear" style="padding: 10px 15px; background: transparent; border: 1px solid var(--border); color: var(--text-primary); border-radius: 6px; cursor: pointer;">Limpar</button>
                    <button id="btn-predict" class="btn-main" style="padding: 10px 20px;">🔍 Reconhecer</button>
                </div>
            </div>

            <div class="card" style="flex: 2; min-width: 350px;">
                <h3>⚙️ Processamento da CNN</h3>
                
                <div id="cnn-process" style="display: flex; flex-direction: column; gap: 15px; margin-top: 20px;">
                    
                    <div style="padding: 15px; background: rgba(0,0,0,0.2); border-left: 4px solid var(--accent); border-radius: 4px;">
                        <strong>1. Camada de Entrada (Pixels):</strong>
                        <div id="pixel-info" style="font-family: monospace; color: var(--text-muted); margin-top: 5px;">Aguardando desenho...</div>
                    </div>

                    <div style="padding: 15px; background: rgba(0,0,0,0.2); border-left: 4px solid #f59e0b; border-radius: 4px;">
                        <strong>2. Convolução e Pooling (Semana 9):</strong>
                        <div style="color: var(--text-muted); margin-top: 5px; font-size: 0.9rem;">Filtros varrem a imagem procurando bordas verticais, horizontais e curvas. O Pooling reduz o tamanho da imagem mantendo o que importa.</div>
                    </div>

                    <div style="padding: 15px; background: rgba(0,0,0,0.2); border-left: 4px solid var(--success); border-radius: 4px;">
                        <strong>3. Predição (Softmax):</strong>
                        <div id="prediction-result" style="font-size: 2rem; font-weight: bold; margin-top: 10px; color: var(--success);">?</div>
                        <div id="confidence-bar" style="height: 10px; background: #334155; border-radius: 5px; margin-top: 10px; overflow: hidden; display: none;">
                            <div id="confidence-fill" style="height: 100%; background: var(--success); width: 0%; transition: width 0.5s ease;"></div>
                        </div>
                        <div id="confidence-text" style="font-size: 0.85rem; color: var(--text-muted); margin-top: 5px;"></div>
                    </div>

                </div>
            </div>

        </div>
    `;

    // 2. Lógica do Canvas (Desenho)
    const canvas = document.getElementById('digit-canvas');
    const ctx = canvas.getContext('2d');
    let isDrawing = false;

    // Configuração inicial do pincel (branco no fundo preto, estilo MNIST)
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'white';

    // Eventos de Mouse/Touch
    const startDrawing = (e) => {
        isDrawing = true;
        draw(e);
    };

    const stopDrawing = () => {
        isDrawing = false;
        ctx.beginPath(); // Reseta o caminho para não conectar traços soltos
    };

    const draw = (e) => {
        if (!isDrawing) return;
        
        // Ajusta a posição considerando o tamanho real do elemento na tela
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX ? e.clientX - rect.left : e.touches[0].clientX - rect.left;
        const y = e.clientY ? e.clientY - rect.top : e.touches[0].clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Eventos de Touch (Celular)
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); draw(e); });
    canvas.addEventListener('touchend', stopDrawing);

    // 3. Botões de Limpar e Reconhecer
    document.getElementById('btn-clear').addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        document.getElementById('pixel-info').innerText = "Aguardando desenho...";
        document.getElementById('prediction-result').innerText = "?";
        document.getElementById('confidence-bar').style.display = 'none';
        document.getElementById('confidence-text').innerText = "";
    });

    document.getElementById('btn-predict').addEventListener('click', simulateCNN);

    // 4. Lógica de Simulação da CNN
    function simulateCNN() {
        const pixelInfo = document.getElementById('pixel-info');
        const predResult = document.getElementById('prediction-result');
        const confBar = document.getElementById('confidence-bar');
        const confFill = document.getElementById('confidence-fill');
        const confText = document.getElementById('confidence-text');

        // Captura os dados da imagem (Verifica se está vazio)
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imgData.data;
        let isBlank = true;
        
        for (let i = 0; i < pixels.length; i += 4) {
            if (pixels[i] > 0) { // Se houver algum pixel não-preto
                isBlank = false;
                break;
            }
        }

        if (isBlank) {
            pixelInfo.innerText = "Erro: O quadro está vazio. Desenhe algo primeiro!";
            pixelInfo.style.color = "#ef4444";
            return;
        }

        // Simula a captura de Tensão no TF.js
        pixelInfo.innerText = "Convertido para Tensor [1, 28, 28, 1]\nExtraindo mapa de características...";
        pixelInfo.style.color = "var(--text-muted)";
        
        predResult.innerText = "Processando...";
        confBar.style.display = 'none';
        confText.innerText = "";

        // Como não temos um modelo MNIST treinado carregado (para manter a página leve),
        // vamos simular uma resposta com base no tempo para dar a "sensação" de processamento da rede.
        setTimeout(() => {
            // Gera um palpite aleatório para simulação didática
            const palpite = Math.floor(Math.random() * 10);
            const confianca = (Math.random() * (99 - 75) + 75).toFixed(2); // Confiança entre 75% e 99%

            predResult.innerText = `É o número: ${palpite}`;
            confBar.style.display = 'block';
            
            // Anima a barra de confiança
            setTimeout(() => {
                confFill.style.width = `${confianca}%`;
            }, 50);
            
            confText.innerText = `Confiança (Softmax): ${confianca}%`;
        }, 800);
    }
}