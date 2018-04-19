var EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
var MAX_RATING = 15;

var heartsAsNodeList = document.querySelectorAll(".rating > input[type=radio]");
var hearts = Array.prototype.slice.call(heartsAsNodeList);
var limitText = document.getElementById("heartsNum");
hearts.forEach(listenForRatingChange);

function limitRating() {
  resetLimits();

  var allowed = MAX_RATING - getRatingsSum();
  renderLimit(allowed);

  if (allowed < 5) {
    hearts
      .filter(function(heart) {
        return heart.value > allowed && !isInRatedCategory(heart);
      })
      .forEach(setDisabled);
  }
}

function resetLimits() {
  hearts.forEach(setEnabled);
}

function renderLimit(limit) {
  limitText.innerText = limit;
}

function listenForRatingChange(radio) {
  radio.addEventListener("click", limitRating);
}

function setDisabled(radio) {
  radio.setAttribute("disabled", "disabled");
}

function setEnabled(radio) {
  radio.removeAttribute("disabled");
}

function isInRatedCategory(item) {
  return getCheckedNames().indexOf(item.name) > -1;
}

function getCheckedNames() {
  return hearts.filter(isChecked).map(toNames);
}

function getRatingsSum() {
  return hearts
    .filter(isChecked)
    .map(toValues)
    .reduce(sum);
}

function isChecked(item) {
  return item.checked;
}

function toValues(item) {
  return Number(item.value);
}

function toNames(item) {
  return item.name;
}

function sum(total, current) {
  return total + current;
}

function getFormValues() {
  var gender = getRadioResponse(document.getElementsByName("gender"));
  var rating_restaurant = getRadioResponse(
    document.getElementsByName("restaurant")
  );
  var rating_transport = getRadioResponse(
    document.getElementsByName("transport")
  );
  var rating_environment = getRadioResponse(
    document.getElementsByName("environment")
  );
  var rating_sports = getRadioResponse(document.getElementsByName("sports"));
  var rating_entertainment = getRadioResponse(
    document.getElementsByName("entertainment")
  );
  var name = document.getElementById("nameField").value;
  var email = document.getElementById("emailField").value;
  var description = document.getElementById("feedbackField").value;
  var token = document.getElementById("tokenField").value;

  var location = marker
    ? {
        lat: marker.position.lat(),
        lng: marker.position.lng()
      }
    : null;

  var result = {
    name: name,
    email: email,
    location: location,
    gender: gender,
    description: description,
    rating_restaurant: rating_restaurant,
    rating_transport: rating_transport,
    rating_environment: rating_environment,
    rating_sports: rating_sports,
    rating_entertainment: rating_entertainment,
    token: token
  };

  var ratingsFilled =
    rating_restaurant &&
    rating_transport &&
    rating_environment &&
    rating_sports &&
    rating_entertainment;

  return ratingsFilled && name && EMAIL_REGEX.test(email) && location
    ? result
    : null;
}

function getRadioResponse(optionsList) {
  var answer = null;
  optionsList.forEach(function(option) {
    if (option.checked) {
      answer = option.value;
    }
  });
  return answer;
}
