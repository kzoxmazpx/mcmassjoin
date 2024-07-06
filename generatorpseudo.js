const fs = require('fs');
const readline = require('readline');

// Fonction pour générer un pseudonyme aléatoire
function generateRandomUsername(length) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789_';
    let username = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        username += chars[randomIndex];
    }

    return username;
}

// Interface de lecture pour demander à l'utilisateur combien de pseudonymes générer
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Combien de pseudonymes voulez-vous générer ? ', (numPseudos) => {
    numPseudos = parseInt(numPseudos);

    if (isNaN(numPseudos) || numPseudos <= 0) {
        console.log('Nombre invalide. Veuillez entrer un nombre positif.');
        rl.close();
        return;
    }

    // Générer les pseudonymes
    const pseudos = [];
    const usernameLength = 8; // Longueur des pseudonymes

    for (let i = 0; i < numPseudos; i++) {
        const randomUsername = generateRandomUsername(usernameLength);
        pseudos.push(randomUsername);
    }

    // Enregistrer les pseudonymes dans un fichier pseudo.txt
    const pseudoFile = './pseudo.txt';

    fs.writeFile(pseudoFile, pseudos.join('\n'), (err) => {
        if (err) {
            console.error('Erreur lors de l\'enregistrement des pseudonymes :', err);
        } else {
            console.log(`Pseudonymes enregistrés dans ${pseudoFile}`);
        }
        rl.close();
    });
});

// Fermer l'interface de lecture lorsque l'utilisateur a répondu
rl.on('close', () => process.exit(0));
