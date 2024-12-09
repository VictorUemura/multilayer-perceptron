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
document.querySelector('button[type="submit"]').addEventListener('click', (event) => {
    event.preventDefault();

    // Recuperar os dados do formulário
    const fileInput = document.querySelector('input[type="file"]');
    const neurons = document.getElementById('qtde-camada-oculto').value;
    const minError = document.getElementById('erro-min').value;
    const iterations = document.getElementById('qtde-iteracoes').value;
    const stopCriterion = document.querySelector('input[name="criterio-parada"]:checked');
    const learningRate = document.getElementById('taxa-de-aprendizado').value;
    const activationFunction = document.querySelector('input[name="funcao-ativacao"]:checked');

    // Validação do arquivo CSV
    const file = fileInput.files[0];
    if (!file) {
        alert("Por favor, carregue um arquivo CSV.");
        return;
    }
    if (!file.name.endsWith('.csv')) {
        alert("O arquivo deve ser do tipo .csv!");
        return;
    }

    // Validação dos campos numéricos
    if (neurons <= 0) {
        alert("A quantidade de neurônios na camada oculta deve ser maior que zero.");
        return;
    }

    if (minError < 0 || minError > 1) {
        alert("O valor do erro mínimo deve estar entre 0 e 1.");
        return;
    }

    if (iterations <= 0) {
        alert("O número de iterações deve ser maior que zero.");
        return;
    }

    if (!stopCriterion) {
        alert("Por favor, selecione um critério de parada.");
        return;
    }

    if (learningRate < 0 || learningRate > 1) {
        alert("A taxa de aprendizado deve estar entre 0 e 1.");
        return;
    }

    if (!activationFunction) {
        alert("Por favor, selecione uma função de ativação.");
        return;
    }

    // Reconfigurar a rede com os novos parâmetros
    try {
        // Configurar a rede
        const numParameters = camadaDeEntrada.length; // Preservar o número de parâmetros
        
        // Recriar as camadas com os novos parâmetros
        camadaDeEntrada = criarCamadaDeNeuronios(numParameters, 'linear');
        camadaOculta = criarCamadaDeNeuronios(parseInt(neurons), activationFunction.value);
        camadaDeSaida = criarCamadaDeNeuronios(classesUnicas.length, 'logistica');

        // Recriar conexões
        camadaOculta.forEach(neuronio => {
            camadaDeEntrada.forEach(entrada => neuronio.adicionarEntrada(entrada));
        });
        camadaDeSaida.forEach(neuronio => {
            camadaOculta.forEach(oculto => neuronio.adicionarEntrada(oculto));
        });

        redeConfigurada = true;
        
        // Iniciar treinamento com a rede reconfigurada
        treinarRede();
    } catch (error) {
        alert(`Erro ao reconfigurar a rede: ${error.message}`);
        redeConfigurada = false;
    }
});

