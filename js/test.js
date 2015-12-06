/**
 * Created by sws1991 on 2015/10/13.
 */

var cameraLeft, cameraRight, scene, renderer;
var boxes = [];
var separation = 10, width, height;
var container;
var controlLeft, controlRight;

init();
animate();


function init() {


    container = document.getElementById("canvas");

    if ( Detector.webgl )
        renderer = new THREE.WebGLRenderer( {antialias:true} );
    else
        renderer = new THREE.CanvasRenderer();

    width = Math.round(container.clientWidth/2);
    height = container.clientHeight;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize( container.clientWidth, container.clientHeight );
    renderer.setClearColor(0x808080);
    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.backgroundColor = 0x0000ff;

    cameraLeft = new THREE.PerspectiveCamera( 10, (container.clientWidth/2) / container.clientHeight, 1, 1000 );
    cameraLeft.position.set( separation, 0, 300 );
    scene.add(cameraLeft);

    cameraRight = new THREE.PerspectiveCamera( 10, (container.clientWidth/2) / container.clientHeight, 1, 1000 );
    cameraRight.position.set( -separation, 0, 300 );
    scene.add(cameraRight);

    controlLeft = new THREE.OrbitControls( cameraLeft );
    controlRight = new THREE.OrbitControls( cameraRight );

    var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
    directionalLight.position.set( 0, 1, 0.5 );
    scene.add( directionalLight );

    var light = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add( light );

    var materialColor = new THREE.Color();
    materialColor.setRGB(1.0, 0.8, 0.6);
    var phongMaterial = createShaderMaterial("phongDiffuse", directionalLight);

    phongMaterial.uniforms.uMaterialColor.value.copy(materialColor);
    phongMaterial.side = THREE.DoubleSide;

    var geo = new THREE.BoxGeometry( 2, 2, 2 );
    for(var i=0; i<5; i++){
        var mesh = new THREE.Mesh( geo, phongMaterial );

        mesh.position.x = Math.random() * 50 - 25;
        mesh.position.y = Math.random() * 50 - 25;
        mesh.position.z = Math.random() * 50 - 25;

        mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 3 + 1;

        scene.add( mesh );

        boxes.push( mesh );

        var edge = new THREE.EdgesHelper(mesh, 0x000000, 20);
        scene.add(edge);
    }
    //var materials = [
    //
    //    new THREE.MeshBasicMaterial( { map: loadTexture( 'img/skybox/px.jpg' ), overdraw: 0.5 } ), // right
    //    new THREE.MeshBasicMaterial( { map: loadTexture( 'img/skybox/nx.jpg' ), overdraw: 0.5 } ), // left
    //    new THREE.MeshBasicMaterial( { map: loadTexture( 'img/skybox/py.jpg' ), overdraw: 0.5 } ), // top
    //    new THREE.MeshBasicMaterial( { map: loadTexture( 'img/skybox/ny.jpg' ), overdraw: 0.5 } ), // bottom
    //    new THREE.MeshBasicMaterial( { map: loadTexture( 'img/skybox/pz.jpg' ), overdraw: 0.5 } ), // back
    //    new THREE.MeshBasicMaterial( { map: loadTexture( 'img/skybox/nz.jpg' ), overdraw: 0.5 } )  // front
    //
    //];
    //
    //skyMesh = new THREE.Mesh( new THREE.BoxGeometry( 100, 100, 100 ), new THREE.MeshFaceMaterial( materials ) );
    //skyMesh.scale.x = - 1;
    //scene.add( skyMesh );
    //mesh = new THREE.Mesh(
    //new THREE.BoxGeometry( 10, 10, 10 ), phongMaterial);
    //scene.add(mesh);

    function setOrientationControls(e){
    controlLeft = new THREE.DeviceOrientationControls(cameraLeft);
    controlRight = new THREE.DeviceOrientationControls(cameraRight);
        controlLeft.connect();
        controlRight.connect();
        window.removeEventListener('deviceorientation', setOrientationControls);
    }

    window.addEventListener('deviceorientation', setOrientationControls, true);
    render();
    window.addEventListener( 'resize', onWindowResize, false );

}

function render() {
    var timer = 0.0001 * Date.now();
    for ( var i = 0, il = boxes.length; i < il; i ++ ) {

        var box = boxes[ i ];

        box.position.x = 50 * Math.cos( timer + i );
        box.position.y = 50 * Math.sin( timer + i * 1.1 );

    }

    cameraLeft.updateProjectionMatrix();
    renderer.setViewport(0, 0, width, height);
    renderer.setScissor(0, 0, width, height);
    renderer.enableScissorTest(true);
    renderer.render(scene, cameraLeft);

    cameraRight.updateProjectionMatrix();
    renderer.setViewport( width, 0, width, height);
    renderer.setScissor( width, 0, width, height);
    renderer.render( scene, cameraRight );
}

function loadShader(shadertype) {
    return document.getElementById(shadertype).textContent;
}

function onWindowResize() {
    renderer.setSize(container.clientWidth, container.clientHeight);
}

//function loadTexture( path ) {
//
//    var texture = new THREE.Texture( container );
//
//    var image = new Image();
//    image.crossOrigin = 'anonymous';
//    image.onload = function () {
//
//        texture.image = this;
//        texture.needsUpdate = true;
//        uploadtexture = true;
//    };
//    image.src = path;
//    texture.magFilter = THREE.NearestFilter;
//    texture.minFilter = THREE.NearestFilter;
//
//    return texture;
//
//}

function createShaderMaterial(id, light) {
    var shaderTypes = {
        'phongDiffuse' : {

            uniforms: {

                "uDirLightPos":	{ type: "v3", value: new THREE.Vector3() },
                "uDirLightColor": { type: "c", value: new THREE.Color( 0xFFFFFF ) },

                "uMaterialColor": { type: "c", value: new THREE.Color( 0xFFFFFF ) },

                uKd: {
                    type: "f",
                    value: 0.7
                },
                uBorder: {
                    type: "f",
                    value: 0.4
                }
            }
        }
    };

    var shader = shaderTypes[id];

    var u = THREE.UniformsUtils.clone(shader.uniforms);
    // this line will load a shader that has an id of "vertex" from the .html file
    var vs = loadShader("vertex");
    // this line will load a shader that has an id of "fragment" from the .html file
    var fs = loadShader("fragment");

    //var creatureImage = THREE.ImageUtils
    //    .loadTexture('http://www.how-to-draw-funny-cartoons.com/image-files/cartoon-bear-7.gif');
    //creatureImage.magFilter = THREE.NearestFilter;
    //creatureImage.minFilter = THREE.NearestFilter;

    //var img = new Image();
    //img.crossOrigin = 'anonymous';
    //img.url = 'http://www.how-to-draw-funny-cartoons.com/image-files/cartoon-bear-7.gif';
    //var texture = new THREE.Texture(img);
    //texture.needsUpdate = true;
    ////img.onLoad.listen((e)
    ////{
    ////    gl.bindTexture(webGL.TEXTURE_2D, texture);
    ////});
    //texture.generateMipmaps = false;
    //texture.magFilter = THREE.NearestFilter;
    //texture.minFilter = THREE.NearestFilter;

    var material = new THREE.ShaderMaterial({
        uniforms: u,
        vertexShader: vs,
        fragmentShader: fs
    });

    material.uniforms.uDirLightPos.value = light.position;
    material.uniforms.uDirLightColor.value = light.color;

    return material;

}

function animate() {
    requestAnimationFrame( animate );
    render();
    //controlLeft.update();
    //controlRight.update();
}
