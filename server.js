const express = require("express");
const app = express();
const mariadb = require("mysql");

const port = 1234;
const conn = mariadb.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "Movie",
});

app.use(express.json());

app.listen(port, () => {
    console.log(`서버가 포트 번호 ${port}에서 실행 중입니다.`);
});

// GET /movies - 전체 영화 조회
app.get("/", (req, res) => {
    res.send("Hello Movie API!");
});

// POST /movies - 영화 등록
app.post("/movies", function (req, res) {
    const {
        title,
        release_date,
        rating,
        description,
        like_count,
        director_id,
    } = req.body;
    const values = [title, release_date, rating, description, like_count, director_id];
    const sql =
        "INSERT INTO movie_list (title, release_date, rating, description, like_count, director_id) VALUES (?,?,?,?,?,?) ";
    conn.query(sql, values, (err, result) => {
        res.send(`영화 등록 완료 : ${title}`)
    }) 
});