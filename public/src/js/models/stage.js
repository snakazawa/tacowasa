'use strict';
const ko = require('knockout');

class Stage {
    constructor(opts) {
        Stage.columnKeys.forEach(key => {
            this[key] = ko.observable(opts[key]);
        });
    }

    static get columnKeys() {
        return [
            'name',
            'displayName',
            'assigned',
            'canWork'
        ];
    }
}

module.exports = Stage;
