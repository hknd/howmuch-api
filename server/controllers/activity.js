'use strict';
const moment = require('moment');
const Activity = require('../models/Activity');

const findPlain = (req, res, next) => {
  return Activity.find(req.params.listId, (err, activities) => {
    if (err) { return next(err); }
    res.json({
      success: true,
      data: activities
    });
  });
};

const findAll = (req, res, next) => {
  return Activity
    .find({
      _activityListId: req.params.listId
    })
    .sort({ timestamp: -1 })
    .exec((err, activities) => {
      if (err) { return next(err); }

      let result = {};

      activities.forEach((e) => {
        let y = moment(e.timestamp).year();
        let m = moment(e.timestamp).month() + 1;
        let d = moment(e.timestamp).format('l');
        let top = y + '-' + m;

        if (!result[top]) {
          result[top] = { count: 0, data: {} };
        }

        if (!result[top].data[d]) {
          result[top].data[d] = { count: 0, data: [] };
        }

        result[top].count++;
        result[top].data[d].data.push(e);
        result[top].data[d].count++;
      });

      // Just count all 'day' properties of the resulting json.
      // TODO all this has to be done via mongodb aggregator
      const days = Object
        .keys(result)
        .map((key) => {
          return Object.keys(result[key].data).length;
        })
        .reduce((prev, curr) => { return prev + curr; }, 0);

      const activityCount = activities.length;
      const averagePerDay = activityCount / days;

      const details = {
        activityCount,
        averagePerDay
      };

      res.json({
        success: true,
        details: details,
        data: result
      });
    });
};

const findOne = (req, res, next) => {
  Activity.findOne(req.params.id, (err, activity) => {
    if (err) { return next(err); }
    res.json({
      success: true,
      data: activity
    });
  });
};

const update = (req, res, next) => {
  Activity.findOneAndUpdate(req.params.id, {
    $set: { timestamp: req.body.timestamp }
  }, { new: true }, (err, updatedActivity) => {
    res.json({
      success: true,
      data: updatedActivity
    });
  });
};

const create = (req, res, next) => {
  console.log('Creating with list id: ', req.params);
  new Activity({
    _activityListId: req.params.listId
  }).save((err, newActivity) => {
    if (err) { return next(err); }
    res.json({
      success: true,
      data: newActivity
    });
  });
};

const remove = (req, res, next) => {
  Activity.findOneAndRemove(req.params.listId, (err) => {
    if (err) { return next(err); }
    res.json({
      success: true
    });
  });
};

exports.findPlain = findPlain;
exports.findAll = findAll;
exports.findOne = findOne;
exports.create = create;
exports.remove = remove;
exports.update = update;
