(function() {

    "use strict";

    window.Message = {};

    Message.Web = {
        
        SHOW_MAP: 1,
        SEARCH_MAP: 6,
        GET_SEARCH_SUGGESTIONS: 7
    };

    Message.Local = {
        
        MAP_SHOWN: 2,
        START_CHANGED: 3,
        END_CHANGED: 4,
        LOOKAT_CHANGED: 5
    };
})();
