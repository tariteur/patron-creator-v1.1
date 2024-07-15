class ClientManager {
    constructor() {
        this.token = this.getTokenFromCookie();
        this.data = [];
        document.addEventListener('DOMContentLoaded', () => this.init());
    }

    init() {
        document.getElementById('add-person-btn').addEventListener('click', () => this.addPerson());
        document.getElementById('search-input').addEventListener('input', (event) => this.searchClients(event));
        document.getElementById('add-tab').addEventListener('click', () => this.showTab('add-person-tab'));
        document.getElementById('list-tab').addEventListener('click', () => this.showTab('list-clients-tab', true));
        this.showTab('list-clients-tab', true);
    }

    getTokenFromCookie() {
        const token = document.cookie.split(';').map(cookie => cookie.trim().split('=')).find(([name]) => name === 'token');
        return token ? token[1] : null;
    }

    addPerson() {
        const name = document.getElementById('name').value;
        const numero = document.getElementById('numero').value;        
        const email = document.getElementById('email').value;
        
        this.add_people(name, numero, email)
    }

    searchClients(event) {
        const searchInput = event.target.value.toLowerCase();
        const filteredClients = this.data.filter(client => client.name.toLowerCase().includes(searchInput));
        this.updateClientList(filteredClients);
    }

    loadClientList() {
        fetch(`/data`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${this.token}` }
        })
        .then(response => response.ok ? response.json() : Promise.reject('Erreur lors de la récupération de la liste des clients.'))
        .then(data => {
            this.data = data;
            this.updateClientList(data);
        })
        .catch(error => {
            console.error(error);
            alert(error);
        });
    }

    updateClientList(clients) {
        const clientListDiv = document.getElementById('list-client');
        clientListDiv.innerHTML = '';
        clients.forEach(client => clientListDiv.appendChild(this.createClientCard(client)));
    }

    showTab(tabId, loadList = false) {
        ['add-person-tab', 'list-clients-tab'].forEach(id => this.hideElement(id));
        document.getElementById(tabId).classList.remove('d-none');
        if (tabId === 'list-clients-tab') this.showElement('search-input');
        else this.hideElement('search-input');
        if (loadList) this.loadClientList();
    }

    hideElement(id) {
        document.getElementById(id).classList.add('d-none');
    }

    showElement(id) {
        document.getElementById(id).classList.remove('d-none');
    }

    add_people(name, numero, email) {
        const clientData = {
            action: 'add-people',
            name,
            numero,
            email
        };

        fetch('/data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify(clientData)
        })
        .then(response => response.ok ? response.text() : Promise.reject(response.statusText))
        .then(data => console.log('Client ajouté avec succès :', data))
        .catch(error => console.error('Erreur lors de l\'ajout du client :', error));
    }

    remove_people(name) {
        const clientData = {
            action: 'remove-people',
            name
        };
    
        fetch('/data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify(clientData)
        })
        .then(response => response.ok ? response.text() : Promise.reject(response.statusText))
        .then(data => console.log('Client supprimé avec succès :', data))
        .catch(error => console.error('Erreur lors de la suppression du client :', error));
    }

    update_people(name, numero, email) {
        const clientData = {
            action: 'update-people',
            name,
            numero,
            email
        };
    
        fetch('/data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify(clientData)
        })
        .then(response => response.ok ? response.text() : Promise.reject(response.statusText))
        .then(data => console.log('Client ajouté avec succès :', data))
        .catch(error => console.error('Erreur lors de l\'ajout du client :', error));
    }

    add_appointment(name, date) {
        const clientData = {
            action: 'add-appointment',
            name,
            index: {
                date
            }
        };

        fetch('/data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify(clientData)
        })
        .then(response => response.ok ? response.text() : Promise.reject(response.statusText))
        .then(data => console.log('Render-vous ajouté avec succès :', data))
        .catch(error => console.error('Erreur lors de l\'ajout du render-vous :', error));
    };

    remove_appointment(name, rdv) {
        const clientData = {
            action: 'remove-appointment',
            name,
            index: {
                rdv,
            }
        };
    
        fetch('/data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify(clientData)
        })
        .then(response => response.ok ? response.text() : Promise.reject(response.statusText))
        .then(data => console.log('Rendez-vous supprimé avec succès :', data))
        .catch(error => console.error('Erreur lors de la suppression du rendez-vous pour le client :', error));
    }

    update_appointment(name, rdv, date) {
        const clientData = {
            action: 'update-appointment',
            name,
            index: {
                rdv,
                date
            }
        };
    
        fetch('/data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify(clientData)
        })
        .then(response => response.ok ? response.text() : Promise.reject(response.statusText))
        .then(data => console.log('Rendez-vous changer avec succès :', data))
        .catch(error => console.error('Erreur lors du changement du rendez-vous pour le client :', error));
    }

    createClientCard(client) {
        const clientCard = document.createElement('div');
        clientCard.classList.add('card', 'mb-3');
    
        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');
    
        const cardTitle = document.createElement('h5');
        cardTitle.classList.add('card-title');
        cardTitle.textContent = `${client.name}`;

        // Ajout du bouton d'édition
        const addAppointmentButton = document.createElement('button');
        addAppointmentButton.classList.add('btn', 'btn-transparent');
        addAppointmentButton.innerHTML = '➕';
        addAppointmentButton.style.display = 'none'; // Initialement caché
        cardTitle.appendChild(addAppointmentButton);
        
        addAppointmentButton.addEventListener('click', () => {
            // Créer l'overlay
            const overlay = document.createElement('div');
            overlay.classList.add('overlay');
            document.body.appendChild(overlay); // Ajouter l'overlay à la page
    
            // Créer la pop-up
            const popup = document.createElement('div');
            popup.classList.add('popup', 'modal-dialog', 'modal-dialog-centered');
            popup.setAttribute('role', 'document');

            // Créer le contenu de la pop-up
            const popupContent = document.createElement('div');
            popupContent.classList.add('modal-content');
    

            // Créer le header de la pop-up
            const popupHeader = document.createElement('div');
            popupHeader.classList.add('modal-header');

            const clientNameElement = document.createElement('h4');
            clientNameElement.classList.add('client-name');
            clientNameElement.textContent = client.name;
            popupHeader.appendChild(clientNameElement);

            const closeButton = document.createElement('button');
            closeButton.classList.add('btn', 'btn-danger', 'close');
            closeButton.setAttribute('type', 'button');
            closeButton.setAttribute('data-dismiss', 'modal');
            closeButton.innerHTML = '&times;';
            closeButton.addEventListener('click', () => {
                popup.remove();
                overlay.remove();
            });

            popupHeader.appendChild(closeButton);
            popupContent.appendChild(popupHeader);

            const popupHeaderdown = document.createElement('div');
            popupHeaderdown.classList.add('modal-header');
            // Créer l'élément pour le sous-titre
            const subtitleElement = document.createElement('h5');
            subtitleElement.classList.add('subtitle');
            subtitleElement.textContent = 'Ajouter un rendez-vous:';
            
            popupHeaderdown.appendChild(subtitleElement);
            popupContent.appendChild(popupHeaderdown);
            
            // Créer le corps de la pop-up
            const popupBody = document.createElement('div');
            popupBody.classList.add('modal-body');

            const dateLabel = document.createElement('label');
            dateLabel.textContent = 'Date:';
            dateLabel.setAttribute('for', 'appointmentDateInput');
            popupBody.appendChild(dateLabel);
            
            const appointmentDateInput = document.createElement('input');
            appointmentDateInput.classList.add('form-control');
            appointmentDateInput.setAttribute('type', 'date');
            popupBody.appendChild(appointmentDateInput);

            popupContent.appendChild(popupBody);

            // Créer le footer de la pop-up
            const popupFooter = document.createElement('div');
            popupFooter.classList.add('modal-footer');

            const createButton = document.createElement('button');
            createButton.classList.add('btn', 'btn-primary');
            createButton.setAttribute('type', 'button');
            createButton.innerHTML = 'Ajouter';
            createButton.addEventListener('click', () => {
                const name = client.name;
                const date = appointmentDateInput.value;
                
                this.add_appointment(name, date);
                setTimeout(()=>{this.loadClientList()},250);
                
                popup.remove();
                overlay.remove();
            });

            popupFooter.appendChild(createButton);
            popupContent.appendChild(popupFooter);
    
            popup.appendChild(popupContent);
    
            document.body.appendChild(popup);
        });

        // Ajout du bouton d'édition
        const editButton = document.createElement('button');
        editButton.classList.add('btn', 'btn-transparent');
        editButton.innerHTML = '✎';
        editButton.style.display = 'none'; // Initialement caché
        cardTitle.appendChild(editButton);
    
        editButton.addEventListener('click', () => {
            // Créer l'overlay
            const overlay = document.createElement('div');
            overlay.classList.add('overlay');
            document.body.appendChild(overlay); // Ajouter l'overlay à la page
    
            // Créer la pop-up
            const popup = document.createElement('div');
            popup.classList.add('popup', 'modal-dialog', 'modal-dialog-centered');
            popup.setAttribute('role', 'document');
    
            // Créer le contenu de la pop-up
            const popupContent = document.createElement('div');
            popupContent.classList.add('modal-content');
    
            // Créer le header de la pop-up
            const popupHeader = document.createElement('div');
            popupHeader.classList.add('d-flex', 'justify-content-between', 'align-items-center');

            const deleteButton = document.createElement('button');
            deleteButton.classList.add('btn', 'btn-danger');
            deleteButton.textContent = '🗑️';
            deleteButton.addEventListener('click', () => {
                this.remove_people(client.name);
                setTimeout(()=>{this.loadClientList()},250);

                popup.remove();
                overlay.remove();
            });
            popupHeader.appendChild(deleteButton);
            
            const clientNameElement = document.createElement('h4');
            clientNameElement.classList.add('client-name');
            clientNameElement.textContent = client.name;
            popupHeader.appendChild(clientNameElement);

            const closeButton = document.createElement('button');
            closeButton.classList.add('btn', 'btn-danger', 'close');
            closeButton.setAttribute('type', 'button');
            closeButton.setAttribute('data-dismiss', 'modal');
            closeButton.innerHTML = '&times;';
            closeButton.addEventListener('click', () => {
                popup.remove();
                overlay.remove();
            });
            popupHeader.appendChild(closeButton);
            popupContent.appendChild(popupHeader);
    
            const popupHeaderdown = document.createElement('div');
            popupHeaderdown.classList.add('modal-header');
            // Créer l'élément pour le sous-titre
            const subtitleElement = document.createElement('h5');
            subtitleElement.classList.add('subtitle');
            subtitleElement.textContent = 'Modifier un client:';
            
            popupHeaderdown.appendChild(subtitleElement);
            popupContent.appendChild(popupHeaderdown);

            // Créer le corps de la pop-up
            const popupBody = document.createElement('div');
            popupBody.classList.add('modal-body');
            
            const nameLabel = document.createElement('label');
            nameLabel.textContent = 'Nom:';
            nameLabel.setAttribute('for', 'clientNameInput');
            popupBody.appendChild(nameLabel);
            
            const clientNameInput = document.createElement('input');
            clientNameInput.classList.add('form-control');
            clientNameInput.setAttribute('type', 'text');
            clientNameInput.setAttribute('placeholder', 'Nom du client');
            popupBody.appendChild(clientNameInput);
            clientNameInput.value = client.name;
            
            const numeroLabel = document.createElement('label');
            numeroLabel.textContent = 'Numero:';
            numeroLabel.setAttribute('for', 'clientNumeroInput');
            popupBody.appendChild(numeroLabel);
                
            const clientNumeroInput = document.createElement('input');
            clientNumeroInput.classList.add('form-control');
            clientNumeroInput.setAttribute('type', 'text');
            clientNumeroInput.setAttribute('placeholder', 'Numéro du client');
            popupBody.appendChild(clientNumeroInput);
            clientNumeroInput.value = client.numero;
    
            const emailLabel = document.createElement('label');
            emailLabel.textContent = 'Email:';
            emailLabel.setAttribute('for', 'clientEmailInput');
            popupBody.appendChild(emailLabel);
            
            const clientEmailInput = document.createElement('input');
            clientEmailInput.classList.add('form-control');
            clientEmailInput.setAttribute('type', 'text');
            clientEmailInput.setAttribute('placeholder', 'Email du client');
            popupBody.appendChild(clientEmailInput);
            clientEmailInput.value = client.email;
    
            popupContent.appendChild(popupBody);
    
            // Créer le footer de la pop-up
            const popupFooter = document.createElement('div');
            popupFooter.classList.add('modal-footer');
    
            const saveButton = document.createElement('button');
            saveButton.classList.add('btn', 'btn-primary');
            saveButton.setAttribute('type', 'button');
            saveButton.innerHTML = 'Enregistrer';
            saveButton.addEventListener('click', () => {
                // Récupérer la valeur entrée dans le champ
                const name = clientNameInput.value;
                const numero = clientNumeroInput.value;
                const email = clientEmailInput.value;
                
                const newName = `${client.name}=${clientNameInput.value}`;

                this.update_people(newName, numero, email)
                setTimeout(()=>{this.loadClientList()},250);

                popup.remove();
                overlay.remove();
            });

            popupFooter.appendChild(saveButton);
            popupContent.appendChild(popupFooter);
    
            popup.appendChild(popupContent);
    
            document.body.appendChild(popup);
        });
        // Gestion du survol pour afficher le bouton
        cardTitle.addEventListener('mouseover', () => {
            addAppointmentButton.style.display = 'inline-block';
            editButton.style.display = 'inline-block';
        });
    
        cardTitle.addEventListener('mouseout', () => {
            addAppointmentButton.style.display = 'none';
            editButton.style.display = 'none';
        });
    
        const clientDetails = document.createElement('ul');
        clientDetails.classList.add('list-group', 'list-group-flush');
        clientDetails.style.display = 'none'; // Initialement caché
    
        Object.values(client.index).forEach(index => {
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item');
    
            // Création d'un conteneur pour la date et le bouton
            const itemContent = document.createElement('div');
            itemContent.classList.add('d-flex', 'justify-content-between');
    
            const date = new Date(index.date);
            const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear().toString().padStart(4, '0')}`;
            const dateElement = document.createElement('span');
            dateElement.textContent = `Date: ${formattedDate}`;
    
            const editorLink = document.createElement('a');
            editorLink.classList.add('btn', 'btn-primary', 'mr-2');
            editorLink.textContent = 'Éditer de patron';
            const editorString = JSON.stringify(index.editor);
            editorLink.href = `/editor?name=${client.name}&rdv=${index.rdv}&editor=${encodeURIComponent(editorString)}`;
            editorLink.setAttribute('role', 'button');
    
            // Ajout du bouton d'édition
            const editButton = document.createElement('button');
            editButton.classList.add('btn', 'btn-transparent');
            editButton.innerHTML = '✎';
            cardTitle.appendChild(editButton);

            editButton.addEventListener('click', () => {
                // Créer l'overlay
                const overlay = document.createElement('div');
                overlay.classList.add('overlay');
                document.body.appendChild(overlay); // Ajouter l'overlay à la page
        
                // Créer la pop-up
                const popup = document.createElement('div');
                popup.classList.add('popup', 'modal-dialog', 'modal-dialog-centered');
                popup.setAttribute('role', 'document');
        
                // Créer le contenu de la pop-up
                const popupContent = document.createElement('div');
                popupContent.classList.add('modal-content');
        
                // Créer le header de la pop-up
                const popupHeader = document.createElement('div');
                popupHeader.classList.add('d-flex', 'justify-content-between', 'align-items-center');

                const deleteButton = document.createElement('button');
                deleteButton.classList.add('btn', 'btn-danger');
                deleteButton.textContent = '🗑️';
                deleteButton.addEventListener('click', () => {
                    this.remove_appointment(client.name, index.rdv);
                    setTimeout(()=>{this.loadClientList()},250);
    
                    popup.remove();
                    overlay.remove();
                });
                popupHeader.appendChild(deleteButton);
                
                const clientNameElement = document.createElement('h4');
                clientNameElement.classList.add('client-name');
                clientNameElement.textContent = client.name;
                popupHeader.appendChild(clientNameElement);

                const closeButton = document.createElement('button');
                closeButton.classList.add('btn', 'btn-danger', 'close');
                closeButton.setAttribute('type', 'button');
                closeButton.setAttribute('data-dismiss', 'modal');
                closeButton.innerHTML = '&times;';
                closeButton.addEventListener('click', () => {
                    popup.remove();
                    overlay.remove();
                });
                popupHeader.appendChild(closeButton);
                popupContent.appendChild(popupHeader);
        
                const popupHeaderdown = document.createElement('div');
                popupHeaderdown.classList.add('modal-header');
                // Créer l'élément pour le sous-titre
                const subtitleElement = document.createElement('h5');
                subtitleElement.classList.add('subtitle');
                subtitleElement.textContent = 'Modifier un rendez-vous:';
                
                popupHeaderdown.appendChild(subtitleElement);
                popupContent.appendChild(popupHeaderdown);

                // Créer le corps de la pop-up
                const popupBody = document.createElement('div');
                popupBody.classList.add('modal-body');
                
                const dateLabel = document.createElement('label');
                dateLabel.textContent = 'Nom:';
                dateLabel.setAttribute('for', 'appointmentDateInput');
                popupBody.appendChild(dateLabel);
                
                const appointmentDateInput = document.createElement('input');
                appointmentDateInput.classList.add('form-control');
                appointmentDateInput.setAttribute('type', 'date');
                appointmentDateInput.setAttribute('placeholder', 'Nom du client');
                popupBody.appendChild(appointmentDateInput);
                appointmentDateInput.value = client.date;

                popupContent.appendChild(popupBody);

                // Créer le footer de la pop-up
                const popupFooter = document.createElement('div');
                popupFooter.classList.add('modal-footer');

                const saveButton = document.createElement('button');
                saveButton.classList.add('btn', 'btn-primary');
                saveButton.setAttribute('type', 'button');
                saveButton.innerHTML = 'Enregistrer';
                saveButton.addEventListener('click', () => {
                    // Récupérer la valeur entrée dans le champ
                    const name = client.name;
                    const rdv = index.rdv;
                    const date = appointmentDateInput.value;

                    this.update_appointment(name, rdv, date)
                    setTimeout(()=>{this.loadClientList()},250);

                    popup.remove();
                    overlay.remove();
                });
                
                popupFooter.appendChild(saveButton);
                popupContent.appendChild(popupFooter);
        
                popup.appendChild(popupContent);
        
                document.body.appendChild(popup);
            });
    
            itemContent.appendChild(dateElement);
            itemContent.appendChild(editorLink);
            itemContent.appendChild(editButton);
    
            listItem.appendChild(itemContent);
    
            clientDetails.appendChild(listItem);
        });
    
        cardBody.addEventListener('mouseover', () => {
            clientDetails.style.display = 'block';
        });
    
        cardBody.addEventListener('mouseout', () => {
            clientDetails.style.display = 'none';
        });
    
        cardBody.appendChild(cardTitle);
        cardBody.appendChild(clientDetails);
        clientCard.appendChild(cardBody);
    
        return clientCard;
    }
}

new ClientManager();
