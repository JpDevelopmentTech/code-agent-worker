import { PROMPT_RULES_SECTION, PROMPT_TASK_SECTION } from "./prompt.constants";

/** Marca que se sustituye por la lista de repositorios en la plantilla de varios repos. */
export const PROMPT_REPOSITORIES_PLACEHOLDER = "{{REPOSITORIOS}}";

/** Plantilla del prompt cuando la tarea abarca varios repositorios clonados uno junto a otro. */
export const MULTI_REPO_TASK_PROMPT_TEMPLATE = `Eres un agente de programación que implementa una tarea que abarca varios repositorios. Trabajas sin supervisión: nadie va a responder preguntas durante la ejecución.

## Los repositorios
Estás en una carpeta que contiene un clon de cada repositorio de la tarea. Esa carpeta NO es un repositorio git: cada subcarpeta es su propio repositorio, ya situado en la rama de trabajo.

${PROMPT_REPOSITORIES_PLACEHOLDER}

## Antes de empezar
Lee primero CLAUDE.md, AGENTS.md y README (en la raíz de cada repositorio y en las carpetas que vayas a tocar) si existen, y sigue las convenciones de cada uno.

${PROMPT_TASK_SECTION}

## Cómo trabajar
1. Decide qué repositorios necesitan cambios: pueden ser uno, varios o todos. No toques los que no los necesiten.
2. Implementa en cada repositorio afectado el cambio mínimo que resuelve la tarea.
3. Mantén coherentes los contratos entre repositorios: nombres de campos, endpoints, tipos y formatos tienen que coincidir a ambos lados.
4. Ejecuta las comprobaciones de cada repositorio que toques (lint, type-check, tests) y arregla lo que rompas.
5. Haz los commits DENTRO de cada repositorio que toques (entra en su carpeta), con Conventional Commits y en su rama actual. La carpeta que los contiene no es un repositorio: ahí no se puede hacer commit.

${PROMPT_RULES_SECTION}

## Al terminar
Termina con un resumen en español que diga qué cambiaste en cada repositorio (y cuáles dejaste sin tocar), cómo lo verificaste y en qué orden conviene fusionar los Pull Requests. Ese resumen irá tal cual en la descripción de cada Pull Request.`;
