//Map initialization
var map = L.map('map').setView([41.87, 12.49], 7);
var osmLayer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
//Uncomment for Google maps. Works only in quirk mode.
//var googleHybrid = new L.Google('HYBRID');
//var googleMap = new L.Google('ROADMAP');
//var googleSat = new L.Google();

//OSM layer added to map
osmLayer.addTo(map);

function getAddress(latlng) {
    /*
     * Get Address using OSM Nominatim service
     */
    
    //var latlngToString = latlng.toString();
    var arrayLatLng = latlng.toString().split(",");
    var lat = arrayLatLng[0].slice(7);
    var lng = arrayLatLng[1].slice(0, -1);
    var url = 'http://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lng + '&zoom=18&addressdetails=0';
    $.ajax({
        async: true, 
        url: url,
        dataType: 'json',
        success: function (response) {
            address = response.display_name;
            $("#address").html(address)
        }
    });    
}

function onMapClick(e) {
    /*
     *Creates marker object
     */


    markerLocation = e.latlng
    marker = new L.Marker(markerLocation,{draggable:true});
    marker.on('dragend', function(event) {
    var marker = event.target;  // you could also simply access the marker through the closure
    var result = marker.getLatLng();  // but using the passed event is cleaner
    getAddress(result)
});
    markerToRemove = marker
    var address = getAddress(markerLocation)
    map.addLayer(marker);
    popup.setLatLng(e.latlng)
        .setContent(address)
        //.openOn(map);

}
map.on('click', onMapClick);
var popup = L.popup();