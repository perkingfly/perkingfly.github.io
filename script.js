// ---------------------- 全局配置（新手可修改这里的参数） ----------------------
const CONFIG = {
    // 游戏1：爱心收集目标数量（恢复为99，符合HTML文案）
    heartTarget: 99,
    // 游戏3：通关所需好感度（新增：好感度达标值）
    affectionTarget: 50,
    // 游戏4：消消乐通关分数
    matchTarget: 520,
    // 惊喜2：相册图片数量（你放入album文件夹的照片数）
    albumCount: 2,
    // 本地存储键名（无需修改）
    storageKey: "Love_1st_Anniversary_Status"
};

// ---------------------- 第一步：初始化本地存储（首次打开网页时创建） ----------------------
function initStorage() {
    const defaultStatus = {
        isIntroDone: false, // 开场亲嘴是否完成
        gamePassed: [false, false, false, false], // 4个游戏是否通关（按顺序）
        surpriseUnlocked: [false, false, false, false] // 4个惊喜是否解锁（按顺序）
    };

    // 如果本地存储中没有数据，存入默认数据
    if (!localStorage.getItem(CONFIG.storageKey)) {
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(defaultStatus));
    }
}

// 获取当前存储状态
function getStorageStatus() {
    return JSON.parse(localStorage.getItem(CONFIG.storageKey));
}

// 更新本地存储状态
function updateStorageStatus(newStatus) {
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(newStatus));
}

// ---------------------- 第二步：页面元素初始化（获取所有需要操作的元素） ----------------------
let bgm, bgmSwitch, resetBtn;
let introPage, mainPage, gamePage, surprisePage, transitionPage;
let boy, progressFill, girl;
let gameBtns;
let currentAlbumIndex = 1; // 相册当前索引

function initElements() {
    // 背景音相关
    bgm = document.getElementById("bgm");
    bgmSwitch = document.getElementById("bgmSwitch");
    
    // 开发者重置按钮
    resetBtn = document.getElementById("resetBtn");

    // 页面相关
    introPage = document.getElementById("introPage");
    mainPage = document.getElementById("mainPage");
    gamePage = document.getElementById("gamePage");
    surprisePage = document.getElementById("surprisePage");
    transitionPage = document.getElementById("transitionPage");

    // 开场亲嘴相关
    boy = document.getElementById("boy");
    progressFill = document.getElementById("progressFill");
    girl = document.querySelector(".girl");

    // 主页面按钮相关（仅保留游戏按钮，移除惊喜按钮）
    gameBtns = [
        document.getElementById("game1Btn"),
        document.getElementById("game2Btn"),
        document.getElementById("game3Btn"),
        document.getElementById("game4Btn")
    ];

    // 初始化惊喜1的日记链接（新手快捷方式：直接替换下面的 "" 中的内容）
    document.getElementById("diaryLink").href = "https://hcn5v9f62k5f.feishu.cn/docx/O0ahdAz3VoSvNMxsQ0WcJ34anEe";

    // 绑定所有按钮事件
    bindEvents();
}

