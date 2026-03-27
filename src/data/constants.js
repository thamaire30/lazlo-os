export const CAT_META = {
  medecine: { label: '🩺 Médecine', color: '#5ba4f5' },
  business: { label: '💼 Business', color: '#f5a623' },
  invest:   { label: '📈 Invest',   color: '#c8f135' },
  skills:   { label: '📚 Skills',   color: '#c47ef5' },
  mindset:  { label: '🧠 Mindset',  color: '#f55b5b' },
}

export const TASK_BANK = {
  medecine: [
    { text: 'Faire 20 QCMs sur le chapitre en retard (chrono 15min)', xp: 60, urgent: true },
    { text: "Résumer 1 cours en 10 bullet points max — sans relire", xp: 50, urgent: false },
    { text: "Relire les fiches d'anapath ou physio pendant 25min", xp: 50, urgent: false },
    { text: "Préparer 3 questions pièges sur un cours pour tester un(e) camarade", xp: 70, urgent: false },
    { text: "Identifier les 3 notions que tu maîtrises le moins → les noter", xp: 30, urgent: false },
    { text: "Faire une fiche mémo d'1 seule pathologie (causes / signes / traitement)", xp: 55, urgent: false },
    { text: "Faire un Anki de 15 flashcards sur le dernier cours", xp: 65, urgent: false },
    { text: "Expliquer à voix haute une notion complexe comme si tu l'enseignais", xp: 75, urgent: false },
  ],
  business: [
    { text: "Lister 3 problèmes que tu vois en médecine → potentiels business ?", xp: 70, urgent: false },
    { text: "Passer 20min sur un profil LinkedIn de médecin entrepreneur → 1 insight", xp: 40, urgent: false },
    { text: "Écrire en 5 lignes l'idée de projet qui te trotte dans la tête", xp: 80, urgent: true },
    { text: "Identifier 1 service que tu pourrais vendre DÈS MAINTENANT avec tes skills", xp: 90, urgent: true },
    { text: "Lire 1 article sur le business en santé (healthtech, téléconsultation…)", xp: 40, urgent: false },
    { text: "Trouver 1 personne qui a lancé un projet étant étudiant en médecine", xp: 60, urgent: false },
    { text: "Définir la proposition de valeur de ton projet en 1 phrase", xp: 85, urgent: false },
  ],
  invest: [
    { text: "Lire 15min sur 1 concept d'investissement (ETF, immo, compound interest…)", xp: 50, urgent: false },
    { text: "Ouvrir ou vérifier ton compte bourse / PEA", xp: 40, urgent: false },
    { text: "Calculer combien tu peux épargner par mois même étudiant", xp: 60, urgent: false },
    { text: "Regarder 1 vidéo sur l'investissement passif (index funds / DCA)", xp: 40, urgent: false },
    { text: "Lire 1 chapitre de 'L'homme le plus riche de Babylone'", xp: 55, urgent: false },
    { text: "Simuler l'évolution de 50€/mois investis pendant 10 ans (calc compound)", xp: 70, urgent: false },
  ],
  skills: [
    { text: "Lire 20 pages d'un livre de sciences sociales / psycho / sociologie", xp: 45, urgent: false },
    { text: "Regarder 1 conférence TED sur un sujet hors médecine", xp: 35, urgent: false },
    { text: "Écrire 10 lignes sur ce que tu as appris cette semaine (hors cours)", xp: 50, urgent: false },
    { text: "Apprendre 1 concept de psychologie comportementale — noter comment ça s'applique à toi", xp: 60, urgent: false },
    { text: "Trouver 1 podcast business ou invest à écouter pendant tes trajets", xp: 30, urgent: false },
    { text: "Faire 10min de réflexion structurée : où veux-tu être dans 5 ans ?", xp: 70, urgent: false },
    { text: "Regarder 1 interview d'un entrepreneur que tu admires", xp: 40, urgent: false },
  ],
  mindset: [
    { text: "Identifier LA tâche que tu repousses depuis le plus longtemps → faire 5min dessus", xp: 80, urgent: true },
    { text: "Écrire 3 choses que tu as accomplies cette semaine (même petites)", xp: 30, urgent: false },
    { text: "Faire 1 session de travail SANS musique ni bruit — 20min", xp: 65, urgent: false },
    { text: "Poser ton téléphone dans une autre pièce pendant 1h", xp: 70, urgent: true },
    { text: "Définir 1 seul objectif pour demain — 1 seul", xp: 40, urgent: false },
    { text: "Écrire ce que tu aurais fait différemment cette semaine", xp: 55, urgent: false },
  ],
}

