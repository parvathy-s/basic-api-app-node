'use strict';

const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000


const cors = require('cors');
const { Pool } = require('pg');
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const users = [
  { username: "abin1", password: "abc"},
  { username: "parvathy4", password: "abc"}
];
//swagger
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { off } = require('process');

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

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(express.urlencoded({ extended: false}))
  .use(cors())
  .use('/api-docs',swaggerUi.serve,swaggerUi.setup(swaggerSpec))
  .use(bodyParser.json())
  .use(express.json())
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
   *                    extid__c:
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
    const { rows } = await db.query(`SELECT id, name, Description__c, extid__c FROM salesforce.example__c`);
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
  /**
   * @swagger
   *  components:
   *      schema:
   *          Example1: 
   *                type: object
   *                properties:
   *                    name:
   *                        type: string
   *                    description__c:
   *                        type: string
   *                    extid__c:
   *                        type: string
   */
  /**
   * @swagger
   * /try:
   *  post:
   *      summary: Create new Example values
   *      description: Post test 
   *      requestBody:
   *          required: true
   *          content:
   *              application/json:
   *                  schema:
   *                     $ref: '#components/schema/Example1' 
   *      responses:
   *          200:
   *              description: Status OK
   *          401:
   *              description: Error
   */
  .post('/try', async (req,res) =>{
    var query = `INSERT INTO salesforce.example__c(name, description__c, extid__c) values (${req.body.name.trim()}, ${req.body.description__c.trim()}, ${req.body.extid__c.trim()})`;
    await db.query(query, (err, res) => {
      if (err) {
        console.log(err.stack)
      } else {
        console.log(res.rows[0])
      }
    })
  }) 
  .get('/user_det', async (req,res) =>{
    const { rows } = await db.query(`SELECT id, name, username__c, password__c, email__c, phone__c FROM salesforce.user__c`);
    res.json(rows);
    
  })
  /**
   * @swagger
   *  components:
   *      schemas:
   *          User: 
   *                type: object
   *                properties:
   *                    username:
   *                        type: string
   *                    password:
   *                        type: string
   */
  /**
  /**
   * @swagger
   * /get_user:
   *  post:
   *      summary: Login validation using static values
   *      description: Check login 
   *      requestBody:
   *          required: true
   *          content:
   *              application/json:
   *                  schema:
   *                     $ref: '#components/schemas/User' 
   *      responses:
   *          200:
   *              description: Status OK
   *          401:
   *              description: Error
   */
  .post('/get_user',(req,res)=>{
    const user = users.find(c => c.username === req.body.username && c.password === req.body.password);
    if(!user)
    res.status(401).send("ERROR");
    else
    res.status(200).send("SUCCESS");
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))

  
