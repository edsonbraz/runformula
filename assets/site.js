/* RunFormula — runformula.app
   The home page's animations. Each one starts when it scrolls into view and
   respects "reduce motion". The workout rules shown here are the app's own. */
(function () {
  "use strict";
  var PT = (document.documentElement.lang || "").toLowerCase().indexOf("pt") === 0;
  var RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (id) { return document.getElementById(id); };
  var T = PT ? {
    week: "Sem", pause: "Pausa",
    toasts: { 3: "Blocos de corrida mais longos", 5: "Plano pausado. Ele espera por você.", 7: "30 minutos correndo, só com pausas curtas", 10: "Primeiros tiros curtos" },
    w: {
      normal: ["Treino de ritmo", "45 min", "Esforço confortavelmente forte", "Cada treino fortalece a sua resistência."],
      great: ["Treino de ritmo", "45 min", "Esforço confortavelmente forte", "Você está ótimo! Dia perfeito para um desafio."],
      tired: ["Corrida leve", "20 min", "Ritmo de conversa", "Você parece cansado hoje. Um treino leve vai ajudar na recuperação."],
      pain: ["Descanso", "—", "Recuperação", "Pegue leve hoje - ouça seu corpo e foque na recuperação."]
    },
    go: "Iniciar treino", goRest: "Ver sugestões leves",
    cal: { E: "Leve", T: "Ritmo", L: "Longão" }, paused: "Plano pausado"
  } : {
    week: "Wk", pause: "Pause",
    toasts: { 3: "Longer running blocks", 5: "Plan paused. It waits for you.", 7: "30 minutes running, with short breaks only", 10: "First strides" },
    w: {
      normal: ["Tempo run", "45 min", "Comfortably hard effort", "Every run builds your endurance."],
      great: ["Tempo run", "45 min", "Comfortably hard effort", "You're feeling great! A perfect day for a challenge."],
      tired: ["Easy run", "20 min", "Conversational pace", "You seem tired today. An easy run will help you recover."],
      pain: ["Rest", "—", "Recovery", "Take it easy today - listen to your body and focus on recovery."]
    },
    go: "Start workout", goRest: "See easy options",
    cal: { E: "Easy", T: "Tempo", L: "Long" }, paused: "Plan paused"
  };
  var VOL = [135, 151, 155, 161, 165, 171, 180, 186, 190, 191, 200, 200];

  function once(el, fn, th) {
    if (!el) return;
    if (!("IntersectionObserver" in window)) { fn(); return; }
    var io = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { fn(); io.disconnect(); }
    }, { threshold: th || 0.35 });
    io.observe(el);
  }
  function rep(n, a) { var out = []; for (var i = 0; i < n; i++) out = out.concat(a); return out; }
  function countTo(el, to, ms) {
    var from = +el.textContent || 0, t0 = performance.now();
    (function f(t) {
      var k = RM ? 1 : Math.min(1, (t - t0) / ms);
      el.textContent = Math.round(from + (to - from) * k);
      if (k < 1) requestAnimationFrame(f);
    })(t0);
  }

  /* ---------- Hero: a beginner's journey, one session per week ----------
     Sessions follow the app's beginner path (Daniels' White I-IV). */
  (function journey() {
    var rows = $("jRows"); if (!rows) return;
    var P = [
      { run: 10, segs: [["w", 5]].concat(rep(10, [["e", 1], ["w", 1]]), [["w", 5]]) },
      { run: 23, segs: [["e", 3], ["w", 3]].concat(rep(10, [["e", 2], ["w", 1]]), [["w", 4]]) },
      { run: 30, segs: [["e", 10], ["w", 3], ["e", 10], ["w", 3], ["e", 10], ["w", 4]] },
      { run: 37, segs: [["e", 30], ["st", 7], ["e", 6]] }
    ];
    var plan = [0, 0, 0, 1, 1, "pause", 1, 2, 2, 2, 3, 3];
    var wk = 0, html = "";
    plan.forEach(function (p) {
      if (p === "pause") { html += '<div class="jr pause"><span class="n"></span><div class="strip">' + T.pause + "</div></div>"; return; }
      wk++;
      html += '<div class="jr"><span class="n">' + T.week + " " + wk + '</span><div class="strip">' +
        P[p].segs.map(function (s, j) { return '<span class="seg ' + s[0] + '" style="width:' + (s[1] / 45 * 100) + "%;transition-delay:" + (j * 18) + 'ms"></span>'; }).join("") +
        "</div></div>";
    });
    rows.innerHTML = html;
    var jrs = rows.children, stat = $("jRun"), toast = $("toast"), toastText = $("toastText"), tt = null, timers = [];
    function say(t) { toastText.textContent = t; toast.classList.add("show"); clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove("show"); }, 2300); }
    function play() {
      timers.forEach(clearTimeout); timers = [];
      for (var i = 0; i < jrs.length; i++) jrs[i].classList.remove("on");
      stat.textContent = "10";
      plan.forEach(function (p, i) {
        timers.push(setTimeout(function () {
          jrs[i].classList.add("on");
          if (p !== "pause") countTo(stat, P[p].run, 600);
          if (T.toasts[i]) say(T.toasts[i]);
        }, 400 + i * 900));
      });
      timers.push(setTimeout(play, 400 + plan.length * 900 + 4200));
    }
    if (RM) { for (var i = 0; i < jrs.length; i++) jrs[i].classList.add("on"); stat.textContent = "37"; }
    else play();
  })();

  /* ---------- Check-in: the app's rules (tired -> easy 20 min, pain -> rest) ---------- */
  (function checkin() {
    var card = $("wcard"); if (!card) return;
    var STYLE = {
      normal: { zc: "var(--z3)", zw: "60%", ic: "#FFF6DA", icc: "#8A6A00" },
      great: { zc: "var(--z3)", zw: "60%", ic: "#FFF6DA", icc: "#8A6A00" },
      tired: { zc: "var(--z1)", zw: "22%", ic: "#E8F5E9", icc: "#2E7D32" },
      pain: { zc: "#9CA0AB", zw: "6%", ic: "#EDEEF2", icc: "#5C5F6A" }
    };
    var ICON = {
      go: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="13" cy="4" r="2"/><path d="m7 21 3-6 3 2v5"/><path d="m6 12 3-3 4 1 3 3 3 1"/></svg>',
      rest: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>'
    };
    var btns = document.querySelectorAll(".feel button"), pain = $("pain");
    var feel = "normal", hurt = false, touched = false;
    function render() {
      var k = hurt ? "pain" : feel, w = T.w[k], s = STYLE[k];
      var ttl = $("wTtl"), why = $("wWhy");
      ttl.classList.add("fade"); why.classList.add("fade");
      setTimeout(function () {
        ttl.textContent = w[0]; $("wDur").textContent = w[1]; $("wZoneLbl").textContent = w[2]; why.textContent = w[3];
        var ic = $("wIc"); ic.style.background = s.ic; ic.style.color = s.icc; ic.innerHTML = hurt ? ICON.rest : ICON.go;
        var z = $("wZone"); z.style.width = s.zw; z.style.background = s.zc;
        $("wGo").textContent = hurt ? T.goRest : T.go;
        card.classList.toggle("rest", hurt);
        ttl.classList.remove("fade"); why.classList.remove("fade");
      }, RM ? 0 : 160);
      for (var i = 0; i < btns.length; i++) btns[i].setAttribute("aria-pressed", String(btns[i].getAttribute("data-f") === feel && !hurt));
      pain.setAttribute("aria-pressed", String(hurt));
    }
    for (var i = 0; i < btns.length; i++) btns[i].addEventListener("click", function () { touched = true; feel = this.getAttribute("data-f"); hurt = false; render(); });
    pain.addEventListener("click", function () { touched = true; hurt = !hurt; render(); });
    render();
    var demo = [["tired", false], ["normal", false], ["great", false], ["normal", true], ["normal", false]];
    once(card, function () {
      if (RM) return;
      var i = 0, iv = setInterval(function () {
        if (touched) { clearInterval(iv); return; }
        feel = demo[i % demo.length][0]; hurt = demo[i % demo.length][1]; render(); i++;
      }, 2600);
    });
  })();

  /* ---------- Flexible plan: move a workout within its week; a pause shifts later weeks ---------- */
  (function calendar() {
    var rowsEl = $("calRows"); if (!rowsEl) return;
    var steps = document.querySelectorAll("#calSteps li");
    var week = { 0: "E", 2: "T", 4: "E", 6: "L" }, ROWH = 58, html = "";
    for (var r = 0; r < 4; r++) {
      html += '<div class="cal-row"><span class="wl">' + T.week + " " + (r + 1) + "</span>";
      for (var d = 0; d < 7; d++) html += '<div class="day">' + (week[d] ? '<span class="dot ' + week[d] + '">' + T.cal[week[d]] + "</span>" : "") + "</div>";
      html += "</div>";
    }
    html += '<div class="pauserow" id="pauseRow" style="top:' + (2 * ROWH) + 'px"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>' + T.paused + "</div>";
    rowsEl.innerHTML = html;
    rowsEl.style.height = (5 * ROWH) + "px";
    var crow = rowsEl.querySelectorAll(".cal-row"), pauseRow = $("pauseRow");
    var moving = crow[1].querySelectorAll(".day")[2].querySelector(".dot");
    function dayW() { var ds = crow[1].querySelectorAll(".day"); return ds[3].getBoundingClientRect().left - ds[2].getBoundingClientRect().left; }
    function step(s) {
      for (var i = 0; i < steps.length; i++) steps[i].classList.toggle("cur", i === s);
      if (s === 0) { moving.style.transform = ""; for (var j = 0; j < crow.length; j++) crow[j].style.transform = ""; pauseRow.classList.remove("show"); }
      if (s === 1) moving.style.transform = "translateX(" + dayW() + "px)";
      if (s === 2) { pauseRow.classList.add("show"); for (var k = 2; k < crow.length; k++) crow[k].style.transform = "translateY(" + ROWH + "px)"; }
    }
    once(rowsEl, function () {
      if (RM) { step(1); step(2); return; }
      var s = 0; step(0);
      setInterval(function () { s = (s + 1) % 3; step(s); }, 2800);
    });
  })();

  /* ---------- Progress: two rising lines, start and end labelled ----------
     Weekly minutes come from a 12-week 10K plan the app builds; the pace line is a sample.
     Pace is drawn inverted, so getting faster reads as going up. */
  (function progress() {
    var vol = $("volChart"), pace = $("paceChart"); if (!vol || !pace) return;
    var PACE = [390, 389, 388, 386, 384, 382, 380, 377, 375, 372, 370, 368];
    var NS = "http://www.w3.org/2000/svg", played = false;
    function draw(svg, vals, invert, animate) {
      var r = svg.getBoundingClientRect(), W = Math.max(200, Math.round(r.width)), H = Math.max(100, Math.round(r.height));
      svg.setAttribute("viewBox", "0 0 " + W + " " + H);
      var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals), pad = 14;
      var pts = vals.map(function (v, i) {
        var k = (v - lo) / (hi - lo || 1); if (invert) k = 1 - k;
        return [pad + i * (W - 2 * pad) / (vals.length - 1), H - pad - k * (H - 2 * pad)];
      });
      var d = "M" + pts[0][0] + " " + pts[0][1];
      for (var i = 1; i < pts.length; i++) {
        var p0 = pts[i - 1], p1 = pts[i], cx = (p0[0] + p1[0]) / 2;
        d += " C" + cx + " " + p0[1] + "," + cx + " " + p1[1] + "," + p1[0] + " " + p1[1];
      }
      var last = pts[pts.length - 1];
      svg.innerHTML = "";
      var area = document.createElementNS(NS, "path");
      area.setAttribute("d", d + " L" + last[0] + " " + H + " L" + pts[0][0] + " " + H + " Z"); area.setAttribute("class", "area");
      var line = document.createElementNS(NS, "path"); line.setAttribute("d", d); line.setAttribute("class", "line");
      var dot = document.createElementNS(NS, "circle"); dot.setAttribute("cx", last[0]); dot.setAttribute("cy", last[1]); dot.setAttribute("r", 6); dot.setAttribute("class", "dot-end");
      var start = document.createElementNS(NS, "circle"); start.setAttribute("cx", pts[0][0]); start.setAttribute("cy", pts[0][1]); start.setAttribute("r", 4); start.setAttribute("class", "dot-start");
      svg.appendChild(area); svg.appendChild(line); svg.appendChild(start); svg.appendChild(dot);
      if (animate && !RM) {
        var L = line.getTotalLength();
        line.style.strokeDasharray = L; line.style.strokeDashoffset = L;
        area.style.opacity = 0; dot.style.opacity = 0;
        line.getBoundingClientRect();
        line.style.transition = "stroke-dashoffset 1.6s cubic-bezier(.3,.7,.3,1)"; line.style.strokeDashoffset = 0;
        area.style.transition = "opacity .8s ease .9s"; area.style.opacity = 1;
        dot.style.transition = "opacity .3s ease 1.5s"; dot.style.opacity = 1;
      }
    }
    function both(animate) { draw(vol, VOL, false, animate); draw(pace, PACE, true, animate); }
    both(false);
    var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { both(false); }, 150); });
    once($("prog"), function () {
      played = true; both(true);
      countTo($("volEnd"), 200, 1600);
      countTo($("gain"), 22, 1600);
      var recs = document.querySelectorAll(".rec");
      for (var j = 0; j < recs.length; j++) (function (j) { setTimeout(function () { recs[j].classList.add("on"); }, RM ? 0 : 1200 + j * 300); })(j);
    }, 0.25);
  })();

  /* ---------- FAQ: answers open and close with a height animation ---------- */
  (function faq() {
    var items = document.querySelectorAll(".faq details");
    for (var i = 0; i < items.length; i++) (function (d) {
      var sum = d.querySelector("summary"), body = d.querySelector(".faq-a"), anim = null;
      if (!sum || !body) return;
      if (d.open) d.classList.add("is-open");
      sum.addEventListener("click", function (e) {
        e.preventDefault();
        if (anim) anim.cancel();
        var opening = !d.classList.contains("is-open");
        if (RM || !body.animate) { d.open = opening; d.classList.toggle("is-open", opening); return; }
        if (opening) {
          d.open = true; d.classList.add("is-open");
          var h = body.scrollHeight;
          anim = body.animate([{ height: "0px", opacity: 0 }, { height: h + "px", opacity: 1 }], { duration: 380, easing: "cubic-bezier(.3,.7,.3,1)" });
          anim.onfinish = function () { anim = null; };
        } else {
          d.classList.remove("is-open");
          var h2 = body.offsetHeight;
          anim = body.animate([{ height: h2 + "px", opacity: 1 }, { height: "0px", opacity: 0 }], { duration: 300, easing: "cubic-bezier(.4,0,.2,1)" });
          anim.onfinish = function () { d.open = false; anim = null; };
        }
      });
    })(items[i]);
  })();

  /* ---------- Section entrances: each block rises in once when it reaches the screen ---------- */
  (function reveal() {
    var groups = [
      [".hero h1", ".hero .lede", ".hero .ctas", ".journey"],
      [".sec-head"], [".panel"], [".prog .metric"], [".rail"], [".faq-side", ".faq details"], [".end h2", ".end p", ".end .btn"],
      [".doc-hero h1", ".doc-hero p", ".toc", ".prose section", ".mail"]
    ];
    var els = [];
    groups.forEach(function (g) {
      var n = 0;
      g.forEach(function (sel) {
        var list = document.querySelectorAll(sel);
        for (var i = 0; i < list.length; i++) { list[i].classList.add("reveal"); els.push([list[i], n++]); }
      });
    });
    if (RM || !("IntersectionObserver" in window)) { els.forEach(function (x) { x[0].classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = el.parentNode ? [].indexOf.call(el.parentNode.children, el) : 0;
        el.style.setProperty("--d", Math.min(sib, 6) * 90 + "ms");
        el.classList.add("in"); io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (x) { io.observe(x[0]); });
  })();

  /* ---------- Language toggle: the pill slides, then the other language loads ---------- */
  (function langToggle() {
    var group = document.querySelector(".lang"); if (!group) return;
    var links = group.querySelectorAll("a");
    for (var i = 0; i < links.length; i++) links[i].addEventListener("click", function (e) {
      if (this.hasAttribute("aria-current") || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      var href = this.href;
      group.classList.add(this.getAttribute("hreflang") === "en" ? "to-en" : "to-pt");
      setTimeout(function () { location.href = href; }, RM ? 0 : 260);
    });
    window.addEventListener("pageshow", function () { group.classList.remove("to-en", "to-pt"); });
  })();
})();
