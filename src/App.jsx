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
  "Greek Yogurt Parfaits": { time:"5 min", servings:"4", ingredients:["Greek yogurt, plain full-fat","Granola","Fresh berries","Honey to drizzle"], steps:["Spoon Greek yogurt as the base.","Add granola.","Top with berries.","Drizzle with honey.","Repeat layers!"], kidTip:"No heat needed — perfect starter recipe!" },
  "Greek Salad + Grilled Chicken": { time:"20 min", servings:"4", ingredients:["1.5 lbs chicken thighs","2 cucumbers","2 pints cherry tomatoes","1 red onion","Kalamata olives","Feta cheese","Olive oil, red wine vinegar, oregano"], steps:["Season chicken with oregano, garlic, lemon, olive oil.","Grill 5–6 min per side, slice.","Toss salad veg with dressing.","Serve topped with chicken + warm pita."] },
  "Lemon Herb Grilled Salmon": { time:"25 min", servings:"4", ingredients:["1.5 lbs salmon fillets","3 tbsp olive oil","3 garlic cloves","Zest + juice of 2 lemons","2 tbsp fresh parsley","Salt, pepper, oregano","4 ears corn"], steps:["Mix marinade: olive oil, garlic, lemon, parsley, oregano.","Coat salmon, marinate 15–30 min.","Grill medium-high 4–5 min per side.","Serve with grilled corn."] },
  "Scrambled Eggs with Feta": { time:"10 min", servings:"4", ingredients:["2–3 eggs per person","Splash of milk","Butter","Feta cheese","Dried oregano","Salt & pepper"], steps:["Crack eggs, add milk, whisk.","Heat pan MEDIUM-LOW.","Melt butter, pour in eggs.","Don't touch 30 sec, then gently fold.","Add feta + oregano before done."], kidTip:"Kids learn cracking eggs, stovetop safety, and heat control." },
  "Mediterranean Tuna Wraps": { time:"10 min", servings:"4", ingredients:["3 cans tuna in olive oil","½ cucumber diced","½ red onion diced","Cherry tomatoes","Kalamata olives","Feta","Pita or tortillas","Olive oil, lemon, oregano"], steps:["Drain and flake tuna.","Mix in cucumber, onion, tomatoes, olives, feta.","Dress with olive oil, lemon, oregano.","Spoon into pita and roll up."] },
  "Shrimp Tacos + Mango Salsa": { time:"30 min", servings:"4", ingredients:["1 lb shrimp","2 mangos diced","½ red onion","1 jalapeño","Juice of 2 limes","Coleslaw mix","Small flour tortillas","Cumin, smoked paprika, garlic powder"], steps:["Make salsa: mango, onion, jalapeño, lime. Chill.","Toss slaw with lime + olive oil.","Season shrimp, cook 2–3 min per side.","Assemble: tortilla → slaw → shrimp → salsa."] },
  "Cold Farro Salad + Grilled Shrimp": { time:"30 min", servings:"4", ingredients:["1.5 cups farro","1 lb shrimp","1 cucumber","Kalamata olives","4 oz feta","1 jar roasted red peppers","Fresh parsley","Olive oil, vinegar, lemon"], steps:["Cook farro, cool on sheet pan.","Grill shrimp, chill.","Toss farro with all veg + dressing.","Top with chilled shrimp. Serve cold."] },
  "Lamb Kofta + Tabbouleh + Tzatziki": { time:"35 min", servings:"4", ingredients:["1.5 lbs ground lamb","½ onion grated","3 garlic cloves","Cumin, coriander, paprika, cinnamon, allspice","2 bunches parsley + mint","1 cup farro/bulgur","1 cup yogurt + 1 cucumber (tzatziki)"], steps:["Mix lamb + onion + garlic + spices. Shape onto skewers.","Grill 3–4 min per side.","Cook farro, cool, mix with herbs + lemon.","Make tzatziki: yogurt + cucumber + garlic + lemon.","Serve with tabbouleh, tzatziki, pita."] },
  "Caprese Panzanella Salad": { time:"20 min", servings:"4", ingredients:["½ loaf ciabatta cubed","6 ripe tomatoes","1 pint cherry tomatoes","Red onion, capers, olives","Feta","Olive oil, red wine vinegar, garlic"], steps:["Toast ciabatta in olive oil until golden.","Combine with tomatoes, onion, capers, olives.","Dress with olive oil, vinegar, garlic.","Add feta. Let sit 10 min."] },
  "Grilled Cod + Veggie Skewers": { time:"30 min", servings:"4", ingredients:["1.5 lbs cod fillets","Zucchini, bell pepper, red onion, cherry tomatoes","Olive oil, lemon, garlic, oregano","Wooden skewers (soaked)"], steps:["Brush cod with oil, lemon, garlic, oregano.","Grill cod in foil 4–5 min per side.","Thread veg on skewers, brush with oil + oregano.","Grill skewers 10–12 min, turning.","Serve with extra lemon."] },
  "Chickpea Salad + Roasted Red Pepper": { time:"10 min", servings:"4", ingredients:["2 cans chickpeas","1 jar roasted red peppers","2 handfuls arugula","½ red onion","Kalamata olives, feta","Olive oil, lemon, cumin, red pepper flakes"], steps:["Combine all ingredients.","Dress with olive oil, lemon, cumin, red pepper flakes.","Toss well and serve with pita."] },
  "Garlic Butter Shrimp + Orzo": { time:"25 min", servings:"4", ingredients:["1 lb orzo","1 lb shrimp","2 zucchini diced","3 tbsp butter","5 garlic cloves","Juice of 1 lemon","Parsley, parmesan"], steps:["Cook orzo, drain, toss with olive oil.","Sauté zucchini until golden, set aside.","Melt butter, sauté garlic 1 min.","Add shrimp 2–3 min per side.","Combine with orzo + zucchini + lemon.","Top with parsley + parmesan."] },
  "Avocado Toast + Everything Seasoning": { time:"10 min", servings:"4", ingredients:["Thick bread (2 slices/person)","1 ripe avocado","Lemon squeeze","Salt","Everything bagel seasoning"], steps:["Toast bread.","Mash avocado with lemon and salt.","Spread on toast.","Top with everything seasoning."], kidTip:"Kids learn knife safety basics, mashing, and seasoning." },
  "Grilled Lamb Chops + Watermelon Salad": { time:"25 min", servings:"4", ingredients:["4 lamb loin chops","Olive oil, garlic, rosemary","½ seedless watermelon cubed","4 oz feta","Fresh mint","½ red onion","Olive oil + lime juice"], steps:["Rub chops with oil, garlic, rosemary, salt.","Grill 3–4 min per side. Rest 5 min.","Combine watermelon, feta, mint, red onion.","Drizzle salad with oil + lime.","Serve alongside."] },
  "Pan-Seared Tilapia + Tabbouleh": { time:"30 min", servings:"4", ingredients:["1.5 lbs tilapia","Salt, pepper, smoked paprika","1 cup farro/bulgur","2 bunches parsley, ½ bunch mint","2 roma tomatoes, ½ cucumber","Juice of 2 lemons, olive oil"], steps:["Cook farro, cool. Mix with herbs, tomato, cucumber, lemon, oil.","Season tilapia with salt, pepper, paprika.","Sear 3–4 min per side until golden.","Serve over tabbouleh with pita."] },
  "French Toast + Honey & Berries": { time:"20 min", servings:"4", ingredients:["Thick brioche or sandwich bread","3 eggs","Splash of milk + cinnamon + vanilla","Butter","Fresh berries + honey"], steps:["Whisk eggs, milk, cinnamon, vanilla.","Heat pan MEDIUM, melt butter.","Dip bread, coat both sides.","Cook 2–3 min per side until golden.","Top with berries + honey."], kidTip:"Kids learn egg wash technique, flipping, and timing!" },
  "Cold Pasta Salad + Tuna & Artichokes": { time:"20 min", servings:"4", ingredients:["1 lb rotini","3–4 cans tuna in olive oil","1 can artichoke hearts","Kalamata olives, roasted red peppers, capers","½ red onion, parsley","Olive oil, vinegar, lemon, oregano"], steps:["Cook rotini, drain, rinse cold, toss with oil.","Mix in tuna, artichokes, olives, peppers, capers, onion.","Dress and toss well.","Chill 1 hour. Serve cold."] },
  "Grilled Branzino + Red Pepper Couscous": { time:"35 min", servings:"4", ingredients:["1.5 lbs branzino or sea bass","1.5 cups couscous","1 jar roasted red peppers","Kalamata olives, parsley","Lemon slices + herbs","Olive oil, salt & pepper"], steps:["Pour boiling water over couscous, cover 5 min, fluff.","Stir in red peppers, olives, lemon, oil, parsley.","Score fish skin, brush with oil, season.","Grill 5–6 min per side (or fillets 3–4 min).","Serve over couscous."] },
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

