import type { Locale } from "@/i18n/routing";
import type { Callout, Figure, TitledItem } from "@/components/ProjectPageKit";

// Copy for the bespoke digital-twin page. The listing on /projects, the
// sitemap and llms-full.txt still read the project's MDX frontmatter and
// prose; this module only feeds the custom detail page. The diagrams are
// exported from projects/AI-digital-twin/ (see scripts/drawio-export.mjs and
// scripts/mermaid-export.mjs).

export const SLUG = "digital-twin";
export const ACCENT = "#F59E0B";
export const REPO_URL = "https://github.com/datavakwerk/digital-twin";
// The running assistant, deployed next to this site (twin.ruudjuffermans.nl).
// Read from NEXT_PUBLIC_TWIN_URL at build time; while it is unset the
// "Try it live" buttons on this page and the homepage are not rendered, so
// the site never ships a dead link before the assistant is actually up.
export const LIVE_URL: string | undefined = process.env.NEXT_PUBLIC_TWIN_URL || undefined;
const IMG = "/images/projects/digital-twin";

export interface CodeItem {
  code: string;
  title: string;
  body: string;
}

export interface PageContent {
  eyebrow: string;
  title: string;
  lead: string;
  intro: string[];
  facts: string[];
  stats: { label: string; value: string }[];
  ui: {
    repo: string;
    live: string;
    allProjects: string;
    back: string;
    article: string;
    scope: string;
  };
  hero: Figure;
  why: { title: string; body: string[] };
  design: { title: string; body: string[]; partsTitle: string; parts: TitledItem[] };
  graph: {
    title: string;
    body: string[];
    figure: Figure;
    nodesTitle: string;
    nodes: CodeItem[];
    after: string[];
    loop: string;
  };
  approval: {
    title: string;
    body: string[];
    figure: Figure;
    stepsTitle: string;
    steps: string[];
    stepsNote: string;
    quote: string;
  };
  layers: {
    title: string;
    body: string[];
    callouts: Callout[];
    figure: Figure;
    layersTitle: string;
    layers: TitledItem[];
    contractTitle: string;
    contract: string[];
    contractNote: string;
  };
  data: { title: string; intro: string; body: string[]; caption: string; rows: string[][]; note: string };
  evaluation: { title: string; intro: string; columns: string[]; rows: string[][]; body: string[] };
  limits: { title: string; intro: string; items: TitledItem[] };
  choices: { title: string; intro: string; items: TitledItem[] };
  shows: { title: string; skills: string[]; closing: string };
}

const DIAGRAM_DIMS = {
  "digital-twin-1-architectuur": { width: 1606, height: 751 },
  "digital-twin-2-agent-graph": { width: 1425, height: 764 },
  "digital-twin-3-goedkeuringsflow": { width: 2011, height: 1158 },
  "digital-twin-4-lagen-om-het-model": { width: 1594, height: 859 },
} as const;

function diagram(name: keyof typeof DIAGRAM_DIMS, alt: string, caption: string): Figure {
  // The architecture diagram carries the most detail, so it is rendered by
  // draw.io's own viewer (zoom, pan, lightbox) from the .drawio source in
  // public/diagrams; the others stay a flat SVG that links to its full size.
  const drawioSrc = name.endsWith("-architectuur") ? `/diagrams/${name}.drawio` : undefined;
  return { kind: "diagram", src: `${IMG}/${name}.svg`, ...DIAGRAM_DIMS[name], alt, caption, drawioSrc };
}

