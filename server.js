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
        genres,
        actors,
    } = req.body;

    const movieValues = [
        title,
        release_date,
        rating,
        description,
        like_count,
        director_id,
    ];

    const movieSql =
        "INSERT INTO movie_list (title, release_date, rating, description, like_count, director_id) VALUES (?,?,?,?,?,?)";

    conn.query(movieSql, movieValues, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: `영화 등록 실패: ${err.message}`,
            });
        }

        const movieId = result.insertId;
        let responseMessage = `[${title}] 영화 등록 완료`;

        // 장르 등록
        if (genres && genres.length > 0) {
            const genreValues = genres.map((genreId) => [movieId, genreId]);
            const genreSql =
                "INSERT INTO movie_list_genre (movie_list_id, genre_id) VALUES ?";

            conn.query(genreSql, [genreValues], (err) => {
                if (err) {
                    return res.status(500).json({
                        message: `장르 연결 실패: ${err.message}`,
                    });
                }

                // 배우 등록
                if (actors && actors.length > 0) {
                    const actorValues = actors.map((actorId) => [
                        movieId,
                        actorId,
                    ]);
                    const actorSql =
                        "INSERT INTO movie_list_actor (movie_list_id, actor_id) VALUES ?";

                    conn.query(actorSql, [actorValues], (err) => {
                        if (err) {
                            return res.status(500).json({
                                message: `배우 연결 실패: ${err.message}`,
                            });
                        }

                        return res.status(200).json({
                            message: responseMessage,
                        });
                    });
                } else {
                    return res.status(400).json({
                        message: "영화 등록 실패: 배우가 필요합니다",
                    });
                }
            });
        } else {
            return res.status(400).json({
                message: "영화 등록 실패: 장르가 필요합니다",
            });
        }
    });
});
