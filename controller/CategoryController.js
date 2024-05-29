const conn = require('../mariadb') //db 모듈
const {StatusCodes} = require('http-status-codes'); //status code 모듈
const { all } = require('../routes/users');

const allCategory = function(req, res){
    let sql = `SELECT * FROM category`;
    conn.query(sql, 
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

module.exports = allCategory;