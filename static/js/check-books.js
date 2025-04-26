/**
 * 书籍数据检查工具
 * 用于检查当前页面是否有书籍数据，并在开发环境中提供创建示例数据的功能
 */

document.addEventListener('DOMContentLoaded', function() {
  // 获取书籍列表容器
  const bookListContainer = document.querySelector('.book-list-container');
  const noBooks = document.querySelector('.no-books');
  
  // 如果没有书籍，显示创建示例数据的按钮（仅在开发环境中）
  if (noBooks && window.location.hostname === 'localhost') {
    // 创建示例数据按钮
    const createSampleButton = document.createElement('button');
    createSampleButton.className = 'create-sample-btn';
    createSampleButton.textContent = '创建示例数据';
    createSampleButton.style.cssText = `
      display: block;
      margin: 20px auto;
      padding: 10px 20px;
      background: #3a69c7;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    `;
    
    createSampleButton.addEventListener('click', function() {
      if (confirm('这将创建示例书籍和章节数据，仅用于开发环境测试。确定要继续吗？')) {
        // 显示正在创建的提示
        this.textContent = '正在创建示例数据...';
        this.disabled = true;
        
        // 模拟创建过程
        setTimeout(() => {
          // 创建示例HTML
          const sampleHTML = createSampleBooksHTML();
          
          // 替换无书籍提示为示例书籍
          const container = document.querySelector('.container');
          if (container) {
            noBooks.remove();
            container.innerHTML += sampleHTML;
            
            // 重新初始化书籍交互
            initBookInteractions();
            
            // 显示成功提示
            showNotification('示例数据创建成功！这些数据仅在当前会话中有效。');
          }
        }, 1000);
      }
    });
    
    // 添加按钮到页面
    noBooks.appendChild(createSampleButton);
    
    // 添加提示
    const devNotice = document.createElement('p');
    devNotice.className = 'dev-notice';
    devNotice.textContent = '开发环境：可创建示例数据进行界面测试';
    devNotice.style.cssText = `
      text-align: center;
      color: #888;
      font-size: 14px;
      margin-top: 10px;
    `;
    noBooks.appendChild(devNotice);
  }
  
  // 初始化书籍交互（用于动态创建的示例数据）
  function initBookInteractions() {
    // 获取所有书籍列表项
    const bookItems = document.querySelectorAll('.book-item');
    const bookDetails = document.querySelectorAll('.book-detail');
    
    // 如果没有书籍项，退出
    if (!bookItems.length) return;
    
    // 显示特定书籍的详细信息
    function showBookDetail(bookId) {
      // 隐藏所有书籍详情
      bookDetails.forEach(detail => {
        detail.classList.remove('active');
      });
      
      // 显示选中的书籍详情
      const selectedDetail = document.querySelector(`.book-detail[data-book-id="${bookId}"]`);
      if (selectedDetail) {
        selectedDetail.classList.add('active');
      }
    }
    
    // 为每个书籍项添加点击事件
    bookItems.forEach(item => {
      item.addEventListener('click', function() {
        const bookId = this.getAttribute('data-book-id');
        
        // 移除所有活跃状态
        bookItems.forEach(item => item.classList.remove('active'));
        
        // 添加活跃状态到当前项
        this.classList.add('active');
        
        // 显示对应的书籍详情
        showBookDetail(bookId);
      });
    });
    
    // 默认显示第一本书
    if (bookItems.length > 0 && bookDetails.length > 0) {
      const firstBookId = bookItems[0].getAttribute('data-book-id');
      showBookDetail(firstBookId);
      bookItems[0].classList.add('active');
    }
  }
  
  // 创建示例书籍HTML
  function createSampleBooksHTML() {
    const sampleBooks = [
      {
        id: 'sample-book-1',
        title: '我的青春岁月',
        date: '2023-01-15',
        cover: '/images/default-book-cover.jpg',
        description: '这是一本关于青春时期的回忆录，记录了成长过程中的喜怒哀乐和重要转折点。通过这些故事，我希望能与读者分享那段难忘的时光。',
        chapters: [
          { title: '第一章：初识校园', date: '2023-01-20', time: '10' },
          { title: '第二章：友谊的开始', date: '2023-02-05', time: '15' },
          { title: '第三章：青春的困惑', date: '2023-02-20', time: '12' },
          { title: '第四章：成长的转折', date: '2023-03-10', time: '18' },
          { title: '第五章：毕业时光', date: '2023-03-25', time: '14' }
        ]
      },
      {
        id: 'sample-book-2',
        title: '职场奋斗史',
        date: '2023-04-10',
        cover: '/images/default-book-cover.jpg',
        description: '这本书记录了我进入职场后的种种经历，从初入职场的茫然到逐渐找到自己的定位，分享了我在职业发展中的经验和教训。',
        chapters: [
          { title: '第一章：初入职场', date: '2023-04-15', time: '12' },
          { title: '第二章：团队协作', date: '2023-05-01', time: '14' },
          { title: '第三章：职业瓶颈', date: '2023-05-18', time: '16' }
        ]
      },
      {
        id: 'sample-book-3',
        title: '环球旅行记',
        date: '2023-06-05',
        cover: '/images/default-book-cover.jpg',
        description: '这是我环球旅行的记录，包含了对不同国家文化、风景和人文的观察和思考。通过这些旅行经历，我对世界有了更深刻的理解。',
        chapters: [
          { title: '第一章：亚洲之旅', date: '2023-06-10', time: '20' },
          { title: '第二章：欧洲见闻', date: '2023-07-01', time: '18' },
          { title: '第三章：美洲风情', date: '2023-07-20', time: '15' },
          { title: '第四章：非洲探险', date: '2023-08-05', time: '25' }
        ]
      }
    ];
    
    // 生成HTML
    let sidebarHTML = `
      <div class="book-list-container">
        <div class="book-sidebar">
          <ul class="book-nav">
    `;
    
    let detailsHTML = `
      <div class="books-details-container">
    `;
    
    // 为每本书生成HTML
    sampleBooks.forEach((book, index) => {
      // 侧边栏项
      sidebarHTML += `
        <li class="book-item ${index === 0 ? 'active' : ''}" data-book-id="${book.id}">
          <span class="book-item-title">${book.title}</span>
        </li>
      `;
      
      // 详情区域
      detailsHTML += `
        <div class="book-detail ${index === 0 ? 'active' : ''}" data-book-id="${book.id}">
          <div class="book-header">
            <div class="book-cover">
              <img src="${book.cover}" alt="${book.title}">
            </div>
            
            <div class="book-info">
              <h3 class="book-title">${book.title}</h3>
              
              <div class="book-meta">
                <div class="book-date">
                  <i class="far fa-calendar-alt"></i>
                  <span>${book.date}</span>
                </div>
                
                <div class="book-chapters">
                  <i class="fas fa-book-open"></i>
                  <span>${book.chapters.length} 章节</span>
                </div>
              </div>
              
              <div class="book-description">
                ${book.description}
              </div>
              
              <div class="book-actions">
                <a href="#" class="book-action-btn book-action-btn-primary">
                  <i class="fas fa-book-reader"></i> 阅读全书
                </a>
                <a href="#" class="book-action-btn book-action-btn-secondary">
                  <i class="fas fa-list"></i> 查看章节
                </a>
              </div>
            </div>
          </div>
          
          <div class="book-chapters-list">
            <h4 class="chapter-list-title">最新章节</h4>
            
            <ul class="chapter-list">
      `;
      
      // 为每本书添加章节
      book.chapters.forEach(chapter => {
        detailsHTML += `
          <li class="chapter-item">
            <a href="#" class="chapter-link">${chapter.title}</a>
            <div class="chapter-meta">
              <span class="chapter-date">${chapter.date.substring(5)}</span>
              <span class="chapter-reading-time">${chapter.time} 分钟</span>
            </div>
          </li>
        `;
      });
      
      detailsHTML += `
            </ul>
            
            <div class="more-chapters">
              <a href="#" class="more-link">查看更多章节 <i class="fas fa-arrow-right"></i></a>
            </div>
          </div>
        </div>
      `;
    });
    
    // 闭合HTML标签
    sidebarHTML += `
          </ul>
        </div>
    `;
    
    detailsHTML += `
      </div>
    `;
    
    // 合并HTML
    return `<div class="book-list-container">${sidebarHTML}${detailsHTML}</div>`;
  }
  
  // 显示通知
  function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 15px 20px;
      border-radius: 4px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      z-index: 1000;
      opacity: 0;
      transform: translateY(-20px);
      transition: opacity 0.3s, transform 0.3s;
    `;
    
    document.body.appendChild(notification);
    
    // 显示通知
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateY(0)';
    }, 100);
    
    // 5秒后隐藏通知
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(-20px)';
      
      // 动画结束后移除元素
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 5000);
  }
}); 