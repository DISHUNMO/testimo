const canvas = document.getElementById('expedition-canvas');
const ctx = canvas.getContext('2d');

// Массив путей к текстурам лепестков из игры (замени на свои файлы)
const PngSources = ['petal1.png', 'petal2.png', 'petal3.png'];

const images = [];
let loadedImagesCount = 0;

// Загрузка текстур перед стартом
PngSources.forEach((src) => {
  const img = new Image();
  img.src = src;
  img.onload = () => {
    loadedImagesCount++;
    if (loadedImagesCount === PngSources.length) {
      init();
      animate();
    }
  };
  // На случай, если картинок пока нет — подстраховка, чтобы код не падал локально
  img.onerror = () => {
    loadedImagesCount++;
    if (loadedImagesCount === PngSources.length) {
      init();
      animate();
    }
  };
  images.push(img);
});

const PETAL_COUNT = 80;
const petalsArray = [];

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

class CinematicPetal {
  constructor() {
    this.reset();
    this.y = Math.random() * canvas.height;
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = -50;

    // Выбираем случайную текстуру лепестка
    this.img = images[Math.floor(Math.random() * images.length)];

    // Имитация 3D-пространства через Z-координату (глубина от 0.5 до 1.5)
    this.z = Math.random() * 1 + 0.5;

    // Масштабируем размер с учетом глубины Z
    this.baseSize = Math.random() * 20 + 15; // Исходный размер лепестка
    this.size = this.baseSize / this.z;

    // Скорость зависит от удаленности (чем ближе к камере, тем быстрее летит)
    this.speedY = (Math.random() * 1.2 + 0.8) / this.z;
    this.speedX = (Math.random() * 0.6 - 0.3) / this.z;

    // 3D вращение (углы для осей X, Y, Z)
    this.rotationX = Math.random() * Math.PI;
    this.rotationY = Math.random() * Math.PI;
    this.rotationZ = Math.random() * Math.PI;

    // Скорости вращения по осям
    this.spinX = Math.random() * 0.02 - 0.01;
    this.spinY = Math.random() * 0.02 - 0.01;
    this.spinZ = Math.random() * 0.01 - 0.005;

    // Плавное покачивание (ветер)
    this.windOscillation = Math.random() * Math.PI;
    this.windSpeed = Math.random() * 0.02 + 0.005;

    // Прозрачность (далекие лепестки слегка растворяются в тумане)
    this.opacity = Math.max(0.2, Math.min(1, 1.3 - this.z));
  }

