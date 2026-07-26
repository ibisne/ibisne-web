# BORRADOR · Acuerdo mutuo de confidencialidad (NDA)

> 📌 **Documento de ONBOARDING interno. El sitio web ya no lo menciona (v22).**
> Pedir la firma de un NDA como argumento de venta genera fricción y posiciona a iBisne
> como proveedor defensivo en lugar de autoridad técnica, así que se eliminó de toda la
> comunicación pública. El acuerdo sigue existiendo como práctica: se maneja al arrancar
> con un cliente, no en el primer contacto. Ver `MESSAGING.md` § "Dos errores que NO se
> pueden repetir".

> ⚠️ **ESTE ES UN BORRADOR OPERATIVO, NO UN DOCUMENTO LEGAL VÁLIDO.**
> Fue redactado como punto de partida para acelerar la conversación con un abogado.
> **No lo uses con clientes sin revisión legal profesional.** Un NDA mal redactado
> es peor que no tener ninguno: da falsa seguridad a las dos partes y puede ser
> inejecutable ante un tribunal mexicano.
>
> Puntos que tu abogado debe revisar sí o sí:
> - La excepción de **desarrollos preexistentes** de iBisne (cláusula 4). Sin ella,
>   iBisne no podría reutilizar sus propios frameworks, y con ella mal redactada el
>   cliente podría sentirse desprotegido. Es la cláusula más delicada del documento.
> - El **plazo de vigencia** (cláusula 6) y si aplica a secretos industriales a perpetuidad.
> - La **jurisdicción** y si conviene cláusula arbitral en lugar de tribunales.
> - Si iBisne necesita además un **acuerdo de no competencia** por vertical, que
>   deliberadamente NO está incluido aquí (ver nota al final).

---

## Acuerdo mutuo de confidencialidad

Celebrado entre **iBisne S.A.S. de C.V.** ("iBisne"), con domicilio en Zapopan, Jalisco, México,
y **______________________** ("la Contraparte"), conjuntamente "las Partes",
con fecha **____ de ____________ de 20____**.

### 1. Propósito

Las Partes desean sostener conversaciones para evaluar una posible colaboración en el
diseño, desarrollo o financiamiento de un proyecto tecnológico. Para ello necesitan
intercambiar información confidencial, y este acuerdo la protege **antes** de que ese
intercambio ocurra.

### 2. Qué se considera información confidencial

Toda información que una Parte comparta con la otra con motivo de este propósito, en
cualquier formato, incluyendo de forma enunciativa y no limitativa: conceptos de negocio,
modelos de monetización, datos financieros y de operación, listas de clientes o
proveedores, especificaciones técnicas, código fuente, diseños, algoritmos, estrategias
comerciales y cualquier documento derivado de las conversaciones.

### 3. Obligaciones de las Partes

Cada Parte se obliga a:

a) Mantener la información confidencial en estricta reserva y no divulgarla a terceros
   sin autorización previa y por escrito de la Parte que la reveló.
b) Usar la información **exclusivamente** para evaluar la colaboración descrita en la
   cláusula 1, y para ningún otro fin.
c) Limitar el acceso a la información a las personas de su equipo que necesiten conocerla,
   quienes quedarán sujetas a obligaciones de confidencialidad equivalentes.
d) Proteger la información con el mismo grado de cuidado que aplica a la suya propia, y en
   ningún caso con un grado menor al razonable.
e) Devolver o destruir la información recibida dentro de los 15 días naturales siguientes
   a que la otra Parte lo solicite por escrito.

### 4. Titularidad y desarrollos preexistentes

La información confidencial y los derechos de propiedad intelectual sobre ella permanecen
en todo momento con la Parte que la reveló. Este acuerdo no transfiere ninguna licencia ni
derecho de uso.

Las Partes reconocen que iBisne cuenta con **frameworks, bibliotecas, componentes,
herramientas y metodologías propias desarrolladas con anterioridad** a la firma de este
acuerdo. Nada de lo aquí pactado limita el derecho de iBisne a seguir usando, licenciando o
explotando esos elementos preexistentes, siempre que no incorporen información confidencial
de la Contraparte.

### 5. Excepciones

No se considera información confidencial aquella que la Parte receptora pueda demostrar que:

a) Era de dominio público al momento de recibirla, o pasó a serlo sin que ella lo causara.
b) Ya estaba legítimamente en su poder antes de recibirla.
c) Le fue revelada por un tercero sin obligación de confidencialidad.
d) Fue desarrollada de forma independiente sin usar la información recibida.
e) Deba revelarse por mandato de autoridad competente, en cuyo caso la Parte receptora lo
   notificará a la otra con la anticipación razonable que la ley permita.

### 6. Vigencia

Este acuerdo entra en vigor en la fecha de su firma y las obligaciones de confidencialidad
permanecen vigentes por **____ años** contados a partir de la última revelación de
información, con independencia de que la colaboración evaluada se concrete o no.

### 7. Ausencia de obligación de contratar

Este acuerdo no obliga a ninguna de las Partes a celebrar contrato alguno, ni constituye
sociedad, asociación en participación, coinversión ni relación laboral entre ellas. Cada
Parte cubre sus propios gastos derivados de las conversaciones.

### 8. Incumplimiento

Las Partes reconocen que la violación de este acuerdo puede causar daños de difícil
reparación económica, por lo que la Parte afectada podrá exigir el cumplimiento forzoso,
las medidas precautorias que procedan y la reparación de daños y perjuicios.

### 9. Ley aplicable y jurisdicción

Este acuerdo se rige por las leyes de los Estados Unidos Mexicanos. Para su interpretación
y cumplimiento, las Partes se someten a la jurisdicción de los tribunales competentes de
**Zapopan, Jalisco**, renunciando a cualquier otro fuero.

---

**iBisne S.A.S. de C.V.**

Nombre: ______________________
Cargo: ______________________
Firma: ______________________

**La Contraparte**

Nombre: ______________________
Cargo / Razón social: ______________________
Firma: ______________________

---

## Nota sobre lo que NO incluye este borrador

El sitio publica cuatro **reglas de operación** (ver `/como-trabajamos/` § "Cómo operamos").
Ninguna se enuncia como cláusula, pero todas deben poder sostenerse en la práctica:

1. **La discreción es estándar** → este documento respalda la práctica, pero la regla se
   cumple con controles reales: accesos nominales, repositorios aislados, need-to-know.
2. **El activo es tuyo** (código y plataforma a nombre del cliente) → cláusula 4 (parcial)
   + contrato de desarrollo. Es la afirmación legalmente correcta, a diferencia de prometer
   propiedad sobre una idea, que no es objeto de PI en México.
3. **La lectura es tuya** (análisis entregado sin condición) → contrato de servicios, no NDA.
4. **El precio va primero** (cotización cerrada, 60 días) → la propia cotización.

**No se incluyó** cláusula de no competencia por vertical, y el sitio tampoco la promete.
Eduardo no la confirmó, y acotarla mal bloquearía el negocio propio de iBisne, que ya opera
en verticales concretas (iBroker en inmobiliaria, iFutbol en deportes, iPool en albercas).
Si se quiere ofrecer, debe acotarse a **vertical + modelo de negocio específico** y por un
plazo corto, nunca a categoría completa.
