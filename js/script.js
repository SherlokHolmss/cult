// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyA3JNIYdxnuDV1tPo5iIAFp3zSYUx9vIqo",
    authDomain: "cult-71154.firebaseapp.com",
    projectId: "cult-71154",
    storageBucket: "cult-71154.appspot.com",
    messagingSenderId: "935641175512",
    appId: "1:935641175512:web:2bbc1de3f8d56707e14ead",
    measurementId: "G-2W709LWCR9"
}

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Форма для замовлення квитків
const ticketForm = document.getElementById("ticketForm");

// Оновлення кількості квитків на сторінці (для відображення доступних квитків)
const ticketCountElement = document.getElementById("ticket-count");
db.collection("tickets").doc("concert2024").onSnapshot((doc) => {
  if (doc.exists) {
    const availableTickets = doc.data().available;
    ticketCountElement.textContent = availableTickets;
  } else {
    ticketCountElement.textContent = "Немає даних!";
  }
});

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
        concert: "Концерт гурту CULT",  // Назва концерту
        date: "2024-10-15",            // Дата концерту
        price: 100,                    // Ціна квитка
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      }).then(() => {
        const ticketRef = db.collection("tickets").doc("concert2024");
        return ticketRef.update({
          available: firebase.firestore.FieldValue.increment(-1)
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
