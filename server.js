const express = require("express");
const app = express();
const port = 1234;

app.use(express.json());

app.listen(port, () => {
    console.log(`서버가 포트 번호 ${port}에서 실행 중입니다.`);
});
