import type { Locale } from "@/i18n/routing";
import type { Callout, Figure, TitledItem } from "@/components/ProjectPageKit";

// Copy for the bespoke strafrecht-rag page. The listing on /projects, the
// sitemap and llms-full.txt still read the project's MDX frontmatter and
// prose; this module only feeds the custom detail page.

export const SLUG = "strafrecht-rag";
export const ACCENT = "#8B5CF6";
export const REPO_URL = "https://github.com/datavakwerk/strafrecht-rag";
const IMG = "/images/projects/strafrecht-rag";

export interface PageContent {
  eyebrow: string;
  title: string;
  lead: string;
  intro: string[];
  facts: string[];
  stats: { label: string; value: string }[];
  ui: {
    repo: string;
    allProjects: string;
    back: string;
    dataSource: string;
    dataSourceName: string;
    disclaimer: string;
  };
  hero: Figure;
  why: { title: string; body: string[] };
  architecture: { title: string; body: string[]; figure: Figure; partsTitle: string; parts: TitledItem[] };
  rule: {
    title: string;
    body: string[];
    figure: Figure;
    stagesTitle: string;
    stages: TitledItem[];
    after: string[];
    screenshot: Figure;
    yield: string;
  };
  reranker: { title: string; body: string[]; callouts: Callout[]; screenshot: Figure };
  reference: { title: string; figure: Figure; body: string[]; detailsTitle: string; details: TitledItem[] };
  corpus: { title: string; intro: string; rows: string[][]; note: string };
  evaluation: {
    title: string;
    intro: string;
    screenshot: Figure;
    columns: string[];
    rows: string[][];
    body: string[];
  };
  choices: { title: string; intro: string; items: TitledItem[] };
  shows: { title: string; skills: string[]; closing: string };
}

const DIAGRAM_DIMS = {
  "rag-1-architectuur": { width: 1678, height: 1003 },
  "rag-2-geen-bron-geen-antwoord": { width: 1510, height: 918 },
  "rag-3-van-xml-naar-verwijzing": { width: 1510, height: 834 },
} as const;

const SHOT_DIMS = {
  ask: { width: 1210, height: 905 },
  "no-source": { width: 1210, height: 625 },
  filtered: { width: 1210, height: 935 },
  eval: { width: 1210, height: 845 },
} as const;

function diagram(name: keyof typeof DIAGRAM_DIMS, alt: string, caption: string): Figure {
  // The architecture diagram carries the most detail, so it is rendered by
  // draw.io's own viewer (zoom, pan, lightbox) from the .drawio source in
  // public/diagrams; the others stay a flat SVG that links to its full size.
  const drawioSrc = name.endsWith("-architectuur") ? `/diagrams/${name}.drawio` : undefined;
  return { kind: "diagram", src: `${IMG}/${name}.svg`, ...DIAGRAM_DIMS[name], alt, caption, drawioSrc };
}

function shot(name: keyof typeof SHOT_DIMS, alt: string, caption: string): Figure {
  return { kind: "screenshot", src: `${IMG}/${name}.png`, ...SHOT_DIMS[name], alt, caption };
}