// ---------------------- 第三步：绑定所有事件（点击/拖动/滑动等，修复亲嘴bug） ----------------------
function bindEvents() {
    // 背景音开关事件
    bgmSwitch.addEventListener("click", toggleBgm);
    // 重置按钮点击事件
    resetBtn.addEventListener("click", () => {
        if (confirm("确定要重置所有进度吗？（测试用）")) {
            localStorage.removeItem(CONFIG.storageKey);
            initStorage();
            window.location.reload();
        }
    });

    // 开场亲嘴：鼠标拖动（电脑端，修复尺寸获取bug）
    let isDragging = false;
    let startX = 0;
    let boyLeft = 0;

    // 鼠标按下开始拖动（每次拖动都获取最新元素尺寸，避免图片加载误差）
    boy.addEventListener("mousedown", (e) => {
        e.preventDefault(); // 阻止默认行为，避免奇怪bug
        isDragging = true;
        startX = e.clientX;
        boyLeft = boy.offsetLeft;
        boy.style.transition = "none"; // 拖动时关闭过渡动画
        
        // 实时获取最新元素尺寸
        const containerWidth = document.querySelector(".intro-container").offsetWidth;
        const girlLeft = girl.offsetLeft;
        const boyWidth = boy.offsetWidth;
    });

    // 鼠标移动时拖动（优化边界限制）
    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        
        // 实时获取最新元素尺寸，确保边界准确
        const girlLeft = girl.offsetLeft;
        const boyWidth = boy.offsetWidth;
        const maxLeft = girlLeft - boyWidth; // 最大左偏移：刚好碰到女生，不超出
        
        const moveX = e.clientX - startX;
        const newLeft = boyLeft + moveX;

        // 严格限制拖动范围：0 ~ maxLeft，避免超出
        const finalLeft = Math.max(0, Math.min(newLeft, maxLeft));

        // 更新男生位置和进度条
        boy.style.left = `${finalLeft}px`;
        const progress = maxLeft > 0 ? (finalLeft / maxLeft) * 100 : 0; // 避免除以0
        progressFill.style.width = `${progress}%`;

        // 到达女生位置（亲嘴成功，放宽10px容错）
        if (finalLeft >= maxLeft - 10) {
            completeIntro();
        }
    });

    // 鼠标松开结束拖动
    document.addEventListener("mouseup", () => {
        isDragging = false;
        boy.style.transition = "left 0.3s ease"; // 松开后恢复过渡动画
    });

    // 开场亲嘴：触摸滑动（手机端，修复滑动bug，阻止页面滚动）
    boy.addEventListener("touchstart", (e) => {
        e.preventDefault(); // 阻止默认页面滚动，避免滑动bug
        startX = e.touches[0].clientX;
        boyLeft = boy.offsetLeft;
        boy.style.transition = "none";
    });

    boy.addEventListener("touchmove", (e) => {
        e.preventDefault(); // 阻止默认页面滚动，避免滑动bug
        
        // 实时获取最新元素尺寸
        const girlLeft = girl.offsetLeft;
        const boyWidth = boy.offsetWidth;
        const maxLeft = girlLeft - boyWidth;

        const moveX = e.touches[0].clientX - startX;
        const newLeft = boyLeft + moveX;
        const finalLeft = Math.max(0, Math.min(newLeft, maxLeft));

        boy.style.left = `${finalLeft}px`;
        const progress = maxLeft > 0 ? (finalLeft / maxLeft) * 100 : 0;
        progressFill.style.width = `${progress}%`;

        if (finalLeft >= maxLeft - 10) {
            completeIntro();
        }
    });

    // 主页面：游戏按钮点击事件
    gameBtns.forEach((btn, index) => {
        btn.addEventListener("click", () => {
            const status = getStorageStatus();
            if (!btn.classList.contains("locked")) {
                enterGame(index + 1);
            }
        });
    });

    // 游戏退出按钮事件
    document.getElementById("game1Quit").addEventListener("click", () => {
        backToMain();
    });
    document.getElementById("game2Quit").addEventListener("click", () => {
        backToMain();
    });
    document.getElementById("game3Quit").addEventListener("click", () => {
        backToMain();
    });
    document.getElementById("game4Quit").addEventListener("click", () => {
        backToMain();
    });

    // 惊喜返回按钮事件（返回主页面，解锁下一个游戏）
    document.getElementById("surprise1Back").addEventListener("click", () => {
        backToMain();
    });
    document.getElementById("surprise2Back").addEventListener("click", () => {
        backToMain();
    });
    document.getElementById("surprise3Back").addEventListener("click", () => {
        backToMain();
    });
    document.getElementById("surprise4Back").addEventListener("click", () => {
        backToMain();
    });

    // 解决浏览器自动播放限制：点击任意位置播放背景音
    document.addEventListener("click", () => {
        if (bgm.paused && !bgm.played.length) {
            bgm.play();
            bgmSwitch.textContent = "🎵 背景音：开启";
        }
    }, { once: true });
}

// ---------------------- 第四步：核心功能实现（修改通关跳转惊喜逻辑） ----------------------
// 切换背景音播放/暂停
function toggleBgm() {
    if (bgm.paused) {
        bgm.play();
        bgmSwitch.textContent = "🎵 背景音：开启";
    } else {
        bgm.pause();
        bgmSwitch.textContent = "🎵 背景音：关闭";
    }
}

// 完成开场亲嘴（进入主页面）
function completeIntro() {
    const status = getStorageStatus();
    status.isIntroDone = true;
    updateStorageStatus(status);

    // 播放亲嘴成功动画
    boy.style.transition = "all 0.5s ease";
    boy.style.transform = "translateY(-50%) scale(1.1)";
    setTimeout(() => {
        introPage.classList.remove("active");
        mainPage.classList.add("active");
        updateMainPage(); // 更新主页面按钮锁定状态
    }, 1000);
}

// 更新主页面按钮锁定状态（根据通关情况）
function updateMainPage() {
    const status = getStorageStatus();

    // 更新游戏按钮
    gameBtns.forEach((btn, index) => {
        // 游戏1：初始解锁（开场完成后）
        if (index === 0) {
            btn.classList.toggle("locked", !status.isIntroDone);
        }
        // 其他游戏：前一个游戏通关则解锁
        else if (index > 0) {
            btn.classList.toggle("locked", !status.gamePassed[index - 1]);
        }
    });
}

