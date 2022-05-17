import { CanvasMeta, Key } from "../../services/canvas-manager/canvas-manager.service";
import { DreamComponent, DreamElement, IMouseEvent } from "../render-element.class";
import { WorkSheet } from "../work-sheet.class";
import { IPoint } from '../point.interface';

export class MoveableElement extends DreamComponent {
  isSelected: boolean = false;

  stickToGrid: boolean = true;
  subGridCount: IPoint = {
    x: 10,
    y: 10
  }

  constructor(dreamElement: DreamElement) {
    super(dreamElement);
    this.attachedElement = dreamElement;
  }

  update = (workSheet: WorkSheet, meta: CanvasMeta) => {

  };

  override mouseMove? = (e: IMouseEvent) => {
    if(!this.attachedElement.isSelected
      || !e.canvasService.isPressed(Key.LeftMouse)){
      return;
    }

    this.attachedElement.position = {
      x: this.attachedElement.position.x + e.offsetFromLastPosition.x,
      y: this.attachedElement.position.y + e.offsetFromLastPosition.y
    }
  };
}
