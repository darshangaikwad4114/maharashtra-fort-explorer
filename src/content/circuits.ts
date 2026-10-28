import type { Circuit } from "@/types";

/**
 * Editorial trekking suggestions assembled from forts that have reviewed
 * profiles. They are routes, not verified itineraries — see `note`.
 */
export const circuits: Circuit[] = [
  {
    slug: "pune-sahyadri",
    name: "Pune Sahyadri capitals",
    nameMr: "पुणे सह्याद्रीची राजधानी",
    summary:
      "Four forts that trace the first decade of Maratha fort-building, from Torna's capture to the markets of Rajgad and the ramparts of Purandar.",
    summaryMr:
      "तोरण्याच्या जिंकण्यापासून राजगडाच्या बाजारपेठेपर्यंत आणि पुरंदरच्या तटबंदीपर्यंत — मराठा गडबांधणीच्या पहिल्या दशकाचा मागोवा घेणारे चार किल्ले.",
    days: "3 days",
    difficulty: "hard",
    season: "October–February",
    seasonMr: "ऑक्टोबर–फेब्रुवारी",
    fortSlugs: ["torna-fort", "rajgad-fort", "purandar-fort", "sinhagad-fort"],
    note: "Each fort is a separate day-hike from a different base village. Road transfers between Velhe, Pabe and Donje are long; keep a buffer day.",
    noteMr: "प्रत्येक किल्ला वेगळ्या पायथ्याच्या गावातून एका दिवसाचा ट्रेक आहे. वेळ्हे, पाबे आणि डोंजे यांमधील रस्ते लांब आहेत; एक अतिरिक्त दिवस ठेवा.",
  },
  {
    slug: "lonavala-gates",
    name: "Lonavala gate forts",
    nameMr: "लोणावळ्याची प्रवेशद्वारे",
    summary:
      "Lohagad and Visapur guard the old Bhor Ghat approach, with Tikona watching the Pauna valley from across the saddle. Tung is the quiet add-on.",
    summaryMr:
      "लोहगड आणि विसापूर जुन्या भोर घाटाच्या वाटेचे रक्षण करतात, तर तिकोना पौना दरीवरून लक्ष ठेवतो. तुंग हा शांत पर्याय.",
    days: "2 days",
    difficulty: "moderate",
    season: "June–February",
    seasonMr: "जून–फेब्रुवारी",
    fortSlugs: ["lohagad-fort", "visapur-fort", "tikona-fort", "tung-fort"],
    note: "Lohagad and Visapur share a trailhead near Malavli. Tikona and Tung need separate drives. Monsoon makes the rock-cut sections slippery.",
    noteMr: "लोहगड आणि विसापूर यांचा प्रारंभ बिंदू मळवलीजवळ समान आहे. तिकोना आणि तुंगसाठी स्वतंत्र प्रवास लागतो. पावसाळ्यात खडकात कोरलेले भाग निसरडे होतात.",
  },
  {
    slug: "mumbai-harbour",
    name: "Mumbai harbour watch",
    nameMr: "मुंबई बंदराची राखण",
    summary:
      "A coastal chain across Thane Creek and the harbour: Kolaba, Khanderi, Belapur and Worli show how sea defences and lighthouses layered over time.",
    summaryMr:
      "ठाणे खाडी आणि बंदरातील किनारपट्टीवरील साखळी: कोलाबा, खांदेरी, बेलापूर आणि वरळी — काळानुसार सागरी संरक्षण आणि दीपगृहे कशी वाढली हे दाखवतात.",
    days: "2 days",
    difficulty: "easy",
    season: "November–February",
    seasonMr: "नोव्हेंबर–फेब्रुवारी",
    fortSlugs: ["kolaba-fort", "khanderi-fort", "belapur-fort", "worli-fort"],
    note: "Tidal access decides everything here. Check local boat timings for Khanderi and Kolaba; Worli and Belapur are short urban visits.",
    noteMr: "येथे भरती-ओहोटीच्या वेळा निर्णायक असतात. खांदेरी आणि कोलाबासाठी स्थानिक बोटींच्या वेळा तपासा; वरळी आणि बेलापूर हे थोडक्यात पाहता येणारे शहरी किल्ले आहेत.",
  },
  {
    slug: "konkan-sea-forts",
    name: "Konkan sea forts",
    nameMr: "कोकणचे सागरी किल्ले",
    summary:
      "From Sindhudurg's island walls north to Vijaydurg and Suvarnadurg, this is the Maratha navy's coastline, with Jaigad closing the loop.",
    summaryMr:
      "सिंधुदुर्गच्या बेटावरील तटबंदीपासून उत्तरेकडे विजयदुर्ग आणि सुवर्णदुर्गपर्यंत — ही मराठा आरमाराची किनारपट्टी आहे; जयगड या प्रवासाची सांगता करतो.",
    days: "4 days",
    difficulty: "moderate",
    season: "November–February",
    seasonMr: "नोव्हेंबर–फेब्रुवारी",
    fortSlugs: [
      "sindhudurg-fort",
      "vijaydurg-fort",
      "suvarnadurg-fort",
      "jaigad-fort",
    ],
    note: "Distances along the Konkan coast are slow by road. Boat access to Suvarnadurg depends on sea conditions and is not guaranteed.",
    noteMr: "कोकण किनारपट्टीवरील अंतर रस्त्याने हळू कापले जाते. सुवर्णदुर्गला बोटीने जाणे समुद्राच्या स्थितीवर अवलंबून असते आणि ते निश्चित नाही.",
  },
  {
    slug: "satara-capitals",
    name: "Satara capitals & passes",
    nameMr: "साताऱ्याची राजधानी आणि घाटवाटा",
    summary:
      "Raigad, Pratapgad and Sajjangad sit across the Mahad–Satara road, linking the Maratha capital with the pass where Afzal Khan's campaign ended.",
    summaryMr:
      "रायगड, प्रतापगड आणि सज्जनगड महाड–सातारा मार्गावर पसरले आहेत; मराठा राजधानी आणि अफझलखानाची मोहीम संपलेला घाट यांना जोडणारी ही साखळी आहे.",
    days: "3 days",
    difficulty: "moderate",
    season: "October–February",
    seasonMr: "ऑक्टोबर–फेब्रुवारी",
    fortSlugs: ["raigad-fort", "pratapgad-fort", "sajjangad-fort"],
    note: "Raigad's ropeway runs on its own schedule; verify before relying on it. Sajjangad has religious observance rules at the summit.",
    noteMr: "रायगडची दोरीची गाडी स्वतःच्या वेळापत्रकानुसार चालते; त्यावर अवलंबून राहण्यापूर्वी खात्री करा. सज्जनगडावर धार्मिक नियमांचे पालन आवश्यक आहे.",
  },
  {
    slug: "khandesh-berar",
    name: "Khandesh & Berar frontier",
    nameMr: "खानदेश आणि बेरारची सीमा",
    summary:
      "Salher, Gawilghur and Narnala mark the northern campaigns and the hill gateway between the Deccan and the Berar plateau.",
    summaryMr:
      "साल्हेर, गाविलगड आणि नारनाळा उत्तरेकडील मोहिमा आणि दख्खन ते बेरार पठार यांमधील डोंगराळ प्रवेशद्वार दर्शवतात.",
    days: "4 days",
    difficulty: "hard",
    season: "November–February",
    seasonMr: "नोव्हेंबर–फेब्रुवारी",
    fortSlugs: ["salher-fort", "gawilghur-fort", "narnala-fort"],
    note: "This is a remote, long-distance circuit. Salher has limited approach transport; treat travel times as conservative estimates.",
    noteMr: "हा दुर्गम आणि लांब पल्ल्याचा मार्ग आहे. साल्हेरपर्यंत मर्यादित वाहतूक सुविधा आहे; प्रवासाच्या वेळा सावध अंदाज म्हणून घ्या.",
  },
];
