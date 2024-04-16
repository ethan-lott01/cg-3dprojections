import * as CG from "./transforms.js";
import { Matrix, Vector } from "./matrix.js";

const LEFT = 32; // binary 100000
const RIGHT = 16; // binary 010000
const BOTTOM = 8; // binary 001000
const TOP = 4; // binary 000100
const FAR = 2; // binary 000010
const NEAR = 1; // binary 000001
const FLOAT_EPSILON = 0.000001;

class Renderer {
  // canvas:              object ({id: __, width: __, height: __})
  // scene:               object (...see description on Canvas)
  constructor(canvas, scene) {
    this.canvas = document.getElementById(canvas.id);
    this.canvas.width = canvas.width;
    this.canvas.height = canvas.height;
    this.ctx = this.canvas.getContext("2d");
    this.scene = this.processScene(scene);
    this.enable_animation = true; // <-- disabled for easier debugging; enable for animation
    this.start_time = null;
    this.prev_time = null;
  }

  //
  updateTransforms(time, delta_time) {
    // TODO: update any transformations needed for animation
  }

  //
  rotateLeft() {
    console.log("Left");
    let n = this.scene.view.prp.subtract(this.scene.view.srp);
    n.normalize();
    let u = this.scene.view.vup.cross(n);
    u.normalize();
    let v = n.cross(u);
    let theta = Math.PI / 16;

    let rotateMatrix = new Matrix(3, 3);
    rotateMatrix.values = [
      [
        Math.cos(theta) + Math.pow(v.x, 2) * (1 - Math.cos(theta)),
        v.x * v.y * (1 - Math.cos(theta) - v.z * Math.sin(theta)),
        v.x * v.z * (1 - Math.cos(theta)) + v.y * Math.sin(theta)
      ],
      [
        v.y * v.x * (1 - Math.cos(theta)) + v.z * Math.sin(theta),
        Math.cos(theta) + Math.pow(v.y, 2) * (1 - Math.cos(theta)),
        v.y * v.z * (1 - Math.cos(theta)) - v.x * Math.sin(theta)
      ],
      [
        v.z * v.x * (1 - Math.cos(theta)) - v.y * Math.sin(theta),
        v.z * v.y * (1 - Math.cos(theta)) + v.x * Math.sin(theta),
        Math.cos(theta) + Math.pow(v.z, 2) * (1 - Math.cos(theta))
      ],
    ];

    this.scene.view.srp = this.scene.view.srp.subtract(this.scene.view.prp);
    this.scene.view.srp = Matrix.multiply([rotateMatrix, this.scene.view.srp]);
    this.scene.view.srp = this.scene.view.srp.add(this.scene.view.prp);
  }

  //
  rotateRight() {
    console.log("Right");
    let n = this.scene.view.prp.subtract(this.scene.view.srp);
    n.normalize();
    let u = this.scene.view.vup.cross(n);
    u.normalize();
    let v = n.cross(u);
    let theta = -(Math.PI / 16);

    let rotateMatrix = new Matrix(3, 3);
    rotateMatrix.values = [
      [
        Math.cos(theta) + Math.pow(v.x, 2) * (1 - Math.cos(theta)),
        v.x * v.y * (1 - Math.cos(theta) - v.z * Math.sin(theta)),
        v.x * v.z * (1 - Math.cos(theta)) + v.y * Math.sin(theta),
      ],
      [
        v.y * v.x * (1 - Math.cos(theta)) + v.z * Math.sin(theta),
        Math.cos(theta) + Math.pow(v.y, 2) * (1 - Math.cos(theta)),
        v.y * v.z * (1 - Math.cos(theta)) - v.x * Math.sin(theta),
      ],
      [
        v.z * v.x * (1 - Math.cos(theta)) - v.y * Math.sin(theta),
        v.z * v.y * (1 - Math.cos(theta)) + v.x * Math.sin(theta),
        Math.cos(theta) + Math.pow(v.z, 2) * (1 - Math.cos(theta)),
      ],
    ];

    this.scene.view.srp = this.scene.view.srp.subtract(this.scene.view.prp);
    this.scene.view.srp = Matrix.multiply([rotateMatrix, this.scene.view.srp]);
    this.scene.view.srp = this.scene.view.srp.add(this.scene.view.prp);
  }

