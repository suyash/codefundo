(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/player/player.html", {

        processed: function(element) {

            return WinJS.Resources.processAll(element);
        },

        ready: function (element, options) {

            $("#localcontenthost").addClass("onplayer");

            if (!HL.isPhone) {

                HL.$appbar.removeClass("hidden");
                HL.$appbar[0].winControl.show();
            }

            HL.$appbar[0].winControl.showCommands(["playhlcommand"]);
        },

        unload: function() {
            
            $("#localcontenthost").removeClass("onplayer");

            HL.$appbar[0].winControl.hideCommands(["playhlcommand"]);

            if (HL.playing) {

                HL.sendMessage(Message.Web.PAUSE_HYPERLAPSE);
            }
        },

        updateLayout: function (element) {}
    });
})();
