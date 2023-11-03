module.exports = {
	legacy: {
		format: 'progress [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}',
		barCompleteChar: '=',
		barIncompleteChar: '-'
	},
	classic: {
		format: ' {bar} {percentage}% | ETA: {eta}s | {value}/{total}',
		barCompleteChar: '\u2588',
		barIncompleteChar: '\u2591'
	},
	grey: {
		format: ' \u001b[90m{bar}\u001b[0m {percentage}% | ETA: {eta}s | {value}/{total}',
		barCompleteChar: '\u2588',
		barIncompleteChar: '\u2591'
	},
	rect: {
		format: ' {bar}\u25A0 {percentage}% | ETA: {eta}s | {value}/{total}',
		barCompleteChar: '\u25A0',
		barIncompleteChar: ' '
	}
};