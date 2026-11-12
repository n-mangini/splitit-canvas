// API falsa del prototipo. Responde las mismas rutas que la API real, con los
// datos de ejemplo de siempre (la Juntada Asado), para que las pantallas
// copiadas del front oficial funcionen sin backend.
//
// Los cambios (crear, editar, borrar) viven en memoria hasta recargar.
//
// Algunos estados del canvas salen de la direccion de la pantalla:
// - `?escenario=vacio`           Mis eventos sin ningun evento
// - `?escenario=sin-sesion`      sin cuenta iniciada (la landing ya arranca asi)
// - `?escenario=sin-integrantes` invitacion donde todos ya entraron con su cuenta
// - `?escenario=ya-vinculado`    invitacion de una cuenta que ya es integrante
// - `?escenario=invitado`        sesion de invitado sin cuenta (Francisco, en la Juntada Asado)
// - `?escenario=google`          la cuenta ingresa con Google (Mi cuenta: email fijo)
// - `?escenario=cuenta-google`   el login con contraseña rechaza una cuenta de Google
// - `?escenario=cuenta-existente` Google con un email que ya tiene cuenta (ver google-auth-button)

import { ApiError } from "@/lib/api";

type Member = { id: number; name: string; email: string | null; isGuest: boolean };
type MockEvent = {
  id: number;
  name: string;
  description: string | null;
  iconKey: string | null;
  baseCurrency: string;
  members: Member[];
};
type MockExpense = {
  id: number;
  eventId: number;
  name: string;
  originalAmount: number;
  originalCurrency: string;
  baseAmount: number;
  baseCurrency: string;
  paidByMember: { id: number; name: string };
  expenseDate: string;
};

export const INVITE_TOKEN = "r7Qk2Vx9mLpZ4tHnCwB3sd";

const USER = { id: 1, name: "Nicolas", email: "nicolas@email.com" };

// Francisco es el integrante sin cuenta: es quien entra como invitado.
const GUEST = { type: "guest" as const, eventId: 1, memberId: 2, name: "Francisco" };
type Guest = typeof GUEST;

// Francisco no tiene cuenta a proposito: es el integrante que queda libre para
// vincular cuando alguien entra por el enlace con su cuenta.
const members = (): Member[] => [
  { id: 1, name: "Nicolas", email: "nicolas@email.com", isGuest: false },
  { id: 2, name: "Francisco", email: null, isGuest: true },
  { id: 3, name: "Lucas", email: "lucas@email.com", isGuest: false },
  { id: 4, name: "Marcos", email: "marcos@email.com", isGuest: false },
];

// Cotizaciones fijas contra el peso, para que el gasto en otra moneda muestre
// siempre la misma conversion.
const RATES_TO_ARS: Record<string, number> = {
  ARS: 1,
  USD: 1200,
  EUR: 1300,
  BRL: 220,
  UYU: 30,
  CLP: 1.3,
};

const store = {
  user: { ...USER },
  // Sesion abierta en esta pestaña: la del escenario hasta que se entra o se sale.
  session: undefined as "user" | Guest | null | undefined,
  nextId: 1000,
  events: [
    {
      id: 1,
      name: "Juntada Asado",
      description: "Asado del sabado en casa de Nicolas",
      iconKey: "food",
      baseCurrency: "ARS",
      members: members(),
    },
    {
      id: 2,
      name: "Depto compartido",
      description: "Gastos mensuales del departamento",
      iconKey: "house",
      baseCurrency: "ARS",
      members: members(),
    },
    {
      id: 3,
      name: "Cumple de Ana",
      description: "Fiesta de cumpleanos",
      iconKey: "party",
      baseCurrency: "ARS",
      members: members(),
    },
    // El evento creado con lo minimo: sin descripcion y sin icono elegido.
    {
      id: 4,
      name: "Salida del sabado",
      description: null,
      iconKey: null,
      baseCurrency: "ARS",
      members: members(),
    },
  ] as MockEvent[],
  expenses: [
    expense(1, 1, "Carne y achuras", 32000, 1),
    expense(2, 1, "Bebidas", 14500, 4),
    expense(3, 1, "Carbon y leña", 6800, 3),
    expense(4, 1, "Ensaladas y pan", 9200, 2),
    expense(5, 1, "Postre y helado", 7400, 1),
    // El depto junta mas de una pagina de gastos (la API trae de a 20).
    ...departmentExpenses(),
  ] as MockExpense[],
};

