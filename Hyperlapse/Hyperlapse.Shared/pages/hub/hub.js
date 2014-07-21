(function () {
    "use strict";

    var nav = WinJS.Navigation;
    var session = WinJS.Application.sessionState;
    var util = WinJS.Utilities;

    var previewlist = null,
        locationlist = null;

    WinJS.UI.Pages.define("/pages/hub/hub.html", {

        processed: function (element) {

            previewlist = $(".previewsection .previewlist > div")[0];
            locationlist = $(".mappersection .previewlist > div")[0];

            if (!HL.topPresets.length || !HL.topLocations.length) {

                var presets = hyperlapseClient.getTable("presets"),
                    locations = hyperlapseClient.getTable("locations");

                var presetsPromise = presets.take(5).read().then(function(results) {

                    //HL.topPresets.push(results);
                    for (var i = 0; i < results.length; i++) {

                        HL.topPresets.push(results[i]);
                    }

                    previewlist.addEventListener("iteminvoked", function(e) {

                        var index = e.detail.itemIndex;

                        WinJS.Navigation.navigate("/pages/loader/loader.html", HL.topPresets.getAt(index));
                    });
                }, function(error) {

                    console.log("Cannot get top presets", error);
                });

                var locationsPromise = locations.take(5).read().then(function (results) {

                    //HL.topLocations.push(results);

                    for (var i = 0; i < results.length; i++) {

                        HL.topLocations.push(results[i]);
                    }

                    locationlist.addEventListener("iteminvoked", function(e) {

                        var index = e.detail.itemIndex;

                        WinJS.Navigation.navigate("/pages/mapper/mapper.html", HL.topLocations.getAt(index));
                    });
                }, function(error) {

                    console.log("Cannot get top presets", error);
                });

                return WinJS.Promise.join([presetsPromise, locationsPromise]).then(function() {

                    return WinJS.Resources.processAll(element);
                });
            } else {

                return WinJS.Resources.processAll(element);
            }
        },

        ready: function (element, options) {

            if (!HL.isPhone) {

                var i = 1 + parseInt(HL.desktop.backImageCount * Math.random());

                $(".hubpage").setStyle("background-image", "url(\"/images/hubBack/" + i + ".jpg\")");
            }

            var hub = element.querySelector(".hub").winControl;

            hub.onheaderinvoked = function (args) {

                args.detail.section.onheaderinvoked(args);
            };

            hub.onloadingstatechanged = function (args) {

                if (args.srcElement === hub.element && args.detail.loadingState === "complete") {

                    hub.onloadingstatechanged = null;

                    if (!HL.isPhone) {

                        previewlist.winControl.onloadingstatechanged = function (args) {

                            if (previewlist.winControl.loadingState === "complete") {

                                $(".section1previewitem").listen("mouseenter", function (e) {

                                    var index = previewlist.winControl.indexOfElement(e.target);

                                    var data = HL.topPresets.getAt(index);

                                    $(".previewsection .previewimage").setStyle("background-image", "url(\"" + data.previewimageurl + "\")");
                                });
                            }
                        }

                        locationlist.winControl.onloadingstatechanged = function (args) {

                            if (locationlist.winControl.loadingState === "complete") {

                                $(".section2previewitem").listen("mouseenter", function (e) {

                                    var index = previewlist.winControl.indexOfElement(e.target);

                                    var data = HL.topLocations.getAt(index);

                                    //$(".previewsection .previewimage").setStyle("background-image", "url(\"" + data.previewimageurl + "\")");
                                });
                            }
                        }
                    } else {

                        $("#appbar").removeClass("hidden");
                    }
                }
            }
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in layout.
        },

        /**
        Called when mapper is invoked
        */
        onMapperInvoked: util.markSupportedForProcessing(function () {

            nav.navigate("/pages/mapper/mapper.html");
        })
    });
})();