// 进入游戏页面（参数：游戏编号 1-4）
function enterGame(gameNum) {
    mainPage.classList.remove("active");
    gamePage.classList.add("active");

    // 隐藏所有游戏内容，显示对应游戏
    document.querySelectorAll(".game-content").forEach(content => {
        content.classList.add("hidden");
    });
    document.getElementById(`game${gameNum}`).classList.remove("hidden");

    // 初始化对应游戏
    switch (gameNum) {
        case 1:
            initGame1();
            break;
        case 2:
            initGame2();
            break;
        case 3:
            initGame3();
            break;
        case 4:
            initGame4();
            break;
    }
}

// 进入惊喜页面（参数：惊喜编号 1-4，带防剧透）
function enterSurprise(surpriseNum) {
    const status = getStorageStatus();

    // 防剧透：未解锁则跳回主页面
    if (!status.surpriseUnlocked[surpriseNum - 1]) {
        backToMain();
        return;
    }

    surprisePage.classList.add("active");
    // 隐藏所有惊喜内容，显示对应惊喜
    document.querySelectorAll(".surprise-content").forEach(content => {
        content.classList.add("hidden");
    });
    document.getElementById(`surprise${surpriseNum}`).classList.remove("hidden");
}

// 返回主页面
function backToMain() {
    gamePage.classList.remove("active");
    surprisePage.classList.remove("active");
    transitionPage.classList.remove("active");
    mainPage.classList.add("active");
    updateMainPage();
}

// 通关过场动画（修改：播放后直接跳转对应惊喜页面，而非返回主页面）
function showTransition(gameNum) {
    gamePage.classList.remove("active");
    transitionPage.classList.add("active");

    // 2秒后（动画结束）更新存储状态，跳转惊喜页面
    setTimeout(() => {
        const status = getStorageStatus();
        // 标记当前游戏已通关
        status.gamePassed[gameNum - 1] = true;
        // 解锁对应惊喜
        status.surpriseUnlocked[gameNum - 1] = true;
        // 更新存储
        updateStorageStatus(status);

        // 隐藏过场动画，进入对应惊喜页面（核心修改：不再返回主页面）
        transitionPage.classList.remove("active");
        enterSurprise(gameNum);
    }, 1000);
}

// ---------------------- 第五步：各游戏实现（优化爱心收集，提升点击灵敏性） ----------------------
// 游戏1：爱心收集（优化点击响应，放大爱心，提升体验）
function initGame1() {
    const heartContainer = document.getElementById("heartContainer");
    const currentHeartsEl = document.getElementById("currentHearts");
    let currentHearts = 0;

    // 重置数据
    currentHearts = 0;
    currentHeartsEl.textContent = "0";
    heartContainer.innerHTML = "";

    // 生成爱心（定时生成，随机位置/速度，优化点击响应）
    const generateHeart = () => {
        if (currentHearts >= CONFIG.heartTarget) return;

        const heart = document.createElement("div");
        heart.classList.add("heart");

        // 随机位置（水平，预留爱心宽度，避免超出容器）
        const containerWidth = heartContainer.offsetWidth;
        const heartWidth = heart.offsetWidth || 50; // 兜底爱心宽度
        const randomX = Math.random() * (containerWidth - heartWidth);
        heart.style.left = `${randomX}px`;
        heart.style.top = "-50px"; // 对应爱心高度，避免初始显示不全

        // 优化下落速度：降低随机性，提升点击机会（1~2 → 0.8~1.5）
        const randomSpeed = Math.random() * 0.7 + 0.8;

        // 爱心下落动画
        const fallHeart = () => {
            if (!heart.parentNode) return; // 爱心已被收集，停止动画
            let top = parseFloat(heart.style.top);
            if (top > heartContainer.offsetHeight) {
                heart.remove();
                return;
            }
            heart.style.top = `${top + randomSpeed}px`;
            requestAnimationFrame(fallHeart);
        };

        // 点击爱心收集（优化：阻止事件冒泡，提升响应速度）
        heart.addEventListener("click", (e) => {
            e.stopPropagation(); // 阻止事件冒泡，避免触发容器其他事件
            heart.remove(); // 立即移除，提升反馈感
            currentHearts++;
            currentHeartsEl.textContent = currentHearts;

            // 通关判断（立即响应，不等待动画）
            if (currentHearts >= CONFIG.heartTarget) {
                showTransition(1);
            }
        }, { passive: true }); // 被动监听，提升手机端性能

        // 添加到容器并开始下落
        heartContainer.appendChild(heart);
        fallHeart();
    };

    // 每隔300ms生成一个爱心（保持频率，保证通关效率）
    const heartInterval = setInterval(() => {
        if (currentHearts >= CONFIG.heartTarget) {
            clearInterval(heartInterval);
            return;
        }
        generateHeart();
    }, 300);
}

