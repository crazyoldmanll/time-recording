// 最小化的JavaScript，只处理基本交互
document.addEventListener('DOMContentLoaded', function() {
  // 幻灯片功能
  const hero = document.getElementById('hero');
  if (hero) {
    const slides = hero.querySelectorAll('.slide');
    let currentSlide = 0;

    function showSlide(index) {
      // 隐藏所有幻灯片
      slides.forEach(slide => slide.classList.remove('active'));
      // 显示当前幻灯片
      slides[index].classList.add('active');
      currentSlide = index;
    }

    function nextSlide() {
      const nextIndex = (currentSlide + 1) % slides.length;
      showSlide(nextIndex);
    }

    // 如果有多张幻灯片，自动切换
    if (slides.length > 1) {
      // 每5秒切换一次
      setInterval(nextSlide, 5000);
    }
  }

  // 章节导航功能
  const chapterNav = document.querySelector('.chapter-nav');
  if (chapterNav) {
    const chapterLinks = chapterNav.querySelectorAll('li');
    const chapterContents = document.querySelectorAll('.chapter-content');

    // 添加点击事件
    chapterLinks.forEach(link => {
      link.addEventListener('click', function() {
        // 获取目标章节ID
        const chapterId = this.getAttribute('data-chapter');
        
        // 更新导航状态
        chapterLinks.forEach(item => item.classList.remove('active'));
        this.classList.add('active');
        
        // 更新内容状态
        chapterContents.forEach(content => {
          if (content.id === chapterId) {
            content.classList.add('visible');
          } else {
            content.classList.remove('visible');
          }
        });
      });
    });
  }

  // 开始阅读按钮功能
  const ctaButtons = document.querySelectorAll('.cta-button');
  if (ctaButtons.length > 0) {
    ctaButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }
});

