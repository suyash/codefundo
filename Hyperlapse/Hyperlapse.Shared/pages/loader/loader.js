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

            if (!HL.currentlyLoading && !HL.loaded) {

                var ob = {
                    options: options,
                    progress: "0%",
                    currentSection: 0,
                    mapimage: getImageUrl(options.startlat, options.startlong, options.endlat, options.endlong, options.lookatlat, options.lookatlong)
                };
                HL.hyperlapseData = WinJS.Binding.as(ob);
            }
        },

        processed: function(element) {

            return WinJS.Binding.processAll(element, HL.hyperlapseData).then(function() {
                
                if (HL.signedIn) {
                    HL.setSignedinBox();
                } else {
                    HL.setSignedoutBox();
                }
            }).then(function() {

                return WinJS.Resources.processAll();
            });
        },

        ready: function (element, options) {

            $(".loadbutton").listen("click", function() {

                HL.hyperlapseData.currentSection = 1;

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
