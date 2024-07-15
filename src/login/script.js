document.addEventListener('DOMContentLoaded', function () {
    // Gestionnaire d'événement pour le clic sur le bouton de connexion
    document.getElementById('login-btn').addEventListener('click', function () {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Envoyer une requête POST pour obtenir le token JWT
        fetch(`/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            
            // Stocker le token JWT dans un cookie
            document.cookie = `token=${data.token};`;

            // Redirection vers la page d'ajout des personnes
            window.location.href = 'add-person/index.html';
        })
        .catch(error => {
            console.error('Erreur lors de la connexion :', error);
            alert('Erreur lors de la connexion. Veuillez vérifier vos identifiants.');
        });
    });
});
