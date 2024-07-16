import { getEditorObject } from './getEditorObject.js';

function downloadViewportAsImage(svg) {
    const serializer = new XMLSerializer();
    const viewport = svg.querySelector("#elements");
    const viewportString = serializer.serializeToString(viewport);

    const bbox = viewport.getBBox();
    const newSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${bbox.width}" height="${bbox.height}" viewBox="${viewport.getAttribute('viewBox')}">${viewportString}</svg>`;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = bbox.width;
    canvas.height = bbox.height;

    const img = new Image();
    img.onload = function() {
        ctx.drawImage(img, 0, 0);
        createPDF(canvas, ctx, 4, 4); // Pass the context here
    };

    img.src = 'data:image/svg+xml;charset=utf-8;base64,' + btoa(newSvg);
}

function createPDF(canvas, ctx, rows, cols) {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt'
    });

    const partWidth = canvas.width / cols;
    const partHeight = canvas.height / rows;

    let pageCount = 0; // Compteur de pages ajoutées

    for (let page = 0; page < rows * cols; page++) {
        const row = Math.floor(page / cols);
        const col = page % cols;

        const x = col * partWidth;
        const y = row * partHeight;

        const imageData = ctx.getImageData(x, y, partWidth, partHeight);

        pageCount++;

        // Vérifier si l'image n'est pas vide
        if (isImageDataNotEmpty(imageData)) {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = partWidth;
            tempCanvas.height = partHeight;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.putImageData(imageData, 0, 0);

            const imgData = tempCanvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 0, 0, pdf.internal.pageSize.width, pdf.internal.pageSize.height);

            // Ajouter la numérotation des pages
            pdf.setFontSize(12);
            pdf.text(`Page ${pageCount}`, pdf.internal.pageSize.getWidth() / 2, pdf.internal.pageSize.getHeight() - 30, { align: 'center' });

            // Ajouter une nouvelle page si ce n'est pas la dernière page à traiter
            if (page < rows * cols - 1) {
                pdf.addPage();
            }
        }
    }

    // Ajouter la page avec les caractéristiques
    addCharacteristicsPage(pdf);

    // Sauvegarder le PDF seulement s'il y a des pages ajoutées
    if (pageCount > 0) {
        pdf.save("viewport_image.pdf");
    } else {
        console.log("Aucune image valide à enregistrer.");
    }
}

// Fonction pour vérifier si imageData n'est pas vide
function isImageDataNotEmpty(imageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] !== 0) { // Vérifier s'il y a des pixels non transparents
            return true;
        }
    }
    return false;
}

// Fonction pour ajouter la page des caractéristiques
function addCharacteristicsPage(pdf) {
    const editor = getEditorObject();
    const keys = Object.keys(editor);
    const values = Object.values(editor);

    const nameValue = document.getElementById("name").innerHTML;
    keys.unshift("Nom Prénom:");
    values.unshift(nameValue);

    pdf.addPage();
    pdf.setFontSize(16);
    pdf.text("Caractéristiques", pdf.internal.pageSize.getWidth() / 2, 40, { align: 'center' });

    pdf.setFontSize(12);
    let y = 60;

    // Dessiner le tableau
    pdf.setLineWidth(0.5);
    pdf.line(40, y, pdf.internal.pageSize.getWidth() - 40, y); // Ligne du haut

    y += 20;
    keys.forEach((key, index) => {
        pdf.text(key, 60, y);
        pdf.text(values[index].toString(), pdf.internal.pageSize.getWidth() - 60, y, { align: 'right' });

        y += 20;

        // Ajouter une ligne après chaque entrée
        pdf.line(40, y, pdf.internal.pageSize.getWidth() - 40, y);
        y += 20;
    });
}

document.getElementById("download").addEventListener("click", () => {
    const svg = document.getElementById("svg");
    const editor = getEditorObject();
    console.log(editor)
    downloadViewportAsImage(svg);
});
