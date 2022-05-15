import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CanvasManagerService } from '../../shared-module/services/canvas-manager/canvas-manager.service';
import { WorkSheet } from '../../shared-module/model/work-sheet.class';

@Component({
  selector: 'app-work-area',
  templateUrl: './work-area.component.html',
  styleUrls: ['./work-area.component.scss']
})
export class WorkAreaComponent implements OnInit, AfterViewInit {
  @Input() workSheet!: WorkSheet;

  canvasResizeObserver!: ResizeObserver;
  @ViewChild("workArea") canvas!: ElementRef<HTMLCanvasElement>


  constructor(
    private canvasManagerService: CanvasManagerService
  ) {

  }

  ngAfterViewInit(): void {
    this.workSheet ??= new WorkSheet();
    this.canvasManagerService.addContext(this.workSheet.id, this.canvas.nativeElement.getContext("2d")!)
  }

  ngOnInit(): void {
  }

}
