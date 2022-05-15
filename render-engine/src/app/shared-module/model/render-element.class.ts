import { IPoint } from './point.interface';
import { v4 as uuid } from 'uuid';
import { CanvasMeta, CanvasManagerService } from '../services/canvas-manager/canvas-manager.service';
import { WorkSheet } from './work-sheet.class';
import { rotationMaxRotation } from './client-constants';

export interface IDreamEvent {
  canceled: boolean;
  domEvent: Event;
  canvasService: CanvasManagerService;
}

export interface IMouseEvent extends IDreamEvent {
  positionOnElement?: IPoint;
  positionOnCanvas: IPoint;
  positionOnWorkSheet: IPoint;
  offsetFromLastPosition: IPoint;
  button: number;
  domEvent: MouseEvent;
}

export interface IKeyboardEvent extends IDreamEvent {
  domEvent: KeyboardEvent;
}

export abstract class DreamComponent {
  attachedElement: DreamElement;

  constructor(attachedElement: DreamElement) {
    this.attachedElement = attachedElement;
  }

  /** is fired every render cyclus */
  abstract update: (workSheet: WorkSheet, canvasMeta: CanvasMeta) => void;

  /** is fired when element is clicked */
  click?: (e: IMouseEvent) => void;

  /** is fired when element is double clicked */
  doubleClick?: (e: IMouseEvent) => void;

  /** is fired when the mouse moves over the canvas */
  mouseMove?: (e: IMouseEvent) => void;

  /** is fired when mouse enters boundaries */
  mouseEnter?: (e: IMouseEvent) => void;

  /** is fired when mouse leaves boundaries */
  mouseLeave?: (e: IMouseEvent) => void;

  /** is fired when a key is pressed */
  keyDown?: (e: IKeyboardEvent) => void;

  /** is fired when a key is released */
  keyUp?: (e: IKeyboardEvent) => void;

  dragStart?: (e: IMouseEvent) => void;
  dragEnd?: (e: IMouseEvent) => void;
  dragEnter?: (e: IMouseEvent) => void;
  dragLeave?: (e: IMouseEvent) => void
  drag?: (e: IMouseEvent) => void;
}

export abstract class DreamElement {
  private _id: string = uuid();
  private _components: { [id: string]: DreamComponent} = {}

  get id() { return this._id; };
  get components() { return Object.values(this._components); };

  abstract position: IPoint;
  abstract dimensions: IPoint;

  _rotation: number = 0;
  get rotationOffset() { return this._rotation; };

  set rotation(value: number) {
    this._rotation = rotationMaxRotation / 360 * value;
  }
  get rotation(): number { return this._rotation / rotationMaxRotation * 360; };

  zIndex: number = 0;

  isMoveable: boolean = true;
  isSelected: boolean = false;
  isSelectable: boolean = true;

  protected constructor() {}

  addComponent = <TS extends DreamComponent>(t: new (dreamElement: DreamElement) => TS) => {
    if(this._components[t.name])
      throw "component already added";
    this._components[t.name] = new t(this);
    console.log(t.name);

  }

  removeComponent = <TS extends DreamComponent>(t: new (dreamElement: DreamElement) => TS) => {
    delete this._components[t.name];
  }

  getComponent = <TS extends DreamComponent>(t: new (dreamElement: DreamElement) => TS): TS => {
    return this._components[t.name] as TS;
  }
}
