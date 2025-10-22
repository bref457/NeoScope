// NeoScope — with Inspect Mode & Auto CSS class stubs
(() => {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => [...document.querySelectorAll(sel)];

  const els = {
    tabs: $$('.tab'),
    panes: $$('.pane'),
    html: $('#html'),
    css: $('#css'),
    js: $('#js'),
    frame: $('#frame'),
    console: $('#consoleOutput'),
    status: $('#status'),
    runBtn: $('#runBtn'),
    autoRun: $('#autoRun'),
    autoStubs: $('#autoStubs'),
    newBtn: $('#newBtn'),
    saveBtn: $('#saveBtn'),
    loadSelect: $('#loadSelect'),
    deleteBtn: $('#deleteBtn'),
    exportBtn: $('#exportBtn'),
    inspectBtn: $('#inspectBtn'),
  };

  const STARTER = {
    html: `<!-- Starte hier -->
<div class="card primary">
  <h1>Hello, NeoScope 👋</h1>
  <p>Hover mit <strong>Inspect</strong> an, um Tooltip zu sehen.</p>
  <button id="clickme" class="btn">Klick mich</button>
</div>`,
    css: `/* Ein kleines Styling */
:root{ --accent:#7bdcff; --ink:#0b0f17; }
body{ font:16px/1.5 system-ui; padding:24px; }
.card{
  max-width: 620px;
  margin: 40px auto;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid #e8eef7;
  box-shadow: 0 10px 30px rgba(0,0,0,.07);
}
.card.primary{ border-color:#c7dfff; }
.btn{
  background: linear-gradient(90deg, #8b5cf6, var(--accent));
  border:0; padding:10px 16px; border-radius:10px;
  color: var(--ink); font-weight:700; cursor:pointer;
}`,
    js: `// JS läuft im iFrame
document.getElementById('clickme')?.addEventListener('click', () => {
  console.log('🟢 Button geklickt!');
  alert('Hi von NeoScope!');
});`
  };

  let debounceTimer = null;
  let currentKey = '';
  const autoAdded = new Set();

  // Tabs
  els.tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      els.tabs.forEach(t => t.classList.toggle('active', t === btn));
      els.panes.forEach(p => p.classList.toggle('active', p.id === btn.dataset.target));
    });
  });

  // --- Auto CSS class stubs ---
  function extractClassesFromHTML(html){
    const set = new Set();
    const classAttr = /class\s*=\s*["']([^"']+)["']/gi;
    let m;
    while ((m = classAttr.exec(html))){
      const parts = m[1].split(/\s+/).filter(Boolean);
      for (const c of parts){
        if (/^[A-Za-z_-][A-Za-z0-9_-]*$/.test(c)) set.add(c);
      }
    }
    return set;
  }
  function cssHasClassRule(css, cls){
    const esc = cls.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const re = new RegExp('(^|[\\s\\}])\\.' + esc + '\\s*(?=[\\{,:])');
    return re.test(css);
  }
  function ensureCSSStubs(){
    if (!els.autoStubs.checked) return;
    const html = els.html.value;
    const css = els.css.value;
    const classes = extractClassesFromHTML(html);
    let additions = '';
    for (const c of classes){
      if (!cssHasClassRule(css, c) && !autoAdded.has(c)){
        additions += `\n\n/* Stub automatisch angelegt */\n.${c} {\n  /* TODO: Styles */\n}`;
        autoAdded.add(c);
      }
    }
    if (additions){
      els.css.value += additions;
      setStatus('Auto CSS-Stubs ergänzt.');
    }
  }

  // Auto-run
  [els.html, els.css, els.js].forEach(area => {
    area.addEventListener('input', () => {
      if (area === els.html) ensureCSSStubs();
      if (!els.autoRun.checked) return;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(render, 400);
    });
  });

  // Buttons
  els.runBtn.addEventListener('click', render);
  els.newBtn.addEventListener('click', () => {
    if (!confirm('Aktuelles Snippet verwerfen und ein neues leeres erstellen?')) return;
    currentKey = '';
    els.html.value = '';
    els.css.value = '';
    els.js.value = '';
    autoAdded.clear();
    setStatus('Neu gestartet.');
    if (els.autoRun.checked) render();
  });

  // Storage
  const STORAGE_KEY = 'neoscope/snippets';

  function listSnippets() {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    els.loadSelect.innerHTML = '<option value="">⤓ Laden…</option>';
    Object.keys(items).sort((a,b) => a.localeCompare(b)).forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      if (name === currentKey) opt.selected = true;
      els.loadSelect.appendChild(opt);
    });
  }

  function saveSnippet() {
    let name = currentKey || prompt('Name für Snippet:');
    if (!name) return;
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    items[name] = {
      html: els.html.value,
      css: els.css.value,
      js: els.js.value,
      updated: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    currentKey = name;
    listSnippets();
    setStatus(`Gespeichert als “${name}”.`);
  }

  function loadSnippet(name) {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const it = items[name];
    if (!it) { setStatus('Snippet nicht gefunden.'); return; }
    currentKey = name;
    els.html.value = it.html; els.css.value = it.css; els.js.value = it.js;
    autoAdded.clear();
    setStatus(`Geladen: “${name}”.`);
    render();
  }

  function deleteSnippet(name) {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (!(name in items)) return;
    if (!confirm(`“${name}” wirklich löschen?`)) return;
    delete items[name];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    if (currentKey === name) currentKey = '';
    listSnippets();
    setStatus('Gelöscht.');
  }

  els.saveBtn.addEventListener('click', saveSnippet);
  els.loadSelect.addEventListener('change', (e) => {
    if (!e.target.value) return;
    loadSnippet(e.target.value);
  });
  els.deleteBtn.addEventListener('click', () => {
    const name = els.loadSelect.value || currentKey;
    if (!name) { alert('Kein Snippet ausgewählt.'); return; }
    deleteSnippet(name);
  });

  // Export Single HTML
  els.exportBtn.addEventListener('click', () => {
    const blob = new Blob([buildDocument()], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const fn = (currentKey || 'neoscope') + '.html';
    a.download = fn;
    a.click();
    URL.revokeObjectURL(a.href);
    setStatus(`Exportiert: ${fn}`);
  });

  // Inspect toggle
  els.inspectBtn.addEventListener('click', () => {
    const on = !els.inspectBtn.classList.contains('active');
    toggleInspect(on);
  });
  function toggleInspect(on){
    els.inspectBtn.classList.toggle('active', on);
    setStatus(on ? 'Inspect an.' : 'Inspect aus.');
    try {
      els.frame.contentWindow.postMessage({ __cs:true, type:'setInspect', on }, '*');
    } catch(e){}
  }

  // Build preview doc
  function buildDocument(){
    const html = els.html.value;
    const css = els.css.value;
    const js = els.js.value;

    const inspectorScript = `
      (function(){
        let inspectOn = false;
        let box, tip;
        function ensureUI(){
          if (box && tip) return;
          box = document.createElement('div');
          Object.assign(box.style, {
            position:'fixed', zIndex:2147483646, pointerEvents:'none',
            border:'2px solid #7bdcff', borderRadius:'6px', boxShadow:'0 0 0 2px rgba(123,220,255,.2) inset'
          });
          tip = document.createElement('div');
          Object.assign(tip.style, {
            position:'fixed', zIndex:2147483647, pointerEvents:'none',
            maxWidth:'60vw', fontFamily:'ui-monospace, monospace', fontSize:'12px',
            background:'#0b0f17', color:'#e7eef7', padding:'6px 8px', border:'1px solid #22304a', borderRadius:'6px',
            boxShadow:'0 6px 20px rgba(0,0,0,.35)', whiteSpace:'pre', lineHeight:'1.35'
          });
          document.body.appendChild(box);
          document.body.appendChild(tip);
          box.style.display = 'none'; tip.style.display='none';
        }
        function onMove(e){
          if (!inspectOn) return;
          const el = e.target;
          if (!el || el === box || el === tip) return;
          ensureUI();
          const r = el.getBoundingClientRect();
          box.style.display='block';
          box.style.left = r.left+'px'; box.style.top = r.top+'px';
          box.style.width = r.width+'px'; box.style.height = r.height+'px';

          const cs = getComputedStyle(el);
          const tag = el.tagName.toLowerCase();
          const id = el.id ? '#'+el.id : '';
          const cls = el.classList.length ? '.'+[...el.classList].join('.') : '';
          const dims = Math.round(r.width)+'×'+Math.round(r.height);
          const styles = [
            'display: '+cs.display,
            'position: '+cs.position,
            'font-size: '+cs.fontSize,
            'color: '+cs.color,
            'bg: '+cs.backgroundColor,
            'margin: '+cs.margin,
            'padding: '+cs.padding,
          ].join('  |  ');
          const htmlHint = '<'+tag+id+cls+'>';
          tip.textContent = htmlHint + '\\n' + styles + '\\n' + 'dims: '+dims;
          let x = e.clientX + 14, y = e.clientY + 18;
          const vw = window.innerWidth, vh = window.innerHeight;
          const tw = Math.min(tip.offsetWidth||260, 420), th = (tip.offsetHeight||60);
          if (x+tw > vw-10) x = vw - tw - 10;
          if (y+th > vh-10) y = vh - th - 10;
          tip.style.left = x+'px'; tip.style.top = y+'px';
          tip.style.display = 'block';
        }
        function onLeave(){
          if (!inspectOn) return;
          if (box){ box.style.display='none'; }
          if (tip){ tip.style.display='none'; }
        }
        window.addEventListener('message', (e) => {
          const d = e.data;
          if (!d || !d.__cs) return;
          if (d.type === 'setInspect'){
            inspectOn = !!d.on;
            ensureUI();
            if (!inspectOn){
              onLeave();
            }
          }
        });
        window.addEventListener('mousemove', onMove, true);
        window.addEventListener('mouseout', onLeave, true);
      })();
    `;

    const doc = `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <title>Preview</title>
    <style>${css}</style>
  </head>
  <body>
    ${html}
    <script>
      (function(){
        const parentOrigin='*';
        const send=(t,p)=>parent.postMessage({__cs:true,type:t,payload:p},parentOrigin);
        ['log','info','warn','error'].forEach(kind=>{
          const orig=console[kind].bind(console);
          console[kind]=function(...args){
            try{send('console',{kind,args:args.map(String)})}catch(e){}
            orig(...args);
          };
        });
        window.addEventListener('error',(e)=>{
          send('console',{kind:'error',args:[e.message+' @ '+(e.filename||'')+':'+(e.lineno||'')]});
        });
        window.addEventListener('unhandledrejection',(e)=>{
          send('console',{kind:'error',args:['Unhandled promise rejection: '+(e.reason && e.reason.message || e.reason)]});
        });
      })();
    </` + `script>
    <script>
${js}
    </` + `script>
    <script>${inspectorScript}</` + `script>
  </body>
</html>`;
    return doc;
  }

  function render(){
    const doc = buildDocument();
    const blob = new Blob([doc], { type: 'text/html' });
    els.frame.src = URL.createObjectURL(blob);
    setStatus('Gerendert.');
    els.console.innerHTML = '';
    setTimeout(() => {
      try { els.frame.contentWindow.postMessage({ __cs:true, type:'setInspect', on:els.inspectBtn.classList.contains('active') }, '*'); } catch(e){}
    }, 60);
  }

  // Console bridge
  window.addEventListener('message', (e) => {
    const data = e.data;
    if (!data || !data.__cs) return;
    if (data.type === 'console') {
      const { kind, args } = data.payload;
      logConsole(kind, args);
    }
  });

  function logConsole(kind, msgs){
    const line = document.createElement('div');
    line.className = 'log ' + (kind === 'error' ? 'err' : kind === 'warn' ? 'warn' : kind === 'info' ? 'info' : '');
    line.textContent = msgs.join(' ');
    els.console.appendChild(line);
    els.console.scrollTop = els.console.scrollHeight;
  }

  function setStatus(msg){ els.status.textContent = msg; }

  // Shortcuts
  window.addEventListener('keydown', (e) => {
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key === 's'){ e.preventDefault(); saveSnippet(); }
    if (mod && (e.key === 'Enter')){ e.preventDefault(); render(); }
    if (mod && (e.key.toLowerCase() === 'i')){ e.preventDefault(); els.inspectBtn.click(); }
  });

  // Bootstrap
  function bootstrap(){
    els.html.value = STARTER.html;
    els.css.value  = STARTER.css;
    els.js.value   = STARTER.js;
    listSnippets();

    // initial auto-stubs for starter
    const cssBefore = els.css.value;
    const m = /class\s*=\s*["']([^"']+)["']/gi;
    const s = new Set();
    let k; while((k=m.exec(els.html.value))){ k[1].split(/\s+/).forEach(x=>x && s.add(x)); }
    const toAdd = Array.from(s).filter(c => !new RegExp('(^|[\\s\\}])\\.'+c.replace(/[-/\\^$*+?.()|[\\]{}]/g,'\\$&')+'\\s*(?=[\\{,:])').test(cssBefore));
    if (toAdd.length){
      els.css.value += toAdd.map(c => `\n\n/* Stub automatisch angelegt */\n.${c} {\n  /* TODO: Styles */\n}`).join('');
      toAdd.forEach(c => autoAdded.add(c));
    }
    render();
  }

  // Storage helpers
  function saveSnippet(){ /* defined above via closure, keep order */ }
  function listSnippets(){ /* defined above via closure, keep order */ }

  // Re-bind real fns (already defined above)
  // (JS hoisting note: functions are function-scoped; the earlier references work.)

  bootstrap();
})();
