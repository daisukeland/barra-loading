const _EventEmitter = require('events');
const Terminal = require('./terminal');
const ETA = require('./eta');
const _options = require("./options");
const { _FormatBar, _FormatValue, _FormatTime } = require('./formats');

class Generic extends _EventEmitter {
	constructor(options) {
		super();

		this.options = _options.assignDerivedOptions(options);

		this.terminal = (this.options.terminal) ? this.options.terminal : new Terminal(this.options.stream || process.stderr);

		this.value = 0;

		this.startValue = 0;

		this.total = 100;

		this.payload = {};

		this.startTime = null;

		this.stopTime = null;

		this.lastDrawnString = null;

		this.formatTime = options.formatTime || _FormatTime;

		this.formatValue = options.formatValue || _FormatValue;

		this.formatBar = options.formatBar || _FormatBar;
	}

	render(forceRendering = false) {

		const params = {
			progress: this.getProgress(),
			startTime: this.startTime,
			stopTime: this.stopTime,
			eta: this.eta.getTime(),
			total: this.total,
			value: this.value,
			maxWidth: this.terminal.getWidth()
		};

		const s = this.formatter(this.options, params, this.payload);

		const forceRedraw = forceRendering || this.options.forceRedraw || (this.options.noTTYOutput && !this.terminal.isTTY());

		if (forceRedraw || this.lastDrawnString != s) {
			this.terminal.cursorTo(0, null);
			this.terminal.write(s);
			this.terminal.clearRight();
			this.lastDrawnString = s;
			this.lastRedraw = Date.now();

		}
	}

	start(total, startValue, payload) {

		this.value = startValue || 0;
		this.total = (typeof total !== 'undefined' && total >= 0) ? total : 100;

		this.startValue = (startValue || 0);

		this.payload = payload || {};

		this.startTime = Date.now();

		this.stopTime = null;

		this.lastDrawnString = '';

		this.eta = new ETA(Date.now(), this.startTime, this.value);

		this.isActive = true;

		this.emit('start', total, startValue);
	}

	stop() {

		this.isActive = false;

		this.stopTime = Date.now();

		this.emit('stop', this.total, this.value);
	}

	update(arg0, arg1 = {}) {

		if (typeof arg0 === 'number') {

			this.value = arg0.toFixed(2);

			this.eta.update(Date.now(), arg0, this.total);
		}

		const payloadData = ((typeof arg0 === 'object') ? arg0 : arg1) || {};

		this.emit('update', this.total, this.value);

		for (const key in payloadData) {
			this.payload[key] = payloadData[key];
		}

		if (this.value >= this.total && this.options.stopOnComplete) this.stop();
	}

	getProgress() {
		let progress = (this.value / this.total);

		if (isNaN(progress)) progress = (this.options && this.options.emptyOnZero) ? 0.0 : 1.0;

		progress = Math.min(Math.max(progress, 0.0), 1.0);

		return progress;
	}

	formatter(options, params, payload) {
		const { formatTime, formatValue, formatBar } = this;


		const percentage = Number((params.progress * 100).toFixed(2)) + '';
		const stopTime = params.stopTime || Date.now();
		const elapsedTime = Number(((stopTime - params.startTime) / 1000).toFixed(2));

		const context = Object.assign({}, payload, {
			bar: formatBar(params.progress, options),

			percentage: formatValue(percentage, options, 'percentage'),
			total: formatValue(params.total, options, 'total'),
			value: formatValue(Number(params.value), options, 'value'),

			eta: formatValue(params.eta, options, 'eta'),
			eta_formatted: formatTime(params.eta, options, 5),

			duration: formatValue(elapsedTime, options, 'duration'),
			duration_formatted: formatValue(Date.now(), options, "duration_formatted")
		});


		return options.format.replace(/\{(\w+)\}/g, function (match, key) {
			if (typeof context[key] !== 'undefined') return context[key];

			return match;
		});

	}
}

module.exports = Generic;