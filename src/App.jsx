import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";

// ─── CONSTANTS ─────────────────────────────────────────────────────────────────
const API = "/api/claude";
const MODEL = "claude-sonnet-4-6";
// Colors resolve through CSS variables so the whole app re-skins per user theme
const C = {
  navy: "var(--navy)", navyMid: "var(--navyMid)", blue: "var(--blue)", sky: "var(--sky)",
  stone: "#F1F5F9", text: "#0F172A", textMid: "#475569", white: "#FFFFFF",
  green: "#065F46", greenBg: "#D1FAE5",
};

const THEMES = {
  olive:  { label:"Olive Grove",  icon:"🫒", navy:"#0F2D5E", navyMid:"#1A4080", blue:"#2563EB", sky:"#0EA5E9" },
  ocean:  { label:"Deep Ocean",   icon:"🌊", navy:"#134E4A", navyMid:"#0F766E", blue:"#0D9488", sky:"#2DD4BF" },
  citrus: { label:"Citrus Sunset",icon:"🍊", navy:"#7C2D12", navyMid:"#9A3412", blue:"#EA580C", sky:"#FB923C" },
  berry:  { label:"Berry Patch",  icon:"🫐", navy:"#4C1D95", navyMid:"#5B21B6", blue:"#7C3AED", sky:"#A78BFA" },
  forest: { label:"Forest Floor", icon:"🌲", navy:"#14532D", navyMid:"#166534", blue:"#16A34A", sky:"#4ADE80" },
  crimson:{ label:"Crimson Table",icon:"🍷", navy:"#7F1D1D", navyMid:"#991B1B", blue:"#DC2626", sky:"#F87171" },
};

const DIETS = {
  "mediterranean-pescatarian": { label:"Mediterranean Pescatarian", icon:"🐟", prompt:"Mediterranean pescatarian — fish-forward with some chicken and lamb, olive oil, fresh vegetables, whole grains" },
  "mediterranean":  { label:"Mediterranean",  icon:"🫒", prompt:"classic Mediterranean — balanced fish, poultry, lamb, legumes, olive oil, fresh produce" },
  "pescatarian":    { label:"Pescatarian",    icon:"🎣", prompt:"pescatarian — fish and seafood only for animal protein, plus eggs and dairy" },
  "vegetarian":     { label:"Vegetarian",     icon:"🥗", prompt:"vegetarian — no meat or fish; eggs and dairy are fine" },
  "vegan":          { label:"Vegan",          icon:"🌱", prompt:"vegan — strictly plant-based, no animal products" },
  "keto":           { label:"Keto",           icon:"🥓", prompt:"ketogenic — very low carb, high fat, moderate protein" },
  "paleo":          { label:"Paleo",          icon:"🍖", prompt:"paleo — whole foods, meat, fish, vegetables, no grains, legumes, or dairy" },
  "balanced":       { label:"No Restrictions",icon:"🍽️", prompt:"balanced, varied diet with no restrictions" },
};
const MEAL_STYLE = {
  breakfast: { bg: "linear-gradient(145deg,#FED7AA,#FEF3C7 50%,#BAE6FD)", labelBg: "rgba(120,53,15,.12)", textColor: "#7C2D12", labelColor: "#9A3412", icon: "🌅" },
  lunch:     { bg: "linear-gradient(145deg,#7DD3FC,#38BDF8 35%,#34D399)", labelBg: "rgba(3,105,161,.15)", textColor: "#0C4A6E", labelColor: "#0369A1", icon: "☀️" },
  dinner:    { bg: "linear-gradient(145deg,#1E3A5F,#1D4ED8 55%,#6D28D9)", labelBg: "rgba(255,255,255,.15)", textColor: "#FFF", labelColor: "#BAE6FD", icon: "🌙" },
};

// ─── THIS WEEK DATA ────────────────────────────────────────────────────────────
const THIS_WEEK = [
  { id:0, short:"Wed", full:"Wednesday", date:"Jun 11", breakfast:{name:"Greek Yogurt Parfaits",emoji:"🫙",time:"5 min",kidFriendly:true}, lunch:{name:"Greek Salad + Grilled Chicken",emoji:"🥗",time:"20 min"}, dinner:{name:"Lemon Herb Grilled Salmon",emoji:"🐟",time:"25 min"} },
  { id:1, short:"Thu", full:"Thursday",  date:"Jun 12", breakfast:{name:"Scrambled Eggs with Feta",emoji:"🍳",time:"10 min",kidFriendly:true}, lunch:{name:"Mediterranean Tuna Wraps",emoji:"🌯",time:"10 min"}, dinner:{name:"Shrimp Tacos + Mango Salsa",emoji:"🌮",time:"30 min"} },
  { id:2, short:"Fri", full:"Friday",    date:"Jun 13", breakfast:null, lunch:{name:"Cold Farro Salad + Grilled Shrimp",emoji:"🥗",time:"30 min"}, dinner:{name:"Lamb Kofta + Tabbouleh + Tzatziki",emoji:"🥩",time:"35 min"} },
  { id:3, short:"Sat", full:"Saturday",  date:"Jun 14", breakfast:{name:"Avocado Toast + Everything Seasoning",emoji:"🥑",time:"10 min",kidFriendly:true}, lunch:{name:"Caprese Panzanella Salad",emoji:"🍅",time:"20 min"}, dinner:{name:"Grilled Cod + Veggie Skewers",emoji:"🐟",time:"30 min"} },
  { id:4, short:"Sun", full:"Sunday",    date:"Jun 15", breakfast:null, lunch:{name:"Chickpea Salad + Roasted Red Pepper",emoji:"🫘",time:"10 min"}, dinner:{name:"Garlic Butter Shrimp + Orzo",emoji:"🍤",time:"25 min"} },
  { id:5, short:"Mon", full:"Monday",    date:"Jun 16", breakfast:{name:"French Toast + Honey & Berries",emoji:"🍞",time:"20 min",kidFriendly:true}, lunch:{name:"Grilled Lamb Chops + Watermelon Salad",emoji:"🍉",time:"25 min"}, dinner:{name:"Pan-Seared Tilapia + Tabbouleh",emoji:"🐠",time:"30 min"} },
  { id:6, short:"Tue", full:"Tuesday",   date:"Jun 17", breakfast:null, lunch:{name:"Cold Pasta Salad + Tuna & Artichokes",emoji:"🍝",time:"20 min"}, dinner:{name:"Grilled Branzino + Red Pepper Couscous",emoji:"🐟",time:"35 min"} },
];

