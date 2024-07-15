import { createLine } from './function/svg/createLine.js';
import { createPath } from './function/svg/createPath.js';
import { getEditorObject } from './function/getEditorObject.js';

class SVGEditor {
    constructor(svgSelector ,part) {
        this.svg = document.querySelector(svgSelector);
        this.elements = svg.querySelector("#elements");
        this.part = part;
        this.init();
    }

    async fetchData() {
        try {
            const response = await fetch(`./patron-logic/${this.part}/elements.json`);
            return await response.json();
        } catch (error) {
            console.error('Error loading JSON:', error);
            throw error;
        }
    }

    initializeSVG(data) {
        if (data.lines) {
            data.lines.forEach(lineData => {
              this.elements.appendChild(createLine(lineData));
            });
        }

        if (data.paths) {
            data.paths.forEach(pathData => {
              this.elements.appendChild(createPath(pathData));
            });
        }

        document.body.appendChild(this.svg);
    }

    applySizesFromEditorString(editorString) {
        let editorObject = {};
        if (editorString) {
            try {
                editorObject = JSON.parse(editorString);
            } catch (error) {
                console.error('Invalid editor string:', error);
            }
        }
        this.appliquerTailles(...Object.values(editorObject));
    }

    setupSliderEventListeners() {
        const patronSliders = document.querySelectorAll(".patronSlider");

        patronSliders.forEach(patronSlider => {
            patronSlider.addEventListener("input", () => {
                const editor = getEditorObject();
                this.appliquerTailles(...Object.values(editor));
            });
        });
    }

    async init() {
        try {
            const module = await import(`./patron-logic/${this.part}/${this.part}.js`);
            this.appliquerTailles = module.appliquerTailles;

            const data = await this.fetchData();
            this.initializeSVG(data);

            const urlParams = new URLSearchParams(window.location.search);
            const editorString = urlParams.get("editor");
            this.applySizesFromEditorString(editorString);
            
            this.setupSliderEventListeners();
        } catch (error) {
            console.error('Initialization failed:', error);
        }
    }
}

new SVGEditor("#svg","test");
