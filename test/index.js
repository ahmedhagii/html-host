var MAP_CONFIGS = {
    zoom: 7,
    center: { lat: 46.8182, lng: 8.2275 }
};

// var GET_MARKERS_URL = "./fakeData.php";
var GET_MARKERS_URL = "http://neighbourhood-dev.arkham.enterprises/data.php";

var marker;
var map;
var index;
var markers = [];
var clickedMarker;
var markersLookup = {}
var globalZoom = 7;

function initMap() {
    map = buildMap();
    populateMapWithMarkers(map);
    addYourLocationButton(map);
    buildAutocomplete(map);
    placeMarkersOnClick(map);
}

window.initMap = initMap;

function buildMap() {
    return new google.maps.Map(document.getElementById("map"), MAP_CONFIGS);
}

function populateMapWithMarkers(map) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            var big = JSON.parse(xhr.response).concat(JSON.parse(xhr.response))
            var geojson = big.map(x => {
                return {
                    "geometry": {
                        "type": "Point",
                        "coordinates": [
                            x["lng"],
                            x["lat"]
                        ]
                    },
                    "type": "Feature",
                    "properties": "JB141698"
                }
            });

            index = supercluster({
                // log: true,
                radius: 90,
                extent: 300,
                // maxZoom: 15
            }).load(geojson);

            updateMap(map)

            google.maps.event.addListener(map, 'zoom_changed', function() {
                console.log("new zoom", map.getZoom())
                console.log(this)
                setTimeout(function() {updateMap(map)},  0)
            });
            google.maps.event.addListener(map, 'dragend', function() {
                setTimeout(function() {updateMap(map)},  0)
            });
        }
    };
    xhr.open("GET", GET_MARKERS_URL, true);
    xhr.send();
}

function updateMap(map) {
    var bounds = map.getBounds();
    var box = [bounds['b']['b'], bounds['f']['b'], bounds['b']['f'], bounds['f']['f']]
    var zoom = map.getZoom()
    var clusters = index.getClusters(box, zoom);

    if(map.getZoom() < globalZoom) {
        while(markers.length) { markers.pop().setMap(null); }
        var newMarkers = markLocations(clusters, map);
        (function addMarkers(newMarkers) {
            newMarkers.map(x => x.setMap(map))
        })(newMarkers)
        markers = newMarkers;
        console.log(map.getZoom())
    }else {
        var newMarkers = markLocations(clusters, map);
        (function addMarkers(newMarkers) {
            newMarkers.map(x => x.setMap(map))
        })(newMarkers)

        while(markers.length) { markers.pop().setMap(null); }
        markers = newMarkers;
        console.log(map.getZoom())
    }
    globalZoom = map.getZoom()
}

function markLocations(locations, map) {
    return locations.map(function(location) {
        // console.log(location)
        console.log(String(location['properties']['point_count_abbreviated']))
        var points = location['properties']['point_count']
        var color = "#202F6B";
        if(points > 200) color = "#eac03c"
        if(points > 500) color = "#eb7d37"
        var marker = new google.maps.Marker({
            position: {
                lng: location['geometry']['coordinates'][0],
                lat: location['geometry']['coordinates'][1]
            },
            icon: {
                // url: location['properties']['point_count'] === undefined ? "markers/default.png" : "markers/m1.png",
                labelOrigin: {x: 16, y:15},
                strokeColor: color,
                strokeOpacity: 0.8,
                strokeWeight: 7,
                fillColor: color,
                fillOpacity: 0.9,
                path: "M16,28.261c0,0-14-7.926-14-17.046c0-9.356,13.159-10.399,14-0.454c1.011-9.938,14-8.903,14,0.454C30,20.335,16,28.261,16,28.261z",
                scale: 1.5,
                // size: {width: 58, height: 52}
            },
            // map: map,
            label: {
                text: String(location['properties']['point_count_abbreviated']),
                color: "white"
            },
            title: String(location['properties']['cluster_id']),
            clickable: true,
            cursor: "pointer",
            optimized: false,
        });

        // console.log(marker.getPosition(), marker.getIcon())
        if(location['properties']['point_count'] === undefined) {
            marker.setLabel(null)
            marker.icon.scale = 1
        }
        marker.setShape({coords:[marker.position.lat(), marker.position.lng(), 100], type:"circle"})
        google.maps.event.addListener(marker, 'click', function() {
            // infowindow.open(map);
            // console.log(this.getPosition())
            // map.panTo(this.getPosition());
            // clickedMarker = this;
            zoollvl = index.getClusterExpansionZoom(Number(this.getTitle()))
            if(zoollvl == 16) zoollvl++
            function zoomIn(zoomCurr, zoomTo) {
                if(zoomCurr == zoomTo - 1) {
                    // clickedMarker = null;
                    map.setZoom(zoomCurr + 1)
                    return;
                }
                console.log("zooming in", zoomCurr)
                map.setZoom(zoomCurr + 1);
                setTimeout(function() {
                    zoomIn(zoomCurr + 1, zoomTo)
                }, 50)
            }
            clickedMarker = this;
            zoomIn(map.getZoom(), zoollvl)
            // map.setZoom(zoollvl);
            map.panTo(this.getPosition());
        });

        // markersLookup[JSON.stringify([marker.position.lat(), marker.position.lng()])] = 1
        return marker;
    });
}

