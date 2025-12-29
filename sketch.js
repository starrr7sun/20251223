let seeSpriteSheet, walkSpriteSheet, shootSpriteSheet, sleepSpriteSheet, smileSpriteSheet, drinkSpriteSheet, standSpriteSheet, smileWalkSpriteSheet, quagmireSeeSpriteSheet, megSeeSpriteSheet;
let seeAnimation = [], walkAnimation = [], shootAnimation = [], sleepAnimation = [], smileAnimation = [], drinkAnimation = [], standAnimation = [], smileWalkAnimation = [], quagmireSeeAnimation = [], megSeeAnimation = [];

let bgImage;
let bgX = 0;
const seeFrameCount = 8; // 'see.png' 的圖片總數
const walkFrameCount = 4; // 'walk.png' 的圖片總數
const shootFrameCount = 5; // 'shoot.png' 的圖片總數
const sleepFrameCount = 12; // 'sleep.png' 的圖片總數
const smileFrameCount = 8; // 'smile.png' 的圖片總數
const drinkFrameCount = 15; // 'drink.png' 的圖片總數
const standFrameCount = 9; // 'stand.png' 的圖片總數
const smileWalkFrameCount = 5; // '2/walk/walk.png' 的圖片總數
const quagmireSeeFrameCount = 8; // '4/see/see.png' 的圖片總數
const megSeeFrameCount = 5; // '5/see/see.png' 的圖片總數

let seeFrameWidth, walkFrameWidth, shootFrameWidth, sleepFrameWidth, smileFrameWidth, drinkFrameWidth, standFrameWidth, smileWalkFrameWidth, quagmireSeeFrameWidth, megSeeFrameWidth;
let charX, charY; // 角色的位置
let vy = 0; // 角色的垂直速度
const gravity = 1; // 重力加速度
const jumpStrength = -20; // 跳躍力道 (負值代表向上)
let groundY; // 地面的 Y 座標

let smileCharX, smileCharY; // 角色2的位置
let standCharX, standCharY; // 站立角色的位置
let quagmireCharX, quagmireCharY; // 角色4的位置
let megCharX, megCharY; // 角色5的位置
let speed = 3; // 角色的移動速度
let facingRight = true; // 角色面向的方向，預設向右
let smileCharFacingRight = false; // 新角色面向的方向，預設向左

const proximityThreshold = 150; // 觸發動畫的距離閾值

let nameInput; // 玩家輸入框
let conversationState = 'none'; // 'none', 'asking', 'answered'
let currentSpeaker = 'none'; // 'none', 'stand', 'quagmire', 'meg' - 記錄目前是誰在說話
let brianSays = ""; // 角色2對話框的內容
let drinkFrame = 0; // 喝東西動畫的目前畫格
let questionsTable; // questions.csv 的 Table
let currentQuestionRow = null; // 目前題目的 table row

let isShooting = false; // 是否正在播放射擊動畫
let shootFrame = 0; // 目前射擊動畫的畫格
const shootAnimationSpeed = 8; // 射擊動畫速度，數字越小越快

let isSleeping = false; // 是否正在播放睡眠動畫
let sleepPlayFrame = 0; // 睡眠動畫已播放的畫格數

let gameState = 'START'; // 遊戲狀態：'START' 或 'PLAY'
let startButton; // 開始按鈕
let restartButton; // 重新開始按鈕
let correctAnswersCount = 0; // 記錄答對的題數
let bgm; // 背景音樂
let menuButton, muteButton, volumeSlider; // 選單相關按鈕
let isMenuOpen = false; // 選單是否開啟
let isMuted = false; // 是否靜音

function preload() {
  // 預先載入圖片精靈檔案
  bgImage = loadImage('background.png');
  seeSpriteSheet = loadImage('1/see/see.png');
  walkSpriteSheet = loadImage('1/walk/walk.png');
  shootSpriteSheet = loadImage('1/shoot/shoot.png');
  sleepSpriteSheet = loadImage('1/sleep/sleep.png');
  smileSpriteSheet = loadImage('2/smile/smile.png');
  drinkSpriteSheet = loadImage('2/drink/drink.png');
  smileWalkSpriteSheet = loadImage('2/walk/walk.png');
  standSpriteSheet = loadImage('3/stand/stand.png');
  quagmireSeeSpriteSheet = loadImage('4/see/see.png');
  megSeeSpriteSheet = loadImage('5/see/see.png');
  // 載入題庫 CSV。header:true 方便用欄位名稱取值
  questionsTable = loadTable('questions.csv', 'csv', 'header');
  bgm = loadSound('bgm.mp3');
}

