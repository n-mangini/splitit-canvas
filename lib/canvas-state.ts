"use client";

import { useEffect } from "react";

// Unico agregado del canvas sobre las pantallas copiadas del front oficial:
// leer de la direccion el estado que el artboard tiene que mostrar (un modal
// abierto, una pestaña), para poder linkearlo desde el canvas. Se aplica
// despues de montar para que el render del servidor sea el del oficial.

export function canvasParam(name: string): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(name);
}

/** Corre `apply` una vez si la direccion trae `?name=value`. */
export function useCanvasParam(name: string, value: string, apply: () => void) {
  useEffect(() => {
    if (canvasParam(name) === value) apply();
    // Solo al montar: es el estado inicial del artboard.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
