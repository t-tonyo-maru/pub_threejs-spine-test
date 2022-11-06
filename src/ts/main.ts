import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as spine from "@esotericsoftware/spine-threejs";

/**
 * three.js x spine サンプルコード
 * 参考: https://github.com/EsotericSoftware/spine-runtimes/blob/4.1/spine-ts/spine-threejs/example/index.html
 */
window.onload = () => {
  // シーン, カメラ, レンダラー,
  let scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    renderer: THREE.WebGLRenderer;

  let geometry: THREE.BoxGeometry,
    material: THREE.MeshBasicMaterial,
    mesh: THREE.Mesh,
    skeletonMesh: spine.SkeletonMesh;
  let assetManager: spine.AssetManager;
  let canvas: HTMLCanvasElement;
  let controls: OrbitControls;
  let lastFrameTime = Date.now() / 1000;

  let baseUrl = "/assets/spine-data/";
  let skeletonFile = "model.json";
  let atlasFile = "model.atlas";
  let animation = "animation";

  const init = () => {
    let width = window.innerWidth;
    let height = window.innerHeight;
    // camera
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 3000);
    camera.position.y = 100;
    camera.position.z = 400;
    // scene
    scene = new THREE.Scene();
    // renderer
    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(width, height);
    // bodyにcanvasを追加
    document.body.appendChild(renderer.domElement);
    // canvas
    canvas = renderer.domElement;
    // OrbitControls
    controls = new OrbitControls(camera, renderer.domElement);

    // spine-threejsからAssetsmanagerを生成
    assetManager = new spine.AssetManager(baseUrl);
    assetManager.loadText(skeletonFile);
    assetManager.loadTextureAtlas(atlasFile);

    // アニメーション開始
    requestAnimationFrame(load);
  };

  const load = () => {
    if (assetManager.isLoadingComplete()) {
      // ジオメトリ
      geometry = new THREE.BoxGeometry(200, 200, 200);
      // マテリアル
      material = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true,
      });
      // メッシュ
      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      // load spine atlas
      const atlas: spine.TextureAtlas = assetManager.require(atlasFile);
      const atlasLoader: spine.AtlasAttachmentLoader =
        new spine.AtlasAttachmentLoader(atlas);

      // skeleton json
      const skeletonJson = new spine.SkeletonJson(atlasLoader);
      skeletonJson.scale = 1;

      // skeleton data
      const skeletonData = skeletonJson.readSkeletonData(
        assetManager.require(skeletonFile)
      );

      skeletonMesh = new spine.SkeletonMesh(skeletonData, (parameters) => {
        parameters.depthTest = true;
        parameters.depthWrite = true;
        parameters.alphaTest = 0.001;
      });
      skeletonMesh.state.setAnimation(0, animation, true);

      mesh.add(skeletonMesh);

      requestAnimationFrame(render);
    } else {
      requestAnimationFrame(load);
    }

    // let lastTime = Date.now()
  };

  const render = () => {
    const now = Date.now() / 1000;
    const delta = now - lastFrameTime;
    lastFrameTime = now;

    resize();
    controls.update();
    skeletonMesh.update(delta);
    renderer.render(scene, camera);

    requestAnimationFrame(render);
  };

  const resize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (canvas.width != w || canvas.height != h) {
      canvas.width = w;
      canvas.height = h;
    }

    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    renderer.setSize(w, h);
  };

  init();
};
