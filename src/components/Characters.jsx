import React, { useEffect, useRef, useState } from 'react'
import './Characters.css'

// ─── Univers (pour le filtrage) ───────────────────────────────────────────────
const UNIVERS = [
  { id: 'tous',     label: 'Tous' },
  { id: 'got',      label: 'Game of Thrones' },
  { id: 'hotd',     label: 'House of the Dragon' },
  { id: 'aksk',     label: 'A Knight of the Seven Kingdoms' },
  { id: 'legende',  label: 'Légendes' },
]

// ─── Regroupements de sous-catégories (maisons / factions / familles) ─────────
// On condense les très nombreuses valeurs de "maison" en quelques familles plus
// larges et lisibles (ex. "Garde de Nuit", "Au-delà du Mur" et "Le Peuple Libre"
// deviennent un seul groupe), pour une liste de sous-filtres plus courte.
// L'ordre détermine la priorité d'attribution quand une maison correspond à
// plusieurs règles (ex. "Maison Stark · Garde de Nuit" → Garde de Nuit en premier).
// Personnages de House of the Dragon dont la "maison" affichée (Strong, Velaryon,
// Targaryen sans étiquette de camp, chevalier sans maison...) ne révèle pas
// directement leur allégeance réelle dans la guerre civile — on les rattache
// donc explicitement au bon camp.
const HOTD_CAMP_NOIR_IDS = ['harwin-strong', 'lyonel-strong', 'rhaenyra']
const HOTD_CAMP_VERT_IDS = ['larys', 'criston-cole']

const GROUPES_MAISON = [
  { id: 'mur',         label: 'Garde de Nuit & Au-delà du Mur',
    test: (p) => /Garde de Nuit|Au-delà du Mur|Peuple Libre|Marcheurs Blancs/.test(p.maison) },
  { id: 'campnoir',    label: 'Camp Noir',
    test: (p) => p.univers === 'hotd' && (HOTD_CAMP_NOIR_IDS.includes(p.id) || /Camp Noir|Velaryon/.test(p.maison)) },
  { id: 'campvert',    label: 'Camp Vert',
    test: (p) => p.univers === 'hotd' && (HOTD_CAMP_VERT_IDS.includes(p.id) || /Camp Vert|Hightower/.test(p.maison)) },
  { id: 'stark',       label: 'Maison Stark',
    test: (p) => /Stark/.test(p.maison) },
  { id: 'lannister',   label: 'Maison Lannister',
    test: (p) => /Lannister/.test(p.maison) },
  // "Garde de Nuit" mise à part, cette catégorie n'a de sens que pour Game of
  // Thrones (un seul personnage Baratheon isolé existe ailleurs, ex. AKOSK).
  { id: 'baratheon',   label: 'Maison Baratheon',
    test: (p) => p.univers === 'got' && /Baratheon/.test(p.maison) },
  // Pour House of the Dragon, on ne garde que Camp Noir / Camp Vert / Autres :
  // une catégorie "Targaryen" générique n'apporterait rien (presque tout le monde
  // l'est). On la garde en revanche pour les autres univers.
  { id: 'targaryen',   label: 'Maison Targaryen',
    test: (p) => p.univers !== 'hotd' && /Targaryen/.test(p.maison) },
  { id: 'greyjoy',     label: 'Maison Greyjoy',
    test: (p) => /Greyjoy/.test(p.maison) },
  { id: 'martell',     label: 'Martell & Dorne',
    test: (p) => /Martell|Dorne/.test(p.maison) },
  { id: 'tully-arryn', label: 'Tully & Arryn',
    test: (p) => /Tully|Arryn/.test(p.maison) },
  // Réservée aux Légendes : ailleurs (ex. Sandor Clegane dans Game of Thrones),
  // ces noms désignent un tout autre personnage et basculent dans "Autres".
  { id: 'figures',     label: 'Figures historiques',
    test: (p) => p.univers === 'legende' && /Dayne|Clegane|Rhoynar/.test(p.maison) },
  { id: 'mythes',      label: 'Rois, reines & mythes',
    test: (p) => /Mythe|Légende des Vergers|Légende Lannister|Légende de la chevalerie|légendaire/.test(p.maison) },
  { id: 'autres',      label: 'Autres maisons & figures',
    test: () => true },
]

