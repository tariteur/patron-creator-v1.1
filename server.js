require('dotenv').config();
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const path = require('path');
const Joi = require('joi');

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000
});
app.use(limiter);

const filePath = './data.json';
let token = process.env.TOKEN
let admin_name = process.env.ADMIN_NAME;
let admin_password = process.env.ADMIN_PASSWORD;

function generateToken() {
    const newToken = jwt.sign({}, token, { expiresIn: '1h' }); // Utilise token ici, qui est maintenant initialisé
    const envContent = `TOKEN=${token}\nADMIN_NAME=${admin_name}\nADMIN_PASSWORD=${admin_password}`;
    fs.writeFileSync('.env', envContent);
    return newToken;
}
setInterval(generateToken, 60 * 60 * 1000);

function authenticateAdmin(req, res, next) {
    const clientToken = req.headers.authorization;

    if (!clientToken) {
        return res.status(401).send('Accès non autorisé. Token manquant.');
    }

    jwt.verify(clientToken.split(' ')[1], token, (err, decoded) => {
        if (err) {
            return res.status(403).send('Accès interdit. Token invalide.');
        }

        if (!decoded.isAdmin) {
            return res.status(403).send('Accès interdit. Seuls les administrateurs peuvent accéder à cette ressource.');
        }

        next();
    });
}

function readJsonFile(callback) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            callback(err, null);
        } else {
            try {
                const jsonData = data.length ? JSON.parse(data) : [];
                callback(null, jsonData);
            } catch (parseErr) {
                callback(parseErr, null);
            }
        }
    });
}

const writeJsonFile = (data, callback) => {
    fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', (err) => {
        callback(err);
    });
};

const loginDirectory = path.join(__dirname, 'src', 'login');
const addPersonDirectory = path.join(__dirname, 'src', 'add-person');
const editorDirectory = path.join(__dirname, 'src', 'editor');
const testDirectory = path.join(__dirname, 'src', 'test');

app.use('/login', express.static(loginDirectory));
app.use('/add-person', express.static(addPersonDirectory));
app.use('/editor', express.static(editorDirectory));
app.use('/test', express.static(testDirectory));

app.get('/data', authenticateAdmin, (req, res) => {
    readJsonFile((err, jsonData) => {
        if (err) {
            return res.status(500).send('Erreur lors de la lecture du fichier');
        }
        res.send(jsonData);
    });
});

app.post('/data', authenticateAdmin, (req, res) => {
    let { action, name, numero, email, index } = req.body;

    let [originalName, newName] = name.includes("=") ? name.split("=") : [name, null];
    name = originalName;
    
    readJsonFile((err, jsonData) => {
        if (err) {
            return res.status(500).send('Erreur lors de la lecture du fichier');
        }
        let existingEntry = jsonData.find(entry => entry.name === name);
        switch (action) {
            case 'add-people':
                if (existingEntry) {
                    return res.status(400).send('Person already exists');
                }
                if (name === null)  {
                    return res.status(400).send('Name of person neaded');
                }
                jsonData.push({ name, numero, email, index: {} });
                break;

            case 'remove-people':
                if (!existingEntry) {
                    return res.status(400).send('Person not found');
                }
                jsonData = jsonData.filter(entry => entry.name !== name);
                break;

            case 'update-people':
                if (!existingEntry) {
                    return res.status(400).send('Person not found');
                }
                const indexToUpdate = jsonData.findIndex(entry => entry.name === name);
                if (indexToUpdate === -1) {
                    return res.status(400).send('Person not found');
                }

                jsonData[indexToUpdate].name = newName;
                jsonData[indexToUpdate].numero = numero;
                jsonData[indexToUpdate].email = email;
                break;

            case 'add-appointment':
                if (!existingEntry) {
                    return res.status(400).send('Person not found');
                }
                if (!index) {
                    return res.status(400).send('Invalid appointment data');
                }
                let maxRdv = 0;

                Object.values(existingEntry.index).forEach(data => {
                   if (data.rdv) maxRdv = Math.max(maxRdv, data.rdv);
                });

                const rdv = maxRdv + 1;

                let nextKey = Object.keys(existingEntry.index).length.toString();

                existingEntry.index[nextKey] = { 
                    date: index.date,
                    rdv: rdv,
                    editor: {
                      tourDeTaille: 40,
                      longueur7emeCervicaleTailleDos: 30,
                      hauteurTaillePointsDeSein: 12,
                      carrureDos: 20,
                      tourDePoitrine: 50,
                      tourDEncolure: 12,
                      longueurDEpaule: 13,
                      descenteDEpaule: 3
                    }
                  };
                break;

            case 'remove-appointment':
                if (!existingEntry) {
                    return res.status(400).send('Person not found');
                }
                if (!index || index.rdv === undefined) {
                    return res.status(400).send('Invalid appointment data');
                }
                existingEntry.index = Object.values(existingEntry.index).filter(data => data.rdv != index.rdv);
                break;

            case 'update-appointment':                
                if (!existingEntry) {
                    return res.status(400).send('Person not found');
                }
                let appointment = Object.values(existingEntry.index).find(data => data.rdv == index.rdv);

                if (appointment) {
                    if (index.date) appointment.date = index.date;
                    if (index.editor) appointment.editor = index.editor;
                } else {
                    return res.status(400).send('Appointment not found');
                }
                break;

            default:
                return res.status(400).send('Invalid action');
        }

        writeJsonFile(jsonData, (err) => {
            if (err) {
                return res.status(500).send('Erreur lors de la sauvegarde des données');
            }
            res.send('Données sauvegardées avec succès');
        });
    });
});
    
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username === admin_name && password === admin_password) {
        if (!token) {
            return res.status(500).send('Clé secrète manquante. Veuillez vérifier le fichier .env.');
        }

        const tokenGenerated = jwt.sign({ username, isAdmin: true }, token, {
            expiresIn: '1h',
            issuer: 'patron-creator',
            audience: 'admin'
        });

        res.json({ token: tokenGenerated });
    } else {
        res.status(401).send('Identifiants invalides');
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(loginDirectory, 'index.html'));
});

app.get('/editor', (req, res) => {
    res.sendFile(path.join(editorDirectory, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
