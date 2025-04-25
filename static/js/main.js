/**
 * 自传体小说网站 - 交互脚本
 */

document.addEventListener('DOMContentLoaded', function() {
  // 变量定义
  const nav = document.querySelector('.site-header');
  const backToTopBtn = document.getElementById('back-to-top');
  const progressBar = document.querySelector('.progress-bar');

  // 章节切换
  const chapterNavItems = document.querySelectorAll('.chapter-nav li');
  const chapterContents = document.querySelectorAll('.chapter-content');
  const galleryLinks = document.querySelectorAll('.gallery-link');
  const navChapterLinks = document.querySelectorAll('.prev-chapter, .next-chapter');

  function showChapter(chapterId) {
    // 隐藏所有章节
    chapterContents.forEach(chapter => chapter.classList.remove('visible'));
    // 取消选中状态
    chapterNavItems.forEach(item => item.classList.remove('active'));

    // 显示选中章节
    const activeChapter = document.getElementById(chapterId);
    if (activeChapter) {
      activeChapter.classList.add('visible');
      // 设置选中状态
      const activeNavItem = document.querySelector(`.chapter-nav li[data-chapter="${chapterId}"]`);
      if (activeNavItem) {
        activeNavItem.classList.add('active');
        // 确保导航项可见（在移动设备上）
        activeNavItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      // 滚动到章节部分
      const chaptersSection = document.getElementById('chapters');
      if (chaptersSection) {
        chaptersSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  // 为章节导航添加点击事件
  chapterNavItems.forEach(item => {
    item.addEventListener('click', function() {
      const chapterId = this.getAttribute('data-chapter');
      showChapter(chapterId);
    });
  });

  // 为章节之间导航添加点击事件
  navChapterLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const chapterId = this.getAttribute('data-chapter');
      showChapter(chapterId);
    });
  });

  // 为相册链接添加点击事件
  galleryLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const chapterId = this.getAttribute('data-chapter');
      showChapter(chapterId);
    });
  });

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
});

