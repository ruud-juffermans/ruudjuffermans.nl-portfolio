import type { Locale } from "@/i18n/routing";
import type { Figure, TitledItem } from "@/components/ProjectPageKit";

// Copy for the bespoke OV streaming pipeline page. The listing on /projects,
// the sitemap and llms-full.txt still read the project's MDX frontmatter and
// prose; this module only feeds the custom detail page.

export const SLUG = "ov-streaming-pipeline";
export const ACCENT = "#10B981";
export const REPO_URL = "https://github.com/datavakwerk/ov-streaming-pipeline";
const IMG = "/images/projects/ov-streaming-pipeline";

export type { Figure, TitledItem };

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
    links: string;
  };
  hero: Figure;
  why: { title: string; body: string[] };
  architecture: { title: string; figure: Figure; body: string[]; choicesTitle: string; choices: TitledItem[] };
  producer: {
    title: string;
    body: string[];
    callouts: { value: string; label: string }[];
    quirksTitle: string;
    quirks: string[];
    quirksNote: string;
  };
  windows: { title: string; figure: Figure; body: string[]; lessonsTitle: string; lessons: TitledItem[] };
  delivery: {
    title: string;
    figure: Figure;
    body: string[];
    detailsTitle: string;
    details: TitledItem[];
    proof: { test: string; body: string };
  };
  failure: {
    title: string;
    figure: Figure;
    body: string[];
    pathsTitle: string;
    paths: { command: string; title: string; body: string }[];
    measured: string;
  };
  schema: { title: string; body: string[]; stepsTitle: string; steps: string[] };
  practice: {
    title: string;
    intro: string;
    tableCaption: string;
    rows: [string, string][];
    notesTitle: string;
    notes: TitledItem[];
    screenshots: Figure[];
  };
  choices: { title: string; intro: string; items: TitledItem[] };
  testing: { title: string; body: string[]; figure: Figure };
  shows: { title: string; skills: string[]; closing: string };
}

const DIAGRAM_DIMS = {
  "ov-1-architectuur": { width: 1606, height: 1015 },
  "ov-2-vensters-watermarks": { width: 1486, height: 846 },
  "ov-3-at-least-once": { width: 1510, height: 834 },
  "ov-4-dlq-en-replay": { width: 1510, height: 763 },
} as const;

function diagram(name: keyof typeof DIAGRAM_DIMS, alt: string, caption: string): Figure {
  // The architecture diagram carries the most detail, so it is rendered by
  // draw.io's own viewer (zoom, pan, lightbox) from the .drawio source in
  // public/diagrams; the others stay a flat SVG that links to its full size.
  const drawioSrc = name.endsWith("-architectuur") ? `/diagrams/${name}.drawio` : undefined;
  return { kind: "diagram", src: `${IMG}/${name}.svg`, ...DIAGRAM_DIMS[name], alt, caption, drawioSrc };
}

function shot(name: string, height: number, alt: string, caption: string): Figure {
  return { kind: "screenshot", src: `${IMG}/${name}.png`, width: 1600, height, alt, caption };
}