export const BUILDER_ACTIONS = {
  medecine: [
    { id: 'qcm',       label: '📋 QCMs',           verb: 'Faire des QCMs sur' },
    { id: 'fiche',     label: '📄 Fiche mémo',      verb: 'Créer une fiche sur' },
    { id: 'resume',    label: '✏️ Résumé express',  verb: 'Résumer en bullet points' },
    { id: 'relire',    label: '👁 Relecture',        verb: 'Relire et annoter' },
    { id: 'questions', label: '❓ Questions pièges', verb: 'Préparer des questions sur' },
    { id: 'anki',      label: '🃏 Flashcards',      verb: 'Créer des flashcards sur' },
    { id: 'expliquer', label: '🗣 Expliquer',        verb: 'Expliquer à voix haute' },
  ],
  business: [
    { id: 'analyse',  label: '🔍 Analyser',   verb: 'Analyser le modèle de' },
    { id: 'idee',     label: '💡 Idée',       verb: "Explorer l'idée de" },
    { id: 'ecrire',   label: '✍️ Écrire',     verb: 'Écrire le concept de' },
    { id: 'veille',   label: '📰 Veille',     verb: 'Faire une veille sur' },
    { id: 'contact',  label: '🤝 Contacter',  verb: "Contacter quelqu'un dans" },
    { id: 'valider',  label: '✅ Valider',    verb: "Valider l'hypothèse sur" },
  ],
  invest: [
    { id: 'lire',     label: '📖 Lire',       verb: 'Lire sur le concept de' },
    { id: 'calculer', label: '🧮 Calculer',   verb: 'Calculer et simuler' },
    { id: 'suivre',   label: '📈 Suivre',     verb: "Suivre l'évolution de" },
    { id: 'comparer', label: '⚖️ Comparer',   verb: 'Comparer les options pour' },
  ],
  skills: [
    { id: 'lire',      label: '📚 Lire',      verb: 'Lire 20 pages sur' },
    { id: 'ecouter',   label: '🎧 Écouter',   verb: 'Écouter un podcast sur' },
    { id: 'regarder',  label: '🎥 Regarder',  verb: 'Regarder une conférence sur' },
    { id: 'reflechir', label: '🧠 Réfléchir', verb: 'Faire 10min de réflexion sur' },
    { id: 'ecrire',    label: '✍️ Écrire',    verb: "Écrire ce que j'ai appris sur" },
  ],
  mindset: [
    { id: 'identifier',  label: '🎯 Identifier',  verb: 'Identifier et nommer' },
    { id: 'visualiser',  label: '🌅 Visualiser',  verb: "Visualiser l'objectif de" },
    { id: 'journaliser', label: '📓 Journal',     verb: 'Journaliser mes pensées sur' },
    { id: 'deconnecter', label: '📵 Déconnecter', verb: 'Session sans téléphone —' },
    { id: 'planifier',   label: '📅 Planifier',   verb: 'Planifier concrètement' },
  ],
}

export const BUILDER_DURATIONS = [
  { id: '5',  label: '⚡ 5 min',  xpBase: 15 },
  { id: '10', label: '🕙 10 min', xpBase: 25 },
  { id: '15', label: '🕒 15 min', xpBase: 35 },
  { id: '25', label: '🔥 25 min', xpBase: 55 },
  { id: '45', label: '💪 45 min', xpBase: 80 },
  { id: '60', label: '🏆 1h',     xpBase: 100 },
]

export const BUILDER_INTENSITIES = [
  { id: 'facile',   label: '😌 Facile',   mult: 0.8, desc: 'Revu, connu, pas de résistance' },
  { id: 'moyen',    label: '😤 Moyen',    mult: 1.0, desc: "Demande de l'effort" },
  { id: 'intense',  label: '🔥 Intense',  mult: 1.3, desc: "Zone d'inconfort, nouveau terrain" },
  { id: 'extreme',  label: '💀 Extrême',  mult: 1.6, desc: "La tâche que tu évites depuis des jours" },
]

