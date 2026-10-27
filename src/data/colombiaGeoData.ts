import { ColombianRegion, Species } from '../types';

export const SVG_MAP_WIDTH = 840;
export const SVG_MAP_HEIGHT = 900;

// Geographically proportional equirectangular projection centered on Colombia (~4.5°N)
// Scale X = 44.0 px/deg, Scale Y = 44.2 px/deg (99.9% conformal near the Equator)
const ORIGIN_LNG = -82.2;
const ORIGIN_LAT = 13.5;
const SCALE_X = 44.0;
const SCALE_Y = 44.2;
const OFFSET_X = 76;
const OFFSET_Y = 55;

export function projectGeo(lat: number, lng: number): { x: number; y: number } {
  const x = OFFSET_X + (lng - ORIGIN_LNG) * SCALE_X;
  const y = OFFSET_Y + (ORIGIN_LAT - lat) * SCALE_Y;
  return {
    x: Math.round(x * 100) / 100,
    y: Math.round(y * 100) / 100,
  };
}

export function hasValidCoordinates(sp: Species | null | undefined): boolean {
  if (!sp || !sp.coordinates) return false;
  const { lat, lng } = sp.coordinates;
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -5 &&
    lat <= 14 &&
    lng >= -83 &&
    lng <= -66
  );
}

// Convert an array of [lng, lat] coordinates into an SVG path string
export function coordsToPath(coords: ReadonlyArray< readonly [number, number] >, close = true): string {
  if (coords.length === 0) return '';
  const parts = coords.map(([lng, lat], idx) => {
    const { x, y } = projectGeo(lat, lng);
    return `${idx === 0 ? 'M' : 'L'} ${x},${y}`;
  });
  return close ? `${parts.join(' ')} Z` : parts.join(' ');
}

function reverseCoords(coords: ReadonlyArray<readonly [number, number]>): Array<readonly [number, number]> {
  return [...coords].reverse();
}

// ============================================================================
// SHARED EXTERIOR & INTERIOR BOUNDARY ARCS ([lng, lat])
// Using shared vertex chains guarantees zero gaps or overlaps between regions
// and produces an immediately recognizable silhouette of Colombia.
// ============================================================================

// Exterior Arc 1: Caribbean Coast + Guajira + Perijá (Fondo Golfo de Urabá -> Punta Gallinas -> Castilletes -> Perijá South)
const EXT_CARIBE_COAST_AND_PERIJA: ReadonlyArray<readonly [number, number]> = [
  [-76.92, 7.88], // Fondo Golfo de Urabá (Turbo / Río Atrato)
  [-76.73, 8.35], // Necoclí
  [-76.42, 8.85], // Arboletes
  [-75.88, 9.40], // Golfo de Morrosquillo / Tolú
  [-75.55, 10.40], // Cartagena de Indias
  [-75.10, 10.80], // Galerazamba
  [-74.80, 11.08], // Bocas de Ceniza / Barranquilla
  [-74.22, 11.25], // Santa Marta
  [-73.95, 11.33], // Parque Tayrona
  [-73.55, 11.26], // Palomino / Dibulla
  [-72.92, 11.55], // Riohacha
  [-72.50, 11.78], // Manaure
  [-72.16, 12.20], // Cabo de la Vela
  [-71.95, 12.33], // Bahía Portete
  [-71.67, 12.46], // Punta Gallinas (Extremo norte continental)
  [-71.22, 12.18], // Punta Espada
  [-71.32, 11.85], // Castilletes (Golfo de Venezuela)
  [-71.88, 11.50], // Montes de Oca
  [-72.32, 11.15], // Maicao / Carraipía
  [-72.78, 10.75], // Serranía del Perijá Norte
  [-72.92, 10.35], // Sabana Rubia / Perijá Centro
  [-73.02, 9.85],  // Serranía del Perijá Sur
  [-73.25, 9.25],  // Sur del Cesar / El Tarra Norte
];

