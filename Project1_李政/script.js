var visualizer;

function Visualizer() {
    this.number_bars = 45;
    this.scene;
    this.camera;
    this.renderer;
    this.controls;
    this.bars = new Array();

    //音频处理
    this.js_node;
    this.audio_context;
    this.source_buffer;
    this.analyser;
}

Visualizer.prototype.initialize = function () {
    this.scene = new THREE.Scene();
    var WIDTH = window.innerWidth,
        HEIGHT = window.innerHeight;

    //渲染
    this.renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    this.renderer.setSize(WIDTH, HEIGHT);
    document.body.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(40, WIDTH / HEIGHT, 0.1, 20000);
    this.camera.position.set(4.5, 37, 14.5);
    this.scene.add(this.camera);

    var that = this;
    window.addEventListener('resize', function () {

        var WIDTH = window.innerWidth,
            HEIGHT = window.innerHeight;

        that.renderer.setSize(WIDTH, HEIGHT);

        that.camera.aspect = WIDTH / HEIGHT;
        that.camera.updateProjectionMatrix();

    });

    this.renderer.setClearColor(0xffffff, 1);

    var light = new THREE.PointLight(0xffffff);
    light.position.set(-100, 200, 100);
    this.scene.add(light);

    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
};

//设置立方体用于音频可视化
Visualizer.prototype.createBars = function () {
    for (var i = 0; i < this.number_bars; i++) {
        var barGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        //设置specular属性使得光照下的材质更有金属感
        var material = new THREE.MeshPhongMaterial({
            color: '#FF0000',
            ambient: 0x808080,
            specular: 0xffffff
        });
        this.bars[i] = new THREE.Mesh(barGeometry, material);
        this.bars[i].position.set(i - this.number_bars / 2, 0, 0);
        this.scene.add(this.bars[i]);
    }
};

//设置源缓冲播放音频
Visualizer.prototype.setupAudioProcessing = function () {
    this.audio_context = new AudioContext();
    this.js_node = this.audio_context.createScriptProcessor(2048, 1, 1);
    this.js_node.connect(this.audio_context.destination);

    //源缓冲
    this.source_buffer = this.audio_context.createBufferSource();

    //解析器
    this.analyser = this.audio_context.createAnalyser();
    this.analyser.smoothingTimeConstant = 0.3;
    this.analyser.fftSize = 512;
    this.source_buffer.connect(this.analyser);
    this.analyser.connect(this.js_node);
    this.source_buffer.connect(this.audio_context.destination);
    var that = this;

    //核心：动画的设置
    this.js_node.onaudioprocess = function () {
        //从解析器中获取数据
        var array = new Uint8Array(that.analyser.frequencyBinCount);
        that.analyser.getByteFrequencyData(array);
        //渲染
        visualizer.renderer.render(visualizer.scene, visualizer.camera);
        visualizer.controls.update();

        var step = Math.round(array.length / visualizer.number_bars);
        //控制立方体的大小，由近及远
        for (var i = 0; i < visualizer.number_bars; i++) {
            var value = array[i * step] / 4;
            value = value < 1 ? 1 : value;
            visualizer.bars[i].scale.z = value;
        }
    }

};

Visualizer.prototype.getAudio = function () {
    var request = new XMLHttpRequest();
    request.open("GET", "Asset/Aathi-StarMusiQ.Com.mp3", true);
    request.responseType = "arraybuffer";
    request.send();
    var that = this;
    request.onload = function () {
        //that.start(request.response);
    }
};

Visualizer.prototype.start = function (buffer) {
    this.audio_context.decodeAudioData(buffer, decodeAudioDataSuccess, decodeAudioDataFailed);
    var that = this;

    function decodeAudioDataSuccess(decodedBuffer) {
        that.source_buffer.buffer = decodedBuffer
        that.source_buffer.start(0);
    }

    function decodeAudioDataFailed() {
        debugger
    }
};

//识别拖拽行为，将mp3文件读入
Visualizer.prototype.handleDrop = function () {
    document.body.addEventListener("dragenter", function () {

    }, false);
    document.body.addEventListener("dragover", function (e) {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }, false);
    document.body.addEventListener("dragleave", function () {

    }, false);
    document.body.addEventListener("drop", function (e) {
        e.stopPropagation();

        e.preventDefault();
        var file = e.dataTransfer.files[0];
        var fileName = file.name;

        $("#guide").text("Playing " + fileName);

        var fileReader = new FileReader();

        fileReader.onload = function (e) {
            var fileResult = e.target.result;
            visualizer.start(fileResult);
        };

        fileReader.onerror = function (e) {
            debugger
        };

        fileReader.readAsArrayBuffer(file);
    }, false);
}

$(document).ready(function () {
    visualizer = new Visualizer();
    visualizer.initialize();
    visualizer.createBars();
    visualizer.setupAudioProcessing();
    visualizer.getAudio();
    visualizer.handleDrop();
});