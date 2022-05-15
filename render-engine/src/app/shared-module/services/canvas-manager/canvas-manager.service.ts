import { Injectable } from '@angular/core';
import { WorkSheet } from '../../model/work-sheet.class';
import { IPoint } from '../../model/point.interface';
import { CustomAttribute } from '../../model/custom-attributes';
import { DreamElement, IMouseEvent } from '../../model/render-element.class';
import { CanvasColors } from '../../model/enums/canvas-colors';
import { BehaviorSubject } from 'rxjs';
import { LogicalComponent } from '../../model/logical-component';

export class CanvasMeta {
  private _logicalComponents: { [id: string]: LogicalComponent} = {};
  get logicalComponents() { return Object.values(this._logicalComponents); };

  offset: IPoint = {
    x: 0,
    y: 0
  };
  resizeObserver: ResizeObserver;
  $currentZoom: BehaviorSubject<number> = new BehaviorSubject(1);
  minimalZoom: number = 0.25;
  maximalZoom: number = 2.5;
  zoomSpeed: number = 0.1;
  gridColor: string = CanvasColors.GridColor;
  gridThickness: number = 1;
  clickTimeTolerance: number = 50;
  scrollBehavior: ScrollBehavior = ScrollBehavior.OnLeftControlAndScroll;
  mousePositions: IPoint[] = [];
  maxMousePositionLength: number = 10;
  pressedElement?: DreamElement;
  massSelectingOverlay?: DreamElement;
  totalMouseMoveOffset?: IPoint;
  selectedElementsStartPosition?: { [id: string]: {
    startPosition: IPoint,
    element: DreamElement
  }}

  constructor(public renderingContext: CanvasRenderingContext2D) {
    this.resizeObserver = new ResizeObserver(() => {

    });
  }

  addComponent = <TS extends LogicalComponent>(t: new () => TS) => {
    if(this._logicalComponents[t.name])
      throw "component already added";
    this._logicalComponents[t.name] = new t();
    console.log(t.name);

  }

  removeComponent = <TS extends LogicalComponent>(t: new () => TS) => {
    delete this._logicalComponents[t.name];
  }

  getComponent = <TS extends LogicalComponent>(t: new () => TS): TS => {
    return this._logicalComponents[t.name] as TS;
  }
}

export enum ScrollBehavior {
  None,
  OnScroll,
  OnLeftControlAndScroll
}

export enum Key {
  LeftMouse = "Mouse_0",
  MiddleMouse = "Mouse_1",
  RightMouse = "Mouse_2",
  Backquote = "Keyboard_Backquote",
  ShiftLeft = "Keyboard_ShiftLeft",
  Tab = "Keyboard_Tab",
  CapsLock = "Keyboard_CapsLock",
  Digit0 = "Keyboard_Digit0",
  Digit1 = "Keyboard_Digit1",
  Digit2 = "Keyboard_Digit2",
  Digit3 = "Keyboard_Digit3",
  Digit4 = "Keyboard_Digit4",
  Digit5 = "Keyboard_Digit5",
  Digit6 = "Keyboard_Digit6",
  Digit7 = "Keyboard_Digit7",
  Digit8 = "Keyboard_Digit8",
  Digit9 = "Keyboard_Digit9",
  KeyQ = "Keyboard_KeyQ",
  KeyA = "Keyboard_KeyA",
  KeyZ = "Keyboard_KeyZ",
  KeyW = "Keyboard_KeyW",
  KeyS = "Keyboard_KeyS",
  KeyX = "Keyboard_KeyX",
  KeyE = "Keyboard_KeyE",
  KeyD = "Keyboard_KeyD",
  KeyC = "Keyboard_KeyC",
  KeyR = "Keyboard_KeyR",
  KeyF = "Keyboard_KeyF",
  KeyV = "Keyboard_KeyV",
  KeyT = "Keyboard_KeyT",
  KeyG = "Keyboard_KeyG",
  KeyB = "Keyboard_KeyB",
  KeyY = "Keyboard_KeyY",
  KeyH = "Keyboard_KeyH",
  KeyN = "Keyboard_KeyN",
  KeyM = "Keyboard_KeyM",
  KeyU = "Keyboard_KeyU",
  KeyJ = "Keyboard_KeyJ",
  KeyK = "Keyboard_KeyK",
  KeyO = "Keyboard_KeyO",
  KeyL = "Keyboard_KeyL",
  KeyP = "Keyboard_KeyP",
  MetaLeft = "Keyboard_MetaLeft",
  AltLeft = "Keyboard_AltLeft",
  Space = "Keyboard_Space",
  IntlBackslash = "Keyboard_IntlBackslash",
  Minus = "Keyboard_Minus",
  Equal = "Keyboard_Equal",
  BackSpace = "Keyboard_BackSpace",
  Enter = "Keyboard_Enter",
  BracketLeft = "Keyboard_BracketLeft",
  BracketRight = "Keyboard_BracketRight",
  Semicolon = "Keyboard_Semicolon",
  Quote = "Keyboard_Quote",
  Backslash = "Keyboard_Backslash",
  Comma = "Keyboard_Comma",
  Period = "Keyboard_Period",
  Slash = "Keyboard_Slash",
  ShiftRight = "Keyboard_ShiftRight",
  ControlLeft = "Keyboard_ControlLeft",
  ArrowUp = "Keyboard_ArrowUp",
  ArrowDown = "Keyboard_ArrowDown",
  ArrowLeft = "Keyboard_ArrowLeft",
  ArrowRight = "Keyboard_ArrowRight",
}

