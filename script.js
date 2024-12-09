// cada neuronio possui uma funcao de ativacao que eh definida pelo usuario
class FuncoesDeAtivacao {
    constructor(tipo = 'linear') {
        if(tipo.toLowerCase() === 'linear') {
            this.funcao = (net) => {
                return (net * 1.0) / 10;
            }
            this.derivada = (net) => {
                return 1.0 / 10;
            }
        }
        else if(tipo.toLowerCase() === 'logistica') {
            this.funcao = (net) => {
                return 1.0 / (1 + Math.exp(-net));
            }
            this.derivada = (net) => {
                return this.funcao(net) * (1 - this.funcao(net));
            }
        }
        else if(tipo.toLowerCase() === 'tangentehiperbolica') {
            this.funcao = (net) => {
                return Math.tanh(net);
            }
            this.derivada = (net) => {
                return 1 - Math.pow(this.funcao(net), 2);
            }
        }
    }

    update(tipo = 'linear') {
        if(tipo.toLowerCase() === 'linear') {
            this.funcao = (net) => {
                return (net * 1.0) / 10;
            }
            this.derivada = (net) => {
                return 1.0 / 10;
            }
        }
        else if(tipo.toLowerCase() === 'logistica') {
            this.funcao = (net) => {
                return 1.0 / (1 + Math.exp(-net));
            }
            this.derivada = (net) => {
                return this.funcao(net) * (1 - this.funcao(net));
            }
        }
        else if(tipo.toLowerCase() === 'tangentehiperbolica') {
            this.funcao = (net) => {
                return Math.tanh(net);
            }
            this.derivada = (net) => {
                return 1 - Math.pow(this.funcao(net), 2);
            }
        }
    }
}

class Ligacao {
    constructor(neuronioOrigem, neuronioDestino) {
        this.neuronioOrigem = neuronioOrigem; // Referência ao neurônio de origem
        this.neuronioDestino = neuronioDestino; // Referência ao neurônio de destino
        this.peso = Math.random(); // Inicializa o peso da ligação com um valor aleatório entre 0 e 1
    }

    // Método para ajustar o peso com base em uma taxa de aprendizado e gradiente
    ajustarPeso(taxaDeAprendizado, gradiente) {
        this.peso += taxaDeAprendizado * gradiente;
    }
}

class Neuronio {
    constructor(funcaoDeAtivacao = 'linear') {
        this.entradas = []; // Conexões de entrada
        this.saidas = []; // Conexões de saída
        this.erro = 0; // Erro inicial do neurônio
        this.funcaoAtivacao = new FuncoesDeAtivacao(funcaoDeAtivacao); // Define a função de ativação
    }

    // Método para calcular a saída do neurônio
    calcularSaida() {
        const net = this.entradas.reduce((soma, ligacao) => soma + ligacao.neuronioOrigem.saida * ligacao.peso, 0); // Soma ponderada
        this.saida = this.funcaoAtivacao.funcao(net); // Aplica a função de ativação
        this.net = net; // Armazena o valor de net para cálculos posteriores
        return this.saida;
    }

    // Método para adicionar uma conexão de entrada
    adicionarEntrada(neuronioOrigem) {
        const ligacao = new Ligacao(neuronioOrigem, this);
        this.entradas.push(ligacao);
        neuronioOrigem.saidas.push(ligacao);
    }

    // Método para recalcular o erro
    recalcularErro(desejadoValorDeSaida = null) {
        if (desejadoValorDeSaida !== null) {
            // Cálculo de erro para a camada de saída
            this.erro = (desejadoValorDeSaida - this.saida) * this.funcaoAtivacao.derivada(this.net);
        } else {
            // Cálculo de erro para a camada oculta
            this.erro = this.saidas.reduce((soma, ligacao) => {
                return soma + ligacao.peso * ligacao.neuronioDestino.erro;
            }, 0) * this.funcaoAtivacao.derivada(this.net);
        }
    }
}

// Criando uma camada de neurônios com funções de ativação definidas pelo usuário
function criarCamadaDeNeuronios(quantidade, funcaoDeAtivacao) {
    const camada = [];
    for (let i = 0; i < quantidade; i++) {
        camada.push(new Neuronio(funcaoDeAtivacao));
    }
    return camada;
}

// Variáveis globais para a rede
let camadaDeEntrada = [];
let camadaOculta = [];
let camadaDeSaida = [];
let entradasTreinamento = [];
let saidasEsperadas = [];
let classesUnicas = [];
let redeConfigurada = false;
let chart = null;
let startTime = null;
let errorHistory = [];
let progressType = 'iteracoes';

