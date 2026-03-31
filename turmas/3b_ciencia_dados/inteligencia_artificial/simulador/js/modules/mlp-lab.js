export function initMLP(mountPoint) {
    mountPoint.innerHTML = `
        <div class="card" style="margin-bottom: 20px;">
            <h1>Semanas 1-8: MLP Pro - Treinamento e Arquitetura</h1>
            <p>Configure a rede, escolha a porta lógica e assista à IA aprendendo ao vivo.</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 20px;">
            <div class="card">
                <h3>⚙️ Configuração da Rede</h3>
                
                <div class="control-group">
                    <label>Porta Lógica (Alvo):</label>
                    <select id="mlp-gate" style="width:100%; padding:10px; background:var(--bg-input); color:white; border-radius:5px;">
                        <option value="and">AND (E)</option>
                        <option value="or">OR (OU)</option>
                        <option value="xor">XOR (OU Exclusivo - Desafio!)</option>
                    </select>
                </div>

                <div class="control-group">
                    <label>Camada Oculta 1 (Neurônios): <b id="val-h1">4</b></label>
                    <input type="range" id="mlp-h1" min="1" max="8" value="4">
                </div>

                <div class="control-group">
                    <label>Camada Oculta 2 (Neurônios): <b id="val-h2">0</b></label>
                    <input type="range" id="mlp-h2" min="0" max="8" value="0">
                </div>

                <div class="control-group">
                    <label>Velocidade (Learning Rate): <b id="val-lr">0.1</b></label>
                    <input type="range" id="mlp-lr" min="0.01" max="0.5" step="0.01" value="0.1">
                </div>

                <button id="btn-train" class="btn-main" style="width:100%; margin-top:15px; background:var(--success);">🚀 Treinar Rede Neural</button>
                
                <div id="train-status" style="margin-top:10px; font-size:0.8rem; color:var(--text-muted); text-align:center;">Status: Aguardando...</div>
            </div>

            <div class="card">
                <h3>📈 Evolução do Aprendizado (Loss)</h3>
                <div id="loss-chart" style="width: 100%; height: 250px; background: rgba(0,0,0,0.2); border-radius: 8px;"></div>
                
                <div style="margin-top: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; text-align: center;">
                    <div class="card" style="background: var(--bg-input);">
                        <small>Erro Final</small>
                        <div id="final-loss" style="font-size: 1.2rem; font-weight: bold;">-</div>
                    </div>
                    <div class="card" style="background: var(--bg-input);">
                        <small>Acurácia</small>
                        <div id="final-acc" style="font-size: 1.2rem; font-weight: bold;">-</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="card" style="margin-top:20px;">
            <h3>🔍 Teste de Predição (Pós-Treino)</h3>
            <div style="display: flex; justify-content: space-around; align-items: center; padding: 20px;">
                <div>X1: <select id="test-x1"><option>0</option><option selected>1</option></select></div>
                <div>X2: <select id="test-x2"><option selected>1</option><option>0</option></select></div>
                <div style="font-size: 1.5rem;">➔</div>
                <div id="test-result" style="font-size: 2rem; font-weight: bold; color: var(--accent);">?</div>
            </div>
        </div>
    `;

    // Sliders dinâmicos
    const inputs = ['h1', 'h2', 'lr'];
    inputs.forEach(id => {
        const el = document.getElementById(`mlp-${id}`);
        el.addEventListener('input', () => {
            document.getElementById(`val-${id}`).innerText = el.value;
        });
    });

    // LÓGICA DE TREINAMENTO COM TENSORFLOW.JS
    document.getElementById('btn-train').addEventListener('click', async () => {
        const gate = document.getElementById('mlp-gate').value;
        const h1Size = parseInt(document.getElementById('mlp-h1').value);
        const h2Size = parseInt(document.getElementById('mlp-h2').value);
        const lr = parseFloat(document.getElementById('mlp-lr').value);
        const status = document.getElementById('train-status');
        const btn = document.getElementById('btn-train');

        btn.disabled = true;
        status.innerText = "Status: Criando modelo...";

        // 1. Dados de Treino baseados na porta escolhida
        const data = {
            and: { x: [[0,0],[0,1],[1,0],[1,1]], y: [[0],[0],[0],[1]] },
            or:  { x: [[0,0],[0,1],[1,0],[1,1]], y: [[0],[1],[1],[1]] },
            xor: { x: [[0,0],[0,1],[1,0],[1,1]], y: [[0],[1],[1],[0]] }
        };

        const xs = tf.tensor2d(data[gate].x);
        const ys = tf.tensor2d(data[gate].y);

        // 2. Construção do Modelo Dinâmico
        const model = tf.sequential();
        model.add(tf.layers.dense({ units: h1Size, activation: 'relu', inputShape: [2] }));
        
        if (h2Size > 0) {
            model.add(tf.layers.dense({ units: h2Size, activation: 'relu' }));
        }
        
        model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

        model.compile({
            optimizer: tf.train.adam(lr),
            loss: 'binaryCrossentropy',
            metrics: ['accuracy']
        });

        // 3. Treinamento com Gráfico ao Vivo
        const surface = { name: 'Perda durante o Treino', tab: 'Treinamento' };
        
        try {
            await model.fit(xs, ys, {
                epochs: 50,
                callbacks: tfvis.show.fitCallbacks(
                    document.getElementById('loss-chart'),
                    ['loss', 'acc'],
                    { height: 250, callbacks: ['onEpochEnd'] }
                )
            });

            status.innerText = "Status: Treinado com Sucesso!";
            status.style.color = "var(--success)";

            // Teste Automático ao mudar selects de teste
            const updateTest = () => {
                const tx1 = parseInt(document.getElementById('test-x1').value);
                const tx2 = parseInt(document.getElementById('test-x2').value);
                const inputTest = tf.tensor2d([[tx1, tx2]]);
                const pred = model.predict(inputTest);
                pred.data().then(d => {
                    const val = d[0];
                    document.getElementById('test-result').innerText = val.toFixed(2);
                    document.getElementById('test-result').style.color = val > 0.5 ? 'var(--success)' : '#ef4444';
                });
            };

            document.getElementById('test-x1').addEventListener('change', updateTest);
            document.getElementById('test-x2').addEventListener('change', updateTest);
            updateTest();

        } catch (e) {
            status.innerText = "Erro no treino. Verifique o console.";
        } finally {
            btn.disabled = false;
        }
    });
}
