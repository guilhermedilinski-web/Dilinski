// Perfis, perguntas e cálculo de pontuação — compartilhado entre index.html e painel.html
window.BC = (function(){
  "use strict";

  var ORDEM = ['azul','rosa','amarelo','verde','branco'];
  var LETRA = { azul:'A', rosa:'R', amarelo:'M', verde:'V', branco:'B' };

  var PERFIS = {
    azul: {
      label:'Azul', dim:'Mental · Físico', tagline:'Racional e objetivo',
      descricao:'Pessoa objetiva, que valoriza coerência e resultado. Prefere clareza a rodeios e constrói confiança aos poucos, com base em fatos.',
      caracteristicas:['Foco em resultado prático','Pouca demonstração emocional','Fala pouco, mas com precisão','Valoriza consistência ao longo do tempo'],
      comunicar:['Seja direto e objetivo','Leve dados e propostas claras','Evite conversa sem propósito','Cumpra o combinado — a confiança se constrói aos poucos'],
      evitar:['Enrolação','Promessas não cumpridas','Pressão emocional para decidir rápido']
    },
    rosa: {
      label:'Rosa', dim:'Emocional · Mental', tagline:'Visionário e inovador',
      descricao:'Pessoa que se energiza com novidade, desafio e movimento. Gosta de discutir ideias e se entedia com rotina.',
      caracteristicas:['Gosta de debate e brainstorm','Entusiasmo à flor da pele','Foco no futuro e em oportunidades','Pode perder o fio de detalhes operacionais'],
      comunicar:['Traga novidades e oportunidades','Dê espaço para perguntas e discussão','Evite excesso de detalhe operacional no início','Mostre o que há de diferente na proposta'],
      evitar:['Rotina e repetição','Falta de novidade','Ser cortado no meio de uma ideia']
    },
    amarelo: {
      label:'Amarelo', dim:'Emocional · Físico', tagline:'Relacional e empático',
      descricao:'Pessoa que valoriza o vínculo pessoal e é sensível ao clima da conversa. Decide também com base em como se sente em relação a quem está do outro lado.',
      caracteristicas:['Expressivo e caloroso','Atento às emoções, suas e dos outros','Gosta de proximidade','Costuma fazer várias coisas ao mesmo tempo'],
      comunicar:['Comece pelo pessoal antes de ir ao assunto','Pergunte como a pessoa está','Mostre cuidado genuíno, não só o produto','Evite ser puramente transacional'],
      evitar:['Frieza no atendimento','Pressa excessiva','Ambiente sem harmonia']
    },
    verde: {
      label:'Verde', dim:'Físico · Emocional', tagline:'Estável e constante',
      descricao:'Pessoa que valoriza estabilidade, previsibilidade e um ritmo próprio. Constrói confiança devagar, mas de forma duradoura.',
      caracteristicas:['Calmo e ponderado','Avesso a pressa','Valoriza histórico e continuidade','Prefere rotinas familiares'],
      comunicar:['Dê tempo para processar e responder','Evite prazos apertados sem necessidade','Seja consistente ao longo do relacionamento','Nunca rotule essa pessoa de "devagar"'],
      evitar:['Pressa','Mudanças bruscas sem aviso','Cobrança por resposta imediata']
    },
    branco: {
      label:'Branco', dim:'Físico · Mental', tagline:'Estruturado e estratégico',
      descricao:'Pessoa analítica, que precisa entender o porquê antes de agir. Gosta de estrutura, lógica e planejamento de longo prazo.',
      caracteristicas:['Objetivo e organizado','Confortável com números e dados','Prefere trabalhar de forma independente','Memória seletiva para o essencial'],
      comunicar:['Explique o propósito e a lógica da recomendação','Use dados e estrutura clara','Vá direto ao ponto, mas com embasamento','Evite apelo puramente emocional'],
      evitar:['Falta de clareza','Decisões sem embasamento','Pressão social para decidir']
    }
  };

  var PERGUNTAS = [
    { q:'Como você prefere se comunicar no dia a dia?', o:[
      ['branco','Gosto de entender o objetivo antes de qualquer conversa.'],
      ['azul','Direto ao ponto, sem rodeios — vou reto ao que interessa.'],
      ['amarelo','Prefiro uma conversa próxima, com espaço para o pessoal.'],
      ['rosa','Gosto de trocar ideias, debater e explorar possibilidades.'],
      ['verde','Prefiro ouvir mais e falar quando tenho algo relevante a acrescentar.'] ] },
    { q:'Como você toma decisões importantes?', o:[
      ['azul','Rápido — confio na minha leitura da situação.'],
      ['verde','Prefiro tempo para amadurecer antes de decidir.'],
      ['branco','Analiso dados e informações com calma antes de decidir.'],
      ['rosa','Gosto de considerar várias alternativas antes de decidir.'],
      ['amarelo','Levo em conta como a decisão afeta as pessoas envolvidas.'] ] },
    { q:'O que mais te energiza no trabalho?', o:[
      ['rosa','Novidade, desafio e a chance de inovar.'],
      ['branco','Ter clareza sobre o propósito do que estou fazendo.'],
      ['azul','Alcançar metas e ver resultado prático.'],
      ['verde','Estabilidade e um ritmo que eu controle.'],
      ['amarelo','Interação com pessoas e bons relacionamentos.'] ] },
    { q:'Como você reage a mudanças de última hora?', o:[
      ['verde','Me incomoda — prefiro previsibilidade.'],
      ['rosa','Gosto: mudança me deixa animado.'],
      ['amarelo','Preciso conversar sobre isso antes de me sentir bem.'],
      ['azul','Me adapto rápido e sigo em frente.'],
      ['branco','Aceito bem, desde que o motivo esteja claro.'] ] },
    { q:'O que mais te tira do sério?', o:[
      ['amarelo','Ambiente sem harmonia ou conflito não resolvido.'],
      ['branco','Falta de clareza ou de um plano definido.'],
      ['verde','Pressa excessiva e prazos apertados demais.'],
      ['azul','Perder tempo com conversa sem objetivo.'],
      ['rosa','Rotina repetitiva e falta de novidade.'] ] },
    { q:'Como é a sua relação com prazos?', o:[
      ['branco','Planejo com antecedência para cumprir com folga.'],
      ['amarelo','Me esforço, mas às vezes priorizo as pessoas antes do prazo.'],
      ['azul','Cumpro — e cobro isso dos outros também.'],
      ['verde','Prefiro prazos realistas, sem pressa desnecessária.'],
      ['rosa','Trabalho melhor sob pressão, no limite do prazo.'] ] },
    { q:'Em uma reunião, qual é o seu papel mais natural?', o:[
      ['verde','Observar e contribuir com calma, no meu tempo.'],
      ['azul','Manter o foco e cobrar decisões práticas.'],
      ['rosa','Trazer ideias novas e provocar discussão.'],
      ['branco','Organizar a pauta e garantir que o objetivo seja atingido.'],
      ['amarelo','Garantir que todos se sintam ouvidos.'] ] },
    { q:'Como prefere receber uma explicação nova, por exemplo sobre um investimento?', o:[
      ['amarelo','Conversando, com exemplos próximos da minha realidade.'],
      ['verde','Com calma, sem pressa, podendo revisitar depois.'],
      ['branco','De forma estruturada, com dados e lógica clara.'],
      ['azul','Rápido e direto: o que é e o resultado esperado.'],
      ['rosa','Com espaço para perguntas e discussão.'] ] },
    { q:'O que mais valoriza numa relação de confiança, como com um assessor?', o:[
      ['rosa','Alguém que me desafie e traga novidades.'],
      ['branco','Transparência e coerência entre o que fala e o que faz.'],
      ['amarelo','Proximidade e cuidado genuíno comigo.'],
      ['verde','Consistência e histórico ao longo do tempo.'],
      ['azul','Competência e resultado comprovado.'] ] },
    { q:'Como costuma ser o seu ritmo no dia a dia?', o:[
      ['azul','Acelerado — gosto de resolver rápido.'],
      ['amarelo','Variável, depende de quem está por perto.'],
      ['verde','Tranquilo, no meu próprio tempo.'],
      ['branco','Constante e organizado — sigo uma rotina.'],
      ['rosa','Inquieto — muitas coisas ao mesmo tempo.'] ] },
    { q:'Ao receber uma notícia ruim, como o mercado em queda, qual é a sua primeira reação?', o:[
      ['branco','Busco dados para entender o real tamanho do problema.'],
      ['rosa','Quero entender rápido as alternativas possíveis.'],
      ['azul','Já penso no que fazer a seguir.'],
      ['amarelo','Sinto o impacto emocional antes de pensar em ação.'],
      ['verde','Preciso de um tempo para processar antes de reagir.'] ] },
    { q:'Como prefere que o seu assessor entre em contato?', o:[
      ['verde','Sem pressa, respeitando meu tempo de resposta.'],
      ['branco','Com uma pauta clara e objetiva do assunto.'],
      ['rosa','Trazendo novidades e oportunidades para conversar.'],
      ['amarelo','De forma pessoal, perguntando como estou.'],
      ['azul','Direto, com uma recomendação clara.'] ] }
  ];

  function letras(respostas){
    return respostas.map(function(c){ return LETRA[c]; }).join('');
  }
  function calcularScores(respostas){
    var s = { azul:0, rosa:0, amarelo:0, verde:0, branco:0 };
    respostas.forEach(function(c){ if(c && s.hasOwnProperty(c)) s[c]++; });
    return s;
  }
  function ranquear(scores){
    return ORDEM.map(function(k){ return [k, Number(scores[k]) || 0]; })
                .sort(function(a,b){ return b[1] - a[1]; });
  }
  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
    });
  }
  function data(ts){
    if(!ts) return '';
    try{ return new Date(ts).toLocaleDateString('pt-BR'); }catch(e){ return ''; }
  }
  function iniciais(nome){
    var p = String(nome || '').trim().split(/\s+/).filter(Boolean);
    if(!p.length) return '?';
    return (p[0][0] + (p.length > 1 ? p[p.length-1][0] : '')).toUpperCase();
  }

  function faixasHTML(scores, total){
    total = total || PERGUNTAS.length;
    return '<div class="bars">' + ORDEM.map(function(k){
      var v = Number(scores[k]) || 0;
      var pct = Math.round((v / total) * 100);
      return '<div class="bar c-' + k + '"><span class="bname">' + PERFIS[k].label + '</span>' +
        '<span class="btrack"><span class="bfill" style="width:' + pct + '%"></span></span>' +
        '<span class="bval">' + v + '</span></div>';
    }).join('') + '</div>';
  }
  function faixaTituloHTML(key, rotulo){
    var p = PERFIS[key];
    return '<div class="band tinted c-' + key + '"><div class="band-label">' + esc(rotulo) + '</div>' +
      '<h2>' + p.label + '</h2><p class="band-sub">' + esc(p.tagline) + ' · ' + p.dim + '</p></div>';
  }
  function listaHTML(titulo, itens){
    return '<div class="block"><p class="eyebrow">' + esc(titulo) + '</p><ul class="plain">' +
      itens.map(function(t){ return '<li>' + esc(t) + '</li>'; }).join('') + '</ul></div>';
  }
  function stripHTML(){
    return '<div class="strip">' + ORDEM.map(function(k){
      return '<span class="c-' + k + '"></span>';
    }).join('') + '</div>';
  }
  function cabecalhoHTML(sub){
    return '<div class="head"><div class="mark">🧭</div><div><h1>Bússola do Cliente</h1>' +
      '<p>' + esc(sub) + '</p></div></div>';
  }

  var toastTimer = null;
  function toast(msg){
    var el = document.getElementById('toast');
    if(!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ el.classList.remove('show'); }, 2300);
  }
  function copiar(texto, msgOk){
    function fim(ok){ toast(ok ? (msgOk || 'Copiado') : 'Não foi possível copiar'); }
    function alternativa(){
      try{
        var ta = document.createElement('textarea');
        ta.value = texto; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select(); document.execCommand('copy');
        document.body.removeChild(ta); fim(true);
      }catch(e){ fim(false); }
    }
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(texto).then(function(){ fim(true); }).catch(alternativa);
    } else { alternativa(); }
  }
  function whatsapp(texto){ return 'https://wa.me/?text=' + encodeURIComponent(texto); }

  function cliente(){
    if(!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY ||
       window.SUPABASE_URL.indexOf('COLE') === 0 || window.SUPABASE_ANON_KEY.indexOf('COLE') === 0){
      return null;
    }
    return window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  }

  return {
    ORDEM:ORDEM, LETRA:LETRA, PERFIS:PERFIS, PERGUNTAS:PERGUNTAS,
    letras:letras, calcularScores:calcularScores, ranquear:ranquear,
    esc:esc, data:data, iniciais:iniciais,
    faixasHTML:faixasHTML, faixaTituloHTML:faixaTituloHTML, listaHTML:listaHTML,
    stripHTML:stripHTML, cabecalhoHTML:cabecalhoHTML,
    toast:toast, copiar:copiar, whatsapp:whatsapp, cliente:cliente
  };
})();
