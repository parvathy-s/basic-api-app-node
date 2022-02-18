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

const users = [
  { username: "abin1", password: "abc"}
];
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
const { user } = require('pg/lib/defaults');



express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(express.urlencoded({ extended: false}))
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
  /**
   * @swagger
   * /try/{id}:
   *  get:
   *      summary: Fetch specific from Example SF Object
   *      description: Fetch example data by ID from Heroku Postgres
   *      parameters:
   *           - in: path
   *             name: id
   *             required: true
   *             description: Numeric ID required
   *             schema:
   *                type: integer
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
  .get('/try/:id', async (req,res) =>{
    var id = req.params.id;
    const { rows } = await db.query(`SELECT id, name, Description__c FROM salesforce.example__c where id = ${id}`);
    res.json(rows);
  })
  .get('/user_det', async (req,res) =>{
    const { rows } = await db.query(`SELECT id, name, username__c, password__c, email__c, phone__c FROM salesforce.user__c`);
    res.json(rows);
    
  })
  .post('/get_user',(req,res)=>{
    if(req.body.username == users.username && req.body.password == users.password)
    res.status(200).send("SUCCESS");
    else
    res.status(401).send("ERROR");
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))

  
