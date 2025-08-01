const express = require('express')
const app = express()
const cors=require('cors');
const cookieParser = require('cookie-parser');
const DbConnection= require('./Db/db');
const dotenv=require('dotenv');
dotenv.config();
const port = process.env.PORT || 3000

app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true, 
}));
app.use(express.json({ limit: '10mb' }));

DbConnection();


const interviewRoutes = require('./routes/interview.js');
const authRoutes = require('./routes/auth.js');
const jobRoutes = require('./routes/job.js');
const shortlistRoutes = require('./routes/shortlist.js');

app.use('/api/interview', interviewRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/job', jobRoutes);
app.use('/api/shortlist', shortlistRoutes);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, '0.0.0.0', () => {
  console.log(`Backend has started and listening on port ${port}`)
})