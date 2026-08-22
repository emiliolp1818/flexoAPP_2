import { Component, inject, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PantoneLiveService, PantoneColor } from '../../../services/pantone-live.service';

export interface PantoneDialogData {
  mode: 'create' | 'edit';
  color?: PantoneColor;
}

@Component({
  selector: 'app-create-pantone-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatSelectModule,
    MatSnackBarModule
  ],
  templateUrl: './create-pantone-dialog.html',
  styleUrls: ['./create-pantone-dialog.scss']
})
export class CreatePantoneDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<CreatePantoneDialogComponent>);
  private pantoneService = inject(PantoneLiveService);
  private snackBar = inject(MatSnackBar);

  isEditMode = false;
  editId: number | null = null;

  mode: 'picker' | 'lab' = 'picker';
  colorCode = '';
  colorName = '';
  colorType: 'pantone' | 'heptacromia' | 'laca' = 'pantone';
  selectedHex = '#FF0000';
  rgbR = 255;
  rgbG = 0;
  rgbB = 0;
  labL = 50;
  labA = 0;
  labB = 0;

  constructor(@Inject(MAT_DIALOG_DATA) public data: PantoneDialogData | null) {}

  ngOnInit() {
    if (this.data?.mode === 'edit' && this.data.color) {
      this.isEditMode = true;
      this.editId = this.data.color.id || null;
      this.colorCode = this.data.color.code;
      this.colorName = this.data.color.name;
      this.colorType = this.data.color.colorType;
      this.selectedHex = this.data.color.hex;
      this.rgbR = this.data.color.rgb.r;
      this.rgbG = this.data.color.rgb.g;
      this.rgbB = this.data.color.rgb.b;
      if (this.data.color.lab?.l != null) {
        this.mode = 'lab';
        this.labL = this.data.color.lab.l || 0;
        this.labA = this.data.color.lab.a || 0;
        this.labB = this.data.color.lab.b || 0;
      }
    }
  }

  onHexChange() {
    const hex = this.selectedHex;
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      this.rgbR = parseInt(hex.slice(1, 3), 16);
      this.rgbG = parseInt(hex.slice(3, 5), 16);
      this.rgbB = parseInt(hex.slice(5, 7), 16);
    }
  }

  onRgbChange() {
    this.rgbR = Math.max(0, Math.min(255, this.rgbR || 0));
    this.rgbG = Math.max(0, Math.min(255, this.rgbG || 0));
    this.rgbB = Math.max(0, Math.min(255, this.rgbB || 0));
    this.selectedHex = '#' +
      this.rgbR.toString(16).padStart(2, '0') +
      this.rgbG.toString(16).padStart(2, '0') +
      this.rgbB.toString(16).padStart(2, '0');
    this.selectedHex = this.selectedHex.toUpperCase();
  }

  onLabChange() {
    const l = this.labL || 0;
    const a = this.labA || 0;
    const b = this.labB || 0;

    let y2 = (l + 16) / 116;
    let x = a / 500 + y2;
    let z = y2 - b / 200;

    const delta = 6 / 29;
    x = x > delta ? x * x * x : (x - 16 / 116) * 3 * delta * delta;
    y2 = y2 > delta ? y2 * y2 * y2 : (y2 - 16 / 116) * 3 * delta * delta;
    z = z > delta ? z * z * z : (z - 16 / 116) * 3 * delta * delta;

    x *= 0.95047;
    z *= 1.08883;

    let r = x * 3.2406 + y2 * -1.5372 + z * -0.4986;
    let g = x * -0.9689 + y2 * 1.8758 + z * 0.0415;
    let bVal = x * 0.0557 + y2 * -0.2040 + z * 1.0570;

    r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
    g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
    bVal = bVal > 0.0031308 ? 1.055 * Math.pow(bVal, 1 / 2.4) - 0.055 : 12.92 * bVal;

    this.rgbR = Math.max(0, Math.min(255, Math.round(r * 255)));
    this.rgbG = Math.max(0, Math.min(255, Math.round(g * 255)));
    this.rgbB = Math.max(0, Math.min(255, Math.round(bVal * 255)));

    this.selectedHex = '#' +
      this.rgbR.toString(16).padStart(2, '0') +
      this.rgbG.toString(16).padStart(2, '0') +
      this.rgbB.toString(16).padStart(2, '0');
    this.selectedHex = this.selectedHex.toUpperCase();
  }

  getContrastColor(hex: string): string {
    return this.pantoneService.getContrastColor(hex);
  }

  async onSave() {
    if (!this.colorCode?.trim() || !this.selectedHex) return;

    const code = this.colorCode.trim();
    const displayName = `P ${code}`;
    const name = this.colorName?.trim() || `Pantone ${code}`;

    // Incluir CMYK del color original si estamos editando (para no perderlos)
    const existingCmyk = this.data?.color?.cmyk;

    const colorData = {
      code,
      name,
      displayName,
      hex: this.selectedHex,
      rgbR: this.rgbR,
      rgbG: this.rgbG,
      rgbB: this.rgbB,
      cmykC: existingCmyk?.c ?? 0,
      cmykM: existingCmyk?.m ?? 0,
      cmykY: existingCmyk?.y ?? 0,
      cmykK: existingCmyk?.k ?? 0,
      labL: this.mode === 'lab' ? this.labL : null,
      labA: this.mode === 'lab' ? this.labA : null,
      labB: this.mode === 'lab' ? this.labB : null,
      category: 'Manual',
      colorType: this.colorType
    };

    try {
      let result: PantoneColor;
      if (this.isEditMode && this.editId) {
        result = await this.pantoneService.updateColor(this.editId, colorData);
        this.snackBar.open(`Color "${displayName}" actualizado`, 'OK', {
          duration: 3000, panelClass: ['success-snackbar']
        });
      } else {
        result = await this.pantoneService.createColor(colorData);
        this.snackBar.open(`Color "${displayName}" creado`, 'OK', {
          duration: 3000, panelClass: ['success-snackbar']
        });
      }
      this.dialogRef.close(result);
    } catch (err: any) {
      const msg = err?.error?.message || 'Error al guardar el color';
      this.snackBar.open(msg, 'Cerrar', {
        duration: 4000, panelClass: ['error-snackbar']
      });
    }
  }
}
