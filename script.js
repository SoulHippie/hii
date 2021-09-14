var debug = false;
var positionCurrent = {
	lat: null,
	lng: null,
	hng: null
};
var positionPrevious = {
	lat: null,
	lng: null,
	hng: null
};
// elements that ouput our position
var positionLat = document.getElementById("position-lat");
var positionLng = document.getElementById("position-lng");
var positionHng = document.getElementById("position-hng");
var velocityView = document.getElementById("velocity-view");
// debug outputs
var debugOrientationDefault = document.getElementById("debug-orientation-default");
// info popup 
var popup = document.getElementById("popup");
var popupContents = document.getElementById("popup-contents");
var popupInners = document.querySelectorAll(".popup__inner");
var btnsPopup = document.querySelectorAll(".btn-popup");
// buttons at the bottom of the screen
var btnMap = document.getElementById("btn-map");
var warningHeadingShown = false;
var defaultOrientation;

function showHeadingWarning() {
	if (!warningHeadingShown) {
		popupOpen("noorientation");
		warningHeadingShown = true;
	}
}

function locationUpdate(position) {
	if (debug) console.log("Location updated");
	positionCurrent.lat = position.coords.latitude;
	positionCurrent.lng = position.coords.longitude;
	if (positionPrevious.lat != null && positionPrevious.lng != null) {
		//Time difference in seconds
		var timeDiff = (position.timestamp - positionPrevious.timestamp) / 1000;
		var velocity = distance(positionPrevious.lat, positionPrevious.lng, positionCurrent.lat, positionCurrent.lng) / timeDiff;
		//Round off to at most 2 decimal places
		velocity = Math.round(velocity * 100) / 100;
		velocityView.textContent = velocity + " m/s";
	}
	positionPrevious.lat = positionCurrent.lat;
	positionPrevious.lng = positionCurrent.lng;
	positionPrevious.timestamp = position.timestamp;

	positionLat.textContent = decimalToSexagesimal(positionCurrent.lat, "lat");
	positionLng.textContent = decimalToSexagesimal(positionCurrent.lng, "lng");
}

function locationUpdateFail(error) {
	positionLat.textContent = "n/a";
	positionLng.textContent = "n/a";
	console.log("location fail: ", error);
}

function openMap() {
	window.open(`https://www.google.com/maps/place/@${positionCurrent.lat},${positionCurrent.lng},16z`, "_blank");
}

function popupOpenFromClick(event) {
	popupOpen(event.currentTarget.dataset.name);
}
function popupOpen(name) {
	var i;
	for (i = 0; i < popupInners.length; i++) {
		popupInners[i].classList.add("popup__inner--hide");
	}
	document.getElementById("popup-inner-" + name).classList.remove("popup__inner--hide");

	popup.classList.add("popup--show");
}
function popupClose() {
	popup.classList.remove("popup--show");
}
function popupContentsClick(event) {
	event.stopPropagation();
}
function decimalToSexagesimal(decimal, type) {
	var degrees = decimal | 0;
	var fraction = Math.abs(decimal - degrees);
	var minutes = (fraction * 60) | 0;
	var seconds = (fraction * 3600 - minutes * 60) | 0;
	var direction = "";
	var positive = degrees > 0;
	degrees = Math.abs(degrees);
	switch (type) {
		case "lat":
			direction = positive ? "N" : "S";
			break;
		case "lng":
			direction = positive ? "E" : "W";
			break;
	}
	return degrees + "° " + minutes + "' " + seconds + "\" " + direction;
}
if (screen.width > screen.height) {
	defaultOrientation = "landscape";
} else {
	defaultOrientation = "portrait";
}
if (debug) {
	debugOrientationDefault.textContent = defaultOrientation;
}

const EARTH_RADIUS = 6371000; //Radius of the Earth in metres
//Calculate distance between two coordinates using the Haversine Formula in metres
function distance(lat1, lng1, lat2, lng2) {
	//Convert degrees to radians
	lat1 *= Math.PI / 180;
	lng1 *= Math.PI / 180;
	lat2 *= Math.PI / 180;
	lng2 *= Math.PI / 180;
	var a = Math.pow(Math.sin((lat2 - lat1) / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lng2 - lng1) / 2), 2);
	var d = EARTH_RADIUS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return d;
}

btnMap.addEventListener("click", openMap);
var i;
for (i = 0; i < btnsPopup.length; i++) {
	btnsPopup[i].addEventListener("click", popupOpenFromClick);
}
popup.addEventListener("click", popupClose);
popupContents.addEventListener("click", popupContentsClick);
navigator.geolocation.watchPosition(locationUpdate, locationUpdateFail, {
	enableHighAccuracy: true,
	maximumAge: 0,
	timeout: 10000
});

const major_mark = document.getElementById("major-mark-template"),
	minor_mark = document.getElementById("minor-mark-template"),
	angle_text = document.getElementById("angle-text-template"),
	direction_text = document.getElementById("direction-text-template");
const major_group = document.getElementById("major-marks-group"),
	minor_group = document.getElementById("minor-marks-group"),
	angle_group = document.getElementById("angle-texts-group"),
	direction_group = document.getElementById("direction-texts-group");
const direction_labels = [
	['txt-n', 'txt-ne', 'txt-e', 'txt-se', 'txt-s', 'txt-sw', 'txt-w', 'txt-nw'],
	["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
];

function createMarks() {
	for (let angle = 0; angle < 360; angle += 3) {
		var mark;
		if (angle % 15 == 0) {
			mark = major_mark.cloneNode();
			major_group.appendChild(mark);
			var text = angle_text.cloneNode();
			text.setAttribute("data-degree", angle);
			text.appendChild(document.createTextNode(angle));
			text.style.transform = `rotate(${angle}deg)`;
			angle_group.appendChild(text);
		} else {
			mark = minor_mark.cloneNode();
			minor_group.appendChild(mark);
		}
		mark.removeAttribute("id");
		mark.setAttribute("data-degree", angle);
		mark.style.transform = `rotate(${angle}deg)`;
	}
}
function createDirections() {
	for (let angle = 0; angle < 360; angle += 45) {
		var text = direction_text.cloneNode();
		var arr_index = angle / 45;
		text.id = direction_labels[0][arr_index];
		text.appendChild(document.createTextNode(direction_labels[1][arr_index]));
		text.setAttribute("data-degree", angle);
		text.style.transform = `rotate(${angle}deg)`;
		direction_group.appendChild(text);
	}
}
createMarks();
createDirections();

function rotateDial(angle) {
	dial.style.transform = `rotate(${angle}deg)`;
}

function checkSupport(e) {
	if (e.alpha != null && e.alpha != undefined) {
		window.addEventListener("deviceorientationabsolute", measure);
		window.removeEventListener("deviceorientationabsolute", checkSupport);
	} else showHeadingWarning();
}
function measure(e) {
	var angle = e.alpha ?? 0;
	rotateDial(angle);
 positionHng.innerHTML = (Math.round((360 - angle) * 10) / 10) + "&deg;";
}
window.addEventListener("deviceorientationabsolute", checkSupport);
