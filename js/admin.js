/**
 * 🏋️ FitTrack - admin.js
 *
 * ✅ jQuery Selector  : $('selector')
 * ✅ Sự kiện jQuery   : .on(), .click()
 * ✅ Hiệu ứng jQuery  : .fadeIn(), .slideDown(), .slideUp()
 * ✅ jQuery AJAX      : qua API module ($.ajax)
 * ✅ DOM jQuery       : .append(), .html(), .val(), .attr(), .text()
 */

$(document).ready(function () {

    /* ================================================
       STATE
    ================================================ */
    let workouts  = [];
    let exercises = [];
    let deleteCtx = { type: '', id: '' };

    /* ================================================
       INIT
    ================================================ */
    init();

    async function init() {
        setBtnLoading('#adminLoadingBar', true);
        try {
            // ✅ YÊU CẦU 4: $.ajax() qua API module
            await Promise.all([fetchWorkouts(), fetchExercises()]);
            updateStats();
        } catch (e) {
            Utils.toast('Lỗi', 'Không thể tải dữ liệu từ API!', 'error');
        }
        setBtnLoading('#adminLoadingBar', false);
    }

    /* ================================================
       FETCH DATA
    ================================================ */
    async function fetchWorkouts() {
        showTbLoading('workout', true);
        try {
            workouts = await API.workouts.getAll();    // ✅ $.ajax bên trong
            workouts.sort((a, b) => new Date(b.date) - new Date(a.date));
            renderWorkoutTable();
        } catch (e) {
            workouts = [];
            console.error(e);
        }
        showTbLoading('workout', false);
    }

    async function fetchExercises() {
        showTbLoading('exercise', true);
        try {
            exercises = await API.exercises.getAll();  // ✅ $.ajax bên trong
            renderExerciseTable();
        } catch (e) {
            exercises = [];
        }
        showTbLoading('exercise', false);
    }

    /* ================================================
       STATS
    ================================================ */
    function updateStats() {
        const totalCal = workouts.reduce((s, w) =>
            s + (parseFloat(w.caloriesBurned) || 0), 0);
        const totalMin = workouts.reduce((s, w) =>
            s + (parseInt(w.duration) || 0), 0);

        // ✅ DOM: .text()
        $('#adminTotalWorkouts').text(workouts.length);
        $('#adminTotalExercises').text(exercises.length);
        $('#adminTotalCal').text(Utils.fmtNum(Math.round(totalCal)));
        $('#adminTotalMin').text(Utils.fmtNum(totalMin));

        // ✅ HIỆU ỨNG: bounce stat numbers
        $('.admin-stat-number').addClass('bounce-in');
        setTimeout(() => $('.admin-stat-number').removeClass('bounce-in'), 600);
    }

    /* ================================================
       WORKOUT TABLE
    ================================================ */
    function renderWorkoutTable() {
        // ✅ jQuery Selector
        const $tbody = $('#workoutTableBody');

        if (!workouts.length) {
            // ✅ DOM: .html()
            $tbody.html(`
                <tr>
                    <td colspan="8" class="text-center py-5 text-muted">
                        <i class="bi bi-inbox display-5 d-block mb-2"></i>
                        Chưa có buổi tập nào
                    </td>
                </tr>
            `);
            return;
        }

        $tbody.html('');

        workouts.forEach((w, i) => {
            const color = Utils.muscleColor(w.muscleGroup);
            const icon  = Utils.muscleIcon(w.muscleGroup);

            const $tr = $('<tr>');
            // ✅ DOM: .attr() gắn data-id
            $tr.attr('data-id', w.id);

            $tr.html(`
                <td class="fw-semibold text-muted">${i + 1}</td>
                <td>
                    <div class="fw-bold">${w.name || 'N/A'}</div>
                    ${w.exercises
                        ? `<small class="text-muted">${Utils.truncate(w.exercises, 35)}</small>`
                        : ''}
                </td>
                <td>
                    <div class="fw-semibold">${Utils.formatDate(w.date)}</div>
                    <small class="text-muted">${Utils.relativeTime(w.date)}</small>
                </td>
                <td>
                    <span class="muscle-badge" style="background:${color}">
                        <i class="bi ${icon}"></i> ${w.muscleGroup || 'N/A'}
                    </span>
                </td>
                <td>
                    <i class="bi bi-stopwatch text-primary me-1"></i>${w.duration || 0} phút
                </td>
                <td>
                    <span class="fw-semibold text-danger">
                        <i class="bi bi-fire me-1"></i>${Utils.fmtNum(w.caloriesBurned || 0)}
                    </span>
                </td>
                <td>
                    <span class="notes-preview" title="${w.notes || ''}">
                        ${Utils.truncate(w.notes, 30) || '<span class="text-muted">—</span>'}
                    </span>
                </td>
                <td class="text-center">
                    <button class="btn-action btn-edit btn-edit-workout"
                            data-id="${w.id}" title="Sửa">
                        <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button class="btn-action btn-delete btn-del-workout"
                            data-id="${w.id}"
                            data-name="${(w.name || '').replace(/"/g, '&quot;')}"
                            title="Xóa">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                </td>
            `);

            // ✅ HIỆU ỨNG: fade in từng row
            $tr.hide();
            // ✅ DOM: .append()
            $tbody.append($tr);
            $tr.delay(i * 60).fadeIn(350);    // ✅ .hide() + .fadeIn()
        });
    }

    /* ================================================
       EXERCISE TABLE
    ================================================ */
    function renderExerciseTable() {
        const $tbody = $('#exerciseTableBody');    // ✅ jQuery Selector

        if (!exercises.length) {
            $tbody.html(`
                <tr>
                    <td colspan="8" class="text-center py-5 text-muted">
                        <i class="bi bi-inbox display-5 d-block mb-2"></i>
                        Chưa có bài tập nào
                    </td>
                </tr>
            `);
            return;
        }

        $tbody.html('');

        exercises.forEach((ex, i) => {
            const color   = Utils.muscleColor(ex.muscleGroup);
            const icon    = Utils.muscleIcon(ex.muscleGroup);
            const totalCal = Utils.calcCalories(ex.sets, ex.caloriesPerSet);

            const $tr = $('<tr>').attr('data-id', ex.id);   // ✅ .attr()
            $tr.html(`
                <td class="fw-semibold text-muted">${i + 1}</td>
                <td class="fw-bold">${ex.name || 'N/A'}</td>
                <td>
                    <span class="muscle-badge" style="background:${color}">
                        <i class="bi ${icon}"></i> ${ex.muscleGroup || 'N/A'}
                    </span>
                </td>
                <td class="text-center">${ex.sets || 0}</td>
                <td class="text-center">${ex.reps || 0}</td>
                <td class="text-center">${ex.weight ? ex.weight + ' kg' : '—'}</td>
                <td class="text-center">
                    <span class="text-danger fw-bold">${ex.caloriesPerSet || 0}</span>
                    <small class="text-muted d-block">(${totalCal} total)</small>
                </td>
                <td class="text-center">
                    <button class="btn-action btn-edit btn-edit-exercise"
                            data-id="${ex.id}" title="Sửa">
                        <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button class="btn-action btn-delete btn-del-exercise"
                            data-id="${ex.id}"
                            data-name="${(ex.name || '').replace(/"/g, '&quot;')}"
                            title="Xóa">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                </td>
            `);

            $tr.hide();
            $tbody.append($tr);
            $tr.delay(i * 60).fadeIn(350);   // ✅ .fadeIn()
        });
    }

    /* ================================================
       ✅ SỰ KIỆN 1: Thêm Workout - .on('click')
    ================================================ */
    $('#btnAddWorkout').on('click', function () {
        resetWorkoutForm();
        // ✅ DOM: .html()
        $('#workoutFormTitle').html(
            '<i class="bi bi-plus-circle me-2 text-primary"></i>Thêm Buổi Tập Mới'
        );
        // ✅ DOM: .val()
        $('#workoutDate').val(new Date().toISOString().split('T')[0]);

        // ✅ HIỆU ỨNG: slideDown form
        $('#workoutFormCollapse').slideDown(350);  // ✅ .slideDown()

        // Scroll tới form
        $('html,body').animate({
            scrollTop: $('#workoutFormCollapse').offset().top - 90
        }, 400);
    });

    // ✅ SỰ KIỆN 2: Hủy form Workout - .click()
    $('#btnCancelWorkout').click(function () {
        // ✅ HIỆU ỨNG: slideUp ẩn form
        $('#workoutFormCollapse').slideUp(300);    // ✅ .slideUp()
        resetWorkoutForm();
    });

    /* ================================================
       ✅ SỰ KIỆN 3: Submit form Workout - .on('submit')
    ================================================ */
    $('#workoutForm').on('submit', async function (e) {
        e.preventDefault();

        // ✅ DOM: .val() đọc input
        const id   = $('#workoutId').val();
        const data = {
            name:           $('#workoutName').val().trim(),
            date:           $('#workoutDate').val(),
            duration:       parseInt($('#workoutDuration').val()) || 0,
            muscleGroup:    $('#workoutMuscleGroup').val(),
            caloriesBurned: parseInt($('#workoutCalories').val()) || 0,
            exercises:      $('#workoutExercises').val().trim(),
            notes:          $('#workoutNotes').val().trim()
        };

        const chk = Utils.validate({
            'Tên buổi tập': data.name,
            'Ngày tập':     data.date,
            'Nhóm cơ':      data.muscleGroup
        });
        if (!chk.ok) { Utils.toast('Lỗi', chk.msg, 'error'); return; }

        // ✅ DOM: .attr() disable button
        const $btn = $('#btnSaveWorkout');
        $btn.prop('disabled', true)
            .html('<span class="spinner-border spinner-border-sm me-1"></span>Đang lưu...');

        try {
            if (id) {
                await API.workouts.update(id, data);
                Utils.toast('Thành Công', `Đã cập nhật "${data.name}"`, 'success');
            } else {
                await API.workouts.create(data);
                Utils.toast('Thành Công', `Đã thêm "${data.name}"`, 'success');
            }
            $('#workoutFormCollapse').slideUp(300);
            resetWorkoutForm();
            await fetchWorkouts();
            updateStats();
        } catch (err) {
            Utils.toast('Lỗi', 'Lưu thất bại. Kiểm tra kết nối!', 'error');
        }

        $btn.prop('disabled', false)
            .html('<i class="bi bi-check-lg me-1"></i>Lưu');
    });

    /* ================================================
       ✅ SỰ KIỆN 4: Click Edit Workout (delegation)
    ================================================ */
    $('#workoutTableBody').on('click', '.btn-edit-workout', function () {
        // ✅ DOM: .attr() đọc data-id
        const id      = $(this).attr('data-id');
        const workout = workouts.find(w => w.id == id);
        if (!workout) return;

        // ✅ DOM: .val() điền form
        $('#workoutId').val(workout.id);
        $('#workoutName').val(workout.name);
        $('#workoutDate').val(Utils.formatDateInput(workout.date));
        $('#workoutDuration').val(workout.duration);
        $('#workoutMuscleGroup').val(workout.muscleGroup);
        $('#workoutCalories').val(workout.caloriesBurned);
        $('#workoutExercises').val(workout.exercises);
        $('#workoutNotes').val(workout.notes);

        // ✅ DOM: .html()
        $('#workoutFormTitle').html(
            '<i class="bi bi-pencil me-2 text-warning"></i>Sửa Buổi Tập'
        );

        // ✅ HIỆU ỨNG: slideDown
        $('#workoutFormCollapse').slideDown(350);
        $('html,body').animate({
            scrollTop: $('#workoutFormCollapse').offset().top - 90
        }, 400);
    });

    /* ================================================
       ✅ SỰ KIỆN 5: Click Delete Workout
    ================================================ */
    $('#workoutTableBody').on('click', '.btn-del-workout', function () {
        deleteCtx = {
            type: 'workout',
            // ✅ DOM: .attr()
            id:   $(this).attr('data-id'),
            name: $(this).attr('data-name')
        };
        // ✅ DOM: .html()
        $('#deleteMessage').html(
            `Xóa buổi tập <strong>"${deleteCtx.name}"</strong>?<br>
            <small class="text-muted">Hành động này không thể hoàn tác.</small>`
        );
        new bootstrap.Modal('#deleteModal').show();
    });

    /* ================================================
       ✅ SỰ KIỆN 6: Thêm Exercise - .on('click')
    ================================================ */
    $('#btnAddExercise').on('click', function () {
        resetExerciseForm();
        $('#exerciseFormTitle').html(
            '<i class="bi bi-plus-circle me-2 text-success"></i>Thêm Bài Tập Mới'
        );
        // ✅ HIỆU ỨNG: slideDown
        $('#exerciseFormCollapse').slideDown(350);
        $('html,body').animate({
            scrollTop: $('#exerciseFormCollapse').offset().top - 90
        }, 400);
    });

    // ✅ SỰ KIỆN 7: Hủy Exercise form - .click()
    $('#btnCancelExercise').click(function () {
        // ✅ HIỆU ỨNG: slideUp
        $('#exerciseFormCollapse').slideUp(300);
        resetExerciseForm();
    });

    /* ================================================
       ✅ SỰ KIỆN 8: Submit Exercise form
    ================================================ */
    $('#exerciseForm').on('submit', async function (e) {
        e.preventDefault();

        // ✅ DOM: .val()
        const id   = $('#exerciseId').val();
        const data = {
            name:          $('#exerciseName').val().trim(),
            muscleGroup:   $('#exerciseMuscleGroup').val(),
            caloriesPerSet: parseFloat($('#exerciseCalPerSet').val()) || 0,
            sets:          parseInt($('#exerciseSets').val()) || 0,
            reps:          parseInt($('#exerciseReps').val()) || 0,
            weight:        parseFloat($('#exerciseWeight').val()) || 0
        };

        const chk = Utils.validate({
            'Tên bài tập': data.name,
            'Nhóm cơ':     data.muscleGroup
        });
        if (!chk.ok) { Utils.toast('Lỗi', chk.msg, 'error'); return; }

        const $btn = $('#btnSaveExercise');
        $btn.prop('disabled', true)
            .html('<span class="spinner-border spinner-border-sm me-1"></span>Đang lưu...');

        try {
            if (id) {
                await API.exercises.update(id, data);
                Utils.toast('Thành Công', `Đã cập nhật "${data.name}"`, 'success');
            } else {
                await API.exercises.create(data);
                Utils.toast('Thành Công', `Đã thêm "${data.name}"`, 'success');
            }
            $('#exerciseFormCollapse').slideUp(300);
            resetExerciseForm();
            await fetchExercises();
            updateStats();
        } catch (err) {
            Utils.toast('Lỗi', 'Lưu thất bại!', 'error');
        }

        $btn.prop('disabled', false)
            .html('<i class="bi bi-check-lg me-1"></i>Lưu');
    });

    /* ================================================
       ✅ SỰ KIỆN 9: Click Edit Exercise
    ================================================ */
    $('#exerciseTableBody').on('click', '.btn-edit-exercise', function () {
        const id = $(this).attr('data-id');         // ✅ .attr()
        const ex = exercises.find(e => e.id == id);
        if (!ex) return;

        // ✅ DOM: .val()
        $('#exerciseId').val(ex.id);
        $('#exerciseName').val(ex.name);
        $('#exerciseMuscleGroup').val(ex.muscleGroup);
        $('#exerciseCalPerSet').val(ex.caloriesPerSet);
        $('#exerciseSets').val(ex.sets);
        $('#exerciseReps').val(ex.reps);
        $('#exerciseWeight').val(ex.weight);

        $('#exerciseFormTitle').html(
            '<i class="bi bi-pencil me-2 text-warning"></i>Sửa Bài Tập'
        );

        // ✅ HIỆU ỨNG: slideDown
        $('#exerciseFormCollapse').slideDown(350);
        $('html,body').animate({
            scrollTop: $('#exerciseFormCollapse').offset().top - 90
        }, 400);
    });

    /* ================================================
       ✅ SỰ KIỆN 10: Click Delete Exercise
    ================================================ */
    $('#exerciseTableBody').on('click', '.btn-del-exercise', function () {
        deleteCtx = {
            type: 'exercise',
            id:   $(this).attr('data-id'),         // ✅ .attr()
            name: $(this).attr('data-name')
        };
        $('#deleteMessage').html(
            `Xóa bài tập <strong>"${deleteCtx.name}"</strong>?<br>
            <small class="text-muted">Hành động này không thể hoàn tác.</small>`
        );
        new bootstrap.Modal('#deleteModal').show();
    });

    /* ================================================
       ✅ SỰ KIỆN 11: Xác nhận xóa
    ================================================ */
    $('#btnConfirmDelete').on('click', async function () {
        const $btn = $(this);                        // ✅ jQuery Selector
        $btn.prop('disabled', true)
            .html('<span class="spinner-border spinner-border-sm me-1"></span>Xóa...');

        try {
            if (deleteCtx.type === 'workout') {
                await API.workouts.delete(deleteCtx.id);
                Utils.toast('Đã Xóa', `"${deleteCtx.name}" đã bị xóa`, 'success');
                await fetchWorkouts();
            } else {
                await API.exercises.delete(deleteCtx.id);
                Utils.toast('Đã Xóa', `"${deleteCtx.name}" đã bị xóa`, 'success');
                await fetchExercises();
            }
            updateStats();
            bootstrap.Modal.getInstance('#deleteModal')?.hide();
        } catch (err) {
            Utils.toast('Lỗi', 'Không thể xóa!', 'error');
        }

        $btn.prop('disabled', false)
            .html('<i class="bi bi-trash me-1"></i>Xóa');
        deleteCtx = { type: '', id: '' };
    });

    /* ================================================
       ✅ SỰ KIỆN 12: Search trong bảng - .on('input')
    ================================================ */
    $('#workoutTableSearch').on('input', Utils.debounce(function () {
        const kw = $(this).val().toLowerCase();    // ✅ .val()

        // ✅ jQuery Selector: lọc tbody rows
        $('#workoutTableBody tr').each(function () {
            const text = $(this).text().toLowerCase();
            // ✅ HIỆU ỨNG: .show() / .hide()
            if (text.includes(kw)) {
                $(this).show();                    // ✅ .show()
            } else {
                $(this).hide();                    // ✅ .hide()
            }
        });
    }, 300));

    $('#exerciseTableSearch').on('input', Utils.debounce(function () {
        const kw = $(this).val().toLowerCase();
        $('#exerciseTableBody tr').each(function () {
            const text = $(this).text().toLowerCase();
            $(this).toggle(text.includes(kw));     // ✅ .toggle()
        });
    }, 300));

    /* ================================================
       ✅ SỰ KIỆN 13: Tooltip cho action buttons
    ================================================ */
    $(document).on('mouseenter', '.btn-action', function () {
        $(this).addClass('shadow-sm');
    }).on('mouseleave', '.btn-action', function () {
        $(this).removeClass('shadow-sm');
    });

    /* ================================================
       RESET FORMS
    ================================================ */
    function resetWorkoutForm() {
        // ✅ DOM: .val('') reset
        $('#workoutId, #workoutName, #workoutDate, #workoutDuration')
            .val('');
        $('#workoutMuscleGroup, #workoutCalories, #workoutExercises, #workoutNotes')
            .val('');
    }

    function resetExerciseForm() {
        $('#exerciseId, #exerciseName, #exerciseMuscleGroup')
            .val('');
        $('#exerciseCalPerSet, #exerciseSets, #exerciseReps, #exerciseWeight')
            .val('');
    }

    /* ================================================
       HELPERS
    ================================================ */
    function showTbLoading(type, show) {
        const $loading = type === 'workout' ? $('#workoutLoading')  : $('#exerciseLoading');
        const $table   = type === 'workout' ? $('#workoutTable')    : $('#exerciseTable');

        if (show) {
            $table.hide();                    // ✅ .hide()
            $loading.removeClass('d-none').fadeIn(200);   // ✅ .fadeIn()
        } else {
            $loading.fadeOut(200, function () {
                $(this).addClass('d-none');
                $table.fadeIn(300);           // ✅ .fadeIn()
            });
        }
    }

    function setBtnLoading(selector, show) {
        const $el = $(selector);
        if (show) $el.removeClass('d-none').slideDown(200);
        else      $el.slideUp(200);
    }

}); // end $(document).ready