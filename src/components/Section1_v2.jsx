import React, { useEffect, useRef, useState } from 'react'
import './Section1.css'

// ─── Filtres par continent ───────────────────────────────────────────────────
const CONTINENTS = [
  { id: 'tous',     label: 'Tous' },
  { id: 'westeros', label: 'Westeros' },
  { id: 'essos',    label: 'Essos' },
  { id: 'monde',    label: 'Reste du Monde' },
]

// ─── Génération auto du décor de carte à partir de la couleur d'accent ──────
// (évite de devoir préciser un dégradé/bordure custom pour chaque maison)
const deriveBg     = (accent) => `linear-gradient(135deg, #050403 0%, color-mix(in srgb, ${accent} 13%, #0d0d0d) 55%, #050403 100%)`
const deriveBorder = (accent) => `color-mix(in srgb, ${accent} 32%, #2a2a2a)`

const MAISONS = [
  // ════════════════════════════════════════════════════════════════════════
  // WESTEROS — Les Neuf Grandes Maisons
  // ════════════════════════════════════════════════════════════════════════
  {
    id: 'stark',
    continent: 'westeros',
    name: 'STARK',
    seat: 'Winterfell',
    words: '"L\'Hiver Vient"',
    region: 'Le Nord',
    sigil: 'Loup Garou Gris',
    colors: ['#6b7a8d', '#c8d4e0'],
    accent: '#8fafc4',
    description:
      'Gardiens du Nord, les Stark tracent leur sang jusqu\'aux Premiers Hommes. L\'honneur est leur épée et le vent glacé leur étendard. Ils endurent là où les autres tombent — patients comme l\'hiver lui-même.',
    sigil_url: '/images/Westeros/Maison Principal Westeros/stark.jpg',
    bg: 'linear-gradient(135deg, #0d1117 0%, #1a2332 60%, #0d1117 100%)',
    borderColor: '#4a6380',
  },
  {
    id: 'lannister',
    continent: 'westeros',
    name: 'LANNISTER',
    seat: 'Casterly Rock',
    words: '"Entends-Moi Rugir"',
    region: 'Les Terres de l\'Ouest',
    sigil: 'Lion d\'Or',
    colors: ['#c9a84c', '#e8c97a'],
    accent: '#d4a84b',
    description:
      'La maison la plus riche de Westeros. Leur lion ne rugit pas seulement — il dévore. Le pouvoir est leur droit de naissance, l\'or leur langage, et la dette une arme qu\'ils manient avec une précision chirurgicale.',
    sigil_url: '/images/Westeros/Maison Principal Westeros/lannister.jpg',
    bg: 'linear-gradient(135deg, #1a1200 0%, #2a1f00 60%, #1a1200 100%)',
    borderColor: '#7a6130',
  },
  {
    id: 'targaryen',
    continent: 'westeros',
    name: 'TARGARYEN',
    seat: 'Peyredragon',
    words: '"Feu et Sang"',
    region: 'Les Terres de la Couronne',
    sigil: 'Dragon à Trois Têtes',
    colors: ['#c41e3a', '#ff4466'],
    accent: '#c0392b',
    description:
      'Sang de la Vieille Valyria. Ils n\'ont pas conquis Westeros — ils l\'ont soumis par le feu. Chevaucheurs de dragons, bâtisseurs de dynasties, et les derniers d\'un monde consumé par les flammes.',
    sigil_url: '/images/Westeros/Maison Principal Westeros/targaryen.png',
    bg: 'linear-gradient(135deg, #1a0000 0%, #2d0a0a 60%, #1a0000 100%)',
    borderColor: '#7a1a1a',
  },
  {
    id: 'baratheon',
    continent: 'westeros',
    name: 'BARATHEON',
    seat: 'Accalmie',
    words: '"Notre est la Fureur"',
    region: "Les Terres de l'Orage",
    sigil: 'Cerf Noir Couronné',
    colors: ['#e8c97a', '#f5e6c8'],
    accent: '#c9a84c',
    description:
      'Nés des tempêtes, trempés par la bataille. Les Baratheon ont saisi le Trône de Fer non par ruse mais par une volonté de fer et un marteau de guerre. La fureur n\'est pas leur faiblesse — c\'est leur couronne.',
    sigil_url: '/images/Westeros/Maison Principal Westeros/baratheon.webp',
    bg: 'linear-gradient(135deg, #0a0a00 0%, #1f1c00 60%, #0a0a00 100%)',
    borderColor: '#5a5020',
  },
  {
    id: 'greyjoy',
    continent: 'westeros',
    name: 'GREYJOY',
    seat: 'Pyk',
    words: '"Nous Ne Semons Pas"',
    region: 'Les Îles de Fer',
    sigil: 'Kraken Doré',
    colors: ['#d4af37', '#8b8b6b'],
    accent: '#b8a040',
    description:
      'Pillards des mers. Hommes de fer qui ne s\'inclinent devant aucun roi sinon le Dieu Noyé. Ce qu\'ils ne peuvent pas faire, ils le prennent. Ce qu\'ils ne peuvent pas prendre, ils le brûlent. La mer est leur royaume — tout le reste n\'est que butin.',
    sigil_url: '/images/Westeros/Maison Principal Westeros/greyjoy.jpg',
    bg: 'linear-gradient(135deg, #050810 0%, #0a1020 60%, #050810 100%)',
    borderColor: '#3a4a5a',
  },
  {
    id: 'tyrell',
    continent: 'westeros',
    name: 'TYRELL',
    seat: 'Hautjardin',
    words: '"Croître Fort"',
    region: 'Le Bief',
    sigil: 'Rose Dorée',
    colors: ['#4a7c3f', '#7ab648'],
    accent: '#5a9e48',
    description:
      'Les seigneurs les plus riches du Bief, dont les roses nourrissent le royaume. Derrière la beauté et l\'abondance se cache une maison d\'ambition impitoyable — grandissant fort dans les jardins, et encore plus fort dans les complots.',
    sigil_url: '/images/Westeros/Maison Principal Westeros/tyrell.jpg',
    bg: 'linear-gradient(135deg, #030a00 0%, #0a1800 60%, #030a00 100%)',
    borderColor: '#2a4a20',
  },
  {
    id: 'tully',
    continent: 'westeros',
    name: 'TULLY',
    seat: 'Vivesaigues',
    words: '"Famille, Devoir, Honneur"',
    region: 'Les Conflans',
    sigil: 'Truite Sautante',
    accent: '#6a8caf',
    description:
      'Maîtres des rivières, gardiens du confluent. Les Tully ont rallié les Conflans contre les rois dragons et n\'ont jamais oublié qu\'un serment vaut plus qu\'une couronne. Loyaux jusqu\'à la ruine — c\'est leur fierté, et parfois leur malédiction.',
    sigil_url: '/images/Westeros/Maison Principal Westeros/Maison_Tully.webp',
  },
  {
    id: 'arryn',
    continent: 'westeros',
    name: 'ARRYN',
    seat: 'Le Nid d\'Aigle',
    words: '"Aussi Haut Que L\'Honneur"',
    region: 'Le Val d\'Arryn',
    sigil: 'Faucon et Lune',
    accent: '#7fa8c9',
    description:
      'Seigneurs du ciel, juchés sur des montagnes que nul siège n\'a jamais brisées. Les Arryn jugent de haut — au sens propre comme au figuré — et ceux qui franchissent leur Porte de la Lune n\'empruntent jamais le même chemin pour repartir.',
    sigil_url: '/images/Westeros/Maison Principal Westeros/Maison-Arryn-blason.jpg',
  },
  {
    id: 'martell',
    continent: 'westeros',
    name: 'MARTELL',
    seat: 'Lancehélion',
    words: '"Jamais Courbés, Jamais Brisés, Jamais Soumis"',
    region: 'Dorne',
    sigil: 'Soleil Percé d\'une Lance',
    accent: '#e08030',
    description:
      'Seul royaume que les dragons targaryens ne soumirent jamais par la force. Le sable et le soleil ont forgé un peuple fier, retors et patient — la vengeance dornienne se sert toujours froide, mais elle se sert.',
    sigil_url: '/images/Westeros/Maison Principal Westeros/blason-martell-4.jpg',
  },

  // ── Le Nord ─────────────────────────────────────────────────────────────
  {
    id: 'bolton',
    continent: 'westeros',
    name: 'BOLTON',
    seat: 'Fort-Terreur',
    words: '"Nos Lames Sont Acérées"',
    region: 'Le Nord',
    sigil: 'Homme Écorché',
    accent: '#b23a48',
    description: 'Vassaux des Stark à la loyauté glaciale et au passé sanguinaire — on raconte qu\'ils écorchaient autrefois leurs ennemis vaincus.',
    sigil_url: "/images/Westeros/Maison du nord Westeros/Maison_Bolton.png",
  },
  {
    id: 'karstark',
    continent: 'westeros',
    name: 'KARSTARK',
    seat: 'Karhold',
    region: 'Le Nord',
    sigil: 'Soleil Blanc Éclatant',
    accent: '#cfcfcf',
    description: 'Branche éloignée des Stark, fière et intransigeante, dont le soleil blanc brille sur les terres glacées du nord-est.',
    sigil_url: "/images/Westeros/Maison du nord Westeros/Maison_Karstark.png",
  },
  {
    id: 'umber',
    continent: 'westeros',
    name: 'OMBRE (UMBER)',
    seat: 'Dernier Foyer',
    region: 'Le Nord',
    sigil: 'Géant Brisant ses Chaînes',
    accent: '#8a7048',
    description: 'Géants de carrure et de caractère, gardiens de la frontière glacée — leurs chaînes brisées rappellent qu\'aucun joug ne les retient longtemps.',
    sigil_url: "/images/Westeros/Maison du nord Westeros/Maison Umber.png",
  },
  {
    id: 'mormont',
    continent: 'westeros',
    name: 'MORMONT',
    seat: 'Île-aux-Ours',
    words: '"Ici Nous Nous Tenons"',
    region: 'Le Nord',
    sigil: 'Ours Noir Dressé',
    accent: '#5a6e4a',
    description: 'Maison de guerrières et de marins endurcis par une île hostile — l\'ours noir des Mormont ne recule jamais.',
    sigil_url: "/images/Westeros/Maison du nord Westeros/Maison Mormont.png",
  },
  {
    id: 'manderly',
    continent: 'westeros',
    name: 'MANDERLY',
    seat: 'Blancport',
    region: 'Le Nord',
    sigil: 'Triton Brandissant un Trident',
    accent: '#5d8a9e',
    description: 'Maison la plus opulente du Nord, héritière d\'exilés du Bief — leur port grouille de richesses, de poissons et de secrets bien gardés.',
    sigil_url: "/images/Westeros/Maison du nord Westeros/Maison Manderly.png",
  },
  {
    id: 'glover',
    continent: 'westeros',
    name: 'GLOVER',
    seat: 'Motte-la-Forêt',
    region: 'Le Nord',
    sigil: 'Poing de Fer',
    accent: '#6b6b6b',
    description: 'Vassaux loyaux nichés au cœur de la forêt de Loup, dont le poing de fer symbolise une force tranquille mais inébranlable.',
    sigil_url: "/images/Westeros/Maison du nord Westeros/Maison_Glover.png",
  },
  {
    id: 'hornwood',
    continent: 'westeros',
    name: 'HORNWOOD',
    seat: 'Boisaulne',
    region: 'Le Nord',
    sigil: 'Élan',
    accent: '#7a6a4a',
    description: 'Petite maison forestière du Nord, dont l\'élan rappelle les vastes étendues sauvages qu\'elle veille.',
    sigil_url: "/images/Westeros/Maison du nord Westeros/maison hornwood.png",
  },
  {
    id: 'cerwyn',
    continent: 'westeros',
    name: 'CERWYN',
    seat: 'Cerwyn',
    region: 'Le Nord',
    sigil: 'Hache de Bataille Noire',
    accent: '#5a5a5a',
    description: 'Vassaux fidèles et discrets des Stark, reconnaissables à leur hache de guerre sombre sur fond clair.',
    sigil_url: "/images/Westeros/Maison du nord Westeros/Maison Cerwyn.png",
  },
  {
    id: 'reed',
    continent: 'westeros',
    name: 'REED',
    seat: 'Griffoneau',
    region: 'Le Nord',
    sigil: 'Lézard-Lion',
    accent: '#5a7a5a',
    description: 'Peuple discret et mystique des marécages du Neck, héritiers du sang des Premiers Hommes et gardiens d\'anciens secrets.',
    sigil_url: "/images/Westeros/Maison du nord Westeros/Maison reed.png",
  },
  {
    id: 'flint',
    continent: 'westeros',
    name: 'FLINT',
    seat: 'Pierres Anciennes',
    region: 'Le Nord',
    sigil: 'Silex / Montagnes Grises',
    accent: '#8a8a8a',
    description: 'L\'une des plus anciennes lignées du Nord, antérieure même aux Stark — un sang rude né dans la pierre des montagnes.',
    sigil_url: "/images/Westeros/Maison du nord Westeros/Flint.png",
  },
  {
    id: 'ryswell',
    continent: 'westeros',
    name: 'RYSWELL',
    seat: 'Vivesource (Les Rus)',
    region: 'Le Nord',
    sigil: 'Cheval Bai Cabré',
    accent: '#7a6a5a',
    description: 'Maison de cavaliers et d\'éleveurs liée par le sang aux Bolton — leurs montures sont aussi réputées que leurs ambitions.',
    sigil_url: "/images/Westeros/Maison du nord Westeros/Maison Ryswell.png",
  },
  {
    id: 'dustin',
    continent: 'westeros',
    name: 'DUSTIN',
    seat: 'Veaufrison (Barrowton)',
    region: 'Le Nord',
    sigil: 'Couronne et Hache',
    accent: '#6a5a6a',
    description: 'Gardiens des tertres funéraires des Premiers Rois — une maison hantée par un passé plus ancien que celui des Stark eux-mêmes.',
    sigil_url: "/images/Westeros/Maison du nord Westeros/Maison_Dustin.png",
  },
  {
    id: 'tallhart',
    continent: 'westeros',
    name: 'TALLHART',
    seat: 'Foyceaumont (Torrhen\'s Square)',
    region: 'Le Nord',
    sigil: 'Trois Géants Verts en Marche',
    accent: '#6a7a5a',
    description: 'Vassaux robustes des terres boisées du Nord, dont les trois géants verts incarnent la force tranquille de leur lignée.',
    sigil_url: "/images/Westeros/Maison du nord Westeros/Maison Talhart.png",
  },

  // ── Le Val d'Arryn ──────────────────────────────────────────────────────
  {
    id: 'royce',
    continent: 'westeros',
    name: 'ROYCE',
    seat: 'Pierre-la-Gardienne (Runestone)',
    region: 'Le Val d\'Arryn',
    sigil: 'Runes de Bronze sur Fond Bleu Nuit',
    accent: '#a08050',
    description: 'L\'une des plus anciennes et respectées maisons du Val, gardienne d\'une armure de bronze runique vieille de mille ans.',
    sigil_url: "/images/Westeros/Val Arryn/Maison_Royce.webp",
  },
  {
    id: 'baelish',
    continent: 'westeros',
    name: 'BAELISH',
    seat: 'Harrenhal (anoblis)',
    region: 'Le Val d\'Arryn',
    sigil: 'Moqueur (Oiseau Chanteur)',
    accent: '#6a6a7a',
    description: 'Maison mineure des Doigts élevée au rang de grande maison par la seule ruse d\'un homme — Littlefinger, maître des intrigues et collectionneur de dettes.',
    sigil_url: "/images/Westeros/Val Arryn/Maison_Baelish.webp",
  },
  {
    id: 'corbray',
    continent: 'westeros',
    name: 'CORBRAY',
    seat: 'Cœurnoir (Heart\'s Home)',
    region: 'Le Val d\'Arryn',
    sigil: 'Faucon et Épée',
    accent: '#8a9aab',
    description: 'Maison guerrière du Val, fière propriétaire d\'une lame en acier valyrien transmise depuis des générations.',
    sigil_url: "/images/Westeros/Val Arryn/Maison_Corbray.jpg",
  },
  {
    id: 'waynwood',
    continent: 'westeros',
    name: 'WAYNWOOD',
    seat: 'Quailletombe (Ironoaks)',
    region: 'Le Val d\'Arryn',
    sigil: 'Hache et Clés Croisées',
    accent: '#7a8a9a',
    description: 'L\'une des maisons les plus puissantes et les plus loyales du Val, pilier de stabilité dans une région de hautes intrigues.',
    sigil_url: "/images/Westeros/Val Arryn/maison Waynwood.jpg",
  },
  {
    id: 'hunter',
    continent: 'westeros',
    name: 'HUNTER',
    seat: 'Longjardin (Longbow Hall)',
    region: 'Le Val d\'Arryn',
    sigil: 'Corne de Chasse',
    accent: '#6a8a6a',
    description: 'Maison montagnarde du Val, réputée pour ses chasseurs et ses archers aussi habiles que rusés.',
    sigil_url: "/images/Westeros/Val Arryn/Maison Hunter.jpg",
  },
  {
    id: 'templeton',
    continent: 'westeros',
    name: 'TEMPLETON',
    seat: 'Selleporte (Sisterton)',
    region: 'Le Val d\'Arryn',
    sigil: 'Tour Couronnée',
    accent: '#8a7a6a',
    description: 'Petite maison insulaire des Sœurs, à la frontière des eaux glaciales et des routes commerciales du nord du Val.',
    sigil_url: "/images/Westeros/Val Arryn/Maison Templeton.webp",
  },

  // ── Les Conflans ────────────────────────────────────────────────────────
  {
    id: 'frey',
    continent: 'westeros',
    name: 'FREY',
    seat: 'Les Jumeaux',
    words: '"Nous Tenons Parole"',
    region: 'Les Conflans',
    sigil: 'Deux Tours Reliées par un Pont',
    accent: '#5a6a8a',
    description: 'Maîtres incontestés du seul pont sur le Trident — une fortune bâtie sur les péages, et une trahison qui a scellé leur nom dans l\'infamie pour toujours.',
    sigil_url: "/images/Westeros/Conflans/Maison_Frey.png",
  },
  {
    id: 'blackwood',
    continent: 'westeros',
    name: 'BLACKWOOD',
    seat: 'Raventree Hall',
    region: 'Les Conflans',
    sigil: 'Arbre-Cœur Noir aux Yeux Rouges',
    accent: '#4a3a2a',
    description: 'Adorateurs des anciens dieux au cœur des Conflans, rivaux séculaires des Bracken dans une querelle vieille de mille ans.',
    sigil_url: "/images/Westeros/Conflans/Blackwood.png",
  },
  {
    id: 'bracken',
    continent: 'westeros',
    name: 'BRACKEN',
    seat: 'Stone Hedge',
    region: 'Les Conflans',
    sigil: 'Étalon Rouge Cabré',
    accent: '#b23a3a',
    description: 'Maison fougueuse et orgueilleuse, opposée aux Blackwood depuis des siècles dans l\'une des plus anciennes rivalités de Westeros.',
    sigil_url: "/images/Westeros/Conflans/Maison_Bracken.png",
  },
  {
    id: 'mallister',
    continent: 'westeros',
    name: 'MALLISTER',
    seat: 'Salimer (Seagard)',
    words: '"Sous la Vague Glacée"',
    region: 'Les Conflans',
    sigil: 'Aigle Argenté',
    accent: '#8a9aab',
    description: 'Gardiens de la côte occidentale des Conflans, dont l\'aigle d\'argent veille sur les ruines de l\'ancien royaume de la Vase.',
    sigil_url: "/images/Westeros/Conflans/Maison_Mallister.png",
  },
  {
    id: 'vance',
    continent: 'westeros',
    name: 'VANCE',
    seat: 'Lecimier (Wayfarer\'s Rest) / Atranta',
    region: 'Les Conflans',
    sigil: 'Chevron Rouge et Or',
    accent: '#6a7a8a',
    description: 'Ancienne lignée des Conflans aux multiples branches, mêlée à toutes les grandes guerres que la région a connues.',
    sigil_url: "/images/Westeros/Conflans/Maison Vance.png",
  },
  {
    id: 'piper',
    continent: 'westeros',
    name: 'PIPER',
    seat: 'Pinkmaiden',
    region: 'Les Conflans',
    sigil: 'Geai Rose et Bleu sur Champ Blanc',
    accent: '#9a8a6a',
    description: 'Petite maison fluviale connue pour son château aux teintes inhabituelles et la fidélité de ses seigneurs aux Tully.',
    sigil_url: "/images/Westeros/Conflans/Maison Piper.png",
  },
  {
    id: 'darry',
    continent: 'westeros',
    name: 'DARRY',
    seat: 'Darry',
    region: 'Les Conflans',
    sigil: 'Trois Hommes Noirs sur Échelle Argentée',
    accent: '#6a7a9a',
    description: 'Maison des Conflans ayant longtemps soutenu les Targaryen, prise de plein fouet dans les guerres pour le Trône de Fer.',
    sigil_url: "/images/Westeros/Conflans/Maison_Darry.png",
  },
  {
    id: 'ryger',
    continent: 'westeros',
    name: 'RYGER',
    seat: 'Cassemotte (Willow Wood)',
    region: 'Les Conflans',
    sigil: 'Trois Tourbillons Bleus',
    accent: '#8a6a5a',
    description: 'Petite maison vassale des Conflans, peu connue mais ancrée dans le tissu féodal du bassin du Trident.',
    sigil_url: "/images/Westeros/Conflans/Maison Ryger.png",
  },

  // ── Les Terres de l'Ouest ───────────────────────────────────────────────
  {
    id: 'clegane',
    continent: 'westeros',
    name: 'CLEGANE',
    seat: 'Repaire-Clegane',
    region: "Les Terres de l'Ouest",
    sigil: 'Trois Chiens Noirs sur Champ Jaune',
    accent: '#6a5a4a',
    description: 'Maison de petite noblesse élevée par l\'épée — le Limier et la Montagne ont fait de leur nom une terreur murmurée dans tout Westeros.',
    sigil_url: "/images/Westeros/Terre de l'Ouest/Maison_Clegane.jpg",
  },
  {
    id: 'reyne',
    continent: 'westeros',
    name: 'REYNE',
    seat: 'Castamere (détruite)',
    region: "Les Terres de l'Ouest",
    sigil: 'Lion Rouge se Noyant',
    accent: '#b23a3a',
    description: 'Maison rebelle anéantie par les Lannister jusqu\'à la dernière pierre — leur chute a inspiré la sinistre chanson "Les Pluies de Castamere".',
    sigil_url: "/images/Westeros/Terre de l'Ouest/Maison Reyne.jpg",
  },
  {
    id: 'tarbeck',
    continent: 'westeros',
    name: 'TARBECK',
    seat: 'Tarbeck Hall (détruite)',
    region: "Les Terres de l'Ouest",
    sigil: 'Vipère Cornue',
    accent: '#9a8a6a',
    description: 'Alliés des Reyne dans leur révolte avortée contre les Lannister — leur destin fut tout aussi brutal et définitif.',
    sigil_url: "/images/Westeros/Terre de l'Ouest/Maison_Tarbeck.jpg",
  },
  {
    id: 'crakehall',
    continent: 'westeros',
    name: 'CRAKEHALL',
    seat: 'Crakehall',
    region: "Les Terres de l'Ouest",
    sigil: 'Sanglier Tacheté Noir et Blanc',
    accent: '#6a6a5a',
    description: 'Maison guerrière de l\'Ouest, dont le sanglier rappelle des forêts giboyeuses et une réputation de robustesse au combat.',
    sigil_url: "/images/Westeros/Terre de l'Ouest/HouseCrakehall.jpg",
  },
  {
    id: 'marbrand',
    continent: 'westeros',
    name: 'MARBRAND',
    seat: 'Pierremont (Ashemark)',
    region: "Les Terres de l'Ouest",
    sigil: 'Arbre Brûlant Doré sur Champ Sombre',
    accent: '#c9763a',
    description: 'Vassaux fidèles et habiles guerriers des Lannister, leur arbre en flammes éclaire les champs de bataille de l\'Ouest.',
    sigil_url: "/images/Westeros/Terre de l'Ouest/Maison Marbrand.jpg",
  },
  {
    id: 'westerling',
    continent: 'westeros',
    name: 'WESTERLING',
    seat: 'Falaise-aux-Corbeaux (Crag)',
    region: "Les Terres de l'Ouest",
    sigil: 'Sirène et Triton Affrontés',
    accent: '#7a8a9a',
    description: 'Ancienne maison de l\'Ouest, déchue mais fière, dont une fille a un jour bouleversé le destin d\'un jeune roi du Nord.',
    sigil_url: "/images/Westeros/Terre de l'Ouest/HouseWesterling.jpg",
  },
  {
    id: 'payne',
    continent: 'westeros',
    name: 'PAYNE',
    seat: 'Castelpierre (Castamere)',
    region: "Les Terres de l'Ouest",
    sigil: 'Bourse Pourpre et Argentée',
    accent: '#8a7a6a',
    description: 'Petite maison vassale connue surtout par l\'un de ses fils, écuyer maladroit mais loyal au service d\'un Lannister tristement célèbre.',
    sigil_url: "/images/Westeros/Terre de l'Ouest/Maison_Payne.jpg",
  },
  {
    id: 'brax',
    continent: 'westeros',
    name: 'BRAX',
    seat: 'Hortensias (Hornvale)',
    region: "Les Terres de l'Ouest",
    sigil: 'Sanglier et Lance Croisés',
    accent: '#9a7a5a',
    description: 'Maison de l\'Ouest mêlée aux guerres incessantes que les Lannister ont menées pour asseoir leur domination régionale.',
    sigil_url: "/images/Westeros/Terre de l'Ouest/Maison Brax.jpg",
  },

  // ── Le Bief ─────────────────────────────────────────────────────────────
  {
    id: 'tarly',
    continent: 'westeros',
    name: 'TARLY',
    seat: 'Corneilline (Horn Hill)',
    words: '"Premier au Combat"',
    region: 'Le Bief',
    sigil: 'Chasseur Ambulant Doré sur Champ Vert Sombre',
    accent: '#7a6a4a',
    description: 'Maison de soldats par excellence — leurs armées sont parmi les mieux entraînées du royaume, et leur discipline n\'a d\'égal que leur intransigeance.',
    sigil_url: "/images/Westeros/Bief/Maison_Tarly.png",
  },
  {
    id: 'hightower',
    continent: 'westeros',
    name: 'HIGHTOWER',
    seat: 'Vieille-Ville (Oldtown)',
    words: '"Nous Éclairons le Chemin"',
    region: 'Le Bief',
    sigil: 'Tour Blanche Couronnée d\'un Feu Fumant',
    accent: '#c9a84c',
    description: 'L\'une des plus anciennes et des plus riches maisons de Westeros, gardienne du grand phare qui veille sur le berceau du savoir et de la foi.',
    sigil_url: "/images/Westeros/Bief/Maison_Hightower.png",
  },
  {
    id: 'florent',
    continent: 'westeros',
    name: 'FLORENT',
    seat: 'Rivebrune (Brightwater Keep)',
    region: 'Le Bief',
    sigil: 'Tête de Renard Encerclée de Fleurs',
    accent: '#e08030',
    description: 'Maison ambitieuse du Bief, prompte à changer d\'allégeance lorsque le vent tourne — la ruse du renard incarnée dans un blason.',
    sigil_url: "/images/Westeros/Bief/Maison_Florent.png",
  },
  {
    id: 'redwyne',
    continent: 'westeros',
    name: 'REDWYNE',
    seat: 'L\'Arbre (The Arbor)',
    region: 'Le Bief',
    sigil: 'Grappes de Raisin Pourpres et Or',
    accent: '#6a3a6a',
    description: 'Maîtres des vignobles et de la plus grande flotte marchande du royaume — leur vin et leurs navires voyagent jusqu\'aux confins du monde connu.',
    sigil_url: "/images/Westeros/Bief/Maison Redwyne.png",
  },
  {
    id: 'rowan',
    continent: 'westeros',
    name: 'ROWAN',
    seat: 'Bois-de-Maître (Goldengrove)',
    region: 'Le Bief',
    sigil: 'Arbre d\'Or sur Champ Vert',
    accent: '#7a9e48',
    description: 'L\'une des grandes maisons vassales du Bief, dont l\'arbre doré symbolise une prospérité enracinée depuis des générations.',
    sigil_url: "/images/Westeros/Bief/Maison_Rowan.png",
  },
  {
    id: 'oakheart',
    continent: 'westeros',
    name: 'OAKHEART',
    seat: 'Vieux-Chêne (Old Oak)',
    region: 'Le Bief',
    sigil: 'Feuilles de Chêne Vertes',
    accent: '#4a7c3f',
    description: 'Ancienne lignée du Bief, fournissant régulièrement des chevaliers à la prestigieuse Garde Royale.',
    sigil_url: "/images/Westeros/Bief/Maison Oakheart.png",
  },
  {
    id: 'fossoway',
    continent: 'westeros',
    name: 'FOSSOWAY',
    seat: 'Cidregrenier (Cider Hall) / Honneterre',
    region: 'Le Bief',
    sigil: 'Pomme (Rouge ou Verte selon la branche)',
    accent: '#8aab4a',
    description: 'Maison divisée en deux branches rivales — la pomme rouge et la pomme verte — chacune jurant fidélité à des camps opposés.',
    sigil_url: "/images/Westeros/Bief/Maison Fossoway.png",
  },
  {
    id: 'crane',
    continent: 'westeros',
    name: 'CRANE',
    seat: 'Tertre-Grue (Crane\'s Roost)',
    region: 'Le Bief',
    sigil: 'Trois Grues Grises en Vol',
    accent: '#7a8a9a',
    description: 'Petite maison côtière du Bief, peu mêlée aux grandes intrigues mais fidèle aux Tyrell de longue date.',
    sigil_url: "/images/Westeros/Bief/Maison Crane.png",
  },
  {
    id: 'ashford',
    continent: 'westeros',
    name: 'ASHFORD',
    seat: 'Ashford',
    region: 'Le Bief',
    sigil: 'Trois Papillons de Nuit Argentés',
    accent: '#9a8a6a',
    description: 'Maison du Bief surtout connue pour avoir accueilli un tournoi resté légendaire dans les récits du règne des dragons.',
    sigil_url: "/images/Westeros/Bief/Maison_Ashford.png",
  },

  // ── Les Terres de l'Orage ───────────────────────────────────────────────
  {
    id: 'selmy',
    continent: 'westeros',
    name: 'SELMY',
    seat: 'Salle-des-Récoltes (Harvest Hall)',
    region: "Les Terres de l'Orage",
    sigil: 'Trois Épis de Blé Dorés',
    accent: '#c9a84c',
    description: 'Petite maison rendue célèbre par un seul homme — Barristan le Hardi, l\'un des plus grands chevaliers que le royaume ait connus.',
    sigil_url: "/images/Westeros/Terre de l'Orage/Maison_Selmy.webp",
  },
  {
    id: 'connington',
    continent: 'westeros',
    name: 'CONNINGTON',
    seat: 'Nid-du-Griffon (Griffin\'s Roost)',
    region: "Les Terres de l'Orage",
    sigil: 'Griffon Rouge sur Champ Blanc et Noir',
    accent: '#b23a3a',
    description: 'Ancienne maison liée aux Targaryen en exil, dont le griffon rouge garde encore l\'espoir d\'une restauration impossible.',
    sigil_url: "/images/Westeros/Terre de l'Orage/Maison Connington.jpg",
  },
  {
    id: 'swann',
    continent: 'westeros',
    name: 'SWANN',
    seat: 'Crêvecœur (Stonehelm)',
    region: "Les Terres de l'Orage",
    sigil: 'Trois Cygnes Noirs sur Champ Rose et Blanc',
    accent: '#6a6a6a',
    description: 'Maison chevaleresque des Terres de l\'Orage, réputée pour produire des champions redoutables aux tournois.',
    sigil_url: "/images/Westeros/Terre de l'Orage/Maison_Swann.jpg",
  },
  {
    id: 'caron',
    continent: 'westeros',
    name: 'CARON',
    seat: 'Nightsong',
    region: "Les Terres de l'Orage",
    sigil: 'Alouette Noire sur Champ Or et Pourpre',
    accent: '#7a6a8a',
    description: 'Maison guerrière nichée sur les marches de Dorne, rompue aux conflits frontaliers depuis des siècles.',
    sigil_url: "/images/Westeros/Terre de l'Orage/Maison Caron.jpg",
  },
  {
    id: 'wensington',
    continent: 'westeros',
    name: 'WENSINGTON',
    seat: 'Wensington',
    region: "Les Terres de l'Orage",
    sigil: 'Blason Mineur des Marches de l\'Orage',
    accent: '#8a7a6a',
    description: 'Petite maison vassale des Terres de l\'Orage, peu documentée mais ancrée dans la hiérarchie féodale baratheonienne.',
    sigil_url: "/images/Westeros/Terre de l'Orage/Maison Wensington.jpg",
  },
  {
    id: 'penrose',
    continent: 'westeros',
    name: 'PENROSE',
    seat: 'Pierremoult (Parchments)',
    region: "Les Terres de l'Orage",
    sigil: 'Trois Cailles Argentées',
    accent: '#6a7a8a',
    description: 'Maison loyaliste des Terres de l\'Orage, connue pour avoir tenu bon dans des sièges où d\'autres auraient capitulé.',
    sigil_url: "/images/Westeros/Terre de l'Orage/maison Penrose.jpg",
  },

  // ── Dorne ───────────────────────────────────────────────────────────────
  {
    id: 'yronwood',
    continent: 'westeros',
    name: 'YRONWOOD',
    seat: 'Yronwood',
    region: 'Dorne',
    sigil: 'Clés et Épées Noires sur Champ Rouge et Or',
    accent: '#6a3a3a',
    description: 'La plus ancienne et la plus fière maison dornienne après les Martell, héritière d\'un royaume qui exista avant leur ascension.',
    sigil_url: "/images/Westeros/Dorne/Maison Yronwood.png",
  },
  {
    id: 'dayne',
    continent: 'westeros',
    name: 'DAYNE',
    seat: 'Tertre-Étoile (Starfall)',
    region: 'Dorne',
    sigil: 'Épée Blanche Tombante et Étoile à Dix Branches',
    accent: '#aab4c9',
    description: 'Maison légendaire détentrice de "L\'Aube", épée en acier de météorite forgée pour un héros oublié — leur lignée est nimbée de mythe.',
    sigil_url: "/images/Westeros/Dorne/Maison_Dayne.png",
  },
  {
    id: 'manwoody',
    continent: 'westeros',
    name: 'MANWOODY',
    seat: 'Kingsgrave',
    region: 'Dorne',
    sigil: 'Crâne Argenté Couronné sur Champ Noir',
    accent: '#5a4a5a',
    description: 'Maison dornienne aux sépultures royales, dont le crâne couronné rappelle un passé de défiance face aux conquérants.',
    sigil_url: "/images/Westeros/Dorne/Maison Mandwoody.png",
  },
  {
    id: 'allyrion',
    continent: 'westeros',
    name: 'ALLYRION',
    seat: 'Soleil Brûlant (Godsgrace)',
    region: 'Dorne',
    sigil: 'Aigle Doré tenant un Serpent Rouge',
    accent: '#c9763a',
    description: 'Maison dornienne du désert, dont l\'aigle saisissant un serpent illustre la vigilance face aux dangers du sable et de la trahison.',
    sigil_url: "/images/Westeros/Dorne/Maison_Allyrion.png",
  },
  {
    id: 'toland',
    continent: 'westeros',
    name: 'TOLAND',
    seat: 'Ghaston Grey',
    region: 'Dorne',
    sigil: 'Faucon Étranglant un Serpent',
    accent: '#8a6a4a',
    description: 'Maison dornienne discrète mais redoutée, gardienne d\'une forteresse-prison battue par les vents et les flots.',
    sigil_url: "/images/Westeros/Dorne/House_Toland.png",
  },
  {
    id: 'fowler',
    continent: 'westeros',
    name: 'FOWLER',
    seat: 'Nid-de-Faucon (Skyreach)',
    region: 'Dorne',
    sigil: 'Faucon Argenté en Plein Vol',
    accent: '#6a8aab',
    description: 'Maison perchée au sommet des monts Rouges, surveillant les cols qui mènent au cœur de Dorne.',
    sigil_url: "/images/Westeros/Dorne/Maison Fowler.png",
  },
  {
    id: 'santagar',
    continent: 'westeros',
    name: 'SANTAGAR',
    seat: 'Versger (Spottswood)',
    region: 'Dorne',
    sigil: 'Étoile Filante Argentée sur Champ Pourpre',
    accent: '#7a6a8a',
    description: 'Maison dornienne ancienne, dont l\'étoile filante évoque un destin tracé par-delà les frontières du désert.',
    sigil_url: "/images/Westeros/Dorne/Maison_Santagar.png",
  },

  // ── Les Terres de la Couronne ───────────────────────────────────────────
  {
    id: 'velaryon',
    continent: 'westeros',
    name: 'VELARYON',
    seat: 'Vivesource (Driftmark)',
    words: '"Le Vieux, le Vrai, le Courageux"',
    region: 'Les Terres de la Couronne',
    sigil: 'Hippocampe d\'Argent sur Champ Marine',
    accent: '#7faecf',
    description: 'Maison d\'origine valyrienne aussi ancienne que les Targaryen, maîtres incontestés des mers et de la flotte royale pendant des siècles.',
    sigil_url: "/images/Westeros/Terre de la couronne/Maison_Velaryon.jpg",
  },
  {
    id: 'celtigar',
    continent: 'westeros',
    name: 'CELTIGAR',
    seat: 'Île-aux-Crabes (Claw Isle)',
    region: 'Les Terres de la Couronne',
    sigil: 'Crabe Rouge sur Champ Argent',
    accent: '#b23a3a',
    description: 'Maison insulaire des Terres de la Couronne, fidèle soutien des Targaryen pendant la Danse des Dragons.',
    sigil_url: "/images/Westeros/Terre de la couronne/Maison Celtigar.jpg",
  },

  // ════════════════════════════════════════════════════════════════════════
  // ESSOS — Cités Libres
  // ════════════════════════════════════════════════════════════════════════
  {
    id: 'braavos-titan',
    continent: 'essos',
    name: 'LE TITAN DE BRAAVOS',
    seat: 'Braavos',
    region: 'Braavos',
    sigil: 'Le Titan — Colosse-Forteresse Casqué',
    accent: '#5a6a7a',
    description: 'Cité-refuge fondée par des esclaves en fuite, Braavos se dresse derrière son Titan de pierre — un colosse-forteresse qui garde l\'entrée du port et le secret de ses origines.',
    sigil_url: "/images/Cite libre/Braavos/Titan-of-Braavos-statue.png",
  },
  {
    id: 'braavos-banque',
    continent: 'essos',
    name: 'LA BANQUE DE FER',
    seat: 'Braavos',
    region: 'Braavos',
    sigil: 'Sceau de la Balance et de la Clé',
    accent: '#c9a84c',
    description: 'Institution plus puissante que bien des trônes — la Banque de Fer de Braavos prête aux rois, et n\'oublie jamais une dette impayée.',
    sigil_url: "/images/Cite libre/Braavos/Iron-Bank-of-Braavos-seal.png",
  },
  {
    id: 'braavos-sans-visage',
    continent: 'essos',
    name: 'LES SANS-VISAGE',
    seat: 'La Maison Noir et Blanc',
    region: 'Braavos',
    sigil: 'Visage Mi-Blanc, Mi-Noir',
    accent: '#8a8a8a',
    description: 'Confrérie d\'assassins-prêtres vouée au Dieu aux Mille Visages — quiconque paie le prix peut obtenir le don de la mort, livré sans haine ni douleur.',
    sigil_url: "/images/Cite libre/Braavos/Faceless-Men-House-of-Black-and-White-symbol.png",
  },
  {
    id: 'pentos',
    continent: 'essos',
    name: 'PENTOS',
    seat: 'Pentos',
    region: 'Pentos',
    sigil: 'Portes et Manoirs de Marchands-Princes',
    accent: '#9a8a6a',
    description: 'Cité marchande gouvernée par un prince plus en représentation qu\'en pouvoir réel — ses magisters tissent les fils du commerce et des intrigues exilées.',
    sigil_url: "/images/Cite libre/Pentos/Pentos-city-gate-Pentoshi-manor.png",
  },
  {
    id: 'norvos',
    continent: 'essos',
    name: 'NORVOS',
    seat: 'Norvos',
    region: 'Norvos',
    sigil: 'Statues Jumelles des Dieux Bourreaux',
    accent: '#6a6a5a',
    description: 'Cité fortifiée perchée sur des falaises, vénérant ses Dieux Bourreaux — deux effigies barbues colossales veillant sur ses portes.',
    sigil_url: "/images/Cite libre/Norvos/Norvos-twin-statues-gate-gods.png",
  },
  {
    id: 'qohor',
    continent: 'essos',
    name: 'QOHOR',
    seat: 'Qohor',
    region: 'Qohor',
    sigil: 'Le Dieu-Bouc Noir de la Forêt Sacrée',
    accent: '#4a3a2a',
    description: 'Cité-frontière nichée contre une forêt sacrée et sombre, réputée pour ses forgerons hors pair et le culte sinistre de son dieu noir.',
    sigil_url: "/images/Cite libre/Qohor/Qohor-black-goat-god.png",
  },
  {
    id: 'lorath',
    continent: 'essos',
    name: 'LORATH',
    seat: 'Lorath',
    region: 'Lorath',
    sigil: 'Statues de Pierre des Vieilles Femmes',
    accent: '#7a7a8a',
    description: 'La plus modeste et la plus reculée des Cités Libres, hantée par des statues de pierre érigées en mémoire d\'un peuple disparu.',
    sigil_url: "/images/Cite libre/Lorath/Lorath-stone-crones-statues.png",
  },
  {
    id: 'lys',
    continent: 'essos',
    name: 'LYS',
    seat: 'Lys',
    region: 'Lys',
    sigil: 'Motif Floral des Jardins de Plaisir',
    accent: '#c97aab',
    description: 'Île parfumée vouée à la beauté et au plaisir — ses jardins et ses maisons de charme attirent autant qu\'ils corrompent ceux qui s\'y aventurent.',
    sigil_url: "/images/Cite libre/Lys/Lys-pleasure-gardens-flower-motif.png",
  },
  {
    id: 'myr',
    continent: 'essos',
    name: 'MYR',
    seat: 'Myr',
    region: 'Myr',
    sigil: 'Lentille de Cristal et Dentelle Myrienne',
    accent: '#7aabc9',
    description: 'Cité d\'artisans virtuoses, célèbre pour ses verres taillés, ses lentilles de cristal et ses dentelles d\'une finesse inégalée.',
    sigil_url: "/images/Cite libre/Myr/Myr crystal lens - Myrish lace pattern.png",
  },
  {
    id: 'tyrosh',
    continent: 'essos',
    name: 'TYROSH',
    seat: 'Tyrosh',
    region: 'Tyrosh',
    sigil: 'Barbe Teinte et Blason Rayé Multicolore',
    accent: '#c9a23a',
    description: 'Cité de teinturiers flamboyants, où la noblesse arbore fièrement barbes et cheveux teints de couleurs vives comme un étendard vivant.',
    sigil_url: "/images/Cite libre/Tyrosh/Tyroshi dyed beard - Tyrosh striped sigil.png",
  },
  {
    id: 'volantis-drapeau',
    continent: 'essos',
    name: 'VOLANTIS',
    seat: 'Volantis',
    region: 'Volantis',
    sigil: 'Bannière des Triarches au Tigre Flamboyant',
    accent: '#b23a3a',
    description: 'La plus ancienne et la plus fière des filles de la Vieille Valyria — gouvernée par des Triarches élus, déchirée entre Éléphants et Tigres.',
    sigil_url: "/images/Cite libre/Volantis/Volantis flag triarch tiger banner.png",
  },
  {
    id: 'volantis-tatouage',
    continent: 'essos',
    name: 'LE VIEUX SANG DE VOLANTIS',
    seat: 'Volantis',
    region: 'Volantis',
    sigil: 'Tatouage de Tigre des Lignées Valyriennes',
    accent: '#c9a84c',
    description: 'Descendants directs des seigneurs-dragons de la Vieille Valyria, identifiables à leurs tatouages de tigre — une aristocratie qui se croit destinée à régner sur le monde.',
    sigil_url: "/images/Cite libre/Volantis/Volantis tiger tattoo old blood.png",
  },

  // ── Baie des Esclavagistes ──────────────────────────────────────────────
  {
    id: 'astapor',
    continent: 'essos',
    name: 'ASTAPOR',
    seat: 'Astapor',
    region: 'Baie des Esclavagistes',
    sigil: 'Harpie Ghiscarie Dorée sur Brique Rouge',
    accent: '#b23a2a',
    description: 'Cité de brique sanglante où l\'on forge les Immaculés — des esclaves-soldats dressés depuis l\'enfance à l\'obéissance et à la mort sans un mot.',
    sigil_url: "/images/Essos/Astapor/Blazon.png",
  },
  {
    id: 'yunkai',
    continent: 'essos',
    name: 'YUNKAI',
    seat: 'Yunkai (la Cité Jaune)',
    region: 'Baie des Esclavagistes',
    sigil: 'Pyramides et Murailles de Brique Dorée',
    accent: '#d4af37',
    description: 'La "Cité Jaune", spécialisée dans le commerce d\'esclaves dressés aux arts du plaisir — sa richesse repose entièrement sur la servitude.',
    sigil_url: "/images/Essos/yunkai/blazon yunkai.png",
  },
  {
    id: 'meereen',
    continent: 'essos',
    name: 'MEEREEN',
    seat: 'Meereen — Grande Pyramide',
    region: 'Baie des Esclavagistes',
    sigil: 'Harpie Dorée Affrontant le Dragon Tricéphale',
    accent: '#8a5a8a',
    description: 'La plus grande cité de la baie, dominée par sa Grande Pyramide — théâtre de la lutte entre la harpie des Grands Maîtres et le dragon de la libératrice venue d\'occident.',
    sigil_url: "/images/Essos/meereen/Meereen harpy vs dragon banner Daenerys.png",
  },

  // ── Mer Dothrak et alentours ────────────────────────────────────────────
  {
    id: 'dothraki-1',
    continent: 'essos',
    name: 'KHALASAR — LE CHEVAL SACRÉ',
    seat: 'La Mer Dothrak (nomades)',
    region: 'Mer Dothrak',
    sigil: 'Cheval et Clochettes de Victoire',
    accent: '#8a6a4a',
    description: 'Peuple de cavaliers nomades sans château ni blason — leur seule richesse est leur khalasar, et leur seul dieu, le Grand Étalon céleste.',
    sigil_url: "/images/Mer dothrak/khals et khalasars dothraks/symbole général 1.png",
  },
  {
    id: 'dothraki-2',
    continent: 'essos',
    name: 'KHALASAR — LES SANGS DU LIGNAGE',
    seat: 'La Mer Dothrak (nomades)',
    region: 'Mer Dothrak',
    sigil: 'Tresse de Guerrier et Arakh Recourbé',
    accent: '#7a6a5a',
    description: 'Chez les Dothrakis, la tresse non coupée d\'un guerrier raconte sa légende — la couper, c\'est effacer son honneur et celui de son sang.',
    sigil_url: "/images/Mer dothrak/khals et khalasars dothraks/symbole général 2.png",
  },
  {
    id: 'dothraki-3',
    continent: 'essos',
    name: 'KHALASAR — VAES DOTHRAK',
    seat: 'Vaes Dothrak (cité sacrée)',
    region: 'Mer Dothrak',
    sigil: 'Allée des Dieux — Statues des Peuples Conquis',
    accent: '#9a8060',
    description: 'L\'unique "cité" dothrak — un lieu sacré sans murs où trônent les idoles volées à tous les peuples soumis par les khalasars au fil des siècles.',
    sigil_url: "/images/Mer dothrak/khals et khalasars dothraks/symbole général 3.png",
  },
  {
    id: 'dothraki-4',
    continent: 'essos',
    name: 'KHALASAR — LE DOSH KHALEEN',
    seat: 'Vaes Dothrak (Dosh Khaleen)',
    region: 'Mer Dothrak',
    sigil: 'Cercle des Veuves de Sang et Étoiles de Prophétie',
    accent: '#6a5a7a',
    description: 'Confrérie sacrée des veuves de khals défunts, gardiennes des prophéties et des rites — leur parole peut faire ou défaire un nouveau khal.',
    sigil_url: "/images/Mer dothrak/khals et khalasars dothraks/symbole général 4.png",
  },
  {
    id: 'lhazar',
    continent: 'essos',
    name: 'LES LHAZARÉENS',
    seat: 'Lhazar (Terre des Hommes Pacifiques)',
    region: 'Lhazar',
    sigil: 'Agneau — Symbole de Paix et de Guérison',
    accent: '#aab4c9',
    description: 'Peuple pacifique de bergers et de guérisseurs que les Dothrakis surnomment avec mépris les "Hommes Agneaux" — leur douceur cache une résilience tenace.',
    sigil_url: "/images/Mer dothrak/lhazar/Lamb.png",
  },
  {
    id: 'qarth',
    continent: 'essos',
    name: 'QARTH',
    seat: 'Qarth — Cité aux Portes de Jade',
    region: 'Qarth',
    sigil: 'Les Trois Portes — Singes de Bronze, Lions de Pierre, Femmes de Jade',
    accent: '#4ac9c9',
    description: 'Cité opulente aux portes de jade légendaires, dirigée par les Treize, les Purs-Nés et la Confrérie de Tourmaline — la richesse y côtoie une magie ancienne et trouble.',
    sigil_url: "/images/Mer dothrak/qarth/blazon quarth.png",
  },

  // ════════════════════════════════════════════════════════════════════════
  // RESTE DU MONDE
  // ════════════════════════════════════════════════════════════════════════
  {
    id: 'ib',
    continent: 'monde',
    name: 'L\'ÎLE D\'IB',
    seat: 'Île d\'Ib',
    region: "Mer de Jade",
    sigil: 'Morse et Baleine des Chasseurs d\'Ib',
    accent: '#5a7a8a',
    description: 'Île reculée peuplée de chasseurs de baleines massifs et velus — un peuple rude que la mer de Jade a façonné à son image.',
    sigil_url: "/images/Reste du monde/île ib/blazon ib.png",
  },
  {
    id: 'sothoryos',
    continent: 'monde',
    name: 'SOTHORYOS',
    seat: 'Continent Sauvage du Sud',
    region: 'Sothoryos',
    sigil: 'Jungle et Ruines de la Cité Engloutie de Yeen',
    accent: '#3a5a3a',
    description: 'Continent à peine cartographié, recouvert d\'une jungle mortelle et des ruines de civilisations oubliées — peu de ceux qui y débarquent en reviennent.',
    sigil_url: "/images/Reste du monde/Sothoryos/blazon sothoryos.png",
  },
  {
    id: 'yiti',
    continent: 'monde',
    name: 'YI TI',
    seat: 'Empire de Yi Ti',
    region: 'Yi Ti',
    sigil: 'Dragon-Phénix Doré de l\'Empereur Émeraude',
    accent: '#d4af37',
    description: 'Lointain empire d\'orient aux dynasties mythiques — son dragon-phénix doré incarne un pouvoir impérial aussi ancien que mystérieux pour l\'Occident.',
    sigil_url: "/images/Reste du monde/Yiti/symbole du dragon-phenix.png",
  },
  {
    id: 'asshai',
    continent: 'monde',
    name: 'ASSHAI-PRÈS-DE-L\'OMBRE',
    seat: 'Asshai',
    region: "L'Ombre",
    sigil: 'Flamme Rouge de R\'hllor, le Maître de la Lumière',
    accent: '#c9442a',
    description: 'Cité de pierre noire sans enfants ni animaux, aux confins du monde connu — berceau supposé du culte de R\'hllor et de magies que nul n\'ose nommer.',
    sigil_url: "/images/Reste du monde/Shadow/Blazon de R'hllor.png",
  },
]