function setup() {
  // 建立一個全螢幕的畫布
  createCanvas(windowWidth, windowHeight);
  
  // 將背景圖片調整為視窗大小，確保填滿畫面
  bgImage.resize(width, height);

  // 初始化角色位置在畫布中央
  charX = width / 2;
  groundY = height * 0.75; // 設定地面高度
  charY = groundY; // 將角色位置放在草地上

  // 初始化新角色位置在原角色的左邊
  smileCharX = charX - 100; // 假設一個初始距離
  smileCharY = charY;

  // 初始化站立角色位置在原角色的右邊
  standCharX = charX + 400;
  standCharY = charY;

  // 初始化角色4位置在原角色的左邊
  quagmireCharX = charX - 600;
  quagmireCharY = charY;

  // 初始化角色5位置在所有角色的右邊
  megCharX = charX + 800;
  megCharY = charY;

  // --- 建立 DOM 輸入框 ---
  nameInput = createInput();
  nameInput.style('font-size', '16px');
  nameInput.style('background-color', 'rgb(255, 255, 240)'); // 象牙白背景
  nameInput.style('border', '2px solid black'); // 黑色邊框
  nameInput.style('border-radius', '10px'); // 圓角
  nameInput.style('padding', '10px'); // 內邊距，讓文字有空間
  nameInput.style('text-align', 'center'); // 文字置中
  nameInput.style('width', '180px'); // 設定寬度
  nameInput.hide();

  // --- 處理 'see' 動畫 ---
  seeFrameWidth = seeSpriteSheet.width / seeFrameCount;
  for (let i = 0; i < seeFrameCount; i++) {
    let frame = seeSpriteSheet.get(i * seeFrameWidth, 0, seeFrameWidth, seeSpriteSheet.height);
    seeAnimation.push(frame);
  }

  // --- 處理 'walk' 動畫 ---
  walkFrameWidth = walkSpriteSheet.width / walkFrameCount;
  for (let i = 0; i < walkFrameCount; i++) {
    let frame = walkSpriteSheet.get(i * walkFrameWidth, 0, walkFrameWidth, walkSpriteSheet.height);
    walkAnimation.push(frame);
  }

  // --- 處理 'shoot' 動畫 ---
  shootFrameWidth = shootSpriteSheet.width / shootFrameCount;
  for (let i = 0; i < shootFrameCount; i++) {
    let frame = shootSpriteSheet.get(i * shootFrameWidth, 0, shootFrameWidth, shootSpriteSheet.height);
    shootAnimation.push(frame);
  }

  // --- 處理 'sleep' 動畫 ---
  sleepFrameWidth = sleepSpriteSheet.width / sleepFrameCount;
  for (let i = 0; i < sleepFrameCount; i++) {
    let frame = sleepSpriteSheet.get(i * sleepFrameWidth, 0, sleepFrameWidth, sleepSpriteSheet.height);
    sleepAnimation.push(frame);
  }

  // --- 處理 'smile' 動畫 ---
  smileFrameWidth = smileSpriteSheet.width / smileFrameCount;
  for (let i = 0; i < smileFrameCount; i++) {
    let frame = smileSpriteSheet.get(i * smileFrameWidth, 0, smileFrameWidth, smileSpriteSheet.height);
    smileAnimation.push(frame);
  }

  // --- 處理 'drink' 動畫 ---
  drinkFrameWidth = drinkSpriteSheet.width / drinkFrameCount;
  for (let i = 0; i < drinkFrameCount; i++) {
    let frame = drinkSpriteSheet.get(i * drinkFrameWidth, 0, drinkFrameWidth, drinkSpriteSheet.height);
    drinkAnimation.push(frame);
  }

  // --- 處理 'stand' 動畫 ---
  standFrameWidth = standSpriteSheet.width / standFrameCount;
  for (let i = 0; i < standFrameCount; i++) {
    let frame = standSpriteSheet.get(i * standFrameWidth, 0, standFrameWidth, standSpriteSheet.height);
    standAnimation.push(frame);
  }

  // --- 處理 'smileWalk' 動畫 ---
  smileWalkFrameWidth = smileWalkSpriteSheet.width / smileWalkFrameCount;
  for (let i = 0; i < smileWalkFrameCount; i++) {
    let frame = smileWalkSpriteSheet.get(i * smileWalkFrameWidth, 0, smileWalkFrameWidth, smileWalkSpriteSheet.height);
    smileWalkAnimation.push(frame);
  }

  // --- 處理 'quagmireSee' 動畫 ---
  quagmireSeeFrameWidth = quagmireSeeSpriteSheet.width / quagmireSeeFrameCount;
  for (let i = 0; i < quagmireSeeFrameCount; i++) {
    let frame = quagmireSeeSpriteSheet.get(i * quagmireSeeFrameWidth, 0, quagmireSeeFrameWidth, quagmireSeeSpriteSheet.height);
    quagmireSeeAnimation.push(frame);
  }

  // --- 處理 'megSee' 動畫 ---
  megSeeFrameWidth = megSeeSpriteSheet.width / megSeeFrameCount;
  for (let i = 0; i < megSeeFrameCount; i++) {
    let frame = megSeeSpriteSheet.get(i * megSeeFrameWidth, 0, megSeeFrameWidth, megSeeSpriteSheet.height);
    megSeeAnimation.push(frame);
  }

  // --- 建立開始按鈕 ---
  startButton = createButton('開始遊戲');
  startButton.position(width / 2 - 75, height / 2);
  startButton.size(150, 60);
  startButton.style('font-size', '24px');
  startButton.style('font-weight', 'bold');
  startButton.style('color', '#ffffff');
  startButton.style('background-color', '#4CAF50'); // 翠綠色
  startButton.style('border', 'none');
  startButton.style('border-radius', '15px'); // 圓潤邊角
  startButton.style('box-shadow', '0px 4px 6px rgba(0,0,0,0.2)'); // 陰影
  startButton.style('cursor', 'pointer');
  startButton.mousePressed(() => {
    gameState = 'PLAY';
    startButton.hide();
    if (!bgm.isPlaying()) {
      bgm.loop();
    }
  });

  // --- 建立重新開始按鈕 ---
  restartButton = createButton('重新開始');
  restartButton.position(width / 2 - 75, height / 2 + 100);
  restartButton.size(150, 60);
  restartButton.style('font-size', '24px');
  restartButton.style('font-weight', 'bold');
  restartButton.style('color', '#ffffff');
  restartButton.style('background-color', '#2196F3'); // 亮藍色
  restartButton.style('border', 'none');
  restartButton.style('border-radius', '15px'); // 圓潤邊角
  restartButton.style('box-shadow', '0px 4px 6px rgba(0,0,0,0.2)');
  restartButton.style('cursor', 'pointer');
  restartButton.hide();
  restartButton.mousePressed(() => {
    gameState = 'START';
    correctAnswersCount = 0;
    conversationState = 'none';
    currentSpeaker = 'none';
    // 重置角色位置
    bgX = 0;
    smileCharX = charX - 100;
    standCharX = charX + 400;
    quagmireCharX = charX - 600;
    megCharX = charX + 800;
    
    restartButton.hide();
    startButton.show();
  });

  // --- 建立右上角選單系統 ---
  menuButton = createButton('選單');
  menuButton.position(width - 80, 20); // 右上角
  menuButton.size(60, 60); // 正方形
  menuButton.style('font-size', '18px');
  menuButton.style('font-weight', 'bold');
  menuButton.style('color', '#ffffff');
  menuButton.style('background-color', '#607D8B'); // 藍灰色
  menuButton.style('border', 'none');
  menuButton.style('border-radius', '15px'); // 圓潤正方形
  menuButton.style('box-shadow', '0px 4px 6px rgba(0,0,0,0.2)');
  menuButton.style('cursor', 'pointer');
  menuButton.mousePressed(toggleMenu);

  muteButton = createButton('靜音');
  muteButton.position(width - 160, 90); // 調整位置到選單下方
  muteButton.size(140, 40);
  muteButton.style('font-size', '16px');
  muteButton.style('font-weight', 'bold');
  muteButton.style('color', '#ffffff');
  muteButton.style('background-color', '#FF5722'); // 橘紅色
  muteButton.style('border', 'none');
  muteButton.style('border-radius', '12px'); // 圓潤邊角
  muteButton.style('box-shadow', '0px 4px 6px rgba(0,0,0,0.2)');
  muteButton.style('cursor', 'pointer');
  muteButton.hide();
  muteButton.mousePressed(toggleMute);

  volumeSlider = createSlider(0, 1, 0.5, 0.01);
  volumeSlider.position(width - 160, 140); // 調整位置到靜音按鈕下方
  volumeSlider.style('width', '140px');
  volumeSlider.style('cursor', 'pointer');
  volumeSlider.hide();
  volumeSlider.input(updateVolume);
  
  // 設定初始音量
  bgm.setVolume(0.5);
}

