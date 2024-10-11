// Firebase config
const firebaseConfig = {
  apiKey: "ВАШ_API_KEY",
  authDomain: "ВАШ_AUTH_DOMAIN",
  projectId: "ВАШ_PROJECT_ID",
  storageBucket: "ВАШ_STORAGE_BUCKET",
  messagingSenderId: "ВАШ_MESSAGING_ID",
  appId: "ВАШ_APP_ID",
  databaseURL: "ВАШ_DATABASE_URL"
};

// Ініціалізація Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Оновлення кількості квитків на сторінці
const ticketCountElement = document.getElementById("ticket-count");
db.collection("tickets").doc("available").onSnapshot((doc) => {
  if (doc.exists) {
    const availableTickets = doc.data().count;
    ticketCountElement.textContent = availableTickets;
  } else {
    ticketCountElement.textContent = "Немає даних!";
  }
});

// Форма для замовлення квитків
const ticketForm = document.getElementById("ticketForm");

// Відправка форми з перевіркою reCAPTCHA
ticketForm.addEventListener("submit", (e) => {
  e.preventDefault();  // Зупиняємо стандартну поведінку відправки форми

  // Отримуємо відповідь від reCAPTCHA
  const recaptchaResponse = grecaptcha.getResponse();
  if (!recaptchaResponse) {
    alert("Підтвердьте, що ви не робот!");
    return;  // Зупиняємо подальше виконання, якщо reCAPTCHA не пройдена
  }

  // Після перевірки reCAPTCHA обробляємо замовлення
  handleTicketOrder();
});

// Функція для обробки замовлення квитків
function handleTicketOrder() {
  const name = document.getElementById("name").value;
  const surname = document.getElementById("surname").value;
  const patronymic = document.getElementById("patronymic").value;
  const phone = document.getElementById("phone").value;
  const email = document.getElementById("email").value;

  // Перевіряємо, чи користувач вже робив замовлення за останні 5 хвилин
  const ordersRef = db.collection("orders");
  ordersRef.where("email", "==", email).orderBy("timestamp", "desc").limit(1).get()
    .then((querySnapshot) => {
      if (!querySnapshot.empty) {
        const lastOrder = querySnapshot.docs[0].data();
        const now = new Date();
        const lastOrderTime = lastOrder.timestamp.toDate();
        const timeDifference = (now - lastOrderTime) / 60000; // Час в хвилинах

        if (timeDifference < 5) {
          alert("Ви вже зробили замовлення нещодавно. Зачекайте кілька хвилин.");
          return;
        }
      }

      // Якщо користувач не спамить, додаємо нове замовлення
      db.collection("orders").add({
        name: name,
        surname: surname,
        patronymic: patronymic,
        phone: phone,
        email: email,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      }).then(() => {
        const ticketRef = db.collection("tickets").doc("available");
        return ticketRef.update({
          count: firebase.firestore.FieldValue.increment(-1)
        });
      }).then(() => {
        alert('Квиток успішно замовлено!');
        ticketForm.reset();
      }).catch((error) => {
        console.error("Помилка при замовленні:", error);
        alert('Виникла помилка, спробуйте ще раз.');
      });
    });
}
