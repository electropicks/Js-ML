const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 200;
const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 300;

var paused = false;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road = new Road(carCanvas.width/2, carCanvas.width * 0.90);

const N = 400;
const cars = generateCars(N);
let bestCar = cars[0];
if(localStorage.getItem("bestBrain")) {
    for (let i = 0; i < cars.length; i++) {
        cars[i].brain = JSON.parse(
            localStorage.getItem("bestBrain"));
        if (i !== 0) {
            NeuralNetwork.mutate(cars[i].brain, 0.2)
        }
    }
}

const traffic = [
    new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2.1),
    new Car(road.getLaneCenter(0), -300, 30, 50, "DUMMY", 2.5),
    new Car(road.getLaneCenter(2), -300, 30, 50, "DUMMY", 2.4),
    new Car(road.getLaneCenter(0), -100, 30, 50, "DUMMY", 2.2),
    new Car(road.getLaneCenter(1), -500, 30, 50, "DUMMY", 2.7),
    new Car(road.getLaneCenter(0), -400, 30, 50, "DUMMY", 2.2),
    new Car(road.getLaneCenter(1), -700, 30, 50, "DUMMY", 2.7),
    new Car(road.getLaneCenter(2), -800, 30, 50, "DUMMY", 2.7),
    new Car(road.getLaneCenter(2), -1000, 30, 50, "DUMMY", 2.7),
    new Car(road.getLaneCenter(0), -1000, 30, 50, "DUMMY", 2.7),
    new Car(road.getLaneCenter(1), -1200, 30, 50, "DUMMY", 2.7),
    new Car(road.getLaneCenter(1), -1400, 30, 50, "DUMMY", 2.7)
];

animate();

function save() {
    localStorage.setItem("bestBrain",
    JSON.stringify(bestCar.brain));
}

function discard() {
    localStorage.removeItem("bestBrain");
}

function generateCars(N) {
    const cars = [];
    for (let i = 1; i <= N; i++) {
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI"));
    }
    return cars;
}

function animate(time) {
    document.onkeydown = event => {
        if (event.key == "Escape") {
            paused = !paused;
        } 
    };
    if (!paused) {
        for (let i = 0; i < traffic.length; i++) {
            traffic[i].update(road.borders, []);
        }

        for (let i = 0; i < cars.length; i++) {
            cars[i].update(road.borders, traffic);
        }
        bestCar = cars.find(
            c => c.y == Math.min(
                ...cars.map(c=>c.y)
                ));

        carCanvas.height = window.innerHeight;
        networkCanvas.height = window.innerHeight;
        carCtx.save();
        carCtx.translate(0, -bestCar.y + carCanvas.height * 0.75);

        road.draw(carCtx);
        for (let i = 0; i < traffic.length; i++) {
            traffic[i].draw(carCtx, "red");
        }
        carCtx.globalAlpha = 0.2;
        for (i = 0; i < cars.length; i ++) {
            cars[i].draw(carCtx, "blue");
        }
        carCtx.globalAlpha = 1;
        bestCar.draw(carCtx, "turquoise", true);

        carCtx.restore();

        networkCtx.lineDashOffset = -time/50;
        Visualizer.drawNetwork(networkCtx, bestCar.brain);
    } else {
        let ctx = carCtx;
        ctx.beginPath();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "black";
        ctx.font = (50) + "px Arial";
        ctx.fillText("Paused",  carCanvas.width/2, 150);
    }
    console.log(cars.filter(car => !car.damaged).length);
    requestAnimationFrame(animate);
}