// Exterior Arc 2: Urabá Occidental + Panamá Darién + Costa Pacífica (Urabá -> Cabo Tiburón -> Juradó -> Buenaventura -> Tumaco -> Río Mataje -> Tobar Donoso)
const EXT_DARIEN_AND_PACIFIC_COAST: ReadonlyArray<readonly [number, number]> = [
  [-76.92, 7.88], // Fondo Golfo de Urabá
  [-77.08, 8.28], // Acandí / Unguía costa
  [-77.36, 8.68], // Cabo Tiburón (Frontera Panamá - Caribe)
  [-77.48, 8.32], // Serranía del Darién
  [-77.32, 7.92], // Parque Los Katíos
  [-77.52, 7.55], // Altos de Aspavé
  [-77.88, 7.22], // Hito Pacífico / Cocalito (Panamá-Colombia)
  [-77.77, 7.10], // Juradó
  [-77.65, 6.68], // Cupica / Bahía Solano
  [-77.38, 6.22], // Bahía Solano / Utría
  [-77.28, 5.95], // Nuquí
  [-77.54, 5.48], // Cabo Corrientes
  [-77.36, 4.95], // Pizarro / Bajo Baudó
  [-77.35, 4.42], // Delta del Río San Juan
  [-77.38, 3.98], // Bahía Málaga / Juanchaco
  [-77.06, 3.88], // Bahía de Buenaventura
  [-77.28, 3.52], // Naya
  [-77.62, 3.05], // Costa de López de Micay / Timbiquí
  [-77.88, 2.58], // Guapi
  [-78.42, 2.48], // Punta Coco / Iscuandé
  [-78.68, 2.15], // Salahonda
  [-78.76, 1.81], // Bahía de Tumaco
  [-79.01, 1.62], // Cabo Manglares
  [-78.84, 1.44], // Desembocadura Río Mataje (Frontera Ecuador)
  [-78.42, 1.18], // Tobar Donoso / Piedemonte Nariñense
];

// Exterior Arc 3: Frontera Andina Sur con Ecuador (Chiles / Ipiales / San Miguel)
const EXT_ECUADOR_ANDES: ReadonlyArray<readonly [number, number]> = [
  [-78.42, 1.18], // Tobar Donoso / Piedemonte Nariñense
  [-77.95, 0.83], // Volcán Chiles / Cumbal
  [-77.64, 0.81], // Ipiales / Rumichaca
  [-77.15, 0.42], // Valle del Guamuez
  [-76.85, 0.25], // San Miguel (Sucumbíos - Putumayo)
];

// Exterior Arc 4: Frontera Amazónica (Ecuador, Perú y Brasil: Putumayo -> Trapecio Amazónico -> Leticia -> Guainía)
const EXT_AMAZONIA_BORDERS: ReadonlyArray<readonly [number, number]> = [
  [-76.85, 0.25],  // San Miguel
  [-76.38, 0.36],  // Río San Miguel / Putumayo
  [-75.75, 0.12],  // Puerto Ospina
  [-75.25, -0.12], // Güeppí (Trifinio Colombia-Ecuador-Perú)
  [-74.78, -0.19], // Puerto Leguízamo
  [-74.22, -0.62], // Río Putumayo medio
  [-73.68, -1.22], // La Chorrera sur / El Encanto
  [-73.21, -1.75], // El Encanto (Río Putumayo)
  [-72.52, -2.05], // San Rafael
  [-71.75, -2.14], // Puerto Arica
  [-70.95, -2.35], // Flor de Agosto
  [-70.12, -2.62], // Río Putumayo bajo
  [-69.74, -2.89], // Tarapacá (Entrada norte del Trapecio Amazónico)
  [-70.25, -3.52], // Límite occidental del Trapecio (Río Yaguas / Atacuari)
  [-70.42, -3.78], // Puerto Nariño norte
  [-70.26, -3.82], // Río Amazonas (Loreto / Puerto Nariño)
  [-69.94, -4.22], // Leticia / Quebrada San Antonio (Extremo sur de Colombia)
  [-69.95, -3.45], // Límite oriental del Trapecio (Tabatinga - Apaporis)
  [-69.72, -2.92], // Tarapacá este
  [-69.43, -1.35], // La Pedrera / Río Caquetá (Frontera Brasil)
  [-69.45, -1.07], // Desembocadura Río Apaporis / Taraíra
  [-69.85, -0.45], // Vaupés oriental
  [-70.05, 0.12],  // Cachivera del Vaupés
  [-69.82, 0.72],  // Mitú oriental / Río Papurí
  [-69.18, 1.08],  // Querari / Isana
  [-68.35, 1.65],  // Serranía del Naquén (Guainía)
  [-67.55, 1.68],  // Alto Río Guainía
  [-67.08, 1.98],  // San Felipe / Río Negro
  [-66.85, 1.23],  // Isla San José / Piedra del Cocuy (Trifinio Colombia-Brasil-Venezuela)
  [-67.12, 2.15],  // Río Guainía / Río Negro
  [-67.38, 2.85],  // Casiquiare / Amanaven
  [-67.85, 3.88],  // Puerto Inírida / Estrella Fluvial de Inírida
];

