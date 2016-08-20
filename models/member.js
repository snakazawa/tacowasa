'use strict';
const db = require('../schemes');
const _ = require('lodash');
const co = require('co');

class Member {
    // return Promise, resolve(user)
    static add(projectId, username, {wipLimit, isVisible, accessLevelId}={}) {
        return co(function* () {
            const project = yield db.Project.findById(projectId, {include: [db.User]});

            // exists?
            if (project.users.find(user => user.username === username)) {
                return Promise.reject(`${username} is added to ${project.name}(${project.id})`);
            }
            const user = yield db.User.findOrCreate({where: {username}});
            const firstUser = project.users.find(x => !x.member.prevMemberId);

            // add
            yield project.addUser(user, {
                nextMemberId: firstUser && firstUser.member.id,
                wipLimit: _.isNil(wipLimit) ? project.defaultWipLimit : wipLimit,
                accessLevel: _.isNil(accessLevelId) ? project.defaultAccessLevelId : accessLevelId,
                isVisible
            });
            const addedUser = yield Member.findByUsername(projectId, username);

            // update link
            if (firstUser) {
                yield db.Member.update({prevMemberId: addedUser.member.id}, {where: {id: firstUser.member.id}});
            }

            return addedUser;
        });
    }

    static remove(projectId, username) {
        return co(function* () {
            const project = yield db.Project.findById(projectId);
            const user = yield Member.findByUsername(projectId, username);
            if (!user) { return Promise.reject(`${username} is not found in ${project.name}(${projectId})`); }

            const {prevMemberId, nextMemberId} = user.member;

            if (prevMemberId) {
                yield db.Member.update({nextMemberId}, {where: {projectId, id: prevMemberId}});
            }

            if (prevMemberId) {
                yield db.Member.update({prevMemberId}, {where: {projectId, id: nextMemberId}});
            }

            yield db.Member.destroy({where: {projectId, userId: user.id}});
        });
    }

    static update(projectId, username, updateParams) {
        return db.User.findOne({where: {username}})
            .then(user => db.Member.update(updateParams, {where: {projectId, userId: user.id}}))
            .then(() => Member.findByUsername(projectId, username));
    }

    static updateOrder() {
        // TODO order
    }

    static findByUsername(projectId, username) {
        return Promise.all([
            db.Project.findById(projectId, {include: [db.User]}),
            db.User.findOne({where: {username}})
        ]).then(([project, user]) => {
            return project.users.find(x => x.id === user.id);
        });
    }

    static getAllSorted(projectId) {
        return db.Project.findById(projectId, {include: [db.User]})
            .then(project => Member.sortMembers(project.users));
    }

    static sortMembers(users) {
        if (!users.length) return [];

        const src = {};
        users.forEach(user => src[user.member.id] = user);

        const res = [];
        const firstUser = users.find(x => !x.member.prevMemberId);
        res.push(firstUser);
        src[firstUser.member.id] = null;

        let lastUser = firstUser;
        while (lastUser.member.nextMemberId) {
            lastUser = src[lastUser.member.nextMemberId];
            res.push(lastUser);
            src[lastUser.member.id] = null;
        }

        return res;
    }
}

module.exports = Member;