(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/profile/profile.html", {

        processed: function(element) {

            return WinJS.Binding.processAll(element, HL.getCurrentUser()).done(function() {
                
                WinJS.Resources.processAll(element);
            });
        },

        ready: function (element, options) {

            var i = 1 + parseInt(HL.desktop.backImageCount * Math.random());

            $(".profile").setStyle("background-image", "url(\"/images/hubBack/" + i + ".jpg\")");
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in layout.
        }
    });
})();