function keyPressed() {
  if (gameState !== 'PLAY') return; // 若非遊戲進行中，不處理按鍵

  // 當按下空白鍵且不在射擊狀態時，開始射擊動畫
  if (keyCode === 32 && !isShooting) {
    isShooting = true;
    shootFrame = 0; // 從第一格開始
  }

  // 當玩家在輸入框按下 Enter 鍵
  if (keyCode === ENTER && conversationState === 'asking') {
    const playerAnswer = normalizeString(nameInput.value());
    if (currentQuestionRow) {
      const correctAnswer = normalizeString(currentQuestionRow.get('答案') || '');
      if (playerAnswer === correctAnswer) {
        brianSays = currentQuestionRow.get('答對回饋') || '答對了！';
        conversationState = 'answered';
        nameInput.hide();
        // 答對後清除目前題目
        currentQuestionRow = null;

        // 增加答對題數並檢查是否通關
        correctAnswersCount++;
        if (correctAnswersCount >= 3) {
          setTimeout(() => {
            gameState = 'CLEARED';
            restartButton.show();
          }, 1500);
        }
      } else {
        // 答錯：顯示答錯回饋，但保持在 asking 狀態讓玩家繼續嘗試
        brianSays = currentQuestionRow.get('答錯回饋') || '答錯了，再試一次！';
        // 清空輸入框以便重試（但維持顯示）
        nameInput.value('');
      }
    } else {
      // 沒有題目資料，退回原本行為：把輸入當作名字
      const playerName = nameInput.value();
      brianSays = playerName + "，歡迎你！";
      conversationState = 'answered';
      nameInput.hide();
    }
  }
}

