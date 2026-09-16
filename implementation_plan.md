# Implementačný plán: Hviezdna brána

Cieľom je preniesť stránku stargate.php (Hviezdna brána) do našej Vue aplikácie bez pôvodného ťažkopádneho DHD terminálu a vytvoriť moderné a plynulé vytáčanie priamo na mobile.

## 1. Proxy (Backend)
- Vytvoríme nový súbor proxy/routes/stargate.routes.js.
- Bude slúžiť na stiahnutie stargate.php, z ktorého vyparsujeme **všetky dostupné adresy brán**, ktoré môže hráč zadať.
- Pridáme POST endpoint na samotné odoslanie sekvencie (na vykonanie akcie vytočenia 1:1 ako v pôvodnej hre).

## 2. Frontend UI (Vue)
- Vytvoríme StargateView.vue.
- Namiesto pôvodného terminálu vytvoríme **čistý zoznam adries** (napríklad v štýle roletky / dropdownu alebo zoznamu kariet).
- Hráč si vyberie adresu a stlačí tlačidlo **"Zadať sekvenciu"**.
- Pod zoznamom sa zobrazí vybraná sekvencia znakov.

## 3. Animácia a Vytáčanie
- Na obrazovke bude obrázok samotnej Hviezdnej brány (stargate.png).
- Spustenie sekvencie vyvolá animáciu, ktorá bude pomocou Vue a CSS3 (	ransform: rotate) postupne otáčať bránou.
- Pre každý znak z adresy sa brána otočí na daný uhol, "uzamkne" znak a **tento znak v sekvencii na obrazovke sa rozsvieti nazeleno**.
- Keď sú všetky znaky vytočené (štandardne 7), prehrá sa **animácia víru** (napr. zobrazením originálneho gifu víru v strede brány).
- Následne sa automaticky zavolá proxy na potvrdenie vytočenia na server a hráč uvidí rovnaký výsledok akcií ako v origináli.

## Čo potrebujem od teba na začiatok:
Keďže pôvodný kód stránky momentálne nemám k dispozícii a naša proxy si už relácie neukladá na disku:
1. **Prosím ťa, otvor si v prehliadači originálnu hru, choď na stránku Hviezdnej brány (stargate.php), stiahni celú stránku (HTML) a ulož mi ju do zložky projektu ako 	est_stargate.html.** 
2. Tento súbor obsahuje presné uhly pre jednotlivé symboly a taktiež originálny JavaScript, z ktorého presne okopírujem tú rotáciu, aby to bolo 1:1 ako si mal!

Akonáhle to urobíš, pustím sa okamžite do vývoja. Súhlasíš s týmto plánom?
