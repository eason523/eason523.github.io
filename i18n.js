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

    'work.p1.modal': '<div class="modal__media"><img src="PNG/first.png" alt="GitHub 全网开源项目搜索" loading="lazy" decoding="async"></div><div class="modal__head"><h3 class="modal__title" id="modal-title">GitHub 全网开源项目搜索</h3><ul class="modal__tags"><li>搜索</li><li>工具</li><li>实用</li></ul></div><p class="modal__desc">一个按关键词搜索 GitHub 开源项目的小工具：默认按 star 排序，可切换按 fork / 最近更新，按语言筛选，并即时预览仓库简介与 README。</p><h4 class="modal__h">功能</h4><ul class="modal__features"><li>关键词 + 语言联合筛选</li><li>star / fork / 更新时间排序</li><li>仓库卡片即时预览，含 README 摘要</li><li>结果一键复制 / 跳转外链</li></ul><h4 class="modal__h">技术栈</h4><p class="modal__stack mono">JavaScript · GitHub REST API</p><div class="modal__links"><a href="https://github.com/eason523" target="_blank" rel="noopener">GitHub ↗</a><a href="eason523/index.html" target="_blank" rel="noopener">Demo ↗</a></div>',
    'work.p2.modal': '<div class="modal__media"><img src="PNG/second.png" alt="节点化对话树剧本编辑器" loading="lazy" decoding="async"></div><div class="modal__head"><h3 class="modal__title" id="modal-title">节点化对话树剧本编辑器</h3><ul class="modal__tags"><li>工具</li><li>可视化</li><li>交互</li></ul></div><p class="modal__desc">可视化的对话树编辑器：拖拽节点、连线分支、导出 JSON、即时预览演出效果。把交互叙事的剧情结构变成「看得见的图」。</p><h4 class="modal__h">功能</h4><ul class="modal__features"><li>节点拖拽、分支连线</li><li>节点属性 / 条件编辑</li><li>导出 JSON 剧本数据</li><li>场景即时预览</li></ul><h4 class="modal__h">技术栈</h4><p class="modal__stack mono">JavaScript · SVG / Canvas</p><div class="modal__links"><a href="https://github.com/eason523" target="_blank" rel="noopener">GitHub ↗</a><a href="editor/" target="_blank" rel="noopener">Demo ↗</a></div>',

    'work.p3.modal': '<div class="modal__media"><img src="PNG/third.png" alt="作品三" loading="lazy" decoding="async"></div><div class="modal__head"><h3 class="modal__title" id="modal-title">作品三</h3><ul class="modal__tags"><li>标签</li><li>标签</li><li>标签</li></ul></div><p class="modal__desc">关于第三个项目的一句话介绍。</p><h4 class="modal__h">功能</h4><ul class="modal__features"><li>功能点一</li><li>功能点二</li><li>功能点三</li></ul><h4 class="modal__h">技术栈</h4><p class="modal__stack mono">待补充</p><div class="modal__links"><a href="https://github.com/eason523" target="_blank" rel="noopener">GitHub ↗</a></div>',

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
    'blog.p1.body':  '<p>2026 年 3 月 31 日，Anthropic 发布 Claude Code v2.1.88 时，因为打包工具默认生成 source map、`.npmignore` 又漏掉了 `*.map`，把约 <strong>51.2 万行 TypeScript、1900 个文件</strong>完整带进了 npm 包——一个 59.8MB 的 `cli.js.map`，未混淆、直接指向公开的 R2 桶，任何人都能还原整套源码。</p><p>source map 本是把压缩产物映射回原始源码的调试文件。安全研究员 Chaofan Shou 发现后公开，几小时内 GitHub 上就出现成千上万的镜像与 fork，创下纪录；Anthropic 随即撤回包并针对约 8100 个仓库发了 DMCA 下架。模型权重、客户数据并未泄露。</p><p>更值得玩味的是它暴露了什么：44 个隐藏 feature flag、一堆未发布功能（KAIROS 守护进程、反蒸馏的假工具注入、Buddy 宠物系统）、以及未命名模型代号「Capybara」——竞品拿到的不只是代码，是整张路线图。而这其实是<strong>同一错误第二次发生</strong>，上一次在 2025 年 2 月。我的警醒：构建流程该做产物白名单，安全往往只是一行配置的事。</p>',

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

    'blog.p6.date':  '08/10',
    'blog.p6.title': '用 Agent 工作流实践',
    'blog.p6.body':  '<p>把 Agent 当「同事」而不是「搜索框」之后，效率才真正上来。我目前的习惯：</p><p><strong>1. 先计划，再动手。</strong>让 Agent 先输出一份计划（目标、步骤、验收点），我过一遍再执行。计划本身就是我介入、纠偏的最小抓手。</p><p><strong>2. 上下文要「喂」不要「猜」。</strong>把约定、既有代码、失败日志一次性给它；我花在「给它看路」上的时间，最终远小于「回答它反复问」的时间。</p><p><strong>3. 计划→执行→验证三阶段。</strong>每个小步骤都有明确的「完成标准」，跑测试、看产物、审 diff；错了就回退，用日志定位，而不是让它硬编。</p><p><strong>4. 把可复用的东西沉淀。</strong>常做的动作收敛成说明、模板、协议，让下一次启动更快、更稳。</p><p>边界始终清晰：Agent 负责带宽，我负责方向与最终负责。</p>',

    'blog.p7.date':  '04/05',
    'blog.p7.title': '一次源码泄露，一堂打包工程课',
    'blog.p7.body':  '<p>Claude Code 那次泄露，根因朴素得反常识：工具<strong>默认生成</strong> source map，发行时又忘了排除——一行配置，51 万行代码就出了门。</p><p>我从中整理了可以立刻落地的几条：<strong>（1）产物白名单，而非黑名单。</strong>用 `files` 字段显式列出要发布的内容，比在 `.npmignore` 里不断打补丁可靠——漏纠一刀都等于裸奔。</p><p><strong>（2）生产构建关闭调试信息。</strong>source map、`.env`、测试夹具、内部脚本，一律不进发布包；线上产物不配置 generated 到 source 的映射。</p><p><strong>（3）CI 上做「不该在包里」的断言。</strong>哪怕简单到「检测到 .map 文件就失败」，也能把这类问题拦在上线前。</p><p><strong>（4）同类错误第一次就该封死。</strong>2025 年 2 月已经发生过一次，结果又重演。教训不吃透，会以更大的代价返场。</p>',

    'blog.p8.date':  '08/12',
    'blog.p8.title': '这个站是怎么造的',
    'blog.p8.body':  '<p>这个主页刻意保持简单：<strong>纯 HTML + CSS + JS，零构建、零依赖</strong>。改一行就能上线，打开即看。</p><p>几个实现点：<strong>双语</strong>靠 `data-i18n` 属性 + 一个词典对象按语言替换文本；<strong>主题</strong>以 `data-theme` + `prefers-color-scheme` 组合支持「跟随系统 / 浅色 / 深色」三态，并手动同步 `theme-color` meta；<strong>滚动展示</strong>用 IntersectionObserver 逐项显现；<strong>作品弹窗</strong>按当前语言动态生成内容。</p><p>没有任何框架，code 是纯手写——翻译过来了，维护成本也低。有时候，少即是多。</p>',

    'blog.p9.date':  '06/25',
    'blog.p9.title': '设计让人想用，工具让人愿意',
    'blog.p9.title': '设计让人想用，工具让人愿意',
    'blog.p9.body':  '<p>设计让东西「好看」，工具让东西「好用」，我觉得更重要的其实是后者——<strong>让人愿意用下去</strong>。一个工具如果每次都要查文档、抄命令、忍受卡顿，再美也留不住人。</p><p>所以我的设计观很朴素：好的工具设计，是尊重时间。别让用户等、别让用户想、别让用户重新学——把「我知道该怎么做」翻译成「他顺手就能做」。</p><p>设计是让「想用」，工具是让「愿意用」，而这两者终归要合二为一。</p>',

    'blog.p10.date':  '08/15',
    'blog.p10.title': '我常读的好网站',
    'blog.p10.body':  '<p>遇到值得反复读、读完能涨东西的网站越来越难得，值得记下来。也把 <strong>diginfo.me</strong> 放在第一位——参考它的文章写法，也是这篇的由来。</p><ul><li><strong>diginfo.me</strong> — FreezeSoul 的代码机房。AI 编程、Agent、源码级解构这类工程向硬核内容，长文质量很高。</li><li><strong>Hacker News</strong> — news.ycombinator.com。技术圈每天的风向标，评论区经常比正文值钱。</li><li><strong>阮一峰的网络日志</strong> — ruanyifeng.com。用大白话讲新技术、做科技周报，科普式的好入口。</li><li><strong>GitHub Trending</strong> — github.com/trending。每天扫一眼，看新仓库、新技术趋势。</li><li><strong>工程博客聚合</strong> — 各家大厂的 engineering blog，比如 Netflix、Cloudflare 的，做深度技术方案时很耐读。</li></ul><p>挑网站和挑朋友一样：少而精，常来往。</p>',

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

    'work.p1.modal': '<div class="modal__media"><img src="PNG/first.png" alt="GitHub project search" loading="lazy" decoding="async"></div><div class="modal__head"><h3 class="modal__title" id="modal-title">GitHub Project Search</h3><ul class="modal__tags"><li>Search</li><li>Tool</li><li>Practical</li></ul></div><p class="modal__desc">A small tool that searches GitHub for open-source projects by keyword — sorted by stars by default, switchable to forks / recent activity, filterable by language, with instant previews of descriptions and READMEs.</p><h4 class="modal__h">Features</h4><ul class="modal__features"><li>Combined keyword + language filtering</li><li>Sort by stars / forks / updated</li><li>Instant repo preview with README summary</li><li>One-click copy / external link</li></ul><h4 class="modal__h">Stack</h4><p class="modal__stack mono">JavaScript · GitHub REST API</p><div class="modal__links"><a href="https://github.com/eason523" target="_blank" rel="noopener">GitHub ↗</a><a href="eason523/index.html" target="_blank" rel="noopener">Demo ↗</a></div>',
    'work.p2.modal': '<div class="modal__media"><img src="PNG/second.png" alt="Node-based dialogue tree editor" loading="lazy" decoding="async"></div><div class="modal__head"><h3 class="modal__title" id="modal-title">Node-based Dialogue Tree Editor</h3><ul class="modal__tags"><li>Tool</li><li>Visual</li><li>Interactive</li></ul></div><p class="modal__desc">A visual dialogue-tree editor: drag nodes, wire up branches, export JSON, preview scenes in real time. Turns interactive narrative structure into a graph you can see.</p><h4 class="modal__h">Features</h4><ul class="modal__features"><li>Node dragging &amp; branch wiring</li><li>Node properties / conditions</li><li>Export JSON script data</li><li>Real-time scene preview</li></ul><h4 class="modal__h">Stack</h4><p class="modal__stack mono">JavaScript · SVG / Canvas</p><div class="modal__links"><a href="https://github.com/eason523" target="_blank" rel="noopener">GitHub ↗</a><a href="editor/" target="_blank" rel="noopener">Demo ↗</a></div>',

    'work.p3.modal': '<div class="modal__media"><img src="PNG/third.png" alt="Project Three" loading="lazy" decoding="async"></div><div class="modal__head"><h3 class="modal__title" id="modal-title">Project Three</h3><ul class="modal__tags"><li>Tag</li><li>Tag</li><li>Tag</li></ul></div><p class="modal__desc">A short introduction to the third project.</p><h4 class="modal__h">Features</h4><ul class="modal__features"><li>Feature one</li><li>Feature two</li><li>Feature three</li></ul><h4 class="modal__h">Stack</h4><p class="modal__stack mono">TBD</p><div class="modal__links"><a href="https://github.com/eason523" target="_blank" rel="noopener">GitHub ↗</a></div>',

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
    'blog.p1.body':  '<p>On March 31, 2026, Anthropic published Claude Code v2.1.88 with roughly <strong>512,000 lines of TypeScript across ~1,900 files</strong> bundled into the npm package — a 59.8MB `cli.js.map`, unminified and pointing at a public R2 bucket, letting anyone reconstruct the whole codebase.</p><p>A source map maps minified output back to the original source. Security researcher Chaofan Shou shared it publicly, and within hours thousands of mirrors and forks appeared at record scale. Anthropic pulled the package and filed DMCA takedowns against ~8,100 repos. No model weights or user data leaked.</p><p>What’s more telling is what got exposed: 44 hidden feature flags, a pile of unshipped features (the KAIROS background daemon, anti-distillation fake-tool injection, a Buddy pet system), and an unreleased model codenamed “Capybara” — rivals didn’t just get code, they got the roadmap. And this was the <strong>second time the same mistake had happened</strong>, the first being February 2025. My takeaway: build pipelines should enforce an allow-list of shipped artifacts — security is often a single config line away.</p>',

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

    'blog.p6.date':  '08/10',
    'blog.p6.title': 'A practical agent workflow',
    'blog.p6.body':  '<p>Things changed once I treated the agent as a collaborator, not a fancy autocomplete:</p><p><strong>1. Plan first, then act.</strong> Ask it to lay out a plan — steps, constraints, exit criteria — and review before execution. The plan is my cheapest handle for steering it.</p><p><strong>2. Feed context, don’t make it guess.</strong> Point it at existing code, conventions, failing logs. Time spent walking it through the docs beats time spent answering “why”.</p><p><strong>3. Plan → execute → verify.</strong> Every step has a clear done-标准. Run tests, inspect artifacts, read diffs; on error, roll back and read the logs instead of patching blind.</p><p><strong>4. Bank what’s reusable.</strong> Scripts, templates, protocols — so the next session starts faster.</p><p>Line stays clear: the agent is fast, I’m accountable.</p>',

    'blog.p7.date':  '04/05',
    'blog.p7.title': 'A source leak, a packaging lesson',
    'blog.p7.body':  '<p>The Claude Code leak came down to something embarrassingly plain: the toolchain <strong>generates source maps by default</strong>, the release script never excluded them, and 512k lines walked out the door.</p><p>Four rules I took from it:<strong>（1）Whitelist, not blacklist.</strong> Use `files` to declare exactly what ships. Playing whack-a-mole in `.npmignore` means one missed line = full exposure.</p><p><strong>（2）Strip debug artifacts from production.</strong> Source maps, `.env`, fixtures, internals — out. No mapping from shipped bytes back to source.</p><p><strong>（3）Assert in CI.</strong> Even a dumb rule like “fail if any `*.map` lands in the package” turns this class of bug into a build error instead of a breach.</p><p><strong>（4）Fix it dead-on the first time.</strong> It already happened in Feb 2025, then quietly repeated. A mistake you don’t fix comes back at higher interest.</p>',

    'blog.p8.date':  '08/12',
    'blog.p8.title': 'How this site is built',
    'blog.p8.body':  '<p>This homepage stays deliberately minimal: <strong>plain HTML + CSS + JS, zero build, zero dependencies</strong>. Edit a line and it ships; open and it runs.</p><p>Some implementation notes:<strong>bilingual</strong> via `data-i18n` attributes and a per-locale string map; <strong>theming</strong> combines `data-theme` + `prefers-color-scheme` for “system / light / dark” and syncs the `theme-color` meta; <strong>scroll reveals</strong> use IntersectionObserver; <strong>project modals</strong> rebuild content in the active language.</p><p>No framework, no transpile — hand-written and boring, in the good sense. Sometimes less is more.</p>',

    'blog.p9.date':  '06/25',
    'blog.p9.title': 'Design makes it wanted; tooling makes it used',
    'blog.p9.body':  '<p>Design makes things look good; tools make things work. But the part that actually matters is the second one — <strong>making people want to keep using it</strong>. A tool that needs a search every time, or a manual every command, won’t hold anyone no matter how pretty.</p><p>So my rule of thumb is: good tooling respects time. Don’t make users wait, repeat, or relearn — turn “I know how to do it” into “I can just do it”.</p><p>Design is what makes you <em>want</em> to use it; tooling is what lets you <em>keep</em> using it. In the end both have to meet.</p>',

    'blog.p10.date':  '08/15',
    'blog.p10.title': 'Websites I keep coming back to',
    'blog.p10.body':  '<p>It’s getting rare to find sites worth reading twice and learning from. I’ll put <strong>diginfo.me</strong> first — my style of writing this post (and many others) borrows from it.</p><ul><li><strong>diginfo.me</strong> — FreezeSoul’s code shop. Engineering-heavy content on AI coding, agents and source-level teardowns, with long, high-signal essays.</li><li><strong>Hacker News</strong> — news.ycombinator.com. The daily weather vane of the tech community; often the comments are worth more than the post.</li><li><strong>Ruan Yi</strong>’s log — ruanyifeng.com. Explains new tech in plain language with weekly round-ups; a friendly entry point.</li><li><strong>GitHub Trending</strong> — github.com/trending. A daily scan of new repos and tech momentum.</li><li><strong>Engineering blogs</strong> — big-company engineering teams (Netflix, Cloudflare, …), great depth when I’m designing serious systems.</li></ul><p>Choosing websites is like choosing friends: few, good, and revisited.</p>',

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
