import EasyMDE from 'easymde';
import TurndownService from 'turndown';
import gfm from 'turndown-plugin-gfm';

// 等待CMS完全加载
const checkCMS = setInterval(function() {
  if (window.CMS) {
    clearInterval(checkCMS);
    configureMarkdown();
  }
}, 100);

function configureMarkdown() {
  console.log('配置Markdown编辑器...');
  
  // 注册自定义Markdown编辑器组件
  CMS.registerEditorComponent({
    id: 'enhanced-md',
    label: 'Markdown',
    fields: [{name: 'body', label: '正文', widget: 'text'}],
    pattern: /^/,
    fromBlock: () => ({}),
    toBlock: () => '',
    toPreview: () => '',
    init: function (args) {
      // 创建Turndown实例用于HTML转Markdown
      const td = new TurndownService({ headingStyle: 'atx' });
      td.use(gfm);
      
      // 监听粘贴事件自动转换HTML
      args.addEventListener('paste', e => {
        const html = e.clipboardData.getData('text/html');
        if (html) {
          e.preventDefault();
          args.value += td.turndown(html);
        }
      });
      
      // 创建EasyMDE实例，并强制用 <textarea> 模式
      const mde = new EasyMDE({ 
        element: args, 
        autosave: { 
          enabled: true, 
          delay: 5000,
          uniqueId: 'cms-' + Math.random().toString(36).substr(2, 9)
        },
        spellChecker: false,
        // **去掉 contenteditable**，以下一行强制 textarea
        inputStyle: 'textarea',
        status: ['autosave', 'lines', 'words'],
        toolbar: [
          'bold', 'italic', 'heading', '|',
          'quote', 'unordered-list', 'ordered-list', '|',
          'link', 'image', 'table', '|',
          'preview', 'side-by-side', 'fullscreen'
        ]
      });
      // 确保 CodeMirror 也拿到 textarea 设置
      mde.codemirror.setOption('inputStyle', 'textarea');
      return mde;
    },
  });
  
  // 监听DOM变化，处理新创建的编辑器
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.addedNodes && mutation.addedNodes.length > 0) {
        setupEditors();
      }
    });
  });
  
  // 开始观察文档变化
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // 配置编辑器
  function setupEditors() {
    // 查找EasyMDE编辑器容器
    const editorContainers = document.querySelectorAll('.EasyMDEContainer');
    
    editorContainers.forEach(container => {
      if (container.getAttribute('data-enhanced')) return;
      container.setAttribute('data-enhanced', 'true');
      
      console.log('发现EasyMDE编辑器，应用增强配置');
      
      // 查找CodeMirror实例并修改
      const cmEditor = container.querySelector('.CodeMirror');
      if (cmEditor && cmEditor.CodeMirror) {
        try {
          // 设置CodeMirror选项
          cmEditor.CodeMirror.setOption('inputStyle', 'textarea');
          cmEditor.CodeMirror.setOption('lineWrapping', true);
          
          // 监听自动保存事件
          cmEditor.CodeMirror.on('change', debounce(() => {
            const saveEvent = new CustomEvent('local-save', { detail: { timestamp: new Date() }});
            document.dispatchEvent(saveEvent);
          }, 5000));
          
          console.log('成功配置CodeMirror实例');
        } catch (e) {
          console.error('配置CodeMirror失败:', e);
        }
      }
      
      // 添加粘贴处理
      const textarea = container.querySelector('textarea');
      if (textarea) {
        textarea.addEventListener('paste', handlePasteWithFormat);
      }
    });
  }
  
  // 处理粘贴事件，保留格式
  function handlePasteWithFormat(e) {
    try {
      // 检查是否有HTML内容
      const clipboardData = e.clipboardData || window.clipboardData;
      if (!clipboardData) return;
      
      const html = clipboardData.getData('text/html');
      if (!html) return;
      
      // 创建Turndown实例并使用GFM插件
      const turndown = new TurndownService({
        headingStyle: 'atx',
        codeBlockStyle: 'fenced'
      });
      turndown.use(gfm);
      
      // 将HTML转换为Markdown
      e.preventDefault();
      const markdown = turndown.turndown(html);
      
      // 获取编辑器实例
      const container = this.closest('.EasyMDEContainer');
      if (container && container.querySelector('.CodeMirror') && container.querySelector('.CodeMirror').CodeMirror) {
        const cm = container.querySelector('.CodeMirror').CodeMirror;
        cm.replaceSelection(markdown);
      } else {
        // 回退到标准插入
        document.execCommand('insertText', false, markdown);
      }
      
    } catch (err) {
      console.error('粘贴处理错误:', err);
    }
  }
  
  // 防抖函数
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }
} 