  update() {
    this.windOscillation += this.windSpeed;

    // Физика падения + мягкий дрейф по ветру
    this.y += this.speedY;
    this.x += this.speedX + Math.sin(this.windOscillation) * 0.4;

    // Изменение углов вращения в 3D
    this.rotationX += this.spinX;
    this.rotationY += this.spinY;
    this.rotationZ += this.spinZ;

    // Если улетел — возвращаем наверх
    if (
      this.y > canvas.height + 50 ||
      this.x < -50 ||
      this.x > canvas.width + 50
    ) {
      this.reset();
    }
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Математическая проекция 3D вращения на 2D холст Canvas:
    // Масштабирование по осям X и Y в зависимости от косинуса угла вращения
    // создает идеальную иллюзию честного переворота плоского лепестка в пространстве
    ctx.scale(Math.cos(this.rotationY), Math.sin(this.rotationX));
    ctx.rotate(this.rotationZ);

    ctx.globalAlpha = this.opacity;

    // Кинематографичный Bloom-эффект (мягкое свечение краев)
    ctx.shadowBlur = 15 / this.z;
    ctx.shadowColor = 'rgba(215, 15, 45, 0.5)';

    // Если текстура загружена — рисуем её, иначе временно рисуем плейсхолдер
    if (this.img && this.img.complete && this.img.naturalWidth !== 0) {
      ctx.drawImage(
        this.img,
        -this.size / 2,
        -this.size / 2,
        this.size,
        this.size,
      );
    } else {
      // Заглушка: если картинок нет, рисуется темно-красный эллипс
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size, this.size / 1.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180, 10, 25, ${this.opacity})`;
      ctx.fill();
    }

    ctx.restore();
  }
}

function init() {
  for (let i = 0; i < PETAL_COUNT; i++) {
    petalsArray.push(new CinematicPetal());
  }
}

function animate() {
  // Очищаем экран. Чтобы задний план не забивался, используем чистый цвет
  ctx.fillStyle = '#030303';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Включаем режим Screen для красивого «дорогого» смешивания цветов и свечений
  ctx.globalCompositeOperation = 'screen';

  // Сортировка по удаленности Z (эффект перекрытия)
  // Отрисовываем сначала дальние (Z большой), потом ближние (Z маленький)
  petalsArray.sort((a, b) => b.z - a.z);

  for (let i = 0; i < petalsArray.length; i++) {
    petalsArray[i].update();
    petalsArray[i].draw();
  }

  // Возвращаем стандартный режим наложения для остальных элементов, если они будут
  ctx.globalCompositeOperation = 'source-over';

  requestAnimationFrame(animate);
}

// //2

// const canvas = document.getElementById('expedition-canvas');
// const ctx = canvas.getContext('2d');

// // Текстуры лепестков
// const PngSources = ['petal1.png', 'petal2.png', 'petal3.png'];
// const images = [];
// let loadedImagesCount = 0;

// PngSources.forEach((src) => {
//   const img = new Image();
//   img.src = src;
//   img.onload = () => {
//     loadedImagesCount++;
//     if (loadedImagesCount === PngSources.length) {
//       init();
//       animate();
//     }
//   };
//   img.onerror = () => {
//     loadedImagesCount++;
//     if (loadedImagesCount === PngSources.length) {
//       init();
//       animate();
//     }
//   };
//   images.push(img);
// });

// const PETAL_COUNT = 100; // Количество частиц
// const petalsArray = [];

// // Параметры глобального ветра
// const WindSettings = {
//   baseForceX: -0.5, // Постоянный наклон ветра (влево)
//   turbineScale: 0.002, // Масштаб завихрений (чем меньше, тем крупнее воздушные потоки)
//   time: 0, // Таймер для изменения ветра во времени
// };

// function resize() {
//   canvas.width = window.innerWidth;
//   canvas.height = window.innerHeight;
// }
// window.addEventListener('resize', resize);
// resize();

// class WindPetal {
//   constructor() {
//     this.reset();
//     // При старте распределяем хаотично по всему экрану
//     this.x = Math.random() * canvas.width;
//     this.y = Math.random() * canvas.height;
//   }

//   reset() {
//     // Появляются сверху или с правого бока, так как ветер дует влево-вниз
//     if (Math.random() > 0.5) {
//       this.x = Math.random() * canvas.width;
//       this.y = -50;
//     } else {
//       this.x = canvas.width + 50;
//       this.y = Math.random() * canvas.height;
//     }

//     this.img = images[Math.floor(Math.random() * images.length)];

//     // 3D Глубина (псевдо-трехмерность)
//     this.z = Math.random() * 1 + 0.5; // от 0.5 (близко) до 1.5 (далеко)
//     this.baseSize = Math.random() * 18 + 12;
//     this.size = this.baseSize / this.z;

//     // Текущая скорость (векторы движения)
//     this.vx = 0;
//     this.vy = Math.random() * 1 + 0.5; // Начальная скорость падения

//     // Сопротивление воздуха индивидуально для каждого лепестка
//     this.friction = Math.random() * 0.02 + 0.96; // 0.96 - 0.98
//     // Гравитация (сила тяжести, тянущая вниз)
//     this.gravity = (Math.random() * 0.1 + 0.05) / this.z;

//     // 3D углы поворота
//     this.rotationX = Math.random() * Math.PI;
//     this.rotationY = Math.random() * Math.PI;
//     this.rotationZ = Math.random() * Math.PI;

//     // Базовая скорость вращения
//     this.spinX = Math.random() * 0.04 - 0.02;
//     this.spinY = Math.random() * 0.04 - 0.02;
//     this.spinZ = Math.random() * 0.02 - 0.01;

//     this.opacity = Math.max(0.1, Math.min(1, 1.4 - this.z));
//   }

//   update() {
//     // 1. Вычисляем завихрения ветра в текущей точке экрана с помощью тригонометрии
//     // Имитируем "Шум Перлина" через комбинации синусов и косинусов
//     const windX =
//       Math.sin(this.y * WindSettings.turbineScale + WindSettings.time) * 1.5 +
//       WindSettings.baseForceX;
//     const windY =
//       Math.cos(this.x * WindSettings.turbineScale + WindSettings.time) * 1.0 +
//       this.gravity;

//     // 2. Применяем силу ветра к ускорению лепестка (с учетом его глубины Z)
//     this.vx += windX / this.z;
//     this.vy += windY / this.z;

//     // 3. Применяем сопротивление воздуха, чтобы лепестки не разгонялись до бесконечности
//     this.vx *= this.friction;
//     this.vy *= this.friction;

//     // 4. Смещаем лепесток по координатам
//     this.x += this.vx;
//     this.y += this.vy;

//     // 5. Динамическое вращение: чем быстрее летит лепесток под воздействием ветра, тем сильнее его крутит
//     const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
//     this.rotationX += this.spinX * currentSpeed * 0.5;
//     this.rotationY += this.spinY * currentSpeed * 0.5;
//     this.rotationZ += this.spinZ + this.vx * 0.01; // Наклон по вектору движения

//     // Если лепесток улетел за границы — сбрасываем
//     if (
//       this.y > canvas.height + 50 ||
//       this.x < -50 ||
//       this.x > canvas.width + 50 ||
//       this.y < -50
//     ) {
//       this.reset();
//     }
//   }

//   draw() {
//     ctx.save();
//     ctx.translate(this.x, this.y);

//     // Проекция 3D вращения
//     ctx.scale(Math.cos(this.rotationY), Math.sin(this.rotationX));
//     ctx.rotate(this.rotationZ);

//     ctx.globalAlpha = this.opacity;

//     // Мягкое свечение
//     ctx.shadowBlur = 12 / this.z;
//     ctx.shadowColor = 'rgba(240, 20, 50, 0.4)';

//     if (this.img && this.img.complete && this.img.naturalWidth !== 0) {
//       ctx.drawImage(
//         this.img,
//         -this.size / 2,
//         -this.size / 2,
//         this.size,
//         this.size,
//       );
//     } else {
//       // Резервный эллипс
//       ctx.beginPath();
//       ctx.ellipse(0, 0, this.size, this.size / 1.6, 0, 0, Math.PI * 2);
//       ctx.fillStyle = `rgba(190, 15, 30, ${this.opacity})`;
//       ctx.fill();
//     }

//     ctx.restore();
//   }
// }

// function init() {
//   for (let i = 0; i < PETAL_COUNT; i++) {
//     petalsArray.push(new WindPetal());
//   }
// }

// function animate() {
//   ctx.fillStyle = '#030303';
//   ctx.fillRect(0, 0, canvas.width, canvas.height);

//   ctx.globalCompositeOperation = 'screen';

//   // Двигаем время для изменения направления ветра
//   WindSettings.time += 0.005;

//   // Сортировка по глубине Z (от дальних к ближним)
//   petalsArray.sort((a, b) => b.z - a.z);

//   for (let i = 0; i < petalsArray.length; i++) {
//     petalsArray[i].update();
//     petalsArray[i].draw();
//   }

//   ctx.globalCompositeOperation = 'source-over';
//   requestAnimationFrame(animate);
// }

// //3

// const canvas = document.getElementById('expedition-canvas');
// const ctx = canvas.getContext('2d');

// // Пути к текстурам лепестков из игры (замени на свои PNG-файлы с прозрачным фоном)
// const PngSources = ['petal1.png', 'petal2.png', 'petal3.png'];
// const images = [];
// let loadedImagesCount = 0;

// // Предварительная загрузка изображений перед запуском анимации
// PngSources.forEach((src) => {
//   const img = new Image();
//   img.src = src;
//   img.onload = () => {
//     loadedImagesCount++;
//     if (loadedImagesCount === PngSources.length) {
//       init();
//       animate();
//     }
//   };
//   img.onerror = () => {
//     // Подстраховка: если картинок физически нет в папке, проект всё равно запустится (будут лететь эллипсы)
//     loadedImagesCount++;
//     if (loadedImagesCount === PngSources.length) {
//       init();
//       animate();
//     }
//   };
//   images.push(img);
// });

// const PETAL_COUNT = 100; // Количество лепестков на экране
// const petalsArray = [];

// // Параметры глобального медленного ветра
// const WindSettings = {
//   baseForceX: -0.15, // Мягкий постоянный наклон ветра влево (было -0.5)
//   turbineScale: 0.0015, // Крупный масштаб воздушных потоков для плавности завихрений
//   time: 0, // Таймер для смещения фазы ветра во времени
// };

// // Функция автоматического подгона размера под экран
// function resize() {
//   canvas.width = window.innerWidth;
//   canvas.height = window.innerHeight;
// }
// window.addEventListener('resize', resize);
// resize();

// class WindPetal {
//   constructor() {
//     this.reset();
//     // При первой инициализации распределяем лепестки хаотично по всему экрану
//     this.x = Math.random() * canvas.width;
//     this.y = Math.random() * canvas.height;
//   }

//   reset() {
//     // Появление лепестков сверху или с правого бока (так как ветер сносит их влево)
//     if (Math.random() > 0.5) {
//       this.x = Math.random() * canvas.width;
//       this.y = -50;
//     } else {
//       this.x = canvas.width + 50;
//       this.y = Math.random() * canvas.height;
//     }

//     // Случайный выбор текстуры
//     this.img = images[Math.floor(Math.random() * images.length)];

//     // Псевдо-3D глубина пространства: Z от 0.5 (близко к камере) до 1.5 (далеко в тумане)
//     this.z = Math.random() * 1 + 0.5;
//     this.baseSize = Math.random() * 18 + 12; // Базовый размер
//     this.size = this.baseSize / this.z; // Размер с учетом перспективы

//     // Минимальные стартовые векторы скорости для эффекта Slow-Motion
//     this.vx = 0;
//     this.vy = Math.random() * 0.3 + 0.2;

//     // Сопротивление воздуха (высокое значение замедляет резкие рывки)
//     this.friction = Math.random() * 0.01 + 0.97;

//     // Ослабленная сила тяжести, чтобы лепестки плавно парили, а не падали камнем
//     this.gravity = (Math.random() * 0.02 + 0.01) / this.z;

//     // Начальные случайные углы поворота в 3D пространстве
//     this.rotationX = Math.random() * Math.PI;
//     this.rotationY = Math.random() * Math.PI;
//     this.rotationZ = Math.random() * Math.PI;

//     // Неспешная, ленивая скорость вращения вокруг осей X, Y, Z
//     this.spinX = Math.random() * 0.01 - 0.005;
//     this.spinY = Math.random() * 0.01 - 0.005;
//     this.spinZ = Math.random() * 0.006 - 0.003;

//     // Индивидуальная частота раскачивания лепестка
//     this.windOscillation = Math.random() * Math.PI;
//     this.windSpeed = Math.random() * 0.02 + 0.005;

//     // Далекие лепестки делаем полупрозрачными, создавая глубину кадра
//     this.opacity = Math.max(0.1, Math.min(1, 1.4 - this.z));
//   }

//   update() {
//     this.windOscillation += this.windSpeed;

//     // Математическая симуляция плавных воздушных вихрей (комбинация синусов и косинусов)
//     const windX =
//       Math.sin(this.y * WindSettings.turbineScale + WindSettings.time) * 0.4 +
//       WindSettings.baseForceX;
//     const windY =
//       Math.cos(this.x * WindSettings.turbineScale + WindSettings.time) * 0.3 +
//       this.gravity;

//     // Применяем силы ветра к ускорению лепестка с учетом его удаленности Z
//     this.vx += windX / this.z;
//     this.vy += windY / this.z;

//     // Плавное торможение за счет сопротивления воздуха
//     this.vx *= this.friction;
//     this.vy *= this.friction;

//     // Обновляем координаты положения
//     this.x += this.vx;
//     this.y += this.vy;

//     // Скорость вращения динамически зависит от текущей скорости полета лепестка
//     const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
//     this.rotationX += this.spinX * currentSpeed * 0.5;
//     this.rotationY += this.spinY * currentSpeed * 0.5;
//     this.rotationZ += this.spinZ + this.vx * 0.01; // Легкий наклон по курсу движения

//     // Если лепесток полностью улетел за видимые границы экрана — отправляем на перезапуск
//     if (
//       this.y > canvas.height + 50 ||
//       this.x < -50 ||
//       this.x > canvas.width + 50 ||
//       this.y < -50
//     ) {
//       this.reset();
//     }
//   }

//   draw() {
//     ctx.save();
//     ctx.translate(this.x, this.y);

//     // Проекция честного 3D переворота плоской картинки на 2D плоскость экрана
//     ctx.scale(Math.cos(this.rotationY), Math.sin(this.rotationX));
//     ctx.rotate(this.rotationZ);

//     ctx.globalAlpha = this.opacity;

//     // Cinematic Bloom (мягкое неоновое свечение вокруг граней)
//     ctx.shadowBlur = 12 / this.z;
//     ctx.shadowColor = 'rgba(240, 20, 50, 0.4)';

//     // Если картинка загружена успешно, выводим спрайт, иначе — резервный лепесток кодом
//     if (this.img && this.img.complete && this.img.naturalWidth !== 0) {
//       ctx.drawImage(
//         this.img,
//         -this.size / 2,
//         -this.size / 2,
//         this.size,
//         this.size,
//       );
//     } else {
//       // Резервный темно-красный лепесток на случай отсутствия картинок в папке
//       ctx.beginPath();
//       ctx.ellipse(0, 0, this.size, this.size / 1.6, 0, 0, Math.PI * 2);
//       ctx.fillStyle = `rgba(190, 15, 30, ${this.opacity})`;
//       ctx.fill();
//     }

//     ctx.restore();
//   }
// }

// // Первоначальное наполнение массива лепестков
// function init() {
//   for (let i = 0; i < PETAL_COUNT; i++) {
//     petalsArray.push(new WindPetal());
//   }
// }

// // Главный бесконечный цикл рендера сцены
// function animate() {
//   // Очищаем кадр глубоким темным цветом
//   ctx.fillStyle = '#030303';
//   ctx.fillRect(0, 0, canvas.width, canvas.height);

//   // Включаем кинематографичный режим наложения цветов Screen (эффект свечения при пересечении частиц)
//   ctx.globalCompositeOperation = 'screen';

//   // Очень медленно изменяем фазу воздушных потоков во времени (Slow-Motion)
//   WindSettings.time += 0.001;

//   // Сортируем массив лепестков по глубине (Z), чтобы дальние рисовались первыми, а ближние их перекрывали
//   petalsArray.sort((a, b) => b.z - a.z);

//   // Обновляем и рисуем каждый лепесток
//   for (let i = 0; i < petalsArray.length; i++) {
//     petalsArray[i].update();
//     petalsArray[i].draw();
//   }

//   // Возвращаем стандартный режим отрисовки canvas для других потенциальных элементов сайта
//   ctx.globalCompositeOperation = 'source-over';

//   // Запрос следующего кадра анимации у браузера
//   requestAnimationFrame(animate);
// }
