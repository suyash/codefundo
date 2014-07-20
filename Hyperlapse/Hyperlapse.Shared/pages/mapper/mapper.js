(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/mapper/mapper.html", {

        init: function(element, options) {
            
            HL.sendMessage(Message.Web.SHOW_MAP, options);
            HL.$appbar.removeClass("hidden");
            HL.$appbar.query(".appbarcommand").addClass("hidden");
            HL.$appbar.query(".mappercommand").removeClass("hidden");
        },

        ready: function (element, options) {
            
            $("#localcontenthost").addClass("onmapper");
        },

        unload: function () {
        },

        updateLayout: function (element) {
        }
    });
})();
