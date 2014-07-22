(function() {

    "use strict";

    var ui = WinJS.UI;
    var nav = WinJS.Navigation;
    var sched = WinJS.Utilities.Scheduler;
    var vault = new Windows.Security.Credentials.PasswordVault();
    var applicationData = Windows.Storage.ApplicationData.current;
    var roamingSettings = applicationData.roamingSettings;

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
    marker locations
    */
    HL.markerLocations = {
        
        start: [29.8644, 77.8964],
        end: [29.8644, 77.8964],
        lookAt: [29.8644, 77.8964]
    };

    /**
    currentlyLoading, wlll be true if currently loading hyperlapse request
    */
    HL.currentlyLoading = false;

    /**
    true if a loaded hyperlapse is already there
    */
    HL.loaded = false;

    /**
    will store data for curently loading/loaded hyperlapse request
    */
    HL.hyperlapseData = null;

    /**
    all presets from azure
    */
    HL.allPresets = new WinJS.Binding.List();

    /**
    all presets grouped
    */
    HL.allPresetsGrouped = HL.allPresets.createGrouped(
        function _getkey(o) {

            return o.title.toUpperCase().charAt(0);
        },
        function _groupData(o) {

            return {
                title: o.title.toUpperCase().charAt(0)
            };
        },
        function _sort(k1, k2) {

            return k1.charCodeAt(0) - k2.charCodeAt(0);
        }
    );

    /**
    top presets from azure
    */
    HL.topPresets = new WinJS.Binding.List();

    /**
    top locations from azure
    */
    HL.topLocations = new WinJS.Binding.List();

    /**
    Number of background images, one is loaded randomly on startup
    */
    HL.desktop.backImageCount = 5;

    /**
    adds a background image for desktop
    */
    HL.desktop.addBackgroundImage = function (s) {

        var i = 1 + parseInt(HL.desktop.backImageCount * Math.random());

        $(s).setStyle("background-image", "url(\"/images/hubBack/" + i + ".jpg\")");
    };

    /**
    binding converter to get a url for css background-image property
    */
    HL.getBackgroundImageUrl = WinJS.Binding.converter(function(url) {
        
        return "url(\"" + url + "\")";
    });

    /**
    binding converter to get latitude
    */
    HL.getLatitude = WinJS.Binding.converter(function(n) {

        return n.toFixed(2) + (n > 0 ? "N" : "S");
    });

    /**
    binding converter to get longitude
    */
    HL.getLongitude = WinJS.Binding.converter(function (n) {

        return n.toFixed(2) + (n > 0 ? "E" : "W");
    });

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
    HL.setSignedinBox = function() {

        HL.signedIn = true;
        var template = $("#signedinTemplate")[0],
            context = userData,
            root = $(".signstatus")[0],
            flyout = null;

        if (!HL.isPhone) {

            flyout = $(".loggedinflyout")[0];
            setFlyout(flyout, root);
        } else {
            $("#appbar")[0].winControl.hideCommands(["loginHeader", "loginMS", "loginTwitter", "loginGoogle", "loginFacebook"]);
            $("#appbar")[0].winControl.showCommands(["accountUser", "logoutUser"]);
        }

        WinJS.Utilities.empty(root);

        return template.winControl.render(context, root).then(function(el) {

            WinJS.Resources.processAll(root);

            var sel = el.querySelector(".sign");

            sel.addEventListener("pointerdown", function (e) {

                WinJS.UI.Animation.pointerDown(e.srcElement);

                if (HL.isPhone) {
                    HL.$appbar[0].winControl.show();
                } else {
                    flyout.winControl.show(sel, "bottom");
                }
            });

            sel.addEventListener("pointerup", function (e) {

                WinJS.UI.Animation.pointerUp(e.srcElement);
            });
        }).done(function() {

            $("#logoutUser").listen("click", function() {

                HL.logout();
            });

            $("#accountUser").listen("click", function() {

                nav.navigate("/pages/profile/profile.html");
            });
        });
    };

    /**
    Render sign out box
    */
    HL.setSignedoutBox = function () {

        HL.signedIn = false;
        var template = $("#signedoutTemplate")[0],
            context = {},
            root = $(".signstatus")[0],
            flyout = null;

        if (!HL.isPhone) {

            flyout = $(".loginflyout")[0];
            setFlyout(flyout, root);
        } else {
            $("#appbar")[0].winControl.showCommands(["loginHeader", "loginMS", "loginTwitter", "loginGoogle", "loginFacebook"]);
            $("#appbar")[0].winControl.hideCommands(["accountUser", "logoutUser"]);
        }

        WinJS.Utilities.empty(root);

        return template.winControl.render(context, root).then(function (el) {

            WinJS.Resources.processAll(root);

            var sel = el.querySelector(".sign");

            sel.addEventListener("pointerdown", function (e) {

                WinJS.UI.Animation.pointerDown(e.srcElement);

                if (HL.isPhone) {
                    HL.$appbar[0].winControl.show();
                } else {
                    flyout.winControl.show(sel, "bottom");
                }
            });

            sel.addEventListener("pointerup", function (e) {

                WinJS.UI.Animation.pointerUp(e.srcElement);
            });
        }).done(function() {

            $("#loginFacebook").listen("click", handleLogin);
            $("#loginTwitter").listen("click", handleLogin);
            $("#loginGoogle").listen("click", handleLogin);
            $("#loginMS").listen("click", handleLogin);
        });
    };

    /**
    Get user Data from client
    */
    var getUserData = function() {
        
        var handleData = function (response) {

            userData = WinJS.Binding.as(response.result);
            HL.setSignedinBox();

            /**
            Set Roaming Data
            */
            var composite = new Windows.Storage.ApplicationDataCompositeValue();
            composite.firstname = userData.firstname;
            composite.lastname = userData.lastname;
            composite.img = userData.img;

            roamingSettings.values["userData"] = composite;
        };

        var handleDataError = function (err) {

            showDialog("An Error Occured During login", "Couldn't fetch your data, try again");
            HL.logout();
            console.log(err);
        };

        return hyperlapseClient.invokeApi("getuserdata", {

            body: {},
            method: "get"
        }).done(handleData, handleDataError);
    };

    /**
    login client event handler
    */
    var handleLogin = function (e) {

        /**
        gets element client based on id
        */
        var getClient = function (id) {

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
        var handleSuccess = function(results) {

            var credential = new Windows.Security.Credentials.PasswordCredential("Login", results.userId, results.mobileServiceAuthenticationToken);
            vault.add(credential);

            getUserData();
        };

        /**
        login error handler
        */
        var handleError = function (err) {

            if (err.responseStatus !== 1) {

                showDialog("An Error Occured during Login", "Could not log you in, try again");
            }
            console.log(err);
        };

        hyperlapseClient.login(client).then(handleSuccess, handleError);
    };

    /**
    The web context holder
    */
    var webview = null;

    /**
    cache the appbar element
    */
    HL.$appbar = null;

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
            /**
            common setup options
            */
            HL.$appbar = $("#appbar");
            WinJS.Resources.processAll(HL.$appbar[0]);
        }).then(function () {

            if (HL.isPhone) {

                return HL.phone.setup();
            } else {

                return HL.desktop.setup();
            }
        }).then(function () {

            
        }).then(function () {

            /**
            set webview
            */
            webview = $(".webview")[0];
            webview.navigate("ms-appx-web:///Web/html/main.html");
            webview.addEventListener("MSWebViewScriptNotify", HL.receiveMessage);
        }).then(function () {

            return HL.checkSigninStatus();
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
    HL.desktop.setup = function () {};

    /**
    Phone mode specific setup options
    */
    HL.phone.setup = function() {

        //Windows.UI.ViewManagement.ApplicationView.getForCurrentView().setDesiredBoundsMode(Windows.UI.ViewManagement.ApplicationViewBoundsMode.useCoreWindow);
    };

    /**
    signed in flag, true for a signed in user
    */
    HL.signedIn = false;

    /**
    Check if current credential is expired or not
    */
    var testCredential = function(credential) {

        var users = hyperlapseClient.getTable("users");

        return users.take(1).read().done(function(r) {
            
            /**
            Current credentials are fine, 
            get userData from Application roaming data if present, 
            else from client
            */
            var data = roamingSettings.values["userData"];

            if (data && data.firstname) {
                userData = WinJS.Binding.as({
                    firstname: data.firstname,
                    lastname: data.lastname,
                    img: data.img
                });
                return HL.setSignedinBox();
            } else {
                return getUserData();
            }
        }, function(err) {
            
            /**
            Couldn't read so credential expired
            */
            vault.remove(credential);
            hyperlapseClient.currentUser = null;
            return HL.setSignedoutBox();
        });
    };

    /**
    check signin status
    */
    HL.checkSigninStatus = function() {

        var credential = null;

        try {
            credential = vault.findAllByResource("Login").getAt(0);
        } catch (e) {
            return HL.setSignedoutBox();
        }

        console.log("signing in...");
        credential.retrievePassword();

        hyperlapseClient.currentUser = {
            
            userId: credential.userName,
            mobileServiceAuthenticationToken: credential.password
        };

        return testCredential(credential);
    };

    /**
    log a user out
    */
    HL.logout = function() {

        try {

            var credential = vault.findAllByResource("Login").getAt(0);
        } catch (e) {

            return null;
        }

        vault.remove(credential);
        roamingSettings.values.remove("userData");
        HL.setSignedoutBox();
        userData = null;
    };

    /**
    get current user
    */
    HL.getCurrentUser = function () {

        return userData;
    };

    /**
    get section for loader
    */
    HL.getCurrentSectionLoader = WinJS.Binding.converter(function(val) {

        return "translateY(-" + (val * 100) + "%)";
    });

    /**
    handles hyperlapse load progress
    */
    HL.hyperlapseProgress = function(value) {

        HL.hyperlapseData.progress = value.toFixed(2) + "%";
    };

    /**
    handles hyperlapse load complete
    */
    HL.hyperlapseLoaded = function() {

        HL.loaded = true;
        HL.hyperlapseData.currentSection = 2;
    };

    /**
    send a message
    */
    HL.sendMessage = function (id, data) {

        data = data || {};

        webview.invokeScriptAsync("receiveMessage", JSON.stringify({
            id: id,
            data: data
        })).start();
    };

    /**
    receive a message
    */
    HL.receiveMessage = function(d) {

        if (d.callingUri === "ms-appx-web://48773grey93.hyperlapse/Web/html/main.html") {

            var data = JSON.parse(d.value);

            switch (data.id) {
                case Message.Local.START_CHANGED:
                    HL.markerLocations.start = data.data;
                    break;
                case Message.Local.END_CHANGED:
                    HL.markerLocations.end = data.data;
                    break;
                case Message.Local.LOOKAT_CHANGED:
                    HL.markerLocations.lookat = data.data;
                    break;
                case Message.Local.HYPERLAPSE_PROGRESS:
                    HL.hyperlapseProgress(data.data);
                    break;
                case Message.Local.HYPERLAPSE_LOADED:
                    HL.hyperlapseLoaded();
                    break;
                default:
                    console.log("No local handler for event with id", data.id);
            }
        }
    };
})();