// Adicionar listener para mudança no critério de parada
document.querySelectorAll('input[name="criterio-parada"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        progressType = e.target.value;
        // Atualizar label da barra de progresso
        const progressLabel = document.getElementById('progress-label');
        progressLabel.textContent = progressType === 'iteracoes' ? 'Progresso das Iterações' : 'Progresso do Erro';
    });
});

// Manipulador para o evento de carregamento do arquivo
const fileInput = document.querySelector('input[type="file"]');

fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];

    if (!file || !file.name.endsWith('.csv')) {
        alert("Por favor, selecione um arquivo CSV válido.");
        return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
        const content = e.target.result;
        processCSV(content);
    };

    reader.readAsText(file);
});

// recuperacao dos dados
document.querySelector('button[type="submit"]').addEventListener('click', async (event) => {
    event.preventDefault();

    try {
        // Reset de todas as variáveis globais
        errorHistory = [];
        startTime = null;
        redeConfigurada = false;
        
        // Reset da visualização
        document.getElementById('current-iteration').textContent = '0';
        document.getElementById('current-error').textContent = '0.000000';
        document.getElementById('progress-rate').textContent = '0%';
        document.getElementById('elapsed-time').textContent = '00:00';
        document.getElementById('progress-bar').style.width = '0%';
        
        // Validações...
        const neurons = parseInt(document.getElementById('qtde-camada-oculto').value);
        const minError = parseFloat(document.getElementById('erro-min').value);
        const iterations = parseInt(document.getElementById('qtde-iteracoes').value);
        const stopCriterion = document.querySelector('input[name="criterio-parada"]:checked');
        const learningRate = parseFloat(document.getElementById('taxa-de-aprendizado').value);
        const activationFunction = document.querySelector('input[name="funcao-ativacao"]:checked');

        // Validações mais rigorosas
        if (!entradasTreinamento.length || !camadaDeEntrada.length) {
            throw new Error("Por favor, carregue um arquivo CSV válido primeiro.");
        }

        if (isNaN(neurons) || neurons <= 0) {
            throw new Error("A quantidade de neurônios deve ser um número maior que zero.");
        }

        if (isNaN(minError) || minError < 0 || minError > 1) {
            throw new Error("O erro mínimo deve estar entre 0 e 1.");
        }

        if (isNaN(iterations) || iterations <= 0) {
            throw new Error("O número de iterações deve ser maior que zero.");
        }

        if (!stopCriterion) {
            throw new Error("Selecione um critério de parada.");
        }

        if (isNaN(learningRate) || learningRate <= 0 || learningRate > 1) {
            throw new Error("A taxa de aprendizado deve estar entre 0 e 1.");
        }

        if (!activationFunction) {
            throw new Error("Selecione uma função de ativação.");
        }

        // Reconfigurar a rede
        const numParameters = camadaDeEntrada.length;
        
        // Recriar as camadas
        camadaDeEntrada = criarCamadaDeNeuronios(numParameters, 'linear');
        camadaOculta = criarCamadaDeNeuronios(neurons, activationFunction.value);
        camadaDeSaida = criarCamadaDeNeuronios(classesUnicas.length, 'logistica');

        // Recriar conexões
        camadaOculta.forEach(neuronio => {
            camadaDeEntrada.forEach(entrada => neuronio.adicionarEntrada(entrada));
        });
        camadaDeSaida.forEach(neuronio => {
            camadaOculta.forEach(oculto => neuronio.adicionarEntrada(oculto));
        });

        redeConfigurada = true;
        
        // Desabilitar o formulário durante o treinamento
        const form = document.getElementById('neural-network-form');
        const inputs = form.querySelectorAll('input, button');
        inputs.forEach(input => input.disabled = true);

        // Iniciar treinamento
        await treinarRede();

        // Reabilitar o formulário após o treinamento
        inputs.forEach(input => input.disabled = false);

    } catch (error) {
        alert(error.message);
        redeConfigurada = false;
    }
});

