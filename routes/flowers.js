var express = require('express');
var router = express.Router();
var FlowerService = require('../services/FlowerService');
var db = require('../models');
var flowerService = new FlowerService(db);
const { Op } = require('sequelize');
var client = require('../redis.js')

async function cache(req, res, next) {
  const data = await client.get(req.originalUrl);
  if (data !== null) {
    res.render('flowers', {tutorials: JSON.parse(data)});
  } else {
    next();
  }
}

const getPagination = (page, size) => {
  const limit = size ? +size : 5;
  const offset = page ? (page-1) * limit : 0;
  return { limit, offset };
};

/* GET users listing. */
router.get('/', cache, async function(req, res, next) {
  const { sort, name, color, petalsNumber, page, size} = req.query;
  const order = sort ? sort.split(',').map(pair => pair.split(':')) : [];
  const nameCondition = name ? { name: { [Op.like]: `%${name}%` } } : null;
  const colorCondition = color ? { color: { [Op.like]: `%${color}%` } } : null;
  const petalsNumCondition = petalsNumber ? { petalsNumber: { [Op.like]: `%${petalsNumber}%` } } : null;
  const condition = {[Op.and]: [nameCondition, colorCondition, petalsNumCondition]};
  const pagination = getPagination(page, size);
  const flowers = await flowerService.getAll(condition, order, pagination);
  await client.set(req.originalUrl, JSON.stringify(flowers));
  res.render('flowers', {flowers: flowers})
});

module.exports = router;
