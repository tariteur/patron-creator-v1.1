export function getEditorObject() {
  return {
    tourDetaille: parseFloat(document.getElementById("touredetaille").value) || 0,
    longueurCervicale: parseFloat(document.getElementById("longeur7emecervicaletailledos_cm").value) || 0,
    hauteurPointsDeSein: parseFloat(document.getElementById("hauteurtaillepointedesein_cm").value) || 0,
    carrureDos: parseFloat(document.getElementById("carruredos_cm").value) || 0,
    tourDePoitrine: parseFloat(document.getElementById("tourdepoitriene_cm").value) || 0,
    tourDEncolure: parseFloat(document.getElementById("tourdeencolure_cm").value) || 0,
    longueurEpaule: parseFloat(document.getElementById("longeurdepaule_cm").value) || 0,
    descenteEpaule: parseFloat(document.getElementById("desantedepaule_cm").value) || 0,
  };
}