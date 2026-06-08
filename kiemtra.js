let currentTestQuestions = [];
let wrongAttempts = new Set(); // Lưu index của các câu trả lời sai lần đầu

window.addEventListener('DOMContentLoaded', () => {
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

        // --- KHU VỰC CHỨA FEEDBACK VÀ NÚT XEM ĐÁP ÁN ---
        const actionDiv = document.createElement('div');
        actionDiv.style.display = 'flex';
        actionDiv.style.alignItems = 'center';
        actionDiv.style.gap = '10px';
        actionDiv.style.marginTop = '5px';

        const feedback = document.createElement('span');
        feedback.className = 'feedback';
        feedback.id = `feedback-${index}`;

        // Nút xem đáp án (Mặc định ẩn)
        const btnShow = document.createElement('button');
        btnShow.innerText = 'Xem đáp án';
        btnShow.className = 'hidden';
        // Thêm chút CSS trực tiếp cho nút này nhỏ gọn lại
        btnShow.style.backgroundColor = '#607d8b';
        btnShow.style.padding = '6px 12px';
        btnShow.style.fontSize = '13px';
        btnShow.style.borderRadius = '6px';
        btnShow.style.margin = '0';
        
        // Dòng text hiển thị đáp án (Mặc định ẩn)
        const answerDisplay = document.createElement('div');
        answerDisplay.className = 'hidden';
        answerDisplay.style.color = '#e91e63'; // Màu hồng đỏ nổi bật
        answerDisplay.style.fontWeight = 'bold';
        answerDisplay.style.marginTop = '5px';
        answerDisplay.innerText = `Đáp án: ${q.jaList.join(' / ')}`; // Hiển thị các đáp án cách nhau bằng dấu /

        // Sự kiện khi bấm nút "Xem đáp án"
        btnShow.onclick = () => {
            answerDisplay.classList.remove('hidden'); // Hiện dòng đáp án
            btnShow.classList.add('hidden'); // Ẩn nút xem đi
        };

        actionDiv.appendChild(feedback);
        actionDiv.appendChild(btnShow);

        // --- HÀM KIỂM TRA ĐÁP ÁN ---
        const checkAnswer = function() {
            const userAnswer = input.value.trim().toLowerCase();
            if (userAnswer === "") return; 

            const isCorrect = q.jaList.some(validAnswer => validAnswer.toLowerCase() === userAnswer);

            if (isCorrect) {
                input.classList.remove('wrong');
                input.classList.add('correct');
                input.disabled = true; 
                feedback.className = 'feedback correct';
                
                // Nếu làm đúng thì ẩn nút xem đáp án và dòng đáp án đi (phòng trường hợp trước đó làm sai)
                btnShow.classList.add('hidden');
                answerDisplay.classList.add('hidden');
            } else {
                input.classList.add('wrong');
                wrongAttempts.add(index); 
                feedback.className = 'feedback wrong';
                
                // Nếu sai, hiện nút Xem đáp án lên
                btnShow.classList.remove('hidden');
                
                // Bôi đen chữ vừa nhập sai để tiện gõ lại luôn mà không cần ấn xóa nhiều lần
                input.select();
            }
        };

        // 1. Kiểm tra khi click ra ngoài (mất focus)
        input.addEventListener('blur', checkAnswer);

        // 2. Kiểm tra khi nhấn phím Enter
        input.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault(); 
                input.blur(); // Tự động ẩn bàn phím điện thoại và gọi lệnh blur để check
            }
        });

        qDiv.appendChild(label);
        qDiv.appendChild(input);
        qDiv.appendChild(actionDiv); // Thêm khu vực feedback + nút
        qDiv.appendChild(answerDisplay); // Thêm dòng hiển thị đáp án
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

    document.getElementById('testArea').classList.add('hidden');
    document.getElementById('resultArea').classList.remove('hidden');
    
    document.getElementById('scoreDisplay').innerText = `${correctFirstTryCount} / ${totalQuestions}`;
    localStorage.removeItem('testQuestions');
}

function backToDashboard() {
    window.location.href = 'index.html';
}