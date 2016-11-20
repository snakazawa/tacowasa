'use strict';
const ko = require('knockout');
const Iteration = require('./models/iteration');
const ThroughputTableComponent = require('./throughput_table_component');
const IterationTableComponent = require('./iteration_table_component');
const PredicateCompletionTimeComponent = require('./predicate_completion_time_component');

module.exports = {
    init: (kanban, {alert}) => {
        const socket = kanban.socket;

        const iterations = ko.observableArray();
        const workTimes = ko.observable();

        const throughputTableComponent = new ThroughputTableComponent(kanban.project.users);
        throughputTableComponent.register();

        const predicateCompletionTimeComponent = new PredicateCompletionTimeComponent(kanban.project.users);
        kanban.selectedTask.subscribe(x => predicateCompletionTimeComponent.task(x));
        predicateCompletionTimeComponent.register();

        const iterationTableComponent = new IterationTableComponent(iterations, kanban.project.users, workTimes);
        iterationTableComponent.register();
        iterationTableComponent.on('createIteration', ({startTime, endTime}) => {
            socket.emit('createIteration', {startTime, endTime});
        });
        iterationTableComponent.on('removeIteration', ({iterationId}) => {
            socket.emit('removeIteration', {iterationId});
        });
        iterationTableComponent.on('updateIteration', ({iterationId, startTime, endTime}) => {
            socket.emit('updateIteration', {iterationId, startTime, endTime});
        });
        iterationTableComponent.on('updatePromisedWorkTime', ({userId, iterationId, promisedMinutes}) => {
            socket.emit('updatePromisedWorkTime', {userId, iterationId, promisedMinutes});
        });

        // init socket events

        let first = true;
        socket.on('stats', req => {
            console.debug('on stats', req);
            throughputTableComponent.updateThroughputs(req.members);
            predicateCompletionTimeComponent.updateMemberStats(req.members);
            workTimes(req.workTimes);
            if (first) {
                first = false;
                req.iterations.forEach(iterationParams => {
                    const iteration = new Iteration(iterationParams);
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
            const iteration = iterations().find(x => x.id() === iterationId);
            if (!iteration) { throw new Error(`iteration is not found by ${iterationId}`); }
            iterations.remove(iteration);
        });

        socket.on('updateIteration', ({iteration: iterationParams}) => {
            const iteration = iterations().find(x => x.id() === iterationParams.id);
            if (!iteration) { throw new Error(`iteration is not found by ${iterationParams.id}`); }
            iteration.update(iterationParams);
        });

        socket.on('updatePromisedWorkTime', ({memberWorkTime}) => {
            const _workTimes = workTimes().map(x => {
                return x.id === memberWorkTime.id ? memberWorkTime : x;
            });
            workTimes(_workTimes);
        });

        // init rendering

        kanban.projectStatsModal.on('load', () => {
            insertNodeIntoFirstOnModal(throughputTableComponent.componentName, 'project-stats-modal');
            insertNodeIntoFirstOnModal(iterationTableComponent.componentName, 'project-stats-modal');
        });

        kanban.assignTaskModal.on('load', () => {
            insertNodeIntoLastOnModal(predicateCompletionTimeComponent.componentName, 'assign-task-modal');
        });
    }
};

function insertNodeIntoFirstOnModal (componentName, modalId) {
    const modal = document.getElementById(modalId);
    const modalBody = modal.getElementsByClassName('modal-body')[0];
    const firstChild = Array.prototype.slice.call(modalBody.childNodes).find(x => x.nodeType === 1);
    const component = document.createElement(componentName);
    modalBody.insertBefore(component, firstChild);
}

function insertNodeIntoLastOnModal (componentName, modalId) {
    const modal = document.getElementById(modalId);
    const modalBody = modal.getElementsByClassName('modal-body')[0];
    const component = document.createElement(componentName);
    modalBody.append(component);
}
