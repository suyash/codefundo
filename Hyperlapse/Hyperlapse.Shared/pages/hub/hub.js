(function () {
    "use strict";

    var nav = WinJS.Navigation;
    var session = WinJS.Application.sessionState;
    var util = WinJS.Utilities;

    WinJS.UI.Pages.define("/pages/hub/hub.html", {

        processed: function (element) {

            /**
            get top presets from azure
            */
            var presets = hyperlapseClient.getTable("presets");

            return presets.take(5).read().then(function (results) {

                HL.topPresets = new WinJS.Binding.List(results);

                var list = $(".previewlist > div")[0];

                list.winControl.itemDataSource = HL.topPresets.dataSource;
            }, function (error) {

                console.log("Cannot get top presets", err);
            }).then(function() {
                
                return WinJS.Resources.processAll(element);
            });
        },

        ready: function (element, options) {

            var hub = element.querySelector(".hub").winControl;

            var i = 1 + parseInt(HL.desktop.backImageCount * Math.random());

            $(".hubpage").setStyle("background-image", "url(\"/images/hubBack/" + i + ".jpg\")");

            hub.onheaderinvoked = function (args) {

                args.detail.section.onheaderinvoked(args);
            };

            hub.onloadingstatechanged = function (args) {

                if (args.srcElement === hub.element && args.detail.loadingState === "complete") {

                    hub.onloadingstatechanged = null;
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