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
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatSelectModule,
    MatTooltipModule, MatProgressSpinnerModule, MatAutocompleteModule
  ],
  templateUrl: './create-cod-tinta-dialog.html',
  styleUrls: ['./create-cod-tinta-dialog.scss']
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

  availablePantoneColors = signal<PantoneColor[]>([]);
  selectedPantoneColors = signal<Map<number, PantoneColor>>(new Map());
  allLineasTinta: string[] = [];
  filteredLineasTinta = signal<string[]>([]);

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit() {
    this.isEditMode = this.data?.mode === 'edit';
    this.loadPantoneColors();
    this.loadLineasTinta();

    this.codTintaForm = this.fb.group({
      articulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      estante: [''],
      carpeta: [''],
      numColores: [1, [Validators.required, Validators.min(1), Validators.max(12)]],
      lineaTinta: [''],
      colores: this.fb.array([])
    });

    if (this.isEditMode && this.data?.record) {
      this.loadRecordData(this.data.record);
    } else {
      this.updateColoresArray();
      this.codTintaForm.get('articulo')?.valueChanges
        .pipe(debounceTime(500), distinctUntilChanged())
        .subscribe(articulo => {
          if (articulo && articulo.trim().length >= 3) {
            this.searchDesignByArticle(articulo.trim().toUpperCase());
          }
        });
    }
  }

  loadPantoneColors() {
    this.availablePantoneColors.set(this.pantoneService.getAllColors());
  }

  loadLineasTinta() {
    this.http.get<string[]>(`${environment.apiUrl}/cod-tintas/lineas-tinta`).subscribe({
      next: (lineas) => { this.allLineasTinta = lineas; this.filteredLineasTinta.set(lineas); },
      error: () => { this.allLineasTinta = []; this.filteredLineasTinta.set([]); }
    });
  }

  filterLineasTinta(searchTerm: string) {
    if (!searchTerm.trim()) { this.filteredLineasTinta.set(this.allLineasTinta); return; }
    const term = searchTerm.trim().toLowerCase();
    this.filteredLineasTinta.set(this.allLineasTinta.filter(l => l.toLowerCase().includes(term)));
  }

  searchPantoneColors(searchTerm: string) {
    const results = searchTerm.trim() ? this.pantoneService.searchByCode(searchTerm) : this.pantoneService.getAllColors();
    this.availablePantoneColors.set(results.slice(0, 50));
  }

  selectPantoneColor(index: number, pantoneColor: PantoneColor) {
    const colorControl = this.colores.at(index);
    if (colorControl) {
      colorControl.patchValue({ nombre: pantoneColor.displayName });
      const currentMap = new Map(this.selectedPantoneColors());
      currentMap.set(index, pantoneColor);
      this.selectedPantoneColors.set(currentMap);
    }
  }

  getColorHex(index: number): string {
    const pantoneColor = this.selectedPantoneColors().get(index);
    if (pantoneColor) return pantoneColor.hex;
    const colorControl = this.colores.at(index);
    if (colorControl) {
      const colorName = colorControl.get('nombre')?.value;
      if (colorName) return this.pantoneService.getOrCreateColor(colorName).hex;
    }
    return '#cccccc';
  }

  getColorName(index: number): string {
    return this.colores.at(index)?.get('nombre')?.value || 'Sin nombre';
  }

  get colores(): FormArray {
    return this.codTintaForm.get('colores') as FormArray;
  }

  async searchDesignByArticle(articulo: string) {
    this.searchingDesign = true;
    this.designFound = false;
    this.designNotFound = false;
    try {
      const response = await this.http.get<any>(`${environment.apiUrl}/designs/search`, {
        params: { search: articulo }
      }).toPromise();
      if (response?.length > 0) {
        const design = response.find((d: any) => d.articleF.toUpperCase() === articulo.toUpperCase());
        if (design) { this.designFound = true; this.autoFillFromDesign(design); }
        else { this.designNotFound = true; }
      } else { this.designNotFound = true; }
    } catch { this.designNotFound = true; }
    finally { this.searchingDesign = false; }
  }

  autoFillFromDesign(design: any) {
    this.codTintaForm.patchValue({ descripcion: design.description || '', numColores: design.colors?.length || 1 });
    while (this.colores.length > 0) this.colores.removeAt(0);
    this.selectedPantoneColors.set(new Map());
    if (design.colors?.length > 0) {
      design.colors.forEach((colorName: string, index: number) => {
        this.colores.push(this.createColorFormGroup({ nombre: colorName }));
        const pantoneColor = this.pantoneService.getOrCreateColor(colorName);
        const currentMap = new Map(this.selectedPantoneColors());
        currentMap.set(index, pantoneColor);
        this.selectedPantoneColors.set(currentMap);
      });
    } else { this.updateColoresArray(); }
  }

  loadRecordData(record: any) {
    this.codTintaForm.patchValue({
      articulo: record.articulo, descripcion: record.descripcion,
      estante: record.estante || '', carpeta: record.carpeta || '',
      lineaTinta: record.lineaTinta || '', numColores: record.colores?.length || 1
    });
    this.selectedPantoneColors.set(new Map());
    if (record.colores?.length > 0) {
      record.colores.forEach((color: any, index: number) => {
        this.colores.push(this.createColorFormGroup(color));
        if (color.nombre) {
          const pantoneColor = this.pantoneService.getOrCreateColor(color.nombre);
          const currentMap = new Map(this.selectedPantoneColors());
          currentMap.set(index, pantoneColor);
          this.selectedPantoneColors.set(currentMap);
        }
      });
    } else { this.updateColoresArray(); }
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
      for (let i = currentLength; i < numColores; i++) this.colores.push(this.createColorFormGroup());
    } else if (numColores < currentLength) {
      for (let i = currentLength - 1; i >= numColores; i--) this.colores.removeAt(i);
    }
  }

  onSave() {
    if (this.codTintaForm.valid) {
      const v = this.codTintaForm.value;
      this.dialogRef.close({
        articulo: v.articulo.trim().toUpperCase(),
        descripcion: v.descripcion.trim(),
        estante: (v.estante || '').trim(),
        carpeta: (v.carpeta || '').trim(),
        lineaTinta: (v.lineaTinta || '').trim(),
        colores: v.colores
      });
    }
  }

  onCancel() { this.dialogRef.close(); }
}