function placeMarkersOnClick(map) {
    google.maps.event.addListener(map, "click", function(event) {
        placeMarker(event.latLng, map);
    });
}

function placeMarker(location, map) {
    if (marker) {
        marker.setPosition(location);
    } else {
        marker = new google.maps.Marker({
            position: location,
            map: map,
            icon: {
                url: "markers/current.png", // url
                scaledSize: new google.maps.Size(22, 21), // scaled size
                origin: new google.maps.Point(0, 0), // origin
                anchor: new google.maps.Point(11, 10) // anchor
            }
        });
    }

    map.panTo(location);
}

function buildAutocomplete(map) {
    var ZOOM = 17;

    var searchBox = document.getElementById("searchPlace");
    var autocomplete = new google.maps.places.Autocomplete(searchBox, {
        componentRestrictions: { country: "ch" }
    });
    autocomplete.bindTo("bounds", map);

    autocomplete.addListener("place_changed", function() {
        var place = autocomplete.getPlace();
        if (!place.geometry) {
            return;
        }

        placeMarker(place.geometry.location, map);
        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(ZOOM);
        }
    });
}

function submit() {
    var form = document.getElementById("form");
    var result = getFormValues();
    if (!result) {
        alertSuccessful(false);
    } else {
        sendResults(result);
        form.reset();
        alertSuccessful(true);
    }
}

function sendResults(results) {
    var xhttp = new XMLHttpRequest();
    xhttp.open('POST', 'register.php', true)
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify(results));
}

function alertSuccessful(success) {
    if (success) {
        document.getElementById("error-alert").style.display = "none";
        document.getElementById("success-alert").style.display = "";
    } else {
        document.getElementById("error-alert").style.display = "";
        document.getElementById("success-alert").style.display = "none";
    }
}

function toggleTextArea() {
    var isChecked = document.getElementById("textAreaCheckbox").checked;
    var field = document.getElementById("feedbackField");
    field.style.display = isChecked ? "" : "none";
}

function addYourLocationButton(map) {
    var controlDiv = document.createElement("div");

    var firstChild = document.createElement("button");
    firstChild.style.backgroundColor = "#fff";
    firstChild.style.border = "none";
    firstChild.style.outline = "none";
    firstChild.style.width = "28px";
    firstChild.style.height = "28px";
    firstChild.style.borderRadius = "2px";
    firstChild.style.boxShadow = "0 1px 4px rgba(0,0,0,0.3)";
    firstChild.style.cursor = "pointer";
    firstChild.style.marginRight = "10px";
    firstChild.style.padding = "0";
    firstChild.title = "Your Location";
    controlDiv.appendChild(firstChild);

    var secondChild = document.createElement("div");
    secondChild.style.margin = "5px";
    secondChild.style.width = "18px";
    secondChild.style.height = "18px";
    secondChild.style.backgroundImage =
        "url(https://maps.gstatic.com/tactile/mylocation/mylocation-sprite-2x.png)";
    secondChild.style.backgroundSize = "180px 18px";
    secondChild.style.backgroundPosition = "0 0";
    secondChild.style.backgroundRepeat = "no-repeat";
    firstChild.appendChild(secondChild);

    google.maps.event.addListener(map, "center_changed", function() {
        secondChild.style["background-position"] = "0 0";
    });

    firstChild.addEventListener("click", function() {
        var imgX = "0",
            animationInterval = setInterval(function() {
                imgX = imgX === "-18" ? "0" : "-18";
                secondChild.style["background-position"] = imgX + "px 0";
            }, 500);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                var latlng = new google.maps.LatLng(
                    position.coords.latitude,
                    position.coords.longitude
                );
                map.setCenter(latlng);
                marker.setPosition(latlng);
                map.panTo(latlng);
                map.zoomTo(latlng);
                clearInterval(animationInterval);
                secondChild.style["background-position"] = "-144px 0";
            });
        } else {
            clearInterval(animationInterval);
            secondChild.style["background-position"] = "0 0";
        }
    });

    controlDiv.index = 1;
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlDiv);
}
