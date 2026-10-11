# Contrato de backend (mock) — Exportación

Añade **una** operación **de solo lectura** a la interfaz `Backend` del mock asíncrono
(`src/data/backend.ts`). No se modifica ni se elimina ninguna operación existente.
Principio IX.

## `exportacion`

```ts
exportacion: {
  /** Devuelve una copia fiel del agregado completo persistido. No modifica nada. */
  obtenerCopia: () => Promise<Agregado>;
};
```

- **Entrada**: ninguna.
- **Salida**: `Agregado` (`{ version, perfil, clientes, servicios, presupuestos, correlativos }`),
  tal como está persistido. Se devuelve una copia, no una referencia mutable compartida.
- **Efectos**: **ninguno** (solo lectura). Cumple FR-008/SC-006.
- **Errores**: `BackendError` con `code: 'ALMACENAMIENTO'` si el contenido local está
  corrupto o no se puede leer, siguiendo el patrón `enAlmacenamiento(...)` del resto del mock.
- **Consumo**: se expone como `obtenerCopia()` en `StoreContextValue` (`src/data/store.tsx`);
  los componentes **no** acceden a `localStorage`.

## Compatibilidad

- Se **añade** un namespace; las operaciones existentes (`perfil`, `clientes`, `servicios`,
  `presupuestos`) permanecen idénticas (FR-014).
- No se usa `fetch`, ni base de datos, ni variables de entorno (Principio IX).