// Exterior Arc 5: Frontera Orinoquía con Venezuela (Puerto Inírida -> Río Orinoco -> Puerto Carreño -> Río Meta -> Arauca -> Saravena)
const EXT_ORINOQUIA_BORDERS: ReadonlyArray<readonly [number, number]> = [
  [-67.85, 3.88], // Estrella Fluvial de Inírida
  [-67.75, 4.55], // Parque Nacional Natural El Tuparro (Río Orinoco)
  [-67.82, 5.25], // Maipures / Raudales del Orinoco
  [-67.58, 5.82], // Casuarito
  [-67.48, 6.19], // Puerto Carreño (Confluencia Orinoco - Meta)
  [-68.25, 6.18], // Río Meta fronterizo
  [-69.15, 6.12], // La Primavera / Cravo Norte este
  [-70.08, 6.45], // Cinaruco / Cravo Norte
  [-70.18, 6.98], // Paso del Viento / Arauca este
  [-70.76, 7.08], // Ciudad de Arauca (Río Arauca)
  [-71.38, 7.04], // Arauquita
  [-71.92, 7.01], // Saravena / Cubará (Piedemonte Araucano)
];

// Exterior Arc 6: Frontera Andina Oriental con Venezuela (Cubará -> Cúcuta -> Catatumbo -> Sur Perijá)
const EXT_ANDINA_VENEZUELA: ReadonlyArray<readonly [number, number]> = [
  [-71.92, 7.01], // Cubará / Sierra Nevada del Cocuy este
  [-72.18, 7.28], // Toledo / Pamplona este
  [-72.48, 7.89], // Cúcuta / Villa del Rosario
  [-72.65, 8.42], // Tibú / Cuenca del Catatumbo
  [-72.98, 8.85], // Río de Oro / PNN Catatumbo Barí
  [-73.25, 9.25], // Sur del Cesar
];

// ============================================================================
// INTERNAL BIOGEOGRAPHIC REGION DIVIDERS ([lng, lat])
// ============================================================================

// Internal Divider A: Caribe <-> Pacífica (Urabá -> Mutatá)
const INT_CARIBE_PACIFICA: ReadonlyArray<readonly [number, number]> = [
  [-76.92, 7.88], // Fondo Golfo de Urabá
  [-76.55, 7.62], // Mutatá / Paramillo Oeste
];

// Internal Divider B: Caribe <-> Andina (Nudo de Paramillo -> Bajo Cauca -> San Lucas Sur -> Cesar Sur)
const INT_CARIBE_ANDINA: ReadonlyArray<readonly [number, number]> = [
  [-76.55, 7.62], // Mutatá / Paramillo
  [-75.85, 7.85], // Tierralta Sur / Alto Sinú
  [-75.15, 7.92], // Caucasia / Nechí
  [-74.35, 7.65], // Sur de Bolívar
  [-74.42, 6.82], // Magdalena Medio (incluye Crax alberti en 7.03, -74.41 dentro de Caribe)
  [-73.85, 7.45], // Barrancabermeja norte / Sogamoso bajo
  [-73.55, 8.25], // Aguachica
  [-73.25, 9.25], // Sur del Cesar
];

