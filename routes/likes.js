const express = require('express');
const { addLike, cancelLike } = require('../controller/LikeController');
const router = express.Router();

router.use(express.json());

//좋아요 추가
router.post('/:id', addLike);

//좋아요 취소
router.delete('/:id', cancelLike);

module.exports = router;