document.addEventListener("DOMContentLoaded", () => {
  // --- VARIABLES GLOBALES DE ESTADO ---
  const studentLabels = [
    "Ing. Software",
    "Diseño Gráfico",
    "Marketing",
    "Medicina",
  ];
  let studentData = [450, 200, 300, 300];
  let courseData = [25, 20, 20, 20];
  let gradeData = [9.2, 8.5, 8.8, 9.0];

  let notifications = []; // Array para guardar notificaciones
  let unreadCount = 0; // Contador de no leídas
  let userProfile = { name: "", dni: "", address: "", major: "" }; // Objeto para perfil

  // Variables para los gráficos
  let gradeChart;
  let majorChart;

  // --- REFERENCIAS A ELEMENTOS DEL DOM (KPIs y MODALES) ---
  const totalStudentsKPI = document.getElementById("total-students-value");
  const activeCoursesKPI = document.getElementById("active-courses-value");
  const averageGradeKPI = document.getElementById("average-grade-value");

  // Modales
  const studentModal = document.getElementById("student-modal");
  const coursesModal = document.getElementById("courses-modal");
  const gradesModal = document.getElementById("grades-modal");
  const profileModal = document.getElementById("profile-modal"); // Nueva modal

  // Botones para abrir modales
  const openStudentBtn = document.getElementById("open-student-modal");
  const openCoursesBtn = document.getElementById("open-courses-modal");
  const openGradesBtn = document.getElementById("open-grades-modal");
  const openProfileBtn = document.getElementById("open-profile-modal"); // Nuevo
  const openConfigBtn = document.getElementById("open-config-modal"); // Nuevo

  // Formularios
  const studentForm = document.getElementById("student-form");
  const coursesForm = document.getElementById("courses-form");
  const gradesForm = document.getElementById("grades-form");
  const profileForm = document.getElementById("profile-form"); // Nuevo

  // --- Inputs de formularios (agrupados) ---
  const swInput = document.getElementById("sw-students");
  const dgInput = document.getElementById("dg-students");
  const mktInput = document.getElementById("mkt-students");
  const medInput = document.getElementById("med-students");

  const swCourses = document.getElementById("sw-courses");
  const dgCourses = document.getElementById("dg-courses");
  const mktCourses = document.getElementById("mkt-courses");
  const medCourses = document.getElementById("med-courses");

  const swGrade = document.getElementById("sw-grade");
  const dgGrade = document.getElementById("dg-grade");
  const mktGrade = document.getElementById("mkt-grade");
  const medGrade = document.getElementById("med-grade");

  const profileName = document.getElementById("profile-name");
  const profileDNI = document.getElementById("profile-dni");
  const profileAddress = document.getElementById("profile-address");
  const profileMajor = document.getElementById("profile-major");

  // --- Elementos de Notificación ---
  const notificationBell = document.getElementById("notification-bell");
  const notificationBadge = document.getElementById("notification-badge");
  const notificationDropdown = document.getElementById("notification-dropdown");
  const notificationList = document.getElementById("notification-list");

  // --- INICIALIZACIÓN (Cargar datos y gráficos) ---

  // Cargar perfil guardado (si existe)
  loadProfile();

  // Inicializar Gráfico 1 (Calificaciones)
  const ctxBar = document.getElementById("gradeChart").getContext("2d");
  gradeChart = new Chart(ctxBar, {
    type: "bar",
    data: {
      labels: studentLabels,
      datasets: [
        {
          label: "Calificación Promedio",
          data: gradeData,
          backgroundColor: [
            "rgba(75, 192, 192, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(255, 99, 132, 0.6)",
          ],
          borderColor: [
            "rgba(75, 192, 192, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(255, 99, 132, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true, max: 10 } },
      plugins: { legend: { display: false } },
    },
  });

  // Inicializar Gráfico 2 (Estudiantes)
  const ctxDoughnut = document.getElementById("majorChart").getContext("2d");
  majorChart = new Chart(ctxDoughnut, {
    type: "doughnut",
    data: {
      labels: studentLabels,
      datasets: [
        {
          label: "Estudiantes",
          data: studentData,
          backgroundColor: ["#6a11cb", "#2575fc", "#ff6b6b", "#feca57"],
          hoverOffset: 4,
        },
      ],
    },
    options: { responsive: true, plugins: { legend: { position: "bottom" } } },
  });

  // --- LÓGICA DE NOTIFICACIONES ---

  // Función para añadir notificación y actualizar UI
  const addNotification = (message) => {
    // 1. Crear objeto de notificación
    const now = new Date();
    const notification = {
      message: message,
      timestamp: `${now.toLocaleDateString()} ${now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
    };

    // 2. Añadir al inicio del array
    notifications.unshift(notification);

    // 3. Actualizar contador
    unreadCount++;

    // 4. Actualizar la UI (badge y lista)
    updateNotificationUI();
  };

  // Función para redibujar el badge y la lista
  const updateNotificationUI = () => {
    // Actualizar badge
    if (unreadCount > 0) {
      notificationBadge.textContent = unreadCount;
      notificationBadge.classList.add("active");
    } else {
      notificationBadge.classList.remove("active");
    }

    // Actualizar lista
    notificationList.innerHTML = ""; // Limpiar lista
    if (notifications.length === 0) {
      notificationList.innerHTML =
        '<p class="no-notifications">No hay notificaciones nuevas.</p>';
      return;
    }

    notifications.forEach((notif) => {
      const item = document.createElement("div");
      item.classList.add("notification-item");
      item.innerHTML = `
                <p>${notif.message}</p>
                <span class="timestamp">${notif.timestamp}</span>
            `;
      notificationList.appendChild(item);
    });
  };

  // Evento para abrir/cerrar dropdown de notificaciones
  notificationBell.addEventListener("click", () => {
    notificationDropdown.classList.toggle("active");

    // Si se abre, resetear contador y ocultar badge
    if (notificationDropdown.classList.contains("active")) {
      unreadCount = 0;
      updateNotificationUI();
    }
  });

  // --- LÓGICA DE PERFIL/CONFIGURACIÓN (CON LOCALSTORAGE) ---

  function openProfileModal(e) {
    e.preventDefault();
    // Rellenar la modal con los datos actuales
    profileName.value = userProfile.name;
    profileDNI.value = userProfile.dni;
    profileAddress.value = userProfile.address;
    profileMajor.value = userProfile.major;

    profileModal.classList.add("active");
  }

  // Asignar el MISMO evento a AMBOS botones
  openProfileBtn.addEventListener("click", openProfileModal);
  openConfigBtn.addEventListener("click", openProfileModal);

  // Guardar Perfil
  profileForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // 1. Actualizar objeto de perfil
    userProfile.name = profileName.value;
    userProfile.dni = profileDNI.value;
    userProfile.address = profileAddress.value;
    userProfile.major = profileMajor.value;

    // 2. Guardar en LocalStorage
    saveProfile();

    // 3. (Opcional) Crear notificación
    addNotification("Datos de perfil actualizados.");

    closeModal(profileModal);
  });

  // Función para guardar en LocalStorage
  function saveProfile() {
    localStorage.setItem("userProfile", JSON.stringify(userProfile));
  }

  // Función para cargar de LocalStorage (se llama al inicio)
  function loadProfile() {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      userProfile = JSON.parse(savedProfile);
    }
  }

  // --- LÓGICA DE MODALES DE DATOS (Estudiantes, Cursos, Calificaciones) ---

  // Abrir Modal Estudiantes
  openStudentBtn.addEventListener("click", (e) => {
    e.preventDefault();
    swInput.value = studentData[0];
    dgInput.value = studentData[1];
    mktInput.value = studentData[2];
    medInput.value = studentData[3];
    studentModal.classList.add("active");
  });

  // Enviar Formulario Estudiantes
  studentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    studentData = [
      parseInt(swInput.value),
      parseInt(dgInput.value),
      parseInt(mktInput.value),
      parseInt(medInput.value),
    ];

    majorChart.data.datasets[0].data = studentData;
    majorChart.update();

    const totalStudents = studentData.reduce((sum, val) => sum + val, 0);
    totalStudentsKPI.textContent = totalStudents.toLocaleString("es");

    // ¡AÑADIR NOTIFICACIÓN!
    addNotification("Se actualizó el total de estudiantes.");

    closeModal(studentModal);
  });

  // Abrir Modal Cursos
  openCoursesBtn.addEventListener("click", (e) => {
    e.preventDefault();
    swCourses.value = courseData[0];
    dgCourses.value = courseData[1];
    mktCourses.value = courseData[2];
    medCourses.value = courseData[3];
    coursesModal.classList.add("active");
  });

  // Enviar Formulario Cursos
  coursesForm.addEventListener("submit", (e) => {
    e.preventDefault();
    courseData = [
      parseInt(swCourses.value),
      parseInt(dgCourses.value),
      parseInt(mktCourses.value),
      parseInt(medCourses.value),
    ];

    const totalCourses = courseData.reduce((sum, val) => sum + val, 0);
    activeCoursesKPI.textContent = totalCourses;

    // ¡AÑADIR NOTIFICACIÓN!
    addNotification("Se actualizó el número de cursos activos.");

    closeModal(coursesModal);
  });

  // Abrir Modal Calificaciones
  openGradesBtn.addEventListener("click", (e) => {
    e.preventDefault();
    swGrade.value = gradeData[0];
    dgGrade.value = gradeData[1];
    mktGrade.value = gradeData[2];
    medGrade.value = gradeData[3];
    gradesModal.classList.add("active");
  });

  // Enviar Formulario Calificaciones
  gradesForm.addEventListener("submit", (e) => {
    e.preventDefault();
    gradeData = [
      parseFloat(swGrade.value),
      parseFloat(dgGrade.value),
      parseFloat(mktGrade.value),
      parseFloat(medGrade.value),
    ];

    const totalSum = gradeData.reduce((sum, val) => sum + val, 0);
    const average = totalSum / gradeData.length;
    averageGradeKPI.textContent = `${average.toFixed(1)} / 10`;

    gradeChart.data.datasets[0].data = gradeData;
    gradeChart.update();

    // ¡AÑADIR NOTIFICACIÓN!
    addNotification("Se actualizó el promedio general.");

    closeModal(gradesModal);
  });

  // --- FUNCIONES GENÉRICAS PARA CERRAR MODALES ---
  const closeModal = (modal) => {
    modal.classList.remove("active");
  };

  document.querySelectorAll(".modal-close").forEach((btn) => {
    btn.addEventListener("click", () => {
      closeModal(btn.closest(".modal-overlay"));
    });
  });

  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        closeModal(overlay);
      }
    });
  });
});
