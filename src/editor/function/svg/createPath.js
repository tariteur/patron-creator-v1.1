export function createPath(pathData) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("id", pathData.id);
    path.setAttribute("d", pathData.d);
    path.setAttribute("style", pathData.style);
    return path;
}