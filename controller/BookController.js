const conn = require('../mariadb') //db 모듈
const {StatusCodes} = require('http-status-codes'); //status code 모듈

const allBooks = (req, res) => {

    let {category_id} = req.query;

    if(category_id)
    {
        let sql = `SELECT * FROM books WHERE category_id = ?`;
        conn.query(sql, category_id,
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
    }
    else{
        let sql = `SELECT * FROM books`;
        conn.query(sql,
            function(err,results)
            {
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
    }
    
    
};

const bookDetail = (req, res) => {
    
    let {id} = req.params;
    id = parseInt(id);

    let sql = `SELECT * FROM books 
                LEFT JOIN category ON books.category_id = category.id 
                WHERE books.id = ?`;
    conn.query(sql, id,
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