# "Игра", для объяснения как работает протокол DMX, для консоли браузера

### Логика описана только для стробика

### Пример, вставить в консоль браузера код ниже и запустить:

```
// "создание" устройств по типу
var dev1 = new DeviceVDMX('head').setChannel(1);
var dev2 = new DeviceVDMX('simple').setChannel(5);
var dev3 = new DeviceVDMX('par').setChannel(7);
var dev4 = new DeviceVDMX('strobe').setChannel(9);
var dev5 = new DeviceVDMX('head').setChannel(10);
var dev6 = new DeviceVDMX('simple').setChannel(14);
var dev7 = new DeviceVDMX('strobe').setChannel(15);

// подключение устройств к "шине"
VDMX.connect(dev1)
    .connect(dev4)
    .connect(dev2)
    .connect(dev5)
    .connect(dev6)
    .connect(dev7)
    .connect(dev3);

 //start "световая программа"
// отправление пакета с данными
setTimeout(function () {// задержка на 1.5с
    VDMX.input({byte:"b090"}); // байты от 001 до 255 , запускают строб, чем выше байт, тем быстрее

    setTimeout(function () {// задержка на 5с и выполнение команды
        VDMX.input({byte:"000"}); // отправка пакета нулевой байт, в данном случае отключение прибора
    }, 5000);
}, 500);
// end "световая программа"
```