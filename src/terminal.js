
const _readline = require('readline');

// low-level terminal interactions
class Terminal {

	constructor(outputStream) {
		this.stream = outputStream;

		// default: line wrapping enabled
		this.linewrap = true;

		// current, relative y position
		this.dy = 0;
	}

	// save cursor position + settings
	cursorSave() {
		if (!this.stream.isTTY) {
			return;
		}

		// save position
		this.stream.write('\x1B7');
	}

	// restore last cursor position + settings
	cursorRestore() {
		if (!this.stream.isTTY) {
			return;
		}

		// restore cursor
		this.stream.write('\x1B8');
	}

	// show/hide cursor
	cursor(enabled) {
		if (!this.stream.isTTY) {
			return;
		}

		if (enabled) {
			this.stream.write('\x1B[?25h');
		} else {
			this.stream.write('\x1B[?25l');
		}
	}

	// change cursor positionn
	cursorTo(x = null, y = null) {
		if (!this.stream.isTTY) {
			return;
		}

		// move cursor absolute
		_readline.cursorTo(this.stream, x, y);
	}

	// change relative cursor position
	cursorRelative(dx = null, dy = null) {
		if (!this.stream.isTTY) {
			return;
		}

		// store current position
		this.dy = this.dy + dy;

		// move cursor relative
		_readline.moveCursor(this.stream, dx, dy);
	}

	// relative reset
	cursorRelativeReset() {
		if (!this.stream.isTTY) {
			return;
		}

		// move cursor to initial line
		_readline.moveCursor(this.stream, 0, -this.dy);

		// first char
		_readline.cursorTo(this.stream, 0, null);

		// reset counter
		this.dy = 0;
	}

	// clear to the right from cursor
	clearRight() {
		if (!this.stream.isTTY) {
			return;
		}

		_readline.clearLine(this.stream, 1);
	}

	// clear the full line
	clearLine() {
		if (!this.stream.isTTY) {
			return;
		}

		_readline.clearLine(this.stream, 0);
	}

	// clear everyting beyond the current line
	clearBottom() {
		if (!this.stream.isTTY) {
			return;
		}

		_readline.clearScreenDown(this.stream);
	}
	newline() {
		this.stream.write('\n');
		this.dy++;
	}
	write(s, rawWrite = false) {
		if (this.linewrap === true && rawWrite === false) {
			this.stream.write(s.substr(0, this.getWidth()));
		} else {
			this.stream.write(s);
		}
	}
	lineWrapping(enabled) {
		if (!this.stream.isTTY) return;
		this.linewrap = enabled;
		if (enabled) {
			this.stream.write('\x1B[?7h');
		} else {
			this.stream.write('\x1B[?7l');
		}
	}
	isTTY() {
		return (this.stream.isTTY === true);
	}
	getWidth() {
		return this.stream.columns || (this.stream.isTTY ? 80 : 200);
	}
}

module.exports = Terminal;