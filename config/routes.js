const axios = require('axios');
const bcrypt = require('bcryptjs');

const { authenticate, generateToken } = require('./middlewares');
const db = require('../database/dbConfig.js');

//Register-------------------------------------------------
function register(req, res) {
  // implement user registration
  const credentials = req.body;
  console.log('****', credentials, '++++++', req.body)

  const hash = bcrypt.hashSync(credentials.password, 14);
  credentials.password = hash;

  db('users')
    .insert(credentials)
    .then(ids => {
      const id = ids[0]
      const token = generateToken({username: credentials.username})
      res.status(201).json({newUserId: id, token});
    })
    .catch(err => res.status(500).json(err));
} 

//Login ------------------------------------------------------
function login(req, res) {
  // implement user login
  const  creds = req.body;

  db('users')
    .where({username: creds.username})
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(creds.password, user.password)) {
        const token = generateToken(user);
        res.status(200).json({welcome: user.username, token});
      }else {
        res.status(401).json({message: 'You Have Entered An Incorrect Username or Password'});
      }
    })
    .catch(err => res.status(500).json(err));
}

//Gets Jokes Once User is Authenticated ------------------------
function getJokes(req, res) {
  axios
    .get(
      'https://08ad1pao69.execute-api.us-east-1.amazonaws.com/dev/random_ten'
    )
    .then(response => {
      res.status(200).json(response.data);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}

module.exports = server => {
  // server.get('/api/users', users);
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

// //For my own sanity -----------------------------------------
// function users(req,res) {
//   db('users')
//     .select('id', 'username', 'password')
//     .then(users => {
//       res.json({ users });
//     })
//     .catch(err => res.send(err));
// };