import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="settings-container">
      <h1>Configuración</h1>
      <p>Configuración del sistema</p>
    </div>
  `,
  styles: [`
    .settings-container {
      padding: 20px;
    }
  `]
})
export class SettingsComponent {
}