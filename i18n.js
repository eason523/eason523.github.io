/* ============================================================
   eason / 许肥球 — homepage i18n
   keys map to data-i18n attributes in index.html
   ============================================================ */

const HOMEPAGE_I18N = {
  'zh-CN': {
    'nav.work':     '作品',
    'nav.blog':     '写作',
    'nav.skills':   '技能',
    'nav.contact':  '联系',

    'hero.eyebrow': '你好，我是',
    'hero.nameZh':  'XCY',
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

    'blog.title': '写作',
    'blog.sub':   '随手记的短文，点开看看。',

    'blog.p1.date':  '07/15',
    'blog.p1.title': '一个安静写字的地方。',
    'blog.p1.body':  '<p>没有构建步骤、纯 HTML 的主页，改一行就能上线。比起框架的复杂度，我更在意「安静地造」——打开就能看、改了就能发布，是我喜欢的方式。</p><p>网站只是壳，内容才是核心。所以这里只放真正想说的话。</p>',

    'blog.p2.date':  '06/02',
    'blog.p2.title': '用 AI Agent 造东西。',
    'blog.p2.body':  '<p>最近的摸索：让 Agent 干一些琐碎的活儿——查资料、写草稿、起工程脚手架，我再负责判断和打磨。</p><p>边界很清楚：Agent 负责「快」，我负责「对」。</p>',

    'blog.p3.date':  '04/11',
    'blog.p3.title': '小工具，安静的日子。',
    'blog.p3.body':  '<p>我喜欢做那种一次解决一个小问题、用完就走的小工具。它们不引人注目，却让日子顺滑一点。</p><p>把梦想做成 APP 也是同理：先做一个有用的版本，再慢慢打磨。</p>',

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
    'nav.blog':     'Writing',
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

    'blog.title': 'Writing',
    'blog.sub':   'Short notes, folded up here.',

    'blog.p1.date':  '07/15',
    'blog.p1.title': 'A quiet place to write.',
    'blog.p1.body':  '<p>No build step, plain HTML — change a line and it ships. More than framework complexity, I care about making things quietly: open to view, edit to publish. That’s how I like to work.</p><p>The site is just a shell. The words are the point, so only what I actually want to say lives here.</p>',

    'blog.p2.date':  '06/02',
    'blog.p2.title': 'Building with AI agents.',
    'blog.p2.body':  '<p>Recent experiment: let agents handle the tedious bits — digging through sources, drafting, scaffolding a project — while I handle judgment and polish.</p><p>The line stays clear: agents are fast, I’m right.</p>',

    'blog.p3.date':  '04/11',
    'blog.p3.title': 'Small tools, calm days.',
    'blog.p3.body':  '<p>I like small tools that solve one small problem and get out of the way. They’re unremarkable, but they make the days smoother.</p><p>Turning daydreams into apps works the same way: ship a useful version first, then refine.</p>',

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
