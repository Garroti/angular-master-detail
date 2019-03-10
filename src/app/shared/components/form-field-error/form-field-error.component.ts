import { Component, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-form-field-error',
  template: `
    <p class="text-danger">
      {{ errorMessage }}
    </p>
  `,
  styleUrls: ['./form-field-error.component.css']
})
export class FormFieldErrorComponent implements OnInit {

  @Input('form-control') formControl: FormControl

  constructor() { }

  ngOnInit() {
  }

  public get errorMessage(): string | null {
    if(this.mustShowErrorMessagem())
      return this.getErrorMessagem()
    else
      return null
  }

  private mustShowErrorMessagem(): boolean {
    return this.formControl.invalid && this.formControl.touched
  }

  private getErrorMessagem(): string | null {
    if(this.formControl.errors.required)
      return "DADO OBRIGATORIO"
    else if(this.formControl.errors.email) 
      return "Formato de email invalido"
    else if(this.formControl.errors.minlength) {
      const requiredLength = this.formControl.errors.minlength.requiredLength
      return `DEVE TER NO MINIMO ${requiredLength} CARACTERES`
    }
    else if(this.formControl.errors.maxlength) {
      const requiredLength = this.formControl.errors.maxlength.requiredLength
      return `DEVE TER NO MÁXIMO ${requiredLength} CARACTERES`
    }
  }

}
