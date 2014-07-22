(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/loader/loader.html", {

        init: function(element, options) {

            if (!HL.currentlyLoading) {

                var ob = {
                    options: options,
                    progress: "0%"
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

                $(".loadbuttoncontainer").addClass("hidden");

                $(".progressdata").removeClass("hidden");

                HL.sendMessage(Message.Web.LOAD_HYPERLAPSE, HL.hyperlapseData);
            });
        },

        unload: function () {
        },

        updateLayout: function (element) {
        }
    });
})();
