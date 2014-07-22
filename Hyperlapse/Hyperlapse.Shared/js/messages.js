(function() {

    "use strict";

    window.Message = {};

    Message.Web = {
        
        SHOW_MAP: 1,
        SEARCH_MAP: 6,
        GET_SEARCH_SUGGESTIONS: 7,
        LOAD_HYPERLAPSE: 8,
        SHOW_HYPERLAPSE: 12,
        PLAY_HYPERLAPSE: 13,
        PAUSE_HYPERLAPSE: 14
    };

    Message.Local = {
        
        MAP_SHOWN: 2,
        START_CHANGED: 3,
        END_CHANGED: 4,
        LOOKAT_CHANGED: 5,
        HYPERLAPSE_PROGRESS: 10,
        HYPERLAPSE_LOADED: 11,
        PLAYED_HYPERLAPSE: 15,
        PAUSED_HYPERLAPSE: 16
    };
})();
