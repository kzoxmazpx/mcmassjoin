const fs = require('fs');
const mineflayer = require('mineflayer');
const Movements = require('mineflayer-pathfinder').Movements;
const { GoalBlock } = require('mineflayer-pathfinder').goals;
const config = require('./settings.json');
const express = require('express');

const app = express();
const botCount = 200; // Nombre de bots à créer
const reconnectDelay = 30000; // Délai de reconnexion (30 secondes)
const pseudoFile = './pseudo.txt'; // Chemin vers le fichier contenant les pseudonymes

let pseudos = [];

// Charger les pseudonymes depuis le fichier
try {
    const data = fs.readFileSync(pseudoFile, 'utf8');
    pseudos = data.split('\n').filter(Boolean); // Séparer par lignes et filtrer les vides
} catch (err) {
    console.error(`Error reading ${pseudoFile}: ${err}`);
    process.exit(1); // Arrêter le programme en cas d'erreur
}

// Fonction pour choisir un pseudo aléatoire
function getRandomPseudo() {
    const randomIndex = Math.floor(Math.random() * pseudos.length);
    return pseudos[randomIndex];
}

// Fonction pour créer un bot avec un pseudo aléatoire
function createBot(botIndex) {
    const username = getRandomPseudo();
    const bot = mineflayer.createBot({
        username: username,
        password: config['bot-account']['password'],
        host: config.server.ip,
        port: config.server.port,
        version: config.server.version,
        // Proxy : si vous utilisez des proxies, configurez-les ici
        // proxy: 'http://ip:port'
    });

    bot.on('spawn', () => {
        console.log(`[Bot ${username}] Bot joined the server`);

        // Logique supplémentaire après que le bot ait rejoint le serveur
        if (config.position.enabled) {
            const pos = config.position;
            console.log(`[Bot ${username}] Moving to target location (${pos.x}, ${pos.y}, ${pos.z})`);
            bot.pathfinder.setMovements(new Movements(bot, bot.mcData));
            bot.pathfinder.setGoal(new GoalBlock(pos.x, pos.y, pos.z));
        }
        // Autres logiques d'événements à ajouter ici
    });

    bot.on('kicked', (reason) => {
        console.log(`[Bot ${username}] Bot kicked from the server. Reason: ${reason}`);

        // Reconnexion après avoir été expulsé
        setTimeout(() => {
            createBot(botIndex); // Réessayer de se connecter après un délai
        }, reconnectDelay); // Utilisez le reconnectDelay défini
    });

    bot.on('error', (err) => {
        console.error(`[Bot ${username}] Error: ${err.message}`);
    });

    bot.on('end', () => {
        console.log(`[Bot ${username}] Bot disconnected from the server`);
        // Logique facultative après la déconnexion du bot
    });

    bot.on('death', () => {
        console.log(`[Bot ${username}] Bot died and respawned`);
        // Logique facultative après que le bot soit mort et respawné
    });

    // Ajouter d'autres gestionnaires d'événements au besoin

    return bot;
}

// Démarrer le serveur Express
app.get('/', (req, res) => {
    res.send('Hello Express app!');
});

app.listen(3000, () => {
    console.log('Server started');
});

// Créer plusieurs bots
for (let i = 1; i <= botCount; i++) {
    setTimeout(() => { // Ajoutez un délai entre la création de chaque bot
        createBot(i);
    }, i * 5000); // Délai initial de 5 secondes entre chaque création de bot
}