function processCSV(content) {
    try {
        const lines = content.split('\n')
            .filter(line => line.trim() !== '')
            .map(line => line.trim().replace('\r', '')); 

        if (lines.length < 2) {
            throw new Error("O arquivo CSV deve conter ao menos um cabeçalho e uma linha de dados.");
        }

        // Primeira linha: Cabeçalho
        const header = lines[0].split(',');
        const numParameters = header.length - 1;

        // Contar e mapear classes únicas
        const classesSet = new Set();
        for (let i = 1; i < lines.length; i++) {
            const row = lines[i].split(',');
            if (row.length !== header.length) {
                throw new Error(`Linha ${i + 1} tem número incorreto de colunas`);
            }
            const classValue = row[row.length - 1].trim();
            classesSet.add(classValue);
        }
        
        classesUnicas = Array.from(classesSet);
        
        // Carregar dados de treinamento
        entradasTreinamento = lines.slice(1).map((line, idx) => {
            const row = line.split(',');
            const valores = row.slice(0, -1).map(valor => {
                const num = parseFloat(valor.trim());
                if (isNaN(num)) {
                    throw new Error(`Valor inválido na linha ${idx + 2}: ${valor}`);
                }
                return num;
            });
            return valores;
        });

        // Converter classes para índices
        saidasEsperadas = lines.slice(1).map(line => {
            const classe = line.split(',').pop().trim();
            return classesUnicas.indexOf(classe);
        });

        // Configurar camada de entrada inicial
        camadaDeEntrada = criarCamadaDeNeuronios(numParameters, 'linear');
        
        alert(`Arquivo processado com sucesso!\n${numParameters} parâmetros e ${classesUnicas.length} classes diferentes.`);
        
        // Habilitar campos do formulário
        document.getElementById('qtde-camada-oculto').disabled = false;
        document.getElementById('taxa-de-aprendizado').disabled = false;
        document.getElementById('qtde-iteracoes').disabled = false;
        document.getElementById('erro-min').disabled = false;
        document.querySelector('button[type="submit"]').disabled = false;

    } catch (error) {
        alert(`Erro ao processar o arquivo: ${error.message}`);
        redeConfigurada = false;
        // Desabilitar campos do formulário
        document.getElementById('qtde-camada-oculto').disabled = true;
        document.getElementById('taxa-de-aprendizado').disabled = true;
        document.getElementById('qtde-iteracoes').disabled = true;
        document.getElementById('erro-min').disabled = true;
        document.querySelector('button[type="submit"]').disabled = true;
    }
}

function updateStatus(message) {
    const status = document.getElementById('status');
    const trainingInfo = document.getElementById('training-info');
    status.classList.add('active');
    trainingInfo.textContent = message;
}

// Função para inicializar o gráfico
function initializeChart() {
    const options = {
        series: [{
            name: 'Erro Global',
            data: []
        }],
        chart: {
            type: 'area',
            height: '100%',
            width: '100%',
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800,
                animateGradually: {
                    enabled: true,
                    delay: 150
                },
                dynamicAnimation: {
                    enabled: true,
                    speed: 350
                }
            },
            toolbar: {
                show: true,
                tools: {
                    download: true,
                    selection: true,
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                    reset: true
                }
            },
            background: '#fff'
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
            width: 2
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.3,
                stops: [0, 90, 100]
            }
        },
        colors: ['#3498db'],
        title: {
            text: 'Evolução do Erro Global',
            align: 'center',
            style: {
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#2c3e50'
            }
        },
        xaxis: {
            type: 'numeric',
            title: {
                text: 'Iterações',
                style: {
                    fontSize: '14px',
                    fontWeight: 600
                }
            },
            labels: {
                formatter: function(value) {
                    return Math.round(value);
                }
            }
        },
        yaxis: {
            title: {
                text: 'Erro Global',
                style: {
                    fontSize: '14px',
                    fontWeight: 600
                }
            },
            labels: {
                formatter: function(value) {
                    return value.toFixed(6);
                }
            },
            min: 0
        },
        tooltip: {
            shared: false,
            y: {
                formatter: function(value) {
                    return value.toFixed(6);
                }
            }
        },
        theme: {
            mode: 'light',
            palette: 'palette1'
        }
    };

    if (chart) {
        chart.destroy();
    }

    chart = new ApexCharts(document.querySelector("#errorChart"), options);
    chart.render();
}