// 小工具：標準化字串，去頭尾空白並把全形數字轉成半形，方便比對
function normalizeString(s) {
  if (!s && s !== 0) return '';
  let str = String(s).trim();
  // 將常見的全形數字轉成半形
  const full = '０１２３４５６７８９';
  const half = '0123456789';
  let out = '';
  for (let ch of str) {
    const idx = full.indexOf(ch);
    out += (idx >= 0) ? half[idx] : ch;
  }
  return out;
}

function draw() {
  if (gameState === 'START') {
    // 繪製開始畫面
    image(bgImage, 0, 0);
    push();
    textAlign(CENTER, CENTER);
    textSize(50);
    stroke(255);
    strokeWeight(5);
    fill(0);
    text("歡迎來到遊戲世界", width / 2, height / 2 - 80);
    pop();
    return;
  }

  if (gameState === 'CLEARED') {
    // 繪製通關畫面
    image(bgImage, 0, 0);
    push();
    textAlign(CENTER, CENTER);
    // 讓文字有輕微的縮放動畫效果
    textSize(60 + sin(frameCount * 0.1) * 5); 
    stroke(0);
    strokeWeight(5);
    fill(255, 215, 0); // 金色字體
    text("恭喜通關！", width / 2, height / 2 - 50);
    textSize(30);
    fill(255);
    text("你已成功回答 3 個問題", width / 2, height / 2 + 50);
    pop();
    return;
  }

  // 處理背景無限捲動的邏輯
  // 當背景移動超過一張圖的寬度時，重置位置，造成無限循環的視覺效果
  if (bgX <= -bgImage.width) {
    bgX += bgImage.width;
  } else if (bgX >= bgImage.width) {
    bgX -= bgImage.width;
  }

  // --- 物理運算 (重力與跳躍) ---
  vy += gravity; // 每一幀都加上重力
  charY += vy;   // 更新角色 Y 座標
  // 地面碰撞偵測：如果角色低於地面，就停在地面上
  if (charY >= groundY) {
    charY = groundY;
    vy = 0;
  }

  // 繪製背景圖片，垂直位置固定為 0，確保背景不會隨角色跳躍而上下移動
  image(bgImage, bgX - bgImage.width, 0);
  image(bgImage, bgX, 0);
  image(bgImage, bgX + bgImage.width, 0);

  // 繪製新的微笑角色
  drawSmileCharacter();

  // 繪製站立角色
  drawStandCharacter();

  // 繪製角色4
  drawQuagmireCharacter();

  // 繪製角色5
  drawMegCharacter();

  // 當對話開始時，顯示對話框
  if (conversationState === 'asking' || conversationState === 'answered') {
    drawQuestionBox();
  }

  if (isShooting) {
    // --- 播放射擊動畫 ---
    playShootAnimation();

  } else if (isSleeping) {
    // --- 播放睡眠動畫 ---
    playSleepAnimation();

  } else {
    // --- 處理移動和閒置狀態 ---
    handleMovementAndIdle();
  }
}

