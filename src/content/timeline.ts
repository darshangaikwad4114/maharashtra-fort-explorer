import type { TimelineEvent } from "@/types";

/**
 * Only events that are documented in the linked Wikipedia articles are
 * included. Dates are given as commonly published; see each source.
 */
export const timeline: TimelineEvent[] = [
  {
    year: "1327",
    title: "Devagiri becomes Daulatabad",
    titleMr: "देवगिरी होते दौलताबाद",
    description:
      "Muhammad bin Tughluq moved the Delhi sultanate's capital to Devagiri and renamed it Daulatabad. The fort's layered defences — rock-cut moat, tunnels and multiple gates — were developed further under later Deccan rulers.",
    descriptionMr:
      "मुहम्मद बिन तुघलकने दिल्ली सल्तनतची राजधानी देवगिरी येथे हलवली आणि त्याचे नाव दौलताबाद ठेवले. खडकात कोरलेला खंदक, बोगदे आणि अनेक प्रवेशद्वारे अशी थरावर थर संरक्षणव्यवस्था पुढील दख्खनी राज्यकर्त्यांनी वाढवली.",
    fortSlugs: ["daulatabad-fort"],
    source: {
      title: "Daulatabad Fort — Wikipedia",
      url: "https://en.wikipedia.org/wiki/Daulatabad_Fort",
      publisher: "Wikipedia",
    },
  },
  {
    year: "1646",
    title: "Torna captured",
    titleMr: "तोरणा जिंकला",
    description:
      "The teenage Shivaji Maharaj captured Torna (Prachandagad), his first fort. Treasure found there is traditionally linked to the fortification of Rajgad that followed.",
    descriptionMr:
      "वयाने लहान असलेल्या शिवाजी महाराजांनी तोरणा (प्रचंडगड) जिंकला — हा त्यांचा पहिला किल्ला. तेथे सापडलेला खजिना पुढे राजगडाच्या तटबंदीशी जोडला जातो.",
    fortSlugs: ["torna-fort", "rajgad-fort"],
    source: {
      title: "Torna Fort — Wikipedia",
      url: "https://en.wikipedia.org/wiki/Torna_Fort",
      publisher: "Wikipedia",
    },
  },
  {
    year: "1659",
    title: "Battle of Pratapgad",
    titleMr: "प्रतापगडाची लढाई",
    description:
      "The battle at Pratapgad between Shivaji Maharaj and the Bijapur general Afzal Khan ended with Afzal Khan's death. The fort's lower fort and temple remain the usual visitor circuit.",
    descriptionMr:
      "प्रतापगडावर शिवाजी महाराज आणि बिजापूरचा सेनापती अफझलखान यांच्यातील लढाई अफझलखानाच्या मृत्यूने संपली. किल्ल्याचा पदर आणि मंदिर हा सहसा पाहिला जाणारा परिसर आहे.",
    fortSlugs: ["pratapgad-fort"],
    source: {
      title: "Pratapgad — Wikipedia",
      url: "https://en.wikipedia.org/wiki/Pratapgad",
      publisher: "Wikipedia",
    },
  },
  {
    year: "1665",
    title: "Treaty of Purandar",
    titleMr: "पुरंदरचा तह",
    description:
      "Under pressure from Mirza Raja Jai Singh's campaign, Shivaji agreed to the Treaty of Purandar and surrendered a group of forts, including Purandar itself, to the Mughals.",
    descriptionMr:
      "मिर्झा राजा जयसिंह यांच्या मोहिमेच्या दबावाखाली शिवाजी महाराजांनी पुरंदरचा तह मान्य केला आणि पुरंदरसह अनेक किल्ले मुघलांना दिले.",
    fortSlugs: ["purandar-fort"],
    source: {
      title: "Purandar Fort — Wikipedia",
      url: "https://en.wikipedia.org/wiki/Purandar_Fort",
      publisher: "Wikipedia",
    },
  },
  {
    year: "1670",
    title: "Sinhagad retaken",
    titleMr: "सिंहगड पुन्हा जिंकला",
    description:
      "Shivaji's forces retook Sinhagad from the Mughals in a night assault. Tanaji Malusare, who led the attack, was killed in the fighting.",
    descriptionMr:
      "शिवाजी महाराजांच्या सैन्याने रात्रीच्या हल्ल्यात सिंहगड मुघलांकडून पुन्हा जिंकला. हल्ल्याचे नेतृत्व करणारे तानाजी मालुसरे लढाईत शहीद झाले.",
    fortSlugs: ["sinhagad-fort"],
    source: {
      title: "Sinhagad — Wikipedia",
      url: "https://en.wikipedia.org/wiki/Sinhagad",
      publisher: "Wikipedia",
    },
  },
  {
    year: "1674",
    title: "Coronation at Raigad",
    titleMr: "रायगडावर राज्याभिषेक",
    description:
      "Shivaji Maharaj was crowned at Raigad, which became the capital of the Maratha state. Palaces, a market, cisterns and the Nagarkhana were developed around the summit.",
    descriptionMr:
      "रायगडावर शिवाजी महाराजांचा राज्याभिषेक झाला आणि रायगड मराठा राज्याची राजधानी झाला. शिखराभोवती राजवाडे, बाजारपेठ, पाण्याच्या टाक्या आणि नगारखाना उभारला गेला.",
    fortSlugs: ["raigad-fort"],
    source: {
      title: "Raigad Fort — Wikipedia",
      url: "https://en.wikipedia.org/wiki/Raigad_Fort",
      publisher: "Wikipedia",
    },
  },
  {
    year: "1689",
    title: "Raigad falls to the Mughals",
    titleMr: "रायगड मुघलांच्या ताब्यात",
    description:
      "After Sambhaji's capture and death, Mughal forces under Zulfikar Khan captured Raigad. The fort changed hands again during the eighteenth century before passing to the British in 1818.",
    descriptionMr:
      "संभाजी महाराजांच्या अटकेनंतर आणि मृत्यूनंतर जुल्फिकार खानच्या नेतृत्वाखालील मुघल सैन्याने रायगड ताब्यात घेतला. अठराव्या शतकात किल्ला पुन्हा हातबदल झाला आणि १८१८ मध्ये ब्रिटिशांकडे गेला.",
    fortSlugs: ["raigad-fort"],
    source: {
      title: "Raigad Fort — Wikipedia",
      url: "https://en.wikipedia.org/wiki/Raigad_Fort",
      publisher: "Wikipedia",
    },
  },
  {
    year: "1818",
    title: "The fort era closes",
    titleMr: "गडकिल्ल्यांच्या युगाची सांगता",
    description:
      "At the end of the Third Anglo-Maratha War, the British took control of the remaining Maratha forts. Vishalgad was among those that passed into British hands that year.",
    descriptionMr:
      "तिसऱ्या इंग्रज-मराठा युद्धाच्या शेवटी उर्वरित मराठा किल्ले ब्रिटिशांच्या ताब्यात गेले. त्या वर्षी विशालगडही ब्रिटिशांच्या हाती गेला.",
    fortSlugs: ["vishalgad-fort"],
    source: {
      title: "Vishalgad — Wikipedia",
      url: "https://en.wikipedia.org/wiki/Vishalgad",
      publisher: "Wikipedia",
    },
  },
];
