# Prompts iniciales - JCO

## Prompt 1

Analiza el backend del repositorio `AI4Devs-tdd-202602-Seniors` y detecta los flujos principales de la funcionalidad de insercion de candidatos que deberian quedar cubiertos con tests unitarios en Jest. Separa los casos por validacion de datos y persistencia en base de datos.

## Prompt 2

Genera una suite inicial en Jest para `addCandidate`, usando TypeScript y mocks de Prisma para evitar tocar una base de datos real. La suite debe comprobar al menos: candidato valido, rechazo de datos invalidos antes de persistir, guardado de educacion/experiencia/CV asociados y error de email duplicado.

## Prompt 3

Revisa los tests generados aplicando buenas practicas del modulo: nombres descriptivos, estructura Arrange-Act-Assert, independencia entre tests, mocks limpios y aserciones claras sobre efectos externos.
