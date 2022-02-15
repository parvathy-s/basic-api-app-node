'use strict';

const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const { Client } = require('pg');

const cors = require('cors');
const { Pool } = require('pg');
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});


var bodyParser = require('body-parser');
var pg = require('pg');



express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(cors())
  .use(bodyParser.json())
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/db', (req, res) => {
    var dbOpts = {
      connectionString: process.env.DATABASE_URL,
      ssl : true
    }
    const client = new Client(dbOpts);
    // client.on('error', e => {
    //   console.error('Database error', e);
    //   client = null;
    // });
    client.connect(err =>{
      if(err)
      console.error(err);
      else
      res.send("set");
    });
    // client.query('SELECT id, name, Description__c FROM salesforce.example__c', (err, dbRes) => {
    //       if (err) throw err;
    //       res.render('pages/db',{
    //         results : dbRes.rows
    //       });
    //       client.end();
    //     });
    client.end();
  })
  .get('/fetch',(req,res)=>{
    var config = {
      connectionString: process.env.DATABASE_URL,
      ssl : true
    }
    const pool = new pg.Pool(config);
    pool.connect(function (err, conn, done) {
      // watch for any connect issues
      if (err) console.log(err);
      else
      console.log("connected");
      // conn.query(
      //     'SELECT id, name, Description__c FROM salesforce.example__c',
      //     function(err, result) {
      //         if (err != null || result.rowCount == 0) {
      //             res.status(400).json({error: err.message});
      //         }
      //         else {
      //             done();
      //             res.json(result);
      //         }
      //     }
      // );
  });
  })
  .get('/try', async (req,res) =>{
    const { rows } = await db.query(`SELECT id, name, Description__c FROM salesforce.example__c`);
    res.json(rows);
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))

  
