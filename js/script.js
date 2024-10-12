// script.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, increment, serverTimestamp, runTransaction } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase config
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
        alert("Підпишіть контракт з дьяволом");
        return;  // Зупиняємо подальше виконання, якщо reCAPTCHA не пройдена
    }

    // Після перевірки reCAPTCHA обробляємо замовлення
    handleTicketOrder();
});

// Функція для обробки замовлення квитків з транзакцією
async function handleTicketOrder() {
    const name = document.getElementById("name").value;
    const surname = document.getElementById("surname").value;
    const patronymic = document.getElementById("patronymic").value;
    const phone = document.getElementById("phone").value;
    const email = document.getElementById("email").value;

    try {
        // Виконуємо транзакцію для оновлення кількості квитків
        await runTransaction(db, async (transaction) => {
            const ticketDoc = await transaction.get(ticketRef);
            if (!ticketDoc.exists()) {
                throw "Документ не існує!";
            }

            const availableTickets = ticketDoc.data().available;
            if (availableTickets > 0) {
                // Оновлюємо кількість квитків
                transaction.update(ticketRef, { available: availableTickets - 1 });

                // Додаємо нове замовлення
                await addDoc(collection(db, "orders"), {
                    name,
                    surname,
                    patronymic,
                    phone,
                    email,
                    timestamp: serverTimestamp()
                });
            } else {
                throw "Немає доступних квитків!";
            }
        });

        alert('Квиток успішно замовлено!');
        ticketForm.reset();
    } catch (error) {
        console.error("Помилка при замовленні:", error);
        alert('Виникла помилка, спробуйте ще раз.');
    }
}
