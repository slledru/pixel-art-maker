document.addEventListener('DOMContentLoaded', () => {
  let canvas = document.getElementById('canvas');
  for (let j = 0; j < 1440; j++) {
    let col = document.createElement('div');
    col.classList.add('pixel');
    canvas.appendChild(col);
  }
});
