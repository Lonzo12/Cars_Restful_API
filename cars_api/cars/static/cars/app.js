// Function for viewing car details
    async function getCarDetails(carId) {
        try {
            const response = await fetch(`/api/cars/${carId}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',

            }
        });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const car = await response.json();

            //Display car details in the HTML
            const carDetailsDiv = document.getElementById('carDetails');
            carDetailsDiv.innerHTML = `
                <div class="modal-header">
                    <h5 class="modal-title">
                        ${car.brand} ${car.model}
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <ul class="col">
                            <li class="list-group-item"><strong>Year:</strong> ${car.year}</li>
                            <li class="list-group-item"><strong>Fuel type:</strong> ${car.fuel_type}</li>
                            <li class="list-group-item"><strong>Transmission type:</strong> ${car.transmission_type}</li>
                            <li class="list-group-item"><strong>Mileage:</strong> ${car.mileage} km</li>
                            <li class="list-group-item"><strong>Price:</strong> $${car.price}</li>
                        </ul>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                </div>
            `;
        } catch (error) {
            console.error('Error fetching car details:', error);
        }
    }

document.addEventListener('DOMContentLoaded', function() {
    const addCarForm = document.getElementById('addCarForm');
    const filterForm = document.getElementById('filterForm');
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const carsList = document.getElementById('carsList');
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    let accessToken = localStorage.getItem('access_token');
    let refreshToken = localStorage.getItem('refresh_token');
    let filterParams = '';

    // Function to register a new user
    if (registerForm) {
        registerForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const formData = {
                username: document.getElementById('id_username').value,
                email: document.getElementById('id_email').value,
                password1: document.getElementById('id_password1').value,
                password2: document.getElementById('id_password2').value,
            };

            fetch('/api/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify(formData),
            })
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        alert(data.error);
                    } else {
                        alert('Успешная Регистрация!');

                        // В случае успешной регистрации, можно перенаправить пользователя
                        window.location.href = '/api/login/';
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Ошибка регистрации');
                });
        });
    }

    // Function to login a user
    if (loginForm) {
        loginForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const formData = {
                username: document.getElementById('id_usernames').value,
                password: document.getElementById('id_password').value,
            };

            fetch('/api/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                body: JSON.stringify(formData),
            })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(data => {
                            throw new Error(data.error);
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.error) {
                        alert(data.error);
                    } else {
                        alert('Вы вошли успешно!');
                        accessToken = data.access;
                        refreshToken = data.refresh;
                        localStorage.setItem('access_token', accessToken);
                        localStorage.setItem('refresh_token', refreshToken);
                        // Перенаправляем пользователя на главную страницу после успешного логина
                        window.location.href = '/';
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Ошибка входа');
                });
        });
    }
    // Function to add a new car
    addCarForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Предотвращаем стандартное поведение формы

        const carData = {
            brand: document.getElementById('brand').value,
            model: document.getElementById('model').value,
            year: document.getElementById('year').value,
            fuel_type: document.getElementById('fuelType').value,
            transmission_type: document.getElementById('transmission').value,
            mileage: document.getElementById('mileage').value,
            price: document.getElementById('price').value,
        };

        fetch('/api/cars/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify(carData),
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    console.error('Error response:', data);
                    throw new Error(data.detail || 'Unknown error');
                });
            }
            return response.json();
        })
        .then(data => {
            alert('Автомобиль успешно добавлен!');
            addCarForm.reset();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Выполните вход в аккаунт, чтобы добавить автомобиль');
        });
    });

    // Function to logout a user
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            fetch('/api/logout/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                body: JSON.stringify({
                    refresh_token: localStorage.getItem('refresh_token')
                }),
            })
            .then(response => {
                if (response.ok) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/';
                } else {
                    return response.json().then(data => {
                        throw new Error(data.error || 'Unknown error');
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Ошибка выхода из аккаунта');
            });
        });
    }

    // Function to refresh token
    function refresh_Token() {
        const refreshToken = localStorage.getItem('refresh_token');

        return fetch('/api/token/refresh/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                refresh: refreshToken
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Could not refresh token');
            }
            return response.json();
        })
        .then(data => {
            localStorage.setItem('access_token', data.access); // Сохраняем новый Access Token
            return data.access;
        })
        .catch(error => {
            console.error('Error refreshing token:', error);
            alert('Your session has expired. Please log in again.');
            window.location.href = '/login/';
        });
    }

    filterForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const filterParams = new URLSearchParams({
            brand: document.getElementById('filterBrand').value,
            model: document.getElementById('filterModel').value,
            year: document.getElementById('filterYear').value,
            fuel_type: document.getElementById('filterFuelType').value,
            transmission_type: document.getElementById('filterTransmission').value,
            mileage_min: document.getElementById('filterMileageMin').value,
            mileage_max: document.getElementById('filterMileageMax').value,
            price_min: document.getElementById('filterPriceMin').value,
            price_max: document.getElementById('filterPriceMax').value,
        });

        fetch(`/api/cars/?${filterParams.toString()}`)
            .then(response => response.json())
            .then(data => {
                const carsList = document.getElementById('carsList');
                carsList.innerHTML = '';

                if (data && data.results && Array.isArray(data.results)) {
                    data.results.forEach(car => {
                        const carItem = document.createElement('div');
                        carItem.classList.add('col-md-4', 'car-item');
                        carItem.innerHTML = `
                            <div class="card">
                                <div class="card-body">
                                    <h5 class="card-title">${car.brand} ${car.model} (${car.year})</h5>
                                    <p class="car-text" carId="${car.id}" hidden>ID: ${car.id}</p>
                                    <p class="card-text">Fuel: ${car.fuel_type}, Transmission: ${car.transmission_type}</p>
                                    <p class="card-text">Mileage: ${car.mileage} km</p>
                                    <p class="card-text">Price: $${car.price}</p>
                                    <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#carDetailsModal" onclick="getCarDetails(${car.id})">Подробнее</button>
                                </div>
                            </div>
                        `;
                        carsList.appendChild(carItem);
                    });
                } else {
                    console.error('Unexpected data format:', data);
                }

                updatePaginationControls(data);
            })
            .catch(error => {
                alert('Error fetching cars');
                console.error('Error:', error);
            });
    });

    function updatePaginationControls(data) {
        const paginationControls = document.getElementById('paginationControls');
        paginationControls.innerHTML = '';

        if (data && data.count > 0) {
            const totalPages = Math.ceil(data.count / 6); // Используйте значение PAGE_SIZE
            for (let i = 1; i <= totalPages; i++) {
                const pageButton = document.createElement('button');
                pageButton.textContent = i;
                pageButton.classList.add('btn', 'btn-outline-primary', 'mx-1');
                pageButton.addEventListener('click', function() {
                    fetch(`/api/cars/?${filterParams.toString()}&page=${i}`)
                        .then(response => response.json())
                        .then(data => {
                            const carsList = document.getElementById('carsList');
                            carsList.innerHTML = '';

                            if (data && data.results && Array.isArray(data.results)) {
                                data.results.forEach(car => {
                                    const carItem = document.createElement('div');
                                    carItem.classList.add('col-md-4', 'car-item');
                                    carItem.innerHTML = `
                                        <div class="card">
                                            <div class="card-body">
                                                <h5 class="card-title">${car.brand} ${car.model} (${car.year})</h5>
                                                <p class="car-text" carId="${car.id}" hidden>ID: ${car.id}</p>
                                                <p class="card-text">Fuel: ${car.fuel_type}, Transmission: ${car.transmission_type}</p>
                                                <p class="card-text">Mileage: ${car.mileage} km</p>
                                                <p class="card-text">Price: $${car.price}</p>
                                                <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#carDetailsModal" onclick="getCarDetails(${car.id})">Подробнее</button>
                                            </div>
                                        </div>
                                    `;
                                    carsList.appendChild(carItem);
                                });
                            } else {
                                console.error('Unexpected data format:', data);
                            }

                            updatePaginationControls(data);
                        })
                        .catch(error => {
                            alert('Error fetching cars');
                            console.error('Error:', error);
                        });
                });
                paginationControls.appendChild(pageButton);
            }
        }
    }
});