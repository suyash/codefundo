(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/loader/loader.html", {

        init: function(element, options) {

            if (!HL.currentlyLoading) {

                var ob = {
                    options: options,
                    progress: "0%",
                    currentSection: 0
                };
                HL.hyperlapseData = WinJS.Binding.as(ob);
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

                HL.sendMessage(Message.Web.LOAD_HYPERLAPSE, HL.hyperlapseData.options);
            });
        },

        unload: function () {
        },

        updateLayout: function (element) {
        }
    });
})();
