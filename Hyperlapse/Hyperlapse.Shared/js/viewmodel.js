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
    HL.setSignedinBox = function() {

        var template = $("#signedinTemplate")[0],
            context = userData,
            root = $(".signstatus")[0],
            flyout = null;

        if (!HL.isPhone) {

            flyout = $(".loggedinflyout")[0];
            setFlyout(flyout, root);
        }

        WinJS.Utilities.empty(root);

        return template.winControl.render(context, root).then(function(el) {

            WinJS.Resources.processAll(root);

            var sel = el.querySelector(".sign");

            sel.addEventListener("pointerdown", function (e) {

                WinJS.UI.Animation.pointerDown(e.srcElement);

                if (HL.isPhone) {
                    WinJS.Navigation.navigate("/pages/login/login.html");
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
        });
    };

    /**
    Render sign out box
    */
    HL.setSignedoutBox = function () {

        var template = $("#signedoutTemplate")[0],
            context = {},
            root = $(".signstatus")[0],
            flyout = null;

        if (!HL.isPhone) {

            flyout = $(".loginflyout")[0];
            setFlyout(flyout, root);
        }

        WinJS.Utilities.empty(root);

        return template.winControl.render(context, root).then(function (el) {

            WinJS.Resources.processAll(root);

            var sel = el.querySelector(".sign");

            sel.addEventListener("pointerdown", function (e) {

                WinJS.UI.Animation.pointerDown(e.srcElement);

                if (HL.isPhone) {
                    WinJS.Navigation.navigate("/pages/login/login.html");
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

            userData = response.result;
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

                return HL.phone.setup();
            } else {

                return HL.desktop.setup();
            }
        }).then(function() {

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
    HL.desktop.setup = function () {

        var i = 1 + parseInt(HL.desktop.backImageCount * Math.random());

        $(".hubpage").setStyle("background-image", "url(\"/images/hubBack/" + i + ".jpg\")");
    };

    /**
    Phone mode specific setup options
    */
    HL.phone.setup = function () {};

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
                userData = {
                    firstname: data.firstname,
                    lastname: data.lastname,
                    img: data.img
                };
                HL.signedIn = true;
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
        HL.signedIn = false;
        userData = null;
    };

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
