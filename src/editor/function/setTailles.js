export function setTailles(
  tourdetaille_cm,
  longeur7emecervicaletailledos_cm,
  hauteurtaillepointedesein_cm,
  carruredos_cm,
  tourdepoitrine_cm,
  tourdeencolure_cm,
  longeurdepaule_cm,
  desantedepaule_cm,
) {
  document.getElementById("touredetaille").value = parseFloat(tourdetaille_cm);
  document.getElementById("longeur7emecervicaletailledos_cm").value = parseFloat(longeur7emecervicaletailledos_cm);
  document.getElementById("hauteurtaillepointedesein_cm").value = parseFloat(hauteurtaillepointedesein_cm);
  document.getElementById("carruredos_cm").value = parseFloat(carruredos_cm);
  document.getElementById("tourdepoitriene_cm").value = parseFloat(tourdepoitrine_cm);
  document.getElementById("tourdeencolure_cm").value = parseFloat(tourdeencolure_cm);
  document.getElementById("longeurdepaule_cm").value = parseFloat(longeurdepaule_cm);
  document.getElementById("desantedepaule_cm").value = parseFloat(desantedepaule_cm);
}