(function(window, document, maps) {

    "use strict";

    var isPhone = false,
        mapelement = null,
        map = null,
        markers = {
            start: null,
            end: null,
            lookat: null
        },
        markerDragging = {
            start: false,
            end: false,
            lookat: false
        },
        svoverlay = new maps.StreetViewCoverageLayer(),
        snapradius = 50,
        svservice = new maps.StreetViewService(),
        directionsservice = new maps.DirectionsService(),
        directionsrenderer = new maps.DirectionsRenderer({
            suppressMarkers: true,
            draggable: false,
            hideRouteList: true,
            routeIndex: 0,
            suppressInfoWindows: true
        }),
        panoramiolayer = new maps.panoramio.PanoramioLayer(),
        geocoder = new maps.Geocoder();

    /**
    one time initialization on load
    */
    var init = function() {
        
        if (document.body.classList.contains("phone")) {

            isPhone = true;
        }

        document.body.addEventListener("click", function () {

            console.log("click!!!");
        });

        /**
        Create Map
        */
        mapelement = document.querySelector("#map");

        map = new maps.Map(mapelement, {
            center: new maps.LatLng(29.8644, 77.8964),
            zoom: 15,
            streetViewControl: false
        });

        /**
        setting for directions renderer
        */
        directionsrenderer.setMap(map);

        /**
        setting for panoramio layer
        */
        var resetPanoramioLayer = function() {

            if (map.getZoom() > 14) {

                panoramiolayer.setMap(map);
            } else {

                panoramiolayer.setMap(null);
            }
        };

        maps.event.addListener(map, "zoom_changed", function() {

            resetPanoramioLayer();
        });
        resetPanoramioLayer();

        /**
        Create Markers
        */

        /**
        cache to store old location while dragging
        */
        var locationcache = {
            start: null,
            end: null,
            lookat: null
        };

        /**
        snap marker location to nearest place with street view
        */
        var snapMarker = function(marker, oldpos, cb) {

            svservice.getPanoramaByLocation(marker.getPosition(), snapradius, function(data, status) {

                if (status === maps.StreetViewStatus.OK) {

                    var location = data.location.latLng;
                    marker.setPosition(location);
                } else {

                    marker.setPosition(oldpos);
                }

                cb();
            });
        }

        /**
        draw route from start to end
        */
        var drawRoute = function() {

            directionsservice.route({
                origin: markers.start.getPosition(),
                destination: markers.end.getPosition(),
                travelMode: maps.TravelMode.DRIVING
            }, function (response, status) {

                if (status === maps.DirectionsStatus.OK) {

                    directionsrenderer.setDirections(response);
                }
            });
        };

        /**
        markers
        */
        /**
        start
        */
        markers.start = new maps.Marker({
            map: map,
            draggable: true,
            icon: '/images/markers/start.png',
            title: 'Start Point'
        });

        maps.event.addListener(markers.start, "position_changed", function() {

            var position = markers.start.getPosition();

            sendMessage(Message.Local.START_CHANGED, [position.lat(), position.lng()]);
        });

        /**
        end
        */
        markers.end = new maps.Marker({
            map: map,
            draggable: true,
            icon: '/images/markers/end.png',
            title: 'End Point'
        });

        maps.event.addListener(markers.end, "position_changed", function () {

            var position = markers.end.getPosition();

            sendMessage(Message.Local.END_CHANGED, [position.lat(), position.lng()]);
        });

        /**
        lookat
        */
        markers.lookat = new maps.Marker({
            map: map,
            draggable: true,
            icon: '/images/markers/lookat.png',
            title: 'Lookat Point'
        });

        maps.event.addListener(markers.lookat, "position_changed", function () {

            var position = markers.lookat.getPosition();

            sendMessage(Message.Local.LOOKAT_CHANGED, [position.lat(), position.lng()]);
        });

        /**
        marker events
        */
        maps.event.addListener(markers.start, 'dragstart', function(e) {

            markerDragging.start = true;
            svoverlay.setMap(map);
            locationcache.start = markers.start.getPosition();
        });

        maps.event.addListener(markers.start, 'dragend', function (e) {

            markerDragging.start = false;
            svoverlay.setMap(null);

            snapMarker(markers.start, locationcache.start, function() {

                var newpos = markers.start.getPosition();

                if (!newpos.equals(locationcache.start)) {

                    drawRoute();
                }
            });
        });

        maps.event.addListener(markers.end, 'dragstart', function (e) {

            markerDragging.end = true;
            svoverlay.setMap(map);
            locationcache.end = markers.end.getPosition();
        });

        maps.event.addListener(markers.end, 'dragend', function (e) {

            markerDragging.end = false;
            svoverlay.setMap(null);

            snapMarker(markers.end, locationcache.end, function () {

                var newpos = markers.end.getPosition();

                if (!newpos.equals(locationcache.end)) {

                    drawRoute();
                }
            });
        });

        maps.event.addListener(markers.lookat, 'dragstart', function (e) {

            markerDragging.lookat = true;
            svoverlay.setMap(map);
            locationcache.lookat = markers.lookat.getPosition();
        });

        maps.event.addListener(markers.lookat, 'dragend', function (e) {

            markerDragging.lookat = false;
            svoverlay.setMap(null);
        });
    };

    /**
    set a marker to a specific position
    */
    var setMarker = function(marker, position) {

        marker.setPosition(position);
        marker.setAnimation(maps.Animation.DROP);
    };

    /**
    set marker with a center
    */
    var setMarkerWithCenter = function() {

        var center = map.getCenter();
        var bounds = map.getBounds();
        var x = bounds.getNorthEast();
        var y = bounds.getSouthWest();

        var d = Math.abs(x.lng() - y.lng());
        x = d / 4;
        setMarker(markers.start, new maps.LatLng(center.lat(), center.lng() - x));
        setMarker(markers.end, center);
        setMarker(markers.lookat, new maps.LatLng(center.lat(), center.lng() + x));
    };

    /**
    show map with appropriate settings
    */
    var showMap = function(data) {

        document.querySelector(".active").classList.remove("active");
        document.querySelector("#mappercontainer").classList.add("active");

        if (data.start) {

            var startloc = new maps.LatLng(data.start[0], data.start[1]),
                endloc = new maps.LatLng(data.end[0], data.end[1]),
                lookatloc = new maps.LatLng(data.lookat[0], data.lookat[1]);

            map.setCenter(lookatloc);
            var bounds = map.getBounds();
            bounds.extend(startloc);
            bounds.extend(endloc);

            setMarker(markers.start, startloc);
            setMarker(markers.end, endloc);
            setMarker(markers.lookat, lookatloc);
        } else {
            if (data.center) {

                map.setCenter(new maps.LatLng(data.center[0], data.center[1]));
            }
            setMarkerWithCenter();
        }
    };

    /**
    geocode map with query
    */
    var geocodeMap = function(data) {

        var query = data.query;

        geocoder.geocode({
            address: query
        }, function(response, status) {

            if (status === maps.GeocoderStatus.OK) {

                map.setCenter(response[0].geometry.location);
                setMarkerWithCenter();
            }
        });
    };

    /**
    get suggestions for a query from places api
    */
    var getSuggestions = function(data) {};

    window.sendMessage = function (id, data) {

        data = data || {};

        var d = JSON.stringify({
            id: id,
            data: data
        });

        window.external.notify(d);
    };

    window.receiveMessage = function(d) {

        var data = JSON.parse(d);

        switch (data.id) {

            case Message.Web.SHOW_MAP:
                showMap(data.data);
                break;
            case Message.Web.SEARCH_MAP:
                geocodeMap(data.data);
                break;
            case Message.Web.GET_SEARCH_SUGGESTIONS:
                getSuggestions(data.data);
                break;
            default:
                console.log("No Web handler for event id", data.id);
        }
    };

    window.onload = init;
})(window, document, google.maps);
