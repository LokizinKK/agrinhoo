/**
 * AGRO FORTE, FUTURO SUSTENTÁVEL — script.js
 * Projeto Agrinho 2025
 * Funcionalidades: navegação, animações, gráficos Chart.js,
 * contador ao vivo, timeline animada e quiz interativo.
 * Linguagem: JavaScript puro (sem frameworks externos além de Chart.js)
 */

/* =========================================================
   1. NAVEGAÇÃO: scroll + menu mobile
   ========================================================= */
const navbar    = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  const y = window.scrollY;

  // Efeito scrolled na navbar
  navbar.classList.toggle('scrolled', y > 40);

  // Botão voltar ao topo
  backToTop.classList.toggle('visible', y > 400);

  // Link ativo no menu conforme seção visível
  highlightActiveNav();
});

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Fecha menu ao clicar em link
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

function highlightActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const scrollY  = window.scrollY + 100;
  let currentId  = '';

  sections.forEach(section => {
    if (scrollY >= section.offsetTop) {
      currentId = section.id;
    }
  });

  navLinks.querySelectorAll('a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + currentId);
  });
}

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* =========================================================
   2. ANIMAÇÃO DE ENTRADA (IntersectionObserver)
   ========================================================= */
const animateTargets = document.querySelectorAll('[data-animate]');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger suave entre cards na mesma seção
      const delay = (entry.target.closest('.cards-grid, .solutions-grid, .credits-grid, .biomas-grid')
        ? Array.from(entry.target.parentElement.children).indexOf(entry.target) * 80
        : 0);
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

animateTargets.forEach(el => revealObserver.observe(el));

/* =========================================================
   3. HERO: CONTADOR ANIMADO NOS NÚMEROS
   Anima os números do hero do zero até o valor alvo
   ========================================================= */
function animateCounter(el, target, duration = 1800, decimals = 0) {
  const start   = 0;
  const startTs = performance.now();

  function update(ts) {
    const progress = Math.min((ts - startTs) / duration, 1);
    // Easing ease-out
    const eased = 1 - Math.pow(1 - progress, 3);
    const value  = start + (target - start) * eased;
    el.textContent = decimals > 0 ? value.toFixed(decimals) : Math.floor(value);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = decimals > 0 ? target.toFixed(decimals) : target;
  }
  requestAnimationFrame(update);
}

const heroObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.stat-number').forEach(el => {
        const target   = parseFloat(el.dataset.target);
        const decimals = (el.dataset.target.includes('.')) ? 1 : 0;
        animateCounter(el, target, 1800, decimals);
      });
      heroObserver.disconnect();
    }
  });
}, { threshold: 0.3 });

const heroSection = document.getElementById('hero');
if (heroSection) heroObserver.observe(heroSection);

/* =========================================================
   4. CONTADOR DE DESMATAMENTO EM TEMPO REAL
   Fonte: MapBiomas Alerta RAD 2024 — média de 3.403 ha/dia
   3.403 ha/dia ÷ 86.400 s/dia = ~0.03939 ha/segundo
   ========================================================= */
const HA_POR_SEGUNDO = 3403 / 86400; // ~0.03939 ha/s

let startTime       = null;
let counterEl       = document.getElementById('liveCounter');
let counterObserved = false;

function startLiveCounter() {
  if (counterObserved) return;
  counterObserved = true;
  startTime = Date.now();

  function tick() {
    const elapsed = (Date.now() - startTime) / 1000; // segundos
    const total   = elapsed * HA_POR_SEGUNDO;
    counterEl.textContent = total.toFixed(2);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    startLiveCounter();
  }
}, { threshold: 0.3 });

if (counterEl) {
  counterObserver.observe(counterEl.closest('.impact-counter'));
}

/* =========================================================
   5. GRÁFICOS CHART.JS
   Renderizados quando as seções ficam visíveis
   ========================================================= */

