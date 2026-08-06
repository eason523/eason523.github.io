/* ============================================================
   节点化对话树剧本编辑器 — 国际化 (i18n)
   暴露到 window：I18N, currentLang, t, applyI18nToStatic,
                 refreshDynamicI18n, setLanguage, toastKey
   ============================================================ */

(function(){
"use strict";

/* =========================================================================
   国际化 (i18n)
   ========================================================================= */
const I18N = {
  'zh-CN': {
    'brand.title': '剧本节点编辑器',

    'toolbar.addDialogue': '💬 添加对话节点',
    'toolbar.addChoice':   '🔀 添加分支节点',
    'toolbar.export':      '⬇ 导出 JSON',
    'toolbar.import':      '⬆ 导入 JSON',
    'toolbar.templates':   '📄 默认模板',
    'toolbar.clear':       '🗑 清空画布',
    'toolbar.play':        '▶ 预览剧本',
    'toolbar.fit':         '⤢ 适应画面',

    'sidebar.title':    '属性面板',
    'sidebar.subtitle': '选中节点以编辑详细信息',
    'sidebar.empty':    '还没有选中任何节点<br>点击画布上的节点查看/编辑属性<br><br>提示：Delete / Backspace 可删除选中的节点或连线',

    'sidebar.badge.start':    '开始节点',
    'sidebar.badge.dialogue': '对话节点',
    'sidebar.badge.choice':   '分支节点',
    'sidebar.badge.connection':'连线',
    'sidebar.meta.fromNode':  '来源节点',
    'sidebar.meta.toNode':    '目标节点',
    'sidebar.meta.connId':    '连接 ID',
    'sidebar.meta.position':  '位置',
    'sidebar.meta.nodeId':    '节点 ID',
    'sidebar.meta.startHint': '剧本的唯一起点',
    'sidebar.deleteConn':     '删除该连线',
    'sidebar.deleteNode':     '删除该节点',
    'sidebar.field.speaker':  '说话人',
    'sidebar.field.text':     '对话内容',
    'sidebar.field.prompt':   '提示文本',
    'sidebar.field.opt':      '选项',
    'sidebar.field.choicePrefix': '选项',

    'node.title.start':    '开始节点',
    'node.title.dialogue': '对话节点',
    'node.title.choice':   '分支节点',
    'node.startHint':      '剧本的起点，故事从这里开始。',
    'node.field.speaker':  '说话人',
    'node.field.text':     '对话内容',
    'node.field.prompt':   '提示文本',
    'node.field.options':  '选项 (输出端口)',
    'node.field.optPrefix':'选项',
    'node.placeholder.speaker': '角色名称',
    'node.placeholder.text':    '输入对话文本...',
    'node.placeholder.prompt':  '例如：玩家选择',
    'node.placeholder.opt':     '选项 {{n}} 文本',
    'node.portIn.title':   '输入',
    'node.portOut.title':  '拖拽以连接',
    'node.addOption':      '+ 添加选项',
    'node.removeOption':   '删除该选项',
    'node.atLeastOneOpt':  '至少需要保留一个选项',

    'ctx.searchPlaceholder': '搜索节点类型...',
    'ctx.emptyHint':         '没有匹配的节点类型',
    'ctx.dialogue':          '新建对话节点 (Dialogue)',
    'ctx.choice':            '新建分支节点 (Choice)',

    'export.title':    '导出剧本 JSON',
    'export.copy':     '📋 复制到剪贴板',
    'export.download': '⬇ 下载 .json 文件',
    'export.copied':   '已复制到剪贴板',
    'export.downloaded':'JSON 文件已开始下载',

    'templates.title': '选择默认模板',
    'templates.warn':  '⚠ 加载模板将会清空当前画布上的所有内容，请注意提前导出备份。',

    'tpl.blank-start.title':       '空白起点',
    'tpl.blank-start.desc':        '仅包含一个 Start 节点，适合从零开始搭建你自己的剧本结构。',
    'tpl.blank-start.tags.0':      '最简',
    'tpl.blank-start.tags.1':      '空白',
    'tpl.linear-dialogue.title':   '简单对话线',
    'tpl.linear-dialogue.desc':    '一条 Start → 对话 → 对话 → 对话 的线性剧情，适合新手熟悉编辑器操作。',
    'tpl.linear-dialogue.tags.0':  '线性',
    'tpl.linear-dialogue.tags.1':  '入门',
    'tpl.branching-choice.title':  '分支选择剧情',
    'tpl.branching-choice.desc':   '包含一个 Choice 节点与两条不同走向的结局，演示分支跳转与多结局结构。',
    'tpl.branching-choice.tags.0': '分支',
    'tpl.branching-choice.tags.1': '多结局',
    'tpl.shop-npc.title':          'NPC 商店对话',
    'tpl.shop-npc.desc':           '模拟游戏中常见的 NPC 交互树：问候 → 选择意图（购买/闲聊/离开）→ 分支反馈。',
    'tpl.shop-npc.tags.0':         'NPC',
    'tpl.shop-npc.tags.1':         '游戏常用',

    'play.exit':      '退出预览',
    'play.badge':     '剧本预览模式',
    'play.endTitle':  '🎬 剧本播放结束',
    'play.endSub':    '已到达没有后续连接的节点',
    'play.restart':   '🔁 重新开始',
    'play.continue':  '点击继续',

    'toast.cleared':      '画布已清空',
    'toast.imported':     '导入成功',
    'toast.copied':       '已复制到剪贴板',
    'toast.downloaded':   'JSON 文件已开始下载',
    'toast.atLeastOneOpt':'至少需要保留一个选项',
    'toast.noStart':      '未找到 Start 节点，请先添加一个起始节点',
    'toast.noConn':       'Start 节点尚未连接任何后续节点',

    'confirm.clearCanvas': '确定要清空整个画布吗？此操作不可撤销。',
    'confirm.loadTemplate':'加载模板「{{title}}」将会清空当前画布，确定要继续吗？',
    'toast.templateLoaded':'已加载模板：{{title}}',

    'alert.parseFail':  'JSON 解析失败：{{msg}}',
    'alert.badFormat':  '文件格式不正确：缺少 nodes 数组',

    'default.startLabel':    '开始',
    'default.speaker':       '角色名',
    'default.dialogueText':  '在此输入对话内容...',
    'default.choicePrompt':  '玩家选择：',
    'default.choiceOption':  '选项 {{n}}',

    'status.snapOn':          '✓ 网格对齐',
    'status.snapOff':         '⊞ 网格对齐',
    'status.snapHint':        '节点拖动时对齐到 20px 网格',
    'status.issues':          '问题',

    'validation.title':       '校验结果',
    'validation.empty':       '✓ 没有发现问题',
    'validation.multipleStart':'多个 Start 节点（应仅有一个）',
    'validation.noStart':     '找不到 Start 节点',
    'validation.orphan':      '孤立节点（无入边）',
    'validation.danglingOpt': '分支节点的选项没有连线',
    'validation.unreachable': '不可达节点（从 Start 无法到达）',
    'validation.jumpTo':      '跳转',
    'validation.summary':     '共 {{n}} 个问题',

    'search.placeholder':     '搜索节点...',
    'search.hint':            '输入关键字以过滤节点 · ↑↓ 选择 · Enter 跳转 · Esc 关闭',
    'search.empty':           '没有匹配的节点',
    'search.count':           '{{n}} 个匹配',

    'drop.hint':               '松开鼠标导入 JSON 文件',

    'status.start':           '开始节点',
    'status.dialogue':        '对话节点',
    'status.choice':          '分支节点',
    'status.connections':     '连线',
    'status.saved':           '已自动保存',
    'status.unsaved':         '● 未保存',
    'status.shortcutHint':    '按 ? 查看快捷键',

    'shortcuts.title':        '键盘快捷键',
    'shortcuts.desc.undo':    '撤销',
    'shortcuts.desc.redo':    '重做',
    'shortcuts.desc.duplicate':'复制选中节点',
    'shortcuts.desc.delete':  '删除选中节点/连线',
    'shortcuts.desc.fitView': '适应画面',
    'shortcuts.desc.play':    '预览剧本',
    'shortcuts.desc.help':    '打开此帮助',
    'shortcuts.desc.close':   '关闭弹窗 / 取消',
    'shortcuts.desc.search':  '搜索节点',
    'shortcuts.desc.escape':  '退出预览',

    'recovery.title':         '恢复上次未保存的内容？',
    'recovery.desc':          '浏览器中检测到未保存的剧本草稿，是否恢复？',
    'recovery.discard':       '丢弃',
    'recovery.restore':       '恢复',
    'recovery.meta':          '{{n}} 个节点 · 保存于 {{time}}',

    'nodeCtx.duplicate':      '复制节点 (Ctrl+D)',
    'nodeCtx.setStart':       '设为起始节点',
    'nodeCtx.delete':         '删除节点',

    'toast.duplicated':       '已复制节点',
    'toast.restored':         '已恢复上次的草稿',
    'toast.noUndo':           '没有可撤销的操作',
    'toast.noRedo':           '没有可重做的操作',
  },

  'en-US': {
    'brand.title': 'Dialogue Script Editor',

    'toolbar.addDialogue': '💬 Add Dialogue Node',
    'toolbar.addChoice':   '🔀 Add Choice Node',
    'toolbar.export':      '⬇ Export JSON',
    'toolbar.import':      '⬆ Import JSON',
    'toolbar.templates':   '📄 Default Templates',
    'toolbar.clear':       '🗑 Clear Canvas',
    'toolbar.play':        '▶ Preview Script',
    'toolbar.fit':         '⤢ Fit to Screen',

    'sidebar.title':    'Properties',
    'sidebar.subtitle': 'Select a node to edit details',
    'sidebar.empty':    'No node selected<br>Click a node on the canvas to view/edit its properties<br><br>Tip: Press Delete / Backspace to remove the selected node or connection',

    'sidebar.badge.start':    'Start Node',
    'sidebar.badge.dialogue': 'Dialogue Node',
    'sidebar.badge.choice':   'Choice Node',
    'sidebar.badge.connection':'Connection',
    'sidebar.meta.fromNode':  'From Node',
    'sidebar.meta.toNode':    'To Node',
    'sidebar.meta.connId':    'Connection ID',
    'sidebar.meta.position':  'Position',
    'sidebar.meta.nodeId':    'Node ID',
    'sidebar.meta.startHint': 'The unique entry point of the script',
    'sidebar.deleteConn':     'Delete this connection',
    'sidebar.deleteNode':     'Delete this node',
    'sidebar.field.speaker':  'Speaker',
    'sidebar.field.text':     'Dialogue',
    'sidebar.field.prompt':   'Prompt',
    'sidebar.field.opt':      'Option',
    'sidebar.field.choicePrefix': 'Option',

    'node.title.start':    'Start Node',
    'node.title.dialogue': 'Dialogue Node',
    'node.title.choice':   'Choice Node',
    'node.startHint':      'The story begins here.',
    'node.field.speaker':  'Speaker',
    'node.field.text':     'Dialogue',
    'node.field.prompt':   'Prompt',
    'node.field.options':  'Options (output ports)',
    'node.field.optPrefix':'Option',
    'node.placeholder.speaker': 'Character name',
    'node.placeholder.text':    'Enter dialogue text...',
    'node.placeholder.prompt':  'e.g. What do you do?',
    'node.placeholder.opt':     'Option {{n}} text',
    'node.portIn.title':   'Input',
    'node.portOut.title':  'Drag to connect',
    'node.addOption':      '+ Add option',
    'node.removeOption':   'Remove this option',
    'node.atLeastOneOpt':  'At least one option is required',

    'ctx.searchPlaceholder': 'Search node types...',
    'ctx.emptyHint':         'No matching node types',
    'ctx.dialogue':          'New Dialogue Node (Dialogue)',
    'ctx.choice':            'New Choice Node (Choice)',

    'export.title':    'Export Script as JSON',
    'export.copy':     '📋 Copy to Clipboard',
    'export.download': '⬇ Download .json File',
    'export.copied':   'Copied to clipboard',
    'export.downloaded':'JSON file download started',

    'templates.title': 'Choose a Default Template',
    'templates.warn':  '⚠ Loading a template will clear the current canvas. Please export your work first.',

    'tpl.blank-start.title':       'Blank Start',
    'tpl.blank-start.desc':        'Just a Start node — perfect for building your own story from scratch.',
    'tpl.blank-start.tags.0':      'Minimal',
    'tpl.blank-start.tags.1':      'Blank',
    'tpl.linear-dialogue.title':   'Simple Dialogue Line',
    'tpl.linear-dialogue.desc':    'A linear Start → Dialogue → Dialogue → Dialogue flow. Great for new users.',
    'tpl.linear-dialogue.tags.0':  'Linear',
    'tpl.linear-dialogue.tags.1':  'Beginner',
    'tpl.branching-choice.title':  'Branching Choice Story',
    'tpl.branching-choice.desc':   'Includes a Choice node and two distinct endings — showcases branching and multiple outcomes.',
    'tpl.branching-choice.tags.0': 'Branching',
    'tpl.branching-choice.tags.1': 'Multi-ending',
    'tpl.shop-npc.title':          'NPC Shop Dialogue',
    'tpl.shop-npc.desc':           'Common NPC interaction tree: greeting → intent (buy / chat / leave) → branched response.',
    'tpl.shop-npc.tags.0':         'NPC',
    'tpl.shop-npc.tags.1':         'Game-ready',

    'play.exit':      'Exit Preview',
    'play.badge':     'Script Preview Mode',
    'play.endTitle':  '🎬 Script Ended',
    'play.endSub':    'Reached a node with no further connections',
    'play.restart':   '🔁 Restart',
    'play.continue':  'Click to continue',

    'toast.cleared':      'Canvas cleared',
    'toast.imported':     'Imported successfully',
    'toast.copied':       'Copied to clipboard',
    'toast.downloaded':   'JSON file download started',
    'toast.atLeastOneOpt':'At least one option is required',
    'toast.noStart':      'No Start node found — please add one first',
    'toast.noConn':       'The Start node has no outgoing connections',

    'confirm.clearCanvas': 'Clear the entire canvas? This cannot be undone.',
    'confirm.loadTemplate':'Loading template "{{title}}" will clear the current canvas. Continue?',
    'toast.templateLoaded':'Loaded template: {{title}}',

    'alert.parseFail':  'JSON parse failed: {{msg}}',
    'alert.badFormat':  'Invalid file format: missing nodes array',

    'default.startLabel':    'Start',
    'default.speaker':       'Character',
    'default.dialogueText':  'Enter your dialogue here...',
    'default.choicePrompt':  'Choose:',
    'default.choiceOption':  'Option {{n}}',

    'status.snapOn':          '✓ Snap to grid',
    'status.snapOff':         '⊞ Snap to grid',
    'status.snapHint':        'Snap node positions to a 20px grid while dragging',
    'status.issues':          'issues',

    'validation.title':       'Validation',
    'validation.empty':       '✓ No issues found',
    'validation.multipleStart':'Multiple Start nodes (should be only one)',
    'validation.noStart':     'No Start node found',
    'validation.orphan':      'Orphan node (no incoming connection)',
    'validation.danglingOpt': 'Choice option has no outgoing connection',
    'validation.unreachable': 'Unreachable node (cannot be reached from Start)',
    'validation.jumpTo':      'Go to',
    'validation.summary':     '{{n}} issue(s) total',

    'search.placeholder':     'Search nodes...',
    'search.hint':            'Type to filter nodes · ↑↓ to choose · Enter to jump · Esc to close',
    'search.empty':           'No matching nodes',
    'search.count':           '{{n}} match(es)',

    'drop.hint':              'Release to import the JSON file',

    'status.start':           'Start',
    'status.dialogue':        'Dialogue',
    'status.choice':          'Choice',
    'status.connections':     'Connections',
    'status.saved':           'Auto-saved',
    'status.unsaved':         '● Unsaved',
    'status.shortcutHint':    'Press ? for shortcuts',

    'shortcuts.title':        'Keyboard Shortcuts',
    'shortcuts.desc.undo':    'Undo',
    'shortcuts.desc.redo':    'Redo',
    'shortcuts.desc.duplicate':'Duplicate selected node',
    'shortcuts.desc.delete':  'Delete selected node/connection',
    'shortcuts.desc.fitView': 'Fit to screen',
    'shortcuts.desc.play':    'Preview script',
    'shortcuts.desc.help':    'Open this help',
    'shortcuts.desc.close':   'Close dialog / cancel',
    'shortcuts.desc.search':  'Search nodes',
    'shortcuts.desc.escape':  'Exit preview',

    'recovery.title':         'Restore unsaved work?',
    'recovery.desc':          'An unsaved script draft was found in this browser. Restore it?',
    'recovery.discard':       'Discard',
    'recovery.restore':       'Restore',
    'recovery.meta':          '{{n}} nodes · saved at {{time}}',

    'nodeCtx.duplicate':      'Duplicate node (Ctrl+D)',
    'nodeCtx.setStart':       'Set as Start node',
    'nodeCtx.delete':         'Delete node',

    'toast.duplicated':       'Node duplicated',
    'toast.restored':         'Restored previous draft',
    'toast.noUndo':           'Nothing to undo',
    'toast.noRedo':           'Nothing to redo',
  }
};

const LANG_STORAGE_KEY = 'script_editor.lang';
let currentLang = (function(){
  try{
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if(saved && I18N[saved]) return saved;
  }catch(e){}
  // fallback: detect browser language
  const nav = (navigator.language || 'zh-CN').toLowerCase();
  if(nav.startsWith('en')) return 'en-US';
  return 'zh-CN';
})();

function t(key, params){
  const dict = I18N[currentLang] || I18N['zh-CN'];
  let s = dict[key];
  if(s === undefined) s = I18N['zh-CN'][key] !== undefined ? I18N['zh-CN'][key] : key;
  if(params){
    Object.keys(params).forEach(k=>{
      s = s.replace(new RegExp('\\{\\{' + k + '\\}\\}', 'g'), params[k]);
    });
  }
  return s;
}

function applyI18nToStatic(){
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el=>{
    const key = el.getAttribute('data-i18n-html');
    el.innerHTML = t(key);
  });
  document.querySelectorAll('[data-i18n-attr]').forEach(el=>{
    const attr = el.getAttribute('data-i18n-attr');
    const key = el.getAttribute('data-i18n');
    el.setAttribute(attr, t(key));
  });
  // title attribute on toolbar buttons can also use data-i18n-title
  document.querySelectorAll('[data-i18n-title]').forEach(el=>{
    const key = el.getAttribute('data-i18n-title');
    el.setAttribute('title', t(key));
  });
  document.documentElement.setAttribute('lang', currentLang.startsWith('en') ? 'en' : 'zh-CN');
}

function setLanguage(lang){
  if(!I18N[lang]) lang = 'zh-CN';
  if(lang === currentLang) return;
  currentLang = lang;
  try{ localStorage.setItem(LANG_STORAGE_KEY, lang); }catch(e){}
  // Update toolbar switcher active state
  document.querySelectorAll('#lang-switch button').forEach(btn=>{
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });
  applyI18nToStatic();
  // Ask the app to refresh dynamic UI (sidebar, nodes, play overlay, etc.)
  window.dispatchEvent(new CustomEvent('languagechange', { detail: { lang: currentLang } }));
}

// ---- expose to window ----
window.I18N = I18N;
window.currentLang = currentLang;
window.t = t;
window.applyI18nToStatic = applyI18nToStatic;
window.setLanguage = setLanguage;
window.toastKey = toastKey;
window.LANG_STORAGE_KEY = LANG_STORAGE_KEY;
})();
