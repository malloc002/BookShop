const jwt = require('jsonwebtoken');
const conn = require('../mariadb') //db 모듈
const {StatusCodes} = require('http-status-codes'); //status code 모듈
const ensureAuthorization = require('../auth'); //인증 모듈

//(카테고리 별, 신간 여부) 전체 도서 목록 조회
const allBooks = (req, res) => {

    let {category_id, news, limit, currentPage} = req.query;

    let allBooksRes = {};
    //limit: page 당 도서 수
    //currentPage: 현재 몇 페이지인지 ex) 1페이지, 2페이지, ...
    //offset: limit * (currentPage - 1) 
    let offset = limit * (currentPage - 1);

    let sql = `SELECT SQL_CALC_FOUND_ROWS *, (SELECT count(*) FROM likes WHERE liked_book_id = books.id) AS likes FROM books `;
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
                allBooksRes.books = results;
            } else {
                return res.status(StatusCodes.NOT_FOUND).json({
                    message: "책이 없습니다."
                })
            }
        }
    ); 

    sql = `SELECT found_rows()`;
    conn.query(sql,
        function(err, results){
            if(err)
            {
                return res.status(StatusCodes.BAD_REQUEST).json(err);
            }

            let pagination = {};
            pagination.currentPage = parseInt(currentPage);
            pagination.totalCount = results[0]["found_rows()"];

            allBooksRes.pagination = pagination;

            return res.status(StatusCodes.OK).json(allBooksRes);
        }
    );
    
};

const bookDetail = (req, res) => {

    //로그인 상태가 아니면 -> liked 빼고 보내주면 되고
    //로그인 상태이면 -> liked 추가해서 보내주면 됨
    
    let {id} = req.params;
    let book_id = parseInt(id);
    
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

    let sql;
    let values;

    if(authorization instanceof ReferenceError) //로그인하지 않은 상태 
    {
        sql = `SELECT *, 
                (SELECT count(*) FROM likes WHERE liked_book_id = books.id) AS likes
                FROM books 
                LEFT JOIN category ON books.category_id = category.category_id 
                WHERE books.id = ?`;
        values = [book_id];
    }
    else {
        sql = `SELECT *, 
                EXISTS(SELECT * FROM likes WHERE user_id = ? AND liked_book_id = ?) AS liked, 
                (SELECT count(*) FROM likes WHERE liked_book_id = books.id) AS likes
                FROM books 
                LEFT JOIN category ON books.category_id = category.category_id 
                WHERE books.id = ?`;
        values = [authorization.id, book_id, book_id];
    }

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