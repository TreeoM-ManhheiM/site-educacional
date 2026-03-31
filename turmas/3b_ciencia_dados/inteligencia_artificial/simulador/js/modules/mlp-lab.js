// ==========================================
// js/modules/mlp-lab.js - Recuperação do Simulador Neural Manual (S1-8)
// Adaptação para recriar as funcionalidades de simulador.html
// ==========================================

export function initMLP(mountPoint) {
    // 1. Injeta o HTML unificando o design novo com os controlos antigos
    mountPoint.innerHTML = `
        <div class="card" style="margin-bottom: 20px;">
            <h1>Semanas 1-8: Simulador Neural Manual</h1>
            <p>Aprenda como um único neurónio funciona. Escolha uma porta lógica, ajuste os Pesos (W1, W2) e o Bias manualmente usando os sliders e veja a saída gerada.</p>
        </div>

        <div style="display: flex; gap: 20px; flex-wrap: wrap;">
            
            <div class="card" style="flex: 1; min-width: 350px;">
                <h3>⚙️ Configuração do Neurónio</h3>
                
                <div class="control-group">
                    <label>Selecione a Porta Lógica:</label>
                    <select id="mlp-logic-gate">
                        <option value="and">Porta AND</option>
                        <option value="or">Porta OR</option>
                        <option value="xor">Porta XOR (Desafio!)</option>
                    </select>
                </div>

                <div class="control-group">
                    <label>Entrada X1: <strong id="val-x1">1</strong></label>
                    <select id="mlp-x1">
                        <option value="1">1 (Verdadeiro)</option>
                        <option value="0">0 (Falso)</option>
                    </select>
                </div>

                <div class="control-group">
                    <label>Entrada X2: <strong id="val-x2">0</strong></label>
                    <select id="mlp-x2">
                        <option value="1">1 (Verdadeiro)</option>
                        <option value="0">0 (Falso)</option>
                    </select>
                </div>

                <hr style="border-color: var(--border); margin: 20px 0;">

                <div class="control-group">
                    <label>Peso W1: <strong id="val-w1" style="color: var(--accent);">0.5</strong></label>
                    <input type="range" id="mlp-w1" min="-2" max="2" step="0.1" value="0.5">
                </div>

                <div class="control-group">
                    <label>Peso W2: <strong id="val-w2" style="color: var(--accent);">0.5</strong></label>
                    <input type="range" id="mlp-w2" min="-2" max="2" step="0.1" value="0.5">
                </div>

                <div class="control-group">
                    <label>Bias (Tendência): <strong id="val-bias" style="color: #f59e0b;">-0.7</strong></label>
                    <input type="range" id="mlp-bias" min="-2" max="2" step="0.1" value="-0.7">
                </div>
            </div>

            <div class="card" style="flex: 2; min-width: 350px; display: flex; flex-direction: column; align-items: center;">
                <h3>📊 Visualização e Resultado</h3>
                
                <div id="neuron-diagram" style="position: relative; width: 100%; height: 250px; background: var(--bg-input); border-radius: 8px; margin: 20px 0; overflow: hidden; border: 1px solid var(--border);">
                    <div style="position: absolute; top: 60px; left: 60px; width: 150px; height: 2px; background: var(--accent); transform: rotate(20deg); transform-origin: top left; opacity: 0.5;"></div>
                    <div style="position: absolute; top: 190px; left: 60px; width: 150px; height: 2px; background: var(--accent); transform: rotate(-20deg); transform-origin: top left; opacity: 0.5;"></div>
                    <div style="position: absolute; top: 125px; left: 210px; width: 100px; height: 2px; background: var(--success); opacity: 0.5;"></div>

                    <div style="position: absolute; top: 40px; left: 20px; width: 40px; height: 40px; border-radius: 50%; background: #0b1120; border: 2px solid var(--accent); display:flex; align-items:center; justify-content:center; color: var(--text-primary); font-weight: bold;">X1</div>
                    <div style="position: absolute; top: 170px; left: 20px; width: 40px; height: 40px; border-radius: 50%; background: #0b1120; border: 2px solid var(--accent); display:flex; align-items:center; justify-content:center; color: var(--text-primary); font-weight: bold;">X2</div>
                    <div style="position: absolute; top: 100px; left: 190px; width: 50px; height: 50px; border-radius: 50%; background: var(--accent); display:flex; align-items:center; justify-content:center; color: white; font-weight: bold; font-size: 1.5rem; box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);">Σ</div>
                    <div style="position: absolute; top: 100px; left: 300px; width: 50px; height: 50px; border-radius: 50%; background: var(--success); display:flex; align-items:center; justify-content:center; color: white; font-weight: bold; font-size: 1.5rem; box-shadow: 0 0 15px rgba(16, 185, 129, 0.5);">Y</div>
                    
                    <div style="position: absolute; top: 65px; left: 110px; color: var(--accent); font-family: monospace;" id="diag-w1">W1: 0.5</div>
                    <div style="position: absolute; top: 150px; left: 110px; color: var(--accent); font-family: monospace;" id="diag-w2">W2: 0.5</div>
                    <div style="position: absolute; top: 80px; left: 195px; color: #f59e0b; font-family: monospace;" id="diag-bias">Bias: -0.7</div>
                </div>

                <div style="display: flex; gap: 20px; width: 100%;">
                    <div style="flex: 1; text-align: center; padding: 15px; background: rgba(0,0,0,0.2); border-radius: 8px;">
                        <div>Soma Linear (Z)</div>
                        <div id="result-sum" style="font-size: 2rem; font-weight: bold; color: var(--text-primary);">-0.2</div>
                    </div>
                    <div style="flex: 1; text-align: center; padding: 15px; background: rgba(16, 185, 129, 0.1); border-radius: 8px; border: 1px solid var(--success);">
                        <div>Saída Gerada (Y)</div>
                        <div id="result-output" style="font-size: 3rem; font-weight: bold; color: var(--success);">0</div>
                    </div>
                    <div style="flex: 1; text-align: center; padding: 15px; background: rgba(148, 163, 184, 0.1); border-radius: 8px;">
                        <div>Esperado (Porta)</div>
                        <div id="result-expected" style="font-size: 3rem; font-weight: bold; color: var(--text-muted);">1</div>
                    </div>
                </div>

                <button id="btn-calc-mlp" class="btn-main" style="margin-top: 20px; background: var(--accent);">🔄 Calcular Saída manualmente</button>
            </div>

        </div>
    `;

    // 2. Mapeamento de Eventos (Igual ao seu simulador antigo, mas com IDs novos)
    const els = {
        gate: document.getElementById('mlp-logic-gate'),
        x1: document.getElementById('mlp-x1'),
        x2: document.getElementById('mlp-x2'),
        w1: document.getElementById('mlp-w1'),
        w2: document.getElementById('mlp-w2'),
        bias: document.getElementById('mlp-bias'),
        btn: document.getElementById('btn-calc-mlp')
    };

    const vals = {
        x1: document.getElementById('val-x1'),
        x2: document.getElementById('val-x2'),
        w1: document.getElementById('val-w1'),
        w2: document.getElementById('val-w2'),
        bias: document.getElementById('val-bias')
    };

    const diag = {
        w1: document.getElementById('diag-w1'),
        w2: document.getElementById('diag-w2'),
        bias: document.getElementById('diag-bias')
    };

    const res = {
        sum: document.getElementById('result-sum'),
        out: document.getElementById('result-output'),
        exp: document.getElementById('result-expected')
    };

    // Função para atualizar os números na tela enquanto o usuário mexe nos sliders
    function updateSliders() {
        vals.x1.innerText = els.x1.value;
        vals.x2.innerText = els.x2.value;
        vals.w1.innerText = Number(els.w1.value).toFixed(1);
        vals.w2.innerText = Number(els.w2.value).toFixed(1);
        vals.bias.innerText = Number(els.bias.value).toFixed(1);

        // Atualiza o diagrama
        diag.w1.innerText = `W1: ${Number(els.w1.value).toFixed(1)}`;
        diag.w2.innerText = `W2: ${Number(els.w2.value).toFixed(1)}`;
        diag.bias.innerText = `Bias: ${Number(els.bias.value).toFixed(1)}`;
        
        // Atualiza o valor esperado da porta
        const x1 = parseInt(els.x1.value);
        const x2 = parseInt(els.x2.value);
        const gate = els.gate.value;
        let expected = 0;

        if (gate === 'and') expected = (x1 && x2) ? 1 : 0;
        if (gate === 'or') expected = (x1 || x2) ? 1 : 0;
        if (gate === 'xor') expected = (x1 ^ x2) ? 1 : 0;

        res.exp.innerText = expected;
        calculateNeuron(false); // Calcula automaticamente em modo silencioso
    }

    // A Lógica Matemática Fundamental do seu neurónio original!
    function calculateNeuron(showAnimation = true) {
        const x1 = parseInt(els.x1.value);
        const x2 = parseInt(els.x2.value);
        const w1 = parseFloat(els.w1.value);
        const w2 = parseFloat(els.w2.value);
        const bias = parseFloat(els.bias.value);

        // 1. Soma Linear (Σ): Z = x1*w1 + x2*w2 + b
        const sumZ = (x1 * w1) + (x2 * w2) + bias;
        res.sum.innerText = sumZ.toFixed(2);

        // 2. Função de Ativação (Step/Degrau): Y = 1 se Z >= 0, senão 0
        const outputY = sumZ >= 0 ? 1 : 0;
        res.out.innerText = outputY;

        // Visual feedback (cor de sucesso se acertou a porta)
        const expected = parseInt(res.exp.innerText);
        if (outputY === expected) {
            res.out.style.color = 'var(--success)';
        } else {
            res.out.style.color = '#ef4444'; // Vermelho (Erro)
        }
    }

    // Adiciona os ouvintes de evento
    [els.gate, els.x1, els.x2, els.w1, els.w2, els.bias].forEach(el => {
        el.addEventListener('input', updateSliders);
    });

    els.btn.addEventListener('click', () => calculateNeuron(true));

    // Inicialização
    updateSliders();
}
