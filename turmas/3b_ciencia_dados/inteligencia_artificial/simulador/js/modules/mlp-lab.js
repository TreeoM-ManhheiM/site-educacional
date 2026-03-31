export function initMLP(mountPoint) {
    mountPoint.innerHTML = `
        <div class="panel">
            <h3>MLP (Real) — TensorFlow.js</h3>
            <p style="font-size:0.9rem; color:var(--muted); margin-bottom:16px;">
                Treine uma rede neural real com todas as portas lógicas.
            </p>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; align-items:start;">
                <div style="display:flex; flex-direction:column; gap:12px;">
                    <div>
                        <label>Porta Lógica / Problema:</label><br/>
                        <select id="realGate" style="width:100%; padding:6px; background:var(--bg); color:var(--fg); border:1px solid var(--node);">
                            <option value="and">Porta AND</option>
                            <option value="or">Porta OR</option>
                            <option value="xor">Porta XOR</option>
                            <option value="nand">Porta NAND</option>
                            <option value="nor">Porta NOR</option>
                            <option value="xnor">Porta XNOR</option>
                        </select>
                    </div>

                    <div style="display:flex; gap:8px;">
                        <div style="flex:1">
                            <label>Camada Oculta 1:</label>
                            <input type="number" id="realHidden" value="4" style="width:100%"/>
                        </div>
                        <div style="flex:1">
                            <label>Camada Oculta 2:</label>
                            <input type="number" id="realHidden2" value="0" style="width:100%"/>
                        </div>
                    </div>

                    <div>
                        <label>Ativação:</label><br/>
                        <select id="realAct" style="width:100%; padding:6px; background:var(--bg); color:var(--fg); border:1px solid var(--node);">
                            <option value="relu">relu</option>
                            <option value="sigmoid">sigmoid</option>
                            <option value="tanh">tanh</option>
                        </select>
                    </div>

                    <div style="display:flex; gap:8px;">
                        <div style="flex:1">
                            <label>Épocas:</label>
                            <input type="number" id="realEpochs" value="50" style="width:100%"/>
                        </div>
                        <div style="flex:1">
                            <label>Learn Rate:</label>
                            <input type="number" id="realLR" value="0.1" step="0.01" style="width:100%"/>
                        </div>
                    </div>

                    <button id="btnTrainReal" class="tab" style="background:var(--primary); width:100%; font-weight:bold; padding:10px;">
                        Treinar Modelo Real
                    </button>
                    
                    <div id="realOut" style="font-size:0.85rem; color:var(--warn); text-align:center;">Aguardando...</div>
                </div>

                <div id="realChart" style="background:rgba(0,0,0,0.2); border:1px solid var(--node); border-radius:8px; height:280px;"></div>
            </div>

            <div style="margin-top:24px; padding:16px; border-top:1px solid var(--node); text-align:center;">
                <h4>Simular Predição</h4>
                <div style="display:flex; gap:10px; justify-content:center; align-items:center;">
                    <input type="number" id="testIn1" value="1" min="0" max="1" style="width:50px; text-align:center;"/>
                    <input type="number" id="testIn2" value="1" min="0" max="1" style="width:50px; text-align:center;"/>
                    <button id="btnPredictReal" class="tab" style="background:var(--ok)">Simular</button>
                    <div style="margin-left:15px; font-size:1.2rem;">
                        Saída: <strong id="valPredictReal" style="color:var(--primary)">-</strong>
                    </div>
                </div>
            </div>
        </div>
    `;

    let model;

    async function trainReal() {
        const gate = document.getElementById('realGate').value;
        const h1 = parseInt(document.getElementById('realHidden').value) || 4;
        const h2 = parseInt(document.getElementById('realHidden2').value) || 0;
        const act = document.getElementById('realAct').value;
        const epochs = parseInt(document.getElementById('realEpochs').value) || 50;
        const lr = parseFloat(document.getElementById('realLR').value) || 0.1;
        const out = document.getElementById('realOut');

        out.textContent = 'Treinando...';

        // TABELA COMPLETA DE TODAS AS PORTAS
        const data = {
            and:  { x: [[0,0],[0,1],[1,0],[1,1]], y: [[0],[0],[0],[1]] },
            or:   { x: [[0,0],[0,1],[1,0],[1,1]], y: [[0],[1],[1],[1]] },
            xor:  { x: [[0,0],[0,1],[1,0],[1,1]], y: [[0],[1],[1],[0]] },
            nand: { x: [[0,0],[0,1],[1,0],[1,1]], y: [[1],[1],[1],[0]] },
            nor:  { x: [[0,0],[0,1],[1,0],[1,1]], y: [[1],[0],[0],[0]] },
            xnor: { x: [[0,0],[0,1],[1,0],[1,1]], y: [[1],[0],[0],[1]] }
        };

        const xs = tf.tensor2d(data[gate].x);
        const ys = tf.tensor2d(data[gate].y);

        model = tf.sequential();
        model.add(tf.layers.dense({ units: h1, activation: act, inputShape: [2] }));
        if(h2 > 0) model.add(tf.layers.dense({ units: h2, activation: act }));
        model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

        model.compile({
            optimizer: tf.train.adam(lr),
            loss: 'binaryCrossentropy',
            metrics: ['accuracy']
        });

        const container = document.getElementById('realChart');
        
        await model.fit(xs, ys, {
            epochs: epochs,
            callbacks: tfvis.show.fitCallbacks(container, ['loss', 'acc'], { 
                height: 280, 
                callbacks: ['onEpochEnd'] 
            })
        });

        out.textContent = 'Modelo treinado com sucesso!';
        out.style.color = 'var(--ok)';
    }

    function predictReal() {
        if(!model) { alert('Treine primeiro!'); return; }
        const v1 = parseFloat(document.getElementById('testIn1').value);
        const v2 = parseFloat(document.getElementById('testIn2').value);
        
        const input = tf.tensor2d([[v1, v2]]);
        const res = model.predict(input);
        res.data().then(d => {
            document.getElementById('valPredictReal').textContent = d[0].toFixed(4);
        });
    }

    document.getElementById('btnTrainReal').onclick = trainReal;
    document.getElementById('btnPredictReal').onclick = predictReal;
}