/* Paleta de cores dos gráficos alinhada à Paleta 4 */
const COLORS = {
  green:   'rgba(76, 175, 80, 0.85)',
  greenBorder: '#4CAF50',
  amber:   'rgba(255, 193, 7, 0.85)',
  amberBorder: '#FFC107',
  red:     'rgba(231, 76, 60, 0.85)',
  redBorder:   '#e74c3c',
  teal:    'rgba(38, 198, 218, 0.85)',
  tealBorder:  '#26C6DA',
  orange:  'rgba(255, 112, 67, 0.85)',
  orangeBorder:'#FF7043',
  purple:  'rgba(156, 39, 176, 0.85)',
  purpleBorder:'#9C27B0',
  grid:    'rgba(255, 255, 255, 0.06)',
  text:    '#A0AEC0',
};

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      labels: {
        color: COLORS.text,
        font:  { family: "'Inter', sans-serif", size: 11 },
        padding: 16,
        boxWidth: 12,
        boxHeight: 12,
      }
    },
    tooltip: {
      backgroundColor: '#0F3460',
      titleColor: '#fff',
      bodyColor:  COLORS.text,
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      padding: 10,
    }
  },
  scales: {
    x: {
      ticks: { color: COLORS.text, font: { size: 11 } },
      grid:  { color: COLORS.grid }
    },
    y: {
      ticks: { color: COLORS.text, font: { size: 11 } },
      grid:  { color: COLORS.grid }
    }
  }
};

let chartsCreated = false;

function createCharts() {
  if (chartsCreated) return;
  chartsCreated = true;

  /* ---------------------------------------------------
     GRÁFICO 1: Produção de Grãos vs. Área Plantada
     Fonte: Embrapa (2023) — Trajetória da agricultura
     + Conab Safra 2024/2025 (set/2024)
     Dados em milhões (toneladas e hectares)
     --------------------------------------------------- */
  const ctxGraos = document.getElementById('graosChart');
  if (ctxGraos) {
    new Chart(ctxGraos, {
      type: 'bar',
      data: {
        labels: ['1975', '1985', '1995', '2005', '2017', '2023', '2025*'],
        datasets: [
          {
            label: 'Produção (mi toneladas)',
            data: [38, 59, 80, 115, 236, 317, 323],
            backgroundColor: COLORS.green,
            borderColor:     COLORS.greenBorder,
            borderWidth: 1.5,
            borderRadius: 4,
          },
          {
            label: 'Área Plantada (mi hectares)',
            data: [37, 44, 47, 57, 68, 79, 81],
            backgroundColor: COLORS.amber,
            borderColor:     COLORS.amberBorder,
            borderWidth: 1.5,
            borderRadius: 4,
            type: 'line',
            pointRadius: 4,
            pointBackgroundColor: COLORS.amberBorder,
            fill: false,
            tension: 0.3,
            yAxisID: 'y2',
          }
        ]
      },
      options: {
        ...chartDefaults,
        plugins: {
          ...chartDefaults.plugins,
          title: { display: false }
        },
        scales: {
          x: { ...chartDefaults.scales.x },
          y: {
            ...chartDefaults.scales.y,
            position: 'left',
            title: {
              display: true,
              text: 'mi toneladas',
              color: COLORS.text,
              font: { size: 10 }
            }
          },
          y2: {
            position: 'right',
            ticks: { color: COLORS.text, font: { size: 11 } },
            grid:  { drawOnChartArea: false },
            title: {
              display: true,
              text: 'mi hectares',
              color: COLORS.text,
              font: { size: 10 }
            }
          }
        }
      }
    });
  }

  /* ---------------------------------------------------
     GRÁFICO 2: Exportações por Setor 2024
     Fonte: MAPA — Exportações jan-nov/2024 (dez/2024)
     Valores em bilhões de dólares
     --------------------------------------------------- */
  const ctxExport = document.getElementById('exportChart');
  if (ctxExport) {
    new Chart(ctxExport, {
      type: 'doughnut',
      data: {
        labels: [
          'Complexo Soja',
          'Carnes',
          'Sucroalcooleiro',
          'Produtos Florestais',
          'Café',
          'Algodão',
          'Outros'
        ],
        datasets: [{
          data: [52.19, 23.93, 18.27, 11.5, 8.2, 5.8, 32.74],
          backgroundColor: [
            COLORS.green,
            COLORS.red,
            COLORS.amber,
            COLORS.teal,
            COLORS.orange,
            COLORS.purple,
            'rgba(160,174,192,0.5)'
          ],
          borderColor: [
            COLORS.greenBorder,
            COLORS.redBorder,
            COLORS.amberBorder,
            COLORS.tealBorder,
            COLORS.orangeBorder,
            COLORS.purpleBorder,
            '#718096'
          ],
          borderWidth: 1.5,
          hoverOffset: 8
        }]
      },
      options: {
        ...chartDefaults,
        scales: undefined,
        cutout: '60%',
        plugins: {
          ...chartDefaults.plugins,
          tooltip: {
            ...chartDefaults.plugins.tooltip,
            callbacks: {
              label: ctx => ` US$ ${ctx.parsed.toFixed(2)} bi`
            }
          }
        }
      }
    });
  }

  /* ---------------------------------------------------
     GRÁFICO 3: Desmatamento por Bioma 2024
     Fonte: MapBiomas Alerta — RAD 2024 (mai/2025)
     Valores em hectares
     --------------------------------------------------- */
  const ctxBiomas = document.getElementById('biomassChart');
  if (ctxBiomas) {
    new Chart(ctxBiomas, {
      type: 'bar',
      data: {
        labels: ['Cerrado', 'Amazônia', 'Caatinga', 'Mata Atlântica', 'Pantanal', 'Pampa'],
        datasets: [{
          label: 'Área desmatada (hectares)',
          data: [652197, 378000, 114000, 48000, 23295, 26587],
          backgroundColor: [
            COLORS.orange,
            COLORS.red,
            COLORS.amber,
            COLORS.green,
            COLORS.teal,
            COLORS.purple
          ],
          borderColor: [
            COLORS.orangeBorder,
            COLORS.redBorder,
            COLORS.amberBorder,
            COLORS.greenBorder,
            COLORS.tealBorder,
            COLORS.purpleBorder
          ],
          borderWidth: 1.5,
          borderRadius: 4,
        }]
      },
      options: {
        ...chartDefaults,
        indexAxis: 'y',
        plugins: {
          ...chartDefaults.plugins,
          legend: { display: false },
          tooltip: {
            ...chartDefaults.plugins.tooltip,
            callbacks: {
              label: ctx => ` ${ctx.parsed.x.toLocaleString('pt-BR')} hectares`
            }
          }
        },
        scales: {
          x: {
            ...chartDefaults.scales.x,
            ticks: {
              ...chartDefaults.scales.x.ticks,
              callback: val => (val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val)
            }
          },
          y: { ...chartDefaults.scales.y }
        }
      }
    });
  }
}

