'use strict';
const expect = require('chai').expect;
const helper = require('../../../../spec/helper');
const db = require('../../schemas');


describe('schemes', () => {
    describe('githubTask', () => {
        afterEach(() => helper.db.clean());

        describe('#create', () => {
            let user, project, stage, cost, task;

            beforeEach(async () => {
                user = await db.User.create({username: 'user1'});
                project = await db.Project.create({name: 'project1', createUserId: user.id});
                stage = await db.Stage.create({name: 'todo', displayName: 'ToDo', assigned: true, projectId: project.id});
                cost = await db.Cost.create({name: 'medium', value: 3, projectId: project.id});
                task = await db.Task.create({
                    projectId: project.id,
                    stageId: stage.id,
                    userId: user.id,
                    costId: cost.id,
                    title: 'title1',
                    body: 'body1',
                    isWorking: true
                });
                await db.GitHubTask.create({projectId: project.id, taskId: task.id, number: 111, isPullRequest: true});
            });

            it('should create a new github task', () => {
                return db.GitHubTask.findAll().then(_gtasks => {
                    expect(_gtasks).to.have.lengthOf(1);
                    expect(_gtasks[0]).to.have.property('number', '111');
                    expect(_gtasks[0]).to.have.property('isPullRequest', true);
                });
            });
        });
    });
});
