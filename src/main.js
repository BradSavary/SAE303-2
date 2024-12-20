import { HeaderView } from "./ui/header/index.js";
import { LimogesMapView } from "./ui/map/index.js";
import {stackedbar} from "./ui/stackedbar/index.js";
import { Candidats } from "./data/data-candidats.js";
import { Lycees } from "./data/data-lycees.js";
import { L, map } from "leaflet";
import 'leaflet.markercluster';
import './css/index.css';


let C = {};

C.init = async function(){
    V.init();
}

let V = {
    header: document.querySelector("#header"),
    map: document.querySelector("#map")
};

V.init = function(){
    C.setupEventListeners();
    // V.renderHeader();
    V.LimogesMapViewRender();
    V.StackedbarRender();
}

V.renderHeader= function(){
    V.header.innerHTML = HeaderView.render();

}

V.LimogesMapViewRender = function(){
    LimogesMapView.render(Lycees.getAllInDepartment());
}

V.StackedbarRender = function(){
    stackedbar.render();
};

V.resetMap = function(){
    const element = document.getElementById("map")
    element.remove();
    const newMapDiv = document.createElement("div");
    newMapDiv.id = "map";
    document.querySelector("body").appendChild(newMapDiv);
}

C.setupEventListeners = function(){

    document.querySelector("#neobacheliers").addEventListener("click", function(){
        V.resetMap();
        LimogesMapView.render(Lycees.getLyceeAvecCandidatNeoBachelier());
    });
    document.querySelector("#bacheliers").addEventListener("click", function(){
        V.resetMap();
        LimogesMapView.render(Lycees.getLyceeAvecCandidatAncienBachelier());
    });

    document.querySelector("#allbachelier").addEventListener("click", function(){
        V.resetMap();
        LimogesMapView.render(Lycees.getAllInDepartment());
    });

    
}

C.init();