'use strict';
module.exports = function (sequelize, DataTypes) {
    const User = sequelize.define('user', {
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        iconUri: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        classMethods: {
            associate: function (models) {
                User.belongsToMany(models.Project, {
                    through: models.Member
                });
                User.hasMany(models.Project, {
                    as: 'createUser',
                    foreignKey: 'createUserId'
                });
                User.hasMany(models.Work);
                User.hasMany(models.TaskStatusLog);
            }
        }
    });
    return User;
};
