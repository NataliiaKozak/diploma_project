/******* Основная логика страницы *******/

// Определение "UserAgent" браузера.
let userAgent = window.navigator.userAgent

// Заполнение элементов select.
fillSelectElement('select-b-type', 'Any type', 'type')
fillSelectElement('select-b-distance', 'Any distance', 'distance')
fillSelectElement('select-b-category', 'Any category', 'category')

// Пред обработка массива мероприятий (установка формата даты).
preProcessingEvents()

// Получение мероприятий.
getEvents('events-id', eventsStore)

/******* Основные функции *******/

/*
    Функция заполнения значениями элемента select. 
*/
function fillSelectElement(elementId, defaultValue, filter) {
	// Выбор элемента select.
	let selectElement = document.getElementById(elementId)

	// Формирование массива для фильтрации.
	let selectElementOptions = eventsStore.map(x => x[filter])

	// Добавление значения по умолчанию в элемент select.
	selectElementOptions = [defaultValue].concat(selectElementOptions)

	// Проверка и удаление дубликатов в массиве.
	let selectElementOptionsUniq = [...new Set(selectElementOptions)]

	// Сортировка массива.
	selectElementOptionsUniq = sortSelectElementValues(
		defaultValue,
		selectElementOptionsUniq
	)

	// Инициализация структуры данных элемента.
	selectElementOptionsUniq.forEach(function (option) {
		selectElement.innerHTML +=
			'<option value="' +
			option +
			'">' +
			capitalizeFirstLetter(option) +
			'</option>'
	})
}

/*
    Установка формата даты в массиве мероприятий.
 */
function preProcessingEvents() {
	// Задаем опции формата даты.
	let options = {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		timeZone: 'UTC',
		timeZoneName: 'short',
	}

	eventsStore.forEach(event => {
		// Устанавливаем формат даты.
		event.date = new Intl.DateTimeFormat('en-US', options).format(event.date)

		// Заменяем вторую "," в установленном формате данных на "·".
		let matchCount = 0
		event.date = event.date.replace(/,/g, match =>
			++matchCount === 2 ? ' ·' : match
		)

		// Устанавливаем формат даты в верхнем регистре.
		event.date = event.date.toUpperCase()
	})
}

/*
Функция получение мероприятий. 
*/
function getEvents(elementId, events) {
	// Выбор элемента events.
	let eventsElement = document.getElementById(elementId)

	// Обнуление innerHTML для исключения накопления результатов.
	eventsElement.innerHTML = ''

	// Формирование мероприятий.
	events.forEach(function (eventItem) {
		// Создание элементов шаблона мероприятия.

		// Создание разделительной черты.
		let separator = '<div class="event-item-separator"></div>'

		// Создание изображений.
		let eventItemImagePicture =
			'<img class="event-item-info-image-picture" src="' +
			eventItem.image +
			'" alt=""/>'

		let eventItemImage =
			'<div class="event-item-info">' +
			'<div class="event-item-info-image">' +
			eventItemImagePicture +
			'</div>'

		if (!userAgent.includes('Mobile') && eventItem.type === 'online') {
			eventItemImage =
				'<div class="event-item-info">' +
				'<div class="event-item-info-image">' +
				eventItemImagePicture +
				'<img class="event-item-info-image-svg-desktop" alt="" srcset="../assets/img/svg/online-event.svg" />' +
				'</div>'
		}

		let eventItemDate =
			'<div class="event-item-info-data">' +
			'<div class="event-item-info-data-date">' +
			eventItem.date +
			'</div>'

		// Создание названия.
		let eventItemTitle =
			'<div class="event-item-info-data-title">' + eventItem.title + '</div>'

		// Создание категории и дистанции.
		let eventItemCategoryDistance =
			'<div class="event-item-info-data-category-distance">' +
			eventItem.category +
			' (' +
			eventItem.distance +
			' km)' +
			'</div>'

		// Создание шаблона мероприятия.
		let template =
			separator +
			eventItemImage +
			eventItemDate +
			eventItemTitle +
			eventItemCategoryDistance

		// Для мобильной версии.
		if (userAgent.includes('Mobile') && eventItem.type === 'online') {
			template +=
				'<img class="event-item-info-image-svg-mob" alt="" srcset="../assets/img/svg/online-event.svg">'
		}

		// Добавление элемента шаблона мероприятия "attendees", если значение присутствует.
		if (eventItem.attendees !== undefined) {
			template +=
				'<div class="event-item-info-data-attendees">' +
				eventItem.attendees +
				' attendees</div>'
		}

		// Вставка шаблона мероприятия.
		eventsElement.innerHTML +=
			'<div class="event-item">' + template + '</div></div></div>'
	})
}

/*
    Функция выполнения фильтрации, при изменении значения в элементе select. 
*/
function onFilter(elementId, selectedValue) {
	// Обновление условий фильтрации.
	updateFiltersConditions(selectedValue, elementId)

	// Фильтрация.
	let filteredEventsStore = eventsStore
	selectedFilters.forEach(function (filterItem) {
		if (filterItem.selectedValue !== '') {
			filteredEventsStore = filteredEventsStore.filter(
				x => x[filterItem.filter] === filterItem.selectedValue
			)
		}
	})

	// Получение результата фильтрации.
	const filteredEventsStoreConst = filteredEventsStore

	// Обновление выдачи.
	getEvents('events-id', filteredEventsStoreConst)
}

/******* Вспомогательные функции *******/

/*
	Функция сортировки значений в элементе select.
 */
function sortSelectElementValues(defaultValue, selectElementOptionsUniq) {
	// Удаляем дефолтное значение из массива для сортировки.
	let valuesWithoutDefault = selectElementOptionsUniq.filter(
		item => item !== defaultValue
	)

	// Определяем числовые значения и сортируем их.
	let numericValues = valuesWithoutDefault
		.filter(item => !isNaN(item))
		.map(Number)
		.sort((a, b) => a - b)

	// Определяем нечисловые значения и сортируем их.
	let stringValues = valuesWithoutDefault
		.filter(item => isNaN(item))
		.sort((a, b) => a.localeCompare(b))

	// Собираем обратно массив с сортированными значениями.
	selectElementOptionsUniq = [defaultValue, ...stringValues, ...numericValues]

	// Возвращаем результат.
	return selectElementOptionsUniq
}

/*
    Функция обновления условий фильтрации. 
*/
function updateFiltersConditions(selectedValue, elementId) {
	for (let i = 0; i < selectedFilters.length; i++) {
		if (selectedFilters[i].elementId === elementId) {
			if (selectedValue.startsWith('Any')) {
				selectedFilters[i].selectedValue = ''
			} else {
				selectedFilters[i].selectedValue =
					elementId === 'select-b-distance'
						? Number(selectedValue)
						: selectedValue
			}
			return
		}
	}
}

/*
    Функция установки большой буквы в начале строки. 
*/
function capitalizeFirstLetter(val) {
	return String(val).charAt(0).toUpperCase() + String(val).slice(1)
}