const RECIPES = {
  "Greek Yogurt Parfaits": {
    time:"5 min", servings:"4",
    ingredients:[
      "2 cups plain full-fat Greek yogurt (like Fage or Chobani)",
      "1 cup granola (your favorite variety)",
      "1 cup fresh mixed berries (strawberries, blueberries, or raspberries)",
      "3–4 tbsp honey, for drizzling",
      "Optional: ¼ cup sliced almonds or chopped walnuts for crunch",
      "Optional: ½ tsp vanilla extract stirred into yogurt"
    ],
    steps:[
      "If using vanilla, stir ½ tsp vanilla extract into the yogurt until combined.",
      "Grab 4 glasses, mason jars, or bowls. Spoon ¼ cup Greek yogurt into the bottom of each.",
      "Add 2 tbsp of granola on top of the yogurt layer.",
      "Add a small handful of fresh berries — mix colors for a great look.",
      "Repeat with another layer of yogurt, granola, and berries.",
      "Drizzle each parfait generously with honey right before serving.",
      "Add a sprinkle of nuts on top if using. Serve immediately so granola stays crunchy."
    ],
    kidTip:"Perfect first recipe — no heat needed! Kids practice measuring, spooning, and building layers. Let them customize their own parfait with their favorite berries."
  },

  "Greek Salad + Grilled Chicken": {
    time:"25 min", servings:"4",
    ingredients:[
      "1.5 lbs boneless skinless chicken thighs",
      "3 tbsp olive oil, divided",
      "1 tsp dried oregano",
      "3 garlic cloves, minced",
      "Juice of 1 lemon",
      "2 English cucumbers, halved and sliced into half-moons",
      "2 pints cherry tomatoes, halved",
      "1 small red onion, thinly sliced",
      "½ cup Kalamata olives, pitted",
      "5 oz block feta cheese, cut into cubes (don't crumble — chunks are better)",
      "2 tbsp red wine vinegar",
      "1 tsp dried oregano (for dressing)",
      "Salt and black pepper to taste",
      "Warm pita bread, for serving"
    ],
    steps:[
      "In a bowl, combine 2 tbsp olive oil, minced garlic, lemon juice, 1 tsp oregano, ½ tsp salt, and ¼ tsp black pepper. Add chicken thighs and toss well to coat. Let marinate at least 10 minutes (or up to 2 hours in the fridge).",
      "Heat a grill pan or outdoor grill to medium-high heat. Grill chicken 5–6 minutes per side without moving it — you want good char marks. Internal temperature should reach 165°F. Rest on a cutting board 5 minutes before slicing.",
      "While chicken rests, make the salad: combine cucumbers, cherry tomatoes, red onion, and olives in a large bowl.",
      "Whisk together 1 tbsp olive oil, red wine vinegar, 1 tsp oregano, salt, and pepper. Pour over the salad and toss gently.",
      "Slice chicken against the grain into strips and lay on top of the salad.",
      "Nestle the feta cubes around the salad — don't stir them in or they'll break up.",
      "Serve immediately with warm pita on the side for scooping."
    ]
  },

  "Lemon Herb Grilled Salmon": {
    time:"30 min", servings:"4",
    ingredients:[
      "1.5 lbs salmon fillet, skin-on, cut into 4 equal portions",
      "3 tbsp extra virgin olive oil",
      "4 garlic cloves, finely minced",
      "Zest of 2 lemons + juice of 1 lemon (reserve 1 lemon for serving)",
      "2 tbsp fresh flat-leaf parsley, finely chopped",
      "1 tbsp fresh dill or thyme (optional but excellent)",
      "1 tsp dried oregano",
      "1 tsp kosher salt",
      "½ tsp black pepper",
      "½ tsp smoked paprika",
      "4 ears corn on the cob, husks removed",
      "Lemon wedges and extra parsley for serving"
    ],
    steps:[
      "Mix together olive oil, garlic, lemon zest, lemon juice, parsley, oregano, paprika, salt, and pepper in a small bowl to make the marinade.",
      "Pat salmon fillets completely dry with paper towels — this is key for getting a good sear and preventing sticking. Place in a shallow dish and spoon marinade over the top. Let sit 15–20 minutes at room temp (don't marinate longer or the acid will start 'cooking' the fish).",
      "Preheat grill to medium-high (400–450°F). Brush grill grates well with oil to prevent sticking.",
      "Grill corn directly on the grates, turning every 3–4 minutes, until charred in spots, about 12–15 minutes total. Set aside.",
      "Place salmon skin-side DOWN on the hot grill. Cook without moving for 4–5 minutes until the flesh turns opaque halfway up the sides. Carefully flip with a wide spatula and cook another 2–3 minutes. Salmon is done when it flakes easily with a fork.",
      "Transfer salmon to plates, squeeze the reserved lemon over the top, and garnish with fresh parsley.",
      "Serve alongside the grilled corn. Offer extra lemon wedges at the table."
    ]
  },

  "Scrambled Eggs with Feta": {
    time:"12 min", servings:"4",
    ingredients:[
      "8–10 large eggs (2–3 per person)",
      "3 tbsp whole milk or cream (makes them creamier)",
      "2 tbsp unsalted butter",
      "3 oz crumbled feta cheese",
      "1 tsp dried oregano",
      "¼ tsp black pepper",
      "Salt to taste (feta is salty, so taste before adding more)",
      "2 tbsp fresh chives or parsley, chopped (for garnish)",
      "Optional: handful of baby spinach to wilt in",
      "Toasted bread or pita for serving"
    ],
    steps:[
      "Crack eggs into a bowl. Add milk, oregano, and pepper. Whisk until the yolks and whites are fully combined and slightly frothy — about 30 seconds of vigorous whisking.",
      "Heat a non-stick skillet over MEDIUM-LOW heat. This is the most important step — low and slow makes creamy scrambled eggs. High heat makes rubbery eggs.",
      "Add butter to the pan. Let it melt and foam but don't let it brown.",
      "Pour in the egg mixture. Let it sit undisturbed for about 20 seconds until you see the edges just beginning to set.",
      "Using a rubber spatula, gently push the eggs from the outside toward the center in slow, large folds. Pause between folds to let them set slightly.",
      "When the eggs are almost done but still look slightly underdone and glossy (they'll keep cooking from residual heat), remove the pan from heat.",
      "Immediately scatter the crumbled feta over the top and fold in gently — just once or twice so it stays in chunks. If using spinach, add it in the last 30 seconds of cooking.",
      "Taste and add salt only if needed. Garnish with fresh chives or parsley. Serve right away on toast or pita."
    ],
    kidTip:"Great skill-builder! Teach kids to crack eggs on the edge of the bowl (not the rim of the pan), whisk until smooth, and understand why we use low heat for eggs. Let them do the gentle folding with a spatula."
  },

  "Mediterranean Tuna Wraps": {
    time:"15 min", servings:"4",
    ingredients:[
      "3 cans (5 oz each) tuna packed in olive oil — do not drain completely, leave a little oil",
      "½ English cucumber, finely diced",
      "½ red onion, finely diced (soak in cold water 5 min to mellow the bite)",
      "1 cup cherry tomatoes, quartered",
      "⅓ cup Kalamata olives, roughly chopped",
      "3 oz feta cheese, crumbled",
      "2 tbsp capers, drained",
      "3 tbsp extra virgin olive oil",
      "Juice of 1 lemon",
      "1 tsp dried oregano",
      "¼ tsp red pepper flakes",
      "Salt and black pepper to taste",
      "4 large pita rounds or flour tortillas",
      "Handful of arugula or mixed greens"
    ],
    steps:[
      "Soak the diced red onion in a small bowl of cold water for 5 minutes — this removes the harsh raw bite. Drain well and pat dry.",
      "Open tuna cans and drain most of the oil, leaving about 1 tsp per can for flavor. Flake tuna into a large bowl with a fork, breaking up any large chunks.",
      "Add cucumber, drained red onion, cherry tomatoes, olives, feta, and capers to the tuna. Toss gently to combine.",
      "In a small bowl, whisk together olive oil, lemon juice, oregano, red pepper flakes, and a pinch of black pepper. Pour over the tuna mixture and fold to combine. Taste — add salt only if needed since tuna, feta, and capers are all salty.",
      "Warm pita or tortillas directly over a gas flame for 15–20 seconds per side for slight char, or wrap in a damp paper towel and microwave 20 seconds.",
      "Lay a small handful of arugula on each pita, then spoon a generous portion of the tuna mixture on top. Roll tightly and slice in half on the diagonal.",
      "Serve immediately, or wrap tightly in foil if packing for later."
    ]
  },

  "Shrimp Tacos + Mango Salsa": {
    time:"35 min", servings:"4",
    ingredients:[
      "1.5 lbs large shrimp (16/20 count), peeled and deveined, tails off",
      "2 tbsp olive oil",
      "1½ tsp ground cumin",
      "1½ tsp smoked paprika",
      "½ tsp garlic powder",
      "½ tsp onion powder",
      "¼ tsp cayenne pepper (optional for heat)",
      "Salt and pepper to taste",
      "— FOR MANGO SALSA —",
      "2 ripe mangos, peeled and diced small",
      "½ red onion, finely diced",
      "1 jalapeño, seeded and minced",
      "¼ cup fresh cilantro or parsley, chopped",
      "Juice of 2 limes",
      "Salt to taste",
      "— FOR SLAW —",
      "3 cups coleslaw mix (green and red cabbage)",
      "Juice of 1 lime",
      "1 tbsp olive oil",
      "1 tsp honey",
      "Salt and pepper",
      "8–12 small flour or corn tortillas",
      "Extra lime wedges and hot sauce for serving"
    ],
    steps:[
      "Make the mango salsa first so the flavors can meld: combine diced mango, red onion, jalapeño, cilantro/parsley, and lime juice. Season with salt. Taste — it should be sweet, tangy, and slightly spicy. Cover and refrigerate.",
      "Make the slaw: toss coleslaw mix with lime juice, olive oil, honey, salt, and pepper until well coated. Let sit at least 10 minutes to soften slightly.",
      "Pat shrimp completely dry with paper towels. Dry shrimp sear — wet shrimp steam. Toss with olive oil, cumin, smoked paprika, garlic powder, onion powder, cayenne if using, salt, and pepper.",
      "Heat a large cast iron or stainless skillet over HIGH heat until very hot — you want a quick, hard sear. Add shrimp in a single layer (work in batches if needed — don't crowd the pan). Cook 1.5–2 minutes without touching, then flip. Cook another 1–1.5 minutes until pink, slightly charred, and cooked through. Shrimp curl into a C-shape when done — don't overcook or they get rubbery.",
      "Warm tortillas: in a dry skillet over medium-high heat, 20–30 seconds per side until lightly charred and pliable. Stack under a towel to stay warm.",
      "Assemble tacos: tortilla → small handful of slaw → 3–4 shrimp → big spoonful of mango salsa → squeeze of lime.",
      "Serve immediately with extra lime wedges and hot sauce on the side."
    ]
  },

  "Cold Farro Salad + Grilled Shrimp": {
    time:"35 min + chill", servings:"4",
    ingredients:[
      "1.5 cups semi-pearled farro (rinse before cooking)",
      "4 cups water or vegetable broth (broth adds much more flavor)",
      "1 lb large shrimp, peeled and deveined",
      "1 tbsp olive oil + 1 tsp each smoked paprika, garlic powder for shrimp",
      "1 English cucumber, diced",
      "½ cup Kalamata olives, halved",
      "4 oz crumbled feta cheese",
      "1 jar (12 oz) roasted red peppers, drained and chopped",
      "¼ cup fresh flat-leaf parsley, chopped",
      "3 green onions, thinly sliced",
      "— FOR DRESSING —",
      "4 tbsp extra virgin olive oil",
      "2 tbsp red wine vinegar",
      "Juice of 1 lemon",
      "1 tsp Dijon mustard",
      "1 garlic clove, minced",
      "1 tsp dried oregano",
      "½ tsp honey",
      "Salt and pepper to taste"
    ],
    steps:[
      "Cook the farro: bring broth or water to a boil. Add rinsed farro and 1 tsp salt. Reduce to a simmer, cover, and cook 25–30 minutes until tender but still chewy (al dente). Drain any excess liquid.",
      "Spread cooked farro on a large sheet pan in a single layer. This lets it cool quickly and prevents it from getting gummy. Let cool to room temperature, about 15 minutes, then refrigerate until cold.",
      "Make the dressing: whisk together olive oil, red wine vinegar, lemon juice, Dijon, garlic, oregano, honey, salt, and pepper. Taste and adjust — it should be tangy and bright.",
      "Season shrimp with olive oil, smoked paprika, garlic powder, salt, and pepper. Grill or sear in a hot skillet 2 minutes per side until pink and lightly charred. Transfer to a plate and refrigerate until cool.",
      "Once farro is cold, combine in a large bowl with cucumber, olives, feta, roasted red peppers, parsley, and green onions. Pour dressing over and toss well.",
      "Taste and adjust seasoning — cold food often needs more salt. The salad should taste bright and bold.",
      "Top with the chilled shrimp right before serving. This salad keeps well in the fridge for up to 2 days (store shrimp separately)."
    ]
  },

  "Lamb Kofta + Tabbouleh + Tzatziki": {
    time:"45 min", servings:"4",
    ingredients:[
      "— FOR KOFTA —",
      "1.5 lbs ground lamb (80/20 fat ratio is best)",
      "½ yellow onion, grated on a box grater, liquid squeezed out",
      "4 garlic cloves, minced",
      "3 tbsp fresh flat-leaf parsley, finely chopped",
      "1 tsp ground cumin",
      "1 tsp ground coriander",
      "1 tsp smoked paprika",
      "½ tsp ground cinnamon",
      "½ tsp ground allspice",
      "½ tsp black pepper",
      "1 tsp kosher salt",
      "— FOR TABBOULEH —",
      "1 cup fine bulgur wheat (or farro, cooked and cooled)",
      "2 bunches flat-leaf parsley, very finely chopped (about 3 cups)",
      "½ bunch fresh mint, finely chopped",
      "3 roma tomatoes, seeded and finely diced",
      "½ English cucumber, finely diced",
      "3 green onions, thinly sliced",
      "Juice of 2 lemons, 3 tbsp olive oil, salt",
      "— FOR TZATZIKI —",
      "1 cup full-fat Greek yogurt",
      "1 English cucumber, grated on a box grater",
      "2 garlic cloves, minced or grated",
      "1 tbsp extra virgin olive oil",
      "1 tbsp fresh dill or mint, chopped",
      "Juice of ½ lemon",
      "Salt to taste",
      "Wooden skewers (soaked in water 30 min), warm pita for serving"
    ],
    steps:[
      "Make tzatziki first so it chills: grate cucumber and squeeze out as much liquid as possible using a clean kitchen towel — this step is critical or tzatziki will be watery. Mix with yogurt, garlic, olive oil, dill/mint, lemon juice, and salt. Refrigerate.",
      "Make bulgur for tabbouleh: place bulgur in a bowl, pour over 1 cup boiling water, cover with plastic wrap, and let steam 15 minutes. Fluff with a fork and spread on a plate to cool.",
      "While bulgur steams, make kofta mixture: combine lamb, grated onion, garlic, parsley, and all spices in a bowl. Mix with your hands until well combined but don't overwork it. Pinch off golf ball-sized portions and shape around the soaked skewers into 4-inch logs, pressing firmly so they hold.",
      "Assemble tabbouleh: combine cooled bulgur with finely chopped parsley, mint, tomatoes, cucumber, and green onions. Dress with lemon juice, olive oil, and salt. Tabbouleh should be herb-forward — the parsley is the main event, not the grain.",
      "Grill kofta over medium-high heat, 3–4 minutes per side, turning carefully (about 12 minutes total). They should be slightly charred outside and cooked through. Rest 3 minutes before serving.",
      "Serve kofta on a platter with tabbouleh, a generous bowl of tzatziki, and warm pita. Tear pita, scoop tzatziki, and wrap kofta with tabbouleh inside."
    ]
  },

  "Caprese Panzanella Salad": {
    time:"25 min", servings:"4",
    ingredients:[
      "½ loaf day-old ciabatta or sourdough (stale bread works best — it soaks up dressing without falling apart)",
      "4 tbsp extra virgin olive oil, divided",
      "1 tsp flaky sea salt for bread",
      "2 lbs ripe heirloom or beefsteak tomatoes, cut into irregular chunks",
      "1 pint cherry tomatoes, halved",
      "1 small red onion, very thinly sliced",
      "2 tbsp capers, drained",
      "⅓ cup Kalamata olives, pitted and halved",
      "5 oz block feta, broken into rough chunks",
      "Large handful of fresh basil leaves",
      "— FOR DRESSING —",
      "3 tbsp extra virgin olive oil",
      "1.5 tbsp red wine vinegar",
      "1 garlic clove, minced",
      "1 tsp Dijon mustard",
      "Salt and black pepper"
    ],
    steps:[
      "Tear or cut ciabatta into rough 1.5-inch chunks. Heat 2 tbsp olive oil in a large skillet over medium-high. Add bread and a pinch of salt. Toast, tossing occasionally, until deep golden brown and crispy on the outside, about 6–8 minutes. Set aside to cool — they must be completely cooled before assembling or they'll turn mushy.",
      "Soak the thinly sliced red onion in a bowl of cold water for 10 minutes. This mellows the sharp raw flavor significantly. Drain and pat dry.",
      "Cut tomatoes into irregular chunks — not too small. The key is variety in size and texture. Season tomatoes with a pinch of salt and let them sit in a colander 5 minutes to release some liquid.",
      "Make the dressing: whisk olive oil, red wine vinegar, garlic, Dijon, salt, and pepper together until emulsified.",
      "In a large bowl, combine the tomatoes, soaked red onion, capers, and olives. Pour dressing over and toss gently. Fold in the cooled bread chunks — you want them coated but not broken up.",
      "Let the salad sit 10–15 minutes at room temperature. This is the magic step: the bread absorbs the dressing and tomato juices and becomes incredibly flavorful.",
      "Right before serving, scatter feta chunks and fresh basil leaves over the top. A final drizzle of your best olive oil and a crack of black pepper."
    ]
  },

  "Grilled Cod + Veggie Skewers": {
    time:"35 min", servings:"4",
    ingredients:[
      "1.5 lbs cod fillets, cut into 4 equal portions (about 1 inch thick)",
      "3 tbsp olive oil",
      "4 garlic cloves, minced",
      "Zest and juice of 1 lemon",
      "2 tsp dried oregano",
      "1 tsp smoked paprika",
      "Salt and black pepper",
      "— FOR VEGGIE SKEWERS —",
      "2 medium zucchini, cut into 1-inch rounds",
      "2 bell peppers (red and yellow), cut into 1.5-inch pieces",
      "1 red onion, cut into 1.5-inch chunks, layers separated",
      "1 pint cherry tomatoes, whole",
      "3 tbsp olive oil",
      "1 tsp dried oregano",
      "½ tsp garlic powder",
      "Salt and pepper",
      "8–10 wooden skewers, soaked in water 30 minutes",
      "Lemon wedges and fresh parsley for serving"
    ],
    steps:[
      "Soak wooden skewers in water at least 30 minutes to prevent burning on the grill.",
      "Make the cod marinade: mix olive oil, garlic, lemon zest, lemon juice, oregano, smoked paprika, salt, and pepper. Pat cod fillets dry and place in a shallow dish. Spoon marinade over and let sit 15 minutes.",
      "Thread vegetables onto skewers, alternating colors: zucchini → pepper → onion → cherry tomato. Leave a little space between pieces so they cook evenly rather than steaming each other. Brush with olive oil, oregano, garlic powder, salt, and pepper.",
      "Preheat grill to medium-high heat (about 400°F). For the cod, use a fish basket, well-oiled grill grates, or a piece of foil — cod is delicate and can fall apart. If using foil, poke a few small holes to let smoke through.",
      "Grill veggie skewers first — they take longer. Cook 10–12 minutes, turning every 3–4 minutes, until charred and tender.",
      "Add cod to the grill. Cook 4–5 minutes per side. Cod is done when it flakes easily and turns opaque all the way through. Don't flip more than once.",
      "Serve cod fillets topped with a squeeze of lemon and fresh parsley, with veggie skewers alongside. Offer extra lemon and a drizzle of olive oil at the table."
    ]
  },

  "Chickpea Salad + Roasted Red Pepper": {
    time:"15 min", servings:"4",
    ingredients:[
      "2 cans (15 oz each) chickpeas, drained and rinsed well",
      "1 jar (12 oz) roasted red peppers, drained and roughly chopped",
      "3 cups baby arugula",
      "½ small red onion, very thinly sliced",
      "⅓ cup Kalamata olives, halved",
      "4 oz feta cheese, crumbled",
      "2 tbsp fresh flat-leaf parsley, chopped",
      "— FOR DRESSING —",
      "3 tbsp extra virgin olive oil",
      "2 tbsp fresh lemon juice",
      "1 tsp ground cumin",
      "½ tsp smoked paprika",
      "¼ tsp red pepper flakes (adjust to taste)",
      "1 small garlic clove, minced",
      "1 tsp honey",
      "Salt and black pepper to taste",
      "Warm pita bread for serving"
    ],
    steps:[
      "Rinse chickpeas under cold water until the water runs clear. This removes the starchy liquid from the can and makes them taste much better. Spread on a paper towel and gently pat dry.",
      "Soak sliced red onion in cold water 5 minutes, then drain and pat dry — this removes the harsh bite.",
      "Make the dressing: whisk together olive oil, lemon juice, cumin, smoked paprika, red pepper flakes, garlic, honey, salt, and pepper. Taste — it should be bold and bright.",
      "In a large bowl, combine chickpeas, roasted red peppers, red onion, olives, and parsley. Pour two-thirds of the dressing over and toss well. Let sit 5 minutes for flavors to develop.",
      "Taste the chickpea mixture and adjust seasoning — it should be punchy and flavorful on its own.",
      "Just before serving, add arugula and crumbled feta. Drizzle remaining dressing over the top and toss gently — you don't want to fully wilt the arugula.",
      "Serve immediately with warm pita. The chickpea mixture (without arugula) keeps well in the fridge for 2 days."
    ]
  },

  "Garlic Butter Shrimp + Orzo": {
    time:"30 min", servings:"4",
    ingredients:[
      "1 lb orzo pasta",
      "1.5 lbs large shrimp (16/20 count), peeled, deveined, tails off",
      "2 medium zucchini, halved lengthwise then sliced into half-moons",
      "4 tbsp unsalted butter, divided",
      "2 tbsp olive oil",
      "6 garlic cloves, thinly sliced (not minced — slices get crispy)",
      "¼ tsp red pepper flakes",
      "½ cup dry white wine or chicken broth",
      "Juice and zest of 1 large lemon",
      "3 tbsp fresh flat-leaf parsley, chopped",
      "½ cup freshly grated Parmesan",
      "Salt and black pepper",
      "Extra lemon wedges for serving"
    ],
    steps:[
      "Bring a large pot of heavily salted water to boil. Cook orzo according to package directions until just al dente (usually 8–9 minutes). Reserve ½ cup pasta water before draining. Drain and toss with 1 tbsp olive oil to prevent sticking.",
      "Pat shrimp completely dry — this is essential for a good sear. Season generously with salt and pepper.",
      "Heat 1 tbsp olive oil in a large skillet over high heat. Add zucchini in a single layer. Cook undisturbed 2–3 minutes until golden brown on the bottom, then toss and cook 1 more minute. Season with salt and pepper. Remove and set aside.",
      "In the same pan, reduce heat to medium. Add 2 tbsp butter. Once foaming, add shrimp in a single layer. Sear 2 minutes without touching, flip, and cook 1 more minute. Remove shrimp to a plate — they will finish cooking when added back later.",
      "Add remaining 2 tbsp butter to the pan. Add sliced garlic and red pepper flakes. Cook, stirring frequently, 1–2 minutes until garlic is lightly golden (watch carefully — it burns fast).",
      "Pour in white wine or broth and let it bubble and reduce by half, about 2 minutes, scraping up any browned bits from the pan bottom — those are pure flavor.",
      "Add lemon zest, lemon juice, and drained orzo to the pan. Toss to combine, adding a splash of reserved pasta water if it looks dry.",
      "Return zucchini and shrimp to the pan. Toss everything together gently and heat through for 1 minute. Fold in parsley and Parmesan.",
      "Serve immediately in warmed bowls with extra lemon wedges. This dish waits for no one — eat it hot."
    ]
  },

  "Avocado Toast + Everything Seasoning": {
    time:"12 min", servings:"4",
    ingredients:[
      "8 slices thick-cut sourdough, ciabatta, or country bread",
      "3 large ripe avocados (they should yield to gentle pressure)",
      "Juice of 1 lemon",
      "¼ tsp garlic powder",
      "½ tsp kosher salt",
      "¼ tsp black pepper",
      "3–4 tbsp everything bagel seasoning",
      "Optional toppings: flaky sea salt, red pepper flakes, microgreens",
      "Optional: 2 eggs, fried or poached, for a protein boost"
    ],
    steps:[
      "Toast bread until deep golden brown and crispy — you want structural integrity so the toast can hold the toppings without going soggy. A toaster works, but a cast iron skillet with a thin layer of olive oil gives you an incredible crispy crust.",
      "Halve avocados, remove pits. Score the flesh in a crosshatch pattern without cutting through the skin, then scoop out with a large spoon into a bowl. The crosshatch makes mashing easier and more even.",
      "Add lemon juice, garlic powder, salt, and pepper. Mash with a fork to your preferred texture — some like it completely smooth, others prefer a chunkier, more rustic texture. Taste and adjust seasoning. The lemon keeps it from browning.",
      "Spread avocado mixture generously onto each toast. Don't be shy — pile it on.",
      "Sprinkle everything bagel seasoning liberally over each piece. The seasoning has sesame seeds, poppy seeds, garlic, onion, and salt — it does a lot of the flavor work.",
      "Add any optional toppings: a pinch of flaky sea salt, red pepper flakes for heat, microgreens for freshness. If making a fried egg, slide it on top while still runny.",
      "Serve immediately — avocado toast is a right-now food, not a wait-around food."
    ],
    kidTip:"Great skill-builder for older kids! Teach proper knife grip for halving avocados (adult supervises), then let them mash and season to taste. They learn to cook by feel rather than just following numbers."
  },

  "Grilled Lamb Chops + Watermelon Salad": {
    time:"30 min + 1hr marinate", servings:"4",
    ingredients:[
      "4 lamb loin chops, about 1.5 inches thick",
      "3 tbsp olive oil",
      "4 garlic cloves, minced",
      "2 tsp fresh rosemary, finely chopped",
      "1 tsp fresh thyme leaves",
      "Zest of 1 lemon",
      "1 tsp kosher salt",
      "½ tsp black pepper",
      "— FOR WATERMELON SALAD —",
      "5 cups seedless watermelon, cut into 1-inch cubes",
      "5 oz block feta cheese, crumbled into large pieces",
      "½ small red onion, very thinly sliced",
      "Large handful of fresh mint leaves, torn",
      "Small handful of fresh basil (optional but wonderful)",
      "2 tbsp extra virgin olive oil",
      "1 tbsp fresh lime juice",
      "½ tsp flaky sea salt",
      "Pinch of black pepper"
    ],
    steps:[
      "Marinate chops: combine olive oil, garlic, rosemary, thyme, lemon zest, salt, and pepper. Rub all over lamb chops. Let marinate at room temperature for 1 hour, or refrigerate up to 8 hours (bring to room temp 30 min before cooking).",
      "Make the watermelon salad: soak sliced red onion in cold water 10 minutes, drain and pat dry. In a large bowl, gently combine watermelon cubes, feta, and red onion. Add mint and basil. Drizzle with olive oil and lime juice, sprinkle with flaky sea salt and pepper. Toss gently — you don't want to break up the watermelon. Refrigerate until serving.",
      "Preheat grill or cast iron skillet to HIGH heat. You want a searingly hot surface for lamp chops.",
      "Sear lamb chops without moving them: 3–4 minutes for medium-rare (internal temp 130–135°F), 4–5 minutes for medium (140–145°F). Flip once and repeat on the other side.",
      "Rest chops on a cutting board loosely tented with foil for 5 minutes — this is non-negotiable. Resting allows juices to redistribute. Cut into a chop before resting and all those beautiful juices run out onto your board.",
      "While chops rest, take the watermelon salad out of the fridge to come to room temperature.",
      "Serve chops alongside the watermelon salad. The sweet, cold salad against the hot, savory lamb is the whole point of this dish."
    ]
  },

  "Pan-Seared Tilapia + Tabbouleh": {
    time:"35 min", servings:"4",
    ingredients:[
      "1.5 lbs tilapia fillets (4 portions), patted very dry",
      "2 tsp smoked paprika",
      "1 tsp ground cumin",
      "1 tsp garlic powder",
      "½ tsp onion powder",
      "1 tsp salt",
      "½ tsp black pepper",
      "2 tbsp olive oil for cooking",
      "Lemon wedges for serving",
      "— FOR TABBOULEH —",
      "1 cup fine bulgur wheat",
      "1 cup boiling water",
      "3 bunches flat-leaf parsley (this is a lot — tabbouleh is mostly parsley, not grain)",
      "½ bunch fresh mint leaves, finely chopped",
      "4 roma tomatoes, seeded and finely diced",
      "½ English cucumber, finely diced",
      "4 green onions, thinly sliced",
      "Juice of 2–3 lemons (about ½ cup)",
      "4 tbsp extra virgin olive oil",
      "1 tsp salt, ¼ tsp black pepper",
      "Warm pita for serving"
    ],
    steps:[
      "Make tabbouleh: place bulgur in a heatproof bowl. Pour boiling water over, cover tightly with plastic wrap, and let steam 15–20 minutes. Fluff with a fork and spread on a plate to cool completely. Tabbouleh must be served at room temperature or cold — never warm.",
      "While bulgur cools, prep the herbs: parsley is the star of tabbouleh, not a garnish. Remove thick stems from all the parsley. Bunch the leaves together and chop very finely. The finer the chop, the better the tabbouleh.",
      "Combine cooled bulgur with parsley, mint, tomatoes, cucumber, and green onions. Dress with lemon juice, olive oil, salt, and pepper. Toss well and taste — it should be bright, lemony, and herbaceous. Refrigerate until fish is ready.",
      "Season tilapia fillets on both sides with the paprika-cumin spice blend. Let sit 5 minutes for the seasoning to adhere.",
      "Heat olive oil in a large non-stick or cast iron skillet over medium-high heat until shimmering. Carefully lay fillets in the pan — they should sizzle loudly. Don't move them.",
      "Cook 3–4 minutes until the edges turn opaque and the underside is deep golden brown. Flip carefully with a wide spatula. Cook another 2–3 minutes. Tilapia is done when it flakes easily at the thickest point.",
      "Serve fillets immediately over a generous portion of tabbouleh with warm pita and lemon wedges."
    ]
  },

  "French Toast + Honey & Berries": {
    time:"25 min", servings:"4",
    ingredients:[
      "8 thick slices brioche, challah, or Texas toast (1-inch thick — thin bread won't work)",
      "4 large eggs",
      "⅔ cup whole milk or half-and-half (richer custard)",
      "1 tsp pure vanilla extract",
      "1 tsp ground cinnamon",
      "¼ tsp freshly grated nutmeg (optional but excellent)",
      "1 tbsp sugar",
      "Pinch of salt",
      "2–3 tbsp unsalted butter, for the pan",
      "— FOR TOPPING —",
      "2 cups fresh mixed berries (strawberries sliced, blueberries, raspberries)",
      "3–4 tbsp good honey",
      "Powdered sugar for dusting (optional)",
      "Extra butter for serving"
    ],
    steps:[
      "Make the custard: crack eggs into a wide, shallow bowl or baking dish (you'll be dipping the bread in it). Add milk, vanilla extract, cinnamon, nutmeg, sugar, and pinch of salt. Whisk until completely smooth and slightly frothy.",
      "If bread is very fresh, let slices sit out 10 minutes to dry out slightly — or use bread that's 1–2 days old. Stale bread absorbs custard without falling apart.",
      "Heat a large non-stick or cast iron skillet or griddle over medium heat. Add 1 tbsp butter and let it melt and foam. Tilt pan to coat evenly.",
      "Dip a bread slice into the custard, letting it soak 20–30 seconds per side. You want it saturated but not falling apart. Let any excess drip off.",
      "Place soaked bread in the pan. Cook 2–3 minutes without moving until the bottom is deep golden brown. Flip gently and cook another 2–3 minutes. Adjust heat if it's browning too fast — you want the inside to cook through, not just the outside.",
      "Work in batches, adding more butter as needed. Keep finished slices warm in a 200°F oven on a baking sheet if making multiple batches.",
      "Serve plated with fresh berries piled on top, a generous drizzle of honey, and an optional dusting of powdered sugar. Serve immediately — French toast does not improve with age."
    ],
    kidTip:"Perfect for teaching egg technique! Kids whisk the custard (great arm workout), practice the dip-and-coat technique, and learn to judge doneness by color. Flipping with a spatula builds confidence at the stove. Supervise closely at the heat."
  },

  "Cold Pasta Salad + Tuna & Artichokes": {
    time:"25 min + chill", servings:"4",
    ingredients:[
      "1 lb rotini, fusilli, or farfalle (ridged shapes hold dressing better)",
      "3 cans (5 oz each) tuna packed in olive oil — leave a little oil when draining",
      "1 can (14 oz) artichoke hearts in water, drained and quartered",
      "⅓ cup Kalamata olives, halved",
      "1 jar (8 oz) roasted red peppers, drained and sliced",
      "2 tbsp capers, drained",
      "½ small red onion, finely diced",
      "3 tbsp fresh flat-leaf parsley, chopped",
      "Optional: handful of baby arugula or spinach stirred in at the end",
      "— FOR DRESSING —",
      "5 tbsp extra virgin olive oil",
      "2.5 tbsp red wine vinegar",
      "Juice of 1 large lemon",
      "2 garlic cloves, minced",
      "1.5 tsp dried oregano",
      "1 tsp Dijon mustard",
      "½ tsp red pepper flakes",
      "Salt and black pepper to taste"
    ],
    steps:[
      "Cook pasta in heavily salted boiling water until just al dente — check 1 minute before package directions say it's done. It will continue absorbing dressing as it chills, so slightly underdone is correct here.",
      "Drain pasta and immediately rinse under cold water to stop cooking and cool it down quickly. Shake off excess water and toss with 1 tbsp olive oil to prevent clumping.",
      "Make the dressing: whisk together all dressing ingredients in a small bowl. Taste — it should be punchy and assertive since the pasta will dilute the flavor when cold.",
      "Combine cooled pasta with drained tuna, artichoke hearts, olives, roasted red peppers, capers, red onion, and parsley.",
      "Pour dressing over and toss thoroughly. Taste and adjust salt, pepper, and lemon — cold salads need more seasoning than warm dishes.",
      "Refrigerate at least 1 hour, ideally 2–3 hours. The pasta absorbs the dressing and the flavors meld together significantly. Before serving, taste again and add a splash of olive oil and squeeze of lemon if needed — chilling dulls the flavors.",
      "If using arugula or spinach, fold in right before serving so it stays fresh. Serve cold."
    ]
  },

  "Grilled Branzino + Red Pepper Couscous": {
    time:"40 min", servings:"4",
    ingredients:[
      "2 whole branzino (about 1.5 lbs each), cleaned and scaled (or 4 fillets)",
      "4 tbsp olive oil, divided",
      "4 garlic cloves, thinly sliced",
      "1 lemon, sliced into rounds",
      "Fresh herbs for stuffing: 4 sprigs thyme, 4 sprigs rosemary, fresh parsley",
      "1 tsp each: dried oregano, smoked paprika, salt, black pepper",
      "— FOR RED PEPPER COUSCOUS —",
      "1.5 cups couscous (instant variety)",
      "1.5 cups boiling vegetable or chicken broth (not water — broth makes a huge difference)",
      "1 jar (12 oz) roasted red peppers, drained and finely chopped",
      "⅓ cup Kalamata olives, roughly chopped",
      "¼ cup fresh flat-leaf parsley, chopped",
      "2 tbsp extra virgin olive oil",
      "Juice and zest of 1 lemon",
      "2 tbsp toasted pine nuts (toast in a dry pan 2–3 min until golden)",
      "Salt and black pepper to taste"
    ],
    steps:[
      "Make couscous: place couscous in a heatproof bowl. Pour hot boiling broth over, drizzle with 1 tbsp olive oil, and immediately cover tightly with plastic wrap or a plate. Let steam undisturbed 5 minutes.",
      "Fluff couscous with a fork, breaking up any clumps. Add roasted red peppers, olives, parsley, remaining olive oil, lemon juice and zest, and toasted pine nuts. Season with salt and pepper. Set aside — couscous is served at room temperature.",
      "Prepare branzino: use a sharp knife to score the skin 3–4 times on each side, cutting about ¼ inch deep. This prevents the skin from curling, helps it cook evenly, and lets the marinade penetrate.",
      "Rub fish inside and out with olive oil, oregano, smoked paprika, salt, and pepper. Stuff each cavity generously with lemon slices, herb sprigs, and garlic slices.",
      "Preheat grill to medium-high. Brush grates very well with oil — fish skin sticks badly to poorly oiled grates. Place fish on grill and cook without touching for 5–6 minutes until skin is crispy and releases naturally. If it sticks, it's not ready to flip.",
      "Flip carefully using two spatulas. Cook another 5–6 minutes. Fish is done when the flesh near the backbone turns opaque and flakes away from the bone. The eye will turn white.",
      "Let fish rest 3 minutes. Serve whole on a platter over the couscous, garnished with lemon wedges and fresh parsley. To eat, run a spoon along the backbone to lift the top fillet cleanly away from the bones."
    ]
  },
};

