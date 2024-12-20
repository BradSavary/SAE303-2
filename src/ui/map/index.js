let LimogesMapView = {};

// La fonction render de LimogesMapView prend en paramètre une liste de lycées et affiche une carte avec des marqueurs pour chaque lycée.
LimogesMapView.render = function(lycees){
    // Initialisation de la carte centrée sur Limoges avec un zoom de 10.
    var map = L.map('map').setView([45.83390286408491, 1.2597282261052145], 10);
    
    // Ajout des tuiles OpenStreetMap à la carte.
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);  

    // Création d'un groupe de marqueurs avec des options de clustering.
    var markers = L.markerClusterGroup({
        iconCreateFunction: function(cluster) {
            return L.divIcon({ html: '<b>' + cluster.getChildCount() + '</b>' });
        }
    });

    // Redéfinition du groupe de marqueurs avec des options spécifiques pour le clustering.
    markers = L.markerClusterGroup({
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: true,
        zoomToBoundsOnClick: false
    });

    // Gestion de l'événement de clic sur un cluster de marqueurs.
    markers.on('clusterclick', function(event) {
        let cluster = event.layer;
        let markers = cluster.getAllChildMarkers();
        let totalCandidats = 0;
        let diplomeCounts = {};

        // Calcul du nombre total de candidats et des diplômes cumulés pour les marqueurs du cluster.
        for (let i = 0; i < markers.length; i++) {
            let marker = markers[i];
            let popupContent = marker.getPopup().getContent();
            let match = popupContent.match(/Nombre de candidats: (\d+)/);
            let candidats = match ? parseInt(match[1]) : 0;
            totalCandidats += candidats;

            let diplomeMatch = popupContent.match(/<b>Diplomes:<\/b><br>([\s\S]*)/);
            if (diplomeMatch) {
            let diplomeDetails = diplomeMatch[1].split('<br>');
            diplomeDetails.forEach(detail => {
                let [diplome, count] = detail.split(': ');
                count = parseInt(count);
                let category;
                if (diplome.includes('Générale')) {
                category = 'Générale';
                } else if (diplome.includes('STI2D')) {
                category = 'STI2D';
                } else {
                category = 'Autres';
                }
                if (!diplomeCounts[category]) {
                diplomeCounts[category] = 0;
                }
                diplomeCounts[category] += count;
            });
            }
        }

        // Création du contenu de la popup pour le cluster avec le nombre total de candidats et les diplômes cumulés.
        let diplomeDetails = Object.entries(diplomeCounts)
            .map(([diplome, count]) => `${diplome}: ${count}`)
            .join('<br>');

        cluster.bindPopup(`Nombre total de candidats: ${totalCandidats}<br><b>Diplomes cumulés:</b><br>${diplomeDetails}`).openPopup();
    });

    // Ajout des marqueurs pour chaque lycée avec les informations de popup.
    lycees.forEach(lycee => {
        let popupContent = `<b>${lycee.appellation_officielle}</b>`;
        if (lycee.nombreCandidats !== undefined) {
            popupContent += `<br>Nombre de candidats: ${lycee.nombreCandidats}`;
        }
        if (lycee.diplomes !== undefined) {
            let diplomeCounts = {};
            for (let diplome of lycee.diplomes) {
                if (!diplomeCounts[diplome]) {
                    diplomeCounts[diplome] = 0;
                }
                diplomeCounts[diplome] += 1;
            }
            let diplomeDetails = Object.entries(diplomeCounts)
                .map(([diplome, count]) => `${diplome}: ${count}`)
                .join('<br>');
            popupContent += `<br><b>Diplomes:</b><br>${diplomeDetails}`;
        }
        let marker = L.marker([lycee.latitude, lycee.longitude])
            .bindPopup(popupContent);
        markers.addLayer(marker);
    });

    // Ajout du groupe de marqueurs à la carte.
    map.addLayer(markers);
}

export {LimogesMapView};