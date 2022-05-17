import { IPoint } from './point.interface';
import { DreamElement } from './render-element.class';
import { MeshRenderer, rectangle, triangle } from './render-components/mesh-renderer';
import { MoveableElement } from './render-components/moveable-element';
import { RigidBody } from 'src/app/game-engine/element-components/rigid-body';

export class TestRenderElement extends DreamElement {
  static create = (...args: any[]) => {
    const e = new TestRenderElement();
    e.addComponent(MeshRenderer);
    e.addComponent(MoveableElement);
    e.addComponent(RigidBody);
    const meshRenderer = e.getComponent(MeshRenderer);
    meshRenderer.mesh = triangle;
    return e;
  }

  position: IPoint = {
    x: 0,
    y: 0
  };
  dimensions: IPoint = {
    x: 50,
    y: 50
  };


  get fillColor() { return this.getComponent(MeshRenderer).fillColor; };
  set fillColor(value: string) { this.getComponent(MeshRenderer).fillColor = value; }

  get strokeColor() { return this.getComponent(MeshRenderer).strokeColor; };
  set strokeColor(value: string) { this.getComponent(MeshRenderer).strokeColor = value; }

}
