function generatePDF(svg) {
    const { jsPDF } = window.jspdf;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);

    // Nombre de colonnes et de lignes pour diviser le SVG en 16 parties
    const cols = 4;
    const rows = 4;

    // Dimensions de chaque partie du SVG
    const partWidth = svg.width.baseVal.value / cols;
    const partHeight = svg.height.baseVal.value / rows;

    // Créer un objet jsPDF
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt'
    });

    // Diviser le SVG en 16 parties et les ajouter au PDF
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            // Calculer les coordonnées de la partie actuelle
            const x = j * partWidth;
            const y = i * partHeight;

            // Créer un canvas temporaire pour la partie du SVG
            const canvas = document.createElement('canvas');
            canvas.width = partWidth;
            canvas.height = partHeight;
            const ctx = canvas.getContext('2d');

            // Dessiner la partie du SVG sur le canvas
            const img = new Image();
            img.onload = function() {
                ctx.drawImage(img, -x, -y);
                // Ajouter l'image au PDF
                if (i !== 0 || j !== 0) {
                    pdf.addPage();
                }
                pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0);

                // Ajouter le numéro de page en bas au milieu
                const pageCount = pdf.internal.getNumberOfPages();
                pdf.setPage(pageCount);
                const pageNumberString = `Page ${pageCount}`;
                const pageSize = pdf.internal.pageSize;
                const textWidth = pdf.getStringUnitWidth(pageNumberString) * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
                pdf.text(pageNumberString, (pageSize.width - textWidth) / 2, pageSize.height - 10);

                // Si c'est la dernière partie, télécharger le PDF
                if (i === rows - 1 && j === cols - 1) {
                    pdf.save("divided_svg.pdf");
                }
            };
            img.src = 'data:image/svg+xml;base64,' + btoa(svgString);
        }
    }
}

download.addEventListener("click", () => {
    const svg = document.getElementById("svg");
    generatePDF(svg)
});