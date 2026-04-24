import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "ru" | "en";

type Dict = Record<string, { ru: string; en: string }>;

export const dict: Dict = {
  brand: { ru: "Wayzen", en: "Wayzen" },
  tagline: { ru: "Future Compass", en: "Future Compass" },
  nav_home: { ru: "Главная", en: "Home" },
  nav_catalog: { ru: "Университеты", en: "Universities" },
  nav_compare: { ru: "Сравнение", en: "Compare" },
  nav_admin: { ru: "Админ", en: "Admin" },
  nav_submit: { ru: "Предложить вуз", en: "Submit university" },
  nav_profile: { ru: "Профиль", en: "Profile" },
  nav_signin: { ru: "Войти", en: "Sign in" },
  nav_signout: { ru: "Выйти", en: "Sign out" },

  profile_title: { ru: "Мой профиль", en: "My profile" },
  profile_favorites: { ru: "Избранные университеты", en: "Favorite universities" },
  profile_history: { ru: "История просмотров", en: "View history" },
  profile_no_favorites: { ru: "Пока нет избранных. Нажмите ❤ на карточке вуза.", en: "No favorites yet. Tap ❤ on a university card." },
  profile_no_history: { ru: "Вы ещё не открывали ни одного университета.", en: "You haven't viewed any universities yet." },
  profile_clear_history: { ru: "Очистить историю", en: "Clear history" },
  fav_add: { ru: "В избранное", en: "Add to favorites" },
  fav_remove: { ru: "Убрать из избранного", en: "Remove from favorites" },
  fav_login_required: { ru: "Войдите, чтобы добавить в избранное", en: "Sign in to add favorites" },

  staff_title: { ru: "Управление сотрудниками", en: "Staff management" },
  staff_sub: { ru: "Только владелец может назначать админов и редакторов", en: "Only the owner can assign admins and editors" },
  staff_email: { ru: "Email пользователя", en: "User email" },
  staff_grant: { ru: "Назначить", en: "Grant" },
  staff_revoke: { ru: "Снять", en: "Revoke" },
  staff_role_admin: { ru: "Админ", en: "Admin" },
  staff_role_editor: { ru: "Редактор", en: "Editor" },
  staff_role_owner: { ru: "Владелец", en: "Owner" },
  staff_user_not_found: { ru: "Пользователь не найден. Сначала он должен зарегистрироваться.", en: "User not found. They must register first." },
  staff_granted: { ru: "Роль назначена", en: "Role granted" },
  staff_revoked: { ru: "Роль снята", en: "Role revoked" },

  submit_title: { ru: "Предложить новый университет", en: "Submit a new university" },
  submit_sub: {
    ru: "Заполните шаблон. После одобрения владельцем университет появится на сайте.",
    en: "Fill out the template. The university will appear on the site after the owner approves.",
  },
  submit_send: { ru: "Отправить на модерацию", en: "Submit for review" },
  submit_my: { ru: "Мои заявки", en: "My submissions" },
  submit_no_access: {
    ru: "Чтобы предлагать университеты, попросите владельца выдать вам роль редактора.",
    en: "To submit universities, ask the owner to grant you the editor role.",
  },
  submit_success: { ru: "Заявка отправлена!", en: "Submission sent!" },
  submit_status_pending: { ru: "На рассмотрении", en: "Pending" },
  submit_status_approved: { ru: "Одобрено", en: "Approved" },
  submit_status_rejected: { ru: "Отклонено", en: "Rejected" },

  admin_submissions: { ru: "Заявки на университеты", en: "University submissions" },
  admin_review: { ru: "Рассмотреть", en: "Review" },
  admin_approve: { ru: "Одобрить и опубликовать", en: "Approve & publish" },
  admin_reject: { ru: "Отклонить", en: "Reject" },
  admin_notes: { ru: "Комментарий (опционально)", en: "Notes (optional)" },
  admin_no_pending: { ru: "Нет заявок на рассмотрении", en: "No pending submissions" },

  hero_title: { ru: "Ваш компас в мир университетов", en: "Your compass to the world of universities" },
  hero_sub: {
    ru: "Гид для студентов из СНГ: США, Европа и Азия. Требования, баллы, стоимость, гранты, жильё и шансы поступления — всё в одном месте.",
    en: "A guide for CIS students: USA, Europe, Asia. Requirements, scores, cost, grants, housing and admission chances — all in one place.",
  },
  hero_cta: { ru: "Смотреть университеты", en: "Browse universities" },
  hero_cta2: { ru: "Сравнить вузы", en: "Compare schools" },

  region_usa: { ru: "США", en: "USA" },
  region_europe: { ru: "Европа", en: "Europe" },
  region_asia: { ru: "Азия", en: "Asia" },
  region_all: { ru: "Все регионы", en: "All regions" },

  filter_region: { ru: "Регион", en: "Region" },
  filter_grant: { ru: "Полный грант", en: "Full grant" },
  filter_search: { ru: "Поиск...", en: "Search..." },

  s_overview: { ru: "О вузе", en: "Overview" },
  s_requirements: { ru: "Требования", en: "Requirements" },
  s_scores: { ru: "Баллы тестов", en: "Test scores" },
  s_values: { ru: "Ценности", en: "Values" },
  s_chance: { ru: "Шанс поступления", en: "Admission chance" },
  s_cost: { ru: "Стоимость и гранты", en: "Cost & grants" },
  s_housing: { ru: "Жильё", en: "Housing" },
  dorm_cost: { ru: "Общежитие", en: "Dorm" },
  rent_cost: { ru: "Аренда жилья", en: "Off-campus rent" },
  per_month: { ru: "$/мес", en: "$/mo" },
  s_alumni: { ru: "Известные выпускники", en: "Famous alumni" },
  alumni_year: { ru: "Год выпуска", en: "Class of" },
  s_ranking: { ru: "Рейтинг", en: "Ranking" },

  full_grant_yes: { ru: "Доступен полный грант", en: "Full grant available" },
  full_grant_no: { ru: "Полный грант недоступен", en: "No full grant" },
  tuition_year: { ru: "$/год", en: "$/year" },
  admission: { ru: "приём", en: "admission" },
  world_rank: { ru: "место в мире", en: "world rank" },

  open_site: { ru: "Сайт университета", en: "University website" },
  back: { ru: "Назад", en: "Back" },
  loading: { ru: "Загрузка...", en: "Loading..." },
  empty: { ru: "Ничего не найдено", en: "Nothing found" },

  compare_title: { ru: "Сравнение университетов", en: "Compare universities" },
  compare_sub: { ru: "Выберите до 3 вузов", en: "Pick up to 3 universities" },
  compare_pick: { ru: "Добавить к сравнению", en: "Add to compare" },
  compare_remove: { ru: "Убрать", en: "Remove" },
  compare_clear: { ru: "Очистить", en: "Clear all" },

  auth_signin: { ru: "Вход", en: "Sign in" },
  auth_signup: { ru: "Регистрация", en: "Sign up" },
  auth_email: { ru: "Email", en: "Email" },
  auth_password: { ru: "Пароль", en: "Password" },
  auth_submit_in: { ru: "Войти", en: "Sign in" },
  auth_submit_up: { ru: "Создать аккаунт", en: "Create account" },
  auth_switch_to_up: { ru: "Нет аккаунта? Регистрация", en: "No account? Sign up" },
  auth_switch_to_in: { ru: "Уже есть аккаунт? Войти", en: "Have account? Sign in" },

  admin_title: { ru: "Админ-панель", en: "Admin panel" },
  admin_add: { ru: "Добавить университет", en: "Add university" },
  admin_edit: { ru: "Редактировать", en: "Edit" },
  admin_delete: { ru: "Удалить", en: "Delete" },
  admin_save: { ru: "Сохранить", en: "Save" },
  admin_cancel: { ru: "Отмена", en: "Cancel" },
  admin_no_access: {
    ru: "Нет доступа. Нужна роль admin.",
    en: "No access. Admin role required.",
  },

  footer: {
    ru: "© Wayzen — Future Compass. Помощь будущим студентам.",
    en: "© Wayzen — Future Compass. Helping future students.",
  },
};

export function t(key: keyof typeof dict, lang: Lang) {
  return dict[key]?.[lang] ?? key;
}

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: keyof typeof dict) => string;
}

const Ctx = createContext<LangCtx | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ru");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("wayzen.lang") as Lang | null;
    if (saved === "ru" || saved === "en") setLangState(saved);
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("wayzen.lang", l);
  };
  return (
    <Ctx.Provider value={{ lang, setLang, t: (k) => t(k, lang) }}>
      {children}
    </Ctx.Provider>
  );
}

export function useLang() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useLang must be used within LangProvider");
  return c;
}
