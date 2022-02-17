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

//swagger
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi : '3.0.0',
    info : {
      title: 'Heroku Connect Data Fetch',
      version: '1.0.0'
    },
    servers: [
      {
        url: 'https://basic-api-app-node.herokuapp.com/'
      }
    ]
  },
  apis: ['./index.js']
}

const swaggerSpec = swaggerJSDoc(options)

var bodyParser = require('body-parser');
var pg = require('pg');



express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(cors())
  .use('/api-docs',swaggerUi.serve,swaggerUi.setup(swaggerSpec))
  .use(bodyParser.json())
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  /**
   * @swagger
   * /:
   *  get:
   *      summary: This is the home page
   *      description: This is the home page
   *      responses:
   *          200:
   *              description: Status OK
   */
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

  /**
   * @swagger
   *  components:
   *      schema:
   *          Example: 
   *                type: object
   *                properties:
   *                    id:
   *                        type: integer
   *                    name:
   *                        type: string
   *                    description__c:
   *                        type: string
   */
  /**
   * @swagger
   * /try:
   *  get:
   *      summary: Fetch data from Example SF Object
   *      description: Fetch example data from Heroku Postgres
   *      responses:
   *          200:
   *              description: Status OK
   *              content:
   *                  application/json: 
   *                      schema:
   *                          type: array
   *                          items:
   *                              $ref: '#components/schema/Example'
   */
  .get('/try', async (req,res) =>{
    const { rows } = await db.query(`SELECT id, name, Description__c FROM salesforce.example__c`);
    res.json(rows);
    
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))

  