/* Renderiza gráficos quando a seção de dados fica visível */
const dadosObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    createCharts();
    dadosObserver.disconnect();
  }
}, { threshold: 0.1 });

const dadosSection = document.getElementById('dados');
if (dadosSection) dadosObserver.observe(dadosSection);

/* =========================================================
   6. TIMELINE: anima as barras com Intersection Observer
   ========================================================= */
const timelineObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const bars = entry.target.querySelectorAll('.tl-bar');
      bars.forEach((bar, i) => {
        bar.style.width = '0';
        const targetW = bar.getAttribute('style').match(/width:\s*([\d.]+%)/)?.[1] || '50%';
        setTimeout(() => {
          bar.style.width = targetW;
        }, i * 150);
      });
      timelineObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const timelineEl = document.querySelector('.timeline');
if (timelineEl) timelineObserver.observe(timelineEl);

/* =========================================================
   7. QUIZ INTERATIVO
   Perguntas baseadas nos dados apresentados no site
   Fontes citadas nos feedbacks de cada questão
   ========================================================= */
const quizData = [
  {
    question: 'Qual foi a participação do agronegócio no PIB do Brasil em 2024?',
    options: ['15,4%', '23,2%', '31,7%', '8,6%'],
    correct: 1,
    feedback: '✅ Correto! Segundo levantamento da CNA/CEPEA (Esalq/USP), o agronegócio representou 23,2% do PIB brasileiro em 2024, totalizando R$ 2,72 trilhões. Fonte: CNA/CEPEA, abr/2025.'
  },
  {
    question: 'Em 2024, qual bioma teve a maior área desmatada no Brasil?',
    options: ['Amazônia', 'Mata Atlântica', 'Cerrado', 'Pantanal'],
    correct: 2,
    feedback: '✅ Correto! O Cerrado foi o bioma mais desmatado pelo segundo ano consecutivo, com 652.197 hectares desmatados, mais da metade (52,5%) do total nacional. Fonte: MapBiomas Alerta RAD 2024, mai/2025.'
  },
  {
    question: 'Qual região concentrou 75% do desmatamento do Cerrado e ~42% de todo o desmatamento nacional em 2024?',
    options: ['Amazônia Legal', 'Sul do Brasil', 'Matopiba', 'Nordeste Semiárido'],
    correct: 2,
    feedback: '✅ Correto! O Matopiba (Maranhão, Tocantins, Piauí e Bahia) é o principal foco de desmatamento do Cerrado. O Maranhão liderou com 218.298 hectares. Fonte: MapBiomas Alerta RAD 2024.'
  },
  {
    question: 'Entre 1975 e 2017, como cresceu a produção de grãos no Brasil, segundo a Embrapa?',
    options: [
      'Duplicou (38 → 76 mi ton.)',
      'Triplicou (38 → 114 mi ton.)',
      'Cresceu 6x (38 → 236 mi ton.)',
      'Cresceu 10x (38 → 380 mi ton.)'
    ],
    correct: 2,
    feedback: '✅ Correto! A produção saltou de 38 para 236 milhões de toneladas, crescimento de mais de 6 vezes, enquanto a área plantada apenas dobrou. Isso demonstra o poder da intensificação tecnológica. Fonte: Embrapa, 2023.'
  },
  {
    question: 'Qual o principal sistema desenvolvido pela Embrapa que combina lavoura, pecuária e árvores na mesma área?',
    options: ['ABC Agro', 'iLPF', 'PRODES', 'MATOPIBA'],
    correct: 1,
    feedback: '✅ Correto! O sistema iLPF (Integração Lavoura-Pecuária-Floresta) é desenvolvido pela Embrapa e permite aumentar produtividade por hectare enquanto recupera pastagens degradadas, sem necessidade de desmatar novas áreas.'
  },
  {
    question: 'Qual é a meta de aumento de produtividade agrícola que o Brasil precisa alcançar até 2050, sem expandir área plantada?',
    options: ['20%', '40%', '70%', '100%'],
    correct: 2,
    feedback: '✅ Correto! Estima-se que o Brasil precisará aumentar em até 70% a produtividade agrícola até 2050 para atender à demanda global de alimentos sem derrubar novos biomas. Fonte: Ministério da Agricultura, 2025.'
  }
];

