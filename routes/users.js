const express = require('express');
const router = express.Router();

router.use(express.json());

//회원가입
router.post('/join', function(req, res){

});

//로그인
router.post('/login', function(req, res){

});

//비밀번호 초기화 요청
router.post('/reset', function(req, res){

});

//비밀번호 초기화
router.put('/reset', function(req, res){

});


module.exports = router;