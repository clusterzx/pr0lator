const sqlite3 = require('sqlite3').verbose();

// create function to INSERT into database (called in bot_new.js)
function saveToDatabase(commentId, postId, author, mediaUrl) {
  return new Promise((resolve, reject) => {
    // open database in memory
    let db = new sqlite3.Database('./database.sqlite3', (err) => {
      if (err) {
        console.error(err.message);
        reject(err);
      }
      console.log('Connected to the database.');
    });
    //create new date object (only dd.mm.yyyy)
    var date = new Date();
    var created = date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear();
    // insert one row into the langs table
    db.run(`INSERT INTO history(postId, commentId, user, created, mediaUrl) VALUES(?, ?, ?, ?, ?)`, [postId, commentId, author, created, mediaUrl], function (err) {
      if (err) {
        console.log(err.message);
        reject(err);
      }
      // get the last insert id
      console.log(`A row has been inserted with rowid ${this.lastID}`);
      resolve(this.lastID);
    });
  });
}

//function to check if postId is already in database
function checkIfPostIdExists(postId) {
  return new Promise((resolve, reject) => {
    // open database in memory
    let db = new sqlite3.Database('./database.sqlite3', (err) => {
      if (err) {
        console.error(err.message);
        reject(err);
      }
      console.log('Connected to the database.');
    });
    //check if postId exists
    db.get(`SELECT postId FROM history WHERE postId = ?`, [postId], (err, row) => {
      if (err) {
        console.error(err.message);
        reject(err);
      }
      if (row) {
        console.log(`PostId ${postId} already exists`);
        resolve(true);
      } else {
        console.log(`PostId ${postId} does not exist`);
        resolve(false);
      }
    });
  });
}

module.exports = { saveToDatabase, checkIfPostIdExists };