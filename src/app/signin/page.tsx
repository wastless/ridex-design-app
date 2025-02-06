/*** Страница авторизации ***/
"use client";

import * as LinkButton from "~/components/ui/link-button";
import * as Divider from "~/components/ui/divider";
import * as Label from "~/components/ui/label";
import * as Input from "~/components/ui/input";
import * as FancyButton from "~/components/ui/fancy-button";
import * as Checkbox from "~/components/ui/checkbox";
import * as SocialButton from "~/components/ui/social-button";
import * as Alert from "~/components/ui/alert";
import * as Hint from "~/components/ui/hint";
import { IconFigma, IconGithub, IconGoogle } from "~/icon";
import {
  RiErrorWarningFill,
  RiEyeLine,
  RiEyeOffLine,
  RiInformationFill,
  RiLock2Line,
  RiMailLine,
  RiUserFill,
} from "@remixicon/react";
import Image from "next/image";
import { authenticate } from "../actions/auth";
import React, { useActionState, useEffect, useState } from "react";
import Cookies from "js-cookie";

export default function Page() {
  // Состояние для отображения пароля
  const [showPassword, setShowPassword] = React.useState(false);

  // Уникальный ID для чекбокса
  const uniqueId = React.useId();

  // Состояние для запоминания пользователя
  const [rememberMe, setRememberMe] = useState(false);

  // Состояние  для хранения данных формы
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Состояние для валидации формы
  const [isFormValid, setIsFormValid] = useState(false);

  // Состояние для ошибок формы
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Состояние для ответа с сервера и обработки состояния формы
  const [serverResponse, formAction, isPending] = useActionState(
    async (state: unknown, formData: FormData) => {
      return await authenticate(formData);
    },
    undefined,
  );

  // Проверка на заполнение всех полей
  useEffect(() => {
    const { email, password } = formData;
    setIsFormValid(email.trim() !== "" && password.trim() !== "");
  }, [formData]);

  // Обработка ошибок с сервера
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

  // Обработчик изменения значений в полях ввода
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Загрузка данных куки при первом рендере
  useEffect(() => {
    const savedData = Cookies.get("signin-form");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setFormData(parsedData);
      setRememberMe(true);
    }
  }, []);

  // Обновляем состояние валидации формы
  useEffect(() => {
    const { email, password } = formData;
    setIsFormValid(email.trim() !== "" && password.trim() !== "");
  }, [formData]);

  // Сохраняем или очищаем куки при изменении чекбокса
  useEffect(() => {
    if (rememberMe) {
      Cookies.set("signin-form", JSON.stringify(formData), { expires: 7 });
    } else {
      Cookies.remove("signin-form");
    }
  }, [rememberMe, formData]);

  return (
    <div className="relative h-[1024px] w-full overflow-hidden bg-bg-weak-50 text-text-strong-950">
      {/* Фоновое изображение */}
      <Image
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform"
        width={1140}
        height={440}
        alt=""
        src="image/pattern.svg"
      />

      {/* Авторизация */}
      <div className="absolute left-1/2 top-1/2 box-border flex w-[440px] -translate-x-1/2 -translate-y-1/2 transform flex-col items-start justify-center gap-6 rounded-3xl bg-bg-white-0 p-8 shadow-regular-md">
        <div className="flex flex-col items-center justify-start gap-2 self-stretch">
          {/* Иконка */}
          <div className="border-gainsboro flex h-[88px] w-[88px] items-center justify-center overflow-hidden rounded-full p-4 [background:linear-gradient(180deg,_rgba(228,_229,_231,_0.48),_rgba(247,_248,_248,_0),_rgba(228,_229,_231,_0))]">
            <div className="flex items-center justify-center overflow-hidden rounded-full border border-stroke-soft-200 bg-bg-white-0 p-3.5 shadow-regular-sm">
              <RiUserFill size={28} color="#525866" />
            </div>
          </div>

          {/* Приветственное сообщение*/}
          <div className="text-center text-title-h5">
            Рад встречи, это RideX 👋
          </div>

          {/* Ссылка на страницу входа */}
          <div className="flex flex-row items-start justify-center gap-2 self-stretch text-paragraph-sm">
            <p className="text-text-sub-600">Нет аккаунта?</p>
            <LinkButton.Root underline variant="primary">
              <a href="/signup">Регистрация</a>
            </LinkButton.Root>
          </div>
        </div>

        <Divider.Root variant="line" />

        {/*Форма с полями для ввода*/}
        <form action={formAction} className="flex w-full flex-col gap-6">
          <input type="hidden" name="redirectTo" value="/dashboard" />
          <div className="flex w-full flex-col gap-3">
            {[
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
                      {" "}
                      <Hint.Icon as={RiInformationFill} /> {formErrors[id]}
                    </Hint.Root>
                  )}
                </div>
              ),
            )}
          </div>

          {/*Опции для входа*/}
          <div className="flex flex-row items-start justify-between gap-3 self-stretch">
            <div className="flex items-center gap-2">
              <Checkbox.Root
                id="${uniqueId}-remember-me"
                checked={rememberMe}
                onCheckedChange={() => setRememberMe(!rememberMe)}
              />
              <Label.Root
                className="text-paragraph-sm"
                htmlFor={`${uniqueId}-remember-me`}
              >
                Запомнить меня
              </Label.Root>
            </div>
            <LinkButton.Root underline variant="gray">
              <a href="">Забыли пароль?</a>
            </LinkButton.Root>
          </div>

          {/*Кнопка для отправки формы*/}
          <FancyButton.Root
            type="submit"
            disabled={!isFormValid || isPending}
            variant="primary"
          >
            {isPending ? "Авторизуемся..." : "Войти"}
          </FancyButton.Root>

          {/*Ошибка при авторизации*/}
          {serverResponse && typeof serverResponse === "string" && (
            <Alert.Root variant="lighter" status="error">
              <Alert.Icon as={RiErrorWarningFill} />
              {serverResponse}
            </Alert.Root>
          )}
        </form>

        <Divider.Root variant="line-text">ИЛИ</Divider.Root>

        {/* TODO: Добавить альтернативный вход */}
        {/*Альтернативный вход*/}
        <div className="flex w-full flex-row gap-3">
          <SocialButton.Root brand="github" mode="stroke" className="w-full">
            <SocialButton.Icon as={IconGithub} />
          </SocialButton.Root>
          <SocialButton.Root brand="google" mode="stroke" className="w-full">
            <SocialButton.Icon as={IconGoogle} />
          </SocialButton.Root>
          <SocialButton.Root brand="figma" mode="stroke" className="w-full">
            <SocialButton.Icon as={IconFigma} />
          </SocialButton.Root>
        </div>
      </div>
    </div>
  );
}