const THIS_WEEK_SHOPPING = {
  "🐟 Seafood": ["Salmon fillets (1.5 lbs)", "Shrimp, peeled & deveined (2 lbs)", "Cod fillets (1.5 lbs)", "Tilapia fillets (1.5 lbs)", "Branzino or sea bass (1.5 lbs)", "Canned tuna in olive oil (4 cans)"],
  "🍗 Meat": ["Boneless chicken thighs (1.5 lbs)", "Ground lamb (1.5 lbs)", "Lamb loin chops (4)"],
  "🥬 Produce": ["Cucumbers (5)", "Cherry tomatoes (3 pints)", "Roma/heirloom tomatoes (6)", "Red onion (4)", "Garlic (2 heads)", "Avocados (4)", "Lemons (8)", "Limes (4)", "Zucchini (3)", "Bell peppers (4)", "Corn on the cob (4 ears)", "Mango (2)", "Seedless watermelon (1 small)", "Arugula (1 bag)", "Mixed greens (large bag)", "Fresh parsley (3 bunches)", "Fresh mint (2 bunches)", "Jalapeño (1)", "Strawberries + blueberries"],
  "🥛 Dairy & Eggs": ["Eggs (2 dozen)", "Greek yogurt plain full-fat (2 x 32 oz)", "Feta cheese (12 oz)", "Milk", "Parmesan (small block)", "Butter"],
  "🍞 Grains & Bread": ["Farro (1 bag)", "Orzo (1 lb)", "Couscous (1 bag)", "Rotini pasta (1 lb)", "Pita bread (3 packs)", "Ciabatta bread (1 loaf)", "Thick-cut brioche (1 loaf)", "Granola (1 bag)", "Small flour tortillas (1 pack)", "Pita chips"],
  "🥫 Canned & Jarred": ["Crushed tomatoes (2 cans)", "Chickpeas (2 cans)", "White beans/cannellini (2 cans)", "Artichoke hearts (1 can)", "Kalamata olives (1 jar)", "Capers (1 small jar)", "Roasted red peppers (1 jar)", "Hummus (large container)", "Tahini (1 jar)"],
  "🫙 Pantry & Spices": ["Extra virgin olive oil (large bottle)", "Red wine vinegar", "Honey", "Cumin", "Smoked paprika", "Coriander", "Turmeric", "Cinnamon", "Allspice", "Dried oregano", "Everything bagel seasoning", "Red pepper flakes", "Vanilla extract"],
  "🥜 Extras": ["Almonds or mixed nuts", "Coleslaw mix", "Wooden skewers"],
};

// ─── HELPERS ───────────────────────────────────────────────────────────────────
const fmtTime = d => d.toLocaleTimeString("en-US", { hour:"numeric", minute:"2-digit", hour12:true });
const fmtDate = d => d.toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric" });

