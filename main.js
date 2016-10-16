var util = require('util');
var bleno = require('bleno');
var Gpio = require('pigpio').Gpio

var RED_PIN=4
var GREEN_PIN=17
var BLUE_PIN=27

var red_led = new Gpio(RED_PIN, {mode: Gpio.OUTPUT})
var green_led = new Gpio(GREEN_PIN, {mode: Gpio.OUTPUT})
var blue_led = new Gpio(BLUE_PIN, {mode: Gpio.OUTPUT})

var BlenoCharacteristic = bleno.Characteristic;
var BlenoPrimaryService = bleno.PrimaryService;

var LedCharacteristic = function() {
  LedCharacteristic.super_.call(this, {
    uuid: 'e1ed',
    properties: ['read', 'write', 'notify'],
    value: null
  });

  this._value = new Buffer(0);
  this._updateValueCallback = null;
};

util.inherits(LedCharacteristic, BlenoCharacteristic);

LedCharacteristic.prototype.onReadRequest = function(offset, callback) {
  console.log('LedCharacteristic - onReadRequest: value = ' + this._value.toString('hex'));

  callback(this.RESULT_SUCCESS, this._value);
};

LedCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
  this._value = data;
    hex_rssi = this._value.toString('hex');
    int_rssi = parseInt(hex_rssi, 16);

    if(int_rssi > 0 && int_rssi < 70){
	writeColorToLED(0,0,1);
    }else{
	writeColorToLED(1,0,0);
    }
    
    console.log('LedCharacteristic - onWriteRequest: value = ' + parseInt(hex_rssi, 16));
    
  if (this._updateValueCallback) {
    console.log('LedCharacteristic - onWriteRequest: notifying');

    this._updateValueCallback(this._value);
  }

  callback(this.RESULT_SUCCESS);
};


bleno.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);
    writeColorToLED(0,0,0);
  if (state === 'poweredOn') {
    bleno.startAdvertising('led', ['e1ef']);
  } else {
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', function(error) {
  console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));

  if (!error) {
    bleno.setServices([
      new BlenoPrimaryService({
        uuid: 'e1ef',
        characteristics: [
          new LedCharacteristic()
        ]
      })
    ]);
  }
});

var writeColorToLED = function(red, green, blue){
    console.log(red + " " + green + " " + blue);
    red_led.digitalWrite(red);
    green_led.digitalWrite(green);
    blue_led.digitalWrite(blue);
};
