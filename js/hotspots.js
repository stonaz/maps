var app = {}

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
                alert (response);
        data = response;
        },
        error : function(e){
                alert(e)
        }
        
    });
    return data;
}

function loadNodes(newClusterNodes, color) {
    /*
     * Load nodes in cluster group and defines click properties for the popup window
     */
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

            return marker;
        }

    });

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
        if (layer != " ") {
            $.ajax({
                type: 'GET',
                url: window.__BASEURL__ + 'api/v1/layers/' + layer + '/nodes.geojson',
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                success: function (result) {
                    //alert('success')
                    addToList(result)
                },
            })
        }
}

function addToList(data) {
        //alert('test')
        console.log(data)
        $("#valori").html('');
        $("#nodelist").html('');
        var nodes = data.features;
        var tmplMarkup = $('#tmplNodelist').html();
        var compiledTmpl = _.template(tmplMarkup, {
            nodes: nodes
        });
        $("#nodelist").append(compiledTmpl);

        $('a.list-link').click(function (e) {
            var slug = $(this).data('slug');
            //alert(slug)
            var marker = markerMap[slug];
            //console.log(marker)
            //console.log(marker.toGeoJSON());
            populateNodeDiv(slug,"true");
            marker.addTo(map)
            //marker.bindPopup(slug)
            marker.bindPopup(nodeDiv)
            populateRating(slug,nodeDiv,nodeRatingAVG)
            marker.openPopup()
        })
}

var clusterClass = "nodes" //class is in CSS external file but could be dinamically created for each layer
var color = "#0000FF" // class is hardcoded but could be dinamically created for each node, depending on his status
var provRoma = getData('json/provincia_geojson.json')
var hotspots = getData('json/hotspots.geojson')

var map = L.map('map').setView([41.87, 12.49], 9);
var osmLayer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
var popup = L.popup();

//OSM layer added to map
osmLayer.addTo(map);



//Layer insert on map
var overlaymaps = {};

//Creates a Leaflet cluster group styled with layer's colour
var newCluster = createCluster(clusterClass);

//Loads nodes in the cluster
var newClusterLayer = loadNodes(hotspots, color);
newCluster.addLayer(newClusterLayer);

//Adds cluster to map
map.addLayer(newCluster);

//Creates map controls for the layer
var newClusterKey = "<span style='color:" + color + "';'>" + 'HotSpot WiFi' + "</span>";
overlaymaps[newClusterKey] = newCluster;

var baseMaps = {
    "OpenStreetMap": osmLayer,

};
var mapControl = L.control.layers(baseMaps, overlaymaps).addTo(map);





