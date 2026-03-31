// ==========================================
// js/modules/mlp-lab.js - MLP REAL (TF.js)
// Fiel ao simulador original do usuário
// ==========================================

export function initMLP(mountPoint) {
    mountPoint.innerHTML = `
        <div class="card" style="margin-bottom: 20px;">
            <h1>📊 MLP (Real) — TensorFlow.js</h1>
            <p>Treine uma rede neural real no seu navegador. Configure a arquitetura e os hiperparâmetros abaixo.</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; flex-wrap: wrap;">
            
            <div class="card">
                <h3>⚙️ Configurações do Modelo</h3>
                
                <div class="control-group">
                    <label>Porta Lógica / Problema:</label>
                    <select id="realGate" class="select-dark" style="width:100%; padding:8px; background:var(--bg-input); color:white; border:1px solid var(--border);">
                        <option value="and">Porta AND</option>
                        <option value="or">Porta OR</option>
                        <option value="xor">Porta XOR (Não-Linear)</option>
                    </select>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div class="control-group">
                        <label>Camada Oculta 1:</label>
                        <input type="number" id="realHidden" value="4" min="1" max="64" style="width:100%;">
                    </div>
                    <div class="control-group">
                        <label>Camada Oculta 2:</label>
                        <input type="number" id="realHidden2" value="0" min="0" max="64" style="width:100%;">
                    </div>
                </div>

                <div class="control-group">
                    <label>Ativação:</label>
                    <select id="realAct" style="width:100%;">
                        <option value="relu">ReLU</option>
                        <option value="sigmoid">Sigmoid</option>
                        <option value="tanh">Tanh</option>
                    </select>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div class="control-group">
                        <label>Épocas:</label>
                        <input type="number" id="realEpochs" value="50" min="1" style="width:100%;">
                    </div>
                    <div class="control-group">
                        <label>Learn Rate:</label>
                        <input type="number" id="realLR" value="0.1" step="0.01" style="width:100%;">
                    </div>
                </div>

                <button id="btnTrainReal" class="btn-main" style="width:100%; background:var(--accent); margin-top:10px;">🚀 Treinar Modelo Real</button>
                <div id="realOut" style="margin-top:10px; font-size:0.85rem; color:var(--text-muted); text-align:center;">Aguardando comando...</div>
            </div>

            <div class="card">
                <h3>📈 Gráfico de Treinamento</h3>
                <div id="realChart" style="height: 300px; background: rgba(0,0,0,0.2); border-radius: 8px; padding: 10px;"></div>
            </div>
        </div>

        <div class="card" style="margin-top:20px;">
            <h3>🔍 Testar Predição</h3>
            <div style="display: flex; gap: 20px; align-items: center; justify-content: center;">
                <div>Entrada 1: <input type="number" id="testIn1" value="1" min="0" max="1" style="width:60px;"></div>
                <div>Entrada 2: <input type="number" id="testIn2" value="1" min="0" max="1" style="width:60px;"></div>
                <button id="btnPredictReal" class="btn-main" style="background:var(--success);">Calcular</button>
                <div style="font-size: 1.5rem; font-weight: bold;">Saída: <span id="valPredictReal" style="color:var(--accent);">?</span></div>
            </div>
        </div>
    `;

    let model;

    // Função de Treino Principal
    async function trainReal() {
        const gateType = document.getElementById('realGate').value;
        const h1 = parseInt(document.getElementById('realHidden').value);
        const h2 = parseInt(document.getElementById('realHidden2').value);
        const act = document.getElementById('realAct').value;
        const epochs = parseInt(document.getElementById('realEpochs').value);
        const lr = parseFloat(document.getElementById('realLR').value);
        const outMsg = document.getElementById('realOut');

        outMsg.textContent = "Iniciando TF.js...";
        
        // Dados de Treino
        const data = {
            and: { x: [[0,0],[0,1],[1,0],[1,1]], y: [[0],[0],[0],[1]] },
            or:  { x: [[0,0],[0,1],[1,0],[1,1]], y: [[0],[1],[1],[1]] },
            xor: { x: [[0,0],[0,1],[1,0],[1,1]], y: [[0],[1],[1],[0]] }
        };

        const xs = tf.tensor2d(data[gateType].x);
        const ys = tf.tensor2d(data[gateType].y);

        // Construção do Modelo
        model = tf.sequential();
        model.add(tf.layers.dense({ units: h1, activation: act, inputShape: [2] }));
        if (h2 > 0) {
            model.add(tf.layers.dense({ units: h2, activation: act }));
        }
        model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

        model.compile({
            optimizer: tf.train.adam(lr),
            loss: 'binaryCrossentropy',
            metrics: ['accuracy']
        });

        // Treino com Visualização no div "realChart"
        const container = document.getElementById('realChart');
        
        try {
            await model.fit(xs, ys, {
                epochs: epochs,
                shuffle: true,
                callbacks: tfvis.show.fitCallbacks(container, ['loss', 'acc'], { 
                    height: 300, 
                    callbacks: ['onEpochEnd'] 
                })
            });
            outMsg.textContent = "Treino finalizado com sucesso!";
            outMsg.style.color = "var(--success)";
        } catch (err) {
            outMsg.textContent = "Erro: " + err.message;
            outMsg.style.color = "#ef4444";
        }
    }

    // Função de Predição
    function predictReal() {
        if (!model) {
            alert("Treine o modelo primeiro!");
            return;
        }
        const in1 = parseFloat(document.getElementById('testIn1').value);
        const in2 = parseFloat(document.getElementById('testIn2').value);
        
        const input = tf.tensor2d([[in1, in2]]);
        const output = model.predict(input);
        
        output.data().then(d => {
            document.getElementById('valPredictReal').textContent = d[0].toFixed(4);
        });
    }

    // Eventos
    document.getElementById('btnTrainReal').addEventListener('click', trainReal);
    document.getElementById('btnPredictReal').addEventListener('click', predictReal);
}
