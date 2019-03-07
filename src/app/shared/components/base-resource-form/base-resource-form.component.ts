import { OnInit, AfterContentChecked, Injector } from '@angular/core';
import { FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { BaseResourceModel } from '../../models/base-resource.model';
import { BaseResourceService } from '../../services/base-resource.service';

import { switchMap } from "rxjs/operators";
import toastr from "toastr";

export abstract class BaseResourceFormComponent<T extends BaseResourceModel> implements OnInit, AfterContentChecked {

  public currentAction: string
  public resourceForm: FormGroup
  public pageTitle: string
  public serverErrorMessages: string[] = null
  public submittingForm: boolean = false

  protected route: ActivatedRoute
  protected router: Router
  protected formBuilder: FormBuilder

  constructor(
    protected injector: Injector,
    public resource: T,
    protected resourceService: BaseResourceService<T>,
    protected jsonDataToResourceFn: (jsonData) => T
  ) { 
    this.route = this.injector.get(ActivatedRoute)
    this.router = this.injector.get(Router)
    this.formBuilder = this.injector.get(FormBuilder)
  }

  ngOnInit() {
    this.setCurrentAction()
    this.buildResourceForm()
    this.loadResource()
  }

  ngAfterContentChecked(){
    this.setPageTitle()
  }

  submitForm() {
    this.submittingForm = true
    if(this.currentAction == 'new'){
      this.createResource()
    } else {
      this.updateResource()
    }
  }

  protected setCurrentAction(): void {
    if(this.route.snapshot.url[0].path == "new")
      this.currentAction = 'new'
    else
      this.currentAction = 'edit'
  }

  protected loadResource() {
    if(this.currentAction == 'edit') {
      this.route.paramMap.pipe(
        switchMap(params => this.resourceService.getById(+params.get("id")))
      )
      .subscribe(
        (resource) => {
          this.resource = resource
          this.resourceForm.patchValue(this.resource) //binds category edit
        },
        (error) => alert("Ocorreu um erro no servidor")
      )
    }
  }

  protected setPageTitle(): void {
    if(this.currentAction == 'new'){
      this.pageTitle = this.creationPageTitle()
    } else {
      this.pageTitle = this.editionPageTitle()
    }
  }

  protected creationPageTitle(): string {
    return 'novo'
  }

  protected editionPageTitle(): string {
    return 'edição'
  }

  protected createResource(): void {
    const resource: T = this.jsonDataToResourceFn(this.resourceForm.value)
    this.resourceService.create(resource)
      .subscribe(
        resource => this.actionsForSuccess(resource),
        error => this.actionsForError(error)
      )
  }

  protected updateResource(): void {
    const resource: T = this.jsonDataToResourceFn(this.resourceForm.value)
    this.resourceService.update(resource)
      .subscribe(
        resource => this.actionsForSuccess(resource),
        error => this.actionsForError(error)
      )
  }

  protected actionsForSuccess(resource: T): void {
    toastr.success('Solicitação processada com sucesso!')
    let baseComponentPath: string
    this.route.parent.url.subscribe(value => baseComponentPath = value[0].path)
    this.router.navigateByUrl(baseComponentPath, {skipLocationChange: true})
      .then(
        () => this.router.navigate([baseComponentPath, resource.id, 'edit'])
      )
  }

  protected actionsForError(error) {
    toastr.error('Ocorreu um erro ao processar a sua solicitação!')
    this.submittingForm = false
    if(error.status === 422){
      this.serverErrorMessages = JSON.parse(error._body).errors
    } else {
      this.serverErrorMessages = ["Falha na comunicação com o servidor. Por favor, tente mais tarde"]
    }
  }

  protected abstract buildResourceForm(): void 

}