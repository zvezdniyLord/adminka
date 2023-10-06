const express = require("express");
const pg = require('./db');
const app = express();
const PORT = 3000;
const cors = require("cors");
app.use(express.json());
app.use(cors());


app.get('/api/news', async (req, res) => {
    const allNews = await pg.query("SELECT * FROM news");
    res.json(allNews.rows)
});

app.get("/api/news/:id", async (req, res) => {
    const id = req.params.id;
    const user = await pg.query("SELECT * FROM news WHERE id = $1", [id]);
    res.json(user.rows);
})

app.post('/api/news', async (req, res) => {
    const {img, title, text} = req.body;
    const addNews = await pg.query(`INSERT INTO news (img, title, text) VALUES ($1, $2, $3)`, [img, title, text]);
    res.end(JSON.stringify(addNews));
});

app.delete("/api/news/:id", async (req, res) => {
    const id = req.params.id;
    const deleteNews = await pg.query(`DELETE FROM news WHERE id = $1`, [id]);
    res.end(JSON.stringify(deleteNews));
});

app.put('/api/news/:id', async (req, res) => {
    const id = req.params.id;
    const {img, title, text} = req.body;
    const updateNews = await pg.query(`UPDATE news set img = $1, title = $2, text = $3 WHERE id = $4`, [img, title, text, id], (err, result) => {
        if(err) {
            console.log(err);
        }
        res.end(JSON.stringify(updateNews));
    });
});

app.listen(PORT, () => console.log(`server start ${PORT}`));