const nl: PageContent = {
  eyebrow: "Eigen project",
  title: "Strafrecht-RAG: geen bron, geen antwoord",
  lead: "RAG over 1.906 Nederlandse strafrechtuitspraken, met één regel: geen bron, geen antwoord. Elke bewering eindigt in een ECLI, sectie en paragraaf — en die verwijzing wordt in code gecontroleerd, niet aan het model gevraagd.",
  intro: [
    "Een RAG-demo bouwen is een middag werk: documenten inlezen, embeddings maken, top-k ophalen, in een prompt plakken. Het probleem zit niet in de pipeline maar in wat er uit komt. Een taalmodel dat vier passages krijgt en gevraagd wordt om een antwoord met bronnen, produceert vrijwel altijd iets dat er correct uitziet. Een ECLI die net niet bestaat, een paragraafnummer dat nergens op slaat, een bewering die klopt maar niet in de aangeleverde tekst staat — je ziet het verschil niet zonder het na te lopen.",
    "In het strafrecht is dat verschil het hele punt. Dus is dit project omgedraaid: niet “hoe krijg ik het model zover dat het netjes citeert”, maar “wat kan ik na afloop hard controleren, en wat gooi ik weg als het niet klopt”. Een bewering zonder verwijzing haalt het antwoord niet. Een ECLI die niet in de opgehaalde passages voorkomt haalt het antwoord niet. En als de beste passage onder de relevantiedrempel blijft, wordt het model helemaal niet aangeroepen.",
  ],
  facts: [
    "Python 3.12",
    "SQLite + NumPy",
    "FTS5 / BM25",
    "fastembed (ONNX)",
    "Cross-encoder reranking",
    "Ollama / Claude / extractief",
    "93 tests, ruff schoon",
  ],
  stats: [
    { label: "Bronjuistheid", value: "100%, per constructie" },
    { label: "Claimacceptatie", value: "89%" },
    { label: "recall@6", value: "93%" },
    { label: "Corpus", value: "1.906 uitspraken" },
  ],
  ui: {
    repo: "Bekijk de code op GitHub",
    allProjects: "Alle projecten",
    back: "Terug naar projecten",
    dataSource: "Databron",
    dataSourceName: "Rechtspraak.nl Open Data — alleen de gepubliceerde, geanonimiseerde tekst; er wordt niets verrijkt en niets gede-anonimiseerd.",
    disclaimer: "Geen juridisch advies. Dit is een zoek- en samenvattingshulpmiddel over gepubliceerde, geanonimiseerde uitspraken; controleer elke bron via de ECLI op rechtspraak.nl.",
  },
  hero: shot(
    "ask",
    "Terminaluitvoer van 'ask' voor de vraag 'Welke uitspraken gaan over verduistering door een bestuurder van een stichting?': de stappen laden, embedden, ophalen, herordenen, genereren en bronverificatie; een tabel met vier opgehaalde passages met relevantie, cosine, ECLI, instantie, datum en sectie; en een antwoord met twee beweringen die elk eindigen op een [n]-marker, gevolgd door de verwijzingen per marker en de regel '2 beweringen geverifieerd · elke ECLI komt uit de 4 aangeleverde passages'.",
    "Een antwoord zoals de CLI het toont: elke bewering eindigt op een marker, elke marker wijst naar een aangeleverde passage, en de verificatieregel onderaan zegt hoeveel beweringen zijn overgebleven.",
  ),
  why: {
    title: "Waarom dit project",
    body: [
      "Ik wilde weten waar de grens ligt tussen “een RAG-systeem dat demonstreert” en “een RAG-systeem waarvan je de uitvoer durft door te sturen”. Die grens ligt niet bij het ophaalgedeelte — daar zijn de recepten bekend. Die ligt bij de vraag wat er gebeurt als het model iets zegt wat niet uit de bronnen komt.",
      "Rechtspraak.nl publiceert alle uitspraken als open data, geanonimiseerd, met een gestructureerde XML. Dat is een corpus waar de antwoorden objectief verifieerbaar zijn: een ECLI bestaat of bestaat niet, een paragraaf staat er of staat er niet. Precies het soort domein waar je een controlemechanisme kunt bouwen dat meer is dan een gevoel.",
    ],
  },
  architecture: {
    title: "Architectuur",
    body: [
      "Het systeem valt uiteen in twee helften die elkaar alleen via de index raken. De offline helft bouwt het corpus, de online helft beantwoordt één vraag, en daartussen zit één bestand.",
    ],
    figure: diagram(
      "rag-1-architectuur",
      "Architectuur van strafrecht-rag: een offline keten (Rechtspraak.nl Open Data → client → ruwe XML → parser → chunker → embedder) schrijft naar één SQLite + NumPy-index; een online keten (vraag → retriever → cross-encoder → drempel 0,35 → LLM → verify → antwoord) leest eruit. Onder de drempel wordt het taalmodel niet aangeroepen; afgekeurde beweringen worden getoond, niet verstopt.",
      "Offline indexering en online beantwoording raken elkaar alleen via de index.",
    ),
    partsTitle: "Drie delen, elk apart testbaar",
    parts: [
      {
        title: "De offline helft",
        body: "Draait één keer per corpus-uitbreiding. Een client bevraagt de Open Data zoekfeed op datum en rechtsgebied, pagineert en haalt per ECLI één XML op — rate limited, met backoff, herstartbaar. De parser maakt daar één Uitspraak van: instantie, datum, rechtsgebieden, procedures, zaaknummer, wetsverwijzingen, samenvatting en genummerde secties met genummerde paragrafen. De chunker knipt die in stukken die nooit een sectiegrens oversteken, en de embedder zet ze om in vectoren.",
      },
      {
        title: "De online helft",
        body: "Is één vraag lang. De retriever haalt kandidaten op, de cross-encoder herordent ze en geeft er een gekalibreerde score aan, de drempel bepaalt of het model überhaupt wordt aangeroepen, en de verificatie bepaalt wat er van het antwoord overblijft.",
      },
      {
        title: "Eén opslaglaag",
        body: "SQLite met de metadata en een FTS5-index, plus de vectoren als één float32-matrix in NumPy. Eén bestand, geen service.",
      },
    ],
  },
  rule: {
    title: "De ene regel: geen bron, geen antwoord",
    body: ["De regel wordt op drie plaatsen afgedwongen, en op geen van die plaatsen door de prompt."],
    figure: diagram(
      "rag-2-geen-bron-geen-antwoord",
      "De regel 'geen bron, geen antwoord' wordt op drie plaatsen afgedwongen: bij retrieval (onder de drempel wordt het model niet aangeroepen), bij generatie (genummerde passages, verplichte [n]-markers, GEEN_BRON toegestaan) en bij verificatie. Elke bewering doorloopt vier controles: staat er een marker, wijst die naar een aangeleverde passage, komen alle ECLI's uit de passages, is de bewering niet al eerder gezegd. Wat afvalt wordt met reden gerapporteerd.",
      "De verificatieketen per bewering, en de twee manieren om “geen bron” te zeggen.",
    ),
    stagesTitle: "Voor, tijdens en na generatie",
    stages: [
      {
        title: "Voor generatie",
        body: "Ligt de beste relevantiescore onder de drempel (0,35), dan wordt de LLM niet aangeroepen. “Geen bron” is daarmee een eigenschap van het ophalen, niet een beleefdheid van het model.",
      },
      {
        title: "Tijdens generatie",
        body: "Het model krijgt genummerde passages en de opdracht om per regel één bewering te geven die eindigt op een [n]-marker. Het mag ook GEEN_BRON antwoorden als het vindt dat de passages de vraag niet dekken.",
      },
      {
        title: "Na generatie",
        body: "Elke bewering gaat langs een keten van controles: staat er een marker? Wijst die naar een passage die daadwerkelijk is aangeleverd? Komt elke ECLI in de bewering voor in die passages? Is de bewering niet leeg en niet al eerder gezegd? Wat afvalt, valt af — met de reden erbij, zichtbaar in de uitvoer. Blijft er niets over, dan krijgt het model één herkansing met een formatherinnering.",
      },
    ],
    after: [
      "Dat laatste is het punt waar de meeste RAG-systemen stoppen bij een instructie in de systeemprompt. Een instructie is geen garantie. De testsuite bevat een nep-LLM die een ECLI verzint en een die de verwijzingen weglaat; beide worden afgekeurd. En de evaluatieset bevat vragen waarvan het antwoord móét zijn dat het corpus geen bron heeft — dat pad wordt dus gemeten, niet aangenomen.",
    ],
    screenshot: shot(
      "no-source",
      "Terminaluitvoer van 'ask' voor de vraag 'Wat zegt de rechter over de octrooiaanvraag voor een kernfusiereactor?': de stappen genereren en bronverificatie zijn overgeslagen, met de reden 'beste relevantie 0.27 < drempel 0.35'. Het antwoordblok zegt 'Geen bron gevonden', toont de beste relevantie als balk naast de drempel, en somt ter controle de drie dichtstbijzijnde passages op.",
      "Het geen-bron-pad: de beste passage blijft onder de drempel, het taalmodel wordt niet aangeroepen, en de uitvoer laat zien waarom — inclusief de dichtstbijzijnde passages om het zelf na te lopen.",
    ),
    yield: "De opbrengst staat in één getal: claimacceptatie 89%. Elf procent van wat het model produceerde week af van de passages en heeft de gebruiker nooit bereikt.",
  },
  reranker: {
    title: "Waarom er een cross-encoder in zit",
    body: [
      "Dit is de meting die het ontwerp bepaalde. Het voor de hand liggende recept is: cosine-similariteit, drempel eroverheen, onder de drempel zeg je “geen bron”. Dat werkt niet. De cosine van een bi-encoder is niet gekalibreerd — een vraag die volstrekt niets met het corpus te maken heeft scoort nog steeds rond de 0,6 tegen wíllekeurig welke juridische paragraaf, simpelweg omdat juridisch Nederlands op juridisch Nederlands lijkt. Er is geen drempelwaarde die “relevant” van “toevallig hetzelfde register” scheidt.",
      "Een cross-encoder ziet vraag en passage samen en produceert wél een bruikbare relevantiekans. Dat is duurder — maar alleen over de top-12 kandidaten, en dat kost een paar seconden op een laptop-CPU. De drempel van 0,35 ligt op dat getal, niet op de cosine.",
      "Het ophalen zelf is hybride: cosine top-3k en BM25 top-3k, samengevoegd met reciprocal rank fusion (k=60). Dat is geen theoretische voorkeur. Juridisch Nederlands is exact — ECLI-nummers, artikelnummers, plaatsnamen, artikel 310 Sr — en daar is een kleine multilinguale embedder slecht in en BM25 juist goed. Daarbovenop mogen er hoogstens twee chunks per uitspraak in de top-k, zodat één breedsprakige uitspraak de hele context niet opslokt.",
    ],
    callouts: [
      { value: "≈ 0,6", label: "cosine van een volstrekt irrelevante vraag tegen willekeurig welke juridische paragraaf" },
      { value: "0,35", label: "drempel op de gekalibreerde cross-encoder-score, niet op de cosine" },
      { value: "≤ 2", label: "chunks per uitspraak in de top-k, zodat één uitspraak de context niet opslokt" },
    ],
    screenshot: shot(
      "filtered",
      "Terminaluitvoer van 'ask' met metadatafilters (instantie: Rechtbank, datum vanaf 2024-01-01) voor een vraag over handel in vuurwapens: zes opgehaalde passages met per rij de cross-encoder-relevantie als balk, de cosine-score, ECLI, instantie, datum, sectie en een BM25-markering; daaronder een antwoord met twee beweringen en de verwijzingen per marker.",
      "Dezelfde keten met metadatafilters op instantie en datum. De relevantiekolom is de gekalibreerde cross-encoder-score; de cosine ernaast laat zien waarom die alleen niet volstaat.",
    ),
  },
  reference: {
    title: "Van XML naar een verwijzing",
    figure: diagram(
      "rag-3-van-xml-naar-verwijzing",
      "Drie kolommen: de XML van Rechtspraak.nl met een sectie 'Waardering van het bewijs' waarin 'Standpunt van de verdediging' en 'Het oordeel van de rechtbank' losse vetgedrukte alinea's zijn; het genormaliseerde model waarin die kopjes subsecties 4.1 en 4.2 zijn geworden met genummerde paragrafen; en de chunks van 560 tekens met 120 overlap, elk met ECLI, sectie en paragraafbereik, uitmondend in de verwijzing die de gebruiker ziet.",
      "Van ruwe XML via secties en chunks naar de verwijzing die de gebruiker ziet.",
    ),
    body: [
      "De verwijzing die de gebruiker ziet — ECLI:NL:RBNHO:2024:1234, §4.2 Waardering van het bewijs › Het oordeel van de rechtbank, par. 3 — moet ergens vandaan komen, en dat is het onopvallende deel van het project waar het meeste werk in zit.",
    ],
    detailsTitle: "Wat er nodig was om die verwijzing te laten kloppen",
    details: [
      {
        title: "Vette kopjes worden subsecties",
        body: "Uitspraken zetten hun structuur niet netjes in tags. Standpunt van de verdediging en Oordeel van de rechtbank staan vaak als een losse vetgedrukte alinea midden in een sectie. De parser splitst daarop: een alleenstaande vetgedrukte of onderstreepte alinea maakt een subsectie. Dat maakt zowel de verwijzing preciezer als de embedding, omdat een chunk niet meer twee tegengestelde standpunten in één vector propt.",
      },
      {
        title: "Een schema dat per jaar en instantie verschilt",
        body: "De parser matcht op lokale elementnamen zonder namespace-aannames, en wordt getest tegen opgenomen echte uitspraken van zowel een rechtbank als een hof. Eén onparsebaar bestand levert één foutrecord op, nooit een gecrashte batch. Over 1.906 uitspraken: 0 parse-fouten.",
      },
      {
        title: "Een chunker die puur en deterministisch is",
        body: "Dezelfde uitspraak geeft altijd dezelfde chunks met dezelfde id's, dus opnieuw indexeren levert geen duplicaten op. Chunks steken nooit een sectiegrens over en overlappen in hele paragrafen, zodat de paragraafnummers in de verwijzing blijven kloppen.",
      },
      {
        title: "560 tekens, 120 overlap — uit het model",
        body: "De embedder ziet maximaal 128 tokens, ongeveer 450 tekens. Een chunk van venster plus overlap betekent dat het stuk dat voorbij het venster valt terugkomt als begin van de volgende chunk, en dus alsnog geëmbed wordt. BM25 ziet ondertussen wél elk teken, want die kijkt naar de volledige tekst in FTS5.",
      },
    ],
  },
  corpus: {
    title: "Het corpus",
    intro: "Strafrechtuitspraken met een volledige tekst, over de eerste helft van maart in drie jaren (2023, 2024, 2025). Groot genoeg voor echt ophaalgedrag, klein genoeg om op een laptop te bouwen.",
    rows: [
      ["Uitspraken", "1.906 — 1.245 rechtbank, 416 gerechtshof, 132 Hoge Raad, 89 Parket bij de Hoge Raad, 24 overig"],
      ["Parse-fouten", "0"],
      ["Chunks", "124.952"],
      ["Instanties", "22"],
      ["Indexomvang", "473 MB SQLite"],
    ],
    note: "Drie jaren in plaats van één, omdat een datumfilter pas iets betekent als er wat te filteren valt. Alle instanties, omdat het type-filter (rechtbank vs. hof) anders leeg is.",
  },
  evaluation: {
    title: "Evaluatie",
    intro: "Vijftien vragen in tests/fixtures/eval_vragen.json: acht semantische (bewust anders geformuleerd dan de uitspraken zelf), twee met metadatafilters, twee over de inhoud van één specifieke uitspraak, en drie waarop het corpus geen antwoord heeft.",
    screenshot: shot(
      "eval",
      "Terminaluitvoer van 'eval': een tabel met vijftien vragen (semantisch, gefilterd, inhoudelijk, geen_bron) met per vraag de beste relevantiescore als balk, recall, reciprocal rank en status ok; daaronder het resultaatblok met recall@6 0.93, hit@6 1.00, MRR 0.94, geen-bron-correctheid 1.00 en onterecht geen-bron 0.00.",
      "De evaluatie draait zonder LLM voor de ophaalmetrieken en leest voor de generatiemetrieken dezelfde JSON-uitvoer als de CLI.",
    ),
    columns: ["Metriek", "Waarde", "Betekenis"],
    rows: [
      ["recall@6", "93%", "aandeel verwachte ECLI's in de top-k"],
      ["hit@6", "100%", "minstens één verwachte ECLI in de top-k"],
      ["MRR", "0,94", "positie van de eerste verwachte ECLI"],
      ["bronjuistheid", "100%", "antwoorden waarvan elke ECLI uit de opgehaalde passages komt"],
      ["claimacceptatie", "89%", "ruwe modelbeweringen die de verificatie overleven"],
      ["geen-bron-correctheid", "100%", "onbeantwoordbare vragen die het geen-bron-pad halen"],
      ["onterecht geen bron", "0%", "beantwoordbare vragen die geweigerd worden"],
    ],
    body: [
      "Bronjuistheid van 100% is geen prestatie maar een constructie: een bewering met een onbekende ECLI komt het antwoord niet in. Het interessante getal is claimacceptatie, want dat laat zien hoe vaak het model wél van de passages af zou zijn gedwaald als niemand had gekeken.",
      "De ophaalmetrieken hebben geen LLM nodig. De generatiemetrieken zijn gemeten met ollama/llama3.2, lokaal.",
    ],
  },
  choices: {
    title: "Ontwerpkeuzes",
    intro: "Een paar afwegingen waar ik het langst over heb nagedacht.",
    items: [
      {
        title: "SQLite + NumPy in plaats van een vectordatabase",
        body: "Bij tienduizenden vectoren is een exacte scan een handvol milliseconden. FTS5 geeft BM25 er gratis bij, het geheel is één bestand, er draait geen service naast, en er zijn geen platformspecifieke wheels nodig — wat concreet uitmaakte, want LanceDB en recente onnxruntime hebben geen Intel-Mac wheels. Een ANN-index zou hier snelheid inruilen voor exactheid zonder dat er snelheid te winnen valt.",
      },
      {
        title: "Een lokale, gekwantiseerde ONNX-embedder",
        body: "paraphrase-multilingual-MiniLM-L12-v2 via fastembed: 118M parameters, ongeveer 13 chunks per seconde op een laptop-CPU. Grotere modellen (e5-large, bge-m3) waren op deze machine een orde van grootte trager voor winst die de evaluatie niet liet zien. Het zit achter een Embedder-interface, dus wisselen is configuratie.",
      },
      {
        title: "Drie LLM-backends, waarvan één zonder model",
        body: "Ollama is de standaard (geen sleutel nodig), Claude is optioneel, en er is een extractieve backend die simpelweg de beste passages letterlijk citeert. Die derde is er niet voor de show: daarmee draait de hele keten inclusief evaluatie zonder dat er ergens een model geladen hoeft te worden. En hij gaat door dezelfde verificatie heen als de andere twee.",
      },
      {
        title: "Alles achter een interface, alles nep-baar in tests",
        body: "FakeEmbedder (hashed bag-of-words), FakeLLM, FakeReranker, opgenomen XML-fixtures. 93 tests, en de CI draait zonder netwerk, zonder modeldownload en zonder LLM. Dat is geen zuiverheidsprincipe maar snelheid: de testsuite is klaar voordat je van tabblad bent gewisseld.",
      },
    ],
  },
  shows: {
    title: "Wat dit project laat zien",
    skills: [
      "RAG-ontwerp en verificatie per bewering",
      "Hybride retrieval: cosine ⊕ BM25 met RRF",
      "Cross-encoder reranking en gekalibreerde drempels",
      "Chunking met sectie- en paragraafbehoud",
      "XML-parsing van rommelige, wisselende schema's",
      "SQLite + FTS5 + NumPy",
      "Evaluatiesets die ook het weigeren meten",
      "Testbaar zonder model, netwerk of database",
    ],
    closing: "De moeilijke vraag bij RAG is niet “hoe haal ik de juiste stukken op”, maar “wat doe ik als het model iets zegt wat er niet staat”. Verifiëren is een ontwerpkeuze die je bewust moet maken — en vervolgens moet meten.",
  },
};

