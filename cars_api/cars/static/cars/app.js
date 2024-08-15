// Обработчик для открытия модального окна и заполнения полей формы
function openCarDetailsModal(carId) {
    fetch(`/api/cars/${carId}/`)
        .then(response => response.json())
        .then(data => {
            // Заполняем данные в отображении и форме
            document.getElementById('carDetailsDisplay').innerHTML = `
                   <p><strong>Марка:</strong> ${data.brand}</p>
                   <p><strong>Модель:</strong> ${data.model}</p>
                   <p><strong>Год:</strong> ${data.year}</p>
                   <p><strong>Тип топлива:</strong> ${data.fuel_type}</p>
                   <p><strong>Коробка передач:</strong> ${data.transmission_type}</p>
                   <p><strong>Пробег:</strong> ${data.mileage}</p>
                   <p><strong>Цена:</strong> ${data.price}</p>
               `;

            document.getElementById('updateBrand').value = data.brand;
            document.getElementById('updateModel').value = data.model;
            document.getElementById('updateYear').value = data.year;
            document.getElementById('updateFuelType').value = data.fuel_type;
            document.getElementById('updateTransmission').value = data.transmission_type;
            document.getElementById('updateMileage').value = data.mileage;
            document.getElementById('updatePrice').value = data.price;

            // Сохраняем ID автомобиля для использования при обновлении
            document.getElementById('carUpdateForm').setAttribute('data-car-id', carId);
        })
        .catch(error => console.error('Ошибка при получении данных автомобиля:', error));
}

// Функция для удаления автомобиля
function deleteCar(carId, token) {
    fetch(`/api/cars/${carId}/`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (response.ok) {
                console.log('Car deleted successfully');
                updateCarList(token); // Обновляем список после удаления
            } else {
                return response.json().then(data => {
                    console.error('Error response:', data);
                    throw new Error(data.detail || 'Unknown error');
                });
            }
        })
        .catch(error => {
            console.error('Error deleting car:', error);
            alert('Ошибка при удалении автомобиля');
        });
}

// Функция для обновления списка автомобилей
function updateCarList(accessToken) {
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    fetch('/api/cars/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'X-CSRFToken': csrfToken
        }
    })
        .then(response => {
            // Если токен истек и запрос вернул ошибку, обновляем токен
            if (response.status === 401) {
                return refresh_Token().then(newAccessToken => {
                    // После обновления токена, повторяем запрос с новым токеном
                    return fetch('/api/cars/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${newAccessToken}`,
                            'X-CSRFToken': csrfToken
                        },
                        body: JSON.stringify(carData),
                    });
                });
            }
            return response;
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка при загрузке списка автомобилей');
            }
            return response.json();
        })
        .then(data => {
            const cars = Array.isArray(data) ? data : data.results; // Если data - массив, используем его. Если нет, берем data.results.

            if (!Array.isArray(cars)) {
                throw new Error('Ожидался массив автомобилей, но получен другой формат данных');
            }

            const carListElement = document.getElementById('carsList');
            if (!carListElement) {
                console.error('Элемент списка автомобилей не найден');
                return;
            }

            // Очистить текущий список
            carListElement.innerHTML = '';

            // Создать новый список автомобилей
            cars.forEach(car => {
                const carCard = document.createElement('div');
                carCard.classList.add('col-md-4', `car-item`);
                carCard.id = `car-${car.id}`;
                carCard.innerHTML = `
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">${car.brand} ${car.model} (${car.year})</h5>
                            <p class="car-text" carId="${car.id}" hidden>ID: ${car.id}</p>
                            <p class="card-text">Fuel: ${car.fuel_type}, Transmission: ${car.transmission_type}</p>
                            <p class="card-text">Mileage: ${car.mileage} km</p>
                            <p class="card-text">Price: $${car.price}</p>
                            <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#carDetailsModal" onclick="openCarDetailsModal(${car.id})">Подробнее</button>
                            <button type="button" class="btn btn-primary" onclick="deleteCar(${car.id}, '${csrfToken}')">Удалить</button>
                        </div>
                    </div> 
                `;
                carListElement.appendChild(carCard);
            });
        })
        .catch(error => {
            console.error('Ошибка при обновлении списка автомобилей:', error);
        });
}

