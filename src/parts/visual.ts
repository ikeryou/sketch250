import {Composite } from "matter-js";
import { Func } from '../core/func';
import { Canvas } from '../webgl/canvas';
import { Object3D } from 'three/src/core/Object3D';
import { Conf } from '../core/conf';
import { BoxGeometry } from "three/src/geometries/BoxGeometry";
import { MeshToonMaterial } from "three/src/materials/MeshToonMaterial";
import { Mesh } from 'three/src/objects/Mesh';
import { Color } from 'three/src/math/Color';
import { PointLight } from 'three/src/lights/PointLight';
import { Param } from "../core/param";
import { Util } from "../libs/util";

export class Visual extends Canvas {

  private _con: Object3D;
  private _item:Array<Mesh> = [];
  private _pLight:PointLight;

  constructor(opt: any) {
    super(opt);

    // ライト
    this._pLight = new PointLight(0xffffff, 1, 0);
    this.mainScene.add(this._pLight);
    this._pLight.position.set( 100, 200, -100 );

    this._con = new Object3D()
    this.mainScene.add(this._con)

    const seg = 32
    const geo = new BoxGeometry(1, 1, 1, seg, seg, seg);
    const mat = [
      new MeshToonMaterial({
        color:0x515bd4,
        gradientMap: null,
      }),
      new MeshToonMaterial({
        color:0x8134af,
        gradientMap: null,
      }),
      new MeshToonMaterial({
        color:0xdd2a7b,
        gradientMap: null,
      }),
      new MeshToonMaterial({
        color:0xfeda77,
        gradientMap: null,
      }),
      new MeshToonMaterial({
        color:0x222222,
        gradientMap: null,
      })
    ]

    const num = Conf.instance.ITEM_NUM * Conf.instance.STACK_NUM;
    for(let i = 0; i < num; i++) {
      const b = new Mesh(
        geo,
        Util.instance.randomArr(mat)
      )
      this._con.add(b)
      this._item.push(b)
    }

    this._resize()
  }


  public updatePos(stack:Array<Composite>): void {
    // 物理演算結果をパーツに反映
    let key = 0;
    const offsetX = -this.renderSize.width * 0.5
    const offsetY = this.renderSize.height * 0.5

    stack.forEach((val) => {
      val.bodies.forEach((val2) => {
        const item = this._item[key++];
        const pos = val2.position

        item.position.x = pos.x + offsetX
        item.position.y = pos.y * -1 + offsetY

        item.rotation.z = val2.angle * -1;

      })
    })

  }


  protected _update(): void {
    super._update()

    // const timer = this._c * 0.001;
    // this._pLight.position.x = Math.sin( timer * 7 ) * 1800;
    // this._pLight.position.y = Math.cos( timer * 5 ) * 1400;
    // this._pLight.position.z = Math.cos( timer * 3 ) * 1300;
    // this._pLight.lookAt(new Vector3(0,0,0));

    this._item.forEach((val) => {
      const s = Conf.instance.ITEM_SIZE;
      val.scale.set(s * 2, s * 2, s * 2);
      // val.rotation.x += 0.01
    })


    if (this.isNowRenderFrame()) {
      this._render()
    }
  }


  private _render(): void {
    const bgColor = new Color(Param.instance.main.bg.value)
    this.renderer.setClearColor(bgColor, 1)
    this.renderer.render(this.mainScene, this.camera)
  }


  public isNowRenderFrame(): boolean {
    return this.isRender
  }


  _resize(isRender: boolean = true): void {
    super._resize();

    const w = Func.instance.sw();
    const h = Func.instance.sh();

    this.renderSize.width = w;
    this.renderSize.height = h;

    this.updateCamera(this.camera, w, h);

    let pixelRatio: number = window.devicePixelRatio || 1;

    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(w, h);
    this.renderer.clear();

    if (isRender) {
      this._render();
    }
  }
}
