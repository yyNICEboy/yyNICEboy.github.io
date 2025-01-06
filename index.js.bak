// index.js
const fs = require('fs');
const path = require('path');
const MarkdownIt = require('markdown-it');
const mdCheckbox = require('markdown-it-checkbox');
const mdAttrs = require('markdown-it-attrs');

// 初始化 Markdown-it
const md = new MarkdownIt({
  html: true, // 允许嵌入 HTML
  linkify: true,
  typographer: true,
})
  .use(mdCheckbox, {
    divWrap: false,
    divClass: 'checkbox',
    idPrefix: 'cbx_',
  })
  .use(mdAttrs);

// 读取 Markdown 文件
const markdownPath = path.join(__dirname, 'selfcheck.md');
const markdownContent = fs.readFileSync(markdownPath, 'utf-8');

// 渲染 HTML
const renderedHTML = md.render(markdownContent);

// 创建一个简单的 HTML 页面
const htmlTemplate = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>论文自检任务清单</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .checkbox { display: flex; align-items: center; }
    .checkbox input { margin-right: 10px; }
    .completed { text-decoration: line-through; color: gray; }
    #badges span { margin-right: 10px; background-color: #e0e0e0; padding: 5px 10px; border-radius: 5px; }
    #progress-bar {
      width: 100%;
      background-color: #e0e0e0;
      border-radius: 5px;
      margin: 20px 0;
    }
    #progress {
      width: 0%;
      height: 20px;
      background-color: #76c7c0;
      border-radius: 5px;
      text-align: center;
      color: white;
      line-height: 20px;
    }
  </style>
</head>
<body>
  ${renderedHTML}
  
  <div id="progress-bar">
    <div id="progress">0%</div>
  </div>
  
  <script>
    // 获取所有复选框
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const totalPointsEl = document.getElementById('total-points');
    const badgesEl = document.getElementById('badges');
    const progressEl = document.getElementById('progress');

    // 积分和徽章数据
    const badges = {
      '格式达人': { required: 20 },
      '摘要高手': { required: 25 },
      // 添加更多徽章
    };
    let totalPoints = 0;
    let unlockedBadges = [];

    // 初始化：加载数据
    window.onload = () => {
      // 加载总积分
      if (localStorage.getItem('totalPoints')) {
        totalPoints = parseInt(localStorage.getItem('totalPoints'));
        totalPointsEl.textContent = totalPoints;
      }

      // 加载已解锁的徽章
      if (localStorage.getItem('unlockedBadges')) {
        unlockedBadges = JSON.parse(localStorage.getItem('unlockedBadges'));
        updateBadges();
      }

      // 初始化复选框状态
      checkboxes.forEach(cb => {
        const taskId = cb.parentElement.getAttribute('id');
        if (localStorage.getItem(taskId) === 'true') {
          cb.checked = true;
          addPoints(parseInt(cb.getAttribute('data-points')));
          markCompleted(cb);
        }
        // 添加事件监听
        cb.addEventListener('change', () => {
          if (cb.checked) {
            addPoints(parseInt(cb.getAttribute('data-points')));
            markCompleted(cb);
            localStorage.setItem(taskId, 'true');
          } else {
            subtractPoints(parseInt(cb.getAttribute('data-points')));
            unmarkCompleted(cb);
            localStorage.setItem(taskId, 'false');
          }
          checkBadges();
          saveData();
          updateProgress();
        });
      });

      updateProgress();
    };

    function addPoints(points) {
      totalPoints += points;
      updatePoints();
    }

    function subtractPoints(points) {
      totalPoints -= points;
      if (totalPoints < 0) totalPoints = 0;
      updatePoints();
    }

    function updatePoints() {
      totalPointsEl.textContent = totalPoints;
    }

    function markCompleted(checkbox) {
      checkbox.parentElement.classList.add('completed');
    }

    function unmarkCompleted(checkbox) {
      checkbox.parentElement.classList.remove('completed');
    }

    function checkBadges() {
      for (const badge in badges) {
        if (totalPoints >= badges[badge].required && !unlockedBadges.includes(badge)) {
          unlockedBadges.push(badge);
          updateBadges();
        }
      }
    }

    function updateBadges() {
      badgesEl.innerHTML = unlockedBadges.map(b => \`<span>\${b}</span>\`).join('');
    }

    function saveData() {
      localStorage.setItem('totalPoints', totalPoints);
      localStorage.setItem('unlockedBadges', JSON.stringify(unlockedBadges));
    }

    function updateProgress() {
      const totalTasks = checkboxes.length;
      const completedTasks = document.querySelectorAll('input[type="checkbox"]:checked').length;
      const progressPercent = Math.round((completedTasks / totalTasks) * 100);
      progressEl.style.width = \`\${progressPercent}%\`;
      progressEl.textContent = \`\${progressPercent}%\`;
    }

    // 读取积分和徽章数据从任务列表
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      const pointsMatch = cb.parentElement.textContent.match(/<!--\\s*points:(\\d+)\\s*-->/);
      if (pointsMatch) {
        cb.setAttribute('data-points', pointsMatch[1]);
      }
    });
  </script>
</body>
</html>
`;

// 写入 HTML 文件
const outputPath = path.join(__dirname, 'index.html');
fs.writeFileSync(outputPath, htmlTemplate, 'utf-8');

console.log('HTML 文件已生成：', outputPath);
