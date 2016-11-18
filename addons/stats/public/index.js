'use strict';
const ko = require('knockout');
const Iteration = require('./models/iteration');
const ThroughputTableComponent = require('./throughput_table_component');
const IterationTableComponent = require('./iteration_table_component');

module.exports = {
    init: (kanban, {alert}) => {
        const socket = kanban.socket;

        const iterations = ko.observableArray();

        const throughputTableComponent = new ThroughputTableComponent(kanban.project.users);
        throughputTableComponent.register();

        const iterationTableComponent = new IterationTableComponent(iterations, kanban.project.users);
        iterationTableComponent.register();
        iterationTableComponent.on('createIteration', ({startTime, endTime}) => {
            socket.emit('createIteration', {startTime, endTime});
        });

        let first = true;
        socket.on('stats', req => {
            console.debug('on stats', req);
            throughputTableComponent.updateThroughputs(req.members);
            if (first) {
                first = false;
                req.iterations.forEach(iterationParams => {
                    const iteration = new Iteration(iterationParams);
                    console.log(iteration);
                    iterations.push(iteration);
                });
            }
        });

        socket.on('initJoinedUsernames', () => { // init
            socket.emit('fetchStats');
        });

        socket.on('createIteration', ({iteration: iterationParams}) => {
            const iteration = new Iteration(iterationParams);
            iterations.push(iteration);
        });

        socket.on('removeIteration', ({iterationId}) => {
            const iteration = iterations().find(x => x.id === iterationId);
            if (!iteration) { new Error(`iteration is not found by ${iterationId}`); }
            iterations.remove(iteration);
        });

        socket.on('updateIteration', ({iteration: iterationParams}) => {
            const iteration = iterations().find(x => x.id === iterationParams.id);
            if (!iteration) { new Error(`iteration is not found by ${iterationParams.id}`); }
            iteration.update(iterationParams);
        });

        kanban.projectStatsModal.on('load', () => {
            const modal = document.getElementById('project-stats-modal');
            const modalBody = modal.getElementsByClassName('modal-body')[0];
            const firstChild = Array.prototype.slice.call(modalBody.childNodes).find(x => x.nodeType === 1);

            const throughputElement = document.createElement(throughputTableComponent.componentName);
            modalBody.insertBefore(throughputElement, firstChild);

            const iterationElement = document.createElement(iterationTableComponent.componentName);
            modalBody.insertBefore(iterationElement, throughputElement);
        });
    }
};