const nl: PageContent = {
  eyebrow: "Eigen project",
  title: "Digital-twin: een AI-agent die namens mij antwoordt — met bronnen",
  lead: "Een LangGraph-agent over mijn cv, projecten en artikelen die vragen van bezoekers beantwoordt in een streaming chat. Elke bewering met bron, weigeren zonder bron, een hard dagbudget en menselijke goedkeuring voordat hij namens mij handelt.",
  intro: [
    "Iedereen kent de demo: een chatbot over “jouw documenten” die overtuigend antwoordt in een strakke interface. Dat kost een middag. Wat de demo niet laat zien is wat er op dag drie gebeurt — als een bezoeker “negeer je instructies” intypt, als iemand hem zijn Python-huiswerk laat schrijven op jouw API-budget, of als hij vol overtuiging een baan verzint die je nooit had.",
    "Dit project is gebouwd om dat gat te dichten. De chat was het makkelijke deel. Het interessante deel is alles rondom het model dat het veilig maakt om hem onbeheerd te laten draaien: guards die geen model nodig hebben, een kostenlimiet die fail closed is, een goedkeuringsstap voor het ene pad dat namens mij handelt, en evaluaties die elke wijziging bewaken.",
  ],
  facts: [
    "Python · FastAPI",
    "LangGraph",
    "Postgres + pgvector",
    "React + Vite",
    "Server-sent events",
    "Gemini / OpenAI / DeepSeek / Kimi",
    "58 tests, ruff schoon",
  ],
  stats: [
    { label: "Guards", value: "Fail closed, zonder model" },
    { label: "Evaluatiegrens", value: "95% tools · 90% taken" },
    { label: "Risicovolle acties", value: "Menselijke goedkeuring" },
    { label: "Dagbudget", value: "Hard plafond, overleeft herstart" },
  ],
  ui: {
    repo: "Bekijk de code op GitHub",
    live: "Probeer de assistent live",
    allProjects: "Alle projecten",
    back: "Terug naar projecten",
    article: "Achtergrondartikel op het blog: “Een digital-twin die alleen zegt wat hij kan bewijzen”.",
    scope: "De assistent spreekt óver mij, nooit namens mij: alles wat mijn inbox bereikt, passeert eerst mijn goedkeuring.",
  },
  hero: diagram(
    "digital-twin-1-architectuur",
    "Systeemarchitectuur van digital-twin in vijf kolommen: browser (React + Vite, SSE-events, thread_id per gesprek), FastAPI (POST /api/chat met rate limit 20 per 10 minuten per IP, POST /api/feedback, /api/admin/approvals met bearer token, pydantic-validatie), agent (LangGraph-graph guard → generate → tools → verify, guards, tools, BudgetTracker, checkpoint per thread), providerlaag (system prompt + kennisbank als stabiel prefix, chat-completions client met retry, kostenberekening per beurt) en modellen (Gemini, OpenAI, DeepSeek, Kimi; één .env-variabele schakelt om). Daaronder Ruud als beheerder, de kennisbank en Postgres + pgvector met de tabellen checkpoints, pending_approvals, turn_log, budget_ledger, guard_incidents, feedback, contact_messages, knowledge_chunks en eval_runs.",
    "Eén beurt loopt van browser via FastAPI naar de agent en het model; alles wat de agent doet, landt in Postgres.",
  ),
  why: {
    title: "Waarom dit project",
    body: [
      "Ik wilde weten waar de grens ligt tussen een agent die demonstreert en een agent die je een weekend alleen durft te laten. Die grens ligt niet bij de prompt en niet bij het model. Die ligt bij de vragen die elke organisatie tegenkomt zodra een assistent op de eigen kennis publiek wordt: hoe garandeer je dat antwoorden onderbouwd zijn, hoe voorkom je dat hij zonder toezicht geld uitgeeft of handelt, en hoe weet je dat een wijziging het beter maakte in plaats van anders?",
      "Mijn eigen cv, projectbeschrijvingen en blogposts zijn daar een goed proefterrein voor: klein genoeg om in een systeemprompt te passen, precies genoeg om elke bewering na te lopen, en met één actie — een bericht aan mij opstellen — die echt iets doet en dus echt fout kan gaan.",
    ],
  },
  design: {
    title: "De opzet",
    body: [
      "De keten is bewust dun. Een kleine React-app praat over server-sent events met FastAPI; FastAPI geeft de beurt door aan een LangGraph-agent; de agent raakt precies één keer per stap een model aan via een OpenAI-compatibele client; en alles wat er gebeurt, wordt in Postgres vastgelegd. Er zit geen framework-magie tussen: routering, toolexecutie en verificatie zijn gewone Python.",
      "De modelprovider is een configuratieschakelaar. Dezelfde client praat met Gemini, OpenAI, DeepSeek of Kimi; één variabele in .env bepaalt welke. Dat is geen luxe maar risicobeheersing: de kennisbank en de guards zijn van mij, het model is inwisselbaar.",
    ],
    partsTitle: "Drie lagen, elk apart testbaar",
    parts: [
      {
        title: "Browser en API",
        body: "De client stuurt per gesprek een thread_id en de volledige historie mee, en leest een stroom SSE-events terug: tekst, citaties, toolmeta, trace, goedkeuringsstatus, klaar. FastAPI valideert elke payload met pydantic, beperkt tot 20 verzoeken per 10 minuten per IP-adres, en biedt een feedback-endpoint en een admin-endpoint voor goedkeuringen dat uit staat zolang er geen bearer token is geconfigureerd.",
      },
      {
        title: "Agent en providerlaag",
        body: "De graph guard → generate → tools → verify, met drie tools (zoeken in de kennisbank, beschikbaarheid melden, contactbericht opstellen) en een BudgetTracker met een dagplafond in dollars. De providerlaag zet systeemprompt en kennisbank als stabiel prefix in elke aanroep, parseert de SSE-stroom van het model, en probeert alleen opnieuw zolang er nog niets naar de bezoeker is gestuurd.",
      },
      {
        title: "Postgres als geheugen en logboek",
        body: "Checkpoints per thread, de goedkeuringswachtrij, een beurtenlog met kosten en latency, een budgetgrootboek, incidenten van de guards, feedback en onbeantwoorde vragen, en de kennisbank als chunks met embeddings in pgvector. Zonder DATABASE_URL draait alles in geheugen — handig voor tests, en niets overleeft dan een herstart.",
      },
    ],
  },
  graph: {
    title: "De agent-graph: één beurt, van vraag tot antwoord",
    body: [
      "Eén chatbeurt is een kleine toestandsmachine. Van de zes nodes praat er precies één met een model; de andere vijf zijn deterministische Python en dus gewoon te testen met een nep-model. Dat is de ontwerpkeuze waar de rest van het project uit volgt.",
    ],
    figure: diagram(
      "digital-twin-2-agent-graph",
      "De agent-graph als stroomschema: START → guard_input (dagbudget bereikt? prompt-injectie? kaart- of rekeningnummer? duidelijk off-topic?). Bij een afgegane guard → refuse (beleefde weigering zonder één token uit te geven) → END. Anders → generate, de enige node die een model aanroept; die streamt tekst, verzamelt citaties en telt tokens en kosten op. Een gewone tool gaat naar execute_tools (deterministische Python met timeout), een hoog-risico tool naar request_approval (interrupt: de graph pauzeert en wordt gecheckpoint, de bezoeker krijgt een melding) en pas na het besluit van Ruud naar execute_tools. Toolresultaten gaan terug naar generate, maximaal drie rondes. Zonder tools → verify (kosten bij het budget, lang antwoord zonder citatie wordt gemarkeerd, trace naar de client) → END.",
      "Eén node praat met een model; routering, guards, toolexecutie en verificatie zijn gewone Python.",
    ),
    nodesTitle: "Wat elke node doet",
    nodes: [
      {
        code: "guard_input",
        title: "Screenen vóór er een token is uitgegeven",
        body: "Is het dagbudget bereikt? Staan er prompt-injectie-markers in de invoer? Een kaart- of rekeningnummer? Een verzoek dat overduidelijk off-topic is (“schrijf een script voor me”)? Elk van die controles is een paar regels Python zonder model, kost niets en kan niet crashen. De node reset ook de per-run state, zodat een vorige beurt nooit doorlekt.",
      },
      {
        code: "refuse",
        title: "Beleefd weigeren als volwaardige uitkomst",
        body: "Een afgegane guard eindigt in een nette omleiding — “dat staat niet in mijn kennisbank, vraag het Ruud direct” — en in een regel in guard_incidents. Het model is dan niet aangeroepen. Weigeren is geen foutpad maar een van de geteste antwoorden.",
      },
      {
        code: "generate",
        title: "De enige node die een model aanroept",
        body: "Krijgt systeemprompt plus de volledige kennisbank als stabiel prefix, streamt tekst naar de bezoeker terwijl het binnenkomt, verzamelt citaties uit het antwoord en telt tokens en kosten op — echte getallen uit het gebruiksrapport van de provider, inclusief cachehits.",
      },
      {
        code: "execute_tools",
        title: "Deterministische uitvoering met timeout",
        body: "Drie tools, elk met een strikt JSON-schema en een timeout. Argumenten worden altijd geparsed, nooit op tekst gematcht. Een tool die faalt geeft een nette foutmelding terug in plaats van de beurt te laten crashen. Een hoog-risico tool zonder goedkeuring wordt hier geweigerd, niet uitgevoerd.",
      },
      {
        code: "request_approval",
        title: "Pauzeren tot een mens heeft gekeken",
        body: "Grijpt het model naar draft_contact_message, dan roept de graph interrupt() aan: de state wordt gecheckpoint, het verzoek gaat in pending_approvals, en de bezoeker hoort dat het op beoordeling wacht. De thread blijft staan tot ik een besluit heb genomen.",
      },
      {
        code: "verify",
        title: "Nacontrole en boekhouding",
        body: "Boekt de kosten van de beurt bij het dagbudget, markeert een lang en stellig antwoord zonder één citatie als hallucinatierisico, en stuurt de trace — de latency per node — als diagnostisch event mee naar de browser.",
      },
    ],
    after: [
      "Toolresultaten gaan terug naar generate, maar niet eindeloos. Na drie toolrondes wordt tool_choice op “none” gezet, zodat het model in tekst móét antwoorden — ook als het blijft aandringen. Elke node schrijft daarbij zijn eigen latency in de trace, dus als een beurt traag is, is te zien waar.",
    ],
    loop: "Het model is het enige onderdeel dat kan improviseren. Alles ervoor en erna is deterministische Python — en faalt dicht: bij twijfel geen antwoord in plaats van een gokje.",
  },
  approval: {
    title: "Niets onomkeerbaars zonder mens",
    body: [
      "Van de drie tools handelt er één namens mij: een contactbericht opstellen. Die is gemarkeerd als hoog risico, en dat label is geen instructie in de prompt maar een eigenschap van de tool die de graph afdwingt. Het pad hieronder is de reden dat LangGraph in dit project zit — een interrupt die de state duurzaam wegschrijft en later, in een ander proces, weer oppakt, wil je niet zelf bouwen.",
    ],
    figure: diagram(
      "digital-twin-3-goedkeuringsflow",
      "Sequentiediagram van de goedkeuringsflow. Bezoeker → browser: “Kun je dit doorgeven aan Ruud?”. Browser → FastAPI: POST /api/chat met thread_id. FastAPI → agent: astream. guard_input: geen guard afgegaan. generate → model, dat een tool call draft_contact_message teruggeeft. Notitie: hoog-risico tool, nooit zonder goedkeuring. request_approval roept interrupt() aan, de thread wordt gecheckpoint in Postgres en in pending_approvals gezet. FastAPI stuurt SSE “voorgelegd ter goedkeuring” plus approval pending en done; de browser toont een melding. Later — de thread blijft gepauzeerd staan. Ruud → FastAPI: POST /api/admin/approvals/{thread}/decision met bearer token. FastAPI → agent: Command(resume = approved). De agent laadt het checkpoint, execute_tools wordt nu wél uitgevoerd, generate maakt het antwoord af, contact_messages en turn_log worden geschreven, en Ruud krijgt 200 — besluit verwerkt.",
      "De bezoeker krijgt meteen antwoord; de actie zelf wacht op mijn besluit, ook als dat pas dagen later komt.",
    ),
    stepsTitle: "Wat er precies gebeurt",
    steps: [
      "Het model vraagt om draft_contact_message. De graph ziet het risicolabel en gaat naar request_approval in plaats van execute_tools.",
      "interrupt() pauzeert de graph. De volledige state wordt als checkpoint in Postgres gezet en het verzoek komt in pending_approvals.",
      "De bezoeker krijgt via SSE te horen dat het bericht ter goedkeuring is voorgelegd — de beurt eindigt netjes, zonder dat er iets is verstuurd.",
      "Ik keur goed of af via het admin-endpoint, met bearer token. Een Command(resume) laadt het checkpoint en laat de graph verdergaan waar hij stond.",
      "Pas nu draait execute_tools. generate maakt het antwoord af, contact_messages en turn_log worden geschreven.",
    ],
    stepsNote: "Zonder bearer token staat het admin-endpoint uit. Dan kan er niets goedgekeurd worden — en dus ook niets verstuurd.",
    quote: "De vraag bij een agent is niet “kan hij dit?”, maar “wat gebeurt er als hij het niet had moeten doen?”",
  },
  layers: {
    title: "Wat er om het model heen staat",
    body: [
      "Op elke laag geldt dezelfde regel: bij twijfel geen antwoord in plaats van een gokje. Drie lagen zitten vóór het model en kosten geen enkele token. Twee zitten erna en kijken naar wat het model heeft gezegd — zonder het model te vragen of het klopte.",
      "Citaties zijn native aan het antwoord: het model noemt bij elke bewering het document waar die uit komt. Het deel dat ertoe doet zit daarna. Een citatie wordt alleen doorgegeven als de genoemde titel echt in de kennisbank staat; anders wordt ze stil weggelaten en gemarkeerd. En een lang, stellig antwoord zonder één citatie en zonder toolresultaat wordt gelogd voor handmatige review. Het model bepaalt niet zelf of het onderbouwd was.",
    ],
    callouts: [
      { value: "0", label: "tokens uitgegeven voordat transport, budget en input-guards zijn gepasseerd" },
      { value: "20", label: "verzoeken per 10 minuten per IP-adres; maximaal 40 beurten per gesprek" },
      { value: "3", label: "toolrondes per beurt; daarna moet het model in tekst antwoorden" },
    ],
    figure: diagram(
      "digital-twin-4-lagen-om-het-model",
      "Vijf lagen om het model, van links naar rechts: 1 transport (20 verzoeken per 10 minuten per IP, pydantic-validatie op rol, lengte, maximaal 40 beurten, laatste beurt van de bezoeker), 2 budget (dagplafond in dollars, bereikt is beleefde weigering vóór er een token wordt uitgegeven, overleeft een herstart), 3 input guards (prompt-injectie, kaart- en rekeningnummers, off-topic; plain Python, geen model dat over zichzelf oordeelt), het model (system prompt plus volledige kennisbank in vaste volgorde; het enige onderdeel dat kan improviseren), 4 citatiecontrole (alleen doorgeven als de titel echt in de kennisbank staat, anders stil laten vallen en markeren) en 5 groundedness (lang, stellig antwoord zonder citatie en zonder toolresultaat wordt gemarkeerd voor handmatige review). Daaronder het toolcontract, wat per beurt wordt vastgelegd, en de evals met drempels 95% en 90% en failure injection.",
      "Drie lagen vóór het model kosten geen token; twee lagen erna controleren zonder het model te vragen.",
    ),
    layersTitle: "Vijf lagen, van buiten naar binnen",
    layers: [
      {
        title: "Transport",
        body: "Rate limiting per IP-adres en pydantic-validatie op elke payload: rol, lengte, maximaal 40 beurten, en de laatste beurt moet van de bezoeker zijn. Een publiek endpoint dat een LLM aanroept is anders een open portemonnee.",
      },
      {
        title: "Budget",
        body: "Een dagplafond in dollars. Is het bereikt, dan weigert de agent beleefd tot middernacht — vóórdat er één token is uitgegeven. Het grootboek staat in Postgres, dus een herstart zet de meter niet op nul.",
      },
      {
        title: "Input guards",
        body: "Prompt-injectie, kaart- en rekeningnummers, duidelijk off-topic verzoeken. Plain Python — geen model dat over zichzelf oordeelt, en dus ook geen model dat omgepraat kan worden.",
      },
      {
        title: "Citatiecontrole",
        body: "Elke citatie in het antwoord wordt vergeleken met de titels in de kennisbank. Wat niet bestaat, bereikt de bezoeker niet en wordt gemarkeerd. Een verzonnen bron is daarmee een meetbare gebeurtenis, geen verrassing.",
      },
      {
        title: "Groundedness",
        body: "Een lang, feitelijk klinkend antwoord zonder enige citatie en zonder toolresultaat is verdacht. Het wordt gemarkeerd als hallucinatierisico en gelogd, zodat ik het kan nalopen en, als het structureel is, in de evaluatieset kan opnemen.",
      },
    ],
    contractTitle: "Het toolcontract",
    contract: [
      "Strikt JSON-schema per tool: elke property verplicht, geen extra velden.",
      "Argumenten worden altijd geparsed, nooit op tekst gematcht.",
      "Elke tool heeft een timeout; een tool die faalt geeft een nette foutmelding terug in plaats van de beurt te laten crashen.",
      "draft_contact_message is hoog risico en draait nooit zonder expliciete goedkeuring.",
    ],
    contractNote: "Per beurt wordt vastgelegd: uitkomst, tokens, kosten en latency in turn_log, plus guard_incidents, unanswered_questions, budget_ledger en de feedback van bezoekers.",
  },
  data: {
    title: "Kennisbank en dataplatform",
    intro: "De kennisbank is klein en bewust zo gehouden: cv, projecten, vaardigheden en een over-mij, als Python-modules in knowledge/. Bij het opstarten worden ze in vaste volgorde als markdown in de systeemprompt geladen — een stabiele prefix, waardoor vervolgbeurten grotendeels uit gecachete tokens bestaan.",
    body: [
      "Diezelfde documenten worden per kop opgedeeld, gehasht en geëmbed in pgvector. De synchronisatie is incrementeel: alleen alinea's waarvan de hash veranderde, worden opnieuw geëmbed. De zoektool rangschikt op cosinusafstand, zodat een vraag die anders is geformuleerd dan het document toch het juiste stuk vindt.",
      "Alles wat de agent doet, staat in Postgres — met alembic-migraties, zodat het schema net zo in git staat als de code. Zonder DATABASE_URL draait het geheel in geheugen; dan overleeft niets een herstart, en dat is precies het verschil tussen een test en productie.",
    ],
    caption: "Tabellen in Postgres",
    rows: [
      ["checkpoints", "LangGraph-state per thread — de pauze bij een goedkeuring overleeft een herstart"],
      ["pending_approvals", "wachtrij van hoog-risico acties, met besluit en tijdstip"],
      ["turn_log", "elke beurt met uitkomst, model, tokens, cachehits, kosten en latency"],
      ["budget_ledger", "dagplafond dat een herstart overleeft"],
      ["guard_incidents", "welke guard wanneer afging, en waarop"],
      ["feedback · unanswered_questions", "duim omhoog of omlaag per antwoord, en vragen waar de kennisbank geen antwoord op had"],
      ["contact_messages", "goedgekeurde berichten aan mij"],
      ["knowledge_chunks", "kennisbank per kop, met hash en embedding, incrementeel bijgewerkt"],
      ["eval_runs · eval_cases", "elke evaluatierun bewaard, zodat kwaliteit over tijd te volgen is"],
    ],
    note: "De onbeantwoorde vragen zijn de nuttigste tabel van allemaal: daar staat wat bezoekers wilden weten en wat er dus in de kennisbank ontbreekt.",
  },
  evaluation: {
    title: "Kwaliteit wordt gemeten, niet gehoopt",
    intro: "“Werkt het?” is bij een agent een vage vraag. Die is vervangen door twee gelabelde datasets die tegen de echte graph draaien, met een drempel waaronder de run faalt.",
    columns: ["Wat", "Grens", "Betekenis"],
    rows: [
      ["Toolselectie", "12 cases · ≥ 95%", "pakt de agent de juiste tool — en nooit een risicovolle die hij niet mag pakken"],
      ["Taakvoltooiing", "11 cases · ≥ 90%", "bevat het antwoord wat het moet bevatten, citeert het wanneer het moet, weigert het wanneer het moet"],
      ["Failure injection", "elk 2e verzoek", "elk tweede HTTP-verzoek wordt gedropt; de retries van de client moeten dat opvangen, anders zakt de run"],
      ["Unit en integratie", "58 tests", "guards, budget, toolcontract, graph-routering en de SSE-stroom, met een nep-model"],
      ["Lint", "ruff, elke push", "CI draait bij elke push via GitHub Actions"],
      ["Historie", "eval_runs", "elke run wordt bewaard, zodat een wijziging vergeleken kan worden met de vorige"],
    ],
    body: [
      "De taakvoltooiingscases bevatten bewust vragen waarop het juiste antwoord een weigering is. Weigeren wordt dus net zo grondig gemeten als antwoorden — anders wordt de agent op den duur beloond voor het verzinnen van een bron.",
      "De failure-injection-modus is er omdat een streaming-endpoint op twee manieren kan falen: vóórdat er iets is verstuurd, en middenin. De providerlaag probeert alleen opnieuw in het eerste geval; in het tweede geval krijgt de bezoeker een nette afbreking in plaats van een half antwoord dat twee keer begint.",
    ],
  },
  limits: {
    title: "Wat de controles wél en niet garanderen",
    intro: "Een guard die er indrukwekkend uitziet maar meer belooft dan hij waarmaakt, is gevaarlijker dan geen guard. Daarom staat precies opgeschreven wat elke laag doet.",
    items: [
      {
        title: "De citatiecontrole checkt het bestaan, niet de inhoud",
        body: "Een citatie komt alleen door als de genoemde titel echt in de kennisbank staat. Of de bewering ook in dat document staat, controleert de laag niet. Dat vangt verzonnen bronnen, niet verkeerd toegeschreven beweringen; daarvoor zijn de taakvoltooiingscases er.",
      },
      {
        title: "Groundedness markeert, blokkeert niet",
        body: "Een lang antwoord zonder citatie wordt gelogd voor handmatige review, niet tegengehouden. Een hard blok zou te veel goede antwoorden raken — “nee, daar weet ik niets over” heeft ook geen citatie. De keuze is bewust: meten eerst, blokkeren pas als de data laat zien dat het nodig is.",
      },
      {
        title: "De input guards zijn patronen, geen classifier",
        body: "Prompt-injectie en off-topic worden op patronen gescreend. Dat is snel, deterministisch en kan niet omgepraat worden, maar het is geen volledige verdediging. De echte verdediging is dat het model niets onomkeerbaars kán doen: de enige tool die handelt, wacht op mij.",
      },
      {
        title: "In geheugen is geen productie",
        body: "Zonder DATABASE_URL werkt alles, maar overleeft niets een herstart — ook het budget en de goedkeuringswachtrij niet. Dat is expres zo gehouden voor tests en lokale runs; in productie is Postgres geen optie maar een vereiste.",
      },
    ],
  },
  choices: {
    title: "Ontwerpkeuzes",
    intro: "Een paar afwegingen waar ik het langst over heb nagedacht.",
    items: [
      {
        title: "Guards zonder model",
        body: "Het is verleidelijk om het model te vragen of een invoer veilig is. Maar een model dat over zichzelf oordeelt, kan met dezelfde truc omgepraat worden als het model dat antwoordt. Deterministische Python is saaier, kost geen tokens, kan niet crashen en is gewoon te unit-testen.",
      },
      {
        title: "Kennisbank in de prompt én in pgvector",
        body: "De volledige kennisbank past in de systeemprompt, en dankzij prompt caching is dat goedkoop: de prefix is stabiel. De pgvector-zoektool is er voor gerichte vragen — hij vindt het juiste stuk ook als de bezoeker het anders formuleert dan ik het opschreef. Geen van beide alleen was genoeg.",
      },
      {
        title: "Provider als configuratie, retries alleen vóór het streamen",
        body: "Eén OpenAI-compatibele client over httpx voor Gemini, OpenAI, DeepSeek en Kimi. De retry-met-backoff geldt alleen zolang er nog niets naar de bezoeker is gestuurd; een afgebroken stream wordt nooit stilletjes opnieuw gestart. Een goedkope standaardprovider plus caching houdt een dag gesprekken onder een paar dollar — en het plafond garandeert dat.",
      },
      {
        title: "LangGraph voor de interrupt, niet voor de chat",
        body: "Voor een gewone chatbeurt is LangGraph overkill. Het is er voor één ding: interrupt() met een checkpointer in Postgres, zodat een gepauzeerde thread dagen later in een ander proces kan worden hervat. Dat zelf bouwen is precies het soort code dat subtiel fout gaat.",
      },
    ],
  },
  shows: {
    title: "Wat dit project laat zien",
    skills: [
      "LLM-agent in productie: LangGraph, streaming, tools",
      "Deterministische guards en fail-closed ontwerp",
      "Human-in-the-loop met duurzame interrupts",
      "Kostenbeheersing: budget, caching, telemetrie per beurt",
      "Postgres + pgvector als geheugen en logboek",
      "Evaluatiesets met drempels en failure injection",
      "FastAPI, SSE en een React-client",
      "CI met tests en lint bij elke push",
    ],
    closing: "Elke organisatie die een assistent op haar eigen kennis wil, loopt tegen dezelfde vragen aan — niet “welk model”, maar hoe je onderbouwing, kosten en handelingen onder controle houdt. Deterministische guards, een budget dat fail closed is, menselijke goedkeuring op het risicovolle pad en evaluaties die de pipeline bewaken zijn één op één overdraagbaar.",
  },
};

