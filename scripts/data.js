var data, long, lat, total_cases, realTime_cases;

var phi, theta;
var X, Y, Z;

var long_arr = [], lat_arr = [];

function load_data() {

    var xhttp = new XMLHttpRequest();

    xhttp.open("GET", "https://corona.lmao.ninja/v2/countries?sort=country");
    xhttp.send();

    xhttp.onload = function() {

        data = JSON.parse(this.responseText);

        total_cases = data.cases;
        realTime_cases = data.todayCases;

        var bar_group = new THREE.BufferGeometry();
        var bar_material = new THREE.MeshLambertMaterial({color: 0x000000, opacity: 0.6, emissive: 0xffffff});

        for (var i = 0; i < data.length - 1; i++) {

            phi = (data[i].countryInfo.lat * Math.PI / 180);
            theta = (data[i].countryInfo.long - 180) * Math.PI / 180;

            lat_arr.push(phi);
            long_arr.push(theta);

            x = -(600 + 2) * Math.cos(phi) * Math.cos(theta);
            y = (600 + 2) * Math.sin(phi);
            z = (600 + 2) * Math.cos(phi) * Math.sin(theta);

            var pos_x = x;
            var pos_y = y;
            var pos_z = z;

            var bar = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 1 + total_cases / 8, 1, 1, 1, bar_material));

            bar.position.x = pos_x;
            bar.position.y = pos_y;
            bar.position.z = pos_z;

            bar.lookAt(new THREE.Vector3(0, 0, 0));

            THREE.GeometryUtils.merge(bar_group, bar);
        }

        console.log(lat_arr);
        console.log(bar);
    }
}

load_data();