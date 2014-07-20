(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/loader/loader.html", {

        init: function(element, options) {

            if (!HL.currentLyLoading) {

                HL.currentlyLoading = WinJS.Binding.as(options);
                HL.currentlyLoading.progress = 0;
                HL.sendMessage();
            }
        },

        processed: function(element) {

            return WinJS.Binding.processAll(element, HL.currentlyLoading).then(function() {

                return WinJS.Resources.processAll();
            });
        },

        ready: function (element, options) {

            var i = 1 + parseInt(HL.desktop.backImageCount * Math.random());

            $(".loader").setStyle("background-image", "url(\"/images/hubBack/" + i + ".jpg\")");
        },

        unload: function () {
        },

        updateLayout: function (element) {
        }
    });
})();
