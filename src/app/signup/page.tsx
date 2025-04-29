"use client";

/**
 * Страница регистрации нового пользователя
 * Предоставляет форму для создания учетной записи с именем, email и паролем
 */

import * as LinkButton from "~/components/ui/link-button";
import * as Divider from "~/components/ui/divider";
import * as Label from "~/components/ui/label";
import * as Input from "~/components/ui/input";
import * as FancyButton from "~/components/ui/fancy-button";
import * as Alert from "~/components/ui/alert";
import * as Hint from "~/components/ui/hint";
import {
  RiErrorWarningFill,
  RiEyeLine,
  RiEyeOffLine,
  RiInformationFill,
  RiLock2Line,
  RiMailLine,
  RiUserAddFill,
  RiUserLine,
} from "@remixicon/react";
import Image from "next/image";
import { register } from "../actions/auth";
import React, { useActionState, useEffect, useState } from "react";

export default function SignUpPage() {
  // Состояние для отображения/скрытия пароля
  const [showPassword, setShowPassword] = useState(false);

  // Состояние для хранения данных формы регистрации
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Состояние для валидации формы
  const [isFormValid, setIsFormValid] = useState(false);

  // Состояние для ошибок валидации формы
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Состояние для ответа с сервера и обработки состояния формы
  const [serverResponse, formAction, isPending] = useActionState(
    async (state: unknown, formData: FormData) => {
      return await register(formData);
    },
    undefined,
  );

  /**
   * Перенаправление на страницу входа после успешной регистрации
   */
  useEffect(() => {
    if (
      serverResponse &&
      typeof serverResponse === "object" &&
      "success" in serverResponse &&
      serverResponse.success
    ) {
      window.location.href = "/signin";
    }
  }, [serverResponse]);

  /**
   * Проверка заполнения всех обязательных полей формы
   */
  useEffect(() => {
    const { name, email, password } = formData;
    setIsFormValid(
      name.trim() !== "" && email.trim() !== "" && password.trim() !== "",
    );
  }, [formData]);

  /**
   * Обработка ошибок, полученных с сервера
   */
  useEffect(() => {
    if (serverResponse && typeof serverResponse === "object") {
      const errors = Object.fromEntries(
        Object.entries(serverResponse).map(([key, value]) => [
          key,
          Array.isArray(value) ? value.join(", ") : String(value),
        ]),
      );
      setFormErrors(errors);
    } else {
      setFormErrors({});
    }
  }, [serverResponse]);

  /**
   * Обработчик изменения значений в полях ввода
   * @param {React.ChangeEvent<HTMLInputElement>} e - Событие изменения поля ввода
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Очистка сообщения об ошибке при изменении значения поля
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center overflow-y-auto overflow-x-hidden bg-bg-weak-50 px-4 py-8 text-text-strong-950">
      {/* Фоновый узор */}
      <Image
        className="pointer-events-none fixed left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 transform"
        width={1140}
        height={440}
        alt=""
        src="image/pattern.svg"
      />

      {/* Контейнер формы регистрации */}
      <div className="w-full max-w-[440px] rounded-3xl bg-bg-white-0 p-6 shadow-regular-md sm:p-8">
        <div className="flex flex-col items-center justify-start gap-2 self-stretch">
          {/* Декоративная иконка нового пользователя */}
          <div className="border-gainsboro flex h-[88px] w-[88px] items-center justify-center overflow-hidden rounded-full p-4 [background:linear-gradient(180deg,_rgba(228,_229,_231,_0.48),_rgba(247,_248,_248,_0),_rgba(228,_229,_231,_0))]">
            <div className="flex items-center justify-center overflow-hidden rounded-full border border-stroke-soft-200 bg-bg-white-0 p-3.5 shadow-regular-sm">
              <RiUserAddFill size={28} color="#525866" />
            </div>
          </div>

          {/* Приветственное сообщение */}
          <div className="text-center text-title-h5">
            Добро пожаловать, это RideX 👋
          </div>

          {/* Ссылка на страницу входа */}
          <div className="flex flex-row items-start justify-center gap-2 self-stretch text-paragraph-sm">
            <p className="text-text-sub-600">Уже есть аккаунт?</p>
            <LinkButton.Root underline variant="primary">
              <a href="/signin">Войти</a>
            </LinkButton.Root>
          </div>
        </div>

        <Divider.Root variant="line" className="my-6" />

        {/* Форма регистрации */}
        <form action={formAction} className="flex w-full flex-col gap-6">
          <div className="flex w-full flex-col gap-3">
            {/* Поля для ввода имени, email и пароля */}
            {[
              {
                id: "name",
                label: "Имя пользователя",
                icon: RiUserLine,
                placeholder: "Иван",
              },
              {
                id: "email",
                label: "Email",
                icon: RiMailLine,
                placeholder: "hello@ridex.com",
                type: "text",
              },
              {
                id: "password",
                label: "Пароль",
                icon: RiLock2Line,
                placeholder: "••••••••••",
                type: showPassword ? "text" : "password",
                toggleIcon: showPassword ? RiEyeOffLine : RiEyeLine,
              },
            ].map(
              ({
                id,
                label,
                icon: Icon,
                placeholder,
                type = "text",
                toggleIcon: ToggleIcon,
              }) => (
                <div key={id} className="flex flex-col gap-1">
                  <Label.Root htmlFor={id}>{label}</Label.Root>
                  <Input.Root hasError={!!formErrors[id]}>
                    <Input.Wrapper>
                      <Input.Icon as={Icon} />
                      <Input.Input
                        id={id}
                        name={id}
                        required
                        type={type}
                        placeholder={placeholder}
                        value={formData[id as keyof typeof formData] || ""}
                        onChange={handleChange}
                      />
                      {id === "password" && ToggleIcon && (
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                        >
                          <ToggleIcon className="size-5 text-text-soft-400" />
                        </button>
                      )}
                    </Input.Wrapper>
                  </Input.Root>
                  {formErrors[id] && (
                    <Hint.Root hasError>
                      <Hint.Icon as={RiInformationFill} /> {formErrors[id]}
                    </Hint.Root>
                  )}
                </div>
              ),
            )}
          </div>

          {/* Кнопка отправки формы */}
          <FancyButton.Root
            type="submit"
            disabled={!isFormValid || isPending}
            variant="primary"
          >
            {isPending ? "Регистрация..." : "Создать"}
          </FancyButton.Root>

          {/* Сообщение об ошибке регистрации */}
          {serverResponse && typeof serverResponse === "string" && (
            <Alert.Root variant="lighter" status="error">
              <Alert.Icon as={RiErrorWarningFill} />
              {serverResponse}
            </Alert.Root>
          )}
        </form>
      </div>
    </div>
  );
}
