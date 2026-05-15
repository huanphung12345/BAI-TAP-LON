/**
 * 🏋️ FitTrack - API Module
 * ✅ Yêu cầu 4: jQuery AJAX $.ajax() gọi API
 */

const API = (() => {
    // ⚡ Thay URL này thành project MockAPI của bạn
    const BASE_URL = 'https://69e9c8b215c7e2d51268b6cb.mockapi.io/api/v1/';
    const BASE_URLL = 'https://6a06ddebc83ba8ad9b3e0758.mockapi.io/';

    const ENDPOINTS = {
        workouts:  `${BASE_URL}/workouts`,
        exercises: `${BASE_URL}/exercises`,
        users:     `${BASE_URLL}/users`
    };

    // =========================================
    // ✅ YÊU CẦU 4: jQuery AJAX $.ajax()
    // =========================================
    const request = (url, method = 'GET', data = null) => {
        return new Promise((resolve, reject) => {

            // Cấu hình $.ajax()
            const ajaxConfig = {
                url:         url,
                method:      method,
                dataType:    'json',
                contentType: 'application/json',

                // ✅ success callback
                success: function (response) {
                    resolve(response);
                },

                // ✅ error callback
                error: function (xhr, status, error) {
                    console.error(`[API ${method}] ${url} →`, error);
                    reject({
                        status:  xhr.status,
                        message: error,
                        detail:  xhr.responseText
                    });
                }
            };

            // Gắn body data nếu POST / PUT
            if (data && (method === 'POST' || method === 'PUT')) {
                ajaxConfig.data = JSON.stringify(data);
            }

            $.ajax(ajaxConfig);
        });
    };

    // ---- Workouts ----
    const Workouts = {
        getAll:  ()       => request(ENDPOINTS.workouts),
        getById: (id)     => request(`${ENDPOINTS.workouts}/${id}`),
        create:  (body)   => request(ENDPOINTS.workouts,         'POST', body),
        update:  (id, b)  => request(`${ENDPOINTS.workouts}/${id}`, 'PUT',  b),
        delete:  (id)     => request(`${ENDPOINTS.workouts}/${id}`, 'DELETE')
    };

    // ---- Exercises ----
    const Exercises = {
        getAll:  ()       => request(ENDPOINTS.exercises),
        getById: (id)     => request(`${ENDPOINTS.exercises}/${id}`),
        create:  (body)   => request(ENDPOINTS.exercises,          'POST', body),
        update:  (id, b)  => request(`${ENDPOINTS.exercises}/${id}`, 'PUT',  b),
        delete:  (id)     => request(`${ENDPOINTS.exercises}/${id}`, 'DELETE')
    };

    // Thêm vào trong API module (api.js)
// Sau ENDPOINTS.exercises

ENDPOINTS.users = `${BASE_URLL}/users`;

// Thêm vào return object:
const Users = {
    getAll:  ()      => request(ENDPOINTS.users),
    getById: (id)    => request(`${ENDPOINTS.users}/${id}`),
    create:  (body)  => request(ENDPOINTS.users,          'POST', body),
    update:  (id, b) => request(`${ENDPOINTS.users}/${id}`, 'PUT',  b),
    delete:  (id)    => request(`${ENDPOINTS.users}/${id}`, 'DELETE')
};

// return { workouts, exercises, users }

    return { workouts: Workouts, exercises: Exercises, users: Users };
})();