async function callClaude(messages, system) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, max_tokens: 2000, system, messages }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Server error ${res.status}: ${text.slice(0, 120)}`);
  }
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || data.error);
  return data.content?.[0]?.text || "";
}

// Per-serving macro estimates for the built-in recipes
const STATIC_MACROS = {
  "Greek Yogurt Parfaits": { calories:320, protein:18, carbs:42, fat:9 },
  "Greek Salad + Grilled Chicken": { calories:520, protein:42, carbs:18, fat:30 },
  "Lemon Herb Grilled Salmon": { calories:480, protein:38, carbs:28, fat:24 },
  "Scrambled Eggs with Feta": { calories:340, protein:22, carbs:6, fat:25 },
  "Mediterranean Tuna Wraps": { calories:450, protein:32, carbs:38, fat:20 },
  "Shrimp Tacos + Mango Salsa": { calories:510, protein:34, carbs:52, fat:18 },
  "Cold Farro Salad + Grilled Shrimp": { calories:490, protein:32, carbs:56, fat:16 },
  "Lamb Kofta + Tabbouleh + Tzatziki": { calories:620, protein:38, carbs:34, fat:36 },
  "Caprese Panzanella Salad": { calories:420, protein:14, carbs:40, fat:24 },
  "Grilled Cod + Veggie Skewers": { calories:380, protein:34, carbs:22, fat:16 },
  "Chickpea Salad + Roasted Red Pepper": { calories:430, protein:18, carbs:48, fat:20 },
  "Garlic Butter Shrimp + Orzo": { calories:560, protein:36, carbs:58, fat:20 },
  "Avocado Toast + Everything Seasoning": { calories:380, protein:10, carbs:38, fat:22 },
  "Grilled Lamb Chops + Watermelon Salad": { calories:560, protein:36, carbs:22, fat:36 },
  "Pan-Seared Tilapia + Tabbouleh": { calories:420, protein:36, carbs:34, fat:16 },
  "French Toast + Honey & Berries": { calories:460, protein:14, carbs:64, fat:16 },
  "Cold Pasta Salad + Tuna & Artichokes": { calories:520, protein:30, carbs:56, fat:18 },
  "Grilled Branzino + Red Pepper Couscous": { calories:470, protein:40, carbs:38, fat:16 },
};

// ─── RECIPE CATEGORIES ─────────────────────────────────────────────────────────
const RECIPE_CATEGORIES = {
  "Greek Yogurt Parfaits":"breakfast", "Scrambled Eggs with Feta":"breakfast",
  "Avocado Toast + Everything Seasoning":"breakfast", "French Toast + Honey & Berries":"breakfast",
  "Lemon Herb Grilled Salmon":"fish", "Mediterranean Tuna Wraps":"fish",
  "Shrimp Tacos + Mango Salsa":"fish", "Cold Farro Salad + Grilled Shrimp":"fish",
  "Garlic Butter Shrimp + Orzo":"fish", "Grilled Cod + Veggie Skewers":"fish",
  "Pan-Seared Tilapia + Tabbouleh":"fish", "Grilled Branzino + Red Pepper Couscous":"fish",
  "Cold Pasta Salad + Tuna & Artichokes":"fish",
  "Greek Salad + Grilled Chicken":"chicken",
  "Lamb Kofta + Tabbouleh + Tzatziki":"lamb", "Grilled Lamb Chops + Watermelon Salad":"lamb",
  "Caprese Panzanella Salad":"vegetarian", "Chickpea Salad + Roasted Red Pepper":"vegetarian",
};
const CATEGORIES = [
  { key:"all",        icon:"📚", label:"All",           color:"#1E3A5F", bg:"#DBEAFE" },
  { key:"fish",       icon:"🐟", label:"Fish",           color:"#0C4A6E", bg:"#E0F2FE" },
  { key:"chicken",    icon:"🍗", label:"Chicken",        color:"#92400E", bg:"#FEF3C7" },
  { key:"lamb",       icon:"🥩", label:"Lamb",           color:"#7F1D1D", bg:"#FEE2E2" },
  { key:"vegetarian", icon:"🥗", label:"Vegetarian",     color:"#14532D", bg:"#DCFCE7" },
  { key:"breakfast",  icon:"🌅", label:"Breakfast",      color:"#78350F", bg:"#FFF7ED" },
  { key:"ai",         icon:"🤖", label:"AI Generated",   color:"#4C1D95", bg:"#EDE9FE" },
];
// Build emoji lookup from THIS_WEEK
const RECIPE_EMOJI = {};
THIS_WEEK.forEach(d => ["breakfast","lunch","dinner"].forEach(t => { if (d[t]) RECIPE_EMOJI[d[t].name] = d[t].emoji; }));

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────

function StarRating({ name, ratings, onRate }) {
  const current = ratings[name] || 0;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
      <span style={{ fontSize:12, fontWeight:700, color:C.textMid, textTransform:"uppercase", letterSpacing:".05em" }}>Rate:</span>
      <div style={{ display:"flex", gap:2 }}>
        {[1,2,3,4,5].map(star => (
          <button key={star} onClick={() => onRate(name, star === current ? 0 : star)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:22, padding:"2px", lineHeight:1, color: star <= current ? "#F59E0B" : "#D1D5DB", transition:"color .15s, transform .1s" }}
            onMouseEnter={e => e.currentTarget.style.transform="scale(1.2)"}
            onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}
          >{star <= current ? "★" : "☆"}</button>
        ))}
      </div>
      {current > 0 && <span style={{ fontSize:11, color:"#92400E", background:"#FEF3C7", padding:"2px 7px", borderRadius:20, fontWeight:600 }}>{current}/5</span>}
    </div>
  );
}

function MealCard({ type, meal, onTap, ratings }) {
  const s = MEAL_STYLE[type];
  const label = type.charAt(0).toUpperCase() + type.slice(1);
  const rating = meal ? (ratings?.[meal.name] || 0) : 0;
  const EFFORT_BADGE = {
    quick: { icon:"⚡", text:"Quick", bg:"rgba(251,191,36,.25)", color:"#92400E" },
    challenging: { icon:"👨‍🍳", text:"Involved", bg:"rgba(168,85,247,.25)", color:"#581C87" },
    leftover: { icon:"🍱", text:"Leftovers", bg:"rgba(34,197,94,.25)", color:"#14532D" },
    eatingOut: { icon:"🍽️", text:"Eating Out", bg:"rgba(148,163,184,.3)", color:"#1E293B" },
  };
  const effortBadge = meal?.effort ? EFFORT_BADGE[meal.effort] : null;
  if (!meal) return (
    <div style={{ flex:"1 1 140px", borderRadius:18, background:C.stone, border:"2px dashed #CBD5E1", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px 12px", gap:6, opacity:.45, minHeight:160 }}>
      <div style={{ fontSize:24 }}>—</div>
      <div style={{ fontSize:12, color:C.textMid, fontWeight:700, textTransform:"uppercase" }}>{label}</div>
    </div>
  );
  return (
    <div onClick={() => onTap(meal, type)} style={{ flex:"1 1 140px", borderRadius:18, background:s.bg, cursor:"pointer", padding:"18px 16px 16px", display:"flex", flexDirection:"column", gap:8, minHeight:160, boxShadow:"0 4px 18px rgba(15,45,94,.13)", userSelect:"none", transition:"transform .15s,box-shadow .15s" }}
      onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 10px 30px rgba(15,45,94,.22)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 4px 18px rgba(15,45,94,.13)"; }}
    >
      <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
        <span style={{ fontSize:10, fontWeight:700, letterSpacing:".07em", textTransform:"uppercase", color:s.labelColor, background:s.labelBg, padding:"3px 9px", borderRadius:20 }}>{s.icon} {label}</span>
        {meal.kidFriendly && <span style={{ fontSize:10, fontWeight:700, color:"#065F46", background:"rgba(16,185,129,.2)", padding:"3px 7px", borderRadius:20 }}>👦 Kids</span>}
        {effortBadge && <span style={{ fontSize:10, fontWeight:700, color:effortBadge.color, background:effortBadge.bg, padding:"3px 7px", borderRadius:20 }}>{effortBadge.icon} {effortBadge.text}</span>}
      </div>
      <div style={{ fontSize:28, lineHeight:1 }}>{meal.emoji}</div>
      <div style={{ fontSize:15, fontWeight:700, color:s.textColor, lineHeight:1.25, flex:1 }}>{meal.name}</div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:12, color:s.textColor, opacity:.75 }}>
          ⏱ {meal.time}
          {rating > 0 && <span style={{ marginLeft:6 }}>{["","★","★★","★★★","★★★★","★★★★★"][rating]}</span>}
        </span>
        <span style={{ fontSize:11, fontWeight:600, color:s.textColor, opacity:.8, background:s.labelBg, padding:"3px 10px", borderRadius:20 }}>Recipe →</span>
      </div>
    </div>
  );
}

function RecipeModal({ meal, type, onClose, favorites, ratings, onFavorite, onRate, recipeData, onLog }) {
  const [logged, setLogged] = useState(false);
  const [logging, setLogging] = useState(false);
  // recipeData prop used for AI-generated recipes not in the static RECIPES object
  const recipe = recipeData || RECIPES[meal.name];
  const s = MEAL_STYLE[type];
  const isFav = favorites.includes(meal.name);
  if (!recipe) return (
    <Overlay onClose={onClose}>
      <div style={{ background:C.white, borderRadius:22, padding:32, maxWidth:400, width:"100%", textAlign:"center" }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize:32, marginBottom:12 }}>{meal.emoji}</div>
        <div style={{ fontSize:18, fontWeight:700, marginBottom:8 }}>{meal.name}</div>
        <div style={{ color:C.textMid, fontSize:14 }}>Recipe details coming soon — ask Claude for help cooking this!</div>
        <button onClick={onClose} style={{ marginTop:20, background:C.navy, color:C.white, border:"none", borderRadius:12, padding:"10px 24px", cursor:"pointer", fontWeight:700 }}>Close</button>
      </div>
    </Overlay>
  );
  return (
    <Overlay onClose={onClose}>
      <div style={{ background:C.white, borderRadius:22, width:"100%", maxWidth:600, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 24px 80px rgba(15,45,94,.35)" }} onClick={e => e.stopPropagation()}>
        <div style={{ background:s.bg, borderRadius:"22px 22px 0 0", padding:"24px 24px 20px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <span style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", color:s.labelColor, background:s.labelBg, padding:"3px 10px", borderRadius:20 }}>{s.icon} {type}</span>
              <div style={{ fontSize:28, marginTop:10, marginBottom:4 }}>{meal.emoji}</div>
              <div style={{ fontSize:20, fontWeight:800, color:s.textColor, lineHeight:1.2 }}>{meal.name}</div>
              <div style={{ fontSize:13, color:s.textColor, opacity:.75, marginTop:6 }}>⏱ {recipe.time} · 👥 Serves {recipe.servings}</div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8 }}>
              <button onClick={onClose} style={{ background:s.labelBg, border:"none", borderRadius:50, width:38, height:38, cursor:"pointer", fontSize:16, color:s.textColor, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
              <button onClick={() => onFavorite(meal.name)} title={isFav ? "Remove from favorites" : "Save to favorites"} style={{ background:s.labelBg, border:"none", borderRadius:50, width:38, height:38, cursor:"pointer", fontSize:20, display:"flex", alignItems:"center", justifyContent:"center", transition:"transform .15s" }}
                onMouseEnter={e => e.currentTarget.style.transform="scale(1.2)"}
                onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}
              >{isFav ? "❤️" : "🤍"}</button>
            </div>
          </div>
        </div>
        <div style={{ padding:"22px 24px", display:"flex", flexDirection:"column", gap:20 }}>
          <Section title="INGREDIENTS">
            {recipe.ingredients.map((ing, i) => <Row key={i}>{ing}</Row>)}
          </Section>
          <Section title="INSTRUCTIONS">
            {recipe.steps.map((step, i) => <NumRow key={i} n={i+1}>{step}</NumRow>)}
          </Section>
          {recipe.kidTip && (
            <div style={{ background:"linear-gradient(135deg,#ECFDF5,#D1FAE5)", borderRadius:14, padding:"14px 16px", display:"flex", gap:10 }}>
              <span style={{ fontSize:20 }}>👦</span>
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:"#065F46", marginBottom:3, textTransform:"uppercase" }}>KID SKILL BUILDER</div>
                <div style={{ fontSize:13, color:"#064E3B", lineHeight:1.4 }}>{recipe.kidTip}</div>
              </div>
            </div>
          )}
          {/* Macros */}
          {(() => {
            const m = recipe.macros || STATIC_MACROS[meal.name];
            if (!m) return null;
            return (
              <div style={{ background:C.stone, borderRadius:14, padding:"12px 14px" }}>
                <div style={{ fontSize:11, fontWeight:700, color:C.textMid, textTransform:"uppercase", letterSpacing:".05em", marginBottom:8 }}>Per Serving</div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {[["🔥", m.calories, "cal"], ["🥩", m.protein, "g protein"], ["🌾", m.carbs, "g carbs"], ["🧈", m.fat, "g fat"]].map(([ic, v, u]) => (
                    <div key={u} style={{ background:C.white, borderRadius:10, padding:"7px 11px", fontSize:12, fontWeight:700, color:C.text, display:"flex", alignItems:"center", gap:5 }}>{ic} {v} <span style={{ fontWeight:500, color:C.textMid }}>{u}</span></div>
                  ))}
                </div>
              </div>
            );
          })()}
          {/* Rating + Favorite + Log */}
          <div style={{ borderTop:"1.5px solid #E2E8F0", paddingTop:16, display:"flex", flexDirection:"column", gap:12 }}>
            <StarRating name={meal.name} ratings={ratings} onRate={onRate} />
            {onLog && (
              <button onClick={async () => { if (logged || logging) return; setLogging(true); await onLog(meal, type, recipe); setLogging(false); setLogged(true); }} style={{ display:"flex", alignItems:"center", gap:8, background: logged ? "#F0FDF4" : "#EFF6FF", border:`1.5px solid ${logged ? "#86EFAC" : "#93C5FD"}`, borderRadius:12, padding:"10px 16px", cursor: logged ? "default" : "pointer", fontSize:13, fontWeight:700, color: logged ? "#15803D" : "#1D4ED8", width:"fit-content", transition:"all .2s" }}>
                {logged ? "✓ Logged to today's macros" : logging ? "Logging…" : "🍽️ I ate this — log macros"}
              </button>
            )}
            <button onClick={() => onFavorite(meal.name)} style={{ display:"flex", alignItems:"center", gap:8, background:isFav?"#FFF1F2":"#F8FAFC", border:`1.5px solid ${isFav?"#FDA4AF":"#E2E8F0"}`, borderRadius:12, padding:"10px 16px", cursor:"pointer", fontSize:13, fontWeight:700, color:isFav?"#BE123C":C.textMid, width:"fit-content", transition:"all .2s" }}>
              {isFav ? "❤️ Saved to Favorites" : "🤍 Save to Favorites"}
            </button>
          </div>
        </div>
      </div>
    </Overlay>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <div style={{ fontSize:11, fontWeight:700, letterSpacing:".06em", color:C.textMid, textTransform:"uppercase", marginBottom:10 }}>{title}</div>
      {children}
    </div>
  );
}
function Row({ children }) {
  return (
    <div style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:8 }}>
      <div style={{ width:6, height:6, borderRadius:"50%", background:C.blue, marginTop:6, flexShrink:0 }} />
      <span style={{ fontSize:14, color:C.text, lineHeight:1.4 }}>{children}</span>
    </div>
  );
}
function NumRow({ n, children }) {
  return (
    <div style={{ display:"flex", gap:12, alignItems:"flex-start", marginBottom:10 }}>
      <div style={{ width:24, height:24, borderRadius:"50%", background:C.navy, color:C.white, fontSize:11, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{n}</div>
      <span style={{ fontSize:14, color:C.text, lineHeight:1.5, paddingTop:3 }}>{children}</span>
    </div>
  );
}
function Overlay({ onClose, children }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,45,94,.7)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, padding:16 }} onClick={onClose}>
      {children}
    </div>
  );
}

// ─── FAVORITES VIEW ────────────────────────────────────────────────────────────
function FavoritesView({ favorites, ratings, allMeals, onTap, onFavorite, onRate }) {
  if (favorites.length === 0) {
    return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"48px 24px", textAlign:"center", gap:16 }}>
        <div style={{ fontSize:64 }}>🤍</div>
        <div style={{ fontSize:22, fontWeight:800, color:C.navy }}>No Favorites Yet</div>
        <div style={{ fontSize:15, color:C.textMid, maxWidth:300, lineHeight:1.6 }}>Tap any recipe card, then tap the 🤍 heart to save it here.</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom:16, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ fontSize:20, fontWeight:800, color:C.navy }}>⭐ Favorites</div>
        <div style={{ fontSize:12, color:C.textMid }}>{favorites.length} saved</div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {favorites.map(name => {
          const meal = allMeals.find(m => m.name === name);
          const recipe = RECIPES[name];
          const rating = ratings[name] || 0;
          const type = allMeals.find(m => m.name === name)?._type || "dinner";
          const s = MEAL_STYLE[type];
          if (!recipe) return null;
          return (
            <div key={name} style={{ background:C.white, borderRadius:16, border:"1.5px solid #E2E8F0", overflow:"hidden", boxShadow:"0 2px 8px rgba(15,45,94,.06)" }}>
              <div style={{ background:s.bg, padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:22 }}>{meal?.emoji || "🍽️"}</span>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:s.textColor, lineHeight:1.2 }}>{name}</div>
                    <div style={{ fontSize:11, color:s.textColor, opacity:.75, marginTop:2 }}>⏱ {recipe.time} · 👥 {recipe.servings}</div>
                  </div>
                </div>
                <div style={{ display:"flex", gap:6 }}>
                  <button onClick={() => onFavorite(name)} style={{ background:"rgba(255,255,255,.2)", border:"none", borderRadius:50, width:32, height:32, cursor:"pointer", fontSize:15, display:"flex", alignItems:"center", justifyContent:"center" }}>❤️</button>
                  <button onClick={() => onTap(meal || { name, emoji:"🍽️" }, type)} style={{ background:"rgba(255,255,255,.2)", border:"none", borderRadius:50, width:32, height:32, cursor:"pointer", fontSize:14, fontWeight:700, color:s.textColor, display:"flex", alignItems:"center", justifyContent:"center" }}>→</button>
                </div>
              </div>
              <div style={{ padding:"10px 16px 12px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ display:"flex", gap:2 }}>
                  {[1,2,3,4,5].map(star => (
                    <button key={star} onClick={() => onRate(name, star === rating ? 0 : star)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, padding:"1px", color: star <= rating ? "#F59E0B" : "#D1D5DB" }}>{star <= rating ? "★" : "☆"}</button>
                  ))}
                </div>
                {rating > 0 && <span style={{ fontSize:11, color:"#92400E", background:"#FEF3C7", padding:"2px 8px", borderRadius:20, fontWeight:600 }}>{rating}/5 stars</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── RECIPES VIEW ──────────────────────────────────────────────────────────────
function RecipesView({ savedRecipes, favorites, ratings, onOpenRecipe, onFavorite, onRate, onDeleteAI }) {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("all");

  // Merge static + AI recipes
  const staticList = Object.entries(RECIPES).map(([name, data]) => ({
    name, emoji: RECIPE_EMOJI[name] || "🍽️",
    time: data.time, servings: data.servings,
    category: RECIPE_CATEGORIES[name] || "other",
    ingredients: data.ingredients, steps: data.steps, kidTip: data.kidTip,
    source: "static",
  }));
  const aiList = savedRecipes.map(r => ({ ...r, source:"ai", category: r.category || "ai" }));
  const all = [...staticList, ...aiList];

  const filtered = all.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.name.toLowerCase().includes(q)
      || (r.ingredients || []).some(i => i.toLowerCase().includes(q));
    const matchCat = activeCat === "all"
      || r.category === activeCat
      || (activeCat === "ai" && r.source === "ai");
    return matchSearch && matchCat;
  });

  // Group by category for display
  const grouped = {};
  filtered.forEach(r => {
    const cat = r.source === "ai" ? "ai" : (r.category || "other");
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(r);
  });

  return (
    <div>
      {/* Search */}
      <div style={{ position:"relative", marginBottom:12 }}>
        <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:16, pointerEvents:"none" }}>🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search recipes or ingredients…" style={{ width:"100%", padding:"11px 12px 11px 38px", border:"1.5px solid #E2E8F0", borderRadius:14, fontSize:13, background:C.white, color:C.text, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }} />
      </div>

      {/* Category filter chips */}
      <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:4, marginBottom:16 }}>
        {CATEGORIES.map(cat => {
          const count = cat.key === "all" ? all.length : all.filter(r => cat.key === "ai" ? r.source === "ai" : r.category === cat.key).length;
          if (count === 0 && cat.key !== "all") return null;
          const active = activeCat === cat.key;
          return (
            <button key={cat.key} onClick={() => setActiveCat(cat.key)} style={{ flexShrink:0, display:"flex", alignItems:"center", gap:5, padding:"7px 12px", borderRadius:20, border:`1.5px solid ${active ? cat.color : "#E2E8F0"}`, background: active ? cat.bg : C.white, color: active ? cat.color : C.textMid, fontSize:12, fontWeight:700, cursor:"pointer", transition:"all .15s" }}>
              {cat.icon} {cat.label} <span style={{ fontSize:10, opacity:.7 }}>{count}</span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign:"center", padding:"40px 24px", color:C.textMid }}>
          <div style={{ fontSize:40, marginBottom:10 }}>🔍</div>
          <div style={{ fontSize:14 }}>No recipes match "{search}"</div>
        </div>
      )}

      {/* Grouped recipe cards */}
      {CATEGORIES.filter(c => c.key !== "all" && grouped[c.key]?.length > 0).map(cat => (
        <div key={cat.key} style={{ marginBottom:24 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
            <div style={{ fontSize:11, fontWeight:800, letterSpacing:".06em", textTransform:"uppercase", color:cat.color, background:cat.bg, padding:"4px 10px", borderRadius:20 }}>{cat.icon} {cat.label}</div>
            <div style={{ fontSize:11, color:C.textMid }}>{grouped[cat.key].length} recipe{grouped[cat.key].length !== 1 ? "s" : ""}</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {(grouped[cat.key] || []).map(r => {
              const rating = ratings[r.name] || 0;
              const isFav = favorites.includes(r.name);
              return (
                <div key={r.name} style={{ background:C.white, borderRadius:14, border:"1.5px solid #E2E8F0", overflow:"hidden", display:"flex", alignItems:"stretch" }}>
                  <div onClick={() => onOpenRecipe(r)} style={{ flex:1, padding:"12px 14px", cursor:"pointer", display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ fontSize:26, flexShrink:0 }}>{r.emoji}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:14, fontWeight:700, color:C.text, lineHeight:1.3 }}>{r.name}</div>
                      <div style={{ fontSize:11, color:C.textMid, marginTop:2, display:"flex", gap:8, flexWrap:"wrap" }}>
                        <span>⏱ {r.time}</span>
                        <span>👥 {r.servings}</span>
                        {rating > 0 && <span style={{ color:"#F59E0B" }}>{"★".repeat(rating)}</span>}
                        {r.source === "ai" && <span style={{ color:"#7C3AED", fontWeight:600 }}>🤖 AI</span>}
                      </div>
                    </div>
                    <span style={{ color:C.textMid, fontSize:13, flexShrink:0 }}>→</span>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", borderLeft:"1px solid #E2E8F0" }}>
                    <button onClick={() => onFavorite(r.name)} style={{ flex:1, padding:"0 14px", background:"none", border:"none", cursor:"pointer", fontSize:18 }} title={isFav ? "Remove from favorites" : "Add to favorites"}>{isFav ? "❤️" : "🤍"}</button>
                    {r.source === "ai" && (
                      <button onClick={() => onDeleteAI(r.name)} style={{ flex:1, padding:"0 14px", background:"none", borderTop:"1px solid #E2E8F0", border:"none", borderTop:"1px solid #E2E8F0", cursor:"pointer", fontSize:14, color:"#EF4444" }} title="Remove AI recipe">🗑</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── CHAT MODAL ────────────────────────────────────────────────────────────────
// Parse a ```recipe ... ``` JSON block from a chat response
function parseRecipeBlock(text) {
  const m = text.match(/```recipe\n([\s\S]*?)\n```/);
  if (!m) return null;
  try { return JSON.parse(m[1]); } catch { return null; }
}
function stripRecipeBlock(text) {
  return text.replace(/```recipe\n[\s\S]*?\n```/g, "").trim();
}

function ChatModal({ onClose, weekLabel, savedRecipes, onSaveRecipe, profile, storagePrefix }) {
  const historyKey = `${storagePrefix || "anon"}:chatHistory`;
  const dietPrompt = DIETS[profile?.diet_type]?.prompt || DIETS["mediterranean-pescatarian"].prompt;
  const dietLabel = DIETS[profile?.diet_type]?.label || "Mediterranean";
  const defaultGreeting = { role:"assistant", content:`Hi ${profile?.display_name || "there"}! I'm your Hocklac Meals kitchen assistant. Ask me anything about ${weekLabel} — substitutions, prep tips, leftovers, or cooking help! 🫒\n\nI can also create new ${dietLabel} recipes for you — just ask and I'll generate one you can save directly to the 📖 Recipes tab.` };
  const [messages, setMessages] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(historyKey) || "null");
      return Array.isArray(saved) && saved.length > 0 ? saved : [defaultGreeting];
    } catch { return [defaultGreeting]; }
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [justSaved, setJustSaved] = useState({});
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, loading]);
  useEffect(() => { localStorage.setItem(historyKey, JSON.stringify(messages)); }, [messages]);

  const clearChat = () => {
    setMessages([defaultGreeting]);
    localStorage.removeItem(historyKey);
    setShowClearConfirm(false);
  };

  const SYSTEM = `You are the Hocklac Meals kitchen assistant. The user's name is ${profile?.display_name || "the user"} and they follow this diet: ${dietPrompt}. Be friendly, warm, and concise. Always respect their diet when suggesting food.

