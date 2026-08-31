export const CATEGORY_KEYS = {
  "Domáce zvieratá": "companion",
  "Hospodárske zvieratá": "farm",
  Vtáky: "bird",
  "Ryby a vodné živočíchy": "aquatic",
  Plazy: "reptile",
  Obojživelníky: "amphibian",
  "Exotické, uniknuté alebo nepôvodné zvieratá": "exotic",
  "Voľne žijúce cicavce": "wild_mammal",
};

export const SUBCATEGORY_KEYS = {
  "Lesná a poľná zver": "forest_game",
  "Malé vtáky a spevavce": "songbirds",
  "Malé voľne žijúce cicavce": "small_wild_mammals",
  "Vodné vtáky": "waterfowl",
  Dravce: "raptors",
  "Krkavcovité vtáky": "corvids",
  Sovy: "owls",
  "Bociany a brodivé vtáky": "storks_waders",
  "Veľké šelmy": "large_carnivores",
  Holuby: "pigeons",
};

export const SPECIES_SLUGS = {
  Pes: "dog",
  Mačka: "cat",
  Fretka: "ferret",
  Králik: "rabbit",
  Morča: "guinea_pig",
  Škrečok: "hamster",
  Potkan: "rat",
  Činčila: "chinchilla",
  Papagáj: "parrot",
  Korytnačka: "turtle",
  Had: "snake",
  Jašterica: "lizard",
  Kôň: "horse",
  Somár: "donkey",
  Krava: "cow",
  Ovca: "sheep",
  Koza: "goat",
  Prasa: "pig",
  Sliepka: "chicken",
  Kačica: "duck",
  Hus: "goose",
  Morka: "turkey",
  Holub: "pigeon",
  Včely: "bees",
  Orol: "eagle",
  Sokol: "falcon",
  Jastrab: "goshawk",
  Myšiak: "buzzard",
  Haja: "kite",
  Kaňa: "harrier",
  Sova: "owl",
  Výr: "eagle_owl",
  Kuvik: "little_owl",
  Myšiarka: "tawny_owl",
  Plamienka: "barn_owl",
  Vrana: "crow",
  Havran: "rook",
  Krkavec: "raven",
  Straka: "magpie",
  Sojka: "jay",
  Kavka: "jackdaw",
  Labuť: "swan",
  Volavka: "heron",
  Kormorán: "cormorant",
  Čajka: "gull",
  Potápka: "grebe",
  "Bocian biely": "white_stork",
  "Bocian čierny": "black_stork",
  Žeriav: "crane",
  Sýkorka: "tit",
  Vrabec: "sparrow",
  Drozd: "thrush",
  Lastovička: "swallow",
  Belorítka: "house_martin",
  Dážďovník: "swift",
  Škorec: "starling",
  Pinka: "finch",
  Červienka: "robin",
  Hrdlička: "collared_dove",
  Ryba: "fish",
  Rak: "crayfish",
  Lastúrnik: "mussel",
  "Vodná korytnačka": "aquatic_turtle",
  Vydra: "otter",
  Bobor: "beaver",
  Užovka: "grass_snake",
  Vretenica: "viper",
  Slepúch: "slow_worm",
  Žaba: "frog",
  Ropucha: "toad",
  Skokan: "water_frog",
  Rosnička: "tree_frog",
  Mlok: "newt",
  Salamandra: "salamander",
  Nutria: "coypu",
  "Medvedík čistotný": "raccoon",
  Norka: "mink",
  Norok: "mink",
  "Exotický had": "exotic_snake",
  "Exotická jašterica": "exotic_lizard",
  Klokan: "kangaroo",
  Tiger: "tiger",
  Srnka: "roe_deer",
  Jeleň: "red_deer",
  Daniel: "fallow_deer",
  Muflón: "mouflon",
  Diviak: "wild_boar",
  Zajac: "hare",
  Líška: "fox",
  Jazvec: "badger",
  Kuna: "marten",
  Lasica: "weasel",
  Tchor: "polecat",
  "Líška v meste": "urban_fox",
  "Kuna v meste": "urban_marten",
  Jež: "hedgehog",
  Veverica: "squirrel",
  Netopier: "bat",
  Plch: "dormouse",
  Krt: "mole",
  Myš: "mouse",
  Hraboš: "vole",
  Medveď: "bear",
  Vlk: "wolf",
  Rys: "lynx",
  "Mačka divá": "wildcat",
};

export const GROUP_BY_CATEGORY = {
  companion: "domestic",
  farm: "farm",
  bird: "wildlife",
  aquatic: "wildlife",
  reptile: "wildlife",
  amphibian: "wildlife",
  exotic: "exotic",
  wild_mammal: "wildlife",
};

export const INJURED_FLOW_KEYS = {
  "FLOW-ZR-DOM": "injured_companion",
  "FLOW-ZR-HOSP": "injured_farm",
  "FLOW-ZR-CHR-STD": "injured_protected_standard",
  "FLOW-ZR-ZVER": "injured_game",
  "FLOW-ZR-EXOTIC": "injured_exotic",
  "FLOW-ZR-EXOTIC-NEBEZPECNE": "injured_exotic_dangerous",
  "FLOW-ZR-MALY-WILD": "injured_small_wild",
  "FLOW-ZR-HOLUB-ROZLISENIE": "injured_pigeon_identify",
  "FLOW-ZR-KORYTNACKA-ID": "injured_turtle_identify",
};

