const jwt = require('jsonwebtoken');
const mariadb = require('mysql2/promise');
const {StatusCodes} = require('http-status-codes'); //status code 모듈
const dotenv = require('dotenv');
const ensureAuthorization = require('../auth'); //인증 모듈

dotenv.config();

//결제하기
const order = async (req, res) => {
    const conn = await mariadb.createConnection({
        host: 'localhost',
        user: 'root',
        password: process.env.DB_PWD,
        database: 'bookshop',
        dateStrings: true
    });

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

    const {items, delivery, totalQuantity, totalPrice, userId, firstBookTitle} = req.body;

    //delivery 테이블 삽입
    let sql = `INSERT INTO delivery (address, receiver, contact) VALUES (?, ?, ?);`;
    let values = [delivery.address, delivery.receiver, delivery.contact];
    let [results] = await conn.execute(sql, values);

    console.log(results);

    let delivery_id = results.insertId;

    //orders 테이블 삽입
    sql = `INSERT INTO orders (book_title, total_quantity, total_price, user_id, delivery_id) 
            VALUES (?, ?, ?, ?, ?)`;
    values = [firstBookTitle, totalQuantity, totalPrice, authorization.id, delivery_id];
    [results] = await conn.execute(sql, values);

    let order_id = results.insertId;

    //book_id, quantity 알아내기 FROM cart_items
    sql = `SELECT book_id, quantity FROM cart_items WHERE id IN (?)`;
    let [orderItems, fields] = await conn.query(sql, [items]);

    //ordered_book 테이블 삽입
    sql = `INSERT INTO ordered_book (order_id, book_id, quantity)
    VALUES ?`;

    //items -> 배열: 요소들을 하나씩 꺼내서(forEach문 돌려서) values에 넣어서 sql을 보내야 함. 
    values = [];
    orderItems.forEach((item) => {
        values.push([order_id, item.book_id, item.quantity]);
    });
    [results] = await conn.query(sql, [values]);


    let result = await deleteCartItems(conn, items);
    
    return res.status(StatusCodes.OK).json(result);
};

const deleteCartItems = async (conn, items) => {
    let sql = `DELETE FROM cart_items WHERE id IN (?)`;

    let result = await conn.query(sql, [items]);

    return result;
};

//주문 목록 조회
const getOrders = async (req, res) => {

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

    const conn = await mariadb.createConnection({
        host: 'localhost',
        user: 'root',
        password: process.env.DB_PWD,
        database: 'bookshop',
        dateStrings: true
    });
    
    let sql = `SELECT * FROM orders LEFT JOIN delivery ON orders.delivery_id = delivery.id WHERE user_id = ?`;

    let [rows, fields] = await conn.query(sql, authorization.id);

    return res.status(StatusCodes.OK).json(rows);
};

//주문 상세 조회
const getOrderDetail = async (req, res) => {

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

    const conn = await mariadb.createConnection({
        host: 'localhost',
        user: 'root',
        password: process.env.DB_PWD,
        database: 'bookshop',
        dateStrings: true
    });

    const order_id = req.params.id;
    
    let sql = `SELECT book_id, title, author, price, quantity 
                FROM ordered_book LEFT JOIN books 
                ON books.id = ordered_book.book_id 
                WHERE order_id = ?`;

    let [rows, fields] = await conn.query(sql, order_id);

    return res.status(StatusCodes.OK).json(rows);
}

module.exports = {
    order,
    getOrders,
    getOrderDetail
};