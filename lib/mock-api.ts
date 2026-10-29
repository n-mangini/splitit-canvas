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
  nextId: 100,
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
    expense(6, 2, "Alquiler Enero", 150000, 1, "2024-01-01"),
    expense(7, 2, "Luz", 8500, 2, "2024-01-10"),
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

function scenario(): string | null {
  if (typeof window === "undefined") return null;
  const fromQuery = new URLSearchParams(window.location.search).get("escenario");
  if (fromQuery) return fromQuery;
  // La landing redirige a Mis eventos si hay sesion: en el canvas se ve sin.
  if (window.location.pathname.startsWith("/inicio")) return "sin-sesion";
  return null;
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
  if (path === "/api/auth/session") return esc === "sin-sesion" ? null : store.user;
  if (path === "/api/auth/login" || path === "/api/auth/register") return undefined;
  if (path === "/api/auth/logout") return undefined;
  if (path === "/api/me") {
    if (method === "PUT" || method === "PATCH") {
      store.user = { ...store.user, ...(body as { name?: string; email?: string }) };
    }
    return store.user;
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
    return esc === "vacio" ? [] : store.events.map(summary);
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
    return { ...summary(event), members: event.members, isOwner: true };
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
      return store.expenses.filter((e) => e.eventId === event.id);
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
        isLinked: esc === "sin-integrantes" ? true : !x.isGuest,
      }));
    }
    if (suffix === "/access") {
      return {
        eventId: event.id,
        linkedMember: esc === "ya-vinculado" ? { id: 2, name: "Francisco" } : null,
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
