(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/presets/presets.html", {

        processed: function(element) {

            return WinJS.Resources.processAll(element);
        },

        ready: function(element, options) {

            /**
            Add Background
            */
            if (!HL.isPhone) {

                HL.desktop.addBackgroundImage(".presets");
            }

            /**
            get presets if already not obtained
            */
            if (!HL.allPresets.length) {

                var table = hyperlapseClient.getTable("presets");

                table.read().then(function(results) {

                    for (var i = 0; i < results.length; i++) {

                        HL.allPresets.push(results[i]);
                    }
                }, function(err) {

                    console.log(err);
                }).done(function() {

                    $(".loadingcontainer").addClass("hidden");
                });
            } else {

                $(".loadingcontainer").addClass("hidden");
            }

            /**
            listview
            */
            var list = $(".presetslist")[0].winControl;

            list.oniteminvoked = function(e) {

                var index = e.detail.itemPromise.handle;

                WinJS.Navigation.navigate("/pages/loader/loader.html", HL.allPresets.getAt(index - 1));
            };
        },

        unload: function () {},

        updateLayout: function (element) {}
    });
})();
