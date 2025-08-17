import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { VerdictCard } from "@/components/VerdictCard";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import Fuse from "fuse.js";

interface FoodData {
  names: string[];
  verdict: "SAFE" | "CAUTION" | "UNSAFE" | "UNKNOWN";
  why: string;
  preparation?: string;
  portion?: string;
  symptoms?: string;
  citations?: { title: string; url: string }[];
  confidence?: string;
}

// Language translations
const translations = {
  en: {
    title: "Can My Dog Eat...",
    placeholder: "type here",
    error: "Failed to search for food information. Please try again.",
    unknown: {
      why: "We don't have specific information about this item in our database. When in doubt, it's best to avoid giving unfamiliar foods to your dog.",
      symptoms: "Unknown - monitor your dog closely if they've consumed this item and contact your veterinarian if you notice any unusual behavior."
    }
  },
  sv: {
    title: "Kan Min Hund Äta...",
    placeholder: "skriv här",
    error: "Kunde inte söka efter matinformation. Försök igen.",
    unknown: {
      why: "Vi har ingen specifik information om denna produkt i vår databas. När du är osäker är det bäst att undvika att ge okänd mat till din hund.",
      symptoms: "Okänt - övervaka din hund noggrant om de har konsumerat denna produkt och kontakta din veterinär om du märker någon ovanlig beteende."
    }
  }
};

