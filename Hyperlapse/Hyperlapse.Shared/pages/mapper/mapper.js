﻿(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/mapper/mapper.html", {

        init: function(element, options) {

            var o = HL.markerLocations;

            if (o.start[0] === o.end[0] && o.start[1] === o.end[1]) {

                o = {
                    center: HL.markerLocations.start
                }
            }

            HL.sendMessage(Message.Web.SHOW_MAP, o);
            HL.$appbar.removeClass("hidden");
            HL.$appbar.query(".appbarcommand").addClass("hidden");
            HL.$appbar.query(".mappercommand").removeClass("hidden");
        },

        ready: function (element, options) {
            
            $("#localcontenthost").addClass("onmapper");
            HL.$appbar[0].winControl.show();

            /**
            set up search
            */
            var searchbox = $("#mappersearch")[0];

            searchbox.addEventListener("querysubmitted", function (e) {

                HL.sendMessage(Message.Web.SEARCH_MAP, {
                    query: e.detail.queryText
                });
            });

            searchbox.addEventListener("suggestionsrequested", function(e) {

                HL.sendMessage(Message.Web.GET_SEARCH_SUGGESTIONS, {
                    query: e.detail.queryText
                });
            });
        },

        unload: function () {
        },

        updateLayout: function (element) {
        }
    });
})();
