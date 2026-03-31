// ==========================================
// js/modules/mlp-lab.js - Redes Neurais e Fundamentos
// ==========================================

export function initMLP(mountPoint) {
    // 1. Injeta o HTML do Laboratório MLP
    mountPoint.innerHTML = `
        <div class="card" style="margin-bottom: 20px;">
            <h1>Semanas 1-8: Fundamentos e MLP</h1>
            <p>Aprenda como uma Rede Neural Artificial (MLP) aprende a partir de dados. Observe o gráfico de treinamento para entender o conceito de <strong>Overfitting</strong> (quando a rede "decora" os dados) e use o <strong>Dropout (Semana 8)</strong> para tentar corrigi-lo.</p>
        </div>

        <div style="display: flex; gap: 20px; flex-wrap: wrap;">
            
            <div class="card" style="flex: 1; min-width: 300px; display: flex; flex-direction: column; gap: 15px;">
                <h3>⚙️ Hiperparâmetros</h3>
                
                <div class="control-group">
                    <label><strong>Épocas de Treinamento (Epochs):</strong></label>
                    <p style="font-size: 0.8rem; color: var(--text-muted); margin: 5px 0;">Quantas vezes a rede verá os dados.</p>
                    <input type="number" id="mlp-epochs" value="100" min="10" max="500" step="10" style="width: 100%; padding: 10px; border-radius: 8px;">
                </div>

                <div class="control-group">
                    <label><strong>Taxa de Aprendizado (Learning Rate):</strong></label>
                    <p style="font-size: 0.8rem; color: var(--text-muted); margin: 5px 0;">O tamanho do "passo" que a rede dá para aprender.</p>
                    <select id="mlp-lr" style="width: 100%; padding: 10px; border-radius: 8px;">
                        <option value="0.1">0.1 (Rápido / Instável)</option>
                        <option value="0.01" selected>0.01 (Equilibrado)</option>
                        <option value="0.001">0.001 (Lento / Preciso)</option>
                    </select>
                </div>

                <div class="control-group">
                    <label><strong>Dropout (Regularização - Semana 8):</strong></label>
                    <p style="font-size: 0.8rem; color: var(--text-muted); margin: 5px 0;">Desliga neurônios aleatoriamente para evitar Overfitting.</p>
                    <select id="mlp-dropout" style="width: 100%; padding: 10px; border-radius: 8px;">
                        <option value="0">0% (Sem Dropout - Probabilidade de Overfitting)</option>
                        <option value="0.2">20% (Dropout Leve)</option>
                        <option value="0.5">50% (Dropout Forte)</option>
                    </select>
                </div>

                <button id="btn-train-mlp" class="btn-main" style="margin-top: 10px; padding: 15px; font-size: 1.1rem;">
                    🚀 Iniciar Treinamento
                </button>
            </div>

            <div class="card" style="flex: 2; min-width: 400px; display: flex; flex-direction: column;">
                <h3>📊 Gráfico de Perda (Loss)</h3>
                <p style="font-size: 0.85rem; color: var(--text-muted);">
                    <strong>Linha Azul (loss):</strong> Erro nos dados de treino.<br>
                    <strong>Linha Laranja (val_loss):</strong> Erro nos dados de validação. Se a laranja subir enquanto a azul cai, é <strong>Overfitting</strong>!
                </p>
                <div id="tfjs-vis-container" style="flex: 1; min-height: 350px; background: rgba(0,0,0,0.2); border-radius: 8px; border: 1px dashed var(--border); display: flex; justify-content: center; align-items: center;">
                    <span style="color: var(--text-muted);">Aguardando início do treinamento...</span>
                </div>
            </div>

        </div>
    `;

    // 2. Eventos da Interface
    const btnTrain = document.getElementById('btn-train-mlp');
    btnTrain.addEventListener('click', runMLPTraining);
}

// 3. Lógica de Treinamento com TensorFlow.js
async function runMLPTraining() {
    const btnTrain = document.getElementById('btn-train-mlp');
    const visContainer = document.getElementById('tfjs-vis-container');
    
    // Trava o botão durante o treino
    btnTrain.disabled = true;
    btnTrain.innerText = "⏳ Treinando (Aguarde)...";
    visContainer.innerHTML = ""; // Limpa o gráfico anterior

    // Coleta hiperparâmetros da tela
    const epochs = parseInt(document.getElementById('mlp-epochs').value);
    const lr = parseFloat(document.getElementById('mlp-lr').value);
    const dropoutRate = parseFloat(document.getElementById('mlp-dropout').value);

    // ====================================================
    // A. GERAR DADOS SINTÉTICOS COMPLEXOS
    // Vamos gerar dados que "forçam" o overfitting
    // ====================================================
    const numSamples = 300;
    // Entradas: tensores com 2 dimensões (ex: X, Y)
    const xs = tf.randomUniform([numSamples, 2], -1, 1);
    
    // Saídas: Uma função não-linear com ruído (difícil de aprender perfeitamente)
    // y = x1^2 + x2^2 + ruido
    const ys = tf.tidy(() => {
        const xSquared = xs.square().sum(1, true); // (x1^2 + x2^2)
        const noise = tf.randomNormal([numSamples, 1], 0, 0.2); // Ruído aleatório
        return xSquared.add(noise);
    });

    // ====================================================
    // B. CRIAR A ARQUITETURA DA REDE NEURAL (MLP)
    // ====================================================
    const model = tf.sequential();
    
    // Camada Oculta 1 (Muito grande, para forçar memorização/overfitting)
    model.add(tf.layers.dense({ 
        units: 64, 
        activation: 'relu', 
        inputShape: [2] 
    }));

    // Camada de Regularização (Semana 8)
    if (dropoutRate > 0) {
        model.add(tf.layers.dropout({ rate: dropoutRate }));
    }

    // Camada Oculta 2
    model.add(tf.layers.dense({ units: 64, activation: 'relu' }));

    // Camada de Saída (1 neurônio contínuo para regressão)
    model.add(tf.layers.dense({ units: 1, activation: 'linear' }));

    // ====================================================
    // C. COMPILAR O MODELO (Semana 5 e 6 - Backpropagation / SGD)
    // ====================================================
    model.compile({
        optimizer: tf.train.adam(lr),
        loss: 'meanSquaredError' // Função de Custo
    });

    // ====================================================
    // D. TREINAMENTO COM VISUALIZAÇÃO (TFJS-VIS)
    // ====================================================
    await model.fit(xs, ys, {
        epochs: epochs,
        validationSplit: 0.2, // Separa 20% dos dados como "prova final" (Validação)
        callbacks: tfvis.show.fitCallbacks(
            visContainer, 
            ['loss', 'val_loss'], // Queremos plotar o Erro de Treino e de Validação
            { 
                height: 350, 
                callbacks: ['onEpochEnd'] // Atualiza a cada época
            }
        )
    });

    // Destrói os tensores para liberar memória RAM da placa de vídeo / navegador
    xs.dispose();
    ys.dispose();
    model.dispose();

    // Restaura o botão
    btnTrain.disabled = false;
    btnTrain.innerText = "🚀 Iniciar Treinamento";
}