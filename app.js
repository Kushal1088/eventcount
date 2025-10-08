let countdownInterval = null;

function $(id) {
	return document.getElementById(id);
}

function setHidden(element, hidden) {
	if (!element) return;
	if (hidden) {
		element.setAttribute('hidden', '');
	} else {
		element.removeAttribute('hidden');
	}
}

function formatRemaining(ms) {
	if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
	const days = Math.floor(ms / (1000 * 60 * 60 * 24));
	const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
	const seconds = Math.floor((ms % (1000 * 60)) / 1000);
	return { days, hours, minutes, seconds };
}

function buildShareUrl(name, isoString) {
	const url = new URL(window.location.href);
	url.searchParams.set('name', name);
	url.searchParams.set('date', isoString);
	return url.toString();
}

function tryCopy(text) {
	if (navigator.clipboard && window.isSecureContext) {
		return navigator.clipboard.writeText(text);
	}
	// Fallback for non-secure contexts
	return new Promise(function(resolve, reject) {
		const textarea = document.createElement('textarea');
		textarea.value = text;
		textarea.setAttribute('readonly', '');
		textarea.style.position = 'absolute';
		textarea.style.left = '-9999px';
		document.body.appendChild(textarea);
		textarea.select();
		try {
			document.execCommand('copy');
			resolve();
		} catch (e) {
			reject(e);
		} finally {
			document.body.removeChild(textarea);
		}
	});
}

function validate(name, dateStr) {
	const errorEl = $('form-error');
	errorEl.textContent = '';
	if (!name || name.trim().length === 0) {
		errorEl.textContent = 'Please enter an event name.';
		return false;
	}
	if (name.length > 80) {
		errorEl.textContent = 'Event name should be 80 characters or less.';
		return false;
	}
	if (!dateStr) {
		errorEl.textContent = 'Please select a date and time.';
		return false;
	}
	const date = new Date(dateStr);
	if (Number.isNaN(date.getTime())) {
		errorEl.textContent = 'Invalid date and time.';
		return false;
	}
	if (date.getTime() - Date.now() <= 0) {
		errorEl.textContent = 'Please pick a future date and time.';
		return false;
	}
	return true;
}

function updateViewRunning(name, targetMs) {
	$('event-name-display').textContent = name;
	setHidden($('countdown-display'), false);
	document.querySelector('.form').style.display = 'none';
	$('reset-btn').setAttribute('aria-disabled', 'false');
	$('complete-text').setAttribute('hidden', '');

	if (countdownInterval) {
		clearInterval(countdownInterval);
	}
	countdownInterval = setInterval(function() {
		const remaining = targetMs - Date.now();
		const { days, hours, minutes, seconds } = formatRemaining(remaining);
		$('days').textContent = String(days);
		$('hours').textContent = String(hours);
		$('minutes').textContent = String(minutes);
		$('seconds').textContent = String(seconds);
		if (remaining <= 0) {
			clearInterval(countdownInterval);
			$('days').textContent = '0';
			$('hours').textContent = '0';
			$('minutes').textContent = '0';
			$('seconds').textContent = '0';
			$('complete-text').removeAttribute('hidden');
		}
	}, 1000);
}

function startCountdown() {
	const name = $('event-name').value;
	const dateStr = $('event-date').value;
	if (!validate(name, dateStr)) return;

	const target = new Date(dateStr);
	const targetIso = target.toISOString();

	// Persist state to URL and localStorage
	const shareUrl = buildShareUrl(name, targetIso);
	try {
		window.history.replaceState({}, '', shareUrl);
	} catch (e) {}
	try {
		localStorage.setItem('countdown:name', name);
		localStorage.setItem('countdown:date', targetIso);
	} catch (e) {}

	updateViewRunning(name, target.getTime());
}

function resetCountdown() {
	if (countdownInterval) clearInterval(countdownInterval);
	setHidden($('countdown-display'), true);
	document.querySelector('.form').style.display = '';
	$('reset-btn').setAttribute('aria-disabled', 'true');
	$('form-error').textContent = '';
}

function shareCountdown() {
	const name = $('event-name').value || $('event-name-display').textContent;
	const dateIso = new URL(window.location.href).searchParams.get('date') || (function(){
		const v = $('event-date').value;
		return v ? new Date(v).toISOString() : null;
	})();
	if (!name || !dateIso) {
		alert('Start a countdown first.');
		return;
	}
	const url = buildShareUrl(name, dateIso);
	if (navigator.share) {
		navigator.share({ title: 'Event Countdown', text: name, url }).catch(function(){});
	} else {
		tryCopy(url).then(function(){
			alert('Link copied!');
		}).catch(function(){
			alert(url);
		});
	}
}

function copyLink() {
	const name = $('event-name').value || $('event-name-display').textContent;
	const dateIso = new URL(window.location.href).searchParams.get('date') || (function(){
		const v = $('event-date').value;
		return v ? new Date(v).toISOString() : null;
	})();
	if (!name || !dateIso) {
		alert('Start a countdown first.');
		return;
	}
	const url = buildShareUrl(name, dateIso);
	tryCopy(url).then(function(){
		alert('Link copied!');
	}).catch(function(){
		alert(url);
	});
}

function restoreFromUrlOrStorage() {
	const params = new URLSearchParams(window.location.search);
	let name = params.get('name');
	let dateIso = params.get('date');
	if (!name || !dateIso) {
		try {
			name = name || localStorage.getItem('countdown:name');
			dateIso = dateIso || localStorage.getItem('countdown:date');
		} catch (e) {}
	}
	if (name) $('event-name').value = name;
	if (dateIso) {
		const localValue = (function(){
			try {
				// convert ISO back to local datetime-local value
				const d = new Date(dateIso);
				const pad = function(n){ return String(n).padStart(2,'0'); };
				const y = d.getFullYear();
				const m = pad(d.getMonth()+1);
				const day = pad(d.getDate());
				const h = pad(d.getHours());
				const min = pad(d.getMinutes());
				return y + '-' + m + '-' + day + 'T' + h + ':' + min;
			} catch (e) { return ''; }
		})();
		$('event-date').value = localValue;
		const target = new Date(dateIso).getTime();
		if (!Number.isNaN(target) && target > Date.now()) {
			updateViewRunning(name || '', target);
		}
	}
}

function init() {
	$('start-btn').addEventListener('click', startCountdown);
	$('reset-btn').addEventListener('click', resetCountdown);
	$('share-btn').addEventListener('click', shareCountdown);
	$('copy-btn').addEventListener('click', copyLink);
	// accessibility: submit on Enter in inputs
	['event-name', 'event-date'].forEach(function(id){
		$(id).addEventListener('keydown', function(e){
			if (e.key === 'Enter') {
				e.preventDefault();
				startCountdown();
			}
		});
	});
	restoreFromUrlOrStorage();
}

document.addEventListener('DOMContentLoaded', init);