const CarteMaison = ({ house, index }) => {
  const cardRef  = useRef(null)
  const sigilRef = useRef(null)
  const [hovered, setHovered]   = useState(false)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Stagger limité (sinon, avec ~90 cartes, les dernières mettraient des secondes à apparaître)
          setTimeout(() => el.classList.add('visible'), (index % 12) * 100)
          obs.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [index])

  const handleMouseMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 14
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 14
    if (sigilRef.current) {
      sigilRef.current.style.transform = `rotateY(${x}deg) rotateX(${-y}deg) scale(1.06)`
    }
  }
  const handleMouseLeave = () => {
    if (sigilRef.current) sigilRef.current.style.transform = ''
    setHovered(false)
  }

  // Seules les entités de Westeros sont de véritables "Maisons" nobles —
  // les entités d'Essos / Reste du Monde sont des cités, peuples, cultes...
  const titlePrefix = house.continent === 'westeros' ? 'MAISON ' : ''

  return (
    <div
      ref={cardRef}
      className={`house-card house-card--${house.id}`}
      style={{
        '--accent': house.accent,
        '--border': house.borderColor || deriveBorder(house.accent),
        background: house.bg || deriveBg(house.accent),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <span className="corner corner-tl" />
      <span className="corner corner-tr" />
      <span className="corner corner-bl" />
      <span className="corner corner-br" />
      <div className="card-glow" />

      <div ref={sigilRef} className="house-sigil-wrap">
        {!imgError ? (
          <img
            className="house-sigil-img"
            src={house.sigil_url}
            alt={`Blason Maison ${house.name}`}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="house-sigil-fallback">{house.sigil[0]}</div>
        )}
        <div className="sigil-ring" />
      </div>

      <div className={`house-content ${hovered ? 'content-hidden' : ''}`}>
        <p className="house-region">{house.region}</p>
        <div className="house-divider">
          <span className="divider-line" />
          <span className="divider-diamond" />
          <span className="divider-line" />
        </div>
        <h2 className="house-name">{titlePrefix && <>{titlePrefix}<br /></>}{house.name}</h2>
        <p className="house-seat">{house.seat}</p>
        <p className="house-sigil-label">{house.sigil}</p>
      </div>

      <div className={`house-hover-content ${hovered ? 'hover-visible' : ''}`}>
        {house.words && <p className="hover-words">{house.words}</p>}
        <div className="house-divider hover-divider">
          <span className="divider-line" />
          <span className="divider-diamond" />
          <span className="divider-line" />
        </div>
        <h2 className="hover-name">{titlePrefix}{house.name}</h2>
        <p className="hover-desc">{house.description}</p>
      </div>

      <div className="card-accent-bar" />
    </div>
  )
}

// Normalisation pour une recherche insensible aux accents/majuscules
const normalize = (str) =>
  (str || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const Section1_v2 = () => {
  const sectionRef = useRef(null)
  const headingRef = useRef(null)
  const subRef     = useRef(null)
  const [activeContinent, setActiveContinent] = useState('tous')
  const [activeRegion,    setActiveRegion]    = useState('toutes')
  const [searchQuery,     setSearchQuery]     = useState('')

  // Changer de continent réinitialise le sous-filtre par région
  const handleContinentChange = (id) => {
    setActiveContinent(id)
    setActiveRegion('toutes')
  }

  // Régions disponibles pour le continent actif (ordre d'apparition dans MAISONS)
  const regionsInContinent = activeContinent === 'tous'
    ? []
    : [...new Set(MAISONS.filter(m => m.continent === activeContinent).map(m => m.region))]

  const query = normalize(searchQuery)

  const matchesSearch = (m) => {
    if (!query) return true
    return normalize(`${m.name} ${m.seat} ${m.sigil} ${m.region} ${m.description}`).includes(query)
  }

  const filteredMaisons = MAISONS.filter(m =>
    (activeContinent === 'tous' || m.continent === activeContinent) &&
    (activeRegion === 'toutes' || m.region === activeRegion) &&
    matchesSearch(m)
  )

  // Regroupement par région (sous-catégories) : utile quand on parcourt un continent
  // entier sans filtre de région ni recherche actifs — sinon, grille simple.
  // Exception : "Reste du Monde" compte très peu de maisons par région (1 à 3),
  // un regroupement n'aurait aucun sens — on les affiche toutes à la suite.
  const shouldGroup = activeContinent !== 'tous' && activeContinent !== 'monde' && activeRegion === 'toutes' && !query
  const groupedEntries = (() => {
    if (!shouldGroup) return null
    const order = []
    const groups = {}
    filteredMaisons.forEach(m => {
      if (!groups[m.region]) { groups[m.region] = []; order.push(m.region) }
      groups[m.region].push(m)
    })
    return order.map(region => ({ region, items: groups[region] }))
  })()

  useEffect(() => {
    const els = [headingRef.current, subRef.current].filter(Boolean)
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          els.forEach((el, i) =>
            setTimeout(() => el.classList.add('visible'), i * 150)
          )
          obs.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    // On observe le titre (petit élément en haut de section), pas la section entière :
    // avec ~93 cartes la section est très haute, et 20% de SA hauteur n'est presque
    // jamais visible en arrivant en haut de page → le titre restait invisible.
    if (headingRef.current) obs.observe(headingRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="section1">

      <div className="section1-bg-texture" />
      <div className="section1-bg-vignette" />

      <header className="section1-header">
        <p ref={subRef} className="section1-eyebrow fade-up">LES MAISONS ET PEUPLES DU MONDE CONNU</p>
        <div className="header-ornament">
          <span className="ornament-line" />
          <span className="ornament-rune">✦</span>
          <span className="ornament-line" />
        </div>
        <h1 ref={headingRef} className="section1-title fade-up">
          Les Nobles<br />
          <em>Maisons</em>
        </h1>
        <p className="section1-subtitle fade-up">
          De Westeros aux Cités Libres, de la Baie des Esclavagistes aux confins de l'Ombre — {MAISONS.length} blasons et symboles à découvrir.
        </p>
      </header>

      <div className="houses-filters">
        {CONTINENTS.map(c => {
          const count = c.id === 'tous' ? MAISONS.length : MAISONS.filter(m => m.continent === c.id).length
          return (
            <button
              key={c.id}
              className={`houses-filter-btn ${activeContinent === c.id ? 'houses-filter-active' : ''}`}
              onClick={() => handleContinentChange(c.id)}
            >
              {c.label}
              <span className="houses-filter-count">{count}</span>
            </button>
          )
        })}
      </div>

      <div className="houses-search">
        <span className="houses-search-icon" aria-hidden="true">⌕</span>
        <input
          type="text"
          className="houses-search-input"
          placeholder="Rechercher une maison, un siège, un blason, une région..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            className="houses-search-clear"
            onClick={() => setSearchQuery('')}
            aria-label="Effacer la recherche"
          >
            ✕
          </button>
        )}
      </div>

      {regionsInContinent.length > 1 && (
        <div className="houses-regions">
          <button
            className={`houses-region-btn ${activeRegion === 'toutes' ? 'houses-region-active' : ''}`}
            onClick={() => setActiveRegion('toutes')}
          >
            Toutes les régions
          </button>
          {regionsInContinent.map(region => (
            <button
              key={region}
              className={`houses-region-btn ${activeRegion === region ? 'houses-region-active' : ''}`}
              onClick={() => setActiveRegion(region)}
            >
              {region}
            </button>
          ))}
        </div>
      )}

      {filteredMaisons.length === 0 && (
        <p className="houses-empty">Aucun résultat ne correspond à votre recherche.</p>
      )}

      {groupedEntries ? (
        groupedEntries.map(({ region, items }) => (
          <div key={region} className="houses-region-group">
            <h3 className="houses-region-heading">
              <span className="houses-region-heading-line" />
              {region}
              <span className="houses-region-heading-count">{items.length}</span>
              <span className="houses-region-heading-line" />
            </h3>
            <div className="houses-grid">
              {items.map((maison, i) => (
                <CarteMaison key={maison.id} house={maison} index={i} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="houses-grid">
          {filteredMaisons.map((maison, i) => (
            <CarteMaison key={maison.id} house={maison} index={i} />
          ))}
        </div>
      )}

      <div className="section1-footer-ornament">
        <span className="footer-line" />
        <span className="footer-sigil">⚔</span>
        <span className="footer-line" />
      </div>

    </section>
  )
}

export default Section1_v2