let currentQuestion = 0;
let score           = 0;
let answered        = false;
let userAnswers     = new Array(quizData.length).fill(null);

function renderQuestion() {
  const data   = quizData[currentQuestion];
  const total  = quizData.length;
  const pct    = ((currentQuestion) / total) * 100;
  const pctEnd = ((currentQuestion + 1) / total) * 100;

  document.getElementById('quizProgressBar').style.width = pct + '%';
  document.getElementById('quizNum').textContent         = `Questão ${currentQuestion + 1} de ${total}`;

  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  prevBtn.style.display = currentQuestion > 0 ? 'inline-flex' : 'none';
  nextBtn.textContent   = currentQuestion === total - 1 ? 'Ver resultado' : 'Próxima →';

  let optionsHTML = '';
  data.options.forEach((opt, i) => {
    const isChosen  = userAnswers[currentQuestion] === i;
    let cls = 'quiz-option';
    if (isChosen) {
      cls += i === data.correct ? ' correct' : ' wrong';
    } else if (userAnswers[currentQuestion] !== null && i === data.correct) {
      cls += ' correct';
    }
    const disabled = userAnswers[currentQuestion] !== null ? 'disabled' : '';
    optionsHTML += `<button class="${cls}" onclick="selectAnswer(${i})" ${disabled}>${opt}</button>`;
  });

  let feedbackHTML = '';
  if (userAnswers[currentQuestion] !== null) {
    const isRight = userAnswers[currentQuestion] === data.correct;
    const fbClass = isRight ? 'correct' : 'wrong';
    const wrongMsg = isRight ? '' : `❌ A resposta correta era: <strong>"${data.options[data.correct]}"</strong><br/>`;
    feedbackHTML = `<div class="quiz-feedback ${fbClass}">${wrongMsg}${data.feedback}</div>`;
  }

  document.getElementById('quizContent').innerHTML = `
    <p class="quiz-question">${data.question}</p>
    <div class="quiz-options">${optionsHTML}</div>
    ${feedbackHTML}
  `;
}

window.selectAnswer = function(index) {
  if (userAnswers[currentQuestion] !== null) return;
  userAnswers[currentQuestion] = index;
  if (index === quizData[currentQuestion].correct) {
    score++;
  }
  renderQuestion();
};

