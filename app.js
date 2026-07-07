/* ===== 面接準備キット — ツールのロジック ===== */
(function () {
  "use strict";

  // 単一のソース。チェックリスト・今日の3問・記入エディタが共有する。
  var QUESTIONS = [
    { tag: "A", name: "自己紹介・自己PR", items: [
      "30秒で自己PR", "1分で自己PR", "一言で言うとあなたはどんな人？", "あなたのこだわりは？", "自分のキャッチコピー"
    ]},
    { tag: "B", name: "長所・短所・人柄", items: [
      "長所は？", "短所は？", "短所をどう克服してきたか？", "周りからどんな人だと言われる？",
      "自己評価と他者評価の違いは？", "苦手な人は？その人とどう接する？", "自分に足りないところは？",
      "自分を動物／物に例えると？", "仲間内での自分のキャラは？", "どんな人と仲が良い？", "親友はどんな人？"
    ]},
    { tag: "C", name: "経験・エピソード", items: [
      "学生時代に最も力を入れたこと", "部活・課外活動での役割", "一番嬉しかったこと", "一番辛かったこと",
      "一番一生懸命だったこと", "挫折経験とどう乗り越えたか", "他者と衝突した経験", "リーダーシップを発揮した経験",
      "頑張っても評価されなかった経験", "人生で失敗したこと", "最も影響を受けた人", "尊敬する人物とその理由",
      "座右の銘", "印象に残っている言葉", "アルバイトと学んだこと", "ボランティア経験",
      "趣味", "特技", "資格（なぜ取った）", "英語力", "体力に自信は？", "宝物"
    ]},
    { tag: "D", name: "医師・キャリア観", items: [
      "医師志望理由", "志望科とその理由", "理想の医師像", "医師に大事なこと", "自分が医師に向いている点",
      "プロフェッショナルとは？", "医師としての将来像／5〜10年後", "将来のためにしていること",
      "チーム医療での自分の役割", "看護師など多職種をどう捉えるか", "上級医と意見が食い違ったら",
      "残業と自己研鑽の違い", "医師になっていなければ何に？", "研究・留学に興味は？"
    ]},
    { tag: "E", name: "医療・社会系トピック", items: [
      "医師の地域偏在の解消策", "診療科の偏在", "医師の働き方改革・長時間労働", "地域包括ケアシステムでの医師の役割",
      "尊厳死と安楽死の違い・是非", "認知症患者の介護のあり方", "医療におけるAIとの共存", "日本の医療保険制度の今後",
      "社会保障費を下げるには", "オンライン診療の長所・短所", "ジェネリックについて", "アフターピルの市販",
      "新専門医制度", "命の選別（0歳と100歳）", "女性医師のキャリア・女性差別", "医師が余る時代の生き残り",
      "最近の医療ニュースと意見"
    ]},
    { tag: "F", name: "病院別（各病院ごとに）", items: [
      "志望理由（なぜこの病院か）", "見学の印象・魅力／特徴", "この病院の役割・地域での位置づけ",
      "市中病院を選ぶ理由", "併願病院とその中でここが良い点", "後期研修・進路", "採用するメリット",
      "改善してほしい点・弱点", "最後に一言"
    ]},
    { tag: "G", name: "締め・その他", items: [
      "最近気になった一般ニュースと意見", "最近読んだ本", "逆質問の準備", "家族構成・健康状態など事務確認"
    ]}
  ];

  function idOf(tag, i) { return tag + "-" + i; }

  // ---- storage ----
  var CK = "mensetsu.checked.v1", AN = "mensetsu.answers.v1";
  function load(k) { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { return {}; } }
  function save(k, o) { try { localStorage.setItem(k, JSON.stringify(o)); } catch (e) {} }
  var checked = load(CK);
  var answers = load(AN);

  var $ = function (id) { return document.getElementById(id); };
  var chevSVG = '<svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 6l6 6-6 6"/></svg>';

  function totalCount() { var n = 0; QUESTIONS.forEach(function (c) { n += c.items.length; }); return n; }
  function checkedCount() { var n = 0; Object.keys(checked).forEach(function (k) { if (checked[k]) n++; }); return n; }

  // ============ view switching ============
  function show(viewId) {
    var views = document.querySelectorAll(".view");
    for (var i = 0; i < views.length; i++) views[i].classList.remove("is-active");
    var v = $(viewId);
    if (v) v.classList.add("is-active");
    window.scrollTo(0, 0);
  }

  // ============ checklist + progress ============
  function setChecked(id, val) {
    if (val) checked[id] = true; else delete checked[id];
    save(CK, checked);
    // reflect in checklist DOM
    var box = document.querySelector('.chk-item input[data-id="' + id + '"]');
    if (box) { box.checked = val; box.closest(".chk-item").classList.toggle("done", val); }
    // reflect in quiz DOM
    var qb = document.querySelector('.mini-btn[data-id="' + id + '"]');
    if (qb) { qb.classList.toggle("on", val); qb.textContent = val ? "覚えた ✓" : "覚えた"; }
    updateCounts();
  }

  function updateCounts() {
    var globalDone = 0, globalTotal = totalCount();
    QUESTIONS.forEach(function (cat) {
      var done = 0;
      cat.items.forEach(function (_, i) { if (checked[idOf(cat.tag, i)]) done++; });
      globalDone += done;
      var el = $("cnt-" + cat.tag);
      if (el) el.textContent = done + " / " + cat.items.length;
    });
    var pct = globalTotal ? Math.round((globalDone / globalTotal) * 100) : 0;
    var fill = $("globalFill"), num = $("globalNum");
    if (fill) fill.style.width = pct + "%";
    if (num) num.textContent = globalDone + " / " + globalTotal + "（" + pct + "%）";
  }

  function renderChecklist() {
    var root = $("checklist");
    if (!root) return;
    var html = "";
    QUESTIONS.forEach(function (cat, ci) {
      html += '<details class="cat"' + (ci === 0 ? " open" : "") + '>';
      html += '<summary><span class="tag">' + cat.tag + "</span>" + cat.name +
              '<span class="cnt" id="cnt-' + cat.tag + '">0 / ' + cat.items.length + "</span>" + chevSVG + "</summary>";
      html += '<ul class="chk-list">';
      cat.items.forEach(function (q, i) {
        var id = idOf(cat.tag, i), on = !!checked[id];
        html += '<li class="chk-item' + (on ? " done" : "") + '"><input type="checkbox" data-id="' + id + '"' +
                (on ? " checked" : "") + ' aria-label="' + q.replace(/"/g, "") + '"><span>' + q + "</span></li>";
      });
      html += "</ul></details>";
    });
    root.innerHTML = html;
    root.addEventListener("change", function (e) {
      var t = e.target;
      if (t && t.matches('input[type="checkbox"][data-id]')) setChecked(t.getAttribute("data-id"), t.checked);
    });
    // allow clicking the whole row
    root.addEventListener("click", function (e) {
      var li = e.target.closest(".chk-item");
      if (li && e.target.tagName !== "INPUT") {
        var box = li.querySelector("input");
        box.checked = !box.checked;
        setChecked(box.getAttribute("data-id"), box.checked);
      }
    });
    updateCounts();
  }

  // ============ 今日の3問 ============
  function pickThree() {
    var pool = [];
    QUESTIONS.forEach(function (cat) {
      cat.items.forEach(function (q, i) {
        var id = idOf(cat.tag, i);
        pool.push({ id: id, q: q, cat: cat.name, done: !!checked[id] });
      });
    });
    var undone = pool.filter(function (p) { return !p.done; });
    var source = undone.length >= 3 ? undone : pool;
    // shuffle copy
    source = source.slice();
    for (var a = source.length - 1; a > 0; a--) {
      var b = Math.floor(Math.random() * (a + 1)); var t = source[a]; source[a] = source[b]; source[b] = t;
    }
    var three = source.slice(0, 3);
    var grid = $("quizGrid");
    if (!grid) return;
    grid.innerHTML = three.map(function (p) {
      var on = !!checked[p.id];
      return '<div class="quiz-card"><div class="qcat">' + p.cat + '</div><div class="qtext">' + p.q + "</div>" +
        '<div class="qacts"><button class="mini-btn' + (on ? " on" : "") + '" data-id="' + p.id + '">' +
        (on ? "覚えた ✓" : "覚えた") + "</button></div></div>";
    }).join("");
  }

  // ============ 話す長さチェッカー ============
  var pace = 330;   // 文字/分（ふつう）
  var target = 60;  // 秒
  function updateChecker() {
    var ta = $("answerText");
    if (!ta) return;
    var chars = ta.value.replace(/\s/g, "").length;
    var secs = chars / (pace / 60);
    var secR = Math.round(secs);
    $("statChars").textContent = chars;
    $("statSecs").textContent = secR;
    var targetChars = Math.round(pace * target / 60);
    $("targetChars").textContent = "目標の目安：約 " + targetChars + " 字（" + target + "秒）";
    var v = $("verdict");
    var diff = secR - target;
    v.classList.remove("ok", "over", "under");
    if (chars === 0) { v.className = "verdict under"; v.textContent = "回答を貼り付けると、話す長さを判定します。"; return; }
    if (Math.abs(diff) <= Math.max(4, target * 0.12)) { v.className = "verdict ok"; v.textContent = "ちょうど良い長さです（目標 " + target + "秒 に対して " + (diff >= 0 ? "+" : "") + diff + "秒）。"; }
    else if (diff > 0) { v.className = "verdict over"; v.textContent = "長め：目標より +" + diff + "秒。要点を削って結論を先に。"; }
    else { v.className = "verdict under"; v.textContent = "短め：目標より " + diff + "秒。具体的なエピソードを足す余地があります。"; }
  }
  function wireSeg(rootId, onPick) {
    var root = $(rootId);
    if (!root) return;
    root.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      var btns = root.querySelectorAll("button");
      for (var i = 0; i < btns.length; i++) btns[i].classList.remove("active");
      b.classList.add("active");
      onPick(parseInt(b.getAttribute("data-val"), 10));
    });
  }

  // ============ 記入エディタ + 書き出し ============
  function renderEditor() {
    var root = $("editor");
    if (!root) return;
    var html = "";
    QUESTIONS.forEach(function (cat, ci) {
      html += '<details class="cat"' + (ci === 0 ? " open" : "") + '>';
      html += '<summary><span class="tag">' + cat.tag + "</span>" + cat.name + chevSVG + "</summary><div>";
      cat.items.forEach(function (q, i) {
        var id = idOf(cat.tag, i);
        var rec = answers[id] || {};
        var a = (rec.a || "").replace(/</g, "&lt;");
        var d = (rec.d || "").replace(/</g, "&lt;").replace(/"/g, "&quot;");
        html += '<div class="qa"><label>' + q + "</label>" +
          '<textarea data-id="' + id + '" data-f="a" placeholder="回答（面接で言う形）を書く…">' + a + "</textarea>" +
          '<input type="text" data-id="' + id + '" data-f="d" placeholder="深掘り・想定追撃への返し（任意）" value="' + d + '">' +
          "</div>";
      });
      html += "</div></details>";
    });
    root.innerHTML = html;
    root.addEventListener("input", function (e) {
      var t = e.target;
      if (!t.matches("[data-id]")) return;
      var id = t.getAttribute("data-id"), f = t.getAttribute("data-f");
      if (!answers[id]) answers[id] = {};
      answers[id][f] = t.value;
      if (!answers[id].a && !answers[id].d) delete answers[id];
      save(AN, answers);
      updateEditorCount();
    });
    updateEditorCount();
  }
  function updateEditorCount() {
    var filled = 0;
    Object.keys(answers).forEach(function (k) { if (answers[k] && answers[k].a) filled++; });
    var el = $("editorCount");
    if (el) el.textContent = "記入済み " + filled + " / " + totalCount() + " 問（自動保存）";
  }
  function csvField(s) { return '"' + String(s == null ? "" : s).replace(/"/g, '""') + '"'; }
  function exportCsv() {
    var rows = [["カテゴリ", "質問", "回答", "深掘り・想定追撃への返し"]];
    QUESTIONS.forEach(function (cat) {
      cat.items.forEach(function (q, i) {
        var rec = answers[idOf(cat.tag, i)] || {};
        rows.push([cat.name, q, rec.a || "", rec.d || ""]);
      });
    });
    var csv = "﻿" + rows.map(function (r) { return r.map(csvField).join(","); }).join("\r\n");
    var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = "面接回答_下書き.csv";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  // ============ init ============
  document.addEventListener("DOMContentLoaded", function () {
    renderChecklist();
    renderEditor();

    var bChecker = $("btnChecker"), bQuiz = $("btnQuiz");
    if (bChecker) bChecker.addEventListener("click", function () { show("view-checker"); updateChecker(); });
    if (bQuiz) bQuiz.addEventListener("click", function () { show("view-quiz"); pickThree(); });
    var backs = document.querySelectorAll(".js-back");
    for (var i = 0; i < backs.length; i++) backs[i].addEventListener("click", function () { show("view-main"); });

    var reroll = $("btnReroll");
    if (reroll) reroll.addEventListener("click", pickThree);
    var qg = $("quizGrid");
    if (qg) qg.addEventListener("click", function (e) {
      var b = e.target.closest(".mini-btn[data-id]");
      if (b) setChecked(b.getAttribute("data-id"), !checked[b.getAttribute("data-id")]);
    });

    var at = $("answerText");
    if (at) at.addEventListener("input", updateChecker);
    wireSeg("paceSeg", function (v) { pace = v; updateChecker(); });
    wireSeg("targetSeg", function (v) { target = v; updateChecker(); });
    updateChecker();

    var ex = $("exportCsv");
    if (ex) ex.addEventListener("click", exportCsv);
  });
})();
