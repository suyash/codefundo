(function(window, document, maps) {

    "use strict";

    var mapelement = null,
        map = null,
        markers = {
            start: null,
            end: null,
            lookat: null
        };

    var init = function() {
        
        document.body.addEventListener("click", function () {

            console.log("click!!!");
        });

        mapelement = document.querySelector("#map");

        map = new maps.Map(mapelement, {
            center: new maps.LatLng(29.8644, 77.8964),
            zoom: 11,
            streetViewControl: false
        });

        markers.start = new maps.Marker({
            map: map,
            draggable: true,
            icon: '/images/markers/start.png',
            title: 'Start Point'
        });

        markers.end = new maps.Marker({
            map: map,
            draggable: true,
            icon: '/images/markers/end.png',
            title: 'End Point'
        });

        markers.lookat = new maps.Marker({
            map: map,
            draggable: true,
            icon: '/images/markers/lookat.png',
            title: 'Lookat Point'
        });
    };

    var setMarker = function(marker, position) {

        marker.setPosition(position);
        marker.setAnimation(maps.Animation.DROP);
    };

    var showMap = function(data) {

        document.querySelector(".active").classList.remove("active");
        document.querySelector("#mappercontainer").classList.add("active");

        if (data.start) {
        } else if (data.center) {
        } else {

            var center = map.getCenter();
            setMarker(markers.start, center);
            setMarker(markers.end, center);
            setMarker(markers.lookat, center);
        }
    };

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
                showMap(data);
                break;
        }
    };

    window.onload = init;
})(window, document, google.maps);
