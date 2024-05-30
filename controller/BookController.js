const conn = require('../mariadb') //db 모듈
const {StatusCodes} = require('http-status-codes'); //status code 모듈

//(카테고리 별, 신간 여부) 전체 도서 목록 조회
const allBooks = (req, res) => {

    let {category_id, news, limit, currentPage} = req.query;
    //limit: page 당 도서 수
    //currentPage: 현재 몇 페이지인지 ex) 1페이지, 2페이지, ...
    //offset: limit * (currentPage - 1) 
    let offset = limit * (currentPage - 1);

    let sql = `SELECT *, (SELECT count(*) FROM likes WHERE liked_book_id = books.id) AS likes FROM books `;
    let values = [];
    if(category_id && news)
    {
        sql += `WHERE category_id = ? AND publish_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()`;
        values = [category_id];
    }
    else if(category_id)
    {
        sql += `WHERE category_id = ?`;
        values = [category_id];
    }
    else if(news)
    {
        sql += `WHERE publish_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()`;
    }

    sql += ` LIMIT ? OFFSET ?`;
    values.push(parseInt(limit));
    values.push(offset);
        
    conn.query(sql, values,
        function(err, results){
            if(err)
            {
                return res.status(StatusCodes.BAD_REQUEST).json(err);
            }

            if(results.length)
            {
                return res.status(StatusCodes.OK).json(results);
            }
            else{
                return res.status(StatusCodes.NOT_FOUND).json({
                    message: "책이 없습니다."
                });
            }
        }
    );  
    
};

const bookDetail = (req, res) => {
    
    let {id} = req.params;
    let book_id = parseInt(id);
    let {user_id} = req.body;

    let sql = `SELECT *, 
                EXISTS(SELECT * FROM likes WHERE user_id = ? AND liked_book_id = ?) AS liked, 
                (SELECT count(*) FROM likes WHERE liked_book_id = books.id) AS likes
                FROM books 
                LEFT JOIN category ON books.category_id = category.category_id 
                WHERE books.id = ?`;
    let values = [user_id, book_id, book_id];
    conn.query(sql, values,
        function(err,results)
        {
            if(err)
            {
                return res.status(StatusCodes.BAD_REQUEST).json(err);
            }

            const book = results[0];

            if(book)
            {
                return res.status(StatusCodes.OK).json(book);
            }
            else{
                return res.status(StatusCodes.NOT_FOUND).json({
                    message: "책이 없습니다."
                });
            }
        }
    );
};


module.exports = {
    allBooks,
    bookDetail
};