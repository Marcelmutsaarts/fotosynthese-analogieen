# Fotosynthese begrijpen

Een eenvoudige HTML-app van AIvoordocenten voor klas 2 VO. Eén leeractiviteit per scherm. Open index.html rechtstreeks in een browser of publiceer de map als statische website.

## Leerroute

1. Kies één bekende vergelijking: koken, gamen of bouwen.
2. Beantwoord een vraag over dat bekende voorbeeld.
3. Koppel energie, grondstoffen en product aan de plant. Beide beelden staan naast elkaar; na een goed antwoord worden de overeenkomstige onderdelen uitgelicht. Maak daarna zelf een vergelijkende zin af.
4. Benoem waar de vergelijking ophoudt.
5. Pas het begrip toe op een plant zonder licht en een plant zonder CO₂.
6. Schrijf een biologische uitleg. Vergelijk die daarna met een voorbeeld en pas je tekst aan.

De beelden tonen de functies in dezelfde posities: grondstoffen links, omzetting midden, product rechts en energie bovenaan. Glucose en zuurstof zijn de producten in de plant. De vergelijking met koken betreft de rol van energie en grondstoffen; fotosynthese gebruikt lichtenergie en is geen verhitten. Bouwen vergelijkt het combineren van bestaande bouwstenen, terwijl de plant chemische reacties uitvoert.

## Presentator

Gebruik de gepubliceerde app met ?presentator=1. Alleen daar staat bovenaan de knop ‘Presentator · didactiek’. De knop opent een korte uitleg bij de huidige leerstap. Er is geen apart dashboard of automatisch geopende toelichting.

De presentatorroute start steeds opnieuw en schrijft niet naar de voortgang van de leerling. De leerlingweergave bevat geen docentteksten, bronnen, scoreoverzichten of links naar andere lesonderdelen.

## Versie 4 — 21 oktober 2026

De eerdere combinatie van vijf contexten, plantlab, begripscheck, verwijzingen en presentatorpanelen is vervangen door één begeleide route. Koken, gamen en bouwen ondersteunen hetzelfde kernbegrip. De uitstapjes naar energieopslag en celademhaling via muziek en fietsen zijn uit deze app gehaald.

Bestaande gegevens uit eerdere versies blijven onaangeroerd in de lokale browseropslag. De nieuwe route gebruikt een eigen opslagcode. Een afgeronde uitleg wordt per gekozen vergelijking lokaal bewaard; een volgende route kan opnieuw beginnen. De app stuurt geen antwoorden naar een server. Meerkeuzefeedback is vooraf geschreven; vrije tekst wordt door de lerende zelf met een voorbeeld vergeleken.

## Onderwijskundige basis

De route vertaalt het [Teaching-with-Analogies-model van Glynn (1994)](https://files.eric.ed.gov/fulltext/ED373306.pdf) naar een concrete leeractiviteit: een afgebakend leerdoel, een bekend voorbeeld, expliciete koppelingen, grenzen, actief vergelijken en terugkeer naar de leerstof.

De biologische inhoud sluit aan bij de uitleg over [fotosynthese van de Royal Forestry Society](https://rfs.org.uk/learning/tremendous-trees/photosynthesis/) en over [lichtgebruik door planten van de RHS](https://www.rhs.org.uk/advice/understanding-plants/how-plants-use-light-to-grow).

## Bestanden en controle

- index.html: pagina en dialoog voor de presentator.
- styles.css: vormgeving voor groot en klein scherm.
- art.js: illustraties.
- app.js: inhoud, leerroute en lokale opslag.
- tests/learning-flow.cjs: browsercontrole van alle routes, feedback, koppelingen, grenzen, transfer, eigen uitleg, opslag, toetsenbord en mobiel.

De controle gebruikt Node.js en Playwright met Chrome. BASE_URL kan naar een lokale server of de publicatie verwijzen. Zonder instelling wordt http://127.0.0.1:8674 gebruikt.

Vercel publiceert de gekoppelde GitHub-repository als statische site, zonder buildstap of externe afhankelijkheden.
