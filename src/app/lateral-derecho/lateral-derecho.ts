import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-lateral-derecho',
  imports: [NgOptimizedImage],
  templateUrl: './lateral-derecho.html',
  styleUrl: './lateral-derecho.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LateralDerecho {}
