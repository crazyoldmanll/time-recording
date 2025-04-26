/**
 * 高级编辑器扩展功能 - 提供更丰富的文本编辑体验
 */
(function() {
  // 等待CMS加载
  const checkCMS = setInterval(function() {
    if (window.CMS) {
      clearInterval(checkCMS);
      initializeExtensions();
    }
  }, 100);

  function initializeExtensions() {
    console.log('初始化高级编辑器扩展...');
    
    // 注册高级编辑组件
    registerAdvancedComponents();
    
    // 添加高级编辑工具栏
    addAdvancedToolbar();
    
    // 增强粘贴功能
    enhancePasteFunctionality();
    
    // 启用自动保存
    enableAutoSave();
  }
  
  // 注册高级编辑组件
  function registerAdvancedComponents() {
    // 段落样式组件
    CMS.registerEditorComponent({
      id: "paragraph-style",
      label: "段落样式",
      fields: [
        { name: 'content', label: '段落内容', widget: 'text' },
        { 
          name: 'indent', 
          label: '首行缩进', 
          widget: 'boolean',
          default: true 
        },
        { 
          name: 'align', 
          label: '对齐方式', 
          widget: 'select',
          options: ['左对齐', '居中', '右对齐', '两端对齐'],
          default: '左对齐' 
        },
        { 
          name: 'style', 
          label: '段落样式', 
          widget: 'select',
          options: ['默认', '强调', '淡化', '引用'],
          default: '默认' 
        }
      ],
      pattern: /^<p style="([^"]+)">([\s\S]*?)<\/p>$/,
      fromBlock: function(match) {
        const style = match[1];
        const content = match[2];
        
        // 解析样式
        const indent = style.includes('text-indent');
        const align = getAlignFromStyle(style);
        const paragraphStyle = getParagraphStyleFromStyle(style);
        
        return {
          content,
          indent,
          align,
          style: paragraphStyle
        };
      },
      toBlock: function(data) {
        let style = '';
        
        // 添加缩进
        if (data.indent) {
          style += 'text-indent: 2em;';
        }
        
        // 添加对齐
        switch (data.align) {
          case '居中':
            style += 'text-align: center;';
            break;
          case '右对齐':
            style += 'text-align: right;';
            break;
          case '两端对齐':
            style += 'text-align: justify;';
            break;
        }
        
        // 添加样式
        switch (data.style) {
          case '强调':
            style += 'font-weight: bold;color: #333;';
            break;
          case '淡化':
            style += 'color: #888;font-size: 0.95em;';
            break;
          case '引用':
            style += 'font-style: italic;color: #555;';
            break;
        }
        
        return `<p style="${style}">${data.content}</p>`;
      },
      toPreview: function(data) {
        let style = '';
        
        // 添加缩进
        if (data.indent) {
          style += 'text-indent: 2em;';
        }
        
        // 添加对齐
        switch (data.align) {
          case '居中':
            style += 'text-align: center;';
            break;
          case '右对齐':
            style += 'text-align: right;';
            break;
          case '两端对齐':
            style += 'text-align: justify;';
            break;
        }
        
        // 添加样式
        switch (data.style) {
          case '强调':
            style += 'font-weight: bold;color: #333;';
            break;
          case '淡化':
            style += 'color: #888;font-size: 0.95em;';
            break;
          case '引用':
            style += 'font-style: italic;color: #555;';
            break;
        }
        
        return `<p style="${style}">${data.content}</p>`;
      }
    });
    
    // 文本颜色组件
    CMS.registerEditorComponent({
      id: "text-color",
      label: "文本颜色",
      fields: [
        { name: 'text', label: '文本内容', widget: 'string' },
        { 
          name: 'color', 
          label: '文本颜色', 
          widget: 'select',
          options: [
            '黑色', '深灰', '灰色', '浅灰', 
            '红色', '蓝色', '绿色', '橙色', 
            '紫色', '棕色', '粉色', '青色'
          ],
          default: '黑色' 
        },
        { name: 'custom_color', label: '自定义颜色 (HEX)', widget: 'string', required: false }
      ],
      pattern: /^<span style="color: ([^;]+);">([\s\S]*?)<\/span>$/,
      fromBlock: function(match) {
        const color = match[1];
        const text = match[2];
        
        return {
          text,
          color: getNamedColor(color),
          custom_color: isCustomColor(color) ? color : ''
        };
      },
      toBlock: function(data) {
        let color = getColorCode(data.color);
        
        // 使用自定义颜色（如果有）
        if (data.custom_color && data.custom_color.trim() !== '') {
          color = data.custom_color.trim();
        }
        
        return `<span style="color: ${color};">${data.text}</span>`;
      },
      toPreview: function(data) {
        let color = getColorCode(data.color);
        
        // 使用自定义颜色（如果有）
        if (data.custom_color && data.custom_color.trim() !== '') {
          color = data.custom_color.trim();
        }
        
        return `<span style="color: ${color};">${data.text}</span>`;
      }
    });
    
    // 高级分隔线组件
    CMS.registerEditorComponent({
      id: "divider",
      label: "分隔线",
      fields: [
        { 
          name: 'style', 
          label: '样式', 
          widget: 'select',
          options: ['实线', '虚线', '点线', '双线', '渐变'],
          default: '实线' 
        },
        { 
          name: 'width', 
          label: '宽度(%)', 
          widget: 'number',
          default: 100,
          min: 10,
          max: 100
        },
        { 
          name: 'align', 
          label: '对齐', 
          widget: 'select',
          options: ['左对齐', '居中', '右对齐'],
          default: '居中' 
        }
      ],
      pattern: /^<hr style="([^"]+)" \/>$/,
      fromBlock: function(match) {
        const style = match[1];
        
        const width = (style.match(/width:\s*(\d+)%/) || [])[1] || 100;
        const align = getAlignFromStyle(style);
        const dividerStyle = getDividerStyleFromStyle(style);
        
        return {
          style: dividerStyle,
          width: parseInt(width),
          align
        };
      },
      toBlock: function(data) {
        let style = '';
        
        // 设置样式
        switch (data.style) {
          case '实线':
            style += 'border-top: 1px solid #ccc;';
            break;
          case '虚线':
            style += 'border-top: 1px dashed #ccc;';
            break;
          case '点线':
            style += 'border-top: 1px dotted #ccc;';
            break;
          case '双线':
            style += 'border-top: 3px double #ccc;';
            break;
          case '渐变':
            style += 'height: 1px; background: linear-gradient(to right, rgba(0,0,0,0), rgba(0,0,0,0.2), rgba(0,0,0,0));';
            break;
        }
        
        // 设置宽度
        style += `width: ${data.width}%;`;
        
        // 设置对齐
        switch (data.align) {
          case '左对齐':
            style += 'margin-left: 0; margin-right: auto;';
            break;
          case '居中':
            style += 'margin-left: auto; margin-right: auto;';
            break;
          case '右对齐':
            style += 'margin-left: auto; margin-right: 0;';
            break;
        }
        
        style += 'margin-top: 20px; margin-bottom: 20px;';
        
        return `<hr style="${style}" />`;
      },
      toPreview: function(data) {
        let style = '';
        
        // 设置样式
        switch (data.style) {
          case '实线':
            style += 'border-top: 1px solid #ccc;';
            break;
          case '虚线':
            style += 'border-top: 1px dashed #ccc;';
            break;
          case '点线':
            style += 'border-top: 1px dotted #ccc;';
            break;
          case '双线':
            style += 'border-top: 3px double #ccc;';
            break;
          case '渐变':
            style += 'height: 1px; background: linear-gradient(to right, rgba(0,0,0,0), rgba(0,0,0,0.2), rgba(0,0,0,0));';
            break;
        }
        
        // 设置宽度
        style += `width: ${data.width}%;`;
        
        // 设置对齐
        switch (data.align) {
          case '左对齐':
            style += 'margin-left: 0; margin-right: auto;';
            break;
          case '居中':
            style += 'margin-left: auto; margin-right: auto;';
            break;
          case '右对齐':
            style += 'margin-left: auto; margin-right: 0;';
            break;
        }
        
        style += 'margin-top: 20px; margin-bottom: 20px;';
        
        return `<hr style="${style}" />`;
      }
    });
  }
  
  // 创建高级编辑工具栏
  function addAdvancedToolbar() {
    // 监听DOM变化
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          setTimeout(attachToolbars, 500);
        }
      });
    });
    
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
    
    // 初始延迟调用
    setTimeout(attachToolbars, 1000);
    
    // 附加工具栏
    function attachToolbars() {
      // 查找编辑器容器
      const containers = document.querySelectorAll('.CodeMirror');
      
      containers.forEach(container => {
        if (container.hasAttribute('data-enhanced-toolbar')) return;
        container.setAttribute('data-enhanced-toolbar', 'true');
        
        // 创建工具栏
        const toolbar = document.createElement('div');
        toolbar.className = 'enhanced-editor-toolbar';
        toolbar.innerHTML = `
          <div class="toolbar-group">
            <button title="首行缩进" class="indent-btn"><i class="fa fa-indent"></i></button>
            <button title="左对齐" class="align-left-btn"><i class="fa fa-align-left"></i></button>
            <button title="居中" class="align-center-btn"><i class="fa fa-align-center"></i></button>
            <button title="右对齐" class="align-right-btn"><i class="fa fa-align-right"></i></button>
          </div>
          <div class="toolbar-group">
            <select class="font-family-select" title="字体">
              <option value="">默认字体</option>
              <option value="songti">宋体</option>
              <option value="heiti">黑体</option>
              <option value="kaiti">楷体</option>
              <option value="yahei">微软雅黑</option>
            </select>
            <select class="font-size-select" title="字号">
              <option value="">默认大小</option>
              <option value="12px">12px</option>
              <option value="14px">14px</option>
              <option value="16px">16px</option>
              <option value="18px">18px</option>
              <option value="20px">20px</option>
              <option value="24px">24px</option>
            </select>
          </div>
          <div class="toolbar-group">
            <button title="保留格式粘贴 (Ctrl+Shift+V)" class="paste-format-btn"><i class="fa fa-paste"></i></button>
            <button title="清除格式" class="clear-format-btn"><i class="fa fa-eraser"></i></button>
          </div>
        `;
        
        // 添加样式
        toolbar.style.display = 'flex';
        toolbar.style.flexWrap = 'wrap';
        toolbar.style.gap = '10px';
        toolbar.style.background = '#f8f9fa';
        toolbar.style.padding = '8px';
        toolbar.style.borderRadius = '4px';
        toolbar.style.marginBottom = '10px';
        toolbar.style.border = '1px solid #e9ecef';
        
        // 样式工具栏组
        const groups = toolbar.querySelectorAll('.toolbar-group');
        groups.forEach(group => {
          group.style.display = 'flex';
          group.style.alignItems = 'center';
          group.style.gap = '5px';
        });
        
        // 样式按钮
        const buttons = toolbar.querySelectorAll('button');
        buttons.forEach(button => {
          button.style.border = '1px solid #dee2e6';
          button.style.background = 'white';
          button.style.borderRadius = '4px';
          button.style.padding = '5px 10px';
          button.style.cursor = 'pointer';
        });
        
        // 样式下拉菜单
        const selects = toolbar.querySelectorAll('select');
        selects.forEach(select => {
          select.style.border = '1px solid #dee2e6';
          select.style.borderRadius = '4px';
          select.style.padding = '5px';
        });
        
        // 获取CodeMirror实例
        const cm = container.CodeMirror;
        if (!cm) return;
        
        // 设置按钮事件
        const indentBtn = toolbar.querySelector('.indent-btn');
        indentBtn.addEventListener('click', () => {
          const selection = cm.getSelection();
          if (selection) {
            cm.replaceSelection(`<p style="text-indent: 2em;">${selection}</p>`);
          } else {
            const cursor = cm.getCursor();
            cm.replaceRange('<p style="text-indent: 2em;"></p>', cursor);
            cm.setCursor({line: cursor.line, ch: cursor.ch + 25});
          }
        });
        
        // 设置左对齐按钮
        const alignLeftBtn = toolbar.querySelector('.align-left-btn');
        alignLeftBtn.addEventListener('click', () => {
          const selection = cm.getSelection();
          if (selection) {
            cm.replaceSelection(`<p style="text-align: left;">${selection}</p>`);
          }
        });
        
        // 设置居中按钮
        const alignCenterBtn = toolbar.querySelector('.align-center-btn');
        alignCenterBtn.addEventListener('click', () => {
          const selection = cm.getSelection();
          if (selection) {
            cm.replaceSelection(`<p style="text-align: center;">${selection}</p>`);
          }
        });
        
        // 设置右对齐按钮
        const alignRightBtn = toolbar.querySelector('.align-right-btn');
        alignRightBtn.addEventListener('click', () => {
          const selection = cm.getSelection();
          if (selection) {
            cm.replaceSelection(`<p style="text-align: right;">${selection}</p>`);
          }
        });
        
        // 设置字体选择器
        const fontFamilySelect = toolbar.querySelector('.font-family-select');
        fontFamilySelect.addEventListener('change', () => {
          const fontFamily = fontFamilySelect.value;
          if (!fontFamily) return;
          
          const fontFamilyValue = getFontFamilyValue(fontFamily);
          const selection = cm.getSelection();
          
          if (selection) {
            cm.replaceSelection(`<span style="font-family: ${fontFamilyValue};">${selection}</span>`);
          }
          
          // 重置选择器
          fontFamilySelect.value = '';
        });
        
        // 设置字号选择器
        const fontSizeSelect = toolbar.querySelector('.font-size-select');
        fontSizeSelect.addEventListener('change', () => {
          const fontSize = fontSizeSelect.value;
          if (!fontSize) return;
          
          const selection = cm.getSelection();
          
          if (selection) {
            cm.replaceSelection(`<span style="font-size: ${fontSize};">${selection}</span>`);
          }
          
          // 重置选择器
          fontSizeSelect.value = '';
        });
        
        // 设置格式粘贴按钮
        const pasteFormatBtn = toolbar.querySelector('.paste-format-btn');
        pasteFormatBtn.addEventListener('click', () => {
          navigator.clipboard.readText()
            .then(text => {
              // 处理文本换行符，保留段落格式
              const formattedText = text
                .split('\n\n')
                .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
                .join('\n');
                
              // 插入编辑器
              cm.replaceSelection(formattedText);
            })
            .catch(err => {
              console.error('读取剪贴板失败：', err);
            });
        });
        
        // 设置清除格式按钮
        const clearFormatBtn = toolbar.querySelector('.clear-format-btn');
        clearFormatBtn.addEventListener('click', () => {
          const selection = cm.getSelection();
          if (selection) {
            // 清除HTML标签，保留纯文本
            const plainText = selection.replace(/<[^>]*>/g, '');
            cm.replaceSelection(plainText);
          }
        });
        
        // 添加工具栏到容器前
        container.parentNode.insertBefore(toolbar, container);
      });
    }
  }
  
  // 增强粘贴功能
  function enhancePasteFunctionality() {
    // 监听DOM变化
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          setTimeout(setupPasteHandlers, 500);
        }
      });
    });
    
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
    
    // 初始延迟调用
    setTimeout(setupPasteHandlers, 1000);
    
    // 设置粘贴处理器
    function setupPasteHandlers() {
      // 查找编辑器容器
      const textareas = document.querySelectorAll('.CodeMirror textarea');
      
      textareas.forEach(textarea => {
        if (textarea.hasAttribute('data-paste-enhanced')) return;
        textarea.setAttribute('data-paste-enhanced', 'true');
        
        textarea.addEventListener('paste', handlePaste);
      });
      
      // 添加快捷键说明
      const widgets = document.querySelectorAll('.nc-entryEditor-widget, .Pane2');
      widgets.forEach(widget => {
        if (widget.hasAttribute('data-shortcut-info')) return;
        widget.setAttribute('data-shortcut-info', 'true');
        
        const shortcutInfo = document.createElement('div');
        shortcutInfo.className = 'shortcut-info';
        shortcutInfo.innerHTML = `
          <details>
            <summary>编辑快捷键</summary>
            <ul>
              <li><kbd>Ctrl</kbd> + <kbd>B</kbd> - 加粗</li>
              <li><kbd>Ctrl</kbd> + <kbd>I</kbd> - 斜体</li>
              <li><kbd>Ctrl</kbd> + <kbd>K</kbd> - 链接</li>
              <li><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>V</kbd> - 保留格式粘贴</li>
              <li><kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>1-6</kbd> - 标题</li>
            </ul>
          </details>
        `;
        
        shortcutInfo.style.fontSize = '12px';
        shortcutInfo.style.color = '#666';
        shortcutInfo.style.marginTop = '10px';
        shortcutInfo.style.borderTop = '1px solid #eee';
        shortcutInfo.style.paddingTop = '10px';
        
        widget.appendChild(shortcutInfo);
      });
    }
    
    // 粘贴处理
    function handlePaste(e) {
      // 检查是否是Ctrl+Shift+V (格式化粘贴快捷键)
      if (e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        
        const clipboardData = e.clipboardData || window.clipboardData;
        if (!clipboardData) return;
        
        // 尝试获取HTML内容
        const html = clipboardData.getData('text/html');
        const text = clipboardData.getData('text');
        
        if (html) {
          // 处理HTML内容
          const cleanedHtml = cleanHtml(html);
          
          // 获取CodeMirror实例
          const textarea = e.target;
          const cmContainer = textarea.closest('.CodeMirror');
          if (cmContainer && cmContainer.CodeMirror) {
            cmContainer.CodeMirror.replaceSelection(cleanedHtml);
          } else {
            // 回退到普通文本域
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const value = textarea.value;
            
            textarea.value = value.substring(0, start) + cleanedHtml + value.substring(end);
            textarea.selectionStart = textarea.selectionEnd = start + cleanedHtml.length;
          }
        } else if (text) {
          // 处理纯文本
          const formattedText = text
            .split('\n\n')
            .map(para => para.trim() ? `<p>${para.replace(/\n/g, '<br>')}</p>` : '')
            .join('\n');
          
          // 获取CodeMirror实例
          const textarea = e.target;
          const cmContainer = textarea.closest('.CodeMirror');
          if (cmContainer && cmContainer.CodeMirror) {
            cmContainer.CodeMirror.replaceSelection(formattedText);
          } else {
            // 回退到普通文本域
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const value = textarea.value;
            
            textarea.value = value.substring(0, start) + formattedText + value.substring(end);
            textarea.selectionStart = textarea.selectionEnd = start + formattedText.length;
          }
        }
      }
    }
  }
  
  // 启用自动保存
  function enableAutoSave() {
    // 设置保存间隔（毫秒）
    const saveInterval = 5000;
    
    // 保存按钮选择器
    const saveButtonSelector = '.nc-entryEditor-toolbar button[class*="ToolbarButton"]';
    
    // 设置自动保存
    setInterval(() => {
      const saveButton = document.querySelector(saveButtonSelector);
      
      if (saveButton && !saveButton.disabled) {
        // 检查是否需要保存
        const isDirty = document.querySelector('.nc-entryEditor-widget--dirty');
        
        if (isDirty) {
          console.log('自动保存草稿...');
          saveButton.click();
        }
      }
    }, saveInterval);
    
    // 提示用户已启用自动保存
    setTimeout(() => {
      const message = document.createElement('div');
      message.className = 'auto-save-message';
      message.textContent = '已启用自动保存 (每5秒)';
      message.style.position = 'fixed';
      message.style.bottom = '20px';
      message.style.right = '20px';
      message.style.background = 'rgba(58, 105, 199, 0.9)';
      message.style.color = 'white';
      message.style.padding = '8px 15px';
      message.style.borderRadius = '4px';
      message.style.fontSize = '14px';
      message.style.zIndex = '9999';
      message.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
      
      document.body.appendChild(message);
      
      // 3秒后淡出
      setTimeout(() => {
        message.style.transition = 'opacity 0.5s';
        message.style.opacity = '0';
        
        setTimeout(() => {
          message.remove();
        }, 500);
      }, 3000);
    }, 2000);
  }
  
  // 辅助函数 - 从样式字符串获取对齐方式
  function getAlignFromStyle(style) {
    if (style.includes('text-align: center')) return '居中';
    if (style.includes('text-align: right')) return '右对齐';
    if (style.includes('text-align: justify')) return '两端对齐';
    return '左对齐';
  }
  
  // 辅助函数 - 从样式字符串获取段落样式
  function getParagraphStyleFromStyle(style) {
    if (style.includes('font-weight: bold') && style.includes('color: #333')) return '强调';
    if (style.includes('color: #888') && style.includes('font-size: 0.95em')) return '淡化';
    if (style.includes('font-style: italic') && style.includes('color: #555')) return '引用';
    return '默认';
  }
  
  // 辅助函数 - 从样式字符串获取分隔线样式
  function getDividerStyleFromStyle(style) {
    if (style.includes('border-top: 1px dashed')) return '虚线';
    if (style.includes('border-top: 1px dotted')) return '点线';
    if (style.includes('border-top: 3px double')) return '双线';
    if (style.includes('background: linear-gradient')) return '渐变';
    return '实线';
  }
  
  // 辅助函数 - 获取字体系列值
  function getFontFamilyValue(fontFamily) {
    switch (fontFamily) {
      case 'songti': return 'SimSun, serif';
      case 'heiti': return 'SimHei, sans-serif';
      case 'kaiti': return 'KaiTi, cursive';
      case 'yahei': return '"Microsoft YaHei", sans-serif';
      default: return 'inherit';
    }
  }
  
  // 辅助函数 - 获取颜色代码
  function getColorCode(colorName) {
    switch (colorName) {
      case '黑色': return '#000000';
      case '深灰': return '#333333';
      case '灰色': return '#666666';
      case '浅灰': return '#999999';
      case '红色': return '#d32f2f';
      case '蓝色': return '#1976d2';
      case '绿色': return '#388e3c';
      case '橙色': return '#f57c00';
      case '紫色': return '#7b1fa2';
      case '棕色': return '#795548';
      case '粉色': return '#e91e63';
      case '青色': return '#00bcd4';
      default: return '#000000';
    }
  }
  
  // 辅助函数 - 获取颜色名称
  function getNamedColor(colorCode) {
    switch (colorCode.toLowerCase()) {
      case '#000000': return '黑色';
      case 'black': return '黑色';
      case '#333333': return '深灰';
      case '#666666': return '灰色';
      case 'gray': return '灰色';
      case '#999999': return '浅灰';
      case '#d32f2f': return '红色';
      case 'red': return '红色';
      case '#1976d2': return '蓝色';
      case 'blue': return '蓝色';
      case '#388e3c': return '绿色';
      case 'green': return '绿色';
      case '#f57c00': return '橙色';
      case 'orange': return '橙色';
      case '#7b1fa2': return '紫色';
      case 'purple': return '紫色';
      case '#795548': return '棕色';
      case 'brown': return '棕色';
      case '#e91e63': return '粉色';
      case 'pink': return '粉色';
      case '#00bcd4': return '青色';
      case 'cyan': return '青色';
      default: return '黑色';
    }
  }
  
  // 辅助函数 - 判断是否为自定义颜色
  function isCustomColor(colorCode) {
    const namedColors = [
      '#000000', 'black', '#333333', '#666666', 'gray',
      '#999999', '#d32f2f', 'red', '#1976d2', 'blue',
      '#388e3c', 'green', '#f57c00', 'orange', '#7b1fa2',
      'purple', '#795548', 'brown', '#e91e63', 'pink',
      '#00bcd4', 'cyan'
    ];
    
    return !namedColors.includes(colorCode.toLowerCase());
  }
  
  // 辅助函数 - 清理HTML
  function cleanHtml(html) {
    // 创建临时元素
    const div = document.createElement('div');
    div.innerHTML = html;
    
    // 移除script和style标签
    const scripts = div.querySelectorAll('script, style');
    scripts.forEach(script => script.remove());
    
    // 移除不安全的属性
    const elements = div.querySelectorAll('*');
    elements.forEach(el => {
      // 移除事件属性
      Array.from(el.attributes).forEach(attr => {
        if (attr.name.startsWith('on')) {
          el.removeAttribute(attr.name);
        }
      });
      
      // 移除不安全的属性
      ['id', 'class', 'data-*'].forEach(attrName => {
        if (attrName === 'data-*') {
          // 移除所有data-属性
          Array.from(el.attributes).forEach(attr => {
            if (attr.name.startsWith('data-')) {
              el.removeAttribute(attr.name);
            }
          });
        } else {
          el.removeAttribute(attrName);
        }
      });
    });
    
    return div.innerHTML;
  }
})() 