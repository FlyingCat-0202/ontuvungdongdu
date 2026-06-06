// ========================================================
// 1. DANH SÁCH FILE JSON ĐỂ WEB TỰ ĐỘNG QUÉT
// Khi bạn có bài mới (VD: a.json), chỉ cần thêm tên vào đây
// ========================================================
const lessonFiles = ['bai1.json', 'bai2.json', 'bai3.json'];

let lessonsData = {}; 
let currentTestQuestions = [];
let wrongAttempts = new Set(); 

const lessonContainer = document.getElementById('lessonContainer');
const loadingMsg = document.getElementById('loadingMsg');
const btnStartTest = document.getElementById('btnStartTest');

window.addEventListener('DOMContentLoaded', loadAllLessons);

async function loadAllLessons() {
    let loadedCount = 0;

    for (const file of lessonFiles) {
        try {
            const response = await fetch(file);
            if (!response.ok) throw new Error(`Không tìm thấy file ${file}`);
            
            const json = await response.json();
            const lessonName = file.replace('.json', ''); 
            
            processJSONToLesson(lessonName, json);
            loadedCount++;
        } catch (error) {
            console.error(`Lỗi khi quét file [${file}]:`, error);
        }
    }

    if (loadedCount > 0) {
        if(loadingMsg) loadingMsg.remove();
        renderLessons();
    } else {
        loadingMsg.innerHTML = `<span style="color:red; font-weight:bold;">Không tìm thấy file JSON nào!</span><br>
        <small style="color:#555;">Hãy chắc chắn bạn đã khai báo đúng tên file trong script.js và đang chạy qua Local Server.</small>`;
    }
}

function processJSONToLesson(lessonName, jsonObject) {
    let wordsArray = [];
    for (let key in jsonObject) {
        let vi = key.trim();
        let jaList = jsonObject[key].map(item => item.trim());
        wordsArray.push({ vi: vi, jaList: jaList, selected: true });
    }
    
    lessonsData[lessonName] = {
        selected: true, 
        words: wordsArray
    };
}

function renderLessons() {
    lessonContainer.innerHTML = '';
    let hasLessons = false;

    for (let lessonName in lessonsData) {
        hasLessons = true;
        const div = document.createElement('div');
        div.className = 'lesson-item';
        
        const infoDiv = document.createElement('div');
        infoDiv.className = 'lesson-info';

        const lessonCheckbox = document.createElement('input');
        lessonCheckbox.type = 'checkbox';
        lessonCheckbox.checked = lessonsData[lessonName].selected;
        lessonCheckbox.onchange = (e) => {
            lessonsData[lessonName].selected = e.target.checked;
        };

        const span = document.createElement('span');
        const tenbai = lessonName[3];
        if (lessonName.length > 4){
            tenbai += lessonName[4];
        }
        span.innerHTML = `<strong>Bài ${lessonName[3]}</strong> (${lessonsData[lessonName].words.length} từ)`;
        span.style.cursor = 'pointer';
        span.onclick = () => lessonCheckbox.click(); 
        
        infoDiv.appendChild(lessonCheckbox);
        infoDiv.appendChild(span);

        const eyeBtn = document.createElement('button');
        eyeBtn.className = 'btn-eye';
        eyeBtn.innerHTML = '<img src="eye.png" alt="Eye" style="width: 22px; height: 22px; vertical-align: middle; filter: invert(1);">';
        eyeBtn.title = 'Xem từ vựng';
        eyeBtn.onclick = () => openModal(lessonName);

        div.appendChild(infoDiv);
        div.appendChild(eyeBtn);
        lessonContainer.appendChild(div);
    }

    if (hasLessons) {
        btnStartTest.classList.remove('hidden');
    }
}

function openModal(lessonName) {
    document.getElementById('modalTitle').innerText = `Từ vựng bài: ${lessonName}`;
    const listDiv = document.getElementById('modalWordList');
    listDiv.innerHTML = '';

    lessonsData[lessonName].words.forEach((word, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'word-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = word.selected;
        checkbox.onchange = (e) => {
            lessonsData[lessonName].words[index].selected = e.target.checked;
        };

        const label = document.createElement('label');
        label.innerText = `[${word.jaList.join(', ')}] : ${word.vi}`;
        label.style.cursor = 'pointer';
        label.onclick = () => checkbox.click();

        itemDiv.appendChild(checkbox);
        itemDiv.appendChild(label);
        listDiv.appendChild(itemDiv);
    });

    document.getElementById('wordModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('wordModal').classList.add('hidden');
}

function startTest() {
    currentTestQuestions = [];
    wrongAttempts.clear();

    for (let lessonName in lessonsData) {
        if (lessonsData[lessonName].selected) {
            lessonsData[lessonName].words.forEach(word => {
                if (word.selected) {
                    currentTestQuestions.push(word);
                }
            });
        }
    }

    if (currentTestQuestions.length === 0) {
        alert("Vui lòng tick chọn ít nhất một Bài Học và một Từ Vựng để kiểm tra!");
        return;
    }

    currentTestQuestions.sort(() => Math.random() - 0.5);

    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('testArea').classList.remove('hidden');
    
    renderTestQuestions();
}

function renderTestQuestions() {
    const container = document.getElementById('testQuestions');
    container.innerHTML = '';

    currentTestQuestions.forEach((q, index) => {
        const qDiv = document.createElement('div');
        qDiv.className = 'test-question';

        const label = document.createElement('label');
        label.innerText = `Câu ${index + 1}: ${q.vi}`;

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Nhập từ tiếng Nhật hoặc romaji...';
        input.dataset.index = index;

        const feedback = document.createElement('span');
        feedback.className = 'feedback';
        feedback.id = `feedback-${index}`;

        // Hàm xử lý kiểm tra đáp án chung
        const checkAnswer = function() {
            const userAnswer = input.value.trim().toLowerCase();
            if (userAnswer === "") return; 

            const isCorrect = q.jaList.some(validAnswer => validAnswer.toLowerCase() === userAnswer);

            if (isCorrect) {
                input.classList.remove('wrong');
                input.classList.add('correct');
                input.disabled = true; 
                feedback.className = 'feedback correct';
            } else {
                input.classList.add('wrong');
                wrongAttempts.add(index); 
                feedback.innerText = "❌";
                feedback.className = 'feedback wrong';
                input.value = ""; 
            }
        };

        // 1. Kiểm tra khi click ra ngoài (mất focus)
        input.addEventListener('blur', checkAnswer);

        // 2. Kiểm tra khi nhấn phím Enter
        input.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault(); // Ngăn hành vi mặc định của phím Enter (nếu có)
                checkAnswer();
            }
        });

        qDiv.appendChild(label);
        qDiv.appendChild(input);
        qDiv.appendChild(feedback);
        container.appendChild(qDiv);
    });
}

function finishTest() {
    let correctFirstTryCount = 0;
    let totalQuestions = currentTestQuestions.length;

    currentTestQuestions.forEach((q, index) => {
        const input = document.querySelector(`input[data-index="${index}"]`);
        const isCorrect = input.disabled; 
        
        if (isCorrect && !wrongAttempts.has(index)) {
            correctFirstTryCount++;
        }
    });

    document.getElementById('testArea').classList.add('hidden');
    document.getElementById('resultArea').classList.remove('hidden');
    
    document.getElementById('scoreDisplay').innerText = `${correctFirstTryCount} / ${totalQuestions}`;
}

function backToDashboard() {
    document.getElementById('resultArea').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
}