function expense(
  id: number,
  eventId: number,
  name: string,
  amount: number,
  payerId: number,
  date = "2024-03-16"
): MockExpense {
  const payer = members().find((m) => m.id === payerId)!;
  return {
    id,
    eventId,
    name,
    originalAmount: amount,
    originalCurrency: "ARS",
    baseAmount: amount,
    baseCurrency: "ARS",
    paidByMember: { id: payer.id, name: payer.name },
    expenseDate: date,
  };
}

function departmentExpenses(): MockExpense[] {
  const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"];
  const bills: [string, number, number, string][] = [
    ["Alquiler", 150000, 1, "01"],
    ["Expensas", 42000, 3, "05"],
    ["Luz", 8500, 2, "10"],
    ["Internet", 12000, 4, "15"],
  ];
  return months.flatMap((month, i) =>
    bills.map(([bill, amount, payer, day], j) =>
      expense(
        6 + i * bills.length + j,
        2,
        `${bill} ${month}`,
        amount,
        payer,
        `2024-${String(i + 1).padStart(2, "0")}-${day}`
      )
    )
  );
}

const PAGE_SIZE = 20;

// Mas nuevo primero; a igual fecha, el de id mas alto. Igual que la API.
function byNewest(a: MockExpense, b: MockExpense) {
  return b.expenseDate.localeCompare(a.expenseDate) || b.id - a.id;
}

function expensePage(event: MockEvent, query: URLSearchParams) {
  const all = store.expenses.filter((e) => e.eventId === event.id).sort(byNewest);
  const beforeDate = query.get("beforeDate");
  const beforeId = Number(query.get("beforeId"));
  const rest = beforeDate
    ? all.filter(
        (e) => e.expenseDate < beforeDate || (e.expenseDate === beforeDate && e.id < beforeId)
      )
    : all;
  return {
    items: rest.slice(0, PAGE_SIZE),
    hasNext: rest.length > PAGE_SIZE,
    totalCount: all.length,
    totalAmount: round(all.reduce((sum, e) => sum + e.baseAmount, 0)),
  };
}

// La sesion sobrevive a una recarga como la cookie de la API real. Se guarda en
// `window.name` porque es de cada iframe: un artboard no le pasa su sesion a otro.
const SESSION_PREFIX = "splitit-canvas-session:";

function savedSession(): "user" | Guest | null | undefined {
  if (typeof window === "undefined" || !window.name.startsWith(SESSION_PREFIX)) return undefined;
  try {
    return JSON.parse(window.name.slice(SESSION_PREFIX.length));
  } catch {
    return undefined;
  }
}

function setSession(session: "user" | Guest | null) {
  store.session = session;
  if (typeof window !== "undefined") window.name = SESSION_PREFIX + JSON.stringify(session);
}

function currentSession(esc: Set<string>): typeof USER | Guest | null {
  // Al abrir el artboard manda su escenario; si no trae uno, la sesion guardada.
  if (store.session === undefined) {
    if (esc.has("sin-sesion")) store.session = null;
    else if (esc.has("invitado")) store.session = GUEST;
    else store.session = savedSession() ?? "user";
  }
  return store.session === "user" ? store.user : store.session;
}

function currentGuest(esc: Set<string>): Guest | null {
  const session = currentSession(esc);
  return session && "type" in session ? session : null;
}

// Se pueden combinar separados por coma: `?escenario=sin-sesion,sin-integrantes`.
function scenario(): Set<string> {
  if (typeof window === "undefined") return new Set();
  const fromQuery = new URLSearchParams(window.location.search).get("escenario");
  if (fromQuery) return new Set(fromQuery.split(","));
  // La landing redirige a Mis eventos si hay sesion: en el canvas se ve sin.
  if (window.location.pathname.startsWith("/inicio")) return new Set(["sin-sesion"]);
  return new Set();
}

function summary(event: MockEvent) {
  const { members: list, ...rest } = event;
  return { ...rest, memberCount: list.length };
}

