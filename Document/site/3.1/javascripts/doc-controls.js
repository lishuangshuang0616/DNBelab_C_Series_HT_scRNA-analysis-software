window.DNBC_DOCS = {"current": "3.1", "root": "../", "default": "3.2", "versions": [{"version": "3.2", "path": "", "pages": ["404.html", "doc/dataset.html", "doc/installation.html", "doc/installation_previous.html", "doc/io.html", "doc/json.html", "doc/migration.html", "doc/outs/c6.html", "doc/outs/multi.html", "doc/outs/outs.html", "doc/outs/scATAC.html", "doc/outs/scRNA.html", "doc/outs/scVDJ.html", "doc/parameter/c6.html", "doc/parameter/multi.html", "doc/parameter/parameter.html", "doc/parameter/scATAC.html", "doc/parameter/scRNA.html", "doc/parameter/scVDJ.html", "doc/parameter/tools.html", "doc/pipeline/c6.html", "doc/pipeline/multi.html", "doc/pipeline/pipeline.html", "doc/pipeline/scATAC.html", "doc/pipeline/scRNA.html", "doc/pipeline/scVDJ.html", "doc/quickstart.html", "doc/release.html", "doc/structure.html", "doc/troubleshooting.html", "en/doc/dataset.html", "en/doc/installation.html", "en/doc/installation_previous.html", "en/doc/io.html", "en/doc/json.html", "en/doc/migration.html", "en/doc/outs/c6.html", "en/doc/outs/multi.html", "en/doc/outs/outs.html", "en/doc/outs/scATAC.html", "en/doc/outs/scRNA.html", "en/doc/outs/scVDJ.html", "en/doc/parameter/c6.html", "en/doc/parameter/multi.html", "en/doc/parameter/parameter.html", "en/doc/parameter/scATAC.html", "en/doc/parameter/scRNA.html", "en/doc/parameter/scVDJ.html", "en/doc/parameter/tools.html", "en/doc/pipeline/c6.html", "en/doc/pipeline/multi.html", "en/doc/pipeline/pipeline.html", "en/doc/pipeline/scATAC.html", "en/doc/pipeline/scRNA.html", "en/doc/pipeline/scVDJ.html", "en/doc/quickstart.html", "en/doc/release.html", "en/doc/structure.html", "en/doc/troubleshooting.html", "en/index.html", "index.html"]}, {"version": "3.1", "path": "3.1/", "pages": ["404.html", "doc/dataset.html", "doc/installation.html", "doc/installation_previous.html", "doc/io.html", "doc/json.html", "doc/outs/multi.html", "doc/outs/outs.html", "doc/outs/scATAC.html", "doc/outs/scRNA.html", "doc/outs/scVDJ.html", "doc/parameter/multi.html", "doc/parameter/parameter.html", "doc/parameter/scATAC.html", "doc/parameter/scRNA.html", "doc/parameter/scVDJ.html", "doc/parameter/tools.html", "doc/pipeline/multi.html", "doc/pipeline/pipeline.html", "doc/pipeline/scATAC.html", "doc/pipeline/scRNA.html", "doc/pipeline/scVDJ.html", "doc/quickstart.html", "doc/release.html", "doc/structure.html", "en/doc/dataset.html", "en/doc/installation.html", "en/doc/installation_previous.html", "en/doc/io.html", "en/doc/json.html", "en/doc/outs/multi.html", "en/doc/outs/outs.html", "en/doc/outs/scATAC.html", "en/doc/outs/scRNA.html", "en/doc/outs/scVDJ.html", "en/doc/parameter/multi.html", "en/doc/parameter/parameter.html", "en/doc/parameter/scATAC.html", "en/doc/parameter/scRNA.html", "en/doc/parameter/scVDJ.html", "en/doc/parameter/tools.html", "en/doc/pipeline/multi.html", "en/doc/pipeline/pipeline.html", "en/doc/pipeline/scATAC.html", "en/doc/pipeline/scRNA.html", "en/doc/pipeline/scVDJ.html", "en/doc/quickstart.html", "en/doc/release.html", "en/doc/structure.html", "en/index.html", "index.html"]}]};
(() => {
  const config = window.DNBC_DOCS;
  const script = document.currentScript;
  const versionBase = new URL('../', script.src);
  const siteBase = new URL(config.root, versionBase);
  const currentPath = window.location.pathname.slice(versionBase.pathname.length) || 'index.html';
  const english = currentPath.startsWith('en/');
  const pagePath = english ? currentPath.slice(3) : currentPath;
  const text = (zh, en) => english ? en : zh;
  const ready = () => {
    const header = document.querySelector('.md-header__inner');
    if (!header || header.querySelector('.doc-version')) return;
    const label = document.createElement('label');
    label.className = 'doc-version';
    const caption = document.createElement('span');
    caption.textContent = text('版本', 'Version');
    const select = document.createElement('select');
    select.setAttribute('aria-label', text('切换文档版本', 'Documentation version'));
    for (const entry of config.versions) {
      const option = document.createElement('option');
      option.value = entry.version;
      option.textContent = entry.version + (entry.version === config.default ? text('（默认）', ' (default)') : '');
      option.selected = entry.version === config.current;
      select.append(option);
    }
    select.addEventListener('change', () => {
      const entry = config.versions.find(item => item.version === select.value);
      const exists = entry.pages.includes(currentPath);
      const target = exists ? currentPath : (english ? 'en/index.html' : 'index.html');
      const url = new URL(entry.path + target, siteBase);
      url.search = window.location.search;
      if (exists) url.hash = window.location.hash;
      window.location.assign(url.href);
    });
    label.append(caption, select);
    const language = header.querySelector('.md-header__option .md-select');
    if (language) {
      const link = document.createElement('a');
      link.className = 'doc-language';
      link.textContent = english ? '中文' : 'English';
      link.hreflang = english ? 'zh' : 'en';
      link.setAttribute('aria-label', english ? '切换到中文' : 'Switch to English');
      const url = new URL((english ? '' : 'en/') + pagePath, versionBase);
      url.search = window.location.search;
      url.hash = window.location.hash;
      link.href = url.href;
      language.replaceWith(link);
      link.parentElement.before(label);
    } else {
      header.append(label);
    }
    if (config.current !== config.default) {
      const notice = document.createElement('aside');
      notice.className = 'doc-archive-notice';
      notice.setAttribute('aria-label', text('历史版本提示', 'Archived version'));
      notice.append(document.createTextNode(text('你正在阅读 3.1 历史文档。', 'You are reading the archived 3.1 manual. ')));
      const link = document.createElement('a');
      const latest = config.versions.find(item => item.version === config.default);
      link.href = new URL(latest.path + currentPath, siteBase).href;
      link.textContent = text('查看 3.2 文档', 'Read the 3.2 manual');
      notice.append(link);
      document.querySelector('.md-content__inner')?.prepend(notice);
    }

    // Seamlessly follow browser/system dark mode preferences (no toggle icon)
    if (config.current === '3.2') {
      try {
        for (const key of Object.keys(localStorage)) {
          if (key.includes('__palette')) {
            localStorage.removeItem(key);
          }
        }
      } catch (e) {}

      const syncScheme = () => {
        const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.setAttribute('data-md-color-scheme', isDark ? 'slate' : 'default');
      };
      if (window.matchMedia) {
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        if (media.addEventListener) {
          media.addEventListener('change', syncScheme);
        } else if (media.addListener) {
          media.addListener(syncScheme);
        }
        syncScheme();
      }
    }

    // Enhance parameter badges and semantic callouts in 3.2
    if (config.current === '3.2') {
      document.querySelectorAll('.md-typeset h4').forEach(h4 => {
        h4.childNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE && node.nodeValue) {
            const val = node.nodeValue;
            if (/\((?:必需|Required|可选|Optional|方式\d+|Option \d+|推荐|Recommended)\)/i.test(val)) {
              const span = document.createElement('span');
              span.innerHTML = val
                .replace(/\((必需|Required)\)/gi, '<span class="doc-badge doc-badge-req">$1</span>')
                .replace(/\((可选|Optional)\)/gi, '<span class="doc-badge doc-badge-opt">$1</span>')
                .replace(/\((方式\d+|Option \d+)\)/gi, '<span class="doc-badge doc-badge-mode">$1</span>')
                .replace(/\((推荐|Recommended)\)/gi, '<span class="doc-badge doc-badge-tip">$1</span>');
              node.replaceWith(span);
            }
          }
        });
      });

      document.querySelectorAll('.md-typeset blockquote').forEach(bq => {
        const strong = bq.querySelector('p:first-child > strong:first-child, strong:first-child');
        if (strong) {
          const t = strong.textContent.trim();
          if (/^(?:注意|警告|Warning|Caution)/i.test(t)) {
            bq.classList.add('doc-callout-warn');
          } else if (/^(?:提示|技巧|Tip|Note)/i.test(t)) {
            bq.classList.add('doc-callout-tip');
          } else if (/^(?:开始前|前置|要求|Prerequisite)/i.test(t)) {
            bq.classList.add('doc-callout-info');
          }
        }
      });
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
})();
