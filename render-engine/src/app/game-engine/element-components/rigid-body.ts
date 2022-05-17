import { DreamComponent } from "src/app/shared-module/model/render-element.class";
import { WorkSheet } from "src/app/shared-module/model/work-sheet.class";
import { CanvasMeta, Key } from "src/app/shared-module/services/canvas-manager/canvas-manager.service";
import { IPoint } from '../../shared-module/model/point.interface';
import { IKeyboardEvent } from '../../shared-module/model/render-element.class';

export class RigidBody extends DreamComponent {
    gravitation: number = 9.81;
    velocity: IPoint = {
        x: 0,
        y: 0
    }

    update = (workSheet: WorkSheet, meta: CanvasMeta) => {
        this.upd(meta, 30);
    };

    upd = (meta: CanvasMeta, delta: number) => {
        this.velocity.y += this.gravitation * (delta / 1000);

        this.attachedElement.position.y += this.velocity.y;
    }

    override keyDown? = (e: IKeyboardEvent) => {
        if(e.canvasService.isPressed(Key.Space)) {
            this.velocity.y += -10;
        }
        console.log("awd");
        
    }
}