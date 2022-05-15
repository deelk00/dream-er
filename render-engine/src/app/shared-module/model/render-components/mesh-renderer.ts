import { CanvasMeta } from '../../services/canvas-manager/canvas-manager.service';
import { DreamComponent, DreamElement } from '../render-element.class';
import { WorkSheet } from '../work-sheet.class';
import { IPoint } from '../point.interface';

/**
 * type to define a shape, first value is the start position.
 * values are given relational to size
 * min value -> 0,
 * max value -> 1
 * */
type MeshDefinition = {x: number, y: number}[]

export const triangle: MeshDefinition = [
  {x: 0, y: 1},
  {x: 1, y: 1},
  {x: 0.5, y: 0}
];

export const rectangle: MeshDefinition = [
  {x: 0, y: 0},
  {x: 1, y: 0},
  {x: 1, y: 1},
  {x: 0, y: 1}
]

Object.freeze(triangle);
Object.freeze(rectangle);


export class MeshRenderer extends DreamComponent {
  mesh?: MeshDefinition;
  strokeColor: string = "#000";
  strokeThickness: number = 1;
  fillColor: string = "#fff";
  fillMesh: boolean = true;
  selectedStrokeColor?: string;
  selectedFillColor?: string;
  selectedStrokeThickness?: number;

  constructor(dreamElement: DreamElement) {
    super(dreamElement);
    this.attachedElement = dreamElement;
  }

  update = (workSheet: WorkSheet, meta: CanvasMeta) => {
    const calcCoords = (point: IPoint): IPoint => {
      const halfDimensions = {
        x: element.dimensions.x / 2,
        y: element.dimensions.y / 2
      }

      // offset to middle for rotation
      const x = point.x * element.dimensions.x - halfDimensions.x;
      const y = point.y * element.dimensions.y - halfDimensions.y;

      const rotation = this.attachedElement.rotationOffset;

      let p = {
        x: Math.cos(rotation) * x - Math.sin(rotation) * y,
        y: Math.sin(rotation) * x + Math.cos(rotation) * y
      }

      // remove offset
      p = {
        x: p.x + meta.offset.x + halfDimensions.x + element.position.x,
        y: p.y + meta.offset.y + halfDimensions.y + element.position.y
      }

      return p;
    }

    if(!this.mesh) return;

    const mesh = [...this.mesh];
    const start = mesh.pop()!;

    const element = this.attachedElement;

    meta.renderingContext.strokeStyle = this.attachedElement.isSelected ? this.selectedStrokeColor ?? this.strokeColor : this.strokeColor;
    meta.renderingContext.fillStyle = this.attachedElement.isSelected ? this.selectedFillColor ?? this.fillColor : this.fillColor;
    meta.renderingContext.lineWidth = this.attachedElement.isSelected ? this.selectedStrokeThickness ?? this.strokeThickness : this.strokeThickness;

    meta.renderingContext.beginPath();

    let coords = calcCoords(start);
    meta.renderingContext.moveTo(coords.x, coords.y);

    for (const point of mesh) {
      coords = calcCoords(point);
      meta.renderingContext.lineTo(coords.x, coords.y);
    }

    meta.renderingContext.closePath();

    if(this.fillMesh)
      meta.renderingContext.fill();

    meta.renderingContext.stroke();
  };
}
