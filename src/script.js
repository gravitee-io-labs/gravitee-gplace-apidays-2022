const canvas = document.getElementById("gplace")
const ctx = canvas.getContext("2d")

const buttons = document.getElementsByClassName("color-button");

const panzoom = Panzoom(canvas, {
    overflow: "initial",
    cursor: "initial",
    minScale: 0.8,
    maxScale: 5
})

ctx.imageSmoothingEnabled = false

// URL of the API exposed by Gravitee.io API Management
const API_URL = 'http://localhost:8082/demo/gplace';

const evtSource = new EventSource(API_URL);

var scale = 1
var panning = false
var pointX = 0
var pointY = 0
var start = { x: 0, y: 0 }

// Taps into the SetupCanvas function on page load
document.addEventListener('DOMContentLoaded', SetupCanvas)

// Establishes the canvas
function SetupCanvas() {
    //ctx.imageSmoothingEnabled = false

    canvas.width = 200
    canvas.height = 200

    // Scale of the web page
    ctx.scale(1, 1)

    var buttons = document.getElementsByClassName("color-button");
    for (var i = 0; i < buttons.length; i++)
        buttons[i].style.backgroundColor = colors[i];
}

function showNotification(text) {
    var notification = document.getElementById("notification");
    notification.textContent = text;
    notification.className = "show";
    setTimeout(function () { notification.className = notification.className.replace("show", ""); }, 3000);
}

// PIXEL COLOR MANAGEMENT

const color_picker = document.getElementById("color-picker")
const colors = [
    "#E43D34",
    "#FF8071",
    "#F19E3E",
    "#F5D417",
    "#4CA12C",
    "#00916A",
    "#007D93",
    "#2362CB",
    "#263294",
    "#2B2261",
    "#ffffff",
    "#777777"
]
let prevButton = color_picker.querySelector('button-active');
let current_color = "#ffffff"

color_picker.addEventListener('click', (e) => {
    const isButton = e.target.nodeName === 'BUTTON';

    if (!isButton)
        return;

    e.target.classList.add('button-active'); // Add .active CSS Class

    current_color = window.getComputedStyle(e.target).backgroundColor;

    if (prevButton !== null && e.target != prevButton)
        prevButton.classList.remove('button-active');

    prevButton = e.target;
});

// Disables right-clicking bringing up a context menu
canvas.addEventListener("contextmenu", e => e.preventDefault())

canvas.parentElement.addEventListener('wheel', panzoom.zoomWithWheel)

// Place a pixel on left-click
canvas.addEventListener("dblclick", function (event) {

    event.preventDefault()

    // First gets the coordinates of the mouse click on the canvas. Rounds down to a whole number
    let board = canvas.getBoundingClientRect();

    // Get the canvas movement and scaling synced properly.
    let x = Math.floor((event.clientX - board.left) / (panzoom.getScale() * canvas.clientWidth / canvas.width))
    let y = Math.floor((event.clientY - board.top) / (panzoom.getScale() * canvas.clientWidth / canvas.width))

    // Sends newly painted pixel information to Gravitee
    console.log("Sending pixel")

    let apikey = document.getElementById('apikey').value;
    let headers = {};

    if (apikey !== "") {
        headers["X-Gravitee-Api-Key"] = apikey
    }

    fetch(API_URL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ type: "set_pixel", x_coord: x, y_coord: y, color: current_color })
    }).then(response => {
        console.log(response);

        let limit = response.headers.get('X-Rate-Limit-Limit');
        let remaining = response.headers.get('X-Rate-Limit-Remaining');
        let dateRaw = response.headers.get('X-Rate-Limit-Reset');

        let date = new Date(parseInt(dateRaw)).toLocaleString();

        console.log(date);

        document.getElementById('limit').textContent = limit;
        document.getElementById('remaining').textContent = remaining;
        document.getElementById('reset').textContent = date;

        switch (response.status) {
            case 429:
                showNotification("429 : Rate limit reached.")
                break;
            case 401:
                showNotification("401 : Unauthorized.")
                break;
            default:
        }
    }).catch(err => {
        console.log(err);
    });

})

evtSource.onopen = function (event) {
    showNotification("Connection established.");
}

evtSource.onmessage = function (event) {
    document.getElementById("loader").style.display = "none";
    const data = JSON.parse(event.data)
    if (data.type === "set_pixel") {
        console.log("Receiving pixel from server")
        ctx.fillStyle = data.color
        ctx.fillRect(data.x_coord, data.y_coord, 1, 1)
    }
}


