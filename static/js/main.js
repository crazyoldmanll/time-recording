/**
 * 自传体小说网站 - 交互脚本
 */

document.addEventListener('DOMContentLoaded', function() {
  // 变量定义
  const nav = document.querySelector('.site-header');
  const backToTopBtn = document.getElementById('back-to-top');
  const progressBar = document.querySelector('.progress-bar');

  // 阅读进度条
  function updateReadingProgress() {
    if (!progressBar) return;
    
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;
    const scrollPercent = scrollTop / (docHeight - winHeight);
    progressBar.style.width = `${scrollPercent * 100}%`;
    
    // 显示或隐藏回到顶部按钮
    if (scrollTop > 600) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }

  // 回到顶部功能
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // 监听滚动事件
  window.addEventListener('scroll', updateReadingProgress);

  // 联系表单提交处理
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      // 不需要阻止默认提交行为，让Netlify处理表单提交
      // 这里只添加一些UI反馈
      
      // 简单表单验证
      const name = this.querySelector('#name').value.trim();
      const email = this.querySelector('#email').value.trim();
      const message = this.querySelector('#message').value.trim();
      
      if (!name || !email || !message) {
        alert('请填写所有必填字段');
        e.preventDefault();
        return;
      }
      
      // 成功提交的UI反馈会由Netlify的成功页面处理
      // 无需在此处重置表单
    });
  }

  // 页面加载时触发一次更新
  updateReadingProgress();

  // 书籍卡片动画
  const bookCards = document.querySelectorAll('.book-card');
  if (bookCards.length > 0) {
    bookCards.forEach((card, index) => {
      // 添加淡入动画，错开展示
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 100 * index);
    });
  }
});

