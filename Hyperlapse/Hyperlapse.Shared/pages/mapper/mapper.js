﻿(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/mapper/mapper.html", {

        init: function(element, options) {

            var o = null;

            if (options) {

                o = {
                    center: [options.centerlat, options.centerlong]
                };
            } else {

                o = HL.markerLocations;

                if (o.start[0] === o.end[0] && o.start[1] === o.end[1]) {

                    o = {
                        center: HL.markerLocations.start
                    }
                }
            }

            HL.sendMessage(Message.Web.SHOW_MAP, o);
            HL.$appbar.removeClass("hidden");

            $(".webview").removeClass("invisible");

            if (HL.isPhone) {

                HL.$appbar[0].winControl.showCommands("launchHL");
                $("#herohost").addClass("hidden");
            } else {

                HL.$appbar[0].winControl.showCommands(["launchhlcommand"]);
            }
        },

        processed: function(element) {

            return WinJS.Resources.processAll(element);
        },

        ready: function (element, options) {
            
            $("#localcontenthost").addClass("onmapper");

            if (!HL.isPhone) {

                HL.$appbar[0].winControl.show();
            }

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

            $("#localcontenthost").removeClass("onmapper");
            HL.$appbar.addClass("hidden");

            $(".webview").removeClass("invisible");

            if (HL.isPhone) {

                HL.$appbar[0].winControl.hideCommands("launchHL");
                $("#herohost").removeClass("hidden");
            } else {

                HL.$appbar[0].winControl.hideCommands(["launchhlcommand"]);
            }
        },

        updateLayout: function (element) {
        }
    });
})();
