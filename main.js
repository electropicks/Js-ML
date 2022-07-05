const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 200;
const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 300;

var paused = false;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road = new Road(carCanvas.width/2, carCanvas.width * 0.90);

const N = 100;
const cars = generateCars(N);

const traffic = [
    new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2.1)
];

animate();

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
        
        let carDistances =[];

        for (let i = 0; i < cars.length; i++) {
            cars[i].update(road.borders, traffic);
            carDistances.push(cars[i].y);
        }
        let bestCar = cars.find(car => car.y == Math.min(...carDistances));

        carCanvas.height = window.innerHeight;
        networkCanvas.height = window.innerHeight;
        carCtx.save();
        carCtx.translate(0, -bestCar.y + carCanvas.height * 0.75);

        road.draw(carCtx);
        for (let i = 0; i < traffic.length; i++) {
            traffic[i].draw(carCtx, "red");
        }
        for (i = 0; i < cars.length; i ++) {
            if (cars[i] != bestCar) cars[i].draw(carCtx, "lightblue");
        }
        bestCar.draw(carCtx, "blue");

        carCtx.restore();

        networkCtx.lineDashOffset = -time/50;
        Visualizer.drawNetwork(networkCtx, bestCar.brain);
    } else {
        ctx = carCtx;
        ctx.beginPath();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "black";
        ctx.font = (50) + "px Arial";
        ctx.fillText("Paused",  carCanvas.width/2, 150);
    }
    requestAnimationFrame(animate);
}