export const QUOTES = [
  "Ta flemme est un moteur. Mets-la dans le bon sens.",
  "La liberté ne se demande pas. Elle se construit tâche après tâche.",
  "1 heure de vrai travail > 8h de procrastination habillée en réflexion.",
  "Ton futur toi te regarde. Il attend.",
  "Un réseau solide, c'est de la liberté stockée chez les autres.",
  "La médecine t'apprend la rigueur. L'entrepreneuriat t'apprend la liberté. Garde les deux.",
  "Chaque QCM fait aujourd'hui = une heure de liberté gagnée plus tard.",
  "Le compound interest marche aussi sur les compétences. Commence maintenant.",
  "Procrastiner c'est emprunter du temps au futur avec des intérêts énormes.",
  "Tu n'as pas la flemme. Tu as peur. C'est différent. Et c'est réparable.",
  "Planifier une semaine, c'est décider qui tu veux être avant que la vie décide pour toi.",
  "Chaque deadline tenue est une preuve. Chaque deadline ratée est un mensonge.",
]

export const SHAME_QUOTES = [
  "Tu viens de prouver à ton futur toi que tu n'es pas fiable. Corrige ça.",
  "La deadline était artificielle. L'échec, lui, est réel.",
  "Un de plus dans la liste des trucs que t'as pas fini. Classique.",
  "Ton cerveau a gagné. Encore. Pour combien de temps ?",
  "La résistance t'a battu aujourd'hui. Demain tu bats la résistance.",
  "C'est pas grave. Sauf que si. Parce que ça s'accumule.",
  "Tu savais exactement ce que tu devais faire. Et tu ne l'as pas fait.",
]

export const WIN_QUOTES = [
  "Tu viens de prouver que tu peux tenir tes promesses. C'est tout.",
  "C'est exactement comme ça qu'on construit la confiance en soi — acte par acte.",
  "Deadline tenue. Ton futur toi vient de recevoir un cadeau.",
  "La discipline n'est pas sexy. La liberté que ça achète, si.",
  "Tu as transformé l'urgence artificielle en résultat réel. C'est le hack.",
  "Un acte de plus qui sépare qui tu es de qui tu veux être. Continue.",
]

export const COACH_SYSTEM = `Tu es LAZLO, un coach IA brutal et bienveillant. Ton utilisateur est étudiant en médecine 3ème année, vise la liberté financière et l'indépendance, il est intelligent, rêveur, procrastinateur, efficace sous pression et seul. Sa flemme est à la fois sa force (il trouve des systèmes ingénieux) et son ennemi. Il ne veut pas détruire son ambition long terme pour faire des tunes court terme — il veut les deux. Il s'intéresse aux sciences sociales. Il veut construire un réseau utile.

Parle cash, sans filtre, mais avec respect. Messages courts et percutants. Parfois provocateurs. Utilise des métaphores de liberté, d'argent, de systèmes, de médecine. Aide-le à débloquer ce qui le bloque vraiment, pas à le ménager.`

export const XP_TO_NEXT_LEVEL = (level) => level * 200

export const pickDailyTasks = (customBank = []) => {
  const picks = []
  let id = Date.now()
  const cats = ['medecine', 'medecine', 'business', 'invest', 'skills', 'mindset']
  cats.forEach(cat => {
    const pool = TASK_BANK[cat]
    const t = pool[Math.floor(Math.random() * pool.length)]
    picks.push({ id: id++, ...t, done: false, category: cat, source: 'daily' })
  })
  if (customBank.length > 0) {
    const shuffled = [...customBank].sort(() => Math.random() - 0.5).slice(0, 2)
    shuffled.forEach(t => picks.push({ ...t, id: id++, done: false, source: 'custom' }))
  }
  return picks
}

export const todayKey = () => new Date().toISOString().split('T')[0]

// Planner
export const PLANNER_BLOCKS = [
  { id: 'matin', label: '🌅 Matin',       sub: '6h – 12h',  color: '#5ba4f5' },
  { id: 'aprem', label: '☀️ Après-midi',  sub: '12h – 18h', color: '#c8f135' },
  { id: 'soir',  label: '🌙 Soir',        sub: '18h – 23h', color: '#c47ef5' },
]

export const DAYS_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export function getWeekDates(weekOffset = 0) {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1) + weekOffset * 7)
  monday.setHours(0,0,0,0)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().split('T')[0]
  })
}
