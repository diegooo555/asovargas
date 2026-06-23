# Documentación del Proyecto: ASOVARGAS

Este documento describe la arquitectura, estructura de archivos, modelo de base de datos y la lógica de negocio del **Sistema de Gestión ASOVARGAS**, una plataforma web diseñada para administrar una asociación de ganaderos/productores. Facilita el control de inventarios, órdenes de reabastecimiento, cuentas y deudas de clientes, registros diarios de producción de leche y transacciones comerciales (ventas de productos generales y pajillas de inseminación).

---

## 1. Arquitectura Tecnológica

El sistema está construido sobre un stack moderno de desarrollo web con las siguientes tecnologías clave:

*   **Framework Principal**: [Next.js 15 (App Router)](https://nextjs.org/) con renderizado e hidratación híbrida (Server y Client Components) y rutas dinámicas.
*   **Lenguaje**: [TypeScript](https://www.typescriptlang.org/) para tipado estático seguro.
*   **Base de Datos**: [Supabase](https://supabase.com/) (PostgreSQL), utilizado como base de datos en la nube. Configura clientes independientes para cliente (`lib/supabase/client.ts`) y servidor (`lib/supabase/server.ts`).
*   **Autenticación**: [Next-Auth v5 (Auth.js Beta)](https://authjs.dev/) configurado con el proveedor de credenciales (`CredentialsProvider`). Realiza la validación de contraseñas mediante `bcrypt` comparándolas con los registros de la tabla `users` en Supabase.
*   **Gestión de Estado y Consultas**: [TanStack React Query v5](https://tanstack.com/query/latest) para la gestión y sincronización eficiente del estado del servidor en el lado del cliente (con caché persistente y reintentos automáticos).
*   **Estilos y UI**: 
    *   [Tailwind CSS](https://tailwindcss.com/) y [PostCSS](https://postcss.org/) para un diseño responsivo, moderno y limpio.
    *   Componentes basados en [Radix UI](https://www.radix-ui.com/) y diseñados siguiendo el sistema de Shadcn/UI.
    *   [Lucide React](https://lucide.dev/) para la iconografía del sistema.
    *   [Recharts](https://recharts.org/) para la visualización de analíticas y reportes visuales en el dashboard.
*   **Manejo de Formularios y Validación**: [React Hook Form](https://react-hook-form.com/) junto con [Zod](https://zod.dev/) para validación estricta de esquemas de datos.
*   **Generación de Reportes**: [jsPDF](https://github.com/parallax/jsPDF) y [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) para exportar reportes detallados de producción a formato PDF.

---

## 2. Estructura de Directorios del Proyecto

La organización de archivos sigue el estándar del App Router de Next.js:

```
asovargas/
├── app/                        # Rutas de Next.js y puntos de entrada
│   ├── dashboard/              # Rutas del panel administrativo protegido
│   │   ├── ordenes/            # Vista y creación de órdenes de compra
│   │   ├── pajillas/           # Inventario de pajillas de toros
│   │   ├── produccion/         # Gestión de registros de leche y cierre de quincena
│   │   ├── productos/          # Gestión de inventario de productos generales
│   │   ├── usuarios/           # Gestión de clientes (asociados/compradores)
│   │   └── ventas/             # Registro e historial de ventas a clientes
│   ├── lib/                    # Definiciones y acciones del lado del servidor
│   ├── login/                  # Página de inicio de sesión
│   ├── providers/              # Proveedores globales (React Query, etc.)
│   ├── globals.css             # Estilos globales y variables CSS de Tailwind
│   ├── layout.tsx              # Contenedor raíz de la aplicación
│   └── page.tsx                # Página de inicio (Landing Page)
├── components/                 # Componentes reutilizables de UI y lógica
│   ├── ui/                     # Componentes básicos (botones, inputs, diálogos, etc.)
│   ├── ordenes/                # Formularios y listados de órdenes
│   ├── pajillas/               # Formularios y listados de pajillas
│   ├── produccion/             # Generación de reportes PDF y gestión de leche
│   ├── productos/              # Formulario de edición/creación de productos
│   └── ventas/                 # Formulario y factura para registrar ventas
├── hooks/                      # Hooks de React personalizados (ej. useClient)
├── lib/                        # Configuración del sistema y tipos generales
│   ├── supabase/               # Instancias de Supabase Client y Server
│   ├── types.ts                # Interfaces de TypeScript para modelos de datos
│   └── utils.ts                # Funciones auxiliares de formato y Tailwind Merge
├── scripts/                    # Scripts SQL para inicializar y migrar la base de datos
├── auth.config.ts              # Configuración de políticas de autorización y rutas
├── auth.ts                     # Configuración principal de Next-Auth
├── middleware.ts               # Filtro de middleware de Next.js para proteger rutas
└── package.json                # Dependencias y scripts del proyecto
```

---

## 3. Arquitectura de la Base de Datos (Supabase / PostgreSQL)

La base de datos aprovecha la potencia de PostgreSQL a través de Supabase. A continuación se detallan las tablas, seguidas de las funciones y disparadores (triggers) que encapsulan la lógica de integridad y stock en la propia base de datos.

### 3.1. Tablas del Sistema

#### `users`
Almacena las cuentas de los usuarios administradores/empleados que tienen acceso al dashboard.
*   `id` (UUID, Primary Key, gen_random_uuid())
*   `name` (VARCHAR, nombre del usuario)
*   `email` (VARCHAR, único, correo para inicio de sesión)
*   `password` (VARCHAR, hash bcrypt de la contraseña)
*   `created_at` (TIMESTAMPTZ)

#### `clients`
Registra a los ganaderos y clientes del sistema. Se clasifican entre asociados (socios) y compradores externos.
*   `client_id` (UUID, Primary Key, gen_random_uuid())
*   `document` (VARCHAR, único, cédula o NIT)
*   `name` (VARCHAR, nombre o razón social)
*   `email` (VARCHAR, único, opcional)
*   `phone` (VARCHAR, 10 dígitos)
*   `address` (TEXT)
*   `credits` (DECIMAL, tope o cupo de crédito asignado)
*   `type_client` (VARCHAR, restricción: `'associate'` o `'buyer'`)
*   `created_at` / `updated_at` (TIMESTAMPTZ)

#### `products`
Catálogo de productos agrícolas o de uso ganadero disponibles para la venta.
*   `id` (UUID, Primary Key, gen_random_uuid())
*   `name` (VARCHAR, nombre del producto)
*   `company` (VARCHAR, marca o distribuidor)
*   `purchase_price` (DECIMAL, costo de adquisición)
*   `sale_price` (DECIMAL, precio de venta)
*   `expenses` (DECIMAL, gastos asociados)
*   `profit_percentage` (DECIMAL, porcentaje de ganancia)
*   `quantity` (INT, existencias en inventario)
*   `created_at` / `updated_at` (TIMESTAMPTZ)

#### `pajillas`
Inventario especializado en pajillas de semen de toros para inseminación artificial.
*   `id` (UUID, Primary Key, gen_random_uuid())
*   `bull_name` (VARCHAR, nombre del toro reproductor)
*   `company` (VARCHAR, empresa proveedora)
*   `breed` (VARCHAR, raza del toro)
*   `purchase_price` (DECIMAL)
*   `sale_price` (DECIMAL)
*   `quantity` (INT, existencias en inventario)
*   `created_at` / `updated_at` (TIMESTAMPTZ)

#### `orders`
Órdenes de reabastecimiento de inventario ingresadas por un usuario del sistema (compras a proveedores).
*   `id` (UUID, Primary Key)
*   `user_id` (UUID, FK a `users.id`)
*   `order_number` (VARCHAR, único, identificador)
*   `status` (VARCHAR, restricción: `'pending'`, `'processing'`, `'completed'`, `'cancelled'`)
*   `total_amount` (DECIMAL, monto total recalculado automáticamente)
*   `created_at` / `updated_at` (TIMESTAMPTZ)

#### `order_items`
Detalle de productos incluidos en una orden de reabastecimiento.
*   `id` (UUID, Primary Key)
*   `order_id` (UUID, FK a `orders.id` con eliminación en cascada)
*   `product_id` (UUID, FK a `products.id` con restricción de eliminación)
*   `quantity` (INTEGER)
*   `unit_price` (DECIMAL)
*   `total_price` (DECIMAL, calculado automáticamente como `quantity * unit_price`)
*   `created_at` (TIMESTAMPTZ)

#### `stock_movements`
Bitácora histórica de variaciones en el inventario físico de productos.
*   `id` (UUID, Primary Key)
*   `product_id` (UUID, FK a `products.id`)
*   `movement_type` (VARCHAR, restricción: `'purchase'`, `'sale'`, `'order'`, `'adjustment'`)
*   `quantity` (INT)
*   `created_at` (TIMESTAMPTZ)

#### `pajillas_movements`
Bitácora histórica de variaciones en el inventario de pajillas.
*   `id` (UUID, Primary Key)
*   `pajilla_id` (UUID, FK a `pajillas.id`)
*   `movement_type` (VARCHAR, restricción: `'increase'`, `'decrease'`, `'adjustment'`)
*   `quantity` (INT)
*   `created_at` (TIMESTAMPTZ)

#### `buys` (Ventas a Clientes)
Transacciones de salida donde un cliente compra productos y/o pajillas de la asociación.
*   `id` (UUID, Primary Key)
*   `client_id` (UUID, FK a `clients.client_id`)
*   `buy_number` (BIGINT, autoincremental único)
*   `sale_type` (VARCHAR, restricción: `'contado'`, `'transferencia'`, `'credito'`)
*   `total_amount` (DECIMAL, suma automática de items)
*   `created_at` / `updated_at` (TIMESTAMPTZ)

#### `buy_items`
Productos individuales facturados en una venta.
*   `id` (UUID, Primary Key)
*   `buy_id` (UUID, FK a `buys.id`)
*   `product_id` (UUID, FK a `products.id`)
*   `quantity` (INTEGER)
*   `unit_price` (DECIMAL)
*   `total_price` (DECIMAL, calculado como `quantity * unit_price`)
*   `created_at` (TIMESTAMPTZ)

#### `buy_pajilla_items`
Pajillas individuales facturadas en una venta.
*   `id` (UUID, Primary Key)
*   `buy_id` (UUID, FK a `buys.id`)
*   `pajilla_id` (UUID, FK a `pajillas.id`)
*   `quantity` (INTEGER)
*   `unit_price` (DECIMAL)
*   `total_price` (DECIMAL, calculado como `quantity * unit_price`)
*   `created_at` (TIMESTAMPTZ)

#### `production_records`
Registros diarios o periódicos de la cantidad de litros de leche entregada por cada cliente/asociado.
*   `production_record_id` (UUID, Primary Key)
*   `client_id` (UUID, FK a `clients.client_id`)
*   `liters` (DECIMAL)
*   `production_datetime` (TIMESTAMPTZ)
*   `fortnight_id` (UUID, FK a `fortnights.fortnight_id`, se asigna automáticamente vía trigger)
*   `created_at` / `updated_at` (TIMESTAMPTZ)

#### `production_records_history`
Historial de producción archivado al finalizar un periodo quincenal de pagos.
*   `production_record_id` (UUID, Primary Key)
*   `client_id` (UUID)
*   `liters` (DECIMAL)
*   `production_datetime` (TIMESTAMPTZ)
*   `created_at` / `updated_at` / `archived_at` (TIMESTAMPTZ)

#### `fortnights` (Nueva)
Periodos quincenales formales que organizan la producción de leche.
*   `fortnight_id` (UUID, Primary Key)
*   `period_start` (DATE, inicio del periodo: 1 o 16)
*   `period_end` (DATE, fin del periodo: 15 o último día del mes)
*   `period_name` (VARCHAR, nombre descriptivo)
*   `status` (VARCHAR, `'open'` o `'closed'`)
*   `price_associate` (DECIMAL, precio por litro para asociados)
*   `price_buyer` (DECIMAL, precio por litro para compradores)
*   `closed_at` (TIMESTAMPTZ)
*   `created_at` / `updated_at` (TIMESTAMPTZ)

#### `fortnight_discounts` (Nueva)
Descuentos configurables aplicados por quincena.
*   `discount_id` (UUID, Primary Key)
*   `fortnight_id` (UUID, FK a `fortnights.fortnight_id`)
*   `name` (VARCHAR, nombre del descuento, ej: Fedegan 4x1000)
*   `discount_type` (VARCHAR, `'percentage'` o `'fixed'`)
*   `value` (DECIMAL, porcentaje ej: 0.4 = 0.4%, o monto fijo)
*   `applies_to` (VARCHAR, `'all'`, `'associate'`, `'buyer'`)
*   `is_active` (BOOLEAN)
*   `created_at` / `updated_at` (TIMESTAMPTZ)

#### `fortnight_settlements` (Nueva)
Liquidación de pago por cliente por quincena.
*   `settlement_id` (UUID, Primary Key)
*   `fortnight_id` (UUID, FK a `fortnights.fortnight_id`)
*   `client_id` (UUID, FK a `clients.client_id`)
*   `total_liters` (DECIMAL, total de litros)
*   `price_per_liter` (DECIMAL, precio aplicado)
*   `gross_total` (DECIMAL, total bruto)
*   `total_discounts` (DECIMAL, suma de descuentos)
*   `debt_deduction` (DECIMAL, deducción por deudas)
*   `net_payment` (DECIMAL, pago neto final)
*   `payment_status` (VARCHAR, `'pending'` o `'paid'`)
*   `created_at` / `updated_at` (TIMESTAMPTZ)

#### `fortnight_settlement_discounts` (Nueva)
Detalle individual de descuentos aplicados a cada liquidación.
*   `id` (UUID, Primary Key)
*   `settlement_id` (UUID, FK a `fortnight_settlements.settlement_id`)
*   `discount_name` (VARCHAR)
*   `discount_type` (VARCHAR)
*   `discount_value` (DECIMAL)
*   `discount_amount` (DECIMAL)

#### `fortnight_settlement_debts` (Nueva)
Registro de deudas deducidas de una liquidación.
*   `id` (UUID, Primary Key)
*   `settlement_id` (UUID, FK a `fortnight_settlements.settlement_id`)
*   `debt_id` (UUID, FK a `debts.debt_id`)
*   `amount` (DECIMAL)
*   `created_at` (TIMESTAMPTZ)

#### `debts`
Control de deudas pendientes asociadas a clientes, usualmente por compras bajo modalidad crédito.
*   `debt_id` (UUID, Primary Key)
*   `client_id` (UUID, FK a `clients.client_id`)
*   `description` (TEXT)
*   `total` (DECIMAL)
*   `status` (VARCHAR, restricción: `'pending'`, `'paid'`, `'cancelled'`)
*   `date` (DATE)
*   `created_at` / `updated_at` (TIMESTAMPTZ)

#### `debt_records`
Auditoría y registro de abonos o cancelaciones efectuadas sobre una deuda específica.
*   `record_id` (UUID, Primary Key)
*   `debt_id` (UUID, FK a `debts.debt_id`)
*   `action` (VARCHAR, restricción: `'created'`, `'payment'`, `'update'`, `'cancelled'`)
*   `amount` (DECIMAL)
*   `note` (TEXT)
*   `created_at` (TIMESTAMPTZ)

#### `enterprise`
Parámetros globales financieros de la asociación.
*   `id` (INT, Primary Key)
*   `name` (VARCHAR)
*   `total_amount` (DECIMAL, balance monetario general)
*   `price_liter` (DECIMAL, precio por litro base)

#### `income` / `expense`
Historial financiero complementario de ingresos y egresos de caja de la organización.
*   `id` (INT, Primary Key)
*   `amount` (DECIMAL)
*   `detail` (VARCHAR)
*   `date` (DATE)

#### `variables` y `fortnight_variables`
Tablas de configuración de parámetros variables.
*   `variables` almacena el valor por litro (para asociados y compradores) y la cuota de sostenimiento.
*   `fortnight_variables` almacena fechas que delimitan el inicio y fin de la quincena actual.

#### (Nuevas) Tablas del Sistema de Gestión Quincenal

##### `fortnights`
Periodos quincenales formales (1-15 y 16-fin de mes) con estado abierto/cerrado y precios por litro.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `fortnight_id` | UUID PK | Identificador único |
| `period_start` | DATE | Inicio de quincena (1 o 16) |
| `period_end` | DATE | Fin de quincena (15 o último del mes) |
| `period_name` | VARCHAR(150) | Nombre descriptivo |
| `status` | VARCHAR(20) | `open` / `closed` |
| `price_associate` | DECIMAL | Precio litro para asociados |
| `price_buyer` | DECIMAL | Precio litro para compradores |
| `closed_at` | TIMESTAMPTZ | Fecha de cierre |

##### `fortnight_discounts`
Descuentos configurables por quincena (Fedegan 4x1000, etc.).

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `discount_id` | UUID PK | Identificador único |
| `fortnight_id` | UUID FK | Quincena asociada |
| `name` | VARCHAR(100) | Nombre del descuento |
| `discount_type` | VARCHAR(20) | `percentage` o `fixed` |
| `value` | DECIMAL(10,4) | Porcentaje (0.4 = 0.4%) o monto fijo |
| `applies_to` | VARCHAR(20) | `all`, `associate`, `buyer` |
| `is_active` | BOOLEAN | Activo o inactivo |

##### `fortnight_settlements`
Liquidación por cliente por quincena generada al cierre.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `settlement_id` | UUID PK | Identificador único |
| `fortnight_id` | UUID FK | Quincena asociada |
| `client_id` | UUID FK | Cliente liquidado |
| `total_liters` | DECIMAL | Litros totales |
| `price_per_liter` | DECIMAL | Precio aplicado |
| `gross_total` | DECIMAL | Bruto = litros × precio |
| `total_discounts` | DECIMAL | Suma descuentos |
| `debt_deduction` | DECIMAL | Deducción por deudas |
| `net_payment` | DECIMAL | Pago neto final |
| `payment_status` | VARCHAR | `pending` / `paid` |

##### `fortnight_settlement_discounts`
Detalle individual de cada descuento aplicado en una liquidación.

##### `fortnight_settlement_debts`
Registro de deudas deducidas de una liquidación.

---

### 3.2. Funciones y Disparadores (PL/pgSQL Triggers)

El sistema delega tareas complejas de control de inventario y recálculo de montos a la base de datos:

1.  **Reabastecimiento de Stock (Órdenes)**:
    *   `update_product_quantity_on_order()`: Se ejecuta `AFTER INSERT` en `order_items`. Incrementa la cantidad del producto en la tabla `products` y registra un `stock_movement` de tipo `'order'`.
    *   `handle_product_quantity_on_order_update()`: Se ejecuta `AFTER UPDATE` en `order_items`. Compara cantidades viejas y nuevas para ajustar la diferencia en stock y registra un movimiento de `'adjustment'`.
    *   `handle_product_quantity_on_order_delete()`: Se ejecuta `AFTER DELETE` en `order_items`. Descuenta el stock previamente agregado y registra un ajuste.
2.  **Recálculo de Totales de Órdenes**:
    *   `update_order_total()`: Se ejecuta `AFTER INSERT OR UPDATE OR DELETE` en `order_items`. Realiza un `SUM(total_price)` de todos los items de la orden y actualiza el campo `total_amount` en la tabla principal `orders`.
3.  **Control de Stock en Ventas (Productos)**:
    *   `handle_product_stock_on_buy()`: Se ejecuta `BEFORE INSERT` en `buy_items`. Verifica si hay existencias suficientes. Si no, lanza un error (`RAISE EXCEPTION`) cancelando la transacción. Si hay stock, lo descuenta de `products` y registra un `stock_movement` tipo `'sale'`.
    *   `handle_product_stock_on_buy_update()` y `handle_product_stock_on_buy_delete()`: Ajustan dinámicamente las cantidades en inventario si se modifica o anula una transacción de venta de productos.
4.  **Control de Stock en Ventas (Pajillas)**:
    *   `handle_pajilla_stock_on_buy()`, `_update()` y `_delete()`: Operan de manera análoga sobre la tabla `pajillas` y la tabla de movimientos `pajillas_movements`.
5.  **Recálculo de Totales de Ventas (Buys)**:
    *   `update_buy_total()`: Se ejecuta `AFTER INSERT OR UPDATE OR DELETE` en `buy_items` y `buy_pajilla_items`. Suma los subtotales de ambos tipos de productos asociados al ID de la transacción y guarda la sumatoria en `total_amount` de la tabla `buys`.
6.  **Historial de Auditoría de Deudas**:
    *   `log_debt_changes()`: Se ejecuta `AFTER INSERT OR UPDATE` en `debts`. Genera una traza de auditoría en la tabla `debt_records` con la acción ejecutada (`'created'`, `'payment'`, `'update'`, `'cancelled'`), el monto y una nota descriptiva.
7.  **Archivado de Producción**:
    *   `archive_production_records()`: Función que copia todos los registros de producción activos con fecha menor o igual a la actual a la tabla `production_records_history` y posteriormente los elimina de la tabla activa `production_records` para iniciar un nuevo ciclo quincenal de recolección de leche.
8.  **Nuevas Funciones del Sistema Quincenal**:
    *   `get_or_create_active_fortnight()`: Obtiene la quincena abierta actual o crea una nueva según la fecha (1-15 o 16-fin de mes), copiando los precios desde `variables` y agregando descuentos por defecto.
    *   `assign_fortnight_on_production_insert()`: Trigger `BEFORE INSERT` en `production_records` que asigna automáticamente el `fortnight_id`.
    *   `close_fortnight(UUID)`: Cierra una quincena, genera liquidaciones por cliente aplicando descuentos, archiva la producción y marca la quincena como cerrada.
    *   `deduct_debt_from_settlement(UUID, UUID, DECIMAL)`: Deduce un monto de una deuda desde la liquidación de un cliente, actualizando ambos registros.
    *   `get_fortnight_settlements_report(UUID)`: Retorna todas las liquidaciones de una quincena con desglose completo (cliente, montos, descuentos, deudas).

---

## 4. Flujos de Lógica de Negocio

El dashboard implementa flujos dinámicos que comunican la interfaz de usuario con los triggers definidos en la sección anterior.

### 4.1. Registro de Ventas a Clientes
El formulario `venta-form.tsx` es una interfaz interactiva compleja que permite a los operadores vender tanto insumos generales como pajillas de inseminación:

*   **Identificación del Cliente**: El usuario selecciona un cliente registrado. La UI muestra la información básica y el límite de crédito disponible.
*   **Selección de Productos y Pajillas**: Permite añadir filas dinámicas. Cada fila realiza las siguientes validaciones en tiempo real:
    *   Filtra solo productos o pajillas con cantidad mayor a 0 en la BD.
    *   Rellena automáticamente el precio de venta unitario.
    *   Compara en el lado del cliente la cantidad solicitada con el límite máximo en inventario.
*   **Tipo de Pago**: Se puede seleccionar entre `'contado'` (efectivo), `'transferencia'` (bancaria) o `'credito'`.
*   **Procesamiento**: Al enviar el formulario, el cliente de Supabase realiza las siguientes acciones:
    1.  Crea la cabecera en `buys`.
    2.  Inserta los items correspondientes en `buy_items` y `buy_pajilla_items` (donde los disparadores de PostgreSQL validan el stock en última instancia y decrementan el inventario).
    3.  Redirecciona a la vista detallada de la factura de venta generada (`/dashboard/ventas/[id]`).

> [!WARNING]
> Si la venta es a **crédito**, se debe tener especial cuidado con el saldo del cliente, ya que su estado pasará a registrarse como una deuda en la tabla `debts`.

---

### 4.2. Sistema de Gestión Quincenal (Nuevo)

La gestión de producción de leche se organiza en **quincenas** (periodos del 1 al 15 y del 16 al último día del mes). Cada registro de producción se asigna automáticamente a la quincena activa mediante un trigger en la base de datos.

#### Cálculo de Liquidación

```
[Total Litros Entregados]
           x
[Precio por Litro según Tipo de Cliente]
           -
[Descuentos configurados en la quincena (Fedegan 4x1000, etc.)]
           -
[Cuota de Sostenimiento (Solo Asociados)]
           -
[Deducción por Deudas (Opcional, decisión del admin)]
           =
[Pago Neto de la Quincena]
```

#### Parámetros
- **Asociados**: Precio de `fortnights.price_associate` (copia de `variables[0]` al crear la quincena).
- **Compradores**: Precio de `fortnights.price_buyer` (copia de `variables[1]` al crear la quincena).
- **Descuentos**: Configurables por quincena en `fortnight_discounts` (Fedegan 4x1000, etc.).
- **Cuota de Sostenimiento**: Solo asociados, desde `variables[2]` al momento del cierre.

#### Flujo de Trabajo

1. **Registro Diario**: Se añaden registros en `production_records`. Un trigger `BEFORE INSERT` asigna automáticamente el `fortnight_id` de la quincena activa (la crea si no existe).

2. **Gestión de Descuentos**: El administrador puede agregar, modificar o desactivar descuentos para la quincena activa en `fortnight_discounts`:
   - Fedegan 4x1000 (0.4%) se agrega por defecto al crear la quincena.
   - Pueden agregarse descuentos fijos o porcentuales adicionales.
   - Cada descuento puede aplicarse a todos, solo asociados o solo compradores.

3. **Cierre de Quincena**: Se ejecuta `close_fortnight(fortnight_id)` que:
   - Agrupa la producción por cliente.
   - Calcula el total bruto según precio por tipo de cliente.
   - Aplica todos los descuentos activos de la quincena.
   - Resta la cuota de sostenimiento (asociados).
   - Genera registros en `fortnight_settlements` y `fortnight_settlement_discounts`.
   - Archiva la producción en `production_records_history`.
   - Marca la quincena como `closed`.

4. **Deducción de Deudas**: El administrador puede ejecutar `deduct_debt_from_settlement()` para descontar deudas pendientes del pago neto de un cliente. Esto:
   - Reduce `net_payment` y aumenta `debt_deduction` en la liquidación.
   - Registra el abono en la deuda (`debt_records`).
   - Marca la deuda como `paid` si queda saldada.

5. **Generación de Facturas**: Con las liquidaciones cerradas, se pueden generar:
   - Factura individual por cada asociado/comprador.
   - Factura total consolidada de la quincena.

#### Función `get_fortnight_settlements_report()`
Devuelve todas las liquidaciones de una quincena con desglose completo de descuentos y deducciones, ideal para generar reportes y facturas.

#### Scripts de Migración
Ver `scripts/05-fortnight-system.sql` para la implementación completa y `scripts/NUEVO-SISTEMA-QUINCENAL.md` para la documentación detallada.

---

### 4.3. Gestión de Órdenes de Restock (Compra de Insumos)
Permite ingresar mercancía de proveedores al inventario del sistema.
*   Al crear una nueva orden (`components/ordenes/order-form.tsx`), la aplicación genera un código único con el prefijo `ORD-YYYYMMDD-[4_DIGITOS]`.
*   El estado inicial suele establecerse como `'completed'`.
*   Una vez guardada la orden en `orders` y sus registros de items en `order_items`, los disparadores `update_product_quantity_on_order` incrementan de inmediato la cantidad disponible de los productos seleccionados, manteniendo el inventario actualizado sin intervención manual.

---

### 4.4. Control y Seguimiento de Deudas de Clientes
Integrado en `components/user-debts.tsx`:
*   Permite listar el historial de deudas pendientes asociadas a un cliente.
*   Un cliente con deudas activas puede realizar abonos o liquidarlas por completo.
*   Al hacer clic en **"Marcar Pagada"** o **"Cancelar"**, se actualiza el estado de la deuda en la tabla `debts`.
*   El trigger `trigger_log_debt_changes` intercepta esta actualización y escribe una auditoría detallada en `debt_records`, garantizando que la contabilidad y el rastro de abonos queden firmemente resguardados.