@Injectable({
  providedIn: 'root'
})
export class CanvasManagerService {

  workSheets: { [key: string]: WorkSheet } = {};
  contexts: { [key: string]: CanvasMeta[] } = {}

  requestAnimationFrameId!: number;

  eventHandler: { name: keyof HTMLElementEventMap, handlers: any[]}[];

  pressedKeys: { [key: string]: number | undefined } = {};

  constructor() {
    this.render(0);
    this.eventHandler = [
      {
        name: "mousedown",
        handlers: [
          this.mouseDownHandler
        ]
      },
      {
        name: "mouseup",
        handlers: [
          this.mouseUpHandler
        ]
      },
      {
        name: "mousemove",
        handlers: [
          this.addMousePosition,
          this.mouseMoveHandler
        ]
      },
      {
        name: "contextmenu",
        handlers: [(e: MouseEvent) => e.button === 2 ? e.preventDefault() : undefined]
      },
      {
        name: "mouseleave",
        handlers: [
          this.mouseLeaveHandler
        ]
      },
      {
        name: "dblclick",
        handlers: [
          this.doubleClickHandler
        ]
      },
      {
        name: "wheel",
        handlers: [
          this.wheelHandler
        ]
      }
    ];

    window.addEventListener("keydown", this.keyDownHandler);
    window.addEventListener("keyup", this.keyUpHandler);
  }

  wheelHandler = (e: WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const workSheetId = (e.target as HTMLElement).getAttribute(CustomAttribute.workSheetId)!;
    const contexts = this.contexts[workSheetId];
    const context = (e.target as HTMLCanvasElement).getContext("2d")!;
    const contextMeta = contexts.find(x => x.renderingContext === context)!;

    if(contextMeta.scrollBehavior === ScrollBehavior.None)
      return;

    if(contextMeta.scrollBehavior === ScrollBehavior.OnLeftControlAndScroll
      && !this.isPressed(Key.ControlLeft))
      return;

    let zoom = contextMeta.$currentZoom.getValue();

    if(e.deltaY > 0) {
      zoom = Math.round((zoom - contextMeta.zoomSpeed) * 100) / 100;
      zoom = Math.max(zoom, contextMeta.minimalZoom);
    }
    if(e.deltaY < 0) {
      zoom = Math.round((zoom + contextMeta.zoomSpeed) * 100) / 100;
      zoom = Math.min(zoom, contextMeta.maximalZoom);
    }

    contextMeta.$currentZoom.next(zoom);
  }

