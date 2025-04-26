/**
 * 书籍目录交互脚本
 * 实现点击左侧书籍标题，在右侧显示相应书籍内容的功能
 */

document.addEventListener('DOMContentLoaded', function() {
  // 获取所有书籍列表项
  const bookItems = document.querySelectorAll('.books-sidebar .book-item');
  const bookDetails = document.querySelectorAll('.book-detail');
  
  // 如果没有书籍项，退出
  if (!bookItems.length) return;
  
  // 初始化，默认显示第一本书
  function initBookDisplay() {
    // 如果有书籍，默认显示第一本
    if (bookItems.length > 0 && bookDetails.length > 0) {
      const firstBookId = bookItems[0].getAttribute('data-book-id');
      showBookDetail(firstBookId);
      bookItems[0].classList.add('active');
    }
  }
  
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
      
      // 如果在移动设备上，滚动到详情区域
      if (window.innerWidth < 768) {
        selectedDetail.scrollIntoView({ behavior: 'smooth' });
      }
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
  
  // 处理URL哈希值，如果有指定的书籍ID，则显示该书籍
  function handleUrlHash() {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#book-')) {
      const bookId = hash.substring(6); // 移除 '#book-' 前缀
      const bookItem = document.querySelector(`.book-item[data-book-id="${bookId}"]`);
      
      if (bookItem) {
        // 移除所有活跃状态
        bookItems.forEach(item => item.classList.remove('active'));
        
        // 添加活跃状态到目标项
        bookItem.classList.add('active');
        
        // 显示对应的书籍详情
        showBookDetail(bookId);
      }
    }
  }
  
  // 监听哈希变化事件
  window.addEventListener('hashchange', handleUrlHash);
  
  // 初始化
  initBookDisplay();
  handleUrlHash(); // 检查初始URL是否包含书籍ID
  
  // 响应式处理
  window.addEventListener('resize', function() {
    // 在移动视图下，如果有活跃的书籍，确保它可见
    if (window.innerWidth < 768) {
      const activeDetail = document.querySelector('.book-detail.active');
      if (activeDetail) {
        activeDetail.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
}); 