// Internal Divider C: Pacífica <-> Andina (Flanco occidental Cordillera Occidental)
const INT_PACIFICA_ANDINA: ReadonlyArray<readonly [number, number]> = [
  [-76.55, 7.62], // Mutatá
  [-76.35, 6.75], // Frontino / Urrao oeste
  [-76.32, 5.75], // Ciudad Bolívar / Farallones del Citará oeste
  [-76.55, 4.75], // Serranía de los Paraguas oeste
  [-76.72, 3.85], // Farallones de Cali oeste (Dagua)
  [-77.08, 2.85], // Munchique oeste (deja Phyllobates terribilis 2.77, -77.66 en Pacífica)
  [-77.68, 1.85], // Barbacoas / Ricaurte oeste
  [-78.42, 1.18], // Piedemonte Nariñense (Frontera Ecuador)
];

// Internal Divider D: Andina <-> Orinoquía (Piedemonte Llanero: Cubará -> Casanare -> Villavicencio -> Uribe)
const INT_ANDINA_ORINOQUIA: ReadonlyArray<readonly [number, number]> = [
  [-71.92, 7.01], // Saravena / Cubará
  [-72.18, 6.32], // Tame / Piedemonte Casanare norte
  [-72.55, 5.45], // Yopal oeste / Aguazul
  [-73.15, 4.78], // Monterrey / Medina (deja Chingaza 4.61, -73.74 en Andina)
  [-73.68, 4.18], // Villavicencio oeste
  [-73.92, 3.85], // Acacías / Cubarral (deja Plecturocebus ornatus 3.70, -73.70 en Orinoquía)
  [-74.35, 3.15], // Uribe / Cordillera Oriental sur
];

// Internal Divider E: Andina <-> Amazonía (Piedemonte Amazónico: Uribe -> Florencia -> Mocoa -> San Miguel)
const INT_ANDINA_AMAZONIA: ReadonlyArray<readonly [number, number]> = [
  [-74.35, 3.15], // Uribe / Macarena oeste
  [-74.95, 2.35], // San Vicente del Caguán oeste / Guayas
  [-75.65, 1.68], // Florencia oeste (PNN Los Picachos / Fragua)
  [-76.58, 1.18], // Mocoa oeste (Bota Caucana)
  [-76.85, 0.25], // San Miguel (Frontera Ecuador)
];

// Internal Divider F: Orinoquía <-> Amazonía (Río Guaviare / Macarena -> Estrella Fluvial de Inírida)
const INT_ORINOQUIA_AMAZONIA: ReadonlyArray<readonly [number, number]> = [
  [-74.35, 3.15], // Uribe / Serranía de la Macarena
  [-73.65, 2.75], // Río Guayabero / La Macarena sur
  [-72.65, 2.58], // San José del Guaviare (deja Chiribiquete 0.52, -72.78 en Amazonía)
  [-71.35, 2.88], // Mapiripán / Río Guaviare medio
  [-69.85, 3.35], // Barrancominas (Río Guaviare)
  [-67.85, 3.88], // Puerto Inírida (Estrella Fluvial)
];

// ============================================================================
// ASSEMBLED REGION POLYGONS (Exact topological partition of Continental Colombia)
// ============================================================================

export interface RegionGeoShape {
  id: ColombianRegion;
  name: string;
  shortDesc: string;
  labelCoords: readonly [number, number]; // [lng, lat]
  polygon: ReadonlyArray<readonly [number, number]>;
  lightFill: string;
  lightStroke: string;
  darkFill: string;
  darkStroke: string;
  legendColor: string;
}