function drawSmileCharacter() {
  // --- 處理角色2的移動 (按鍵 A 和 D) ---
  let isMoving = false;
  if (keyIsDown(68)) { // 'd' 鍵
    smileCharX += speed;
    smileCharFacingRight = true;
    isMoving = true;
  } else if (keyIsDown(65)) { // 'a' 鍵
    smileCharX -= speed;
    smileCharFacingRight = false;
    isMoving = true;
  }

  // 計算兩個角色之間的距離
  const d = dist(charX, charY, smileCharX, smileCharY);
  // 判斷角色2是否應該面向右邊。由於drink.png的視覺特性，我們將邏輯反轉。
  // 注意：如果是移動狀態，方向由按鍵決定；如果是靜止狀態，則面向角色1
  const shouldFaceRight = isMoving ? smileCharFacingRight : (charX < smileCharX);

  // --- 根據狀態繪製動畫 ---
  if (isMoving) {
    // 播放走路動畫
    const currentFrame = floor(frameCount / 8) % smileWalkAnimation.length;
    const currentImg = smileWalkAnimation[currentFrame];
    
    if (shouldFaceRight) {
      // 面向右邊 (原圖若是面向右，直接繪製)
      image(currentImg, smileCharX - smileWalkFrameWidth / 2, smileCharY - smileWalkSpriteSheet.height / 2);
    } else {
      // 面向左邊 (原圖若是面向右，需翻轉)
      push();
      translate(smileCharX + smileWalkFrameWidth / 2, smileCharY - smileWalkSpriteSheet.height / 2);
      scale(-1, 1);
      image(currentImg, 0, 0);
      pop();
    }
  } else {
    // --- 播放原本的待機/轉向動畫 ---
    const currentFrame = floor(frameCount / 8) % smileAnimation.length;
    if (shouldFaceRight) {
      // 面向右邊
      push();
      translate(smileCharX + smileFrameWidth / 2, smileCharY - smileSpriteSheet.height / 2);
      scale(-1, 1);
      image(smileAnimation[currentFrame], 0, 0);
      pop();
    } else {
      // 面向左邊
      image(smileAnimation[currentFrame], smileCharX - smileFrameWidth / 2, smileCharY - smileSpriteSheet.height / 2);
    }
  }

  // --- 提示功能：當處於問答狀態且靠近角色2時，顯示提示 ---
  if (conversationState === 'asking' && currentQuestionRow && d < proximityThreshold) {
    const hintText = currentQuestionRow.get('提示');
    if (hintText) {
      drawHintBox(hintText);
    }
  }
}

