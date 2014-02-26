var app={}

$(function () {

    $.ajaxSetup({
        beforeSend: function (xhr, settings) {
            if (!csrfSafeMethod(settings.type) && sameOrigin(settings.url)) {
                // Send the token to same-origin, relative URLs only.
                // Send the token only if the method warrants CSRF protection
                // Using the CSRFToken value acquired earlier
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        },
        error: function (jqXHR, exception) {
            if (jqXHR.status === 0) {
                alert('Not connect.\n Verify Network.');
            } else if (jqXHR.status == 404) {
                alert('Requested page not found. [404]');
            } else if (jqXHR.status == 500) {
                alert('Internal Server Error [500].');
            } else if (exception === 'parsererror') {
                alert('Requested JSON parse failed.');
            } else if (exception === 'timeout') {
                alert('Time out error.');
            } else if (exception === 'abort') {
                alert('Ajax request aborted.');
            } else {
                alert('Uncaught Error.\n' + jqXHR.responseText);
            }
            
        }
    });
});

function getData(url) {
/*
 * Get Data in async way, so that it can return an object to a variable
 */
var data;
    $.ajax({
        async: false, //thats the trick
        url: url,
        dataType: 'json',
        success: function(response){
                //alert (response);
        data = response;
        },
        error : function(e){
                alert(e)
        }
        
    });
    return data;
}

function loadArea(area) {
        /*
         * Puts layer areas on map
         */
            var newArea = L.geoJson(area, {
                style: {
                                weight: 1,
                                opacity: 1,
                                color: 'black',
                                clickable: true,
                                dashArray: '3',
                                fillOpacity: 0.2,
                                fillColor: 'red'
                },
            }).addTo(map);
            var newAreaKey = "<span style='font-weight:bold;color:red'>" + 'Provincia di Roma' + " Area</span>";
            overlaymaps[newAreaKey] = newArea;
            
        
        return newArea;
}

function loadNodes(newClusterNodes, color,layerName) {
    /*
     * Load nodes in cluster group and defines click properties for the popup window
     */
    var counter = 0;
    //console.log(newClusterNodes)
    app[layerName] = []
    var layer = L.geoJson(newClusterNodes, {

        onEachFeature: function (feature, layer) {
            layer.on('click', function (e) {
                this.bindPopup(feature.properties.name);

            });

        },
        pointToLayer: function (feature, latlng) {
            var marker = new
            L.circleMarker(latlng, {
                radius: 6,
                fillColor: color,
                color: color,
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
            var node = {
                "name":feature.properties.name,
                "marker": marker,
                "data" : feature.properties.data
            }
            
            app[layerName][counter]= node
            counter++;
            //console.log(counter)
            return marker;


        }

    });
    //console.log(app[layerName])
    //app[layerName].sort(function(a, b){
    //            alert('uff')
    //            var nameA=a.toLowerCase(), nameB=b.toLowerCase();
    //            
    //            if (nameA < nameB) //sort string ascending
    //                            return -1
    //            if (nameA > nameB)
    //                            return 1
    //            return 0 //default return value (no sorting)
    //            });
    return layer;
}

function createCluster(clusterClass) {
    /*
     * Creates cluster group
     */
    var newCluster = new L.MarkerClusterGroup({
        iconCreateFunction: function (cluster) {
            return L.divIcon({
                html: cluster.getChildCount(),
                className: clusterClass,
                iconSize: L.point(30, 30)
            });
        },
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: true,
        zoomToBoundsOnClick: true
    });
    return newCluster;
}

function createNodeList() {
        var layer = $("#selectLayer").val();
        var layer = 'ProvinciaWiFi';
        //console.log(app[layer])
        addToList(app[layer])
}

function addToList(data) {
        //alert('test')
        console.log(data)
        //$("#valori").html('');
        $("#nodelist").html('');
        //var nodes = data.features;
        //nodes=data
        var tmplMarkup = $('#tmplNodelist').html();
        var compiledTmpl = _.template(tmplMarkup, {
            nodes: data
        });
        $("#nodelist").append(compiledTmpl);
        //
        $('a.list-link').click(function (e) {
        var layer = 'ProvinciaWiFi';
        var slug = $(this).data('slug');
        //console.log(app[layer])
        var marker = app[layer][slug].marker;
        var name = app[layer][slug].name;
        var address = app[layer][slug].data.address;
        var city = app[layer][slug].data.city;

        //    //console.log(marker)
        //    //console.log(marker.toGeoJSON());
        //    populateNodeDiv(slug,"true");
        marker.addTo(map)
        marker.bindPopup(name+'<br>'+address+'<br>'+city)
        //    marker.bindPopup(nodeDiv)
        //    populateRating(slug,nodeDiv,nodeRatingAVG)
        marker.openPopup()
        })
}

function onMapClick(e,area){
                var areaLayer = L.geoJson(provRoma);
                var results = leafletPip.pointInLayer(e.latlng, areaLayer,false);
                if (results.length > 0) {
                                alert("Hai cliccato sul layer " + (results[0].feature.properties.name))
                }
                else {
                                alert("Il punto non è compreso in nessun layer")
                }

                
}

var clusterClass = "nodes" //class is in CSS external file but could be dinamically created for each layer
var color = "#0000FF" // class is hardcoded but could be dinamically created for each node, depending on his status
var provRoma = getData('json/provincia_geojson.json')
var hotspots = getData('json/hotspots.geojson')

var map = L.map('map').setView([41.87, 12.49], 9);
map.on('click', onMapClick);
var osmLayer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
var popup = L.popup();

//OSM layer added to map
osmLayer.addTo(map);



//Layer insert on map
var overlaymaps = {};

//Hotspots
//Creates a Leaflet cluster group styled with layer's colour
var hotspotsCluster = createCluster(clusterClass);
//Loads  nodes in the cluster
var hotspotsClusterLayer = loadNodes(hotspots, color,'ProvinciaWiFi');
hotspotsCluster.addLayer(hotspotsClusterLayer);
//Adds cluster to map
map.addLayer(hotspotsCluster);
//Creates map controls for the layer
var hotspotsClusterKey = "<span style='color:" + color + "';'>" + 'HotSpot WiFi' + "</span>";
overlaymaps[hotspotsClusterKey] = hotspotsCluster;

//Area provincia
//Creates a Leaflet cluster group styled with layer's colour
//Loads  nodes in the cluster
var ProvLayer = loadArea(provRoma);
//newCluster.addLayer(newClusterLayer);
//Adds cluster to map
map.addLayer(ProvLayer);
//Creates map controls for the layer
var ProvLayerKey = "<span style='color:" + color + "';'>" + 'Area Provincia' + "</span>";
overlaymaps[ProvLayerKey] = ProvLayer;
var areaLayer = L.geoJson(provRoma);
//leafletPip.bassackwards=true



var baseMaps = {
    "OpenStreetMap": osmLayer,

};
var mapControl = L.control.layers(baseMaps, overlaymaps).addTo(map);
createNodeList()






