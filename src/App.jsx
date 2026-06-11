import { useState, useEffect, useRef } from "react";

// ─── CONSTANTS ─────────────────────────────────────────────────────────────────
const API = "/api/claude";
const MODEL = "claude-sonnet-4-20250514";
const C = {
  navy: "#0F2D5E", navyMid: "#1A4080", blue: "#2563EB", sky: "#0EA5E9",
  stone: "#F1F5F9", text: "#0F172A", textMid: "#475569", white: "#FFFFFF",
  green: "#065F46", greenBg: "#D1FAE5",
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
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

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

function RecipeModal({ meal, type, onClose, favorites, ratings, onFavorite, onRate }) {
  const recipe = RECIPES[meal.name];
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
          {/* Rating + Favorite */}
          <div style={{ borderTop:"1.5px solid #E2E8F0", paddingTop:16, display:"flex", flexDirection:"column", gap:12 }}>
            <StarRating name={meal.name} ratings={ratings} onRate={onRate} />
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

// ─── CHAT MODAL ────────────────────────────────────────────────────────────────
function ChatModal({ onClose, weekLabel }) {
  const [messages, setMessages] = useState([{ role:"assistant", content:`Hi! I'm your Hocklac Meals kitchen assistant. Ask me anything about ${weekLabel} — substitutions, prep tips, leftovers, or what the kids can help with! 🫒` }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, loading]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role:"user", content:input };
    setMessages(p => [...p, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const reply = await callClaude([...messages, userMsg],
        "You are the Hocklac Meals kitchen assistant on a Samsung Family Hub smart fridge. The family follows a 7-day summer Mediterranean pescatarian meal plan — fish-forward with chicken and lamb. Kids help cook some breakfasts. Be friendly, warm, concise. Keep responses short enough for a fridge screen. Use occasional emojis."
      );
      setMessages(p => [...p, { role:"assistant", content:reply }]);
    } catch {
      setMessages(p => [...p, { role:"assistant", content:"Connection issue — please try again! 🔄" }]);
    }
    setLoading(false);
  };

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setInput("Speech recognition isn't supported in this browser — try Chrome!");
      return;
    }
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    setListening(true);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  const QUICK = ["What can I sub for cod?", "Prep-ahead tips?", "Kid-friendly help?", "What pairs with lamb kofta?"];

  return (
    <Overlay onClose={onClose}>
      <div style={{ background:C.white, borderRadius:22, width:"100%", maxWidth:500, height:"80vh", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 24px 80px rgba(15,45,94,.35)" }} onClick={e => e.stopPropagation()}>
        <div style={{ background:`linear-gradient(135deg,${C.navy},${C.navyMid})`, padding:"18px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:"50%", background:"linear-gradient(135deg,#3B82F6,#06B6D4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🤖</div>
            <div>
              <div style={{ color:C.white, fontWeight:700, fontSize:15 }}>Kitchen Assistant</div>
              <div style={{ color:"#93C5FD", fontSize:11 }}>Powered by Claude AI · 🎤 Voice enabled</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,.15)", border:"none", borderRadius:50, width:34, height:34, cursor:"pointer", color:C.white, fontSize:15, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"14px 16px", display:"flex", flexDirection:"column", gap:10 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start" }}>
              <div style={{ maxWidth:"84%", padding:"11px 14px", borderRadius:m.role==="user"?"17px 17px 4px 17px":"17px 17px 17px 4px", background:m.role==="user"?`linear-gradient(135deg,${C.blue},${C.sky})`:C.stone, color:m.role==="user"?C.white:C.text, fontSize:14, lineHeight:1.5, whiteSpace:"pre-wrap" }}>{m.content}</div>
            </div>
          ))}
          {loading && <div style={{ display:"flex" }}><div style={{ background:C.stone, padding:"12px 16px", borderRadius:"17px 17px 17px 4px", display:"flex", gap:4 }}>{[0,1,2].map(i => <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:C.blue, animation:`bounce 1.2s ease-in-out ${i*.2}s infinite` }} />)}</div></div>}
          <div ref={endRef} />
        </div>
        <div style={{ padding:"8px 14px 0", display:"flex", gap:6, overflowX:"auto" }}>
          {QUICK.map(q => <button key={q} onClick={() => setInput(q)} style={{ background:C.stone, border:"1.5px solid #E2E8F0", borderRadius:20, padding:"5px 11px", fontSize:11, color:C.textMid, cursor:"pointer", whiteSpace:"nowrap", fontWeight:500, flexShrink:0 }}>{q}</button>)}
        </div>
        <div style={{ padding:"10px 14px 16px", display:"flex", gap:8, alignItems:"center" }}>
          <button onClick={startListening} disabled={listening} title="Tap to speak" style={{ width:44, height:44, borderRadius:"50%", border:"none", cursor:listening?"not-allowed":"pointer", background:listening?"linear-gradient(135deg,#EF4444,#DC2626)":`linear-gradient(135deg,#7C3AED,#6D28D9)`, color:C.white, fontSize:listening?12:20, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:listening?"0 0 0 4px rgba(239,68,68,.3)":"none", transition:"all .2s" }}>
            {listening ? "●" : "🎤"}
          </button>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==="Enter" && send()} placeholder={listening ? "Listening... speak now" : "Ask anything or tap 🎤 to speak"} style={{ flex:1, border:"1.5px solid #E2E8F0", borderRadius:22, padding:"11px 16px", fontSize:14, outline:"none", background:listening?"#F5F3FF":C.stone, color:C.text, fontFamily:"inherit", transition:"background .2s" }} />
          <button onClick={send} disabled={loading || !input.trim()} style={{ width:44, height:44, borderRadius:"50%", border:"none", cursor:loading||!input.trim()?"not-allowed":"pointer", background:loading||!input.trim()?"#CBD5E1":`linear-gradient(135deg,${C.blue},${C.sky})`, color:C.white, fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>↑</button>
        </div>
      </div>
    </Overlay>
  );
}

