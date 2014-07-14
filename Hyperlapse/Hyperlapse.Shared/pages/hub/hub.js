(function () {
    "use strict";

    var nav = WinJS.Navigation;
    var session = WinJS.Application.sessionState;
    var util = WinJS.Utilities;

    WinJS.UI.Pages.define("/pages/hub/hub.html", {

        processed: function (element) {

            return WinJS.Resources.processAll(element);
        },

        ready: function (element, options) {

            var hub = element.querySelector(".hub").winControl;

            hub.onheaderinvoked = function (args) {

                args.detail.section.onheaderinvoked(args);
            };

            hub.onloadingstatechanged = function (args) {

                if (args.srcElement === hub.element && args.detail.loadingState === "complete") {

                    hub.onloadingstatechanged = null;
                    // hub loaded
                    if (HL.isPhone) {

                        HL.phone.setPivot();
                    } else {

                        HL.desktop.setHub();
                    }
                }
            }

            // TODO: Initialize the page here.
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in layout.
        },
    });
})();