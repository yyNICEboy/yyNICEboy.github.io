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

// 定义徽章和等级
const badges = {
  '炼气期': { required: 20 },  
  '筑基期': { required: 100 },  
  '结丹期': { required: 200 },  
  '元婴期': { required: 300 },  
  '化神期': { required: 355 },  
  '渡劫期': { required: 120 },  
  '大乘期': { required: 200 }, 
  '合道期': { required: 300 }, 
  '无上仙人': { required: 355 },  
  // 可以根据需要添加更多徽章
};

const levels = [
  { level: 1, required: 0 },
  { level: 2, required: 20 },
  { level: 3, required: 50 },
  { level: 4, required: 100},
  { level: 5, required: 175 },
  { level: 6, required: 250 },
  { level: 7, required: 355 },
  { level: 8, required: 455 },
  { level: 9, required:  555 },
  { level: 10, required: 800 },
];

let currentLevel = 1;
let totalPoints = 0;
let unlockedBadges = [];

// 创建一个简单的 HTML 页面
const htmlTemplate = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>实训报告格式自检</title>
  <!-- 引入外部库 -->
  <!-- Animate.css 用于动画效果 -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
  <!-- SweetAlert2 用于弹出提示 -->
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  <!-- Confetti.js 用于庆祝动画 -->
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"></script>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .checkbox { display: flex; align-items: center; }
    .checkbox input { margin-right: 10px; }
    .completed { text-decoration: line-through; color: gray; }
    #badges span { 
      margin-right: 10px; 
      background-color: #e0e0e0; 
      padding: 5px 10px; 
      border-radius: 5px; 
      display: inline-block; 
      transition: transform 0.3s;
    }
    #badges span.unlocked {
      transform: scale(1.2);
      animation: tada 1s;
    }
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
      transition: width 0.3s ease;
    }
    /* Animate.css keyframes for tada animation */
    @keyframes tada {
      from { transform: scale3d(1, 1, 1); }
      10%, 20% { transform: scale3d(0.9, 1.1, 1); }
      30%, 50%, 70%, 90% { transform: scale3d(1.1, 0.9, 1); }
      40%, 60%, 80% { transform: scale3d(0.95, 1.05, 1); }
      to { transform: scale3d(1, 1, 1); }
    }
    /* 额外美化 */
    h1, h2, h3 {
      color: #333;
    }
    .section-divider {
      margin: 40px 0;
      border-top: 2px dashed #ccc;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    table, th, td {
      border: 1px solid #ddd;
    }
    th, td {
      padding: 8px;
      text-align: left;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    /* Badge Icons */
    .badge-icon {
      margin-right: 5px;
    }
    /* 进度条颜色变化 */
    #progress.low { background-color: #ff4d4d; }
    #progress.medium { background-color: #ffdb4d; }
    #progress.high { background-color: #4dff4d; }
    /* 等级显示 */
    #level-display {
      margin-top: 20px;
      font-size: 1.2em;
      color: #333;
    }
    /* 提交按钮样式 */
    #submit-button {
      margin-top: 30px;
      padding: 10px 20px;
      font-size: 1em;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
    #submit-button:hover {
      background-color: #45a049;
    }
    /* 模态窗口样式 */
    .modal {
      display: none; /* Hidden by default */
      position: fixed; /* Stay in place */
      z-index: 1000; /* Sit on top */
      left: 0;
      top: 0;
      width: 100%; /* Full width */
      height: 100%; /* Full height */
      overflow: auto; /* Enable scroll if needed */
      background-color: rgba(0,0,0,0.5); /* Black w/ opacity */
    }
    .modal-content {
      background-color: #fefefe;
      margin: 5% auto; /* 5% from the top and centered */
      padding: 20px;
      border: 1px solid #888;
      width: 80%; /* Could be more or less, depending on screen size */
      border-radius: 10px;
    }
    .close {
      color: #aaa;
      float: right;
      font-size: 28px;
      font-weight: bold;
      cursor: pointer;
    }
    .close:hover,
    .close:focus {
      color: black;
      text-decoration: none;
    }
    iframe {
      width: 100%;
      height: 600px;
      border: none;
    }
  </style>