const nl: PageContent = {
  eyebrow: "Eigen project · 3 weken",
  title: "Realtime OV-streamingpipeline op Kafka",
  lead: "Elk voertuig in het Nederlandse openbaar vervoer, live gestreamd — van GTFS-realtime feed tot een kaart van het hele land, met de correctheidsgaranties erbij.",
  intro: [
    "Twee bestanden op een open endpoint bevatten elke minuut waar ongeveer 4.900 voertuigen zich bevinden en hoeveel vertraging ze hebben. Daar een dashboard van maken is een middag werk. Daar een pipeline van maken die 24 uur per dag doorloopt, na een crash de juiste cijfers geeft, kapotte berichten niet stilzwijgend verliest en waarvan je een uur uit het verleden opnieuw kunt uitrekenen — dat is een ander project.",
    "Dit is dat tweede project. Een producer die snapshots in wijzigingsevents omzet, Redpanda als bus, een streamprocessor met tumbling windows en per-partitie watermarks, een ruw archief in MinIO waaruit je kunt replayen, Postgres als serving-laag en een live kaart erbovenop. Dertien containers, één make up, geen accounts en geen sleutels.",
  ],
  facts: [
    "Python 3.12",
    "Kafka (Redpanda)",
    "Postgres",
    "MinIO",
    "Prometheus + Grafana",
    "Streamlit + pydeck",
    "Docker Compose",
  ],
  stats: [
    { label: "Ochtendspits", value: "176 berichten/s" },
    { label: "Vensters", value: "5 min · 4 dimensies" },
    { label: "Tests", value: "106, zonder infra" },
    { label: "Kosten", value: "Nul, volledig lokaal" },
  ],
  ui: {
    repo: "Bekijk de code op GitHub",
    allProjects: "Alle projecten",
    back: "Terug naar projecten",
    dataSource: "Databron",
    dataSourceName: "OVapi GTFS-realtime, open access zonder sleutel",
    links: "Links",
  },
  hero: shot(
    "dashboard",
    1000,
    "Het live dashboard NL OV Delay Monitor in de ochtendspits: zes KPI-tegels (4.616 voertuigen live, 6.628 ritten met voorspelling, gemiddelde vertraging +1:01, P90 +2:40, 70% op tijd, slechtste lijn +60:00), een kaart van Nederland met duizenden gekleurde voertuigposities en rechts een tabel met de slechtste lijnen van het laatste venster.",
    "Het dashboard op maandagochtend 08:24: 4.616 voertuigen op de kaart, de KPI's van het laatste gesloten venster en de slechtste lijnen van dat venster.",
  ),
  why: {
    title: "Waarom dit project",
    body: [
      "Streaming leer je niet van een tutorial met een for-lus over een lijst. De interessante dingen gebeuren pas als er echte tijd in het spel is: events die te laat aankomen, partities die uit de pas lopen, een proces dat omvalt tussen twee schrijfacties, een feed die zich niet aan zijn eigen documentatie houdt.",
      "Ik wilde die dingen tegenkomen in plaats van erover lezen. Een landelijke, publieke, altijd-aan databron dwingt dat af — en levert meteen iets op wat je kunt laten zien.",
    ],
  },
  architecture: {
    title: "Architectuur",
    figure: diagram(
      "ov-1-architectuur",
      "Architectuurdiagram: OVapi GTFS-RT (vehiclePositions elke 20 s, tripUpdates elke 60 s) → producer (protobuf parsen, snapshot diffen, heartbeat, backoff) → Redpanda met de topics vehicle_positions en arrival_predictions (6 partities) en twee DLQ-topics, retentie 24 uur. Twee consumergroepen: de processor (tumbling windows van 5 min, per-partitie watermarks, 2 min toegestane vertraging, count/mean/P90/max/min over lijn, station, vervoerder en netwerk) schrijft met idempotente upserts naar Postgres; de archiver schrijft ruwe bytes als gzip JSON-lines naar MinIO. Een gtfs-static sidecar laadt dagelijks de referentiedata via COPY en een atomische swap. Het Streamlit-dashboard leest Postgres; Prometheus scrapet alles; replay draait archiefbestanden door dezelfde Pipeline-klasse.",
      "De keten van links naar rechts: twee feeds in, twee consumergroepen, één serving-laag.",
    ),
    body: [
      "De keten loopt van links naar rechts. De producer haalt twee protobuf-feeds op, parseert ze naar een geversioneerd eventcontract en publiceert naar twee Kafka-topics. Twee onafhankelijke consumergroepen lezen mee: de processor rekent vensters uit en schrijft naar Postgres, de archiver schrijft de ruwe bytes naar MinIO. Een sidecar laadt dagelijks de statische GTFS-referentiedata. Het dashboard staat op Postgres, Prometheus scrapet alles.",
    ],
    choicesTitle: "Twee architectuurkeuzes bepalen de rest van het ontwerp",
    choices: [
      {
        title: "De broker is een buffer, geen archief",
        body: "De retentie op de ruwe topics staat op 24 uur. Wat je over een maand nog nodig hebt staat in MinIO, als bytes — niet als geparseerde events. Dat onderscheid lijkt klein en is het niet: omdat het archief bytes bewaart, kun je er later een níeuwe decoder overheen draaien. Had je geparseerde events opgeslagen, dan had je de interpretatie van toen voor altijd vastgelegd.",
      },
      {
        title: "Twee consumergroepen in plaats van één service die allebei doet",
        body: "Archiveren en verwerken hebben verschillende faalmodi en verschillende snelheden. Als MinIO even weg is, moet de processor gewoon doorlopen — en andersom.",
      },
    ],
  },
  producer: {
    title: "Het probleem dat de producer oplost",
    body: [
      "Beide feeds zijn FULL_DATASET-snapshots: elke minuut komt het volledige beeld opnieuw langs. Publiceer je dat rechtstreeks, dan zit je op zo'n 700 berichten per seconde die grotendeels herhaling zijn.",
      "De producer diffed daarom elke snapshot tegen de vorige en publiceert alleen wat veranderd is. In de ochtendspits onderdrukt dat ongeveer 45% van de entiteiten per poll. Om te voorkomen dat een trein die al twintig minuten op +5:00 staat uit de statistiek verdwijnt, gaat er elke zestig seconden een heartbeat mee. Het resultaat: vijf tot twintig keer minder berichten, met identieke venstercijfers.",
    ],
    callouts: [
      { value: "45%", label: "van de entiteiten per poll onderdrukt in de spits" },
      { value: "5–20×", label: "minder berichten, met identieke venstercijfers" },
      { value: "60 s", label: "heartbeat, zodat een stilstaande vertraging blijft tellen" },
    ],
    quirksTitle: "Wat de feed niet documenteert",
    quirks: [
      "Entiteits-id's zoals 2026-09-06:GVB:13:13605 bevatten de vervoerderscode, die verder nergens in het bericht staat — dus die wordt uit het id geparseerd.",
      "VehiclePosition bevat geen vertraging; die zit in TripUpdate.",
      "Er rijden spookvoertuigen rond: een bus die elf dagen op dezelfde plek STOPPED_AT staat, en één voertuig dat vanuit 29 minuten in de toekomst rapporteerde.",
      "Posities ouder dan tien minuten of meer dan een minuut vooruit worden weggegooid.",
    ],
    quirksNote: "Al die gevallen zijn vastgelegd in opgenomen protobuf-fixtures in de repo: 140 KB die elke parsertest aan de werkelijkheid vastpint.",
  },
  windows: {
    title: "Vensters, watermarks en late events",
    figure: diagram(
      "ov-2-vensters-watermarks",
      "Diagram van de watermark: zes partities met elk hun maximale event-time; de traagste (p2, 10:12:40) bepaalt het minimum, een partitie die 130 s stil is telt niet mee; min minus 120 s toegestane vertraging geeft watermark 10:10:40. Op de event-time-as zijn de vensters 10:00–10:05 en 10:05–10:10 gefinaliseerd, 10:10–10:15 en 10:15–10:20 staan open. Een event met event-time 10:07 dat nu arriveert is te laat: geteld en weggegooid.",
      "De watermark komt van de traagste actieve partitie, niet van de snelste. Een venster sluit zodra de watermark het einde bereikt.",
    ),
    body: [
      "De processor rekent tumbling vensters van vijf minuten uit, uitgelijnd op het epoch, over vier dimensies tegelijk: lijn, station, vervoerder en netwerk. Per venster: count, gemiddelde, exacte P90, max en min.",
      "De watermark is waar het echte werk zit. Eerste versie: één globaal maximum over alle binnengekomen events. Dat werkte prima tot er een inhaalslag van veertig minuten kwam — de zes partities werden op verschillende snelheden geconsumeerd, de snelste trok de watermark vooruit, en 169.000 volstrekt normale events van de tragere partities werden als “te laat” bestempeld en weggegooid.",
      "Events achter de watermark worden geteld en weggegooid. Dat is een expliciete afweging: begrensde state en precies één emissie per venster, in ruil voor het negeren van alles wat meer dan twee minuten achterloopt. In de praktijk is dat aantal nul, omdat de event-tijd de generatietijd van de feed zelf is en die monotoon oploopt.",
    ],
    lessonsTitle: "Drie lessen die de watermark vormgaven",
    lessons: [
      {
        title: "Per partitie, niet globaal",
        body: "De oplossing is wat Flink doet: een watermark per partitie, en het minimum daarvan geldt. Zo kan een snelle partitie nooit de events van een trage partitie ongeldig maken.",
      },
      {
        title: "Een stille partitie telt niet mee",
        body: "Anders houdt een partitie die niets meer stuurt de watermark voor altijd tegen en sluit er nooit meer een venster. Na 120 seconden stilte telt een partitie niet meer mee tot ze weer iets zegt.",
      },
      {
        title: "En als het hele land stilvalt",
        body: "Tussen 01:00 en 05:00 rijden er twintig à dertig nachtbussen. Zonder ingreep sluit het laatste venster nooit, want er komt geen event meer dat de watermark vooruit duwt. Na negentig seconden stilte schuift de processor de watermark op de wandklok vooruit.",
      },
    ],
  },
  delivery: {
    title: "At-least-once, veilig gemaakt door idempotentie",
    figure: diagram(
      "ov-3-at-least-once",
      "Diagram in drie delen. De volgorde: poll batch, decoderen en tellen, watermark bijwerken, UPSERT van gefinaliseerde vensters in Postgres, ledger vrijgeven, en pas dan COMMIT van de offsets — stap 4 vóór stap 6, altijd. De offset-ledger per partitie: (offset, window_end) in aankomstvolgorde; offset 103 hoort bij een open venster, dus de commit stopt daar, ook al is offset 104 al gefinaliseerd. Crash tussen upsert en commit: venster 10:05–10:10 wordt geüpsert met count 412, het proces valt om, de broker levert opnieuw, de processor herberekent dezelfde count en de upsert op de primary key vervangt de rij in plaats van erbij op te tellen.",
      "Commit ná de upsert, en een upsertsleutel die gelijk is aan de venstersleutel: dubbeltellen kan niet.",
    ),
    body: [
      "Exactly-once levering wordt bewust niet nagestreefd. De goedkopere garantie geeft hetzelfde antwoord, zonder transactionele machinerie.",
      "De volgorde is: verwerk, upsert de gefinaliseerde vensters, en commit de offsets pas daarna. Valt het proces om tussen die twee stappen, dan levert de broker dezelfde berichten opnieuw, herberekent de processor hetzelfde venster uit dezelfde events, en schrijft die weg op dezelfde sleutel. De primary key van delay_aggregates is (window_start, dimension, dimension_id) — de upsert vervángt de rij met identieke waarden in plaats van erbij op te tellen. Dubbeltellen kan dus niet.",
    ],
    detailsTitle: "Twee details maken dat waterdicht in plaats van ongeveer goed",
    details: [
      {
        title: "Offsets lopen nooit vóór op open vensters",
        body: "Per partitie houdt de processor de geconsumeerde (offset, window_end)-paren in aankomstvolgorde bij, en commit één voorbij het langste aaneengesloten begin waarvan alle vensters gesloten zijn. Zit er halverwege een bericht dat nog in een open venster valt, dan stopt de commit daar — ook als er achter dat bericht al wél afgeronde vensters staan. Alles in een open venster wordt na een crash opnieuw geleverd en bouwt dat venster van voren af aan opnieuw op.",
      },
      {
        title: "De watermark wordt bij het opstarten uit Postgres gezaaid",
        body: "max(window_end) zorgt dat opnieuw geleverde berichten die bij een al weggeschreven venster horen als te laat gelden, in plaats van dat er een gedeeltelijk venster over een compleet venster heen wordt geschreven. Die seed wordt op de wandklok geklemd — een les uit de praktijk: één keer zaaide een replay die nog liep de watermark in de toekomst, waarna 130.000 goede events werden weggegooid.",
      },
    ],
    proof: {
      test: "test_duplicate_delivery_does_not_double_count_in_real_postgres",
      body: "past hetzelfde gefinaliseerde venster twee keer toe tegen de échte database en controleert dat er één rij staat, met de oorspronkelijke count.",
    },
  },
  failure: {
    title: "Als het misgaat",
    figure: diagram(
      "ov-4-dlq-en-replay",
      "Diagram met twee helften. Dode brieven: een parse-fout in de producer (voertuig zonder positie, zonder trip-id, coördinaten op 0,0) of een decode-fout in de processor (onbekende schemaversie) gaat naar dlq.<source_topic> als de originele bytes met headers stage, source_topic, source_partition, source_offset, error, failed_at en schema_version; binnen 10 s zichtbaar in make dlq-peek, Grafana en de health-strip; elke (entiteit, reden) één keer. make replay-dlq draait de mislukte stap opnieuw met de huidige code: gelukt gaat terug naar het brontopic met header replayed_from, nog steeds stuk blijft staan. Replay uit het archief: MinIO-bestanden per topic/datum/uur met het exacte offsetbereik, make replay FROM TO, dezelfde Pipeline-klasse als de consumer, dedupe op (topic, partitie, offset), deels gedekte vensters overgeslagen, idempotente upsert.",
      "Niets blokkeert de hoofdlus. Wat niet verwerkt kan worden gaat opzij met genoeg context om het later alsnog te doen.",
    ),
    body: [
      "Alles wat niet geparseerd (producer) of niet gedecodeerd (processor) kan worden gaat naar dlq.<source_topic> als de originele bytes, met headers voor stage, brontopic, partitie, offset, fout, tijdstip en schemaversie. De hoofdlus blokkeert nooit.",
      "Eén detail dat je pas ontdekt als je het draait: parse-fouten herhalen zich elke minuut, want de feed stuurt dezelfde kapotte entiteit gewoon opnieuw. Zonder maatregel loopt je DLQ vol met duizend keer hetzelfde bericht. De producer dead-lettert daarom elke unieke combinatie van entiteit en reden één keer.",
    ],
    pathsTitle: "Twee herstelpaden",
    paths: [
      {
        command: "make replay-dlq",
        title: "De mislukte stap opnieuw, met de huidige code",
        body: "Een parserfix, een nieuwe schemaversie. Wat nu wél slaagt gaat terug het brontopic in met een replayed_from-header; wat nog steeds stuk is blijft staan en wordt samengevat per reden.",
      },
      {
        command: "make replay FROM=… TO=…",
        title: "Een tijdvak opnieuw uitrekenen uit het MinIO-archief",
        body: "Replay draait door dezelfde Pipeline-klasse als de live consumer. Geen tweede implementatie van de windowinglogica — zou dat wel zo zijn, dan test je twee dingen en vertrouw je er één.",
      },
    ],
    measured: "Gemeten: 122.364 gearchiveerde berichten uit twaalf minuten ochtendspits, herberekend tot 11.323 vensters in ongeveer tien seconden.",
  },
  schema: {
    title: "Schema-evolutie",
    body: [
      "SCHEMA_VERSION staat zowel in de body van elk bericht als in een Kafka-header, zodat een consument op versie kan routeren zonder de body te parseren. Achterwaarts compatibele wijzigingen — een optioneel veld met een default erbij — bumpen de versie niet. Een veld weghalen, hernoemen of van type veranderen wel.",
      "common.serde houdt een decoder per ondersteunde versie bij, en de processor accepteert de huidige én de vorige. Een onbekende versie is een SchemaError — dus de DLQ, nooit een crash. En omdat het archief bytes bewaart en geen events, kan een nieuwe decoder altijd over de historie heen worden gedraaid.",
    ],
    stepsTitle: "Een nieuwe versie uitrollen, zonder de pipeline te breken",
    steps: [
      "Eerst de processor die v1 én v2 leest.",
      "Dan de producer die v2 schrijft.",
      "Na 24 uur retentie zonder v1 in omloop kan de oude decoder weg.",
    ],
  },
  practice: {
    title: "Wat het in de praktijk doet",
    intro: "Gemeten op een MacBook Pro uit 2019 met de hele stack in Docker Desktop, landelijke feed, geen filter op vervoerder. make throughput haalt deze cijfers rechtstreeks uit Prometheus.",
    tableCaption: "Maandagochtendspits 08:15–09:15",
    rows: [
      ["Berichten in, gemiddeld", "176 per seconde (piekminuut 347)"],
      ["Voertuigen in de feed per poll", "3.625; de snapshot-differ onderdrukte 45%"],
      ["Vensters gefinaliseerd", "2.739 per vijf minuten, 6.994 tegelijk open"],
      ["Consumer lag", "p50 nul; maximaal 3.806 direct na een herstart, binnen een minuut ingelopen"],
      ["Watermark lag", "170 seconden — 120 s toegestane vertraging plus ~50 s feedcadans"],
      ["Batchverwerking p95", "0,18 s voor een batch van 2.000 berichten, inclusief de state-upserts"],
      ["Ruw archief", "718 objecten, 30 MB gzip per uur in de spits; ~1 MB/uur 's nachts"],
    ],
    notesTitle: "Twee dingen die je alleen leert door het echt een nacht te laten draaien",
    notes: [
      {
        title: "De spits en de nacht schelen een factor honderd",
        body: "Om half twaalf 's avonds zijn het 50 tot 110 berichten per seconde en 1.400 voertuigen, om vier uur 's nachts twee berichten per seconde en twintig bussen — het dashboard zegt dat dan ook eerlijk in plaats van beweging te faken.",
      },
      {
        title: "Een slapende laptop is geen pipeline-storing",
        body: "Maar ziet er in Grafana precies zo uit: macOS wordt elk uur 45 seconden wakker voor onderhoud, wat één hoge piek per uur en een watermark lag van een half uur oplevert. make keep-awake staat inmiddels in de runbook.",
      },
    ],
    screenshots: [
      shot(
        "dashboard-detail",
        1000,
        "Onderste helft van het dashboard: een grafiek van de netwerkvertraging over de laatste drie uur in vensters van vijf minuten (P90 rond 2,5 minuut, gemiddelde rond 1 minuut), een staafdiagram met de gemiddelde vertraging per vervoerder, een histogram van de huidige vertraging over actieve ritten, en een health-strip met berichten per seconde in en verwerkt, consumer lag, watermark lag, vensters per uur, late events, DLQ per uur en archiefobjecten per uur.",
        "De detailpanelen: netwerktrend in vensters van vijf minuten, vertraging per vervoerder, verdeling over actieve ritten en de health-strip met de pipelinecijfers.",
      ),
      shot(
        "dashboard-night",
        1000,
        "Hetzelfde dashboard om 00:40 's nachts: 535 voertuigen live, 1.001 ritten met voorspelling, gemiddelde vertraging +0:48, 78% op tijd; de kaart is grotendeels leeg met voertuigen rond de grote steden, en de tabel met slechtste lijnen toont nachtbussen.",
        "Om 00:40 's nachts: 535 voertuigen in plaats van 4.600. Het dashboard laat de leegte zien in plaats van beweging te faken.",
      ),
    ],
  },
  choices: {
    title: "Ontwerpkeuzes, kort",
    intro: "Een paar afwegingen waar ik het langst over heb nagedacht.",
    items: [
      {
        title: "Pure-Python windowingengine, zonder Kafka-imports",
        body: "De vensterlogica kent geen broker. Daardoor zijn de tests deterministisch met synthetische reeksen — inclusief een venster dat met de hand is uitgerekend — en draait dezelfde engine ook de replay.",
      },
      {
        title: "Exacte P90 in plaats van een t-digest",
        body: "Een paar duizend waarnemingen per venster per sleutel maakt nearest-rank gratis, en het maakt een handberekende test mogelijk. Op echte schaal is dit het onderdeel dat je zou vervangen; de accumulator-interface verandert daar niet van.",
      },
      {
        title: "Extra dimensies in plaats van afleiden",
        body: "Netwerk-P90 kun je niet uit de P90's per lijn afleiden. Vier dimensies kosten één dict-insert elk, dus die worden gewoon apart bijgehouden.",
      },
      {
        title: "Statische GTFS via COPY en een atomische tabelwissel",
        body: "De zip van 220 MB gaat rechtstreeks in COPY, in stagingtabellen die daarna in één transactie worden omgewisseld. Lezers zien nooit een half geladen set. Een dagelijkse sleep-loop, geen Airflow — dit is een cron-sidecar, geen orkestratie.",
      },
      {
        title: "Python in plaats van Spark Structured Streaming",
        body: "Het simpelste dat windowing correct demonstreert. De overstap is een gedocumenteerde migratie, geen voorwaarde vooraf.",
      },
    ],
  },
  testing: {
    title: "Testen en observability",
    body: [
      "make test draait 106 unit tests zonder enige infrastructuur: de parser tegen opgenomen feeds — inclusief een fixture van gemengde kwaliteit en een met pure onzin — serde-rondgangen en elk SchemaError-pad, de snapshot-differ, vensterindeling, lateness, duplicaten, per-partitie watermarks, het handberekende venster, idempotentie van de sink, DLQ-headers, de offset-ledger en de SQL-invarianten van het dashboard.",
      "make test-integration draait tegen de draaiende stack: de dubbele-levering-test op echte Postgres, de atomische swap van de GTFS-loader, de dashboardqueries. In CI draaien lint en unit tests; de integratietests blijven lokaal.",
      "Prometheus scrapet elke service en Redpanda zelf. Grafana krijgt een geprovisioneerd dashboard van 26 panelen mee — throughput, consumer lag, watermark lag, DLQ-rate, late events, verwerkingstijd, state size en archiefvolume. make inject-bad publiceert twee vergiftigde berichten; binnen tien seconden zie je ze in make dlq-peek, op het Grafana-paneel en in de health-strip van het dashboard.",
    ],
    figure: shot(
      "grafana",
      1400,
      "Het geprovisioneerde Grafana-dashboard over de laatste drie uur: bovenaan tegels voor berichten in en verwerkt per seconde (142,5), consumer lag 0, watermark lag 3 minuten, DLQ per uur en late events 0; daaronder rijen met throughput per topic en per consumer, feed-entiteiten per poll, consumer lag per partitie, watermark lag, verwerkingstijd p95, dead-letter rate, late en dubbele events, gefinaliseerde vensters per vijf minuten, open vensters, snapshot-differ-sleutels en archiefobjecten per uur.",
      "Het Grafana-dashboard met 26 panelen: throughput, lag en latency, correctheid (DLQ, lateness, vensters) en state en archief.",
    ),
  },
  shows: {
    title: "Wat dit project laat zien",
    skills: [
      "Kafka en event-driven ontwerp",
      "Streamwindowing met watermarks en lateness",
      "At-least-once met idempotente sinks",
      "Dead-letter queues en replay",
      "Schema-evolutie",
      "Postgres",
      "Docker Compose",
      "Prometheus en Grafana",
      "Streamlit en pydeck",
    ],
    closing: "Of korter: een pipeline waarvan ik kan uitleggen wat er gebeurt als hij omvalt.",
  },
};

