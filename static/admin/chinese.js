// chinese.js
// 通用 IME 兼容脚本：确保 CodeMirror <textarea> 输入与 contenteditable 区都支持中文输入
(function() {
    // 为 textarea 绑定 IME 事件
    function enhanceTextarea(el) {
      if (el.dataset.imeEnhanced) return;
      el.dataset.imeEnhanced = '1';
      el.addEventListener('compositionstart', () => {
        el.dataset.composing = 'true';
      });
      el.addEventListener('compositionend', () => {
        delete el.dataset.composing;
        el.dispatchEvent(new Event('input', { bubbles: true }));
      });
    }
  
    // 为 CodeMirror 实例的输入域绑定 IME 事件
    function enhanceCodeMirror(cm) {
      try {
        const input = cm.getInputField();
        if (!input || input.dataset.imeEnhanced) return;
        input.dataset.imeEnhanced = '1';
        input.addEventListener('compositionstart', () => {
          input.dataset.composing = 'true';
        });
        input.addEventListener('compositionend', () => {
          delete input.dataset.composing;
          input.dispatchEvent(new Event('input', { bubbles: true }));
        });
      } catch (e) {
        console.warn('无法增强 CodeMirror IME 支持', e);
      }
    }
  
    // 初始绑定
    document.addEventListener('DOMContentLoaded', () => {
      // 标准 textarea
      document.querySelectorAll('textarea').forEach(enhanceTextarea);
      // 已存在的 CodeMirror
      document.querySelectorAll('.CodeMirror').forEach(wrapper => {
        if (wrapper.CodeMirror) enhanceCodeMirror(wrapper.CodeMirror);
      });
    });
  
    // 监听动态插入节点
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType !== 1) return;
          // 新插入的 textarea
          if (node.tagName === 'TEXTAREA') enhanceTextarea(node);
          node.querySelectorAll && node.querySelectorAll('textarea').forEach(enhanceTextarea);
          // 新插入的 CodeMirror
          if (node.classList.contains('CodeMirror') && node.CodeMirror) {
            enhanceCodeMirror(node.CodeMirror);
          }
          node.querySelectorAll && node.querySelectorAll('.CodeMirror').forEach(w => {
            if (w.CodeMirror) enhanceCodeMirror(w.CodeMirror);
          });
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  })();
  
// 专门解决中文输入法问题的脚本
(function() {
  // 等待DOM和CMS完全加载
  const readyCheck = setInterval(() => {
    if (document.readyState === 'complete' && window.CMS) {
      clearInterval(readyCheck);
      setupChineseInputSupport();
    }
  }, 100);

  function setupChineseInputSupport() {
    console.log('启动中文输入支持...');
    
    // 强制所有markdown编辑器使用textarea模式
    CMS.registerEventListener({
      name: 'preSave',
      handler: () => {
        enforceTextareaMode();
      }
    });

    // 在每次路由变化时也强制执行(打开新页面时)
    CMS.registerEventListener({
      name: 'routeChange',
      handler: () => {
        setTimeout(enforceTextareaMode, 500);
      }
    });

    // 在每个字段加载后强制执行
    const fieldObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === 1) { // Element node
              const editors = node.querySelectorAll('.CodeMirror');
              editors.forEach(setupCodeMirror);
              
              // 检查Slate富文本编辑器并替换为Markdown模式
              const slateEditors = node.querySelectorAll('[data-slate-editor="true"]');
              slateEditors.forEach(convertToMarkdown);
            }
          }
        }
      }
    });

    fieldObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    // 立即执行一次强制模式检查
    setTimeout(enforceTextareaMode, 1000);
    
    // 添加全局CSS来确保CodeMirror的inputStyle被设置为textarea
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      /* 确保输入始终使用textarea原生模式 */
      .CodeMirror-focused .CodeMirror-line {
        caret-color: #000 !important;
      }
      
      /* 修复输入法候选窗口位置 */
      .CodeMirror-cursors {
        z-index: 11 !important;
      }
      
      /* 确保中文输入过程中不会闪烁 */
      .CodeMirror pre.CodeMirror-line {
        -webkit-font-variant-ligatures: none;
        font-variant-ligatures: none;
      }
      
      /* 保持输入法状态稳定 */
      .CodeMirror textarea {
        opacity: 0.8 !important;
        color: black !important;
        background: transparent !important;
      }
    `;
    document.head.appendChild(styleEl);
  }

  // 处理已存在的CodeMirror实例
  function setupCodeMirror(cmElement) {
    if (!cmElement || !cmElement.CodeMirror || cmElement.dataset.inputFixed) {
      return;
    }
    
    try {
      // 标记为已处理
      cmElement.dataset.inputFixed = 'true';
      
      // 应用textarea输入模式
      cmElement.CodeMirror.setOption('inputStyle', 'textarea');
      cmElement.CodeMirror.setOption('lineWrapping', true);
      
      console.log('成功配置CodeMirror实例为textarea模式');
    } catch (err) {
      console.error('配置CodeMirror失败:', err);
    }
  }
  
  // 将富文本编辑器转换为Markdown模式
  function convertToMarkdown(slateEditor) {
    if (!slateEditor || slateEditor.dataset.converted) {
      return;
    }
    
    try {
      // 查找相邻的模式切换按钮
      const controlBar = slateEditor.closest('.nc-entryEditor-widget')?.querySelector('.nc-entryEditor-toolbar');
      if (controlBar) {
        // 寻找Markdown切换按钮并点击它
        const markdownButton = Array.from(controlBar.querySelectorAll('button')).find(
          btn => btn.textContent.includes('Markdown') || btn.textContent.includes('Raw')
        );
        
        if (markdownButton) {
          markdownButton.click();
          slateEditor.dataset.converted = 'true';
          console.log('已将富文本编辑器转换为Markdown模式');
        }
      }
    } catch (err) {
      console.error('转换编辑器模式失败:', err);
    }
  }

  // 强制所有编辑器使用textarea模式
  function enforceTextareaMode() {
    // 处理所有CodeMirror实例
    document.querySelectorAll('.CodeMirror').forEach(setupCodeMirror);
    
    // 处理所有富文本编辑器
    document.querySelectorAll('[data-slate-editor="true"]').forEach(convertToMarkdown);
    
    // 检查模式指示器
    const modeIndicators = Array.from(document.querySelectorAll('.cms-editor-mode-button'));
    for (const indicator of modeIndicators) {
      // 如果显示"富文本"，则点击切换到markdown模式
      if (indicator.textContent.includes('富文本') || indicator.textContent.includes('Rich Text')) {
        indicator.click();
        // 等待DOM更新后再次检查
        setTimeout(() => {
          const submenu = document.querySelector('.cms-editor-mode-menu');
          if (submenu) {
            const markdownOption = Array.from(submenu.querySelectorAll('button')).find(
              btn => btn.textContent.includes('Markdown') || btn.textContent.includes('Raw')
            );
            if (markdownOption) {
              markdownOption.click();
              console.log('已切换到Markdown模式');
            }
          }
        }, 100);
      }
    }
    
    console.log('完成输入模式检查');
  }
})();
  