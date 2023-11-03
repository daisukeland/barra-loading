# barra-loading

```bash
$ yarn add barra-loading
$ npm install barra-loading --save
```

Usage
------------

### Example Single ###

```js
const barLoad = require('barra-loading');

// create new progress bar
const b1 = new barLoad.Single({
    format: 'CLI Progress |' + colors.cyan('{bar}') + '| {percentage}% || {value}/{total} Chunks || Speed: {speed}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
});

// initialize the bar - defining payload token "speed" with the default value "N/A"
b1.start(200, 0, {
    speed: "N/A"
});

// update values
b1.increment();
b1.update(20);

// stop the bar
b1.stop();
```
### Example Mutli ###
```js
const barLoad = require('barra-loading');

// create a new progress bar instance and use shades_classic theme
const bar1 = new barLoad.SingleBar({}, barLoad.Presets.shades_classic);

// start the progress bar with a total value of 200 and start value of 0
bar1.start(200, 0);

// update the current value in your application..
bar1.update(100);

// stop the progress bar
bar1.stop();
```

Single Bar Mode
-----------------------------------


### Initialize Constructor ###

Inicializa una nueva barra de progreso. ¡Una instancia se puede utilizar varias veces! ¡No es necesario recrearlo!

```js
const barLoad = require('barra-loading');

const <instance> = new barLoad.Single(options:object [, preset:object]);
```

#### Main Options ####


###  <instance>.start() ###

Starts the progress bar and set the total and initial value

```js
<instance>.start(totalValue:int, startValue:int [, payload:object = {}]);
```
###  <instance>.update() ###
```js
<instance>.update([currentValue:int [, payload:object = {}]]);

```
### <instance>.stop() ###
```js
<instance>.stop();
```

Multi Bar Mode
-----------------------------------

### Initialize Constructor ###


Inicialice un nuevo contenedor multiprogreso. Es necesario agregar barras. ¡Las options/presets se utilizan para cada compás! 

```js
const barLoad = require('barra-loading');

const <instance> = new barLoad.Mutli(options:object [, preset:object]);
```

### <instance>.create() ###

Agrega una nueva barra de progreso al contenedor e inicia la barra. Devuelve un objeto `Single` normal que se puede controlar individualmente.

Se pueden pasar `Options` adicionales directamente a la [barra genérica] (lib/generic-bar.js) para anular las opciones globales para una instancia de barra única. Esto puede resultar útil para cambiar la apariencia de un objeto de barra única. Pero tenga paciencia: esto sólo debe usarse para anular formatos; NO intente configurar otras opciones globales como la terminal, indicadores sincrónicos, etc.

```js
const <barInstance> = <instance>.create(totalValue:int, startValue:int [, payload:object = {} [, barOptions:object = {}]]);
```

### <instance>.remove() ###

Elimina una barra existente del contenedor de progreso múltiple.

```js
<instance>.remove(<barInstance>:object);
```

### <instance>.stop() ###

Detiene todas las barras de progreso.

```js
<instance>.stop();
```

### <instance>.log() ###

Genera contenido (buffered) encima de las barras múltiples durante la operación.

**Notice: newline at the end is required**


```js
<instance>.log("Hello World\n");
```


Bar Formatting
-----------------------------------

La barra de progreso se puede personalizar utilizando los siguientes marcadores de posición integrados. Se pueden combinar en cualquier orden.
- `{bar}` - la barra de progreso, personalizable mediante las opciones **barsize**, **barCompleteString** y **barIncompleteString**

- `{percentage}` - el progreso actual en porcentaje (0-100)

- `{total}` - el valor final

- `{value}` - el valor actual establecido por la última llamada `update()`

- `{eta}` - tiempo esperado de realización en segundos (limitado a 115 días, de lo contrario se muestra INF)

- `{duration}` - tiempo transcurrido en segundos

- `{eta_formatted}` - tiempo esperado de logro formateado en unidades apropiadas

- `{duration_formatted}` - tiempo transcurrido formateado en unidades apropiadas

- `{<payloadKeyName>}` - el valor de la carga útil identificado por su clave


### Example ###

```js
const opt = {
    format: 'progress [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}'
}
```

```js
function formatter(options, params, payload){

    // bar grows dynamically by current progress - no whitespaces are added
    const bar = options.barCompleteString.substr(0, Math.round(params.progress*options.barsize));

    // end value reached ?
    // change color to green when finished
    if (params.value >= params.total){
        return '# ' + colors.grey(payload.task) + '   ' + colors.green(params.value + '/' + params.total) + ' --[' + bar + ']-- ';
    }else{
        return '# ' + payload.task + '   ' + colors.yellow(params.value + '/' + params.total) + ' --[' + bar + ']-- ';
    }
}

const opt = {
    format: formatter
}
```

```
# Task 1     0/200 --[]--
# Task 1     98/200 --[████████████████████]--
# Task 1     200/200 --[████████████████████████████████████████]--
```