import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { User } from '../../../../core/services/auth.service';

interface DialogData {
  mode: 'create' | 'edit';
  user?: User;
}

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule
  ],
  templateUrl: './user-dialog.html',
  styleUrls: ['./user-dialog.scss']
})
export class UserDialogComponent implements OnInit {
  userForm: FormGroup;
  isEditMode: boolean;
  
  roles = [
    { value: 'Admin', label: 'Administrador' },
    { value: 'Supervisor', label: 'Supervisor' },
    { value: 'Operario', label: 'Operario' },
    { value: 'Matizadores', label: 'Matizadores' },
    { value: 'Prealistador', label: 'Prealistador' },
    { value: 'Retornos', label: 'Retornos' }
  ];



  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.isEditMode = data.mode === 'edit';
    this.userForm = this.createForm();
  }

  ngOnInit() {
    if (this.isEditMode && this.data.user) {
      this.userForm.patchValue({
        userCode: this.data.user.userCode,
        firstName: this.data.user.firstName,
        lastName: this.data.user.lastName,
        phone: this.data.user.phone || '',
        role: this.data.user.role,
        isActive: this.data.user.isActive
      });
      
      // Disable userCode in edit mode
      this.userForm.get('userCode')?.disable();
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      userCode: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phone: [''],
      role: ['', Validators.required],
      isActive: [true]
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;
      
      // Include userCode for edit mode (even though it's disabled)
      if (this.isEditMode && this.data.user) {
        formValue.userCode = this.data.user.userCode;
      }
      
      // Remove password if empty in edit mode
      if (this.isEditMode && !formValue.password) {
        delete formValue.password;
      }
      
      this.dialogRef.close(formValue);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  getTitle(): string {
    return this.isEditMode ? 'Editar Usuario' : 'Crear Nuevo Usuario';
  }

  getSubmitButtonText(): string {
    return this.isEditMode ? 'Actualizar' : 'Crear';
  }
}