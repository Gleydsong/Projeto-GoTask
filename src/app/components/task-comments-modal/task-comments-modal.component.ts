import { DatePipe } from '@angular/common';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { SessionStoreService } from '../../core/auth/services/session-store.service';
import { IComment } from '../../interfaces/comment.interface';
import { ITask } from '../../interfaces/task.interface';
import { generateUniqueIdWithTimestamp } from '../../utils/generate-unique-id-with-timestamp';

@Component({
  selector: 'app-task-comments-modal',
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './task-comments-modal.component.html',
  styleUrl: './task-comments-modal.component.css',
})
export class TaskCommentsModalComponent {
  taskCommentsChanged = false;
  commentControl = new FormControl('', [Validators.required]);

  @ViewChild('commentInput') commentInputRef!: ElementRef<HTMLInputElement>;

  readonly _task: ITask = inject(DIALOG_DATA);
  readonly _dialogRef: DialogRef<boolean> = inject(DialogRef);
  private readonly _sessionStore = inject(SessionStoreService);

  onAddComment() {
    if (this.commentControl.invalid) {
      this.commentControl.markAsTouched();
      return;
    }

    const commentDescription = this.commentControl.value?.trim();
    if (!commentDescription) {
      return;
    }

    // cria um comentário e adiciona no topo da lista
    const newComment: IComment = {
      id: generateUniqueIdWithTimestamp(),
      authorId: this._sessionStore.currentUserSnapshot?.id ?? 'system',
      description: commentDescription,
      createdAt: new Date().toISOString(),
    };

    this._task.comments.unshift(newComment);

    this.commentControl.reset();

    this.taskCommentsChanged = true;

    this.commentInputRef.nativeElement.focus();
  }

  onRemoveComment(commentId: string) {
    this._task.comments = this._task.comments.filter(
      (comment) => comment.id !== commentId,
    );
    this.taskCommentsChanged = true;
  }

  onCloseModal() {
    this._dialogRef.close(this.taskCommentsChanged);
  }
}