// 游戏2：情侣拼图（9宫格）【100%兼容所有图片，彻底解决空白问题】
function initGame2() {
    const puzzleContainer = document.getElementById("puzzleContainer");
    const puzzleSrc = "assets/game/puzzle_origin.png"; // 你的图片路径
    const puzzlePieces = [];
    let correctPieces = 0;

    // 1. 重置容器（清空所有旧内容）
    puzzleContainer.innerHTML = "";
    puzzleContainer.style.height = "auto"; // 重置高度

    // 2. 先加载原图，获取真实尺寸
    const img = new Image();
    img.src = puzzleSrc + "?t=" + new Date().getTime(); // 禁用缓存，确保加载最新图片
    img.onload = function() {
        // 2.1 计算原图宽高比，设置容器高度（适配图片比例）
        const imgRatio = img.width / img.height;
        puzzleContainer.style.height = `${puzzleContainer.offsetWidth / imgRatio}px`;

        // 2.2 创建拼图网格容器（承载9个碎片）
        const puzzleGrid = document.createElement("div");
        puzzleGrid.classList.add("puzzle-grid");
        puzzleContainer.appendChild(puzzleGrid);

        // 3. 生成9个碎片（遮罩层），每个碎片对应原图的一个区域
        for (let i = 0; i < 9; i++) {
            // 3.1 创建碎片元素
            const piece = document.createElement("div");
            piece.classList.add("puzzle-piece");
            piece.dataset.index = i;
            piece.dataset.correctPos = i; // 记录碎片的正确位置索引

            // 3.2 计算碎片对应的原图区域（行/列）
            const row = Math.floor(i / 3); // 0,0,0,1,1,1,2,2,2
            const col = i % 3; // 0,1,2,0,1,2,0,1,2

            // 3.3 创建碎片内的图片（显示原图的对应区域，无复杂计算）
            const pieceImg = document.createElement("img");
            pieceImg.classList.add("puzzle-piece-img");
            pieceImg.src = puzzleSrc;
            // 关键：偏移图片位置，让碎片只显示对应区域（简单直接，无比例错误）
            pieceImg.style.transform = `translate(${-col * 100 / 3}%, ${-row * 100 / 3}%)`;

            // 3.4 组装碎片
            piece.appendChild(pieceImg);
            puzzlePieces.push({
                element: piece,
                correctPos: i // 记录正确位置，用于后续验证
            });
            puzzleGrid.appendChild(piece);
        }

        // 4. 打乱碎片顺序（只打乱DOM位置，不改变碎片内的图片区域）
        const shuffledPieces = shuffleArray(puzzlePieces);
        puzzleGrid.innerHTML = ""; // 清空原有碎片
        shuffledPieces.forEach((puzzleObj, index) => {
            puzzleObj.element.dataset.currentPos = index; // 记录当前位置
            puzzleGrid.appendChild(puzzleObj.element);
        });

        // 5. 点击交换碎片功能（直观易懂，无BUG）
        let selectedPiece = null;
        puzzlePieces.forEach(puzzleObj => {
            const piece = puzzleObj.element;
            piece.addEventListener("click", () => {
                if (!selectedPiece) {
                    // 第一次点击：选中碎片，高亮提示
                    selectedPiece = puzzleObj;
                    piece.style.opacity = 0.7;
                    piece.style.border = "3px solid #ff4757"; // 红色边框高亮，方便识别
                } else {
                    // 第二次点击：交换两个碎片的位置
                    const piece1 = selectedPiece.element;
                    const piece2 = puzzleObj.element;
                    const parent = puzzleGrid;

                    // 保存两个碎片的当前位置
                    const tempPos1 = piece1.dataset.currentPos;
                    const tempPos2 = piece2.dataset.currentPos;

                    // 交换DOM位置（简单粗暴，不会出错）
                    const tempDiv = document.createElement("div");
                    parent.insertBefore(tempDiv, piece1);
                    parent.insertBefore(piece1, piece2);
                    parent.insertBefore(piece2, tempDiv);
                    tempDiv.remove();

                    // 更新两个碎片的当前位置
                    piece1.dataset.currentPos = tempPos2;
                    piece2.dataset.currentPos = tempPos1;

                    // 重置选中状态
                    piece1.style.opacity = 1;
                    piece1.style.border = "1px solid rgba(255, 107, 139, 0.3)";
                    selectedPiece = null;

                    // 6. 检查是否拼对（实时验证）
                    checkPuzzleCorrect();
                }
            });
        });

        // 6. 检查拼图是否全部正确
        function checkPuzzleCorrect() {
            correctPieces = 0;
            puzzlePieces.forEach(puzzleObj => {
                const piece = puzzleObj.element;
                const currentPos = parseInt(piece.dataset.currentPos);
                const correctPos = puzzleObj.correctPos;

                // 碎片当前位置 = 正确位置 → 拼对了
                if (currentPos === correctPos) {
                    correctPieces++;
                    piece.style.border = "2px solid #ff6b8b"; // 粉色边框提示正确
                } else {
                    piece.style.border = "1px solid rgba(255, 107, 139, 0.3)"; // 默认边框
                }
            });

            // 9个碎片全部拼对 → 通关
            if (correctPieces === 9) {
                setTimeout(() => {
                    alert("拼图完美完成！🎉");
                    showTransition(2);
                }, 1000);
            }
        }
    };

    // 图片加载失败：明确提示，方便排查
    img.onerror = function() {
        alert(`❌ 拼图图片加载失败！
请检查：
1. 图片路径是否正确：${puzzleSrc}
2. 图片是否存在/未损坏
3. 文件夹层级是否正确（如 assets/game/ 文件夹是否存在）`);
    };
}

