// ─── Catégories de filtre ─────────────────────────────────────────────────────
export const CATEGORIES = [
  { id: 'toutes',     label: 'Toutes les Époques', icon: '✦' },
  { id: 'primordiale', label: 'Ère Primordiale',    icon: '🌑' },
  { id: 'targaryen',  label: 'Dynasties Targaryen', icon: '🐉' },
  { id: 'got',        label: 'Le Jeu des Trônes',   icon: '👑' },
]

// ─── Données des 19 époques ───────────────────────────────────────────────────
export const EPOQUES = [

  // ══════════════════════════════════════════════════════
  //  ÈRE PRIMORDIALE
  // ══════════════════════════════════════════════════════
  {
    id: 'ere-aube',
    categorie: 'primordiale',
    tag: 'ORIGINES',
    annee: '~12 000 AC',
    titre: "L'Ère de l'Aube",
    sousTitre: "Les Enfants de la Forêt & les Premiers Hommes",
    accent: '#4a8ab0',
    border: 'rgba(74,138,176,0.25)',
    resume: "Avant les hommes, Westeros appartenait aux Enfants de la Forêt. Les Premiers Hommes traversèrent d'Essos et se battirent contre eux pendant des siècles, jusqu'au Pacte.",
    images: [
      '/History/Hero-Aube-age/pre-dawn-age-spoilers-extended-v0-9efoctvch8cz.jpg',
      '/History/Hero-Aube-age/Childrenoftheforest.jpg',
      '/History/Hero-Aube-age/AgeOfHeroes.jpg',
      '/History/Hero-Aube-age/ThePact.jpg',
      "/History/Hero-Aube-age/Enfants.F_vs_P.Hommes_26_Traditions29.jpg",
    ],
    description: `Avant que les hommes ne mettent le pied sur Westeros, le continent appartenait aux Enfants de la Forêt — de petits êtres mystérieux maîtrisant des magies oubliées, sculptant leurs visages dans les arbres cœurs et communiant avec la nature depuis des millénaires. Ils n'étaient pas seuls : les géants peuplaient également les terres du Nord.

Puis vinrent les Premiers Hommes depuis l'Essos, traversant un bras terrestre aujourd'hui englouti, apportant leurs armes de bronze et leur soif de terres nouvelles. La guerre entre les deux peuples dura des siècles, jusqu'au Pacte — accord de paix conclu sur une île du Lac des Dieux. Les Premiers Hommes adoptèrent progressivement les dieux et les traditions des Enfants de la Forêt, plantant les graines d'une civilisation commune.`,
    evenements: [
      "Les Enfants de la Forêt peuplent Westeros depuis des millénaires",
      "Arrivée des Premiers Hommes depuis l'Essos via le Bras de Dorne",
      "Guerre entre Premiers Hommes et Enfants de la Forêt — des siècles de conflits",
      "Le Pacte : accord de paix sur l'île des Dieux, partage du territoire",
      "Les Premiers Hommes adoptent les Vieux Dieux et leurs traditions",
    ],
  },

  {
    id: 'longue-nuit',
    categorie: 'primordiale',
    tag: 'LA GRANDE MENACE',
    annee: '~8 000 AC',
    titre: 'La Longue Nuit',
    sousTitre: "Les Marcheurs Blancs & la Naissance du Mur",
    accent: '#b0c8d8',
    border: 'rgba(176,200,216,0.2)',
    resume: "Une nuit sans fin et les Marcheurs Blancs faillirent anéantir tout ce qui vivait. Le Mur fut érigé pour graver cette leçon dans la pierre — et dans la glace.",
    images: [
      '/History/Hero-Aube-age/AgeOfHeroes.jpg',
      '/History/Hero-Aube-age/Bran_et_le_Mur.jpg',
      "/History/Hero-Aube-age/Enfants.F_vs_P.Hommes_26_Traditions29.jpg",
    ],
    description: `Il y a environ huit mille ans, une nuit sans fin s'abattit sur Westeros. Le froid fut si intense que les rivières gelèrent et les récoltes périrent. C'est alors que les Marcheurs Blancs vinrent du Grand Nord pour la première fois, commandant les armées des morts et portant un froid absolu devant eux.

L'Âge des Héros vit naître des figures légendaires : l'Azor Ahai, héros mythique qui forgea l'épée de lumière Illumination dans le cœur de son épouse bien-aimée pour repousser les ténèbres, et Bran le Bâtisseur, qui érigea le Mur de glace — trois cents lieues de long, trois cents pieds de haut — pour séparer les vivants des morts. La Garde de Nuit fut fondée pour veiller sur cette frontière pour l'éternité.`,
    evenements: [
      "La Longue Nuit : un hiver qui dura une génération entière",
      "Première grande invasion des Marcheurs Blancs depuis le Grand Nord",
      "L'Azor Ahai forge Illumination et repousse les ténèbres",
      "Bran le Bâtisseur érige le Mur de glace (300 lieues de long)",
      "Fondation de la Garde de Nuit — 9 999 hommes pour veiller sur le Mur",
    ],
  },

  // ══════════════════════════════════════════════════════
  //  DYNASTIES TARGARYEN
  // ══════════════════════════════════════════════════════
  {
    id: 'conquete-targaryen',
    categorie: 'targaryen',
    tag: 'FEU ET SANG',
    annee: '2 AC',
    titre: "La Conquête d'Aegon",
    sousTitre: "Aegon Targaryen & ses Trois Dragons",
    accent: '#c0392b',
    border: 'rgba(192,57,43,0.25)',
    resume: "Aegon Targaryen et ses trois dragons soumirent six des sept royaumes de Westeros, forgeant le Trône de Fer avec les épées de ses ennemis.",
    images: [
      "/History/La Conquête des Targaryen (Aegon Ier)/aegon-s-conquest-1024x405.jpg",
      "/History/La Conquête des Targaryen (Aegon Ier)/the-inspiration-of-aegon-i-the-conqueror-v0-01rd13j38cad1.jpg",
      "/History/La Conquête des Targaryen (Aegon Ier)/gamethronesmovie_4869133b.jpg",
      "/History/La Conquête des Targaryen (Aegon Ier)/images.jpg",
    ],
    description: `Aegon Targaryen, dit le Conquérant, débarqua sur la côte orientale de Westeros avec ses sœurs-épouses Visenya et Rhaenys, et leurs trois dragons : Balerion le Terreur Noire, Vhagar et Meraxes. Ce que sept royaumes avaient refusé de faire volontairement, les dragons les y contraignirent.

Le Champ du Feu fut la bataille décisive : soixante mille soldats alliés contre trois dragons. Balerion seul consuma plus de quatre mille hommes en quelques minutes. La plupart des rois se soumirent. Dorne résista seul — la seule région jamais vraiment conquise. Aegon fit fondre mille épées ennemies pour forger le Trône de Fer.`,
    evenements: [
      "Débarquement d'Aegon à l'embouchure de la Blackwater",
      "Le Champ du Feu : victoire écrasante grâce aux trois dragons",
      "Soumission de six des sept royaumes en deux ans",
      "Dorne résiste — seule région jamais vraiment conquise",
      "Forgerie du Trône de Fer avec mille épées des vaincus",
      "Aegon Ier couronné premier roi des Sept Royaumes",
    ],
  },

  {
    id: 'maegor',
    categorie: 'targaryen',
    tag: 'LE RÈGNE DE SANG',
    annee: '42–48 AC',
    titre: 'Maegor le Cruel',
    sousTitre: "La Guerre de la Foi & la Tyrannie",
    accent: '#8b2020',
    border: 'rgba(139,32,32,0.25)',
    resume: "Le plus impitoyable des rois Targaryen écrasa la révolte de la Foi Militante dans un bain de sang. Il s'assit sur un Trône qui finit par le tuer.",
    images: [
      '/History/Maegor/350px-MAEGOR_I.jpg',
      '/History/Maegor/Faith_Militant_Army.jpg',
      '/History/Maegor/harrenhall.jpg',
      '/History/Maegor/400px-Maegor_I_Targaryen_by_ildraws.jpg',
      '/History/Maegor/300px-Maegor_trial_of_seven_victorious.jpg',
    ],
    description: `Maegor Targaryen, troisième fils d'Aegon le Conquérant, s'empara du trône par la force après avoir tué son propre neveu lors d'un Jugement des Sept. Son règne, marqué par une brutalité sans équivalent, fut dominé par la guerre contre la Foi Militante — une armée de fanatiques religieux qui refusait l'autorité des dragons.

Maegor répondit à chaque révolte par des massacres, des exécutions et l'incendie de temples. On dit qu'il mourut sur le Trône de Fer lui-même, retrouvé saignant de mille petites coupures des lames qui le composent — comme si le Trône avait jugé qu'il était lui aussi indigne.`,
    evenements: [
      "Maegor s'empare du trône en tuant son neveu lors d'un Jugement des Sept",
      "Début de la guerre contre la Foi Militante (les Pauvres Compagnons et les Fils du Guerrier)",
      "Siège et destruction de la Grande Septa de Remembrance",
      "Maegor brûle et massacre les bastions de la Foi dans tout Westeros",
      "Mort de Maegor sur le Trône de Fer — probablement assassiné",
    ],
  },

  {
    id: 'jaehaerys',
    categorie: 'targaryen',
    tag: 'L\'ÂGE D\'OR',
    annee: '48–103 AC',
    titre: 'Jaehaerys Ier le Conciliateur',
    sousTitre: "Le Plus Long Règne de la Dynastié",
    accent: '#6a90c0',
    border: 'rgba(106,144,192,0.25)',
    resume: "Le plus long règne de toute la dynastie Targaryen. Jaehaerys et sa reine Alysanne modernisèrent Westeros et apportèrent une paix durable de cinquante-cinq ans.",
    images: [
      '/History/Jaehaerys/Jaehaerys_Targaryen_S2.jpg',
      '/History/Jaehaerys/350px-Jaehaerys&Alysanne.jpg',
      '/History/Jaehaerys/101_Jaehaerys.jpg',
      '/History/Jaehaerys/l-intro-1663704399.jpg',
      '/History/Jaehaerys/350px-Alysanne_Targaryen_by_ildraws.jpg',
    ],
    description: `Jaehaerys Ier Targaryen régna cinquante-cinq ans, le plus long règne de toute la dynastié. Avec sa reine bien-aimée Alysanne, dit la Bonne Reine, il transforma Westeros : les Routes Royales furent construites, le droit commun unifié, et un accord durable fut conclu avec la Foi des Sept.

Mais la tragédie privée assombrit son règne : presque tous ses enfants moururent avant lui. La question de sa succession divisa le Conseil et, lors du Grand Conseil de 101 AC, les seigneurs choisirent son petit-fils Viserys plutôt que sa petite-fille Rhaenys — une décision qui planterait les graines de la Danse des Dragons.`,
    evenements: [
      "Couronnement de Jaehaerys à 14 ans — il régne 55 ans",
      "Accord avec la Foi des Sept : fin de la guerre de la Foi",
      "Construction des Routes Royales dans tout Westeros",
      "La Bonne Reine Alysanne visite le Mur et double les terres de la Garde de Nuit",
      "Grand Conseil de 101 AC : Viserys I choisi comme successeur",
    ],
  },

  {
    id: 'danse-des-dragons',
    categorie: 'targaryen',
    tag: 'GUERRE CIVILE',
    annee: '129–131 AC',
    titre: 'La Danse des Dragons',
    sousTitre: "Rhaenyra vs Aegon II — La Fin des Dragons",
    accent: '#c04020',
    border: 'rgba(192,64,32,0.25)',
    resume: "La guerre civile des Targaryen qui tua presque tous leurs dragons. Rhaenyra contre Aegon II — une guerre fratricide dont Westeros ne se remit jamais vraiment.",
    images: [
      '/History/Danse-des-Dragons/queen-rhaenyra-targaryen-33fd5c4-e1718804644175.jpg',
      '/History/Danse-des-Dragons/Aegon_II_Targaryen_-_Tom_Glynn-Carney.jpg',
      '/History/Danse-des-Dragons/vhagar-arrax-7296832.jpg',
      '/History/Danse-des-Dragons/battle-above-the-gods-eye-by-naomimakesart-v0-y9cGinmoLxb223rqicke2oQwnqmLusEWucLhBktogZw.jpg',
      '/History/Danse-des-Dragons/The_Last_Dance_of_the_Dragons.jpg',
      '/History/Danse-des-Dragons/milly-alcock_0.jpg',
    ],
    description: `Viserys Ier avait désigné sa fille Rhaenyra comme héritière, mais à sa mort en 129 AC, son fils Aegon II fut couronné par la faction des "Verts" (les Hightower). Rhaenyra et ses alliés, les "Noirs", refusèrent de reconnaître ce couronnement. La guerre civile qui s'ensuivit — la Danse des Dragons — fut la plus dévastatrice de l'histoire Targaryen.

Dragons contre dragons : en deux ans, presque tous furent tués. La Bataille au-dessus de l'Œil des Dieux vit deux grands dragons s'entredévorer. Lucerys Velaryon et son jeune dragon furent tués par Aemond et Vhagar. Rhaenyra elle-même finit dévorée par le dragon d'Aegon II. Quand la guerre se termina, l'ère des dragons était pratiquement terminée.`,
    evenements: [
      "Mort de Viserys Ier — Aegon II couronné contre la volonté du défunt roi",
      "Rhaenyra prend Port-Réal — règne brièvement en tant que reine",
      "Mort de Lucerys et Arrax tués par Aemond et Vhagar au-dessus de la baie",
      "Bataille au-dessus de l'Œil des Dieux : Daemon Targaryen et Aemond s'entre-tuent",
      "Rhaenyra capturée — dévorée par le dragon Sunfyre d'Aegon II",
      "Mort d'Aegon II — le dernier dragon viable meurt quelques années plus tard",
    ],
  },

  {
    id: 'aegon-indigne',
    categorie: 'targaryen',
    tag: 'DÉCADENCE',
    annee: '172–184 AC',
    titre: 'Aegon IV l\'Indigne',
    sousTitre: "Le Pire Roi Targaryen & les Graines des Guerres Civiles",
    accent: '#906030',
    border: 'rgba(144,96,48,0.25)',
    resume: "Le pire roi Targaryen. Sa décision de légitimer tous ses bâtards sur son lit de mort planta les graines des guerres civiles qui ravagèrent Westeros pendant des décennies.",
    images: [
      '/History/Aegon-Indigne/Aegon-IV-S8.jpg',
      '/History/Aegon-Indigne/400px-The_Seeds_of_the_Blackfyre_Rebellion_by_Jota_Saraiva.jpg',
      '/History/Aegon-Indigne/dark-sister-the-valyrian-steel-sword-wielded-by-daemon-v0-iouztkgbd2s71.jpg',
      '/History/Aegon-Indigne/AEGON_IV.jpg',
    ],
    description: `Aegon IV Targaryen régna douze ans et laissa un souvenir d'incompétence, de débauche et d'injustice. Il favorisa ouvertement ses maîtresses et leurs enfants illégitimes, humiliant sa reine légitime Naerys à la cour. Il mena des guerres inutiles et gaspilla le trésor royal.

Sur son lit de mort, dans un ultime acte d'irresponsabilité, il légitima tous ses nombreux bâtards par une déclaration royale. Cette décision donna à Daemon Blackfyre et à ses descendants la possibilité légale de revendiquer le Trône de Fer — et ils ne se privèrent pas de le faire pendant les soixante années suivantes.`,
    evenements: [
      "Aegon IV dilapide le trésor royal en guerres vaines et dépenses somptuaires",
      "Humiliation répétée de la reine Naerys à la cour royale",
      "Daemon Blackfyre reçoit l'épée ancestrale Feu Noir (Blackfyre)",
      "Sur son lit de mort : légitimation de tous ses bâtards",
      "Cette décision engendre cinq guerres civiles au cours du siècle suivant",
    ],
  },

  {
    id: 'rebellions-blackfyre',
    categorie: 'targaryen',
    tag: 'CINQ GUERRES',
    annee: '195–260 AC',
    titre: 'Les Rébellions Blackfyre',
    sousTitre: "Soixante-cinq Ans de Guerres Civiles",
    accent: '#7a4020',
    border: 'rgba(122,64,32,0.25)',
    resume: "Cinq rébellions en soixante-cinq ans. Les descendants bâtards d'Aegon IV revendiquèrent le Trône de Fer à plusieurs reprises, saignant Westeros à blanc.",
    images: [
      '/History/Rebellions-Blackfyre/Daemon_Blackfyre.jpg',
      '/History/Rebellions-Blackfyre/Battle_of_the_Redgrass_Field.jpg',
      '/History/Rebellions-Blackfyre/400px-The_Redgrass_Field_by_Jota_Saraiva.jpg',
      '/History/Rebellions-Blackfyre/Bloodraven-1000x600.jpg',
      '/History/Rebellions-Blackfyre/screenhub-gameofthrones-theblackfyrerebellion.jpg',
    ],
    description: `Daemon Blackfyre, bâtard légitimé d'Aegon IV et porteur de l'épée Feu Noir, lança la première rébellion en 195 AC. Bien que charismatique et grand guerrier, il fut tué à la Bataille du Champ de la Ronce Rouge par les flèches de Brynden Rivers dit Corbeau-Sang. Ce ne fut que la première de cinq tentatives.

Pendant soixante-cinq ans, les Blackfyre et leurs alliés tentèrent de prendre le Trône par les armes, souvent soutenus par des puissances étrangères comme la Compagnie de la Rose d'Or (fondée par les exilés Blackfyre). La cinquième rébellion — la Guerre des Neuf Sous — se termina en 260 AC avec la mort du dernier prétendant mâle Blackfyre.`,
    evenements: [
      "1re Rébellion (195 AC) : Daemon Blackfyre tué à la Bataille du Champ de la Ronce Rouge",
      "2e Rébellion (212 AC) : écrasée rapidement",
      "3e Rébellion (219 AC) : également mise en échec",
      "4e Rébellion (236 AC) : échec similaire",
      "Fondation de la Compagnie de la Rose d'Or par les exilés Blackfyre",
      "5e Rébellion / Guerre des Neuf Sous (260 AC) : dernier prétendant mâle Blackfyre tué",
    ],
  },

  {
    id: 'roi-fou',
    categorie: 'targaryen',
    tag: 'LA FOLIE',
    annee: '262–283 AC',
    titre: 'Le Règne du Roi Fou',
    sousTitre: "Aerys II Targaryen & la Décadence de la Couronne",
    accent: '#b03020',
    border: 'rgba(176,48,32,0.25)',
    resume: "Le règne d'Aerys II Targaryen commença par des espoirs et finit dans la folie, la paranoïa et des actes qui allumèrent une révolution irréversible.",
    images: [
      '/History/Roi-Fou/AERYS_II.jpg',
      '/History/Roi-Fou/500px-Aerys_twoiaf.jpg',
      '/History/Roi-Fou/350px-Tywin_and_Aerys.jpg',
      '/History/Roi-Fou/mad-king-aerys.jpg',
      '/History/Roi-Fou/1466683466-aerys.jpg',
    ],
    description: `Aerys II Targaryen monta sur le Trône en 262 AC avec Tywin Lannister comme Main — l'une des combinaisons les plus efficaces de l'histoire. Pendant dix ans, Westeros prospéra. Puis la jalousie d'Aerys envers la compétence de Tywin, combinée à la traumatisante captivité de Duskendale (270 AC), le fit basculer dans une paranoïa grandissante.

Les ordres d'exécution se multiplièrent, souvent accompagnés de sa phrase préférée : "Brûlez-les tous." Ses soupçons s'étendirent à son propre fils Rhaegar, à ses lords, à ses servants. Tywin finit par démissionner. Quand Brandon Stark vint réclamer justice à Port-Réal, Aerys le fit saisir et exécuter avec son père — l'étincelle qui embrasa toute la Couronne.`,
    evenements: [
      "Couronnement d'Aerys II — Tywin Lannister nommé Main du Roi",
      "Défiance de Duskendale (270 AC) : Aerys capturé, ressort profondément brisé",
      "La folie s'intensifie — exécutions par le feu de plus en plus fréquentes",
      "Tywin Lannister démissionne de la Main du Roi",
      "Exécution de Brandon et Rickard Stark — la révolte s'embrase",
      "Jaime Lannister assassine Aerys pour éviter la destruction de Port-Réal",
    ],
  },

  {
    id: 'tournoi-harrenhal',
    categorie: 'targaryen',
    tag: 'LE TOURNANT',
    annee: '281 AC',
    titre: 'Le Grand Tournoi de Harrenhal',
    sousTitre: "Rhaegar, Lyanna & le Geste qui Changea l'Histoire",
    accent: '#907040',
    border: 'rgba(144,112,64,0.25)',
    resume: "Au plus grand tournoi jamais organisé, Rhaegar Targaryen couronna Lyanna Stark reine d'amour et de beauté — ignorant son propre épouse. Un geste qui déclencha la fin de sa maison.",
    images: [
      '/History/Tournoi-Harrenhal/The_Great_Tourney_of_Harrenhal.jpg',
      '/History/Tournoi-Harrenhal/550px-PPRhaegarHarrenhalTourney.jpg',
      '/History/Tournoi-Harrenhal/Rhaegar_and_lyanna_s7_finale_3.jpg',
      '/History/Tournoi-Harrenhal/Lyanna_S7_E7.jpg',
      '/History/Tournoi-Harrenhal/tower-of-joy.jpg',
    ],
    description: `En 281 AC, Lord Walter Whent organisa à Harrenhal le plus grand tournoi que Westeros ait jamais vu. Les plus grands chevaliers de tous les royaumes y participèrent. Rhaegar Targaryen, le prince héritier, l'emporta — mais au lieu de couronner sa propre épouse Elia Martell comme reine d'amour et de beauté, il déposa la couronne de roses d'hiver sur les genoux de Lyanna Stark, fiancée à Robert Baratheon.

Ce geste scandaleux fut le début de tout. Quelques mois plus tard, Rhaegar et Lyanna disparurent ensemble — volontairement ou non. Cette disparition déclencha la Rébellion de Robert, la chute de la maison Targaryen, et un secret qui ne serait révélé que des décennies plus tard.`,
    evenements: [
      "Le plus grand tournoi de l'histoire de Westeros — organisé à Harrenhal",
      "Rhaegar Targaryen remporte le tournoi",
      "Rhaegar couronne Lyanna Stark — et non sa femme Elia Martell",
      "Scandale : Lyanna était fiancée à Robert Baratheon",
      "Lyanna et Rhaegar fuient ensemble (enlèvement ou amour ?) à la Tour de la Joie",
      "Ce secret — la vraie naissance de Jon Snow — ne sera révélé que 17 ans plus tard",
    ],
  },

  {
    id: 'rebellion-robert',
    categorie: 'targaryen',
    tag: 'RÉVOLTE',
    annee: '282–283 AC',
    titre: 'La Rébellion de Robert',
    sousTitre: "La Chute de la Maison Targaryen",
    accent: '#8a6030',
    border: 'rgba(138,96,48,0.25)',
    resume: "Robert Baratheon, Eddard Stark et leurs alliés renversèrent les Targaryen. Une révolution bâtie sur l'honneur et l'amour, qui donna naissance à un nouveau pouvoir plus fragile qu'il n'y paraissait.",
    images: [
      "/History/Robert's Rebellion/1200px-Roberts_Rebellion.jpg",
      "/History/Robert's Rebellion/350px-Twoiaf_battle_of_the_trident.jpg",
      '/History/Hero-Aube-age/Net_et_Robert_entrent_en_r3Fbellion.jpg',
      "/History/Robert's Rebellion/40bc907bf080bf414d59d6872638605d.jpg",
    ],
    description: `Tout commença avec les exécutions de Brandon et Rickard Stark par Aerys II. Robert Baratheon, Eddard Stark, Jon Arryn et leurs alliés se soulevèrent contre le Trône de Fer. La guerre dura un an, culminant à la Bataille du Trident où Robert tua Rhaegar de sa propre main.

Peu après, Jaime Lannister — Chevalier de la Garde Royale, censé protéger le roi — poignarda Aerys dans le dos pour éviter la destruction de Port-Réal par le feu sauvage. Il gagna à jamais le surnom de "Régicide". Eddard Stark trouva sa sœur Lyanna mourante à la Tour de la Joie, accouchant d'un fils secret qu'il élèverait comme le sien : Jon Snow.`,
    evenements: [
      "Exécutions de Brandon et Rickard Stark — la révolte s'embrase",
      "Soulèvement de Robert Baratheon, Ned Stark et Jon Arryn",
      "Bataille du Trident : Robert tue Rhaegar de sa main",
      "Jaime Lannister assassine Aerys II — il devient le Régicide",
      "Ned Stark trouve Lyanna mourante à la Tour de la Joie",
      "Naissance secrète de Jon Snow (Aegon Targaryen) — confié à Ned",
      "Robert Baratheon monte sur le Trône de Fer",
    ],
  },

  // ══════════════════════════════════════════════════════
  //  LE JEU DES TRÔNES
  // ══════════════════════════════════════════════════════
  {
    id: 'saison-1',
    categorie: 'got',
    tag: 'SAISON 1',
    annee: '298 AC',
    titre: 'Le Début du Chaos',
    sousTitre: "La Mort de Jon Arryn & la Chute des Stark",
    accent: '#8fafc4',
    border: 'rgba(143,175,196,0.2)',
    resume: "Ned Stark descend à Port-Réal et découvre une vérité qui le condamne. La mort d'un homme d'honneur dans un monde de trahisons change tout.",
    images: [
      '/History/Saison/Saison 1/gots1-1.jpg',
      '/History/Saison/Saison 1/Winter_is_coming_1x01_29.jpg',
      '/History/Saison/Saison 1/images.jpg',
      '/History/Saison/Saison 1/ee96f4ef6b3941ddbab6e35b98a71a73.jpg',
    ],
    description: `La mort mystérieuse de Jon Arryn, Main du Roi, pousse Robert Baratheon à recruter son vieil ami Eddard Stark pour le remplacer. Ned, homme d'honneur, accepte à contrecœur et descend à Port-Réal avec ses filles. Ce qu'il y découvre — la vérité sur la naissance des enfants de Cersei — le condamne.

La saison se clôt par deux chocs : l'exécution d'Eddard Stark sur les marches de la Grande Septa de Baelor, trahie par Cersei et Joffrey, et la naissance des trois dragons de Daenerys des cendres du bûcher funéraire de Khal Drogo.`,
    evenements: [
      "Ned Stark nommé Main du Roi à Port-Réal",
      "Découverte de l'inceste Cersei-Jaime et de la vraie paternité de Joffrey",
      "Bran Stark défenestré par Jaime Lannister — paralysé à vie",
      "Jon Snow rejoint la Garde de Nuit au Mur",
      "Daenerys épouse Khal Drogo — reçoit trois œufs de dragon",
      "Exécution d'Eddard Stark — trahison de Cersei et Joffrey",
      "Naissance des trois dragons de Daenerys",
    ],
  },

  {
    id: 'saison-2',
    categorie: 'got',
    tag: 'SAISON 2',
    annee: '298–299 AC',
    titre: 'La Guerre des Cinq Rois',
    sousTitre: "Le Continent se Déchire en Factions",
    accent: '#c9a84c',
    border: 'rgba(201,168,76,0.2)',
    resume: "Cinq prétendants au trône s'affrontent simultanément. Robb Stark enchaîne les victoires mais sa rupture de promesse annonce sa perte.",
    images: [
      '/History/Saison/Saison 2/The_Ghost_of_Harrenhal_2x05_29.jpg',
      '/History/Saison/Saison 2/images.jpg',
      '/History/Saison/Saison 2/bab1b01d91ca4d7a88c0d7e40570cdb5.jpg',
    ],
    description: `Cinq prétendants s'affrontent : Joffrey à Port-Réal, Robb Stark pour l'indépendance du Nord, Stannis et Renly Baratheon pour la Couronne, et Balon Greyjoy qui envahit le Nord. Theon Greyjoy trahit les Stark et prend Winterfell, avant de perdre le contrôle.

La Bataille de la Blackwater voit Stannis défait par le feu grégeois de Tyrion et l'arrivée des forces Lannister-Tyrell. Port-Réal est sauvée. Mais Robb Stark a rompu sa promesse aux Frey — une erreur qu'il paiera très cher.`,
    evenements: [
      "Robb Stark proclamé Roi du Nord et des Fleuves",
      "Theon Greyjoy trahit les Stark et prend Winterfell",
      "Bataille de la Blackwater : Stannis Baratheon défait par Tyrion",
      "L'alliance Lannister-Tyrell sauve Port-Réal",
      "Robb Stark épouse Talisa — rompant sa promesse aux Frey",
      "Daenerys récupère ses dragons à Qarth",
    ],
  },

  {
    id: 'saison-3',
    categorie: 'got',
    tag: 'SAISON 3',
    annee: '299 AC',
    titre: 'Les Noces Pourpres',
    sousTitre: "La Trahison la Plus Noire de Westeros",
    accent: '#8b1a1a',
    border: 'rgba(139,26,26,0.25)',
    resume: "Le massacre des Noces Pourpres brise la rébellion du Nord en une nuit. Le monde entier retient son souffle.",
    images: [
      '/History/Saison/Saison 3/The_Rains_of_Castamere_3x09_29.jpg',
      '/History/Saison/Saison 3/Robb.jpg',
      '/History/Saison/Saison 3/kakz9hck4rqa1.jpg',
      '/History/Saison/Saison 3/sandor-clegane-arya-stark-game-of-thrones.jpg',
    ],
    description: `Les Noces Pourpres. Robb Stark, cherchant à réparer sa rupture de promesse, envoie son oncle Edmure Tully épouser une Frey aux Jumeaux. La réception semble se passer bien — jusqu'à ce que la musique des Pluies de Castamere commence à jouer.

Walder Frey et Roose Bolton avaient secrètement traité avec les Lannister. En quelques minutes, Robb, sa mère Catelyn, son épouse Talisa (enceinte) et la quasi-totalité de l'armée du Nord sont massacrés. La rébellion du Nord est brisée. C'est le moment le plus traumatisant de toute la série.`,
    evenements: [
      "Jaime Lannister perd sa main droite",
      "Daenerys libère les esclaves de l'Astapor",
      "Jon Snow infiltre les Sauvageons par-dessus le Mur",
      "Les Noces Pourpres : massacre des Stark aux Jumeaux",
      "Mort de Robb Stark, Catelyn Tully, Talisa et l'armée du Nord",
      "La rébellion du Nord est définitivement brisée",
    ],
  },

  {
    id: 'saison-4',
    categorie: 'got',
    tag: 'SAISON 4',
    annee: '300 AC',
    titre: 'La Chute du Roi Joffrey',
    sousTitre: "Justice, Trahisons & la Fuite de Tyrion",
    accent: '#c9a84c',
    border: 'rgba(201,168,76,0.2)',
    resume: "Joffrey est empoisonné lors de ses propres noces. Tyrion, accusé, est jugé dans un procès d'une injustice absolue. Quand il tue son père, tout bascule.",
    images: [
      '/History/Saison/Saison 4/GOTS4-2.jpg',
      '/History/Saison/Saison 4/brienne-vs-the-hound-propre.jpg',
      '/History/Saison/Saison 4/GOTS4-4.jpg',
      '/History/Saison/Saison 4/maxresdefault.jpg',
    ],
    description: `Le mariage de Joffrey et Margaery Tyrell se termine en catastrophe : le roi est empoisonné lors du festin. Tyrion Lannister est désigné comme coupable et jugé dans un procès qui se transforme en règlement de comptes personnel. Lors du duel judiciaire, son champion Oberyn Martell meurt et Tyrion est condamné.

Mais Jaime le libère. Tyrion, avant de fuir, tuera son père Tywin dans les latrines du Donjon Rouge — le plus puissant homme de Westeros, tué de la façon la plus humiliante. Le pouvoir Lannister ne sera plus jamais ce qu'il était.`,
    evenements: [
      "Empoisonnement du roi Joffrey Baratheon lors de ses noces",
      "Procès de Tyrion Lannister pour régicide",
      "La Vipère Rouge Oberyn Martell meurt lors du duel judiciaire",
      "Tyrion condamné à mort — libéré par Jaime",
      "Tyrion tue Tywin Lannister dans les latrines",
      "Daenerys règne sur Meereen — choisit de gouverner avant de conquérir",
      "Jon Snow et la Garde de Nuit défendent le Mur contre les Sauvageons",
    ],
  },

  {
    id: 'saison-5',
    categorie: 'got',
    tag: 'SAISON 5',
    annee: '300 AC',
    titre: "La Montée du Roi de la Nuit",
    sousTitre: "Hardhome & la Mort de Jon Snow",
    accent: '#6090b0',
    border: 'rgba(96,144,176,0.2)',
    resume: "Jon Snow comprend à Hardhome l'ampleur de la menace des morts. Le vouloir allier la Garde de Nuit aux Sauvageons lui coûtera la vie.",
    images: [
      '/History/Saison/Saison 5/ob_9b78fa_hardhome-arrives.jpg',
      '/History/Saison/Saison 5/images.jpg',
      '/History/Saison/Saison 5/melisandre.jpg',
    ],
    description: `La saison 5 marque un tournant. À Hardhome, Jon Snow assiste à la résurrection massive des morts par le Roi de la Nuit et comprend l'ampleur de la menace. Son choix d'allier la Garde de Nuit aux Sauvageons face à cet ennemi commun lui vaut d'être poignardé par ses propres frères d'armes — "Pour la Garde de Nuit."

À Port-Réal, la montée en puissance de la Foi Militante emprisonne Cersei. Arya rejoint la Maison du Noir et du Blanc à Braavos. Stannis brûle sa propre fille Shireen en sacrifice — un acte qui ne lui apporte rien.`,
    evenements: [
      "Massacre de Hardhome : le Roi de la Nuit lève une armée de morts sous nos yeux",
      "Jon Snow assassiné par mutinerie de la Garde de Nuit",
      "Stannis Baratheon brûle sa fille Shireen en sacrifice",
      "Cersei emprisonnée par la Foi Militante",
      "Arya commence son apprentissage à la Maison du Noir et du Blanc",
      "Daenerys s'envole sur Drogon depuis l'arène de Meereen",
    ],
  },

  {
    id: 'saison-6',
    categorie: 'got',
    tag: 'SAISON 6',
    annee: '300–301 AC',
    titre: 'La Bataille des Bâtards',
    sousTitre: "Résurrection, Vengeance & Explosion Verte",
    accent: '#c9a84c',
    border: 'rgba(201,168,76,0.2)',
    resume: "Jon Snow est ressuscité. Bran découvre la vraie naissance de Jon. La Bataille des Bâtards reprend Winterfell. Cersei détruit ses ennemis dans une explosion de feu sauvage.",
    images: [
      '/History/Saison/Saison 6/battle-of-the-bastards-GoT.jpg',
      '/History/Saison/Saison 6/jon-snow-game-of-thrones.jpg',
      '/History/Saison/Saison 6/gots6-1.jpg',
      '/History/Saison/Saison 6/Game-Of-Thrones-les-femmes-au-pouvoir-dans-le-dernier-episode-de-la-saison-6.jpg',
    ],
    description: `Jon Snow est ressuscité par Mélisandre. Bran, dans ses visions, découvre la vérité : Jon est né de Lyanna Stark et Rhaegar Targaryen — légitime héritier du Trône de Fer. La Bataille des Bâtards voit Jon reprendre Winterfell à Ramsay Bolton grâce à l'intervention de Sansa et des Chevaliers du Val.

À Port-Réal, Cersei orchestre l'explosion de l'Échiquier Vert au feu sauvage, tuant la Foi Militante, les Tyrell et des milliers d'innocents. Son fils Tommen, désespéré par la mort de Margaery, se jette d'une fenêtre. Cersei s'autoproclame reine.`,
    evenements: [
      "Jon Snow ressuscité par Mélisandre",
      "Hodor révèle l'origine de son nom — sacrifice temporel de Bran",
      "Daenerys brûle les khals dothraki et prend leur commandement",
      "Bataille des Bâtards : reprise de Winterfell, mort de Ramsay Bolton",
      "Cersei fait exploser l'Échiquier Vert — des milliers de morts",
      "Cersei Lannister couronnée Reine des Sept Royaumes",
    ],
  },

  {
    id: 'saison-7',
    categorie: 'got',
    tag: 'SAISON 7',
    annee: '303 AC',
    titre: 'La Convergence du Feu et de la Glace',
    sousTitre: "Daenerys débarque enfin à Westeros",
    accent: '#c0392b',
    border: 'rgba(192,57,43,0.2)',
    resume: "Daenerys débarque enfin. Jon et elle s'allient. Mais la mission au-delà du Mur coûte un dragon — et le Mur tombe.",
    images: [
      '/History/Saison/Saison 7/game-of-thrones-loot-train.jpg',
      '/History/Saison/Saison 7/1262382-daenerys-et-ses-allies-sur-la-plage-de-peyredragon.jpg',
      '/History/Saison/Saison 7/viserion-7592.jpg',
      '/History/Saison/Saison 7/bataille-lac-game-of-thrones-s7-episode-6.max-2000x2000.jpg',
    ],
    description: `Daenerys débarque à Westeros avec ses dragons, son armée Dothraki et les Immaculés. Elle remporte la Bataille du Pillage contre les Lannister mais refuse de brûler Port-Réal. Jon Snow, Roi du Nord, arrive à Peyredragon pour chercher du dragon-glass.

La mission au-delà du Mur pour capturer un mort-vivant coûte très cher : Viserion est tué par le Roi de la Nuit et ressuscité comme dragon des morts. Avec Viserion, le Roi de la Nuit abat le Mur. La Grande Guerre commence.`,
    evenements: [
      "Daenerys débarque à Peyredragon avec ses alliés",
      "Bataille du Pillage : les Lannister défaits dans les flammes",
      "Jon Snow révélé comme Aegon Targaryen — héritier légitime",
      "Mission au-delà du Mur pour capturer un mort-vivant",
      "Viserion tué et ressuscité par le Roi de la Nuit",
      "Le Mur est abattu — la Grande Guerre commence",
    ],
  },

  {
    id: 'saison-8',
    categorie: 'got',
    tag: 'SAISON 8 · FINALE',
    annee: '305 AC',
    titre: "La Grande Guerre & la Fin d'un Règne",
    sousTitre: "La Nuit des Morts et la Folie du Dragon",
    accent: '#b0a8d0',
    border: 'rgba(176,168,208,0.2)',
    resume: "Arya tue le Roi de la Nuit. Daenerys brûle Port-Réal. Jon tue Daenerys. Bran devient roi. Westeros change pour toujours.",
    images: [
      '/History/Saison/Saison 8/Game-of-Thrones-The-Night-King.jpg',
      '/History/Saison/Saison 8/intro-game-of-thrones-saison-8.jpg',
      '/History/Saison/Saison 8/Game-Thrones-Saison-8-Finale-conseil-final-sansa-bran-arya-600x400.jpg',
      '/History/Saison/Saison 8/game-of-thrones-saison-8-bilan.jpg',
    ],
    description: `La Bataille de Winterfell rassemble toutes les forces vivantes contre l'armée des morts. C'est Arya Stark — pas le héros prédestiné Jon Snow — qui tue le Roi de la Nuit en lui enfonçant la dague de Valerian dans la nuit la plus sombre. Tous les morts s'effondrent.

Mais la victoire contre les morts ne résout pas les conflits entre les vivants. La folie de Daenerys éclate lors de la prise de Port-Réal : elle brûle la ville entière malgré la capitulation des cloches. Jon Snow, déchiré entre l'amour et le devoir, la tue. Le Grand Conseil élit Bran Stark roi — et Sansa obtient l'indépendance du Nord.`,
    evenements: [
      "Bataille de Winterfell — toutes les forces vivantes réunies",
      "Arya Stark tue le Roi de la Nuit",
      "Daenerys brûle Port-Réal malgré sa reddition",
      "Jon Snow assassine Daenerys Targaryen",
      "Bran Stark élu roi des Six Royaumes",
      "Sansa Stark couronnée Reine du Nord indépendant",
      "Arya part explorer l'ouest du monde inconnu",
    ],
  },
]
