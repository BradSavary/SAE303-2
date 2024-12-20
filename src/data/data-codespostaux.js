let data = await fetch("./src/data/json/codes_postaux.json");
data = await data.json();

let codesPostaux = {};


// Fonction pour récupérer les données des codes postaux
codesPostaux.getAll = function() {
    return data;
};



export { Lycees };