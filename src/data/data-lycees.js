import { Candidats } from "./data-candidats";

// Fonction asynchrone pour récupérer des données à partir d'une URL
async function fetchData(url) {
    let response = await fetch(url);
    return response.json();
}

// Récupération des données des codes postaux et des lycées
let codesPostaux = await fetchData("./src/data/json/codes_postaux.json");
let data = await fetchData("./src/data/json/lycees.json");

let Lycees = {};

// Fonction de comparaison pour trier les lycées par numéro UAI
const compare = (a, b) => a.numero_uai.localeCompare(b.numero_uai);

// Fonction pour trier les données des lycées
const sort = () => data.sort(compare);

// Fonction de recherche binaire pour trouver un lycée par son numéro UAI
Lycees.binarySearch = function(numero_uai) {
    let left = 0, right = data.length - 1;
    while (left <= right) {
        let mid = Math.floor((left + right) / 2);
        if (data[mid].numero_uai === numero_uai) return mid;
        if (data[mid].numero_uai < numero_uai) left = mid + 1;
        else right = mid - 1;
    }
    return null;
};

// Fonction pour obtenir le code du département à partir du code postal
const getDepartmentCode = (codePostal) => parseInt(codePostal) > 97200 ? parseInt(codePostal.substring(0, 3)) : parseInt(codePostal.substring(0, 2));

// Fonction pour obtenir la catégorie du diplôme à partir du code du diplôme
const getDiplomeCategory = (diplomeCode) => ['Générale', 'STI2D'].includes(diplomeCode) ? diplomeCode : 'Autre';

// Fonction pour mettre à jour la carte des départements avec les informations des candidats
const updateDepartmentMap = (departementMap, codeDepartement, candidat, codesPostaux, diplomeCategory) => {
    if (!departementMap[codeDepartement]) {
        let codePostalData = codesPostaux.find(cp => cp.code_departement === codeDepartement);
        if (codePostalData) {
            departementMap[codeDepartement] = {
                latitude: codePostalData.latitude,
                longitude: codePostalData.longitude,
                appellation_officielle: codePostalData.nom_departement,
                nombreCandidats: 0,
                diplomes: []
            };
        }
    }
    if (departementMap[codeDepartement]) {
        departementMap[codeDepartement].nombreCandidats++;
        departementMap[codeDepartement].diplomes.push(diplomeCategory);
    }
};

// Fonction pour traiter les candidats et mettre à jour la carte des départements
const processCandidats = (candidats, departementMap) => {
    for (let i = 0; i < candidats.length; i++) {
        let candidat = candidats[i];
        let codePostal = candidat.Scolarite[0].CommuneEtablissementOrigineCodePostal || candidat.Scolarite[1]?.CommuneEtablissementOrigineCodePostal;
        if (!codePostal) continue;
        let codeDepartement = getDepartmentCode(codePostal);
        let diplomeCategory = getDiplomeCategory(candidat.Baccalaureat.SerieDiplomeCode);
        updateDepartmentMap(departementMap, codeDepartement, candidat, codesPostaux, diplomeCategory);
    }
};

// Fonction pour obtenir les lycées avec des candidats néo-bacheliers
Lycees.getLyceeAvecCandidatNeoBachelier = function() {
    let neoBacheliers = Candidats.getNeoBacheliers();
    let lycees = [];
    let sortedData = sort();
    for (let i = 0; i < neoBacheliers.length; i++) {
        let neoBachelier = neoBacheliers[i];
        let index = Lycees.binarySearch(neoBachelier.Scolarite[0].UAIEtablissementorigine);
        if (index !== null) {
            let lycee = sortedData[index];
            let existingLycee = lycees.find(l => l.numero_uai === lycee.numero_uai);
            let diplomeCategory = getDiplomeCategory(neoBachelier.Baccalaureat.SerieDiplomeCode);
            if (existingLycee) {
                existingLycee.nombreCandidats++;
                existingLycee.diplomes.push(diplomeCategory);
            } else {
                lycees.push({
                    ...lycee,
                    nombreCandidats: 1,
                    diplomes: [diplomeCategory]
                });
            }
        }
    }
    return lycees.map(lycee => ({
        latitude: lycee.latitude,
        longitude: lycee.longitude,
        appellation_officielle: lycee.appellation_officielle,
        nombreCandidats: lycee.nombreCandidats,
        diplomes: lycee.diplomes
    }));
};

// Fonction pour obtenir les lycées avec des candidats anciens bacheliers
Lycees.getLyceeAvecCandidatAncienBachelier = function() {
    let anciensBacheliers = Candidats.getAnciensBacheliers();
    let departementMap = {};
    processCandidats(anciensBacheliers, departementMap);
    return Object.values(departementMap).map(departement => ({
        latitude: departement.latitude,
        longitude: departement.longitude,
        appellation_officielle: departement.appellation_officielle,
        nombreCandidats: departement.nombreCandidats,
        diplomes: departement.diplomes
    }));
};

// Fonction pour obtenir toutes les candidatures dans un département
Lycees.getAllInDepartment = function() {
    let candidats = [...Candidats.getAnciensBacheliers(), ...Candidats.getNeoBacheliers()];
    let departementMap = {};
    processCandidats(candidats, departementMap);
    return Object.values(departementMap).map(departement => ({
        latitude: departement.latitude,
        longitude: departement.longitude,
        appellation_officielle: departement.appellation_officielle,
        nombreCandidats: departement.nombreCandidats,
        diplomes: departement.diplomes
    }));
};

// Fonction pour récupérer les données pour le graphique
Lycees.fetchGraph = async function(threshold) {
    let candidats = [...Candidats.getAnciensBacheliers(), ...Candidats.getNeoBacheliers()];
    let departementMap = {};
    processCandidats(candidats, departementMap);
    let sortedDepartements = Object.values(departementMap)
        .sort((a, b) => b.nombreCandidats - a.nombreCandidats);

    let filteredDepartements = [];
    let autresDepartements = {
        appellation_officielle: "Autres départements",
        nombreCandidats: 0,
        diplomes: []
    };

    for (let i = 0; i < sortedDepartements.length; i++) {
        let departement = sortedDepartements[i];
        if (departement.nombreCandidats <= threshold) {
            autresDepartements.nombreCandidats += departement.nombreCandidats;
            autresDepartements.diplomes.push(...departement.diplomes);
        } else {
            filteredDepartements.push(departement);
        }
    }

    if (autresDepartements.nombreCandidats > 0) {
        filteredDepartements.push(autresDepartements);
    }

    return filteredDepartements.map(departement => {
        let generale = departement.diplomes.filter(d => d === 'Générale').length;
        let sti2d = departement.diplomes.filter(d => d === 'STI2D').length;
        let autres = departement.diplomes.filter(d => d === 'Autre').length;
        return [
            departement.appellation_officielle,
            generale,
            sti2d,
            autres
        ];
    });
};

// Fonction pour récupérer les catégories de diplômes pour le graphique
Lycees.fetchGraphCategory = async function() {
    return ['Générale', 'STI2D', 'Autre'];
};



export { Lycees };
