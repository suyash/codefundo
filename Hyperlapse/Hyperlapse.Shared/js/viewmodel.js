(function() {

    "use strict";

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
    Desktop mode specific setup options
    */
    HL.desktop.setup = function () {

        return new WinJS.Promise(function (complete, error, progress) {

            var i = 1 + parseInt(HL.desktop.backImageCount * Math.random());

            $("body").setStyle("background-image", "url(\"/images/hubBack/" + i + ".jpg\")");
        });
    };

    /**
    Phone mode specific setup options
    */
    HL.phone.setup = function () {
        
        return new WinJS.Promise(function (complete, error, progress) { });
    };

    /**
    create hub for desktop
    */
    HL.desktop.setHub = function () {
    };

})();
