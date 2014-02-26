//Map initialization
var map = L.map('map').setView([41.89257,  12.49763], 11);
var osmLayer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
//Uncomment for Google maps. Works only in quirk mode.
//var googleHybrid = new L.Google('HYBRID');
//var googleMap = new L.Google('ROADMAP');
//var googleSat = new L.Google();

//OSM layer added to map
osmLayer.addTo(map);
//map.on('click', onMapClick);
var popup = L.popup();

//Layer insert on map
var overlaymaps={};

//L.geoJson.addTo(map);

var geojsonMarkerOptions = {
    radius: 3,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

var layerCentroDiurnaVarchi=L.geoJson(centroDiurnaVarchi, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    },
    onEachFeature: function (feature, layer) {
       layer.bindPopup(feature.properties.name);
  }
}).addTo(map);

var layerCentroNotturnaVarchi=L.geoJson(centroNotturnaVarchi, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    },
    onEachFeature: function (feature, layer) {
       layer.bindPopup(feature.properties.name);
  }
}).addTo(map);

var layerCentroDiurnaArea=L.geoJson(centroDiurnaArea, {
    style: function (feature) {
        return {
	    weight: "1",
	    color: "red",
	    clickable: false,
	    };
    },
    onEachFeature: function (feature, layer) {
        layer.bindPopup(feature.properties.name);
    }
}).addTo(map);

var layerCentroNotturnaArea=L.geoJson(centroNotturnaArea, {
    style: function (feature) {
        return {
	    weight: "1",
	    color: "blue",
	    clickable: false,
	    };
    },
    onEachFeature: function (feature, layer) {
        layer.bindPopup(feature.properties.name);
    }
}).addTo(map);

var baseMaps = {
		"OpenStreetMap": osmLayer,
		//Uncomment for Google maps. Works only in quirk mode.
		//"Google Sat": googleSat,
		//"Google Map": googleMap,
		//"Google Hybrid": googleHybrid
		
				};
var overlayMaps = {
    "ZTL diurna": layerCentroDiurnaArea,
    "ZTL diurna varchi": layerCentroDiurnaVarchi,
    "<span class='ZTL_night'>ZTL notturna</span>": layerCentroNotturnaArea,
    "<span class='ZTL_night'>ZTL notturna varchi</span>": layerCentroNotturnaVarchi
};

var mapControl=L.control.layers(baseMaps,overlayMaps).addTo(map);





