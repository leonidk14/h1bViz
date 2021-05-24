import {getColor, fillFilters, style, setYearRange, zoomToFeature, onEachFeature, getCircleRadius,
        highlightFeature, resetHighlight, getInfo} from './auxiliary.js';
import {showPlots, resetPlots} from './plots.js';

var info;
var geoJsonLayer;
var petitionsLayer;
var markerClusters;
var map = L.map('mapid').setView([37.8, -96], 4);

$(setYearRange(2011, 2016));


$.ajax({
    dataType: 'json', // type of response data
    url: "/petitions/get_all_petitions_by_state",
    timeout: 50000,     // timeout milliseconds
    success: function (data,status,xhr) {   // success callback function
        geoJsonLayer = L.geoJson(data, {style: style, onEachFeature: onEachFeature});
        geoJsonLayer.addTo(map);
        info = getInfo();
        info.addTo(map);
        fillFilters(data.filter_data);
    },
    error: function (jqXhr, textStatus, errorMessage) { // error callback
        console.log(errorMessage)
    }
});


L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    id: 'mapbox/light-v9',
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoibGVvbmlkayIsImEiOiJja2UwMGhkOXcxb25oMzBvc3o5ZjY2NTc0In0.6JL10QemAY2IDDaW-HLOPw'
}).addTo(map);


$("#filterForm").submit(function(e) {
    e.preventDefault(); // avoid to execute the actual submit of the form.
    var form = $(this);
    var urlSeparate = "/petitions/get_filtered_petitions";
    var urlByState = "/petitions/get_filtered_petitions_by_state";
    var showByValue = document.getElementById('filterForm').elements.radioShowBy.value;

    $.ajax({
           type: "POST",
           url: (showByValue=="byState") ? urlByState : urlSeparate,
           dataType: 'json',
           data: form.serialize(), // serializes the form's elements.
           success: function(data)
           {
                resetPlots();
                map.removeLayer(geoJsonLayer);
//                if(map.hasLayer(petitionsLayer))
//                    map.removeLayer(petitionsLayer);
                if(map.hasLayer(markerClusters))
                    map.removeLayer(markerClusters);
                if(showByValue=="byState"){
                    geoJsonLayer = L.geoJson(data, {style: style, onEachFeature: onEachFeature});
                    geoJsonLayer.addTo(map);
                    info.addTo(map);
                } else {
                    map.removeControl(info);
                    petitionsLayer = L.layerGroup();
                    markerClusters = L.markerClusterGroup({
                        showCoverageOnHover: false,
                        zoomToBoundsOnClick: false,
                        maxClusterRadius: 150
                    });

                    if(markerClusters.hasLayer(petitionsLayer))
                        markerClusters.removeLayer(petitionsLayer);

                    data.forEach(element => {
                        let marker = L.circle([element.lat, element.lon], {
                            color: 'blue',
                            fillColor: '#187bcd',
                            fillOpacity: 0.5,
                            radius: getCircleRadius(element.info.count)
                        });
                        marker.on('click', function(e) {
                            showPlots(element.info.byYear, element.info.caseStatus);
                        }).addTo(petitionsLayer);
//                        marker = L.marker([element.lat, element.lon]).addTo(petitionsLayer);
                        let popupString = "<b>Total</b> applications on this location: " + element.info.count;
                        marker.bindPopup(popupString);
                    });
                    markerClusters.addLayer(petitionsLayer);
                    map.addLayer(markerClusters);
                }
           }
     });
});


$('#select-all').click(function(event) {
    if(this.checked) {
        // Iterate each checkbox
        $('[name=state]').each(function() {
            this.checked = true;
        });
    } else {
        $('[name=state]').each(function() {
            this.checked = false;
        });
    }
});

export {map, geoJsonLayer, info};

//TODO: prediction model