function findEvent(id: string): MockEvent {
  const event = store.events.find((e) => String(e.id) === id);
  if (!event) throw new ApiError(404, "No encontramos este evento.");
  return event;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function toBase(amount: number, currency: string, base: string) {
  const rate = (RATES_TO_ARS[currency] ?? 1) / (RATES_TO_ARS[base] ?? 1);
  return { rate, baseAmount: round(amount * rate) };
}

function balances(event: MockEvent) {
  const list = store.expenses.filter((e) => e.eventId === event.id);
  const total = list.reduce((sum, e) => sum + e.baseAmount, 0);
  const share = total / event.members.length;
  return event.members.map((m) => {
    const paid = list
      .filter((e) => e.paidByMember.id === m.id)
      .reduce((sum, e) => sum + e.baseAmount, 0);
    return { memberId: m.id, memberName: m.name, netBalance: round(paid - share) };
  });
}

function suggestedPayments(event: MockEvent) {
  const debtors = balances(event)
    .filter((b) => b.netBalance < -0.005)
    .map((b) => ({ ...b, left: -b.netBalance }))
    .sort((a, b) => b.left - a.left);
  const creditors = balances(event)
    .filter((b) => b.netBalance > 0.005)
    .map((b) => ({ ...b, left: b.netBalance }))
    .sort((a, b) => b.left - a.left);
  const payments = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(debtors[i].left, creditors[j].left);
    payments.push({
      fromMember: { id: debtors[i].memberId, name: debtors[i].memberName },
      toMember: { id: creditors[j].memberId, name: creditors[j].memberName },
      amount: round(amount),
    });
    debtors[i].left -= amount;
    creditors[j].left -= amount;
    if (debtors[i].left < 0.005) i++;
    if (creditors[j].left < 0.005) j++;
  }
  return payments;
}

type Body = Record<string, unknown>;

