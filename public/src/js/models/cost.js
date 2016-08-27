'use strict';
const ko = require('knockout');

class Cost {
    constructor(opts) {
        Cost.columnKeys.forEach(key => this[key] = ko.observable(opts[key]));
    }

    static get columnKeys() {
        return [
            'id',
            'name',
            'value'
        ];
    }
}

module.exports = Cost;
