---
name: ux-review
description: Revisa una pantalla o funcionalidad concreta en cuanto a UI/UX — contrasta lo que hay contra los patrones que usan los productos de referencia, señala lo que falta y lo implementa. Úsala cuando pidan revisar, auditar, comparar o mejorar la UX de una pantalla, un flujo o una funcionalidad ("revisa la pantalla de X", "cuáles son las mejores prácticas para Y", "compara esto con cómo lo hacen otras apps", "qué le falta a esta pantalla"). Vale tanto si el objeto vive en código como en un archivo de diseño.
---

# Revisión UI/UX de una pantalla o funcionalidad

El valor de esta revisión no está en enumerar buenas prácticas: está en **contrastar lo que existe contra lo que hacen los productos de referencia, decidir qué aplica a este producto en concreto e implementarlo**. Un listado de recomendaciones genéricas no sirve; lo que sirve es la tabla de lo que falta y el cambio hecho.

## 0. Delimita el objeto

Antes de nada, ten claro y di en una línea:

- **Qué** se revisa: una pantalla, un flujo o una funcionalidad transversal (buscar, adjuntar, notificar).
- **Dónde vive**: código, archivo de diseño, o ambos. Si existe en los dos, el código manda sobre lo que *hay*; el diseño manda sobre lo que *debería verse*.
- **Para quién**: qué tipo de usuario llega ahí y en qué estado (primera vez, recurrente, con trabajo en curso). Una pantalla suele tener varios estados y casi siempre solo uno está diseñado.

## 1. Lee lo que ya existe — nunca lo supongas

- Abre los componentes reales y **saca los textos, etiquetas y datos tal como están**. Los copys reales del producto valen más que cualquiera que inventes.
- **Comprueba que las features que ves tienen datos detrás.** Un filtro cuya colección está vacía es código muerto: no lo rediseñes, señálalo. Consulta la base de datos o la API cuando puedas.
- Anota los estados que existen en el código y **cuáles no están representados** en el diseño (vacío, cargando, error, con contenido, saturado).
- Si hay sistema de diseño (tokens, paleta, tipografía, componentes), extráelo: la revisión se implementa **dentro** de ese sistema, no contra él.

## 2. Investiga referencias reales

Combina tres fuentes y **di de cuál viene cada recomendación**.

**a) Bases locales** si están instaladas (por ejemplo `ui-ux-pro-max`, con su script de búsqueda por dominio). Son rápidas pero genéricas: si devuelven resultados que no son del tema, **dilo y no los presentes como hallazgo**.

**b) Web, en dos pasos — nunca en uno.** La búsqueda sola devuelve resúmenes vagos; el material bueno está dentro de los artículos. Busca con `WebSearch`, y después **abre con `WebFetch` los dos o tres resultados que prometan**, preguntándoles exactamente lo que necesitas ("qué recomienda sobre la pantalla de inicio: personalización, señales de confianza, reorden"). Si esas herramientas no están cargadas en la sesión, cárgalas antes con `ToolSearch`.

Dos reglas que cambian el resultado:

- **Busca en inglés.** En español hay poco material y suele ser traducción superficial: `chat UX best practices` da diez veces más que su equivalente en español.
- **Busca el problema, no el componente.** `how to design message actions mobile` trae razonamiento; `chat ui design` trae galerías bonitas sin criterio — y copiar de ahí es lo que produce pantallas intercambiables.

Formas de consulta que funcionan: `<dominio> app <pantalla> UX patterns`, `<interacción> interaction pattern`, `<producto> <pantalla> design breakdown`. Las palabras **`teardown`**, **`case study`** y **`breakdown`** son las que separan un análisis serio de un tablero de inspiración.

Fuentes según la duda:

| Qué necesitas | Dónde |
|---|---|
| Cómo lo resuelven apps reales, pantalla por pantalla | **Mobbin antes que Google**, Page Flows, Screenlane, pttrns |
| Si un gesto, menú o componente está bien planteado | Apple HIG, Material Design 3 |
| Evidencia con usuarios, no opinión | Nielsen Norman Group, Baymard |

**c) Productos concretos del mismo dominio**: nómbralos. "Cómo resuelve esto WhatsApp / Uber / Airbnb" es más útil que "las apps suelen".

Si una búsqueda no devuelve nada específico, **dilo en claro** y apóyate en patrones establecidos, diciendo que vienen de ahí. Nunca presentes un resultado vacío como si hubiera dado material. Al entregar, **cita las fuentes que usaste con enlaces**.

## 3. Compara en una tabla

Una fila por patrón. Sin adornos:

| Patrón | ¿Está? | Qué aporta aquí |
|---|---|---|

Incluye siempre estas familias, que son las que más se olvidan:

- **Orientación**: ¿la pantalla dice qué se hace en ella y en qué punto del proceso está el usuario?
- **Entrada**: búsqueda, atajos, punto de partida para quien no sabe por dónde empezar.
- **Continuidad**: retomar lo empezado, repetir lo anterior, historial, trabajo en curso.
- **Confianza**: verificación, reseñas, precios, qué pasa si algo sale mal.
- **Feedback**: confirmación de cada acción, estados de carga y de error.
- **Descubribilidad**: todo gesto oculto (mantener pulsado, deslizar) necesita un equivalente visible.
- **Accesibilidad**: contraste, tamaño táctil, orden de lectura, alternativas al color.
- **Estados**: vacío, primera vez, mucho contenido, sin conexión.

## 4. Decide qué entra — y escribe por qué no entra el resto

No implementes por inercia. Descarta con argumento del **modelo de negocio**, no del gusto. Ejemplos del tipo de razonamiento que se espera: "regenerar respuesta no aplica porque el asistente construye una orden por pasos y rehacerla dejaría la conversación incoherente"; "no añado feed personalizado porque no se registran las señales de comportamiento que lo alimentan".

Un descarte bien explicado vale tanto como una implementación.

## 5. Implementa

- Respeta el sistema existente: tokens, tipografía, jerarquía de color. Si el acento de marca está reservado a la acción primaria, no lo repartas.
- **No inventes datos.** Usa contenido real del producto; cuando una cifra sea de muestra (precios, contadores, valoraciones), **dilo explícitamente al entregar**.
- Un elemento por intención. Si dos bloques dicen lo mismo con otras palabras, sobra uno.
- Nada que finja estructura sin informar: barras de progreso decorativas, cajas alrededor de todo, numeraciones donde no hay secuencia. Si hay secuencia de verdad, dibújala de verdad: número, conector con dirección y descripción de cada paso.

## 6. Verifica antes de entregar

- Contraste: texto pequeño **≥ 4.5:1**, texto grande y elementos de interfaz **≥ 3:1**. Ojo con los colores por opacidad: un tono de marca al 40% sobre fondo claro no suele pasar.
- Objetivos táctiles ≥ 44×44 y separados.
- Nada recortado ni solapado; comprueba medidas reales en lugar de fiarte de la vista.
- Si el entorno no te deja verificar (render desfasado, sin dispositivo), **dilo con claridad y pide confirmación**. No declares terminado lo que no has podido ver.
- Guarda en memoria las decisiones y los descartes, para que la próxima revisión no los repita.

## Formato de entrega

1. Una línea con lo que se revisó.
2. Lo que dice la investigación, con fuentes.
3. La tabla de comparación.
4. Lo implementado, y **lo descartado con su porqué**.
5. Lo que no pudiste verificar o quedó pendiente.
