document.addEventListener('DOMContentLoaded', () => {
  const numberOfColors = 36;
  const maxHistory = 10;
  const maxPixel = 1440;
  const LOCAL_STORAGE = 'pixel_art';
  const colors = createColorPalette();
  let selectedColor;
  let inProgress = false;
  let colorHistory = [];
  let fillMode = false;

  // drawing area and event handlers
  let canvas = document.getElementById('canvas');
  drawPaintArea(canvas);
  canvas.addEventListener('click', handleClick);
  canvas.addEventListener('mousemove', continuousDrawing);
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mouseup', endDrawing);

  // color palette area and event handler
  let palette = document.getElementById('palette');
  drawPaletteArea(palette);
  palette.addEventListener('click', pickColor);

  // color chooser and event handler
  let chooser = document.getElementById('color-chooser');
  chooser.addEventListener('input', selectColor);

  // button panel and event handler
  let buttonPanel = document.getElementById('button-panel');
  buttonPanel.addEventListener('click', handleClick);

  // drawing mode selection and event handler
  let option = document.getElementById('paint-mode');
  option.addEventListener('change', selectMode);

  function drawPaintArea(canvas) {
    for (let j = 0; j < maxPixel; j++) {
      let col = document.createElement('div');
      col.classList.add('pixel');
      canvas.appendChild(col);
    }
  }
  function drawPaletteArea(palette) {
    for (let j = 0; j < numberOfColors; j++) {
      let col = document.createElement('div');
      col.classList.add('color-palette');
      draw(col, colors[j]);
      palette.appendChild(col);
    }
  }
  function createColorPalette() {
    let colors = [
      '#DB2500',
      '#FF5106',
      '#FF8C6E',
      '#FF0C00',
      '#FFEE00',
      '#DDBC9D',
      '#35728A',
      '#582627',
      '#EA8746',
      '#2EEDEC',
      '#7B549A',
      '#7B9A54',
      '#281EFF',
      '#4998E9',
      '#7B7AFF',
      '#C9AEC7',
      '#9550F0',
      '#10702E',
      '#140079',
      '#600080',
      '#3001E2',
      '#A035FF',
      '#0B1675',
      '#382681',
      '#51FF06',
      '#8CFF6E',
      '#0CFF00',
      '#EEFF00',
      '#358A72',
      '#631A09',
      '#000000',
      '#444444',
      '#888888',
      '#BBBBBB',
      '#DDDDDD',
      '#FFFFFF'
    ];
    return colors;
  }
  function addNewColorToHistory(newColor) {
    if (newColor !== undefined && !colorHistory.includes(newColor)) {
      let historyDiv = document.getElementById('history');
      // colorHistory keeps maximum of 10 previously selected colors
      // if colorHistory is full already, remove the oldest color
      if (colorHistory.length >= maxHistory) {
        colorHistory.pop();
        historyDiv.removeChild(historyDiv.lastElementChild);
      }
      colorHistory.unshift(newColor);
      // add the new div in front of the history
      let div = document.createElement('div');
      div.classList.add('color-palette');
      div.style.marginTop = 0;
      draw(div, newColor);
      if (historyDiv.children.length > 0) {
        historyDiv.insertBefore(div, historyDiv.children[0]);
      } else {
        historyDiv.appendChild(div);
      }
    }
  }
  function pickColor(event) {
    if (event.target.classList.contains('color-palette')) {
      selectedColor = event.target.style.backgroundColor;
      addNewColorToHistory(selectedColor);
    }
  }
  function selectColor(event) {
    selectedColor = event.target.value;
    addNewColorToHistory(selectedColor);
  }
  function selectMode(event) {
    if (event.target.id === 'paint-mode') {
      fillMode = (event.target.value === 'fill');
    }
  }
  function handleClick(event) {
    if (event.target.classList.contains('pixel')) {
      if (selectedColor !== undefined) {
        draw(event.target, selectedColor);
      }
    } else if (event.target.tagName.toLowerCase() === 'button') {
      switch (event.target.id) {
        case 'save-button':
          saveDrawing();
          break;
        case 'load-button':
          loadDrawing();
          break;
        case 'clear-button':
          clearDrawing();
          break;
        default:
      }
    }
  }
  function continuousDrawing(event) {
    if (selectedColor !== undefined) {
      if (inProgress) {
        if (event.target.classList.contains('pixel')) {
          draw(event.target, selectedColor);
        }
      }
    }
  }
  function draw(pixel, color) {
    pixel.style.backgroundColor = color;
  }
  function startDrawing(event) {
    if (event.target.classList.contains('pixel')) {
      inProgress = true;
    }
  }
  function endDrawing(event) {
    if (event.target.classList.contains('pixel')) {
      inProgress = false;
    }
  }
  function loadDrawing() {
    // Check browser support
    if ((typeof Storage) !== 'undefined') {
      let storage = localStorage.getItem(LOCAL_STORAGE);
      if (storage !== undefined) {
        let colors = JSON.parse(storage);
        if (Array.isArray(colors)) {
          clearDrawing();
          let canvas = document.getElementById('canvas');
          if (colors.length === canvas.children.length) {
            for (let i = 0; i < canvas.children.length; i++) {
              let pixel = canvas.children[i];
              draw(pixel, colors[i]);
            }
          }
        }
      }
    }
  }
  function saveDrawing() {
    // Check browser support
    if ((typeof Storage) !== 'undefined') {
      let canvas = document.getElementById('canvas');
      let colors = [];
      for (let i = 0; i < canvas.children.length; i++) {
        let pixel = canvas.children[i];
        colors.push(pixel.style.backgroundColor);
      }
      localStorage.setItem(LOCAL_STORAGE, JSON.stringify(colors));
    }
  }
  function clearDrawing() {
    let canvas = document.getElementById('canvas');
    for (let i = 0; i < canvas.children.length; i++) {
      let pixel = canvas.children[i];
      draw(pixel, '#FFF');
    }
  }
});