  // A key down
  moveLeft() {
    console.log("A");
    let n = this.scene.view.prp.subtract(this.scene.view.srp);
    n.normalize();
    let u = this.scene.view.vup.cross(n);
    u.normalize();

    this.scene.view.prp = this.scene.view.prp.subtract(u);
    this.scene.view.srp = this.scene.view.srp.subtract(u);
  }

  // D key down
  moveRight() {
    console.log("D");
    let n = this.scene.view.prp.subtract(this.scene.view.srp);
    n.normalize();
    let u = this.scene.view.vup.cross(n);
    u.normalize();

    this.scene.view.prp = this.scene.view.prp.add(u);
    this.scene.view.srp = this.scene.view.srp.add(u);
  }

  // S key down
  moveBackward() {
    console.log("S");
    let n = this.scene.view.prp.subtract(this.scene.view.srp);
    n.normalize();

    this.scene.view.prp = this.scene.view.prp.add(n);
    this.scene.view.srp = this.scene.view.srp.add(n);
  }

  // W key down
  moveForward() {
    console.log("W");
    let n = this.scene.view.prp.subtract(this.scene.view.srp);
    n.normalize();

    this.scene.view.prp = this.scene.view.prp.subtract(n);
    this.scene.view.srp = this.scene.view.srp.subtract(n);
  }

