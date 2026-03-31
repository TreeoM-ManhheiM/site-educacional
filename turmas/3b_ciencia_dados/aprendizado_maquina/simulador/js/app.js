// ==========================================
// js/app.js - Orquestrador Principal
// ==========================================

// Importação dos módulos de cada trilha de semanas
// (Vamos criar o mlp-lab.js no próximo passo)
import { initMLP } from './modules/mlp-lab.js';

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Elementos da Interface
    const container = document.getElementById('app-container');
    const navButtons = document.querySelectorAll('.nav-btn');
    const tfVerSpan = document.getElementById('tf-ver');

    // 2. Verifica e exibe a versão do TensorFlow.js
    if (window.tf) {
        tfVerSpan.innerText = tf.version.tfjs;
        tfVerSpan.style.color = 'var(--success)';
    } else {
        tfVerSpan.innerText = 'Erro de Carregamento';
        tfVerSpan.style.color = '#ef4444'; // Vermelho de erro
        document.querySelector('.status-dot').style.backgroundColor = '#ef4444';
        document.querySelector('.status-dot').style.boxShadow = '0 0 5px #ef4444';
    }

    // 3. Dicionário de Rotas (Mapeia o botão para a função que desenha a tela)
    const routes = {
        'mlp': initMLP,
        
        // Placeholders para os módulos que ainda vamos construir
        'vision': (mountPoint) => {
            mountPoint.innerHTML = `
                <div class="card">
                    <h1>Semanas 9-14: Visão Computacional</h1>
                    <p>Módulo em construção. Aqui teremos um Canvas para desenhar números e uma CNN (Rede Neural Convolucional) para reconhecê-los usando imagens.</p>
                </div>
            `;
        },
        
        'nlp': (mountPoint) => {
            mountPoint.innerHTML = `
                <div class="card">
                    <h1>Semanas 15-17: NLP e Redes Recorrentes</h1>
                    <p>Módulo em construção. Aqui teremos um tokenizador visual de palavras e análise de sentimentos.</p>
                </div>
            `;
        },
        
        'genai': (mountPoint) => {
            mountPoint.innerHTML = `
                <div class="card">
                    <h1>Semanas 18-21 e 23-28: IA Generativa</h1>
                    <p>Módulo em construção. Aqui integraremos testes de Engenharia de Prompt e simulações com Modelos de Linguagem (LLM).</p>
                </div>
            `;
        },

        'rag': (mountPoint) => {
            mountPoint.innerHTML = `
                <div class="card">
                    <h1>Semana 22: RAG (Recuperação de Conhecimento)</h1>
                    <p>Módulo em construção. Aqui simularemos a injeção de documentos externos como contexto para a Inteligência Artificial.</p>
                </div>
            `;
        }
    };

    // 4. Lógica de Navegação
    function loadModule(moduleId) {
        // Atualiza o visual dos botões (remove active de todos, adiciona no clicado)
        navButtons.forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`.nav-btn[data-module="${moduleId}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        // Limpa a tela atual e carrega o novo módulo
        container.innerHTML = '';
        
        if (routes[moduleId]) {
            routes[moduleId](container); // Chama a função correspondente
        } else {
            container.innerHTML = '<div class="card"><h1>Erro 404</h1><p>Módulo não encontrado.</p></div>';
        }
    }

    // 5. Adiciona os eventos de clique nos botões do menu
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const moduleToLoad = btn.getAttribute('data-module');
            loadModule(moduleToLoad);
        });
    });

    // 6. Inicializa o aplicativo na primeira aba (Fundamentos S1-8)
    // Pequeno atraso apenas para a animação visual de carregamento ser suave
    setTimeout(() => {
        loadModule('mlp');
    }, 100);

});