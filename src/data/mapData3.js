// ─── Carte 3 : Westeros + Essos ────────────────────────────────────────────────
export const MAP3_W = 2000
export const MAP3_H = 1500

export const MASK_DIR3 = '/map/Westeros%20%2B%20Essos'
// Image principale : MASK_DIR3 + '/Carte%20Westeros%20%2B%20Essos.webp'

// Offset coordonnées carte 3 :
// data_x = mesure_x + 0 (sauf Vaes Khadokh : +60)
// data_y = mesure_y + 10  (+60 initial, puis -50 = net +10 depuis PDF)

// ─── Régions ──────────────────────────────────────────────────────────────────
export const REGIONS3 = [

  // ══ WESTEROS ══
  {
    id: 'au-dela', nom: 'Au-delà du Mur', maison: 'Territoire Sauvage',
    siege: 'Le Poing des Premiers Hommes', seigneur: 'Le Roi-de-la-Nuit',
    maskFile: 'Au-dela-du-murs.webp', accent: '#a8c8d8',
    houseColor: 'rgba(168,200,216,0.45)', border: 'rgba(168,200,216,0.4)',
    description: "Terres indomptées et glaciales au nord du Mur. Domaine des Sauvageons, des géants et des Marcheurs Blancs. Aucune loi, aucun roi ne règne ici — seulement le froid et les morts.",
    faits: ["Territoire des Sauvageons — les 'Hommes Libres'", "Derniers Géants de Westeros", "Origine des Marcheurs Blancs"],
    devise: '"Nous ne courberons pas le genou"',
  },
  {
    id: 'nord', nom: 'Le Nord', maison: 'Maison Stark',
    siege: 'Winterfell', seigneur: 'Eddard Stark',
    maskFile: 'Nord.webp', accent: '#8fafc4',
    houseColor: 'rgba(143,175,196,0.45)', border: 'rgba(143,175,196,0.4)',
    description: "La plus vaste région de Westeros, territoire glacial gouverné par les Stark depuis des millénaires. Le Nord est séparé du reste du continent par le Mur colossal.",
    faits: ["Plus grande région de Westeros", "Gouvernée par les Stark depuis l'Ère des Héros", "Le Mur de 300 pieds à sa frontière nord"],
    devise: '"L\'Hiver Vient"',
  },
  {
    id: 'iles-de-fer', nom: 'Les Îles de Fer', maison: 'Maison Greyjoy',
    siege: 'Pyk', seigneur: 'Balon Greyjoy',
    maskFile: 'ile de Fer.webp', accent: '#b8a040',
    houseColor: 'rgba(184,160,64,0.45)', border: 'rgba(184,160,64,0.4)',
    description: "Archipel rocheux battu par les vents. Les Hommes de Fer vénèrent le Dieu Noyé et leurs navires sont les plus redoutés de toutes les côtes de Westeros.",
    faits: ["Meilleurs marins et pillards de Westeros", "Culte du Dieu Noyé", "Pyk : forteresse sur des rochers déchiquetés"],
    devise: '"Nous Ne Semons Pas"',
  },
  {
    id: 'conflans', nom: 'Les Terres des Rivières', maison: 'Maison Tully',
    siege: 'Vivesaigues', seigneur: 'Hoster Tully',
    maskFile: 'Conflants.webp', accent: '#4a90c8',
    houseColor: 'rgba(74,144,200,0.42)', border: 'rgba(74,144,200,0.4)',
    description: "Cœur géographique de Westeros, traversé par d'innombrables fleuves. Premier champ de bataille lors de chaque guerre.",
    faits: ["Plaque tournante des routes commerciales", "Premier théâtre de la Guerre des Cinq Rois", "Vivesaigues : à la confluence de deux rivières"],
    devise: '"La Famille, le Devoir, l\'Honneur"',
  },
  {
    id: 'val', nom: "Le Val d'Arryn", maison: 'Maison Arryn',
    siege: "L'Aerie", seigneur: 'Robin Arryn',
    maskFile: "Val D'Arryn.png", accent: '#b8d0e8',
    houseColor: 'rgba(184,208,232,0.42)', border: 'rgba(184,208,232,0.4)',
    description: "Région montagneuse protégée par les Montagnes de la Lune. L'Aerie, perchée si haut qu'elle est imprenable, a abrité les secrets qui déclenchèrent la grande guerre.",
    faits: ["L'Aerie : château le plus élevé de Westeros", "Pratiquement imprenable en hiver", "Jon Arryn fut à l'origine de la Rébellion de Robert"],
    devise: '"Haut Comme l\'Honneur"',
  },
  {
    id: 'terres-ouest', nom: "Les Terres de l'Ouest", maison: 'Maison Lannister',
    siege: 'Casterly Rock', seigneur: 'Tywin Lannister',
    maskFile: "Terre de l'Ouest.png", accent: '#d4783c',
    houseColor: 'rgba(212,120,60,0.45)', border: 'rgba(212,120,60,0.4)',
    description: "Région la plus riche de Westeros. Les mines d'or de Castral Roc ont fait la fortune des Lannister pendant des millénaires.",
    faits: ["Mines d'or les plus riches de Westeros", "Castral Roc : forteresse dans la roche vive", '"Un Lannister paie toujours ses dettes"'],
    devise: '"Entends-Moi Rugir"',
  },
  {
    id: 'terres-couronne', nom: 'Les Terres de la Couronne', maison: 'Famille Royale',
    siege: 'Port-Réal', seigneur: 'Le Roi des Sept Royaumes',
    maskFile: 'Terre de la couronne.webp', accent: '#c9a84c',
    houseColor: 'rgba(201,168,76,0.42)', border: 'rgba(201,168,76,0.4)',
    description: "Cœur politique de Westeros. Port-Réal abrite le Trône de Fer forgé par Aegon le Conquérant.",
    faits: ["Port-Réal : près d'un million d'habitants", "Siège du Trône de Fer", "Le Donjon Rouge : palais et forteresse royale"],
    devise: '"Un seul roi, un seul trône"',
  },
  {
    id: 'bief', nom: 'Le Bief', maison: 'Maison Tyrell',
    siege: 'Hautjardin', seigneur: 'Mace Tyrell',
    maskFile: 'Bief.webp', accent: '#5a9e48',
    houseColor: 'rgba(90,158,72,0.42)', border: 'rgba(90,158,72,0.4)',
    description: "Grenier de Westeros. Derrière la façade fleurie des Tyrell se cachent des ambitions aussi tranchantes que les épines de leur rose.",
    faits: ["Plus grande production agricole de Westeros", "Hautjardin : jardins légendaires", "Chevalerie la plus développée des Sept Royaumes"],
    devise: '"Croître Fort"',
  },
  {
    id: 'terres-orage', nom: 'Les Terres de la Tempête', maison: 'Maison Baratheon',
    siege: 'Accalmie', seigneur: 'Renly Baratheon',
    maskFile: "Terre de l'Orage.png", accent: '#a07830',
    houseColor: 'rgba(160,120,48,0.45)', border: 'rgba(160,120,48,0.4)',
    description: "Balayées par les tempêtes, ces terres ont forgé les Baratheon dans l'enclume des éléments. Accalmie n'a jamais été prise lors d'un siège.",
    faits: ["Accalmie : imprenable depuis mille ans", "Berceau de la Rébellion de Robert", "Terrain côtier accidenté"],
    devise: '"Notre est la Fureur"',
  },
  {
    id: 'dorne', nom: 'Dorne', maison: 'Maison Martell',
    siege: 'Lancesoleil', seigneur: 'Doran Martell',
    maskFile: 'Dorne.webp', accent: '#e8a020',
    houseColor: 'rgba(232,160,32,0.45)', border: 'rgba(232,160,32,0.4)',
    description: "La seule région à avoir résisté à la Conquête d'Aegon. Dorne est une terre de sable brûlant, de secrets jalousement gardés et de vengeance impitoyable.",
    faits: ["Seule région non conquise par Aegon le Conquérant", "Succession agnatique : hommes et femmes héritent également", "Rancœur séculaire contre les Lannister"],
    devise: '"Indomptable, Inflexible, Insoumis"',
  },
  {
    id: 'marches-pierre', nom: 'Les Marches de Pierre', maison: 'Îles disputées',
    siege: 'Pierresang', seigneur: 'Contesté',
    maskFile: 'Degree de Pierre.webp', accent: '#708090',
    houseColor: 'rgba(112,128,144,0.4)', border: 'rgba(112,128,144,0.4)',
    description: "Chaîne d'îles rocheuses entre Dorne et les Cités Libres. Zone stratégique âprement disputée depuis des siècles.",
    faits: ["Point de passage obligé entre Westeros et Essos", "Pierresang : principale forteresse des Marches", "Daemon Targaryen y fut couronné Prince des Marches"],
    devise: '"Qui tient les Marches tient le détroit"',
  },

  // ══ CITÉS LIBRES ══
  {
    id: 'braavos', nom: 'Braavos', maison: 'La Sérénissime',
    siege: 'La Citadelle', seigneur: 'Seigneur de la Mer',
    maskFile: 'Braavos.webp', accent: '#4a7ab8',
    houseColor: 'rgba(74,122,184,0.42)', border: 'rgba(74,122,184,0.4)',
    description: "La plus puissante des Cités Libres, fondée par des esclaves fugitifs de Valyria. Siège de la Banque de Fer et de la Maison du Noir et du Blanc.",
    faits: ["Fondée par des esclaves fugitifs de Valyria", "La Banque de Fer recouvre toujours ses dettes", "Le Titan de Braavos garde l'entrée de la lagune"],
    devise: '"Valar Morghulis"',
  },
  {
    id: 'lorath', nom: 'Lorath', maison: 'Princes Maazei',
    siege: 'Lorath', seigneur: 'Trois Princes',
    maskFile: 'Lorath.webp', accent: '#6090a8',
    houseColor: 'rgba(96,144,168,0.4)', border: 'rgba(96,144,168,0.4)',
    description: "La plus petite et isolée des Cités Libres, gouvernée par trois princes maazei. Jaqen H'ghar prétend en être originaire.",
    faits: ["La plus isolée des Cités Libres", "Trois princes maazei gouvernent conjointement", "Passé lié aux Hommes sans Visage"],
    devise: '"Dans l\'ombre, la vérité"',
  },
  {
    id: 'pentos', nom: 'Pentos', maison: 'Magisters',
    siege: 'Pentos', seigneur: 'Prince de Pentos',
    maskFile: 'Pentos.webp', accent: '#8060a0',
    houseColor: 'rgba(128,96,160,0.4)', border: 'rgba(128,96,160,0.4)',
    description: "Cité-état à l'entrée de la Mer Intérieure. C'est ici que Daenerys et Viserys grandirent en exil sous la protection d'Illyrio Mopatis.",
    faits: ["Refuge de la famille Targaryen en exil", "Illyrio Mopatis — magister aux connexions obscures", "Point de départ du voyage de Daenerys"],
    devise: '"Le commerce unit, la guerre divise"',
  },
  {
    id: 'norvos', nom: 'Norvos', maison: 'Confrérie Sacrée',
    siege: 'Norvos', seigneur: 'Grand Prêtre',
    maskFile: 'Norvos.webp', accent: '#a87850',
    houseColor: 'rgba(168,120,80,0.4)', border: 'rgba(168,120,80,0.4)',
    description: "Cité double — haute ville des prêtres et basse ville des artisans — gouvernée par une confrérie religieuse secrète.",
    faits: ["Haute ville religieuse / basse ville commerciale", "Guerriers barbus réputés pour leur férocité", "Cité sur la Petite Rhoyne"],
    devise: '"Par la foi, la force"',
  },
  {
    id: 'myr', nom: 'Myr', maison: 'Magisters de Myr',
    siege: 'Myr', seigneur: 'Conseil des Magisters',
    maskFile: 'Myr.webp', accent: '#c05070',
    houseColor: 'rgba(192,80,112,0.42)', border: 'rgba(192,80,112,0.4)',
    description: "Cité-état réputée pour ses lentilles de verre, sa dentelle et ses mercenaires. Rivale acharnée de Tyrosh et Lys.",
    faits: ["Artisans du verre parmi les meilleurs du monde connu", "Compagnies de mercenaires myrriens redoutées", "En conflit permanent avec Tyrosh et Lys"],
    devise: '"L\'art prime sur la guerre"',
  },
  {
    id: 'tyrosh', nom: 'Tyrosh', maison: 'Archimagistrat',
    siege: 'Tyrosh', seigneur: 'Archimagistrat',
    maskFile: 'Tyrosh.webp', accent: '#d04030',
    houseColor: 'rgba(208,64,48,0.42)', border: 'rgba(208,64,48,0.4)',
    description: "Cité-état connue pour ses teintures de cheveux multicolores. En rivalité permanente avec Myr et Lys.",
    faits: ["Teintures de coquillages prisées sur les deux continents", "Position insulaire stratégique dans les Marches de Pierre", "Alliances et trahisons cycliques avec Myr et Lys"],
    devise: '"La couleur révèle l\'âme"',
  },
  {
    id: 'lys', nom: 'Lys', maison: 'Magisters de Lys',
    siege: 'Lys', seigneur: 'Conseil des Magisters',
    maskFile: 'Lys.webp', accent: '#e87080',
    houseColor: 'rgba(232,112,128,0.4)', border: 'rgba(232,112,128,0.4)',
    description: "Cité-état insulaire célèbre pour ses poisons raffinés, ses maisons de plaisirs et ses esclaves de beauté à sang valyrien pur.",
    faits: ["Sang valyrien le plus pur des Cités Libres", "Poisons de Lys réputés indétectables", "Dialecte le plus proche du haut valyrien"],
    devise: '"La beauté est la plus redoutable des armes"',
  },
  {
    id: 'qohor', nom: 'Qohor', maison: 'Conseil Noir',
    siege: 'Qohor', seigneur: 'Le Conseil Noir',
    maskFile: 'Qohor.webp', accent: '#607038',
    houseColor: 'rgba(96,112,56,0.42)', border: 'rgba(96,112,56,0.4)',
    description: "Cité-état dans les forêts orientales. Qohor possède le secret de la refonte de l'acier valyrien. Ses Unsullied repoussèrent seuls vingt mille cavaliers Dothraki.",
    faits: ["Secret de la refonte de l'acier valyrien", "Les Unsullied repoussèrent 20 000 Dothraki — 3 000 contre 20 000", "Culte du Dieu Sombre pratiqué ouvertement"],
    devise: '"L\'acier ne ment pas"',
  },
  {
    id: 'volantis', nom: 'Volantis', maison: 'Anciens Sang',
    siege: 'Volantis', seigneur: 'Trois Triarchs',
    maskFile: 'Volantis.webp', accent: '#a05030',
    houseColor: 'rgba(160,80,48,0.45)', border: 'rgba(160,80,48,0.4)',
    description: "La plus ancienne des Cités Libres, héritière de Valyria. La cité la plus peuplée d'Essos. Trois esclaves pour chaque homme libre.",
    faits: ["Plus grande cité d'Essos", "Trois triarchs élus — deux éléphanteaux, un tigreau", "Long Bridge : plus long pont du monde connu"],
    devise: '"Volantis sera, Valyria était"',
  },

  // ══ ESSOS ══
  {
    id: 'dothraki', nom: 'Mer Dothrak', maison: 'Khalasars Dothraki',
    siege: 'Vaes Dothrak', seigneur: 'Les Khals',
    maskFile: 'Dothraki khalasars.webp', accent: '#c8a060',
    houseColor: 'rgba(200,160,96,0.38)', border: 'rgba(200,160,96,0.4)',
    description: "Immense mer d'herbe à travers le centre d'Essos. Les Dothraki nomades — les plus redoutables cavaliers du monde connu — y font paître leurs hordes.",
    faits: ["Vaes Dothrak : seule ville Dothraki, ville sainte sans fers", "Les Khalasars comptent parfois des dizaines de milliers de guerriers", "Jamais vaincus sur leurs terres"],
    devise: '"Un cheval, une lance, le monde entier"',
  },
  {
    id: 'valyria', nom: 'Péninsule de Valyria', maison: 'Ruines Maudites',
    siege: 'Ancienne Valyria', seigneur: 'Aucun — terres dévastées',
    maskFile: 'Ancienne Valerya.webp', accent: '#8050a0',
    houseColor: 'rgba(128,80,160,0.4)', border: 'rgba(128,80,160,0.4)',
    description: "Ruines de l'Empire Valyrien, détruit lors de la Calamité il y a quatre siècles. La péninsule est empoisonnée, infestée de stone men et de dragons sauvages.",
    faits: ["L'Empire Valyrien domina le monde pendant cinq siècles", "La Calamité : cataclysme de feu en 114 avant l'Ère", "Seuls les Targaryen survécurent grâce à une prophétie"],
    devise: '"Valar Dohaeris"',
  },
  {
    id: 'baie-esclaves', nom: 'Baie des Serfs', maison: 'Anciens Maîtres',
    siege: 'Astapor', seigneur: 'Conseil des Maîtres',
    maskFile: 'Astaport.webp', accent: '#c0904a',
    houseColor: 'rgba(192,144,74,0.42)', border: 'rgba(192,144,74,0.4)',
    description: "Côte dominée par trois grandes cités esclavagistes. Astapor — la Ville Rouge — est le berceau des Immaculés. Daenerys y brisa les chaînes.",
    faits: ["Astapor : berceau des Immaculés", "Esclavage institutionnalisé depuis des siècles", "Daenerys libéra les esclaves des trois cités"],
    devise: '"Un esclave n\'a pas de nom"',
  },
  {
    id: 'yunkai', nom: 'Côte de Yunkaï', maison: 'Sages Maîtres',
    siege: 'Yunkaï', seigneur: 'Les Sages Maîtres',
    maskFile: 'Yunkai.webp', accent: '#d0a850',
    houseColor: 'rgba(208,168,80,0.42)', border: 'rgba(208,168,80,0.4)',
    description: "Cité de plaisirs et de complots entre Astapor et Meereen. Meereen devint le trône de Daenerys.",
    faits: ["Yunkaï : la 'Ville Jaune' aux bâtiments de brique dorée", "Meereen : plus grande cité de la Baie des Serfs", "Les Sages Maîtres pratiquent la diplomatie par le poison"],
    devise: '"La sagesse gouverne, la force sert"',
  },
  {
    id: 'ghiscar', nom: 'Ghiscar', maison: 'Empire de Ghis',
    siege: 'New Ghis', seigneur: 'Légions de New Ghis',
    maskFile: 'Ghaen.webp', accent: '#a07850',
    houseColor: 'rgba(160,120,80,0.4)', border: 'rgba(160,120,80,0.4)',
    description: "Territoire de l'ancien Empire de Ghis, détruit cinq fois par les dragons de Valyria. New Ghis maintient les traditions esclavagistes.",
    faits: ["Ghis : cinq fois rebâtie, cinq fois détruite par Valyria", "Les légions ghiscaris imitent la discipline impériale ancienne", "New Ghis : héritière commerciale et militaire"],
    devise: '"De la cendre, l\'empire renaît"',
  },
  {
    id: 'ib', nom: "Îles d'Ibben", maison: 'Ibbenois',
    siege: "Port d'Ibben", seigneur: 'Ghal — le Roi Fantôme',
    maskFile: 'Ib.webp', accent: '#708898',
    houseColor: 'rgba(112,136,152,0.42)', border: 'rgba(112,136,152,0.4)',
    description: "Archipel isolé dans la mer de Jade, peuplé d'Ibbenois — peuple hirsute à la peau grisâtre. Grands chasseurs de baleines.",
    faits: ["Peuple génétiquement distinct du reste du monde connu", "Baleiniers ibbenois présents dans toutes les mers", "Port d'Ibben : principale cité commerciale"],
    devise: '"La mer nourrit les forts"',
  },
  {
    id: 'quarkash', nom: 'Qarth', maison: 'Les Quatorzièmes Familles',
    siege: 'Qarth', seigneur: 'Xaro Xhoan Daxos',
    maskFile: 'Quarkash.webp', accent: '#7850a8',
    houseColor: 'rgba(120,80,168,0.42)', border: 'rgba(120,80,168,0.4)',
    description: "La 'plus grande cité du monde'. Contrôle le détroit — passage obligé entre la Mer des Épices et la Mer de Jade.",
    faits: ["Contrôle du détroit de Qarth — clé du commerce mondial", "Les Trece — treize marchands gouvernant la cité", "Pyyks : gardiens mystiques des trois portes"],
    devise: '"La richesse attire la richesse"',
  },
  {
    id: 'black-cliffs', nom: 'Falaises Noires', maison: 'Peuples des Falaises',
    siege: 'Inconnu', seigneur: 'Inconnu',
    maskFile: 'Black Cliffs.webp', accent: '#506070',
    houseColor: 'rgba(80,96,112,0.4)', border: 'rgba(80,96,112,0.4)',
    description: "Terres inhospitalières bordées de falaises noires au nord-est d'Essos. Région peu cartographiée, peuplée de tribus mystérieuses.",
    faits: ["Côtes inaccessibles aux navires standards", "Tribus locales peu connues des cartographes", "Zone tampon entre Ibben et les terres intérieures"],
    devise: 'Inconnue',
  },
  {
    id: 'great-moraq', nom: 'Grande Moraq', maison: 'Marchands de Moraq',
    siege: 'Inconnue', seigneur: 'Inconnu',
    maskFile: 'Great Moraq.webp', accent: '#5080a0',
    houseColor: 'rgba(80,128,160,0.4)', border: 'rgba(80,128,160,0.4)',
    description: "Grande île au sud-est d'Essos, sur la route commerciale entre Qarth et les terres encore plus lointaines.",
    faits: ["Île stratégique sur les routes commerciales orientales", "Point de transit entre Qarth et les terres inconnues", "Terres intérieures encore inexplorées"],
    devise: 'Inconnue',
  },
  {
    id: 'khyzai', nom: 'Passe de Khyzaï', maison: 'Seigneurs du Passe',
    siege: 'Inconnu', seigneur: 'Inconnu',
    maskFile: 'Khyzai Pass.webp', accent: '#905068',
    houseColor: 'rgba(144,80,104,0.4)', border: 'rgba(144,80,104,0.4)',
    description: "Passage montagneux stratégique à l'est d'Essos. Route commerciale ancienne empruntée par les caravanes depuis des siècles.",
    faits: ["Passage obligé pour les caravanes commerciales orientales", "Zone de conflits entre tribus nomades", "Montagnes quasi-infranchissables hors du passe"],
    devise: 'Inconnue',
  },
  {
    id: 'kingdom-omber', nom: "Royaume d'Omber", maison: "Rois d'Omber",
    siege: 'Omber', seigneur: "Roi d'Omber",
    maskFile: 'Kingdom of Omber.webp', accent: '#788060',
    houseColor: 'rgba(120,128,96,0.4)', border: 'rgba(120,128,96,0.4)',
    description: "Royaume lointain à l'est d'Essos, dont on sait peu de choses dans les Sept Royaumes.",
    faits: ["L'un des rares royaumes organisés de l'est d'Essos", "Peu de contact commercial avec l'Ouest", "Traditions culturelles distinctes"],
    devise: 'Inconnue',
  },
  {
    id: 'lazhai', nom: 'Lazhaï', maison: 'Peuple de Lazhaï',
    siege: 'Lazhaï', seigneur: 'Inconnu',
    maskFile: 'Lazhai.webp', accent: '#a06848',
    houseColor: 'rgba(160,104,72,0.4)', border: 'rgba(160,104,72,0.4)',
    description: "Territoire peu connu à l'est de la Mer Dothrak. Les peuples de Lazhaï entretiennent des rapports commerciaux avec Qarth.",
    faits: ["Territoire oriental peu documenté", "Commerce de denrées exotiques avec Qarth", "Culture distincte des peuples Dothraki voisins"],
    devise: 'Inconnue',
  },
  {
    id: 'the-axe', nom: 'La Hache', maison: 'Peuples de la Hache',
    siege: 'Inconnu', seigneur: 'Inconnu',
    maskFile: 'The Axe.webp', accent: '#607090',
    houseColor: 'rgba(96,112,144,0.4)', border: 'rgba(96,112,144,0.4)',
    description: "Péninsule en forme de hache au nord-est d'Essos, entre Lorath et les Îles d'Ibben. Repère de pirates et de pêcheurs nordiques.",
    faits: ["Péninsule caractéristique en forme de hache", "Zone de pêche nordique importante", "Passage maritime entre Lorath et Ibben"],
    devise: 'Inconnue',
  },
]

