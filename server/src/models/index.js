'use strict';

const userModel = require('./user.model');
const jobSiteModel = require('./job-site.model');

module.exports = {
  User: userModel,
  JobSite: jobSiteModel
};
