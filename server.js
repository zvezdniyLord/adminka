const express = require("express");
const pg = require('./db');
const path = require("path");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve(__dirname, "public")));
app.use(fileUpload({}));


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
    console.log(req.body);      
    const uploadedFile = req.files.uploadFile;

    //let fileName = randomUUID() + ".jpg";
    //img.mv(path.resolve(__dirname, "..", "public", fileName));
    if(title.length > 120) {
        return res.end("Больше 120 символов - ограничение БД");
    } 
       if (req.files && Object.keys(req.files).length !== 0) { 
            console.log(uploadedFile);
            const uploadPath = __dirname 
                + "/public/" + uploadedFile.name; 
          
            uploadedFile.mv(uploadPath, function (err) { 
              if (err) { 
                console.log(err); 
                return res.send("Failed !!"); 
              } else {
                return res.send("Successfully Uploaded !!");
              } 
            }); 
        } else {
            return res.send("No file uploaded !!");
        };
        
        const addNews = await pg.query(`INSERT INTO news (img, title, text) VALUES ($1, $2, $3)`, [uploadedFile.name, title, text]);
        return res.status(201).json(addNews.rows[0]);
});

app.delete("/api/news/:id", async (req, res) => {
    const id = req.params.id;
    if(!id) {
        res.end("Новости с такой ID нет");
    } else {
        const deleteNews = await pg.query(`DELETE FROM news WHERE id = $1`, [id]);
        return res.status(200).end(JSON.stringify(deleteNews));    
    }
});

app.put('/api/news/:id', async (req, res) => {
    const id = req.params.id;
    const {title, text} = req.body;
    if(title.length > 120) {
        return res.end("Введено больше 120 символов");
    } else {
        let uploadedFile = req.files.uploadFile; 

        if (req.files && Object.keys(req.files).length !== 0) { 
            const uploadPath = __dirname 
                + "/public/" + uploadedFile.name; 
          
            uploadedFile.mv(uploadPath, function (err) { 
              if (err) { 
                console.log(err); 
                return res.send("Failed !!"); 
              } else res.send("Successfully Uploaded !!"); 
            }); 
        } else res.send("No file uploaded !!"); 
        const updateNews = await pg.query(`UPDATE news set img = $1, title = $2, text = $3 WHERE id = $4`, [uploadedFile.name, title, text, id], (err, result) => {
            if(err) {
                throw new Error;
            }
            return res.end(JSON.stringify(updateNews));
        });            
    }
});

app.post("/login", (req, res) => {
    const PASSWORD = "nbvcxz";
    const {password} = req.body;
    console.log({password});
    if(password !== PASSWORD || password === "") {
        return res.status(400).send("Не правильный пароль");
    } else {
        return res.send("Вход в админку осуществлен");
    }
});

app.listen(PORT, () => console.log(`server start ${PORT}`));