// ─── Groupes de la légende ────────────────────────────────────────────────────
export const LEGEND_GROUPS3 = [
  {
    label: 'Westeros',
    ids: ['au-dela','nord','iles-de-fer','conflans','val','terres-ouest','terres-couronne','bief','terres-orage','dorne','marches-pierre'],
  },
  {
    label: 'Cités Libres',
    ids: ['braavos','lorath','pentos','norvos','myr','tyrosh','lys','qohor','volantis'],
  },
  {
    label: 'Essos',
    ids: ['dothraki','valyria','baie-esclaves','yunkai','ghiscar','ib','quarkash','black-cliffs','great-moraq','khyzai','kingdom-omber','lazhai','the-axe'],
  },
]

// ─── Lieux ────────────────────────────────────────────────────────────────────
// Offset final : raw_pdf_y + 10  (raw_pdf_x + 0, sauf Vaes Khadokh +60)
export const LIEUX3 = [

  // ══ AU-DELÀ DU MUR ══
  { id: 'w3-castle-black', nom: 'Château Noir', x: 414, y: 97, regionId: 'au-dela', level: 1, type: 'fortress',
    desc: "Siège de commandement de la Garde de Nuit. Jon Snow y devint Lord Commandant — et y fut assassiné avant d'être ressuscité par Mélisandre." },

  // ══ LE NORD ══
  { id: 'w3-winterfell', nom: 'Winterfell', x: 325, y: 308, regionId: 'nord', level: 1, type: 'capital',
    desc: "Siège millénaire des Stark. C'est ici que tout commença — et que la Bataille des Bâtards décida du sort du Nord." },
  { id: 'w3-white-harbor', nom: 'Port-Blanc', x: 387, y: 432, regionId: 'nord', level: 1, type: 'town',
    desc: "La plus grande ville du Nord. Les Manderly y jouèrent un double jeu dangereux pour rester fidèles aux Stark." },
  { id: 'w3-moat-cailin', nom: 'Motte-Cailin', x: 330, y: 457, regionId: 'nord', level: 2, type: 'fortress',
    desc: "Position stratégique à l'entrée du Cou — l'unique route vers le Nord. Vingt Hommes de Fer tinrent ici contre une armée entière." },

  // ══ ÎLES DE FER ══
  { id: 'w3-pyke', nom: 'Pyke', x: 129, y: 672, regionId: 'iles-de-fer', level: 1, type: 'stronghold',
    desc: "Forteresse des Greyjoy sur des îlots rocheux reliés par des ponts effrités. Brutal, isolé et résistant." },

  // ══ TERRES DES RIVIÈRES ══
  { id: 'w3-twins', nom: 'Les Jumeaux', x: 294, y: 599, regionId: 'conflans', level: 1, type: 'fortress',
    desc: "Les deux châteaux jumeaux contrôlant l'unique pont sur la Trident Verte. Lieu des Noces Pourpres." },
  { id: 'w3-harrenhal', nom: 'Harrenhal', x: 377, y: 749, regionId: 'conflans', level: 2, type: 'ruin', labelPos: 'top',
    desc: "Le plus grand château jamais construit — et le plus maudit. Le jour de l'inauguration, les dragons d'Aegon fondirent ses cinq tours." },

  // ══ VAL D'ARRYN ══
  { id: 'w3-eyrie', nom: "L'Aerie", x: 486, y: 656, regionId: 'val', level: 1, type: 'stronghold',
    desc: "Château perché si haut dans les Montagnes de la Lune que la neige l'encercle presque toute l'année." },

  // ══ TERRES DE L'OUEST ══
  { id: 'w3-casterly-rock', nom: 'Castral Roc', x: 135, y: 806, regionId: 'terres-ouest', level: 1, type: 'capital',
    desc: "Forteresse imprenable des Lannister, taillée dans un rocher surplombant la mer d'Occident. Jamais prise — jusqu'aux Immaculés de Daenerys." },

  // ══ TERRES DE LA COURONNE ══
  { id: 'w3-kings-landing', nom: 'Port-Réal', x: 425, y: 851, regionId: 'terres-couronne', level: 1, type: 'capital', labelPos: 'top',
    desc: "Capitale des Sept Royaumes, près d'un million d'habitants. Le Donjon Rouge abrite le Trône de Fer." },

  // ══ LE BIEF ══
  { id: 'w3-highgarden', nom: 'Hautjardin', x: 204, y: 1014, regionId: 'bief', level: 1, type: 'capital',
    desc: "Siège des Tyrell, entouré de jardins légendaires. Les richesses du Bief nourrissent Westeros entier." },

  // ══ TERRES DE LA TEMPÊTE ══
  { id: 'w3-storms-end', nom: 'Accalmie', x: 512, y: 974, regionId: 'terres-orage', level: 1, type: 'stronghold',
    desc: "Forteresse imprenable des Baratheon. Ses murs ont résisté à mille ans de tempêtes." },
  { id: 'w3-tarth', nom: 'Île de Tarth', x: 586, y: 960, regionId: 'terres-orage', level: 1, type: 'island',
    desc: "Île surnommée 'Saphir' pour ses lacs bleus. Île natale de Brienne de Tarth." },

  // ══ DORNE ══
  { id: 'w3-yronwood', nom: 'Yronwood', x: 375, y: 1124, regionId: 'dorne', level: 2, type: 'stronghold',
    desc: "Second fief le plus puissant de Dorne, siège des Gardiens des Sables." },
  { id: 'w3-sunspear', nom: 'Lancesoleil', x: 542, y: 1200, regionId: 'dorne', level: 1, type: 'capital',
    desc: "Capitale de Dorne, siège des Martell depuis des millénaires. La Tour du Soleil et la Lame de la Vipère." },

  // ══ MARCHES DE PIERRE ══
  { id: 'w3-bloodstone', nom: 'Pierresang', x: 606, y: 1105, regionId: 'marches-pierre', level: 1, type: 'stronghold',
    desc: "Principale île des Marches de Pierre. Daemon Targaryen y fut couronné Prince des Marches." },

  // ══ BRAAVOS ══
  { id: 'e3-braavos', nom: 'Braavos', x: 740, y: 582, regionId: 'braavos', level: 1, type: 'capital',
    desc: "La plus puissante des Cités Libres. Siège de la Banque de Fer et de la Maison du Noir et du Blanc." },

  // ══ LORATH ══
  { id: 'e3-lorath', nom: 'Lorath', x: 872, y: 615, regionId: 'lorath', level: 1, type: 'capital',
    desc: "La plus petite et isolée des Cités Libres, gouvernée par trois princes maazei." },
  { id: 'e3-morosh', nom: 'Morosh', x: 1306, y: 566, regionId: 'lorath', level: 2, type: 'landmark',
    desc: "Lieu de rassemblement dans les plaines septentrionales, proche de la mer de Jade." },

  // ══ PENTOS ══
  { id: 'e3-pentos', nom: 'Pentos', x: 745, y: 861, regionId: 'pentos', level: 1, type: 'capital',
    desc: "C'est ici que Daenerys et Viserys grandirent en exil sous la protection d'Illyrio Mopatis." },

  // ══ NORVOS ══
  { id: 'e3-norvos', nom: 'Norvos', x: 900, y: 768, regionId: 'norvos', level: 1, type: 'capital',
    desc: "Cité double — haute ville des prêtres et basse ville des artisans — gouvernée par une confrérie secrète." },
  { id: 'e3-ghoyan-drohe', nom: 'Ghoyan Drohe', x: 835, y: 839, regionId: 'norvos', level: 2, type: 'ruin',
    desc: "Ancienne cité rhoynar sur la Petite Rhoyne, autrefois prospère avant les guerres valyriennes." },
  { id: 'e3-ny-sar', nom: 'Ny Sar', x: 914, y: 896, regionId: 'norvos', level: 2, type: 'ruin',
    desc: "Ruines d'une ancienne cité rhoynar sur la Grande Rhoyne." },
  { id: 'e3-ar-noy', nom: 'Ar Noy', x: 944, y: 896, regionId: 'norvos', level: 2, type: 'ruin',
    desc: "Ruines rhoynar sur la Grande Rhoyne, vestiges de la civilisation avant la conquête valyrianne." },

  // ══ QOHOR ══
  { id: 'e3-qohor', nom: 'Qohor', x: 1036, y: 855, regionId: 'qohor', level: 1, type: 'capital',
    desc: "Cité-état dans les forêts orientales. Qohor possède le secret de la refonte de l'acier valyrien." },
  { id: 'e3-saath', nom: 'Saath', x: 1252, y: 611, regionId: 'qohor', level: 2, type: 'ruin',
    desc: "Ancienne cité au nord, autrefois florissante sur la côte de la Mer de Jade." },

  // ══ MYR ══
  { id: 'e3-myr', nom: 'Myr', x: 795, y: 1038, regionId: 'myr', level: 1, type: 'capital',
    desc: "Cité-état réputée pour ses lentilles de verre, sa dentelle et ses mercenaires." },
  { id: 'e3-the-sorrows', nom: 'Les Chagrins', x: 896, y: 970, regionId: 'myr', level: 2, type: 'landmark',
    desc: "Tronçon maudit de la Grande Rhoyne, hanté par les stone men. Tyrion et Jorah y faillirent mourir." },

  // ══ TYROSH ══
  { id: 'e3-tyrosh', nom: 'Tyrosh', x: 676, y: 1049, regionId: 'tyrosh', level: 1, type: 'capital',
    desc: "Cité-état insulaire connue pour ses teintures de cheveux multicolores." },

  // ══ LYS ══
  { id: 'e3-lys', nom: 'Lys', x: 731, y: 1208, regionId: 'lys', level: 1, type: 'capital',
    desc: "Cité-état insulaire célèbre pour ses poisons raffinés et ses esclaves de beauté à sang valyrien pur." },

  // ══ VOLANTIS ══
  { id: 'e3-volantis', nom: 'Volantis', x: 1018, y: 1197, regionId: 'volantis', level: 1, type: 'capital',
    desc: "La plus ancienne des Cités Libres. La cité la plus peuplée d'Essos. Trois esclaves pour chaque homme libre." },
  { id: 'e3-selhorys', nom: 'Selhorys', x: 956, y: 1096, regionId: 'volantis', level: 2, type: 'town',
    desc: "Ville satellite de Volantis sur la Grande Rhoyne." },
  { id: 'e3-valysar', nom: 'Valysar', x: 964, y: 1140, regionId: 'volantis', level: 2, type: 'town',
    desc: "Ville sur la Grande Rhoyne, dans la zone d'influence de Volantis." },
  { id: 'e3-sar-mell', nom: 'Sar Mell', x: 1005, y: 1172, regionId: 'volantis', level: 2, type: 'ruin',
    desc: "Ancienne cité rhoynar sur la Grande Rhoyne, ruinée lors des guerres contre Valyria." },
  { id: 'e3-volon-therys', nom: 'Volon Therys', x: 987, y: 1180, regionId: 'volantis', level: 2, type: 'town',
    desc: "Ville proche de Volantis sur le cours inférieur de la Rhoyne." },
  { id: 'e3-sarhoy', nom: 'Sarhoy', x: 1010, y: 1219, regionId: 'volantis', level: 2, type: 'ruin',
    desc: "Ruines d'une cité rhoynar sur la côte méridionale." },

  // ══ MER DOTHRAK ══
  { id: 'e3-vaes-khadokh', nom: 'Vaes Khadokh', x: 1214, y: 778, regionId: 'dothraki', level: 2, type: 'landmark',
    desc: "Camp de rassemblement Dothraki sur la mer d'herbe." },
  { id: 'e3-vaes-gorqoyi', nom: 'Vaes Gorqoyi', x: 1289, y: 695, regionId: 'dothraki', level: 2, type: 'landmark',
    desc: "Rassemblement Dothraki à l'est de la mer d'herbe." },
  { id: 'e3-vaes-graddakh', nom: 'Vaes Graddakh', x: 1338, y: 632, regionId: 'dothraki', level: 2, type: 'landmark',
    desc: "Site Dothraki sur les marges nordiques de la mer d'herbe." },
  { id: 'e3-vaes-khewo', nom: 'Vaes Khewo', x: 1386, y: 840, regionId: 'dothraki', level: 2, type: 'landmark',
    desc: "Camp Dothraki au centre de la mer d'herbe." },
  { id: 'e3-vaes-athjikhari', nom: 'Vaes Athjikhari', x: 1524, y: 740, regionId: 'dothraki', level: 2, type: 'landmark',
    desc: "Grand rassemblement Dothraki dans les steppes orientales." },
  { id: 'e3-vaes-leqse', nom: 'Vaes Leqse', x: 1550, y: 782, regionId: 'dothraki', level: 2, type: 'landmark',
    desc: "Site Dothraki des plaines orientales." },
  { id: 'e3-yalli-qamayi', nom: 'Yalli Qamayi', x: 1561, y: 843, regionId: 'dothraki', level: 2, type: 'landmark',
    desc: "Camp saisonnier Dothraki dans les hautes steppes orientales." },
  { id: 'e3-vojjor-samui', nom: 'Vojjor Samui', x: 1500, y: 864, regionId: 'dothraki', level: 2, type: 'landmark',
    desc: "Lieu de rassemblement Dothraki entre les grandes hordes." },
  { id: 'e3-vaes-diaf', nom: 'Vaes Diaf', x: 1494, y: 970, regionId: 'dothraki', level: 2, type: 'landmark',
    desc: "Camp Dothraki aux confins méridionaux de la mer d'herbe." },
  { id: 'e3-vaes-efe', nom: 'Vaes Efe', x: 1702, y: 981, regionId: 'dothraki', level: 2, type: 'landmark',
    desc: "Site Dothraki lointain dans les steppes orientales." },
  { id: 'e3-vaes-meijah', nom: 'Vaes Meijah', x: 1669, y: 1031, regionId: 'dothraki', level: 2, type: 'landmark',
    desc: "Rassemblement Dothraki dans les plaines orientales profondes." },
  { id: 'e3-krazaaj-has', nom: 'Krazaaj Has', x: 1626, y: 1040, regionId: 'dothraki', level: 2, type: 'landmark',
    desc: "Camp Dothraki — colline des crânes, lieu où les khals entassent les crânes de leurs ennemis." },
  { id: 'e3-vaes-leisi', nom: 'Vaes Leisi', x: 1676, y: 577, regionId: 'dothraki', level: 2, type: 'landmark',
    desc: "Rassemblement Dothraki dans les steppes septentrionales orientales." },
  { id: 'e3-vaes-aresak', nom: 'Vaes Aresak', x: 1934, y: 532, regionId: 'dothraki', level: 2, type: 'landmark',
    desc: "Camp Dothraki le plus oriental connu des cartographes de Westeros." },
  { id: 'e3-vaes-jini', nom: 'Vaes Jini', x: 1912, y: 985, regionId: 'dothraki', level: 2, type: 'landmark',
    desc: "Site Dothraki lointain dans les plaines orientales profondes." },
  { id: 'e3-adakhakileki', nom: 'Adakhakileki', x: 1849, y: 1062, regionId: 'dothraki', level: 2, type: 'landmark',
    desc: "Rassemblement Dothraki dans les steppes du lointain est." },
  { id: 'e3-bhorashi', nom: 'Bhorashi', x: 1403, y: 1084, regionId: 'dothraki', level: 2, type: 'town',
    desc: "Ville des plaines au carrefour entre la mer Dothrak et les terres de Lhazar." },

  // ══ LAZHAÏ ══
  { id: 'e3-hesh', nom: 'Hesh', x: 1641, y: 1102, regionId: 'lazhai', level: 2, type: 'town',
    desc: "Ville orientale dans les terres de Lazhaï." },
  { id: 'e3-lhazosh', nom: 'Lhazosh', x: 1697, y: 1123, regionId: 'lazhai', level: 2, type: 'town',
    desc: "Ville des Lhazaréens — les agneaux de Dieu, peuple pastoral pacifiste régulièrement pillé par les Dothraki." },

  // ══ PÉNINSULE DE VALYRIA ══
  { id: 'e3-valyria', nom: 'Ancienne Valyria', x: 1204, y: 1422, regionId: 'valyria', level: 1, type: 'ruin',
    desc: "Ruines de la plus grande cité du monde. La Calamité dévasta la péninsule en une nuit de feu il y a quatre siècles." },
  { id: 'e3-tyria', nom: 'Tyria', x: 1210, y: 1372, regionId: 'valyria', level: 2, type: 'ruin',
    desc: "Ruines d'une ancienne cité valyrianne, ensevelie sous la lave et les cendres." },
  { id: 'e3-oros', nom: 'Oros', x: 1240, y: 1317, regionId: 'valyria', level: 2, type: 'ruin',
    desc: "Vestiges d'une cité valyrianne dans les terres dévastées par la Calamité." },
  { id: 'e3-ghozai', nom: 'Ghozai', x: 1363, y: 1224, regionId: 'valyria', level: 2, type: 'town',
    desc: "Ville côtière entre la péninsule de Valyria et la Baie des Serfs." },

  // ══ FALAISES NOIRES ══
  { id: 'e3-mantarys', nom: 'Mantarys', x: 1268, y: 1128, regionId: 'black-cliffs', level: 2, type: 'town',
    desc: "Ville maudite aux portes de la péninsule de Valyria aux coutumes terrifiantes." },
  { id: 'e3-elyria', nom: 'Elyria', x: 1291, y: 1179, regionId: 'black-cliffs', level: 2, type: 'town',
    desc: "Cité à la lisière des terres valyriennes dévastées, point de passage sur la route de Volantis." },
  { id: 'e3-tolos', nom: 'Tolos', x: 1328, y: 1167, regionId: 'black-cliffs', level: 2, type: 'town',
    desc: "Ville sur la côte de la Baie des Serfs, entre les terres valyriennes et les cités esclavagistes." },
  { id: 'e3-velos', nom: 'Velos', x: 1376, y: 1272, regionId: 'black-cliffs', level: 2, type: 'ruin',
    desc: "Ruines valyriennes sur la côte, englouties en partie par la mer lors de la Calamité." },

  // ══ BAIE DES SERFS ══
  { id: 'e3-astapor', nom: 'Astapor', x: 1478, y: 1221, regionId: 'baie-esclaves', level: 1, type: 'capital',
    desc: "La Ville Rouge — berceau des Immaculés. Daenerys y libéra les esclaves et commença sa conquête." },

  // ══ YUNKAÏ / MEEREEN ══
  { id: 'e3-yunkai', nom: 'Yunkaï', x: 1502, y: 1117, regionId: 'yunkai', level: 1, type: 'capital',
    desc: "La Ville Jaune aux bâtiments de brique dorée. Les Sages Maîtres se soumirent face aux dragons." },
  { id: 'e3-meereen', nom: 'Meereen', x: 1539, y: 1079, regionId: 'yunkai', level: 1, type: 'capital',
    desc: "Plus grande cité de la Baie des Serfs, siège du règne de Daenerys pendant de longues années." },

  // ══ GHISCAR ══
  { id: 'e3-ghis', nom: 'Vieux Ghis', x: 1507, y: 1347, regionId: 'ghiscar', level: 1, type: 'ruin',
    desc: "Ruines de la capitale de l'Empire de Ghis, détruite cinq fois par les dragons de Valyria." },
  { id: 'e3-new-ghis', nom: 'New Ghis', x: 1525, y: 1448, regionId: 'ghiscar', level: 2, type: 'capital',
    desc: "Héritière de l'Empire de Ghis. Ses légions se battent pour les Anciens Maîtres contre Daenerys." },

  // ══ ÎLES D'IBBEN ══
  { id: 'e3-port-ibben', nom: "Port d'Ibben", x: 1853, y: 331, regionId: 'ib', level: 1, type: 'capital',
    desc: "Principale ville de l'archipel d'Ibben, centre du commerce baleinier." },
  { id: 'e3-ib-sar', nom: 'Ib Sar', x: 1881, y: 438, regionId: 'ib', level: 1, type: 'town',
    desc: "Deuxième cité des Îles d'Ibben, centre de traitement des carcasses de baleines." },
  { id: 'e3-new-ibish', nom: 'New Ibish', x: 1845, y: 498, regionId: 'ib', level: 2, type: 'town',
    desc: "Ville fondée par des colons ibbenois sur une île plus méridionale." },

  // ══ QARTH ══
  { id: 'e3-quarkash', nom: 'Qarth', x: 1947, y: 1318, regionId: 'quarkash', level: 1, type: 'capital',
    desc: "La 'plus grande cité du monde', contrôlant le détroit du même nom. Daenerys y trouva surtout trahison." },
  { id: 'e3-qai', nom: 'Qai', x: 1975, y: 1385, regionId: 'quarkash', level: 2, type: 'town',
    desc: "Ville côtière à proximité de Qarth, sur les routes de la Mer des Épices." },
  { id: 'e3-vaes-orvik', nom: 'Vaes Orvik', x: 1800, y: 1313, regionId: 'quarkash', level: 2, type: 'landmark',
    desc: "Camp Dothraki dans les steppes à l'ouest de Qarth." },
  { id: 'e3-port-yhos', nom: 'Port Yhos', x: 1795, y: 1355, regionId: 'quarkash', level: 2, type: 'town',
    desc: "Port de commerce sur la côte méridionale d'Essos." },
  { id: 'e3-vaes-shirosi', nom: 'Vaes Shirosi', x: 1850, y: 1300, regionId: 'quarkash', level: 2, type: 'landmark',
    desc: "Camp Dothraki dans les plaines à l'ouest de Qarth." },
  { id: 'e3-vaes-tolorro', nom: 'Vaes Tolorro', x: 1891, y: 1245, regionId: 'quarkash', level: 2, type: 'landmark',
    desc: "Site Dothraki dans les terres sèches aux abords de Qarth." },
  { id: 'e3-vaes-qosar', nom: 'Vaes Qosar', x: 1981, y: 1306, regionId: 'quarkash', level: 2, type: 'landmark',
    desc: "Camp Dothraki à l'extrémité orientale du monde connu." },

  // ══ GRANDE MORAQ ══
  { id: 'e3-faros', nom: 'Faros', x: 1917, y: 1440, regionId: 'great-moraq', level: 2, type: 'town',
    desc: "Ville côtière sur la rive de la Mer des Épices, au sud de Qarth." },
]
