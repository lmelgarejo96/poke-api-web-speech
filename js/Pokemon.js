//
class Pokemon {
    constructor(pokemon) {
        this.id = pokemon.id;
        this.name = pokemon.name;
        this.abilities = pokemon.abilities;
        this.image = pokemon.image;
        this.moves = pokemon.moves;
        this.types = pokemon.types;
        this.hp = pokemon.hp;
        this.atack = pokemon.atack;
        this.defense = pokemon.defense;
        this.speed = pokemon.speed;
        this.specialAtack = pokemon.specialAtack;
        this.specialDeffense = pokemon.specialDeffense;
    }

    getPokemonCardTemplate() {
            return `
        <a href="/pokemon.html?pokemon=${this.id}" data-description="${this.getDescription()}" class="poke-card">
            <div class="poke-image">
                <img draggable="false" src="${this.image}" alt="${this.name}">
            </div>
            <div class="poke-description">
                <div class="poke-number">
                    N.° ${this.getConvertId()}
                </div>
                <h3 class="poke-name">${this.capitalize(this.name)}</h3>
                <ul class="poke-abilities">
                    ${this.types.map(ab => {
                        return `
                            <li> ${this.capitalize(ab.name)} </li>
                        `
                    })}
                </ul>
            </div>
        </a>
        `
    }

    getConvertId(){
        const arr = this.id.toString().split("")
        let cod="";
        for(let i = 0; i < 4-arr.length; i++) {
            cod+="0";
        }
        cod += (arr.toString()).replace(/,/g, "");
        return cod || "";
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    getDescription(){
        const ORDER = ["La primera habilidad ", `La segunda habilidad de  ${this.name}`, "Su tercera habilidad es ", "Su cuarta habilidad es, "]
        return `${this.name} es un pokemon de tipo ${this.types.map(ty => ty.name+", ").toString()} que tiene un HP de ${this.hp} puntos.
        Su ataque base es ${this.atack}, su velocidad es ${this.speed} y su defensa es de ${this.defense}.
        Su ataque especial puede llegar a los ${this.specialAtack} puntos y su defensa especial a los${this.specialDeffense} puntos.
        ${this.name} tiene ${this.abilities.length} habilidades.
        ${this.abilities.map((ab, idx) => `${ORDER[idx]} ${ab.name.name}: ${ab.description.flavor_text}\n`).toString()}.`
    }
}