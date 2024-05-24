const express = require('express');
const router = express.Router();

router.use(express.json());

const conn = require('../mariadb')

//회원가입
router.post('/join', function(req, res){
    const {email, password} = req.body;

    let sql = "INSERT INTO users (email, password) VALUES (?, ?)";
    values = [email, password];
    conn.query(sql, values, 
        function(err, results){
            if(err)
            {
                res.status(400).json(err); // 400: bad request
                return;
            }

            res.status(201).json(results);
        }
    );
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