function drawStandCharacter() {
  // 計算角色1與角色3之間的距離
  const d = dist(charX, charY, standCharX, standCharY);

  // 根據距離管理對話狀態 (原本在 smileChar 的邏輯移至此處)
  if (d < proximityThreshold && conversationState === 'none' && currentSpeaker === 'none') {
    // 只有在還沒回答過任何問題時 (第1關) 才觸發
    if (correctAnswersCount === 0) {
      // 開始對話
      conversationState = 'asking';
      currentSpeaker = 'stand'; // 設定發話者為 stand
      // 從 CSV 隨機選一題，若載入失敗就回退到預設文字
      if (questionsTable && questionsTable.getRowCount() > 0) {
        // 角色3 使用前 1/3 題目
        const r = floor(random(0, floor(questionsTable.getRowCount() / 3)));
        currentQuestionRow = questionsTable.getRow(r);
        brianSays = currentQuestionRow.get('題目') || "請問你叫甚麼名字";
      } else {
        brianSays = "請問你叫甚麼名字";
      }
      nameInput.value(''); // 清空輸入框以便重新輸入
      nameInput.attribute('placeholder', '在此輸入答案');
      nameInput.show();
    }
  } else if (d >= proximityThreshold && conversationState !== 'none' && currentSpeaker === 'stand') {
    // 結束對話
    conversationState = 'none';
    currentSpeaker = 'none';
    nameInput.hide();
  }

  // 當處於對話狀態時，更新輸入框位置
  if ((conversationState === 'asking' || conversationState === 'answered') && nameInput) {
    const inputX = charX - 90;
    const inputY = charY + 40;
    nameInput.position(inputX, inputY);
  }

  // 簡單循環播放 stand 動畫
  let currentFrame = floor(frameCount / 8) % standAnimation.length;
  image(standAnimation[currentFrame], standCharX - standFrameWidth / 2, standCharY - standSpriteSheet.height / 2);
}

function drawQuagmireCharacter() {
  // 計算角色1與角色4之間的距離
  const d = dist(charX, charY, quagmireCharX, quagmireCharY);

  // 角色4 的對話邏輯
  if (d < proximityThreshold && conversationState === 'none' && currentSpeaker === 'none') {
    // 只有在回答過1個問題後 (第2關) 才觸發
    if (correctAnswersCount === 1) {
      conversationState = 'asking';
      currentSpeaker = 'quagmire'; // 設定發話者為 quagmire
      
      if (questionsTable && questionsTable.getRowCount() > 0) {
        // 角色4 使用中間 1/3 題目
        const oneThird = floor(questionsTable.getRowCount() / 3);
        const twoThirds = floor(questionsTable.getRowCount() * 2 / 3);
        const r = floor(random(oneThird, twoThirds));
        currentQuestionRow = questionsTable.getRow(r);
        brianSays = currentQuestionRow.get('題目') || "Giggity!";
      } else {
        brianSays = "Giggity!";
      }
      nameInput.value('');
      nameInput.attribute('placeholder', '在此輸入答案');
      nameInput.show();
    }
  } else if (d >= proximityThreshold && conversationState !== 'none' && currentSpeaker === 'quagmire') {
    conversationState = 'none';
    currentSpeaker = 'none';
    nameInput.hide();
  }

  // 簡單循環播放 see 動畫
  let currentFrame = floor(frameCount / 8) % quagmireSeeAnimation.length;
  image(quagmireSeeAnimation[currentFrame], quagmireCharX - quagmireSeeFrameWidth / 2, quagmireCharY - quagmireSeeSpriteSheet.height / 2);
}

function drawMegCharacter() {
  // 計算角色1與角色5之間的距離
  const d = dist(charX, charY, megCharX, megCharY);

  // 角色5 的對話邏輯
  if (d < proximityThreshold && conversationState === 'none' && currentSpeaker === 'none') {
    // 只有在回答過2個問題後 (第3關) 才觸發
    if (correctAnswersCount === 2) {
      conversationState = 'asking';
      currentSpeaker = 'meg'; // 設定發話者為 meg
      
      if (questionsTable && questionsTable.getRowCount() > 0) {
        // 角色5 使用後 1/3 題目
        const twoThirds = floor(questionsTable.getRowCount() * 2 / 3);
        const r = floor(random(twoThirds, questionsTable.getRowCount()));
        currentQuestionRow = questionsTable.getRow(r);
        brianSays = currentQuestionRow.get('題目') || "請問你叫甚麼名字";
      } else {
        brianSays = "請問你叫甚麼名字";
      }
      nameInput.value('');
      nameInput.attribute('placeholder', '在此輸入答案');
      nameInput.show();
    }
  } else if (d >= proximityThreshold && conversationState !== 'none' && currentSpeaker === 'meg') {
    conversationState = 'none';
    currentSpeaker = 'none';
    nameInput.hide();
  }

  // 簡單循環播放 see 動畫
  let currentFrame = floor(frameCount / 8) % megSeeAnimation.length;
  image(megSeeAnimation[currentFrame], megCharX - megSeeFrameWidth / 2, megCharY - megSeeSpriteSheet.height / 2);
}

