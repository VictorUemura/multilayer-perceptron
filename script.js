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

// recuperacao dos dados
document.querySelector('button[type="submit"]').addEventListener('click', (event) => {
    event.preventDefault(); // Evita o envio padrão do formulário

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

    // Dados validados
    alert("Dados validados com sucesso!");
    console.log({
        fileName: file.name,
        neurons,
        minError,
        iterations,
        stopCriterion: stopCriterion.value,
        learningRate,
        activationFunction: activationFunction.value,
    });
});

const camadaDeEntradas = []; // aqui respectivamente irão todos os valores de entrada recebidos em um arquivo .csv
const camadaDeNeuronios = []; // neste array é definido a quantidade de perceptrons de acordo com a quantidade definida
const camadaDeSaida = []; // neste array é definido os perceptrons que retornam alguma saida