// Normalisation pour une recherche insensible aux accents/majuscules
const normalize = (str) =>
  (str || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// ─── Données des personnages ──────────────────────────────────────────────────
// photoPos : position CSS object-position (défaut 'center 20%')
// Ajustez si un visage est coupé : 'center top', 'center 35%', 'center center', etc.
const PERSONNAGES = [
  {
    id: 'jon-snow',
    name: 'Jon Snow',
    titre: 'Commandant de la Garde de Nuit',
    maison: 'Maison Stark · Targaryen',
    acteur: 'Kit Harington',
    accent: '#8fafc4',
    border: '#3a5070',
    univers: 'got',
    photos: [
      { src: '/gif/Jon Snow.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Maison stark/John snow.webp', pos: 'center 15%' },
      { src: '/characters/Game of throne/Maison stark/John snow 1.webp', pos: 'center 15%' },
      { src: '/characters/Game of throne/Maison stark/Jon_snow livre.jpg', pos: 'center 15%' },
    ],
    description:
      'Fils bâtard d\'Eddard Stark, Jon Snow incarne l\'honneur et le sacrifice. Élu Lord Commandant de la Garde de Nuit, il affronte la plus grande menace que Westeros ait jamais connue. Son vrai destin, cependant, dépasse tout ce qu\'il aurait pu imaginer.',
  },
  {
    id: 'daenerys',
    name: 'Daenerys Targaryen',
    titre: 'Mère des Dragons · Khaleesi',
    maison: 'Maison Targaryen',
    acteur: 'Emilia Clarke',
    accent: '#c0392b',
    border: '#7a1a1a',
    univers: 'got',
    photos: [
      { src: '/gif/Daenerys Targaryen.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Targaryen/Daenerys.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Targaryen/Daenerys 1.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Targaryen/daenerys-targaryen.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Targaryen/Daenerys_Targaryen livre.webp', pos: 'center 18%' },
    ],
    description:
      'Dernière héritière des Targaryen, Daenerys a survécu à l\'exil et à la trahison pour devenir la Mère des Dragons. Libératrice des opprimés, elle porte en elle le feu et le sang de ses ancêtres — et la folie qui les accompagne parfois.',
  },
  {
    id: 'tyrion',
    name: 'Tyrion Lannister',
    titre: 'Main du Roi · Main de la Reine',
    maison: 'Maison Lannister',
    acteur: 'Peter Dinklage',
    accent: '#d4a84b',
    border: '#7a6130',
    univers: 'got',
    photos: [
      { src: '/gif/Tyrion Lannister.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Maison lannister/Tyrion_lannister.jpg', pos: 'center 25%' },
      { src: '/characters/Game of throne/Maison lannister/Tyrion lannister.jpg', pos: 'center 25%' },
      { src: '/characters/Game of throne/Maison lannister/Tyrion lannister livre.jpg', pos: 'center 25%' },
    ],
    description:
      'Méprisé par les siens mais armé d\'un esprit redoutable, Tyrion navigue les eaux traîtresses de la politique de Port-Réal avec cynisme et intelligence. Il cherche à faire le bien dans un monde qui ne le lui demande pas.',
  },
  {
    id: 'cersei',
    name: 'Cersei Lannister',
    titre: 'Reine des Sept Royaumes',
    maison: 'Maison Lannister',
    acteur: 'Lena Headey',
    accent: '#c9a84c',
    border: '#7a6130',
    univers: 'got',
    photos: [
      { src: '/gif/Cersei Lannister.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Maison lannister/cersei_lannister.webp', pos: 'center 10%' },
      { src: '/characters/Game of throne/Maison lannister/Cercei livre.jpg', pos: '88% 50%' },
    ],
    description:
      'Intelligente, impitoyable et profondément maternelle. Cersei a grandi dans l\'ombre de son père et dans les bras d\'un roi qu\'elle méprisait. Son amour pour ses enfants est la seule chose pure en elle — et son arme la plus dangereuse.',
  },
  {
    id: 'arya',
    name: 'Arya Stark',
    titre: 'Assassin · Sans Visage',
    maison: 'Maison Stark',
    acteur: 'Maisie Williams',
    accent: '#8fafc4',
    border: '#3a5070',
    univers: 'got',
    photos: [
      { src: '/gif/Arya Stark.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Maison stark/arya.webp', pos: 'center 20%' },
      { src: '/characters/Game of throne/Maison stark/arya 1.webp', pos: 'center 20%' },
      { src: '/characters/Game of throne/Maison stark/Arya livre.jpg', pos: 'center 20%' },
    ],
    description:
      'La plus jeune des filles Stark refuse le destin tracé pour elle. Forgée par la perte et la violence, Arya devient une tueuse entraînée par les Hommes Sans Visage. Sa liste de noms est longue — et elle ne l\'a pas encore terminée.',
  },
  {
    id: 'ned',
    name: 'Eddard Stark',
    titre: 'Seigneur de Winterfell · Main du Roi',
    maison: 'Maison Stark',
    acteur: 'Sean Bean',
    accent: '#8fafc4',
    border: '#3a5070',
    univers: 'got',
    photos: [
      { src: '/gif/Eddard Stark.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Maison stark/Ned-stark.jpg', pos: 'center 12%' },
      { src: '/characters/Game of throne/Maison stark/Eddard_stark.jpg', pos: '62% 50%' },
      { src: '/characters/Game of throne/Maison stark/ned livre.jpg', pos: 'center 12%' },
      { src: "/characters/Game of throne/Maison stark/Ned_Stark's livre.jpg", pos: 'center 12%' },
    ],
    description:
      'Homme d\'honneur dans un monde de trahisons, Ned Stark descend dans le jeu des trônes avec la certitude que la justice prévaudra. Son intégrité sera sa grandeur — et sa perte. Certaines leçons de Westeros se paient au prix fort.',
  },
  {
    id: 'sansa',
    name: 'Sansa Stark',
    titre: 'Dame de Winterfell · Reine du Nord',
    maison: 'Maison Stark',
    acteur: 'Sophie Turner',
    accent: '#8fafc4',
    border: '#3a5070',
    univers: 'got',
    photos: [
      { src: '/gif/Sansa Stark.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Maison stark/sansa-stark.jpg', pos: 'center 10%' },
      { src: '/characters/Game of throne/Maison stark/sansa.jpg', pos: 'center 10%' },
      { src: '/characters/Game of throne/Maison stark/sansa livre.jpg', pos: 'center 10%' },
      { src: '/characters/Game of throne/Maison stark/sansa livre 2.jpg', pos: 'center 10%' },
    ],
    description:
      'Prisonnière de ses propres rêves de chevaliers et de princes, Sansa apprend à ses dépens les vraies règles de Westeros. De naïve brisée par le destin, elle devient une joueuse redoutable — l\'acier caché sous la soie.',
  },
  {
    id: 'jaime',
    name: 'Jaime Lannister',
    titre: 'Le Régicide · Chevalier de la Garde Royale',
    maison: 'Maison Lannister',
    acteur: 'Nikolaj Coster-Waldau',
    accent: '#d4a84b',
    border: '#7a6130',
    univers: 'got',
    photos: [
      { src: '/gif/Jaime Lannister.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Maison lannister/jaime-lannisters.webp', pos: 'center 18%' },
      { src: '/characters/Game of throne/Maison lannister/jamie-lannister.webp', pos: 'center 18%' },
      { src: '/characters/Game of throne/Maison lannister/Jaime livre.webp', pos: 'center 18%' },
    ],
    description:
      'Surnommé le Régicide pour avoir tué le roi qu\'il jurait de protéger, Jaime est l\'homme le plus méprisé de Westeros — et peut-être l\'un des plus incompris. Sous l\'armure dorée se cache une âme qui a choisi le moindre mal.',
  },
  {
    id: 'joffrey',
    name: 'Joffrey Baratheon',
    titre: 'Roi des Sept Royaumes',
    maison: 'Maison Baratheon · Lannister',
    acteur: 'Jack Gleeson',
    accent: '#c9a84c',
    border: '#5a5020',
    univers: 'got',
    photos: [
      { src: '/gif/Joffrey Baratheon.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Baratheon/Joffrey-Baratheon.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Baratheon/joffrey.webp', pos: 'center 15%' },
      { src: '/characters/Game of throne/Baratheon/Joffrey_Baratheon livre.webp', pos: 'center 15%' },
    ],
    description:
      'Cruel, capricieux et lâche, Joffrey est l\'un des rois les plus redoutés et les plus détestés de Westeros. Protégé par le pouvoir de sa mère, il transforme le Trône de Fer en instrument de tyrannie pure.',
  },
  {
    id: 'bran',
    name: 'Bran Stark',
    titre: 'Le Corbeau à Trois Yeux',
    maison: 'Maison Stark',
    acteur: 'Isaac Hempstead Wright',
    accent: '#8fafc4',
    border: '#3a5070',
    univers: 'got',
    photos: [
      { src: '/gif/Bran Stark.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Maison stark/bran.jpg', pos: 'center 20%' },
      { src: '/characters/Game of throne/Maison stark/bran 1.jpg', pos: 'center 20%' },
      { src: '/characters/Game of throne/Maison stark/bran-stark livre.webp', pos: 'center 20%' },
    ],
    description:
      'Après sa chute de la tour de Winterfell, Bran n\'est plus tout à fait humain. Guidé au-delà du Mur par ses visions, il devient le Corbeau à Trois Yeux — gardien de la mémoire du monde, voyant le passé, le présent et l\'avenir.',
  },
  {
    id: 'robb',
    name: 'Robb Stark',
    titre: 'Le Jeune Loup · Roi du Nord',
    maison: 'Maison Stark',
    acteur: 'Richard Madden',
    accent: '#8fafc4',
    border: '#3a5070',
    univers: 'got',
    photos: [
      { src: '/gif/Robb Stark.webp', pos: '83% center' },
      { src: '/characters/Game of throne/Maison stark/Robb Stark.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Maison stark/Robb Stark 1.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Maison stark/Robb Stark 2.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Maison stark/Robb Stark 3.jpg', pos: 'center 15%' },
    ],
    description:
      'Couronné Roi du Nord après l\'exécution de son père, Robb remporte chaque bataille qu\'il mène — le Jeune Loup semble invincible sur le champ de guerre. C\'est dans une salle de banquet, et non sur un champ de bataille, que sa légende prendra fin.',
  },
  {
    id: 'theon',
    name: 'Theon Greyjoy',
    titre: 'Prince des Îles de Fer',
    maison: 'Maison Greyjoy',
    acteur: 'Alfie Allen',
    accent: '#b8a040',
    border: '#3a4a5a',
    univers: 'got',
    photos: [
      { src: '/gif/Theon Greyjoy.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Greyjoy/Theon_Greyjoy.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Greyjoy/theon.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Greyjoy/Theon_Greyjoy livre.jpg', pos: 'center 15%' },
    ],
    description:
      'Élevé comme otage à Winterfell, Theon ne sait pas vraiment à quelle maison il appartient. Sa trahison des Stark le mènera à l\'esclavage le plus total — mais de ces cendres naîtra peut-être une rédemption.',
  },
  {
    id: 'sandor',
    name: 'Sandor Clegane',
    titre: 'Le Limier · Frère de la Montagne',
    maison: 'Maison Clegane',
    acteur: 'Rory McCann',
    accent: '#6a6050',
    border: '#262018',
    univers: 'got',
    photos: [
      { src: '/gif/Sandor Clegane.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Personnage annexe/Sandor Clegane.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Personnage annexe/Sandor Clegane Le Limier.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Personnage annexe/Sandor Clegane 2.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Personnage annexe/Sandor Clegane 3.jpg', pos: 'center 15%' },
    ],
    description:
      'Le visage à moitié brûlé par son propre frère dans son enfance, Sandor Clegane porte la rage et la peur du feu comme deux blessures jumelles. Brutal en apparence, protecteur d\'Arya et de Sansa malgré lui, le Limier cache sous son armure un homme qui ne demandait qu\'à être vu autrement.',
  },
  {
    id: 'tywin',
    name: 'Tywin Lannister',
    titre: 'Seigneur de Castral Roc · Main du Roi',
    maison: 'Maison Lannister',
    acteur: 'Charles Dance',
    accent: '#d4a84b',
    border: '#7a6130',
    univers: 'got',
    photos: [
      { src: '/gif/Tywin Lannister.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Maison lannister/Tywin Lannister 4.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Maison lannister/Tywin Lannister.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Maison lannister/Tywin Lannister 1.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Maison lannister/Tywin Lannister 2.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Maison lannister/Tywin Lannister 3.jpg', pos: 'center 15%' },
    ],
    description:
      'Patriarche froid et calculateur, Tywin a fait de Castral Roc la maison la plus riche et la plus redoutée de Westeros — au prix de tout sentiment. Méprisant envers Tyrion, déçu par Cersei, idolâtre de Jaime, il incarne un héritage si lourd qu\'il finira par l\'écraser.',
  },
  {
    id: 'catelyn',
    name: 'Catelyn Stark',
    titre: 'Dame de Winterfell · Née Tully',
    maison: 'Maison Stark · Tully',
    acteur: 'Michelle Fairley',
    accent: '#8fafc4',
    border: '#3a5070',
    univers: 'got',
    photos: [
      { src: '/gif/Catelyn Stark.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Maison stark/catelyn.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Maison stark/catelyn 1.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Maison stark/catelyn 2.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Maison stark/catelyn 3.jpg', pos: 'center 18%' },
    ],
    description:
      'Mère avant tout, Catelyn ferait n\'importe quoi pour protéger ses enfants — y compris déclencher une guerre. Son amour farouche pour sa famille et sa méfiance envers le bâtard de son mari façonnent des choix qui pèseront lourd sur le destin des Stark.',
  },
  {
    id: 'brienne',
    name: 'Brienne de Torth',
    titre: 'La Pucelle de Torth · Chevalier de Westeros',
    maison: 'Maison Tarth',
    acteur: 'Gwendoline Christie',
    accent: '#9fb89f',
    border: '#3a4a3a',
    univers: 'got',
    photos: [
      { src: '/gif/Brienne de Torth.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Personnage annexe/Brienne de Torth.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Personnage annexe/Brienne de Torth 1.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Personnage annexe/Brienne de Torth 2.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Personnage annexe/Brienne de Torth 3.jpg', pos: 'center 18%' },
    ],
    description:
      'Moquée pour son physique et sa volonté de devenir chevalier dans un monde d\'hommes, Brienne prouve par chaque combat que l\'honneur ne connaît ni sexe ni apparence. Son serment envers Catelyn, puis envers Sansa et Arya, la mènera jusqu\'au titre que personne ne croyait possible.',
  },
  {
    id: 'petyr-baelish',
    name: 'Petyr Baelish',
    titre: 'Littlefinger · Seigneur du Val d\'Arryn',
    maison: 'Maison Baelish',
    acteur: 'Aidan Gillen',
    accent: '#6a6050',
    border: '#262018',
    univers: 'got',
    photos: [
      { src: '/gif/Petyr Baelish.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Personnage annexe/Petyr Baelish.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Personnage annexe/Petyr Baelish 1.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Personnage annexe/Petyr Baelish 2.jpg', pos: '20% 50%' },
    ],
    description:
      '"Le chaos n\'est pas un gouffre, c\'est une échelle." Né de rien, Littlefinger gravit les échelons du pouvoir à coups de manipulations, de mensonges et d\'amours feintes. Son obsession pour Catelyn, puis pour Sansa, finira par se retourner contre lui — face à des élèves devenues plus habiles que le maître.',
  },
  {
    id: 'varys',
    name: 'Lord Varys',
    titre: 'Le Maître des Chuchoteurs · L\'Araignée',
    maison: 'Conseiller sans maison',
    acteur: 'Conleth Hill',
    accent: '#6a6050',
    border: '#262018',
    univers: 'got',
    photos: [
      { src: '/characters/Game of throne/Personnage annexe/Lord Varys.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Personnage annexe/Lord Varys 1.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Personnage annexe/Lord Varys 2.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Personnage annexe/Lord Varys 3.jpg', pos: '60% 50%' },
    ],
    description:
      'Eunuque au passé trouble et au réseau d\'espions tissé sur tout le continent, Varys joue un jeu que lui seul comprend vraiment : celui de placer sur le trône le souverain qui servira le mieux le royaume. Sa loyauté ultime n\'appartient ni à un roi, ni à une reine — mais au peuple lui-même.',
  },
  {
    id: 'stannis',
    name: 'Stannis Baratheon',
    titre: 'Seigneur de Peyredragon · Le Roi dans la Lumière',
    maison: 'Maison Baratheon',
    acteur: 'Stephen Dillane',
    accent: '#c9a84c',
    border: '#5a5020',
    univers: 'got',
    photos: [
      { src: '/gif/Stannis Baratheon.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Baratheon/Stannis Baratheon.jpg', pos: 'center 12%' },
      { src: '/characters/Game of throne/Baratheon/Stannis Baratheon 1.jpg', pos: 'center 12%' },
      { src: '/characters/Game of throne/Baratheon/Stannis Baratheon 2.jpg', pos: 'center 12%' },
      { src: '/characters/Game of throne/Baratheon/Stannis Baratheon 3.jpg', pos: 'center 12%' },
      { src: '/characters/Game of throne/Baratheon/Stannis Baratheon 4.jpg', pos: 'center 12%' },
    ],
    description:
      'Rigide, juste jusqu\'à l\'os, Stannis a passé sa vie dans l\'ombre de ses frères. Convaincu d\'être l\'héritier légitime du Trône de Fer, il se tourne vers le feu de R\'hllor pour réclamer ce qui lui revient — quitte à sacrifier ce qu\'il a de plus précieux pour l\'obtenir.',
  },
  {
    id: 'melisandre',
    name: 'Mélisandre',
    titre: 'La Femme Rouge · Prêtresse de R\'hllor',
    maison: 'Servante du Seigneur de Lumière',
    acteur: 'Carice van Houten',
    accent: '#c0392b',
    border: '#7a1a1a',
    univers: 'got',
    photos: [
      { src: '/gif/Mélisandre.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Personnage annexe/Melisandre.jpg', pos: 'center 12%' },
      { src: '/characters/Game of throne/Personnage annexe/Melisandre livre.jpg', pos: 'center 12%' },
    ],
    description:
      'Venue des terres de l\'est, Mélisandre voit dans les flammes des vérités que les hommes refusent d\'accepter. Sa foi en R\'hllor est absolue — et ses méthodes le sont tout autant. Elle a vécu des siècles. Elle en a vu mourir des milliers.',
  },
  {
    id: 'khal-drogo',
    name: 'Khal Drogo',
    titre: 'Khal du Khalasar · Étalon qui Montera le Monde',
    maison: 'Khalasar Dothraki',
    acteur: 'Jason Momoa',
    accent: '#c98a4a',
    border: '#5a3a1a',
    univers: 'got',
    photos: [
      { src: '/gif/Khal Drogo.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Essos (storyline Daenerys)/Khal Drogo.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Essos (storyline Daenerys)/Khal Drogo 1.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Essos (storyline Daenerys)/Khal Drogo 2.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Essos (storyline Daenerys)/Khal Drogo 3.jpg', pos: 'center center' },
    ],
    description:
      'Seigneur de guerre redouté de la mer Dothrak, Drogo a uni quarante mille cavaliers sous sa bannière. Époux de Daenerys par alliance forcée, il devient malgré lui l\'homme qui éveillera en elle la dragonne — avant qu\'une simple blessure ne scelle son destin.',
  },
  {
    id: 'robert',
    name: 'Robert Baratheon',
    titre: 'Roi des Sept Royaumes · Le Briseur de Trône',
    maison: 'Maison Baratheon',
    acteur: 'Mark Addy',
    accent: '#c9a84c',
    border: '#5a5020',
    univers: 'got',
    photos: [
      { src: '/gif/Robert Baratheon.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Baratheon/Robert Baratheon.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Baratheon/Robert Baratheon 1.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Baratheon/Robert Baratheon 2.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Baratheon/Robert Baratheon 3.jpg', pos: '30% 20%' },
    ],
    description:
      'Vainqueur de la rébellion qui mit fin au règne des Targaryen, Robert s\'est forgé une légende à coups de masse d\'armes — et l\'a noyée depuis dans le vin et les regrets. Sur le Trône de Fer, le grand guerrier d\'autrefois n\'est plus qu\'un roi fatigué, hanté par l\'amour qu\'il n\'a jamais oublié.',
  },
  {
    id: 'samwell',
    name: 'Samwell Tarly',
    titre: 'Frère juré de la Garde de Nuit · Archimestre',
    maison: 'Garde de Nuit · Maison Tarly',
    acteur: 'John Bradley',
    accent: '#7a8a8a',
    border: '#262e2e',
    univers: 'got',
    photos: [
      { src: '/gif/Samwell Tarly.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Samwell Tarly.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Samwell Tarly 1.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Samwell Tarly 2.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Samwell Tarly 3.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Samwell Tarly 4.jpg', pos: '35% 50%' },
    ],
    description:
      'Rejeté par un père qui voulait un guerrier, Sam trouve à Châteaunoir ce qu\'il n\'a jamais eu : des amis, un but, et la preuve que le courage ne se mesure pas à la force d\'une épée. C\'est lui qui, en fouillant les archives de la Citadelle, percera le secret le mieux gardé de Jon Snow.',
  },
  {
    id: 'davos',
    name: 'Davos Seaworth',
    titre: 'Le Chevalier Oignon · Main de la Reine',
    maison: 'Chevalier sans maison',
    acteur: 'Liam Cunningham',
    accent: '#8a9a6a',
    border: '#33402a',
    univers: 'got',
    photos: [
      { src: '/gif/Davos Seaworth.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Personnage annexe/Davos Seaworth.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Personnage annexe/Davos Seaworth 1.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Personnage annexe/Davos Seaworth 2.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Personnage annexe/Davos Seaworth 3.jpg', pos: 'center 18%' },
    ],
    description:
      'Ancien contrebandier anobli pour avoir brisé un siège avec une cargaison d\'oignons, Davos porte sur sa main mutilée la preuve de sa loyauté envers Stannis. Honnête jusqu\'à l\'os, il devient la conscience — et le plus fidèle conseiller — de Jon Snow.',
  },
  {
    id: 'tormund',
    name: 'Tormund Giantsbane',
    titre: 'Tueur de Géants · Chef du Peuple Libre',
    maison: 'Le Peuple Libre',
    acteur: 'Kristofer Hivju',
    accent: '#8a9a6a',
    border: '#33402a',
    univers: 'got',
    photos: [
      { src: '/gif/Tormund Giantsbane.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Tormund Giantsbane.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Tormund Giantsbane 1.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Tormund Giantsbane 2.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Tormund Giantsbane 3.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Tormund Giantsbane 4.jpg', pos: 'center 18%' },
    ],
    description:
      'Géant de chair et de rire, Tormund a tué des géants, bu plus que de raison et raconté ses exploits avec un enthousiasme qui efface toute frontière entre vérité et légende. Son admiration sincère pour Brienne de Torth est aussi inattendue que touchante — et résolument à sens unique.',
  },
  {
    id: 'ygritte',
    name: 'Ygritte',
    titre: 'Pillarde Sauvageonne · "Tu ne sais rien"',
    maison: 'Le Peuple Libre',
    acteur: 'Rose Leslie',
    accent: '#8a9a6a',
    border: '#33402a',
    univers: 'got',
    photos: [
      { src: '/gif/Ygritte.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Ygritte.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Ygritte 1.jpg', pos: 'center 26%' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Ygritte 2.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Ygritte 3.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Ygritte 4.jpg', pos: 'center 18%' },
    ],
    description:
      'Pillarde libre et fière, Ygritte capture Jon Snow — et capture bien davantage encore. Leur amour impossible, né dans une grotte au-delà du Mur, se brisera sur l\'autel du devoir. "Tu ne sais rien, Jon Snow" restera, bien après elle, gravé dans son cœur.',
  },
  {
    id: 'margaery',
    name: 'Margaery Tyrell',
    titre: 'Reine des Sept Royaumes · Rose de HauteJardin',
    maison: 'Maison Tyrell',
    acteur: 'Natalie Dormer',
    accent: '#8fbf5f',
    border: '#3a5a28',
    univers: 'got',
    photos: [
      { src: '/gif/Margaery Tyrell.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Personnage annexe/Margaery Tyrell.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Personnage annexe/Margaery Tyrell 1.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Personnage annexe/Margaery Tyrell 2.jpg', pos: '20% 50%' },
      { src: '/characters/Game of throne/Personnage annexe/Margaery Tyrell 3.jpg', pos: 'center 15%' },
    ],
    description:
      'Belle, intelligente et redoutablement habile, Margaery épouse les rois comme on gravit des marches — avec le sourire et le calcul. Sa popularité grandissante auprès du peuple de Port-Réal en fait une rivale dangereuse pour Cersei, qui ne le lui pardonnera jamais.',
  },
  {
    id: 'oberyn',
    name: 'Oberyn Martell',
    titre: 'La Vipère Rouge de Dorne',
    maison: 'Maison Martell · Dorne',
    acteur: 'Pedro Pascal',
    accent: '#e08030',
    border: '#6a3010',
    univers: 'got',
    photos: [
      { src: '/gif/Oberyn Martell.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Personnage annexe/Oberyn Martell.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Personnage annexe/Oberyn Martell  1.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Personnage annexe/Oberyn Martell  2.jpg', pos: '28% 30%' },
      { src: '/characters/Game of throne/Personnage annexe/Oberyn Martell  3.webp', pos: 'center 18%' },
    ],
    description:
      'Charismatique, libre et redoutable à la lance, le prince Oberyn vient à Port-Réal pour venger sa sœur Elia, assassinée durant le sac de la ville. Son combat en champion contre la Montagne restera l\'un des duels les plus mémorables — et les plus horrifiants — de toute la série.',
  },
  {
    id: 'olenna',
    name: 'Olenna Tyrell',
    titre: 'La Reine des Épines',
    maison: 'Maison Tyrell',
    acteur: 'Diana Rigg',
    accent: '#8fbf5f',
    border: '#3a5a28',
    univers: 'got',
    photos: [
      { src: '/gif/Olenna Tyrell.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Personnage annexe/Olenna Tyrell.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Personnage annexe/Olenna Tyrell 1.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Personnage annexe/Olenna Tyrell 2.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Personnage annexe/Olenna Tyrell 3.jpg', pos: 'center 15%' },
    ],
    description:
      'Matriarche acerbe à la langue plus tranchante que n\'importe quelle épée, Olenna ne pardonne jamais qu\'on s\'en prenne aux siens. Le sourire glacial avec lequel elle révèle, à la toute fin, qui a réellement empoisonné Joffrey restera l\'un des adieux les plus savoureux de la série.',
  },
  {
    id: 'bronn',
    name: 'Bronn',
    titre: 'Mercenaire de Culpucier · Chevalier de Bourg-Vert',
    maison: 'Sellsword sans maison',
    acteur: 'Jerome Flynn',
    accent: '#c98a4a',
    border: '#5a3a1a',
    univers: 'got',
    photos: [
      { src: '/gif/Bronn.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Personnage annexe/Bronn.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Personnage annexe/Bronn 1.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Personnage annexe/Bronn 2.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Personnage annexe/Bronn 3.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Personnage annexe/Bronn 4.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Personnage annexe/Bronn 5.jpg', pos: 'center 18%' },
    ],
    description:
      'Épée louée sans foi ni loi, Bronn vend ses talents au plus offrant — et finit par s\'attacher, presque malgré lui, à Tyrion et Jaime Lannister. Son cynisme désinvolte et son sens aigu de la survie en font l\'un des personnages les plus savoureux de Westeros.',
  },
  {
    id: 'ramsay',
    name: 'Ramsay Bolton',
    titre: 'Bâtard de Fort-Terreur · Seigneur de Winterfell',
    maison: 'Maison Bolton',
    acteur: 'Iwan Rheon',
    accent: '#a04848',
    border: '#2a1818',
    univers: 'got',
    photos: [
      { src: '/gif/Ramsay Bolton.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Maison Bolton et Frey/Ramsay Bolton.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Maison Bolton et Frey/Ramsay Bolton 1.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Maison Bolton et Frey/Ramsay Bolton 2.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Maison Bolton et Frey/Ramsay Bolton 3.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Maison Bolton et Frey/Ramsay Bolton 4.jpg', pos: 'center 18%' },
    ],
    description:
      'Bâtard légitimé de Roose Bolton, Ramsay cultive la cruauté comme un art et la torture comme un loisir. Son sourire engageant masque l\'un des esprits les plus tordus de Westeros — un monstre que même son propre père finira par redouter.',
  },
  {
    id: 'gendry',
    name: 'Gendry',
    titre: 'Bâtard de Robert Baratheon · Seigneur de Accalmie',
    maison: 'Maison Baratheon (bâtard)',
    acteur: 'Joe Dempsie',
    accent: '#c9a84c',
    border: '#5a5020',
    univers: 'got',
    photos: [
      { src: '/characters/Game of throne/Personnage annexe/Gendry.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Personnage annexe/Gendry 1.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Personnage annexe/Gendry 2.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Personnage annexe/Gendry 3.jpg', pos: 'center 18%' },
    ],
    description:
      'Forgeron de Culpucier sans savoir qu\'il porte dans ses veines le sang du roi Robert, Gendry échappe de justesse au sang-magie de Mélisandre. Son destin de bâtard royal le rattrape lorsque Daenerys, dans un geste inattendu, en fait un seigneur légitime.',
  },
  {
    id: 'missandei',
    name: 'Missandei',
    titre: 'Conseillère et Traductrice de Daenerys',
    maison: 'Native de Naath',
    acteur: 'Nathalie Emmanuel',
    accent: '#5fa8c9',
    border: '#1c3a4a',
    univers: 'got',
    photos: [
      { src: '/gif/Missandei.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Personnage annexe/Missandei.png', pos: 'center 18%' },
      { src: '/characters/Game of throne/Personnage annexe/Missandei 2.webp', pos: 'center 18%' },
      { src: '/characters/Game of throne/Personnage annexe/Missandei 3.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Personnage annexe/Missandei 4.jpg', pos: 'center 18%' },
    ],
    description:
      'Esclave polyglotte affranchie par Daenerys, Missandei devient sa confidente la plus proche et la voix de ses ambitions à travers Essos. Son amour pour Grey Worm, d\'une tendresse rare dans cet univers impitoyable, se terminera dans les chaînes — à Port-Réal, sous le regard de la femme qu\'elle servait.',
  },
  {
    id: 'grey-worm',
    name: 'Grey Worm',
    titre: 'Commandant des Immaculés',
    maison: 'Les Immaculés',
    acteur: 'Jacob Anderson',
    accent: '#5fa8c9',
    border: '#1c3a4a',
    univers: 'got',
    photos: [
      { src: '/gif/Grey Worm.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Personnage annexe/Grey Worm.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Personnage annexe/Grey Worm 1.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Personnage annexe/Grey Worm 2.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Personnage annexe/Grey Worm 3.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Personnage annexe/Grey Worm 4.jpg', pos: 'center 18%' },
    ],
    description:
      'Esclave-soldat élevé sans nom ni émotion, Grey Worm trouve la liberté — et l\'amour — en suivant Daenerys. Commandant implacable des Immaculés, il découvre dans les bras de Missandei une humanité que son entraînement aurait dû éradiquer à jamais.',
  },
  {
    id: 'brynden-tully',
    name: 'Brynden Tully',
    titre: 'Le Silure · Maître de Vivesaigues',
    maison: 'Maison Tully',
    acteur: 'Clive Russell',
    accent: '#5b8fc9',
    border: '#1f3a5a',
    univers: 'got',
    photos: [
      { src: '/characters/Game of throne/Maison Tully & Arryn/Brynden Blackfish Tully.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Maison Tully & Arryn/Brynden Blackfish Tully  1.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Maison Tully & Arryn/Brynden Blackfish Tully  2.jpg', pos: 'center 12%' },
    ],
    description:
      'Surnommé le Silure pour son obstination légendaire, Brynden Tully est de ces guerriers qu\'aucune défaite ne semble pouvoir abattre. Oncle de Catelyn, il continuera de défendre Vivesaigues bien après que tous les autres auront rendu les armes.',
  },
  {
    id: 'roose',
    name: 'Roose Bolton',
    titre: 'Seigneur de Fort-Terreur · Gardien du Nord',
    maison: 'Maison Bolton',
    acteur: 'Michael McElhatton',
    accent: '#a04848',
    border: '#2a1818',
    univers: 'got',
    photos: [
      { src: '/gif/Roose Bolton.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Maison Bolton et Frey/Roose Bolton.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Maison Bolton et Frey/Roose Bolton 1.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Maison Bolton et Frey/Roose Bolton 2.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Maison Bolton et Frey/Roose Bolton 3.jpg', pos: 'center 18%' },
    ],
    description:
      'Voix monocorde, regard sans fond — Roose Bolton trahit son suzerain Robb Stark lors des Noces Pourpres et s\'empare du Nord par le sang et le calcul. Glacial même dans la victoire, il sait que le pouvoir qu\'il a volé ne lui survivra peut-être pas longtemps.',
  },
  {
    id: 'tommen',
    name: 'Tommen Baratheon',
    titre: 'Roi des Sept Royaumes · Le Plus Jeune Lion',
    maison: 'Maison Baratheon · Lannister',
    acteur: 'Dean-Charles Chapman',
    accent: '#d4a84b',
    border: '#7a6130',
    univers: 'got',
    photos: [
      { src: '/gif/Tommen Baratheon.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Maison lannister/Tommen Baratheon.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Maison lannister/Tommen Baratheon 1.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Maison lannister/Tommen Baratheon 2.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Maison lannister/Tommen Baratheon 3.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Maison lannister/Tommen Baratheon 4.jpg', pos: 'center 15%' },
    ],
    description:
      'Doux, naïf et profondément aimant, Tommen est tout l\'inverse de son frère Joffrey. Roi malgré lui, écartelé entre l\'amour de sa mère et celui de sa jeune épouse Margaery, il s\'effondre lorsque le monde qu\'il croyait pouvoir protéger explose en flammes vertes.',
  },
  {
    id: 'myrcella',
    name: 'Myrcella Baratheon',
    titre: 'Princesse de Port-Réal · Promise de Dorne',
    maison: 'Maison Baratheon · Lannister',
    acteur: 'Nell Tiger Free',
    accent: '#d4a84b',
    border: '#7a6130',
    univers: 'got',
    photos: [
      { src: '/gif/Myrcella Baratheon.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Maison lannister/Myrcella Baratheon.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Maison lannister/Myrcella Baratheon 1.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Maison lannister/Myrcella Baratheon 2.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Maison lannister/Myrcella Baratheon 3.jpg', pos: 'center 18%' },
    ],
    description:
      'Envoyée à Dorne pour sceller une alliance par le mariage, Myrcella découvre loin de Port-Réal une douceur de vivre — et un amour sincère pour Trystane Martell — qu\'elle n\'aurait jamais connus à la cour. Sa fin tragique brisera le cœur de la seule personne qui l\'a jamais aimée sans calcul : sa mère.',
  },
  {
    id: 'renly',
    name: 'Renly Baratheon',
    titre: 'Seigneur de Accalmie · Prétendant au Trône',
    maison: 'Maison Baratheon',
    acteur: 'Gethin Anthony',
    accent: '#c9a84c',
    border: '#5a5020',
    univers: 'got',
    photos: [
      { src: '/gif/Renly Baratheon.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Baratheon/Renly Baratheon.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Baratheon/Renly Baratheon 1.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Baratheon/Renly Baratheon 2.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Baratheon/Renly Baratheon 3.jpg', pos: 'center 15%' },
    ],
    description:
      'Le plus jeune des frères Baratheon est aussi le plus aimé du peuple — charismatique, élégant, entouré d\'une cour brillante. Quand son frère Robert meurt, Renly revendique le trône avec l\'armée la plus puissante de Westeros. Une ombre, pourtant, rôde autour de sa tente.',
  },
  {
    id: 'loras',
    name: 'Loras Tyrell',
    titre: 'Le Chevalier des Fleurs',
    maison: 'Maison Tyrell',
    acteur: 'Finn Jones',
    accent: '#8fbf5f',
    border: '#3a5a28',
    univers: 'got',
    photos: [
      { src: '/gif/Loras Tyrell.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Port-Réal & politique/Loras Tyrell.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Port-Réal & politique/Loras Tyrell 1.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Port-Réal & politique/Loras Tyrell 2.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Port-Réal & politique/Loras Tyrell 3.jpg', pos: 'center 15%' },
    ],
    description:
      'Chevalier le plus brillant de HauteJardin, Loras remporte les tournois avec une grâce qui fascine la cour entière. Son amour secret pour Renly Baratheon, et la persécution qui s\'ensuit sous la férule des Pauvres Compagnons, mèneront la maison Tyrell vers sa perte.',
  },
  {
    id: 'jorah',
    name: 'Ser Jorah Mormont',
    titre: 'Chevalier exilé · Protecteur de Daenerys',
    maison: 'Maison Mormont',
    acteur: 'Iain Glen',
    accent: '#8fafc4',
    border: '#3a5070',
    univers: 'got',
    photos: [
      { src: '/gif/Ser Jorah Mormont.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Personnage annexe/Ser Jorah Mormont.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Personnage annexe/Ser Jorah Mormont 1.webp', pos: 'center 18%' },
      { src: '/characters/Game of throne/Personnage annexe/Ser Jorah Mormont 2.jpg', pos: 'center 18%' },
    ],
    description:
      'Exilé pour avoir vendu des braconniers en esclavage, Jorah trouve une rédemption inattendue en devenant le protecteur dévoué — et l\'amoureux silencieux — de Daenerys. Son amour, jamais déclaré, jamais réciproque, le conduira jusqu\'aux portes de la mort, et au-delà, pour elle.',
  },
  {
    id: 'walder-frey',
    name: 'Walder Frey',
    titre: 'Seigneur du Pont des Jumeaux',
    maison: 'Maison Frey',
    acteur: 'David Bradley',
    accent: '#7888a0',
    border: '#2a3340',
    univers: 'got',
    photos: [
      { src: '/gif/Walder Frey.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Maison Bolton et Frey/Walder Frey.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Maison Bolton et Frey/Walder Frey 1.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Maison Bolton et Frey/Walder Frey 2.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Maison Bolton et Frey/Walder Frey 3.jpg', pos: 'center 18%' },
    ],
    description:
      'Vieillard acariâtre à la tête d\'une maison pléthorique, Walder Frey n\'oublie jamais un affront — surtout quand il s\'agit d\'un mariage rompu. Son hospitalité empoisonnée lors des Noces Pourpres restera dans les mémoires comme l\'une des plus grandes trahisons de Westeros.',
  },
  {
    id: 'hodor',
    name: 'Hodor',
    titre: 'Palefrenier de Winterfell · "Hodor"',
    maison: 'Serviteur de la Maison Stark',
    acteur: 'Kristian Nairn',
    accent: '#8fafc4',
    border: '#3a5070',
    univers: 'got',
    photos: [
      { src: '/characters/Game of throne/Personnage annexe/Hodor.jpg', pos: 'center 22%' },
      { src: '/characters/Game of throne/Personnage annexe/Hodor 1.jpg', pos: 'center 22%' },
      { src: '/characters/Game of throne/Personnage annexe/Hodor 2.jpg', pos: 'center 22%' },
    ],
    description:
      'Doux géant incapable de prononcer un autre mot que son propre nom, Hodor porte Bran sur son dos à travers les pires dangers de Westeros. Le terrible secret de son unique mot — révélé dans une scène devenue culte — fera de lui l\'un des personnages les plus déchirants de la série.',
  },
  {
    id: 'lyanna-mormont',
    name: 'Lyanna Mormont',
    titre: 'Dame de l\'Île de Bearne',
    maison: 'Maison Mormont',
    acteur: 'Bella Ramsey',
    accent: '#8fafc4',
    border: '#3a5070',
    univers: 'got',
    photos: [
      { src: '/gif/Lyanna Mormont.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Maison stark/Lyanna Mormont.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Maison stark/Lyanna Mormont 1.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Maison stark/Lyanna Mormont 2.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Maison stark/Lyanna Mormont 3.jpg', pos: 'center 18%' },
    ],
    description:
      'À peine adolescente, Lyanna gouverne Bearne avec une autorité qui ferait pâlir des seigneurs deux fois son âge. Sa franchise cinglante et son courage au combat — jusqu\'à terrasser un géant mort-vivant — en font l\'une des figures les plus respectées du Nord.',
  },
  {
    id: 'rickon',
    name: 'Rickon Stark',
    titre: 'Le Plus Jeune Fils de Winterfell',
    maison: 'Maison Stark',
    acteur: 'Art Parkinson',
    accent: '#8fafc4',
    border: '#3a5070',
    univers: 'got',
    photos: [
      { src: '/gif/Rickon Stark.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Maison stark/Rickon Stark.jpg', pos: 'center 22%' },
      { src: '/characters/Game of throne/Maison stark/Rickon Stark 1.jpg', pos: 'center 22%' },
      { src: '/characters/Game of throne/Maison stark/Rickon Stark 2.jpg', pos: 'center 22%' },
    ],
    description:
      'Le plus jeune des enfants Stark fuit Winterfell avec Osha et son loup-garou Vent Gris à la chute de sa maison. Des années plus tard, il refait surface — un pion que Ramsay Bolton utilisera sans pitié dans le plus cruel des jeux de chasse.',
  },
  {
    id: 'yara',
    name: 'Yara Greyjoy',
    titre: 'Princesse des Îles de Fer · Capitaine du Vent Noir',
    maison: 'Maison Greyjoy',
    acteur: 'Gemma Whelan',
    accent: '#b8a040',
    border: '#3a4a5a',
    univers: 'got',
    photos: [
      { src: '/gif/Yara Greyjoy.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Personnage annexe/Yara Greyjoy.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Personnage annexe/Yara Greyjoy 1.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Personnage annexe/Yara Greyjoy 2.jpg', pos: 'center 24%' },
    ],
    description:
      'Fille de Balon Greyjoy et capitaine redoutée, Yara mène ses hommes avec autant de poigne que n\'importe quel homme — et davantage de loyauté envers sa famille. Sa relation avec son frère Theon, faite de moqueries et d\'amour sincère, est l\'une des rares constances dans la tempête des Îles de Fer.',
  },
  {
    id: 'balon',
    name: 'Balon Greyjoy',
    titre: 'Seigneur des Îles de Fer · Roi de son Royaume',
    maison: 'Maison Greyjoy',
    acteur: 'Patrick Malahide',
    accent: '#b8a040',
    border: '#3a4a5a',
    univers: 'got',
    photos: [
      { src: '/characters/Game of throne/Greyjoy/Balon Greyjoy.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Greyjoy/Balon Greyjoy 1.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Greyjoy/Balon Greyjoy 2.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Greyjoy/Balon Greyjoy 3.jpg', pos: 'center 18%' },
    ],
    description:
      'Patriarche austère des Îles de Fer, Balon a mené une rébellion écrasée contre le Trône de Fer et n\'a jamais pardonné à son fils Theon d\'avoir grandi loin de la mer. Pour lui, "ce qui est mort ne peut jamais mourir" — un crédo qui scellera son propre destin.',
  },
  {
    id: 'euron',
    name: 'Euron Greyjoy',
    titre: 'Roi des Îles de Fer · Le Corbeau Fou',
    maison: 'Maison Greyjoy',
    acteur: 'Pilou Asbæk',
    accent: '#b8a040',
    border: '#3a4a5a',
    univers: 'got',
    photos: [
      { src: '/gif/Euron Greyjoy.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Greyjoy/Euron Greyjoy.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Greyjoy/Euron Greyjoy 1.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Greyjoy/Euron Greyjoy 2.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Greyjoy/Euron Greyjoy 3.jpg', pos: 'center 15%' },
    ],
    description:
      'Fratricide, charismatique et totalement imprévisible, Euron s\'empare de la couronne de bois des Îles de Fer par la force et la peur. Sa flotte et son ambition démesurée le mènent jusqu\'à Port-Réal — et jusqu\'à un lit qu\'aucun Greyjoy n\'aurait dû convoiter.',
  },
  {
    id: 'daario',
    name: 'Daario Naharis',
    titre: 'Capitaine des Seconds Fils',
    maison: 'Mercenaire d\'Essos',
    acteur: 'Michiel Huisman',
    accent: '#c98a4a',
    border: '#5a3a1a',
    univers: 'got',
    photos: [
      { src: '/gif/Daario Naharis.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Essos (storyline Daenerys)/Daario Naharis.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Essos (storyline Daenerys)/Daario Naharis 1.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Essos (storyline Daenerys)/Daario Naharis 2.jpg', pos: 'center 18%' },
    ],
    description:
      'Mercenaire flamboyant à la barbe d\'or et au sourire moqueur, Daario change de camp pour rejoindre Daenerys — et tombe sous son charme aussi sûrement qu\'elle tombe sous le sien. Loyal jusqu\'au sacrifice, il restera à Meereen quand elle, elle, devra repartir vers l\'Ouest.',
  },
  {
    id: 'viserys-targaryen',
    name: 'Viserys Targaryen',
    titre: 'Le Dragon Mendiant · Frère de Daenerys',
    maison: 'Maison Targaryen',
    acteur: 'Harry Lloyd',
    accent: '#c0392b',
    border: '#7a1a1a',
    univers: 'got',
    photos: [
      { src: '/gif/Viserys Targaryen.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Targaryen/Viserys Targaryen.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Targaryen/Viserys Targaryen 1.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Targaryen/Viserys Targaryen 2.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Targaryen/Viserys Targaryen 3.jpg', pos: 'center 15%' },
    ],
    description:
      'Dernier roi de droit selon lui-même, Viserys vend sa sœur en mariage pour s\'acheter une armée, persuadé que les dragons de sa lignée lui doivent allégeance. Sa cruauté envers Daenerys et son mépris pour les Dothrakis lui vaudront une couronne — fondue, et bien trop chaude.',
  },
  {
    id: 'talisa',
    name: 'Talisa Stark',
    titre: 'Guérisseuse de Volantis · Épouse de Robb',
    maison: 'Native de Volantis',
    acteur: 'Oona Chaplin',
    accent: '#8fafc4',
    border: '#3a5070',
    univers: 'got',
    photos: [
      { src: '/gif/Talisa Stark.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Personnage annexe/Talisa Stark.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Personnage annexe/Talisa Stark 1.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Personnage annexe/Talisa Stark 2.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Personnage annexe/Talisa Stark 3.jpg', pos: 'center 18%' },
    ],
    description:
      'Guérisseuse rencontrée sur un champ de bataille, Talisa offre à Robb Stark un amour sincère, loin des calculs politiques de Westeros. Cet amour, justement parce qu\'il échappe à toute alliance arrangée, deviendra la faille fatale dans la guerre du Jeune Loup.',
  },
  {
    id: 'shireen',
    name: 'Shireen Baratheon',
    titre: 'Princesse de Peyredragon',
    maison: 'Maison Baratheon',
    acteur: 'Kerry Ingram',
    accent: '#c9a84c',
    border: '#5a5020',
    univers: 'got',
    photos: [
      { src: '/gif/Shireen Baratheon.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Baratheon/Shireen Baratheon.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Baratheon/Shireen Baratheon 1.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Baratheon/Shireen Baratheon 2.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Baratheon/Shireen Baratheon 3.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Baratheon/Shireen Baratheon 4.jpg', pos: '62% 50%' },
    ],
    description:
      'Fille unique de Stannis, marquée au visage par la maladie écailleuse, Shireen porte sur elle la froideur de son père et la dévotion brûlante de Mélisandre. Douce, curieuse, assoiffée de savoir — son innocence n\'a pas sa place dans les calculs de ceux qui prétendent l\'aimer.',
  },
  {
    id: 'lysa',
    name: 'Lysa Arryn',
    titre: 'Dame du Nid d\'Aigles',
    maison: 'Maison Arryn · Tully',
    acteur: 'Kate Dickie',
    accent: '#9fd0e8',
    border: '#2a4a5a',
    univers: 'got',
    photos: [
      { src: '/characters/Game of throne/Maison Tully & Arryn/Lysa Arryn.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Maison Tully & Arryn/Lysa Arryn 1.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Maison Tully & Arryn/Lysa Arryn 2.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Maison Tully & Arryn/Lysa Arryn 3.jpg', pos: 'center 18%' },
    ],
    description:
      'Sœur de Catelyn, recluse dans son nid de pierre du haut du Val d\'Arryn, Lysa nourrit un amour obsessionnel pour son fils Robin et une jalousie dévorante envers quiconque s\'approche de Petyr Baelish. Sa chute, littérale, sera aussi brutale que son obsession.',
  },
  {
    id: 'robin-arryn',
    name: 'Robin Arryn',
    titre: 'Seigneur du Val d\'Arryn',
    maison: 'Maison Arryn',
    acteur: 'Lino Facioli',
    accent: '#9fd0e8',
    border: '#2a4a5a',
    univers: 'got',
    photos: [
      { src: '/gif/Robin Arryn.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Maison Tully & Arryn/Robin Arryn.jpg', pos: 'center 20%' },
      { src: '/characters/Game of throne/Maison Tully & Arryn/Robin Arryn 1.jpg', pos: 'center 20%' },
      { src: '/characters/Game of throne/Maison Tully & Arryn/Robin Arryn 2.jpg', pos: 'center 20%' },
      { src: '/characters/Game of throne/Maison Tully & Arryn/Robin Arryn 3.jpg', pos: 'center 20%' },
      { src: '/characters/Game of throne/Maison Tully & Arryn/Robin Arryn 4.jpg', pos: 'center 20%' },
    ],
    description:
      'Enfant unique de Lysa Arryn, élevé dans l\'isolement et le lait maternel bien après l\'âge raisonnable, Robin est aussi fragile que son titre est puissant. Son destin de seigneur du Val dépendra entièrement de qui saura — ou voudra — le façonner.',
  },
  {
    id: 'edmure',
    name: 'Edmure Tully',
    titre: 'Seigneur de Vivesaigues',
    maison: 'Maison Tully',
    acteur: 'Tobias Menzies',
    accent: '#5b8fc9',
    border: '#1f3a5a',
    univers: 'got',
    photos: [
      { src: '/characters/Game of throne/Maison Tully & Arryn/Edmure Tully 2.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Maison Tully & Arryn/Edmure Tully 1.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Maison Tully & Arryn/Edmure Tully.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Maison Tully & Arryn/Edmure Tully 3.jpg', pos: 'center 18%' },
    ],
    description:
      'Frère cadet de Catelyn et héritier de Vivesaigues, Edmure rêve de gloire militaire mais peine à porter le poids du nom Tully. Son mariage forcé avec une Frey scellera, sans qu\'il le sache, le piège le plus sanglant de la guerre des Cinq Rois.',
  },
  {
    id: 'benjen',
    name: 'Benjen Stark',
    titre: 'Premier Inquisiteur de la Garde de Nuit',
    maison: 'Maison Stark · Garde de Nuit',
    acteur: 'Joseph Mawle',
    accent: '#8fafc4',
    border: '#3a5070',
    univers: 'got',
    photos: [
      { src: '/gif/Benjen Stark.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Personnage annexe/Benjen Stark.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Personnage annexe/Benjen Stark 1.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Personnage annexe/Benjen Stark 2.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Personnage annexe/Benjen Stark 3.jpg', pos: 'center 18%' },
    ],
    description:
      'Frère cadet d\'Eddard Stark et rangeur de la Garde de Nuit, Benjen disparaît au-delà du Mur dans une expédition qui semble n\'avoir aucun survivant. Ce qu\'il devient ensuite — ni tout à fait vivant, ni tout à fait mort — sauvera la vie de Bran au moment le plus critique.',
  },
  {
    id: 'beric',
    name: 'Beric Dondarrion',
    titre: 'Seigneur de l\'Éclair · Champion de R\'hllor',
    maison: 'Confrérie sans Bannière',
    acteur: 'Richard Dormer',
    accent: '#8a9a6a',
    border: '#33402a',
    univers: 'got',
    photos: [
      { src: '/gif/Beric Dondarrion.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Frères de la Confrérie sans Bannière/Beric Dondarrion.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Frères de la Confrérie sans Bannière/Beric Dondarrion 1.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Frères de la Confrérie sans Bannière/Beric Dondarrion 2.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Frères de la Confrérie sans Bannière/Beric Dondarrion 3.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Frères de la Confrérie sans Bannière/Beric Dondarrion 4.jpg', pos: 'center 18%' },
    ],
    description:
      'Ramené d\'entre les morts à six reprises par les flammes de R\'hllor, Beric porte sur son visage les cicatrices de chaque résurrection. Chef de la Confrérie sans Bannière, il a fait le serment de défendre les innocents — quel qu\'en soit le prix pour son âme.',
  },
  {
    id: 'thoros',
    name: 'Thoros de Myr',
    titre: 'Prêtre Rouge · Frère de la Confrérie',
    maison: 'Confrérie sans Bannière',
    acteur: 'Paul Kaye',
    accent: '#8a9a6a',
    border: '#33402a',
    univers: 'got',
    photos: [
      { src: '/gif/Thoros de Myr.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Frères de la Confrérie sans Bannière/Thoros de Myr.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Frères de la Confrérie sans Bannière/Thoros de Myr 1.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Frères de la Confrérie sans Bannière/Thoros de Myr 2.jpg', pos: 'center 18%' },
    ],
    description:
      'Ancien prêtre de cour devenu vagabond ivrogne, Thoros découvre que ses prières à R\'hllor possèdent un pouvoir bien réel le jour où elles ramènent Beric à la vie. Son épée enflammée et sa foi retrouvée font de lui un allié aussi inattendu que précieux.',
  },
  {
    id: 'jeor-mormont',
    name: 'Jeor Mormont',
    titre: 'Le Vieil Ours · Lord Commandant de la Garde de Nuit',
    maison: 'Garde de Nuit',
    acteur: 'James Cosmo',
    accent: '#7a8a8a',
    border: '#262e2e',
    univers: 'got',
    photos: [
      { src: '/gif/Jeor Mormont.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Jeor Mormont.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Jeor Mormont 1.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Jeor Mormont 2.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Jeor Mormont 3.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Jeor Mormont 4.jpg', pos: 'center 15%' },
    ],
    description:
      'Surnommé le Vieil Ours, Jeor Mormont dirige une Garde de Nuit exsangue avec la rudesse d\'un vétéran et la lucidité d\'un homme qui sait ce qui approche du Nord. Il voit en Jon Snow l\'avenir de son ordre — un avenir qu\'il ne vivra pas pour voir s\'accomplir.',
  },
  {
    id: 'maester-aemon',
    name: 'Maester Aemon',
    titre: 'Mestre de Châteaunoir · Targaryen Oublié',
    maison: 'Garde de Nuit · Maison Targaryen',
    acteur: 'Peter Vaughan',
    accent: '#7a8a8a',
    border: '#262e2e',
    univers: 'got',
    photos: [
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Maester Aemon 2.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Maester Aemon 1.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Maester Aemon.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Maester Aemon 3.jpg', pos: 'center 18%' },
    ],
    description:
      'Aveugle et centenaire, Maester Aemon cache un secret stupéfiant : il aurait pu être roi, mais a choisi de revêtir le gris du mestre plutôt que de plonger Westeros dans la guerre. Sa sagesse tranquille guide Châteaunoir bien après que ses yeux ont cessé de voir.',
  },
  {
    id: 'edd',
    name: 'Eddison Tollett',
    titre: 'Dolorous Edd · Lord Commandant de la Garde de Nuit',
    maison: 'Garde de Nuit',
    acteur: 'Ben Crompton',
    accent: '#7a8a8a',
    border: '#262e2e',
    univers: 'got',
    photos: [
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Eddison Dolorous Edd Tollett.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Eddison Dolorous Edd Tollett 1.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Eddison Dolorous Edd Tollett 2.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Eddison Dolorous Edd Tollett 3.jpg', pos: 'center 18%' },
    ],
    description:
      'Surnommé "Dolorous Edd" pour son humour aussi noir que son manteau, ce frère juré voit toujours le pire arriver — et n\'a jamais tort. Fidèle compagnon de Jon Snow, il finira, contre toute attente, par porter le manteau de Lord Commandant.',
  },
  {
    id: 'jaqen',
    name: 'Jaqen H\'ghar',
    titre: 'Sans-Visage · Serviteur du Dieu Multiple',
    maison: 'La Confrérie Sans Visage',
    acteur: 'Tom Wlaschiha',
    accent: '#6a6050',
    border: '#262018',
    univers: 'got',
    photos: [
      { src: '/gif/Jaqen H\'ghar.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Personnage annexe/Jaqen H\'ghar.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Personnage annexe/Jaqen H\'ghar 1.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Personnage annexe/Jaqen H\'ghar 2.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Personnage annexe/Jaqen H\'ghar 3.jpg', pos: 'center 18%' },
    ],
    description:
      'Prisonnier énigmatique sauvé par Arya à Harrenhal, Jaqen révèle n\'être qu\'un visage parmi tant d\'autres au service du Dieu Multiple. Son offre à la jeune Stark — devenir "personne" pour devenir n\'importe qui — ouvrira les portes de la Maison du Noir et du Blanc.',
  },
  {
    id: 'syrio',
    name: 'Syrio Forel',
    titre: 'Premier Maître d\'Armes de Braavos',
    maison: 'Natif de Braavos',
    acteur: 'Miltos Yerolemou',
    accent: '#6a6050',
    border: '#262018',
    univers: 'got',
    photos: [
      { src: '/gif/Syrio Forel.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Personnage annexe/Syrio Forel.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Personnage annexe/Syrio Forel 1.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Personnage annexe/Syrio Forel 2.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Personnage annexe/Syrio Forel 3.jpg', pos: '42% 25%' },
    ],
    description:
      'Maître d\'armes haut en couleur engagé pour enseigner l\'escrime à Arya, Syrio lui transmet bien plus qu\'une technique : une philosophie. "Qu\'est-ce qu\'on dit au dieu de la mort ? Pas aujourd\'hui." Une leçon qu\'Arya n\'oubliera jamais — et que lui-même incarnera jusqu\'au bout.',
  },
  {
    id: 'hot-pie',
    name: 'Hot Pie',
    titre: 'Apprenti Cuisinier · Boulanger de Saltpans',
    maison: 'Roturier de Westeros',
    acteur: 'Ben Hawkey',
    accent: '#c98a4a',
    border: '#5a3a1a',
    univers: 'got',
    photos: [
      { src: '/characters/Game of throne/Personnage annexe/Hot Pie 1.jpg', pos: 'center 22%' },
      { src: '/characters/Game of throne/Personnage annexe/Hot Pie.jpg', pos: 'center 22%' },
      { src: '/characters/Game of throne/Personnage annexe/Hot Pie 2.jpg', pos: 'center 22%' },
    ],
    description:
      'Compagnon de route d\'Arya sur le chemin de Harrenhal, Hot Pie troque finalement l\'épée pour le pétrin et devient boulanger à Saltpans. Son loup de pain offert en cadeau d\'adieu reste l\'un des moments les plus chaleureux d\'un monde si souvent cruel.',
  },
  {
    id: 'gilly',
    name: 'Gilly',
    titre: 'Fille — et épouse — de Craster',
    maison: 'Au-delà du Mur',
    acteur: 'Hannah Murray',
    accent: '#8a9a6a',
    border: '#33402a',
    univers: 'got',
    photos: [
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Gilly.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Gilly 1.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Gilly 2.jpg', pos: 'center 18%' },
    ],
    description:
      'Née et élevée dans l\'horreur du foyer de Craster, Gilly fuit au-delà du Mur pour sauver son fils nouveau-né. La douceur de Sam lui ouvre un monde qu\'elle ne connaissait pas — celui où une femme peut choisir, apprendre à lire, et être aimée sans crainte.',
  },
  {
    id: 'mance-rayder',
    name: 'Mance Rayder',
    titre: 'Roi d\'au-delà du Mur',
    maison: 'Le Peuple Libre',
    acteur: 'Ciarán Hinds',
    accent: '#8a9a6a',
    border: '#33402a',
    univers: 'got',
    photos: [
      { src: '/gif/Mance Rayder 1.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Mance Rayder.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Mance Rayder 1.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Mance Rayder 2.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Mance Rayder 3.jpg', pos: 'center 18%' },
    ],
    description:
      'Ancien frère juré devenu le premier homme en mille ans à unir tous les clans sauvageons, Mance Rayder ne cherche qu\'une chose : mettre son peuple à l\'abri du froid qui vient. Son honneur de roi le conduira jusqu\'au bûcher — et jusqu\'à un dernier acte de miséricorde inattendu.',
  },
  {
    id: 'alliser-thorne',
    name: 'Ser Alliser Thorne',
    titre: 'Premier Maître d\'Armes de la Garde de Nuit',
    maison: 'Garde de Nuit',
    acteur: 'Owen Teale',
    accent: '#7a8a8a',
    border: '#262e2e',
    univers: 'got',
    photos: [
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Ser Alliser Thorne 2.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Ser Alliser Thorne 1.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Ser Alliser Thorne.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Ser Alliser Thorne 3.jpg', pos: 'center 15%' },
    ],
    description:
      'Ancien chevalier amer d\'avoir terminé sa carrière à former des bleus au lieu de guerroyer, Thorne méprise Jon Snow autant qu\'il doute de la menace venue du Nord. Sa rancune le conduira à un acte de trahison qui changera le cours de l\'histoire de la Garde.',
  },
  {
    id: 'wun-wun',
    name: 'Wun Wun',
    titre: 'Géant d\'au-delà du Mur',
    maison: 'Le Peuple Libre',
    acteur: 'Ian Whyte',
    accent: '#8a9a6a',
    border: '#33402a',
    univers: 'got',
    photos: [
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Wun Wun.jpg', pos: 'center 22%' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Wun Wun 1.jpg', pos: '30% 30%' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Wun Wun 2.jpg', pos: 'center 22%' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Wun Wun 3.jpg', pos: 'center 22%' },
    ],
    description:
      'Dernier géant connu à avoir traversé le Mur aux côtés de Mance Rayder, Wun Wun impose le respect par sa seule stature. Sa loyauté envers Jon Snow, simple et sans détour, fera de lui un rempart vivant lors de la Bataille des Bâtards.',
  },
  {
    id: 'craster',
    name: 'Craster',
    titre: 'Maître de Craster\'s Keep',
    maison: 'Au-delà du Mur',
    acteur: 'Robert Pugh',
    accent: '#8a9a6a',
    border: '#33402a',
    univers: 'got',
    photos: [
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Craster.jpg', pos: 'center 20%' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Craster 1.jpg', pos: 'center 20%' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/Craster 2.jpg', pos: 'center 20%' },
    ],
    description:
      'Sauvageon retors retranché derrière le Mur, Craster offre l\'hospitalité aux frères noirs en échange de leur silence sur ses pratiques abominables — épouser ses propres filles, et offrir ses fils nouveau-nés à un froid qui n\'a rien d\'un hasard.',
  },
  {
    id: 'roi-de-la-nuit',
    name: 'Le Roi de la Nuit',
    titre: 'Seigneur des Marcheurs Blancs',
    maison: 'Les Marcheurs Blancs',
    acteur: 'Vladimír Furdík',
    accent: '#6fb8e8',
    border: '#1a3050',
    univers: 'got',
    photos: [
      { src: '/gif/Le Roi de la Nuit.webp', pos: '88% center' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/le Roi de la Nuit.jpg', pos: '38% 50%' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/le Roi de la Nuit 1.jpg', pos: 'center 20%' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/le Roi de la Nuit 2.jpg', pos: 'center 20%' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/le Roi de la Nuit 3.jpg', pos: 'center 20%' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/le Roi de la Nuit 4.jpg', pos: 'center 35%' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/le Roi de la Nuit 5.jpg', pos: 'center 20%' },
    ],
    description:
      'Premier des Enfants de la Forêt transformé en arme contre l\'humanité, le Roi de la Nuit mène une armée de morts vers le Sud avec un seul but : effacer toute vie de Westeros. Son regard glacé porte en lui des âges entiers de silence et de gel.',
  },
  {
    id: 'osha',
    name: 'Osha',
    titre: 'Sauvageonne · Protectrice de Bran',
    maison: 'Le Peuple Libre',
    acteur: 'Natalia Tena',
    accent: '#8a9a6a',
    border: '#33402a',
    univers: 'got',
    photos: [
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/osha  1.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/osha.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/osha  2.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Garde de la nuit et apres mur/osha  3.jpg', pos: '85% 50%' },
    ],
    description:
      'Capturée par les Stark puis libérée par leur confiance, Osha devient la protectrice farouche de Bran et Rickon dans leur fuite vers le Nord. Pragmatique et coriace, elle connaît les dangers d\'au-delà du Mur mieux que quiconque — et le prix qu\'il faut parfois payer pour survivre.',
  },
  {
    id: 'ellaria',
    name: 'Ellaria Sand',
    titre: 'Paramour du Prince Oberyn',
    maison: 'Maison Martell · Dorne',
    acteur: 'Indira Varma',
    accent: '#e08030',
    border: '#6a3010',
    univers: 'got',
    photos: [
      { src: '/gif/Ellaria Sand.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Dorne (Maison Martell)/Ellaria Sand.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Dorne (Maison Martell)/Ellaria Sand  1.jpg', pos: 'center 15%' },
      { src: '/characters/Game of throne/Dorne (Maison Martell)/Ellaria Sand  2.jpg', pos: 'center 15%' },
    ],
    description:
      'Amante d\'Oberyn Martell et mère de quatre de ses filles bâtardes, Ellaria a vu l\'homme qu\'elle aimait mourir d\'une mort lente et atroce. Sa douleur se transforme en une soif de vengeance qui ne connaîtra ni limite, ni pitié — pour Dorne, et pour elle-même.',
  },
  {
    id: 'sand-snakes',
    name: 'Les Sand Snakes',
    titre: 'Obara, Nymeria et Tyene Sand · Filles d\'Oberyn',
    maison: 'Maison Martell · Dorne',
    acteur: 'Keisha Castle-Hughes, Jessica Henwick, Rosabell Laurenti Sellers',
    accent: '#e08030',
    border: '#6a3010',
    univers: 'got',
    photos: [
      { src: '/characters/Game of throne/Dorne (Maison Martell)/Les Sand Snakes - Obara, Nymeria, Tyene 1.jpg', pos: 'center 22%' },
      { src: '/characters/Game of throne/Dorne (Maison Martell)/Les Sand Snakes - Obara, Nymeria, Tyene.jpg', pos: 'center 22%' },
      { src: '/characters/Game of throne/Dorne (Maison Martell)/Les Sand Snakes - Obara, Nymeria, Tyene 2.jpg', pos: 'center 22%' },
    ],
    description:
      'Filles bâtardes du prince Oberyn, élevées dans le sable et la rage, les trois Sand Snakes ont chacune hérité d\'une arme et d\'une fureur différentes — la lance, le fouet et le poison. La mort de leur père les unit dans une même promesse : que Dorne se souvienne de la Vipère Rouge.',
  },
  {
    id: 'doran',
    name: 'Doran Martell',
    titre: 'Prince de Dorne',
    maison: 'Maison Martell · Dorne',
    acteur: 'Alexander Siddig',
    accent: '#e08030',
    border: '#6a3010',
    univers: 'got',
    photos: [
      { src: '/gif/Doran Martell.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Dorne (Maison Martell)/Doran Martell.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Dorne (Maison Martell)/Doran Martell 1.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Dorne (Maison Martell)/Doran Martell 2.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Dorne (Maison Martell)/Doran Martell 3.jpg', pos: 'center 18%' },
    ],
    description:
      'Cloué à son fauteuil par la goutte, le prince de Dorne gouverne par la patience plutôt que par la vengeance — une philosophie que son propre peuple peine à comprendre. Derrière son calme apparent se cache un joueur qui prépare sa revanche depuis des décennies.',
  },
  {
    id: 'trystane',
    name: 'Trystane Martell',
    titre: 'Prince de Dorne · Fiancé de Myrcella',
    maison: 'Maison Martell · Dorne',
    acteur: 'Toby Sebastian',
    accent: '#e08030',
    border: '#6a3010',
    univers: 'got',
    photos: [
      { src: '/gif/Trystane Martell.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Dorne (Maison Martell)/Trystane Martell.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Dorne (Maison Martell)/Trystane Martell 1.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Dorne (Maison Martell)/Trystane Martell 2.jpg', pos: 'center 18%' },
    ],
    description:
      'Fils de Doran et promis de Myrcella Baratheon, Trystane représente l\'espoir d\'une alliance entre Dorne et le trône de Port-Réal. Un espoir fragile, pris entre les ambitions de son père et la soif de vengeance qui couve dans sa propre maison.',
  },
  {
    id: 'high-sparrow',
    name: 'Le Grand Septon',
    titre: 'High Sparrow · Chef du Mouvement des Pauvres Compagnons',
    maison: 'La Foi des Sept',
    acteur: 'Jonathan Pryce',
    accent: '#d8d0c0',
    border: '#5a5248',
    univers: 'got',
    photos: [
      { src: '/gif/Le Grand Septon.webp', pos: 'center center' },
      { src: '/characters/Game of throne/Port-Réal & politique/Le Grand Septon High Sparrow.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Port-Réal & politique/Le Grand Septon High Sparrow 1.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Port-Réal & politique/Le Grand Septon High Sparrow 2.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Port-Réal & politique/Le Grand Septon High Sparrow 3.jpg', pos: 'center 18%' },
    ],
    description:
      'Humble en apparence, impitoyable en substance, le Grand Septon prêche l\'austérité religieuse pour mieux s\'emparer du pouvoir spirituel de Port-Réal. Sa marche de la pénitence imposée à Cersei restera comme l\'humiliation publique la plus mémorable de la capitale.',
  },
  {
    id: 'qyburn',
    name: 'Qyburn',
    titre: 'Mestre Déchu · Conseiller de Cersei',
    maison: 'Conseiller sans maison',
    acteur: 'Anton Lesser',
    accent: '#6a6050',
    border: '#262018',
    univers: 'got',
    photos: [
      { src: '/characters/Game of throne/Port-Réal & politique/Qyburn 1.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Port-Réal & politique/Qyburn.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Port-Réal & politique/Qyburn 2.jpg', pos: 'center 18%' },
      { src: '/characters/Game of throne/Port-Réal & politique/Qyburn 3.jpg', pos: 'center 18%' },
    ],
    description:
      'Banni de la Citadelle pour ses expérimentations contraires à l\'éthique, Qyburn trouve en Cersei une protectrice qui partage son absence de scrupules. Ses créations les plus terrifiantes — dont une certaine "Montagne" ressuscitée — feront de lui l\'architecte de l\'horreur scientifique de Westeros.',
  },
  {
    id: 'illyrio',
    name: 'Illyrio Mopatis',
    titre: 'Magistrat de Pentos',
    maison: 'Marchand d\'Essos',
    acteur: 'Roger Allam',
    accent: '#c98a4a',
    border: '#5a3a1a',
    univers: 'got',
    photos: [
      { src: '/characters/Game of throne/Essos (storyline Daenerys)/Illyrio Mopatis 2.jpg', pos: 'center 20%' },
      { src: '/characters/Game of throne/Essos (storyline Daenerys)/Illyrio Mopatis 1.jpg', pos: 'center 20%' },
      { src: '/characters/Game of throne/Essos (storyline Daenerys)/Illyrio Mopatis.jpg', pos: 'center 20%' },
    ],
    description:
      'Marchand obèse et richissime de Pentos, Illyrio orchestre depuis l\'ombre le retour des Targaryen — offrant à Daenerys un mariage, des dragons pétrifiés, et un avenir qu\'elle ne soupçonne pas encore. Ses motivations restent aussi opaques que ses fortunes sont vastes.',
  },
  {
    id: 'rhaenyra',
    name: 'Rhaenyra Targaryen',
    titre: 'Princesse de Peyredragon · Reine des Sept Royaumes · Cavalière de Syrax',
    maison: 'Maison Targaryen',
    acteur: 'Milly Alcock / Emma D\'Arcy',
    accent: '#8a1f1f',
    border: '#2a0c0c',
    univers: 'hotd',
    photos: [
      { src: '/gif/Rhaenyra Targaryen.webp', pos: 'center center' },
      { src: '/characters/House of the dragon/Le Camp Noir/Rhaenyra Targaryen.jpg', pos: 'center 15%' },
      { src: '/characters/House of the dragon/Le Camp Noir/Rhaenyra Targaryen 1.jpg', pos: 'center 15%' },
      { src: '/characters/House of the dragon/Le Camp Noir/Rhaenyra Targaryen 2.jpg', pos: 'center 15%' },
      { src: '/characters/House of the dragon/Le Camp Noir/Rhaenyra Targaryen 3.jpg', pos: 'center 15%' },
    ],
    description:
      'Première héritière désignée du Trône de Fer dans toute l\'histoire des Targaryen, Rhaenyra doit affronter un royaume qui refuse de la voir régner. Son combat pour faire valoir ses droits embrasera les Sept Couronnes et donnera son nom à la guerre la plus tragique de la dynastie : la Danse des Dragons.',
  },
  {
    id: 'daemon',
    name: 'Daemon Targaryen',
    titre: 'Prince de la Cité · Cavalier de Caraxès',
    maison: 'Maison Targaryen · Camp Noir',
    acteur: 'Matt Smith',
    accent: '#8a1f1f',
    border: '#2a0c0c',
    univers: 'hotd',
    photos: [
      { src: '/gif/Daemon Targaryen.webp', pos: 'center center' },
      { src: '/characters/House of the dragon/Le Camp Noir/Daemon Targaryen.jpg', pos: 'center 15%' },
      { src: '/characters/House of the dragon/Le Camp Noir/Daemon Targaryen 1.jpg', pos: 'center 15%' },
      { src: '/characters/House of the dragon/Le Camp Noir/Daemon Targaryen 2.webp', pos: 'center 15%' },
      { src: '/characters/House of the dragon/Le Camp Noir/Daemon Targaryen 3.jpg', pos: '70% 25%' },
      { src: '/characters/House of the dragon/Le Camp Noir/Daemon Targaryen 4.jpg', pos: 'center 15%' },
    ],
    description:
      'Frère turbulent du roi Viserys, Daemon est un guerrier brillant et un homme dangereux — autant pour ses ennemis que pour les siens. Son amour tumultueux pour Rhaenyra, sa soif de pouvoir et son tempérament de feu font de lui l\'un des Targaryen les plus fascinants jamais écrits.',
  },
  {
    id: 'alicent',
    name: 'Alicent Hightower',
    titre: 'Reine des Sept Royaumes · Régente du Camp Vert',
    maison: 'Maison Hightower · Targaryen',
    acteur: 'Olivia Cooke',
    accent: '#4a8a5a',
    border: '#1c3322',
    univers: 'hotd',
    photos: [
      { src: '/gif/Alicent Hightower.webp', pos: 'center center' },
      { src: '/characters/House of the dragon/Le Camp Vert/Alicent Hightower.jpg', pos: 'center 15%' },
      { src: '/characters/House of the dragon/Le Camp Vert/Alicent Hightower 1.jpg', pos: 'center 15%' },
      { src: '/characters/House of the dragon/Le Camp Vert/Alicent Hightower 2.jpg', pos: 'center 15%' },
      { src: '/characters/House of the dragon/Le Camp Vert/Alicent Hightower 3.jpg', pos: 'center 15%' },
    ],
    description:
      'Meilleure amie de Rhaenyra devenue reine — et rivale — par un mariage orchestré par son propre père, Alicent se retrouve écartelée entre loyauté et ambition. Son amitié brisée avec Rhaenyra est la véritable étincelle qui embrasera toute la guerre civile à venir.',
  },
  {
    id: 'viserys-i',
    name: 'Viserys I Targaryen',
    titre: 'Roi des Sept Royaumes · Le Pacificateur',
    maison: 'Maison Targaryen',
    acteur: 'Paddy Considine',
    accent: '#c0392b',
    border: '#7a1a1a',
    univers: 'hotd',
    photos: [
      { src: '/gif/Viserys I Targaryen.webp', pos: 'center center' },
      { src: '/characters/House of the dragon/La famille royale & figures historiques/Viserys I Targaryen.jpg', pos: 'center 15%' },
      { src: '/characters/House of the dragon/La famille royale & figures historiques/Viserys I Targaryen 1.jpg', pos: 'center 15%' },
      { src: '/characters/House of the dragon/La famille royale & figures historiques/Viserys I Targaryen 2.jpg', pos: 'center 15%' },
      { src: '/characters/House of the dragon/La famille royale & figures historiques/Viserys I Targaryen 3.jpg', pos: 'center 15%' },
      { src: '/characters/House of the dragon/La famille royale & figures historiques/Viserys I Targaryen 4.jpg', pos: 'center 15%' },
    ],
    description:
      'Roi conciliant dans une époque qui réclame de la fermeté, Viserys désigne sa fille Rhaenyra comme héritière — un choix qui déchirera sa famille bien après sa mort. Rongé par la maladie, il passera ses dernières années à tenter, en vain, de maintenir l\'unité de sa maison.',
  },
  {
    id: 'aemond',
    name: 'Aemond Targaryen',
    titre: 'Le Prince Borgne · Cavalier de Vhagar',
    maison: 'Maison Targaryen · Camp Vert',
    acteur: 'Ewan Mitchell',
    accent: '#4a8a5a',
    border: '#1c3322',
    univers: 'hotd',
    photos: [
      { src: '/gif/Aemond Targaryen.webp', pos: 'center center' },
      { src: '/characters/House of the dragon/Le Camp Vert/Aemond Targaryen.jpg', pos: 'center 15%' },
      { src: '/characters/House of the dragon/Le Camp Vert/Aemond Targaryen 1.jpg', pos: 'center 15%' },
      { src: '/characters/House of the dragon/Le Camp Vert/Aemond Targaryen 2.jpg', pos: 'center 15%' },
      { src: '/characters/House of the dragon/Le Camp Vert/Aemond Targaryen 3.jpg', pos: 'center 15%' },
      { src: '/characters/House of the dragon/Le Camp Vert/Aemond Targaryen 4.jpg', pos: 'center 15%' },
    ],
    description:
      'Privé d\'un œil par son neveu Lucerys dans son enfance, Aemond grandit nourri d\'humiliation et de rage froide. Devenu cavalier de la redoutable Vhagar, le plus ancien des dragons vivants, il porte en lui une vengeance qui embrasera des cieux entiers.',
  },
  {
    id: 'aegon-ii',
    name: 'Aegon II Targaryen',
    titre: 'Roi des Sept Royaumes · Cavalier de Vhagar',
    maison: 'Maison Targaryen · Camp Vert',
    acteur: 'Tom Glynn-Carney',
    accent: '#4a8a5a',
    border: '#1c3322',
    univers: 'hotd',
    photos: [
      { src: '/gif/Aegon II Targaryen.webp', pos: 'center center' },
      { src: '/characters/House of the dragon/Le Camp Vert/Aegon II Targaryen.jpg', pos: 'center 15%' },
      { src: '/characters/House of the dragon/Le Camp Vert/Aegon II Targaryen 1.jpg', pos: 'center 15%' },
      { src: '/characters/House of the dragon/Le Camp Vert/Aegon II Targaryen 2.jpg', pos: 'center 15%' },
      { src: '/characters/House of the dragon/Le Camp Vert/Aegon II Targaryen 3.jpg', pos: 'center 15%' },
    ],
    description:
      'Fils aîné de Viserys et Alicent, Aegon est couronné dans le dos de sa demi-sœur Rhaenyra par les manigances de sa propre famille. Cruel, capricieux et rongé par le doute, il se retrouve roi malgré lui — sur un trône que beaucoup jugent ne pas lui revenir.',
  },
  {
    id: 'rhaenys',
    name: 'Rhaenys Targaryen',
    titre: 'La Reine qui ne fut Jamais · Cavalière de Meleys',
    maison: 'Maison Targaryen · Camp Noir',
    acteur: 'Eve Best',
    accent: '#8a1f1f',
    border: '#2a0c0c',
    univers: 'hotd',
    photos: [
      { src: '/gif/Rhaenys Targaryen.webp', pos: 'center center' },
      { src: '/characters/House of the dragon/Le Camp Noir/Rhaenys Targaryen.jpg', pos: 'center 18%' },
      { src: '/characters/House of the dragon/Le Camp Noir/Rhaenys Targaryen 1.jpg', pos: 'center 18%' },
      { src: '/characters/House of the dragon/Le Camp Noir/Rhaenys Targaryen 2.jpg', pos: 'center 18%' },
      { src: '/characters/House of the dragon/Le Camp Noir/Rhaenys Targaryen 3.jpg', pos: 'center 18%' },
    ],
    description:
      'Écartée du trône au profit de son cousin Viserys malgré ses droits légitimes, Rhaenys porte ce titre amer avec une dignité farouche. Cavalière de la flamboyante Meleys, elle prouvera lors de son entrée fracassante au tournoi de la Main que la "Reine qui ne fut jamais" reste une force qu\'on ne sous-estime pas impunément.',
  },
  {
    id: 'corlys',
    name: 'Corlys Velaryon',
    titre: 'Le Serpent de Mer · Seigneur de Conduit',
    maison: 'Maison Velaryon',
    acteur: 'Steve Toussaint',
    accent: '#5fa8c9',
    border: '#1c3a4a',
    univers: 'hotd',
    photos: [
      { src: '/gif/Corlys Velaryon.webp', pos: 'center center' },
      { src: '/characters/House of the dragon/Le Camp Noir/Corlys Velaryon.jpg', pos: 'center 18%' },
      { src: '/characters/House of the dragon/Le Camp Noir/Corlys Velaryon 1.jpg', pos: 'center 18%' },
      { src: '/characters/House of the dragon/Le Camp Noir/Corlys Velaryon 2.jpg', pos: 'center 18%' },
    ],
    description:
      'Plus grand marin que Westeros ait connu, le Serpent de Mer a bâti la fortune de Conduit en sillonnant les mers les plus lointaines. Seigneur ambitieux et père endeuillé, il choisira finalement de soutenir Rhaenyra — un pari risqué qui coûtera cher à toute sa lignée.',
  },
  {
    id: 'criston-cole',
    name: 'Ser Criston Cole',
    titre: 'Le Chevalier Kingmaker · Lord Commandant de la Garde Royale',
    maison: 'Chevalier sans maison',
    acteur: 'Fabien Frankel',
    accent: '#4a8a5a',
    border: '#1c3322',
    univers: 'hotd',
    photos: [
      { src: '/gif/Ser Criston Cole.webp', pos: 'center center' },
      { src: '/characters/House of the dragon/Le Camp Vert/Ser Criston Cole.jpg', pos: 'center 15%' },
      { src: '/characters/House of the dragon/Le Camp Vert/Ser Criston Cole 1.jpg', pos: 'center 15%' },
      { src: '/characters/House of the dragon/Le Camp Vert/Ser Criston Cole 2.jpg', pos: 'center 15%' },
      { src: '/characters/House of the dragon/Le Camp Vert/Ser Criston Cole 3.jpg', pos: 'center 15%' },
    ],
    description:
      'Chevalier d\'humble naissance devenu héros de tournoi, Criston voit son cœur brisé par Rhaenyra et bascule corps et âme dans le camp adverse. Son zèle dévorant pour la cause d\'Aegon fera de lui l\'un des artisans les plus déterminants — et les plus impitoyables — de la guerre civile.',
  },
  {
    id: 'otto',
    name: 'Otto Hightower',
    titre: 'Main du Roi · Patriarche de Bouche-du-Nord',
    maison: 'Maison Hightower',
    acteur: 'Rhys Ifans',
    accent: '#7fae8e',
    border: '#2a4434',
    univers: 'hotd',
    photos: [
      { src: '/gif/Otto Hightower.webp', pos: 'center center' },
      { src: '/characters/House of the dragon/Le Camp Vert/Otto Hightower.jpg', pos: 'center 18%' },
      { src: '/characters/House of the dragon/Le Camp Vert/Otto Hightower 1.jpg', pos: 'center 18%' },
      { src: '/characters/House of the dragon/Le Camp Vert/Otto Hightower 2.jpg', pos: 'center 18%' },
    ],
    description:
      'Main du Roi calculatrice, Otto Hightower place sa fille Alicent sur le chemin de Viserys pour assurer l\'ascension de sa propre maison. Patient et politique jusqu\'à l\'os, il sème les graines d\'une guerre de succession qu\'il ne sera plus là pour voir éclore pleinement.',
  },
  {
    id: 'laena',
    name: 'Laena Velaryon',
    titre: 'Princesse de Peyredragon · Cavalière de Vhagar',
    maison: 'Maison Velaryon · Targaryen',
    acteur: 'Nanna Blondell',
    accent: '#5fa8c9',
    border: '#1c3a4a',
    univers: 'hotd',
    photos: [
      { src: '/gif/Laena Velaryon.webp', pos: 'center center' },
      { src: '/characters/House of the dragon/La famille royale & figures historiques/Laena Velaryon.jpg', pos: 'center 18%' },
      { src: '/characters/House of the dragon/La famille royale & figures historiques/Laena Velaryon 1.jpg', pos: 'center 18%' },
      { src: '/characters/House of the dragon/La famille royale & figures historiques/Laena Velaryon 2.jpg', pos: 'center 18%' },
    ],
    description:
      'Fille de Corlys Velaryon et cavalière de l\'immense Vhagar, Laena rêvait d\'épouser Viserys et de monter sur le trône. Mariée à Daemon, mère de Baela et Rhaena, sa fin tragique à Peyredragon reste l\'une des scènes les plus poignantes — et les plus terribles — de la série.',
  },
  {
    id: 'laenor',
    name: 'Laenor Velaryon',
    titre: 'Héritier de Conduit · Cavalier de Moriot',
    maison: 'Maison Velaryon',
    acteur: 'John Macmillan',
    accent: '#5fa8c9',
    border: '#1c3a4a',
    univers: 'hotd',
    photos: [
      { src: '/gif/Laenor Velaryon.webp', pos: 'center center' },
      { src: '/characters/House of the dragon/La famille royale & figures historiques/Laenor Velaryon.jpg', pos: 'center 18%' },
      { src: '/characters/House of the dragon/La famille royale & figures historiques/Laenor Velaryon 1.jpg', pos: 'center 18%' },
      { src: '/characters/House of the dragon/La famille royale & figures historiques/Laenor Velaryon 2.jpg', pos: 'center 18%' },
      { src: '/characters/House of the dragon/La famille royale & figures historiques/Laenor Velaryon 3.jpg', pos: 'center 18%' },
    ],
    description:
      'Premier mari de Rhaenyra par mariage arrangé, Laenor partage avec elle un accord rare : la liberté d\'aimer ailleurs. Brave cavalier de dragon et âme tourmentée, sa "mort" mettra en scène l\'une des manipulations les plus audacieuses de la Danse des Dragons.',
  },
  {
    id: 'jacaerys',
    name: 'Jacaerys Velaryon',
    titre: 'Prince Jace · Héritier présomptif · Cavalier de Vermax',
    maison: 'Maison Targaryen · Camp Noir',
    acteur: 'Harry Collett',
    accent: '#8a1f1f',
    border: '#2a0c0c',
    univers: 'hotd',
    photos: [
      { src: '/gif/Jacaerys Velaryon.webp', pos: 'center center' },
      { src: '/characters/House of the dragon/Le Camp Noir/Jacaerys Jace Velaryon.jpg', pos: 'center 18%' },
      { src: '/characters/House of the dragon/Le Camp Noir/Jacaerys Jace Velaryon  1.jpg', pos: 'center 18%' },
      { src: '/characters/House of the dragon/Le Camp Noir/Jacaerys Jace Velaryon  2.jpg', pos: 'center 18%' },
      { src: '/characters/House of the dragon/Le Camp Noir/Jacaerys Jace Velaryon  3.jpg', pos: 'center 18%' },
    ],
    description:
      'Fils aîné de Rhaenyra et héritier désigné du Trône de Fer, Jace porte sur ses jeunes épaules le poids de prétendues rumeurs sur sa naissance. Cavalier loyal et prince courageux, il devra voler à travers tout Westeros pour rallier des soutiens à la cause de sa mère.',
  },
  {
    id: 'lucerys',
    name: 'Lucerys Velaryon',
    titre: 'Prince Luke · Cavalier d\'Arrax',
    maison: 'Maison Targaryen · Camp Noir',
    acteur: 'Elliot Grihault',
    accent: '#8a1f1f',
    border: '#2a0c0c',
    univers: 'hotd',
    photos: [
      { src: '/gif/Lucerys Velaryon.webp', pos: 'center center' },
      { src: '/characters/House of the dragon/Le Camp Noir/Lucerys Luke Velaryon.jpg', pos: 'center 18%' },
      { src: '/characters/House of the dragon/Le Camp Noir/Lucerys Luke Velaryon 1.jpg', pos: 'center 18%' },
      { src: '/characters/House of the dragon/Le Camp Noir/Lucerys Luke Velaryon 2.jpg', pos: 'center 18%' },
      { src: '/characters/House of the dragon/Le Camp Noir/Lucerys Luke Velaryon 4.jpg', pos: 'center 18%' },
    ],
    description:
      'Second fils de Rhaenyra, plus tendre et hésitant que son frère Jace, Luke se retrouve malgré lui pris dans l\'engrenage d\'une rivalité familiale qui le dépasse. Sa rencontre dans le ciel avec le prince Aemond et son dragon Vhagar déclenchera la guerre la plus sanglante que les Targaryen n\'aient jamais connue.',
  },
  {
    id: 'baela',
    name: 'Baela Targaryen',
    titre: 'Princesse · Cavalière de Lunaire',
    maison: 'Maison Targaryen · Camp Noir',
    acteur: 'Bethany Antonia',
    accent: '#8a1f1f',
    border: '#2a0c0c',
    univers: 'hotd',
    photos: [
      { src: '/gif/Baela Targaryen.webp', pos: 'center center' },
      { src: '/characters/House of the dragon/Le Camp Noir/Baela Targaryen.jpg', pos: 'center 18%' },
      { src: '/characters/House of the dragon/Le Camp Noir/Baela Targaryen 1.jpg', pos: 'center 18%' },
      { src: '/characters/House of the dragon/Le Camp Noir/Baela Targaryen 2.jpg', pos: 'center 18%' },
    ],
    description:
      'Fille de Daemon et Laena, jumelle de Rhaena, Baela hérite du tempérament fougueux de son père et du courage de sa mère. Cavalière de la jeune Lunaire, elle se bat farouchement pour la cause de Rhaenyra — et pour l\'avenir d\'une dynastie qui se déchire.',
  },
  {
    id: 'rhaena',
    name: 'Rhaena Targaryen',
    titre: 'Princesse · Sans Dragon (encore)',
    maison: 'Maison Targaryen · Camp Noir',
    acteur: 'Phoebe Campbell',
    accent: '#8a1f1f',
    border: '#2a0c0c',
    univers: 'hotd',
    photos: [
      { src: '/gif/Rhaena Targaryen.webp', pos: 'center center' },
      { src: '/characters/House of the dragon/Le Camp Noir/Rhaena Targaryen.jpg', pos: 'center 18%' },
      { src: '/characters/House of the dragon/Le Camp Noir/Rhaena Targaryen 1.jpg', pos: 'center 18%' },
      { src: '/characters/House of the dragon/Le Camp Noir/Rhaena Targaryen 2.jpg', pos: 'center 18%' },
      { src: '/characters/House of the dragon/Le Camp Noir/Rhaena Targaryen 3.jpg', pos: 'center 18%' },
    ],
    description:
      'Jumelle de Baela, Rhaena porte un fardeau particulier dans une famille de cavaliers de dragons : elle n\'en a pas. Sa quête d\'un compagnon ailé bien à elle — et sa détermination farouche à trouver sa place — feront d\'elle l\'une des grandes figures de la génération suivante.',
  },
  {
    id: 'helaena',
    name: 'Helaena Targaryen',
    titre: 'Princesse · Reine consort · Cavalière de Lacérèdragon',
    maison: 'Maison Targaryen · Camp Vert',
    acteur: 'Phia Saban',
    accent: '#4a8a5a',
    border: '#1c3322',
    univers: 'hotd',
    photos: [
      { src: '/gif/Helaena Targaryen.webp', pos: 'center center' },
      { src: '/characters/House of the dragon/Le Camp Vert/Helaena Targaryen.jpg', pos: 'center 18%' },
      { src: '/characters/House of the dragon/Le Camp Vert/Helaena Targaryen 1.jpg', pos: 'center 18%' },
      { src: '/characters/House of the dragon/Le Camp Vert/Helaena Targaryen 2.jpg', pos: 'center 18%' },
      { src: '/characters/House of the dragon/Le Camp Vert/Helaena Targaryen 3.jpg', pos: 'center 18%' },
    ],
    description:
      'Douce et énigmatique, Helaena semble parfois voir au-delà du présent — ses visions troublantes annoncent des tragédies qu\'elle seule perçoit. Mariée à son propre frère Aegon selon la coutume Targaryen, elle subira l\'une des pertes les plus déchirantes de toute la Danse des Dragons.',
  },
  {
    id: 'larys',
    name: 'Larys Strong',
    titre: 'Le Pied d\'Argile · Maître des Chuchoteurs',
    maison: 'Maison Strong',
    acteur: 'Matthew Needham',
    accent: '#7a6a58',
    border: '#332a20',
    univers: 'hotd',
    photos: [
      { src: '/gif/Larys Strong.webp', pos: 'center center' },
      { src: '/characters/House of the dragon/Le Camp Vert/Larys Strong.jpg', pos: 'center 18%' },
      { src: '/characters/House of the dragon/Le Camp Vert/Larys Strong 1.jpg', pos: 'center 18%' },
      { src: '/characters/House of the dragon/Le Camp Vert/Larys Strong 2.jpg', pos: 'center 18%' },
      { src: '/characters/House of the dragon/Le Camp Vert/Larys Strong 4.jpg', pos: '32% 24%' },
    ],
    description:
      'Boiteux méprisé par sa propre famille, Larys compense son infirmité par une intelligence retorse et un goût prononcé pour les secrets les plus sombres. Ses manipulations silencieuses, et l\'incendie qui scelle son ascension, en font l\'une des éminences grises les plus inquiétantes de la cour.',
  },
  {
    id: 'harwin-strong',
    name: 'Harwin Strong',
    titre: 'Casse-Os · Commandant de la Garde de la Citadelle',
    maison: 'Maison Strong',
    acteur: 'Ryan Corr',
    accent: '#7a6a58',
    border: '#332a20',
    univers: 'hotd',
    photos: [
      { src: '/gif/Harwin Strong.webp', pos: 'center center' },
      { src: '/characters/House of the dragon/La famille royale & figures historiques/Harwin Strong.jpg', pos: 'center 18%' },
      { src: '/characters/House of the dragon/La famille royale & figures historiques/Harwin Strong 1.jpg', pos: 'center 18%' },
      { src: '/characters/House of the dragon/La famille royale & figures historiques/Harwin Strong 2.jpg', pos: 'center 18%' },
    ],
    description:
      'Surnommé Casse-Os pour sa force au combat, Harwin Strong devient bien plus qu\'un garde aux yeux de Rhaenyra. Leur liaison secrète, et les enfants qui en naîtront, jetteront une ombre de doute qui pèsera sur tout le règne — et toute la guerre — à venir.',
  },
  {
    id: 'lyonel-strong',
    name: 'Lyonel Strong',
    titre: 'Seigneur de Harrenhal · Main du Roi',
    maison: 'Maison Strong',
    acteur: 'Gavin Spokes',
    accent: '#7a6a58',
    border: '#332a20',
    univers: 'hotd',
    photos: [
      { src: '/characters/House of the dragon/La famille royale & figures historiques/Lyonel Strong 1.jpg', pos: 'center 18%' },
      { src: '/characters/House of the dragon/La famille royale & figures historiques/Lyonel Strong.jpg', pos: 'center 18%' },
      { src: '/characters/House of the dragon/La famille royale & figures historiques/Lyonel Strong 2.jpg', pos: 'center 18%' },
    ],
    description:
      'Loyal Main du Roi Viserys, Lyonel Strong porte le poids d\'un secret familial qui pourrait déstabiliser le trône lui-même. Sa fin, dans l\'incendie de Harrenhal aux côtés de son fils Harwin, demeure enveloppée d\'un mystère que beaucoup, à la cour, préfèrent ne jamais éclaircir.',
  },
  {
    id: 'mysaria',
    name: 'Mysaria',
    titre: 'Le Ver Blanc · Maîtresse des Chuchoteurs de Port-Réal',
    maison: 'Sans maison · Lys',
    acteur: 'Sonoya Mizuno',
    accent: '#6a6050',
    border: '#262018',
    univers: 'hotd',
    photos: [
      { src: '/gif/Mysaria.webp', pos: 'center center' },
      { src: '/characters/House of the dragon/Le Camp Noir/Mysaria le Ver Blanc.jpg', pos: 'center 18%' },
      { src: '/characters/House of the dragon/Le Camp Noir/Mysaria le Ver Blanc 1.jpg', pos: 'center 18%' },
      { src: '/characters/House of the dragon/Le Camp Noir/Mysaria le Ver Blanc 2.jpg', pos: 'center 32%' },
      { src: '/characters/House of the dragon/Le Camp Noir/Mysaria le Ver Blanc 3.jpg', pos: 'center 18%' },
    ],
    description:
      'Ancienne compagne de Daemon devenue maîtresse d\'un réseau d\'espionnage redoutable, Mysaria a gravi les échelons de Port-Réal en partant de rien — littéralement de la rue. Son intelligence acérée et sa soif de justice pour les sans-pouvoir en font une joueuse aussi insaisissable que dangereuse.',
  },
  {
    id: 'aegon-conquerant',
    name: 'Aegon le Conquérant',
    titre: 'Aegon Ier Targaryen · Premier Roi des Sept Couronnes',
    maison: 'Maison Targaryen',
    acteur: 'Légende de Westeros',
    accent: '#c0392b',
    border: '#7a1a1a',
    univers: 'legende',
    photos: [
      { src: '/characters/Legende/La dynastie Targaryen/Aegon le Conquérant.jpg', pos: '70% 50%' },
      { src: '/characters/Legende/La dynastie Targaryen/Aegon le Conquérant 1.jpg', pos: 'center 18%' },
      { src: '/characters/Legende/La dynastie Targaryen/Aegon le Conquérant 2.jpg', pos: 'center 18%' },
      { src: '/characters/Legende/La dynastie Targaryen/Aegon le Conquérant 3.jpg', pos: '100% 50%' },
    ],
    description:
      'Monté sur Balerion le Dragon Noir, accompagné de ses sœurs-épouses Visenya et Rhaenys, Aegon a uni six des sept royaumes par le feu et le sang pour fonder le Trône de Fer — littéralement forgé à partir des épées de ses ennemis vaincus. Son règne fait de lui le patriarche absolu de toute la dynastie Targaryen.',
  },
  {
    id: 'aerys-ii',
    name: 'Aerys II Targaryen',
    titre: 'Le Roi Fou · Dernier des Rois Dragons',
    maison: 'Maison Targaryen',
    acteur: 'Légende de Westeros',
    accent: '#c0392b',
    border: '#7a1a1a',
    univers: 'legende',
    photos: [
      { src: '/characters/Legende/La dynastie Targaryen/Aerys II Targaryen 1.jpg', pos: 'center 15%' },
      { src: '/characters/Legende/La dynastie Targaryen/Aerys II Targaryen.jpg', pos: 'center 15%' },
      { src: '/characters/Legende/La dynastie Targaryen/Aerys II Targaryen 2.jpg', pos: 'center 15%' },
      { src: '/characters/Legende/La dynastie Targaryen/Aerys II Targaryen 3.jpg', pos: 'center 15%' },
    ],
    description:
      'Rongé par la paranoïa et une obsession dévorante pour le feu, le Roi Fou a transformé les dernières années de son règne en un règne de terreur — caches de feu grégeois sous Port-Réal comprises. Sa mort, sous l\'épée de son propre Garde Royal Jaime Lannister, a mis fin à près de trois siècles de domination Targaryen.',
  },
  {
    id: 'rhaegar',
    name: 'Rhaegar Targaryen',
    titre: 'Prince de Peyredragon · Le Dragon qui Rêvait',
    maison: 'Maison Targaryen',
    acteur: 'Légende de Westeros',
    accent: '#c0392b',
    border: '#7a1a1a',
    univers: 'legende',
    photos: [
      { src: '/characters/Legende/La dynastie Targaryen/Rhaegar Targaryen.jpg', pos: 'center 15%' },
      { src: '/characters/Legende/La dynastie Targaryen/Rhaegar Targaryen 2.jpg', pos: 'center 15%' },
      { src: '/characters/Legende/La dynastie Targaryen/Rhaegar Targaryen 3.jpg', pos: 'center 15%' },
    ],
    description:
      'Prince mélancolique et rêveur, plus à l\'aise avec une harpe qu\'une épée, Rhaegar était promis à un destin de héros par les prophéties anciennes. Son geste envers Lyanna Stark — qu\'il ait été enlèvement ou amour partagé — déclenchera la rébellion qui mettra fin au règne de son père et changera à jamais le sort de Westeros.',
  },
  {
    id: 'lyanna-stark',
    name: 'Lyanna Stark',
    titre: 'La Rose de l\'Hiver · Le Mystère de la Tour de la Joie',
    maison: 'Maison Stark',
    acteur: 'Légende de Westeros',
    accent: '#8fafc4',
    border: '#3a5070',
    univers: 'legende',
    photos: [
      { src: '/characters/Legende/La rébellion de Robert & les Stark disparus/Lyanna Stark.jpg', pos: 'center 18%' },
      { src: '/characters/Legende/La rébellion de Robert & les Stark disparus/Lyanna Stark 1.jpg', pos: '60% 50%' },
      { src: '/characters/Legende/La rébellion de Robert & les Stark disparus/Lyanna Stark 2.jpg', pos: 'center 18%' },
      { src: '/characters/Legende/La rébellion de Robert & les Stark disparus/Lyanna Stark 3.jpg', pos: 'center 18%' },
      { src: '/characters/Legende/La rébellion de Robert & les Stark disparus/Lyanna Stark 4.jpg', pos: 'center 18%' },
    ],
    description:
      'Promise à Robert Baratheon mais éprise d\'un destin différent, Lyanna disparaît au bras du prince Rhaegar Targaryen — un geste qui embrase tout Westeros. Sa mort à la Tour de la Joie, et la promesse arrachée à son frère Ned dans un lit ensanglanté, cachent un secret qui rebattra toutes les cartes du jeu des trônes.',
  },
  {
    id: 'rhaella',
    name: 'Rhaella Targaryen',
    titre: 'Reine des Sept Royaumes · Mère du Dragon',
    maison: 'Maison Targaryen',
    acteur: 'Légende de Westeros',
    accent: '#c0392b',
    border: '#7a1a1a',
    univers: 'legende',
    photos: [
      { src: '/characters/Legende/La dynastie Targaryen/Rhaella Targaryen.jpg', pos: 'center 18%' },
      { src: '/characters/Legende/La dynastie Targaryen/Rhaella Targaryen 1.jpg', pos: 'center 18%' },
      { src: '/characters/Legende/La dynastie Targaryen/Rhaella Targaryen 2.jpg', pos: 'center 18%' },
      { src: '/characters/Legende/La dynastie Targaryen/Rhaella Targaryen 3.jpg', pos: 'center 18%' },
    ],
    description:
      'Épouse et sœur du Roi Fou, Rhaella a enduré un mariage de cruauté et de peur durant des décennies. Morte en donnant naissance à Daenerys au beau milieu d\'une tempête sur Peyredragon, elle laisse derrière elle la dernière flamme d\'une dynastie — une fille née "au milieu du sel et de la fumée".',
  },
  {
    id: 'gregor-clegane',
    name: 'Gregor Clegane',
    titre: 'La Montagne · Le Plus Fort des Sept Royaumes',
    maison: 'Maison Clegane',
    acteur: 'Légende de Westeros',
    accent: '#6a6050',
    border: '#262018',
    univers: 'legende',
    photos: [
      { src: '/characters/Legende/Figures historiques marquantes/Gregor Clegane  1.jpg', pos: 'center 15%' },
      { src: '/characters/Legende/Figures historiques marquantes/Gregor Clegane.jpg', pos: 'center 15%' },
      { src: '/characters/Legende/Figures historiques marquantes/Gregor Clegane  2.jpg', pos: '32% 25%' },
      { src: '/characters/Legende/Figures historiques marquantes/Gregor Clegane  3.jpg', pos: 'center 15%' },
      { src: '/characters/Legende/Figures historiques marquantes/Gregor Clegane  4.jpg', pos: 'center 15%' },
    ],
    description:
      'Géant monstrueux à la force surhumaine, la Montagne a brûlé le visage de son propre frère et massacré une princesse et ses enfants durant le sac de Port-Réal. Ni la lance empoisonnée d\'Oberyn Martell, ni la mort elle-même, ne parviendront vraiment à arrêter ce que Qyburn entreprendra de "réparer".',
  },
  {
    id: 'brandon-stark',
    name: 'Brandon Stark',
    titre: 'Le Loup Sauvage · Héritier de Winterfell',
    maison: 'Maison Stark',
    acteur: 'Légende de Westeros',
    accent: '#8fafc4',
    border: '#3a5070',
    univers: 'legende',
    photos: [
      { src: '/characters/Legende/La rébellion de Robert & les Stark disparus/Brandon Stark 2.webp', pos: '65% 42%' },
      { src: '/characters/Legende/La rébellion de Robert & les Stark disparus/Brandon Stark 1.webp', pos: 'center 18%' },
      { src: '/characters/Legende/La rébellion de Robert & les Stark disparus/Brandon Stark.webp', pos: 'center 18%' },
    ],
    description:
      'Frère aîné d\'Eddard et fougueux héritier de Winterfell, Brandon était promis à Catelyn Tully et destiné à régner sur le Nord. Son arrivée à Port-Réal pour défendre l\'honneur de sa sœur Lyanna se soldera par sa mort — étranglé sous les yeux de son propre père — et allumera la mèche de la rébellion.',
  },
  {
    id: 'rickard-stark',
    name: 'Rickard Stark',
    titre: 'Seigneur de Winterfell · Gardien du Nord',
    maison: 'Maison Stark',
    acteur: 'Légende de Westeros',
    accent: '#8fafc4',
    border: '#3a5070',
    univers: 'legende',
    photos: [
      { src: '/characters/Legende/La rébellion de Robert & les Stark disparus/Rickard Stark 1.webp', pos: 'center 18%' },
      { src: '/characters/Legende/La rébellion de Robert & les Stark disparus/Rickard Stark.jpg', pos: 'center 18%' },
      { src: '/characters/Legende/La rébellion de Robert & les Stark disparus/Rickard Stark 2.webp', pos: 'center 18%' },
      { src: '/characters/Legende/La rébellion de Robert & les Stark disparus/Rickard Stark 3.webp', pos: '70% 42%' },
    ],
    description:
      'Patriarche fier des Stark, Rickard se rend à Port-Réal pour réclamer justice après la disparition de sa fille Lyanna — et y trouve une mort aussi cruelle qu\'injuste, brûlé vif par le feu grégeois du Roi Fou pendant que son fils Brandon est étranglé sous ses yeux. Cette double exécution scellera le destin de tout un royaume.',
  },
  {
    id: 'arthur-dayne',
    name: 'Arthur Dayne',
    titre: 'L\'Épée du Matin · Garde Royale du Roi Fou',
    maison: 'Maison Dayne',
    acteur: 'Légende de Westeros',
    accent: '#9a8a6a',
    border: '#3a3326',
    univers: 'legende',
    photos: [
      { src: '/characters/Legende/Figures historiques marquantes/Arthur Dayne.jpg', pos: 'center 18%' },
      { src: '/characters/Legende/Figures historiques marquantes/Arthur Dayne 1.jpg', pos: 'center 18%' },
      { src: '/characters/Legende/Figures historiques marquantes/Arthur Dayne 2.jpg', pos: 'center 18%' },
      { src: '/characters/Legende/Figures historiques marquantes/Arthur Dayne 3.jpg', pos: 'center 28%' },
      { src: '/characters/Legende/Figures historiques marquantes/Arthur Dayne 4.jpg', pos: 'center 18%' },
    ],
    description:
      'Considéré comme le plus grand épéiste de son temps, Ser Arthur Dayne manie Aube, l\'épée ancestrale de sa maison forgée dans l\'acier d\'une étoile tombée du ciel. Sa mort à la Tour de la Joie, face à Eddard Stark, reste l\'un des combats les plus mythifiés — et les plus lourds de sens — de toute l\'histoire de Westeros.',
  },
  {
    id: 'azor-ahai',
    name: 'Azor Ahai',
    titre: 'Le Héros Légendaire · Porteur de Illumination',
    maison: 'Mythe d\'Asshai',
    acteur: 'Légende immémoriale',
    accent: '#c98a4a',
    border: '#5a3a1a',
    univers: 'legende',
    photos: [
      { src: '/characters/Legende/Rois et reines de légende/Azor Ahai.jpg', pos: 'center 18%' },
      { src: '/characters/Legende/Rois et reines de légende/Azor Ahai 1.jpg', pos: 'center 18%' },
      { src: '/characters/Legende/Rois et reines de légende/Azor Ahai 2.jpg', pos: 'center 18%' },
      { src: '/characters/Legende/Rois et reines de légende/Azor Ahai 3.jpg', pos: 'center 26%' },
    ],
    description:
      'Selon la prophétie de R\'hllor, Azor Ahai aurait forgé Illumination en trempant son épée dans le cœur de la femme qu\'il aimait, créant une arme capable de repousser les ténèbres. Sa promesse de renaître "au milieu du sel et de la fumée" pour combattre le Grand Autre alimente toutes les croyances de Mélisandre — et plane sur le destin de Daenerys comme de Jon Snow.',
  },
  {
    id: 'bran-le-batisseur',
    name: 'Bran le Bâtisseur',
    titre: 'Roi Légendaire des Premiers Hommes · Architecte du Mur',
    maison: 'Maison Stark (légendaire)',
    acteur: 'Légende immémoriale',
    accent: '#9a8a6a',
    border: '#3a3326',
    univers: 'legende',
    photos: [
      { src: '/characters/Legende/Rois et reines de légende/Bran le Bâtisseur.jpg', pos: 'center 18%' },
      { src: '/characters/Legende/Rois et reines de légende/Bran le Bâtisseur 1.jpg', pos: '12% 45%' },
      { src: '/characters/Legende/Rois et reines de légende/Bran le Bâtisseur 2.jpg', pos: 'center 18%' },
    ],
    description:
      'Roi mythique des Premiers Hommes, fondateur de Winterfell et bâtisseur légendaire du Mur — une muraille de glace haute de plus de deux cents mètres censée arrêter toute menace venue du Nord. Son nom, porté des siècles plus tard par le jeune Bran Stark, résonne comme un écho à travers toute l\'histoire des Sept Couronnes.',
  },
  {
    id: 'garth-mainverte',
    name: 'Garth Mainverte',
    titre: 'Premier Roi des Hommes des Vergers · Père de Westeros',
    maison: 'Légende des Vergers',
    acteur: 'Légende immémoriale',
    accent: '#8fbf5f',
    border: '#3a5a28',
    univers: 'legende',
    photos: [
      { src: '/characters/Legende/Rois et reines de légende/Garth Mainverte.jpg', pos: 'center 18%' },
      { src: '/characters/Legende/Rois et reines de légende/Garth Mainverte 1.jpg', pos: 'center 18%' },
      { src: '/characters/Legende/Rois et reines de légende/Garth Mainverte 2.jpg', pos: 'center 18%' },
      { src: '/characters/Legende/Rois et reines de légende/Garth Mainverte 3.jpg', pos: 'center 18%' },
    ],
    description:
      'Figure quasi-divine vénérée par les hommes des Vergers, Garth Mainverte aurait apporté l\'agriculture à Westeros et engendré, selon la légende, des lignées entières de grandes maisons — dont les Tyrell et les Tully revendiquent la descendance. Son couronnement de fleurs et sa silhouette verdoyante font de lui le symbole vivant de la fertilité du Sud.',
  },
  {
    id: 'lann-le-ruse',
    name: 'Lann le Rusé',
    titre: 'Fondateur Légendaire de Castral Roc',
    maison: 'Légende Lannister',
    acteur: 'Légende immémoriale',
    accent: '#d4a84b',
    border: '#7a6130',
    univers: 'legende',
    photos: [
      { src: '/characters/Legende/Rois et reines de légende/Lann le Rusé.jpg', pos: 'center 18%' },
      { src: '/characters/Legende/Rois et reines de légende/Lann le Rusé 1.jpg', pos: '32% 42%' },
    ],
    description:
      'Filou légendaire des Hommes du Vent d\'Ouest, Lann le Rusé aurait dérobé Castral Roc aux Castral par la seule force de sa ruse — au point d\'être encore là, dit-on, quand ces derniers s\'aperçurent du vol. Son astuce devint la fierté de toute la maison Lannister, qui se targue depuis de "payer toujours ses dettes".',
  },
  {
    id: 'dernier-heros',
    name: 'Le Dernier Héros',
    titre: 'Légende des Temps de l\'Aube · Vainqueur de la Longue Nuit',
    maison: 'Mythe des Premiers Hommes',
    acteur: 'Légende immémoriale',
    accent: '#6fb8e8',
    border: '#1a3050',
    univers: 'legende',
    photos: [
      { src: '/characters/Legende/Rois et reines de légende/Le Dernier Héros.jpg', pos: 'center 20%' },
    ],
    description:
      'Selon les récits les plus anciens, un seul homme — accompagné de douze compagnons, d\'une épée de fer-étoile et d\'un cœur sans peur — serait parti à la recherche des Enfants de la Forêt pour sauver l\'humanité de la Longue Nuit. Aucun de ses compagnons n\'a survécu au voyage. Lui seul est revenu... et a changé le cours de l\'Histoire.',
  },
  {
    id: 'symeon',
    name: 'Symeon Œil-d\'Étoile',
    titre: 'Chevalier Aveugle Légendaire',
    maison: 'Légende de la chevalerie',
    acteur: 'Légende immémoriale',
    accent: '#9a8a6a',
    border: '#3a3326',
    univers: 'legende',
    photos: [
      { src: "/characters/Legende/Rois et reines de légende/Symeon Œil-d'Étoile 1.jpg", pos: 'center 18%' },
      { src: "/characters/Legende/Rois et reines de légende/Symeon Œil-d'Étoile.jpg", pos: 'center 18%' },
      { src: "/characters/Legende/Rois et reines de légende/Symeon Œil-d'Étoile 2.jpg", pos: 'center 18%' },
    ],
    description:
      'Devenu aveugle après avoir perdu ses deux yeux au combat, ce chevalier légendaire aurait remplacé son regard perdu par deux saphirs étincelants — voyant, disait-on, plus clairement qu\'avant grâce à un don octroyé par les sept dieux eux-mêmes. Son histoire incarne la conviction que le courage et la foi peuvent transcender n\'importe quelle infirmité.',
  },
  {
    id: 'serwyn',
    name: 'Serwyn du Bouclier-Miroir',
    titre: 'Chevalier Légendaire de la Garde Royale',
    maison: 'Légende de la chevalerie',
    acteur: 'Légende immémoriale',
    accent: '#9a8a6a',
    border: '#3a3326',
    univers: 'legende',
    photos: [
      { src: '/characters/Legende/Rois et reines de légende/Serwyn du Bouclier-Miroir.jpg', pos: 'center 18%' },
      { src: '/characters/Legende/Rois et reines de légende/Serwyn du Bouclier-Miroir 1.jpg', pos: 'center 18%' },
      { src: '/characters/Legende/Rois et reines de légende/Serwyn du Bouclier-Miroir 2.jpg', pos: 'center 18%' },
    ],
    description:
      'Héros de contes que l\'on raconte aux enfants de Westeros bien avant qu\'ils ne sachent tenir une épée, Serwyn aurait vaincu le dragon Urrax en se servant de son bouclier poli comme d\'un miroir, aveuglant la créature avant de la terrasser. Une légende parmi tant d\'autres qui nourrissent les rêves de chevalerie d\'une Sansa — ou d\'un Brienne.',
  },
  {
    id: 'nymeria',
    name: 'La Princesse Nymeria',
    titre: 'Reine guerrière de Rhoyne · Fondatrice de Dorne',
    maison: 'Légende Rhoynar',
    acteur: 'Légende de Westeros',
    accent: '#e08030',
    border: '#6a3010',
    univers: 'legende',
    photos: [
      { src: '/characters/Legende/Figures historiques marquantes/nymeria.jpg', pos: '30% 50%' },
      { src: '/characters/Legende/Figures historiques marquantes/nymeria 1.jpg', pos: 'center 18%' },
      { src: '/characters/Legende/Figures historiques marquantes/nymeria 2.jpg', pos: 'center 18%' },
      { src: '/characters/Legende/Figures historiques marquantes/nymeria 4.jpg', pos: 'center 18%' },
    ],
    description:
      'Reine guerrière des Rhoynars, Nymeria mena dix mille navires à travers la mer Étroite pour fuir l\'esclavage de Valyria et trouva refuge à Dorne. En épousant Mors Martell et en brûlant sa propre flotte pour sceller son nouveau destin, elle devint la fondatrice spirituelle de Dorne — et donna son nom à la louve d\'Arya, des siècles plus tard.',
  },
  {
    id: 'duncan-le-grand',
    name: 'Ser Duncan le Grand',
    titre: 'Dunk · Lord Commandant de la Garde Royale',
    maison: 'Chevalier sans maison',
    acteur: "L'Œuf de Dunk et l'Œuf",
    accent: '#b89868',
    border: '#4a3a26',
    univers: 'aksk',
    photos: [
      { src: '/gif/Ser Duncan le Grand.webp', pos: 'center center' },
      { src: '/characters/A Knight of the Seven Kingdoms/Les héros de l\'histoire/Ser Duncan le Grand.jpg', pos: 'center 18%' },
      { src: '/characters/A Knight of the Seven Kingdoms/Les héros de l\'histoire/Ser Duncan le Grand 1.jpg', pos: 'center 18%' },
      { src: '/characters/A Knight of the Seven Kingdoms/Les héros de l\'histoire/Ser Duncan le Grand 2.jpg', pos: 'center 18%' },
      { src: '/characters/A Knight of the Seven Kingdoms/Les héros de l\'histoire/Ser Duncan le Grand 3.jpeg', pos: 'center 18%' },
      { src: '/characters/A Knight of the Seven Kingdoms/Les héros de l\'histoire/Ser Duncan le Grand 4.jpg', pos: 'center 18%' },
    ],
    description:
      'Orphelin des bas-fonds de Port-Réal devenu chevalier par la seule force de son honneur et de sa hache, Dunk parcourt les Sept Couronnes accompagné de son jeune écuyer "Œuf". Sa loyauté indéfectible et son sens inné de la justice en feront, des décennies plus tard, l\'un des plus grands Lords Commandants que la Garde Royale ait jamais connus.',
  },
  {
    id: 'aegon-oeuf',
    name: 'Aegon Targaryen "Œuf"',
    titre: 'Prince · Écuyer · Futur Roi Aegon V le Généreux',
    maison: 'Maison Targaryen',
    acteur: "L'Œuf de Dunk et l'Œuf",
    accent: '#c0392b',
    border: '#7a1a1a',
    univers: 'aksk',
    photos: [
      { src: '/gif/Aegon Targaryen Œuf.webp', pos: 'center center' },
      { src: '/characters/A Knight of the Seven Kingdoms/Les héros de l\'histoire/Prince Aegon Targaryen Œuf.jpg', pos: 'center 15%' },
      { src: '/characters/A Knight of the Seven Kingdoms/Les héros de l\'histoire/Prince Aegon Targaryen Œuf 1.jpg', pos: 'center 15%' },
      { src: '/characters/A Knight of the Seven Kingdoms/Les héros de l\'histoire/Prince Aegon Targaryen Œuf 2.jpg', pos: 'center 15%' },
      { src: '/characters/A Knight of the Seven Kingdoms/Les héros de l\'histoire/Prince Aegon Targaryen Œuf 3.jpg', pos: 'center 15%' },
      { src: '/characters/A Knight of the Seven Kingdoms/Les héros de l\'histoire/Prince Aegon Targaryen Œuf 4.jpg', pos: 'center 15%' },
    ],
    description:
      'Prince targaryen au crâne rasé, "Œuf" voyage incognito comme écuyer du chevalier errant Dunk — fuyant les contraintes de son rang pour goûter à la liberté des routes. Il deviendra plus tard l\'un des rois les plus aimés de l\'histoire de Westeros, Aegon V le Généreux — sans jamais oublier l\'ami qui l\'a pris sous son aile quand il n\'était encore "que" lui-même.',
  },
  {
    id: 'arlan-pennytree',
    name: 'Ser Arlan de Pennytree',
    titre: 'Chevalier Errant · Maître de Dunk',
    maison: 'Chevalier sans maison',
    acteur: "L'Œuf de Dunk et l'Œuf",
    accent: '#b89868',
    border: '#4a3a26',
    univers: 'aksk',
    photos: [
      { src: '/gif/Ser Arlan de Pennytree 1.webp', pos: 'center center' },
      { src: '/gif/Ser Arlan de Pennytree.webp', pos: 'center center' },
      { src: '/characters/A Knight of the Seven Kingdoms/Les héros de l\'histoire/Ser Arlan de Pennytree.jpg', pos: 'center 18%' },
      { src: '/characters/A Knight of the Seven Kingdoms/Les héros de l\'histoire/Ser Arlan de Pennytree 1.jpg', pos: 'center 18%' },
      { src: '/characters/A Knight of the Seven Kingdoms/Les héros de l\'histoire/Ser Arlan de Pennytree 2.jpg', pos: 'center 18%' },
      { src: '/characters/A Knight of the Seven Kingdoms/Les héros de l\'histoire/Ser Arlan de Pennytree 3.jpg', pos: '70% 50%' },
    ],
    description:
      'Vieux chevalier errant qui recueille un orphelin géant nommé Dunk et fait de lui son écuyer, Ser Arlan transmet à son protégé bien plus que les arts du combat : un code d\'honneur simple et inébranlable. Sa mort, sur la route d\'un tournoi, marquera le vrai début de l\'aventure de Dunk.',
  },
  {
    id: 'baelor-breakspear',
    name: 'Baelor Breakspear',
    titre: 'Prince de Peyredragon · L\'Héritier Bien-Aimé',
    maison: 'Maison Targaryen',
    acteur: "L'Épée Lige",
    accent: '#c0392b',
    border: '#7a1a1a',
    univers: 'aksk',
    photos: [
      { src: '/gif/Baelor Breakspear.webp', pos: 'center center' },
      { src: '/characters/A Knight of the Seven Kingdoms/La famille royale Targaryen de l\'époque/Prince Baelor Breakspear.jpg', pos: 'center 15%' },
      { src: '/characters/A Knight of the Seven Kingdoms/La famille royale Targaryen de l\'époque/Prince Baelor Breakspear 1.jpg', pos: 'center 15%' },
      { src: '/characters/A Knight of the Seven Kingdoms/La famille royale Targaryen de l\'époque/Prince Baelor Breakspear 2.jpg', pos: 'center 15%' },
      { src: '/characters/A Knight of the Seven Kingdoms/La famille royale Targaryen de l\'époque/Prince Baelor Breakspear 3.jpg', pos: 'center 15%' },
      { src: '/characters/A Knight of the Seven Kingdoms/La famille royale Targaryen de l\'époque/Prince Baelor Breakspear 4.jpg', pos: 'center 15%' },
    ],
    description:
      'Surnommé "Brise-Lance" pour avoir affronté son propre père en combat de tournoi, Baelor incarne tout ce que la maison Targaryen pourrait être à son meilleur : juste, brave, aimé du peuple. Sa mort accidentelle, lors d\'un duel destiné à laver l\'honneur de sa famille, plongera le royaume dans le deuil — et ouvrira la voie à des successions bien plus sombres.',
  },
  {
    id: 'maekar',
    name: 'Maekar Targaryen',
    titre: 'Prince · Futur Roi Maekar Ier',
    maison: 'Maison Targaryen',
    acteur: "L'Épée Lige",
    accent: '#c0392b',
    border: '#7a1a1a',
    univers: 'aksk',
    photos: [
      { src: '/gif/Maekar Targaryen.webp', pos: 'center center' },
      { src: '/characters/A Knight of the Seven Kingdoms/La famille royale Targaryen de l\'époque/Prince Maekar Targaryen.jpg', pos: 'center 15%' },
      { src: '/characters/A Knight of the Seven Kingdoms/La famille royale Targaryen de l\'époque/Prince Maekar Targaryen 1.jpg', pos: 'center 15%' },
      { src: '/characters/A Knight of the Seven Kingdoms/La famille royale Targaryen de l\'époque/Prince Maekar Targaryen 2.jpg', pos: 'center 15%' },
      { src: '/characters/A Knight of the Seven Kingdoms/La famille royale Targaryen de l\'époque/Prince Maekar Targaryen 3.jpg', pos: 'center 15%' },
    ],
    description:
      'Quatrième fils du roi Daeron II, Maekar porte un tempérament colérique et une masse d\'armes redoutable. Son duel accidentel contre son propre frère Baelor, et le sort cruel qu\'il réserve à Ser Duncan, dessinent les contours d\'un homme rude que le trône changera profondément.',
  },
  {
    id: 'daeron-aksk',
    name: 'Daeron Targaryen',
    titre: 'Prince · Fils de Maekar · "Le Bibliophile"',
    maison: 'Maison Targaryen',
    acteur: "L'Épée Lige",
    accent: '#c0392b',
    border: '#7a1a1a',
    univers: 'aksk',
    photos: [
      { src: '/gif/Daeron Targaryen.webp', pos: 'center center' },
      { src: '/characters/A Knight of the Seven Kingdoms/La famille royale Targaryen de l\'époque/Prince Daeron.jpg', pos: 'center 18%' },
      { src: '/characters/A Knight of the Seven Kingdoms/La famille royale Targaryen de l\'époque/Prince Daeron 1.jpg', pos: 'center 18%' },
      { src: '/characters/A Knight of the Seven Kingdoms/La famille royale Targaryen de l\'époque/Prince Daeron 2.jpg', pos: 'center 18%' },
      { src: '/characters/A Knight of the Seven Kingdoms/La famille royale Targaryen de l\'époque/Prince Daeron 3.jpg', pos: 'center 18%' },
    ],
    description:
      'Préférant les livres aux lances, Daeron déçoit son père Maekar par son manque d\'enthousiasme pour les arts de la guerre. Pourtant, dans un monde où l\'épée tranche plus souvent que la raison, son regard différent pourrait s\'avérer plus précieux qu\'il n\'y paraît.',
  },
  {
    id: 'aerion',
    name: 'Aerion Targaryen',
    titre: 'Le Prince Monstrueux · "Brightflame"',
    maison: 'Maison Targaryen',
    acteur: "L'Épée Lige",
    accent: '#c0392b',
    border: '#7a1a1a',
    univers: 'aksk',
    photos: [
      { src: '/gif/Aerion Targaryen.webp', pos: 'center center' },
      { src: '/characters/A Knight of the Seven Kingdoms/La famille royale Targaryen de l\'époque/Prince Aerion Targarye.jpg', pos: 'center 15%' },
      { src: '/characters/A Knight of the Seven Kingdoms/La famille royale Targaryen de l\'époque/Prince Aerion Targarye 1.jpg', pos: 'center 15%' },
      { src: '/characters/A Knight of the Seven Kingdoms/La famille royale Targaryen de l\'époque/Prince Aerion Targarye 2.jpg', pos: 'center 15%' },
      { src: '/characters/A Knight of the Seven Kingdoms/La famille royale Targaryen de l\'époque/Prince Aerion Targarye 3.jpg', pos: 'center 15%' },
      { src: '/characters/A Knight of the Seven Kingdoms/La famille royale Targaryen de l\'époque/Prince Aerion Targarye 4.jpg', pos: 'center 15%' },
    ],
    description:
      'Cruel, vaniteux et persuadé d\'être un dragon enfermé dans un corps d\'homme, Aerion sème le chaos partout où il passe. Sa folie le conduira à boire du feu grégeois dans l\'espoir absurde de "renaître" en dragon — un acte qui causera sa propre perte, atroce et méritée.',
  },
  {
    id: 'valarr',
    name: 'Valarr Targaryen',
    titre: 'Prince de Peyredragon · "Jeune Dragon"',
    maison: 'Maison Targaryen',
    acteur: "L'Épée Lige",
    accent: '#c0392b',
    border: '#7a1a1a',
    univers: 'aksk',
    photos: [
      { src: '/characters/A Knight of the Seven Kingdoms/La famille royale Targaryen de l\'époque/Prince Valarr Targaryen 2.jpg', pos: 'center 15%' },
      { src: '/characters/A Knight of the Seven Kingdoms/La famille royale Targaryen de l\'époque/Prince Valarr Targaryen 1.jpg', pos: 'center 15%' },
      { src: '/characters/A Knight of the Seven Kingdoms/La famille royale Targaryen de l\'époque/Prince Valarr Targaryen.jpg', pos: 'center 15%' },
      { src: '/characters/A Knight of the Seven Kingdoms/La famille royale Targaryen de l\'époque/Prince Valarr Targaryen 3.jpg', pos: 'center 15%' },
    ],
    description:
      'Fils du prince Baelor et héritier d\'un nom porteur de grands espoirs, Valarr grandit dans l\'ombre d\'un père aimé et d\'un avenir tracé. Le destin, pourtant, ne suit jamais le chemin que les princes targaryens espèrent emprunter.',
  },
  {
    id: 'brynden-rivers',
    name: 'Brynden Rivers',
    titre: 'Lord Bloodraven · Main du Roi · Corbeau à Trois Yeux',
    maison: 'Maison Targaryen (bâtard)',
    acteur: "L'Épée Lige",
    accent: '#6a6050',
    border: '#262018',
    univers: 'aksk',
    photos: [
      { src: '/characters/A Knight of the Seven Kingdoms/La famille royale Targaryen de l\'époque/Lord Brynden Rivers 1.jpg', pos: 'center 18%' },
      { src: '/characters/A Knight of the Seven Kingdoms/La famille royale Targaryen de l\'époque/Lord Brynden Rivers.jpg', pos: 'center 18%' },
      { src: '/characters/A Knight of the Seven Kingdoms/La famille royale Targaryen de l\'époque/Lord Brynden Rivers 2.jpg', pos: 'center 18%' },
      { src: '/characters/A Knight of the Seven Kingdoms/La famille royale Targaryen de l\'époque/Lord Brynden Rivers 3.jpg', pos: 'center 18%' },
    ],
    description:
      'Bâtard targaryen à la peau pâle et à l\'œil rouge sang, Lord Bloodraven dirige les services secrets du royaume avec une efficacité glaçante — "mille yeux et un", dit-on de lui. Bien des années plus tard, au-delà du Mur, il deviendra quelque chose de bien plus ancien encore : le Corbeau à Trois Yeux.',
  },
  {
    id: 'rohanne-webber',
    name: 'Lady Rohanne Webber',
    titre: 'Dame de Coin-de-Toile · "La Veuve de Sang"',
    maison: 'Maison Webber',
    acteur: 'Le Chevalier Mystère',
    accent: '#b89868',
    border: '#4a3a26',
    univers: 'aksk',
    photos: [
      { src: '/characters/A Knight of the Seven Kingdoms/Chevaliers, dames et seigneurs rencontrés en chemin/Lady Rohanne Webber 2.jpg', pos: 'center 18%' },
      { src: '/characters/A Knight of the Seven Kingdoms/Chevaliers, dames et seigneurs rencontrés en chemin/Lady Rohanne Webber 1.jpg', pos: 'center 18%' },
      { src: '/characters/A Knight of the Seven Kingdoms/Chevaliers, dames et seigneurs rencontrés en chemin/Lady Rohanne Webber.jpg', pos: 'center 18%' },
    ],
    description:
      'Trois fois mariée, trois fois veuve — on murmure que Rohanne porte malheur à quiconque l\'épouse. Maîtresse intransigeante de Coin-de-Toile, elle organise un tournoi pour se trouver un quatrième mari, et devient malgré elle au cœur d\'une intrigue digne d\'un roman de chevalerie.',
  },
  {
    id: 'helicent-osgrey',
    name: 'Lady Helicent Osgrey',
    titre: 'Dame de Pennytree',
    maison: 'Maison Osgrey',
    acteur: "L'Épée Lige",
    accent: '#b89868',
    border: '#4a3a26',
    univers: 'aksk',
    photos: [
      { src: '/characters/A Knight of the Seven Kingdoms/Chevaliers, dames et seigneurs rencontrés en chemin/Lady Helicent Osgrey 1.jpg', pos: 'center 18%' },
      { src: '/characters/A Knight of the Seven Kingdoms/Chevaliers, dames et seigneurs rencontrés en chemin/Lady Helicent Osgrey.jpg', pos: 'center 18%' },
    ],
    description:
      'Nièce acerbe de Ser Eustace Osgrey, Helicent ne cache pas son mépris pour le déclin de sa maison ni pour les chevaliers errants qui s\'y attardent. Sa langue acide et son ambition rentrée trahissent une femme qui rêve d\'un destin bien plus grand que Pennytree.',
  },
  {
    id: 'eustace-osgrey',
    name: 'Ser Eustace Osgrey',
    titre: 'Chevalier de Pennytree · Dernier de sa Lignée',
    maison: 'Maison Osgrey',
    acteur: "L'Épée Lige",
    accent: '#b89868',
    border: '#4a3a26',
    univers: 'aksk',
    photos: [
      { src: '/characters/A Knight of the Seven Kingdoms/Chevaliers, dames et seigneurs rencontrés en chemin/Ser Eustace Osgrey 1.jpg', pos: 'center 18%' },
      { src: '/characters/A Knight of the Seven Kingdoms/Chevaliers, dames et seigneurs rencontrés en chemin/Ser Eustace Osgrey.jpg', pos: 'center 18%' },
    ],
    description:
      'Vieux chevalier nostalgique d\'une grandeur passée, Ser Eustace engage Dunk pour défendre les terres rétrécies de sa maison déclinante. Son obsession pour l\'honneur perdu de sa lignée cache un secret de guerre qui pourrait bien le perdre tout à fait.',
  },
  {
    id: 'steffon-fossoway',
    name: 'Ser Steffon Fossoway',
    titre: 'Chevalier de la Pomme Rouge',
    maison: 'Maison Fossoway',
    acteur: "L'Épée Lige",
    accent: '#b89868',
    border: '#4a3a26',
    univers: 'aksk',
    photos: [
      { src: '/characters/A Knight of the Seven Kingdoms/Chevaliers, dames et seigneurs rencontrés en chemin/Ser Steffon Fossoway 3.webp', pos: 'center 18%' },
      { src: '/characters/A Knight of the Seven Kingdoms/Chevaliers, dames et seigneurs rencontrés en chemin/Ser Steffon Fossoway 1.jpg', pos: 'center 18%' },
      { src: '/characters/A Knight of the Seven Kingdoms/Chevaliers, dames et seigneurs rencontrés en chemin/Ser Steffon Fossoway 2.jpg', pos: 'center 18%' },
      { src: '/characters/A Knight of the Seven Kingdoms/Chevaliers, dames et seigneurs rencontrés en chemin/Ser Steffon Fossoway.jpg', pos: 'center 18%' },
    ],
    description:
      'Représentant de la branche rivale "Pomme Rouge" des Fossoway, Steffon incarne l\'arrogance des chevaliers bien nés face aux roturiers et bâtards qui osent porter l\'armure. Sa rivalité avec son cousin Raymun n\'est qu\'un avant-goût des querelles qui gangrènent la chevalerie de Westeros.',
  },
  {
    id: 'raymun-fossoway',
    name: 'Raymun Fossoway',
    titre: 'Écuyer · Cousin de la Pomme Verte',
    maison: 'Maison Fossoway',
    acteur: "L'Épée Lige",
    accent: '#b89868',
    border: '#4a3a26',
    univers: 'aksk',
    photos: [
      { src: '/gif/Raymun Fossoway.webp', pos: 'center center' },
      { src: '/characters/A Knight of the Seven Kingdoms/Chevaliers, dames et seigneurs rencontrés en chemin/raymun fossoway.jpg', pos: 'center 18%' },
      { src: '/characters/A Knight of the Seven Kingdoms/Chevaliers, dames et seigneurs rencontrés en chemin/raymun fossoway 1.jpg', pos: 'center 18%' },
      { src: '/characters/A Knight of the Seven Kingdoms/Chevaliers, dames et seigneurs rencontrés en chemin/raymun fossoway 2.webp', pos: 'center 18%' },
      { src: '/characters/A Knight of the Seven Kingdoms/Chevaliers, dames et seigneurs rencontrés en chemin/raymun fossoway 3.jpg', pos: 'center 18%' },
    ],
    description:
      'Jeune écuyer plein d\'entrain de la branche "Pomme Verte" des Fossoway, Raymun se lie d\'amitié avec Dunk lors de leurs aventures sur les routes du Conflans. Sa loyauté sincère tranche avec les manigances des grands seigneurs qu\'ils croisent en chemin.',
  },
  {
    id: 'gormon-peake',
    name: 'Lord Gormon Peake',
    titre: 'Seigneur d\'Étoile-du-Soir',
    maison: 'Maison Peake',
    acteur: "L'Épée Lige",
    accent: '#b89868',
    border: '#4a3a26',
    univers: 'aksk',
    photos: [
      { src: '/characters/A Knight of the Seven Kingdoms/Chevaliers, dames et seigneurs rencontrés en chemin/Lord Gormon Peake.jpg', pos: 'center 18%' },
      { src: '/characters/A Knight of the Seven Kingdoms/Chevaliers, dames et seigneurs rencontrés en chemin/Lord Gormon Peake 1.jpg', pos: 'center 18%' },
    ],
    description:
      'Ambitieux et orgueilleux, Lord Peake convoite les terres voisines de Pennytree avec une avidité qu\'il dissimule à peine sous des manières courtoises. Sa rivalité avec Ser Eustace Osgrey entraînera Dunk dans une querelle bien plus grande que lui.',
  },
  {
    id: 'lord-ashford',
    name: 'Lord Ashford',
    titre: 'Seigneur d\'Ashford',
    maison: 'Maison Ashford',
    acteur: "L'Œuf de Dunk et l'Œuf",
    accent: '#b89868',
    border: '#4a3a26',
    univers: 'aksk',
    photos: [
      { src: '/characters/A Knight of the Seven Kingdoms/Chevaliers, dames et seigneurs rencontrés en chemin/Lord Ashford.jpg', pos: 'center 18%' },
      { src: '/characters/A Knight of the Seven Kingdoms/Chevaliers, dames et seigneurs rencontrés en chemin/Lord Ashford 1.jpg', pos: 'center 18%' },
    ],
    description:
      'Hôte du grand tournoi d\'Ashford Hall, ce seigneur voit son événement dégénérer en un incident qui mettra le royaume au bord de la guerre civile. Son hospitalité, censée célébrer la chevalerie, libérera plutôt les pires instincts de certains princes du sang du dragon.',
  },
  {
    id: 'gwin-ashford',
    name: 'Gwin Ashford',
    titre: 'Bâtarde de Ashford',
    maison: 'Maison Ashford',
    acteur: "L'Œuf de Dunk et l'Œuf",
    accent: '#b89868',
    border: '#4a3a26',
    univers: 'aksk',
    photos: [
      { src: '/characters/A Knight of the Seven Kingdoms/Chevaliers, dames et seigneurs rencontrés en chemin/Gwin Ashford 2.webp', pos: 'center 18%' },
      { src: '/characters/A Knight of the Seven Kingdoms/Chevaliers, dames et seigneurs rencontrés en chemin/Gwin Ashford.jpg', pos: 'center 18%' },
      { src: '/characters/A Knight of the Seven Kingdoms/Chevaliers, dames et seigneurs rencontrés en chemin/Gwin Ashford 1.webp', pos: 'center 18%' },
    ],
    description:
      'Fille bâtarde du seigneur d\'Ashford, Gwin observe avec un mélange de curiosité et de malice le tournoi qui réunit chevaliers errants et princes Targaryen. Son regard sur les puissants, jamais dupe, éclaire d\'un autre angle l\'aventure de Dunk et Œuf.',
  },
  {
    id: 'tanselle',
    name: 'Tanselle',
    titre: 'Marionnettiste Voyageuse · "Tanselle aux Doigts de Soie"',
    maison: 'Comédienne sans maison',
    acteur: "L'Épée Lige",
    accent: '#b89868',
    border: '#4a3a26',
    univers: 'aksk',
    photos: [
      { src: '/gif/Tanselle.webp', pos: 'center center' },
      { src: '/characters/A Knight of the Seven Kingdoms/Chevaliers, dames et seigneurs rencontrés en chemin/Tanselle.jpg', pos: 'center 18%' },
      { src: '/characters/A Knight of the Seven Kingdoms/Chevaliers, dames et seigneurs rencontrés en chemin/Tanselle 1.jpg', pos: 'center 18%' },
      { src: '/characters/A Knight of the Seven Kingdoms/Chevaliers, dames et seigneurs rencontrés en chemin/Tanselle 2.jpg', pos: 'center 18%' },
      { src: '/characters/A Knight of the Seven Kingdoms/Chevaliers, dames et seigneurs rencontrés en chemin/Tanselle 3.jpg', pos: 'center 18%' },
    ],
    description:
      'Marionnettiste itinérante au talent extraordinaire, Tanselle anime des spectacles qui enchantent petits et grands sur les routes des Sept Couronnes. Son regard tendre et libre sur le monde, loin des trônes et des guerres, offre un répit bienvenu à Dunk sur sa route.',
  },
  {
    id: 'hugh',
    name: 'Hugh le Marteau',
    titre: 'Forgeron · Cavalier de Verax',
    maison: 'Dragonseed · Roturier',
    acteur: 'Kieran Bew',
    accent: '#a8703a',
    border: '#3a2412',
    univers: 'hotd',
    photos: [
      { src: '/gif/Hugh le Marteau.webp', pos: 'center center' },
      { src: '/characters/House of the dragon/Les Dragonseeds/Hugh le Marteau.jpg', pos: 'center 18%' },
      { src: '/characters/House of the dragon/Les Dragonseeds/Hugh le Marteau 1.jpg', pos: 'center 18%' },
      { src: '/characters/House of the dragon/Les Dragonseeds/Hugh le Marteau 2.jpg', pos: 'center 18%' },
    ],
    description:
      'Simple forgeron de Port-Réal portant en secret le sang du dragon, Hugh saisit l\'opportunité offerte par Rhaenyra de revendiquer un dragon sans cavalier. Son ascension fulgurante, de l\'enclume au ciel, incarne la promesse — et le danger — que représentent les Dragonseeds pour l\'ordre établi.',
  },
  {
    id: 'nettles',
    name: 'Nettles',
    titre: 'Cavalière de Sheepstealer',
    maison: 'Dragonseed · Roturière',
    acteur: 'Anara Khalid',
    accent: '#a8703a',
    border: '#3a2412',
    univers: 'hotd',
    photos: [
      { src: '/characters/House of the dragon/Les Dragonseeds/Nettles.jpg', pos: 'center 20%' },
      { src: '/characters/House of the dragon/Les Dragonseeds/Nettles 1.jpg', pos: 'center 20%' },
      { src: '/characters/House of the dragon/Les Dragonseeds/Nettles 2.jpg', pos: 'center 20%' },
    ],
    description:
      'Jeune fille des rues sans lien apparent avec la lignée des dragons, Nettles parvient pourtant à apprivoiser le sauvage Sheepstealer à coups de patience et de moutons volés. Son lien avec Daemon Targaryen, aussi tendre qu\'ambigu, demeure l\'un des mystères les plus discutés de la Danse.',
  },
  {
    id: 'ulf',
    name: 'Ulf le Blanc',
    titre: 'Cavalier de Silvermoineau',
    maison: 'Dragonseed · Roturier',
    acteur: 'Tom Bennett',
    accent: '#a8703a',
    border: '#3a2412',
    univers: 'hotd',
    photos: [
      { src: '/characters/House of the dragon/Les Dragonseeds/Ulf le Blanc.jpg', pos: 'center 18%' },
      { src: '/characters/House of the dragon/Les Dragonseeds/Ulf le Blanc 1.jpg', pos: '78% 75%' },
      { src: '/characters/House of the dragon/Les Dragonseeds/Ulf le Blanc 2.jpg', pos: 'center 18%' },
    ],
    description:
      'Ivrogne et vantard, Ulf clame depuis toujours porter le sang Targaryen — une rumeur qui se révèle vraie le jour où il monte sur le dos de Silvermoineau. Son ascension soudaine de mendiant à seigneur dragon ira de pair avec une cupidité qui finira par causer sa perte.',
  },
  {
    id: 'lyonel-baratheon-aksk',
    name: 'Lyonel Baratheon',
    titre: 'Seigneur de l\'Orage · "Le Lion Fier"',
    maison: 'Maison Baratheon',
    acteur: "L'Œuf de Dunk et l'Œuf",
    accent: '#c9a84c',
    border: '#5a5020',
    univers: 'aksk',
    photos: [
      { src: '/gif/Lyonel baratheon.webp', pos: 'center center' },
      { src: "/characters/A Knight of the Seven Kingdoms/Chevaliers, dames et seigneurs rencontrés en chemin/Lyonel baratheon's.png", pos: 'center 18%' },
      { src: "/characters/A Knight of the Seven Kingdoms/Chevaliers, dames et seigneurs rencontrés en chemin/Lyonel baratheon's 1.webp", pos: 'center 18%' },
      { src: "/characters/A Knight of the Seven Kingdoms/Chevaliers, dames et seigneurs rencontrés en chemin/Lyonel baratheon's 2.jpg", pos: 'center 18%' },
      { src: "/characters/A Knight of the Seven Kingdoms/Chevaliers, dames et seigneurs rencontrés en chemin/Lyonel baratheon's 3.jpg", pos: 'center 18%' },
    ],
    description:
      'Surnommé le "Lion Fier" pour son tempérament aussi fougueux que son blason est fier, ce seigneur de l\'Orage incarne l\'orgueil et la bravoure des Baratheon d\'antan. Sa réputation de bretteur redoutable précède chacun de ses pas dans les tournois du royaume.',
  },
]

// ─── Carte d'un personnage ────────────────────────────────────────────────────
const CartePersonnage = ({ perso, index }) => {
  const cardRef  = useRef(null)
  const [hovered, setHovered]   = useState(false)
  const [imgError, setImgError] = useState(false)
  const [current, setCurrent]   = useState(0)

  const photos = perso.photos && perso.photos.length ? perso.photos : []
  const activePhoto = photos[current] || {}

  const prevPhoto = (e) => {
    e.stopPropagation()
    setCurrent(i => (i - 1 + photos.length) % photos.length)
  }
  const nextPhoto = (e) => {
    e.stopPropagation()
    setCurrent(i => (i + 1) % photos.length)
  }

  // Entrée décalée via IntersectionObserver
  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add('visible'), index * 80)
          obs.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [index])

  return (
    <div className="char-card-wrap" style={{ '--accent': perso.accent, '--border': perso.border }}>
    <div
      ref={cardRef}
      className="char-card"
      style={{ '--accent': perso.accent, '--border': perso.border }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Coins */}
      <span className="char-corner char-corner-tl" />
      <span className="char-corner char-corner-tr" />
      <span className="char-corner char-corner-bl" />
      <span className="char-corner char-corner-br" />

      {/* Photo */}
      {!imgError && activePhoto.src ? (
        <img
          key={activePhoto.src}
          className="char-photo"
          src={activePhoto.src}
          alt={perso.name}
          style={{ objectPosition: activePhoto.pos || 'center 20%' }}
          onError={() => setImgError(true)}
          loading={index < 8 ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={index < 4 ? 'high' : 'auto'}
        />
      ) : (
        <div className="char-photo" style={{
          background: 'linear-gradient(135deg, #1a1200, #0a0705)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 64, color: perso.accent, opacity: 0.3 }}>⚔</span>
        </div>
      )}

      {/* Gradient overlay */}
      <div className="char-overlay" />

      {/* Infos statiques */}
      <div className={`char-static ${hovered ? 'char-static-hidden' : ''}`}
           style={{ opacity: hovered ? 0 : 1, transform: hovered ? 'translateY(14px)' : 'translateY(0)',
                    pointerEvents: hovered ? 'none' : 'auto',
                    transition: 'opacity 0.35s ease, transform 0.35s ease' }}>
        <span className="char-house-tag">{perso.maison}</span>
        <div className="char-static-divider">
          <span className="char-divider-line" />
          <span className="char-divider-diamond" />
        </div>
        <h3 className="char-name">{perso.name}</h3>
        <p className="char-titre">{perso.titre}</p>
      </div>

      {/* Contenu au survol */}
      <div className="char-hover"
           style={{ opacity: hovered ? 1 : 0, transform: hovered ? 'translateY(0)' : 'translateY(18px)',
                    pointerEvents: hovered ? 'auto' : 'none' }}>
        <h3 className="char-hover-name">{perso.name}</h3>
        <p className="char-hover-acteur">Interprété par {perso.acteur}</p>
        <div className="char-hover-divider">
          <span className="char-divider-line" />
          <span className="char-divider-diamond" />
          <span className="char-divider-line" />
        </div>
        <p className="char-hover-maison">{perso.maison}</p>
        <p className="char-hover-desc">{perso.description}</p>
      </div>

      {/* Barre accent */}
      <div className="char-accent-bar" />
    </div>

      {/* Galerie : navigation entre les images du personnage (placée sous la carte
          pour rester accessible même au survol, quand le texte descriptif recouvre la photo) */}
      {photos.length > 1 && (
        <div className="char-gallery-nav">
          <button className="char-gallery-btn" onClick={prevPhoto} aria-label="Image précédente">‹</button>
          <div className="char-gallery-dots">
            {photos.map((_, i) => (
              <button
                key={i}
                className={`char-gallery-dot ${i === current ? 'char-gallery-dot-active' : ''}`}
                style={{ background: i === current ? perso.accent : undefined }}
                onClick={(e) => { e.stopPropagation(); setCurrent(i) }}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>
          <button className="char-gallery-btn" onClick={nextPhoto} aria-label="Image suivante">›</button>
        </div>
      )}
    </div>
  )
}

// ─── Section principale ───────────────────────────────────────────────────────
const Characters = () => {
  const sectionRef  = useRef(null)
  const eyebrowRef  = useRef(null)
  const titleRef    = useRef(null)
  const [activeUnivers, setActiveUnivers] = useState('tous')
  const [activeMaison, setActiveMaison]   = useState('toutes')
  const [subOuvert, setSubOuvert]         = useState(false)
  const [searchQuery, setSearchQuery]     = useState('')

  const query = normalize(searchQuery)

  const matchesSearch = (p) => {
    if (!query) return true
    return normalize(`${p.name} ${p.titre} ${p.maison} ${p.acteur} ${p.description}`).includes(query)
  }

  // Sous-catégories : on regroupe les dizaines de "maisons" très spécifiques en quelques
  // familles larges (ex. Garde de Nuit + Au-delà du Mur + Peuple Libre = un seul groupe)
  // pour éviter une liste de filtres trop longue et redondante.
  const groupeDe = (p) => GROUPES_MAISON.find(g => g.test(p))

  const groupesDisponibles = activeUnivers === 'tous'
    ? []
    : GROUPES_MAISON.filter(g =>
        PERSONNAGES.some(p => p.univers === activeUnivers && groupeDe(p).id === g.id)
      )

  const choisirUnivers = (id) => {
    setActiveUnivers(id)
    setActiveMaison('toutes')
    setSubOuvert(false)
  }

  const filteredPersonnages = PERSONNAGES.filter(p =>
    (activeUnivers === 'tous' || p.univers === activeUnivers) &&
    (activeMaison === 'toutes' || groupeDe(p).id === activeMaison) &&
    matchesSearch(p)
  )

  useEffect(() => {
    const els = [eyebrowRef.current, titleRef.current].filter(Boolean)
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
    if (titleRef.current) obs.observe(titleRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="characters-section">

      {/* Fond */}
      <div className="characters-bg-texture" />
      <div className="characters-bg-vignette" />

      {/* En-tête */}
      <header className="characters-header">
        <p ref={eyebrowRef} className="characters-eyebrow">LES VISAGES DU TRÔNE DE FER</p>
        <div className="characters-ornament">
          <span className="characters-ornament-line" />
          <span className="characters-ornament-rune">✦</span>
          <span className="characters-ornament-line" />
        </div>
        <h1 ref={titleRef} className="characters-title">
          Les Grands<br />
          <em>Personnages</em>
        </h1>
        <p className="characters-subtitle">
          De Port-Réal aux confins du Mur, en passant par Peyredragon et les légendes immémoriales — {PERSONNAGES.length} destins, {PERSONNAGES.length} visages, un seul trône à conquérir.
        </p>
      </header>

      {/* Filtres par univers */}
      <div className="characters-filters">
        {UNIVERS.map(u => {
          const count = u.id === 'tous' ? PERSONNAGES.length : PERSONNAGES.filter(p => p.univers === u.id).length
          return (
            <button
              key={u.id}
              className={`characters-filter-btn ${activeUnivers === u.id ? 'characters-filter-active' : ''}`}
              onClick={() => choisirUnivers(u.id)}
            >
              {u.label}
              <span className="characters-filter-count">{count}</span>
            </button>
          )
        })}
      </div>

      {/* Sous-filtres : familles / factions de l'univers sélectionné (repliables) */}
      {groupesDisponibles.length > 1 && (
        <div className="characters-subfilters-wrap">
          <button
            type="button"
            className="characters-subfilters-toggle"
            onClick={() => setSubOuvert(o => !o)}
            aria-expanded={subOuvert}
          >
            <span className="characters-subfilters-toggle-label">
              Affiner par maison
              {activeMaison !== 'toutes' && (
                <em> — {GROUPES_MAISON.find(g => g.id === activeMaison)?.label}</em>
              )}
            </span>
            <span className={`characters-subfilters-chevron ${subOuvert ? 'characters-subfilters-chevron-open' : ''}`} aria-hidden="true">⌄</span>
          </button>

          {subOuvert && (
            <div className="characters-subfilters">
              <button
                className={`characters-subfilter-btn ${activeMaison === 'toutes' ? 'characters-subfilter-active' : ''}`}
                onClick={() => setActiveMaison('toutes')}
              >
                Toutes les maisons
              </button>
              {groupesDisponibles.map(g => (
                <button
                  key={g.id}
                  className={`characters-subfilter-btn ${activeMaison === g.id ? 'characters-subfilter-active' : ''}`}
                  onClick={() => setActiveMaison(g.id)}
                >
                  {g.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Barre de recherche */}
      <div className="characters-search">
        <span className="characters-search-icon" aria-hidden="true">⌕</span>
        <input
          type="text"
          className="characters-search-input"
          placeholder="Rechercher un personnage, une maison, un acteur..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            className="characters-search-clear"
            onClick={() => setSearchQuery('')}
            aria-label="Effacer la recherche"
          >
            ✕
          </button>
        )}
      </div>

      {filteredPersonnages.length === 0 && (
        <p className="characters-empty">Aucun personnage ne correspond à votre recherche.</p>
      )}

      {/* Grille */}
      <div className="char-grid">
        {filteredPersonnages.map((p, i) => (
          <CartePersonnage key={p.id} perso={p} index={i} />
        ))}
      </div>

      {/* Pied de section */}
      <div className="characters-footer">
        <span className="characters-footer-line" />
        <span className="characters-footer-sigil">♔</span>
        <span className="characters-footer-line" />
      </div>

    </section>
  )
}

export default Characters
