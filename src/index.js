import express from "express";

const app = express();
const port = 8000;

app.use (express.json());

app.get('/', (req, res) => {
    res.send("Hello from Expres!");
});

app.listen(port, () => {
    console.log(`server is running at http://localhost:${port}`);
})