const jwt = require('jsonwebtoken');
const conn = require('../mariadb') //db 모듈
const {StatusCodes} = require('http-status-codes'); //status code 모듈
const dotenv = require('dotenv');

dotenv.config();

//좋아요 추가
const addLike = (req, res) => {
    
    const {id} = req.params;
    // const {user_id} = req.body;

    let receivedJwt = req.headers["authorization"];
    console.log("received jwt: ", receivedJwt);

    let decodedJwt = jwt.verify(receivedJwt, process.env.PRIVATE_KEY);
    console.log(decodedJwt);


    // let sql = `INSERT INTO likes (user_id, liked_book_id) VALUES (?, ?)`;
    // let values = [user_id, id];
    // conn.query(sql, values,
    //     function(err, results){
    //         if(err)
    //         {
    //             return res.status(StatusCodes.BAD_REQUEST).json(err);
    //         }

    //         return res.status(StatusCodes.OK).json(results);
    //     }
    // );
};

//좋아요 삭제
const cancelLike = (req, res) => {

    const {id} = req.params;
    const {user_id} = req.body;

    let sql = `DELETE FROM likes WHERE user_id = ? AND liked_book_id = ?`;
    let values = [user_id, id];
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