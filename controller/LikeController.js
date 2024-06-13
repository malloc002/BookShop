const jwt = require('jsonwebtoken');
const conn = require('../mariadb') //db 모듈
const {StatusCodes} = require('http-status-codes'); //status code 모듈
const dotenv = require('dotenv');
const ensureAuthorization = require('../auth'); //인증 모듈

dotenv.config();

//좋아요 추가
const addLike = (req, res) => {
    
    const book_id = req.params.id;

    let authorization = ensureAuthorization(req, res);

    if(authorization instanceof jwt.TokenExpiredError)
    {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: "로그인 세션이 만료되었습니다. 다시 로그인하세요."
        });
    }

    if(authorization instanceof jwt.JsonWebTokenError)
    {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: "잘못된 토큰입니다."
        });
    }

    let sql = `INSERT INTO likes (user_id, liked_book_id) VALUES (?, ?)`;
    let values = [authorization.id, book_id];
    conn.query(sql, values,
        function(err, results){
            if(err)
            {
                return res.status(StatusCodes.BAD_REQUEST).json(err);
            }

            return res.status(StatusCodes.OK).json(results);
        }
    );
};

//좋아요 삭제
const cancelLike = (req, res) => {

    const book_id = req.params.id;

    let authorization = ensureAuthorization(req, res);

    if(authorization instanceof jwt.TokenExpiredError)
    {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: "로그인 세션이 만료되었습니다. 다시 로그인하세요."
        });
    }

    if(authorization instanceof jwt.JsonWebTokenError)
    {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: "잘못된 토큰입니다."
        });
    }

    let sql = `DELETE FROM likes WHERE user_id = ? AND liked_book_id = ?`;
    let values = [authorization.id, book_id];
    conn.query(sql, values,
        function(err, results){
            if(err)
            {
                return res.status(StatusCodes.BAD_REQUEST).json(err);
            }

            return res.status(StatusCodes.OK).json(results);
        }
    );
};


module.exports = {
    addLike,
    cancelLike
};