(function() {

    "use strict";

    var ui = WinJS.UI;
    var nav = WinJS.Navigation;
    var sched = WinJS.Utilities.Scheduler;

    WinJS.Namespace.define("HL", {});

    /**
    defaults to false, gets set to true if on a phone
    */
    HL.isPhone = false;

    /**
    Namespace for desktop specific methods / members
    */
    HL.desktop = {};

    /**
    Namespace for phone specific methods / members
    */
    HL.phone = {};

    /**
    Number of background images, one is loaded randomly on startup
    */
    HL.desktop.backImageCount = 5;

    /**
    common setup operations
    */
    HL.setup = function () {

        return ui.processAll().then(function () {

            return nav.navigate(nav.location || Application.navigator.home, nav.state);
        }).then(function () {

            return sched.requestDrain(sched.Priority.aboveNormal + 1);
        }).then(function () {

            ui.enableAnimations();
        }).then(function () {

            if (HL.isPhone) {

                HL.phone.setup();
            } else {

                HL.desktop.setup();
            }
        }).then(function() {

            HL.checkSigninStatus();
        }).then(function() {

            var template = HL.signedIn ? $("#signedinTemplate")[0] : $("#signedoutTemplate")[0],
                context  = HL.signedIn ? {} : {},
                root = $(".signstatus")[0];

            template.winControl.render(context, root).done(function(el) {

                WinJS.Resources.processAll(root);

                var sel = el.querySelector(".sign");

                sel.onmousedown = function () {

                    sel.classList.add("pressed");
                };

                sel.onmouseup = function () {

                    sel.classList.remove("pressed");
                };
            });
        });
    };

    /**
    Hide splash screen
    */
    HL.hideSplash = function() {

        $("#splashContainer").addClass("hidden");
        $("#contenthost").removeClass("hidden");
    };

    /**
    Desktop mode specific setup options
    */
    HL.desktop.setup = function () {

        
        var i = 1 + parseInt(HL.desktop.backImageCount * Math.random());

        $(".hubpage").setStyle("background-image", "url(\"/images/hubBack/" + i + ".jpg\")");
    };

    /**
    Phone mode specific setup options
    */
    HL.phone.setup = function () {};

    /**
    create hub for desktop
    */
    HL.desktop.setHub = function () {
    };

    /**
    signed in flag, true for a signed in user
    */
    HL.signedIn = false;

    /**
    check signin status
    */
    HL.checkSigninStatus = function () {};

    /**
    Random shit to delete in production
    */
    HL.sampleList = new WinJS.Binding.List([
        {
            id: "1"
        },
        {
            id: 2
        },
        {
            id: 3
        },
        {
            id: 4
        },
        {
            id: 5
        }
    ]);

})();