const en: PageContent = {
  eyebrow: "Own project",
  title: "Digital twin: an AI agent that answers for me — with sources",
  lead: "A LangGraph agent over my CV, projects and writing that answers visitors' questions in a streaming chat. Every claim cited, refusal when there is no source, a hard daily budget, and human approval before it acts on my behalf.",
  intro: [
    "Everyone knows the demo: a chatbot over “your documents” that answers convincingly in a slick interface. That takes an afternoon. What the demo doesn't show is what happens on day three — when a visitor types “ignore your instructions”, when someone has it write their Python homework on your API budget, or when it confidently invents a job you never had.",
    "This project was built to close that gap. The chat was the easy part. The interesting part is everything around the model that makes it safe to leave running unattended: guards that need no model, a cost cap that fails closed, an approval step on the one path that acts on my behalf, and evaluations that guard every change.",
  ],
  facts: [
    "Python · FastAPI",
    "LangGraph",
    "Postgres + pgvector",
    "React + Vite",
    "Server-sent events",
    "Gemini / OpenAI / DeepSeek / Kimi",
    "58 tests, ruff clean",
  ],
  stats: [
    { label: "Guards", value: "Fail closed, no model" },
    { label: "Eval gate", value: "95% tools · 90% tasks" },
    { label: "Risky actions", value: "Human approval" },
    { label: "Daily budget", value: "Hard cap, survives restarts" },
  ],
  ui: {
    repo: "View the code on GitHub",
    live: "Try the assistant live",
    allProjects: "All projects",
    back: "Back to projects",
    article: "Background article on the blog: “A digital twin that only says what it can prove” (in Dutch).",
    scope: "The assistant speaks about me, never for me: anything that reaches my inbox passes through my approval first.",
  },
  hero: diagram(
    "digital-twin-1-architectuur",
    "System architecture of digital-twin in five columns (labels in Dutch): browser (React + Vite, SSE events, a thread_id per conversation), FastAPI (POST /api/chat rate limited to 20 per 10 minutes per IP, POST /api/feedback, /api/admin/approvals with bearer token, pydantic validation), agent (LangGraph graph guard → generate → tools → verify, guards, tools, BudgetTracker, checkpoint per thread), provider layer (system prompt + knowledge base as a stable prefix, chat-completions client with retry, cost per turn) and models (Gemini, OpenAI, DeepSeek, Kimi; one .env variable switches). Below: Ruud as admin, the knowledge base, and Postgres + pgvector with the tables checkpoints, pending_approvals, turn_log, budget_ledger, guard_incidents, feedback, contact_messages, knowledge_chunks and eval_runs.",
    "One turn runs from the browser through FastAPI to the agent and the model; everything the agent does lands in Postgres.",
  ),
  why: {
    title: "Why this project",
    body: [
      "I wanted to know where the line runs between an agent that demonstrates and an agent you would dare to leave alone for a weekend. That line isn't at the prompt and isn't at the model. It's at the questions every organisation meets as soon as an assistant over its own knowledge goes public: how do you guarantee that answers are grounded, how do you stop it spending money or acting without oversight, and how do you know a change made it better rather than just different?",
      "My own CV, project write-ups and blog posts make a good proving ground: small enough to fit in a system prompt, precise enough to check every claim, and with one action — drafting a message to me — that actually does something and can therefore actually go wrong.",
    ],
  },
  design: {
    title: "The design",
    body: [
      "The chain is deliberately thin. A small React app talks to FastAPI over server-sent events; FastAPI hands the turn to a LangGraph agent; the agent touches a model exactly once per step through an OpenAI-compatible client; and everything that happens is recorded in Postgres. There is no framework magic in between: routing, tool execution and verification are plain Python.",
      "The model provider is a configuration switch. The same client talks to Gemini, OpenAI, DeepSeek or Kimi; one variable in .env decides which. That isn't a luxury but risk control: the knowledge base and the guards are mine, the model is replaceable.",
    ],
    partsTitle: "Three layers, each testable on its own",
    parts: [
      {
        title: "Browser and API",
        body: "The client sends a thread_id and the full history with every conversation, and reads back a stream of SSE events: text, citations, tool metadata, trace, approval status, done. FastAPI validates every payload with pydantic, limits to 20 requests per 10 minutes per IP address, and offers a feedback endpoint and an admin endpoint for approvals that stays off as long as no bearer token is configured.",
      },
      {
        title: "Agent and provider layer",
        body: "The graph guard → generate → tools → verify, with three tools (search the knowledge base, report availability, draft a contact message) and a BudgetTracker with a daily cap in dollars. The provider layer puts system prompt and knowledge base into every call as a stable prefix, parses the model's SSE stream, and only retries as long as nothing has been sent to the visitor yet.",
      },
      {
        title: "Postgres as memory and log",
        body: "Checkpoints per thread, the approval queue, a turn log with cost and latency, a budget ledger, guard incidents, feedback and unanswered questions, and the knowledge base as chunks with embeddings in pgvector. Without DATABASE_URL everything runs in memory — handy for tests, and nothing then survives a restart.",
      },
    ],
  },
  graph: {
    title: "The agent graph: one turn, from question to answer",
    body: [
      "One chat turn is a small state machine. Of its six nodes exactly one talks to a model; the other five are deterministic Python and can simply be tested with a fake model. That is the design choice the rest of the project follows from.",
    ],
    figure: diagram(
      "digital-twin-2-agent-graph",
      "The agent graph as a flowchart (labels in Dutch): START → guard_input (daily budget reached? prompt injection? card or account number? clearly off-topic?). If a guard fires → refuse (polite refusal without spending a single token) → END. Otherwise → generate, the only node that calls a model; it streams text, collects citations and adds up tokens and cost. A regular tool goes to execute_tools (deterministic Python with a timeout), a high-risk tool goes to request_approval (interrupt: the graph pauses and is checkpointed, the visitor is notified) and only after Ruud's decision to execute_tools. Tool results go back to generate, at most three rounds. No tools → verify (cost booked to the budget, a long answer without citation is flagged, trace to the client) → END.",
      "One node talks to a model; routing, guards, tool execution and verification are plain Python.",
    ),
    nodesTitle: "What each node does",
    nodes: [
      {
        code: "guard_input",
        title: "Screen before a single token is spent",
        body: "Is the daily budget reached? Are there prompt-injection markers in the input? A card or account number? A request that is clearly off-topic (“write me a script”)? Each check is a few lines of Python without a model, costs nothing and can't crash. The node also resets the per-run state, so a previous turn never leaks through.",
      },
      {
        code: "refuse",
        title: "Polite refusal as a first-class outcome",
        body: "A fired guard ends in a tidy redirect — “that's not in my knowledge base, ask Ruud directly” — and in a row in guard_incidents. The model was not called. Refusing isn't an error path but one of the tested answers.",
      },
      {
        code: "generate",
        title: "The only node that calls a model",
        body: "Receives the system prompt plus the full knowledge base as a stable prefix, streams text to the visitor as it arrives, collects citations from the answer and adds up tokens and cost — real numbers from the provider's usage report, cache hits included.",
      },
      {
        code: "execute_tools",
        title: "Deterministic execution with a timeout",
        body: "Three tools, each with a strict JSON schema and a timeout. Arguments are always parsed, never matched on text. A tool that fails returns a clean error instead of crashing the turn. A high-risk tool without approval is refused here, not executed.",
      },
      {
        code: "request_approval",
        title: "Pause until a human has looked",
        body: "If the model reaches for draft_contact_message, the graph calls interrupt(): the state is checkpointed, the request goes into pending_approvals, and the visitor is told it's waiting for review. The thread stays put until I've made a decision.",
      },
      {
        code: "verify",
        title: "Post-check and bookkeeping",
        body: "Books the turn's cost against the daily budget, flags a long and assertive answer without a single citation as a hallucination risk, and sends the trace — the latency per node — to the browser as a diagnostic event.",
      },
    ],
    after: [
      "Tool results go back to generate, but not forever. After three tool rounds, tool_choice is set to “none”, so the model has to answer in text — even if it keeps insisting. Every node writes its own latency into the trace, so when a turn is slow, you can see where.",
    ],
    loop: "The model is the only component that can improvise. Everything before and after it is deterministic Python — and fails closed: when in doubt, no answer instead of a guess.",
  },
  approval: {
    title: "Nothing irreversible without a human",
    body: [
      "Of the three tools, one acts on my behalf: drafting a contact message. It is marked high-risk, and that label isn't an instruction in the prompt but a property of the tool that the graph enforces. The path below is the reason LangGraph is in this project — an interrupt that durably persists the state and later picks it up again, in another process, is not something you want to build yourself.",
    ],
    figure: diagram(
      "digital-twin-3-goedkeuringsflow",
      "Sequence diagram of the approval flow (labels in Dutch). Visitor → browser: “Can you pass this on to Ruud?”. Browser → FastAPI: POST /api/chat with thread_id. FastAPI → agent: astream. guard_input: no guard fired. generate → model, which returns a tool call draft_contact_message. Note: high-risk tool, never without approval. request_approval calls interrupt(), the thread is checkpointed in Postgres and put into pending_approvals. FastAPI sends SSE “submitted for approval” plus approval pending and done; the browser shows a notice. Later — the thread stays paused. Ruud → FastAPI: POST /api/admin/approvals/{thread}/decision with bearer token. FastAPI → agent: Command(resume = approved). The agent loads the checkpoint, execute_tools now runs, generate finishes the answer, contact_messages and turn_log are written, and Ruud gets 200 — decision processed.",
      "The visitor gets an answer right away; the action itself waits for my decision, even if that comes days later.",
    ),
    stepsTitle: "What exactly happens",
    steps: [
      "The model asks for draft_contact_message. The graph sees the risk label and goes to request_approval instead of execute_tools.",
      "interrupt() pauses the graph. The full state is checkpointed in Postgres and the request lands in pending_approvals.",
      "The visitor is told over SSE that the message has been submitted for approval — the turn ends cleanly, without anything being sent.",
      "I approve or reject through the admin endpoint, with a bearer token. A Command(resume) loads the checkpoint and lets the graph continue where it stood.",
      "Only now does execute_tools run. generate finishes the answer, contact_messages and turn_log are written.",
    ],
    stepsNote: "Without a bearer token the admin endpoint is off. Then nothing can be approved — and therefore nothing sent.",
    quote: "The question with an agent isn't “can it do this?”, but “what happens when it shouldn't have?”",
  },
  layers: {
    title: "What stands around the model",
    body: [
      "The same rule applies on every layer: when in doubt, no answer instead of a guess. Three layers sit before the model and cost no tokens at all. Two sit after it and look at what the model said — without asking the model whether it was right.",
      "Citations are native to the answer: for every claim the model names the document it came from. The part that matters comes after. A citation is only passed on if the named title really exists in the knowledge base; otherwise it is silently dropped and flagged. And a long, assertive answer without a single citation and without a tool result is logged for manual review. The model doesn't get to decide whether it was grounded.",
    ],
    callouts: [
      { value: "0", label: "tokens spent before transport, budget and input guards have been passed" },
      { value: "20", label: "requests per 10 minutes per IP address; at most 40 turns per conversation" },
      { value: "3", label: "tool rounds per turn; after that the model has to answer in text" },
    ],
    figure: diagram(
      "digital-twin-4-lagen-om-het-model",
      "Five layers around the model, left to right (labels in Dutch): 1 transport (20 requests per 10 minutes per IP, pydantic validation on role, length, at most 40 turns, last turn from the visitor), 2 budget (daily cap in dollars, reached means polite refusal before a token is spent, survives a restart), 3 input guards (prompt injection, card and account numbers, off-topic; plain Python, no model judging itself), the model (system prompt plus full knowledge base in a fixed order; the only component that can improvise), 4 citation check (only pass on if the title really exists in the knowledge base, otherwise drop silently and flag) and 5 groundedness (a long, assertive answer without citation and without tool result is flagged for manual review). Below: the tool contract, what is recorded per turn, and the evals with thresholds 95% and 90% and failure injection.",
      "Three layers before the model cost no token; two layers after it check without asking the model.",
    ),
    layersTitle: "Five layers, outside in",
    layers: [
      {
        title: "Transport",
        body: "Rate limiting per IP address and pydantic validation on every payload: role, length, at most 40 turns, and the last turn must be the visitor's. A public endpoint that calls an LLM is otherwise an open wallet.",
      },
      {
        title: "Budget",
        body: "A daily cap in dollars. Once reached, the agent politely refuses until midnight — before a single token is spent. The ledger lives in Postgres, so a restart doesn't reset the meter.",
      },
      {
        title: "Input guards",
        body: "Prompt injection, card and account numbers, clearly off-topic requests. Plain Python — no model judging itself, and so no model that can be talked around.",
      },
      {
        title: "Citation check",
        body: "Every citation in the answer is compared with the titles in the knowledge base. What doesn't exist doesn't reach the visitor and is flagged. An invented source thereby becomes a measurable event, not a surprise.",
      },
      {
        title: "Groundedness",
        body: "A long, factual-sounding answer without any citation and without a tool result is suspect. It is flagged as a hallucination risk and logged, so I can check it and, if it's structural, add it to the evaluation set.",
      },
    ],
    contractTitle: "The tool contract",
    contract: [
      "Strict JSON schema per tool: every property required, no extra fields.",
      "Arguments are always parsed, never matched on text.",
      "Every tool has a timeout; a tool that fails returns a clean error instead of crashing the turn.",
      "draft_contact_message is high-risk and never runs without explicit approval.",
    ],
    contractNote: "Recorded per turn: outcome, tokens, cost and latency in turn_log, plus guard_incidents, unanswered_questions, budget_ledger and visitor feedback.",
  },
  data: {
    title: "Knowledge base and data platform",
    intro: "The knowledge base is small and deliberately kept that way: CV, projects, skills and an about-me, as Python modules in knowledge/. At startup they are loaded in a fixed order as markdown into the system prompt — a stable prefix, so follow-up turns consist largely of cached tokens.",
    body: [
      "The same documents are chunked by heading, hashed and embedded into pgvector. The sync is incremental: only paragraphs whose hash changed are re-embedded. The search tool ranks by cosine distance, so a question phrased differently from the document still finds the right passage.",
      "Everything the agent does lives in Postgres — with alembic migrations, so the schema is in git just like the code. Without DATABASE_URL the whole thing runs in memory; then nothing survives a restart, and that is exactly the difference between a test and production.",
    ],
    caption: "Tables in Postgres",
    rows: [
      ["checkpoints", "LangGraph state per thread — the pause at an approval survives a restart"],
      ["pending_approvals", "queue of high-risk actions, with decision and timestamp"],
      ["turn_log", "every turn with outcome, model, tokens, cache hits, cost and latency"],
      ["budget_ledger", "daily cap that survives a restart"],
      ["guard_incidents", "which guard fired when, and on what"],
      ["feedback · unanswered_questions", "thumbs up or down per answer, and questions the knowledge base had no answer to"],
      ["contact_messages", "approved messages to me"],
      ["knowledge_chunks", "knowledge base per heading, with hash and embedding, updated incrementally"],
      ["eval_runs · eval_cases", "every evaluation run kept, so quality can be followed over time"],
    ],
    note: "The unanswered questions are the most useful table of all: that's where you see what visitors wanted to know and therefore what the knowledge base is missing.",
  },
  evaluation: {
    title: "Quality is measured, not hoped for",
    intro: "“Does it work?” is a vague question for an agent. It has been replaced by two labelled datasets that run against the real graph, with a threshold below which the run fails.",
    columns: ["What", "Gate", "Meaning"],
    rows: [
      ["Tool selection", "12 cases · ≥ 95%", "does the agent reach for the right tool — and never a high-risk one it shouldn't"],
      ["Task completion", "11 cases · ≥ 90%", "does the answer contain what it must, cite when it must, refuse when it must"],
      ["Failure injection", "every 2nd request", "every other HTTP request is dropped; the client's retries must absorb it, or the run fails"],
      ["Unit and integration", "58 tests", "guards, budget, tool contract, graph routing and the SSE stream, with a fake model"],
      ["Lint", "ruff, every push", "CI runs on every push via GitHub Actions"],
      ["History", "eval_runs", "every run is kept, so a change can be compared with the previous one"],
    ],
    body: [
      "The task-completion cases deliberately include questions where the right answer is a refusal. Refusing is measured as thoroughly as answering — otherwise the agent is eventually rewarded for inventing a source.",
      "The failure-injection mode exists because a streaming endpoint can fail in two ways: before anything has been sent, and midway. The provider layer only retries in the first case; in the second, the visitor gets a clean abort instead of half an answer that starts twice.",
    ],
  },
  limits: {
    title: "What the checks do and don't guarantee",
    intro: "A guard that looks impressive but promises more than it delivers is more dangerous than no guard. So what each layer does is written down precisely.",
    items: [
      {
        title: "The citation check verifies existence, not content",
        body: "A citation only passes if the named title really exists in the knowledge base. Whether the claim is actually in that document, the layer doesn't check. That catches invented sources, not misattributed claims; the task-completion cases are there for those.",
      },
      {
        title: "Groundedness flags, it doesn't block",
        body: "A long answer without a citation is logged for manual review, not stopped. A hard block would hit too many good answers — “no, I don't know anything about that” has no citation either. The choice is deliberate: measure first, block only once the data shows it's needed.",
      },
      {
        title: "The input guards are patterns, not a classifier",
        body: "Prompt injection and off-topic requests are screened on patterns. That's fast, deterministic and can't be talked around, but it isn't a complete defence. The real defence is that the model can't do anything irreversible: the only tool that acts waits for me.",
      },
      {
        title: "In-memory is not production",
        body: "Without DATABASE_URL everything works, but nothing survives a restart — not the budget, not the approval queue. That's kept on purpose for tests and local runs; in production Postgres isn't an option but a requirement.",
      },
    ],
  },
  choices: {
    title: "Design choices",
    intro: "A few trade-offs I thought about the longest.",
    items: [
      {
        title: "Guards without a model",
        body: "It's tempting to ask the model whether an input is safe. But a model judging itself can be talked around with the same trick as the model that answers. Deterministic Python is duller, costs no tokens, can't crash and can simply be unit-tested.",
      },
      {
        title: "Knowledge base in the prompt and in pgvector",
        body: "The full knowledge base fits in the system prompt, and thanks to prompt caching that's cheap: the prefix is stable. The pgvector search tool is for targeted questions — it finds the right passage even when the visitor phrases it differently from how I wrote it. Neither alone was enough.",
      },
      {
        title: "Provider as configuration, retries only before streaming",
        body: "One OpenAI-compatible client over httpx for Gemini, OpenAI, DeepSeek and Kimi. Retry with backoff only applies as long as nothing has been sent to the visitor; an aborted stream is never silently restarted. A cheap default provider plus caching keeps a day of conversations under a couple of dollars — and the cap makes sure of it.",
      },
      {
        title: "LangGraph for the interrupt, not for the chat",
        body: "For an ordinary chat turn LangGraph is overkill. It's there for one thing: interrupt() with a checkpointer in Postgres, so a paused thread can be resumed days later in another process. Building that yourself is exactly the kind of code that goes subtly wrong.",
      },
    ],
  },
  shows: {
    title: "What this project shows",
    skills: [
      "LLM agent in production: LangGraph, streaming, tools",
      "Deterministic guards and fail-closed design",
      "Human-in-the-loop with durable interrupts",
      "Cost control: budget, caching, per-turn telemetry",
      "Postgres + pgvector as memory and log",
      "Evaluation sets with thresholds and failure injection",
      "FastAPI, SSE and a React client",
      "CI with tests and lint on every push",
    ],
    closing: "Every organisation that wants an assistant over its own knowledge runs into the same questions — not “which model”, but how to keep grounding, cost and actions under control. Deterministic guards, a budget that fails closed, human approval on the risky path and evaluations that guard the pipeline transfer one to one.",
  },
};

export const CONTENT: Record<Locale, PageContent> = { nl, en };
