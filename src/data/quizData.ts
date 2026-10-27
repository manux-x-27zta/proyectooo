export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  speciesRelated: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: '¿Qué significa que una especie sea "endémica" de Colombia?',
    options: [
      'Que vive en toda Suramérica sin restricciones',
      'Que habita de forma natural exclusivamente en Colombia y en ninguna otra parte del mundo',
      'Que fue traída de otro continente por expedicionarios',
      'Que puede reproducirse únicamente en zoológicos o reservas artificiales',
    ],
    correctIndex: 1,
    explanation: '¡Exacto! Una especie endémica es aquella cuya presencia geográfica está restringida de forma natural a un territorio específico. Si desaparece de Colombia, desaparece del planeta entero.',
    speciesRelated: 'Concepto General de Endemismo',
  },
  {
    id: 2,
    question: '¿En qué lugar de Colombia vive el fascinante Lagarto Azul (Anolis gorgonae)?',
    options: [
      'En el Desierto de la Tatacoa',
      'En las playas de Cartagena',
      'Exclusivamente en el Parque Nacional Natural Isla Gorgona, en el Pacífico',
      'En los nevados de la Cordillera Central',
    ],
    correctIndex: 2,
    explanation: '¡Correcto! El Lagarto Azul es el único lagarto 100% azul del mundo y solo habita en los troncos de la selva húmeda protegida de la Isla Gorgona (Cauca).',
    speciesRelated: 'Lagarto Azul de Gorgona',
  },
  {
    id: 3,
    question: '¿Cuál es el rol ecológico fundamental del Tití Cabeciblanco (Saguinus oedipus) en el bosque seco tropical?',
    options: [
      'Polinizar flores de cactus exclusivamente',
      'Ser el "jardinero del bosque", dispersando más del 80% de las semillas de árboles nativos',
      'Cavar madrigueras subterráneas para airear el suelo',
      'Construir diques en las quebradas para retener agua',
    ],
    correctIndex: 1,
    explanation: '¡Muy bien! Al alimentarse de frutos carnosos, el Tití Cabeciblanco traga las semillas y las defeca intactas a cientos de metros, permitiendo que el amenazado bosque seco tropical vuelva a nacer.',
    speciesRelated: 'Tití Cabeciblanco',
  },
  {
    id: 4,
    question: '¿Qué particularidad reproductora tiene la Rana Dorada de Supatá (Pristimantis supatus)?',
    options: [
      'Pone miles de huevos que flotan en ríos caudalosos',
      'Tiene renacuajos gigantes con caparazón',
      'Posee "desarrollo directo": de los huevos no salen renacuajos, sino ranitas diminutas ya formadas',
      'Inverna bajo el hielo durante seis meses al año',
    ],
    correctIndex: 2,
    explanation: '¡Excelente! No necesita cuerpos de agua estancada. Deposita sus huevos en bromelias y musgos húmedos del bosque de niebla, de donde nacen ranitas completas de pocos milímetros.',
    speciesRelated: 'Rana Dorada de Supatá',
  },
  {
    id: 5,
    question: '¿De qué planta paramuna se alimenta y dispersa semillas el Perico del Sol (Pyrrhura calliptera) en Chingaza?',
    options: [
      'De la Palma de Cera',
      'Del Frailejón (Espeletia)',
      'Del Eucalipto importado',
      'Del Pasto de corte ganadero',
    ],
    correctIndex: 1,
    explanation: '¡Acertaste! Este perico altoandino consume los capítulos florales y semillas del frailejón, soportando el frío del páramo y ayudando a la regeneración de la fábrica de agua.',
    speciesRelated: 'Perico del Sol',
  },
];
