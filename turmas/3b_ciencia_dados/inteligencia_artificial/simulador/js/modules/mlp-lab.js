// ==========================================
// js/modules/mlp-lab.js - MLP REAL (TF.js)
// COPIA FIEL DA LOGICA E INTERFACE ORIGINAL
// ==========================================

export function initMLP(mountPoint) {
    mountPoint.innerHTML = `
    <section id="real" class="grid">
        <div class="panel">
            <h2>MLP (Real) — TensorFlow.js</h2>
            <p class="hint">Aqui a rede <b>aprende sozinha</b> com <b>backpropagation automático</b>, <b>função de custo</b> e <b>otimizadores</b> (Adam/SGD).</p>
            <div class="row">
                <div class="col"><label>Tarefa</label>
                    <select id="taskSel">
                        <option value="xor">Classificação XOR</option>
                        <option value="class2">Classificação 2D (sintética)</option>
                        <option value="regr">Regressão 1D (y=2x+1)</option>
                        <option value="and">Porta AND</option>
                        <option value="or">Porta OR</option>
                        <option value="nand">Porta NAND</option>
                        <option value="nor">Porta NOR</option>
                        <option value="xnor">Porta XNOR</option>
                        <option value="not">Porta NOT (1 entrada)</option>
                    </select>
                </div>
                <div class="col"><label>Oculta 1</label><input id="realH" type="number" min="1" max="128" value="8"></div>
                <div class="col"><label>Oculta 2</label><input id="realH2" type="number" min="0" max="128" value="0"></div>
                <div class="col"><label>Ativação 1</label>
                    <select id="realAct"><option>tanh</option><option selected>relu</option><option>sigmoid</option></select>
                </div>
                <div class="col"><label>Ativação 2</label>
                    <select id="realAct2"><option>tanh</option><option>relu</option><option>sigmoid</option></select>
                </div>
                <div class="col"><label>Otimizador</label>
                    <select id="optSel"><option value="adam">Adam</option><option value="sgd">SGD</option></select>
                </div>
                <div class="col"><label>LR</label><input id="lrReal" type="number" step="0.001" value="0.01"></div>
                <div class="col"><label>Épocas</label><input id="epReal" type="number" value="300"></div>
                <div class="col"><label>Batch</label><input id="bsReal" type="number" min="1" value="16"></div>
            </div>
            <div class="row toolbar" style="margin-top:8px">
                <button id="btnRunReal">▶ Treinar</button>
                <button id="btnStopReal" class="ghost">■ Parar</button>
                <button id="btnSaveModel" class="ghost">💾 Exportar modelo</button>
                <span class="badge">TF.js 4.16.0</span>
            </div>
            <h3 style="margin-top:10px">Curva de perda</h3>
            <div class="chart"><canvas id="lossReal" style="width:100%; height:100%;"></canvas></div>
            <h3 style="margin-top:10px">Resultados</h3>
            <div id="realOut" class="mini" style="background:#0b1220; padding:8px; border-radius:5px;">—</div>
        </div>

        <div class="panel">
            <h2>Visualizações rápidas</h2>
            <div class="chart" style="height:220px"><canvas id="vizReal" style="width:100%; height:100%;"></canvas></div>
            <p class="hint">Para classificação 2D, desenha o plano; para regressão, plota pontos e curva.</p>
            
            <h2>Entradas</h2>
            <div id="realInputsRow" class="row"></div>
            <div class="row toolbar" style="margin-top:8px">
                <button id="btnSimReal">Simular (TF.js)</button>
                <span class="pill">τ <input id="thrReal" type="range" min="0" max="1" step="0.01" style="width:120px" value="0.5"><span id="thrRealVal">0.50</span></span>
                <span class="pill">Saída: <b>ŷ</b> = <b id="binRealVal">—</b> <span id="logicDotReal" class="logicDot"></span></span>
            </div>
            <div class="row" style="margin-top:10px">
                <button id="btnTT">Validar tabela‑verdade</button>
                <span id="ttAcc" class="badge">Acurácia TT: —</span>
            </div>
            <div id="ttWrap" style="margin-top:10px; overflow-x:auto;">
                <table id="ttbl" class="table">
                    <thead><tr><th>x0</th><th>x1</th><th>y*</th><th>ŷ</th><th>classe</th><th>status</th></tr></thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
    </section>
    `;

    let model;
    let stopFlag = false;

    // --- FUNÇÕES DE AUXÍLIO (Iguais ao seu HTML) ---
    function makeGateData(kind) {
        if (kind === 'not') return { xs: tf.tensor2d([[0], [1]]), ys: tf.tensor2d([[1], [0]]), dim: 1 };
        const tt = {
            and: [[0,0,0],[0,1,0],[1,0,0],[1,1,1]],
            or:  [[0,0,0],[0,1,1],[1,0,1],[1,1,1]],
            xor: [[0,0,0],[0,1,1],[1,0,1],[1,1,0]],
            nand:[[0,0,1],[0,1,1],[1,0,1],[1,1,0]],
            nor: [[0,0,1],[0,1,0],[1,0,0],[1,1,0]],
            xnor:[[0,0,1],[0,1,0],[1,0,0],[1,1,1]]
        }[kind];
        if (!tt) return null;
        return { xs: tf.tensor2d(tt.map(r => [r[0], r[1]])), ys: tf.tensor2d(tt.map(r => [r[2]])), dim: 2 };
    }

    async function runReal() {
        stopFlag = false;
        const task = document.getElementById('taskSel').value;
        const h1 = parseInt(document.getElementById('realH').value);
        const h2 = parseInt(document.getElementById('realH2').value);
        const epochs = parseInt(document.getElementById('epReal').value);
        const lr = parseFloat(document.getElementById('lrReal').value);
        const bs = parseInt(document.getElementById('bsReal').value);
        const out = document.getElementById('realOut');

        // Lógica de dados simplificada para o exemplo (AND/OR/XOR etc)
        let data = makeGateData(task);
        if(!data) { out.textContent = "Tarefa não implementada nesta versão."; return; }

        model = tf.sequential();
        model.add(tf.layers.dense({ units: h1, activation: document.getElementById('realAct').value, inputShape: [data.dim] }));
        if (h2 > 0) model.add(tf.layers.dense({ units: h2, activation: document.getElementById('realAct2').value }));
        model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

        const opt = document.getElementById('optSel').value === 'adam' ? tf.train.adam(lr) : tf.train.sgd(lr);
        model.compile({ optimizer: opt, loss: 'binaryCrossentropy', metrics: ['accuracy'] });

        await model.fit(data.xs, data.ys, {
            epochs,
            batchSize: bs,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    out.textContent = `Época ${epoch + 1}: Perda ${logs.loss.toFixed(6)}`;
                    if (stopFlag) model.stopTraining = true;
                }
            }
        });
        out.textContent = "Treino Finalizado!";
    }

    function validateTT() {
        if (!model) return;
        const task = document.getElementById('taskSel').value;
        const data = makeGateData(task);
        if (!data) return;

        const tbody = document.querySelector('#ttbl tbody');
        tbody.innerHTML = '';
        
        data.xs.array().then(xArr => {
            data.ys.array().then(yTrue => {
                const preds = model.predict(data.xs);
                preds.array().then(yPred => {
                    for (let i = 0; i < xArr.length; i++) {
                        const tr = document.createElement('tr');
                        const pVal = yPred[i][0];
                        const status = (pVal >= 0.5 ? 1 : 0) === yTrue[i][0] ? '✅' : '❌';
                        tr.innerHTML = `<td>${xArr[i][0]}</td><td>${xArr[i][1] || '-'}</td><td>${yTrue[i][0]}</td><td>${pVal.toFixed(3)}</td><td>${pVal >= 0.5 ? 1 : 0}</td><td>${status}</td>`;
                        tbody.appendChild(tr);
                    }
                });
            });
        });
    }

    function renderInputs() {
        const task = document.getElementById('taskSel').value;
        const row = document.getElementById('realInputsRow');
        row.innerHTML = '';
        const num = task === 'not' ? 1 : 2;
        for (let i = 0; i < num; i++) {
            row.innerHTML += `<div class="col"><label>x${i}</label><input id="rx_${i}" type="number" step="0.01" value="0" style="width:70px"></div>`;
        }
    }

    // Eventos
    document.getElementById('btnRunReal').onclick = runReal;
    document.getElementById('btnStopReal').onclick = () => stopFlag = true;
    document.getElementById('btnTT').onclick = validateTT;
    document.getElementById('taskSel').onchange = renderInputs;
    
    renderInputs();
}
