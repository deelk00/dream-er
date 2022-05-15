import { Component } from '@angular/core';
import { TestRenderElement } from './shared-module/model/test-render-element';
import { WorkSheet } from './shared-module/model/work-sheet.class';
import { CanvasManagerService } from './shared-module/services/canvas-manager/canvas-manager.service';
import { MeshRenderer } from './shared-module/model/render-components/mesh-renderer';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'test-2';
  workSheet = new WorkSheet();

  a: TestRenderElement;
  b: TestRenderElement;

  constructor(private canvasManagerService: CanvasManagerService) {

    this.a = TestRenderElement.create();
    this.b = TestRenderElement.create();

    this.a.fillColor = "#0000ff";
    this.a.strokeColor = "#00ff00";
    this.a.zIndex = -1;

    this.b.fillColor = "#fff000";
    this.b.strokeColor = "#000";

    this.workSheet.addElement(this.a);
    this.workSheet.addElement(this.b);

    this.canvasManagerService.addWorkSheet(this.workSheet);

    const meshRenderer = this.b.getComponent(MeshRenderer);

    meshRenderer.selectedStrokeColor = "#aaaaff";
  }
}
