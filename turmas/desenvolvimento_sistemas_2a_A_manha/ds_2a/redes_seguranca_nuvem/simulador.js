document.addEventListener('DOMContentLoaded', function () {

  const rede = document.getElementById('rede');
  const svg = document.getElementById('cabos');
  const consoleBox = document.getElementById('console');

  let devices = [];
  let links = [];
  let mode = 'move';
  let origem = null;

  let count = {
    internet: 0,
    firewall: 0,
    switch: 0,
    pc: 0,
    server: 0
  };

  function log(text) {
    consoleBox.textContent += '\n' + text;
    consoleBox.scrollTop = consoleBox.scrollHeight;
  }

  function center(el) {
    return {
      x: el.offsetLeft + el.offsetWidth / 2,
      y: el.offsetTop + el.offsetHeight / 2
    };
  }

  document.querySelectorAll('[data-add]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      addDev(btn.dataset.add);
    });
  });

  document.querySelectorAll('[data-mode]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      mode = btn.dataset.mode;
      origem = null;
      clearSelection();
      log('> modo: ' + mode);
    });
  });

  document.getElementById('reset').addEventListener('click', resetAll);

  function addDev(type) {
    count[type]++;
    const d = document.createElement('div');
    d.className = 'dispositivo ' + type;
    d.textContent = type.toUpperCase() + count[type];
    d.style.left = (50 + Math.random() * 1200) + 'px';
    d.style.top = (50 + Math.random() * 450) + 'px';

    d.addEventListener('click', function () {
      clickDev(d);
    });

    enableDrag(d);
    rede.appendChild(d);
    devices.push(d);
    log('> ' + d.textContent + ' adicionado');
  }

  function clickDev(d) {
    if (mode === 'delete') {
      removeDev(d);
      return;
    }

    if (mode === 'link') {
      if (!origem) {
        origem = d;
        d.classList.add('selected');
      } else if (origem !== d) {
        createLink(origem, d);
        origem.classList.remove('selected');
        origem = null;
      }
    }
  }

  function createLink(a, b) {
    const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    updateLink(l, a, b);
    l.setAttribute('stroke', '#000');
    l.setAttribute('stroke-width', '2');

    l.addEventListener('click', function (e) {
      e.stopPropagation();
      if (mode === 'delete') {
        removeLink(l);
      }
    });

    svg.appendChild(l);
    links.push({ a: a, b: b, l: l });
    log('> ligação ' + a.textContent + ' <-> ' + b.textContent);
  }

  function updateLink(l, a, b) {
    const p1 = center(a);
    const p2 = center(b);
    l.setAttribute('x1', p1.x);
    l.setAttribute('y1', p1.y);
    l.setAttribute('x2', p2.x);
    l.setAttribute('y2', p2.y);
  }

  function enableDrag(d) {
    let ox, oy;

    d.addEventListener('mousedown', function (e) {
      if (mode !== 'move') return;

      ox = e.offsetX;
      oy = e.offsetY;

      document.onmousemove = function (m) {
        d.style.left = (m.pageX - rede.offsetLeft - ox) + 'px';
        d.style.top = (m.pageY - rede.offsetTop - oy) + 'px';
        links.forEach(function (x) {
          updateLink(x.l, x.a, x.b);
        });
      };

      document.onmouseup = function () {
        document.onmousemove = null;
      };
    });
  }

  function removeDev(d) {
    links = links.filter(function (x) {
      if (x.a === d || x.b === d) {
        x.l.remove();
        return false;
      }
      return true;
    });

    devices = devices.filter(function (x) {
      return x !== d;
    });

    d.remove();
    log('> ' + d.textContent + ' removido');
  }

  function removeLink(l) {
    links = links.filter(function (x) {
      if (x.l === l) {
        l.remove();
        return false;
      }
      return true;
    });
    log('> ligação removida');
  }

  function clearSelection() {
    devices.forEach(function (d) {
      d.classList.remove('selected');
    });
  }

  function resetAll() {
    svg.innerHTML = '';
    devices.forEach(function (d) {
      d.remove();
    });
    devices = [];
    links = [];
    origem = null;
    consoleBox.textContent = '> console iniciado...';
  }

});