const en: PageContent = {
  eyebrow: "Own project",
  title: "Strafrecht-RAG: no source, no answer",
  lead: "RAG over 1,906 Dutch criminal-law rulings with one rule: no source, no answer. Every claim ends in an ECLI, section and paragraph — and that reference is checked in code, not requested from the model.",
  intro: [
    "Building a RAG demo is an afternoon's work: read in documents, make embeddings, fetch top-k, paste into a prompt. The problem isn't the pipeline but what comes out of it. A language model that is handed four passages and asked for an answer with sources almost always produces something that looks correct. An ECLI that doesn't quite exist, a paragraph number that points nowhere, a claim that is true but isn't in the supplied text — you can't tell the difference without checking.",
    "In criminal law that difference is the whole point. So this project is turned around: not “how do I get the model to cite properly”, but “what can I verify hard afterwards, and what do I throw away when it doesn't hold up”. A claim without a reference doesn't make it into the answer. An ECLI that doesn't occur in the retrieved passages doesn't make it into the answer. And if the best passage stays below the relevance threshold, the model isn't called at all.",
  ],
  facts: [
    "Python 3.12",
    "SQLite + NumPy",
    "FTS5 / BM25",
    "fastembed (ONNX)",
    "Cross-encoder reranking",
    "Ollama / Claude / extractive",
    "93 tests, ruff clean",
  ],
  stats: [
    { label: "Source accuracy", value: "100%, by construction" },
    { label: "Claim acceptance", value: "89%" },
    { label: "recall@6", value: "93%" },
    { label: "Corpus", value: "1,906 rulings" },
  ],
  ui: {
    repo: "View the code on GitHub",
    allProjects: "All projects",
    back: "Back to projects",
    dataSource: "Data source",
    dataSourceName: "Rechtspraak.nl Open Data — only the published, anonymised text; nothing is enriched and nothing is de-anonymised.",
    disclaimer: "Not legal advice. This is a search and summarisation aid over published, anonymised rulings; check every source via its ECLI on rechtspraak.nl.",
  },
  hero: shot(
    "ask",
    "Terminal output of 'ask' for the question 'Which rulings are about embezzlement by a foundation board member?' (in Dutch): the steps load, embed, retrieve, rerank, generate and source verification; a table of four retrieved passages with relevance, cosine, ECLI, court, date and section; and an answer with two claims, each ending in an [n] marker, followed by the references per marker and the line '2 claims verified · every ECLI comes from the 4 supplied passages'.",
    "An answer as the CLI shows it: every claim ends in a marker, every marker points to a supplied passage, and the verification line at the bottom says how many claims survived. Output is in Dutch.",
  ),
  why: {
    title: "Why this project",
    body: [
      "I wanted to know where the line runs between “a RAG system that demonstrates” and “a RAG system whose output you would dare to forward”. That line isn't at the retrieval part — the recipes there are known. It's at the question of what happens when the model says something that doesn't come from the sources.",
      "Rechtspraak.nl publishes all rulings as open data, anonymised, with structured XML. That is a corpus where answers are objectively verifiable: an ECLI exists or it doesn't, a paragraph is there or it isn't. Exactly the kind of domain where you can build a control mechanism that is more than a feeling.",
    ],
  },
  architecture: {
    title: "Architecture",
    body: [
      "The system splits into two halves that only touch each other through the index. The offline half builds the corpus, the online half answers one question, and in between sits a single file.",
    ],
    figure: diagram(
      "rag-1-architectuur",
      "Architecture of strafrecht-rag (labels in Dutch): an offline chain (Rechtspraak.nl Open Data → client → raw XML → parser → chunker → embedder) writes to a single SQLite + NumPy index; an online chain (question → retriever → cross-encoder → threshold 0.35 → LLM → verify → answer) reads from it. Below the threshold the language model is not called; rejected claims are shown, not hidden.",
      "Offline indexing and online answering only touch each other through the index.",
    ),
    partsTitle: "Three parts, each testable on its own",
    parts: [
      {
        title: "The offline half",
        body: "Runs once per corpus extension. A client queries the Open Data search feed by date and area of law, paginates and fetches one XML per ECLI — rate limited, with backoff, resumable. The parser turns that into one Uitspraak (ruling): court, date, areas of law, procedures, case number, statutory references, summary and numbered sections with numbered paragraphs. The chunker cuts those into pieces that never cross a section boundary, and the embedder turns them into vectors.",
      },
      {
        title: "The online half",
        body: "Is one question long. The retriever fetches candidates, the cross-encoder reorders them and gives each a calibrated score, the threshold decides whether the model is called at all, and verification decides what remains of the answer.",
      },
      {
        title: "One storage layer",
        body: "SQLite with the metadata and an FTS5 index, plus the vectors as a single float32 matrix in NumPy. One file, no service.",
      },
    ],
  },
  rule: {
    title: "The one rule: no source, no answer",
    body: ["The rule is enforced in three places, and in none of them by the prompt."],
    figure: diagram(
      "rag-2-geen-bron-geen-antwoord",
      "The rule 'no source, no answer' (labels in Dutch) is enforced in three places: at retrieval (below the threshold the model is not called), at generation (numbered passages, mandatory [n] markers, GEEN_BRON allowed) and at verification. Each claim passes four checks: is there a marker, does it point to a supplied passage, do all ECLIs come from the passages, has the claim been made before. Whatever fails is reported with its reason.",
      "The verification chain per claim, and the two ways to say “no source”.",
    ),
    stagesTitle: "Before, during and after generation",
    stages: [
      {
        title: "Before generation",
        body: "If the best relevance score is below the threshold (0.35), the LLM is not called. “No source” is thereby a property of retrieval, not a courtesy of the model.",
      },
      {
        title: "During generation",
        body: "The model receives numbered passages and the instruction to give one claim per line, ending in an [n] marker. It may also answer GEEN_BRON (no source) if it judges that the passages don't cover the question.",
      },
      {
        title: "After generation",
        body: "Every claim passes through a chain of checks: is there a marker? Does it point to a passage that was actually supplied? Does every ECLI in the claim occur in those passages? Is the claim non-empty and not already made? Whatever fails, fails — with the reason attached, visible in the output. If nothing survives, the model gets one retry with a format reminder.",
      },
    ],
    after: [
      "That last part is where most RAG systems stop at an instruction in the system prompt. An instruction is not a guarantee. The test suite contains a fake LLM that invents an ECLI and one that omits the references; both are rejected. And the evaluation set contains questions whose answer must be that the corpus has no source — so that path is measured, not assumed.",
    ],
    screenshot: shot(
      "no-source",
      "Terminal output of 'ask' for the question 'What does the court say about the patent application for a nuclear fusion reactor?' (in Dutch): the generate and source-verification steps are skipped, with the reason 'best relevance 0.27 < threshold 0.35'. The answer block says 'No source found', shows the best relevance as a bar next to the threshold, and lists the three nearest passages for checking.",
      "The no-source path: the best passage stays below the threshold, the language model is not called, and the output shows why — including the nearest passages so you can check for yourself. Output is in Dutch.",
    ),
    yield: "The yield is one number: claim acceptance 89%. Eleven percent of what the model produced deviated from the passages and never reached the user.",
  },
  reranker: {
    title: "Why there is a cross-encoder",
    body: [
      "This is the measurement that decided the design. The obvious recipe is: cosine similarity, a threshold on top, below the threshold you say “no source”. That doesn't work. A bi-encoder's cosine isn't calibrated — a question that has nothing whatsoever to do with the corpus still scores around 0.6 against any legal paragraph, simply because legal Dutch resembles legal Dutch. There is no threshold value that separates “relevant” from “coincidentally the same register”.",
      "A cross-encoder sees question and passage together and does produce a usable relevance probability. That's more expensive — but only over the top-12 candidates, and that costs a few seconds on a laptop CPU. The 0.35 threshold sits on that number, not on the cosine.",
      "Retrieval itself is hybrid: cosine top-3k and BM25 top-3k, merged with reciprocal rank fusion (k=60). That's not a theoretical preference. Legal Dutch is exact — ECLI numbers, article numbers, place names, artikel 310 Sr — and a small multilingual embedder is bad at that where BM25 is good. On top of that, at most two chunks per ruling may enter the top-k, so one long-winded ruling can't swallow the whole context.",
    ],
    callouts: [
      { value: "≈ 0.6", label: "cosine of a completely irrelevant question against any legal paragraph" },
      { value: "0.35", label: "threshold on the calibrated cross-encoder score, not on the cosine" },
      { value: "≤ 2", label: "chunks per ruling in the top-k, so one ruling can't swallow the context" },
    ],
    screenshot: shot(
      "filtered",
      "Terminal output of 'ask' with metadata filters (court type: district court, date from 2024-01-01) for a question about firearms trading (in Dutch): six retrieved passages, each row showing the cross-encoder relevance as a bar, the cosine score, ECLI, court, date, section and a BM25 marker; below it an answer with two claims and the references per marker.",
      "The same chain with metadata filters on court type and date. The relevance column is the calibrated cross-encoder score; the cosine next to it shows why that alone doesn't suffice. Output is in Dutch.",
    ),
  },
  reference: {
    title: "From XML to a reference",
    figure: diagram(
      "rag-3-van-xml-naar-verwijzing",
      "Three columns (labels in Dutch): the Rechtspraak.nl XML with a section 'Assessment of the evidence' in which 'Position of the defence' and 'The court's judgment' are loose bold paragraphs; the normalised model in which those headings have become subsections 4.1 and 4.2 with numbered paragraphs; and the chunks of 560 characters with 120 overlap, each carrying ECLI, section and paragraph range, ending in the reference the user sees.",
      "From raw XML via sections and chunks to the reference the user sees.",
    ),
    body: [
      "The reference the user sees — ECLI:NL:RBNHO:2024:1234, §4.2 Waardering van het bewijs › Het oordeel van de rechtbank, par. 3 — has to come from somewhere, and that is the unglamorous part of the project where most of the work went.",
    ],
    detailsTitle: "What it took to make that reference correct",
    details: [
      {
        title: "Bold headings become subsections",
        body: "Rulings don't put their structure neatly in tags. Position of the defence and The court's judgment often appear as a loose bold paragraph in the middle of a section. The parser splits on that: a standalone bold or underlined paragraph starts a subsection. That makes both the reference and the embedding more precise, because a chunk no longer crams two opposing positions into one vector.",
      },
      {
        title: "A schema that varies by year and court",
        body: "The parser matches on local element names without namespace assumptions, and is tested against recorded real rulings from both a district court and a court of appeal. One unparseable file yields one error record, never a crashed batch. Across 1,906 rulings: 0 parse errors.",
      },
      {
        title: "A chunker that is pure and deterministic",
        body: "The same ruling always yields the same chunks with the same ids, so re-indexing produces no duplicates. Chunks never cross a section boundary and overlap in whole paragraphs, so the paragraph numbers in the reference stay correct.",
      },
      {
        title: "560 characters, 120 overlap — from the model",
        body: "The embedder sees at most 128 tokens, roughly 450 characters. A chunk of window plus overlap means the part that falls beyond the window comes back as the start of the next chunk, and so still gets embedded. BM25 meanwhile does see every character, because it looks at the full text in FTS5.",
      },
    ],
  },
  corpus: {
    title: "The corpus",
    intro: "Criminal-law rulings with full text, covering the first half of March in three years (2023, 2024, 2025). Large enough for real retrieval behaviour, small enough to build on a laptop.",
    rows: [
      ["Rulings", "1,906 — 1,245 district court, 416 court of appeal, 132 Supreme Court, 89 Procurator General's office, 24 other"],
      ["Parse errors", "0"],
      ["Chunks", "124,952"],
      ["Courts", "22"],
      ["Index size", "473 MB SQLite"],
    ],
    note: "Three years instead of one, because a date filter only means something when there is something to filter. All courts, because the type filter (district court vs. court of appeal) would otherwise be empty.",
  },
  evaluation: {
    title: "Evaluation",
    intro: "Fifteen questions in tests/fixtures/eval_vragen.json: eight semantic (deliberately phrased differently from the rulings themselves), two with metadata filters, two about the content of one specific ruling, and three the corpus has no answer to.",
    screenshot: shot(
      "eval",
      "Terminal output of 'eval' (in Dutch): a table of fifteen questions (semantic, filtered, content, no-source) with per question the best relevance score as a bar, recall, reciprocal rank and status ok; below it the result block with recall@6 0.93, hit@6 1.00, MRR 0.94, no-source correctness 1.00 and false no-source 0.00.",
      "The evaluation runs without an LLM for the retrieval metrics and, for the generation metrics, reads the same JSON output as the CLI. Output is in Dutch.",
    ),
    columns: ["Metric", "Value", "Meaning"],
    rows: [
      ["recall@6", "93%", "share of expected ECLIs in the top-k"],
      ["hit@6", "100%", "at least one expected ECLI in the top-k"],
      ["MRR", "0.94", "rank of the first expected ECLI"],
      ["source accuracy", "100%", "answers in which every ECLI comes from the retrieved passages"],
      ["claim acceptance", "89%", "raw model claims that survive verification"],
      ["no-source correctness", "100%", "unanswerable questions that hit the no-source path"],
      ["false no-source", "0%", "answerable questions that are refused"],
    ],
    body: [
      "Source accuracy of 100% is not an achievement but a construction: a claim with an unknown ECLI doesn't get into the answer. The interesting number is claim acceptance, because it shows how often the model would have strayed from the passages if nobody had been watching.",
      "The retrieval metrics need no LLM. The generation metrics were measured with ollama/llama3.2, locally.",
    ],
  },
  choices: {
    title: "Design choices",
    intro: "A few trade-offs I thought about the longest.",
    items: [
      {
        title: "SQLite + NumPy instead of a vector database",
        body: "At tens of thousands of vectors an exact scan takes a handful of milliseconds. FTS5 throws in BM25 for free, the whole thing is one file, no service runs alongside it, and no platform-specific wheels are needed — which mattered concretely, because LanceDB and recent onnxruntime have no Intel Mac wheels. An ANN index would trade exactness for speed here without any speed to gain.",
      },
      {
        title: "A local, quantised ONNX embedder",
        body: "paraphrase-multilingual-MiniLM-L12-v2 via fastembed: 118M parameters, about 13 chunks per second on a laptop CPU. Larger models (e5-large, bge-m3) were an order of magnitude slower on this machine for gains the evaluation didn't show. It sits behind an Embedder interface, so swapping is configuration.",
      },
      {
        title: "Three LLM backends, one of them without a model",
        body: "Ollama is the default (no key needed), Claude is optional, and there is an extractive backend that simply quotes the best passages verbatim. That third one isn't for show: it lets the whole chain, evaluation included, run without loading a model anywhere. And it goes through the same verification as the other two.",
      },
      {
        title: "Everything behind an interface, everything fakeable in tests",
        body: "FakeEmbedder (hashed bag-of-words), FakeLLM, FakeReranker, recorded XML fixtures. 93 tests, and CI runs without network, without a model download and without an LLM. That's not a purity principle but speed: the test suite finishes before you've switched tabs.",
      },
    ],
  },
  shows: {
    title: "What this project shows",
    skills: [
      "RAG design and per-claim verification",
      "Hybrid retrieval: cosine ⊕ BM25 with RRF",
      "Cross-encoder reranking and calibrated thresholds",
      "Chunking that preserves sections and paragraphs",
      "XML parsing of messy, shifting schemas",
      "SQLite + FTS5 + NumPy",
      "Evaluation sets that also measure refusal",
      "Testable without a model, network or database",
    ],
    closing: "The hard question in RAG isn't “how do I retrieve the right pieces” but “what do I do when the model says something that isn't there”. Verification is a design choice you have to make deliberately — and then measure.",
  },
};

export const CONTENT: Record<Locale, PageContent> = { nl, en };
