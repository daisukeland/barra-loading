module.exports._FormatTime = function (t, options, roundToMultipleOf) {
	function round(input) {
		if (roundToMultipleOf) {
			return roundToMultipleOf * Math.round(input / roundToMultipleOf);
		} else {
			return input
		}
	}

	function autopadding(v) {
		return (options.autopaddingChar + v).slice(-2);
	}

	if (t > 3600) {
		return autopadding(Math.floor(t / 3600)) + 'h' + autopadding(round((t % 3600) / 60)) + 'm';
	} else if (t > 60) {
		return autopadding(Math.floor(t / 60)) + 'm' + autopadding(round((t % 60))) + 's';
	} else if (t > 10) {
		return autopadding(round(t)) + 's';
	} else {
		return autopadding(t) + 's';
	}
}
module.exports._FormatValue = function (v, options, type) {

	if (options.autopadding !== true) {
		return v;
	}


	function autopadding(value, length) {
		return (options.autopaddingChar + value).slice(-length);
	}

	switch (type) {
		case 'percentage':
			return autopadding(v, 3);

		default:
			return v;
	}
}

module.exports._FormatBar = function (progress, options) {

	const completeSize = Math.round(progress * options.barsize);
	const incompleteSize = options.barsize - completeSize;


	return options.barCompleteString.substr(0, completeSize) + options.barGlue + options.barIncompleteString.substr(0, incompleteSize);
}