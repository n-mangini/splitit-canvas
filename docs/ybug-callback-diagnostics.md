# Prueba de callbacks de Ybug

## Alcance

Observación optativa de `onbeforesend` y `onaftersend` en el widget existente.
Sin nuevas dependencias, rutas API, llamadas a n8n ni tarjetas de Trello.
Se mantienen el ID de Ybug, la carga única y la exclusión de iframes del canvas.
La configuración actual de notificaciones/integraciones en Ybug no se modifica.

El repositorio es un prototipo sin backend (ver `AGENTS.md`).
`lib/auth-context.tsx` simula login en memoria y acepta cualquier email:
**no autentica solicitudes de servidor**. No existen rutas API, ni referencias a
n8n/Trello en el código inspeccionado. Los comentarios describen la llegada a Slack;
esa configuración externa y su funcionamiento actual no se pueden verificar aquí.

## Evidencia de Ybug (revisada el 17 de octubre de 2026)

- [Eventos JavaScript](https://ybug.io/docs/installation/javascript-events):
  el nombre en configuración es `onbeforesend`; con `Ybug.on` es `beforesend`.
  Análogamente, `onaftersend` / `aftersend`. Ambos reciben el JSON del reporte;
  después del envío se agregan `id` y `reportUrl`. Un Promise en `beforesend`
  demora el envío y si resuelve `false` lo cancela. Esta prueba no devuelve ninguno.
- [Planes](https://ybug.io/pricing): Free incluye reportes ilimitados y 50 capturas
  por mes. No incluye integraciones, webhooks ni REST API. La prueba de planes pagos
  dura 10 días, por lo que un resultado durante el trial no confirma Free.
- No hay una restricción de plan explícita para estos callbacks en la página de
  eventos ni una fila de callbacks en la tabla de planes. Es compatible con que
  funcionen en Free, **pero no es una confirmación contractual ni una prueba real**.
  Falta probar con el proyecto en Free (sin trial) o recibir confirmación de Ybug.
- [Webhook de Ybug](https://ybug.io/docs/integrations/webhook): su ejemplo tiene
  `comment`, `url`, `reporter`, `attributes` y `screenshotUrl` con un token firmado.
  Es otro contrato: no demuestra que los callbacks expongan esos mismos campos,
  una URL pública de imagen o una imagen reutilizable por Trello.

## Activación en un preview

1. Usar esta rama en un preview de prueba, sin fusionar a `main`. Verificar que
   la protección de acceso al preview sea la deseada.
2. Configurar **solo para ese preview** `NEXT_PUBLIC_YBUG_ID` con el ID existente
   y `NEXT_PUBLIC_YBUG_DIAGNOSTICS=true`. Reconstruir: son variables del cliente
   que Next incorpora al compilar. El ID público del widget no es una credencial
   de API. No poner secretos de n8n/Trello en variables `NEXT_PUBLIC_*`.
3. Abrir la página de nivel superior y, en la consola del navegador, ejecutar:

   ```js
   sessionStorage.setItem('splitit:ybug-diagnostics', 'true')
   location.reload()
   ```

4. Filtrar la consola por `[Ybug diagnostics]` con el nivel Info visible.
   Debe aparecer `load`. Esto confirma carga, todavía no permisos Free ni envío.
5. Confirmar en el dashboard que el proyecto está en Free, sin trial. Usar datos
   ficticios y una página sin datos personales. Enviar **un** reporte identificado
   como prueba, por ejemplo `PRUEBA callbacks — no accionar`, con una captura.
   El envío es real: consume cuota y puede activar email/Slack u otras integraciones
   existentes. No cambiar ni desconectar esas integraciones para esta prueba.
6. Deben aparecer `beforesend` y luego `aftersend`. Comprobar que Ybug confirma el
   envío y que el reporte llega a su dashboard; revisar también la notificación
   habitual si está configurada. No inferir éxito a partir de `beforesend` solo.
7. Guardar el esquema seguro de ambos eventos: nombres de campos superiores,
   tipos, longitudes, formatos `image-data-url` / `http-url` / `text`, tamaños de
   Blob y presencia/tipo de `id` y `reportUrl`. No se recorren objetos anidados ni
   se imprimen valores, texto del reporte, emails, URLs, tokens o bytes de imagen.
   Los nombres de campos son visibles: no usar claves superiores con secretos.
8. Con datos ficticios, inspeccionar en el debugger local el argumento del callback
   si hace falta comprobar contenido. Verificar qué campo contiene el texto/URL y
   si la captura es Blob, data URL, objeto, referencia o URL descargable. No copiar
   el reporte completo, ni una URL firmada, a issues, PRs, chats o logs compartidos.
   Una longitud mayor que cero no prueba que la imagen sea válida o descargable.
9. Si hay URL de imagen, comprobar su acceso fuera de la sesión de Ybug y su
   vencimiento. El diagnóstico no la descarga ni la publica. Una página `reportUrl`
   del dashboard no es un adjunto de imagen ni garantiza acceso sin sesión.
10. Desactivar en la pestaña:

    ```js
    sessionStorage.removeItem('splitit:ybug-diagnostics')
    ```

    Quitar también la variable del preview y reconstruir para retirar los observers.
    La pestaña deja de registrar inmediatamente al quitar el valor de sesión.

No enviar otro reporte si el primero falla: registrar la fase alcanzada y revisar
la configuración, la cuota y los bloqueos del navegador antes de repetir.
La consola del propio Ybug podría capturar estos mensajes cuando esa función esté
activa; por eso se registra únicamente el esquema, nunca el objeto del reporte.

## Resultado y límites de validación

Los tests con objetos sintéticos verifican ausencia de valores privados, no mutación,
retorno `undefined`, activación optativa y tolerancia a errores de storage/consola,
valores ausentes, referencias circulares, Blob y getters. No contactan Ybug.
La suite existente cubre la navegación del prototipo. Ningún test simulado prueba
la licencia Free, el orden real del SDK ni la disponibilidad real de la captura.

Prueba aislada de registro de callbacks en navegador, con el SDK remoto interceptado
y sin un ID real (cerrar antes cualquier servidor local en el puerto 3000):

```sh
NEXT_PUBLIC_YBUG_ID=diagnostics-test NEXT_PUBLIC_YBUG_DIAGNOSTICS=true pnpm test:e2e e2e/ybug-diagnostics.spec.ts
```

Sin esas variables, el test de navegador se omite y las cuatro pruebas de observers
siguen ejecutándose. Para la suite habitual: `pnpm test:e2e`.

| Comprobación | Estado antes de una prueba real |
| --- | --- |
| Contrato público de eventos y nombres de callbacks | Documentado |
| Callback habilitado en el proyecto Free real | Pendiente |
| Campos concretos de texto, URL, navegador y captura | Pendiente |
| ID y enlace tras un envío real exitoso | Pendiente |
| Acceso/validez/vencimiento de una captura desde servidor o Trello | Pendiente |
| Entrega autenticada a n8n y creación/adjunto en Trello | No implementada |

No se necesita una clave privada de Ybug para registrar los callbacks del widget,
pero sí el ID/configuración del proyecto y un navegador en el preview para probarlos.
Verificar el plan exige acceso al dashboard. Probar n8n/Trello exige credenciales,
un webhook de prueba y una lista/tablero de prueba identificados.

## Siguiente fase, condicionada al resultado

Flujo propuesto: `aftersend → API autenticada de la app → webhook n8n → backlog Trello`.
La API puede ser propia; no requiere la REST API paga de Ybug si el callback ya
entrega los datos necesarios. Falta construir esa API y una autenticación real,
o elegir un servidor autenticado independiente para este prototipo.

Usar `aftersend` para no crear tarjetas por envíos cancelados/fallidos. El servidor
debe validar sesión/permisos, origen/CSRF cuando corresponda, esquema/tamaños y
frecuencia; guardar secretos de n8n/Trello solo en servidor y deduplicar por proyecto
e ID de reporte. Un callback del navegador es manipulable: autenticar al usuario no
certifica que el reporte vino de Ybug. No confiar en IDs o URLs aportados por el cliente.
No descargar URLs arbitrarias del cliente: definir orígenes permitidos, controlar
redirecciones y limitar tipo/tamaño de imágenes para evitar SSRF.

Si la captura solo existe antes del envío, será necesario un diseño adicional para
conservarla temporalmente y vincularla al éxito; no reenviar todo en `beforesend`.
Si no está accesible, se puede crear una tarjeta con texto y enlace a Ybug, pero
no prometer un adjunto autónomo. Primero decidir si eso alcanza para el backlog.

Un callback del cliente no ofrece entrega durable: cierre de pestaña, bloqueadores
o red pueden perder la copia aunque Ybug reciba el reporte. Para entrega garantizada
harían falta persistencia/reintentos y reconciliación; el webhook de Ybug es otra
opción, con un plan que lo incluya. Esta prueba no implementa ninguna de esas vías.
