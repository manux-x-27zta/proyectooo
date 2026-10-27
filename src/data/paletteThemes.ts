export type PaletteId = 'esmeralda' | 'oceano' | 'orquidea' | 'paramo' | 'coral' | 'choco';

export interface PaletteTheme {
  id: PaletteId;
  name: string;
  subtitle: string;
  regionInspiration: string;
  speciesEmblem: string;
  tag: string;
  swatches: {
    primary: string;
    accent: string;
    glow: string;
    bgLight: string;
    bgDark: string;
  };
  style: {
    primaryHex: string;
    primaryHoverHex: string;
    accentHex: string;
    badgeBgLight: string;
    badgeTextLight: string;
    badgeBgDark: string;
    badgeTextDark: string;
    heroGradient: string;
    buttonGradient: string;
    cardBorderLight: string;
    cardBorderDark: string;
  };
}

export const PALETTE_THEMES: PaletteTheme[] = [
  {
    id: 'esmeralda',
    name: 'Selva Esmeralda',
    subtitle: 'Verdes vivos, follaje tropical y esmeraldas de Muzo',
    regionInspiration: 'Cordillera Oriental y Amazonía',
    speciesEmblem: 'Rana Dorada de Supatá y Perico del Sol',
    tag: 'Clásica Natural',
    swatches: {
      primary: '#196b44',
      accent: '#10b981',
      glow: '#34d399',
      bgLight: '#fafcfb',
      bgDark: '#0a1410',
    },
    style: {
      primaryHex: '#196b44',
      primaryHoverHex: '#145a38',
      accentHex: '#10b981',
      badgeBgLight: '#e2f4ea',
      badgeTextLight: '#166534',
      badgeBgDark: '#152d22',
      badgeTextDark: '#86e2b5',
      heroGradient: 'from-emerald-400 via-teal-300 to-lime-300',
      buttonGradient: 'from-emerald-600 to-teal-700',
      cardBorderLight: '#d8eae0',
      cardBorderDark: '#224434',
    },
  },
  {
    id: 'oceano',
    name: 'Océano Gorgona',
    subtitle: 'Azul zafiro profundo, arrecifes y aguas del Pacífico',
    regionInspiration: 'Isla Gorgona y Santuario de Malpelo',
    speciesEmblem: 'Lagarto Azul de Gorgona y Lagarto de Malpelo',
    tag: 'Pacífico & Marino',
    swatches: {
      primary: '#1d4ed8',
      accent: '#0284c7',
      glow: '#38bdf8',
      bgLight: '#f4f8fd',
      bgDark: '#050d1a',
    },
    style: {
      primaryHex: '#1d4ed8',
      primaryHoverHex: '#1e40af',
      accentHex: '#0284c7',
      badgeBgLight: '#dbeafe',
      badgeTextLight: '#1e40af',
      badgeBgDark: '#0f274a',
      badgeTextDark: '#93c5fd',
      heroGradient: 'from-blue-400 via-cyan-300 to-sky-300',
      buttonGradient: 'from-blue-600 to-cyan-700',
      cardBorderLight: '#bfdbfe',
      cardBorderDark: '#1d3b66',
    },
  },
  {
    id: 'paramo',
    name: 'Sol del Páramo',
    subtitle: 'Ámbar dorado, tonos tierra y frailejones en flor',
    regionInspiration: 'Páramos de Chingaza, Sumapaz y Perijá',
    speciesEmblem: 'Frailejón de Perijá y Cóndor de los Andes',
    tag: 'Alta Montaña',
    swatches: {
      primary: '#b45309',
      accent: '#f59e0b',
      glow: '#fbbf24',
      bgLight: '#fdfbf6',
      bgDark: '#140d04',
    },
    style: {
      primaryHex: '#b45309',
      primaryHoverHex: '#92400e',
      accentHex: '#f59e0b',
      badgeBgLight: '#fef3c7',
      badgeTextLight: '#92400e',
      badgeBgDark: '#38240a',
      badgeTextDark: '#fcd34d',
      heroGradient: 'from-amber-400 via-yellow-300 to-orange-300',
      buttonGradient: 'from-amber-600 to-yellow-600',
      cardBorderLight: '#fde68a',
      cardBorderDark: '#4d330f',
    },
  },
  {
    id: 'orquidea',
    name: 'Orquídea Real',
    subtitle: 'Púrpura amatista, fucsia silvestre y alas de colibrí',
    regionInspiration: 'Valle de Cocora y Serranía del Chiribiquete',
    speciesEmblem: 'Orquídea de Mutis y Colibrí Esmeralda',
    tag: 'Floral Silvestre',
    swatches: {
      primary: '#7e22ce',
      accent: '#d946ef',
      glow: '#f472b6',
      bgLight: '#faf5ff',
      bgDark: '#100618',
    },
    style: {
      primaryHex: '#7e22ce',
      primaryHoverHex: '#6b21a8',
      accentHex: '#d946ef',
      badgeBgLight: '#f3e8ff',
      badgeTextLight: '#6b21a8',
      badgeBgDark: '#301347',
      badgeTextDark: '#d8b4fe',
      heroGradient: 'from-purple-400 via-fuchsia-300 to-pink-300',
      buttonGradient: 'from-purple-600 to-pink-600',
      cardBorderLight: '#e9d5ff',
      cardBorderDark: '#471e69',
    },
  },
  {
    id: 'coral',
    name: 'Caribe & Atardecer',
    subtitle: 'Coral fuego, terracota cálida y atardeceres caribeños',
    regionInspiration: 'Bosque Seco Tropical y Región Caribe',
    speciesEmblem: 'Tití Cabeciblanco y Paujil Piquiazul',
    tag: 'Caribe Cálido',
    swatches: {
      primary: '#c2410c',
      accent: '#f97316',
      glow: '#fb923c',
      bgLight: '#fef7f4',
      bgDark: '#150804',
    },
    style: {
      primaryHex: '#c2410c',
      primaryHoverHex: '#9a3412',
      accentHex: '#f97316',
      badgeBgLight: '#ffedd5',
      badgeTextLight: '#9a3412',
      badgeBgDark: '#3d170a',
      badgeTextDark: '#fdba74',
      heroGradient: 'from-orange-400 via-amber-300 to-rose-300',
      buttonGradient: 'from-orange-600 to-rose-600',
      cardBorderLight: '#fed7aa',
      cardBorderDark: '#52220f',
    },
  },
  {
    id: 'choco',
    name: 'Chocó Pluvial',
    subtitle: 'Teal profundo, aguas esmeraldinas y selvas lluviosas',
    regionInspiration: 'Chocó Biogeográfico y Río Atrato',
    speciesEmblem: 'Rana Dardo Dorada y Tunato de Handley',
    tag: 'Selva Pluvial',
    swatches: {
      primary: '#0f766e',
      accent: '#14b8a6',
      glow: '#2dd4bf',
      bgLight: '#f0fdfa',
      bgDark: '#031211',
    },
    style: {
      primaryHex: '#0f766e',
      primaryHoverHex: '#115e59',
      accentHex: '#14b8a6',
      badgeBgLight: '#ccfbf1',
      badgeTextLight: '#115e59',
      badgeBgDark: '#0c3331',
      badgeTextDark: '#5eead4',
      heroGradient: 'from-teal-400 via-emerald-300 to-cyan-300',
      buttonGradient: 'from-teal-600 to-emerald-700',
      cardBorderLight: '#99f6e4',
      cardBorderDark: '#144946',
    },
  },
];
