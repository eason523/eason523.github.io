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

    'blog.p1.date':  '03/31',
    'blog.p1.title': 'Claude Code 源码泄露事件',
    'blog.p1.body':  '<p>2026 年 3 月 31 日，Anthropic 发布 Claude Code v2.1.88 时，因为打包工具默认生成 source map、`.npmignore` 又漏掉了 `*.map`，把约 <strong>51.2 万行 TypeScript、1900 个文件</strong>完整带进了 npm 包。</p><p>source map 本是把压缩后的产物映射回原始源码的调试文件——只需一条公开链接，任何人都能还原整套代码。安全研究员 Chaofan Shou 发现后公开，几小时内 GitHub 上就出现了成千上万的镜像与 fork，体量创下纪录。Anthropic 随即撤回包并针对约 8100 个仓库发了 DMCA 下架。</p><p>值得注意：这其实是<strong>同一个错误第二次发生</strong>，前一次在 2025 年 2 月。模型权重、客户数据并未泄露，但它把公司底层的工程架构完整暴露了。对我的警醒是：任何构建流程都该做「产物白名单」，调试文件不进发布包——安全往往只是一行配置文件的事。</p>',

    'blog.p2.date':  '07/15',
    'blog.p2.title': 'GitHub 全网开源项目搜索',
    'blog.p2.body':  '<p>一个按关键词搜索 GitHub 开源项目的小工具：调用官方搜索接口，按 star / fork 排序，按语言筛选，还能即时预览仓库说明与 README。</p><p>需求很朴素——「找一个能用、维护还不错、语言对的库」，但没有一个顺手的地方。于是自己做了一个，把查、筛、看三步压到几秒内。</p><p>它不炫技，但这个念头解决的是我每天都会碰到的真实困扰。</p>',

    'blog.p3.date':  '06/02',
    'blog.p3.title': '节点化对话树剧本编辑器',
    'blog.p3.body':  '<p>一个可视化的对话树编辑器，用来写游戏 / 互动叙事的<strong>节点化剧本</strong>。</p><p>特点：拖拽节点、连线分支、导出 JSON、即时预览演出效果。相比直接手写脚本，它把「剧情结构」变成看得见的图，改起来也更直观。</p><p>对做脚本型互动内容的人很对症，也是我这阵子在交互叙事上的一次尝试。</p>',

    'blog.p4.date':  '05/01',
    'blog.p4.title': '足球比分预测',
    'blog.p4.body':  '<p>一个兴趣驱动的<strong>足球比赛比分预测</strong>项目：用历史比赛数据建模，输出各比分出现的概率分布，而不是只给一个「谁赢」。让预测的确定性「看得见」。</p><p>作为统计学习、特征工程和结果检验的练习，比预测本身更有意思——每次赛后回测，都是在跟自己的假设对质。</p>',

    'blog.p5.date':  '08/01',
    'blog.p5.title': '如何用 Agent 更好地做东西',
    'blog.p5.body':  '<p>最近几个月我越来越常用 AI Agent 造东西，收获颇多：</p><p><strong>1. 让 Agent 负责「快」，我负责「对」。</strong>查资料、写草稿、搭脚手架这些体力活，交给它；拍板、方向、审美自己把住。</p><p><strong>2. 任务拆小，给足上下文。</strong>把一个大需求拆成一步步可验证的小任务，比让它一口气做一个大功能稳得多。想让 Agent 理解我，先给它看我的代码和约定。</p><p><strong>3. 结果要落地验证。</strong>跑测试、看产物、审 diff，而不是默认它就对了。Agent 再强，走偏了也白搭。</p><p>工具只是放大器，放大的是你的判断力。</p>',

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

    'blog.p1.date':  '03/31',
    'blog.p1.title': 'The Claude Code source leak',
    'blog.p1.body':  '<p>On March 31, 2026, Anthropic published Claude Code v2.1.88 with roughly <strong>512,000 lines of TypeScript across ~1,900 files</strong> bundled into the npm package — because the bundler generated a source map by default and `.npmignore` forgot to exclude `*.map`.</p><p>A source map maps minified output back to the original source — one public link and anyone can reconstruct the whole codebase. Security researcher Chaofan Shou shared it publicly, and within hours thousands of mirrors and forks appeared on GitHub at record scale. Anthropic pulled the package and filed DMCA takedowns against ~8,100 repos.</p><p>Worth noting: this was the <strong>second time the same mistake had happened</strong>, the first being February 2025. No model weights or user data leaked, but the company’s underlying engineering architecture was laid bare. My takeaway: build pipelines should enforce an allow-list of shipped artifacts — security is often a single config line away.</p>',

    'blog.p2.date':  '07/15',
    'blog.p2.title': 'GitHub-wide open source search',
    'blog.p2.body':  '<p>A small tool that searches GitHub for open-source projects by keyword — sorts by stars / forks, filters by language, and previews repo descriptions and READMEs on the spot.</p><p>The need is plain: “find a used, maintained, right-language library” should not be a chore. There was no convenient place for it, so I built one — collapsing find, filter, and browse into a few seconds.</p><p>Nothing flashy. But it solves a frustration I hit every single day.</p>',

    'blog.p3.date':  '06/02',
    'blog.p3.title': 'Node-based dialogue tree editor',
    'blog.p3.body':  '<p>A visual dialogue-tree editor for writing <strong>node-based scripts</strong> for games / interactive narrative.</p><p>Drag nodes, wire up branches, export JSON, preview the scene in real time. Compared to hand-writing scripts, it turns story structure into a visible graph that’s far easier to reshape.</p><p>It targets folks building scripted interactive content — and it’s my own experiment in interactive narrative.</p>',

    'blog.p4.date':  '05/01',
    'blog.p4.title': 'Football score prediction',
    'blog.p4.body':  '<p>A hobby-driven <strong>football score prediction</strong> project: model historical match data and output a probability spread over possible scores — not just “who wins”. It makes the uncertainty in a prediction visible.</p><p>More than the predictions themselves, the backtesting and feature engineering make a great exercise in statistics and result validation — every post-match review is a conversation with my own assumptions.</p>',

    'blog.p5.date':  '08/01',
    'blog.p5.title': 'How to build better with agents',
    'blog.p5.body':  '<p>Lately I’ve been building almost everything with AI agents. Takeaways so far:</p><p><strong>1. Let agents be fast; you be right.</strong> Research, drafts, scaffolding — the grunt work goes to them. Direction, decisions and taste stay mine.</p><p><strong>2. Break tasks small, give full context.</strong> Small verifiable steps beat one giant feature. Give it my code and conventions instead of expecting mind-reading.</p><p><strong>3. Verify the output.</strong> Run tests, read the diff, look at the artifact. Agents slipped sideways is still a waste — never assume it’s right just because it finished.</p><p>A tool is just an amplifier that multiplies your judgment.</p>',

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
