import { useRef, useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import "./Registration.css";

function Registration() {
  // Создаем ссылки на DOM-элементы полей формы
  const formRef = useRef(null);
  const emailRef = useRef(null);
  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const messageRef = useRef(null);

  // Состояния компонента
  const [isLoading, setIsLoading] = useState(false); // Загрузка отправки
  const [message, setMessage] = useState(""); // Сообщение для уведомления
  const [isFormValid, setIsFormValid] = useState(false); // Валидность всей формы
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    name: "",
    phone: "",
  }); // Ошибки валидации для каждого поля
  const [touchedFields, setTouchedFields] = useState({
    email: false,
    name: false,
    phone: false,
  }); // Отслеживание полей, редактируемых пользователем

  // Валидация email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email обязателен для заполнения";
    if (!emailRegex.test(email)) return "Введите корректный email";
    return "";
  };

  // Валидация имени
  const validateName = (name) => {
    if (!name) return "Имя обязательно для заполнения";
    if (name.length < 2) return "Имя должно содержать минимум 2 символа";
    if (!/^[a-zA-Zа-яА-ЯёЁ\s\-]+$/.test(name))
      return "Имя может содержать только буквы, пробелы и дефисы";
    return "";
  };

  // Валидация телефона
  const validatePhone = (phone) => {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{11,13}$/;
    if (!phone) return "Телефон обязателен для заполнения";
    if (!phoneRegex.test(phone)) return "Введите корректный номер телефона";
    return "";
  };

  // Обработчик изменения поля
  const handleFieldChange = (fieldName, value) => {
    // Помечаем поле как редактируемое
    if (!touchedFields[fieldName]) {
      setTouchedFields((prev) => ({
        ...prev,
        [fieldName]: true,
      }));
    }

    // Валидация и ошибки
    let error = "";
    switch (fieldName) {
      case "email":
        error = validateEmail(value);
        break;
      case "name":
        error = validateName(value);
        break;
      case "phone":
        error = validatePhone(value);
        break;
      default:
        break;
    }

    // Обновление ошибки
    setFieldErrors((prev) => ({
      ...prev,
      [fieldName]: error,
    }));
  };

  // Валидация всей формы
  useEffect(() => {
    const checkFormValidity = () => {
      const email = emailRef.current?.value?.trim();
      const name = nameRef.current?.value?.trim();
      const phone = phoneRef.current?.value?.trim();

      // Форма валидна если все поля заполнены и нет ошибок валидации
      const isValid =
        email &&
        name &&
        phone &&
        !validateEmail(email) &&
        !validateName(name) &&
        !validatePhone(phone);
      setIsFormValid(!!isValid);
    };

    // Получаем все input
    const inputs = [
      emailRef.current,
      nameRef.current,
      phoneRef.current,
      messageRef.current,
    ];

    // Добавляем обработчики на каждое поле
    inputs.forEach((input) => {
      input?.addEventListener("input", checkFormValidity);
    });

    // Первоначальная проверка при загрузке
    checkFormValidity();

    // Удаляем обработчики
    return () => {
      inputs.forEach((input) => {
        input?.removeEventListener("input", checkFormValidity);
      });
    };
  }, []);

  // Автоматическое скрытие уведомления через 5 секунд
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Основной обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault(); // Предотвращаем стандартное поведение формы
    setIsLoading(true); // Включаем состояние загрузки
    setMessage(""); // Сбрасываем предыдущие сообщения

    // Отображение ошибки, если пользователь попытается отправить пустую форму
    setTouchedFields({
      email: true,
      name: true,
      phone: true,
    });

    // Финальная проверка перед отправкой
    const email = emailRef.current?.value?.trim();
    const name = nameRef.current?.value?.trim();
    const phone = phoneRef.current?.value?.trim();

    const emailError = validateEmail(email);
    const nameError = validateName(name);
    const phoneError = validatePhone(phone);

    // Если есть ошибки валидации - показываем ошибку и прерываем отправку
    if (emailError || nameError || phoneError) {
      setFieldErrors({
        email: emailError,
        name: nameError,
        phone: phoneError,
      });
      setMessage("error");
      setIsLoading(false);
      return;
    }

    // Дополнительная проверка на валидность формы
    if (!isFormValid) {
      setMessage("error");
      setIsLoading(false);
      return;
    }

    try {
      // Параметры для отправки через EmailJS
      const templateParams = {
        user_name: nameRef.current?.value?.trim() || "",
        user_email: emailRef.current?.value?.trim() || "",
        user_phone: phoneRef.current?.value?.trim() || "",
        user_message: messageRef.current?.value?.trim() || "Не указано", // Запасное значение для пустого сообщения
        date: new Date().toLocaleString("ru-RU"), // Текущая дата в российском формате
      };

      console.log("Отправляемые параметры:", templateParams);

      // Отправка письма через EmailJS сервис
      const result = await emailjs.send(
        "service_ok2hqod", // ID сервиса в EmailJS
        "template_jfsxfsx", // ID шаблона в EmailJS
        templateParams, // Данные для подстановки в шаблон
        "pLQq_Z4lItNBlOGf5" // Public key для доступа к сервису
      );

      console.log("Сообщение отправлено:", result);
      setMessage("success"); // Показываем успешное уведомление
      clearForm(); // Очищаем форму после успешной отправки
    } catch (error) {
      // Обработка ошибок отправки
      console.error("Ошибка отправки:", error);
      setMessage("error"); // Показываем уведомление об ошибке
    } finally {
      // Выключаем состояние загрузки в любом случае
      setIsLoading(false);
    }
  };

  // Очистка формы
  const clearForm = () => {
    [emailRef, nameRef, phoneRef, messageRef].forEach((ref) => {
      if (ref.current) ref.current.value = "";
    });
    setIsFormValid(false);
    setFieldErrors({ email: "", name: "", phone: "" });
    setTouchedFields({ email: false, name: false, phone: false });
  };

  // Функция для получения текста уведомления
  const getNotificationText = () => {
    return message === "success"
      ? "Заявка успешно отправлена!"
      : "Ошибка отправки!";
  };

  return (
    <section className="registration section" id="order">
      {/* Всплывающее уведомление - отображается сверху на 5 секунд */}
      {message && (
        <div
          className={`notification ${
            message === "success"
              ? "notification--success"
              : "notification--error"
          }`}
        >
          {getNotificationText()}
        </div>
      )}

      <h1 className="registration__title">Регистрация</h1>

      {/* Основная форма */}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="registration__form"
      >
        <ul className="registration__list">
          <li className="registration__item">
            <p className="registration__label">Электронная почта</p>
            <input
              ref={emailRef}
              className={`registration__input ${
                touchedFields.email && fieldErrors.email
                  ? "registration__input--error"
                  : ""
              }`}
              type="email"
              placeholder="Ваша электронная почта"
              required
              onChange={(e) => handleFieldChange("email", e.target.value)}
              onBlur={(e) => handleFieldChange("email", e.target.value)}
            />
            {/* Показываем ошибку только, если поле было тронуто, и есть ошибка */}
            {touchedFields.email && fieldErrors.email && (
              <span className="registration__error">{fieldErrors.email}</span>
            )}
          </li>

          <li className="registration__item">
            <p className="registration__label">Имя</p>
            <input
              ref={nameRef}
              className={`registration__input ${
                touchedFields.name && fieldErrors.name
                  ? "registration__input--error"
                  : ""
              }`}
              type="text"
              placeholder="Ваше имя"
              required
              onChange={(e) => handleFieldChange("name", e.target.value)}
              onBlur={(e) => handleFieldChange("name", e.target.value)}
            />
            {touchedFields.name && fieldErrors.name && (
              <span className="registration__error">{fieldErrors.name}</span>
            )}
          </li>

          <li className="registration__item">
            <p className="registration__label">Номер телефона</p>
            <input
              ref={phoneRef}
              className={`registration__input ${
                touchedFields.phone && fieldErrors.phone
                  ? "registration__input--error"
                  : ""
              }`}
              type="tel"
              placeholder="Ваш номер телефона"
              required
              onChange={(e) => handleFieldChange("phone", e.target.value)}
              onBlur={(e) => handleFieldChange("phone", e.target.value)}
            />
            {touchedFields.phone && fieldErrors.phone && (
              <span className="registration__error">{fieldErrors.phone}</span>
            )}
          </li>

          <li className="registration__item">
            <p className="registration__label">Пожелания</p>
            <textarea
              ref={messageRef}
              className="registration__input registration__input-wishes"
              placeholder="Ваши пожелания (необязательно)"
            ></textarea>
          </li>
        </ul>

        <button
          type="submit"
          className="registration__button"
          disabled={isLoading || !isFormValid}
        >
          {isLoading ? "Отправка..." : "Отправить заявку"}
        </button>
      </form>

      <p className="registration__warning">
        Нажимая на кнопку, вы даете согласие на обработку персональных данных и
        соглашаетесь c политикой конфиденциальности
      </p>
    </section>
  );
}

export default Registration;