// 游戏3：请重新攻略我（恋爱视觉小说）【核心修改：好感度+支线+唯一结局】
function initGame3() {
    const novelAvatar = document.getElementById("novelAvatar");
    const novelDialogue = document.getElementById("novelDialogue");
    const novelOptions = document.getElementById("novelOptions");
    const affectionEl = document.getElementById("correctAnswers"); // 复用DOM，显示好感度
    let currentNodeId = "start"; // 当前剧情节点ID
    let currentAffection = 0; // 当前好感度
    const targetAffection = CONFIG.affectionTarget; // 通关所需好感度

    // 【新手核心修改区：剧情节点配置（支持支线、好感度增减、唯一结局）】
    const storyNodes = [
        // 初始节点
        {
            id: "start",
            avatar: "assets/characters/boy_avatar.png",
            dialogue: "嗨～国潮团队缺一人，下把能不能和我一起送外卖？",
            options: [
                { text: "嗯~行，来一把", affectionChange: +5, nextNodeId: "node1" },
                { text: "你的搭讪就这水平？滚", affectionChange: -5, nextNodeId: "node2" },
                { text: "吃你的国潮去，有病去治", affectionChange: -15, nextNodeId: "node2" },
                { text: "请问我在团队担当什么职位呀，欧尼酱", affectionChange: +15, nextNodeId: "node1" }
            ]
        },
        // 支线1：加入车队
        {
            id: "node1",
            avatar: "assets/characters/boy_avatar.png",
            dialogue: "刚进车队第一把怎么玩好呢？",
            options: [
                { text: "玩瑶跟着射手", affectionChange: -10, nextNodeId: "node12" },
                { text: "玩贝利亚，偶尔凑巧给司空震刷大", affectionChange: +20, nextNodeId: "node11" },
                { text: "玩蔡文姬看到谁上就追着奶", affectionChange: +25, nextNodeId: "node11" },
                { text: "玩小乔在中路逛街", affectionChange: +1, nextNodeId: "node12" }
            ]
        },
        // 支线2：没加入车队
        {
            id: "node2",
            avatar: "assets/characters/boy_avatar.png",
            dialogue: "第二把又排到国潮了，被国潮暴打一顿，不服气的你又被邀请进队伍，你发送了",
            options: [
                { text: "不是，你们吃国潮的这么厉害吗？", affectionChange: +1, nextNodeId: "node21" },
                { text: "靠，你们故意的吧，把我小乔抓到0/18了！", affectionChange: -1, nextNodeId: "node21" },
                { text: "我错了，我加入国潮团队！", affectionChange: +2, nextNodeId: "node1" },
                { text: "你们这群出生，FK#**#*#***", affectionChange: -10, nextNodeId: "node21" }
            ]
        },
        //支线21：骂完走了
        {
            id: "node21",
            avatar: "assets/characters/boy_avatar.png",
            dialogue: "你退了房间，但心中莫名空落，又连忙求邀请让国潮拉你进房间",
            options: [
                { text: "那个...我还可以加入国潮团队吗？", affectionChange: +2, nextNodeId: "node1" },
                { text: "把我的分吐回来！带我上回来", affectionChange: +1, nextNodeId: "node1" },
                { text: "一群cs！！！", affectionChange: -10, nextNodeId: "node114514" }
            ]
        },
        //支线21：骂完走了
        {
            id: "node114514",
            avatar: "assets/characters/boy_avatar.png",
            dialogue: "你失败了",
            options: [
                { text: "不是姐们你真敢选啊？滚回去重玩", affectionChange: +15, nextNodeId: "start" }
            ]
        },
        //支线11：跟了我，我喜欢上她了
        {
            id: "node11",
            avatar: "assets/characters/boy_avatar.png",
            dialogue: "开了一把赢了，有两个国潮加你好友，是否同意",
            options: [
                { text: "随便同意一个吧，另一个没注意到没加", affectionChange: -10, nextNodeId: "node113" },
                { text: "来者不拒全加了，真有趣", affectionChange: +10, nextNodeId: "node111" },
                { text: "只加了玩司空震的那个", affectionChange: +20, nextNodeId: "node112" },
                { text: "都不加，只是陌生人而已", affectionChange: -20, nextNodeId: "node114514" }
            ]
        },
        //支线12：没跟我，再玩一把，什么时候选对了什么时候出来
        {
            id: "node12",
            avatar: "assets/characters/boy_avatar.png",
            dialogue: "上把输了，应该怎么办",
            options: [
                { text: "靠，太菜了这国潮仔，跳车跑路", affectionChange: -15, nextNodeId: "node21" },
                { text: "对不起我坑你们了，还玩吗(●'◡'●)", affectionChange: +20, nextNodeId: "node11" },
                { text: "不是，又演我一把吗？能不能别演我，再来一把", affectionChange: +11, nextNodeId: "node11" },
                { text: "我还有事，先跑了", affectionChange: -5, nextNodeId: "node21" }
            ]
        },
        //支线122：
        {
            id: "node122",
            avatar: "assets/characters/boy_avatar.png",
            dialogue: "你退了房间，但心中莫名空落，又连忙求邀请让国潮拉你进房间",
            options: [
                { text: "那个...我还可以加入国潮团队吗？", affectionChange: +2, nextNodeId: "node1221" },
                { text: "把我的分吐回来！带我上回来", affectionChange: +1, nextNodeId: "node1221" }
            ]
        },
        //支线1221：
        {
            id: "node1221",
            avatar: "assets/characters/boy_avatar.png",
            dialogue: "这把应该怎么玩呢？",
            options: [
                { text: "玩瑶跟着射手", affectionChange: -10, nextNodeId: "node12" },
                { text: "玩贝利亚，偶尔凑巧给司空震刷大", affectionChange: +20, nextNodeId: "node11" },
                { text: "玩蔡文姬看到谁上就追着奶", affectionChange: +25, nextNodeId: "node11" },
                { text: "玩小乔在中路逛街", affectionChange: +1, nextNodeId: "node12" }
            ]
        },

        
        {
            id: "node111",
            avatar: "assets/characters/boy_avatar.png",
            dialogue: "明天还来不来送外卖（前面不同选项这句话的说的人不一样噢）",
            options: [
                { text: "应该可以来吧，不用太期待噢", affectionChange: +10, nextNodeId: "node3" },
                { text: "可以呀，送送送", affectionChange: +8, nextNodeId: "node3" }
            ]
        },
        {
            id: "node112",
            avatar: "assets/characters/boy_avatar.png",
            dialogue: "明天还来不来送外卖（前面不同选项这句话的说的人不一样噢）",
            options: [
                { text: "有点暧昧了吧～行吧行吧，明天见", affectionChange: +20, nextNodeId: "node3" },
                { text: "送送送必须送，记得给我留位置", affectionChange: +15, nextNodeId: "node3" }
            ]
        },
        {
            id: "node113",
            avatar: "assets/characters/boy_avatar.png",
            dialogue: "明天还来不来送外卖（前面不同选项这句话的说的人不一样噢）",
            options: [
                { text: "送送送，必须送", affectionChange: -5, nextNodeId: "node1111" },
                { text: "好呀好呀，来送来送", affectionChange: -10, nextNodeId: "node1111" }
            ]
        },
        //问你为什么不加我
        {
            id: "node1111",
            avatar: "assets/characters/boy_avatar.png",
            dialogue: "今天送完外卖后：为什么你不加我呀？",
            options: [
                { text: "啊？我没加你吗？我现在加回来", affectionChange: -5, nextNodeId: "node3" },
                { text: "我为啥加你呀？和你很熟吗？", affectionChange: -15, nextNodeId: "node114514" }
            ]
        },
        {
            id: "node3",
            avatar: "assets/characters/boy_avatar.png",
            dialogue: "呀，其他国潮都不在，可以我们俩一起玩吗？",
            options: [
                { text: "哎呀，我还有事，先不玩了。", affectionChange: -15, nextNodeId: "node32" },
                { text: "好呀好呀，玩那个新模式吗，2V2的，我昨天和我诡秘输了一晚上！你能带我赢吗", affectionChange: +15, nextNodeId: "node31" }
            ]
        },
        
        {
            id: "node31",
            avatar: "assets/characters/boy_avatar.png",
            dialogue: "结果2V2连输了七八把",
            options: [
                { text: "哎呀哎呀，这模式好难赢呀，明天还玩吗？", affectionChange: +20, nextNodeId: "node312" },
                { text: "不打了吧。（转头自己开排位，你当初就这样）", affectionChange: -10, nextNodeId: "node311" }
            ]
        },
        {
            id: "node312",
            avatar: "assets/characters/boy_avatar.png",
            dialogue: "第二天刚上线就被邀请2V2了，快来快来一雪前耻",
            options: [
                { text: "哎呀哎呀，2V2不好玩，我不想玩了", affectionChange: -10, nextNodeId: "node3122" },
                { text: "好+一个小表情", affectionChange: +5, nextNodeId: "node3121" },
                { text: "好呀好呀，带我飞带我飞", affectionChange: +5, nextNodeId: "node3121" }
            ]
        },
        {
            id: "node3121",
            avatar: "assets/characters/boy_avatar.png",
            dialogue: "他说：我跟你说我昨天晚上研究了，姜子牙这个模式巨强。于是你偷偷打开主页，发现他玩了好多种英雄，直到玩了姜子牙连胜了",
            options: [
                { text: "他竟然偷偷和这么多人打2V2！！！吃醋了！！！", affectionChange: +1, nextNodeId: "node4" },
                { text: "他竟然偷偷研究这个为了带我飞，好感动呀", affectionChange: +5, nextNodeId: "node4" }
            ]
        },
        {
            id: "node3122",
            avatar: "assets/characters/boy_avatar.png",
            dialogue: "他说：我跟你说我昨天晚上研究了，姜子牙这个模式巨强。于是你偷偷打开主页，发现他玩了好多种英雄，直到玩了姜子牙连胜了",
            options: [
                { text: "他竟然偷偷研究这个为了带我飞，好感动呀，那还是玩吧", affectionChange: +1, nextNodeId: "node4" }
            ]
        },
        {
            id: "node311",
            avatar: "assets/characters/boy_avatar.png",
            dialogue: "自己开排位结果打着打着被发消息了-你还玩吗？我发现姜子牙好恶心打那个22",
            options: [
                { text: "哎呀，你又开了呀", affectionChange: +1, nextNodeId: "node3111" },
                { text: "哇，那你要让我见识一下吗？", affectionChange: +10, nextNodeId: "node3111" },
                { text: "何意味？和我说这个干嘛", affectionChange: -10, nextNodeId: "node3112" },
            ]
        },
        {
            id: "node3111",
            avatar: "assets/characters/boy_avatar.png",
            dialogue: "快来快来我要一雪前耻（被发预约了）",
            options: [
                { text: "哎呀哎呀，2V2不好玩，我不想玩了", affectionChange: -10, nextNodeId: "node3112" },
                { text: "好，在推塔了", affectionChange: +1, nextNodeId: "node4" },
                { text: "好，等我噢快结束了", affectionChange: +6, nextNodeId: "node4" }
            ]
        },
        {
            id: "node3112",
            avatar: "assets/characters/boy_avatar.png",
            dialogue: "结果排位输了之后出来发现他还在打2V2",
            options: [
                { text: "我刚刚回复得是不是太过分了，要不预约一下他吧", affectionChange: +10, nextNodeId: "node4" },
                { text: "这么喜欢玩2V2，果然不是好东西喜欢带妹（不太开心地下机了）", affectionChange: -5, nextNodeId: "node5" }
            ]
        },
        {
            id: "node5",
            avatar: "assets/characters/boy_avatar.png",
            dialogue: "之后，有相当一段时间，国潮都没有再拉你了",
            options: [
                { text: "你看着他每天都在五排，但都不曾拉你，有点难过", affectionChange: +1, nextNodeId: "node51" },
                { text: "以后可能就是路人了吧，你想", affectionChange: -5, nextNodeId: "node51" }
            ]
        },
        {
            id: "node51",
            avatar: "assets/characters/boy_avatar.png",
            dialogue: "可是我有点想和他玩欸，他好有意思",
            options: [
                { text: "你做出了一个重大决定，预约了神也想吃国潮", affectionChange: +12, nextNodeId: "node511" },
                { text: "那个，待会，一起打2V2吗？这个模式今天要关了...", affectionChange: +12, nextNodeId: "node511" }
            ]
        },
        {
            id: "node511",
            avatar: "assets/characters/boy_avatar.png",
            dialogue: "嗯，好，等我打完这把就来",
            options: [
                { text: "没事没事，我等你和他们打完也可以的", affectionChange: +12, nextNodeId: "node5111" },
                { text: "好~等你哟", affectionChange: +12, nextNodeId: "node5111" },
                { text: "好久啊，我自己开把排位吧，待会你出来等我（以前的你百分百这么干，呵呵）", affectionChange: -5, nextNodeId: "node5112" }
            ]
        },
        // 最终结局节点（唯一）
        {
            id: "end",
            avatar: "assets/characters/boy_avatar.png",
            dialogue: "你好，往后余生，请多指教❤️",
            options: [] // 结局无选项，触发好感度判断
        }
    ];

    // 重置数据
    currentNodeId = "start";
    currentAffection = 0;
    affectionEl.textContent = `${currentAffection}/${targetAffection}`; // 好感度显示格式
    renderCurrentNode();

    // 渲染当前剧情节点（核心函数）
    function renderCurrentNode() {
        // 查找当前节点数据
        const currentNode = storyNodes.find(node => node.id === currentNodeId);
        if (!currentNode) return;

        // 更新头像和对话
        novelAvatar.src = currentNode.avatar;
        novelDialogue.textContent = currentNode.dialogue;
        novelOptions.innerHTML = "";

        // 处理结局节点（无选项，触发好感度判断）
        if (currentNode.id === "end") {
            setTimeout(() => {
                if (currentAffection >= targetAffection) {
                    alert(`🎉 好感度达标！(${currentAffection}/${targetAffection})\n谢谢你陪我走完这段回忆，我们要一直相爱哦～`);
                    showTransition(3); // 通关解锁惊喜3
                } else {
                    alert(`😢 好感度不够哦～(${currentAffection}/${targetAffection})\n再重新攻略我一次吧，我等你～`);
                    initGame3(); // 重置游戏重新开始
                }
            }, 2000); // 延迟2秒，给对方看完文案
            return;
        }

        // 生成当前节点的选项按钮
        currentNode.options.forEach((option) => {
            const btn = document.createElement("button");
            btn.classList.add("option-btn");
            btn.textContent = option.text;
            btn.addEventListener("click", () => {
                // 1. 更新好感度（防止负数）
                currentAffection += option.affectionChange;
                currentAffection = Math.max(0, currentAffection);
                // 2. 更新好感度显示
                affectionEl.textContent = `${currentAffection}/${targetAffection}`;
                // 3. 跳转到下一个节点
                currentNodeId = option.nextNodeId;
                // 4. 渲染下一个节点
                renderCurrentNode();
            });
            novelOptions.appendChild(btn);
        });
    }
}

