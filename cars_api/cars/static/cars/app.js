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
    const carForm = document.getElementById('carForm');
    const carsList = document.getElementById('carsList');
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Function to add a new car
    addCarForm.addEventListener('submit', function(event) {
        event.preventDefault();

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
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify(carData),
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { // Получаем HTML в случае ошибки
                    throw new Error(text);
                });
            }
            return response.json(); // Ожидаем JSON
        })
        .then(data => {
            alert('Car added successfully!');
            addCarForm.reset();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error adding car');
        });
    });

    // Function to filter and display cars
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
            carsList.innerHTML = '';
            data.forEach(car => {
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
        })
        .catch(error => {
            alert('Error fetching cars');
            console.error('Error:', error);
        });
    });


});