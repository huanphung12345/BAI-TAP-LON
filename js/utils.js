/**
 * 🏋️ FitTrack - Utils Module
 */

const Utils = (() => {

    /* ---------- Format ngày ---------- */
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const d = new Date(dateStr);
        if (isNaN(d)) return dateStr;
        return d.toLocaleDateString('vi-VN', {
            weekday: 'short', year: 'numeric',
            month: '2-digit', day: '2-digit'
        });
    };

    const formatDateInput = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return isNaN(d) ? dateStr : d.toISOString().split('T')[0];
    };

    const relativeTime = (dateStr) => {
        const diff = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
        if (diff === 0) return 'Hôm nay';
        if (diff === 1) return 'Hôm qua';
        if (diff < 7)  return `${diff} ngày trước`;
        if (diff < 30) return `${Math.floor(diff / 7)} tuần trước`;
        return `${Math.floor(diff / 30)} tháng trước`;
    };

    /* ---------- Tính calo ⭐ ---------- */
    const calcCalories = (sets, calPerSet) =>
        (parseInt(sets) || 0) * (parseFloat(calPerSet) || 0);

    const calcTotalCalories = (exercises = []) =>
        exercises.reduce((s, e) => s + calcCalories(e.sets, e.caloriesPerSet), 0);

    /* ---------- Streak ---------- */
    const calcStreak = (workouts) => {
        if (!workouts.length) return 0;
        const dates = [...new Set(
            workouts.map(w => new Date(w.date).toDateString())
        )].sort((a, b) => new Date(b) - new Date(a));

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < dates.length; i++) {
            const check = new Date(today);
            check.setDate(check.getDate() - i);
            if (dates.includes(check.toDateString())) streak++;
            else break;
        }
        return streak;
    };

    /* ---------- Nhóm theo tuần ---------- */
    const groupByWeek = (workouts, field) => {
        const result = [];
        for (let i = 7; i >= 0; i--) {
            const label = i === 0 ? 'Tuần này' : `T-${i}`;
            const fullLabel = i === 0 ? 'Tuần này' : `${i} tuần trước`;
            let val = 0;
            workouts.forEach(w => {
                const diff = Math.floor((Date.now() - new Date(w.date)) / 604800000);
                if (diff === i) val += parseFloat(w[field]) || 0;
            });
            result.push({ label, value: val });
        }
        return result;
    };

    /* ---------- Nhóm cơ ---------- */
    const groupByMuscle = (workouts) => {
        const map = {};
        workouts.forEach(w => {
            const g = w.muscleGroup || 'Khác';
            map[g] = (map[g] || 0) + 1;
        });
        return Object.entries(map)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
    };

    const groupByDayOfWeek = (workouts) => {
        const days = ['CN','T2','T3','T4','T5','T6','T7'];
        const counts = new Array(7).fill(0);
        workouts.forEach(w => {
            const d = new Date(w.date);
            if (!isNaN(d)) counts[d.getDay()]++;
        });
        return days.map((name, i) => ({ name, count: counts[i] }));
    };

    /* ---------- Màu & icon ---------- */
    const muscleColor = (group) => ({
        'Ngực':      '#E74C3C',
        'Lưng':      '#3498DB',
        'Vai':       '#9B59B6',
        'Tay trước': '#E67E22',
        'Tay sau':   '#D35400',
        'Chân':      '#27AE60',
        'Bụng':      '#F39C12',
        'Cardio':    '#1ABC9C',
        'Full Body': '#2C3E50'
    }[group] || '#6C63FF');

    const muscleIcon = (group) => ({
        'Ngực':      'bi-heart-pulse',
        'Lưng':      'bi-arrow-left-right',
        'Vai':       'bi-arrows-angle-expand',
        'Tay trước': 'bi-lightning',
        'Tay sau':   'bi-lightning-fill',
        'Chân':      'bi-person-walking',
        'Bụng':      'bi-shield-check',
        'Cardio':    'bi-activity',
        'Full Body': 'bi-person-arms-up'
    }[group] || 'bi-trophy');

    /* ---------- Format số ---------- */
    const fmtNum = (n) => Number(n || 0).toLocaleString('vi-VN');

    const truncate = (str, max = 50) =>
        str && str.length > max ? str.slice(0, max) + '...' : (str || '');

    /* ---------- Validate ---------- */
    const validate = (fields) => {
        for (const [k, v] of Object.entries(fields)) {
            if (!v || !String(v).trim()) {
                return { ok: false, msg: `"${k}" không được để trống` };
            }
        }
        return { ok: true };
    };

    /* ---------- Toast (Bootstrap) ---------- */
    const toast = (title, msg, type = 'success') => {
        const $t   = $('#toastNotification');
        const icons = {
            success: 'bi-check-circle-fill text-success',
            error:   'bi-x-circle-fill text-danger',
            warning: 'bi-exclamation-triangle-fill text-warning',
            info:    'bi-info-circle-fill text-primary'
        };
        // ✅ DOM: .html() .attr()
        $('#toastTitle').text(title);
        $('#toastBody').text(msg);
        $('#toastIcon').attr('class', `bi me-2 ${icons[type] || icons.info}`);
        new bootstrap.Toast($t[0], { delay: 3500 }).show();
    };

    /* ---------- Animate số ---------- */
    const animNum = (selector, target, duration = 900) => {
        const $el = $(selector);         // ✅ jQuery Selector
        const steps = 36;
        const inc   = target / steps;
        let cur = 0;
        const timer = setInterval(() => {
            cur += inc;
            if (cur >= target) { cur = target; clearInterval(timer); }
            $el.text(fmtNum(Math.round(cur)));  // ✅ DOM .text()
        }, duration / steps);
    };

    /* ---------- Debounce ---------- */
    const debounce = (fn, ms = 300) => {
        let t;
        return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
    };

    return {
        formatDate, formatDateInput, relativeTime,
        calcCalories, calcTotalCalories,
        calcStreak, groupByWeek, groupByMuscle, groupByDayOfWeek,
        muscleColor, muscleIcon,
        fmtNum, truncate, validate, toast, animNum, debounce
    };
})();