function drawQuestionBox() {
  push(); // 儲存當前的繪圖設定

  // 設定對話框最大寬度與文字樣式
  const boxWidth = 260;
  const padding = 12;
  textSize(16);
  textAlign(LEFT, TOP);

  // 將要顯示的文字分行，取得行陣列
  const lines = wrapTextInBox(brianSays, boxWidth - padding * 2);
  const lineHeight = textAscent() + textDescent() + 6;
  const boxHeight = lines.length * lineHeight + padding * 2;

  // 根據目前的發話者決定對話框位置
  let targetX = standCharX;
  let targetY = standCharY;
  
  if (currentSpeaker === 'quagmire') {
    targetX = quagmireCharX;
    targetY = quagmireCharY;
  } else if (currentSpeaker === 'meg') {
    targetX = megCharX;
    targetY = megCharY;
  }

  const boxX = targetX - boxWidth / 2;
  const boxY = targetY - standSpriteSheet.height / 2 - boxHeight - 10; // 在角色頭頂上方10像素

  // 繪製對話框背景
  fill(255, 255, 240); // 象牙白色背景
  stroke(0); // 黑色邊框
  strokeWeight(2);
  rect(boxX, boxY, boxWidth, boxHeight, 10); // 圓角矩形

  // 繪製文字（逐行）
  noStroke();
  fill(0); // 黑色文字
  for (let i = 0; i < lines.length; i++) {
    text(lines[i], boxX + padding, boxY + padding + i * lineHeight);
  }

  // 將輸入框放在對話框下方中央
  // 不在這裡定位輸入框，輸入框應該固定顯示在角色1 的下方（由 drawSmileCharacter 控制）

  pop(); // 恢復之前的繪圖設定
}

function drawHintBox(content) {
  push();

  const boxWidth = 200;
  const padding = 10;
  textSize(14);
  textAlign(LEFT, TOP);

  const lines = wrapTextInBox("提示：" + content, boxWidth - padding * 2);
  const lineHeight = textAscent() + textDescent() + 4;
  const boxHeight = lines.length * lineHeight + padding * 2;

  const boxX = smileCharX - boxWidth / 2;
  const boxY = smileCharY - smileSpriteSheet.height / 2 - boxHeight - 10;

  // 繪製提示框背景 (淡黃色)
  fill(255, 255, 200);
  stroke(0);
  strokeWeight(2);
  rect(boxX, boxY, boxWidth, boxHeight, 10);

  noStroke();
  fill(0);
  for (let i = 0; i < lines.length; i++) {
    text(lines[i], boxX + padding, boxY + padding + i * lineHeight);
  }

  pop();
}

// 將長文字切成多行，根據目前文字大小與可用寬度回傳行陣列
function wrapTextInBox(str, maxWidth) {
  if (!str) return [''];
  const words = str.split(/\s+/);
  let lines = [];
  let current = '';
  for (let w of words) {
    const test = current ? current + ' ' + w : w;
    if (textWidth(test) <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      // 若單一字長超過寬度，直接切字
      if (textWidth(w) > maxWidth) {
        let part = '';
        for (let ch of w) {
          if (textWidth(part + ch) <= maxWidth) part += ch;
          else {
            lines.push(part);
            part = ch;
          }
        }
        if (part) current = part; else current = '';
      } else {
        current = w;
      }
    }
  }
  if (current) lines.push(current);
  return lines;
}

