this.canvas = document.getElementById('paintCanvas');
this.tempCanvas = document.getElementById('tempCanvas');
this.colorPicker = document.getElementById('colorPicker');
this.currentColorDisplay = document.getElementById('currentColorDisplay');
this.brushSize = document.getElementById('brushSize');
this.brushSizeValue = document.getElementById('brushSizeValue');
this.clearButton = document.getElementById('clearCanvas');
this.downloadButton = document.getElementById('downloadCanvas');
this.undoButton = document.getElementById('undoButton');
this.redoButton = document.getElementById('redoButton');
this.zoomInButton = document.getElementById('zoomInButton');
this.zoomOutButton = document.getElementById('zoomOutButton');
this.resetZoomButton = document.getElementById('resetZoomButton');
this.brushShapeGroup = document.getElementById('brushShapeGroup');
this.shapeOptionsGroup = document.getElementById('shapeOptionsGroup');
this.textOptionsGroup = document.getElementById('textOptionsGroup');
this.gradientOptionsGroup = document.getElementById('gradientOptionsGroup');
this.gradientDirection = document.getElementById('gradientDirection');
this.gradientColors = document.getElementById('gradientColors');
this.addColorStop = document.getElementById('addColorStop');
this.patternUpload = document.getElementById('patternUpload');
this.textInput = document.getElementById('textInput');
this.fontFamily = document.getElementById('fontFamily');
this.fontSize = document.getElementById('fontSize');
// Verify all required elements exist
if (!this.validateDOMElements()) {
  console.error('Failed to initialize PaintingApp: Required DOM elements not found');
  return;
}
// Get canvas contexts after validation
this.ctx = this.canvas.getContext('2d');
this.tempCtx = this.tempCanvas.getContext('2d');
// Get control elements
this.shapeControls = document.querySelectorAll('input[name="brushShape"]');
this.toolControls = document.querySelectorAll('input[name="drawingTool"]');
this.shapeStyleControls = document.querySelectorAll('input[name="shapeStyle"]');
this.gradientControls = document.querySelectorAll('input[name="gradientType"]');
this.patternControls = document.querySelectorAll('input[name="fillType"]');
// Initialize drawing state
this.isDrawing = false;
this.isPanning = false;
this.lastX = 0;
this.lastY = 0;
this.currentTool = 'brush';
this.currentShape = 'round';
this.currentShapeStyle = 'fill';
this.currentColor = this.colorPicker.value;
this.currentFillType = 'solid'; // 'solid' or 'pattern' or 'gradient'
this.currentGradientType = 'linear'; // 'linear' or 'radial'
this.currentGradientDirection = 'horizontal';
this.gradientColorStops = ['#000000', '#ffffff'];
this.currentPattern = null; // Image object for pattern
this.startX = 0;
this.startY = 0;
// Zoom and pan state
this.zoom = 1;
this.panX = 0;
this.panY = 0;
// Pinch state for touch
this.isPinching = false;
this.prevTouch0X = 0;
this.prevTouch0Y = 0;
this.prevTouch1X = 0;
this.prevTouch1Y = 0;
// Predefined patterns
this.predefinedPatterns = {};
// Undo/Redo system
this.undoStack = [];
this.redoStack = [];
this.maxHistorySize = 50;
// Text tool state
this.textItems = []; // Array of {text, x, y, fontSize, fontFamily, color}
this.draggedTextIndex = -1;
this.isDraggingText = false;
this.init();
validateDOMElements() {
  const requiredElements = [
    { element: this.canvas, name: 'paintCanvas' },
    { element: this.tempCanvas, name: 'tempCanvas' },
    { element: this.colorPicker, name: 'colorPicker' },
    { element: this.currentColorDisplay, name: 'currentColorDisplay' },
    { element: this.brushSize, name: 'brushSize' },
    { element: this.brushSizeValue, name: 'brushSizeValue' },
    { element: this.clearButton, name: 'clearCanvas' },
    { element: this.downloadButton, name: 'downloadCanvas' },
    { element: this.undoButton, name: 'undoButton' },
    { element: this.redoButton, name: 'redoButton' },
    { element: this.zoomInButton, name: 'zoomInButton' },
    { element: this.zoomOutButton, name: 'zoomOutButton' },
    { element: this.resetZoomButton, name: 'resetZoomButton' },
    { element: this.brushShapeGroup, name: 'brushShapeGroup' },
    { element: this.shapeOptionsGroup, name: 'shapeOptionsGroup' },
    { element: this.textOptionsGroup, name: 'textOptionsGroup' },
    { element: this.gradientOptionsGroup, name: 'gradientOptionsGroup' },
    { element: this.gradientDirection, name: 'gradientDirection' },
    { element: this.gradientColors, name: 'gradientColors' },
    { element: this.addColorStop, name: 'addColorStop' },
    { element: this.patternUpload, name: 'patternUpload' },
    { element: this.textInput, name: 'textInput' },
    { element: this.fontFamily, name: 'fontFamily' },
    { element: this.fontSize, name: 'fontSize' }
  ];
  const missingElements = requiredElements.filter(item => !item.element);
  if (missingElements.length > 0) {
    console.error('Missing DOM elements:', missingElements.map(item => item.name));
    // Display user-friendly error message
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #ff4444;
      color: white;
      padding: 20px;
      border-radius: 10px;
      font-family: Arial, sans-serif;
      z-index: 9999;
      text-align: center;
    `;
    errorDiv.innerHTML = `
      &lt;h3&gt;🚨 App Initialization Error&lt;/h3&gt;
      &lt;p&gt;Some required elements are missing from the page.&lt;/p&gt;
      &lt;p&gt;Missing: ${missingElements.map(item => item.name).join(', ')}&lt;/p&gt;
      &lt;p&gt;Please refresh the page.&lt;/p&gt;
    `;
    document.body.appendChild(errorDiv);
    return false;
  }
  return true;
}
init() {
  try {
    // Set up canvas context
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.tempCtx.lineCap = 'round';
    this.tempCtx.lineJoin = 'round';
    // Set initial color styles
    this.updateCurrentColor();
    this.initPatterns();
    this.initGradientControls();
    // Position temporary canvas over main canvas
    this.tempCanvas.style.position = 'absolute';
    this.tempCanvas.style.top = '0';
    this.tempCanvas.style.left = '0';
    this.tempCanvas.style.pointerEvents = 'none';
    // Save initial blank state
    this.saveState();
    // Event listeners
    this.setupEventListeners();
    // Initialize settings
    this.updateBrushSize();
    this.updateBrushShape();
    this.updateTool();
    this.updateShapeStyle();
    this.updateFillType();
    this.updateGradientType();
    this.updateCanvasCursor();
    this.updateUndoRedoButtons();
    console.log('PaintingApp initialized successfully');
  } catch (error) {
    console.error('Error during PaintingApp initialization:', error);
    this.showError('Failed to initialize the painting app. Please refresh the page.');
  }
}
initPatterns() {
  // Create predefined pattern images (small canvases with patterns)
  // Stripes pattern
  const stripesCanvas = document.createElement('canvas');
  stripesCanvas.width = 10;
  stripesCanvas.height = 10;
  const stripesCtx = stripesCanvas.getContext('2d');
  stripesCtx.fillStyle = this.currentColor;
  for (let i = 0; i < 10; i++) {
    stripesCtx.fillRect(i, 0, 1, 10);
  }
  this.predefinedPatterns['stripes'] = stripesCanvas;

  // Dots pattern
  const dotsCanvas = document.createElement('canvas');
  dotsCanvas.width = 8;
  dotsCanvas.height = 8;
  const dotsCtx = dotsCanvas.getContext('2d');
  dotsCtx.fillStyle = this.currentColor;
  dotsCtx.beginPath();
  dotsCtx.arc(4, 4, 3, 0, Math.PI * 2);
  dotsCtx.fill();
  this.predefinedPatterns['dots'] = dotsCanvas;

  // Checker pattern
  const checkerCanvas = document.createElement('canvas');
  checkerCanvas.width = 10;
  checkerCanvas.height = 10;
  const checkerCtx = checkerCanvas.getContext('2d');
  checkerCtx.fillStyle = this.currentColor;
  checkerCtx.fillRect(0, 0, 5, 5);
  checkerCtx.fillRect(5, 5, 5, 5);
  this.predefinedPatterns['checker'] = checkerCanvas;
}
initGradientControls() {
  // Add initial color stops to DOM
  this.updateGradientColorInputs();
  // Add event listener for adding color stops
  this.addColorStop.addEventListener('click', () => {
    this.gradientColorStops.push('#000000');
    this.updateGradientColorInputs();
  });
}
updateGradientColorInputs() {
  this.gradientColors.innerHTML = '';
  this.gradientColorStops.forEach((color, index) => {
    const input = document.createElement('input');
    input.type = 'color';
    input.className = 'gradientColor';
    input.value = color;
    input.addEventListener('input', () => {
      this.gradientColorStops[index] = input.value