// Comprehensive Swedish translations for ALL food database content
const foodTranslations = {
  en: {
    // Common symptoms
    "Watch for vomiting, diarrhea, lethargy, tremors, seizures; contact a veterinarian if symptoms occur.": "Watch for vomiting, diarrhea, lethargy, tremors, seizures; contact a veterinarian if symptoms occur.",
    "Risk of acute kidney injury in dogs.": "Risk of acute kidney injury in dogs.",
    "Contains methylxanthines (theobromine, caffeine) toxic to dogs.": "Contains methylxanthines (theobromine, caffeine) toxic to dogs.",
    "Allium species can cause oxidative damage to red blood cells (hemolytic anemia).": "Allium species can cause oxidative damage to red blood cells (hemolytic anemia).",
    "Ethanol is toxic; CNS depression, hypoglycemia, acidosis.": "Ethanol is toxic; CNS depression, hypoglycemia, acidosis.",
    "Methylxanthines stimulate CNS/cardiac tissue; toxic to dogs.": "Methylxanthines stimulate CNS/cardiac tissue; toxic to dogs.",
    "Causes rapid hypoglycemia and possible liver failure.": "Causes rapid hypoglycemia and possible liver failure.",
    "Causes weakness, tremors, hyperthermia.": "Causes weakness, tremors, hyperthermia.",
    "Expands in stomach; fermentation produces ethanol.": "Expands in stomach; fermentation produces ethanol.",
    "Can cause malignant hyperthermia; especially dangerous in dogs.": "Can cause malignant hyperthermia; especially dangerous in dogs.",
    "NSAID; causes GI ulceration and kidney injury in dogs.": "NSAID; causes GI ulceration and kidney injury in dogs.",
    "Risk of liver damage, methemoglobinemia.": "Risk of liver damage, methemoglobinemia.",
    "Dose-sensitive; do not give without veterinary direction.": "Dose-sensitive; do not give without veterinary direction.",
    "Severe, potentially fatal poisoning.": "Severe, potentially fatal poisoning.",
    
    // Common preparations
    "Remove core and seeds; serve fresh slices.": "Remove core and seeds; serve fresh slices.",
    "Remove peel; serve fresh slices or mashed.": "Remove peel; serve fresh slices or mashed.",
    "Never give to dogs under any circumstances.": "Never give to dogs under any circumstances.",
    "Wash thoroughly, can serve raw or cooked. Cut into appropriate sizes to prevent choking.": "Wash thoroughly, can serve raw or cooked. Cut into appropriate sizes to prevent choking.",
    "Remove all kernels from cob; serve plain cooked kernels only.": "Remove all kernels from cob; serve plain cooked kernels only.",
    "Never give to dogs; check ingredient lists carefully.": "Never give to dogs; check ingredient lists carefully.",
    
    // Common portions
    "1–2 slices for small dogs, up to 1/4 apple for large dogs, occasional treat only.": "1–2 slices for small dogs, up to 1/4 apple for large dogs, occasional treat only.",
    "A few slices for small dogs, half a banana for large dogs, occasional treat.": "A few slices for small dogs, half a banana for large dogs, occasional treat.",
    "None - completely avoid.": "None - completely avoid.",
    "1-2 baby carrots for small dogs, 3-4 for large dogs, daily is fine.": "1-2 baby carrots for small dogs, 3-4 for large dogs, daily is fine.",
    "Small amounts as occasional treat; high in carbs.": "Small amounts as occasional treat; high in carbs.",
    "None - even small amounts are dangerous.": "None - even small amounts are dangerous.",
    
    // Common symptoms
    "Seeds or core ingestion may cause GI upset or cyanide poisoning in large quantities.": "Seeds or core ingestion may cause GI upset or cyanide poisoning in large quantities.",
    "Excessive consumption may cause digestive upset due to high sugar content.": "Excessive consumption may cause digestive upset due to high sugar content.",
    "Vomiting, diarrhea, increased heart rate, seizures, potentially fatal in severe cases.": "Vomiting, diarrhea, increased heart rate, seizures, potentially fatal in severe cases.",
    "Vomiting, diarrhea, lethargy, kidney failure, potentially fatal.": "Vomiting, diarrhea, lethargy, kidney failure, potentially fatal.",
    "Generally very safe; excessive amounts may cause orange-tinted fur temporarily.": "Generally very safe; excessive amounts may cause orange-tinted fur temporarily.",
    "Corn cob ingestion can cause choking, intestinal blockage requiring surgery.": "Corn cob ingestion can cause choking, intestinal blockage requiring surgery.",
    "Vomiting, loss of coordination, collapse, seizures, potentially fatal.": "Vomiting, loss of coordination, collapse, seizures, potentially fatal."
  },
  sv: {
    // Common symptoms
    "Watch for vomiting, diarrhea, lethargy, tremors, seizures; contact a veterinarian if symptoms occur.": "Uppmärksamma kräkningar, diarré, trötthet, skakningar, kramper; kontakta en veterinär om symptom uppstår.",
    "Risk of acute kidney injury in dogs.": "Risk för akut njurskada hos hundar.",
    "Contains methylxanthines (theobromine, caffeine) toxic to dogs.": "Innehåller metylxantiner (teobromin, koffein) som är giftiga för hundar.",
    "Allium species can cause oxidative damage to red blood cells (hemolytic anemia).": "Allium-arter kan orsaka oxidativ skada på röda blodkroppar (hemolytisk anemi).",
    "Ethanol is toxic; CNS depression, hypoglycemia, acidosis.": "Etanol är giftigt; CNS-depression, hypoglykemi, acidos.",
    "Methylxanthines stimulate CNS/cardiac tissue; toxic to dogs.": "Metylxantiner stimulerar CNS/hjärtvävnad; giftigt för hundar.",
    "Causes rapid hypoglycemia and possible liver failure.": "Orsakar snabb hypoglykemi och möjlig leversvikt.",
    "Causes weakness, tremors, hyperthermia.": "Orsakar svaghet, skakningar, hypertermi.",
    "Expands in stomach; fermentation produces ethanol.": "Expanderar i magen; jäsning producerar etanol.",
    "Can cause malignant hyperthermia; especially dangerous in dogs.": "Kan orsaka malign hypertermi; särskilt farligt för hundar.",
    "NSAID; causes GI ulceration and kidney injury in dogs.": "NSAID; orsakar GI-ulceration och njurskada hos hundar.",
    "Risk of liver damage, methemoglobinemia.": "Risk för leverskada, methemoglobinemi.",
    "Dose-sensitive; do not give without veterinary direction.": "Dos-känsligt; ge inte utan veterinär riktlinje.",
    "Severe, potentially fatal poisoning.": "Allvarlig, potentiellt dödlig förgiftning.",
    
    // Common preparations
    "Remove core and seeds; serve fresh slices.": "Ta bort kärna och frön; servera färska skivor.",
    "Remove peel; serve fresh slices or mashed.": "Ta bort skal; servera färska skivor eller mos.",
    "Never give to dogs under any circumstances.": "Ge aldrig till hundar under några omständigheter.",
    "Wash thoroughly, can serve raw or cooked. Cut into appropriate sizes to prevent choking.": "Tvätta grundligt, kan serveras rå eller kokt. Skär i lämpliga storlekar för att förhindra kvävning.",
    "Remove all kernels from cob; serve plain cooked kernels only.": "Ta bort alla korn från kolv; servera endast vanliga kokta korn.",
    "Never give to dogs; check ingredient lists carefully.": "Ge aldrig till hundar; kontrollera ingredienslistor noggrant.",
    
    // Common portions
    "1–2 slices for small dogs, up to 1/4 apple for large dogs, occasional treat only.": "1–2 skivor för små hundar, upp till 1/4 äpple för stora hundar, endast som tillfällig belöning.",
    "A few slices for small dogs, half a banana for large dogs, occasional treat.": "Några skivor för små hundar, halv banan för stora hundar, tillfällig belöning.",
    "None - completely avoid.": "Ingen - undvik helt.",
    "1-2 baby carrots for small dogs, 3-4 for large dogs, daily is fine.": "1-2 morotsbarn för små hundar, 3-4 för stora hundar, dagligen är bra.",
    "Small amounts as occasional treat; high in carbs.": "Små mängder som tillfällig belöning; högt i kolhydrater.",
    "None - even small amounts are dangerous.": "Ingen - även små mängder är farliga.",
    
    // Common symptoms
    "Seeds or core ingestion may cause GI upset or cyanide poisoning in large quantities.": "Intag av frön eller kärna kan orsaka magbesvär eller cyanidförgiftning i stora mängder.",
    "Excessive consumption may cause digestive upset due to high sugar content.": "Överkonsumtion kan orsaka matsmältningsbesvär på grund av högt sockerinnehåll.",
    "Vomiting, diarrhea, increased heart rate, seizures, potentially fatal in severe cases.": "Kräkningar, diarré, ökad hjärtfrekvens, kramper, potentiellt dödligt i svåra fall.",
    "Vomiting, diarrhea, lethargy, kidney failure, potentially fatal.": "Kräkningar, diarré, trötthet, njursvikt, potentiellt dödligt.",
    "Generally very safe; excessive amounts may cause orange-tinted fur temporarily.": "Generellt mycket säkert; övermängder kan orsaka orange-nyanserad päls tillfälligt.",
    "Corn cob ingestion can cause choking, intestinal blockage requiring surgery.": "Intag av majskolv kan orsaka kvävning, tarmblockering som kräver kirurgi.",
    "Vomiting, loss of coordination, collapse, seizures, potentially fatal.": "Kräkningar, förlust av koordination, kollaps, kramper, potentiellt dödligt.",
    
    // Additional why texts
    "Generally safe low-calorie treat.": "Generellt säker kalorisnål belöning.",
    "Flesh is safe; seeds/cores should be avoided.": "Köttet är säkert; frön/kärnor ska undvikas.",
    "Commonly used as small treats.": "Vanligt använt som små belöningar.",
    "Usually tolerated in small amounts; high sugar.": "Vanligtvis tolererat i små mängder; högt sockerinnehåll.",
    "Plain cooked pumpkin can aid stool quality.": "Vanlig kokt pumpa kan förbättra avföringskvalitet.",
    "Common bland diet component.": "Vanlig komponent i mild kost.",
    "Lean protein; avoid bones and seasoning.": "Mager protein; undvik ben och kryddor.",
    "Similar to chicken; avoid skin/seasonings.": "Liknande kyckling; undvik skinn/kryddor.",
    "Protein source; avoid high fat.": "Proteinkälla; undvik högt fettinnehåll.",
    "Omega-3 source; bones and raw fish risks.": "Omega-3-källa; risker med ben och rå fisk.",
    "Omega-3; watch sodium.": "Omega-3; uppmärksamma natrium.",
    "Cooked egg is generally safe.": "Kokt ägg är generellt säkert.",
    "Low-calorie treat.": "Kalorisnål belöning.",
    "Hydrating low-calorie snack.": "Vätskeersättande kalorisnål mellanmål.",
    "Seedless flesh is okay.": "Fröfritt kött är okej.",
    "Sweet treat; sugar content.": "Söt belöning; sockerinnehåll.",
    "Fiber-rich; avoid raw/hard chews for choking.": "Fibrerik; undvik rå/hårda tuggbara för kvävning.",
    "Often included in dog foods.": "Ofta inkluderat i hundmat.",
    "Some dogs tolerate small amounts; lactose-sensitive dogs may not.": "Vissa hundar tolererar små mängder; laktoskänsliga hundar kanske inte.",
    "Popular treat; ensure no xylitol.": "Populär belöning; säkerställ inget xylitol.",
    "Persin content varies; pit/peel obstruction hazard; fatty food.": "Persininnehåll varierar; kärna/skal obstruktionsrisk; fet mat.",
    "High fat may trigger GI upset/pancreatitis; bones unsafe.": "Högt fettinnehåll kan utlösa magbesvär/pankreatit; ben osäkra.",
    
    // Additional preparation texts
    "Plain, chopped; no seasoning.": "Vanlig, hackad; inga kryddor.",
    "Remove core/seeds; fresh slices.": "Ta bort kärna/frön; färska skivor.",
    "Wash; serve fresh or frozen pieces.": "Tvätta; servera färska eller frysta bitar.",
    "Peel; small pieces.": "Skala; små bitar.",
    "Plain, cooked; no pie filling.": "Vanlig, kokt; ingen pajfyllning.",
    "Plain, well-cooked; no seasoning.": "Vanlig, välkokt; inga kryddor.",
    "Cooked, unseasoned; no bones/skin.": "Kokt, okryddad; inga ben/skinn.",
    "Cooked, unseasoned; trim fat.": "Kokt, okryddad; trimma fett.",
    "Cook thoroughly; remove bones.": "Koka grundligt; ta bort ben.",
    "Rinse; choose no-salt-added.": "Skölj; välj utan tillsatt salt.",
    "Boiled/scrambled; no oil/salt.": "Kokt/rörda; ingen olja/salt.",
    "Fresh/steamed, plain.": "Färsk/ångad, vanlig.",
    "Sliced, plain.": "Skivad, vanlig.",
    "Remove seeds and rind.": "Ta bort frön och skal.",
    "Wash; small pieces.": "Tvätta; små bitar.",
    "Cooked; soft pieces.": "Kokt; mjuka bitar.",
    "Plain, cooked.": "Vanlig, kokt.",
    "Plain slices; cooked or raw.": "Vanliga skivor; kokt eller rå.",
    "Plain, unsweetened; no xylitol.": "Vanlig, osötad; inget xylitol.",
    "Check label; no xylitol or added salt.": "Kontrollera etikett; inget xylitol eller tillsatt salt.",
    "Avoid pit/peel; tiny amounts of flesh only if advised.": "Undvik kärna/skal; endast små mängder kött om rådgivet.",
    "Lean, cooked, unseasoned; no bones.": "Mager, kokt, okryddad; inga ben.",
    
    // Additional portion texts
    "A few small pieces; <10% daily calories.": "Några små bitar; <10% dagliga kalorier.",
    "1–2 slices small dogs; up to 1/4 apple large dogs.": "1–2 skivor små hundar; upp till 1/4 äpple stora hundar.",
    "A few berries as treats.": "Några bär som belöningar.",
    "A few small pieces occasionally.": "Några små bitar ibland.",
    "1 tsp/10 kg, adjust as advised.": "1 tsk/10 kg, justera enligt råd.",
    "Small portion with protein short-term.": "Liten portion med protein kortvarigt.",
    "Small portions; <10% daily calories unless vet-advised.": "Små portioner; <10% dagliga kalorier om inte veterinärrådgivet.",
    "Small portions.": "Små portioner.",
    "Small amount occasionally.": "Liten mängd ibland.",
    "Small piece occasionally.": "Liten bit ibland.",
    "Small portion occasionally.": "Liten portion ibland.",
    "Small handful as treats.": "Liten handfull som belöningar.",
    "A few slices.": "Några skivor.",
    "Small cubes occasionally.": "Små kuber ibland.",
    "A few pieces occasionally.": "Några bitar ibland.",
    "Small portion as treat.": "Liten portion som belöning.",
    "Small spoonful.": "Liten sked.",
    "Teaspoon amounts occasionally.": "Teskedmängder ibland.",
    "Small lick; calorie-dense.": "Liten slick; kaloririk.",
    "Very small amount rarely, if at all.": "Mycket liten mängd sällan, om alls.",
    "Small amount rarely.": "Liten mängd sällan.",
    
    // Additional symptom texts
    "Nicotinic toxicity; vomiting, tremors, seizures.": "Nikotinisk toxicitet; kräkningar, skakningar, kramper.",
    "Neurologic depression, ataxia; edibles may contain xylitol or chocolate.": "Neurologisk depression, ataxi; ätbara produkter kan innehålla xylitol eller choklad.",
    "Caustic burns, heavy metal exposure.": "Ätande brännskador, tungmetallutsättning.",
    "Many peanut butters contain xylitol; dangerous hypoglycemia.": "Många jordnötssmör innehåller xylitol; farlig hypoglykemi.",
    "Solanine toxicity risk.": "Solanintoxicitetsrisk.",
    "Myristicin toxicity; tremors, seizures.": "Myristicintoxicitet; skakningar, kramper.",
    "Nephrotoxic risk reported; avoid.": "Nefrotoxisk risk rapporterad; undvik.",
    "Cyanogenic compounds and choking/obstruction risk.": "Cyanogena föreningar och kvävnings-/obstruktionsrisk.",
    "Splintering causes GI obstruction/perforation.": "Splittring orsakar GI-obstruktion/perforation.",
    "Derived from grapes/raisins; same risk.": "Härledd från druvor/russin; samma risk.",
    "Mycotoxins can cause tremors and seizures.": "Mykotoxiner kan orsaka skakningar och kramper.",
    "Severe hypernatremia risk.": "Allvarlig hypernatremirisik.",
    "Xylitol sources; severe hypoglycemia and liver injury.": "Xylitolkällor; allvarlig hypoglykemi och leverskada.",
    "Cyanotoxins; rapidly fatal risk.": "Cyanotoxiner; snabbt dödlig risk.",
    "Common toxic plants; severe to fatal toxicity.": "Vanliga giftiga växter; allvarlig till dödlig toxicitet."
  }
};

  // Swedish food name translations - COMPLETE LIST FROM FOODS.JSON
  const foodNameTranslations: Record<string, string> = {
    // UNSAFE ITEMS
    "grapes": "druvor",
    "grape": "druva",
    "raisins": "russin",
    "raisin": "russin",
    "xylitol": "xylitol",
    "sugar-free gum": "sockerfri tuggummi",
    "xylitol sweetener": "xylitolsötningsmedel",
    "chocolate": "choklad",
    "dark chocolate": "mörk choklad",
    "cocoa": "kakao",
    "cacao": "kakao",
    "onion": "lök",
    "onions": "lökar",
    "garlic": "vitlök",
    "garlic powder": "vitlökspulver",
    "chives": "gräslök",
    "leeks": "purjolök",
    "shallot": "schalottenlök",
    "shallots": "schalottenlökar",
    "scallion": "vårlök",
    "spring onion": "vårlök",
    "alcohol": "alkohol",
    "beer": "öl",
    "wine": "vin",
    "spirits": "sprit",
    "caffeine": "koffein",
    "coffee": "kaffe",
    "espresso": "espresso",
    "energy drink": "energidryck",
    "tea": "te",
    "matcha": "matcha",
    "yerba mate": "yerba mate",
    "hops": "humle",
    "macadamia nut": "macadamianöt",
    "macadamia nuts": "macadamianötter",
    "raw bread dough": "rå bröddeg",
    "yeast dough": "jästdeg",
    "uncooked dough": "okokt deg",
    "ibuprofen": "ibuprofen",
    "advil": "advil",
    "nurofen": "nurofen",
    "acetaminophen": "acetaminofen",
    "paracetamol": "paracetamol",
    "tylenol": "tylenol",
    "aspirin": "aspirin",
    "rat poison": "råtgift",
    "rodenticide": "råtgift",
    "warfarin": "warfarin",
    "brodifacoum": "brodifacoum",
    "nicotine": "nikotin",
    "cigarettes": "cigaretter",
    "vape liquid": "e-vätska",
    "marijuana": "marijuana",
    "cannabis": "cannabis",
    "edibles": "ätbara produkter",
    "thc": "thc",
    "battery": "batteri",
    "button battery": "knappbatteri",
    "coin cell": "myntbatteri",
    "xylitol peanut butter": "xylitol jordnötssmör",
    "raw potato green": "rå grön potatis",
    "green potato": "grön potatis",
    "potato sprouts": "potatisskott",
    "nutmeg": "muskotnöt",
    "starfruit": "stjärnfrukt",
    "carambola": "stjärnfrukt",
    "pits and seeds": "kärnor och frön",
    "cherry pits": "körsbärskärnor",
    "peach pits": "persikokärnor",
    "apricot kernels": "aprikoskärnor",
    "apple seeds": "äppelfrön",
    "plum pits": "plommonkärnor",
    "cooked bones": "kokta ben",
    "chicken bones cooked": "kokta kycklingben",
    "bone shards": "bensplitter",
    "grape juice": "druvjuice",
    "raisin bread": "russinbröd",
    "moldy food": "möglig mat",
    "mouldy food": "möglig mat",
    "salt dough": "saltdeg",
    "homemade playdough": "hemgjord leksaksdeg",
    "xylitol mints": "xylitol mintpastiller",
    "xylitol candy": "xylitol godis",
    "blue-green algae": "blågrön alg",
    "algal bloom": "algblomning",
    "lilies": "liljor",
    "sago palm": "sagopalmer",
    "foxglove": "fingerborgsblomma",
    
    // SAFE ITEMS
    "carrot": "morot",
    "carrots": "morötter",
    "apple": "äpple",
    "apples": "äpplen",
    "blueberries": "blåbär",
    "blueberry": "blåbär",
    "banana": "banan",
    "bananas": "bananer",
    "pumpkin": "pumpa",
    "canned pumpkin": "konservpumpa",
    "plain rice": "vanligt ris",
    "white rice": "vitt ris",
    "brown rice": "brunt ris",
    "chicken (cooked, plain)": "kyckling (kokt, vanlig)",
    "plain chicken": "vanlig kyckling",
    "boiled chicken": "kokt kyckling",
    "turkey (cooked, plain)": "kalkon (kokt, vanlig)",
    "plain turkey": "vanlig kalkon",
    "lean beef (cooked)": "mager nötkött (kokt)",
    "beef (plain)": "nötkött (vanligt)",
    "salmon (cooked, boneless)": "lax (kokt, benfri)",
    "cooked salmon": "kokt lax",
    "sardines (in water, no salt)": "sardiner (i vatten, utan salt)",
    "sardine": "sardin",
    "egg (cooked)": "ägg (kokt)",
    "eggs (cooked)": "ägg (kokta)",
    "green beans": "bönor",
    "green bean": "böna",
    "cucumber": "gurka",
    "cucumbers": "gurkor",
    "watermelon (seedless, no rind)": "vattenmelon (fröfri, utan skal)",
    "watermelon": "vattenmelon",
    "strawberries": "jordgubbar",
    "strawberry": "jordgubbe",
    "orange": "apelsin",
    "oranges": "apelsiner",
    "peach": "persika",
    "peaches": "persikor",
    "pear": "päron",
    "pears": "päron",
    "plum": "plommon",
    "plums": "plommon",
    "cherry": "körsbär",
    "cherries": "körsbär",
    "pineapple": "ananas",
    "mango": "mango",
    "mangoes": "mangos",
    "kiwi": "kiwi",
    "kiwis": "kiwis",
    "lemon": "citron",
    "lemons": "citroner",
    "lime": "lime",
    "limes": "limer",
    "coconut": "kokosnöt",
    "coconuts": "kokosnötter",
    "avocado": "avokado",
    "avocados": "avokados",
    "tomato": "tomat",
    "tomatoes": "tomater",
    "baby carrot": "morotsbarn",
    "baby carrots": "morotsbarn",
    "broccoli": "broccoli",
    "spinach": "spenat",
    "lettuce": "sallat",
    "bell pepper": "paprika",
    "bell peppers": "paprikor",
    "potato": "potatis",
    "potatoes": "potatisar",
    "sweet potato": "sötpotatis",
    "sweet potatoes": "sötpotatisar",
    "corn": "majs",
    "corn kernels": "majskorn",
    "corn cob": "majskolv",
    "sweet corn": "sötmajs",
    "peas": "ärtor",
    "pea": "ärta",
    "asparagus": "sparris",
    "cauliflower": "blomkål",
    "cabbage": "kål",
    "kale": "grönkål",
    "celery": "selleri",
    "mushroom": "svamp",
    "mushrooms": "svampar",
    "chicken": "kyckling",
    "beef": "nötkött",
    "pork": "fläskkött",
    "pork (plain, cooked)": "fläskkött (vanligt, kokt)",
    "fish": "fisk",
    "salmon": "lax",
    "tuna": "tonfisk",
    "egg": "ägg",
    "eggs": "ägg",
    "turkey": "kalkon",
    "lamb": "lammkött",
    "duck": "anka",
    "shrimp": "räkor",
    "shrimps": "räkor",
    "milk": "mjölk",
    "cheese": "ost",
    "yogurt": "yoghurt",
    "yoghurt": "yoghurt",
    "plain yogurt (unsweetened)": "vanlig yoghurt (osötad)",
    "butter": "smör",
    "cream": "grädde",
    "ice cream": "glass",
    "bread": "bröd",
    "rice": "ris",
    "pasta": "pasta",
    "oatmeal": "havregrynsgröt",
    "oats": "havre",
    "wheat": "vete",
    "flour": "mjöl",
    "cereal": "flingor",
    "crackers": "kex",
    "cracker": "kex",
    "peanut": "jordnöt",
    "peanuts": "jordnötter",
    "peanut butter": "jordnötssmör",
    "peanut butter (xylitol-free)": "jordnötssmör (xylitolfritt)",
    "almond": "mandel",
    "almonds": "mandlar",
    "walnut": "valnöt",
    "walnuts": "valnötter",
    "cashew": "cashewnöt",
    "cashews": "cashewnötter",
    "pistachio": "pistage",
    "pistachios": "pistagenötter",
    "sunflower seed": "solrosfrö",
    "sunflower seeds": "solrosfrön",
    "pumpkin seed": "pumpafrö",
    "pumpkin seeds": "pumpafrön",
    "pepper": "peppar",
    "cinnamon": "kanel",
    "ginger": "ingefära",
    "turmeric": "gurkmeja",
    "basil": "basilika",
    "oregano": "oregano",
    "thyme": "timjan",
    "rosemary": "rosmarin",
    "parsley": "persilja",
    "mint": "mynta",
    "honey": "honung",
    "sugar": "socker",
    "vinegar": "ättika",
    "oil": "olja",
    "olive oil": "olivolja",
    "coconut oil": "kokosolja",
    "jam": "sylt",
    "jelly": "gelé",
    "syrup": "sirap",
    "maple syrup": "lönnsirap",
    "ketchup": "ketchup",
    "mustard": "senap",
    "mayonnaise": "majonnäs",
    "soy sauce": "sojasås",
    "hot sauce": "stark sås",
    "salsa": "salsa",
    "guacamole": "guacamole",
    "hummus": "hummus",
    "pizza": "pizza",
    "hamburger": "hamburgare",
    "hot dog": "korv",
    "sandwich": "smörgås",
    "soup": "soppa",
    "salad": "sallad",
    "french fries": "pommes frites",
    "chips": "chips",
    "popcorn": "popcorn",
    "cookies": "kakor",
    "cookie": "kaka",
    "cake": "kaka",
    "pie": "paj",
    "candy": "godis",
    "gum": "tuggummi",
    "peppermint": "pepparmynta",
    "spearmint": "grönmynta",
    "avocado flesh": "avokadokött",
    "avocado pit": "avokadokärna",
    "avocado peel": "avokadoskal",
    "sweet potato (cooked, plain)": "sötpotatis (kokt, vanlig)",
    "green peas": "gröna ärter",
    "zucchini": "zucchini",
    "courgette": "zucchini"
  };

