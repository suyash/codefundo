(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/loader/loader.html", {

        init: function (element, options) {

            var getImageUrl = function (startlat, startlong, endlat, endlong, lookatlat, lookatlong) {

                return [
                    "http://maps.googleapis.com/maps/api/staticmap?",
                    "zoom=",
                    13,
                    "&size=",
                    640,
                    "x",
                    640,
                    "&format=jpg&markers=color:green%7Clabel:L%7C",
                    lookatlat,
                    ",",
                    lookatlong,
                    "&markers=color:red%7Clabel:S%7C",
                    startlat,
                    ",",
                    startlong,
                    "&markers=color:blue%7Clabel:E%7C",
                    endlat,
                    ",",
                    endlong
                ].join("");
            };

            /**
            create a deepcopy of an object
            */
            var deepcopy = function(ob) {

                var o = {};

                for (var x in ob) {

                    o[x] = ob[x];
                }

                return o;
            };

            /**
            If another hyperlapse is not loading and
            another hyperlapse is not loaded or
            another hyperlapse is loaded and is not the same as current hyperlapse
            then create a new hyperlapse
            */
            if (!HL.currentlyLoading && (!HL.hyperlapseData || (options.id !== HL.hyperlapseData.options.id))){
                
                if (!HL.hyperlapseData) {

                    var ob = {
                        options: deepcopy(options),
                        progress: "0%",
                        currentSection: 0,
                        mapimage: getImageUrl(options.startlat, options.startlong, options.endlat, options.endlong, options.lookatlat, options.lookatlong)
                    };

                    HL.hyperlapseData = WinJS.Binding.as(ob);
                } else {

                    for (var x in options) {

                        HL.hyperlapseData.options[x] = options[x];
                    }

                    HL.hyperlapseData.progress = "0%";
                    HL.hyperlapseData.currentSection = 0;
                    HL.hyperlapseData.mapimage = getImageUrl(options.startlat, options.startlong, options.endlat, options.endlong, options.lookatlat, options.lookatlong);
                }
            } else {

                if (HL.currentlyLoading) {

                    var popup = new Windows.UI.Popups.MessageDialog("Another Hyperlapse is Loading", "Please Wait");
                    popup.showAsync().done();
                }
            }
        },

        processed: function(element) {

            return WinJS.Binding.processAll(element, HL.hyperlapseData).then(function() {

                return WinJS.Resources.processAll();
            });
        },

        ready: function (element, options) {

            $(".loadbutton").listen("click", function() {

                HL.hyperlapseData.currentSection = 1;

                HL.currentlyLoading = true;

                HL.sendMessage(Message.Web.LOAD_HYPERLAPSE, HL.hyperlapseData.options);
            });

            $(".playbutton").listen("click", function () {

                if (HL.loaded) {

                    WinJS.Navigation.navigate("/pages/player/player.html");
                    HL.sendMessage(Message.Web.SHOW_HYPERLAPSE);
                }
            });
        },

        unload: function () {},

        updateLayout: function (element) {}
    });
})();
