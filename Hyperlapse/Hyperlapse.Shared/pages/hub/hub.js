(function () {
    "use strict";

    var nav = WinJS.Navigation;
    var session = WinJS.Application.sessionState;
    var util = WinJS.Utilities;

    var previewlist = null,
        locationlist = null;

    WinJS.UI.Pages.define("/pages/hub/hub.html", {

        /**
        WinJS.UI.processAll has been called, return anything else t execute in a promise
        */
        processed: function (element) {

            /**
            listview elements
            */
            previewlist = $(".previewsection .previewlist > div")[0];
            locationlist = $(".mappersection .previewlist > div")[0];

            /**
            if either of the list is empty
            */
            if (!HL.topPresets.length || !HL.topLocations.length) {

                var presets = hyperlapseClient.getTable("presets"),
                    locations = hyperlapseClient.getTable("locations");

                /**
                get top presets from azure
                */
                var presetsPromise = presets.take(5).read().then(function(results) {

                    for (var i = 0; i < results.length; i++) {

                        HL.topPresets.push(results[i]);
                    }
                }, function(error) {

                    console.log("Cannot get top presets", error);
                });

                /**
                get top locations from azure
                */
                var locationsPromise = locations.take(5).read().then(function (results) {

                    for (var i = 0; i < results.length; i++) {

                        HL.topLocations.push(results[i]);
                    }
                }, function(error) {

                    console.log("Cannot get top presets", error);
                });

                return WinJS.Promise.join([presetsPromise, locationsPromise]).then(function() {

                    previewlist.addEventListener("iteminvoked", function (e) {

                        var index = e.detail.itemIndex;

                        WinJS.Navigation.navigate("/pages/loader/loader.html", HL.topPresets.getAt(index));
                    });

                    locationlist.addEventListener("iteminvoked", function (e) {

                        var index = e.detail.itemIndex;

                        WinJS.Navigation.navigate("/pages/mapper/mapper.html", HL.topLocations.getAt(index));
                    });

                    return WinJS.Resources.processAll(element);
                });
            } else {

                previewlist.addEventListener("iteminvoked", function (e) {

                    var index = e.detail.itemIndex;

                    WinJS.Navigation.navigate("/pages/loader/loader.html", HL.topPresets.getAt(index));
                });

                locationlist.addEventListener("iteminvoked", function (e) {

                    var index = e.detail.itemIndex;

                    WinJS.Navigation.navigate("/pages/mapper/mapper.html", HL.topLocations.getAt(index));
                });

                return WinJS.Resources.processAll(element);
            }
        },

        /**
        after processed, do stuff related to things loaded after DOM
        */
        ready: function (element, options) {

            if (!HL.isPhone) {

                HL.desktop.addBackgroundImage(".hubpage");
            } else {

                $("#appbar").removeClass("hidden");

                $("#gotomapper").listen("click", function () {

                    nav.navigate("/pages/mapper/mapper.html");
                });

                $("#gotopresets").listen("click", function () {

                    nav.navigate("/pages/presets/presets.html");
                });
            }

            var hub = element.querySelector(".hub").winControl;

            hub.onheaderinvoked = function (args) {

                args.detail.section.onheaderinvoked(args);
            };

            hub.onloadingstatechanged = function (args) {

                if (hub.loadingState === "complete") {

                    hub.onloadingstatechanged = null;

                    if (!HL.isPhone) {

                        /**
                        adds event listener to every item for mouse enter in preview list
                        */
                        var addPreviewListener = function() {
                            
                            $(".section1previewitem").listen("mouseenter", function (e) {

                                var index = previewlist.winControl.indexOfElement(e.target);

                                var data = HL.topPresets.getAt(index);

                                $(".previewsection .previewimage").setStyle("background-image", "url(\"" + data.previewimageurl + "\")");
                            });
                        };

                        /**
                        adds event listener to every item for mouse enter in mapper list
                        */
                        var addMapperListener = function () {

                            $(".section2previewitem").listen("mouseenter", function (e) {

                                var previewel = $(".mappersection .previewimage");

                                /**
                                returns Google static maps API url for the given location
                                */
                                var getStaticMapURL = function (d) {

                                    var url = [
                                        "http://maps.googleapis.com/maps/api/staticmap?center=",
                                        data.centerlat,
                                        ",",
                                        d.centerlong,
                                        "&zoom=",
                                        15,
                                        "&size=",
                                        640,
                                        "x",
                                        640,
                                        "&format=jpg&markers=color:green%7C",
                                        d.centerlat,
                                        ",",
                                        d.centerlong
                                    ];

                                    return url.join("");
                                };

                                var index = locationlist.winControl.indexOfElement(e.target);

                                var data = HL.topLocations.getAt(index);

                                previewel.setStyle("background-image", "url(\"" + getStaticMapURL(data) + "\")");
                            });
                        };

                        if (previewlist.winControl.loadingState === "complete") {

                            addPreviewListener();
                        } else {

                            previewlist.winControl.onloadingstatechanged = function (args) {

                                if (previewlist.winControl.loadingState === "complete") {

                                    previewlist.winControl.onloadingstatechanged = null;
                                    addPreviewListener();
                                }
                            }
                        }

                        if (locationlist.winControl.loadingState === "complete") {

                            addMapperListener();
                        } else {

                            locationlist.winControl.onloadingstatechanged = function(args) {

                                if (locationlist.winControl.loadingState === "complete") {

                                    locationlist.winControl.onloadingstatechanged = null;
                                    addMapperListener();
                                }
                            }
                        }
                    }
                }
            }
        },

        unload: function() {},

        updateLayout: function (element) {},

        /**
        Called when mapper is invoked
        */
        onMapperInvoked: util.markSupportedForProcessing(function () {

            nav.navigate("/pages/mapper/mapper.html");
        }),

        /**
        Called when viewer is invoked
        */
        onViewerInvoked: util.markSupportedForProcessing(function () {

            nav.navigate("/pages/presets/presets.html");
        })
    });
})();
