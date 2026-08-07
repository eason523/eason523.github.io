/* ============================================================
   eason / 许肥球 — homepage i18n
   keys map to data-i18n attributes in index.html
   ============================================================ */

const HOMEPAGE_I18N = {
  'zh-CN': {
    'nav.work':     '作品',
    'nav.skills':   '技能',
    'nav.contact':  '联系',

    'hero.eyebrow': '你好，我是',
    'hero.nameZh':  '许肥球',
    'hero.role':    'eason@github · CS 学生 · {{school}}',
    'hero.tagline': '我在造 <strong>{{tagline}}</strong> 的软件。',
    'hero.bio':     '{{bio}}',
    'hero.scroll':  '↓ 作品',

    'work.title':   '精选作品',
    'work.sub':     '最近在造的东西。',
    'work.github':  'GitHub ↗',
    'work.demo':    '演示 ↗',

    'work.p1.title': 'GitHub 全网开源项目搜索',
    'work.p1.desc':  '在 GitHub 上按关键词搜索开源项目，按 star / fork 排序，可按语言筛选并即时预览。',
    'work.p1.tag1':  '搜索',
    'work.p1.tag2':  '工具',
    'work.p1.tag3':  '实用',

    'work.p2.title': '节点化对话树剧本编辑器',
    'work.p2.desc':  '一个可视化对话树编辑器，拖拽节点、连枝分支、导出 JSON、即时预览剧本。',
    'work.p2.tag1':  '工具',
    'work.p2.tag2':  '可视化',
    'work.p2.tag3':  '交互',

    'work.p3.title': '作品三',
    'work.p3.desc':  '关于第三个项目的一句话描述。',
    'work.p3.tag1':  '标签',
    'work.p3.tag2':  '标签',
    'work.p3.tag3':  '标签',

    'skills.title':  '技能',
    'skills.sub':    '按使用频率排序，不求齐全。',
    'skills.col1':   '语言',
    'skills.col2':   '工具',
    'skills.col3':   '方向',
    'skills.craft1': '系统设计',
    'skills.craft2': '写作',
    'skills.craft3': '折腾',
    'skills.craft4': '读论文',

    'contact.title':  '联系我',
    'contact.invite': '想聊合作 / 一起做点东西？随时来信。',
    'contact.email':  '邮箱',
    'contact.emailValue': '{{email}}',

    'footer.built': '安静地造',
    'footer.top':   '↑ 回到顶部',

    'a11y.skip':    '跳到内容'
  },

  'en-US': {
    'nav.work':     'Work',
    'nav.skills':   'Skills',
    'nav.contact':  'Contact',

    'hero.eyebrow': 'Hi, I’m',
    'hero.nameZh':  'eason',
    'hero.role':    'eason@github · CS Student · {{school}}',
    'hero.tagline': 'I build software for <strong>{{tagline}}</strong>.',
    'hero.bio':     '{{bio}}',
    'hero.scroll':  '↓ Work',

    'work.title':   'Selected work',
    'work.sub':     'Things I’ve built recently.',
    'work.github':  'GitHub ↗',
    'work.demo':    'Demo ↗',

    'work.p1.title': 'GitHub Project Search',
    'work.p1.desc':  'Search GitHub for open-source projects by keyword — sort by stars / forks, filter by language, preview instantly.',
    'work.p1.tag1':  'Search',
    'work.p1.tag2':  'Tool',
    'work.p1.tag3':  'Practical',

    'work.p2.title': 'Dialogue Tree Editor',
    'work.p2.desc':  'A visual node-based dialogue editor — drag nodes, branch conversations, export JSON, preview scripts in real time.',
    'work.p2.tag1':  'Tool',
    'work.p2.tag2':  'Visual',
    'work.p2.tag3':  'Interactive',

    'work.p3.title': 'Project Three',
    'work.p3.desc':  'A short description of the third project.',
    'work.p3.tag1':  'Tag',
    'work.p3.tag2':  'Tag',
    'work.p3.tag3':  'Tag',

    'skills.title':  'Skills',
    'skills.sub':    'A non-exhaustive list, sorted by how often I reach for them.',
    'skills.col1':   'Languages',
    'skills.col2':   'Tools',
    'skills.col3':   'Craft',
    'skills.craft1': 'System design',
    'skills.craft2': 'Writing',
    'skills.craft3': 'Tinkering',
    'skills.craft4': 'Reading papers',

    'contact.title':  'Get in touch',
    'contact.invite': 'Want to collaborate or just say hi? Drop me a line.',
    'contact.email':  'Email',
    'contact.emailValue': '{{email}}',

    'footer.built': 'Built quietly',
    'footer.top':   '↑ Back to top',

    'a11y.skip':    'Skip to content'
  }
};

// typewriter word lists per locale
const HOMEPAGE_TYPEWRITER = {
  'zh-CN': ['设计', '写代码', '写作', '上线', '折腾', '学习'],
  'en-US': ['design', 'code', 'write', 'ship', 'tinker', 'learn']
};