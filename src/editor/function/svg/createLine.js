export function createLine(lineData) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("id", lineData.id);
    line.setAttribute("x1", lineData.x1);
    line.setAttribute("y1", lineData.y1);
    line.setAttribute("x2", lineData.x2);
    line.setAttribute("y2", lineData.y2);
    line.setAttribute("style", lineData.style);
    return line;
}