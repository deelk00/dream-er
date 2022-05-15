import { CanvasMeta } from "../services/canvas-manager/canvas-manager.service";
import { IKeyboardEvent, IMouseEvent } from "./render-element.class";
import { WorkSheet } from "./work-sheet.class";

export abstract class LogicalComponent {
  /** is fired every render cyclus */
  abstract update: (workSheet: WorkSheet, canvasMeta: CanvasMeta) => void;

  /** is fired when canvas is clicked */
  click?: (e: IMouseEvent) => void;

  /** is fired when canvas is double clicked */
  doubleClick?: (e: IMouseEvent) => void;

  /** is fired when the mouse moves over the canvas */
  mouseMove?: (e: IMouseEvent) => void;

  /** is fired when mouse enters canvas */
  mouseEnter?: (e: IMouseEvent) => void;

  /** is fired when mouse leaves canvas */
  mouseLeave?: (e: IMouseEvent) => void;

  /** is fired when a key is pressed */
  keyDown?: (e: IKeyboardEvent) => void;

  /** is fired when a key is released */
  keyUp?: (e: IKeyboardEvent) => void;
}
