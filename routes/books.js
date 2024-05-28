const express = require('express');
const router = express.Router();

router.use(express.json());

//전체 도서 조회
router.get("/", (req, res) => {

});

//개별 도서 조회
router.get("/:id", (req, res) => {

});

//카테고리 별 도서 목록 조회
router.get("/", (req, res) => {
    //query string은 url에 명시하지 않고 들어오면 req.query.해당매개변수명 으로 갖다 쓴다. 

});

module.exports = router;
