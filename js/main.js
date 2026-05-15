/**
 * 🏋️ FitTrack - main.js (Public Page)
 *
 * ✅ jQuery Selector  : $('selector'), $('#id'), $('.class')
 * ✅ Sự kiện jQuery   : .on(), .click()
 * ✅ Hiệu ứng jQuery  : .fadeIn(), .slideDown(), .hide(), .fadeOut()
 * ✅ jQuery AJAX      : gọi qua API module ($.ajax bên trong)
 * ✅ DOM jQuery       : .append(), .html(), .val(), .attr(), .text()
 */

$(document).ready(function () {

    /* ================================================
       STATE
    ================================================ */
    let allWorkouts  = [];
    let allExercises = [];
    let filtered     = [];

    /* ================================================
       INIT
    ================================================ */
    initPage();

    async function initPage() {
        showPageLoading(true);
        try {
            // ✅ YÊU CẦU 4: Gọi API bằng jQuery AJAX (qua module)
            const [w, e] = await Promise.all([
                API.workouts.getAll(),
                API.exercises.getAll()
            ]);

            allWorkouts  = w.sort((a, b) => new Date(b.date) - new Date(a.date));
            allExercises = e;
            filtered     = [...allWorkouts];

            renderDashboard();
            renderWorkoutList();
            renderCharts();
            renderExerciseLibrary();
            initCalculator();

        } catch (err) {
            console.error('Init error:', err);
            // ✅ DOM: .html()
            $('#workoutList').html(`
                <div class="col-12 text-center py-5">
                    <i class="bi bi-wifi-off display-4 text-danger"></i>
                    <h5 class="mt-3 text-danger">Không thể kết nối API</h5>
                    <button class="btn btn-primary mt-2" id="btnRetry">
                        <i class="bi bi-arrow-clockwise me-1"></i>Thử lại
                    </button>
                </div>
            `);

            // ✅ SỰ KIỆN: .on()
            $('#workoutList').on('click', '#btnRetry', initPage);
        }
        showPageLoading(false);
    }

    /* ================================================
       ✅ HIỆU ỨNG: Loading Page
    ================================================ */
    function showPageLoading(show) {
        if (show) {
            // ✅ HIỆU ỨNG 1: .fadeIn()
            $('#pageLoadingOverlay').fadeIn(300);
        } else {
            // ✅ HIỆU ỨNG: .fadeOut()
            $('#pageLoadingOverlay').fadeOut(400);
        }
    }

    /* ================================================
       DASHBOARD
    ================================================ */
    function renderDashboard() {
        Utils.animNum('#totalWorkouts',  allWorkouts.length);
        Utils.animNum('#totalCalories',
            Math.round(allWorkouts.reduce((s, w) => s + (parseFloat(w.caloriesBurned) || 0), 0))
        );
        Utils.animNum('#totalDuration',
            allWorkouts.reduce((s, w) => s + (parseInt(w.duration) || 0), 0)
        );
        Utils.animNum('#currentStreak', Utils.calcStreak(allWorkouts));

        // ✅ HIỆU ỨNG: .fadeIn() cho stat cards
        $('#statsCards .stat-card').hide().each(function (i) {
            $(this).delay(i * 120).fadeIn(500);   // ✅ .hide() + .fadeIn()
        });
    }

    /* ================================================
       WORKOUT LIST - Render Cards
    ================================================ */
    function renderWorkoutList() {
        // ✅ jQuery Selector: $('#workoutList')
        const $list  = $('#workoutList');
        const $empty = $('#emptyState');

        // ✅ DOM: .html() để clear
        $list.html('');

        if (filtered.length === 0) {
            // ✅ HIỆU ỨNG 2: .slideDown()
            $empty.slideDown(400);
            return;
        }

        // ✅ HIỆU ỨNG: .slideUp() ẩn empty state
        $empty.slideUp(200);

        filtered.forEach((workout, idx) => {
            const $card = buildWorkoutCard(workout, idx);
            // ✅ DOM: .append()
            $list.append($card);
        });
    }

    function buildWorkoutCard(w, idx) {
        const color   = Utils.muscleColor(w.muscleGroup);
        const icon    = Utils.muscleIcon(w.muscleGroup);
        const relTime = Utils.relativeTime(w.date);

        // Tạo jQuery object
        const $col = $('<div>').addClass('col-lg-4 col-md-6');
        const $card = $('<div>').addClass('workout-card card h-100');

        // ✅ DOM: .attr() gắn data-id
        $card.attr('data-id', w.id);
        $card.attr('data-workout', JSON.stringify(w));

        // Header
        const $header = $('<div>')
            .addClass('card-header text-white d-flex justify-content-between align-items-center')
            .css('background', color);

        // ✅ DOM: .html()
        $header.html(`
            <h6 class="mb-0 fw-bold">
                <i class="bi ${icon} me-2"></i>${w.name || 'Buổi Tập'}
            </h6>
            <span class="badge bg-white text-dark">${relTime}</span>
        `);

        // Body
        const exerciseCount = w.exercises
            ? w.exercises.split(',').length : 0;

        const $body = $('<div>').addClass('card-body');
        $body.html(`
            <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="muscle-badge">
                    <i class="bi ${icon}"></i> ${w.muscleGroup || 'N/A'}
                </span>
                <small class="text-muted">${Utils.formatDate(w.date)}</small>
            </div>
            ${w.notes ? `<p class="text-muted small text-truncate-2 mb-2">
                <i class="bi bi-chat-text me-1"></i>${w.notes}</p>` : ''}
            <div class="workout-meta">
                <div class="workout-meta-item">
                    <i class="bi bi-stopwatch text-primary"></i>
                    <span>${w.duration || 0} phút</span>
                </div>
                <div class="workout-meta-item">
                    <i class="bi bi-fire text-danger"></i>
                    <span>${Utils.fmtNum(w.caloriesBurned || 0)} cal</span>
                </div>
                ${exerciseCount ? `<div class="workout-meta-item">
                    <i class="bi bi-list-check text-success"></i>
                    <span>${exerciseCount} bài</span>
                </div>` : ''}
            </div>
            <button class="btn btn-sm btn-outline-primary w-100 mt-3 btn-view-detail">
                <i class="bi bi-eye me-1"></i>Xem Chi Tiết
            </button>
        `);

        $card.append($header, $body);
        $col.append($card);

        // Animation delay
        $col.css({ opacity: 0, transform: 'translateY(20px)' });
        setTimeout(() => {
            // ✅ HIỆU ỨNG: animate opacity (jQuery)
            $col.animate({ opacity: 1 }, 400);
            $col.css('transform', 'translateY(0)');
        }, idx * 80);

        return $col;
    }

    /* ================================================
       ✅ SỰ KIỆN 1: Click xem chi tiết workout
       Dùng .on() với event delegation
    ================================================ */
    $('#workoutList').on('click', '.btn-view-detail', function () {
        // ✅ jQuery Selector: $(this), .closest()
        const $card   = $(this).closest('.workout-card');
        // ✅ DOM: .attr() đọc data
        const workout = JSON.parse($card.attr('data-workout'));
        showWorkoutModal(workout);
    });

    /* ---- Click vào card cũng mở modal ---- */
    $('#workoutList').on('click', '.workout-card', function (e) {
        if ($(e.target).hasClass('btn-view-detail') ||
            $(e.target).closest('.btn-view-detail').length) return;
        const workout = JSON.parse($(this).attr('data-workout'));
        showWorkoutModal(workout);
    });

    function showWorkoutModal(w) {
        const color = Utils.muscleColor(w.muscleGroup);
        const icon  = Utils.muscleIcon(w.muscleGroup);

        const exerciseHtml = w.exercises
            ? w.exercises.split(',').map(e =>
                `<span class="badge bg-light text-dark border me-1 mb-1 p-2">
                    <i class="bi bi-check2 text-success me-1"></i>${e.trim()}
                </span>`).join('')
            : '<span class="text-muted fst-italic">Không có thông tin</span>';

        // ✅ DOM: .html() cập nhật modal body
        $('#workoutDetailBody').html(`
            <div class="row g-3">
                <div class="col-md-6">
                    <div class="detail-item">
                        <label class="text-muted small">Tên Buổi Tập</label>
                        <h5 class="mt-1">
                            <i class="bi ${icon} me-2" style="color:${color}"></i>${w.name}
                        </h5>
                    </div>
                    <div class="detail-item mt-3">
                        <label class="text-muted small">Ngày Tập</label>
                        <p class="fw-semibold mt-1">
                            <i class="bi bi-calendar me-2"></i>${Utils.formatDate(w.date)}
                        </p>
                    </div>
                    <div class="detail-item mt-3">
                        <label class="text-muted small">Nhóm Cơ</label>
                        <p class="mt-1">
                            <span class="muscle-badge" style="background:${color}">
                                <i class="bi ${icon}"></i> ${w.muscleGroup}
                            </span>
                        </p>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="detail-item">
                        <label class="text-muted small">Thời Gian</label>
                        <p class="fw-semibold mt-1">
                            <i class="bi bi-stopwatch text-primary me-2"></i>${w.duration} phút
                        </p>
                    </div>
                    <div class="detail-item mt-3">
                        <label class="text-muted small">Calo Tiêu Hao</label>
                        <p class="fw-semibold mt-1">
                            <i class="bi bi-fire text-danger me-2"></i>
                            ${Utils.fmtNum(w.caloriesBurned)} kcal
                        </p>
                    </div>
                </div>
                <div class="col-12">
                    <label class="text-muted small">Danh Sách Bài Tập</label>
                    <div class="mt-1">${exerciseHtml}</div>
                </div>
                ${w.notes ? `
                <div class="col-12">
                    <label class="text-muted small">Ghi Chú</label>
                    <div class="p-3 bg-light rounded-3 mt-1">
                        <i class="bi bi-chat-text me-2 text-muted"></i>${w.notes}
                    </div>
                </div>` : ''}
            </div>
        `);

        new bootstrap.Modal('#workoutDetailModal').show();
    }

    /* ================================================
       ✅ SỰ KIỆN 2: Filter - .on('click')
    ================================================ */
    $('#btnFilter').on('click', function () {
        applyFilters();
    });

    // ✅ SỰ KIỆN 3: Reset filter - .click()
    $('#btnResetFilter').click(function () {
        // ✅ DOM: .val() reset các input
        $('#filterMuscleGroup').val('');
        $('#filterDateFrom').val('');
        $('#filterDateTo').val('');
        $('#filterSearch').val('');

        filtered = [...allWorkouts];

        // ✅ HIỆU ỨNG: .fadeOut() + .fadeIn() khi refresh list
        $('#workoutList').fadeOut(200, function () {
            renderWorkoutList();
            $(this).fadeIn(400);  // ✅ HIỆU ỨNG: .fadeIn()
        });
    });

    // ✅ SỰ KIỆN 4: Realtime search - .on('input')
    $('#filterSearch').on('input', Utils.debounce(function () {
        applyFilters();
    }, 350));

    // ✅ SỰ KIỆN 5: Filter select thay đổi - .on('change')
    $('#filterMuscleGroup').on('change', function () {
        applyFilters();
    });

    function applyFilters() {
        // ✅ DOM: .val() đọc giá trị input
        const muscle  = $('#filterMuscleGroup').val();
        const from    = $('#filterDateFrom').val();
        const to      = $('#filterDateTo').val();
        const keyword = $('#filterSearch').val().toLowerCase().trim();

        filtered = allWorkouts.filter(w => {
            if (muscle && w.muscleGroup !== muscle) return false;

            const wDate = new Date(w.date);
            if (from && wDate < new Date(from)) return false;
            if (to) {
                const toD = new Date(to);
                toD.setHours(23, 59, 59);
                if (wDate > toD) return false;
            }

            if (keyword) {
                const haystack = [w.name, w.notes, w.exercises]
                    .join(' ').toLowerCase();
                if (!haystack.includes(keyword)) return false;
            }
            return true;
        });

        // Hiển thị số kết quả
        // ✅ DOM: .html()
        $('#filterResultCount').html(
            filtered.length > 0
                ? `<span class="badge bg-primary">${filtered.length} kết quả</span>`
                : `<span class="badge bg-secondary">0 kết quả</span>`
        );

        // ✅ HIỆU ỨNG: .fadeOut() → render → .fadeIn()
        $('#workoutList').fadeOut(150, function () {
            renderWorkoutList();
            $('#workoutList').fadeIn(350);
        });
    }

    /* ================================================
       PROGRESS CHARTS (CSS/jQuery)
    ================================================ */
    function renderCharts() {
        renderBarChart(
            '#caloriesChart',
            Utils.groupByWeek(allWorkouts, 'caloriesBurned'),
            'bar-calories',
            (v) => Math.round(v) + ''
        );
        renderBarChart(
            '#durationChart',
            Utils.groupByWeek(allWorkouts, 'duration'),
            'bar-duration',
            (v) => Math.round(v) + 'm'
        );
        renderHBarChart();
        renderWeeklyGrid();
    }

    // ---- CSS Bar Chart ----
    function renderBarChart($selector, data, barClass, labelFn) {
        const maxVal = Math.max(...data.map(d => d.value), 1);
        const $c     = $($selector);  // ✅ jQuery Selector

        // ✅ DOM: .html()
        $c.html('<div class="bar-chart"></div>');
        const $chart = $c.find('.bar-chart');

        data.forEach(item => {
            const h  = Math.max((item.value / maxVal) * 200, item.value > 0 ? 6 : 2);
            const $w = $('<div>').addClass('bar-wrapper');

            $w.html(`
                <div class="bar-value">${labelFn(item.value)}</div>
                <div class="bar ${barClass}" style="height:2px"
                     data-h="${h}"></div>
                <div class="bar-label">${item.label}</div>
            `);

            // ✅ DOM: .append()
            $chart.append($w);
        });

        // Animate bars sau khi render
        setTimeout(() => {
            // ✅ jQuery Selector: .bar
            $c.find('.bar').each(function () {
                const h = $(this).data('h');    // ✅ .data()
                $(this).animate({ height: h }, 800);   // ✅ .animate()
            });
        }, 300);
    }

    // ---- Horizontal Bar Chart ----
    function renderHBarChart() {
        const data   = Utils.groupByMuscle(allWorkouts);
        const maxCnt = Math.max(...data.map(d => d.count), 1);
        const $c     = $('#muscleGroupChart');   // ✅ jQuery Selector

        if (!data.length) {
            $c.html('<p class="text-center text-muted py-3">Chưa có dữ liệu</p>');
            return;
        }

        const $wrap = $('<div>').addClass('h-bar-chart');

        data.forEach(item => {
            const pct   = (item.count / maxCnt) * 100;
            const color = Utils.muscleColor(item.name);

            const $row  = $('<div>').addClass('h-bar-item');
            const $fill = $('<div>')
                .addClass('h-bar-fill')
                .css({ width: '0%', background: color })
                .text(item.count);

            $row.html(`<div class="h-bar-label">${item.name}</div>`);
            const $track = $('<div>').addClass('h-bar-track').append($fill);
            $row.append($track);

            // ✅ DOM: .append()
            $wrap.append($row);
        });

        // ✅ DOM: .html() + .append()
        $c.html('').append($wrap);

        // Animate sau render
        setTimeout(() => {
            $c.find('.h-bar-fill').each(function (i) {
                const pct = (data[i].count / maxCnt) * 100;
                $(this).animate({ width: pct + '%' }, 900);  // ✅ .animate()
            });
        }, 400);
    }

    // ---- Weekly Activity Grid ----
    function renderWeeklyGrid() {
        const data   = Utils.groupByDayOfWeek(allWorkouts);
        const maxCnt = Math.max(...data.map(d => d.count), 1);
        const $c     = $('#weeklyActivityChart');  // ✅ jQuery Selector

        const $grid = $('<div>').addClass('weekly-grid');

        data.forEach(item => {
            let level = 0;
            if (item.count > 0)                      level = 1;
            if (item.count >= maxCnt * 0.25)         level = 1;
            if (item.count >= maxCnt * 0.5)          level = 2;
            if (item.count >= maxCnt * 0.75)         level = 3;
            if (item.count >= maxCnt)                level = 4;

            const $cell = $('<div>')
                .addClass(`day-cell level-${level}`)
                .attr('title', `${item.name}: ${item.count} buổi`)  // ✅ .attr()
                .html(`
                    <div class="day-name">${item.name}</div>
                    <div class="day-count">${item.count}</div>
                `);

            // ✅ SỰ KIỆN 6: Tooltip hover cho day cell
            $cell.on('mouseenter', function () {
                $(this).find('.day-count')
                    .animate({ opacity: 0.6 }, 100)
                    .animate({ opacity: 1 }, 100);
            });

            // ✅ DOM: .append()
            $grid.append($cell);
        });

        // Legend
        const $legend = $('<div>').addClass('d-flex justify-content-center align-items-center gap-2 mt-3');
        $legend.html(`
            <small class="text-muted">Ít</small>
            ${['#F0F2F8','#D5F5E3','#ABEBC6','#82E0AA','#58D68D'].map(c =>
                `<div style="width:14px;height:14px;border-radius:3px;background:${c}"></div>`
            ).join('')}
            <small class="text-muted">Nhiều</small>
        `);

        $c.html('').append($grid, $legend);
    }

    /* ================================================
       EXERCISE LIBRARY
    ================================================ */
    function renderExerciseLibrary() {
        const $c = $('#exercisesList');   // ✅ jQuery Selector
        $c.html('');

        if (!allExercises.length) {
            $c.html(`
                <div class="col-12 text-center py-4">
                    <i class="bi bi-inbox display-4 text-muted"></i>
                    <p class="text-muted mt-2">Chưa có bài tập nào</p>
                </div>
            `);
            return;
        }

        // Tìm kiếm exercise
        renderExerciseCards(allExercises);
    }

    function renderExerciseCards(list) {
        const $c = $('#exercisesList');
        $c.html('');

        list.forEach((ex, i) => {
            const color   = Utils.muscleColor(ex.muscleGroup);
            const icon    = Utils.muscleIcon(ex.muscleGroup);
            const totalCal = Utils.calcCalories(ex.sets, ex.caloriesPerSet);

            const $col  = $('<div>').addClass('col-lg-3 col-md-4 col-sm-6');
            const $card = $('<div>').addClass('exercise-card card p-3');

            $card.html(`
                <div class="d-flex align-items-start gap-3">
                    <div class="exercise-icon" style="background:${color}">
                        <i class="bi ${icon}"></i>
                    </div>
                    <div class="flex-grow-1">
                        <h6 class="fw-bold mb-1">${ex.name}</h6>
                        <span class="muscle-badge mb-2" style="font-size:.7rem;padding:2px 8px;background:${color}">
                            ${ex.muscleGroup}
                        </span>
                        <div class="mt-2">
                            <small class="text-muted d-block">
                                <i class="bi bi-layers me-1"></i>
                                ${ex.sets || 0} sets × ${ex.reps || 0} reps
                            </small>
                            ${ex.weight ? `
                            <small class="text-muted d-block">
                                <i class="bi bi-box me-1"></i>${ex.weight} kg
                            </small>` : ''}
                            <small class="text-danger d-block fw-semibold">
                                <i class="bi bi-fire me-1"></i>${totalCal} cal/bài
                            </small>
                        </div>
                    </div>
                </div>
            `);

            $col.append($card);

            // ✅ HIỆU ỨNG: ẩn trước rồi fadeIn
            $col.hide();
            $c.append($col);
            $col.delay(i * 60).fadeIn(400);  // ✅ .hide() + .fadeIn()
        });
    }

    /* ================================================
       ✅ SỰ KIỆN 7: Tìm kiếm Exercise - .on('input')
    ================================================ */
    $('#exerciseSearch').on('input', Utils.debounce(function () {
        const kw = $(this).val().toLowerCase().trim();   // ✅ .val()
        if (!kw) {
            renderExerciseCards(allExercises);
            return;
        }
        const result = allExercises.filter(ex =>
            ex.name.toLowerCase().includes(kw) ||
            (ex.muscleGroup || '').toLowerCase().includes(kw)
        );
        renderExerciseCards(result);
    }, 300));

    /* ================================================
       ⭐ CALORIE CALCULATOR (JS)
       ✅ YÊU CẦU: tính tổng calo bằng JS
    ================================================ */
    let rowCount = 0;

    function initCalculator() {
        addCalcRow();  // Thêm 1 row mặc định
    }

    // ✅ SỰ KIỆN 8: Click thêm row - .on('click')
    $('#btnAddExerciseRow').on('click', function () {
        addCalcRow();
        // ✅ HIỆU ỨNG: scroll đến row mới
        $('html, body').animate({
            scrollTop: $('#calcExerciseList').height() + 200
        }, 300);
    });

    function addCalcRow() {
        rowCount++;
        const id = rowCount;

        const exerciseOptions = allExercises
            .map(e => `<option value="${e.id}"
                data-cal="${e.caloriesPerSet || 0}"
                data-sets="${e.sets || 0}"
                data-name="${e.name}">
                ${e.name} — ${e.muscleGroup}
            </option>`)
            .join('');

        const $row = $('<div>')
            .addClass('calc-exercise-row')
            .attr('id', `calcRow${id}`);   // ✅ DOM: .attr()

        // ✅ DOM: .html()
        $row.html(`
            <div class="flex-grow-1">
                <select class="form-select calc-ex-select" data-row="${id}">
                    <option value="">-- Chọn bài tập --</option>
                    ${exerciseOptions}
                </select>
            </div>
            <div style="width:90px">
                <input type="number" class="form-control calc-sets text-center"
                       placeholder="Sets" min="1" data-row="${id}">
            </div>
            <div style="width:110px">
                <input type="number" class="form-control calc-cps text-center"
                       placeholder="Cal/set" min="0" data-row="${id}" readonly>
            </div>
            <div style="width:100px">
                <input type="number" class="form-control calc-total text-center fw-bold text-danger"
                       placeholder="Total" readonly data-row="${id}">
            </div>
            <button class="btn btn-outline-danger btn-sm btn-rm" data-row="${id}">
                <i class="bi bi-x-lg"></i>
            </button>
        `);

        // ✅ HIỆU ỨNG: slideDown khi thêm row
        $row.hide();
        // ✅ DOM: .append()
        $('#calcExerciseList').append($row);
        $row.slideDown(300);   // ✅ HIỆU ỨNG: .slideDown()
    }

    // ✅ SỰ KIỆN 9: Xóa row - event delegation .on()
    $('#calcExerciseList').on('click', '.btn-rm', function () {
        const $row = $(this).closest('.calc-exercise-row');

        // ✅ HIỆU ỨNG: slideUp khi xóa
        $row.slideUp(250, function () {   // ✅ HIỆU ỨNG: .slideUp()
            $(this).remove();
            recalcTotal();
        });
    });

    // ✅ SỰ KIỆN 10: Chọn exercise - auto fill
    $('#calcExerciseList').on('change', '.calc-ex-select', function () {
        const row    = $(this).data('row');
        const $opt   = $(this).find(':selected');     // ✅ jQuery Selector
        const cal    = parseFloat($opt.data('cal')) || 0;
        const defSet = parseInt($opt.data('sets'))  || 0;

        // ✅ DOM: .val() để set giá trị
        $(`.calc-cps[data-row="${row}"]`).val(cal);
        if (defSet) $(`.calc-sets[data-row="${row}"]`).val(defSet);

        calcRowTotal(row);
    });

    // ✅ SỰ KIỆN 11: Nhập sets → tính lại
    $('#calcExerciseList').on('input', '.calc-sets', function () {
        const row = $(this).data('row');
        calcRowTotal(row);
    });

    function calcRowTotal(row) {
        // ✅ DOM: .val() đọc
        const sets = parseInt($(`.calc-sets[data-row="${row}"]`).val()) || 0;
        const cps  = parseFloat($(`.calc-cps[data-row="${row}"]`).val()) || 0;
        const tot  = sets * cps;

        // ✅ DOM: .val() ghi
        $(`.calc-total[data-row="${row}"]`).val(tot);
        recalcTotal();
    }

    // ✅ SỰ KIỆN 12: Nhấn "Tính Calo"
    $('#btnCalculateCalories').on('click', function () {
        recalcTotal(true);  // true = hiệu ứng
    });

    // ⭐ TÍNH TỔNG CALO BẰNG JS
    function recalcTotal(withEffect = false) {
        let total = 0;

        // ✅ jQuery Selector: '.calc-total'
        $('.calc-total').each(function () {
            total += parseFloat($(this).val()) || 0;
        });

        const $result = $('#totalCalcResult');   // ✅ jQuery Selector

        if (withEffect) {
            // ✅ HIỆU ỨNG: animate số
            const from = parseInt($result.text().replace(/\D/g, '')) || 0;
            $({ val: from }).animate({ val: total }, {
                duration: 600,
                step: function () {
                    // ✅ DOM: .text()
                    $result.text(Utils.fmtNum(Math.round(this.val)));
                },
                complete: function () {
                    $result.text(Utils.fmtNum(Math.round(total)));
                }
            });

            // ✅ HIỆU ỨNG: highlight kết quả
            $result.closest('.result-box')
                .addClass('highlight-pulse')
                .delay(600)
                .queue(function () {
                    $(this).removeClass('highlight-pulse').dequeue();
                });
        } else {
            $result.text(Utils.fmtNum(Math.round(total)));
        }
    }

    // ✅ SỰ KIỆN 13: Reset Calculator - .click()
    $('#btnResetCalc').click(function () {
        // ✅ HIỆU ỨNG: fadeOut rồi reset
        $('#calcExerciseList').fadeOut(200, function () {
            $(this).html('');           // ✅ DOM: .html()
            $('#totalCalcResult').text('0');
            rowCount = 0;
            addCalcRow();
            $(this).fadeIn(300);        // ✅ HIỆU ỨNG: .fadeIn()
        });
    });

    /* ================================================
       ✅ SỰ KIỆN 14: Smooth scroll cho nav links
    ================================================ */
    $('a[href^="#"]').on('click', function (e) {
        e.preventDefault();
        const target = $(this.getAttribute('href'));   // ✅ jQuery Selector
        if (target.length) {
            $('html, body').animate({
                scrollTop: target.offset().top - 80
            }, 500);
        }
    });

    /* ================================================
       ✅ SỰ KIỆN 15: Navbar scroll effect
    ================================================ */
    $(window).on('scroll', function () {
        const $nav = $('.navbar');                     // ✅ jQuery Selector
        if ($(this).scrollTop() > 80) {
            // ✅ DOM: .attr() thêm class
            $nav.addClass('navbar-scrolled');
        } else {
            $nav.removeClass('navbar-scrolled');
        }
    });

    /* ================================================
       HELPERS
    ================================================ */
    function showLoading(show) {
        if (show) {
            $('#loadingSpinner').removeClass('d-none').hide().fadeIn(200);
        } else {
            $('#loadingSpinner').fadeOut(300, function () {
                $(this).addClass('d-none');
            });
        }
    }

}); // end $(document).ready