/* ============================================================
   节点化对话树剧本编辑器 — 主应用
   依赖：i18n.js (window.t, window.setLanguage, window.toastKey ...)
   ============================================================ */

(function(){
"use strict";

/* =========================================================================
   全局状态 (State)
   ========================================================================= */
const state = {
  nodes: [],          // {id, type, x, y, data:{...}}
  connections: [],     // {id, fromNode, fromPort, toNode}
  selectedNodeId: null,    // primary selection (drives sidebar)
  selectedNodeIds: [],     // multi-selection (array, includes primary if any)
  selectedConnId: null,
  nextNodeSeq: 1,
  camera: { x: 0, y: 0, scale: 1 }
};

const NODE_TYPE = { START: 'start', DIALOGUE: 'dialogue', CHOICE: 'choice' };

/* =========================================================================
   DOM refs
   ========================================================================= */
const canvasWrap = document.getElementById('canvas-wrap');
const viewport = document.getElementById('viewport');
const nodesLayer = document.getElementById('nodes-layer');
const edgeSvg = document.getElementById('edge-svg');
const edgesGroup = document.getElementById('edges-group');
const tempEdgePath = document.getElementById('temp-edge');
const sidebarContent = document.getElementById('sidebar-content');
const zoomIndicator = document.getElementById('zoom-indicator');
const toast = document.getElementById('toast');

/* =========================================================================
   工具函数
   ========================================================================= */
function genId(prefix){
  return prefix + '_' + Math.random().toString(36).slice(2,9) + Date.now().toString(36).slice(-4);
}

function showToast(msg, duration=2000){
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(()=> toast.classList.remove('show'), duration);
}

function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str == null ? '' : str;
  return div.innerHTML;
}

/* =========================================================================
   状态栏 (Status bar)
   ========================================================================= */
const sbCountStart    = document.getElementById('sb-count-start');
const sbCountDialogue = document.getElementById('sb-count-dialogue');
const sbCountChoice   = document.getElementById('sb-count-choice');
const sbCountConn     = document.getElementById('sb-count-conn');
const sbDirty         = document.getElementById('sb-dirty');

function bumpCount(el){
  if(!el) return;
  el.classList.remove('bump');
  void el.offsetWidth;
  el.classList.add('bump');
}

function updateStatusBar(){
  const prevStart    = +sbCountStart.textContent;
  const prevDialogue = +sbCountDialogue.textContent;
  const prevChoice   = +sbCountChoice.textContent;
  const prevConn     = +sbCountConn.textContent;
  let ns=0, nd=0, nc=0;
  state.nodes.forEach(n=>{
    if(n.type===NODE_TYPE.START) ns++;
    else if(n.type===NODE_TYPE.DIALOGUE) nd++;
    else if(n.type===NODE_TYPE.CHOICE) nc++;
  });
  sbCountStart.textContent    = ns;
  sbCountDialogue.textContent = nd;
  sbCountChoice.textContent   = nc;
  sbCountConn.textContent     = state.connections.length;
  if(ns    !== prevStart)    bumpCount(sbCountStart);
  if(nd    !== prevDialogue) bumpCount(sbCountDialogue);
  if(nc    !== prevChoice)   bumpCount(sbCountChoice);
  if(state.connections.length !== prevConn) bumpCount(sbCountConn);
  // Refresh validation indicator
  if(typeof renderValidation === 'function') renderValidation();
}

function setDirty(){
  sbDirty.classList.remove('saved');
  sbDirty.textContent = t('status.unsaved');
}

function setSaved(){
  sbDirty.classList.add('saved');
  sbDirty.textContent = t('status.saved');
}

/* =========================================================================
   撤销 / 重做 (History)
   ========================================================================= */
const HISTORY_LIMIT = 50;
const undoStack = [];
const redoStack = [];
let lastSavedSnapshot = '';

function snapshot(){
  return JSON.stringify({
    nodes: state.nodes,
    connections: state.connections,
    nextNodeSeq: state.nextNodeSeq,
    selectedNodeId: state.selectedNodeId,
    selectedConnId: state.selectedConnId
  });
}

function restoreSnapshot(snap){
  const data = JSON.parse(snap);
  // Clear DOM
  nodesLayer.innerHTML = '';
  edgesGroup.innerHTML = '';
  // Remove any edge labels
  document.querySelectorAll('.edge-label').forEach(el=>el.remove());
  state.nodes = data.nodes;
  state.connections = data.connections;
  state.nextNodeSeq = data.nextNodeSeq;
  state.selectedNodeId = data.selectedNodeId || null;
  state.selectedConnId = data.selectedConnId || null;
  // Re-render all
  state.nodes.forEach(n=> renderNode(n));
  state.connections.forEach(c=>{
    renderConnection(c);
    addEdgeLabel(c);
  });
  refreshAllPortConnectedStates();
  renderSidebar();
  updateStatusBar();
  if(typeof renderMinimap === 'function') renderMinimap();
  requestAnimationFrame(()=> updateAllConnections());
}

function checkpoint(){
  // Don't checkpoint identical states
  const snap = snapshot();
  const top = undoStack[undoStack.length-1];
  if(top === snap) return;
  undoStack.push(snap);
  if(undoStack.length > HISTORY_LIMIT) undoStack.shift();
  redoStack.length = 0;
}

function undo(){
  if(undoStack.length === 0){
    toastKey('toast.noUndo');
    return;
  }
  redoStack.push(snapshot());
  const prev = undoStack.pop();
  restoreSnapshot(prev);
  setDirty();
}

function redo(){
  if(redoStack.length === 0){
    toastKey('toast.noRedo');
    return;
  }
  undoStack.push(snapshot());
  const next = redoStack.pop();
  restoreSnapshot(next);
  setDirty();
}

/* =========================================================================
   自动保存 (Auto-save)
   ========================================================================= */
const AUTOSAVE_KEY = 'script_editor.autosave';
const AUTOSAVE_INTERVAL = 600; // ms debounce
let autosaveTimer = null;
let lastSavedAt = 0;

function scheduleSave(){
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(()=>{
    try{
      const payload = JSON.stringify({
        ts: Date.now(),
        data: JSON.parse(snapshot())
      });
      localStorage.setItem(AUTOSAVE_KEY, payload);
      lastSavedAt = Date.now();
      setSaved();
    }catch(e){}
  }, AUTOSAVE_INTERVAL);
}

function readSavedDraft(){
  try{
    const raw = localStorage.getItem(AUTOSAVE_KEY);
    if(!raw) return null;
    const obj = JSON.parse(raw);
    if(!obj || !Array.isArray(obj.data?.nodes)) return null;
    return obj;
  }catch(e){ return null; }
}

function clearSavedDraft(){
  try{ localStorage.removeItem(AUTOSAVE_KEY); }catch(e){}
}

/* =========================================================================
   相机 / 视口变换 (Pan & Zoom)
   ========================================================================= */
function applyCameraTransform(){
  viewport.style.transform = `translate(${state.camera.x}px, ${state.camera.y}px) scale(${state.camera.scale})`;
  zoomIndicator.textContent = Math.round(state.camera.scale * 100) + '%';
  // Brief flash on zoom change so users feel the scale snap
  zoomIndicator.classList.remove('flash');
  // force reflow so the animation restarts even if class already present
  void zoomIndicator.offsetWidth;
  zoomIndicator.classList.add('flash');
  if(typeof renderMinimap === 'function') renderMinimap();
}

function screenToWorld(clientX, clientY){
  const rect = canvasWrap.getBoundingClientRect();
  const sx = clientX - rect.left;
  const sy = clientY - rect.top;
  return {
    x: (sx - state.camera.x) / state.camera.scale,
    y: (sy - state.camera.y) / state.camera.scale
  };
}

let isPanning = false;
let panStart = {x:0,y:0};
let camStart = {x:0,y:0};
let spaceHeld = false;

canvasWrap.addEventListener('mousedown', (e)=>{
  const isMiddle = e.button === 1;
  const isRight = e.button === 2;
  const isSpaceLeft = e.button === 0 && spaceHeld;
  if(isMiddle || isRight || isSpaceLeft){
    isPanning = true;
    panStart = {x:e.clientX, y:e.clientY};
    camStart = {x:state.camera.x, y:state.camera.y};
    canvasWrap.classList.add('panning');
    e.preventDefault();
  } else if(e.button === 0){
    const isEmpty = e.target === canvasWrap || e.target === viewport || e.target === nodesLayer || e.target === edgeSvg;
    if(isEmpty){
      // Empty click → start marquee (preserves selection if Shift is held)
      if(!e.shiftKey) selectNode(null);
      startMarquee(e);
    }
  }
});

/* ---------- Marquee box selection ---------- */
let marquee = null;
const marqueeEl = document.createElement('div');
marqueeEl.className = 'marquee-rect';
document.getElementById('canvas-wrap').appendChild(marqueeEl);

function startMarquee(e){
  marquee = {
    x0: e.clientX, y0: e.clientY,
    x1: e.clientX, y1: e.clientY,
    additive: e.shiftKey
  };
  marqueeEl.style.display = 'block';
  updateMarqueeVisual();
  document.addEventListener('mousemove', onMarqueeMove);
  document.addEventListener('mouseup', onMarqueeUp);
}

function onMarqueeMove(e){
  if(!marquee) return;
  marquee.x1 = e.clientX;
  marquee.y1 = e.clientY;
  updateMarqueeVisual();
}

function updateMarqueeVisual(){
  if(!marquee) return;
  const x = Math.min(marquee.x0, marquee.x1);
  const y = Math.min(marquee.y0, marquee.y1);
  const w = Math.abs(marquee.x1 - marquee.x0);
  const h = Math.abs(marquee.y1 - marquee.y0);
  marqueeEl.style.left = x + 'px';
  marqueeEl.style.top  = y + 'px';
  marqueeEl.style.width  = w + 'px';
  marqueeEl.style.height = h + 'px';
}

function onMarqueeUp(e){
  document.removeEventListener('mousemove', onMarqueeMove);
  document.removeEventListener('mouseup', onMarqueeUp);
  if(!marquee) return;
  // Convert to world rect and find intersected nodes
  const w0 = screenToWorld(Math.min(marquee.x0, marquee.x1), Math.min(marquee.y0, marquee.y1));
  const w1 = screenToWorld(Math.max(marquee.x0, marquee.x1), Math.max(marquee.y0, marquee.y1));
  const inside = [];
  state.nodes.forEach(n => {
    const el = document.getElementById(n.id);
    const w = el ? el.offsetWidth : 240;
    const h = el ? el.offsetHeight : 120;
    const nx = n.x, ny = n.y, nx2 = n.x + w, ny2 = n.y + h;
    const overlap = !(nx2 < w0.x || nx > w1.x || ny2 < w0.y || ny > w1.y);
    if(overlap) inside.push(n.id);
  });
  if(inside.length > 0){
    const base = marquee.additive ? state.selectedNodeIds.slice() : [];
    const merged = Array.from(new Set(base.concat(inside)));
    setSelectedNodes(merged, merged[0]);
  }
  // If user just clicked (no drag) on empty canvas with no shift, clear selection
  if(inside.length === 0 && !marquee.additive){
    const dx = marquee.x1 - marquee.x0;
    const dy = marquee.y1 - marquee.y0;
    if(Math.abs(dx) < 3 && Math.abs(dy) < 3){
      selectNode(null);
    }
  }
  marquee = null;
  marqueeEl.style.display = 'none';
}

window.addEventListener('mousemove', (e)=>{
  if(isPanning){
    state.camera.x = camStart.x + (e.clientX - panStart.x);
    state.camera.y = camStart.y + (e.clientY - panStart.y);
    applyCameraTransform();
  }
});

window.addEventListener('mouseup', (e)=>{
  if(isPanning && (e.button===1 || e.button===2 || e.button===0)){
    isPanning = false;
    canvasWrap.classList.remove('panning');
  }
});

canvasWrap.addEventListener('contextmenu', (e)=>{
  e.preventDefault();
  // Right-click on a node → node context menu; otherwise canvas "add node" menu
  const nodeEl = e.target.closest && e.target.closest('.node');
  if(nodeEl){
    openNodeCtxMenu(e.clientX, e.clientY, nodeEl.id);
  } else {
    openContextMenu(e.clientX, e.clientY);
  }
});

window.addEventListener('keydown', (e)=>{
  // Modal open shortcuts: Escape closes any open modal
  if(e.key === 'Escape'){
    if(nodeCtxMenu.classList.contains('show')){ closeNodeCtxMenu(); return; }
    if(document.getElementById('shortcuts-modal').style.display === 'flex'){
      document.getElementById('shortcuts-modal').style.display = 'none';
      return;
    }
    if(document.getElementById('recovery-modal').style.display === 'flex'){
      document.getElementById('recovery-modal').style.display = 'none';
      return;
    }
    if(document.getElementById('export-modal').style.display === 'flex'){
      document.getElementById('export-modal').style.display = 'none';
      return;
    }
    if(document.getElementById('template-modal').style.display === 'flex'){
      document.getElementById('template-modal').style.display = 'none';
      return;
    }
  }

  const playModeActive = document.getElementById('play-overlay').classList.contains('show');
  if(playModeActive){
    if(e.key === 'Escape'){ exitPlayMode(); }
    if(e.key === ' ' || e.key === 'Enter'){
      // advance dialogue with keyboard too
      const node = playState.currentNodeId ? getNode(playState.currentNodeId) : null;
      if(node && node.type === NODE_TYPE.DIALOGUE){
        e.preventDefault();
        advanceFromDialogue(node);
      }
    }
    return;
  }

  // ? opens shortcut help (only outside text inputs)
  if(e.key === '?' && !isTypingTarget(e.target)){
    openShortcutsModal();
    e.preventDefault();
    return;
  }

  // Cmd/Ctrl+Shift+F — open node search
  if((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'F' || e.key === 'f')){
    e.preventDefault();
    openSearchPalette();
    return;
  }

  // Cmd/Ctrl+Z = undo, Cmd/Ctrl+Shift+Z or Cmd/Ctrl+Y = redo
  const mod = e.metaKey || e.ctrlKey;
  if(mod && !e.altKey && (e.key === 'z' || e.key === 'Z')){
    e.preventDefault();
    if(e.shiftKey) redo(); else undo();
    return;
  }
  if(mod && (e.key === 'y' || e.key === 'Y')){
    e.preventDefault();
    redo();
    return;
  }
  // Ctrl/Cmd+D — duplicate
  if(mod && (e.key === 'd' || e.key === 'D') && !isTypingTarget(e.target)){
    e.preventDefault();
    if(state.selectedNodeId) duplicateNode(state.selectedNodeId);
    return;
  }
  // Ctrl/Cmd+F — focus search (future-proof; for now opens help)
  if(mod && (e.key === 'f' || e.key === 'F')){
    e.preventDefault();
    openShortcutsModal();
    return;
  }

  if(e.code === 'Space' && !isTypingTarget(e.target)){
    spaceHeld = true;
    canvasWrap.classList.add('space-pan');
    e.preventDefault();
  }
  if((e.key === 'Delete' || e.key === 'Backspace') && !isTypingTarget(e.target)){
    if(state.selectedNodeIds.length > 0){
      // Delete all selected nodes (deleteNode already handles connections)
      const ids = state.selectedNodeIds.slice();
      ids.forEach(id => deleteNode(id));
      e.preventDefault();
    } else if(state.selectedConnId){
      deleteConnection(state.selectedConnId);
      e.preventDefault();
    }
  }
  if(e.key === 'Escape'){
    closeContextMenu();
  }
});
window.addEventListener('keyup', (e)=>{
  if(e.code === 'Space'){
    spaceHeld = false;
    canvasWrap.classList.remove('space-pan');
  }
});
function isTypingTarget(el){
  return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA');
}

canvasWrap.addEventListener('wheel', (e)=>{
  e.preventDefault();
  const rect = canvasWrap.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const worldX = (mouseX - state.camera.x) / state.camera.scale;
  const worldY = (mouseY - state.camera.y) / state.camera.scale;

  const delta = -e.deltaY * 0.0012;
  let newScale = state.camera.scale * (1 + delta);
  newScale = Math.min(2.5, Math.max(0.2, newScale));

  state.camera.x = mouseX - worldX * newScale;
  state.camera.y = mouseY - worldY * newScale;
  state.camera.scale = newScale;

  applyCameraTransform();
}, { passive:false });

/* =========================================================================
   节点数据模型
   ========================================================================= */
function createNodeData(type, x, y){
  const id = genId('node');
  const seq = state.nextNodeSeq++;
  if(type === NODE_TYPE.START){
    return { id, type, x, y, seq, data: { label: t('default.startLabel') } };
  }
  if(type === NODE_TYPE.DIALOGUE){
    return { id, type, x, y, seq, data: { speaker: t('default.speaker'), text: t('default.dialogueText') } };
  }
  if(type === NODE_TYPE.CHOICE){
    return { id, type, x, y, seq, data: {
      prompt: t('default.choicePrompt'),
      options: [
        { id: genId('opt'), text: t('default.choiceOption', { n: 1 }) },
        { id: genId('opt'), text: t('default.choiceOption', { n: 2 }) }
      ]
    }};
  }
}

function addNode(type, worldPos){
  checkpoint();
  const pos = worldPos || screenToWorld(window.innerWidth/2 - 150, window.innerHeight/2 - 80);
  const nodeData = createNodeData(type, pos.x, pos.y);
  state.nodes.push(nodeData);
  renderNode(nodeData);
  selectNode(nodeData.id);
  if(typeof renderMinimap === 'function') renderMinimap();
  updateStatusBar();
  setDirty(); scheduleSave();
  return nodeData;
}

function getNode(id){ return state.nodes.find(n => n.id === id); }

function deleteNode(nodeId){
  const idx = state.nodes.findIndex(n => n.id === nodeId);
  if(idx === -1) return;
  checkpoint();
  // remove connections referencing this node
  state.connections = state.connections.filter(c => {
    const affected = c.fromNode === nodeId || c.toNode === nodeId;
    if(affected){
      const edgeEl = document.getElementById('edge-' + c.id);
      if(edgeEl) edgeEl.remove();
      const arrowEl = document.getElementById('arrow-' + c.id);
      if(arrowEl) arrowEl.remove();
      const hitEl = document.getElementById('hit-' + c.id);
      if(hitEl) hitEl.remove();
      const lbl = document.getElementById('edge-label-' + c.id);
      if(lbl) lbl.remove();
    }
    return !affected;
  });
  state.nodes.splice(idx, 1);
  const el = document.getElementById(nodeId);
  if(el) el.remove();
  if(state.selectedNodeId === nodeId){
    state.selectedNodeId = null;
    renderSidebar();
  }
  refreshAllPortConnectedStates();
  if(typeof renderMinimap === 'function') renderMinimap();
  updateStatusBar();
  setDirty(); scheduleSave();
}

/* =========================================================================
   连线数据模型
   ========================================================================= */
function addConnection(fromNode, fromPort, toNode){
  // prevent duplicate & prevent self loop
  if(fromNode === toNode) return null;
  const exists = state.connections.some(c => c.fromNode===fromNode && c.fromPort===fromPort && c.toNode===toNode);
  if(exists) return null;
  checkpoint();
  const conn = { id: genId('conn'), fromNode, fromPort, toNode };
  state.connections.push(conn);
  renderConnection(conn);
  addEdgeLabel(conn);
  refreshAllPortConnectedStates();
  if(typeof renderMinimap === 'function') renderMinimap();
  updateStatusBar();
  setDirty(); scheduleSave();
  return conn;
}

function deleteConnection(connId){
  const idx = state.connections.findIndex(c => c.id === connId);
  if(idx === -1) return;
  checkpoint();
  state.connections.splice(idx, 1);
  const edgeEl = document.getElementById('edge-' + connId);
  if(edgeEl) edgeEl.remove();
  const arrowEl = document.getElementById('arrow-' + connId);
  if(arrowEl) arrowEl.remove();
  const hitEl = document.getElementById('hit-' + connId);
  if(hitEl) hitEl.remove();
  const lbl = document.getElementById('edge-label-' + connId);
  if(lbl) lbl.remove();
  if(state.selectedConnId === connId) state.selectedConnId = null;
  refreshAllPortConnectedStates();
  if(typeof renderMinimap === 'function') renderMinimap();
  updateStatusBar();
  setDirty(); scheduleSave();
}

function deleteConnectionsFromPort(nodeId, portId){
  const toRemove = state.connections.filter(c => c.fromNode===nodeId && c.fromPort===portId);
  toRemove.forEach(c => deleteConnection(c.id));
}

/* =========================================================================
   节点渲染
   ========================================================================= */
function renderNode(nodeData){
  const el = document.createElement('div');
  el.className = `node type-${nodeData.type} fresh`;
  el.id = nodeData.id;
  el.style.left = nodeData.x + 'px';
  el.style.top = nodeData.y + 'px';

  el.innerHTML = buildNodeInnerHtml(nodeData);
  nodesLayer.appendChild(el);

  attachNodeDragHandlers(el, nodeData);
  attachNodeFieldHandlers(el, nodeData);
  attachPortHandlers(el, nodeData);

  // Remove the "fresh" pop-in class after the entrance animation completes
  // so subsequent re-renders don't replay it.
  setTimeout(()=> el.classList.remove('fresh'), 500);

  el.addEventListener('mousedown', (e)=>{
    if(e.target.classList.contains('port')) return;
    if(e.button === 0){
      toggleNodeInSelection(nodeData.id, e.shiftKey || e.metaKey || e.ctrlKey);
    } else {
      selectNode(nodeData.id);
    }
  });
}

function typeBadgeLabel(type){
  if(type===NODE_TYPE.START) return t('node.title.start');
  if(type===NODE_TYPE.DIALOGUE) return t('node.title.dialogue');
  if(type===NODE_TYPE.CHOICE) return t('node.title.choice');
}

function buildNodeInnerHtml(n){
  const header = `
    <div class="node-header">
      <span class="type-icon"></span>
      <span class="title-text">${typeBadgeLabel(n.type)}</span>
      <span class="node-id">#${n.seq}</span>
    </div>`;

  if(n.type === NODE_TYPE.START){
    return header + `
      <div class="node-body">
        <div class="start-hint">${escapeHtml(t('node.startHint'))}</div>
      </div>
      <div class="port port-out" data-port-id="out" title="${escapeHtml(t('node.portOut.title'))}"></div>
    `;
  }

  if(n.type === NODE_TYPE.DIALOGUE){
    return header + `
      <div class="node-body">
        <div>
          <div class="field-label">${escapeHtml(t('node.field.speaker'))}</div>
          <input type="text" class="f-speaker" value="${escapeHtml(n.data.speaker)}" placeholder="${escapeHtml(t('node.placeholder.speaker'))}">
        </div>
        <div>
          <div class="field-label">${escapeHtml(t('node.field.text'))}</div>
          <textarea class="f-text" placeholder="${escapeHtml(t('node.placeholder.text'))}">${escapeHtml(n.data.text)}</textarea>
        </div>
      </div>
      <div class="port port-in" data-port-id="in" title="${escapeHtml(t('node.portIn.title'))}"></div>
      <div class="port port-out" data-port-id="out" title="${escapeHtml(t('node.portOut.title'))}"></div>
    `;
  }

  if(n.type === NODE_TYPE.CHOICE){
    const optionsHtml = n.data.options.map((opt, i)=>`
      <div class="choice-option-row" data-opt-id="${opt.id}">
        <input type="text" class="f-opt-text" value="${escapeHtml(opt.text)}" placeholder="${escapeHtml(t('node.placeholder.opt', { n: i+1 }))}">
        <div class="choice-remove-btn" data-remove-opt="${opt.id}" title="${escapeHtml(t('node.removeOption'))}">✕</div>
        <div class="port port-out" data-port-id="${opt.id}" title="${escapeHtml(t('node.portOut.title'))}"></div>
      </div>
    `).join('');
    return header + `
      <div class="node-body">
        <div>
          <div class="field-label">${escapeHtml(t('node.field.prompt'))}</div>
          <input type="text" class="f-prompt" value="${escapeHtml(n.data.prompt)}" placeholder="${escapeHtml(t('node.placeholder.prompt'))}">
        </div>
        <div class="field-label" style="margin-top:2px;">${escapeHtml(t('node.field.options'))}</div>
        <div class="choice-options">${optionsHtml}</div>
        <div class="add-option-btn" data-add-option>${escapeHtml(t('node.addOption'))}</div>
      </div>
      <div class="port port-in" data-port-id="in" title="${escapeHtml(t('node.portIn.title'))}"></div>
    `;
  }
}

function rerenderNodeBody(nodeData){
  // Preserve selection / focus is tricky; only used for choice option add/remove
  const el = document.getElementById(nodeData.id);
  if(!el) return;
  el.innerHTML = buildNodeInnerHtml(nodeData);
  attachNodeFieldHandlers(el, nodeData);
  attachPortHandlers(el, nodeData);
  refreshAllPortConnectedStates();
  updateConnectionsForNode(nodeData.id);
}

/* ---------------- Node dragging ---------------- */
function attachNodeDragHandlers(el, nodeData){
  const header = el.querySelector('.node-header');
  let dragging = false;
  let startMouse = {x:0,y:0};
  let startPositions = []; // [{id, x, y, el}] for the whole selection

  function onDown(e){
    if(e.button !== 0) return;
    dragging = true;
    startMouse = {x:e.clientX, y:e.clientY};
    // Snapshot starting positions of all selected nodes (or just this one)
    const moving = state.selectedNodeIds.includes(nodeData.id)
      ? state.selectedNodeIds.slice()
      : [nodeData.id];
    startPositions = moving.map(id => {
      const n = getNode(id);
      const ne = document.getElementById(id);
      return { id, x: n ? n.x : 0, y: n ? n.y : 0, el: ne };
    }).filter(x => x.el);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    e.stopPropagation();
  }
  function onMove(e){
    if(!dragging) return;
    const dx = (e.clientX - startMouse.x) / state.camera.scale;
    const dy = (e.clientY - startMouse.y) / state.camera.scale;
    startPositions.forEach(sp => {
      const n = getNode(sp.id);
      if(!n) return;
      n.x = snapValue(sp.x + dx);
      n.y = snapValue(sp.y + dy);
      sp.el.style.left = n.x + 'px';
      sp.el.style.top  = n.y + 'px';
      updateConnectionsForNode(sp.id);
    });
    if(typeof renderMinimap === 'function') renderMinimap();
  }
  function onUp(){
    if(dragging){
      let moved = false;
      startPositions.forEach(sp => {
        const n = getNode(sp.id);
        if(n && (n.x !== sp.x || n.y !== sp.y)) moved = true;
      });
      if(moved){ checkpoint(); setDirty(); scheduleSave(); }
    }
    dragging = false;
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
  }
  header.addEventListener('mousedown', onDown);
  el.addEventListener('mousedown', (e)=>{
    // allow dragging from body background too (not inputs/ports/buttons)
    if(e.target === el || e.target.classList.contains('node-body')){
      onDown(e);
    }
  });
}

/* ---------------- Field handlers ---------------- */
function attachNodeFieldHandlers(el, nodeData){
  if(nodeData.type === NODE_TYPE.DIALOGUE){
    const speakerInput = el.querySelector('.f-speaker');
    const textArea = el.querySelector('.f-text');
    speakerInput.addEventListener('input', ()=>{
      nodeData.data.speaker = speakerInput.value;
      if(state.selectedNodeId === nodeData.id) renderSidebar();
    });
    speakerInput.addEventListener('mousedown', e=>e.stopPropagation());
    textArea.addEventListener('input', ()=>{
      nodeData.data.text = textArea.value;
      if(state.selectedNodeId === nodeData.id) renderSidebar();
    });
    textArea.addEventListener('mousedown', e=>e.stopPropagation());
  }

  if(nodeData.type === NODE_TYPE.CHOICE){
    const promptInput = el.querySelector('.f-prompt');
    promptInput.addEventListener('input', ()=>{
      nodeData.data.prompt = promptInput.value;
      if(state.selectedNodeId === nodeData.id) renderSidebar();
    });
    promptInput.addEventListener('mousedown', e=>e.stopPropagation());

    el.querySelectorAll('.choice-option-row').forEach(row=>{
      const optId = row.getAttribute('data-opt-id');
      const opt = nodeData.data.options.find(o=>o.id===optId);
      const input = row.querySelector('.f-opt-text');
      input.addEventListener('input', ()=>{
        opt.text = input.value;
        if(state.selectedNodeId === nodeData.id) renderSidebar();
      });
      input.addEventListener('mousedown', e=>e.stopPropagation());

      const removeBtn = row.querySelector('.choice-remove-btn');
      removeBtn.addEventListener('mousedown', e=>e.stopPropagation());
      removeBtn.addEventListener('click', (e)=>{
        e.stopPropagation();
        if(nodeData.data.options.length <= 1){
          toastKey('toast.atLeastOneOpt');
          return;
        }
        checkpoint();
        deleteConnectionsFromPort(nodeData.id, optId);
        nodeData.data.options = nodeData.data.options.filter(o=>o.id!==optId);
        rerenderNodeBody(nodeData);
        if(state.selectedNodeId === nodeData.id) renderSidebar();
        setDirty(); scheduleSave();
      });
    });

    const addBtn = el.querySelector('[data-add-option]');
    addBtn.addEventListener('mousedown', e=>e.stopPropagation());
    addBtn.addEventListener('click', (e)=>{
      e.stopPropagation();
      checkpoint();
      const n = nodeData.data.options.length + 1;
      nodeData.data.options.push({ id: genId('opt'), text: t('default.choiceOption', { n }) });
      rerenderNodeBody(nodeData);
      if(state.selectedNodeId === nodeData.id) renderSidebar();
      setDirty(); scheduleSave();
    });
  }
}

/* =========================================================================
   端口连线交互
   ========================================================================= */
let linking = null; // { fromNode, fromPort, fromEl }

function attachPortHandlers(el, nodeData){
  el.querySelectorAll('.port-out').forEach(portEl=>{
    portEl.addEventListener('mousedown', (e)=>{
      e.stopPropagation();
      e.preventDefault();
      const portId = portEl.getAttribute('data-port-id');
      linking = { fromNode: nodeData.id, fromPort: portId, fromEl: portEl };
      portEl.classList.add('linking');
      tempEdgePath.setAttribute('visibility', 'visible');
      updateTempEdge(e);
      document.addEventListener('mousemove', onLinkMove);
      document.addEventListener('mouseup', onLinkUp);
    });
  });

  el.querySelectorAll('.port-in').forEach(portEl=>{
    portEl.addEventListener('mousedown', (e)=>{
      // allow dragging FROM an input port too, to quickly rewire — but simplest MVP: ignore
      e.stopPropagation();
    });
    portEl.addEventListener('mouseenter', ()=>{
      if(linking) portEl.classList.add('port-hover-target');
    });
    portEl.addEventListener('mouseleave', ()=>{
      portEl.classList.remove('port-hover-target');
    });
  });
}

function onLinkMove(e){
  updateTempEdge(e);
}

function updateTempEdge(e){
  if(!linking) return;
  const fromNodeData = getNode(linking.fromNode);
  const fromPortPos = getPortWorldPos(fromNodeData, linking.fromPort, 'out');
  const worldMouse = screenToWorld(e.clientX, e.clientY);
  const d = buildBezierPath(fromPortPos, worldMouse);
  tempEdgePath.setAttribute('d', d);
}

function onLinkUp(e){
  document.removeEventListener('mousemove', onLinkMove);
  document.removeEventListener('mouseup', onLinkUp);
  tempEdgePath.setAttribute('visibility', 'hidden');

  if(!linking) return;

  // find target port element under cursor
  const targetEl = document.elementFromPoint(e.clientX, e.clientY);
  if(targetEl && targetEl.classList.contains('port-in')){
    const targetNodeEl = targetEl.closest('.node');
    if(targetNodeEl){
      const toNodeId = targetNodeEl.id;
      addConnection(linking.fromNode, linking.fromPort, toNodeId);
    }
    targetEl.classList.remove('port-hover-target');
  }
  if(linking && linking.fromEl) linking.fromEl.classList.remove('linking');
  linking = null;
}

/* Compute the world-space position of a port center */
function getPortWorldPos(nodeData, portId, direction){
  const nodeEl = document.getElementById(nodeData.id);
  if(!nodeEl) return { x: nodeData.x, y: nodeData.y };
  let portEl;
  if(direction === 'out'){
    portEl = nodeEl.querySelector(`.port-out[data-port-id="${portId}"]`);
  } else {
    portEl = nodeEl.querySelector('.port-in');
  }
  if(!portEl) return { x: nodeData.x, y: nodeData.y };

  // Position relative to node (offsetLeft/Top relative to nodeEl since nodeEl is positioned)
  const nodeRect = nodeEl.getBoundingClientRect();
  const portRect = portEl.getBoundingClientRect();

  // Convert screen-space center of port to world coords
  const centerX = portRect.left + portRect.width/2;
  const centerY = portRect.top + portRect.height/2;
  return screenToWorld(centerX, centerY);
}

/* =========================================================================
   连线渲染 (SVG Bezier)
   ========================================================================= */
function buildBezierPath(p1, p2){
  const dx = Math.max(Math.abs(p2.x - p1.x) * 0.5, 60);
  const c1x = p1.x + dx;
  const c1y = p1.y;
  const c2x = p2.x - dx;
  const c2y = p2.y;
  return `M ${p1.x} ${p1.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
}

function renderConnection(conn){
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  group.setAttribute('id', 'edge-group-' + conn.id);

  const hitPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  hitPath.setAttribute('class', 'edge-hit');
  hitPath.setAttribute('id', 'hit-' + conn.id);

  const visPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  visPath.setAttribute('class', 'edge-path fresh');
  visPath.setAttribute('id', 'edge-' + conn.id);
  visPath.setAttribute('marker-end', 'url(#arrow-def)');

  group.appendChild(hitPath);
  group.appendChild(visPath);
  edgesGroup.appendChild(group);

  [hitPath, visPath].forEach(p=>{
    p.addEventListener('mousedown', (e)=>{
      e.stopPropagation();
      selectConnection(conn.id);
    });
  });

  // Remove the "fresh" draw-in class after the stroke animation completes
  setTimeout(()=> visPath.classList.remove('fresh'), 700);

  updateSingleConnectionPath(conn);
}

function updateSingleConnectionPath(conn){
  const fromNode = getNode(conn.fromNode);
  const toNode = getNode(conn.toNode);
  if(!fromNode || !toNode) return;
  const p1 = getPortWorldPos(fromNode, conn.fromPort, 'out');
  const p2 = getPortWorldPos(toNode, null, 'in');
  const d = buildBezierPath(p1, p2);
  const visPath = document.getElementById('edge-' + conn.id);
  const hitPath = document.getElementById('hit-' + conn.id);
  if(visPath) visPath.setAttribute('d', d);
  if(hitPath) hitPath.setAttribute('d', d);
  updateEdgeLabelPos(conn);
}

function updateConnectionsForNode(nodeId){
  state.connections.forEach(c=>{
    if(c.fromNode === nodeId || c.toNode === nodeId){
      updateSingleConnectionPath(c);
    }
  });
}

function updateAllConnections(){
  state.connections.forEach(updateSingleConnectionPath);
}

/* =========================================================================
   连线标签 (Edge labels for Choice options)
   ========================================================================= */
function addEdgeLabel(conn){
  const fromNode = getNode(conn.fromNode);
  if(!fromNode || fromNode.type !== NODE_TYPE.CHOICE) return;
  // Find the option text for this port
  const opt = (fromNode.data.options || []).find(o => o.id === conn.fromPort);
  if(!opt) return;
  const lbl = document.createElement('div');
  lbl.className = 'edge-label';
  lbl.id = 'edge-label-' + conn.id;
  lbl.textContent = opt.text || t('default.choiceOption');
  // Position is in world coords; viewport translates via camera. We attach to nodes-layer
  // (which is inside the viewport) so it scrolls with the camera.
  nodesLayer.appendChild(lbl);
  updateEdgeLabelPos(conn);
}

function removeEdgeLabel(connId){
  const lbl = document.getElementById('edge-label-' + connId);
  if(lbl) lbl.remove();
}

function updateEdgeLabelPos(conn){
  const lbl = document.getElementById('edge-label-' + conn.id);
  if(!lbl) return;
  const fromNode = getNode(conn.fromNode);
  const toNode = getNode(conn.toNode);
  if(!fromNode || !toNode) return;
  const p1 = getPortWorldPos(fromNode, conn.fromPort, 'out');
  const p2 = getPortWorldPos(toNode, null, 'in');
  // Bezier midpoint with control points
  const dx = Math.max(Math.abs(p2.x - p1.x) * 0.5, 60);
  const c1x = p1.x + dx, c1y = p1.y;
  const c2x = p2.x - dx, c2y = p2.y;
  // De Casteljau t=0.5
  const lerp = (a,b,t)=> a + (b-a)*t;
  const q1x = lerp(p1.x, c1x, 0.5), q1y = lerp(p1.y, c1y, 0.5);
  const q2x = lerp(c1x, c2x, 0.5), q2y = lerp(c1y, c2y, 0.5);
  const q3x = lerp(c2x, p2.x, 0.5), q3y = lerp(c2y, p2.y, 0.5);
  const r1x = lerp(q1x, q2x, 0.5), r1y = lerp(q1y, q2y, 0.5);
  const r2x = lerp(q2x, q3x, 0.5), r2y = lerp(q2y, q3y, 0.5);
  const mx  = lerp(r1x, r2x, 0.5), my  = lerp(r1y, r2y, 0.5);
  // Convert world->screen for placement. nodes-layer is inside #viewport which has the
  // camera transform, so its coordinates are world-coords.
  lbl.style.left = mx + 'px';
  lbl.style.top  = my + 'px';
}

function refreshAllPortConnectedStates(){
  // reset all ports
  document.querySelectorAll('.port').forEach(p => p.classList.remove('connected'));
  state.connections.forEach(c=>{
    const fromNodeEl = document.getElementById(c.fromNode);
    const toNodeEl = document.getElementById(c.toNode);
    if(fromNodeEl){
      const p = fromNodeEl.querySelector(`.port-out[data-port-id="${c.fromPort}"]`);
      if(p) p.classList.add('connected');
    }
    if(toNodeEl){
      const p = toNodeEl.querySelector('.port-in');
      if(p) p.classList.add('connected');
    }
  });
}

/* =========================================================================
   选中状态 & 侧边栏
   ========================================================================= */
function setSelectedNodes(ids, primaryId){
  const arr = Array.from(new Set(ids)).filter(id => !!getNode(id));
  state.selectedNodeIds = arr;
  state.selectedNodeId = primaryId != null ? primaryId : (arr[0] || null);
  state.selectedConnId = null;
  document.querySelectorAll('.node').forEach(el=> el.classList.remove('selected'));
  document.querySelectorAll('.edge-path').forEach(el=> el.classList.remove('selected'));
  arr.forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.classList.add('selected');
  });
  updateSelectionStatus();
  renderSidebar();
}

const sbSelectionStat = document.getElementById('sb-selection-stat');
const sbCountSelected = document.getElementById('sb-count-selected');
function updateSelectionStatus(){
  const n = state.selectedNodeIds.length;
  sbCountSelected.textContent = n;
  sbSelectionStat.style.display = n > 1 ? 'inline-flex' : 'none';
}

function selectNode(nodeId){
  setSelectedNodes(nodeId ? [nodeId] : [], nodeId);
}

function toggleNodeInSelection(nodeId, additive){
  const arr = state.selectedNodeIds.slice();
  const idx = arr.indexOf(nodeId);
  if(additive){
    if(idx >= 0) arr.splice(idx, 1);
    else arr.push(nodeId);
  } else {
    if(idx >= 0 && arr.length > 1){
      // already in selection — keep selection but make it the primary
      return setSelectedNodes(arr, nodeId);
    } else {
      return selectNode(nodeId);
    }
  }
  setSelectedNodes(arr, arr.includes(nodeId) ? nodeId : (arr[0] || null));
}

function selectConnection(connId){
  state.selectedConnId = connId;
  state.selectedNodeId = null;
  state.selectedNodeIds = [];
  document.querySelectorAll('.node').forEach(el=> el.classList.remove('selected'));
  document.querySelectorAll('.edge-path').forEach(el=> el.classList.remove('selected'));
  if(connId){
    const el = document.getElementById('edge-' + connId);
    if(el) el.classList.add('selected');
  }
  renderSidebar();
}

function renderSidebar(){
  if(state.selectedConnId){
    const conn = state.connections.find(c=>c.id===state.selectedConnId);
    if(!conn){ sidebarContent.innerHTML = emptySidebarHtml(); return; }
    const fromNode = getNode(conn.fromNode);
    const toNode = getNode(conn.toNode);
    sidebarContent.innerHTML = `
      <div class="sb-body">
        <span class="sb-badge" style="background:rgba(255,255,255,0.08);color:var(--text-1);">${escapeHtml(t('sidebar.badge.connection'))}</span>
        <div class="sb-meta-row"><span>${escapeHtml(t('sidebar.meta.fromNode'))}</span><span>#${fromNode ? fromNode.seq : '?'} (${fromNode?typeBadgeLabel(fromNode.type):'?'})</span></div>
        <div class="sb-meta-row"><span>${escapeHtml(t('sidebar.meta.toNode'))}</span><span>#${toNode ? toNode.seq : '?'} (${toNode?typeBadgeLabel(toNode.type):'?'})</span></div>
        <div class="sb-meta-row"><span>${escapeHtml(t('sidebar.meta.connId'))}</span><span style="font-family:monospace;">${conn.id}</span></div>
        <div class="sb-delete-btn" id="sb-delete-conn">${escapeHtml(t('sidebar.deleteConn'))}</div>
      </div>
    `;
    document.getElementById('sb-delete-conn').addEventListener('click', ()=>{
      deleteConnection(conn.id);
      renderSidebar();
    });
    return;
  }

  if(!state.selectedNodeId){
    sidebarContent.innerHTML = emptySidebarHtml();
    return;
  }

  const n = getNode(state.selectedNodeId);
  if(!n){ sidebarContent.innerHTML = emptySidebarHtml(); return; }

  let badgeClass = n.type===NODE_TYPE.START?'badge-start':n.type===NODE_TYPE.DIALOGUE?'badge-dialogue':'badge-choice';

  let fieldsHtml = '';
  if(n.type === NODE_TYPE.START){
    fieldsHtml = `<div class="sb-meta-row"><span>${escapeHtml(t('sidebar.meta.startHint'))}</span><span>✓</span></div>`;
  } else if(n.type === NODE_TYPE.DIALOGUE){
    fieldsHtml = `
      <div class="sb-field">
        <label>${escapeHtml(t('sidebar.field.speaker'))}</label>
        <input type="text" id="sb-speaker" value="${escapeHtml(n.data.speaker)}">
      </div>
      <div class="sb-field">
        <label>${escapeHtml(t('sidebar.field.text'))}</label>
        <textarea id="sb-text">${escapeHtml(n.data.text)}</textarea>
      </div>
    `;
  } else if(n.type === NODE_TYPE.CHOICE){
    const optsHtml = n.data.options.map((o,i)=>`
      <div class="sb-field">
        <label>${escapeHtml(t('sidebar.field.opt', { n: i+1 }))}</label>
        <input type="text" data-sb-opt="${o.id}" value="${escapeHtml(o.text)}">
      </div>
    `).join('');
    fieldsHtml = `
      <div class="sb-field">
        <label>${escapeHtml(t('sidebar.field.prompt'))}</label>
        <input type="text" id="sb-prompt" value="${escapeHtml(n.data.prompt)}">
      </div>
      ${optsHtml}
    `;
  }

  sidebarContent.innerHTML = `
    <div class="sb-body">
      <span class="sb-badge ${badgeClass}">${typeBadgeLabel(n.type)} · #${n.seq}</span>
      ${fieldsHtml}
      <div class="sb-meta-row"><span>${escapeHtml(t('sidebar.meta.position'))}</span><span>x:${Math.round(n.x)} y:${Math.round(n.y)}</span></div>
      <div class="sb-meta-row"><span>${escapeHtml(t('sidebar.meta.nodeId'))}</span><span style="font-family:monospace;font-size:10.5px;">${n.id}</span></div>
      <div class="sb-delete-btn" id="sb-delete-node">${escapeHtml(t('sidebar.deleteNode'))}</div>
    </div>
  `;

  document.getElementById('sb-delete-node').addEventListener('click', ()=>{
    deleteNode(n.id);
  });

  if(n.type === NODE_TYPE.DIALOGUE){
    const speakerInput = document.getElementById('sb-speaker');
    const textArea = document.getElementById('sb-text');
    speakerInput.addEventListener('input', ()=>{
      n.data.speaker = speakerInput.value;
      syncNodeDomField(n.id, '.f-speaker', speakerInput.value);
    });
    textArea.addEventListener('input', ()=>{
      n.data.text = textArea.value;
      syncNodeDomField(n.id, '.f-text', textArea.value);
    });
  } else if(n.type === NODE_TYPE.CHOICE){
    const promptInput = document.getElementById('sb-prompt');
    promptInput.addEventListener('input', ()=>{
      n.data.prompt = promptInput.value;
      syncNodeDomField(n.id, '.f-prompt', promptInput.value);
    });
    sidebarContent.querySelectorAll('[data-sb-opt]').forEach(input=>{
      const optId = input.getAttribute('data-sb-opt');
      input.addEventListener('input', ()=>{
        const opt = n.data.options.find(o=>o.id===optId);
        if(opt) opt.text = input.value;
        const nodeEl = document.getElementById(n.id);
        if(nodeEl){
          const row = nodeEl.querySelector(`.choice-option-row[data-opt-id="${optId}"] .f-opt-text`);
          if(row) row.value = input.value;
        }
      });
    });
  }
}

function syncNodeDomField(nodeId, selector, value){
  const nodeEl = document.getElementById(nodeId);
  if(!nodeEl) return;
  const field = nodeEl.querySelector(selector);
  if(field) field.value = value;
}

function emptySidebarHtml(){
  return `<div class="sb-empty">${t('sidebar.empty')}</div>`;
}

/* =========================================================================
   工具栏功能
   ========================================================================= */
document.getElementById('btn-add-dialogue').addEventListener('click', ()=> addNode(NODE_TYPE.DIALOGUE));
document.getElementById('btn-add-choice').addEventListener('click', ()=> addNode(NODE_TYPE.CHOICE));

document.getElementById('btn-clear').addEventListener('click', ()=>{
  if(state.nodes.length === 0) return;
  if(!confirm(t('confirm.clearCanvas'))) return;
  clearCanvas();
  toastKey('toast.cleared');
});

function clearCanvas(){
  checkpoint();
  state.nodes = [];
  state.connections = [];
  state.selectedNodeId = null;
  state.selectedConnId = null;
  state.nextNodeSeq = 1;
  nodesLayer.innerHTML = '';
  edgesGroup.innerHTML = '';
  document.querySelectorAll('.edge-label').forEach(el=>el.remove());
  renderSidebar();
  if(typeof renderMinimap === 'function') renderMinimap();
  updateStatusBar();
  setDirty(); scheduleSave();
}

/* =========================================================================
   节点复制 (Duplicate)
   ========================================================================= */
function duplicateNode(nodeId){
  const src = getNode(nodeId);
  if(!src) return null;
  checkpoint();
  const newNode = createNodeData(src.type, src.x + 40, src.y + 40);
  // Copy data
  if(src.type === NODE_TYPE.START){
    newNode.data = { label: src.data.label };
  } else if(src.type === NODE_TYPE.DIALOGUE){
    newNode.data = { speaker: src.data.speaker, text: src.data.text };
  } else if(src.type === NODE_TYPE.CHOICE){
    newNode.data = {
      prompt: src.data.prompt,
      options: src.data.options.map(o => ({ id: genId('opt'), text: o.text }))
    };
  }
  state.nodes.push(newNode);
  renderNode(newNode);
  selectNode(newNode.id);
  if(typeof renderMinimap === 'function') renderMinimap();
  updateStatusBar();
  setDirty(); scheduleSave();
  toastKey('toast.duplicated');
  return newNode;
}

/* =========================================================================
   节点右键菜单 (Node context menu)
   ========================================================================= */
const nodeCtxMenu = document.getElementById('node-ctx-menu');
let nodeCtxTarget = null;

function openNodeCtxMenu(clientX, clientY, nodeId){
  nodeCtxTarget = nodeId;
  // Disable "Set as Start" if this node is already the start
  const n = getNode(nodeId);
  const setStartItem = nodeCtxMenu.querySelector('[data-node-ctx="set-start"]');
  if(setStartItem){
    setStartItem.classList.toggle('ctx-disabled', n && n.type === NODE_TYPE.START);
  }
  const menuW = 220, menuH = 130;
  let left = clientX, top = clientY;
  if(left + menuW > window.innerWidth) left = window.innerWidth - menuW - 8;
  if(top + menuH > window.innerHeight) top = window.innerHeight - menuH - 8;
  nodeCtxMenu.style.left = left + 'px';
  nodeCtxMenu.style.top  = top + 'px';
  nodeCtxMenu.classList.add('show');
}

function closeNodeCtxMenu(){
  nodeCtxMenu.classList.remove('show');
  nodeCtxTarget = null;
}

nodeCtxMenu.querySelectorAll('.ctx-item').forEach(item=>{
  item.addEventListener('click', ()=>{
    const action = item.getAttribute('data-node-ctx');
    if(!nodeCtxTarget) return;
    if(item.classList.contains('ctx-disabled')) return;
    if(action === 'duplicate'){
      duplicateNode(nodeCtxTarget);
    } else if(action === 'set-start'){
      convertToStart(nodeCtxTarget);
    } else if(action === 'delete'){
      deleteNode(nodeCtxTarget);
    }
    closeNodeCtxMenu();
  });
});

window.addEventListener('mousedown', (e)=>{
  if(nodeCtxMenu.classList.contains('show') && !nodeCtxMenu.contains(e.target)){
    closeNodeCtxMenu();
  }
});

function convertToStart(nodeId){
  const n = getNode(nodeId);
  if(!n) return;
  if(n.type === NODE_TYPE.START) return;
  checkpoint();
  // Remove all incoming connections to this node (start should have no inputs)
  state.connections = state.connections.filter(c => {
    if(c.toNode === nodeId){
      const el = document.getElementById('edge-' + c.id);
      if(el) el.remove();
      const arr = document.getElementById('arrow-' + c.id);
      if(arr) arr.remove();
      const hit = document.getElementById('hit-' + c.id);
      if(hit) hit.remove();
      const lbl = document.getElementById('edge-label-' + c.id);
      if(lbl) lbl.remove();
      return false;
    }
    return true;
  });
  // Demote any existing Start node into a Dialogue
  state.nodes.forEach(other=>{
    if(other.id !== nodeId && other.type === NODE_TYPE.START){
      other.type = NODE_TYPE.DIALOGUE;
      other.data = { speaker: other.data.label || t('default.speaker'), text: t('default.dialogueText') };
      const el = document.getElementById(other.id);
      if(el){
        el.classList.remove('type-start');
        el.classList.add('type-dialogue');
        el.innerHTML = buildNodeInnerHtml(other);
        attachNodeFieldHandlers(el, other);
        attachPortHandlers(el, other);
      }
    }
  });
  // Promote this node
  n.type = NODE_TYPE.START;
  n.data = { label: n.data.speaker || n.data.label || t('default.startLabel') };
  const el = document.getElementById(nodeId);
  if(el){
    el.classList.remove('type-dialogue', 'type-choice');
    el.classList.add('type-start');
    el.innerHTML = buildNodeInnerHtml(n);
    attachNodeFieldHandlers(el, n);
    attachPortHandlers(el, n);
  }
  refreshAllPortConnectedStates();
  updateAllConnections();
  renderSidebar();
  if(typeof renderMinimap === 'function') renderMinimap();
  updateStatusBar();
  setDirty(); scheduleSave();
}

document.getElementById('btn-fit').addEventListener('click', fitView);

function fitView(){
  if(state.nodes.length === 0){
    state.camera = { x: 0, y: 0, scale: 1 };
    applyCameraTransform();
    return;
  }
  let minX=Infinity, minY=Infinity, maxX=-Infinity, maxY=-Infinity;
  state.nodes.forEach(n=>{
    const el = document.getElementById(n.id);
    const w = el ? el.offsetWidth : 240;
    const h = el ? el.offsetHeight : 120;
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + w);
    maxY = Math.max(maxY, n.y + h);
  });
  const padding = 80;
  const contentW = (maxX - minX) + padding*2;
  const contentH = (maxY - minY) + padding*2;
  const rect = canvasWrap.getBoundingClientRect();
  const scaleX = rect.width / contentW;
  const scaleY = rect.height / contentH;
  let scale = Math.min(scaleX, scaleY, 1.4);
  scale = Math.max(0.2, Math.min(2.5, scale));

  const centerWorldX = (minX + maxX)/2;
  const centerWorldY = (minY + maxY)/2;

  state.camera.scale = scale;
  state.camera.x = rect.width/2 - centerWorldX * scale;
  state.camera.y = rect.height/2 - centerWorldY * scale;
  applyCameraTransform();
}

/* ---------------- Export ---------------- */
const exportModal = document.getElementById('export-modal');
const exportTextarea = document.getElementById('export-textarea');

document.getElementById('btn-export').addEventListener('click', ()=>{
  const json = serializeScript();
  exportTextarea.value = JSON.stringify(json, null, 2);
  exportModal.style.display = 'flex';
});
document.getElementById('export-modal-close').addEventListener('click', ()=> exportModal.style.display='none');
exportModal.addEventListener('mousedown', (e)=>{ if(e.target === exportModal) exportModal.style.display='none'; });

document.getElementById('btn-copy-json').addEventListener('click', async ()=>{
  try{
    await navigator.clipboard.writeText(exportTextarea.value);
    toastKey('export.copied');
  }catch(e){
    exportTextarea.select();
    document.execCommand('copy');
    toastKey('export.copied');
  }
});

document.getElementById('btn-download-json').addEventListener('click', ()=>{
  const blob = new Blob([exportTextarea.value], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = currentLang === 'en-US' ? 'dialogue_script.json' : 'dialogue_script.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toastKey('export.downloaded');
});

function serializeScript(){
  const nodes = state.nodes.map(n=>{
    const base = { id: n.id, type: n.type, position: { x: Math.round(n.x), y: Math.round(n.y) } };
    if(n.type === NODE_TYPE.START){
      base.fields = { label: n.data.label };
    } else if(n.type === NODE_TYPE.DIALOGUE){
      base.fields = { speaker: n.data.speaker, text: n.data.text };
    } else if(n.type === NODE_TYPE.CHOICE){
      base.fields = {
        prompt: n.data.prompt,
        options: n.data.options.map(o=>({ id: o.id, text: o.text }))
      };
    }
    return base;
  });

  const connections = state.connections.map(c=>({
    id: c.id,
    from: { node: c.fromNode, port: c.fromPort },
    to: { node: c.toNode }
  }));

  return {
    meta: {
      format: 'node-narrative-script',
      version: '1.0',
      exportedAt: new Date().toISOString()
    },
    nodes,
    connections
  };
}

/* ---------------- Import ---------------- */
const fileInput = document.getElementById('file-input');
document.getElementById('btn-import').addEventListener('click', ()=> fileInput.click());
fileInput.addEventListener('change', (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (ev)=>{
    try{
      const json = JSON.parse(ev.target.result);
      loadScriptFromJson(json);
      toastKey('toast.imported');
    }catch(err){
      alert(t('alert.parseFail', { msg: err.message }));
    }
  };
  reader.readAsText(file);
  fileInput.value = '';
});

function loadScriptFromJson(json){
  if(!json || !Array.isArray(json.nodes)){
    alert(t('alert.badFormat'));
    return;
  }
  clearCanvas();

  let maxSeq = 0;
  json.nodes.forEach((raw, idx)=>{
    const type = raw.type;
    if(![NODE_TYPE.START, NODE_TYPE.DIALOGUE, NODE_TYPE.CHOICE].includes(type)) return;
    const seq = state.nextNodeSeq++;
    maxSeq = Math.max(maxSeq, seq);
    const pos = raw.position || { x: 100 + idx*40, y: 100 + idx*40 };
    let data;
    if(type === NODE_TYPE.START){
      data = { label: raw.fields?.label ?? t('default.startLabel') };
    } else if(type === NODE_TYPE.DIALOGUE){
      data = { speaker: raw.fields?.speaker ?? t('default.speaker'), text: raw.fields?.text ?? '' };
    } else {
      const opts = Array.isArray(raw.fields?.options) && raw.fields.options.length > 0
        ? raw.fields.options.map(o=>({ id: o.id || genId('opt'), text: o.text ?? '' }))
        : [{ id: genId('opt'), text: t('default.choiceOption', { n: 1 }) }];
      data = { prompt: raw.fields?.prompt ?? t('default.choicePrompt'), options: opts };
    }
    const nodeData = { id: raw.id || genId('node'), type, x: pos.x, y: pos.y, seq, data };
    state.nodes.push(nodeData);
    renderNode(nodeData);
  });

  if(Array.isArray(json.connections)){
    json.connections.forEach(raw=>{
      const fromNode = raw.from?.node;
      const fromPort = raw.from?.port;
      const toNode = raw.to?.node;
      if(!fromNode || !toNode || !fromPort) return;
      if(!getNode(fromNode) || !getNode(toNode)) return;
      const conn = { id: raw.id || genId('conn'), fromNode, fromPort, toNode };
      state.connections.push(conn);
      renderConnection(conn);
      addEdgeLabel(conn);
    });
  }

  refreshAllPortConnectedStates();
  updateStatusBar();
  setDirty(); scheduleSave();
  requestAnimationFrame(()=>{
    updateAllConnections();
    fitView();
    renderMinimap();
  });
}

/* =========================================================================
   右键快捷菜单 (Context Menu)
   ========================================================================= */
const contextMenu = document.getElementById('context-menu');
const ctxItemsEl = document.getElementById('ctx-items');
const ctxSearchInput = document.getElementById('ctx-search-input');
let ctxWorldPos = { x: 0, y: 0 };
let ctxHighlightIdx = 0;

const CTX_ACTIONS = [
  { key: 'dialogue', label: ()=> t('ctx.dialogue'), cls: 'ctx-dialogue', action: ()=> addNode(NODE_TYPE.DIALOGUE, ctxWorldPos) },
  { key: 'choice',   label: ()=> t('ctx.choice'),   cls: 'ctx-choice',   action: ()=> addNode(NODE_TYPE.CHOICE, ctxWorldPos) }
];

function openContextMenu(clientX, clientY){
  ctxWorldPos = screenToWorld(clientX, clientY);

  // clamp menu inside viewport
  const menuW = 236, menuH = 160;
  let left = clientX, top = clientY;
  if(left + menuW > window.innerWidth) left = window.innerWidth - menuW - 8;
  if(top + menuH > window.innerHeight) top = window.innerHeight - menuH - 8;

  contextMenu.style.left = left + 'px';
  contextMenu.style.top = top + 'px';
  contextMenu.classList.add('show');

  ctxSearchInput.value = '';
  ctxHighlightIdx = 0;
  renderCtxItems('');
  setTimeout(()=> ctxSearchInput.focus(), 0);
}

function closeContextMenu(){
  contextMenu.classList.remove('show');
}

function renderCtxItems(filter){
  const f = filter.trim().toLowerCase();
  const filtered = CTX_ACTIONS.filter(a => {
    const lbl = typeof a.label === 'function' ? a.label() : a.label;
    return lbl.toLowerCase().includes(f) || a.key.includes(f);
  });

  if(filtered.length === 0){
    ctxItemsEl.innerHTML = `<div class="ctx-empty-hint">${escapeHtml(t('ctx.emptyHint'))}</div>`;
    return;
  }

  ctxItemsEl.innerHTML = filtered.map((a, i)=>`
    <div class="ctx-item ${a.cls} ${i===ctxHighlightIdx?'ctx-highlight':''}" data-ctx-key="${a.key}">
      <span class="ctx-icon"></span><span>${escapeHtml(typeof a.label === 'function' ? a.label() : a.label)}</span>
    </div>
  `).join('');

  ctxItemsEl.querySelectorAll('.ctx-item').forEach(el=>{
    el.addEventListener('click', ()=>{
      const key = el.getAttribute('data-ctx-key');
      const found = CTX_ACTIONS.find(a=>a.key===key);
      if(found){ found.action(); }
      closeContextMenu();
    });
    el.addEventListener('mouseenter', ()=>{
      ctxItemsEl.querySelectorAll('.ctx-item').forEach(x=>x.classList.remove('ctx-highlight'));
      el.classList.add('ctx-highlight');
    });
  });

  ctxItemsEl._filtered = filtered;
}

ctxSearchInput.addEventListener('input', ()=>{
  ctxHighlightIdx = 0;
  renderCtxItems(ctxSearchInput.value);
});

ctxSearchInput.addEventListener('keydown', (e)=>{
  const filtered = ctxItemsEl._filtered || [];
  if(e.key === 'ArrowDown'){
    e.preventDefault();
    ctxHighlightIdx = Math.min(ctxHighlightIdx + 1, filtered.length - 1);
    renderCtxItems(ctxSearchInput.value);
  } else if(e.key === 'ArrowUp'){
    e.preventDefault();
    ctxHighlightIdx = Math.max(ctxHighlightIdx - 1, 0);
    renderCtxItems(ctxSearchInput.value);
  } else if(e.key === 'Enter'){
    e.preventDefault();
    const found = filtered[ctxHighlightIdx];
    if(found){ found.action(); }
    closeContextMenu();
  } else if(e.key === 'Escape'){
    closeContextMenu();
  }
});

window.addEventListener('mousedown', (e)=>{
  if(contextMenu.classList.contains('show') && !contextMenu.contains(e.target)){
    closeContextMenu();
  }
});
window.addEventListener('blur', closeContextMenu);
canvasWrap.addEventListener('wheel', closeContextMenu);

/* =========================================================================
   右下角小地图 (Minimap)
   ========================================================================= */
const minimapCanvas = document.getElementById('minimap-canvas');
const minimapCtx = minimapCanvas.getContext('2d');
const MINIMAP_W = 200, MINIMAP_H = 120;
const MINIMAP_PADDING = 14;

function getWorldBounds(){
  if(state.nodes.length === 0){
    return { minX:-400, minY:-300, maxX:400, maxY:300 };
  }
  let minX=Infinity, minY=Infinity, maxX=-Infinity, maxY=-Infinity;
  state.nodes.forEach(n=>{
    const el = document.getElementById(n.id);
    const w = el ? el.offsetWidth : 240;
    const h = el ? el.offsetHeight : 120;
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + w);
    maxY = Math.max(maxY, n.y + h);
  });
  // also make sure current viewport is included so the highlight rect never clips off
  const rect = canvasWrap.getBoundingClientRect();
  const vpTL = screenToWorld(rect.left, rect.top);
  const vpBR = screenToWorld(rect.left + rect.width, rect.top + rect.height);
  minX = Math.min(minX, vpTL.x);
  minY = Math.min(minY, vpTL.y);
  maxX = Math.max(maxX, vpBR.x);
  maxY = Math.max(maxY, vpBR.y);
  return { minX, minY, maxX, maxY };
}

function nodeMinimapColor(type){
  if(type===NODE_TYPE.START) return '#fbbf24';
  if(type===NODE_TYPE.DIALOGUE) return '#ff9a3c';
  if(type===NODE_TYPE.CHOICE) return '#ff6b8a';
  return '#8992ac';
}

let minimapScaleInfo = { scale:1, offsetX:0, offsetY:0, bounds:null };

function renderMinimap(){
  minimapCtx.clearRect(0,0,MINIMAP_W,MINIMAP_H);

  const bounds = getWorldBounds();
  const worldW = Math.max(bounds.maxX - bounds.minX, 1);
  const worldH = Math.max(bounds.maxY - bounds.minY, 1);

  const availW = MINIMAP_W - MINIMAP_PADDING*2;
  const availH = MINIMAP_H - MINIMAP_PADDING*2;
  const scale = Math.min(availW / worldW, availH / worldH);

  const offsetX = MINIMAP_PADDING + (availW - worldW*scale)/2 - bounds.minX*scale;
  const offsetY = MINIMAP_PADDING + (availH - worldH*scale)/2 - bounds.minY*scale;

  minimapScaleInfo = { scale, offsetX, offsetY, bounds };

  // draw nodes
  state.nodes.forEach(n=>{
    const el = document.getElementById(n.id);
    const w = el ? el.offsetWidth : 240;
    const h = el ? el.offsetHeight : 120;
    const x = n.x*scale + offsetX;
    const y = n.y*scale + offsetY;
    const rw = Math.max(w*scale, 3);
    const rh = Math.max(h*scale, 3);
    minimapCtx.fillStyle = nodeMinimapColor(n.type);
    minimapCtx.globalAlpha = 0.85;
    roundRectPath(minimapCtx, x, y, rw, rh, 1.5);
    minimapCtx.fill();
  });
  minimapCtx.globalAlpha = 1;

  // draw connections (subtle lines)
  minimapCtx.strokeStyle = 'rgba(140,146,172,0.5)';
  minimapCtx.lineWidth = 0.6;
  state.connections.forEach(c=>{
    const fn = getNode(c.fromNode), tn = getNode(c.toNode);
    if(!fn || !tn) return;
    const x1 = (fn.x+20)*scale + offsetX, y1 = (fn.y+20)*scale + offsetY;
    const x2 = (tn.x+20)*scale + offsetX, y2 = (tn.y+20)*scale + offsetY;
    minimapCtx.beginPath();
    minimapCtx.moveTo(x1,y1);
    minimapCtx.lineTo(x2,y2);
    minimapCtx.stroke();
  });

  // draw viewport rectangle
  const rect = canvasWrap.getBoundingClientRect();
  const vpTL = screenToWorld(rect.left, rect.top);
  const vpBR = screenToWorld(rect.left + rect.width, rect.top + rect.height);
  const vx = vpTL.x*scale + offsetX;
  const vy = vpTL.y*scale + offsetY;
  const vw = (vpBR.x - vpTL.x)*scale;
  const vh = (vpBR.y - vpTL.y)*scale;

  minimapCtx.strokeStyle = '#ff9a3c';
  minimapCtx.lineWidth = 1.4;
  minimapCtx.fillStyle = 'rgba(255,154,60,0.08)';
  minimapCtx.fillRect(vx, vy, vw, vh);
  minimapCtx.strokeRect(vx, vy, vw, vh);
}

function roundRectPath(ctx, x, y, w, h, r){
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.arcTo(x+w, y, x+w, y+h, r);
  ctx.arcTo(x+w, y+h, x, y+h, r);
  ctx.arcTo(x, y+h, x, y, r);
  ctx.arcTo(x, y, x+w, y, r);
  ctx.closePath();
}

let minimapDragging = false;

minimapCanvas.addEventListener('mousedown', (e)=>{
  minimapDragging = true;
  panViewportToMinimapPoint(e);
  e.preventDefault();
});
window.addEventListener('mousemove', (e)=>{
  if(minimapDragging) panViewportToMinimapPoint(e);
});
window.addEventListener('mouseup', ()=>{ minimapDragging = false; });

function panViewportToMinimapPoint(e){
  const rect = minimapCanvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const { scale, offsetX, offsetY } = minimapScaleInfo;
  // convert minimap pixel -> world coord
  const worldX = (mx - offsetX) / scale;
  const worldY = (my - offsetY) / scale;

  const cw = canvasWrap.getBoundingClientRect();
  // center viewport on that world point
  state.camera.x = cw.width/2 - worldX * state.camera.scale;
  state.camera.y = cw.height/2 - worldY * state.camera.scale;
  applyCameraTransform();
  renderMinimap();
}

/* =========================================================================
   预览剧本 (Interactive Play Mode)
   ========================================================================= */
const playOverlay = document.getElementById('play-overlay');
const playSpeakerEl = document.getElementById('play-speaker');
const playTextEl = document.getElementById('play-text');
const playChoicesEl = document.getElementById('play-choices');
const playDialogueBox = document.getElementById('play-dialogue-box');
const playContinueHint = document.getElementById('play-continue-hint');
const playEndPanel = document.getElementById('play-end-panel');

let playState = {
  currentNodeId: null,
  typing: false,
  typeTimer: null,
  fullText: '',
  charIndex: 0
};

function getOutgoingConnections(nodeId, portId){
  return state.connections.filter(c => c.fromNode === nodeId && (portId === undefined || c.fromPort === portId));
}

function findFirstStartNode(){
  return state.nodes.find(n => n.type === NODE_TYPE.START);
}

document.getElementById('btn-play').addEventListener('click', startPlayMode);
document.getElementById('play-exit-btn').addEventListener('click', exitPlayMode);
document.getElementById('btn-play-exit-2').addEventListener('click', exitPlayMode);
document.getElementById('btn-play-restart').addEventListener('click', startPlayMode);

function startPlayMode(){
  const startNode = findFirstStartNode();
  if(!startNode){
    toastKey('toast.noStart');
    return;
  }
  const firstConns = getOutgoingConnections(startNode.id, 'out');
  if(firstConns.length === 0){
    toastKey('toast.noConn');
    return;
  }

  playOverlay.classList.add('show');
  playEndPanel.classList.remove('show');
  playChoicesEl.classList.remove('show');
  playDialogueBox.style.display = 'flex';

  goToNode(firstConns[0].toNode);
}

function exitPlayMode(){
  clearTimeout(playState.typeTimer);
  playOverlay.classList.remove('show');
  playState.currentNodeId = null;
}

function goToNode(nodeId){
  const node = getNode(nodeId);
  if(!node){
    showEndPanel();
    return;
  }
  playState.currentNodeId = nodeId;

  if(node.type === NODE_TYPE.DIALOGUE){
    renderPlayDialogue(node);
  } else if(node.type === NODE_TYPE.CHOICE){
    renderPlayChoice(node);
  } else if(node.type === NODE_TYPE.START){
    // shouldn't normally re-enter Start, but handle gracefully by following its output
    const conns = getOutgoingConnections(node.id, 'out');
    if(conns.length > 0) goToNode(conns[0].toNode);
    else showEndPanel();
  }
}

function renderPlayDialogue(node){
  playChoicesEl.classList.remove('show');
  playChoicesEl.innerHTML = '';
  playEndPanel.classList.remove('show');
  playDialogueBox.style.display = 'flex';

  playSpeakerEl.textContent = node.data.speaker || '';
  startTypewriter(node.data.text || '');

  // clicking the dialogue box advances (once typing finished) to next node
  playDialogueBox.onclick = ()=> advanceFromDialogue(node);
}

function advanceFromDialogue(node){
  if(playState.typing){
    // skip to full text instantly
    finishTypewriterInstantly();
    return;
  }
  const conns = getOutgoingConnections(node.id, 'out');
  if(conns.length === 0){
    showEndPanel();
    return;
  }
  goToNode(conns[0].toNode);
}

function startTypewriter(text){
  clearTimeout(playState.typeTimer);
  playState.fullText = text;
  playState.charIndex = 0;
  playState.typing = true;
  playContinueHint.classList.remove('show');
  playTextEl.innerHTML = '<span class="caret"></span>';

  typeNextChar();
}

function typeNextChar(){
  if(playState.charIndex >= playState.fullText.length){
    finishTypewriterInstantly();
    return;
  }
  playState.charIndex++;
  const shown = escapeHtml(playState.fullText.slice(0, playState.charIndex));
  playTextEl.innerHTML = shown + '<span class="caret"></span>';
  playState.typeTimer = setTimeout(typeNextChar, 26);
}

function finishTypewriterInstantly(){
  clearTimeout(playState.typeTimer);
  playState.charIndex = playState.fullText.length;
  playTextEl.innerHTML = escapeHtml(playState.fullText);
  playState.typing = false;
  playContinueHint.classList.add('show');
}

function renderPlayChoice(node){
  playDialogueBox.style.display = 'none';
  playEndPanel.classList.remove('show');

  const options = node.data.options || [];
  const validOptions = options.filter(opt => getOutgoingConnections(node.id, opt.id).length > 0);

  if(validOptions.length === 0){
    showEndPanel();
    return;
  }

  playChoicesEl.innerHTML = validOptions.map((opt, i)=>`
    <div class="play-choice-btn" data-opt-id="${opt.id}">
      <span class="choice-index">${i+1}.</span>${escapeHtml(opt.text || t('default.choiceOption', { n: i+1 }))}
    </div>
  `).join('');
  playChoicesEl.classList.add('show');

  playChoicesEl.querySelectorAll('.play-choice-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const optId = btn.getAttribute('data-opt-id');
      const conns = getOutgoingConnections(node.id, optId);
      if(conns.length === 0){ showEndPanel(); return; }
      goToNode(conns[0].toNode);
    });
  });

  // show the prompt text (if any) inside the dialogue-box-less area using speaker/text style briefly
  if(node.data.prompt){
    playDialogueBox.style.display = 'flex';
    playSpeakerEl.textContent = '';
    playTextEl.innerHTML = escapeHtml(node.data.prompt);
    playContinueHint.classList.remove('show');
    playDialogueBox.onclick = null;
  }
}

function showEndPanel(){
  playChoicesEl.classList.remove('show');
  playDialogueBox.style.display = 'none';
  playEndPanel.classList.add('show');
}

/* =========================================================================
   默认模板 (Built-in Templates)
   ========================================================================= */
const BUILTIN_TEMPLATES = [
  {
    key: 'blank-start',
    icon: '⬜',
    titleKey: 'tpl.blank-start.title',
    descKey:  'tpl.blank-start.desc',
    tagKeys:  ['tpl.blank-start.tags.0', 'tpl.blank-start.tags.1'],
    build: function(){
      return {
        meta: { format:'node-narrative-script', version:'1.0' },
        nodes: [
          { id:'n_start', type:'start', position:{x:-160,y:0}, fields:{ label:t('default.startLabel') } }
        ],
        connections: []
      };
    }
  },
  {
    key: 'linear-dialogue',
    icon: '💬',
    titleKey: 'tpl.linear-dialogue.title',
    descKey:  'tpl.linear-dialogue.desc',
    tagKeys:  ['tpl.linear-dialogue.tags.0', 'tpl.linear-dialogue.tags.1'],
    build: function(){
      return {
        meta: { format:'node-narrative-script', version:'1.0' },
        nodes: [
          { id:'n_start', type:'start', position:{x:-360,y:40}, fields:{ label:t('default.startLabel') } },
          { id:'n_d1', type:'dialogue', position:{x:-100,y:0}, fields:{ speaker:'旅人', text:'终于走到了这座古老的城镇……' } },
          { id:'n_d2', type:'dialogue', position:{x:220,y:0}, fields:{ speaker:'守卫', text:'站住！外来者，报上你的名字。' } },
          { id:'n_d3', type:'dialogue', position:{x:540,y:0}, fields:{ speaker:'旅人', text:'我只是一个赶路的商人，并无恶意。' } }
        ],
        connections: [
          { id:'c1', from:{node:'n_start', port:'out'}, to:{node:'n_d1'} },
          { id:'c2', from:{node:'n_d1', port:'out'}, to:{node:'n_d2'} },
          { id:'c3', from:{node:'n_d2', port:'out'}, to:{node:'n_d3'} }
        ]
      };
    }
  },
  {
    key: 'branching-choice',
    icon: '🔀',
    titleKey: 'tpl.branching-choice.title',
    descKey:  'tpl.branching-choice.desc',
    tagKeys:  ['tpl.branching-choice.tags.0', 'tpl.branching-choice.tags.1'],
    build: function(){
      return {
        meta: { format:'node-narrative-script', version:'1.0' },
        nodes: [
          { id:'n_start', type:'start', position:{x:-420,y:60}, fields:{ label:t('default.startLabel') } },
          { id:'n_d1', type:'dialogue', position:{x:-160,y:20}, fields:{ speaker:'神秘老人', text:'孩子，前方有两条路，一条通向荣耀，一条通向未知。' } },
          { id:'n_choice', type:'choice', position:{x:180,y:20}, fields:{
              prompt:'你选择哪条路？',
              options:[
                { id:'opt_glory', text:'走向荣耀之路' },
                { id:'opt_unknown', text:'走向未知之路' }
              ]
            }
          },
          { id:'n_glory', type:'dialogue', position:{x:520,y:-140}, fields:{ speaker:'旁白', text:'你选择了荣耀之路，最终成为了传说中的英雄。' } },
          { id:'n_unknown', type:'dialogue', position:{x:520,y:180}, fields:{ speaker:'旁白', text:'你选择了未知之路，命运从此变得扑朔迷离……' } }
        ],
        connections: [
          { id:'c1', from:{node:'n_start', port:'out'}, to:{node:'n_d1'} },
          { id:'c2', from:{node:'n_d1', port:'out'}, to:{node:'n_choice'} },
          { id:'c3', from:{node:'n_choice', port:'opt_glory'}, to:{node:'n_glory'} },
          { id:'c4', from:{node:'n_choice', port:'opt_unknown'}, to:{node:'n_unknown'} }
        ]
      };
    }
  },
  {
    key: 'shop-npc',
    icon: '🛒',
    titleKey: 'tpl.shop-npc.title',
    descKey:  'tpl.shop-npc.desc',
    tagKeys:  ['tpl.shop-npc.tags.0', 'tpl.shop-npc.tags.1'],
    build: function(){
      return {
        meta: { format:'node-narrative-script', version:'1.0' },
        nodes: [
          { id:'n_start', type:'start', position:{x:-460,y:80}, fields:{ label:t('default.startLabel') } },
          { id:'n_greet', type:'dialogue', position:{x:-200,y:40}, fields:{ speaker:'杂货商人', text:'欢迎光临！今天想看点什么？' } },
          { id:'n_choice', type:'choice', position:{x:120,y:40}, fields:{
              prompt:'你想做什么？',
              options:[
                { id:'opt_buy', text:'查看商品' },
                { id:'opt_chat', text:'闲聊几句' },
                { id:'opt_leave', text:'转身离开' }
              ]
            }
          },
          { id:'n_buy', type:'dialogue', position:{x:460,y:-160}, fields:{ speaker:'杂货商人', text:'这把铁剑只要 50 金币，绝对物超所值！' } },
          { id:'n_chat', type:'dialogue', position:{x:460,y:40}, fields:{ speaker:'杂货商人', text:'最近山里出现了奇怪的怪物，最好小心行事。' } },
          { id:'n_leave', type:'dialogue', position:{x:460,y:230}, fields:{ speaker:'旁白', text:'你摇了摇头，转身离开了商店。' } }
        ],
        connections: [
          { id:'c1', from:{node:'n_start', port:'out'}, to:{node:'n_greet'} },
          { id:'c2', from:{node:'n_greet', port:'out'}, to:{node:'n_choice'} },
          { id:'c3', from:{node:'n_choice', port:'opt_buy'}, to:{node:'n_buy'} },
          { id:'c4', from:{node:'n_choice', port:'opt_chat'}, to:{node:'n_chat'} },
          { id:'c5', from:{node:'n_choice', port:'opt_leave'}, to:{node:'n_leave'} }
        ]
      };
    }
  }
];

const templateModal = document.getElementById('template-modal');
const templateGrid = document.getElementById('template-grid');

function renderTemplateGrid(){
  templateGrid.innerHTML = BUILTIN_TEMPLATES.map(t=>`
    <div class="template-card" data-tpl-key="${t.key}">
      <div class="tpl-icon">${t.icon}</div>
      <div class="tpl-title">${escapeHtml(t(t.titleKey))}</div>
      <div class="tpl-desc">${escapeHtml(t(t.descKey))}</div>
      <div class="tpl-meta">${t.tagKeys.map(tagKey=>`<span class="tpl-tag">${escapeHtml(t(tagKey))}</span>`).join('')}</div>
    </div>
  `).join('');

  templateGrid.querySelectorAll('.template-card').forEach(card=>{
    card.addEventListener('click', ()=>{
      const key = card.getAttribute('data-tpl-key');
      const tpl = BUILTIN_TEMPLATES.find(t=>t.key===key);
      if(!tpl) return;
      const title = window.t(tpl.titleKey);
      if(state.nodes.length > 0){
        const ok = confirm(t('confirm.loadTemplate', { title }));
        if(!ok) return;
      }
      loadScriptFromJson(tpl.build());
      templateModal.style.display = 'none';
      toastKey('toast.templateLoaded', { title });
    });
  });
}

document.getElementById('btn-templates').addEventListener('click', ()=>{
  renderTemplateGrid();
  templateModal.style.display = 'flex';
});
document.getElementById('template-modal-close').addEventListener('click', ()=> templateModal.style.display='none');
templateModal.addEventListener('mousedown', (e)=>{ if(e.target === templateModal) templateModal.style.display='none'; });

/* =========================================================================
   快捷键帮助 & 自动保存恢复
   ========================================================================= */
const shortcutsModal = document.getElementById('shortcuts-modal');
const shortcutsList  = document.getElementById('shortcuts-list');
const isMac = navigator.platform.toUpperCase().includes('MAC');
const MOD = isMac ? '⌘' : 'Ctrl';

const SHORTCUT_ROWS = [
  { keys: [MOD, 'Z'],              descKey: 'shortcuts.desc.undo' },
  { keys: [MOD, 'Shift', 'Z'],     descKey: 'shortcuts.desc.redo' },
  { keys: [MOD, 'D'],              descKey: 'shortcuts.desc.duplicate' },
  { keys: [MOD, 'Shift', 'F'],     descKey: 'shortcuts.desc.search' },
  { keys: ['Delete'],              descKey: 'shortcuts.desc.delete' },
  { keys: [MOD, '0'],              descKey: 'shortcuts.desc.fitView' },
  { keys: [MOD, 'P'],              descKey: 'shortcuts.desc.play' },
  { keys: ['?'],                   descKey: 'shortcuts.desc.help' },
  { keys: ['Esc'],                 descKey: 'shortcuts.desc.escape' },
];

function openShortcutsModal(){
  shortcutsList.innerHTML = SHORTCUT_ROWS.map(row=>`
    <div class="shortcut-row">
      <div class="sc-desc">${escapeHtml(t(row.descKey))}</div>
      <div class="sc-keys">${row.keys.map(k=>`<kbd>${escapeHtml(k)}</kbd>`).join('')}</div>
    </div>
  `).join('');
  shortcutsModal.style.display = 'flex';
}
document.getElementById('shortcuts-modal-close').addEventListener('click', ()=>{
  shortcutsModal.style.display = 'none';
});
shortcutsModal.addEventListener('mousedown', (e)=>{
  if(e.target === shortcutsModal) shortcutsModal.style.display = 'none';
});

// Cmd/Ctrl+0 = fit view, Cmd/Ctrl+P = play (extra shortcuts)
window.addEventListener('keydown', (e)=>{
  const mod = e.metaKey || e.ctrlKey;
  if(mod && e.key === '0' && !isTypingTarget(e.target)){
    e.preventDefault();
    fitView();
  }
  if(mod && (e.key === 'p' || e.key === 'P') && !isTypingTarget(e.target)){
    e.preventDefault();
    const btn = document.getElementById('btn-play');
    if(btn) btn.click();
  }
});

// Recovery modal flow
const recoveryModal = document.getElementById('recovery-modal');
const recoveryMeta  = document.getElementById('recovery-meta');

document.getElementById('btn-recovery-discard').addEventListener('click', ()=>{
  clearSavedDraft();
  recoveryModal.style.display = 'none';
});

document.getElementById('btn-recovery-restore').addEventListener('click', ()=>{
  const saved = readSavedDraft();
  if(saved && saved.data){
    restoreSnapshot(JSON.stringify(saved.data));
    toastKey('toast.restored');
  }
  recoveryModal.style.display = 'none';
});

/* =========================================================================
   校验 (Validation)
   ========================================================================= */
const validationBtn = document.getElementById('sb-validation-btn');
const issueCountEl = document.getElementById('sb-issue-count');
const validationPopover = document.getElementById('validation-popover');
const validationList = document.getElementById('validation-list');

function computeValidation(){
  const issues = [];
  const starts = state.nodes.filter(n => n.type === NODE_TYPE.START);
  if(starts.length === 0){
    issues.push({ severity:'error', key:'validation.noStart', nodeId:null });
  } else if(starts.length > 1){
    issues.push({ severity:'warn', key:'validation.multipleStart', nodeIds: starts.map(n => n.id) });
  }
  // Orphans: nodes (non-start) without incoming connection
  state.nodes.forEach(n=>{
    if(n.type === NODE_TYPE.START) return;
    const incoming = state.connections.some(c => c.toNode === n.id);
    if(!incoming){
      issues.push({ severity:'warn', key:'validation.orphan', nodeId: n.id });
    }
  });
  // Dangling choice options
  state.nodes.forEach(n=>{
    if(n.type !== NODE_TYPE.CHOICE) return;
    (n.data.options || []).forEach(opt=>{
      const out = state.connections.some(c => c.fromNode === n.id && c.fromPort === opt.id);
      if(!out){
        issues.push({ severity:'warn', key:'validation.danglingOpt', nodeId: n.id, optId: opt.id });
      }
    });
  });
  // Unreachable from Start (BFS)
  if(starts.length > 0){
    const reached = new Set();
    const queue = [starts[0].id];
    reached.add(starts[0].id);
    while(queue.length){
      const cur = queue.shift();
      state.connections.forEach(c=>{
        if(c.fromNode === cur && !reached.has(c.toNode)){
          reached.add(c.toNode);
          queue.push(c.toNode);
        }
      });
    }
    state.nodes.forEach(n=>{
      if(n.type === NODE_TYPE.START) return;
      if(!reached.has(n.id)){
        issues.push({ severity:'warn', key:'validation.unreachable', nodeId: n.id });
      }
    });
  }
  return issues;
}

function renderValidation(){
  const issues = computeValidation();
  issueCountEl.textContent = issues.length;
  validationBtn.classList.toggle('ok', issues.length === 0);
  validationBtn.classList.toggle('warn', issues.length > 0);
  if(issues.length === 0){
    validationList.innerHTML = `<div class="validation-row"><span class="v-msg">${escapeHtml(t('validation.empty'))}</span></div>`;
  } else {
    validationList.innerHTML = issues.map((iss, i)=>`
      <div class="validation-row">
        <span class="v-sev ${iss.severity}"></span>
        <span class="v-msg">${escapeHtml(t(iss.key))}</span>
        ${iss.nodeId ? `<button class="v-jump" data-issue-idx="${i}" data-i18n="validation.jumpTo">${escapeHtml(t('validation.jumpTo'))}</button>` : ''}
      </div>
    `).join('') + `<div class="validation-row" style="color:var(--text-2);font-size:11px;">${escapeHtml(t('validation.summary', { n: issues.length }))}</div>`;
  }
  // Wire up jump buttons (re-query each time since list is re-rendered)
  validationList.querySelectorAll('.v-jump').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const idx = +btn.getAttribute('data-issue-idx');
      const iss = issues[idx];
      const targetId = iss.nodeId || (iss.nodeIds && iss.nodeIds[0]);
      if(targetId){ jumpToNode(targetId); }
      validationPopover.style.display = 'none';
    });
  });
}

function jumpToNode(nodeId){
  const n = getNode(nodeId);
  if(!n) return;
  selectNode(nodeId);
  // Frame the node: place viewport center on node
  const rect = canvasWrap.getBoundingClientRect();
  state.camera.scale = Math.max(state.camera.scale, 1);
  state.camera.x = rect.width/2 - (n.x + 120) * state.camera.scale;
  state.camera.y = rect.height/2 - (n.y + 40)  * state.camera.scale;
  applyCameraTransform();
  // Briefly highlight the node
  const el = document.getElementById(nodeId);
  if(el){
    el.classList.add('flash-attention');
    setTimeout(()=> el.classList.remove('flash-attention'), 1200);
  }
}

validationBtn.addEventListener('click', (e)=>{
  e.stopPropagation();
  if(validationPopover.style.display === 'block'){
    validationPopover.style.display = 'none';
    return;
  }
  renderValidation();
  const rect = validationBtn.getBoundingClientRect();
  const popW = 380;
  let left = rect.right - popW;
  let top = rect.top - 8;
  validationPopover.style.left = Math.max(8, left) + 'px';
  validationPopover.style.top  = (top - validationPopover.offsetHeight) + 'px';
  // The above places it above the button — flip if too close to top
  if(parseFloat(validationPopover.style.top) < 8){
    validationPopover.style.top = (rect.bottom + 8) + 'px';
  }
  validationPopover.style.display = 'block';
});
window.addEventListener('mousedown', (e)=>{
  if(validationPopover.style.display === 'block' && !validationPopover.contains(e.target) && e.target !== validationBtn){
    validationPopover.style.display = 'none';
  }
});

/* =========================================================================
   节点搜索面板 (Search palette)
   ========================================================================= */
const searchPalette = document.getElementById('search-palette');
const searchInput   = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
let searchHits = [];
let searchIdx = 0;

function nodeSearchText(n){
  if(n.type === NODE_TYPE.START) return n.data.label || '';
  if(n.type === NODE_TYPE.DIALOGUE) return (n.data.speaker || '') + ' ' + (n.data.text || '');
  if(n.type === NODE_TYPE.CHOICE) return (n.data.prompt || '') + ' ' + (n.data.options || []).map(o => o.text || '').join(' ');
  return '';
}

function nodeTitle(n){
  if(n.type === NODE_TYPE.START) return n.data.label || t('node.title.start');
  if(n.type === NODE_TYPE.DIALOGUE) return n.data.speaker || t('node.title.dialogue');
  if(n.type === NODE_TYPE.CHOICE) return n.data.prompt || t('node.title.choice');
  return '?';
}

function openSearchPalette(){
  renderSearchResults('');
  searchPalette.style.display = 'flex';
  setTimeout(()=> searchInput.focus(), 0);
}

function closeSearchPalette(){
  searchPalette.style.display = 'none';
  searchInput.value = '';
}

function renderSearchResults(q){
  const ql = q.trim().toLowerCase();
  searchHits = state.nodes
    .map(n => ({ n, score: ql ? (nodeSearchText(n).toLowerCase().includes(ql) ? 1 : 0) : 1 }))
    .filter(x => x.score > 0)
    .map(x => x.n);
  if(searchIdx >= searchHits.length) searchIdx = 0;
  if(searchHits.length === 0){
    searchResults.innerHTML = `<div class="search-empty">${escapeHtml(t('search.empty'))}</div>`;
    return;
  }
  searchResults.innerHTML = searchHits.map((n, i)=>{
    const text = nodeSearchText(n).trim() || '';
    return `
      <div class="search-result ${i===searchIdx?'active':''}" data-sr-idx="${i}">
        <span class="sr-icon ${n.type}"></span>
        <div style="flex:1; min-width:0;">
          <div class="sr-title">${escapeHtml(nodeTitle(n))}</div>
          <div class="sr-preview">${escapeHtml(text)}</div>
        </div>
        <span class="sr-meta">#${n.seq}</span>
      </div>
    `;
  }).join('');
  searchResults.querySelectorAll('.search-result').forEach(el=>{
    el.addEventListener('click', ()=>{
      const i = +el.getAttribute('data-sr-idx');
      jumpToNode(searchHits[i].id);
      closeSearchPalette();
    });
  });
}

searchInput.addEventListener('input', ()=>{
  searchIdx = 0;
  renderSearchResults(searchInput.value);
});

searchInput.addEventListener('keydown', (e)=>{
  if(e.key === 'ArrowDown'){
    e.preventDefault();
    if(searchHits.length) searchIdx = (searchIdx + 1) % searchHits.length;
    renderSearchResults(searchInput.value);
  } else if(e.key === 'ArrowUp'){
    e.preventDefault();
    if(searchHits.length) searchIdx = (searchIdx - 1 + searchHits.length) % searchHits.length;
    renderSearchResults(searchInput.value);
  } else if(e.key === 'Enter'){
    e.preventDefault();
    if(searchHits[searchIdx]){
      jumpToNode(searchHits[searchIdx].id);
      closeSearchPalette();
    }
  } else if(e.key === 'Escape'){
    closeSearchPalette();
  }
});

searchPalette.addEventListener('mousedown', (e)=>{
  if(e.target === searchPalette) closeSearchPalette();
});

/* =========================================================================
   拖入 JSON 导入 (Drag-drop import)
   ========================================================================= */
const dropOverlay = document.getElementById('drop-overlay');
let dragCounter = 0;

window.addEventListener('dragenter', (e)=>{
  if(!e.dataTransfer || !Array.from(e.dataTransfer.types || []).includes('Files')) return;
  dragCounter++;
  dropOverlay.style.display = 'flex';
});
window.addEventListener('dragover', (e)=>{
  if(e.dataTransfer && Array.from(e.dataTransfer.types || []).includes('Files')){
    e.preventDefault();
  }
});
window.addEventListener('dragleave', (e)=>{
  dragCounter--;
  if(dragCounter <= 0){
    dragCounter = 0;
    dropOverlay.style.display = 'none';
  }
});
window.addEventListener('drop', (e)=>{
  if(!e.dataTransfer || !e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
  e.preventDefault();
  dragCounter = 0;
  dropOverlay.style.display = 'none';
  const file = e.dataTransfer.files[0];
  if(!/\.json$/i.test(file.name) && file.type !== 'application/json'){
    alert(t('alert.badFormat'));
    return;
  }
  const reader = new FileReader();
  reader.onload = (ev)=>{
    const text = ev.target.result;
    try{
      const json = JSON.parse(text);
      if(state.nodes.length > 0){
        if(!confirm(t('confirm.loadTemplate', { title: file.name }))) return;
      }
      loadScriptFromJson(json);
      toastKey('toast.imported');
    }catch(err){
      alert(t('alert.parseFail', { msg: err.message }));
    }
  };
  reader.readAsText(file);
});

/* =========================================================================
   网格对齐开关 (Snap to grid)
   ========================================================================= */
let snapToGrid = false;
const GRID_SIZE = 20;
const snapToggleBtn = document.getElementById('sb-toggle-grid');

snapToggleBtn.addEventListener('click', ()=>{
  snapToGrid = !snapToGrid;
  applySnapToggleUi();
});
function applySnapToggleUi(){
  snapToggleBtn.classList.toggle('on', snapToGrid);
  snapToggleBtn.textContent = t(snapToGrid ? 'status.snapOn' : 'status.snapOff');
}
applySnapToggleUi();

function snapValue(v){
  return snapToGrid ? Math.round(v / GRID_SIZE) * GRID_SIZE : v;
}

/* =========================================================================
   初始化
   ========================================================================= */
function init(){
  // Apply language switcher active state + translate static UI before anything renders
  document.querySelectorAll('#lang-switch button').forEach(btn=>{
    btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLang);
  });
  applyI18nToStatic();

  // Check for a saved draft before seeding the default Start node
  const saved = readSavedDraft();
  if(saved && saved.data && Array.isArray(saved.data.nodes) && saved.data.nodes.length > 0){
    restoreSnapshot(JSON.stringify(saved.data));
    setSaved();
    updateStatusBar();
    if(typeof renderMinimap === 'function') renderMinimap();
    requestAnimationFrame(()=> fitView());
    // Show the recovery modal after the UI has settled
    setTimeout(()=>{
      const when = new Date(saved.ts);
      const hh = String(when.getHours()).padStart(2,'0');
      const mm = String(when.getMinutes()).padStart(2,'0');
      recoveryMeta.textContent = t('recovery.meta', { n: saved.data.nodes.length, time: hh + ':' + mm });
      recoveryModal.style.display = 'flex';
    }, 250);
  } else {
    applyCameraTransform();
    // Seed with a Start node so users have an entry point
    const startNode = createNodeData(NODE_TYPE.START, -260, 0);
    state.nodes.push(startNode);
    renderNode(startNode);

    const dlg = createNodeData(NODE_TYPE.DIALOGUE, 60, -40);
    state.nodes.push(dlg);
    renderNode(dlg);

    requestAnimationFrame(()=>{
      addConnection(startNode.id, 'out', dlg.id);
      fitView();
      renderMinimap();
    });
    updateStatusBar();
    setSaved();
  }

  // Wire up language switch buttons
  document.querySelectorAll('#lang-switch button').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      setLanguage(btn.getAttribute('data-lang'));
    });
  });

  // Listen for language changes dispatched by i18n.js and refresh dynamic UI
  window.addEventListener('languagechange', ()=>{
    renderSidebar();
    state.nodes.forEach(n=> rerenderNodeBody(n));
    if(document.getElementById('template-modal').style.display === 'flex'){
      renderTemplateGrid();
    }
    if(document.getElementById('context-menu').classList.contains('show')){
      renderCtxItems(ctxSearchInput.value);
    }
    if(document.getElementById('play-overlay').classList.contains('show') && playState.currentNodeId){
      const node = getNode(playState.currentNodeId);
      if(node){
        if(node.type === NODE_TYPE.DIALOGUE) renderPlayDialogue(node);
        else if(node.type === NODE_TYPE.CHOICE) renderPlayChoice(node);
      }
    }
    if(typeof applySnapToggleUi === 'function') applySnapToggleUi();
    if(typeof renderValidation === 'function'){
      const wasOpen = document.getElementById('validation-popover').style.display === 'block';
      renderValidation();
      if(wasOpen) document.getElementById('validation-popover').style.display = 'block';
    }
    updateAllConnections();
    if(typeof renderMinimap === 'function') renderMinimap();
  });

  window.addEventListener('resize', ()=>{ updateAllConnections(); renderMinimap(); });
}

init();

})();
