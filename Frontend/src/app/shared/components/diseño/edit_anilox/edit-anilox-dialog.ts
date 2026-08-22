import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-anilox-dialog',
  standalone: true,
  imports: [
    CommonModule, MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatIconModule, ReactiveFormsModule
  ],
  templateUrl: './edit-anilox-dialog.html',
  styleUrls: ['./edit-anilox-dialog.scss']
})
export class EditAniloxDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<EditAniloxDialogComponent>);

  machines = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
  aniloxForm: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.aniloxForm = this.fb.group({
      codigo: [data.codigo || '', [Validators.required, Validators.maxLength(50)]],
      maquina: [data.maquina || null, [Validators.required]],
      bcm: [data.bcm || null, [Validators.required, Validators.min(1)]],
      lineatura: [data.lineatura || null, [Validators.required, Validators.min(1)]],
      marca: [data.marca || '', [Validators.required]],
      volumenReal: [data.volumen_real || null, [Validators.required, Validators.min(0.01)]],
      factorEficiencia: [data.factor_eficiencia || null, [Validators.min(0), Validators.max(100)]],
      densidad: [data.densidad || null, [Validators.min(0)]]
    });
  }

  onDensidadInput(event: any): void {
    let value = event.target.value;
    if (value.includes(',')) { value = value.replace(',', '.'); event.target.value = value; }
    if (value === '' || value === null) {
      this.aniloxForm.patchValue({ densidad: null }, { emitEvent: false });
    } else {
      const numValue = Number(value);
      if (!isNaN(numValue) && isFinite(numValue)) {
        this.aniloxForm.patchValue({ densidad: numValue }, { emitEvent: false });
      }
    }
  }

  onFactorEficienciaInput(event: any): void {
    let value = event.target.value;
    if (value.includes(',')) { value = value.replace(',', '.'); event.target.value = value; }
    if (value === '' || value === null) {
      this.aniloxForm.patchValue({ factorEficiencia: null }, { emitEvent: false });
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        this.aniloxForm.patchValue({ factorEficiencia: numValue }, { emitEvent: false });
      }
    }
  }

  onCancel(): void { this.dialogRef.close(); }

  onUpdate(): void {
    const requiredFields = ['codigo', 'maquina', 'bcm', 'lineatura', 'marca', 'volumenReal'];
    const missingFields = requiredFields.filter(field => {
      const value = this.aniloxForm.get(field)?.value;
      return value === null || value === undefined || value === '';
    });
    if (missingFields.length > 0) return;

    const v = this.aniloxForm.value;
    this.dialogRef.close({
      codigo: v.codigo, maquina: v.maquina, bcm: v.bcm,
      lineatura: v.lineatura, marca: v.marca, volumenReal: v.volumenReal,
      factorEficiencia: v.factorEficiencia, densidad: v.densidad
    });
  }
}
