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
app.get("/movies", function (req, res) {
    const sql = "SELECT * FROM movie_list";
    conn.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                message: `영화 목록 조회 실패 : ${err.message}`,
            });
        }
        return res.status(200).json({
            message: "영화 목록 조회 성공",
            list: results,
        });
    });
});

// GET /movies/:id - 특정 영화 조회
app.get("/movies/:id", function (req, res) {
    const movieId = req.params.id;
    const sql = "SELECT * FROM movie_list WHERE id = ?";

    conn.query(sql, [movieId], (err, results) => {
        if (err) {
            return res.status(500).json({
                message: `영화 조회 실패: ${err.message}`,
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "영화를 찾을 수 없습니다",
            });
        }

        return res.status(200).json({
            message: "영화 조회 성공",
            data: results[0],
        });
    });
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

// PUT /movies/:id - 영화 정보(제목) 수정
app.put("/movies/:id", function (req, res) {
    const movieId = req.params.id; 
    const { newTitle } = req.body;

    if (!newTitle) {
        return res.status(400).json({
            message: "새로운 제목이 필요합니다.",
        });
    }

    // 기존 제목 조회
    const getTitleSql = "SELECT title FROM movie_list WHERE id = ?";
    
    conn.query(getTitleSql, [movieId], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: `영화 제목 조회 실패: ${err.message}`,
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                message: "해당 ID의 영화를 찾을 수 없습니다.",
            });
        }

        const oldTitle = result[0].title;

        // 영화 제목 수정
        const updateSql = "UPDATE movie_list SET title = ? WHERE id = ?";
        const values = [newTitle, movieId];

        conn.query(updateSql, values, (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: `영화 제목 수정 실패: ${err.message}`,
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "영화 정보 수정 실패: 제목이 변경되지 않았습니다.",
                });
            }

            return res.status(200).json({
                message: `영화 제목 변경 완료: ${oldTitle} -> ${newTitle}`,
            });
        });
    });
});
