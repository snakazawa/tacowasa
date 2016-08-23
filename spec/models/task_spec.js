'use strict';
const expect = require('chai').expect;
const _ = require('lodash');
const co = require('co');
const helper = require('../helper');
const db = require('../../schemes');
const Project = require('../../models/project');
const Task = require('../../models/task');

afterEach(() => helper.db.clean());

describe('models', () => {
    describe('task', () => {
        const usernames = ['owner', 'user1'];
        const taskTitles = ['task1', 'task2', 'task3', 'task4', 'task5'];
        let project;

        beforeEach(() => Project.create('project1', usernames[0]).then(x => project = x));

        it('project should have no task', () => expectTaskSize(project.id, 0));

        describe('#add', () => {
            context('with default value', () => {
                let task;
                beforeEach(() => Task.add(project.id, {title: taskTitles[0], body: 'body1'}).then(x => task = x));

                it('project should have 2 tasks', () => expectTaskSize(project.id, 1));
                it('should set params', () => {
                    expect(task).to.have.property('title', taskTitles[0]);
                    expect(task).to.have.property('body', 'body1');
                    expect(task).to.have.property('userId', null);
                    expect(task).to.have.property('stageId', project.defaultStageId);
                    expect(task).to.have.property('costId', project.defaultCostId);
                });
            });

            context('with specified value', () => {
                let task;
                beforeEach(() => Task.add(project.id, {
                    title: taskTitles[0],
                    body: 'body1',
                    userId: project.users[0].id,
                    stageId: project.stages[2].id,
                    costId: project.costs[1].id
                }).then(x => task = x));

                it('project should have 2 tasks', () => expectTaskSize(project.id, 1));
                it('should set params', () => {
                    expect(task).to.have.property('title', taskTitles[0]);
                    expect(task).to.have.property('body', 'body1');
                    expect(task).to.have.property('userId', project.users[0].id);
                    expect(task).to.have.property('stageId', project.stages[2].id);
                    expect(task).to.have.property('costId', project.costs[1].id);
                });
            });
        });
    });
});

function expectTaskSize(projectId, n) {
    return db.Project.findById(projectId, {include: [db.Task]}).then(p => {
        expect(p.tasks).to.lengthOf(n);
    });
}