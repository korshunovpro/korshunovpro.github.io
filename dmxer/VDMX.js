/**
 * "игрушка", очень упрощенная "модель" для понимания dmx512
 */

var interval = {};

var DeviceLogic = {
    on : 'on',
    color : 'color',
    x: 'x',
    y: 'y'
};

/**
 * Список приборов
 */
var DeviceType = {
    device: {
        simple: {
            vdmx:true,
            channel: {
                1: {
                    type: DeviceLogic.on,
                    logic: function (byte, order) {

                    }
                },
                2: {
                    type: DeviceLogic.color,
                    logic: function (byte, order) {

                    }
                }
            }
        },
        par: {
            vdmx:true,
            channel: {
                1: {
                    type: DeviceLogic.on,
                    logic: function (byte, order) {

                    }
                },
                2: {
                    type: DeviceLogic.color,
                    logic: function (byte, order) {

                    }
                }
            }
        },
        head: {
            vdmx:true,
            channel: {
                1: {
                    type: DeviceLogic.on,
                    logic: function (byte, order) {

                    }
                },
                2: {
                    type: DeviceLogic.color,
                    logic: function (byte, order) {

                    }
                },
                3: {
                    type: DeviceLogic.x,
                    logic: function (byte, order) {

                    }
                },
                4: {
                    type: DeviceLogic.y,
                    logic: function (byte, order) {

                    }
                }
            }
        },
        strobe: {
            vdmx:true,
            channel: {
                1: {
                    type: DeviceLogic.on,
                    logic: function (byte, order) {
                        byte = byte.replace(/([^\d])/i, '');
                        byte = parseInt(byte);
                        if (byte > 255) {
                            byte = 255;
                        }
                        var time;

                        console.log(byte);

                        var light = document.querySelector('#device' + order + ' .light');
                        if (byte < 1) {
                            clearInterval(interval['device' + order]);
                            light.classList.remove('on');
                        } else {
                            clearInterval(interval['device' + order]);
                            light.classList.remove('on');

                            time = (1000/parseInt(byte)) * 10;
                            interval['device' + order] = setInterval(function() {
                                light.classList.toggle('on');
                            }, time);
                        }
                    }
                }
            }
        }
    },
    getList: function () {
        var list = [];
        for (var d in this.device) {
            if (this.device[d].hasOwnProperty('vdmx')) {
                list.push(d);
            }
        }
        return list;
    }
};

/**
 * Конструтов приборов
 * @constructor
 */
function DeviceModel(type) {
    var _self = this;
    var deviceType = type;

    /**
     * Реднер "устройства"
     * @param channel
     */
    _self.render = function (order, channel) {
        var row = document.querySelector('body .wire:first-child');

        var newDevice = document.createElement("div");
        newDevice.className = 'device ' + deviceType;
        newDevice.id = 'device' + order;

        var lamp = document.createElement("div");
        lamp.className = 'lamp';

        var light = document.createElement("div");
        light.className = 'light';

        var ch = document.createElement("h5");
        ch.appendChild(document.createTextNode('Ch' + channel));

        var tp = document.createElement("h4");
        tp.appendChild(document.createTextNode(deviceType));

        lamp.appendChild(light);
        newDevice.appendChild(lamp);
        newDevice.appendChild(ch);
        newDevice.appendChild(tp);
        row.appendChild(newDevice);
      };

    _self.getType = function() {
        return deviceType;
    };

    /*
     * Логика
     * @param order
     */
    _self.logic = function (byte, order) {
        DeviceType.device[type].channel[1].logic(byte, order);
    };

    /**
     * Обработка
     * @param frame
     * @param order
     */
    _self.run = function(frame, order) {
        _self.logic(frame.byte, order)
    };

    // init
    (function(){
        if (!DeviceType.device[type]) {
            throw new Error('Нет такого типа "устройст"!');
        }
        deviceType = type;
    })();

    return _self;
}


/**
 * Мастер "контроллер"
 */
