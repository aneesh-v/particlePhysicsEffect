const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particleArray = [];

// handle mouse
let mouse = {
	x: null,
	y: null,
	radius: 100,
};

let adjustX = 50;
let adjustY = 15;
//pulling out mouse coordinate and making it available globally
window.addEventListener('mousemove', function (event) {
	mouse.x = event.x;
	mouse.y = event.y;
});

// making a textcontext in window
ctx.fillStyle = 'white';
ctx.font = '60px Verdana';
ctx.fillText('A', 0, 50);

// if we want to see the area that we area selecting for data
// ctx.strokeStyle = 'white';
// ctx.strokeRect(0, 0, 100, 100);

// scan a particular area a get the pixel data of the text from that area
const textCoordinates = ctx.getImageData(0, 0, 100, 100);

class Particle {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.size = 4;
		// to save the initial position of particle
		this.baseX = this.x;
		this.baseY = this.y;
		// a radom number between 1 and 30
		// determine how heavy our particle are and how fast they move from our mouse point
		this.desity = Math.random() * 50 + 1;
	}
	// Draw circle
	draw() {
		ctx.fillStyle = 'orangered';
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
		ctx.closePath();
		ctx.fill();
	}
	// Update particle motion
	update() {
		let dx = mouse.x - this.x;
		let dy = mouse.y - this.y;
		let distBtwMousePoint = Math.sqrt(dx * dx + dy * dy);
		let forceDirectionX = dx / distBtwMousePoint;
		let forceDirectionY = dy / distBtwMousePoint;
		let maxDistance = mouse.radius;
		// force is a multipler to control the speed of particles
		// when the particle is closer to mouse point it moves with largers speed
		// whet it approches the maxDistance which is mouse radius its speed
		// reduce and comes to Zero. force is a value betweeen 0 and 1
		let force = (maxDistance - distBtwMousePoint) / maxDistance;
		// mix of above variables
		let directionX = forceDirectionX * force * this.desity;
		let directionY = forceDirectionY * force * this.desity;
		if (distBtwMousePoint < mouse.radius) {
			this.x -= directionX;
			this.y -= directionY;
		} else {
			if (this.x != this.baseX) {
				let dx = this.x - this.baseX;
				this.x -= dx / 10;
			}
			if (this.y != this.baseY) {
				let dy = this.y - this.baseY;
				this.y -= dy / 10;
			}
		}
	}
}

// a function to create particle and push to particleArray
const init = () => {
	particleArray = [];

	//Generate and Draw random particles in the canvas.
	// for (let i = 0; i < 1000; i++) {
	// 	let x = Math.random() * canvas.width;
	// 	let y = Math.random() * canvas.height;
	// 	particleArray.push(new Particle(x, y));
	// }
	// textCoordinates contains an Uint8ClampedArray with a range of 40000.
	// here the value 40000 came from the area we scanned mulitpy by 4.
	// 4 means red, green, blue and alpha. So each pixel is spred in to 4 values and
	//  stored in this array. Every 4th value from start contains the biginning of
	// a pixel.
	// To loop through each pixel value we need a nested for loop
	for (y = 0, y2 = textCoordinates.height; y < y2; y++) {
		for (x = 0, x2 = textCoordinates.width; x < x2; x++) {
			// below we check the alpha value of each pixel eg (red, blue, green, alpha)
			// since we need to jumb to the 4th element in the array each time we loop to check the aplha
			// we use a special formula for that. property 'data' contains Uint8ClampedArray.
			// 128 is the 50% of alpha range (0 to 255). pixels below 50% alpha are ignored in
			// if statement.
			if (textCoordinates.data[y * 4 * textCoordinates.width + x * 4 + 3] > 128) {
				let positionX = x + adjustX;
				let positionY = y + adjustY;
				particleArray.push(new Particle(positionX * 10, positionY * 10));
			}
		}
	}
};

init();

// Animation function which also act as recursive function using requestAnimationFrame
function Animate() {
	// Clear the canvase on each recursion
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	// loop through the array and draw circles based on the particle location.
	for (let i = 0; i < particleArray.length; i++) {
		particleArray[i].draw();
		particleArray[i].update();
	}
	connect();
	requestAnimationFrame(Animate);
}

Animate();

// function to connect lines between points
function connect() {
	let opacityVal = 1;
	for (let a = 0; a < particleArray.length; a++) {
		for (let b = a; b < particleArray.length; b++) {
			// it goes thorugh every particle in the array and check the
			// distance against each other. if the distance is less than
			// the condition it draw a line between those particles.
			let dx = particleArray[a].x - particleArray[b].x;
			let dy = particleArray[a].y - particleArray[b].y;
			let distance = Math.sqrt(dx * dx + dy * dy);
			opacityVal = 0.1;
			ctx.strokeStyle = 'rgba(255,255,255,' + opacityVal + ')';
			if (distance < 30) {
				ctx.lineWidth = 2;
				ctx.beginPath();
				ctx.moveTo(particleArray[a].x, particleArray[a].y);
				ctx.lineTo(particleArray[b].x, particleArray[b].y);
				ctx.closePath();
				ctx.stroke();
			}
		}
	}
}