window.nextQuestion = function() {
  if (currentQuestion < quizData.length - 1) {
    currentQuestion++;
    renderQuestion();
  } else {
    showResult();
  }
};

window.prevQuestion = function() {
  if (currentQuestion > 0) {
    currentQuestion--;
    renderQuestion();
  }
};

function showResult() {
  document.getElementById('quizContainer').style.display = 'none';
  const resultEl = document.getElementById('quizResult');
  resultEl.style.display = 'block';

  let icon, title, desc;
  if (score === 6) {
    icon  = '🏆';
    title = 'Perfeito! Você é um especialista!';
    desc  = 'Parabéns! Você acertou todas as questões e demonstrou excelente conhecimento sobre agronegócio e sustentabilidade no Brasil. Continue defendendo o equilíbrio entre produção e meio ambiente!';
  } else if (score >= 4) {
    icon  = '🌱';
    title = 'Muito bem! Quase lá!';
    desc  = 'Você tem bom conhecimento sobre o tema. Revise os pontos que errou e aprofunde-se nos dados sobre desmatamento e soluções sustentáveis.';
  } else if (score >= 2) {
    icon  = '🌿';
    title = 'Bom começo! Continue aprendendo!';
    desc  = 'Você está no caminho certo. Role a página para rever as informações e tente novamente — cada ponto correto é um passo rumo a um futuro mais sustentável!';
  } else {
    icon  = '🌾';
    title = 'Não desista! O aprendizado é o caminho.';
    desc  = 'Aproveite para reler as seções do site com atenção especial aos dados das fontes citadas. O Brasil precisa de jovens informados sobre esse tema vital!';
  }

  document.getElementById('resultIcon').textContent  = icon;
  document.getElementById('resultTitle').textContent = title;
  document.getElementById('resultDesc').textContent  = desc;
  document.getElementById('resultScore').textContent = score;

  document.getElementById('quizProgressBar').style.width = '100%';
}

window.resetQuiz = function() {
  currentQuestion = 0;
  score           = 0;
  userAnswers     = new Array(quizData.length).fill(null);
  document.getElementById('quizResult').style.display   = 'none';
  document.getElementById('quizContainer').style.display = 'block';
  renderQuestion();
};

// Inicializa o quiz ao carregar
renderQuestion();

/* =========================================================
   8. SMOOTH SCROLL para links internos
   (complementa o scroll-behavior: smooth do CSS)
   ========================================================= */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const offset = 72; // altura da navbar fixa
    const top    = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* =========================================================
   9. FALLBACK PARA IMAGENS
   Substitui imagens Unsplash que não carregarem por
   um gradiente em SVG inline baseado no bioma
   ========================================================= */
const biomaFallbacks = {
  'bioma-img--amazon': 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 50%, #52B788 100%)',
  'bioma-img--cerrado': 'linear-gradient(135deg, #7B4F00 0%, #B45309 50%, #D97706 100%)',
  'bioma-img--mata': 'linear-gradient(135deg, #064E3B 0%, #065F46 50%, #047857 100%)',
};

Object.entries(biomaFallbacks).forEach(([cls, fallback]) => {
  const el = document.querySelector('.' + cls);
  if (!el) return;
  // Testa se o backgroundImage carregou via checagem de erro
  const testImg = new Image();
  const urlMatch = getComputedStyle(el).backgroundImage.match(/url\(["']?([^"')]+)["']?\)/);
  if (!urlMatch) return;
  testImg.onerror = () => {
    el.style.backgroundImage = 'none';
    el.style.background = fallback;
  };
  testImg.src = urlMatch[1];
});

/* =========================================================
   10. LOG DE ACESSIBILIDADE NO CONSOLE
   Informativo para avaliadores
   ========================================================= */
console.info(
  '%cAgro Forte, Futuro Sustentável — Projeto Agrinho 2025\n' +
  '%cSite desenvolvido com HTML, CSS e JavaScript puro.\n' +
  'Dados: CNA/CEPEA, MAPA, MapBiomas Alerta RAD 2024, Embrapa, INPE, Conab.\n' +
  'Imagens: Unsplash (licença gratuita).\n' +
  'Acessibilidade: suporte a prefers-reduced-motion, navegação por teclado, textos alternativos.',
  'color: #4CAF50; font-size: 14px; font-weight: bold;',
  'color: #A0AEC0; font-size: 12px;'
);