// Helper function to translate food names
const translateFoodName = (name: string, language: 'en' | 'sv'): string => {
  if (language === 'en') return name;
  return foodNameTranslations[name.toLowerCase()] || name;
};

// Helper function to translate food data content
const translateFoodContent = (content: string | null | undefined, language: 'en' | 'sv'): string | null | undefined => {
  if (!content) return content;
  return foodTranslations[language][content] || content;
};

// Helper function to normalize food names (remove plurals, etc.)
const normalizeFoodName = (name: string): string => {
  return name.toLowerCase().trim();
};

// Helper function to check if two names are essentially the same
const areNamesSimilar = (name1: string, name2: string): boolean => {
  const norm1 = normalizeFoodName(name1);
  const norm2 = normalizeFoodName(name2);
  
  // Check for exact match
  if (norm1 === norm2) return true;
  
  // Check for singular/plural variations
  if (norm1.endsWith('s') && norm1.slice(0, -1) === norm2) return true;
  if (norm2.endsWith('s') && norm2.slice(0, -1) === norm1) return true;
  
  // Check for "baby" prefix variations
  if (norm1.startsWith('baby ') && norm1.slice(5) === norm2) return true;
  if (norm2.startsWith('baby ') && norm2.slice(5) === norm1) return true;
  
  return false;
};

