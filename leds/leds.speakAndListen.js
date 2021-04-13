const matrix = require("@matrix-io/matrix-lite");
const { modColor, hexToRgb, siguiente, anterior, frente } = require('./leds.utils');

const escuchaC = (obj) => {
    let ledguide = obj.led1;
    let dir = 1;
    return setInterval(() => {
        let everloop = new Array(matrix.led.length).fill('#000000');
        for (let i = -1; i < obj.led3 - 1; i++) {
            everloop[(i == -1 ? ledguide : siguiente(ledguide + i))] = obj.color1;
        }
        if (dir == 1) {
            if (everloop[obj.led2] != obj.color1){
                ledguide = siguiente(ledguide);
            } else {
                dir = -1;
            }
        } else if (dir == -1) {
            if (everloop[obj.led1] != obj.color1) {
                ledguide = anterior(ledguide);
            } else {
                dir = 1;
            }
        }
        matrix.led.set(everloop);
    }, obj.time);
}

const escuchaT = (obj) => {
    let limit = hexToRgb(obj.color1);
    let ledInicio = 0;
    let direccion = true;
    let everloop = new Array(matrix.led.length).fill('#000000');
    return setInterval(() => {
        for (let i = 0; i < 18; i++) {
            if (direccion && everloop[i] != '#000000') {
                everloop[i] = modColor(everloop[i], 6, limit);
            } else if (!direccion && everloop[i] != obj.color1) {
                everloop[i] = modColor(everloop[i], -6, limit);
            }
        }
        let start = true;
        let until = direccion ? 0 : 4;
        while (start) {
            let pos = siguiente((ledInicio - 1) + until);
            let posn = anterior((ledInicio + 1) - until);

            if (everloop[pos] == '#000000' && direccion) {
                everloop[pos] = modColor('#000000', 3, limit);
                everloop[frente(pos)] = everloop[pos];
                everloop[posn] = everloop[pos];
                everloop[frente(posn)] = everloop[pos];
                start = false;
            }
            if (everloop[pos] == obj.color1 && !direccion) {
                everloop[pos] = modColor(obj.color1, -3, limit);
                everloop[frente(pos)] = everloop[pos];
                everloop[posn] = everloop[pos];
                everloop[frente(posn)] = everloop[pos];
                start = false;
            }
            until = direccion ? until + 1 : until - 1;
            if (until > 4 || until < 0) {
                start = false;
            }
        }

        let rebaso = true;
        for (let i = 0; i < 18; i++) {
            if (direccion) {
                if (everloop[i] != obj.color1) {
                    rebaso = false;
                }
            } else {
                if (everloop[i] != "#000000") {
                    rebaso = false;
                }
            }
        }
        if (rebaso) {
            direccion = !direccion;
            ledInicio = direccion ? siguiente(ledInicio + 1) : ledInicio;
        }
        matrix.led.set(everloop);
    }, obj.time);
}

const stop = () => {
    everloop = new Array(matrix.led.length).fill({});
    matrix.led.set(everloop);
}

escuchaC['params'] = { color: 1, led: 3, time: 1 };
escuchaT['params'] = { color: 1, led: 0, time: 1 };
stop['params'] = { color: 0, led: 1, time: 1 };

module.exports = {
    escuchaC,
    escuchaT,
    stop
}
