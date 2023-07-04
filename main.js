const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 220;
const networkCanvas=document.getElementById("networkCanvas");
networkCanvas.width=300;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road = new Road(carCanvas.width/2, carCanvas.width*0.9)

const N = 100;
const cars = generateCars(N);
let bestCar = cars[0];

if (localStorage.getItem("bestBrain")){
    for (let i = 0; i < cars.length; i++) {
        cars[i].brain = JSON.parse(
            localStorage.getItem("bestBrain")
        );

        if (i != 0){
            NeuralNetwork.mutate(cars[i].brain, 0.15);
        }
    }
}

const M = 10;
let traffic = generateTrafic(M);

animate();

function save(){
    localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

function discard(){
    localStorage.removeItem("bestBrain");
}

function generateTrafic(N){
    const traf = [];
    for (let i = 0; i < N; i++) {
        const laneCenter = road.getLaneCenter(Math.floor(Math.random() * 3));
        const yPosition = -100 - i * 200; // Adjust the y position based on the car's index
  
        const car = new Car(laneCenter, yPosition, 30, 50, "DUMMY");
        traf.push(car);
    }

    return traf;
}

function generateCars(N){
    const cars = [];
    for (let i = 0; i < N; i++) {
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI"));
    }

    return cars;
}


function animate(time){
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders, []);
    }

    for(let i = 0; i < N; i++){
        cars[i].update(road.borders, traffic);
    }

    bestCar = cars.find(
        c=>c.y==Math.min(...cars.map(c=>c.y))
        );

    carCanvas.height = window.innerHeight; 
    networkCanvas.height=window.innerHeight;

    carCtx.save();
    carCtx.translate(0, -bestCar.y + carCanvas.height*0.7);

    road.draw(carCtx);
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].draw(carCtx, "black");
    }

    carCtx.globalAlpha = 0.2;
    for (let i = 0; i < N; i++) {
        cars[i].draw(carCtx, "blue"); 
    }
    carCtx.globalAlpha = 1;
    bestCar.draw(carCtx, "blue", true);
    
    carCtx.restore();

    networkCtx.lineDashOffset=-time/50;
    Visualizer.drawNetwork(networkCtx, bestCar.brain);
    requestAnimationFrame(animate);
}