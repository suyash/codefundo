(function() {

    "use strict";

    var ui = WinJS.UI;
    var nav = WinJS.Navigation;
    var sched = WinJS.Utilities.Scheduler;

    /**
    current user id
    */
    var userData = null;

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
    Create a flyout with a root
    */
    var setFlyout = function(flyout, root) {
        
        WinJS.Resources.processAll(flyout);

        flyout.addEventListener("beforeshow", function () {

            root.classList.add("pressed");
        });

        flyout.addEventListener("afterhide", function () {

            root.classList.remove("pressed");
        });
    };

    /**
    show a message dialog
    */
    var showDialog = function(header, message, cb) {

        var popup = new Windows.UI.Popups.MessageDialog(header, message);
        popup.showAsync().done(cb);
    };

    /**
    Render sign in box
    */
    var setSignedinBox = function() {

        var template = $("#signedinTemplate")[0],
            context = userData,
            root = $(".signstatus")[0];

        WinJS.Utilities.empty(root);

        template.winControl.render(context, root);
    };

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

            /**
            Login related Setup
            */
            var template = HL.signedIn ? $("#signedinTemplate")[0] : $("#signedoutTemplate")[0],
                context  = HL.signedIn ? userData : {},
                root = $(".signstatus")[0],
                flyout = $(".loginflyout")[0];

            if (!HL.signedIn) {

                setFlyout(flyout, root);
            }

            template.winControl.render(context, root).done(function(el) {

                WinJS.Resources.processAll(root);

                var sel = el.querySelector(".sign");

                sel.addEventListener("pointerdown", function(e) {

                    WinJS.UI.Animation.pointerDown(e.srcElement);
                    flyout.winControl.show(sel, "bottom");
                });

                sel.addEventListener("pointerup", function (e) {

                    WinJS.UI.Animation.pointerUp(e.srcElement);
                });
            });

            /**
            login client event handler
            */
            var handleLogin = function(e) {

                /**
                gets element client based on id
                */
                var getClient = function(id) {

                    if (id === "loginMS") {
                        return "microsoftaccount";
                    } else if (id === "loginFacebook") {
                        return "facebook";
                    } else if (id === "loginTwitter") {
                        return "twitter";
                    } else if (id === "loginGoogle") {
                        return "google";
                    } else {
                        return null;
                    }
                }

                var client = getClient(e.srcElement.id);

                /**
                successful login handler
                */
                var handleSuccess = function (results) {

                    var handleData = function(response) {

                        userData = response.result;
                        setSignedinBox();
                    };

                    var handleDataError = function(err) {

                        showDialog("An Error Occured During login", "Couldn't fetch your data, try again");
                        console.log(err);
                    };

                    return hyperlapseClient.invokeApi("getuserdata", {
                        
                        body: {},
                        method: "get"
                    }).done(handleData, handleDataError);
                };

                /**
                login error handler
                */
                var handleError = function(err) {

                    if (err.responseStatus !== 1) {

                        showDialog("An Error Occured during Login", "Could not log you in, try again");
                    }
                };

                hyperlapseClient.login(client).then(handleSuccess, handleError);
            };

            $("#loginFacebook").listen("click", handleLogin);
            $("#loginTwitter").listen("click", handleLogin);
            $("#loginGoogle").listen("click", handleLogin);
            $("#loginMS").listen("click", handleLogin);
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