// ─── SHOPPING LIST MODAL ───────────────────────────────────────────────────────
function ShoppingModal({ onClose, list, weekLabel }) {
  const storageKey = `purchased_${weekLabel}`;
  const [purchased, setPurchased] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(storageKey) || "[]")); }
    catch { return new Set(); }
  });
  const [copied, setCopied] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const toggleItem = (key) => {
    setPurchased(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      localStorage.setItem(storageKey, JSON.stringify([...next]));
      return next;
    });
  };

  const clearPurchased = () => {
    setPurchased(new Set());
    localStorage.removeItem(storageKey);
    setShowConfirm(false);
  };

  const totalItems = Object.values(list).flat().length;
  const purchasedCount = purchased.size;
  const progressPct = totalItems > 0 ? Math.round((purchasedCount / totalItems) * 100) : 0;

  const copyList = () => {
    const unpurchased = Object.entries(list)
      .map(([cat, items]) => {
        const remaining = items.filter((_, i) => !purchased.has(`${cat}::${i}`));
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
              <div style={{ color:"#93C5FD", fontSize:11, marginTop:2 }}>{weekLabel} · {totalItems} items</div>
            </div>
            <button onClick={onClose} style={{ background:"rgba(255,255,255,.15)", border:"none", borderRadius:50, width:34, height:34, cursor:"pointer", color:C.white, fontSize:15, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
          </div>
          {/* Progress bar */}
          <div style={{ marginTop:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
              <span style={{ color:"#93C5FD", fontSize:11 }}>{purchasedCount} of {totalItems} items checked off</span>
              <span style={{ color:"#93C5FD", fontSize:11, fontWeight:700 }}>{progressPct}%</span>
            </div>
            <div style={{ height:6, background:"rgba(255,255,255,.15)", borderRadius:3, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${progressPct}%`, background:"linear-gradient(90deg,#34D399,#10B981)", borderRadius:3, transition:"width .3s" }} />
            </div>
          </div>
        </div>

        {/* Items */}
        <div style={{ flex:1, overflowY:"auto", padding:"14px 18px" }}>
          {Object.entries(list).map(([category, items]) => (
            <div key={category} style={{ marginBottom:18 }}>
              <div style={{ fontSize:13, fontWeight:700, color:C.navy, marginBottom:8 }}>{category}</div>
              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                {items.map((item, i) => {
                  const key = `${category}::${i}`;
                  const done = purchased.has(key);
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

        {/* Actions */}
        <div style={{ padding:"12px 18px 18px", borderTop:"1px solid #E2E8F0", flexShrink:0 }}>
          {showConfirm ? (
            <div style={{ background:"#FEF2F2", border:"1.5px solid #FECACA", borderRadius:14, padding:"12px 16px", marginBottom:10 }}>
              <div style={{ fontSize:13, fontWeight:600, color:"#991B1B", marginBottom:10 }}>Clear all checked items and reset the list?</div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={clearPurchased} style={{ flex:1, background:"#DC2626", color:C.white, border:"none", borderRadius:10, padding:"10px", fontWeight:700, cursor:"pointer", fontSize:13 }}>Yes, Clear All</button>
                <button onClick={() => setShowConfirm(false)} style={{ flex:1, background:C.stone, color:C.text, border:"1.5px solid #E2E8F0", borderRadius:10, padding:"10px", fontWeight:600, cursor:"pointer", fontSize:13 }}>Cancel</button>
              </div>
            </div>
          ) : purchasedCount > 0 && (
            <button onClick={() => setShowConfirm(true)} style={{ width:"100%", background:"#FEF2F2", border:"1.5px solid #FECACA", borderRadius:12, padding:"10px", color:"#DC2626", fontSize:13, fontWeight:700, cursor:"pointer", marginBottom:10, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
              🗑️ Clear {purchasedCount} Purchased Item{purchasedCount !== 1 ? "s" : ""}
            </button>
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
      </div>
    </Overlay>
  );
}

// ─── PLAN NEXT WEEK MODAL ──────────────────────────────────────────────────────
function PlanModal({ onClose, onSave }) {
  const [prefs, setPrefs] = useState({ people:4, proteins:["fish","chicken","lamb"], style:"summer", notes:"" });
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const toggleProtein = p => setPrefs(prev => ({
    ...prev,
    proteins: prev.proteins.includes(p) ? prev.proteins.filter(x => x!==p) : [...prev.proteins, p]
  }));

  const generate = async () => {
    if (prefs.proteins.length === 0) { setError("Pick at least one protein!"); return; }
    setGenerating(true); setError("");
    const nextMonday = new Date();
    nextMonday.setDate(nextMonday.getDate() + (8 - nextMonday.getDay()) % 7 || 7);
    const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
    const dates = days.map((_, i) => { const d = new Date(nextMonday); d.setDate(d.getDate() + i); return d.toLocaleDateString("en-US", { month:"short", day:"numeric" }); });
    const prompt = `Generate a 7-day summer Mediterranean meal plan for ${prefs.people} people. Proteins: ${prefs.proteins.join(", ")} (heavy on fish if included). Style: ${prefs.style}. Notes: ${prefs.notes || "none"}. Return a JSON array of 7 day objects with: id(0-6), short("Mon" etc), full("Monday" etc), date(use: ${dates.join(", ")}), breakfast(null OR {name,emoji,time:"X min",kidFriendly:bool} — only 4 of 7 days), lunch({name,emoji,time:"X min"}), dinner({name,emoji,time:"X min"}). Concise names under 40 chars. Return ONLY valid JSON array.`;
    try {
      const raw = await callClaude([{ role:"user", content:prompt }], "You are a Mediterranean meal planning expert. Return only valid JSON with no explanation or markdown.");
      const plan = JSON.parse(raw.replace(/```json|```/g,"").trim());
      if (!Array.isArray(plan) || plan.length !== 7) throw new Error("Invalid");
      const listRaw = await callClaude([{ role:"user", content:`Shopping list for this 7-day plan for ${prefs.people} people: ${JSON.stringify(plan.map(d=>({b:d.breakfast?.name,l:d.lunch?.name,d:d.dinner?.name})))}. Return JSON object with categories as keys and arrays of strings as values. Categories: "🐟 Seafood","🍗 Meat","🥬 Produce","🥛 Dairy & Eggs","🍞 Grains & Bread","🥫 Canned & Jarred","🫙 Pantry & Spices". Only relevant categories. ONLY valid JSON.` }], "You are a grocery shopping assistant. Return only valid JSON.");
      const shoppingList = JSON.parse(listRaw.replace(/```json|```/g,"").trim());
      onSave(plan, shoppingList);
    } catch(e) { setError("Generation failed — please try again."); }
    setGenerating(false);
  };

  const PROTEINS = [{ key:"fish", label:"🐟 Fish & Seafood" },{ key:"chicken", label:"🍗 Chicken" },{ key:"lamb", label:"🥩 Lamb" },{ key:"vegetarian", label:"🥗 Vegetarian" }];

  return (
    <Overlay onClose={onClose}>
      <div style={{ background:C.white, borderRadius:22, width:"100%", maxWidth:500, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 24px 80px rgba(15,45,94,.35)" }} onClick={e => e.stopPropagation()}>
        <div style={{ background:`linear-gradient(135deg,${C.navy},${C.navyMid})`, borderRadius:"22px 22px 0 0", padding:"22px 24px" }}>
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
            <Label>How many people?</Label>
            <div style={{ display:"flex", gap:8, marginTop:8 }}>
              {[2,3,4,5,6].map(n => (
                <button key={n} onClick={() => setPrefs(p => ({...p, people:n}))} style={{ flex:1, padding:"10px 0", borderRadius:12, border:`2px solid ${prefs.people===n?C.navy:"#E2E8F0"}`, background:prefs.people===n?C.navy:C.white, color:prefs.people===n?C.white:C.text, fontWeight:700, cursor:"pointer", fontSize:15 }}>{n}</button>
              ))}
            </div>
          </div>
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

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [week, setWeek] = useState("this");
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [selectedMealType, setSelectedMealType] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [shoppingOpen, setShoppingOpen] = useState(false);
  const [planningOpen, setPlanningOpen] = useState(false);
  const [nextWeekPlan, setNextWeekPlan] = useState(() => {
    try { return JSON.parse(localStorage.getItem("nextWeekPlan") || "null"); } catch { return null; }
  });
  const [nextWeekList, setNextWeekList] = useState(() => {
    try { return JSON.parse(localStorage.getItem("nextWeekList") || "null"); } catch { return null; }
  });
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem("favorites") || "[]"); } catch { return []; }
  });
  const [ratings, setRatings] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ratings") || "{}"); } catch { return {}; }
  });
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (week !== "favorites") setSelectedDay(0);
  }, [week]);

  const toggleFavorite = (name) => {
    setFavorites(prev => {
      const next = prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name];
      localStorage.setItem("favorites", JSON.stringify(next));
      return next;
    });
  };

  const rateRecipe = (name, stars) => {
    setRatings(prev => {
      const next = { ...prev, [name]: stars };
      if (stars === 0) delete next[name];
      localStorage.setItem("ratings", JSON.stringify(next));
      return next;
    });
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
    localStorage.setItem("nextWeekPlan", JSON.stringify(plan));
    localStorage.setItem("nextWeekList", JSON.stringify(list));
    setWeek("next"); setSelectedDay(0); setPlanningOpen(false);
  };

  const clearNextWeek = () => {
    setNextWeekPlan(null); setNextWeekList(null);
    localStorage.removeItem("nextWeekPlan"); localStorage.removeItem("nextWeekList");
  };

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
            <div style={{ fontSize:26 }}>🫒</div>
            <div>
              <div style={{ color:C.white, fontSize:17, fontWeight:800, letterSpacing:"-.02em" }}>Hocklac Meals</div>
              <div style={{ color:"#93C5FD", fontSize:11, marginTop:1 }}>Summer · Fish-Forward · Pescatarian</div>
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ color:C.white, fontSize:20, fontWeight:300 }}>{fmtTime(time)}</div>
            <div style={{ color:"#93C5FD", fontSize:11 }}>{fmtDate(time)}</div>
          </div>
        </div>

        {/* WEEK / SECTION TABS */}
        <div style={{ background:C.white, borderBottom:"1px solid #E2E8F0", padding:"10px 14px", display:"flex", gap:8, flexShrink:0 }}>
          {[
            { key:"this", label:"📅 This Week" },
            { key:"next", label:"✨ Next Week", badge: nextWeekPlan ? "Planned" : null },
            { key:"favorites", label:`⭐ Favorites`, badge: favorites.length > 0 ? String(favorites.length) : null },
          ].map(({ key, label, badge }) => (
            <button key={key} onClick={() => setWeek(key)} style={{ flex:1, padding:"10px 6px", borderRadius:12, border:`2px solid ${week===key?C.navy:"#E2E8F0"}`, background:week===key?C.navy:C.white, color:week===key?C.white:C.textMid, fontWeight:700, fontSize:12, cursor:"pointer", transition:"all .2s", display:"flex", alignItems:"center", justifyContent:"center", gap:5, flexWrap:"wrap" }}>
              {label}
              {badge && <span style={{ fontSize:10, background:week===key?"rgba(255,255,255,.25)":"#E2E8F0", padding:"1px 6px", borderRadius:10, color:week===key?C.white:C.textMid }}>{badge}</span>}
            </button>
          ))}
        </div>

        {/* DAY TABS — only show for this/next week */}
        {week !== "favorites" && days.length > 0 && (
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
          {week !== "favorites" && (week === "this" || nextWeekPlan) && day && (
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

      {selectedMeal && <RecipeModal meal={selectedMeal} type={selectedMealType} onClose={() => { setSelectedMeal(null); setSelectedMealType(null); }} favorites={favorites} ratings={ratings} onFavorite={toggleFavorite} onRate={rateRecipe} />}
      {chatOpen && <ChatModal onClose={() => setChatOpen(false)} weekLabel={weekLabel} />}
      {shoppingOpen && shoppingList && <ShoppingModal onClose={() => setShoppingOpen(false)} list={shoppingList} weekLabel={weekLabel} />}
      {planningOpen && <PlanModal onClose={() => setPlanningOpen(false)} onSave={savePlan} />}
    </>
  );
}
