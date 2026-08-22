import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-anilox-dialog',
  standalone: true,
  imports: [
    CommonModule, MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatIconModule, ReactiveFormsModule
  ],
  templateUrl: './create-anilox-dialog.html',
  styleUrls: ['./create-anilox-dialog.scss']
})
export class CreateAniloxDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CreateAniloxDialogComponent>);

  machines = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
  aniloxForm: FormGroup;

  constructor() {
    this.aniloxForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.maxLength(50)]],
      maquina: [null, [Validators.required]],
      bcm: [null, [Validators.required, Validators.min(1)]],
      lineatura: [null, [Validators.required, Validators.min(1)]],
      marca: ['', [Validators.required]],
      volumenReal: [null, [Validators.required, Validators.min(0.01)]],
      factorEficiencia: [35, [Validators.min(0), Validators.max(100)]],
      densidad: [0.885, [Validators.min(0)]]
    });
  }

  onCancel(): void { this.dialogRef.close(); }

  onCreate(): void {
    if (this.aniloxForm.valid) this.dialogRef.close(this.aniloxForm.value);
  }
}
