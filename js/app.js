document.addEventListener('DOMContentLoaded', () => {
  const numberOfColors = 38;
  const maxHistory = 10;
  const heightInPixel = 35;
  const widthInPixel = 50;
  const maxPixel = heightInPixel * widthInPixel;
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
      '#FF8C6E',
      '#EA8746',
      '#FF5106',
      '#FF0C00',
      '#DB2500',
      '#EEFF00',
      '#FFEE00',
      '#DDBC9D',
      '#C9AEC7',
      '#7B549A',
      '#4998E9',
      '#7B7AFF',
      '#A035FF',
      '#9550F0',
      '#600080',
      '#7B9A54',
      '#518806',
      '#10702E',
      '#358A72',
      '#35728A',
      '#8C886E',
      '#51FF06',
      '#8CFF6E',
      '#0CFF00',
      '#2EEDEC',
      '#281EFF',
      '#3001E2',
      '#382681',
      '#140079',
      '#0B1675',
      '#631A09',
      '#582627',
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
      div.style.backgroundColor = newColor;
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
  function resetMode() {
    let mode = document.getElementById('paint-mode');
    mode.selectedIndex = 0;
    fillMode = false;
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
  function isWhiteSpace(pixel) {
    let color = pixel.style.backgroundColor;
    return (color === '' || color === '#FFFFFF' || color === '#FFF' || color === 'white' || color === 'rgb(255, 255, 255)');
  }
  function drawSinglePixel(pixel, color) {
    pixel.style.backgroundColor = color;
    if (!isWhiteSpace(pixel)) {
      pixel.style.borderColor = color;
    }
  }
  function getPosition(pixel) {
    let parent = pixel.parentElement;
    if (parent !== undefined) {
      for (let index = 0; index < parent.children.length; index++) {
        if (pixel === parent.children[index]) {
          let posX = index % widthInPixel;
          let posY = Math.floor(index / widthInPixel);
          return {x: posX, y: posY};
        }
      }
    }
    return undefined;
  }
  function getElementIndex(pos) {
    if (pos !== undefined) {
      let index = (pos.y * widthInPixel) + pos.x;
      return index;
    }
    return -1;
  }
  function getAboveElement(pixel) {
    let pos = getPosition(pixel);
    if (pos !== undefined) {
      if (pos.y - 1 >= 0) {
        let index = getElementIndex({
          x: pos.x,
          y: pos.y - 1
        });
        if (index >= 0) {
          let above = pixel.parentElement.children[index];
          if (isWhiteSpace(above)) {
            return above;
          }
        }
      }
    }
    return undefined;
  }
  function getBelowElement(pixel) {
    let pos = getPosition(pixel);
    if (pos !== undefined) {
      if (pos.y + 1 < heightInPixel) {
        let index = getElementIndex({
          x: pos.x,
          y: pos.y + 1
        });
        if (index >= 0) {
          let below = pixel.parentElement.children[index];
          if (isWhiteSpace(below)) {
            return below;
          }
        }
      }
    }
    return undefined;
  }
  function getRightElement(pixel) {
    let pos = getPosition(pixel);
    if (pos !== undefined) {
      if (pos.x + 1 < widthInPixel) {
        let index = getElementIndex({
          x: pos.x + 1,
          y: pos.y
        });
        if (index >= 0) {
          let right = pixel.parentElement.children[index];
          if (isWhiteSpace(right)) {
            return right;
          }
        }
      }
    }
    return undefined;
  }
  function getLeftElement(pixel) {
    let pos = getPosition(pixel);
    if (pos !== undefined) {
      if (pos.x - 1 >= 0) {
        let index = getElementIndex({
          x: pos.x - 1,
          y: pos.y
        });
        if (index >= 0) {
          let left = pixel.parentElement.children[index];
          if (isWhiteSpace(left)) {
            return left;
          }
        }
      }
    }
    return undefined;
  }
  function fillArea(pixel, color) {
    if (pixel !== undefined) {
      let next = getAboveElement(pixel);
      if (next !== undefined) {
        fillArea(next, color);
      }
      next = getLeftElement(pixel);
      if (next !== undefined) {
        fillArea(next, color);
      }
      if (isWhiteSpace(pixel)) {
        drawSinglePixel(pixel, color);
      }
      next = getRightElement(pixel);
      if (next !== undefined) {
        fillArea(next, color);
      }
      next = getBelowElement(pixel);
      if (next !== undefined) {
        fillArea(next, color);
      }
    }
  }
  function draw(pixel, color) {
    if (fillMode) {
      fillArea(pixel, color);
    } else {
      drawSinglePixel(pixel, color);
    }
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
          resetMode();
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
      pixel.style.borderColor = '#C8C8C8';
    }
  }
});
