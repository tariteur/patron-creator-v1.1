class SVGManipulator {
  constructor(svgSelector, viewportSelector) {
    this.svg = document.querySelector(svgSelector);
    this.viewport = document.querySelector(viewportSelector);
    this.proxy = document.createElement("div");

    this.reachedThreshold = false;
    this.point = this.svg.createSVGPoint();
    this.startClient = this.svg.createSVGPoint();
    this.startGlobal = this.svg.createSVGPoint();

    this.viewBox = this.svg.viewBox.baseVal;
    this.cachedViewBox = {
      x: this.viewBox.x,
      y: this.viewBox.y,
      width: this.viewBox.width,
      height: this.viewBox.height
    };

    this.zoomOutFactor = 15.1;
    this.viewBox.x -= (this.viewBox.width / (this.zoomOutFactor - 1));
    this.viewBox.y -= (this.viewBox.height / (this.zoomOutFactor - 1));
    this.viewBox.width *= this.zoomOutFactor;
    this.viewBox.height *= this.zoomOutFactor;

    this.zoom = {
      animation: gsap.timeline(),
      scaleFactor: 1.4,
      duration: 0.3,
      max: 22.5,
      min: 1,
      ease: "power2.out"
    };

    this.initAnimations();
    this.initDraggables();
    this.addEventListeners();
  }

  initAnimations() {
    this.resetAnimation = gsap.timeline();
  }

  initDraggables() {
    this.pannable = Draggable.create(this.proxy, {
      throwResistance: 3000,
      trigger: this.svg,
      throwProps: true,
      onPress: this.selectDraggable.bind(this),
      onDrag: this.updateViewBox.bind(this),
      onThrowUpdate: this.updateViewBox.bind(this),
    })[0];
  }

  addEventListeners() {
    window.addEventListener("wheel", this.onWheel.bind(this));
    window.addEventListener("contextmenu", this.onContextMenu.bind(this));
    // Ajout des événements tactiles
    this.svg.addEventListener("touchstart", this.onTouchStart.bind(this));
    this.svg.addEventListener("touchmove", this.onTouchMove.bind(this));
    this.svg.addEventListener("touchend", this.onTouchEnd.bind(this));
  }

  onWheel(event) {
    // Check if the mouse wheel event occurred inside the SVG element
    if (!this.isEventInsideSVG(event)) {
      return; // Do not zoom if the event did not occur inside the SVG
    }
  
    event.preventDefault();
  
    let normalized;
    const delta = event.wheelDelta;
    if (delta) {
      normalized = (delta % 120) === 0 ? delta / 120 : delta / 12;
    } else {
      const deltaY = event.deltaY || event.detail || 0;
      normalized = -(deltaY % 3 ? deltaY * 10 : deltaY / 3);
    }
  
    const scaleDelta = normalized > 0 ? 1 / this.zoom.scaleFactor : this.zoom.scaleFactor;
    this.point.x = event.clientX;
    this.point.y = event.clientY;
    const startPoint = this.point.matrixTransform(this.svg.getScreenCTM().inverse());
  
    const newWidth = this.viewBox.width * scaleDelta;
    const newHeight = this.viewBox.height * scaleDelta;
  
    // Check if the new width and height are within the allowed zoom limits
    if (newWidth <= this.zoom.max * this.cachedViewBox.width && newHeight <= this.zoom.max * this.cachedViewBox.height &&
        newWidth >= this.zoom.min * this.cachedViewBox.width && newHeight >= this.zoom.min * this.cachedViewBox.height) {
      const fromVars = {
        ease: this.zoom.ease,
        x: this.viewBox.x,
        y: this.viewBox.y,
        width: this.viewBox.width,
        height: this.viewBox.height,
        duration: this.zoom.duration
      };
  
      this.viewBox.x -= (startPoint.x - this.viewBox.x) * (scaleDelta - 1);
      this.viewBox.y -= (startPoint.y - this.viewBox.y) * (scaleDelta - 1);
      this.viewBox.width = newWidth;
      this.viewBox.height = newHeight;
  
      // Animate the viewBox change
      gsap.fromTo(this.viewBox, fromVars, {
        x: this.viewBox.x,
        y: this.viewBox.y,
        width: this.viewBox.width,
        height: this.viewBox.height,
        duration: this.zoom.duration
      });
    }
  }  
  
  isEventInsideSVG(event) {
    return event.target === this.svg || this.svg.contains(event.target);
  }

  selectDraggable(event) {
    if (this.resetAnimation.isActive()) {
      this.resetAnimation.kill();
    }

    this.startClient.x = this.pannable.pointerX;
    this.startClient.y = this.pannable.pointerY;
    this.startGlobal = this.startClient.matrixTransform(this.svg.getScreenCTM().inverse());

    gsap.set(this.proxy, { x: this.pannable.pointerX, y: this.pannable.pointerY });
    this.pannable.enable().update().startDrag(event);
  }

  updateViewBox() {
    if (this.zoom.animation.isActive()) {
      return;
    }

    this.point.x = this.pannable.x;
    this.point.y = this.pannable.y;
    const moveGlobal = this.point.matrixTransform(this.svg.getScreenCTM().inverse());

    this.viewBox.x -= (moveGlobal.x - this.startGlobal.x);
    this.viewBox.y -= (moveGlobal.y - this.startGlobal.y);
  }

  onContextMenu(event) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }

  onTouchStart(event) {
    if (event.touches.length === 2) {
      this.startTouchDistance = this.calculateTouchDistance(event.touches);
      this.startViewBoxWidth = this.viewBox.width;
      this.startViewBoxHeight = this.viewBox.height;
    }
  }

  onTouchMove(event) {
    if (event.touches.length === 2) {
      const currentTouchDistance = this.calculateTouchDistance(event.touches);
      const scaleDelta = this.startTouchDistance / currentTouchDistance;
  
      const newWidth = this.startViewBoxWidth * scaleDelta;
      const newHeight = this.startViewBoxHeight * scaleDelta;
  
      // Check if the new width and height are within the allowed zoom limits
      if (newWidth <= this.zoom.max * this.cachedViewBox.width && newHeight <= this.zoom.max * this.cachedViewBox.height &&
          newWidth >= this.zoom.min * this.cachedViewBox.width && newHeight >= this.zoom.min * this.cachedViewBox.height) {
        this.viewBox.width = newWidth;
        this.viewBox.height = newHeight;
      }
    }
  }  

  onTouchEnd(event) {
    // Reset touch-related variables
    this.startTouchDistance = null;
    this.startViewBoxWidth = null;
    this.startViewBoxHeight = null;
  }

  calculateTouchDistance(touches) {
    const [touch1, touch2] = touches;
    return Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
  }
}

const manipulator = new SVGManipulator("#svg", "#viewport");