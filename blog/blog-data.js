/* ============================================================
   eason / blog — shared post data
   Rendered by both index.html (list) and post.html (single)
   ============================================================ */

const BLOG_DATA = {
  categories: {
    engineering: { zh: '工程', en: 'Engineering' },
    project:     { zh: '项目', en: 'Project' },
    learning:    { zh: '学习', en: 'Learning' },
    essay:       { zh: '随笔', en: 'Essay' }
  },
  posts: [
    {
      slug: 'claude-code-leak',
      date: '2026-03-31',
      category: 'engineering',
      tags: ['AI', '工程'],
      title: { zh: 'Claude Code 源码泄露事件', en: 'The Claude Code source leak' },
      excerpt: {
        zh: '一行配置漏掉的 source map，51.2 万行代码就这么出了门——事件之外，它留下一堂尽头的打包工程课。',
        en: 'A source map the build never excluded walked 512k lines of code out the door — a leak that doubles as a packaging-engineering lesson.'
      },
      body: {
        zh: '<p class="lead">2026 年 3 月 31 日，Anthropic 发布 Claude Code v2.1.88 时，因为打包工具默认生成 source map、`.npmignore` 又漏掉了 `*.map`，把约 <strong>51.2 万行 TypeScript、1900 个文件</strong>完整带进了 npm 包。</p><p>这是一份 59.8MB 的 <code>cli.js.map</code>——未混淆、直接指向公开的 Cloudflare R2 桶。任何人都能顺着这条 link 下载完整源码，全程不需要任何入侵技巧。</p><h4>发生了什么</h4><ul><li>安全研究员 Chaofan Shou 发现后公开，几小时内 GitHub 上出现成千上万的镜像与 fork，体量创下纪录。</li><li>Anthropic 随即撤回包，并对约 8100 个仓库发起 DMCA 下架。</li><li>模型权重、客户数据并未泄露，但整套工程架构、隐藏功能与路线图全部曝光。</li></ul><h4>比代码更值得看的是路线图</h4><p>除了源码，泄露物里还有 44 个隐藏 feature flag、一堆未发布功能——KAIROS 守护进程、反蒸馏的「假工具注入」、Buddy 宠物系统——以及一个代号「Capybara」的未发布模型。竞品拿到的不仅是代码，是一整张路线图。</p><blockquote>这其实是同一错误第二次发生——上一次在 2025 年 2 月。</blockquote><p>重复翻车，比首次翻车更警示：一个没被吃透的教训，会以更高的利息返场。</p>',
        en: '<p class="lead">On March 31, 2026, Anthropic published Claude Code v2.1.88 with roughly <strong>512,000 lines of TypeScript across ~1,900 files</strong> bundled into the npm package, because the bundler generated a source map and `.npmignore` forgot to exclude `*.map`.</p><p>The culprit was a 59.8MB <code>cli.js.map</code> — unminified, pointing straight at a public Cloudflare R2 bucket. Anyone could follow the link and reconstruct the full source, no tricks required.</p><h4>What happened</h4><ul><li>Researcher Chaofan Shou shared it publicly; within hours GitHub was flooded with mirrors and forks at record scale.</li><li>Anthropic pulled the package and filed DMCA takedowns against ~8,100 repos.</li><li>No model weights or user data leaked, but the entire engineering architecture, hidden features and strategy were exposed.</li></ul><h4>The roadmap matters more than the code</h4><p>Beyond the source itself sat 44 hidden feature flags and a pile of unshipped features — the KAIROS background daemon, anti-distillation fake-tool injection, a Buddy pet system — plus an unreleased model codenamed “Moon”. Rivals didn’t just get code, they got the roadmap.</p><blockquote>This was the second time the same mistake had happened — the first was February 2025.</blockquote><p>A repeated mistake is scarier than a one-off. An unlearned lesson returns at a higher price.</p>'
      }
    },
    {
      slug: 'packaging-lessons-from-leak',
      date: '2026-04-05',
      category: 'engineering',
      tags: ['工程', '发布'],
      title: { zh: '一次源码泄露，一堂打包工程课', en: 'A source leak, a packaging lesson' },
      excerpt: {
        zh: '产物白名单、关闭调试映射、CI 里断言「不该有 .map」——从那次泄露里能落地的四件事。',
        en: 'Whitelist what ships, strip debug artifacts, assert it in CI — four things a source leak can teach you about packaging.'
      },
      body: {
        zh: '<p class="lead">Claude Code 那次泄露，根因朴素得反常识：工具<strong>默认生成</strong> source map，发行时又忘了排除——正好一行配置，51 万行代码就出了门。</p><p>真实工程里，安全失败往往就是这么「无聊」。下面是几条可以立刻落地的经验。</p><h4>1. 产物白名单，而不是黑名单</h4><p>用 <code>files</code> 字段显式声明要发布什么，比在 <code>.npmignore</code> 里不断打补丁可靠得多。黑名单是「只要我漏了哪一行」。补丁，等于裸奔。</p><h4>2. 生产构建关掉调试信息</h4><p>source map、<code>.env</code>、测试夹具、内部脚本，一律不进发布包。线上产物不该存在「从字节映射回源码」的能力。</p><h4>3. CI 里做『不该在包里』的断言</h4><p>哪怕简单到「检测到 <code>.map</code> 就失败」，也能把这个 null、错类的 bug 拦在上线前，而变成一次构建错误而不是一次事故。</p><h4>4. 同类错误第一次就该封死</h4><p>2025 年 2 月已经发生过一次，结果半年后重演。只归因、不治理，教训就以利息的形式回来。</p><blockquote>安全不是某个特工干的一次「行动」，而是一整套普通、无聊、可重复的工程习惯。</blockquote>',
        en: '<p class="lead">The Claude Code leak came down to something embarrassingly plain: the toolchain <strong>generates source maps by default</strong>, the release never excluded them, and 512k lines walked out.</p><p>Security failures in real engineering tend to be this unfussy. Here are four rules I take from it.</p><h2>1. Whitelist, not blacklist</h2><p>Use the <code>files</code> field to declare exactly what ships. Playing whack-a-mole in <code>.npmignore</code> means one missed line equals full exposure.</p><h2>2. Strip debug artifacts from production</h2><p>Source maps, <code>.env</code>, fixtures, internals — all out. Shipping bytes should not map back to your source.</p><h2>3. Assert on disallowed artifacts in CI</h2><p>Even a dumb rule like “fail if any <code>.map</code> leaves the gate” turns these bugs into build errors instead of breaches.</p><h2>4. Nail it dead-on the first time</h2><p>It already happened in Feb 2025, then quietly repeated. A mistake you don’t fix comes back at interest.</p><blockquote>Security isn’t a heroic incident; it’s a boring, repeatable, reviewable set of engineering habits.</blockquote>'
      }
    },
    {
      slug: 'github-project-search',
      date: '2026-07-15',
      category: 'project',
      tags: ['工具', 'GitHub'],
      title: { zh: 'GitHub 全网开源项目搜索', en: 'GitHub-wide open source search' },
      excerpt: {
        zh: '找库不应该是个别扭的活儿。用官方搜索接口把「查、筛、看」压进几秒的原型，拆给一个首页的自我介绍。',
        en: 'Finding a library shouldn’t be a chore. A small tool that collapses find, filter and browse into a few seconds.'
      },
      body: {
        zh: '<p class="lead">需求朴素：「找一个能用、维护还不错、语言对的库」，却没有一个顺手的入口。于是自己写了一个。</p><p>它调用 <a href="https://docs.github.com/rest" rel="noopener" target="_blank">GitHub 搜索接口</a>：按关键词搜索开源项目，支持按 star / fork / 最近更新排序，按语言筛选，并在卡片上即时预览仓库简介与 README 摘要。</p><h4>为什么值得做</h4><ul><li>把「查、筛、看」三步压进几秒，少打断一次心流。</li><li>操作全在浏览器，无后端、无登录，open 就能用。</li><li>横向可以随时加「语言、话题、star 区间」等过滤器。</li></ul><h4>取舍</h4><p>它选择 es 不炫技，只把高频路径做到顺滑。项目的价值，不在技术深度，在这件事每天帮你省下几段等待。</p>',
        en: '<p class="lead">The need is plain: “find a maintained, right-language library” shouldn’t be a chore. So I built a small tool for it.</p><p>It calls the <a href="https://docs.github.com/rest" rel="noopener" target="_blank">GitHub search API</a>, sorts results by stars / forks / recency, filters by language, and shows repo descriptions plus a README digest right on the card.</p><h4>Why it was worth building</h4><ul><li>Collapses search, filter and browse into a few seconds — fewer interruptions per day.</li><li>Everything runs in the browser: no backend, no deps, just open and use.</li><li>Filters like topics, star range and language are trivial to add later.</li></ul><h4>Trade-offs</h4><p>It deliberately shows off nothing. The value isn’t technical depth — it’s quietly saving those few seconds every single day.</p>'
      }
    },
    {
      slug: 'dialogue-tree-editor',
      date: '2026-06-02',
      category: 'project',
      tags: ['工具', '可视化'],
      title: { zh: '节点化对话树剧本编辑器', en: 'Node-based dialogue tree editor' },
      excerpt: {
        zh: '把互动叙事的剧情结构变成「看得见的图」：拖节点、连分支、导 JSON，再即时预览。',
        en: 'Turning interactive-narrative structure into a visible graph: drag nodes, wire branches, export JSON, preview in real time.'
      },
      body: {
        zh: '<p class="lead">一个可视化的<strong>节点化对话树编辑器</strong>，用于写游戏或互动叙事的剧本。</p><p>核心交互是把「剧情结构」可视化：拖拽节点建立分支，连线表达条件与跳转，导出 JSON 剧本数据，并即时预览演出效果。</p><h4>它解决什么</h4><ul><li>手写脚本时，剧情嵌套一深就难看出「这幕从哪走进哪」，图则一目了然。</li><li>改分支、删支线，所见即所得，而不是在文本里逐行挣扎。</li><li>结构是一次性资产：导出 JSON 可直接供引擎解析。</li></ul><h4>定位</h4><p>它面向做「脚本型互动内容」的人。对我自己，它也是附着在交互叙事上的一次实操尝试——做一个「改得动剧情」的东西，比做一个「只写死一段剧情」的东西难得多，也有聊得多。</p>',
        en: '<p class="lead">A visual <strong>node-based dialogue tree editor</strong> for writing scripts for games and interactive narrative.</p><p>The core idea is to make story structure visible: drag nodes to shape scenes, wire connections to express branches and jumps, export JSON, and preview the result in real time.</p><h4>What it solves</h4><ul><li>Hand-writing scripts gets unreadable as branches nest; a graph keeps the whole picture legible.</li><li>Refactoring a branch means dragging a node, not editing text line by line.</li><li>The structure is a first artifact: exported JSON feeds your engine directly.</li></ul><h4>Positioning</h4><p>It targets people building scripted interactive content. For me it’s also a hands-on run at interactive narrative — building a tool that lets the story change beats merely writing one story.</p>'
      }
    },
    {
      slug: 'football-score-prediction',
      date: '2026-05-01',
      category: 'project',
      tags: ['数据', '统计'],
      title: { zh: '足球比分预测', en: 'Football score prediction' },
      excerpt: {
        zh: '不回到给一个「谁赢」，而是给一份「各比分出现的概率分布」——让预测把不确定摆上桌。',
        en: 'Instead of “who wins”, output a probability spread over all scores — let the prediction lay uncertainty right on the table.'
      },
      body: {
        zh: '<p class="lead">一个兴趣驱动的<strong>足球比分预测</strong>项目：用历史比赛数据建模，输出的是各比分出现的<strong>概率分布</strong>，而不是简单的「谁赢、几比几」。</p><p>我想要的不是确定感，而是<strong>看得到的不确定</strong>。</p><h4>技术要点</h4><ul><li>特征工程：主客、近期状态、攻防强度、休息天数……少而有用，宁缺毋滥。</li><li>分布建模：拟合进失球速率为泊松参数，推演出比分联合分布。</li><li>回测闭环：每次赛后拿真实结果对质假设，推导模型用的数据。</li></ul><h4>它带来的练习</h4><p>比预测本身更有价值的，是整条链路——统计建模、特征取舍、结果检验。每一次赛后回测，都是一次与自己假设的坦诚对话。</p>',
        en: '<p class="lead">A hobby-driven <strong>football score prediction</strong> project that models historical match data and outputs a <strong>probability spread</strong> over every possible score — not a single “who wins”.</p><p>What I want isn’t certainty; it’s uncertainty you can see and hold.</p><h4>Technical notes</h4><ul><li>Feature engineering: home/away edge, recent form, attack/defence strength, rest days — few and useful, not “everything”.</li><li>Distribution modelling: model goals conceded as Poisson terms to derive a joint score distribution.</li><li>A backtest loop: every post-match review re-fights my own assumptions against reality.</li></ul><h4>The real exercise</h4><p>More valuable than the forecasts is the pipeline — statistical modelling, data engineering, honest validation. Every backtest is a negotiation with my own assumptions.</p>'
      }
    },
    {
      slug: 'build-with-agents',
      date: '2026-08-01',
      category: 'learning',
      tags: ['Agent', '工作流'],
      title: { zh: '如何用 Agent 更好地做东西', en: 'How to build better with agents' },
      excerpt: {
        zh: 'Agent 负责「快」，我负责「对」。三条被你忽略的常识，是我用它造东西的全部心法。',
        en: 'Let the agent be fast; you be right. Three unglamourous habits that carry my entire agent workflow.'
      },
      body: {
        zh: '<p class="lead">最近几个月我几乎都用 AI Agent 造东西。心得很多，落到核心里就一句话：<strong>Agent 负责快，我负责对。</strong></p><h2>1. 让 Agent 负责体力活</h2><p>查资料、写草稿、搭脚手架这类「快」的活，交给它；方向、审美、决定权这恰恰「对」的活，留在自己手里。</p><h2>2. 任务拆小，给足上下文</h2><p>把一个大需求拆成一打可验证的小砖，比让它一口气憋一个大功能稳得多。想让 Agent 不瞎猜，先给它看代码、约定和失败日志。</p><h2>3. 结果落地验证</h2><p>跑测试、看产物、读 diff，而不是默认「它跑完了就对」。Agent 走偏了，一是时间、一次上下文，都是最贵的浪费。</p><blockquote>工具只是放大器，放大的是你的判断力。放大器不替你思考。</blockquote>',
        en: '<p class="lead">I’ve been building nearly everything with AI agents lately. It boils down to one sentence.</p><p><strong>Let the agent be fast; you be right.</strong></p><h2>1. Let the agent do the grunt work</h2><p>Research, drafts, scaffolding — the fast stuff. Direction, qualities and the final call — the right stuff — stays with me.</p><h2>2. Break it small, feed the context</h2><p>Small verifiable steps beat one giant feature. Give it my code, my conventions and the failing logs instead of expecting mind-reading.</p><h2>3. Live with the output</h2><p>Run the tests, read the diff, look at real artifact. An agent that veered left cost you time and context — the most expensive resource of all.</p><blockquote>A tool is just an amplifier that multiplies your judgment. It won’t think for you.</blockquote>'
      }
    },
    {
      slug: 'agent-workflow-practice',
      date: '2026-08-10',
      category: 'learning',
      tags: ['Agent', '实践'],
      title: { zh: '用 Agent 工作流实践', en: 'A practical agent workflow' },
      excerpt: {
        zh: '先计划再动手、上下文靠喂不靠猜、计划·执行·验证三阶段，加上「把可复用的沉淀」。',
        en: 'Plan first, feed don’t guess, Plan→Do→Verify every step, and bank what’s reusable.'
      },
      body: {
        zh: '<p class="lead">把 Agent 当「同事」后，效率才真正上来。这套流程，是我这几个月反复磨出来的。</p><h2>1. 先计划，再动手</h2><p>让 Agent 先输出计划：目标、步骤、验收点。我反复一遍再放行——计划是我介入和纠偏的最靠近抓手。</p><h2>2. 上下文「喂」给，不靠它对猜</h2><p>把约定、现有代码、失败的日志一次性给它。花在「给它看路」上的时间，远小于「解释为什么不行」的时间。</p><h2>3. 计划 → 执行 → 验证</h2><p>每一步都有明确的「完成标准」。跑测试、看产物、读 diff；出错就回退，读日志定位，而不是让它硬编。</p><h2>4. 把可复用的沉淀下来</h2><p>常做的动作收敛成说明、模板、协议，让下一次启动更快、更稳。复用的对象，不只是代码，是整个「起手式」。</p>',
        en: '<p class="lead">Efficiency arrived once I treated the agent as a collaborator, not a fancy autocomplete.</p><h2>1. Plan first, then act</h2><p>Ask it to lay out a plan — goals, steps, constraints, exit criteria. I review it, then let it run. The plan is my cheapest handle.</p><h2>2. Feed context, don’t make it guess</h2><p>Point it at existing code, conventions, and failing logs upfront. Time spent walking it through the docs beats hours of “why doesn’t this work”.</p><h2>3. Plan → execute → verify</h2><p>Every step carries a clear “done” check. Run tests, read artifacts, read diffs. On error, stop and read the logs — don’t patch blind.</p><h2>4. Bank what’s reusable</h2><p>Fold recurring moves into scripts, templates, and protocols so the next session starts faster. What you’re crystallising is the whole workflow, not just code.</p>'
      }
    },
    {
      slug: 'how-this-site-is-built',
      date: '2026-08-12',
      category: 'engineering',
      tags: ['工程', '前端'],
      title: { zh: '这个站是怎么造的', en: 'How this site is built' },
      excerpt: {
        zh: '纯 HTML + CSS + JS、零构建、零依赖。双语、主题三态、滚动展示与作品弹窗，都是在一行行手写里长出来的。',
        en: 'Plain HTML + CSS + JS, zero build, zero dependencies. Bilingual, three-state theming, reveal-on-scroll and project modals — all handwritten.'
      },
      body: {
        zh: '<p class="lead">这个主页刻意保持简单：纯 HTML + CSS + JS，<strong>零构建、零依赖</strong>。改一行就能上线，打开就能看。</p><h2>几个关键点</h2><ul><li><strong>双语</strong>：<code>data-i18n</code> 属性 + 语言词典替换文本，切换经 localStorage 记住。</li><li><strong>主题</strong>：<code>data-theme</code> + <code>prefers-color-scheme</code> 组合，「跟随系统 / 浅 / 深」三态，并同步 <code>theme-color</code>。</li><li><strong>滚动展示</strong>：IntersectionObserver 逐项显现；导航用同一观察器做滚动高亮。</li><li><strong>作品弹窗</strong>：按当前语言动态生成内容。</li><li><strong>博客</strong>：数据集中在 <code>/blog/blog-data.js</code>，列表页与单篇页共用一次渲染。</li></ul><h2>为什么这样</h2><p>没框架、没转译就是「无聊但稳」的那种好。希望它传递的东西是内容本身，而不是关于技术的「炫技」——有时候，其实更简单。</p>',
        en: '<p class="lead">This homepage stays deliberately minimal: plain HTML + CSS + JS, <strong>zero build, zero dependencies</strong>. Edit a line and it’s shipped; open and it runs.</p><h2>Key decisions</h2><ul><li><strong>Bilingual</strong>: a <code>data-i18n</code> attribute plus a string map that swaps text by language; previously rembed via localStorage.</li><li><strong>Theming</strong>: <code>data-theme</code> + <code>prefers-color-scheme</code> for “system / light / dark”, syncing the <code>theme-color</code> meta.</li><li><strong>Reveal on scroll</strong>: IntersectionObserver reveals items; the same observer drives nav scroll-highlighting.</li><li><strong>Project modals</strong>: built dynamically in the active language.</li><li><strong>Blog</strong>: shared <code>/blog/blog-data.js</code> renders both the list and single-post pages.</li></ul><h2>Why this way</h2><p>No framework, no transpile — the boring-but-good kind of simple. It keeps the weight on the content, not on the machinery.</p>'
      }
    },
    {
      slug: 'design-and-tooling-essay',
      date: '2026-06-25',
      category: 'essay',
      tags: ['随笔', '设计'],
      title: { zh: '设计让人想用，工具让人愿意', en: 'Design makes it wanted; tooling makes it used' },
      excerpt: {
        zh: '设计让东西「好看」，工具让东西「好用」——但真正让它活下去的，是我更在意的「人愿意用」。',
        en: 'Design makes it look great; tooling makes you want to use it. Only the second keeps people coming back.'
      },
      body: {
        zh: '<p class="lead">设计让东西「好看」、工具让东西「好用」，而我越来越觉得更重要的其实是后者——<strong>让人愿意用下去</strong>。</p><p>一个工具如果每次都要查文档、抄命令、忍受卡顿，再美也留不住人。美是入场券，顺滑才是日常。</p><h4>好的工具设计 = 尊重时间</h4><ul><li>别让用户等。</li><li>别让用户想太久。</li><li>别让用户反复学同一个东西。</li></ul><p>把「我知道该怎么做」翻译成「他顺手就能做」，就是我写作时的取舍。</p><blockquote>设计决定你「想不想用」，工具决定你「愿不愿意长期用」。两者终究要合二为一。</blockquote>',
        en: '<p class="lead">Design makes things look good, and tooling makes them work. But what I think actually matters is the second one — <strong>getting people to keep using it</strong>.</p><p>A tool you have to look up, type manually, or fight the lag every time won’t hold anyone, no matter how pretty. Looks are the ticket in; flow is the ticket every day after.</p><h2>Respect the user’s time</h2><ul><li>Don’t make them wait.</li><li>Don’t make them think too long.</li><li>Don’t make them relearn the same thing.</li></ul><p>Turning “I know how to do it” into “I can just do it” is my standing design pattern.</p><blockquote>Design makes you want to use it; tooling lets you keep using it. In the end both have to meet.</blockquote>'
      }
    },
    {
      slug: 'good-websites',
      date: '2026-08-15',
      category: 'essay',
      tags: ['推荐', '网站'],
      title: { zh: '我常读的好网站', en: 'Websites I keep coming back to' },
      excerpt: {
        zh: '把 diginfo.me 放在第一位，因为它教会我「硬核长文」该有的样子。接着列几处常回访的站。',
        en: 'diginfo.me first — it shaped how I write long, engineering essays. Then the few sites I actually revisit.'
      },
      body: {
        zh: '<p class="lead">值得反复读、读完之后能涨东西的网站越来越少，所以要记下来。放在最前的<strong>diginfo.me</strong>，正是这篇的来由。</p><ul><li><strong>diginfo.me</strong> — 许的代码机房。AI 编程、Agent、源码级解构，长文质量很硬。</li><li><strong>Hacker News</strong>（news.ycombinator.com）— 技术圈每日风向，评论区常常比正文贵。</li><li><strong>阮一峰的网络日志</strong>（ruanyifeng.com）— 用大白话讲新技术、做科技周报，是友好的入口。</li><li><strong>GitHub Trending</strong> — 每天扫一眼新仓库、看技术趋势。</li><li><strong>大厂工程博客</strong> — Netflix、Cloudflare 等，做深技术方案时很耐读。</li></ul><p>挑网站，和挑朋友一样：少而精，常往来。遇到好站，随手记下，长期拉动。</p>',
        en: '<p class="lead">Reading something that stays with you is getting rare, so it’s worth writing down. I’ll start with <strong>diginfo.me</strong> — it’s why this post exists.</p><ul><li><strong>diginfo.me</strong> — FreezeSoul’s code shop; AI coding, agents, source-level teardowns. Consistently high signal.</li><li><strong>Hacker News</strong> — the daily weather vane; comment sections are often worth more than the post.</li><li><strong>Ruan Yi</strong>’s log — explains new tech plainly; a friendly on-ramp.</li><li><strong>GitHub Trending</strong> — a daily glance at new repos and momentum.</li><li><strong>Engineering blogs</strong> — Netflix, Cloudflare and friends, great when designing serious systems.</li></ul><p>Choosing websites is like choosing friends: few, good, and revisited.</p>'
      }
    }
  ]
};