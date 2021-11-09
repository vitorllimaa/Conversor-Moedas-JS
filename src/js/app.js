const currencyOneEl = document.querySelector('[data-js="currency-one"]');
const currencyTwoEl = document.querySelector('[data-js="currency-two"]');
const currencyValueEl = document.querySelector('[data-js="converted-value"]');
const conversionPrecisionEl = document.querySelector('[data-js="conversion-precision"]');
const timesCurrencyOneEl = document.querySelector('[data-js="currency-number"]');


let internalExchangeRate = {};

/* Api com as conversões de moedas */

const getUrl = currency => `https://v6.exchangerate-api.com/v6/787ce30111d6c515de352ff3/latest/${currency}`;


/* JSON das mesagens de errros */

const getErrorMessage = erroType => ({
    'unsupported-code' : 'se não houver suporte para o código de moeda fornecido ( consulte as moedas com suporte ... ).',
    'malformed-request': 'quando alguma parte de sua solicitação não segue a estrutura mostrada acima.',
    'invalid-key'      : 'quando sua chave API não é válida.',
    'inactive-account' : 'se o seu endereço de e-mail não foi confirmado.',
    'quota-reached'    : 'quando sua conta atingir o número de solicitações permitidas por seu plano.',
})[erroType] || 'Não foi possivel retornar as informações';

/* Método para apresentar mensagem de erro na tela */

const showError = err => {

    const messageError = document.querySelector('.currency-number');
    const div = document.createElement('div');
    const button = document.createElement('button');

    div.classList.add('message-error');
    div.innerText = err.message;

    button.classList.add('btn-close');
    button.setAttribute('type', 'button');
    button.innerText = 'x';

    button.addEventListener('click', e => {

        e.preventDefault();
        div.classList.replace('message-error', 'message-error-show');
        setTimeout(() => {
            div.remove();
        }, 1100);
        
    });
    
    div.appendChild(button);
    messageError.after(div);
}

/* Método para listar as siglas das moedas */

const getOptions = internalExchangeRate  => {

    return Object.keys(internalExchangeRate.conversion_rates);
}

/* Método para criar os elementos com as siglas das moedas */

const listElements = (selectedCurrency, internalExchangeRate) => {

    return getOptions(internalExchangeRate)
    .map(currency => currency === selectedCurrency ? `<option selected>${currency}</option>` 
: `<option>${currency}</option>` ).join('');
}

/* Método para apresentar os informações inicial */

const showInitial = internalExchangeRate => {

    currencyOneEl.innerHTML = listElements('USD', internalExchangeRate);
    currencyTwoEl.innerHTML = listElements('BRL', internalExchangeRate);

    currencyValueEl.innerHTML = internalExchangeRate.conversion_rates.BRL.toFixed(2);
    conversionPrecisionEl.innerHTML = `1 USD = ${internalExchangeRate.conversion_rates.BRL} BRL`;
}
    
/* Método para buscar as informações do cambio das moedas e faz tratamento de possíveis erros */

const fetchExchangeRate = async url => {
    try {
        const response = await fetch(url);

        if(!response.ok && !response.status === 404) {
            throw new Error('Sem conexão a internet.');
        }

        const exchangeRateData =  await response.json();
        
        if(exchangeRateData.result === 'error') {
            throw new Error(getErrorMessage('da'));
        }

        return exchangeRateData;
    } catch (err) {

        showError(err);

    }
}

/* Método de ponto de partida */

const init = async () => {
    
    internalExchangeRate = {... (await fetchExchangeRate(getUrl('USD')))};

    if(internalExchangeRate.conversion_rates) {
        
        showInitial(internalExchangeRate);
    }

}

/* Método para apresentar a atualização da taxa de cambio */

const showUpdateRate = () => {
        
    showMultiplicationRate();

    conversionPrecisionEl.innerText = 
    `1 ${currencyOneEl.value} = ${internalExchangeRate.conversion_rates[currencyTwoEl.value]} ${currencyTwoEl.value}`;
}

/* Método para apresentar a multiplicação do valor da moeda */ 

const showMultiplicationRate = () => {
    currencyValueEl.innerHTML = 
    (internalExchangeRate.conversion_rates[currencyTwoEl.value] * timesCurrencyOneEl.value).toFixed(2);
}

/* Método para buscar a nota taxa de cambio e recalcular */

const hasdleCurrencyOneEl = async e => {
        internalExchangeRate = {... (await fetchExchangeRate(getUrl(e.target.value)))};
        showUpdateRate();
}

timesCurrencyOneEl.addEventListener('input', showMultiplicationRate);
currencyTwoEl.addEventListener('input', showUpdateRate);
currencyOneEl.addEventListener('input', hasdleCurrencyOneEl);

init();

