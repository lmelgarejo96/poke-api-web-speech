// variables & constants
const limit = 12;
let offset = 0;

// Elements
const container = document.querySelector(".poke-list");
const pagination = document.querySelector(".pagination");
const loader = document.querySelector(".loader");
const overlay = document.querySelector(".overlay");

// events
overlay.addEventListener("click", closeCards)

// functions
async function getPokemonsList(link, counter) {
    link = link ? link.trim() : null;
    container.innerHTML = "";
    loader.classList.add("active");
    const res = await fetch(link ? link : `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`)
    const data = await res.json();
    renderPokemons(data);
    offset += counter ? counter : 0;
    renderPaginationElements(data.previous, data.next, data.count, offset + limit);
}

function renderPaginationElements(prev, next, total, counter) {
    const elements = `
    <div class="buttons">
        <div class="prev">
            <button ${prev ? ``: 'disabled'} onclick="getPokemonsList('${prev}', ${- limit})" type="button">
            <i class="fas fa-angle-left"></i>
            </button>
        </div>
        <div class="next">
            <button ${next ? ``: 'disabled'}  onclick="getPokemonsList('${next}', ${limit})" type="button">
                <i class="fas fa-angle-right"></i>
            </button>
        </div>
        
    </div>
    <small>${counter} de ${total}</small>
    `
    pagination.innerHTML = elements;
}


async function renderPokemons(data) {

    const promises = data.results.map((pokemon) => {
        return getPokemon(pokemon.url)
    });

    const pokemons = await Promise.all(promises);

    pokemons.forEach((p) => {
        container.innerHTML += getHTMLPokemon(p);
    })

    loader.classList.remove("active");

    addListennersOnCard();
}

async function getPokemon(link) {

    const res = await fetch(link);
    const data = await res.json();

    const typesPromise = data.types.map((t) => { // obtain types list by lang
        return getTypeNameByLanguage(t.type.url, "es");
    })

    const types = await Promise.all(typesPromise);

    const abilitiesPromise = data.abilities.map((a) => { // obtain abilities list by lang
        return getAbilityNameByLanguage(a.ability.url, "es");
    })

    const abilities = await Promise.all(abilitiesPromise);

    return {
        base: {...data},
        abilities,
        types
    }
}

function getHTMLPokemon({base, abilities, types}) {
    const pokemon = new Pokemon({
        id: base.id,
        name: base.name,
        abilities,
        image: base.sprites.other.dream_world.front_default,
        moves: base.moves,
        types,
        hp: base.stats[0].base_stat,
        atack: base.stats[1].base_stat,
        defense: base.stats[2].base_stat,
        specialAtack: base.stats[3].base_stat,
        specialDeffense: base.stats[4].base_stat,
        speed: base.stats[5].base_stat,
    })

    return pokemon.getPokemonCardTemplate()
}

async function getTypeNameByLanguage(link, lang) {
    const res = await fetch(link);
    const data = await res.json();
    const type = data.names.find(l => l.language.name === lang);
    if (!type) return null;
    return type;
}

async function getAbilityNameByLanguage(link, lang) {
    const res = await fetch(link);
    const data = await res.json();
    return {
        name: data.names.find(l => l.language.name === lang),
        description: data.flavor_text_entries.find(l => l.language.name === lang),
    }
}

function addListennersOnCard() {
    const cards = document.querySelectorAll(".poke-card");
    cards.forEach(c => {
        c.addEventListener("click", handleCardClick)
    })
}

function handleCardClick(ev) {
    ev.preventDefault();
    if(this.classList.value.indexOf("active") > -1) return;
    openCard(this, ev);
}

function openCard(card, ev) {
    card.style.top =  `${ev.clientY}px`;
    card.style.left = `${card.offsetLeft}px`;
    speechSynthesis.cancel();
    setTimeout(() => {
        card.classList.add("active")
        overlay.classList.add("active")
        readText(card.getAttribute("data-description"))
    }, 200);
}

function closeCards() {
    const cards = document.querySelectorAll(".poke-card");
    
    cards.forEach(c => {
        c.classList.remove("active");
    })
    overlay.classList.remove("active")

    speechSynthesis.cancel();
}


getPokemonsList();

// WEB Speech API
let voices = [];

function readText(text){

    if (typeof speechSynthesis === 'undefined') {
        return console.log("Su navegador no soporta speech simphony!")
    }

    const voice = voices.find(v => v.lang === "es-MX"); // find spanish voice

    if(!voice) return console.log("No se encontraron voces para leer!")

    const reader = new SpeechSynthesisUtterance(text);
    reader.voice = voice
    speechSynthesis.speak(reader);

}

function loadVoices() {
    voices  = speechSynthesis.getVoices();
    voices.forEach(v => {
        document.getElementById("voices").innerHTML += `<option value="${v.lang}">${v.lang}</option>`
    })
}

if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
}


let _speechSynth
let _voices
const _cache = {}

/**
 * retries until there have been voices loaded. No stopper flag included in this example. 
 * Note that this function assumes, that there are voices installed on the host system.
 */

function loadVoicesWhenAvailable (onComplete = () => {}) {
  _speechSynth = window.speechSynthesis
  const voices = _speechSynth.getVoices()

  if (voices.length !== 0) {
    _voices = voices
    onComplete()
  } else {
    return setTimeout(function () { loadVoicesWhenAvailable(onComplete) }, 100)
  }
}

/**
 * Returns the first found voice for a given language code.
 */

function getVoices (locale) {
  if (!_speechSynth) {
    throw new Error('Browser does not support speech synthesis')
  }
  if (_cache[locale]) return _cache[locale]

  _cache[locale] = _voices.filter(voice => voice.lang === locale)
  return _cache[locale]
}

/**
 * Speak a certain text 
 * @param locale the locale this voice requires
 * @param text the text to speak
 * @param onEnd callback if tts is finished
 */

function playByText (locale, text, onEnd) {
  const voices = getVoices(locale)

  // TODO load preference here, e.g. male / female etc.
  // TODO but for now we just use the first occurrence
  const utterance = new window.SpeechSynthesisUtterance()
  utterance.voice = voices[0]
  utterance.pitch = 1
  utterance.rate = 1
  utterance.voiceURI = 'native'
  utterance.volume = 1
  utterance.rate = 1
  utterance.pitch = 0.8
  utterance.text = text
  utterance.lang = locale

  if (onEnd) {
    utterance.onend = onEnd
  }

  _speechSynth.cancel() // cancel current speak, if any is running
  _speechSynth.speak(utterance)
}

// on document ready
loadVoicesWhenAvailable(function () {
 console.log("loaded") 
})

function speak () {
  setTimeout(() => playByText("en-US", "Hello, world"), 300)
}