export const kindKeyFor = (categoryKey, subcategoryKey, speciesSlug) => {
  if (categoryKey === "companion") {
    return `domestic_${speciesSlug}`;
  }
  if (categoryKey === "farm") {
    return `farm_${speciesSlug}`;
  }
  if (categoryKey === "bird") {
    if (speciesSlug === "heron" && subcategoryKey === "waterfowl") {
      return "bird_heron_waterfowl";
    }
    if (speciesSlug === "heron" && subcategoryKey === "storks_waders") {
      return "bird_heron_wading";
    }
    return `bird_${speciesSlug}`;
  }
  if (categoryKey === "aquatic") {
    return `aquatic_${speciesSlug}`;
  }
  if (categoryKey === "reptile") {
    return `reptile_${speciesSlug}`;
  }
  if (categoryKey === "amphibian") {
    return `amphibian_${speciesSlug}`;
  }
  if (categoryKey === "exotic") {
    return `exotic_${speciesSlug}`;
  }
  return `wild_${speciesSlug}`;
};

export const resolveCategoryKey = (label) => {
  const key = CATEGORY_KEYS[label];
  if (key === undefined) {
    throw new Error(`unknown category: ${label}`);
  }
  return key;
};

export const resolveSubcategoryKey = (label) => {
  if (label.trim() === "") {
    return undefined;
  }
  const key = SUBCATEGORY_KEYS[label];
  if (key === undefined) {
    throw new Error(`unknown subcategory: ${label}`);
  }
  return key;
};

export const resolveSpeciesSlug = (label) => {
  const key = SPECIES_SLUGS[label];
  if (key === undefined) {
    throw new Error(`unknown species label: ${label}`);
  }
  return key;
};

export const resolveInjuredFlowKey = (flowId, fillLevel) => {
  const fromId = INJURED_FLOW_KEYS[flowId.trim()];
  if (fromId !== undefined) {
    return fromId;
  }
  const match = /FLOW-[A-Z0-9-]+/.exec(fillLevel);
  if (match !== null && INJURED_FLOW_KEYS[match[0]] !== undefined) {
    return INJURED_FLOW_KEYS[match[0]];
  }
  return undefined;
};

export const resolveAuthorityKey = (label) => {
  if (label.includes("manuálne")) {
    return "rvps_sizp_manual";
  }
  if (label.includes("okresný úrad")) {
    return "rvps_district_land_forest";
  }
  if (label.includes("SIŽP")) {
    return "rvps_sizp";
  }
  if (label.includes("RVPS")) {
    return "rvps";
  }
  throw new Error(`unknown authority: ${label}`);
};

export const resolveContactKind = (label) => {
  const value = label.trim();
  if (value === "") {
    return undefined;
  }
  const lower = value.toLowerCase();
  if (lower.includes("112")) {
    return "emergency_112";
  }
  if (
    lower.includes("podmienené") ||
    lower.includes("voľne žijúcom holubovi")
  ) {
    return "conditional_sop_if_wild_pigeon";
  }
  if (lower.includes("dynamicky")) {
    return "dynamic_sop_or_municipality";
  }
  if (lower.includes("šop") || lower.includes("sop sr")) {
    return "sop_rescue";
  }
  if (lower.includes("poľovn") || lower.includes("opk")) {
    return "hunting_manager_or_opk";
  }
  if (lower.includes("obec")) {
    return "municipality_capture";
  }
  if (lower.includes("exotick")) {
    return "vet_exotic";
  }
  if (lower.includes("w18") || lower.includes("veterin")) {
    return "vet_clinic";
  }
  throw new Error(`unknown contact kind: ${value}`);
};

export const resolveWarningFrame = (label) => {
  const value = label.trim();
  if (value === "") {
    return undefined;
  }
  if (value === "W13") {
    return "w13";
  }
  if (value === "W14") {
    return "w14";
  }
  if (value.toLowerCase().includes("dynamicky")) {
    return "dynamic";
  }
  throw new Error(`unknown warning frame: ${value}`);
};

export const resolveSelfHelp = (label) => {
  const value = label.trim();
  if (value === "") {
    return undefined;
  }
  const lower = value.toLowerCase();
  if (lower.startsWith("nie")) {
    return "none";
  }
  if (lower.includes("nebezpečný")) {
    return "after_contacts_if_safe";
  }
  if (lower.includes("všetkých")) {
    return "after_all_contacts";
  }
  if (lower.includes("po neúspechu")) {
    return "after_contacts";
  }
  throw new Error(`unknown self-help flag: ${value}`);
};

export const resolveVolunteers = (label) => {
  const value = label.trim();
  if (value === "") {
    return undefined;
  }
  const lower = value.toLowerCase();
  if (lower.startsWith("nie")) {
    return false;
  }
  if (lower.startsWith("áno")) {
    return true;
  }
  throw new Error(`unknown volunteer flag: ${value}`);
};

export const resolveAskJuvenile = (label) => {
  const value = label.trim();
  if (value === "") {
    return undefined;
  }
  if (value.includes("Nedávať")) {
    return false;
  }
  if (value.includes("Áno")) {
    return true;
  }
  throw new Error(`unknown juvenile flag: ${value}`);
};
