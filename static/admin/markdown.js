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
          
          /* 增强图片编辑体验 */
          .cms-editor-component--image {
            margin: 15px 0;
            padding: 10px;
            border: 1px dashed #ccc;
            border-radius: 4px;
            background: #f9f9f9;
          }
          
          /* 增强表格编辑体验 */
          .cms-editor-component--table {
            margin: 15px 0;
            overflow-x: auto;
          }
          
          /* 添加字体选择和字号控制 */
          .cms-font-control {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            padding: 8px;
            background: #f5f5f5;
            border-radius: 4px;
          }
          
          .cms-font-control select {
            margin: 0 8px;
            padding: 4px;
            border: 1px solid #ddd;
            border-radius: 3px;
          }
          
          /* 增强格式化粘贴的内容样式 */
          .formatted-paste-content {
            margin: 8px 0;
            padding: 5px;
            border-left: 3px solid #3a69c7;
            background: rgba(58, 105, 199, 0.05);
          }
        `;
        document.head.appendChild(style);
        
        // 添加额外的编辑工具
        addExtraEditTools(container);
      });
    }
    
    // 添加额外的编辑工具
    function addExtraEditTools(container) {
      // 查找工具栏
      const toolbar = container.querySelector('.editor-toolbar');
      if (!toolbar) return;
      
      // 防止重复添加
      if (toolbar.querySelector('.cms-extra-tools')) return;
      
      // 创建字体控制工具组
      const fontControls = document.createElement('div');
      fontControls.className = 'cms-extra-tools';
      fontControls.style.display = 'flex';
      fontControls.style.alignItems = 'center';
      fontControls.style.marginLeft = '10px';
      
      // 字体选择
      const fontSelect = document.createElement('select');
      fontSelect.title = '选择字体';
      fontSelect.innerHTML = `
        <option value="default">默认字体</option>
        <option value="songti">宋体</option>
        <option value="heiti">黑体</option>
        <option value="kaiti">楷体</option>
        <option value="yahei">微软雅黑</option>
      `;
      fontSelect.addEventListener('change', function() {
        const font = this.value;
        if (font === 'default') return;
        
        const cm = container.querySelector('.CodeMirror').CodeMirror;
        const selection = cm.getSelection();
        if (selection) {
          // 使用HTML标签包装选中的文本
          const fontTag = `<span style="font-family: ${getFontFamily(font)};">${selection}</span>`;
          cm.replaceSelection(fontTag);
        }
      });
      
      // 添加工具提示
      const toolTip = document.createElement('div');
      toolTip.className = 'cms-tooltip';
      toolTip.textContent = '提示: 按Ctrl+Alt+V可保留格式粘贴';
      toolTip.style.fontSize = '12px';
      toolTip.style.color = '#888';
      toolTip.style.marginLeft = '10px';
      
      // 添加到工具栏
      fontControls.appendChild(fontSelect);
      toolbar.appendChild(fontControls);
      toolbar.appendChild(toolTip);
      
      // 添加键盘快捷键
      const cmEditor = container.querySelector('.CodeMirror');
      if (cmEditor && cmEditor.CodeMirror) {
        cmEditor.CodeMirror.setOption('extraKeys', {
          'Ctrl-Alt-V': function(cm) {
            navigator.clipboard.read().then(function(data) {
              // 触发自定义格式化粘贴
              handleFormattedPaste(cm);
            }).catch(function(err) {
              console.error('读取剪贴板失败:', err);
            });
          }
        });
      }
    }
    
    // 获取字体系列
    function getFontFamily(fontType) {
      switch(fontType) {
        case 'songti': return 'SimSun, serif';
        case 'heiti': return 'SimHei, sans-serif';
        case 'kaiti': return 'KaiTi, cursive';
        case 'yahei': return '"Microsoft YaHei", sans-serif';
        default: return 'inherit';
      }
    }
    
    // 注册自定义编辑器组件
    function registerCustomComponents() {
      // 增强图片组件
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
      
      // 高级表格组件
      CMS.registerEditorComponent({
        id: "advanced-table",
        label: "高级表格",
        fields: [
          { name: 'headers', label: '表头（逗号分隔）', widget: 'string' },
          { name: 'rows', label: '行数据（每行一组，逗号分隔）', widget: 'list' },
          { name: 'bordered', label: '显示边框', widget: 'boolean', default: true },
          { name: 'striped', label: '条纹样式', widget: 'boolean', default: false }
        ],
        pattern: /^\|(.+)\|\n\|([-:]+)\|\n((?:\|(?:.+)\|\n)+)$/,
        fromBlock: function(match) {
          const headers = match[1].trim().split('|').map(h => h.trim());
          const rows = match[3].trim().split('\n').map(row => 
            row.trim().replace(/^\||\|$/g, '').split('|').map(cell => cell.trim())
          );
          return {
            headers: headers.join(', '),
            rows: rows.map(r => r.join(', ')),
            bordered: true,
            striped: false
          };
        },
        toBlock: function(data) {
          const headers = data.headers.split(',').map(h => h.trim());
          const headerRow = `| ${headers.join(' | ')} |`;
          const separatorRow = `| ${headers.map(() => '---').join(' | ')} |`;
          
          const bodyRows = data.rows.map(rowStr => {
            const cells = rowStr.split(',').map(c => c.trim());
            const paddedCells = cells.concat(Array(headers.length - cells.length).fill(''));
            return `| ${paddedCells.join(' | ')} |`;
          }).join('\n');
          
          return `${headerRow}\n${separatorRow}\n${bodyRows}`;
        },
        toPreview: function(data) {
          const headers = data.headers.split(',').map(h => h.trim());
          const headerCells = headers.map(h => `<th>${h}</th>`).join('');
          
          const bodyRows = data.rows.map(rowStr => {
            const cells = rowStr.split(',').map(c => c.trim());
            const paddedCells = cells.concat(Array(headers.length - cells.length).fill(''));
            return `<tr>${paddedCells.map(c => `<td>${c}</td>`).join('')}</tr>`;
          }).join('');
          
          const tableClass = `${data.bordered ? 'bordered ' : ''}${data.striped ? 'striped' : ''}`.trim();
          
          return `
            <table class="${tableClass}" style="width:100%;border-collapse:collapse;margin:15px 0;">
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
      
      // 文本样式组件
      CMS.registerEditorComponent({
        id: "styled-text",
        label: "文本样式",
        fields: [
          { name: 'text', label: '文本内容', widget: 'text' },
          { 
            name: 'style', 
            label: '样式', 
            widget: 'select', 
            options: ['默认', '重点强调', '警告', '提示', '注意'],
            default: '默认'
          },
          { name: 'textAlign', label: '对齐方式', widget: 'select', options: ['左对齐', '居中', '右对齐'], default: '左对齐' }
        ],
        pattern: /^<div style="([^"]+)">([\s\S]*?)<\/div>$/,
        fromBlock: function(match) {
          return {
            text: match[2],
            style: getStyleType(match[1]),
            textAlign: getAlignType(match[1])
          };
        },
        toBlock: function(data) {
          let style = '';
          
          // 文本对齐
          if (data.textAlign === '居中') style += 'text-align:center;';
          else if (data.textAlign === '右对齐') style += 'text-align:right;';
          
          // 样式类型
          if (data.style === '重点强调') {
            style += 'color:#d32f2f;font-weight:bold;';
          } else if (data.style === '警告') {
            style += 'background-color:#fff3cd;color:#856404;padding:10px;border-left:4px solid #ffeeba;';
          } else if (data.style === '提示') {
            style += 'background-color:#d4edda;color:#155724;padding:10px;border-left:4px solid #c3e6cb;';
          } else if (data.style === '注意') {
            style += 'background-color:#d1ecf1;color:#0c5460;padding:10px;border-left:4px solid #bee5eb;';
          }
          
          return `<div style="${style}">${data.text}</div>`;
        },
        toPreview: function(data) {
          let style = '';
          
          // 文本对齐
          if (data.textAlign === '居中') style += 'text-align:center;';
          else if (data.textAlign === '右对齐') style += 'text-align:right;';
          
          // 样式类型
          if (data.style === '重点强调') {
            style += 'color:#d32f2f;font-weight:bold;';
          } else if (data.style === '警告') {
            style += 'background-color:#fff3cd;color:#856404;padding:10px;border-radius:4px;border-left:4px solid #ffeeba;';
          } else if (data.style === '提示') {
            style += 'background-color:#d4edda;color:#155724;padding:10px;border-radius:4px;border-left:4px solid #c3e6cb;';
          } else if (data.style === '注意') {
            style += 'background-color:#d1ecf1;color:#0c5460;padding:10px;border-radius:4px;border-left:4px solid #bee5eb;';
          }
          
          return `<div style="${style}">${data.text}</div>`;
        }
      });
      
      // 字体样式组件
      CMS.registerEditorComponent({
        id: "font-style",
        label: "字体样式",
        fields: [
          { name: 'text', label: '文本内容', widget: 'string' },
          { name: 'fontSize', label: '字号(px)', widget: 'number', default: 16, min: 12, max: 36 },
          { 
            name: 'fontFamily', 
            label: '字体', 
            widget: 'select',
            options: ['默认', '宋体', '黑体', '楷体', '微软雅黑'],
            default: '默认'
          },
          { name: 'color', label: '颜色', widget: 'string', default: '' }
        ],
        pattern: /^<span style="([^"]+)">([\s\S]*?)<\/span>$/,
        fromBlock: function(match) {
          const style = match[1];
          const text = match[2];
          
          // 解析样式
          const fontSize = (style.match(/font-size:\s*(\d+)px/) || [])[1] || 16;
          const fontFamily = getFontTypeFromFamily(style);
          const color = (style.match(/color:\s*([^;]+)/) || [])[1] || '';
          
          return {
            text,
            fontSize,
            fontFamily,
            color
          };
        },
        toBlock: function(data) {
          let style = '';
          
          if (data.fontSize && data.fontSize != 16) {
            style += `font-size:${data.fontSize}px;`;
          }
          
          if (data.fontFamily && data.fontFamily !== '默认') {
            style += `font-family:${getFontFamily(data.fontFamily.toLowerCase())};`;
          }
          
          if (data.color) {
            style += `color:${data.color};`;
          }
          
          return style ? `<span style="${style}">${data.text}</span>` : data.text;
        },
        toPreview: function(data) {
          let style = '';
          
          if (data.fontSize && data.fontSize != 16) {
            style += `font-size:${data.fontSize}px;`;
          }
          
          if (data.fontFamily && data.fontFamily !== '默认') {
            style += `font-family:${getFontFamily(data.fontFamily.toLowerCase())};`;
          }
          
          if (data.color) {
            style += `color:${data.color};`;
          }
          
          return style ? `<span style="${style}">${data.text}</span>` : data.text;
        }
      });
    }
    
    // 获取样式类型
    function getStyleType(styleStr) {
      if (styleStr.includes('color:#d32f2f')) return '重点强调';
      if (styleStr.includes('background-color:#fff3cd')) return '警告';
      if (styleStr.includes('background-color:#d4edda')) return '提示';
      if (styleStr.includes('background-color:#d1ecf1')) return '注意';
      return '默认';
    }
    
    // 获取对齐类型
    function getAlignType(styleStr) {
      if (styleStr.includes('text-align:center')) return '居中';
      if (styleStr.includes('text-align:right')) return '右对齐';
      return '左对齐';
    }
    
    // 从样式中获取字体类型
    function getFontTypeFromFamily(styleStr) {
      if (styleStr.includes('SimSun')) return '宋体';
      if (styleStr.includes('SimHei')) return '黑体';
      if (styleStr.includes('KaiTi')) return '楷体';
      if (styleStr.includes('Microsoft YaHei')) return '微软雅黑';
      return '默认';
    }
    
    // 处理粘贴事件，保留格式
    function handlePasteWithFormat(e) {
      try {
        // 检查是否有HTML内容
        const clipboardData = e.clipboardData || window.clipboardData;
        if (!clipboardData) return;
        
        const html = clipboardData.getData('text/html');
        const text = clipboardData.getData('text');
        
        // 如果没有HTML内容，则使用默认处理
        if (!html) return;
        
        // 如果同时按下Ctrl+Shift，则强制保留格式
        if (e.ctrlKey && e.shiftKey) {
          e.preventDefault();
          
          // 处理HTML内容，转换为Markdown
          const cleanedHtml = cleanHtml(html);
          document.execCommand('insertHTML', false, cleanedHtml);
        }
      } catch (err) {
        console.error('粘贴处理错误:', err);
      }
    }
    
    // 处理CodeMirror粘贴事件
    function handleCodeMirrorPaste(cm, e) {
      try {
        // 检查是否有HTML内容
        const clipboardData = e.clipboardData || window.clipboardData;
        if (!clipboardData) return;
        
        const html = clipboardData.getData('text/html');
        const text = clipboardData.getData('text');
        
        // 如果没有HTML内容，则使用默认处理
        if (!html) return;
        
        // 如果同时按下Ctrl+Shift，则强制保留格式
        if (e.ctrlKey && e.shiftKey) {
          e.preventDefault();
          
          // 将HTML转换为Markdown
          htmlToMarkdown(html).then(markdown => {
            // 插入转换后的Markdown内容
            cm.replaceSelection(markdown);
          }).catch(err => {
            // 出错时回退到普通文本
            cm.replaceSelection(text);
            console.error('HTML转Markdown错误:', err);
          });
        }
      } catch (err) {
        console.error('CodeMirror粘贴处理错误:', err);
      }
    }
    
    // 处理格式化粘贴(Ctrl+Alt+V触发)
    function handleFormattedPaste(cm) {
      try {
        // 读取剪贴板内容
        navigator.clipboard.readText()
          .then(text => {
            // 创建一个带有简单格式标记的文本
            const formattedText = `<div class="formatted-paste-content">${text.replace(/\n/g, '<br>')}</div>`;
            cm.replaceSelection(formattedText);
          })
          .catch(err => {
            console.error('读取剪贴板失败:', err);
            cm.replaceSelection('无法读取剪贴板内容');
          });
      } catch (e) {
        console.error('格式化粘贴错误:', e);
      }
    }
    
    // 清理HTML内容
    function cleanHtml(html) {
      // 创建一个临时元素
      const div = document.createElement('div');
      div.innerHTML = html;
      
      // 移除所有脚本和样式标签
      const scripts = div.querySelectorAll('script, style');
      scripts.forEach(script => script.remove());
      
      // 简化HTML结构
      return div.innerHTML;
    }
    
    // HTML转Markdown
    function htmlToMarkdown(html) {
      return new Promise((resolve, reject) => {
        try {
          // 创建临时元素
          const div = document.createElement('div');
          div.innerHTML = html;
          
          // 简单的HTML到Markdown转换
          let markdown = '';
          
          // 处理段落
          const paragraphs = div.querySelectorAll('p');
          paragraphs.forEach(p => {
            markdown += p.textContent + '\n\n';
          });
          
          // 如果没有段落，则使用div的内容
          if (paragraphs.length === 0) {
            markdown = div.textContent;
          }
          
          resolve(markdown);
        } catch (err) {
          reject(err);
        }
      });
    }
  }
})(); 