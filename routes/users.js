const express = require('express'); //express 모듈
const router = express.Router();
const conn = require('../mariadb') //db 모듈
const {join, login, pwdResetRequest, pwdReset} = require('../controller/UserController');

router.use(express.json());

//회원가입
router.post('/join', join);

//로그인
router.post('/login', login);

//비밀번호 초기화 요청
router.post('/reset', pwdResetRequest);

//비밀번호 초기화
router.put('/reset', pwdReset);


module.exports = router;