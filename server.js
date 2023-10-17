const express = require("express");
const pg = require('./db');
const fs = require("fs");
const path = require("path");
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
    if(title.length > 120) {
        res.end("Больше 120 символов - ограничение БД");
    } else {
        const addNews = await pg.query(`INSERT INTO news (img, title, text) VALUES ($1, $2, $3)`, [img, title, text], (err, result) => {
            if(err) {
                throw new Error;
            } else {
            res.status(201).end(JSON.stringify(addNews));

            }
        });
    }
});

app.post('/api/news/file', async(req, res) => {
    const {file} = req.body;
    const readAbleFile = fs.readdirSync(path.dirname("/")).push({file});
    res.end(JSON.stringify(readAbleFile));
});

app.delete("/api/news/:id", async (req, res) => {
    const id = req.params.id;
    if(!id) {
        res.end("Новости с такой ID нет");
    } else {
        const deleteNews = await pg.query(`DELETE FROM news WHERE id = $1`, [id]);
        res.status(200).end(JSON.stringify(deleteNews));    
    }
});

app.put('/api/news/:id', async (req, res) => {
    const id = req.params.id;
    const {img, title, text} = req.body;
    if(title.length > 120) {
        res.end("Введено больше 120 символов");
    } else {
        const updateNews = await pg.query(`UPDATE news set img = $1, title = $2, text = $3 WHERE id = $4`, [img, title, text, id], (err, result) => {
            if(err) {
                throw new Error;
            }
            res.end(JSON.stringify(updateNews));
        });            
    }
});

app.listen(PORT, () => console.log(`server start ${PORT}`));