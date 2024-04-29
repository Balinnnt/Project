const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const port = 8000;
app.use(cors());
app.use(express.json());


  const connection = mysql.createConnection({
  host: 'http://nodejs2.dszcbaross.edu.hu:22001',
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
  const deleteNotesQuery = 'DELETE FROM note WHERE UserID = ?';
  connection.query(deleteNotesQuery, [userId], (err, notesDeleteResult) => {
    if (err) {
      console.error('Hiba a jegyzetek törlése során: ', err);
      res.status(500).send(`Hiba a jegyzetek törlése során: ${err.message}`);
      return;
    }

    const deleteUserQuery = 'DELETE FROM user WHERE UserID = ?';
    connection.query(deleteUserQuery, [userId], (err, userDeleteResult) => {
      if (err) {
        console.error('Hiba a felhasználó törlése során: ', err);
        res.status(500).send(`Hiba a felhasználó törlése során: ${err.message}`);
        return;
      }


      res.status(200).send('Felhasználó és jegyzetei sikeresen törölve.');
    });
  });
});

app.post('/addnote', (req, res) => {
  const { UserID, Title, Content } = req.body;

  if (!UserID || !Title || !Content) {
    return res.status(400).send('Hiányzó adat(ok)');
  }

  // Ellenőrizzük, hogy a UserID létezik-e
  const userCheckQuery = 'SELECT * FROM user WHERE UserID = ?';
  connection.query(userCheckQuery, [UserID], (err, userResult) => {
    if (err) {
      console.error('Hiba a felhasználó ellenőrzése során: ', err);
      return res.status(500).send(`Hiba a felhasználó ellenőrzése során: ${err.message}`);
    }

    if (userResult.length === 0) {
      return res.status(404).send('A megadott felhasználó nem található');
    }

    // Ha minden ellenőrzés sikeres, akkor hozzáadjuk az új jegyzetet
    const addNoteQuery = 'INSERT INTO note (UserID, Title, Content) VALUES (?, ?, ?)';
    connection.query(addNoteQuery, [UserID, Title, Content], (err, insertResult) => {
      if (err) {
        console.error('Hiba az új jegyzet hozzáadása során: ', err);
        return res.status(500).send(`Hiba az új jegyzet hozzáadása során: ${err.message}`);
      }

      return res.status(201).send('Új jegyzet sikeresen hozzáadva');
    });
  });
});


/*
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
*/


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