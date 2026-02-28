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
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="edit-anilox-dialog">
      <div class="dialog-header">
        <div class="dialog-title">
          <mat-icon>edit</mat-icon>
          <h2>Editar Anilox</h2>
        </div>
        <button mat-icon-button (click)="onCancel()" class="dialog-close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="dialog-content">
        <form [formGroup]="aniloxForm" class="anilox-form">

          <!-- Fila 1: Código y Máquina -->
          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Código *</mat-label>
              <input matInput formControlName="codigo" placeholder="Ej: 1164" type="text">
              <mat-icon matSuffix>tag</mat-icon>
              <mat-error *ngIf="aniloxForm.get('codigo')?.hasError('required')">
                El código es requerido
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Máquina *</mat-label>
              <mat-select formControlName="maquina">
                <mat-option *ngFor="let maq of machines" [value]="maq">
                  MQ {{ maq }}
                </mat-option>
              </mat-select>
              <mat-icon matSuffix>precision_manufacturing</mat-icon>
              <mat-error *ngIf="aniloxForm.get('maquina')?.hasError('required')">
                La máquina es requerida
              </mat-error>
            </mat-form-field>
          </div>

          <!-- Fila 2: BCM y Lineatura -->
          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>BCM *</mat-label>
              <input matInput formControlName="bcm" placeholder="Ej: 400" type="number" min="1">
              <mat-icon matSuffix>water_drop</mat-icon>
              <mat-error *ngIf="aniloxForm.get('bcm')?.hasError('required')">
                El BCM es requerido
              </mat-error>
              <mat-error *ngIf="aniloxForm.get('bcm')?.hasError('min')">
                El BCM debe ser mayor a 0
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Lineatura (LPI) *</mat-label>
              <input matInput formControlName="lineatura" placeholder="Ej: 4" type="number" min="1">
              <mat-icon matSuffix>grid_4x4</mat-icon>
              <mat-error *ngIf="aniloxForm.get('lineatura')?.hasError('required')">
                La lineatura es requerida
              </mat-error>
              <mat-error *ngIf="aniloxForm.get('lineatura')?.hasError('min')">
                La lineatura debe ser mayor a 0
              </mat-error>
            </mat-form-field>
          </div>

          <!-- Fila 3: Marca y Volumen Real -->
          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Marca *</mat-label>
              <mat-select formControlName="marca">
                <mat-option value="APEX">APEX</mat-option>
                <mat-option value="ZECHER">ZECHER</mat-option>
                <mat-option value="HARPER">HARPER</mat-option>
              </mat-select>
              <mat-icon matSuffix>business</mat-icon>
              <mat-error *ngIf="aniloxForm.get('marca')?.hasError('required')">
                La marca es requerida
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Volumen Real *</mat-label>
              <input matInput formControlName="volumenReal" placeholder="Ej: 3.5" type="number" step="0.01" min="0.01">
              <mat-icon matSuffix>science</mat-icon>
              <mat-error *ngIf="aniloxForm.get('volumenReal')?.hasError('required')">
                El volumen real es requerido
              </mat-error>
              <mat-error *ngIf="aniloxForm.get('volumenReal')?.hasError('min')">
                El volumen real debe ser mayor a 0
              </mat-error>
            </mat-form-field>
          </div>

          <!-- Fila 4: Factor Eficiencia y Densidad -->
          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Factor Eficiencia (%)</mat-label>
              <input matInput formControlName="factorEficiencia" placeholder="Ej: 0.20, 35, 85.5" type="number" step="0.01" min="0" max="100"
                     (input)="onFactorEficienciaInput($event)" (blur)="formatFactorEficiencia()">
              <mat-icon matSuffix>speed</mat-icon>
              <mat-hint>Acepta decimales: 0.20, 35.00, etc.</mat-hint>
              <mat-error *ngIf="aniloxForm.get('factorEficiencia')?.hasError('min')">
                El factor debe ser mayor o igual a 0
              </mat-error>
              <mat-error *ngIf="aniloxForm.get('factorEficiencia')?.hasError('max')">
                El factor debe ser menor o igual a 100
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Densidad</mat-label>
              <input matInput formControlName="densidad" placeholder="Ej: 0.889" type="text"
                     (input)="onDensidadInput($event)">
              <mat-icon matSuffix>opacity</mat-icon>
              <mat-error *ngIf="aniloxForm.get('densidad')?.hasError('min')">
                La densidad debe ser mayor o igual a 0
              </mat-error>
              <mat-error *ngIf="aniloxForm.get('densidad')?.hasError('pattern')">
                Formato inválido. Usa números con hasta 3 decimales
              </mat-error>
            </mat-form-field>
          </div>

        </form>
      </div>

      <div class="dialog-footer">
        <button mat-stroked-button (click)="onCancel()" class="cancel-btn">
          <mat-icon>close</mat-icon>
          Cancelar
        </button>
        <button mat-raised-button color="primary" (click)="onUpdate()"
                class="save-btn">
          <mat-icon>save</mat-icon>
          Guardar Cambios
        </button>
      </div>
    </div>
  `,
  styles: [`
    .edit-anilox-dialog {
      width: 600px;
      max-width: 90vw;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      border-radius: 16px 16px 0 0;

      .dialog-title {
        display: flex;
        align-items: center;
        gap: 12px;

        mat-icon {
          font-size: 28px;
          width: 28px;
          height: 28px;
        }

        h2 {
          margin: 0;
          font-size: 1.4rem;
          font-weight: 600;
        }
      }

      .dialog-close-btn {
        color: white;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        transition: all 0.2s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.1);
        }

        mat-icon {
          font-size: 24px;
          width: 24px;
          height: 24px;
        }
      }
    }

    .dialog-content {
      padding: 24px;
      background: #f8fafc;
      max-height: 60vh;
      overflow-y: auto;

      &::-webkit-scrollbar {
        width: 8px;
      }

      &::-webkit-scrollbar-track {
        background: rgba(226, 232, 240, 0.5);
        border-radius: 4px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(59, 130, 246, 0.6);
        border-radius: 4px;

        &:hover {
          background: rgba(59, 130, 246, 0.8);
        }
      }
    }

    .anilox-form {
      .form-row {
        display: flex;
        gap: 16px;
        margin-bottom: 16px;

        &:last-child {
          margin-bottom: 0;
        }

        .half-width {
          flex: 1;
        }

        @media (max-width: 600px) {
          flex-direction: column;
          gap: 12px;

          .half-width {
            width: 100%;
          }
        }
      }

      mat-form-field {
        ::ng-deep .mat-mdc-text-field-wrapper {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          transition: all 0.3s ease;

          &:hover {
            border-color: rgba(59, 130, 246, 0.3);
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
          }
        }

        &.mat-focused ::ng-deep .mat-mdc-text-field-wrapper {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
        }

        ::ng-deep .mat-mdc-floating-label {
          color: #64748b;
          font-weight: 600;
        }

        &.mat-focused ::ng-deep .mat-mdc-floating-label {
          color: #3b82f6;
        }

        ::ng-deep .mat-mdc-input-element {
          color: #1e293b;
          font-weight: 500;
        }

        mat-icon {
          color: #3b82f6;
        }
      }
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 20px 24px;
      background: white;
      border-top: 1px solid #e2e8f0;

      .cancel-btn {
        color: #64748b;
        border: 1px solid #cbd5e1;
        transition: all 0.2s ease;

        &:hover {
          background: #f1f5f9;
          border-color: #94a3b8;
        }
      }

      .save-btn {
        background: #3b82f6;
        color: white;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        transition: all 0.2s ease;

        &:hover:not(:disabled) {
          background: #2563eb;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }
    }
  `]
})
export class EditAniloxDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<EditAniloxDialogComponent>);

  machines = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

  aniloxForm: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    console.log('🔵 EditAniloxDialogComponent - Data recibida:', data);

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


    this.aniloxForm.statusChanges.subscribe(status => {
      console.log('📝 Form status:', status);
      console.log('📝 Form valid:', this.aniloxForm.valid);
      console.log('📝 Form errors:', this.aniloxForm.errors);
      console.log('📝 Form values:', this.aniloxForm.value);


      Object.keys(this.aniloxForm.controls).forEach(key => {
        const control = this.aniloxForm.get(key);
        if (control && control.errors) {
          console.log(`❌ Campo ${key} tiene errores:`, control.errors);
        }
      });
    });


    console.log('📝 Form inicial valid:', this.aniloxForm.valid);
    console.log('📝 Form inicial values:', this.aniloxForm.value);
  }

  onDensidadInput(event: any): void {
    let value = event.target.value;
    console.log('📝 Densidad input original:', value, 'tipo:', typeof value);


    if (value.includes(',')) {
      value = value.replace(',', '.');
      console.log('📝 Densidad convertida:', value);

      event.target.value = value;
    }


    if (value === '' || value === null) {
      this.aniloxForm.patchValue({ densidad: null }, { emitEvent: false });
      console.log('📝 Densidad: null');
    } else {

      const numValue = Number(value);
      if (!isNaN(numValue) && isFinite(numValue)) {
        this.aniloxForm.patchValue({ densidad: numValue }, { emitEvent: false });
        console.log('📝 Densidad guardada:', numValue);
        console.log('📝 Densidad con máxima precisión:', numValue.toString());
        console.log('📝 Densidad toFixed(3):', numValue.toFixed(3));
        console.log('📝 Densidad === 0.889:', numValue === 0.889);
      }
    }
  }

  formatDensidad(): void {


  }

  onFactorEficienciaInput(event: any): void {
    let value = event.target.value;
    console.log('📝 Factor Eficiencia input original:', value);


    if (value.includes(',')) {
      value = value.replace(',', '.');
      console.log('📝 Factor Eficiencia convertida:', value);

      event.target.value = value;
    }


    if (value === '' || value === null) {
      this.aniloxForm.patchValue({ factorEficiencia: null }, { emitEvent: false });
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {

        this.aniloxForm.patchValue({ factorEficiencia: numValue }, { emitEvent: false });
        console.log('📝 Factor Eficiencia guardado en formulario (SIN redondeo):', numValue);
      }
    }
  }

  formatFactorEficiencia(): void {


  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onUpdate(): void {
    console.log('🔵 ===== INICIO onUpdate =====');
    console.log('📝 Form valid:', this.aniloxForm.valid);
    console.log('📝 Form value completo:', this.aniloxForm.value);


    const requiredFields = ['codigo', 'maquina', 'bcm', 'lineatura', 'marca', 'volumenReal'];
    const missingFields = requiredFields.filter(field => {
      const value = this.aniloxForm.get(field)?.value;
      return value === null || value === undefined || value === '';
    });

    if (missingFields.length > 0) {
      console.log('❌ Campos requeridos faltantes:', missingFields);
      alert(`Por favor completa los siguientes campos: ${missingFields.join(', ')}`);
      return;
    }


    const formValue = this.aniloxForm.value;
    const dataToSend = {
      codigo: formValue.codigo,
      maquina: formValue.maquina,
      bcm: formValue.bcm,
      lineatura: formValue.lineatura,
      marca: formValue.marca,
      volumenReal: formValue.volumenReal,
      factorEficiencia: formValue.factorEficiencia,
      densidad: formValue.densidad
    };

    console.log('📤 Datos a enviar al backend:');
    console.log('   - codigo:', dataToSend.codigo);
    console.log('   - maquina:', dataToSend.maquina);
    console.log('   - bcm:', dataToSend.bcm);
    console.log('   - lineatura:', dataToSend.lineatura);
    console.log('   - marca:', dataToSend.marca);
    console.log('   - volumenReal:', dataToSend.volumenReal);
    console.log('   - factorEficiencia:', dataToSend.factorEficiencia, '(tipo:', typeof dataToSend.factorEficiencia, ')');
    console.log('   - densidad:', dataToSend.densidad, '(tipo:', typeof dataToSend.densidad, ')');
    console.log('🔵 ===== FIN onUpdate =====');

    this.dialogRef.close(dataToSend);
  }
}
