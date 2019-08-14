"use strict";
require("dotenv").config();
// gets the event sections to filter on
// if not set in the .env file then all events are processed
var getEventSections = function () {
    var sections = process.env.SUBSTRATE_EVENT_SECTIONS;
    if (sections) {
        return sections.split(",");
    }
    else {
        return ["all"];
    }
};
module.exports = { getEventSections: getEventSections };
//# sourceMappingURL=utils.js.map