function handleMovementAndIdle() {
    // 檢查跳躍 (獨立判斷，允許在移動時跳躍)
    if (keyIsDown(UP_ARROW) && charY >= groundY) {
      vy = jumpStrength;
    }

    // 檢查方向鍵
    if (keyIsDown(RIGHT_ARROW)) {
    // 按下右鍵：向右移動
    bgX -= speed;
    smileCharX -= speed;
    standCharX -= speed;
    quagmireCharX -= speed;
    megCharX -= speed;
    facingRight = true;
    let currentFrame = floor(frameCount / 8) % walkAnimation.length;
    image(walkAnimation[currentFrame], charX - walkFrameWidth / 2, charY - walkSpriteSheet.height / 2);

  } else if (keyIsDown(LEFT_ARROW)) {
    // 按下左鍵：向左移動並翻轉圖片
    bgX += speed;
    smileCharX += speed;
    standCharX += speed;
    quagmireCharX += speed;
    megCharX += speed;
    facingRight = false;
    let currentFrame = floor(frameCount / 8) % walkAnimation.length;
    
    push(); // 儲存目前的繪圖設定
    translate(charX + walkFrameWidth / 2, charY - walkSpriteSheet.height / 2); // 將原點移動到圖片的右上角
    scale(-1, 1); // 水平翻轉座標系
    image(walkAnimation[currentFrame], 0, 0); // 在新的原點繪製圖片
    pop(); // 恢復原本的繪圖設定

  } else if (keyIsDown(DOWN_ARROW)) {
    // 按下下鍵：開始睡眠動畫
    isSleeping = true;
    sleepPlayFrame = 0; // 重置播放計數

  } else {
    // 沒有按鍵：播放觀望動畫，並保持最後的方向
    let currentFrame = floor(frameCount / 8) % seeAnimation.length;
    if (facingRight) {
      image(seeAnimation[currentFrame], charX - seeFrameWidth / 2, charY - seeSpriteSheet.height / 2);
    } else {
      push();
      translate(charX + seeFrameWidth / 2, charY - seeSpriteSheet.height / 2);
      scale(-1, 1);
      image(seeAnimation[currentFrame], 0, 0);
      pop();
    }
  }
}

function playShootAnimation() {
  // 根據 shootFrame 決定要顯示哪一格
  let currentFrameIndex = floor(shootFrame);
  let currentImg = shootAnimation[currentFrameIndex];

  // 讓角色在播放動畫時輕微上下移動
  let yOffset = 0;
  if (currentFrameIndex < 2) yOffset = -5; // 向上
  else if (currentFrameIndex > 2) yOffset = 5; // 向下

  // 根據角色面向的方向來繪製
  if (facingRight) {
    image(currentImg, charX - shootFrameWidth / 2, charY - shootSpriteSheet.height / 2 + yOffset);
  } else {
    push();
    translate(charX + shootFrameWidth / 2, charY - shootSpriteSheet.height / 2 + yOffset);
    scale(-1, 1);
    image(currentImg, 0, 0);
    pop();
  }

  // 更新射擊動畫的畫格
  shootFrame += 1 / shootAnimationSpeed;

  // 如果動畫播放完畢，則結束射擊狀態
  if (shootFrame >= shootFrameCount) {
    isShooting = false;
  }
}

function playSleepAnimation() {
  // 根據已播放的畫格數來決定要顯示 sleepAnimation 中的哪一格 (循環播放)
  let currentFrameIndex = floor(sleepPlayFrame);
  let currentImg = sleepAnimation[currentFrameIndex];

  // 讓角色在播放動畫時輕微上下移動
  let yOffset = sin(frameCount * 0.2) * 5;

  // 根據角色面向的方向來繪製
  if (facingRight) {
    image(currentImg, charX - sleepFrameWidth / 2, charY - sleepSpriteSheet.height / 2 + yOffset);
  } else {
    push();
    translate(charX + sleepFrameWidth / 2, charY - sleepSpriteSheet.height / 2 + yOffset);
    scale(-1, 1);
    image(currentImg, 0, 0);
    pop();
  }

  // 更新已播放的畫格數，調整數值以控制動畫速度
  sleepPlayFrame += 0.2;

  // 如果動畫播放完畢 (達到12個畫格)，則結束睡眠狀態
  // 當沒有按下向上鍵時，恢復顯示SeeSheet -> 這裡的邏輯是播放完12個畫格後就恢復
  if (sleepPlayFrame >= 12) {
    isSleeping = false;
  }
}

function toggleMenu() {
  isMenuOpen = !isMenuOpen;
  if (isMenuOpen) {
    muteButton.show();
    volumeSlider.show();
  } else {
    muteButton.hide();
    volumeSlider.hide();
  }
}

function toggleMute() {
  isMuted = !isMuted;
  if (isMuted) {
    bgm.setVolume(0);
    muteButton.html('取消靜音');
  } else {
    bgm.setVolume(volumeSlider.value());
    muteButton.html('靜音');
  }
}

function updateVolume() {
  if (!isMuted) {
    bgm.setVolume(volumeSlider.value());
  }
}
