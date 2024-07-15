function getTokenFromCookie() {
  const token = document.cookie.split(';').map(cookie => cookie.trim().split('=')).find(([name]) => name === 'token');
  return token ? token[1] : null;
}

function  getEditorObject() {
  return {
      tourDeTaille: document.getElementById("touredetaille").value,
      longueur7emeCervicaleTailleDos: document.getElementById("longeur7emecervicaletailledos_cm").value,
      hauteurTaillePointsDeSein: document.getElementById("hauteurtaillepointedesein_cm").value,
      carrureDos: document.getElementById("carruredos_cm").value,
      tourDePoitrine: document.getElementById("tourdepoitriene_cm").value,
      tourDEncolure: document.getElementById("tourdeencolure_cm").value,
      longueurDEpaule: document.getElementById("longeurdepaule_cm").value,
      descenteDEpaule: document.getElementById("desantedepaule_cm").value
  };
}


/////////        Deja defini des script.js        /////////
// const urlParams = new URLSearchParams(window.location.search);
/////////        Deja defini des script.js        /////////
const token = getTokenFromCookie();

save.addEventListener("click", () => {
  const editor = getEditorObject(); // Assurez-vous que cette fonction renvoie l'objet editor correctement
  const name = urlParams.get('name');
  const rdv = urlParams.get('rdv');
  
  // Vérifiez que les paramètres nécessaires sont présents
  if (!name || !rdv || !editor) {
      console.error('Données manquantes pour la modification du rendez-vous');
      return;
  }
  
  const clientData = {
      action: 'update-appointment',
      name,
      index: {
          rdv,
          editor
      }
  };

  fetch('/data', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(clientData)
  })
  .then(response => response.ok ? response.text() : Promise.reject(response.statusText))
  .then(data => console.log('Rendez-vous modifié avec succès :', data))
  .catch(error => console.error('Erreur lors de la modification du rendez-vous :', error));
});
