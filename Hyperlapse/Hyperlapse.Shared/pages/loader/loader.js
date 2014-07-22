(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/loader/loader.html", {

        init: function(element, options) {

            if (!HL.currentlyLoading) {

                HL.hyperlapseData = WinJS.Binding.as(options);
                HL.hyperlapseData.progress = 0;
            }
        },

        processed: function(element) {

            return WinJS.Binding.processAll(element, HL.hyperlapseData).then(function() {

                return WinJS.Resources.processAll();
            });
        },

        ready: function (element, options) {
        },

        unload: function () {
        },

        updateLayout: function (element) {
        }
    });
})();
