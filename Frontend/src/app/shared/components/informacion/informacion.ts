import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-informacion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="informacion-container">
      <h1>Información</h1>
      <p>Información del sistema FlexoAPP</p>
    </div>
  `,
  styles: [`
    .informacion-container {
      padding: 20px;
    }
  `]
})
export class InformacionComponent {
}