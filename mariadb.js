//mysql 모듈 소환
const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

//DB와 연결 통로 생성
const connection = {
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PWD,
    database: 'bookshop',
    dateStrings: true
};

module.exports = connection
