// slugify is called 1000s of times, let's memoize it
let memoizedTags = {};

let substitution = {
  'acinar morphogenesis': ['acinus', 'morphogenesis'],
  'ductal morphogenesis': ['ducts', 'morphogenesis'],
  'anti-entropie': 'anti-entropy',
  entropie: 'entropy',
  thermodynamics: 'entropy',
  'biological evolution and ontogenesis': ['evolution', 'ontogenesis'],
  'time scale': ['scale', 'time scale'],
  'temps biologique': 'time',
  'biological evolution': 'evolution',
  'evolution biology': 'evolution',
  'biological organisation': 'organization',
  'biological organization': 'organization',
  'biological randomness': 'randomness',
  'biological time': 'time',
  'carcinogenesis process': 'cancer',
  'biological rhythms': 'rhythms',
  'organizational closure': 'closure',
  organisation: 'organization',
  organism: 'organisms',
  'organism biology': 'organisms',
  reversibilite: 'reversibility',
  symmetry: 'symmetries',
  'mathematical symmetries': 'symmetries',
  'philosophical position': 'philosophy',
  'theory of organisms': 'theory',
  'theoretical symmetries': 'symmetries',
  'cell division': 'proliferation',
  'theoretical principle': 'theoretical principles',
  principles: 'theoretical principles',
  'first principles': 'theoretical principles',
  'physical theories': 'theoretical physics',
  morphogenese: 'morphogenesis',
  models: 'mathematical models',
  'mathematical modeling': 'mathematical models',
  mesure: 'measurement',
  criticite: 'criticality',
  'mammary gland development': 'mammary glands',
  'mammary gland morphogenesis': 'mammary glands',
  historicite: 'historicity',
  epistemologie: 'epistemology',
  'combinatory theory': 'combinatorics',
  'combinatorial complexity': 'combinatorics',
  variabilite: 'variability',
};

module.exports = (keyword) => {
  var tagst = Array.from(keyword);
  tagst = tagst.map((st) =>
    st
      .toLowerCase()
      .trim()
      .replace(/[é,é,è,ê]/g, 'e')
  );
  tagst = tagst.map((st) => (st in substitution ? substitution[st] : st));
  tagst = tagst.flat();
  var res = new Set(tagst);
  return Array.from(res);
};