function processCSV(content) {
    const lines = content.split('\n')
        .filter(line => line.trim() !== '')
        .map(line => line.trim().replace('\r', '')); // Remover \r para compatibilidade

    if (lines.length < 2) {
        alert("O arquivo CSV deve conter ao menos um cabeçalho e uma linha de dados.");
        return;
    }

    // Primeira linha: Cabeçalho
    const header = lines[0].split(',');
    const numParameters = header.length - 1;

    // Contar e mapear classes únicas
    const classesSet = new Set();
    for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',');
        const classValue = row[row.length - 1].trim();
        classesSet.add(classValue);
    }
    
    classesUnicas = Array.from(classesSet);
    
    alert(`O arquivo contém ${numParameters} parâmetros e ${classesUnicas.length} classes diferentes.`);

    // Validar os valores do formulário antes de configurar a rede
    const quantidadeNeuroniosOcultos = parseInt(document.getElementById('qtde-camada-oculto').value);
    const funcaoAtivacaoSelecionada = document.querySelector('input[name="funcao-ativacao"]:checked');
    
    if (!quantidadeNeuroniosOcultos || quantidadeNeuroniosOcultos <= 0) {
        alert("Por favor, insira uma quantidade válida de neurônios na camada oculta.");
        return;
    }

    if (!funcaoAtivacaoSelecionada) {
        alert("Por favor, selecione uma função de ativação.");
        return;
    }

    const funcaoAtivacao = funcaoAtivacaoSelecionada.value;

    try {
        // Configurar a rede
        camadaDeEntrada = criarCamadaDeNeuronios(numParameters, 'linear');
        camadaOculta = criarCamadaDeNeuronios(quantidadeNeuroniosOcultos, funcaoAtivacao);
        camadaDeSaida = criarCamadaDeNeuronios(classesUnicas.length, 'logistica');

        // Criar conexões
        camadaOculta.forEach(neuronio => {
            camadaDeEntrada.forEach(entrada => neuronio.adicionarEntrada(entrada));
        });
        camadaDeSaida.forEach(neuronio => {
            camadaOculta.forEach(oculto => neuronio.adicionarEntrada(oculto));
        });

        // Carregar dados de treinamento
        entradasTreinamento = lines.slice(1).map(line => {
            const row = line.split(',');
            const valores = row.slice(0, -1).map(valor => parseFloat(valor.trim()));
            
            // Validar se todos os valores são números
            if (valores.some(isNaN)) {
                throw new Error("Dados de entrada inválidos: todos os valores devem ser numéricos");
            }
            
            return valores;
        });

        // Converter classes para one-hot encoding
        saidasEsperadas = lines.slice(1).map(line => {
            const classe = line.split(',').pop().trim();
            return classesUnicas.indexOf(classe);
        });

        redeConfigurada = true;
    } catch (error) {
        alert(`Erro ao configurar a rede: ${error.message}`);
        redeConfigurada = false;
    }
}

function updateStatus(message) {
    const status = document.getElementById('status');
    const trainingInfo = document.getElementById('training-info');
    status.classList.add('active');
    trainingInfo.textContent = message;
}

function treinarRede() {
    if (!redeConfigurada || !entradasTreinamento.length || !saidasEsperadas.length) {
        alert("A rede neural não está configurada corretamente ou não há dados de treinamento.");
        return;
    }

    const learningRate = parseFloat(document.getElementById('taxa-de-aprendizado').value);
    const maxIterations = parseInt(document.getElementById('qtde-iteracoes').value);
    const minError = parseFloat(document.getElementById('erro-min').value);
    const stopCriterion = document.querySelector('input[name="criterio-parada"]:checked').value;

    let iteration = 0;
    let globalError;

    updateStatus('Iniciando treinamento...');
    
    console.log('Iniciando treinamento...');
    console.log(`Total de exemplos: ${entradasTreinamento.length}`);
    console.log(`Número de classes: ${classesUnicas.length}`);
    console.log(`Critério de parada: ${stopCriterion}`);
    console.log('-------------------');

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

            // Calcular erro para camada de saída e acumular erro global
            camadaDeSaida.forEach((neuronio, i) => {
                const esperado = (i === saidasEsperadas[index]) ? 1 : 0;
                neuronio.recalcularErro(esperado);
                globalError += Math.pow(esperado - neuronio.saida, 2);
            });

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

        // Calcular erro médio para esta época
        globalError = globalError / (2 * entradasTreinamento.length);
        
        if (iteration % 10 === 0) {
            updateStatus(`Iteração ${iteration + 1} - Erro global: ${globalError.toFixed(6)}`);
        }

        iteration++;

        // Verifica o critério de parada escolhido
        if (stopCriterion === 'iteracoes') {
            if (iteration >= maxIterations) break;
        } else if (stopCriterion === 'erroMinimo') {
            if (globalError <= minError) break;
        }

    } while (true);

    console.log('-------------------');
    console.log(`Treinamento finalizado!`);
    console.log(`Total de iterações: ${iteration}`);
    console.log(`Erro global final: ${globalError.toFixed(6)}`);

    alert(`Treinamento finalizado!\nIterações: ${iteration}\nErro global: ${globalError.toFixed(6)}`);
}
