'use strict';
require('babel-polyfill');
require('jquery-ui');
require('jquery.easing');
require('bootstrap');
require('bootstrap-select');
require('knockout');
require('../modules/knockout/knockout-selectPicker');
require('../modules/knockout/knockout-bootstrap-switch');
require('../modules/knockout/knockout-bootstrap-tooltip');
require('../../scss/kanban.scss');

const global = window;
const ko = require('knockout');
const _ = require('lodash');
const moment = require('moment');
const Kanban = require('../viewmodels/kanban');
const Project = require('../models/project');
const effects = require('../views/effects');
const Scroller = require('../views/scroller');
const AlertHub = require('../viewmodels/alert_hub');
const addons = require('../modules/addons');
const Alert = require('../../components/alert');

moment.locale('ja');

let kanban, project, vm;

const projectId = getProjectId();

const alert = new Alert();
alert.register();

new Scroller({
    selector: ['.task-board'].join(','),
    cancelSelector: ['.task-card', '.activity-wrap', '.modal'].join(',')
});

Project.fetch(projectId)
    .then(_project => {
        project = _project;
        kanban = new Kanban({project});
        new AlertHub({alert, kanban, socket: kanban.socket});

        // knockout sortable option
        ko.bindingHandlers.sortable.options.scroll = false;
        ko.bindingHandlers.sortable.beforeMove = kanban.onBeforeMoveDrag.bind(kanban);

        vm = kanban;
        vm.alerts = alert.alerts;

        _.each(addons, addon => addon.init(kanban, {alert}));

        effects.applyBindings(global);
        ko.applyBindings(vm);

        setConfirmTransition();
    });

// 作業中で画面遷移しようとしたら確認ダイアログを表示する
function setConfirmTransition () {
    $(window).bind('beforeunload', () => {
        const user = kanban.loginUser();
        if (user && user.workingTask()) {
            return '*** ひとつ以上のタスクが作業状態になっています。 ***\n作業中のまま画面を移動しますか？';
        }
    });
}

function getProjectId () {
    return _.compact(location.pathname.split('/')).splice(-2, 1)[0];
}