  refreshZoom = (canvasMeta: CanvasMeta) => {
    const dims = canvasMeta.renderingContext.canvas.getBoundingClientRect();

    canvasMeta.renderingContext.canvas.setAttribute("width", Math.round(dims.width / canvasMeta.$currentZoom.getValue()).toString());
    canvasMeta.renderingContext.canvas.setAttribute("height", Math.round(dims.height / canvasMeta.$currentZoom.getValue()).toString());
  }

  doubleClickHandler = (e: MouseEvent) => {
    const workSheetId = (e.target as HTMLElement).getAttribute(CustomAttribute.workSheetId)!;
    const contexts = this.contexts[workSheetId];
    const context = (e.target as HTMLCanvasElement).getContext("2d")!;
    const contextMeta = contexts.find(x => x.renderingContext === context)!;

    // if(contextMeta.pressedElement?.doubleClick) {
    //   const positionOnWorkSheet = this.getPositionOnWorkSheet(e, contextMeta);
    //   const positionOnElement = {
    //     x: positionOnWorkSheet.x - contextMeta.pressedElement!.position.x,
    //     y: positionOnWorkSheet.y - contextMeta.pressedElement!.position.y,
    //   }

    //   contextMeta.pressedElement.doubleClick({
    //     positionOnCanvas: {
    //       x: e.offsetX,
    //       y: e.offsetY
    //     },
    //     positionOnElement: positionOnElement,
    //     positionOnWorkSheet: positionOnWorkSheet,
    //     button: 0,
    //   });
    // }
  }

  addMousePosition = (e: MouseEvent) => {
    const workSheetId = (e.target as HTMLElement).getAttribute(CustomAttribute.workSheetId)!;
    const contexts = this.contexts[workSheetId];
    const context = (e.target as HTMLCanvasElement).getContext("2d")!;
    const contextMeta = contexts.find(x => x.renderingContext === context)!;

    const length = contextMeta.mousePositions.unshift({
      x: e.offsetX,
      y: e.offsetY
    });

    if(length > contextMeta.maxMousePositionLength) {
      contextMeta.mousePositions.splice(contextMeta.maxMousePositionLength);
    }
  }


  whenPressed = (key: Key) => {
    return this.pressedKeys[key];
  }

  isPressed = (key: Key) => {
    return !!this.pressedKeys[key];
  }

  keyDownHandler = (e: KeyboardEvent) => {
    this.pressedKeys["Keyboard_" + e.code] ??= Date.now();

  }

  keyUpHandler = (e: KeyboardEvent) => {
    this.pressedKeys["Keyboard_" + e.code] = undefined;
  }

  mouseDownHandler = (e: MouseEvent) => {
    this.pressedKeys["Mouse_" + e.button] ??= Date.now();

    const workSheetId = (e.target as HTMLElement).getAttribute(CustomAttribute.workSheetId)!;
    const contexts = this.contexts[workSheetId];
    const context = (e.target as HTMLCanvasElement).getContext("2d")!;
    const workSheet = this.workSheets[workSheetId];
    const contextMeta = contexts.find(x => x.renderingContext === context)!;

    contextMeta.totalMouseMoveOffset = undefined;
    contextMeta.selectedElementsStartPosition = {};

    const canvasPosition = this.getPositionOnWorkSheet(e, contextMeta);

    contextMeta.pressedElement = workSheet.elements.reverse().find(element =>
      canvasPosition.x >= element.position.x
      && canvasPosition.x <= element.position.x + element.dimensions.x
      && canvasPosition.y >= element.position.y
      && canvasPosition.y <= element.position.y + element.dimensions.y
    );

    if(e.button === 0) {
      if(!this.isPressed(Key.ControlLeft) && !contextMeta.pressedElement?.isSelected) {
        workSheet.elements.forEach(element => element.isSelected = false);
      }

      if(contextMeta.pressedElement) {
        contextMeta.pressedElement.isSelected = contextMeta.pressedElement.isSelectable;
      }

      workSheet.elements.filter(x => x.isSelected).forEach(element => contextMeta.selectedElementsStartPosition![element.id] = {
        startPosition: Object.assign({}, element.position),
        element: element
      });
    }
  }

