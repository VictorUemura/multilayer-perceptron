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

const camadaDeEntradas = []; // aqui respectivamente irão todos os valores de entrada recebidos em um arquivo .csv
const camadaDeNeuronios = []; // neste array é definido a quantidade de perceptrons de acordo com a quantidade definida
const camadaDeSaida = []; // neste array é definido os perceptrons que retornam alguma saida