import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

export interface DuplicateDesignDialogData {
  originalArticleF: string;
  suggestedArticleF: string;
}

@Component({
  selector: 'app-duplicate-design-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './duplicate-design-dialog.html',
  styleUrls: ['./duplicate-design-dialog.scss']
})
export class DuplicateDesignDialogComponent {
  newArticleF: string;

  constructor(
    public dialogRef: MatDialogRef<DuplicateDesignDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DuplicateDesignDialogData
  ) {
    this.newArticleF = data.suggestedArticleF;
  }

  onConfirm(): void {
    if (this.canDuplicate()) {
      this.dialogRef.close(this.newArticleF.trim());
    }
  }

  canDuplicate(): boolean {
    return !!(this.newArticleF &&
      this.newArticleF.trim() !== '' &&
      this.newArticleF.trim() !== this.data.originalArticleF);
  }
}