  getPositionOnWorkSheet = (e: MouseEvent, ctx?: CanvasMeta): IPoint => {
    if(!ctx) {
      const workSheetId = (e.target as HTMLElement).getAttribute(CustomAttribute.workSheetId)!;
      const contexts = this.contexts[workSheetId];
      const context= (e.target as HTMLCanvasElement).getContext("2d")!;
      ctx = contexts.find(x => x.renderingContext === context);
    }
    return {
      x: e.offsetX - ctx!.offset.x,
      y: e.offsetY - ctx!.offset.y
    }
  }

  mouseUpHandler = (e: MouseEvent) => {
    const workSheetId = (e.target as HTMLElement).getAttribute(CustomAttribute.workSheetId)!;
    const workSheet = this.workSheets[workSheetId];
    const context= (e.target as HTMLCanvasElement).getContext("2d")!;
    const contextMeta = this.contexts[workSheetId].find(x => x.renderingContext === context)!;

    const now = Date.now();

    const whenLeftClicked = this.whenPressed(Key.LeftMouse) ?? now;
    const whenRightClicked = this.whenPressed(Key.LeftMouse) ?? now;
    const whenMiddleClicked = this.whenPressed(Key.LeftMouse) ?? now;

    if(contextMeta.pressedElement &&
      (e.button === 0 && now - contextMeta.clickTimeTolerance > whenLeftClicked
      || e.button === 2 && now - contextMeta.clickTimeTolerance > whenRightClicked
      || e.button === 1 &&  now - contextMeta.clickTimeTolerance > whenMiddleClicked
    )) {
      const positionOnWorkSheet = this.getPositionOnWorkSheet(e, contextMeta);
      const positionOnElement = {
        x: positionOnWorkSheet.x - contextMeta.pressedElement.position.x,
        y: positionOnWorkSheet.y - contextMeta.pressedElement.position.y,
      }

      const args: IMouseEvent = {
        positionOnCanvas: {
          x: e.offsetX,
          y: e.offsetY
        },
        positionOnElement: positionOnElement,
        positionOnWorkSheet: positionOnWorkSheet,
        button: e.button,
        canceled: false,
        canvasService: this,
        offsetFromLastPosition: this.getMousePositionalOffset(contextMeta),
        domEvent: e
      };

      for (const component of contextMeta.pressedElement.components.filter(c => c.click)) {
        component.click!(args);
        if(args.canceled)
          break;
      }
    }

    this.pressedKeys["Mouse_" + e.button] = undefined;

    if(contextMeta.massSelectingOverlay) {
      const elementsToSelect = workSheet.elements.filter(element =>
        element.position.x > (contextMeta.massSelectingOverlay!.dimensions.x >= 0
          ? contextMeta.massSelectingOverlay!.position.x
          : contextMeta.massSelectingOverlay!.position.x + contextMeta.massSelectingOverlay!.dimensions.x
          )
        && element.position.y >  (contextMeta.massSelectingOverlay!.dimensions.y >= 0
          ? contextMeta.massSelectingOverlay!.position.y
          : contextMeta.massSelectingOverlay!.position.y + contextMeta.massSelectingOverlay!.dimensions.y
          )
        && element.position.x + element.dimensions.x < (contextMeta.massSelectingOverlay!.dimensions.x >= 0
          ? contextMeta.massSelectingOverlay!.position.x  + contextMeta.massSelectingOverlay!.dimensions.x
          : contextMeta.massSelectingOverlay!.position.x
          )
        && element.position.y + element.dimensions.y < (contextMeta.massSelectingOverlay!.dimensions.y >= 0
          ? contextMeta.massSelectingOverlay!.position.y  + contextMeta.massSelectingOverlay!.dimensions.y
          : contextMeta.massSelectingOverlay!.position.y
          )
      );

      workSheet.removeElement(contextMeta.massSelectingOverlay);
      contextMeta.massSelectingOverlay = undefined;

      elementsToSelect.forEach(element =>  element.isSelected = element.isSelectable);
    }
  }

  mouseLeaveHandler = (e: MouseEvent) => {
    this.pressedKeys = {};
  }

