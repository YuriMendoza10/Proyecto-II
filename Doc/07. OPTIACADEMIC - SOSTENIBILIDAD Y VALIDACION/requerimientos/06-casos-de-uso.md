# 6. Casos de uso

## CU-001: Iniciar sesión

| Campo | Descripción |
|---|---|
| Actor principal | Usuario |
| Objetivo | Acceder al sistema según su rol |
| Precondición | El usuario debe estar registrado |
| Postcondición | El usuario ingresa al dashboard correspondiente |

### Flujo principal

1. El usuario ingresa correo y contraseña.
2. El sistema valida las credenciales.
3. El sistema genera un token JWT.
4. El sistema identifica el rol.
5. El sistema redirige al dashboard correspondiente.

---

## CU-002: Gestionar cursos

| Campo | Descripción |
|---|---|
| Actor principal | Administrador / Coordinador |
| Objetivo | Registrar y mantener cursos |
| Precondición | El usuario debe tener permisos administrativos |
| Postcondición | Los cursos quedan disponibles para secciones y horarios |

### Flujo principal

1. El usuario entra al módulo de cursos.
2. El sistema lista los cursos existentes.
3. El usuario registra o edita un curso.
4. El sistema valida los datos.
5. El sistema guarda la información.

---

## CU-003: Gestionar docentes

| Campo | Descripción |
|---|---|
| Actor principal | Administrador / Coordinador |
| Objetivo | Registrar docentes y disponibilidad |
| Precondición | El usuario debe tener permisos administrativos |
| Postcondición | Los docentes quedan disponibles para programación |

### Flujo principal

1. El usuario entra al módulo de docentes.
2. El sistema muestra los docentes registrados.
3. El usuario registra o actualiza un docente.
4. El sistema guarda la información.
5. El docente puede ser asignado a secciones.

---

## CU-004: Generar horario institucional

| Campo | Descripción |
|---|---|
| Actor principal | Administrador / Coordinador |
| Objetivo | Generar un horario institucional válido |
| Precondición | Deben existir cursos, secciones, docentes, aulas y disponibilidad |
| Postcondición | El sistema genera una o más soluciones de horario |

### Flujo principal

1. El usuario accede al módulo CSP institucional.
2. El usuario configura periodo, horario y parámetros.
3. El sistema ejecuta diagnóstico CSP.
4. El sistema muestra secciones programables y problemáticas.
5. El usuario solicita generación.
6. El motor CSP genera soluciones.
7. El sistema muestra resultados.

---

## CU-005: Publicar horario institucional

| Campo | Descripción |
|---|---|
| Actor principal | Administrador / Coordinador |
| Objetivo | Publicar la oferta académica oficial |
| Precondición | Debe existir un horario institucional con bloques |
| Postcondición | La oferta queda visible para estudiantes |

### Flujo principal

1. El usuario selecciona el horario generado.
2. El sistema valida que tenga bloques.
3. El usuario solicita publicación.
4. El sistema cambia el estado del horario a publicado.
5. La oferta académica queda disponible para estudiantes.

---

## CU-006: Visualizar oferta académica

| Campo | Descripción |
|---|---|
| Actor principal | Estudiante |
| Objetivo | Consultar cursos y secciones disponibles |
| Precondición | Debe existir un horario institucional publicado |
| Postcondición | El estudiante puede seleccionar cursos |

### Flujo principal

1. El estudiante inicia sesión.
2. Entra a la oferta académica.
3. El sistema carga cursos desde el horario publicado.
4. El estudiante revisa cursos, docentes, aulas y horarios.
5. El estudiante selecciona cursos de interés.

---

## CU-007: Generar horario personal

| Campo | Descripción |
|---|---|
| Actor principal | Estudiante |
| Objetivo | Generar alternativas de horario |
| Precondición | El estudiante debe seleccionar cursos desde la oferta |
| Postcondición | El sistema muestra alternativas válidas |

### Flujo principal

1. El estudiante selecciona cursos.
2. El estudiante configura preferencias.
3. El sistema envía los datos al motor CSP estudiantil.
4. El motor genera alternativas.
5. El sistema muestra soluciones con score.

---

## CU-008: Elegir horario final

| Campo | Descripción |
|---|---|
| Actor principal | Estudiante |
| Objetivo | Guardar una alternativa como horario final |
| Precondición | Debe existir al menos una solución generada |
| Postcondición | El horario queda guardado como final |

### Flujo principal

1. El estudiante compara alternativas.
2. El estudiante selecciona una opción.
3. El sistema guarda el horario.
4. El sistema marca el horario como favorito o final.
5. El estudiante puede verlo en su dashboard.

---

## CU-009: Exportar horario final a PDF

| Campo | Descripción |
|---|---|
| Actor principal | Estudiante |
| Objetivo | Descargar o imprimir su horario final |
| Precondición | El estudiante debe tener horario final |
| Postcondición | Se genera un archivo PDF |

### Flujo principal

1. El estudiante entra a su horario final.
2. Selecciona exportar PDF.
3. El sistema genera el documento.
4. El estudiante descarga o guarda el PDF.
