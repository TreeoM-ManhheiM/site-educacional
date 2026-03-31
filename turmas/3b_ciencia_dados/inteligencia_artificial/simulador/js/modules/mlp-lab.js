export function initMLP(mountPoint) {
    mountPoint.innerHTML = `
        <div class="card" style="margin-bottom: 20px;">
            <h1>Semanas 1-8: Simulador de Perceptron (Manual)</h1>
            <p>Ajuste as entradas, pesos e bias para ver o neurônio processando a informação em tempo real.</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 20px;">
            <div class="card">
                <h3>⚙️ Ajustes</h3>
                <div class="control-group">
                    <label>Entrada X1: <b id="val-x1">1</b></label>
                    <input type="range" id="mlp-x1" min="0" max="1" step="1" value="1">
                </div>
                <div class="control-group">
                    <label>Entrada X2: <b id="val-x2">0</b></label>
                    <input type="range" id="mlp-x2" min="0" max="1" step="1" value="0">
                </div>
                <hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;">
                <div class="control-group">
                    <label>Peso W1: <b id="val-w1">0.5</b></label>
                    <input type="range" id="mlp-w1" min="-1" max="1" step="0.1" value="0.5">
                </div>
                <div class="control-group">
                    <label>Peso W2: <b id="val-w2">0.5</b></label>
                    <input type="range" id="mlp-w2" min="-1" max="1" step="0.1" value="0.5">
                </div>
                <div class="control-group">
                    <label>Bias (B): <b id="val-bias">-0.7</b></label>
                    <input type="range" id="mlp-bias" min="-1" max="1" step="0.1" value="-0.7">
                </div>
            </div>

            <div class="card" style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; background: var(--bg-input);">
                
                <svg style="position: absolute; width: 100%; height: 100%; pointer-events: none;">
                    <line id="line1" x1="100" y1="120" x2="300" y2="200" stroke="#3b82f6" stroke-width="2" />
                    <line id="line2" x1="100" y1="280" x2="300" y2="200" stroke="#3b82f6" stroke-width="2" />
                    <line id="line-out" x1="400" y1="200" x2="500" y2="200" stroke="#94a3b8" stroke-width="3" />
                </svg>

                <div id="node-x1" style="position: absolute; left: 60px; top: 100px; width: 50px; height: 50px; border-radius: 50%; border: 2px solid var(--accent); display: flex; align-items: center; justify-content: center; background: var(--bg-panel);">X1</div>
                <div id="node-x2" style="position: absolute; left: 60px; top: 260px; width: 50px; height: 50px; border-radius: 50%; border: 2px solid var(--accent); display: flex; align-items: center; justify-content: center; background: var(--bg-panel);">X2</div>

                <div id="main-neuron" style="position: absolute; left: 300px; top: 150px; width: 100px; height: 100px; border-radius: 50%; border: 4px solid var(--accent); display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--bg-panel); z-index: 2; transition: all 0.3s;">
                    <span style="font-size: 1.5rem; font-weight: bold;">Σ</span>
                    <span id="res-sum" style="font-size: 0.8rem;">0.00</span>
                </div>

                <div id="node-out" style="position: absolute; right: 40px; top: 175px; width: 60px; height: 50px; border-radius: 8px; border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: bold; background: var(--bg-panel);">0</div>

                <div style="position: absolute; left: 180px; top: 130px; color: var(--accent); font-size: 0.8rem;">W1: <span id="label-w1">0.5</span></div>
                <div style="position: absolute; left: 180px; top: 250px; color: var(--accent); font-size: 0.8rem;">W2: <span id="label-w2">0.5</span></div>
                <div style="position: absolute; left: 330px; top: 120px; color: #f59e0b; font-size: 0.8rem;">B: <span id="label-bias">-0.7</span></div>
            </div>
        </div>
    `;

    function atualizarSimulacao() {
        // Pega valores dos sliders
        const x1 = parseFloat(document.getElementById('mlp-x1').value);
        const x2 = parseFloat(document.getElementById('mlp-x2').value);
        const w1 = parseFloat(document.getElementById('mlp-w1').value);
        const w2 = parseFloat(document.getElementById('mlp-w2').value);
        const b = parseFloat(document.getElementById('mlp-bias').value);

        // Atualiza os textos/labels
        document.getElementById('val-x1').innerText = x1;
        document.getElementById('val-x2').innerText = x2;
        document.getElementById('val-w1').innerText = w1.toFixed(1);
        document.getElementById('val-w2').innerText = w2.toFixed(1);
        document.getElementById('val-bias').innerText = b.toFixed(1);
        document.getElementById('label-w1').innerText = w1.toFixed(1);
        document.getElementById('label-w2').innerText = w2.toFixed(1);
        document.getElementById('label-bias').innerText = b.toFixed(1);

        // Cálculo Matemático Real: Z = (X1*W1) + (X2*W2) + B
        const soma = (x1 * w1) + (x2 * w2) + b;
        const saida = soma >= 0 ? 1 : 0;

        // Atualiza o círculo e a saída no diagrama
        const sumEl = document.getElementById('res-sum');
        const outEl = document.getElementById('node-out');
        const mainNode = document.getElementById('main-neuron');
        const lineOut = document.getElementById('line-out');

        sumEl.innerText = soma.toFixed(2);
        outEl.innerText = saida;

        if (saida === 1) {
            mainNode.style.borderColor = 'var(--success)';
            mainNode.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.4)';
            outEl.style.borderColor = 'var(--success)';
            outEl.style.color = 'var(--success)';
            lineOut.setAttribute('stroke', '#10b981');
        } else {
            mainNode.style.borderColor = 'var(--accent)';
            mainNode.style.boxShadow = 'none';
            outEl.style.borderColor = 'var(--border)';
            outEl.style.color = 'var(--text-muted)';
            lineOut.setAttribute('stroke', '#334155');
        }
    }

    // Liga os eventos de movimento dos sliders
    const controls = mountPoint.querySelectorAll('input');
    controls.forEach(c => c.addEventListener('input', atualizarSimulacao));

    // Roda uma vez no início
    atualizarSimulacao();
}
