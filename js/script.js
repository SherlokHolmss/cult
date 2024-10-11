// Firebase config
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, increment, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA3JNIYdxnuDV1tPo5iIAFp3zSYUx9vIqo",
    authDomain: "cult-71154.firebaseapp.com",
    projectId: "cult-71154",
    storageBucket: "cult-71154.appspot.com",
    messagingSenderId: "935641175512",
    appId: "1:935641175512:web:2bbc1de3f8d56707e14ead",
    measurementId: "G-2W709LWCR9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Оновлення кількості квитків на сторінці
const ticketCountElement = document.getElementById("ticket-count");
const ticketRef = doc(db, "tickets", "concert2024");
onSnapshot(ticketRef, (doc) => {
    if (doc.exists()) {
        const data = doc.data();
        ticketCountElement.textContent = `Кількість доступних квитків: ${data.available}`;
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
async function handleTicketOrder() {
    const name = document.getElementById("name").value;
    const surname = document.getElementById("surname").value;
    const patronymic = document.getElementById("patronymic").value;
    const phone = document.getElementById("phone").value;
    const email = document.getElementById("email").value;

    try {
        // Додаємо нове замовлення
        await addDoc(collection(db, "orders"), {
            name,
            surname,
            patronymic,
            phone,
            email,
            timestamp: serverTimestamp()
        });

        // Оновлюємо кількість квитків
        await updateDoc(ticketRef, {
            available: increment(-1)
        });

        alert('Квиток успішно замовлено!');
        ticketForm.reset();
    } catch (error) {
        console.error("Помилка при замовленні:", error);
        alert('Виникла помилка, спробуйте ще раз.');
    }
}
