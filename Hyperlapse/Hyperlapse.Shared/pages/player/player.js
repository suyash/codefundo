(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/player/player.html", {

        processed: function(element) {
            
            if (HL.signedIn) {
                HL.setSignedinBox();
            } else {
                HL.setSignedoutBox();
            }
        },

        ready: function (element, options) {

            $("#localcontenthost").addClass("onplayer");
        },

        unload: function () {},

        updateLayout: function (element) {}
    });
})();
