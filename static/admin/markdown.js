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
    
    // 注册自定义编辑器组件
    registerCustomComponents();
    
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
          
          // 处理粘贴事件，保留格式
          textarea.addEventListener('paste', handlePasteWithFormat);
        });
        
        // 查找CodeMirror实例并修改
        const cmEditor = container.querySelector('.CodeMirror');
        if (cmEditor && cmEditor.CodeMirror) {
          try {
            // 设置CodeMirror选项
            cmEditor.CodeMirror.setOption('inputStyle', 'contenteditable');
            cmEditor.CodeMirror.setOption('lineWrapping', true);
            
            // 添加粘贴事件监听
            cmEditor.CodeMirror.on('paste', handleCodeMirrorPaste);
            
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
          /* 增强UI组件样式 */
          .editor-toolbar .separator {
            border-left: 1px solid #ddd;
            margin: 0 6px;
          }
          .editor-toolbar button.active {
            background: #eee;
          }
          .editor-toolbar .fa-image {
            color: #1976d2;
          }
          /* 富文本预览样式 */
          .editor-preview img {
            max-width: 100%;
            border: 1px solid #eee;
            border-radius: 4px;
            margin: 10px 0;
          }
          .editor-preview blockquote {
            border-left: 4px solid #ccc;
            padding-left: 16px;
            color: #666;
            margin: 16px 0;
          }
          .editor-preview pre {
            background: #f5f5f5;
            padding: 12px;
            border-radius: 4px;
            overflow: auto;
          }
          .editor-preview table {
            border-collapse: collapse;
            width: 100%;
          }
          .editor-preview th, .editor-preview td {
            border: 1px solid #ddd;
            padding: 8px;
          }
          .editor-preview th {
            background: #f5f5f5;
          }
        `;
        document.head.appendChild(style);
      });
    }
    
    // 注册自定义编辑器组件
    function registerCustomComponents() {
      // 图片组件增强
      CMS.registerEditorComponent({
        id: "enhanced-image",
        label: "增强图片",
        fields: [
          { name: 'src', label: '图片地址', widget: 'image' },
          { name: 'alt', label: '替代文本', widget: 'string' },
          { name: 'title', label: '标题', widget: 'string', required: false },
          { 
            name: 'align', 
            label: '对齐方式', 
            widget: 'select', 
            options: ['左对齐', '居中', '右对齐'],
            default: '居中'
          },
          { 
            name: 'width', 
            label: '宽度(%)', 
            widget: 'number', 
            default: 100,
            min: 10,
            max: 100,
            required: false 
          }
        ],
        pattern: /^!\[(.*)\]\((.*?)(?:\s+"(.*)")?\)(?:{:\s*\.([a-z-]+)\s*})?$/,
        fromBlock: function(match) {
          return {
            src: match[2],
            alt: match[1],
            title: match[3] || '',
            align: match[4] === 'text-center' ? '居中' : match[4] === 'text-right' ? '右对齐' : '左对齐',
            width: 100
          };
        },
        toBlock: function(data) {
          let alignClass = '';
          if (data.align === '居中') alignClass = '{: .text-center}';
          else if (data.align === '右对齐') alignClass = '{: .text-right}';
          
          let imgTag = `![${data.alt || ''}](${data.src}${data.title ? ` "${data.title}"` : ''})`;
          if (data.width && data.width !== 100) {
            imgTag = `<img src="${data.src}" alt="${data.alt || ''}" title="${data.title || ''}" width="${data.width}%" />`;
          }
          
          return alignClass ? `${imgTag}${alignClass}` : imgTag;
        },
        toPreview: function(data) {
          let style = '';
          if (data.align === '居中') style = 'display:block;margin:0 auto;text-align:center;';
          else if (data.align === '右对齐') style = 'display:block;margin-left:auto;';
          
          if (data.width && data.width !== 100) {
            style += `width:${data.width}%;`;
          }
          
          return `<img src="${data.src}" alt="${data.alt || ''}" title="${data.title || ''}" style="${style}" />`;
        }
      });
      
      // 表格组件
      CMS.registerEditorComponent({
        id: "table",
        label: "表格",
        fields: [
          { name: 'headers', label: '表头（逗号分隔）', widget: 'string' },
          { name: 'rows', label: '行数据（每行一组，逗号分隔）', widget: 'list' }
        ],
        pattern: /^\|(.+)\|\n\|([-:]+)\|\n((?:\|(?:.+)\|\n)+)$/,
        fromBlock: function(match) {
          const headers = match[1].trim().split('|').map(h => h.trim());
          const rows = match[3].trim().split('\n').map(row => 
            row.trim().replace(/^\||\|$/g, '').split('|').map(cell => cell.trim())
          );
          return {
            headers: headers.join(', '),
            rows: rows.map(r => r.join(', '))
          };
        },
        toBlock: function(data) {
          const headers = data.headers.split(',').map(h => h.trim());
          const headerRow = `| ${headers.join(' | ')} |`;
          const separatorRow = `| ${headers.map(() => '---').join(' | ')} |`;
          
          const bodyRows = data.rows.map(rowStr => {
            const cells = rowStr.split(',').map(c => c.trim());
            return `| ${cells.join(' | ')} |`;
          }).join('\n');
          
          return `${headerRow}\n${separatorRow}\n${bodyRows}`;
        },
        toPreview: function(data) {
          const headers = data.headers.split(',').map(h => h.trim());
          const headerCells = headers.map(h => `<th>${h}</th>`).join('');
          
          const bodyRows = data.rows.map(rowStr => {
            const cells = rowStr.split(',').map(c => c.trim());
            return `<tr>${cells.map(c => `<td>${c}</td>`).join('')}</tr>`;
          }).join('');
          
          return `
            <table>
              <thead>
                <tr>${headerCells}</tr>
              </thead>
              <tbody>
                ${bodyRows}
              </tbody>
            </table>
          `;
        }
      });
    }
    
    // 处理粘贴事件，保留格式
    function handlePasteWithFormat(e) {
      // 如果粘贴的是纯文本，则不做处理
      if (!e.clipboardData || !e.clipboardData.types || !e.clipboardData.types.includes('text/html')) {
        return;
      }
      
      // 获取粘贴的HTML内容
      const html = e.clipboardData.getData('text/html');
      console.log('粘贴HTML:', html);
      
      // 转换HTML为Markdown
      try {
        // 简单的HTML到Markdown转换
        let markdown = html
          // 处理标题
          .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
          .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
          .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
          .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
          .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
          .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')
          // 处理加粗和斜体
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
          .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, '> $1\n')
          // 处理段落和换行
          .replace(/<p[^>]*>(.*?)<\/p>/gis, '$1\n\n')
          .replace(/<br[^>]*>/gi, '\n')
          // 处理表格 (简单支持)
          .replace(/<table[^>]*>(.*?)<\/table>/gis, function(match, tableContent) {
            let result = '';
            // 提取表头
            const headerMatch = tableContent.match(/<th[^>]*>(.*?)<\/th>/gis);
            if (headerMatch) {
              const headers = headerMatch.map(h => h.replace(/<\/?th[^>]*>/gi, '').trim());
              result += `| ${headers.join(' | ')} |\n`;
              result += `| ${headers.map(() => '---').join(' | ')} |\n`;
            }
            // 提取表格行
            const rowsMatch = tableContent.match(/<tr[^>]*>((?!<th).*?)<\/tr>/gis);
            if (rowsMatch) {
              rowsMatch.forEach(row => {
                const cells = row.match(/<td[^>]*>(.*?)<\/td>/gis)
                  ?.map(cell => cell.replace(/<\/?td[^>]*>/gi, '').trim()) || [];
                if (cells.length > 0) {
                  result += `| ${cells.join(' | ')} |\n`;
                }
              });
            }
            return result;
          })
          // 清理剩余的HTML标签
          .replace(/<[^>]*>/g, '')
          // 修复空格和换行
          .replace(/&nbsp;/g, ' ')
          .replace(/\n\s*\n\s*\n/g, '\n\n');
        
        // 插入转换后的Markdown
        const textarea = e.target;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const before = text.substring(0, start);
        const after = text.substring(end, text.length);
        
        textarea.value = before + markdown + after;
        textarea.selectionStart = start + markdown.length;
        textarea.selectionEnd = start + markdown.length;
        
        // 触发textarea的input事件
        const event = new Event('input', { bubbles: true });
        textarea.dispatchEvent(event);
        
        // 阻止默认粘贴行为
        e.preventDefault();
        console.log('处理粘贴完成，已转换为Markdown');
      } catch (error) {
        console.error('处理粘贴出错:', error);
      }
    }
    
    // 处理CodeMirror编辑器的粘贴事件
    function handleCodeMirrorPaste(cm, e) {
      if (!e.clipboardData || !e.clipboardData.types || !e.clipboardData.types.includes('text/html')) {
        return;
      }
      
      try {
        // 获取粘贴的HTML内容
        const html = e.clipboardData.getData('text/html');
        console.log('CodeMirror粘贴HTML:', html);
        
        // 同样的HTML到Markdown转换逻辑
        // 此处省略，与上面相同的转换代码
        
        // 此处简化处理，实际应用中需要完整转换
        let markdown = html
          .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
          .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
          .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
          .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
          .replace(/<a[^>]*href=["'](.*?)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)')
          .replace(/<p[^>]*>(.*?)<\/p>/gis, '$1\n\n')
          .replace(/<br[^>]*>/gi, '\n')
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/\n\s*\n\s*\n/g, '\n\n');
        
        // 在当前光标位置插入Markdown
        cm.replaceSelection(markdown);
        
        // 阻止默认粘贴行为
        e.preventDefault();
        console.log('CodeMirror处理粘贴完成');
      } catch (error) {
        console.error('CodeMirror处理粘贴出错:', error);
      }
    }
    
    // 初始运行一次
    setupEditors();
    
    // 每隔一段时间运行一次以捕获动态创建的编辑器
    setInterval(setupEditors, 1000);
    
    console.log('Markdown编辑器配置完成');
  }
})(); 