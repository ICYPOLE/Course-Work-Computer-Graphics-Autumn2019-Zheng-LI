//Three.js中的场景、渲染、相机等参数
var scene, camera, controls, sphere, moon, textureCube, loader, stars, light, light1, cubeCamera, renderer;

function init() {
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, .0007);

  var width = window.innerWidth;
  var height = window.innerHeight;

  //渲染器设置，抗锯齿与高精度
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    precision: 'highp'
  });

  renderer.setSize(width, height);
  renderer.setClearColor(0x000011, 1);
  renderer.domElement.id = "context";
  document.body.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(45, width / height, .1, 10000);
  scene.add(camera);
  camera.position.set(0, 90, -290);
  camera.position.set(83, 386, 231);
  camera.lookAt(scene.position);

  cubeCamera = new THREE.CubeCamera(1, 100000, 1024);
  scene.add(cubeCamera);

  //点光源，设置颜色为白色
  var ambientLight = new THREE.AmbientLight(0xffffff);
  scene.add(ambientLight);

  light1 = new THREE.PointLight(0xFFFBE3, 1.5);
  light1.position.set(100, 0, -60);
  scene.add(light1);

  light2 = new THREE.PointLight(0xFFFBE3, 1);
  light2.position.set(-50, 200, 50);
  scene.add(light2);

  //导入相机控件，参与互动
  controls = new THREE.OrbitControls(camera);
}

function draw() {
  var geo = new THREE.SphereGeometry(55, 30, 20);
  //Three.js提供的光亮表面材质
  var mat = new THREE.MeshPhongMaterial({
    emissive: '#222',
    shininess: 50,
    reflectivity: 3.5,
    shading: THREE.FlatShading,
    specular: 'white',
    color: 'gray',
    side: THREE.DoubleSide,
    envMap: cubeCamera.renderTarget.texture,
    combine: THREE.AddOperation
  });
  sphere = new THREE.Mesh(geo, mat);

  //月亮模型
  var moonMat;
  var moonGeo = new THREE.SphereGeometry(100, 200, 200);
  loader = new THREE.TextureLoader();
  loader.crossOrigin = '';
  loader.load('./moon.jpg', function (moonTexture) {// NASA的高清月球表面材质图
    // console.log(moonTexture);
    moon.material = new THREE.MeshLambertMaterial({
      map: moonTexture
    });
  });
  moon = new THREE.Mesh(moonGeo, moonMat);
  scene.add(moon);


  //绘制20000颗星星
  var starAmt = 20000;
  var starGeo = new THREE.SphereGeometry(1000, 100, 50);
  var starAmt = 10000;
  var starMat = {
    size: 1.0,
    opacity: 0.7
  };
  var starMesh = new THREE.PointsMaterial(starMat);

  for (var i = 0; i < starAmt; i++) {
    var starVertex = new THREE.Vector3();
    //生成随机位置
    starVertex.x = Math.random() * 1000 - 500;
    starVertex.y = Math.random() * 1000 - 500;
    starVertex.z = Math.random() * 1000 - 500;

    //挑选其中的40颗星星，加设点光源，用以点缀星空
    if (i % 500 == 0) {
      let light0 = new THREE.PointLight(0xFFFBE3, 0.1);
      light0.position.set(starVertex.x, starVertex.y, starVertex.z);
      scene.add(light0);
    }

    starGeo.vertices.push(starVertex);
  }
  stars = new THREE.Points(starGeo, starMesh);
  scene.add(stars);

}

function animate() {
  //动画
  requestAnimationFrame(animate);
  sphere.rotation.y += 0.005;

  //每一帧后更新
  sphere.visible = false;
  cubeCamera.position.copy(sphere.position);
  cubeCamera.updateCubeMap(renderer, scene);

  //渲染
  sphere.visible = true;
  renderer.render(scene, camera);
}

init();
draw();
animate();