const en: PageContent = {
  eyebrow: "Own project · 3 weeks",
  title: "Real-time public transport streaming pipeline on Kafka",
  lead: "Every vehicle in Dutch public transport, streamed live — from GTFS-realtime feed to a map of the whole country, with the correctness guarantees to go with it.",
  intro: [
    "Two files on an open endpoint contain, every minute, where roughly 4,900 vehicles are and how late they are. Turning that into a dashboard is an afternoon's work. Turning it into a pipeline that runs 24 hours a day, produces the right numbers after a crash, doesn't silently lose broken messages, and lets you recompute an hour from the past — that is a different project.",
    "This is that second project. A producer that turns snapshots into change events, Redpanda as the bus, a stream processor with tumbling windows and per-partition watermarks, a raw archive in MinIO you can replay from, Postgres as the serving layer and a live map on top. Thirteen containers, one make up, no accounts and no keys.",
  ],
  facts: [
    "Python 3.12",
    "Kafka (Redpanda)",
    "Postgres",
    "MinIO",
    "Prometheus + Grafana",
    "Streamlit + pydeck",
    "Docker Compose",
  ],
  stats: [
    { label: "Morning rush", value: "176 messages/s" },
    { label: "Windows", value: "5 min · 4 dimensions" },
    { label: "Tests", value: "106, no infra" },
    { label: "Cost", value: "Zero, fully local" },
  ],
  ui: {
    repo: "View the code on GitHub",
    allProjects: "All projects",
    back: "Back to projects",
    dataSource: "Data source",
    dataSourceName: "OVapi GTFS-realtime, open access without a key",
    links: "Links",
  },
  hero: shot(
    "dashboard",
    1000,
    "The live NL OV Delay Monitor dashboard in the morning rush: six KPI tiles (4,616 vehicles live, 6,628 trips with a prediction, mean delay +1:01, P90 +2:40, 70% on time, worst line +60:00), a map of the Netherlands with thousands of coloured vehicle positions, and on the right a table of the worst lines in the last window.",
    "The dashboard on a Monday morning at 08:24: 4,616 vehicles on the map, the KPIs of the last closed window and that window's worst lines. Interface labels are in English; diagrams on this page are in Dutch.",
  ),
  why: {
    title: "Why this project",
    body: [
      "You don't learn streaming from a tutorial with a for loop over a list. The interesting things only happen once real time is involved: events arriving late, partitions drifting apart, a process falling over between two writes, a feed that doesn't follow its own documentation.",
      "I wanted to run into those things instead of reading about them. A nationwide, public, always-on data source forces that — and produces something you can show at the same time.",
    ],
  },
  architecture: {
    title: "Architecture",
    figure: diagram(
      "ov-1-architectuur",
      "Architecture diagram (labels in Dutch): OVapi GTFS-RT (vehiclePositions every 20 s, tripUpdates every 60 s) → producer (parse protobuf, diff snapshots, heartbeat, backoff) → Redpanda with the topics vehicle_positions and arrival_predictions (6 partitions) and two DLQ topics, 24-hour retention. Two consumer groups: the processor (5-minute tumbling windows, per-partition watermarks, 2 minutes allowed lateness, count/mean/P90/max/min over line, stop, operator and network) writes to Postgres with idempotent upserts; the archiver writes raw bytes as gzip JSON lines to MinIO. A gtfs-static sidecar loads the reference data daily via COPY and an atomic swap. The Streamlit dashboard reads Postgres; Prometheus scrapes everything; replay runs archive files through the same Pipeline class.",
      "The chain from left to right: two feeds in, two consumer groups, one serving layer. Diagram labels are in Dutch.",
    ),
    body: [
      "The chain runs from left to right. The producer fetches two protobuf feeds, parses them into a versioned event contract and publishes to two Kafka topics. Two independent consumer groups read along: the processor computes windows and writes to Postgres, the archiver writes the raw bytes to MinIO. A sidecar loads the static GTFS reference data daily. The dashboard sits on Postgres, Prometheus scrapes everything.",
    ],
    choicesTitle: "Two architectural choices determine the rest of the design",
    choices: [
      {
        title: "The broker is a buffer, not an archive",
        body: "Retention on the raw topics is 24 hours. What you still need a month from now lives in MinIO, as bytes — not as parsed events. That distinction looks small and isn't: because the archive keeps bytes, you can run a new decoder over it later. Had you stored parsed events, you would have frozen that day's interpretation forever.",
      },
      {
        title: "Two consumer groups instead of one service doing both",
        body: "Archiving and processing have different failure modes and different speeds. If MinIO is briefly gone, the processor has to keep going — and the other way round.",
      },
    ],
  },
  producer: {
    title: "The problem the producer solves",
    body: [
      "Both feeds are FULL_DATASET snapshots: every minute the complete picture comes by again. Publish that directly and you're at around 700 messages per second that are mostly repetition.",
      "So the producer diffs every snapshot against the previous one and publishes only what changed. In the morning rush that suppresses about 45% of the entities per poll. To stop a train that has been sitting at +5:00 for twenty minutes from disappearing from the statistics, a heartbeat goes out every sixty seconds. The result: five to twenty times fewer messages, with identical window figures.",
    ],
    callouts: [
      { value: "45%", label: "of entities per poll suppressed in the rush hour" },
      { value: "5–20×", label: "fewer messages, with identical window figures" },
      { value: "60 s", label: "heartbeat, so a standing delay keeps counting" },
    ],
    quirksTitle: "What the feed doesn't document",
    quirks: [
      "Entity ids like 2026-09-06:GVB:13:13605 contain the operator code, which appears nowhere else in the message — so it's parsed out of the id.",
      "VehiclePosition carries no delay; that lives in TripUpdate.",
      "Ghost vehicles roam the feed: a bus STOPPED_AT the same spot for eleven days, and one vehicle reporting from 29 minutes in the future.",
      "Positions older than ten minutes or more than a minute ahead are dropped.",
    ],
    quirksNote: "All of those cases are captured in recorded protobuf fixtures in the repo: 140 KB that pins every parser test to reality.",
  },
  windows: {
    title: "Windows, watermarks and late events",
    figure: diagram(
      "ov-2-vensters-watermarks",
      "Watermark diagram (labels in Dutch): six partitions each with their maximum event time; the slowest (p2, 10:12:40) sets the minimum, a partition silent for 130 s is left out; min minus 120 s allowed lateness gives watermark 10:10:40. On the event-time axis the windows 10:00–10:05 and 10:05–10:10 are finalised, 10:10–10:15 and 10:15–10:20 are open. An event with event time 10:07 arriving now is late: counted and dropped.",
      "The watermark comes from the slowest active partition, not the fastest. A window closes as soon as the watermark reaches its end. Diagram labels are in Dutch.",
    ),
    body: [
      "The processor computes five-minute tumbling windows, aligned to the epoch, over four dimensions at once: line, stop, operator and network. Per window: count, mean, exact P90, max and min.",
      "The watermark is where the real work is. First version: one global maximum over all events received. That worked fine until a forty-minute catch-up came along — the six partitions were consumed at different speeds, the fastest pulled the watermark ahead, and 169,000 perfectly normal events from the slower partitions were labelled “late” and dropped.",
      "Events behind the watermark are counted and dropped. That's an explicit trade-off: bounded state and exactly one emission per window, in exchange for ignoring anything more than two minutes behind. In practice that number is zero, because the event time is the feed's own generation time and it increases monotonically.",
    ],
    lessonsTitle: "Three lessons that shaped the watermark",
    lessons: [
      {
        title: "Per partition, not global",
        body: "The fix is what Flink does: a watermark per partition, and the minimum of those counts. That way a fast partition can never invalidate the events of a slow one.",
      },
      {
        title: "A silent partition doesn't count",
        body: "Otherwise a partition that stops sending holds the watermark back forever and no window ever closes again. After 120 seconds of silence a partition is left out until it speaks again.",
      },
      {
        title: "And when the whole country goes quiet",
        body: "Between 01:00 and 05:00 there are twenty to thirty night buses running. Without intervention the last window never closes, because no event arrives to push the watermark forward. After ninety seconds of silence the processor advances the watermark on the wall clock.",
      },
    ],
  },
  delivery: {
    title: "At-least-once, made safe by idempotence",
    figure: diagram(
      "ov-3-at-least-once",
      "Diagram in three parts (labels in Dutch). The order: poll batch, decode and count, update the watermark, UPSERT finalised windows into Postgres, release the ledger, and only then COMMIT the offsets — step 4 before step 6, always. The per-partition offset ledger: (offset, window_end) in arrival order; offset 103 belongs to an open window, so the commit stops there even though offset 104 is already finalised. Crash between upsert and commit: window 10:05–10:10 is upserted with count 412, the process dies, the broker redelivers, the processor recomputes the same count and the upsert on the primary key replaces the row instead of adding to it.",
      "Commit after the upsert, and an upsert key equal to the window key: double counting is impossible. Diagram labels are in Dutch.",
    ),
    body: [
      "Exactly-once delivery is deliberately not pursued. The cheaper guarantee gives the same answer, without transactional machinery.",
      "The order is: process, upsert the finalised windows, and only then commit the offsets. If the process dies between those two steps, the broker redelivers the same messages, the processor recomputes the same window from the same events, and writes it under the same key. The primary key of delay_aggregates is (window_start, dimension, dimension_id) — the upsert replaces the row with identical values instead of adding to it. Double counting is therefore impossible.",
    ],
    detailsTitle: "Two details make that watertight instead of roughly right",
    details: [
      {
        title: "Offsets never run ahead of open windows",
        body: "Per partition the processor keeps the consumed (offset, window_end) pairs in arrival order, and commits one past the longest contiguous prefix whose windows are all closed. If a message halfway through still belongs to an open window, the commit stops there — even if finalised windows sit behind that message. Everything in an open window is redelivered after a crash and rebuilds that window from scratch.",
      },
      {
        title: "The watermark is seeded from Postgres at startup",
        body: "max(window_end) makes redelivered messages that belong to an already-written window count as late, instead of a partial window being written over a complete one. That seed is clamped to the wall clock — a lesson from practice: once, a replay that was still running seeded the watermark into the future, after which 130,000 good events were dropped.",
      },
    ],
    proof: {
      test: "test_duplicate_delivery_does_not_double_count_in_real_postgres",
      body: "applies the same finalised window twice against the real database and checks that there is one row, with the original count.",
    },
  },
  failure: {
    title: "When things go wrong",
    figure: diagram(
      "ov-4-dlq-en-replay",
      "Diagram in two halves (labels in Dutch). Dead letters: a parse error in the producer (vehicle without a position, without a trip id, coordinates at 0,0) or a decode error in the processor (unknown schema version) goes to dlq.<source_topic> as the original bytes with headers stage, source_topic, source_partition, source_offset, error, failed_at and schema_version; visible within 10 s in make dlq-peek, Grafana and the health strip; each (entity, reason) once. make replay-dlq reruns the failed step with the current code: successes go back to the source topic with a replayed_from header, still-broken ones stay. Replay from the archive: MinIO files per topic/date/hour carrying the exact offset range, make replay FROM TO, the same Pipeline class as the consumer, dedupe on (topic, partition, offset), partially covered windows skipped, idempotent upsert.",
      "Nothing blocks the main loop. Whatever can't be processed is set aside with enough context to do it later. Diagram labels are in Dutch.",
    ),
    body: [
      "Anything that can't be parsed (producer) or decoded (processor) goes to dlq.<source_topic> as the original bytes, with headers for stage, source topic, partition, offset, error, timestamp and schema version. The main loop never blocks.",
      "One detail you only discover by running it: parse errors repeat every minute, because the feed simply sends the same broken entity again. Without a countermeasure your DLQ fills up with the same message a thousand times. So the producer dead-letters each unique combination of entity and reason once.",
    ],
    pathsTitle: "Two recovery paths",
    paths: [
      {
        command: "make replay-dlq",
        title: "The failed step again, with the current code",
        body: "A parser fix, a new schema version. Whatever now succeeds goes back into the source topic with a replayed_from header; whatever is still broken stays and is summarised per reason.",
      },
      {
        command: "make replay FROM=… TO=…",
        title: "Recompute a time range from the MinIO archive",
        body: "Replay runs through the same Pipeline class as the live consumer. No second implementation of the windowing logic — if there were, you'd be testing two things and trusting one.",
      },
    ],
    measured: "Measured: 122,364 archived messages from twelve minutes of morning rush, recomputed into 11,323 windows in about ten seconds.",
  },
  schema: {
    title: "Schema evolution",
    body: [
      "SCHEMA_VERSION is in the body of every message and in a Kafka header, so a consumer can route on version without parsing the body. Backwards-compatible changes — an optional field with a default — don't bump the version. Removing, renaming or retyping a field does.",
      "common.serde keeps a decoder per supported version, and the processor accepts the current and the previous one. An unknown version is a SchemaError — so the DLQ, never a crash. And because the archive keeps bytes rather than events, a new decoder can always be run over the history.",
    ],
    stepsTitle: "Rolling out a new version without breaking the pipeline",
    steps: [
      "First the processor that reads v1 and v2.",
      "Then the producer that writes v2.",
      "After 24 hours of retention with no v1 in circulation, the old decoder can go.",
    ],
  },
  practice: {
    title: "What it does in practice",
    intro: "Measured on a 2019 MacBook Pro with the whole stack in Docker Desktop, nationwide feed, no operator filter. make throughput pulls these figures straight from Prometheus.",
    tableCaption: "Monday morning rush 08:15–09:15",
    rows: [
      ["Messages in, average", "176 per second (peak minute 347)"],
      ["Vehicles in the feed per poll", "3,625; the snapshot differ suppressed 45%"],
      ["Windows finalised", "2,739 per five minutes, 6,994 open at once"],
      ["Consumer lag", "p50 zero; at most 3,806 right after a restart, caught up within a minute"],
      ["Watermark lag", "170 seconds — 120 s allowed lateness plus ~50 s feed cadence"],
      ["Batch processing p95", "0.18 s for a batch of 2,000 messages, including the state upserts"],
      ["Raw archive", "718 objects, 30 MB gzip per hour in the rush; ~1 MB/hour at night"],
    ],
    notesTitle: "Two things you only learn by actually letting it run through a night",
    notes: [
      {
        title: "Rush hour and night differ by a factor of a hundred",
        body: "At half past eleven at night it's 50 to 110 messages per second and 1,400 vehicles; at four in the morning two messages per second and twenty buses — and the dashboard says so honestly instead of faking movement.",
      },
      {
        title: "A sleeping laptop is not a pipeline outage",
        body: "But it looks exactly like one in Grafana: macOS wakes up for 45 seconds of maintenance every hour, which produces one tall spike per hour and a watermark lag of half an hour. make keep-awake is in the runbook now.",
      },
    ],
    screenshots: [
      shot(
        "dashboard-detail",
        1000,
        "Lower half of the dashboard: a chart of network delay over the last three hours in five-minute windows (P90 around 2.5 minutes, mean around 1 minute), a bar chart of mean delay per operator, a histogram of current delay across active trips, and a health strip with messages per second in and processed, consumer lag, watermark lag, windows per hour, late events, DLQ per hour and archive objects per hour.",
        "The detail panels: network trend in five-minute windows, delay per operator, distribution across active trips and the health strip with the pipeline figures.",
      ),
      shot(
        "dashboard-night",
        1000,
        "The same dashboard at 00:40 at night: 535 vehicles live, 1,001 trips with a prediction, mean delay +0:48, 78% on time; the map is largely empty with vehicles around the big cities, and the worst-lines table shows night buses.",
        "At 00:40 at night: 535 vehicles instead of 4,600. The dashboard shows the emptiness instead of faking movement.",
      ),
    ],
  },
  choices: {
    title: "Design choices, briefly",
    intro: "A few trade-offs I thought about the longest.",
    items: [
      {
        title: "Pure-Python windowing engine, no Kafka imports",
        body: "The window logic knows no broker. That makes the tests deterministic with synthetic sequences — including a window computed by hand — and the same engine also runs the replay.",
      },
      {
        title: "Exact P90 instead of a t-digest",
        body: "A few thousand observations per window per key makes nearest-rank free, and it makes a hand-computed test possible. At real scale this is the part you'd replace; the accumulator interface doesn't change for it.",
      },
      {
        title: "Extra dimensions instead of deriving",
        body: "You can't derive the network P90 from the per-line P90s. Four dimensions cost one dict insert each, so they're simply tracked separately.",
      },
      {
        title: "Static GTFS via COPY and an atomic table swap",
        body: "The 220 MB zip goes straight into COPY, into staging tables that are then swapped in a single transaction. Readers never see a half-loaded set. A daily sleep loop, no Airflow — this is a cron sidecar, not orchestration.",
      },
      {
        title: "Python instead of Spark Structured Streaming",
        body: "The simplest thing that demonstrates windowing correctly. The switch is a documented migration, not a precondition.",
      },
    ],
  },
  testing: {
    title: "Testing and observability",
    body: [
      "make test runs 106 unit tests without any infrastructure: the parser against recorded feeds — including a mixed-quality fixture and one of pure nonsense — serde round trips and every SchemaError path, the snapshot differ, window assignment, lateness, duplicates, per-partition watermarks, the hand-computed window, sink idempotence, DLQ headers, the offset ledger and the dashboard's SQL invariants.",
      "make test-integration runs against the live stack: the duplicate-delivery test on real Postgres, the GTFS loader's atomic swap, the dashboard queries. CI runs lint and unit tests; the integration tests stay local.",
      "Prometheus scrapes every service and Redpanda itself. Grafana ships with a provisioned dashboard of 26 panels — throughput, consumer lag, watermark lag, DLQ rate, late events, processing time, state size and archive volume. make inject-bad publishes two poisoned messages; within ten seconds you see them in make dlq-peek, on the Grafana panel and in the dashboard's health strip.",
    ],
    figure: shot(
      "grafana",
      1400,
      "The provisioned Grafana dashboard over the last three hours: tiles at the top for messages in and processed per second (142.5), consumer lag 0, watermark lag 3 minutes, DLQ per hour and late events 0; below, rows with throughput per topic and per consumer, feed entities per poll, consumer lag per partition, watermark lag, processing time p95, dead-letter rate, late and duplicate events, windows finalised per five minutes, open windows, snapshot-differ keys and archive objects per hour.",
      "The Grafana dashboard with 26 panels: throughput, lag and latency, correctness (DLQ, lateness, windows) and state and archive.",
    ),
  },
  shows: {
    title: "What this project shows",
    skills: [
      "Kafka and event-driven design",
      "Stream windowing with watermarks and lateness",
      "At-least-once with idempotent sinks",
      "Dead-letter queues and replay",
      "Schema evolution",
      "Postgres",
      "Docker Compose",
      "Prometheus and Grafana",
      "Streamlit and pydeck",
    ],
    closing: "Or shorter: a pipeline where I can explain what happens when it falls over.",
  },
};

export const CONTENT: Record<Locale, PageContent> = { nl, en };
