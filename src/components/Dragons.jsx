import React, { useEffect, useRef, useState } from 'react'
import './Dragons.css'

// ─── Onglets par époque (même principe que CONTINENTS pour les Maisons) ──────
const ERAS = [
  { id: 'tous',      label: 'Tous' },
  { id: 'daenerys',  label: 'Les Trois de Daenerys' },
  { id: 'conquete',  label: "L'Ère de la Conquête" },
  { id: 'danse',     label: 'La Danse des Dragons' },
  { id: 'sauvages',  label: 'Dragons Sauvages' },
]

// Normalisation pour une recherche insensible aux accents/majuscules
const normalize = (str) =>
  (str || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// ─── Données des dragons ─────────────────────────────────────────────────────
// photoPos : position CSS object-position (défaut 'center 30%')
const DRAGONS = [
  // ════════════════════════════════════════════════════════════════════════
  // TOUS LES DRAGONS — triés par popularité (du plus emblématique au plus confidentiel)
  // ════════════════════════════════════════════════════════════════════════
  {
    id: 'drogon',
    era: 'daenerys',
    name: 'Drogon',
    title: 'Le Dernier Géant Noir des Cieux',
    rider: 'Daenerys Targaryen',
    status: 'En vie · parti vers l\'Est',
    accent: '#c0392b',
    border: '#7a1a1a',
    photos: [
      { src: '/gif dragon/drogon.webp', pos: '75% center' },
      { src: '/gif dragon/Drogon 2.webp', pos: '20% center' },
      { src: '/Dragons/3 dragon Daenerys/Drogon/drogon 1.jpg', pos: 'center 30%' },
      { src: '/Dragons/3 dragon Daenerys/Drogon/drogon 2.jpg', pos: 'center 30%' },
      { src: '/Dragons/3 dragon Daenerys/Drogon/drogon 3.jpg', pos: 'center 30%' },
    ],
    description:
      'Le plus grand et le plus féroce des trois enfants de Daenerys. Écailles noires comme la nuit, gorge et ailes striées d\'écarlate — Drogon est la fureur des Targaryen incarnée. Seul lui a survécu à la chute de sa mère, et seul lui sait où il l\'a emportée.',
  },
  {
    id: 'viserion',
    era: 'daenerys',
    name: 'Viserion',
    title: 'Le Dragon de Crème et d\'Or — devenu Spectre de Glace',
    rider: 'Daenerys Targaryen',
    status: 'Mort · réanimé par le Roi de la Nuit, détruit à Winterfell',
    accent: '#d4af6a',
    border: '#6a5a30',
    photos: [
      { src: '/gif dragon/Viserion 2.webp', pos: 'center center' },
      { src: '/gif dragon/Viserion.webp', pos: 'center center' },
      { src: '/Dragons/3 dragon Daenerys/Viserion/viserion1.jpg', pos: 'center 28%' },
      { src: '/Dragons/3 dragon Daenerys/Viserion/viserion2.jpg', pos: 'center 28%' },
      { src: '/Dragons/3 dragon Daenerys/Viserion/viserion3.jpg', pos: 'center 28%' },
    ],
    description:
      'Le plus pâle des trois, crème et or comme le soleil couchant. Abattu au-delà du Mur par la lance de glace du Roi de la Nuit, il renaît en créature spectrale aux yeux bleus glacés — son souffle de feu devenu souffle de mort, retournant ses propres flammes contre le monde des vivants.',
  },
  {
    id: 'rhaegal',
    era: 'daenerys',
    name: 'Rhaegal',
    title: 'Le Dragon Vert et Bronze',
    rider: 'Daenerys Targaryen',
    status: 'Mort · abattu par les arbalètes d\'Euron Greyjoy',
    accent: '#4a7c3f',
    border: '#2a4a20',
    photos: [
      { src: '/gif dragon/Rhaegal.webp', pos: '100% 35%' },
      { src: '/Dragons/3 dragon Daenerys/Rhaegal/rhaegal.jpg', pos: 'center 28%' },
      { src: '/Dragons/3 dragon Daenerys/Rhaegal/rhaegal1.jpg', pos: 'center 28%' },
      { src: '/Dragons/3 dragon Daenerys/Rhaegal/rhaegal2.jpg', pos: 'center 28%' },
    ],
    description:
      'Nommé en hommage au frère disparu de Daenerys, Rhaegal porte des écailles vertes striées de bronze. Affaibli par une blessure jamais vraiment refermée, il tombe en plein vol sous les carreaux d\'acier d\'Euron Greyjoy — une perte qui annonce le tournant tragique de la guerre pour Port-Réal.',
  },
  {
    id: 'balerion',
    era: 'conquete',
    name: 'Balerion',
    title: 'La Terreur Noire',
    rider: 'Aegon le Conquérant · puis Maegor et Aerion',
    status: 'Mort · de vieillesse, sous le règne de Jaehaerys Ier',
    accent: '#8b1a1a',
    border: '#3a0a0a',
    photos: [
      { src: '/Dragons/Conquête Aegon/Balerion/Balerion 1.jpg', pos: 'center 30%' },
      { src: '/Dragons/Conquête Aegon/Balerion/Balerion 2.jpg', pos: 'center 30%' },
      { src: '/Dragons/Conquête Aegon/Balerion/Balerion 4.jpg', pos: 'center 30%' },
    ],
    description:
      'Le plus grand dragon ayant jamais existé — si vaste que ses ombres pouvaient recouvrir des villages entiers. Écailles noires comme l\'onyx, lueur intérieure rouge sang. Né à Valyria avant la Malédiction, il porta Aegon le Conquérant à la tête des Sept Couronnes et survécut à trois rois.',
  },
  {
    id: 'vhagar',
    era: 'conquete',
    name: 'Vhagar',
    title: 'L\'Ancienne des Cieux',
    rider: 'Visenya Targaryen · puis Laena Velaryon · puis Aemond Targaryen',
    status: 'Morte · au combat contre Caraxes au-dessus de la Gorge',
    accent: '#5a6b3a',
    border: '#2a3318',
    photos: [
      { src: '/gif dragon/Vhagar.webp', pos: 'center center' },
      { src: '/Dragons/Conquête Aegon/Vhagar/Vhagar 1.jpg', pos: 'left center' },
      { src: '/Dragons/Conquête Aegon/Vhagar/Vhagar 2.webp', pos: 'center top' },
      { src: '/Dragons/Conquête Aegon/Vhagar/Vhagar 3.jpg', pos: 'left center' },
      { src: '/Dragons/Conquête Aegon/Vhagar/Vhagar 4.webp', pos: 'center top' },
    ],
    description:
      'Deuxième plus grand dragon de l\'histoire après Balerion, et le plus vieux survivant de la Conquête. Vert sombre nuancé de bronze. Montée par Visenya pendant la guerre de conquête, elle finira sa vie comme la monture la plus redoutée de la Danse des Dragons, sous l\'œil borgne du prince Aemond.',
  },
  {
    id: 'caraxes',
    era: 'danse',
    name: 'Caraxes',
    title: 'Le Ver Sanglant',
    rider: 'Daemon Targaryen',
    status: 'Mort · au combat contre Vhagar au-dessus de la Gorge',
    accent: '#a31f1f',
    border: '#4a0d0d',
    photos: [
      { src: '/gif dragon/Caraxes.webp', pos: '62% center' },
      { src: '/Dragons/Danse des dragons/Caraxes/Caraxes1.webp', pos: 'center 30%' },
      { src: '/Dragons/Danse des dragons/Caraxes/Caraxes2.webp', pos: 'center 30%' },
      { src: '/Dragons/Danse des dragons/Caraxes/Caraxes3.webp', pos: 'center 30%' },
    ],
    description:
      'Long, sinueux, presque serpentin — écailles rouge sang et os d\'un noir de jais. La monture du redoutable prince Daemon Targaryen, aussi imprévisible et dangereuse que son cavalier. Il périt enlacé à Vhagar dans une chute commune restée gravée dans les mémoires comme l\'un des duels les plus terribles de la Danse.',
  },
  {
    id: 'syrax',
    era: 'danse',
    name: 'Syrax',
    title: 'La Dorée de la Reine',
    rider: 'Rhaenyra Targaryen',
    status: 'Morte · tuée lors de la chute de Port-Réal',
    accent: '#d4af37',
    border: '#6a5318',
    photos: [
      { src: '/gif dragon/Syrax.webp', pos: 'center center' },
      { src: '/Dragons/Danse des dragons/syrax/Syrax1.jpeg', pos: 'center 30%' },
      { src: '/Dragons/Danse des dragons/syrax/Syrax2.webp', pos: 'center 30%' },
      { src: '/Dragons/Danse des dragons/syrax/Syrax3.webp', pos: 'center 30%' },
    ],
    description:
      'Jaune et dorée, à l\'image du tempérament fier de sa cavalière. Syrax porte Rhaenyra, l\'Héritière de Fer, à travers les intrigues de la succession et la guerre civile qui déchire la dynastie. Elle s\'effondre dans les flammes de Port-Réal, scellant le destin tragique de sa reine.',
  },
  {
    id: 'meleys',
    era: 'danse',
    name: 'Meleys',
    title: 'La Reine Rouge',
    rider: 'Rhaenys Targaryen "la Reine qui ne Fut Jamais"',
    status: 'Morte · au combat contre Vhagar et Sunfyre au-dessus de la Gorge',
    accent: '#c0392b',
    border: '#6a1818',
    photos: [
      { src: '/gif dragon/Meleys.webp', pos: 'center center' },
      { src: '/Dragons/Danse des dragons/meleys/Meleys.webp', pos: 'center 28%' },
      { src: '/Dragons/Danse des dragons/meleys/Meleys2.jpg', pos: 'center 28%' },
      { src: '/Dragons/Danse des dragons/meleys/Meleys3.webp', pos: 'right center' },
      { src: '/Dragons/Danse des dragons/meleys/Meleys4.webp', pos: 'center 28%' },
    ],
    description:
      'Écarlate vif, l\'une des dragonnes les plus rapides jamais montées. Fidèle compagne de Rhaenys depuis des décennies, elle se jette seule contre deux dragons ennemis lors de la bataille de la Gorge — un sacrifice héroïque qui lui coûte la vie, mais qui marque les esprits à jamais.',
  },
  {
    id: 'sunfyre',
    era: 'danse',
    name: 'Sunfyre',
    title: 'Le Doré',
    rider: 'Aegon II Targaryen',
    status: 'Mort · des suites de ses blessures, après la guerre',
    accent: '#e8b923',
    border: '#7a5e10',
    photos: [
      { src: '/gif dragon/Sunfyre.webp', pos: 'center center' },
      { src: '/Dragons/Danse des dragons/sunfyre/Sunfyre1.webp', pos: 'center 28%' },
      { src: '/Dragons/Danse des dragons/sunfyre/Sunfyre2.webp', pos: 'center 28%' },
      { src: '/Dragons/Danse des dragons/sunfyre/Sunfyre3.jpg', pos: 'right center' },
    ],
    description:
      'Considéré comme le plus beau dragon ayant jamais existé — écailles d\'or et de cuivre miroitant comme un coucher de soleil. Monture du roi Aegon II, il est gravement mutilé lors de la bataille de la Gorge et ne revolera plus jamais, devenant le reflet brisé d\'un règne qui s\'effondre.',
  },
  {
    id: 'vermithor',
    era: 'danse',
    name: 'Vermithor',
    title: 'La Furie de Bronze',
    rider: 'Jaehaerys Ier · puis Hugh le Marteau',
    status: 'Survivant · retourné à l\'état sauvage après la guerre',
    accent: '#b8732e',
    border: '#5e3914',
    photos: [
      { src: '/gif dragon/Vermithor.webp', pos: 'center center' },
      { src: '/Dragons/Danse des dragons/vermithor/Vermithor.webp', pos: 'center 30%' },
      { src: '/Dragons/Danse des dragons/vermithor/Vermithor 2.webp', pos: 'center 30%' },
      { src: '/Dragons/Danse des dragons/vermithor/Vermithor 3.jpg', pos: 'center 30%' },
      { src: '/Dragons/Danse des dragons/vermithor/Vermithor 4.jpg', pos: 'center 30%' },
    ],
    description:
      'Deuxième plus grand dragon vivant pendant la Danse, bronze et fumée, autrefois monture du roi Jaehaerys le Conciliateur. Resté sans cavalier durant des décennies, il accepte enfin de porter Hugh le Marteau, un forgeron de basse extraction devenu, le temps d\'une bataille, l\'égal des seigneurs dragons.',
  },
  {
    id: 'meraxes',
    era: 'conquete',
    name: 'Meraxes',
    title: 'L\'Argentée aux Ailes de Bronze',
    rider: 'Rhaenys Targaryen "la Reine qui Chevauchait les Dragons"',
    status: 'Morte · abattue par un carreau de scorpion lors du siège de Falaise',
    accent: '#9ca3af',
    border: '#454c56',
    photos: [
      { src: '/gif dragon/Meraxes.webp', pos: 'center center' },
      { src: '/Dragons/Conquête Aegon/Meraxes/Meraxes.webp', pos: 'center 28%' },
      { src: '/Dragons/Conquête Aegon/Meraxes/Meraxes 1.jpg', pos: 'center 28%' },
      { src: '/Dragons/Conquête Aegon/Meraxes/Meraxes2.jpg', pos: 'center 28%' },
    ],
    description:
      'Argentée et bronze, troisième dragon de la Conquête. Montée par Rhaenys, sœur-épouse d\'Aegon, fascinée par les contrées qu\'elle survolait. Elle trouve la mort au-dessus de Dorne, abattue par un carreau de scorpion en plein vol — entraînant Rhaenys avec elle dans sa chute.',
  },
  {
    id: 'arrax',
    era: 'danse',
    name: 'Arrax',
    title: 'Le Pâle et Doré',
    rider: 'Lucerys Velaryon',
    status: 'Mort · abattu par Vhagar et Aemond au-dessus de la Gorge',
    accent: '#cdb87a',
    border: '#665c3a',
    photos: [
      { src: '/gif dragon/Arrax 1.webp', pos: 'center center' },
      { src: '/gif dragon/Arrax.webp', pos: 'center center' },
      { src: '/Dragons/Danse des dragons/arrax/arax.jpg', pos: 'center 30%' },
      { src: '/Dragons/Danse des dragons/arrax/arax1.webp', pos: 'right center' },
      { src: '/Dragons/Danse des dragons/arrax/arax2.webp', pos: 'left center' },
    ],
    description:
      'Petit et rapide, crème et or pâle, monture du jeune Lucerys "Luke" Velaryon. Sa mort au-dessus de la Gorge — déchiqueté avec son cavalier par les mâchoires de Vhagar sous les yeux du prince Aemond — est l\'étincelle qui embrase la guerre civile : "le sang pour le sang".',
  },
  {
    id: 'vermax',
    era: 'danse',
    name: 'Vermax',
    title: 'Le Jeune Vert et Bronze',
    rider: 'Jacaerys Velaryon',
    status: 'Mort · abattu lors d\'une campagne dans le Nord',
    accent: '#4a6b3a',
    border: '#243318',
    photos: [
      { src: '/gif dragon/Vermax.webp', pos: 'center center' },
      { src: '/gif dragon/Vermax 1.webp', pos: 'center center' },
      { src: '/Dragons/Danse des dragons/vermax/vermax.jpg', pos: 'center 30%' },
      { src: '/Dragons/Danse des dragons/vermax/Vermax 2.webp', pos: 'center 30%' },
      { src: '/Dragons/Danse des dragons/vermax/vermax 3.jpg', pos: 'center 30%' },
      { src: '/Dragons/Danse des dragons/vermax/Vermax4.webp', pos: 'center 30%' },
    ],
    description:
      'Vert sombre tacheté de bronze, monture de Jacaerys "Jace" Velaryon, l\'un des fils de Rhaenyra envoyés rallier les grandes maisons du Nord et des Îles de Fer à la cause de leur mère. Il trouve la mort au combat, laissant la reine pleurer un héritier de plus dans cette guerre qui dévore ses propres enfants.',
  },
  {
    id: 'dreamfyre',
    era: 'danse',
    name: 'Dreamfyre',
    title: 'La Tisseuse de Rêves',
    rider: 'Rhaena Targaryen · puis Helaena Targaryen',
    status: 'Morte · tuée par la foule lors des émeutes de Port-Réal',
    accent: '#8fafc4',
    border: '#3a5070',
    photos: [
      { src: '/gif dragon/Dreamfyre.webp', pos: 'center center' },
      { src: '/gif dragon/Dreamfyre 1.webp', pos: '20% center' },
      { src: '/Dragons/Danse des dragons/dreamfyre/TPATQ_Dreamfyre.webp', pos: 'center 28%' },
      { src: '/Dragons/Danse des dragons/dreamfyre/S2_Dreamfyre2.webp', pos: 'center 28%' },
      { src: '/Dragons/Danse des dragons/dreamfyre/dreamfyre.webp', pos: 'center 28%' },
      { src: '/Dragons/Danse des dragons/dreamfyre/dreamfyre 2.jpg', pos: 'center 28%' },
    ],
    description:
      'Bleu pâle et argent, l\'une des plus anciennes dragonnes encore vivantes au début de la Danse. Liée pendant des années à la douce et fragile reine Helaena, elle subit un sort funeste et cruel lorsque la populace de Port-Réal, déchaînée par la guerre, se retourne contre elle dans le Donjon Rouge.',
  },
  {
    id: 'silverwing',
    era: 'danse',
    name: 'Silverwing',
    title: 'L\'Argentée des Cieux',
    rider: 'Alysanne Targaryen · puis Ulf le Pâle',
    status: 'Survivante · retournée à l\'état sauvage après la guerre',
    accent: '#c8d0d8',
    border: '#5e6670',
    photos: [
      { src: '/gif dragon/Silverwing.webp', pos: 'center center' },
      { src: '/Dragons/Danse des dragons/silverwing/silverwing.webp', pos: 'right center' },
      { src: '/Dragons/Danse des dragons/silverwing/silverwing 2.webp', pos: 'center top' },
      { src: '/Dragons/Danse des dragons/silverwing/silverwing 3.jpg', pos: 'center top' },
      { src: '/Dragons/Danse des dragons/silverwing/silverwing 4.webp', pos: 'center top' },
    ],
    description:
      'Pâle et argentée, douce d\'apparence mais redoutable au combat. Ancienne monture de la bonne reine Alysanne, elle reste de longues années sans cavalier avant d\'accepter Ulf le Pâle — un choix qui se révélera catastrophique tant l\'homme se montrera indigne d\'un tel honneur.',
  },
  {
    id: 'moondancer',
    era: 'danse',
    name: 'Moondancer',
    title: 'La Petite Danseuse de Lune',
    rider: 'Baela Targaryen',
    status: 'Survivante · gravement blessée lors de la bataille de Tumbleton',
    accent: '#8fbf8a',
    border: '#3f5e3a',
    photos: [
      { src: '/gif dragon/Moondancer.webp', pos: 'center center' },
      { src: '/Dragons/Danse des dragons/moondancer/Moondancer-TBM.webp', pos: 'center 28%' },
      { src: '/Dragons/Danse des dragons/moondancer/OT2_Baela_%26_Moondancer_3.webp', pos: 'center 28%' },
      { src: '/Dragons/Danse des dragons/moondancer/GQzeel8b0AAY73H_22.webp', pos: 'center 28%' },
      { src: '/Dragons/Danse des dragons/moondancer/shout-out-to-the-little-green-machine-moondancer-v0-s4e6c9tkcv9d1.webp', pos: 'center 28%' },
    ],
    description:
      'Petite, vive et verte pâle, la plus menue des dragonnes de guerre — montée par Baela Targaryen, fille de Daemon, à peine plus âgée qu\'une enfant elle-même. Sa taille modeste cache une bravoure immense : elle s\'illustre dans la bataille nocturne de Tumbleton, où elle manque de peu de perdre la vie.',
  },
  {
    id: 'tyraxes',
    era: 'danse',
    name: 'Tyraxes',
    title: 'Le Rouge et Vert',
    rider: 'Joffrey Velaryon',
    status: 'Survivant · dernier des jeunes dragons Velaryon',
    accent: '#6a8c4a',
    border: '#34431f',
    photos: [
      { src: '/gif dragon/Tyraxes.webp', pos: '35% center' },
      { src: '/Dragons/Danse des dragons/tyraxes/350px-Tyraxes_by_Rudolf_Hima.webp', pos: 'center top' },
      { src: '/Dragons/Danse des dragons/tyraxes/Tyraxes_Wotc.webp', pos: 'left top' },
      { src: '/Dragons/Danse des dragons/tyraxes/tyraxes.webp', pos: 'right top' },
    ],
    description:
      'Rouge tacheté de vert, le plus jeune des trois dragons élevés par les fils de Rhaenyra. Encore trop jeune pour vraiment combattre lorsque la Danse éclate, Tyraxes est de tous les jeunes dragons Velaryon celui qui survit le plus longtemps à la tourmente — un mince espoir dans un ciel déchiré par le feu.',
  },
  {
    id: 'cannibal',
    era: 'sauvages',
    name: 'Cannibal',
    title: 'Le Dévoreur de Peyredragon',
    rider: 'Jamais chevauché',
    status: 'Vivant · règne seul sur la Montagne du Dragon',
    accent: '#4a4a4a',
    border: '#1f1f1f',
    photos: [
      { src: '/Dragons/dragon sauvage/cannibal/1200px-Cannibal.webp', pos: 'center 30%' },
      { src: '/Dragons/dragon sauvage/cannibal/cannibal.jpg', pos: 'center 30%' },
      { src: '/Dragons/dragon sauvage/cannibal/cannibal1.jpg', pos: 'center 30%' },
      { src: '/Dragons/dragon sauvage/cannibal/cannibal2.jpg', pos: 'center 30%' },
    ],
    description:
      'Noir comme la suie, plus vieux que Balerion lui-même selon certains mestres. Il vit en sauvage sur la Montagne du Dragon, dévorant tout dragonnet qui ose éclore sans protection — y compris ses propres congénères. Aucun homme n\'a jamais posé la main sur lui, et aucun n\'a survécu pour s\'en vanter.',
  },
  {
    id: 'sheepstealer',
    era: 'sauvages',
    name: 'Sheepstealer',
    title: 'Le Voleur de Moutons',
    rider: 'Jamais chevauché · puis Nettles',
    status: 'Disparu · envolé avec sa cavalière après la Danse, destin inconnu',
    accent: '#8a9a4a',
    border: '#454e22',
    photos: [
      { src: '/gif dragon/Sheepstealer.webp', pos: 'center center' },
      { src: '/Dragons/dragon sauvage/sheepstealer/2x8_Sheepstealer.webp', pos: 'center 30%' },
      { src: '/Dragons/dragon sauvage/sheepstealer/sheepstealer 3.jpg', pos: 'center 30%' },
    ],
    description:
      'Laid, trapu, aux écailles jaune-vert sale — un dragon sauvage qui survit en pillant les troupeaux des Doigts depuis des décennies. Il accepte, contre toute attente, de se laisser approcher par Nettles, une jeune fille des bas-fonds qui le nourrit de moutons volés jusqu\'à gagner sa confiance... et son dos.',
  },
  {
    id: 'grey-ghost',
    era: 'sauvages',
    name: 'Grey Ghost',
    title: 'Le Fantôme Gris',
    rider: 'Jamais chevauché',
    status: 'Vivant (présumé) · aperçu seulement dans la brume et au crépuscule',
    accent: '#9aa0a8',
    border: '#454a52',
    photos: [
      { src: '/Dragons/dragon sauvage/grey ghost/grey ghost.jpg', pos: 'center 30%' },
      { src: '/Dragons/dragon sauvage/grey ghost/grey ghost 2.jpg', pos: 'center 30%' },
      { src: '/Dragons/dragon sauvage/grey ghost/grey ghost 3.jpg', pos: 'center 30%' },
    ],
    description:
      'Gris pâle, presque translucide dans le brouillard — le plus discret et le plus mystérieux des dragons sauvages de Peyredragon. On ne l\'aperçoit qu\'à l\'aube ou au crépuscule, glissant entre les nappes de brume comme un spectre. Beaucoup doutent même de son existence... jusqu\'à ce qu\'ils le voient.',
  },
]

// ─── Carte d'un dragon (même structure que CartePersonnage) ──────────────────
const CarteDragon = ({ dragon, index }) => {
  const cardRef  = useRef(null)
  const [hovered, setHovered]   = useState(false)
  const [imgError, setImgError] = useState(false)
  const [current, setCurrent]   = useState(0)

  const photos = dragon.photos && dragon.photos.length ? dragon.photos : []
  const activePhoto = photos[current] || {}

  const prevPhoto = (e) => {
    e.stopPropagation()
    setCurrent(i => (i - 1 + photos.length) % photos.length)
  }
  const nextPhoto = (e) => {
    e.stopPropagation()
    setCurrent(i => (i + 1) % photos.length)
  }

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add('visible'), (index % 12) * 80)
          obs.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [index])

  return (
    <div className="dragon-card-wrap" style={{ '--accent': dragon.accent, '--border': dragon.border }}>
    <div
      ref={cardRef}
      className="dragon-card"
      style={{ '--accent': dragon.accent, '--border': dragon.border }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="dragon-corner dragon-corner-tl" />
      <span className="dragon-corner dragon-corner-tr" />
      <span className="dragon-corner dragon-corner-bl" />
      <span className="dragon-corner dragon-corner-br" />

      {!imgError && activePhoto.src ? (
        <img
          key={activePhoto.src}
          className="dragon-photo"
          src={activePhoto.src}
          alt={dragon.name}
          style={{ objectPosition: activePhoto.pos || 'center 30%' }}
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="dragon-photo" style={{
          background: 'linear-gradient(135deg, #1a0a00, #0a0705)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 64, color: dragon.accent, opacity: 0.3 }}>🐉</span>
        </div>
      )}

      <div className="dragon-overlay" />

      {/* Infos statiques */}
      <div className="dragon-static"
           style={{ opacity: hovered ? 0 : 1, transform: hovered ? 'translateY(14px)' : 'translateY(0)',
                    pointerEvents: hovered ? 'none' : 'auto',
                    transition: 'opacity 0.35s ease, transform 0.35s ease' }}>
        <span className="dragon-rider-tag">{dragon.rider}</span>
        <div className="dragon-static-divider">
          <span className="dragon-divider-line" />
          <span className="dragon-divider-diamond" />
        </div>
        <h3 className="dragon-name">{dragon.name}</h3>
        <p className="dragon-titre">{dragon.title}</p>
      </div>

      {/* Contenu au survol */}
      <div className="dragon-hover"
           style={{ opacity: hovered ? 1 : 0, transform: hovered ? 'translateY(0)' : 'translateY(18px)',
                    pointerEvents: hovered ? 'auto' : 'none' }}>
        <h3 className="dragon-hover-name">{dragon.name}</h3>
        <p className="dragon-hover-titre">{dragon.title}</p>
        <div className="dragon-hover-divider">
          <span className="dragon-divider-line" />
          <span className="dragon-divider-diamond" />
          <span className="dragon-divider-line" />
        </div>
        <p className="dragon-hover-rider">Cavalier(s) : {dragon.rider}</p>
        <p className="dragon-hover-status">{dragon.status}</p>
        <p className="dragon-hover-desc">{dragon.description}</p>
      </div>

      <div className="dragon-accent-bar" />
    </div>

      {/* Galerie : navigation entre les images du dragon (placée sous la carte pour rester
          accessible même au survol, quand le texte descriptif recouvre la photo) */}
      {photos.length > 1 && (
        <div className="dragon-gallery-nav">
          <button className="dragon-gallery-btn" onClick={prevPhoto} aria-label="Image précédente">‹</button>
          <div className="dragon-gallery-dots">
            {photos.map((_, i) => (
              <button
                key={i}
                className={`dragon-gallery-dot ${i === current ? 'dragon-gallery-dot-active' : ''}`}
                style={{ background: i === current ? dragon.accent : undefined }}
                onClick={(e) => { e.stopPropagation(); setCurrent(i) }}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>
          <button className="dragon-gallery-btn" onClick={nextPhoto} aria-label="Image suivante">›</button>
        </div>
      )}
    </div>
  )
}

// ─── Section principale ──────────────────────────────────────────────────────
const Dragons = () => {
  const sectionRef = useRef(null)
  const headingRef = useRef(null)
  const subRef     = useRef(null)
  const [activeEra, setActiveEra]     = useState('tous')
  const [searchQuery, setSearchQuery] = useState('')

  const query = normalize(searchQuery)

  const matchesSearch = (d) => {
    if (!query) return true
    return normalize(`${d.name} ${d.title} ${d.rider} ${d.status} ${d.description}`).includes(query)
  }

  const filteredDragons = DRAGONS.filter(d =>
    (activeEra === 'tous' || d.era === activeEra) &&
    matchesSearch(d)
  )

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
    if (headingRef.current) obs.observe(headingRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="dragons-section">
      <div className="dragons-bg-texture" />
      <div className="dragons-bg-vignette" />

      <header className="dragons-header">
        <p className="dragons-eyebrow">DU SANG ET DU FEU</p>
        <div className="dragons-ornament">
          <span className="dragons-ornament-line" />
          <span className="dragons-ornament-rune">🔥</span>
          <span className="dragons-ornament-line" />
        </div>
        <h1 ref={headingRef} className="dragons-title fade-up">
          Les Enfants<br />
          <em>du Dragon</em>
        </h1>
        <p ref={subRef} className="dragons-subtitle fade-up">
          De la Conquête d'Aegon à la chute de Daenerys, en passant par la guerre fratricide de la Danse — {DRAGONS.length} dragons dont le feu a façonné l'histoire de Westeros.
        </p>
      </header>

      <div className="dragons-filters">
        {ERAS.map(e => {
          const count = e.id === 'tous' ? DRAGONS.length : DRAGONS.filter(d => d.era === e.id).length
          return (
            <button
              key={e.id}
              className={`dragons-filter-btn ${activeEra === e.id ? 'dragons-filter-active' : ''}`}
              onClick={() => setActiveEra(e.id)}
            >
              {e.label}
              <span className="dragons-filter-count">{count}</span>
            </button>
          )
        })}
      </div>

      <div className="dragons-search">
        <span className="dragons-search-icon" aria-hidden="true">⌕</span>
        <input
          type="text"
          className="dragons-search-input"
          placeholder="Rechercher un dragon, un cavalier, un statut..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            className="dragons-search-clear"
            onClick={() => setSearchQuery('')}
            aria-label="Effacer la recherche"
          >
            ✕
          </button>
        )}
      </div>

      {filteredDragons.length === 0 && (
        <p className="dragons-empty">Aucun dragon ne correspond à votre recherche.</p>
      )}

      <div className="dragon-grid">
        {filteredDragons.map((dragon, i) => (
          <CarteDragon key={dragon.id} dragon={dragon} index={i} />
        ))}
      </div>

      <div className="dragons-footer">
        <span className="dragons-footer-line" />
        <span className="dragons-footer-sigil">🔥</span>
        <span className="dragons-footer-line" />
      </div>
    </section>
  )
}

export default Dragons