  //
  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // TODO: implement drawing here!
    // For each model
    //   * For each vertex
    //     * transform endpoints to canonical view volume
    //   * For each line segment in each edge
    //     * clip in 3D
    //     * project to 2D
    //     * translate/scale to viewport (i.e. window)
    //     * draw line
    let Camera = CG.mat4x4Perspective(
      this.scene.view.prp,
      this.scene.view.srp,
      this.scene.view.vup,
      this.scene.view.clip
    );
    let mper = CG.mat4x4MPer();
    let viewport = CG.mat4x4Viewport(this.canvas.width, this.canvas.height);
    let i;
    for (i = 0; i < this.scene.models.length; i++) {
      let model = this.scene.models[i];
      let vertices = [];
      let j;
      for (j = 0; j < model.vertices.length; j++) {
        let vert = model.vertices[j];
        let CameraVert = Matrix.multiply([Camera, vert]);
        vertices.push(CameraVert);
      }
      //   * For each line segment in each edge
      //     * translate/scale to viewport (i.e. window)
      //     * draw line
      let e;
      for (e = 0; e < model.edges.length; e++) {
        let edges = model.edges[e];
        let ev;
        for (ev = 0; ev < edges.length - 1; ev++) {
          let vert_1 = vertices[edges[ev]];
          let vert_2 = vertices[edges[ev +1]];
          

          let viewport_1 = Matrix.multiply([viewport,  mper, vert_1]);
          let viewport_2 = Matrix.multiply([viewport, mper, vert_2]);
          
          //convert from Homogenous to cartesian
          this.drawLine(
            viewport_1.x / viewport_1.w,
            viewport_1.y / viewport_1.w,
            viewport_2.x / viewport_2.w,
            viewport_2.y / viewport_2.w
          );
        }
      }
    }
  }

  // Get outcode for a vertex
  // vertex:       Vector4 (transformed vertex in homogeneous coordinates)
  // z_min:        float (near clipping plane in canonical view volume)
  outcodePerspective(vertex, z_min) {
    let outcode = 0;
    if (vertex.x < vertex.z - FLOAT_EPSILON) {
      outcode += LEFT;
    } else if (vertex.x > -vertex.z + FLOAT_EPSILON) {
      outcode += RIGHT;
    }
    if (vertex.y < vertex.z - FLOAT_EPSILON) {
      outcode += BOTTOM;
    } else if (vertex.y > -vertex.z + FLOAT_EPSILON) {
      outcode += TOP;
    }
    if (vertex.z < -1.0 - FLOAT_EPSILON) {
      outcode += FAR;
    } else if (vertex.z > z_min + FLOAT_EPSILON) {
      outcode += NEAR;
    }
    return outcode;
  }

  // Clip line - should either return a new line (with two endpoints inside view volume)
  //             or null (if line is completely outside view volume)
  // line:         object {pt0: Vector4, pt1: Vector4}
  // z_min:        float (near clipping plane in canonical view volume)
  clipLinePerspective(line, z_min) {
    let result = null;
    let p0 = CG.Vector3(line.pt0.x, line.pt0.y, line.pt0.z);
    let p1 = CG.Vector3(line.pt1.x, line.pt1.y, line.pt1.z);
    let out0 = this.outcodePerspective(p0, z_min);
    let out1 = this.outcodePerspective(p1, z_min);

    // TODO: implement clipping here!

    return result;
  }

  //
  animate(timestamp) {
    // Get time and delta time for animation
    if (this.start_time === null) {
      this.start_time = timestamp;
      this.prev_time = timestamp;
    }
    let time = timestamp - this.start_time;
    let delta_time = timestamp - this.prev_time;

    // Update transforms for animation
    this.updateTransforms(time, delta_time);

    // Draw slide
    this.draw();

    // Invoke call for next frame in animation
    if (this.enable_animation) {
      window.requestAnimationFrame((ts) => {
        this.animate(ts);
      });
    }

    // Update previous time to current one for next calculation of delta time
    this.prev_time = timestamp;
  }

  //
  updateScene(scene) {
    this.scene = this.processScene(scene);
    if (!this.enable_animation) {
      this.draw();
    }
  }

  //
  processScene(scene) {
    let processed = {
      view: {
        prp: CG.Vector3(
          scene.view.prp[0],
          scene.view.prp[1],
          scene.view.prp[2]
        ),
        srp: CG.Vector3(
          scene.view.srp[0],
          scene.view.srp[1],
          scene.view.srp[2]
        ),
        vup: CG.Vector3(
          scene.view.vup[0],
          scene.view.vup[1],
          scene.view.vup[2]
        ),
        clip: [...scene.view.clip],
      },
      models: [],
    };

    for (let i = 0; i < scene.models.length; i++) {
      let model = { type: scene.models[i].type, vertices: [], edges: [] };
      if (model.type === "generic") {
        model.vertices = [];
        model.edges = JSON.parse(JSON.stringify(scene.models[i].edges));
        for (let j = 0; j < scene.models[i].vertices.length; j++) {
          model.vertices.push(
            CG.Vector4(
              scene.models[i].vertices[j][0],
              scene.models[i].vertices[j][1],
              scene.models[i].vertices[j][2],
              1
            )
          );
          if (scene.models[i].hasOwnProperty("animation")) {
            model.animation = JSON.parse(
              JSON.stringify(scene.models[i].animation)
            );
          }
        }
      } else if (model.type === "cube") {
        // Get cube center and dimensions
        const { center, width, height, depth } = scene.models[i];
        const [xcube, ycube, zcube] = center;
        const halfWidth = width / 2,
          halfHeight = height / 2,
          halfDepth = depth / 8;

        // Define cube vertices based on the center and dimensions
        model.vertices = [
          // cube's Top
          CG.Vector4(
            xcube - halfWidth,
            ycube + halfHeight,
            zcube + halfDepth,
            1
          ), //  cube's left front
          CG.Vector4(
            xcube - halfWidth,
            ycube + halfHeight,
            zcube - halfDepth,
            1
          ), //  cube's left back
          CG.Vector4(
            xcube + halfWidth,
            ycube + halfHeight,
            zcube - halfDepth,
            1
          ), //  cube's right back
          CG.Vector4(
            xcube + halfWidth,
            ycube + halfHeight,
            zcube + halfDepth,
            1
          ), // cube's right front

          // Bottom
          CG.Vector4(
            xcube - halfWidth,
            ycube - halfHeight,
            zcube + halfDepth,
            1
          ), // left-front
          CG.Vector4(
            xcube - halfWidth,
            ycube - halfHeight,
            zcube - halfDepth,
            1
          ), // left-back
          CG.Vector4(
            xcube + halfWidth,
            ycube - halfHeight,
            zcube - halfDepth,
            1
          ), // right-back
          CG.Vector4(
            xcube + halfWidth,
            ycube - halfHeight,
            zcube + halfDepth,
            1
          ), // right-front
        ];

        // Define cube edges based on the vertices
        model.edges = [
          // Top
          [0, 1],
          [1, 2],
          [2, 3],
          [3, 0],

          // Bottom
          [4, 5],
          [5, 6],
          [6, 7],
          [7, 4],

          // Sides
          [0, 4],
          [1, 5],
          [2, 6],
          [3, 7],
        ];
      } else if (model.type === "cylinder") {
        // Get cylinder center, radius, height, and sides
        const { center, radius, height, sides } = scene.models[i];
        const [xCyl, yCyl, zCyl] = center;
        const halfHeight = height / 2;

        // Iterate through sides to create cylinder vertices and edges
        for (let j = 0; j < sides; j++) {
          const angle = (2 * Math.PI * j) / sides;
          const x = xCyl + radius * Math.cos(angle);
          const z = zCyl + radius * Math.sin(angle);

          // Add bottom and top circle vertices
          model.vertices.push(CG.Vector4(x, yCyl - halfHeight, z, 1)); // Bottom circle vertex
          model.vertices.push(CG.Vector4(x, yCyl + halfHeight, z, 1)); // Top circle vertex
          model.edges.push([2 * j, 2 * j + 1]); // Side edges

          // Connect vertices of current and previous sides
          if (j > 0) {
            model.edges.push([2 * j - 2, 2 * j]); // Connect bottom circle vertices
            model.edges.push([2 * j - 1, 2 * j + 1]); // Connect top circle vertices
          }
        }

        // Connect the last side to complete the bottom and top circles
        model.edges.push([2 * (sides - 1), 0]); // Bottom circle
        model.edges.push([2 * (sides - 1) + 1, 1]); // Top circle
      } else if (model.type === "cone") {
        // Get cone center, radius, height, and sides
        const { center, radius, height, sides } = scene.models[i];
        const [xcone, ycone, zcone] = center;
        const halfHeight = height;

        // Add top point of the cone
        model.vertices.push(CG.Vector4(xcone, ycone + halfHeight, zcone, 1));

        // Iterate through sides to create cone vertices and edges
        for (let j = 0; j < sides; j++) {
          const angle = (2 * Math.PI * j) / sides;
          const x = xcone + radius * Math.cos(angle);
          const z = zcone + radius * Math.sin(angle);

          // Add base circle vertices
          model.vertices.push(CG.Vector4(x, ycone, z, 1));
          model.edges.push([0, j + 1]); // Connect point to each base vertex

          // Connect base circle vertices
          if (j > 0) {
            model.edges.push([j, j + 1]);
          }
        }
        model.edges.push([sides, 1]); // Connect last vertex to close the base circle
      } else if (model.type === "sphere") {
        //CONTINUE LATER Sphere or during class with partner
        const {center,radius,verttcircles,horzcircles} = model.scene[i];
        const {Xsph,Ysph,Zsph} = center;
        for(let horzcircle = 0; horzcircle <= horzcircles; horzcircle ++){
          let horzcircle_ = Math.PI * horzcircle / horzcircles;
          let horzcos = Math.cos(horzcircle_) * radius + Ysph;
        
        }
        for(let verttcircle = 0; verttcircle <= verttcircles ; verttcircle++){
            //CONTINUE
        }
      } else {
        model.center = CG.Vector4(
          scene.models[i].center[0],
          scene.models[i].center[1],
          scene.models[i].center[2],
          1
        );
        for (let key in scene.models[i]) {
          if (
            scene.models[i].hasOwnProperty(key) &&
            key !== "type" &&
            key != "center"
          ) {
            model[key] = JSON.parse(JSON.stringify(scene.models[i][key]));
          }
        }
      }

      model.matrix = new Matrix(4, 4);
      processed.models.push(model);
    }

    return processed;
  }

  // x0:           float (x coordinate of p0)
  // y0:           float (y coordinate of p0)
  // x1:           float (x coordinate of p1)
  // y1:           float (y coordinate of p1)
  drawLine(x0, y0, x1, y1) {
    this.ctx.strokeStyle = "#000000";
    this.ctx.beginPath();
    this.ctx.moveTo(x0, y0);
    this.ctx.lineTo(x1, y1);
    this.ctx.stroke();

    this.ctx.fillStyle = "#FF0000";
    this.ctx.fillRect(x0 - 2, y0 - 2, 4, 4);
    this.ctx.fillRect(x1 - 2, y1 - 2, 4, 4);
  }
}
export { Renderer };
