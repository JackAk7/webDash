document.addEventListener("DOMContentLoaded", () => {
  // --- REFERENCIAS A ELEMENTOS PRINCIPALES ---
  const loginScreen = document.getElementById("login-screen");
  const loginForm = document.getElementById("login-form");
  const loginError = document.getElementById("login-error");
  const dashboardMain = document.getElementById("dashboard-main");

  // Referencias a los inputs del login
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");

  // === NUEVO: Elementos para ver/ocultar contraseña ===
  const togglePassword = document.getElementById("toggle-password");

  // --- LÓGICA DE VISIBILIDAD DE CONTRASEÑA ---
  togglePassword.addEventListener("click", () => {
    // Comprueba el tipo actual del input
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);

    // Cambia el icono
    togglePassword.classList.toggle("fa-eye");
    togglePassword.classList.toggle("fa-eye-slash");
  });
  // ===================================================

  // --- LÓGICA DE LOGIN ---
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = usernameInput.value;
    const password = passwordInput.value;

    const validUser = "admin";
    const validPass = "autonoma2025";

    if (username === validUser && password === validPass) {
      // ¡Éxito!
      loginScreen.classList.add("hidden");
      dashboardMain.classList.remove("hidden");
      document.querySelectorAll(".modal-overlay").forEach((modal) => {
        modal.classList.remove("hidden");
      });
      inicializarDashboard();
    } else {
      // Error
      loginError.style.display = "block";
      loginForm.style.animation = "shake 0.5s";
      setTimeout(() => {
        loginForm.style.animation = "";
      }, 500);

      // === NUEVO: Resetea el icono del ojo si falla ===
      passwordInput.setAttribute("type", "password");
      togglePassword.classList.remove("fa-eye-slash");
      togglePassword.classList.add("fa-eye");
      // ===============================================
    }
  });

  // ==========================================================
  //  FUNCIÓN DE INICIALIZACIÓN DEL DASHBOARD
  // ==========================================================

  function inicializarDashboard() {
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

    let notifications = [];
    let unreadCount = 0;
    let userProfile = { name: "", dni: "", address: "", major: "" };

    let gradeChart;
    let majorChart;

    // --- REFERENCIAS A ELEMENTOS DEL DOM (KPIs y MODALES) ---
    // (Todo el código de getElementById... va aquí)
    const totalStudentsKPI = document.getElementById("total-students-value");
    const activeCoursesKPI = document.getElementById("active-courses-value");
    const averageGradeKPI = document.getElementById("average-grade-value");
    const studentModal = document.getElementById("student-modal");
    const coursesModal = document.getElementById("courses-modal");
    const gradesModal = document.getElementById("grades-modal");
    const profileModal = document.getElementById("profile-modal");
    const openStudentBtn = document.getElementById("open-student-modal");
    const openCoursesBtn = document.getElementById("open-courses-modal");
    const openGradesBtn = document.getElementById("open-grades-modal");
    const openProfileBtn = document.getElementById("open-profile-modal");
    const openConfigBtn = document.getElementById("open-config-modal");
    const studentForm = document.getElementById("student-form");
    const coursesForm = document.getElementById("courses-form");
    const gradesForm = document.getElementById("grades-form");
    const profileForm = document.getElementById("profile-form");
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
    const notificationBell = document.getElementById("notification-bell");
    const notificationBadge = document.getElementById("notification-badge");
    const notificationDropdown = document.getElementById(
      "notification-dropdown"
    );
    const notificationList = document.getElementById("notification-list");

    // === NUEVO: Botón de Cerrar Sesión ===
    const logoutButton = document.getElementById("logout-button");

    // --- INICIALIZACIÓN (Cargar datos y gráficos) ---
    loadProfile();

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
      options: {
        responsive: true,
        plugins: { legend: { position: "bottom" } },
      },
    });

    // --- LÓGICA DE NOTIFICACIONES ---
    const addNotification = (message) => {
      const now = new Date();
      const notification = {
        message: message,
        timestamp: `${now.toLocaleDateString()} ${now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`,
      };
      notifications.unshift(notification);
      unreadCount++;
      updateNotificationUI();
    };

    const updateNotificationUI = () => {
      if (unreadCount > 0) {
        notificationBadge.textContent = unreadCount;
        notificationBadge.classList.add("active");
      } else {
        notificationBadge.classList.remove("active");
      }
      notificationList.innerHTML = "";
      if (notifications.length === 0) {
        notificationList.innerHTML =
          '<p class="no-notifications">No hay notificaciones nuevas.</p>';
        return;
      }
      notifications.forEach((notif) => {
        const item = document.createElement("div");
        item.classList.add("notification-item");
        item.innerHTML = `<p>${notif.message}</p><span class="timestamp">${notif.timestamp}</span>`;
        notificationList.appendChild(item);
      });
    };

    notificationBell.addEventListener("click", () => {
      notificationDropdown.classList.toggle("active");
      if (notificationDropdown.classList.contains("active")) {
        unreadCount = 0;
        updateNotificationUI();
      }
    });

    // --- LÓGICA DE PERFIL/CONFIGURACIÓN (CON LOCALSTORAGE) ---
    function openProfileModal(e) {
      e.preventDefault();
      profileName.value = userProfile.name;
      profileDNI.value = userProfile.dni;
      profileAddress.value = userProfile.address;
      profileMajor.value = userProfile.major;
      profileModal.classList.add("active");
    }

    openProfileBtn.addEventListener("click", openProfileModal);
    openConfigBtn.addEventListener("click", openProfileModal);

    profileForm.addEventListener("submit", (e) => {
      e.preventDefault();
      userProfile.name = profileName.value;
      userProfile.dni = profileDNI.value;
      userProfile.address = profileAddress.value;
      userProfile.major = profileMajor.value;
      saveProfile();
      addNotification("Datos de perfil actualizados.");
      closeModal(profileModal);
    });

    function saveProfile() {
      localStorage.setItem("userProfile", JSON.stringify(userProfile));
    }

    function loadProfile() {
      const savedProfile = localStorage.getItem("userProfile");
      if (savedProfile) {
        userProfile = JSON.parse(savedProfile);
      }
    }

    // === NUEVO: LÓGICA DE CERRAR SESIÓN ===
    logoutButton.addEventListener("click", () => {
      // La forma más simple y segura de "cerrar sesión"
      // es recargar la página.
      // Esto reinicia todo al estado inicial (la pantalla de login).
      location.reload();
    });
    // ===================================

    // --- LÓGICA DE MODALES DE DATOS ---
    // (Aquí va todo el código de: openStudentBtn.addEventListener...)
    openStudentBtn.addEventListener("click", (e) => {
      e.preventDefault();
      swInput.value = studentData[0];
      dgInput.value = studentData[1];
      mktInput.value = studentData[2];
      medInput.value = studentData[3];
      studentModal.classList.add("active");
    });

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
      addNotification("Se actualizó el total de estudiantes.");
      closeModal(studentModal);
    });

    openCoursesBtn.addEventListener("click", (e) => {
      e.preventDefault();
      swCourses.value = courseData[0];
      dgCourses.value = courseData[1];
      mktCourses.value = courseData[2];
      medCourses.value = courseData[3];
      coursesModal.classList.add("active");
    });

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
      addNotification("Se actualizó el número de cursos activos.");
      closeModal(coursesModal);
    });

    openGradesBtn.addEventListener("click", (e) => {
      e.preventDefault();
      swGrade.value = gradeData[0];
      dgGrade.value = gradeData[1];
      mktGrade.value = gradeData[2];
      medGrade.value = gradeData[3];
      gradesModal.classList.add("active");
    });

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
  } // --- FIN DE inicializarDashboard() ---

  // --- CSS Adicional para animación de error de login ---
  const style = document.createElement("style");
  style.innerHTML = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            50% { transform: translateX(5px); }
            75% { translateX(-5px); }
        }
    `;
  document.head.appendChild(style);
});
