const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const app = express();
const mysql = require('mysql2');

// Création de la connexion à la base de données
const db = mysql.createConnection({
    host: '127.0.0.1',     // L'adresse IP de votre serveur MySQL
    user: 'root',          // Nom d'utilisateur pour se connecter à MySQL
    password: '',          // Mot de passe pour l'utilisateur, vide ici selon l'URL
    database: 'store',     // Nom de la base de données à utiliser
    port: 3306             // Port utilisé par le serveur MySQL
});

// Connexion à la base de données
db.connect(err => {
    if (err) {
        console.error('Erreur de connexion : ' + err.stack);
        return;
    }
    console.log('Connecté à la base de données MySQL avec l\'ID ' + db.threadId);
});


// Middleware pour servir des fichiers statiques
app.use(express.static('public'));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.use(express.json());

// Route pour pinger une adresse IP
app.get('/ping', (req, res) => {
    const ip = req.query.ip;
    if (!ip) {
        return res.status(400).send('Adresse IP requise.');
    }

    exec(`ping -n 5 ${ip}`, (error, stdout, stderr) => {
        if (error || stderr) {
            saveOrUpdateIpInfo(ip, stderr || error.message, 'Inactif', '');
            return res.status(500).send(`Erreur de ping : ${stderr || error.message}`);
        }

        saveOrUpdateIpInfo(ip, stdout, 'Actif', '');
        res.send(stdout);
    });
});

app.get('/moreinfo', (req, res) => {
    const ip = req.query.ip;
    // Requête à la base de données pour obtenir des informations sur l'IP
    db.query('SELECT * FROM info_ip WHERE ip_address = ?', [ip], (err, results) => {
        if (err) {
            return res.status(500).send('Erreur lors de la récupération des informations');
        }
        res.json(results);
    });
});

// Fonction pour insérer ou mettre à jour les informations IP
function saveOrUpdateIpInfo(ipAddress, lastPingResponse, status, additionalInfo) {
    const checkQuery = `SELECT id FROM info_ip WHERE ip_address = ?`;

    db.query(checkQuery, [ipAddress], (err, results) => {
        if (err) {
            console.error('Erreur lors de la vérification des informations IP:', err);
            return;
        }

        if (results.length > 0) {
            updateIpInfo(ipAddress, lastPingResponse, status, additionalInfo);
        } else {
            insertIpInfo(ipAddress, lastPingResponse, status, additionalInfo);
        }
    });
}

// Fonction pour insérer des informations IP
function insertIpInfo(ipAddress, lastPingResponse, status, additionalInfo) {
    const query = `INSERT INTO info_ip (ip_address, last_ping_response, status, additional_info) VALUES (?, ?, ?, ?)`;

    db.query(query, [ipAddress, lastPingResponse, status, additionalInfo], (err, results) => {
        if (err) {
            console.error('Erreur lors de l\'insertion des informations IP:', err);
            return;
        }
        console.log('Informations IP insérées avec succès. ID:', results.insertId);
    });
}


// Fonction pour mettre à jour les informations IP
function updateIpInfo(ipAddress, lastPingResponse, status, additionalInfo) {
    const query = `UPDATE info_ip SET last_ping_response = ?, status = ?, additional_info = ?, last_checked = NOW() WHERE ip_address = ?`;

    db.query(query, [lastPingResponse, status, additionalInfo, ipAddress], (err, results) => {
        if (err) {
            console.error('Erreur lors de la mise à jour des informations IP:', err);
            return;
        }
        console.log('Informations IP mises à jour avec succès.');
    });
}


// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});