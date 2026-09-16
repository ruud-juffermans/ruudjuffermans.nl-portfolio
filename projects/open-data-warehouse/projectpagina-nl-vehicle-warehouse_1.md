# nl-vehicle-warehouse

**Een end-to-end datawarehouse op Nederlandse open data — van API tot Power BI, met een sterschema dat de vragen aankan.**

---

## Hero / intro

Twee publieke bronnen, één datawarehouse. RDW-voertuigdata levert feiten op recordniveau, CBS StatLine levert een periodieke snapshot per gemeente. Die twee samenbrengen in één dimensioneel model klinkt eenvoudig, tot je merkt dat ze een verschillende grain hebben, dat Nederland bijna elk jaar herindeelt, en dat de bron zich niet aan zijn eigen schema houdt.

Dit project is de uitwerking daarvan: Python-ingestie, een dbt-project met staging, sterschema en marts, datakwaliteitstests die bij elke pull request draaien, en een Power BI-rapport dat rechtstreeks op het schema staat. Gebouwd zoals een platformteam het oplevert — met versiebeheer, code review en een lineage die klopt.

*Korte feiten voor onder de intro:* Python · dbt · DuckDB · Power BI · GitHub Actions — 2 feittabellen, 5 dimensies, 1 bridge — 2,8 miljoen rijen in de standaardrun.

---

## Waarom dit project

Portfolioprojecten met data blijven vaak steken bij "een CSV inlezen en een grafiek maken". Wat een datawarehouse moeilijk maakt zit ergens anders: in de keuzes die je maakt vóórdat er een dashboard is. Op welke grain staat een feit. Wat doe je met een dimensie die verandert. Hoe zorg je dat een collega dezelfde cijfers krijgt als jij.

Ik wilde een project waarin die keuzes zichtbaar zijn en verdedigd worden, niet weggepoetst. Elke ontwerpkeuze staat in de repository gedocumenteerd, inclusief de dingen die niet konden.

---

## De bronnen

| Bron | Wat | Rol in het model |
| --- | --- | --- |
| RDW open data (Socrata) | gekentekende voertuigen, brandstof, geconstateerde gebreken, gebrekcodes | transactiefeiten op recordniveau |
| CBS StatLine (odata) | motorvoertuigenpark per gemeente en de gemeentelijke indeling per jaar | snapshotfeit + gemeentedimensie |

De combinatie is bewust gekozen. Twee feiten met een verschillende grain in één schema is precies waar dimensioneel modelleren over gaat — en waar het misgaat als je de grain niet expliciet maakt.

---

## Architectuur

> **[DIAGRAM 1 — nl-vehicle-warehouse-1-architectuur]**

De keten is opzettelijk saai en lineair. Python haalt de bronnen op en schrijft ze weg als parquet in `data/raw/`, zonder ook maar iets te wijzigen. dbt leest dat als source, typeert en hernoemt in `staging/`, bouwt daaruit het sterschema in `warehouse/`, en beantwoordt de businessvragen in `marts/`. Power BI staat op het sterschema, niet op de bron.

Die scheiding is niet cosmetisch. Omdat `data/raw/` een letterlijke kopie van de bron is, kan een fout in de transformatie nooit stilletjes in de ingestie verdwijnen — hij is altijd terug te vinden in een dbt-model dat in git staat en in code review is gegaan.

DuckDB als warehouse: nul kosten, draait in CI, en één bestand om te reviewen. Hetzelfde dbt-project richt zich met een ander profiel op Snowflake of Databricks; buiten `staging/` staat er geen DuckDB-specifieke SQL. De keuze voor een warehouse is geen onderdeel van de modellering, en dat is precies het punt.

---

## Het lastigste stuk zat in de ingestie

De drie grote RDW-sets zijn samen ongeveer 58 miljoen rijen. Daar een snapshot uit nemen is geen probleem. Er *drie* snapshots uit nemen wel.

De sets zijn allemaal op kenteken gesleuteld. De eerste 500.000 rijen van elke set pakken levert drie verschillende voertuigpopulaties op: de gebrekenset heeft meerdere rijen per voertuig en beslaat dus een veel smaller kentekenbereik dan de voertuigenset. Het gevolg is dat feiten naar dimensierijen wijzen die niet in de snapshot zitten, en dat geen enkele `relationships`-test standhoudt. Je hebt dan een dataset die er goed uitziet en niet klopt.

De oplossing is één bereik bepalen op de voertuigenset — gesorteerd op kenteken, positie 0 en positie 499.999 — en alle andere sets op datzelfde bereik ophalen. Het bereik is deterministisch, dus de run is reproduceerbaar zolang de bron niet wijzigt, en het gekozen bereik wordt vastgelegd in een manifest dat wél in git staat. Opschalen naar de volledige set is één variabele.

Het resultaat is te controleren: nul weesrijen in brandstof, nul weesrijen in gebreken, alle 622 gebruikte gebrekcodes aanwezig in de codelijst.

Twee kleinere keuzes hielden het schema stabiel. Alle kolommen worden als string ingelezen, omdat de bronnen JSON leveren zonder betrouwbare typering — typeren hoort in dbt, waar het getest wordt. En de kolomlijst wordt vooraf uit de datasetmetadata gehaald in plaats van uit de respons: Socrata laat lege velden gewoon weg, waardoor verschillende pagina's verschillende sleutels opleveren en het samenvoegen van batches omklapt op schemaverschillen. De voertuigenset lijkt 52 kolommen te hebben en heeft er 98.

