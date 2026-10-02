/**
 * loreOS arcade — tiny canvas games launched from the terminal
 * (`snake`, `pong`, `breakout`). Each game runs in a modal loreOS window
 * on a fixed 320×240 logical canvas scaled up with pixelated rendering.
 *
 * Controls: arrows / WASD, or drag / swipe on touch. Space starts and
 * pauses, R restarts, Esc quits. Best scores live in localStorage when
 * it's available; everything still works without it.
 */
window.LoreGames = (function () {
  var W = 320;
  var H = 240;
  var C = {
    bg: '#0b0e17',
    grid: '#121829',
    fg: '#c9d4e6',
    dim: '#3d4869',
    cyan: '#7fe0ff',
    pink: '#ff8bd0',
    green: '#7ee787',
    yellow: '#e3b341',
    lilac: '#d2a8ff',
    purple: '#6d5ae6'
  };
  var current = null;
  var cheat = false;

  /* ------------------------------------------------------------ storage */

  function bestKey(name) { return 'loreos:best:' + name; }

  function getBest(name) {
    try {
      var v = parseInt(window.localStorage.getItem(bestKey(name)), 10);
      return isFinite(v) ? v : 0;
    } catch (e) {
      return 0;
    }
  }

  function setBest(name, score) {
    try { window.localStorage.setItem(bestKey(name), String(score)); } catch (e) { /* ignore */ }
  }

  /* ------------------------------------------------------------ helpers */

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  function text(ctx, str, x, y, size, color, align) {
    ctx.font = (size || 16) + 'px VT323, "IBM Plex Mono", monospace';
    ctx.fillStyle = color || C.fg;
    ctx.textAlign = align || 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(str, x, y);
  }

  function clear(ctx) {
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);
  }

  // Map a key event to a direction / action name.
  function keyAction(e) {
    switch (e.key) {
      case 'ArrowUp': case 'w': case 'W': return 'up';
      case 'ArrowDown': case 's': case 'S': return 'down';
      case 'ArrowLeft': case 'a': case 'A': return 'left';
      case 'ArrowRight': case 'd': case 'D': return 'right';
      case ' ': case 'Enter': return 'action';
      case 'p': case 'P': return 'pause';
      case 'r': case 'R': return 'restart';
      case 'Escape': case 'q': case 'Q': return 'quit';
    }
    return null;
  }

  /* ------------------------------------------------------------ games */

  var GAMES = {
    snake: {
      title: 'snake.exe',
      desc: 'eat dots, don\'t eat yourself',
      create: function (api) {
        var CELL = 16;
        var COLS = W / CELL;
        var ROWS = H / CELL;
        var snake, dir, queue, food, acc, step, score;

        function placeFood() {
          var free = [];
          for (var x = 0; x < COLS; x++) {
            for (var y = 0; y < ROWS; y++) {
              if (!snake.some(function (s) { return s.x === x && s.y === y; })) free.push({ x: x, y: y });
            }
          }
          food = free.length ? free[Math.floor(Math.random() * free.length)] : null;
        }

        function reset() {
          snake = [{ x: 6, y: 7 }, { x: 5, y: 7 }, { x: 4, y: 7 }];
          dir = { x: 1, y: 0 };
          queue = [];
          acc = 0;
          step = 0.12;
          score = 0;
          placeFood();
          api.score(score);
        }

        var DIRS = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };

        function turn(name) {
          var d = DIRS[name];
          if (!d) return false;
          // Compare against the last *queued* direction so fast double-taps
          // (e.g. up then left) don't reverse the snake into itself.
          var last = queue.length ? queue[queue.length - 1] : dir;
          if (d.x === -last.x && d.y === -last.y) return true;
          if (d.x === last.x && d.y === last.y) return true;
          if (queue.length < 3) queue.push(d);
          return true;
        }

        reset();
        return {
          reset: reset,
          input: turn,
          swipe: turn,
          update: function (dt) {
            acc += dt;
            while (acc >= step) {
              acc -= step;
              if (queue.length) dir = queue.shift();
              var head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
              var hitWall = head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS;
              // The tail moves away this tick, so it's safe to step onto it.
              var body = snake.slice(0, -1);
              var hitSelf = body.some(function (s) { return s.x === head.x && s.y === head.y; });
              if (hitWall || hitSelf) return api.over(score);
              snake.unshift(head);
              if (food && head.x === food.x && head.y === food.y) {
                score += 1;
                api.score(score);
                step = Math.max(0.055, step - 0.003);
                placeFood();
                if (!food) return api.over(score, 'you filled the screen!');
              } else {
                snake.pop();
              }
            }
          },
          draw: function (ctx) {
            clear(ctx);
            ctx.fillStyle = C.grid;
            for (var x = 0; x < COLS; x++) {
              for (var y = 0; y < ROWS; y++) {
                if ((x + y) % 2 === 0) ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
              }
            }
            if (food) {
              ctx.fillStyle = C.pink;
              ctx.fillRect(food.x * CELL + 4, food.y * CELL + 4, CELL - 8, CELL - 8);
            }
            snake.forEach(function (s, i) {
              ctx.fillStyle = i === 0 ? C.cyan : C.green;
              ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
            });
          }
        };
      }
    },

    pong: {
      title: 'pong.exe',
      desc: 'first to 7 beats the cpu',
      create: function (api) {
        var PW = 6;
        var PH = 40;
        var WIN = 7;
        var player, cpu, ball, held, pScore, cScore, serveDelay;

        function serve(towardPlayer) {
          var angle = (Math.random() * 0.8 - 0.4);
          var speed = 170;
          ball = {
            x: W / 2, y: H / 2,
            vx: Math.cos(angle) * speed * (towardPlayer ? -1 : 1),
            vy: Math.sin(angle) * speed
          };
          serveDelay = 0.6;
        }

        function reset() {
          player = { y: H / 2 - PH / 2 };
          cpu = { y: H / 2 - PH / 2 };
          held = { up: false, down: false };
          pScore = 0;
          cScore = 0;
          api.score(0, 'you 0 – 0 cpu');
          serve(Math.random() < 0.5);
        }

        function bounce(paddleY, dirSign) {
          // Angle depends on where the ball hits the paddle.
          var rel = clamp((ball.y - (paddleY + PH / 2)) / (PH / 2), -1, 1);
          var speed = Math.min(360, Math.hypot(ball.vx, ball.vy) * 1.06);
          var angle = rel * 1.0;
          ball.vx = Math.cos(angle) * speed * dirSign;
          ball.vy = Math.sin(angle) * speed;
        }

        reset();
        return {
          reset: reset,
          input: function (name, down) {
            if (name === 'up' || name === 'down') {
              held[name] = down !== false;
              return true;
            }
            return false;
          },
          pointer: function (x, y) { player.y = clamp(y - PH / 2, 0, H - PH); },
          update: function (dt) {
            var move = 220 * dt;
            if (held.up) player.y -= move;
            if (held.down) player.y += move;
            player.y = clamp(player.y, 0, H - PH);

            // CPU tracks the ball with a capped speed so it's beatable.
            var target = ball.y - PH / 2;
            var cpuMax = 150 * dt;
            cpu.y += clamp(target - cpu.y, -cpuMax, cpuMax);
            cpu.y = clamp(cpu.y, 0, H - PH);

            if (serveDelay > 0) { serveDelay -= dt; return; }

            ball.x += ball.vx * dt;
            ball.y += ball.vy * dt;
            if (ball.y < 3) { ball.y = 3; ball.vy = Math.abs(ball.vy); }
            if (ball.y > H - 3) { ball.y = H - 3; ball.vy = -Math.abs(ball.vy); }

            if (ball.vx < 0 && ball.x - 3 <= 10 + PW && ball.x > 10 && ball.y >= player.y - 3 && ball.y <= player.y + PH + 3) {
              ball.x = 10 + PW + 3;
              bounce(player.y, 1);
            }
            if (ball.vx > 0 && ball.x + 3 >= W - 10 - PW && ball.x < W - 10 && ball.y >= cpu.y - 3 && ball.y <= cpu.y + PH + 3) {
              ball.x = W - 10 - PW - 3;
              bounce(cpu.y, -1);
            }

            if (ball.x < -6 || ball.x > W + 6) {
              if (ball.x < 0) cScore += 1; else pScore += 1;
              api.score(pScore, 'you ' + pScore + ' – ' + cScore + ' cpu');
              if (pScore >= WIN || cScore >= WIN) {
                return api.over(pScore, pScore >= WIN ? 'you win!' : 'cpu wins');
              }
              serve(ball.x > W);
            }
          },
          draw: function (ctx) {
            clear(ctx);
            ctx.fillStyle = C.dim;
            for (var y = 4; y < H; y += 14) ctx.fillRect(W / 2 - 1, y, 2, 7);
            text(ctx, String(pScore), W / 2 - 30, 22, 32, C.cyan);
            text(ctx, String(cScore), W / 2 + 30, 22, 32, C.pink);
            ctx.fillStyle = C.cyan;
            ctx.fillRect(10, player.y, PW, PH);
            ctx.fillStyle = C.pink;
            ctx.fillRect(W - 10 - PW, cpu.y, PW, PH);
            ctx.fillStyle = C.yellow;
            ctx.fillRect(ball.x - 3, ball.y - 3, 6, 6);
          }
        };
      }
    },

    breakout: {
      title: 'breakout.exe',
      desc: 'smash every brick',
      create: function (api) {
        var COLS = 8;
        var ROWS = 5;
        var BW = 36;
        var BH = 10;
        var GAP = 3;
        var LEFT = (W - (COLS * BW + (COLS - 1) * GAP)) / 2;
        var TOP = 30;
        var ROW_COLORS = [C.pink, C.yellow, C.green, C.cyan, C.lilac];
        var paddle, ball, bricks, held, lives, score, level, stuck;

        function buildBricks() {
          bricks = [];
          for (var r = 0; r < ROWS; r++) {
            for (var c = 0; c < COLS; c++) {
              bricks.push({ x: LEFT + c * (BW + GAP), y: TOP + r * (BH + GAP), color: ROW_COLORS[r], alive: true, points: ROWS - r });
            }
          }
        }

        function stickBall() {
          stuck = true;
          ball = { x: paddle.x + paddle.w / 2, y: H - 20, vx: 0, vy: 0 };
        }

        function launch() {
          if (!stuck) return;
          stuck = false;
          var speed = 170 + (level - 1) * 25;
          var angle = -Math.PI / 2 + (Math.random() * 0.8 - 0.4);
          ball.vx = Math.cos(angle) * speed;
          ball.vy = Math.sin(angle) * speed;
        }

        function status() {
          api.score(score, 'score ' + score + ' · lives ' + lives + ' · lvl ' + level);
        }

        function reset() {
          paddle = { x: W / 2 - 24, w: 48 };
          held = { left: false, right: false };
          lives = cheat ? 30 : 3;
          score = 0;
          level = 1;
          buildBricks();
          stickBall();
          status();
        }

        reset();
        return {
          reset: reset,
          input: function (name, down) {
            if (name === 'left' || name === 'right') {
              held[name] = down !== false;
              return true;
            }
            if ((name === 'action' || name === 'up') && down !== false && stuck) {
              launch();
              return true;
            }
            return false;
          },
          pointer: function (x) { paddle.x = clamp(x - paddle.w / 2, 0, W - paddle.w); },
          tap: function () { launch(); },
          update: function (dt) {
            var move = 240 * dt;
            if (held.left) paddle.x -= move;
            if (held.right) paddle.x += move;
            paddle.x = clamp(paddle.x, 0, W - paddle.w);

            if (stuck) {
              ball.x = paddle.x + paddle.w / 2;
              return;
            }

            // Sub-step so fast balls can't tunnel through bricks.
            var steps = Math.ceil(Math.hypot(ball.vx, ball.vy) * dt / 3);
            var sdt = dt / steps;
            for (var s = 0; s < steps; s++) {
              ball.x += ball.vx * sdt;
              ball.y += ball.vy * sdt;
              if (ball.x < 3) { ball.x = 3; ball.vx = Math.abs(ball.vx); }
              if (ball.x > W - 3) { ball.x = W - 3; ball.vx = -Math.abs(ball.vx); }
              if (ball.y < 3) { ball.y = 3; ball.vy = Math.abs(ball.vy); }

              var py = H - 14;
              if (ball.vy > 0 && ball.y + 3 >= py && ball.y + 3 <= py + 6 && ball.x >= paddle.x - 3 && ball.x <= paddle.x + paddle.w + 3) {
                var rel = clamp((ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2), -1, 1);
                var speed = Math.hypot(ball.vx, ball.vy);
                var angle = -Math.PI / 2 + rel * 1.05;
                ball.vx = Math.cos(angle) * speed;
                ball.vy = Math.sin(angle) * speed;
                ball.y = py - 3;
              }

              for (var i = 0; i < bricks.length; i++) {
                var b = bricks[i];
                if (!b.alive) continue;
                if (ball.x + 3 < b.x || ball.x - 3 > b.x + BW || ball.y + 3 < b.y || ball.y - 3 > b.y + BH) continue;
                b.alive = false;
                score += b.points;
                // Reflect on the axis with the smaller overlap.
                var ox = Math.min(ball.x + 3 - b.x, b.x + BW - (ball.x - 3));
                var oy = Math.min(ball.y + 3 - b.y, b.y + BH - (ball.y - 3));
                if (ox < oy) ball.vx = -ball.vx; else ball.vy = -ball.vy;
                status();
                break;
              }

              if (ball.y > H + 6) {
                lives -= 1;
                status();
                if (lives <= 0) return api.over(score);
                stickBall();
                return;
              }
            }

            if (!bricks.some(function (b) { return b.alive; })) {
              level += 1;
              buildBricks();
              stickBall();
              status();
            }
          },
          draw: function (ctx) {
            clear(ctx);
            bricks.forEach(function (b) {
              if (!b.alive) return;
              ctx.fillStyle = b.color;
              ctx.fillRect(b.x, b.y, BW, BH);
            });
            ctx.fillStyle = C.cyan;
            ctx.fillRect(paddle.x, H - 14, paddle.w, 6);
            ctx.fillStyle = C.yellow;
            ctx.fillRect(ball.x - 3, ball.y - 3, 6, 6);
            if (stuck) text(ctx, 'space / tap to launch', W / 2, H - 40, 16, C.dim);
          }
        };
      }
    }
  };

  /* ------------------------------------------------------------ window + loop */

  function el(tag, cls, txt) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (txt != null) node.textContent = txt;
    return node;
  }

  function lightButton(color, label, onClick) {
    var b = el('button', 'light light--btn ' + color);
    b.type = 'button';
    b.setAttribute('aria-label', label);
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      onClick();
    });
    return b;
  }

  function launch(name, onExit) {
    var def = Object.prototype.hasOwnProperty.call(GAMES, name) ? GAMES[name] : null;
    if (!def) return false;
    if (current) current.close();

    var returnFocus = document.activeElement;
    var overlay = el('div', 'game-overlay');
    var win = el('div', 'win game-win');
    win.setAttribute('role', 'dialog');
    win.setAttribute('aria-modal', 'true');
    win.setAttribute('aria-label', def.title);

    var bar = el('div', 'win-bar');
    var body = el('div', 'win-body game-body');
    var canvas = el('canvas', 'game-canvas');
    canvas.width = W;
    canvas.height = H;
    canvas.tabIndex = 0;
    canvas.setAttribute('aria-label', def.title + ' game screen');
    var statusEl = el('div', 'game-status');
    var helpEl = el('div', 'game-help', 'arrows/wasd move · space start/pause · r restart · esc quit');
    body.appendChild(canvas);
    body.appendChild(statusEl);
    body.appendChild(helpEl);

    var ctx = canvas.getContext('2d');
    var state = 'ready';
    var raf = 0;
    var last = 0;
    var best = getBest(name);
    var overMsg = '';
    var lastScore = 0;
    var statusText = '';

    function renderStatus() {
      statusEl.textContent = (statusText || 'score ' + lastScore) + '   ·   best ' + best + (cheat ? '   ·   ★ cheats on' : '');
    }

    var api = {
      score: function (score, label) {
        lastScore = score;
        statusText = label || '';
        renderStatus();
      },
      over: function (score, msg) {
        state = 'over';
        overMsg = msg || 'game over';
        if (score > best) {
          best = score;
          setBest(name, score);
          overMsg += ' — new best!';
        }
        renderStatus();
      }
    };

    var game = def.create(api);

    function restart() {
      game.reset();
      state = 'play';
      overMsg = '';
    }

    function togglePause() {
      if (state === 'play') state = 'paused';
      else if (state === 'paused' || state === 'ready') state = 'play';
      else if (state === 'over') restart();
    }

    function frame(t) {
      raf = requestAnimationFrame(frame);
      var dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
      last = t;
      if (state === 'play') game.update(dt);
      game.draw(ctx);
      if (state !== 'play') {
        ctx.fillStyle = 'rgba(11,14,23,.72)';
        ctx.fillRect(0, H / 2 - 34, W, 68);
        if (state === 'ready') {
          text(ctx, def.title.replace('.exe', '').toUpperCase(), W / 2, H / 2 - 12, 32, C.cyan);
          text(ctx, 'press space or tap to start', W / 2, H / 2 + 16, 16, C.fg);
        } else if (state === 'paused') {
          text(ctx, 'PAUSED', W / 2, H / 2 - 8, 32, C.yellow);
          text(ctx, 'space to resume', W / 2, H / 2 + 18, 16, C.fg);
        } else {
          text(ctx, overMsg.toUpperCase(), W / 2, H / 2 - 10, 24, C.pink);
          text(ctx, 'space / tap to play again', W / 2, H / 2 + 16, 16, C.fg);
        }
      }
    }

    function onKey(e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      var act = keyAction(e);
      if (!act) return;
      var down = e.type === 'keydown';
      // Swallow game keys so the page doesn't scroll behind the window.
      e.preventDefault();
      e.stopPropagation();
      if (!down) {
        if (game.input) game.input(act, false);
        return;
      }
      if (act === 'quit') return close();
      if (act === 'restart') return restart();
      if (act === 'pause') return togglePause();
      if (act === 'action') {
        if (state !== 'play') return togglePause();
        if (game.input && game.input(act, true)) return;
        return togglePause();
      }
      if (state === 'ready') state = 'play';
      if (state === 'play' && game.input) game.input(act, true);
    }

    function toLogical(e) {
      var r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) };
    }

    var swipeStart = null;
    function onPointerDown(e) {
      canvas.focus({ preventScroll: true });
      swipeStart = toLogical(e);
      if (state !== 'play') { togglePause(); return; }
      if (game.tap) game.tap();
      if (game.pointer) game.pointer(swipeStart.x, swipeStart.y);
    }
    function onPointerMove(e) {
      if (state !== 'play' || !game.pointer) return;
      if (e.pointerType === 'mouse' || e.buttons) {
        var p = toLogical(e);
        game.pointer(p.x, p.y);
      }
    }
    function onPointerUp(e) {
      if (!swipeStart || !game.swipe || state !== 'play') { swipeStart = null; return; }
      var p = toLogical(e);
      var dx = p.x - swipeStart.x;
      var dy = p.y - swipeStart.y;
      swipeStart = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 12) return;
      game.swipe(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
    }

    function onVisibility() {
      if (document.hidden && state === 'play') state = 'paused';
    }

    function close() {
      if (!current || current.overlay !== overlay) return;
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('keyup', onKey, true);
      document.removeEventListener('visibilitychange', onVisibility);
      overlay.remove();
      document.documentElement.classList.remove('game-open');
      current = null;
      if (returnFocus && returnFocus.focus) returnFocus.focus({ preventScroll: true });
      if (onExit) onExit({ game: name, best: best });
    }

    bar.appendChild(lightButton('r', 'Quit ' + def.title, close));
    bar.appendChild(lightButton('y', 'Pause ' + def.title, togglePause));
    bar.appendChild(lightButton('g', 'Restart ' + def.title, restart));
    bar.appendChild(el('span', 'win-title t-green', def.title));
    bar.appendChild(el('span', 'win-hint', 'loreOS arcade'));
    win.appendChild(bar);
    win.appendChild(body);
    overlay.appendChild(win);

    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', function () { swipeStart = null; });
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('keyup', onKey, true);
    document.addEventListener('visibilitychange', onVisibility);

    document.body.appendChild(overlay);
    document.documentElement.classList.add('game-open');
    current = { overlay: overlay, close: close };
    renderStatus();
    canvas.focus({ preventScroll: true });
    raf = requestAnimationFrame(frame);
    return true;
  }

  return {
    list: function () {
      return Object.keys(GAMES).map(function (k) { return { name: k, title: GAMES[k].title, desc: GAMES[k].desc }; });
    },
    has: function (name) { return Object.prototype.hasOwnProperty.call(GAMES, name); },
    launch: launch,
    isOpen: function () { return !!current; },
    setCheat: function (on) { cheat = !!on; }
  };
})();
