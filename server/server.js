const dotenv = require('dotenv');
dotenv.config();  

const db = require('./config/dbconfig');  

const app = require('./app');

const port = process.env.PORT;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})