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
      
      // 处理直接模式的文本编辑器区域
      const textareas = document.querySelectorAll('.widget-text textarea, textarea[name="body"]');
      textareas.forEach(enhanceTextArea);
      
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
        textarea.style.padding = '12px';
        textarea.style.color = '#333';
        
        // 添加清晰的输入样式
        textarea.style.backgroundColor = '#fff'; 
        
        // 添加粘贴事件监听器
        textarea.addEventListener('paste', handlePaste);
        
        // 添加输入焦点事件
        textarea.addEventListener('focus', function() {
          this.style.borderColor = '#3a69c7';
          this.style.boxShadow = '0 0 0 3px rgba(58, 105, 199, 0.1)';
        });
        
        textarea.addEventListener('blur', function() {
          this.style.borderColor = '#ddd';
          this.style.boxShadow = 'none';
        });
        
        // 修复中文输入问题
        textarea.addEventListener('compositionstart', function() {
          this.setAttribute('data-composing', 'true');
        });
        
        textarea.addEventListener('compositionend', function() {
          this.removeAttribute('data-composing');
          // 触发input事件以确保值更新
          const event = new Event('input', { bubbles: true });
          this.dispatchEvent(event);
        });
        
        // 确保父容器不会影响输入
        const parent = textarea.closest('.nc-controlPane-control');
        if (parent) {
          parent.style.overflow = 'visible';
        }
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
        
        // 添加粘贴事件监听
        editor.addEventListener('paste', handlePaste);
        
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
        
        // 添加粘贴事件监听
        editor.addEventListener('paste', handlePaste);
        
        // 如果是CodeMirror实例，增强其粘贴处理
        if (editor.CodeMirror) {
          try {
            editor.CodeMirror.on('paste', function(cm, event) {
              handlePaste(event, cm);
            });
          } catch (e) {
            console.error('设置CodeMirror粘贴处理失败:', e);
          }
        }
        
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
    
    // 处理粘贴事件
    function handlePaste(event, codeMirror) {
      // 检查是否有HTML内容可以粘贴
      if (!event.clipboardData || !event.clipboardData.types) {
        return;
      }
      
      // 文本输入框的粘贴增强
      if (event.target.tagName === 'TEXTAREA' && event.target.closest('.widget-text')) {
        // 对于TEXT widget的TEXTAREA，我们不做HTML转Markdown的处理，保留原样
        console.log('处理文本框粘贴，保留原格式');
        return; // 使用默认粘贴行为
      }
      
      // 如果包含HTML格式，则进行格式转换
      if (event.clipboardData.types.includes('text/html')) {
        const html = event.clipboardData.getData('text/html');
        console.log('正在处理HTML粘贴:', html.substring(0, 100) + '...');
        
        try {
          // 转换HTML为Markdown
          let markdown = convertHtmlToMarkdown(html);
          
          if (codeMirror) {
            // 如果是CodeMirror编辑器
            codeMirror.replaceSelection(markdown);
            event.preventDefault();
          } else if (event.target.tagName === 'TEXTAREA') {
            // 如果是普通文本区域
            const textarea = event.target;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = textarea.value;
            const before = text.substring(0, start);
            const after = text.substring(end);
            
            textarea.value = before + markdown + after;
            textarea.selectionStart = start + markdown.length;
            textarea.selectionEnd = start + markdown.length;
            
            // 触发change事件
            const changeEvent = new Event('input', { bubbles: true });
            textarea.dispatchEvent(changeEvent);
            
            event.preventDefault();
          } else if (event.target.getAttribute('data-slate-editor') === 'true') {
            // 富文本编辑器处理，但这部分更复杂，需要通过Slate API处理
            // 这里简化处理，实际上需要更复杂的Slate集成
            console.log('Slate编辑器粘贴，使用默认处理方式');
          }
        } catch (error) {
          console.error('处理粘贴时出错:', error);
        }
      }
    }
    
    // 将HTML转换为Markdown的函数
    function convertHtmlToMarkdown(html) {
      // 如果有可用的库，使用库转换
      if (window.TurndownService) {
        const turndownService = new TurndownService({
          headingStyle: 'atx',
          codeBlockStyle: 'fenced',
          emDelimiter: '*'
        });
        
        // 配置转换规则
        turndownService.addRule('imageCenter', {
          filter: function(node) {
            return node.nodeName === 'IMG' && 
                   (node.style.display === 'block' && 
                    (node.style.marginLeft === 'auto' && node.style.marginRight === 'auto'));
          },
          replacement: function(content, node) {
            const alt = node.alt || '';
            const src = node.getAttribute('src') || '';
            const title = node.title || '';
            const titlePart = title ? ` "${title}"` : '';
            return `![${alt}](${src}${titlePart}){: .text-center}`;
          }
        });
        
        return turndownService.turndown(html);
      }
      
      // 否则使用简单的正则转换
      return html
        // 处理标题
        .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
        .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
        .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
        .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
        .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
        .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')
        // 处理粗体和斜体
        .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
        .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
        .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
        .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
        // 处理链接
        .replace(/<a[^>]*href=["'](.*?)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)')
        // 处理图片
        .replace(/<img[^>]*src=["'](.*?)["'][^>]*alt=["'](.*?)["'][^>]*>/gi, '![$2]($1)')
        .replace(/<img[^>]*alt=["'](.*?)["'][^>]*src=["'](.*?)["'][^>]*>/gi, '![$1]($2)')
        .replace(/<img[^>]*src=["'](.*?)["'][^>]*>/gi, '![]($1)')
        // 处理段落和换行
        .replace(/<p[^>]*>(.*?)<\/p>/gis, '$1\n\n')
        .replace(/<br[^>]*>/gi, '\n')
        // 处理列表
        .replace(/<ul[^>]*>(.*?)<\/ul>/gis, function(match, content) {
          return content.replace(/<li[^>]*>(.*?)<\/li>/gis, '- $1\n');
        })
        .replace(/<ol[^>]*>(.*?)<\/ol>/gis, function(match, content) {
          let index = 1;
          return content.replace(/<li[^>]*>(.*?)<\/li>/gis, function(match, item) {
            return `${index++}. ${item}\n`;
          });
        })
        // 处理引用
        .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, '> $1\n\n')
        // 处理代码块
        .replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gis, '```\n$1\n```\n\n')
        .replace(/<code[^>]*>(.*?)<\/code>/gis, '`$1`')
        // 清理其他HTML标签
        .replace(/<[^>]*>/g, '')
        // 修复HTML实体
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        // 修复多余的换行
        .replace(/\n\s*\n\s*\n/g, '\n\n');
    }
    
    // 立即处理当前页面上的元素
    enhanceNewElements();
    
    // 每隔1秒检查一次新元素，确保动态加载的编辑器也能得到增强
    setInterval(enhanceNewElements, 1000);
    
    // 添加全局样式来增强文本区域的可见性
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      .widget-text textarea {
        min-height: 400px !important;
        font-family: "PingFang SC", "Microsoft YaHei", sans-serif !important;
        font-size: 16px !important;
        line-height: 1.6 !important;
        padding: 12px !important;
        color: #333 !important;
        background-color: #fff !important;
      }
      .widget-text textarea:focus {
        border-color: #3a69c7 !important;
        box-shadow: 0 0 0 3px rgba(58, 105, 199, 0.1) !important;
        outline: none !important;
      }
    `;
    document.head.appendChild(styleEl);
    
    console.log('中文输入增强已完成初始化');
  }
})(); 