export const COLOMBIA_REGIONS_GEO: RegionGeoShape[] = [
  {
    id: 'Caribe',
    name: 'Región Caribe',
    shortDesc: 'Llanuras costeras, bosque seco tropical, La Guajira y Sierra Nevada',
    labelCoords: [-74.75, 9.55],
    polygon: [
      ...EXT_CARIBE_COAST_AND_PERIJA,
      ...reverseCoords(INT_CARIBE_ANDINA.slice(0, -1)),
      ...reverseCoords(INT_CARIBE_PACIFICA.slice(1, -1)),
    ],
    lightFill: '#e8dfad',
    lightStroke: '#b9a863',
    darkFill: '#2f331d',
    darkStroke: '#656c3a',
    legendColor: '#eab308',
  },
  {
    id: 'Pacífica',
    name: 'Región Pacífica',
    shortDesc: 'Selva húmeda pluvial del Chocó biogeográfico y manglares costeros',
    labelCoords: [-77.32, 5.25],
    polygon: [
      ...EXT_DARIEN_AND_PACIFIC_COAST,
      ...reverseCoords(INT_PACIFICA_ANDINA.slice(0, -1)),
    ],
    lightFill: '#7fd1a4',
    lightStroke: '#469e70',
    darkFill: '#123828',
    darkStroke: '#2b6f52',
    legendColor: '#059669',
  },
  {
    id: 'Andina',
    name: 'Región Andina',
    shortDesc: 'Tres cordilleras, valles interandinos, bosques de niebla y páramos',
    labelCoords: [-75.15, 5.35],
    polygon: [
      ...INT_CARIBE_ANDINA,
      ...reverseCoords(EXT_ANDINA_VENEZUELA.slice(0, -1)),
      ...INT_ANDINA_ORINOQUIA.slice(1),
      ...INT_ANDINA_AMAZONIA.slice(1),
      ...reverseCoords(EXT_ECUADOR_ANDES.slice(0, -1)),
      ...reverseCoords(INT_PACIFICA_ANDINA.slice(1, -1)),
    ],
    lightFill: '#bad69b',
    lightStroke: '#7da15b',
    darkFill: '#223a23',
    darkStroke: '#4c754d',
    legendColor: '#65a30d',
  },
  {
    id: 'Orinoquía',
    name: 'Región Orinoquía',
    shortDesc: 'Llanos Orientales, sabanas inundables, morichales y piedemonte',
    labelCoords: [-70.55, 5.15],
    polygon: [
      ...INT_ANDINA_ORINOQUIA,
      ...INT_ORINOQUIA_AMAZONIA.slice(1),
      ...EXT_ORINOQUIA_BORDERS.slice(1, -1),
    ],
    lightFill: '#edd19c',
    lightStroke: '#c49d59',
    darkFill: '#382d1b',
    darkStroke: '#755c34',
    legendColor: '#d97706',
  },
  {
    id: 'Amazonía',
    name: 'Región Amazonía',
    shortDesc: 'Selva húmeda amazónica, tepuyes de Chiribiquete y grandes ríos',
    labelCoords: [-72.15, 0.45],
    polygon: [
      ...INT_ANDINA_AMAZONIA,
      ...EXT_AMAZONIA_BORDERS.slice(1),
      ...reverseCoords(INT_ORINOQUIA_AMAZONIA.slice(1, -1)),
    ],
    lightFill: '#8ac799',
    lightStroke: '#509664',
    darkFill: '#123121',
    darkStroke: '#2d6848',
    legendColor: '#15803d',
  },
];

// Full outer continental silhouette of Colombia
export const COLOMBIA_CONTINENTAL_OUTLINE: ReadonlyArray<readonly [number, number]> = [
  ...EXT_CARIBE_COAST_AND_PERIJA,
  ...reverseCoords(EXT_ANDINA_VENEZUELA.slice(0, -1)),
  ...reverseCoords(EXT_ORINOQUIA_BORDERS.slice(0, -1)),
  ...reverseCoords(EXT_AMAZONIA_BORDERS.slice(0, -1)),
  ...reverseCoords(EXT_ECUADOR_ANDES.slice(0, -1)),
  ...reverseCoords(EXT_DARIEN_AND_PACIFIC_COAST.slice(1, -1)),
];

// Insular sanctuaries & archipelagos (Región Insular)
export interface InsularLocation {
  id: string;
  name: string;
  sublabel: string;
  lat: number;
  lng: number;
  haloRadius: number;
  islandPathOffset: string;
}