// Helper function to get theme colors based on verdict (stronger colors)
const getThemeColors = (verdict: string) => {
  switch (verdict) {
    case "SAFE":
      return {
        bg: "bg-green-100 dark:bg-green-900/40",
        border: "border-green-400 dark:border-green-600",
        text: "text-green-900 dark:text-green-100",
        accent: "bg-green-200 dark:bg-green-800/50",
        inputBg: "bg-green-50 dark:bg-green-950/30",
        inputBorder: "border-green-300 dark:border-green-700"
      };
    case "CAUTION":
      return {
        bg: "bg-yellow-100 dark:bg-yellow-900/40",
        border: "border-yellow-400 dark:border-yellow-600",
        text: "text-yellow-900 dark:text-yellow-100",
        accent: "bg-yellow-200 dark:bg-yellow-800/50",
        inputBg: "bg-yellow-50 dark:bg-yellow-950/30",
        inputBorder: "border-yellow-300 dark:border-yellow-700"
      };
    case "UNSAFE":
      return {
        bg: "bg-red-100 dark:bg-red-900/40",
        border: "border-red-400 dark:border-red-600",
        text: "text-red-900 dark:text-red-100",
        accent: "bg-red-200 dark:bg-red-800/50",
        inputBg: "bg-red-50 dark:bg-red-950/30",
        inputBorder: "border-red-300 dark:border-red-700"
      };
    default: // UNKNOWN
      return {
        bg: "bg-gray-100 dark:bg-gray-900/40",
        border: "border-gray-400 dark:border-gray-600",
        text: "text-gray-900 dark:text-gray-100",
        accent: "bg-gray-200 dark:bg-gray-800/50",
        inputBg: "bg-gray-50 dark:bg-gray-950/30",
        inputBorder: "border-gray-300 dark:border-gray-700"
      };
  }
};

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [result, setResult] = useState<(FoodData & { foodName: string }) | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [foodsData, setFoodsData] = useState<FoodData[]>([]);
  const [language, setLanguage] = useState<'en' | 'sv'>('en');
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const t = translations[language];

  // Load foods data on component mount
  useEffect(() => {
    const loadFoodsData = async () => {
      try {
        const response = await fetch('/foods.json');
        if (!response.ok) {
          throw new Error('Failed to load food database');
        }
        const data: FoodData[] = await response.json();
        setFoodsData(data);
      } catch (err) {
        console.error("Failed to load foods data:", err);
      }
    };
    loadFoodsData();
  }, []);

  // Generate suggestions based on search term
  useEffect(() => {
    if (!searchTerm.trim() || foodsData.length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Extract unique food names from results and filter duplicates
    const uniqueNames = new Set<string>();
    const addedNames = new Set<string>();
    
    // When in Swedish mode, we need to search through both English and Swedish names
    foodsData.forEach(food => {
      food.names.forEach(name => {
        // Get the Swedish translation if we're in Swedish mode
        const swedishName = translateFoodName(name, 'sv');
        const displayName = language === 'sv' ? swedishName : name;
        
        // In Swedish mode, only show items that have Swedish translations
        if (language === 'sv' && swedishName === name) {
          return; // Skip items without Swedish translations
        }
        
        // Check if the search term matches either the original name or the Swedish translation
        const matchesSearch = 
          name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (language === 'sv' && swedishName.toLowerCase().includes(searchTerm.toLowerCase()));
        
        if (matchesSearch) {
          // Check if this name is similar to any already added name
          let isDuplicate = false;
          for (const addedName of addedNames) {
            if (areNamesSimilar(displayName, addedName)) {
              isDuplicate = true;
              break;
            }
          }
          
          if (!isDuplicate) {
            uniqueNames.add(displayName);
            addedNames.add(displayName);
          }
        }
      });
    });

    const suggestionList = Array.from(uniqueNames).slice(0, 6);
    setSuggestions(suggestionList);
    setShowSuggestions(suggestionList.length > 0);
    setSelectedSuggestionIndex(-1);
  }, [searchTerm, foodsData, language]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showSuggestions) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedSuggestionIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedSuggestionIndex >= 0) {
            setSearchTerm(suggestions[selectedSuggestionIndex]);
            setShowSuggestions(false);
            handleSearch(suggestions[selectedSuggestionIndex]);
          } else {
            handleSearch();
          }
          break;
        case 'Escape':
          setShowSuggestions(false);
          inputRef.current?.blur();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSuggestions, suggestions, selectedSuggestionIndex]);

  // Handle clicks outside suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (searchValue?: string) => {
    const termToSearch = searchValue || searchTerm;
    if (!termToSearch.trim()) return;
    
    setLoading(true);
    setError(null);
    setShowSuggestions(false);
    
    try {
      let bestMatch = null;
      let bestScore = Infinity;
      
      // Search through all foods manually to support both English and Swedish search
      foodsData.forEach(food => {
        food.names.forEach(name => {
          // Get the Swedish translation
          const swedishName = translateFoodName(name, 'sv');
          
          // In Swedish mode, only search items that have Swedish translations
          if (language === 'sv' && swedishName === name) {
            return; // Skip items without Swedish translations
          }
          
          // Check if the search term matches either the original name or the Swedish translation
          const matchesEnglish = name.toLowerCase().includes(termToSearch.toLowerCase());
          const matchesSwedish = language === 'sv' && swedishName.toLowerCase().includes(termToSearch.toLowerCase());
          
          if (matchesEnglish || matchesSwedish) {
            // Calculate a simple score (lower is better)
            const englishScore = name.toLowerCase().indexOf(termToSearch.toLowerCase());
            const swedishScore = language === 'sv' ? swedishName.toLowerCase().indexOf(termToSearch.toLowerCase()) : Infinity;
            const score = Math.min(englishScore >= 0 ? englishScore : Infinity, swedishScore >= 0 ? swedishScore : Infinity);
            
            if (score < bestScore) {
              bestScore = score;
              bestMatch = food;
            }
          }
        });
      });
      
      if (bestMatch) {
        // Translate the food data content based on current language
        const translatedResult = {
          ...bestMatch,
          why: translateFoodContent(bestMatch.why, language),
          preparation: translateFoodContent(bestMatch.preparation, language),
          portion: translateFoodContent(bestMatch.portion, language),
          symptoms: translateFoodContent(bestMatch.symptoms, language),
          foodName: language === 'sv' ? translateFoodName(termToSearch.trim(), 'sv') : termToSearch.trim()
        };
        setResult(translatedResult);
      } else {
        // Default "UNKNOWN" verdict
        setResult({
          names: [termToSearch.trim()],
          verdict: "UNKNOWN",
          why: t.unknown.why,
          symptoms: t.unknown.symptoms,
          foodName: termToSearch.trim(),
          confidence: "low"
        });
      }
    } catch (err) {
      setError(t.error);
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && selectedSuggestionIndex === -1) {
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    handleSearch(suggestion);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'sv' : 'en');
  };

  // Get theme colors based on current result
  const themeColors = getThemeColors(result?.verdict || "UNKNOWN");

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center px-4 transition-all duration-500 ${result ? themeColors.bg : ''}`}>
      <div className="text-center max-w-2xl mx-auto w-full">
        {/* Language Toggle */}
        <div className="absolute top-4 right-4 z-10">
          <Button
            onClick={toggleLanguage}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Languages className="h-4 w-4" />
            {language === 'en' ? 'SV' : 'EN'}
          </Button>
        </div>

        {/* Animated Header - Mobile Responsive */}
        <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-8 md:mb-12 flex flex-wrap justify-center gap-2 md:gap-4 transition-colors duration-500 ${result ? themeColors.text : 'text-foreground'}`}>
          {t.title.split(' ').map((word, index) => (
            <span 
              key={index} 
              className={`animate-bounce-gentle-delay-${index}`}
            >
              {word}
            </span>
          ))}
        </h1>

        {/* Styled Input with Autocomplete - Mobile Responsive */}
        <div className="mb-6 md:mb-8 relative px-4 sm:px-0">
          <Input
            ref={inputRef}
            type="text"
            placeholder={t.placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setShowSuggestions(suggestions.length > 0)}
            className={`text-lg sm:text-xl md:text-2xl lg:text-3xl py-4 md:py-6 px-4 md:px-8 text-center backdrop-blur-sm border-2 rounded-xl md:rounded-2xl w-full max-w-lg mx-auto font-bold placeholder:font-normal placeholder:text-muted-foreground/60 focus:ring-4 transition-all duration-300 ${
              result 
                ? `${themeColors.inputBg} ${themeColors.inputBorder} focus:border-current focus:ring-current/20` 
                : 'bg-card/80 border-border/50 focus:border-primary/50 focus:ring-primary/20'
            }`}
            disabled={loading}
          />
          
          {/* Autocomplete Suggestions - Mobile Responsive */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full px-4 md:px-6 py-3 md:py-4 text-left text-base md:text-lg hover:bg-accent/50 transition-colors duration-200 ${
                    index === selectedSuggestionIndex ? 'bg-accent/50' : ''
                  } ${index === 0 ? 'rounded-t-xl' : ''} ${
                    index === suggestions.length - 1 ? 'rounded-b-xl' : ''
                  }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-3 bg-destructive/10 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Results - Mobile Responsive */}
        {result && (
          <div className="mt-6 md:mt-8 px-4 sm:px-0">
            <VerdictCard
              verdict={result.verdict}
              why={result.why}
              preparation={result.preparation}
              portion={result.portion}
              symptoms={result.symptoms}
              citations={result.citations}
              confidence={result.confidence}
              foodName={result.foodName}
              language={language}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
