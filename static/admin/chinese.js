/**
 * 中文输入增强支持
 */
(function() {
  // 等待CMS完全加载
  const checkCMS = setInterval(function() {
    if (window.CMS) {
      clearInterval(checkCMS);
      enhanceChinese();
    }
  }, 100);

  function enhanceChinese() {
    console.log('开始增强中文输入支持...');
    
    // 监听DOM变化，动态处理新添加的编辑器元素
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          // 检查新添加的节点
          enhanceNewElements();
        }
      });
    });
    
    // 开始观察文档变化
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // 强制编辑器使用中文输入
    function enhanceNewElements() {
      console.log('检查新元素...');
      
      // 处理所有编辑器组件
      const editors = document.querySelectorAll('.cms-editor-component');
      if (editors.length > 0) {
        editors.forEach(editor => {
          // 增强文本区域
          const textareas = editor.querySelectorAll('textarea');
          textareas.forEach(enhanceTextArea);
          
          // 增强富文本编辑器 (Slate编辑器)
          const richEditors = editor.querySelectorAll('.richTextEditor, [data-slate-editor="true"]');
          richEditors.forEach(enhanceRichEditor);
          
          // 增强Markdown编辑器
          const mdEditors = editor.querySelectorAll('.CodeMirror, .cm-s-easymde');
          mdEditors.forEach(enhanceMarkdownEditor);
        });
      }
      
      // 处理直接模式的markdown编辑区域
      const mdAreas = document.querySelectorAll('.CodeMirror, .cm-s-easymde');
      mdAreas.forEach(enhanceMarkdownEditor);
      
      // 处理直接模式的rich text编辑区域
      const rtAreas = document.querySelectorAll('.richTextEditor, [data-slate-editor="true"]');
      rtAreas.forEach(enhanceRichEditor);
    }
    
    // 增强文本区域
    function enhanceTextArea(textarea) {
      if (!textarea.getAttribute('data-chinese-enhanced')) {
        console.log('增强文本区域:', textarea);
        textarea.setAttribute('data-chinese-enhanced', 'true');
        textarea.setAttribute('lang', 'zh-CN');
        textarea.setAttribute('spellcheck', 'false');
        textarea.style.fontFamily = '"PingFang SC", "Microsoft YaHei", sans-serif';
        textarea.style.fontSize = '16px';
        textarea.style.lineHeight = '1.6';
      }
    }
    
    // 增强富文本编辑器
    function enhanceRichEditor(editor) {
      if (!editor.getAttribute('data-chinese-enhanced')) {
        console.log('增强富文本编辑器:', editor);
        editor.setAttribute('data-chinese-enhanced', 'true');
        editor.setAttribute('lang', 'zh-CN');
        editor.setAttribute('spellcheck', 'false');
        editor.style.fontFamily = '"PingFang SC", "Microsoft YaHei", sans-serif';
        editor.style.fontSize = '16px';
        editor.style.lineHeight = '1.6';
        
        // 尝试覆盖内部样式
        const styleEl = document.createElement('style');
        styleEl.textContent = `
          [data-slate-editor="true"] * {
            font-family: "PingFang SC", "Microsoft YaHei", sans-serif !important;
          }
        `;
        document.head.appendChild(styleEl);
      }
    }
    
    // 增强Markdown编辑器 (CodeMirror)
    function enhanceMarkdownEditor(editor) {
      if (!editor.getAttribute('data-chinese-enhanced')) {
        console.log('增强Markdown编辑器:', editor);
        editor.setAttribute('data-chinese-enhanced', 'true');
        
        // 获取CodeMirror的编辑区域并设置样式
        const cmTextareas = editor.querySelectorAll('.CodeMirror-code, .editor-preview');
        cmTextareas.forEach(area => {
          area.setAttribute('lang', 'zh-CN');
          area.setAttribute('spellcheck', 'false');
          area.style.fontFamily = '"PingFang SC", "Microsoft YaHei", sans-serif';
          area.style.fontSize = '16px';
          area.style.lineHeight = '1.6';
        });
        
        // 添加样式覆盖
        const styleEl = document.createElement('style');
        styleEl.textContent = `
          .CodeMirror, .CodeMirror-code, .CodeMirror-line, .cm-s-easymde {
            font-family: "PingFang SC", "Microsoft YaHei", sans-serif !important;
            font-size: 16px !important;
          }
          .CodeMirror-line span {
            font-family: "PingFang SC", "Microsoft YaHei", sans-serif !important;
          }
          .editor-preview, .editor-preview-side {
            font-family: "PingFang SC", "Microsoft YaHei", sans-serif !important;
          }
        `;
        document.head.appendChild(styleEl);
        
        // 尝试获取CodeMirror实例并修改配置
        if (editor.CodeMirror) {
          editor.CodeMirror.setOption('inputStyle', 'contenteditable');
        }
      }
    }
    
    // 立即处理当前页面上的元素
    enhanceNewElements();
    
    // 每隔1秒检查一次新元素，确保动态加载的编辑器也能得到增强
    setInterval(enhanceNewElements, 1000);
    
    console.log('中文输入增强已完成初始化');
  }
})(); 