var VDMX = (function () {

    var _self = {};
    var connection = {};
    var connectionCount = 0;

    /**
     * Подключение "устройства", последовательно
     * @param device
     * @returns {{}}
     */
    _self.connect = function (device) {
        if (!device.getChannel()) {
            throw new Error('Не назначен канал на устройстве #' + (connectionCount+1) + '!');
        }

        if (connectionCount == 7) {
            throw new Error('Подключено максимальное кол-во устройств!');
        }

        if (device.getOrder() > 0) {
            throw new Error('Данное устройство уже подключено!');
        }

        connectionCount++;
        connection[connectionCount] = device;
        connection[connectionCount].setOrder(connectionCount);
        if (connection[connectionCount-1] !== undefined) {
            connection[connectionCount-1].output(connection[connectionCount]);
        }
        return _self;
    };

    /**
     * Список подключенных "устройств"
     * @returns {{}}
     */
    _self.getConnectionList = function () {
        return connection;
    };


    /**
     * Входящий пакет данных, отдается первому "устройству", котороре передает данные дальше
     * @param data
     */
    _self.input = function(frame) {
        if (!checkData(frame)) {
            throw new Error('Формат данных не соответствует VDMX!' + "\n" + _self.getInfo());
        }

        if (!connection[1].hasOwnProperty('isVDMX')) {
            throw new Error('Первым подключено не VDMX утройство!');
        } else {
            connection[1].input(frame, true);
        }
    };

    /**
     * Инфо
     * @returns {string}
     */
    _self.getInfo = function () {
        return "{"
                + "\n   break : 0, // метка перед передачей пакета, значение '0' "
                + "\n   mab: 1,    // метка после break, обе метки подряд, обозначают начало пакета, значение'1' "
                + "\n   sc: 1,     // стартовый код, после него начинаются читаться данные из data, значение '1' "
                + "\n   data: { // данные - канал: байт данных"
                + "\n       1: b8, // байт данных принимает значения от 0-255"
                + "\n       2: b1,"
                + "\n       *: b*,"
                + "\n       *: b*,"
                + "\n       512: b155, // канал может быть до 512"
                + "\n   }"
                + "\n" + "\n}";
    };

    /**
     * Проверка данных на соответствие "протоколу"
     * @param data
     */
    function checkData(data) {
        return true;
    }

    return _self;
})();


/**
 * Конструктор "приборов"
 *
 * @param type
 * @returns {{}}
 * @constructor
 */
function DeviceVDMX (type) {

    var _self = {};
    var ch = 0;
    var tp = null;
    var Device = null;
    var order = 0;
    var outputDevice = null;

    /**
     * @type {boolean}
     */
    _self.isVDMX = true;

    /**
     * Инфо
     * @returns {string}
     */
    _self.getInfo = function () {
        return tp + ', ' + ch;
    };

    /**
     * Получает входящий фрейм
     * @param frame
     * @param start
     */
    _self.input = function (frame, start) {
        if (order > 1 && start == true) {
            throw new Error('Данные можно отправлять только на первое подключенное устройство!');
        }

        processing(frame);
        if (outputDevice) {
            outputDevice.input(frame, false);
        }
    };

    /**
     * Подключение устройства к выходу
     * @param device
     */
    _self.output = function (device) {
        outputDevice = device;
    };

    /**
     * Назначение канала
     * @param number
     * @returns {{}}
     */
    _self.setChannel = function (number) {
        if (number > 512) {
            throw new Error('Можно использовать только 512 каналов!');
        } else {
            ch = number;
        }
        return _self;
    };

    _self.getChannel = function () {
        return ch;
    };

    /**
     *
     * @param type
     */
    function getDevice(type) {
        Device = new DeviceModel(type);
    }

    /**
     * Порядок подключения
     * @param number
     */
    _self.setOrder = function (number) {
        order = number;
        Device.render(_self.getOrder(), _self.getChannel());
    };

    _self.getOrder = function () {
        return order;
    };

    /**
     * Обработка данных
     * @param frame
     */
    function processing(frame) {
        Device.run(frame, order, ch);
    }

    // init
    (function(){
        if (!type) {
            throw new Error('Тип устройства не определен!');
        }
        getDevice(type);
    })();

    return _self;
}
