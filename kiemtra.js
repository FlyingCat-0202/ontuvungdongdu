let currentTestQuestions = [];
let wrongAttempts = new Set(); // Lưu index của các câu trả lời sai lần đầu

// Tự động chạy khi trang kiemtra.html được tải xong
window.addEventListener('DOMContentLoaded', () => {
    // Lấy dữ liệu từ vựng từ localStorage ra
    const storedQuestions = localStorage.getItem('testQuestions');
    
    if (!storedQuestions) {
        alert("Không tìm thấy dữ liệu câu hỏi. Vui lòng quay lại trang chủ chọn bài!");
        window.location.href = 'index.html';
        return;
    }

    currentTestQuestions = JSON.parse(storedQuestions);
    renderTestQuestions();
});

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
                feedback.innerText = "✔️ Chính xác!";
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
                event.preventDefault();
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
        const isCorrect = input ? input.disabled : false; 
        
        if (isCorrect && !wrongAttempts.has(index)) {
            correctFirstTryCount++;
        }
    });

    // Ẩn khu vực câu hỏi, hiện khu vực kết quả
    document.getElementById('testArea').classList.add('hidden');
    document.getElementById('resultArea').classList.remove('hidden');
    
    document.getElementById('scoreDisplay').innerText = `${correctFirstTryCount} / ${totalQuestions}`;
    
    // Xóa dữ liệu tạm trong bộ nhớ sau khi làm xong (tùy chọn)
    localStorage.removeItem('testQuestions');
}

function backToDashboard() {
    // Quay trở lại trang chủ index.html
    window.location.href = 'index.html';
}