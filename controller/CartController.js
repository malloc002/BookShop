const jwt = require('jsonwebtoken');
const conn = require('../mariadb') //db 모듈
const {StatusCodes} = require('http-status-codes'); //status code 모듈
const ensureAuthorization = require('../auth'); //인증 모듈


//장바구니 담기
const addCart = (req, res) => {
    const {bookId, quantity} = req.body;

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
    
    let sql = `INSERT INTO cart_items (book_id, quantity, user_id) VALUES (?, ?, ?);`;
    let values = [bookId, quantity, authorization.id];
    conn.query(sql, values,
        function(err, results)
        {
            if(err)
            {
                return res.status(StatusCodes.BAD_REQUEST).json(err);
            }

            return res.status(StatusCodes.OK).json(results);
        }
    );
};

//장바구니 아이템 목록 조회
const getCartItems = (req, res) => {
    const {selected} = req.body; //selected = [1, 3]

    let authorization = ensureAuthorization(req);

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

    let sql = `SELECT cart_items.id, book_id, title, summary, quantity, price
            FROM cart_items LEFT JOIN books 
            ON cart_items.book_id = books.id 
            WHERE user_id = ?`;
    values = [authorization.id];
    
    if(selected) //주문서 작성 시 '선택한 장바구니 목록 조회'
    {
        sql += ` AND cart_items.id IN (?)`;
        values.push(selected);
    }

    conn.query(sql, values,
        function(err, results)
        {
            if(err)
            {
                return res.status(StatusCodes.BAD_REQUEST).json(err); 
            }

            return res.status(StatusCodes.OK).json(results);
        }
    );

};

//장바구니 도서 삭제
const removeCartItem = (req, res) => {

    let authorization = ensureAuthorization(req);

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

    const cartItemId = req.params.id;

    let sql = `DELETE FROM cart_items WHERE id = ?`;
    conn.query(sql, cartItemId,
        function(err, results)
        {
            if(err)
                {
                    return res.status(StatusCodes.BAD_REQUEST).json(err);
                }
    
                return res.status(StatusCodes.OK).json(results);
        }
    );
};


module.exports = {
    addCart,
    getCartItems,
    removeCartItem
};