  getMousePositionalOffset = (meta: CanvasMeta) => {
    if(meta.mousePositions.length < 2)
      return {
        x: 0,
        y: 0
      }
    return {
      x: meta.mousePositions[0].x - meta.mousePositions[1].x,
      y: meta.mousePositions[0].y - meta.mousePositions[1].y,
    }
  }

  mouseMoveHandler = (e: MouseEvent) => {
    const workSheetId = (e.target as HTMLElement).getAttribute(CustomAttribute.workSheetId)!;
    const contexts = this.contexts[workSheetId];
    const contextMeta = contexts.find(x => x.renderingContext === (e.target as HTMLCanvasElement).getContext("2d"))!
    const workSheet = this.workSheets[workSheetId];
    const now = Date.now();

    const positionOnWorkSheet = this.getPositionOnWorkSheet(e, contextMeta);

    const args: IMouseEvent = {
      positionOnCanvas: {
        x: e.offsetX,
        y: e.offsetY
      },
      positionOnWorkSheet: positionOnWorkSheet,
      button: e.button,
      canceled: false,
      canvasService: this,
      offsetFromLastPosition: this.getMousePositionalOffset(contextMeta),
      domEvent: e
    };

    workSheet.elements.forEach(e => {
      e.components.filter(x => x.mouseMove).forEach(c => {
        c.mouseMove!(args);
      })
    })

    // when right click
    if(this.isPressed(Key.RightMouse)) {
      contextMeta!.offset = {
        x: contextMeta!.offset.x + contextMeta.mousePositions[0].x - contextMeta.mousePositions[1].x,
        y: contextMeta!.offset.y + contextMeta.mousePositions[0].y - contextMeta.mousePositions[1].y,
      }
    }


    // when left click
    if(this.isPressed(Key.LeftMouse)) {
      // if(contextMeta.totalMouseMoveOffset) {
      //   contextMeta.totalMouseMoveOffset = {
      //     x: contextMeta.totalMouseMoveOffset.x + contextMeta.mousePositions[0].x - contextMeta.mousePositions[1].x,
      //     y: contextMeta.totalMouseMoveOffset.y + contextMeta.mousePositions[0].y - contextMeta.mousePositions[1].y
      //   }
      // }else{
      //   contextMeta.totalMouseMoveOffset = {
      //     x: contextMeta.mousePositions[0].x - contextMeta.mousePositions[1].x,
      //     y: contextMeta.mousePositions[0].y - contextMeta.mousePositions[1].y
      //   }
      // }

      // const whenLeftClicked = this.whenPressed(Key.LeftMouse) ?? now;

      // // when left click and hold
      // if(now - contextMeta.clickTimeTolerance > whenLeftClicked && contextMeta.pressedElement) {

      //   const keys = Object.keys(contextMeta.selectedElementsStartPosition!);

      //   for (const key of keys) {
      //     let offset = {
      //       x: contextMeta.totalMouseMoveOffset.x % workSheet.snappableGridSize.x,
      //       y: contextMeta.totalMouseMoveOffset.y % workSheet.snappableGridSize.y
      //     }

      //     offset = {
      //       x: (offset.x < workSheet.snappableGridSize.x / 2 ? offset.x * -1 : workSheet.snappableGridSize.x - offset.x),
      //       y: (offset.y < workSheet.snappableGridSize.y / 2 ? offset.y * -1 : workSheet.snappableGridSize.y - offset.y),
      //     }

      //     contextMeta.selectedElementsStartPosition![key].element.position = {
      //       x: contextMeta.selectedElementsStartPosition![key].startPosition.x + contextMeta.totalMouseMoveOffset.x + offset.x,
      //       y: contextMeta.selectedElementsStartPosition![key].startPosition.y + contextMeta.totalMouseMoveOffset.y + offset.y
      //     }
      //   }

      // } else if(!contextMeta.pressedElement) {
      //   // if(!contextMeta.massSelectingOverlay) {
      //   //   contextMeta.massSelectingOverlay = new MassSelectingOverlay(workSheetPosition);
      //   //   workSheet.addElement(contextMeta.massSelectingOverlay);
      //   // }
      //   // contextMeta.massSelectingOverlay.dimensions = {
      //   //   x: workSheetPosition.x - contextMeta.massSelectingOverlay.position.x,
      //   //   y: workSheetPosition.y - contextMeta.massSelectingOverlay.position.y
      //   // }
      // }
    }

  }

