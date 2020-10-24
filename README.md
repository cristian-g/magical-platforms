Practical 4: WebGL app
Alumnos: Cristian González Ruz (login c.gonzalez.2015) y Marc Castells i Güell (login marc.castells.2015)

La app que hemos programado es un juego abstracto en el que el jugador tiene que controlar un coche para seguir un camino de bloques sin caerse al vacío. El objetivo del juego es conseguir el máximo de puntos antes de caerse al vacío. Cada punto significa que se ha superado un bloque.

Comentarios:
-	El coche se controla con las flechas del teclado. Flecha hacia arriba: acelerar; flecha hacia abajo: frenar; flecha hacia la izquierda: girar hacia la izquierda, flecha hacia la derecha: girar hacia la derecha.
-	El recorrido es infinito gracias a que cargamos solo 20 bloques y los que quedan detrás se mueven hacia delante para completar el camino. Al estar moviendo los bloques y no generar nuevos estamos consiguiendo más optimización.
-	La posición y rotación de los bloques es aleatoria cada vez que se ejecuta el juego para conseguir que cada partida sea una experiencia diferente.
-	Algunos bloques tienen desplazamiento vertical y otros tienen colocada una roca esférica encima para añadir dificultad al juego.
-	La dificultad del juego es progresiva porque en el inicio el movimiento de los bloques es más lento y su amplitud es más pequeña.
-	Para conseguir las físicas hemos usado el plugin de Three.js llamado Physijs (http://chandlerprall.github.io/Physijs/) junto con la librería ammo.js. El modelo original del coche se encuentra en uno de los ejemplos del plugin, para nuestro juego le hemos cambiado el color del chasis y de las ruedas. Todos los objetos (incluido el coche) tienen físicas para simular el juego utilizando las clases de Physijs: las esferas tienen SphereMesh y los bloques tienen ConvexMesh porque son pirámides invertidas.
-	El fondo de colores es una adaptación del visualizador de audio programado con Three.js de https://github.com/tariqksoliman/Vissonance. Este visualizador de audio genera la animación de forma procedural a partir de la música en directo. La canción incluida puede ser encontrada en https://www.youtube.com/watch?v=__CRWE-L45k.
-	Hemos añadido un pequeño efecto de niebla (por eso los bloques más lejanos se ven más blancos ⁄ con menos color) para un resultado más estético.
-	Hemos implementado un sistema de puntos que cuenta los bloques superados y los va mostrando en la esquina superior derecha de la pantalla y también en la alerta de Game Over.
-	El mensaje inicial de la app utiliza animaciones de la librería jQuery (http://jquery.com/) y el mensaje de Game Over utiliza la librería SweetAlert (https://sweetalert.js.org/).
-	En la esquina superior izquierda de la pantalla se puede ver un indicador de los frames por segundo para comprobar que el juego está bien optimizado. En nuestro caso el juego se ejecuta a unos 55 fps de media.

Nota:
La app se puede ejecutar con el siguiente comando: 
python3 -m http.server