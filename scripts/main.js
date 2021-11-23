var X_POS = 1800;
var Y_POS = 500;
var Z_POS = 1800;

var FOV = 45;
var NEAR = 1;
var FAR = 4000;

var scene, camera, renderer, earth, light;

var star_arr = [];
var star_geo = new THREE.BoxGeometry(5, 5, 5);
var star_material = new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: true, opacity: 1, transparent: false});;

var data, long, lat, total_cases, realTime_cases, bar, bar_arr = [];

var phi, theta;
var X, Y, Z, pos_x, pos_y, pos_z;
var tempV, raycaster, label, label_arr = [];

var xhttp_master, xhttp_country;

//GET DATA
function load_data() {

    var xhttp_master = new XMLHttpRequest();

    xhttp_master.open("GET", "https://corona.lmao.ninja/v2/countries?sort=country");

    xhttp_master.onload = function() {

        data = JSON.parse(this.responseText);

        for (var i = 0; i < data.length - 1; i++) {

            total_cases = data[i].cases;
            realTime_cases = data[i].todayCases;

            phi = (data[i].countryInfo.lat * Math.PI / 180);
            theta = (data[i].countryInfo.long - 180) * Math.PI / 180;

            x = -(600 + 2) * Math.cos(phi) * Math.cos(theta);
            y = (600 + 2) * Math.sin(phi);
            z = (600 + 2) * Math.cos(phi) * Math.sin(theta);
            
            pos_x = x;
            pos_y = y;
            pos_z = z;

            bar = new THREE.Mesh(new THREE.BoxGeometry(10, 10, total_cases / 30000, 5, 5, 5));
            bar.name = data[i].country;
            bar.material.color.setHex(0xff0000);
            bar.material.wireframe = true;

            bar.position.x = pos_x;
            bar.position.y = pos_y;
            bar.position.z = pos_z;

            bar.lookAt(new THREE.Vector3(0, 0, 0));
            bar_arr.push(bar);

            label = document.createElement("p");
            label.innerHTML = bar.name;
            label_arr.push(label);
            document.getElementById("world-label-container").appendChild(label);

            scene.add(bar);

            for (var i = 0; i < label_arr.length; i++) {

                label_arr[i].addEventListener("mousedown", getCountryData, false);
            }
        }
    }

    xhttp_master.send();
}

load_data();

function getCountryData(e) {

    var country_name = this.innerHTML;

    xhttp_country = new XMLHttpRequest();
    xhttp_country.open("GET", `https://corona.lmao.ninja/v2/countries/${country_name}?yesterday=true&strict=true&query`);

    xhttp_country.onload = function() {

        var country_data = JSON.parse(this.responseText);
        console.log(country_data);
    }

    xhttp_country.send();

    this.style.color = "#39FF14";
}

//WEBGL RENDERS
function init() {

    scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, NEAR, FAR);
    camera.position.set(X_POS, Y_POS, 10);
    camera.lookAt(new THREE.Vector3(0, 0 ,0));

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.shadowMap.emabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.getElementById("canvas-container").appendChild(renderer.domElement);

    window.addEventListener("resize", function() {

        var w = window.innerWidth;
        var h = window.innerHeight;

        renderer.setSize(w, h);

        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    });

    light = new THREE.AmbientLight(0x3333ee, 2, 500); //night time: 0x3333ee day time: 0xffffff
    scene.add(light);

    var controls = new THREE.OrbitControls(camera, renderer.domElement);

    function globe_creation() {

        var earth_geo = new THREE.SphereGeometry(600, 50, 50);
        var earth_texture = THREE.ImageUtils.loadTexture("./media/earth-texture.jpg");
        var earth_material = new THREE.MeshPhongMaterial({
            map: earth_texture,
            shininess: 10
        });

        earth = new THREE.Mesh(earth_geo, earth_material);
        scene.add(earth);
    }

    function stars() {

        for (var i = 0; i < 1000; i++) {

            star = new THREE.Mesh(star_geo, star_material);

            star.position.x = THREE.Math.randFloatSpread(5000);
            star.position.y = THREE.Math.randFloatSpread(5000);
            star.position.z = THREE.Math.randFloatSpread(5000);
    
            star_arr.push(star);
            scene.add(star);
        }
    }

    globe_creation();
    stars();
}

tempV = new THREE.Vector3();
raycaster = new THREE.Raycaster();

var render = function() {

    for (var i = 0; i < bar_arr.length; i++) {

        bar_arr[i].updateWorldMatrix(true, false);
        bar_arr[i].getWorldPosition(tempV);

        tempV.project(camera);
        raycaster.setFromCamera(tempV, camera);

        var intersected_obj = raycaster.intersectObjects(scene.children);
        var visibile = intersected_obj.length && bar_arr[i] === intersected_obj[0].object;

        var label_x = (tempV.x * .5 + .5) * document.getElementsByTagName("canvas")[0].clientWidth;
        var label_y = (tempV.y * -.5 + .5) * document.getElementsByTagName("canvas")[0].clientHeight;

        if (!visibile || Math.abs(tempV.z) > 1) {

            label_arr[i].style.display = "none";
        
        } else {

            label_arr[i].style.display = "";
        }
                
        label_arr[i].style.transform = `translate(-50%, -50%) translate(${label_x}px,${label_y}px)`;
    }

    renderer.render(scene, camera);
};

var animate = function() {

    requestAnimationFrame(animate);

    var timer = Date.now() * 0.0003;

    // camera.position.x = (Math.cos( timer ) *  1800);
    // camera.position.z = (Math.sin( timer ) *  1800);
    camera.lookAt(scene.position);

    light.position = camera.position;
    light.lookAt(scene.position);

    for (var i = 0; i < star_arr.length; i++) {

        star_arr[i].rotation.y += 0.02;
        star_arr[i].rotation.x += 0.02;
    }

    render();
}

init();
animate();