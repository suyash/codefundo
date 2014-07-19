// For an introduction to the Hub/Pivot template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=392285
(function () {
    "use strict";

    var activation = Windows.ApplicationModel.Activation;
    var app = WinJS.Application;
    var nav = WinJS.Navigation;
    var sched = WinJS.Utilities.Scheduler;
    var ui = WinJS.UI;
    window.$ = WinJS.Utilities.query;

    /**
    Set splashscreen if present
    */
    var setSplash = function(splash) {

        return new WinJS.Promise(function(success, error, progress) {

            var $si = $(".splashimage");
            $si.setStyle("top", splash.imageLocation.y + "px");
            $si.setStyle("left", splash.imageLocation.x + "px");

            HL.setup().done(function() {

                return HL.hideSplash();
            });

            success();
        });
    };

    app.addEventListener("activated", function (args) {

        if (args.detail.kind === activation.ActivationKind.launch) {

            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {

                // TODO: This application has been newly launched. Initialize
                // your application here.
            } else {

                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }

            HL.isPhone = $("body").hasClass("phone");

            hookUpBackButtonGlobalEventHandlers();
            nav.history = app.sessionState.history || {};
            nav.history.current.initialPlaceholder = true;

            // Optimize the load of the application and while the splash screen is shown, execute high priority scheduled work.
            ui.disableAnimations();

            args.setPromise(setSplash(args.detail.splashScreen));
        }
    });

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. If you need to 
        // complete an asynchronous operation before your application is 
        // suspended, call args.setPromise().
        app.sessionState.history = nav.history;
    };

    function hookUpBackButtonGlobalEventHandlers() {
        // Subscribes to global events on the window object
        window.addEventListener('keyup', backButtonGlobalKeyUpHandler, false)
    }

    // CONSTANTS
    var keyLeft = "Left";
    var keyBrowserBack = "BrowserBack";
    var mouseBackButton = 3;

    function backButtonGlobalKeyUpHandler(event) {
        // Navigates back when (alt + left) or BrowserBack keys are released.
        if ((event.key === keyLeft && event.altKey && !event.shiftKey && !event.ctrlKey) || (event.key === keyBrowserBack)) {
            nav.back();
        }
    }

    app.start();
})();
