

let data = await fetch("./src/data/json/candidatures.json");
data = await data.json();

let Candidats = {}


//Fonction pour récupérer toutes les candidatures
Candidats.getAll = function(){
    return data;
}

//Fonction pour obtenir les candidatures avec des candidats néo-bacheliers
Candidats.getNeoBacheliers = function(){
    let neoBacheliers = data.filter(candidat => candidat.Baccalaureat.TypeDiplomeLibelle === "Baccalauréat en préparation");
    return neoBacheliers;
}

//Fonction pour obtenir les candidatures avec des candidats anciens bacheliers
Candidats.getAnciensBacheliers = function(){
    let bacheliers = data.filter(candidat => candidat.Baccalaureat.TypeDiplomeLibelle === "Baccalauréat obtenu" && candidat.Scolarite[0].AnneeScolaireLibelle === "2023-2024");  return bacheliers;
}

//Fonction pour obtenir les candidatures avec des candidats autres
Candidats.getOthers = function(){
    let others = data.filter(candidat => candidat.Baccalaureat.TypeDiplomeLibelle !== "Baccalauréat en préparation" && candidat.Baccalaureat.TypeDiplomeLibelle !== "Baccalauréat obtenu");
    return others;
}

export { Candidats };