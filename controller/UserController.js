const conn = require('../mariadb') //db 모듈
const {StatusCodes} = require('http-status-codes'); //status code 모듈
const jwt = require('jsonwebtoken'); //jwt 모듈
const crypto = require('crypto'); // crypto 모듈: 암호화
const dotenv =  require('dotenv'); //dotenv 모듈
dotenv.config();

//회원가입
const join = function(req, res){
    const {email, pwd} = req.body;

    //비밀번호 암호화
    const salt = crypto.randomBytes(10).toString('base64');
    const hashPassword = crypto.pbkdf2Sync(pwd, salt, 10000, 10, 'sha512').toString('base64');

    //회원가입 시 비밀번호를 암호화해서 암호화된 비밀번호와, salt 값을 같이 저장

    let sql = `INSERT INTO users (email, pwd, salt) VALUES (?, ?, ?)`;
    values = [email, hashPassword, salt];
    conn.query(sql, values, 
        function(err, results){
            if(err)
            {
                return res.status(StatusCodes.BAD_REQUEST).json(err);
            }

            return res.status(StatusCodes.CREATED).json(results);
        }
    );
};

//로그인
const login = function(req, res){

    const {email, pwd} = req.body;

    let sql = `SELECT * FROM users WHERE email = ?`;
    conn.query(sql, email,
        function(err, results){
            if(err)
            {
                return res.status(StatusCodes.BAD_REQUEST).json(err);
            }

            var loginUser = results[0];

            //salt값 꺼내서 날 것으로 들어온 비밀번호를 암호화 해보고 
            const hashPassword = crypto.pbkdf2Sync(pwd, loginUser.salt, 10000, 10, 'sha512').toString('base64');

            //디비 비밀번호랑 비교
            if(loginUser && loginUser.pwd == hashPassword) //loginUser가 존재하고 pwd가 일치
            {
                //토큰 발행
                var token = jwt.sign({ // 페이로드
                    id: loginUser.id,
                    email: loginUser.email
                }, process.env.PRIVATE_KEY, { //비밀키, 옵션
                    expiresIn: '3h',
                    issuer: "malloc"
                });

                //토큰 쿠기에 담기
                res.cookie("token", token, {
                    httpOnly: true
                });

                console.log(token);

                res.status(StatusCodes.OK).json({
                    message: `${loginUser.email}님 로그인되었습니다.`,
                    token: token
                });
            }
            else {
                res.status(StatusCodes.UNAUTHORIZED).json({ // 401: Unauthorized
                    message: "이메일이나 비밀번호가 틀렸습니다."
                });
            }
        }
    );

};

//비밀번호 초기화 요청
const pwdResetRequest = (req, res) => {
    
    const {email} = req.body;

    let sql = `SELECT * FROM users WHERE email = ?`;
    conn.query(sql, email,
        function(err, results){
            if(err){
                return res.status(StatusCodes.BAD_REQUEST).json(err);
            }

            //이메일로 유저가 있는지 찾아본다.
            const user = results[0];
            if(user)
            {
                return res.status(StatusCodes.OK).json({
                    email: user.email
                });
            }
            else {
                return res.status(StatusCodes.UNAUTHORIZED).json({
                    message: "사용자를 찾을 수 없습니다."
                })
            }
        }
    );

};

//비밀번호 초기화
const pwdReset = (req, res) => {
    const {email, pwd} = req.body;

    //비밀번호 암호화
    const salt = crypto.randomBytes(10).toString('base64');
    const hashPassword = crypto.pbkdf2Sync(pwd, salt, 10000, 10, 'sha512').toString('base64');


    let sql = `UPDATE users SET pwd = ?, salt = ? WHERE email = ?`;
    let values = [hashPassword, salt, email];
    conn.query(sql, values, 
        function(err, results){
            if(err){
                return res.status(StatusCodes.BAD_REQUEST).json(err);
            }

            if(results.affectedRows == 0)
            {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "적용 안됨"
                })
            }
            else {
                return res.status(StatusCodes.OK).json({
                    message: "비밀번호 변경 완료"
                })
            }

        }
    );
};


module.exports = {
    join,
    login,
    pwdResetRequest,
    pwdReset
};