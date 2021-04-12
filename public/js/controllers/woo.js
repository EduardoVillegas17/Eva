eva.controller('woo', ['$scope', '$http', function ($scope, $http) {
    $scope.listado = [];
    $scope.soundlistado = [];
    $scope.temp = [];
    $scope.led = [];
    $scope.accion = 'Agregar';
    $scope.icon = true;
    $scope.order = '';
    $scope.tipo = 'speak';

    $scope.z = 0;
    $scope.wooid = '';
    $scope.commands = [];
    $scope.tempwoo = {};
    $scope.tempid = -1;

    $scope.emotionsicon = [
        { type: 'emotion', emotion: 'ini', level: 0, img: '/images/normal.png', name: 'Neutral', speed: 2.0 },
        { type: 'emotion', emotion: 'sad', level: 0, img: '/images/triste.png', name: 'Triste', speed: 2.0 },
        { type: 'emotion', emotion: 'sad', level: 1, img: '/images/triste1.png', name: 'Triste 1', speed: 2.0 },
        { type: 'emotion', emotion: 'sad', level: 2, img: '/images/triste2.png', name: 'Triste 2', speed: 2.0 },
        { type: 'emotion', emotion: 'anger', level: 0, img: '/images/ira.png', name: 'Ira', speed: 2.0 },
        { type: 'emotion', emotion: 'anger', level: 1, img: '/images/ira1.png', name: 'Ira 1', speed: 2.0 },
        { type: 'emotion', emotion: 'anger', level: 2, img: '/images/ira2.png', name: 'Ira 2', speed: 2.0 },
        { type: 'emotion', emotion: 'joy', level: 0, img: '/images/feliz.png', name: 'Alegría', speed: 2.0 },
        { type: 'emotion', emotion: 'joy1', level: 1, img: '/images/feliz1.png', name: 'Alegría 1', speed: 2.0 },
        { type: 'emotion', emotion: 'joy2', level: 2, img: '/images/feliz2.png', name: 'Alegría 2', speed: 2.0 }
    ];

    $scope.list = function () {
        $http.get('/api/common?db=woo').then(function successCallback(response) {
            $scope.listado = response.data;
        }, function errorCallback(response) {
        });
        $http.get('/api/audio').then(function successCallback(response) {
            $scope.soundlistado = response.data;
        }, function errorCallback(response) {
        });
        $http.get('api/common?db=led').then(function successCallback(response) {
            $scope.led = response.data;
        }, function errorCallback(response) {
        });
    }

    $scope.loadcomands = function () {
        for (let i = 0; i < $scope.listado.length; i++) {
            if ($scope.listado[i]._id == $scope.wooid) {
                $scope.tempwoo = $scope.listado[i];
                $scope.commands = $scope.tempwoo.command.sort(((a, b) => a.order - b.order));
            }
        }
    }

    $scope.execute = function (obj) {
        $http.post('/nodes', obj).then(function successCallback(response) {
        }, function errorCallback(response) {
        });
        $('#' + ($scope.tempwoo.order[$scope.z]) + ' span').css('color', 'black');
        $scope.z = $scope.z + 1;
        $('#' + ($scope.tempwoo.order[$scope.z]) + ' span').css('color', 'green');
    }

    $scope.node = function (obj) {
        $http.post('/nodes', obj).then(function successCallback(response) {
        }, function errorCallback(response) {
        });
    }

    $scope.mov = function (dir) {
        $scope.node({ type: 'mov', mov: dir });
    }

    //crud woo
    $scope.create = function () {
        $http.post('/api/common?db=woo', { name: $scope.name, command: [], order: $scope.order.split(',') }).then(function successCallback(response) {
            $scope.list();
            Object.assign($scope, { tempwoo: response.data.obj, wooid: $scope.tempwoo._id, name: '', order: '' });
            $('#wooaddid').modal('hide');
            $scope.commands = [];
        }, function errorCallback(response) {
        });
    }

    $scope.update = function (l) {
        Object.assign($scope, { icon: false, accion: 'Editar', name: $scope.tempwoo.name, order: $scope.tempwoo.order.join(',') });
    }

    $scope.updatesend = function (flag) {
        var json = { name: $scope.name || $scope.tempwoo.name, command: $scope.commands };
        if (flag) {
            Object.assign(json, { order: $scope.order.split(',') });
        }
        $http.put('/api/common/' + $scope.tempwoo._id + '?db=woo', json).then(function successCallback(response) {
            Object.assign($scope, { name: '', order: '', icon: true, accion: 'Agregar' });
            $('#wooaddid').modal('hide');
            $scope.list();
            notify('Interacción guardada correctamente');
        }, function errorCallback(response) {
            notify('A ocurrido un error al guardar la interacción', 'danger');
        });
    }
    $scope.delete = function () {
        $http.delete('/api/common/' + $scope.tempwoo._id + '?db=woo').then(function successCallback(response) {
            $scope.list();
        }, function errorCallback(response) {
        });
    }
    //endcrudwoo

    //crudcommandswoo
    $scope.ccommand = function () {
        if ($scope.tempid == -1) {
            if ($scope.tipo == 'speak') {
                $scope.commands.push({ type: 'speak', text: $scope.text, desc: $scope.text, order: $scope.corder });
                $scope.text = '';
                $scope.corder = 0;
            } else if ($scope.tipo == 'sound') {
                $scope.commands.push({ type: 'sound', src: $scope.thesound, desc: $scope.thesound, order: $scope.corder });
            }
            else if ($scope.tipo == 'led') {
                let temp = $scope.led.filter(x => x._id == $scope.leds)[0];
                $scope.commands.push({ type: 'led', base: temp.base, anim: $scope.leds, desc: temp.nombre, order: $scope.corder });
            }
        } else {
            if ($scope.tipo == 'speak') {
                $scope.commands[$scope.tempid] = { type: 'speak', text: $scope.text, desc: $scope.text, order: $scope.corder };
                $scope.text = '';
                $scope.corder = 0;
            } else if ($scope.tipo == 'sound') {
                $scope.commands[$scope.tempid] = { type: 'sound', src: $scope.thesound, desc: $scope.thesound, order: $scope.corder };
            }
            else if ($scope.tipo == 'led') {
                let temp = $scope.led.filter(x => x._id == $scope.leds)[0];
                $scope.commands[$scope.tempid] = { type: 'led', base: temp.base, anim: $scope.leds, desc: temp.nombre, order: $scope.corder };
            }
        }
        $scope.commands.sort(((a, b) => a.order - b.order));
        $scope.tempid = -1;
        $('#wooaddcs').modal('hide');
    }

    $scope.ucommand = function (id) {
        $scope.tempid = id;
        $scope.tipo = $scope.commands[id].type;
        $scope.text = $scope.commands[id].text || '';
        $scope.thesound = $scope.commands[id].src || '';
        $scope.corder = $scope.commands[id].order;
        $scope.leds = $scope.commands[id].anim || '';
        $('#wooaddcs').modal('show');
    }

    $scope.cdelete = function (i) {
        $scope.commands.splice(i, 1);
    }
    //endcrudcommandswoo

    $scope.fa_icon = function (value) {
        switch (value) {
            case 'speak':
                return 'fa-comments-o';
            case 'led':
                return 'fa-lightbulb-o';
            case 'sound':
                return 'fa-volume-up';
            default:
                break;
        }
    }

    $scope.list();
}]);