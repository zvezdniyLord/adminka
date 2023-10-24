const express = require("express");
const pg = require('./db');
const fs = require("fs");
const path = require("path");
const fileUpload = require("express-fileupload");
const { randomUUID } = require("crypto");
const cors = require("cors");
const app = express();
const PORT = 3000;
app.use(express.json());
app.use(express.static(path.resolve(__dirname, "public")));
app.use(fileUpload({}));
app.use(cors());


app.get('/api/news', async (req, res) => {
    const allNews = await pg.query("SELECT * FROM news");
    res.status(200).json(allNews.rows)
});

app.get("/api/news/:id", async (req, res) => {
    const id = req.params.id;
    const user = await pg.query("SELECT * FROM news WHERE id = $1", [id]);
    res.status(200).json(user.rows);        
});


app.post('/api/news', async (req, res) => {
    const {title, text} = req.body;
    const uploadedFile = req.files.uploadFile; 
    if(uploadedFile === undefined) {
        res.send("Пустой файл");
    }
    //let fileName = randomUUID() + ".jpg";
    //img.mv(path.resolve(__dirname, "..", "public", fileName));
    if(title.length > 120) {
        res.end("Больше 120 символов - ограничение БД");
    } else {

        if (req.files && Object.keys(req.files).length !== 0) { 
            const uploadPath = __dirname 
                + "/public/" + uploadedFile.name; 
          
            uploadedFile.mv(uploadPath, function (err) { 
              if (err) { 
                console.log(err); 
                res.send("Failed !!"); 
              } else res.send("Successfully Uploaded !!"); 
            }); 
        } else res.send("No file uploaded !!"); 
        const addNews = await pg.query(`INSERT INTO news (img, title, text) VALUES ($1, $2, $3)`, [uploadedFile.name, title, text], (err, result) => {
            if(err) {
                res.send(err);
            } else {
            res.status(201).end(JSON.stringify(addNews));
            }
        });
    }
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

app.post("/file", (req, res) => {
    const file = req.files.file;
    res.end(console.log(file))
})

app.put('/api/news/:id', async (req, res) => {
    const id = req.params.id;
    const {img, title, text} = req.body;
    if(title.length > 120) {
        res.end("Введено больше 120 символов");
    } else {
        const uploadedFile = req.files.uploadFile; 

        if (req.files && Object.keys(req.files).length !== 0) { 
            const uploadPath = __dirname 
                + "/public/" + uploadedFile.name; 
          
            uploadedFile.mv(uploadPath, function (err) { 
              if (err) { 
                console.log(err); 
                res.send("Failed !!"); 
              } else res.send("Successfully Uploaded !!"); 
            }); 
        } else res.send("No file uploaded !!"); 
        const updateNews = await pg.query(`UPDATE news set img = $1, title = $2, text = $3 WHERE id = $4`, [uploadedFile.name, title, text, id], (err, result) => {
            if(err) {
                throw new Error;
            }
            res.end(JSON.stringify(updateNews));
        });            
    }
});

app.listen(PORT, () => console.log(`server start ${PORT}`));