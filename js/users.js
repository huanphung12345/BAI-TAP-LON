/**
 * 🏋️ FitTrack - users.js
 * Quản lý Users + BMI Calculator
 *
 * ✅ jQuery Selector   : $(), $('#'), $('.')
 * ✅ Sự kiện jQuery    : .on(), .click()
 * ✅ Hiệu ứng jQuery   : .fadeIn(), .slideDown(), .hide(), .animate()
 * ✅ jQuery AJAX       : API.users.getAll() → $.ajax()
 * ✅ DOM jQuery        : .html(), .append(), .val(), .attr(), .text()
 */

$(document).ready(function () {

    /* =====================================================
       STATE
    ===================================================== */
    let allUsers    = [];
    let filteredUsers = [];
    let bmiHistory  = JSON.parse(localStorage.getItem('fittrack_bmi_history') || '[]');

    /* =====================================================
       INIT
    ===================================================== */
    initUsers();
    initBMICalculator();
    renderBMIHistory();

    /* =====================================================
       LOAD USERS TỪ MOCKAPI
       ✅ YÊU CẦU 4: $.ajax() qua API module
    ===================================================== */
    async function initUsers() {
        // ✅ HIỆU ỨNG: .fadeIn() loading
        $('#usersLoading').removeClass('d-none').hide().fadeIn(200);

        try {
            allUsers      = await API.users.getAll();   // $.ajax bên trong
            filteredUsers = [...allUsers];
            renderUserCards(filteredUsers);
        } catch (err) {
            console.error('Load users error:', err);

            // ✅ DOM: .html()
            $('#usersList').html(`
                <div class="col-12 text-center py-4">
                    <i class="bi bi-wifi-off display-4 text-danger"></i>
                    <p class="text-danger mt-2 fw-semibold">Không thể tải danh sách người dùng</p>
                    <button class="btn btn-primary btn-sm" id="btnRetryUsers">
                        <i class="bi bi-arrow-clockwise me-1"></i>Thử lại
                    </button>
                </div>
            `);

            // ✅ SỰ KIỆN: .on()
            $('#usersList').on('click', '#btnRetryUsers', initUsers);
        }

        // ✅ HIỆU ỨNG: .fadeOut()
        $('#usersLoading').fadeOut(300, function () {
            $(this).addClass('d-none');
        });
    }

    /* =====================================================
       RENDER USER CARDS
    ===================================================== */
    function renderUserCards(users) {
        // ✅ jQuery Selector
        const $container = $('#usersList');

        // ✅ HIỆU ỨNG: .fadeOut() → render → .fadeIn()
        $container.fadeOut(150, function () {
            $container.html('');   // ✅ DOM: .html()

            if (!users.length) {
                $container.html(`
                    <div class="col-12 text-center py-5">
                        <i class="bi bi-people display-3 text-muted opacity-50"></i>
                        <h5 class="mt-3 text-muted">Không tìm thấy người dùng</h5>
                    </div>
                `);
                $container.fadeIn(300);
                return;
            }

            users.forEach((user, i) => {
                const $card = buildUserCard(user, i);
                $container.append($card);   // ✅ DOM: .append()
            });

            $container.fadeIn(350);         // ✅ HIỆU ỨNG: .fadeIn()

            // ✅ HIỆU ỨNG: stagger fadeIn từng card
            $container.find('.user-col').each(function (i) {
                const $col = $(this);
                $col.hide().delay(i * 70).fadeIn(400);  // ✅ .hide() + .fadeIn()
            });
        });
    }

    function buildUserCard(user, idx) {
        const bmiInfo  = getBMIInfo(user.bmi);
        const initials = getInitials(user.name);
        const gradient = getGradient(user.gender, idx);
        const muscleIcon = Utils.muscleIcon(user.favoriteWorkout);
        const muscleColor = Utils.muscleColor(user.favoriteWorkout);

        const $col  = $('<div>')
            .addClass('col-lg-3 col-md-4 col-sm-6 user-col');
        const $card = $('<div>').addClass('user-card card');

        // Header gradient
        const $header = $('<div>')
            .addClass('user-header text-white')
            .css('background', gradient);

        $header.html(`
            <div class="user-avatar">
                ${initials}
            </div>
            <div class="user-name">${user.name}</div>
            <div class="user-meta">
                <i class="bi bi-${user.gender === 'Nam' ? 'gender-male' : 'gender-female'} me-1"></i>
                ${user.gender} · ${user.age} tuổi
            </div>
        `);

        // Body
        const $body = $('<div>').addClass('user-body');
        $body.html(`
            <div class="user-info-row">
                <span class="user-info-label">
                    <i class="bi bi-arrows-vertical text-primary"></i>Chiều cao
                </span>
                <span class="user-info-value">${user.height} cm</span>
            </div>
            <div class="user-info-row">
                <span class="user-info-label">
                    <i class="bi bi-box text-success"></i>Cân nặng
                </span>
                <span class="user-info-value">${user.weight} kg</span>
            </div>
            <div class="user-info-row">
                <span class="user-info-label">
                    <i class="bi bi-calculator text-warning"></i>BMI
                </span>
                <span>
                    <span class="bmi-badge-mini"
                          style="background:${bmiInfo.bg};color:${bmiInfo.color}">
                        ${user.bmi} — ${bmiInfo.label}
                    </span>
                </span>
            </div>
            <div class="user-info-row">
                <span class="user-info-label">
                    <i class="bi bi-bullseye text-danger"></i>Mục tiêu
                </span>
                <span class="goal-badge">${user.goal}</span>
            </div>
            <div class="user-info-row">
                <span class="user-info-label">
                    <i class="bi bi-bar-chart text-purple"></i>Trình độ
                </span>
                <span class="level-badge level-${user.level}">${user.level}</span>
            </div>
            <div class="user-info-row">
                <span class="user-info-label">
                    <i class="bi ${muscleIcon}" style="color:${muscleColor}"></i>Ưa thích
                </span>
                <span class="muscle-badge" style="background:${muscleColor};font-size:.7rem;padding:2px 8px">
                    ${user.favoriteWorkout}
                </span>
            </div>
            <div class="user-info-row" style="border-bottom:none">
                <span class="user-info-label">
                    <i class="bi bi-calendar text-secondary"></i>Tham gia
                </span>
                <span class="user-info-value text-muted">
                    ${Utils.formatDate(user.joinDate)}
                </span>
            </div>
        `);

        // ✅ SỰ KIỆN: hover hiệu ứng
        $card.on('mouseenter', function () {
            $(this).find('.user-avatar').animate({ marginTop: '-5px' }, 200);
        }).on('mouseleave', function () {
            $(this).find('.user-avatar').animate({ marginTop: '0px' }, 200);
        });

        $card.append($header, $body);
        $col.append($card);
        return $col;
    }

    /* =====================================================
       FILTER USERS
       ✅ SỰ KIỆN 1: .on('input') search
    ===================================================== */
    $('#userSearch').on('input', Utils.debounce(function () {
        applyUserFilters();
    }, 300));

    // ✅ SỰ KIỆN 2: .on('change') select filters
    $('#userGenderFilter, #userLevelFilter, #userGoalFilter').on('change', function () {
        applyUserFilters();
    });

    // ✅ SỰ KIỆN 3: Reset filter .click()
    $('#btnResetUserFilter').click(function () {
        // ✅ DOM: .val() reset
        $('#userSearch').val('');
        $('#userGenderFilter, #userLevelFilter, #userGoalFilter').val('');
        filteredUsers = [...allUsers];
        // ✅ DOM: .html()
        $('#userResultCount').html('');
        renderUserCards(filteredUsers);
    });

    function applyUserFilters() {
        // ✅ DOM: .val() đọc
        const keyword = $('#userSearch').val().toLowerCase().trim();
        const gender  = $('#userGenderFilter').val();
        const level   = $('#userLevelFilter').val();
        const goal    = $('#userGoalFilter').val();

        filteredUsers = allUsers.filter(u => {
            if (keyword && !u.name.toLowerCase().includes(keyword)) return false;
            if (gender  && u.gender  !== gender)  return false;
            if (level   && u.level   !== level)   return false;
            if (goal    && u.goal    !== goal)     return false;
            return true;
        });

        // ✅ DOM: .html() hiển thị số kết quả
        $('#userResultCount').html(
            `<span class="badge bg-primary">${filteredUsers.length} người dùng</span>`
        );

        renderUserCards(filteredUsers);
    }

    /* =====================================================
       BMI CALCULATOR
    ===================================================== */
    function initBMICalculator() {
        // ✅ SỰ KIỆN 4: Slider chiều cao - .on('input')
        $('#bmiHeight').on('input', function () {
            const val = $(this).val();      // ✅ DOM: .val()
            // ✅ DOM: .text()
            $('#heightDisplay').text(val);
            // Sync manual input
            $('#manualHeight').val(val);
        });

        // ✅ SỰ KIỆN 5: Slider cân nặng - .on('input')
        $('#bmiWeight').on('input', function () {
            const val = $(this).val();
            $('#weightDisplay').text(val);
            $('#manualWeight').val(val);
        });

        // ✅ SỰ KIỆN 6: Manual height input sync slider
        $('#manualHeight').on('input', function () {
            const val = parseInt($(this).val());
            if (val >= 140 && val <= 210) {
                $('#bmiHeight').val(val);
                $('#heightDisplay').text(val);
            }
        });

        // ✅ SỰ KIỆN 7: Manual weight input sync slider
        $('#manualWeight').on('input', function () {
            const val = parseFloat($(this).val());
            if (val >= 30 && val <= 150) {
                $('#bmiWeight').val(val);
                $('#weightDisplay').text(val);
            }
        });

        // ✅ SỰ KIỆN 8: Gender buttons
        $('.gender-btn').on('click', function () {
            $('.gender-btn').removeClass('active');
            $(this).addClass('active');
            // ✅ DOM: .val() set hidden input
            $('#bmiGender').val($(this).data('gender'));   // ✅ .data()
        });

        // ✅ SỰ KIỆN 9: Toggle manual input
        $('#btnToggleManual').on('click', function () {
            const $manual = $('#manualInputs');   // ✅ jQuery Selector
            if ($manual.hasClass('d-none')) {
                $manual.removeClass('d-none');
                // ✅ HIỆU ỨNG: .slideDown()
                $manual.hide().slideDown(300);

                // ✅ DOM: .html() thay đổi button text
                $(this).html('<i class="bi bi-sliders me-1"></i>Dùng thanh kéo');
                // Sync values
                $('#manualHeight').val($('#bmiHeight').val());
                $('#manualWeight').val($('#bmiWeight').val());
            } else {
                // ✅ HIỆU ỨNG: .slideUp()
                $manual.slideUp(300, function () {
                    $(this).addClass('d-none');
                });
                $(this).html('<i class="bi bi-keyboard me-1"></i>Nhập số thủ công');
            }
        });

        // ✅ SỰ KIỆN 10: Tính BMI .on('click')
        $('#btnCalculateBMI').on('click', function () {
            calculateBMI();
        });

        // Enter key để tính
        $('#bmiName, #bmiAge').on('keypress', function (e) {
            if (e.which === 13) calculateBMI();
        });

        // ✅ SỰ KIỆN 11: Xóa lịch sử .on('click')
        $('#btnClearHistory').on('click', function () {
            bmiHistory = [];
            localStorage.removeItem('fittrack_bmi_history');
            renderBMIHistory();

            // ✅ HIỆU ỨNG: animate button
            $(this).animate({ opacity: 0.5 }, 200)
                   .animate({ opacity: 1 }, 200);

            Utils.toast('Đã Xóa', 'Lịch sử BMI đã được xóa!', 'info');
        });
    }

    /* =====================================================
       ⭐ TÍNH BMI THỦ CÔNG BẰNG JS
    ===================================================== */
    function calculateBMI() {
        // ✅ DOM: .val() đọc tất cả inputs
        const name   = $('#bmiName').val().trim() || 'Ẩn danh';
        const gender = $('#bmiGender').val();
        const age    = parseInt($('#bmiAge').val())    || 25;
        const height = parseFloat($('#bmiHeight').val());  // cm
        const weight = parseFloat($('#bmiWeight').val());  // kg

        // === CÔNG THỨC TÍNH BMI ===
        // BMI = weight (kg) / (height (m))²
        const heightM = height / 100;
        const bmi     = weight / (heightM * heightM);
        const bmiRounded = Math.round(bmi * 10) / 10;

        // === Phân loại theo WHO Châu Á ===
        const bmiInfo = getBMIInfo(bmiRounded);

        // === Cân nặng lý tưởng (Devine formula) ===
        let idealWeight;
        if (gender === 'Nam') {
            idealWeight = 50 + 2.3 * ((height - 152.4) / 2.54);
        } else {
            idealWeight = 45.5 + 2.3 * ((height - 152.4) / 2.54);
        }
        idealWeight = Math.max(idealWeight, 30);

        // === BMR (Harris-Benedict) ===
        let bmr;
        if (gender === 'Nam') {
            bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
        } else {
            bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
        }

        // ✅ HIỆU ỨNG: .fadeOut() kết quả cũ → hiện mới
        $('#bmiPlaceholder').fadeOut(200, function () {
            // ✅ DOM: .html() điền kết quả
            showBMIResult({
                name, gender, age, height, weight,
                bmi: bmiRounded, bmiInfo,
                idealWeight: Math.round(idealWeight * 10) / 10,
                bmr: Math.round(bmr)
            });
        });

        // Lưu lịch sử
        saveBMIHistory({ name, gender, age, height, weight, bmi: bmiRounded, bmiInfo });
    }

    function showBMIResult(data) {
        const { name, gender, age, height, weight, bmi, bmiInfo, idealWeight, bmr } = data;

        // ✅ DOM: .html() cập nhật avatar + info
        $('#bmiResultName').text(name);
        $('#bmiResultMeta').html(`
            <i class="bi bi-${gender === 'Nam' ? 'gender-male' : 'gender-female'} me-1"></i>
            ${gender} · ${age} tuổi
        `);

        // Update avatar
        const initials = getInitials(name);
        const grad     = gender === 'Nam'
            ? 'linear-gradient(135deg, #6C63FF, #3498DB)'
            : 'linear-gradient(135deg, #FF6B6B, #FF8E8E)';
        $('#bmiAvatar')
            .html(initials.length <= 2 ? initials : `<i class="bi bi-person-circle"></i>`)
            .css('background', grad);

        // BMI value box class
        $('#bmiValueBox')
            .removeClass('bmi-underweight bmi-normal bmi-overweight bmi-obese1 bmi-obese2')
            .addClass(bmiInfo.cls);

        // Animate BMI number
        const $bmiNum = $('#bmiNumber');  // ✅ jQuery Selector
        $({ val: 0 }).animate({ val: bmi }, {
            duration: 800,
            step: function () {
                // ✅ DOM: .text() cập nhật live
                $bmiNum.text(this.val.toFixed(1));
            },
            complete: function () {
                $bmiNum.text(bmi.toFixed(1));
            }
        });

        // ✅ DOM: .html() category badge
        $('#bmiCategoryBadge').html(`
            <i class="bi ${bmiInfo.icon} me-1"></i>${bmiInfo.label}
        `);

        // Pointer trên scale bar
        const pct = Math.min(Math.max(((bmi - 15) / (35 - 15)) * 100, 2), 98);
        // ✅ DOM: .css() với .animate()
        $('#bmiPointer').animate({ left: pct + '%' }, 800);

        // Stats
        $('#statHeight').text(height + ' cm');
        $('#statWeight').text(weight + ' kg');
        $('#statIdealWeight').text(idealWeight + ' kg');
        $('#statBMR').text(Utils.fmtNum(bmr) + ' kcal');

        // Advice
        renderBMIAdvice(bmiInfo, data);

        // ✅ HIỆU ỨNG: .slideDown() show result
        $('#bmiResult').removeClass('d-none').hide().slideDown(400);

        // ✅ HIỆU ỨNG: highlight card
        $('#bmiResultCard')
            .addClass('highlight-pulse')
            .delay(700)
            .queue(function () {
                $(this).removeClass('highlight-pulse').dequeue();
            });
    }

    function renderBMIAdvice(bmiInfo, data) {
        const adviceMap = {
            'bmi-underweight': {
                text: `BMI ${data.bmi} cho thấy bạn đang thiếu cân. Hãy tăng cường dinh dưỡng, ăn nhiều protein và carbs phức tạp để đạt cân nặng lý tưởng ${data.idealWeight} kg.`,
                workouts: ['Full Body', 'Tay trước', 'Ngực'],
                color: '#17A2B8'
            },
            'bmi-normal': {
                text: `Tuyệt vời! BMI ${data.bmi} trong ngưỡng bình thường. Duy trì chế độ tập luyện và ăn uống cân bằng để giữ vóc dáng lý tưởng.`,
                workouts: ['Cardio', 'Full Body', 'Lưng'],
                color: '#28A745'
            },
            'bmi-overweight': {
                text: `BMI ${data.bmi} ở mức thừa cân nhẹ. Tăng cường cardio và điều chỉnh khẩu phần ăn. Mục tiêu giảm về ${data.idealWeight} kg.`,
                workouts: ['Cardio', 'Bụng', 'Chân'],
                color: '#FFC107'
            },
            'bmi-obese1': {
                text: `BMI ${data.bmi} ở mức béo phì độ 1. Cần kế hoạch giảm cân nghiêm túc với chế độ ăn lành mạnh và tập luyện đều đặn.`,
                workouts: ['Cardio', 'Bụng', 'Full Body'],
                color: '#FD7E14'
            },
            'bmi-obese2': {
                text: `BMI ${data.bmi} ở mức béo phì độ 2. Vui lòng tham khảo ý kiến bác sĩ hoặc chuyên gia dinh dưỡng trước khi bắt đầu chương trình tập luyện.`,
                workouts: ['Cardio nhẹ', 'Đi bộ', 'Yoga'],
                color: '#DC3545'
            }
        };

        const advice = adviceMap[bmiInfo.cls] || adviceMap['bmi-normal'];

        // ✅ DOM: .attr() và .html()
        $('#bmiAdviceBox').attr('style', `border-left-color: ${advice.color}`);
        $('#bmiAdviceText').text(advice.text);

        const workoutsHtml = advice.workouts.map(w => {
            const color = Utils.muscleColor(w);
            return `<span class="muscle-badge me-1" style="background:${color};font-size:.75rem">
                        <i class="bi ${Utils.muscleIcon(w)}"></i> ${w}
                    </span>`;
        }).join('');

        // ✅ DOM: .html()
        $('#bmiWorkoutSuggest').html(`
            <div class="mt-2">
                <small class="text-muted fw-semibold d-block mb-1">
                    <i class="bi bi-star me-1"></i>Gợi ý bài tập phù hợp:
                </small>
                ${workoutsHtml}
            </div>
        `);
    }

    /* =====================================================
       BMI HISTORY (LocalStorage)
    ===================================================== */
    function saveBMIHistory(entry) {
        const record = {
            ...entry,
            time: new Date().toLocaleString('vi-VN')
        };
        bmiHistory.unshift(record);
        // Giới hạn 10 entries
        if (bmiHistory.length > 10) bmiHistory.pop();
        localStorage.setItem('fittrack_bmi_history', JSON.stringify(bmiHistory));
        renderBMIHistory();
    }

    function renderBMIHistory() {
        const $tbody = $('#bmiHistoryBody');   // ✅ jQuery Selector

        if (!bmiHistory.length) {
            // ✅ DOM: .html()
            $tbody.html(`
                <tr>
                    <td colspan="8" class="text-center text-muted py-3 fst-italic">
                        <i class="bi bi-clock-history me-2"></i>Chưa có lịch sử tính BMI
                    </td>
                </tr>
            `);
            return;
        }

        $tbody.html('');

        bmiHistory.forEach((rec, i) => {
            const info = getBMIInfo(rec.bmi);
            const $tr  = $('<tr>');

            if (i === 0) $tr.addClass('bmi-active-row');

            $tr.html(`
                <td class="fw-semibold">${rec.name}</td>
                <td>${rec.gender}</td>
                <td>${rec.age}</td>
                <td>${rec.height} cm</td>
                <td>${rec.weight} kg</td>
                <td><strong>${rec.bmi}</strong></td>
                <td>
                    <span class="badge"
                          style="background:${info.bg};color:${info.color}">
                        ${info.label}
                    </span>
                </td>
                <td class="text-muted small">${rec.time}</td>
            `);

            // ✅ HIỆU ỨNG: fadeIn từng row
            $tr.hide();
            $tbody.append($tr);   // ✅ DOM: .append()
            $tr.delay(i * 60).fadeIn(350);
        });
    }

    /* =====================================================
       HELPERS
    ===================================================== */

    // Phân loại BMI (WHO Châu Á)
    function getBMIInfo(bmi) {
        if (bmi < 18.5) return {
            label: 'Thiếu cân', cls: 'bmi-underweight',
            color: '#117A8B', bg: 'rgba(23,162,184,0.15)',
            icon: 'bi-arrow-down-circle'
        };
        if (bmi < 23)   return {
            label: 'Bình thường', cls: 'bmi-normal',
            color: '#1E7E34', bg: 'rgba(40,167,69,0.15)',
            icon: 'bi-check-circle'
        };
        if (bmi < 25)   return {
            label: 'Thừa cân', cls: 'bmi-overweight',
            color: '#856404', bg: 'rgba(255,193,7,0.15)',
            icon: 'bi-exclamation-circle'
        };
        if (bmi < 30)   return {
            label: 'Béo phì I', cls: 'bmi-obese1',
            color: '#C56A00', bg: 'rgba(253,126,20,0.15)',
            icon: 'bi-exclamation-triangle'
        };
        return {
            label: 'Béo phì II', cls: 'bmi-obese2',
            color: '#B21F2D', bg: 'rgba(220,53,69,0.15)',
            icon: 'bi-x-circle'
        };
    }

    // Lấy chữ cái đầu
    function getInitials(name) {
        if (!name) return '?';
        return name.split(' ')
            .filter(w => w.length > 0)
            .slice(-2)
            .map(w => w[0].toUpperCase())
            .join('');
    }

    // Màu gradient theo giới tính + index
    function getGradient(gender, idx) {
        const maleGrads = [
            'linear-gradient(135deg,#6C63FF,#3498DB)',
            'linear-gradient(135deg,#2C3E50,#3498DB)',
            'linear-gradient(135deg,#1ABC9C,#3498DB)',
            'linear-gradient(135deg,#27AE60,#2ECC71)',
            'linear-gradient(135deg,#8E44AD,#9B59B6)'
        ];
        const femaleGrads = [
            'linear-gradient(135deg,#FF6B6B,#FF8E53)',
            'linear-gradient(135deg,#E91E63,#FF6B6B)',
            'linear-gradient(135deg,#9C27B0,#E91E63)',
            'linear-gradient(135deg,#FF9800,#FF6B6B)',
            'linear-gradient(135deg,#F06292,#CE93D8)'
        ];
        const grads = gender === 'Nam' ? maleGrads : femaleGrads;
        return grads[idx % grads.length];
    }

});