$ns.load = function () {
    var curDate = new Date ();
	var dateArea = document.getElementById ('$const.date');
    dateArea.value = curDate.getDate () + '.' + (curDate.getMonth () + 1) + '.' + curDate.getFullYear () + ' ' +
        curDate.getHours () + ':' + curDate.getMinutes () + ':' + curDate.getSeconds ()
    ;

    $e.update ();
};

$ns.update = function () {
	var textAreas = document.body.getElementsByTagName ('textarea');
	var selects = document.body.getElementsByTagName ('select');
	var classes, ids, value, date;
	var i, j, key;

	//$processor.test ();

	// fill input
	if (textAreas) {
		for (i = 0; i < textAreas.length; i ++) {
			ids = textAreas [i].getAttribute ('id');
			try {
				eval ('' + ids + ' = "' + textAreas [i].value + '"');
			} catch (exception) {
			}
		}
	}

	if ($const.date) {
		var tokens = $const.date.split (' ');

		tokens [0] = tokens [0].split ('.');
		tokens [1] = tokens [1].split (':');

		date = {
			day: parseFloat (tokens [0][0]),
			month: parseFloat (tokens [0][1]),
			year: parseFloat (tokens [0][2]),
			hours: parseFloat (tokens [1][0]),
			minutes: parseFloat (tokens [1][1]),
			seconds: parseFloat (tokens [1][2])
		};
		$const.date = date;
	}

	$processor.init ();

	// fill input bodies
	if (selects) {
		for (i = 0; i < selects.length; i ++) {
			classes = selects [i].getAttribute ('class');
			ids = selects [i].getAttribute ('id');
			if (classes) {
				try {
					var selector = eval ('(' + classes + ')');
					if (!selects [i].innerHTML) {
						var selections = [];
						for (key in selector) {
							if (selector.hasOwnProperty (key) && selector [key].key == key && key != 'earth') {
								selections.push ('<option label=' + key + '>' + key + '</option>');
							}
						}
						selects [i].innerHTML = selections;
					}
					eval (ids + ' = ' + classes + '.' + selects [i].value);
				} catch (exception) {
				}
			}
		}
	}

	$processor.calc (date, $const.body);

	// fill output
	if (textAreas) {
		for (i = 0; i < textAreas.length; i ++) {
			classes = (textAreas [i].getAttribute ('class') || '').split (' ');
			for (j = 0; j < classes.length; j ++) {
				try {
					value = eval ('(' + classes [j] + ')');
					if (value || value === 0) {
						textAreas [i].value = value.join ? value.join ('\n') : value;
						break;
					}
				} catch (exception) {
				}
			}
		}
	}
};
