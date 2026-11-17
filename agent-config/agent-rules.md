# Reglas del agente de código de JOLUP

Estas reglas se suman a las convenciones de `~/.claude/CLAUDE.md` (JP Development)
y al `CLAUDE.md` del repositorio, si existe. El del repositorio manda en lo propio
de ese proyecto: stack, comandos y estructura.

## Modo autónomo

Trabajas sin supervisión. Nadie va a contestar preguntas durante la ejecución, así
que las convenciones que piden consultar al desarrollador se aplican así:

- **«Preguntar antes de escribir código» / «si hay ambigüedad, preguntar»:** si la
  ambigüedad cambia el resultado, no hagas commits y explica en el resumen final qué
  decisión hace falta. Si hay una opción claramente más segura y reversible, tómala y
  dila en el resumen.
- **«Instalar dependencias nuevas: listarlas y esperar confirmación»:** no añadas
  dependencias salvo que la tarea sea imposible sin ellas. Si añades alguna,
  justifícala en el resumen.
- **«Mencionar problemas de seguridad o rendimiento aunque no sean el foco»:** no los
  arregles si quedan fuera de la tarea; anótalos en el resumen.
- **«No reorganizar, renombrar ni mover archivos sin que lo pidan»:** se mantiene tal
  cual. Cambia lo mínimo que resuelve la tarea.
- **Footers, marcas o textos comerciales:** no los añadas ni los cambies si la tarea
  no lo pide.
- **Commits:** Conventional Commits, en la rama actual. No hagas push.

## Diseño, frontend y UX: usa siempre las tres skills

Siempre que la tarea toque diseño, frontend (páginas, componentes, estilos, layouts,
textos de interfaz) o cualquier integración de UX, **usa siempre estas tres skills
con la herramienta `Skill`, antes de escribir código**, y sigue lo que indiquen:

1. **`ux-review`**: para decidir qué cambiar, contrastando lo que existe con productos
   de referencia.
2. **`ui-ux-pro-max`**: para las reglas concretas de estilo, color, tipografía,
   accesibilidad y el stack del proyecto.
3. **`frontend-design`**: para la dirección visual de lo que construyas.

Cómo aplicarlas en este entorno:

- **Scripts de `ui-ux-pro-max`:** están en
  `/home/node/.claude/skills/ui-ux-pro-max/scripts/search.py`. Ejecútalos con
  `python3` y esa ruta absoluta (la variable `CLAUDE_PLUGIN_ROOT` de la skill no
  existe aquí).
- **`frontend-design` en pantallas que ya existen:** trabaja dentro del sistema de
  diseño que ya hay (tokens, paleta, tipografía, componentes). Su invitación a tomar
  un riesgo estético solo vale para piezas nuevas que no tengan sistema, y aun así
  sin cambiar la marca.
- **`ux-review` pide confirmación y guardar en memoria:** aquí no hay a quién
  preguntar ni memoria que persista. Lo que no puedas verificar y las decisiones o
  descartes van en el resumen final.
- **Si una skill no se puede usar** (por ejemplo, la web no responde), dilo en el
  resumen y sigue con las otras.

En el resumen final, di qué skills usaste y qué sacaste de cada una.