</head>
<body>
  ${renderedHTML}
  
  <div id="progress-bar">
    <div id="progress">0%</div>
  </div>
  
  <div id="level-display">
    <strong>当前等级：</strong><span id="current-level">1</span>
  </div>
  
  <button id="submit-button">提交自检结果</button>
  
  <!-- 模态窗口 -->
  <div id="survey-modal" class="modal">
    <div class="modal-content">
      <span class="close">&times;</span>
      <iframe src="https://wj.qq.com/s2/17487730/7be9/" frameborder="0"></iframe>
    </div>
  </div>
  
  <!-- 声音元素已移除 -->
  
  <script>
    // 检查浏览器是否支持Local Storage
    if (typeof(Storage) === 'undefined') {
      alert('抱歉，您的浏览器不支持Local Storage功能。无法保存您的进度。');
    }

    // 获取所有复选框
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const totalPointsEl = document.querySelector('#total-points');
    const badgesEl = document.querySelector('#badges');
    const progressEl = document.querySelector('#progress');
    const levelEl = document.querySelector('#current-level');
    const submitButton = document.querySelector('#submit-button');

    // 模态窗口元素
    const modal = document.getElementById("survey-modal");
    const span = document.getElementsByClassName("close")[0];

    // 积分和徽章数据
    const badges = {
      '炼气期': { required: 20 },  
      '筑基期': { required: 100 },  
      '结丹期': { required: 200 },  
      '元婴期': { required: 300 },  
      '化神期': { required: 355 },  
      '渡劫期': { required: 120 },  
      '大乘期': { required: 200 }, 
      '合道期': { required: 300 }, 
      '无上仙人': { required: 355 },  
      // 可以根据需要添加更多徽章
    };
    const levels = [
      { level: 1, required: 0 },
      { level: 2, required: 20 },
      { level: 3, required: 40 },
      { level: 4, required: 60 },
      { level: 5, required: 80 },
      { level: 6, required: 100 },
      { level: 7, required: 120 },
      { level: 8, required: 160 },
      { level: 9, required: 200 },
      { level: 10, required: 250 },
      { level: 11, required: 300 },
      { level: 12, required: 355 },
      // 根据需要添加更多等级
    ];
    let currentLevel = 1;
    let totalPoints = 0;
    let unlockedBadges = [];

    // 初始化：加载数据
    window.onload = () => {
      // 设置 data-points 属性
      checkboxes.forEach(cb => {
        const pointsMatch = cb.parentElement.innerHTML.match(/<!--\\s*points:(\\d+)\\s*-->/);
        if (pointsMatch) {
          cb.setAttribute('data-points', pointsMatch[1]);
        } else {
          cb.setAttribute('data-points', '0'); // 如果未指定积分，默认为0
        }
      });

      // 加载总积分
      if (localStorage.getItem('totalPoints')) {
        totalPoints = parseInt(localStorage.getItem('totalPoints'));
        if (!isNaN(totalPoints)) {
          totalPointsEl.textContent = totalPoints;
        } else {
          totalPoints = 0;
          totalPointsEl.textContent = totalPoints;
        }
      }

      // 加载已解锁的徽章
      if (localStorage.getItem('unlockedBadges')) {
        unlockedBadges = JSON.parse(localStorage.getItem('unlockedBadges'));
        updateBadges();
      }

      // 加载当前等级
      if (localStorage.getItem('currentLevel')) {
        currentLevel = parseInt(localStorage.getItem('currentLevel'));
        if (!isNaN(currentLevel)) {
          levelEl.textContent = currentLevel;
        } else {
          currentLevel = 1;
          levelEl.textContent = currentLevel;
        }
      }

      // 初始化复选框状态
      checkboxes.forEach(cb => {
        const taskId = cb.parentElement.getAttribute('id');
        if (localStorage.getItem(taskId) === 'true') {
          cb.checked = true;
          const points = parseInt(cb.getAttribute('data-points'));
          if (!isNaN(points)) {
            addPoints(points);
          }
          markCompleted(cb);
        }
        // 添加事件监听
        cb.addEventListener('change', () => {
          const points = parseInt(cb.getAttribute('data-points'));
          if (cb.checked) {
            if (!isNaN(points)) {
              addPoints(points);
            }
            markCompleted(cb);
            localStorage.setItem(taskId, 'true');
            checkBadges();
            checkLevels();
          } else {
            if (!isNaN(points)) {
              subtractPoints(points);
            }
            unmarkCompleted(cb);
            localStorage.setItem(taskId, 'false');
            checkBadges();
            checkLevels();
          }
          saveData();
          updateProgress();
        });
      });

      // 在页面加载时检查徽章和等级
      checkBadges();
      checkLevels();
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
      let newBadges = [];
      for (const badge in badges) {
        if (totalPoints >= badges[badge].required && !unlockedBadges.includes(badge)) {
          newBadges.push(badge);
        }
      }

      if (newBadges.length > 0) {
        unlockedBadges = unlockedBadges.concat(newBadges);
        updateBadges();
        newBadges.forEach(badge => unlockBadge(badge));
        saveData(); // 保存已解锁的徽章
      }
    }

    function updateBadges() {
      if (unlockedBadges.length === 0) {
        badgesEl.textContent = '无';
      } else {
        badgesEl.innerHTML = unlockedBadges.map(b => \`<span>\${b}</span>\`).join('');
      }
    }

    function unlockBadge(badge) {
      // 显示徽章解锁弹窗
      Swal.fire({
        title: '恭喜！',
        text: \`您已解锁徽章：\${badge}\`,
        icon: 'success',
        confirmButtonText: '继续加油！'
      });

      // 触发庆祝动画
      confetti({
        particleCount: 200,
        spread: 70,
        origin: { y: 0.6 }
      });

      // 触发徽章解锁动画
      const badgeElements = document.querySelectorAll('#badges span');
      badgeElements.forEach(span => {
        if (span.textContent === badge) {
          span.classList.add('unlocked');
          setTimeout(() => {
            span.classList.remove('unlocked');
          }, 1000);
        }
      });
    }

    function checkLevels() {
      for (let i = levels.length - 1; i >= 0; i--) {
        if (totalPoints >= levels[i].required) {
          if (currentLevel < levels[i].level) {
            currentLevel = levels[i].level;
            updateLevel();
            unlockLevel(currentLevel);
          }
          break;
        }
      }
      saveData(); // 保存当前等级
    }

    function updateLevel() {
      levelEl.textContent = currentLevel;
    }


    function saveData() {
      localStorage.setItem('totalPoints', totalPoints);
      localStorage.setItem('unlockedBadges', JSON.stringify(unlockedBadges));
      localStorage.setItem('currentLevel', currentLevel);
    }

    function updateProgress() {
      const totalTasks = checkboxes.length;
      const completedTasks = document.querySelectorAll('input[type="checkbox"]:checked').length;
      const progressPercent = Math.round((completedTasks / totalTasks) * 100);
      progressEl.style.width = \`\${progressPercent}%\`;
      progressEl.textContent = \`\${progressPercent}%\`;

      // 更改进度条颜色
      if (progressPercent < 50) {
        progressEl.classList.remove('medium', 'high');
        progressEl.classList.add('low');
      } else if (progressPercent < 100) {
        progressEl.classList.remove('low', 'high');
        progressEl.classList.add('medium');
      } else {
        progressEl.classList.remove('low', 'medium');
        progressEl.classList.add('high');
      }
    }

    // 提交按钮功能
    submitButton.addEventListener('click', () => {
      // 检查是否所有任务都已完成
      const allCompleted = Array.from(checkboxes).every(cb => cb.checked);
      if (!allCompleted) {
        Swal.fire({
          title: '尚未完成所有任务',
          text: '请完成所有自检任务后再提交。',
          icon: 'warning',
          confirmButtonText: '继续自检'
        });
        return;
      }

      // 直接显示模态窗口，嵌入腾讯问卷
      modal.style.display = "block";
    });

    // 当用户点击 <span> (x)，关闭模态窗口
    span.onclick = function() {
      modal.style.display = "none";
    }

    // 当用户在模态窗口外点击，关闭模态窗口
    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }
  </script>
</body>
</html>
`;

// 写入 HTML 文件
const outputPath = path.join(__dirname, 'index.html');
fs.writeFileSync(outputPath, htmlTemplate, 'utf-8');

console.log('HTML 文件已生成：', outputPath);
