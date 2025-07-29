const apiKeyInput = document.getElementById('apiKey');
const gameSelect = document.getElementById('gameSelect');
const questionInput = document.getElementById('questionInput'); 
const askButton = document.getElementById('askButton');
const aiResponse = document.getElementById('aiResponse');
const form = document.getElementById('form');

const markdownToHTML = (text) => { // Function que vai receber o texto da resposta do Gemini
    const converter = new showdown.Converter(); // Crição de um objeto (Existem várias maneiras)
    return converter.makeHtml(text); // retornando convertido
}

// Já mando a questão, game e apiKey
const perguntarAI = async (question, game, apiKey) => {  /* async - usamos isso para falar que em algum passo dessa função vamos precisar sair da minha aplicação e ir para outra aplicação em algum lugar do mundo, esperar uma resposta e receber aqui, nesse caso GEMINI. Conversa assíncrona */

    const model = "gemini-2.5-flash";
    const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`; 

    // com `` - posso quebrar linhas. Fazendo engenharia de prompt
    const perguntaCODM = ` 
        ## Especialidade
        Você é um especialista assistente de meta para o jogo ${game}

        ## Tarefa
        Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, builds e dicas

        ## Regras
        - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.
        - Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não esta relacionada ao jogo'
        - Considere a data atual ${new Date().toDateString()}
        - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
        - Nunca responda itens que você não tenha certeza de que existe no patch atual.

        ## Resposta
        - Economize na resposta, seja direto e responda no máximo 500 caracteres
        - Responda em markdown
        - Não precisa fazer nenhuma saudação ou dspedida, apenas responda o que o usuário está querendo.

        ## Exemplo de resposta
        Pergunta do usuário: Melhor sniper do Call of Duty Mobile 
        Resposta: A melhor sniper atual considerando pesquisas recentes é: \n\nA sniper **Locus**\n\n**Por que a sniper locus ?:**\n\n**Informações de jogadores reais:**\n\n**Melhores mapas para se usar**\n\n**Personalização utilizada pelos jogadores**

        ---
        Aqui está a pergunta do usuário: ${question}

    `;  

    const perguntaValorant = `
        ## Especialidade
        Você é um especialista assistente de meta para o jogo Valorant

        ## Tarefa
        Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, agentes, composições, armas e dicas.

        ## Regras
        - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.
        - Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não está relacionada ao jogo'.
        - Considere a data atual ${new Date().toDateString()}
        - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
        - Nunca responda itens que você não tenha certeza de que existem no patch atual.
        - Priorize informações práticas, baseadas no meta atual e dados de jogadores reais.

        ## Resposta
        - Economize na resposta, seja direto e responda no máximo 500 caracteres
        - Responda em markdown
        - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.

        ## Exemplo de resposta
        Pergunta do usuário: Melhor duelista para subir de rank atualmente?
        Resposta: O melhor duelista no meta atual é:\n\n**Raze**\n\n**Por que Raze?:** Alto potencial de dano, mobilidade com satchels, ótimo controle de espaço.\n\n**Melhores mapas:** Split, Bind, Haven\n\n**Dicas:** Abuse das granadas e da ultimate para abrir espaços ou punir inimigos escondidos.

        ---
        Aqui está a pergunta do usuário: ${question}

    `;

    const perguntaLOL = `
        ## Especialidade
        Você é um especialista assistente de meta para o jogo ${game}

        ## Tarefa
        Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, builds, runas, rotas, counters, itens e dicas atualizadas.

        ## Regras
        - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.
        - Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não está relacionada ao jogo'.
        - Considere a data atual ${new Date().toDateString()}
        - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
        - Nunca responda itens que você não tenha certeza de que existem no patch atual.
        - Priorize informações práticas, baseadas no jogo atual e dados de jogadores reais (profissionais e high elo).

        ## Resposta
        - Economize na resposta, seja direto e responda no máximo 500 caracteres
        - Responda em markdown
        - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.

        ## Exemplo de resposta
        Pergunta do usuário: Melhor build para Kayn vermelho na jungle?
        Resposta: **Kayn Rhaast** (vermelho) no patch atual usa:\n\n**Itens principais:** Ruptor Divino, Cutelo Negro, Couraça do Defunto\n\n**Runas:** Conquistador, Triunfo, Lenda: Tenacidade, Último Esforço\n\n**Dicas:** Foque em lutas longas e peel para seu time. Countera tanques e comps de luta estendida.

        ---
        Aqui está a pergunta do usuário: ${question}
        
    `;

    let pergunta = '';

    if(game == 'call of duty mobile'){
        pergunta = perguntaCODM
    }else if(game == 'valorant'){
        pergunta = perguntaValorant
    }else{
        pergunta = perguntaLOL
    }


    const contents = [{
        role: "user",  // vamos usar tools para fazer uma pesquisa atual 
        parts: [{
            text: pergunta 
        }]
    }] 

    const tools = [{
        google_search: {} // tools
    }]

    // Chamada API - ( Comunicação com o Gemini )
    // async existe esse await, pois temos que esperar a resposta (fetch)
    const response = await fetch(geminiURL, {
        method: 'post', 
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ // vai pegar um objeto e tornar um json
            contents,
            tools  // agora é um agente, pois tem ferramentas
        }) 
    })

    const data = await response.json() // pegando todas as informações e transformando em json
    console.log({ data }) // para descobrir o que eu tenho que retornar
    return data.candidates[0].content.parts[0].text // ver o caminho no console web
}

const enviarFormulario = async (event) => { // Function
    event.preventDefault(); // Para rodar só o console, não atualiza a página ao submeter ( Navigated to http://127.0.0.1:5500/? )

    // Pegando os dados dos inputs and selects

    const apiKey = apiKeyInput.value; // valor insrido no input dentro de uma váriavel
    const game = gameSelect.value; 
    const question = questionInput.value;

    if(apiKey.trim() == "" || game.trim() == "" || question.trim() == ""){
        alert('Por favor, preencha todos os campos.');
        return; // Retorna - Terminando assim a verificação
    }

    askButton.disabled = true;  // desabilitando botão para evitar bugs (Tem CSS)
    askButton.textContent = 'Perguntando...'; // Mundando o texto depois de clicar e desabilitar
    askButton.classList.add('loading');

    try{  // Tentar/Testar algo (Bloco lógico), Vou fazer a comunicação com o Gemini
        // Perguntar para a IA

        const text = await perguntarAI(question, game, apiKey); // Precisa esperar até que todas informações sejam devolvidas

        aiResponse.querySelector('.response-content').innerHTML = markdownToHTML(text); // pegando a resposta convertida e mostrando

        aiResponse.classList.remove('hidden'); // Removendo ele vai aparecer

        questionInput.value = '';
        questionInput.focus();

    } catch(error){ // Se tiver um erro, ou seja, se o Gemini não funcionar

        alert('Ocorreu um erro!');
        console.log(`Erro: ${error}`);

    } finally{ // Mesmo que de errado ou certo (Finalmente), vai ser usado para abilitar o botão novamente.
        askButton.disabled = false;
        askButton.textContent = 'Perguntar';
        askButton.classList.remove('loading'); // Para remover o estilo
    }

}

form.addEventListener('submit', enviarFormulario)  // Adicone um ouvidor de evento