IMPORTANT: When asked to create, suggest, generate, or share a recipe, always include the full recipe in a structured block at the END of your response, in this exact format (no extra text inside the block):
\`\`\`recipe
{"name":"Recipe Name","emoji":"🍽️","time":"30 min","servings":"4","category":"fish|chicken|lamb|vegetarian|breakfast|other","ingredients":["2 lbs salmon, skin-on","3 tbsp olive oil"],"steps":["Step 1 details.","Step 2 details."],"kidTip":"Optional tip for kids helping cook","macros":{"calories":520,"protein":38,"carbs":45,"fat":22}}
\`\`\`
The macros field is your best per-serving estimate. This lets the user save the recipe to their collection with one tap. Always include it whenever you generate a recipe, even if just asked for a quick idea.`;

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role:"user", content:input };
    // Only send role/content to the API (strip recipe blocks from history)
    const apiMessages = [...messages, userMsg].map(m => ({ role:m.role, content:stripRecipeBlock(m.content || "") }));
    setMessages(p => [...p, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const reply = await callClaude(apiMessages, SYSTEM);
      setMessages(p => [...p, { role:"assistant", content:reply }]);
    } catch(err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setMessages(p => [...p, { role:"assistant", content:`⚠️ ${msg}` }]);
    }
    setLoading(false);
  };

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setInput("Speech recognition isn't supported in this browser — try Chrome!"); return; }
    const recognition = new SR();
    recognition.continuous = false; recognition.interimResults = false; recognition.lang = "en-US";
    setListening(true);
    recognition.onresult = (e) => { setInput(e.results[0][0].transcript); setListening(false); };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  const handleSaveRecipe = (recipe, msgIndex) => {
    onSaveRecipe(recipe);
    setJustSaved(prev => ({ ...prev, [msgIndex]: true }));
  };

  const QUICK = ["Create a quick fish taco recipe", "What can I sub for cod?", "Kid-friendly dinner idea?", "Make a lamb recipe for 2"];

  return (
    <Overlay onClose={onClose}>
      <div style={{ background:C.white, borderRadius:22, width:"100%", maxWidth:500, height:"85vh", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 24px 80px rgba(15,45,94,.35)" }} onClick={e => e.stopPropagation()}>
        <div style={{ background:`linear-gradient(135deg,${C.navy},${C.navyMid})`, padding:"18px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:"50%", background:"linear-gradient(135deg,#3B82F6,#06B6D4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🤖</div>
            <div>
              <div style={{ color:C.white, fontWeight:700, fontSize:15 }}>Kitchen Assistant</div>
              <div style={{ color:"#93C5FD", fontSize:11 }}>Claude AI · 🎤 Voice · 📖 Recipe saving</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            {messages.length > 1 && <button onClick={() => setShowClearConfirm(true)} title="Clear chat" style={{ background:"rgba(255,255,255,.15)", border:"none", borderRadius:50, width:34, height:34, cursor:"pointer", color:C.white, fontSize:15, display:"flex", alignItems:"center", justifyContent:"center" }}>🗑️</button>}
            <button onClick={onClose} style={{ background:"rgba(255,255,255,.15)", border:"none", borderRadius:50, width:34, height:34, cursor:"pointer", color:C.white, fontSize:15, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
          </div>
        </div>
        {showClearConfirm && (
          <div style={{ background:"#FEF2F2", borderBottom:"1.5px solid #FECACA", padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, flexShrink:0 }}>
            <span style={{ fontSize:13, color:"#991B1B", fontWeight:600 }}>Clear entire chat history?</span>
            <div style={{ display:"flex", gap:8, flexShrink:0 }}>
              <button onClick={clearChat} style={{ background:"#DC2626", color:C.white, border:"none", borderRadius:10, padding:"6px 14px", fontWeight:700, cursor:"pointer", fontSize:12 }}>Clear</button>
              <button onClick={() => setShowClearConfirm(false)} style={{ background:C.white, color:C.text, border:"1.5px solid #E2E8F0", borderRadius:10, padding:"6px 14px", fontWeight:600, cursor:"pointer", fontSize:12 }}>Cancel</button>
            </div>
          </div>
        )}
        <div style={{ flex:1, overflowY:"auto", padding:"14px 16px", display:"flex", flexDirection:"column", gap:10 }}>
          {messages.map((m, i) => {
            const recipe = m.role === "assistant" ? parseRecipeBlock(m.content || "") : null;
            const displayText = recipe ? stripRecipeBlock(m.content || "") : (m.content || "");
            const alreadySaved = recipe && savedRecipes.some(r => r.name === recipe.name);
            const saved = justSaved[i] || alreadySaved;
            return (
              <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:m.role==="user"?"flex-end":"flex-start", gap:6 }}>
                {displayText && (
                  <div style={{ maxWidth:"84%", padding:"11px 14px", borderRadius:m.role==="user"?"17px 17px 4px 17px":"17px 17px 17px 4px", background:m.role==="user"?`linear-gradient(135deg,${C.blue},${C.sky})`:C.stone, color:m.role==="user"?C.white:C.text, fontSize:14, lineHeight:1.5, whiteSpace:"pre-wrap" }}>{displayText}</div>
                )}
                {recipe && (
                  <div style={{ maxWidth:"90%", background:"linear-gradient(135deg,#EDE9FE,#DDD6FE)", border:"1.5px solid #A78BFA", borderRadius:16, padding:"12px 14px", display:"flex", flexDirection:"column", gap:8 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:22 }}>{recipe.emoji || "🍽️"}</span>
                      <div>
                        <div style={{ fontSize:13, fontWeight:800, color:"#3B0764" }}>{recipe.name}</div>
                        <div style={{ fontSize:11, color:"#6D28D9" }}>⏱ {recipe.time} · 👥 Serves {recipe.servings}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => !saved && handleSaveRecipe(recipe, i)}
                      style={{ padding:"8px 14px", borderRadius:10, border:"none", background: saved ? "#16A34A" : "#7C3AED", color:C.white, fontSize:12, fontWeight:700, cursor: saved ? "default" : "pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6, transition:"background .2s" }}
                    >
                      {saved ? "✓ Saved to Recipes tab!" : "📖 Save to Recipes"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {loading && <div style={{ display:"flex" }}><div style={{ background:C.stone, padding:"12px 16px", borderRadius:"17px 17px 17px 4px", display:"flex", gap:4 }}>{[0,1,2].map(i => <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:C.blue, animation:`bounce 1.2s ease-in-out ${i*.2}s infinite` }} />)}</div></div>}
          <div ref={endRef} />
        </div>
        <div style={{ padding:"8px 14px 0", display:"flex", gap:6, overflowX:"auto", flexShrink:0 }}>
          {QUICK.map(q => <button key={q} onClick={() => setInput(q)} style={{ background:C.stone, border:"1.5px solid #E2E8F0", borderRadius:20, padding:"5px 11px", fontSize:11, color:C.textMid, cursor:"pointer", whiteSpace:"nowrap", fontWeight:500, flexShrink:0 }}>{q}</button>)}
        </div>
        <div style={{ padding:"10px 14px 16px", display:"flex", gap:8, alignItems:"center", flexShrink:0 }}>
          <button onClick={startListening} disabled={listening} title="Tap to speak" style={{ width:44, height:44, borderRadius:"50%", border:"none", cursor:listening?"not-allowed":"pointer", background:listening?"linear-gradient(135deg,#EF4444,#DC2626)":`linear-gradient(135deg,#7C3AED,#6D28D9)`, color:C.white, fontSize:listening?12:20, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:listening?"0 0 0 4px rgba(239,68,68,.3)":"none", transition:"all .2s" }}>
            {listening ? "●" : "🎤"}
          </button>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==="Enter" && send()} placeholder={listening ? "Listening…" : "Ask anything or tap 🎤 to speak"} style={{ flex:1, border:"1.5px solid #E2E8F0", borderRadius:22, padding:"11px 16px", fontSize:14, outline:"none", background:listening?"#F5F3FF":C.stone, color:C.text, fontFamily:"inherit", transition:"background .2s" }} />
          <button onClick={send} disabled={loading || !input.trim()} style={{ width:44, height:44, borderRadius:"50%", border:"none", cursor:loading||!input.trim()?"not-allowed":"pointer", background:loading||!input.trim()?"#CBD5E1":`linear-gradient(135deg,${C.blue},${C.sky})`, color:C.white, fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>↑</button>
        </div>
      </div>
    </Overlay>
  );
}

// ─── SHOPPING LIST MODAL ───────────────────────────────────────────────────────
function ShoppingModal({ onClose, list, weekLabel, uid }) {
  const storageKey = `${uid || "anon"}:purchased_${weekLabel}`;
  const clearedKey = `${uid || "anon"}:listCleared_${weekLabel}`;

  // Use plain object instead of Set — React detects object reference changes reliably
  const [purchased, setPurchased] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(storageKey) || "{}");
      // Handle legacy array format from previous Set serialization
      if (Array.isArray(raw)) {
        const obj = {};
        raw.forEach(k => { obj[k] = true; });
        return obj;
      }
      return typeof raw === "object" && raw !== null ? raw : {};
    } catch { return {}; }
  });
  const [listCleared, setListCleared] = useState(() => localStorage.getItem(clearedKey) === "true");
  const [copied, setCopied] = useState(false);
  // confirmMode: null | "purchased" | "all"
  const [confirmMode, setConfirmMode] = useState(null);

  // Pull the latest shopping progress from Supabase so checkmarks stay in sync across devices.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("shopping_progress")
        .select("purchased, list_cleared")
        .eq("user_id", uid)
        .eq("week_label", weekLabel)
        .maybeSingle();
      if (cancelled || error || !data) return;
      const remote = data.purchased || {};
      setPurchased(remote);
      localStorage.setItem(storageKey, JSON.stringify(remote));
      setListCleared(!!data.list_cleared);
      localStorage.setItem(clearedKey, data.list_cleared ? "true" : "false");
    })();
    return () => { cancelled = true; };
  }, [weekLabel]);

  const syncProgress = (nextPurchased, nextCleared) => {
    supabase.from("shopping_progress").upsert(
      { user_id: uid, week_label: weekLabel, purchased: nextPurchased, list_cleared: nextCleared, updated_at: new Date().toISOString() },
      { onConflict: "user_id,week_label" }
    ).then(({ error }) => error && console.error("Shopping progress sync failed:", error));
  };

  const toggleItem = (key) => {
    setPurchased(prev => {
      const next = { ...prev };
      if (next[key]) {
        delete next[key];
      } else {
        next[key] = true;
      }
      localStorage.setItem(storageKey, JSON.stringify(next));
      syncProgress(next, listCleared);
      return next;
    });
  };

  const clearPurchasedOnly = () => {
    setPurchased({});
    localStorage.removeItem(storageKey);
    syncProgress({}, listCleared);
    setConfirmMode(null);
  };

  const clearEntireList = () => {
    setPurchased({});
    localStorage.removeItem(storageKey);
    localStorage.setItem(clearedKey, "true");
    setListCleared(true);
    syncProgress({}, true);
    setConfirmMode(null);
  };

  const restoreList = () => {
    localStorage.removeItem(clearedKey);
    setListCleared(false);
    syncProgress(purchased, false);
  };

  const totalItems = Object.values(list).flat().length;
  const purchasedCount = Object.keys(purchased).length;
  const progressPct = totalItems > 0 ? Math.round((purchasedCount / totalItems) * 100) : 0;

  const copyList = () => {
    const unpurchased = Object.entries(list)
      .map(([cat, items]) => {
        const remaining = items.filter((_, i) => !purchased[`${cat}::${i}`]);
        return remaining.length > 0 ? cat + "\n" + remaining.map(i => "  • " + i).join("\n") : null;
      }).filter(Boolean).join("\n\n");
    navigator.clipboard.writeText(weekLabel + " Shopping List\n\n" + unpurchased);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Overlay onClose={onClose}>
      <div style={{ background:C.white, borderRadius:22, width:"100%", maxWidth:600, maxHeight:"92vh", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 24px 80px rgba(15,45,94,.35)" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ background:`linear-gradient(135deg,${C.navy},${C.navyMid})`, padding:"18px 20px", flexShrink:0 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ color:C.white, fontWeight:800, fontSize:17 }}>🛒 Shopping List</div>
              <div style={{ color:"#93C5FD", fontSize:11, marginTop:2 }}>
                {weekLabel} · {listCleared ? "cleared" : `${totalItems} items`}
              </div>
            </div>
            <button onClick={onClose} style={{ background:"rgba(255,255,255,.15)", border:"none", borderRadius:50, width:34, height:34, cursor:"pointer", color:C.white, fontSize:15, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
          </div>
          {/* Progress bar */}
          {!listCleared && (
            <div style={{ marginTop:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                <span style={{ color:"#93C5FD", fontSize:11 }}>{purchasedCount} of {totalItems} items checked off</span>
                <span style={{ color:"#93C5FD", fontSize:11, fontWeight:700 }}>{progressPct}%</span>
              </div>
              <div style={{ height:6, background:"rgba(255,255,255,.15)", borderRadius:3, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${progressPct}%`, background:"linear-gradient(90deg,#34D399,#10B981)", borderRadius:3, transition:"width .3s" }} />
              </div>
            </div>
          )}
        </div>

        {/* Body — either cleared empty state, or the list */}
        {listCleared ? (
          <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"48px 24px", textAlign:"center", gap:16 }}>
            <div style={{ fontSize:56 }}>✅</div>
            <div style={{ fontSize:18, fontWeight:800, color:C.navy }}>List Cleared</div>
            <div style={{ fontSize:14, color:C.textMid, maxWidth:300, lineHeight:1.6 }}>This shopping list is all set for the upcoming week. Tap below if you need to bring it back.</div>
            <button onClick={restoreList} style={{ padding:"12px 24px", background:C.stone, border:"1.5px solid #E2E8F0", borderRadius:14, color:C.textMid, fontSize:13, fontWeight:700, cursor:"pointer" }}>↺ Restore List</button>
          </div>
        ) : (
          <div style={{ flex:1, overflowY:"auto", padding:"14px 18px" }}>
            {Object.entries(list).map(([category, items]) => (
              <div key={category} style={{ marginBottom:18 }}>
                <div style={{ fontSize:13, fontWeight:700, color:C.navy, marginBottom:8 }}>{category}</div>
                <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                  {items.map((item, i) => {
                    const key = `${category}::${i}`;
                    const done = !!purchased[key];
                    return (
                      <div key={i} onClick={() => toggleItem(key)} style={{ display:"flex", gap:10, alignItems:"center", padding:"9px 12px", background:done?"#F0FDF4":C.stone, borderRadius:10, cursor:"pointer", transition:"all .15s", border:`1px solid ${done?"#BBF7D0":"transparent"}` }}>
                        <div style={{ width:20, height:20, borderRadius:6, border:`2px solid ${done?"#16A34A":"#CBD5E1"}`, background:done?"#16A34A":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all .15s" }}>
                          {done && <span style={{ color:C.white, fontSize:12, fontWeight:800 }}>✓</span>}
                        </div>
                        <span style={{ fontSize:14, color:done?"#15803D":C.text, textDecoration:done?"line-through":"none", flex:1, transition:"all .15s" }}>{item}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {!listCleared && (
          <div style={{ padding:"12px 18px 18px", borderTop:"1px solid #E2E8F0", flexShrink:0 }}>
            {confirmMode && (
              <div style={{ background:"#FEF2F2", border:"1.5px solid #FECACA", borderRadius:14, padding:"12px 16px", marginBottom:10 }}>
                <div style={{ fontSize:13, fontWeight:600, color:"#991B1B", marginBottom:10 }}>
                  {confirmMode === "all"
                    ? "Clear the entire shopping list to make way for next week's list?"
                    : "Uncheck all purchased items and reset checkmarks?"}
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={confirmMode === "all" ? clearEntireList : clearPurchasedOnly} style={{ flex:1, background:"#DC2626", color:C.white, border:"none", borderRadius:10, padding:"10px", fontWeight:700, cursor:"pointer", fontSize:13 }}>
                    {confirmMode === "all" ? "Yes, Clear Entire List" : "Yes, Clear Checked Items"}
                  </button>
                  <button onClick={() => setConfirmMode(null)} style={{ flex:1, background:C.stone, color:C.text, border:"1.5px solid #E2E8F0", borderRadius:10, padding:"10px", fontWeight:600, cursor:"pointer", fontSize:13 }}>Cancel</button>
                </div>
              </div>
            )}
            {!confirmMode && (
              <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                {purchasedCount > 0 && (
                  <button onClick={() => setConfirmMode("purchased")} style={{ flex:1, background:"#FEF2F2", border:"1.5px solid #FECACA", borderRadius:12, padding:"10px", color:"#DC2626", fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
                    🗑️ Clear {purchasedCount} Checked
                  </button>
                )}
                <button onClick={() => setConfirmMode("all")} style={{ flex:1, background:"#FFF7ED", border:"1.5px solid #FED7AA", borderRadius:12, padding:"10px", color:"#C2410C", fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
                  🧹 Clear Entire List
                </button>
              </div>
            )}
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={copyList} style={{ flex:1, background:copied?"#065F46":C.stone, border:`1.5px solid ${copied?"#065F46":"#E2E8F0"}`, borderRadius:13, padding:"12px", color:copied?C.white:C.textMid, fontSize:13, fontWeight:700, cursor:"pointer", transition:"all .2s" }}>
                {copied ? "✓ Copied!" : "📋 Copy Remaining"}
              </button>
              <button onClick={() => window.open("https://www.instacart.com/store/harris-teeter","_blank")} style={{ flex:2, background:"linear-gradient(135deg,#16A34A,#15803D)", border:"none", borderRadius:13, padding:"12px", color:C.white, fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7, boxShadow:"0 4px 14px rgba(22,163,74,.25)" }}>
                🛒 Order on Instacart
              </button>
            </div>
          </div>
        )}
      </div>
    </Overlay>
  );
}

// ─── PLAN NEXT WEEK MODAL ──────────────────────────────────────────────────────
const MEAL_TOGGLES = [
  { key:"breakfast", icon:"🌅", label:"Breakfast" },
  { key:"lunch",     icon:"☀️", label:"Lunch" },
  { key:"dinner",    icon:"🌙", label:"Dinner" },
];

const DAY_TYPES = [
  { key:"quick",       icon:"⚡",  label:"Quick",      desc:"≤20 min, simple",        activeColor:"#D97706", activeBg:"#FEF3C7" },
  { key:"moderate",    icon:"🍳",  label:"Moderate",   desc:"25–40 min",              activeColor:"#1D4ED8", activeBg:"#DBEAFE" },
  { key:"challenging", icon:"👨‍🍳", label:"Involved",   desc:"45+ min, weekend-style", activeColor:"#7C3AED", activeBg:"#EDE9FE" },
  { key:"leftover",    icon:"🍱",  label:"Leftovers",  desc:"reuse earlier dish",     activeColor:"#16A34A", activeBg:"#DCFCE7" },
  { key:"eatingOut",   icon:"🍽️", label:"Eating Out", desc:"no cooking",             activeColor:"#475569", activeBg:"#E2E8F0" },
];

const DAY_TYPE_PROMPT_TEXT = {
  quick: "Quick & Easy dinner (20 minutes or less, minimal ingredients/steps)",
  moderate: "Moderate-effort dinner (25–40 minutes, standard complexity)",
  challenging: "Challenging / involved dinner (45+ minutes, more technique or components — a weekend-style project meal)",
  leftover: "Leftover night — dinner should be 'Leftovers: <name of an earlier dinner from this same 7-day plan>', reusing a dish already planned earlier in the week",
  eatingOut: "Eating out / takeout night — no cooking required",
};

function PlanModal({ onClose, onSave, profile }) {
  const dietPrompt = DIETS[profile?.diet_type]?.prompt || DIETS["mediterranean-pescatarian"].prompt;
  const [prefs, setPrefs] = useState({ proteins:["fish","chicken","lamb"], style:"summer", notes:"" });
  const [dayPlans, setDayPlans] = useState(() =>
    ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => ({ day:d, people:4, breakfast:false, lunch:true, dinner:true, dinnerEffort:"moderate" }))
  );
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const toggleProtein = p => setPrefs(prev => ({
    ...prev,
    proteins: prev.proteins.includes(p) ? prev.proteins.filter(x => x!==p) : [...prev.proteins, p]
  }));

  const toggleMeal = (index, mealKey) => setDayPlans(prev => prev.map((d, i) => i === index ? { ...d, [mealKey]: !d[mealKey] } : d));
  const setDinnerEffort = (index, effort) => setDayPlans(prev => prev.map((d, i) => i === index ? { ...d, dinnerEffort:effort } : d));
  const setDayPeople = (index, value) => setDayPlans(prev => prev.map((d, i) => i === index ? { ...d, people:Number(value) } : d));

  const applyPreset = (preset) => {
    if (preset === "standard") {
      setDayPlans([
        { day:"Mon", people:4, breakfast:false, lunch:true, dinner:true, dinnerEffort:"quick" },
        { day:"Tue", people:4, breakfast:false, lunch:true, dinner:true, dinnerEffort:"moderate" },
        { day:"Wed", people:4, breakfast:false, lunch:true, dinner:true, dinnerEffort:"quick" },
        { day:"Thu", people:4, breakfast:false, lunch:true, dinner:true, dinnerEffort:"moderate" },
        { day:"Fri", people:4, breakfast:false, lunch:true, dinner:true, dinnerEffort:"eatingOut" },
        { day:"Sat", people:5, breakfast:true,  lunch:true, dinner:true, dinnerEffort:"challenging" },
        { day:"Sun", people:5, breakfast:true,  lunch:true, dinner:true, dinnerEffort:"leftover" },
      ]);
    } else if (preset === "allCook") {
      setDayPlans(["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => ({ day:d, people:4, breakfast:false, lunch:true, dinner:true, dinnerEffort:"moderate" })));
    }
  };

  const generate = async () => {
    if (prefs.proteins.length === 0) { setError("Pick at least one protein!"); return; }
    setGenerating(true); setError("");
    const nextMonday = new Date();
    nextMonday.setDate(nextMonday.getDate() + (8 - nextMonday.getDay()) % 7 || 7);
    const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
    const dates = days.map((_, i) => { const d = new Date(nextMonday); d.setDate(d.getDate() + i); return d.toLocaleDateString("en-US", { month:"short", day:"numeric" }); });
    const dayPlanText = dayPlans.map((d, i) => {
      const breakfastPart = d.breakfast ? "Breakfast: include (kid-friendly, easy for kids to help cook)" : "Breakfast: skip — set to null";
      const lunchPart = d.lunch ? "Lunch: include" : "Lunch: skip — set to null";
      const dinnerPart = d.dinner ? `Dinner: ${DAY_TYPE_PROMPT_TEXT[d.dinnerEffort]}` : "Dinner: skip — set to null";
      return `${days[i]} (${dates[i]}): Feeding ${d.people} people | ${breakfastPart} | ${lunchPart} | ${dinnerPart}`;
    }).join("\n");
    const prompt = `Generate a 7-day meal plan for a person following this diet: ${dietPrompt}. The number of people being fed varies by day — see below. Preferred proteins (where diet allows): ${prefs.proteins.join(", ")}. Style: ${prefs.style}. Notes: ${prefs.notes || "none"}. Strictly respect the diet's restrictions — they override the protein preferences.

Follow this exact day-by-day meal plan — only generate meals where specified, and use null where a meal should be skipped:
${dayPlanText}

For leftover nights, reference a dish already used earlier in the SAME week's plan (e.g. "Leftovers: Lamb Kofta"). For eating out nights, use dinner name "Eating Out / Takeout". For quick/moderate/challenging nights, generate a real Mediterranean recipe matching that effort level — quick should be genuinely simple (few ingredients, short technique), challenging should feel like a special, more involved dish.

Return a JSON array of 7 day objects with: id(0-6), short("Mon" etc), full("Monday" etc), date(use: ${dates.join(", ")}), people(integer, the headcount for that day), breakfast(null OR {name,emoji,time:"X min",kidFriendly:bool}), lunch(null OR {name,emoji,time:"X min"}), dinner(null OR {name,emoji,time:"X min",effort:"quick"|"moderate"|"challenging"|"leftover"|"eatingOut"}). Concise names under 40 chars. Return ONLY valid JSON array.`;
    try {
      const raw = await callClaude([{ role:"user", content:prompt }], "You are a meal planning expert. Return only valid JSON with no explanation or markdown.");
      const plan = JSON.parse(raw.replace(/```json|```/g,"").trim());
      if (!Array.isArray(plan) || plan.length !== 7) throw new Error("Invalid");
      const listRaw = await callClaude([{ role:"user", content:`Shopping list for this 7-day plan, where headcount varies by day: ${JSON.stringify(plan.map(d=>({day:d.full, people:d.people, b:d.breakfast?.name, l:d.lunch?.name, d:d.dinner?.name})))}. Scale ingredient quantities to account for the varying headcount per day/meal. Skip ingredients for "Eating Out / Takeout" dinners and leftover nights (no new groceries needed for those), and skip any meals that are null. Return JSON object with categories as keys and arrays of strings as values. Categories: "🐟 Seafood","🍗 Meat","🥬 Produce","🥛 Dairy & Eggs","🍞 Grains & Bread","🥫 Canned & Jarred","🫙 Pantry & Spices". Only relevant categories. ONLY valid JSON.` }], "You are a grocery shopping assistant. Return only valid JSON.");
      const shoppingList = JSON.parse(listRaw.replace(/```json|```/g,"").trim());
      onSave(plan, shoppingList);
    } catch(e) { setError("Generation failed — please try again."); }
    setGenerating(false);
  };

  const PROTEINS = [{ key:"fish", label:"🐟 Fish & Seafood" },{ key:"chicken", label:"🍗 Chicken" },{ key:"lamb", label:"🥩 Lamb" },{ key:"vegetarian", label:"🥗 Vegetarian" }];

  return (
    <Overlay onClose={onClose}>
      <div style={{ background:C.white, borderRadius:22, width:"100%", maxWidth:540, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 24px 80px rgba(15,45,94,.35)" }} onClick={e => e.stopPropagation()}>
        <div style={{ background:`linear-gradient(135deg,${C.navy},${C.navyMid})`, borderRadius:"22px 22px 0 0", padding:"22px 24px", position:"sticky", top:0, zIndex:1 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ color:C.white, fontWeight:800, fontSize:18 }}>✨ Plan Next Week</div>
              <div style={{ color:"#93C5FD", fontSize:12, marginTop:2 }}>AI generates your personalized meal plan</div>
            </div>
            <button onClick={onClose} style={{ background:"rgba(255,255,255,.15)", border:"none", borderRadius:50, width:36, height:36, cursor:"pointer", color:C.white, fontSize:15, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
          </div>
        </div>
        <div style={{ padding:"22px 24px", display:"flex", flexDirection:"column", gap:22 }}>
          <div>
            <Label>Proteins to include</Label>
            <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:8 }}>
              {PROTEINS.map(({ key, label }) => {
                const on = prefs.proteins.includes(key);
                return <button key={key} onClick={() => toggleProtein(key)} style={{ padding:"12px 16px", borderRadius:14, border:`2px solid ${on?C.blue:"#E2E8F0"}`, background:on?`linear-gradient(135deg,${C.blue}18,${C.sky}18)`:C.white, color:C.text, fontWeight:on?700:500, cursor:"pointer", textAlign:"left", fontSize:14, display:"flex", justifyContent:"space-between" }}>{label}<span>{on?"✓":""}</span></button>;
              })}
            </div>
          </div>
          <div>
            <Label>Style</Label>
            <div style={{ display:"flex", gap:8, marginTop:8, flexWrap:"wrap" }}>
              {["summer","light","hearty","quick"].map(s => (
                <button key={s} onClick={() => setPrefs(p => ({...p, style:s}))} style={{ padding:"8px 16px", borderRadius:20, border:`2px solid ${prefs.style===s?C.blue:"#E2E8F0"}`, background:prefs.style===s?C.blue:C.white, color:prefs.style===s?C.white:C.text, fontWeight:600, cursor:"pointer", fontSize:13, textTransform:"capitalize" }}>{s}</button>
              ))}
            </div>
          </div>

          {/* DAY-BY-DAY CUSTOMIZATION */}
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
              <Label>Customize each day</Label>
              <div style={{ display:"flex", gap:6 }}>
                <button onClick={() => applyPreset("standard")} style={{ fontSize:11, fontWeight:700, color:C.blue, background:"#EFF6FF", border:"none", borderRadius:20, padding:"4px 10px", cursor:"pointer" }}>Standard Week</button>
                <button onClick={() => applyPreset("allCook")} style={{ fontSize:11, fontWeight:700, color:C.textMid, background:C.stone, border:"none", borderRadius:20, padding:"4px 10px", cursor:"pointer" }}>Reset</button>
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {dayPlans.map((d, i) => (
                <div key={d.day} style={{ background:C.stone, borderRadius:14, padding:"10px 12px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:30, fontSize:13, fontWeight:700, color:C.navy, flexShrink:0 }}>{d.day}</div>
                    <select value={d.people} onChange={e => setDayPeople(i, e.target.value)} style={{
                      fontSize:11, fontWeight:700, color:C.navy, background:C.white, border:"1.5px solid #E2E8F0",
                      borderRadius:9, padding:"6px 6px", cursor:"pointer", flexShrink:0, outline:"none", appearance:"auto",
                    }}>
                      {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>👥 {n}</option>)}
                    </select>
                    <div style={{ display:"flex", gap:5, flexWrap:"wrap", flex:1 }}>
                      {MEAL_TOGGLES.map(m => {
                        const on = d[m.key];
                        return (
                          <button key={m.key} onClick={() => toggleMeal(i, m.key)} style={{
                            fontSize:11, fontWeight:700, padding:"6px 9px", borderRadius:10, cursor:"pointer",
                            border:`1.5px solid ${on ? C.blue : "#E2E8F0"}`,
                            background: on ? `linear-gradient(135deg,${C.blue}18,${C.sky}18)` : C.white,
                            color: on ? C.blue : "#CBD5E1",
                            display:"flex", alignItems:"center", gap:4, transition:"all .15s",
                          }}>
                            <span>{m.icon}</span>{m.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {d.dinner && (
                    <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginTop:8, paddingLeft:46 }}>
                      {DAY_TYPES.map(t => {
                        const active = d.dinnerEffort === t.key;
                        return (
                          <button key={t.key} onClick={() => setDinnerEffort(i, t.key)} title={t.desc} style={{
                            fontSize:10.5, fontWeight:700, padding:"5px 8px", borderRadius:9, cursor:"pointer",
                            border:`1.5px solid ${active ? t.activeColor : "#E2E8F0"}`,
                            background: active ? t.activeBg : C.white,
                            color: active ? t.activeColor : C.textMid,
                            display:"flex", alignItems:"center", gap:3, transition:"all .15s",
                          }}>
                            <span>{t.icon}</span>{t.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ fontSize:11, color:C.textMid, marginTop:8, lineHeight:1.5 }}>👥 sets the headcount for that day — grocery quantities scale to match. Tap a meal to turn it on/off. Dinner effort only shows when dinner is on — leftover nights reuse an earlier dish, eating-out nights skip groceries entirely.</div>
          </div>

          <div>
            <Label>Notes or restrictions (optional)</Label>
            <textarea value={prefs.notes} onChange={e => setPrefs(p => ({...p, notes:e.target.value}))} placeholder="e.g. no shellfish, prefer grilled..." style={{ width:"100%", marginTop:8, padding:"12px 14px", border:"1.5px solid #E2E8F0", borderRadius:14, fontSize:14, color:C.text, background:C.stone, resize:"vertical", minHeight:70, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }} />
          </div>
          {error && <div style={{ background:"#FEF2F2", color:"#991B1B", padding:"10px 14px", borderRadius:12, fontSize:13 }}>{error}</div>}
          <button onClick={generate} disabled={generating} style={{ padding:"16px", borderRadius:16, border:"none", background:generating?"#CBD5E1":`linear-gradient(135deg,${C.navy},${C.navyMid})`, color:C.white, fontSize:15, fontWeight:800, cursor:generating?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
            {generating ? <><Spinner /> Generating your meal plan...</> : <><span style={{ fontSize:20 }}>✨</span> Generate My Week</>}
          </button>
        </div>
      </div>
    </Overlay>
  );
}

function Label({ children }) {
  return <div style={{ fontSize:12, fontWeight:700, color:C.textMid, textTransform:"uppercase", letterSpacing:".05em" }}>{children}</div>;
}
function Spinner() {
  return <div style={{ width:18, height:18, border:"2px solid rgba(255,255,255,.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />;
}

// ─── AUTH & PROFILE ────────────────────────────────────────────────────────────
function AuthScreen() {
  const [mode, setMode] = useState("login"); // login | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) { setError("Email and password required"); return; }
    setBusy(true); setError(""); setNotice("");
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
        if (error) throw error;
        if (data.session) return; // auto-confirmed, App picks up session
        setNotice("Check your email to confirm your account, then log in.");
        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }
    } catch (e) { setError(e.message || "Something went wrong"); }
    setBusy(false);
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#0F2D5E,#1A4080 60%,#2563EB)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"'Inter','Helvetica Neue',system-ui,sans-serif" }}>
      <div style={{ background:"#FFF", borderRadius:24, padding:"36px 32px", width:"100%", maxWidth:400, boxShadow:"0 24px 80px rgba(0,0,0,.35)" }}>
        <div style={{ textAlign:"center", marginBottom:26 }}>
          <div style={{ fontSize:48, marginBottom:8 }}>🫒</div>
          <div style={{ fontSize:24, fontWeight:800, color:"#0F172A" }}>Hocklac Meals</div>
          <div style={{ fontSize:13, color:"#64748B", marginTop:4 }}>Your personal meal planning assistant</div>
        </div>
        <div style={{ display:"flex", gap:6, marginBottom:20, background:"#F1F5F9", borderRadius:12, padding:4 }}>
          {["login","signup"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); setNotice(""); }} style={{ flex:1, padding:"9px 0", borderRadius:9, border:"none", background: mode===m ? "#FFF" : "transparent", color: mode===m ? "#0F172A" : "#64748B", fontWeight:700, fontSize:13, cursor:"pointer", boxShadow: mode===m ? "0 1px 4px rgba(0,0,0,.1)" : "none", transition:"all .15s" }}>
              {m === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" autoComplete="email" style={{ padding:"13px 15px", border:"1.5px solid #E2E8F0", borderRadius:13, fontSize:14, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key==="Enter" && submit()} placeholder={mode==="signup" ? "Password (8+ characters)" : "Password"} autoComplete={mode==="signup"?"new-password":"current-password"} style={{ padding:"13px 15px", border:"1.5px solid #E2E8F0", borderRadius:13, fontSize:14, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }} />
          {error && <div style={{ background:"#FEF2F2", color:"#991B1B", padding:"10px 14px", borderRadius:11, fontSize:13 }}>{error}</div>}
          {notice && <div style={{ background:"#F0FDF4", color:"#166534", padding:"10px 14px", borderRadius:11, fontSize:13 }}>{notice}</div>}
          <button onClick={submit} disabled={busy} style={{ padding:"14px", borderRadius:14, border:"none", background: busy ? "#CBD5E1" : "linear-gradient(135deg,#0F2D5E,#2563EB)", color:"#FFF", fontSize:15, fontWeight:800, cursor: busy ? "wait" : "pointer" }}>
            {busy ? "One moment…" : mode === "login" ? "Log In" : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfileForm({ initial, onSave, saving, title, subtitle, allowCancel, onCancel, onSignOut }) {
  const [displayName, setDisplayName] = useState(initial?.display_name || "");
  const [dietType, setDietType] = useState(initial?.diet_type || "mediterranean-pescatarian");
  const [theme, setTheme] = useState(initial?.theme || "olive");
  const [targets, setTargets] = useState({ cal: initial?.target_calories || 2200, p: initial?.target_protein || 140, c: initial?.target_carbs || 220, f: initial?.target_fat || 75 });

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:22 }}>
      <div>
        <div style={{ fontSize:20, fontWeight:800, color:C.text }}>{title}</div>
        {subtitle && <div style={{ fontSize:13, color:C.textMid, marginTop:4 }}>{subtitle}</div>}
      </div>
      <div>
        <Label>Display name</Label>
        <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="e.g. Jeramie" style={{ width:"100%", marginTop:8, padding:"12px 14px", border:"1.5px solid #E2E8F0", borderRadius:13, fontSize:14, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }} />
      </div>
      <div>
        <Label>Diet type</Label>
        <div style={{ display:"flex", flexDirection:"column", gap:7, marginTop:8 }}>
          {Object.entries(DIETS).map(([key, d]) => (
            <button key={key} onClick={() => setDietType(key)} style={{ padding:"11px 14px", borderRadius:13, border:`2px solid ${dietType===key?C.blue:"#E2E8F0"}`, background: dietType===key ? `linear-gradient(135deg,${C.blue}14,${C.sky}14)` : C.white, color:C.text, fontWeight: dietType===key?700:500, cursor:"pointer", textAlign:"left", fontSize:13, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span>{d.icon} {d.label}</span>{dietType===key && <span>✓</span>}
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label>App theme</Label>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:8 }}>
          {Object.entries(THEMES).map(([key, t]) => (
            <button key={key} onClick={() => setTheme(key)} style={{ padding:"12px 10px", borderRadius:13, border:`2px solid ${theme===key ? t.blue : "#E2E8F0"}`, background:C.white, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
              <div style={{ width:"100%", height:26, borderRadius:8, background:`linear-gradient(135deg,${t.navy},${t.blue})` }} />
              <span style={{ fontSize:12, fontWeight:700, color: theme===key ? t.navy : C.textMid }}>{t.icon} {t.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label>Daily macro targets</Label>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:8 }}>
          {[["Calories", targets.cal, v => setTargets(t=>({...t,cal:v}))], ["Protein (g)", targets.p, v => setTargets(t=>({...t,p:v}))], ["Carbs (g)", targets.c, v => setTargets(t=>({...t,c:v}))], ["Fat (g)", targets.f, v => setTargets(t=>({...t,f:v}))]].map(([lbl, val, set]) => (
            <div key={lbl}>
              <div style={{ fontSize:11, color:C.textMid, fontWeight:600, marginBottom:4 }}>{lbl}</div>
              <input type="number" value={val} onChange={e => set(Number(e.target.value) || 0)} style={{ width:"100%", padding:"10px 12px", border:"1.5px solid #E2E8F0", borderRadius:11, fontSize:14, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }} />
            </div>
          ))}
        </div>
      </div>
      <button onClick={() => onSave({ display_name: displayName.trim() || "Chef", diet_type: dietType, theme, target_calories: targets.cal, target_protein: targets.p, target_carbs: targets.c, target_fat: targets.f })} disabled={saving} style={{ padding:"15px", borderRadius:15, border:"none", background: saving ? "#CBD5E1" : `linear-gradient(135deg,${C.navy},${C.navyMid})`, color:C.white, fontSize:15, fontWeight:800, cursor: saving ? "wait" : "pointer" }}>
        {saving ? "Saving…" : "Save & Continue"}
      </button>
      {allowCancel && <button onClick={onCancel} style={{ padding:"11px", borderRadius:13, border:"1.5px solid #E2E8F0", background:C.white, color:C.textMid, fontSize:13, fontWeight:700, cursor:"pointer" }}>Cancel</button>}
      {onSignOut && <button onClick={onSignOut} style={{ padding:"11px", borderRadius:13, border:"1.5px solid #FECACA", background:"#FEF2F2", color:"#DC2626", fontSize:13, fontWeight:700, cursor:"pointer" }}>Sign Out</button>}
    </div>
  );
}

function ProfileSetup({ userId, onDone }) {
  const [saving, setSaving] = useState(false);
  const save = async (fields) => {
    setSaving(true);
    const { error } = await supabase.from("user_profiles").upsert({ user_id: userId, ...fields, updated_at: new Date().toISOString() });
    setSaving(false);
    if (!error) onDone({ user_id: userId, ...fields });
  };
  return (
    <div style={{ minHeight:"100vh", background:C.stone, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:20, fontFamily:"'Inter','Helvetica Neue',system-ui,sans-serif" }}>
      <div style={{ background:C.white, borderRadius:24, padding:"30px 28px", width:"100%", maxWidth:440, boxShadow:"0 12px 50px rgba(15,45,94,.15)", marginTop:20, marginBottom:20 }}>
        <ProfileForm title="Welcome! Set up your kitchen 👋" subtitle="This personalizes your meal plans, recipes, and the look of the app." onSave={save} saving={saving} />
      </div>
    </div>
  );
}

function SettingsModal({ profile, onClose, onSaved }) {
  const [saving, setSaving] = useState(false);
  const save = async (fields) => {
    setSaving(true);
    const { error } = await supabase.from("user_profiles").update({ ...fields, updated_at: new Date().toISOString() }).eq("user_id", profile.user_id);
    setSaving(false);
    if (!error) { onSaved({ ...profile, ...fields }); onClose(); }
  };
  const signOut = async () => { await supabase.auth.signOut(); };
  return (
    <Overlay onClose={onClose}>
      <div style={{ background:C.white, borderRadius:22, width:"100%", maxWidth:460, maxHeight:"90vh", overflowY:"auto", padding:"26px 26px", boxShadow:"0 24px 80px rgba(15,45,94,.35)" }} onClick={e => e.stopPropagation()}>
        <ProfileForm initial={profile} title="⚙️ Your Settings" subtitle="Changes apply across all your devices." onSave={save} saving={saving} allowCancel onCancel={onClose} onSignOut={signOut} />
      </div>
    </Overlay>
  );
}

// ─── MACRO BAR ─────────────────────────────────────────────────────────────────
function MacroBar({ todayLog, profile }) {
  const totals = todayLog.reduce((a, r) => ({ cal:a.cal+r.calories, p:a.p+r.protein, c:a.c+r.carbs, f:a.f+r.fat }), { cal:0, p:0, c:0, f:0 });
  const rows = [
    { label:"Cal",     val:totals.cal, target:profile.target_calories || 2200, color:"#F59E0B" },
    { label:"Protein", val:totals.p,   target:profile.target_protein || 140,   color:"#EF4444" },
    { label:"Carbs",   val:totals.c,   target:profile.target_carbs || 220,     color:"#3B82F6" },
    { label:"Fat",     val:totals.f,   target:profile.target_fat || 75,        color:"#8B5CF6" },
  ];
  return (
    <div style={{ background:C.white, borderRadius:16, border:"1.5px solid #E2E8F0", padding:"12px 16px", marginBottom:16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <div style={{ fontSize:12, fontWeight:800, color:C.text, textTransform:"uppercase", letterSpacing:".05em" }}>📊 Today's Macros</div>
        <div style={{ fontSize:11, color:C.textMid }}>{todayLog.length} meal{todayLog.length !== 1 ? "s" : ""} logged</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:10 }}>
        {rows.map(r => {
          const pct = Math.min(100, Math.round((r.val / r.target) * 100));
          return (
            <div key={r.label}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, marginBottom:3 }}>
                <span style={{ fontWeight:700, color:C.textMid }}>{r.label}</span>
                <span style={{ color:C.textMid }}>{r.val}/{r.target}</span>
              </div>
              <div style={{ height:6, background:"#F1F5F9", borderRadius:3, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${pct}%`, background:r.color, borderRadius:3, transition:"width .3s" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  // ── Auth & profile ──
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [week, setWeek] = useState("this");
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [selectedMealType, setSelectedMealType] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [shoppingOpen, setShoppingOpen] = useState(false);
  const [planningOpen, setPlanningOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState("syncing"); // "syncing" | "synced" | "offline"
  const [nextWeekPlan, setNextWeekPlan] = useState(null);
  const [nextWeekList, setNextWeekList] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [ratings, setRatings] = useState({});
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [selectedRecipeData, setSelectedRecipeData] = useState(null);
  const [todayLog, setTodayLog] = useState([]);
  const [time, setTime] = useState(new Date());
  const todayStr = () => new Date().toISOString().slice(0, 10);

  const uid = session?.user?.id || null;
  // Per-user localStorage keys so multiple accounts on one device (the fridge) don't collide
  const lk = (name) => `${uid || "anon"}:${name}`;

  // Session bootstrap + listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session || null);
      setAuthLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s || null);
      if (!s) { setProfile(null); }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Load profile when session appears
  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    setProfileLoading(true);
    supabase.from("user_profiles").select("*").eq("user_id", uid).maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (!error) setProfile(data || null);
        setProfileLoading(false);
      });
    return () => { cancelled = true; };
  }, [uid]);

  // Inject theme CSS variables
  const themeKey = profile?.theme && THEMES[profile.theme] ? profile.theme : "olive";
  const T = THEMES[themeKey];
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--navy", T.navy);
    root.style.setProperty("--navyMid", T.navyMid);
    root.style.setProperty("--blue", T.blue);
    root.style.setProperty("--sky", T.sky);
  }, [themeKey]);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (week !== "favorites") setSelectedDay(0);
  }, [week]);

  // Load local cache, then pull latest from Supabase (per user) so all devices stay in sync
  useEffect(() => {
    if (!uid || !profile) return;
    let cancelled = false;
    // Local cache first for instant paint
    try {
      setFavorites(JSON.parse(localStorage.getItem(lk("favorites")) || "[]"));
      setRatings(JSON.parse(localStorage.getItem(lk("ratings")) || "{}"));
      setSavedRecipes(JSON.parse(localStorage.getItem(lk("savedRecipes")) || "[]"));
      setNextWeekPlan(JSON.parse(localStorage.getItem(lk("nextWeekPlan")) || "null"));
      setNextWeekList(JSON.parse(localStorage.getItem(lk("nextWeekList")) || "null"));
    } catch { /* ignore */ }
    setSyncStatus("syncing");
    (async () => {
      try {
        const [favRes, ratRes, planRes, recipesRes, logRes] = await Promise.all([
          supabase.from("favorites").select("recipe_name").eq("user_id", uid),
          supabase.from("ratings").select("recipe_name, stars").eq("user_id", uid),
          supabase.from("next_week_plan").select("plan, shopping_list").eq("user_id", uid).maybeSingle(),
          supabase.from("saved_recipes").select("*").eq("user_id", uid).order("saved_at", { ascending:false }),
          supabase.from("macro_log").select("*").eq("user_id", uid).eq("log_date", todayStr()),
        ]);
        if (cancelled) return;
        if (favRes.error || ratRes.error || planRes.error || recipesRes.error)
          throw (favRes.error || ratRes.error || planRes.error || recipesRes.error);

        const favNames = (favRes.data || []).map(r => r.recipe_name);
        setFavorites(favNames);
        localStorage.setItem(lk("favorites"), JSON.stringify(favNames));

        const ratObj = {};
        (ratRes.data || []).forEach(r => { ratObj[r.recipe_name] = r.stars; });
        setRatings(ratObj);
        localStorage.setItem(lk("ratings"), JSON.stringify(ratObj));

        if (planRes.data) {
          setNextWeekPlan(planRes.data.plan);
          setNextWeekList(planRes.data.shopping_list);
          localStorage.setItem(lk("nextWeekPlan"), JSON.stringify(planRes.data.plan));
          localStorage.setItem(lk("nextWeekList"), JSON.stringify(planRes.data.shopping_list));
        } else {
          setNextWeekPlan(null); setNextWeekList(null);
          localStorage.removeItem(lk("nextWeekPlan")); localStorage.removeItem(lk("nextWeekList"));
        }

        const remoteRecipes = (recipesRes.data || []).map(r => ({
          name: r.name, emoji: r.emoji, time: r.cook_time, servings: r.servings,
          category: r.category, ingredients: r.ingredients, steps: r.steps,
          kidTip: r.kid_tip, macros: r.macros || null, source: "ai",
        }));
        setSavedRecipes(remoteRecipes);
        localStorage.setItem(lk("savedRecipes"), JSON.stringify(remoteRecipes));
        if (!logRes.error) setTodayLog(logRes.data || []);
        setSyncStatus("synced");
      } catch (e) {
        console.error("Supabase sync failed, using local cache:", e);
        setSyncStatus("offline");
      }
    })();
    return () => { cancelled = true; };
  }, [uid, profile?.user_id]);

  const toggleFavorite = (name) => {
    setFavorites(prev => {
      const isFav = prev.includes(name);
      const next = isFav ? prev.filter(n => n !== name) : [...prev, name];
      localStorage.setItem(lk("favorites"), JSON.stringify(next));
      if (isFav) {
        supabase.from("favorites").delete().eq("user_id", uid).eq("recipe_name", name)
          .then(({ error }) => error && console.error("Unfavorite sync failed:", error));
      } else {
        supabase.from("favorites").insert({ user_id: uid, recipe_name: name })
          .then(({ error }) => error && console.error("Favorite sync failed:", error));
      }
      return next;
    });
  };

  const rateRecipe = (name, stars) => {
    setRatings(prev => {
      const next = { ...prev, [name]: stars };
      if (stars === 0) delete next[name];
      localStorage.setItem(lk("ratings"), JSON.stringify(next));
      if (stars === 0) {
        supabase.from("ratings").delete().eq("user_id", uid).eq("recipe_name", name)
          .then(({ error }) => error && console.error("Rating delete sync failed:", error));
      } else {
        supabase.from("ratings").upsert({ user_id: uid, recipe_name: name, stars, updated_at: new Date().toISOString() }, { onConflict: "user_id,recipe_name" })
          .then(({ error }) => error && console.error("Rating sync failed:", error));
      }
      return next;
    });
  };

  const saveRecipe = (recipe) => {
    setSavedRecipes(prev => {
      if (prev.some(r => r.name === recipe.name)) return prev;
      const next = [{ ...recipe, source:"ai" }, ...prev];
      localStorage.setItem(lk("savedRecipes"), JSON.stringify(next));
      supabase.from("saved_recipes").upsert({
        user_id: uid,
        name: recipe.name, emoji: recipe.emoji || "🍽️",
        cook_time: recipe.time, servings: recipe.servings,
        category: recipe.category || "ai",
        ingredients: recipe.ingredients || [],
        steps: recipe.steps || [], kid_tip: recipe.kidTip || null,
        macros: recipe.macros || null,
        source: "ai",
      }, { onConflict:"user_id,name" })
        .then(({ error }) => error && console.error("Recipe save failed:", error));
      return next;
    });
  };

  const deleteRecipe = (name) => {
    setSavedRecipes(prev => {
      const next = prev.filter(r => r.name !== name);
      localStorage.setItem(lk("savedRecipes"), JSON.stringify(next));
      supabase.from("saved_recipes").delete().eq("user_id", uid).eq("name", name)
        .then(({ error }) => error && console.error("Recipe delete failed:", error));
      return next;
    });
  };

  const syncHealthApp = (log) => {
    const totals = log.reduce((a, r) => ({ calories:a.calories+r.calories, protein:a.protein+r.protein, carbs:a.carbs+r.carbs, fat:a.fat+r.fat }), { calories:0, protein:0, carbs:0, fat:0 });
    fetch("/api/health-sync", {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ email: session?.user?.email, date: todayStr(), ...totals, meals: log.length }),
    }).catch(() => {});
  };

  const logMeal = async (meal, type, recipe) => {
    // Resolve macros: static lookup → saved recipe → AI estimate
    let m = STATIC_MACROS[meal.name] || recipe?.macros || savedRecipes.find(r => r.name === meal.name)?.macros;
    if (!m) {
      try {
        const raw = await callClaude(
          [{ role:"user", content:`Estimate per-serving macros for "${meal.name}"${recipe?.ingredients ? ` with ingredients: ${recipe.ingredients.slice(0,12).join("; ")}` : ""}. Return ONLY JSON: {"calories":int,"protein":int,"carbs":int,"fat":int}` }],
          "You are a nutritionist. Return only valid JSON."
        );
        m = JSON.parse(raw.replace(/```json|```/g, "").trim());
      } catch { m = { calories:450, protein:25, carbs:40, fat:18 }; }
    }
    const entry = { user_id: uid, log_date: todayStr(), meal_name: meal.name, meal_type: type || "meal", calories: m.calories || 0, protein: m.protein || 0, carbs: m.carbs || 0, fat: m.fat || 0 };
    const { data, error } = await supabase.from("macro_log").insert(entry).select().single();
    const row = error ? { ...entry, id: Math.random().toString(36) } : data;
    setTodayLog(prev => { const next = [...prev, row]; syncHealthApp(next); return next; });
    if (error) console.error("Macro log failed:", error);
  };

  const days = week === "this" ? THIS_WEEK : (nextWeekPlan || []);
  const day = days[selectedDay];
  const shoppingList = week === "this" ? THIS_WEEK_SHOPPING : nextWeekList;
  const weekLabel = week === "this" ? "This Week (Jun 11–17)" : "Next Week";

  // Build allMeals list with type info for favorites
  const allMeals = [...THIS_WEEK, ...(nextWeekPlan || [])].flatMap(d =>
    ["breakfast","lunch","dinner"].map(t => d[t] ? { ...d[t], _type: t } : null).filter(Boolean)
  );

  const savePlan = (plan, list) => {
    setNextWeekPlan(plan); setNextWeekList(list);
    localStorage.setItem(lk("nextWeekPlan"), JSON.stringify(plan));
    localStorage.setItem(lk("nextWeekList"), JSON.stringify(list));
    supabase.from("next_week_plan").upsert(
      { user_id: uid, plan, shopping_list: list, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    ).then(({ error }) => error && console.error("Plan sync failed:", error));
    setWeek("next"); setSelectedDay(0); setPlanningOpen(false);
  };

  const clearNextWeek = () => {
    setNextWeekPlan(null); setNextWeekList(null);
    localStorage.removeItem(lk("nextWeekPlan")); localStorage.removeItem(lk("nextWeekList"));
    supabase.from("next_week_plan").delete().eq("user_id", uid)
      .then(({ error }) => error && console.error("Plan clear sync failed:", error));
  };

  // ── Auth gating ──
  if (authLoading || (uid && profileLoading && !profile)) {
    return (
      <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#0F2D5E,#2563EB)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Inter',system-ui,sans-serif" }}>
        <div style={{ textAlign:"center", color:"#FFF" }}>
          <div style={{ fontSize:52, marginBottom:12 }}>🫒</div>
          <div style={{ fontSize:16, fontWeight:700 }}>Hocklac Meals</div>
          <div style={{ fontSize:12, opacity:.7, marginTop:6 }}>Loading…</div>
        </div>
      </div>
    );
  }
  if (!session) return <AuthScreen />;
  if (!profile) return <ProfileSetup userId={uid} onDone={setProfile} />;


  return (
    <>
      <style>{`
        @keyframes bounce { 0%,80%,100%{transform:scale(.6);opacity:.4} 40%{transform:scale(1);opacity:1} }
        @keyframes spin { to{transform:rotate(360deg)} }
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:3px}
        body{background:#F1F5F9;}
      `}</style>

      <div style={{ fontFamily:"'Inter','Helvetica Neue',system-ui,sans-serif", background:"#F1F5F9", minHeight:"100vh", display:"flex", flexDirection:"column", color:C.text }}>

        {/* HEADER */}
        <div style={{ background:`linear-gradient(135deg,${C.navy},${C.navyMid})`, padding:"14px 18px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 4px 20px rgba(15,45,94,.22)", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ fontSize:26 }}>{T.icon}</div>
            <div>
              <div style={{ color:C.white, fontSize:17, fontWeight:800, letterSpacing:"-.02em" }}>Hocklac Meals</div>
              <div style={{ color:"rgba(255,255,255,.75)", fontSize:11, marginTop:1, display:"flex", alignItems:"center", gap:6 }}>
                {profile.display_name} · {DIETS[profile.diet_type]?.label || "Custom"}
                <span title={syncStatus === "synced" ? "Synced across devices" : syncStatus === "offline" ? "Offline — using local data" : "Syncing..."} style={{
                  width:6, height:6, borderRadius:"50%", flexShrink:0,
                  background: syncStatus === "synced" ? "#34D399" : syncStatus === "offline" ? "#F87171" : "#FBBF24",
                }} />
              </div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ textAlign:"right" }}>
              <div style={{ color:C.white, fontSize:20, fontWeight:300 }}>{fmtTime(time)}</div>
              <div style={{ color:"rgba(255,255,255,.75)", fontSize:11 }}>{fmtDate(time)}</div>
            </div>
            <button onClick={() => setSettingsOpen(true)} title="Settings" style={{ background:"rgba(255,255,255,.15)", border:"none", borderRadius:50, width:38, height:38, cursor:"pointer", fontSize:17, display:"flex", alignItems:"center", justifyContent:"center" }}>⚙️</button>
          </div>
        </div>

        {/* SECTION TABS */}
        <div style={{ background:C.white, borderBottom:"1px solid #E2E8F0", padding:"8px 10px", display:"flex", gap:6, flexShrink:0 }}>
          {[
            { key:"this",      label:"📅 This Week",  badge:null },
            { key:"next",      label:"✨ Next Week",   badge: nextWeekPlan ? "✓" : null },
            { key:"recipes",   label:"📖 Recipes",     badge: savedRecipes.length > 0 ? `+${savedRecipes.length}` : null },
            { key:"favorites", label:"⭐ Favorites",   badge: favorites.length > 0 ? String(favorites.length) : null },
          ].map(({ key, label, badge }) => (
            <button key={key} onClick={() => setWeek(key)} style={{ flex:1, padding:"9px 4px", borderRadius:12, border:`2px solid ${week===key?C.navy:"#E2E8F0"}`, background:week===key?C.navy:C.white, color:week===key?C.white:C.textMid, fontWeight:700, fontSize:11, cursor:"pointer", transition:"all .2s", display:"flex", alignItems:"center", justifyContent:"center", gap:4, flexWrap:"wrap" }}>
              {label}
              {badge && <span style={{ fontSize:9, background:week===key?"rgba(255,255,255,.25)":"#E2E8F0", padding:"1px 5px", borderRadius:10, color:week===key?C.white:C.textMid }}>{badge}</span>}
            </button>
          ))}
        </div>

        {/* DAY TABS — only show for this/next week */}
        {week !== "favorites" && week !== "recipes" && days.length > 0 && (
          <div style={{ background:C.white, borderBottom:"1px solid #E2E8F0", display:"flex", overflowX:"auto", flexShrink:0, padding:"0 8px" }}>
            {days.map((d, i) => {
              const active = selectedDay === i;
              return (
                <button key={d.id} onClick={() => setSelectedDay(i)} style={{ background:active?C.navy:"transparent", border:"none", borderRadius:"0 0 12px 12px", padding:"11px 12px 9px", cursor:"pointer", color:active?C.white:C.textMid, fontSize:12, fontWeight:active?700:500, display:"flex", flexDirection:"column", alignItems:"center", gap:2, transition:"all .2s", flexShrink:0, boxShadow:active?"0 4px 14px rgba(15,45,94,.25)":"none", minWidth:50 }}>
                  <span style={{ fontSize:9, fontWeight:700, opacity:active?1:.65 }}>{d.short.toUpperCase()}</span>
                  <span style={{ fontSize:14, fontWeight:800 }}>{d.date?.split(" ")[1]}</span>
                  <div style={{ display:"flex", gap:3, marginTop:1 }}>
                    {["breakfast","lunch","dinner"].map(t => (
                      <div key={t} style={{ width:4, height:4, borderRadius:"50%", background:d[t]?(active?"rgba(255,255,255,.8)":t==="breakfast"?"#FBBF24":t==="lunch"?"#34D399":"#818CF8"):"transparent" }} />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* MAIN CONTENT */}
        <div style={{ flex:1, padding:"16px 16px 100px", overflowY:"auto" }}>

          <MacroBar todayLog={todayLog} profile={profile} />

          {/* RECIPES VIEW */}
          {week === "recipes" && (
            <RecipesView
              savedRecipes={savedRecipes}
              favorites={favorites}
              ratings={ratings}
              onOpenRecipe={(r) => {
                setSelectedMeal({ name: r.name, emoji: r.emoji });
                setSelectedMealType(r.category === "breakfast" ? "breakfast" : r.category === "fish" || r.category === "chicken" || r.category === "lamb" ? "dinner" : "dinner");
                setSelectedRecipeData(r);
              }}
              onFavorite={toggleFavorite}
              onRate={rateRecipe}
              onDeleteAI={deleteRecipe}
            />
          )}

          {/* FAVORITES VIEW */}
          {week === "favorites" && (
            <FavoritesView
              favorites={favorites}
              ratings={ratings}
              allMeals={allMeals}
              onTap={(meal, type) => { setSelectedMeal(meal); setSelectedMealType(type || "dinner"); }}
              onFavorite={toggleFavorite}
              onRate={rateRecipe}
            />
          )}

          {/* NEXT WEEK EMPTY STATE */}
          {week === "next" && !nextWeekPlan && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"48px 24px", textAlign:"center", gap:20 }}>
              <div style={{ fontSize:64 }}>✨</div>
              <div style={{ fontSize:22, fontWeight:800, color:C.navy }}>Plan Next Week</div>
              <div style={{ fontSize:15, color:C.textMid, maxWidth:320, lineHeight:1.6 }}>Let Claude AI build a custom Mediterranean meal plan for your family — just pick your preferences.</div>
              <button onClick={() => setPlanningOpen(true)} style={{ padding:"16px 32px", background:`linear-gradient(135deg,${C.navy},${C.navyMid})`, border:"none", borderRadius:16, color:C.white, fontSize:15, fontWeight:800, cursor:"pointer", boxShadow:"0 4px 20px rgba(15,45,94,.3)", display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:22 }}>✨</span> Generate My Plan
              </button>
            </div>
          )}

          {/* MEAL PLAN VIEW */}
          {week !== "favorites" && week !== "recipes" && (week === "this" || nextWeekPlan) && day && (
            <>
              <div style={{ marginBottom:14, display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                <div style={{ fontSize:20, fontWeight:800, color:C.navy }}>{day.full}</div>
                <div style={{ fontSize:12, color:C.textMid, background:C.white, padding:"3px 10px", borderRadius:20, border:"1px solid #E2E8F0" }}>{day.date}</div>
                {week === "this" && selectedDay === 0 && <div style={{ fontSize:11, fontWeight:700, color:"#065F46", background:"#D1FAE5", padding:"3px 9px", borderRadius:20 }}>TODAY</div>}
                {week === "next" && <button onClick={clearNextWeek} style={{ fontSize:11, color:"#991B1B", background:"#FEF2F2", border:"none", borderRadius:20, padding:"3px 10px", cursor:"pointer", fontWeight:600 }}>↺ Regenerate</button>}
              </div>

              <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:22 }}>
                {["breakfast","lunch","dinner"].map(type => (
                  <MealCard key={type} type={type} meal={day[type]} ratings={ratings} onTap={(meal, t) => { setSelectedMeal(meal); setSelectedMealType(t); }} />
                ))}
              </div>

              <div>
                <div style={{ fontSize:11, fontWeight:700, color:C.textMid, letterSpacing:".06em", textTransform:"uppercase", marginBottom:10 }}>THIS WEEK</div>
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {days.map((d, i) => (
                    <div key={d.id} onClick={() => setSelectedDay(i)} style={{ background:selectedDay===i?`linear-gradient(135deg,${C.navy},${C.navyMid})`:C.white, borderRadius:12, padding:"10px 14px", display:"flex", alignItems:"center", gap:10, cursor:"pointer", transition:"all .15s", border:`1.5px solid ${selectedDay===i?"transparent":"#E2E8F0"}`, boxShadow:selectedDay===i?"0 4px 14px rgba(15,45,94,.2)":"none" }}>
                      <div style={{ width:48, fontSize:11, fontWeight:700, color:selectedDay===i?"#93C5FD":C.textMid, flexShrink:0 }}>{d.short} {d.date?.split(" ")[1]}</div>
                      <div style={{ flex:1, display:"flex", gap:6, flexWrap:"wrap" }}>
                        {["breakfast","lunch","dinner"].map(t => d[t] && (
                          <span key={t} style={{ fontSize:11, color:selectedDay===i?"#E0F2FE":C.textMid, background:selectedDay===i?"rgba(255,255,255,.12)":"#F1F5F9", padding:"2px 8px", borderRadius:20 }}>
                            {d[t].emoji} {d[t].name.split("+")[0].trim().split(" ").slice(0,2).join(" ")}
                            {ratings[d[t].name] > 0 && <span style={{ marginLeft:3 }}>{"★".repeat(ratings[d[t].name])}</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* BOTTOM BAR */}
        <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"rgba(241,245,249,.97)", backdropFilter:"blur(12px)", borderTop:"1px solid #E2E8F0", padding:"10px 14px 14px", display:"flex", gap:8 }}>
          <button onClick={() => setChatOpen(true)} style={{ flex:2, background:`linear-gradient(135deg,${C.navy},${C.navyMid})`, border:"none", borderRadius:13, padding:"12px 14px", color:C.white, fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7, boxShadow:"0 4px 14px rgba(15,45,94,.28)" }}>
            <span style={{ fontSize:17 }}>🤖</span> Ask Claude
          </button>
          {shoppingList ? (
            <button onClick={() => setShoppingOpen(true)} style={{ flex:2, background:"linear-gradient(135deg,#16A34A,#15803D)", border:"none", borderRadius:13, padding:"12px 14px", color:C.white, fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7, boxShadow:"0 4px 14px rgba(22,163,74,.25)" }}>
              <span style={{ fontSize:17 }}>🛒</span> Shop / Instacart
            </button>
          ) : (
            <button onClick={() => setPlanningOpen(true)} style={{ flex:2, background:"linear-gradient(135deg,#7C3AED,#6D28D9)", border:"none", borderRadius:13, padding:"12px 14px", color:C.white, fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7, boxShadow:"0 4px 14px rgba(124,58,237,.25)" }}>
              <span style={{ fontSize:17 }}>✨</span> Plan Next Week
            </button>
          )}
        </div>
      </div>

      {selectedMeal && <RecipeModal meal={selectedMeal} type={selectedMealType} recipeData={selectedRecipeData} onClose={() => { setSelectedMeal(null); setSelectedMealType(null); setSelectedRecipeData(null); }} favorites={favorites} ratings={ratings} onFavorite={toggleFavorite} onRate={rateRecipe} onLog={logMeal} />}
      {chatOpen && <ChatModal onClose={() => setChatOpen(false)} weekLabel={weekLabel} savedRecipes={savedRecipes} onSaveRecipe={saveRecipe} profile={profile} storagePrefix={uid} />}
      {shoppingOpen && shoppingList && <ShoppingModal onClose={() => setShoppingOpen(false)} list={shoppingList} weekLabel={weekLabel} uid={uid} />}
      {planningOpen && <PlanModal onClose={() => setPlanningOpen(false)} onSave={savePlan} profile={profile} />}
      {settingsOpen && <SettingsModal profile={profile} onClose={() => setSettingsOpen(false)} onSaved={setProfile} />}
    </>
  );
}