document.addEventListener('DOMContentLoaded', function() {
    const addCarForm = document.getElementById('addCarForm');
    const filterForm = document.getElementById('filterForm');
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    let accessToken = localStorage.getItem('access_token');
    let refreshToken = localStorage.getItem('refresh_token');
    let filterParams = '';

    // Функция регистрации
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

    // Функция авторизации
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

    // Функция выхода
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

    // Функция обновления токена
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

    // Функция добавления нового авто
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
                // Если токен истек и запрос вернул ошибку, обновляем токен
                if (response.status === 401) {
                    return refresh_Token().then(newAccessToken => {
                        // После обновления токена, повторяем запрос с новым токеном
                        return fetch('/api/cars/', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${newAccessToken}`,
                                'X-CSRFToken': csrfToken
                            },
                            body: JSON.stringify(carData),
                        });
                    });
                }
                return response;
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

    // Функция фильтрации и показа авто
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
                        carItem.classList.add('col-md-4', `car-item`);
                        carItem.id = `car-${car.id}`;
                        carItem.innerHTML = `
                            <div class="card">
                                <div class="card-body">
                                    <h5 class="card-title">${car.brand} ${car.model} (${car.year})</h5>
                                    <p class="car-text" carId="${car.id}" hidden>ID: ${car.id}</p>
                                    <p class="card-text">Fuel: ${car.fuel_type}, Transmission: ${car.transmission_type}</p>
                                    <p class="card-text">Mileage: ${car.mileage} km</p>
                                    <p class="card-text">Price: $${car.price}</p>
                                    <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#carDetailsModal" onclick="openCarDetailsModal(${car.id})">Подробнее</button>
                                    <button type="button" class="btn btn-primary" onclick="deleteCar(${car.id}, '${accessToken}')">Удалить</button>
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

    // Функция обновления деталей автомобиля

    // Открытие модального окна при нажатии на кнопку "Обновить"
    document.getElementById('updateButton').addEventListener('click', function () {
        // Скрываем данные автомобиля и показываем форму обновления
        document.getElementById('carDetailsDisplay').style.display = 'none';
        document.getElementById('carUpdateForm').style.display = 'block';

        // Переключаем кнопки
        this.style.display = 'none';
        document.querySelector('.modal-footer button[data-bs-dismiss]').style.display = 'none';
        document.getElementById('saveButton').style.display = 'inline-block';
        document.getElementById('cancelButton').style.display = 'inline-block';
    });

    // Отмена изменений
    document.getElementById('cancelButton').addEventListener('click', function () {
        // Показываем данные автомобиля и скрываем форму обновления
        document.getElementById('carDetailsDisplay').style.display = 'block';
        document.getElementById('carUpdateForm').style.display = 'none';

        // Переключаем кнопки обратно
        document.getElementById('updateButton').style.display = 'inline-block';
        document.querySelector('.modal-footer button[data-bs-dismiss]').style.display = 'inline-block';
        document.getElementById('saveButton').style.display = 'none';
        this.style.display = 'none';
    });

    // Сохранение обновленных данных
    document.getElementById('saveButton').addEventListener('click', function () {
        const carId = document.getElementById('carUpdateForm').getAttribute('data-car-id');
        const updatedData = {
            brand: document.getElementById('updateBrand').value,
            model: document.getElementById('updateModel').value,
            year: document.getElementById('updateYear').value,
            fuel_type: document.getElementById('updateFuelType').value,
            transmission_type: document.getElementById('updateTransmission').value,
            mileage: document.getElementById('updateMileage').value,
            price: document.getElementById('updatePrice').value,
        };

        fetch(`/api/cars/${carId}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                'X-CSRFToken': csrfToken,  // Функция для получения CSRF токена
            },
            body: JSON.stringify(updatedData),
        })
            .then(response => {
        // Если токен истек и запрос вернул ошибку, обновляем токен
        if (response.status === 401) {
            return refresh_Token().then(newAccessToken => {
                // После обновления токена, повторяем запрос с новым токеном
                return fetch('/api/cars/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${newAccessToken}`,
                        'X-CSRFToken': csrfToken
                    },
                    body: JSON.stringify(carData),
                });
            });
        }
        return response;
    })
        .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(`Network response was not ok: ${text}`);
            });
        }
        return response.json();
    })
        .then(data => {
            console.log('Автомобиль обновлен:', data);
            // Обновите данные в модальном окне или перезагрузите страницу
            document.getElementById('carDetailsDisplay').innerHTML = `
                <p><strong>Марка:</strong> ${data.brand}</p>
                <p><strong>Модель:</strong> ${data.model}</p>
                <p><strong>Год:</strong> ${data.year}</p>
                <p><strong>Тип топлива:</strong> ${data.fuel_type}</p>
                <p><strong>Коробка передач:</strong> ${data.transmission_type}</p>
                <p><strong>Пробег:</strong> ${data.mileage}</p>
                <p><strong>Цена:</strong> ${data.price}</p>
            `;
            // Показать обновленные данные
            document.getElementById('carUpdateForm').style.display = 'none';
            document.getElementById('carDetailsDisplay').style.display = 'block';
            document.getElementById('updateButton').style.display = 'inline-block';
            document.querySelector('.modal-footer button[data-bs-dismiss]').style.display = 'inline-block';
            document.getElementById('saveButton').style.display = 'none';
            document.getElementById('cancelButton').style.display = 'none';

            updateCarOnPage(data);
            const updateModal = bootstrap.Modal.getInstance(document.getElementById('carDetailsModal'));
            updateModal.hide();
        })
        .catch(error => console.error('Ошибка при обновлении автомобиля:', error));
    });

    //Функция обновления данных на странице
    function updateCarOnPage(car) {
        const carElement = document.querySelector(`.card-body p[carId="${car.id}"]`);
        if (carElement) {
            carElement.nextElementSibling.textContent = `Fuel: ${car.fuel_type}, Transmission: ${car.transmission_type}`;
            carElement.nextElementSibling.nextElementSibling.textContent = `Mileage: ${car.mileage} km`;
            carElement.nextElementSibling.nextElementSibling.nextElementSibling.textContent = `Price: $${car.price}`;
        } else {
            console.error(`Car element with ID ${car.id} not found.`);
        }
    }

    //Функция обновления пагинации
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
                                                <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#carDetailsModal" onclick="openCarDetailsModal(${car.id})">Подробнее</button>
                                                <button type="button" class="btn btn-primary" onclick="deleteCar(${car.id}, '${accessToken}')">Удалить</button>
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