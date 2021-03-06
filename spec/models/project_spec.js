'use strict';
const expect = require('chai').expect;
const _ = require('lodash');
const helper = require('../helper');
const db = require('../../lib/schemes');
const Project = require('../../lib/models/project');
const User = require('../../lib/models/user');
const Member = require('../../lib/models/member');


describe('models', () => {
    describe('project', () => {
        describe('#create', () => {
            const username = 'user1';
            let project;

            after(() => helper.db.clean());
            before(async () => {
                project = await Project.create('project1', username, {include: []});
            });

            it('should create a new project', () => db.Project.findAll().then(xs => expect(xs).to.lengthOf(1)));

            describe('#findAll', () => {
                let res;
                beforeEach(async () => {
                    res = await Project.findAll();
                });

                it('should return a array having a project', () => expect(res).to.lengthOf(1));
            });

            describe('#findOne', () => {
                let res;
                beforeEach(async () => {
                    res = await Project.findOne();
                });

                it('should return a project', () => expect(res).to.be.an('object'));
            });

            describe('#findById', () => {
                let res;
                beforeEach(async () => {
                    res = await Project.findById(project.id);
                });

                it('should return a project', () => expect(res).to.be.an('object'));
            });

            describe('#archive', () => {
                let res;
                beforeEach(async () => {
                    res = await Project.archive(project.id);
                });

                it('should archive the project', () => expect(res).to.have.property('enabled', false));

                context('#findOne', () => {
                    beforeEach(async () => {
                        res = await Project.findAll();
                    });

                    it('should not include the archived project', () => expect(res).to.lengthOf(0));
                });
            });
        });

        describe('#findByIncludedUsername', () => {
            let res;
            after(() => helper.db.clean());
            before(async () => {
                for (let username of ['target', 'user1', 'user2']) {
                    await User.findOrCreate(username);
                }
                await Project.create('project1', 'target', {include: []});
                const project2 = await Project.create('project2', 'user1', {include: []});
                const project3 = await Project.create('project3', 'user2', {include: []});
                await Member.add(project2.id, 'user2');
                await Member.add(project3.id, 'target');
                // project1 has target
                // project2 has user1 and user2
                // project3 has user3 and target

                res = await Project.findByIncludedUsername('target');
            });

            it('should return projects including specified username as member', () => {
                expect(_.map(res, 'name')).to.have.members(['project1', 'project3']);
            });
        });
    });
});
