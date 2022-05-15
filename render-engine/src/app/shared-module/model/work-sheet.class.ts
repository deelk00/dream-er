import { v4 as uuid} from "uuid";
import { IPoint } from "./point.interface";
import { DreamElement } from './render-element.class';
import { LogicalComponent } from './logical-component';

export class WorkSheet {
  private _id: string;

  get id() { return this._id; }

  private _elements: DreamElement[] = [];

  get elements() { return [...this._elements]; };

  snapToGrid: boolean = true;
  snappableGridSize: IPoint = {
    x: 10,
    y: 10
  }

  showGrid: boolean = true;
  gridSize: IPoint = {
    x: 50,
    y: 50
  }

  constructor(id?: string) {
      this._id = id ?? uuid();
  }

  addElement(element: DreamElement) {
      this._elements.push(element);
      this._elements.sort((a,b) => a.zIndex - b.zIndex);
  }

  removeElement(element: DreamElement) {
      this._elements = this._elements.filter(e => e != element);
  }
}
