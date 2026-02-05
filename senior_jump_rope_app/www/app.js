// 乐龄跳绳助手 - 核心逻辑
const CONFIG = {
    TOTAL_GROUPS: 4,
    JUMP_TIME_SEC: 60,
    REST_TIME_SEC: 30,
};

let state = {
    currentGroup: 1,
    remainingSeconds: CONFIG.JUMP_TIME_SEC,
    isRunning: false,
    phase: 'READY', // READY, JUMPING, RESTING, DONE
    timer: null,
    groupJumpCount: 0,
    totalJumpCount: 0
};

// DOM 元素
const el = {
    group: document.getElementById('groupDisplay'),
    timer: document.getElementById('timerDisplay'),
    status: document.getElementById('statusIndicator'),
    count: document.getElementById('countDisplay'),
    btnStart: document.getElementById('startBtn'),
    btnPause: document.getElementById('pauseBtn'),
    btnReset: document.getElementById('resetBtn'),
    timerLabel: document.getElementById('timerLabel'),
    tapArea: document.getElementById('tapArea'),
    countOverlay: document.getElementById('countOverlay'),
    jumpCountDisplay: document.getElementById('jumpCountDisplay')
};

// 语音播放函数
function speak(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance(text);
        msg.lang = 'zh-CN';
        msg.rate = 1.2; // 稍微快一点点，听起来更精神
        window.speechSynthesis.speak(msg);
    }
}

function updateUI() {
    el.group.textContent = String(state.currentGroup).padStart(2, '0');
    el.timer.textContent = state.remainingSeconds;
    el.count.textContent = state.groupJumpCount;
    el.jumpCountDisplay.textContent = state.groupJumpCount;

    switch (state.phase) {
        case 'READY':
            el.status.textContent = '准备就绪';
            el.status.className = 'status-ready';
            el.timer.style.color = 'var(--text-main)';
            el.timerLabel.textContent = '标准组: 60秒';
            el.btnStart.textContent = '开始锻炼';
            el.btnStart.style.display = 'block';
            el.btnPause.style.display = 'none';
            el.countOverlay.style.display = 'none';
            break;
        case 'JUMPING':
            el.status.textContent = '正在跳绳';
            el.status.className = 'status-active';
            el.timer.style.color = 'var(--primary-color)';
            el.timerLabel.textContent = '倒计时';
            el.btnStart.style.display = 'none';
            el.btnPause.style.display = 'block';
            el.btnPause.textContent = state.isRunning ? '暂停' : '继续';
            el.countOverlay.style.display = (state.isRunning) ? 'flex' : 'none';
            break;
        case 'RESTING':
            el.status.textContent = '正在休息';
            el.status.className = 'status-rest';
            el.timer.style.color = 'var(--pause-color)';
            el.timerLabel.textContent = '休息时间';
            el.btnStart.style.display = 'none';
            el.btnPause.style.display = 'block';
            el.countOverlay.style.display = 'none';
            break;
        case 'DONE':
            el.status.textContent = '锻炼完成';
            el.status.className = 'status-active';
            el.timer.textContent = '好棒';
            el.timer.style.color = 'var(--primary-color)';
            el.btnStart.style.display = 'block';
            el.btnStart.textContent = '再次开始';
            el.btnPause.style.display = 'none';
            el.countOverlay.style.display = 'none';
            break;
    }
}

function tick() {
    if (!state.isRunning) return;

    if (state.remainingSeconds > 0) {
        state.remainingSeconds--;
        // 最后 5 秒倒计时音效
        if (state.remainingSeconds <= 5 && state.remainingSeconds > 0) {
            speak(state.remainingSeconds);
        }
    } else {
        handlePhaseCompletion();
    }
    updateUI();
}

function handlePhaseCompletion() {
    if (state.phase === 'JUMPING') {
        state.totalJumpCount += state.groupJumpCount;
        if (state.currentGroup < CONFIG.TOTAL_GROUPS) {
            state.phase = 'RESTING';
            state.remainingSeconds = CONFIG.REST_TIME_SEC;
            speak('本组结束，跳了' + state.groupJumpCount + '下。请休息' + CONFIG.REST_TIME_SEC + '秒');
            state.groupJumpCount = 0; // 重置本组计数
        } else {
            state.phase = 'DONE';
            state.isRunning = false;
            clearInterval(state.timer);
            speak('恭喜！完成全部锻炼。总共跳了' + (state.totalJumpCount) + '下。您真了不起！');
        }
    } else if (state.phase === 'RESTING') {
        state.currentGroup++;
        state.phase = 'JUMPING';
        state.remainingSeconds = CONFIG.JUMP_TIME_SEC;
        speak('休息结束，第' + state.currentGroup + '组开始。加油！');
    }
}

// 按钮及触摸事件
el.btnStart.onclick = () => {
    if (state.phase === 'DONE') {
        reset();
    }
    state.isRunning = true;
    state.phase = 'JUMPING';
    if (!state.timer) {
        state.timer = setInterval(tick, 1000);
    }
    speak('锻炼开始，每跳一下请点击屏幕');
    updateUI();
};

el.btnPause.onclick = () => {
    state.isRunning = !state.isRunning;
    if (state.isRunning) {
        speak('继续');
    } else {
        speak('暂停');
    }
    updateUI();
};

el.btnReset.onclick = () => {
    if (confirm('确定要重置吗？所有进度将丢失')) {
        reset();
    }
};

// 核心功能：点击屏幕计数
el.countOverlay.onclick = (e) => {
    if (state.phase === 'JUMPING' && state.isRunning) {
        state.groupJumpCount++;
        // 触感反馈（如果支持）
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        updateUI();
    }
};

function reset() {
    if (state.timer) clearInterval(state.timer);
    state = {
        currentGroup: 1,
        remainingSeconds: CONFIG.JUMP_TIME_SEC,
        isRunning: false,
        phase: 'READY',
        timer: null,
        groupJumpCount: 0,
        totalJumpCount: 0
    };
    speak('已重置');
    updateUI();
}

// 初始化
updateUI();
speak('欢迎使用乐龄跳绳助手。点击绿色按钮开始');
