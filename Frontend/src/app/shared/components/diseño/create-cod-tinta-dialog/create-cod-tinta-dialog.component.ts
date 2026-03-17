import { Component, inject, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PantoneLiveService, PantoneColor } from '../../../services/pantone-live.service';

@Component({
  selector: 'app-create-cod-tinta-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>colorize</mat-icon>
      {{ isEditMode ? 'Editar' : 'Crear' }} Registro de Código de Tintas
    </h2>

    <mat-dialog-content>
      <form [formGroup]="codTintaForm" class="dialog-form">
        
        <!-- Artículo -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Artículo F</mat-label>
          <input 
            matInput 
            formControlName="articulo" 
            placeholder="Ej: F12345"
            required>
          <mat-icon matSuffix *ngIf="!searchingDesign">tag</mat-icon>
          <mat-spinner matSuffix *ngIf="searchingDesign" diameter="20"></mat-spinner>
          <mat-error *ngIf="codTintaForm.get('articulo')?.hasError('required')">
            El artículo es requerido
          </mat-error>
          <mat-hint *ngIf="designFound" class="success-hint">
            <mat-icon>check_circle</mat-icon>
            Diseño encontrado - Datos cargados automáticamente
          </mat-hint>
          <mat-hint *ngIf="designNotFound && !searchingDesign" class="info-hint">
            <mat-icon>info</mat-icon>
            Diseño no encontrado - Complete los datos manualmente
          </mat-hint>
        </mat-form-field>

        <!-- Descripción -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Descripción</mat-label>
          <textarea 
            matInput 
            formControlName="descripcion" 
            placeholder="Descripción del diseño"
            rows="2"
            required></textarea>
          <mat-icon matSuffix>description</mat-icon>
          <mat-error *ngIf="codTintaForm.get('descripcion')?.hasError('required')">
            La descripción es requerida
          </mat-error>
        </mat-form-field>

        <!-- Número de colores -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Número de Colores</mat-label>
          <input 
            matInput 
            type="number"
            formControlName="numColores" 
            min="1"
            max="12"
            (change)="updateColoresArray()"
            required>
          <mat-icon matSuffix>palette</mat-icon>
          <mat-error *ngIf="codTintaForm.get('numColores')?.hasError('required')">
            El número de colores es requerido
          </mat-error>
          <mat-error *ngIf="codTintaForm.get('numColores')?.hasError('min')">
            Mínimo 1 color
          </mat-error>
          <mat-error *ngIf="codTintaForm.get('numColores')?.hasError('max')">
            Máximo 12 colores
          </mat-error>
        </mat-form-field>

        <!-- Colores dinámicos -->
        <div class="colores-section" formArrayName="colores">
          <h3 class="section-title">
            <mat-icon>palette</mat-icon>
            Colores del Diseño
          </h3>

          <!-- Colores más usados -->
          <div class="most-used-colors" *ngIf="colores.length > 0">
            <span class="section-label">
              <mat-icon>star</mat-icon>
              Más utilizados:
            </span>
            <div class="color-chips">
              <div *ngFor="let color of getMostUsedColors()" 
                   class="color-chip" 
                   [style.background-color]="color.hex"
                   [title]="color.displayName + ' - ' + color.hex" 
                   (click)="selectPantoneColorForFirst(color)">
                <span class="color-code">{{ color.displayName }}</span>
              </div>
            </div>
          </div>
          
          <div *ngFor="let color of colores.controls; let i = index" [formGroupName]="i" class="color-row">
            <div class="color-number">{{ i + 1 }}</div>
            
            <mat-form-field appearance="outline" class="color-field">
              <mat-label>Nombre del Color</mat-label>
              <input 
                matInput 
                formControlName="nombre" 
                placeholder="Ej: PANTONE 185 C"
                [matAutocomplete]="colorAuto"
                (input)="searchPantoneColors($any($event.target).value)"
                required>
              <mat-icon matSuffix>search</mat-icon>
              <mat-error>Requerido</mat-error>

              <mat-autocomplete #colorAuto="matAutocomplete"
                (optionSelected)="selectPantoneColor(i, $event.option.value)">
                <mat-option *ngFor="let pantoneColor of availablePantoneColors()" 
                            [value]="pantoneColor"
                            class="color-option">
                  <div class="color-option-content">
                    <div class="color-preview" [style.background-color]="pantoneColor.hex"></div>
                    <div class="color-info">
                      <span class="color-name">{{ pantoneColor.displayName }}</span>
                      <span class="color-hex">{{ pantoneColor.hex }}</span>
                    </div>
                  </div>
                </mat-option>
              </mat-autocomplete>
            </mat-form-field>

            <div class="color-swatch-preview" 
                 [style.background-color]="getColorHex(i)"
                 [title]="getColorName(i) + ' — ' + getColorHex(i)">
            </div>

            <mat-form-field appearance="outline" class="small-field">
              <mat-label>Cód. Tinta</mat-label>
              <input 
                matInput 
                formControlName="codTinta" 
                placeholder="Código">
            </mat-form-field>

            <mat-form-field appearance="outline" class="small-field">
              <mat-label>Cobertura %</mat-label>
              <input 
                matInput 
                type="number"
                formControlName="cobertura" 
                min="0"
                max="100"
                step="0.01"
                placeholder="0.00">
            </mat-form-field>

            <mat-form-field appearance="outline" class="small-field">
              <mat-label>Cód. Anilox</mat-label>
              <input 
                matInput 
                formControlName="codAnilox" 
                placeholder="Código">
            </mat-form-field>
          </div>
        </div>

      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">
        <mat-icon>close</mat-icon>
        Cancelar
      </button>
      <button 
        mat-raised-button 
        color="primary" 
        (click)="onSave()"
        [disabled]="!codTintaForm.valid || searchingDesign">
        <mat-icon>{{ isEditMode ? 'save' : 'add' }}</mat-icon>
        {{ isEditMode ? 'Guardar' : 'Crear' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-form {
      min-width: 700px;
      max-width: 900px;
      padding: 20px 0;
      max-height: 70vh;
      overflow-y: auto;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .success-hint {
      color: #10b981;
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 500;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }

    .info-hint {
      color: #3b82f6;
      display: flex;
      align-items: center;
      gap: 4px;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }

    .colores-section {
      margin-top: 24px;
      padding: 16px;
      background: #f8fafc;
      border-radius: 8px;
    }

    .most-used-colors {
      margin-bottom: 20px;
      padding: 12px;
      background: white;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
    }

    .section-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 600;
      color: #64748b;
      margin-bottom: 8px;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: #f59e0b;
      }
    }

    .color-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .color-chip {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      border: 2px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        border-color: rgba(255, 255, 255, 0.5);
      }
    }

    .color-code {
      font-size: 11px;
      font-weight: 600;
      color: white;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
      white-space: nowrap;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #1e293b;
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 16px 0;

      mat-icon {
        color: #3b82f6;
      }
    }

    .color-row {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 12px;
      padding: 12px;
      background: white;
      border-radius: 6px;
      border-left: 3px solid #3b82f6;
    }

    .color-number {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: #3b82f6;
      color: white;
      border-radius: 50%;
      font-weight: 700;
      font-size: 14px;
      flex-shrink: 0;
      margin-top: 8px;
    }

    .color-field {
      flex: 2;
      min-width: 200px;
    }

    .color-swatch-preview {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      border: 2px solid #e2e8f0;
      flex-shrink: 0;
      margin-top: 4px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: all 0.2s;

      &:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }
    }

    .small-field {
      flex: 1;
      min-width: 100px;
    }

    ::ng-deep .color-option {
      .color-option-content {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 4px 0;
      }

      .color-preview {
        width: 32px;
        height: 32px;
        border-radius: 6px;
        border: 2px solid #e2e8f0;
        flex-shrink: 0;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .color-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .color-name {
        font-weight: 500;
        font-size: 14px;
        color: #1e293b;
      }

      .color-hex {
        font-size: 12px;
        color: #64748b;
        font-family: 'Courier New', monospace;
      }
    }

    h2 {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #1e293b;

      mat-icon {
        color: #3b82f6;
      }
    }

    mat-dialog-actions {
      padding: 16px 24px;
      margin: 0;

      button {
        mat-icon {
          margin-right: 4px;
        }
      }
    }

    ::ng-deep .mat-mdc-form-field {
      .mat-mdc-text-field-wrapper {
        background: white;
      }
    }

    mat-spinner {
      display: inline-block;
    }
  `]
})
export class CreateCodTintaDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<CreateCodTintaDialogComponent>);
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private pantoneService = inject(PantoneLiveService);

  codTintaForm!: FormGroup;
  isEditMode = false;
  searchingDesign = false;
  designFound = false;
  designNotFound = false;

  // Pantone colors
  availablePantoneColors = signal<PantoneColor[]>([]);
  selectedPantoneColors = signal<Map<number, PantoneColor>>(new Map());

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit() {
    this.isEditMode = this.data?.mode === 'edit';
    
    // Cargar colores Pantone
    this.loadPantoneColors();
    
    this.codTintaForm = this.fb.group({
      articulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      numColores: [1, [Validators.required, Validators.min(1), Validators.max(12)]],
      colores: this.fb.array([])
    });

    // Si es modo edición, cargar datos
    if (this.isEditMode && this.data?.record) {
      this.loadRecordData(this.data.record);
    } else {
      // Crear un color por defecto
      this.updateColoresArray();
      
      // Escuchar cambios en el campo artículo para buscar diseño
      this.codTintaForm.get('articulo')?.valueChanges
        .pipe(
          debounceTime(500),
          distinctUntilChanged()
        )
        .subscribe(articulo => {
          if (articulo && articulo.trim().length >= 3) {
            this.searchDesignByArticle(articulo.trim().toUpperCase());
          }
        });
    }
  }

  loadPantoneColors() {
    const colors = this.pantoneService.getAllColors();
    this.availablePantoneColors.set(colors);
  }

  getMostUsedColors(): PantoneColor[] {
    return this.pantoneService.getMostUsedColors();
  }

  searchPantoneColors(searchTerm: string) {
    const results = searchTerm.trim()
      ? this.pantoneService.searchByCode(searchTerm)
      : this.pantoneService.getAllColors();
    
    this.availablePantoneColors.set(results.slice(0, 50)); // Limitar a 50 resultados
  }

  selectPantoneColor(index: number, pantoneColor: PantoneColor) {
    const colorControl = this.colores.at(index);
    if (colorControl) {
      colorControl.patchValue({
        nombre: pantoneColor.displayName
      });
      
      // Guardar el color Pantone seleccionado
      const currentMap = new Map(this.selectedPantoneColors());
      currentMap.set(index, pantoneColor);
      this.selectedPantoneColors.set(currentMap);
    }
  }

  selectPantoneColorForFirst(pantoneColor: PantoneColor) {
    if (this.colores.length > 0) {
      this.selectPantoneColor(0, pantoneColor);
    }
  }

  getColorHex(index: number): string {
    const colorMap = this.selectedPantoneColors();
    const pantoneColor = colorMap.get(index);
    
    if (pantoneColor) {
      return pantoneColor.hex;
    }
    
    // Intentar obtener del nombre del color
    const colorControl = this.colores.at(index);
    if (colorControl) {
      const colorName = colorControl.get('nombre')?.value;
      if (colorName) {
        const color = this.pantoneService.getOrCreateColor(colorName);
        return color.hex;
      }
    }
    
    return '#cccccc';
  }

  getColorName(index: number): string {
    const colorControl = this.colores.at(index);
    return colorControl?.get('nombre')?.value || 'Sin nombre';
  }

  get colores(): FormArray {
    return this.codTintaForm.get('colores') as FormArray;
  }

  async searchDesignByArticle(articulo: string) {
    this.searchingDesign = true;
    this.designFound = false;
    this.designNotFound = false;

    try {
      // Buscar diseño en el backend
      const response = await this.http.get<any>(`${environment.apiUrl}/designs/search`, {
        params: { search: articulo }
      }).toPromise();

      if (response && response.length > 0) {
        // Buscar coincidencia exacta
        const design = response.find((d: any) => 
          d.articleF.toUpperCase() === articulo.toUpperCase()
        );

        if (design) {
          console.log('✅ Diseño encontrado:', design);
          this.designFound = true;
          this.autoFillFromDesign(design);
        } else {
          this.designNotFound = true;
        }
      } else {
        this.designNotFound = true;
      }
    } catch (error) {
      console.error('Error buscando diseño:', error);
      this.designNotFound = true;
    } finally {
      this.searchingDesign = false;
    }
  }

  autoFillFromDesign(design: any) {
    // Rellenar descripción
    this.codTintaForm.patchValue({
      descripcion: design.description || '',
      numColores: design.colors?.length || 1
    });

    // Limpiar colores actuales
    while (this.colores.length > 0) {
      this.colores.removeAt(0);
    }

    // Limpiar mapa de colores Pantone
    this.selectedPantoneColors.set(new Map());

    // Agregar colores del diseño
    if (design.colors && design.colors.length > 0) {
      design.colors.forEach((colorName: string, index: number) => {
        this.colores.push(this.createColorFormGroup({
          nombre: colorName,
          codTinta: '',
          cobertura: null,
          codAnilox: ''
        }));

        // Obtener el color Pantone correspondiente
        const pantoneColor = this.pantoneService.getOrCreateColor(colorName);
        const currentMap = new Map(this.selectedPantoneColors());
        currentMap.set(index, pantoneColor);
        this.selectedPantoneColors.set(currentMap);
      });
    } else {
      this.updateColoresArray();
    }
  }

  loadRecordData(record: any) {
    this.codTintaForm.patchValue({
      articulo: record.articulo,
      descripcion: record.descripcion,
      numColores: record.colores?.length || 1
    });

    // Limpiar mapa de colores Pantone
    this.selectedPantoneColors.set(new Map());

    // Cargar colores
    if (record.colores && record.colores.length > 0) {
      record.colores.forEach((color: any, index: number) => {
        this.colores.push(this.createColorFormGroup(color));

        // Obtener el color Pantone correspondiente
        if (color.nombre) {
          const pantoneColor = this.pantoneService.getOrCreateColor(color.nombre);
          const currentMap = new Map(this.selectedPantoneColors());
          currentMap.set(index, pantoneColor);
          this.selectedPantoneColors.set(currentMap);
        }
      });
    } else {
      this.updateColoresArray();
    }

    // Marcar el formulario como tocado para habilitar el botón guardar
    // Esto es necesario en modo edición para que el botón se habilite inmediatamente
    this.codTintaForm.markAsTouched();
    this.codTintaForm.markAsDirty();
  }

  createColorFormGroup(color?: any): FormGroup {
    return this.fb.group({
      nombre: [color?.nombre || '', Validators.required],
      codTinta: [color?.codTinta || ''],
      cobertura: [color?.cobertura || null],
      codAnilox: [color?.codAnilox || '']
    });
  }

  updateColoresArray() {
    const numColores = this.codTintaForm.get('numColores')?.value || 1;
    const currentLength = this.colores.length;

    if (numColores > currentLength) {
      // Agregar colores
      for (let i = currentLength; i < numColores; i++) {
        this.colores.push(this.createColorFormGroup());
      }
    } else if (numColores < currentLength) {
      // Remover colores
      for (let i = currentLength - 1; i >= numColores; i--) {
        this.colores.removeAt(i);
      }
    }
  }

  onSave() {
    if (this.codTintaForm.valid) {
      const formValue = this.codTintaForm.value;
      this.dialogRef.close({
        articulo: formValue.articulo.trim().toUpperCase(),
        descripcion: formValue.descripcion.trim(),
        colores: formValue.colores
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