// Função para atualizar as estatísticas
function updateStats(iteration, error, maxIterations) {
    const currentTime = new Date();
    const elapsedTime = startTime ? Math.floor((currentTime - startTime) / 1000) : 0;
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;

    document.getElementById('current-iteration').textContent = iteration;
    document.getElementById('current-error').textContent = error.toFixed(6);
    
    if (errorHistory.length > 0 && error < errorHistory[errorHistory.length - 1]) {
        document.getElementById('current-error').classList.add('decreasing');
        setTimeout(() => document.getElementById('current-error').classList.remove('decreasing'), 1000);
    }
    
    // Calcular progresso baseado no critério selecionado
    let progress;
    if (progressType === 'iteracoes') {
        progress = Math.min((iteration / maxIterations) * 100, 100);
    } else {
        const minError = parseFloat(document.getElementById('erro-min').value);
        const initialError = errorHistory[0] || error;
        const errorRange = initialError - minError;
        const currentErrorProgress = initialError - error;
        progress = Math.min((currentErrorProgress / errorRange) * 100, 100);
    }
    
    // Atualizar barra de progresso
    document.getElementById('progress-bar').style.width = `${progress}%`;
    document.getElementById('progress-rate').textContent = `${Math.round(progress)}%`;
    
    document.getElementById('elapsed-time').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Atualizar gráfico
    errorHistory.push(error);
    
    const chartData = errorHistory.map((err, idx) => ({
        x: idx,
        y: err
    }));

    chart.updateSeries([{
        data: chartData
    }]);
}

// Modificar a função treinarRede
async function treinarRede() {
    if (!redeConfigurada) {
        throw new Error("A rede neural não está configurada corretamente.");
    }

    const learningRate = parseFloat(document.getElementById('taxa-de-aprendizado').value);
    const maxIterations = parseInt(document.getElementById('qtde-iteracoes').value);
    const minError = parseFloat(document.getElementById('erro-min').value);
    const stopCriterion = document.querySelector('input[name="criterio-parada"]:checked').value;

    let iteration = 0;
    let globalError;
    errorHistory = [];
    
    // Inicializar visualização
    document.getElementById('training-visualization').style.display = 'block';
    startTime = new Date();
    initializeChart();

    try {
        do {
            globalError = 0;

            entradasTreinamento.forEach((inputs, index) => {
                // Forward pass
                camadaDeEntrada.forEach((neuronio, i) => {
                    neuronio.saida = inputs[i];
                });

                camadaOculta.forEach(neuronio => {
                    neuronio.calcularSaida();
                });

                camadaDeSaida.forEach(neuronio => {
                    neuronio.calcularSaida();
                });

                // Calcular erro para camada de saída
                let erroExemplo = 0;
                camadaDeSaida.forEach((neuronio, i) => {
                    const esperado = (i === saidasEsperadas[index]) ? 1 : 0;
                    neuronio.recalcularErro(esperado);
                    // Calcular o erro quadrático para este neurônio de saída
                    erroExemplo += Math.pow(esperado - neuronio.saida, 2);
                });
                // Aplicar a fórmula do erro da rede: (1/2) * soma dos erros quadráticos
                globalError += (1/2) * erroExemplo;

                // Backpropagation para camada oculta
                camadaOculta.forEach(neuronio => {
                    neuronio.recalcularErro();
                });

                // Ajustar pesos - primeiro da camada oculta
                camadaOculta.forEach(neuronio => {
                    neuronio.entradas.forEach(ligacao => {
                        const delta = learningRate * neuronio.erro * ligacao.neuronioOrigem.saida;
                        ligacao.peso += delta;
                    });
                });

                // Depois ajustar pesos da camada de saída
                camadaDeSaida.forEach(neuronio => {
                    neuronio.entradas.forEach(ligacao => {
                        const delta = learningRate * neuronio.erro * ligacao.neuronioOrigem.saida;
                        ligacao.peso += delta;
                    });
                });
            });

            // Calcular erro médio para esta época (dividir pelo número de exemplos)
            globalError = globalError / entradasTreinamento.length;
            
            // Atualizar a cada 10 iterações
            if (iteration % 10 === 0) {
                updateStats(iteration, globalError, maxIterations);
                await new Promise(resolve => setTimeout(resolve, 0));
            }

            iteration++;

            // Critério de parada
            if (stopCriterion === 'iteracoes' && iteration >= maxIterations) {
                break;
            } else if (stopCriterion === 'erroMinimo' && globalError <= minError) {
                break;
            }

        } while (true);

        // Atualização final
        updateStats(iteration, globalError, maxIterations);

        return {
            iterations: iteration,
            finalError: globalError
        };

    } catch (error) {
        console.error('Erro durante o treinamento:', error);
        throw new Error(`Erro durante o treinamento: ${error.message}`);
    }
}

// Adicionar inicialização dos campos desabilitados
document.addEventListener('DOMContentLoaded', () => {
    // Desabilitar campos até que um arquivo seja carregado
    document.getElementById('qtde-camada-oculto').disabled = true;
    document.getElementById('taxa-de-aprendizado').disabled = true;
    document.getElementById('qtde-iteracoes').disabled = true;
    document.getElementById('erro-min').disabled = true;
    document.querySelector('button[type="submit"]').disabled = true;
});
