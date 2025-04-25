/**
 * 自定义Markdown编辑器配置
 */
(function() {
  // 等待CMS完全加载
  const checkCMS = setInterval(function() {
    if (window.CMS) {
      clearInterval(checkCMS);
      configureMarkdown();
    }
  }, 100);

  function configureMarkdown() {
    console.log('配置Markdown编辑器...');
    
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
        if (container.getAttribute('data-chinese-configured')) return;
        container.setAttribute('data-chinese-configured', 'true');
        
        console.log('发现EasyMDE编辑器，配置中文支持');
        
        // 查找编辑器实例
        const textareas = container.querySelectorAll('textarea');
        textareas.forEach(textarea => {
          // 添加中文输入支持属性
          textarea.setAttribute('lang', 'zh-CN');
          textarea.setAttribute('spellcheck', 'false');
          
          // 添加compositionstart/end事件监听器处理中文输入法
          textarea.addEventListener('compositionstart', function(e) {
            console.log('中文输入法活动开始');
            textarea.setAttribute('data-composing', 'true');
          });
          
          textarea.addEventListener('compositionend', function(e) {
            console.log('中文输入法活动结束');
            textarea.removeAttribute('data-composing');
          });
        });
        
        // 查找CodeMirror实例并修改
        const cmEditor = container.querySelector('.CodeMirror');
        if (cmEditor && cmEditor.CodeMirror) {
          try {
            // 设置CodeMirror选项
            cmEditor.CodeMirror.setOption('inputStyle', 'contenteditable');
            cmEditor.CodeMirror.setOption('lineWrapping', true);
            console.log('成功配置CodeMirror实例');
          } catch (e) {
            console.error('配置CodeMirror失败:', e);
          }
        }
        
        // 添加样式覆盖
        const style = document.createElement('style');
        style.textContent = `
          .EasyMDEContainer .CodeMirror {
            font-family: "PingFang SC", "Microsoft YaHei", sans-serif !important;
            font-size: 16px !important;
            line-height: 1.6 !important;
          }
          .EasyMDEContainer .editor-toolbar {
            font-family: "PingFang SC", "Microsoft YaHei", sans-serif !important;
          }
          .EasyMDEContainer .CodeMirror-line, 
          .EasyMDEContainer .CodeMirror-line span {
            font-family: "PingFang SC", "Microsoft YaHei", sans-serif !important;
          }
          .EasyMDEContainer .editor-preview {
            font-family: "PingFang SC", "Microsoft YaHei", sans-serif !important;
          }
        `;
        document.head.appendChild(style);
      });
    }
    
    // 初始运行一次
    setupEditors();
    
    // 每隔一段时间运行一次以捕获动态创建的编辑器
    setInterval(setupEditors, 1000);
    
    console.log('Markdown编辑器配置完成');
  }
})(); 