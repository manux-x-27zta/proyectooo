import React, { useState } from 'react';
import { 
  Camera, 
  X, 
  Maximize2, 
  Sparkles, 
  Info,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import gallery1 from '../assets/images/regenerated_image_1792170100856.jpg';
import gallery2 from '../assets/images/regenerated_image_1792170101020.jpg';
import gallery3 from '../assets/images/regenerated_image_1792170101370.jpg';
import gallery4 from '../assets/images/regenerated_image_1792170101636.jpg';
import gallery5 from '../assets/images/regenerated_image_1792170101931.jpg';
import gallery6 from '../assets/images/regenerated_image_1792170102104.jpg';
import gallery7 from '../assets/images/regenerated_image_1792170102245.jpg';
import gallery8 from '../assets/images/regenerated_image_1792170102481.webp';
import gallery9 from '../assets/images/regenerated_image_1792434180438.jpg';
import gallery10 from '../assets/images/regenerated_image_1792434180714.jpg';
import gallery11 from '../assets/images/regenerated_image_1792434180882.jpg';
import gallery12 from '../assets/images/regenerated_image_1792434181031.jpg';
import gallery13 from '../assets/images/regenerated_image_1792434181578.jpg';
import gallery14 from '../assets/images/regenerated_image_1792434181862.jpg';
import gallery15 from '../assets/images/real_gecarcinus_ruricola_gallery.jpg';
import gallery16 from '../assets/images/real_mutisia_clematis_gallery.jpg';
import gallery17 from '../assets/images/real_oxypogon_stuebelii_gallery.jpg';
import gallery18 from '../assets/images/real_magnolia_wolfii_gallery.jpg';
import gallery19 from '../assets/images/real_centrolene_buckleyi_gallery.jpg';

interface PhotoItem {
  id: string;
  title: string;
  category: 'Fauna' | 'Flora' | 'Ecosistema';
  location: string;
  url: string;
  description: string;
  objectPositionClass?: string;
}

const GALLERY_PHOTOS: PhotoItem[] = [
  {
    id: 'g-1',
    title: 'Lagarto Azul en el Dosel de Gorgona',
    category: 'Fauna',
    location: 'PNN Isla Gorgona, Pacífico Colombiano',
    url: gallery1,
    description: 'Anolis gorgonae asoleándose en el tronco de una palma húmeda insular. Su coloración azul celeste puro no existe en ningún otro reptil del mundo.',
  },
  {
    id: 'g-2',
    title: 'Familia de Titíes Cabeciblancos',
    category: 'Fauna',
    location: 'SFF Los Colorados, Montes de María, Bolívar',
    url: gallery2,
    description: 'Saguinus oedipus en el dosel del bosque seco tropical. El macho padre transporta a las crías en la espalda durante sus recorridos diarios.',
  },
  {
    id: 'g-3',
    title: 'Páramo de Chingaza y Frailejones',
    category: 'Ecosistema',
    location: 'Cundinamarca y Meta, Cordillera Oriental',
    url: gallery3,
    description: 'Las altas cumbres andinas de Colombia donde los frailejones gigantes (Espeletia) atrapan la niebla para formar ríos y lagunas sagradas.',
  },
  {
    id: 'g-4',
    title: 'Rana Dorada en Hoja Húmeda',
    category: 'Fauna',
    location: 'Bosques de Niebla de Supatá, Cundinamarca',
    url: gallery4,
    description: 'Pristimantis supatus brillando con sus tonos cobrizos y ojos saltones en un microhábitat que no supera los 20 kilómetros cuadrados.',
  },
  {
    id: 'g-5',
    title: 'Perico del Sol entre Ramas de Alta Montaña',
    category: 'Fauna',
    location: 'Ecotonos de Subpáramo, Chingaza',
    url: gallery5,
    description: 'Pyrrhura calliptera exhibiendo sus plumas alares amarillas. Es uno de los pocos loros del planeta adaptados al frío cercano a los cero grados.',
  },
  {
    id: 'g-6',
    title: 'Orquídea Flor de Mayo en Floración',
    category: 'Flora',
    location: 'Cuenca del Alto Magdalena, Huila y Tolima',
    url: gallery6,
    description: 'Cattleya trianae, flor nacional de Colombia, epífita que crece en las horquetas de grandes árboles sin parasitarlos.',
  },
  {
    id: 'g-7',
    title: 'Selva Pluvial y Cascadas del Chocó',
    category: 'Ecosistema',
    location: 'Serranía del Baudó, Chocó Biogeográfico',
    url: gallery7,
    description: 'Uno de los rincones más lluviosos y biodiversos de la Tierra, donde nacen ríos caudalosos que desembocan en el Pacífico.',
  },
  {
    id: 'g-8',
    title: 'Rana de Cristal con Vientre Translúcido',
    category: 'Fauna',
    location: 'Cuenca del Río Quindío, Eje Cafetero',
    url: gallery8,
    description: 'Centrolene quindianum cuidando sus huevos sobre una hoja colgante encima de una quebrada torrentosa no contaminada.',
  },
  {
    id: 'g-9',
    title: 'Palmas de Cera en el Valle de Cocora',
    category: 'Flora',
    location: 'Salento, Quindío, Cordillera Central',
    url: gallery9,
    description: 'Ceroxylon quindiuense, el árbol nacional de Colombia y la palma más alta del mundo, elevándose hasta 60 metros entre la niebla andina.',
  },
  {
    id: 'g-10',
    title: 'Rana Venenosa Dorada en el Suelo Selvático',
    category: 'Fauna',
    location: 'Timbiquí, Costa Pacífica Caucana',
    url: gallery10,
    description: 'Phyllobates terribilis con su color amarillo aposemático que advierte a cualquier depredador de la batracotoxina que alberga en su piel.',
  },
  {
    id: 'g-11',
    title: 'Tángara Multicolor en el Dosel',
    category: 'Fauna',
    location: 'San Antonio / Kilómetro 18, Valle del Cauca',
    url: gallery11,
    description: 'Chlorochrysa nitidissima, una de las aves más llamativas del planeta con siete tonalidades vivas en su plumaje, endémica de Colombia.',
  },
  {
    id: 'g-12',
    title: 'Colibrí del Sol Libando en Alta Montaña',
    category: 'Fauna',
    location: 'Páramo de Frontino, Urrao, Antioquia',
    url: gallery12,
    description: 'Coeligena orina con su deslumbrante gorguera azul zafiro, adaptado al frío extremo de las cumbres occidentales.',
  },
  {
    id: 'g-13',
    title: 'Tití del Caquetá en Bosque Amazónico',
    category: 'Fauna',
    location: 'Cuenca del Río Orteguaza, Florencia, Caquetá',
    url: gallery13,
    description: 'Plecturocebus caquetensis, primate monógamo descubierto en 2010 que entrelaza su cola con la de su pareja para dormir.',
  },
  {
    id: 'g-14',
    title: 'Río Magdalena y Llanura Aluvial',
    category: 'Ecosistema',
    location: 'Barrancabermeja, Santander, Magdalena Medio',
    url: gallery14,
    description: 'La gran arteria fluvial de Colombia, hábitat del Bagre Rayado (Pseudoplatystoma magdaleniatum) y escenario de la legendaria subienda.',
  },
  {
    id: 'g-15',
    title: 'Cangrejo de Tierra de San Andrés',
    category: 'Fauna',
    location: 'Archipiélago de San Andrés, Providencia y Santa Catalina',
    url: gallery15,
    description: 'Gecarcinus ruricola recorriendo el bosque seco insular con sus vibrantes tonos negro, rojo y amarillo antes de su migración reproductiva hacia el mar.',
  },
  {
    id: 'g-16',
    title: 'Habas de la Sabana / Mutisia en Flor',
    category: 'Flora',
    location: 'Bosques Altoandinos de la Sabana de Bogotá y Boyacá',
    url: gallery16,
    description: 'Mutisia clematis, enredadera endémica recolectada por José Celestino Mutis en 1764 cuyas flores colgantes rojo encendido alimentan colibríes de altura.',
    objectPositionClass: 'object-[50%_56%]',
  },
  {
    id: 'g-17',
    title: 'Chivito de los Páramos sobre Frailejón',
    category: 'Fauna',
    location: 'Parque Nacional Natural Los Nevados, Cordillera Central',
    url: gallery17,
    description: 'Oxypogon stuebelii exhibiendo su cresta y su barba morada y blanca a más de 3.800 metros de altitud en los páramos volcánicos.',
  },
  {
    id: 'g-18',
    title: 'Floración del Magnolio del Valle',
    category: 'Flora',
    location: 'Bosques premontañosos de Risaralda (Municipio de Marsella)',
    url: gallery18,
    description: 'Magnolia wolfii en Peligro Crítico (CR), árbol gigante cuyos contados ejemplares silvestres son polinizados manualmente por científicos locales.',
    objectPositionClass: 'object-[50%_56%]',
  },
  {
    id: 'g-19',
    title: 'Rana de Cristal de Chingaza',
    category: 'Fauna',
    location: 'Parque Nacional Natural Chingaza, Cundinamarca',
    url: gallery19,
    description: 'Centrolene buckleyi sobre una hoja húmeda encima de una quebrada cristalina de alta montaña, mostrando su delicada piel ventral translúcida.',
  },
];

interface PhotoGalleryModalProps {
  isDarkMode: boolean;
}

export const PhotoGalleryModal: React.FC<PhotoGalleryModalProps> = ({ isDarkMode }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [filter, setFilter] = useState<'all' | 'Fauna' | 'Flora' | 'Ecosistema'>('all');

  const filtered = filter === 'all' 
    ? GALLERY_PHOTOS 
    : GALLERY_PHOTOS.filter(p => p.category === filter);

  return (
    <section id="galeria" className="space-y-8 scroll-mt-20">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md">
          <Camera className="w-4 h-4" />
          <span>Galería Inmersiva</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#163e2a] dark:text-white">
          Tesoros visuales de Colombia
        </h2>

        <p className={`text-sm sm:text-base leading-relaxed ${
          isDarkMode ? 'text-stone-300' : 'text-stone-600'
        }`}>
          Haz clic en cualquier imagen para ampliarla y leer sobre su hábitat y características.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-2 text-xs font-bold">
        {(['all', 'Fauna', 'Flora', 'Ecosistema'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-2xl transition-all cursor-pointer ${
              filter === f
                ? 'bg-[#196b44] text-white shadow-md'
                : isDarkMode ? 'bg-[#12221b] text-stone-400' : 'bg-white text-stone-600 shadow-sm'
            }`}
          >
            {f === 'all' ? 'Ver Todas' : f}
          </button>
        ))}
      </div>

      {/* Modern Image Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedPhoto(item)}
            className="group relative h-64 rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all hover:scale-[1.02]"
          >
            <img
              src={item.url}
              alt={item.title}
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${item.objectPositionClass ?? ''}`}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

            <div className="absolute top-3 left-3">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-black/60 text-emerald-300 backdrop-blur-md">
                {item.category}
              </span>
            </div>

            <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white">
              <h4 className="font-extrabold text-sm sm:text-base leading-tight drop-shadow-md">{item.title}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-4xl w-full rounded-3xl overflow-hidden shadow-2xl bg-[#0f1a14] border border-emerald-500/40 text-white">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative max-h-[65vh] overflow-hidden flex items-center justify-center bg-black">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                className="max-h-[65vh] w-auto object-contain"
              />
            </div>

            <div className="p-6 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase px-3 py-0.5 rounded-full bg-emerald-600 text-white">
                  {selectedPhoto.category}
                </span>
              </div>
              <h3 className="text-xl font-black">{selectedPhoto.title}</h3>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                {selectedPhoto.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
