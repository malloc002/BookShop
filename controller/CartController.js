const conn = require('../mariadb') //db 모듈
const {StatusCodes} = require('http-status-codes'); //status code 모듈

//장바구니 담기
const addCart = (req, res) => {
    const {bookId, quantity, userId} = req.body;
    

    let sql = `INSERT INTO cart_items (book_id, quantity, user_id) VALUES (?, ?, ?);`;
    let values = [bookId, quantity, userId];
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
    const {user_id, selected} = req.body; //selected = [1, 3]
    
    if(selected)
    {
        let sql = `SELECT cart_items.id, book_id, title, summary, quantity, price
            FROM cart_items LEFT JOIN books 
            ON cart_items.book_id = books.id 
            WHERE user_id = ? AND cart_items.id IN (?)`;
        let values = [user_id, selected];
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
    }
    else {
        let sql = `SELECT cart_items.id, book_id, title, summary, quantity, price
            FROM cart_items LEFT JOIN books 
            ON cart_items.book_id = books.id 
            WHERE user_id = ?`;
        conn.query(sql, user_id,
            function(err, results)
            {
                if(err)
                {
                    return res.status(StatusCodes.BAD_REQUEST).json(err); 
                }

                return res.status(StatusCodes.OK).json(results);
            }
        );
    }

};

//장바구니 도서 삭제
const removeCartItem = (req, res) => {
    const {id} = req.params;

    let sql = `DELETE FROM cart_items WHERE id = ?`;
    conn.query(sql, id,
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