---

## Het model

> **[DIAGRAM 2 — nl-vehicle-warehouse-2-sterschema]**

Per feittabel staat de grain expliciet in de documentatie — één zin, geen interpretatie mogelijk.

`fct_gebrek_constatering` staat op *één geconstateerd gebrek per keuring per voertuig*. Daardoor is gebreken tellen gewoon `count(*)`. De bronkolom met het keuringtotaal is bewust weggelaten: die herhaalt hetzelfde getal op elke regel van dezelfde keuring, en een `sum()` daarover telt dubbel. Dat is het soort fout dat niemand opmerkt tot een stuurgroep vraagt waarom een getal niet klopt.

`fct_voertuigpark_gemeente` staat op *één gemeente per peiljaar per voertuigsoort* — een periodieke snapshot naast een transactiefeit, met `dim_datum` als gedeelde dimensie.

De bridge verdient een aparte vermelding: 12.671 voertuigen in de snapshot hebben meer dan één brandstof. Zonder brugtabel tel je die dubbel zodra iemand filtert op energiedrager. In Power BI staat diezelfde bridge als many-to-many met één bidirectioneel kruisfilter, zodat het rapport zich net zo gedraagt als het warehouse.

---

## Waarom de gemeentedimensie SCD type 2 is

> **[DIAGRAM 3 — nl-vehicle-warehouse-3-scd2]**

Nederland ging van 393 gemeenten in 2015 naar 342 in 2026. Het verschil tussen twee CBS-gebiedsbestanden ís de herindeling die je moet vastleggen.

Zonder een dimensie met geldigheidsperioden hangt het cijfer van 2016 aan de gemeente zoals die vandaag heet. Historische stuurinformatie verschuift dan met terugwerkende kracht, en er komt geen foutmelding — de query draait gewoon door. Dat is de stille variant van een datafout, en de vervelendste.

De dimensie wordt opgebouwd met een `lag()` over peiljaar per gemeentecode: elke naamswijziging markeert een nieuwe versie, en de lopende som over die markeringen is het versienummer. Het feit joint niet op code alleen, maar op code én peildatum binnen de geldigheidsperiode. Drie eigen tests bewaken dat de perioden aaneengesloten zijn, elkaar niet overlappen en dat er hoogstens één actuele versie per gemeente bestaat.

---

## Wat níet kon, en waarom dat in de documentatie staat

De beoogde grain voor het snapshotfeit was gemeente per peiljaar per *brandstofsoort*. Die bestaat niet bij CBS. De tabel met de brandstofsplitsing gaat niet lager dan provincie; de tabel met 728 gemeenten splitst alleen naar voertuigsoort. Gemeente × brandstof kan alleen door cijfers te verzinnen.

Beide tabellen zijn opgehaald en de keuze staat uitgeschreven in de repository: het is gemeente × voertuigsoort geworden, omdat de temporele koppeling aan de SCD2-dimensie het punt van dit feit is. De ongebruikte tabel is een bewuste keuze, geen vergeten bestand.

Ik vind dit het belangrijkste stuk documentatie in het project. Een model waarvan de beperkingen opgeschreven zijn, is bruikbaar. Een model waarvan ze niet opgeschreven zijn, wordt vroeg of laat verkeerd gebruikt.

---

## Kwaliteit en CI

Bij elke pull request draait GitHub Actions: `ruff` op de Python, `sqlfluff` op de dbt-modellen, `dbt build` met modellen én tests, en `dbt docs generate` waarvan het resultaat als artifact bewaard blijft.

De tests zijn `unique` en `not_null` op elke sleutel, `relationships` van elke foreign key naar zijn dimensie, `accepted_values` op de referentiekolommen, plus eigen tests op de grain — geen dubbele rijen per graindefinitie.

CI draait niet op de volledige snapshot maar op kleine fixtures die wel in git staan, zodat een pull request in een paar minuten groen of rood is. Hetzelfde commando is lokaal te draaien met één `make ci`: CI kan niets wat jij niet kunt.

---

## Power BI

Het rapport beantwoordt drie vragen rechtstreeks op het sterschema: het voertuigpark per gemeente en peiljaar inclusief heringedeelde gemeenten, de top-gebreken per voertuigsoort en bouwjaar met een energiedrager-slicer, en de aansluiting tussen de RDW-steekproef en het CBS-park.

Het semantisch model spiegelt het schema en repareert het niet. Relaties staan 1:* van dimensie naar feit met enkelzijdig kruisfilter, de SCD2-dimensie hangt via de surrogaatsleutel aan het feit zodat de temporele join uit het warehouse behouden blijft, en de DAX-measures zijn gekruist met `dbt show`. Een rapport dat het model omzeilt is een tweede model — en dan heb je twee waarheden.

---

## Wat dit project laat zien

Dimensioneel modelleren volgens Kimball, ELT met dbt, reproduceerbare ingestie in Python, datakwaliteitstests, een CI/CD- en PR-workflow, en een warehouse-opzet die overzet naar een cloudplatform.

Of korter: de cijfers zijn navolgbaar, de keuzes zijn opgeschreven, en iemand anders kan het draaien.

---

## Links

- Repository: github.com/datavakwerk/nl-vehicle-warehouse
- Documentatie van de data en de steekproefopzet: `docs/data.md` in de repo
- Bronnen: RDW open data (opendata.rdw.nl) en CBS StatLine (opendata.cbs.nl)
