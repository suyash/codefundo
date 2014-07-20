(function() {

    "use strict";

    window.$ = document.querySelector;

    /**
    Once again, the global context
    */
    var HL = {};

    HL.showMap = function() {

        sendMessage(Message.Local.MAP_SHOWN, {});
    };

    window.sendMessage = function (id, data) {

        data = data || {};

        var d = JSON.stringify({
            id: id,
            data: data
        });

        window.external.notify(d);
    };

    window.receiveMessage = function(d) {

        var data = JSON.parse(d);

        switch (data.id) {

            case Message.Web.SHOW_MAP:
                HL.showMap();
                break;
        }
    };
})();