function handle(method: string, path: string, query: URLSearchParams, body: Body): unknown {
  const esc = scenario();
  let m: RegExpMatchArray | null;

  // Acceso
  if (path === "/api/auth/session") return currentSession(esc);
  if (path === "/api/auth/login") {
    if (esc.has("cuenta-google")) throw new ApiError(409, "Esta cuenta ingresa con Google");
    setSession("user");
    return undefined;
  }
  if (path === "/api/auth/register" || path === "/api/auth/google") {
    setSession("user");
    return undefined;
  }
  if (path === "/api/auth/logout") {
    setSession(null);
    return undefined;
  }
  if (path === "/api/me") {
    const signsInWithGoogle = esc.has("google");
    if (method === "PUT" || method === "PATCH") {
      const { name, email } = body as { name?: string; email?: string };
      store.user = { ...store.user, name: name ?? store.user.name };
      if (!signsInWithGoogle && email) store.user.email = email;
    }
    return { ...store.user, signsInWithGoogle };
  }

  // Eventos
  if (path === "/api/events") {
    if (method === "POST") {
      const id = store.nextId++;
      const names = (body.participantNames as string[] | undefined) ?? [];
      const event: MockEvent = {
        id,
        name: String(body.name),
        description: (body.description as string) ?? null,
        iconKey: (body.iconKey as string) ?? null,
        baseCurrency: String(body.baseCurrency ?? "ARS"),
        members: [
          { id: 1, name: store.user.name, email: store.user.email, isGuest: false },
          ...names.map((name, i) => ({ id: id * 10 + i, name, email: null, isGuest: true })),
        ],
      };
      store.events.unshift(event);
      return summary(event);
    }
    return esc.has("vacio") ? [] : store.events.map(summary);
  }

  if ((m = path.match(/^\/api\/events\/([^/]+)$/))) {
    const event = findEvent(m[1]);
    if (method === "PUT") {
      Object.assign(event, {
        name: body.name,
        description: body.description ?? null,
        iconKey: body.iconKey ?? null,
      });
      return summary(event);
    }
    if (method === "DELETE") {
      store.events = store.events.filter((e) => e !== event);
      return undefined;
    }
    const guest = currentGuest(esc);
    if (guest && guest.eventId !== event.id) throw new ApiError(403, "No tenés acceso a este evento.");
    return {
      ...summary(event),
      members: event.members,
      isOwner: !guest,
      ...(guest && { guestMemberId: guest.memberId }),
    };
  }

  if ((m = path.match(/^\/api\/events\/([^/]+)\/invite-link$/))) {
    findEvent(m[1]);
    return { token: INVITE_TOKEN };
  }

  // Gastos
  if ((m = path.match(/^\/api\/events\/([^/]+)\/expenses\/quote$/))) {
    const event = findEvent(m[1]);
    const amount = Number(query.get("amount"));
    const currency = query.get("currency") ?? event.baseCurrency;
    const { rate, baseAmount } = toBase(amount, currency, event.baseCurrency);
    return {
      originalAmount: amount,
      originalCurrency: currency,
      baseCurrency: event.baseCurrency,
      exchangeRate: rate,
      baseAmount,
    };
  }

  if ((m = path.match(/^\/api\/events\/([^/]+)\/expenses(?:\/([^/]+))?$/))) {
    const event = findEvent(m[1]);
    const expenseId = m[2];
    if (method === "GET" && !expenseId) {
      return expensePage(event, query);
    }
    if (method === "DELETE") {
      store.expenses = store.expenses.filter((e) => String(e.id) !== expenseId);
      return undefined;
    }
    const amount = Number(body.amount);
    const currency = String(body.currency ?? event.baseCurrency);
    const payer = event.members.find((x) => x.id === Number(body.paidByMemberId))!;
    const fields = {
      name: String(body.name),
      originalAmount: amount,
      originalCurrency: currency,
      baseAmount: toBase(amount, currency, event.baseCurrency).baseAmount,
      baseCurrency: event.baseCurrency,
      paidByMember: { id: payer.id, name: payer.name },
    };
    if (method === "PUT") {
      const current = store.expenses.find((e) => String(e.id) === expenseId);
      if (!current) throw new ApiError(404, "No encontramos este gasto.");
      Object.assign(current, fields);
      return current;
    }
    const created: MockExpense = {
      id: store.nextId++,
      eventId: event.id,
      expenseDate: new Date().toISOString().slice(0, 10),
      ...fields,
    };
    store.expenses.unshift(created);
    return created;
  }

  // Saldos
  if ((m = path.match(/^\/api\/events\/([^/]+)\/balances$/))) {
    return balances(findEvent(m[1]));
  }
  if ((m = path.match(/^\/api\/events\/([^/]+)\/suggested-payments$/))) {
    return suggestedPayments(findEvent(m[1]));
  }

  // Invitaciones
  if ((m = path.match(/^\/api\/invite-links\/([^/]+)\/guest-session$/))) {
    if (decodeURIComponent(m[1]) !== INVITE_TOKEN) {
      throw new ApiError(404, "No encontramos este evento.");
    }
    const event = store.events.find((e) => e.id === 1)!;
    const member = event.members.find((x) => x.id === Number(body.memberId));
    if (!member) throw new ApiError(404, "No encontramos este integrante.");
    if (!member.isGuest) throw new ApiError(409, "Ese integrante ya tiene cuenta.");
    const guest: Guest = { type: "guest", eventId: event.id, memberId: member.id, name: member.name };
    setSession(guest);
    return guest;
  }

  if ((m = path.match(/^\/api\/invitations\/([^/]+)(\/[a-z]+)?$/))) {
    if (decodeURIComponent(m[1]) !== INVITE_TOKEN) {
      throw new ApiError(404, "No encontramos este evento.");
    }
    const event = store.events.find((e) => e.id === 1)!;
    const suffix = m[2] ?? "";
    if (suffix === "") return { ...summary(event) };
    if (suffix === "/members") {
      return event.members.map((x) => ({
        id: x.id,
        name: x.name,
        isLinked: esc.has("sin-integrantes") ? true : !x.isGuest,
      }));
    }
    if (suffix === "/access") {
      return {
        eventId: event.id,
        linkedMember: esc.has("ya-vinculado") ? { id: 2, name: "Francisco" } : null,
      };
    }
    if (suffix === "/link") {
      const member = event.members.find((x) => x.id === Number(body.memberId))!;
      return { eventId: event.id, linkedMember: { id: member.id, name: member.name } };
    }
  }

  throw new ApiError(404, "No encontrado");
}

/** Simula la red: una demora corta y la respuesta copiada, como si viniera en JSON. */
export async function mockRequest<T>(path: string, init?: RequestInit): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  const [pathname, search = ""] = path.split("?");
  const body = typeof init?.body === "string" ? (JSON.parse(init.body) as Body) : {};
  const result = handle(init?.method ?? "GET", pathname, new URLSearchParams(search), body);
  return (result === undefined ? undefined : JSON.parse(JSON.stringify(result))) as T;
}
