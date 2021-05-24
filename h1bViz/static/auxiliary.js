import {map, geoJsonLayer, info} from './map.js';
import {showPlots} from './plots.js';

const $yearSpan = $('#yearSpan');

function getColor(d) {
    return d > 5000 ? '#800026' :
           d > 2500 ? '#BD0026' :
           d > 1000 ? '#E31A1C' :
           d > 500  ? '#FC4E2A' :
           d > 250  ? '#FD8D3C' :
           d > 100  ? '#FEB24C' :
           d > 50   ? '#FED976' :
           d == -1  ? '#808080' :
                      '#FFEDA0';
}

function getCircleRadius(count) {
    return count > 2500 ? 2500 :
           count > 100  ? count :
                          50;
}

function fillFilters(data){
    var caseStatusSelect = document.getElementById('caseStatusFilter');

    let caseStatuses = [];
    data.case_status.forEach(element => {
        let opt = document.createElement('option');
        opt.appendChild(document.createTextNode(element));
        opt.value = [element];
        caseStatusSelect.appendChild(opt);
        caseStatuses.push(element);
    });
    let opt = document.createElement('option');
    opt.appendChild(document.createTextNode("ALL STATUSES"));
    opt.selected = true;
    opt.value = caseStatuses;
    caseStatusSelect.appendChild(opt);

    const minYear = Math.min(data.year[0], data.year[1]);
    const maxYear = Math.max(data.year[0], data.year[1]);

    setYearRange(minYear, maxYear);
    document.getElementById('yearRangeFrom').value = minYear;
    document.getElementById('yearRangeTo').value = maxYear;

    var statesDropdown = document.getElementById('states-dropdown');
    data.states.forEach((element, index) => {
        var stateId = "state" + index;
        var div = document.createElement('div');
        div.setAttribute("class", "checkbox");
        var label = document.createElement('label');
        label.setAttribute("class", "dropdownLabel");
        label.setAttribute("for", stateId);
        var inp = document.createElement('input');
        inp.setAttribute("type", "checkbox");
        inp.setAttribute("checked", true);
        inp.setAttribute("value", element);
        inp.setAttribute("id", stateId);
        inp.setAttribute("name", "state");
        label.innerHTML = element.toLowerCase();
        div.appendChild(inp);
        div.appendChild(label);
        statesDropdown.appendChild(div);
    });
}

function style(feature) {
    return {
        fillColor: getColor(feature.properties.petitions),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

function setYearRange(minYear, maxYear) {
    $("#yearRange").slider({
        range: true,
        min: minYear,
        max: maxYear,
        values: [minYear, maxYear],
        slide: function( event, ui ) {
            $yearSpan.html(ui.values[0] + " - " + ui.values[1]);
            document.getElementById('yearRangeFrom').value = ui.values[0];
            document.getElementById('yearRangeTo').value = ui.values[1];
        }
    });

    $yearSpan.html(minYear + " - " + maxYear);
}

function openPlots(){
    let newWindow = window.open("", "Plots", "width=500,height=400");

    return newWindow;
}

function zoomToFeature(e) {
    showPlots(e.target.feature.properties.byYear, e.target.feature.properties.caseStatus);
    map.fitBounds(e.target.getBounds());
}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    info.update(layer.feature.properties);
}

function resetHighlight(e) {
    geoJsonLayer.resetStyle(e.target);
    info.update();
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

function getInfo(){
    var info = L.control();
    info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
            this.update();
            return this._div;
    };
    info.update = function (props) {
        this._div.innerHTML = '<h5>US H-1B Visa Petitions</h5>Click on state to show plots<br>' +  (props ?
            '<b>' + props.name + '</b><br />' + (props.petitions == -1 ? 'No data' : props.petitions + ' petitions')
            : '');
    };

    return info;
}

export {getColor, fillFilters, style, setYearRange, zoomToFeature, onEachFeature, getCircleRadius, highlightFeature,
        resetHighlight, getInfo, openPlots};