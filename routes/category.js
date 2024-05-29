const express = require('express'); //express 모듈
const router = express.Router();
const conn = require('../mariadb') //db 모듈
const {StatusCodes} = require('http-status-codes'); //status code 모듈
const allCategory = require('../controller/CategoryController');

//카테고리 전체 목록 조회
router.get('/', allCategory);

module.exports = router;