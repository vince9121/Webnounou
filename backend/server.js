const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

// Connexion à la base de données SQLite
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('✅ Connecté à la base de données SQLite.');
    }
});

// Création de la table si elle n'existe pas
db.run(`CREATE TABLE IF NOT EXISTS suivi (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    heures INTEGER,
    km INTEGER
)`);

// Route pour ajouter une entrée
app.post('/ajouter', (req, res) => {
    const { date, heures, km } = req.body;
    if (!date || !heures || !km) {
        return res.status(400).json({ error: "Tous les champs sont requis." });
    }
    db.run('INSERT INTO suivi (date, heures, km) VALUES (?, ?, ?)', [date, heures, km], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ id: this.lastID, message: "✅ Enregistrement ajouté." });
        }
    });
});

// Route pour récupérer les données
app.get('/donnees', (req, res) => {
    db.all('SELECT * FROM suivi', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Route pour réinitialiser les données
app.delete('/reset', (req, res) => {
    db.run('DELETE FROM suivi', [], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: "✅ Données réinitialisées." });
        }
    });
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${port}`);
});
