const conn = require('../mariadb') //db 모듈
const {StatusCodes} = require('http-status-codes'); //status code 모듈

//결제하기
const order = (req, res) => {
    const {items, delivery, totalQuantity, totalPrice, userId, firstBookTitle} = req.body;

    let delivery_id;
    let order_id;

    let sql = `INSERT INTO delivery (address, receiver, contact) VALUES (?, ?, ?);`;
    let values = [delivery.address, delivery.receiver, delivery.contact];
    conn.query(sql, values,
        function(err, results)
        {
            if(err)
            {
                return res.status(StatusCodes.BAD_REQUEST).json(err);
            }

            delivery_id = results.insertId;
        }
    );

    sql = `INSERT INTO orders (book_title, total_quantity, total_price, user_id, delivery_id) 
            VALUES (?, ?, ?, ?, ?)`;
    values = [firstBookTitle, totalQuantity, totalPrice, userId, delivery_id];
    conn.query(sql, values,
        function(err, results)
        {
            if(err)
            {
                return res.status(StatusCodes.BAD_REQUEST).json(err);
            }

            order_id = results.insertId;
        }
    );

    values = [];

    sql = `INSERT INTO ordered_book (order_id, book_id, quantity)
            VALUES ?`;

    //items -> 배열: 요소들을 하나씩 꺼내서(foreach문 돌려서) values에 넣어서 sql을 보내야 함. 
    items.forEach((item) => {
        values.push([order_id, item.book_id, item.quantity]);
    });
    conn.query(sql, [values],
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

//주문 목록 조회
const getOrders = (req, res) => {
    
};

//주문 상세 조회
const getOrderDetail = (req, res) => {
    
}

module.exports = {
    order,
    getOrders,
    getOrderDetail
};