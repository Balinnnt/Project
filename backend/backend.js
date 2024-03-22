const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const port = 8000;
app.use(cors());
app.use(express.json());


const connection = mysql.createConnection({
  host: 'http://nodejs1.dszcbaross.edu.hu:22001',
  user: 'u65_7wmzBJtJbL',
  password: '2e96tcReGLX@0x=mj!ow1OPq',
  database: 's65_db'
});

// MySQL kapcsolat ellenőrzése
connection.connect((err) => {
  if (err) {
    console.error('Hiba a MySQL kapcsolódás során: ', err);
  } else {
    console.log('MySQL kapcsolódva!');
  }
});


// A /getjegyzetek végpontot módosítsd így:

app.get('/getfelhasznalok', (req, res) => {
  const query = 'SELECT user.UserID, username FROM note INNER JOIN user ON user.UserID = note.UserID GROUP BY username';

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Hiba a lekérdezés során: ', err);
      res.status(500).send(`Hiba a lekérdezés során: ${err.message}`);
    } else {
      res.status(200).json(results);
    }
  });
});

app.get('/getjegyzetek/:UserID', (req, res) => {
  const userId = req.params.UserID;
  const query = 'SELECT * FROM note INNER JOIN user ON user.UserID = note.UserID WHERE note.UserID = ?';

  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Hiba a lekérdezés során: ', err);
      res.status(500).send(`Hiba a lekérdezés során: ${err.message}`);
    } else {
      res.status(200).json(results);
    }
  });
});

app.delete('/deleteuser/:UserID', (req, res) => {
  const userId = req.params.UserID;

  // Először töröljük az összes jegyzetet, amihez tartozik a felhasználó
  const deleteNotesQuery = 'DELETE FROM note WHERE UserID = ?';
  connection.query(deleteNotesQuery, [userId], (err, notesDeleteResult) => {
    if (err) {
      console.error('Hiba a jegyzetek törlése során: ', err);
      res.status(500).send(`Hiba a jegyzetek törlése során: ${err.message}`);
      return;
    }

    // Most töröljük a felhasználót
    const deleteUserQuery = 'DELETE FROM user WHERE UserID = ?';
    connection.query(deleteUserQuery, [userId], (err, userDeleteResult) => {
      if (err) {
        console.error('Hiba a felhasználó törlése során: ', err);
        res.status(500).send(`Hiba a felhasználó törlése során: ${err.message}`);
        return;
      }

      // Sikeres törlés esetén visszaküldhetünk valamilyen üzenetet vagy üres választ
      res.status(200).send('Felhasználó és jegyzetei sikeresen törölve.');
    });
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT * FROM user WHERE username = ? AND password = ? AND Eligibility = 1';

  connection.query(query, [username, password], (err, results) => {
    if (err) {
      console.error('Hiba a bejelentkezés során: ', err);
      res.status(500).send(`Hiba a bejelentkezés során: ${err.message}`);
    } else {
      if (results.length > 0) {
        // Sikeres bejelentkezés
        res.status(200).send('Sikeres bejelentkezés');
      } else {
        // Sikertelen bejelentkezés
        res.status(401).send('Hibás felhasználónév vagy jelszó');
      }
    }
  });
});


// MySQL kapcsolat lezárása
app.use((req, res, next) => {
  if (connection && connection.state === 'disconnected') {
    connection.connect((err) => {
      if (err) {
        console.error('Hiba a MySQL kapcsolódás során: ', err);
      } else {
        console.log('MySQL kapcsolódva!');
      }
    });
  }
  next();
});


app.listen(port, () => {
  console.log(`A szerver fut a http://localhost:${port} címen`);
});