// 游戏4：情侣消消乐
function initGame4() {
    const matchContainer = document.getElementById("matchContainer");
    const matchScoreEl = document.getElementById("matchScore");
    const matchItems = [];
    let matchScore = 0;
    const icons = [
        "❤️", "⭐", "🌙", "💋", "🌸" // 情侣图标提升氛围感
    ];

    // 重置数据
    matchScore = 0;
    matchScoreEl.textContent = "0";
    matchContainer.innerHTML = "";

    // 生成25个消消乐元素（5x5）
    for (let i = 0; i < 25; i++) {
        const item = document.createElement("div");
        item.classList.add("match-item");
        const randomIcon = icons[Math.floor(Math.random() * icons.length)];
        item.dataset.icon = randomIcon;
        item.textContent = randomIcon;
        matchItems.push(item);
        matchContainer.appendChild(item);
    }

    // 点击元素消除（简化版：相邻相同元素消除）
    let selectedItem = null;
    matchItems.forEach(item => {
        item.addEventListener("click", () => {
            if (!selectedItem) {
                selectedItem = item;
                item.style.opacity = 0.7;
            } else {
                // 检查是否相邻且相同
                const selectedIndex = matchItems.indexOf(selectedItem);
                const currentIndex = matchItems.indexOf(item);
                const isAdjacent = Math.abs(selectedIndex - currentIndex) === 1 || Math.abs(selectedIndex - currentIndex) === 5;
                const isSameIcon = selectedItem.dataset.icon === item.dataset.icon;

                if (isAdjacent && isSameIcon) {
                    // 消除元素，加分
                    selectedItem.remove();
                    item.remove();
                    matchScore += 10;
                    matchScoreEl.textContent = matchScore;

                    // 通关判断
                    if (matchScore >= CONFIG.matchTarget) {
                        showTransition(4);
                    }
                }

                // 重置选中状态
                selectedItem.style.opacity = 1;
                selectedItem = null;
            }
        });
    });
}

// ---------------------- 第六步：惊喜辅助功能 ----------------------
// 惊喜2：相册切换
function changeAlbum(direction) {
    currentAlbumIndex += direction;

    // 限制索引范围
    if (currentAlbumIndex < 1) currentAlbumIndex = CONFIG.albumCount;
    if (currentAlbumIndex > CONFIG.albumCount) currentAlbumIndex = 1;

    // 更新相册图片
    document.getElementById("albumImg").src = `assets/surprise/album/album_${currentAlbumIndex}.jpg`;
}

// 工具函数：数组打乱（去重，仅保留一个）
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// ---------------------- 第七步：页面初始化（启动时执行） ----------------------
window.onload = function() {
    initStorage();
    initElements();
    updateMainPage();

    // 如果已经完成开场，直接显示主页面
    const status = getStorageStatus();
    if (status.isIntroDone) {
        introPage.classList.remove("active");
        mainPage.classList.add("active");
    }
};