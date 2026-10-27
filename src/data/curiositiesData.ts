import anolisCuriosityImg from '../assets/images/regenerated_image_1792170099327.jpg';
import titiCuriosityImg from '../assets/images/regenerated_image_1792170099617.jpg';
import supataCuriosityImg from '../assets/images/regenerated_image_1792170100464.jpg';
import pericoCuriosityImg from '../assets/images/regenerated_image_1792170100683.jpg';

export interface Curiosity {
  id: string;
  speciesName: string;
  scientificName: string;
  shortHook: string;
  fullStory: string;
  imageUrl: string;
  iconType: 'lizard' | 'monkey' | 'frog' | 'bird' | 'plant';
  badge: string;
  accentColor: string;
}

export const CURIOSITIES_DATA: Curiosity[] = [
  {
    id: 'curiosity-anolis',
    speciesName: 'Lagarto Azul de Gorgona',
    scientificName: 'Anolis gorgonae',
    shortHook: '¿Por qué es el único lagarto del mundo 100% azul celeste?',
    fullStory: 'Mientras casi todos los reptiles del planeta se camuflan con verdes o marrones para esconderse de depredadores, este lagarto evolucionó un azul eléctrico resplandeciente en el dosel de la Isla Gorgona. Los machos despliegan una papera gular de color blanco brillante para comunicarse y delimitar su territorio entre las ramas.',
    imageUrl: anolisCuriosityImg,
    iconType: 'lizard',
    badge: 'Único en el Mundo',
    accentColor: 'from-sky-500 to-cyan-600',
  },
  {
    id: 'curiosity-titi',
    speciesName: 'Tití Cabeciblanco',
    scientificName: 'Saguinus oedipus',
    shortHook: 'Las familias son matriarcales y el padre cuida a los gemelos.',
    fullStory: 'En los grupos de titíes del Caribe colombiano manda la hembra líder. Ella es la única que tiene crías en el grupo, y cuando nacen gemelos, es el macho padre y los hermanos mayores quienes los cargan en la espalda durante todo el día, pasándoselos a la madre únicamente para amamantar.',
    imageUrl: titiCuriosityImg,
    iconType: 'monkey',
    badge: 'Comportamiento Social',
    accentColor: 'from-amber-500 to-orange-600',
  },
  {
    id: 'curiosity-supata',
    speciesName: 'Rana Dorada de Supatá',
    scientificName: 'Pristimantis supatus',
    shortHook: '¡No pone renacuajos! De sus huevos nacen ranitas formadas.',
    fullStory: 'A diferencia de las ranas comunes que necesitan lagunas o ríos para desovar y tienen renacuajos nadadores, esta diminuta rana dorada de Cundinamarca tiene "desarrollo directo": pone sus huevos en musgos y bromelias húmedas en el bosque de niebla, y al eclosionar sale una ranita miniatura completamente formada de apenas 3 milímetros.',
    imageUrl: supataCuriosityImg,
    iconType: 'frog',
    badge: 'Adaptación Extrema',
    accentColor: 'from-yellow-400 to-amber-500',
  },
  {
    id: 'curiosity-perico',
    speciesName: 'Perico del Sol / Aliamarillo',
    scientificName: 'Pyrrhura calliptera',
    shortHook: 'Un loro que soporta el frío extremo del páramo comiendo frailejones.',
    fullStory: 'La mayoría de personas asocia los loros con tierras calientes y selvas bajas, pero este perico endémico de Colombia vive a más de 3.000 metros de altura en Chingaza, soportando temperaturas bajo cero. Su alimento favorito son los frutos y semillas del frailejón, convirtiéndose en el principal reforestador alado de los páramos andinos.',
    imageUrl: pericoCuriosityImg,
    iconType: 'bird',
    badge: 'Loro de las Alturas',
    accentColor: 'from-emerald-500 to-teal-600',
  },
];