function MealCard({ type, meal, onTap }) {
  const s = MEAL_STYLE[type];
  const label = type.charAt(0).toUpperCase() + type.slice(1);
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
        <span style={{ fontSize:12, color:s.textColor, opacity:.75 }}>⏱ {meal.time}</span>
        <span style={{ fontSize:11, fontWeight:600, color:s.textColor, opacity:.8, background:s.labelBg, padding:"3px 10px", borderRadius:20 }}>Recipe →</span>
      </div>
    </div>
  );
}

function RecipeModal({ meal, type, onClose }) {
  const recipe = RECIPES[meal.name];
  const s = MEAL_STYLE[type];
  if (!recipe) return (
    <Overlay onClose={onClose}>
      <div style={{ background:C.white, borderRadius:22, padding:32, maxWidth:400, width:"100%", textAlign:"center" }}>
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
            <button onClick={onClose} style={{ background:s.labelBg, border:"none", borderRadius:50, width:38, height:38, cursor:"pointer", fontSize:16, color:s.textColor, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
          </div>
        </div>
        <div style={{ padding:"22px 24px", display:"flex", flexDirection:"column", gap:20 }}>
          <Section title="INGREDIENTS">
            {recipe.ingredients.map((ing, i) => <Row key={i} dot>#• {ing}</Row>)}
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
  const text = children.replace("#• ", "");
  return (
    <div style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:8 }}>
      <div style={{ width:6, height:6, borderRadius:"50%", background:C.blue, marginTop:6, flexShrink:0 }} />
      <span style={{ fontSize:14, color:C.text, lineHeight:1.4 }}>{text}</span>
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

// ─── CHAT MODAL ────────────────────────────────────────────────────────────────
function ChatModal({ onClose, weekLabel }) {
  const [messages, setMessages] = useState([{ role:"assistant", content:`Hi! I'm your Hocklac Meals kitchen assistant. Ask me anything about ${weekLabel} — substitutions, prep tips, leftovers, or what the kids can help with! 🫒` }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
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

  const QUICK = ["What can I sub for cod?", "Prep-ahead tips?", "Kid-friendly help?", "What pairs with lamb kofta?"];

  return (
    <Overlay onClose={onClose}>
      <div style={{ background:C.white, borderRadius:22, width:"100%", maxWidth:500, height:"80vh", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 24px 80px rgba(15,45,94,.35)" }} onClick={e => e.stopPropagation()}>
        <div style={{ background:`linear-gradient(135deg,${C.navy},${C.navyMid})`, padding:"18px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:"50%", background:"linear-gradient(135deg,#3B82F6,#06B6D4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🤖</div>
            <div>
              <div style={{ color:C.white, fontWeight:700, fontSize:15 }}>Kitchen Assistant</div>
              <div style={{ color:"#93C5FD", fontSize:11 }}>Powered by Claude AI</div>
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
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==="Enter" && send()} placeholder="Ask anything about the meal plan..." style={{ flex:1, border:"1.5px solid #E2E8F0", borderRadius:22, padding:"11px 16px", fontSize:14, outline:"none", background:C.stone, color:C.text, fontFamily:"inherit" }} />
          <button onClick={send} disabled={loading || !input.trim()} style={{ width:44, height:44, borderRadius:"50%", border:"none", cursor:loading||!input.trim()?"not-allowed":"pointer", background:loading||!input.trim()?"#CBD5E1":`linear-gradient(135deg,${C.blue},${C.sky})`, color:C.white, fontSize:18, display:"flex", alignItems:"center", justifyContent:"center" }}>↑</button>
        </div>
      </div>
    </Overlay>
  );
}

// ─── SHOPPING LIST MODAL ───────────────────────────────────────────────────────
function ShoppingModal({ onClose, list, weekLabel }) {
  const [copied, setCopied] = useState(false);

  const allItems = Object.entries(list).flatMap(([cat, items]) =>
    [`\n${cat}`, ...items.map(i => `  • ${i}`)]
  ).join("\n");

  const copyList = () => {
    navigator.clipboard.writeText(`${weekLabel} Shopping List\n${allItems}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openInstacart = () => {
    window.open("https://www.instacart.com/store/harris-teeter", "_blank");
  };

  return (
    <Overlay onClose={onClose}>
      <div style={{ background:C.white, borderRadius:22, width:"100%", maxWidth:600, maxHeight:"90vh", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 24px 80px rgba(15,45,94,.35)" }} onClick={e => e.stopPropagation()}>
        <div style={{ background:`linear-gradient(135deg,${C.navy},${C.navyMid})`, padding:"20px 22px", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
          <div>
            <div style={{ color:C.white, fontWeight:800, fontSize:17 }}>🛒 Shopping List</div>
            <div style={{ color:"#93C5FD", fontSize:11, marginTop:2 }}>{weekLabel} · {Object.values(list).flat().length} items</div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,.15)", border:"none", borderRadius:50, width:36, height:36, cursor:"pointer", color:C.white, fontSize:15, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"16px 20px" }}>
          {Object.entries(list).map(([category, items]) => (
            <div key={category} style={{ marginBottom:20 }}>
              <div style={{ fontSize:13, fontWeight:700, color:C.navy, marginBottom:8, display:"flex", alignItems:"center", gap:6 }}>
                {category}
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                {items.map((item, i) => (
                  <div key={i} style={{ display:"flex", gap:10, alignItems:"center", padding:"7px 12px", background:C.stone, borderRadius:10 }}>
                    <div style={{ width:6, height:6, borderRadius:"50%", background:"#94A3B8", flexShrink:0 }} />
                    <span style={{ fontSize:14, color:C.text }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding:"12px 20px 18px", borderTop:"1px solid #E2E8F0", display:"flex", gap:10, flexShrink:0 }}>
          <button onClick={copyList} style={{ flex:1, background:copied?"#065F46":C.stone, border:`1.5px solid ${copied?"#065F46":"#E2E8F0"}`, borderRadius:14, padding:"13px", color:copied?C.white:C.textMid, fontSize:13, fontWeight:700, cursor:"pointer", transition:"all .2s" }}>
            {copied ? "✓ Copied!" : "📋 Copy List"}
          </button>
          <button onClick={openInstacart} style={{ flex:2, background:`linear-gradient(135deg,#43A047,#2E7D32)`, border:"none", borderRadius:14, padding:"13px", color:C.white, fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:"0 4px 14px rgba(46,125,50,.3)" }}>
            <span style={{ fontSize:18 }}>🛒</span> Order on Instacart (Harris Teeter)
          </button>
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
    setGenerating(true);
    setError("");
    const nextMonday = new Date();
    nextMonday.setDate(nextMonday.getDate() + (8 - nextMonday.getDay()) % 7 || 7);
    const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
    const dates = days.map((_, i) => {
      const d = new Date(nextMonday); d.setDate(d.getDate() + i);
      return d.toLocaleDateString("en-US", { month:"short", day:"numeric" });
    });

    const prompt = `Generate a 7-day summer Mediterranean meal plan for ${prefs.people} people.
Proteins to use: ${prefs.proteins.join(", ")} (heavy on fish if included).
Style: ${prefs.style} and fresh.
Extra notes: ${prefs.notes || "none"}.
${prefs.proteins.includes("fish") ? "Fish/seafood should appear in most dinners." : ""}

Return a JSON array of 7 day objects. Each must have:
- id: 0-6
- short: "Mon"/"Tue"/etc
- full: "Monday"/"Tuesday"/etc
- date: use these dates in order: ${dates.join(", ")}
- breakfast: null OR {name, emoji, time:"X min", kidFriendly:true/false} — only include breakfast for 4 of the 7 days
- lunch: {name, emoji, time:"X min"}
- dinner: {name, emoji, time:"X min"}

Keep meal names concise (under 40 chars). Use fitting food emojis.
Return ONLY valid JSON array, nothing else.`;

    try {
      const raw = await callClaude([{ role:"user", content:prompt }],
        "You are a Mediterranean meal planning expert. Return only valid JSON with no explanation or markdown."
      );
      const clean = raw.replace(/```json|```/g, "").trim();
      const plan = JSON.parse(clean);
      if (!Array.isArray(plan) || plan.length !== 7) throw new Error("Invalid plan structure");

      // Also generate shopping list
      const listPrompt = `Given this 7-day meal plan: ${JSON.stringify(plan.map(d => ({
        breakfast: d.breakfast?.name,
        lunch: d.lunch?.name,
        dinner: d.dinner?.name,
      })))}, generate a categorized shopping list for ${prefs.people} people.
Return JSON object with categories as keys and arrays of strings as values.
Categories: "🐟 Seafood", "🍗 Meat", "🥬 Produce", "🥛 Dairy & Eggs", "🍞 Grains & Bread", "🥫 Canned & Jarred", "🫙 Pantry & Spices".
Only include relevant categories. Each item should include quantity.
Return ONLY valid JSON object, nothing else.`;

      const listRaw = await callClaude([{ role:"user", content:listPrompt }],
        "You are a grocery shopping assistant. Return only valid JSON with no explanation or markdown."
      );
      const listClean = listRaw.replace(/```json|```/g, "").trim();
      const shoppingList = JSON.parse(listClean);

      onSave(plan, shoppingList);
    } catch(e) {
      setError("Generation failed — please try again.");
      console.error(e);
    }
    setGenerating(false);
  };

  const PROTEINS = [
    { key:"fish", label:"🐟 Fish & Seafood" },
    { key:"chicken", label:"🍗 Chicken" },
    { key:"lamb", label:"🥩 Lamb" },
    { key:"vegetarian", label:"🥗 Vegetarian" },
  ];

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
          {/* People */}
          <div>
            <Label>How many people?</Label>
            <div style={{ display:"flex", gap:8, marginTop:8 }}>
              {[2,3,4,5,6].map(n => (
                <button key={n} onClick={() => setPrefs(p => ({...p, people:n}))} style={{ flex:1, padding:"10px 0", borderRadius:12, border:`2px solid ${prefs.people===n?C.navy:"#E2E8F0"}`, background:prefs.people===n?C.navy:C.white, color:prefs.people===n?C.white:C.text, fontWeight:700, cursor:"pointer", fontSize:15 }}>{n}</button>
              ))}
            </div>
          </div>

          {/* Proteins */}
          <div>
            <Label>Proteins to include</Label>
            <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:8 }}>
              {PROTEINS.map(({ key, label }) => {
                const on = prefs.proteins.includes(key);
                return (
                  <button key={key} onClick={() => toggleProtein(key)} style={{ padding:"12px 16px", borderRadius:14, border:`2px solid ${on?C.blue:"#E2E8F0"}`, background:on?`linear-gradient(135deg,${C.blue}18,${C.sky}18)`:C.white, color:C.text, fontWeight:on?700:500, cursor:"pointer", textAlign:"left", fontSize:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    {label}
                    <span style={{ fontSize:16 }}>{on?"✓":""}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Style */}
          <div>
            <Label>Meal style</Label>
            <div style={{ display:"flex", gap:8, marginTop:8, flexWrap:"wrap" }}>
              {["summer","light","hearty","quick"].map(s => (
                <button key={s} onClick={() => setPrefs(p => ({...p, style:s}))} style={{ padding:"8px 16px", borderRadius:20, border:`2px solid ${prefs.style===s?C.blue:"#E2E8F0"}`, background:prefs.style===s?C.blue:C.white, color:prefs.style===s?C.white:C.text, fontWeight:600, cursor:"pointer", fontSize:13, textTransform:"capitalize" }}>{s}</button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label>Any notes or restrictions? (optional)</Label>
            <textarea value={prefs.notes} onChange={e => setPrefs(p => ({...p, notes:e.target.value}))} placeholder="e.g. no shellfish, prefer grilled over fried, kid-friendly..." style={{ width:"100%", marginTop:8, padding:"12px 14px", border:"1.5px solid #E2E8F0", borderRadius:14, fontSize:14, color:C.text, background:C.stone, resize:"vertical", minHeight:70, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }} />
          </div>

          {error && <div style={{ background:"#FEF2F2", color:"#991B1B", padding:"10px 14px", borderRadius:12, fontSize:13 }}>{error}</div>}

          <button onClick={generate} disabled={generating} style={{ padding:"16px", borderRadius:16, border:"none", background:generating?"#CBD5E1":`linear-gradient(135deg,${C.navy},${C.navyMid})`, color:C.white, fontSize:15, fontWeight:800, cursor:generating?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10, boxShadow:generating?"none":"0 4px 16px rgba(15,45,94,.3)" }}>
            {generating ? (
              <><Spinner /> Generating your meal plan...</>
            ) : (
              <><span style={{ fontSize:20 }}>✨</span> Generate My Week</>
            )}
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
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (week === "next") setSelectedDay(0);
  }, [week]);

  const days = week === "this" ? THIS_WEEK : (nextWeekPlan || []);
  const day = days[selectedDay];
  const shoppingList = week === "this" ? THIS_WEEK_SHOPPING : nextWeekList;
  const weekLabel = week === "this" ? "This Week (Jun 11–17)" : "Next Week";

  const savePlan = (plan, list) => {
    setNextWeekPlan(plan);
    setNextWeekList(list);
    localStorage.setItem("nextWeekPlan", JSON.stringify(plan));
    localStorage.setItem("nextWeekList", JSON.stringify(list));
    setWeek("next");
    setSelectedDay(0);
    setPlanningOpen(false);
  };

  const clearNextWeek = () => {
    setNextWeekPlan(null);
    setNextWeekList(null);
    localStorage.removeItem("nextWeekPlan");
    localStorage.removeItem("nextWeekList");
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
            <div style={{ color:C.white, fontSize:20, fontWeight:300, letterSpacing:"-.02em" }}>{fmtTime(time)}</div>
            <div style={{ color:"#93C5FD", fontSize:11 }}>{fmtDate(time)}</div>
          </div>
        </div>

        {/* WEEK SWITCHER */}
        <div style={{ background:C.white, borderBottom:"1px solid #E2E8F0", padding:"10px 16px", display:"flex", gap:10, flexShrink:0 }}>
          {["this","next"].map(w => (
            <button key={w} onClick={() => setWeek(w)} style={{ flex:1, padding:"10px", borderRadius:12, border:`2px solid ${week===w?C.navy:"#E2E8F0"}`, background:week===w?C.navy:C.white, color:week===w?C.white:C.textMid, fontWeight:700, fontSize:13, cursor:"pointer", transition:"all .2s", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
              {w === "this" ? "📅 This Week" : "✨ Next Week"}
              {w === "next" && nextWeekPlan && <span style={{ fontSize:10, background:"rgba(255,255,255,.25)", padding:"1px 6px", borderRadius:10 }}>Planned</span>}
            </button>
          ))}
        </div>

        {/* DAY TABS */}
        {days.length > 0 && (
          <div style={{ background:C.white, borderBottom:"1px solid #E2E8F0", display:"flex", overflowX:"auto", flexShrink:0, padding:"0 8px" }}>
            {days.map((d, i) => {
              const active = selectedDay === i;
              return (
                <button key={d.id} onClick={() => setSelectedDay(i)} style={{ background:active?C.navy:"transparent", border:"none", borderRadius:"0 0 12px 12px", padding:"11px 12px 9px", cursor:"pointer", color:active?C.white:C.textMid, fontSize:12, fontWeight:active?700:500, display:"flex", flexDirection:"column", alignItems:"center", gap:2, transition:"all .2s", flexShrink:0, boxShadow:active?"0 4px 14px rgba(15,45,94,.25)":"none", minWidth:50 }}>
                  <span style={{ fontSize:9, fontWeight:700, letterSpacing:".04em", opacity:active?1:.65 }}>{d.short.toUpperCase()}</span>
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

          {/* NEXT WEEK EMPTY STATE */}
          {week === "next" && !nextWeekPlan ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"48px 24px", textAlign:"center", gap:20 }}>
              <div style={{ fontSize:64 }}>✨</div>
              <div style={{ fontSize:22, fontWeight:800, color:C.navy }}>Plan Next Week</div>
              <div style={{ fontSize:15, color:C.textMid, maxWidth:320, lineHeight:1.6 }}>Let Claude AI build a custom Mediterranean meal plan for your family — just pick your preferences.</div>
              <button onClick={() => setPlanningOpen(true)} style={{ padding:"16px 32px", background:`linear-gradient(135deg,${C.navy},${C.navyMid})`, border:"none", borderRadius:16, color:C.white, fontSize:15, fontWeight:800, cursor:"pointer", boxShadow:"0 4px 20px rgba(15,45,94,.3)", display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:22 }}>✨</span> Generate My Plan
              </button>
            </div>
          ) : week === "next" && nextWeekPlan && !day ? null : (
            <>
              {/* Day label */}
              <div style={{ marginBottom:14, display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                <div style={{ fontSize:20, fontWeight:800, color:C.navy }}>{day?.full}</div>
                <div style={{ fontSize:12, color:C.textMid, background:C.white, padding:"3px 10px", borderRadius:20, border:"1px solid #E2E8F0" }}>{day?.date}</div>
                {week === "this" && selectedDay === 0 && <div style={{ fontSize:11, fontWeight:700, color:"#065F46", background:"#D1FAE5", padding:"3px 9px", borderRadius:20 }}>TODAY</div>}
                {week === "next" && <button onClick={clearNextWeek} style={{ fontSize:11, color:"#991B1B", background:"#FEF2F2", border:"none", borderRadius:20, padding:"3px 10px", cursor:"pointer", fontWeight:600 }}>↺ Regenerate</button>}
              </div>

              {/* Meal cards */}
              {day && (
                <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:22 }}>
                  {["breakfast","lunch","dinner"].map(type => (
                    <MealCard key={type} type={type} meal={day[type]} onTap={(meal, t) => { setSelectedMeal(meal); setSelectedMealType(t); }} />
                  ))}
                </div>
              )}

              {/* Week strip */}
              {days.length > 0 && (
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
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* BOTTOM BAR */}
        <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"rgba(241,245,249,.97)", backdropFilter:"blur(12px)", borderTop:"1px solid #E2E8F0", padding:"10px 14px 14px", display:"flex", gap:8 }}>
          <button onClick={() => setChatOpen(true)} style={{ flex:2, background:`linear-gradient(135deg,${C.navy},${C.navyMid})`, border:"none", borderRadius:13, padding:"12px 14px", color:C.white, fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7, boxShadow:"0 4px 14px rgba(15,45,94,.28)" }}>
            <span style={{ fontSize:17 }}>🤖</span> Ask Claude
          </button>
          {shoppingList ? (
            <button onClick={() => setShoppingOpen(true)} style={{ flex:2, background:`linear-gradient(135deg,#16A34A,#15803D)`, border:"none", borderRadius:13, padding:"12px 14px", color:C.white, fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7, boxShadow:"0 4px 14px rgba(22,163,74,.25)" }}>
              <span style={{ fontSize:17 }}>🛒</span> Shop / Instacart
            </button>
          ) : (
            <button onClick={() => setPlanningOpen(true)} style={{ flex:2, background:`linear-gradient(135deg,#7C3AED,#6D28D9)`, border:"none", borderRadius:13, padding:"12px 14px", color:C.white, fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7, boxShadow:"0 4px 14px rgba(124,58,237,.25)" }}>
              <span style={{ fontSize:17 }}>✨</span> Plan Next Week
            </button>
          )}
        </div>
      </div>

      {/* MODALS */}
      {selectedMeal && <RecipeModal meal={selectedMeal} type={selectedMealType} onClose={() => { setSelectedMeal(null); setSelectedMealType(null); }} />}
      {chatOpen && <ChatModal onClose={() => setChatOpen(false)} weekLabel={weekLabel} />}
      {shoppingOpen && shoppingList && <ShoppingModal onClose={() => setShoppingOpen(false)} list={shoppingList} weekLabel={weekLabel} />}
      {planningOpen && <PlanModal onClose={() => setPlanningOpen(false)} onSave={savePlan} />}
    </>
  );
}
