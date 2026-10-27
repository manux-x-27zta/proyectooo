import { Species } from '../types';

export interface SpeciesCardTheme {
  gradient: string;
  border: string;
  badgeBg: string;
  buttonBg: string;
  accentText: string;
  posterAccentHex: string;
  specialFeature: string;
}

export function getConservationLabel(status: Species['conservationStatus']): string {
  switch (status) {
    case 'CR':
      return 'En Peligro Crítico (CR)';
    case 'EN':
      return 'En Peligro (EN)';
    case 'VU':
      return 'Vulnerable (VU)';
    case 'NT':
      return 'Casi Amenazada (NT)';
    default:
      return 'Preocupación Menor (LC)';
  }
}

export function getSpeciesCardTheme(sp: Species): SpeciesCardTheme {
  switch (sp.id) {
    case 'anolis-gorgonae':
      return {
        gradient: 'from-sky-500/20 via-cyan-500/10 to-transparent',
        border: 'border-sky-400/40 hover:border-sky-400',
        badgeBg: 'bg-sky-500 text-stone-950 font-black',
        buttonBg: 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-950/40',
        accentText: 'text-sky-600 dark:text-sky-400',
        posterAccentHex: '#0284c7',
        specialFeature:
          'Es el único lagarto 100% azul cielo del planeta Tierra; machos y hembras tienen esta coloración pura.',
      };
    case 'saguinus-oedipus':
      return {
        gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
        border: 'border-amber-400/40 hover:border-amber-400',
        badgeBg: 'bg-amber-500 text-stone-950 font-black',
        buttonBg: 'bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold shadow-amber-950/40',
        accentText: 'text-amber-600 dark:text-amber-400',
        posterAccentHex: '#d97706',
        specialFeature:
          'Su cresta blanca de pelo sedoso y su rol como jardinero regenerador del amenazado bosque seco caribeño.',
      };
    case 'pristimantis-supatus':
      return {
        gradient: 'from-yellow-500/20 via-amber-500/10 to-transparent',
        border: 'border-yellow-400/40 hover:border-yellow-400',
        badgeBg: 'bg-yellow-400 text-stone-950 font-black',
        buttonBg: 'bg-yellow-500 hover:bg-yellow-400 text-stone-950 font-bold shadow-yellow-950/40',
        accentText: 'text-yellow-600 dark:text-yellow-400',
        posterAccentHex: '#b45309',
        specialFeature:
          'Brillo metálico dorado y desarrollo directo: nunca pasa por renacuajo, nace como ranita completa.',
      };
    case 'pyrrhura-calliptera':
      return {
        gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
        border: 'border-emerald-400/40 hover:border-emerald-400',
        badgeBg: 'bg-emerald-500 text-white font-black',
        buttonBg: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40',
        accentText: 'text-emerald-600 dark:text-emerald-400',
        posterAccentHex: '#15803d',
        specialFeature:
          'Alas con espejo amarillo azufre y adaptación al frío de páramo a más de 3.000 metros alimentándose de frailejones.',
      };
    case 'phyllobates-terribilis':
      return {
        gradient: 'from-amber-400/25 via-yellow-500/10 to-transparent',
        border: 'border-yellow-400/50 hover:border-yellow-300',
        badgeBg: 'bg-yellow-400 text-stone-950 font-black',
        buttonBg: 'bg-yellow-500 hover:bg-yellow-400 text-stone-950 font-bold shadow-yellow-950/40',
        accentText: 'text-yellow-600 dark:text-yellow-400',
        posterAccentHex: '#b45309',
        specialFeature:
          'El vertebrado más venenoso del planeta: un solo ejemplar segrega suficiente batracotoxina para abatir a 10 personas adultas.',
      };
    case 'diploglossus-millepunctatus':
      return {
        gradient: 'from-slate-600/20 via-cyan-500/10 to-transparent',
        border: 'border-cyan-500/40 hover:border-cyan-400',
        badgeBg: 'bg-cyan-600 text-white font-black',
        buttonBg: 'bg-cyan-700 hover:bg-cyan-600 text-white shadow-cyan-950/40',
        accentText: 'text-cyan-600 dark:text-cyan-400',
        posterAccentHex: '#0e7490',
        specialFeature:
          'Confinado a la formación rocosa de la Isla de Malpelo: un lagarto negro con miles de puntos que puede zambullirse y bucear en el mar.',
      };
    case 'plecturocebus-ornatus':
      return {
        gradient: 'from-orange-500/20 via-amber-500/10 to-transparent',
        border: 'border-orange-400/40 hover:border-orange-400',
        badgeBg: 'bg-orange-500 text-white font-black',
        buttonBg: 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-950/40',
        accentText: 'text-orange-600 dark:text-orange-400',
        posterAccentHex: '#c2410c',
        specialFeature:
          'Endémico estricto del piedemonte en el Meta: primate cobrizo con diadema blanca que canta a dúo con su pareja de por vida.',
      };
    case 'marmosops-handleyi':
      return {
        gradient: 'from-amber-700/20 via-stone-500/10 to-transparent',
        border: 'border-amber-600/40 hover:border-amber-500',
        badgeBg: 'bg-amber-700 text-white font-black',
        buttonBg: 'bg-amber-800 hover:bg-amber-700 text-white shadow-amber-950/40',
        accentText: 'text-amber-700 dark:text-amber-400',
        posterAccentHex: '#92400e',
        specialFeature:
          'Pequeño marsupial arbóreo de ojos gigantes nocturnos localizado en bosques nublados hiper-reducidos de Antioquia.',
      };
    case 'chlorostilbon-olivaresi':
      return {
        gradient: 'from-emerald-600/20 via-cyan-500/10 to-transparent',
        border: 'border-emerald-400/40 hover:border-emerald-300',
        badgeBg: 'bg-emerald-600 text-white font-black',
        buttonBg: 'bg-emerald-700 hover:bg-emerald-600 text-white shadow-emerald-950/40',
        accentText: 'text-emerald-600 dark:text-emerald-400',
        posterAccentHex: '#047857',
        specialFeature:
          'Confinado a los tepuyes milenarios y formaciones rocosas de la Serranía de Chiribiquete en la Amazonía.',
      };
    case 'crax-alberti':
      return {
        gradient: 'from-sky-600/20 via-blue-500/10 to-transparent',
        border: 'border-sky-400/40 hover:border-sky-400',
        badgeBg: 'bg-sky-600 text-white font-black',
        buttonBg: 'bg-sky-700 hover:bg-sky-600 text-white shadow-sky-950/40',
        accentText: 'text-sky-600 dark:text-sky-400',
        posterAccentHex: '#0369a1',
        specialFeature:
          'Pico adornado con cera azul brillante y canto gutural de baja frecuencia que retumba como trueno en el valle del Magdalena.',
      };
    case 'coeligena-prunellei':
      return {
        gradient: 'from-indigo-600/20 via-blue-500/10 to-transparent',
        border: 'border-indigo-400/40 hover:border-indigo-400',
        badgeBg: 'bg-indigo-600 text-white font-black',
        buttonBg: 'bg-indigo-700 hover:bg-indigo-600 text-white shadow-indigo-950/40',
        accentText: 'text-indigo-600 dark:text-indigo-400',
        posterAccentHex: '#4338ca',
        specialFeature:
          'Solo existe en la vertiente occidental de la Cordillera Oriental: plumaje negro terciopelo con hombros azul cobalto relucientes.',
      };
    case 'ognorhynchus-icterotis':
      return {
        gradient: 'from-yellow-500/20 via-emerald-500/10 to-transparent',
        border: 'border-yellow-400/40 hover:border-yellow-400',
        badgeBg: 'bg-yellow-500 text-stone-950 font-black',
        buttonBg: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40',
        accentText: 'text-yellow-600 dark:text-yellow-400',
        posterAccentHex: '#15803d',
        specialFeature:
          'Su vida entera depende estrictamente de las palmas de cera: duerme, anida y se alimenta exclusivamente de ellas.',
      };
    case 'espeletia-perijaensis':
      return {
        gradient: 'from-emerald-500/20 via-stone-400/10 to-transparent',
        border: 'border-emerald-400/40 hover:border-emerald-400',
        badgeBg: 'bg-emerald-600 text-white font-black',
        buttonBg: 'bg-emerald-700 hover:bg-emerald-600 text-white shadow-emerald-950/40',
        accentText: 'text-emerald-600 dark:text-emerald-400',
        posterAccentHex: '#047857',
        specialFeature:
          'Endémico exclusivo de los páramos de la Serranía del Perijá en el Cesar: roseta plateada que resiste heladas en el extremo norte.',
      };
    case 'odontoglossum-luteopurpureum':
      return {
        gradient: 'from-purple-500/20 via-amber-500/10 to-transparent',
        border: 'border-amber-400/40 hover:border-amber-400',
        badgeBg: 'bg-amber-500 text-stone-950 font-black',
        buttonBg: 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-950/40',
        accentText: 'text-purple-600 dark:text-purple-400',
        posterAccentHex: '#7e22ce',
        specialFeature:
          'Orquídea descubierta durante la Real Expedición Botánica de Mutis que crece en los altiplanos de la Cordillera Oriental.',
      };
    case 'ceroxylon-quindiuense':
      return {
        gradient: 'from-emerald-600/20 via-teal-500/10 to-transparent',
        border: 'border-emerald-500/40 hover:border-emerald-400',
        badgeBg: 'bg-emerald-600 text-white font-black',
        buttonBg: 'bg-emerald-700 hover:bg-emerald-600 text-white shadow-emerald-950/40',
        accentText: 'text-emerald-600 dark:text-emerald-400',
        posterAccentHex: '#047857',
        specialFeature:
          'Árbol Nacional de Colombia: La palma monocotiledónea más alta de la Tierra, alcanzando hasta 60 metros en los Andes.',
      };
    case 'gecarcinus-ruricola':
      return {
        gradient: 'from-rose-600/20 via-amber-500/10 to-transparent',
        border: 'border-rose-500/40 hover:border-rose-400',
        badgeBg: 'bg-sky-500 text-stone-950 font-black',
        buttonBg: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/40',
        accentText: 'text-rose-600 dark:text-rose-400',
        posterAccentHex: '#be123c',
        specialFeature:
          'Es un cangrejo terrestre de colores vibrantes (negro, rojo y amarillo) que domina los suelos de los bosques secos de las islas.',
      };
    case 'mutisia-clematis':
      return {
        gradient: 'from-red-600/20 via-orange-500/10 to-transparent',
        border: 'border-red-500/40 hover:border-red-400',
        badgeBg: 'bg-red-600 text-white font-black',
        buttonBg: 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/40',
        accentText: 'text-red-600 dark:text-red-400',
        posterAccentHex: '#b91c1c',
        specialFeature:
          'Es una planta trepadora endémica de la Cordillera Oriental con vistosas flores colgantes de color rojo encendido que alimentan a colibríes altoandinos.',
      };
    case 'oxypogon-stuebelii':
      return {
        gradient: 'from-violet-600/20 via-amber-500/10 to-transparent',
        border: 'border-violet-400/40 hover:border-violet-400',
        badgeBg: 'bg-violet-600 text-white font-black',
        buttonBg: 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-950/40',
        accentText: 'text-violet-600 dark:text-violet-400',
        posterAccentHex: '#6d28d9',
        specialFeature:
          'Es un colibrí exclusivo de la zona de volcanes de la Cordillera Central, adaptado a vivir a más de 3.800 metros de altitud.',
      };
    case 'magnolia-wolfii':
      return {
        gradient: 'from-teal-600/20 via-emerald-500/10 to-transparent',
        border: 'border-teal-400/40 hover:border-teal-400',
        badgeBg: 'bg-teal-600 text-white font-black',
        buttonBg: 'bg-teal-700 hover:bg-teal-600 text-white shadow-teal-950/40',
        accentText: 'text-teal-600 dark:text-teal-400',
        posterAccentHex: '#0f766e',
        specialFeature:
          'Es un árbol gigante de flores blancas y maderas finas del que solo se conocen unos pocos ejemplares vivos en todo el planeta.',
      };
    case 'centrolene-buckleyi-chingaza':
      return {
        gradient: 'from-lime-500/20 via-emerald-500/10 to-transparent',
        border: 'border-lime-400/40 hover:border-lime-400',
        badgeBg: 'bg-lime-500 text-stone-950 font-black',
        buttonBg: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40',
        accentText: 'text-emerald-600 dark:text-emerald-400',
        posterAccentHex: '#15803d',
        specialFeature:
          'Una rana de alta montaña cuya piel del vientre es tan delgada y transparente que permite ver sus órganos internos y el latido de su corazón.',
      };
    default:
      return {
        gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
        border: 'border-emerald-400/40 hover:border-emerald-400',
        badgeBg: 'bg-emerald-500 text-white font-black',
        buttonBg: 'bg-emerald-600 hover:bg-emerald-500 text-white',
        accentText: 'text-emerald-600 dark:text-emerald-400',
        posterAccentHex: '#196b44',
        specialFeature:
          sp.projectSpotlightReason || sp.characteristics[0] || 'Especie emblemática de Colombia.',
      };
  }
}