export const COLOMBIA_INSULAR_LOCATIONS: InsularLocation[] = [
  {
    id: 'san-andres-providencia',
    name: 'San Andrés y Providencia',
    sublabel: 'Reserva de Biosfera Seaflower',
    lat: 12.58,
    lng: -81.70,
    haloRadius: 20,
    islandPathOffset: 'M -3,-6 C 1,-7 3,-3 2,2 C 1,6 -2,7 -3,4 C -4,0 -4,-4 -3,-6 Z M 11,-24 C 14,-25 16,-22 14,-19 C 12,-17 10,-19 11,-24 Z',
  },
  {
    id: 'isla-gorgona',
    name: 'PNN Isla Gorgona',
    sublabel: 'Pacífico Caucano',
    lat: 2.9656,
    lng: -78.1792,
    haloRadius: 15,
    islandPathOffset: 'M -2,-5 C 2,-5 3,-1 2,4 C 0,6 -3,5 -3,1 C -3,-2 -3,-4 -2,-5 Z',
  },
  {
    id: 'isla-malpelo',
    name: 'SFF Isla de Malpelo',
    sublabel: 'Santuario Oceánico Pacífico',
    lat: 3.9833,
    lng: -81.6000,
    haloRadius: 16,
    islandPathOffset: 'M -3,-3 L 2,-4 L 4,1 L 0,4 L -4,2 Z',
  },
];

// Neighboring country context polygons for unmistakable geographic framing
export interface NeighborCountryGeo {
  name: string;
  labelCoords: readonly [number, number];
  polygon: ReadonlyArray<readonly [number, number]>;
}

export const NEIGHBOR_COUNTRIES_GEO: NeighborCountryGeo[] = [
  {
    name: 'PANAMÁ',
    labelCoords: [-79.15, 8.95],
    polygon: [
      [-82.2, 9.25],
      [-80.8, 9.05],
      [-79.55, 9.55],
      [-78.15, 9.25],
      [-77.36, 8.68],
      [-77.48, 8.32],
      [-77.32, 7.92],
      [-77.52, 7.55],
      [-77.88, 7.22],
      [-78.35, 7.55],
      [-78.45, 8.35],
      [-79.55, 8.92],
      [-80.55, 8.15],
      [-82.2, 8.25],
    ],
  },
  {
    name: 'VENEZUELA',
    labelCoords: [-69.15, 9.15],
    polygon: [
      [-71.32, 11.85],
      [-71.55, 11.15],
      [-71.95, 9.85], // Lago de Maracaibo oeste
      [-71.15, 9.25], // Lago de Maracaibo sur
      [-71.05, 10.65], // Maracaibo este
      [-70.25, 11.95], // Paraguaná
      [-68.25, 10.65],
      [-65.8, 10.65],
      [-65.8, 0.85],
      [-66.85, 1.23],
      [-67.12, 2.15],
      [-67.38, 2.85],
      [-67.85, 3.88],
      ...EXT_ORINOQUIA_BORDERS.slice(1),
      ...EXT_ANDINA_VENEZUELA.slice(1),
      [-73.02, 9.85],
      [-72.92, 10.35],
      [-72.78, 10.75],
      [-72.32, 11.15],
      [-71.88, 11.50],
    ],
  },
  {
    name: 'ECUADOR',
    labelCoords: [-78.85, -0.55],
    polygon: [
      [-78.84, 1.44],
      [-78.42, 1.18],
      [-77.95, 0.83],
      [-77.64, 0.81],
      [-77.15, 0.42],
      [-76.85, 0.25],
      [-76.38, 0.36],
      [-75.75, 0.12],
      [-75.25, -0.12],
      [-75.85, -1.25],
      [-77.55, -2.55],
      [-80.15, -3.25],
      [-80.95, -2.15],
      [-80.75, -0.95],
      [-80.05, 0.35],
      [-79.65, 0.95],
    ],
  },
  {
    name: 'PERÚ',
    labelCoords: [-73.85, -3.35],
    polygon: [
      [-75.25, -0.12],
      [-74.78, -0.19],
      [-74.22, -0.62],
      [-73.68, -1.22],
      [-73.21, -1.75],
      [-72.52, -2.05],
      [-71.75, -2.14],
      [-70.95, -2.35],
      [-70.12, -2.62],
      [-69.74, -2.89],
      [-70.25, -3.52],
      [-70.42, -3.78],
      [-70.26, -3.82],
      [-69.94, -4.22],
      [-70.55, -4.85],
      [-78.55, -4.85],
      [-77.55, -2.55],
      [-75.85, -1.25],
    ],
  },
  {
    name: 'BRASIL',
    labelCoords: [-67.65, -1.85],
    polygon: [
      [-66.85, 1.23],
      [-65.8, 0.85],
      [-65.8, -4.85],
      [-70.55, -4.85],
      [-69.94, -4.22],
      [-69.95, -3.45],
      [-69.72, -2.92],
      [-69.43, -1.35],
      [-69.45, -1.07],
      [-69.85, -0.45],
      [-70.05, 0.12],
      [-69.82, 0.72],
      [-69.18, 1.08],
      [-68.35, 1.65],
      [-67.55, 1.68],
      [-67.08, 1.98],
    ],
  },
];