  addWorkSheet(ws: WorkSheet) {
    this.workSheets[ws.id] = ws;
    this.contexts[ws.id] = [];
  }

  removeWorkSheet(ws: WorkSheet) {
    delete this.workSheets[ws.id];
    delete this.contexts[ws.id];
  }

  clearWorkSheets() {
    this.workSheets = {};
    this.contexts = {};
  }

  addContext(workSheetId: string, ctx: CanvasRenderingContext2D) {
    const keys = Object.keys(this.contexts);

    ctx.canvas.setAttribute(CustomAttribute.workSheetId, workSheetId);

    for (const key of keys) {
      if(this.contexts[key].some(x => x.renderingContext === ctx)){
        throw "can't add the same context twice";
      }
    }
    let canvasMeta: CanvasMeta;
    const observer = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      this.refreshZoom(canvasMeta);
    });

    const zoomSub = new BehaviorSubject(1);
    canvasMeta = new CanvasMeta(ctx);

    zoomSub.subscribe(zoom => this.refreshZoom(canvasMeta));

    this.contexts[workSheetId].push(canvasMeta);

    observer.observe(ctx.canvas);

    for (const event of this.eventHandler) {
      for (const handler of event.handlers) {
        ctx.canvas.addEventListener(event.name, handler);
      }
    }
  }

  removeContext(ctx: CanvasRenderingContext2D) {
    const keys = Object.keys(this.contexts);

    let k: string | undefined;
    for (const key of keys) {
      if(this.contexts[key].some(x => x.renderingContext === ctx)){
        k = key;
      }
    }

    if(k){
      this.contexts[k] = this.contexts[k].filter(x => x.renderingContext !== ctx);
    }

    for (const event of this.eventHandler) {
      for (const handler of event.handlers) {
        ctx.canvas.removeEventListener(event.name, handler);
      }
    }
  }

  private render = (time: number) => {
    const renderGrid = (meta: CanvasMeta, workSheet: WorkSheet) => {
      const dimension = {
        x: meta.renderingContext.canvas.width,
        y: meta.renderingContext.canvas.height
      }

      meta.renderingContext.lineWidth = meta.gridThickness;
      meta.renderingContext.strokeStyle = meta.gridColor;

      meta.renderingContext.beginPath();

      for (let x = 0; x < Math.ceil(dimension.x / workSheet.gridSize.x); x++) {
        const posX = x * workSheet.gridSize.x + meta.offset.x % workSheet.gridSize.x;
        meta.renderingContext.moveTo(posX, 0);
        meta.renderingContext.lineTo(posX, dimension.y);
      }

      for (let y = 0; y < Math.ceil(dimension.y / workSheet.gridSize.y); y++) {
        const posY = y * workSheet.gridSize.y + meta.offset.y % workSheet.gridSize.y;
        meta.renderingContext.moveTo(0, posY);
        meta.renderingContext.lineTo(dimension.x, posY);
      }

      meta.renderingContext.stroke();
    }

    const render = (workSheet: WorkSheet, meta: CanvasMeta) => {
      meta.renderingContext.clearRect(0, 0, meta.renderingContext.canvas.width, meta.renderingContext.canvas.height);
      renderGrid(meta, workSheet);
      for (const element of workSheet.elements) {
        element.components.forEach(c => c.update(workSheet, meta))
      }
    }

    const keys = Object.keys(this.contexts);
    for (const key of keys) {
      const workSheet = this.workSheets[key];
      const contexts = this.contexts[key];

      if(!workSheet) continue;

      for (const ctx of contexts) {
        render(workSheet, ctx);
      }
    }

    this.requestAnimationFrameId = requestAnimationFrame(this.render);
  }
}
