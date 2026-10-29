// Copia de `web/lib/api.ts` del front oficial (SplitItLab/SplitIt), con una
// sola diferencia: `request` no sale a la red. Responde desde los datos de
// ejemplo de `lib/mock-api.ts`, asi el resto de `lib/` queda identico al
// oficial y se puede volver a copiar tal cual cuando cambie.

import { mockRequest } from "@/lib/mock-api";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function apiUrl(path: string) {
  return path;
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  return mockRequest<T>(path, init);
}
