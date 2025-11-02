import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-documento',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="documento-container">
      <h1>Documentos</h1>
      <p>Gestión de documentos del sistema</p>
    </div>
  `,
  styles: [`
    .documento-container {
      padding: 20px;
    }
  `]
})
export class DocumentoComponent {
}