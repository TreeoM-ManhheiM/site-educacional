// ==========================================
// js/modules/mlp-lab.js - Simulador Full Neural (Igual ao Original)
// ==========================================

export function initMLP(mountPoint) {
    mountPoint.innerHTML = `
        <div class="card" style="margin-bottom: 20px;">
            <h1>📊 Simulador Neural Avançado (S1-8)</h1>
            <p>Treine a rede para aprender portas lógicas e observe o gráfico de erro (Loss) em tempo real.</p>
        </div>

        <div style="display: grid; grid-template-columns: 350px 1fr; gap: 20px;">
            
            <div class="card" style="display: flex; flex-direction: column; gap: 15px;">
                <h3>⚙️ Configuração e Treino</h3>
                
                <div class="control-group">
                    <label>Objetivo (Porta Lógica):</label>
                    <select id="mlp-gate" class="select-dark">
                        <option value="and">Porta AND</option>
                        <option value="or">Porta OR</option>
                        <option value="xor">Porta XOR (Requer Camadas)</option>
                    </select>
                </div>

                <div class="control-group">
                    <label>Neurônios Camada 1: <strong id="v-h1">4</strong></label>
                    <input type="range" id="mlp-h1" min="1" max="10" value="4">
                </div>

                <div class="control-group">
                    <label>Neurônios Camada 2: <strong id="v-h2">0</strong></label>
                    <input type="range" id="mlp-h2" min="0" max="10" value="0">
                </div>

                <div class="control-group">
                    <label>Taxa de Aprendizagem: <strong id="v-lr">0.1</strong></label>
                    <input type="range" id="mlp-lr" min="0.01" max="0.5" step="0.01" value="0.1">
                </div>

                <button id="btn-train" class="btn-main" style="background: var(--success); font-weight: bold;">⚡ INICIAR TREINAMENTO</button>
                
                <hr style="border-color: var(--border);">
                
                <div id="status-box" style="text-align: center; padding: 10px; border-radius: 5px; background: var(--bg-input);">
                    <small style="color: var(--text-muted);">Status:</small>
                    <div id="train-status">Pronto para treinar</div>
                </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 20px;">
                <div class="card">
                    <h3>📈 Gráfico de Perda (Loss)</h3>
                    <div id="loss-chart" style="height: 250px; background: rgba(0,0,0,0.2); border-radius: 8px;"></div>
                </div>

                <div class="card">
                    <h3>🔍 Teste a Rede Treinada</h3>
                    <div style="display: flex; align-items: center; justify-content: space-around; padding: 10px;">
                        <div>X1: <select id="t-x1" class="select-dark"><option>0</option><option selected>1</option></select></div>
                        <div>X2: <select id="t-x2" class="select-dark"><option selected>1</option><option>0</option></select></div>
                        <div style="font-size: 2rem;">➜</div>
                        <div style="text-align: center;">
                            <small style="display:block;">Saída da IA</small>
                            <div id="t-out" style="font-size: 2.5rem; font-weight: bold; color: var(--accent);">0.00</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // --- Lógica de Sincronização dos Sliders ---
    const updateLabel = (id) => {
        const el = document.getElementById(`mlp-${id}`);
        const label = document.getElementById(`v-${id}`);
        el.addEventListener('input', () => label.innerText = el.value);
    };
    ['h1', 'h2', 'lr'].forEach(updateLabel);

    let model; // Variável global do modelo dentro do módulo

    // --- Lógica de Treinamento TF.js ---
    document.getElementById('btn-train').addEventListener('click', async () => {
        const gate = document.getElementById('mlp-gate').value;
        const h1 = parseInt(document.getElementById('mlp-h1').value);
        const h2 = parseInt(document.getElementById('mlp-h2').value);
        const lr = parseFloat(document.getElementById('mlp-lr').value);
        const btn = document.getElementById('btn-train');
        const status = document.getElementById('train-status');

        btn.disabled = true;
        status.innerText = "Treinando...";
        status.style.color = "var(--warn)";

        // 1. Dados
        const dataMap = {
            and: { x: [[0,0],[0,1],[1,0],[1,1]], y: [[0],[0],[0],[1]] },
            or:  { x: [[0,0],[0,1],[1,0],[1,1]], y: [[0],[1],[1],[1]] },
            xor: { x: [[0,0],[0,1],[1,0],[1,1]], y: [[0],[1],[1],[0]] }
        };
        const xs = tf.tensor2d(dataMap[gate].x);
        const ys = tf.tensor2d(dataMap[gate].y);

        // 2. Criar Modelo
        model = tf.sequential();
        model.add(tf.layers.dense({ units: h1, activation: 'relu', inputShape: [2] }));
        if (h2 > 0) model.add(tf.layers.dense({ units: h2, activation: 'relu' }));
        model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

        model.compile({
            optimizer: tf.train.adam(lr),
            loss: 'binaryCrossentropy',
            metrics: ['accuracy']
        });

        // 3. Treinar com Gráfico
        const container = document.getElementById('loss-chart');
        
        await model.fit(xs, ys, {
            epochs: 50,
            shuffle: true,
            callbacks: tfvis.show.fitCallbacks(container, ['loss'], { 
                height: 250, 
                callbacks: ['onEpochEnd'] 
            })
        });

        status.innerText = "Treino Concluído!";
        status.style.color = "var(--success)";
        btn.disabled = false;

        // --- Lógica de Predição Instantânea ---
        const runPred = () => {
            const x1 = parseInt(document.getElementById('t-x1').value);
            const x2 = parseInt(document.getElementById('t-x2').value);
            const pred = model.predict(tf.tensor2d([[x1, x2]]));
            pred.data().then(d => {
                const val = d[0];
                const outEl = document.getElementById('t-out');
                outEl.innerText = val.toFixed(2);
                outEl.style.color = val > 0.5 ? 'var(--success)' : '#ef4444';
            });
        };

        document.getElementById('t-x1').onchange = runPred;
        document.getElementById('t-x2').onchange = runPred;
        runPred(); // Roda a primeira vez
    });
}