// Major Colombian Rivers for educational hydrographic reference
export interface RiverGeo {
  name: string;
  coords: ReadonlyArray<readonly [number, number]>;
}

export const COLOMBIA_RIVERS_GEO: RiverGeo[] = [
  {
    name: 'Río Magdalena',
    coords: [
      [-76.55, 1.92], // Macizo Colombiano
      [-75.88, 2.45],
      [-75.28, 2.95], // Neiva
      [-74.80, 4.30], // Girardot
      [-74.65, 5.45], // La Dorada
      [-74.40, 6.45], // Puerto Berrío
      [-73.88, 7.10], // Barrancabermeja
      [-73.95, 8.95], // El Banco / Mompox
      [-74.78, 10.25],
      [-74.80, 11.08], // Bocas de Ceniza
    ],
  },
  {
    name: 'Río Cauca',
    coords: [
      [-76.62, 2.15],
      [-76.52, 3.45], // Cali
      [-75.95, 4.75], // Cartago
      [-75.78, 5.95], // Santa Fe de Antioquia
      [-75.25, 7.55], // Caucasia
      [-74.48, 8.92], // Confluencia con Magdalena
    ],
  },
  {
    name: 'Río Meta',
    coords: [
      [-73.45, 4.10],
      [-72.55, 4.45],
      [-71.25, 5.25],
      [-69.55, 6.08],
      [-67.48, 6.19],
    ],
  },
  {
    name: 'Río Guaviare',
    coords: [
      [-73.85, 2.85],
      [-72.65, 2.58],
      [-70.85, 3.05],
      [-67.85, 3.88],
    ],
  },
  {
    name: 'Río Caquetá',
    coords: [
      [-76.55, 1.75],
      [-75.45, 1.12],
      [-73.85, 0.25],
      [-72.15, -0.65],
      [-69.43, -1.35],
    ],
  },
];

// Subtle Cordillera ridge lines (Occidental, Central, Oriental & Sierra Nevada)
export const COLOMBIA_CORDILLERAS_GEO: ReadonlyArray<ReadonlyArray<readonly [number, number]>> = [
  // Cordillera Occidental
  [
    [-77.65, 1.35],
    [-76.95, 2.65],
    [-76.65, 3.75],
    [-76.25, 5.25],
    [-76.15, 6.85],
  ],
  // Cordillera Central
  [
    [-76.65, 1.85],
    [-76.15, 3.15],
    [-75.42, 4.65],
    [-75.35, 6.15],
    [-74.85, 7.35],
  ],
  // Cordillera Oriental
  [
    [-76.15, 1.75],
    [-74.75, 3.25],
    [-73.95, 4.65],
    [-73.15, 5.85],
    [-72.65, 7.15],
    [-73.10, 8.75],
  ],
  // Sierra Nevada de Santa Marta
  [
    [-74.05, 10.75],
    [-73.68, 10.85],
    [-73.52, 11.05],
  ],
];
