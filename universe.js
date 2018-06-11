(function () {
    var requestAnimFrame = getAnimationFrame();
    var G = 1;
    var EXPAND = 0;
    var resistance = 0.8;

    function universe (canvas) {
        var ctx = canvas.getContext('2d');
        var sun = {
            m: 1e5,
            r: R(1e5),
            color: 'white',
            l: [range(35, canvas.width - 35), range(35, canvas.height - 35)],
            v: [0, 0.6]
        };
        var p1 = {
            m: 1e5,
            r: R(1e5),
            color: 'white',
            l: [sun.l[0] + 35, sun.l[1]],
            v: [-sun.v[0], -sun.v[1]]
        };
        var p2 = {
            m: 1e3,
            r: R(1e3),
            color: '#32ee22',
            l: [sun.l[0], sun.l[1] + 120],
            v: [3.9, 0]
        };
        var stars = [sun, p1, p2];
        var container = canvas.parentNode;

        function render () {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            stars.forEach(function (star) {
                star.f = [0, 0];
            });
            for (var i = 0; i < stars.length; i++) {
                for (var j = i + 1; j < stars.length; j++) {
                    var die = applyG(i, j);
                    if (die === i) {
                        eat(j, i--);
                        if (j > i) j--;
                        break;
                    } else if (die === j) {
                        eat(i, j--);
                    }
                }
            }
            stars.forEach(function (star) {
                draw(star);
                accelerate(star);
                nextMove(star);
            });
            requestAnimFrame(render);
        }
        function eat (i, j) {
            var si = stars[i];
            var sj = stars[j];
            var m = si.m + sj.m;
            si.v[0] = (si.v[0] * si.m + sj.v[0] * sj.m) / m;
            si.v[1] = (si.v[1] * si.m + sj.v[1] * sj.m) / m;
            si.m = m;
            si.r = R(m);
            stars.splice(j, 1);
        }
        function applyG (i, j) {
            var lhs = stars[i];
            var rhs = stars[j];
            var lx = rhs.l[0] - lhs.l[0];
            var ly = rhs.l[1] - lhs.l[1];
            var lx2 = lx * lx;
            var ly2 = ly * ly;
            var r2 = Math.max(lx2 + ly2, 0.01);
            var r = Math.sqrt(r2);
            if (r < 5) {
                return lhs.m > rhs.m ? j : i;
            }
            var f = G * lhs.m * rhs.m / r2;
            var fx = Math.sign(lx) * Math.sqrt(f * lx2 / r2);
            var fy = Math.sign(ly) * Math.sqrt(f * ly2 / r2);

            lhs.f[0] += fx; lhs.f[1] += fy;
            rhs.f[0] -= fx; rhs.f[1] -= fy;
            return -1;
        }
        function draw (star) {
            var x = star.l[0];
            var y = star.l[1];
            var vx = star.v[0];
            var vy = star.v[1];
            var v = Math.sqrt(vx * vx + vy * vy) || 0.0000001;

            ctx.beginPath();
            ctx.arc(x, y, star.r, 0, Math.PI * 2, false);
            ctx.closePath();
            ctx.fillStyle = star.color;
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(x - star.r * vy / v, y + star.r * vx / v);
            ctx.lineTo(x - vx * 10, y - vy * 10);
            ctx.lineTo(x + star.r * vy / v, y - star.r * vx / v);
            ctx.closePath();
            ctx.fill();
        }
        function nextMove (star) {
            var x = star.l[0] + star.v[0];
            var y = star.l[1] + star.v[1];
            if (x > canvas.width + EXPAND || x < -EXPAND) {
                star.v[0] = -star.v[0] * resistance;
            }
            if (y > canvas.height + EXPAND || y < -EXPAND) {
                star.v[1] = -star.v[1] * resistance;
            }
            star.l[0] += star.v[0];
            star.l[1] += star.v[1];
        }
        function createStarHere (e) {
            var scrolling = (document.scrollingElement || document.documentElement);
            var y = e.clientY + scrolling.scrollTop - container.offsetTop;
            var m = Math.pow(10, range(2, 6));
            var r = R(m);
            var v = 10 / Math.log(m);
            stars.push({
                m: m,
                r: r,
                color: getRandomColor(),
                l: [e.clientX, y],
                v: randomDirection(v)
            });
        }
        function bind (target) {
            container = target;
            container.style.background = 'none';
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            window.addEventListener('resize', function () {
                canvas.width = container.clientWidth;
                canvas.height = container.clientHeight;
            });
        }
        return {bind: bind, start: render, createStarHere: createStarHere};
    };
    function getAnimationFrame () {
        return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function (callback) { window.setTimeout(callback, 1000 / 60); };
    }
    function R (m) {
        return Math.log(m);
    }
    function randomDirection (v) {
        var alpha = Math.random() * 2 * Math.PI;
        return [Math.cos(alpha) * v, Math.sin(alpha) * v];
    }
    function range (min, max) {
        return Math.random() * (max - min) + min;
    }
    function getRandomColor () {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    function accelerate (star) {
        star.v[0] += star.f[0] / star.m;
        star.v[1] += star.f[1] / star.m;
    }

    window.universe = universe;
})();
