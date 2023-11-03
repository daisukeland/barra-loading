const _Terminal = require('./terminal');
const _Generic = require('./generic');
const _options = require('./options');
const _EventEmitter = require('events');

module.exports = class MultiBar extends _EventEmitter {

	constructor(options, preset) {
		super();

		this.bars = [];

		this.options = _options.parse(options, preset);

		this.options.synchronousUpdate = false;

		this.terminal = (this.options.terminal) ? this.options.terminal : new _Terminal(this.options.stream);

		this.timer = null;

		this.isActive = false;

		this.schedulingRate = (this.terminal.isTTY() ? this.options.throttleTime : this.options.notTTYSchedule);

		this.loggingBuffer = [];

		this.sigintCallback = null;
	}

	create(total, startValue, payload, barOptions = {}) {
		const bar = new _Generic(Object.assign({}, this.options, {
			terminal: this.terminal
		},
			barOptions,
		));

		this.bars.push(bar);

		if (this.options.noTTYOutput === false && this.terminal.isTTY() === false) {
			return bar;
		}

		if (this.sigintCallback === null && this.options.gracefulExit) {
			this.sigintCallback = this.stop.bind(this);
			process.once('SIGINT', this.sigintCallback);
			process.once('SIGTERM', this.sigintCallback);
		}

		if (!this.isActive) {
			if (this.options.hideCursor === true) {
				this.terminal.cursor(false);
			}

			if (this.options.linewrap === false) {
				this.terminal.lineWrapping(false);
			}

			this.timer = setTimeout(this.update.bind(this), this.schedulingRate);
		}

		this.isActive = true;

		bar.start(total, startValue, payload);

		this.emit('start');

		return bar;
	}

	remove(bar) {
		const index = this.bars.indexOf(bar);

		if (index < 0) {
			return false;
		}

		this.bars.splice(index, 1);

		this.update();

		this.terminal.newline();
		this.terminal.clearBottom();

		return true;
	}

	update() {
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = null;
		}

		this.emit('update-pre');

		this.terminal.cursorRelativeReset();

		this.emit('redraw-pre');

		if (this.loggingBuffer.length > 0) {
			this.terminal.clearLine();

			while (this.loggingBuffer.length > 0) {
				this.terminal.write(this.loggingBuffer.shift(), true);
			}
		}

		for (let i = 0; i < this.bars.length; i++) {
			if (i > 0) {
				this.terminal.newline();
			}

			this.bars[i].render();
		}

		this.emit('redraw-post');

		if (this.options.noTTYOutput && this.terminal.isTTY() === false) {
			this.terminal.newline();
			this.terminal.newline();
		}

		this.timer = setTimeout(this.update.bind(this), this.schedulingRate);

		this.emit('update-post');

		if (this.options.stopOnComplete && !this.bars.find(bar => bar.isActive)) {
			this.stop();
		}
	}

	stop() {

		clearTimeout(this.timer);
		this.timer = null;

		if (this.sigintCallback) {
			process.removeListener('SIGINT', this.sigintCallback);
			process.removeListener('SIGTERM', this.sigintCallback);
			this.sigintCallback = null;
		}

		this.isActive = false;

		if (this.options.hideCursor === true) {
			this.terminal.cursor(true);
		}

		if (this.options.linewrap === false) {
			this.terminal.lineWrapping(true);
		}

		this.terminal.cursorRelativeReset();

		this.emit('stop-pre-clear');

		if (this.options.clearOnComplete) {
			this.terminal.clearBottom();

		} else {
			for (let i = 0; i < this.bars.length; i++) {
				if (i > 0) {
					this.terminal.newline();
				}

				this.bars[i].render();

				this.bars[i].stop();
			}

			this.terminal.newline();
		}

		this.emit('stop');
	}

	log(s) {
		this.loggingBuffer.push(s);
	}
}